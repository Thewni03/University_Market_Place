import React, { useState } from 'react';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const loginDetails = { email, password };
        try {
            const response = await axios.post("http://localhost:8080/user/login", loginDetails);
            if (response.data.id) {
                localStorage.setItem('userId', response.data.id);
                alert('Login successful');
                window.location.href = "/userProfile";
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
        <div className="min-h-screen bg-gray-950 font-sans">


            <nav className="bg-black px-8 py-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
                <span className="text-yellow-400 font-extrabold text-2xl tracking-widest uppercase">MARE</span>
                <ul className="flex gap-8 items-center">
                    <li><a href="/customerhome" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 tracking-wide">Home</a></li>
                    <li><a href="/theshop" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 tracking-wide">Explore Vehicles</a></li>
                    <li><a href="/contact" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 tracking-wide">Contact</a></li>
                    <li><a href="/register" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm px-5 py-2 rounded-lg transition-colors duration-200">Sign Up</a></li>
                </ul>
            </nav>

    
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-10">
                <div className="w-full max-w-md">

               
                    <div className="relative h-28 mb-2 overflow-hidden">

                        {/* Road */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-800 rounded-xl overflow-hidden">
                      
                            <div className="absolute top-1/2 -translate-y-1/2 flex gap-4 animate-road">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-8 h-1 bg-yellow-400 rounded-full opacity-60 flex-shrink-0"></div>
                                ))}
                            </div>
                        </div>

                        {/* Car */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-car-bounce">

                            <svg width="90" height="45" viewBox="0 0 90 45" fill="none" xmlns="http://www.w3.org/2000/svg">
            
                                <rect x="5" y="20" width="80" height="20" rx="5" fill="#1f2937"/>
               
                                <path d="M20 20 L28 8 L62 8 L70 20 Z" fill="#374151"/>
             
                                <path d="M30 19 L35 10 L50 10 L50 19 Z" fill="#FCD34D" opacity="0.8"/>
                                <path d="M52 19 L52 10 L62 10 L60 19 Z" fill="#FCD34D" opacity="0.8"/>
                
                                <ellipse cx="80" cy="28" rx="5" ry="4" fill="#FCD34D"/>
                                <ellipse cx="80" cy="28" rx="3" ry="2.5" fill="#FEF3C7"/>
               
                                <ellipse cx="10" cy="28" rx="4" ry="3" fill="#EF4444" opacity="0.8"/>
             
                                <circle cx="22" cy="40" r="6" fill="#111827"/>
                                <circle cx="22" cy="40" r="3" fill="#FCD34D"/>
                                <circle cx="68" cy="40" r="6" fill="#111827"/>
                                <circle cx="68" cy="40" r="3" fill="#FCD34D"/>
               
                                <text x="35" y="32" fontSize="7" fill="#FCD34D" fontWeight="bold" fontFamily="sans-serif">MARE</text>
                            </svg>
                        </div>


                        <div className="absolute bottom-10 left-4 flex flex-col gap-1 animate-pulse">
                            <div className="w-6 h-0.5 bg-yellow-400 opacity-40 rounded-full"></div>
                            <div className="w-4 h-0.5 bg-yellow-400 opacity-30 rounded-full"></div>
                            <div className="w-5 h-0.5 bg-yellow-400 opacity-20 rounded-full"></div>
                        </div>

               
                        <div className="absolute top-2 left-8 text-yellow-400 text-xs animate-pulse">✦</div>
                        <div className="absolute top-4 right-10 text-yellow-400 text-xs animate-ping" style={{animationDuration:'2s'}}>✦</div>
                        <div className="absolute top-1 right-24 text-yellow-300 text-xs animate-pulse" style={{animationDelay:'0.5s'}}>✦</div>
                    </div>

            
                    <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">

          
                        <div className="bg-yellow-400 h-1.5 w-full"></div>

                        <div className="p-8">

              
                            <div className="text-center mb-7">
                                <span className="text-yellow-400 font-extrabold text-3xl tracking-widest">MARE</span>
                                <h2 className="text-white text-xl font-bold mt-1">Welcome Back</h2>
                                <p className="text-gray-500 text-xs mt-1">Login to your account to continue</p>
                            </div>

                            <form onSubmit={onSubmit} className="space-y-5">

                        
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
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
                                            placeholder="••••••••"
                                            required
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-16 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 flex items-center gap-1"
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
                                    className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-black font-extrabold py-3.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg text-sm tracking-wide mt-2 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                            </svg>
                                            Starting engine...
                                        </>
                                    ) : (
                                        <>Let's Drive!</>
                                    )}
                                </button>

                            </form>

                          
                            <p className="text-center text-gray-500 text-xs mt-6">
                                Don't have an account?{" "}
                                <a href="/register" className="text-yellow-400 hover:underline font-bold">
                                    Sign Up here
                                </a>
                            </p>

                        </div>
                    </div>

                </div>
            </div>

 
            <style>{`
                @keyframes road {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-80px); }
                }
                @keyframes carBounce {
                    0%, 100% { transform: translateX(-50%) translateY(0px); }
                    50% { transform: translateX(-50%) translateY(-3px); }
                }
                .animate-road {
                    animation: road 0.6s linear infinite;
                }
                .animate-car-bounce {
                    animation: carBounce 0.8s ease-in-out infinite;
                }
            `}</style>

        </div>
    );
}

export default Login;