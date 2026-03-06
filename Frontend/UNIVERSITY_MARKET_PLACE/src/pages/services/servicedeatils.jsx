import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Eye, BarChart3, ArrowLeft, CalendarDays } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

import SlotPicker from "../../components/Slotpicker";
import ReviewCard from "../../components/ReviewCard";

export default function ServiceDetail() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
  const { id } = useParams();

  const currentUserId =
    localStorage.getItem("userId") ||
    import.meta.env.VITE_PROFILE_USER_ID ||
    "69a7cbb4f893c9e5eb3f479b";

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedWorkSampleSrc, setSelectedWorkSampleSrc] = useState("");

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const loadService = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/services/${id}?ownerId=${encodeURIComponent(currentUserId)}`
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to load service.");
      }
      setService(result.data || null);
    } catch (err) {
      setError(err.message || "Unable to load service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadService();
  }, [API_BASE_URL, id]);

  const availableSlots = useMemo(() => {
    if (!service?.availabilitySlots) return [];

    const groups = {};
    for (const slot of service.availabilitySlots) {
      if (!slot?.day || !slot?.time) continue;
      if (!groups[slot.day]) groups[slot.day] = [];
      groups[slot.day].push(slot.time);
    }

    return Object.entries(groups).map(([day, times]) => ({ day, times }));
  }, [service]);

  const reviews = useMemo(() => {
    const arr = Array.isArray(service?.reviews) ? service.reviews : [];
    return arr
      .map((r) => ({
        id: r._id,
        author: r.reviewerName || "Student",
        date: r.createdAt,
        rating: r.rating,
        comment: r.comment,
      }))
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [service]);

  const isOwner = service?.ownerId && String(service.ownerId) === String(currentUserId);

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewMessage("");

    if (!reviewComment.trim()) {
      setReviewMessage("Please add a comment.");
      return;
    }

    setReviewSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/services/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerId: currentUserId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to add review.");
      }

      setService(result.data || service);
      setReviewComment("");
      setReviewRating(5);
      setReviewMessage("Review added successfully.");
    } catch (err) {
      setReviewMessage(err.message || "Unable to add review.");
    } finally {
      setReviewSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="page-container py-6">
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Loading service...
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-background">
        <div className="page-container py-6">
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            {error || "Service not found"}
          </div>
        </div>
      </div>
    );
  }

  const workSamples = Array.isArray(service.workSamples) ? service.workSamples : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="page-container py-6 max-w-6xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6 animate-fade-in">
            <div>
              <Badge variant="secondary" className="mb-3">{service.category}</Badge>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                {service.title}
              </h1>
            </div>

            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-accent" />
                <span>{service.reviewCount || 0} reviews</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{service.viewCount || 0} views</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>{service.isPublished ? "Active" : "Paused"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{service.locationMode}</span>
              </div>
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-2">Work Samples</h2>
              {workSamples.length === 0 ? (
                <p className="text-sm text-muted-foreground">No work samples uploaded.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {workSamples.map((sample, idx) => {
                    const isImage = sample?.mimeType?.startsWith("image/");
                    return (
                      <div
                        key={`${sample?.filename || "sample"}-${idx}`}
                        className="aspect-video rounded-lg border border-border bg-secondary/30 overflow-hidden flex items-center justify-center"
                      >
                        {isImage ? (
                          <button
                            type="button"
                            className="h-full w-full"
                            onClick={() => setSelectedWorkSampleSrc(sample.url)}
                          >
                            <img
                              src={sample.url}
                              alt={sample.filename || `Sample ${idx + 1}`}
                              className="h-full w-full object-cover cursor-zoom-in"
                            />
                          </button>
                        ) : (
                          <a
                            href={sample.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary underline px-2 text-center"
                          >
                            {sample.filename || `Open sample ${idx + 1}`}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-2">About this service</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">Add Review</h2>
              {isOwner ? (
                <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
                  You cannot add a review to your own service.
                </div>
              ) : (
                <form onSubmit={submitReview} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Rating</label>
                    <div className="mt-1 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewRating(n)}
                          className="p-0.5"
                          aria-label={`Set rating ${n}`}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              n <= reviewRating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-muted-foreground/40"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-1 text-xs text-muted-foreground">{reviewRating}/5</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Comment</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24"
                      placeholder="Write your review..."
                    />
                  </div>
                  {reviewMessage && <p className="text-xs text-muted-foreground">{reviewMessage}</p>}
                  <Button
                    type="submit"
                    disabled={reviewSaving}
                    className="w-full gradient-primary text-primary-foreground font-semibold"
                  >
                    {reviewSaving ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              )}
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-3">Reviews</h2>
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
                    No reviews yet.
                  </div>
                ) : (
                  reviews.map((review) => <ReviewCard key={review.id} review={review} />)
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-border bg-card p-5 space-y-5 shadow-sm">
              <div className="text-center">
                <span className="text-3xl font-display font-bold text-foreground">LKR {service.pricePerHour}</span>
                <span className="text-sm text-muted-foreground">/hr</span>
              </div>

              <SlotPicker
                availableSlots={availableSlots}
                onSelect={(day, time) => setSelectedSlot({ day, time })}
              />

              {selectedSlot && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CalendarDays className="h-4 w-4" />
                    <span className="font-medium">
                      {selectedSlot.day} at {selectedSlot.time}
                    </span>
                  </div>
                </div>
              )}

              <Button className="w-full gradient-primary text-primary-foreground font-semibold" >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {selectedWorkSampleSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setSelectedWorkSampleSrc("")}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -top-10 right-0 text-white text-sm"
              onClick={() => setSelectedWorkSampleSrc("")}
            >
              Close
            </button>
            <img
              src={selectedWorkSampleSrc}
              alt="Work sample preview"
              className="w-full max-h-[80vh] object-contain rounded-lg border border-white/30 bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}
