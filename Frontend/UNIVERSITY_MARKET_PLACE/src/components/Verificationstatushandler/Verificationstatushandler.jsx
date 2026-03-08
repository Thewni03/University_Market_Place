import { useState, useEffect } from "react";

const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

function useAuth() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  return { user, token };
}


const T = {
  navy:    "#0f172a",
  navyMid: "#1e293b",
  navyLt:  "#334155",
  slate:   "#64748b",
  slateLight: "#94a3b8",
  white:   "#f8fafc",
};

const STATUS_CONFIG = {
  pending: {
    icon: "⏳",
    label: "Verification Pending",
    color: "#f59e0b",
    glow:  "rgba(245,158,11,0.25)",
    bg:    "rgba(245,158,11,0.07)",
    text:  "#fbbf24",
    message: "Your account is under review. Our team is verifying your student ID. This usually takes 1–2 business days.",
    canAccess: true,
  },
  verified: {
    icon: "✓",
    label: "Verified",
    color: "#10b981",
    glow:  "rgba(16,185,129,0.25)",
    bg:    "rgba(16,185,129,0.07)",
    text:  "#34d399",
    message: "Your account is fully verified. You have full access to all features.",
    canAccess: true,
  },
  rejected: {
    icon: "✕",
    label: "Account Rejected",
    color: "#ef4444",
    glow:  "rgba(239,68,68,0.25)",
    bg:    "rgba(239,68,68,0.07)",
    text:  "#f87171",
    message: "Your account verification was rejected. Your student ID could not be verified. Please contact support if you believe this is a mistake.",
    canAccess: false,
  },
  suspended: {
    icon: "⊘",
    label: "Account Suspended",
    color: "#a78bfa",
    glow:  "rgba(167,139,250,0.25)",
    bg:    "rgba(167,139,250,0.07)",
    text:  "#c4b5fd",
    message: "Your account has been suspended due to a policy violation. Please contact our support team for assistance.",
    canAccess: false,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

  @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
  @keyframes slideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes spin    { to { transform:rotate(360deg) } }

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  /* ── Modal ── */
  .vs-backdrop {
    position:fixed; inset:0; z-index:1000;
    background:rgba(0,0,0,.72);
    backdrop-filter:blur(10px);
    display:flex; align-items:center; justify-content:center; padding:1rem;
    animation:fadeIn .2s ease;
  }
  .vs-modal {
    background:${T.navyMid};
    border:1px solid ${T.navyLt};
    border-radius:1.5rem; max-width:440px; width:100%;
    overflow:hidden;
    box-shadow:0 40px 100px rgba(0,0,0,.65);
    animation:slideUp .28s cubic-bezier(.16,1,.3,1);
  }
  .vs-modal-head {
    padding:2.25rem 2rem 1.75rem;
    display:flex; flex-direction:column; align-items:center; gap:.875rem;
    border-bottom:1px solid ${T.navyLt};
  }
  .vs-ring {
    width:80px; height:80px; border-radius:50%;
    background:${T.navy};
    border:2px solid;
    display:flex; align-items:center; justify-content:center;
    font-size:2rem; position:relative;
  }
  .vs-ring::after {
    content:''; position:absolute; inset:-7px; border-radius:50%;
    border:1.5px dashed; opacity:.25;
    animation:spin 14s linear infinite;
  }
  .vs-modal-title {
    font-family:'DM Serif Display',serif;
    font-size:1.2rem; letter-spacing:-.01em;
  }
  .vs-modal-body { padding:1.75rem 2rem 2rem; }
  .vs-msg {
    font-family:'DM Sans',sans-serif;
    font-size:.875rem; color:${T.slateLight};
    line-height:1.75; text-align:center; margin-bottom:1.5rem;
  }

  /* user pill */
  .vs-pill {
    background:${T.navy}; border:1px solid ${T.navyLt};
    border-radius:.875rem; padding:.875rem 1.25rem;
    display:flex; align-items:center; gap:.875rem;
    margin-bottom:1.5rem;
  }
  .vs-avatar {
    width:42px; height:42px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-family:'DM Serif Display',serif;
    font-size:1.15rem; flex-shrink:0; border:1.5px solid;
  }
  .vs-uname { font-family:'DM Sans',sans-serif; font-weight:600; font-size:.88rem; color:${T.white}; }
  .vs-uemail{ font-family:'DM Sans',sans-serif; font-size:.77rem; color:${T.slate}; margin-top:.1rem; }
  .vs-sbadge {
    margin-left:auto; border-radius:999px; padding:.22rem .75rem;
    font-family:'DM Sans',sans-serif;
    font-size:.67rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em;
    border:1px solid;
  }

  /* buttons */
  .vs-btnrow { display:flex; gap:.75rem; }
  .vs-btn-primary {
    flex:1; padding:.8rem; border-radius:.75rem; border:none; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:.875rem;
    transition:opacity .15s, transform .15s;
  }
  .vs-btn-primary:hover { opacity:.85; transform:translateY(-1px); }
  .vs-btn-ghost {
    flex:1; padding:.8rem; border-radius:.75rem;
    background:transparent; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:.875rem;
    border:1.5px solid ${T.navyLt}; color:${T.slateLight};
    transition:border-color .15s, color .15s;
  }
  .vs-btn-ghost:hover { border-color:${T.slate}; color:${T.white}; }

  /* ── Banner ── */
  .vs-banner {
    display:flex; align-items:center; gap:.75rem;
    padding:.6rem 1.5rem;
    background:linear-gradient(90deg,transparent,rgba(245,158,11,.06),transparent);
    border-bottom:1px solid rgba(245,158,11,.2);
    font-family:'DM Sans',sans-serif; font-size:.83rem; color:#fbbf24;
  }
  .vs-dot {
    width:7px; height:7px; border-radius:50%;
    background:#f59e0b; flex-shrink:0; animation:pulse 2s ease infinite;
  }
  .vs-banner-close {
    margin-left:auto; background:none; border:none; cursor:pointer;
    color:rgba(251,191,36,.5); font-size:1.2rem; line-height:1;
    transition:color .15s;
  }
  .vs-banner-close:hover { color:#fbbf24; }

  /* ── Navbar ── */
  .vs-nav {
    background:${T.navyMid};
    border-bottom:1px solid ${T.navyLt};
    padding:0 2rem; height:64px;
    display:flex; align-items:center; justify-content:space-between;
    position:sticky; top:0; z-index:50;
  }
  .vs-logo {
    font-family:'DM Serif Display',serif;
    font-size:1.3rem; color:${T.white}; letter-spacing:-.01em;
  }
  .vs-logo em { font-style:normal; color:#60a5fa; }
  .vs-nav-right { display:flex; align-items:center; gap:1rem; }
  .vs-guest-chip {
    font-family:'DM Sans',sans-serif; font-size:.8rem; color:${T.slate};
    background:${T.navy}; border:1px solid ${T.navyLt};
    padding:.28rem .85rem; border-radius:999px;
  }
  .vs-welcome {
    font-family:'DM Sans',sans-serif; font-size:.83rem; color:${T.slate};
  }
  .vs-welcome strong { color:${T.white}; font-weight:600; }

  /* ── Profile button ── */
  .vs-pfbtn {
    position:relative; width:42px; height:42px; border-radius:50%;
    background:${T.navy}; border:2px solid;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:box-shadow .2s;
  }
  .vs-pfdot {
    position:absolute; top:-2px; right:-2px;
    width:15px; height:15px; border-radius:50%;
    border:2.5px solid ${T.navyMid};
    display:flex; align-items:center; justify-content:center;
    font-size:.4rem; color:#fff; font-weight:900; line-height:1;
  }

  /* ── Page ── */
  .vs-page { min-height:100vh; background:${T.navy}; }

  /* ── Alert card ── */
  .vs-alert-wrap { margin:2.5rem auto; max-width:700px; padding:0 1.25rem; }
  .vs-alert {
    border-radius:1.25rem; border:1px solid;
    padding:1.5rem 1.75rem;
    display:flex; gap:1.25rem; align-items:flex-start;
    position:relative; overflow:hidden;
  }
  .vs-alert::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse at top left, currentColor 0%, transparent 60%);
    opacity:.05; pointer-events:none;
  }
  .vs-alert-icon { font-size:1.75rem; flex-shrink:0; line-height:1.1; }
  .vs-alert-title {
    font-family:'DM Serif Display',serif;
    font-size:1.05rem; margin-bottom:.35rem;
  }
  .vs-alert-msg {
    font-family:'DM Sans',sans-serif;
    font-size:.875rem; line-height:1.7; color:${T.slateLight};
  }
  .vs-alert-cta {
    margin-top:.875rem; border:1px solid; border-radius:.6rem;
    padding:.5rem 1.2rem; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:.82rem;
    background:transparent; transition:opacity .15s;
  }
  .vs-alert-cta:hover { opacity:.75; }

  /* ── Locked grid ── */
  .vs-grid {
    max-width:700px; margin:0 auto; padding:0 1.25rem 3.5rem;
    display:grid; grid-template-columns:repeat(3,1fr); gap:1rem;
  }
  .vs-locked {
    background:${T.navyMid}; border:1px solid ${T.navyLt};
    border-radius:1rem; padding:1.75rem 1rem;
    text-align:center; cursor:not-allowed;
    transition:border-color .2s;
  }
  .vs-locked:hover { border-color:${T.navyLt}; }
  .vs-locked-icon { font-size:1.4rem; margin-bottom:.6rem; opacity:.3; filter:grayscale(1); }
  .vs-locked-lbl {
    font-family:'DM Sans',sans-serif;
    font-weight:600; font-size:.88rem; color:${T.slateLight};
  }
  .vs-locked-tag {
    display:inline-block; margin-top:.5rem;
    font-family:'DM Sans',sans-serif; font-size:.7rem; color:${T.navyLt};
    background:${T.navy}; border:1px solid ${T.navyLt};
    border-radius:999px; padding:.15rem .65rem;
  }

  /* ── Verified hero ── */
  .vs-hero {
    max-width:700px; margin:4rem auto;
    padding:0 1.25rem; text-align:center;
  }
  .vs-hero-badge {
    width:80px; height:80px; border-radius:50%;
    background:rgba(16,185,129,.08); border:2px solid #10b981;
    display:flex; align-items:center; justify-content:center;
    font-size:2rem; color:#10b981; margin:0 auto 1.25rem;
    box-shadow:0 0 40px rgba(16,185,129,.2);
  }
  .vs-hero-title {
    font-family:'DM Serif Display',serif;
    font-size:1.6rem; color:${T.white}; margin-bottom:.5rem;
  }
  .vs-hero-sub {
    font-family:'DM Sans',sans-serif;
    font-size:.9rem; color:${T.slate};
  }
`;

// ─── Components ───────────────────────────────────────────────────────────────

function StatusModal({ status, user, onClose }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="vs-backdrop" onClick={onClose}>
      <div className="vs-modal" onClick={e => e.stopPropagation()}>

        <div className="vs-modal-head" style={{ background: cfg.bg }}>
          <div
            className="vs-ring"
            style={{
              borderColor: cfg.color,
              color: cfg.color,
              boxShadow: `0 0 32px ${cfg.glow}`,
            }}
          >
            {cfg.icon}
            <style>{`.vs-ring::after { border-color: ${cfg.color}; }`}</style>
          </div>
          <span className="vs-modal-title" style={{ color: cfg.text }}>
            {cfg.label}
          </span>
        </div>

        <div className="vs-modal-body">
          <p className="vs-msg">{cfg.message}</p>

          <div className="vs-pill">
            <div
              className="vs-avatar"
              style={{
                background: cfg.bg,
                color: cfg.text,
                borderColor: cfg.color + "40",
              }}
            >
              {user?.fullname?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="vs-uname">{user?.fullname}</p>
              <p className="vs-uemail">{user?.email}</p>
            </div>
            <span
              className="vs-sbadge"
              style={{
                color: cfg.text,
                background: cfg.bg,
                borderColor: cfg.color + "35",
              }}
            >
              {status}
            </span>
          </div>

          <div className="vs-btnrow">
            {(status === "rejected" || status === "suspended") && (
              <button
                className="vs-btn-primary"
                style={{ background: cfg.color, color: "#fff" }}
                onClick={() => alert("Redirecting to support...")}
              >
                Contact Support
              </button>
            )}
            <button className="vs-btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PendingBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="vs-banner">
      <span className="vs-dot" />
      <span>
        <strong>Verification Pending</strong>
        {" — "}Your student ID is being reviewed. Some features may be limited until verified.
      </span>
      <button className="vs-banner-close" onClick={() => setVisible(false)}>×</button>
    </div>
  );
}

function ProfileIconButton({ status, onClick }) {
  const cfg = STATUS_CONFIG[status];
  const showDot = status !== "verified";
  return (
    <button
      className="vs-pfbtn"
      onClick={onClick}
      title={cfg.label}
      style={{ borderColor: showDot ? cfg.color + "70" : T.navyLt }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 0 4px ${cfg.color}18`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T.slateLight} strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      {showDot && (
        <span className="vs-pfdot" style={{ background: cfg.color }}>
          {status === "pending" ? "!" : "×"}
        </span>
      )}
    </button>
  );
}

function Navbar({ user, status, isGuest, onProfileClick }) {
  return (
    <nav className="vs-nav">
      <span className="vs-logo">Uni<em>Connect</em></span>
      <div className="vs-nav-right">
        {isGuest
          ? <span className="vs-guest-chip">Browsing as Guest</span>
          : <span className="vs-welcome">
              Welcome, <strong>{user?.fullname}</strong>
            </span>
        }
        <ProfileIconButton status={status} onClick={onProfileClick} />
      </div>
    </nav>
  );
}

function GuestHomePage({ status, user, onProfileClick }) {
  const cfg = STATUS_CONFIG[status];
  const locked = [
    { label: "Events",    icon: "📅" },
    { label: "Forum",     icon: "💬" },
    { label: "Resources", icon: "📚" },
  ];
  return (
    <div className="vs-page">
      <Navbar user={user} status={status} isGuest onProfileClick={onProfileClick} />

      <div className="vs-alert-wrap">
        <div
          className="vs-alert"
          style={{
            borderColor: cfg.color + "30",
            background: cfg.bg,
            color: cfg.color,
          }}
        >
          <span className="vs-alert-icon">{cfg.icon}</span>
          <div>
            <p className="vs-alert-title" style={{ color: cfg.text }}>{cfg.label}</p>
            <p className="vs-alert-msg">{cfg.message}</p>
            {(status === "rejected" || status === "suspended") && (
              <button
                className="vs-alert-cta"
                style={{ color: cfg.text, borderColor: cfg.color + "35" }}
                onClick={onProfileClick}
              >
                View Account Status →
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="vs-grid">
        {locked.map(({ label, icon }) => (
          <div className="vs-locked" key={label}>
            <div className="vs-locked-icon">{icon}</div>
            <p className="vs-locked-lbl">{label}</p>
            <span className="vs-locked-tag">Verified only</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NormalHomePage({ status, user, onProfileClick }) {
  return (
    <div className="vs-page">
      <Navbar user={user} status={status} isGuest={false} onProfileClick={onProfileClick} />
      <div className="vs-hero">
        <div className="vs-hero-badge">✓</div>
        <h2 className="vs-hero-title">
          You're all set, {user?.fullname?.split(" ")[0]}!
        </h2>
        <p className="vs-hero-sub">
          Your account is verified. You have full access to all features.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const status   = user?.verification_status || "pending";
  const cfg      = STATUS_CONFIG[status];
  const isGuest  = !cfg.canAccess;

  useEffect(() => {
    if (!cfg.canAccess) {
      const t = setTimeout(() => setShowModal(true), 600);
      return () => clearTimeout(t);
    }
  }, [cfg.canAccess]);

  return (
    <>
      <style>{css}</style>
      {status === "pending" && <PendingBanner />}

      {isGuest
        ? <GuestHomePage  status={status} user={user} onProfileClick={() => setShowModal(true)} />
        : <NormalHomePage status={status} user={user} onProfileClick={() => setShowModal(true)} />
      }

      {showModal && (
        <StatusModal status={status} user={user} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}