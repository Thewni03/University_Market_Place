import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Navbar from "./components/navber";
import Home from "./pages/Home/Home"; 
import Booking from "./pages/Booking/Booking";
import BookingForm from "./pages/BookingForm/BookingForm";
import Payment from "./pages/payment/payment";
import Profile from "./pages/profile/profile";
import CreateService from "./pages/services/createservice";
import EditService from "./pages/services/editservice";
import ServiceDetail from "./pages/services/servicedeatils";


function App() {
  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Profile />} />
      <Route path="/create-service" element={<CreateService />} />
      <Route path="/edit-service/:serviceId" element={<EditService />} />
      <Route path="/service/:id" element={<ServiceDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/booking-form" element={<BookingForm />} />
      <Route path="/payment" element={<Payment />} /> {/* Add Payment route */}
    </Routes>
    </>
  );
}

export default App;
