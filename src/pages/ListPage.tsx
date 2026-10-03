import { Link } from 'react-router-dom'
import { ActressCard } from '../components/ActressCard'
import { useActresses } from '../state/ActressesProvider'

export function ListPage() {
  const { actresses, loading, error } = useActresses()
  if (loading) return <div className="content muted center">読み込み中…</div>
  if (error) return <div className="content error">{error}</div>
  if (actresses.length === 0) {
    return (
      <div className="content">
        <div className="empty">
          <h2>まだ誰もいません</h2>
          <p>まず 1 人登録すると、一覧と散布図が使えるようになります。</p>
          <Link to="/new" className="btn">最初の 1 人を登録</Link>
        </div>
      </div>
    )
  }
  return (
    <div className="content">
      {actresses.map((a) => <ActressCard key={a.id} a={a} />)}
    </div>
  )
}
