import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function UpdateVehicle() {
  const { id } = useParams(); // database ID
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

  const onInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:8080/vehicle/${id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Vehicle updated!");
      navigate("/showVehicle");
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
      <br/>
      <form onSubmit={onSubmit}>
        <label>Brand:</label><br/>
        <input name="brand" value={formData.brand} onChange={onInputChange} />
<br/><br/>
        <label>Model:</label><br/>
        <input name="model" value={formData.model} onChange={onInputChange} />
<br/><br/>
        <label>Year:</label><br/>
        <input name="year" value={formData.year} onChange={onInputChange} />
<br/><br/>
        <label>Price:</label><br/>
        <input name="price" value={formData.price} onChange={onInputChange} />
        <br/><br/>
        <button type="submit">Update</button>
      </form>
    </div>
  );
}

export default UpdateVehicle;
