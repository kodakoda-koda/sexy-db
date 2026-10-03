/**
 * 相対軸の min-max 正規化。
 * 生スコアの集合から「raw → 0〜100」の関数と、その逆関数を作る。
 * 要素が 1 つ、または全て同値のときは、その値を 50 とし、1 単位 = 1 として前後に広げる。
 */
export type Normalizer = {
  toDisplay: (raw: number) => number
  /** 表示座標(0〜100 の外側も可)→ 生スコア */
  toRaw: (display: number) => number
  min: number
  max: number
  degenerate: boolean
}

export function makeNormalizer(raws: number[]): Normalizer {
  if (raws.length === 0) {
    return { toDisplay: (raw) => raw, toRaw: (d) => d, min: 0, max: 100, degenerate: true }
  }
  const min = Math.min(...raws)
  const max = Math.max(...raws)
  if (max - min < 1e-9) {
    return {
      toDisplay: (raw) => 50 + (raw - min),
      toRaw: (d) => min + (d - 50),
      min,
      max,
      degenerate: true,
    }
  }
  const span = max - min
  return {
    toDisplay: (raw) => ((raw - min) / span) * 100,
    toRaw: (d) => min + (d / 100) * span,
    min,
    max,
    degenerate: false,
  }
}
