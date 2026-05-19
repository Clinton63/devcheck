// Formatting helper
export const fmt = n => n ? `$${Number(n).toLocaleString("en-AU")}` : "—"

// Tick & Flick quick assessment
export function runTF({ landSize, dwellings, frontage, slope, easements, overlays, estGRV, estTotalCost }) {
  const checks = []; let score = 0; let total = 0;
  const add = (icon, label, note, pts = 0) => { checks.push({ icon, label, note }); score += pts; total++; };
  if (landSize && dwellings) {
    const ppd = landSize / dwellings;
    if (ppd >= 300) add("tick","Land size per dwelling",`~${Math.round(ppd)}m² — comfortable for SA`,1);
    else if (ppd >= 200) add("warn","Land size per dwelling",`~${Math.round(ppd)}m² — tight. Confirm council minimums.`,0.5);
    else add("flick","Land size per dwelling",`~${Math.round(ppd)}m² — likely too small. Seek planning advice first.`);
  }
  if (frontage) {
    const f = parseFloat(frontage);
    if (f >= 15) add("tick","Frontage",`${f}m — suitable for subdivision access`,1);
    else if (f >= 10) add("warn","Frontage",`${f}m — marginal. Check road widening and access requirements.`,0.5);
    else add("flick","Frontage",`${f}m — very tight. May restrict development type.`);
  }
  if (slope) {
    if (slope==="flat") add("tick","Slope","Flat — predictable site costs",1);
    else if (slope==="slight") add("tick","Slope","Slight — manageable. Allow for minor retaining in civils.",1);
    else if (slope==="moderate") add("warn","Slope","Moderate — retaining walls and engineered slab likely. Add $20k–$50k+ to civils.",0.5);
    else add("flick","Slope","Steep — significant civil costs. Get a site cost estimate before proceeding.");
  }
  if (easements) {
    if (easements==="none") add("tick","Easements","No easements reported — good.",1);
    else if (easements==="minor") add("warn","Easements","Easements present — check position, type and building setback impacts.",0.5);
    else add("flick","Easements","Significant easements — get surveyor to confirm impact on yield and layout.");
  }
  if (overlays) {
    if (overlays==="none") add("tick","Overlays / Constraints","No overlays indicated — proceed to full feasibility.",1);
    else add("warn","Overlays / Constraints",`${overlays} overlay noted — additional assessment and costs likely apply.`,0.5);
  }
  if (estGRV && estTotalCost) {
    const m = (parseFloat(estGRV)-parseFloat(estTotalCost))/parseFloat(estTotalCost);
    if (m >= 0.20) add("tick","Preliminary margin",`~${(m*100).toFixed(1)}% on cost — above 20% threshold.`,1);
    else if (m >= 0.15) add("warn","Preliminary margin",`~${(m*100).toFixed(1)}% on cost — marginal band (15–20%). Scrutinise all costs.`,0.5);
    else add("flick","Preliminary margin",`~${(m*100).toFixed(1)}% on cost — below 15%. Reconsider pricing or cost structure.`);
  }
  const pct = total > 0 ? score/total : 0;
  let verdict, vClass;
  if (pct >= 0.75) { verdict="PROCEED TO FULL FEASIBILITY"; vClass="PASS"; }
  else if (pct >= 0.5) { verdict="INVESTIGATE FURTHER"; vClass="MARGINAL"; }
  else { verdict="WALK AWAY — SITE HAS SIGNIFICANT ISSUES"; vClass="FAIL"; }
  return { checks, verdict, vClass };
}

// Build the full feasibility prompt from app state
// Called with the full state object from App.jsx
export function buildPromptFromState({ lots, costs, concept, site, exp }) {
  const grv=lots.reduce((s,l)=>s+(parseFloat(l.strategy==="sell"?l.salePrice:l.endValue)||0),0);
  const soldGRV=lots.filter(l=>l.strategy==="sell").reduce((s,l)=>s+(parseFloat(l.salePrice)||0),0);
  const buildTotal=parseFloat(costs.buildTotal||0);
  const demo=parseFloat(costs.demolition||0);
  const civils=parseFloat(costs.civils||0);
  const services=parseFloat(costs.services||0);
  const cont=(buildTotal+demo)*(parseFloat(costs.contingencyPct||0))/100;
  const profFees=parseFloat(costs.designFees||0)+parseFloat(costs.surveyorFees||0)+parseFloat(costs.engineeringFees||0)+parseFloat(costs.ipAssignment||0)+parseFloat(costs.legalFees||0)+parseFloat(costs.otherFees||0);
  const marketing=parseFloat(costs.marketing||0);
  const authorities=parseFloat(costs.authorityFees||0);
  const landscaping=parseFloat(costs.landscaping||0);
  const holdingTotal=parseFloat(costs.holdingRates||0)+parseFloat(costs.holdingInsurance||0)+parseFloat(costs.holdingOther||0);
  const pc=parseFloat(costs.purchasePrice||0)*(parseFloat(costs.purchaseCostPct||0))/100;
  const sellingPct=(parseFloat(costs.agentCommission||0)+parseFloat(costs.conveyancingPct||0))/100;
  const sellingCosts=soldGRV*sellingPct;
  const totalProjectCosts=buildTotal+demo+civils+services+cont+profFees+marketing+authorities+landscaping+holdingTotal;
  const totalLandCosts=parseFloat(costs.purchasePrice||0)+pc;
  const loan=(totalLandCosts+totalProjectCosts)*(parseFloat(costs.lvr||0))/100;
  const interest=loan*(parseFloat(costs.rate||0))/100*(parseFloat(costs.durationMonths||0))/12*(costs.interestMethod==="A"?0.55:1);
  const fullGST=soldGRV/11;
  const marginGST=Math.max(0,(soldGRV-parseFloat(costs.purchasePrice||0))/11);
  const gstNet=costs.gstTreatment==="margin"?marginGST:costs.gstTreatment==="full"?fullGST:0;
  const tdc=totalLandCosts+totalProjectCosts+interest+sellingCosts+gstNet;
  const profit=grv-tdc;
  const marginPct=tdc>0?(profit/tdc*100):0;
  const target=parseFloat(costs.targetProfit||20);
  const verdict=marginPct>=target?"PASS":marginPct>=(target*0.75)?"MARGINAL":"FAIL";
  return `Please run a full development feasibility for this South Australian residential project.
EXPERIENCE LEVEL: ${exp}
DEVELOPER TARGET PROFIT ON COST: ${costs.targetProfit}% — judge PASS/MARGINAL/FAIL against THIS number.
SITE: ${site.address||"Not specified"}, Council: ${site.council}, Zoning: ${site.zoning}
Land: ${site.landSize}m², Frontage: ${site.frontage}m, Slope: ${site.slope}
Easements: ${site.easements}${site.easementNote?" — "+site.easementNote:""}${site.easementCost?" — allowance $"+Number(site.easementCost).toLocaleString("en-AU"):site.easements!=="none"?" — ⚠ NO COST ALLOWANCE PROVIDED":""}, Overlays: ${site.overlays}
Trees: ${site.trees}${site.treesNote?" — "+site.treesNote:""}
CONCEPT: ${concept.dwellings} × ${concept.type} (identical: ${concept.identical})
${lots.map((l,i)=>`Lot ${i+1}: ${l.strategy==="sell"?`SELL at ${fmt(l.salePrice)}`:`KEEP, end value ${fmt(l.endValue)}`}`).join("\n")}
GRV = ${fmt(grv)} | SOLD GRV = ${fmt(soldGRV)}

SALE PROCEEDS
New Dwellings: ${concept.dwellings} × ${concept.type}
Gross Sale Proceeds (incl GST): ${fmt(soldGRV)}
Less Sales & Marketing (${((parseFloat(costs.agentCommission||0)+parseFloat(costs.conveyancingPct||0))).toFixed(2)}%): -${fmt(sellingCosts)}
NET SALE PROCEEDS: ${fmt(soldGRV-sellingCosts)}

PROJECT COSTS
Construction (build): ${fmt(buildTotal)}
Demolition: ${fmt(demo)||"$0"}
Civils/External: ${fmt(civils)||"$0"}
Services (connections): ${fmt(services)||"$0"}  [SA Water: ${costs.saWaterDistance!=""?costs.saWaterDistance+"m"+(parseFloat(costs.saWaterDistance)>12?" NON-STANDARD":""):"not confirmed"}, SAPN: ${costs.sapnConnection||"not confirmed"}]
Construction Contingency (${costs.contingencyPct}% of build+demo only): ${fmt(cont)}
Design & Authorities: ${fmt(parseFloat(costs.designFees||0))}
Surveyor / Land Division: ${fmt(parseFloat(costs.surveyorFees||0))}
Engineering: ${fmt(parseFloat(costs.engineeringFees||0))}
IP / Assignment / Project Management: ${fmt(parseFloat(costs.ipAssignment||0))}
Legals / Conveyancing / Contracts: ${fmt(parseFloat(costs.legalFees||0))}
Other Professional Fees: ${fmt(parseFloat(costs.otherFees||0))}
Marketing / Advertising: ${fmt(marketing)||"$0"}
Council / Authority Charges: ${fmt(authorities)||"$0"}
Landscaping: ${fmt(landscaping)||"$0"}
Finance (interest — ${costs.interestMethod==="A"?"milestone":"full balance"}): ${fmt(interest)}
Council Rates & Water Rates: ${fmt(parseFloat(costs.holdingRates||0))}
Public Liability (PL) Insurance: ${fmt(parseFloat(costs.holdingInsurance||0))}
Site Security / Other Holding: ${fmt(parseFloat(costs.holdingOther||0))}
TOTAL HOLDING (non-interest): ${fmt(holdingTotal)}
TOTAL PROJECT COSTS (excl land, GST): ${fmt(totalProjectCosts+interest)}

LAND PURCHASE COSTS
Offer Price: ${fmt(parseFloat(costs.purchasePrice||0))}
Stamp Duty & Purchase Costs (${costs.purchaseCostPct}%): ${fmt(pc)}
TOTAL LAND PURCHASE COSTS: ${fmt(totalLandCosts)}

GST CALCULATIONS (${costs.gstTreatment==="margin"?"MARGIN SCHEME":costs.gstTreatment==="full"?"FULL GST":costs.gstTreatment==="absorbed"?"ABSORBED":"⚠ NOT CONFIRMED"})
Sales Proceeds net of GST: ${fmt(soldGRV/1.1)}
Less Purchase Price of Land (Margin Scheme): ${fmt(parseFloat(costs.purchasePrice||0))}
Margin: ${fmt(soldGRV/1.1-parseFloat(costs.purchasePrice||0))}
GST Payable (A): ${costs.gstTreatment==="margin"?fmt(marginGST)+" [("+fmt(soldGRV/1.1)+" − "+fmt(parseFloat(costs.purchasePrice||0))+") ÷ 11]":costs.gstTreatment==="full"?fmt(fullGST)+" ["+fmt(soldGRV)+" ÷ 11]":"N/A"}
GST Refundable on costs (B): ${costs.gstTreatment==="margin"||costs.gstTreatment==="full"?fmt((profFees+marketing+authorities+landscaping+holdingTotal)/11)+" [total GST-inclusive costs "+fmt(profFees+marketing+authorities+landscaping+holdingTotal)+" ÷ 11]":"N/A"}
NET GST PAYABLE (A − B): ${fmt(gstNet)}${costs.gstTreatment==="margin"?" [margin GST "+fmt(marginGST)+" − refundable "+fmt((profFees+marketing+authorities+landscaping+holdingTotal)/11)+"]":""}

FORECAST PROFIT: ${fmt(profit)}
FORECAST PROFIT ON COST %: ${marginPct.toFixed(1)}%
DEVELOPER TARGET: ${costs.targetProfit}%
PRE-CALCULATED VERDICT: ${verdict}

Please present output in the exact structure above, verify calculations, then provide:
1. Plain English explanation of PASS/MARGINAL/FAIL result (3–5 lines) — why it landed there, 2 biggest drivers
2. Sell/Keep outcome — net proceeds, debt repaid, surplus/shortfall
3. Key risks (3 bullets)
4. What to test next (3 bullets)
5. Mandatory disclaimer: "This feasibility is a preliminary guide only, based strictly on your inputs. Figures must be verified with qualified professionals including a town planner, builder, quantity surveyor, accountant, solicitor, and financial adviser. No financial, investment or legal advice is being provided."`
}
