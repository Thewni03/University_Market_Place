import { useState } from "react";
import { createPortal } from "react-dom";
import { Star, MapPin, Eye, TrendingUp, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";

export default function ServiceCard({ service }) {
  return (
    <Link to={`/service/${service._id || service.id}`} className="block">
      <div className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_3px_0_hsl(0_0%_0%_/_0.04),_0_1px_2px_-1px_hsl(0_0%_0%_/_0.04)] hover:shadow-[0_10px_25px_-5px_hsl(152_60%_42%_/_0.08),_0_4px_10px_-4px_hsl(0_0%_0%_/_0.04)] group transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className="text-xs font-medium">
            {service.category}
          </Badge>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-primary">
              {Number(service.rankingScore || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <h3 className="font-display text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {service.title}
        </h3>

        {/* Provider */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-xs font-semibold text-primary">
            {service.provider?.avatar ? (
              <img
                src={service.provider.avatar}
                alt={service.provider?.name || "Provider"}
                className="h-full w-full object-cover"
              />
            ) : (
              (service.provider?.name || "U")
                .split(" ")
                .map((n) => n?.[0] || "")
                .join("")
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-sm text-foreground font-medium">
              {service.provider?.name}
            </span>
            {service.provider?.verified && (
              <BadgeCheck className="h-4 w-4 text-primary" />
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-accent fill-accent" />
            <span className="font-medium text-foreground">{service.rating}</span>
            <span>({service.reviewCount})</span>
          </div>

          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{service.bookingsCount} booked</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="capitalize">{service.location}</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-foreground">
              LKR {service.pricePerHour || service.price}
            </span>
            <span className="text-xs text-muted-foreground">/hr</span>
          </div>
        </div>

        {/* Why shown link */}
        <WhyShownLink service={service} />
      </div>
    </Link>
  );
}

function WhyShownLink({ service }) {
  const [open, setOpen] = useState(false);

  const clickThrough = service?.views
    ? Math.round((service.clicks / service.views) * 100)
    : 0;

  const factors = [
    { label: "Bookings", value: service.bookingsCount, max: 200, suffix: "" },
    { label: "Rating", value: (service.rating || 0) * 20, max: 100, suffix: "%" },
    { label: "Click-through", value: clickThrough, max: 100, suffix: "%" },
    { label: "Category match", value: 85, max: 100, suffix: "%" },
    { label: "Location match", value: 70, max: 100, suffix: "%" },
  ];

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="mt-3 text-xs text-primary/70 hover:text-primary hover:underline transition-colors"
      >
        Why shown?
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <div
              className="w-full max-w-sm mx-4 rounded-2xl border border-emerald-400/20 bg-slate-900 p-6 text-slate-100 shadow-2xl shadow-black/40 animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 font-display text-lg font-bold text-white">
                Ranking Insight
              </h3>

              <div className="space-y-3">
                {factors.map((f) => (
                  <div key={f.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{f.label}</span>
                      <span className="font-medium text-white">
                        {f.value}
                        {f.suffix}
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-700/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all"
                        style={{
                          width: `${Math.min((f.value / f.max) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-700 pt-4">
                <span className="text-sm text-slate-300">
                  Final Ranking Score
                </span>
                <span className="text-2xl font-display font-bold text-emerald-300">
                  {Number(service.rankingScore || 0).toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="mt-4 w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
