import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const BASE = "http://localhost:5000";


const trustColor = (s) => s >= 80 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";
const trustLabel = (s) => s >= 80 ? "High" : s >= 50 ? "Medium" : "Low";
const statusColor = { verified:"#22c55e", pending:"#f59e0b", rejected:"#ef4444", suspended:"#6b7280" };
const statusBg    = { verified:"#f0fdf4", pending:"#fffbeb", rejected:"#fef2f2", suspended:"#f9fafb" };


const getSLAInfo = (createdAt) => {
  const hrs = (Date.now() - new Date(createdAt)) / (1000 * 60 * 60);
  if (hrs < 24)  return { hrs, color:"#22c55e", bg:"#f0fdf4", border:"#bbf7d0", label:"On Time", urgency:0 }
  if (hrs < 48)  return { hrs, color:"#f59e0b", bg:"#fffbeb", border:"#fde68a", label:"Warning", urgency:1 }
  return               { hrs, color:"#ef4444", bg:"#fef2f2", border:"#fecaca", label:"Overdue", urgency:2 }
}

const formatWaitTime = (hrs) => {
  if (hrs < 1)   return `${Math.round(hrs * 60)}m waiting`
  if (hrs < 24)  return `${Math.round(hrs)}h waiting`
  return `${Math.floor(hrs/24)}d ${Math.round(hrs%24)}h waiting`
}

function TrustBadge({ score }) {
  const c = trustColor(score);
  const r = 18, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8,
      background: score>=80?"#f0fdf4": score>=50?"#fffbeb":"#fef2f2",
      border:`1.5px solid ${c}33`, borderRadius:10, padding:"6px 10px" }}>
      <svg width="42" height="42" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3.5"/>
        <circle cx="21" cy="21" r={r} fill="none" stroke={c} strokeWidth="3.5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transform:"rotate(-90deg)", transformOrigin:"50% 50%", transition:"stroke-dashoffset 1s ease" }}/>
        <text x="21" y="25" textAnchor="middle" style={{ fontSize:11, fontWeight:900, fill:c, fontFamily:"Nunito,sans-serif" }}>{score}</text>
      </svg>
      <div>
        <div style={{ fontSize:12, fontWeight:800, color:c }}>{trustLabel(score)}</div>
        <div style={{ fontSize:10, color:"#9ca3af" }}>Trust</div>
      </div>
    </div>
  );
}


function StatusBadge({ status }) {
  const icons = { verified:"", pending:"", rejected:"", suspended:"" };
  return (
    <span style={{
      background: statusBg[status]||"#f9fafb",
      color: statusColor[status]||"#6b7280",
      border:`1px solid ${statusColor[status]||"#e5e7eb"}44`,
      borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700
    }}>
      {icons[status]} {status}
    </span>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background:"white", borderRadius:16, padding:"20px 24px",
      boxShadow:"0 4px 24px rgba(0,0,0,0.07)", borderTop:`4px solid ${color}`,
      display:"flex", flexDirection:"column", gap:4, minWidth:0,
      animation:"fadeUp 0.5s ease both"
    }}>
      <div style={{ fontSize:28 }}>{icon}</div>
      <div style={{ fontSize:28, fontWeight:900, color:"#1e0a3c", fontFamily:"Nunito,sans-serif", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:13, fontWeight:700, color:"#374151" }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:"#9ca3af" }}>{sub}</div>}
    </div>
  );
}

// ── Trust Breakdown Modal ─────────────────────────────────────
function TrustModal({ user, onClose }) {
  if (!user) return null;
  const bd = user.trustBreakdown || {};
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}>
      <div style={{ background:"white", borderRadius:20, padding:32, width:420, maxWidth:"90vw",
        boxShadow:"0 24px 80px rgba(0,0,0,0.2)", animation:"popIn 0.3s ease both" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontFamily:"Nunito,sans-serif", fontSize:20, fontWeight:900, color:"#1e0a3c" }}>
            Trust Score Breakdown
          </h3>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#9ca3af" }}>✕</button>
        </div>
        <div style={{ marginBottom:16, textAlign:"center" }}>
          <TrustBadge score={user.trust_score || 0} />
          <div style={{ fontSize:12, color:"#9ca3af", marginTop:8 }}>{user.fullname} — {user.email}</div>
        </div>
        {Object.entries(bd).map(([key, val]) => (
          <div key={key} style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:12, fontWeight:700, color:"#374151", textTransform:"capitalize" }}>
                {key.replace(/([A-Z])/g," $1")}
              </span>
              <span style={{ fontSize:12, fontWeight:800, color: val.pts>0?"#22c55e":"#ef4444" }}>
                +{val.pts} pts
              </span>
            </div>
            <div style={{ background:"#f3f4f6", borderRadius:99, height:6, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(val.pts/30)*100}%`,
                background: val.pts>0?"#22c55e":"#ef4444",
                borderRadius:99, transition:"width 0.8s ease" }}/>
            </div>
            <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>{val.note}</div>
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
        background:sla.bg, border:`1.5px solid ${sla.border}`,
        color:sla.color, borderRadius:20, padding:"3px 10px",
        fontSize:11, fontWeight:800, whiteSpace:"nowrap"
      }}>
        {sla.icon} {sla.label}
      </span>
      <span style={{ fontSize:10, color:"#9ca3af", paddingLeft:4 }}>
        {formatWaitTime(sla.hrs)}
      </span>
    </div>
  );
}

function SLABar({ createdAt }) {
  const sla = getSLAInfo(createdAt);
  const pct = Math.min(100, (sla.hrs / 72) * 100); // 72hr = full bar
  return (
    <div style={{ width:"100%", background:"#f3f4f6", borderRadius:99, height:6, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${pct}%`, background:sla.color,
        borderRadius:99, transition:"width 0.8s ease" }}/>
    </div>
  );
}


export default function AdminDashboard() {
  const [tab, setTab]           = useState("overview");
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTrust, setFilterTrust]   = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast]       = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

 
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
      showToast(`User ${status} successfully `);
    } catch { showToast("Action failed ", "error"); }
    finally { setActionLoading(null); }
  };

  const deleteUser = async (email) => {
    if (!window.confirm(`Delete ${email}?`)) return;
    try {
      await axios.delete(`${BASE}/Users/${email}`);
      setUsers(prev => prev.filter(u => u.email !== email));
      showToast("User deleted ");
    } catch { showToast("Delete failed 😿", "error"); }
  };

  // bulk approve all high-trust pending users
  const bulkApproveLowRisk = async () => {
    const eligible = users.filter(u =>
      u.verification_status === "pending" && (u.trust_score||0) >= 80
    );
    if (eligible.length === 0) { showToast("No high-trust pending users to approve 🐾", "error"); return; }
    if (!window.confirm(`Bulk approve ${eligible.length} high-trust users?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(eligible.map(u =>
        axios.put(`${BASE}/Users/${u.email}`, { verification_status: "verified" })
      ));
      setUsers(prev => prev.map(u =>
        eligible.find(e => e.email === u.email)
          ? { ...u, verification_status: "verified" }
          : u
      ));
      showToast(` ${eligible.length} users approved successfully!`);
    } catch { showToast("Bulk approve failed 😿", "error"); }
    finally { setBulkLoading(false); }
  };

  // ── Derived stats ─────────────────────────────────────────
  const total     = users.length;
  const verified  = users.filter(u => u.verification_status === "verified").length;
  const pending   = users.filter(u => u.verification_status === "pending").length;
  const rejected  = users.filter(u => u.verification_status === "rejected").length;
  const suspended = users.filter(u => u.verification_status === "suspended").length;
  const highTrust = users.filter(u => (u.trust_score||0) >= 80).length;
  const lowTrust  = users.filter(u => (u.trust_score||0) < 50).length;
  const avgTrust  = total ? Math.round(users.reduce((a,u) => a+(u.trust_score||0),0)/total) : 0;

  // chart data
  const statusPie = [
    { name:"Verified",  value:verified,  color:"#22c55e" },
    { name:"Pending",   value:pending,   color:"#f59e0b" },
    { name:"Rejected",  value:rejected,  color:"#ef4444" },
    { name:"Suspended", value:suspended, color:"#6b7280" },
  ].filter(d => d.value > 0);

  const trustDist = [
    { label:"High (80-100)", count: users.filter(u=>(u.trust_score||0)>=80).length, fill:"#22c55e" },
    { label:"Medium (50-79)",count: users.filter(u=>(u.trust_score||0)>=50&&(u.trust_score||0)<80).length, fill:"#f59e0b" },
    { label:"Low (0-49)",    count: users.filter(u=>(u.trust_score||0)<50).length, fill:"#ef4444" },
  ];

  const uniBar = Object.entries(
    users.reduce((acc, u) => {
      const k = u.university_name || "Unknown";
      acc[k] = (acc[k]||0) + 1; return acc;
    }, {})
  ).map(([uni, count]) => ({ uni: uni.length>18 ? uni.slice(0,18)+"…" : uni, count }))
   .sort((a,b) => b.count - a.count).slice(0,6);

  const gradYearLine = Object.entries(
    users.reduce((acc, u) => {
      const y = u.graduate_year || "Unknown";
      acc[y] = (acc[y]||0) + 1; return acc;
    }, {})
  ).map(([year, count]) => ({ year, count })).sort((a,b) => a.year - b.year);

  // filtered users
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
    { id:"overview", label:"Overview"    },
    { id:"users",    label:"Users"       },
    { id:"trust",    label:"Trust Scores"},
    { id:"sla",      label:"SLA Tracker" },
  ];

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'DM Sans',sans-serif; background:#f0f2ff; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
    @keyframes popIn  { from{opacity:0;transform:scale(0.9);}to{opacity:1;transform:scale(1);} }
    @keyframes slideIn{ from{opacity:0;transform:translateX(-16px);}to{opacity:1;transform:translateX(0);} }
    ::-webkit-scrollbar{width:6px;height:6px;}
    ::-webkit-scrollbar-track{background:#f1f5f9;}
    ::-webkit-scrollbar-thumb{background:#c4b5fd;border-radius:99px;}
    .tab-btn { padding:10px 20px; border:none; border-radius:10px; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700;
      transition:all 0.2s; background:transparent; color:#6b7280; }
    .tab-btn.active { background:#1e0a3c; color:white; box-shadow:0 4px 14px rgba(30,10,60,0.3); }
    .tab-btn:hover:not(.active) { background:#f3f0ff; color:#1e0a3c; }
    .action-btn { padding:5px 12px; border-radius:8px; border:none; cursor:pointer;
      font-size:11px; font-weight:700; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
    .action-btn:hover { transform:translateY(-1px); filter:brightness(1.1); }
    .user-row { animation:slideIn 0.3s ease both; }
    .user-row:hover { background:#faf8ff !important; }
    input, select { font-family:'DM Sans',sans-serif; }
  `;

  return (
    <>
      <style>{CSS}</style>


      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:9999,
          background: toast.type==="error"?"#fef2f2":"#f0fdf4",
          border:`1px solid ${toast.type==="error"?"#fecaca":"#bbf7d0"}`,
          borderRadius:12, padding:"12px 20px", fontSize:13, fontWeight:700,
          color: toast.type==="error"?"#dc2626":"#16a34a",
          boxShadow:"0 8px 30px rgba(0,0,0,0.12)", animation:"popIn 0.3s ease both" }}>
          {toast.msg}
        </div>
      )}


      <TrustModal user={selectedUser} onClose={() => setSelectedUser(null)} />

      <div style={{ minHeight:"100vh", background:"#f0f2ff" }}>

   
        <div style={{ display:"flex", minHeight:"100vh" }}>

          {/* Sidebar */}
          <div style={{ width:240, background:"linear-gradient(180deg,#1e0a3c 0%,#2d1060 100%)",
            padding:"32px 16px", display:"flex", flexDirection:"column", gap:8,
            boxShadow:"4px 0 24px rgba(0,0,0,0.15)", flexShrink:0 }}>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ fontSize:32, marginBottom:4 }}>🎓</div>
              <div style={{ fontFamily:"Nunito,sans-serif", fontSize:16, fontWeight:900,
                color:"white", lineHeight:1.2 }}>University<br/>Marketplace</div>
              <div style={{ fontSize:10, color:"#a78bfa", letterSpacing:"0.12em",
                textTransform:"uppercase", marginTop:4 }}>Admin Panel</div>
            </div>

            {TABS.map(t => (
              <button key={t.id} className={`tab-btn ${tab===t.id?"active":""}`}
                style={{ textAlign:"left", borderRadius:10,
                  background: tab===t.id?"rgba(255,255,255,0.15)":"transparent",
                  color: tab===t.id?"white":"#a78bfa" }}
                onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}

            <div style={{ marginTop:"auto", padding:"16px 8px",
              borderTop:"1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize:11, color:"#7c3aed", fontWeight:700, marginBottom:4 }}>SYSTEM STATUS</div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e",
                  boxShadow:"0 0 6px #22c55e" }}/>
                <span style={{ fontSize:12, color:"#a78bfa" }}>All systems operational</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex:1, padding:32, overflowY:"auto" }}>

            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
              <div>
                <h1 style={{ fontFamily:"Nunito,sans-serif", fontSize:28, fontWeight:900,
                  color:"#1e0a3c", marginBottom:2 }}>
                  { tab==="overview" ? "Dashboard Overview" :
                    tab==="users"    ? "User Management" :
                    tab==="sla"      ? "Verification SLA Tracker" :
                    " Trust Score Analysis" }
                </h1>
                <p style={{ fontSize:13, color:"#9ca3af" }}>
                  University Marketplace — Admin Control Panel
                </p>
              </div>
              <button onClick={fetchUsers}
                style={{ background:"#1e0a3c", color:"white", border:"none",
                  borderRadius:10, padding:"10px 18px", cursor:"pointer",
                  fontSize:12, fontWeight:700, fontFamily:"DM Sans,sans-serif",
                  display:"flex", alignItems:"center", gap:6 }}>
                Refresh
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign:"center", padding:80, color:"#9ca3af", fontSize:16 }}>
                <div style={{ fontSize:48, marginBottom:16 }}></div>
                Loading dashboard data...
              </div>
            ) : (
              <>
                {/* ══ OVERVIEW TAB ══ */}
                {tab === "overview" && (
                  <div style={{ animation:"fadeUp 0.4s ease both" }}>

                    {/* Stat Cards */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:16, marginBottom:28 }}>
                      <StatCard icon="" label="Total Users"    value={total}    color="#06b6d4" sub="Registered accounts"/>
                      <StatCard icon="" label="Verified"       value={verified}  color="#22c55e" sub={`${total?Math.round(verified/total*100):0}% of total`}/>
                      <StatCard icon="" label="Pending"        value={pending}   color="#f59e0b" sub="Awaiting review"/>
                      <StatCard icon="" label="Rejected"       value={rejected}  color="#ef4444" sub="Not approved"/>
                      <StatCard icon="" label="Avg Trust Score" value={avgTrust} color="#8b5cf6" sub="Out of 100"/>
                      <StatCard icon="" label="High Trust"     value={highTrust} color="#22c55e" sub="Score ≥ 80"/>
                      <StatCard icon="" label="Low Trust"      value={lowTrust}  color="#ef4444" sub="Score < 50 — review"/>
                    </div>

                    {/* Charts Row 1 */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>

                      {/* Verification Pie */}
                      <div style={{ background:"white", borderRadius:16, padding:24, boxShadow:"0 4px 24px rgba(0,0,0,0.07)" }}>
                        <h3 style={{ fontFamily:"Nunito,sans-serif", fontSize:16, fontWeight:800, color:"#1e0a3c", marginBottom:16 }}>
                          Verification Status
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie data={statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                              paddingAngle={4} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                              labelLine={false}>
                              {statusPie.map((e,i) => <Cell key={i} fill={e.color}/>)}
                            </Pie>
                            <Tooltip/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Trust Distribution Bar */}
                      <div style={{ background:"white", borderRadius:16, padding:24, boxShadow:"0 4px 24px rgba(0,0,0,0.07)" }}>
                        <h3 style={{ fontFamily:"Nunito,sans-serif", fontSize:16, fontWeight:800, color:"#1e0a3c", marginBottom:16 }}>
                          Trust Score Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={trustDist} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                            <XAxis dataKey="label" tick={{ fontSize:11 }} tickLine={false}/>
                            <YAxis tick={{ fontSize:11 }} tickLine={false} axisLine={false}/>
                            <Tooltip/>
                            <Bar dataKey="count" radius={[8,8,0,0]}>
                              {trustDist.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Charts Row 2 */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

                      {/* University Bar */}
                      <div style={{ background:"white", borderRadius:16, padding:24, boxShadow:"0 4px 24px rgba(0,0,0,0.07)" }}>
                        <h3 style={{ fontFamily:"Nunito,sans-serif", fontSize:16, fontWeight:800, color:"#1e0a3c", marginBottom:16 }}>
                          Users by University
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={uniBar} layout="vertical" barSize={16}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false}/>
                            <XAxis type="number" tick={{ fontSize:11 }} tickLine={false} axisLine={false}/>
                            <YAxis type="category" dataKey="uni" tick={{ fontSize:10 }} width={120} tickLine={false}/>
                            <Tooltip/>
                            <Bar dataKey="count" fill="#7c3aed" radius={[0,8,8,0]}/>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Graduate Year Line */}
                      <div style={{ background:"white", borderRadius:16, padding:24, boxShadow:"0 4px 24px rgba(0,0,0,0.07)" }}>
                        <h3 style={{ fontFamily:"Nunito,sans-serif", fontSize:16, fontWeight:800, color:"#1e0a3c", marginBottom:16 }}>
                          Graduate Year Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                          <LineChart data={gradYearLine}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                            <XAxis dataKey="year" tick={{ fontSize:11 }} tickLine={false}/>
                            <YAxis tick={{ fontSize:11 }} tickLine={false} axisLine={false}/>
                            <Tooltip/>
                            <Line type="monotone" dataKey="count" stroke="#06b6d4"
                              strokeWidth={3} dot={{ fill:"#06b6d4", r:5 }} activeDot={{ r:7 }}/>
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>
                )}

                {/* ══ USERS TAB ══ */}
                {tab === "users" && (
                  <div style={{ animation:"fadeUp 0.4s ease both" }}>

                    {/* Filters */}
                    <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
                      <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="🔍 Search name, email, student ID, university..."
                        style={{ flex:1, minWidth:240, padding:"10px 16px", border:"2px solid #e9d5ff",
                          borderRadius:10, fontSize:13, outline:"none", background:"white" }}/>
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        style={{ padding:"10px 14px", border:"2px solid #e9d5ff", borderRadius:10,
                          fontSize:13, outline:"none", background:"white", cursor:"pointer" }}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      <select value={filterTrust} onChange={e => setFilterTrust(e.target.value)}
                        style={{ padding:"10px 14px", border:"2px solid #e9d5ff", borderRadius:10,
                          fontSize:13, outline:"none", background:"white", cursor:"pointer" }}>
                        <option value="all">All Trust</option>
                        <option value="high">High Trust</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low Trust</option>
                      </select>
                    </div>

                    <div style={{ fontSize:12, color:"#9ca3af", marginBottom:12 }}>
                      Showing {filtered.length} of {total} users
                    </div>

                    {/* Table */}
                    <div style={{ background:"white", borderRadius:16, overflow:"hidden",
                      boxShadow:"0 4px 24px rgba(0,0,0,0.07)" }}>
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
                          <thead>
                            <tr style={{ background:"#f8f7ff", borderBottom:"2px solid #e9d5ff" }}>
                              {["User","University","Student ID","Trust","Status","ID Pic","Actions"].map(h => (
                                <th key={h} style={{ padding:"14px 16px", textAlign:"left",
                                  fontSize:11, fontWeight:800, color:"#7c3aed",
                                  letterSpacing:"0.08em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.length === 0 ? (
                              <tr><td colSpan={7} style={{ textAlign:"center", padding:48, color:"#9ca3af" }}>
                                No users found
                              </td></tr>
                            ) : filtered.map((u, i) => (
                              <tr key={u.email} className="user-row"
                                style={{ borderBottom:"1px solid #f3f4f6",
                                  background: i%2===0?"white":"#fafbff",
                                  transition:"background 0.15s" }}>

                                {/* User */}
                                <td style={{ padding:"14px 16px" }}>
                                  <div style={{ fontWeight:700, color:"#1e0a3c", fontSize:13 }}>{u.fullname}</div>
                                  <div style={{ fontSize:11, color:"#9ca3af" }}>{u.email}</div>
                                  <div style={{ fontSize:10, color:"#c4b5fd", marginTop:2 }}>
                                     {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                                  </div>
                                </td>

                                {/* University */}
                                <td style={{ padding:"14px 16px", fontSize:12, color:"#374151", maxWidth:160 }}>
                                  {u.university_name || "—"}
                                </td>

                                {/* Student ID */}
                                <td style={{ padding:"14px 16px" }}>
                                  <code style={{ background:"#f3f0ff", color:"#7c3aed",
                                    padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:700 }}>
                                    {u.student_id}
                                  </code>
                                  <div style={{ fontSize:10, color:"#9ca3af", marginTop:2 }}>
                                    Grad: {u.graduate_year || "—"}
                                  </div>
                                </td>

                                {/* Trust */}
                                <td style={{ padding:"14px 16px" }}>
                                  <div style={{ cursor:"pointer" }} onClick={() => setSelectedUser(u)}
                                    title="Click for breakdown">
                                    <TrustBadge score={u.trust_score || 0}/>
                                  </div>
                                </td>

                                {/* Status */}
                                <td style={{ padding:"14px 16px" }}>
                                  <StatusBadge status={u.verification_status}/>
                                </td>

                                {/* ID Pic */}
                                <td style={{ padding:"14px 16px" }}>
                                  {u.student_id_pic ? (
                                    <button className="action-btn"
                                      style={{ background:"#f0f9ff", color:"#0284c7" }}
                                      onClick={() => window.open(`${BASE}/uploads/${u.student_id_pic.replace("uploads/","")}`, "_blank")}>
                                      View
                                    </button>
                                  ) : <span style={{ fontSize:11, color:"#d1d5db" }}>No file</span>}
                                </td>

                                {/* Actions */}
                                <td style={{ padding:"14px 16px" }}>
                                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                    {u.verification_status !== "verified" && (
                                      <button className="action-btn"
                                        disabled={actionLoading === u.email+"verified"}
                                        style={{ background:"#f0fdf4", color:"#16a34a" }}
                                        onClick={() => updateStatus(u.email, "verified")}>
                                        Approve
                                      </button>
                                    )}
                                    {u.verification_status !== "rejected" && (
                                      <button className="action-btn"
                                        disabled={actionLoading === u.email+"rejected"}
                                        style={{ background:"#fef2f2", color:"#dc2626" }}
                                        onClick={() => updateStatus(u.email, "rejected")}>
                                        Reject
                                      </button>
                                    )}
                                    {u.verification_status !== "suspended" && (
                                      <button className="action-btn"
                                        disabled={actionLoading === u.email+"suspended"}
                                        style={{ background:"#f9fafb", color:"#6b7280" }}
                                        onClick={() => updateStatus(u.email, "suspended")}>
                                         Suspend
                                      </button>
                                    )}
                                    <button className="action-btn"
                                      style={{ background:"#fef2f2", color:"#dc2626" }}
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

                {/* ══ SLA TRACKER TAB ══ */}
                {tab === "sla" && (
                  <div style={{ animation:"fadeUp 0.4s ease both" }}>

                    {/* SLA Summary Cards */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:16, marginBottom:28 }}>
                      <StatCard icon="" label="Pending Review"
                        value={users.filter(u=>u.verification_status==="pending").length}
                        color="#f59e0b" sub="Total awaiting"/>
                      <StatCard icon="" label="On Time (< 24h)"
                        value={users.filter(u=>u.verification_status==="pending" && getSLAInfo(u.createdAt).urgency===0).length}
                        color="#22c55e" sub="Within SLA"/>
                      <StatCard icon="" label="Warning (24–48h)"
                        value={users.filter(u=>u.verification_status==="pending" && getSLAInfo(u.createdAt).urgency===1).length}
                        color="#f59e0b" sub="Needs attention"/>
                      <StatCard icon="" label="Overdue (> 48h)"
                        value={users.filter(u=>u.verification_status==="pending" && getSLAInfo(u.createdAt).urgency===2).length}
                        color="#ef4444" sub="Action required!"/>
                      <StatCard icon="" label="High-Trust Pending"
                        value={users.filter(u=>u.verification_status==="pending" && (u.trust_score||0)>=80).length}
                        color="#8b5cf6" sub="Safe to bulk approve"/>
                    </div>

                    {/* Bulk Approve Banner */}
                    {users.filter(u => u.verification_status==="pending" && (u.trust_score||0)>=80).length > 0 && (
                      <div style={{ background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",
                        border:"2px solid #86efac", borderRadius:16, padding:"20px 24px",
                        marginBottom:24, display:"flex", alignItems:"center",
                        justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
                        <div>
                          <div style={{ fontFamily:"Nunito,sans-serif", fontSize:16, fontWeight:900, color:"#15803d", marginBottom:4 }}>
                            🚀 Quick Win Available!
                          </div>
                          <div style={{ fontSize:13, color:"#16a34a" }}>
                            <strong>{users.filter(u=>u.verification_status==="pending"&&(u.trust_score||0)>=80).length} high-trust users</strong> are pending verification with a trust score ≥ 80.
                            These are low-risk and safe to approve instantly.
                          </div>
                        </div>
                        <button disabled={bulkLoading} onClick={bulkApproveLowRisk}
                          style={{ background:"#16a34a", color:"white", border:"none",
                            borderRadius:12, padding:"12px 24px", cursor:"pointer",
                            fontFamily:"DM Sans,sans-serif", fontSize:13, fontWeight:800,
                            whiteSpace:"nowrap", boxShadow:"0 4px 14px rgba(22,163,74,0.35)",
                            opacity: bulkLoading?0.7:1 }}>
                          {bulkLoading ? "Approving..." : "⚡ Bulk Approve All"}
                        </button>
                      </div>
                    )}

                    {/* SLA Table — pending only, sorted by urgency */}
                    <div style={{ background:"white", borderRadius:16, overflow:"hidden",
                      boxShadow:"0 4px 24px rgba(0,0,0,0.07)", marginBottom:24 }}>
                      <div style={{ padding:"20px 24px", borderBottom:"2px solid #f3f4f6",
                        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <h3 style={{ fontFamily:"Nunito,sans-serif", fontSize:16, fontWeight:800, color:"#1e0a3c" }}>
                          ⏳ Pending Verification Queue
                        </h3>
                        <span style={{ fontSize:12, color:"#9ca3af" }}>Sorted by wait time — longest first</span>
                      </div>
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:800 }}>
                          <thead>
                            <tr style={{ background:"#f8f7ff" }}>
                              {["User","University","Trust Score","Wait Time","SLA Status","Progress","Actions"].map(h=>(
                                <th key={h} style={{ padding:"12px 16px", textAlign:"left",
                                  fontSize:11, fontWeight:800, color:"#7c3aed",
                                  letterSpacing:"0.08em", textTransform:"uppercase" }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {users
                              .filter(u => u.verification_status === "pending")
                              .sort((a,b) => getSLAInfo(b.createdAt).hrs - getSLAInfo(a.createdAt).hrs)
                              .map((u, i) => {
                                const sla = getSLAInfo(u.createdAt);
                                return (
                                  <tr key={u.email} className="user-row"
                                    style={{ borderBottom:"1px solid #f3f4f6",
                                      background: sla.urgency===2?"#fff5f5": sla.urgency===1?"#fffdf0":"white" }}>
                                    <td style={{ padding:"14px 16px" }}>
                                      <div style={{ fontWeight:700, fontSize:13, color:"#1e0a3c" }}>{u.fullname}</div>
                                      <div style={{ fontSize:11, color:"#9ca3af" }}>{u.email}</div>
                                    </td>
                                    <td style={{ padding:"14px 16px", fontSize:12, color:"#374151", maxWidth:160 }}>
                                      {u.university_name || "—"}
                                    </td>
                                    <td style={{ padding:"14px 16px", cursor:"pointer" }}
                                      onClick={() => setSelectedUser(u)}>
                                      <TrustBadge score={u.trust_score||0}/>
                                    </td>
                                    <td style={{ padding:"14px 16px" }}>
                                      <div style={{ fontSize:13, fontWeight:800, color:sla.color }}>
                                        {formatWaitTime(sla.hrs)}
                                      </div>
                                      <div style={{ fontSize:10, color:"#9ca3af", marginTop:2 }}>
                                        Registered: {new Date(u.createdAt).toLocaleDateString()}
                                      </div>
                                    </td>
                                    <td style={{ padding:"14px 16px" }}>
                                      <SLABadge createdAt={u.createdAt}/>
                                    </td>
                                    <td style={{ padding:"14px 16px", minWidth:120 }}>
                                      <SLABar createdAt={u.createdAt}/>
                                      <div style={{ fontSize:10, color:"#9ca3af", marginTop:3 }}>
                                        {Math.min(100,Math.round((sla.hrs/72)*100))}% of 72hr SLA
                                      </div>
                                    </td>
                                    <td style={{ padding:"14px 16px" }}>
                                      <div style={{ display:"flex", gap:6 }}>
                                        <button className="action-btn"
                                          style={{ background:"#f0fdf4", color:"#16a34a" }}
                                          onClick={() => updateStatus(u.email, "verified")}>
                                          Approve
                                        </button>
                                        <button className="action-btn"
                                          style={{ background:"#fef2f2", color:"#dc2626" }}
                                          onClick={() => updateStatus(u.email, "rejected")}>
                                          Reject
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            {users.filter(u=>u.verification_status==="pending").length === 0 && (
                              <tr><td colSpan={7} style={{ textAlign:"center", padding:48, color:"#9ca3af" }}>
                                 No pending verifications! All caught up.
                              </td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Already verified/rejected today */}
                    <div style={{ background:"white", borderRadius:16, overflow:"hidden",
                      boxShadow:"0 4px 24px rgba(0,0,0,0.07)" }}>
                      <div style={{ padding:"20px 24px", borderBottom:"2px solid #f3f4f6" }}>
                        <h3 style={{ fontFamily:"Nunito,sans-serif", fontSize:16, fontWeight:800, color:"#1e0a3c" }}>
                           Recently Verified Users
                        </h3>
                      </div>
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ width:"100%", borderCollapse:"collapse" }}>
                          <thead>
                            <tr style={{ background:"#f8f7ff" }}>
                              {["User","University","Trust Score","Registered","Status"].map(h=>(
                                <th key={h} style={{ padding:"12px 16px", textAlign:"left",
                                  fontSize:11, fontWeight:800, color:"#7c3aed",
                                  letterSpacing:"0.08em", textTransform:"uppercase" }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {users.filter(u=>u.verification_status==="verified")
                              .sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
                              .slice(0,5)
                              .map((u,i)=>(
                              <tr key={u.email} className="user-row"
                                style={{ borderBottom:"1px solid #f3f4f6",
                                  background:i%2===0?"white":"#fafbff" }}>
                                <td style={{ padding:"12px 16px" }}>
                                  <div style={{ fontWeight:700, fontSize:13, color:"#1e0a3c" }}>{u.fullname}</div>
                                  <div style={{ fontSize:11, color:"#9ca3af" }}>{u.email}</div>
                                </td>
                                <td style={{ padding:"12px 16px", fontSize:12, color:"#374151" }}>{u.university_name||"—"}</td>
                                <td style={{ padding:"12px 16px" }}><TrustBadge score={u.trust_score||0}/></td>
                                <td style={{ padding:"12px 16px", fontSize:12, color:"#9ca3af" }}>
                                  {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding:"12px 16px" }}><StatusBadge status={u.verification_status}/></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

                {tab === "trust" && (
                  <div style={{ animation:"fadeUp 0.4s ease both" }}>

                    {/* Summary */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:16, marginBottom:28 }}>
                      <StatCard icon="" label="Average Trust"  value={avgTrust}  color="#8b5cf6" sub="System-wide"/>
                      <StatCard icon="" label="High Trust"     value={highTrust} color="#22c55e" sub="Score ≥ 80"/>
                      <StatCard icon="" label="Medium Trust"   value={users.filter(u=>(u.trust_score||0)>=50&&(u.trust_score||0)<80).length} color="#f59e0b" sub="Score 50–79"/>
                      <StatCard icon="" label="Low Trust"      value={lowTrust}  color="#ef4444" sub="Score < 50"/>
                    </div>

                    {/* Trust Score Table */}
                    <div style={{ background:"white", borderRadius:16, overflow:"hidden",
                      boxShadow:"0 4px 24px rgba(0,0,0,0.07)" }}>
                      <div style={{ padding:"20px 24px", borderBottom:"2px solid #f3f4f6",
                        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <h3 style={{ fontFamily:"Nunito,sans-serif", fontSize:16, fontWeight:800, color:"#1e0a3c" }}>
                          All User Trust Scores
                        </h3>
                        <span style={{ fontSize:12, color:"#9ca3af" }}>Click score to see breakdown</span>
                      </div>
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ width:"100%", borderCollapse:"collapse" }}>
                          <thead>
                            <tr style={{ background:"#f8f7ff" }}>
                              {["User","Score","Email Domain","Student ID","University","Completeness","Verdict"].map(h => (
                                <th key={h} style={{ padding:"12px 16px", textAlign:"left",
                                  fontSize:11, fontWeight:800, color:"#7c3aed",
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
                                  style={{ borderBottom:"1px solid #f3f4f6",
                                    background: i%2===0?"white":"#fafbff" }}>
                                  <td style={{ padding:"12px 16px" }}>
                                    <div style={{ fontWeight:700, fontSize:13, color:"#1e0a3c" }}>{u.fullname}</div>
                                    <div style={{ fontSize:11, color:"#9ca3af" }}>{u.student_id}</div>
                                  </td>
                                  <td style={{ padding:"12px 16px", cursor:"pointer" }}
                                    onClick={() => setSelectedUser(u)}>
                                    <TrustBadge score={u.trust_score||0}/>
                                  </td>
                                  {["emailDomain","studentId","universityName","completeness"].map(k => (
                                    <td key={k} style={{ padding:"12px 16px", textAlign:"center" }}>
                                      <span style={{
                                        background: bd[k]?.pts>0?"#f0fdf4":"#fef2f2",
                                        color: bd[k]?.pts>0?"#16a34a":"#dc2626",
                                        padding:"2px 8px", borderRadius:6, fontSize:11, fontWeight:700
                                      }}>
                                        {bd[k]?.pts>0 ? `+${bd[k].pts}` : "0"} pts
                                      </span>
                                    </td>
                                  ))}
                                  <td style={{ padding:"12px 16px" }}>
                                    <span style={{
                                      background:(u.trust_score||0)>=80?"#f0fdf4":(u.trust_score||0)>=50?"#fffbeb":"#fef2f2",
                                      color: trustColor(u.trust_score||0),
                                      padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:800
                                    }}>
                                      {(u.trust_score||0)>=80?" Safe to verify":(u.trust_score||0)>=50?"Review needed":"High risk"}
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
          </div>
        </div>
      </div>
    </>
  );
}