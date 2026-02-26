import React , {useEffect , useState}from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


function Show_staff() {

const [admin ,setStaff] = useState([]);

useEffect(()=>{
    loadStaff();

},[]);

const loadStaff = async() => {
    const result = await axios.get("http://localhost:8080/admin");
    setStaff(result.data);

}


    const navigate = useNavigate();

const UpdateNavigate = (id) =>{

    window.location.href =`/updatestaffbyadmin/${id}`;
}

const deleteStaff = async(id) =>{
    const confirmationMessage = window.confirm("sure da delete karanawa kiyala ?");

    if(confirmationMessage){
   try{
    await axios.delete(`http://localhost:8080/admin/${id}`);
    loadStaff();
    alert("staff member has deleted successfully!!!!");

   }
   catch(err){
    alert("Error detecting staff!");
    console.error(err);
   }
    }
}



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
      <h1>Staff table</h1>

      <button onClick={() => navigate("/addnewuser")}>add new member </button>
      <table>
        <thead>
            <tr>
                <th>fullname</th>
                <th>email</th>
                <th>password</th>
                <th>phone</th>
                <th>role</th>
                <th>department</th>
                <th>startdate</th>
                <th>shift</th>
                <th>address</th>
                <th>emecontact</th>
                <th>remark</th>

                <th>update Details</th>
                <th>Delete staff</th>
            </tr>
        </thead>

        <body>
            {admin.map((a)=> (
                <tr key ={a.id}>
                    <td>{a.fullname}</td>
                    <td>{a.email}</td>
                    <td>{a.password}</td>
                    <td>{a.phone}</td>
                    <td>{a.role}</td>
                    <td>{a.department}</td>
                    <td>{a.startdate}</td>
                    <td>{a.shift}</td>
                    <td>{a.address}</td>
                    <td>{a.emecontact}</td>
                     <td>{a.remark}</td>

                     <td> <button onClick={() => UpdateNavigate(a.id)}>Update </button></td>
                     <td> <button onClick={() => deleteStaff(a.id)}>Delete </button></td>
                </tr>
            )
            )}
        </body>
      </table>
    </div>
  )
}

export default Show_staff;
