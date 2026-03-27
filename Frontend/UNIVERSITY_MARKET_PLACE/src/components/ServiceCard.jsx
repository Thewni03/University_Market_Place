import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Star, MapPin, Eye, TrendingUp, BadgeCheck, CalendarCheck2, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";

export default function ServiceCard({ service }) {
  const price = Number(service.pricePerHour || service.price || 0);
  const score = Number(service.rankingScore || 0).toFixed(2);
  const views = Number(service.viewCount ?? service.viewsCount ?? service.views ?? 0);
  const bookings = Number(service.bookingsCount ?? service.bookingCount ?? 0);

  return (
    <Link to={`/service/${service._id || service.id}`} className="block">
      <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white via-white to-slate-50/70 p-5 shadow-[0_2px_10px_hsl(220_14%_10%_/_0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_-14px_hsl(218_32%_18%_/_0.35)]">

        <div className="relative mb-4 flex items-start justify-between gap-3">
          <Badge variant="secondary" className="border border-[#4a4e69]/20 bg-[#4a4e69]/10 text-[11px] font-semibold text-[#2f3248]">
            {service.category}
          </Badge>

          <div className="inline-flex items-center gap-1 rounded-full border border-[#013a63]/25 bg-gradient-to-r from-[#013a63]/15 to-[#0ea5a2]/15 px-2.5 py-1 text-[11px] font-bold text-[#013a63]">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{score}</span>
          </div>
        </div>

        <h3 className="mb-2 line-clamp-2 font-display text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#013a63]">
          {service.title}
        </h3>

        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#4a4e69]/20 to-[#013a63]/15 text-xs font-semibold text-[#2f3248] ring-2 ring-white shadow-sm">
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

          <div className="flex min-w-0 items-center gap-1">
            <span className="truncate text-sm font-semibold text-slate-800">
              {service.provider?.name}
            </span>
            {service.provider?.verified && (
              <BadgeCheck className="h-4 w-4 text-[#4a4e69]" />
            )}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
          <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-800">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-amber-900">{service.rating}</span>
            <span>({service.reviewCount})</span>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-sky-800">
            <Eye className="h-3.5 w-3.5" />
            <span>{views} views</span>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800">
            <CalendarCheck2 className="h-3.5 w-3.5" />
            <span>{bookings} booked</span>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-violet-800 capitalize">
            <MapPin className="h-3.5 w-3.5" />
            <span>{service.location}</span>
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-slate-200 pt-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Starting At
            </p>
            <p className="font-display text-xl font-bold text-slate-900">
              LKR {price.toLocaleString()}
              <span className="ml-1 text-xs font-medium text-slate-500">/hr</span>
            </p>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-[#013a63] px-3 py-1.5 text-xs font-semibold text-white transition-all group-hover:translate-x-0.5 group-hover:bg-[#4a4e69]">
            View Details
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <WhyShownLink service={service} />
      </div>
    </Link>
  );
}

function WhyShownLink({ service }) {
  const [open, setOpen] = useState(false);

  const totalViews = Number(service?.viewCount ?? service?.viewsCount ?? service?.views ?? 0);
  const totalClicks = Number(service?.clicks || 0);

  const clickThrough = totalViews > 0
    ? Math.round((totalClicks / totalViews) * 100)
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
