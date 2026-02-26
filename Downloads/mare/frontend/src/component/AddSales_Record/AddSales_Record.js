import React, { useState } from "react";
import axios from "axios";
import Nav_Sales from "../Nav_Sales/Nav_Sales";

function AddSales_Record() {
  const [sales, setSales] = useState({
    vehicleId: "",
    soldTo: "",
    soldDate: "",
    taxPercentage: "",
    commissionPercentage: "",
    sellingPrice: "",
    salesmanId: "",
    salesmanName: "",
  });

  const {
    vehicleId,
    soldTo,
    soldDate,
    taxPercentage,
    commissionPercentage,
    sellingPrice,
    salesmanId,
    salesmanName
  } = sales;


  const onInputChange = (e) => {
    setSales({ ...sales, [e.target.name]: e.target.value });
  };


  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8080/sales", sales);
      alert("New sale added successfully!");

      setSales({
        vehicleId: "",
        soldTo: "",
        soldDate: "",
        taxPercentage: "",
        commissionPercentage: "",
        sellingPrice: "",
        salesmanId: "",
        salesmanName: "",
      });

    } catch (error) {
      alert("Error saving sales data");
      console.error(error);
    }
  };

  return (
    <div>


<Nav_Sales/>
      
      <h1>Add Sales Record</h1>

      <div className="form_container">
        <div className="form_sub_container">
          <form onSubmit={onSubmit}>

            <label>Vehicle ID:</label>
            <input
              type="text"
              name="vehicleId"
              value={vehicleId}
              onChange={onInputChange}
              required
            />
            <br /><br />

            <label>Sold To:</label>
            <input
              type="text"
              name="soldTo"
              value={soldTo}
              onChange={onInputChange}
              required
            />
            <br /><br />

            <label>Sold Date:</label>
            <input
              type="date"
              name="soldDate"
              value={soldDate}
              onChange={onInputChange}
              required
            />
            <br /><br />

            <label>Tax Percentage (%):</label>
            <input
              type="number"
              name="taxPercentage"
              value={taxPercentage}
              onChange={onInputChange}
              required
            />
            <br /><br />

            <label>Commission Percentage (%):</label>
            <input
              type="number"
              name="commissionPercentage"
              value={commissionPercentage}
              onChange={onInputChange}
              required
            />
            <br /><br />

            <label>Selling Price:</label>
            <input
              type="number"
              name="sellingPrice"
              value={sellingPrice}
              onChange={onInputChange}
              required
            />
            <br /><br />

            <label>Salesman ID:</label>
            <input
              type="number"
              name="salesmanId"
              value={salesmanId}
              onChange={onInputChange}
              required
            />
            <br /><br />

            <label>Salesman Name:</label>
            <input
              type="text"
              name="salesmanName"
              value={salesmanName}
              onChange={onInputChange}
              required
            />
            <br /><br />

            <button type="submit" className="form_btn">
              Submit
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddSales_Record;
