import React from 'react'

function Nav_Sales() {
  return (
    <div>

      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <span className="text-gray-800 font-extrabold text-xl tracking-widest uppercase">
          MARE <span className="text-yellow-400">|</span> Sales
        </span>
        <ul className="flex gap-6 items-center">
          <li><a href="/saleshome" className="text-gray-500 hover:text-yellow-500 text-sm font-medium transition-colors duration-200">Sales Home</a></li>
          <li><a href="/displayrecordassalesperson" className="text-gray-500 hover:text-yellow-500 text-sm font-medium transition-colors duration-200">Sales records</a></li>
          <li><a href="/displayAppointmentassalesperson" className="text-gray-500 hover:text-yellow-500 text-sm font-medium transition-colors duration-200">Appointments</a></li>
          <li><a href="/notes" className="text-gray-500 hover:text-yellow-500 text-sm font-medium transition-colors duration-200">Notes</a></li>
          <li><a href="/calculator" className="text-gray-500 hover:text-yellow-500 text-sm font-medium transition-colors duration-200">calculator</a></li>
          <li><a href="/staffprofile" className="text-gray-500 hover:text-yellow-500 text-sm font-medium transition-colors duration-200">Profile</a></li>
          <li>
            <a href="/userlogin" className="bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-600 text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200">
              Logout
            </a>
          </li>
        </ul>
      </nav>



    </div>
  )
}

export default Nav_Sales