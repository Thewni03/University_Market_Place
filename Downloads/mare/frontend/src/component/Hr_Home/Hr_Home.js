import React from 'react'
import "./Hr_Home.css";

function Hr_Home() {
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





    </div>
  )
}

export default Hr_Home;
