import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { rawOf, type Normalizers } from '../domain/axes'
import { makeNormalizer } from '../domain/normalize'
import type { Actress, ActressInput, PhotoChange } from '../domain/types'
import type { Repository } from '../repo/Repository'

type State = {
  actresses: Actress[]
  loading: boolean
  error: string | null
  normalizers: Normalizers
  refresh: () => Promise<void>
  add: (input: ActressInput, photo?: Blob | null) => Promise<Actress>
  update: (id: string, input: ActressInput, photo?: PhotoChange) => Promise<Actress>
  remove: (id: string) => Promise<void>
}

const Ctx = createContext<State | null>(null)

export function ActressesProvider({ repo, children }: { repo: Repository; children: ReactNode }) {
  const [actresses, setActresses] = useState<Actress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const remove = useCallback(
    async (id: string) => {
      await repo.remove(id)
      setActresses((prev) => prev.filter((x) => x.id !== id))
    },
    [repo],
  )

  const normalizers = useMemo<Normalizers>(
    () => ({
      flesh: makeNormalizer(actresses.map((a) => rawOf(a, 'flesh'))),
      skeleton: makeNormalizer(actresses.map((a) => rawOf(a, 'skeleton'))),
      face: makeNormalizer(actresses.map((a) => rawOf(a, 'face'))),
    }),
    [actresses],
  )

  return (
    <Ctx.Provider value={{ actresses, loading, error, normalizers, refresh, add, update, remove }}>
      {children}
    </Ctx.Provider>
  )
}

export function useActresses(): State {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useActresses は ActressesProvider の内側で使う')
  return ctx
}
