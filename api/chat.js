import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // Validate auth token
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No auth token' })

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Verify token and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })

  // Get user record
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('run_count, subscribed, is_admin')
    .eq('id', user.id)
    .single()

  if (userError || !userData) return res.status(404).json({ error: 'User record not found' })

  const { messages, system, isInitial } = req.body

  // Enforce usage limit on initial feasibility calls only — admins are exempt
  if (isInitial && !userData.subscribed && !userData.is_admin && userData.run_count >= 2) {
    return res.status(402).json({ error: 'Usage limit reached' })
  }

  // Call Claude API
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      system,
      messages,
    })
    const reply = response.content.map(b => b.text || '').join('')

    // Increment run_count for initial calls only — admins are exempt
    if (isInitial && !userData.is_admin) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ run_count: userData.run_count + 1 })
        .eq('id', user.id)
      if (updateError) {
        console.error('run_count update failed:', updateError)
        return res.status(500).json({ error: 'Usage tracking error. Please try again.' })
      }
    }

    return res.status(200).json({ reply })
  } catch (err) {
    console.error('Claude API error:', err)
    return res.status(500).json({ error: 'AI service error. Please try again.' })
  }
}
