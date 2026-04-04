import React , {useEffect , useState}from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


function Attendance() {

    const[hr,setAttendance] = useState([]);

    useEffect(() => {
        loadAttendance();
    }, []);

const loadAttendance = async() => {
    const result = await axios.get("http://localhost:8080/hr");
    setAttendance(result.data);

}


    const navigate = useNavigate();

    const UpdateNavigate = (id) => {
        navigate(`/updateattendancebyhr/${id}`);
      };

const deleteAttendance = async(id) =>{
    const confirmationMessage = window.confirm("sure da delete karanawa kiyala ?");

    if(confirmationMessage){
   try{
    await axios.delete(`http://localhost:8080/hr/${id}`);
    loadAttendance();
    alert("staff member has deleted successfully!!!!");

   }
   catch(err){
    alert("Error detecting Attendance!");
    console.error(err);
   }
    }
}



  return (


    <div>
<nav className="navbarHr">
      <ul className="HrNav2">
      <li><a href="/hrHome" className="nav-linkHr">HRHome</a></li>
      <li>  <a href="/HrManageUsers" className="nav-linkHr">User Management</a></li>
      <li><a href="/attendence" className="nav-linkHr">attendence</a></li>
      <li><a href="/notes" className="nav-linkHr">Notes</a></li>
      <li><a href="/calculator" className="nav-linkHr">calculator</a></li>
      <li><a href="/salarySheet" className="nav-linkHr">Salary Sheet</a></li>
      <li><a href="/displaySalesRecordAsHr" className="nav-linkHr">Sales Records</a></li>
      <li><a href="/staffprofile" className="nav-linkHr">Profile</a></li>
      <li><a href="/userlogin" className="nav-linkHr">Logout</a></li>
      </ul>
      </nav>

      <h1>Attendance</h1>

      <button onClick={() => navigate("/HrAddAttendance")}>add Attendance </button>
      <table>
        <thead>
            <tr>
                <th>staffname</th>
                <th>department</th>
                <th>role</th>
                <th>date</th>
                <th>checkIn</th>
                <th>checkOut</th>
                <th>status</th>

                <th>update </th>
                <th>Delete </th>
            </tr>
        </thead>

        <tbody>
            {hr.map((h)=> (
                <tr key ={h.id}>
                    <td>{h.staffname}</td>
                    <td>{h.department}</td>
                    <td>{h.role}</td>
                    <td>{h.date}</td>
                    <td>{h.checkIn}</td>
                    <td>{h.checkOut}</td>
                    <td>{h.status}</td>
         
     

                     <td> <button onClick={() => UpdateNavigate(h.id)}>Update </button></td>
                     <td> <button onClick={() => deleteAttendance(h.id)}>Delete </button></td>
                </tr>
            )
            )}
        </tbody>
      </table>
    </div>
  )
}

export default Attendance;
