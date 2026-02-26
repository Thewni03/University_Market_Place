import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";


function Staff_updateAppointment() {


    const { id } = useParams(); 
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        branch: "",
        appointmentDate: "",
        purpose: "",
        vehicleId: "",
        vehicleModel: "",
        status: ""
      });


  const [loading, setLoading] = useState(true);


  useEffect(() => {
    axios
      .get(`http://localhost:8080/appointment/${id}`)
      .then((res) => {
        setFormData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading appointment:", err);
        setLoading(false);
      });
  }, [id]);


  if (loading) return <p>Appointments load wenawaaaaaa...</p>;


  const onInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:8080/appointment/${id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Appointment status updated!");
      navigate("/displayAppointment");
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
      <form onSubmit={onSubmit}>


    <label>status:</label><br/>
    <select name="status" value={formData.status} onChange={onInputChange}>
              <option value="" disabled>
             change the status
              </option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="No-Show">No-Show</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <br/><br/>
    <button type="submit">Update</button>
  </form>
  </div>


  )
}

export default Staff_updateAppointment;




