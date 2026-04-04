import { Star } from "lucide-react";

export default function ReviewCard({ review }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-xs font-semibold text-primary">
            {review?.avatar ? (
              <img
                src={review.avatar}
                alt={review?.author || "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              (review?.author || "U").split(" ").map((n) => n[0]).join("")
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{review?.author || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">
              {review?.date
                ? new Date(review.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < (review?.rating || 0)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{review?.comment || ""}</p>
    </div>
  );
}
