import React, { useState } from 'react';
import './payment.css';

const Payment = () => {
  const [selectedMethod, setSelectedMethod] = useState('credit');
  const [cardNumber] = useState('5282 3456 7890 1289');
  const [expiry] = useState('09/25');
  const [name] = useState('Amahan pasan perera');
  const [expiryDate] = useState('11/34');
  const [cvv] = useState('234');

  return (
    <div className="payment-container">
      {/* Main Content - No Sidebar */}
      <div className="main-content">
        {/* Header - Empty */}
        <div className="header">
          {/* Header content removed */}
        </div>

        {/* Payment Split Screen */}
        <div className="payment-split">
          {/* Left Panel - Payment Method */}
          <div className="payment-left">
            <h2 className="section-title">Select Payment method</h2>
            
            {/* Payment Methods List */}
            <div className="payment-methods">
              <div className={`method-item ${selectedMethod === 'credit' ? 'selected' : ''}`}>
                <div className="method-left">
                  <span className="method-name">Credit card</span>
                  <span className="method-balance">Current Balance: $5,750.20</span>
                </div>
                <span className="method-card">Mastercard</span>
              </div>

              <div className={`method-item ${selectedMethod === 'paypal' ? 'selected' : ''}`}>
                <div className="method-left">
                  <span className="method-name">Paypal</span>
                </div>
                <span className="method-card">Mastercard</span>
              </div>

              <div className={`method-item ${selectedMethod === 'other' ? 'selected' : ''}`}>
                <div className="method-left">
                  <span className="method-name">Other</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="divider"></div>

            {/* Pay using credit cards */}
            <div className="credit-cards-section">
              <h3 className="subsection-title">Pay using credit cards</h3>
              <div className="card-logos">
                <span className="visa-logo">Visa</span>
              </div>
            </div>

            {/* Credit Card Details */}
            <div className="credit-card-details">
              <h4 className="detail-label">Credit card</h4>
              <div className="card-info">
                <div className="card-number">{cardNumber}</div>
                <div className="card-expiry">{expiry}</div>
              </div>
            </div>

            {/* Name Field */}
            <div className="form-field">
              <label className="field-label">Name</label>
              <div className="field-value">{name}</div>
            </div>

            {/* Expiration Date and CVV */}
            <div className="form-row">
              <div className="form-field half">
                <label className="field-label">Expiration Date</label>
                <div className="field-value">{expiryDate}</div>
              </div>
              <div className="form-field half">
                <label className="field-label">CVV</label>
                <div className="field-value">{cvv}</div>
              </div>
            </div>

            {/* Total */}
            <div className="total-section">
              <span className="total-label">Total</span>
              <span className="total-amount">$11800.18</span>
            </div>
          </div>

          {/* Right Panel - Order Summary */}
          <div className="payment-right">
            <h2 className="section-title">Order Summary</h2>
            
            {/* Product */}
            <div className="product-item">
              <div className="product-info">
                <span className="product-name">BMW 3 Series</span>
                <span className="product-price">$12000.18 Lakh</span>
              </div>
            </div>

            {/* Order Details List */}
            <div className="order-details">
              <div className="detail-row">
                <span className="detail-label">Delivery Time</span>
                <span className="detail-value">11 Jan 2022, 10.00 am</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Comisson</span>
                <span className="detail-value commission">-$140.00</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Invoice</span>
                <span className="detail-value">000-1234-BMW-001</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Discount</span>
                <span className="detail-value discount">%10</span>
              </div>
              
              <div className="detail-row subtotal">
                <span className="detail-label">Subtotal</span>
                <span className="detail-value">$11800.18</span>
              </div>
              
              <div className="detail-row total-row">
                <span className="detail-label">Total</span>
                <span className="detail-value total-green">$11800.18</span>
              </div>
            </div>

            {/* Pay Button */}
            <button className="pay-button">Pay $11800.18</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;