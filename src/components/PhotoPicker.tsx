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

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const pick = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      const blob = await resizeImage(file)
      setPreview(URL.createObjectURL(blob))
      onChange(blob)
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
    <div className="field">
      <label>写真(任意)</label>
      <div className="row" style={{ alignItems: 'center' }}>
        <div style={{ flex: 'none' }}>
          <Avatar name={name || '?'} photoUrl={preview} size={72} />
        </div>
        <button type="button" className="btn outline small" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? '変換中…' : preview ? '変更' : '選ぶ'}
        </button>
        {preview && (
          <button type="button" className="btn ghost small" onClick={clear}>
            削除
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => void pick(e.target.files?.[0])}
      />
      <div className="hint">長辺 400px に縮小して保存します</div>
    </div>
  )
}
