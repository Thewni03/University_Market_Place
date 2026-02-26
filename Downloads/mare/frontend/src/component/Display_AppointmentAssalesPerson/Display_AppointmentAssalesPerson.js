// Display Appointment as admin ..only admin can see this 

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav_Sales from '../Nav_Sales/Nav_Sales';



function Display_AppointmentAssalesPerson() {
    const [appointment, setAppointment] = useState([]);

    useEffect(() => {
        loadAppointment();
    }, []);


    const loadAppointment = async () => {
        const result = await axios.get("http://localhost:8080/appointment");
        setAppointment(result.data);
    }

    const UpdateNavigate = (id) => {
        window.location.href = `/salesmanUpdateAppointment/${id}`;
    }


    return (
        <div>
    

   
<Nav_Sales/>


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


                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>


        </div>
    );
}

export default Display_AppointmentAssalesPerson;
