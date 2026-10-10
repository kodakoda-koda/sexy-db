import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { PhotoPicker } from '../components/PhotoPicker'
import { RelativeSlider, type SliderOther } from '../components/RelativeSlider'
import { ageFrom } from '../domain/age'
import { RELATIVE_AXES, rawOf, valueOf, type RelativeAxisKey } from '../domain/axes'
import { CUP_LETTERS, cupToLetter, estimateCupFromBust } from '../domain/cup'
import { makeNormalizer } from '../domain/normalize'
import type { Actress, ActressInput, PhotoChange } from '../domain/types'
import { useActresses } from '../state/ActressesProvider'

/**
 * 女優のシングルビュー。閲覧 ⇄ 編集を同じ画面で切り替える。
 * /new は新規状態(保存すると一覧へ戻る)。
 */
export function ActressPage({ startEditing = false }: { startEditing?: boolean }) {
  const { id } = useParams()
  const nav = useNavigate()
  const { state } = useLocation() as { state?: { from?: string } }
  const { actresses, normalizers, remove, loading } = useActresses()
  const isNew = !id
  const actress = actresses.find((a) => a.id === id) ?? null
  const [editing, setEditing] = useState(isNew || startEditing)

  if (loading) return <div className="content muted center">読み込み中…</div>
  if (!isNew && !actress) {
    return (
      <div className="content empty">
        <h2>見つかりません</h2>
        <Link to="/" className="btn">一覧へ</Link>
      </div>
    )
  }

  if (editing) {
    return (
      <Editor
        actress={actress}
        onSaved={(saved) => {
          if (isNew) nav('/', { replace: true })
          else { setEditing(false); nav(`/a/${saved.id}`, { replace: true }) }
        }}
        onCancel={() => (isNew ? nav(state?.from ?? '/') : setEditing(false))}
      />
    )
  }

  const a = actress!
  const onDelete = () => {
    remove(a.id)
    nav(state?.from ?? '/', { replace: true })
  }

  return (
    <div className="content single">
      <div className="hero">
        <Avatar name={a.name} photoUrl={a.photoUrl} size={80} />
        <div>
          <h2>{a.name}</h2>
          <div className="facts">{ageFrom(a.birthDate)}歳 ・ {a.heightCm}cm ・ {cupToLetter(a.cup)}カップ</div>
        </div>
      </div>
      <dl className="axes-list">
        {RELATIVE_AXES.map((ax) => {
          const v = valueOf(a, ax.key, normalizers)
          return (
            <div className="axis" key={ax.key}>
              <dt>{ax.label}</dt>
              <dd>
                <div className="bar"><i style={{ left: `${Math.min(100, Math.max(0, v))}%` }} /></div>
                <div className="ends"><span>{ax.lo}</span><span>{ax.hi}</span></div>
              </dd>
            </div>
          )
        })}
      </dl>
      <div className="actions">
        <button className="btn outline" onClick={() => setEditing(true)}>編集</button>
        <button className="btn text danger" onClick={onDelete}>削除</button>
      </div>
    </div>
  )
}

function Editor({ actress, onSaved, onCancel }: { actress: Actress | null; onSaved: (a: Actress) => void; onCancel: () => void }) {
  const { actresses, add, update } = useActresses()
  const isNew = !actress

  const [name, setName] = useState(actress?.name ?? '')
  const [birthDate, setBirthDate] = useState(actress?.birthDate ?? '')
  const [height, setHeight] = useState(actress ? String(actress.heightCm) : '')
  const [cup, setCup] = useState<number>(actress?.cup ?? 4)
  const [bust, setBust] = useState('')
  const [photo, setPhoto] = useState<PhotoChange>(undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [today] = useState(() => new Date().toISOString().slice(0, 10))

  // 相対軸: 本人を除いた他の人で正規化する
  const others = useMemo(() => actresses.filter((a) => a.id !== actress?.id), [actresses, actress])
  const norms = useMemo(
    () => ({
      flesh: makeNormalizer(others.map((a) => rawOf(a, 'flesh'))),
      skeleton: makeNormalizer(others.map((a) => rawOf(a, 'skeleton'))),
      face: makeNormalizer(others.map((a) => rawOf(a, 'face'))),
    }),
    [others],
  )
  const [pos, setPos] = useState<Record<RelativeAxisKey, number>>(() => ({
    flesh: actress ? norms.flesh.toDisplay(actress.fleshRaw) : 50,
    skeleton: actress ? norms.skeleton.toDisplay(actress.skeletonRaw) : 50,
    face: actress ? norms.face.toDisplay(actress.faceRaw) : 50,
  }))
  const slidersOthers = useMemo(() => {
    const m: Record<RelativeAxisKey, SliderOther[]> = { flesh: [], skeleton: [], face: [] }
    for (const k of ['flesh', 'skeleton', 'face'] as const) {
      m[k] = others.map((a) => ({ id: a.id, name: a.name, photoUrl: a.photoUrl, pos: norms[k].toDisplay(rawOf(a, k)) }))
    }
    return m
  }, [others, norms])

  const heightNum = Number(height)
  const valid =
    name.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(birthDate) && Number.isInteger(heightNum) && heightNum >= 100 && heightNum <= 220
  const dup = others.some((a) => a.name.trim() === name.trim())

  const estimate = () => {
    const b = Number(bust)
    if (!Number.isFinite(b) || b <= 0 || !heightNum) return
    setCup(estimateCupFromBust(b, heightNum))
  }

  const save = async () => {
    setBusy(true)
    setError(null)
    const input: ActressInput = {
      name: name.trim(),
      birthDate,
      heightCm: heightNum,
      cup,
      fleshRaw: norms.flesh.toRaw(pos.flesh),
      skeletonRaw: norms.skeleton.toRaw(pos.skeleton),
      faceRaw: norms.face.toRaw(pos.face),
    }
    try {
      const saved = isNew ? await add(input, photo ?? null) : await update(actress.id, input, photo)
      onSaved(saved)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  return (
    <form className="content fit editor" onSubmit={(e) => { e.preventDefault(); if (valid && !busy) void save() }}>
      <div className="fill">
        <div className="group">
          <PhotoPicker name={name} currentUrl={actress?.photoUrl ?? null} onChange={setPhoto} />
          <div className="field">
            <label htmlFor="f-name">名前</label>
            <input id="f-name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="off" autoFocus={isNew} />
            {dup && <div className="note">同じ名前の人が既に登録されています(そのまま登録できます)</div>}
          </div>
          <div className="cols">
            <div className="field">
              <label htmlFor="f-birth">生年月日</label>
              <input id="f-birth" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required max={today} />
            </div>
            <div className="field">
              <label htmlFor="f-height">身長 (cm)</label>
              <input id="f-height" type="number" inputMode="numeric" min={100} max={220} value={height} onChange={(e) => setHeight(e.target.value)} required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="f-cup">カップ</label>
            <div className="cols cup">
              <select id="f-cup" value={cup} onChange={(e) => setCup(Number(e.target.value))}>
                {CUP_LETTERS.map((l, i) => <option key={l} value={i + 1}>{l}</option>)}
              </select>
              <input type="number" inputMode="numeric" placeholder="バスト cm" aria-label="バスト cm" value={bust} onChange={(e) => setBust(e.target.value)} />
              <button type="button" className="btn outline small" onClick={estimate} disabled={!heightNum || !bust}>cm から目安</button>
            </div>
          </div>
        </div>

        <div className="group sliders">
          {others.length === 0 && <div className="note">最初の 1 人なので基準はありません。だいたいの位置で構いません。</div>}
          {RELATIVE_AXES.map((ax) => (
            <RelativeSlider
              key={ax.key}
              label={ax.label}
              lo={ax.lo!}
              hi={ax.hi!}
              others={slidersOthers[ax.key]}
              value={pos[ax.key]}
              onChange={(v) => setPos((p) => ({ ...p, [ax.key]: v }))}
            />
          ))}
        </div>
      </div>

      <div className="actions row">
        <button type="button" className="btn text" disabled={busy} onClick={onCancel}>キャンセル</button>
        <button type="submit" className="btn" disabled={!valid || busy}>{busy ? '保存中…' : '保存'}</button>
      </div>
      {error && <div className="error">{error}</div>}
    </form>
  )
}
