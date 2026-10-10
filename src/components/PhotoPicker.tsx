import { useEffect, useRef, useState } from 'react'
import { resizeImage } from '../lib/image'
import { Avatar } from './Avatar'

type Props = {
  name: string
  /** 既存の写真 URL(編集時) */
  currentUrl: string | null
  /** undefined=変更なし / null=削除 / Blob=差し替え */
  onChange: (change: Blob | null | undefined) => void
}

export function PhotoPicker({ name, currentUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const pick = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const blob = await resizeImage(file)
      setPreview(URL.createObjectURL(blob))
      onChange(blob)
    } catch (e) {
      // 写真は変更なし扱いのまま、理由だけ出す
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const clear = () => {
    setPreview(null)
    onChange(null)
  }

  return (
    <div className="photo-picker">
      <Avatar name={name || '?'} photoUrl={preview} size={64} />
      <div className="buttons">
        <button type="button" className="btn outline small" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? '変換中…' : preview ? '写真を変更' : '写真を選ぶ'}
        </button>
        {preview && (
          <button type="button" className="btn text small" onClick={clear}>写真を外す</button>
        )}
        {error && <div className="error">{error}</div>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => void pick(e.target.files?.[0])}
      />
    </div>
  )
}
