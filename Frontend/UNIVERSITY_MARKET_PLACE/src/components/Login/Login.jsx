import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const url = "http://localhost:5000/Users/login"

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
  @keyframes fadeDown  { from{opacity:0;transform:translateY(-16px);}to{opacity:1;transform:translateY(0);} }
  @keyframes popIn     { from{opacity:0;transform:scale(0.78);}to{opacity:1;transform:scale(1);} }
  @keyframes barGrow   { from{width:0;}to{width:4rem;} }
  @keyframes spin      { to{transform:rotate(360deg);} }
  @keyframes shake     { 0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-8px);}40%,80%{transform:translateX(8px);} }
  @keyframes breathe   { 0%,100%{transform:scaleY(1);}50%{transform:scaleY(1.04);} }
  @keyframes tailSlow  { 0%,100%{transform:rotate(-18deg);}50%{transform:rotate(18deg);} }
  @keyframes tailFast  { 0%,100%{transform:rotate(-30deg);}50%{transform:rotate(30deg);} }
  @keyframes catBounce { 0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);} }
  @keyframes happyWig  { 0%,100%{transform:rotate(-5deg) scale(1.04);}50%{transform:rotate(5deg) scale(1.07);} }
  @keyframes smug      { 0%,100%{transform:rotate(-4deg) scale(1.05);}50%{transform:rotate(4deg) scale(1.08);} }
  @keyframes eyeClose  { from{transform:scaleY(1);}to{transform:scaleY(0.07);} }
  @keyframes eyeOpen   { from{transform:scaleY(0.07);}to{transform:scaleY(1);} }
  @keyframes zFloat    { 0%{opacity:0;transform:translate(0,0) scale(0.6);}40%{opacity:1;}100%{opacity:0;transform:translate(18px,-40px) scale(1.3);} }
  @keyframes steamRise { 0%{opacity:0;transform:translateY(0);}50%{opacity:0.6;}100%{opacity:0;transform:translateY(-26px);} }
  @keyframes mugFall   { 0%{transform:rotate(0deg) translate(0,0);opacity:1;}40%{transform:rotate(-25deg) translate(-12px,4px);opacity:1;}100%{transform:rotate(-90deg) translate(-60px,40px);opacity:0;} }
  @keyframes splashDrop{ 0%{transform:translate(0,0) scale(1);opacity:1;}100%{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0;} }
  @keyframes pawSwipe  { 0%{transform:rotate(0deg) translateX(0);}50%{transform:rotate(-20deg) translateX(-18px);}100%{transform:rotate(0deg) translateX(0);} }
  @keyframes pulse     { 0%,100%{opacity:1;}50%{opacity:0.55;} }
  @keyframes sunGlow   { 0%,100%{opacity:0.9;}50%{opacity:1;} }
  @keyframes earPerk   { from{transform:rotate(0);}to{transform:rotate(-18deg);} }
  @keyframes earPerkR  { from{transform:rotate(0);}to{transform:rotate(18deg);} }
  @keyframes slideIn   { from{opacity:0;transform:translateX(30px);}to{opacity:1;transform:translateX(0);} }

  .cat-root { min-height:100vh; display:flex; font-family:'DM Sans',sans-serif; overflow:hidden; background:#f8f7ff; }

  .cat-left {
    width:44%; min-height:100vh;
    background:linear-gradient(160deg,#fff8ee 0%,#fef3c7 50%,#fde8d8 100%);
    display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
    position:relative; overflow:hidden;
    border-right:2px solid #fde68a;
  }

  .cat-window {
    position:absolute; top:28px; left:50%; transform:translateX(-50%);
    width:140px; height:110px;
    background:linear-gradient(180deg,#bae6fd 0%,#e0f2fe 100%);
    border-radius:12px 12px 4px 4px; border:4px solid #d97706;
    box-shadow:inset 0 0 16px rgba(186,230,253,0.6); overflow:hidden;
  }
  .cat-window-cross-h { position:absolute;top:50%;left:0;width:100%;height:3px;background:#d97706;transform:translateY(-50%); }
  .cat-window-cross-v { position:absolute;top:0;left:50%;width:3px;height:100%;background:#d97706;transform:translateX(-50%); }
  .cat-sun { position:absolute;top:12px;right:18px;width:28px;height:28px;border-radius:50%;background:radial-gradient(circle,#fde047,#f59e0b);box-shadow:0 0 14px #fde047;animation:sunGlow 3s ease-in-out infinite; }

  .cat-shelf { position:absolute;bottom:138px;left:0;width:100%;height:14px;background:#d97706;border-radius:2px;box-shadow:0 3px 8px rgba(180,83,9,0.3); }
  .cat-book  { position:absolute;bottom:152px;border-radius:3px 3px 0 0; }

  .cat-mug-wrap { position:absolute; bottom:77px; right:calc(28% - 20px); z-index:6; }
  .cat-mug-wrap.knocked { animation:mugFall 0.7s cubic-bezier(.4,0,.6,1) both; }

  .cat-steam { position:absolute;bottom:100%;left:50%;transform:translateX(-50%); }
  .steam-wisp { position:absolute;bottom:0;width:4px;height:20px;background:rgba(180,83,9,0.3);border-radius:4px;animation:steamRise 2s ease-in-out infinite; }
  .steam-wisp:nth-child(1){left:-6px;animation-delay:0s;}
  .steam-wisp:nth-child(2){left:2px;animation-delay:0.4s;height:14px;}
  .steam-wisp:nth-child(3){left:9px;animation-delay:0.8s;}

  .splash-drop { position:absolute;width:7px;height:7px;border-radius:50%;background:#d97706;animation:splashDrop 0.6s ease-out both; }

  .cat-sleeping { animation:breathe 2.8s ease-in-out infinite; transform-origin:bottom center; }
  .cat-awake    { animation:catBounce 1.8s ease-in-out infinite; }
  .cat-happy    { animation:happyWig  0.6s ease-in-out infinite; }
  .cat-smug     { animation:smug      0.7s ease-in-out infinite; }
  .cat-shake    { animation:shake     0.55s ease both; }

  .cat-ear-l { transform-origin:bottom right; transition:transform 0.35s cubic-bezier(.34,1.56,.64,1); }
  .cat-ear-r { transform-origin:bottom left;  transition:transform 0.35s cubic-bezier(.34,1.56,.64,1); }
  .perked .cat-ear-l { animation:earPerk  0.35s cubic-bezier(.34,1.56,.64,1) both; transform:rotate(-18deg); }
  .perked .cat-ear-r { animation:earPerkR 0.35s cubic-bezier(.34,1.56,.64,1) both; transform:rotate(18deg); }

  .eye-open-cls  { animation:eyeOpen  0.22s ease both; transform-origin:50% 50%; }
  .eye-close-cls { animation:eyeClose 0.22s ease both; transform-origin:50% 50%; }
  .tail-slow { animation:tailSlow 2.2s ease-in-out infinite; transform-origin:top left; }
  .tail-fast { animation:tailFast 0.55s ease-in-out infinite; transform-origin:top left; }
  .paw-swipe { animation:pawSwipe 0.55s ease both; transform-origin:top right; }

  .z-float { animation:zFloat 2s ease-in-out infinite; position:absolute; font-weight:900; color:#a78bfa; font-family:'Nunito',sans-serif; }

  .cat-bubble {
    position:absolute; top:-14px; right:-10px;
    background:white; border:2px solid #e9d5ff;
    border-radius:14px 14px 14px 4px;
    padding:7px 13px; font-size:12px; font-weight:800; color:#6d28d9;
    white-space:nowrap; box-shadow:0 5px 18px rgba(109,40,217,0.15);
    animation:popIn 0.35s cubic-bezier(.34,1.56,.64,1) both; z-index:10;
  }
  .cat-label { font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#d97706;margin-top:8px;margin-bottom:20px;text-align:center;animation:pulse 2s ease-in-out infinite; }

  .cat-floor { position:absolute;bottom:0;left:0;width:100%;pointer-events:none; }

  .cat-right {
    flex:1; display:flex; align-items:center; justify-content:center;
    padding:40px 32px;
    background:white;
  }
  .cat-form-wrap { width:100%; max-width:400px; }

  .cat-header { animation:fadeDown 0.5s ease both; text-align:center; margin-bottom:32px; }
  .cat-eyebrow { font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#06b6d4;margin-bottom:6px; }
  .cat-title { font-family:'Nunito',sans-serif;font-size:32px;font-weight:900;color:#1e0a3c;line-height:1.1; }
  .cat-sub { font-size:13.5px;color:#9ca3af;margin-top:5px; }
  .cat-bar { height:4px;width:0;background:#06b6d4;border-radius:99px;margin:10px auto 0;animation:barGrow 0.7s ease 0.4s both; }

  .cat-card {
    border-left:4px solid #1e0a3c;
    background:white;
    border-radius:16px;
    padding:32px;
    box-shadow:0 20px 60px rgba(0,0,0,0.1);
    animation:fadeUp 0.55s cubic-bezier(.34,1.4,.64,1) 0.1s both;
  }

  .cat-field { opacity:0;animation:fadeUp 0.4s ease both;margin-bottom:20px; }
  .cat-field:nth-child(1){animation-delay:0.2s;}
  .cat-field:nth-child(2){animation-delay:0.3s;}
  .cat-field:nth-child(3){animation-delay:0.4s;}
  .cat-field:nth-child(4){animation-delay:0.5s;}

  .cat-lbl { display:block;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#1e0a3c;margin-bottom:6px; }

  .cat-input {
    width:100%; padding:8px 4px;
    background:transparent;
    border:none; border-bottom:2px solid #e9d5ff;
    font-size:14px; font-family:'DM Sans',sans-serif; color:black;
    outline:none;
    transition:border-color 0.2s, transform 0.15s;
  }
  .cat-input::placeholder { color:#9ca3af; }
  .cat-input:focus { border-bottom-color:#06b6d4; transform:translateY(-1px); }

  .cat-err {
    background:#fef2f2; border:1px solid #fecaca;
    border-radius:8px; padding:10px 14px; color:#dc2626;
    font-size:13px; animation:shake 0.5s ease both; margin-bottom:16px;
  }

  .cat-success {
    background:#f0fdf4; border:1px solid #bbf7d0;
    border-radius:8px; padding:10px 14px; color:#16a34a;
    font-size:13px; margin-bottom:16px; animation:fadeUp 0.3s ease both;
  }

  .cat-btn {
    width:100%; padding:13px;
    background:#1e0a3c;
    border:none; border-radius:12px; color:white;
    font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;
    letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;
    transition:background 0.3s, transform 0.15s, box-shadow 0.2s;
    position:relative; overflow:hidden;
  }
  .cat-btn:hover  { background:#06b6d4; transform:translateY(-2px); box-shadow:0 8px 24px rgba(6,182,212,0.35); }
  .cat-btn:active { transform:translateY(0); }
  .cat-btn:disabled { opacity:0.6;cursor:not-allowed;transform:none; }
  .cat-btn::after { content:'';position:absolute;inset:0;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.15) 50%,transparent 70%);transform:translateX(-100%);transition:transform 0.5s; }
  .cat-btn:hover::after { transform:translateX(100%); }

  .cat-btn-secondary {
    width:100%; padding:11px;
    background:transparent;
    border:2px solid #e9d5ff; border-radius:12px; color:#6d28d9;
    font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;
    letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;
    transition:all 0.2s; margin-top:10px;
  }
  .cat-btn-secondary:hover { border-color:#06b6d4; color:#06b6d4; }

  .cat-spinner { width:15px;height:15px;border-radius:50%;border:2.5px solid rgba(255,255,255,0.3);border-top-color:white;animation:spin 0.7s linear infinite;display:inline-block;vertical-align:middle;margin-right:7px; }

  .cat-link-row { text-align:center;margin-top:16px;font-size:13px;color:#9ca3af; }
  .cat-link { color:#06b6d4;font-weight:700;cursor:pointer;margin-left:4px;transition:color 0.2s; }
  .cat-link:hover { color:#1e0a3c; }

  .reset-step { animation:slideIn 0.35s cubic-bezier(.34,1.4,.64,1) both; }

  .otp-input-row { display:flex; gap:10px; justify-content:center; margin:8px 0; }
  .otp-digit {
    width:46px; height:54px; text-align:center;
    font-size:22px; font-weight:900; font-family:'Nunito',sans-serif; color:#1e0a3c;
    border:2px solid #e9d5ff; border-radius:10px; outline:none;
    background:white; transition:border-color 0.2s, transform 0.15s;
  }
  .otp-digit:focus { border-color:#06b6d4; transform:translateY(-2px); box-shadow:0 4px 14px rgba(6,182,212,0.2); }

  .reset-progress { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:20px; }
  .reset-dot { width:10px;height:10px;border-radius:50%;background:#e9d5ff;transition:all 0.3s; }
  .reset-dot.active { background:#06b6d4; transform:scale(1.3); }
  .reset-dot.done   { background:#1e0a3c; }
  .reset-line { width:28px;height:2px;background:#e9d5ff;transition:background 0.3s; }
  .reset-line.done { background:#1e0a3c; }

  @media(max-width:768px){ .cat-left{display:none;} .cat-right{padding:28px 16px;} }
`

let cssIn = false
function injectCSS() {
  if (cssIn || typeof document === 'undefined') return
  const el = document.createElement('style')
  el.textContent = CSS
  document.head.appendChild(el)
  cssIn = true
}

function Mug({ knocked, showSplash }) {
  return (
    <div style={{ position:'relative' }}>
      {!knocked && (
        <div className="cat-steam">
          <div className="steam-wisp"/><div className="steam-wisp"/><div className="steam-wisp"/>
        </div>
      )}
      <svg width="48" height="56" viewBox="0 0 48 56">
        <path d="M6 12 L10 50 L38 50 L42 12 Z" fill="#f59e0b"/>
        <path d="M8 12 L12 46 L36 46 L40 12 Z" fill="#fde68a"/>
        <path d="M42 20 Q58 20 58 32 Q58 44 42 44" stroke="#d97706" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <rect x="4" y="9" width="40" height="6" rx="3" fill="#d97706"/>
        <ellipse cx="24" cy="14" rx="17" ry="4" fill="#92400e"/>
        <circle cx="18" cy="30" r="2.5" fill="#92400e"/>
        <circle cx="30" cy="30" r="2.5" fill="#92400e"/>
        <path d="M17 37 Q24 43 31 37" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
      {showSplash && [
        {dx:'-20px',dy:'-30px',delay:'0s'},
        {dx:'10px', dy:'-40px',delay:'0.05s'},
        {dx:'30px', dy:'-20px',delay:'0.1s'},
        {dx:'-30px',dy:'-10px',delay:'0.08s'},
        {dx:'20px', dy:'10px', delay:'0.12s'},
      ].map((d,i) => (
        <div key={i} className="splash-drop" style={{'--dx':d.dx,'--dy':d.dy,top:'40%',left:'40%',animationDelay:d.delay}}/>
      ))}
    </div>
  )
}

function Cat({ mood, isPerked, isPawSwiping, eyesClosed }) {
  const bodyClass = { sleeping:'cat-sleeping', awake:'cat-awake', happy:'cat-happy', smug:'cat-smug', error:'cat-shake' }[mood] || 'cat-sleeping'
  const tailClass = mood === 'sleeping' ? 'tail-slow' : 'tail-fast'

  const bubbles = { sleeping:null, awake:'...hm? 👁️', proud:'nice email bestie ✨', hiding:'i see nothing 😴', happy:'YESSS!! 🎉', smug:'oops~ 😏', error:'*destruction mode* 😈', reset:'forgot pawssword? 🐾', otp:'check ur email! 📬', newpass:'almost there! 🔑' }

  const EyeL = () => {
    if (mood==='sleeping'||mood==='hiding') return <path d="M34 54 Q39 50 44 54" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    if (mood==='happy')   return <path d="M34 56 Q39 50 44 56" stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round"/>
    if (mood==='smug')    return <path d="M34 56 Q39 50 44 56" stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round"/>
    return <g className={eyesClosed?'eye-close-cls':'eye-open-cls'}><ellipse cx="39" cy="55" rx="6.5" ry="7" fill="#1c1410"/><ellipse cx="40.5" cy="53" rx="2.2" ry="2.5" fill="white" opacity="0.6"/></g>
  }
  const EyeR = () => {
    if (mood==='sleeping'||mood==='hiding') return <path d="M56 54 Q61 50 66 54" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    if (mood==='happy')   return <path d="M56 56 Q61 50 66 56" stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round"/>
    if (mood==='smug')    return <path d="M56 56 Q61 50 66 56" stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round"/>
    return <g className={eyesClosed?'eye-close-cls':'eye-open-cls'}><ellipse cx="61" cy="55" rx="6.5" ry="7" fill="#1c1410"/><ellipse cx="62.5" cy="53" rx="2.2" ry="2.5" fill="white" opacity="0.6"/></g>
  }
  const Mouth = () => {
    if (mood==='sleeping') return <path d="M47 66 Q50 69 53 66" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round"/>
    if (mood==='happy')    return <><path d="M43 65 Q50 75 57 65" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"/><ellipse cx="50" cy="70" rx="8" ry="5" fill="#fda4af" opacity="0.5"/></>
    if (mood==='smug')     return <path d="M45 66 Q52 73 58 65" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    if (mood==='error')    return <path d="M44 67 Q50 62 56 67" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    return <path d="M46 65 Q50 69 54 65" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round"/>
  }

  return (
    <div style={{ position:'relative', display:'inline-block', userSelect:'none' }}>
      {bubbles[mood] && <div className="cat-bubble" key={mood}>{bubbles[mood]}</div>}
      {mood==='sleeping' && <>
        <div className="z-float" style={{right:-8, top:10, fontSize:14, animationDelay:'0s'}}>z</div>
        <div className="z-float" style={{right:-20,top:-4, fontSize:18, animationDelay:'0.6s'}}>z</div>
        <div className="z-float" style={{right:-34,top:-16,fontSize:22, animationDelay:'1.2s'}}>Z</div>
      </>}
      <svg className={bodyClass} width="160" height="130" viewBox="0 0 130 120">
        <g className={tailClass} style={{transformOrigin:'10px 100px'}}>
          <path d="M15 100 Q-10 85 5 65 Q18 50 10 35" stroke="#f59e0b" strokeWidth="12" fill="none" strokeLinecap="round"/>
          <path d="M15 100 Q-10 85 5 65 Q18 50 10 35" stroke="#fde68a" strokeWidth="5"  fill="none" strokeLinecap="round"/>
          <circle cx="10" cy="33" r="7" fill="#d97706"/>
        </g>
        <ellipse cx="72" cy="100" rx="50" ry="28" fill="#f59e0b"/>
        <ellipse cx="72" cy="100" rx="30" ry="18" fill="#fde68a"/>
        <path d="M50 85 Q58 78 66 85" stroke="#d97706" strokeWidth="2.5" fill="none" opacity="0.5"/>
        <path d="M76 85 Q84 78 92 85" stroke="#d97706" strokeWidth="2.5" fill="none" opacity="0.5"/>
        <g className={isPerked ? 'perked' : ''}>
          <g className="cat-ear-l">
            <path d="M26 52 L20 22 L46 40 Z" fill="#f59e0b"/>
            <path d="M29 50 L25 30 L42 42 Z" fill="#fda4af"/>
          </g>
          <g className="cat-ear-r">
            <path d="M74 52 L80 22 L54 40 Z" fill="#f59e0b"/>
            <path d="M71 50 L75 30 L58 42 Z" fill="#fda4af"/>
          </g>
          <ellipse cx="50" cy="60" rx="32" ry="30" fill="#f59e0b"/>
          <path d="M40 36 Q44 30 48 36" stroke="#d97706" strokeWidth="2" fill="none" opacity="0.5"/>
          <path d="M52 36 Q56 30 60 36" stroke="#d97706" strokeWidth="2" fill="none" opacity="0.5"/>
          <ellipse cx="28" cy="66" rx="9" ry="6" fill="#fda4af" opacity={mood==='sleeping'?0.3:0.55}/>
          <ellipse cx="72" cy="66" rx="9" ry="6" fill="#fda4af" opacity={mood==='sleeping'?0.3:0.55}/>
          <ellipse cx="50" cy="66" rx="14" ry="9" fill="#fde68a"/>
          <path d="M46 61 L50 57 L54 61 L50 63 Z" fill="#f87171"/>
          <line x1="10" y1="62" x2="36" y2="64" stroke="#92400e" strokeWidth="1.5" opacity="0.6"/>
          <line x1="10" y1="67" x2="36" y2="66" stroke="#92400e" strokeWidth="1.5" opacity="0.6"/>
          <line x1="90" y1="62" x2="64" y2="64" stroke="#92400e" strokeWidth="1.5" opacity="0.6"/>
          <line x1="90" y1="67" x2="64" y2="66" stroke="#92400e" strokeWidth="1.5" opacity="0.6"/>
          <EyeL/><EyeR/><Mouth/>
        </g>
        <ellipse cx="38" cy="114" rx="12" ry="7" fill="#fde68a"/>
        <ellipse cx="30" cy="115" rx="6"  ry="5" fill="#f59e0b"/>
        <g className={isPawSwiping?'paw-swipe':''} style={{transformOrigin:'80px 108px'}}>
          <ellipse cx="92" cy="114" rx="12" ry="7" fill="#fde68a"/>
          <ellipse cx="100" cy="115" rx="6" ry="5" fill="#f59e0b"/>
        </g>
        {mood==='happy' && <><text x="100" y="28" fontSize="16">🎉</text><text x="4" y="24" fontSize="14">✨</text></>}
        {mood==='smug'  && <text x="98" y="30" fontSize="14">😏</text>}
        {mood==='error' && <text x="96" y="26" fontSize="14">😈</text>}
      </svg>
    </div>
  )
}

// ── Password Reset Steps ──────────────────────────────────────
function ResetProgress({ step }) {
  return (
    <div className="reset-progress">
      <div className={`reset-dot ${step >= 1 ? 'done' : ''} ${step === 0 ? 'active' : ''}`}/>
      <div className={`reset-line ${step >= 1 ? 'done' : ''}`}/>
      <div className={`reset-dot ${step >= 2 ? 'done' : ''} ${step === 1 ? 'active' : ''}`}/>
      <div className={`reset-line ${step >= 2 ? 'done' : ''}`}/>
      <div className={`reset-dot ${step === 2 ? 'active' : ''}`}/>
    </div>
  )
}

function ForgotPassword({ onBack, onOTPSent }) {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async () => {
    if (!email) return
    setLoading(true); setError('')
    try {
      await axios.post('http://localhost:5000/forgot-password', { email })
      onOTPSent(email)
    } catch {
      setError('No account found with that email 😿')
    } finally { setLoading(false) }
  }

  return (
    <div className="reset-step">
      <ResetProgress step={0} />
      <p style={{fontSize:12,color:'#9ca3af',textAlign:'center',marginBottom:20}}>
        Enter your email and we'll send you an OTP 📬
      </p>
      {error && <div className="cat-err">😾 {error}</div>}
      <div className="cat-field">
        <label className="cat-lbl">Email Address</label>
        <input type="email" className="cat-input" placeholder="student@university.edu"
          value={email} onChange={e => { setError(''); setEmail(e.target.value) }}/>
      </div>
      <div style={{marginTop:8}}>
        <button className="cat-btn" disabled={loading} onClick={handleSubmit}>
          {loading ? <><span className="cat-spinner"/>Sending OTP…</> : 'Send OTP →'}
        </button>
        <button className="cat-btn-secondary" onClick={onBack}>← Back to Login</button>
      </div>
    </div>
  )
}

function VerifyOTP({ email, onVerified, onBack }) {
  const [digits, setDigits]   = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleDigit = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0)
      document.getElementById(`otp-${i-1}`)?.focus()
  }

  const handleSubmit = async () => {
    const otp = digits.join('')
    if (otp.length < 6) { setError('Please enter all 6 digits 🐾'); return }
    setLoading(true); setError('')
    try {
      await axios.post('http://localhost:5000/verify-otp', { email, otp })
      onVerified(otp)
    } catch {
      setError('Invalid or expired OTP 😿')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    try {
      await axios.post('http://localhost:5000/forgot-password', { email })
      setError('')
      setDigits(['','','','','',''])
    } catch { setError('Could not resend OTP 😿') }
  }

  return (
    <div className="reset-step">
      <ResetProgress step={1} />
      <p style={{fontSize:12,color:'#9ca3af',textAlign:'center',marginBottom:4}}>
        OTP sent to <strong style={{color:'#1e0a3c'}}>{email}</strong>
      </p>
      <p style={{fontSize:11,color:'#9ca3af',textAlign:'center',marginBottom:20}}>
        Expires in 10 minutes ⏱️
      </p>
      {error && <div className="cat-err">😾 {error}</div>}
      <div className="otp-input-row">
        {digits.map((d,i) => (
          <input key={i} id={`otp-${i}`} className="otp-digit" maxLength={1}
            value={d} onChange={e => handleDigit(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}/>
        ))}
      </div>
      <div style={{marginTop:20}}>
        <button className="cat-btn" disabled={loading} onClick={handleSubmit}>
          {loading ? <><span className="cat-spinner"/>Verifying…</> : 'Verify OTP →'}
        </button>
        <button className="cat-btn-secondary" onClick={handleResend}>Resend OTP 🔁</button>
        <button className="cat-btn-secondary" onClick={onBack}>← Back</button>
      </div>
    </div>
  )
}

function ResetPassword({ email, otp, onSuccess, onBack }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm]         = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const handleSubmit = async () => {
    if (newPassword.length < 8) { setError('Password must be at least 8 characters 🐾'); return }
    if (newPassword !== confirm) { setError("Passwords don't match 😿"); return }
    setLoading(true); setError('')
    try {
      await axios.post('http://localhost:5000/reset-password', { email, otp, newPassword })
      onSuccess()
    } catch {
      setError('Something went wrong. Please try again 😿')
    } finally { setLoading(false) }
  }

  return (
    <div className="reset-step">
      <ResetProgress step={2} />
      <p style={{fontSize:12,color:'#9ca3af',textAlign:'center',marginBottom:20}}>
        Choose a strong new password 🔑
      </p>
      {error && <div className="cat-err">😾 {error}</div>}
      <div className="cat-field">
        <label className="cat-lbl">New Password</label>
        <input type="password" className="cat-input" placeholder="••••••••"
          value={newPassword} onChange={e => { setError(''); setNewPassword(e.target.value) }}/>
      </div>
      <div className="cat-field">
        <label className="cat-lbl">Confirm Password</label>
        <input type="password" className="cat-input" placeholder="••••••••"
          value={confirm} onChange={e => { setError(''); setConfirm(e.target.value) }}/>
      </div>
      <div style={{marginTop:8}}>
        <button className="cat-btn" disabled={loading} onClick={handleSubmit}>
          {loading ? <><span className="cat-spinner"/>Resetting…</> : 'Reset Password →'}
        </button>
        <button className="cat-btn-secondary" onClick={onBack}>← Back</button>
      </div>
    </div>
  )
}

// ── Main Login ────────────────────────────────────────────────
export default function Login() {
  injectCSS()
  const navigate = useNavigate()

  // login state
  const [inputs,  setInputs]  = useState({ email:'', password:'' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [active,  setActive]  = useState(null)
  const [mugKnocked,   setMugKnocked]   = useState(false)
  const [showSplash,   setShowSplash]   = useState(false)
  const [isPawSwiping, setIsPawSwiping] = useState(false)
  const [catMoodOvr,   setCatMoodOvr]   = useState(null)

  // reset flow state
  // view: 'login' | 'forgot' | 'otp' | 'newpass' | 'resetdone'
  const [view,         setView]         = useState('login')
  const [resetEmail,   setResetEmail]   = useState('')
  const [resetOTP,     setResetOTP]     = useState('')

  // cat mood logic
  const resetMoods = { forgot:'reset', otp:'otp', newpass:'newpass', resetdone:'happy' }
  const baseMood =
    view !== 'login'  ? (resetMoods[view] || 'awake') :
    done              ? 'happy'   :
    error             ? 'smug'    :
    active==='password' && inputs.password.length > 0 ? 'hiding' :
    active==='email'    && inputs.email.length > 2    ? 'proud'  :
    active            ? 'awake'   : 'sleeping'

  const catMood    = catMoodOvr || baseMood
  const isPerked   = view !== 'login' || active !== null || done || !!error
  const eyesClosed = catMood==='sleeping' || catMood==='hiding'

  const handleChange = (e) => {
    setError('')
    setInputs(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const triggerMugKnock = () => {
    setCatMoodOvr('error')
    setIsPawSwiping(true)
    setTimeout(() => { setMugKnocked(true); setShowSplash(true) }, 280)
    setTimeout(() => { setIsPawSwiping(false); setCatMoodOvr('smug') }, 600)
    setTimeout(() => { setShowSplash(false); setMugKnocked(false); setCatMoodOvr(null) }, 2400)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await axios.post(url, inputs)
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setDone(true)
      setTimeout(() => {
        user.verification_status === 'verified' ? navigate('/profile') : navigate('/Verificationstatushandler')
      }, 1800)
    } catch {
      setError("Invalid email or password")
      triggerMugKnock()
    } finally { setLoading(false) }
  }

  const moodLabel = {
    sleeping:' zzz... leave me alone...',
    awake:   '...what do you want',
    proud:   ' ooh that email bestie',
    hiding:  'not looking at ur password',
    happy:   ' WELCOME IN BESTIE!!',
    smug:    'oops~ mug fell hehe',
    error:   '*destruction noises*',
    reset:   'forgot pawssword? 🐾',
    otp:     'check ur email! 📬',
    newpass: 'almost there! 🔑',
  }

  // title per view
  const titles = {
    login:     { eyebrow:'University Marketplace', title:'Welcome Back', sub:'Login to your account' },
    forgot:    { eyebrow:'Password Reset',         title:'Forgot Password', sub:'Step 1 of 3 — enter your email' },
    otp:       { eyebrow:'Password Reset',         title:'Check Your Email', sub:'Step 2 of 3 — enter your OTP' },
    newpass:   { eyebrow:'Password Reset',         title:'New Password', sub:'Step 3 of 3 — set a new password' },
    resetdone: { eyebrow:'All Done!',              title:'Password Reset! 🎉', sub:'You can now log in with your new password' },
  }
  const t = titles[view] || titles.login

  return (
    <div className="cat-root">

      {/* ══ LEFT cozy panel ══ */}
      <div className="cat-left">
        <div className="cat-window">
          <div className="cat-window-cross-h"/>
          <div className="cat-window-cross-v"/>
          <div className="cat-sun"/>
        </div>

        <div className="cat-shelf"/>
        {[
          {left:'18%',w:18,h:38,color:'#ef4444'},{left:'26%',w:14,h:30,color:'#3b82f6'},
          {left:'33%',w:20,h:44,color:'#8b5cf6'},{left:'42%',w:16,h:34,color:'#10b981'},
          {left:'50%',w:12,h:28,color:'#f59e0b'},{left:'58%',w:22,h:42,color:'#ec4899'},
          {left:'68%',w:15,h:32,color:'#06b6d4'},
        ].map((b,i) => <div key={i} className="cat-book" style={{left:b.left,width:b.w,height:b.h,background:b.color,bottom:152,borderRadius:'3px 3px 0 0',opacity:0.85}}/>)}

        <div style={{position:'absolute',bottom:60,left:'50%',transform:'translateX(-50%)',width:220,height:18,background:'linear-gradient(180deg,#d97706,#b45309)',borderRadius:4,boxShadow:'0 4px 12px rgba(120,53,15,0.3)'}}/>
        <div style={{position:'absolute',bottom:42,left:'calc(50% - 80px)',width:14,height:24,background:'#b45309',borderRadius:'0 0 4px 4px'}}/>
        <div style={{position:'absolute',bottom:42,left:'calc(50% + 66px)',width:14,height:24,background:'#b45309',borderRadius:'0 0 4px 4px'}}/>

        <div className={`cat-mug-wrap${mugKnocked?' knocked':''}`}>
          <Mug knocked={mugKnocked} showSplash={showSplash}/>
        </div>

        <div style={{position:'absolute',bottom:72,left:'50%',transform:'translateX(-62%)',zIndex:5}}>
          <Cat mood={catMood} isPerked={isPerked} isPawSwiping={isPawSwiping} eyesClosed={eyesClosed}/>
        </div>

        <p className="cat-label" key={catMood}>{moodLabel[catMood]||moodLabel.sleeping}</p>

        <svg className="cat-floor" height="62" viewBox="0 0 400 62" preserveAspectRatio="none">
          <rect y="42" width="400" height="20" fill="#fde68a" opacity="0.4"/>
          <rect y="50" width="400" height="12" fill="#d97706" opacity="0.25"/>
          {[0,80,160,240,320].map(x=>(
            <rect key={x} x={x+2} y="42" width="76" height="20" rx="1" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.2"/>
          ))}
        </svg>
      </div>

      {/* ══ RIGHT ══ */}
      <div className="cat-right">
        <div className="cat-form-wrap">

          <div className="cat-header" key={view}>
            <p className="cat-eyebrow">{t.eyebrow}</p>
            <h1 className="cat-title">{t.title}</h1>
            <div className="cat-bar"/>
            <p className="cat-sub" style={{marginTop:8}}>{t.sub}</p>
          </div>

          <div className="cat-card">

            {/* ── LOGIN VIEW ── */}
            {view === 'login' && (
              <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:4}}>
                {error && <div className="cat-err">😾 {error}</div>}
                <div className="cat-field">
                  <label className="cat-lbl">Email</label>
                  <input type="email" name="email" placeholder="student@university.edu"
                    className="cat-input" onChange={handleChange} required
                    onFocus={()=>setActive('email')} onBlur={()=>setActive(null)}/>
                </div>
                <div className="cat-field">
                  <label className="cat-lbl">Password</label>
                  <input type="password" name="password" placeholder="••••••••"
                    className="cat-input" onChange={handleChange} required
                    onFocus={()=>setActive('password')} onBlur={()=>setActive(null)}/>
                </div>
                {/* Forgot password link */}
                <div style={{textAlign:'right',marginTop:-8,marginBottom:8}}>
                  <span className="cat-link" style={{fontSize:12}}
                    onClick={() => setView('forgot')}>
                    Forgot password? 🐾
                  </span>
                </div>
                <div className="cat-field" style={{marginBottom:0,marginTop:4}}>
                  <button type="submit" disabled={loading} className="cat-btn">
                    {loading ? <><span className="cat-spinner"/>Logging in…</> : done ? ' Redirecting…' : 'Login →'}
                  </button>
                </div>
              </form>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {view === 'forgot' && (
              <ForgotPassword
                onBack={() => setView('login')}
                onOTPSent={(email) => { setResetEmail(email); setView('otp') }}
              />
            )}

            {/* ── VERIFY OTP ── */}
            {view === 'otp' && (
              <VerifyOTP
                email={resetEmail}
                onVerified={(otp) => { setResetOTP(otp); setView('newpass') }}
                onBack={() => setView('forgot')}
              />
            )}

            {/* ── NEW PASSWORD ── */}
            {view === 'newpass' && (
              <ResetPassword
                email={resetEmail}
                otp={resetOTP}
                onSuccess={() => setView('resetdone')}
                onBack={() => setView('otp')}
              />
            )}

            {/* ── RESET DONE ── */}
            {view === 'resetdone' && (
              <div className="reset-step" style={{textAlign:'center'}}>
                <div style={{fontSize:48,marginBottom:12}}>🎉</div>
                <div className="cat-success">
                  Password reset successfully! You can now log in with your new password.
                </div>
                <button className="cat-btn" onClick={() => setView('login')}>
                  Go to Login →
                </button>
              </div>
            )}

          </div>

          {view === 'login' && (
            <div className="cat-link-row">
              Don't have an account?
              <span className="cat-link" onClick={()=>navigate('/register')}>Register here</span>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}