import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const ITEMS = [
  { word: "Apple",    category: "Food",   emoji: "🍎" },
  { word: "Book",     category: "Study",  emoji: "📚" },
  { word: "Tree",     category: "Nature", emoji: "🌲" },
  { word: "Notebook", category: "Study",  emoji: "📓" },
  { word: "Banana",   category: "Food",   emoji: "🍌" },
  { word: "River",    category: "Nature", emoji: "🌊" },
];

const CATS = [
  { name: "Food",   emoji: "🍎", color: "#f87171", glow: "rgba(248,113,113,0.35)", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.3)"  },
  { name: "Study",  emoji: "📚", color: "#818cf8", glow: "rgba(129,140,248,0.35)", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.3)" },
  { name: "Nature", emoji: "🌿", color: "#34d399", glow: "rgba(52,211,153,0.35)",  bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)"  },
];

/* ── Pop chip on correct answer ── */
const PopChip = ({ text, color, id, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 700); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", top: "40%", left: "50%",
      transform: "translateX(-50%)",
      fontFamily: "'Syne', sans-serif", fontWeight: 800,
      fontSize: "1.4rem", color,
      textShadow: `0 0 20px ${color}`,
      animation: "chipPop 0.7s ease-out forwards",
      pointerEvents: "none", zIndex: 300, whiteSpace: "nowrap",
    }}>{text}</div>
  );
};

/* ── Wrong shake flash ── */
const WrongFlash = ({ id, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 400); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(248,113,113,0.05)",
      animation: "wrongFlash 0.4s ease forwards",
      pointerEvents: "none", zIndex: 200,
    }} />
  );
};

const SpeedSortGame = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const challenge = location.state?.challenge;

  const [current,   setCurrent]   = useState(0);
  const [score,     setScore]     = useState(0);
  const [wrong,     setWrong]     = useState(0);
  const [time,      setTime]      = useState(20);
  const [completed, setCompleted] = useState(false);
  const [started,   setStarted]   = useState(false);
  const [chips,     setChips]     = useState([]);
  const [flashes,   setFlashes]   = useState([]);
  const [pressed,   setPressed]   = useState(null);
  const [wordAnim,  setWordAnim]  = useState(true);
  const chipId  = useRef(0);
  const flashId = useRef(0);

  /* Timer */
  useEffect(() => {
    if (!started || completed) return;
    if (time <= 0) { setCompleted(true); return; }
    const t = setTimeout(() => setTime(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [time, started, completed]);

  const handleAnswer = (cat) => {
    if (completed || !started) return;
    const item = ITEMS[current];
    setPressed(cat);
    setTimeout(() => setPressed(null), 160);

    if (item.category === cat) {
      setScore(p => p + 1);
      const catData = CATS.find(c => c.name === cat);
      const id = chipId.current++;
      setChips(c => [...c, { id, text: `+1 ${cat}!`, color: catData.color }]);
    } else {
      setWrong(p => p + 1);
      const id = flashId.current++;
      setFlashes(f => [...f, id]);
    }

    if (current < ITEMS.length - 1) {
      setWordAnim(false);
      setTimeout(() => { setCurrent(p => p + 1); setWordAnim(true); }, 80);
    } else {
      setTimeout(() => setCompleted(true), 200);
    }
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { challengeId: challenge?._id, score },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/challenges");
    } catch { navigate("/challenges"); }
  };

  const timerPct   = (time / 20) * 100;
  const timerColor = time <= 5 ? "#f87171" : time <= 10 ? "#fbbf24" : "#34d399";
  const accuracy   = score + wrong > 0 ? Math.round((score / (score + wrong)) * 100) : 0;
  const stars      = score === ITEMS.length ? 3 : score >= 4 ? 2 : score >= 2 ? 1 : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --bg: #05050d;
          --surface: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --text: #f0edff;
          --muted: #4a4868;
          --radius: 22px;
        }

        .ss-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 70% 50% at 50% -8%, rgba(30,20,80,0.7) 0%, transparent 65%),
            radial-gradient(ellipse 35% 25% at 5% 95%, rgba(52,211,153,0.06) 0%, transparent 55%),
            radial-gradient(ellipse 30% 22% at 95% 80%, rgba(248,113,113,0.06) 0%, transparent 55%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        .ss-main { padding: 5rem 1.5rem 4rem; display: flex; justify-content: center; }
        .ss-wrap { width: 100%; max-width: 480px; }

        /* Header */
        .ss-header { text-align: center; margin-bottom: 1.8rem; }
        .ss-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(129,140,248,0.1); border: 1px solid rgba(129,140,248,0.22);
          color: #a5b4fc; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 0.35rem 0.9rem; border-radius: 50px; margin-bottom: 0.9rem;
        }
        .ss-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 6vw, 3rem); font-weight: 800;
          background: linear-gradient(135deg, #f0edff 0%, #818cf8 50%, #34d399 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.3rem; letter-spacing: -0.02em;
        }
        .ss-sub { color: var(--muted); font-size: 0.88rem; }

        /* Card */
        .ss-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2rem 1.8rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 50px 100px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05);
          position: relative; overflow: hidden;
        }
        .ss-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(129,140,248,0.4), transparent);
        }

        /* Stats row */
        .ss-stats { display: flex; gap: 0.7rem; margin-bottom: 1.4rem; }
        .ss-stat {
          flex: 1; background: rgba(255,255,255,0.03); border: 1px solid var(--border);
          border-radius: 14px; padding: 0.6rem 0.7rem; text-align: center;
        }
        .ss-stat-val { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800; line-height: 1; }
        .ss-stat-lbl { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 0.12rem; }

        /* Timer bar */
        .ss-timer-track { height: 5px; background: rgba(255,255,255,0.06); border-radius: 5px; overflow: hidden; margin-bottom: 1.8rem; }
        .ss-timer-fill { height: 100%; border-radius: 5px; transition: width 1s linear, background 0.5s ease; }

        /* Word display */
        .ss-word-wrap {
          text-align: center; margin-bottom: 2rem;
          min-height: 120px; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
        }
        .ss-word-emoji { font-size: 3rem; margin-bottom: 0.5rem; display: block; }
        .ss-word {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.4rem, 8vw, 3.5rem); font-weight: 800;
          color: white; letter-spacing: -0.02em; line-height: 1;
        }
        .ss-word.anim { animation: wordIn 0.18s cubic-bezier(0.34,1.5,0.64,1) both; }
        .ss-progress-dots {
          display: flex; gap: 0.4rem; justify-content: center; margin-top: 1rem;
        }
        .ss-dot { width: 7px; height: 7px; border-radius: 50%; transition: all 0.3s; }

        /* Category buttons */
        .ss-cats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.7rem; }
        .ss-cat-btn {
          padding: 1.1rem 0.5rem;
          border-radius: 16px; border: 1.5px solid;
          display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: transform 0.15s, box-shadow 0.15s;
          user-select: none; -webkit-tap-highlight-color: transparent;
        }
        .ss-cat-btn:hover { transform: translateY(-3px); }
        .ss-cat-btn:active, .ss-cat-btn.pressed { transform: scale(0.93); }
        .ss-cat-icon { font-size: 1.5rem; }
        .ss-cat-name { font-size: 0.8rem; font-weight: 700; }

        /* ── Ready screen ── */
        .ss-ready {
          text-align: center; padding: 1rem 0;
        }
        .ss-ready-icon { font-size: 4rem; display: block; animation: floatIcon 3s ease-in-out infinite; margin-bottom: 1rem; }
        .ss-ready-desc { color: var(--muted); font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.6rem; }
        .ss-cats-preview { display: flex; justify-content: center; gap: 0.8rem; margin-bottom: 1.8rem; flex-wrap: wrap; }
        .ss-cat-pill {
          display: flex; align-items: center; gap: 0.4rem;
          border-radius: 50px; padding: 0.4rem 0.9rem;
          font-size: 0.78rem; font-weight: 700;
        }
        .ss-start-btn {
          width: 100%; padding: 1.05rem;
          font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 800;
          background: linear-gradient(135deg, #3730a3, #818cf8);
          color: white; border: none; border-radius: 16px; cursor: pointer;
          box-shadow: 0 8px 32px rgba(129,140,248,0.35);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ss-start-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(129,140,248,0.5); }

        /* ── Completed ── */
        .ss-done-icon { font-size: 3.5rem; display: block; text-align: center; animation: floatIcon 3s ease-in-out infinite; margin-bottom: 0.8rem; }
        .ss-done-title {
          font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; text-align: center;
          background: linear-gradient(135deg, #f0edff, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.25rem;
        }
        .ss-done-sub { text-align: center; color: var(--muted); font-size: 0.88rem; margin-bottom: 1.4rem; }
        .ss-done-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.7rem; margin-bottom: 1.2rem; }
        .ss-done-box {
          background: rgba(255,255,255,0.03); border: 1px solid var(--border);
          border-radius: 14px; padding: 0.85rem 0.5rem; text-align: center;
        }
        .ss-done-val { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800; line-height: 1; }
        .ss-done-lbl { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 0.12rem; }
        .ss-stars { display: flex; justify-content: center; gap: 0.4rem; font-size: 1.8rem; margin-bottom: 1.2rem; }
        .ss-star-lit  { animation: starPop 0.4s cubic-bezier(0.34,1.8,0.64,1) both; }
        .ss-star-lit:nth-child(2) { animation-delay: 0.1s; }
        .ss-star-lit:nth-child(3) { animation-delay: 0.2s; }
        .ss-complete-btn {
          width: 100%; padding: 1rem;
          background: linear-gradient(135deg, #059669, #34d399);
          color: #030b06; font-family: 'Syne', sans-serif;
          font-size: 1rem; font-weight: 800;
          border: none; border-radius: 16px; cursor: pointer;
          box-shadow: 0 8px 28px rgba(52,211,153,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ss-complete-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(52,211,153,0.45); }

        /* Animations */
        @keyframes wordIn {
          from { transform: scale(0.7) translateY(10px); opacity: 0; }
          to   { transform: scale(1) translateY(0);      opacity: 1; }
        }
        @keyframes chipPop {
          0%   { transform: translateX(-50%) translateY(0) scale(0.8); opacity: 1; }
          60%  { transform: translateX(-50%) translateY(-40px) scale(1.1); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-70px) scale(0.9); opacity: 0; }
        }
        @keyframes wrongFlash {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes starPop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes popIn {
          from { transform: scale(0.88); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Pop chips */}
      {chips.map(c => (
        <PopChip key={c.id} text={c.text} color={c.color}
          onDone={() => setChips(ch => ch.filter(x => x.id !== c.id))} />
      ))}
      {/* Wrong flashes */}
      {flashes.map(id => (
        <WrongFlash key={id} id={id}
          onDone={() => setFlashes(f => f.filter(x => x !== id))} />
      ))}

      <div className="ss-root">
        <Navbar />

        <main className="ss-main">
          <div className="ss-wrap">

            <div className="ss-header">
              <div className="ss-badge">✦ Speed Challenge</div>
              <h1 className="ss-title">Speed Sort</h1>
              <p className="ss-sub">Sort each word before the clock runs out</p>
            </div>

            <div className="ss-card">

              {/* ── Ready ── */}
              {!started && !completed && (
                <div className="ss-ready">
                  <span className="ss-ready-icon">⚡</span>
                  <p className="ss-ready-desc">
                    Words will appear one by one. Tap the correct category as fast as you can — you have 20 seconds!
                  </p>
                  <div className="ss-cats-preview">
                    {CATS.map(c => (
                      <div key={c.name} className="ss-cat-pill" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
                        <span>{c.emoji}</span><span>{c.name}</span>
                      </div>
                    ))}
                  </div>
                  <button className="ss-start-btn" onClick={() => setStarted(true)}>
                    Start Sorting →
                  </button>
                </div>
              )}

              {/* ── Active ── */}
              {started && !completed && (
                <>
                  {/* Stats */}
                  <div className="ss-stats">
                    <div className="ss-stat">
                      <div className="ss-stat-val" style={{ color: timerColor, transition: "color 0.5s" }}>{time}s</div>
                      <div className="ss-stat-lbl">Time</div>
                    </div>
                    <div className="ss-stat">
                      <div className="ss-stat-val" style={{ color: "#34d399" }}>{score}</div>
                      <div className="ss-stat-lbl">Correct</div>
                    </div>
                    <div className="ss-stat">
                      <div className="ss-stat-val" style={{ color: "#f87171" }}>{wrong}</div>
                      <div className="ss-stat-lbl">Wrong</div>
                    </div>
                  </div>

                  {/* Timer bar */}
                  <div className="ss-timer-track">
                    <div className="ss-timer-fill" style={{ width: `${timerPct}%`, background: timerColor }} />
                  </div>

                  {/* Word */}
                  <div className="ss-word-wrap">
                    <span className="ss-word-emoji">{ITEMS[current].emoji}</span>
                    <div className={`ss-word ${wordAnim ? "anim" : ""}`}>{ITEMS[current].word}</div>
                    <div className="ss-progress-dots">
                      {ITEMS.map((_, i) => (
                        <div key={i} className="ss-dot" style={{
                          background: i < current ? "#34d399" : i === current ? "white" : "rgba(255,255,255,0.12)",
                          transform: i === current ? "scale(1.3)" : "scale(1)",
                        }} />
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="ss-cats">
                    {CATS.map(cat => (
                      <button key={cat.name}
                        className={`ss-cat-btn ${pressed === cat.name ? "pressed" : ""}`}
                        onClick={() => handleAnswer(cat.name)}
                        style={{ background: cat.bg, borderColor: cat.border, boxShadow: pressed === cat.name ? `0 0 24px ${cat.glow}` : "none" }}
                      >
                        <span className="ss-cat-icon">{cat.emoji}</span>
                        <span className="ss-cat-name" style={{ color: cat.color }}>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* ── Completed ── */}
              {completed && (
                <div style={{ animation: "popIn 0.5s cubic-bezier(0.34,1.5,0.64,1) both" }}>
                  <span className="ss-done-icon">{score >= 5 ? "🏆" : score >= 3 ? "⚡" : "💪"}</span>
                  <h2 className="ss-done-title">
                    {time <= 0 ? "Time's Up!" : "Round Complete!"}
                  </h2>
                  <p className="ss-done-sub">
                    {score === ITEMS.length ? "Perfect sort — flawless!" : `You sorted ${score} of ${ITEMS.length} correctly.`}
                  </p>

                  <div className="ss-stars">
                    {[1,2,3].map(s => (
                      <span key={s} className={stars >= s ? "ss-star-lit" : ""}>
                        {stars >= s ? "⭐" : "☆"}
                      </span>
                    ))}
                  </div>

                  <div className="ss-done-stats">
                    <div className="ss-done-box">
                      <div className="ss-done-val" style={{ color: "#34d399" }}>{score}/{ITEMS.length}</div>
                      <div className="ss-done-lbl">Correct</div>
                    </div>
                    <div className="ss-done-box">
                      <div className="ss-done-val" style={{ color: "#818cf8" }}>{accuracy}%</div>
                      <div className="ss-done-lbl">Accuracy</div>
                    </div>
                    <div className="ss-done-box">
                      <div className="ss-done-val" style={{ color: "#fbbf24" }}>{20 - time}s</div>
                      <div className="ss-done-lbl">Used</div>
                    </div>
                  </div>

                  <button className="ss-complete-btn" onClick={handleComplete}>
                    Complete Challenge →
                  </button>
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

export default SpeedSortGame;