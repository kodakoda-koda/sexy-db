import { Link, useLocation } from 'react-router-dom'
import { ageFrom } from '../domain/age'
import { cupToLetter } from '../domain/cup'
import type { Actress } from '../domain/types'
import { Avatar } from './Avatar'

/** 女優 1 件の要約。行全体が詳細へのリンク。extra は散布図で出す選択中 2 軸の値 */
export function ActressCard({ a, extra }: { a: Actress; extra?: string }) {
  const { pathname } = useLocation()
  return (
    <Link to={`/a/${a.id}`} state={{ from: pathname }} className="card">
      <Avatar name={a.name} photoUrl={a.photoUrl} size={44} />
      <div className="body">
        <div className="name">{a.name}</div>
        <div className="meta">{ageFrom(a.birthDate)}歳 ・ {a.heightCm}cm ・ {cupToLetter(a.cup)}カップ</div>
        {extra && <div className="meta">{extra}</div>}
      </div>
    </Link>
  )
}
