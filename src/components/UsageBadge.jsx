// Shows remaining free uses in header, or "Unlimited" for subscribers
// Props: runCount (int), subscribed (bool), email (string), onSignOut (fn)
export default function UsageBadge({ runCount, subscribed, isAdmin, email, onSignOut }) {
  const FREE_LIMIT = 2
  const remaining = Math.max(0, FREE_LIMIT - runCount)

  if (isAdmin) {
    return (
      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
        <div className="badge" style={{color:'#3182CE',borderColor:'#3182CE',background:'rgba(49,130,206,0.08)'}}>
          Admin
        </div>
        <button className="rst" onClick={onSignOut} title={email}>Sign out</button>
      </div>
    )
  }

  if (subscribed) {
    return (
      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
        <div className="badge" style={{color:'#38A169',borderColor:'#38A169',background:'rgba(56,161,105,0.08)'}}>
          ✓ Subscribed
        </div>
        <button className="rst" onClick={onSignOut} title={email}>Sign out</button>
      </div>
    )
  }

  return (
    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
      <div className="badge" style={{
        color: remaining > 0 ? '#8ECFB0' : '#EF4444',
        borderColor: remaining > 0 ? '#34A86E' : '#EF4444',
        background: remaining > 0 ? 'rgba(52,168,110,0.10)' : 'rgba(239,68,68,0.10)'
      }}>
        {remaining > 0 ? `${remaining} of ${FREE_LIMIT} free` : 'Limit reached'}
      </div>
      <button className="rst" onClick={onSignOut} title={email}>Sign out</button>
    </div>
  )
}
