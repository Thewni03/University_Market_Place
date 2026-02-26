import React from 'react';
import { useTheme } from '../../Context/ThemeContext';

function Nav_Customer() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <nav className="bg-black px-8 py-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
      <span className="text-yellow-400 font-extrabold text-2xl tracking-widest uppercase">MARE</span>
      
      <ul className="flex gap-8 items-center">
        <li><a href="/customerhome" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 tracking-wide">Home</a></li>
        <li><a href="/theshop" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 tracking-wide">Explore Vehicles</a></li>
        <li><a href="/addAppointment" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 tracking-wide">Test Drive</a></li>
        <li><a href="/userProfile" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 tracking-wide">My Account</a></li>
        <li><a href="/contact" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 tracking-wide">Contact</a></li>

        {/* Dark Mode Toggle */}
        <li>
          <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none"
            style={{
              background: darkMode ? '#1e293b' : '#e2e8f0',
              border: '2px solid',
              borderColor: darkMode ? '#475569' : '#cbd5e1'
            }}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs">🌙</span>
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs">☀️</span>
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-300"
              style={{
                left: darkMode ? '1.6rem' : '0.125rem',
                background: darkMode ? '#FCD34D' : '#ffffff',
              }}
            />
          </button>
        </li>

        <li><a href="/login" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm px-5 py-2 rounded-lg transition-colors duration-200">Logout</a></li>
      </ul>
    </nav>
  );
}

export default Nav_Customer;