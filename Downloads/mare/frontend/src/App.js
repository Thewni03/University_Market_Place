

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from "./component/Home/Home";
import AddVehicle from "./component/AddVehicle/AddVehicle";
import DisplayVehicle from "./component/DisplayVehicle/DisplayVehicle";
import VehicleList from "./component/VehicleList/VehicleList";
import Sales_Home from "./component/Sales_Home/Sales_Home";
import Shop_Vehicle from "./component/Shop_Vehicle/Shop_Vehicle";
import Customer_Home from "./component/Customer_Home/Customer_Home";
import UpdateVehicle from "./component/UpdateVehicle/UpdateVehicle";
import Sales_updateVehicle from "./component/Sales_updateVehicle/Sales_updateVehicle";
import AddSales_Record from "./component/AddSales_Record/AddSales_Record";
import Display_Sales_records from"./component/Display_Sales_records/Display_Sales_records";
import Register from './component/Register/Register';
import Login from './component/Login/Login';
import User_Profile from './component/User_Profile/User_Profile';
import Add_Appointment from './component/Add_Appointment/Add_Appointment';
import Display_Appointment from './component/Display_Appointment/Display_Appointment';
import Update_Profile from './component/Update_Profile/Update_Profile';
import AddNewUser from'./component/AddNewUser/AddNewUser';
import UserLogin from './component/UserLogin/UserLogin';
import StaffProfile from './component/StaffProfile/StaffProfile';
import Select_Dep from './component/Select_Dep/Select_Dep';
import Update_Staff from './component/Update_Staff/Update_Staff';
import Show_staff from './component/Show_staff/Show_staff';
import Staff_updateAppointment from './component/Staff_updateAppointment/Staff_updateAppointment';
import Updat_Appointment from './component/Updat_Appointment/Updat_Appointment';
import Display_salesrecordAsSalesPerson from './component/Display_salesrecordAsSalesPerson/Display_salesrecordAsSalesPerson';
import Display_AppointmentAssalesPerson from './component/Display_AppointmentAssalesPerson/Display_AppointmentAssalesPerson';
import Calculator from './component/Calculator/Calculator';
import SalesMan_updateAppointment from './component/SalesMan_updateAppointment/SalesMan_updateAppointment';
import Hr_Home from './component/Hr_Home/Hr_Home';
import Hr_ManageUsers from './component/Hr_ManageUsers/Hr_ManageUsers';
import Hr_updateStaff from './component/Hr_updateStaff/Hr_updateStaff';
import Hr_AddAttendance from './component/Hr_AddAttendance/Hr_AddAttendance';
import Attendance from './component/Attendance/Attendance';
import DisplaySalesRecordAsHr from './component/DisplaySalesRecordAsHr/DisplaySalesRecordAsHr';
import Add_Salary  from './component/Add_Salary/Add_Salary';
import AdminProfile from './component/AdminProfile/AdminProfile';

function App() {
  return (
    <React.Fragment>  
    <Routes>
  {/* admin */}
    <Route path="/selectdepartment" element={<Select_Dep/>} />   {/* all staff  */}
    <Route path="/displayAppointment" element={<Display_Appointment/>} />  
    <Route path="/showVehicle" element={<DisplayVehicle />} /> 
    <Route path="/showstaff" element={<Show_staff/>} />  
    <Route path="/updatebyadmin/:id" element={<UpdateVehicle />} />  
      <Route path="/" element={<Home/>} />     
      <Route path="/AddVehical" element={<AddVehicle />} />  
      <Route path="/updatesellvehicle/:id" element={<Sales_updateVehicle />} /> 
      <Route path="/displayrecords" element={<Display_Sales_records/>} />
      <Route path="/staffUpdateAppointment/:id" element={<Staff_updateAppointment/>} />   
      <Route path="/addnewuser" element={<AddNewUser/>} />
      <Route path="/updatestaffbyadmin/:id" element={<Update_Staff/>} /> 
<Route path='adminProfile' element={<AdminProfile/>} />


      <Route path="/vehiclelist" element={<VehicleList />} />   {/* sales(thaama haduwe na ) */}
      <Route path="/userlogin" element={<UserLogin/>} />   {/* staff login */}



 {/* customer */}
      <Route path="/customerhome" element={<Customer_Home />} />   
      <Route path="/theshop" element={<Shop_Vehicle />} />  
      <Route path="/register" element={<Register/>} />  
      <Route path="/login" element={<Login/>} />
      <Route path="/userProfile" element={<User_Profile/>} />  
      <Route path="/updateProfile/:id" element={<Update_Profile/>} />  
      <Route path="/updateAppointment/:id" element={<Updat_Appointment/>} />  
      <Route path='/addAppointment' element={<Add_Appointment/>}/>
      
 {/* sales */}
      <Route path="/saleshome" element={<Sales_Home />} /> 
      <Route path="/addsalesrecord" element={<AddSales_Record/>} />   
     <Route path="/displayrecordassalesperson" element={<Display_salesrecordAsSalesPerson/>} />  
     <Route path="/displayAppointmentassalesperson" element={<Display_AppointmentAssalesPerson/>} />   
     <Route path="/calculator" element={<Calculator/>} />   
     <Route path="/salesmanUpdateAppointment/:id" element={<SalesMan_updateAppointment/>} />   
     <Route path="/addsalesrecord" element={<AddSales_Record/>} />  
     <Route path="/staffprofile" element={<StaffProfile/>} /> 


     <Route path="/hrHome" element={<Hr_Home/>} />   {/* Hr */}
     <Route path="/HrManageUsers" element={<Hr_ManageUsers/>} />   {/* Hr can see the users */}
     <Route path="/HrAddAttendance" element={<Hr_AddAttendance/>} />   {/* Hr can update the users */}
     <Route path="/attendance" element={<Attendance/>} />   {/* Hr can update the users */}
     <Route path="/updateattendancebyhr/:id" element={<Hr_updateStaff/>} />   {/* Hr can update the users */}
     <Route path="/displaySalesRecordAsHr" element={<DisplaySalesRecordAsHr/>} />   {/* Hr can update the users */}
     <Route path="/addsalarySheet" element={<Add_Salary/>} />   {/* Hr can update the users */}

    </Routes>
    </React.Fragment>
  );
}

export default App;
