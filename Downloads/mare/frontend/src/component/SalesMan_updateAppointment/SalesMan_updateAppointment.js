import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Nav_Sales from "../Nav_Sales/Nav_Sales";


function SalesMan_updateAppointment() {



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

<Nav_Sales/>

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

export default SalesMan_updateAppointment;
