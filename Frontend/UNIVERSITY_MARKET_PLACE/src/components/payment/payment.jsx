import React, { useState } from "react";

const Payment = () => {
  const [selectedMethod, setSelectedMethod] = useState("credit");
  const [cardNumber] = useState("5282 3456 7890 1289");
  const [expiry] = useState("09/25");
  const [name] = useState("Amahan pasan perera");
  const [expiryDate] = useState("11/34");
  const [cvv] = useState("234");

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
      <div className="max-w-[1200px] w-full p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-[30px]">

          {/* LEFT PANEL */}
          <div className="bg-[#161B22] rounded-[20px] p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-[#21262D]">
            
            <h2 className="text-lg font-semibold text-white mb-5">
              Select Payment method
            </h2>

            {/* PAYMENT METHODS */}
            <div className="mb-5">

              {/* CREDIT CARD */}
              <div
                className={`flex justify-between items-center py-3 cursor-pointer border-b border-[#21262D] ${
                  selectedMethod === "credit"
                    ? "bg-[rgba(30,144,255,0.1)] -mx-3 px-3 rounded-[10px] border-b-0 border-l-4 border-l-[#1E90FF]"
                    : ""
                }`}
                onClick={() => setSelectedMethod("credit")}
              >
                <div>
                  <p className="text-white font-medium">Credit Card</p>
                  <p className="text-sm text-[#A0A0A0]">
                    Current Balance: $5,750.20
                  </p>
                </div>

                <span className="text-xs bg-[#21262D] text-[#A0A0A0] px-2 py-1 rounded">
                  Mastercard
                </span>
              </div>

              {/* PAYPAL */}
              <div
                className={`flex justify-between items-center py-3 cursor-pointer border-b border-[#21262D] ${
                  selectedMethod === "paypal"
                    ? "bg-[rgba(30,144,255,0.1)] -mx-3 px-3 rounded-[10px] border-b-0 border-l-4 border-l-[#1E90FF]"
                    : ""
                }`}
                onClick={() => setSelectedMethod("paypal")}
              >
                <span className="text-white font-medium">Paypal</span>

                <span className="text-xs bg-[#21262D] text-[#A0A0A0] px-2 py-1 rounded">
                  Mastercard
                </span>
              </div>

              {/* OTHER */}
              <div
                className={`flex justify-between items-center py-3 cursor-pointer ${
                  selectedMethod === "other"
                    ? "bg-[rgba(30,144,255,0.1)] -mx-3 px-3 rounded-[10px] border-l-4 border-l-[#1E90FF]"
                    : ""
                }`}
                onClick={() => setSelectedMethod("other")}
              >
                <span className="text-white font-medium">Other</span>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="h-px bg-[#21262D] my-5"></div>

            {/* CREDIT CARD TYPES */}
            <div className="mb-5">
              <h3 className="text-white mb-2">Pay using credit cards</h3>

              <span className="bg-[#1E90FF] text-white px-3 py-1 rounded text-xs">
                Visa
              </span>
            </div>

            {/* CARD DETAILS */}
            <div className="mb-5">
              <h4 className="text-[#A0A0A0] text-sm mb-2">Credit card</h4>

              <div className="bg-[#0D1117] p-3 rounded-lg border border-[#21262D]">
                <p className="text-white tracking-widest">{cardNumber}</p>
                <p className="text-sm text-[#A0A0A0]">{expiry}</p>
              </div>
            </div>

            {/* NAME */}
            <div className="mb-5">
              <label className="text-[#A0A0A0] text-sm block mb-2">Name</label>

              <div className="bg-[#0D1117] p-3 border border-[#21262D] rounded-lg text-white">
                {name}
              </div>
            </div>

            {/* EXPIRY + CVV */}
            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="text-[#A0A0A0] text-sm block mb-2">
                  Expiration Date
                </label>

                <div className="bg-[#0D1117] p-3 border border-[#21262D] rounded-lg text-white">
                  {expiryDate}
                </div>
              </div>

              <div>
                <label className="text-[#A0A0A0] text-sm block mb-2">
                  CVV
                </label>

                <div className="bg-[#0D1117] p-3 border border-[#21262D] rounded-lg text-white">
                  {cvv}
                </div>
              </div>
            </div>

            {/* TOTAL */}
            <div className="flex justify-between items-center mt-5 pt-5 border-t border-[#21262D]">
              <span className="text-white font-semibold">Total</span>

              <span className="text-[#00CFFF] text-xl font-bold">
                $11800.18
              </span>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="bg-[#161B22] rounded-[20px] p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-[#21262D]">

            <h2 className="text-lg font-semibold text-white mb-5">
              Order Summary
            </h2>

            {/* PRODUCT */}
            <div className="mb-6 pb-5 border-b border-[#21262D]">
              <p className="text-[#A0A0A0]">BMW 3 Series</p>

              <p className="text-2xl font-bold text-white">
                $12000.18 Lakh
              </p>
            </div>

            {/* DETAILS */}

            <div className="mb-6">

              <div className="flex justify-between py-3 border-b border-dashed border-[#21262D]">
                <span className="text-[#A0A0A0]">Delivery Time</span>
                <span className="text-white">11 Jan 2022</span>
              </div>

              <div className="flex justify-between py-3 border-b border-dashed border-[#21262D]">
                <span className="text-[#A0A0A0]">Commission</span>
                <span className="text-red-500">-$140</span>
              </div>

              <div className="flex justify-between py-3 border-b border-dashed border-[#21262D]">
                <span className="text-[#A0A0A0]">Invoice</span>
                <span className="text-white">000-1234</span>
              </div>

              <div className="flex justify-between py-3 border-b border-dashed border-[#21262D]">
                <span className="text-[#A0A0A0]">Discount</span>
                <span className="text-[#00CFFF]">%10</span>
              </div>

              {/* FIXED LINE */}
              <div className="flex justify-between items-center py-3 border-y border-[#21262D] mt-1">
                <span className="text-[#A0A0A0]">Subtotal</span>
                <span className="text-white font-semibold">$11800.18</span>
              </div>

              <div className="flex justify-between py-3">
                <span className="text-[#A0A0A0]">Total</span>
                <span className="text-[#00CFFF] text-lg font-bold">
                  $11800.18
                </span>
              </div>
            </div>

            {/* PAY BUTTON */}

            <button className="w-full border-2 border-[#1E90FF] py-4 rounded-xl text-white font-semibold hover:bg-[#1E90FF] transition">
              Pay $11800.18
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Payment;