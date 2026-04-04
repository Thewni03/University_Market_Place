import React, { useState } from 'react';
import axios from 'axios';

function UserLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const loginDetails = { email, password };
        try {
            const response = await axios.post("http://localhost:8080/admin/userlogin", loginDetails);
            if (response.data.id) {
                localStorage.setItem('userId', response.data.id);
                alert('Login successful');
                window.location.href = "/";
            } else {
                alert('Invalid credentials');
            }
        } catch (err) {
            alert('Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen font-sans flex">

          
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-sky-600 to-blue-700 flex-col items-center justify-center px-12 relative overflow-hidden">

                <div className="absolute top-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>
                <div className="absolute top-1/3 right-8 w-20 h-20 bg-white opacity-10 rounded-2xl rotate-12"></div>
                <div className="absolute bottom-1/3 left-8 w-12 h-12 bg-yellow-300 opacity-20 rounded-xl rotate-45"></div>


                <div className="relative mb-8 z-10">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                        <span className="text-blue-600 font-extrabold text-3xl tracking-widest">M</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full shadow-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white opacity-60 rounded-full"></div>
                </div>

      
                <h1 className="text-white text-4xl font-extrabold tracking-tight text-center mb-3 z-10">
                    MARE Portal
                </h1>
                <p className="text-blue-100 text-sm text-center max-w-xs leading-relaxed mb-10 z-10">
                    Your professional workspace. Manage sales, staff, appointments and more.
                </p>

       
                <div className="flex flex-wrap gap-2 justify-center max-w-xs z-10">
                    {["Admin", "Sales", "HR", "Finance", "Support", "Maintenance"].map((dep) => (
                        <span key={dep} className="bg-white bg-opacity-20 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm border border-white border-opacity-20">
                            {dep}
                        </span>
                    ))}
                </div>


                <div className="absolute bottom-6 z-10 flex items-center gap-2 text-blue-200 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Authorized personnel only
                </div>
            </div>


            <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center px-8 py-16">
                <div className="w-full max-w-md">

      
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <span className="text-white font-extrabold text-2xl">M</span>
                        </div>
                        <span className="text-gray-800 font-extrabold text-2xl tracking-widest">MARE Portal</span>
                    </div>


                    <div className="mb-8">
                        <h2 className="text-gray-900 text-3xl font-extrabold">Hello</h2>
                        <p className="text-gray-500 text-sm mt-1">Sign in to access your staff dashboard</p>
                    </div>


                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                        <form onSubmit={onSubmit} className="p-8 space-y-5">


                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Staff Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
          
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                />
                            </div>


                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                  
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-16 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 flex items-center gap-1"
                                    >
                                        {showPassword ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                    
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>


                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold py-3.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-200 text-sm tracking-wide flex items-center justify-center gap-2 mt-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    <>Sign In to Portal</>
                                )}
                            </button>

                        </form>
                    </div>

        
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-gray-400 text-xs">staff only</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <p className="text-center text-gray-400 text-xs">
                        Not a staff member?{" "}
                        <a href="/login" className="text-blue-500 hover:underline font-bold">
                            Go to Customer Login →
                        </a>
                    </p>


                    <p className="text-center text-gray-300 text-xs mt-3 flex items-center justify-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Secured — MARE internal system
                    </p>

                </div>
            </div>
        </div>
    );
}

export default UserLogin;