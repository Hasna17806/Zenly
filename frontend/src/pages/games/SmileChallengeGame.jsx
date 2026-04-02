import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const DURATION = 20;

/* ── Sparkle particle ── */
const Sparkle = ({ id, onDone }) => {
  const angle  = Math.random() * 360;
  const dist   = 60 + Math.random() * 80;
  const size   = 6 + Math.random() * 8;
  const dur    = 0.6 + Math.random() * 0.5;
  const colors = ["#FDE68A", "#FCA5A5", "#FDBA74", "#86EFAC", "#C4B5FD", "#F9A8D4"];
  const color  = colors[Math.floor(Math.random() * colors.length)];
  const dx     = Math.cos((angle * Math.PI) / 180) * dist;
  const dy     = Math.sin((angle * Math.PI) / 180) * dist;

  useEffect(() => {
    const t = setTimeout(onDone, dur * 1000 + 100);
    return () => clearTimeout(t);
  }, []);

  // Fixed: Use style object with camelCase and template literals for custom properties
  const sparkleStyle = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: size,
    height: size,
    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
    background: color,
    animation: `sparkleOut ${dur}s ease-out forwards`,
    pointerEvents: "none",
    zIndex: 10,
    // Use transform with calculated values instead of CSS custom properties
    transform: `translate(-50%, -50%) translate(0, 0) scale(1)`,
    // Store dx/dy for animation keyframes
    "--dx": `${dx}px`,
    "--dy": `${dy}px`,
  };

  return <div style={sparkleStyle} />;
};

/* ── Sun ray ── */
const SunRay = ({ angle, active }) => {
  const rayStyle = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 3,
    height: active ? 60 : 30,
    background: "linear-gradient(to top, rgba(251,191,36,0.7), transparent)",
    transformOrigin: "bottom center",
    transform: `translateX(-50%) translateY(-100%) rotate(${angle}deg)`,
    transition: "height 0.6s ease, opacity 0.6s ease",
    opacity: active ? 0.8 : 0.2,
    borderRadius: "2px",
    pointerEvents: "none",
  };

  return <div style={rayStyle} />;
};

const SmileChallengeGame = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const challenge = location.state?.challenge;

  const [timer,     setTimer]     = useState(DURATION);
  const [isActive,  setIsActive]  = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errorMsg,  setErrorMsg]  = useState("");
  const [sparkles,  setSparkles]  = useState([]);
  const [wobble,    setWobble]    = useState(false);
  const sparkleId  = useRef(0);
  const wobbleRef  = useRef(null);

  useEffect(() => {
    let iv;
    if (isActive && timer > 0) {
      iv = setInterval(() => setTimer(p => p - 1), 1000);
    }
    if (timer === 0 && isActive) {
      setIsActive(false);
      setCompleted(true);
      burst(16);
    }
    return () => clearInterval(iv);
  }, [isActive, timer]);

  // Periodic emoji wobble while active
  useEffect(() => {
    if (!isActive) return;
    wobbleRef.current = setInterval(() => {
      setWobble(true);
      setTimeout(() => setWobble(false), 600);
    }, 2500);
    return () => clearInterval(wobbleRef.current);
  }, [isActive]);

  const burst = (count) => {
    const ids = Array.from({ length: count }, () => sparkleId.current++);
    setSparkles(s => [...s, ...ids]);
  };

  const removeSparkle = (id) => setSparkles(s => s.filter(x => x !== id));

  const handleStart = () => {
    setTimer(DURATION); setCompleted(false);
    setErrorMsg(""); setIsActive(true);
    burst(6);
  };

  const handleComplete = async () => {
  try {
    setLoading(true);
    setErrorMsg("");

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    await axios.post(
      "http://localhost:5000/api/completed-challenges",
      { challengeId: challenge?._id || challenge?.id },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setTimeout(() => navigate("/challenges"), 2000);
  } catch (error) {
    console.error("Error completing challenge:", error);
    setErrorMsg(error.response?.data?.message || "Could not complete challenge. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const restart = () => {
    setTimer(DURATION); setCompleted(false);
    setIsActive(false); setErrorMsg("");
  };

  const progress = ((DURATION - timer) / DURATION) * 100;
  const ringDash = 2 * Math.PI * 54; // circumference for r=54

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --bg: #0c0a05;
          --surface: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --gold: #FDE68A;
          --amber: #F59E0B;
          --orange: #FB923C;
          --coral: #F87171;
          --text: #FEF9EE;
          --muted: #92836A;
          --radius: 28px;
        }

        .sc-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 80% 55% at 50% -5%, rgba(251,191,36,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 40% 30% at 0% 100%, rgba(251,146,60,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 35% 30% at 100% 80%, rgba(248,113,113,0.08) 0%, transparent 55%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        .sc-main { padding: 5rem 1.5rem 4rem; display: flex; justify-content: center; }
        .sc-wrap { width: 100%; max-width: 460px; text-align: center; }

        .sc-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(253,230,138,0.1);
          border: 1px solid rgba(253,230,138,0.25);
          color: #FDE68A; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.35rem 0.9rem; border-radius: 50px; margin-bottom: 1rem;
        }
        .sc-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 6vw, 2.8rem); font-weight: 800;
          background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #FB923C 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.4rem; line-height: 1.1;
        }
        .sc-sub { color: var(--muted); font-size: 0.92rem; margin-bottom: 2.5rem; }

        /* ── Card ── */
        .sc-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2.5rem 2rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 50px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative; overflow: hidden;
        }
        .sc-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(253,230,138,0.4), transparent);
        }

        /* ── Face ring ── */
        .sc-face-wrap {
          position: relative; width: 160px; height: 160px;
          margin: 0 auto 1.8rem; display: flex; align-items: center; justify-content: center;
        }
        .sc-ring-svg {
          position: absolute; inset: 0; width: 100%; height: 100%;
          transform: rotate(-90deg);
        }
        .sc-ring-bg { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 5; }
        .sc-ring-fill {
          fill: none;
          stroke-width: 5;
          stroke-linecap: round;
          stroke: url(#ringGrad);
          transition: stroke-dashoffset 1s linear;
        }
        .sc-emoji-btn {
          font-size: 4.5rem; background: none; border: none; cursor: pointer;
          padding: 0; line-height: 1; position: relative; z-index: 1;
          transition: transform 0.15s;
          filter: drop-shadow(0 0 20px rgba(251,191,36,0.5));
        }
        .sc-emoji-btn.wobble { animation: emojiWobble 0.6s ease; }
        .sc-emoji-btn:active { transform: scale(0.9); }

        /* Sun rays container */
        .sc-rays {
          position: absolute; inset: -30px;
          pointer-events: none;
        }

        /* Sparkle container */
        .sc-sparkles {
          position: absolute; inset: 0;
          pointer-events: none; overflow: visible;
        }

        /* ── Timer display ── */
        .sc-timer-num {
          font-family: 'Syne', sans-serif;
          font-size: 3.5rem; font-weight: 800; line-height: 1;
          background: linear-gradient(135deg, #FDE68A, #FB923C);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin-bottom: 0.2rem;
        }
        .sc-timer-lbl { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }

        .sc-phase-msg {
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem; font-weight: 700;
          color: var(--text); margin: 1.2rem 0 0;
        }

        /* ── Progress bar ── */
        .sc-prog-track { height: 4px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; margin: 1.4rem 0; }
        .sc-prog-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, #F59E0B, #FB923C, #F87171);
          transition: width 1s linear;
        }

        /* ── Buttons ── */
        .sc-start-btn {
          width: 100%; padding: 1.1rem;
          background: linear-gradient(135deg, #F59E0B, #FB923C);
          color: #1a0f00; font-family: 'Syne', sans-serif;
          font-size: 1.05rem; font-weight: 800;
          border: none; border-radius: 16px; cursor: pointer;
          box-shadow: 0 8px 32px rgba(245,158,11,0.4);
          transition: transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.02em; margin-top: 0.5rem;
        }
        .sc-start-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(245,158,11,0.55); }

        .sc-btn-row { display: flex; gap: 0.8rem; margin-top: 1.4rem; }
        .sc-btn-ghost {
          flex: 1; padding: 0.9rem;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          color: var(--muted); font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 600;
          border-radius: 14px; cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .sc-btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
        .sc-btn-green {
          flex: 1.5; padding: 0.9rem;
          background: linear-gradient(135deg, #059669, #34d399);
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          border: none; border-radius: 14px; cursor: pointer;
          box-shadow: 0 6px 24px rgba(52,211,153,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .sc-btn-green:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(52,211,153,0.45); }
        .sc-btn-green:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* ── Complete ── */
        .sc-complete-icon { font-size: 4rem; display: block; animation: floatIcon 3s ease-in-out infinite; margin-bottom: 0.8rem; }
        .sc-complete-title {
          font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800;
          background: linear-gradient(135deg, #FDE68A, #FB923C);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.4rem;
        }
        .sc-fact {
          background: rgba(253,230,138,0.06);
          border: 1px solid rgba(253,230,138,0.15);
          border-radius: 14px; padding: 1rem 1.2rem;
          color: #D4BE8A; font-size: 0.88rem; line-height: 1.6;
          margin: 1.2rem 0;
        }
        .sc-error {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2);
          color: #FCA5A5; font-size: 0.85rem; font-weight: 500;
          padding: 0.7rem 1rem; border-radius: 12px; margin-top: 0.8rem;
        }

        /* ── Ready hints ── */
        .sc-hints {
          display: flex; justify-content: center; gap: 1rem;
          margin-bottom: 1.8rem;
        }
        .sc-hint {
          background: rgba(255,255,255,0.03); border: 1px solid var(--border);
          border-radius: 12px; padding: 0.7rem 1rem; text-align: center; flex: 1;
        }
        .sc-hint-icon { font-size: 1.4rem; }
        .sc-hint-lbl { font-size: 0.65rem; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.2rem; }

        /* Keyframes */
        @keyframes sparkleOut {
          0%   { transform: translate(-50%,-50%) translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(-50%,-50%) translate(var(--dx),var(--dy)) scale(0); opacity: 0; }
        }
        @keyframes emojiWobble {
          0%,100% { transform: rotate(0deg) scale(1); }
          25%     { transform: rotate(-8deg) scale(1.1); }
          75%     { transform: rotate(8deg) scale(1.1); }
        }
        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes popIn {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="sc-root">
        <Navbar />

        <main className="sc-main">
          <div className="sc-wrap">

            <div className="sc-badge">✦ Mood Boost</div>
            <h1 className="sc-title">Smile Challenge</h1>
            <p className="sc-sub">Hold a gentle smile for 20 seconds — feel the shift.</p>

            <div className="sc-card">

              {/* ── Ready ── */}
              {!isActive && !completed && (
                <>
                  <div className="sc-hints">
                    <div className="sc-hint">
                      <div className="sc-hint-icon">😊</div>
                      <div className="sc-hint-lbl">Smile</div>
                    </div>
                    <div className="sc-hint">
                      <div className="sc-hint-icon">⏱</div>
                      <div className="sc-hint-lbl">20 secs</div>
                    </div>
                    <div className="sc-hint">
                      <div className="sc-hint-icon">✨</div>
                      <div className="sc-hint-lbl">Boost mood</div>
                    </div>
                  </div>
                  {/* Big emoji preview */}
                  <div style={{ fontSize: '5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 24px rgba(251,191,36,0.4))' }}>😊</div>
                  <button className="sc-start-btn" onClick={handleStart}>Start Smiling →</button>
                </>
              )}

              {/* ── Active ── */}
              {isActive && (
                <>
                  {/* Face + ring */}
                  <div className="sc-face-wrap">
                    {/* Sun rays */}
                    <div className="sc-rays">
                      {[0,45,90,135,180,225,270,315].map(a => (
                        <SunRay key={a} angle={a} active={isActive} />
                      ))}
                    </div>
                    {/* SVG ring */}
                    <svg className="sc-ring-svg" viewBox="0 0 120 120">
                      <defs>
                        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#F59E0B" />
                          <stop offset="50%" stopColor="#FB923C" />
                          <stop offset="100%" stopColor="#F87171" />
                        </linearGradient>
                      </defs>
                      <circle className="sc-ring-bg" cx="60" cy="60" r="54" />
                      <circle className="sc-ring-fill" cx="60" cy="60" r="54"
                        strokeDasharray={ringDash}
                        strokeDashoffset={ringDash - (progress / 100) * ringDash}
                      />
                    </svg>
                    {/* Sparkles */}
                    <div className="sc-sparkles">
                      {sparkles.map(id => (
                        <Sparkle key={id} id={id} onDone={() => removeSparkle(id)} />
                      ))}
                    </div>
                    {/* Emoji */}
                    <button
                      className={`sc-emoji-btn ${wobble ? "wobble" : ""}`}
                      onClick={() => { burst(5); setWobble(true); setTimeout(() => setWobble(false), 600); }}
                    >😊</button>
                  </div>

                  <div className="sc-timer-num">{timer}</div>
                  <div className="sc-timer-lbl">seconds remaining</div>

                  <div className="sc-prog-track">
                    <div className="sc-prog-fill" style={{ width: `${progress}%` }} />
                  </div>

                  <p className="sc-phase-msg">
                    {timer > 15 ? "You're doing great! 😄" :
                     timer > 10 ? "Keep that smile going! ☀️" :
                     timer > 5  ? "Almost there! 🌟" :
                                  "Final push! 💛"}
                  </p>
                </>
              )}

              {/* ── Completed ── */}
              {completed && (
                <div style={{ animation: "popIn 0.5s cubic-bezier(0.34,1.5,0.64,1) both" }}>
                  <span className="sc-complete-icon">✨</span>
                  <h2 className="sc-complete-title">Amazing job!</h2>
                  <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    You held your smile for the full 20 seconds.
                  </p>
                  <div className="sc-fact">
                    💡 Smiling — even without reason — activates neural pathways that lift your mood and reduce cortisol levels.
                  </div>
                  {errorMsg && <div className="sc-error"><span>⚠️</span>{errorMsg}</div>}
                  <div className="sc-btn-row">
                    <button className="sc-btn-ghost" onClick={restart}>Try Again</button>
                    <button className="sc-btn-green" onClick={handleComplete} disabled={loading}>
                      {loading ? "Saving…" : "Complete →"}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SmileChallengeGame;