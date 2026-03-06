import React, { useState } from 'react';

const Payment = () => {
  const [selectedMethod, setSelectedMethod] = useState('credit');
  const [cardNumber] = useState('5282 3456 7890 1289');
  const [expiry] = useState('09/25');
  const [name] = useState('Amahan pasan perera');
  const [expiryDate] = useState('11/34');
  const [cvv] = useState('234');

  return (
    <div className="min-h-screen bg-[#0D1117] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',sans-serif] flex items-center justify-center">
      <div className="max-w-[1200px] w-full bg-[#0D1117] p-4 sm:p-5">
        {/* Main Content */}
        <div className="w-full">
          {/* Header - Minimal spacing */}
          <div className="mb-5"></div>

          {/* Payment Split Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-[30px]">
            
            {/* Left Panel - Payment Method */}
            <div className="bg-[#161B22] rounded-[20px] p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-[#21262D]">
              <h2 className="text-lg font-semibold text-white mb-5">Select Payment method</h2>
              
              {/* Payment Methods List */}
              <div className="mb-5">
                {/* Credit Card */}
                <div 
                  className={`flex justify-between items-center py-3 cursor-pointer border-b border-[#21262D] ${
                    selectedMethod === 'credit' 
                      ? 'bg-[rgba(30,144,255,0.1)] -mx-3 px-3 rounded-[10px] border-b-0 border-l-4 border-l-[#1E90FF]' 
                      : ''
                  }`}
                  onClick={() => setSelectedMethod('credit')}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-white text-[15px]">Credit card</span>
                    <span className="text-[13px] text-[#A0A0A0]">Current Balance: LKR 5,750.20</span>
                  </div>
                  <span className="text-[13px] text-[#A0A0A0] bg-[#21262D] px-2.5 py-1 rounded-full">Mastercard</span>
                </div>

                {/* Paypal */}
                <div 
                  className={`flex justify-between items-center py-3 cursor-pointer border-b border-[#21262D] ${
                    selectedMethod === 'paypal' 
                      ? 'bg-[rgba(30,144,255,0.1)] -mx-3 px-3 rounded-[10px] border-b-0 border-l-4 border-l-[#1E90FF]' 
                      : ''
                  }`}
                  onClick={() => setSelectedMethod('paypal')}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-white text-[15px]">Paypal</span>
                  </div>
                  <span className="text-[13px] text-[#A0A0A0] bg-[#21262D] px-2.5 py-1 rounded-full">Mastercard</span>
                </div>

                {/* Other */}
                <div 
                  className={`flex justify-between items-center py-3 cursor-pointer ${
                    selectedMethod === 'other' 
                      ? 'bg-[rgba(30,144,255,0.1)] -mx-3 px-3 rounded-[10px] border-l-4 border-l-[#1E90FF]' 
                      : ''
                  }`}
                  onClick={() => setSelectedMethod('other')}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-white text-[15px]">Other</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#21262D] my-5"></div>

              {/* Pay using credit cards */}
              <div className="mb-5">
                <h3 className="text-[15px] font-medium text-white mb-2.5">Pay using credit cards</h3>
                <div className="flex gap-2.5">
                  <span className="bg-[#1E90FF] text-white px-3 py-1 rounded-md text-xs font-semibold tracking-wide shadow-[0_0_10px_rgba(30,144,255,0.3)]">
                    Visa
                  </span>
                </div>
              </div>

              {/* Credit Card Details */}
              <div className="mb-5">
                <h4 className="text-[13px] text-[#A0A0A0] mb-2 font-normal">Credit card</h4>
                <div className="bg-[#0D1117] p-3 rounded-[10px] border border-[#21262D]">
                  <div className="font-['Courier_New'] text-base text-white tracking-wider mb-1 break-all">{cardNumber}</div>
                  <div className="text-sm text-[#A0A0A0]">{expiry}</div>
                </div>
              </div>

              {/* Name Field */}
              <div className="mb-5">
                <label className="block text-[13px] text-[#A0A0A0] mb-2 font-normal">Name</label>
                <div className="bg-[#0D1117] p-3 rounded-[10px] border border-[#21262D] text-[15px] text-white">
                  {name}
                </div>
              </div>

              {/* Expiration Date and CVV */}
              <div className="grid grid-cols-2 gap-[15px]">
                <div>
                  <label className="block text-[13px] text-[#A0A0A0] mb-2 font-normal">Expiration Date</label>
                  <div className="bg-[#0D1117] p-3 rounded-[10px] border border-[#21262D] text-[15px] text-white">
                    {expiryDate}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] text-[#A0A0A0] mb-2 font-normal">CVV</label>
                  <div className="bg-[#0D1117] p-3 rounded-[10px] border border-[#21262D] text-[15px] text-white">
                    {cvv}
                  </div>
                </div>
              </div>

              {/* Total Section */}
              <div className="flex justify-between items-center mt-5 pt-5 border-t-2 border-[#21262D]">
                <span className="text-base font-semibold text-white">Total</span>
                <span className="text-xl font-bold text-[#00CFFF] drop-shadow-[0_0_10px_rgba(0,207,255,0.5)]">
                  LKR 11800.18
                </span>
              </div>
            </div>

            {/* Right Panel - Order Summary */}
            <div className="bg-[#161B22] rounded-[20px] p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-[#21262D]">
              <h2 className="text-lg font-semibold text-white mb-5">Order Summary</h2>
              
              {/* Product */}
              <div className="mb-6 pb-5 border-b border-[#21262D]">
                <div className="flex flex-col gap-1">
                  <span className="text-base text-[#A0A0A0]">BMW 3 Series</span>
                  <span className="text-2xl font-bold text-white">LKR 12000.18 Lakh</span>
                </div>
              </div>

              {/* Order Details List */}
              <div className="mb-6">
                {/* Delivery Time */}
                <div className="flex justify-between items-center py-3 border-b border-dashed border-[#21262D]">
                  <span className="text-sm text-[#A0A0A0]">Delivery Time</span>
                  <span className="text-sm font-medium text-white">11 Jan 2022, 10.00 am</span>
                </div>
                
                {/* Commission */}
                <div className="flex justify-between items-center py-3 border-b border-dashed border-[#21262D]">
                  <span className="text-sm text-[#A0A0A0]">Comisson</span>
                  <span className="text-sm font-medium text-[#FF4444]">-LKR 140.00</span>
                </div>
                
                {/* Invoice */}
                <div className="flex justify-between items-center py-3 border-b border-dashed border-[#21262D]">
                  <span className="text-sm text-[#A0A0A0]">Invoice</span>
                  <span className="text-sm font-medium text-white">000-1234-BMW-001</span>
                </div>
                
                {/* Discount */}
                <div className="flex justify-between items-center py-3 border-b border-dashed border-[#21262D]">
                  <span className="text-sm text-[#A0A0A0]">Discount</span>
                  <span className="text-sm font-medium text-[#00CFFF] drop-shadow-[0_0_5px_rgba(0,207,255,0.3)]">%10</span>
                </div>
                
                {/* Subtotal */}
                <div className="flex justify-between items-center py-3 border-t border-[#21262D] border-b  mt-1">
                  <span className="text-sm text-[#A0A0A0]">Subtotal</span>
                  <span className="text-sm font-semibold text-white">LKR 11800.18</span>
                </div>
                
                {/* Total */}
                <div className="flex justify-between items-center py-3 mt-2.5">
                  <span className="text-sm text-[#A0A0A0]">Total</span>
                  <span className="text-lg font-bold text-[#00CFFF] drop-shadow-[0_0_10px_rgba(0,207,255,0.5)]">
                    LKR 11800.18
                  </span>
                </div>
              </div>

              {/* Pay Button */}
              <button className="w-full bg-transparent text-white border-2 border-[#1E90FF] py-4 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-[#1E90FF] hover:border-[#1E90FF] hover:shadow-[0_0_20px_rgba(30,144,255,0.6)] hover:-translate-y-0.5 relative overflow-hidden">
                Pay LKR 11800.18
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Graph/Analytics Line Style (for future use) */}
      <div className="hidden">
        <div className="h-0.5 bg-[#00CFFF] shadow-[0_0_10px_rgba(0,207,255,0.5)] rounded"></div>
      </div>
    </div>
  );
};

export default Payment;    