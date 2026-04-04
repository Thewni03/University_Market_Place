import { Link, useLocation } from "react-router-dom";
import { Search, Bell, Menu, X, GraduationCap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const navLinks = [
  { label: "Marketplace", path: "/" },
  { label: "User Dashboard", path: "/dashboard" },
  { label: "Create Service", path: "/create-service" },
  { label: "Post Request", path: "/create-request" },
];

export default function Navbar() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const location = useLocation();
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const currentUserId =
    localStorage.getItem("userId") || localStorage.getItem("ownerId") || storedUser?._id || "";
  const initials =
    (storedUser?.fullname || "U")
      .split(" ")
      .map((n) => n?.[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const toImageSrc = (value) => {
    if (!value || typeof value !== "string") return "";
    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:image/") ||
      value.startsWith("blob:")
    ) {
      return value;
    }
    if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
    return "";
  };

  useEffect(() => {
    const loadProfilePic = async () => {
      if (!currentUserId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/${currentUserId}`);
        const result = await response.json().catch(() => ({}));
        if (!response.ok) return;
        const pic = result?.data?.profile_picture || "";
        setProfilePic(toImageSrc(pic));
      } catch {
        // keep fallback avatar
      }
    };
    loadProfilePic();
  }, [API_BASE_URL, currentUserId]);

  const isAuth =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/pending";

  if (isAuth) return null;

  return (
    <nav className=" sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
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
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.path
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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
          </Button>

          <Link to="/profile">
            <Avatar className="h-8 w-8 border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors">
              {profilePic ? <AvatarImage src={profilePic} alt="Profile" /> : null}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
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
          <div className="page-container py-3 space-y-1">
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
                className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
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
