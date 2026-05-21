// Clean Professional palette — navy + gold on white
// Replaces original dark theme (#0C0E13 bg)
export const C = {
  bg:         "#F7F9FC",
  surface:    "#FFFFFF",
  surfaceAlt: "#F0F4F8",
  card:       "#FFFFFF",
  border:     "#E2E8F0",
  borderMid:  "#CBD5E0",
  gold:       "#C9AA6E",
  goldLight:  "#8B7340",
  goldDim:    "#8B7340",
  goldFaint:  "rgba(201,170,110,0.10)",
  text:       "#1A202C",
  textMuted:  "#2D3748"
  textDim:    "#4A5568",
  green:      "#38A169",
  amber:      "#D97706",
  red:        "#E53E3E",
  blue:       "#3182CE",
  navy:       "#1E3A5F",
}

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#F7F9FC;color:#1A202C;font-family:'DM Sans',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:2px}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
.anim{animation:fadeUp .3s ease both}
.app{max-width:840px;margin:0 auto;padding:0 18px 60px}
.hdr{padding:26px 0 20px;border-bottom:2px solid #E2E8F0;margin-bottom:26px}
.hdr-inner{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.eye{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.22em;color:#8B7340;text-transform:uppercase;margin-bottom:4px}
.ttl{font-family:'Cormorant Garamond',serif;font-size:25px;font-weight:700;color:#1E3A5F;line-height:1}
.sub{font-size:11px;color:#4A5568;margin-top:3px}
.hdr-r{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}
.badge{font-family:'JetBrains Mono',monospace;font-size:9px;padding:3px 9px;border-radius:2px;border:1px solid #C9AA6E;color:#8B7340;letter-spacing:.1em;text-transform:uppercase;background:rgba(201,170,110,0.10)}
.rst{background:none;border:1px solid #E2E8F0;color:#4A5568;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif;padding:4px 10px;border-radius:3px;transition:all .2s}
.rst:hover{border-color:#CBD5E0;color:#1A202C}
.pw{margin-bottom:26px}
.pb{height:3px;background:#E2E8F0;overflow:hidden;border-radius:2px}
.pf{height:100%;background:linear-gradient(90deg,#C9AA6E,#1E3A5F);transition:width .5s ease}
.pls{display:flex;justify-content:space-between;padding-top:7px;gap:2px}
.pl{font-size:9px;color:#718096;letter-spacing:.07em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;flex:1;text-align:center;transition:color .3s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pl.a{color:#1E3A5F;font-weight:600}.pl.d{color:#C9AA6E}
.card{background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;padding:28px 30px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.cstep{font-family:'JetBrains Mono',monospace;font-size:9px;color:#8B7340;letter-spacing:.2em;text-transform:uppercase;margin-bottom:7px}
.ctitle{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:#1E3A5F;margin-bottom:5px;line-height:1.15}
.cdesc{font-size:13px;color:#4A5568;line-height:1.65;margin-bottom:24px;max-width:500px}
.fg{display:flex;flex-direction:column;gap:15px}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.fl{display:flex;flex-direction:column;gap:5px}
.fl label{font-size:10px;font-weight:600;color:#1E3A5F;letter-spacing:.08em;text-transform:uppercase}
.fl input,.fl select,.fl textarea{background:#FFFFFF;border:1.5px solid #E2E8F0;border-radius:4px;color:#1A202C;font-family:'DM Sans',sans-serif;font-size:13px;padding:9px 11px;outline:none;transition:border-color .2s;width:100%}
.fl input:focus,.fl select:focus,.fl textarea:focus{border-color:#C9AA6E}
.fl input::placeholder,.fl textarea::placeholder{color:#718096}
.fl select option{background:#FFFFFF}
.fl textarea{resize:vertical;min-height:68px;line-height:1.5}
.fh{font-size:11px;color:#718096;line-height:1.5;margin-top:2px}
.fh.w{color:#D97706}.fh.ok{color:#38A169}
.seg{display:flex;background:#F0F4F8;border:1.5px solid #E2E8F0;border-radius:4px;overflow:hidden}
.sb{flex:1;padding:8px 9px;background:none;border:none;color:#4A5568;font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;transition:all .2s;text-align:center}
.sb.on{background:#1E3A5F;color:#fff;font-weight:600}
.sb:not(.on):hover{background:#E2E8F0;color:#1A202C}
.lot{background:#F0F4F8;border:1px solid #E2E8F0;border-radius:4px;padding:13px 16px;margin-bottom:9px}
.lt{font-size:10px;font-weight:600;color:#1E3A5F;letter-spacing:.08em;text-transform:uppercase;margin-bottom:9px}
.br{display:flex;gap:9px;align-items:center;margin-top:22px}
.bp{background:#1E3A5F;color:#fff;border:none;border-radius:4px;padding:10px 26px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;letter-spacing:.02em;transition:background .2s,transform .1s;display:inline-flex;align-items:center;gap:6px}
.bp:hover{background:#16304f}.bp:active{transform:scale(.98)}.bp:disabled{opacity:.35;cursor:not-allowed}
.bp-gold{background:#C9AA6E;color:#fff}
.bp-gold:hover{background:#8B7340}
.bs{background:transparent;color:#4A5568;border:1.5px solid #E2E8F0;border-radius:4px;padding:9px 18px;font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;transition:all .2s}
.bs:hover{border-color:#CBD5E0;color:#1A202C}
.disc{background:#F0F4F8;border:1px solid #E2E8F0;border-left:3px solid #C9AA6E;border-radius:4px;padding:16px 20px;margin-bottom:16px}
.dt{font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#1E3A5F;margin-bottom:7px}
.dd{font-size:12px;color:#4A5568;line-height:1.75}
.dc{display:flex;align-items:flex-start;gap:9px;margin-top:13px;cursor:pointer}
.dc input[type=checkbox]{margin-top:2px;accent-color:#1E3A5F;width:14px;height:14px;flex-shrink:0;cursor:pointer}
.dc span{font-size:12px;color:#1A202C;line-height:1.55}
.ai-wrap{background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.ai-hdr{background:#1E3A5F;border-bottom:1px solid #E2E8F0;padding:10px 17px;display:flex;align-items:center;gap:8px}
.ai-dot{width:7px;height:7px;border-radius:50%;background:#C9AA6E;animation:pulse 2s infinite}
.ai-lbl{font-family:'JetBrains Mono',monospace;font-size:9px;color:#C9AA6E;letter-spacing:.15em;text-transform:uppercase}
.ai-body{padding:20px 24px;font-size:13.5px;line-height:1.85;color:#1A202C;white-space:pre-wrap;max-height:560px;overflow-y:auto}
.ai-think{padding:24px;display:flex;align-items:center;gap:10px;color:#4A5568;font-size:13px}
.dots span{display:inline-block;width:5px;height:5px;border-radius:50%;background:#C9AA6E;margin:0 2px;animation:bounce 1.1s infinite}
.dots span:nth-child(2){animation-delay:.18s}.dots span:nth-child(3){animation-delay:.36s}
.mg{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin:18px 0}
.mc{background:#F0F4F8;border:2px solid #E2E8F0;border-radius:6px;padding:20px 18px;cursor:pointer;transition:border-color .2s,background .2s}
.mc:hover{border-color:#C9AA6E}.mc.on{border-color:#1E3A5F;background:rgba(201,170,110,0.10)}
.mi{font-size:23px;margin-bottom:9px}
.mt{font-family:'Cormorant Garamond',serif;font-size:17px;color:#1E3A5F;margin-bottom:4px}
.md{font-size:12px;color:#4A5568;line-height:1.6}
.mm{font-family:'JetBrains Mono',monospace;font-size:9px;color:#8B7340;margin-top:7px;letter-spacing:.07em}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#E2E8F0;border:1px solid #E2E8F0;border-radius:4px;overflow:hidden;margin-bottom:13px}
.rc{background:#FFFFFF;padding:14px 16px}
.rl{font-size:9px;color:#4A5568;letter-spacing:.1em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;margin-bottom:4px}
.rv{font-family:'Cormorant Garamond',serif;font-size:21px;color:#1E3A5F}
.vrd{display:inline-block;padding:3px 9px;border-radius:3px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;font-weight:600}
.vrd.PASS{background:rgba(56,161,105,.1);color:#38A169;border:1px solid rgba(56,161,105,.25)}
.vrd.MARGINAL{background:rgba(217,119,6,.1);color:#D97706;border:1px solid rgba(217,119,6,.25)}
.vrd.FAIL{background:rgba(229,62,62,.1);color:#E53E3E;border:1px solid rgba(229,62,62,.25)}
.tfi{display:flex;align-items:flex-start;gap:11px;padding:10px 0;border-bottom:1px solid #E2E8F0}
.tfi:last-child{border:none}
.tfic{width:21px;height:21px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;margin-top:1px}
.tfic.tick{background:rgba(56,161,105,.1);color:#38A169}
.tfic.warn{background:rgba(217,119,6,.1);color:#D97706}
.tfic.flick{background:rgba(229,62,62,.1);color:#E53E3E}
.tflb{font-size:13px;font-weight:500;color:#1A202C;margin-bottom:2px}
.tfnt{font-size:11px;color:#4A5568;line-height:1.55}
.div{display:flex;align-items:center;gap:9px;margin:14px 0}
.div span{font-size:9px;color:#718096;letter-spacing:.14em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;white-space:nowrap}
.div::before,.div::after{content:'';flex:1;height:1px;background:#E2E8F0}
.info{background:#F0F4F8;border:1px solid #E2E8F0;border-radius:4px;padding:11px 14px;font-size:12px;color:#4A5568;line-height:1.6;margin-bottom:13px}
.info strong{color:#1E3A5F}
.cta{background:#F0F4F8;border:1px solid #E2E8F0;border-left:3px solid #C9AA6E;border-radius:4px;padding:16px 20px;margin-top:16px}
.cta-n{font-family:'Cormorant Garamond',serif;font-size:16px;color:#1E3A5F;margin-bottom:4px}
.cta-d{font-size:12px;color:#4A5568;line-height:1.75}
.cta-d a{color:#3182CE;text-decoration:none}
@media(max-width:560px){.card{padding:18px 15px}.fr{grid-template-columns:1fr}.rg{grid-template-columns:1fr 1fr}.mg{grid-template-columns:1fr}}
`
