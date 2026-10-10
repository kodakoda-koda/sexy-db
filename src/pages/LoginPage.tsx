import { useState } from 'react'
import { APP_NAME } from '../appName'
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
    <div className="content login">
      <h1>{APP_NAME}</h1>
      <button className="btn" onClick={() => void go()}>Google でログイン</button>
      {error && <div className="error">{error}</div>}
    </div>
  )
}
