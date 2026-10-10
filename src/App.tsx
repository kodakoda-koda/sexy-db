import { useMemo } from 'react'
import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { APP_NAME } from './appName'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { getSupabase, isLocalMode } from './lib/supabase'
import { ActressPage } from './pages/ActressPage'
import { CollectionPage } from './pages/CollectionPage'
import { LoginPage } from './pages/LoginPage'
import { LocalRepository } from './repo/LocalRepository'
import { SupabaseRepository } from './repo/SupabaseRepository'
import { ActressesProvider, useActresses } from './state/ActressesProvider'

function Header() {
  const { signOut } = useAuth()
  const { pathname, state } = useLocation() as { pathname: string; state?: { from?: string } }
  const from = state?.from === '/plot' ? '/plot' : '/'
  // シングル(詳細・編集・新規)ではコレクションへの戻りだけを出す
  const inSingle = pathname.startsWith('/a/') || pathname === '/new'
  return (
    <header className="topbar">
      {inSingle ? (
        <Link to={from} className="back">‹ {from === '/plot' ? '散布図' : '一覧'}</Link>
      ) : (
        <h1>
          {APP_NAME}
          {isLocalMode && <span className="muted tag">local</span>}
        </h1>
      )}
      {!inSingle && (
        <button className="btn text" onClick={() => void signOut()}>ログアウト</button>
      )}
    </header>
  )
}

/** 削除の取り消しトースト */
function UndoToast() {
  const { pendingRemoved, undoRemove } = useActresses()
  if (!pendingRemoved) return null
  return (
    <div className="toast" role="status">
      <span>{pendingRemoved.name} を削除しました</span>
      <button className="btn text strong" onClick={undoRemove}>元に戻す</button>
    </div>
  )
}

function Shell() {
  const { user, loading } = useAuth()
  const repo = useMemo(
    () => (user ? (isLocalMode ? new LocalRepository() : new SupabaseRepository(getSupabase(), user.id)) : null),
    [user],
  )

  if (loading) return <div className="content muted center">読み込み中…</div>
  if (!user || !repo) return <LoginPage />

  return (
    <ActressesProvider repo={repo}>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<CollectionPage view="list" />} />
          <Route path="/plot" element={<CollectionPage view="plot" />} />
          <Route path="/new" element={<ActressPage />} />
          <Route path="/a/:id" element={<ActressPage />} />
          <Route path="/a/:id/edit" element={<ActressPage startEditing />} />
          <Route path="*" element={<CollectionPage view="list" />} />
        </Routes>
        <UndoToast />
      </div>
    </ActressesProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </AuthProvider>
  )
}
