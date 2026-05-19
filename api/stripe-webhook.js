import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const sig = req.headers['stripe-signature']
  const buf = await buffer(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Subscription activated (payment succeeded)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata.supabase_user_id
    const customerId = session.customer
    await supabase
      .from('users')
      .update({ subscribed: true, stripe_customer_id: customerId })
      .eq('id', userId)
  }

  // Subscription renewed or status changed
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object
    await supabase
      .from('users')
      .update({ subscribed: sub.status === 'active' })
      .eq('stripe_customer_id', sub.customer)
  }

  // Subscription cancelled / expired
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    await supabase
      .from('users')
      .update({ subscribed: false })
      .eq('stripe_customer_id', sub.customer)
  }

  return res.status(200).json({ received: true })
}
