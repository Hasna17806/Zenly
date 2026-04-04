import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import GameControls from "../../components/GameControls";
import axios from "axios";

const moods = [
  "Overthinking",
  "Stress",
  "Self-doubt",
  "Anxiety",
  "Pressure",
  "Exhaustion",
  "Sadness",
  "Mental Fatigue"
];

const thoughtPool = [
  "What if I fail?",
  "I’m too behind.",
  "I can’t handle everything.",
  "I’m not doing enough.",
  "I’m mentally exhausted.",
  "Everything feels heavy.",
  "I should be doing more.",
  "I’m not enough.",
  "I can’t slow down.",
  "I’m carrying too much.",
  "I’m tired of pretending I’m okay.",
  "I have too much on my mind."
];

const releaseMessages = [
  "You don’t have to carry that right now.",
  "Let it soften.",
  "Release what isn’t helping you.",
  "You are allowed to breathe.",
  "Make room for peace.",
  "That thought does not define you.",
  "Not everything needs your energy.",
  "This feeling will pass."
];

const reframes = [
  "I am doing enough for today.",
  "I can take this one step at a time.",
  "Rest is part of healing.",
  "My worth is not my productivity.",
  "I deserve calm.",
  "This moment will pass.",
  "I can pause without guilt.",
  "I am allowed to slow down."
];

const RELEASE_GOAL = 6;

/* ── Floating calming message ── */
const FloatingMessage = ({ text, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "28%",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(167,139,250,0.12)",
        border: "1px solid rgba(167,139,250,0.28)",
        backdropFilter: "blur(14px)",
        color: "#e9d5ff",
        fontFamily: "'DM Serif Display', serif",
        fontStyle: "italic",
        fontSize: "1rem",
        padding: "0.9rem 1.5rem",
        borderRadius: "999px",
        animation: "affirmRise 2.2s ease-out forwards",
        zIndex: 300,
        pointerEvents: "none",
        textAlign: "center",
        maxWidth: "90vw",
      }}
    >
      {text}
    </div>
  );
};

const CalmTapsGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = location.state?.challenge;

  const [stage, setStage] = useState("mood"); // mood | release | reframe | done
  const [selectedMood, setSelectedMood] = useState("");
  const [thoughts, setThoughts] = useState([]);
  const [releasedCount, setReleasedCount] = useState(0);
  const [chosenReframe, setChosenReframe] = useState("");
  const [showStop, setShowStop] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [messageQueue, setMessageQueue] = useState([]);
  const [lastMessage, setLastMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const msgIdRef = useRef(0);
  const lastThoughtRef = useRef("");

  useEffect(() => {
    if (stage === "release" && thoughts.length === 0 && releasedCount < RELEASE_GOAL) {
      spawnThoughts();
    }
  }, [stage, thoughts.length, releasedCount]);

  const spawnThoughts = () => {
    const shuffled = [...thoughtPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .map((text, index) => ({
        id: `${Date.now()}-${index}`,
        text,
        x: 14 + Math.random() * 72,
        y: 18 + Math.random() * 58,
        rotate: -8 + Math.random() * 16,
        delay: Math.random() * 0.3,
      }));

    setThoughts(shuffled);
  };

  const startRelease = (mood) => {
    setSelectedMood(mood);
    setStage("release");
    setReleasedCount(0);
    setChosenReframe("");
    setThoughts([]);
    setGameActive(true);
  };

  const handleReleaseThought = (thoughtId) => {
    const releasedThought = thoughts.find((t) => t.id === thoughtId);
    if (!releasedThought) return;

    lastThoughtRef.current = releasedThought.text;
    setThoughts((prev) => prev.filter((t) => t.id !== thoughtId));

    const newCount = releasedCount + 1;
    setReleasedCount(newCount);

    let msg;
    do {
      msg = releaseMessages[Math.floor(Math.random() * releaseMessages.length)];
    } while (msg === lastMessage && releaseMessages.length > 1);

    setLastMessage(msg);

    const id = msgIdRef.current++;
    setMessageQueue((prev) => [...prev, { id, text: msg }]);

    if (newCount >= RELEASE_GOAL) {
      setTimeout(() => {
        setStage("reframe");
        setThoughts([]);
      }, 700);
    }
  };

  const stopGame = () => {
    setStage("mood");
    setSelectedMood("");
    setThoughts([]);
    setReleasedCount(0);
    setChosenReframe("");
    setShowStop(false);
    setGameActive(false);
    setShowCompletion(false);
  };

  const completeChallenge = async (selectedFinalReframe = chosenReframe) => {
    if (!challenge?._id) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        {
          challengeId: challenge._id,
          mood: selectedMood,
          releasedCount,
          chosenReframe: selectedFinalReframe,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowCompletion(true);
      setStage("done");
      setGameActive(false);

      setTimeout(() => {
        navigate("/challenges");
      }, 3200);
    } catch (err) {
      console.error("Error completing challenge:", err);
      alert("Could not complete challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChooseReframe = (text) => {
    setChosenReframe(text);
    setTimeout(() => {
      completeChallenge(text);
    }, 500);
  };

  const progress = Math.min((releasedCount / RELEASE_GOAL) * 100, 100);
  const bgIntensity = Math.min(releasedCount / RELEASE_GOAL, 1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --bg: #080b14;
          --surface: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --violet: #a78bfa;
          --violet-soft: #c4b5fd;
          --teal: #5eead4;
          --text: #ede9fe;
          --muted: #8d82b7;
          --danger: #f87171;
          --radius: 28px;
        }

        * {
          box-sizing: border-box;
        }

        .ct-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 80% 55% at 50% -5%, rgba(109,40,217,${0.18 - bgIntensity * 0.08}) 0%, transparent 65%),
            radial-gradient(ellipse 40% 30% at 5% 95%, rgba(94,234,212,${0.06 + bgIntensity * 0.08}) 0%, transparent 55%),
            radial-gradient(ellipse 35% 30% at 95% 85%, rgba(167,139,250,${0.08 - bgIntensity * 0.03}) 0%, transparent 55%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
          transition: background-image 0.6s ease;
        }

        .ct-main {
          padding: 5rem 1.5rem 3rem;
          display: flex;
          justify-content: center;
        }

        .ct-wrap {
          width: 100%;
          max-width: 760px;
          text-align: center;
        }

        .ct-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(167,139,250,0.1);
          border: 1px solid rgba(167,139,250,0.25);
          color: #c4b5fd;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.35rem 0.9rem;
          border-radius: 999px;
          margin-bottom: 1rem;
        }

        .ct-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2rem, 5vw, 3rem);
          background: linear-gradient(135deg, #ddd6fe 0%, #a78bfa 45%, #5eead4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 0.45rem;
          line-height: 1.1;
        }

        .ct-sub {
          color: var(--muted);
          font-size: 0.96rem;
          margin-bottom: 2rem;
          max-width: 520px;
          margin-inline: auto;
          line-height: 1.7;
        }

        .ct-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius);
          padding: 2rem;
          backdrop-filter: blur(18px);
          box-shadow: 0 35px 80px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.05);
          position: relative;
          overflow: hidden;
        }

        .ct-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.35), transparent);
        }

        .ct-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 0.8rem;
        }

        .ct-section-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.6rem;
          color: var(--text);
          margin: 0 0 0.6rem;
        }

        .ct-section-sub {
          color: var(--muted);
          font-size: 0.92rem;
          margin-bottom: 1.4rem;
        }

        /* Mood chips */
        .ct-chip-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.85rem;
          justify-content: center;
          margin-top: 1.5rem;
        }

        .ct-chip {
          border: 1px solid rgba(167,139,250,0.22);
          background: rgba(167,139,250,0.08);
          color: #ddd6fe;
          padding: 0.9rem 1.15rem;
          border-radius: 999px;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.22s ease;
          backdrop-filter: blur(10px);
        }

        .ct-chip:hover {
          transform: translateY(-2px);
          border-color: rgba(167,139,250,0.5);
          background: rgba(167,139,250,0.15);
          box-shadow: 0 10px 25px rgba(167,139,250,0.14);
        }

        /* Stats */
        .ct-top-row {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.2rem;
        }

        .ct-stat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 0.85rem 1.25rem;
          min-width: 120px;
        }

        .ct-stat-value {
          font-family: 'DM Serif Display', serif;
          font-size: 1.7rem;
          line-height: 1;
          color: var(--violet-soft);
        }

        .ct-stat-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-top: 0.3rem;
        }

        .ct-progress-wrap {
          margin-bottom: 1.4rem;
        }

        .ct-progress-track {
          height: 5px;
          background: rgba(255,255,255,0.06);
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .ct-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #7c3aed, #a78bfa, #5eead4);
          transition: width 0.45s cubic-bezier(0.34,1.5,0.64,1);
        }

        .ct-progress-label {
          font-size: 0.78rem;
          color: var(--muted);
        }

        /* Arena */
        .ct-arena {
          position: relative;
          min-height: 430px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 30px;
          overflow: hidden;
          margin-bottom: 1.2rem;
          box-shadow: inset 0 0 70px rgba(109,40,217,0.06), 0 35px 80px rgba(0,0,0,0.45);
        }

        .ct-arena::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 30px;
          background-image: radial-gradient(circle at 1px 1px, rgba(167,139,250,0.07) 1px, transparent 0);
          background-size: 30px 30px;
          pointer-events: none;
        }

        .ct-arena-center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(196,181,253,0.28);
          font-size: 0.95rem;
          font-style: italic;
          padding: 1.5rem;
          text-align: center;
        }

        /* Thought cards */
        .ct-thought {
          position: absolute;
          border: 1px solid rgba(248,113,113,0.15);
          background: rgba(255,255,255,0.05);
          color: #f5e1e1;
          padding: 1rem 1.15rem;
          border-radius: 22px;
          max-width: 220px;
          min-width: 150px;
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 45px rgba(0,0,0,0.28);
          cursor: pointer;
          transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
          animation: floatIn 0.5s cubic-bezier(0.34,1.5,0.64,1) both, drift 5s ease-in-out infinite;
        }

        .ct-thought:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 26px 50px rgba(0,0,0,0.34);
        }

        .ct-thought-text {
          font-size: 0.95rem;
          font-weight: 600;
          line-height: 1.5;
        }

        .ct-thought-hint {
          margin-top: 0.55rem;
          font-size: 0.68rem;
          color: rgba(255,255,255,0.38);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* Reframe options */
        .ct-reframe-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-top: 1.4rem;
        }

        .ct-reframe-card {
          text-align: left;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(94,234,212,0.15);
          border-radius: 22px;
          padding: 1.25rem 1.2rem;
          color: var(--text);
          cursor: pointer;
          transition: all 0.22s ease;
          backdrop-filter: blur(14px);
        }

        .ct-reframe-card:hover {
          transform: translateY(-4px);
          border-color: rgba(94,234,212,0.38);
          background: rgba(94,234,212,0.07);
          box-shadow: 0 18px 40px rgba(94,234,212,0.08);
        }

        .ct-reframe-quote {
          font-family: 'DM Serif Display', serif;
          font-size: 1.05rem;
          line-height: 1.65;
          color: #ecfeff;
        }

        /* Buttons */
        .ct-back-btn {
          margin-top: 1.4rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--muted);
          border-radius: 999px;
          padding: 0.8rem 1.1rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ct-back-btn:hover {
          color: var(--text);
          border-color: rgba(255,255,255,0.2);
        }

        /* Overlay modal */
        .ct-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5,5,15,0.82);
          backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 500;
          padding: 1.5rem;
          animation: fadeIn 0.3s ease;
        }

        .ct-modal {
          background: #0d0b1d;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 28px;
          padding: 2.4rem 2rem;
          max-width: 420px;
          width: 100%;
          text-align: center;
          box-shadow: 0 60px 100px rgba(0,0,0,0.6);
          animation: popIn 0.4s cubic-bezier(0.34,1.5,0.64,1) both;
        }

        .ct-modal-icon {
          font-size: 3.4rem;
          margin-bottom: 0.9rem;
          display: block;
          animation: floatIcon 3s ease-in-out infinite;
        }

        .ct-modal-title {
          font-family: 'DM Serif Display', serif;
          font-size: 2rem;
          margin: 0 0 0.5rem;
          background: linear-gradient(135deg, #ddd6fe, #5eead4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ct-modal-sub {
          color: var(--muted);
          font-size: 0.94rem;
          margin-bottom: 1.6rem;
          line-height: 1.7;
        }

        .ct-final-card {
          background: rgba(94,234,212,0.06);
          border: 1px solid rgba(94,234,212,0.18);
          border-radius: 20px;
          padding: 1.2rem 1.3rem;
          text-align: left;
          margin-top: 1rem;
        }

        .ct-final-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 0.5rem;
        }

        .ct-final-text {
          font-family: 'DM Serif Display', serif;
          font-size: 1.1rem;
          line-height: 1.7;
          color: #ecfeff;
        }

        .ct-modal-btns {
          display: flex;
          gap: 0.8rem;
          margin-top: 1.4rem;
        }

        .ct-btn-danger,
        .ct-btn-ghost {
          flex: 1;
          padding: 0.95rem;
          border-radius: 16px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .ct-btn-danger {
          border: none;
          color: white;
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }

        .ct-btn-ghost {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--muted);
        }

        .ct-btn-danger:hover,
        .ct-btn-ghost:hover {
          transform: translateY(-2px);
        }

        .ct-completion-bar {
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
          overflow: hidden;
          margin-top: 1.4rem;
        }

        .ct-completion-fill {
          height: 100%;
          background: linear-gradient(90deg, #7c3aed, #5eead4);
          animation: progFill 3s linear forwards;
        }

        @keyframes floatIn {
          from {
            transform: scale(0.88);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes drift {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes affirmRise {
          0%   { transform: translateX(-50%) translateY(0); opacity: 0; }
          15%  { transform: translateX(-50%) translateY(-8px); opacity: 1; }
          75%  { transform: translateX(-50%) translateY(-8px); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-28px); opacity: 0; }
        }

        @keyframes popIn {
          from { transform: scale(0.82); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes progFill {
          from { width: 0%; }
          to { width: 100%; }
        }

        @media (max-width: 640px) {
          .ct-main {
            padding: 4.5rem 1rem 2.5rem;
          }

          .ct-card {
            padding: 1.35rem;
          }

          .ct-arena {
            min-height: 390px;
          }

          .ct-thought {
            max-width: 180px;
            min-width: 130px;
            padding: 0.9rem 1rem;
          }

          .ct-modal {
            padding: 2rem 1.4rem;
          }
        }
      `}</style>

      {/* Floating calming messages */}
      {messageQueue.map((msg) => (
        <FloatingMessage
          key={msg.id}
          text={msg.text}
          onDone={() => setMessageQueue((prev) => prev.filter((m) => m.id !== msg.id))}
        />
      ))}

      <div className="ct-root">
        <Navbar />

        <main className="ct-main">
          <div className="ct-wrap">
            <div className="ct-badge">✦ Emotional Reset</div>
            <h1 className="ct-title">Release & Reframe</h1>
            <p className="ct-sub">
              Let go of what feels heavy. Keep only what helps you heal.
            </p>

            {/* Stage 1 - Mood */}
            {stage === "mood" && (
              <div className="ct-card">
                <p className="ct-label">✦ Mood check-in</p>
                <h2 className="ct-section-title">How are you feeling right now?</h2>
                <p className="ct-section-sub">
                  Pick the emotion that feels closest to your current state.
                </p>

                <div className="ct-chip-grid">
                  {moods.map((mood) => (
                    <button key={mood} className="ct-chip" onClick={() => startRelease(mood)}>
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stage 2 - Release */}
            {stage === "release" && (
              <>
                <div className="ct-top-row">
                  <div className="ct-stat">
                    <div className="ct-stat-value">{releasedCount}</div>
                    <div className="ct-stat-label">Released</div>
                  </div>
                  <div className="ct-stat">
                    <div className="ct-stat-value" style={{ color: "#5eead4" }}>
                      {RELEASE_GOAL - releasedCount}
                    </div>
                    <div className="ct-stat-label">Remaining</div>
                  </div>
                  <div className="ct-stat">
                    <div className="ct-stat-value" style={{ fontSize: "1.15rem" }}>
                      {selectedMood}
                    </div>
                    <div className="ct-stat-label">Current Mood</div>
                  </div>
                </div>

                <div className="ct-progress-wrap">
                  <div className="ct-progress-track">
                    <div className="ct-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="ct-progress-label">
                    Release {RELEASE_GOAL} heavy thoughts to reset your mind
                  </p>
                </div>

                <div className="ct-card" style={{ marginBottom: "1rem" }}>
                  <p className="ct-label">✦ Thought release</p>
                  <h2 className="ct-section-title">Tap the thoughts you want to let go of</h2>
                  <p className="ct-section-sub">
                    You don’t need to hold onto everything your mind says.
                  </p>

                  <div className="ct-arena">
                    {thoughts.length === 0 ? (
                      <div className="ct-arena-center">
                        New thoughts are surfacing…
                      </div>
                    ) : (
                      thoughts.map((thought) => (
                        <button
                          key={thought.id}
                          className="ct-thought"
                          onClick={() => handleReleaseThought(thought.id)}
                          style={{
                            left: `${thought.x}%`,
                            top: `${thought.y}%`,
                            transform: `translate(-50%, -50%) rotate(${thought.rotate}deg)`,
                            animationDelay: `${thought.delay}s`,
                          }}
                        >
                          <div className="ct-thought-text">{thought.text}</div>
                          <div className="ct-thought-hint">Tap to release</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {gameActive && (
                  <GameControls
                    onComplete={() => setStage("reframe")}
                    onStop={() => setShowStop(true)}
                    onBack={() => navigate("/challenges")}
                  />
                )}
              </>
            )}

            {/* Stage 3 - Reframe */}
            {stage === "reframe" && (
              <div className="ct-card">
                <p className="ct-label">✦ Choose your reframe</p>
                <h2 className="ct-section-title">What do you want to carry with you now?</h2>
                <p className="ct-section-sub">
                  Choose one thought that feels gentle, grounding, and true for this moment.
                </p>

                <div className="ct-reframe-grid">
                  {reframes.map((text) => (
                    <button
                      key={text}
                      className="ct-reframe-card"
                      onClick={() => handleChooseReframe(text)}
                      disabled={loading}
                    >
                      <div className="ct-reframe-quote">“{text}”</div>
                    </button>
                  ))}
                </div>

                <button className="ct-back-btn" onClick={() => setStage("release")}>
                  ← Go Back
                </button>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Stop Modal */}
      {showStop && (
        <div className="ct-overlay">
          <div className="ct-modal">
            <span className="ct-modal-icon">🌙</span>
            <h3 className="ct-modal-title">Leave this reset?</h3>
            <p className="ct-modal-sub">
              Your current emotional release session will be cleared.
            </p>
            <div className="ct-modal-btns">
              <button className="ct-btn-ghost" onClick={() => setShowStop(false)}>
                Stay Here
              </button>
              <button className="ct-btn-danger" onClick={stopGame}>
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletion && (
        <div className="ct-overlay">
          <div className="ct-modal">
            <span className="ct-modal-icon">✨</span>
            <h3 className="ct-modal-title">You made space for peace</h3>
            <p className="ct-modal-sub">
              You released {releasedCount} heavy thoughts and gave yourself a softer place to land.
            </p>

            <div className="ct-final-card">
              <div className="ct-final-label">Today’s reframe</div>
              <div className="ct-final-text">“{chosenReframe}”</div>
            </div>

            <div className="ct-completion-bar">
              <div className="ct-completion-fill" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalmTapsGame;