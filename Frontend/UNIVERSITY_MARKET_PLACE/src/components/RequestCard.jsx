import { Calendar, DollarSign } from "lucide-react";
import { Badge } from "./ui/badge";

export default function RequestCard({ request }) {
  const isExpired =
    request?.expired || new Date(request?.deadline) < new Date();

  return (
    <div className="rounded-xl border border-border bg-card p-5 card-hover relative">
      {isExpired && (
        <Badge variant="destructive" className="absolute top-4 right-4 text-xs">
          Expired
        </Badge>
      )}

      <Badge variant="secondary" className="text-xs font-medium mb-3">
        {request.category}
      </Badge>

      <h3 className="font-display text-base font-semibold text-foreground mb-2">
        {request.title}
      </h3>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {request.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">${request.budget}</span>
          <span>budget</span>
        </div>

        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {request.deadline
              ? new Date(request.deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "—"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-semibold text-accent">
            {(request?.postedBy?.name || "U")
              .split(" ")
              .map((n) => n?.[0] || "")
              .join("")}
          </div>
          <span className="text-sm text-muted-foreground">
            {request?.postedBy?.name}
          </span>
        </div>

        {!isExpired && (
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
          >
            View
          </button>
        )}
      </div>
    </div>
  );
}