import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, X, GraduationCap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const navLinks = [
  { label: "Marketplace", path: "/" },
  { label: "User Dashboard", path: "/dashboard" },
  { label: "Offer a Service", path: "/create-service" },
  { label: "Post Request", path: "/post-request" },
];

export default function Navbar() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchBoxRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
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
        if (!response.ok) return;
        if (ignore) return;
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

  const isAuth =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/pending";

  if (isAuth) return null;

  const isLinkActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/profile";
    }
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
    <nav className=" sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="page-container flex h-16 items-center justify-between gap-4">
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
        <div className="hidden md:flex flex-1 max-w-md" ref={searchBoxRef}>
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
                  ? "text-[#013a63] bg-[#4a4e69]/20"
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
                    ? "text-[#013a63] bg-[#4a4e69]/20"
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
