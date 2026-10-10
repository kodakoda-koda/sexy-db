import { useEffect, useMemo, useState } from 'react'
import { AXES, axisDef, formatValue, valueOf, type AxisKey } from '../domain/axes'
import { useActresses } from '../state/ActressesProvider'
import { ActressCard } from './ActressCard'
import { ScatterPlot } from './ScatterPlot'

const HOVER_QUERY = '(hover: hover) and (pointer: fine)'
/** マウスのある端末(PC)か。PC はホバーでプレビューし、クリックで固定して複数枚並べる。スマホはタップで 1 枚 */
function useCanHover() {
  const [can, setCan] = useState(() => window.matchMedia(HOVER_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(HOVER_QUERY)
    const on = () => setCan(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return can
}

/** 画面を離れても軸と固定状態を保つ(詳細から戻ったときに続きから見られる) */
const memory: { xKey: AxisKey; yKey: AxisKey; pinned: string[] } = { xKey: 'height', yKey: 'face', pinned: [] }

export function PlotView() {
  const { actresses, normalizers } = useActresses()
  const canHover = useCanHover()
  const [xKey, setXKeyState] = useState<AxisKey>(memory.xKey)
  const [yKey, setYKeyState] = useState<AxisKey>(memory.yKey)
  const [pinned, setPinnedState] = useState<string[]>(() => memory.pinned.filter((id) => actresses.some((a) => a.id === id)))
  const [hover, setHover] = useState<string[]>([])
  const setXKey = (k: AxisKey) => { memory.xKey = k; setXKeyState(k) }
  const setYKey = (k: AxisKey) => { memory.yKey = k; setYKeyState(k) }
  const setPinned = (f: (prev: string[]) => string[]) =>
    setPinnedState((prev) => { const next = f(prev); memory.pinned = next; return next })

  const points = useMemo(
    () => actresses.map((a) => ({ id: a.id, x: valueOf(a, xKey, normalizers), y: valueOf(a, yKey, normalizers) })),
    [actresses, xKey, yKey, normalizers],
  )
  const pinnedSet = useMemo(() => new Set(pinned), [pinned])
  const hoverSet = useMemo(() => new Set(hover), [hover])

  // 表示するカード: 固定中 → ホバー中(未固定)の順
  const shown = useMemo(() => {
    const ids = [...pinned, ...hover.filter((id) => !pinnedSet.has(id))]
    return ids
      .map((id) => actresses.find((a) => a.id === id))
      .filter((a): a is NonNullable<typeof a> => !!a)
      .map((a) => ({ a, isPinned: pinnedSet.has(a.id) }))
  }, [pinned, hover, pinnedSet, actresses])

  /** ids は近い順。スマホは最も近い 1 人だけ、PC は固定の追加/解除 */
  const onTap = (ids: string[]) => {
    if (!canHover) {
      setPinned(() => ids.slice(0, 1))
      return
    }
    if (ids.length === 0) {
      setPinned(() => [])
      return
    }
    setPinned((prev) => {
      const allPinned = ids.every((id) => prev.includes(id))
      if (allPinned) return prev.filter((id) => !ids.includes(id))
      return [...prev, ...ids.filter((id) => !prev.includes(id))]
    })
  }
  const unpin = (id: string) => setPinned((prev) => prev.filter((x) => x !== id))

  const xDef = axisDef(xKey)
  const yDef = axisDef(yKey)
  const extraOf = (id: string) => {
    const p = points.find((pt) => pt.id === id)
    if (!p) return undefined
    return `${xDef.label} ${formatValue(xKey, p.x)} ・ ${yDef.label} ${formatValue(yKey, p.y)}`
  }

  return (
    <div className="plot-body">
      <div className="plot-main">
        <div className="axes">
          <label>
            <span>横軸</span>
            <select value={xKey} onChange={(e) => setXKey(e.target.value as AxisKey)}>
              {AXES.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
            </select>
          </label>
          <label>
            <span>縦軸</span>
            <select value={yKey} onChange={(e) => setYKey(e.target.value as AxisKey)}>
              {AXES.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
            </select>
          </label>
        </div>
        <div className="plot-area">
          <ScatterPlot
            points={points}
            xKey={xKey}
            yKey={yKey}
            pinnedIds={pinnedSet}
            hoverIds={hoverSet}
            onTap={onTap}
            onHover={setHover}
          />
        </div>
      </div>

      <aside className="plot-cards" aria-label="選んだ人">
        {shown.length === 0 ? (
          <div className="note">{canHover ? '点にカーソルを合わせると表示、クリックで固定' : '点をタップすると表示'}</div>
        ) : (
          <>
            {canHover && pinned.length > 1 && (
              <div className="cards-head">
                <span>固定中 {pinned.length} 人</span>
                <button className="btn text small" onClick={() => setPinned(() => [])}>すべて外す</button>
              </div>
            )}
            {shown.map(({ a, isPinned }) => (
              <div key={a.id} className={`pin${isPinned ? '' : ' preview'}`}>
                <ActressCard a={a} extra={extraOf(a.id)} />
                {isPinned && (
                  <button className="unpin" aria-label="外す" onClick={() => unpin(a.id)}>×</button>
                )}
              </div>
            ))}
          </>
        )}
      </aside>
    </div>
  )
}
