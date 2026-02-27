import React from "react";
import { Routes, Route } from "react-router-dom";
import Booking from "./components/Booking/Booking";
import BookingForm from "./components/BookingForm/BookingForm";
import Payment from "./components/payment/payment"; // Import the Payment component

function App() {
  return (
    <Routes>
      <Route path="/" element={<Booking />} />
      <Route path="/booking-form" element={<BookingForm />} />
      <Route path="/payment" element={<Payment />} /> {/* Add Payment route */}
    </Routes>
  );
}

export default App;