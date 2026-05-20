import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Returns current session or null
export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// Returns access token string or null
export async function getAccessToken() {
  const session = await getSession()
  return session?.access_token ?? null
}

// Returns user record from public.users table or null
export async function getUserRecord() {
  const session = await getSession()
  if (!session) return null
  const { data } = await supabase
    .from('users')
    .select('run_count, subscribed, is_admin')
    .eq('id', session.user.id)
    .single()
  return data
}

// Sign out
export async function signOut() {
  await supabase.auth.signOut()
}
