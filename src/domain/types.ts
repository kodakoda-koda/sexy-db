export type Actress = {
  id: string
  name: string
  /** YYYY-MM-DD */
  birthDate: string
  heightCm: number
  /** A=1 … L=12 */
  cup: number
  fleshRaw: number
  skeletonRaw: number
  faceRaw: number
  photoPath: string | null
  /** 表示用に解決した URL(署名付き)。無ければ null */
  photoUrl: string | null
  createdAt: string
}

export type ActressInput = {
  name: string
  birthDate: string
  heightCm: number
  cup: number
  fleshRaw: number
  skeletonRaw: number
  faceRaw: number
}

/** 写真の変更指示。undefined = 変更なし、null = 削除、Blob = 差し替え */
export type PhotoChange = Blob | null | undefined
