import React , {useEffect , useState}from 'react';
import axios from 'axios';


function Hr_ManageUsers() {
    const[admin,setStaff] = useState([]);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async() =>{
        const result = await axios.get("http://localhost:8080/admin");
        setStaff(result.data);

    }




    const UpdateNavigate = (id) =>{

        window.location.href =`/HrupdateStaff/${id}`;
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


      <h1>Staff table</h1>

      <table >
        <thead>
            <tr>
                <th>fullname</th>
                <th>email</th>
                <th>phone</th>
                <th>role</th>
                <th>department</th>
                <th>startdate</th>
                <th>shift</th>
                <th>address</th>
                <th>emecontact</th>
                <th>remark</th>

                <th>update Details</th>
            </tr>
        </thead>

        <tbody>
            {admin.map((a)=> (
                <tr key ={a.id}>
                    <td>{a.fullname}</td>
                    <td>{a.email}</td>
                    <td>{a.phone}</td>
                    <td>{a.role}</td>
                    <td>{a.department}</td>
                    <td>{a.startdate}</td>
                    <td>{a.shift}</td>
                    <td>{a.address}</td>
                    <td>{a.emecontact}</td>
                     <td>{a.remark}</td>

                     <td> <button onClick={() => UpdateNavigate(a.id)}>Update </button></td>
                  
                </tr>
            )
            )}
        </tbody>
      </table>
      
    </div>
  )
}

export default Hr_ManageUsers;
