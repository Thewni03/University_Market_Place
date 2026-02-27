import React, { useState } from 'react';
import './Booking.css';

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
    <div className="unimarket-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">UniMarket</div>
        <div className="nav-links">
          <a href="#">Browse</a>
          <a href="#">My Learning</a>
          <a href="#">Inbox</a>
          <div className="nav-profile">👤</div>
        </div>
      </nav>

      {/* Header Profile */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-placeholder">👩‍🏫</div>
        </div>
        <div className="profile-info">
          <h1>Dr. Sarah Johnson</h1>
          <div className="profile-badges">
            <span className="badge top-rated">⭐ Top Rated Provider</span>
            <span className="badge trust">Trust Score: 96%</span>
          </div>
          <div className="profile-stats">
            <span>⭐ 4.7 (342 reviews)</span>
            <span>📈 156 Completed Jobs</span>
            <span>🏛️ University of Colombo</span>
            <span>💻 Computer Science</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-bar">
          <input type="text" placeholder="Search services" />
          <select className="category-select">
            <option>All Categories</option>
          </select>
          <select className="sort-select">
            <option>Sort by: Popular</option>
          </select>
        </div>
        <div className="filter-buttons">
          <button className="filter-btn glow">4+ Stars</button>
          <button className="filter-btn glow">Quick Delivery</button>
          <button className="filter-btn glow">Price Range</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Side - Service Grid */}
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card" onClick={() => setSelectedService(service.title)}>
              <div className="service-image">{service.image}</div>
              <div className="service-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="service-meta">
                  <span className="rating">⭐ {service.rating}</span>
                  <span className="duration">{service.modules}</span>
                </div>
                <div className="service-price">LKR {service.price.toLocaleString()}</div>
                <div className="service-actions">
                  <button className="btn-outline">Select</button>
                  <button className="btn-gradient">Book</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side - Booking Summary */}
        <div className="booking-summary">
          <h2>Booking Summary</h2>
          
          <div className="summary-item">
            <span>Selected Service</span>
            <span className="service-name">{selectedService}</span>
          </div>
          
          <div className="summary-item">
            <span>Service Price</span>
            <span>LKR {serviceData[selectedService].price.toLocaleString()}</span>
          </div>
          
          <div className="summary-item">
            <span>Platform Fee (5%)</span>
            <span>LKR {platformFee.toLocaleString()}</span>
          </div>
          
          <div className="summary-item total">
            <span>Total Amount</span>
            <span className="total-amount">LKR {totalAmount.toLocaleString()}</span>
          </div>
          
          <div className="completion-badge">
            ⏱️ Estimated Completion: {serviceData[selectedService].duration}
          </div>
          
          <button className="proceed-btn">Proceed to Booking</button>
          <button className="save-btn">Save for Later</button>
          
          <div className="secure-note">
            🔒 Secure payment - 256-bit SSL encrypted
          </div>
          
          <div className="help-section">
            <button className="help-btn">💬 Chat with Provider</button>
            <button className="help-btn">📞 Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;