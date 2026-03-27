import React, { useState } from 'react';

const Payment = () => {
  const [selectedMethod, setSelectedMethod] = useState('credit');
  const [cardNumber] = useState('5282 3456 7890 1289');
  const [expiry] = useState('09/25');
  const [name] = useState('Amahan pasan perera');
  const [expiryDate] = useState('11/34');
  const [cvv] = useState('234');

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
            <button className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white py-4 rounded-xl text-base font-semibold shadow-lg shadow-[#3B82F6]/30 hover:shadow-xl hover:shadow-[#3B82F6]/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group">
              <span>Pay LKR 11,800.18</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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
    </div>
  );
};

export default Payment;