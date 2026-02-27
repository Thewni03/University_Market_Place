import React, { useState } from 'react';
import './BookingForm.css';

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
    <div className="booking-form-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">UniMarket</div>
        <div className="breadcrumb">
          <span className="breadcrumb-item">Home</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item">Services</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item active">Booking Form</span>
        </div>
        <div className="nav-profile">👤</div>
      </nav>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Customer Booking Form</h1>
        <p className="page-subtitle">Please fill in your details to confirm your booking.</p>
        <div className="header-gradient-line"></div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Side - Form */}
        <div className="form-section">
          {/* Customer Details */}
          <div className="glass-panel">
            <div className="section-header">
              <h2 className="section-title blue">Customer Details</h2>
              <div className="section-underline blue"></div>
            </div>

            <div className="form-grid two-column">
              <div className="form-column">
                <div className="input-container">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="glass-input"
                  />
                </div>

                <div className="input-container">
                  <span className="input-icon">📞</span>
                  <input
                    type="tel"
                    name="contact"
                    placeholder="Enter your phone number"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="glass-input"
                  />
                </div>

                <div className="input-container">
                  <span className="input-icon">🆔</span>
                  <input
                    type="text"
                    name="nic"
                    placeholder="Enter NIC or Passport number"
                    value={formData.nic}
                    onChange={handleInputChange}
                    className="glass-input"
                  />
                </div>
                <div className="helper-text">
                  <span className="info-icon">ℹ️</span>
                  Required if applicable
                </div>
              </div>

              <div className="form-column">
                <div className="input-container">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="glass-input"
                  />
                </div>

                <div className="input-container">
                  <span className="input-icon">📍</span>
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="glass-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="glass-panel">
            <div className="section-header">
              <h2 className="section-title purple">Service Details</h2>
              <div className="section-underline purple"></div>
            </div>

            <div className="form-grid two-column">
              <div className="form-column">
                <div className="input-container dropdown">
                  <span className="input-icon">📅</span>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="glass-input"
                  >
                    <option value="">Select a service</option>
                    <option value="premium">Premium Package</option>
                    <option value="standard">Standard Package</option>
                    <option value="basic">Basic Package</option>
                  </select>
                  <span className="dropdown-arrow">▼</span>
                </div>

                <div className="input-container dropdown">
                  <span className="input-icon">⏰</span>
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleInputChange}
                    className="glass-input"
                  >
                    <option value="">Select time slot</option>
                    <option value="9am">9:00 AM - 11:00 AM</option>
                    <option value="11am">11:00 AM - 1:00 PM</option>
                    <option value="2pm">2:00 PM - 4:00 PM</option>
                    <option value="4pm">4:00 PM - 6:00 PM</option>
                  </select>
                  <span className="dropdown-arrow">▼</span>
                </div>
              </div>

              <div className="form-column">
                <div className="input-container">
                  <span className="input-icon">📆</span>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="glass-input"
                  />
                </div>

                <div className="stepper-container">
                  <span className="input-icon">👥</span>
                  <button 
                    className="stepper-btn"
                    onClick={() => handlePersonsChange('decrement')}
                  >−</button>
                  <span className="stepper-value">{formData.persons}</span>
                  <button 
                    className="stepper-btn"
                    onClick={() => handlePersonsChange('increment')}
                  >+</button>
                </div>
              </div>

              <div className="full-width">
                <div className="textarea-container">
                  <span className="input-icon">💬</span>
                  <textarea
                    name="specialRequests"
                    placeholder="Any special requests or notes..."
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    className="glass-textarea"
                    rows="4"
                  />
                </div>
              </div>
            </div>
          </div>

          <button className="confirm-btn">Confirm Booking</button>
        </div>

        {/* Right Side - Summary */}
        <div className="summary-section">
          <div className="summary-card">
            <h3 className="summary-title">Booking Summary</h3>

            <div className="service-preview">
              <h4 className="service-name">Premium Package</h4>
              <p className="service-description">Complete service solution</p>
              <div className="rating">
                <span className="stars">⭐⭐⭐⭐⭐</span>
                <span className="rating-text">4.9 (127 reviews)</span>
              </div>
              <div className="provider-info">
                <div className="provider-avatar-small"></div>
                <span className="provider-name">John Professional</span>
              </div>
            </div>

            <div className="price-breakdown">
              <div className="price-item">
                <span>Service Fee</span>
                <span>$299.00</span>
              </div>
              <div className="price-item">
                <span>Platform Fee</span>
                <span>$19.00</span>
              </div>
              <div className="price-divider"></div>
              <div className="price-item total">
                <span>Total Amount</span>
                <span className="total-amount">$318.00</span>
              </div>
            </div>

            <div className="timeline-section">
              <span className="timeline-label">⏱️ Estimated Timeline</span>
              <span className="timeline-value">2-3 hours completion</span>
            </div>

            <div className="security-section">
              <div className="secure-badge">
                <span>🔒 Secure Payment Protected</span>
              </div>
              <a href="#" className="terms-link">Terms and Conditions →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;