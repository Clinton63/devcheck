import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No auth token' })

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })

  const { address, htmlContent } = req.body
  if (!htmlContent) return res.status(400).json({ error: 'No content' })

  const subject = address
    ? `Your DevCheck Feasibility Report — ${address}`
    : 'Your DevCheck Feasibility Report'

  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'DevCheck', email: 'clinton.barker63@gmail.com' },
      to: [{ email: user.email }],
      subject,
      htmlContent
    })
  })

  if (!r.ok) {
    const err = await r.text()
    console.error('Brevo error:', err)
    return res.status(500).json({ error: 'Email failed' })
  }

  return res.status(200).json({ ok: true })
}
