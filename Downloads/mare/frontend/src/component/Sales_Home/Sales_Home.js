import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav_Sales from "../Nav_Sales/Nav_Sales";

function Sales_Home() {
  const [sales, setSales] = useState([]);
  const [appointment, setAppointment] = useState([]);
const [vehicle,setVehicle]= useState([]);

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    loadAppointment();
  }, []);

  useEffect(()=> {
    loadvehicle();
  },[]);


  const loadSales = async () => {
      const result = await axios.get("http://localhost:8080/sales");
      setSales(result.data);
  }

  const loadvehicle = async() =>{
    const result = await axios.get("http://localhost:8080/vehicle");
    setVehicle(result.data);
  }

  const loadAppointment = async () => {
    const result = await axios.get("http://localhost:8080/appointment");
    setAppointment(result.data);
}

  const totalSalesCount = sales.length;

const totalSellingAmount = sales.reduce((total, sale) => {
  return total + Number(sale.sellingPrice || 0);
}, 0);


const totalAppointmentCount = appointment.length;

const totalvehicleCount = vehicle.length;

  return (
    <div className="min-h-screen bg-gray-50">

<Nav_Sales/>

      <div className="px-10 pt-10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm mt-1">dnein/today date</p>
        </div>
        <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide">
          Sales Staff
        </span>
      </div>

      {/* Stats Cards */}
      <div className="px-10 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Total Sales</span>
            <div className="bg-yellow-100 text-yellow-500 text-xl w-10 h-10 rounded-xl flex items-center justify-center">📋</div>
          </div>
          <p className="text-4xl font-extrabold text-gray-800">{totalSalesCount}</p>
          <p className="text-gray-400 text-xs mt-1">Completed transactions</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Total Revenue</span>
            <div className="bg-green-100 text-green-500 text-xl w-10 h-10 rounded-xl flex items-center justify-center">💰</div>
          </div>
          <p className="text-3xl font-extrabold text-gray-800">Rs. {totalSellingAmount.toLocaleString()}</p>
          <p className="text-gray-400 text-xs mt-1">Total selling amount</p>
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Appointments</span>
            <div className="bg-blue-100 text-blue-400 text-xl w-10 h-10 rounded-xl flex items-center justify-center">📅</div>
          </div>
          <p className="text-4xl font-extrabold text-gray-800">{totalAppointmentCount}</p>
          <p className="text-gray-400 text-xs mt-1">Scheduled test drives</p>
        </div>

        {/* Vehicles */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Vehicles</span>
            <div className="bg-purple-100 text-purple-400 text-xl w-10 h-10 rounded-xl flex items-center justify-center">🚗</div>
          </div>
          <p className="text-4xl font-extrabold text-gray-800">{totalvehicleCount}</p>
          <p className="text-gray-400 text-xs mt-1">In inventory</p>
        </div>

      </div>
    </div>
  );
}

export default Sales_Home;