import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import Nav_Customer from "../Nav_Customer/Nav_Customer";
import Footer from "../Footer/Footer";

function Update_Profile() {

    const { id } = useParams();
    const [formData, setformData] = useState({
        fullname: '',
        email: '',
        password: '',
        phone: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/user/${id}`);
                const itemData = response.data;
                setformData({
                    fullname: itemData.fullname || '',
                    email: itemData.email || '',
                    password: itemData.password || '',
                    phone: itemData.phone || ''
                });
            } catch (error) {
                console.error(`Error fetching data:`, error);
            }
        };
        fetchData();
    }, [id]);

    const onInputChange = (e) => {
        const { name, value } = e.target;
        setformData({ ...formData, [name]: value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8080/user/${id}`, formData);
            alert("Profile updated successfully!");
            navigate("/userProfile");
        } catch (error) {
            alert('Error updating data:', error);
        }
    };

    const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition";

    return (
        <div className="min-h-screen font-sans">

            <Nav_Customer />

     
            <div
                className="relative min-h-screen flex items-center justify-center px-4 py-16"
                style={{
                    backgroundImage: "url('/automart c.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "fixed",
                }}
            >
  
                <div className="absolute inset-0 bg-black bg-opacity-75"></div>

   
                <div className="relative z-10 w-full max-w-lg">

    
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-black text-4xl font-extrabold shadow-xl mb-3">
                            {formData.fullname ? formData.fullname.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span className="bg-yellow-400 text-black text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                            Edit Profile
                        </span>
                        <h1 className="text-white text-3xl font-extrabold mt-3 tracking-tight">Update Your Profile</h1>
                        <p className="text-gray-400 text-sm mt-1">Keep your information up to date</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="h-2 w-full bg-yellow-400"></div>

                        <form onSubmit={onSubmit} className="p-8 space-y-5">

               
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={onInputChange}
                                    placeholder="sanduni"
                                    className={inputClass}
                                />
                            </div>

                 
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={onInputChange}
                                
                                    className={inputClass}
                                />
                            </div>

                       
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={onInputChange}
                                  
                                    className={inputClass}
                                />
                            </div>

    
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={onInputChange}
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-16 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                                    />

                            
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 shadow-sm"
                                    >
                                        {showPassword ? (
                                            <>
                                         
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                          
                                            </>
                                        ) : (
                                            <>
                                                {/* Eye Open SVG */}
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            
                                            </>
                                        )}
                                    </button>
                                </div>

               
                                {formData.password && (
                                    <div className="mt-2 flex gap-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                    formData.password.length >= i * 3
                                                        ? formData.password.length >= 10
                                                            ? "bg-green-400"
                                                            : formData.password.length >= 6
                                                            ? "bg-yellow-400"
                                                            : "bg-red-400"
                                                        : "bg-gray-200"
                                                }`}
                                            />
                                        ))}
                                        <span className="text-xs text-gray-400 ml-2">
                                            {formData.password.length >= 10
                                                ? "Strong "
                                                : formData.password.length >= 6
                                                ? "Medium "
                                                : "Weak "}
                                        </span>
                                    </div>
                                )}
                            </div>


                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => navigate("/userProfile")}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold py-3 rounded-xl text-sm transition-all duration-200 hover:scale-105 shadow-md"
                                >
                                    Save Changes
                                </button>
                            </div>

                        </form>
                    </div>

                    <p className="text-center text-gray-400 text-xs mt-4">
                        Changed your mind?{" "}
                        <a href="/userProfile" className="text-yellow-400 hover:underline font-semibold">
                            Go back to profile
                        </a>
                    </p>

                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Update_Profile;