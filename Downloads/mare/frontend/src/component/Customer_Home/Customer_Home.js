import React from 'react';
import Footer from '../Footer/Footer';

function Home() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">

      {/* Navbar */}
      <nav className="bg-black px-8 py-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <span className="text-yellow-400 font-extrabold text-2xl tracking-widest uppercase">MARE</span>
        <ul className="flex gap-8 items-center">
          <li><a href="/customerhome" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 tracking-wide">Home</a></li>
          <li><a href="/theshop" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 tracking-wide">Explore Vehicles</a></li>
          <li><a href="/addAppointment" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 tracking-wide">Test Drive</a></li>
          <li><a href="/userProfile" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 tracking-wide">My Account</a></li>
          <li><a href="/contact" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 tracking-wide">Contact</a></li>
          <li><a href="/login" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm px-5 py-2 rounded-lg transition-colors duration-200">Logout</a></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <div className="relative w-full h-screen overflow-hidden">

        {/* Background Image */}
        <img
          src="/automart c.jpg"
          alt="MARE Showroom"
          className="w-full h-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-65"></div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="bg-yellow-400 text-black text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-6">
            Premium Car Dealership
          </span>
          <h1 className="text-white text-7xl md:text-9xl font-extrabold tracking-tight leading-none mb-4 drop-shadow-lg">
            MARE
          </h1>
          <div className="w-24 h-1 bg-yellow-400 rounded-full mb-6"></div>
          <p className="text-gray-300 text-lg md:text-xl font-light max-w-xl mb-10 leading-relaxed">
            Explore the latest vehicles and book your test drive today. Your dream car is just one click away.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => (window.location.href = '/theshop')}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold text-lg px-10 py-4 rounded-xl shadow-xl transition-all duration-200 hover:scale-105"
            >
              Shop Now — Buy Today
            </button>
            <button
              onClick={() => (window.location.href = '/addAppointment')}
              className="bg-transparent border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black text-yellow-400 font-bold text-lg px-10 py-4 rounded-xl transition-all duration-200 hover:scale-105"
            >
              Book a Test Drive
            </button>
          </div>
        </div>

        {/* Scroll Hint */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-300 text-sm flex flex-col items-center gap-1 animate-bounce">
          <span>Scroll Down</span>
          <span>↓</span>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-100 py-16 px-8 pb-24">
        <h2 className="text-center text-black text-3xl font-extrabold mb-2 tracking-tight">Why Choose MARE?</h2>
        <div className="w-16 h-1 bg-yellow-400 rounded-full mx-auto mb-12"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: "🏆", title: "Premium Selection", desc: "Hand-picked vehicles from top brands, inspected for quality and performance." },
            { icon: "🔑", title: "Easy Test Drive", desc: "Book a test drive in seconds. Experience your dream car before you commit." },
            { icon: "💰", title: "Best Prices", desc: "Competitive pricing with flexible payment options tailored for you." },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300 text-center border-t-4 border-yellow-400"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-black font-bold text-xl mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default Home;