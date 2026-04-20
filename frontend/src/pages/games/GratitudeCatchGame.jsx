import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import GameControls from "../../components/GameControls";

const GRATITUDE_ITEMS = [
  { emoji: "☀️", text: "Warm sunlight" },
  { emoji: "🌸", text: "A kind word" },
  { emoji: "💪", text: "Your strength" },
  { emoji: "🎵", text: "Favorite song" },
  { emoji: "📖", text: "A good book" },
  { emoji: "💝", text: "Someone who cares" },
  { emoji: "🌙", text: "Quiet night" },
  { emoji: "🍵", text: "Warm tea" },
];

const COLORS = [
  { bg: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.45)", glow: "rgba(167,139,250,0.35)" },
  { bg: "rgba(94,234,212,0.15)",  border: "rgba(94,234,212,0.4)",  glow: "rgba(94,234,212,0.3)"  },
  { bg: "rgba(251,191,36,0.15)",  border: "rgba(251,191,36,0.4)",  glow: "rgba(251,191,36,0.3)"  },
  { bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.4)", glow: "rgba(248,113,113,0.3)" },
  { bg: "rgba(129,140,248,0.18)", border: "rgba(129,140,248,0.45)", glow: "rgba(129,140,248,0.35)" },
];

/* ── Catch burst ── */
const CatchBurst = ({ x, y, id, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 600); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "absolute", left: `${x}%`, top: `${y}%`,
      width: 70, height: 70,
      transform: "translate(-50%,-50%)",
      borderRadius: "50%",
      border: "2px solid rgba(94,234,212,0.7)",
      animation: "catchBurst 0.6s ease-out forwards",
      pointerEvents: "none", zIndex: 20,
    }} />
  );
};

/* ── Floating affirmation ── */
const AffirmChip = ({ text, id, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", bottom: "22%", left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(94,234,212,0.12)",
      border: "1px solid rgba(94,234,212,0.3)",
      backdropFilter: "blur(12px)",
      color: "#5eead4",
      fontFamily: "'DM Serif Display', serif",
      fontStyle: "italic",
      fontSize: "0.95rem",
      padding: "0.6rem 1.4rem",
      borderRadius: "50px",
      whiteSpace: "nowrap",
      animation: "affirmRise 2s ease-out forwards",
      zIndex: 300, pointerEvents: "none",
    }}>✨ Grateful for {text}</div>
  );
};

const GratitudeCatchGame = () => {
  const navigate = useNavigate();

  const [score,        setScore]        = useState(0);
  const [fallingItems, setFallingItems] = useState([]);
  const [gameActive,   setGameActive]   = useState(false);
  const [timeLeft,     setTimeLeft]     = useState(30);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showStop,     setShowStop]     = useState(false);
  const [bursts,       setBursts]       = useState([]);
  const [affirmChips,  setAffirmChips]  = useState([]);
  const [missed,       setMissed]       = useState(0);
  const animationRef = useRef(null);
  const burstId  = useRef(0);
  const affirmId = useRef(0);
  const scoreRef = useRef(0);
  const missedRef = useRef(0);
  scoreRef.current  = score;
  missedRef.current = missed;

  useEffect(() => {
    if (!gameActive) return;

    const spawnInterval = setInterval(() => {
      const item   = GRATITUDE_ITEMS[Math.floor(Math.random() * GRATITUDE_ITEMS.length)];
      const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size   = 58 + Math.random() * 24;
      setFallingItems(prev => [...prev, {
        id: Date.now() + Math.random(),
        emoji: item.emoji, text: item.text,
        x: 6 + Math.random() * 88,
        y: 0, color, size,
        speed: 0.6 + Math.random() * 0.6,
      }]);
    }, 900);

    const moveItems = () => {
      setFallingItems(prev => {
        const next = prev.map(it => ({ ...it, y: it.y + it.speed }));
        const fallen = next.filter(it => it.y >= 92);
        if (fallen.length > 0) setMissed(m => m + fallen.length);
        return next.filter(it => it.y < 92);
      });
      animationRef.current = requestAnimationFrame(moveItems);
    };
    animationRef.current = requestAnimationFrame(moveItems);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(spawnInterval);
          cancelAnimationFrame(animationRef.current);
          setGameActive(false);
          setFallingItems([]);
          setShowCompletion(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(timer);
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameActive]);

  const catchItem = (id, emoji, text, x, y) => {
    setFallingItems(prev => prev.filter(it => it.id !== id));
    setScore(p => p + 1);

    const bid = burstId.current++;
    setBursts(b => [...b, { id: bid, x, y }]);

    const aid = affirmId.current++;
    setAffirmChips(a => [...a, { id: aid, text }]);
  };

  const startGame = () => {
    setScore(0); setMissed(0);
    setTimeLeft(30); setFallingItems([]);
    setBursts([]); setAffirmChips([]);
    setShowCompletion(false); setShowStop(false);
    setGameActive(true);
  };

  const accuracy = score + missed > 0 ? Math.round((score / (score + missed)) * 100) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --bg: #070510;
          --surface: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --violet: #a78bfa;
          --teal: #5eead4;
          --text: #ede9fe;
          --muted: #7c6fa8;
          --radius: 24px;
        }

        .gc-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -5%, rgba(109,40,217,0.22) 0%, transparent 65%),
            radial-gradient(ellipse 40% 30% at 5%  95%, rgba(94,234,212,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 35% 25% at 95% 80%, rgba(167,139,250,0.1) 0%, transparent 55%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        .gc-main { padding: 5rem 1.5rem 4rem; display: flex; justify-content: center; }
        .gc-wrap { width: 100%; max-width: 560px; }

        /* Header */
        .gc-header { text-align: center; margin-bottom: 1.6rem; }
        .gc-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.25);
          color: #c4b5fd; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.35rem 0.9rem; border-radius: 50px; margin-bottom: 0.9rem;
        }
        .gc-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2rem, 5vw, 2.8rem);
          background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #5eead4 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.3rem;
        }
        .gc-sub { color: var(--muted); font-size: 0.9rem; }

        /* Stats bar */
        .gc-stats {
          display: flex; gap: 0.8rem; margin-bottom: 1rem;
        }
        .gc-stat {
          flex: 1; background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 0.65rem 0.8rem; text-align: center;
        }
        .gc-stat-val {
          font-family: 'DM Serif Display', serif;
          font-size: 1.5rem; line-height: 1;
        }
        .gc-stat-lbl { font-size: 0.63rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 0.15rem; }

        /* Timer bar */
        .gc-timer-track { height: 3px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-bottom: 1rem; }
        .gc-timer-fill {
          height: 100%; border-radius: 3px;
          background: linear-gradient(90deg, #7c3aed, #a78bfa, #5eead4);
          transition: width 1s linear;
        }

        /* Arena */
        .gc-arena {
          position: relative; height: 420px;
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: inset 0 0 60px rgba(109,40,217,0.08), 0 40px 80px rgba(0,0,0,0.4);
          margin-bottom: 1rem; cursor: crosshair;
          user-select: none;
        }
        .gc-arena::before {
          content: ''; position: absolute; inset: 0; border-radius: var(--radius);
          background-image: radial-gradient(circle at 1px 1px, rgba(167,139,250,0.07) 1px, transparent 0);
          background-size: 28px 28px; pointer-events: none;
        }
        .gc-arena-hint {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          color: rgba(167,139,250,0.25); font-size: 0.85rem; font-style: italic;
          pointer-events: none;
        }

        /* Falling item */
        .gc-item {
          position: absolute;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 2px;
          cursor: pointer; text-align: center;
          animation: itemIn 0.35s cubic-bezier(0.34,1.5,0.64,1) both;
          transition: transform 0.1s;
        }
        .gc-item:hover { transform: translate(-50%, -50%) scale(1.15) !important; }
        .gc-item:active { transform: translate(-50%, -50%) scale(0.88) !important; }
        .gc-item-emoji { font-size: 1.6rem; line-height: 1; pointer-events: none; }
        .gc-item-text  { font-size: 0.55rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; opacity: 0.75; pointer-events: none; max-width: 56px; line-height: 1.2; }

        /* Ready screen */
        .gc-ready-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 2.2rem 2rem; text-align: center;
          backdrop-filter: blur(20px);
          box-shadow: 0 50px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative; overflow: hidden;
        }
        .gc-ready-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent);
        }
        .gc-item-preview {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 0.6rem;
          margin: 1.4rem 0 1.8rem;
        }
        .gc-preview-pill {
          display: flex; align-items: center; gap: 0.4rem;
          background: rgba(167,139,250,0.08); border: 1px solid rgba(167,139,250,0.18);
          border-radius: 50px; padding: 0.35rem 0.8rem;
          font-size: 0.8rem; color: #c4b5fd;
        }
        .gc-start-btn {
          width: 100%; padding: 1.05rem;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 700;
          border: none; border-radius: 16px; cursor: pointer;
          box-shadow: 0 8px 32px rgba(124,58,237,0.4);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .gc-start-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(124,58,237,0.55); }

        /* ── Modals ── */
        .gc-overlay {
          position: fixed; inset: 0;
          background: rgba(5,5,15,0.85); backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          z-index: 300; animation: fadeIn 0.3s ease; padding: 1.5rem;
        }
        .gc-modal {
          background: #0d0b1e; border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius); padding: 2.5rem 2rem;
          max-width: 380px; width: 100%; text-align: center;
          box-shadow: 0 60px 100px rgba(0,0,0,0.6);
          animation: popIn 0.45s cubic-bezier(0.34,1.5,0.64,1) both;
        }
        .gc-modal-icon { font-size: 3.5rem; display: block; animation: floatIcon 3s ease-in-out infinite; margin-bottom: 0.8rem; }
        .gc-modal-title {
          font-family: 'DM Serif Display', serif; font-size: 2rem;
          background: linear-gradient(135deg, #c4b5fd, #5eead4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.3rem;
        }
        .gc-modal-sub { color: var(--muted); font-size: 0.88rem; margin-bottom: 1.4rem; }
        .gc-result-grid {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 0.7rem; margin-bottom: 1.4rem;
        }
        .gc-result-box {
          background: rgba(255,255,255,0.03); border: 1px solid var(--border);
          border-radius: 14px; padding: 0.8rem 0.5rem;
        }
        .gc-result-val { font-family: 'DM Serif Display', serif; font-size: 1.5rem; line-height: 1; }
        .gc-result-lbl { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 0.15rem; }
        .gc-modal-btns { display: flex; gap: 0.8rem; }
        .gc-btn-ghost {
          flex: 1; padding: 0.9rem; background: rgba(255,255,255,0.04);
          border: 1px solid var(--border); color: var(--muted);
          font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 600;
          border-radius: 14px; cursor: pointer; transition: color 0.2s, border-color 0.2s;
        }
        .gc-btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
        .gc-btn-solid {
          flex: 1.5; padding: 0.9rem;
          background: linear-gradient(135deg, #059669, #34d399);
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          border: none; border-radius: 14px; cursor: pointer;
          box-shadow: 0 6px 24px rgba(52,211,153,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .gc-btn-solid:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(52,211,153,0.45); }
        .gc-btn-danger {
          flex: 1; padding: 0.9rem;
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          border: none; border-radius: 14px; cursor: pointer;
          transition: transform 0.15s;
        }
        .gc-btn-danger:hover { transform: translateY(-2px); }

        /* Keyframes */
        @keyframes itemIn {
          from { transform: translate(-50%,-50%) scale(0); opacity: 0; }
          to   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
        }
        @keyframes catchBurst {
          0%   { transform: translate(-50%,-50%) scale(0.4); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
        }
        @keyframes affirmRise {
          0%   { transform: translateX(-50%) translateY(0);    opacity: 0; }
          12%  { transform: translateX(-50%) translateY(-10px); opacity: 1; }
          75%  { transform: translateX(-50%) translateY(-10px); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-32px); opacity: 0; }
        }
        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Floating affirmations */}
      {affirmChips.map(chip => (
        <AffirmChip key={chip.id} text={chip.text}
          onDone={() => setAffirmChips(a => a.filter(x => x.id !== chip.id))} />
      ))}

      <div className="gc-root">
        <Navbar />

        <main className="gc-main">
          <div className="gc-wrap">

            <div className="gc-header">
              <div className="gc-badge">✦ Gratitude Practice</div>
              <h1 className="gc-title">Gratitude Catch</h1>
              <p className="gc-sub">Catch the blessings before they fall away</p>
            </div>

            {/* ── Ready ── */}
            {!gameActive && !showCompletion && (
              <div className="gc-ready-card">
                <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginBottom: "0.3rem" }}>
                  Tap each blessing as it falls. You have 30 seconds!
                </p>
                <div className="gc-item-preview">
                  {GRATITUDE_ITEMS.map(it => (
                    <div key={it.text} className="gc-preview-pill">
                      <span>{it.emoji}</span><span>{it.text}</span>
                    </div>
                  ))}
                </div>
                <button className="gc-start-btn" onClick={startGame}>
                  Start Catching →
                </button>
              </div>
            )}

            {/* ── Active ── */}
            {gameActive && (
              <>
                {/* Stats */}
                <div className="gc-stats">
                  <div className="gc-stat">
                    <div className="gc-stat-val" style={{ color: "#a78bfa" }}>{score}</div>
                    <div className="gc-stat-lbl">Caught</div>
                  </div>
                  <div className="gc-stat">
                    <div className="gc-stat-val" style={{ color: timeLeft <= 10 ? "#f87171" : "#5eead4" }}>{timeLeft}s</div>
                    <div className="gc-stat-lbl">Time Left</div>
                  </div>
                  <div className="gc-stat">
                    <div className="gc-stat-val" style={{ color: "#FDE68A" }}>{missed}</div>
                    <div className="gc-stat-lbl">Missed</div>
                  </div>
                </div>

                {/* Timer bar */}
                <div className="gc-timer-track">
                  <div className="gc-timer-fill" style={{ width: `${(timeLeft / 30) * 100}%` }} />
                </div>

                {/* Arena */}
                <div className="gc-arena">
                  {fallingItems.length === 0 && (
                    <div className="gc-arena-hint">Blessings incoming…</div>
                  )}

                  {/* Catch bursts */}
                  {bursts.map(b => (
                    <CatchBurst key={b.id} x={b.x} y={b.y}
                      onDone={() => setBursts(bb => bb.filter(x => x.id !== b.id))} />
                  ))}

                  {/* Falling items */}
                  {fallingItems.map(item => (
                    <div
                      key={item.id}
                      className="gc-item"
                      onClick={() => catchItem(item.id, item.emoji, item.text, item.x, item.y)}
                      style={{
                        left: `${item.x}%`, top: `${item.y}%`,
                        width: item.size, height: item.size,
                        background: item.color.bg,
                        border: `1.5px solid ${item.color.border}`,
                        boxShadow: `0 0 18px ${item.color.glow}`,
                        transform: "translate(-50%,-50%)",
                      }}
                    >
                      <span className="gc-item-emoji">{item.emoji}</span>
                      <span className="gc-item-text">{item.text}</span>
                    </div>
                  ))}
                </div>

                <GameControls
                  onComplete={() => { setGameActive(false); setFallingItems([]); setShowCompletion(true); }}
                  onStop={() => setShowStop(true)}
                  onBack={() => navigate("/challenges")}
                />
              </>
            )}

          </div>
        </main>

        <Footer />
      </div>

      {/* ── Stop confirm ── */}
      {showStop && (
        <div className="gc-overlay">
          <div className="gc-modal">
            <span className="gc-modal-icon">🌙</span>
            <h3 className="gc-modal-title">Stop Session?</h3>
            <p className="gc-modal-sub">Your progress will be lost. Are you sure?</p>
            <div className="gc-modal-btns">
              <button className="gc-btn-ghost" onClick={() => setShowStop(false)}>Keep Playing</button>
              <button className="gc-btn-danger" onClick={() => { setGameActive(false); setFallingItems([]); setShowStop(false); setScore(0); }}>Stop</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Completion ── */}
      {showCompletion && (
        <div className="gc-overlay">
          <div className="gc-modal">
            <span className="gc-modal-icon">🌸</span>
            <h3 className="gc-modal-title">Well Done!</h3>
            <p className="gc-modal-sub">You noticed your blessings. That's powerful.</p>
            <div className="gc-result-grid">
              <div className="gc-result-box">
                <div className="gc-result-val" style={{ color: "#a78bfa" }}>{score}</div>
                <div className="gc-result-lbl">Caught</div>
              </div>
              <div className="gc-result-box">
                <div className="gc-result-val" style={{ color: "#FDE68A" }}>{missed}</div>
                <div className="gc-result-lbl">Missed</div>
              </div>
              <div className="gc-result-box">
                <div className="gc-result-val" style={{ color: "#5eead4" }}>{accuracy}%</div>
                <div className="gc-result-lbl">Accuracy</div>
              </div>
            </div>
            <div className="gc-modal-btns">
              <button className="gc-btn-ghost" onClick={startGame}>Play Again</button>
              <button className="gc-btn-solid" onClick={() => navigate("/challenges")}>Finish →</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GratitudeCatchGame;