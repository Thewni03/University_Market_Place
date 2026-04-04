import React from 'react'

function Footer() {
  return (
    <footer className="bg-black text-gray-400 text-center py-6 text-sm fixed bottom-0 left-0 w-full z-50">
      <span className="text-yellow-400 font-bold">MARE</span> © {new Date().getFullYear()} — All rights reserved.
    </footer>
  )
}

export default Footer