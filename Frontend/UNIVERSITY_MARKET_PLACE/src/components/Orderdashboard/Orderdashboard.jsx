import React from "react";
import "./Orderdashboard.css";

const Dashboard = () => {
  // Mock transaction data
  const transactions = [
    {
      name: "Gloria White",
      avatar: "GW",
      amount: "$150.00",
      date: "11/10/24",
      type: "E-commerce",
      status: "Paid",
      statusColor: "green",
    },
    {
      name: "Markus Reines",
      avatar: "MR",
      amount: "$49.99",
      date: "09/10/24",
      type: "Phone credit",
      status: "Pending",
      statusColor: "yellow",
    },
    {
      name: "Olesya R.",
      avatar: "OR",
      amount: "$1890.00",
      date: "04/10/24",
      type: "Freelancing",
      status: "Paid",
      statusColor: "green",
    },
  ];

  // Week days for chart labels
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="dashboard-container">
      {/* ---------- LEFT SIDEBAR ---------- */}
      <aside className="sidebar">
        {/* Profile */}
        <div className="profile-section">
          <div className="avatar">
            OB
          </div>
          <div className="profile-info">
            <h2>Olga B.</h2>
            <p>+371-2-68587**</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav-menu">
          <NavItem icon="📊" label="Dashboard" active />
          <NavItem icon="📃" label="Transactions" />
          <NavItem icon="📑" label="Statement" />
          <NavItem icon="💳" label="Payment" />
          <NavItem icon="❓" label="Help & Support" />
          <div className="nav-footer">
            <NavItem icon="🚪" label="Logout" />
          </div>
        </nav>

        {/* Version info */}
        <div className="version-text">
          <span>v2.14 · fintech UI</span>
        </div>
      </aside>

      {/* ---------- MAIN CONTENT ---------- */}
      <main className="main-content">
        {/* Header with summary cards */}
        <div className="summary-grid">
          <SummaryCard
            title="Weekly totals"
            value="$989.80"
            badge="14%"
            badgeColor="green"
            icon="📆"
          />
          <SummaryCard
            title="Monthly totals"
            value="$4,245.29"
            badge="-2.3%"
            badgeColor="red"
            icon="📅"
          />
          <SummaryCard
            title="Annual totals"
            value="$25,289.29"
            badge="+8.1%"
            badgeColor="yellow"
            icon="📈"
          />
        </div>

        {/* Middle area: revenue chart + right card panel */}
        <div className="middle-area">
          {/* Revenue chart card */}
          <div className="revenue-card">
            <div className="revenue-header">
              <h3>Revenue</h3>
              <select className="chart-select">
                <option>Last 7 days</option>
                <option>Last month</option>
              </select>
            </div>
            
            {/* Dual line chart with SVG */}
            <div className="chart-container">
              <svg
                viewBox="0 0 400 120"
                className="chart-svg"
                preserveAspectRatio="none"
              >
                {/* Subtle grid lines */}
                <line x1="0" y1="100" x2="400" y2="100" className="grid-line" />
                <line x1="0" y1="70" x2="400" y2="70" className="grid-line" />
                <line x1="0" y1="40" x2="400" y2="40" className="grid-line" />
                
                {/* Neon blue line */}
                <path
                  d="M0,100 C30,95 50,70 80,60 C120,45 150,20 200,25 C250,30 280,50 320,40 C360,30 380,20 400,15"
                  fill="none"
                  className="neon-blue-line"
                />
                
                {/* Golden yellow line */}
                <path
                  d="M0,100 C40,85 70,60 110,65 C150,70 180,90 220,70 C260,50 300,30 340,25 C370,22 390,18 400,18"
                  fill="none"
                  className="neon-gold-line"
                />
              </svg>
              
              {/* Day labels */}
              <div className="chart-labels">
                {weekDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </div>
            
            <div className="chart-stats">
              <span>⬆️ +33% vs last week</span>
              <span>$37,432.77 total</span>
            </div>
          </div>

          {/* Right card panel – two credit cards */}
          <div className="right-card-panel">
            {/* Gold premium card */}
            <div className="credit-card gold-card">
              <div className="card-glow"></div>
              <div className="card-shine"></div>
              <div className="card-header-row">
                <span className="card-type">PREMIUM</span>
                <span className="card-emoji">✨</span>
              </div>
              <div>
                <p className="card-number">****  ****  ****  4892</p>
                <div className="card-details">
                  <span>Ola Bals</span>
                  <span>12/26</span>
                </div>
              </div>
              <div className="card-footer-badge">
                <span className="card-network">Mastercard.</span>
              </div>
            </div>

            {/* Purple Mastercard style */}
            <div className="credit-card purple-card">
              <div className="card-glow"></div>
              <div className="card-shine"></div>
              <div className="card-header-row">
                <span className="card-type">PREMIUM</span>
                <span className="card-emoji">💜</span>
              </div>
              <div>
                <p className="card-number">****  ****  ****  0012</p>
                <div className="card-details">
                  <span>Ola Bals</span>
                  <span>08/27</span>
                </div>
              </div>
              <div className="card-footer-badge">
                <span className="card-network">Mastercard.</span>
              </div>
            </div>
            
            {/* Mini stats below cards */}
            <div className="mini-stats">
              <span>💰 Transaction <span className="stat-value">19</span></span>
              <span>📋 Statement <span className="stat-value">$2000</span></span>
              <span>💸 Payment <span className="stat-value">$1000</span></span>
            </div>
          </div>
        </div>

        {/* Transactions table */}
        <div className="transactions-table">
          <h3>Transactions</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="name-cell">
                        <div className="name-avatar">
                          {tx.avatar}
                        </div>
                        {tx.name}
                      </div>
                    </td>
                    <td className="amount-cell">{tx.amount}</td>
                    <td className="date-cell">{tx.date}</td>
                    <td>
                      <span className="type-badge">
                        {tx.type}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          tx.statusColor === "green"
                            ? "status-paid"
                            : "status-pending"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper component for navigation items
const NavItem = ({ icon, label, active = false }) => (
  <div className={`nav-item ${active ? 'active' : ''}`}>
    <span className="nav-icon">{icon}</span>
    <span>{label}</span>
    {active && <span className="nav-badge"></span>}
  </div>
);

// Helper component for summary cards
const SummaryCard = ({ title, value, badge, badgeColor, icon }) => {
  const colorClasses = {
    green: 'badge-green',
    red: 'badge-red',
    yellow: 'badge-yellow',
  };
  
  return (
    <div className="summary-card">
      <div className="card-header">
        <span className="card-title">{title}</span>
        <span className="card-icon">{icon}</span>
      </div>
      <div className="card-footer">
        <span className="card-value">{value}</span>
        <span className={`card-badge ${colorClasses[badgeColor]}`}>
          {badge}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;