// Shows remaining free uses in header, or "Unlimited" for subscribers
// Props: runCount (int), subscribed (bool), email (string), onSignOut (fn)
export default function UsageBadge({ runCount, subscribed, email, onSignOut }) {
  const FREE_LIMIT = 2
  const remaining = Math.max(0, FREE_LIMIT - runCount)

  if (subscribed) {
    return (
      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
        <div className="badge" style={{color:'#38A169',borderColor:'#38A169',background:'rgba(56,161,105,0.08)'}}>
          ✓ Unlimited
        </div>
        <button className="rst" onClick={onSignOut} title={email}>Sign out</button>
      </div>
    )
  }

  return (
    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
      <div className="badge" style={{
        color: remaining > 0 ? '#8B7340' : '#E53E3E',
        borderColor: remaining > 0 ? '#C9AA6E' : '#E53E3E',
        background: remaining > 0 ? 'rgba(201,170,110,0.08)' : 'rgba(229,62,62,0.08)'
      }}>
        {remaining > 0 ? `${remaining} of ${FREE_LIMIT} free` : 'Limit reached'}
      </div>
      <button className="rst" onClick={onSignOut} title={email}>Sign out</button>
    </div>
  )
}
