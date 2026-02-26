import React from 'react';
import { useTheme } from '../../Context/ThemeContext';

function ThemeToggle() {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none"
            style={{ background: darkMode ? '#1e293b' : '#e2e8f0', border: '2px solid', borderColor: darkMode ? '#475569' : '#cbd5e1' }}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {/* Track icons */}
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs">🌙</span>
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs">☀️</span>

            {/* Sliding circle */}
            <span
                className="absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-xs"
                style={{
                    left: darkMode ? '1.5rem' : '0.125rem',
                    background: darkMode ? '#FCD34D' : '#ffffff',
                }}
            >
                {darkMode ? '🌙' : '☀️'}
            </span>
        </button>
    );
}

export default ThemeToggle;