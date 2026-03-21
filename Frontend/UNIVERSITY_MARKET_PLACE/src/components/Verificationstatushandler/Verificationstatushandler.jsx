import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Verificationstatushandler() {
  const navigate = useNavigate();
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const userId =
    localStorage.getItem("userId") ||
    localStorage.getItem("ownerId") ||
    user?._id ||
    "";

  const [step, setStep] = useState(1);
  const [profilePic, setProfilePic] = useState("");
  const [bio, setBio] = useState("");
  const [studies, setStudies] = useState(user?.university_name || "");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const firstName = user?.fullname?.split(" ")?.[0] || "there";

  const onSelectProfilePic = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePic(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (skills.includes(value)) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, value]);
    setSkillInput("");
  };

  const removeSkill = (value) => {
    setSkills((prev) => prev.filter((s) => s !== value));
  };

  const finishSetup = async () => {
    setError("");
    if (!userId) {
      setError("User ID not found. Please login again.");
      return;
    }

    if (skills.length < 2) {
      setError("Please add at least 2 skills.");
      return;
    }

    setSaving(true);

    try {
      const combinedBio = [bio.trim(), studies.trim() ? `Studies: ${studies.trim()}` : ""]
        .filter(Boolean)
        .join("\n\n");

      const getRes = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
      const getJson = await getRes.json().catch(() => ({}));
      const hasProfile = Boolean(getJson?.data?.user_id);

      const payload = {
        user_id: userId,
        profile_picture: profilePic || null,
        bio: combinedBio || null,
        skills,
      };

      const saveRes = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
        method: hasProfile ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const saveJson = await saveRes.json().catch(() => ({}));
      if (!saveRes.ok) {
        throw new Error(saveJson?.message || "Failed to save profile setup.");
      }

      setShowSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (e) {
      setError(e.message || "Failed to finish setup.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.backdrop}>
        <div style={styles.modal}>
          <div style={styles.stepHeader}>Step {step} of 3</div>

          {step === 1 && (
            <div>
              <h2 style={styles.title}>Add Profile Picture</h2>
              <p style={styles.sub}>Upload your profile picture.</p>

              <label style={styles.uploadBox}>
                {profilePic ? (
                  <img src={profilePic} alt="Profile" style={styles.preview} />
                ) : (
                  <span>Select image</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => onSelectProfilePic(e.target.files?.[0])}
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={styles.title}>Add Bio</h2>
              <p style={styles.sub}>Tell others about you.</p>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                placeholder="Write your bio..."
                style={styles.textarea}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={styles.title}>Setup Your Studies & Skills</h2>
              <p style={styles.sub}>Add your university/studies and at least 2 skills.</p>

              <input
                value={studies}
                onChange={(e) => setStudies(e.target.value)}
                placeholder="Your studies / university"
                style={styles.input}
              />

              <div style={styles.row}>
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill"
                  style={{ ...styles.input, marginBottom: 0 }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <button type="button" style={styles.addBtn} onClick={addSkill}>
                  Add
                </button>
              </div>

              <div style={styles.skillWrap}>
                {skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    style={styles.skill}
                    onClick={() => removeSkill(skill)}
                    title="Click to remove"
                  >
                    {skill} ×
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.footer}>
            <button
              type="button"
              style={styles.backBtn}
              disabled={step === 1 || saving}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                style={styles.nextBtn}
                onClick={() => setStep((s) => Math.min(3, s + 1))}
              >
                Next
              </button>
            ) : (
              <button type="button" style={styles.nextBtn} onClick={finishSetup} disabled={saving}>
                {saving ? "Saving..." : "Finish"}
              </button>
            )}
          </div>
        </div>
      </div>

      {showSuccess && (
        <div style={styles.successOverlay}>
          <div className="vs-hero" style={styles.successCard}>
            <div className="vs-hero-badge" style={styles.successBadge}>✓</div>
            <h2 className="vs-hero-title" style={styles.successTitle}>
              You're all set, {firstName}!
            </h2>
            <p className="vs-hero-sub" style={styles.successSub}>
              Your account is verified. You have full access to all features.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },
  modal: {
    width: "100%",
    maxWidth: "560px",
    background: "#111827",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "24px",
    color: "#e2e8f0",
    boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
  },
  stepHeader: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "16px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "6px",
  },
  sub: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "16px",
  },
  uploadBox: {
    height: "220px",
    border: "2px dashed #475569",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    overflow: "hidden",
    color: "#94a3b8",
  },
  preview: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  textarea: {
    width: "100%",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#e2e8f0",
    padding: "10px 12px",
    resize: "vertical",
  },
  input: {
    width: "100%",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#e2e8f0",
    padding: "10px 12px",
    marginBottom: "10px",
  },
  row: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  addBtn: {
    height: "42px",
    padding: "0 14px",
    border: "1px solid #0ea5e9",
    background: "#0ea5e9",
    color: "white",
    borderRadius: "10px",
    cursor: "pointer",
  },
  skillWrap: {
    marginTop: "10px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  skill: {
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#e2e8f0",
    borderRadius: "999px",
    padding: "6px 10px",
    cursor: "pointer",
  },
  error: {
    marginTop: "12px",
    color: "#f87171",
    fontSize: "13px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    marginTop: "20px",
  },
  backBtn: {
    flex: 1,
    height: "42px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "transparent",
    color: "#cbd5e1",
    cursor: "pointer",
  },
  nextBtn: {
    flex: 1,
    height: "42px",
    borderRadius: "10px",
    border: "1px solid #10b981",
    background: "#10b981",
    color: "#062a1e",
    fontWeight: 700,
    cursor: "pointer",
  },
  successOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  successCard: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "26px 22px",
    textAlign: "center",
    width: "min(520px, 92vw)",
  },
  successBadge: {
    width: "74px",
    height: "74px",
    borderRadius: "999px",
    border: "2px solid #10b981",
    color: "#10b981",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    margin: "0 auto 12px",
  },
  successTitle: {
    color: "#f8fafc",
    marginBottom: "8px",
    fontSize: "28px",
  },
  successSub: {
    color: "#94a3b8",
    fontSize: "14px",
  },
};
