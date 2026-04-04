import React, { useEffect, useState } from "react";
import axios from "axios";
import './User_Profile.css';
import Nav_Customer from "../Nav_Customer/Nav_Customer";
import Footer from "../Footer/Footer";

function User_Profile() {
  const [user, setUser] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId"); 
  const userEmail = localStorage.getItem("userEmail"); 



  const deleteAccount = async() =>{
 
    const confirmation =
    window.confirm('Are you sure you want to delete this');
    if(confirmation){
      try{

        await axios .delete(`http://localhost:8080/user/${userId}`);

    
        alert('Account deleted successfully');

      
        localStorage.removeItem('userId');

        window.location.href = '/register';

      }
      catch(error){
    
        alert("error deleting account ");
      }
    }
    }

  const UpdateNavigate = (id) => {
    window.location.href = `/updateProfile/${id}`;
  };

  const UpdateNavigate2 = (id) => {
    window.location.href = `/updateAppointment/${id}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {

        const userRes = await axios.get(`http://localhost:8080/user/${userId}`);
        setUser(userRes.data);

//appointmentsss
        const appointmentRes = await axios.get(
          `http://localhost:8080/appointment/user/${userRes.data.email}`
        );
        setAppointments(appointmentRes.data);

      } catch (err) {
        console.log("Error loading data:", err);
        setError("Failed to load profile or appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>


<Nav_Customer/>
      
<div className="bg-black py-10 px-8 text-center">
        <span className="bg-yellow-400 text-black text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-4 inline-block">
          My Account
        </span>
        <h1 className="text-white text-4xl font-extrabold tracking-tight mt-2">User Profile</h1>
        <p className="text-gray-400 text-sm mt-2">Manage your account and appointments</p>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-10 pb-24 space-y-8">


        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-yellow-400 h-2 w-full"></div>
          <div className="p-6">

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-yellow-400 text-2xl font-extrabold">
                {user.fullname ? user.fullname.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-black text-xl font-extrabold">{user.fullname || "N/A"}</h2>
                <p className="text-gray-400 text-sm">{user.email || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Full Name</span>
                <span className="text-black font-semibold">{user.fullname || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-black font-semibold">{user.email || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone</span>
                <span className="text-black font-semibold">{user.phone || "N/A"}</span>
              </div>
            </div>


            <div className="flex gap-3 mt-6">
              <button
                onClick={() => UpdateNavigate(user.id)}
                className="flex-1 bg-black hover:bg-gray-800 text-yellow-400 font-bold py-3 rounded-xl text-sm transition-colors duration-200"
              >
                Update Profile
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 bg-gray-100 hover:bg-red-500 hover:text-white text-gray-600 font-bold py-3 rounded-xl text-sm transition-colors duration-200"
              >
                Delete Account
              </button>
            </div>

          </div>
        </div>


        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight mb-1">Your Appointments</h2>
          <div className="w-16 h-1 bg-yellow-400 rounded-full mb-6"></div>

          {appointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
              <p className="text-4xl mb-3"></p>
              <p className="font-semibold text-lg">No appointments yet</p>
              <p className="text-sm mt-1">Book a test drive or visit to get started</p>
              
             
             <a   href="/addAppointment"
                className="inline-block mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-xl text-sm transition-colors duration-200"
              >
                Book Appointment
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="bg-black h-1 w-full"></div>
                  <div className="p-5">

     
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide
                        ${a.status === 'Approved' ? 'bg-green-100 text-green-600' :
                          a.status === 'Rejected' ? 'bg-red-100 text-red-500' :
                          a.status === 'Completed' ? 'bg-blue-100 text-blue-500' :
                          a.status === 'Cancelled' ? 'bg-gray-200 text-gray-500' :
                          'bg-yellow-100 text-yellow-600'}`}>
                        {a.status}
                      </span>
                      <span className="text-gray-400 text-xs">{a.appointmentDate}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs">Purpose</p>
                        <p className="text-black font-semibold">{a.purpose}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Branch</p>
                        <p className="text-black font-semibold">{a.branch}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Vehicle</p>
                        <p className="text-black font-semibold">{a.vehicleModel || "N/A"}</p>
                      </div>
                    </div>


                    <button
                      onClick={() => UpdateNavigate2(a.id)}
                      className="mt-4 w-full bg-gray-100 hover:bg-black hover:text-yellow-400 text-gray-700 font-bold py-2 rounded-xl text-sm transition-colors duration-200"
                    >
                      Update Appointment
                    </button>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
  
<Footer/>

    </div>
  );
}

export default User_Profile;
