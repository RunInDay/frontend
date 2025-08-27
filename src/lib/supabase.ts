import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 생성
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

