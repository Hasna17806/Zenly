import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const WORDS_SETS = [
  ["Apple", "Book", "River", "Chair", "Light"],
  ["Brain", "Focus", "Memory", "Learn", "Skill"],
  ["Pen", "Clock", "Table", "Glass", "Phone"],
];

const MEMORIZE_DURATION = 5; // seconds

/* ── Word tile during memorize phase ── */
const WordTile = ({ word, index }) => (
  <div style={{
    background: "white",
    border: "1.5px solid #e8e0f5",
    borderRadius: 14,
    padding: "0.75rem 1.2rem",
    fontFamily: "'Playfair Display', serif",
    fontStyle: "italic",
    fontSize: "1.1rem",
    color: "#3d2c6b",
    boxShadow: "0 2px 12px rgba(109,76,187,0.08)",
    animation: `tileIn 0.4s cubic-bezier(0.34,1.5,0.64,1) ${index * 0.07}s both`,
  }}>{word}</div>
);

/* ── Result word chip ── */
const ResultChip = ({ word, recalled }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: "0.4rem",
    padding: "0.4rem 0.9rem",
    borderRadius: 50,
    background: recalled ? "#f0fdf4" : "#fff1f2",
    border: `1.5px solid ${recalled ? "#86efac" : "#fecdd3"}`,
    fontSize: "0.82rem", fontWeight: 700,
    color: recalled ? "#166534" : "#9f1239",
    animation: "chipIn 0.35s cubic-bezier(0.34,1.5,0.64,1) both",
  }}>
    <span>{recalled ? "✓" : "✗"}</span>
    <span>{word}</span>
  </div>
);

const RecallRushGame = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const challenge = location.state?.challenge;

  const [words,       setWords]       = useState([]);
  const [phase,       setPhase]       = useState("memorize"); // memorize | recall | result
  const [countdown,   setCountdown]   = useState(MEMORIZE_DURATION);
  const [userInput,   setUserInput]   = useState("");
  const [score,       setScore]       = useState(0);
  const [recalled,    setRecalled]    = useState([]);
  const [saving,      setSaving]      = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const set = WORDS_SETS[Math.floor(Math.random() * WORDS_SETS.length)];
    setWords(set);
  }, []);

  /* Countdown during memorize */
  useEffect(() => {
    if (phase !== "memorize" || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase === "memorize" && countdown === 0) {
      setPhase("recall");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [countdown, phase]);

  const handleSubmit = () => {
    const typed = userInput.trim().toLowerCase().split(/[\s,]+/).filter(Boolean);
    const hits  = words.filter(w => typed.includes(w.toLowerCase()));
    setRecalled(hits);
    setScore(hits.length);
    setPhase("result");
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { challengeId: challenge?._id, score },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/challenges");
    } catch { navigate("/challenges"); }
    setSaving(false);
  };

  const pct          = (countdown / MEMORIZE_DURATION) * 100;
  const stars        = score === words.length ? 3 : score >= 3 ? 2 : score >= 1 ? 1 : 0;
  const missedWords  = words.filter(w => !recalled.map(r => r.toLowerCase()).includes(w.toLowerCase()));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --bg: #faf8ff;
          --surface: #ffffff;
          --border: #ede8f8;
          --violet: #6d4cbb;
          --violet-light: #ede8f8;
          --violet-mid: #a78bfa;
          --text: #1e1440;
          --muted: #9487b0;
          --radius: 24px;
        }

        .rr-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 70% 45% at 50% -5%, rgba(167,139,250,0.12) 0%, transparent 65%),
            radial-gradient(ellipse 40% 30% at 100% 100%, rgba(196,181,253,0.08) 0%, transparent 55%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        .rr-main { padding: 5rem 1.5rem 4rem; display: flex; justify-content: center; }
        .rr-wrap { width: 100%; max-width: 480px; }

        /* Header */
        .rr-header { text-align: center; margin-bottom: 1.8rem; }
        .rr-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(109,76,187,0.08); border: 1px solid rgba(109,76,187,0.18);
          color: #6d4cbb; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 0.35rem 0.9rem; border-radius: 50px; margin-bottom: 0.9rem;
        }
        .rr-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 6vw, 2.8rem); font-weight: 700;
          color: var(--text); margin: 0 0 0.3rem; line-height: 1.1;
        }
        .rr-sub { color: var(--muted); font-size: 0.9rem; }

        /* Card */
        .rr-card {
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          padding: 2.2rem 2rem;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.9) inset,
            0 20px 60px rgba(109,76,187,0.08),
            0 2px 8px rgba(109,76,187,0.06);
          position: relative; overflow: hidden;
        }
        .rr-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #a78bfa, #6d4cbb, #c4b5fd);
          border-radius: var(--radius) var(--radius) 0 0;
        }

        /* ── Memorize phase ── */
        .rr-mem-header { text-align: center; margin-bottom: 1.6rem; }
        .rr-phase-label {
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 0.5rem;
        }
        .rr-mem-instruction {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem; font-weight: 400; color: var(--text);
          font-style: italic; line-height: 1.4;
        }

        /* Timer */
        .rr-timer-wrap { margin-bottom: 1.6rem; }
        .rr-timer-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; }
        .rr-timer-lbl { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
        .rr-timer-num {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem; font-weight: 700;
          color: var(--violet);
        }
        .rr-timer-track { height: 5px; background: var(--violet-light); border-radius: 5px; overflow: hidden; }
        .rr-timer-fill {
          height: 100%; border-radius: 5px;
          background: linear-gradient(90deg, #6d4cbb, #a78bfa);
          transition: width 1s linear;
        }

        /* Word grid */
        .rr-word-grid {
          display: flex; flex-wrap: wrap; gap: 0.6rem;
          justify-content: center; margin-bottom: 0.5rem;
        }

        /* ── Recall phase ── */
        .rr-recall-header { text-align: center; margin-bottom: 1.6rem; }
        .rr-count-badge {
          display: inline-flex; align-items: center; gap: 0.35rem;
          background: var(--violet-light); border-radius: 50px;
          padding: 0.3rem 0.8rem; font-size: 0.72rem; font-weight: 700;
          color: var(--violet); margin-bottom: 0.7rem;
        }
        .rr-recall-instruction {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem; font-style: italic; color: var(--text); line-height: 1.4;
        }

        .rr-textarea {
          width: 100%; box-sizing: border-box;
          background: #faf8ff;
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 1rem 1.1rem;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 500;
          resize: none; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 1rem;
        }
        .rr-textarea::placeholder { color: #c4b5d1; }
        .rr-textarea:focus {
          border-color: rgba(109,76,187,0.4);
          box-shadow: 0 0 0 3px rgba(109,76,187,0.08);
        }

        .rr-hint { font-size: 0.72rem; color: var(--muted); text-align: center; margin-bottom: 1.2rem; }

        .rr-submit-btn {
          width: 100%; padding: 1rem;
          background: linear-gradient(135deg, #5b3fa3, #6d4cbb);
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 700;
          border: none; border-radius: 14px; cursor: pointer;
          box-shadow: 0 6px 20px rgba(109,76,187,0.28);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .rr-submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(109,76,187,0.38); }
        .rr-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        /* ── Result phase ── */
        .rr-result-icon { font-size: 3.2rem; text-align: center; display: block; animation: floatIcon 3s ease-in-out infinite; margin-bottom: 0.8rem; }
        .rr-result-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem; font-weight: 700; text-align: center;
          color: var(--text); margin: 0 0 0.2rem;
        }
        .rr-result-sub { text-align: center; color: var(--muted); font-size: 0.88rem; margin-bottom: 1.4rem; }

        .rr-score-ring {
          width: 100px; height: 100px;
          margin: 0 auto 1.4rem;
          position: relative; display: flex; align-items: center; justify-content: center;
        }
        .rr-score-ring-num {
          font-family: 'Playfair Display', serif;
          font-size: 2rem; font-weight: 700; color: var(--violet);
          text-align: center; line-height: 1;
        }
        .rr-score-ring-lbl { font-size: 0.6rem; color: var(--muted); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }

        .rr-stars { display: flex; justify-content: center; gap: 0.4rem; font-size: 1.6rem; margin-bottom: 1.4rem; }
        .rr-star-lit  { animation: starPop 0.4s cubic-bezier(0.34,1.8,0.64,1) both; }
        .rr-star-lit:nth-child(2) { animation-delay: 0.1s; }
        .rr-star-lit:nth-child(3) { animation-delay: 0.2s; }

        .rr-chips-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.6rem; text-align: center; }
        .rr-chips-row { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-bottom: 1.4rem; }

        .rr-fact-box {
          background: linear-gradient(135deg, #f5f0ff, #faf8ff);
          border: 1.5px solid var(--border);
          border-radius: 16px; padding: 1rem 1.2rem; margin-bottom: 1.4rem;
          font-size: 0.85rem; color: #5b3fa3; line-height: 1.6; text-align: center;
        }

        .rr-complete-btn {
          width: 100%; padding: 1rem;
          background: linear-gradient(135deg, #059669, #34d399);
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 700;
          border: none; border-radius: 14px; cursor: pointer;
          box-shadow: 0 6px 20px rgba(52,211,153,0.25);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .rr-complete-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(52,211,153,0.38); }
        .rr-complete-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* Animations */
        @keyframes tileIn {
          from { transform: scale(0.7) translateY(8px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes chipIn {
          from { transform: scale(0.8); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-7px); }
        }
        @keyframes starPop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.35); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes popIn {
          from { transform: scale(0.9); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="rr-root">
        <Navbar />

        <main className="rr-main">
          <div className="rr-wrap">

            <div className="rr-header">
              <div className="rr-badge">✦ Memory Training</div>
              <h1 className="rr-title">Recall Rush</h1>
              <p className="rr-sub">Memorize the words, then type what you remember</p>
            </div>

            <div className="rr-card">

              {/* ── Memorize ── */}
              {phase === "memorize" && (
                <div style={{ animation: "fadeSlide 0.4s ease both" }}>
                  <div className="rr-mem-header">
                    <p className="rr-phase-label">✦ Phase 1 of 2 — Memorize</p>
                    <p className="rr-mem-instruction">Study these words carefully.<br />They'll disappear in a moment.</p>
                  </div>

                  <div className="rr-timer-wrap">
                    <div className="rr-timer-row">
                      <span className="rr-timer-lbl">Time to memorize</span>
                      <span className="rr-timer-num">{countdown}s</span>
                    </div>
                    <div className="rr-timer-track">
                      <div className="rr-timer-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="rr-word-grid">
                    {words.map((word, i) => <WordTile key={word} word={word} index={i} />)}
                  </div>
                </div>
              )}

              {/* ── Recall ── */}
              {phase === "recall" && (
                <div style={{ animation: "fadeSlide 0.4s ease both" }}>
                  <div className="rr-recall-header">
                    <div className="rr-count-badge">
                      <span>🧠</span><span>{words.length} words to recall</span>
                    </div>
                    <p className="rr-recall-instruction">
                      What words do you remember?<br />Type them below.
                    </p>
                  </div>

                  <textarea
                    ref={inputRef}
                    className="rr-textarea"
                    rows={3}
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                    placeholder="e.g. Apple Book River..."
                  />

                  <p className="rr-hint">Separate words with spaces or commas</p>

                  <button
                    className="rr-submit-btn"
                    onClick={handleSubmit}
                    disabled={!userInput.trim()}
                  >
                    Submit Recall →
                  </button>
                </div>
              )}

              {/* ── Result ── */}
              {phase === "result" && (
                <div style={{ animation: "popIn 0.5s cubic-bezier(0.34,1.5,0.64,1) both" }}>
                  <span className="rr-result-icon">
                    {score === words.length ? "🏆" : score >= 3 ? "🧠" : "💪"}
                  </span>
                  <h2 className="rr-result-title">
                    {score === words.length ? "Perfect Memory!" : score >= 3 ? "Great Recall!" : "Keep Practicing!"}
                  </h2>
                  <p className="rr-result-sub">
                    {score === words.length
                      ? "You remembered every single word."
                      : `You recalled ${score} out of ${words.length} words.`}
                  </p>

                  {/* Score ring */}
                  <div className="rr-score-ring">
                    <svg width="100" height="100" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#ede8f8" strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none"
                        stroke="url(#rrGrad)" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 42}
                        strokeDashoffset={2 * Math.PI * 42 * (1 - score / words.length)}
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                      <defs>
                        <linearGradient id="rrGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6d4cbb" />
                          <stop offset="100%" stopColor="#a78bfa" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div style={{ textAlign: "center", zIndex: 1 }}>
                      <div className="rr-score-ring-num">{score}/{words.length}</div>
                      <div className="rr-score-ring-lbl">recalled</div>
                    </div>
                  </div>

                  <div className="rr-stars">
                    {[1,2,3].map(s => (
                      <span key={s} className={stars >= s ? "rr-star-lit" : ""}>
                        {stars >= s ? "⭐" : "☆"}
                      </span>
                    ))}
                  </div>

                  {/* Word chips */}
                  <p className="rr-chips-label">Word results</p>
                  <div className="rr-chips-row">
                    {words.map((word, i) => (
                      <ResultChip
                        key={word}
                        word={word}
                        recalled={recalled.map(r => r.toLowerCase()).includes(word.toLowerCase())}
                      />
                    ))}
                  </div>

                  <div className="rr-fact-box">
                    💡 Active recall improves long-term memory retention by up to <strong>2×</strong> compared to passive re-reading.
                  </div>

                  <button className="rr-complete-btn" onClick={handleComplete} disabled={saving}>
                    {saving ? "Saving…" : "Complete Challenge →"}
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

export default RecallRushGame;