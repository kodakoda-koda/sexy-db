import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/** VITE_REPO=local のときは Supabase を使わず localStorage に保存する(開発用) */
export const isLocalMode = import.meta.env.VITE_REPO === 'local'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (!url || !anonKey) {
    throw new Error('VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を .env に設定してください')
  }
  client = createClient(url, anonKey, {
    auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true },
  })
  return client
}
