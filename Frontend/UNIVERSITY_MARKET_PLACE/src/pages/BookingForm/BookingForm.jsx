import React, { useState } from 'react';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contact: '',
    address: '',
    nic: '',
    service: '',
    date: '',
    timeSlot: '',
    persons: 1,
    specialRequests: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePersonsChange = (action) => {
    setFormData(prev => ({
      ...prev,
      persons: action === 'increment' ? prev.persons + 1 : Math.max(1, prev.persons - 1)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1120] via-[#1a2942] to-[#0f1a2f] p-4 sm:p-6 lg:p-10 text-white relative font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif]">
      
      {/* Navigation */}
      <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 py-5 border-b border-white/10 mb-8">
        <div className="text-2xl font-bold bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(96,165,250,0.3)]">
          UniMarket
        </div>
        <div className="flex gap-2 text-sm text-[#94a3b8]">
          <span className="cursor-pointer hover:text-[#3b82f6] transition-colors">Home</span>
          <span className="text-[#4a5568]">›</span>
          <span className="cursor-pointer hover:text-[#3b82f6] transition-colors">Services</span>
          <span className="text-[#4a5568]">›</span>
          <span className="text-white cursor-pointer hover:text-[#3b82f6] transition-colors">Booking Form</span>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.5)]">
          👤
        </div>
      </nav>

      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">Customer Booking Form</h1>
        <p className="text-base text-[#94a3b8] mb-4">Please fill in your details to confirm your booking.</p>
        <div className="w-20 h-1 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side - Form (spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Details */}
          <div className="bg-[rgba(15,23,42,0.6)] backdrop-blur border border-white/10 rounded-2xl p-5 lg:p-6 transition-all hover:border-white/20">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#3b82f6] mb-2">Customer Details</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-[#3b82f6] to-transparent rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg z-10">👤</span>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full py-3.5 pl-12 pr-4 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all placeholder:text-[#64748b]"
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg z-10">📞</span>
                  <input
                    type="tel"
                    name="contact"
                    placeholder="Enter your phone number"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full py-3.5 pl-12 pr-4 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all placeholder:text-[#64748b]"
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg z-10">🆔</span>
                  <input
                    type="text"
                    name="nic"
                    placeholder="Enter NIC or Passport number"
                    value={formData.nic}
                    onChange={handleInputChange}
                    className="w-full py-3.5 pl-12 pr-4 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all placeholder:text-[#64748b]"
                  />
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-[#60a5fa] opacity-80 -mt-2">
                  <span>ℹ️</span>
                  Required if applicable
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg z-10">✉️</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full py-3.5 pl-12 pr-4 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all placeholder:text-[#64748b]"
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg z-10">📍</span>
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full py-3.5 pl-12 pr-4 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all placeholder:text-[#64748b]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-[rgba(15,23,42,0.6)] backdrop-blur border border-white/10 rounded-2xl p-5 lg:p-6 transition-all hover:border-white/20">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#8b5cf6] mb-2">Service Details</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-[#8b5cf6] to-transparent rounded-full shadow-[0_0_20px_rgba(139,92,246,0.5)]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg z-10">📅</span>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full py-3.5 pl-12 pr-10 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#8b5cf6] focus:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0f172a]">Select a service</option>
                    <option value="premium" className="bg-[#0f172a]">Premium Package</option>
                    <option value="standard" className="bg-[#0f172a]">Standard Package</option>
                    <option value="basic" className="bg-[#0f172a]">Basic Package</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#60a5fa] text-xs pointer-events-none">▼</span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg z-10">⏰</span>
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleInputChange}
                    className="w-full py-3.5 pl-12 pr-10 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#8b5cf6] focus:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0f172a]">Select time slot</option>
                    <option value="9am" className="bg-[#0f172a]">9:00 AM - 11:00 AM</option>
                    <option value="11am" className="bg-[#0f172a]">11:00 AM - 1:00 PM</option>
                    <option value="2pm" className="bg-[#0f172a]">2:00 PM - 4:00 PM</option>
                    <option value="4pm" className="bg-[#0f172a]">4:00 PM - 6:00 PM</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#60a5fa] text-xs pointer-events-none">▼</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg z-10">📆</span>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full py-3.5 pl-12 pr-4 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#8b5cf6] focus:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all [color-scheme:dark]"
                  />
                </div>

                <div className="flex items-center bg-[rgba(15,23,42,0.6)] backdrop-blur-sm border border-white/10 rounded-3xl p-1 relative">
                  <span className="text-lg mx-2">👥</span>
                  <button 
                    className="w-10 h-10 bg-[rgba(59,130,246,0.2)] border border-[rgba(59,130,246,0.3)] rounded-full text-[#60a5fa] text-xl hover:bg-[rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                    onClick={() => handlePersonsChange('decrement')}
                  >−</button>
                  <span className="flex-1 text-center text-lg font-semibold text-white">{formData.persons}</span>
                  <button 
                    className="w-10 h-10 bg-[rgba(59,130,246,0.2)] border border-[rgba(59,130,246,0.3)] rounded-full text-[#60a5fa] text-xl hover:bg-[rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                    onClick={() => handlePersonsChange('increment')}
                  >+</button>
                </div>
              </div>

              {/* Full Width - Textarea */}
              <div className="md:col-span-2">
                <div className="relative">
                  <span className="absolute left-4 top-5 text-lg z-10">💬</span>
                  <textarea
                    name="specialRequests"
                    placeholder="Any special requests or notes..."
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    className="w-full py-4 pl-12 pr-4 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#8b5cf6] focus:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all placeholder:text-[#64748b] resize-y min-h-[100px]"
                    rows="4"
                  />
                </div>
              </div>
            </div>
          </div>

          <button className="w-full h-14 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] border-none rounded-xl text-white text-lg font-semibold cursor-pointer shadow-[0_8px_20px_rgba(59,130,246,0.4)] hover:translate-y-[-2px] hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(59,130,246,0.6)] transition-all mt-2">
            Confirm Booking
          </button>
        </div>

        {/* Right Side - Summary */}
        <div className="lg:sticky lg:top-5 h-fit">
          <div className="bg-[rgba(15,23,42,0.8)] backdrop-blur border border-white/10 rounded-2xl p-5 lg:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent mb-5">
              Booking Summary
            </h3>

            {/* Service Preview */}
            <div className="bg-white/5 rounded-xl p-4 mb-5">
              <h4 className="text-lg font-bold text-white mb-1">Premium Package</h4>
              <p className="text-sm text-[#94a3b8] mb-2">Complete service solution</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#fbbf24] text-sm tracking-wider">⭐⭐⭐⭐⭐</span>
                <span className="text-sm text-white">4.9 (127 reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-full"></div>
                <span className="text-sm text-[#94a3b8]">John Professional</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mb-5">
              <div className="flex justify-between text-[#94a3b8] mb-3">
                <span>Service Fee</span>
                <span>$299.00</span>
              </div>
              <div className="flex justify-between text-[#94a3b8] mb-3">
                <span>Platform Fee</span>
                <span>$19.00</span>
              </div>
              
              <div className="h-px bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent my-4"></div>
              
              <div className="flex justify-between text-lg font-semibold text-white">
                <span>Total Amount</span>
                <span className="text-2xl font-bold text-[#60a5fa] drop-shadow-[0_0_20px_rgba(96,165,250,0.5)]">$318.00</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] rounded-3xl p-3 flex justify-between items-center mb-5">
              <span className="text-[#10b981] font-medium">⏱️ Estimated Timeline</span>
              <span className="text-white text-sm">2-3 hours completion</span>
            </div>

            {/* Security */}
            <div className="text-center">
              <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] rounded-full px-4 py-2 inline-block mb-4 text-[#10b981] text-sm">
                <span>🔒 Secure Payment Protected</span>
              </div>
              <a href="#" className="block text-[#60a5fa] text-sm hover:underline hover:text-[#3b82f6] transition-all">
                Terms and Conditions →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;