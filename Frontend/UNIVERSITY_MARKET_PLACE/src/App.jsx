import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Booking from "./components/Booking/Booking";
import BookingForm from "./components/BookingForm/BookingForm";
import Payment from "./components/payment/payment";
import PaymentSuccess from "./components/paymentsuccess/paymentsuccess";
import RatingReview from "./components/rating_review/rating_review";
import Dashboard from "./components/dashboard/dashboard"; // Import Dashboard component

function App() {
  return (
    <Routes>
      <Route path="/" element={<Booking />} />
      <Route path="/booking-form" element={<BookingForm />} />
      <Route path="/payment" element={<Payment />} />
   
      <Route path="/reviews" element={<RatingReview />} />
    
      
      {/* Redirect to home for any unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;