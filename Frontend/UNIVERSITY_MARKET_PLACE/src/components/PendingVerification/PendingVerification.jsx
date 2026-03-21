import React from 'react'
import { useNavigate } from 'react-router-dom'

function PendingVerification() {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
            <div className="w-full max-w-md text-center">

                {/* Icon */}
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">⏳</span>
                </div>

                <p className="text-cyan-500 font-semibold tracking-widest text-sm uppercase mb-2">University Marketplace</p>
                <h1 className="text-3xl font-black text-purple-950 mb-3">Verification Pending</h1>
                <div className="h-1 w-16 bg-cyan-500 mt-3 rounded-full mx-auto mb-6"></div>

                <p className="text-gray-500 mb-2">Your registration was successful!</p>
                <p className="text-gray-500 mb-8">Please wait while our admin reviews and verifies your student ID. This may take up to 24 hours.</p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-4 mb-8">
                    <p className="text-yellow-700 text-sm font-semibold">Status: <span className="bg-yellow-100 px-2 py-1 rounded-full">Pending</span></p>
                </div>

                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/login');
                    }}
                    className="bg-purple-950 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-xl tracking-widest uppercase text-sm transition-all duration-300"
                >
                    Back to Login
                </button>

            </div>
        </div>
    )
}

export default PendingVerification