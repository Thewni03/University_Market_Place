import axios from 'axios';
import React ,{ useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AddNewUser(){

    const navigate = useNavigate();
    const[admin,setUser] = useState({

 fullname:'',
    email:'',
  password:'',
   phone:'',
  role:'',
department:'',
startdate:'',
  shift:'',
  address:'',
   emecontact:'',
     remark:''
    })
    const{fullname,email,password,phone,role,department,startdate,shift,address,emecontact,remark}= admin;

    const onInputChange = async(e) =>{
        setUser({...admin , [e.target.name]: e.target.value })
    }
    
    const onSubmit = async(e) =>{
        e.preventDefault();
        await axios.post("http://localhost:8080/admin",admin)
        alert("new staff memeber added successfully!!!")
        window.location.href ="/showstaff";

    }

    return(
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

      <h1>Add new staff </h1>


      <form onSubmit={(e) => onSubmit(e)} > 
<label> Full Name</label><br/>
<input type ='text' id='fullname' name='fullname' value={fullname} onChange={onInputChange} required/>
<br/><br/>
<label> Email</label><br/>
<input type ='text' id='email' name='email' value={email} onChange={onInputChange} required/>
<br/><br/>
<label> password</label><br/>
<input type ='text' id='password' name='password' value={password} onChange={onInputChange} required/>
<br/><br/>
<label> Phone</label><br/>
<input type ='text' id='phone' name='phone' value={phone} onChange={onInputChange} required/>
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
<label> Start Date</label><br/>
<input type ='text' id='startdate' name='startdate' value={startdate} onChange={onInputChange} required/>
<br/><br/>
<label> Shift</label><br/>
<input type ='text' id='shift' name='shift' value={shift} onChange={onInputChange} />
<br/><br/>
<label> Address</label><br/>
<input type ='text' id='address' name='address' value={address} onChange={onInputChange} required/>
<br/><br/>
<label> Emergency contact</label><br/>
<input type ='text' id='emecontact' name='emecontact' value={emecontact} onChange={onInputChange} required/>
<br/><br/>
<label> remark</label><br/>
<input type ='textarea' id='remark' name='remark' value={remark} onChange={onInputChange} />
<br/><br/>
<button type='submit' className='fom_btn'>Submit</button>
      </form>
        </div>
    )
}

export default AddNewUser;