import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const url = "http://localhost:5000/Users";

function Register() {

    const navigate = useNavigate();
    const [inputs, setInputs] = useState({
        email: "",
        password: "",
        fullname: "",
        student_id: "",
        student_id_pic: "",
        university_name: "",
        phone: "",
        graduate_year: "",
    })

    const handleChange = (e) => {
        setInputs((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleFileChange = (e) => {
        setInputs((prev) => ({
            ...prev,
            student_id_pic: e.target.files[0]
        }))
    }

    const sendRequest = async () => {
        const formData = new FormData();
        formData.append('email', inputs.email);
        formData.append('password', inputs.password);
        formData.append('fullname', inputs.fullname);
        formData.append('student_id', inputs.student_id);
        formData.append('student_id_pic', inputs.student_id_pic);
        formData.append('university_name', inputs.university_name);
        formData.append('graduate_year', inputs.graduate_year);
        formData.append('phone', inputs.phone);

        await axios.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await sendRequest();
        alert("Registration successful! Please wait for verification.");
        navigate('/');
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">

                {/* Header */}
                <div className="mb-8 text-center">
                    <p className="text-cyan-500 font-semibold tracking-widest text-sm uppercase mb-1">University Marketplace</p>
                    <h1 className="text-4xl font-black text-purple-950">Create Account</h1>
                    <div className="h-1 w-16 bg-cyan-500 mt-3 rounded-full mx-auto"></div>
                    <p className="text-gray-400 text-sm mt-3">Register with your university credentials to get started</p>
                </div>

            
                <div className="border-l-4 border-purple-950 bg-white shadow-xl rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">


                        <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Email</label>
                            <input
                                type="email" name="email" placeholder="student@university.edu"
                                onChange={handleChange} required
                                className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200"
                            />
                        </div>

                        <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Password</label>
                            <input
                                type="password" name="password" placeholder="••••••••"
                                onChange={handleChange} required
                                className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200"
                            />
                        </div>

                     
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text" name="fullname" placeholder="Dulaj Sanmitha"
                                onChange={handleChange} required
                                className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200"
                            />
                        </div>


                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Student ID</label>
                            <input
                                type="text" name="student_id" placeholder="IT22XXXXX"
                                onChange={handleChange} required
                                className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200"
                            />
                        </div>

                 
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">University</label>
                            <input
                                type="text" name="university_name" placeholder="University of Kelaniya"
                                onChange={handleChange} required
                                className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200"
                            />
                        </div>

          
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Phone</label>
                            <input
                                type="text" name="phone" placeholder="077XXXXX"
                                onChange={handleChange} required
                                className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200"
                            />
                        </div>

                        <div className="col-span-2 flex flex-col gap-1">
  <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">
    Graduate Year
  </label>

  <input
    type="number"
    name="graduate_year"
    placeholder="2026"
    min="2026"
    max="2034"
    onChange={handleChange}
    required
    className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200"
  />
</div>

                    
                        <div className="col-span-2 flex flex-col gap-2">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Student ID Picture</label>
                            <div className="border-2 border-dashed border-purple-200 hover:border-cyan-500 rounded-xl px-4 py-4 transition-all duration-200">
                                <input
                                    type="file" name="student_id_pic" accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange} required
                                    className="text-black text-sm w-full"
                                />
                                <p className="text-gray-400 text-xs mt-1">Accepts jpg, jpeg, png, pdf</p>
                            </div>
                        </div>

                 
                        <div className="col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-purple-950 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl tracking-widest uppercase text-sm transition-all duration-300"
                            >
                                Register Now →
                            </button>
                        </div>

             
                        <div className="col-span-2 text-center">
                            <p className="text-gray-400 text-sm">Already have an account?
                                <span
                                    onClick={() => navigate('/login')}
                                    className="text-cyan-500 font-bold ml-1 cursor-pointer hover:text-purple-950 transition-all duration-200"
                                >
                                    Login here
                                </span>
                            </p>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    )
}

export default Register