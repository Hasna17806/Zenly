import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const BreathingGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = location.state?.challenge;

  const [phase, setPhase] = useState("ready");
  const [cycles, setCycles] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const phaseRef = useRef(phase);
  const cyclesRef = useRef(cycles);
  phaseRef.current = phase;
  cyclesRef.current = cycles;

  const totalCycles = 4;
  const phases = { inhale: 4, hold: 7, exhale: 8 };

  useEffect(() => {
    let interval;
    if (isActive && phase !== "ready") {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) { nextPhase(); return 0; }
          return prev - 1;
        });
        setTotalSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase]);

  const nextPhase = () => {
    const p = phaseRef.current;
    const c = cyclesRef.current;
    if (p === "inhale") { setPhase("hold"); setTimer(phases.hold); }
    else if (p === "hold") { setPhase("exhale"); setTimer(phases.exhale); }
    else if (p === "exhale") {
      if (c + 1 >= totalCycles) { finishSession(); }
      else { setCycles(c + 1); setPhase("inhale"); setTimer(phases.inhale); }
    }
  };

  const startSession = () => {
    setIsActive(true); setPhase("inhale");
    setCycles(0); setTimer(phases.inhale); setTotalSeconds(0);
  };

  const finishSession = () => { setIsActive(false); setCompleted(true); };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post("http://localhost:5000/api/completed",
        { challengeId: challenge?.id || "breathe-reset", score: 10 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/challenges");
    } catch { navigate("/challenges"); }
  };

  const restart = () => { setCompleted(false); setPhase("ready"); setCycles(0); setTotalSeconds(0); };

  // Circle scale & color per phase
  const phaseConfig = {
    ready:  { scale: 1,    color: "#a78bfa", glow: "rgba(167,139,250,0.3)", label: "",              sub: "" },
    inhale: { scale: 1.32, color: "#60a5fa", glow: "rgba(96,165,250,0.4)",  label: "Inhale",        sub: "Breathe in slowly through your nose" },
    hold:   { scale: 1.15, color: "#c084fc", glow: "rgba(192,132,252,0.45)",label: "Hold",           sub: "Hold your breath gently" },
    exhale: { scale: 0.72, color: "#34d399", glow: "rgba(52,211,153,0.4)",  label: "Exhale",        sub: "Release slowly through your mouth" },
  };
  const cfg = phaseConfig[phase];

  const progressPercent = isActive
    ? ((cycles + (phase === "exhale" ? 0.8 : phase === "hold" ? 0.4 : 0.1)) / totalCycles) * 100
    : 0;

  const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --bg: #060914;
          --surface: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --text: #e8e6f4;
          --muted: #7b78a0;
          --radius: 28px;
        }

        .br-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 70% 60% at 50% -5%, rgba(99,71,180,0.22) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 10% 100%, rgba(52,211,153,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 90% 80%, rgba(96,165,250,0.07) 0%, transparent 60%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        .br-main { display: flex; justify-content: center; align-items: center; padding: 5rem 1.5rem 4rem; }

        .br-card {
          width: 100%;
          max-width: 460px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 3rem 2.5rem;
          text-align: center;
          backdrop-filter: blur(20px);
          box-shadow: 0 60px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
        }
        .br-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        }

        /* Stars/particles background inside card */
        .br-particles {
          position: absolute; inset: 0; overflow: hidden; pointer-events: none; border-radius: var(--radius);
        }
        .br-dot {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          animation: twinkle var(--dur, 3s) ease-in-out infinite var(--delay, 0s);
        }

        .br-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(167,139,250,0.12);
          border: 1px solid rgba(167,139,250,0.25);
          color: #c4b5fd;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.35rem 0.9rem;
          border-radius: 50px;
          margin-bottom: 1.2rem;
        }

        .br-title {
          font-family: 'DM Serif Display', serif;
          font-size: 2rem;
          font-weight: 400;
          color: #f0eeff;
          margin: 0 0 0.4rem;
          line-height: 1.2;
        }
        .br-desc {
          color: var(--muted);
          font-size: 0.9rem;
          font-weight: 400;
          margin-bottom: 2.2rem;
          line-height: 1.6;
        }

        /* ── Ready state ── */
        .br-info-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; margin-bottom: 2rem;
        }
        .br-info-cell {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 0.9rem 0.5rem;
        }
        .br-info-num {
          font-family: 'DM Serif Display', serif;
          font-size: 1.6rem;
          color: var(--text);
          line-height: 1;
        }
        .br-info-lbl { font-size: 0.68rem; color: var(--muted); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 0.2rem; }

        .br-start-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #7c6fe0, #a78bfa);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          box-shadow: 0 8px 30px rgba(124,111,224,0.4);
          transition: transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.02em;
        }
        .br-start-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(124,111,224,0.55); }

        /* ── Active state ── */
        .br-orb-wrap {
          position: relative; display: flex; align-items: center; justify-content: center;
          width: 220px; height: 220px; margin: 0 auto 2rem;
        }
        .br-orb-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 1.5px solid var(--border);
          animation: spinSlow 20s linear infinite;
        }
        .br-orb-ring::after {
          content: '';
          position: absolute;
          top: -3px; left: 50%; transform: translateX(-50%);
          width: 6px; height: 6px;
          border-radius: 50%;
          background: v-bind;
        }
        .br-orb {
          width: 140px; height: 140px;
          border-radius: 50%;
          transition: transform 0.9s cubic-bezier(0.4,0,0.2,1), box-shadow 0.9s ease, background 0.6s ease;
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column;
        }
        .br-timer-num {
          font-family: 'DM Serif Display', serif;
          font-size: 2.6rem;
          line-height: 1;
          color: white;
        }
        .br-timer-s { font-size: 0.8rem; color: rgba(255,255,255,0.6); font-weight: 500; }

        .br-phase-label {
          font-family: 'DM Serif Display', serif;
          font-size: 1.7rem;
          color: var(--text);
          margin: 0 0 0.3rem;
        }
        .br-phase-sub { color: var(--muted); font-size: 0.88rem; margin-bottom: 1.6rem; }

        /* Progress bar */
        .br-progress-track {
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .br-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s linear, background 0.6s ease;
        }
        .br-cycle-row {
          display: flex; justify-content: center; gap: 0.5rem;
        }
        .br-cycle-dot {
          width: 8px; height: 8px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.2);
          transition: background 0.4s, border-color 0.4s;
        }
        .br-cycle-dot.done { background: #a78bfa; border-color: #a78bfa; }
        .br-cycle-dot.active { background: transparent; border-color: #e9d5ff; box-shadow: 0 0 6px #a78bfa; }

        /* ── Completed ── */
        .br-complete-icon {
          font-size: 3.5rem; margin-bottom: 0.5rem;
          animation: floatIcon 3s ease-in-out infinite;
          display: block;
        }
        .br-complete-title {
          font-family: 'DM Serif Display', serif;
          font-size: 2rem; color: var(--text); margin: 0 0 0.4rem;
        }
        .br-stat-row {
          display: flex; gap: 0.8rem; justify-content: center; margin: 1.6rem 0;
        }
        .br-stat-box {
          flex: 1;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 0.9rem 0.6rem;
        }
        .br-stat-val { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: var(--text); }
        .br-stat-lbl { font-size: 0.68rem; color: var(--muted); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }

        .br-btn-row { display: flex; gap: 0.8rem; }
        .br-btn-ghost {
          flex: 1; padding: 0.9rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 600;
          border-radius: 14px; cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .br-btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); }

        .br-btn-solid {
          flex: 1.5; padding: 0.9rem;
          background: linear-gradient(135deg, #34d399, #059669);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 600;
          border: none; border-radius: 14px; cursor: pointer;
          box-shadow: 0 6px 24px rgba(52,211,153,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .br-btn-solid:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(52,211,153,0.45); }

        /* Animations */
        @keyframes twinkle {
          0%,100% { opacity: 0.15; transform: scale(1); }
          50%      { opacity: 0.6;  transform: scale(1.4); }
        }
        @keyframes spinSlow { to { transform: rotate(360deg); } }
        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
      `}</style>

      <div className="br-root">
        <Navbar />
        <main className="br-main">
          <div className="br-card">

            {/* Particle dots */}
            <div className="br-particles">
              {[...Array(18)].map((_, i) => (
                <div key={i} className="br-dot" style={{
                  width: `${1 + Math.random() * 2}px`,
                  height: `${1 + Math.random() * 2}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  '--dur': `${2.5 + Math.random() * 3}s`,
                  '--delay': `${Math.random() * 3}s`,
                }} />
              ))}
            </div>

            <div className="br-badge">✦ Mindfulness Exercise</div>
            <h1 className="br-title">{challenge?.title || "4-7-8 Breathing"}</h1>
            <p className="br-desc">Calm your nervous system and restore inner clarity</p>

            {/* ── Ready ── */}
            {!isActive && !completed && (
              <>
                <div className="br-info-grid">
                  <div className="br-info-cell">
                    <div className="br-info-num">4s</div>
                    <div className="br-info-lbl">Inhale</div>
                  </div>
                  <div className="br-info-cell">
                    <div className="br-info-num">7s</div>
                    <div className="br-info-lbl">Hold</div>
                  </div>
                  <div className="br-info-cell">
                    <div className="br-info-num">8s</div>
                    <div className="br-info-lbl">Exhale</div>
                  </div>
                </div>
                <button className="br-start-btn" onClick={startSession}>
                  Begin Session →
                </button>
              </>
            )}

            {/* ── Active ── */}
            {isActive && (
              <>
                <div className="br-orb-wrap">
                  <div className="br-orb-ring" style={{ borderColor: cfg.color + '40' }} />
                  <div className="br-orb" style={{
                    transform: `scale(${cfg.scale})`,
                    background: `radial-gradient(circle at 35% 35%, ${cfg.color}dd, ${cfg.color}88)`,
                    boxShadow: `0 0 40px ${cfg.glow}, 0 0 80px ${cfg.glow}`,
                  }}>
                    <span className="br-timer-num">{timer}</span>
                    <span className="br-timer-s">sec</span>
                  </div>
                </div>

                <p className="br-phase-label">{cfg.label}</p>
                <p className="br-phase-sub">{cfg.sub}</p>

                <div className="br-progress-track">
                  <div className="br-progress-fill" style={{
                    width: `${progressPercent}%`,
                    background: `linear-gradient(90deg, #7c6fe0, ${cfg.color})`,
                  }} />
                </div>
                <div className="br-cycle-row">
                  {[...Array(totalCycles)].map((_, i) => (
                    <div key={i} className={`br-cycle-dot ${i < cycles ? 'done' : i === cycles ? 'active' : ''}`} />
                  ))}
                </div>
              </>
            )}

            {/* ── Completed ── */}
            {completed && (
              <>
                <span className="br-complete-icon">🌿</span>
                <h2 className="br-complete-title">Session Complete</h2>
                <p className="br-desc" style={{ marginBottom: 0 }}>Your mind is calmer. Well done.</p>

                <div className="br-stat-row">
                  <div className="br-stat-box">
                    <div className="br-stat-val">{totalCycles}</div>
                    <div className="br-stat-lbl">Cycles</div>
                  </div>
                  <div className="br-stat-box">
                    <div className="br-stat-val">{fmt(totalSeconds)}</div>
                    <div className="br-stat-lbl">Duration</div>
                  </div>
                  <div className="br-stat-box">
                    <div className="br-stat-val">10</div>
                    <div className="br-stat-lbl">Points</div>
                  </div>
                </div>

                <div className="br-btn-row">
                  <button className="br-btn-ghost" onClick={restart}>Practice Again</button>
                  <button className="br-btn-solid" onClick={handleComplete}>Finish →</button>
                </div>
              </>
            )}

          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default BreathingGame;