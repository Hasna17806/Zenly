// ColorCalmGame.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import GameControls from "../../components/GameControls";
import axios from "axios";

const COLOR_PALETTE = [
  { name: "Lavender", color: "#a78bfa", emotion: "Peace" },
  { name: "Mint",     color: "#5eead4", emotion: "Renewal" },
  { name: "Peach",    color: "#fbbf24", emotion: "Warmth" },
  { name: "Rose",     color: "#f472b6", emotion: "Comfort" },
  { name: "Sky",      color: "#60a5fa", emotion: "Clarity" },
  { name: "Sage",     color: "#84cc16", emotion: "Growth" },
];

const MANDALA_SECTIONS = [
  { id: 0, label: "Center",       defaultColor: "#3d5a58" },
  { id: 1, label: "Inner petals", defaultColor: "#7a9e9b" },
  { id: 2, label: "Middle ring",  defaultColor: "#9ab5b2" },
  { id: 3, label: "Outer petals", defaultColor: "#c8e0db" },
  { id: 4, label: "Border",       defaultColor: "#5b9e96" },
  { id: 5, label: "Background",   defaultColor: "#e8f4f1" },
];

const AFFIRMATIONS = [
  "This color brings me peace",
  "I am creating calm",
  "Every stroke is self-care",
  "My mind is quiet now",
  "I am present in this moment",
  "Color flows freely through me",
];

/* ─── tiny hook: random affirmation toast ─── */
function useAffirmation() {
  const [text, setText] = useState("");
  const timer = useRef(null);
  const show = () => {
    clearTimeout(timer.current);
    setText(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
    timer.current = setTimeout(() => setText(""), 2700);
  };
  return [text, show];
}

/* ─── Mandala SVG (pure, no inline handlers) ─── */
function MandalaSVG({ colors, onSection }) {
  const ns = "http://www.w3.org/2000/svg";

  const outerPetals = [...Array(8)].map((_, i) => {
    const a = (i * 45 * Math.PI) / 180;
    const x1 = 250 + Math.cos(a) * 178, y1 = 250 + Math.sin(a) * 178;
    const x2 = 250 + Math.cos(a + 0.38) * 118, y2 = 250 + Math.sin(a + 0.38) * 118;
    const x3 = 250 + Math.cos(a - 0.38) * 118, y3 = 250 + Math.sin(a - 0.38) * 118;
    return (
      <polygon
        key={`op-${i}`}
        points={`${x1},${y1} ${x2},${y2} 250,250 ${x3},${y3}`}
        fill={colors[3]}
        style={sectionStyle}
        onClick={() => onSection(3)}
      />
    );
  });

  const innerPetals = [...Array(6)].map((_, i) => {
    const a = (i * 60 * Math.PI) / 180;
    const x1 = 250 + Math.cos(a) * 78, y1 = 250 + Math.sin(a) * 78;
    const x2 = 250 + Math.cos(a + 0.5) * 38, y2 = 250 + Math.sin(a + 0.5) * 38;
    const x3 = 250 + Math.cos(a - 0.5) * 38, y3 = 250 + Math.sin(a - 0.5) * 38;
    return (
      <polygon
        key={`ip-${i}`}
        points={`${x1},${y1} ${x2},${y2} 250,250 ${x3},${y3}`}
        fill={colors[1]}
        style={sectionStyle}
        onClick={() => onSection(1)}
      />
    );
  });

  const ringDots = [...Array(12)].map((_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return (
      <circle
        key={`rd-${i}`}
        cx={250 + Math.cos(a) * 100}
        cy={250 + Math.sin(a) * 100}
        r={6}
        fill={colors[2]}
        stroke="rgba(255,255,255,0.7)"
        strokeWidth={1.5}
      />
    );
  });

  return (
    <svg viewBox="0 0 500 500" style={styles.svg}>
      {/* Background */}
      <rect x={0} y={0} width={500} height={500} fill={colors[5]} style={sectionStyle} onClick={() => onSection(5)} />

      {/* Border ring */}
      <circle cx={250} cy={250} r={228} fill="none" stroke={colors[4]} strokeWidth={22} style={sectionStyle} onClick={() => onSection(4)} />
      <circle cx={250} cy={250} r={210} fill="none" stroke={colors[4]} strokeWidth={2} strokeDasharray="4 8" opacity={0.4} style={{ pointerEvents: "none" }} />

      {/* Outer petals */}
      {outerPetals}

      {/* Middle ring */}
      <circle cx={250} cy={250} r={100} fill={colors[2]} style={sectionStyle} onClick={() => onSection(2)} />
      {ringDots}

      {/* Inner petals */}
      {innerPetals}

      {/* Inner glass ring */}
      <circle cx={250} cy={250} r={35} fill="rgba(255,255,255,0.2)" style={{ pointerEvents: "none" }} />

      {/* Center */}
      <circle cx={250} cy={250} r={28} fill={colors[0]} style={sectionStyle} onClick={() => onSection(0)} />
      <circle cx={244} cy={244} r={9} fill="rgba(255,255,255,0.3)" style={{ pointerEvents: "none" }} />
    </svg>
  );
}

/* ─── Modal ─── */
function Modal({ icon, title, sub, children }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <span style={styles.modalIcon}>{icon}</span>
        <h3 style={styles.modalTitle}>{title}</h3>
        <p style={styles.modalSub}>{sub}</p>
        <div style={styles.modalBtns}>{children}</div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
const ColorCalmGame = () => {
  const navigate = useNavigate();

  const initialColors = () => {
    const c = {};
    MANDALA_SECTIONS.forEach(s => (c[s.id] = s.defaultColor));
    return c;
  };

  const [colors, setColors] = useState(initialColors);
  const [selected, setSelected] = useState(COLOR_PALETTE[0]);
  const [showStop, setShowStop] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [affirmation, showAffirmation] = useAffirmation();

  const changedCount = MANDALA_SECTIONS.filter(s => colors[s.id] !== s.defaultColor).length;
  const progress = Math.round((changedCount / MANDALA_SECTIONS.length) * 100);
  const canComplete = changedCount >= 4;

  const handleSection = (id) => {
    setColors(prev => ({ ...prev, [id]: selected.color }));
    showAffirmation();
  };

  const resetColoring = () => {
    setColors(initialColors());
  };

  const completeSession = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { completed: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCompletion(true);
      setTimeout(() => navigate("/challenges"), 3500);
    } catch (err) {
      console.error(err);
      alert("Could not save session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{cssString}</style>
      <div style={styles.root}>
        <Navbar />

        <main style={styles.container}>
          {/* ── Left: Mandala ── */}
          <div style={styles.mandalaCard}>
            <MandalaSVG colors={colors} onSection={handleSection} />

            {/* Progress bar */}
            <div style={{ width: "100%", maxWidth: 420 }}>
              <div style={styles.progressWrap}>
                <div style={{ ...styles.progressBar, width: `${progress}%` }} />
              </div>
              <p style={styles.progressLabel}>
                {changedCount} of {MANDALA_SECTIONS.length} sections colored
              </p>
              <button className="cc-btn cc-btn-reset" onClick={resetColoring}>
                ◎ Reset coloring
              </button>
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div style={styles.sidebar}>
            <div style={styles.card}>
              <h3 style={styles.paletteTitle}>Choose your color</h3>
              <div style={styles.colorGrid}>
                {COLOR_PALETTE.map(c => (
                  <div key={c.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}
                    onClick={() => setSelected(c)}>
                    <div
                      className="cc-swatch"
                      style={{
                        backgroundColor: c.color,
                        border: selected.name === c.name ? "3px solid #3d5a58" : "3px solid transparent",
                        boxShadow: selected.name === c.name ? "0 4px 16px rgba(61,90,88,.25)" : "0 2px 8px rgba(0,0,0,.09)",
                        transform: selected.name === c.name ? "scale(1.07)" : "scale(1)",
                      }}
                    />
                    <span style={styles.swatchName}>{c.name}</span>
                  </div>
                ))}
              </div>

              <div style={styles.divider} />

              <div style={{ marginTop: ".75rem" }}>
                <p style={styles.sectionsTitle}>Sections</p>
                {MANDALA_SECTIONS.map(s => (
                  <div key={s.id} style={styles.sectionRow}>
                    <span style={{ fontSize: ".82rem", color: "#3d5a58" }}>{s.label}</span>
                    <div style={{ ...styles.sectionDot, backgroundColor: colors[s.id] }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...styles.card, gap: ".5rem", display: "flex", flexDirection: "column" }}>
              <button
                className="cc-btn cc-btn-complete"
                onClick={completeSession}
                disabled={!canComplete || loading}
                title={!canComplete ? "Color at least 4 sections first" : ""}
              >
                {loading ? "Saving…" : "✓ Complete challenge"}
              </button>
              <button className="cc-btn cc-btn-stop" onClick={() => setShowStop(true)}>
                ← Stop &amp; exit
              </button>
            </div>
          </div>
        </main>

        <Footer />

        {/* Affirmation toast */}
        {affirmation && (
          <div className="cc-affirmation">✦ {affirmation} ✦</div>
        )}

        {/* Stop modal */}
        {showStop && (
          <Modal icon="🎨" title="Leave your coloring?" sub="Your artwork won't be saved.">
            <button className="cc-mbtn cc-mbtn-ghost" onClick={() => setShowStop(false)}>Stay</button>
            <button className="cc-mbtn cc-mbtn-danger" onClick={() => navigate("/challenges")}>Leave</button>
          </Modal>
        )}

        {/* Completion modal */}
        {showCompletion && (
          <Modal icon="🦋" title="Beautiful creation!" sub="Your mandala is a reflection of your inner peace. Redirecting…">
            <button className="cc-mbtn cc-mbtn-primary" onClick={() => navigate("/challenges")}>Continue</button>
          </Modal>
        )}
      </div>
    </>
  );
};

/* ─────────────────────────────────────────
   Styles
───────────────────────────────────────── */
const sectionStyle = { cursor: "pointer", transition: "filter .15s" };

const styles = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(160deg,#e8f4f1 0%,#ddf0e8 40%,#eaf4f8 100%)",
    fontFamily: "'DM Sans', sans-serif",
  },
  container: {
    maxWidth: 960,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 288px",
    gap: "1.5rem",
    padding: "1.5rem",
    alignItems: "start",
  },
  card: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(12px)",
    borderRadius: 28,
    padding: "1.5rem",
    border: "1px solid rgba(255,255,255,0.9)",
  },
  mandalaCard: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(12px)",
    borderRadius: 28,
    padding: "1.5rem",
    border: "1px solid rgba(255,255,255,0.9)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },
  svg: {
    width: "100%",
    maxWidth: 420,
    height: "auto",
    filter: "drop-shadow(0 8px 32px rgba(61,90,88,.13))",
  },
  progressWrap: {
    width: "100%",
    height: 6,
    background: "#e8f4f1",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg,#7a9e9b,#3d5a58)",
    borderRadius: 999,
    transition: "width .4s ease",
  },
  progressLabel: {
    fontSize: ".7rem",
    color: "#8fa8a5",
    textAlign: "right",
    marginBottom: ".75rem",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  paletteTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "1.25rem",
    color: "#3d5a58",
    marginBottom: ".75rem",
    fontWeight: 400,
    letterSpacing: ".02em",
  },
  colorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: ".6rem",
    marginBottom: "1rem",
  },
  swatchName: {
    fontSize: ".68rem",
    color: "#8fa8a5",
    fontWeight: 500,
    letterSpacing: ".03em",
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg,transparent,#c8e0db,transparent)",
    margin: ".25rem 0",
  },
  sectionsTitle: {
    fontSize: ".72rem",
    color: "#8fa8a5",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: ".08em",
    marginBottom: ".5rem",
  },
  sectionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: ".45rem 0",
    borderBottom: "1px solid rgba(200,224,219,.4)",
  },
  sectionDot: {
    width: 22,
    height: 22,
    borderRadius: 7,
    border: "1.5px solid rgba(61,90,88,.15)",
    flexShrink: 0,
    transition: "background .2s",
  },
  /* Modal */
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(20,35,32,.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#fff",
    borderRadius: 28,
    padding: "2.5rem 2rem",
    maxWidth: 320,
    width: "90%",
    textAlign: "center",
    animation: "ccPop .25s cubic-bezier(.34,1.56,.64,1)",
  },
  modalIcon: { fontSize: "2.5rem", display: "block", marginBottom: ".75rem" },
  modalTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "1.6rem",
    color: "#3d5a58",
    marginBottom: ".4rem",
    fontWeight: 400,
  },
  modalSub: { fontSize: ".88rem", color: "#8fa8a5", marginBottom: "1.5rem" },
  modalBtns: { display: "flex", gap: ".75rem", justifyContent: "center" },
};

/* ─── CSS-class-based interactive styles ─── */
const cssString = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

@keyframes ccPop {
  from { transform: scale(.88); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
@keyframes ccAff {
  0%   { opacity: 0; transform: translateX(-50%) translateY(16px); }
  10%  { opacity: 1; transform: translateX(-50%) translateY(0);    }
  85%  { opacity: 1; }
  100% { opacity: 0; transform: translateX(-50%) translateY(-12px); }
}

.cc-swatch {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 14px;
  cursor: pointer;
  transition: transform .15s, border-color .15s, box-shadow .15s;
}
.cc-swatch:hover { filter: brightness(.93); }

.cc-btn {
  width: 100%;
  padding: .75rem;
  border-radius: 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: .85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background .18s, opacity .18s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .4rem;
  letter-spacing: .01em;
  border: none;
  outline: none;
}
.cc-btn-reset {
  background: #e8f4f1;
  border: 1px solid #c8e0db;
  color: #3d5a58;
}
.cc-btn-reset:hover { background: #c8e0db; }

.cc-btn-complete {
  background: #3d5a58;
  color: #fff;
}
.cc-btn-complete:hover:not(:disabled) { background: #2e4644; }
.cc-btn-complete:disabled {
  background: #c8e0db;
  color: #8fa8a5;
  cursor: not-allowed;
}

.cc-btn-stop {
  background: transparent;
  border: 1px solid #f4b8b8;
  color: #c0524e;
}
.cc-btn-stop:hover { background: #fff5f5; }

.cc-affirmation {
  position: fixed;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(29,55,52,.93);
  color: #fff;
  padding: .8rem 1.8rem;
  border-radius: 40px;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 1.05rem;
  z-index: 999;
  pointer-events: none;
  white-space: nowrap;
  animation: ccAff 2.7s ease-out forwards;
}

.cc-mbtn {
  padding: .6rem 1.4rem;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: .85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all .15s;
  border: none;
}
.cc-mbtn-ghost {
  background: #e8f4f1;
  border: 1px solid #c8e0db;
  color: #3d5a58;
}
.cc-mbtn-ghost:hover { background: #c8e0db; }
.cc-mbtn-danger { background: #e53e3e; color: #fff; }
.cc-mbtn-danger:hover { background: #c53030; }
.cc-mbtn-primary { background: #3d5a58; color: #fff; }
.cc-mbtn-primary:hover { background: #2e4644; }

@media (max-width: 680px) {
  .cc-affirmation {
    white-space: normal;
    text-align: center;
    max-width: 80vw;
    font-size: .95rem;
  }
}
`;

export default ColorCalmGame;