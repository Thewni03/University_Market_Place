import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { mainAPI, adminAuthAPI } from "../api";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ── Helpers ────────────────────────────────────────────────────
const trustColor = (s) => s >= 80 ? "#16a34a" : s >= 50 ? "#d97706" : "#dc2626";
const trustLabel = (s) => s >= 80 ? "High" : s >= 50 ? "Medium" : "Low";
const statusColor = { verified:"#16a34a", pending:"#d97706", rejected:"#dc2626", suspended:"#64748b" };
const statusBg    = { verified:"#f0fdf4", pending:"#fffbeb", rejected:"#fef2f2", suspended:"#f8fafc" };

const getSLAInfo = (createdAt) => {
  const hrs = (Date.now() - new Date(createdAt)) / 3600000;
  if (hrs < 24) return { hrs, color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0", label:"On Time",  urgency:0 };
  if (hrs < 48) return { hrs, color:"#d97706", bg:"#fffbeb", border:"#fde68a", label:"Warning",  urgency:1 };
  return             { hrs, color:"#dc2626", bg:"#fef2f2", border:"#fecaca", label:"Overdue",  urgency:2 };
};
const formatWait = (hrs) => hrs < 1 ? `${Math.round(hrs*60)}m` : hrs < 24 ? `${Math.round(hrs)}h` : `${Math.floor(hrs/24)}d ${Math.round(hrs%24)}h`;

// ── Sub-components ─────────────────────────────────────────────
function TrustBadge({ score, onClick }) {
  const c = trustColor(score);
  const r = 15, circ = 2*Math.PI*r, offset = circ - (score/100)*circ;
  return (
    <div onClick={onClick}
      style={{ display:"flex", alignItems:"center", gap:7,
        background: score>=80?"#f0fdf4": score>=50?"#fffbeb":"#fef2f2",
        border:`1px solid ${c}28`, borderRadius:8, padding:"5px 10px",
        cursor: onClick?"pointer":"default" }}>
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3"/>
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

function StatusBadge({ status }) {
  return (
    <span style={{ background:statusBg[status]||"#f8fafc", color:statusColor[status]||"#64748b",
      border:`1px solid ${statusColor[status]||"#e2e8f0"}28`,
      borderRadius:4, padding:"3px 9px", fontSize:10, fontWeight:700,
      letterSpacing:"0.06em", textTransform:"uppercase" }}>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background:"white", borderRadius:10, padding:"20px 22px",
      border:"1px solid #e2e8f0", borderLeft:`3px solid ${accent}` }}>
      <div style={{ fontSize:24, fontWeight:800, color:"#0f172a",
        fontFamily:"'IBM Plex Mono',monospace", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, fontWeight:600, color:"#1e293b",
        letterSpacing:"0.05em", textTransform:"uppercase", marginTop:6 }}>{label}</div>
      {sub && <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function TrustModal({ user, onClose }) {
  if (!user) return null;
  const bd = user.trustBreakdown || {};
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}>
      <div style={{ background:"white", borderRadius:12, padding:28, width:400, maxWidth:"90vw",
        border:"1px solid #e2e8f0", boxShadow:"0 20px 60px rgba(0,0,0,0.12)",
        animation:"popIn 0.2s ease both" }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:"#0f172a" }}>
            Trust Breakdown
          </h3>
          <button onClick={onClose} style={{ background:"none", border:"1px solid #e2e8f0",
            borderRadius:6, width:26, height:26, cursor:"pointer", color:"#64748b",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>✕</button>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, background:"#f8fafc",
          borderRadius:8, padding:"10px 14px", marginBottom:16 }}>
          <TrustBadge score={user.trust_score||0}/>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{user.fullname}</div>
            <div style={{ fontSize:11, color:"#94a3b8" }}>{user.email}</div>
          </div>
        </div>
        {Object.entries(bd).map(([key, val]) => (
          <div key={key} style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:11, fontWeight:600, color:"#334155", textTransform:"capitalize" }}>
                {key.replace(/([A-Z])/g," $1")}
              </span>
              <span style={{ fontSize:11, fontWeight:700, color:val.pts>0?"#16a34a":"#dc2626",
                fontFamily:"'IBM Plex Mono',monospace" }}>+{val.pts} pts</span>
            </div>
            <div style={{ background:"#f1f5f9", borderRadius:99, height:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(val.pts/30)*100}%`,
                background:val.pts>0?"#16a34a":"#dc2626", borderRadius:99 }}/>
            </div>
            <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>{val.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Sora',sans-serif; background:#f8fafc; color:#0f172a; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
  @keyframes popIn  { from{opacity:0;transform:scale(0.96);}to{opacity:1;transform:scale(1);} }
  @keyframes slideIn{ from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);} }
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:#f1f5f9;}
  ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:99px;}
  .nav-link { padding:7px 13px; border:none; background:transparent; color:#64748b;
    font-family:'Sora',sans-serif; font-size:13px; font-weight:500; cursor:pointer;
    border-radius:6px; transition:all 0.15s; white-space:nowrap; }
  .nav-link:hover { background:#f1f5f9; color:#0f172a; }
  .nav-link.active { background:#0f172a; color:white; font-weight:600; }
  .action-btn { padding:4px 10px; border-radius:5px; border:1px solid transparent;
    cursor:pointer; font-size:10px; font-weight:700; font-family:'Sora',sans-serif;
    transition:all 0.15s; letter-spacing:0.04em; text-transform:uppercase; }
  .action-btn:hover { filter:brightness(0.93); }
  .user-row:hover td { background:#f8fafc !important; }
  th { font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.09em;
    text-transform:uppercase; color:#64748b; font-weight:600; }
  input, select { font-family:'Sora',sans-serif; font-size:13px; color:#0f172a; }
  input::placeholder { color:#94a3b8; }
`;

// ── TABS ───────────────────────────────────────────────────────
const TABS = [
  { id:"overview", label:"Overview" },
  { id:"users",    label:"User Management" },
  { id:"trust",    label:"Trust Scores" },
  { id:"sla",      label:"SLA Tracker" },
];

export default function DashboardPage() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]             = useState("overview");
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTrust, setFilterTrust]   = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast]         = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await mainAPI.get("/Users");
      const withScores = await Promise.all(res.data.map(async (u) => {
        try {
          const tr = await mainAPI.get(`/Users/trust-score/${u.email}`);
          return { ...u, trust_score: tr.data.score, trustBreakdown: tr.data.breakdown };
        } catch { return { ...u, trust_score: u.trust_score || 0 }; }
      }));
      setUsers(withScores);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const updateStatus = async (email, status) => {
    setActionLoading(email+status);
    try {
      await mainAPI.put(`/Users/${email}`, { verification_status: status });
      setUsers(prev => prev.map(u => u.email===email ? { ...u, verification_status:status } : u));
      showToast(`User ${status} successfully`);
    } catch { showToast("Action failed", "error"); }
    finally { setActionLoading(null); }
  };

  const deleteUser = async (email) => {
    if (!window.confirm(`Delete ${email}?`)) return;
    try {
      await mainAPI.delete(`/Users/${email}`);
      setUsers(prev => prev.filter(u => u.email!==email));
      showToast("User deleted");
    } catch { showToast("Delete failed", "error"); }
  };

  const bulkApprove = async () => {
    const eligible = users.filter(u => u.verification_status==="pending" && (u.trust_score||0)>=80);
    if (!eligible.length) { showToast("No high-trust pending users", "error"); return; }
    if (!window.confirm(`Bulk approve ${eligible.length} users?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(eligible.map(u => mainAPI.put(`/Users/${u.email}`, { verification_status:"verified" })));
      setUsers(prev => prev.map(u => eligible.find(e=>e.email===u.email) ? { ...u, verification_status:"verified" } : u));
      showToast(`${eligible.length} users approved`);
    } catch { showToast("Bulk approve failed", "error"); }
    finally { setBulkLoading(false); }
  };

  // ── Stats ────────────────────────────────────────────────────
  const total     = users.length;
  const verified  = users.filter(u=>u.verification_status==="verified").length;
  const pending   = users.filter(u=>u.verification_status==="pending").length;
  const rejected  = users.filter(u=>u.verification_status==="rejected").length;
  const suspended = users.filter(u=>u.verification_status==="suspended").length;
  const highTrust = users.filter(u=>(u.trust_score||0)>=80).length;
  const lowTrust  = users.filter(u=>(u.trust_score||0)<50).length;
  const avgTrust  = total ? Math.round(users.reduce((a,u)=>a+(u.trust_score||0),0)/total) : 0;

  const statusPie = [
    { name:"Verified", value:verified, color:"#16a34a" },
    { name:"Pending",  value:pending,  color:"#d97706" },
    { name:"Rejected", value:rejected, color:"#dc2626" },
    { name:"Suspended",value:suspended,color:"#64748b" },
  ].filter(d=>d.value>0);

  const trustDist = [
    { label:"High (80–100)", count:users.filter(u=>(u.trust_score||0)>=80).length, fill:"#16a34a" },
    { label:"Med (50–79)",   count:users.filter(u=>(u.trust_score||0)>=50&&(u.trust_score||0)<80).length, fill:"#d97706" },
    { label:"Low (0–49)",    count:users.filter(u=>(u.trust_score||0)<50).length, fill:"#dc2626" },
  ];

  const uniBar = Object.entries(users.reduce((acc,u)=>{
    const k=u.university_name||"Unknown"; acc[k]=(acc[k]||0)+1; return acc;
  },{})).map(([uni,count])=>({ uni:uni.length>18?uni.slice(0,18)+"…":uni, count }))
    .sort((a,b)=>b.count-a.count).slice(0,6);

  const gradLine = Object.entries(users.reduce((acc,u)=>{
    const y=u.graduate_year||"Unknown"; acc[y]=(acc[y]||0)+1; return acc;
  },{})).map(([year,count])=>({ year, count })).sort((a,b)=>a.year-b.year);

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    const ms = !s || u.fullname?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s)
      || u.student_id?.toLowerCase().includes(s) || u.university_name?.toLowerCase().includes(s);
    const mst = filterStatus==="all" || u.verification_status===filterStatus;
    const mt  = filterTrust==="all" ? true
      : filterTrust==="high"   ? (u.trust_score||0)>=80
      : filterTrust==="medium" ? (u.trust_score||0)>=50&&(u.trust_score||0)<80
      : (u.trust_score||0)<50;
    return ms&&mst&&mt;
  });

  const roleColors = { super_admin:"#7c3aed", admin:"#0284c7", moderator:"#64748b" };

  return (
    <>
      <style>{CSS}</style>

      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:9999,
          background:toast.type==="error"?"#fef2f2":"#f0fdf4",
          border:`1px solid ${toast.type==="error"?"#fca5a5":"#86efac"}`,
          borderRadius:8, padding:"10px 16px", fontSize:12, fontWeight:600,
          color:toast.type==="error"?"#dc2626":"#16a34a",
          boxShadow:"0 4px 20px rgba(0,0,0,0.1)", animation:"popIn 0.2s ease both" }}>
          {toast.msg}
        </div>
      )}

      <TrustModal user={selectedUser} onClose={()=>setSelectedUser(null)}/>

      <div style={{ minHeight:"100vh", background:"#f8fafc" }}>

        {/* ── NAVBAR ── */}
        <header style={{ position:"sticky", top:0, zIndex:100,
          background:"white", borderBottom:"1px solid #e2e8f0",
          boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>

          {/* Top row */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"0 28px", height:54, maxWidth:1600, margin:"0 auto" }}>

            {/* Brand */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, background:"#0f172a", borderRadius:7,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
                  <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
                  <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
                  <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.25"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:600,
                  color:"#0f172a" }}>University Marketplace</div>
                <div style={{ fontSize:9, color:"#94a3b8", letterSpacing:"0.14em",
                  textTransform:"uppercase", fontWeight:600 }}>Admin Console</div>
              </div>
            </div>

            {/* Right: status + user menu */}
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#16a34a" }}/>
                <span style={{ fontSize:11, color:"#64748b", fontWeight:500 }}>Operational</span>
              </div>

              <div style={{ width:1, height:18, background:"#e2e8f0" }}/>

              {/* Admin user dropdown */}
              <div style={{ position:"relative" }}>
                <button
                  onClick={()=>setShowUserMenu(p=>!p)}
                  style={{ display:"flex", alignItems:"center", gap:9, background:"none",
                    border:"1px solid #e2e8f0", borderRadius:8, padding:"6px 12px",
                    cursor:"pointer", transition:"border-color 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#0f172a"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:"#0f172a",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:700, color:"white",
                    fontFamily:"'IBM Plex Mono',monospace" }}>
                    {admin?.fullname?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#0f172a" }}>{admin?.fullname}</div>
                    <div style={{ fontSize:10, color:"#94a3b8" }}>
                      <span style={{ background:roleColors[admin?.role]||"#64748b",
                        color:"white", padding:"1px 6px", borderRadius:3, fontSize:9,
                        fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>
                        {admin?.role?.replace("_"," ")}
                      </span>
                    </div>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>

                {showUserMenu && (
                  <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0,
                    background:"white", border:"1px solid #e2e8f0", borderRadius:10,
                    boxShadow:"0 8px 30px rgba(0,0,0,0.1)", minWidth:220,
                    animation:"popIn 0.15s ease both", zIndex:200 }}
                    onMouseLeave={()=>setShowUserMenu(false)}>
                    <div style={{ padding:"14px 16px", borderBottom:"1px solid #f1f5f9" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{admin?.fullname}</div>
                      <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{admin?.email}</div>
                      {admin?.lastLogin && (
                        <div style={{ fontSize:10, color:"#cbd5e1", marginTop:4,
                          fontFamily:"'IBM Plex Mono',monospace" }}>
                          Last login: {new Date(admin.lastLogin).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div style={{ padding:8 }}>
                      <button
                        onClick={handleLogout}
                        style={{ width:"100%", textAlign:"left", background:"none",
                          border:"none", padding:"9px 12px", cursor:"pointer",
                          fontSize:12, fontWeight:600, color:"#dc2626", borderRadius:6,
                          fontFamily:"'Sora',sans-serif", transition:"background 0.1s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#fef2f2"}
                        onMouseLeave={e=>e.currentTarget.style.background="none"}>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={fetchUsers}
                style={{ background:"#0f172a", color:"white", border:"none",
                  borderRadius:7, padding:"7px 14px", cursor:"pointer",
                  fontSize:11, fontWeight:600, fontFamily:"'Sora',sans-serif",
                  letterSpacing:"0.04em" }}>
                Refresh
              </button>
            </div>
          </div>

          {/* Tab row */}
          <div style={{ display:"flex", alignItems:"center", gap:2,
            padding:"0 28px", height:40, maxWidth:1600, margin:"0 auto",
            borderTop:"1px solid #f1f5f9" }}>
            {TABS.map(t => (
              <button key={t.id} className={`nav-link ${tab===t.id?"active":""}`}
                onClick={()=>setTab(t.id)}>
                {t.label}
              </button>
            ))}
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10, color:"#cbd5e1", fontFamily:"'IBM Plex Mono',monospace" }}>admin</span>
              <span style={{ fontSize:10, color:"#cbd5e1" }}>/</span>
              <span style={{ fontSize:10, color:"#64748b", fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{tab}</span>
            </div>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main style={{ maxWidth:1600, margin:"0 auto", padding:"26px 28px" }}>
          <div style={{ marginBottom:22, paddingBottom:18, borderBottom:"1px solid #e2e8f0" }}>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700,
              color:"#0f172a", letterSpacing:"-0.03em" }}>
              {{ overview:"Dashboard Overview", users:"User Management",
                trust:"Trust Score Analysis", sla:"Verification SLA Tracker" }[tab]}
            </h1>
            <p style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>
              University Marketplace — Admin Control Panel
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:80 }}>
              <div style={{ width:32, height:32, border:"2.5px solid #e2e8f0",
                borderTop:"2.5px solid #0f172a", borderRadius:"50%",
                animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ fontSize:13, color:"#94a3b8" }}>Loading data...</p>
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              {tab==="overview" && (
                <div style={{ animation:"fadeUp 0.35s ease both" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:12, marginBottom:20 }}>
                    <StatCard label="Total Users"  value={total}    accent="#0ea5e9" sub="Registered"/>
                    <StatCard label="Verified"     value={verified}  accent="#16a34a" sub={`${total?Math.round(verified/total*100):0}%`}/>
                    <StatCard label="Pending"      value={pending}   accent="#d97706" sub="Awaiting"/>
                    <StatCard label="Rejected"     value={rejected}  accent="#dc2626" sub="Not approved"/>
                    <StatCard label="Avg Trust"    value={avgTrust}  accent="#7c3aed" sub="Out of 100"/>
                    <StatCard label="High Trust"   value={highTrust} accent="#16a34a" sub="Score ≥ 80"/>
                    <StatCard label="Low Trust"    value={lowTrust}  accent="#dc2626" sub="Score < 50"/>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                    {[
                      { title:"Verification Status", chart:(
                        <PieChart>
                          <Pie data={statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                            paddingAngle={4} dataKey="value"
                            label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                            {statusPie.map((e,i)=><Cell key={i} fill={e.color}/>)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius:8, border:"1px solid #e2e8f0", fontSize:12 }}/>
                        </PieChart>
                      )},
                      { title:"Trust Distribution", chart:(
                        <BarChart data={trustDist} barSize={34}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                          <XAxis dataKey="label" tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false}/>
                          <YAxis tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false}/>
                          <Tooltip contentStyle={{ borderRadius:8, border:"1px solid #e2e8f0", fontSize:12 }}/>
                          <Bar dataKey="count" radius={[5,5,0,0]}>{trustDist.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar>
                        </BarChart>
                      )},
                    ].map(({ title, chart }) => (
                      <div key={title} style={{ background:"white", borderRadius:10, padding:20, border:"1px solid #e2e8f0" }}>
                        <h3 style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:14 }}>{title}</h3>
                        <ResponsiveContainer width="100%" height={200}>{chart}</ResponsiveContainer>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <div style={{ background:"white", borderRadius:10, padding:20, border:"1px solid #e2e8f0" }}>
                      <h3 style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:14 }}>Users by University</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={uniBar} layout="vertical" barSize={13}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
                          <XAxis type="number" tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false}/>
                          <YAxis type="category" dataKey="uni" tick={{ fontSize:10, fill:"#64748b" }} width={115} tickLine={false} axisLine={false}/>
                          <Tooltip contentStyle={{ borderRadius:8, border:"1px solid #e2e8f0", fontSize:12 }}/>
                          <Bar dataKey="count" fill="#334155" radius={[0,5,5,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ background:"white", borderRadius:10, padding:20, border:"1px solid #e2e8f0" }}>
                      <h3 style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:14 }}>Graduate Year</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={gradLine}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                          <XAxis dataKey="year" tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false}/>
                          <YAxis tick={{ fontSize:10, fill:"#64748b" }} tickLine={false} axisLine={false}/>
                          <Tooltip contentStyle={{ borderRadius:8, border:"1px solid #e2e8f0", fontSize:12 }}/>
                          <Line type="monotone" dataKey="count" stroke="#0f172a" strokeWidth={2}
                            dot={{ fill:"#0f172a", r:3 }} activeDot={{ r:5 }}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* USERS */}
              {tab==="users" && (
                <div style={{ animation:"fadeUp 0.35s ease both" }}>
                  <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
                    <input value={search} onChange={e=>setSearch(e.target.value)}
                      placeholder="Search name, email, student ID, university..."
                      style={{ flex:1, minWidth:240, padding:"9px 14px",
                        border:"1px solid #e2e8f0", borderRadius:7, outline:"none" }}/>
                    {[
                      { val:filterStatus, set:setFilterStatus, opts:[["all","All Status"],["pending","Pending"],["verified","Verified"],["rejected","Rejected"],["suspended","Suspended"]] },
                      { val:filterTrust,  set:setFilterTrust,  opts:[["all","All Trust"],["high","High"],["medium","Medium"],["low","Low"]] },
                    ].map(({ val, set, opts }, i) => (
                      <select key={i} value={val} onChange={e=>set(e.target.value)}
                        style={{ padding:"9px 12px", border:"1px solid #e2e8f0",
                          borderRadius:7, outline:"none", background:"white", cursor:"pointer" }}>
                        {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                      </select>
                    ))}
                  </div>
                  <div style={{ fontSize:10, color:"#94a3b8", marginBottom:10,
                    fontFamily:"'IBM Plex Mono',monospace" }}>
                    {filtered.length} / {total} users
                  </div>
                  <div style={{ background:"white", borderRadius:10, overflow:"hidden", border:"1px solid #e2e8f0" }}>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
                        <thead>
                          <tr style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
                            {["User","University","Student ID","Trust","Status","ID File","Actions"].map(h=>(
                              <th key={h} style={{ padding:"11px 14px", textAlign:"left", whiteSpace:"nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length===0 ? (
                            <tr><td colSpan={7} style={{ textAlign:"center", padding:40, color:"#94a3b8", fontSize:13 }}>No users found</td></tr>
                          ) : filtered.map((u,i) => (
                            <tr key={u.email} className="user-row" style={{ borderBottom:"1px solid #f1f5f9" }}>
                              <td style={{ padding:"12px 14px" }}>
                                <div style={{ fontWeight:600, fontSize:13, color:"#0f172a" }}>{u.fullname}</div>
                                <div style={{ fontSize:11, color:"#94a3b8" }}>{u.email}</div>
                                <div style={{ fontSize:10, color:"#cbd5e1", fontFamily:"'IBM Plex Mono',monospace" }}>
                                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                                </div>
                              </td>
                              <td style={{ padding:"12px 14px", fontSize:12, color:"#334155", maxWidth:150 }}>{u.university_name||"—"}</td>
                              <td style={{ padding:"12px 14px" }}>
                                <code style={{ background:"#f1f5f9", color:"#334155",
                                  padding:"2px 7px", borderRadius:4, fontSize:11, fontWeight:600,
                                  fontFamily:"'IBM Plex Mono',monospace" }}>{u.student_id}</code>
                                <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>Grad: {u.graduate_year||"—"}</div>
                              </td>
                              <td style={{ padding:"12px 14px" }}>
                                <TrustBadge score={u.trust_score||0} onClick={()=>setSelectedUser(u)}/>
                              </td>
                              <td style={{ padding:"12px 14px" }}><StatusBadge status={u.verification_status}/></td>
                              <td style={{ padding:"12px 14px" }}>
                                {u.student_id_pic
                                  ? <button className="action-btn" style={{ background:"#f0f9ff", color:"#0284c7", borderColor:"#bae6fd" }}
                                      onClick={()=>window.open(`http://localhost:5000/uploads/${u.student_id_pic.replace("uploads/","")}`, "_blank")}>View</button>
                                  : <span style={{ fontSize:11, color:"#cbd5e1" }}>None</span>}
                              </td>
                              <td style={{ padding:"12px 14px" }}>
                                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                                  {u.verification_status!=="verified"  && <button className="action-btn" style={{ background:"#f0fdf4", color:"#16a34a", borderColor:"#bbf7d0" }} onClick={()=>updateStatus(u.email,"verified")}>Approve</button>}
                                  {u.verification_status!=="rejected"  && <button className="action-btn" style={{ background:"#fef2f2", color:"#dc2626", borderColor:"#fecaca" }} onClick={()=>updateStatus(u.email,"rejected")}>Reject</button>}
                                  {u.verification_status!=="suspended" && <button className="action-btn" style={{ background:"#f8fafc", color:"#64748b", borderColor:"#e2e8f0" }} onClick={()=>updateStatus(u.email,"suspended")}>Suspend</button>}
                                  <button className="action-btn" style={{ background:"#fef2f2", color:"#dc2626", borderColor:"#fecaca" }} onClick={()=>deleteUser(u.email)}>Delete</button>
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

              {/* SLA */}
              {tab==="sla" && (
                <div style={{ animation:"fadeUp 0.35s ease both" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:12, marginBottom:20 }}>
                    <StatCard label="Pending"         value={pending}  accent="#d97706" sub="Total"/>
                    <StatCard label="On Time"          value={users.filter(u=>u.verification_status==="pending"&&getSLAInfo(u.createdAt).urgency===0).length} accent="#16a34a" sub="< 24h"/>
                    <StatCard label="Warning"          value={users.filter(u=>u.verification_status==="pending"&&getSLAInfo(u.createdAt).urgency===1).length} accent="#d97706" sub="24–48h"/>
                    <StatCard label="Overdue"          value={users.filter(u=>u.verification_status==="pending"&&getSLAInfo(u.createdAt).urgency===2).length} accent="#dc2626" sub="> 48h"/>
                    <StatCard label="High-Trust Queue" value={users.filter(u=>u.verification_status==="pending"&&(u.trust_score||0)>=80).length} accent="#7c3aed" sub="Safe to approve"/>
                  </div>
                  {users.filter(u=>u.verification_status==="pending"&&(u.trust_score||0)>=80).length>0 && (
                    <div style={{ background:"#f0fdf4", border:"1px solid #86efac",
                      borderRadius:10, padding:"16px 20px", marginBottom:18,
                      display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, flexWrap:"wrap" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#15803d", marginBottom:2 }}>Quick Action Available</div>
                        <div style={{ fontSize:12, color:"#16a34a" }}>
                          <strong>{users.filter(u=>u.verification_status==="pending"&&(u.trust_score||0)>=80).length} high-trust users</strong> pending — score ≥ 80, safe to approve.
                        </div>
                      </div>
                      <button disabled={bulkLoading} onClick={bulkApprove}
                        style={{ background:"#15803d", color:"white", border:"none",
                          borderRadius:7, padding:"9px 18px", cursor:"pointer",
                          fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700,
                          opacity:bulkLoading?0.7:1 }}>
                        {bulkLoading ? "Approving..." : "Bulk Approve All"}
                      </button>
                    </div>
                  )}
                  <div style={{ background:"white", borderRadius:10, overflow:"hidden", border:"1px solid #e2e8f0", marginBottom:16 }}>
                    <div style={{ padding:"14px 20px", borderBottom:"1px solid #e2e8f0",
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <h3 style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>Pending Queue</h3>
                      <span style={{ fontSize:10, color:"#94a3b8", fontFamily:"'IBM Plex Mono',monospace" }}>Sorted by wait time</span>
                    </div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:800 }}>
                        <thead>
                          <tr style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
                            {["User","University","Trust","Wait Time","SLA","Progress","Actions"].map(h=>(
                              <th key={h} style={{ padding:"10px 14px", textAlign:"left" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {users.filter(u=>u.verification_status==="pending")
                            .sort((a,b)=>getSLAInfo(b.createdAt).hrs-getSLAInfo(a.createdAt).hrs)
                            .map(u => {
                              const sla=getSLAInfo(u.createdAt);
                              return (
                                <tr key={u.email} className="user-row"
                                  style={{ borderBottom:"1px solid #f1f5f9",
                                    background:sla.urgency===2?"#fff5f5":sla.urgency===1?"#fffdf0":"white" }}>
                                  <td style={{ padding:"12px 14px" }}>
                                    <div style={{ fontWeight:600, fontSize:12, color:"#0f172a" }}>{u.fullname}</div>
                                    <div style={{ fontSize:10, color:"#94a3b8" }}>{u.email}</div>
                                  </td>
                                  <td style={{ padding:"12px 14px", fontSize:11, color:"#334155" }}>{u.university_name||"—"}</td>
                                  <td style={{ padding:"12px 14px" }}><TrustBadge score={u.trust_score||0} onClick={()=>setSelectedUser(u)}/></td>
                                  <td style={{ padding:"12px 14px" }}>
                                    <div style={{ fontSize:12, fontWeight:700, color:sla.color, fontFamily:"'IBM Plex Mono',monospace" }}>{formatWait(sla.hrs)}</div>
                                    <div style={{ fontSize:10, color:"#94a3b8" }}>{new Date(u.createdAt).toLocaleDateString()}</div>
                                  </td>
                                  <td style={{ padding:"12px 14px" }}>
                                    <span style={{ background:sla.bg, border:`1px solid ${sla.border}`, color:sla.color,
                                      borderRadius:4, padding:"2px 7px", fontSize:9, fontWeight:700,
                                      textTransform:"uppercase", letterSpacing:"0.06em" }}>{sla.label}</span>
                                  </td>
                                  <td style={{ padding:"12px 14px", minWidth:110 }}>
                                    <div style={{ background:"#f1f5f9", borderRadius:99, height:4 }}>
                                      <div style={{ height:"100%", width:`${Math.min(100,(sla.hrs/72)*100)}%`,
                                        background:sla.color, borderRadius:99 }}/>
                                    </div>
                                    <div style={{ fontSize:9, color:"#94a3b8", marginTop:3, fontFamily:"'IBM Plex Mono',monospace" }}>
                                      {Math.min(100,Math.round((sla.hrs/72)*100))}% of 72h
                                    </div>
                                  </td>
                                  <td style={{ padding:"12px 14px" }}>
                                    <div style={{ display:"flex", gap:4 }}>
                                      <button className="action-btn" style={{ background:"#f0fdf4", color:"#16a34a", borderColor:"#bbf7d0" }} onClick={()=>updateStatus(u.email,"verified")}>Approve</button>
                                      <button className="action-btn" style={{ background:"#fef2f2", color:"#dc2626", borderColor:"#fecaca" }} onClick={()=>updateStatus(u.email,"rejected")}>Reject</button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          {!users.filter(u=>u.verification_status==="pending").length && (
                            <tr><td colSpan={7} style={{ textAlign:"center", padding:40, color:"#94a3b8", fontSize:13 }}>No pending verifications.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TRUST */}
              {tab==="trust" && (
                <div style={{ animation:"fadeUp 0.35s ease both" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:12, marginBottom:20 }}>
                    <StatCard label="Avg Trust"    value={avgTrust}  accent="#7c3aed" sub="System-wide"/>
                    <StatCard label="High Trust"   value={highTrust} accent="#16a34a" sub="≥ 80"/>
                    <StatCard label="Medium Trust" value={users.filter(u=>(u.trust_score||0)>=50&&(u.trust_score||0)<80).length} accent="#d97706" sub="50–79"/>
                    <StatCard label="Low Trust"    value={lowTrust}  accent="#dc2626" sub="< 50"/>
                  </div>
                  <div style={{ background:"white", borderRadius:10, overflow:"hidden", border:"1px solid #e2e8f0" }}>
                    <div style={{ padding:"14px 20px", borderBottom:"1px solid #e2e8f0",
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <h3 style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>All Trust Scores</h3>
                      <span style={{ fontSize:10, color:"#94a3b8", fontFamily:"'IBM Plex Mono',monospace" }}>Click score for breakdown</span>
                    </div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse" }}>
                        <thead>
                          <tr style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
                            {["User","Score","Email Domain","Student ID","University","Completeness","Verdict"].map(h=>(
                              <th key={h} style={{ padding:"10px 14px", textAlign:"left" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...users].sort((a,b)=>(b.trust_score||0)-(a.trust_score||0)).map((u,i)=>{
                            const bd=u.trustBreakdown||{}, ts=u.trust_score||0;
                            return (
                              <tr key={u.email} className="user-row" style={{ borderBottom:"1px solid #f1f5f9" }}>
                                <td style={{ padding:"11px 14px" }}>
                                  <div style={{ fontWeight:600, fontSize:12, color:"#0f172a" }}>{u.fullname}</div>
                                  <div style={{ fontSize:10, color:"#94a3b8", fontFamily:"'IBM Plex Mono',monospace" }}>{u.student_id}</div>
                                </td>
                                <td style={{ padding:"11px 14px" }}><TrustBadge score={ts} onClick={()=>setSelectedUser(u)}/></td>
                                {["emailDomain","studentId","universityName","completeness"].map(k=>(
                                  <td key={k} style={{ padding:"11px 14px", textAlign:"center" }}>
                                    <span style={{ background:bd[k]?.pts>0?"#f0fdf4":"#fef2f2",
                                      color:bd[k]?.pts>0?"#16a34a":"#dc2626",
                                      padding:"2px 7px", borderRadius:4, fontSize:10, fontWeight:700,
                                      fontFamily:"'IBM Plex Mono',monospace" }}>
                                      {bd[k]?.pts>0?`+${bd[k].pts}`:"0"}
                                    </span>
                                  </td>
                                ))}
                                <td style={{ padding:"11px 14px" }}>
                                  <span style={{ background:ts>=80?"#f0fdf4":ts>=50?"#fffbeb":"#fef2f2",
                                    color:trustColor(ts), padding:"2px 9px", borderRadius:4,
                                    fontSize:10, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase" }}>
                                    {ts>=80?"Safe":ts>=50?"Review":"High Risk"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
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