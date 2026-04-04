import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddVehicle() {
  const [vehicle, setVehicle] = useState({
    vehicleId: "",
    brand: "",
    model: "",
    year: "",
    price: "",
  });

  const { vehicleId, brand, model, year, price } = vehicle;


  const onInputChange = (e) => {
    setVehicle({ ...vehicle, [e.target.name]: e.target.value });
  };


  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8080/vehicle", vehicle);
      alert("Vehicle added successfully!");
      window.location.reload();
    } catch (error) {
      alert("Error saving vehicle data");
      console.error(error);
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

   
    
      <div className="form_container">
        <div className="form_sub_container">
          <form onSubmit={onSubmit}>
            <label>Vehicle ID:</label>
            <input
              type="text"
              name="vehicleId"
              value={vehicleId}
              onChange={onInputChange}
              required
            />
            <br /><br />

            <label>Brand:</label>
            <input
              type="text"
              name="brand"
              value={brand}
              onChange={onInputChange}
              required
            />
            <br /><br />

            <label>Model:</label>
            <select
              name="model"
              value={model}
              onChange={onInputChange}
              required
            >
              <option value="" disabled>
                Select Model
              </option>
              <option value="Mercedes">Mercedes-Benz</option>
              <option value="Tesla">Tesla</option>
              <option value="Jeep">Jeep</option>
              <option value="BMW">BMW</option>
            </select>
            <br /><br />

            <label>Year:</label>
            <input
              type="number"
              name="year"
              value={year}
              onChange={onInputChange}
              required
            />
            <br /><br />

            <label>Price:</label>
            <input
              type="number"
              name="price"
              value={price}
              onChange={onInputChange}
              required
            />
            <br /><br />

            <button type="submit" className="form_btn">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddVehicle;
