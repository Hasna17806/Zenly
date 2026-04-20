import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

/* ─────────────────────────── Data ─────────────────────────── */
const CATEGORIES = [
  { id: "logic",   name: "Logic Boost",   icon: "🧠", accent: "#a78bfa", description: "Wake up your reasoning skills" },
  { id: "math",    name: "Mental Math",   icon: "⚡", accent: "#34d399", description: "Sharpen speed and accuracy" },
  { id: "focus",   name: "Focus Recall",  icon: "🎯", accent: "#60a5fa", description: "Train concentration and memory" },
  { id: "pattern", name: "Pattern Hunt",  icon: "🔍", accent: "#fbbf24", description: "Spot hidden logic quickly" },
];

const QUESTIONS = {
  logic: [
    { question: "If all roses are flowers and some flowers fade quickly, which must be true?", options: ["All roses fade quickly","Some roses are flowers","No flowers are roses","All flowers are roses"], correct: 1, explanation: "If all roses are flowers, roses definitely belong to the flower group." },
    { question: "A clock shows 3:15. What is the angle between the hour and minute hands?", options: ["0°","7.5°","15°","22.5°"], correct: 1, explanation: "At 3:15, the hour hand has moved slightly past 3, creating a 7.5° difference." },
    { question: "If CAT = 24, BAT = 23, then HAT = ?", options: ["28","29","30","31"], correct: 1, explanation: "H=8, A=1, T=20 → 29." },
    { question: "Which number comes next: 2, 6, 12, 20, 30, ?", options: ["36","40","42","44"], correct: 2, explanation: "Pattern: +4,+6,+8,+10, next +12 → 42." },
    { question: "If today is Wednesday, what day is it 17 days later?", options: ["Friday","Saturday","Sunday","Monday"], correct: 0, explanation: "17 mod 7 = 3 → Friday." },
    { question: "Every book on the shelf is blue. This book is on the shelf. What must be true?", options: ["This book is expensive","This book is blue","This book is new","This book is small"], correct: 1, explanation: "If every book there is blue, this one must also be blue." },
    { question: "Which is the strongest logical conclusion?", options: ["Some students are always late","All students are disciplined","A disciplined student can still be tired","Tiredness means failure"], correct: 2, explanation: "This is the most logically reasonable statement." },
  ],
  math: [
    { question: "What is 18 × 7?", options: ["112","126","132","144"], correct: 1, explanation: "18 × 7 = 126." },
    { question: "Solve: 3x + 9 = 24", options: ["3","4","5","6"], correct: 2, explanation: "3x = 15 → x = 5." },
    { question: "What is 25% of 240?", options: ["40","50","60","80"], correct: 2, explanation: "25% = one-fourth → 240 ÷ 4 = 60." },
    { question: "What is 13²?", options: ["156","169","176","196"], correct: 1, explanation: "13 × 13 = 169." },
    { question: "6 notebooks at ₹45 each — total cost?", options: ["₹250","₹260","₹270","₹280"], correct: 2, explanation: "45 × 6 = ₹270." },
    { question: "What is 84 ÷ 7?", options: ["10","11","12","13"], correct: 2, explanation: "84 ÷ 7 = 12." },
    { question: "What is 15% of 200?", options: ["20","25","30","35"], correct: 2, explanation: "10% = 20, 5% = 10, total = 30." },
  ],
  focus: [
    { question: "Which word is spelled correctly?", options: ["Recieve","Receive","Receeve","Receve"], correct: 1, explanation: "The correct spelling is 'Receive'." },
    { question: "Which number appears twice: 4, 9, 2, 7, 9, 1?", options: ["2","4","7","9"], correct: 3, explanation: "9 appears twice." },
    { question: "Which one does NOT belong?", options: ["Book","Pen","Laptop","Banana"], correct: 3, explanation: "Banana is unrelated to study tools." },
    { question: "Odd one out: Calm, Peace, Noise, Relax", options: ["Calm","Peace","Noise","Relax"], correct: 2, explanation: "Noise does not fit with calm-related words." },
    { question: "How many vowels are in 'Education'?", options: ["4","5","6","7"], correct: 2, explanation: "E, u, a, i, o = 5 vowels." },
    { question: "Which comes first alphabetically?", options: ["Focus","Discipline","Clarity","Mind"], correct: 2, explanation: "Clarity comes first alphabetically." },
    { question: "Spot the different one: 1113, 1118, 1113, 1113", options: ["1st","2nd","3rd","4th"], correct: 1, explanation: "1118 is different." },
  ],
  pattern: [
    { question: "Which comes next: A, C, F, J, O, ?", options: ["S","T","U","V"], correct: 2, explanation: "+2,+3,+4,+5,+6 → U." },
    { question: "Odd one out: 3, 5, 11, 14, 17", options: ["3","5","11","14"], correct: 3, explanation: "14 is even; others are odd." },
    { question: "If RED = 27, BLUE = 40, then GREEN = ?", options: ["49","50","51","52"], correct: 0, explanation: "Letter values sum to 49." },
    { question: "Which shape has the most sides?", options: ["Triangle","Hexagon","Pentagon","Square"], correct: 1, explanation: "Hexagon has 6 sides." },
    { question: "Next in: 1, 1, 2, 3, 5, 8, ?", options: ["11","12","13","14"], correct: 2, explanation: "Fibonacci → 13." },
    { question: "Next in: 5, 10, 20, 40, ?", options: ["50","60","70","80"], correct: 3, explanation: "Each doubles → 80." },
    { question: "Same pattern as 2 : 8?", options: ["3 : 9","4 : 16","5 : 20","6 : 30"], correct: 1, explanation: "4² = 16." },
  ],
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const prepareQuestions = (catId) =>
  shuffle(QUESTIONS[catId]).slice(0, 5).map((q) => {
    const correct = q.options[q.correct];
    const opts    = shuffle(q.options);
    return { ...q, options: opts, correct: opts.indexOf(correct) };
  });

/* ─────────────────────────── Sub-components ─────────────────────────── */

/* Countdown overlay */
const CountdownOverlay = ({ n, accent }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 50,
    background: "rgba(4,4,8,0.97)", backdropFilter: "blur(4px)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    animation: "fadeIn 0.3s ease",
  }}>
    <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "1.5rem", fontFamily: "'DM Sans', sans-serif" }}>
      Get ready
    </p>
    <div key={n} style={{
      fontFamily: "'Syne', sans-serif",
      fontSize: "clamp(7rem, 22vw, 12rem)", fontWeight: 800,
      color: n === 0 ? accent : "white",
      animation: "numPop 0.45s cubic-bezier(0.34,1.5,0.64,1) both",
      lineHeight: 1,
      textShadow: n === 0 ? `0 0 60px ${accent}88` : "none",
    }}>{n === 0 ? "GO" : n}</div>
    <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.3)", marginTop: "1.5rem", fontStyle: "italic", fontFamily: "'DM Sans', sans-serif" }}>Focus in. Clear the noise.</p>
  </div>
);

/* Timer arc */
const TimerArc = ({ timeLeft, total, accent }) => {
  const r    = 22;
  const circ = 2 * Math.PI * r;
  const pct  = timeLeft / total;
  const urgent = timeLeft <= 4;
  return (
    <div style={{ position: "relative", width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="60" height="60" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" />
        <circle cx="30" cy="30" r={r} fill="none"
          stroke={urgent ? "#f87171" : accent} strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
        />
      </svg>
      <span style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1rem",
        color: urgent ? "#f87171" : "rgba(255,255,255,0.8)",
        transition: "color 0.5s ease",
      }}>{timeLeft}</span>
    </div>
  );
};

/* ─────────────────────────── Main ─────────────────────────── */
const QuickQuizGame = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const challenge = location.state?.challenge;

  const [category,       setCategory]       = useState(null);
  const [questions,      setQuestions]      = useState([]);
  const [currentQ,       setCurrentQ]       = useState(0);
  const [score,          setScore]          = useState(0);
  const [showResult,     setShowResult]     = useState(false);
  const [userAnswers,    setUserAnswers]    = useState([]);
  const [responseTimes,  setResponseTimes]  = useState([]);
  const [qStartTime,     setQStartTime]     = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback,   setShowFeedback]   = useState(false);
  const [feedbackText,   setFeedbackText]   = useState("");
  const [feedbackOk,     setFeedbackOk]     = useState(true);
  const [streak,         setStreak]         = useState(0);
  const [bestStreak,     setBestStreak]     = useState(0);
  const [countdown,      setCountdown]      = useState(null);
  const [gameStarted,    setGameStarted]    = useState(false);
  const [qTimer,         setQTimer]         = useState(12);
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const feedbackTimer = useRef(null);

  const catData = CATEGORIES.find(c => c.id === category);
  const accent  = catData?.accent ?? "#a78bfa";

  /* countdown */
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(p => p - 1), 900);
      return () => clearTimeout(t);
    }
    setGameStarted(true); setCountdown(null); setQStartTime(Date.now());
  }, [countdown]);

  /* question timer reset */
  useEffect(() => {
    if (gameStarted && !showResult && category && !showFeedback) {
      setQStartTime(Date.now()); setQTimer(12);
    }
  }, [currentQ, gameStarted, category, showFeedback, showResult]);

  /* per-second tick */
  useEffect(() => {
    if (!gameStarted || showResult || showFeedback) return;
    if (qTimer <= 0) { handleTimeout(); return; }
    const t = setTimeout(() => setQTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [qTimer, gameStarted, showResult, showFeedback]);

  const nextStep = () => {
    setSelectedAnswer(null); setShowFeedback(false);
    if (currentQ < questions.length - 1) setCurrentQ(p => p + 1);
    else setShowResult(true);
  };

  const handleTimeout = () => {
    const q = questions[currentQ];
    if (!q) return;
    setUserAnswers(p => [...p, { question: q.question, selected: "No answer", correct: q.options[q.correct], isCorrect: false, explanation: q.explanation }]);
    setResponseTimes(p => [...p, 12]); setStreak(0);
    setFeedbackText("⏳ Time's up — stay calm."); setFeedbackOk(false); setShowFeedback(true);
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(nextStep, 1400);
  };

  const handleAnswer = (index) => {
    if (showFeedback) return;
    const q = questions[currentQ];
    if (!q) return;
    const timeTaken = qStartTime ? (Date.now() - qStartTime) / 1000 : 0;
    const isCorrect = index === q.correct;
    setSelectedAnswer(index);
    setResponseTimes(p => [...p, +timeTaken.toFixed(1)]);
    setUserAnswers(p => [...p, { question: q.question, selected: q.options[index], correct: q.options[q.correct], isCorrect, explanation: q.explanation }]);
    if (isCorrect) {
      const ns = streak + 1;
      setScore(p => p + 1); setStreak(ns); setBestStreak(p => Math.max(p, ns));
      setFeedbackText(ns >= 3 ? "🔥 Locked in!" : ns === 2 ? "⚡ Getting sharper." : "✅ Correct.");
      setFeedbackOk(true);
    } else {
      setStreak(0); setFeedbackText("🧠 Not quite — keep going."); setFeedbackOk(false);
    }
    setShowFeedback(true);
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(nextStep, 1400);
  };

  const startCategory = (catId) => {
    setCategory(catId); setQuestions(prepareQuestions(catId)); setCountdown(3);
  };

  const resetGame = () => {
    setCategory(null); setQuestions([]); setCurrentQ(0); setScore(0);
    setShowResult(false); setUserAnswers([]); setResponseTimes([]);
    setSelectedAnswer(null); setShowFeedback(false); setFeedbackText("");
    setStreak(0); setBestStreak(0); setCountdown(null);
    setGameStarted(false); setQTimer(12); setIsSubmitting(false);
  };

  const completeChallenge = async () => {
    if (!challenge?._id) { navigate("/challenges"); return; }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post("http://localhost:5000/api/completed-challenges", { challengeId: challenge._id }, { headers: { Authorization: `Bearer ${token}` } });
    } catch {}
    navigate("/challenges");
    setIsSubmitting(false);
  };

  const wrongAnswers  = userAnswers.filter(a => !a.isCorrect);
  const avgTime       = responseTimes.length ? (responseTimes.reduce((a,b)=>a+b,0)/responseTimes.length).toFixed(1) : "0.0";
  const accuracy      = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const focusScore    = Math.max(0, Math.min(100, Math.round(accuracy * 0.7 + Math.max(0, 30 - avgTime * 2))));

  /* ── CSS ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

    :root {
      --bg: #04040a;
      --surface: rgba(255,255,255,0.04);
      --border: rgba(255,255,255,0.08);
      --text: #f0edff;
      --muted: #52506a;
      --radius: 20px;
    }

    .qq-root {
      min-height: 100vh;
      background: var(--bg);
      background-image:
        radial-gradient(ellipse 70% 45% at 50% -5%, rgba(40,30,90,0.55) 0%, transparent 65%),
        radial-gradient(ellipse 30% 25% at 5% 95%, rgba(30,50,80,0.4) 0%, transparent 55%);
      font-family: 'DM Sans', sans-serif;
      color: var(--text);
    }

    .qq-main { padding: 5rem 1.5rem 4rem; display: flex; justify-content: center; }
    .qq-wrap { width: 100%; max-width: 640px; }

    /* ── Category select ── */
    .qq-hero { text-align: center; margin-bottom: 2.5rem; }
    .qq-badge {
      display: inline-flex; align-items: center; gap: 0.4rem;
      background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.22);
      color: #c4b5fd; font-size: 0.68rem; font-weight: 700;
      letter-spacing: 0.14em; text-transform: uppercase;
      padding: 0.35rem 0.9rem; border-radius: 50px; margin-bottom: 1rem;
    }
    .qq-title {
      font-family: 'Syne', sans-serif;
      font-size: clamp(2.4rem, 7vw, 3.5rem); font-weight: 800;
      color: white; margin: 0 0 0.4rem; line-height: 1.05;
      letter-spacing: -0.02em;
    }
    .qq-sub { color: var(--muted); font-size: 0.92rem; }

    .qq-cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
    .qq-cat-btn {
      background: rgba(255,255,255,0.03);
      border: 1.5px solid rgba(255,255,255,0.07);
      border-radius: var(--radius);
      padding: 1.4rem 1.2rem;
      text-align: left; cursor: pointer;
      transition: all 0.25s ease;
      position: relative; overflow: hidden;
    }
    .qq-cat-btn::before {
      content: ''; position: absolute; inset: 0; border-radius: var(--radius);
      opacity: 0; transition: opacity 0.25s;
    }
    .qq-cat-btn:hover { transform: translateY(-3px); }
    .qq-cat-icon { font-size: 2.2rem; margin-bottom: 0.8rem; display: block; }
    .qq-cat-name { font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 700; color: white; margin-bottom: 0.2rem; }
    .qq-cat-desc { font-size: 0.72rem; color: var(--muted); font-weight: 500; }

    /* ── Quiz card ── */
    .qq-card {
      background: rgba(255,255,255,0.035);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.8rem;
      backdrop-filter: blur(20px);
      box-shadow: 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
      position: relative;
    }
    .qq-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      border-radius: var(--radius) var(--radius) 0 0;
    }

    /* Top bar */
    .qq-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; }
    .qq-mode-tag {
      display: flex; align-items: center; gap: 0.4rem;
      font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--muted);
    }
    .qq-mode-dot { width: 6px; height: 6px; border-radius: 50%; }

    /* Progress */
    .qq-prog-track { height: 2px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; margin-bottom: 1.4rem; }
    .qq-prog-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }

    /* Stat pills */
    .qq-stats { display: flex; gap: 0.6rem; margin-bottom: 1.6rem; }
    .qq-stat {
      flex: 1; background: rgba(255,255,255,0.03); border: 1px solid var(--border);
      border-radius: 12px; padding: 0.55rem 0.6rem; text-align: center;
    }
    .qq-stat-val { font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 700; line-height: 1; }
    .qq-stat-lbl { font-size: 0.58rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 0.1rem; }

    /* Question */
    .qq-question {
      font-family: 'Syne', sans-serif;
      font-size: clamp(1rem, 2.5vw, 1.25rem); font-weight: 700;
      color: var(--text); line-height: 1.45; margin-bottom: 1.4rem;
    }

    /* Options */
    .qq-options { display: flex; flex-direction: column; gap: 0.55rem; }
    .qq-option {
      width: 100%; padding: 0.85rem 1rem;
      background: rgba(255,255,255,0.03); border: 1.5px solid rgba(255,255,255,0.07);
      border-radius: 14px; text-align: left; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500;
      color: rgba(255,255,255,0.7);
      transition: all 0.18s ease; position: relative;
    }
    .qq-option:not(:disabled):hover { border-color: rgba(255,255,255,0.2); color: white; background: rgba(255,255,255,0.06); }
    .qq-option.selected { color: white; }
    .qq-option:disabled { cursor: default; }

    /* Feedback bar */
    .qq-feedback {
      margin-top: 1.1rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.88rem; font-weight: 600;
      text-align: center;
      animation: slideUp 0.3s ease;
    }

    /* ── Result ── */
    .qq-result-icon { font-size: 3.5rem; display: block; text-align: center; animation: floatIcon 3s ease-in-out infinite; margin-bottom: 0.8rem; }
    .qq-result-title {
      font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; text-align: center;
      color: white; margin: 0 0 0.25rem; letter-spacing: -0.02em;
    }
    .qq-result-sub { text-align: center; color: var(--muted); font-size: 0.88rem; margin-bottom: 1.6rem; }
    .qq-result-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.7rem; margin-bottom: 1.2rem; }
    .qq-result-box { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 14px; padding: 0.9rem 0.5rem; text-align: center; }
    .qq-result-val { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; line-height: 1; }
    .qq-result-lbl { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 0.15rem; }

    .qq-focus-box {
      border: 1px solid; border-radius: 16px;
      padding: 1.3rem 1.4rem; margin-bottom: 1.2rem;
      position: relative; overflow: hidden;
    }
    .qq-focus-lbl { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.4rem; }
    .qq-focus-score { font-family: 'Syne', sans-serif; font-size: 3.2rem; font-weight: 800; line-height: 1; margin-bottom: 0.2rem; }
    .qq-focus-sub { font-size: 0.8rem; opacity: 0.6; }

    .qq-review-wrap { margin-bottom: 1.2rem; }
    .qq-review-lbl { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.7rem; }
    .qq-review-item {
      background: rgba(251,191,36,0.05); border: 1px solid rgba(251,191,36,0.15);
      border-radius: 14px; padding: 1rem 1.1rem; margin-bottom: 0.6rem;
    }
    .qq-review-q { font-size: 0.85rem; font-weight: 600; color: var(--text); margin-bottom: 0.5rem; line-height: 1.4; }
    .qq-review-wrong { font-size: 0.78rem; color: #fca5a5; margin-bottom: 0.15rem; }
    .qq-review-right { font-size: 0.78rem; color: #86efac; margin-bottom: 0.4rem; }
    .qq-review-exp { font-size: 0.75rem; color: var(--muted); font-style: italic; }

    .qq-btn-row { display: flex; gap: 0.8rem; }
    .qq-btn-ghost {
      flex: 1; padding: 0.95rem;
      background: rgba(255,255,255,0.04); border: 1px solid var(--border);
      color: var(--muted); font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem; font-weight: 600;
      border-radius: 14px; cursor: pointer; transition: color 0.2s, border-color 0.2s;
    }
    .qq-btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
    .qq-btn-solid {
      flex: 1.5; padding: 0.95rem;
      color: #030b06; font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem; font-weight: 700;
      border: none; border-radius: 14px; cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .qq-btn-solid:hover { transform: translateY(-2px); }
    .qq-btn-solid:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* Animations */
    @keyframes numPop {
      from { transform: scale(0.4); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes floatIcon {
      0%,100% { transform: translateY(0); }
      50%     { transform: translateY(-8px); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes popIn {
      from { transform: scale(0.88); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }
  `;

  /* ── Category picker ── */
  if (!category) return (
    <>
      <style>{css}</style>
      <div className="qq-root">
        <Navbar />
        <main className="qq-main">
          <div className="qq-wrap">
            <div className="qq-hero">
              <div className="qq-badge">✦ Brain Activation</div>
              <h1 className="qq-title">Brain Sprint</h1>
              <p className="qq-sub">A quick mental warm-up to unlock study mode</p>
            </div>
            <div className="qq-cat-grid">
              {CATEGORIES.map((cat) => (
                <button key={cat.id} className="qq-cat-btn"
                  onClick={() => startCategory(cat.id)}
                  style={{ borderColor: cat.accent + "30" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.accent + "70"; e.currentTarget.style.boxShadow = `0 0 30px ${cat.accent}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = cat.accent + "30"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <span className="qq-cat-icon">{cat.icon}</span>
                  <div className="qq-cat-name">{cat.name}</div>
                  <div className="qq-cat-desc">{cat.description}</div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${cat.accent}60, transparent)`, borderRadius: "0 0 20px 20px" }} />
                </button>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );

  /* ── Countdown ── */
  if (countdown !== null) return (
    <>
      <style>{css}</style>
      <div className="qq-root">
        <Navbar />
        <CountdownOverlay n={countdown} accent={accent} />
        <Footer />
      </div>
    </>
  );

  /* ── Quiz ── */
  if (!showResult) {
    const q        = questions[currentQ];
    const progress = questions.length ? ((currentQ) / questions.length) * 100 : 0;
    return (
      <>
        <style>{css}</style>
        <div className="qq-root">
          <Navbar />
          <main className="qq-main">
            <div className="qq-wrap">
              <div className="qq-card" style={{ "--accent": accent }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${accent}55, transparent)`, borderRadius: "20px 20px 0 0" }} />

                {/* Topbar */}
                <div className="qq-topbar">
                  <div className="qq-mode-tag">
                    <div className="qq-mode-dot" style={{ background: accent }} />
                    {catData?.name}
                  </div>
                  <TimerArc timeLeft={qTimer} total={12} accent={accent} />
                </div>

                {/* Progress */}
                <div className="qq-prog-track">
                  <div className="qq-prog-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${accent}99, ${accent})` }} />
                </div>

                {/* Stats */}
                <div className="qq-stats">
                  <div className="qq-stat">
                    <div className="qq-stat-val" style={{ color: accent }}>{score}</div>
                    <div className="qq-stat-lbl">Score</div>
                  </div>
                  <div className="qq-stat">
                    <div className="qq-stat-val" style={{ color: streak > 0 ? "#fbbf24" : "rgba(255,255,255,0.3)" }}>{streak}🔥</div>
                    <div className="qq-stat-lbl">Streak</div>
                  </div>
                  <div className="qq-stat">
                    <div className="qq-stat-val" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.88rem", marginTop: "0.2rem" }}>{currentQ + 1}/{questions.length}</div>
                    <div className="qq-stat-lbl">Question</div>
                  </div>
                </div>

                {/* Question */}
                <p className="qq-question">{q?.question}</p>

                {/* Options */}
                <div className="qq-options">
                  {q?.options.map((opt, i) => {
                    const isSelected = selectedAnswer === i;
                    return (
                      <button key={i} className={`qq-option ${isSelected ? "selected" : ""}`}
                        onClick={() => handleAnswer(i)}
                        disabled={showFeedback}
                        style={isSelected ? {
                          background: accent + "22",
                          borderColor: accent + "88",
                          color: "white",
                        } : {}}
                      >
                        <span style={{ marginRight: "0.6rem", fontSize: "0.7rem", fontWeight: 800, color: "rgba(255,255,255,0.25)", fontFamily: "'Syne', sans-serif" }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback */}
                {showFeedback && (
                  <div className="qq-feedback" style={{
                    background: feedbackOk ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                    border: `1px solid ${feedbackOk ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`,
                    color: feedbackOk ? "#86efac" : "#fca5a5",
                  }}>{feedbackText}</div>
                )}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  /* ── Result ── */
  return (
    <>
      <style>{css}</style>
      <div className="qq-root">
        <Navbar />
        <main className="qq-main">
          <div className="qq-wrap">
            <div className="qq-card" style={{ animation: "popIn 0.5s cubic-bezier(0.34,1.5,0.64,1) both" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${accent}55, transparent)`, borderRadius: "20px 20px 0 0" }} />

              <span className="qq-result-icon">{accuracy >= 80 ? "🧠" : "⚡"}</span>
              <h2 className="qq-result-title">Brain Activated</h2>
              <p className="qq-result-sub">Your mind is warmed up and ready to focus.</p>

              <div className="qq-result-stats">
                <div className="qq-result-box">
                  <div className="qq-result-val" style={{ color: accent }}>{accuracy}%</div>
                  <div className="qq-result-lbl">Accuracy</div>
                </div>
                <div className="qq-result-box">
                  <div className="qq-result-val" style={{ color: "#34d399" }}>{avgTime}s</div>
                  <div className="qq-result-lbl">Avg Speed</div>
                </div>
                <div className="qq-result-box">
                  <div className="qq-result-val" style={{ color: "#fbbf24" }}>{bestStreak}</div>
                  <div className="qq-result-lbl">Best Streak</div>
                </div>
              </div>

              <div className="qq-focus-box" style={{ borderColor: accent + "30", background: accent + "08" }}>
                <p className="qq-focus-lbl" style={{ color: accent + "88" }}>✦ Focus score</p>
                <div className="qq-focus-score" style={{ color: accent }}>{focusScore}</div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", marginBottom: "0.4rem" }}>
                  <div style={{ height: "100%", width: `${focusScore}%`, background: accent, borderRadius: 3, transition: "width 1s ease" }} />
                </div>
                <p className="qq-focus-sub" style={{ color: accent }}>Speed + accuracy combined</p>
              </div>

              {wrongAnswers.length > 0 && (
                <div className="qq-review-wrap">
                  <p className="qq-review-lbl">✦ Review your misses</p>
                  {wrongAnswers.map((a, i) => (
                    <div key={i} className="qq-review-item">
                      <p className="qq-review-q">{a.question}</p>
                      <p className="qq-review-wrong">✗ Your answer: {a.selected}</p>
                      <p className="qq-review-right">✓ Correct: {a.correct}</p>
                      <p className="qq-review-exp">💡 {a.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="qq-btn-row">
                <button className="qq-btn-ghost" onClick={resetGame}>Try Another Mode</button>
                <button className="qq-btn-solid" onClick={completeChallenge} disabled={isSubmitting}
                  style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent})`, boxShadow: `0 6px 24px ${accent}40` }}>
                  {isSubmitting ? "Saving…" : "Complete →"}
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default QuickQuizGame;