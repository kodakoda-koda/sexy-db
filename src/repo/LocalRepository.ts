import type { Actress, ActressInput, PhotoChange } from '../domain/types'
import type { Repository } from './Repository'

const KEY = 'sexy-db:local'

type Stored = Omit<Actress, 'photoUrl'> & { photoDataUrl: string | null }

/**
 * 開発用: localStorage に保存する Repository。
 * Supabase を設定する前の動作確認に使う。端末をまたいだ同期はしない。
 */
export class LocalRepository implements Repository {
  private read(): Stored[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Stored[]
    } catch {
      return []
    }
  }
  private write(rows: Stored[]) {
    localStorage.setItem(KEY, JSON.stringify(rows))
  }
  private toActress(s: Stored): Actress {
    const { photoDataUrl, ...rest } = s
    return { ...rest, photoUrl: photoDataUrl }
  }

  async list(): Promise<Actress[]> {
    return this.read().map((s) => this.toActress(s))
  }
  async get(id: string): Promise<Actress | null> {
    const s = this.read().find((x) => x.id === id)
    return s ? this.toActress(s) : null
  }
  async add(input: ActressInput, photo?: Blob | null): Promise<Actress> {
    const rows = this.read()
    const s: Stored = {
      id: crypto.randomUUID(),
      ...input,
      photoPath: null,
      photoDataUrl: photo ? await toDataUrl(photo) : null,
      createdAt: new Date().toISOString(),
    }
    rows.push(s)
    this.write(rows)
    return this.toActress(s)
  }
  async update(id: string, input: ActressInput, photo?: PhotoChange): Promise<Actress> {
    const rows = this.read()
    const i = rows.findIndex((x) => x.id === id)
    if (i === -1) throw new Error('見つかりません')
    const cur = rows[i]
    const next: Stored = {
      ...cur,
      ...input,
      photoDataUrl: photo === undefined ? cur.photoDataUrl : photo === null ? null : await toDataUrl(photo),
    }
    rows[i] = next
    this.write(rows)
    return this.toActress(next)
  }
  async remove(id: string): Promise<void> {
    this.write(this.read().filter((x) => x.id !== id))
  }
}

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })
}
