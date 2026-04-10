import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const BookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuthStore();

  const serviceTitle = location.state?.serviceTitle || 'Premium Package';
  const hourlyRate = Number(location.state?.pricePerHour) || 299;
  const initialSlot = location.state?.selectedSlot
    ? `${location.state.selectedSlot.day} at ${location.state.selectedSlot.time}`
    : '9:00 AM - 11:00 AM';

  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || authUser?.fullname || '',
    email: authUser?.email || '',
    contact: authUser?.phone || '',
    address: '',
    nic: '',
    service: serviceTitle,
    date: '',
    timeSlot: initialSlot,
    persons: 1, // Using persons to represent hours in the UI as per current state
    specialRequests: '',
    documents: []
  });

  const [paymentSummary, setPaymentSummary] = useState({
    serviceFee: 299.00,
    platformFee: 19.00,
    tax: 15.90,
    totalAmount: 333.90
  });

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/services/calculate-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hours: formData.persons,
            customHourlyRate: hourlyRate
          })
        });
        const result = await response.json();
        if (result.success) {
          setPaymentSummary(result.data);
        }
      } catch (error) {
        console.error('Error calculating payment:', error);
      }
    };
    fetchPayment();
  }, [formData.persons, hourlyRate]);

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/payments/validate-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      
      if (!result.success && result.errors) {
        setErrors(result.errors);
        return false;
      }
      
      setErrors({});
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      alert('Could not reach validation server.');
      return false;
    }
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'email') {
      value = value.replace(/[^a-zA-Z@.]/g, '');
    } else if (name === 'nic') {
      value = value.replace(/[^0-9]/g, '');
    } else if (name === 'address') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePersonsChange = (action) => {
    setFormData(prev => ({
      ...prev,
      persons: action === 'increment' ? prev.persons + 1 : Math.max(1, prev.persons - 1)
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file =>
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );

    // File size validation (max 10MB)
    const oversizedFiles = validFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Some files exceed 10MB limit. Please upload smaller files.');
      return;
    }

    const newDocuments = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024).toFixed(2),
      type: file.type,
      file: file
    }));

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
  };

  const removeDocument = (id) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== id)
    }));
  };

  const formatFileSize = (size) => {
    if (size < 1024) return size + ' KB';
    return (size / 1024).toFixed(2) + ' MB';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form through backend
    const isValid = await validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      // Let React render errors first, then scroll
      setTimeout(() => {
        const errorElements = document.querySelectorAll('.border-red-400, .border-red-500');
        if (errorElements.length > 0) {
          errorElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElements[0].focus();
        }
      }, 100);
      return;
    }

    try {
      // Create an array to hold uploaded file metadata
      let uploadedDocuments = [];

      // If there are files to upload, send them to the backend first
      if (formData.documents && formData.documents.length > 0) {
        const uploadData = new FormData();
        formData.documents.forEach((doc) => {
          uploadData.append('documents', doc.file); // Assuming doc.file has the actual File instance!
        });

        const uploadRes = await fetch('http://localhost:5001/api/payments/upload', {
          method: 'POST',
          body: uploadData,
        });

        const uploadResult = await uploadRes.json();
        if (uploadResult.success) {
          uploadedDocuments = uploadResult.files;
        } else {
          throw new Error('Failed to upload documents');
        }
      }

      // After successful booking & upload, navigate to booking success page
      navigate('/booking-success', {
        state: {
          bookingId: 'UNI-' + Math.floor(Math.random() * 1000000),
          amount: paymentSummary.totalAmount.toFixed(2),
          serviceName: formData.service,
          customerName: formData.fullName,
          customerEmail: formData.email,
          serviceFee: paymentSummary.serviceFee.toFixed(2),
          platformFee: paymentSummary.platformFee.toFixed(2),
          tax: paymentSummary.tax.toFixed(2),
          documents: uploadedDocuments, // pass the documents info to Payment component
          bookingDate: formData.date,
          bookingTime: formData.timeSlot
        }
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add CSS animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0) translateX(0);
        }
        25% {
          transform: translateY(-30px) translateX(15px);
        }
        50% {
          transform: translateY(-15px) translateX(-15px);
        }
        75% {
          transform: translateY(-45px) translateX(10px);
        }
      }

      @keyframes float-subtle {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }

      @keyframes bounce-subtle {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }

      @keyframes pulse-subtle {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }

      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }

      .animate-fadeIn {
        animation: fadeIn 0.8s ease-out;
      }

      .animate-slideIn {
        animation: slideIn 0.6s ease-out forwards;
        opacity: 0;
      }

      .animate-float {
        animation: float 25s infinite ease-in-out;
      }

      .animate-float-subtle {
        animation: float-subtle 4s infinite ease-in-out;
      }

      .animate-bounce-subtle {
        animation: bounce-subtle 0.5s ease-in-out;
      }

      .animate-pulse-subtle {
        animation: pulse-subtle 2s infinite ease-in-out;
      }

      .animate-gradient {
        background-size: 200% 200%;
        animation: gradientShift 15s ease infinite;
      }

      .animate-spin {
        animation: spin 1s linear infinite;
      }

      .animate-shake {
        animation: shake 0.5s ease-in-out;
      }

      .drop-shadow-glow {
        filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => {
        const colors = [
          'from-[#3B82F6]/10 to-[#8B5CF6]/10',
          'from-[#06B6D4]/10 to-[#3B82F6]/10',
          'from-[#8B5CF6]/10 to-[#D946EF]/10',
          'from-[#10B981]/10 to-[#3B82F6]/10',
          'from-[#F59E0B]/10 to-[#EF4444]/10',
          'from-[#EC4899]/10 to-[#8B5CF6]/10'
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        return (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-r ${randomColor} animate-float`}
            style={{
              width: Math.random() * 15 + 5 + 'px',
              height: Math.random() * 15 + 5 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 8 + 's',
              animationDuration: Math.random() * 20 + 20 + 's',
              filter: 'blur(2px)'
            }}
          />
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-background font-sans py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto relative z-10 animate-fadeIn">
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4 animate-slideIn">
            Customer Booking Form
          </h1>
          <p className="text-base text-[#6B7280] mb-4">Please fill in your details to confirm your booking.</p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-full mx-auto shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto relative z-10">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Side - Form (spans 2 columns) */}
            <div className="lg:col-span-2 space-y-6 animate-slideIn" style={{ animationDelay: '150ms' }}>

              {/* Customer Details */}
              <div className="bg-white rounded-3xl shadow-sm p-6 lg:p-8 border border-slate-100 hover:shadow-md transition-all">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Customer Details
                  </h2>
                  <div className="w-16 h-1 rounded-full bg-slate-900"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl z-10"></span>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full py-3.5 pl-12 pr-4 bg-gray-50/80 border rounded-xl text-[#1F2937] text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-[#9CA3AF] ${errors.fullName
                            ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500'
                            : 'border-gray-200 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'
                          }`}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1 ml-4 animate-shake">{errors.fullName}</p>
                      )}
                    </div>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl z-10"></span>
                      <input
                        type="tel"
                        name="contact"
                        placeholder="Enter your phone number"
                        value={formData.contact}
                        onChange={handleInputChange}
                        className={`w-full py-3.5 pl-12 pr-4 bg-gray-50/80 border rounded-xl text-[#1F2937] text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-[#9CA3AF] ${errors.contact
                            ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500'
                            : 'border-gray-200 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'
                          }`}
                      />
                      {errors.contact && (
                        <p className="text-red-500 text-xs mt-1 ml-4 animate-shake">{errors.contact}</p>
                      )}
                    </div>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl z-10"></span>
                      <input
                        type="text"
                        name="nic"
                        placeholder="Enter NIC number (10 digits) *"
                        value={formData.nic}
                        onChange={handleInputChange}
                        maxLength={10}
                        className={`w-full py-3.5 pl-12 pr-4 bg-gray-50/80 border rounded-xl text-[#1F2937] text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-[#9CA3AF] ${errors.nic
                            ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500'
                            : 'border-gray-200 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'
                          }`}
                      />
                      {errors.nic && (
                        <p className="text-red-500 text-xs mt-1 ml-4 animate-shake">{errors.nic}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl z-10">✉️</span>
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full py-3.5 pl-12 pr-4 bg-gray-50/80 border rounded-xl text-[#1F2937] text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-[#9CA3AF] ${errors.email
                            ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500'
                            : 'border-gray-200 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'
                          }`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1 ml-4 animate-shake">{errors.email}</p>
                      )}
                    </div>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl z-10"></span>
                      <input
                        type="text"
                        name="address"
                        placeholder="Enter your address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full py-3.5 pl-12 pr-4 bg-gray-50/80 border rounded-xl text-[#1F2937] text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-[#9CA3AF] ${errors.address
                            ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500'
                            : 'border-gray-200 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]'
                          }`}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1 ml-4 animate-shake">{errors.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details - Auto Populated */}
              <div className="bg-white rounded-3xl shadow-sm p-6 lg:p-8 border border-slate-100 hover:shadow-md transition-all">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Service Details
                  </h2>
                  <div className="w-16 h-1 rounded-full bg-slate-900"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    {/* Service - Auto populated, read-only */}
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl z-10"></span>
                      <div className="w-full py-3.5 pl-12 pr-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl text-[#1F2937] text-sm font-semibold">
                        {formData.service}
                      </div>
                      <input type="hidden" name="service" value={formData.service} />
                    </div>

                    {/* Time Slot - Auto populated, read-only */}
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl z-10"></span>
                      <div className="w-full py-3.5 pl-12 pr-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl text-[#1F2937] text-sm font-semibold">
                        {formData.timeSlot}
                      </div>
                      <input type="hidden" name="timeSlot" value={formData.timeSlot} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl z-10"></span>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={handleInputChange}
                        className={`w-full py-3.5 pl-12 pr-4 bg-gray-50/80 border rounded-xl text-[#1F2937] text-sm focus:outline-none focus:ring-2 transition-all ${errors.date
                            ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500'
                            : 'border-gray-200 focus:ring-[#8B5CF6]/30 focus:border-[#8B5CF6]'
                          }`}
                      />
                      {errors.date && (
                        <p className="text-red-500 text-xs mt-1 ml-4 animate-shake">{errors.date}</p>
                      )}
                    </div>

                    <div className="flex items-center bg-gray-50/80 border border-gray-200 rounded-xl p-1 relative">
                      <span className="text-xl mx-3">⏱</span>
                      <button
                        type="button"
                        className="w-10 h-10 bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10 border border-[#3B82F6]/20 rounded-full text-[#3B82F6] text-xl hover:bg-gradient-to-r hover:from-[#3B82F6]/20 hover:to-[#8B5CF6]/20 transition-all duration-300 hover:scale-105"
                        onClick={() => handlePersonsChange('decrement')}
                      >−</button>
                      <span className="flex-1 text-center text-xl font-semibold text-[#1F2937]">{formData.persons} Hour{formData.persons > 1 ? 's' : ''}</span>
                      <button
                        type="button"
                        className="w-10 h-10 bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10 border border-[#3B82F6]/20 rounded-full text-[#3B82F6] text-xl hover:bg-gradient-to-r hover:from-[#3B82F6]/20 hover:to-[#8B5CF6]/20 transition-all duration-300 hover:scale-105"
                        onClick={() => handlePersonsChange('increment')}
                      >+</button>
                    </div>
                  </div>

                  {/* Full Width - Document Upload Section */}
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[#4B5563] mb-2">
                        📎 Attach Documents (Images or PDFs)
                      </label>

                      <div
                        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${dragActive
                            ? 'border-[#8B5CF6] bg-[rgba(139,92,246,0.05)]'
                            : 'border-gray-200 hover:border-[#8B5CF6]/50'
                          }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          id="file-upload"
                          multiple
                          accept="image/*,.pdf"
                          onChange={handleFileInput}
                          className="hidden"
                        />

                        <div className="text-center">
                          <div className="text-5xl mb-3 animate-float-subtle">📄</div>
                          <p className="text-[#6B7280] mb-2">
                            Drag & drop files here or{' '}
                            <label
                              htmlFor="file-upload"
                              className="text-[#8B5CF6] cursor-pointer hover:text-[#3B82F6] transition-colors font-medium"
                            >
                              browse
                            </label>
                          </p>
                          <p className="text-xs text-[#9CA3AF]">
                            Supported formats: JPEG, PNG, GIF, PDF (Max 10MB each)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Uploaded Files List */}
                    {formData.documents.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-[#4B5563] mb-3">
                          Uploaded Documents ({formData.documents.length})
                        </h4>
                        {formData.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between bg-gray-50/80 border border-gray-200 rounded-xl p-3 group hover:border-[#8B5CF6]/50 hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {doc.type.startsWith('image/') ? '' : '📄'}
                              </span>
                              <div>
                                <p className="text-sm text-[#1F2937] font-medium truncate max-w-[200px]">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-[#9CA3AF]">
                                  {formatFileSize(doc.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDocument(doc.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500 p-2 hover:scale-110 transition-all"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Full Width - Textarea */}
                  <div className="md:col-span-2">
                    <div className="relative">
                      <span className="absolute left-4 top-5 text-xl z-10"></span>
                      <textarea
                        name="specialRequests"
                        placeholder="Any special requests or notes..."
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        className="w-full py-4 pl-12 pr-4 bg-gray-50/80 border border-gray-200 rounded-xl text-[#1F2937] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30 focus:border-[#8B5CF6] transition-all placeholder:text-[#9CA3AF] resize-y min-h-[100px]"
                        rows="4"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-xl text-white text-lg font-semibold shadow-lg shadow-[#3B82F6]/30 hover:shadow-xl hover:shadow-[#3B82F6]/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>Confirm Booking</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Right Side - Summary */}
            <div className="lg:sticky lg:top-5 h-fit animate-slideIn" style={{ animationDelay: '300ms' }}>
              <div className="bg-white rounded-3xl shadow-sm p-6 lg:p-8 border border-slate-100 hover:shadow-md transition-all">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                  Booking Summary
                </h3>

                {/* Service Preview */}
                <div className="bg-gradient-to-br from-[#3B82F6]/5 to-[#8B5CF6]/5 rounded-2xl p-5 mb-6 border border-[#3B82F6]/10">
                  <h4 className="text-lg font-bold text-[#1F2937] mb-1">{formData.service}</h4>
                  <p className="text-sm text-[#6B7280] mb-3">Complete service solution</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#F59E0B] text-sm tracking-wider">⭐⭐⭐⭐⭐</span>
                    <span className="text-sm text-[#6B7280]">4.9 (127 reviews)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-full flex items-center justify-center text-white font-bold">
                      JP
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1F2937]">John Professional</p>
                      <p className="text-xs text-[#9CA3AF]">Expert Service Provider</p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="mb-6">
                  <div className="flex justify-between text-[#6B7280] mb-3">
                    <span>Service Fee ({hourlyRate.toFixed(2)} × {formData.persons} hr)</span>
                    <span className="font-medium">LKR {paymentSummary.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B7280] mb-3">
                    <span>Platform Fee</span>
                    <span className="font-medium">LKR {paymentSummary.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B7280] mb-3">
                    <span>Tax (5%)</span>
                    <span className="font-medium">LKR {paymentSummary.tax.toFixed(2)}</span>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent my-4"></div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold text-[#1F2937]">Total Amount</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">LKR {paymentSummary.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Time Slot Display */}
                <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#EC4899]/10 border border-[#8B5CF6]/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8B5CF6] text-xl"></span>
                      <span className="text-[#8B5CF6] font-medium">Selected Time Slot</span>
                    </div>
                    <span className="text-[#1F2937] font-semibold">{formData.timeSlot}</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gradient-to-r from-[#10B981]/10 to-[#059669]/10 border border-[#10B981]/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#10B981] text-xl">⏱</span>
                      <span className="text-[#10B981] font-medium">Estimated Timeline</span>
                    </div>
                    <span className="text-[#1F2937] font-semibold">{formData.persons} hour{formData.persons > 1 ? 's' : ''}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#10B981] to-[#059669] h-1.5 rounded-full animate-pulse-subtle" style={{ width: '75%' }}></div>
                  </div>
                </div>

                {/* Security */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#10B981]/10 border border-[#10B981]/20 rounded-full">
                    <span className="text-[#10B981]"></span>
                    <span className="text-sm text-[#10B981] font-medium">Secure Payment Protected</span>
                  </div>
                  <div>
                    <a href="#" className="text-[#3B82F6] text-sm hover:text-[#8B5CF6] transition-colors inline-flex items-center gap-1 group">
                      Terms and Conditions
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm; 