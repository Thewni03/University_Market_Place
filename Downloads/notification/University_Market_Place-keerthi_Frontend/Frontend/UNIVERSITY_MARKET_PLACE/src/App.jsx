import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navber";

import Home from "./pages/Home/Home";
import Booking from "./pages/Booking/Booking";
import BookingForm from "./pages/BookingForm/BookingForm";
import Payment from "./pages/payment/payment";
import Profile from "./pages/profile/profile";
import CreateService from "./pages/services/createservice";
import EditService from "./pages/services/editservice";
import ServiceDetail from "./pages/services/servicedeatils";

import UserUpdate from "./Admin/UserUpdate/UserUpdate";
import UserManagement from "./Admin/UserManagement/UserManagement";
import UserInsert from "./Admin/UserInsert/UserInsert";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import PendingVerification from "./pages/PendingVerification/PendingVerification";
import Verificationstatushandler from "./components/Verificationstatushandler/Verificationstatushandler";

function App() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/register" ||
    location.pathname === "/Verificationstatushandler";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Profile />} />
        <Route path="/create-service" element={<CreateService />} />
        <Route path="/edit-service/:serviceId" element={<EditService />} />
        <Route path="/service/:id" element={<ServiceDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/booking-form" element={<BookingForm />} />
        <Route path="/payment" element={<Payment />} />

        <Route path="/userManagement" element={<UserManagement />} />
        <Route path="/userInsert" element={<UserInsert />} />
        <Route path="/userUpdate/:email" element={<UserUpdate />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pending" element={<PendingVerification />} />
        <Route
          path="/Verificationstatushandler"
          element={<Verificationstatushandler />}
        />
      </Routes>
    </>
  );
}

export default App;
