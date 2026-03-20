import React from "react";
import { Routes, Route } from "react-router-dom";

import Booking from "./components/Booking/Booking";
import BookingForm from "./components/Booking/BookingForm";
import Payment from "./components/payment/payment";

import UserUpdate from "./Admin/UserUpdate/UserUpdate";
import UserManagement from "./Admin/UserManagement/UserManagement";
import UserInsert from "./Admin/UserInsert/UserInsert";
import AdminDashboard from "./Admin/AdminDashboard/AdminDashboard";

import Register from "./components/Register/Register";
import Login from "./components/Login/Login";

import PendingVerification from "./components/PendingVerification/PendingVerification";
import Verificationstatushandler from "./components/Verificationstatushandler/Verificationstatushandler";

import Navbar from "./components/Navbar";
import Profile from "./components/Profile/Profile";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Booking />} />
        <Route path="/booking-form" element={<BookingForm />} />
        <Route path="/payment" element={<Payment />} />

        <Route path="/userManagement" element={<UserManagement />} />
        <Route path="/userInsert" element={<UserInsert />} />
        <Route path="/userUpdate/:email" element={<UserUpdate />} />
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/pending" element={<PendingVerification />} />
        <Route
          path="/Verificationstatushandler"
          element={<Verificationstatushandler />}
        />

        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;