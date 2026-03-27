// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, X, GraduationCap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"; // ← KEPT: AvatarImage for profile pic

// ← ADDED: notification context + dropdown from file 2
import { useNotifications } from "../notifications/context/NotificationContext";
import NotificationDropdown from "../notifications/components/NotificationDropdown";

const navLinks = [
  { label: "Marketplace", path: "/home" },
  { label: "Talk Space", path: "/dashboard" },
  { label: "Offer a Service", path: "/create-service" }, // ← KEPT: label from file 1
  { label: "Post Request", path: "/post-request" },
];

export default function Navbar() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"; // ← KEPT from file 1
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState("");          // ← KEPT from file 1
  const [searchTerm, setSearchTerm] = useState("");          // ← KEPT from file 1
  const [searchResults, setSearchResults] = useState([]);    // ← KEPT from file 1
  const [searchLoading, setSearchLoading] = useState(false); // ← KEPT from file 1
  const [showSearchResults, setShowSearchResults] = useState(false); // ← KEPT from file 1
  const searchBoxRef = useRef(null);                         // ← KEPT from file 1
  const location = useLocation();
  const navigate = useNavigate();                            // ← KEPT from file 1

  // ← ADDED: notification state from file 2
  const { unreadCount, open, setOpen } = useNotifications();

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const currentUserId =
    localStorage.getItem("userId") ||
    localStorage.getItem("ownerId") ||
    storedUser?._id || "";

  const initials =
    (storedUser?.fullname || "U")
      .split(" ")
      .map((n) => n?.[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"; // ← KEPT: dynamic initials from file 1 (replaces hardcoded "SC")

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

  // ← KEPT: fetches real profile picture from API
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

  // ← KEPT: closes search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!searchBoxRef.current) return;
      if (!searchBoxRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ← KEPT: live search with 250ms debounce
  useEffect(() => {
    const q = searchTerm.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let ignore = false;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/services?q=${encodeURIComponent(q)}`
        );
        const result = await response.json().catch(() => ({}));
        if (!response.ok || ignore) return;
        const list = Array.isArray(result?.data) ? result.data : [];
        setSearchResults(list.slice(0, 7));
        setShowSearchResults(true);
      } catch {
        if (!ignore) setSearchResults([]);
      } finally {
        if (!ignore) setSearchLoading(false);
      }
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [API_BASE_URL, searchTerm]);

  const normalizedPath = location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
  const isAuth =
    normalizedPath === "/" ||
    normalizedPath === "/login" ||
    normalizedPath === "/register" ||
    normalizedPath === "/signup" ||
    normalizedPath === "/pending" ||
    normalizedPath === "/verificationstatushandler";

  if (isAuth) return null;

  const isLinkActive = (path) => {
    if (path === "/home") return location.pathname === "/home";
    return location.pathname === path;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSearchResults(true);
  };

  const handleSelectResult = (serviceId) => {
    if (!serviceId) return;
    setShowSearchResults(false);
    setMobileOpen(false);
    navigate(`/service/${serviceId}`);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="page-container flex h-16 items-center justify-between gap-4"> {/* ← KEPT: page-container from file 1 */}

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[hsl(152_60%_32%)]"> {/* ← KEPT: explicit gradient from file 1 */}
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground hidden sm:block">
            UniMarket
          </span>
        </Link>

        {/* Search - desktop */}
        <div className="hidden md:flex flex-1 max-w-md" ref={searchBoxRef}> {/* ← KEPT: ref for outside-click detection */}
          <form className="relative w-full" onSubmit={handleSearchSubmit}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search services, tutors, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
              className="w-full rounded-lg border border-input bg-secondary/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {/* ← KEPT: live search results dropdown */}
            {showSearchResults && (
              <div className="absolute top-full mt-2 w-full rounded-lg border border-border bg-card shadow-lg z-50 max-h-72 overflow-y-auto">
                {searchLoading ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">Searching...</p>
                ) : searchResults.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    {searchTerm.trim().length < 2 ? "Type at least 2 letters" : "No matching services"}
                  </p>
                ) : (
                  searchResults.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => handleSelectResult(item._id)}
                      className="w-full text-left px-3 py-2 hover:bg-secondary transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.category} • LKR {Number(item.pricePerHour || 0).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </form>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isLinkActive(link.path)
                  ? "text-[#013a63] bg-[#4a4e69]/20" // ← KEPT: brand colors + smart isLinkActive from file 1
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* ← CHANGED: replaced static bell with full notification bell + dropdown from file 2 */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setOpen((prev) => !prev)}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {/* ← ADDED: shows real unread count badge, falls back to dot if 0 */}
              {unreadCount > 0 ? (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-[10px] font-bold text-accent-foreground leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
              )}
            </Button>
            {/* ← ADDED: notification dropdown panel */}
            {open && <NotificationDropdown onClose={() => setOpen(false)} />}
          </div>

          {/* ← KEPT: real profile pic from API with dynamic initials fallback */}
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
          <div className="page-container py-3 space-y-1"> {/* ← KEPT: page-container from file 1 */}

            {/* ← KEPT: mobile search with live results dropdown */}
            <form className="relative mb-3" onSubmit={handleSearchSubmit}>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
                className="w-full rounded-lg border border-input bg-secondary/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {showSearchResults && (
                <div className="absolute top-full mt-2 w-full rounded-lg border border-border bg-card shadow-lg z-50 max-h-72 overflow-y-auto">
                  {searchLoading ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">Searching...</p>
                  ) : searchResults.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      {searchTerm.trim().length < 2 ? "Type at least 2 letters" : "No matching services"}
                    </p>
                  ) : (
                    searchResults.map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => handleSelectResult(item._id)}
                        className="w-full text-left px-3 py-2 hover:bg-secondary transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.category} • LKR {Number(item.pricePerHour || 0).toLocaleString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </form>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isLinkActive(link.path)
                    ? "text-[#013a63] bg-[#4a4e69]/20" // ← KEPT: brand colors from file 1
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
