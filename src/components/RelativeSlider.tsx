import { useMemo, useRef, useState } from 'react'
import { Avatar } from './Avatar'

export type SliderOther = { id: string; name: string; photoUrl: string | null; pos: number }

type Props = {
  label: string
  lo: string
  hi: string
  /** 既存登録者(正規化後 0〜100 の位置) */
  others: SliderOther[]
  /** 自分の表示座標。0〜100 の外側も可 */
  value: number
  onChange: (v: number) => void
}

const MARGIN = 25

/**
 * 他の人を目盛り上に並べ、自分の位置をドラッグで決める。
 * 目盛りは 0〜100 の左右に余白を持ち、既存の両端を超えて置ける。
 */
export function RelativeSlider({ label, lo, hi, others, value, onChange }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tipId, setTipId] = useState<string | null>(null)

  // 自分が余白の外に出たら目盛りを広げる
  const [dMin, dMax] = useMemo(() => {
    const lo = Math.min(-MARGIN, value - 10)
    const hi = Math.max(100 + MARGIN, value + 10)
    return [lo, hi]
  }, [value])
  const toPct = (d: number) => ((d - dMin) / (dMax - dMin)) * 100

  const fromClientX = (clientX: number) => {
    const el = wrapRef.current
    if (!el) return value
    const r = el.getBoundingClientRect()
    const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    return dMin + t * (dMax - dMin)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    onChange(fromClientX(e.clientX))
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 0) return
    onChange(fromClientX(e.clientX))
  }

  const hasOthers = others.length > 0

  return (
    <div className="rslider">
      <div className="head">
        <span>{lo}</span>
        <b>{label}</b>
        <span>{hi}</span>
      </div>
      <div
        ref={wrapRef}
        className="track-wrap"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        <div className="track" />
        {hasOthers && (
          <div className="range" style={{ left: `${toPct(0)}%`, width: `${toPct(100) - toPct(0)}%` }} />
        )}
        {others.map((o) => (
          <div
            key={o.id}
            className="other avatar"
            style={{ left: `${toPct(o.pos)}%` }}
            onPointerDown={(e) => {
              // アバターのタップは名前表示。ドラッグ開始にはしない
              e.stopPropagation()
              setTipId((cur) => (cur === o.id ? null : o.id))
            }}
          >
            <Avatar name={o.name} photoUrl={o.photoUrl} size={20} />
            {tipId === o.id && <div className="tip">{o.name}</div>}
          </div>
        ))}
        <div className="thumb" style={{ left: `${toPct(value)}%` }} role="slider" aria-label={label} aria-valuenow={Math.round(value)} />
      </div>
      {!hasOthers && <div className="hint muted" style={{ fontSize: 12 }}>最初の 1 人なので基準はありません。だいたいの位置で構いません。</div>}
    </div>
  )
}
