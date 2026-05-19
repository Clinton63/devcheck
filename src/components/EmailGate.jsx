import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { isDisposableEmail } from '../lib/disposableDomains'

// EmailGate handles the full email → OTP → verified flow
// Props:
//   onVerified(session) — called when OTP verified successfully
export default function EmailGate({ onVerified }) {
  const [screen, setScreen] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendOtp(e) {
    e.preventDefault()
    setError('')
    const trimmed = email.trim().toLowerCase()
    if (!trimmed.includes('@')) { setError('Please enter a valid email address.'); return }
    if (isDisposableEmail(trimmed)) {
      setError('Temporary email addresses are not accepted. Please use your real email.')
      return
    }
    setLoading(true)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { shouldCreateUser: true }
    })
    setLoading(false)
    if (otpError) { setError(otpError.message); return }
    setScreen('otp')
  }

  async function verifyOtp(e) {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) { setError('Please enter the 6-digit code.'); return }
    setLoading(true)
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp,
      type: 'email'
    })
    setLoading(false)
    if (verifyError) { setError('Invalid or expired code. Please try again.'); return }
    onVerified(data.session)
  }

  async function resend() {
    setError('')
    setOtp('')
    await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true } })
    setError('New code sent.')
  }

  return (
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div className="eye">Clinton Barker Property · eXp Realty SA</div>
          <div className="ttl" style={{fontSize:'28px',marginBottom:'4px'}}>DevCheck</div>
          <div className="sub">SA Development Feasibility Tool</div>
        </div>

        {screen === 'email' && (
          <div className="card">
            <div className="cstep">Get started</div>
            <div className="ctitle">2 free assessments</div>
            <div className="cdesc">Enter your email to access DevCheck. No credit card required.</div>
            <form onSubmit={sendOtp}>
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
                {loading ? 'Sending…' : 'Send verification code →'}
              </button>
            </form>
            <div style={{fontSize:'11px',color:'#A0AEC0',marginTop:'12px',textAlign:'center',lineHeight:'1.5'}}>
              We'll send a 6-digit code to verify your email.<br/>
              Your details are kept private and never shared.
            </div>
          </div>
        )}

        {screen === 'otp' && (
          <div className="card">
            <div className="cstep">Verify your email</div>
            <div className="ctitle">Check your inbox</div>
            <div className="cdesc">We sent a 6-digit code to <strong>{email}</strong></div>
            <form onSubmit={verifyOtp}>
              <div className="fl" style={{marginBottom:'14px'}}>
                <label>Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g,''))}
                  autoFocus
                  style={{fontSize:'22px',letterSpacing:'6px',textAlign:'center'}}
                />
              </div>
              {error && <div className={`fh ${error==='New code sent.'?'ok':'w'}`} style={{marginBottom:'10px'}}>{error==='New code sent.'?'✓':'⚠'} {error}</div>}
              <button className="bp" type="submit" disabled={loading || otp.length !== 6} style={{width:'100%',justifyContent:'center'}}>
                {loading ? 'Verifying…' : 'Verify & start →'}
              </button>
            </form>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:'12px',fontSize:'11px'}}>
              <button onClick={() => setScreen('email')} style={{background:'none',border:'none',color:'#718096',cursor:'pointer',fontSize:'11px'}}>← Change email</button>
              <button onClick={resend} style={{background:'none',border:'none',color:'#3182CE',cursor:'pointer',fontSize:'11px'}}>Resend code</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
