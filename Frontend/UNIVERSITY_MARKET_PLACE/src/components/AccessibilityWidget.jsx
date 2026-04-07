import {
  FaTextHeight,
  FaAdjust,
  FaEyeSlash,
  FaFont,
  FaLink,
  FaMousePointer,
  FaBan,
  FaVolumeUp,
  FaStop,
  FaBolt
} from "react-icons/fa";

import { MdOutlineAccessibility } from "react-icons/md";
import { GiSoundWaves } from "react-icons/gi";
import { IoLeafOutline, IoRainyOutline } from "react-icons/io5";
import { BiCoffeeTogo } from "react-icons/bi";
import React, { useState, useEffect, useCallback, useRef } from "react";
const THEMES = [
  { id: "default", label: "Default", bg: "#f0f4ff", text: "#0f172a", primary: "#3aaf77", surface: "#fff", dark: false },  { id: "dark",       label: "Dark",         bg: "#080c14", text: "#e8edf8", primary: "#6384ff", surface: "#0d1424",  dark: true  },
  ];

const SOUNDS = [
  { id: "rain", label: "Rain", icon: <IoRainyOutline />, freq: 200, type: "noise" },
  { id: "forest", label: "Forest", icon: <IoLeafOutline />, freq: 350, type: "noise" },
  { id: "lofi", label: "Lo-Fi", icon: <BiCoffeeTogo />, freq: 110, type: "tone" },
];

const STORAGE_KEY = "unimarket_a11y";
const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
};
const save = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
};

const WIDGET_CSS = `
  /* ── Accessibility overrides (applied to <html>) ── */
  html.a11y-high-contrast {
    filter: contrast(150%) !important;
  }
  html.a11y-high-contrast * {
    border-color: #ffff00 !important;
    outline-color: #ffff00 !important;
  }
  html.a11y-grayscale { filter: grayscale(100%) !important; }
  html.a11y-reduce-motion * { transition: none !important; animation: none !important; }
  html.a11y-dyslexic * { font-family: 'OpenDyslexic', Arial, sans-serif !important; }
  html.a11y-highlight-links a,
  html.a11y-highlight-links button { outline: 2px solid var(--a11y-primary, #c1ddce) !important; }
  html.a11y-cursor-large * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='32'%3E%3Ccircle cx='8' cy='8' r='7' fill='black' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 8 8, auto !important; }

  /* ── Widget shell ── */
  #a11y-trigger {
    position: fixed;
    bottom: 28px;
    left: 28px;
    z-index: 99999;
    width: 52px; height: 52px;
    border-radius: 50%;
    background: var(--a11y-primary, #c1ddce);
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    font-size: 22px;
    color: white;
    outline: none;
  }
  #a11y-trigger:hover { transform: scale(1.1); box-shadow: 0 8px 28px rgba(0,0,0,0.32); }
  #a11y-trigger:focus-visible { outline: 3px solid white; outline-offset: 3px; }

  #a11y-panel {
    position: fixed;
    bottom: 92px;
    left: 28px;
    z-index: 99998;
    width: 320px;
    max-height: 80vh;
    overflow-y: auto;
    border-radius: 20px;
    padding: 0;
    font-family: 'Sora', 'Inter', sans-serif;
    font-size: 13px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.30);
    transform-origin: bottom left;
    transition: opacity 0.22s ease, transform 0.22s ease;
  }
  #a11y-panel.closed {
    opacity: 0; pointer-events: none;
    transform: scale(0.92) translateY(8px);
  }
  #a11y-panel.open {
    opacity: 1; pointer-events: all;
    transform: scale(1) translateY(0);
  }

  #a11y-panel::-webkit-scrollbar { width: 3px; }
  #a11y-panel::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 99px; }

  .a11y-panel-inner {
    border-radius: 20px;
    overflow: hidden;
  }

  .a11y-header {
    padding: 18px 20px 14px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(128,128,128,0.12);
  }
  .a11y-header-title {
    font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px;
  }
  .a11y-close {
    background: none; border: none; cursor: pointer;
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; opacity: 0.5; transition: opacity 0.15s;
  }
  .a11y-close:hover { opacity: 1; }

  .a11y-section { padding: 14px 20px; border-bottom: 1px solid rgba(128,128,128,0.10); }
  .a11y-section:last-child { border-bottom: none; }
  .a11y-section-label {
    font-size: 9px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; opacity: 0.45; margin-bottom: 12px;
  }

  /* Theme swatches */
  .a11y-themes {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  }
  .a11y-theme-btn {
    border: 2px solid transparent; border-radius: 10px;
    padding: 8px 6px; cursor: pointer; font-size: 10px; font-weight: 600;
    transition: all 0.15s; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }
  .a11y-theme-btn:hover { transform: translateY(-2px); }
  .a11y-theme-btn.active { border-color: var(--a11y-primary, #6384ff); }
  .a11y-theme-swatch {
    width: 28px; height: 28px; border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.08);
  }

  /* Toggle rows */
  .a11y-toggle-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 9px 0; gap: 10px;
  }
  .a11y-toggle-row + .a11y-toggle-row {
    border-top: 1px solid rgba(128,128,128,0.08);
  }
  .a11y-row-label { display: flex; align-items: center; gap: 8px; flex: 1; }
  .a11y-row-icon { font-size: 16px; width: 24px; text-align: center; flex-shrink: 0; }
  .a11y-row-text { font-size: 12px; font-weight: 500; }
  .a11y-row-sub  { font-size: 10px; opacity: 0.45; margin-top: 1px; }

  /* Pill toggle */
  .a11y-pill {
    position: relative; width: 40px; height: 22px; flex-shrink: 0;
    border-radius: 99px; cursor: pointer; border: none;
    transition: background 0.2s ease;
  }
  .a11y-pill::after {
    content: ''; position: absolute; top: 3px; left: 3px;
    width: 16px; height: 16px; border-radius: 50%; background: white;
    transition: transform 0.2s ease;
    box-shadow: 0 1px 4px rgba(0,0,0,0.25);
  }
  .a11y-pill.on::after { transform: translateX(18px); }

  /* Slider */
  .a11y-slider-row { display: flex; align-items: center; gap: 10px; }
  .a11y-slider { flex: 1; accent-color: var(--a11y-primary, #6384ff); cursor: pointer; height: 4px; }
  .a11y-slider-val { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; min-width: 28px; text-align: right; }

  /* Sound buttons */
  .a11y-sounds { display: flex; gap: 8px; }
  .a11y-sound-btn {
    flex: 1; padding: 8px 4px; border-radius: 10px;
    border: 1.5px solid rgba(128,128,128,0.15); cursor: pointer;
    font-size: 18px; text-align: center; transition: all 0.2s;
    background: none; display: flex; flex-direction: column;
    align-items: center; gap: 3px;
  }
  .a11y-sound-btn span { font-size: 9px; font-weight: 600; opacity: 0.5; }
  .a11y-sound-btn.active { border-color: var(--a11y-primary, #6384ff); background: rgba(99,132,255,0.08); }
  .a11y-sound-btn.active span { opacity: 1; }

  /* Voice read button */
  .a11y-voice-btns { display: flex; gap: 6px; margin-top: 10px; }
  .a11y-btn {
    flex: 1; padding: 8px 10px; border-radius: 8px; font-size: 11px;
    font-weight: 600; cursor: pointer; border: 1.5px solid rgba(128,128,128,0.15);
    background: none; transition: all 0.15s; font-family: inherit;
  }
  .a11y-btn:hover { background: rgba(128,128,128,0.08); }
  .a11y-btn.primary { background: var(--a11y-primary, #6384ff); color: white; border-color: transparent; }
  .a11y-btn.primary:hover { filter: brightness(1.1); }

  /* Reset link */
  .a11y-reset {
    display: block; text-align: center; font-size: 11px;
    opacity: 0.4; cursor: pointer; padding: 12px;
    background: none; border: none; width: 100%;
    font-family: inherit; transition: opacity 0.15s;
  }
  .a11y-reset:hover { opacity: 0.8; }
`;

//Web Audio ambient noise 
let audioCtx = null;
let activeSound = null;

function stopAmbient() {
  if (activeSound) {
    try { activeSound.stop(); } catch {}
    activeSound = null;
  }
}

function playAmbient(type, freq) {
  stopAmbient();
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 1);
  gainNode.connect(audioCtx.destination);

  if (type === "noise") {
    // Brown noise
    const bufferSize = audioCtx.sampleRate * 4;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    // Shape with filter
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = freq;
    src.connect(filter);
    filter.connect(gainNode);
    src.start();
    activeSound = src;
  } else {
    // Soft lo-fi drone
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const osc2 = audioCtx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = freq * 1.5;
    const g2 = audioCtx.createGain();
    g2.gain.value = 0.4;
    osc2.connect(g2);
    g2.connect(gainNode);
    osc.connect(gainNode);
    osc.start();
    osc2.start();
    activeSound = { stop: () => { osc.stop(); osc2.stop(); } };
  }
}

export default function AccessibilityWidget() {
  const stored = load();

  const [open, setOpen]             = useState(false);
  const [themeId, setThemeId]       = useState(stored.themeId    || "default");
  const [fontSize, setFontSize]     = useState(stored.fontSize   || 16);
  const [highContrast, setHighContrast] = useState(stored.highContrast || false);
  const [grayscale, setGrayscale]   = useState(stored.grayscale  || false);
  const [reduceMotion, setReduceMotion] = useState(stored.reduceMotion || false);
  const [dyslexic, setDyslexic]     = useState(stored.dyslexic   || false);
  const [highlightLinks, setHighlightLinks] = useState(stored.highlightLinks || false);
  const [largeCursor, setLargeCursor]   = useState(stored.largeCursor || false);
  const [speechRate, setSpeechRate] = useState(stored.speechRate || 1.0);
  const [activeSound, setActiveSoundId] = useState(stored.activeSound || null);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  useEffect(() => {
    if (!document.getElementById("a11y-widget-css")) {
      const el = document.createElement("style");
      el.id = "a11y-widget-css";
      el.textContent = WIDGET_CSS;
      document.head.appendChild(el);
    }
    // Dyslexic font import
    if (!document.getElementById("a11y-dyslexic-font")) {
      const el = document.createElement("link");
      el.id = "a11y-dyslexic-font";
      el.rel = "stylesheet";
      el.href = "https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic.css";
      document.head.appendChild(el);
    }
    return () => { stopAmbient(); };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--a11y-primary",  theme.primary);
    root.style.setProperty("--a11y-bg",       theme.bg);
    root.style.setProperty("--a11y-surface",  theme.surface);
    root.style.setProperty("--a11y-text",     theme.text);
    document.body.setAttribute("data-a11y-theme", themeId);
    document.body.setAttribute("data-a11y-dark",  theme.dark ? "true" : "false");
    save({ themeId, fontSize, highContrast, grayscale, reduceMotion, dyslexic, highlightLinks, largeCursor, speechRate, activeSound: activeSound });
  }, [themeId, theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    save({ ...load(), fontSize });
  }, [fontSize]);

  useEffect(() => {
    const cl = document.documentElement.classList;
    const apply = (flag, cls) => flag ? cl.add(cls) : cl.remove(cls);
    apply(highContrast,   "a11y-high-contrast");
    apply(grayscale,      "a11y-grayscale");
    apply(reduceMotion,   "a11y-reduce-motion");
    apply(dyslexic,       "a11y-dyslexic");
    apply(highlightLinks, "a11y-highlight-links");
    apply(largeCursor,    "a11y-cursor-large");
    save({ ...load(), highContrast, grayscale, reduceMotion, dyslexic, highlightLinks, largeCursor });
  }, [highContrast, grayscale, reduceMotion, dyslexic, highlightLinks, largeCursor]);


  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)
          && triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggleSound = useCallback((sound) => {
    if (activeSound === sound.id) {
      stopAmbient();
      setActiveSoundId(null);
      save({ ...load(), activeSound: null });
    } else {
      playAmbient(sound.type, sound.freq);
      setActiveSoundId(sound.id);
      save({ ...load(), activeSound: sound.id });
    }
  }, [activeSound]);

  const readScreen = () => {
    window.speechSynthesis.cancel();
    const text = document.body.innerText.replace(/\s+/g, " ").slice(0, 3000);
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = speechRate;
    window.speechSynthesis.speak(utt);
  };
  const stopReading = () => window.speechSynthesis.cancel();

  const resetAll = () => {
    setThemeId("default");
    setFontSize(16);
    setHighContrast(false);
    setGrayscale(false);
    setReduceMotion(false);
    setDyslexic(false);
    setHighlightLinks(false);
    setLargeCursor(false);
    setSpeechRate(1.0);
    stopAmbient();
    setActiveSoundId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const Pill = ({ on, toggle, accent }) => (
    <button
      role="switch" aria-checked={on}
      onClick={toggle}
      className={`a11y-pill ${on ? "on" : ""}`}
      style={{ background: on ? (accent || theme.primary) : "rgba(128,128,128,0.25)" }}
    />
  );
  const Section = ({ label, children }) => (
    <div className="a11y-section">
      <div className="a11y-section-label">{label}</div>
      {children}
    </div>
  );

  const ToggleRow = ({ icon, label, sub, on, toggle, accent }) => (
    <div className="a11y-toggle-row">
      <div className="a11y-row-label">
        <span className="a11y-row-icon">{icon}</span>
        <div>
          <div className="a11y-row-text">{label}</div>
          {sub && <div className="a11y-row-sub">{sub}</div>}
        </div>
      </div>
      <Pill on={on} toggle={toggle} accent={accent} />
    </div>
  );

  return (
    <>
      <button
        id="a11y-trigger"
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        aria-label="Accessibility settings"
        aria-expanded={open}
        title="Accessibility & theme settings"
        style={{ "--a11y-primary": theme.primary }}
      >
 <MdOutlineAccessibility size={22} />
      </button>

      <div
        id="a11y-panel"
        ref={panelRef}
        className={open ? "open" : "closed"}
        role="dialog"
        aria-label="Accessibility settings panel"
        aria-modal="false"
      >
        <div
          className="a11y-panel-inner"
          style={{
            background: theme.surface || "#fff",
            color: theme.text,
            border: `1px solid ${theme.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          }}
        >

          <div className="a11y-header">
            <div className="a11y-header-title">
              <span>Accessibility Settings</span>
            </div>
            <button
              className="a11y-close"
              onClick={() => setOpen(false)}
              aria-label="Close accessibility panel"
              style={{ color: theme.text }}
            >✕</button>
          </div>

          <Section>
      
            <div className="a11y-toggle-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="a11y-row-label">
                  <span className="a11y-row-icon">Aa</span>
                  <div>
                    <div className="a11y-row-text">Text Size</div>
                    <div className="a11y-row-sub">Adjust text size for easier reading</div>
                  </div>
                </div>
                <span className="a11y-slider-val">{fontSize}px</span>
              </div>
              <div className="a11y-slider-row">
                <span style={{ fontSize: 10, opacity: 0.4 }}>A</span>
                <input
                  type="range" className="a11y-slider"
                  min="13" max="24" step="1" value={fontSize}
                  onChange={e => setFontSize(Number(e.target.value))}
                  aria-label="Text size"
                />
                <span style={{ fontSize: 16, opacity: 0.4 }}>A</span>
              </div>
            </div>

{/*People with low vision or light sensitivity*/}
{/*color blindness or visual sensitivity*/}
color blindness or visual sensitivity
            <ToggleRow icon={<FaAdjust />} label="High Contrast"  sub="Sharper edges, stronger colours" on={highContrast}   toggle={() => setHighContrast(v => !v)} />
            <ToggleRow icon={<FaEyeSlash />} label="Grayscale"       sub="For colour-blind users"          on={grayscale}      toggle={() => setGrayscale(v => !v)} />
            <ToggleRow icon={<FaFont />} label="Dyslexia Font"   sub="OpenDyslexic typeface"           on={dyslexic}       toggle={() => setDyslexic(v => !v)} />
            <ToggleRow icon={<FaLink />} label="Highlight Links"  sub="Outline all clickable elements"  on={highlightLinks} toggle={() => setHighlightLinks(v => !v)} />
            <ToggleRow icon={<FaMousePointer />} label="Large Cursor"    sub="Bigger mouse pointer"             on={largeCursor}    toggle={() => setLargeCursor(v => !v)} />
          </Section>

    
          <Section label="Motion">
            <ToggleRow
              icon={<FaBan />}
              label="Reduce Motion"
              sub="Disables all animations & transitions"
              on={reduceMotion}
              toggle={() => setReduceMotion(v => !v)}
              accent="#f43f5e"
            />
          </Section>

          <Section label="Focus Sounds">
            <div className="a11y-sounds">
              {SOUNDS.map(s => (
                <button
                  key={s.id}
                  className={`a11y-sound-btn ${activeSound === s.id ? "active" : ""}`}
                  onClick={() => toggleSound(s)}
                  aria-label={`${s.label} sound${activeSound === s.id ? " (playing)" : ""}`}
                  style={{
                    color: theme.text,
                    borderColor: activeSound === s.id ? theme.primary : "rgba(128,128,128,0.15)",
                    background: activeSound === s.id ? `${theme.primary}12` : "transparent",
                  }}
                >
                  {s.icon}
                  <span>{s.label}{activeSound === s.id ? " ▶" : ""}</span>
                </button>
              ))}
            </div>
            {activeSound && (
              <div style={{ fontSize: 10, opacity: 0.4, marginTop: 8, textAlign: "center" }}>
                Click again to stop · Generated in-browser
              </div>
            )}
          </Section>

 
          <Section label="Screen Reader">
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div className="a11y-row-label">
                  <span className="a11y-row-icon">⚡</span>
                  <div>
                    <div className="a11y-row-text">Reading Speed</div>
                  </div>
                </div>
                <span className="a11y-slider-val">{speechRate.toFixed(1)}×</span>
              </div>
              <div className="a11y-slider-row">
                <span style={{ fontSize: 10, opacity: 0.4 }}>0.5×</span>
                <input
                  type="range" className="a11y-slider"
                  min="0.5" max="2.0" step="0.1" value={speechRate}
                  onChange={e => setSpeechRate(Number(e.target.value))}
                  aria-label="Reading speed"
                />
                <span className="a11y-row-icon"><FaBolt /></span>
                <span style={{ fontSize: 10, opacity: 0.4 }}>2×</span>
              </div>
            </div>
            <div className="a11y-voice-btns">
              <button className="a11y-btn primary" onClick={readScreen} aria-label="Read page aloud">
              <FaVolumeUp /> Read Page
              </button>
              <button
                className="a11y-btn"
                onClick={stopReading}
                aria-label="Stop reading"
                style={{ color: theme.text }}
              >
       <FaStop /> Stop
              </button>
            </div>
          </Section>

          <button className="a11y-reset" onClick={resetAll} style={{ color: theme.text }}>
          <MdOutlineAccessibility /> Reset all settings
          </button>
        </div>
      </div>
    </>
  );
}