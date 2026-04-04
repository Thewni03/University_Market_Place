//Salesmen can see this page and he can add the selling price with tax , and commision 
//he can edit only the tax amount and commision and selling price 

//Display vehicle as admin ..only admin can see this 

import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DisplayVehicle() {
    const [vehicle, setVehicle] = useState([]);

    useEffect(() => {
        loadVehicle();
    }, []);

   
        const UpdateNavigate =(id) =>{
            window.location.href =`/updatesellvehicle/${id}`;
        }


    const loadVehicle = async () => {
        const result = await axios.get("http://localhost:8080/vehicle");
        setVehicle(result.data);
    };

    return (
        <div>
            <h1>vehicle List</h1>

            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Vehicle ID</th>
                        <th>Brand</th>
                        <th>Model</th>
                        <th>Year</th>
                        <th>Price</th>
                        <th>tax</th>
                        <th>commision</th>
                        <th>sellingPrice</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {vehicle.map((v, index) => (
                        <tr key={index}>
                            <td>{v.vehicleId}</td>
                            <td>{v.brand}</td>
                            <td>{v.model}</td>
                            <td>{v.year}</td>
                            <td>{v.price}</td>
                            <td>{v.tax}</td>
                            <td>{v.commision}</td>
                            <td>{v.sellingPrice}</td>
                            <td>

                                <button onClick={() => UpdateNavigate(v.id)}>Update</button>
                               
                            </td>
                        
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DisplayVehicle;
