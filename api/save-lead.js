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

  const { name, email, mobile, address, suburb, landSize, frontage, verdict, mode } = req.body
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' })

  // Save lead — must succeed independently of notification
  const { data: lead, error: dbError } = await supabase
    .from('leads')
    .insert({ name, email, mobile: mobile || null, address: address || null, suburb: suburb || null, land_size: landSize || null, frontage: frontage || null, verdict: verdict || null, mode: mode || null })
    .select('id')
    .single()

  if (dbError) {
    console.error('Lead save error:', dbError)
    return res.status(500).json({ error: 'Failed to save lead' })
  }

  // Notify Clinton — non-blocking
  const subjectLocation = suburb ? ` — ${suburb}` : ''
  const subjectVerdict = verdict ? ` — ${verdict}` : ''
  const subject = `DevCheck completed${subjectLocation}${subjectVerdict}`
  const htmlContent = `
    <h2>New DevCheck Assessment</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td style="padding:4px 0"><strong>${name}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td style="padding:4px 0">${email}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Mobile</td><td style="padding:4px 0">${mobile || '—'}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Address</td><td style="padding:4px 0">${address || '—'}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Land size</td><td style="padding:4px 0">${landSize ? landSize + ' m²' : '—'}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Frontage</td><td style="padding:4px 0">${frontage ? frontage + ' m' : '—'}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Mode</td><td style="padding:4px 0">${mode === 'full' ? 'Full Feasibility' : 'Tick & Flick'}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Verdict</td><td style="padding:4px 0"><strong>${verdict || '—'}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Personal review</td><td style="padding:4px 0">No</td></tr>
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

  return res.status(200).json({ leadId: lead.id })
}
