import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function isValidSupabaseUrl(value: string) {
  try {
    const url = new URL(value)
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname.includes('supabase.co')
  } catch {
    return false
  }
}

const supabaseUrl = isValidSupabaseUrl(rawUrl)
  ? rawUrl
  : 'https://placeholder.supabase.co'

const supabaseKey = rawKey && rawKey.length > 10
  ? rawKey
  : 'placeholder-key'

export const supabaseConfigOk = isValidSupabaseUrl(rawUrl) && rawKey.length > 10

export const supabase = createClient(supabaseUrl, supabaseKey)
