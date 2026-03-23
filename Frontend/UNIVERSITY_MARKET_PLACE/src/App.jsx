import React from "react";
import { Routes, Route } from "react-router-dom";
import Booking from "./pages/Booking/Booking";
import BookingForm from "./pages/BookingForm/BookingForm";
import Payment from "./pages/payment/payment";
import Home from "./pages/Home/Home";
import CreateService from "./pages/CreateService/CreateService";
import PostRequest from "./pages/PostRequest/PostRequest";
import ServiceDetail from "./pages/ServiceDetail/ServiceDetail";
import RequestDetail from "./pages/RequestDetail/RequestDetail";
import UserUpdate from "./Admin/UserUpdate/UserUpdate";
import UserManagement from "./Admin/UserManagement/UserManagement";
import UserInsert from "./Admin/UserInsert/UserInsert";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import PendingVerification from "./components/PendingVerification/PendingVerification";
import Verificationstatushandler from "./components/Verificationstatushandler/Verificationstatushandler";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile/Profile";

function App() {
  return (
    <>
      <Navbar />   {/* Navbar outside Routes */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-service" element={<CreateService />} />
        <Route path="/post-request" element={<PostRequest />} />
        <Route path="/service/:id" element={<ServiceDetail />} />
        <Route path="/request/:id" element={<RequestDetail />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/booking-form" element={<BookingForm />} />
        <Route path="/payment" element={<Payment />} />

        <Route path="/userManagement" element={<UserManagement />} />
        <Route path="/userInsert" element={<UserInsert />} />
        <Route path="/userUpdate/:email" element={<UserUpdate />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/pending" element={<PendingVerification />} />
        <Route path="/Verificationstatushandler" element={<Verificationstatushandler />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;