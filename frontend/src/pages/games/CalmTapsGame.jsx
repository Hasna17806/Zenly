import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import GameControls from "../../components/GameControls";
import axios from "axios";

const affirmations = [
  "You are doing your best today.",
  "Small steps still move you forward.",
  "Your mind deserves kindness.",
  "Peace begins with a single breath.",
  "You are stronger than this moment.",
  "This moment will pass.",
  "Your feelings are valid.",
  "You deserve calm and clarity."
];

const GOAL = 8;

/* ── Ripple burst on tap ── */
const Ripple = ({ x, y, id, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 700);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`,
      transform: 'translate(-50%,-50%)',
      width: 80, height: 80, borderRadius: '50%',
      border: '2px solid rgba(167,139,250,0.7)',
      animation: 'rippleOut 0.7s ease-out forwards',
      pointerEvents: 'none', zIndex: 5,
    }} />
  );
};

/* ── Floating affirmation chip ── */
const AffirmChip = ({ text, id, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'fixed', bottom: '30%', left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(167,139,250,0.15)',
      border: '1px solid rgba(167,139,250,0.3)',
      backdropFilter: 'blur(12px)',
      color: '#e9d5ff',
      fontFamily: "'DM Serif Display', serif",
      fontStyle: 'italic',
      fontSize: '1.05rem',
      padding: '0.8rem 1.8rem',
      borderRadius: '50px',
      whiteSpace: 'nowrap',
      animation: 'affirmRise 2.2s ease-out forwards',
      zIndex: 200,
      pointerEvents: 'none',
    }}>{text}</div>
  );
};

const CalmTapsGame = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const [circles,        setCircles]        = useState([]);
  const [taps,           setTaps]           = useState(0);
  const [active,         setActive]         = useState(false);
  const [gameActive,     setGameActive]     = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showStop,       setShowStop]       = useState(false);
  const [ripples,        setRipples]        = useState([]);
  const [affirmChips,    setAffirmChips]    = useState([]);
  const [lastAffirm,     setLastAffirm]     = useState("");
  const rippleId  = useRef(0);
  const affirmId  = useRef(0);
  const prevAffirm = useRef("");

  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      setCircles(prev => {
        if (prev.length >= 5) return prev; // cap bubbles on screen
        return [...prev, {
          id: Date.now(),
          x: 8 + Math.random() * 84,
          y: 8 + Math.random() * 84,
          size: 52 + Math.random() * 32,
          hue: Math.floor(Math.random() * 60) + 240, // blue-purple range
        }];
      });
    }, 1800);
    return () => clearInterval(iv);
  }, [active]);

  const handleTap = (circle) => {
    setCircles(prev => prev.filter(c => c.id !== circle.id));
    const newTaps = taps + 1;
    setTaps(newTaps);

    // Ripple
    const rid = rippleId.current++;
    setRipples(r => [...r, { id: rid, x: circle.x, y: circle.y }]);

    // Affirmation chip (avoid same twice)
    let pick;
    do { pick = affirmations[Math.floor(Math.random() * affirmations.length)]; }
    while (pick === prevAffirm.current);
    prevAffirm.current = pick;
    const aid = affirmId.current++;
    setAffirmChips(a => [...a, { id: aid, text: pick }]);
    setLastAffirm(pick);
  };

  const startSession = () => {
    setActive(true); setGameActive(true);
    setTaps(0); setCircles([]); setRipples([]);
  };

  const stopGame = () => {
    setActive(false); setGameActive(false);
    setCircles([]); setShowStop(false);
  };

  const completeChallenge = async () => {
    if (!location.state?.challenge?._id) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { challengeId: location.state.challenge._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCompletion(true);
      setTimeout(() => navigate("/challenges"), 2200);
    } catch (err) { console.error(err); }
  };

  const progress = Math.min((taps / GOAL) * 100, 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --bg: #080b14;
          --surface: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --violet: #a78bfa;
          --violet-glow: rgba(167,139,250,0.3);
          --teal: #5eead4;
          --text: #ede9fe;
          --muted: #7c6fa8;
          --radius: 24px;
        }

        .ct-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 80% 55% at 50% -5%, rgba(109,40,217,0.2) 0%, transparent 65%),
            radial-gradient(ellipse 40% 30% at 5% 95%, rgba(94,234,212,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 35% 30% at 95% 85%, rgba(167,139,250,0.1) 0%, transparent 55%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        .ct-main { padding: 5rem 1.5rem 3rem; display: flex; justify-content: center; }
        .ct-wrap { width: 100%; max-width: 640px; text-align: center; }

        .ct-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(167,139,250,0.1);
          border: 1px solid rgba(167,139,250,0.25);
          color: #c4b5fd; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.35rem 0.9rem; border-radius: 50px;
          margin-bottom: 1rem;
        }
        .ct-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2rem, 5vw, 2.8rem);
          background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #818cf8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.4rem;
        }
        .ct-sub { color: var(--muted); font-size: 0.92rem; margin-bottom: 2rem; }

        /* ── Stats row ── */
        .ct-stats {
          display: flex; justify-content: center; gap: 1rem;
          margin-bottom: 1.4rem;
        }
        .ct-stat {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px; padding: 0.7rem 1.2rem;
          min-width: 90px;
        }
        .ct-stat-val {
          font-family: 'DM Serif Display', serif;
          font-size: 1.6rem; line-height: 1; color: var(--violet);
        }
        .ct-stat-lbl { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }

        /* Progress */
        .ct-prog-wrap { margin-bottom: 1.4rem; }
        .ct-prog-track {
          height: 4px; background: rgba(255,255,255,0.06);
          border-radius: 4px; overflow: hidden; margin-bottom: 0.4rem;
        }
        .ct-prog-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, #7c3aed, #a78bfa, #5eead4);
          transition: width 0.5s cubic-bezier(0.34,1.5,0.64,1);
        }
        .ct-prog-label { font-size: 0.72rem; color: var(--muted); }

        /* ── Arena ── */
        .ct-arena {
          position: relative;
          height: 380px;
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          margin-bottom: 1.4rem;
          box-shadow: inset 0 0 60px rgba(109,40,217,0.08), 0 40px 80px rgba(0,0,0,0.4);
        }
        .ct-arena::before {
          content: '';
          position: absolute; inset: 0; border-radius: var(--radius);
          background-image: radial-gradient(circle at 1px 1px, rgba(167,139,250,0.08) 1px, transparent 0);
          background-size: 28px 28px;
          pointer-events: none;
        }

        /* Bubble */
        .ct-bubble {
          position: absolute;
          border-radius: 50%;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.15s;
          animation: bubbleIn 0.5s cubic-bezier(0.34,1.5,0.64,1) both;
          user-select: none; -webkit-tap-highlight-color: transparent;
        }
        .ct-bubble:hover { transform: translate(-50%,-50%) scale(1.12) !important; }
        .ct-bubble:active { transform: translate(-50%,-50%) scale(0.88) !important; }
        .ct-bubble-inner {
          width: 100%; height: 100%; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }

        /* ── Start button ── */
        .ct-start-btn {
          padding: 1rem 2.8rem;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 700;
          border: none; border-radius: 50px; cursor: pointer;
          box-shadow: 0 8px 32px rgba(124,58,237,0.4);
          transition: transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.02em;
          margin-top: 1rem;
        }
        .ct-start-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(124,58,237,0.55); }

        /* Complete button */
        .ct-complete-btn {
          width: 100%; padding: 1rem;
          background: linear-gradient(135deg, #059669, #34d399);
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 700;
          border: none; border-radius: 16px; cursor: pointer;
          box-shadow: 0 8px 28px rgba(52,211,153,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
          animation: popIn 0.4s cubic-bezier(0.34,1.5,0.64,1) both;
          margin-top: 0.6rem;
        }
        .ct-complete-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(52,211,153,0.45); }

        /* ── Modals ── */
        .ct-overlay {
          position: fixed; inset: 0;
          background: rgba(5,5,15,0.8); backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          z-index: 300; animation: fadeIn 0.3s ease;
          padding: 1.5rem;
        }
        .ct-modal {
          background: #0e0c1e;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius);
          padding: 2.5rem 2rem;
          max-width: 380px; width: 100%; text-align: center;
          box-shadow: 0 60px 100px rgba(0,0,0,0.6);
          animation: popIn 0.4s cubic-bezier(0.34,1.5,0.64,1) both;
        }
        .ct-modal-icon { font-size: 3.5rem; margin-bottom: 0.8rem; display: block; animation: floatIcon 3s ease-in-out infinite; }
        .ct-modal-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.9rem; margin: 0 0 0.4rem;
          background: linear-gradient(135deg, #c4b5fd, #5eead4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .ct-modal-sub { color: var(--muted); font-size: 0.9rem; margin-bottom: 1.6rem; }
        .ct-modal-btns { display: flex; gap: 0.8rem; }
        .ct-btn-danger {
          flex: 1; padding: 0.9rem;
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          border: none; border-radius: 14px; cursor: pointer;
          transition: transform 0.15s;
        }
        .ct-btn-danger:hover { transform: translateY(-2px); }
        .ct-btn-ghost {
          flex: 1; padding: 0.9rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          color: var(--muted); font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          border-radius: 14px; cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .ct-btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }

        /* Progress bar in completion modal */
        .ct-prog-modal { height: 3px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; margin-top: 1.2rem; }
        .ct-prog-modal-fill { height: 100%; background: linear-gradient(90deg, #7c3aed, #5eead4); animation: progFill 2.2s linear forwards; }

        /* Keyframes */
        @keyframes bubbleIn {
          from { transform: translate(-50%,-50%) scale(0); opacity: 0; }
          to   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
        }
        @keyframes rippleOut {
          0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(3);   opacity: 0; }
        }
        @keyframes affirmRise {
          0%   { transform: translateX(-50%) translateY(0);    opacity: 0; }
          15%  { transform: translateX(-50%) translateY(-8px); opacity: 1; }
          75%  { transform: translateX(-50%) translateY(-8px); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-30px); opacity: 0; }
        }
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes progFill {
          from { width: 0%; } to { width: 100%; }
        }
      `}</style>

      {/* Floating affirmation chips */}
      {affirmChips.map(chip => (
        <AffirmChip key={chip.id} id={chip.id} text={chip.text}
          onDone={() => setAffirmChips(a => a.filter(x => x.id !== chip.id))} />
      ))}

      <div className="ct-root">
        <Navbar />

        <main className="ct-main">
          <div className="ct-wrap">

            <div className="ct-badge">✦ Mindful Activity</div>
            <h1 className="ct-title">Mindful Tap</h1>
            <p className="ct-sub">Tap the orbs slowly — breathe with each touch.</p>

            {/* Stats */}
            {(active || taps > 0) && (
              <>
                <div className="ct-stats">
                  <div className="ct-stat">
                    <div className="ct-stat-val">{taps}</div>
                    <div className="ct-stat-lbl">Taps</div>
                  </div>
                  <div className="ct-stat">
                    <div className="ct-stat-val" style={{ color: '#5eead4' }}>{Math.max(0, GOAL - taps)}</div>
                    <div className="ct-stat-lbl">Remaining</div>
                  </div>
                </div>
                <div className="ct-prog-wrap">
                  <div className="ct-prog-track">
                    <div className="ct-prog-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="ct-prog-label">{taps} / {GOAL} mindful taps</p>
                </div>
              </>
            )}

            {/* Arena */}
            {active && (
              <div className="ct-arena">
                {/* Ripples */}
                {ripples.map(r => (
                  <Ripple key={r.id} x={r.x} y={r.y}
                    onDone={() => setRipples(rr => rr.filter(x => x.id !== r.id))} />
                ))}
                {/* Bubbles */}
                {circles.map(circle => {
                  const gradient = `radial-gradient(circle at 35% 35%, hsl(${circle.hue},70%,75%), hsl(${circle.hue},60%,50%))`;
                  return (
                    <button
                      key={circle.id}
                      className="ct-bubble"
                      onClick={() => handleTap(circle)}
                      style={{
                        left: `${circle.x}%`, top: `${circle.y}%`,
                        width: circle.size, height: circle.size,
                        transform: 'translate(-50%,-50%)',
                        background: gradient,
                        boxShadow: `0 0 24px hsl(${circle.hue},70%,60%,0.4), inset 0 1px 0 rgba(255,255,255,0.3)`,
                      }}
                    >
                      <div className="ct-bubble-inner">✦</div>
                    </button>
                  );
                })}
                {circles.length === 0 && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(167,139,250,0.3)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Orbs appearing…
                  </div>
                )}
              </div>
            )}

            {/* Start */}
            {!active && !showCompletion && (
              <button className="ct-start-btn" onClick={startSession}>
                Begin Session →
              </button>
            )}

            {/* Complete */}
            {taps >= GOAL && active && (
              <button className="ct-complete-btn" onClick={completeChallenge}>
                Complete Challenge ✓
              </button>
            )}

            {/* Game controls */}
            {gameActive && (
              <GameControls
                onComplete={completeChallenge}
                onStop={() => setShowStop(true)}
                onBack={() => navigate("/challenges")}
              />
            )}

          </div>
        </main>

        <Footer />
      </div>

      {/* Stop confirm */}
      {showStop && (
        <div className="ct-overlay">
          <div className="ct-modal">
            <span className="ct-modal-icon">🌙</span>
            <h3 className="ct-modal-title">Stop Session?</h3>
            <p className="ct-modal-sub">Your progress will be lost. Are you sure?</p>
            <div className="ct-modal-btns">
              <button className="ct-btn-ghost" onClick={() => setShowStop(false)}>Keep Going</button>
              <button className="ct-btn-danger" onClick={stopGame}>Stop</button>
            </div>
          </div>
        </div>
      )}

      {/* Completion */}
      {showCompletion && (
        <div className="ct-overlay">
          <div className="ct-modal">
            <span className="ct-modal-icon">✨</span>
            <h3 className="ct-modal-title">Well Done!</h3>
            <p className="ct-modal-sub">{taps} mindful taps. Your mind is clearer now.</p>
            <div className="ct-prog-modal">
              <div className="ct-prog-modal-fill" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalmTapsGame;