import React from "react";

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
    <div className="min-h-screen bg-[#0B0F1E] text-[#f3f4f6] p-4 sm:p-5 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 font-['Inter',-apple-system,sans-serif]">
      
      {/* ---------- LEFT SIDEBAR ---------- */}
      <aside className="lg:w-72 w-full bg-[rgba(20,24,44,0.8)] backdrop-blur-xl rounded-2xl p-5 lg:p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/5 flex flex-col">
        
        {/* Profile */}
        <div className="flex items-center gap-4 pb-6 border-b border-white/10">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#818CF8] to-[#C084FC] flex items-center justify-center text-white font-bold text-xl shadow-[0_10px_15px_-3px_rgba(99,102,241,0.3)]">
            OB
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Olga B.</h2>
            <p className="text-sm text-[#9ca3af]">+371-2-68587**</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 flex flex-col gap-0.5">
          <NavItem icon="📊" label="Dashboard" active />
          <NavItem icon="📃" label="Transactions" />
          <NavItem icon="📑" label="Statement" />
          <NavItem icon="💳" label="Payment" />
          <NavItem icon="❓" label="Help & Support" />
          <div className="mt-auto pt-6 border-t border-white/10">
            <NavItem icon="🚪" label="Logout" />
          </div>
        </nav>

        {/* Version info */}
        <div className="text-xs text-[#6b7280] mt-auto pt-6">
          <span>v2.14 · fintech UI</span>
        </div>
      </aside>

      {/* ---------- MAIN CONTENT ---------- */}
      <main className="flex-1 flex flex-col gap-4 lg:gap-6">
        
        {/* Header with summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          
          {/* Revenue chart card */}
          <div className="flex-1 bg-[rgba(20,24,44,0.7)] backdrop-blur rounded-2xl p-4 lg:p-6 border border-white/5 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold text-white">Revenue</h3>
              <select className="bg-black/20 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-[#d1d5db] outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.3)] cursor-pointer">
                <option className="bg-[#14182C] text-white">Last 7 days</option>
                <option className="bg-[#14182C] text-white">Last month</option>
              </select>
            </div>
            
            {/* Dual line chart with SVG */}
            <div className="relative h-40 w-full mt-2">
              <svg
                viewBox="0 0 400 120"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                {/* Subtle grid lines */}
                <line x1="0" y1="100" x2="400" y2="100" className="stroke-[#2A2F45] stroke-[0.8] stroke-dasharray-[3,3]" />
                <line x1="0" y1="70" x2="400" y2="70" className="stroke-[#2A2F45] stroke-[0.8] stroke-dasharray-[3,3]" />
                <line x1="0" y1="40" x2="400" y2="40" className="stroke-[#2A2F45] stroke-[0.8] stroke-dasharray-[3,3]" />
                
                {/* Neon blue line */}
                <path
                  d="M0,100 C30,95 50,70 80,60 C120,45 150,20 200,25 C250,30 280,50 320,40 C360,30 380,20 400,15"
                  fill="none"
                  className="stroke-[#3B82F6] stroke-[3] stroke-linecap-round drop-shadow-[0_0_6px_#3B82F6]"
                />
                
                {/* Golden yellow line */}
                <path
                  d="M0,100 C40,85 70,60 110,65 C150,70 180,90 220,70 C260,50 300,30 340,25 C370,22 390,18 400,18"
                  fill="none"
                  className="stroke-[#FBBF24] stroke-[2.5] stroke-linecap-round drop-shadow-[0_0_5px_#FBBF24]"
                />
              </svg>
              
              {/* Day labels */}
              <div className="flex justify-between text-xs text-[#9ca3af] mt-2 px-1">
                {weekDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-[#d1d5db] mt-2">
              <span>⬆️ +33% vs last week</span>
              <span className="text-[#a5b4fc]">$37,432.77 total</span>
            </div>
          </div>

          {/* Right card panel – two credit cards */}
          <div className="lg:w-80 w-full flex flex-col gap-3 lg:gap-4">
            
            {/* Gold premium card */}
            <div className="bg-gradient-to-br from-[#FBBF24] to-[#D97706] text-black rounded-2xl p-5 h-44 flex flex-col justify-between relative overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/20">
              <div className="absolute right-[-1.5rem] top-[-1.5rem] w-24 h-24 bg-white/20 rounded-full blur-3xl"></div>
              <div className="absolute top-0 left-0 right-0 h-2/5 bg-gradient-to-b from-white/15 to-transparent"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <span className="text-xs font-semibold tracking-wider">PREMIUM</span>
                <span className="text-lg font-bold">✨</span>
              </div>
              
              <div className="relative z-10">
                <p className="text-sm tracking-wider font-mono">****  ****  ****  4892</p>
                <div className="flex justify-between text-xs mt-1">
                  <span>Ola Bals</span>
                  <span>12/26</span>
                </div>
              </div>
              
              <div className="flex justify-end relative z-10">
                <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full">Mastercard.</span>
              </div>
            </div>

            {/* Purple Mastercard style */}
            <div className="bg-gradient-to-br from-[#8B5CF6] to-[#4F46E5] text-white rounded-2xl p-5 h-44 flex flex-col justify-between relative overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/20">
              <div className="absolute right-[-1.5rem] top-[-1.5rem] w-24 h-24 bg-white/20 rounded-full blur-3xl"></div>
              <div className="absolute top-0 left-0 right-0 h-2/5 bg-gradient-to-b from-white/15 to-transparent"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <span className="text-xs font-semibold tracking-wider">PREMIUM</span>
                <span className="text-lg font-bold">💜</span>
              </div>
              
              <div className="relative z-10">
                <p className="text-sm tracking-wider font-mono">****  ****  ****  0012</p>
                <div className="flex justify-between text-xs mt-1">
                  <span>Ola Bals</span>
                  <span>08/27</span>
                </div>
              </div>
              
              <div className="flex justify-end relative z-10">
                <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full">Mastercard.</span>
              </div>
            </div>
            
            {/* Mini stats below cards */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-3 bg-[rgba(20,24,44,0.4)] backdrop-blur p-4 rounded-xl border border-white/5 text-sm text-[#d1d5db]">
              <span>💰 Transaction <span className="font-bold text-white ml-1">19</span></span>
              <span>📋 Statement <span className="font-bold text-white ml-1">$2000</span></span>
              <span>💸 Payment <span className="font-bold text-white ml-1">$1000</span></span>
            </div>
          </div>
        </div>

        {/* Transactions table */}
        <div className="bg-[rgba(20,24,44,0.7)] backdrop-blur rounded-2xl p-4 lg:p-6 border border-white/5 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)]">
          <h3 className="text-lg font-semibold text-white mb-4">Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="text-[#9ca3af] border-b border-white/10">
                <tr>
                  <th className="text-left py-3 font-medium">Name</th>
                  <th className="text-left py-3 font-medium">Amount</th>
                  <th className="text-left py-3 font-medium">Date</th>
                  <th className="text-left py-3 font-medium">Type</th>
                  <th className="text-left py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#818CF8] to-[#3B82F6] flex items-center justify-center text-xs font-bold text-white shadow-md">
                          {tx.avatar}
                        </div>
                        {tx.name}
                      </div>
                    </td>
                    <td className="py-4 font-mono">{tx.amount}</td>
                    <td className="py-4 text-[#9ca3af]">{tx.date}</td>
                    <td className="py-4">
                      <span className="bg-white/10 px-3 py-1 rounded-full text-xs">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tx.statusColor === "green"
                            ? "bg-[rgba(34,197,94,0.2)] text-[#86efac]"
                            : "bg-[rgba(234,179,8,0.2)] text-[#fde047]"
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

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes reflection-shine {
          0% { left: -100%; }
          20% { left: 120%; }
          100% { left: 120%; }
        }
        .reflection::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transform: skewX(-20deg);
          animation: reflection-shine 6s infinite;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

// Helper component for navigation items
const NavItem = ({ icon, label, active = false }) => (
  <div 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer
      ${active 
        ? 'bg-[rgba(99,102,241,0.2)] text-[#a5b4fc] border border-[rgba(99,102,241,0.3)] shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
        : 'text-[#9ca3af] hover:bg-white/5 hover:text-[#e5e7eb]'
      }`}
  >
    <span className="text-lg">{icon}</span>
    <span>{label}</span>
    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#818CF8] shadow-[0_0_8px_#818CF8]"></span>}
  </div>
);

// Helper component for summary cards
const SummaryCard = ({ title, value, badge, badgeColor, icon }) => {
  const colorClasses = {
    green: 'bg-[rgba(34,197,94,0.2)] text-[#86efac] border-[rgba(34,197,94,0.3)]',
    red: 'bg-[rgba(239,68,68,0.2)] text-[#fca5a5] border-[rgba(239,68,68,0.3)]',
    yellow: 'bg-[rgba(234,179,8,0.2)] text-[#fde047] border-[rgba(234,179,8,0.3)]',
  };
  
  return (
    <div className="bg-[rgba(20,24,44,0.7)] backdrop-blur rounded-xl p-5 border border-white/5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-start">
        <span className="text-sm text-[#9ca3af]">{title}</span>
        <span className="text-xl bg-white/5 p-2 rounded-full">{icon}</span>
      </div>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-2xl font-semibold text-white">{value}</span>
        <span className={`text-xs px-2 py-1 rounded-full border ${colorClasses[badgeColor]}`}>
          {badge}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;