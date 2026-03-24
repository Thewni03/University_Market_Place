import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navber";

// ── Pages ──────────────────────────────────────────────────────────────────
import Home from "./pages/Home/Home";
import Profile from "./pages/profile/profile";
import CreateService from "./pages/CreateService/CreateService";       // ← KEPT: path from file 2
import EditService from "./pages/services/editservice";
import ServiceDetail from "./pages/ServiceDetail/ServiceDetail";       // ← KEPT: path from file 2
import PostRequest from "./pages/PostRequest/PostRequest";             // ← ADDED from file 2
import RequestDetail from "./pages/RequestDetail/RequestDetail";       // ← ADDED from file 2

// ── Components ─────────────────────────────────────────────────────────────
import BookingForm from "./components/BookingForm/BookingForm";        // ← KEPT: path from file 2
import Payment from "./components/payment/payment";                    // ← KEPT: path from file 2
import Reviewandrating from "./components/Reviewandrating/Reviewandrating"; // ← ADDED from file 2

// ── Admin ──────────────────────────────────────────────────────────────────
import UserManagement from "./Admin/UserManagement/UserManagement";
import UserInsert from "./Admin/UserInsert/UserInsert";
import UserUpdate from "./Admin/UserUpdate/UserUpdate";

// ── Auth ───────────────────────────────────────────────────────────────────
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import PendingVerification from "./pages/PendingVerification/PendingVerification";
import Verificationstatushandler from "./components/Verificationstatushandler/Verificationstatushandler";

// ── Notifications ──────────────────────────────────────────────────────────
import { NotificationProvider } from "./notifications/context/NotificationContext";

function App() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/register" ||
    location.pathname === "/Verificationstatushandler";

  return (
    // ← KEPT: NotificationProvider wraps everything (from file 1)
    // Keeps Socket.io alive for the whole session + gives useNotifications() to all components
    <NotificationProvider>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Core */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />

        {/* Services */}
        <Route path="/create-service" element={<CreateService />} />
        <Route path="/edit-service/:serviceId" element={<EditService />} />
        <Route path="/service/:id" element={<ServiceDetail />} />

        {/* ← ADDED from file 2: post & browse requests */}
        <Route path="/post-request" element={<PostRequest />} />
        <Route path="/request/:id" element={<RequestDetail />} />

        {/* Booking & Payment */}
        <Route path="/booking-form" element={<BookingForm />} />
        <Route path="/payment" element={<Payment />} />

        {/* ← ADDED from file 2: reviews & ratings page */}
        <Route path="/reviewandrating" element={<Reviewandrating />} />

        {/* Admin */}
        <Route path="/userManagement" element={<UserManagement />} />
        <Route path="/userInsert" element={<UserInsert />} />
        <Route path="/userUpdate/:email" element={<UserUpdate />} />

        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pending" element={<PendingVerification />} />
        <Route path="/Verificationstatushandler" element={<Verificationstatushandler />} />
      </Routes>
    </NotificationProvider>
  );
}

export default App;