import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Sora', sans-serif; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .login-field {
    width: 100%; padding: 13px 16px; border: 1.5px solid #e2e8f0; border-radius: 9px;
    font-family: 'Sora', sans-serif; font-size: 14px; color: #0f172a; background: #ffffff;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .login-field:focus { border-color: #0f172a; box-shadow: 0 0 0 3px rgba(15,23,42,0.08); }
  .login-field::placeholder { color: #94a3b8; }
  .login-field.error { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.08); }
  .submit-btn {
    width: 100%; padding: 14px; background: #0f172a; color: white; border: none;
    border-radius: 9px; font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; letter-spacing: 0.02em; transition: opacity 0.15s, transform 0.15s;
  }
  .submit-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .show-pass {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: #94a3b8;
    font-size: 12px; font-family: 'IBM Plex Mono', monospace; font-weight: 600;
    padding: 4px 6px; border-radius: 4px; transition: color 0.15s, background 0.15s;
    letter-spacing: 0.04em;
  }
  .show-pass:hover { color: #0f172a; background: #f1f5f9; }
`;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const emailRef = useRef(null);
  useEffect(() => { emailRef.current?.focus(); }, []);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      await new Promise(r => setTimeout(r, 100));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr", background:"#ffffff" }}>

        {/* LEFT PANEL */}
        <div style={{ background:"#0f172a", display:"flex", flexDirection:"column",
          justifyContent:"space-between", padding:"48px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0,
            backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize:"40px 40px" }}/>
          <div style={{ position:"absolute", top:"30%", left:"20%", width:300, height:300,
            background:"radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            borderRadius:"50%", filter:"blur(40px)" }}/>

          <div style={{ position:"relative", zIndex:1, animation:"fadeUp 0.5s ease both" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:38, height:38, background:"rgba(255,255,255,0.1)", borderRadius:9,
                border:"1px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
                  <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.55"/>
                  <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.55"/>
                  <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.25"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:600, color:"white" }}>
                  University Marketplace
                </div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", letterSpacing:"0.15em", textTransform:"uppercase", marginTop:1 }}>
                  Admin Console
                </div>
              </div>
            </div>
          </div>

          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"inline-block", background:"rgba(255,255,255,0.07)",
              border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, padding:"5px 12px",
              fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.5)",
              letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:20 }}>
              Restricted Access
            </div>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:38, fontWeight:800, color:"white",
              lineHeight:1.15, letterSpacing:"-0.04em", marginBottom:16 }}>
              Admin<br/>Control Panel
            </h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", lineHeight:1.7, maxWidth:340, marginBottom:32 }}>
              Secure access for authorized administrators only. All sessions are logged and monitored.
            </p>
            {[
      
            ].map(([title, desc]) => (
              <div key={title} style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:20 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"rgba(255,255,255,0.3)",
                  flexShrink:0, marginTop:6 }}/>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.8)", marginBottom:2 }}>{title}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ position:"relative", zIndex:1, borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:20 }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.25)", lineHeight:1.6 }}>
              Unauthorized access attempts are recorded. Use of this system constitutes consent to monitoring.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"48px", background:"#ffffff" }}>
          <div style={{ width:"100%", maxWidth:400 }}>
            <div style={{ marginBottom:36 }}>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:26, fontWeight:700,
                color:"#0f172a", letterSpacing:"-0.03em", marginBottom:8 }}>Sign in</h2>
              <p style={{ fontSize:13, color:"#94a3b8" }}>Enter your admin credentials to continue.</p>
            </div>

            {error && (
              <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8,
                padding:"12px 14px", marginBottom:20, fontSize:13, color:"#dc2626",
                fontWeight:500, animation:"fadeIn 0.2s ease both" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom:18 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#374151",
                  marginBottom:7, letterSpacing:"0.02em" }}>Email Address</label>
                <input
                  ref={emailRef}
                  type="email"
                  className={`login-field ${fieldErrors.email ? "error" : ""}`}
                  placeholder="admin@university.edu"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors(p=>({...p,email:""})); setError(""); }}
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <p style={{ fontSize:11, color:"#dc2626", marginTop:5, fontWeight:500 }}>{fieldErrors.email}</p>
                )}
              </div>

              <div style={{ marginBottom:28 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#374151",
                  marginBottom:7, letterSpacing:"0.02em" }}>Password</label>
                <div style={{ position:"relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    className={`login-field ${fieldErrors.password ? "error" : ""}`}
                    placeholder="Enter your password "
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(p=>({...p,password:""})); setError(""); }}
                    style={{ paddingRight:56 }}
                    autoComplete="current-password"
                  />
                  <button type="button" className="show-pass" onClick={() => setShowPass(p=>!p)}>
                    {showPass ? "HIDE" : "SHOW"}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p style={{ fontSize:11, color:"#dc2626", marginTop:5, fontWeight:500 }}>{fieldErrors.password}</p>
                )}
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)",
                      borderTop:"2px solid white", borderRadius:"50%",
                      animation:"spin 0.7s linear infinite", display:"inline-block" }}/>
                    Signing in...
                  </span>
                ) : "Sign In to Admin Console"}
              </button>
            </form>

            <div style={{ marginTop:32, paddingTop:24, borderTop:"1px solid #f1f5f9", textAlign:"center" }}>
              <p style={{ fontSize:11, color:"#cbd5e1", lineHeight:1.6 }}>
                This is a restricted system.<br/>
                Contact your system administrator if you need access.
              </p>
            </div>
            <div style={{ textAlign:"center", marginTop:20 }}>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#e2e8f0", letterSpacing:"0.08em" }}>
                ADMIN CONSOLE v1.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
