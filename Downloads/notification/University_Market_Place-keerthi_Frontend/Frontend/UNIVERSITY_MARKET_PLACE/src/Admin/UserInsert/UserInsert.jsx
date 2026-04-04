import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const url = "http://localhost:5000/Users";

function UserInsert() {

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
        verification_status: "pending",
        reset_token: "",
        reset_token_expires: "",
        created_at: "",
    })

    const handleChange = (e) => {
        setInputs((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(inputs);
        await sendRequest();
        navigate('/userManagement');
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
        formData.append('verification_status', inputs.verification_status);
        formData.append('phone', inputs.phone);

        await axios.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    }

    const handleFileChange = (e) => {
        setInputs((prev) => ({
            ...prev,
            student_id_pic: e.target.files[0]
        }))
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8">

            {/* Left accent bar + card layout */}
            <div className="w-full max-w-2xl">

                {/* Header section */}
                <div className="mb-8">
                    <p className="text-cyan-500 font-semibold tracking-widest text-sm uppercase mb-1">University Marketplace</p>
                    <h1 className="text-4xl font-black text-purple-950">Add New Student</h1>
                    <div className="h-1 w-16 bg-cyan-500 mt-3 rounded-full"></div>
                </div>

                {/* Form card with left purple border */}
                <div className="border-l-4 border-purple-950 bg-white shadow-xl rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">

                        {/* Full width fields */}
                        <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Email</label>
                            <input
                                type="email" name="email" placeholder="student@university.edu" onChange={handleChange}
                                className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200"
                            />
                        </div>

                        <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Password</label>
                            <input
                                type="password" name="password" placeholder="••••••••" onChange={handleChange}
                                className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200"
                            />
                        </div>

                        {/* Two column fields */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text" name="fullname" placeholder="John Doe" onChange={handleChange}
                                className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Student ID</label>
                            <input
                                type="text" name="student_id" placeholder="IT23175402" onChange={handleChange}
                                className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">University</label>
                            <input
                                type="text" name="university_name" placeholder="SLIIT" onChange={handleChange}
                                className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Phone</label>
                            <input
                                type="text" name="phone" placeholder="0771234567" onChange={handleChange}
                                className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Graduate Year</label>
                            <input
                                type="number" name="graduate_year" placeholder="2026" onChange={handleChange}
                                className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black placeholder-gray-400 transition-all duration-200"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Verification Status</label>
                            <select
                                name="verification_status" onChange={handleChange}
                                className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-2 text-black transition-all duration-200"
                            >
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>

                        {/* File upload full width */}
                        <div className="col-span-2 flex flex-col gap-2">
                            <label className="text-xs font-bold text-purple-950 uppercase tracking-wider">Student ID Picture</label>
                            <div className="border-2 border-dashed border-purple-200 hover:border-cyan-500 rounded-xl px-4 py-4 transition-all duration-200 cursor-pointer">
                                <input
                                    type="file" name="student_id_pic" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange}
                                    className="text-black text-sm w-full"
                                />
                                <p className="text-gray-400 text-xs mt-1">Accepts jpg, jpeg, png, pdf</p>
                            </div>
                        </div>

                        {/* Submit button */}
                        <div className="col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-purple-950 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl tracking-widest uppercase text-sm transition-all duration-300"
                            >
                                Add Student →
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default UserInsert