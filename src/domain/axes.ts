import type { Actress } from './types'
import { ageFrom } from './age'
import { cupToLetter } from './cup'
import type { Normalizer } from './normalize'

export type AxisKey = 'height' | 'age' | 'cup' | 'flesh' | 'skeleton' | 'face'
export type RelativeAxisKey = 'flesh' | 'skeleton' | 'face'

export type AxisDef = {
  key: AxisKey
  label: string
  kind: 'objective' | 'relative'
  /** 相対軸の両端ラベル */
  lo?: string
  hi?: string
  unit?: string
}

export const AXES: AxisDef[] = [
  { key: 'height', label: '身長', kind: 'objective', unit: 'cm' },
  { key: 'age', label: '年齢', kind: 'objective', unit: '歳' },
  { key: 'cup', label: '胸', kind: 'objective' },
  { key: 'flesh', label: '肉付き', kind: 'relative', lo: '細身', hi: 'むっちり' },
  { key: 'skeleton', label: '骨格', kind: 'relative', lo: '華奢', hi: 'がっしり' },
  { key: 'face', label: '顔', kind: 'relative', lo: '可愛い系', hi: '綺麗系' },
]

export const RELATIVE_AXES = AXES.filter((a) => a.kind === 'relative') as (AxisDef & {
  key: RelativeAxisKey
})[]

export function axisDef(key: AxisKey): AxisDef {
  return AXES.find((a) => a.key === key)!
}

export function rawOf(a: Actress, key: RelativeAxisKey): number {
  switch (key) {
    case 'flesh':
      return a.fleshRaw
    case 'skeleton':
      return a.skeletonRaw
    case 'face':
      return a.faceRaw
  }
}

export type Normalizers = Record<RelativeAxisKey, Normalizer>

/** 散布図・詳細で使う表示値 */
export function valueOf(a: Actress, key: AxisKey, n: Normalizers): number {
  switch (key) {
    case 'height':
      return a.heightCm
    case 'age':
      return ageFrom(a.birthDate)
    case 'cup':
      return a.cup
    default:
      return n[key].toDisplay(rawOf(a, key))
  }
}

export function formatValue(key: AxisKey, v: number): string {
  switch (key) {
    case 'height':
      return `${v}cm`
    case 'age':
      return `${v}歳`
    case 'cup':
      return `${cupToLetter(v)}カップ`
    default:
      return `${Math.round(v)}`
  }
}
