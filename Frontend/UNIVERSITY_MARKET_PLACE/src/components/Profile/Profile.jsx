import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  User, Mail, LayoutDashboard, Briefcase, 
  CalendarCheck, MapPin, ShieldCheck, Phone, 
  GraduationCap, Clock, Star, Loader2, BookOpen
} from "lucide-react";
import ServiceCard from "../ServiceCard";
import RequestCard from "../RequestCard";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState({ services: [], requests: [], bookings: [], incomingBookings: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("services");

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      const res = await axios.put(`http://localhost:5001/api/bookings/${bookingId}/status`, { status });
      if (res.data.success) {
        setData(prev => ({
          ...prev,
          incomingBookings: prev.incomingBookings.map(b => b._id === bookingId ? { ...b, status } : b)
        }));
      }
    } catch (error) {
      console.error("Failed to update booking status:", error);
      alert("Failed to update booking status. Check console.");
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      
      const fetchDashboard = async () => {
        try {
          const res = await axios.get(`http://localhost:5001/api/users/${parsedUser.email}/dashboard?id=${parsedUser.id || parsedUser._id}`);
          if (res.data.success) {
            setData(res.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <User className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-slate-700">Not Logged In</h2>
        <p className="mt-2 text-sm">Please log in to view your profile dashboard.</p>
        <Link to="/login" className="mt-6 px-6 py-2 bg-emerald-500 text-white rounded-lg font-bold">Login</Link>
      </div>
    );
  }

  const initial = user.fullname ? user.fullname.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* Massive Profile Header */}
      <div className="bg-slate-900 relative pt-16 pb-28 md:pt-24 md:pb-32 overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="max-w-6xl mx-auto px-5 lg:px-8 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-5xl md:text-7xl font-black text-white shadow-2xl border-4 border-slate-900/50 relative">
            {initial}
            <div className="absolute -bottom-2 -right-2 bg-white text-emerald-500 p-2 rounded-full shadow-lg border-2 border-slate-900">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>

          <div className="text-center md:text-left mt-2 md:mt-4 flex-grow">
            <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md text-emerald-300 border border-white/10 text-xs font-bold uppercase tracking-widest rounded-full mb-4 shadow-sm">
              Verified Student
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-sm">
              {user.fullname}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-slate-300 font-medium text-sm md:text-base">
              <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                <GraduationCap className="w-4 h-4 text-emerald-400" /> {user.university_name || "University Marketplace"}
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                <Mail className="w-4 h-4 text-slate-400" /> {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                  <Phone className="w-4 h-4 text-slate-400" /> {user.phone}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="max-w-6xl mx-auto px-5 lg:px-8 -mt-16 md:-mt-20 relative z-20">
        
        {/* Navigation Tabs Container */}
        <div className="bg-white rounded-3xl p-2 shadow-xl shadow-slate-200/50 border border-slate-100 flex overflow-x-auto scrollbar-hide mb-10">
          {[
            { id: "services", icon: <LayoutDashboard />, label: "My Services", count: data.services.length },
            { id: "requests", icon: <Briefcase />, label: "My Requests", count: data.requests.length },
            { id: "bookings", icon: <CalendarCheck />, label: "Booking History", count: data.bookings.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-4 md:py-5 min-w-fit md:flex-1 justify-center rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {React.cloneElement(tab.icon, { className: "w-5 h-5" })}
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-[10px] ml-1 ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Dynamic Content Area */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Services Tab */}
            {activeTab === "services" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900">Services You Offer</h2>
                  <Link to="/create-service" className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-sm text-sm">
                    + Add New
                  </Link>
                </div>
                {data.services.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
                    <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No active services</h3>
                    <p className="text-slate-500 mb-6">You haven't posted any skills to the marketplace yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.services.map(s => <ServiceCard key={s._id} service={s} />)}
                  </div>
                )}
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === "requests" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900">Your Help Requests</h2>
                  <Link to="/post-request" className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-sm text-sm">
                    + Post Request
                  </Link>
                </div>
                {data.requests.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
                    <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No active requests</h3>
                    <p className="text-slate-500 mb-6">Need help with something? Post a request for the campus.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {data.requests.map(r => <RequestCard key={r._id} request={r} />)}
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="space-y-12">
                
                {/* INCOMING BOOKING REQUESTS */}
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-6">Incoming Booking Requests</h2>
                  {(!data.incomingBookings || data.incomingBookings.length === 0) ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
                      <CalendarCheck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-slate-800 mb-1">No incoming requests</h3>
                      <p className="text-slate-500 text-sm">When students request to book your services, they will appear here to accept or reject.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {data.incomingBookings.map((booking) => (
                        <div key={booking._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-6 hover:shadow-md hover:border-emerald-500/30 transition-all items-start">
                          
                          <div className="w-14 h-14 shrink-0 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-600 text-xs font-bold uppercase tracking-widest text-center shadow-inner">
                            {new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                          
                          <div className="flex-grow w-full">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${
                                booking.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 
                                booking.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {booking.status}
                              </span>
                              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> Client Request
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-black text-slate-900 mb-2 line-clamp-1">
                              {booking.serviceId?.title || "Unknown Service"}
                            </h3>
                            
                            <div className="flex flex-col gap-1.5 mt-3 mb-4">
                              <p className="text-sm text-slate-600 flex items-center gap-2">
                                <User className="w-4 h-4 text-emerald-500" /> 
                                Booker: <strong className="text-slate-800">{booking.bookerName}</strong>
                              </p>
                              <p className="text-sm text-slate-600 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-500" /> 
                                Requested Time: <strong className="text-slate-800">{booking.day} at {booking.time}</strong>
                              </p>
                            </div>
                            
                            {/* Actions / Status */}
                            {booking.status === 'Pending' ? (
                              <div className="flex gap-2 w-full pt-3 border-t border-slate-100">
                                <button onClick={() => handleUpdateStatus(booking._id, 'Accepted')} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">
                                  Accept & Confirm
                                </button>
                                <button onClick={() => handleUpdateStatus(booking._id, 'Rejected')} className="flex-1 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-lg transition-colors border border-slate-200 hover:border-rose-200">
                                  Reject
                                </button>
                              </div>
                            ) : (
                               <p className="w-full text-center text-xs font-semibold text-slate-400 pt-3 border-t border-slate-100">
                                 Email notification automatically sent.
                               </p>
                            )}

                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <hr className="border-slate-200" />

                {/* MY BOOKINGS (OUTGOING) */}
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-6">Services You Booked</h2>
                  {data.bookings.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
                      <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-slate-800 mb-1">No bookings made</h3>
                      <p className="text-slate-500 text-sm">When you book someone's service, it will securely appear here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-80">
                      {data.bookings.map((booking) => (
                        <div key={booking._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-6 items-start grayscale-[30%]">
                          <div className="w-14 h-14 shrink-0 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-widest text-center shadow-inner">
                            {new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                          
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${
                                booking.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 
                                booking.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2 line-clamp-1">{booking.serviceId?.title || "Unknown Service"}</h3>
                            <div className="flex flex-col gap-1.5 mt-2">
                              <p className="text-sm text-slate-600 flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> Provider: <strong className="text-slate-800">{booking.providerName}</strong></p>
                              <p className="text-sm text-slate-600 flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> Time: <strong className="text-slate-800">{booking.day} at {booking.time}</strong></p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}