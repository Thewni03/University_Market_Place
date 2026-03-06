import React, { useState } from 'react';

const Booking = () => {
  const [selectedService, setSelectedService] = useState('Advanced Python Programming');
  
  const serviceData = {
    'Advanced Python Programming': { price: 8500, duration: '3-5 Business Days' },
    'Full Stack Web Development': { price: 12000, duration: '4-6 Business Days' },
    'Data Science & Machine Learning': { price: 15000, duration: '5-7 Business Days' },
    'Mobile App Development': { price: 10500, duration: '6-8 Days' },
    'Cloud Computing & DevOps': { price: 9000, duration: '4-5 Business Days' },
    'Cybersecurity Fundamentals': { price: 11000, duration: '5-7 Days' }
  };

  const platformFee = Math.round(serviceData[selectedService].price * 0.05);
  const totalAmount = serviceData[selectedService].price + platformFee;

  const services = [
    {
      title: 'Advanced Python Programming',
      description: 'Complete Python course covering OOP, data structures, algorithms, and real-world projects.',
      rating: 4.9,
      modules: '12 Modules',
      price: 8500,
      image: '💻'
    },
    {
      title: 'Full Stack Web Development',
      description: 'Master frontend and backend development with React, Node.js, and MongoDB.',
      rating: 4.8,
      modules: '15 Modules',
      price: 12000,
      image: '🌐'
    },
    {
      title: 'Data Science & Machine Learning',
      description: 'Learn data analysis, visualization, and ML algorithms with hands-on projects.',
      rating: 4.9,
      modules: '10 Modules',
      price: 15000,
      image: '📊'
    },
    {
      title: 'Mobile App Development',
      description: 'Build native iOS and Android apps using React Native and Flutter frameworks.',
      rating: 4.7,
      modules: '6-8 Days',
      price: 10500,
      image: '📱'
    },
    {
      title: 'Cloud Computing & DevOps',
      description: 'Master AWS, Docker, Kubernetes, and CI/CD pipelines for modern infrastructure.',
      rating: 4.8,
      modules: '11 Modules',
      price: 9000,
      image: '☁️'
    },
    {
      title: 'Cybersecurity Fundamentals',
      description: 'Learn ethical hacking, network security, and penetration testing techniques.',
      rating: 4.8,
      modules: '5-7 Days',
      price: 11000,
      image: '🔒'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1120] via-[#1a2942] to-[#0f1a2f] p-5 md:p-10 text-white relative">
      {/* Navigation */}
      <nav className="flex justify-between items-center py-5 border-b border-white/10 mb-8">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent shadow-[0_0_20px_rgba(96,165,250,0.3)]">
          UniMarket
        </div>
        <div className="flex gap-8 items-center">
          <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Browse</a>
          <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">My Learning</a>
          <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Inbox</a>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            👤
          </div>
        </div>
      </nav>

      {/* Header Profile */}
      <div className="bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl p-6 mb-8 flex gap-6 items-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] md:flex-row flex-col text-center md:text-left">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(59,130,246,0.5)]">
          👩‍🏫
        </div>
        <div className="profile-info">
          <h1 className="text-2xl md:text-3xl mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Dr. Sarah Johnson
          </h1>
          <div className="flex gap-3 mb-3 flex-wrap justify-center md:justify-start">
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500/20 border border-amber-500 text-amber-500">
              ⭐ Top Rated Provider
            </span>
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/20 border border-emerald-500 text-emerald-500">
              Trust Score: 96%
            </span>
          </div>
          <div className="flex gap-5 text-slate-400 flex-wrap justify-center md:justify-start">
            <span className="flex items-center gap-1">⭐ 4.7 (342 reviews)</span>
            <span className="flex items-center gap-1">📈 156 Completed Jobs</span>
            <span className="flex items-center gap-1">🏛️ University of Colombo</span>
            <span className="flex items-center gap-1">💻 Computer Science</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex gap-3 mb-4 flex-col md:flex-row">
          <input 
            type="text" 
            placeholder="Search services" 
            className="flex-1 p-3.5 bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl text-white text-base focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
          />
          <select className="p-3.5 bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl text-white cursor-pointer">
            <option>All Categories</option>
          </select>
          <select className="p-3.5 bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl text-white cursor-pointer">
            <option>Sort by: Popular</option>
          </select>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="px-5 py-2.5 bg-slate-900/60 backdrop-blur border border-white/10 rounded-full text-white hover:border-blue-400 hover:shadow-[0_0_20px_rgba(96,165,250,0.3)] hover:-translate-y-0.5 transition-all">
            4+ Stars
          </button>
          <button className="px-5 py-2.5 bg-slate-900/60 backdrop-blur border border-white/10 rounded-full text-white hover:border-blue-400 hover:shadow-[0_0_20px_rgba(96,165,250,0.3)] hover:-translate-y-0.5 transition-all">
            Quick Delivery
          </button>
          <button className="px-5 py-2.5 bg-slate-900/60 backdrop-blur border border-white/10 rounded-full text-white hover:border-blue-400 hover:shadow-[0_0_20px_rgba(96,165,250,0.3)] hover:-translate-y-0.5 transition-all">
            Price Range
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left Side - Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-blue-400 hover:shadow-[0_10px_30px_rgba(96,165,250,0.2)] transition-all cursor-pointer"
              onClick={() => setSelectedService(service.title)}
            >
              <div className="h-35 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-5xl border-b border-white/10">
                {service.image}
              </div>
              <div className="p-5">
                <h3 className="text-lg mb-2 text-white">{service.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-3">{service.description}</p>
                <div className="flex gap-3 mb-3">
                  <span className="text-amber-400 text-sm">⭐ {service.rating}</span>
                  <span className="text-slate-400 text-sm">{service.modules}</span>
                </div>
                <div className="text-xl font-semibold text-blue-400 mb-4">
                  LKR {service.price.toLocaleString()}
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 py-2.5 bg-transparent border border-blue-400 rounded-xl text-blue-400 hover:bg-blue-400/10 hover:shadow-[0_0_20px_rgba(96,165,250,0.3)] transition-all">
                    Select
                  </button>
                  <button className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 border-none rounded-xl text-white hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(59,130,246,0.5)] transition-all shadow-[0_4px_15px_rgba(59,130,246,0.4)]">
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side - Booking Summary */}
        <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-2xl p-6 h-fit lg:sticky lg:top-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl mb-6 text-white">Booking Summary</h2>
          
          <div className="flex justify-between mb-4 text-slate-400">
            <span>Selected Service</span>
            <span className="text-blue-400 font-medium">{selectedService}</span>
          </div>
          
          <div className="flex justify-between mb-4 text-slate-400">
            <span>Service Price</span>
            <span>LKR {serviceData[selectedService].price.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between mb-4 text-slate-400">
            <span>Platform Fee (5%)</span>
            <span>LKR {platformFee.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between mt-5 pt-5 border-t border-white/10 text-lg font-semibold text-white">
            <span>Total Amount</span>
            <span className="text-blue-400 text-2xl shadow-[0_0_20px_rgba(96,165,250,0.5)]">
              LKR {totalAmount.toLocaleString()}
            </span>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500 rounded-full p-3 text-center my-6 text-emerald-500">
            ⏱️ Estimated Completion: {serviceData[selectedService].duration}
          </div>
          
          <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 border-none rounded-2xl text-white font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(59,130,246,0.5)] transition-all mb-3 shadow-[0_4px_15px_rgba(59,130,246,0.4)]">
            Proceed to Booking
          </button>
          
          <button className="w-full py-4 bg-transparent border border-blue-400 rounded-2xl text-blue-400 font-semibold hover:bg-blue-400/10 hover:shadow-[0_0_20px_rgba(96,165,250,0.3)] transition-all mb-6">
            Save for Later
          </button>
          
          <div className="text-center text-slate-400 text-sm mb-6 pb-6 border-b border-white/10">
            🔒 Secure payment - 256-bit SSL encrypted
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 bg-slate-900/60 backdrop-blur border border-white/10 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-400 hover:shadow-[0_0_20px_rgba(96,165,250,0.2)] transition-all">
              💬 Chat with Provider
            </button>
            <button className="p-3 bg-slate-900/60 backdrop-blur border border-white/10 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-400 hover:shadow-[0_0_20px_rgba(96,165,250,0.2)] transition-all">
              📞 Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;