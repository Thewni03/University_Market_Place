import { useState } from "react";
import { Star, MapPin, Eye, TrendingUp, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";

export default function ServiceCard({ service }) {
  return (
    <Link to={`/service/${service.id}`} className="block">
      <div className="rounded-xl border border-border bg-card p-5 card-hover group">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className="text-xs font-medium">
            {service.category}
          </Badge>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-primary">{service.rankingScore}</span>
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
              LKR {service.price}
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

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <div
            className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm mx-4 animate-scale-in shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold text-foreground mb-4">
              Ranking Insight
            </h3>

            <div className="space-y-3">
              {factors.map((f) => (
                <div key={f.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="font-medium text-foreground">
                      {f.value}
                      {f.suffix}
                    </span>
                  </div>

                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${Math.min((f.value / f.max) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Final Ranking Score
              </span>
              <span className="text-2xl font-display font-bold text-primary">
                {service.rankingScore}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
              }}
              className="mt-4 w-full py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
