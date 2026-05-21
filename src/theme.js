// Obsidian + Emerald — dark premium theme
export const C = {
  bg:         "#141414",
  surface:    "#1C1C1C",
  surfaceAlt: "#111111",
  card:       "#1C1C1C",
  border:     "#2E2E2E",
  borderMid:  "#3A3A3A",
  gold:       "#34A86E",
  goldLight:  "#8ECFB0",
  goldDim:    "#1B7A4A",
  goldFaint:  "rgba(52,168,110,0.12)",
  text:       "#F2F2F2",
  textMuted:  "#A0A8B0",
  textDim:    "#6B7280",
  green:      "#34A86E",
  amber:      "#F59E0B",
  red:        "#EF4444",
  blue:       "#60A5FA",
  navy:       "#1B7A4A",
}

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#141414;color:#F2F2F2;font-family:'DM Sans',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#2E2E2E;border-radius:2px}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
.anim{animation:fadeUp .3s ease both}
.app{max-width:840px;margin:0 auto;padding:0 18px 60px}
.hdr{padding:26px 0 20px;border-bottom:1px solid #2E2E2E;margin-bottom:26px}
.hdr-inner{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.eye{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.22em;color:#8ECFB0;text-transform:uppercase;margin-bottom:4px}
.ttl{font-family:'Cormorant Garamond',serif;font-size:25px;font-weight:700;color:#F2F2F2;line-height:1}
.sub{font-size:11px;color:#A0A8B0;margin-top:3px}
.hdr-r{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}
.badge{font-family:'JetBrains Mono',monospace;font-size:9px;padding:3px 9px;border-radius:4px;border:1px solid #34A86E;color:#8ECFB0;letter-spacing:.1em;text-transform:uppercase;background:rgba(52,168,110,0.10)}
.rst{background:none;border:1px solid #2E2E2E;color:#A0A8B0;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif;padding:4px 10px;border-radius:4px;transition:all .2s}
.rst:hover{border-color:#3A3A3A;color:#F2F2F2}
.pw{margin-bottom:26px}
.pb{height:3px;background:#1C1C1C;overflow:hidden;border-radius:2px}
.pf{height:100%;background:linear-gradient(90deg,#34A86E,#8ECFB0);transition:width .5s ease}
.pls{display:flex;justify-content:space-between;padding-top:7px;gap:2px}
.pl{font-size:9px;color:#6B7280;letter-spacing:.07em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;flex:1;text-align:center;transition:color .3s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pl.a{color:#34A86E;font-weight:600}.pl.d{color:#1B7A4A}
.card{background:#1C1C1C;border:1px solid #2E2E2E;border-radius:12px;padding:28px 30px;margin-bottom:16px;box-shadow:0 2px 16px rgba(0,0,0,.4)}
.cstep{font-family:'JetBrains Mono',monospace;font-size:9px;color:#8ECFB0;letter-spacing:.2em;text-transform:uppercase;margin-bottom:7px}
.ctitle{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:#F2F2F2;margin-bottom:5px;line-height:1.15}
.cdesc{font-size:13px;color:#A0A8B0;line-height:1.65;margin-bottom:24px;max-width:500px}
.fg{display:flex;flex-direction:column;gap:15px}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.fl{display:flex;flex-direction:column;gap:5px}
.fl label{font-size:10px;font-weight:600;color:#A0A8B0;letter-spacing:.08em;text-transform:uppercase}
.fl input,.fl select,.fl textarea{background:#111111;border:1.5px solid #2E2E2E;border-radius:8px;color:#F2F2F2;font-family:'DM Sans',sans-serif;font-size:13px;padding:9px 11px;outline:none;transition:border-color .2s;width:100%}
.fl input:focus,.fl select:focus,.fl textarea:focus{border-color:#34A86E}
.fl input::placeholder,.fl textarea::placeholder{color:#6B7280}
.fl select option{background:#1C1C1C;color:#F2F2F2}
.fl textarea{resize:vertical;min-height:68px;line-height:1.5}
.fh{font-size:11px;color:#6B7280;line-height:1.5;margin-top:2px}
.fh.w{color:#F59E0B}.fh.ok{color:#34A86E}
.seg{display:flex;background:#111111;border:1.5px solid #2E2E2E;border-radius:8px;overflow:hidden}
.sb{flex:1;padding:8px 9px;background:none;border:none;color:#A0A8B0;font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;transition:all .2s;text-align:center}
.sb.on{background:#34A86E;color:#fff;font-weight:600}
.sb:not(.on):hover{background:#1C1C1C;color:#F2F2F2}
.lot{background:#111111;border:1px solid #2E2E2E;border-radius:8px;padding:13px 16px;margin-bottom:9px}
.lt{font-size:10px;font-weight:600;color:#A0A8B0;letter-spacing:.08em;text-transform:uppercase;margin-bottom:9px}
.br{display:flex;gap:9px;align-items:center;margin-top:22px}
.bp{background:linear-gradient(135deg,#34A86E,#1B7A4A);color:#fff;border:none;border-radius:8px;padding:10px 26px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;letter-spacing:.02em;transition:all .2s;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 16px rgba(52,168,110,0.25)}
.bp:hover{background:linear-gradient(135deg,#2D9660,#155E38);box-shadow:0 6px 20px rgba(52,168,110,0.35)}.bp:active{transform:scale(.98)}.bp:disabled{opacity:.35;cursor:not-allowed;box-shadow:none}
.bp-gold{background:transparent;color:#34A86E;border:1.5px solid #34A86E;box-shadow:none}
.bp-gold:hover{background:rgba(52,168,110,0.1);box-shadow:none}
.bs{background:transparent;color:#A0A8B0;border:1.5px solid #2E2E2E;border-radius:8px;padding:9px 18px;font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;transition:all .2s}
.bs:hover{border-color:#3A3A3A;color:#F2F2F2}
.disc{background:#111111;border:1px solid #2E2E2E;border-left:3px solid #34A86E;border-radius:8px;padding:16px 20px;margin-bottom:16px}
.dt{font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#A0A8B0;margin-bottom:7px}
.dd{font-size:12px;color:#A0A8B0;line-height:1.75}
.dc{display:flex;align-items:flex-start;gap:9px;margin-top:13px;cursor:pointer}
.dc input[type=checkbox]{margin-top:2px;accent-color:#34A86E;width:14px;height:14px;flex-shrink:0;cursor:pointer}
.dc span{font-size:12px;color:#F2F2F2;line-height:1.55}
.ai-wrap{background:#1C1C1C;border:1px solid #2E2E2E;border-radius:12px;overflow:hidden;margin-bottom:16px;box-shadow:0 2px 16px rgba(0,0,0,.4)}
.ai-hdr{background:#111111;border-bottom:1px solid #2E2E2E;padding:10px 17px;display:flex;align-items:center;gap:8px}
.ai-dot{width:7px;height:7px;border-radius:50%;background:#34A86E;animation:pulse 2s infinite}
.ai-lbl{font-family:'JetBrains Mono',monospace;font-size:9px;color:#8ECFB0;letter-spacing:.15em;text-transform:uppercase}
.ai-body{padding:20px 24px;font-size:13.5px;line-height:1.85;color:#F2F2F2;white-space:pre-wrap;max-height:560px;overflow-y:auto}
.ai-think{padding:24px;display:flex;align-items:center;gap:10px;color:#A0A8B0;font-size:13px}
.dots span{display:inline-block;width:5px;height:5px;border-radius:50%;background:#34A86E;margin:0 2px;animation:bounce 1.1s infinite}
.dots span:nth-child(2){animation-delay:.18s}.dots span:nth-child(3){animation-delay:.36s}
.mg{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin:18px 0}
.mc{background:#111111;border:2px solid #2E2E2E;border-radius:12px;padding:20px 18px;cursor:pointer;transition:border-color .2s,background .2s}
.mc:hover{border-color:#34A86E}.mc.on{border-color:#34A86E;background:rgba(52,168,110,0.08)}
.mi{font-size:23px;margin-bottom:9px}
.mt{font-family:'Cormorant Garamond',serif;font-size:17px;color:#F2F2F2;margin-bottom:4px}
.md{font-size:12px;color:#A0A8B0;line-height:1.6}
.mm{font-family:'JetBrains Mono',monospace;font-size:9px;color:#8ECFB0;margin-top:7px;letter-spacing:.07em}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#2E2E2E;border:1px solid #2E2E2E;border-radius:8px;overflow:hidden;margin-bottom:13px}
.rc{background:#1C1C1C;padding:14px 16px}
.rl{font-size:9px;color:#A0A8B0;letter-spacing:.1em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;margin-bottom:4px}
.rv{font-family:'Cormorant Garamond',serif;font-size:21px;color:#F2F2F2}
.vrd{display:inline-block;padding:3px 9px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;font-weight:600}
.vrd.PASS{background:rgba(52,168,110,.15);color:#34A86E;border:1px solid rgba(52,168,110,.3)}
.vrd.MARGINAL{background:rgba(245,158,11,.15);color:#F59E0B;border:1px solid rgba(245,158,11,.3)}
.vrd.FAIL{background:rgba(239,68,68,.15);color:#EF4444;border:1px solid rgba(239,68,68,.3)}
.tfi{display:flex;align-items:flex-start;gap:11px;padding:10px 0;border-bottom:1px solid #2E2E2E}
.tfi:last-child{border:none}
.tfic{width:21px;height:21px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;margin-top:1px}
.tfic.tick{background:rgba(52,168,110,.15);color:#34A86E}
.tfic.warn{background:rgba(245,158,11,.15);color:#F59E0B}
.tfic.flick{background:rgba(239,68,68,.15);color:#EF4444}
.tflb{font-size:13px;font-weight:500;color:#F2F2F2;margin-bottom:2px}
.tfnt{font-size:11px;color:#A0A8B0;line-height:1.55}
.div{display:flex;align-items:center;gap:9px;margin:14px 0}
.div span{font-size:9px;color:#6B7280;letter-spacing:.14em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;white-space:nowrap}
.div::before,.div::after{content:'';flex:1;height:1px;background:#2E2E2E}
.info{background:#111111;border:1px solid #2E2E2E;border-radius:8px;padding:11px 14px;font-size:12px;color:#A0A8B0;line-height:1.6;margin-bottom:13px}
.info strong{color:#F2F2F2}
.cta{background:#111111;border:1px solid #2E2E2E;border-left:3px solid #34A86E;border-radius:8px;padding:16px 20px;margin-top:16px}
.cta-n{font-family:'Cormorant Garamond',serif;font-size:16px;color:#F2F2F2;margin-bottom:4px}
.cta-d{font-size:12px;color:#A0A8B0;line-height:1.75}
.cta-d a{color:#34A86E;text-decoration:none}
@media(max-width:560px){.card{padding:18px 15px}.fr{grid-template-columns:1fr}.rg{grid-template-columns:1fr 1fr}.mg{grid-template-columns:1fr}}
`
