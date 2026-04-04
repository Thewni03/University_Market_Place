import React, { useState } from "react";
import Nav_Sales from "../Nav_Sales/Nav_Sales";

function Calculator() {

  const [basePrice, setBasePrice] = useState("");
  const [tax, setTax] = useState("");
  const [commission, setCommission] = useState("");


  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [operation, setOperation] = useState("+");
  const [calcResult, setCalcResult] = useState(null);

  
  const base = Number(basePrice) || 0;
  const taxAmount = (base * (Number(tax) || 0)) / 100;
  const commissionAmount = (base * (Number(commission) || 0)) / 100;
  const finalPrice = base + taxAmount + commissionAmount;


  const handleCalculation = () => {
    const a = Number(num1);
    const b = Number(num2);
    let result = 0;

    switch (operation) {
      case "+":
        result = a + b;
        break;
      case "-":
        result = a - b;
        break;
      case "*":
        result = a * b;
        break;
      case "/":
        result = b !== 0 ? a / b : "Error: Division by 0";
        break;
      default:
        result = "Invalid operation";
    }
    setCalcResult(result);
  };

  return (
  <div> 


<Nav_Sales/>

      <br></br>
      <h2>Sales Calculator</h2>
      <div style={{ maxWidth: "800px", margin: "auto" }}>
      <label>Base Price (Rs.)</label>
      <input
        type="number"
        value={basePrice}
        onChange={(e) => setBasePrice(e.target.value)}
        placeholder="Enter base price"
      />
      <br/>
      <label>Tax Percentage (%)</label>
      <input
        type="number"
        value={tax}
        onChange={(e) => setTax(e.target.value)}
        placeholder="Enter tax %"
      />
      <br/>
      <label>Commission Percentage (%)</label>
      <input
        type="number"
        value={commission}
        onChange={(e) => setCommission(e.target.value)}
        placeholder="Enter commission %"
      />

      <hr />

      <p><strong>Tax Amount:</strong> Rs. {taxAmount.toFixed(2)}</p>

      <p><strong>Commission Amount:</strong> Rs. {commissionAmount.toFixed(2)}</p>

      <p><strong>Final Selling Price:</strong> Rs. {finalPrice.toFixed(2)}</p>


      <hr />
      <h2>General Calculator</h2>

      <input
        type="number"
        value={num1}
        onChange={(e) => setNum1(e.target.value)}
        placeholder="Enter number 1"
      />
      <select value={operation} onChange={(e) => setOperation(e.target.value)}>
        <option value="+">+</option>
        <option value="-">-</option>
        <option value="*">*</option>
        <option value="/">/</option>
      </select>
      <br/>
      <input
        type="number"
        value={num2}
        onChange={(e) => setNum2(e.target.value)}
        placeholder="Enter number 2"
      />
            <br/>      <br/>
      <button onClick={handleCalculation}>Calculate</button>

      {calcResult !== null && <p><strong>Result:</strong> {calcResult}</p>}
    </div>
    </div>
  );
}

export default Calculator;
