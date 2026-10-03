import { Link } from 'react-router-dom'
import { ageFrom } from '../domain/age'
import { cupToLetter } from '../domain/cup'
import type { Actress } from '../domain/types'
import { Avatar } from './Avatar'

export function ActressCard({ a }: { a: Actress }) {
  return (
    <Link to={`/a/${a.id}`} className="card">
      <Avatar name={a.name} photoUrl={a.photoUrl} size={48} />
      <div>
        <div className="name">{a.name}</div>
        <div className="meta">
          {ageFrom(a.birthDate)}歳 ・ {a.heightCm}cm ・ {cupToLetter(a.cup)}カップ
        </div>
      </div>
    </Link>
  )
}
