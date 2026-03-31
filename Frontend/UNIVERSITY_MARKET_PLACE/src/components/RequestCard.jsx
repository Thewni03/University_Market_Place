import React from "react";

import { Calendar, DollarSign } from "lucide-react";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";

function getRelativeTime(dateInput) {
  if (!dateInput) return "Recently";
  const now = new Date();
  const past = new Date(dateInput);
  const diffInMs = now - past;
  const diffInMinutes = Math.floor(diffInMs / 60000);
  if (diffInMinutes < 60) return `${Math.max(1, diffInMinutes)}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return `1 day ago`;
  if (diffInDays < 30) return `${diffInDays} days ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} mo ago`;
}

export default function RequestCard({ request }) {
  const isExpired = request?.expired || new Date(request?.deadline) < new Date();

  return (
    <Link to={`/request/${request._id || request.id}`} className="block">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group flex flex-col md:flex-row gap-6 relative overflow-hidden">
        
        {/* Left Side: Avatar/Icon */}
        <div className="hidden sm:flex shrink-0 pt-1">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-100 to-primary/10 flex items-center justify-center text-xl font-bold text-primary shadow-inner">
            {(request?.postedBy?.name || "U").substring(0, 1).toUpperCase()}
          </div>
        </div>

        {/* Middle: Content */}
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-semibold text-slate-500">
              {request?.postedBy?.name || "Anonymous Student"}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
              {getRelativeTime(request.createdAt)}
            </span>
          </div>

          <h3 className="font-display text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
            {request.title}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0">
              {request.category}
            </Badge>
            {isExpired && (
              <Badge variant="destructive" className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-0">
                Expired
              </Badge>
            )}
          </div>

          <p className="text-sm md:text-base text-slate-600 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-2xl">
            {request.description}
          </p>
        </div>

        {/* Right Side: Stats & Action */}
        <div className="shrink-0 flex flex-col items-start md:items-end justify-between md:pl-6 md:border-l border-slate-100 min-w-[160px]">
          <div className="w-full">
            <div className="text-left md:text-right mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Budget</span>
              <div className="flex items-center md:justify-end gap-1 text-2xl font-black text-emerald-600">
                <span className="text-lg">Rs</span>{request.budget}
              </div>
            </div>

            <div className="flex items-center md:justify-end gap-1.5 text-sm font-medium text-amber-600 mb-4 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
              <Calendar className="h-4 w-4" />
              <span>
                {request.deadline
                  ? new Date(request.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "No deadline"}
              </span>
            </div>
          </div>

          <button className="w-full bg-slate-900 group-hover:bg-primary text-white py-2.5 px-4 rounded-xl font-semibold transition-colors shadow-sm text-sm">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}