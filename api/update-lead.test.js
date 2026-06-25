import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the Supabase client so the handler runs in isolation (no real DB/auth).
const { getUser, eq, update, from } = vi.hoisted(() => {
  const eq = vi.fn()
  const update = vi.fn(() => ({ eq }))
  const getUser = vi.fn()
  const from = vi.fn(() => ({ update }))
  return { getUser, eq, update, from }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ auth: { getUser }, from })),
}))

import handler from './update-lead.js'

const flush = () => new Promise((resolve) => setImmediate(resolve))

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

function makeReq(body = {}) {
  return {
    method: 'POST',
    headers: { authorization: 'Bearer token' },
    body: {
      leadId: 'lead-123', name: 'Jane', email: 'jane@example.com', mobile: '0400000000',
      propertyAddress: '1 Smith St', contactMethod: 'phone', suburb: 'Salisbury', verdict: 'PASS', ...body,
    },
  }
}

function mockRes() {
  const res = {}
  res.status = vi.fn(() => res)
  res.json = vi.fn(() => res)
  res.end = vi.fn(() => res)
  return res
}

let fetchMock

beforeEach(() => {
  vi.clearAllMocks()
  process.env.BREVO_API_KEY = 'test-key'
  process.env.SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
  getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'jane@example.com' } }, error: null })
  eq.mockResolvedValue({ error: null })
  fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('update-lead notification', () => {
  it('awaits the Brevo send before responding (not fire-and-forget)', async () => {
    const d = deferred()
    fetchMock.mockReturnValueOnce(d.promise)
    const res = mockRes()

    const p = handler(makeReq(), res)
    await flush()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(res.json).not.toHaveBeenCalled()

    d.resolve({ ok: true, text: async () => '' })
    await p

    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })

  it('sends the personal-review alert to Clinton via the Brevo API', async () => {
    await handler(makeReq(), mockRes())
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.brevo.com/v3/smtp/email')
    expect(JSON.parse(opts.body).to[0].email).toBe('clinton.barker@expaustralia.com.au')
  })

  it('still returns success when the notification send rejects', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'))
    const res = mockRes()
    await handler(makeReq(), res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })

  it('still returns success when Brevo responds non-ok', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, text: async () => 'rejected' })
    const res = mockRes()
    await handler(makeReq(), res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })
})
