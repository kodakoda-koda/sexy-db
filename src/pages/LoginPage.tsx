import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'

export function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const go = async () => {
    try {
      await signInWithGoogle()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }
  return (
    <div className="content">
      <div className="empty">
        <h2>sexy-db</h2>
        <p>自分用の女優 DB。ログインして始めます。</p>
        <button className="btn" onClick={() => void go()}>Google でログイン</button>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  )
}
