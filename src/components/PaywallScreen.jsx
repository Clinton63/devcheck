import { useState } from 'react'
import { getAccessToken } from '../lib/supabase'

export default function PaywallScreen({ onBack }) {
  const [loading, setLoading] = useState(null)

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
        Keep DevCheck as your go-to feasibility tool. Run unlimited Tick &amp; Flick checks and full feasibilities — ideal if you're exploring SA development sites and want clear, guided analysis without needing to be a numbers expert.
      </div>

      {/* Annual plan — best value */}
      <div
        style={{background:'rgba(52,168,110,0.08)',border:'2px solid #34A86E',borderRadius:'10px',padding:'18px',marginBottom:'10px',position:'relative',cursor:'pointer'}}
        onClick={() => subscribe('annual')}
      >
        <div style={{position:'absolute',top:'-10px',right:'12px',background:'#34A86E',color:'#fff',fontSize:'9px',fontWeight:'700',letterSpacing:'.1em',padding:'3px 10px',borderRadius:'3px'}}>BEST VALUE</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'3px'}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'17px',color:'#F2F2F2',fontWeight:'700'}}>Annual</div>
          <div><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'26px',color:'#F2F2F2',fontWeight:'700'}}>$149</span><span style={{fontSize:'12px',color:'#6B7280'}}> AUD/year</span></div>
        </div>
        <div style={{fontSize:'11px',color:'#34A86E',fontWeight:'600'}}>Just $12.42/month — save $79 vs monthly</div>
        <button className="bp bp-gold" disabled={loading==='annual'} style={{width:'100%',justifyContent:'center',marginTop:'12px'}} onClick={e=>{e.stopPropagation();subscribe('annual')}}>
          {loading==='annual' ? 'Redirecting…' : 'Subscribe annually — best value →'}
        </button>
      </div>

      {/* Monthly plan */}
      <div
        style={{background:'#111111',border:'2px solid #2E2E2E',borderRadius:'10px',padding:'18px',marginBottom:'20px',cursor:'pointer',transition:'border-color .2s'}}
        onClick={() => subscribe('monthly')}
        onMouseEnter={e => e.currentTarget.style.borderColor='#34A86E'}
        onMouseLeave={e => e.currentTarget.style.borderColor='#2E2E2E'}
      >
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'3px'}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'17px',color:'#F2F2F2',fontWeight:'700'}}>Monthly</div>
          <div><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'26px',color:'#F2F2F2',fontWeight:'700'}}>$19</span><span style={{fontSize:'12px',color:'#6B7280'}}> AUD/month</span></div>
        </div>
        <div style={{fontSize:'11px',color:'#6B7280'}}>Cancel anytime</div>
        <button className="bp" disabled={loading==='monthly'} style={{width:'100%',justifyContent:'center',marginTop:'12px'}} onClick={e=>{e.stopPropagation();subscribe('monthly')}}>
          {loading==='monthly' ? 'Redirecting…' : 'Subscribe monthly →'}
        </button>
      </div>

      <div style={{fontSize:'11px',color:'#6B7280',textAlign:'center',marginBottom:'12px'}}>
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
