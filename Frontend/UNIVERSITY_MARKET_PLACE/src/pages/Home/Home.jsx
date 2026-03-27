import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, Briefcase, Sparkles, TrendingUp, MonitorSmartphone, BookOpen, Video, PenTool, Camera, Loader2 } from "lucide-react";
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [location, setLocation] = useState("all");

  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");

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
        params.set("limit", "60");

        const response = await fetch(
          `${API_BASE_URL}/api/services/ranked?${params.toString()}`
        );
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.error || result.message || "Failed to load ranked services.");
        }

        setServices(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error("Error fetching ranked services, falling back to mock:", error);
        setServices(mockServices);
        setServicesError("Showing fallback services. Ranked API is currently unavailable.");
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
      .filter((s) => selectedCategory === "All" || s.category === selectedCategory)
      .filter((s) => s.price >= priceRange[0] && s.price <= priceRange[1])
      .filter((s) => Number(s.rating || 0) >= Number(minRating || 0))
      .filter((s) => location === "all" || s.location === location)
      .sort((a, b) => Number(b.rankingScore || 0) - Number(a.rankingScore || 0));
  }, [mappedServices, selectedCategory, priceRange, minRating, location]);

  const trending = useMemo(() => filteredServices.slice(0, 10), [filteredServices]);

  return (
    <div className="min-h-screen p-5 md:p-10 bg-background font-sans">
      <div className="container mx-auto py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest mb-2 uppercase">
              CAMPUS MARKETPLACE
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Unlock student talent,<br className="hidden md:block" /> exactly when you<br className="hidden md:block" /> need it
            </h1>
            <p className="text-slate-500 text-lg max-w-lg leading-relaxed pt-2 pb-4">
              The premier dual-role marketplace for students. Offer your skills to earn, or find the perfect peer to help you succeed on campus.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/create-service">
                <Button size="lg" className="rounded-full px-8 font-semibold text-[15px] bg-[#4a4e69] hover:bg-[#7a879d] text-white shadow-lg shadow-[#4a4e69]/30">
                  Offer a Service
                </Button>
              </Link>
              <Link to="/post-request">
                <Button variant="outline" size="lg" className="rounded-full px-8 bg-white hover:bg-slate-50 border-slate-200 text-primary hover:text-primary font-semibold text-[15px]">
                  Post a Request
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative lg:ml-auto">
            <div className="absolute inset-0 bg-primary/5 rounded-3xl transform rotate-3 scale-105 -z-10" />
            <img
              src={heroIllustration}
              alt="Students collaborating on campus"
              className="w-full max-w-[600px] h-auto drop-shadow-2xl rounded-2xl object-contain mix-blend-multiply"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto py-12">
        <div className="mb-24">
          <div className="text-center mb-10">
            <h2 className="font-display text-lg font-bold text-slate-900">How UniMarket Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-primary/20">
              <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md shadow-primary/30">1</div>
              <h3 className="font-bold text-lg mb-3 text-slate-800">Discover</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-2">Browse through hundreds of skills offered by your peers on campus.</p>
            </div>
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-primary/20">
              <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md shadow-primary/30">2</div>
              <h3 className="font-bold text-lg mb-3 text-slate-800">Book & Connect</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-2">Request a service, agree on a deadline, and connect instantly.</p>
            </div>
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-primary/20">
              <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md shadow-primary/30">3</div>
              <h3 className="font-bold text-lg mb-3 text-slate-800">Succeed Together</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-2">Get the job done securely while building the campus community.</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="mb-6 text-center font-display text-[17px] font-bold text-slate-600">Popular Categories</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x md:justify-center">
            {[
              { icon: <MonitorSmartphone className="w-10 h-10 mb-3 text-slate-600 drop-shadow-sm" strokeWidth={1.5} />, name: "Web Design", color: "bg-slate-200" },
              { icon: <BookOpen className="w-10 h-10 mb-3 text-blue-600 drop-shadow-sm" strokeWidth={1.5} />, name: "Tutoring", color: "bg-slate-200" },
              { icon: <Video className="w-10 h-10 mb-3 text-purple-600 drop-shadow-sm" strokeWidth={1.5} />, name: "Video Editing", color: "bg-slate-200" },
              { icon: <PenTool className="w-10 h-10 mb-3 text-amber-500 drop-shadow-sm" strokeWidth={1.5} />, name: "Writing", color: "bg-slate-200" },
              { icon: <Camera className="w-10 h-10 mb-3 text-emerald-600 drop-shadow-sm" strokeWidth={1.5} />, name: "Photography", color: "bg-slate-200" },
            ].map((cat, i) => (
              <div key={i} className={`min-w-[150px] flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer transition-colors snap-start hover:bg-slate-300 ${cat.color}`}>
                {cat.icon}
                <span className="font-bold text-sm text-slate-800 text-center">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container py-4">
        {servicesError && (
          <div className="mb-4 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
            {servicesError}
          </div>
        )}

        <section className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-foreground">Trending Services</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
            {trending.map((s) => (
              <div key={s.id} className="min-w-[280px] max-w-[320px] shrink-0 snap-start">
                <ServiceCard service={s} />
              </div>
            ))}
          </div>
        </section>

        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-center max-w-4xl mx-auto gap-8 pt-8">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-800">Explore Global Activity</h2>

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

          <Button
            variant="outline"
            size="sm"
            className="lg:hidden hover:bg-card hover:text-foreground"
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
          </Button>
        </div>

        <div className="flex gap-4">
          {tab === "services" && (
            <>
              <div className="hidden lg:block shrink-0 w-72">
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
            </>
          )}

          <div className="flex-1 min-w-0">
            {tab === "services" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {(loading || servicesLoading) && (
                  <div className="col-span-full rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading services...
                  </div>
                )}
                {!loading && !servicesLoading && filteredServices.length === 0 && (
                  <div className="col-span-full rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                    No services found.
                  </div>
                )}
                {!loading && !servicesLoading &&
                  filteredServices.map((s) => <ServiceCard key={s.id} service={s} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {requests.map((r) => (
                  <RequestCard key={r._id || r.id} request={r} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
