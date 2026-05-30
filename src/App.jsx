import { useState, useRef, useEffect } from 'react'
import { supabase, getAccessToken, getUserRecord, signOut } from './lib/supabase'
import { CSS, C } from './theme'
import { SYSTEM_PROMPT } from './systemPrompt'
import { runTF, fmt, buildPromptFromState } from './feasibility'
import EmailGate from './components/EmailGate'
import UsageBadge from './components/UsageBadge'
import PreflightChecklist from './components/PreflightChecklist'
import PaywallScreen from './components/PaywallScreen'
import PrivacyPolicy from './components/PrivacyPolicy'

const STPS_F = ["Mode","Preflight","Disclaimer","Site","Constraints","Concept","Exit","Costs","Result"]
const STPS_T = ["Mode","Disclaimer","Site","Constraints","T&F","Result"]

function inlineFmt(str) {
  return str
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#F2F2F2;font-weight:600">$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+?)`/g, '<code style="background:#0D0D0D;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')
}

function renderMD(text) {
  if (!text) return ''
  const lines = text.split('\n')
  let html = ''
  let tableRows = []
  let inTable = false

  const flushTable = () => {
    if (!tableRows.length) return
    html += '<div style="overflow-x:auto;margin:14px 0"><table style="width:100%;border-collapse:collapse;font-size:13px">'
    tableRows.forEach((row, i) => {
      if (row.sep) return
      const isHeader = i === 0
      const tag = isHeader ? 'th' : 'td'
      const rowBg = !isHeader && i % 2 === 0 ? 'background:#111111' : ''
      html += `<tr style="${rowBg}">`
      row.cells.forEach(cell => {
        const val = inlineFmt(cell.trim())
        const isNeg = !isHeader && /^-\$/.test(cell.trim())
        const isPos = !isHeader && /^\$[1-9]/.test(cell.trim()) && !isNeg
        const numColor = isNeg ? 'color:#EF4444' : isPos ? 'color:#34A86E' : 'color:#F2F2F2'
        const style = isHeader
          ? 'padding:8px 12px;border-bottom:2px solid #2E2E2E;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#A0A8B0;font-family:JetBrains Mono,monospace;font-weight:500'
          : `padding:8px 12px;border-bottom:1px solid #1E1E1E;text-align:left;${numColor}`
        html += `<${tag} style="${style}">${val}</${tag}>`
      })
      html += '</tr>'
    })
    html += '</table></div>'
    tableRows = []
    inTable = false
  }

  for (const line of lines) {
    if (line.startsWith('|')) {
      inTable = true
      const cells = line.split('|').slice(1, -1)
      if (cells.every(c => /^[-: ]+$/.test(c))) {
        tableRows.push({ sep: true })
      } else {
        tableRows.push({ cells })
      }
      continue
    }
    if (inTable) flushTable()

    if (line.startsWith('### ')) {
      html += `<h3 style="font-family:'Cormorant Garamond',serif;font-size:19px;color:#F2F2F2;margin:18px 0 6px;font-weight:700">${inlineFmt(line.slice(4))}</h3>`
    } else if (line.startsWith('## ')) {
      html += `<h2 style="font-family:'Cormorant Garamond',serif;font-size:22px;color:#F2F2F2;margin:22px 0 8px;padding-bottom:7px;border-bottom:1px solid #2E2E2E;font-weight:700">${inlineFmt(line.slice(3))}</h2>`
    } else if (line.startsWith('# ')) {
      html += `<h1 style="font-family:'Cormorant Garamond',serif;font-size:26px;color:#F2F2F2;margin:0 0 18px;font-weight:700">${inlineFmt(line.slice(2))}</h1>`
    } else if (/^[-*]{3,}$/.test(line.trim())) {
      html += '<hr style="border:none;border-top:1px solid #2E2E2E;margin:18px 0"/>'
    } else if (line.trim() === '') {
      html += '<div style="height:6px"></div>'
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      html += `<div style="display:flex;gap:8px;margin:3px 0;padding-left:4px"><span style="color:#34A86E;margin-top:1px;flex-shrink:0">▸</span><span style="color:#A0A8B0;line-height:1.65">${inlineFmt(line.slice(2))}</span></div>`
    } else {
      html += `<p style="margin:4px 0;line-height:1.85;color:#E0E0E0">${inlineFmt(line)}</p>`
    }
  }
  if (inTable) flushTable()
  return html
}

function renderMDLight(text) {
  if (!text) return ''
  const lines = text.split('\n')
  let html = ''
  let tableRows = []
  let inTable = false

  const ifmt = str => str
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#111;font-weight:600">$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+?)`/g, '<code style="background:#f0f0f0;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')

  const flushTable = () => {
    if (!tableRows.length) return
    html += '<div style="overflow-x:auto;margin:14px 0"><table style="width:100%;border-collapse:collapse;font-size:13px">'
    tableRows.forEach((row, i) => {
      if (row.sep) return
      const isHeader = i === 0
      const tag = isHeader ? 'th' : 'td'
      const rowBg = !isHeader && i % 2 === 0 ? 'background:#f5f5f5' : ''
      html += `<tr style="${rowBg}">`
      row.cells.forEach(cell => {
        const val = ifmt(cell.trim())
        const isNeg = !isHeader && /^-\$/.test(cell.trim())
        const isPos = !isHeader && /^\$[1-9]/.test(cell.trim()) && !isNeg
        const numColor = isNeg ? 'color:#dc2626' : isPos ? 'color:#16a34a' : 'color:#111'
        const style = isHeader
          ? 'padding:8px 12px;border-bottom:2px solid #ccc;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#666;font-family:monospace;font-weight:500'
          : `padding:8px 12px;border-bottom:1px solid #e8e8e8;text-align:left;${numColor}`
        html += `<${tag} style="${style}">${val}</${tag}>`
      })
      html += '</tr>'
    })
    html += '</table></div>'
    tableRows = []
    inTable = false
  }

  for (const line of lines) {
    if (line.startsWith('|')) {
      inTable = true
      const cells = line.split('|').slice(1, -1)
      if (cells.every(c => /^[-: ]+$/.test(c))) { tableRows.push({ sep: true }) }
      else { tableRows.push({ cells }) }
      continue
    }
    if (inTable) flushTable()
    if (line.startsWith('### ')) {
      html += `<h3 style="font-size:17px;color:#111;margin:16px 0 5px;font-weight:700">${ifmt(line.slice(4))}</h3>`
    } else if (line.startsWith('## ')) {
      html += `<h2 style="font-size:20px;color:#111;margin:20px 0 7px;padding-bottom:6px;border-bottom:1px solid #ccc;font-weight:700">${ifmt(line.slice(3))}</h2>`
    } else if (line.startsWith('# ')) {
      html += `<h1 style="font-size:24px;color:#111;margin:0 0 16px;font-weight:700">${ifmt(line.slice(2))}</h1>`
    } else if (/^[-*]{3,}$/.test(line.trim())) {
      html += '<hr style="border:none;border-top:1px solid #ccc;margin:16px 0"/>'
    } else if (line.trim() === '') {
      html += '<div style="height:6px"></div>'
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      html += `<div style="display:flex;gap:8px;margin:3px 0;padding-left:4px"><span style="color:#16a34a;flex-shrink:0">▸</span><span style="color:#333;line-height:1.65">${ifmt(line.slice(2))}</span></div>`
    } else {
      html += `<p style="margin:4px 0;line-height:1.85;color:#222">${ifmt(line)}</p>`
    }
  }
  if (inTable) flushTable()
  return html
}

export default function App() {
  // Auth state
  const [session, setSession] = useState(undefined) // undefined=loading, null=not authed
  const [userRecord, setUserRecord] = useState(null)

  // App state
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState(null)
  const [exp, setExp] = useState(null)
  const [disc, setDisc] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiOut, setAiOut] = useState("")
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [history, setHistory] = useState([])
  const [followUp, setFollowUp] = useState("")
  const [showPaywall, setShowPaywall] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [site, setSite] = useState({address:"",council:"",zoning:"",landSize:"",frontage:"",slope:"flat",easements:"none",easementNote:"",easementCost:"",overlays:"none",trees:"no",treeType:"",treesNote:""})
  const [tf, setTf] = useState({dwellings:"",estGRV:"",estTotalCost:""})
  const [concept, setConcept] = useState({dwellings:"",type:"townhouse",identical:"yes"})
  const [lots, setLots] = useState([])
  const [costs, setCosts] = useState({purchasePrice:"",purchaseCostPct:"",targetProfit:"",buildTotal:"",buildM2:"",buildRateM2:"",demolition:"",civils:"",services:"",saWaterDistance:"",sapnConnection:"",contingencyPct:"",designFees:"",surveyorFees:"",engineeringFees:"",ipAssignment:"",legalFees:"",otherFees:"",marketing:"",authorityFees:"",landscaping:"",holdingRates:"",holdingInsurance:"",holdingOther:"",agentCommission:"",conveyancingType:"pct",conveyancingPct:"",conveyancingFixed:"",sellingCostPct:"",gstTreatment:"",lvr:"",rate:"",durationMonths:"",interestMethod:"A"})
  const aiRef = useRef(null)

  const emailReport = async () => {
    setEmailSending(true)
    setEmailSent(false)
    const dateStr = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Georgia,serif;font-size:13.5px;color:#111;background:#fff;padding:32px;max-width:820px;margin:0 auto;line-height:1.6">
<div style="border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:24px">
  <div style="font-size:22px;font-weight:700;color:#111">DevCheck Feasibility Report</div>
  <div style="font-size:14px;color:#555;margin-top:4px">${site.address || 'Development Site'}</div>
  <div style="font-size:11px;color:#888;margin-top:2px">Generated ${dateStr}</div>
</div>
${renderMDLight(aiOut)}
<div style="margin-top:32px;padding-top:16px;border-top:1px solid #d0d0d0;font-size:10.5px;color:#888;line-height:1.6">
  <strong style="color:#555">Disclaimer:</strong> This report is a preliminary guide only. All figures must be independently verified with qualified professionals before any decision is made. Not financial, legal, planning or tax advice.<br/>
  <strong style="color:#555">Clinton Barker Property · eXp Realty SA</strong> · 0409 904 473 · clinton.barker@expaustralia.com.au
</div>
</body></html>`
    try {
      const token = await getAccessToken()
      const r = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ address: site.address, htmlContent })
      })
      if (r.ok) { setEmailSent(true) }
      else { alert('Failed to send — please try again.') }
    } catch { alert('Failed to send — please try again.') }
    setEmailSending(false)
  }

  const downloadPDF = () => {
    const dateStr = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>DevCheck — ${site.address || 'Feasibility Report'}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Georgia,serif;font-size:13.5px;color:#111;background:#fff;padding:32px;max-width:820px;margin:0 auto;line-height:1.6}
@media print{body{padding:0}.no-print{display:none}}
.hdr{border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:24px}
.hdr h1{font-size:22px;font-weight:700}
.hdr .addr{font-size:14px;color:#555;margin-top:4px}
.hdr .dt{font-size:11px;color:#888;margin-top:2px}
.ftr{margin-top:32px;padding-top:16px;border-top:1px solid #d0d0d0;font-size:10.5px;color:#888;line-height:1.6}
.no-print{margin-bottom:20px;display:flex;gap:10px}
.no-print button{padding:8px 18px;border-radius:5px;cursor:pointer;font-size:13px;font-family:sans-serif;border:1px solid #ccc}
.no-print button:first-child{background:#111;color:#fff;border-color:#111}
</style></head><body>
<div class="no-print">
  <button onclick="window.print()">🖨 Print / Save as PDF</button>
  <button onclick="window.close()">✕ Close</button>
</div>
<div class="hdr">
  <h1>DevCheck Feasibility Report</h1>
  <div class="addr">${site.address || 'Development Site'}</div>
  <div class="dt">Generated ${dateStr}</div>
</div>
${renderMDLight(aiOut)}
<div class="ftr">
  <strong style="color:#555">Disclaimer:</strong> This report is a preliminary guide only. All figures must be independently verified with qualified professionals before any decision is made. Not financial, legal, planning or tax advice.<br/>
  <strong style="color:#555">Clinton Barker Property · eXp Realty SA</strong> · 0409 904 473 · clinton.barker@expaustralia.com.au
</div>
</body></html>`)
    w.document.close()
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      if (data.session) loadUserRecord()
    })
    if (window.location.search.includes('subscribed=true')) {
      window.history.replaceState({}, '', window.location.pathname)
      setTimeout(() => loadUserRecord(), 2000)
    }
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null)
      if (s) loadUserRecord()
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function loadUserRecord() {
    const record = await getUserRecord()
    setUserRecord(record)
  }

  useEffect(() => {
    if (aiRef.current) aiRef.current.scrollTop = aiRef.current.scrollHeight
  }, [aiOut])

  useEffect(() => {
    const n = parseInt(concept.dwellings) || 0
    setLots(prev => Array.from({ length: n }, (_, i) => prev[i] || { strategy: "sell", salePrice: "", endValue: "" }))
  }, [concept.dwellings])

  const ul = (i, k, v) => setLots(p => p.map((l, idx) => idx === i ? { ...l, [k]: v } : l))

  const callAI = async (msg, fresh = false, isInitial = false) => {
    setLoading(true); setAiOut("")
    const token = await getAccessToken()
    const msgs = fresh ? [{ role: "user", content: msg }] : [...history, { role: "user", content: msg }]
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          messages: msgs,
          system: SYSTEM_PROMPT + `\n\nUser experience level: ${exp || "Some Experience"}`,
          isInitial,
        })
      })
      if (r.status === 402) {
        setShowPaywall(true)
        setLoading(false)
        return
      }
      if (!r.ok) { setAiOut("Connection error. Please try again."); setLoading(false); return }
      const d = await r.json()
      setAiOut(d.reply)
      setHistory([...msgs, { role: "assistant", content: d.reply }])
      await loadUserRecord()
    } catch { setAiOut("Connection error. Please try again.") }
    setLoading(false)
  }

  const steps = mode === "tickflick" ? STPS_T : STPS_F
  const pct = (step / (steps.length - 1)) * 100

  const canNext = () => {
    if (step === 0) return !!mode
    if (mode === "full") {
      if (step === 1) return true // Preflight handled by component
      if (step === 2) return disc && !!exp  // Disclaimer
      if (step === 3) return !!(site.address && site.council && site.landSize) // Site
      if (step === 4) return true // Constraints
      if (step === 5) return !!concept.dwellings // Concept
      if (step === 6) return lots.length > 0 && lots.every(l => l.strategy && (l.salePrice || l.endValue)) // Exit
      if (step === 7) return !!(costs.purchasePrice && costs.purchaseCostPct && costs.targetProfit && costs.buildTotal && costs.demolition !== "" && costs.civils !== "" && costs.services !== "" && costs.contingencyPct && costs.designFees !== "" && costs.surveyorFees !== "" && costs.engineeringFees !== "" && costs.ipAssignment !== "" && costs.legalFees !== "" && costs.otherFees !== "" && costs.marketing !== "" && costs.authorityFees !== "" && costs.landscaping !== "" && costs.holdingRates !== "" && costs.holdingInsurance !== "" && costs.holdingOther !== "" && costs.agentCommission && (costs.conveyancingType==="fixed" ? costs.conveyancingFixed !== "" : costs.conveyancingPct !== "") && costs.gstTreatment && costs.lvr && costs.rate && costs.durationMonths)
    }
    if (mode === "tickflick") {
      if (step === 1) return disc && !!exp
      if (step === 2) return !!(site.address && site.council && site.landSize)
      if (step === 3) return true
      if (step === 4) return !!tf.dwellings
    }
    return true
  }

  const next = () => {
    const ns = step + 1
    setStep(ns)
    if (mode === "full" && ns === steps.length - 1) {
      callAI(buildPromptFromState({lots, costs, concept, site, exp}), true, true)
    }
  }

  const doReset = () => {
    setStep(0); setMode(null); setExp(null); setDisc(false); setAiOut(""); setHistory([]); setFollowUp(""); setShowPaywall(false); setEmailSent(false); setEmailSending(false)
    setSite({address:"",council:"",zoning:"",landSize:"",frontage:"",slope:"flat",easements:"none",easementNote:"",easementCost:"",overlays:"none",trees:"no",treeType:"",treesNote:""})
    setTf({dwellings:"",estGRV:"",estTotalCost:""})
    setConcept({dwellings:"",type:"townhouse",identical:"yes"})
    setLots([])
    setCosts({purchasePrice:"",purchaseCostPct:"",targetProfit:"",buildTotal:"",buildM2:"",buildRateM2:"",demolition:"",civils:"",services:"",saWaterDistance:"",sapnConnection:"",contingencyPct:"",designFees:"",surveyorFees:"",engineeringFees:"",ipAssignment:"",legalFees:"",otherFees:"",marketing:"",authorityFees:"",landscaping:"",holdingRates:"",holdingInsurance:"",holdingOther:"",agentCommission:"",conveyancingType:"pct",conveyancingPct:"",conveyancingFixed:"",sellingCostPct:"",gstTreatment:"",lvr:"",rate:"",durationMonths:"",interestMethod:"A"})
  }

  const tfResult = runTF({...site, ...tf})

  // Loading — checking session
  if (session === undefined) {
    return (
      <>
        <style>{CSS}</style>
        <div className="app" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}>
          <div style={{fontSize:'13px',color:'#718096'}}>Loading…</div>
        </div>
      </>
    )
  }

  // Not authenticated
  if (!session) {
    return (
      <>
        <style>{CSS}</style>
        <div className="app">
          <EmailGate onVerified={s => { setSession(s); loadUserRecord() }} />
        </div>
      </>
    )
  }

  // Paywall
  if (showPaywall) {
    return (
      <>
        <style>{CSS}</style>
        <div className="app">
          <div className="hdr">
            <div className="hdr-inner">
              <div>
                <div className="ttl">DevCheck</div>
                <div className="sub">South Australia · Development Feasibility</div>
              </div>
            </div>
          </div>
          <PaywallScreen onBack={() => setShowPaywall(false)} />
        </div>
      </>
    )
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="hdr">
          <div className="hdr-inner">
            <div>
              <div className="ttl">DevCheck</div>
              <div className="sub">South Australia · Development Feasibility</div>
            </div>
            <div className="hdr-r">
              {exp && <div className="badge">{exp}</div>}
              {step > 0 && <button className="rst" onClick={doReset}>↺ Start over</button>}
              {userRecord && (
                <UsageBadge
                  runCount={userRecord.run_count}
                  subscribed={userRecord.subscribed}
                  isAdmin={userRecord.is_admin}
                  email={session.user.email}
                  onSignOut={() => { signOut(); setSession(null); setUserRecord(null) }}
                />
              )}
            </div>
          </div>
        </div>

        {step > 0 && (
          <div className="pw">
            <div className="pb"><div className="pf" style={{width:`${pct}%`}}/></div>
            <div className="pls">{steps.map((s,i)=><div key={s} className={`pl ${i===step?"a":i<step?"d":""}`}>{s}</div>)}</div>
          </div>
        )}

        {/* STEP 0 — Mode selection */}
        {step===0&&(
          <div className="card anim">
            <div className="cstep">Welcome</div>
            <div className="ctitle">DevCheck South Australia</div>
            <div className="cdesc">Professional step-by-step feasibility for South Australian residential development sites — from quick Tick &amp; Flick to full PASS/MARGINAL/FAIL analysis with risks and next steps.</div>
            <div style={{background:'rgba(52,168,110,0.06)',border:'1px solid #2E2E2E',borderLeft:'3px solid #34A86E',borderRadius:'8px',padding:'10px 14px',marginBottom:'4px',fontSize:'12px',color:'#8ECFB0',lineHeight:'1.5'}}>
              <strong>⚠ South Australia only.</strong> This tool uses SA Planning &amp; Design Code zones, SA Water and SAPN rules, and SA-specific cost benchmarks. It is not suitable for developments in other states.
            </div>
            <div className="mg">
              <div className={`mc ${mode==="tickflick"?"on":""}`} onClick={()=>setMode("tickflick")}>
                <div className="mi">✓</div>
                <div className="mt">Tick &amp; Flick</div>
                <div className="md">Quick site go/no-go assessment. Get a clear verdict before committing to full feasibility.</div>
                <div className="mm">⏱ 3–5 minutes</div>
              </div>
              <div className={`mc ${mode==="full"?"on":""}`} onClick={()=>setMode("full")}>
                <div className="mi">📊</div>
                <div className="mt">Full Feasibility</div>
                <div className="md">Complete development feasibility with profit, margin on cost, PASS/MARGINAL/FAIL, risks and next steps.</div>
                <div className="mm">⏱ 15–25 minutes</div>
              </div>
            </div>
            <div className="br"><button className="bp" disabled={!mode} onClick={()=>setStep(1)}>Continue →</button></div>
          </div>
        )}

        {/* STEP 1 — Preflight (Full only) */}
        {step === 1 && mode === "full" && (
          <PreflightChecklist
            onReady={() => setStep(2)}
            onSwitchMode={() => { setMode(null); setStep(0) }}
          />
        )}

        {/* STEP 1 — Disclaimer (T&F) */}
        {step === 1 && mode === "tickflick" && (
          <div className="card anim">
            <div className="cstep">Step 1 of {steps.length-1}</div>
            <div className="ctitle">Before We Begin</div>
            <div className="cdesc">Please read and acknowledge the disclaimer, then select your experience level.</div>
            <div className="disc">
              <div className="dt">Important Disclaimer</div>
              <div className="dd">This feasibility tool provides a <strong>preliminary guide only</strong>, based strictly on your inputs. All figures must be independently verified with qualified professionals — including a town planner, builder, quantity surveyor, accountant, solicitor, and financial adviser — before any decision is made.{"\n\n"}No financial, investment, legal or planning advice is being provided. Clinton Barker Property and eXp Realty accept no liability for decisions made using this tool.{"\n\n"}<strong>Important:</strong> DevCheck is calibrated for South Australian residential developments only, using the SA Planning &amp; Design Code, SA Water, and SAPN rules. It is not suitable for use in other Australian states.</div>
              <label className="dc">
                <input type="checkbox" checked={disc} onChange={e=>setDisc(e.target.checked)}/>
                <span>I understand this is a preliminary guide only and will verify all figures with qualified professionals before making decisions.</span>
              </label>
            </div>
            <div className="div"><span>Your experience level</span></div>
            <div className="info">This calibrates the level of explanation — no jargon for beginners, straight numbers for advanced users.</div>
            <div className="seg">
              {["New Developer","Some Experience","Advanced"].map(e=>(
                <button key={e} className={`sb ${exp===e?"on":""}`} onClick={()=>setExp(e)}>{e}</button>
              ))}
            </div>
            <div className="br">
              <button className="bs" onClick={()=>setStep(0)}>← Back</button>
              <button className="bp" disabled={!canNext()} onClick={next}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 2 — Disclaimer (Full Feasibility) */}
        {step === 2 && mode === "full" && (
          <div className="card anim">
            <div className="cstep">Step 2 of {steps.length-1}</div>
            <div className="ctitle">Before We Begin</div>
            <div className="cdesc">Please read and acknowledge the disclaimer, then select your experience level.</div>
            <div className="disc">
              <div className="dt">Important Disclaimer</div>
              <div className="dd">This feasibility tool provides a <strong>preliminary guide only</strong>, based strictly on your inputs. All figures must be independently verified with qualified professionals — including a town planner, builder, quantity surveyor, accountant, solicitor, and financial adviser — before any decision is made.{"\n\n"}No financial, investment, legal or planning advice is being provided. Clinton Barker Property and eXp Realty accept no liability for decisions made using this tool.{"\n\n"}<strong>Important:</strong> DevCheck is calibrated for South Australian residential developments only, using the SA Planning &amp; Design Code, SA Water, and SAPN rules. It is not suitable for use in other Australian states.</div>
              <label className="dc">
                <input type="checkbox" checked={disc} onChange={e=>setDisc(e.target.checked)}/>
                <span>I understand this is a preliminary guide only and will verify all figures with qualified professionals before making decisions.</span>
              </label>
            </div>
            <div className="div"><span>Your experience level</span></div>
            <div className="info">This calibrates the level of explanation — no jargon for beginners, straight numbers for advanced users.</div>
            <div className="seg">
              {["New Developer","Some Experience","Advanced"].map(e=>(
                <button key={e} className={`sb ${exp===e?"on":""}`} onClick={()=>setExp(e)}>{e}</button>
              ))}
            </div>
            <div className="br">
              <button className="bs" onClick={()=>setStep(1)}>← Back</button>
              <button className="bp" disabled={!canNext()} onClick={next}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 3 (Full) / STEP 2 (T&F) — Site Identification */}
        {((step === 3 && mode === "full") || (step === 2 && mode === "tickflick")) && (
          <div className="card anim">
            <div className="cstep">Step {step} of {steps.length-1}</div>
            <div className="ctitle">Site Identification</div>
            <div className="cdesc">Address, council and land size are required to proceed.</div>
            <div className="fg">
              <div className="fl">
                <label>Property Address *</label>
                <input placeholder="e.g. 42 Smith Street, Salisbury SA 5108" value={site.address} onChange={e=>setSite(p=>({...p,address:e.target.value}))}/>
              </div>
              <div className="fr">
                <div className="fl">
                  <label>Council *</label>
                  <select value={site.council} onChange={e=>setSite(p=>({...p,council:e.target.value}))}>
                    <option value="">Select council</option>
                    <option>City of Salisbury</option><option>City of Playford</option>
                    <option>City of Tea Tree Gully</option><option>City of Para Hills</option>
                    <option>City of Port Adelaide Enfield</option><option>City of Charles Sturt</option>
                    <option>City of West Torrens</option><option>Adelaide City Council</option>
                    <option>Other SA Council</option>
                  </select>
                </div>
                <div className="fl">
                  <label>Zoning (SA Planning Code)</label>
                  <select value={site.zoning} onChange={e=>setSite(p=>({...p,zoning:e.target.value}))}>
                    <option value="">Select or not sure</option>
                    <option>General Neighbourhood (GN)</option>
                    <option>Medium Density Neighbourhood (MDN)</option>
                    <option>Suburban Neighbourhood (SN)</option>
                    <option>Urban Corridor (UC)</option>
                    <option>Established Neighbourhood (EN)</option>
                    <option>Housing Diversity Neighbourhood (HDN)</option>
                    <option>Master Planned Neighbourhood (MPN)</option>
                    <option>Hills Neighbourhood (HN)</option>
                    <option>Not sure — I'll confirm</option>
                  </select>
                </div>
              </div>
              <div className="fr">
                <div className="fl">
                  <label>Land Size (m²) *</label>
                  <input type="number" placeholder="e.g. 900" value={site.landSize} onChange={e=>setSite(p=>({...p,landSize:e.target.value}))}/>
                </div>
                <div className="fl">
                  <label>Frontage (m)</label>
                  <input type="number" placeholder="e.g. 18" value={site.frontage} onChange={e=>setSite(p=>({...p,frontage:e.target.value}))}/>
                </div>
              </div>
              <div className="fl">
                <label>Slope</label>
                <div className="seg">
                  {["flat","slight","moderate","steep"].map(s=>(
                    <button key={s} className={`sb ${site.slope===s?"on":""}`} onClick={()=>setSite(p=>({...p,slope:s}))}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
                  ))}
                </div>
                {site.slope==="moderate"&&<div className="fh w">⚠ Moderate slope — allow $20k–$50k+ for retaining and engineered slab in civils.</div>}
                {site.slope==="steep"&&<div className="fh w">⚠ Steep slope — significant civil costs. Get a site cost estimate before proceeding.</div>}
              </div>
            </div>
            <div className="br">
              <button className="bs" onClick={()=>setStep(step-1)}>← Back</button>
              <button className="bp" disabled={!canNext()} onClick={next}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 4 (Full) / STEP 3 (T&F) — Constraints & Overlays */}
        {((step === 4 && mode === "full") || (step === 3 && mode === "tickflick")) && (
          <div className="card anim">
            <div className="cstep">Step {step} of {steps.length-1}</div>
            <div className="ctitle">Constraints &amp; Overlays</div>
            <div className="cdesc">Site constraints directly affect cost and feasibility. When in doubt, select the conservative option.</div>
            <div className="fg">
              <div className="fl">
                <label>Easements / Encumbrances</label>
                <div className="info"><strong>You must answer this.</strong> Do not leave on "None" unless you have confirmed this by checking the title or with a surveyor. Easements can severely restrict where you build.</div>
                <div className="seg">
                  {["none","minor","significant"].map(s=>(
                    <button key={s} className={`sb ${site.easements===s?"on":""}`} onClick={()=>setSite(p=>({...p,easements:s}))}>{s==="none"?"None — confirmed":s==="minor"?"Minor":"Significant"}</button>
                  ))}
                </div>
                {site.easements==="none"&&<div className="fh ok">✓ No easements — confirmed by you. If you haven't checked the title, do so before relying on this.</div>}
                {site.easements==="minor"&&(
                  <div className="fg" style={{marginTop:8,gap:8}}>
                    <div className="fh w">⚠ Easements present — type and position matter enormously. A drainage easement down the centre of a block can kill a development.</div>
                    <div className="fl">
                      <label>Describe the easement *</label>
                      <input placeholder="e.g. 1.5m drainage easement along rear boundary — building setback required" value={site.easementNote||""} onChange={e=>setSite(p=>({...p,easementNote:e.target.value}))}/>
                      <div className="fh">Type (drainage/sewerage/power/other), location, width. Check the title diagram or ask a surveyor.</div>
                    </div>
                    <div className="fl">
                      <label>Cost allowance for easement impact ($)</label>
                      <input type="number" placeholder="e.g. 5000 for redesign/relocation costs, or 0 if boundary only" value={site.easementCost||""} onChange={e=>setSite(p=>({...p,easementCost:e.target.value}))}/>
                      <div className="fh">If the easement restricts building placement but doesn't require works, enter $0. Do NOT leave blank — enter a figure or $0 with acknowledgement.</div>
                    </div>
                  </div>
                )}
                {site.easements==="significant"&&(
                  <div className="fg" style={{marginTop:8,gap:8}}>
                    <div className="fh w">⚠ Significant easements — get a surveyor to confirm exact impact on buildable area and yield before this feasibility means anything.</div>
                    <div className="fl">
                      <label>Describe the easements *</label>
                      <input placeholder="e.g. SA Water sewer main through centre of block — major constraint on layout" value={site.easementNote||""} onChange={e=>setSite(p=>({...p,easementNote:e.target.value}))}/>
                    </div>
                    <div className="fl">
                      <label>Cost allowance for easement impact ($)</label>
                      <input type="number" placeholder="e.g. 15000 for sewer diversion, redesign, additional survey" value={site.easementCost||""} onChange={e=>setSite(p=>({...p,easementCost:e.target.value}))}/>
                      <div className="fh w">Significant easements must have a dollar allowance entered. If unknown, get a surveyor's estimate before relying on this feasibility.</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="fl">
                <label>Significant Trees on Site?</label>
                <div className="info"><strong>You must answer this.</strong> Do not leave on "No" if you haven't checked. Trees affect demolition costs, council conditions and in some cases development approval.</div>
                <div className="seg">
                  {["no","yes","unsure"].map(s=>(
                    <button key={s} className={`sb ${site.trees===s?"on":""}`} onClick={()=>setSite(p=>({...p,trees:s}))}>{s==="no"?"No significant trees":s==="yes"?"Yes":"Unsure — need to check"}</button>
                  ))}
                </div>
                {site.trees==="no"&&<div className="fh ok">✓ No significant trees — confirmed by you.</div>}
                {site.trees==="unsure"&&<div className="fh w">⚠ You must clarify this before relying on this feasibility. Check with council or an arborist.</div>}
                {(site.trees==="yes"||site.trees==="unsure")&&(
                  <div className="fg" style={{marginTop:10,gap:10}}>
                    <div className="fl">
                      <label>Native or non-native?</label>
                      <div className="seg">
                        <button className={`sb ${site.treeType==="non-native"?"on":""}`} onClick={()=>setSite(p=>({...p,treeType:"non-native"}))}>Non-native</button>
                        <button className={`sb ${site.treeType==="native"?"on":""}`} onClick={()=>setSite(p=>({...p,treeType:"native"}))}>Native / unsure</button>
                      </div>
                      {site.treeType==="non-native"&&<div className="fh">Non-native trees are generally unregulated in SA under the Planning & Design Code. Removal usually does not require development approval — but confirm with City of Tea Tree Gully before proceeding.</div>}
                      {site.treeType==="native"&&<div className="fh w">⚠ Native or regulated trees may require council assessment and approval before removal. Allow for arborist report ($500–$2,000) and possible conditions. Confirm with council.</div>}
                    </div>
                    <div className="fl">
                      <label>Tree description and cost allowance *</label>
                      <input placeholder="e.g. 1 large non-native tree, front yard — $3,000 removal allowance included in demo" value={site.treesNote} onChange={e=>setSite(p=>({...p,treesNote:e.target.value}))}/>
                      <div className="fh w">You must enter a dollar allowance. Do not leave blank. Typical non-native tree removal: $1,500–$5,000. Native/regulated tree with arborist report: $3,000–$15,000+. This figure must be included in your demolition cost.</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="fl">
                <label>Overlays / Constraints</label>
                <select value={site.overlays} onChange={e=>setSite(p=>({...p,overlays:e.target.value}))}>
                  <option value="none">None known</option>
                  <option value="Heritage">Heritage overlay</option>
                  <option value="Flood">Flood overlay</option>
                  <option value="Bushfire">Bushfire overlay</option>
                  <option value="Stormwater/Drainage">Stormwater/Drainage overlay</option>
                  <option value="Land Division">Land Division overlay</option>
                  <option value="Character Area">Character Area</option>
                  <option value="Multiple overlays">Multiple overlays</option>
                </select>
                {site.overlays!=="none"&&<div className="fh w">⚠ {site.overlays} overlay — additional assessment, costs or design requirements likely apply.</div>}
              </div>
            </div>
            <div className="br">
              <button className="bs" onClick={()=>setStep(step-1)}>← Back</button>
              <button className="bp" onClick={next}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 4 — T&F details (T&F only) */}
        {step===4&&mode==="tickflick"&&(
          <div className="card anim">
            <div className="cstep">Step 4 of {steps.length-1}</div>
            <div className="ctitle">Tick &amp; Flick Check</div>
            <div className="cdesc">Enter a few numbers for a quick go/no-go site verdict.</div>
            <div className="fg">
              <div className="fr">
                <div className="fl">
                  <label>Proposed Dwellings *</label>
                  <input type="number" placeholder="e.g. 2" value={tf.dwellings} onChange={e=>setTf(p=>({...p,dwellings:e.target.value}))}/>
                </div>
                <div className="fl">
                  <label>Estimated GRV (total sales)</label>
                  <input type="number" placeholder="e.g. 1400000" value={tf.estGRV} onChange={e=>setTf(p=>({...p,estGRV:e.target.value}))}/>
                  <div className="fh">Sum of expected sale prices of all dwellings</div>
                </div>
              </div>
              <div className="fl">
                <label>Estimated All-In Cost (excl. finance interest)</label>
                <input type="number" placeholder="e.g. 1100000" value={tf.estTotalCost} onChange={e=>setTf(p=>({...p,estTotalCost:e.target.value}))}/>
                <div className="fh">Purchase + build + all other costs. Rough estimate is fine.</div>
              </div>
              {tf.estGRV&&tf.estTotalCost&&(
                <div className="info">
                  <strong>Preliminary margin: </strong>
                  {(((parseFloat(tf.estGRV)-parseFloat(tf.estTotalCost))/parseFloat(tf.estTotalCost))*100).toFixed(1)}% on cost
                </div>
              )}
            </div>
            <div className="br">
              <button className="bs" onClick={()=>setStep(3)}>← Back</button>
              <button className="bp" disabled={!canNext()} onClick={next}>Run Tick &amp; Flick →</button>
            </div>
          </div>
        )}

        {/* STEP 5 — Concept (Full only) */}
        {step===5&&mode==="full"&&(
          <div className="card anim">
            <div className="cstep">Step 5 of {steps.length-1}</div>
            <div className="ctitle">Development Concept</div>
            <div className="cdesc">What are you proposing to build? This drives the entire feasibility.</div>
            <div className="fg">
              <div className="fr">
                <div className="fl">
                  <label>Number of Dwellings *</label>
                  <input type="number" placeholder="e.g. 3" min="1" max="12" value={concept.dwellings} onChange={e=>setConcept(p=>({...p,dwellings:e.target.value}))}/>
                  {site.landSize&&concept.dwellings&&(
                    <div className={`fh ${parseFloat(site.landSize)/parseFloat(concept.dwellings)>=250?"ok":"w"}`}>
                      ~{Math.round(parseFloat(site.landSize)/parseFloat(concept.dwellings))}m² per dwelling
                    </div>
                  )}
                </div>
                <div className="fl">
                  <label>Dwelling Type</label>
                  <select value={concept.type} onChange={e=>setConcept(p=>({...p,type:e.target.value}))}>
                    <option value="townhouse">Single-storey townhouse</option>
                    <option value="double-storey townhouse">Double-storey townhouse</option>
                    <option value="detached dwelling">Detached dwelling</option>
                    <option value="semi-detached dwelling">Semi-detached dwelling</option>
                    <option value="unit / villa">Unit / Villa / Courtyard home</option>
                    <option value="row dwelling">Row dwelling</option>
                  </select>
                </div>
              </div>
              <div className="fl">
                <label>Are all dwellings identical?</label>
                <div className="seg">
                  <button className={`sb ${concept.identical==="yes"?"on":""}`} onClick={()=>setConcept(p=>({...p,identical:"yes"}))}>Yes — identical</button>
                  <button className={`sb ${concept.identical==="no"?"on":""}`} onClick={()=>setConcept(p=>({...p,identical:"no"}))}>No — different specs/prices</button>
                </div>
              </div>
            </div>
            <div className="br">
              <button className="bs" onClick={()=>setStep(4)}>← Back</button>
              <button className="bp" disabled={!canNext()} onClick={next}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 6 — Exit Strategy (Full only) */}
        {step===6&&mode==="full"&&(
          <div className="card anim">
            <div className="cstep">Step 6 of {steps.length-1}</div>
            <div className="ctitle">Exit Strategy</div>
            <div className="cdesc">For each lot — sell or keep? This determines GRV and your post-completion position.</div>
            {lots.map((l,i)=>(
              <div className="lot" key={i}>
                <div className="lt">Lot {i+1}</div>
                <div className="seg">
                  <button className={`sb ${l.strategy==="sell"?"on":""}`} onClick={()=>ul(i,"strategy","sell")}>SELL</button>
                  <button className={`sb ${l.strategy==="keep"?"on":""}`} onClick={()=>ul(i,"strategy","keep")}>KEEP / RETAIN</button>
                </div>
                <div style={{marginTop:9}}>
                  {l.strategy==="sell"?(
                    <div className="fl">
                      <label>Expected Sale Price (incl. GST)</label>
                      <input type="number" placeholder="e.g. 680000" value={l.salePrice} onChange={e=>ul(i,"salePrice",e.target.value)}/>
                    </div>
                  ):(
                    <div className="fl">
                      <label>Estimated End Value (for GRV)</label>
                      <input type="number" placeholder="e.g. 680000" value={l.endValue} onChange={e=>ul(i,"endValue",e.target.value)}/>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {lots.length>0&&(
              <div className="info"><strong>GRV: </strong>{fmt(lots.reduce((s,l)=>s+(parseFloat(l.strategy==="sell"?l.salePrice:l.endValue)||0),0))}</div>
            )}
            <div className="br">
              <button className="bs" onClick={()=>setStep(5)}>← Back</button>
              <button className="bp" disabled={!canNext()} onClick={next}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 7 — Costs & Finance (Full only) */}
        {step===7&&mode==="full"&&(
          <div className="card anim">
            <div className="cstep">Step 7 of {steps.length-1}</div>
            <div className="ctitle">Costs &amp; Finance</div>
            <div className="cdesc">Every field is required. Enter 0 where a cost genuinely does not apply — do not leave anything blank. The app will not assume any number for you.</div>
            <div className="fg">
              {/* ── ACQUISITION ── */}
              <div className="div"><span>Land Acquisition</span></div>
              <div className="fr">
                <div className="fl">
                  <label>Offer / Purchase Price *</label>
                  <input type="number" placeholder="e.g. 550000" value={costs.purchasePrice} onChange={e=>setCosts(p=>({...p,purchasePrice:e.target.value}))}/>
                </div>
                <div className="fl">
                  <label>Stamp Duty &amp; Purchase Costs % *</label>
                  <input type="number" placeholder="SA typical 5.5–6.5%" value={costs.purchaseCostPct} onChange={e=>setCosts(p=>({...p,purchaseCostPct:e.target.value}))}/>
                  <div className="fh">Stamp duty + conveyancing + settlement. Confirm with your conveyancer.</div>
                </div>
              </div>
              {/* ── TARGET PROFIT ── */}
              <div className="div"><span>Your Target Return</span></div>
              <div className="fl">
                <label>Minimum Required Profit on Cost % *</label>
                <input type="number" placeholder="e.g. 15, 18, 20, 25" value={costs.targetProfit} onChange={e=>setCosts(p=>({...p,targetProfit:e.target.value}))}/>
                <div className="fh">YOUR threshold — not a fixed rule. Typical developer requirement is 15–20%. PASS/MARGINAL/FAIL verdict will be judged against this number.</div>
                {costs.targetProfit&&<div className="fh ok">Target: {costs.targetProfit}% — feasibility verdict assessed against this.</div>}
              </div>
              {/* ── CONSTRUCTION ── */}
              <div className="div"><span>Construction Costs</span></div>
              <div className="info"><strong>Build</strong> = builder contract only. <strong>Civils</strong> = retaining/driveways/earthworks/stormwater if NOT in build. <strong>Services</strong> = SA Water/SAPN/NBN if NOT in build or civils. Do not double-count.</div>
              <div className="info" style={{borderLeft:`3px solid ${C.gold}`}}><strong>Per-m² Calculator</strong> — enter floor area and rate to auto-calculate build total. Or enter a fixed total directly.</div>
              <div className="fr">
                <div className="fl">
                  <label>Floor Area per Dwelling (m²)</label>
                  <input type="number" placeholder="e.g. 130" value={costs.buildM2} onChange={e=>{const m=parseFloat(e.target.value)||0;const r=parseFloat(costs.buildRateM2)||0;const d=parseFloat(concept.dwellings)||1;setCosts(p=>({...p,buildM2:e.target.value,buildTotal:m&&r?(m*r*d).toFixed(0):""}));}}/>
                  <div className="fh">Internal floor area per dwelling (excludes garage).</div>
                </div>
                <div className="fl">
                  <label>Build Rate ($/m²) incl GST</label>
                  <input type="number" placeholder="e.g. 2000" value={costs.buildRateM2} onChange={e=>{const r=parseFloat(e.target.value)||0;const m=parseFloat(costs.buildM2)||0;const d=parseFloat(concept.dwellings)||1;setCosts(p=>({...p,buildRateM2:e.target.value,buildTotal:m&&r?(m*r*d).toFixed(0):""}));}}/>
                  <div className="fh">SA single-storey townhouse 2025: $1,900–$2,400/m². Double-storey: $2,200–$2,800/m². Confirm with builder.</div>
                </div>
              </div>
              {costs.buildM2&&costs.buildRateM2&&concept.dwellings&&(
                <div className="info" style={{borderLeft:`3px solid ${C.green}`}}>
                  <strong>Calculated build total: </strong>${(parseFloat(costs.buildM2)*parseFloat(costs.buildRateM2)*parseFloat(concept.dwellings)).toLocaleString("en-AU")} ({concept.dwellings} × {costs.buildM2}m² × ${parseFloat(costs.buildRateM2).toLocaleString("en-AU")}/m²)
                </div>
              )}
              <div className="fr">
                <div className="fl">
                  <label>Build Total — All Dwellings ($) *</label>
                  <input type="number" placeholder="Auto-filled above, or enter directly" value={costs.buildTotal} onChange={e=>setCosts(p=>({...p,buildTotal:e.target.value,buildM2:"",buildRateM2:""}))}/>
                </div>
                <div className="fl">
                  <label>Demolition ($) *</label>
                  <input type="number" placeholder="Enter $ or 0 if not required" value={costs.demolition} onChange={e=>setCosts(p=>({...p,demolition:e.target.value}))}/>
                  <div className="fh">Include tree removal. Enter 0 if no demo required.</div>
                </div>
              </div>
              <div className="fr">
                <div className="fl">
                  <label>Civils / External Works ($) *</label>
                  <input type="number" placeholder="Enter $ or 0 if in build" value={costs.civils} onChange={e=>setCosts(p=>({...p,civils:e.target.value}))}/>
                </div>
                <div className="fl">
                  <label>Services — Connections Total ($) *</label>
                  <input type="number" placeholder="Enter $ or 0 if in build" value={costs.services} onChange={e=>setCosts(p=>({...p,services:e.target.value}))}/>
                  <div className="fh">SA Water + SAPN + NBN combined.</div>
                </div>
              </div>
              <div className="info" style={{borderLeft:`3px solid ${C.gold}`}}><strong>SA Water 12m Rule:</strong> Standard connection ≤12m from main. Over 12m = non-standard, individually quoted — can add $5k–$30k+. Augmentation charges apply to all new Greater Adelaide connections from 1 July 2024.</div>
              <div className="fr">
                <div className="fl">
                  <label>Distance to SA Water main (metres) *</label>
                  <input type="number" placeholder="0 if main abuts boundary" value={costs.saWaterDistance} onChange={e=>setCosts(p=>({...p,saWaterDistance:e.target.value}))}/>
                  {costs.saWaterDistance!==""&&parseFloat(costs.saWaterDistance)<=12&&<div className="fh ok">✓ Within 12m — likely standard. Confirm with SA Water Connections Estimator Map.</div>}
                  {costs.saWaterDistance!==""&&parseFloat(costs.saWaterDistance)>12&&<div className="fh w">⚠ Over 12m — NON-STANDARD. Get SA Water quote before relying on this feasibility.</div>}
                </div>
                <div className="fl">
                  <label>SAPN Power Connection *</label>
                  <div className="seg">
                    <button className={`sb ${costs.sapnConnection==="standard"?"on":""}`} onClick={()=>setCosts(p=>({...p,sapnConnection:"standard"}))}>Standard</button>
                    <button className={`sb ${costs.sapnConnection==="upgrade"?"on":""}`} onClick={()=>setCosts(p=>({...p,sapnConnection:"upgrade"}))}>Upgrade required</button>
                    <button className={`sb ${costs.sapnConnection==="unknown"?"on":""}`} onClick={()=>setCosts(p=>({...p,sapnConnection:"unknown"}))}>Not confirmed</button>
                  </div>
                  {costs.sapnConnection==="upgrade"&&<div className="fh w">⚠ Transformer upgrade costs $10k–$50k+. Get SAPN quote.</div>}
                  {costs.sapnConnection==="unknown"&&<div className="fh w">⚠ Not confirmed — be conservative in services allowance.</div>}
                </div>
              </div>
              {/* ── CONTINGENCY — CONSTRUCTION ONLY ── */}
              <div className="div"><span>Construction Contingency</span></div>
              <div className="info">Contingency applies to <strong>construction cost only</strong> (build + demolition). Not applied to civils, services, professional fees or land costs.</div>
              <div className="fl">
                <label>Construction Contingency % *</label>
                <input type="number" placeholder="Typically 10–15%" value={costs.contingencyPct} onChange={e=>setCosts(p=>({...p,contingencyPct:e.target.value}))}/>
                <div className="fh">10% minimum recommended. 15% for complex/sloped sites. Applied to build + demolition only.</div>
                {costs.contingencyPct&&costs.buildTotal&&costs.demolition!==""&&(
                  <div className="fh ok">Contingency = ${((parseFloat(costs.buildTotal||0)+parseFloat(costs.demolition||0))*parseFloat(costs.contingencyPct)/100).toLocaleString("en-AU")} ({costs.contingencyPct}% of build + demo)</div>
                )}
              </div>
              {/* ── PROFESSIONAL FEES ── */}
              <div className="div"><span>Professional Fees</span></div>
              <div className="info">Enter each category separately. If you have one combined quote, enter it in Design &amp; Authorities and enter 0 for others. Do not double-count.</div>
              <div className="fr">
                <div className="fl">
                  <label>Design &amp; Authorities ($) *</label>
                  <input type="number" placeholder="e.g. 15000" value={costs.designFees} onChange={e=>setCosts(p=>({...p,designFees:e.target.value}))}/>
                  <div className="fh">Architect/draftsperson, town planner, building certifier, energy report, DA fees.</div>
                </div>
                <div className="fl">
                  <label>Surveyor / Land Division ($) *</label>
                  <input type="number" placeholder="e.g. 25000" value={costs.surveyorFees} onChange={e=>setCosts(p=>({...p,surveyorFees:e.target.value}))}/>
                  <div className="fh">SA simple 1→2 Torrens title: typically $18k–$35k all-in.</div>
                </div>
              </div>
              <div className="fr">
                <div className="fl">
                  <label>Engineering ($) *</label>
                  <input type="number" placeholder="Enter $ or 0 if in design fees" value={costs.engineeringFees} onChange={e=>setCosts(p=>({...p,engineeringFees:e.target.value}))}/>
                  <div className="fh">Structural + civil engineer.</div>
                </div>
                <div className="fl">
                  <label>IP / Assignment / Project Management ($) *</label>
                  <input type="number" placeholder="Enter $ or 0" value={costs.ipAssignment} onChange={e=>setCosts(p=>({...p,ipAssignment:e.target.value}))}/>
                  <div className="fh">Intellectual property, project management setup, or assignment of contracts. Common on SA subdivisions — $15k–$30k typical. Enter 0 if not applicable.</div>
                </div>
              </div>
              <div className="fr">
                <div className="fl">
                  <label>Legals / Conveyancing / Contracts ($) *</label>
                  <input type="number" placeholder="e.g. 5000" value={costs.legalFees} onChange={e=>setCosts(p=>({...p,legalFees:e.target.value}))}/>
                  <div className="fh">Development legal costs, contract preparation, conveyancing during the project. Separate from settlement conveyancing on sale.</div>
                </div>
                <div className="fl">
                  <label>Other Professional Fees ($) *</label>
                  <input type="number" placeholder="Enter $ or 0" value={costs.otherFees} onChange={e=>setCosts(p=>({...p,otherFees:e.target.value}))}/>
                  <div className="fh">Quantity surveyor, other consultants not listed above. Enter 0 if none.</div>
                </div>
              </div>

              {/* ── AUTHORITIES ── */}
              <div className="div"><span>Council &amp; Authority Fees</span></div>
              <div className="fl">
                <label>Council / Authority Charges ($) *</label>
                <input type="number" placeholder="Enter $ or 0" value={costs.authorityFees} onChange={e=>setCosts(p=>({...p,authorityFees:e.target.value}))}/>
                <div className="fh">DA lodgement, infrastructure charges, SA Water/SAPN assessment fees, council conditions. Enter 0 if included in professional fees above.</div>
              </div>

              {/* ── LANDSCAPING ── */}
              <div className="div"><span>Landscaping</span></div>
              <div className="fl">
                <label>Landscaping ($) *</label>
                <input type="number" placeholder="Enter $ or 0" value={costs.landscaping} onChange={e=>setCosts(p=>({...p,landscaping:e.target.value}))}/>
                <div className="fh">Turf, garden beds, boundary planting, common area landscaping. Easy to overlook — townhouse projects typically $3,000–$8,000 per dwelling. Enter 0 only if genuinely included in build contract.</div>
              </div>

              {/* ── HOLDING COSTS — SPLIT INTO THREE LINES ── */}
              <div className="div"><span>Holding Costs — non-interest</span></div>
              <div className="info">Enter each holding cost separately. These are non-interest costs only — interest is calculated in Finance below.</div>
              <div className="fr">
                <div className="fl">
                  <label>Council Rates &amp; Water Rates ($) *</label>
                  <input type="number" placeholder="Enter $ or 0" value={costs.holdingRates} onChange={e=>setCosts(p=>({...p,holdingRates:e.target.value}))}/>
                  <div className="fh">Council rates + SA Water rates during project. Estimate based on project duration.</div>
                </div>
                <div className="fl">
                  <label>Public Liability (PL) Insurance ($) *</label>
                  <input type="number" placeholder="Enter $ or 0" value={costs.holdingInsurance} onChange={e=>setCosts(p=>({...p,holdingInsurance:e.target.value}))}/>
                  <div className="fh">Project PL insurance for the development period. Typically $1,500–$4,000. Do not forget this — it is a separate cost from your standard home/investment insurance.</div>
                </div>
              </div>
              <div className="fl">
                <label>Site Security / Other Holding Costs ($) *</label>
                <input type="number" placeholder="Enter $ or 0" value={costs.holdingOther} onChange={e=>setCosts(p=>({...p,holdingOther:e.target.value}))}/>
                <div className="fh">Fencing, site security, any other non-interest holding costs not listed above. Enter 0 if none.</div>
              </div>
              {(costs.holdingRates||costs.holdingInsurance||costs.holdingOther)&&(
                <div className="info" style={{borderLeft:`3px solid ${C.green}`}}>
                  <strong>Total holding costs: </strong>${(parseFloat(costs.holdingRates||0)+parseFloat(costs.holdingInsurance||0)+parseFloat(costs.holdingOther||0)).toLocaleString("en-AU")}
                </div>
              )}
              {/* ── SELLING COSTS ── */}
              <div className="div"><span>Selling Costs</span></div>
              <div className="fr">
                <div className="fl">
                  <label>Selling Agent Commission % *</label>
                  <input type="number" placeholder="Enter agreed rate — e.g. 1.5, 2, 2.5" value={costs.agentCommission} onChange={e=>setCosts(p=>({...p,agentCommission:e.target.value,sellingCostPct:e.target.value}))}/>
                  <div className="fh">Your agreed agent rate. Applied to SOLD lots only. Do not use a rate you haven't confirmed.</div>
                </div>
                <div className="fl">
                  <label>Conveyancing / Settlement *</label>
                  <div className="seg" style={{marginBottom:6}}>
                    <button className={`sb ${costs.conveyancingType==="pct"?"on":""}`} onClick={()=>setCosts(p=>({...p,conveyancingType:"pct"}))}>% of sale price</button>
                    <button className={`sb ${costs.conveyancingType==="fixed"?"on":""}`} onClick={()=>setCosts(p=>({...p,conveyancingType:"fixed"}))}>Fixed $ total</button>
                  </div>
                  {costs.conveyancingType==="pct" ? (
                    <>
                      <input type="number" placeholder="e.g. 0.4" value={costs.conveyancingPct} onChange={e=>setCosts(p=>({...p,conveyancingPct:e.target.value}))}/>
                      <div className="fh">% of total sold proceeds. Typically $1,500–$2,500 per lot (roughly 0.3–0.5%). Enter 0 if included in agent fee.</div>
                    </>
                  ) : (
                    <>
                      <input type="number" placeholder="e.g. 3600 (= $1,800 × 2 lots)" value={costs.conveyancingFixed} onChange={e=>setCosts(p=>({...p,conveyancingFixed:e.target.value}))}/>
                      <div className="fh">Total fixed conveyancing cost across all sold lots. e.g. $1,800 per lot × 2 lots = enter 3600. Enter 0 if included in agent fee.</div>
                    </>
                  )}
                </div>
              </div>
              <div className="fl">
                <label>Marketing / Advertising ($) *</label>
                <input type="number" placeholder="Enter $ or 0" value={costs.marketing} onChange={e=>setCosts(p=>({...p,marketing:e.target.value}))}/>
                <div className="fh">REA/Domain listings, photography, signage, social media. Separate from agent commission. Enter 0 if covered entirely in selling fee.</div>
              </div>
              {costs.agentCommission&&costs.conveyancingPct&&(
                <div className="info" style={{borderLeft:`3px solid ${C.green}`}}>
                  <strong>Total selling cost: </strong>{(parseFloat(costs.agentCommission||0)+parseFloat(costs.conveyancingPct||0)).toFixed(2)}% of SOLD lot sale prices ({costs.agentCommission}% agent + {costs.conveyancingPct}% conveyancing)
                </div>
              )}
              {/* ── GST — TWO LINE MODEL ── */}
              <div className="div"><span>GST Treatment</span></div>
              <div className="info" style={{borderLeft:`3px solid ${C.gold}`}}>
                <strong>GST materially affects net proceeds and must be confirmed with your accountant.</strong> The feasibility output mirrors your spreadsheet model with two GST lines: <em>Less: GST</em> and <em>Add: GST Margin Scheme benefit</em>.
              </div>
              <div className="fl">
                <label>GST Treatment on Sale of Dwellings *</label>
                <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:4}}>
                  {[
                    ["margin","Margin Scheme — GST on margin only. Output shows: Less GST / Add Margin Scheme benefit (two-line presentation matching your spreadsheet)."],
                    ["full","Full GST — 1/11th of full sale price. Input tax credits claimable on GST-inclusive construction costs."],
                    ["absorbed","GST absorbed into price / not applicable — sale prices are net of GST. No GST line shown."],
                    ["unknown","Not yet confirmed — need to check with accountant"],
                  ].map(([val,lbl])=>(
                    <button key={val} style={{background:costs.gstTreatment===val?"#34A86E":"#111111",border:`1px solid ${costs.gstTreatment===val?"#34A86E":"#2E2E2E"}`,borderRadius:8,padding:"10px 14px",color:costs.gstTreatment===val?"#fff":"#A0A8B0",fontFamily:"DM Sans,sans-serif",fontSize:13,cursor:"pointer",textAlign:"left",transition:"all .2s",fontWeight:costs.gstTreatment===val?600:400}} onClick={()=>setCosts(p=>({...p,gstTreatment:val}))}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
              {costs.gstTreatment==="margin"&&(<div className="info" style={{borderLeft:`3px solid ${C.green}`}}><strong>Margin Scheme.</strong> Output: Less GST = (GRV − land cost) ÷ 11. Add: Margin Scheme benefit = Full GST − Margin GST. Both parties must agree in writing on contract. Cannot use if land was purchased on full GST basis. No input tax credits on construction. Buyer withholds at settlement. <strong>Verify with accountant.</strong></div>)}
              {costs.gstTreatment==="full"&&(<div className="info" style={{borderLeft:`3px solid ${C.green}`}}><strong>Full GST.</strong> Less GST = GRV ÷ 11. Input tax credits recoverable on construction costs. Buyer withholds 1/11th at settlement. <strong>Verify with accountant.</strong></div>)}
              {costs.gstTreatment==="absorbed"&&(<div className="info" style={{borderLeft:`3px solid ${C.amber}`}}><strong>⚠ GST absorbed.</strong> New residential premises are typically a taxable supply. Confirm with accountant before relying on these numbers.</div>)}
              {costs.gstTreatment==="unknown"&&(<div className="info" style={{borderLeft:`3px solid ${C.red}`}}><strong>⚠ GST not confirmed.</strong> Indicative GST exposure ≈ {fmt(lots.reduce((s,l)=>s+(parseFloat(l.strategy==="sell"?l.salePrice:l.endValue)||0),0)/11)}. Do not make decisions until confirmed with accountant.</div>)}
              {/* ── FINANCE ── */}
              <div className="div"><span>Finance</span></div>
              <div className="fr">
                <div className="fl">
                  <label>LVR % *</label>
                  <input type="number" placeholder="e.g. 65 or 70" value={costs.lvr} onChange={e=>setCosts(p=>({...p,lvr:e.target.value}))}/>
                  <div className="fh">Confirm with lender/broker. Construction LVR typically 65–75%.</div>
                </div>
                <div className="fl">
                  <label>Interest Rate % p.a. *</label>
                  <input type="number" placeholder="e.g. 7.5" value={costs.rate} onChange={e=>setCosts(p=>({...p,rate:e.target.value}))}/>
                  <div className="fh">Actual construction loan rate. Confirm with broker.</div>
                </div>
              </div>
              <div className="fr">
                <div className="fl">
                  <label>Loan Duration (months) *</label>
                  <input type="number" placeholder="e.g. 18" value={costs.durationMonths} onChange={e=>setCosts(p=>({...p,durationMonths:e.target.value}))}/>
                  <div className="fh">Settlement to final sale settlement.</div>
                </div>
                <div className="fl">
                  <label>Interest Method *</label>
                  <div className="seg">
                    <button className={`sb ${costs.interestMethod==="A"?"on":""}`} onClick={()=>setCosts(p=>({...p,interestMethod:"A"}))}>Milestone drawdown</button>
                    <button className={`sb ${costs.interestMethod==="B"?"on":""}`} onClick={()=>setCosts(p=>({...p,interestMethod:"B"}))}>Full balance</button>
                  </div>
                  <div className="fh">{costs.interestMethod==="A"?"Milestone drawdown — progressively drawn (~55% avg). Realistic for construction loans.":"Full balance — most conservative, highest interest estimate."}</div>
                </div>
              </div>
              {!canNext() && (()=>{
                const missing = []
                if (!costs.purchasePrice) missing.push("Purchase Price")
                if (!costs.purchaseCostPct) missing.push("Stamp Duty %")
                if (!costs.targetProfit) missing.push("Target Profit %")
                if (!costs.buildTotal) missing.push("Build Total")
                if (costs.demolition==="") missing.push("Demolition (enter 0 if none)")
                if (costs.civils==="") missing.push("Civils (enter 0 if none)")
                if (costs.services==="") missing.push("Services (enter 0 if none)")
                if (!costs.contingencyPct) missing.push("Construction Contingency %")
                if (costs.designFees==="") missing.push("Design & Authorities (enter 0 if none)")
                if (costs.surveyorFees==="") missing.push("Surveyor Fees (enter 0 if none)")
                if (costs.engineeringFees==="") missing.push("Engineering (enter 0 if none)")
                if (costs.ipAssignment==="") missing.push("IP / Assignment (enter 0 if none)")
                if (costs.legalFees==="") missing.push("Legals (enter 0 if none)")
                if (costs.otherFees==="") missing.push("Other Fees (enter 0 if none)")
                if (costs.authorityFees==="") missing.push("Authority Fees (enter 0 if none)")
                if (costs.landscaping==="") missing.push("Landscaping (enter 0 if none)")
                if (costs.holdingRates==="") missing.push("Council Rates (enter 0 if none)")
                if (costs.holdingInsurance==="") missing.push("PL Insurance (enter 0 if none)")
                if (costs.holdingOther==="") missing.push("Other Holding (enter 0 if none)")
                if (!costs.agentCommission) missing.push("Agent Commission %")
                if (costs.conveyancingType==="fixed" ? costs.conveyancingFixed==="" : !costs.conveyancingPct) missing.push("Conveyancing / Settlement")
                if (costs.marketing==="") missing.push("Marketing (enter 0 if none)")
                if (!costs.gstTreatment) missing.push("GST Treatment — select one of the 4 options")
                if (!costs.lvr) missing.push("LVR %")
                if (!costs.rate) missing.push("Interest Rate %")
                if (!costs.durationMonths) missing.push("Loan Duration")
                return missing.length > 0 ? (
                  <div className="fh w" style={{marginTop:8}}>⚠ Still required: {missing.join(" · ")}</div>
                ) : null
              })()}
              <div className="br">
                <button className="bs" onClick={()=>setStep(6)}>← Back</button>
                <button className="bp" disabled={!canNext()} onClick={next}>Run Full Feasibility →</button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 — T&F Result */}
        {step===5&&mode==="tickflick"&&(
          <div className="anim">
            <div className="card">
              <div className="cstep">Tick &amp; Flick Result</div>
              <div className="ctitle">Site Assessment</div>
              <div style={{fontSize:12,color:C.textMuted,marginBottom:18}}>{site.address}</div>
              {tfResult.checks.map((c,i)=>(
                <div className="tfi" key={i}>
                  <div className={`tfic ${c.icon}`}>{c.icon==="tick"?"✓":c.icon==="warn"?"!":"✕"}</div>
                  <div><div className="tflb">{c.label}</div><div className="tfnt">{c.note}</div></div>
                </div>
              ))}
              <div style={{marginTop:18,padding:"14px 18px",background:C.surfaceAlt,borderRadius:8,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:9,color:C.textMuted,letterSpacing:".1em",textTransform:"uppercase",fontFamily:"JetBrains Mono,monospace",marginBottom:7}}>Verdict</div>
                <span className={`vrd ${tfResult.vClass}`}>{tfResult.vClass}</span>
                <div style={{marginTop:7,fontSize:13.5,color:C.text,fontWeight:500}}>{tfResult.verdict}</div>
              </div>
              {tfResult.vClass!=="FAIL"&&(
                <div className="br" style={{marginTop:18}}>
                  <button className="bp" onClick={()=>{setMode("full");setStep(5);setConcept(p=>({...p,dwellings:tf.dwellings}));}}>
                    Continue to Full Feasibility →
                  </button>
                </div>
              )}
            </div>
            <div className="card">
              <div style={{fontSize:9,color:C.textMuted,letterSpacing:".12em",textTransform:"uppercase",fontFamily:"JetBrains Mono,monospace",marginBottom:10}}>Disclaimer</div>
              <div style={{fontSize:12,color:C.textMuted,lineHeight:1.7}}>This Tick &amp; Flick is a preliminary guide only. Exact development potential must be confirmed by a town planner, surveyor, builder, engineer and council. Nothing stated here is financial, legal, planning or tax advice.</div>
            </div>
            <div className="cta">
              <div className="cta-n">Clinton Barker — eXp Realty</div>
              <div className="cta-d">📞 <a href="tel:0409904473">0409 904 473</a> &nbsp;|&nbsp; 📧 <a href="mailto:clinton.barker@expaustralia.com.au">clinton.barker@expaustralia.com.au</a><br/>📅 <a href="https://calendly.com/clinton-barker-expaustralia/schedule-a-call-with-clinton-barker" target="_blank" rel="noopener noreferrer">Book a free 30-minute call</a></div>
            </div>
          </div>
        )}

        {/* STEP 8 — Full Result */}
        {step===steps.length-1&&mode==="full"&&(
          <div className="anim">
            <div className="ai-wrap">
              <div className="ai-hdr">
                <div className="ai-dot"/>
                <div className="ai-lbl">DevCheck Feasibility Assessment — {site.address||"Development Site"}</div>
              </div>
              {loading?(
                <div className="ai-think"><div className="dots"><span/><span/><span/></div>Running full feasibility analysis…</div>
              ):(
                <div className="ai-body" ref={aiRef} dangerouslySetInnerHTML={{__html: renderMD(aiOut)}} style={{whiteSpace:'normal'}}/>
              )}
            </div>
            {!loading&&aiOut&&(
              <div style={{display:'flex',justifyContent:'flex-end',gap:10,padding:'8px 0 2px'}}>
                <button
                  onClick={emailReport}
                  disabled={emailSending}
                  style={{background:'#1C1C1C',border:'1px solid #2E2E2E',borderRadius:6,color:emailSent?'#34A86E':'#8ECFB0',fontSize:12,padding:'8px 16px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",letterSpacing:'.02em',opacity:emailSending?0.6:1}}
                >
                  {emailSending ? 'Sending…' : emailSent ? '✓ Sent to your email' : '📧 Email Report'}
                </button>
                <button
                  onClick={downloadPDF}
                  style={{background:'#1C1C1C',border:'1px solid #2E2E2E',borderRadius:6,color:'#8ECFB0',fontSize:12,padding:'8px 16px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",letterSpacing:'.02em'}}
                >
                  ⬇ Download PDF
                </button>
              </div>
            )}
            {!loading&&aiOut&&(
              <div className="card">
                <div className="cstep">Follow-up</div>
                <div className="ctitle" style={{fontSize:19}}>Ask a follow-up question</div>
                <div className="cdesc">Change an input, test a sensitivity, or ask for clarification on any line item.</div>
                <div className="fl">
                  <textarea placeholder='e.g. "What if build cost goes up 10%?" or "What if we only sell 2 of the 3 lots?"' value={followUp} onChange={e=>setFollowUp(e.target.value)} rows={3}/>
                </div>
                <div className="br">
                  <button className="bp" disabled={!followUp.trim()||loading} onClick={()=>{callAI(followUp);setFollowUp("");}}>Send →</button>
                </div>
              </div>
            )}
            <div className="cta">
              <div className="cta-n">Clinton Barker — eXp Realty</div>
              <div className="cta-d">
                For professional site assessments, development advice, or to explore your options:<br/>
                📞 <a href="tel:0409904473">0409 904 473</a> &nbsp;|&nbsp; 📧 <a href="mailto:clinton.barker@expaustralia.com.au">clinton.barker@expaustralia.com.au</a><br/>
                🌐 <a href="https://www.clintonbarkerproperty.com.au" target="_blank" rel="noopener noreferrer">www.clintonbarkerproperty.com.au</a> &nbsp;|&nbsp; 📅 <a href="https://calendly.com/clinton-barker-expaustralia/schedule-a-call-with-clinton-barker" target="_blank" rel="noopener noreferrer">Book a free 30-minute call</a>
              </div>
            </div>
          </div>
        )}

        {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}

        {/* Footer */}
        <div style={{borderTop:'1px solid #2E2E2E',marginTop:40,paddingTop:16,paddingBottom:24,display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:10}}>
          <div style={{fontSize:11,color:'#6B7280',lineHeight:1.6}}>
            © {new Date().getFullYear()} Clinton Barker Property · eXp Realty SA &nbsp;·&nbsp; DevCheck is a preliminary guide only. Not financial, legal, planning or tax advice.
            &nbsp;·&nbsp; <button onClick={() => setShowPrivacy(true)} style={{background:'none',border:'none',color:'#6B7280',fontSize:11,cursor:'pointer',padding:0,textDecoration:'underline',fontFamily:"'DM Sans',sans-serif"}}>Privacy Policy</button>
          </div>
          {userRecord?.subscribed && (
            <button
              onClick={async () => {
                const token = await getAccessToken()
                const r = await fetch('/api/create-portal-session', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` }
                })
                const d = await r.json()
                if (d.url) window.location.href = d.url
              }}
              style={{background:'none',border:'1px solid #2E2E2E',borderRadius:4,color:'#A0A8B0',fontSize:11,padding:'4px 12px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}
            >
              Manage Account / Cancel Subscription
            </button>
          )}
        </div>

      </div>
    </>
  )
}
