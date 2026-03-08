import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function UserDisplay(props) {

    const navigate = useNavigate();
    const { email, password, fullname, student_id, student_id_pic, university_name,
        graduate_year, verification_status, phone, reset_token, reset_token_expires, created_at, timestamps } = props.Users

    const handleUpdate = () => {
        navigate(`/userUpdate/${email}`);
    }

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${fullname}?`)) {
            await axios.delete(`http://localhost:5000/Users/${email}`);
            alert("Student deleted successfully!");
            window.location.reload();
        }
    }

    const handleViewPic = () => {
        if (student_id_pic) {
            const filename = student_id_pic.replace("uploads/", "");
            window.open(`http://localhost:5000/uploads/${filename}`, "_blank");
        } else {
            alert("No image available");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 mb-4 border border-gray-200">

            <div className="grid grid-cols-2 gap-2 text-black">
                <p><span className="font-semibold">Email:</span> {email}</p>
                <p><span className="font-semibold">Password:</span> {password}</p>
                <p><span className="font-semibold">Full Name:</span> {fullname}</p>
                <p><span className="font-semibold">Student ID:</span> {student_id}</p>
                <p>
                    <span className="font-semibold">Student ID Pic:</span>{' '}
                    {student_id_pic ? (
                        <button
                            onClick={handleViewPic}
                            className="text-blue-500 hover:underline cursor-pointer">
                            View Image
                        </button>
                    ) : 'N/A'}
                </p>
                <p><span className="font-semibold">University:</span> {university_name}</p>
                <p><span className="font-semibold">Phone:</span> {phone}</p>
                <p><span className="font-semibold">Graduate Year:</span> {graduate_year}</p>
                <p><span className="font-semibold">Verification Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-sm font-medium ${
                        verification_status === 'verified' ? 'bg-green-100 text-green-700' :
                        verification_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                        {verification_status}
                    </span>
                </p>
                <p><span className="font-semibold">Reset Token:</span> {reset_token}</p>
                <p><span className="font-semibold">Reset Token Expires:</span> {reset_token_expires}</p>
                <p><span className="font-semibold">Created At:</span> {created_at}</p>
                <p><span className="font-semibold">Timestamps:</span> {timestamps}</p>
            </div>

            <div className="flex gap-3 mt-5">
                <button
                    onClick={handleUpdate}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg transition duration-200">
                    Update
                </button>
                <button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg transition duration-200">
                    Delete Student
                </button>
            </div>

        </div>
    )
}

export default UserDisplay