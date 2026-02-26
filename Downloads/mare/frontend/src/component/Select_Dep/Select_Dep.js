import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Select_Dep() {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(null);

    const departments = [
        {
            id: 1,
            name: "Admin Team",
            description: "System management & oversight",
            route: "/",
            icon: "🛡️",
            color: "from-slate-600 to-slate-800",
            badge: "bg-slate-500",
        },
        {
            id: 2,
            name: "Sales",
            description: "Vehicle sales & customer deals",
            route: "/saleshome",
            icon: "💼",
            color: "from-blue-600 to-blue-800",
            badge: "bg-blue-500",
        },
        {
            id: 3,
            name: "Finance & Accounting",
            description: "Budgets, payroll & financial records",
            route: "/finance",
            icon: "📊",
            color: "from-emerald-600 to-emerald-800",
            badge: "bg-emerald-500",
        },
        {
            id: 4,
            name: "Customer Service",
            description: "Support, queries & client relations",
            route: "/customercare",
            icon: "🎧",
            color: "from-violet-600 to-violet-800",
            badge: "bg-violet-500",
        },
        {
            id: 5,
            name: "People & Culture (HR)",
            description: "Recruitment, staff & culture",
            route: "/hr",
            icon: "🤝",
            color: "from-rose-600 to-rose-800",
            badge: "bg-rose-500",
        },
        {
            id: 6,
            name: "Spare Parts & Maintenance",
            description: "Inventory, repairs & servicing",
            route: "/maintaince",
            icon: "🔧",
            color: "from-amber-600 to-amber-800",
            badge: "bg-amber-500",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 font-sans">

            {/* Navbar */}
            <nav className="bg-slate-900 border-b border-slate-700 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-extrabold text-sm">M</span>
                    </div>
                    <span className="text-white font-extrabold text-xl tracking-widest uppercase">
                        MARE <span className="text-blue-400 font-light">| Staff Portal</span>
                    </span>
                </div>
                <ul className="flex gap-6 items-center">
                    {[
                        { label: "Home", href: "/selectdepartment" },
                        { label: "Vehicles", href: "/theshop" },
                        { label: "Notes", href: "/notes" },
                        { label: "Profile", href: "/staffprofile" },
                    ].map((item) => (
                        <li key={item.label}>
                            <a href={item.href} className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200">
                                {item.label}
                            </a>
                        </li>
                    ))}
                    <li>
                        <a href="/userlogin" className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors duration-200">
                            Logout
                        </a>
                    </li>
                </ul>
            </nav>

            {/* Header */}
            <div className="text-center pt-14 pb-10 px-4">
                {/* Icon */}
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>

                <h1 className="text-white text-4xl font-extrabold tracking-tight">Select Your Department</h1>
                <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                    Choose your department to access your workspace and tools
                </p>

                {/* Divider */}
                <div className="flex items-center justify-center gap-3 mt-6">
                    <div className="w-16 h-px bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="w-16 h-px bg-slate-700"></div>
                </div>
            </div>

            {/* Department Cards */}
            <div className="max-w-4xl mx-auto px-6 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {departments.map((dept) => (
                    <button
                        key={dept.id}
                        onClick={() => navigate(dept.route)}
                        onMouseEnter={() => setHovered(dept.id)}
                        onMouseLeave={() => setHovered(null)}
                        className="group relative bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
                    >
                        {/* Gradient glow on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${dept.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}></div>

                        {/* Top row */}
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${dept.color} flex items-center justify-center text-2xl shadow-lg`}>
                                {dept.icon}
                            </div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`w-5 h-5 text-slate-600 group-hover:text-slate-300 transition-all duration-300 ${hovered === dept.id ? 'translate-x-1' : ''}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>

                        {/* Text */}
                        <h3 className="text-white font-bold text-base mb-1 group-hover:text-blue-300 transition-colors duration-200">
                            {dept.name}
                        </h3>
                        <p className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-400 transition-colors duration-200">
                            {dept.description}
                        </p>

              
                        <div className="mt-4 flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${dept.badge}`}></div>
                            <span className="text-slate-600 text-xs group-hover:text-slate-400 transition-colors duration-200">
                                Click to enter
                            </span>
                        </div>

                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="text-center pb-8 text-slate-600 text-xs">
                MARE Staff Portal — Internal use only
            </div>

        </div>
    );
}

export default Select_Dep;