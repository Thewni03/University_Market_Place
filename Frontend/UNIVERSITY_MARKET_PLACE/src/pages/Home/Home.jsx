import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SlidersHorizontal, Briefcase, Sparkles, TrendingUp, MonitorSmartphone, BookOpen, Video, PenTool, Camera, Loader2, ArrowRight, Search, Plus, Zap, Users, Shield
} from "lucide-react";
import { mockServices, mockRequests } from "../../data/mockData";
import ServiceCard from "../../components/ServiceCard";
import RequestCard from "../../components/RequestCard";
import FilterPanel from "../../components/FilterPanel";
import { Button } from "../../components/ui/button";
import heroIllustration from "../../assets/hero_illustration.png";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Home() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  const toImageSrc = useCallback((value) => {
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
  }, [API_BASE_URL]);

  const [tab, setTab] = useState("services");
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [location, setLocation] = useState("all");

  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserName(user.name || user.firstName || "Student");
      } catch {
        setIsLoggedIn(false);
      }
    }
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const requestsRes = await axios.get(`${API_BASE_URL}/api/requests`);
        setRequests(requestsRes.data?.data || requestsRes.data || []);
      } catch (error) {
        console.error("Error fetching requests, falling back to mock:", error);
        setRequests(mockRequests);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchRankedServices = async () => {
      setServicesLoading(true);
      setServicesError("");

      try {
        const params = new URLSearchParams();
        if (selectedCategory !== "All") params.set("category", selectedCategory);
        if (location !== "all") params.set("location", location);
        if (Number(minRating) > 0) params.set("minRating", String(minRating));
        params.set("minPrice", String(priceRange[0] ?? 0));
        params.set("maxPrice", String(priceRange[1] ?? 10000));

        const response = await fetch(`${API_BASE_URL}/api/services/ranked?${params.toString()}`);
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.error || result.message || "Failed to load ranked services.");
        }

        setServices(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error("Error fetching ranked services, falling back to mock:", error);
        setServices(mockServices);
        // Silently handled without explicit UI error for clean visuals
      } finally {
        setServicesLoading(false);
      }
    };

    fetchRankedServices();
  }, [API_BASE_URL, selectedCategory, location, minRating, priceRange]);

  const mappedServices = useMemo(
    () =>
      services.map((s) => ({
        ...s,
        id: s._id || s.id,
        category: s.category || "General",
        price: s.pricePerHour ?? s.price ?? 0,
        location:
          (s.locationMode || s.location || "online")
            .toString()
            .toLowerCase()
            .replace(" ", "-") === "on-campus"
            ? "on-campus"
            : "online",
        rating:
          s.rating ??
          (Array.isArray(s.reviews) && s.reviews.length
            ? s.reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / s.reviews.length
            : 0),
        reviewCount: s.reviewCount ?? (Array.isArray(s.reviews) ? s.reviews.length : 0),
        bookingsCount: s.bookingsCount ?? s.bookingCount ?? 0,
        rankingScore: Number(s.rankingScore || 0),
        provider: {
          name: s?.provider?.name || s?.ownerId?.fullname || "Service Provider",
          verified: Boolean(s?.provider?.verified || s?.ownerId?.verification_status === "verified"),
          avatar: toImageSrc(s?.provider?.avatar || s?.ownerProfilePicture),
        },
      })),
    [services, toImageSrc]
  );

  const filteredServices = useMemo(() => {
    return mappedServices
      .filter((s) => {
        if (!searchQuery) return true;
        const term = searchQuery.toLowerCase();
        return ((s.title && s.title.toLowerCase().includes(term)) || (s.description && s.description.toLowerCase().includes(term)));
      })
      .filter((s) => selectedCategory === "All" || s.category === selectedCategory)
      .filter((s) => s.price >= priceRange[0] && s.price <= priceRange[1])
      .filter((s) => Number(s.rating || 0) >= Number(minRating || 0))
      .filter((s) => location === "all" || s.location === location)
      .sort((a, b) => Number(b.rankingScore || 0) - Number(a.rankingScore || 0));
  }, [mappedServices, selectedCategory, priceRange, minRating, location, searchQuery]);

  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => {
        if (!searchQuery) return true;
        const term = searchQuery.toLowerCase();
        return ((r.title && r.title.toLowerCase().includes(term)) || (r.description && r.description.toLowerCase().includes(term)));
      });
  }, [requests, searchQuery]);

  const trending = useMemo(() => filteredServices.slice(0, 10), [filteredServices]);

  // Keerthi's Trending ML Section
  const TrendingSection = () => (
    <section className="mb-10 w-full pt-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-6 w-6 text-primary" />
        <Sparkles className="h-5 w-5 text-accent" />
        <h2 className="font-display text-xl md:text-2xl font-extrabold text-slate-800">Trending Services</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x snap-mandatory">
        {trending.map((s) => (
          <div key={s.id} className="min-w-[280px] max-w-[320px] shrink-0 snap-start transition-transform hover:-translate-y-1">
            <ServiceCard service={s} />
          </div>
        ))}
      </div>
    </section>
  );

  const ListingsSection = () => (
    <div className="flex flex-col w-full relative pt-4">
      <TrendingSection />
      <div className="flex flex-col lg:flex-row gap-8 w-full border-t border-slate-100 pt-8">
        <>
          <div className="hidden lg:block shrink-0 w-64 xl:w-72">
            <div className="sticky top-24 pt-4">
              <FilterPanel
                open={true}
                onClose={() => {}}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                rating={minRating}
                onRatingChange={setMinRating}
                location={location}
                onLocationChange={setLocation}
                isDesktop
              />
            </div>
          </div>
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 rounded-xl h-12"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <FilterPanel
              open={filterOpen}
              onClose={() => setFilterOpen(false)}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              rating={minRating}
              onRatingChange={setMinRating}
              location={location}
              onLocationChange={setLocation}
            />
          </div>
        </>
        
        <div className="flex-1 min-w-0 pt-4">
          <h2 className="font-display text-2xl font-extrabold text-slate-800 mb-6">Explore Directory</h2>
          {(loading || servicesLoading) ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : tab === "services" ? (
            filteredServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                  <SlidersHorizontal className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No services found</h3>
                <p className="text-slate-500 max-w-sm">Try adjusting your filters or category to see more available services.</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-2 ${isLoggedIn ? "xl:grid-cols-3 2xl:grid-cols-4" : "lg:grid-cols-3 xl:grid-cols-4"} gap-6`}>
                {filteredServices.map((s) => (
                  <ServiceCard key={s._id || s.id} service={s} />
                ))}
              </div>
            )
          ) : (
            filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                  <SlidersHorizontal className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No requests found</h3>
                <p className="text-slate-500 max-w-sm">Try adjusting your category or budget slider to see more requests.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5 w-full">
                {filteredRequests.map((r) => (
                  <RequestCard key={r._id || r.id} request={r} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );

  const TabToggle = () => (
    <div className="flex gap-1 bg-slate-100 rounded-full p-1.5 border border-slate-200 shadow-inner">
      <button
        type="button"
        onClick={() => setTab("services")}
        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
          tab === "services" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Sparkles className="h-4 w-4 text-amber-400" /> Services
      </button>
      <button
        type="button"
        onClick={() => setTab("requests")}
        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
          tab === "requests" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Briefcase className="h-4 w-4 text-rose-500" /> Requests
      </button>
    </div>
  );

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-background font-sans">
        {/* Welcome bar */}
        <div className="border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pb-10">
          <div className="container mx-auto px-5 md:px-10 py-5 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                Welcome back, <span className="text-primary">{userName}</span> 👋
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">Find services or post what you need — your campus marketplace is ready.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/create-service">
                <Button size="sm" className="rounded-full shadow-md shadow-primary/20 gap-2 px-5 font-semibold">
                  <Plus className="h-4 w-4" /> Offer a Service
                </Button>
              </Link>
              <Link to="/post-request">
                <Button variant="outline" size="sm" className="rounded-full gap-2 px-5 bg-white hover:bg-slate-50 border-slate-200 text-primary hover:text-primary font-semibold">
                  <Briefcase className="h-4 w-4" /> Post a Request
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Airbnb Style Advanced Search Pill */}
        <div className="container mx-auto px-5 md:px-10 relative z-20">
          <div className="max-w-4xl mx-auto -mt-8">
            <div className="flex flex-col md:flex-row items-center bg-white rounded-3xl md:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 p-2 md:pl-8">
              <div className="flex flex-col flex-1 w-full px-4 py-2 hover:bg-slate-50 rounded-t-3xl md:rounded-l-full cursor-pointer transition-colors md:border-r border-slate-100 group relative">
                <span className="text-[11px] font-extrabold text-slate-900 tracking-wider uppercase mb-0.5 pointer-events-none">Looking For</span>
                <select 
                  className="text-[15px] font-semibold text-slate-500 bg-transparent outline-none cursor-pointer appearance-none truncate w-full group-hover:text-primary transition-colors"
                  value={tab}
                  onChange={(e) => setTab(e.target.value)}
                >
                  <option value="services">Services</option>
                  <option value="requests">Help Requests</option>
                </select>
              </div>
              <div className="flex flex-col flex-[1.5] w-full px-4 py-2 hover:bg-slate-50 cursor-text transition-colors md:border-r border-slate-100 group">
                <span className="text-[11px] font-extrabold text-slate-900 tracking-wider uppercase mb-0.5 pointer-events-none">Keyword</span>
                <input 
                  type="text" 
                  placeholder="Design, Math, Coding..."
                  className="text-[15px] font-semibold bg-transparent outline-none placeholder:text-slate-400/70 text-slate-700 truncate w-full focus:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-col flex-1 w-full px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors group relative md:rounded-r-full">
                <span className="text-[11px] font-extrabold text-slate-900 tracking-wider uppercase mb-0.5 pointer-events-none">Where</span>
                <select 
                  className="text-[15px] font-semibold text-slate-500 bg-transparent outline-none cursor-pointer appearance-none truncate w-full group-hover:text-primary transition-colors"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="all">Anywhere</option>
                  <option value="online">Online</option>
                  <option value="on-campus">On Campus</option>
                </select>
              </div>
              <div className="shrink-0 mt-2 md:mt-0 p-1 md:pl-2 w-full md:w-auto flex justify-end">
                <div className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 hover:scale-105 cursor-pointer transition-all shadow-md active:scale-95">
                  <Search className="h-6 w-6" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-5 md:px-10 pb-12 mt-8 md:mt-12">
          <ListingsSection />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="bg-gradient-to-br from-primary/[0.03] via-background to-accent/[0.03]">
        <div className="container mx-auto px-5 md:px-10 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase">
                Campus Marketplace
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Unlock student talent,<br className="hidden md:block" /> exactly when you need it
              </h1>
              <p className="text-slate-500 text-lg max-w-lg leading-relaxed">
                The premier dual-role marketplace for students. Offer your skills to earn, or find the perfect peer to help you succeed on campus.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/login">
                  <Button size="lg" className="rounded-full shadow-lg shadow-primary/25 px-8 font-semibold text-[15px] gap-2 bg-[#4a4e69] hover:bg-[#7a879d] text-white">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg" className="rounded-full px-8 bg-white hover:bg-slate-50 border-slate-200 text-primary hover:text-primary font-semibold text-[15px]">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative lg:ml-auto hidden md:block">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
              <img
                src={heroIllustration}
                alt="Students collaborating on campus"
                className="w-full max-w-[520px] h-auto drop-shadow-2xl rounded-2xl object-contain mix-blend-multiply"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-5 md:px-10 py-12">
        <div className="text-center mb-8">
           <h2 className="font-display text-lg font-bold text-slate-900">How UniMarket Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            { step: 1, icon: <Search className="h-6 w-6" />, title: "Discover", desc: "Browse hundreds of skills offered by your peers on campus." },
            { step: 2, icon: <Users className="h-6 w-6" />, title: "Book & Connect", desc: "Request a service, agree on a deadline, and connect instantly." },
            { step: 3, icon: <Shield className="h-6 w-6" />, title: "Succeed Together", desc: "Get the job done securely while building the campus community." }
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-2xl p-7 text-center shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-primary/20">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-base mb-2 text-slate-800">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-5 md:px-10 pb-8">
        <h2 className="font-display text-[15px] font-bold text-slate-600 mb-4 pl-1">Popular Categories</h2>
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x">
          {[
            { icon: <MonitorSmartphone className="w-8 h-8 mb-2 text-slate-600" strokeWidth={1.5} />, name: "Web Design" },
            { icon: <BookOpen className="w-8 h-8 mb-2 text-blue-600" strokeWidth={1.5} />, name: "Tutoring" },
            { icon: <Video className="w-8 h-8 mb-2 text-purple-600" strokeWidth={1.5} />, name: "Video Editing" },
            { icon: <PenTool className="w-8 h-8 mb-2 text-amber-500" strokeWidth={1.5} />, name: "Writing" },
            { icon: <Camera className="w-8 h-8 mb-2 text-emerald-600" strokeWidth={1.5} />, name: "Photography" }
          ].map((cat, i) => (
            <div key={i} className="min-w-[120px] flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-colors snap-start hover:bg-slate-200 bg-slate-100">
              {cat.icon}
              <span className="font-semibold text-xs text-slate-700 text-center">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50/50 border-t border-slate-100">
        <div className="container mx-auto px-5 md:px-10 py-10">
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h2 className="font-display text-xl md:text-2xl font-extrabold text-slate-800">
              Explore Services & Requests
            </h2>
            <TabToggle />
          </div>

          <ListingsSection />

          <div className="mt-12 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-2xl p-8 border border-primary/10">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Ready to join the campus marketplace?</h3>
            <p className="text-slate-500 text-sm mb-5 max-w-md mx-auto">Sign up to offer your skills, post requests, and connect with talented peers on campus.</p>
            <div className="flex justify-center gap-3">
              <Link to="/register">
                <Button className="rounded-full px-6 shadow-md shadow-primary/20 font-semibold gap-2">
                  <Zap className="h-4 w-4" /> Sign Up Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="rounded-full px-6 bg-white font-semibold">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
