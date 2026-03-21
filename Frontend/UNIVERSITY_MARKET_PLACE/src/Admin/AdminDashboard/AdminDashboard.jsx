import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const BASE = "http://localhost:5000";

const trustColor = (s) => s >= 80 ? "#16a34a" : s >= 50 ? "#b45309" : "#dc2626";
const trustLabel = (s) => s >= 80 ? "High" : s >= 50 ? "Medium" : "Low";
const statusColor = { verified:"#16a34a", pending:"#b45309", rejected:"#dc2626", suspended:"#4b5563" };
const statusBg    = { verified:"#f0fdf4", pending:"#fefce8", rejected:"#fef2f2", suspended:"#f9fafb" };

const getSLAInfo = (createdAt) => {
  const hrs = (Date.now() - new Date(createdAt)) / (1000 * 60 * 60);
  if (hrs < 24) return { hrs, color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0", label:"On Time",  urgency:0 };
  if (hrs < 48) return { hrs, color:"#b45309", bg:"#fefce8", border:"#fde68a", label:"Warning",  urgency:1 };
  return              { hrs, color:"#dc2626", bg:"#fef2f2", border:"#fecaca", label:"Overdue", urgency:2 };
};

const formatWaitTime = (hrs) => {
  if (hrs < 1)  return `${Math.round(hrs * 60)}m waiting`;
  if (hrs < 24) return `${Math.round(hrs)}h waiting`;
  return `${Math.floor(hrs/24)}d ${Math.round(hrs%24)}h waiting`;
};

function TrustBadge({ score }) {
  const c = trustColor(score);
  const r = 16, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8,
      background: score>=80?"#f0fdf4": score>=50?"#fefce8":"#fef2f2",
      border:`1px solid ${c}30`, borderRadius:5, padding:"5px 9px" }}>
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3"/>
        <circle cx="18" cy="18" r={r} fill="none" stroke={c} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transform:"rotate(-90deg)", transformOrigin:"50% 50%", transition:"stroke-dashoffset 1s ease" }}/>
        <text x="18" y="22" textAnchor="middle" style={{ fontSize:10, fontWeight:700, fill:c, fontFamily:"'IBM Plex Mono',monospace" }}>{score}</text>
      </svg>
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:c, letterSpacing:"0.03em" }}>{trustLabel(score)}</div>
        <div style={{ fontSize:10, color:"#9ca3af" }}>Trust</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span style={{
      background: statusBg[status]||"#f9fafb",
      color: statusColor[status]||"#4b5563",
      border:`1px solid ${statusColor[status]||"#e5e7eb"}40`,
      borderRadius:4, padding:"3px 9px", fontSize:10, fontWeight:600,
      letterSpacing:"0.06em", textTransform:"uppercase"
    }}>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background:"white", borderRadius:7, padding:"18px 20px",
      border:"1px solid #e5e7eb", borderLeft:`3px solid ${accent}`,
      display:"flex", flexDirection:"column", gap:5,
      transition:"box-shadow 0.2s, transform 0.2s",
    }}>
      <div style={{ fontSize:26, fontWeight:800, color:"#111827",
        fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"-0.03em", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, fontWeight:600, color:"#374151", letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:"#9ca3af" }}>{sub}</div>}
    </div>
  );
}

function TrustModal({ user, onClose }) {
  if (!user) return null;
  const bd = user.trustBreakdown || {};
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(3px)" }}
      onClick={onClose}>
      <div style={{ background:"white", borderRadius:9, padding:28, width:400, maxWidth:"90vw",
        boxShadow:"0 20px 60px rgba(0,0,0,0.12)", animation:"popIn 0.25s ease both",
        border:"1px solid #e5e7eb" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:17, fontWeight:700, color:"#111827", letterSpacing:"-0.02em" }}>
            Trust Score Breakdown
          </h3>
          <button onClick={onClose} style={{ background:"none", border:"1px solid #e5e7eb", width:26, height:26,
            borderRadius:4, cursor:"pointer", color:"#6b7280", fontSize:13, display:"flex",
            alignItems:"center", justifyContent:"center" }}>x</button>
        </div>
        <div style={{ marginBottom:18, display:"flex", alignItems:"center", gap:12,
          padding:"12px 14px", background:"#f9fafb", borderRadius:6, border:"1px solid #f3f4f6" }}>
          <TrustBadge score={user.trust_score || 0} />
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{user.fullname}</div>
            <div style={{ fontSize:11, color:"#9ca3af" }}>{user.email}</div>
          </div>
        </div>
        {Object.entries(bd).map(([key, val]) => (
          <div key={key} style={{ marginBottom:13 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontSize:12, fontWeight:500, color:"#374151", textTransform:"capitalize" }}>
                {key.replace(/([A-Z])/g," $1")}
              </span>
              <span style={{ fontSize:12, fontWeight:700, color: val.pts>0?"#16a34a":"#dc2626",
                fontFamily:"'IBM Plex Mono',monospace" }}>
                +{val.pts} pts
              </span>
            </div>
            <div style={{ background:"#f3f4f6", borderRadius:2, height:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(val.pts/30)*100}%`,
                background: val.pts>0?"#16a34a":"#dc2626", transition:"width 0.8s ease" }}/>
            </div>
            <div style={{ fontSize:11, color:"#9ca3af", marginTop:3 }}>{val.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SLABadge({ createdAt }) {
  const sla = getSLAInfo(createdAt);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
      <span style={{
        background:sla.bg, border:`1px solid ${sla.border}`,
        color:sla.color, borderRadius:3, padding:"2px 7px",
        fontSize:10, fontWeight:700, letterSpacing:"0.06em",
        textTransform:"uppercase", whiteSpace:"nowrap"
      }}>
        {sla.label}
      </span>
      <span style={{ fontSize:10, color:"#9ca3af" }}>{formatWaitTime(sla.hrs)}</span>
    </div>
  );
}

function SLABar({ createdAt }) {
  const sla = getSLAInfo(createdAt);
  const pct = Math.min(100, (sla.hrs / 72) * 100);
  return (
    <div style={{ width:"100%", background:"#f3f4f6", borderRadius:2, height:4, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${pct}%`, background:sla.color, transition:"width 0.8s ease" }}/>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab]                     = useState("overview");
  const [users, setUsers]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState("all");
  const [filterTrust, setFilterTrust]     = useState("all");
  const [selectedUser, setSelectedUser]   = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast]                 = useState(null);
  const [bulkLoading, setBulkLoading]     = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE}/Users`);
      const withScores = await Promise.all(res.data.map(async (u) => {
        try {
          const tr = await axios.get(`${BASE}/Users/trust-score/${u.email}`);
          return { ...u, trust_score: tr.data.score, trustBreakdown: tr.data.breakdown };
        } catch { return { ...u, trust_score: u.trust_score || 0 }; }
      }));
      setUsers(withScores);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = async (email, status) => {
    setActionLoading(email + status);
    try {
      await axios.put(`${BASE}/Users/${email}`, { verification_status: status });
      setUsers(prev => prev.map(u => u.email === email ? { ...u, verification_status: status } : u));
      showToast(`User ${status} successfully`);
    } catch { showToast("Action failed", "error"); }
    finally { setActionLoading(null); }
  };

  const deleteUser = async (email) => {
    if (!window.confirm(`Delete ${email}?`)) return;
    try {
      await axios.delete(`${BASE}/Users/${email}`);
      setUsers(prev => prev.filter(u => u.email !== email));
      showToast("User deleted");
    } catch { showToast("Delete failed", "error"); }
  };

  const bulkApproveLowRisk = async () => {
    const eligible = users.filter(u => u.verification_status === "pending" && (u.trust_score||0) >= 80);
    if (eligible.length === 0) { showToast("No high-trust pending users to approve", "error"); return; }
    if (!window.confirm(`Bulk approve ${eligible.length} high-trust users?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(eligible.map(u =>
        axios.put(`${BASE}/Users/${u.email}`, { verification_status: "verified" })
      ));
      setUsers(prev => prev.map(u =>
        eligible.find(e => e.email === u.email) ? { ...u, verification_status: "verified" } : u
      ));
      showToast(`${eligible.length} users approved successfully`);
    } catch { showToast("Bulk approve failed", "error"); }
    finally { setBulkLoading(false); }
  };

  const total     = users.length;
  const verified  = users.filter(u => u.verification_status === "verified").length;
  const pending   = users.filter(u => u.verification_status === "pending").length;
  const rejected  = users.filter(u => u.verification_status === "rejected").length;
  const suspended = users.filter(u => u.verification_status === "suspended").length;
  const highTrust = users.filter(u => (u.trust_score||0) >= 80).length;
  const lowTrust  = users.filter(u => (u.trust_score||0) < 50).length;
  const avgTrust  = total ? Math.round(users.reduce((a,u) => a+(u.trust_score||0),0)/total) : 0;

  const statusPie = [
    { name:"Verified",  value:verified,  color:"#16a34a" },
    { name:"Pending",   value:pending,   color:"#d97706" },
    { name:"Rejected",  value:rejected,  color:"#dc2626" },
    { name:"Suspended", value:suspended, color:"#6b7280" },
  ].filter(d => d.value > 0);

  const trustDist = [
    { label:"High (80-100)",   count: users.filter(u=>(u.trust_score||0)>=80).length,                              fill:"#16a34a" },
    { label:"Medium (50-79)",  count: users.filter(u=>(u.trust_score||0)>=50&&(u.trust_score||0)<80).length,       fill:"#d97706" },
    { label:"Low (0-49)",      count: users.filter(u=>(u.trust_score||0)<50).length,                               fill:"#dc2626" },
  ];

  const uniBar = Object.entries(
    users.reduce((acc, u) => { const k = u.university_name || "Unknown"; acc[k] = (acc[k]||0) + 1; return acc; }, {})
  ).map(([uni, count]) => ({ uni: uni.length>18 ? uni.slice(0,18)+"…" : uni, count }))
   .sort((a,b) => b.count - a.count).slice(0,6);

  const gradYearLine = Object.entries(
    users.reduce((acc, u) => { const y = u.graduate_year || "Unknown"; acc[y] = (acc[y]||0) + 1; return acc; }, {})
  ).map(([year, count]) => ({ year, count })).sort((a,b) => a.year - b.year);

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.student_id?.toLowerCase().includes(search.toLowerCase()) ||
      u.university_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || u.verification_status === filterStatus;
    const matchTrust =
      filterTrust === "all" ? true :
      filterTrust === "high"   ? (u.trust_score||0) >= 80 :
      filterTrust === "medium" ? (u.trust_score||0) >= 50 && (u.trust_score||0) < 80 :
      (u.trust_score||0) < 50;
    return matchSearch && matchStatus && matchTrust;
  });

  const TABS = [
    { id:"overview", label:"Overview"     },
    { id:"users",    label:"Users"        },
    { id:"trust",    label:"Trust Scores" },
    { id:"sla",      label:"SLA Tracker"  },
  ];

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700&family=IBM+Plex+Mono:wght@500;600&family=DM+Sans:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'DM Sans',sans-serif; background:#f5f5f4; color:#111827; }

    @keyframes fadeUp  { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
    @keyframes popIn   { from{opacity:0;transform:scale(0.96);}to{opacity:1;transform:scale(1);} }
    @keyframes toastIn { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }

    ::-webkit-scrollbar { width:5px; height:5px; }
    ::-webkit-scrollbar-track { background:#f1f5f9; }
    ::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:99px; }

    .nav-tab {
      padding:0 16px; height:100%; border:none; background:transparent;
      cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px;
      font-weight:500; color:#6b7280; letter-spacing:0.01em;
      border-bottom:2px solid transparent; transition:all 0.15s;
      display:inline-flex; align-items:center; position:relative; top:1px;
    }
    .nav-tab:hover { color:#111827; }
    .nav-tab.active { color:#111827; font-weight:600; border-bottom-color:#111827; }

    .action-btn {
      padding:5px 10px; border-radius:4px; border:1px solid transparent; cursor:pointer;
      font-size:10px; font-weight:600; font-family:'DM Sans',sans-serif;
      letter-spacing:0.05em; text-transform:uppercase; transition:filter 0.12s;
    }
    .action-btn:hover { filter:brightness(0.93); }
    .action-btn:disabled { opacity:0.5; cursor:not-allowed; }

    .user-row:hover > td { background:#f9fafb !important; }

    input, select { font-family:'DM Sans',sans-serif; }
    input:focus, select:focus { border-color:#374151 !important; outline:none; }

    .chart-card { background:white; border-radius:7px; padding:22px; border:1px solid #e5e7eb; }
    .chart-title { font-family:'Fraunces',serif; font-size:14px; font-weight:600;
      color:#111827; margin-bottom:14px; letter-spacing:-0.01em; }
  `;

  return (
    <>
      <style>{CSS}</style>

      {toast && (
        <div style={{
          position:"fixed", top:16, right:16, zIndex:9999,
          background: toast.type==="error"?"#fef2f2":"#f0fdf4",
          border:`1px solid ${toast.type==="error"?"#fca5a5":"#86efac"}`,
          borderRadius:6, padding:"10px 16px", fontSize:12, fontWeight:600,
          color: toast.type==="error"?"#b91c1c":"#15803d",
          boxShadow:"0 4px 16px rgba(0,0,0,0.08)", animation:"toastIn 0.25s ease both",
          letterSpacing:"0.02em"
        }}>
          {toast.msg}
        </div>
      )}

      <TrustModal user={selectedUser} onClose={() => setSelectedUser(null)} />

      <div style={{ minHeight:"100vh", background:"#f5f5f4" }}>

        {/* ── NAVBAR ── */}
        <header style={{ background:"white", borderBottom:"1px solid #e5e7eb", position:"sticky", top:0, zIndex:100 }}>
          {/* Top row */}
          <div style={{ maxWidth:1360, margin:"0 auto", padding:"0 28px",
            display:"flex", alignItems:"center", justifyContent:"space-between", height:52 }}>

            {/* Brand */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:28, height:28, background:"#111827", borderRadius:4,
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5" height="5" rx="1" fill="white"/>
                  <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
                  <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
                  <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.25"/>
                </svg>
              </div>
              <div>
                <span style={{ fontFamily:"'Fraunces',serif", fontSize:14, fontWeight:700,
                  color:"#111827", letterSpacing:"-0.01em" }}>
                  University Marketplace
                </span>
                <span style={{ fontSize:10, color:"#9ca3af", letterSpacing:"0.08em",
                  textTransform:"uppercase", fontWeight:500, marginLeft:8,
                  borderLeft:"1px solid #e5e7eb", paddingLeft:8 }}>
                  Admin
                </span>
              </div>
            </div>

            {/* Right */}
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#16a34a" }}/>
                <span style={{ fontSize:11, color:"#6b7280", fontWeight:500 }}>All Systems Operational</span>
              </div>
              <div style={{ width:1, height:16, background:"#e5e7eb" }}/>
              <span style={{ fontSize:11, color:"#9ca3af" }}>
                <span style={{ color:"#111827", fontWeight:600, fontFamily:"'IBM Plex Mono',monospace" }}>{total}</span> users
              </span>
              <div style={{ width:1, height:16, background:"#e5e7eb" }}/>
              <button onClick={fetchUsers}
                style={{ background:"#111827", color:"white", border:"none",
                  borderRadius:5, padding:"6px 14px", cursor:"pointer",
                  fontSize:11, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase" }}>
                Refresh
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ maxWidth:1360, margin:"0 auto", padding:"0 28px",
            display:"flex", alignItems:"stretch", height:38, borderTop:"1px solid #f3f4f6" }}>
            {TABS.map(t => (
              <button key={t.id} className={`nav-tab ${tab===t.id?"active":""}`}
                onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </header>

        {/* ── MAIN ── */}
        <main style={{ maxWidth:1360, margin:"0 auto", padding:"28px 28px" }}>

          {/* Page title */}
          <div style={{ marginBottom:22 }}>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700,
              color:"#111827", letterSpacing:"-0.02em", lineHeight:1.2, marginBottom:2 }}>
              {{ overview:"Overview", users:"User Management",
                trust:"Trust Score Analysis", sla:"SLA Tracker" }[tab]}
            </h1>
            <p style={{ fontSize:11, color:"#9ca3af", letterSpacing:"0.03em" }}>
              University Marketplace — Administration Panel
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:80, color:"#9ca3af", fontSize:13 }}>
              Loading dashboard data...
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              {tab === "overview" && (
                <div style={{ animation:"fadeUp 0.3s ease both" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, marginBottom:20 }}>
                    <StatCard label="Total Users"     value={total}    accent="#374151" sub="Registered accounts"/>
                    <StatCard label="Verified"        value={verified}  accent="#16a34a" sub={`${total?Math.round(verified/total*100):0}% of total`}/>
                    <StatCard label="Pending"         value={pending}   accent="#d97706" sub="Awaiting review"/>
                    <StatCard label="Rejected"        value={rejected}  accent="#dc2626" sub="Not approved"/>
                    <StatCard label="Avg Trust"       value={avgTrust}  accent="#2563eb" sub="Out of 100"/>
                    <StatCard label="High Trust"      value={highTrust} accent="#16a34a" sub="Score 80+"/>
                    <StatCard label="Low Trust"       value={lowTrust}  accent="#dc2626" sub="Score below 50"/>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                    <div className="chart-card">
                      <div className="chart-title">Verification Status Distribution</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={statusPie} cx="50%" cy="50%" innerRadius={48} outerRadius={78}
                            paddingAngle={3} dataKey="value"
                            label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                            labelLine={false}>
                            {statusPie.map((e,i) => <Cell key={i} fill={e.color}/>)}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize:12, borderRadius:5, border:"1px solid #e5e7eb" }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                      <div className="chart-title">Trust Score Distribution</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={trustDist} barSize={40}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                          <XAxis dataKey="label" tick={{ fontSize:10, fill:"#6b7280" }} tickLine={false} axisLine={false}/>
                          <YAxis tick={{ fontSize:10, fill:"#6b7280" }} tickLine={false} axisLine={false}/>
                          <Tooltip contentStyle={{ fontSize:12, borderRadius:5, border:"1px solid #e5e7eb" }}/>
                          <Bar dataKey="count" radius={[4,4,0,0]}>
                            {trustDist.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <div className="chart-card">
                      <div className="chart-title">Users by University</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={uniBar} layout="vertical" barSize={13}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false}/>
                          <XAxis type="number" tick={{ fontSize:10, fill:"#6b7280" }} tickLine={false} axisLine={false}/>
                          <YAxis type="category" dataKey="uni" tick={{ fontSize:10, fill:"#6b7280" }} width={115} tickLine={false}/>
                          <Tooltip contentStyle={{ fontSize:12, borderRadius:5, border:"1px solid #e5e7eb" }}/>
                          <Bar dataKey="count" fill="#2563eb" radius={[0,4,4,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                      <div className="chart-title">Graduate Year Distribution</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={gradYearLine}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                          <XAxis dataKey="year" tick={{ fontSize:10, fill:"#6b7280" }} tickLine={false} axisLine={false}/>
                          <YAxis tick={{ fontSize:10, fill:"#6b7280" }} tickLine={false} axisLine={false}/>
                          <Tooltip contentStyle={{ fontSize:12, borderRadius:5, border:"1px solid #e5e7eb" }}/>
                          <Line type="monotone" dataKey="count" stroke="#2563eb"
                            strokeWidth={2} dot={{ fill:"#2563eb", r:3 }} activeDot={{ r:5 }}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* USERS */}
              {tab === "users" && (
                <div style={{ animation:"fadeUp 0.3s ease both" }}>
                  <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search name, email, student ID, university..."
                      style={{ flex:1, minWidth:220, padding:"8px 12px", border:"1px solid #d1d5db",
                        borderRadius:6, fontSize:13, background:"white", color:"#111827" }}/>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                      style={{ padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:6,
                        fontSize:13, background:"white", color:"#111827", cursor:"pointer" }}>
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <select value={filterTrust} onChange={e => setFilterTrust(e.target.value)}
                      style={{ padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:6,
                        fontSize:13, background:"white", color:"#111827", cursor:"pointer" }}>
                      <option value="all">All Trust</option>
                      <option value="high">High Trust</option>
                      <option value="medium">Medium Trust</option>
                      <option value="low">Low Trust</option>
                    </select>
                  </div>

                  <div style={{ fontSize:11, color:"#9ca3af", marginBottom:8, letterSpacing:"0.02em" }}>
                    Showing {filtered.length} of {total} users
                  </div>

                  <div style={{ background:"white", borderRadius:7, overflow:"hidden", border:"1px solid #e5e7eb" }}>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
                        <thead>
                          <tr style={{ borderBottom:"1px solid #e5e7eb", background:"#f9fafb" }}>
                            {["User","University","Student ID","Trust","Status","ID Document","Actions"].map(h => (
                              <th key={h} style={{ padding:"10px 13px", textAlign:"left",
                                fontSize:10, fontWeight:700, color:"#6b7280",
                                letterSpacing:"0.08em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign:"center", padding:48, color:"#9ca3af", fontSize:13 }}>
                              No users match your filters
                            </td></tr>
                          ) : filtered.map((u, i) => (
                            <tr key={u.email} className="user-row" style={{ borderBottom:"1px solid #f3f4f6" }}>
                              <td style={{ padding:"12px 13px", background:i%2===0?"white":"#fafafa" }}>
                                <div style={{ fontWeight:600, color:"#111827", fontSize:13 }}>{u.fullname}</div>
                                <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>{u.email}</div>
                                <div style={{ fontSize:10, color:"#d1d5db", marginTop:1, fontFamily:"'IBM Plex Mono',monospace" }}>
                                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                                </div>
                              </td>
                              <td style={{ padding:"12px 13px", fontSize:12, color:"#374151", maxWidth:150, background:i%2===0?"white":"#fafafa" }}>
                                {u.university_name || "—"}
                              </td>
                              <td style={{ padding:"12px 13px", background:i%2===0?"white":"#fafafa" }}>
                                <code style={{ background:"#f3f4f6", color:"#374151",
                                  padding:"2px 6px", borderRadius:3, fontSize:11, fontFamily:"'IBM Plex Mono',monospace" }}>
                                  {u.student_id}
                                </code>
                                <div style={{ fontSize:10, color:"#9ca3af", marginTop:3 }}>Grad: {u.graduate_year || "—"}</div>
                              </td>
                              <td style={{ padding:"12px 13px", background:i%2===0?"white":"#fafafa" }}>
                                <div style={{ cursor:"pointer" }} onClick={() => setSelectedUser(u)} title="Click for breakdown">
                                  <TrustBadge score={u.trust_score || 0}/>
                                </div>
                              </td>
                              <td style={{ padding:"12px 13px", background:i%2===0?"white":"#fafafa" }}>
                                <StatusBadge status={u.verification_status}/>
                              </td>
                              <td style={{ padding:"12px 13px", background:i%2===0?"white":"#fafafa" }}>
                                {u.student_id_pic ? (
                                  <button className="action-btn"
                                    style={{ background:"#eff6ff", color:"#1d4ed8", borderColor:"#bfdbfe" }}
                                    onClick={() => window.open(`${BASE}/uploads/${u.student_id_pic.replace("uploads/","")}`, "_blank")}>
                                    View
                                  </button>
                                ) : <span style={{ fontSize:11, color:"#d1d5db" }}>None</span>}
                              </td>
                              <td style={{ padding:"12px 13px", background:i%2===0?"white":"#fafafa" }}>
                                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                                  {u.verification_status !== "verified" && (
                                    <button className="action-btn"
                                      disabled={actionLoading === u.email+"verified"}
                                      style={{ background:"#f0fdf4", color:"#15803d", borderColor:"#86efac" }}
                                      onClick={() => updateStatus(u.email, "verified")}>
                                      Approve
                                    </button>
                                  )}
                                  {u.verification_status !== "rejected" && (
                                    <button className="action-btn"
                                      disabled={actionLoading === u.email+"rejected"}
                                      style={{ background:"#fef2f2", color:"#b91c1c", borderColor:"#fca5a5" }}
                                      onClick={() => updateStatus(u.email, "rejected")}>
                                      Reject
                                    </button>
                                  )}
                                  {u.verification_status !== "suspended" && (
                                    <button className="action-btn"
                                      disabled={actionLoading === u.email+"suspended"}
                                      style={{ background:"#f9fafb", color:"#4b5563", borderColor:"#d1d5db" }}
                                      onClick={() => updateStatus(u.email, "suspended")}>
                                      Suspend
                                    </button>
                                  )}
                                  <button className="action-btn"
                                    style={{ background:"#fef2f2", color:"#b91c1c", borderColor:"#fca5a5" }}
                                    onClick={() => deleteUser(u.email)}>
                                    Delete
                                  </button>
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

              {/* SLA TRACKER */}
              {tab === "sla" && (
                <div style={{ animation:"fadeUp 0.3s ease both" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, marginBottom:20 }}>
                    <StatCard label="Pending Review"     value={users.filter(u=>u.verification_status==="pending").length}                                          accent="#d97706" sub="Total awaiting"/>
                    <StatCard label="On Time"            value={users.filter(u=>u.verification_status==="pending"&&getSLAInfo(u.createdAt).urgency===0).length}     accent="#16a34a" sub="Within 24 hours"/>
                    <StatCard label="Warning"            value={users.filter(u=>u.verification_status==="pending"&&getSLAInfo(u.createdAt).urgency===1).length}     accent="#d97706" sub="24 to 48 hours"/>
                    <StatCard label="Overdue"            value={users.filter(u=>u.verification_status==="pending"&&getSLAInfo(u.createdAt).urgency===2).length}     accent="#dc2626" sub="Over 48 hours"/>
                    <StatCard label="High-Trust Pending" value={users.filter(u=>u.verification_status==="pending"&&(u.trust_score||0)>=80).length}                  accent="#2563eb" sub="Safe to bulk approve"/>
                  </div>

                  {users.filter(u => u.verification_status==="pending" && (u.trust_score||0)>=80).length > 0 && (
                    <div style={{ background:"#f0fdf4", border:"1px solid #86efac",
                      borderRadius:7, padding:"16px 20px", marginBottom:16,
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      gap:16, flexWrap:"wrap" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#15803d", marginBottom:3, letterSpacing:"0.01em" }}>
                          Bulk Approval Available
                        </div>
                        <div style={{ fontSize:12, color:"#16a34a" }}>
                          <strong>{users.filter(u=>u.verification_status==="pending"&&(u.trust_score||0)>=80).length} high-trust users</strong> are pending with a score of 80 or above — low risk, safe to approve.
                        </div>
                      </div>
                      <button disabled={bulkLoading} onClick={bulkApproveLowRisk}
                        style={{ background:"#15803d", color:"white", border:"none",
                          borderRadius:5, padding:"9px 18px", cursor:"pointer",
                          fontFamily:"DM Sans,sans-serif", fontSize:11, fontWeight:600,
                          letterSpacing:"0.05em", textTransform:"uppercase",
                          whiteSpace:"nowrap", opacity: bulkLoading?0.7:1 }}>
                        {bulkLoading ? "Processing..." : "Bulk Approve"}
                      </button>
                    </div>
                  )}

                  <div style={{ background:"white", borderRadius:7, overflow:"hidden", border:"1px solid #e5e7eb", marginBottom:14 }}>
                    <div style={{ padding:"14px 18px", borderBottom:"1px solid #f3f4f6",
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:14, fontWeight:600, color:"#111827" }}>
                        Pending Verification Queue
                      </h3>
                      <span style={{ fontSize:11, color:"#9ca3af" }}>Sorted by wait time — longest first</span>
                    </div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:780 }}>
                        <thead>
                          <tr style={{ background:"#f9fafb", borderBottom:"1px solid #e5e7eb" }}>
                            {["User","University","Trust Score","Wait Time","SLA Status","Progress","Actions"].map(h=>(
                              <th key={h} style={{ padding:"10px 13px", textAlign:"left",
                                fontSize:10, fontWeight:700, color:"#6b7280",
                                letterSpacing:"0.08em", textTransform:"uppercase" }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {users.filter(u => u.verification_status === "pending")
                            .sort((a,b) => getSLAInfo(b.createdAt).hrs - getSLAInfo(a.createdAt).hrs)
                            .map((u) => {
                              const sla = getSLAInfo(u.createdAt);
                              return (
                                <tr key={u.email} className="user-row"
                                  style={{ borderBottom:"1px solid #f3f4f6",
                                    background: sla.urgency===2?"#fff5f5": sla.urgency===1?"#fffdf0":"white" }}>
                                  <td style={{ padding:"12px 13px" }}>
                                    <div style={{ fontWeight:600, fontSize:13, color:"#111827" }}>{u.fullname}</div>
                                    <div style={{ fontSize:11, color:"#9ca3af" }}>{u.email}</div>
                                  </td>
                                  <td style={{ padding:"12px 13px", fontSize:12, color:"#374151", maxWidth:150 }}>
                                    {u.university_name || "—"}
                                  </td>
                                  <td style={{ padding:"12px 13px", cursor:"pointer" }} onClick={() => setSelectedUser(u)}>
                                    <TrustBadge score={u.trust_score||0}/>
                                  </td>
                                  <td style={{ padding:"12px 13px" }}>
                                    <div style={{ fontSize:13, fontWeight:700, color:sla.color, fontFamily:"'IBM Plex Mono',monospace" }}>
                                      {formatWaitTime(sla.hrs)}
                                    </div>
                                    <div style={{ fontSize:10, color:"#9ca3af", marginTop:2 }}>
                                      Registered: {new Date(u.createdAt).toLocaleDateString()}
                                    </div>
                                  </td>
                                  <td style={{ padding:"12px 13px" }}><SLABadge createdAt={u.createdAt}/></td>
                                  <td style={{ padding:"12px 13px", minWidth:110 }}>
                                    <SLABar createdAt={u.createdAt}/>
                                    <div style={{ fontSize:10, color:"#9ca3af", marginTop:3 }}>
                                      {Math.min(100,Math.round((sla.hrs/72)*100))}% of 72hr SLA
                                    </div>
                                  </td>
                                  <td style={{ padding:"12px 13px" }}>
                                    <div style={{ display:"flex", gap:4 }}>
                                      <button className="action-btn"
                                        style={{ background:"#f0fdf4", color:"#15803d", borderColor:"#86efac" }}
                                        onClick={() => updateStatus(u.email, "verified")}>
                                        Approve
                                      </button>
                                      <button className="action-btn"
                                        style={{ background:"#fef2f2", color:"#b91c1c", borderColor:"#fca5a5" }}
                                        onClick={() => updateStatus(u.email, "rejected")}>
                                        Reject
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          {users.filter(u=>u.verification_status==="pending").length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign:"center", padding:48, color:"#9ca3af", fontSize:13 }}>
                              No pending verifications. Queue is clear.
                            </td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ background:"white", borderRadius:7, overflow:"hidden", border:"1px solid #e5e7eb" }}>
                    <div style={{ padding:"14px 18px", borderBottom:"1px solid #f3f4f6" }}>
                      <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:14, fontWeight:600, color:"#111827" }}>
                        Recently Verified Users
                      </h3>
                    </div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse" }}>
                        <thead>
                          <tr style={{ background:"#f9fafb", borderBottom:"1px solid #e5e7eb" }}>
                            {["User","University","Trust Score","Registered","Status"].map(h=>(
                              <th key={h} style={{ padding:"10px 13px", textAlign:"left",
                                fontSize:10, fontWeight:700, color:"#6b7280",
                                letterSpacing:"0.08em", textTransform:"uppercase" }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {users.filter(u=>u.verification_status==="verified")
                            .sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
                            .slice(0,5).map((u,i)=>(
                            <tr key={u.email} className="user-row"
                              style={{ borderBottom:"1px solid #f3f4f6", background:i%2===0?"white":"#fafafa" }}>
                              <td style={{ padding:"11px 13px" }}>
                                <div style={{ fontWeight:600, fontSize:13, color:"#111827" }}>{u.fullname}</div>
                                <div style={{ fontSize:11, color:"#9ca3af" }}>{u.email}</div>
                              </td>
                              <td style={{ padding:"11px 13px", fontSize:12, color:"#374151" }}>{u.university_name||"—"}</td>
                              <td style={{ padding:"11px 13px" }}><TrustBadge score={u.trust_score||0}/></td>
                              <td style={{ padding:"11px 13px", fontSize:11, color:"#9ca3af", fontFamily:"'IBM Plex Mono',monospace" }}>
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              <td style={{ padding:"11px 13px" }}><StatusBadge status={u.verification_status}/></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TRUST SCORES */}
              {tab === "trust" && (
                <div style={{ animation:"fadeUp 0.3s ease both" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, marginBottom:20 }}>
                    <StatCard label="Average Trust" value={avgTrust}  accent="#2563eb" sub="System-wide"/>
                    <StatCard label="High Trust"    value={highTrust} accent="#16a34a" sub="Score 80 and above"/>
                    <StatCard label="Medium Trust"  value={users.filter(u=>(u.trust_score||0)>=50&&(u.trust_score||0)<80).length} accent="#d97706" sub="Score 50 to 79"/>
                    <StatCard label="Low Trust"     value={lowTrust}  accent="#dc2626" sub="Score below 50"/>
                  </div>

                  <div style={{ background:"white", borderRadius:7, overflow:"hidden", border:"1px solid #e5e7eb" }}>
                    <div style={{ padding:"14px 18px", borderBottom:"1px solid #f3f4f6",
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:14, fontWeight:600, color:"#111827" }}>
                        All User Trust Scores
                      </h3>
                      <span style={{ fontSize:11, color:"#9ca3af" }}>Click a score to view the breakdown</span>
                    </div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse" }}>
                        <thead>
                          <tr style={{ background:"#f9fafb", borderBottom:"1px solid #e5e7eb" }}>
                            {["User","Score","Email Domain","Student ID","University","Completeness","Verdict"].map(h => (
                              <th key={h} style={{ padding:"10px 13px", textAlign:"left",
                                fontSize:10, fontWeight:700, color:"#6b7280",
                                letterSpacing:"0.08em", textTransform:"uppercase" }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...users].sort((a,b)=>(b.trust_score||0)-(a.trust_score||0)).map((u,i) => {
                            const bd = u.trustBreakdown || {};
                            return (
                              <tr key={u.email} className="user-row"
                                style={{ borderBottom:"1px solid #f3f4f6", background:i%2===0?"white":"#fafafa" }}>
                                <td style={{ padding:"11px 13px" }}>
                                  <div style={{ fontWeight:600, fontSize:13, color:"#111827" }}>{u.fullname}</div>
                                  <div style={{ fontSize:11, color:"#9ca3af", fontFamily:"'IBM Plex Mono',monospace" }}>{u.student_id}</div>
                                </td>
                                <td style={{ padding:"11px 13px", cursor:"pointer" }} onClick={() => setSelectedUser(u)}>
                                  <TrustBadge score={u.trust_score||0}/>
                                </td>
                                {["emailDomain","studentId","universityName","completeness"].map(k => (
                                  <td key={k} style={{ padding:"11px 13px", textAlign:"center" }}>
                                    <span style={{
                                      background: bd[k]?.pts>0?"#f0fdf4":"#fef2f2",
                                      color: bd[k]?.pts>0?"#15803d":"#b91c1c",
                                      padding:"2px 7px", borderRadius:3, fontSize:11, fontWeight:600,
                                      fontFamily:"'IBM Plex Mono',monospace", border:`1px solid ${bd[k]?.pts>0?"#86efac":"#fca5a5"}`
                                    }}>
                                      {bd[k]?.pts>0 ? `+${bd[k].pts}` : "0"}
                                    </span>
                                  </td>
                                ))}
                                <td style={{ padding:"11px 13px" }}>
                                  <span style={{
                                    background:(u.trust_score||0)>=80?"#f0fdf4":(u.trust_score||0)>=50?"#fefce8":"#fef2f2",
                                    color: trustColor(u.trust_score||0),
                                    padding:"3px 8px", borderRadius:4, fontSize:10, fontWeight:600,
                                    letterSpacing:"0.05em", textTransform:"uppercase",
                                    border:`1px solid ${trustColor(u.trust_score||0)}30`
                                  }}>
                                    {(u.trust_score||0)>=80?"Safe to verify":(u.trust_score||0)>=50?"Review needed":"High risk"}
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