import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const url = "http://localhost:5000/Users";

function UserUpdate() {

    const { email } = useParams();
    const navigate = useNavigate();

    const [inputs, setInputs] = useState({
        fullname: "",
        phone: "",
        university_name: "",
        graduate_year: "",
        verification_status: "pending",
    })

    useEffect(() => {
        axios.get(`${url}/${email}`).then((res) => {
            const data = res.data;
            setInputs({
                fullname: data.fullname,
                phone: data.phone,
                university_name: data.university_name,
                graduate_year: data.graduate_year,
                verification_status: data.verification_status,
            });
        });
    }, [email])

    const handleChange = (e) => {
        setInputs((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.put(`${url}/${email}`, {
            verification_status: inputs.verification_status,
       
            // 🔒 other fields disabled for now — uncomment to activate:
            // fullname: inputs.fullname,
            // phone: inputs.phone,
            university_name: inputs.university_name,
            // graduate_year: inputs.graduate_year,
        });
        alert("Student updated successfully!");
        navigate('/userManagement');
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
            <div className="w-full max-w-3xl">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-cyan-500 font-semibold tracking-widest text-sm uppercase mb-1">University Marketplace</p>
                    <h1 className="text-4xl font-black text-purple-950">Update Student</h1>
                    <div className="h-1 w-16 bg-cyan-500 mt-3 rounded-full"></div>
                    <p className="text-gray-400 text-sm mt-2">Editing: <span className="text-purple-950 font-semibold">{email}</span></p>
                </div>

                {/* Table card */}
                <div className="border-l-4 border-purple-950 bg-white shadow-xl rounded-2xl overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-purple-950 text-white uppercase tracking-widest text-xs">
                                    <th className="py-4 px-6 text-left w-1/3">Field</th>
                                    <th className="py-4 px-6 text-left">Value</th>
                                    <th className="py-4 px-6 text-center w-1/4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">

                                {/* Verification Status - ACTIVE */}
                                <tr className="bg-cyan-50">
                                    <td className="py-4 px-6 font-bold text-purple-950 uppercase tracking-wider text-xs">
                                        Verification Status
                                        <span className="ml-2 bg-cyan-500 text-white text-xs px-2 py-0.5 rounded-full">Active</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <select
                                            name="verification_status"
                                            value={inputs.verification_status}
                                            onChange={handleChange}
                                            className="border-b-2 border-purple-200 focus:border-cyan-500 outline-none px-2 py-1 text-black transition-all duration-200 bg-transparent w-full"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="verified">Verified</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            inputs.verification_status === 'verified' ? 'bg-green-100 text-green-700' :
                                            inputs.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            inputs.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-500'
                                        }`}>
                                            {inputs.verification_status}
                                        </span>
                                    </td>
                                </tr>

                                {/* Full Name - DISABLED */}
                                <tr className="opacity-40">
                                    <td className="py-4 px-6 font-bold text-purple-950 uppercase tracking-wider text-xs">
                                        Full Name
                                        <span className="ml-2 bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">Disabled</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <input
                                            type="text" name="fullname" value={inputs.fullname}
                                            onChange={handleChange} disabled
                                            className="border-b-2 border-gray-200 outline-none px-2 py-1 text-black bg-transparent w-full cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className="bg-gray-100 text-gray-400 text-xs px-3 py-1 rounded-full">locked</span>
                                    </td>
                                </tr>

                                {/* Phone - DISABLED */}
                                <tr className="opacity-40">
                                    <td className="py-4 px-6 font-bold text-purple-950 uppercase tracking-wider text-xs">
                                        Phone
                                        <span className="ml-2 bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">Disabled</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <input
                                            type="text" name="phone" value={inputs.phone}
                                            onChange={handleChange} disabled
                                            className="border-b-2 border-gray-200 outline-none px-2 py-1 text-black bg-transparent w-full cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className="bg-gray-100 text-gray-400 text-xs px-3 py-1 rounded-full">locked</span>
                                    </td>
                                </tr>

                                {/* University - DISABLED */}
                                <tr className="opacity-40">
                                    <td className="py-4 px-6 font-bold text-purple-950 uppercase tracking-wider text-xs">
                                        University
                                        <span className="ml-2 bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">Disabled</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <input
                                            type="text" name="university_name" value={inputs.university_name}
                                            onChange={handleChange} 
                                            className="border-b-2 border-gray-200 outline-none px-2 py-1 text-black bg-transparent w-full cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className="bg-gray-100 text-gray-400 text-xs px-3 py-1 rounded-full">Active</span>
                                    </td>
                                </tr>

                                {/* Graduate Year - DISABLED */}
                                <tr className="opacity-40">
                                    <td className="py-4 px-6 font-bold text-purple-950 uppercase tracking-wider text-xs">
                                        Graduate Year
                                        <span className="ml-2 bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">Disabled</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <input
                                            type="number" name="graduate_year" value={inputs.graduate_year}
                                            onChange={handleChange} disabled
                                            className="border-b-2 border-gray-200 outline-none px-2 py-1 text-black bg-transparent w-full cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className="bg-gray-100 text-gray-400 text-xs px-3 py-1 rounded-full">locked</span>
                                    </td>
                                </tr>

                            </tbody>
                        </table>

                        {/* Buttons */}
                        <div className="flex gap-4 p-6 bg-gray-50 border-t border-gray-100">
                            <button
                                type="submit"
                                className="bg-purple-950 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-xl tracking-widest uppercase text-sm transition-all duration-300"
                            >
                                Save Changes →
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/userManagement')}
                                className="bg-white hover:bg-gray-100 text-purple-950 font-bold py-3 px-8 rounded-xl tracking-widest uppercase text-sm border-2 border-purple-950 transition-all duration-300"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default UserUpdate