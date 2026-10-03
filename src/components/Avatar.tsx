type Props = { name: string; photoUrl: string | null; size?: number; className?: string }

export function Avatar({ name, photoUrl, size = 44, className = '' }: Props) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) }
  return (
    <div className={`avatar ${className}`} style={style} aria-label={name}>
      {photoUrl ? <img src={photoUrl} alt={name} loading="lazy" /> : <span>{name.slice(0, 1)}</span>}
    </div>
  )
}
