import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { rawOf, type Normalizers } from '../domain/axes'
import { makeNormalizer } from '../domain/normalize'
import type { Actress, ActressInput, PhotoChange } from '../domain/types'
import type { Repository } from '../repo/Repository'

/** 削除してから実際に消すまでの猶予(この間「元に戻す」が効く) */
const UNDO_MS = 6000

type State = {
  actresses: Actress[]
  loading: boolean
  error: string | null
  normalizers: Normalizers
  refresh: () => Promise<void>
  add: (input: ActressInput, photo?: Blob | null) => Promise<Actress>
  update: (id: string, input: ActressInput, photo?: PhotoChange) => Promise<Actress>
  /** 一覧から即座に消し、猶予のあとで実際に削除する */
  remove: (id: string) => void
  /** 猶予中の削除を取り消す */
  undoRemove: () => void
  /** 猶予中(取り消せる)の削除対象 */
  pendingRemoved: Actress | null
}

const Ctx = createContext<State | null>(null)

const byCreated = (a: Actress, b: Actress) => a.createdAt.localeCompare(b.createdAt)

export function ActressesProvider({ repo, children }: { repo: Repository; children: ReactNode }) {
  const [actresses, setActresses] = useState<Actress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingRemoved, setPendingRemoved] = useState<Actress | null>(null)
  const pendingRef = useRef<{ a: Actress; timer: ReturnType<typeof setTimeout> } | null>(null)
  const listRef = useRef<Actress[]>([])
  useEffect(() => {
    listRef.current = actresses
  }, [actresses])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setActresses(await repo.list())
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [repo])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const add = useCallback(
    async (input: ActressInput, photo?: Blob | null) => {
      const a = await repo.add(input, photo)
      setActresses((prev) => [...prev, a])
      return a
    },
    [repo],
  )

  const update = useCallback(
    async (id: string, input: ActressInput, photo?: PhotoChange) => {
      const a = await repo.update(id, input, photo)
      setActresses((prev) => prev.map((x) => (x.id === id ? a : x)))
      return a
    },
    [repo],
  )

  /** 猶予中の削除を実行する */
  const commitPending = useCallback(() => {
    const p = pendingRef.current
    if (!p) return
    pendingRef.current = null
    clearTimeout(p.timer)
    setPendingRemoved(null)
    void repo.remove(p.a.id).catch((e: unknown) => {
      // 失敗したら一覧に戻してエラーを出す
      setActresses((prev) => [...prev, p.a].sort(byCreated))
      setError(e instanceof Error ? e.message : String(e))
    })
  }, [repo])

  const remove = useCallback(
    (id: string) => {
      const a = listRef.current.find((x) => x.id === id)
      if (!a) return
      commitPending()
      setActresses((prev) => prev.filter((x) => x.id !== id))
      pendingRef.current = { a, timer: setTimeout(commitPending, UNDO_MS) }
      setPendingRemoved(a)
    },
    [commitPending],
  )

  const undoRemove = useCallback(() => {
    const p = pendingRef.current
    if (!p) return
    pendingRef.current = null
    clearTimeout(p.timer)
    setPendingRemoved(null)
    setActresses((prev) => [...prev, p.a].sort(byCreated))
  }, [])

  // 画面を離れるときは猶予を待たずに削除する
  useEffect(() => {
    window.addEventListener('pagehide', commitPending)
    return () => {
      window.removeEventListener('pagehide', commitPending)
      commitPending()
    }
  }, [commitPending])

  const normalizers = useMemo<Normalizers>(
    () => ({
      flesh: makeNormalizer(actresses.map((a) => rawOf(a, 'flesh'))),
      skeleton: makeNormalizer(actresses.map((a) => rawOf(a, 'skeleton'))),
      face: makeNormalizer(actresses.map((a) => rawOf(a, 'face'))),
    }),
    [actresses],
  )

  return (
    <Ctx.Provider value={{ actresses, loading, error, normalizers, refresh, add, update, remove, undoRemove, pendingRemoved }}>
      {children}
    </Ctx.Provider>
  )
}

export function useActresses(): State {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useActresses は ActressesProvider の内側で使う')
  return ctx
}
