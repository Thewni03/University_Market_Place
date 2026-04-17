import React, { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

// ── Notifications & Store ──────────────────────────────────────────────────
import { NotificationProvider } from "./notifications/context/NotificationContext";
import { useAuthStore } from "./store/useAuthStore";

// ── Pages (Lazy Loaded) ────────────────────────────────────────────────────
const Marketplace = lazy(() => import("./pages/Marketplace/Marketplace"));
const Home = lazy(() => import("./pages/Home/Home"));
const CampusFeed = lazy(() => import("./pages/CampusFeed/CampusFeed"));
const Profile = lazy(() => import("./pages/profile/profile"));
const CampusForum = lazy(() => import("./pages/CampusForum/CampusForum"));
const ForumThread = lazy(() => import("./pages/CampusForum/ForumThread"));
const Chat = lazy(() => import("./pages/Chat/chat.jsx"));

// ── Services ───────────────────────────────────────────────────────────────
const CreateService = lazy(() => import("./pages/CreateService/createservice"));
const EditService = lazy(() => import("./pages/services/editservice"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail/ServiceDetail"));

// ── Requests ───────────────────────────────────────────────────────────────
const PostRequest = lazy(() => import("./pages/PostRequest/PostRequest"));
const RequestDetail = lazy(() => import("./pages/RequestDetail/RequestDetail"));

// ── Components & Widgets ───────────────────────────────────────────────────
const AccessibilityWidget = lazy(() => import("./components/AccessibilityWidget"));
const TalkSpaceWidget = lazy(() => import("./components/TalkSpaceWidget"));
const BookingForm = lazy(() => import("./components/Booking/BookingForm.jsx"));
const BookingSuccess = lazy(() => import("./components/Booking/BookingSuccess.jsx"));
const BookingHistory = lazy(() => import("./components/Booking/BookingHistory.jsx"));
const Payment = lazy(() => import("./components/payment/payment"));
const Reviewandrating = lazy(() => import("./components/Reviewandrating/Reviewandrating"));

// ── Admin ──────────────────────────────────────────────────────────────────
const UserManagement = lazy(() => import("./Admin/UserManagement/UserManagement"));
const UserInsert = lazy(() => import("./Admin/UserInsert/UserInsert"));
const UserUpdate = lazy(() => import("./Admin/UserUpdate/UserUpdate"));

// ── Auth ───────────────────────────────────────────────────────────────────
const Register = lazy(() => import("./pages/Register/Register"));
const Login = lazy(() => import("./pages/Login/Login"));
const PendingVerification = lazy(() => import("./pages/PendingVerification/PendingVerification"));
const Verificationstatushandler = lazy(() => import("./components/Verificationstatushandler/Verificationstatushandler"));

const AppLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center px-6 py-16">
    <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm">
      <span className="inline-flex size-2.5 animate-pulse rounded-full bg-emerald-500" />
      Loading page...
    </div>
  </div>
);

function App() {
  const location = useLocation();
  const authUser = useAuthStore((state) => state.authUser);
  const connectSocket = useAuthStore((state) => state.connectSocket);
  const disconnectSocket = useAuthStore((state) => state.disconnectSocket);

  const normalizedPath = location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
  const hideNavbar = [
    "/", 
    "/login", 
    "/register", 
    "/verificationstatushandler", 
    "/pending"
  ].includes(normalizedPath);

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

      <Suspense fallback={<AppLoader />}>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending" element={<PendingVerification />} />
          <Route path="/Verificationstatushandler" element={<Verificationstatushandler />} />

          {/* Core Content */}
          <Route path="/home" element={<Home />} />
          <Route path="/feed" element={<CampusFeed />} />
          <Route path="/forum" element={<CampusForum />} />
          <Route path="/forum/:id" element={<ForumThread />} />
          <Route path="/dashboard" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Marketplace / Shop */}
          <Route path="/marketplace" element={<Marketplace />} />

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
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/reviewandrating" element={<Reviewandrating />} />

          {/* Admin */}
          <Route path="/userManagement" element={<UserManagement />} />
          <Route path="/userInsert" element={<UserInsert />} />
          <Route path="/userUpdate/:email" element={<UserUpdate />} />
        </Routes>
      </Suspense>

      <Suspense fallback={null}>
        <TalkSpaceWidget />
        <AccessibilityWidget />
      </Suspense>
    </NotificationProvider>
  );
}

export default App;
