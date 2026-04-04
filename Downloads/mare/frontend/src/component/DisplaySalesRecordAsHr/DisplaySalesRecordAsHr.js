// Display sales as admin ..only admin can see this 

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from 'react-router-dom';


function DisplaySalesRecordAsHr() { 
    const [sales, setSales] = useState([]);

    useEffect(() => {
        loadSales();
    }, []);

const navigate = useNavigate();

    const loadSales = async () => {
        const result = await axios.get("http://localhost:8080/sales");
        setSales(result.data);
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

      
            <h1>Available sales</h1>

            <div style={{ marginBottom: "20px" }}>
    <p><strong>Total Sales Count:</strong> {totalSalesCount}</p>
    <p><strong>Total Selling Amount:</strong> Rs. {totalSellingAmount.toLocaleString()}</p>
</div>
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
                         

                        <td>          <button onClick={() => generatePdf(sales)}> download</button></td>  
                               
                        
                        </tr>
                    ))}
                </tbody>
            </table>


<br></br>


        </div>
    );
}

export default DisplaySalesRecordAsHr;
