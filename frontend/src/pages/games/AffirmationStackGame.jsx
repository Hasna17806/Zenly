import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const AFFIRMATIONS = [
  { text: "I am enough",          emoji: "🌟", color: { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.35)",  text: "#FDE68A" } },
  { text: "I deserve peace",      emoji: "🕊️", color: { bg: "rgba(147,197,253,0.12)", border: "rgba(147,197,253,0.35)", text: "#BAE6FD" } },
  { text: "I grow every day",     emoji: "🌱", color: { bg: "rgba(134,239,172,0.12)", border: "rgba(134,239,172,0.35)", text: "#86EFAC" } },
  { text: "I am resilient",       emoji: "💎", color: { bg: "rgba(196,181,253,0.12)", border: "rgba(196,181,253,0.35)", text: "#C4B5FD" } },
  { text: "I choose joy",         emoji: "☀️", color: { bg: "rgba(253,186,116,0.12)", border: "rgba(253,186,116,0.35)", text: "#FED7AA" } },
  { text: "I am capable",         emoji: "⚡", color: { bg: "rgba(253,224,71,0.12)",  border: "rgba(253,224,71,0.35)",  text: "#FEF08A" } },
  { text: "I am worthy of love",  emoji: "💖", color: { bg: "rgba(249,168,212,0.12)", border: "rgba(249,168,212,0.35)", text: "#FBCFE8" } },
  { text: "I trust myself",       emoji: "🔑", color: { bg: "rgba(94,234,212,0.12)",  border: "rgba(94,234,212,0.35)",  text: "#99F6E4" } },
];

/* ── Sparkle burst on add ── */
const Sparkle = ({ id, onDone }) => {
  const angle = Math.random() * 360;
  const dist  = 50 + Math.random() * 70;
  const size  = 5 + Math.random() * 7;
  const dur   = 0.5 + Math.random() * 0.4;
  const colors = ["#FDE68A","#FBCFE8","#BAE6FD","#86EFAC","#C4B5FD","#FED7AA"];
  const c = colors[Math.floor(Math.random() * colors.length)];
  const dx = Math.cos((angle * Math.PI) / 180) * dist;
  const dy = Math.sin((angle * Math.PI) / 180) * dist;
  useEffect(() => { const t = setTimeout(onDone, dur * 1000 + 100); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "absolute", left: "50%", top: "50%",
      width: size, height: size,
      borderRadius: Math.random() > 0.5 ? "50%" : "2px",
      background: c,
      animation: `sparkleOut ${dur}s ease-out forwards`,
      "--dx": `${dx}px`, "--dy": `${dy}px`,
      pointerEvents: "none", zIndex: 10,
    }} />
  );
};

/* ── Stack card ── */
const StackCard = ({ aff, index, total }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: "0.75rem",
    background: aff.color.bg,
    border: `1px solid ${aff.color.border}`,
    borderRadius: "14px",
    padding: "0.65rem 1rem",
    animation: "slideUp 0.45s cubic-bezier(0.34,1.5,0.64,1) both",
    position: "relative",
    boxShadow: `0 4px 20px ${aff.color.border.replace("0.35", "0.15")}`,
  }}>
    <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{aff.emoji}</span>
    <span style={{
      fontFamily: "'Playfair Display', serif",
      fontStyle: "italic",
      fontSize: "0.9rem",
      color: aff.color.text,
      lineHeight: 1.4,
    }}>"{aff.text}"</span>
    <div style={{
      marginLeft: "auto", flexShrink: 0,
      width: 20, height: 20, borderRadius: "50%",
      background: "rgba(134,239,172,0.2)",
      border: "1px solid rgba(134,239,172,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.65rem", color: "#86EFAC",
    }}>✓</div>
  </div>
);

const AffirmationStackGame = () => {
  const navigate = useNavigate();

  const [stack,   setStack]   = useState([]);
  const [current, setCurrent] = useState(null);
  const [message, setMessage] = useState("");
  const [msgKey,  setMsgKey]  = useState(0);
  const [sparkles, setSparkles] = useState([]);
  const [cardAnim, setCardAnim] = useState(false);
  const sparkleId = useRef(0);
  const msgTimer  = useRef(null);

  const remaining = () => AFFIRMATIONS.filter(a => !stack.find(s => s.text === a.text));

  useEffect(() => { pickNew(); }, []);

  const pickNew = (currentStack = stack) => {
    const rem = AFFIRMATIONS.filter(a => !currentStack.find(s => s.text === a.text));
    if (rem.length === 0) { setCurrent(null); return; }
    const next = rem[Math.floor(Math.random() * rem.length)];
    setCurrent(next);
    setCardAnim(true);
    setTimeout(() => setCardAnim(false), 50);
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setMsgKey(k => k + 1);
    clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMessage(""), 2500);
  };

  const addToStack = () => {
    if (!current) return;
    const newStack = [...stack, current];
    setStack(newStack);

    // Sparkles
    const ids = Array.from({ length: 12 }, () => sparkleId.current++);
    setSparkles(s => [...s, ...ids]);

    showMessage(`✨ "${current.text}" added!`);
    pickNew(newStack);

    if (newStack.length === AFFIRMATIONS.length) {
      showMessage("🎉 You've collected them all!");
    }
  };

  const skip = () => {
    showMessage("Finding another affirmation…");
    pickNew();
  };

  const reset = () => {
    setStack([]); setMessage("");
    setCurrent(null); setSparkles([]);
    setTimeout(() => pickNew([]), 50);
  };

  const progressPct = (stack.length / AFFIRMATIONS.length) * 100;
  const isComplete  = stack.length === AFFIRMATIONS.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --bg: #0c0905;
          --surface: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --gold: #FDE68A;
          --amber: #F59E0B;
          --rose: #FBCFE8;
          --text: #FEF9EE;
          --muted: #8a7a5a;
          --radius: 24px;
        }

        .as-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 80% 55% at 50% -5%, rgba(245,158,11,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 40% 30% at 5%  95%, rgba(249,168,212,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 35% 25% at 95% 80%, rgba(253,186,116,0.08) 0%, transparent 55%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        .as-main { padding: 5rem 1.5rem 4rem; display: flex; justify-content: center; }
        .as-wrap { width: 100%; max-width: 480px; }

        /* Header */
        .as-header { text-align: center; margin-bottom: 1.8rem; }
        .as-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(253,230,138,0.1); border: 1px solid rgba(253,230,138,0.25);
          color: #FDE68A; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.35rem 0.9rem; border-radius: 50px; margin-bottom: 0.9rem;
        }
        .as-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5vw, 2.8rem); font-weight: 600;
          background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 45%, #FBCFE8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.3rem;
        }
        .as-sub { color: var(--muted); font-size: 0.9rem; }

        /* Stats */
        .as-stats { display: flex; gap: 0.8rem; margin-bottom: 1.2rem; }
        .as-stat {
          flex: 1; background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 0.65rem 0.8rem; text-align: center;
        }
        .as-stat-val {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; line-height: 1; color: var(--gold);
        }
        .as-stat-lbl { font-size: 0.63rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 0.15rem; }

        /* Progress */
        .as-prog-track { height: 4px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; margin-bottom: 1.4rem; }
        .as-prog-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, #F59E0B, #FBCFE8, #FDE68A);
          transition: width 0.6s cubic-bezier(0.34,1.5,0.64,1);
        }

        /* Stack area */
        .as-stack-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 1.2rem;
          min-height: 200px; margin-bottom: 1rem;
          display: flex; flex-direction: column; gap: 0.5rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative; overflow: hidden;
        }
        .as-stack-wrap::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(253,230,138,0.3), transparent);
        }
        .as-stack-lbl {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 0.3rem;
        }
        .as-stack-empty {
          flex: 1; display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.12);
          font-family: 'Playfair Display', serif;
          font-style: italic; font-size: 0.95rem;
        }

        /* Current card */
        .as-current-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 2rem 1.8rem;
          text-align: center; margin-bottom: 1rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative; overflow: hidden;
        }
        .as-current-glow {
          position: absolute; inset: 0; border-radius: var(--radius);
          background: radial-gradient(ellipse 60% 40% at 50% 100%, rgba(245,158,11,0.08), transparent);
          pointer-events: none;
        }
        .as-sparkle-container {
          position: absolute; inset: 0; pointer-events: none; overflow: visible;
        }
        .as-current-emoji { font-size: 2.8rem; margin-bottom: 0.7rem; display: block; animation: floatIcon 3s ease-in-out infinite; }
        .as-current-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.7rem; font-style: italic; font-weight: 600;
          color: var(--gold); line-height: 1.3; margin-bottom: 1.6rem;
        }
        .as-current-tag {
          display: inline-block;
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--muted);
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          padding: 0.25rem 0.7rem; border-radius: 50px; margin-bottom: 1.2rem;
        }

        /* Buttons */
        .as-btn-row { display: flex; gap: 0.8rem; position: relative; z-index: 1; }
        .as-add-btn {
          flex: 1.5; padding: 0.95rem;
          background: linear-gradient(135deg, #B45309, #F59E0B, #FDE68A);
          color: #1a0f00; font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 700;
          border: none; border-radius: 14px; cursor: pointer;
          box-shadow: 0 8px 28px rgba(245,158,11,0.35);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .as-add-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(245,158,11,0.5); }
        .as-add-btn:active { transform: translateY(0); }
        .as-skip-btn {
          flex: 1; padding: 0.95rem;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          color: var(--muted); font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 600;
          border-radius: 14px; cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .as-skip-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }

        /* Message */
        .as-message {
          text-align: center; font-family: 'Playfair Display', serif;
          font-style: italic; font-size: 0.95rem;
          color: var(--gold); min-height: 1.4rem;
          animation: msgFade 2.5s ease-out forwards;
        }

        /* ── Win overlay ── */
        .as-overlay {
          position: fixed; inset: 0;
          background: rgba(8,6,2,0.88); backdrop-filter: blur(14px);
          display: flex; align-items: center; justify-content: center;
          z-index: 300; animation: fadeIn 0.35s ease; padding: 1.5rem;
        }
        .as-modal {
          background: #150e04; border: 1px solid rgba(253,230,138,0.15);
          border-radius: var(--radius); padding: 2.5rem 2rem;
          max-width: 380px; width: 100%; text-align: center;
          box-shadow: 0 60px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(245,158,11,0.1);
          animation: popIn 0.5s cubic-bezier(0.34,1.5,0.64,1) both;
          position: relative; overflow: hidden;
        }
        .as-modal::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(253,230,138,0.5), transparent);
        }
        .as-modal-icon { font-size: 3.5rem; display: block; animation: floatIcon 3s ease-in-out infinite; margin-bottom: 0.8rem; }
        .as-modal-title {
          font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 600;
          background: linear-gradient(135deg, #FDE68A, #FBCFE8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.4rem;
        }
        .as-modal-sub { color: var(--muted); font-size: 0.88rem; margin-bottom: 1.4rem; }
        .as-modal-stack {
          display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: center;
          margin-bottom: 1.6rem;
        }
        .as-modal-chip {
          font-size: 0.75rem; padding: 0.3rem 0.7rem;
          background: rgba(253,230,138,0.08); border: 1px solid rgba(253,230,138,0.2);
          border-radius: 50px; color: #FDE68A;
        }
        .as-modal-btns { display: flex; gap: 0.8rem; }
        .as-modal-btn-ghost {
          flex: 1; padding: 0.9rem;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          color: var(--muted); font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 600;
          border-radius: 14px; cursor: pointer; transition: color 0.2s, border-color 0.2s;
        }
        .as-modal-btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
        .as-modal-btn-solid {
          flex: 1.5; padding: 0.9rem;
          background: linear-gradient(135deg, #B45309, #F59E0B);
          color: #1a0f00; font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          border: none; border-radius: 14px; cursor: pointer;
          box-shadow: 0 6px 24px rgba(245,158,11,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .as-modal-btn-solid:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(245,158,11,0.45); }

        /* Animations */
        @keyframes slideUp {
          from { transform: translateY(16px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes sparkleOut {
          0%   { transform: translate(-50%,-50%) translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(-50%,-50%) translate(var(--dx),var(--dy)) scale(0); opacity: 0; }
        }
        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-7px); }
        }
        @keyframes msgFade {
          0%   { opacity: 0; transform: translateY(6px); }
          15%  { opacity: 1; transform: translateY(0); }
          75%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes popIn {
          from { transform: scale(0.82); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="as-root">
        <Navbar />

        <main className="as-main">
          <div className="as-wrap">

            {/* Header */}
            <div className="as-header">
              <div className="as-badge">✦ Affirmation Building</div>
              <h1 className="as-title">Affirmation Stack</h1>
              <p className="as-sub">Collect the beliefs that lift you up</p>
            </div>

            {/* Stats */}
            <div className="as-stats">
              <div className="as-stat">
                <div className="as-stat-val">{stack.length * 10}</div>
                <div className="as-stat-lbl">Points</div>
              </div>
              <div className="as-stat">
                <div className="as-stat-val" style={{ color: "#86EFAC" }}>
                  {stack.length}<span style={{ fontSize: "1rem", color: "var(--muted)" }}>/{AFFIRMATIONS.length}</span>
                </div>
                <div className="as-stat-lbl">Collected</div>
              </div>
              <div className="as-stat">
                <div className="as-stat-val" style={{ color: "#FBCFE8" }}>{AFFIRMATIONS.length - stack.length}</div>
                <div className="as-stat-lbl">Remaining</div>
              </div>
            </div>

            {/* Progress */}
            <div className="as-prog-track">
              <div className="as-prog-fill" style={{ width: `${progressPct}%` }} />
            </div>

            {/* Stack */}
            <div className="as-stack-wrap">
              <p className="as-stack-lbl">✦ Your collection</p>
              {stack.length === 0
                ? <div className="as-stack-empty">Your stack is empty — add affirmations!</div>
                : [...stack].reverse().slice(0, 5).map((aff, i) => (
                    <StackCard key={aff.text} aff={aff} index={i} total={stack.length} />
                  ))
              }
              {stack.length > 5 && (
                <div style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--muted)", marginTop: "0.3rem" }}>
                  +{stack.length - 5} more in your stack
                </div>
              )}
            </div>

            {/* Current card */}
            {current && !isComplete && (
              <div className="as-current-wrap">
                <div className="as-current-glow" />
                <div className="as-sparkle-container">
                  {sparkles.map(id => (
                    <Sparkle key={id} id={id} onDone={() => setSparkles(s => s.filter(x => x !== id))} />
                  ))}
                </div>
                <span className="as-current-emoji">{current.emoji}</span>
                <p className="as-current-tag">Today's affirmation</p>
                <div className="as-current-text">"{current.text}"</div>
                <div className="as-btn-row">
                  <button className="as-add-btn" onClick={addToStack}>+ Add to Stack</button>
                  <button className="as-skip-btn" onClick={skip}>Skip →</button>
                </div>
              </div>
            )}

            {/* Message */}
            {message && <div key={msgKey} className="as-message">{message}</div>}

          </div>
        </main>

        <Footer />
      </div>

      {/* Win modal */}
      {isComplete && (
        <div className="as-overlay">
          <div className="as-modal">
            <span className="as-modal-icon">🌟</span>
            <h2 className="as-modal-title">Stack Complete!</h2>
            <p className="as-modal-sub">You've built a full tower of self-belief. Hold onto every one.</p>
            <div className="as-modal-stack">
              {stack.map(a => (
                <div key={a.text} className="as-modal-chip">{a.emoji} {a.text}</div>
              ))}
            </div>
            <div className="as-modal-btns">
              <button className="as-modal-btn-ghost" onClick={reset}>Play Again</button>
              <button className="as-modal-btn-solid" onClick={() => navigate("/challenges")}>Finish →</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AffirmationStackGame;