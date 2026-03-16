import { useState, useEffect } from "react";
import { SlidersHorizontal, Briefcase, Sparkles, MonitorSmartphone, BookOpen, Video, PenTool, Camera, Loader2 } from "lucide-react";
import { mockServices, mockRequests } from "../../data/mockData";
import ServiceCard from "../../components/ServiceCard";
import RequestCard from "../../components/RequestCard";
import FilterPanel from "../../components/FilterPanel";
import { Button } from "../../components/ui/button";
import heroIllustration from "../../assets/hero_illustration.png";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Home() {
  const [tab, setTab] = useState("services"); // "services" | "requests"
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen p-5 md:p-10 bg-background font-sans">
      {/* Hero section */}
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
                <Button size="lg" className="rounded-full shadow-lg shadow-primary/25 px-8 font-semibold text-[15px]">
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
            <div className="absolute inset-0 bg-primary/5 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
            <img
              src={heroIllustration}
              alt="Students collaborating on campus"
              className="w-full max-w-[600px] h-auto drop-shadow-2xl rounded-2xl object-contain mix-blend-multiply"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto py-12">
        {/* How UniMarket Works */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <h2 className="font-display text-lg font-bold text-slate-900">
              How UniMarket Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-primary/20">
              <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md shadow-primary/30">
                1
              </div>
              <h3 className="font-bold text-lg mb-3 text-slate-800">Discover</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-2">
                Browse through hundreds of skills offered by your peers on campus.
              </p>
            </div>
            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-primary/20">
              <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md shadow-primary/30">
                2
              </div>
              <h3 className="font-bold text-lg mb-3 text-slate-800">Book & Connect</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-2">
                Request a service, agree on a deadline, and connect instantly.
              </p>
            </div>
            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-primary/20">
              <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md shadow-primary/30">
                3
              </div>
              <h3 className="font-bold text-lg mb-3 text-slate-800">Succeed Together</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-2">
                Get the job done securely while building the campus community.
              </p>
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="mb-16">
          <h2 className="font-display text-[17px] font-bold text-slate-600 mb-6 pl-2">
            Popular Categories
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {[
              { icon: <MonitorSmartphone className="w-10 h-10 mb-3 text-slate-600 drop-shadow-sm" strokeWidth={1.5} />, name: "Web Design", color: "bg-slate-200" },
              { icon: <BookOpen className="w-10 h-10 mb-3 text-blue-600 drop-shadow-sm" strokeWidth={1.5} />, name: "Tutoring", color: "bg-slate-200" },
              { icon: <Video className="w-10 h-10 mb-3 text-purple-600 drop-shadow-sm" strokeWidth={1.5} />, name: "Video Editing", color: "bg-slate-200" },
              { icon: <PenTool className="w-10 h-10 mb-3 text-amber-500 drop-shadow-sm" strokeWidth={1.5} />, name: "Writing", color: "bg-slate-200" },
              { icon: <Camera className="w-10 h-10 mb-3 text-emerald-600 drop-shadow-sm" strokeWidth={1.5} />, name: "Photography", color: "bg-slate-200" }
            ].map((cat, i) => (
              <div
                key={i}
                className={`min-w-[150px] flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer transition-colors snap-start hover:bg-slate-300 ${cat.color}`}
              >
                {cat.icon}
                <span className="font-bold text-sm text-slate-800 text-center">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Explore Global Activity */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-center max-w-4xl mx-auto gap-8 pt-8">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-800">
            Explore Global Activity
          </h2>

          <div className="flex gap-1 bg-slate-100 rounded-full p-1.5 border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => setTab("services")}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === "services"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <Sparkles className="h-4 w-4 text-amber-400" /> Services
            </button>

            <button
              type="button"
              onClick={() => setTab("requests")}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === "requests"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <Briefcase className="h-4 w-4 text-rose-500" /> Requests
            </button>
          </div>
        </div>

        {/* Content with sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {tab === "services" && (
            <>
              {/* Desktop sidebar */}
              <div className="hidden lg:block shrink-0 w-64 xl:w-72">
                <div className="sticky top-24 pt-4">
                  <FilterPanel
                    open={true}
                    onClose={() => { }}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
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
                />
              </div>
            </>
          )}

          <div className="flex-1 min-w-0 pt-4">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : tab === "services" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {services
                  .filter(
                    (s) => selectedCategory === "All" || s.category === selectedCategory
                  )
                  .sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0))
                  .map((s) => (
                    <ServiceCard key={s._id || s.id} service={s} />
                  ))}
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