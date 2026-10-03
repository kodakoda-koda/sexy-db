export const CUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const
export const CUP_MIN = 1
export const CUP_MAX = CUP_LETTERS.length

export function clampCup(n: number): number {
  return Math.min(CUP_MAX, Math.max(CUP_MIN, Math.round(n)))
}

export function cupToLetter(n: number): string {
  return CUP_LETTERS[clampCup(n) - 1]
}

export function letterToCup(letter: string): number | null {
  const i = CUP_LETTERS.indexOf(letter.toUpperCase() as (typeof CUP_LETTERS)[number])
  return i === -1 ? null : i + 1
}

/**
 * バスト cm と身長からカップを推定する(目安)。
 * アンダーバストは身長のおよそ 43% と仮定し、JIS のカップ差(A=10cm、以降 2.5cm 刻み)で割り当てる。
 */
export function estimateCupFromBust(bustCm: number, heightCm: number): number {
  const under = heightCm * 0.43
  const diff = bustCm - under
  return clampCup(Math.round((diff - 10) / 2.5) + 1)
}
