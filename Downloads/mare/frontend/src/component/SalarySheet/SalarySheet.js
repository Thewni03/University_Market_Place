import React , {useEffect , useState}from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


function SalarySheet() {

    const [salary ,setSalary] = useState([]);
    
    useEffect(()=>{
        loadSalary();
    
    },[]);
    
    const loadSalary = async() => {
        const result = await axios.get("http://localhost:8080/salary");
        setSalary(result.data);
    
    }
    
    
        const navigate = useNavigate();
    
    const UpdateNavigate = (id) =>{
    
        window.location.href =`/updatesalary/${id}`;
    }
    
    const deleteSalary = async(id) =>{
        const confirmationMessage = window.confirm("sure da delete karanawa kiyala ?");
    
        if(confirmationMessage){
       try{
        await axios.delete(`http://localhost:8080/salary/${id}`);
        loadStaff();
        alert("salary details has deleted successfully!!!!");
    
       }
       catch(err){
        alert("Error detecting salary details!");
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
      <li><a href="/attendance" className="nav-linkHr">attendence</a></li>
      <li><a href="/notes" className="nav-linkHr">Notes</a></li>
      <li><a href="/calculator" className="nav-linkHr">calculator</a></li>
      <li><a href="/salarySheet" className="nav-linkHr">Salary Sheet</a></li>
      <li><a href="/displaySalesRecordAsHr" className="nav-linkHr">Sales Records</a></li>
      <li><a href="/staffprofile" className="nav-linkHr">Profile</a></li>
      <li><a href="/userlogin" className="nav-linkHr">Logout</a></li>
      </ul>
      </nav>

    
          <h1>Salary Sheet</h1>
    
          <button onClick={() => navigate("/addnewuser")}>add new member </button>
          <table>
            <thead>
                <tr>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Month</th>
                    <th>Basic Salary</th>
                    <th>department</th>
                    <th>Working Days</th>
                    <th>present</th>
                    <th>absent</th>
                    <th>late</th>
                    <th>remark</th>
                    <th>allowances</th>
                    <th>deductions</th>
                    <th>noOfSales</th>
                    <th>totalSales</th>
                    <th>commissionPercentage</th>
                    <th>commissionAmount</th>
                    <th>netSalary</th>
                    <th>status</th>
    
                    <th>update </th>
                    <th>Delete </th>
                </tr>
            </thead>
    
            <body>
                {s.map((s)=> (
                    <tr key ={s.id}>
                        <td>{s.employeeName}</td>
                        <td>{s.department}</td>
                        <td>{s.role}</td>
                        <td>{s.month}</td>
                        <td>{s.basicSalary}</td>
                        <td>{s.workingDays}</td>
                        <td>{s.present}</td>
                        <td>{s.absent}</td>
                        <td>{s.late}</td>
                        <td>{s.allowances}</td>
                        <td>{s.deductions}</td>
                        <td>{s.noOfSales}</td>
                        <td>{s.commissionPercentage}</td>
                        <td>{s.commissionAmount}</td>
                        <td>{s.netSalary}</td>
                        <td>{s.status}</td>
                    
    
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
    
    export default SalarySheet;
    