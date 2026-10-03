import type { Actress, ActressInput, PhotoChange } from '../domain/types'

/**
 * 保存先の抽象。UI はこのインターフェースだけを知る。
 * 将来 Supabase 以外へ差し替える場合もここだけを実装し直す。
 */
export interface Repository {
  list(): Promise<Actress[]>
  get(id: string): Promise<Actress | null>
  add(input: ActressInput, photo?: Blob | null): Promise<Actress>
  update(id: string, input: ActressInput, photo?: PhotoChange): Promise<Actress>
  remove(id: string): Promise<void>
}
