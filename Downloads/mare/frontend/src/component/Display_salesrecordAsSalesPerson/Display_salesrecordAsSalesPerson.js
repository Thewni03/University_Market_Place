// Display sales as admin ..only admin can see this 

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from 'react-router-dom';
import Nav_Sales from '../Nav_Sales/Nav_Sales';


function Display_salesrecordAsSalesPerson() { 
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


    const UpdateNavigate = (id) => {
        window.location.href = `/updatesellvehicle/${id}`;
    }


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
 <Nav_Sales/>
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


                        <td>          <button onClick={() => generatePdf(sales)}> download</button></td>  
                               
                        
                        </tr>
                    ))}
                </tbody>
            </table>


<br></br>
            <button onClick={() => navigate("/addsalesrecord")}> add new sales</button>

        </div>
    );
}

export default Display_salesrecordAsSalesPerson;
