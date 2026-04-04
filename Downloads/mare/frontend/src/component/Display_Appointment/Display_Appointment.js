// Display Appointment as admin ..only admin can see this 

import React, { useEffect, useState } from 'react';
import axios from 'axios';



function Display_Appointment() {
    const [appointment, setAppointment] = useState([]);

    useEffect(() => {
        loadAppointment();
    }, []);


    const loadAppointment = async () => {
        const result = await axios.get("http://localhost:8080/appointment");
        setAppointment(result.data);
    }

    const UpdateNavigate = (id) => {
        window.location.href = `/staffUpdateAppointment/${id}`;
    }


    const deleteAppointment = async (id) => {
        const confirmationMessage = window.confirm(
            "Are you sure you want to delete this?"
        );

        if (confirmationMessage) {
            try {
                await axios.delete(`http://localhost:8080/appointment/${id}`);

     
                loadAppointment();

                alert("Appointment deleted successfully!");
            } catch (error) {
                alert("ERROR deleting appointment!");
                console.error(error);
            }
        }
    }

    return (
        <div>
    

   
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


      <h1>Available Appointment</h1>

            <table border="1" cellPadding="10" margin-left="40%">
                <thead>
                    <tr>
                        <th>name</th>
                        <th>phone</th>
                        <th>email</th>
                        <th>branch</th>
                        <th>appointmentDate</th>
                        <th>purpose</th>
                        <th>vehicleId</th>
                        <th>vehicleModel</th>
                        <th>status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {appointment.map((a) => (
                        <tr key={a.id}>
                            <td>{a.name}</td>
                            <td>{a.phone}</td>
                            <td>{a.email}</td>
                            <td>{a.branch}</td>
                            <td>{a.appointmentDate}</td>
                            <td>{a.purpose}</td>
                            <td>{a.vehicleId}</td>
                            <td>{a.vehicleModel}</td>
                            <td>{a.note}</td>
                            <td>{a.status}</td>
    
                            <td>
                                <button onClick={() => UpdateNavigate(a.id)}>Update</button>


                                <button onClick={() => deleteAppointment(a.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Display_Appointment;
