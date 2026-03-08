export default function TrustBadge({ score }) {
    const getStyle = () => {
      if (score >= 80) return { bg: '#f0fdf4', border: '#86efac', color: '#16a34a', label: 'High Trust' }
      if (score >= 50) return { bg: '#fffbeb', border: '#fde68a', color: '#d97706', label: 'Medium'    }
      return               { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', label: 'Low Trust'  }
    }
  
    const s = getStyle()
    const radius = 20
    const circumference = 2 * Math.PI * radius
    const progress = circumference - (score / 100) * circumference
  
    return (
      <div style={{ display:'flex', alignItems:'center', gap:10,
        background:s.bg, border:`1.5px solid ${s.border}`,
        borderRadius:12, padding:'8px 14px', width:'fit-content' }}>
  
        {/* Circular progress ring */}
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4"/>
          <circle cx="24" cy="24" r={radius} fill="none" stroke={s.color} strokeWidth="4"
            strokeDasharray={circumference} strokeDashoffset={progress}
            strokeLinecap="round"
            style={{ transform:'rotate(-90deg)', transformOrigin:'50% 50%', transition:'stroke-dashoffset 0.8s ease' }}/>
          <text x="24" y="28" textAnchor="middle"
            style={{ fontSize:12, fontWeight:900, fill:s.color, fontFamily:'Nunito,sans-serif' }}>
            {score}
          </text>
        </svg>
  
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:s.color }}>{s.label}</div>
          <div style={{ fontSize:11, color:'#9ca3af' }}>Trust Score</div>
        </div>
      </div>
    )
  }