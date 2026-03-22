import { Link, useLocation } from "react-router-dom";
import { Search, Bell, Menu, X, GraduationCap, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

const navLinks = [
  { label: "Marketplace", path: "/" },
  { label: "User Dashboard", path: "/dashboard" },
  { label: "Create Service", path: "/create-service" },
  { label: "Post Request", path: "/post-request" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (user && user.id) {
      const fetchNotifications = async () => {
        try {
          const res = await axios.get(`http://localhost:5001/api/notifications/${user.id}`);
          if (res.data.success) {
            setNotifications(res.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      };
      
      fetchNotifications();
      // Poll every 30 seconds for immediate WOW factor
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || !user?.id) return;
    try {
      await axios.post('http://localhost:5001/api/notifications/mark-all-read', { userId: user.id });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark read:", error);
    }
  };

  const isAuth =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/pending";

  if (isAuth) return null;

  return (
    <nav className=" sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[hsl(152_60%_32%)]">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground hidden sm:block">
            UniMarket
          </span>
        </Link>

        {/* Search - desktop */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search services, tutors, skills..."
              className="w-full rounded-lg border border-input bg-secondary/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.path
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          
          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`relative ${showNotifications ? 'bg-secondary' : ''}`}
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) handleMarkAllRead();
              }}
            >
              <Bell className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-amber-500" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 border border-white animate-pulse shadow-sm" />
              )}
            </Button>

            {/* Notifications Dropdown Window */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    Notifications {unreadCount > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                  </h3>
                </div>
                
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <Bell className="h-8 w-8 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {notifications.map((notif) => (
                        <div key={notif._id} className={`p-4 transition-colors hover:bg-slate-50 ${!notif.read ? 'bg-indigo-50/30' : ''}`}>
                          <div className="flex gap-4">
                            <div className="shrink-0 pt-1">
                              <div className={`w-2 h-2 rounded-full mt-1.5 ${!notif.read ? 'bg-rose-500' : 'bg-slate-200'}`} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 mb-0.5">{notif.title}</p>
                              <p className="text-sm text-slate-500 leading-snug">{notif.message}</p>
                              <p className="text-[10px] font-semibold text-slate-400 mt-2 uppercase tracking-wider">
                                {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
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

          <Link to="/profile">
            <Avatar className="h-8 w-8 border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                SC
              </AvatarFallback>
            </Avatar>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <div className="container py-3 space-y-1">
            {/* Mobile search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search services..."
                className="w-full rounded-lg border border-input bg-secondary/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${location.pathname === link.path
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}