import { useState } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Calendar,
  BarChart3,
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
import { mockServices } from "../../data/mockData";

export default function Profile() {
  const [editMode, setEditMode] = useState(false);
  const myServices = mockServices.slice(0, 3);

  // saved data (display mode)
  const [name, setName] = useState("Sarah Chen");
  const [education, setEducation] = useState("MIT • Computer Science & Mathematics");
  const [bio, setBio] = useState(
    "Passionate tutor and developer. 3 years of TA experience in calculus and linear algebra. Building web apps on the side."
  );

  // skills (no predefined)
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  // files (store filenames)
  const [profilePhotoName, setProfilePhotoName] = useState("");
  const [certFiles, setCertFiles] = useState([]);

  // draft (edit mode buffer)
  const [draft, setDraft] = useState({
    name: "Sarah Chen",
    education: "MIT • Computer Science & Mathematics",
    bio:
      "Passionate tutor and developer. 3 years of TA experience in calculus and linear algebra. Building web apps on the side.",
  });

  const startEdit = () => {
    setDraft({ name, education, bio });
    setEditMode(true);
  };

  const saveEdit = () => {
    setName(draft.name);
    setEducation(draft.education);
    setBio(draft.bio);
    setEditMode(false);
  };

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v) return;
    setSkills((prev) => [...prev, v]);
    setSkillInput("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 max-w-5xl">
        {/* Profile header */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary font-display">
                SC
              </div>
              <BadgeCheck className="absolute -bottom-1 -right-1 h-6 w-6 text-primary bg-card rounded-full" />
            </div>

            <div className="flex-1">
              {/* NAME */}
              <div className="flex items-center gap-2 mb-1">
                {editMode ? (
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    className="w-full sm:w-auto rounded-lg border border-input bg-secondary/30 px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Your name"
                  />
                ) : (
                  <h1 className="font-display text-xl font-bold text-foreground">{name}</h1>
                )}
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              </div>

              {/* EDUCATION */}
              {editMode ? (
                <input
                  value={draft.education}
                  onChange={(e) => setDraft((d) => ({ ...d, education: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-secondary/30 px-3 py-2 text-sm text-foreground mb-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Education (e.g., MIT • Computer Science)"
                />
              ) : (
                <p className="text-sm text-muted-foreground mb-3">{education}</p>
              )}

              {/* BIO */}
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

              {/* SKILLS */}
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

              {/* FILES DISPLAY (when not editing) */}
              {!editMode && (profilePhotoName || certFiles.length > 0) && (
                <div className="mt-4 space-y-2">
                  {profilePhotoName && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Profile photo:</span>{" "}
                      {profilePhotoName}
                    </div>
                  )}
                  {certFiles.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Certificates:</span>{" "}
                      {certFiles.join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* EDIT/SAVE BUTTON */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => (editMode ? saveEdit() : startEdit())}
            >
              {editMode ? "Save" : "Edit Profile"}
            </Button>
          </div>

          {/* UPLOADS (edit mode only) */}
          {editMode && (
            <div className="mt-5 pt-5 border-t border-border space-y-3 animate-fade-in">
              {/* Profile photo */}
              <div className="flex items-center gap-3">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm text-primary cursor-pointer hover:underline">
                  Upload profile photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setProfilePhotoName(file.name);
                    }}
                  />
                </label>
                {profilePhotoName && (
                  <span className="text-xs text-muted-foreground">{profilePhotoName}</span>
                )}
              </div>

              {/* Certificates */}
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm text-primary cursor-pointer hover:underline">
                  Upload certificates / work samples
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []).map((f) => f.name);
                      setCertFiles(files);
                    }}
                  />
                </label>
                {certFiles.length > 0 && (
                  <span className="text-xs text-muted-foreground">{certFiles.length} file(s)</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dashboard stats */}
        <h2 className="font-display text-lg font-bold text-foreground mb-4">
          Provider Dashboard
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            icon={<DollarSign className="h-5 w-5" />}
            label="Revenue"
            value="$2,840"
            change="+12% this month"
            positive
          />
          <StatsCard
            icon={<Calendar className="h-5 w-5" />}
            label="Bookings"
            value="132"
            change="+8 this week"
            positive
          />
          <StatsCard icon={<BarChart3 className="h-5 w-5" />} label="Avg Response" value="2.1 hrs" />
          <StatsCard
            icon={<Star className="h-5 w-5" />}
            label="Rating"
            value="4.9"
            change="Top 5%"
            positive
          />
        </div>

        {/* My Services */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground">My Services</h2>
          <Link to="/create-service">
            <Button size="sm" className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" /> Add Service
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myServices.map((s, i) => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="text-xs">
                  {s.category}
                </Badge>
                <Badge
                  className={`text-xs ${
                    i === 1
                      ? "bg-warning/10 text-warning border-warning/20"
                      : "bg-success/10 text-success border-success/20"
                  }`}
                >
                  {i === 1 ? "Paused" : "Active"}
                </Badge>
              </div>

              <h3 className="font-display text-sm font-semibold text-foreground mb-3">{s.title}</h3>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                <span>{s.rating}</span>
                <span>•</span>
                <span>{s.bookingsCount} bookings</span>
              </div>

              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  {i === 1 ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-destructive hover:text-destructive"
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