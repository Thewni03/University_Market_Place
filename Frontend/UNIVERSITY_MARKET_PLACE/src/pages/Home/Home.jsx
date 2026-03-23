import { useState, useEffect } from "react";
import {
  SlidersHorizontal, Briefcase, Sparkles,
  MonitorSmartphone, BookOpen, Video, PenTool, Camera,
  Loader2, ArrowRight, Search, Plus, Zap, Users, Shield
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
  const [tab, setTab] = useState("services");
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [rating, setRating] = useState(0);
  const [location, setLocation] = useState("all");

  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check login state from localStorage (Thewni's login stores token + user)
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
    const fetchData = async () => {
      try {
        const [servicesRes, requestsRes] = await Promise.all([
          axios.get("http://localhost:5001/api/services"),
          axios.get("http://localhost:5001/api/requests"),
        ]);
        setServices(servicesRes.data.data || []);
        setRequests(requestsRes.data || []);
      } catch (error) {
        console.error("Error fetching data, falling back to mock:", error);
        setServices(mockServices);
        setRequests(mockRequests);
        
        const calcMax = Math.max(...mockServices.map(s => s.pricePerHour || s.price || 0), 1000);
        setMaxPrice(calcMax);
        setPriceRange([0, calcMax]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Set maxPrice on successful DB fetch
  useEffect(() => {
    if (services.length > 0 && services !== mockServices) {
      const calcMax = Math.max(...services.map(s => s.pricePerHour || s.price || 0), 1000);
      setMaxPrice(calcMax);
      setPriceRange([0, calcMax]);
    }
  }, [services]);

  // ── Filtered services logic ──
  const filteredServices = services
    .filter((s) => selectedCategory === "All" || s.category === selectedCategory)
    .filter((s) => {
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      return (
        (s.title && s.title.toLowerCase().includes(term)) || 
        (s.description && s.description.toLowerCase().includes(term))
      );
    })
    .filter((s) => {
      const p = s.pricePerHour || s.price || 0;
      if (priceRange[1] >= maxPrice) return p >= priceRange[0];
      return p >= priceRange[0] && p <= priceRange[1];
    })
    .filter((s) => (s.rating || 0) >= rating)
    .filter((s) => {
      if (location === "all") return true;
      const loc = (s.location || s.locationMode || s.availability || "").toLowerCase();
      if (location === "online") return loc.includes("online");
      if (location === "on-campus") return loc.includes("on-campus") || loc.includes("on campus");
      return true;
    })
    .sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0));

  // ── Filtered requests logic ──
  const filteredRequests = requests
    .filter((r) => selectedCategory === "All" || r.category === selectedCategory)
    .filter((r) => {
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      return (
        (r.title && r.title.toLowerCase().includes(term)) || 
        (r.description && r.description.toLowerCase().includes(term))
      );
    })
    .filter((r) => {
      const p = r.budget || 0;
      if (priceRange[1] >= maxPrice) return p >= priceRange[0];
      return p >= priceRange[0] && p <= priceRange[1];
    });

  // ── Shared listings section (used in both views) ──
  const ListingsSection = () => (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full relative">
      <>
        {/* Desktop sidebar */}
        <div className="hidden lg:block shrink-0 w-64 xl:w-72">
          <div className="sticky top-24 pt-4">
            <FilterPanel
              open={true}
              onClose={() => {}}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              rating={rating}
              setRating={setRating}
              location={location}
              setLocation={setLocation}
              maxPrice={maxPrice}
              isDesktop
            />
          </div>
        </div>

        {/* Mobile filter toggle */}
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
            setPriceRange={setPriceRange}
            rating={rating}
            setRating={setRating}
            location={location}
            setLocation={setLocation}
            maxPrice={maxPrice}
          />
        </div>
      </>

      <div className="flex-1 min-w-0 pt-4">
        {loading ? (
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
              <p className="text-slate-500 max-w-sm">
                Try adjusting your filters or category to see more available services.
              </p>
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
              <p className="text-slate-500 max-w-sm">
                Try adjusting your category or budget slider to see more requests.
              </p>
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
  );

  // ── Tab toggle (shared) ──
  const TabToggle = () => (
    <div className="flex gap-1 bg-slate-100 rounded-full p-1.5 border border-slate-200 shadow-inner">
      <button
        type="button"
        onClick={() => setTab("services")}
        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
          tab === "services"
            ? "bg-white text-slate-800 shadow-sm"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Sparkles className="h-4 w-4 text-amber-400" /> Services
      </button>
      <button
        type="button"
        onClick={() => setTab("requests")}
        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
          tab === "requests"
            ? "bg-white text-slate-800 shadow-sm"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Briefcase className="h-4 w-4 text-rose-500" /> Requests
      </button>
    </div>
  );

  // ══════════════════════════════════════════════
  //  LOGGED-IN VIEW — listings-first, no fluff
  // ══════════════════════════════════════════════
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
              <p className="text-sm text-slate-500 mt-0.5">
                Find services or post what you need — your campus marketplace is ready.
              </p>
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
              
              {/* Segment 1: What */}
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

              {/* Segment 2: Keyword Search */}
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

              {/* Segment 3: Location */}
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

              {/* Search Button */}
              <div className="shrink-0 mt-2 md:mt-0 p-1 md:pl-2 w-full md:w-auto flex justify-end">
                <div className="h-14 w-14 md:h-14 md:w-14 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 hover:scale-105 cursor-pointer transition-all shadow-md active:scale-95">
                  <Search className="h-6 w-6" strokeWidth={2.5} />
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="container mx-auto px-5 md:px-10 pb-12 mt-8 md:mt-12">
          <ListingsSection />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  //  LOGGED-OUT VIEW — marketing + preview
  // ══════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero section — compact */}
      <div className="bg-gradient-to-br from-primary/[0.03] via-background to-accent/[0.03]">
        <div className="container mx-auto px-5 md:px-10 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase">
                Campus Marketplace
              </div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Unlock student talent,<br className="hidden md:block" /> exactly when you need it
              </h1>
              <p className="text-slate-500 text-base md:text-lg max-w-lg leading-relaxed">
                The premier dual-role marketplace for students. Offer your skills to earn, or find the perfect peer to help you succeed on campus.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/login">
                  <Button size="lg" className="rounded-full shadow-lg shadow-primary/25 px-8 font-semibold text-[15px] gap-2">
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

      {/* How UniMarket Works — compact */}
      <div className="container mx-auto px-5 md:px-10 py-12">
        <div className="text-center mb-8">
          <h2 className="font-display text-lg font-bold text-slate-900">
            How UniMarket Works
          </h2>
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

      {/* Popular Categories — compact horizontal */}
      <div className="container mx-auto px-5 md:px-10 pb-8">
        <h2 className="font-display text-[15px] font-bold text-slate-600 mb-4 pl-1">
          Popular Categories
        </h2>
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

      {/* Explore — listings preview */}
      <div className="bg-slate-50/50 border-t border-slate-100">
        <div className="container mx-auto px-5 md:px-10 py-10">
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h2 className="font-display text-xl md:text-2xl font-extrabold text-slate-800">
              Explore Services & Requests
            </h2>
            <TabToggle />
          </div>

          <ListingsSection />

          {/* CTA to sign up */}
          <div className="mt-12 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-2xl p-8 border border-primary/10">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Ready to join the campus marketplace?
            </h3>
            <p className="text-slate-500 text-sm mb-5 max-w-md mx-auto">
              Sign up to offer your skills, post requests, and connect with talented peers on campus.
            </p>
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