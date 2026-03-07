import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, TrendingUp, Briefcase, Sparkles } from "lucide-react";
import { mockRequests } from "../../data/mockData";
import ServiceCard from "../../components/ServiceCard";
import RequestCard from "../../components/RequestCard";
import FilterPanel from "../../components/FilterPanel";
import { Button } from "../../components/ui/button";

export default function Index() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
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
  const [tab, setTab] = useState("services"); // "services" | "requests"
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 10000]); // LKR 0 - LKR 10000+
  const [minRating, setMinRating] = useState(0);
  const [location, setLocation] = useState("all"); // all | online | on-campus
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true);
      setServicesError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/services`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || result.message || "Failed to load services.");
        }
        setServices(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        setServicesError(error.message || "Unable to load services.");
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, [API_BASE_URL]);

  const mappedServices = useMemo(
    () =>
      services.map((s) => ({
        id: s._id,
        title: s.title,
        category: s.category,
        provider: {
          name: s?.ownerId?.fullname || "Service Provider",
          verified: s?.ownerId?.verification_status === "verified",
          avatar: toImageSrc(s?.ownerProfilePicture),
        },
        rating:
          (Array.isArray(s.reviews) && s.reviews.length > 0
            ? s.reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / s.reviews.length
            : 0),
        reviewCount: Number(s.reviewCount ?? (Array.isArray(s.reviews) ? s.reviews.length : 0)),
        bookingsCount: 0,
        price: s.pricePerHour ?? 0,
        location: (s.locationMode || "online").toLowerCase(),
        rankingScore: 0,
        views: Number(s.viewCount || 0),
        clicks: 0,
        createdAt: s.createdAt,
      })),
    [services, API_BASE_URL]
  );

  const filteredServices = useMemo(
    () =>
      mappedServices.filter((s) => {
        const categoryOk = selectedCategory === "All" || s.category === selectedCategory;
        const price = Number(s.price || 0);
        const minPrice = Number(priceRange[0] || 0);
        const maxPrice = Number(priceRange[1] || 0);
        const priceOk = price >= minPrice && (maxPrice === 10000 ? true : price <= maxPrice);
        const ratingOk = Number(s.rating || 0) >= Number(minRating || 0);
        const locationOk =
          location === "all" ? true : String(s.location || "").toLowerCase() === location;
        return categoryOk && priceOk && ratingOk && locationOk;
      }),
    [mappedServices, selectedCategory, priceRange, minRating, location]
  );

  const trending = useMemo(
    () =>
      [...filteredServices]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 3),
    [filteredServices]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <div className="gradient-hero py-10 md:py-14">
        <div className="container text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
            Campus Services Marketplace
          </h1>
          <p className="text-primary-foreground/80 text-sm md:text-base max-w-md mx-auto">
            Find verified student services or post what you need — powered by smart ranking
          </p>
        </div>
      </div>

      <div className="page-container py-4">
        {servicesError && (
          <div className="mb-4 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
            {servicesError}
          </div>
        )}

        {/* Trending carousel */}
        <section className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Trending Services
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {trending.map((s) => (
              <div key={s.id} className="min-w-[280px] max-w-[320px] shrink-0">
                <ServiceCard service={s} />
              </div>
            ))}
          </div>
        </section>

        {/* Tabs + filter toggle */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-1 rounded-lg p-0.5 bg-secondary/80 border border-border">
            <button
              type="button"
              onClick={() => setTab("services")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                tab === "services"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/60"
              }`}
            >
              <TrendingUp className="h-4 w-4" /> Services
            </button>

            <button
              type="button"
              onClick={() => setTab("requests")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                tab === "requests"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/60"
              }`}
            >
              <Briefcase className="h-4 w-4" /> Requests
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

        {/* Content with sidebar */}
        <div className="flex gap-4">
          {tab === "services" && (
            <>
              {/* Desktop sidebar */}
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

              {/* Mobile drawer */}
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
                {servicesLoading && (
                  <div className="col-span-full rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                    Loading services...
                  </div>
                )}
                {!servicesLoading && filteredServices.length === 0 && (
                  <div className="col-span-full rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                    No services found.
                  </div>
                )}
                {!servicesLoading &&
                  filteredServices.map((s) => <ServiceCard key={s.id} service={s} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockRequests.map((r) => (
                  <RequestCard key={r.id} request={r} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
