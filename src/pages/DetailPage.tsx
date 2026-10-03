import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { ageFrom } from '../domain/age'
import { RELATIVE_AXES, valueOf } from '../domain/axes'
import { cupToLetter } from '../domain/cup'
import { useActresses } from '../state/ActressesProvider'

export function DetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { actresses, normalizers, remove, loading } = useActresses()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const a = actresses.find((x) => x.id === id)

  if (loading) return <div className="content muted center">読み込み中…</div>
  if (!a) return <div className="content"><div className="empty"><h2>見つかりません</h2><Link to="/" className="btn outline">一覧へ</Link></div></div>

  const onDelete = async () => {
    if (!confirm(`${a.name} を削除しますか?`)) return
    setBusy(true)
    try {
      await remove(a.id)
      nav('/', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  return (
    <div className="content detail">
      <div className="hero">
        <Avatar name={a.name} photoUrl={a.photoUrl} size={160} />
        <h2>{a.name}</h2>
      </div>
      <div className="stats">
        <div className="stat"><div className="k">年齢</div><div className="v">{ageFrom(a.birthDate)}歳</div><div className="muted" style={{ fontSize: 12 }}>{a.birthDate}</div></div>
        <div className="stat"><div className="k">身長</div><div className="v">{a.heightCm}cm</div></div>
        <div className="stat"><div className="k">胸</div><div className="v">{cupToLetter(a.cup)}カップ</div></div>
        {RELATIVE_AXES.map((ax) => {
          const v = valueOf(a, ax.key, normalizers)
          return (
            <div className="stat" key={ax.key}>
              <div className="k">{ax.label}</div>
              <div className="v">{Math.round(v)}</div>
              <div className="bar"><i style={{ left: `${v}%` }} /></div>
              <div className="ends"><span>{ax.lo}</span><span>{ax.hi}</span></div>
            </div>
          )
        })}
      </div>
      <Link to={`/a/${a.id}/edit`} className="btn" style={{ marginBottom: 10 }}>編集</Link>
      <button className="btn danger" disabled={busy} onClick={() => void onDelete()}>削除</button>
      {error && <div className="error">{error}</div>}
    </div>
  )
}
