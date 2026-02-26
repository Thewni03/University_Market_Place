// Display vehicle as admin ..only admin can see this 

import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useNavigate } from "react-router-dom";

function DisplayVehicle() {
    const [vehicle, setVehicle] = useState([]);

    useEffect(() => {
        loadVehicle();
    }, []);


    const loadVehicle = async () => {
        const result = await axios.get("http://localhost:8080/vehicle");
        setVehicle(result.data);
    }
    const navigate = useNavigate();

    const UpdateNavigate = (id) => {
        window.location.href = `/updatebyadmin/${id}`;
    }


    const deleteVehicle = async (id) => {
        const confirmationMessage = window.confirm(
            "Are you sure you want to delete this?"
        );

        if (confirmationMessage) {
            try {
                await axios.delete(`http://localhost:8080/vehicle/${id}`);

       
                loadVehicle();

                alert("Vehicle deleted successfully!");
            } catch (error) {
                alert("ERROR deleting vehicle!");
                console.error(error);
            }
        }
    }

    return (
        <div >
  
  <nav className="bg-black px-8 py-4 flex items-center justify-between shadow-lg">
  <span className="text-yellow-400 font-bold text-xl tracking-widest uppercase">This is Admin</span>
  <ul className="flex gap-6">
  <li><a href="/showVehicle" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200"
  >Vehicles</a></li>
      <li>  <a href="/displayrecords" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Sales</a></li>
      <li><a href="/displayAppointment"className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Appointments</a></li>
      <li><a href="/showstaff" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">User Management</a></li>
      <li><a href="/notes" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Notes</a></li>
      <li><a href="/adminProfile" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Profile</a></li>
      <li><a href="/logout" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Logout</a></li>
      </ul>
      </nav>

      <div className="bg-gray-100 border-b border-gray-200 px-8 py-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-black tracking-tight">Available Vehicles</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your vehicle inventory</p>
                </div>
                <button
                    onClick={() => navigate("/AddVehical")}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-lg shadow transition-colors duration-200 flex items-center gap-2"
                >
                    + Add New Vehicle
                </button>
            </div>
            {/* Cards Grid */}
            <div className="px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vehicle.map((v) => (
                    <div
                        key={v.id}
                        className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                    >
                        {/* Card Top Accent */}
                        <div className="bg-black h-2 w-full"></div>

                        {/* Card Body */}
                        <div className="p-5">
                            {/* Vehicle ID Badge */}
                            <span className="inline-block bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full mb-3">
                                ID: {v.vehicleId}
                            </span>

                            {/* Brand & Model */}
                            <h2 className="text-black text-xl font-bold">{v.brand}</h2>
                            <p className="text-gray-500 text-sm font-medium mb-4">{v.model}</p>

                            {/* Details */}
                            <div className="flex justify-between text-sm text-gray-600 border-t border-gray-100 pt-3 mb-4">
                                <div className="text-center">
                                    <p className="text-gray-400 text-xs uppercase tracking-wide">Year</p>
                                    <p className="text-black font-semibold">{v.year}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-xs uppercase tracking-wide">Price</p>
                                    <p className="text-black font-bold text-base">${v.price}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => UpdateNavigate(v.id)}
                                    className="flex-1 bg-black hover:bg-gray-800 text-yellow-400 font-semibold text-sm py-2 rounded-lg transition-colors duration-200"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => deleteVehicle(v.id)}
                                    className="flex-1 bg-gray-100 hover:bg-red-500 hover:text-white text-black font-semibold text-sm py-2 rounded-lg transition-colors duration-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DisplayVehicle;
