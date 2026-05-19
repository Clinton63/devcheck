import { useState } from 'react'
import { getAccessToken } from '../lib/supabase'

// Shown when proxy returns 402 (usage limit reached)
// Props: onBack() — let user go back (optional)
export default function PaywallScreen({ onBack }) {
  const [loading, setLoading] = useState(null) // 'monthly' | 'annual' | null

  async function subscribe(plan) {
    setLoading(plan)
    const token = await getAccessToken()
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        plan,
        successUrl: window.location.origin + '?subscribed=true',
        cancelUrl: window.location.href,
      })
    })
    const { url, error } = await res.json()
    if (error) { setLoading(null); alert('Something went wrong. Please try again.'); return }
    window.location.href = url
  }

  return (
    <div className="card anim" style={{maxWidth:'480px',margin:'40px auto'}}>
      <div className="cstep">Free assessments used</div>
      <div className="ctitle">Unlock unlimited access</div>
      <div className="cdesc">
        Keep DevCheck as your go-to feasibility tool. Run unlimited Tick &amp; Flick checks, full feasibilities, and follow-up questions — all included.
      </div>

      {/* Monthly plan */}
      <div
        style={{background:'#F7F9FC',border:'2px solid #E2E8F0',borderRadius:'6px',padding:'18px',marginBottom:'10px',cursor:'pointer'}}
        onClick={() => subscribe('monthly')}
      >
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'3px'}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'17px',color:'#1E3A5F',fontWeight:'700'}}>Monthly</div>
          <div><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'26px',color:'#1A202C',fontWeight:'700'}}>$39</span><span style={{fontSize:'12px',color:'#718096'}}> AUD/month</span></div>
        </div>
        <div style={{fontSize:'11px',color:'#718096'}}>Cancel anytime</div>
        <button className="bp" disabled={loading==='monthly'} style={{width:'100%',justifyContent:'center',marginTop:'12px'}} onClick={e=>{e.stopPropagation();subscribe('monthly')}}>
          {loading==='monthly' ? 'Redirecting…' : 'Subscribe monthly →'}
        </button>
      </div>

      {/* Annual plan */}
      <div
        style={{background:'#FDF8EE',border:'2px solid #C9AA6E',borderRadius:'6px',padding:'18px',marginBottom:'20px',position:'relative',cursor:'pointer'}}
        onClick={() => subscribe('annual')}
      >
        <div style={{position:'absolute',top:'-10px',right:'12px',background:'#C9AA6E',color:'#fff',fontSize:'9px',fontWeight:'700',letterSpacing:'.1em',padding:'3px 10px',borderRadius:'3px'}}>BEST VALUE</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'3px'}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'17px',color:'#1E3A5F',fontWeight:'700'}}>Annual</div>
          <div><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'26px',color:'#1A202C',fontWeight:'700'}}>$390</span><span style={{fontSize:'12px',color:'#718096'}}> AUD/year</span></div>
        </div>
        <div style={{fontSize:'11px',color:'#38A169',fontWeight:'600'}}>Save $78 — equivalent to 2 months free</div>
        <button className="bp bp-gold" disabled={loading==='annual'} style={{width:'100%',justifyContent:'center',marginTop:'12px'}} onClick={e=>{e.stopPropagation();subscribe('annual')}}>
          {loading==='annual' ? 'Redirecting…' : 'Subscribe annually — best value →'}
        </button>
      </div>

      <div style={{fontSize:'11px',color:'#A0AEC0',textAlign:'center',marginBottom:'12px'}}>
        🔒 Secure payment via Stripe · Instant access · Cancel anytime
      </div>

      {onBack && (
        <div style={{textAlign:'center'}}>
          <button className="bs" onClick={onBack}>← Go back</button>
        </div>
      )}
    </div>
  )
}
