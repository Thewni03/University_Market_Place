import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('credit');
  const [cardNumber] = useState('5282 3456 7890 1289');
  const [expiry] = useState('09/25');
  const [name] = useState('Amahan pasan perera');
  const [expiryDate] = useState('11/34');
  const [cvv] = useState('234');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Booking details
  const bookingDetails = {
    bookingId: 'UNI-' + Math.floor(Math.random() * 1000000),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    serviceName: 'BMW 3 Series',
    amount: '11,800.18',
    paymentMethod: selectedMethod === 'credit' ? 'Credit Card' : selectedMethod === 'paypal' ? 'PayPal' : 'Bank Transfer',
    cardLast4: selectedMethod === 'credit' ? '1289' : 'N/A',
    customerName: 'Amahan pasan perera',
    customerEmail: 'amahan@example.com'
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Set receipt data
    setReceiptData(bookingDetails);
    
    // Show success modal
    setIsProcessing(false);
    setShowSuccessModal(true);
  };

  const downloadReceipt = () => {
    // Create receipt HTML content
    const receiptHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
          }
          .receipt-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .receipt-header h1 {
            margin: 0;
            font-size: 28px;
          }
          .receipt-header p {
            margin: 10px 0 0;
            opacity: 0.9;
          }
          .receipt-body {
            padding: 30px;
          }
          .receipt-section {
            margin-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 15px;
          }
          .receipt-section h3 {
            color: #374151;
            margin: 0 0 15px 0;
            font-size: 18px;
          }
          .receipt-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
          }
          .receipt-label {
            font-weight: 600;
            color: #6b7280;
          }
          .receipt-value {
            color: #1f2937;
            font-weight: 500;
          }
          .total-row {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #667eea;
            font-size: 18px;
          }
          .total-row .receipt-value {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
          }
          .success-icon {
            width: 60px;
            height: 60px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
          }
          .success-icon svg {
            width: 30px;
            height: 30px;
            color: white;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background: #f9fafb;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <div class="success-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1>Payment Successful!</h1>
            <p>Thank you for your payment</p>
          </div>
          <div class="receipt-body">
            <div class="receipt-section">
              <h3>Receipt Details</h3>
              <div class="receipt-row">
                <span class="receipt-label">Receipt ID:</span>
                <span class="receipt-value">${receiptData.bookingId}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Date & Time:</span>
                <span class="receipt-value">${receiptData.date} at ${receiptData.time}</span>
              </div>
            </div>

            <div class="receipt-section">
              <h3>Customer Information</h3>
              <div class="receipt-row">
                <span class="receipt-label">Name:</span>
                <span class="receipt-value">${receiptData.customerName}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Email:</span>
                <span class="receipt-value">${receiptData.customerEmail}</span>
              </div>
            </div>

            <div class="receipt-section">
              <h3>Payment Details</h3>
              <div class="receipt-row">
                <span class="receipt-label">Service:</span>
                <span class="receipt-value">${receiptData.serviceName}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Payment Method:</span>
                <span class="receipt-value">${receiptData.paymentMethod}</span>
              </div>
              ${receiptData.paymentMethod === 'Credit Card' ? `
              <div class="receipt-row">
                <span class="receipt-label">Card Last 4:</span>
                <span class="receipt-value">**** **** **** ${receiptData.cardLast4}</span>
              </div>
              ` : ''}
              <div class="receipt-row total-row">
                <span class="receipt-label">Total Amount:</span>
                <span class="receipt-value">LKR ${receiptData.amount}</span>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>This is a computer-generated receipt. No signature required.</p>
            <p>© ${new Date().getFullYear()} University Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${receiptData.bookingId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  const handleHome = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] via-[#F0F3FF] to-[#E9ECFF] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest mb-4 uppercase">
            SECURE PAYMENT
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent mb-4">
            Complete Your Payment
          </h1>
          <p className="text-base text-[#6B7280]">Choose your preferred payment method to complete the booking</p>
        </div>

        {/* Payment Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel - Payment Method */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(59,130,246,0.2)] p-6 lg:p-8 border border-white/50 hover:shadow-[0_25px_70px_-15px_rgba(59,130,246,0.3)] transition-all duration-500">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent mb-6">
              Select Payment Method
            </h2>
            
            {/* Payment Methods List */}
            <div className="space-y-2 mb-6">
              {/* Credit Card */}
              <div 
                className={`flex justify-between items-center p-4 cursor-pointer rounded-xl transition-all duration-300 ${
                  selectedMethod === 'credit' 
                    ? 'bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10 border-2 border-[#3B82F6]/30 shadow-md' 
                    : 'bg-gray-50/50 border border-gray-200 hover:border-[#3B82F6]/30 hover:shadow-md'
                }`}
                onClick={() => setSelectedMethod('credit')}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-[#1F2937] text-[15px]">Credit Card</span>
                  <span className="text-[13px] text-[#6B7280]">Current Balance: LKR 5,750.20</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-[#6B7280] bg-white px-3 py-1 rounded-full border border-gray-200">Visa</span>
                  <span className="text-xs text-[#6B7280] bg-white px-3 py-1 rounded-full border border-gray-200">Mastercard</span>
                </div>
              </div>

              {/* Paypal */}
              <div 
                className={`flex justify-between items-center p-4 cursor-pointer rounded-xl transition-all duration-300 ${
                  selectedMethod === 'paypal' 
                    ? 'bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10 border-2 border-[#3B82F6]/30 shadow-md' 
                    : 'bg-gray-50/50 border border-gray-200 hover:border-[#3B82F6]/30 hover:shadow-md'
                }`}
                onClick={() => setSelectedMethod('paypal')}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-[#1F2937] text-[15px]">PayPal</span>
                  <span className="text-[13px] text-[#6B7280]">Fast & Secure Online Payment</span>
                </div>
                <span className="text-xs text-[#6B7280] bg-white px-3 py-1 rounded-full border border-gray-200">PayPal</span>
              </div>

              {/* Other */}
              <div 
                className={`flex justify-between items-center p-4 cursor-pointer rounded-xl transition-all duration-300 ${
                  selectedMethod === 'other' 
                    ? 'bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10 border-2 border-[#3B82F6]/30 shadow-md' 
                    : 'bg-gray-50/50 border border-gray-200 hover:border-[#3B82F6]/30 hover:shadow-md'
                }`}
                onClick={() => setSelectedMethod('other')}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-[#1F2937] text-[15px]">Bank Transfer</span>
                  <span className="text-[13px] text-[#6B7280]">Direct bank transfer</span>
                </div>
                <span className="text-xs text-[#6B7280] bg-white px-3 py-1 rounded-full border border-gray-200">Bank</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>

            {/* Pay using credit cards */}
            <div className="mb-6">
              <h3 className="text-[15px] font-semibold text-[#1F2937] mb-3">Pay using credit cards</h3>
              <div className="flex gap-3">
                <span className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide shadow-md">
                  Visa
                </span>
                <span className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide shadow-md">
                  Mastercard
                </span>
                <span className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide shadow-md">
                  Amex
                </span>
              </div>
            </div>

            {/* Credit Card Details */}
            <div className="mb-6">
              <h4 className="text-[13px] text-[#6B7280] mb-2 font-medium">Credit Card Number</h4>
              <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <div className="font-mono text-base text-[#1F2937] tracking-wider mb-1 break-all">{cardNumber}</div>
                <div className="text-sm text-[#6B7280]">Expires: {expiry}</div>
              </div>
            </div>

            {/* Name Field */}
            <div className="mb-6">
              <label className="block text-[13px] text-[#6B7280] mb-2 font-medium">Cardholder Name</label>
              <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 text-[15px] text-[#1F2937]">
                {name}
              </div>
            </div>

            {/* Expiration Date and CVV */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-2 font-medium">Expiration Date</label>
                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 text-[15px] text-[#1F2937]">
                  {expiryDate}
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-2 font-medium">CVV</label>
                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 text-[15px] text-[#1F2937]">
                  {cvv}
                </div>
              </div>
            </div>

            {/* Total Section */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <span className="text-base font-semibold text-[#1F2937]">Total Amount</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                LKR 11,800.18
              </span>
            </div>
          </div>

          {/* Right Panel - Order Summary */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(139,92,246,0.2)] p-6 lg:p-8 border border-white/50 hover:shadow-[0_25px_70px_-15px_rgba(139,92,246,0.3)] transition-all duration-500">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent mb-6">
              Order Summary
            </h2>
            
            {/* Product */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-xl flex items-center justify-center text-white text-2xl shadow-md">
                  🚗
                </div>
                <div className="flex-1">
                  <span className="text-base text-[#6B7280] block mb-1">BMW 3 Series</span>
                  <span className="text-2xl font-bold text-[#1F2937]">LKR 12,000.18</span>
                </div>
              </div>
            </div>

            {/* Order Details List */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[#6B7280]">Delivery Time</span>
                <span className="text-sm font-medium text-[#1F2937]">11 Jan 2022, 10.00 am</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[#6B7280]">Commission</span>
                <span className="text-sm font-medium text-red-500">-LKR 140.00</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[#6B7280]">Invoice</span>
                <span className="text-sm font-medium text-[#1F2937] font-mono">000-1234-BMW-001</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[#6B7280]">Discount</span>
                <span className="text-sm font-medium bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent font-bold">
                  10% OFF
                </span>
              </div>
              
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-4"></div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[#6B7280]">Subtotal</span>
                <span className="text-sm font-semibold text-[#1F2937]">LKR 11,800.18</span>
              </div>
              
              <div className="flex justify-between items-center pt-3">
                <span className="text-base font-semibold text-[#1F2937]">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                  LKR 11,800.18
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white py-4 rounded-xl text-base font-semibold shadow-lg shadow-[#3B82F6]/30 hover:shadow-xl hover:shadow-[#3B82F6]/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <span>Pay LKR 11,800.18</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            {/* Security Badge */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                <span className="text-green-600">🔒</span>
                <span className="text-xs text-green-700 font-medium">Secure Payment Protected</span>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-3">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform animate-slideIn">
            <div className="p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-500 mb-6">
                  Your payment of LKR {receiptData?.amount} has been processed successfully.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="text-gray-900 font-mono font-medium">{receiptData?.bookingId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="text-gray-900">{receiptData?.date} at {receiptData?.time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="text-gray-900">{receiptData?.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-semibold">Amount Paid:</span>
                    <span className="text-green-600 font-bold">LKR {receiptData?.amount}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={downloadReceipt}
                  className="flex-1 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Receipt
                </button>
                <button
                  onClick={handleHome}
                  className="flex-1 bg-white border-2 border-[#3B82F6] text-[#3B82F6] py-3 rounded-xl font-medium hover:bg-[#3B82F6] hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Payment;