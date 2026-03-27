import React from "react";

export default function StatsCard({
  icon,
  label,
  value,
  change,
  positive,
  iconToneClass = "bg-primary/10 text-primary",
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 card-hover">
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconToneClass}`}>
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>

      <p className="text-2xl font-display font-bold text-foreground">{value}</p>

      {change && (
        <p
          className={`text-xs mt-1 font-medium ${
            positive ? "text-success" : "text-destructive"
          }`}
        >
          {change}
        </p>
      )}
    </div>
  );
}
