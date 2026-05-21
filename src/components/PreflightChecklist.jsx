export default function PreflightChecklist({ onReady, onSwitchMode }) {
  return (
    <div className="card anim">
      <div className="cstep">Before you start</div>
      <div className="ctitle">What to have ready</div>
      <div className="cdesc">
        Full Feasibility works best when you have real numbers. Good estimates are fine — but if you haven't spoken to a builder yet, Tick &amp; Flick may be a better starting point.
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:'16px',marginBottom:'24px'}}>

        <div className="disc" style={{borderLeftColor:'#34A86E'}}>
          <div className="dt" style={{color:'#8ECFB0'}}>Site &amp; concept — you likely know these</div>
          <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:'6px'}}>
            {[
              'Property address, council name, and zoning code',
              'Land size (m²), frontage (m), slope, known easements or overlays',
              'Number of dwellings planned and type (townhouse, unit, house, etc.)',
              'Whether you plan to sell or keep each lot',
            ].map(item => (
              <li key={item} style={{fontSize:'12px',color:'#A0A8B0',display:'flex',gap:'8px',lineHeight:'1.5'}}>
                <span style={{color:'#34A86E',flexShrink:0}}>✓</span>{item}
              </li>
            ))}
          </ul>
        </div>

        <div className="disc" style={{borderLeftColor:'#34A86E'}}>
          <div className="dt">Cost estimates to have ready</div>
          <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:'6px'}}>
            {[
              'Purchase price + estimated stamp duty / purchase costs %',
              'Builder contract or construction figure (or $/m² rate if known)',
              'Demolition, civils/earthworks, and services estimates',
              'SA Water connection distance (m) and SAPN connection type',
              'Professional fees: design, surveyor, engineering, legal',
              'Finance: LVR %, interest rate %, expected project duration in months',
            ].map(item => (
              <li key={item} style={{fontSize:'12px',color:'#A0A8B0',display:'flex',gap:'8px',lineHeight:'1.5'}}>
                <span style={{color:'#34A86E',flexShrink:0}}>$</span>{item}
              </li>
            ))}
          </ul>
        </div>

        <div className="disc" style={{borderLeftColor:'#F59E0B'}}>
          <div className="dt" style={{color:'#F59E0B'}}>Confirm with your accountant first</div>
          <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:'6px'}}>
            {[
              'GST treatment (margin scheme, full GST, absorbed, or not yet confirmed)',
              'Your target profit on cost % (DevCheck defaults to 20%)',
            ].map(item => (
              <li key={item} style={{fontSize:'12px',color:'#A0A8B0',display:'flex',gap:'8px',lineHeight:'1.5'}}>
                <span style={{color:'#F59E0B',flexShrink:0}}>⚠</span>{item}
              </li>
            ))}
          </ul>
        </div>

      </div>

      <div className="br">
        <button className="bs" onClick={onSwitchMode}>← Not ready? Try Tick &amp; Flick</button>
        <button className="bp" onClick={onReady}>I'm ready — let's go →</button>
      </div>
    </div>
  )
}
