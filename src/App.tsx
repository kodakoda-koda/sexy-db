import { useMemo } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { BottomTabs } from './components/BottomTabs'
import { getSupabase, isLocalMode } from './lib/supabase'
import { DetailPage } from './pages/DetailPage'
import { FormPage } from './pages/FormPage'
import { ListPage } from './pages/ListPage'
import { LoginPage } from './pages/LoginPage'
import { PlotPage } from './pages/PlotPage'
import { LocalRepository } from './repo/LocalRepository'
import { SupabaseRepository } from './repo/SupabaseRepository'
import { ActressesProvider } from './state/ActressesProvider'

function Shell() {
  const { user, loading, signOut } = useAuth()
  const repo = useMemo(
    () => (user ? (isLocalMode ? new LocalRepository() : new SupabaseRepository(getSupabase(), user.id)) : null),
    [user],
  )

  if (loading) return <div className="content muted center">読み込み中…</div>
  if (!user || !repo) return <LoginPage />

  return (
    <ActressesProvider repo={repo}>
      <div className="app">
        <header className="topbar">
          <h1>sexy-db{isLocalMode && <span className="muted" style={{ fontSize: 11, marginLeft: 6 }}>local</span>}</h1>
          <div className="right">
            <button className="btn ghost small" onClick={() => void signOut()}>ログアウト</button>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/plot" element={<PlotPage />} />
          <Route path="/new" element={<FormPage />} />
          <Route path="/a/:id" element={<DetailPage />} />
          <Route path="/a/:id/edit" element={<FormPage />} />
          <Route path="*" element={<ListPage />} />
        </Routes>
        <BottomTabs />
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
