import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const url = "http://localhost:5000/Users/login"

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);} }
  @keyframes fadeDown  { from{opacity:0;transform:translateY(-16px);}to{opacity:1;transform:translateY(0);} }
  @keyframes barGrow   { from{width:0;}to{width:4rem;} }
  @keyframes spin      { to{transform:rotate(360deg);} }
  @keyframes shake     { 0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-8px);}40%,80%{transform:translateX(8px);} }
  @keyframes slideIn   { from{opacity:0;transform:translateX(30px);}to{opacity:1;transform:translateX(0);} }
  @keyframes floatUp   { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-18px);} }
  @keyframes floatUpB  { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-12px);} }
  @keyframes rotateSlow{ from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
  @keyframes rotateSlowR{ from{transform:rotate(0deg);} to{transform:rotate(-360deg);} }
  @keyframes pulseGlow { 0%,100%{opacity:0.5;transform:scale(1);} 50%{opacity:0.8;transform:scale(1.05);} }
  @keyframes shimmer   { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
  @keyframes cardIn    { from{opacity:0;transform:translateY(40px) scale(0.96);} to{opacity:1;transform:translateY(0) scale(1);} }
  @keyframes dotPulse  { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.4);opacity:0.7;} }

  /* ── Full page ── */
  .lp-root {
    min-height:100vh; width:100%;
    display:flex; align-items:center; justify-content:center;
    font-family:'DM Sans',sans-serif;
    background: radial-gradient(ellipse at 20% 50%, #3b0764 0%, #1e0a3c 40%, #0f0520 100%);
    overflow:hidden; position:relative;
  }

  /* ── Floating decorative orbs ── */
  .lp-orb {
    position:absolute; border-radius:50%;
    pointer-events:none; z-index:0;
  }
  .lp-orb-1 {
    width:500px; height:500px;
    background:radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
    top:-100px; left:-100px;
    animation:pulseGlow 6s ease-in-out infinite;
  }
  .lp-orb-2 {
    width:400px; height:400px;
    background:radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%);
    bottom:-80px; right:-80px;
    animation:pulseGlow 8s ease-in-out infinite 2s;
  }
  .lp-orb-3 {
    width:250px; height:250px;
    background:radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%);
    top:40%; left:5%;
    animation:pulseGlow 5s ease-in-out infinite 1s;
  }
  .lp-orb-4 {
    width:180px; height:180px;
    background:radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%);
    top:10%; right:8%;
    animation:pulseGlow 7s ease-in-out infinite 3s;
  }

  /* ── Floating geometric shapes ── */
  .lp-shape {
    position:absolute; pointer-events:none; z-index:0; opacity:0.12;
  }
  .lp-ring-1 {
    width:300px; height:300px; border-radius:50%;
    border:1.5px solid rgba(139,92,246,0.6);
    top:5%; left:3%;
    animation:rotateSlow 25s linear infinite;
  }
  .lp-ring-2 {
    width:200px; height:200px; border-radius:50%;
    border:1px solid rgba(6,182,212,0.5);
    bottom:8%; right:5%;
    animation:rotateSlowR 20s linear infinite;
  }
  .lp-ring-3 {
    width:120px; height:120px; border-radius:50%;
    border:1px solid rgba(167,139,250,0.4);
    top:15%; right:15%;
    animation:rotateSlow 15s linear infinite;
  }
  .lp-ring-4 {
    width:80px; height:80px; border-radius:50%;
    border:1px solid rgba(6,182,212,0.4);
    bottom:25%; left:8%;
    animation:rotateSlowR 12s linear infinite;
  }

  /* ── Floating particles ── */
  .lp-particle {
    position:absolute; border-radius:50%;
    background:rgba(167,139,250,0.4);
    pointer-events:none; z-index:0;
  }

  /* ── Floating stat cards ── */
  .lp-stat-card {
    position:absolute; z-index:1;
    background:rgba(255,255,255,0.05);
    backdrop-filter:blur(16px);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:16px; padding:16px 20px;
    color:white; text-align:center;
    pointer-events:none;
  }
  .lp-stat-card-1 {
    top:12%; left:4%;
    animation:floatUp 6s ease-in-out infinite;
  }
  .lp-stat-card-2 {
    bottom:18%; left:3%;
    animation:floatUpB 7s ease-in-out infinite 1s;
  }
  .lp-stat-card-3 {
    top:15%; right:4%;
    animation:floatUp 5s ease-in-out infinite 2s;
  }
  .lp-stat-card-4 {
    bottom:15%; right:3%;
    animation:floatUpB 8s ease-in-out infinite 0.5s;
  }
  .lp-stat-num {
    font-family:'Nunito',sans-serif;
    font-size:22px; font-weight:900;
    background:linear-gradient(135deg,#a78bfa,#06b6d4);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
  }
  .lp-stat-label {
    font-size:10px; color:rgba(255,255,255,0.5);
    text-transform:uppercase; letter-spacing:0.1em; margin-top:2px;
  }
  .lp-stat-icon { font-size:18px; margin-bottom:4px; }

  /* ── Floating feature pills ── */
  .lp-pill {
    position:absolute; z-index:1;
    background:rgba(255,255,255,0.06);
    backdrop-filter:blur(12px);
    border:1px solid rgba(139,92,246,0.2);
    border-radius:999px; padding:8px 16px;
    font-size:12px; color:rgba(255,255,255,0.6);
    white-space:nowrap; pointer-events:none;
    display:flex; align-items:center; gap:6px;
  }
  .lp-pill-dot { width:6px; height:6px; border-radius:50%; background:#a78bfa; animation:dotPulse 2s ease-in-out infinite; }
  .lp-pill-1 { top:30%; left:2%; animation:floatUpB 9s ease-in-out infinite; }
  .lp-pill-2 { top:55%; left:1%; animation:floatUp 7s ease-in-out infinite 1.5s; }
  .lp-pill-3 { top:25%; right:2%; animation:floatUpB 8s ease-in-out infinite 0.5s; }
  .lp-pill-4 { top:50%; right:1%; animation:floatUp 6s ease-in-out infinite 2s; }
  .lp-pill-5 { bottom:35%; left:2%; animation:floatUpB 10s ease-in-out infinite 1s; }

  /* ── Brand top center ── */
  .lp-brand {
    position:absolute; top:28px; left:50%; transform:translateX(-50%);
    z-index:2; display:flex; align-items:center; gap:10px;
  }
  .lp-brand-icon {
    width:36px; height:36px; border-radius:10px;
    background:linear-gradient(135deg,#7c3aed,#06b6d4);
    display:flex; align-items:center; justify-content:center; font-size:18px;
  }
  .lp-brand-name {
    font-family:'Nunito',sans-serif; font-size:18px; font-weight:900;
    color:white; letter-spacing:-0.02em;
  }

  /* ── Main login card ── */
  .lp-card {
    position:relative; z-index:2;
    background:rgba(255,255,255,0.97);
    border-radius:24px; padding:40px 40px 36px;
    width:100%; max-width:420px;
    box-shadow:
      0 0 0 1px rgba(139,92,246,0.15),
      0 32px 80px rgba(0,0,0,0.4),
      0 0 60px rgba(139,92,246,0.12);
    animation:cardIn 0.7s cubic-bezier(.34,1.4,.64,1) both;
  }

  .lp-card-header { text-align:center; margin-bottom:28px; animation:fadeDown 0.5s ease both; }
  .lp-eyebrow {
    font-size:11px; font-weight:700; letter-spacing:0.14em;
    text-transform:uppercase; color:#06b6d4; margin-bottom:6px;
  }
  .lp-title {
    font-family:'Nunito',sans-serif; font-size:30px; font-weight:900;
    color:#1e0a3c; line-height:1.1;
  }
  .lp-bar {
    height:3px; width:0; background:linear-gradient(90deg,#7c3aed,#06b6d4);
    border-radius:99px; margin:8px auto 0;
    animation:barGrow 0.7s ease 0.4s both;
  }
  .lp-sub { font-size:13px; color:#9ca3af; margin-top:6px; }

  .lp-field { margin-bottom:18px; animation:fadeUp 0.4s ease both; }
  .lp-field:nth-child(1){animation-delay:0.15s;}
  .lp-field:nth-child(2){animation-delay:0.25s;}
  .lp-field:nth-child(3){animation-delay:0.35s;}

  .lp-lbl {
    display:block; font-size:10px; font-weight:700;
    letter-spacing:0.1em; text-transform:uppercase;
    color:#1e0a3c; margin-bottom:6px;
  }
  .lp-input-wrap { position:relative; }
  .lp-input {
    width:100%; padding:11px 14px 11px 40px;
    background:#f8f7ff;
    border:1.5px solid #e9d5ff; border-radius:10px;
    font-size:14px; font-family:'DM Sans',sans-serif; color:#1e0a3c;
    outline:none; transition:all 0.2s;
  }
  .lp-input::placeholder { color:#c4b5fd; }
  .lp-input:focus { border-color:#7c3aed; background:white; box-shadow:0 0 0 3px rgba(124,58,237,0.08); }
  .lp-input-icon {
    position:absolute; left:12px; top:50%; transform:translateY(-50%);
    font-size:15px; pointer-events:none;
  }

  .lp-err {
    background:#fef2f2; border:1px solid #fecaca; border-radius:10px;
    padding:10px 14px; color:#dc2626; font-size:13px;
    animation:shake 0.5s ease both; margin-bottom:14px;
    display:flex; align-items:center; gap:8px;
  }
  .lp-success {
    background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px;
    padding:10px 14px; color:#16a34a; font-size:13px;
    margin-bottom:14px; animation:fadeUp 0.3s ease both;
    display:flex; align-items:center; gap:8px;
  }

  .lp-forgot {
    text-align:right; margin-top:-8px; margin-bottom:12px;
  }
  .lp-forgot-link {
    font-size:12px; color:#7c3aed; font-weight:600; cursor:pointer;
    transition:color 0.2s;
  }
  .lp-forgot-link:hover { color:#06b6d4; }

  .lp-btn {
    width:100%; padding:13px;
    background:linear-gradient(135deg,#1e0a3c,#3b0764);
    border:none; border-radius:12px; color:white;
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700;
    letter-spacing:0.1em; text-transform:uppercase; cursor:pointer;
    transition:all 0.3s; position:relative; overflow:hidden;
    box-shadow:0 4px 20px rgba(124,58,237,0.3);
  }
  .lp-btn:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(124,58,237,0.4); background:linear-gradient(135deg,#3b0764,#06b6d4); }
  .lp-btn:active { transform:translateY(0); }
  .lp-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
  .lp-btn::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.12) 50%,transparent 70%);
    transform:translateX(-100%); transition:transform 0.5s;
  }
  .lp-btn:hover::after { transform:translateX(100%); }

  .lp-btn-secondary {
    width:100%; padding:11px; margin-top:10px;
    background:transparent; border:1.5px solid #e9d5ff;
    border-radius:12px; color:#7c3aed;
    font-family:'DM Sans',sans-serif; font-size:12px; font-weight:700;
    letter-spacing:0.08em; text-transform:uppercase; cursor:pointer;
    transition:all 0.2s;
  }
  .lp-btn-secondary:hover { border-color:#7c3aed; background:#f8f7ff; }

  .lp-spinner {
    width:14px; height:14px; border-radius:50%;
    border:2px solid rgba(255,255,255,0.3); border-top-color:white;
    animation:spin 0.7s linear infinite;
    display:inline-block; vertical-align:middle; margin-right:7px;
  }

  .lp-divider {
    display:flex; align-items:center; gap:12px; margin:16px 0;
  }
  .lp-divider-line { flex:1; height:1px; background:#f0e9ff; }
  .lp-divider-text { font-size:11px; color:#c4b5fd; font-weight:600; letter-spacing:0.06em; }

  .lp-link-row { text-align:center; margin-top:16px; font-size:13px; color:#9ca3af; }
  .lp-link { color:#7c3aed; font-weight:700; cursor:pointer; margin-left:4px; transition:color 0.2s; }
  .lp-link:hover { color:#06b6d4; }

  /* Reset flow */
  .reset-step { animation:slideIn 0.35s cubic-bezier(.34,1.4,.64,1) both; }
  .reset-progress { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:20px; }
  .reset-dot { width:10px; height:10px; border-radius:50%; background:#e9d5ff; transition:all 0.3s; }
  .reset-dot.active { background:#7c3aed; transform:scale(1.3); }
  .reset-dot.done   { background:#1e0a3c; }
  .reset-line { width:28px; height:2px; background:#e9d5ff; transition:background 0.3s; }
  .reset-line.done  { background:#1e0a3c; }

  .otp-input-row { display:flex; gap:10px; justify-content:center; margin:8px 0; }
  .otp-digit {
    width:46px; height:54px; text-align:center;
    font-size:22px; font-weight:900;
    font-family:'Nunito',sans-serif; color:#1e0a3c;
    border:1.5px solid #e9d5ff; border-radius:10px; outline:none;
    background:#f8f7ff; transition:all 0.2s;
  }
  .otp-digit:focus { border-color:#7c3aed; background:white; transform:translateY(-2px); box-shadow:0 4px 14px rgba(124,58,237,0.15); }

  @media(max-width:600px){
    .lp-stat-card,.lp-pill { display:none; }
    .lp-card { margin:20px; padding:28px 24px; }
  }
`

let cssIn = false
function injectCSS() {
  if (cssIn || typeof document === 'undefined') return
  const el = document.createElement('style')
  el.textContent = CSS
  document.head.appendChild(el)
  cssIn = true
}

// Floating particles
function Particles() {
  const particles = [
    {w:4,h:4,top:'20%',left:'15%',delay:'0s',dur:'4s'},
    {w:3,h:3,top:'70%',left:'10%',delay:'1s',dur:'5s'},
    {w:5,h:5,top:'40%',left:'85%',delay:'2s',dur:'6s'},
    {w:3,h:3,top:'80%',left:'80%',delay:'0.5s',dur:'4.5s'},
    {w:4,h:4,top:'15%',left:'70%',delay:'1.5s',dur:'5.5s'},
    {w:3,h:3,top:'60%',left:'20%',delay:'2.5s',dur:'4s'},
    {w:5,h:5,top:'35%',left:'92%',delay:'0.8s',dur:'6s'},
    {w:3,h:3,top:'88%',left:'40%',delay:'1.2s',dur:'5s'},
    {w:4,h:4,top:'8%',left:'45%',delay:'3s',dur:'4.5s'},
    {w:3,h:3,top:'50%',left:'95%',delay:'1.8s',dur:'5.5s'},
  ]
  return <>
    {particles.map((p,i) => (
      <div key={i} className="lp-particle" style={{
        width:p.w, height:p.h, top:p.top, left:p.left,
        animation:`floatUp ${p.dur} ease-in-out infinite`,
        animationDelay:p.delay,
        opacity:0.3 + (i%3)*0.1,
      }}/>
    ))}
  </>
}

function ResetProgress({ step }) {
  return (
    <div className="reset-progress">
      <div className={`reset-dot ${step>=1?'done':''} ${step===0?'active':''}`}/>
      <div className={`reset-line ${step>=1?'done':''}`}/>
      <div className={`reset-dot ${step>=2?'done':''} ${step===1?'active':''}`}/>
      <div className={`reset-line ${step>=2?'done':''}`}/>
      <div className={`reset-dot ${step===2?'active':''}`}/>
    </div>
  )
}

function ForgotPassword({ onBack, onOTPSent }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email) return
    setLoading(true); setError('')
    try {
      await axios.post('http://localhost:5000/forgot-password', { email })
      onOTPSent(email)
    } catch { setError('No account found with that email.') }
    finally { setLoading(false) }
  }

  return (
    <div className="reset-step">
      <ResetProgress step={0}/>
      <p style={{fontSize:12,color:'#9ca3af',textAlign:'center',marginBottom:20}}>
        Enter your email and we'll send you an OTP
      </p>
      {error && <div className="lp-err">{error}</div>}
      <div className="lp-field">
        <label className="lp-lbl">Email Address</label>
        <div className="lp-input-wrap">
          <span className="lp-input-icon"></span>
          <input type="email" className="lp-input" placeholder="student@university.edu"
            value={email} onChange={e => { setError(''); setEmail(e.target.value) }}/>
        </div>
      </div>
      <button className="lp-btn" disabled={loading} onClick={handleSubmit}>
        {loading ? <><span className="lp-spinner"/>Sending OTP…</> : 'Send OTP →'}
      </button>
      <button className="lp-btn-secondary" onClick={onBack}>← Back to Login</button>
    </div>
  )
}

function VerifyOTP({ email, onVerified, onBack }) {
  const [digits, setDigits] = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDigit = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]; next[i] = val; setDigits(next)
    if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus()
  }
  const handleKeyDown = (i, e) => {
    if (e.key==='Backspace' && !digits[i] && i>0) document.getElementById(`otp-${i-1}`)?.focus()
  }
  const handleSubmit = async () => {
    const otp = digits.join('')
    if (otp.length < 6) { setError('Please enter all 6 digits'); return }
    setLoading(true); setError('')
    try {
      await axios.post('http://localhost:5000/verify-otp', { email, otp })
      onVerified(otp)
    } catch { setError('Invalid or expired OTP') } finally { setLoading(false) }
  }
  const handleResend = async () => {
    try { await axios.post('http://localhost:5000/forgot-password', { email }); setError(''); setDigits(['','','','','','']) }
    catch { setError('Could not resend OTP') }
  }

  return (
    <div className="reset-step">
      <ResetProgress step={1}/>
      <p style={{fontSize:12,color:'#9ca3af',textAlign:'center',marginBottom:4}}>
        OTP sent to <strong style={{color:'#1e0a3c'}}>{email}</strong>
      </p>
      <p style={{fontSize:11,color:'#9ca3af',textAlign:'center',marginBottom:20}}>Expires in 10 minutes </p>
      {error && <div className="lp-err">{error}</div>}
      <div className="otp-input-row">
        {digits.map((d,i) => (
          <input key={i} id={`otp-${i}`} className="otp-digit" maxLength={1}
            value={d} onChange={e=>handleDigit(i,e.target.value)}
            onKeyDown={e=>handleKeyDown(i,e)}/>
        ))}
      </div>
      <div style={{marginTop:20}}>
        <button className="lp-btn" disabled={loading} onClick={handleSubmit}>
          {loading ? <><span className="lp-spinner"/>Verifying…</> : 'Verify OTP →'}
        </button>
        <button className="lp-btn-secondary" onClick={handleResend}>Resend OTP </button>
        <button className="lp-btn-secondary" onClick={onBack}>← Back</button>
      </div>
    </div>
  )
}

function ResetPassword({ email, otp, onSuccess, onBack }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    if (newPassword !== confirm) { setError("Passwords don't match"); return }
    setLoading(true); setError('')
    try {
      await axios.post('http://localhost:5000/reset-password', { email, otp, newPassword })
      onSuccess()
    } catch { setError('Something went wrong. Please try again') } finally { setLoading(false) }
  }

  return (
    <div className="reset-step">
      <ResetProgress step={2}/>
      <p style={{fontSize:12,color:'#9ca3af',textAlign:'center',marginBottom:20}}>Choose a strong new password 🔑</p>
      {error && <div className="lp-err">{error}</div>}
      <div className="lp-field">
        <label className="lp-lbl">New Password</label>
        <div className="lp-input-wrap">
          <span className="lp-input-icon">🔒</span>
          <input type="password" className="lp-input" placeholder="••••••••"
            value={newPassword} onChange={e=>{ setError(''); setNewPassword(e.target.value) }}/>
        </div>
      </div>
      <div className="lp-field">
        <label className="lp-lbl">Confirm Password</label>
        <div className="lp-input-wrap">
          <span className="lp-input-icon">🔒</span>
          <input type="password" className="lp-input" placeholder="••••••••"
            value={confirm} onChange={e=>{ setError(''); setConfirm(e.target.value) }}/>
        </div>
      </div>
      <button className="lp-btn" disabled={loading} onClick={handleSubmit}>
        {loading ? <><span className="lp-spinner"/>Resetting…</> : 'Reset Password →'}
      </button>
      <button className="lp-btn-secondary" onClick={onBack}>← Back</button>
    </div>
  )
}

export default function Login() {
  injectCSS()
  const navigate = useNavigate()
  const [inputs,  setInputs]  = useState({ email:'', password:'' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [view,    setView]    = useState('login')
  const [resetEmail, setResetEmail] = useState('')
  const [resetOTP,   setResetOTP]   = useState('')
  const [mousePos,   setMousePos]   = useState({ x: 50, y: 50 })

  // Subtle mouse parallax on orbs
  useEffect(() => {
    const handler = e => setMousePos({ x: (e.clientX/window.innerWidth)*100, y: (e.clientY/window.innerHeight)*100 })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  const handleChange = e => { setError(''); setInputs(p=>({...p,[e.target.name]:e.target.value})) }

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
      }, 1500)
    } catch { setError("Invalid email or password") }
    finally { setLoading(false) }
  }

  const titles = {
    login:     { eyebrow:'University Marketplace', title:'Welcome Back',       sub:'Sign in to your account' },
    forgot:    { eyebrow:'Password Reset',         title:'Forgot Password',    sub:'Step 1 of 3 — enter your email' },
    otp:       { eyebrow:'Password Reset',         title:'Check Your Email',   sub:'Step 2 of 3 — enter your OTP' },
    newpass:   { eyebrow:'Password Reset',         title:'New Password',       sub:'Step 3 of 3 — set a new password' },
    resetdone: { eyebrow:'All Done!',              title:'Password Reset! ', sub:'You can now log in with your new password' },
  }
  const t = titles[view] || titles.login

  return (
    <div className="lp-root">

      {/* Animated background orbs with mouse parallax */}
      <div className="lp-orb lp-orb-1" style={{transform:`translate(${mousePos.x*0.02}px, ${mousePos.y*0.02}px)`}}/>
      <div className="lp-orb lp-orb-2" style={{transform:`translate(${-mousePos.x*0.015}px, ${-mousePos.y*0.015}px)`}}/>
      <div className="lp-orb lp-orb-3" style={{transform:`translate(${mousePos.x*0.01}px, ${mousePos.y*0.01}px)`}}/>
      <div className="lp-orb lp-orb-4" style={{transform:`translate(${-mousePos.x*0.02}px, ${mousePos.y*0.02}px)`}}/>

      {/* Rotating rings */}
      <div className="lp-shape lp-ring-1"/>
      <div className="lp-shape lp-ring-2"/>
      <div className="lp-shape lp-ring-3"/>
      <div className="lp-shape lp-ring-4"/>

      {/* Floating particles */}
      <Particles/>

      {/* Brand top center */}
      <div className="lp-brand">

        <div className="lp-brand-name">University Marketplace</div>
      </div>

      {/* Floating stat cards */}
      <div className="lp-stat-card lp-stat-card-1">
        <div className="lp-stat-icon"></div>
        <div className="lp-stat-num">500+</div>
        <div className="lp-stat-label">Students</div>
      </div>
      <div className="lp-stat-card lp-stat-card-2">
        <div className="lp-stat-icon"></div>
        <div className="lp-stat-num">50+</div>
        <div className="lp-stat-label">Universities</div>
      </div>
      <div className="lp-stat-card lp-stat-card-3">
        <div className="lp-stat-icon"></div>
        <div className="lp-stat-num">200+</div>
        <div className="lp-stat-label">Services</div>
      </div>
      <div className="lp-stat-card lp-stat-card-4">
        <div className="lp-stat-icon">⭐</div>
        <div className="lp-stat-num">4.9</div>
        <div className="lp-stat-label">Rating</div>
      </div>

      {/* Floating feature pills */}
      <div className="lp-pill lp-pill-1"><div className="lp-pill-dot"/>Secure Payments</div>
      <div className="lp-pill lp-pill-2"><div className="lp-pill-dot"/>Verified Students</div>
      <div className="lp-pill lp-pill-3"><div className="lp-pill-dot"/>Real-time Chat</div>
      <div className="lp-pill lp-pill-4"><div className="lp-pill-dot"/>Campus Services</div>
      <div className="lp-pill lp-pill-5"><div className="lp-pill-dot"/>Free to Join</div>

      {/* ── Centered login card ── */}
      <div className="lp-card">

        <div className="lp-card-header" key={view}>
          <p className="lp-eyebrow">{t.eyebrow}</p>
          <h1 className="lp-title">{t.title}</h1>
          <div className="lp-bar"/>
          <p className="lp-sub" style={{marginTop:6}}>{t.sub}</p>
        </div>

        {/* Login view */}
        {view === 'login' && (
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column'}}>
            {error && <div className="lp-err">{error}</div>}
            {done  && <div className="lp-success">Login successful! Redirecting…</div>}

            <div className="lp-field">
              <label className="lp-lbl">Email</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon"></span>
                <input type="email" name="email" placeholder="student@university.edu"
                  className="lp-input" onChange={handleChange} required/>
              </div>
            </div>

            <div className="lp-field">
              <label className="lp-lbl">Password</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon"></span>
                <input type="password" name="password" placeholder="••••••••"
                  className="lp-input" onChange={handleChange} required/>
              </div>
            </div>

            <div className="lp-forgot">
              <span className="lp-forgot-link" onClick={() => setView('forgot')}>
                Forgot password?
              </span>
            </div>

            <button type="submit" disabled={loading || done} className="lp-btn">
              {loading ? <><span className="lp-spinner"/>Signing in…</> : done ? 'Redirecting…' : 'Login →'}
            </button>
          </form>
        )}

        {view === 'forgot' && (
          <ForgotPassword onBack={() => setView('login')} onOTPSent={email => { setResetEmail(email); setView('otp') }}/>
        )}
        {view === 'otp' && (
          <VerifyOTP email={resetEmail} onVerified={otp => { setResetOTP(otp); setView('newpass') }} onBack={() => setView('forgot')}/>
        )}
        {view === 'newpass' && (
          <ResetPassword email={resetEmail} otp={resetOTP} onSuccess={() => setView('resetdone')} onBack={() => setView('otp')}/>
        )}
        {view === 'resetdone' && (
          <div className="reset-step" style={{textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:12}}></div>
            <div className="lp-success">Password reset successfully! You can now log in.</div>
            <button className="lp-btn" onClick={() => setView('login')}>Go to Login →</button>
          </div>
        )}

        {view === 'login' && (
          <>
            <div className="lp-divider">
              <div className="lp-divider-line"/>
              <div className="lp-divider-text">OR</div>
              <div className="lp-divider-line"/>
            </div>
            <div className="lp-link-row">
              Don't have an account?
              <span className="lp-link" onClick={() => navigate('/register')}>Register here</span>
            </div>
          </>
        )}
      </div>

    </div>
  )
}