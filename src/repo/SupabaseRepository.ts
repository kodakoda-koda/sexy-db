import type { SupabaseClient } from '@supabase/supabase-js'
import type { Actress, ActressInput, PhotoChange } from '../domain/types'
import type { Repository } from './Repository'

const TABLE = 'actresses'
const BUCKET = 'photos'
const SIGNED_URL_TTL = 60 * 60

type Row = {
  id: string
  user_id: string
  name: string
  birth_date: string
  height_cm: number
  cup: number
  flesh_raw: number
  skeleton_raw: number
  face_raw: number
  photo_path: string | null
  created_at: string
}

export class SupabaseRepository implements Repository {
  private client: SupabaseClient
  private userId: string

  constructor(client: SupabaseClient, userId: string) {
    this.client = client
    this.userId = userId
  }

  async list(): Promise<Actress[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return this.withPhotoUrls(data as Row[])
  }

  async get(id: string): Promise<Actress | null> {
    const { data, error } = await this.client.from(TABLE).select('*').eq('id', id).maybeSingle()
    if (error) throw error
    if (!data) return null
    const [a] = await this.withPhotoUrls([data as Row])
    return a
  }

  async add(input: ActressInput, photo?: Blob | null): Promise<Actress> {
    const id = crypto.randomUUID()
    let photoPath: string | null = null
    if (photo) photoPath = await this.uploadPhoto(id, photo)
    const { data, error } = await this.client
      .from(TABLE)
      .insert({ id, user_id: this.userId, ...toRow(input), photo_path: photoPath })
      .select('*')
      .single()
    if (error) throw error
    const [a] = await this.withPhotoUrls([data as Row])
    return a
  }

  async update(id: string, input: ActressInput, photo?: PhotoChange): Promise<Actress> {
    const patch: Partial<Row> = { ...toRow(input) }
    if (photo === null) {
      await this.deletePhoto(id)
      patch.photo_path = null
    } else if (photo) {
      patch.photo_path = await this.uploadPhoto(id, photo)
    }
    const { data, error } = await this.client
      .from(TABLE)
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    const [a] = await this.withPhotoUrls([data as Row])
    return a
  }

  async remove(id: string): Promise<void> {
    await this.deletePhoto(id)
    const { error } = await this.client.from(TABLE).delete().eq('id', id)
    if (error) throw error
  }

  private photoPathFor(id: string) {
    return `${this.userId}/${id}.jpg`
  }

  private async uploadPhoto(id: string, blob: Blob): Promise<string> {
    const path = this.photoPathFor(id)
    const { error } = await this.client.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true })
    if (error) throw error
    return path
  }

  private async deletePhoto(id: string) {
    // 存在しなくてもエラーにしない
    await this.client.storage.from(BUCKET).remove([this.photoPathFor(id)])
  }

  private async withPhotoUrls(rows: Row[]): Promise<Actress[]> {
    const paths = rows.map((r) => r.photo_path).filter((p): p is string => !!p)
    const urlByPath = new Map<string, string>()
    if (paths.length > 0) {
      const { data, error } = await this.client.storage
        .from(BUCKET)
        .createSignedUrls(paths, SIGNED_URL_TTL)
      if (error) throw error
      for (const d of data) if (d.signedUrl && d.path) urlByPath.set(d.path, d.signedUrl)
    }
    return rows.map((r) => fromRow(r, r.photo_path ? (urlByPath.get(r.photo_path) ?? null) : null))
  }
}

function toRow(i: ActressInput) {
  return {
    name: i.name,
    birth_date: i.birthDate,
    height_cm: i.heightCm,
    cup: i.cup,
    flesh_raw: i.fleshRaw,
    skeleton_raw: i.skeletonRaw,
    face_raw: i.faceRaw,
  }
}

function fromRow(r: Row, photoUrl: string | null): Actress {
  return {
    id: r.id,
    name: r.name,
    birthDate: r.birth_date,
    heightCm: r.height_cm,
    cup: r.cup,
    fleshRaw: r.flesh_raw,
    skeletonRaw: r.skeleton_raw,
    faceRaw: r.face_raw,
    photoPath: r.photo_path,
    photoUrl,
    createdAt: r.created_at,
  }
}
