import { NavLink } from 'react-router-dom'

const IconList = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="6" rx="2" /><rect x="3" y="14" width="18" height="6" rx="2" />
  </svg>
)
const IconPlot = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 20V4M4 20h16" /><circle cx="9" cy="14" r="1.6" fill="currentColor" /><circle cx="13" cy="8" r="1.6" fill="currentColor" /><circle cx="17" cy="12" r="1.6" fill="currentColor" />
  </svg>
)
const IconAdd = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
  </svg>
)

export function BottomTabs() {
  const cls = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '')
  return (
    <nav className="tabbar">
      <NavLink to="/" end className={cls}><IconList />一覧</NavLink>
      <NavLink to="/plot" className={cls}><IconPlot />散布図</NavLink>
      <NavLink to="/new" className={cls}><IconAdd />追加</NavLink>
    </nav>
  )
}
