import React, {useEffect , useState} from 'react';
import axios from "axios";


function AdminProfile() {

const [user,setUser] = useState({});
const [loading,setLoading] = useState(true);
const[error,setError]=useState(null);

const userId = localStorage.getItem("userId");
const userEmail = localStorage.getItem("userEmail");

useEffect(() => {
    const fetchData = async() =>{
        try{
            const userRes = await axios.get(`http://localhost:8080/admin/${userId}`);
            setUser (userRes.data);

            
        }
        catch(err){
            console.log("Error loading data:",err);
            setError("failed to load profile");

        }
        finally{
            setLoading(false);
        }
    };
    fetchData();

}, [userId]);
if(loading) return <p> poddk inna load wenkm...</p>;
if(error) return <p>{error}</p>;

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

      <h1> Staff Profile </h1>
      <p>Name : {user.fullname || "enter karala na"} </p>   <br/>
      <p>department : {user.department || "enter karala na"} </p>   <br/>
      <p>role : {user.role || "enter karala na"} </p>   <br/>
      <p>shift : {user.shift || "enter karala na"} </p>   <br/>

 
      <br/><br/>

      <p>phone : {user.phone || "enter karala na"} </p>   <br/>
      <p>email : {user.email || "enter karala na"} </p>   <br/>
      <p>address : {user.address || "enter karala na"} </p>   <br/>
      <p>startdate : {user.startdate || "enter karala na"} </p>   <br/>
      <p>emecontact : {user.emecontact || "enter karala na"} </p>   <br/>
      <p>remark : {user.remark || "enter karala na"} </p>   <br/>
    </div>
  )
}

export default AdminProfile