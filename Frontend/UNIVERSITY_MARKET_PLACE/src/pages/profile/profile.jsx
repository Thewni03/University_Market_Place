import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Calendar,
  BarChart3,
  Eye,
  Star,
  Plus,
  Pause,
  Play,
  Trash2,
  Edit,
  BadgeCheck,
  Upload,
  Tag,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import StatsCard from "../../components/StatusCard";

export default function Profile() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const profileUserId =
    localStorage.getItem("userId") ||
    localStorage.getItem("ownerId") ||
    storedUser?._id ||
    import.meta.env.VITE_PROFILE_USER_ID ||
    "69a7cbb4f893c9e5eb3f479b";

  const defaultName = "";
  const defaultEducation = "";
  const defaultBio = "";

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [myServices, setMyServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [viewMode, setViewMode] = useState("day");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });
  const [viewsLoading, setViewsLoading] = useState(false);
  const [viewAnalytics, setViewAnalytics] = useState({
    totalViews: 0,
    totalBookings: 0,
    totalRevenue: 0,
    points: [],
  });
  const [selectedChartIndex, setSelectedChartIndex] = useState(null);
  const [selectedRevenueIndex, setSelectedRevenueIndex] = useState(null);

  const [name, setName] = useState(defaultName);
  const [education, setEducation] = useState(defaultEducation);
  const [bio, setBio] = useState(defaultBio);

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const [profilePhoto, setProfilePhoto] = useState("");
  const [sampleWork, setSampleWork] = useState([]);
  const [selectedCertificateSrc, setSelectedCertificateSrc] = useState("");

  const [draft, setDraft] = useState({
    bio: defaultBio,
  });

  const buildSmoothPath = (coords) => {
    if (!coords || coords.length === 0) return "";
    if (coords.length === 1) return `M ${coords[0].x},${coords[0].y}`;

    let d = `M ${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i += 1) {
      const p0 = coords[i - 1] || coords[i];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const toImageSrc = (value) => {
    if (!value || typeof value !== "string") return "";

    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:image/") ||
      value.startsWith("blob:")
    ) {
      return value;
    }

    if (value.startsWith("/")) {
      return `${API_BASE_URL}${value}`;
    }

    return "";
  };

  const readFilesAsDataUrls = async (fileList) => {
    const files = Array.from(fileList || []);
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
          reader.onerror = () => resolve("");
          reader.readAsDataURL(file);
        })
    );

    const values = await Promise.all(readers);
    return values.filter(Boolean);
  };

  const normalizeSampleWork = (value, fallback = []) => {
    if (Array.isArray(value)) return value;
    if (value) return [value];
    return fallback;
  };

  const fetchProfileFromApi = async () => {
    const response = await fetch(`${API_BASE_URL}/api/profile/${profileUserId}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load profile.");
    }

    const profile = result.data;
    if (!profile) {
      setHasProfile(false);
      setName("");
      setEducation("");
      setBio("");
      setSkills([]);
      setProfilePhoto("");
      setSampleWork([]);
      setDraft({ bio: "" });
      return;
    }

    const user = profile.user_id || {};
    const nextName = user.fullname || "";
    const nextEducation = [user.university_name, user.graduate_year].filter(Boolean).join(" • ");

    setName(nextName);
    setEducation(nextEducation);
    setBio(profile.bio || "");
    setSkills(Array.isArray(profile.skills) ? profile.skills : []);
    setProfilePhoto(profile.profile_picture || "");
    setSampleWork(normalizeSampleWork(profile.sample_work, []));
    setDraft({ bio: profile.bio || "" });
    setHasProfile(true);
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setApiMessage("");

      try {
        await fetchProfileFromApi();
      } catch (error) {
        setApiMessage(error.message || "Unable to fetch profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [API_BASE_URL, profileUserId]);

  const fetchOwnerServices = async () => {
    setServicesLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/services?ownerId=${encodeURIComponent(profileUserId)}`
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to load services.");
      }
      setMyServices(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setApiMessage(error.message || "Unable to load your services.");
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerServices();
  }, [API_BASE_URL, profileUserId]);

  const fetchOwnerViewAnalytics = async (mode) => {
    setViewsLoading(true);
    try {
      const monthParam =
        mode === "week" ? `&month=${encodeURIComponent(selectedMonth)}` : "";
      const response = await fetch(
        `${API_BASE_URL}/api/services/analytics/views?ownerId=${encodeURIComponent(
          profileUserId
        )}&mode=${encodeURIComponent(mode)}${monthParam}`
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to load view analytics.");
      }
      setViewAnalytics({
        totalViews: Number(result?.data?.totalViews || 0),
        totalBookings: Number(result?.data?.totalBookings || 0),
        totalRevenue: Number(result?.data?.totalRevenue || 0),
        points: Array.isArray(result?.data?.points)
          ? result.data.points.map((p) => ({
              key: p.key,
              label: p.label,
              range: p.range,
              views: Number(p.views || 0),
              bookings: Number(p.bookings || 0),
              revenue: Number(p.revenue || 0),
            }))
          : [],
      });
      setSelectedChartIndex(null);
      setSelectedRevenueIndex(null);
    } catch (error) {
      setApiMessage(error.message || "Unable to load view analytics.");
    } finally {
      setViewsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerViewAnalytics(viewMode);
  }, [API_BASE_URL, profileUserId, viewMode, selectedMonth]);

  useEffect(() => {
    if (!showSavedToast) return;
    const timer = setTimeout(() => setShowSavedToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showSavedToast]);

  const saveEdit = async () => {
    setSaving(true);
    setApiMessage("");

    const payload = {
      bio: draft.bio,
      profile_picture: profilePhoto || null,
      sample_work: sampleWork,
      user_id: profileUserId,
    };

    if (skills.length >= 2) {
      payload.skills = skills;
    }

    const method = hasProfile ? "PUT" : "POST";

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/${profileUserId}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to save profile.");
      }
      await fetchProfileFromApi();
      setEditMode(false);
      setApiMessage("");
      setShowSavedToast(true);
    } catch (error) {
      setApiMessage(error.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    setDraft({ bio });
    setApiMessage("");
    setEditMode(true);
  };

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v) return;
    setSkills((prev) => [...prev, v]);
    setSkillInput("");
  };

  const toggleServiceStatus = async (service) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/services/${service._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: profileUserId,
          isPublished: !service.isPublished,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to update status.");
      }

      setMyServices((prev) =>
        prev.map((item) =>
          item._id === service._id ? { ...item, isPublished: !service.isPublished } : item
        )
      );
    } catch (error) {
      setApiMessage(error.message || "Unable to update service status.");
    }
  };

  const deleteService = async (serviceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId: profileUserId }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to delete service.");
      }

      setMyServices((prev) => prev.filter((item) => item._id !== serviceId));
    } catch (error) {
      setApiMessage(error.message || "Unable to delete service.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="page-container py-6">
        {showSavedToast && (
          <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-lg">
            Profile saved successfully
          </div>
        )}

        {loading && (
          <div className="mb-4 rounded-lg border border-border bg-card p-3 text-left text-sm text-muted-foreground">
            Loading profile...
          </div>
        )}

        {apiMessage && (
          <div className="mb-4 rounded-lg border border-border bg-card p-3 text-left text-sm text-muted-foreground">
            {apiMessage}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-6 mb-6 mt-2 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="relative">
              {toImageSrc(profilePhoto) ? (
                <img
                  src={toImageSrc(profilePhoto)}
                  alt="Profile"
                  className="h-20 w-20 rounded-2xl object-cover border border-border"
                />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary font-display">
                  {(name || "?")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("")}
                </div>
              )}
              <BadgeCheck className="absolute -bottom-1 -right-1 h-6 w-6 text-success bg-card rounded-full" />
            </div>

            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-xl font-bold text-foreground">
                  {name || "Name not available"}
                </h1>
                <Badge className="text-xs bg-success/10 text-success border-success/30">
                  Verified
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {education || "Education not available"}
              </p>

              {editMode ? (
                <textarea
                  value={draft.bio}
                  onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-secondary/30 p-3 text-sm text-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Write something about you…"
                />
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
              )}

              <div className="mt-3">
                <div className="flex flex-wrap gap-1.5">
                  {skills.length === 0 && !editMode && (
                    <span className="text-xs text-muted-foreground">No skills added yet.</span>
                  )}

                  {skills.map((skill, index) => (
                    <Badge
                      key={`${skill}-${index}`}
                      variant="secondary"
                      className="text-xs flex items-center gap-1"
                    >
                      {skill}
                      {editMode && (
                        <button
                          type="button"
                          onClick={() => setSkills((prev) => prev.filter((_, i) => i !== index))}
                          className="ml-1 text-xs text-destructive"
                          aria-label={`Remove ${skill}`}
                        >
                          ✕
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>

                {editMode && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Type a skill and press Enter"
                      className="w-full sm:w-64 rounded-lg border border-input bg-secondary/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button type="button" size="sm" onClick={addSkill}>
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="self-start sm:ml-auto hover:bg-primary/10 hover:text-primary hover:border-primary/40"
              disabled={saving || loading}
              onClick={() => (editMode ? saveEdit() : startEdit())}
            >
              {editMode ? (saving ? "Saving..." : "Save") : "Edit Profile"}
            </Button>
          </div>

          {editMode && (
            <div className="mt-5 pt-5 border-t border-border space-y-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm text-primary cursor-pointer hover:underline">
                  Upload profile photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const imageDataUrls = await readFilesAsDataUrls(e.target.files);
                      if (!imageDataUrls[0]) return;
                      setProfilePhoto(imageDataUrls[0]);
                    }}
                  />
                </label>
                {profilePhoto && <span className="text-xs text-muted-foreground">Image selected</span>}
              </div>

              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm text-primary cursor-pointer hover:underline">
                  Upload certificates / work samples
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const imageDataUrls = await readFilesAsDataUrls(e.target.files);
                      if (imageDataUrls.length === 0) return;

                      const next = Array.from(new Set([...sampleWork, ...imageDataUrls]));
                      setSampleWork(next);
                    }}
                  />
                </label>
                {sampleWork.length > 0 && (
                  <span className="text-xs text-muted-foreground">{sampleWork.length} image(s)</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 mb-6 animate-fade-in">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Certificates</h2>
          {sampleWork.length === 0 ? (
            <p className="text-sm text-muted-foreground">No certificate images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {sampleWork.map((item, index) => {
                const src = toImageSrc(item);
                if (!src) return null;

                return (
                  <div key={`${item}-${index}`} className="relative">
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setSampleWork((prev) => prev.filter((_, i) => i !== index));
                          setApiMessage("Certificate removed. Click Save to update database.");
                        }}
                        className="absolute top-1 right-1 z-10 rounded bg-black/70 px-2 py-0.5 text-xs text-white"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedCertificateSrc(src)}
                      className="w-full text-left"
                    >
                      <img
                        src={src}
                        alt={`Certificate ${index + 1}`}
                        className="w-full aspect-[4/3] rounded-lg object-cover border border-border cursor-zoom-in"
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedCertificateSrc && (
          <div
            className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
            onClick={() => setSelectedCertificateSrc("")}
          >
            <div
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute -top-10 right-0 text-white text-sm"
                onClick={() => setSelectedCertificateSrc("")}
              >
                Close
              </button>
              <img
                src={selectedCertificateSrc}
                alt="Certificate preview"
                className="w-full max-h-[80vh] object-contain rounded-lg border border-white/30 bg-black"
              />
            </div>
          </div>
        )}

        <h2 className="font-display text-lg font-bold text-foreground mb-4">Provider Dashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            icon={<DollarSign className="h-5 w-5" />}
            label="Revenue"
            value={`LKR ${viewAnalytics.totalRevenue.toLocaleString()}`}
            change="From chart data"
            positive
            iconToneClass="bg-emerald-500/10 text-emerald-600"
          />
          <StatsCard
            icon={<Calendar className="h-5 w-5" />}
            label="Bookings"
            value={viewAnalytics.totalBookings.toLocaleString()}
            change="From chart data"
            positive
            iconToneClass="bg-cyan-500/10 text-cyan-600"
          />
          <StatsCard
            icon={<Eye className="h-5 w-5" />}
            label="Total Views"
            value={viewAnalytics.totalViews.toLocaleString()}
            change={
              viewMode === "week"
                ? "Weekly chart active"
                : viewMode === "month"
                  ? "Monthly chart active"
                  : "Daily chart active"
            }
            positive
            iconToneClass="bg-violet-500/10 text-violet-600"
          />
          <StatsCard
            icon={<Star className="h-5 w-5" />}
            label="Rating"
            value="4.9"
            change="Top 5%"
            positive
            iconToneClass="bg-amber-500/10 text-amber-600"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-violet-600" />
              <h3 className="font-display text-base font-bold text-foreground">Views Chart</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("day")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "day"
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-secondary text-secondary-foreground border border-border"
                }`}
              >
                Everyday
              </button>
              <button
                type="button"
                onClick={() => setViewMode("week")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "week"
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-secondary text-secondary-foreground border border-border"
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setViewMode("month")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "month"
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-secondary text-secondary-foreground border border-border"
                }`}
              >
                Month
              </button>
            </div>
          </div>

          {viewMode === "week" && (
            <div className="mb-4 flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Select Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground"
              />
            </div>
          )}

          {viewsLoading ? (
            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
              Loading chart...
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <p className="text-4xl font-display font-bold text-foreground">
                  {viewAnalytics.totalViews.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Views</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Bookings: {viewAnalytics.totalBookings.toLocaleString()}
                </p>
              </div>

              {viewAnalytics.points.length === 0 ? (
                <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
                  No view data yet.
                </div>
              ) : (
                <div className="relative rounded-xl border border-border bg-secondary/20 p-4">
                  {(() => {
                    const points = viewAnalytics.points;
                    const maxValue = Math.max(
                      1,
                      ...points.map((p) => Math.max(p.views, p.bookings || 0))
                    );

                    const getX = (index) =>
                      points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
                    const getY = (value) => 100 - (Number(value || 0) / maxValue) * 92;

                    const viewCoords = points.map((p, i) => ({
                      x: getX(i),
                      y: getY(p.views),
                    }));
                    const bookingCoords = points.map((p, i) => ({
                      x: getX(i),
                      y: getY(p.bookings || 0),
                    }));

                    const viewsCurve = buildSmoothPath(viewCoords);
                    const bookingsCurve = buildSmoothPath(bookingCoords);

                    const viewsArea = `${viewsCurve} L ${getX(points.length - 1)},100 L 0,100 Z`;
                    const bookingsArea = `${bookingsCurve} L ${getX(points.length - 1)},100 L 0,100 Z`;

                    const selectedPoint =
                      selectedChartIndex === null ? null : points[selectedChartIndex];
                    const selectedX =
                      selectedChartIndex === null ? 0 : getX(selectedChartIndex);

                    return (
                      <>
                        <svg viewBox="0 0 100 100" className="w-full h-64">
                          <path d={viewsArea} fill="rgba(124,58,237,0.25)" />
                          <path d={bookingsArea} fill="rgba(34,197,94,0.20)" />
                          <path
                            d={viewsCurve}
                            fill="none"
                            stroke="rgb(124,58,237)"
                            strokeWidth="0.9"
                          />
                          <path
                            d={bookingsCurve}
                            fill="none"
                            stroke="rgb(34,197,94)"
                            strokeWidth="0.9"
                          />

                          {points.map((p, i) => (
                            <g key={p.key}>
                              <circle
                                cx={getX(i)}
                                cy={getY(p.views)}
                                r="1"
                                fill="rgb(124,58,237)"
                                className="cursor-pointer"
                                onClick={() => setSelectedChartIndex(i)}
                              />
                              <circle
                                cx={getX(i)}
                                cy={getY(p.bookings || 0)}
                                r="1"
                                fill="rgb(34,197,94)"
                                className="cursor-pointer"
                                onClick={() => setSelectedChartIndex(i)}
                              />
                            </g>
                          ))}
                        </svg>

                        <div className="mt-2 grid gap-2 text-[11px] text-muted-foreground items-center">
                          <div
                            className="grid gap-2"
                            style={{
                              gridTemplateColumns: `repeat(${Math.max(
                                1,
                                points.length
                              )}, minmax(0, 1fr))`,
                            }}
                          >
                            {points.map((p) => (
                              <span key={p.key} className="text-center truncate">
                                {p.label}
                              </span>
                            ))}
                          </div>
                        </div>

                        {selectedPoint && (
                          <div
                            className="absolute top-5 z-10 rounded-lg border border-border bg-card p-3 shadow-lg min-w-[180px]"
                            style={{
                              left: `calc(${Math.min(82, Math.max(8, selectedX))}% - 90px)`,
                            }}
                          >
                            <p className="text-xs text-muted-foreground mb-2">
                              {selectedPoint.range || selectedPoint.label}
                            </p>
                            <p className="text-sm text-foreground">Total views: {selectedPoint.views}</p>
                            <p className="text-sm text-foreground">
                              Total bookings: {selectedPoint.bookings || 0}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
                  Views
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  Bookings
                </span>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                {viewMode === "week"
                  ? "Showing selected month grouped into 4 weeks."
                  : viewMode === "month"
                    ? "Showing month-wise views."
                    : "Showing last 7 days (everyday views)."}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <h3 className="font-display text-base font-bold text-foreground">Revenue Chart</h3>
            </div>
          </div>

          {viewsLoading ? (
            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
              Loading chart...
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <p className="text-4xl font-display font-bold text-foreground">
                  LKR {viewAnalytics.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>

              {viewAnalytics.points.length === 0 ? (
                <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
                  No revenue data yet.
                </div>
              ) : (
                <div className="relative rounded-xl border border-border bg-secondary/20 p-4">
                  {(() => {
                    const points = viewAnalytics.points;
                    const maxValue = Math.max(1, ...points.map((p) => p.revenue || 0));

                    const getX = (index) =>
                      points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
                    const getY = (value) => 100 - (Number(value || 0) / maxValue) * 92;

                    const revenueCoords = points.map((p, i) => ({
                      x: getX(i),
                      y: getY(p.revenue || 0),
                    }));
                    const revenueCurve = buildSmoothPath(revenueCoords);
                    const revenueArea = `${revenueCurve} L ${getX(points.length - 1)},100 L 0,100 Z`;

                    const selectedPoint =
                      selectedRevenueIndex === null ? null : points[selectedRevenueIndex];
                    const selectedX =
                      selectedRevenueIndex === null ? 0 : getX(selectedRevenueIndex);

                    return (
                      <>
                        <svg viewBox="0 0 100 100" className="w-full h-64">
                          <path d={revenueArea} fill="rgba(249,115,22,0.25)" />
                          <path
                            d={revenueCurve}
                            fill="none"
                            stroke="rgb(249,115,22)"
                            strokeWidth="0.9"
                          />

                          {points.map((p, i) => (
                            <g key={p.key}>
                              <circle
                                cx={getX(i)}
                                cy={getY(p.revenue || 0)}
                                r="1"
                                fill="rgb(249,115,22)"
                                className="cursor-pointer"
                                onClick={() => setSelectedRevenueIndex(i)}
                              />
                            </g>
                          ))}
                        </svg>

                        <div className="mt-2 grid gap-2 text-[11px] text-muted-foreground items-center">
                          <div
                            className="grid gap-2"
                            style={{
                              gridTemplateColumns: `repeat(${Math.max(
                                1,
                                points.length
                              )}, minmax(0, 1fr))`,
                            }}
                          >
                            {points.map((p) => (
                              <span key={p.key} className="text-center truncate">
                                {p.label}
                              </span>
                            ))}
                          </div>
                        </div>

                        {selectedPoint && (
                          <div
                            className="absolute top-5 z-10 rounded-lg border border-border bg-card p-3 shadow-lg min-w-[180px]"
                            style={{
                              left: `calc(${Math.min(82, Math.max(8, selectedX))}% - 90px)`,
                            }}
                          >
                            <p className="text-xs text-muted-foreground mb-2">
                              {selectedPoint.range || selectedPoint.label}
                            </p>
                            <p className="text-sm text-foreground">
                              Revenue: LKR {Number(selectedPoint.revenue || 0).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              <p className="mt-3 text-xs text-muted-foreground">
                {viewMode === "week"
                  ? "Showing selected month grouped into 4 weeks."
                  : viewMode === "month"
                    ? "Showing month-wise revenue."
                    : "Showing last 7 days (everyday revenue)."}
              </p>
            </div>
          )}
        </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground">My Services</h2>
          <Link to="/create-service">
            <Button size="sm" className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" /> Add Service
            </Button>
          </Link>
        </div>

        {servicesLoading && (
          <div className="mb-4 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
            Loading services...
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myServices.map((s) => (
            <div key={s._id} className="rounded-xl border border-border bg-card p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="text-xs">
                  {s.category}
                </Badge>
                <Badge
                  className={`text-xs ${
                    !s.isPublished
                      ? "bg-orange-500/10 text-orange-600 border-orange-300"
                      : "bg-green-500/10 text-green-600 border-green-300 font-semibold"
                  }`}
                >
                  {s.isPublished ? "Active" : "Paused"}
                </Badge>
              </div>

              <Link to={`/service/${s._id}`} className="block mb-3">
                <h3 className="font-display text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  {s.title}
                </h3>
              </Link>

              <Link to={`/service/${s._id}`} className="block">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Star className="h-3.5 w-3.5 text-accent" />
                  <span>LKR {s.pricePerHour}/hr</span>
                  <span>•</span>
                  <span>{s.locationMode}</span>
                </div>
              </Link>

              <div className="flex gap-1.5">
                <Link to={`/edit-service/${s._id}`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs transition-colors hover:bg-[#70798c]/10 hover:text-[#70798c] hover:border-[#70798c]/50"
                  >
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs ${
                    s.isPublished
                      ? "text-orange-600 border-orange-300 hover:bg-orange-500/10"
                      : "text-success border-success/30 hover:bg-success/10"
                  }`}
                  onClick={() => toggleServiceStatus(s)}
                >
                  {s.isPublished ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-red-600 border-red-300 hover:bg-red-500/10 hover:text-red-700"
                  onClick={() => deleteService(s._id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
