export default function UsageBadge({ runCount, subscribed, isAdmin, email, onSignOut }) {
  if (isAdmin) {
    return (
      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
        <div className="badge" style={{color:'#3182CE',borderColor:'#3182CE',background:'rgba(49,130,206,0.08)'}}>Admin</div>
        <button className="rst" onClick={onSignOut} title={email}>Sign out</button>
      </div>
    )
  }
  if (subscribed) {
    return (
      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
        <div className="badge" style={{color:'#38A169',borderColor:'#38A169',background:'rgba(56,161,105,0.08)'}}>✓ Subscribed</div>
        <button className="rst" onClick={onSignOut} title={email}>Sign out</button>
      </div>
    )
  }
  return (
    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
      <div className="badge">Free</div>
      <button className="rst" onClick={onSignOut} title={email}>Sign out</button>
    </div>
  )
}
