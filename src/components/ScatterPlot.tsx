import { useMemo, useRef } from 'react'
import { axisDef, type AxisKey } from '../domain/axes'
import { CUP_MAX, CUP_MIN, cupToLetter } from '../domain/cup'

export type PlotPoint = { id: string; x: number; y: number }

type Props = {
  points: PlotPoint[]
  xKey: AxisKey
  yKey: AxisKey
  selectedIds: Set<string>
  /** タップ位置の近くにある点の id 一覧を返す(空なら選択解除) */
  onTap: (ids: string[]) => void
}

const W = 340
const H = 340
const PAD = { l: 38, r: 14, t: 12, b: 34 }
const R = 5
const HIT = 16

type Scale = { min: number; max: number; ticks: number[]; fmt: (v: number) => string }

function niceStep(span: number, target = 5): number {
  const rough = span / target
  const pow = Math.pow(10, Math.floor(Math.log10(rough)))
  for (const m of [1, 2, 5, 10]) if (rough <= m * pow) return m * pow
  return 10 * pow
}

function makeScale(key: AxisKey, values: number[]): Scale {
  const def = axisDef(key)
  if (def.kind === 'relative') {
    return { min: -5, max: 105, ticks: [0, 25, 50, 75, 100], fmt: (v) => `${v}` }
  }
  if (key === 'cup') {
    const lo = values.length ? Math.max(CUP_MIN, Math.min(...values) - 1) : CUP_MIN
    const hi = values.length ? Math.min(CUP_MAX, Math.max(...values) + 1) : CUP_MAX
    const ticks: number[] = []
    for (let v = lo; v <= hi; v++) ticks.push(v)
    return { min: lo - 0.5, max: hi + 0.5, ticks, fmt: (v) => cupToLetter(v) }
  }
  const pad = key === 'height' ? 4 : 2
  let lo = values.length ? Math.min(...values) - pad : 0
  let hi = values.length ? Math.max(...values) + pad : 10
  if (hi - lo < 4) { lo -= 2; hi += 2 }
  const step = niceStep(hi - lo)
  lo = Math.floor(lo / step) * step
  hi = Math.ceil(hi / step) * step
  const ticks: number[] = []
  for (let v = lo; v <= hi + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100)
  const unit = def.unit ?? ''
  return { min: lo, max: hi, ticks, fmt: (v) => `${v}${unit}` }
}

export function ScatterPlot({ points, xKey, yKey, selectedIds, onTap }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const xs = useMemo(() => makeScale(xKey, points.map((p) => p.x)), [xKey, points])
  const ys = useMemo(() => makeScale(yKey, points.map((p) => p.y)), [yKey, points])
  const sx = (v: number) => PAD.l + ((v - xs.min) / (xs.max - xs.min)) * (W - PAD.l - PAD.r)
  const sy = (v: number) => H - PAD.b - ((v - ys.min) / (ys.max - ys.min)) * (H - PAD.t - PAD.b)

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    const hit = points
      .filter((pt) => Math.hypot(sx(pt.x) - p.x, sy(pt.y) - p.y) <= HIT)
      .map((pt) => pt.id)
    onTap(hit)
  }

  const xDef = axisDef(xKey)
  const yDef = axisDef(yKey)
  const xLabel = xDef.kind === 'relative' ? `${xDef.lo} ← ${xDef.label} → ${xDef.hi}` : xDef.label
  const yLabel = yDef.kind === 'relative' ? `${yDef.lo} ← ${yDef.label} → ${yDef.hi}` : yDef.label

  return (
    <div className="plot">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} onClick={handleClick} role="img" aria-label={`${xDef.label} と ${yDef.label} の散布図`}>
        {xs.ticks.map((t) => (
          <g key={`x${t}`}>
            <line className="grid" x1={sx(t)} x2={sx(t)} y1={PAD.t} y2={H - PAD.b} />
            <text x={sx(t)} y={H - PAD.b + 14} textAnchor="middle">{xs.fmt(t)}</text>
          </g>
        ))}
        {ys.ticks.map((t) => (
          <g key={`y${t}`}>
            <line className="grid" x1={PAD.l} x2={W - PAD.r} y1={sy(t)} y2={sy(t)} />
            <text x={PAD.l - 6} y={sy(t) + 3.5} textAnchor="end">{ys.fmt(t)}</text>
          </g>
        ))}
        <line className="axis" x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H - PAD.b} />
        <line className="axis" x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} />
        <text x={(PAD.l + W - PAD.r) / 2} y={H - 4} textAnchor="middle">{xLabel}</text>
        <text transform={`translate(10 ${(PAD.t + H - PAD.b) / 2}) rotate(-90)`} textAnchor="middle">{yLabel}</text>
        {points.map((p) => (
          <circle
            key={p.id}
            className={`pt${selectedIds.has(p.id) ? ' sel' : ''}`}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={selectedIds.has(p.id) ? R + 2 : R}
          />
        ))}
      </svg>
    </div>
  )
}
