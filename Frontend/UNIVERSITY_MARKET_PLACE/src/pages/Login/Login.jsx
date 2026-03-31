import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = "http://localhost:5001"

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

* { box-sizing:border-box; margin:0; padding:0; }

.lp-root {
  min-height:100vh;
  display:flex;
  background:#059669;
  font-family:'DM Sans',sans-serif;
}

.lp-card { flex:1; display:flex; }

.lp-left {
  flex:1;
  background:linear-gradient(135deg,#e6faf4,#ebf5f2);
  display:flex;
  align-items:center;
  justify-content:center;
}

.lp-left-content { color:black; max-width:320px; }

.lp-left-content h1 {
  font-family:'Nunito';
  font-size:32px;
  font-weight:900;
  margin-bottom:10px;
}

.lp-right {
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  background:white;
}

.lp-form-box {
  width:100%;
  max-width:420px;
  border:2px solid #059669;
  border-radius:14px;
  padding:40px 30px;
}

.lp-login-title {
  text-align:center;
  font-size:34px;
  font-weight:900;
  margin-bottom:25px;
}

.lp-field { margin-bottom:18px; }

.lp-input {
  width:100%;
  padding:12px;
  border-radius:10px;
  border:1px solid #e5e7eb;
  background:#f9fafb;
}

.lp-input:focus {
  border-color:#059669;
  outline:none;
}

.lp-btn {
  width:100%;
  padding:14px;
  border:none;
  border-radius:10px;
  background:#059669;
  color:white;
  font-weight:700;
  cursor:pointer;
}

.lp-btn:hover { background:#047857; }

.lp-center { text-align:center; margin-top:15px; }

.lp-link {
  color:#059669;
  cursor:pointer;
  font-weight:600;
}
`

let cssIn = false
function injectCSS() {
  if (cssIn || typeof document === 'undefined') return
  const style = document.createElement('style')
  style.textContent = CSS
  document.head.appendChild(style)
  cssIn = true
}

/* ---------------- FORGOT PASSWORD COMPONENTS ---------------- */

function ForgotPassword({ onBack, onOTPSent }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    await axios.post(`${API}/forgot-password`, { email })
    setLoading(false)
    onOTPSent(email)
  }

  return (
    <>
      <input
        className="lp-input"
        placeholder="Enter your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <button className="lp-btn" onClick={submit}>
        {loading ? 'Sending...' : 'Send Code'}
      </button>

      <div className="lp-center">
        <span className="lp-link" onClick={onBack}>Back</span>
      </div>
    </>
  )
}

function VerifyOTP({ email, onVerified, onBack }) {
  const [otp, setOtp] = useState('')

  const submit = async () => {
    await axios.post(`${API}/verify-otp`, { email, otp })
    onVerified(otp)
  }

  return (
    <>
      <input
        className="lp-input"
        placeholder="Enter OTP"
        value={otp}
        onChange={e => setOtp(e.target.value)}
      />

      <button className="lp-btn" onClick={submit}>Verify</button>

      <div className="lp-center">
        <span className="lp-link" onClick={onBack}>Back</span>
      </div>
    </>
  )
}

function ResetPassword({ email, otp, onSuccess, onBack }) {
  const [password, setPassword] = useState('')

  const submit = async () => {
    await axios.post(`${API}/reset-password`, {
      email,
      otp,
      newPassword: password
    })
    onSuccess()
  }

  return (
    <>
      <input
        className="lp-input"
        placeholder="New Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button className="lp-btn" onClick={submit}>Update Password</button>

      <div className="lp-center">
        <span className="lp-link" onClick={onBack}>Back</span>
      </div>
    </>
  )
}

/* ---------------- MAIN LOGIN ---------------- */

export default function Login() {
  injectCSS()

  const navigate = useNavigate()

  const [inputs, setInputs] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState('login')
  const [resetEmail, setResetEmail] = useState('')
  const [resetOTP, setResetOTP] = useState('')

  const handleChange = e => {
    setInputs({ ...inputs, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await axios.post(`${API}/Users/login`, inputs)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/home')
    } catch (err) {
      console.error("Login Error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Network error or invalid email/password');
      }
    }

    setLoading(false)
  }

  return (
    <div className="lp-root">
      <div className="lp-card">

        {/* LEFT */}
        <div className="lp-left">
          <div className="lp-left-content">
            <h1>Earn while you are studying</h1>
            <p>Turn your skills into income while balancing university life.</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lp-right">
          <div className="lp-form-box">

            {view === 'login' && (
              <>
                <h2 className="lp-login-title">LOGIN</h2>

                {error && <p style={{color:'red'}}>{error}</p>}

                <form onSubmit={handleSubmit}>
                  <div className="lp-field">
                    <input name="email" placeholder="Email" className="lp-input" onChange={handleChange}/>
                  </div>

                  <div className="lp-field">
                    <input name="password" type="password" placeholder="Password" className="lp-input" onChange={handleChange}/>
                  </div>

                  <div className="lp-center">
                    <span className="lp-link" onClick={()=>setView('forgot')}>
                      Forgot Password?
                    </span>
                  </div>

                  <br/>

                  <button className="lp-btn">
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <div className="lp-center">
                  No account?
                  <span className="lp-link" onClick={()=>navigate('/register')}>
                    SignUp
                  </span>
                </div>
              </>
            )}

            {view === 'forgot' && (
              <>
                <h2 className="lp-login-title">Reset</h2>
                <ForgotPassword
                  onBack={()=>setView('login')}
                  onOTPSent={(email)=>{ setResetEmail(email); setView('otp') }}
                />
              </>
            )}

            {view === 'otp' && (
              <>
                <h2 className="lp-login-title">OTP</h2>
                <VerifyOTP
                  email={resetEmail}
                  onVerified={(otp)=>{ setResetOTP(otp); setView('newpass') }}
                  onBack={()=>setView('forgot')}
                />
              </>
            )}

            {view === 'newpass' && (
              <>
                <h2 className="lp-login-title">New Password</h2>
                <ResetPassword
                  email={resetEmail}
                  otp={resetOTP}
                  onSuccess={()=>setView('done')}
                  onBack={()=>setView('otp')}
                />
              </>
            )}

            {view === 'done' && (
              <div className="lp-center">
                <h2>Password Updated</h2>
                <button className="lp-btn" onClick={()=>setView('login')}>
                  Back to Login
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
