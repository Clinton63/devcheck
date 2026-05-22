import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { isDisposableEmail } from '../lib/disposableDomains'

export default function EmailGate({ onVerified }) {
  const [screen, setScreen] = useState('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendLink(e) {
    e.preventDefault()
    setError('')
    const trimmed = email.trim().toLowerCase()
    if (!trimmed.includes('@')) { setError('Please enter a valid email address.'); return }
    if (isDisposableEmail(trimmed)) {
      setError('Temporary email addresses are not accepted. Please use your real email.')
      return
    }
    setLoading(true)
    const { error: linkError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin
      }
    })
    setLoading(false)
    if (linkError) { setError(linkError.message); return }
    setScreen('sent')
  }

  return (
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div className="ttl" style={{fontSize:'28px',marginBottom:'4px'}}>DevCheck</div>
          <div className="sub">South Australia · Development Feasibility</div>
          <div style={{display:'inline-block',marginTop:'8px',background:'rgba(52,168,110,0.10)',border:'1px solid #34A86E',borderRadius:'4px',padding:'3px 10px',fontSize:'10px',color:'#8ECFB0',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.1em',textTransform:'uppercase'}}>
            South Australia only
          </div>
        </div>

        {screen === 'email' && (
          <div className="card">
            <div className="cstep">Get started</div>
            <div className="ctitle">2 free assessments</div>
            <div className="cdesc">Enter your email to access DevCheck. No credit card required.</div>
            <form onSubmit={sendLink}>
              <div className="fl" style={{marginBottom:'14px'}}>
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              {error && <div className="fh w" style={{marginBottom:'10px'}}>⚠ {error}</div>}
              <button className="bp" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center'}}>
                {loading ? 'Sending…' : 'Send sign-in link →'}
              </button>
            </form>
            <div style={{fontSize:'11px',color:'#6B7280',marginTop:'12px',textAlign:'center',lineHeight:'1.5'}}>
              We'll email you a sign-in link. No password needed.<br/>
              Your details are kept private and never shared.
            </div>
          </div>
        )}

        {screen === 'sent' && (
          <div className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>📧</div>
            <div className="ctitle">Check your inbox</div>
            <div className="cdesc" style={{marginBottom:'20px'}}>
              We sent a sign-in link to <strong>{email}</strong>.<br/>
              Click the link in the email to access DevCheck.
            </div>
            <div style={{fontSize:'11px',color:'#6B7280',lineHeight:'1.6'}}>
              Link expires in 60 minutes. Check your spam folder if it doesn't arrive.
            </div>
            <button
              onClick={() => { setScreen('email'); setError('') }}
              style={{background:'none',border:'none',color:'#34A86E',cursor:'pointer',fontSize:'12px',marginTop:'16px'}}
            >
              ← Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
