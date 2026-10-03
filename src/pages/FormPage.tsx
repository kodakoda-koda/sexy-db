import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PhotoPicker } from '../components/PhotoPicker'
import { RelativeSlider, type SliderOther } from '../components/RelativeSlider'
import { RELATIVE_AXES, rawOf, type RelativeAxisKey } from '../domain/axes'
import { CUP_LETTERS, estimateCupFromBust, cupToLetter } from '../domain/cup'
import { makeNormalizer } from '../domain/normalize'
import type { ActressInput, PhotoChange } from '../domain/types'
import { useActresses } from '../state/ActressesProvider'

type Step = 1 | 2

export function FormPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { actresses, add, update, loading } = useActresses()
  const editing = actresses.find((a) => a.id === id) ?? null
  const isEdit = !!id

  const [step, setStep] = useState<Step>(1)
  const [name, setName] = useState(editing?.name ?? '')
  const [birthDate, setBirthDate] = useState(editing?.birthDate ?? '')
  const [height, setHeight] = useState(editing ? String(editing.heightCm) : '')
  const [cup, setCup] = useState<number>(editing?.cup ?? 4)
  const [bust, setBust] = useState('')
  const [photo, setPhoto] = useState<PhotoChange>(undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [today] = useState(() => new Date().toISOString().slice(0, 10))

  // 相対軸: 本人を除いた他の人で正規化する
  const others = useMemo(() => actresses.filter((a) => a.id !== id), [actresses, id])
  const norms = useMemo(() => {
    const o: Record<RelativeAxisKey, ReturnType<typeof makeNormalizer>> = {
      flesh: makeNormalizer(others.map((a) => rawOf(a, 'flesh'))),
      skeleton: makeNormalizer(others.map((a) => rawOf(a, 'skeleton'))),
      face: makeNormalizer(others.map((a) => rawOf(a, 'face'))),
    }
    return o
  }, [others])
  const [pos, setPos] = useState<Record<RelativeAxisKey, number>>(() => ({
    flesh: editing ? norms.flesh.toDisplay(editing.fleshRaw) : 50,
    skeleton: editing ? norms.skeleton.toDisplay(editing.skeletonRaw) : 50,
    face: editing ? norms.face.toDisplay(editing.faceRaw) : 50,
  }))
  const slidersOthers = useMemo(() => {
    const m: Record<RelativeAxisKey, SliderOther[]> = { flesh: [], skeleton: [], face: [] }
    for (const k of ['flesh', 'skeleton', 'face'] as const) {
      m[k] = others.map((a) => ({ id: a.id, name: a.name, photoUrl: a.photoUrl, pos: norms[k].toDisplay(rawOf(a, k)) }))
    }
    return m
  }, [others, norms])

  if (loading) return <div className="content muted center">読み込み中…</div>
  if (isEdit && !editing) return <div className="content"><div className="empty"><h2>見つかりません</h2><Link to="/" className="btn outline">一覧へ</Link></div></div>

  const heightNum = Number(height)
  const step1Valid =
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
      const saved = isEdit ? await update(id!, input, photo) : await add(input, photo ?? null)
      nav(`/a/${saved.id}`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  return (
    <div className="content">
      <div className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
        {isEdit ? '編集' : '追加'} ・ ステップ {step}/2 {step === 1 ? '基本情報' : '相対指定'}
      </div>

      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); if (step1Valid) setStep(2) }}>
          <PhotoPicker name={name} currentUrl={editing?.photoUrl ?? null} onChange={setPhoto} />
          <div className="field">
            <label>名前</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="off" />
            {dup && <div className="warn">同じ名前の人が既に登録されています(そのまま登録できます)</div>}
          </div>
          <div className="field">
            <label>生年月日</label>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required max={today} />
          </div>
          <div className="field">
            <label>身長 (cm)</label>
            <input type="number" inputMode="numeric" min={100} max={220} value={height} onChange={(e) => setHeight(e.target.value)} required />
          </div>
          <div className="field">
            <label>胸(カップ)</label>
            <select value={cup} onChange={(e) => setCup(Number(e.target.value))}>
              {CUP_LETTERS.map((l, i) => <option key={l} value={i + 1}>{l}</option>)}
            </select>
            <div className="row">
              <input type="number" inputMode="numeric" placeholder="バスト cm から目安を出す" value={bust} onChange={(e) => setBust(e.target.value)} />
              <button type="button" className="btn outline small" style={{ flex: 'none' }} onClick={estimate} disabled={!heightNum || !bust}>目安にする</button>
            </div>
            <div className="hint">cm からの換算は身長からアンダーを推定した目安です。現在: {cupToLetter(cup)}</div>
          </div>
          <button type="submit" className="btn" disabled={!step1Valid}>次へ</button>
        </form>
      )}

      {step === 2 && (
        <div>
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
          <div className="hint muted" style={{ fontSize: 12, marginBottom: 12 }}>
            他の人のアイコンをタップすると名前が出ます。両端より外側にも置けます。
          </div>
          <button className="btn" disabled={busy} onClick={() => void save()}>{busy ? '保存中…' : '保存'}</button>
          <button className="btn ghost" style={{ marginTop: 8, width: '100%' }} disabled={busy} onClick={() => setStep(1)}>戻る</button>
          {error && <div className="error">{error}</div>}
        </div>
      )}
    </div>
  )
}
