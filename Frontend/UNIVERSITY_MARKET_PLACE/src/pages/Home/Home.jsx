import { useState } from "react";
import { SlidersHorizontal, TrendingUp, Briefcase, Sparkles } from "lucide-react";
import { mockServices, mockRequests } from "../../data/mockData";
import ServiceCard from "../../components/ServiceCard";
import RequestCard from "../../components/RequestCard";
import FilterPanel from "../../components/FilterPanel";
import { Button } from "../../components/ui/button";

export default function Index() {
  const [tab, setTab] = useState("services"); // "services" | "requests"
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const trending = [...mockServices]
    .sort((a, b) => b.rankingScore - a.rankingScore)
    .slice(0, 3);

  return (
    <div className="page-container">
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

      <div className="container py-6">
        {/* Trending carousel */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Trending Services
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {trending.map((s) => (
              <div key={s.id} className="min-w-[280px] max-w-[320px] shrink-0">
                <ServiceCard service={s} />
              </div>
            ))}
          </div>
        </section>

        {/* Tabs + filter toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <button
              type="button"
              onClick={() => setTab("services")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                tab === "services"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-4 w-4" /> Services
            </button>

            <button
              type="button"
              onClick={() => setTab("requests")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                tab === "requests"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Briefcase className="h-4 w-4" /> Requests
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
          </Button>
        </div>

        {/* Content with sidebar */}
        <div className="flex gap-6">
          {tab === "services" && (
            <>
              {/* Desktop sidebar */}
              <div className="hidden lg:block shrink-0 w-72">
                <FilterPanel
                  open={true}
                  onClose={() => {}}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  isDesktop
                />
              </div>

              {/* Mobile drawer */}
              <FilterPanel
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </>
          )}

          <div className="flex-1 min-w-0">
            {tab === "services" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {mockServices
                  .filter(
                    (s) => selectedCategory === "All" || s.category === selectedCategory
                  )
                  .sort((a, b) => b.rankingScore - a.rankingScore)
                  .map((s) => (
                    <ServiceCard key={s.id} service={s} />
                  ))}
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