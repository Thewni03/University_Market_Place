import { useState } from "react";
import { Star, MapPin, Eye, TrendingUp, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";

export default function ServiceCard({ service }) {
  // Generate a consistent but distinct gradient based on category string
  const gradients = {
    'Web Design': 'from-blue-500 to-cyan-400',
    'Tutoring': 'from-indigo-500 to-purple-500',
    'Video Editing': 'from-rose-500 to-pink-500',
    'Writing': 'from-amber-500 to-orange-400',
    'Photography': 'from-emerald-500 to-teal-400',
    'Default': 'from-slate-700 to-slate-500'
  };
  
  const bgGradient = gradients[service.category] || gradients['Default'];

  return (
    <Link to={`/service/${service._id || service.id}`} className="block h-full">
      <div className="flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
        
        {/* Thumbnail Header */}
        <div className={`relative h-40 w-full bg-gradient-to-br ${bgGradient}`}>
          {service.workSamples?.[0]?.url && (
            <img 
              src={service.workSamples[0].url} 
              alt={service.title} 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 group-hover:scale-105 transition-transform duration-500" 
            />
          )}
          
          {/* Overlays */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/95 text-slate-800 hover:bg-white shadow-sm border-0 font-bold backdrop-blur-md">
              {service.category}
            </Badge>
          </div>
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm border border-white/10">
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-bold text-xs text-white">{service.rankingScore}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-3">
            <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center text-[10px] font-bold text-white shadow-inner`}>
              {(service.provider?.name || "U").split(" ").map((n) => n?.[0] || "").join("").substring(0, 2)}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground font-medium">
                {service.provider?.name || "Unknown Provider"}
              </span>
              {service.provider?.verified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
            </div>
          </div>

          <h3 className="font-display text-[17px] font-bold text-slate-800 leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2 flex-grow">
            {service.title}
          </h3>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 font-medium">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-slate-800 font-bold">{service.rating || 'New'}</span>
              {(service.reviewCount > 0) && <span>({service.reviewCount})</span>}
            </div>

            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-slate-400" />
              <span>{service.bookingsCount || 0} booked</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between pt-4 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="h-4 w-4" />
              <span className="capitalize">{service.location || service.locationMode || 'Online'}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">Starting at</span>
              <div className="text-lg font-black text-slate-900 leading-none mt-1">
                Rs {service.pricePerHour || service.price}
              </div>
            </div>
          </div>
          
          {/* Why shown popover component below... */}
          <div className="mt-3 text-center">
            <WhyShownLink service={service} />
          </div>
        </div>
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