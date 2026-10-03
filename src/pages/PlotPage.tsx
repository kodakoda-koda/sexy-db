import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ActressCard } from '../components/ActressCard'
import { ScatterPlot } from '../components/ScatterPlot'
import { AXES, valueOf, type AxisKey } from '../domain/axes'
import { useActresses } from '../state/ActressesProvider'

export function PlotPage() {
  const { actresses, normalizers, loading } = useActresses()
  const [xKey, setXKey] = useState<AxisKey>('height')
  const [yKey, setYKey] = useState<AxisKey>('face')
  const [selected, setSelected] = useState<string[]>([])

  const points = useMemo(
    () => actresses.map((a) => ({ id: a.id, x: valueOf(a, xKey, normalizers), y: valueOf(a, yKey, normalizers) })),
    [actresses, xKey, yKey, normalizers],
  )
  const selectedSet = useMemo(() => new Set(selected), [selected])
  const selectedActresses = selected.map((id) => actresses.find((a) => a.id === id)!).filter(Boolean)

  if (loading) return <div className="content muted center">読み込み中…</div>
  if (actresses.length === 0) {
    return (
      <div className="content">
        <div className="empty">
          <h2>まだ誰もいません</h2>
          <p>1 人登録すると散布図に点が出ます。</p>
          <Link to="/new" className="btn">最初の 1 人を登録</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="content">
      <div className="row" style={{ marginBottom: 10 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>横軸</label>
          <select value={xKey} onChange={(e) => { setXKey(e.target.value as AxisKey); setSelected([]) }}>
            {AXES.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>縦軸</label>
          <select value={yKey} onChange={(e) => { setYKey(e.target.value as AxisKey); setSelected([]) }}>
            {AXES.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
        </div>
      </div>
      <ScatterPlot points={points} xKey={xKey} yKey={yKey} selectedIds={selectedSet} onTap={setSelected} />
      <div className="hint muted" style={{ fontSize: 12, marginTop: 8 }}>点をタップすると、その位置の人を表示します。</div>
      {selectedActresses.length > 0 && (
        <div className="sheet">
          <div className="title">
            <span>この位置の人({selectedActresses.length})</span>
            <button className="btn ghost small" onClick={() => setSelected([])}>閉じる</button>
          </div>
          {selectedActresses.map((a) => <ActressCard key={a.id} a={a} />)}
        </div>
      )}
    </div>
  )
}
