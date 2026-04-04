import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const prompts = [
  "Someone who helped you recently",
  "Something small that made you smile today",
  "A skill or talent you are proud of",
  "A place that makes you feel peaceful",
  "Something you learned this week",
  "A friend who supports you",
  "A challenge that made you stronger",
  "A memory that still warms your heart",
  "Something in your life you often take for granted",
  "A moment today that felt calm or safe"
];

const FloatingPetal = ({ onDone }) => {
  const petals = ["✿", "❀", "✾", "❁", "⚘"];
  const petal = petals[Math.floor(Math.random() * petals.length)];
  const size = 12 + Math.random() * 10;
  const left = 10 + Math.random() * 80;
  const dur = 1.4 + Math.random() * 0.9;
  const drift = (Math.random() - 0.5) * 40;

  useEffect(() => {
    const t = setTimeout(onDone, dur * 1000 + 300);
    return () => clearTimeout(t);
  }, [dur, onDone]);

  return (
    <span
      style={{
        position: "absolute",
        left: `${left}%`,
        bottom: "55%",
        fontSize: `${size}px`,
        animation: `petalRise ${dur}s ease-out forwards`,
        "--drift": `${drift}px`,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 10,
        color: "#c97d5a",
        opacity: 0.85,
      }}
    >
      {petal}
    </span>
  );
};

const GratitudeTapGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = location.state?.challenge;

  const [gratitude, setGratitude] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [prompt, setPrompt] = useState(
    () => prompts[Math.floor(Math.random() * prompts.length)]
  );
  const [taps, setTaps] = useState(0);
  const [petals, setPetals] = useState([]);
  const [tapScale, setTapScale] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [emotion, setEmotion] = useState(3);
  const [showPopup, setShowPopup] = useState(false);
  const [score, setScore] = useState(0);

  const petalIdRef = useRef(0);

  const MAX_CHARS = 300;
  const MIN_TAPS = 5;

  const challengeId = challenge?._id || challenge?.id || null;

  const handleTap = () => {
    setTaps((p) => p + 1);
    setTapScale(true);
    setTimeout(() => setTapScale(false), 150);
    const id = petalIdRef.current++;
    setPetals((h) => [...h, id]);
  };

  const removePetal = (id) => setPetals((h) => h.filter((x) => x !== id));

  const newPrompt = () => {
    let r;
    do { r = prompts[Math.floor(Math.random() * prompts.length)]; } while (r === prompt);
    setPrompt(r);
  };

  const handleChange = (e) => {
    if (e.target.value.length <= MAX_CHARS) {
      setGratitude(e.target.value);
      setCharCount(e.target.value.length);
    }
  };

  const handleExit = () => navigate("/challenges");

  const handleSubmit = async () => {
    if (!challengeId) {
      setErrorMsg("Challenge ID is missing. Please open this challenge again from the Challenges page.");
      return;
    }
    if (!gratitude.trim()) { setErrorMsg("Please write something you are grateful for."); return; }
    if (gratitude.trim().length < 15) { setErrorMsg("Write a little more so this reflection feels meaningful ✨"); return; }
    if (taps < MIN_TAPS) { setErrorMsg(`Send at least ${MIN_TAPS} appreciation taps ❤️`); return; }

    try {
      setLoading(true);
      setErrorMsg("");
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const calculatedScore =
        Math.min(40, gratitude.trim().length / 5) + Math.min(30, taps * 2) + emotion * 10;

      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { challengeId, gratitude, taps, emotion, score: Math.round(calculatedScore) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setScore(Math.round(calculatedScore));
      setSubmitted(true);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2200);
      setTimeout(() => navigate("/challenges"), 3500);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tapBarWidth = Math.min((taps / MIN_TAPS) * 100, 100);
  const completionPercent =
    ((gratitude.trim().length >= 15 ? 1 : 0) + (emotion ? 1 : 0) + (taps >= MIN_TAPS ? 1 : 0)) / 3 * 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --paper: #faf6f0;
          --paper-mid: #f3ece0;
          --paper-deep: #e8dece;
          --ink: #2c2117;
          --ink-light: #6b5843;
          --ink-muted: #9e8870;
          --terracotta: #c97d5a;
          --sage: #7a9478;
          --rose-dry: #c47a7a;
          --gold: #b8913a;
          --border-soft: rgba(139,110,78,0.18);
          --border-warm: rgba(139,110,78,0.32);
          --r: 20px;
        }

        .gt-root {
          min-height: 100vh;
          background: var(--paper);
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"),
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,125,90,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 95% 90%, rgba(122,148,120,0.1) 0%, transparent 55%);
          font-family: 'Jost', sans-serif;
          color: var(--ink);
        }

        .gt-main {
          padding: 5.5rem 1.5rem 5rem;
          display: flex;
          justify-content: center;
        }

        .gt-wrap {
          width: 100%;
          max-width: 580px;
          position: relative;
        }

        /* ── Header ── */
        .gt-header {
          text-align: center;
          margin-bottom: 2.2rem;
        }

        .gt-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(201,125,90,0.1);
          border: 1px solid rgba(201,125,90,0.28);
          color: var(--terracotta);
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 0.4rem 1rem;
          border-radius: 50px;
          margin-bottom: 1.1rem;
        }

        .gt-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.4rem, 6vw, 3.2rem);
          font-weight: 400;
          color: var(--ink);
          margin: 0 0 0.5rem;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }

        .gt-title em {
          font-style: italic;
          color: var(--terracotta);
        }

        .gt-sub {
          color: var(--ink-muted);
          font-size: 0.92rem;
          font-weight: 300;
          letter-spacing: 0.02em;
        }

        /* ── Progress ── */
        .gt-progress-shell {
          margin: 0 auto 1.6rem;
          max-width: 440px;
        }

        .gt-progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.73rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: var(--ink-muted);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }

        .gt-progress-track {
          height: 5px;
          border-radius: 999px;
          background: var(--paper-deep);
          overflow: hidden;
        }

        .gt-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--terracotta), var(--rose-dry), var(--gold));
          transition: width 0.5s ease;
        }

        /* ── Cards ── */
        .gt-card {
          background: #fffdf9;
          border: 1px solid var(--border-soft);
          border-radius: var(--r);
          padding: 1.8rem 1.9rem;
          margin-bottom: 1rem;
          box-shadow:
            0 1px 3px rgba(139,110,78,0.06),
            0 8px 30px rgba(139,110,78,0.06),
            inset 0 1px 0 rgba(255,255,255,0.8);
          position: relative;
          overflow: hidden;
        }

        .gt-card::after {
          content: '';
          position: absolute;
          top: 0; left: 1.9rem; right: 1.9rem;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,125,90,0.22), transparent);
        }

        .gt-card-accent {
          position: absolute;
          top: 0; left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, var(--terracotta), var(--rose-dry));
          border-radius: var(--r) 0 0 var(--r);
          opacity: 0.5;
        }

        /* ── Labels ── */
        .gt-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-muted);
          margin-bottom: 0.9rem;
        }

        .gt-label-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--terracotta);
          flex-shrink: 0;
        }

        /* ── Prompt card ── */
        .gt-prompt-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.35rem;
          font-weight: 400;
          font-style: italic;
          color: var(--ink);
          line-height: 1.55;
          margin-bottom: 1.1rem;
        }

        .gt-actions-top {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .gt-pill-btn {
          background: var(--paper-mid);
          border: 1px solid var(--border-warm);
          color: var(--ink-light);
          font-family: 'Jost', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.42rem 0.9rem;
          border-radius: 50px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          letter-spacing: 0.02em;
        }

        .gt-pill-btn:hover {
          background: var(--paper-deep);
          border-color: rgba(139,110,78,0.45);
          color: var(--ink);
        }

        /* ── Textarea ── */
        .gt-textarea {
          width: 100%;
          box-sizing: border-box;
          background: var(--paper);
          border: 1.5px solid var(--border-warm);
          border-radius: 14px;
          padding: 1.1rem 1.2rem;
          color: var(--ink);
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          font-weight: 400;
          line-height: 1.7;
          resize: none;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
        }

        .gt-textarea::placeholder {
          color: var(--ink-muted);
          font-style: italic;
          font-weight: 300;
        }

        .gt-textarea:focus {
          border-color: rgba(201,125,90,0.55);
          box-shadow: 0 0 0 4px rgba(201,125,90,0.08);
        }

        .gt-char-count {
          text-align: right;
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--ink-muted);
          margin-top: 0.45rem;
          letter-spacing: 0.03em;
        }

        /* ── Emotion selector ── */
        .gt-emotion-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.65rem;
          margin-top: 0.5rem;
        }

        .gt-emotion-btn {
          border: 1.5px solid var(--border-soft);
          background: var(--paper);
          color: var(--ink);
          border-radius: 14px;
          padding: 0.9rem 0.3rem 0.75rem;
          cursor: pointer;
          transition: all 0.22s ease;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .gt-emotion-btn:hover {
          transform: translateY(-3px);
          border-color: var(--border-warm);
          box-shadow: 0 6px 20px rgba(139,110,78,0.1);
        }

        .gt-emotion-btn.active {
          border-color: rgba(201,125,90,0.55);
          background: linear-gradient(160deg, rgba(201,125,90,0.08), rgba(196,122,122,0.06));
          box-shadow: 0 4px 18px rgba(201,125,90,0.14);
        }

        .gt-emotion-btn.active::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--terracotta), var(--rose-dry));
          border-radius: 14px 14px 0 0;
        }

        .gt-emotion-emoji {
          font-size: 1.45rem;
          display: block;
          margin-bottom: 0.35rem;
        }

        .gt-emotion-text {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: var(--ink-muted);
          text-transform: uppercase;
        }

        .gt-emotion-btn.active .gt-emotion-text {
          color: var(--terracotta);
        }

        /* ── Tap section ── */
        .gt-tap-section {
          text-align: center;
          position: relative;
          min-height: 155px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .gt-tap-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.7rem;
          padding: 0.95rem 2.4rem;
          background: #fffdf9;
          border: 1.5px solid rgba(201,125,90,0.45);
          color: var(--terracotta);
          font-family: 'Jost', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 50px;
          cursor: pointer;
          letter-spacing: 0.04em;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.12s;
          box-shadow:
            0 2px 10px rgba(201,125,90,0.12),
            0 1px 3px rgba(201,125,90,0.1);
          user-select: none;
        }

        .gt-tap-btn:hover {
          background: rgba(201,125,90,0.05);
          border-color: rgba(201,125,90,0.7);
          box-shadow: 0 6px 24px rgba(201,125,90,0.2);
        }

        .gt-tap-btn.scaled {
          transform: scale(0.92);
        }

        .gt-tap-icon {
          font-size: 1.15rem;
          line-height: 1;
        }

        .gt-tap-meta { width: 100%; }

        .gt-tap-count {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--ink-muted);
          margin-bottom: 0.55rem;
          letter-spacing: 0.03em;
        }

        .gt-tap-count strong {
          color: var(--terracotta);
          font-weight: 600;
        }

        .gt-tap-bar-track {
          height: 5px;
          background: var(--paper-deep);
          border-radius: 999px;
          overflow: hidden;
        }

        .gt-tap-bar-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--terracotta), var(--rose-dry));
          transition: width 0.4s cubic-bezier(0.34, 1.5, 0.64, 1);
        }

        /* ── Error ── */
        .gt-error {
          display: flex;
          align-items: flex-start;
          gap: 0.55rem;
          background: rgba(180,80,80,0.06);
          border: 1px solid rgba(180,80,80,0.2);
          color: #9e3e3e;
          font-size: 0.84rem;
          font-weight: 400;
          padding: 0.8rem 1rem;
          border-radius: 12px;
          line-height: 1.5;
        }

        /* ── Buttons row ── */
        .gt-btn-row {
          display: flex;
          gap: 0.75rem;
        }

        .gt-submit {
          flex: 1;
          padding: 1rem;
          background: var(--ink);
          color: var(--paper);
          font-family: 'Jost', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(44,33,23,0.2);
        }

        .gt-submit:hover {
          background: #3d2e20;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(44,33,23,0.28);
        }

        .gt-submit:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }

        .gt-stop {
          padding: 1rem 1.2rem;
          border-radius: 14px;
          border: 1px solid var(--border-warm);
          background: transparent;
          color: var(--ink-muted);
          font-family: 'Jost', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }

        .gt-stop:hover {
          color: var(--ink);
          background: var(--paper-mid);
          border-color: var(--border-warm);
        }

        /* ── Decorative flora ── */
        .gt-flora-tl {
          position: absolute;
          top: -18px;
          right: -24px;
          font-size: 5rem;
          opacity: 0.06;
          pointer-events: none;
          user-select: none;
          transform: rotate(20deg);
          line-height: 1;
        }

        /* ── Success state ── */
        .gt-success {
          text-align: center;
          background: #fffdf9;
          border: 1px solid var(--border-soft);
          border-radius: var(--r);
          padding: 3.5rem 2.5rem;
          box-shadow:
            0 2px 6px rgba(139,110,78,0.07),
            0 20px 60px rgba(139,110,78,0.09);
          animation: popIn 0.55s cubic-bezier(0.34, 1.5, 0.64, 1) both;
        }

        .gt-success-icon {
          font-size: 3.5rem;
          display: block;
          margin-bottom: 1.1rem;
          animation: sway 4s ease-in-out infinite;
        }

        .gt-success-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem;
          font-weight: 400;
          margin: 0 0 0.4rem;
          color: var(--ink);
          letter-spacing: -0.01em;
        }

        .gt-success-sub {
          color: var(--ink-muted);
          font-size: 0.92rem;
          font-weight: 300;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .gt-quote-box {
          background: rgba(201,125,90,0.05);
          border: 1px solid rgba(201,125,90,0.18);
          border-radius: 16px;
          padding: 1.4rem 1.6rem;
          margin-bottom: 1.4rem;
          text-align: left;
          position: relative;
        }

        .gt-quote-mark {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3.5rem;
          font-weight: 300;
          color: var(--terracotta);
          opacity: 0.3;
          position: absolute;
          top: -0.3rem;
          left: 0.8rem;
          line-height: 1;
        }

        .gt-quote-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          font-style: italic;
          color: var(--ink);
          line-height: 1.7;
          padding-top: 0.6rem;
        }

        .gt-quote-meta {
          font-size: 0.73rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-muted);
          margin-top: 0.75rem;
        }

        .gt-score {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(184,145,58,0.1);
          border: 1px solid rgba(184,145,58,0.25);
          color: var(--gold);
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 0.45rem 1.1rem;
          border-radius: 50px;
          margin-top: 0.5rem;
        }

        .gt-redirect {
          font-size: 0.75rem;
          font-weight: 300;
          color: var(--ink-muted);
          margin-top: 1.2rem;
          letter-spacing: 0.04em;
        }

        /* ── Popup ── */
        .gt-popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(250,246,240,0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
        }

        .gt-popup {
          width: 90%;
          max-width: 340px;
          background: #fffdf9;
          border: 1px solid var(--border-warm);
          border-radius: 28px;
          padding: 2.5rem 2rem;
          text-align: center;
          box-shadow: 0 20px 60px rgba(139,110,78,0.2);
          animation: popIn 0.4s cubic-bezier(0.34, 1.5, 0.64, 1);
        }

        .gt-popup-icon {
          font-size: 3rem;
          margin-bottom: 0.8rem;
          animation: sway 3s ease-in-out infinite;
        }

        .gt-popup-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 400;
          margin: 0 0 0.4rem;
          color: var(--ink);
        }

        .gt-popup-sub {
          color: var(--ink-muted);
          font-size: 0.88rem;
          font-weight: 300;
          line-height: 1.5;
        }

        /* ── Divider ── */
        .gt-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0.2rem 0;
          opacity: 0.4;
        }

        .gt-divider::before,
        .gt-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-warm);
        }

        .gt-divider-glyph {
          color: var(--terracotta);
          font-size: 0.8rem;
        }

        /* ── Animations ── */
        @keyframes petalRise {
          0%   { transform: translateY(0) translateX(0) rotate(0deg) scale(0.7); opacity: 0.9; }
          100% { transform: translateY(-130px) translateX(var(--drift)) rotate(40deg) scale(1.1); opacity: 0; }
        }

        @keyframes popIn {
          from { transform: scale(0.88); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes sway {
          0%, 100% { transform: rotate(-3deg); }
          50%       { transform: rotate(3deg); }
        }
      `}</style>

      <div className="gt-root">
        <Navbar />

        <main className="gt-main">
          <div className="gt-wrap">

            {showPopup && (
              <div className="gt-popup-overlay">
                <div className="gt-popup">
                  <div className="gt-popup-icon">🌿</div>
                  <h3 className="gt-popup-title">Beautifully Done</h3>
                  <p className="gt-popup-sub">You completed your gratitude practice.</p>
                </div>
              </div>
            )}

            <div className="gt-header">
              <div className="gt-badge">✦ Daily Practice</div>
              <h1 className="gt-title">
                {challenge?.title
                  ? <><em>{challenge.title.split(" ")[0]}</em> {challenge.title.split(" ").slice(1).join(" ")}</>
                  : <><em>Gratitude</em> Boost</>
                }
              </h1>
              <p className="gt-sub">Reflect deeply, feel it fully, and send appreciation outward</p>
            </div>

            {!submitted ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                <div className="gt-progress-shell">
                  <div className="gt-progress-text">
                    <span>Your progress</span>
                    <span>{Math.round(completionPercent)}%</span>
                  </div>
                  <div className="gt-progress-track">
                    <div className="gt-progress-fill" style={{ width: `${completionPercent}%` }} />
                  </div>
                </div>

                {/* Prompt card */}
                <div className="gt-card" style={{ paddingLeft: "2.1rem" }}>
                  <div className="gt-card-accent" />
                  <div className="gt-label"><span className="gt-label-dot" /> Reflection Prompt</div>
                  <p className="gt-prompt-text">"{prompt}"</p>
                  <div className="gt-actions-top">
                    <button className="gt-pill-btn" onClick={newPrompt}>↻ New prompt</button>
                    <button className="gt-pill-btn" onClick={handleExit}>Exit</button>
                  </div>
                </div>

                {/* Write */}
                <div className="gt-card">
                  <div className="gt-flora-tl">✾</div>
                  <div className="gt-label"><span className="gt-label-dot" /> Step 1 — Write your gratitude</div>
                  <textarea
                    className="gt-textarea"
                    value={gratitude}
                    onChange={handleChange}
                    placeholder="Write what you are grateful for, and why it matters to you…"
                    rows={5}
                  />
                  <p className="gt-char-count">{charCount} / {MAX_CHARS}</p>
                </div>

                {/* Emotion */}
                <div className="gt-card">
                  <div className="gt-label"><span className="gt-label-dot" /> Step 2 — How deeply do you feel it?</div>
                  <div className="gt-emotion-row">
                    {[
                      { value: 1, emoji: "🙂", label: "Little" },
                      { value: 2, emoji: "😊", label: "Warm" },
                      { value: 3, emoji: "😌", label: "Calm" },
                      { value: 4, emoji: "🥹", label: "Deep" },
                      { value: 5, emoji: "💖", label: "Full" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        className={`gt-emotion-btn ${emotion === item.value ? "active" : ""}`}
                        onClick={() => setEmotion(item.value)}
                      >
                        <span className="gt-emotion-emoji">{item.emoji}</span>
                        <span className="gt-emotion-text">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tap */}
                <div className="gt-card">
                  <div className="gt-label" style={{ justifyContent: "center" }}>
                    <span className="gt-label-dot" /> Step 3 — Send appreciation
                  </div>

                  <div className="gt-tap-section">
                    {petals.map((id) => (
                      <FloatingPetal key={id} onDone={() => removePetal(id)} />
                    ))}

                    <button
                      className={`gt-tap-btn ${tapScale ? "scaled" : ""}`}
                      onClick={handleTap}
                    >
                      <span className="gt-tap-icon">✿</span>
                      Tap to Appreciate
                    </button>

                    <div className="gt-tap-meta">
                      <p className="gt-tap-count">
                        <strong>{taps}</strong> / {MIN_TAPS} appreciation taps
                      </p>
                      <div className="gt-tap-bar-track">
                        <div className="gt-tap-bar-fill" style={{ width: `${tapBarWidth}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="gt-error">
                    <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>⚠</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="gt-divider"><span className="gt-divider-glyph">✦</span></div>

                <div className="gt-btn-row">
                  <button className="gt-stop" onClick={handleExit}>Stop</button>
                  <button className="gt-submit" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving…" : "Complete Challenge →"}
                  </button>
                </div>
              </div>

            ) : (
              <div className="gt-success">
                <span className="gt-success-icon">🌿</span>
                <h2 className="gt-success-title">Challenge Complete</h2>
                <p className="gt-success-sub">
                  You paused, reflected, and strengthened a positive mental pathway.
                </p>

                <div className="gt-quote-box">
                  <span className="gt-quote-mark">"</span>
                  <p className="gt-quote-text">{gratitude}"</p>
                  <p className="gt-quote-meta">
                    {taps} appreciation tap{taps !== 1 ? "s" : ""} · Emotion {emotion}/5
                  </p>
                </div>

                <div className="gt-score">✦ +{score} Mind Points</div>
                <p className="gt-redirect">Returning to challenges in a moment…</p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default GratitudeTapGame;