// Display sales as admin ..only admin can see this 

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


function Display_Sales_records() { 
    const [sales, setSales] = useState([]);

    useEffect(() => {
        loadSales();
    }, []);


    const loadSales = async () => {
        const result = await axios.get("http://localhost:8080/sales");
        setSales(result.data);
    }


    const UpdateNavigate = (id) => {
        window.location.href = `/updatesellvehicle/${id}`;
    }


    const deleteSales = async (id) => {
        const confirmationMessage = window.confirm(
            "Are you sure you want to delete this?"
        );

        if (confirmationMessage) {
            try {
                await axios.delete(`http://localhost:8080/sales/${id}`);

              
                loadSales();

                alert("sales deleted successfully!");
            } catch (error) {
                alert("ERROR deleting sales!");
                console.error(error);
            }
        }
    }


    const totalSalesCount = sales.length;

const totalSellingAmount = sales.reduce((total, sale) => {
    return total + Number(sale.sellingPrice || 0);
}, 0);

    const generatePdf = (sales)=> {
        const doc = new jsPDF("portrait");


        doc.text("sales record", 14 ,10);

        const tableData = sales.map((sales)=>[
            sales.vehicleId,
            sales.soldTo,
            sales.soldDate,
            sales.taxPercentage,
            sales.commissionPercentage,
            sales.sellingPrice,
            sales.salesmanId,
            sales.salesmanName,
      
        ]
        );
        autoTable(doc, {  
            head: [['vehicleId','soldTo','soldDate','taxPercentage','commissionPercentage','sellingPrice','salesmanId','salesmanName']],
            body: tableData,
            startY: 20,
          });

        doc.save("slaes_I_have_done.pdf");
    }

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
            <h1>Available sales</h1>


            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Vehicle ID</th>
                        <th>soldTo</th>
                        <th>soldDate</th>
                        <th>taxPercentage</th>
                        <th>commissionPercentage</th>
                        <th>sellingPrice</th>
                        <th>salesmanId</th>
                        <th>salesmanName</th>
              <th>Update</th>
              <th>Delete</th>
                        <th>Download</th>

                    </tr>
                </thead>

                <tbody>
                    {sales.map((v) => (
                        <tr key={v.id}>
                            <td>{v.vehicleId}</td>
                            <td>{v.soldTo}</td>
                            <td>{v.soldDate}</td>
                            <td>{v.taxPercentage}</td>
                            <td>{v.commissionPercentage}</td>
                            <td>{v.sellingPrice}</td>
                            <td>{v.salesmanId}</td>
                            <td>{v.salesmanName}</td>
                         

                     
                        <td>       <button onClick={() => UpdateNavigate(v.id)}>Update</button>  </td>  

                        <td>          <button onClick={() => deleteSales(v.id)}>Delete</button> </td>  

                        <td>          <button onClick={() => generatePdf(sales)}> download</button></td>  
                               
                        
                        </tr>
                    ))}
                </tbody>
            </table>


            <h2>Sales Summary (Admin Only)</h2>

<div style={{ marginBottom: "20px" }}>
    <p><strong>Total Sales Count:</strong> {totalSalesCount}</p>
    <p><strong>Total Selling Amount:</strong> Rs. {totalSellingAmount.toLocaleString()}</p>
</div>

        </div>
    );
}

export default Display_Sales_records;
