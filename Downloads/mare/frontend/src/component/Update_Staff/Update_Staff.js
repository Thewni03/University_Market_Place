import React,{ useEffect ,useState} from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";

function Update_Staff() {

    const {id} = useParams();
    const [formData, setformData] = useState({
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

    const navigate = useNavigate();

    useEffect(()=>{
        const fetchData = async() =>{
            try{
                const response = await axios.get(`http://localhost:8080/admin/${id}`);
                const itemData = response.data;

                setformData({
                    fullname: itemData.fullname || '',
                    email: itemData.email || '',
                    password: itemData.password || '',
                    phone: itemData.phone || '',
                    role: itemData.role || '',
                    department: itemData.department || '',
                    startdate: itemData.startdate || '',
                    shift: itemData.shift || '',
                    address: itemData.address || '',
                    emecontact: itemData.emecontact || '',
                    remark: itemData.remark || ''

                });
            }
catch(error){
    console.error(`error fetching data:` ,error);

}
            }
            fetchData();
        },[id])
        const onInputChange = (e) => {
            const {name , value } = e.target
            setformData({...formData,[name]: value});

        }

        const onSubmit = async(e) =>{
            e.preventDefault();

            try{
                await axios.put(`http://localhost:8080/admin/${id}`, formData);
                alert("staff details updated succesfully!!!");
                navigate("/showstaff");
            }
        catch(error){
            alert('error updatin data:',error);
        
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

<h1> update staff details </h1>
<form onSubmit={onSubmit}>

    <label>Full Name</label>
    <input type ='text' name="fullname" 
    value={formData.fullname} onChange={onInputChange } />
    <br/>

    <label>Email</label>
    <input type ='text' name="email" 
    value={formData.email} onChange={onInputChange } />
    <br/>
    <label>password</label>
    <input type ='text' name="password" 
    value={formData.password} onChange={onInputChange } />
    <br/>

    <label>phone</label>
    <input type ='text' name="phone" 
    value={formData.phone} onChange={onInputChange } />
    <br/>
    <label>role</label>
    <select name="role" 
    value={formData.role} onChange={onInputChange } >

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
    <br/>
    <label>department </label>
    <select name="department" 
    value={formData.department} onChange={onInputChange } >

<option value="" disabled> select Department</option>
<option value="admin">adminTeam</option>
<option value="sales">Sales </option>
<option value="finance">Finance & Accounting</option>
<option value="customerService">Customer Service</option>
<option value="hr">Peoples and culture(HR)</option>
<option value="Maintenance">Spare Parts & Maintenance</option>
</select>
    <br/>
    <label>startdate</label>
    <input type ='text' name="startdate" 
    value={formData.startdate} onChange={onInputChange } />
    <br/>
    <label>shift</label>
    <input type ='text' name="shift" 
    value={formData.shift} onChange={onInputChange } />
    <br/>
    <label>address</label>
    <input type ='text' name="address" 
    value={formData.address} onChange={onInputChange } />
    <br/>
    <label>emecontact</label>
    <input type ='text' name="emecontact" 
    value={formData.emecontact} onChange={onInputChange } />
    <br/>
    <label>remark</label>
    <input type ='text' name="remark" 
    value={formData.remark} onChange={onInputChange } />
    <br/>
<button type = "submit" > update </button>
</form>


    </div>
  )
}

export default Update_Staff;
