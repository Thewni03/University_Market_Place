// He cannot delete, he cannot edit everything except tax% and commission%
// Selling price = price + taxAmount + commissionAmount
// taxAmount = (price * tax%) / 100
// commissionAmount = (price * commission%) / 100

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function UpdateVehicle() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vehicleId: "",
    brand: "",
    model: "",
    year: "",
    price: "",
    tax: "",            
    commision: "",      
    sellingPrice: "",   
  });

  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    axios
      .get(`http://localhost:8080/vehicle/${id}`)
      .then((res) => {
        setFormData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading vehicle:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;

  // Update fields + recalculate the selling price
  const onInputChange = (e) => {
    const { name, value } = e.target;

    let updated = { ...formData, [name]: value };

    // Auto-calculate selling price when tax% or commission% changes
    const price = parseFloat(updated.price || 0);
    const taxPercentage = parseFloat(updated.tax || 0);
    const commissionPercentage = parseFloat(updated.commision || 0);

    // Formula
    const taxAmount = (price * taxPercentage) / 100;
    const commissionAmount = (price * commissionPercentage) / 100;
    const sellingPrice = price + taxAmount + commissionAmount;

    updated.sellingPrice = sellingPrice.toFixed(2); // 2 decimal places

    setFormData(updated);
  };


  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:8080/vehicle/${id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Vehicle updated!");
      navigate("/vehiclelist");
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed");
    }
  };

  return (
    <div>
        <nav className="bg-black px-8 py-4 flex items-center justify-between shadow-lg">
  <span className="text-yellow-400 font-bold text-xl tracking-widest uppercase">This is Admin</span>
  <ul className="flex gap-6">
  <li><a href="/showVehicle" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200"
  >Vehicles</a></li>
        <li>  <a href="/" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Home</a></li>
      <li>  <a href="/displayrecords" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Sales</a></li>
      <li><a href="/displayAppointment"className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Appointments</a></li>
      <li><a href="/showstaff" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">User Management</a></li>
      <li><a href="/notes" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Notes</a></li>
      <li><a href="/adminProfile" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Profile</a></li>
      <li><a href="/logout" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Logout</a></li>
      </ul>
      </nav>

      <h1>Update Vehicle</h1>

      <form onSubmit={onSubmit}>
        

        <label>Brand:</label>
        <input name="brand" value={formData.brand} disabled />
<br></br>
        <label>Model:</label>
        <input name="model" value={formData.model} disabled />
        <br></br>
        <label>Year:</label>
        <input name="year" value={formData.year} disabled />
        <br></br>
        <label>Price (Rs):</label>
        <input name="price" value={formData.price} disabled />

        <br></br>
        <label>Tax Percentage (%):</label>
        <input
          name="tax"
          value={formData.tax}
          onChange={onInputChange}
          type="number"
        />
        <br></br>

        <label>Commission Percentage (%):</label>
        <input
          name="commision"
          value={formData.commision}
          onChange={onInputChange}
          type="number"
        />
        <br></br>


        <label>Selling Price (Rs):</label>
        <input name="sellingPrice" value={formData.sellingPrice} disabled />
        <br></br><br></br>
        <button type="submit">Update</button>
      </form>
    </div>
  );
}

export default UpdateVehicle;
