import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";
import Footer from "../Footer/Footer";

function Home() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    loadSales();
  }, []);


  const loadSales = async () => {
      const result = await axios.get("http://localhost:8080/sales");
      setSales(result.data);
  }

  const totalSalesCount = sales.length;

const totalSellingAmount = sales.reduce((total, sale) => {
  return total + Number(sale.sellingPrice || 0);
}, 0);
  return (
    <div className="admin-home">

<nav className="bg-black px-8 py-4 flex items-center justify-between shadow-lg">
  <span className="text-yellow-400 font-bold text-xl tracking-widest uppercase">This is Admin</span>
  <ul className="flex gap-6">
  <li><a href="/showVehicle" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200"
  >Vehicles</a></li>
      <li>  <a href="/displayrecords" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Sales</a></li>
      <li><a href="/displayAppointment"className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Appointments</a></li>
      <li><a href="/showstaff" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">User Management</a></li>
      <li><a href="/notes" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Notes</a></li>
      <li><a href="/adminProfile" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Profile</a></li>
      <li><a href="/logout" className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition-colors duration-200">Logout</a></li>
      </ul>
      </nav>

      <div style={{ marginBottom: "20px" }}>
        <p><strong>Total Sales Count:</strong> {totalSalesCount}</p>
        <p>
          <strong>Total Selling Amount:</strong> Rs. {totalSellingAmount.toLocaleString()}
        </p>
      </div>

      <div className="dashboard-container">
        <h1 className="dashboard-title">Dashboard Overview</h1>

        <div className="dashboard-cards">
          <div className="card">
            <h3>Total Vehicles</h3>
            <p>View all vehicles in system</p>
          </div>

          <div className="card">
            <h3>Sales Records</h3>
            <p>Track and review sales</p>
          </div>

          <div className="card">
            <h3>Appointments</h3>
            <p>View booked test drives</p>
          </div>

          <div className="card">
            <h3>Notes</h3>
            <p>Review manager notes</p>
          </div>
        </div>
      </div>
<Footer/>
    </div>
  );
}

export default Home;
