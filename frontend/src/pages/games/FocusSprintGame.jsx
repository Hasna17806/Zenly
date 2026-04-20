import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const REFOCUS_TIPS = [
  "Come back. One small step is enough.",
  "You don't need motivation — just the next action.",
  "Refocus now. Future you will thank you.",
  "Discipline is built in moments like this.",
  "One task. One mind. Stay with it.",
];

const REASON_OPTIONS = [
  { icon: "📚", text: "Study consistently" },
  { icon: "🎯", text: "Improve my focus" },
  { icon: "🚀", text: "Stop procrastinating" },
  { icon: "🧠", text: "Train my discipline" },
];

/* ── Countdown number ── */
const CountdownNum = ({ n }) => (
  <div key={n} style={{
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(6rem, 20vw, 10rem)",
    fontWeight: 800,
    background: "linear-gradient(135deg, #e0e7ff, #818cf8)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    animation: "numPop 0.5s cubic-bezier(0.34,1.5,0.64,1) both",
    lineHeight: 1,
  }}>{n === 0 ? "GO" : n}</div>
);

/* ── Task row ── */
const TaskRow = ({ task, onComplete, showCheck }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: "0.75rem",
    padding: "0.6rem 0.9rem",
    background: task.completed ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${task.completed ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.07)"}`,
    borderRadius: 12, marginBottom: "0.45rem",
    transition: "all 0.3s",
  }}>
    {showCheck && (
      <button onClick={() => !task.completed && onComplete()} style={{
        width: 20, height: 20, borderRadius: "50%",
        border: `1.5px solid ${task.completed ? "#34d399" : "rgba(255,255,255,0.2)"}`,
        background: task.completed ? "#34d399" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontSize: "0.65rem", cursor: task.completed ? "default" : "pointer",
        flexShrink: 0, transition: "all 0.2s",
      }}>{task.completed ? "✓" : ""}</button>
    )}
    <span style={{
      fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem",
      color: task.completed ? "rgba(255,255,255,0.3)" : "#c7d2fe",
      textDecoration: task.completed ? "line-through" : "none",
      transition: "all 0.3s",
    }}>{task.text}</span>
  </div>
);

/* ── Circular timer ring ── */
const TimerRing = ({ timeLeft, total }) => {
  const r = 80;
  const circ = 2 * Math.PI * r;
  const pct = timeLeft / total;
  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, "0");
  const hue = Math.round(240 + (1 - pct) * 60);

  return (
    <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto 1.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="220" height="220" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="sliGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={`hsl(${hue},75%,65%)`} />
            <stop offset="100%" stopColor={`hsl(${hue+30},70%,70%)`} />
          </linearGradient>
        </defs>
        <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle cx="110" cy="110" r={r} fill="none"
          stroke="url(#sliGrad)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 2s ease" }}
        />
      </svg>
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: "3rem", fontWeight: 800,
          color: `hsl(${hue},75%,75%)`, lineHeight: 1, transition: "color 2s ease",
        }}>{mins}:{secs}</div>
        <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: "0.3rem" }}>remaining</div>
      </div>
    </div>
  );
};

const StudyLockInGame = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const challenge = location.state?.challenge;

  const [timeLeft,        setTimeLeft]        = useState(300);
  const [isActive,        setIsActive]        = useState(false);
  const [mainTask,        setMainTask]        = useState("");
  const [sessionReason,   setSessionReason]   = useState("");
  const [tasks,           setTasks]           = useState([]);
  const [taskInput,       setTaskInput]       = useState("");
  const [distractions,    setDistractions]    = useState(0);
  const [disciplineScore, setDisciplineScore] = useState(0);
  const [tasksCompleted,  setTasksCompleted]  = useState(0);
  const [step,            setStep]            = useState("setup"); // setup|countdown|focus|result
  const [countdown,       setCountdown]       = useState(3);
  const [refocusMsg,      setRefocusMsg]      = useState("");
  const [sessionMood,     setSessionMood]     = useState("");
  const [saving,          setSaving]          = useState(false);
  const msgTimer = useRef(null);

  // Timer
  useEffect(() => {
    let iv;
    if (isActive && timeLeft > 0) { iv = setInterval(() => setTimeLeft(p => p - 1), 1000); }
    if (timeLeft === 0 && isActive) {
      setIsActive(false);
      const score = Math.min(100, Math.max(0, 100 - distractions * 12 + tasksCompleted * 10 + (mainTask.trim() ? 5 : 0) + (sessionReason ? 5 : 0)));
      setDisciplineScore(score);
      setSessionMood(score >= 85 ? "Locked in 🔥" : score >= 65 ? "Good focus ⚡" : "You showed up — that matters 💪");
      setStep("result");
    }
    return () => clearInterval(iv);
  }, [isActive, timeLeft]);

  // Countdown
  useEffect(() => {
    if (step !== "countdown") return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(p => p - 1), 1000);
      return () => clearTimeout(t);
    }
    setStep("focus"); setIsActive(true);
  }, [step, countdown]);

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks(t => [...t, { text: taskInput.trim(), completed: false }]);
    setTaskInput("");
  };

  const completeTask = (i) => {
    setTasks(t => t.map((task, idx) => idx === i ? { ...task, completed: true } : task));
    setTasksCompleted(p => p + 1);
  };

  const handleDistraction = () => {
    setDistractions(p => p + 1);
    const tip = REFOCUS_TIPS[Math.floor(Math.random() * REFOCUS_TIPS.length)];
    setRefocusMsg(tip);
    clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setRefocusMsg(""), 2800);
  };

  const startChallenge = () => {
    if (!mainTask.trim()) return;
    setTimeLeft(300); setDistractions(0); setTasksCompleted(0);
    setDisciplineScore(0); setCountdown(3); setStep("countdown");
    setTasks(t => t.map(task => ({ ...task, completed: false })));
  };

  const reset = () => {
    setTimeLeft(300); setIsActive(false); setDistractions(0);
    setDisciplineScore(0); setTasksCompleted(0); setRefocusMsg("");
    setSessionMood(""); setStep("setup"); setCountdown(3);
    setTasks([]); setTaskInput(""); setMainTask(""); setSessionReason("");
  };

  const completeChallenge = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post("http://localhost:5000/api/completed-challenges",
        { challengeId: challenge?._id, disciplineScore, distractions, tasksCompleted },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {}
    navigate("/challenges");
    setSaving(false);
  };

  const progress = ((300 - timeLeft) / 300) * 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --bg: #06050e;
          --surface: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --indigo: #818cf8;
          --violet: #a78bfa;
          --text: #e0e7ff;
          --muted: #5a5880;
          --radius: 24px;
        }

        .sli-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 70% 50% at 50% -5%, rgba(79,70,229,0.2) 0%, transparent 65%),
            radial-gradient(ellipse 40% 30% at 5% 95%, rgba(167,139,250,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 35% 25% at 95% 80%, rgba(129,140,248,0.07) 0%, transparent 55%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        .sli-main { padding: 5rem 1.5rem 4rem; display: flex; justify-content: center; }
        .sli-wrap { width: 100%; max-width: 560px; }

        /* Header */
        .sli-header { text-align: center; margin-bottom: 1.8rem; }
        .sli-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(129,140,248,0.1); border: 1px solid rgba(129,140,248,0.25);
          color: #a5b4fc; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.35rem 0.9rem; border-radius: 50px; margin-bottom: 0.9rem;
        }
        .sli-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 5vw, 2.8rem); font-weight: 800;
          background: linear-gradient(135deg, #e0e7ff 0%, #818cf8 50%, #a78bfa 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.3rem;
        }
        .sli-sub { color: var(--muted); font-size: 0.9rem; }

        /* Card */
        .sli-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 2rem 1.8rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 50px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative;
        }
        .sli-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(129,140,248,0.35), transparent);
        }

        /* Form elements */
        .sli-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.6rem; display: block; }
        .sli-input {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.04); border: 1.5px solid var(--border);
          border-radius: 14px; padding: 0.85rem 1rem;
          color: var(--text); font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sli-input::placeholder { color: var(--muted); }
        .sli-input:focus { border-color: rgba(129,140,248,0.5); box-shadow: 0 0 0 3px rgba(129,140,248,0.08); }

        /* Reason grid */
        .sli-reason-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
        .sli-reason-btn {
          padding: 0.8rem 0.9rem;
          background: rgba(255,255,255,0.03); border: 1.5px solid var(--border);
          border-radius: 14px; text-align: left; cursor: pointer;
          transition: all 0.2s; color: var(--muted);
          font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .sli-reason-btn:hover { border-color: rgba(129,140,248,0.35); color: var(--text); }
        .sli-reason-btn.selected {
          border-color: rgba(129,140,248,0.6); background: rgba(129,140,248,0.1);
          color: #c7d2fe; box-shadow: 0 0 16px rgba(129,140,248,0.12);
        }

        /* Task input row */
        .sli-task-row { display: flex; gap: 0.6rem; }
        .sli-add-btn {
          padding: 0.85rem 1rem; background: rgba(129,140,248,0.15);
          border: 1px solid rgba(129,140,248,0.3); color: #a5b4fc;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 700;
          border-radius: 14px; cursor: pointer; white-space: nowrap;
          transition: background 0.2s;
        }
        .sli-add-btn:hover { background: rgba(129,140,248,0.25); }

        /* Tips box */
        .sli-tips {
          background: rgba(129,140,248,0.05); border: 1px solid rgba(129,140,248,0.12);
          border-radius: 16px; padding: 1rem 1.2rem; margin-top: 1rem;
        }
        .sli-tip-row { display: flex; gap: 0.5rem; font-size: 0.83rem; color: #a5b4fc; padding: 0.2rem 0; line-height: 1.4; }

        /* Primary button */
        .sli-primary-btn {
          width: 100%; padding: 1.05rem; margin-top: 1.4rem;
          background: linear-gradient(135deg, #4338ca, #818cf8);
          color: white; font-family: 'Syne', sans-serif;
          font-size: 1.05rem; font-weight: 800;
          border: none; border-radius: 16px; cursor: pointer;
          box-shadow: 0 8px 32px rgba(67,56,202,0.4);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .sli-primary-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(67,56,202,0.55); }
        .sli-primary-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }

        /* Section label */
        .sli-section-lbl { font-size: 0.67rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.6rem; }

        /* ── Countdown ── */
        .sli-countdown {
          min-height: 340px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
        }
        .sli-countdown-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 1rem; }
        .sli-countdown-sub { color: var(--muted); font-size: 0.9rem; font-style: italic; margin-top: 1rem; }

        /* ── Focus ── */
        .sli-focus-stats { display: flex; gap: 0.8rem; margin-bottom: 1.4rem; }
        .sli-stat {
          flex: 1; background: rgba(255,255,255,0.03); border: 1px solid var(--border);
          border-radius: 14px; padding: 0.65rem 0.8rem; text-align: center;
        }
        .sli-stat-val { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 700; line-height: 1; }
        .sli-stat-lbl { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 0.15rem; }

        .sli-mission {
          background: rgba(129,140,248,0.06); border: 1px solid rgba(129,140,248,0.15);
          border-radius: 14px; padding: 0.8rem 1rem; margin-bottom: 1.2rem;
          font-size: 0.85rem; color: #a5b4fc;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .sli-mission strong { color: #c7d2fe; }

        .sli-prog-track { height: 3px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-bottom: 1.2rem; }
        .sli-prog-fill {
          height: 100%; border-radius: 3px;
          background: linear-gradient(90deg, #4338ca, #818cf8, #a78bfa);
          transition: width 1s linear;
        }

        .sli-distract-btn {
          width: 100%; padding: 0.8rem; margin-top: 1rem;
          background: rgba(251,191,36,0.07); border: 1px solid rgba(251,191,36,0.2);
          color: #FDE68A; font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; font-weight: 600;
          border-radius: 12px; cursor: pointer; transition: background 0.2s;
        }
        .sli-distract-btn:hover { background: rgba(251,191,36,0.12); }

        .sli-refocus {
          margin-top: 0.8rem;
          background: rgba(129,140,248,0.08); border: 1px solid rgba(129,140,248,0.2);
          border-radius: 12px; padding: 0.85rem 1rem;
          font-family: 'DM Sans', sans-serif; font-style: italic;
          font-size: 0.9rem; color: #c7d2fe; text-align: center;
          animation: fadeSlideIn 0.4s ease;
        }

        /* ── Result ── */
        .sli-result-icon { font-size: 3.5rem; display: block; text-align: center; animation: floatIcon 3s ease-in-out infinite; margin-bottom: 0.8rem; }
        .sli-result-title {
          font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800;
          text-align: center;
          background: linear-gradient(135deg, #e0e7ff, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.25rem;
        }
        .sli-result-mood { text-align: center; color: var(--muted); font-size: 0.9rem; margin-bottom: 1.4rem; }
        .sli-result-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.7rem; margin-bottom: 1.2rem; }
        .sli-result-box {
          background: rgba(255,255,255,0.03); border: 1px solid var(--border);
          border-radius: 14px; padding: 0.8rem 0.5rem; text-align: center;
        }
        .sli-result-val { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800; line-height: 1; }
        .sli-result-lbl { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 0.15rem; }
        .sli-reflection {
          background: rgba(79,70,229,0.12); border: 1px solid rgba(79,70,229,0.25);
          border-radius: 16px; padding: 1.2rem 1.4rem; margin-bottom: 1.4rem;
        }
        .sli-reflection-lbl { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(165,180,252,0.6); margin-bottom: 0.5rem; }
        .sli-reflection-text { font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 700; color: #c7d2fe; line-height: 1.4; margin-bottom: 0.4rem; }
        .sli-reflection-sub { font-size: 0.83rem; color: rgba(165,180,252,0.6); line-height: 1.5; }
        .sli-result-btns { display: flex; gap: 0.8rem; }
        .sli-btn-ghost {
          flex: 1; padding: 0.9rem;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          color: var(--muted); font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 600;
          border-radius: 14px; cursor: pointer; transition: color 0.2s, border-color 0.2s;
        }
        .sli-btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
        .sli-btn-green {
          flex: 1.5; padding: 0.9rem;
          background: linear-gradient(135deg, #059669, #34d399);
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          border: none; border-radius: 14px; cursor: pointer;
          box-shadow: 0 6px 24px rgba(52,211,153,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .sli-btn-green:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(52,211,153,0.45); }
        .sli-btn-green:disabled { opacity: 0.5; transform: none; cursor: not-allowed; }

        /* Animations */
        @keyframes numPop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
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

      <div className="sli-root">
        <Navbar />

        <main className="sli-main">
          <div className="sli-wrap">

            <div className="sli-header">
              <div className="sli-badge">✦ Study Activation</div>
              <h1 className="sli-title">Study Lock-In</h1>
              <p className="sli-sub">Switch your brain into deep focus in 5 minutes</p>
            </div>

            {/* ── SETUP ── */}
            {step === "setup" && (
              <div className="sli-card" style={{ animation: "popIn 0.4s ease both" }}>

                <div style={{ marginBottom: "1.3rem" }}>
                  <label className="sli-label">✦ Study mission</label>
                  <input
                    className="sli-input"
                    value={mainTask}
                    onChange={e => setMainTask(e.target.value)}
                    placeholder="e.g. Finish DBMS revision"
                  />
                </div>

                <div style={{ marginBottom: "1.3rem" }}>
                  <label className="sli-label">✦ Why does this session matter?</label>
                  <div className="sli-reason-grid">
                    {REASON_OPTIONS.map(r => (
                      <button key={r.text}
                        className={`sli-reason-btn ${sessionReason === r.text ? "selected" : ""}`}
                        onClick={() => setSessionReason(r.text)}
                      >
                        <span>{r.icon}</span><span>{r.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label className="sli-label">✦ Mini tasks (optional)</label>
                  <div className="sli-task-row">
                    <input
                      className="sli-input"
                      value={taskInput}
                      onChange={e => setTaskInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addTask()}
                      placeholder="e.g. Read 2 pages"
                    />
                    <button className="sli-add-btn" onClick={addTask}>+ Add</button>
                  </div>
                  {tasks.length > 0 && (
                    <div style={{ marginTop: "0.7rem" }}>
                      {tasks.map((task, i) => <TaskRow key={i} task={task} showCheck={false} />)}
                    </div>
                  )}
                </div>

                <div className="sli-tips">
                  <p className="sli-section-lbl" style={{ marginBottom: "0.5rem" }}>Before you begin</p>
                  {[["📵", "Put your phone face down"], ["🖥️", "Open only what you need"], ["🎯", "Focus on one thing only"]].map(([i, t]) => (
                    <div key={t} className="sli-tip-row"><span>{i}</span><span>{t}</span></div>
                  ))}
                </div>

                <button className="sli-primary-btn" onClick={startChallenge} disabled={!mainTask.trim()}>
                  Lock In Now →
                </button>
              </div>
            )}

            {/* ── COUNTDOWN ── */}
            {step === "countdown" && (
              <div className="sli-card">
                <div className="sli-countdown">
                  <p className="sli-countdown-label">Prepare your mind</p>
                  <CountdownNum n={countdown} />
                  <p className="sli-countdown-sub">Clear the noise. Enter study mode.</p>
                </div>
              </div>
            )}

            {/* ── FOCUS ── */}
            {step === "focus" && (
              <div className="sli-card">
                <p className="sli-section-lbl" style={{ textAlign: "center", marginBottom: "0" }}>✦ Deep focus mode</p>

                <TimerRing timeLeft={timeLeft} total={300} />

                <div className="sli-prog-track">
                  <div className="sli-prog-fill" style={{ width: `${progress}%` }} />
                </div>

                <div className="sli-mission">
                  <span>🎯</span><span>Mission: <strong>{mainTask}</strong></span>
                </div>

                <div className="sli-focus-stats">
                  <div className="sli-stat">
                    <div className="sli-stat-val" style={{ color: "#818cf8" }}>{tasksCompleted}</div>
                    <div className="sli-stat-lbl">Done</div>
                  </div>
                  <div className="sli-stat">
                    <div className="sli-stat-val" style={{ color: distractions > 0 ? "#FDE68A" : "#34d399" }}>{distractions}</div>
                    <div className="sli-stat-lbl">Distractions</div>
                  </div>
                  <div className="sli-stat">
                    <div className="sli-stat-val" style={{ color: "#a78bfa", fontSize: "0.8rem", marginTop: "0.15rem" }}>{sessionReason || "Discipline"}</div>
                    <div className="sli-stat-lbl">Your why</div>
                  </div>
                </div>

                {tasks.length > 0 && (
                  <>
                    <p className="sli-section-lbl">✦ Mini tasks</p>
                    {tasks.map((task, i) => <TaskRow key={i} task={task} onComplete={() => completeTask(i)} showCheck={true} />)}
                  </>
                )}

                <button className="sli-distract-btn" onClick={handleDistraction}>
                  😵 I got distracted
                </button>

                {refocusMsg && <div className="sli-refocus">"{refocusMsg}"</div>}
              </div>
            )}

            {/* ── RESULT ── */}
            {step === "result" && (
              <div className="sli-card" style={{ animation: "popIn 0.5s cubic-bezier(0.34,1.5,0.64,1) both" }}>
                <span className="sli-result-icon">🧠</span>
                <h2 className="sli-result-title">Study Mode Activated</h2>
                <p className="sli-result-mood">{sessionMood}</p>

                <div className="sli-result-stats">
                  <div className="sli-result-box">
                    <div className="sli-result-val" style={{ color: "#818cf8" }}>{disciplineScore}%</div>
                    <div className="sli-result-lbl">Score</div>
                  </div>
                  <div className="sli-result-box">
                    <div className="sli-result-val" style={{ color: "#34d399" }}>{tasksCompleted}</div>
                    <div className="sli-result-lbl">Done</div>
                  </div>
                  <div className="sli-result-box">
                    <div className="sli-result-val" style={{ color: distractions > 0 ? "#FDE68A" : "#34d399" }}>{distractions}</div>
                    <div className="sli-result-lbl">Distracts</div>
                  </div>
                </div>

                <div className="sli-reflection">
                  <p className="sli-reflection-lbl">✦ Reflection</p>
                  <p className="sli-reflection-text">You proved you can sit down and start.</p>
                  <p className="sli-reflection-sub">That's the hardest part of studying — and you just did it.</p>
                </div>

                <div className="sli-result-btns">
                  <button className="sli-btn-ghost" onClick={reset}>Try Again</button>
                  <button className="sli-btn-green" onClick={completeChallenge} disabled={saving}>
                    {saving ? "Saving…" : "Complete →"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default StudyLockInGame;