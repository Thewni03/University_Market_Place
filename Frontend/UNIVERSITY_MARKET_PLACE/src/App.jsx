import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navber";

// ── Pages ──────────────────────────────────────────────────────────────────
import Home from "./pages/Home/Home";
import Profile from "./pages/profile/profile";
import CreateService from "./pages/CreateService/createservice";
import EditService from "./pages/services/editservice";
import ServiceDetail from "./pages/ServiceDetail/ServiceDetail";
import PostRequest from "./pages/PostRequest/PostRequest";
import RequestDetail from "./pages/RequestDetail/RequestDetail";
import Chat from "./pages/Chat/chat.jsx";

// ── Components ─────────────────────────────────────────────────────────────
import BookingForm from "./components/BookingForm/BookingForm";
import BookingSuccess from "./components/BookingForm/BookingSuccess";
import Payment from "./components/payment/payment";
import Reviewandrating from "./components/Reviewandrating/Reviewandrating";

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
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const location = useLocation();
  const authUser = useAuthStore((state) => state.authUser);
  const connectSocket = useAuthStore((state) => state.connectSocket);
  const disconnectSocket = useAuthStore((state) => state.disconnectSocket);
  const normalizedPath = location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
  const hideNavbar =
    normalizedPath === "/" ||
    normalizedPath === "/login" ||
    normalizedPath === "/register" ||
    normalizedPath === "/verificationstatushandler" ||
    normalizedPath === "/pending";

  useEffect(() => {
    if (authUser?._id) {
      connectSocket();
      return;
    }

    disconnectSocket();
  }, [authUser?._id, connectSocket, disconnectSocket]);

  return (
    <NotificationProvider>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Core */}
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />

        {/* Services */}
        <Route path="/create-service" element={<CreateService />} />
        <Route path="/edit-service/:serviceId" element={<EditService />} />
        <Route path="/service/:id" element={<ServiceDetail />} />

        {/* Requests */}
        <Route path="/post-request" element={<PostRequest />} />
        <Route path="/request/:id" element={<RequestDetail />} />

        {/* Booking & Payment */}
        <Route path="/booking-form" element={<BookingForm />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/payment" element={<Payment />} />

        {/* Reviews & Ratings */}
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