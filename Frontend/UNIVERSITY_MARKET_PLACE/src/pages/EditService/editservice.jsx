import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { categories } from "../../data/mockData";

const fallbackDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const fallbackTimes = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
];

export default function EditService() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const ownerId =
    localStorage.getItem("userId") ||
    localStorage.getItem("ownerId") ||
    "";

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [description, setDescription] = useState("");
  const [locationMode, setLocationMode] = useState("Online");
  const [workSamples, setWorkSamples] = useState([]);
  const [apiMessage, setApiMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(fallbackDays);
  const [times, setTimes] = useState(fallbackTimes);
  const [slots, setSlots] = useState([]);
  const [newDay, setNewDay] = useState("Mon");
  const [newTime, setNewTime] = useState("9:00 AM");

  const addSlot = () => {
    if (!slots.find((s) => s.day === newDay && s.time === newTime)) {
      setSlots((prev) => [...prev, { day: newDay, time: newTime }]);
    }
  };

  const readFilesAsWorkSamples = async (fileList) => {
    const files = Array.from(fileList || []);
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              url: typeof reader.result === "string" ? reader.result : "",
              filename: file.name,
              mimeType: file.type || "application/octet-stream",
              sizeBytes: file.size,
            });
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        })
    );

    const values = await Promise.all(readers);
    return values.filter((item) => item && item.url);
  };

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/services/meta`);
        const result = await response.json();
        if (!response.ok) return;

        const meta = result?.data || {};
        if (Array.isArray(meta.days) && meta.days.length > 0) {
          setDays(meta.days);
          setNewDay(meta.days[0]);
        }
        if (Array.isArray(meta.times) && meta.times.length > 0) {
          setTimes(meta.times);
          setNewTime(meta.times[0]);
        }
      } catch {
        // fallback defaults already set
      }
    };

    loadMeta();
  }, [API_BASE_URL]);

  useEffect(() => {
    const loadService = async () => {
      setLoading(true);
      setApiMessage("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/services/${serviceId}?ownerId=${encodeURIComponent(ownerId)}`
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || result.message || "Failed to load service.");
        }

        const service = result.data || {};
        setTitle(service.title || "");
        setCategory(service.category || "");
        setPricePerHour(
          service.pricePerHour === undefined || service.pricePerHour === null
            ? ""
            : String(service.pricePerHour)
        );
        setDescription(service.description || "");
        setLocationMode(service.locationMode || "Online");
        setSlots(Array.isArray(service.availabilitySlots) ? service.availabilitySlots : []);
        setWorkSamples(Array.isArray(service.workSamples) ? service.workSamples : []);
      } catch (error) {
        setApiMessage(error.message || "Unable to load service.");
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) loadService();
  }, [API_BASE_URL, serviceId, ownerId]);

  const saveService = async (e) => {
    e.preventDefault();
    setApiMessage("");

    if (!title.trim() || !category || !description.trim() || !pricePerHour) {
      setApiMessage("Please fill title, category, price, and description.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ownerId,
        title: title.trim(),
        category,
        pricePerHour: Number(pricePerHour),
        description: description.trim(),
        locationMode,
        availabilitySlots: slots,
        workSamples,
      };

      const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to update service.");
      }

      navigate("/profile");
    } catch (error) {
      setApiMessage(error.message || "Failed to update service.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="page-container py-6">
        <div className="mx-auto w-full max-w-2xl">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <h1 className="font-display text-2xl font-bold text-foreground mb-6">Edit Service</h1>

          {loading && (
            <div className="mb-4 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
              Loading service...
            </div>
          )}
          {apiMessage && (
            <div className="mb-4 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
              {apiMessage}
            </div>
          )}

          <form
            onSubmit={saveService}
            className="rounded-2xl border border-border bg-card p-6 space-y-5 animate-fade-in"
          >
            <div className="space-y-2">
              <Label>Service Title</Label>
              <Input
                placeholder="e.g. Advanced Calculus Tutoring"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c !== "All").map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price (LKR/hr)</Label>
                <Input
                  type="number"
                  placeholder="35"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe your service, experience, and what students can expect..."
                className="h-28"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Location Mode</Label>
              <div className="flex gap-2">
                {["Online", "On-Campus"].map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setLocationMode(mode)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${locationMode === mode
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                      }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Work Samples</Label>
              <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input bg-secondary/30 p-6 cursor-pointer hover:border-primary/40 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {workSamples.length > 0
                    ? `${workSamples.length} file(s) selected`
                    : "Upload images or PDFs"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf"
                  onChange={async (e) => {
                    const next = await readFilesAsWorkSamples(e.target.files);
                    if (next.length === 0) return;
                    setWorkSamples((prev) => [...prev, ...next]);
                  }}
                />
              </label>
              {workSamples.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {workSamples.map((sample, index) => (
                    <span
                      key={`${sample.filename || "sample"}-${index}`}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs text-primary"
                    >
                      {sample.filename || `Sample ${index + 1}`}
                      <button
                        type="button"
                        onClick={() => setWorkSamples((prev) => prev.filter((_, i) => i !== index))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Availability Slots</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {slots.map((s, i) => (
                  <span
                    key={`${s.day}-${s.time}-${i}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
                  >
                    {s.day} {s.time}
                    <button type="button" onClick={() => setSlots(slots.filter((_, j) => j !== i))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 items-end">
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground"
                >
                  {times.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <Button type="button" variant="outline" size="sm" onClick={addSlot}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground font-semibold mt-2"
              disabled={saving || loading}
            >
              {saving ? "Saving..." : "Save Service"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
