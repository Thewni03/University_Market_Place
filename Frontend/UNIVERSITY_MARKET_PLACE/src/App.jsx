import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Navbar from "./components/navber";
import Home from "./pages/Home/Home"; 
import Booking from "./pages/Booking/Booking";
import BookingForm from "./pages/BookingForm/BookingForm";
import Payment from "./pages/payment/payment";


function App() {
  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/booking-form" element={<BookingForm />} />
      <Route path="/payment" element={<Payment />} /> {/* Add Payment route */}
    </Routes>
    </>
  );
}

export default App;