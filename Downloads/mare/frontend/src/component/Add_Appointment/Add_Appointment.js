import React, { useState } from "react";
import axios from "axios";
import Nav_Customer from "../Nav_Customer/Nav_Customer";
import Footer from "../Footer/Footer";
import PageWrapper from "../PageWrapper/PageWrapper";

function Add_Appointment() {

  const [appointment, setAppointment] = useState({
    name: "",
    phone: "",
    email: "",
    branch: "",
    appointmentDate: "",
    purpose: "",
    vehicleId: "",
    vehicleModel: "",
    note: "",
    status: "Pending",
  });

  const { name, phone, email, branch, appointmentDate, purpose, vehicleId, vehicleModel, note, status } = appointment;

  const onInputChange = (e) => {
    setAppointment({ ...appointment, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/appointment", {
        ...appointment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      alert("Appointment added successfully!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Error saving appointment");
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white transition";
  const labelClass = "block text-sm font-semibold text-gray-600 mb-1";

  return (
    <PageWrapper>
    <div className="min-h-screen font-sans">

      <Nav_Customer />


      <div
        className="relative min-h-screen flex items-center justify-center px-4 py-16"
        style={{
          backgroundImage: "url('/automart c.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="relative z-10 w-full max-w-2xl">


          <div className="text-center mb-6">
            <span className="bg-yellow-400 text-black text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full inline-block mb-3">
              Book Your Visit
            </span>
            <h1 className="text-white text-4xl font-extrabold tracking-tight">Book an Appointment</h1>
            <p className="text-gray-300 text-sm mt-2">Fill in your details and we'll confirm your slot shortly</p>
          </div>


          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-yellow-400 h-2 w-full"></div>

            <form onSubmit={onSubmit} className="p-8 space-y-5">

              <div>
                <label className={labelClass}>Full Name</label>
                <input type="text" name="name" value={name} onChange={onInputChange} required placeholder="sanduni" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input type="text" name="phone" value={phone} onChange={onInputChange} required placeholder="077 123 4567" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="text" name="email" value={email} onChange={onInputChange} required placeholder="sandunisaduni@gmail.com" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nearest Branch</label>
                  <select name="branch" value={branch} onChange={onInputChange} required className={inputClass}>
                    <option value="">Select branch</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Negambo">Negambo</option>
                    <option value="Galle">Galle</option>
                    <option value="Batticaloa">Batticaloa</option>
                    <option value="Jaffna">Jaffna</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Appointment Date</label>
                  <input type="date" name="appointmentDate" value={appointmentDate} onChange={onInputChange} required className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Purpose</label>
                <select name="purpose" value={purpose} onChange={onInputChange} required className={inputClass}>
                  <option value="">Select Purpose</option>
                  <option value="Test Drive">Test Drive</option>
                  <option value="Vehicle Inspection">Vehicle Inspection</option>
                  <option value="Finance Discussion">Finance Discussion</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Vehicle ID <span className="text-gray-400 font-normal"></span></label>
                  <input type="text" name="vehicleId" value={vehicleId} onChange={onInputChange} placeholder="V001" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Vehicle Model <span className="text-gray-400 font-normal"></span></label>
                  <input type="text" name="vehicleModel" value={vehicleModel} onChange={onInputChange} placeholder="Tesla Model 3" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Additional Note</label>
                <textarea
                  name="note"
                  value={note}
                  onChange={onInputChange}
                  rows={3}
                  placeholder="Any special requests or information..."
                  className={inputClass}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-md text-sm tracking-wide"
              >
                Submit Appointment
              </button>

            </form>
          </div>
        </div>
      </div>
      </div>
      <Footer />
 
    </PageWrapper>
  );
}

export default Add_Appointment;