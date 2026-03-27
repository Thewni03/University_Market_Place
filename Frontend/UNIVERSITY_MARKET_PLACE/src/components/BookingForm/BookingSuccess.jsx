import React from 'react'
import { useNavigate } from 'react-router-dom'

function BookingSuccess() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] via-[#F0F3FF] to-[#E9ECFF] py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
            <div className="max-w-md w-full">
                {/* Main Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(34,197,94,0.2)] p-8 lg:p-10 border border-white/50 hover:shadow-[0_25px_70px_-15px_rgba(34,197,94,0.3)] transition-all duration-500 text-center">
                    
                    {/* Success Icon with Animation */}
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 animate-bounce-subtle">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Badge */}
                    <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-widest mb-4 uppercase">
                        Booking Confirmed
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#10B981] to-[#059669] bg-clip-text text-transparent mb-3">
                        Booking Successful!
                    </h1>
                    
                    <div className="h-1 w-16 bg-gradient-to-r from-[#10B981] to-[#059669] mx-auto mb-6 rounded-full"></div>

                    {/* Message */}
                    <p className="text-[#6B7280] mb-3">
                        Your booking has been confirmed successfully!
                    </p>
                    <p className="text-[#6B7280] mb-6">
                        A confirmation email has been sent to your registered email address.
                    </p>
                    
                    {/* Booking Details Card */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-6 py-4 mb-8">
                        <p className="text-green-700 text-sm font-semibold mb-2">
                            Booking ID: <span className="bg-green-100 px-3 py-1 rounded-full inline-block ml-1 font-mono text-xs">UNI-2024-12345</span>
                        </p>
                        <p className="text-green-600 text-xs">
                            Service Provider will contact you within 24 hours
                        </p>
                    </div>

                    {/* Action Buttons - Only Payment Button */}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/payment')}
                            className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-bold py-3 px-8 rounded-xl text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/30 hover:scale-[1.02] flex items-center justify-center gap-2 group"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10H2a2 2 0 00-2 2v2a2 2 0 002 2h1m0-6h1a2 2 0 012 2v2a2 2 0 01-2 2h-1M3 10h1m0 0v6m7-6h1a2 2 0 012 2v2a2 2 0 01-2 2h-1m0-6v6m7-6h1a2 2 0 012 2v2a2 2 0 01-2 2h-1m0-6v6" />
                            </svg>
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            </div>

            {/* Add CSS animations */}
            <style jsx>{`
                @keyframes bounce-subtle {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 0.5s ease-in-out;
                }
            `}</style>
        </div>
    )
}

export default BookingSuccess