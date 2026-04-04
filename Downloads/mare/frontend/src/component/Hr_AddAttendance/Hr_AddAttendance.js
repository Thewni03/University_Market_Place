import React , { useState} from 'react'
import axios from 'axios';



function Hr_AddAttendance() {


    const[hr,setAttendance] = useState({

  staffname:'',
   department:'',
 role:'',
      date:'',
   checkIn:'',
  checkOut:'',
       status:''

    })



    const {staffname,department,role,date,checkIn,checkOut,status}=hr;

    const onInputChange = async(e) =>{
        setAttendance({...hr , [e.target.name]: e.target.value})
    }

    

    const onSubmit = async(e) =>{
        e.preventDefault();
        await axios.post("http://localhost:8080/hr",hr)
        alert("attendece marked!!!")
        window.location.href ="/attendance";

    }



  return (
    <div>

<nav className="navbarHr">
      <ul className="HrNav2">
      <li><a href="/hrHome" className="nav-linkHr">HRHome</a></li>
      <li>  <a href="/HrManageUsers" className="nav-linkHr">User Management</a></li>
      <li><a href="/attendance" className="nav-linkHr">attendence</a></li>
      <li><a href="/notes" className="nav-linkHr">Notes</a></li>
      <li><a href="/calculator" className="nav-linkHr">calculator</a></li>
      <li><a href="/salarySheet" className="nav-linkHr">Salary Sheet</a></li>
      <li><a href="/displaySalesRecordAsHr" className="nav-linkHr">Sales Records</a></li>
      <li><a href="/staffprofile" className="nav-linkHr">Profile</a></li>
      <li><a href="/userlogin" className="nav-linkHr">Logout</a></li>
      </ul>
      </nav>


      <form onSubmit={(e) => onSubmit(e)} > 
<label> staffname</label><br/>
<input type ='text' id='staffname' name='staffname' value={staffname} onChange={onInputChange} required/>
<br/><br/>

<label> Department</label><br/>
<select name="department"  id='department' value={department} onChange={onInputChange} required>

<option value="" disabled> select Department</option>
<option value="admin">adminTeam</option>
<option value="sales">Sales </option>
<option value="finance">Finance & Accounting</option>
<option value="customerService">Customer Service</option>
<option value="hr">Peoples and culture(HR)</option>
<option value="Maintenance">Spare Parts & Maintenance</option>
</select>
<br/><br/>
<label>Role</label><br/>
<select name="role" id='role'  value={role} onChange={onInputChange} required>

<option value="" disabled> select Role</option>
<option value="adminTeam">adminTeam</option>
<option value="salesman">Car Consultant </option>
<option value="testDriveBuddy">Test drive Passenger</option>
<option value="financeBuddy">Finance assist</option>
<option value="customercare">Customer care</option>
<option value="hrteam">Peoples and culture(HR)</option>
<option value="carlogists">carlogists</option>
<option value="newbie">Intern</option>
</select>

<br/><br/>
<label>  Date</label><br/>
<input type ='date' id='date' name='date' value={date} onChange={onInputChange} required/>
<br/><br/>
<label> checkIn</label><br/>
<input type ='time' id='checkIn' name='checkIn' value={checkIn} onChange={onInputChange} />
<br/><br/>
<label> checkOut</label><br/>
<input type ='time' id='checkOut' name='checkOut' value={checkOut}
   onChange={onInputChange} required/>
<br/><br/>
<label> status</label><br/>
<select name="status" id='status'  value={status} onChange={onInputChange} required>

<option value="" disabled> select status</option>
<option value="Present">Present</option>
<option value="Absent">Absent </option>
<option value="Late">Late</option>
<option value="HalfDay">Half-Day</option>
<option value="OnLeave">On Leave</option>
<option value="wfh">Work From Home</option>
</select>
<br/><br/>


<button type='submit' className='fom_btn'>Submit</button>
      </form>

    </div>
  )
}

export default Hr_AddAttendance;
