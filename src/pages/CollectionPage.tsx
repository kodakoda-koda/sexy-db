import { Link, NavLink } from 'react-router-dom'
import { ActressCard } from '../components/ActressCard'
import { PlotView } from '../components/PlotView'
import { useActresses } from '../state/ActressesProvider'

/** 女優コレクション。表示形式は「一覧」と「散布図」の 2 つ */
export function CollectionPage({ view }: { view: 'list' | 'plot' }) {
  const { actresses, loading, error } = useActresses()
  if (loading) return <div className="content muted center">読み込み中…</div>
  const empty = actresses.length === 0
  if (error && empty) return <div className="content error">{error}</div>
  return (
    <div className={`content collection${view === 'plot' && !empty ? ' fit' : ''}`}>
      {error && <div className="error" style={{ marginBottom: 8 }}>{error}</div>}
      <div className="toolbar">
        <nav className="segmented" aria-label="表示形式">
          <NavLink to="/" end>一覧</NavLink>
          <NavLink to="/plot">散布図</NavLink>
        </nav>
        {!empty && (
          <Link to="/new" state={{ from: view === 'plot' ? '/plot' : '/' }} className="iconbtn" aria-label="登録" title="登録">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </Link>
        )}
      </div>

      {empty ? (
        <div className="empty">
          <h2>まだ誰もいません</h2>
          <Link to="/new" className="btn">最初の 1 人を登録</Link>
        </div>
      ) : view === 'list' ? (
        <div className="list">
          {actresses.map((a) => <ActressCard key={a.id} a={a} />)}
        </div>
      ) : (
        <PlotView />
      )}
    </div>
  )
}
