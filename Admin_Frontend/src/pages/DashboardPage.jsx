import React from "react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { mainAPI } from "../api";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ── Category colors ────────────────────────────
const CAT_COLORS = {
  "Tech & Development":      "#6366f1",
  "Writing & Translation":   "#06b6d4",
  "Design & Creative":       "#f59e0b",
  "Design & Media":          "#f59e0b",
  "Design":                  "#f59e0b",
  "Events & Entertainment":  "#ec4899",
  "Education & Tutoring":    "#10b981",
  "Tutoring":                "#10b981",
  "Business & Marketing":    "#8b5cf6",
  "Health & Wellness":       "#14b8a6",
  "Beauty Services":         "#f472b6",
  "Photography & Video":     "#f97316",
  "Development":             "#3b82f6",
};
const catColor    = (cat) => CAT_COLORS[cat] || "#94a3b8";
const trustColor  = (s) => s >= 80 ? "#10b981" : s >= 50 ? "#f59e0b" : "#ef4444";
const trustLabel  = (s) => s >= 80 ? "High" : s >= 50 ? "Medium" : "Low";
const fmtLKR      = (n) => `LKR ${Number(n||0).toLocaleString()}`;

const getSLAInfo = (createdAt) => {
  const hrs = (Date.now() - new Date(createdAt)) / 3600000;
  if (hrs < 24) return { hrs, color:"#10b981", bg:"#ecfdf5", border:"#6ee7b7", label:"On Time",  urgency:0 };
  if (hrs < 48) return { hrs, color:"#f59e0b", bg:"#fffbeb", border:"#fde68a", label:"Warning",  urgency:1 };
  return             { hrs, color:"#ef4444", bg:"#fef2f2", border:"#fecaca", label:"Overdue",  urgency:2 };
};
const formatWait = (hrs) => hrs < 1 ? `${Math.round(hrs*60)}m` : hrs < 24 ? `${Math.round(hrs)}h` : `${Math.floor(hrs/24)}d ${Math.round(hrs%24)}h`;

const TABS = [
  { id:"overview",  label:"Overview"    },
  { id:"services",  label:"Services"    },
  { id:"earnings",  label:"Earnings"    },
  { id:"users",     label:"Users"       },
  { id:"sla",       label:"SLA Tracker" },
];


const themes = {
  light: {
    bg:          "#f1f5f9",
    surface:     "#ffffff",
    surface2:    "#f8fafc",
    border:      "#e2e8f0",
    border2:     "#f1f5f9",
    text:        "#0f172a",
    textMuted:   "#94a3b8",
    textFaint:   "#94a3b8",
    navBg:       "#ffffff",
    navBorder:   "#e2e8f0",
    tablehead:   "#f8fafc",
    rowHover:    "#f8fafc",
    inputBg:     "#f8fafc",
    codeBg:      "#f1f5f9",
    glassBg:     "rgba(99,102,241,0.06)",
    glassBorder: "rgba(99,102,241,0.15)",
    gridStroke:  "#f1f5f9",
    scrollTrack: "#f1f5f9",
    scrollThumb: "#cbd5e1",
    toastSuccBg: "#f0fdf4",
    toastErrBg:  "#fef2f2",
    statBorder:  "#e2e8f0",
  },
  dark: {
    bg:          "#0f1117",
    surface:     "#161b27",
    surface2:    "#1a2236",
    border:      "#1e2d3d",
    border2:     "#1a2236",
    text:        "#f1f5f9",
    textMuted:   "#94a3b8",
    textFaint:   "#64748b",
    navBg:       "#131825",
    navBorder:   "#1e2d3d",
    tablehead:   "#131825",
    rowHover:    "#1a2236",
    inputBg:     "#161b27",
    codeBg:      "#1e2d3d",
    glassBg:     "rgba(99,102,241,0.07)",
    glassBorder: "rgba(99,102,241,0.15)",
    gridStroke:  "#1e2d3d",
    scrollTrack: "#1a2433",
    scrollThumb: "#334155",
    toastSuccBg: "#0d1f17",
    toastErrBg:  "#1e1215",
    statBorder:  "#1e2d3d",
  },
};

// ── Sub-components ─────────────────────────────────────────────
function StatCard({ label, value, sub, accent, t }) {
  return (
    <div style={{ background:t.surface, borderRadius:12, padding:"20px 22px",
      border:`1px solid ${t.statBorder}`, borderLeft:`3px solid ${accent}`,
      animation:"fadeUp 0.4s ease both" }}>
      <div style={{ fontSize:26, fontWeight:800, color:t.text,
        fontFamily:"'Baloo 2', cursive", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, fontWeight:600, color:t.textMuted,
        letterSpacing:"0.07em", textTransform:"uppercase", marginTop:8 }}>{label}</div>
      {sub && <div style={{ fontSize:10, color:t.textFaint, marginTop:3 }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, sub, action, t }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
      <div>
        <h2 style={{ fontSize:15, fontWeight:700, color:t.text }}>{title}</h2>
        {sub && <p style={{ fontSize:11, color:t.textFaint, marginTop:2 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { verified:["#ecfdf5","#10b981"], pending:["#fffbeb","#f59e0b"], rejected:["#fef2f2","#ef4444"], suspended:["#f8fafc","#64748b"] };
  const [bg, color] = colors[status] || ["#f8fafc","#64748b"];
  return (
    <span style={{ background:bg, color, border:`1px solid ${color}30`,
      borderRadius:4, padding:"3px 9px", fontSize:10, fontWeight:700,
      letterSpacing:"0.06em", textTransform:"uppercase" }}>{status}</span>
  );
}

function TrustBadge({ score, onClick, t }) {
  const c = trustColor(score);
  const r = 15, circ = 2*Math.PI*r, offset = circ - (score/100)*circ;
  return (
    <div onClick={onClick}
      style={{ display:"flex", alignItems:"center", gap:8,
        background: score>=80?"#f0fdf4": score>=50?"#fffbeb":"#fef2f2",
        border:`1px solid ${c}28`, borderRadius:8, padding:"5px 10px",
        cursor: onClick?"pointer":"default" }}>
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="none" stroke={t?.border||"#e5e7eb"} strokeWidth="3"/>
        <circle cx="18" cy="18" r={r} fill="none" stroke={c} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transform:"rotate(-90deg)", transformOrigin:"50% 50%", transition:"stroke-dashoffset 1s" }}/>
        <text x="18" y="22" textAnchor="middle"
          style={{ fontSize:9, fontWeight:700, fill:c, fontFamily:"'IBM Plex Mono',monospace" }}>{score}</text>
      </svg>
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:c }}>{trustLabel(score)}</div>
        <div style={{ fontSize:10, color:"#94a3b8" }}>Trust</div>
      </div>
    </div>
  );
}

// ── Trust Breakdown Modal ──────────────────────────────────────
function TrustModal({ user, onClose, t }) {
  if (!user) return null;
  const bd = user.trustBreakdown || {};
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}>
      <div style={{ background:t.surface, borderRadius:14, padding:28, width:420, maxWidth:"92vw",
        border:`1px solid ${t.border}`, boxShadow:"0 20px 60px rgba(0,0,0,0.2)",
        animation:"popIn 0.2s ease both" }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h3 style={{ fontFamily:"'Baloo 2', cursive", fontSize:16, fontWeight:700, color:t.text }}>
            Trust Breakdown
          </h3>
          <button onClick={onClose} style={{ background:"none", border:`1px solid ${t.border}`,
            borderRadius:6, width:28, height:28, cursor:"pointer", color:t.textMuted,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>✕</button>
        </div>

        {/* User info */}
        <div style={{ display:"flex", alignItems:"center", gap:14, background:t.surface2,
          borderRadius:10, padding:"12px 16px", marginBottom:20,
          border:`1px solid ${t.border}` }}>
          <TrustBadge score={user.trust_score||0} t={t}/>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:t.text }}>{user.fullname}</div>
            <div style={{ fontSize:11, color:t.textMuted, marginTop:1 }}>{user.email}</div>
          </div>
        </div>

        {/* Breakdown items */}
        {Object.keys(bd).length === 0 ? (
          <p style={{ textAlign:"center", color:t.textMuted, fontSize:12, padding:"20px 0" }}>
            No breakdown data available
          </p>
        ) : Object.entries(bd).map(([key, val]) => (
          <div key={key} style={{ marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontSize:12, fontWeight:600, color:t.text, textTransform:"capitalize" }}>
                {key.replace(/([A-Z])/g," $1")}
              </span>
              <span style={{ fontSize:12, fontWeight:700,
                color: val.pts>0?"#10b981":"#ef4444",
                fontFamily:"'IBM Plex Mono',monospace" }}>
                {val.pts>0?"+":""}{val.pts} pts
              </span>
            </div>
            <div style={{ background:t.border, borderRadius:99, height:5, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${Math.max(0,Math.min(100,(val.pts/30)*100))}%`,
                background: val.pts>0?"#10b981":"#ef4444", borderRadius:99,
                transition:"width 0.8s ease" }}/>
            </div>
            <div style={{ fontSize:10, color:t.textMuted, marginTop:3 }}>{val.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────
const makeTooltip = (t) => ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:8,
      padding:"10px 14px", fontSize:12, boxShadow:"0 4px 20px rgba(0,0,0,0.1)" }}>
      {label && <div style={{ color:t.textMuted, marginBottom:6, fontSize:11 }}>{label}</div>}
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color||t.text, fontWeight:600 }}>
          {p.name}: {p.value?.toLocaleString?.()??p.value}
        </div>
      ))}
    </div>
  );
};

// ── Main Dashboard ──────────────────────────────────────────────
export default function DashboardPage() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode]   = useState(false);
  const t = themes[darkMode?"dark":"light"];

  const [tab, setTab]             = useState("overview");
  const [users, setUsers]         = useState([]);
  const [services, setServices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast]         = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [bulkLoading, setBulkLoading]     = useState(false);
  const [showMenu, setShowMenu]   = useState(false);
  const [serviceSort, setServiceSort] = useState("views");
  const [earningSort, setEarningSort] = useState("estimated");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, servicesRes] = await Promise.all([
        mainAPI.get("/Users"),
        mainAPI.get("/api/services"),
      ]);
      const usersData = usersRes.data || [];
      const withScores = await Promise.all(usersData.map(async (u) => {
        try {
          const tr = await mainAPI.get(`/Users/trust-score/${u.email}`);
          return { ...u, trust_score: tr.data.score||0, trustBreakdown: tr.data.breakdown };
        } catch { return { ...u, trust_score: u.trust_score||0 }; }
      }));
      setUsers(withScores);
      const svcData = servicesRes.data?.data || servicesRes.data || [];
      setServices(svcData);
    } catch (err) { showToast("Failed to load data","error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const updateStatus = async (email, status) => {
    setActionLoading(email+status);
    try {
      await mainAPI.put(`/Users/${email}`, { verification_status: status });
      setUsers(prev => prev.map(u => u.email===email ? { ...u, verification_status:status } : u));
      showToast(`User ${status}`);
    } catch { showToast("Action failed","error"); }
    finally { setActionLoading(null); }
  };

  const deleteUser = async (email) => {
    if (!window.confirm(`Delete ${email}?`)) return;
    try {
      await mainAPI.delete(`/Users/${email}`);
      setUsers(prev => prev.filter(u=>u.email!==email));
      showToast("User deleted");
    } catch { showToast("Delete failed","error"); }
  };

  const bulkApprove = async () => {
    const eligible = users.filter(u=>u.verification_status==="pending"&&(u.trust_score||0)>=80);
    if (!eligible.length) { showToast("No high-trust pending users","error"); return; }
    if (!window.confirm(`Bulk approve ${eligible.length} users?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(eligible.map(u=>mainAPI.put(`/Users/${u.email}`,{verification_status:"verified"})));
      setUsers(prev=>prev.map(u=>eligible.find(e=>e.email===u.email)?{...u,verification_status:"verified"}:u));
      showToast(`${eligible.length} users approved`);
    } catch { showToast("Bulk approve failed","error"); }
    finally { setBulkLoading(false); }
  };

  const analytics = useMemo(() => {
    const total     = users.length;
    const verified  = users.filter(u=>u.verification_status==="verified").length;
    const pending   = users.filter(u=>u.verification_status==="pending").length;
    const rejected  = users.filter(u=>u.verification_status==="rejected").length;
    const suspended = users.filter(u=>u.verification_status==="suspended").length;
    const publishedSvcs   = services.filter(s=>s.isPublished);
    const unpublishedSvcs = services.filter(s=>!s.isPublished);
    const totalViews      = services.reduce((a,s)=>a+(s.viewCount||0),0);
    const totalBookings   = services.reduce((a,s)=>a+(s.reviewCount||0),0);

    const catMap = {};
    services.forEach(s => {
      const c = s.category||"Uncategorized";
      if (!catMap[c]) catMap[c] = { category:c, count:0, views:0, bookings:0, totalRevenue:0 };
      catMap[c].count++;
      catMap[c].views    += s.viewCount||0;
      catMap[c].bookings += s.reviewCount||0;
      catMap[c].totalRevenue += (s.reviewCount||0)*(s.pricePerHour||0);
    });
    const categoryData = Object.values(catMap).sort((a,b)=>b.count-a.count);

    const earningsMap = {};
    services.forEach(s => {
      const oid = s.ownerId?._id || s.ownerId;
      if (!oid) return;
      const key = String(oid);
      if (!earningsMap[key]) earningsMap[key] = {
        userId:key, name:s.ownerId?.fullname||"Unknown",
        university:s.ownerId?.university_name||"—",
        services:0, totalViews:0, totalBookings:0, estimated:0,
      };
      earningsMap[key].services++;
      earningsMap[key].totalViews    += s.viewCount||0;
      earningsMap[key].totalBookings += s.reviewCount||0;
      earningsMap[key].estimated     += (s.reviewCount||0)*(s.pricePerHour||0);
    });
    const earningsData = Object.values(earningsMap).sort((a,b)=>b.estimated-a.estimated);

    const trending = [...services].map(s=>({
      ...s, trendScore:(s.viewCount||0)+(s.reviewCount||0)*5
    })).sort((a,b)=>b.trendScore-a.trendScore).slice(0,8);

    const priceBuckets = [
      {range:"0–500",   min:0,   max:500,       count:0},
      {range:"500–1k",  min:500, max:1000,       count:0},
      {range:"1k–2k",   min:1000,max:2000,       count:0},
      {range:"2k–5k",   min:2000,max:5000,       count:0},
      {range:"5k+",     min:5000,max:Infinity,   count:0},
    ];
    services.forEach(s=>{
      const b=priceBuckets.find(b=>s.pricePerHour>=b.min&&s.pricePerHour<b.max);
      if(b) b.count++;
    });

    const online   = services.filter(s=>s.locationMode==="Online").length;
    const oncampus = services.filter(s=>s.locationMode==="On-Campus").length;
    const statusPie = [
      {name:"Verified", value:verified, color:"#10b981"},
      {name:"Pending",  value:pending,  color:"#f59e0b"},
      {name:"Rejected", value:rejected, color:"#ef4444"},
      {name:"Suspended",value:suspended,color:"#64748b"},
    ].filter(d=>d.value>0);
    const totalRevenue = earningsData.reduce((a,e)=>a+e.estimated,0);

    return { total, verified, pending, rejected, suspended,
      publishedSvcs, unpublishedSvcs, totalViews, totalBookings,
      categoryData, earningsData, trending, priceBuckets,
      online, oncampus, statusPie, totalRevenue };
  }, [users, services]);

  const filteredUsers = useMemo(() => users.filter(u => {
    const s = search.toLowerCase();
    const ms = !s || [u.fullname,u.email,u.student_id,u.university_name].some(f=>f?.toLowerCase().includes(s));
    const mst = filterStatus==="all" || u.verification_status===filterStatus;
    return ms&&mst;
  }), [users, search, filterStatus]);

  const sortedServices = useMemo(() => [...services].sort((a,b)=>{
    if(serviceSort==="views")    return (b.viewCount||0)-(a.viewCount||0);
    if(serviceSort==="bookings") return (b.reviewCount||0)-(a.reviewCount||0);
    if(serviceSort==="price")    return (b.pricePerHour||0)-(a.pricePerHour||0);
    return b.createdAt>a.createdAt?1:-1;
  }), [services, serviceSort]);

  const sortedEarnings = useMemo(()=>[...analytics.earningsData].sort((a,b)=>{
    if(earningSort==="estimated") return b.estimated-a.estimated;
    if(earningSort==="bookings")  return b.totalBookings-a.totalBookings;
    if(earningSort==="views")     return b.totalViews-a.totalViews;
    return b.services-a.services;
  }), [analytics.earningsData, earningSort]);

  const DarkTooltip = makeTooltip(t);

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Baloo 2', cursive; background:${t.bg}; color:${t.text}; transition:background 0.3s,color 0.3s; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
    @keyframes popIn  { from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);} }
    @keyframes pulse  { 0%,100%{opacity:1;}50%{opacity:0.5;} }
    @keyframes spin   { to{transform:rotate(360deg);} }
    ::-webkit-scrollbar{width:5px;height:5px;}
    ::-webkit-scrollbar-track{background:${t.scrollTrack};}
    ::-webkit-scrollbar-thumb{background:${t.scrollThumb};border-radius:99px;}
    .nav-tab { padding:8px 16px; border:none; background:transparent; color:${t.textMuted};
      font-family:'Baloo 2', cursive; font-size:12px; font-weight:600; cursor:pointer;
      border-radius:8px; transition:all 0.15s; white-space:nowrap; }
    .nav-tab:hover { background:${t.surface2}; color:${t.text}; }
    .nav-tab.active { background:#6366f1; color:white; }
    .action-btn { padding:5px 11px; border-radius:6px; border:1px solid transparent;
      cursor:pointer; font-size:10px; font-weight:700; font-family:'Baloo 2', cursive;
      transition:all 0.15s; letter-spacing:0.04em; text-transform:uppercase; }
    .action-btn:hover { filter:brightness(${darkMode?"1.15":"0.92"}); }
    .row-hover:hover td { background:${t.rowHover} !important; }
    th { font-family:'Baloo 2', cursive; font-size:10px; letter-spacing:0.1em;
      text-transform:uppercase; color:${t.textFaint}; font-weight:600; }
  `;

  return (
    <>
      <style>{CSS}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:9999,
          background: toast.type==="error"?t.toastErrBg:t.toastSuccBg,
          border:`1px solid ${toast.type==="error"?"#ef444440":"#10b98140"}`,
          borderRadius:10, padding:"10px 18px", fontSize:12, fontWeight:600,
          color: toast.type==="error"?"#ef4444":"#10b981",
          boxShadow:"0 8px 30px rgba(0,0,0,0.15)", animation:"popIn 0.2s ease both" }}>
          {toast.msg}
        </div>
      )}

      {/* Trust Modal */}
      <TrustModal user={selectedUser} onClose={()=>setSelectedUser(null)} t={t}/>

      <div style={{ minHeight:"100vh", background:t.bg, transition:"background 0.3s" }}>

        {/* ── NAVBAR ── */}
        <header style={{ position:"sticky", top:0, zIndex:100,
          background:t.navBg, borderBottom:`1px solid ${t.navBorder}`,
          boxShadow:`0 1px 20px rgba(0,0,0,${darkMode?"0.3":"0.06"})`,
          transition:"background 0.3s, border-color 0.3s" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"0 28px", height:56, maxWidth:1600, margin:"0 auto" }}>

            {/* Brand */}
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:32, height:32, background:"linear-gradient(135deg,#6366f1,#06b6d4)",
                borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L14 5V11L8 14L2 11V5L8 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                  <circle cx="8" cy="8" r="2" fill="white"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700,
                  color:t.text }}>UniMarket</div>
                <div style={{ fontSize:9, color:t.textFaint, letterSpacing:"0.16em",
                  textTransform:"uppercase", fontWeight:600 }}>Admin Console</div>
              </div>
            </div>

            {/* Right */}
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981",
                  animation:"pulse 2s ease-in-out infinite" }}/>
                <span style={{ fontSize:11, color:t.textMuted }}>Operational</span>
              </div>
              <div style={{ width:1, height:18, background:t.border }}/>

              {/* Dark mode toggle */}
              <button onClick={()=>setDarkMode(d=>!d)}
                title={darkMode?"Switch to Light Mode":"Switch to Dark Mode"}
                style={{ background:t.surface2, border:`1px solid ${t.border}`,
                  borderRadius:8, padding:"7px 12px", cursor:"pointer",
                  fontSize:16, lineHeight:1, transition:"all 0.2s" }}>
                {darkMode ? "☼" : "☽"}
              </button>

              {/* Admin menu */}
              <div style={{ position:"relative" }}>
                <button onClick={()=>setShowMenu(p=>!p)}
                  style={{ display:"flex", alignItems:"center", gap:8,
                    background:t.surface2, border:`1px solid ${t.border}`,
                    borderRadius:8, padding:"7px 12px", cursor:"pointer" }}>
                  <div style={{ width:24, height:24, borderRadius:"50%",
                    background:"linear-gradient(135deg,#6366f1,#06b6d4)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:10, fontWeight:700, color:"white" }}>
                    {admin?.fullname?.charAt(0)?.toUpperCase()||"A"}
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color:t.text }}>{admin?.fullname}</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 3.5L5 6.5L8 3.5" stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                {showMenu && (
                  <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0,
                    background:t.surface, border:`1px solid ${t.border}`, borderRadius:10,
                    boxShadow:"0 20px 60px rgba(0,0,0,0.15)", minWidth:200, zIndex:200,
                    animation:"popIn 0.15s ease both" }}
                    onMouseLeave={()=>setShowMenu(false)}>
                    <div style={{ padding:"14px 16px", borderBottom:`1px solid ${t.border}` }}>
                      <div style={{ fontSize:12, fontWeight:600, color:t.text }}>{admin?.fullname}</div>
                      <div style={{ fontSize:11, color:t.textMuted, marginTop:2 }}>{admin?.email}</div>
                      {admin?.lastLogin && (
                        <div style={{ fontSize:10, color:t.textFaint, marginTop:4,
                          fontFamily:"'IBM Plex Mono',monospace" }}>
                          Last: {new Date(admin.lastLogin).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div style={{ padding:8 }}>
                      <button onClick={handleLogout}
                        style={{ width:"100%", textAlign:"left", background:"none", border:"none",
                          padding:"9px 12px", cursor:"pointer", fontSize:12, fontWeight:600,
                          color:"#ef4444", borderRadius:6, fontFamily:"'Baloo 2', cursive" }}>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={fetchAll}
                style={{ background:"#6366f1", color:"white", border:"none", borderRadius:8,
                  padding:"8px 16px", cursor:"pointer", fontSize:11, fontWeight:700,
                  fontFamily:"'Baloo 2', cursive", boxShadow:"0 0 20px rgba(99,102,241,0.25)" }}>
                ↻
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", alignItems:"center", gap:4,
            padding:"0 28px", height:44, maxWidth:1600, margin:"0 auto",
            borderTop:`1px solid ${t.navBorder}` }}>
            {TABS.map(tb=>(
              <button key={tb.id} className={`nav-tab ${tab===tb.id?"active":""}`}
                onClick={()=>setTab(tb.id)}>{tb.label}</button>
            ))}
            <div style={{ marginLeft:"auto", fontFamily:"'IBM Plex Mono',monospace",
              fontSize:10, color:t.textFaint }}>
              admin / {tab}
            </div>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main style={{ maxWidth:1600, margin:"0 auto", padding:"28px 28px" }}>
          {loading ? (
            <div style={{ textAlign:"center", padding:100 }}>
              <div style={{ width:36, height:36, border:`3px solid ${t.border}`,
                borderTop:"3px solid #6366f1", borderRadius:"50%",
                animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
              <p style={{ fontSize:13, color:t.textMuted }}>Loading analytics...</p>
            </div>
          ) : (
            <>

              {/* ════════ OVERVIEW ════════ */}
              {tab==="overview" && (
                <div style={{ animation:"fadeUp 0.35s ease both" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
                    gap:12, marginBottom:24 }}>
                    <StatCard label="Total Users"    value={analytics.total}    accent="#6366f1" t={t} sub="Registered"/>
                    <StatCard label="Verified"       value={analytics.verified} accent="#10b981" t={t} sub={`${analytics.total?Math.round(analytics.verified/analytics.total*100):0}% rate`}/>
                    <StatCard label="Pending"        value={analytics.pending}  accent="#f59e0b" t={t} sub="Awaiting"/>
                    <StatCard label="Services"       value={services.length}    accent="#06b6d4" t={t} sub={`${analytics.publishedSvcs.length} published`}/>
                    <StatCard label="Total Views"    value={analytics.totalViews.toLocaleString()} accent="#8b5cf6" t={t}/>
                    <StatCard label="Total Bookings" value={analytics.totalBookings} accent="#ec4899" t={t}/>
                    <StatCard label="Est. Revenue"   value={`LKR ${(analytics.totalRevenue/1000).toFixed(0)}k`} accent="#10b981" t={t} sub="Bookings × price"/>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14, marginBottom:14 }}>
                    <div style={{ background:t.surface, borderRadius:12, padding:20, border:`1px solid ${t.border}` }}>
                      <SectionHeader title="Services by Category" sub="Total services per category" t={t}/>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.categoryData} barSize={28}>
                          <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} vertical={false}/>
                          <XAxis dataKey="category" tick={{ fontSize:9, fill:t.textMuted }}
                            tickLine={false} axisLine={false}
                            tickFormatter={v=>v.split(" ")[0]}/>
                          <YAxis tick={{ fontSize:10, fill:t.textMuted }} tickLine={false} axisLine={false}/>
                          <Tooltip content={<DarkTooltip/>}/>
                          <Bar dataKey="count" radius={[6,6,0,0]} name="Services">
                            {analytics.categoryData.map((e,i)=><Cell key={i} fill={catColor(e.category)}/>)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ background:t.surface, borderRadius:12, padding:20, border:`1px solid ${t.border}` }}>
                      <SectionHeader title="User Status" sub="Verification breakdown" t={t}/>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={analytics.statusPie} cx="50%" cy="50%"
                            innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="value"
                            label={({name,percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false}>
                            {analytics.statusPie.map((e,i)=><Cell key={i} fill={e.color}/>)}
                          </Pie>
                          <Tooltip content={<DarkTooltip/>}/>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center", marginTop:6 }}>
                        {analytics.statusPie.map(e=>(
                          <div key={e.name} style={{ display:"flex", alignItems:"center", gap:4 }}>
                            <div style={{ width:8, height:8, borderRadius:"50%", background:e.color }}/>
                            <span style={{ fontSize:10, color:t.textMuted }}>{e.name} ({e.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                    <div style={{ background:t.surface, borderRadius:12, padding:20, border:`1px solid ${t.border}` }}>
                      <SectionHeader title="Est. Revenue by Category" sub="Bookings × hourly rate" t={t}/>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.categoryData} layout="vertical" barSize={14}>
                          <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} horizontal={false}/>
                          <XAxis type="number" tick={{ fontSize:9, fill:t.textMuted }}
                            tickLine={false} axisLine={false}
                            tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                          <YAxis type="category" dataKey="category" width={110}
                            tick={{ fontSize:9, fill:t.textMuted }} tickLine={false} axisLine={false}
                            tickFormatter={v=>v.length>16?v.slice(0,16)+"…":v}/>
                          <Tooltip content={<DarkTooltip/>}/>
                          <Bar dataKey="totalRevenue" name="LKR" radius={[0,6,6,0]}>
                            {analytics.categoryData.map((e,i)=><Cell key={i} fill={catColor(e.category)}/>)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ background:t.surface, borderRadius:12, padding:20, border:`1px solid ${t.border}` }}>
                      <SectionHeader title="Price Distribution (LKR/hr)" sub="How services are priced" t={t}/>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.priceBuckets} barSize={36}>
                          <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} vertical={false}/>
                          <XAxis dataKey="range" tick={{ fontSize:10, fill:t.textMuted }} tickLine={false} axisLine={false}/>
                          <YAxis tick={{ fontSize:10, fill:t.textMuted }} tickLine={false} axisLine={false}/>
                          <Tooltip content={<DarkTooltip/>}/>
                          <Bar dataKey="count" fill="#06b6d4" radius={[6,6,0,0]} name="Services"/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
                    <div style={{ background:t.surface, borderRadius:12, padding:20, border:`1px solid ${t.border}` }}>
                      <SectionHeader title="🔥 Trending Services" sub="Ranked by views + bookings×5" t={t}/>
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {analytics.trending.slice(0,6).map((s,i)=>(
                          <div key={s._id} style={{ display:"flex", alignItems:"center", gap:12,
                            padding:"10px 12px", background:t.surface2, borderRadius:10,
                            border:`1px solid ${i===0?"#6366f130":t.border}` }}>
                            <div style={{ width:28, height:28, borderRadius:8, flexShrink:0,
                              background: i===0?"linear-gradient(135deg,#f59e0b,#ef4444)":
                                          i===1?"linear-gradient(135deg,#6366f1,#8b5cf6)":
                                          i===2?"linear-gradient(135deg,#06b6d4,#10b981)":t.border,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontSize:12, fontWeight:800, color: i<3?"white":t.textMuted,
                              fontFamily:"'IBM Plex Mono',monospace" }}>{i+1}</div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:12, fontWeight:600, color:t.text,
                                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.title}</div>
                              <div style={{ fontSize:10, color:t.textMuted, marginTop:1 }}>{s.category} · {s.locationMode}</div>
                            </div>
                            <div style={{ textAlign:"right", flexShrink:0 }}>
                              <div style={{ fontSize:11, fontWeight:700, color:"#6366f1",
                                fontFamily:"'IBM Plex Mono',monospace" }}>{(s.viewCount||0).toLocaleString()} views</div>
                              <div style={{ fontSize:10, color:t.textMuted }}>{s.reviewCount||0} bookings</div>
                            </div>
                            <div style={{ fontSize:11, fontWeight:700, color:"#10b981",
                              fontFamily:"'IBM Plex Mono',monospace", flexShrink:0 }}>
                              {fmtLKR(s.pricePerHour)}/hr
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                      <div style={{ background:t.surface, borderRadius:12, padding:20, border:`1px solid ${t.border}` }}>
                        <SectionHeader title="Location Mode" t={t}/>
                        {[
                          {label:"Online",    value:analytics.online,   color:"#6366f1"},
                          {label:"On-Campus", value:analytics.oncampus, color:"#10b981"},
                        ].map(item=>(
                          <div key={item.label} style={{ marginBottom:12 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                              <span style={{ fontSize:11, color:t.textMuted, fontWeight:600 }}>{item.label}</span>
                              <span style={{ fontSize:11, color:item.color, fontWeight:700,
                                fontFamily:"'IBM Plex Mono',monospace" }}>
                                {item.value} ({services.length?Math.round(item.value/services.length*100):0}%)
                              </span>
                            </div>
                            <div style={{ background:t.border, borderRadius:99, height:6 }}>
                              <div style={{ height:"100%", borderRadius:99, background:item.color,
                                width:`${services.length?Math.round(item.value/services.length*100):0}%`,
                                transition:"width 1s ease" }}/>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background:t.surface, borderRadius:12, padding:20, border:`1px solid ${t.border}` }}>
                        <SectionHeader title="Quick Stats" t={t}/>
                        {[
                          {label:"Avg price/hr", value:`LKR ${services.length?Math.round(services.reduce((a,s)=>a+(s.pricePerHour||0),0)/services.length).toLocaleString():0}`},
                          {label:"Published rate", value:`${services.length?Math.round(analytics.publishedSvcs.length/services.length*100):0}%`},
                          {label:"Avg reviews", value:services.length?(services.reduce((a,s)=>a+(s.reviewCount||0),0)/services.length).toFixed(1):"0"},
                          {label:"Avg views/service", value:services.length?Math.round(analytics.totalViews/services.length).toLocaleString():"0"},
                        ].map(item=>(
                          <div key={item.label} style={{ display:"flex", justifyContent:"space-between",
                            alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${t.border2}` }}>
                            <span style={{ fontSize:11, color:t.textMuted }}>{item.label}</span>
                            <span style={{ fontSize:12, fontWeight:700, color:t.text,
                              fontFamily:"'IBM Plex Mono',monospace" }}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab==="services" && (
                <div style={{ animation:"fadeUp 0.35s ease both" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",
                    gap:12, marginBottom:20 }}>
                    <StatCard label="Total" value={services.length} accent="#6366f1" t={t}/>
                    <StatCard label="Published" value={analytics.publishedSvcs.length} accent="#10b981" t={t}/>
                    <StatCard label="Draft" value={analytics.unpublishedSvcs.length} accent="#94a3b8" t={t}/>
                    <StatCard label="Total Views" value={analytics.totalViews.toLocaleString()} accent="#8b5cf6" t={t}/>
                    <StatCard label="Bookings" value={analytics.totalBookings} accent="#ec4899" t={t}/>
                    <StatCard label="Categories" value={analytics.categoryData.length} accent="#06b6d4" t={t}/>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                    <div style={{ background:t.surface, borderRadius:12, padding:20, border:`1px solid ${t.border}` }}>
                      <SectionHeader title="Category Radar" sub="Services vs Views vs Bookings" t={t}/>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={analytics.categoryData.slice(0,7)}>
                          <PolarGrid stroke={t.border}/>
                          <PolarAngleAxis dataKey="category" tick={{ fontSize:9, fill:t.textMuted }}
                            tickFormatter={v=>v.split(" ")[0]}/>
                          <Radar name="Services" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2}/>
                          <Radar name="Views" dataKey="views" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15}/>
                          <Tooltip content={<DarkTooltip/>}/>
                          <Legend wrapperStyle={{ fontSize:10, color:t.textMuted }}/>
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ background:t.surface, borderRadius:12, padding:20, border:`1px solid ${t.border}` }}>
                      <SectionHeader title="Views vs Bookings by Category" t={t}/>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={analytics.categoryData} barSize={14}>
                          <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} vertical={false}/>
                          <XAxis dataKey="category" tick={{ fontSize:8, fill:t.textMuted }}
                            tickLine={false} axisLine={false} tickFormatter={v=>v.split(" ")[0]}/>
                          <YAxis tick={{ fontSize:9, fill:t.textMuted }} tickLine={false} axisLine={false}/>
                          <Tooltip content={<DarkTooltip/>}/>
                          <Legend wrapperStyle={{ fontSize:10, color:t.textMuted }}/>
                          <Bar dataKey="views" name="Views" fill="#6366f1" radius={[4,4,0,0]}/>
                          <Bar dataKey="bookings" name="Bookings" fill="#10b981" radius={[4,4,0,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div style={{ background:t.surface, borderRadius:12, overflow:"hidden", border:`1px solid ${t.border}` }}>
                    <div style={{ padding:"16px 20px", borderBottom:`1px solid ${t.border}`,
                      display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
                      <h3 style={{ fontSize:13, fontWeight:700, color:t.text }}>All Services</h3>
                      <div style={{ display:"flex", gap:8 }}>
                        {[["views","Most Viewed"],["bookings","Most Booked"],["price","Highest Price"],["newest","Newest"]].map(([v,l])=>(
                          <button key={v} onClick={()=>setServiceSort(v)}
                            style={{ padding:"5px 11px", borderRadius:6, border:"1px solid",
                              borderColor: serviceSort===v?"#6366f1":t.border,
                              background: serviceSort===v?"#6366f115":"transparent",
                              color: serviceSort===v?"#6366f1":t.textMuted,
                              fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"'Baloo 2', cursive" }}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
                        <thead>
                          <tr style={{ background:t.tablehead, borderBottom:`1px solid ${t.border}` }}>
                            {["Service","Category","Provider","Price/hr","Views","Bookings","Status","Location"].map(h=>(
                              <th key={h} style={{ padding:"10px 14px", textAlign:"left" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sortedServices.map(s=>(
                            <tr key={s._id} className="row-hover" style={{ borderBottom:`1px solid ${t.border2}` }}>
                              <td style={{ padding:"12px 14px" }}>
                                <div style={{ fontSize:12, fontWeight:600, color:t.text,
                                  maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                  {s.title}
                                </div>
                              </td>
                              <td style={{ padding:"12px 14px" }}>
                                <span style={{ background:`${catColor(s.category)}18`, color:catColor(s.category),
                                  border:`1px solid ${catColor(s.category)}30`,
                                  borderRadius:99, padding:"3px 10px", fontSize:10, fontWeight:700 }}>
                                  {s.category}
                                </span>
                              </td>
                              <td style={{ padding:"12px 14px", fontSize:11, color:t.textMuted }}>
                                {s.ownerId?.fullname||"—"}
                              </td>
                              <td style={{ padding:"12px 14px", fontSize:11, fontWeight:700,
                                color:"#10b981", fontFamily:"'IBM Plex Mono',monospace" }}>
                                {fmtLKR(s.pricePerHour)}
                              </td>
                              <td style={{ padding:"12px 14px", fontSize:11, color:"#6366f1",
                                fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>
                                {(s.viewCount||0).toLocaleString()}
                              </td>
                              <td style={{ padding:"12px 14px", fontSize:11, color:"#ec4899",
                                fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>
                                {s.reviewCount||0}
                              </td>
                              <td style={{ padding:"12px 14px" }}>
                                <span style={{ background:s.isPublished?"#ecfdf5":"#f8fafc",
                                  color:s.isPublished?"#10b981":"#64748b",
                                  border:`1px solid ${s.isPublished?"#10b98130":"#e2e8f0"}`,
                                  borderRadius:4, padding:"3px 9px", fontSize:10, fontWeight:700 }}>
                                  {s.isPublished?"Published":"Draft"}
                                </span>
                              </td>
                              <td style={{ padding:"12px 14px", fontSize:10, color:t.textMuted }}>{s.locationMode}</td>
                            </tr>
                          ))}
                          {!sortedServices.length && (
                            <tr><td colSpan={8} style={{ textAlign:"center", padding:40, color:t.textMuted }}>No services found</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {tab==="earnings" && (
                <div style={{ animation:"fadeUp 0.35s ease both" }}>
                  <div style={{ background:t.glassBg, border:`1px solid ${t.glassBorder}`,
                    borderRadius:12, padding:"14px 20px", marginBottom:20,
                    display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontSize:20 }}>💡</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:t.text }}>Estimated Earnings</div>
                      <div style={{ fontSize:11, color:t.textMuted, marginTop:1 }}>
                        Calculated as <code style={{ background:t.codeBg, padding:"1px 6px",
                          borderRadius:4, color:"#6366f1", fontSize:10 }}>reviewCount × pricePerHour</code> per service.
                        Real payment data will appear once the payment system is integrated.
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
                    gap:12, marginBottom:20 }}>
                    <StatCard label="Total Est. Revenue" value={fmtLKR(analytics.totalRevenue)} accent="#10b981" t={t}/>
                    <StatCard label="Active Providers" value={analytics.earningsData.length} accent="#6366f1" t={t}/>
                    <StatCard label="Top Earner" value={fmtLKR(analytics.earningsData[0]?.estimated||0)} accent="#f59e0b" t={t}/>
                    <StatCard label="Avg per Provider" value={fmtLKR(analytics.earningsData.length?analytics.totalRevenue/analytics.earningsData.length:0)} accent="#06b6d4" t={t}/>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                    <div style={{ background:t.surface, borderRadius:12, padding:20, border:`1px solid ${t.border}` }}>
                      <SectionHeader title="Top 8 Earners" sub="Estimated revenue" t={t}/>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={analytics.earningsData.slice(0,8)} layout="vertical" barSize={16}>
                          <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} horizontal={false}/>
                          <XAxis type="number" tick={{ fontSize:9, fill:t.textMuted }}
                            tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                          <YAxis type="category" dataKey="name" width={90}
                            tick={{ fontSize:9, fill:t.textMuted }} tickLine={false} axisLine={false}
                            tickFormatter={v=>v.length>12?v.slice(0,12)+"…":v}/>
                          <Tooltip content={<DarkTooltip/>}/>
                          <Bar dataKey="estimated" name="LKR" fill="#10b981" radius={[0,6,6,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ background:t.surface, borderRadius:12, padding:20, border:`1px solid ${t.border}` }}>
                      <SectionHeader title="Bookings per Provider" t={t}/>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={[...analytics.earningsData].sort((a,b)=>b.totalBookings-a.totalBookings).slice(0,8)} layout="vertical" barSize={16}>
                          <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} horizontal={false}/>
                          <XAxis type="number" tick={{ fontSize:9, fill:t.textMuted }} tickLine={false} axisLine={false}/>
                          <YAxis type="category" dataKey="name" width={90}
                            tick={{ fontSize:9, fill:t.textMuted }} tickLine={false} axisLine={false}
                            tickFormatter={v=>v.length>12?v.slice(0,12)+"…":v}/>
                          <Tooltip content={<DarkTooltip/>}/>
                          <Bar dataKey="totalBookings" name="Bookings" fill="#ec4899" radius={[0,6,6,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div style={{ background:t.surface, borderRadius:12, overflow:"hidden", border:`1px solid ${t.border}` }}>
                    <div style={{ padding:"16px 20px", borderBottom:`1px solid ${t.border}`,
                      display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
                      <div>
                        <h3 style={{ fontSize:13, fontWeight:700, color:t.text }}>💰 Earnings Leaderboard</h3>
                        <p style={{ fontSize:11, color:t.textFaint, marginTop:2 }}>Person-wise earnings breakdown</p>
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        {[["estimated","Revenue"],["bookings","Bookings"],["views","Views"],["services","Services"]].map(([v,l])=>(
                          <button key={v} onClick={()=>setEarningSort(v)}
                            style={{ padding:"5px 11px", borderRadius:6, border:"1px solid",
                              borderColor: earningSort===v?"#10b981":t.border,
                              background: earningSort===v?"#10b98115":"transparent",
                              color: earningSort===v?"#10b981":t.textMuted,
                              fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"'Baloo 2', cursive" }}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse" }}>
                        <thead>
                          <tr style={{ background:t.tablehead, borderBottom:`1px solid ${t.border}` }}>
                            {["Rank","Provider","University","Services","Views","Bookings","Est. Earnings"].map(h=>(
                              <th key={h} style={{ padding:"10px 14px", textAlign:"left" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sortedEarnings.map((e,i)=>(
                            <tr key={e.userId} className="row-hover" style={{ borderBottom:`1px solid ${t.border2}` }}>
                              <td style={{ padding:"12px 14px" }}>
                                <div style={{ width:28, height:28, borderRadius:8,
                                  background: i===0?"linear-gradient(135deg,#f59e0b,#ef4444)":
                                              i===1?"linear-gradient(135deg,#6366f1,#8b5cf6)":
                                              i===2?"linear-gradient(135deg,#06b6d4,#10b981)":t.surface2,
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  fontSize:11, fontWeight:800, color:i<3?"white":t.textMuted,
                                  fontFamily:"'IBM Plex Mono',monospace" }}>{i+1}</div>
                              </td>
                              <td style={{ padding:"12px 14px", fontSize:12, fontWeight:600, color:t.text }}>{e.name}</td>
                              <td style={{ padding:"12px 14px", fontSize:11, color:t.textMuted }}>{e.university}</td>
                              <td style={{ padding:"12px 14px", fontSize:11, color:"#6366f1",
                                fontFamily:"'IBM Plex Mono',monospace", fontWeight:700 }}>{e.services}</td>
                              <td style={{ padding:"12px 14px", fontSize:11, color:t.textMuted,
                                fontFamily:"'IBM Plex Mono',monospace" }}>{e.totalViews.toLocaleString()}</td>
                              <td style={{ padding:"12px 14px", fontSize:11, color:"#ec4899",
                                fontFamily:"'IBM Plex Mono',monospace", fontWeight:700 }}>{e.totalBookings}</td>
                              <td style={{ padding:"12px 14px" }}>
                                <div style={{ fontSize:13, fontWeight:800, color:"#10b981",
                                  fontFamily:"'IBM Plex Mono',monospace" }}>{fmtLKR(e.estimated)}</div>
                                <div style={{ fontSize:9, color:t.textFaint, marginTop:1 }}>estimated</div>
                              </td>
                            </tr>
                          ))}
                          {!sortedEarnings.length && (
                            <tr><td colSpan={7} style={{ textAlign:"center", padding:40, color:t.textMuted }}>No provider data</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {tab==="users" && (
                <div style={{ animation:"fadeUp 0.35s ease both" }}>
                  <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
                    <input value={search} onChange={e=>setSearch(e.target.value)}
                      placeholder="Search name, email, student ID, university..."
                      style={{ flex:1, minWidth:240, padding:"9px 14px",
                        background:t.inputBg, border:`1px solid ${t.border}`,
                        borderRadius:8, outline:"none", color:t.text, fontSize:13 }}/>
                    <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
                      style={{ padding:"9px 14px", background:t.inputBg, border:`1px solid ${t.border}`,
                        borderRadius:8, outline:"none", color:t.text, cursor:"pointer" }}>
                      {[["all","All Status"],["pending","Pending"],["verified","Verified"],
                        ["rejected","Rejected"],["suspended","Suspended"]].map(([v,l])=>(
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ fontSize:10, color:t.textFaint, marginBottom:10,
                    fontFamily:"'IBM Plex Mono',monospace" }}>
                    {filteredUsers.length} / {users.length} users
                  </div>
                  <div style={{ background:t.surface, borderRadius:12, overflow:"hidden", border:`1px solid ${t.border}` }}>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
                        <thead>
                          <tr style={{ background:t.tablehead, borderBottom:`1px solid ${t.border}` }}>
                            {["User","University","Student ID","Trust","Status","ID File","Actions"].map(h=>(
                              <th key={h} style={{ padding:"11px 14px", textAlign:"left" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length===0 ? (
                            <tr><td colSpan={7} style={{ textAlign:"center", padding:40, color:t.textMuted }}>No users found</td></tr>
                          ) : filteredUsers.map(u=>(
                            <tr key={u.email} className="row-hover" style={{ borderBottom:`1px solid ${t.border2}` }}>
                              <td style={{ padding:"12px 14px" }}>
                                <div style={{ fontWeight:600, fontSize:13, color:t.text }}>{u.fullname}</div>
                                <div style={{ fontSize:11, color:t.textMuted }}>{u.email}</div>
                                <div style={{ fontSize:10, color:t.textFaint, fontFamily:"'IBM Plex Mono',monospace" }}>
                                  {u.createdAt?new Date(u.createdAt).toLocaleDateString():"—"}
                                </div>
                              </td>
                              <td style={{ padding:"12px 14px", fontSize:12, color:t.textMuted }}>{u.university_name||"—"}</td>
                              <td style={{ padding:"12px 14px" }}>
                                <code style={{ background:t.codeBg, color:t.textMuted,
                                  padding:"2px 7px", borderRadius:4, fontSize:11,
                                  fontFamily:"'IBM Plex Mono',monospace" }}>{u.student_id}</code>
                                <div style={{ fontSize:10, color:t.textFaint, marginTop:2 }}>Grad: {u.graduate_year||"—"}</div>
                              </td>
                              <td style={{ padding:"12px 14px" }}>
                                <TrustBadge score={u.trust_score||0} onClick={()=>setSelectedUser(u)} t={t}/>
                              </td>
                              <td style={{ padding:"12px 14px" }}><StatusBadge status={u.verification_status}/></td>
                              <td style={{ padding:"12px 14px" }}>
                                {u.student_id_pic
                                  ? <button className="action-btn"
                                      style={{ background:"#eff6ff", color:"#3b82f6", borderColor:"#bfdbfe" }}
                                      onClick={()=>window.open(`http://localhost:5000/uploads/${u.student_id_pic.replace("uploads/","")}`, "_blank")}>
                                      View
                                    </button>
                                  : <span style={{ fontSize:11, color:t.textFaint }}>None</span>}
                              </td>
                              <td style={{ padding:"12px 14px" }}>
                                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                                  {u.verification_status!=="verified"  && <button className="action-btn" style={{ background:"#f0fdf4", color:"#10b981", borderColor:"#bbf7d0" }} onClick={()=>updateStatus(u.email,"verified")}>Approve</button>}
                                  {u.verification_status!=="rejected"  && <button className="action-btn" style={{ background:"#fef2f2", color:"#ef4444", borderColor:"#fecaca" }} onClick={()=>updateStatus(u.email,"rejected")}>Reject</button>}
                                  {u.verification_status!=="suspended" && <button className="action-btn" style={{ background:"#f8fafc", color:"#64748b", borderColor:"#e2e8f0" }} onClick={()=>updateStatus(u.email,"suspended")}>Suspend</button>}
                                  <button className="action-btn" style={{ background:"#fef2f2", color:"#ef4444", borderColor:"#fecaca" }} onClick={()=>deleteUser(u.email)}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ════════ SLA ════════ */}
              {tab==="sla" && (
                <div style={{ animation:"fadeUp 0.35s ease both" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",
                    gap:12, marginBottom:20 }}>
                    <StatCard label="Pending"          value={analytics.pending}  accent="#f59e0b" t={t}/>
                    <StatCard label="On Time"          value={users.filter(u=>u.verification_status==="pending"&&getSLAInfo(u.createdAt).urgency===0).length} accent="#10b981" t={t} sub="< 24h"/>
                    <StatCard label="Warning"          value={users.filter(u=>u.verification_status==="pending"&&getSLAInfo(u.createdAt).urgency===1).length} accent="#f59e0b" t={t} sub="24–48h"/>
                    <StatCard label="Overdue"          value={users.filter(u=>u.verification_status==="pending"&&getSLAInfo(u.createdAt).urgency===2).length} accent="#ef4444" t={t} sub="> 48h"/>
                    <StatCard label="High-Trust Queue" value={users.filter(u=>u.verification_status==="pending"&&(u.trust_score||0)>=80).length} accent="#6366f1" t={t} sub="Safe to approve"/>
                  </div>
                  {users.filter(u=>u.verification_status==="pending"&&(u.trust_score||0)>=80).length>0 && (
                    <div style={{ background:t.glassBg, border:`1px solid ${t.glassBorder}`,
                      borderRadius:12, padding:"16px 20px", marginBottom:18,
                      display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, flexWrap:"wrap" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#10b981", marginBottom:2 }}>Quick Action Available</div>
                        <div style={{ fontSize:12, color:t.textMuted }}>
                          <strong style={{ color:t.text }}>{users.filter(u=>u.verification_status==="pending"&&(u.trust_score||0)>=80).length} high-trust users</strong> pending — score ≥ 80
                        </div>
                      </div>
                      <button disabled={bulkLoading} onClick={bulkApprove}
                        style={{ background:"#10b981", color:"white", border:"none", borderRadius:8,
                          padding:"9px 20px", cursor:"pointer", fontFamily:"'Baloo 2', cursive",
                          fontSize:12, fontWeight:700, boxShadow:"0 0 20px rgba(16,185,129,0.2)" }}>
                        {bulkLoading?"Approving...":"⚡ Bulk Approve All"}
                      </button>
                    </div>
                  )}
                  <div style={{ background:t.surface, borderRadius:12, overflow:"hidden", border:`1px solid ${t.border}` }}>
                    <div style={{ padding:"14px 20px", borderBottom:`1px solid ${t.border}`,
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <h3 style={{ fontSize:13, fontWeight:700, color:t.text }}>Pending Queue</h3>
                      <span style={{ fontSize:10, color:t.textFaint, fontFamily:"'IBM Plex Mono',monospace" }}>Sorted by wait time ↓</span>
                    </div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:800 }}>
                        <thead>
                          <tr style={{ background:t.tablehead, borderBottom:`1px solid ${t.border}` }}>
                            {["User","University","Trust","Wait Time","SLA","Progress","Actions"].map(h=>(
                              <th key={h} style={{ padding:"10px 14px", textAlign:"left" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {users.filter(u=>u.verification_status==="pending")
                            .sort((a,b)=>getSLAInfo(b.createdAt).hrs-getSLAInfo(a.createdAt).hrs)
                            .map(u=>{
                              const sla=getSLAInfo(u.createdAt);
                              return (
                                <tr key={u.email} className="row-hover" style={{ borderBottom:`1px solid ${t.border2}` }}>
                                  <td style={{ padding:"12px 14px" }}>
                                    <div style={{ fontWeight:600, fontSize:12, color:t.text }}>{u.fullname}</div>
                                    <div style={{ fontSize:10, color:t.textMuted }}>{u.email}</div>
                                  </td>
                                  <td style={{ padding:"12px 14px", fontSize:11, color:t.textMuted }}>{u.university_name||"—"}</td>
                                  <td style={{ padding:"12px 14px" }}>
                                    <TrustBadge score={u.trust_score||0} onClick={()=>setSelectedUser(u)} t={t}/>
                                  </td>
                                  <td style={{ padding:"12px 14px" }}>
                                    <div style={{ fontSize:12, fontWeight:700, color:sla.color,
                                      fontFamily:"'IBM Plex Mono',monospace" }}>{formatWait(sla.hrs)}</div>
                                    <div style={{ fontSize:10, color:t.textMuted }}>{new Date(u.createdAt).toLocaleDateString()}</div>
                                  </td>
                                  <td style={{ padding:"12px 14px" }}>
                                    <span style={{ background:sla.bg, border:`1px solid ${sla.border}`,
                                      color:sla.color, borderRadius:4, padding:"3px 8px",
                                      fontSize:9, fontWeight:700, textTransform:"uppercase" }}>{sla.label}</span>
                                  </td>
                                  <td style={{ padding:"12px 14px", minWidth:120 }}>
                                    <div style={{ background:t.border, borderRadius:99, height:5 }}>
                                      <div style={{ height:"100%", width:`${Math.min(100,(sla.hrs/72)*100)}%`,
                                        background:sla.color, borderRadius:99 }}/>
                                    </div>
                                    <div style={{ fontSize:9, color:t.textFaint, marginTop:3,
                                      fontFamily:"'IBM Plex Mono',monospace" }}>
                                      {Math.min(100,Math.round((sla.hrs/72)*100))}% of 72h
                                    </div>
                                  </td>
                                  <td style={{ padding:"12px 14px" }}>
                                    <div style={{ display:"flex", gap:4 }}>
                                      <button className="action-btn" style={{ background:"#f0fdf4", color:"#10b981", borderColor:"#bbf7d0" }} onClick={()=>updateStatus(u.email,"verified")}>Approve</button>
                                      <button className="action-btn" style={{ background:"#fef2f2", color:"#ef4444", borderColor:"#fecaca" }} onClick={()=>updateStatus(u.email,"rejected")}>Reject</button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          {!users.filter(u=>u.verification_status==="pending").length && (
                            <tr><td colSpan={7} style={{ textAlign:"center", padding:40, color:t.textMuted }}>No pending verifications 🎉</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </>
          )}
        </main>
      </div>
    </>
  );
}