import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL invalide dans .env.local')
}

if (!supabaseKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY manquant dans .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
