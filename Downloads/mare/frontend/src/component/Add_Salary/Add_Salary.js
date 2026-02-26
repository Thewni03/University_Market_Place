import React, { useState } from 'react';
import axios from 'axios';

function Add_Salary() {
    const [salary, setSalary] = useState({
        employeeName: '',
        department: '',
        role: '',
        month: '',
        basicSalary: 0,
        workingDays: 30,
        present: 0,
        absent: 0,
        late: 0,
        allowances: 0,
        deductions: 0,
        noOfSales: 0,
        totalSales: 0,
        commissionPercentage: 0,
        commissionAmount: 0,
        netSalary: 0,
        status: 'pending'
    });

    const onInputChange = (e) => {
        const { name, value } = e.target;
        const updatedSalary = { ...salary, [name]: Number(value) || value };

        // Calculate per-day salary
        const perDaySalary = updatedSalary.basicSalary / (updatedSalary.workingDays || 30);

        // Calculate absent deduction
        const absentDeduction = (updatedSalary.absent || 0) * perDaySalary;

        // Calculate late deduction: 3 late days = 0.5 day deduction
        const lateDeduction = ((updatedSalary.late || 0) / 3) * (perDaySalary / 2);

        // Calculate commission
        const commissionAmt = (updatedSalary.totalSales || 0) * ((updatedSalary.commissionPercentage || 0) / 100);
        updatedSalary.commissionAmount = parseFloat(commissionAmt.toFixed(2));

        // Calculate net salary
        const net = (updatedSalary.basicSalary || 0) + (updatedSalary.allowances || 0) 
                    + commissionAmt 
                    - (absentDeduction + lateDeduction + (updatedSalary.deductions || 0));
        updatedSalary.netSalary = parseFloat(net.toFixed(2));

        setSalary(updatedSalary);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8080/salary", salary);
            alert("Salary record added successfully!");
            window.location.href = "/salarySheet";
        } catch (err) {
            console.error("Error adding salary:", err);
            alert("Failed to add salary record");
        }
    };

    return (
        <div>
            <form onSubmit={onSubmit}>
                <label>Employee Name</label><br/>
                <input type="text" name="employeeName" value={salary.employeeName} onChange={onInputChange} required />
                <br/><br/>

                <label>Department</label><br/>
                <select name="department" value={salary.department} onChange={onInputChange} required>
                    <option value="" disabled>Select Department</option>
                    <option value="admin">Admin</option>
                    <option value="sales">Sales</option>
                    <option value="finance">Finance & Accounting</option>
                    <option value="customerService">Customer Service</option>
                    <option value="hr">HR</option>
                    <option value="maintenance">Maintenance</option>
                </select>
                <br/><br/>

                <label>Role</label><br/>
              
                <select name="role" id='role'  value={salary.role} onChange={onInputChange} required>
                <option value="" disabled> select Role</option>
<option value="adminTeam">adminTeam</option>
<option value="salesman">Car Consultant </option>
<option value="testDriveBuddy">Test drive Passenger</option>
<option value="financeBuddy">Finance assist</option>
<option value="customercare">Customer care</option>
<option value="hrteam">Peoples and culture(HR)</option>
<option value="carlogists">carlogists</option>
<option value="newbie">Intern</option>
</select>
                <br/><br/>

                <label>Month</label><br/>
                <input type="month" name="month" value={salary.month} onChange={onInputChange} required />
                <br/><br/>

                <label>Basic Salary</label><br/>
                <input type="number" name="basicSalary" value={salary.basicSalary} onChange={onInputChange} required />
                <br/><br/>

                <label>Working Days</label><br/>
                <input type="number" name="workingDays" value={salary.workingDays} onChange={onInputChange} required />
                <br/><br/>

                <label>Present</label><br/>
                <input type="number" name="present" value={salary.present} onChange={onInputChange} required />
                <br/><br/>

                <label>Absent</label><br/>
                <input type="number" name="absent" value={salary.absent} onChange={onInputChange} required />
                <br/><br/>

                <label>Late</label><br/>
                <input type="number" name="late" value={salary.late} onChange={onInputChange} required />
                <br/><br/>

                <label>Allowances</label><br/>
                <input type="number" name="allowances" value={salary.allowances} onChange={onInputChange} />
                <br/><br/>

                <label>Deductions</label><br/>
                <input type="number" name="deductions" value={salary.deductions} onChange={onInputChange} />
                <br/><br/>

                <label>No. of Sales</label><br/>
                <input type="number" name="noOfSales" value={salary.noOfSales} onChange={onInputChange} />
                <br/><br/>

                <label>Total Sales</label><br/>
                <input type="number" name="totalSales" value={salary.totalSales} onChange={onInputChange} />
                <br/><br/>

                <label>Commission %</label><br/>
                <input type="number" name="commissionPercentage" value={salary.commissionPercentage} onChange={onInputChange} />
                <br/><br/>

                <label>Commission Amount</label><br/>
                <input type="number" name="commissionAmount" value={salary.commissionAmount} readOnly />
                <br/><br/>

                <label>Net Salary</label><br/>
                <input type="number" name="netSalary" value={salary.netSalary} readOnly />
                <br/><br/>

                <label>Status</label><br/>
                <select name="status" value={salary.status} onChange={onInputChange}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="notPaid">Not Paid</option>
                </select>
                <br/><br/>

                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default Add_Salary;
