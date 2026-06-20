import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No auth token' })

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })

  const { leadId, mobile, propertyAddress, contactMethod, name, email, suburb, verdict } = req.body

  if (leadId) {
    const { error: dbError } = await supabase
      .from('leads')
      .update({ personal_review_requested: true })
      .eq('id', leadId)
    if (dbError) console.error('Lead update error:', dbError)
  }

  // Notify Clinton — PERSONAL REVIEW
  const subjectLocation = suburb ? ` — ${suburb}` : ''
  const subjectVerdict = verdict ? ` — ${verdict}` : ''
  const subject = `DevCheck — PERSONAL REVIEW REQUESTED${subjectLocation}${subjectVerdict}`
  const htmlContent = `
    <h2>🔔 Personal Review Requested</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td style="padding:4px 0"><strong>${name}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td style="padding:4px 0">${email}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Mobile</td><td style="padding:4px 0"><strong>${mobile || '—'}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Property address</td><td style="padding:4px 0">${propertyAddress || '—'}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Preferred contact</td><td style="padding:4px 0">${contactMethod || '—'}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Suburb</td><td style="padding:4px 0">${suburb || '—'}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Verdict</td><td style="padding:4px 0"><strong>${verdict || '—'}</strong></td></tr>
    </table>
  `

  fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'DevCheck', email: 'clinton.barker63@gmail.com' },
      to: [{ email: 'clinton.barker@expaustralia.com.au' }],
      subject,
      htmlContent
    })
  }).catch(err => console.error('Brevo notification error:', err))

  return res.status(200).json({ ok: true })
}
