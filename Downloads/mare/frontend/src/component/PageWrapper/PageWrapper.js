import React from 'react';
import { useTheme } from '../../Context/ThemeContext';

function PageWrapper({ children }) {
  const { darkMode } = useTheme();

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="
        min-h-screen transition-colors duration-300
        bg-white dark:bg-gray-950
        text-black dark:text-white
        [&_.card]:bg-white [&_.card]:dark:bg-gray-900
        [&_.card]:border-gray-200 [&_.card]:dark:border-gray-700
      ">
        <style>{`
          /* Page backgrounds */
          .dark .page-bg { background-color: #030712; }
          .dark .page-bg-soft { background-color: #111827; }

          /* Cards */
          .dark .card { background-color: #111827; border-color: #374151; }
          .dark .card-inner { background-color: #1f2937; border-color: #1f2937; }

          /* Text */
          .dark .text-main { color: #ffffff; }
          .dark .text-soft { color: #d1d5db; }
          .dark .text-muted { color: #9ca3af; }
          .dark .text-faint { color: #6b7280; }

          /* Inputs */
          .dark .input-field { 
            background-color: #1f2937; 
            border-color: #4b5563; 
            color: #ffffff; 
          }
          .dark .input-field::placeholder { color: #6b7280; }

          /* Navbar */
          .dark .staff-nav { 
            background-color: #111827; 
            border-color: #374151; 
          }

          /* Dividers / sections */
          .dark .section-bg { background-color: #111827; }
          .dark .divider { border-color: #374151; }

          /* Smooth transitions on everything */
          * { transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease; }
        `}</style>

        {children}
      </div>
    </div>
  );
}

export default PageWrapper;