import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const PAIRS = [
  { matchId: "a", emotion: { text: "Anxiety",   emoji: "😰" }, skill: { text: "Box Breathing",       emoji: "🌬️" } },
  { matchId: "b", emotion: { text: "Sadness",    emoji: "😢" }, skill: { text: "Journaling",           emoji: "📓" } },
  { matchId: "c", emotion: { text: "Anger",      emoji: "😤" }, skill: { text: "Walk Away",            emoji: "🚶" } },
  { matchId: "d", emotion: { text: "Overwhelm",  emoji: "🌀" }, skill: { text: "One Thing at a Time",  emoji: "🎯" } },
];

const buildCards = () =>
  PAIRS.flatMap(({ matchId, emotion, skill }) => [
    { id: `${matchId}-e`, type: "emotion", text: emotion.text, emoji: emotion.emoji, matchId },
    { id: `${matchId}-s`, type: "skill",   text: skill.text,   emoji: skill.emoji,   matchId },
  ]).sort(() => Math.random() - 0.5);

/* ── Match flash ── */
const MatchFlash = ({ id, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 700); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(94,234,212,0.06)",
      animation: "flashIn 0.7s ease-out forwards",
      pointerEvents: "none", zIndex: 100,
    }} />
  );
};

const STAR_THRESHOLDS = [{ max: 4, stars: 3 }, { max: 6, stars: 2 }, { max: Infinity, stars: 1 }];
const getStars = (moves) => STAR_THRESHOLDS.find(t => moves <= t.max)?.stars ?? 1;

const MindfulMatchGame = () => {
  const navigate = useNavigate();

  const [cards,        setCards]        = useState(() => buildCards());
  const [flipped,      setFlipped]      = useState([]);   // indices
  const [matched,      setMatched]      = useState([]);   // ids
  const [moves,        setMoves]        = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [shakeIdx,     setShakeIdx]     = useState([]);
  const [flashes,      setFlashes]      = useState([]);
  const flashId = useRef(0);

  const shuffleCards = () => {
    setCards(buildCards());
    setFlipped([]); setMatched([]);
    setMoves(0); setGameComplete(false);
    setShakeIdx([]); setFlashes([]);
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2) return;
    if (flipped.includes(index)) return;
    if (matched.includes(cards[index].id)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const newMoves = moves + 1;
      setMoves(newMoves);
      const c1 = cards[newFlipped[0]];
      const c2 = cards[newFlipped[1]];

      if (c1.matchId === c2.matchId) {
        const newMatched = [...matched, c1.id, c2.id];
        setMatched(newMatched);
        setFlipped([]);
        // flash
        const fid = flashId.current++;
        setFlashes(f => [...f, fid]);
        if (newMatched.length === cards.length) setGameComplete(true);
      } else {
        setShakeIdx(newFlipped);
        setTimeout(() => { setFlipped([]); setShakeIdx([]); }, 900);
      }
    }
  };

  const stars = getStars(moves);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --bg: #080611;
          --surface: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --violet: #a78bfa;
          --teal: #5eead4;
          --text: #ede9fe;
          --muted: #7a6fa8;
          --radius: 24px;
        }

        .mm-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 75% 50% at 50% -8%, rgba(109,40,217,0.22) 0%, transparent 65%),
            radial-gradient(ellipse 40% 30% at 5% 95%, rgba(94,234,212,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 35% 25% at 95% 80%, rgba(167,139,250,0.1) 0%, transparent 55%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        .mm-main { padding: 5rem 1.5rem 4rem; display: flex; justify-content: center; }
        .mm-wrap { width: 100%; max-width: 560px; }

        /* Header */
        .mm-header { text-align: center; margin-bottom: 1.8rem; }
        .mm-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.25);
          color: #c4b5fd; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.35rem 0.9rem; border-radius: 50px; margin-bottom: 0.9rem;
        }
        .mm-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2rem, 5vw, 2.8rem);
          background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #5eead4 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.3rem;
        }
        .mm-sub { color: var(--muted); font-size: 0.9rem; }

        /* Stats row */
        .mm-stats-row {
          display: flex; gap: 0.8rem; margin-bottom: 1.2rem;
        }
        .mm-stat {
          flex: 1; background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 0.65rem 0.8rem; text-align: center;
        }
        .mm-stat-val {
          font-family: 'DM Serif Display', serif;
          font-size: 1.5rem; line-height: 1;
        }
        .mm-stat-lbl { font-size: 0.63rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 0.15rem; }
        .mm-shuffle-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          padding: 0.65rem 1.1rem;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          color: var(--muted); font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem; font-weight: 600;
          border-radius: 14px; cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .mm-shuffle-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }

        /* Legend */
        .mm-legend {
          display: flex; gap: 0.6rem; justify-content: center; margin-bottom: 1.2rem;
        }
        .mm-legend-pill {
          display: flex; align-items: center; gap: 0.4rem;
          border-radius: 50px; padding: 0.3rem 0.8rem;
          font-size: 0.72rem; font-weight: 700;
        }
        .mm-legend-emotion { background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.25); color: #c4b5fd; }
        .mm-legend-skill   { background: rgba(94,234,212,0.1);  border: 1px solid rgba(94,234,212,0.25);  color: #5eead4; }

        /* Grid */
        .mm-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 1.2rem;
        }

        /* Card */
        .mm-card-wrap {
          aspect-ratio: 1;
          perspective: 600px;
        }
        .mm-card-inner {
          width: 100%; height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.45s cubic-bezier(0.34,1.2,0.64,1);
          border-radius: 16px;
        }
        .mm-card-inner.flipped  { transform: rotateY(180deg); }
        .mm-card-inner.matched  { transform: rotateY(180deg); }
        .mm-card-inner.shake    { animation: cardShake 0.5s ease; }

        .mm-card-face {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 16px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 4px; padding: 0.5rem;
          text-align: center;
          cursor: pointer;
        }

        /* Back face */
        .mm-card-back {
          background: rgba(109,40,217,0.18);
          border: 1.5px solid rgba(167,139,250,0.25);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.07);
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .mm-card-wrap:hover:not(.mm-no-hover) .mm-card-back {
          border-color: rgba(167,139,250,0.5);
          box-shadow: 0 0 16px rgba(167,139,250,0.25);
        }
        .mm-card-back-q {
          font-family: 'DM Serif Display', serif;
          font-size: 1.5rem; color: rgba(167,139,250,0.5);
        }
        .mm-card-back-dot {
          position: absolute; inset: 0; border-radius: 16px; overflow: hidden;
          background-image: radial-gradient(circle at 1px 1px, rgba(167,139,250,0.12) 1px, transparent 0);
          background-size: 14px 14px; pointer-events: none;
        }

        /* Front face — emotion */
        .mm-card-front { transform: rotateY(180deg); }
        .mm-card-emotion {
          background: rgba(167,139,250,0.14);
          border: 1.5px solid rgba(167,139,250,0.45);
          box-shadow: 0 0 18px rgba(167,139,250,0.2);
        }
        /* Front face — skill */
        .mm-card-skill {
          background: rgba(94,234,212,0.12);
          border: 1.5px solid rgba(94,234,212,0.4);
          box-shadow: 0 0 18px rgba(94,234,212,0.18);
        }
        /* Matched dim */
        .mm-card-inner.matched .mm-card-front {
          opacity: 0.45;
        }
        .mm-card-inner.matched .mm-card-emotion { box-shadow: none; border-color: rgba(167,139,250,0.2); }
        .mm-card-inner.matched .mm-card-skill   { box-shadow: none; border-color: rgba(94,234,212,0.2); }

        .mm-card-emoji { font-size: 1.4rem; line-height: 1; pointer-events: none; }
        .mm-card-text  {
          font-size: 0.6rem; font-weight: 700; letter-spacing: 0.05em;
          text-transform: uppercase; line-height: 1.2; pointer-events: none;
          max-width: 90%;
        }
        .mm-card-type-tag {
          font-size: 0.48rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; opacity: 0.55; pointer-events: none;
        }

        /* Progress bar */
        .mm-prog-track { height: 3px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-bottom: 0.8rem; }
        .mm-prog-fill {
          height: 100%; border-radius: 3px;
          background: linear-gradient(90deg, #7c3aed, #a78bfa, #5eead4);
          transition: width 0.5s ease;
        }

        /* ── Modal ── */
        .mm-overlay {
          position: fixed; inset: 0;
          background: rgba(5,5,15,0.85); backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          z-index: 300; animation: fadeIn 0.3s ease; padding: 1.5rem;
        }
        .mm-modal {
          background: #0d0b1e; border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius); padding: 2.5rem 2rem;
          max-width: 360px; width: 100%; text-align: center;
          box-shadow: 0 60px 100px rgba(0,0,0,0.6);
          animation: popIn 0.45s cubic-bezier(0.34,1.5,0.64,1) both;
          position: relative; overflow: hidden;
        }
        .mm-modal::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent);
        }
        .mm-modal-icon { font-size: 3.5rem; display: block; animation: floatIcon 3s ease-in-out infinite; margin-bottom: 0.8rem; }
        .mm-modal-title {
          font-family: 'DM Serif Display', serif; font-size: 2rem;
          background: linear-gradient(135deg, #c4b5fd, #5eead4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.3rem;
        }
        .mm-modal-sub { color: var(--muted); font-size: 0.88rem; margin-bottom: 1.2rem; }
        .mm-stars { display: flex; justify-content: center; gap: 0.5rem; font-size: 2rem; margin-bottom: 1.2rem; }
        .mm-star-lit  { animation: starPop 0.4s cubic-bezier(0.34,1.8,0.64,1) both; }
        .mm-star-lit:nth-child(2) { animation-delay: 0.1s; }
        .mm-star-lit:nth-child(3) { animation-delay: 0.2s; }
        .mm-score-box {
          background: rgba(167,139,250,0.07); border: 1px solid rgba(167,139,250,0.18);
          border-radius: 14px; padding: 0.8rem 1rem; margin-bottom: 1.4rem;
          font-size: 0.9rem; color: var(--muted);
        }
        .mm-score-box span { color: var(--violet); font-weight: 700; }
        .mm-modal-btns { display: flex; gap: 0.8rem; }
        .mm-btn-ghost {
          flex: 1; padding: 0.9rem;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          color: var(--muted); font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 600;
          border-radius: 14px; cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .mm-btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
        .mm-btn-solid {
          flex: 1.5; padding: 0.9rem;
          background: linear-gradient(135deg, #059669, #34d399);
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          border: none; border-radius: 14px; cursor: pointer;
          box-shadow: 0 6px 24px rgba(52,211,153,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .mm-btn-solid:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(52,211,153,0.45); }

        /* Animations */
        @keyframes cardShake {
          0%,100% { transform: rotateY(180deg) translateX(0); }
          25% { transform: rotateY(180deg) translateX(-6px) rotate(-1deg); }
          75% { transform: rotateY(180deg) translateX(6px) rotate(1deg); }
        }
        @keyframes flashIn {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes starPop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
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

      {/* Match flashes */}
      {flashes.map(fid => (
        <MatchFlash key={fid} id={fid} onDone={() => setFlashes(f => f.filter(x => x !== fid))} />
      ))}

      <div className="mm-root">
        <Navbar />

        <main className="mm-main">
          <div className="mm-wrap">

            {/* Header */}
            <div className="mm-header">
              <div className="mm-badge">✦ Mindful Learning</div>
              <h1 className="mm-title">Mindful Match</h1>
              <p className="mm-sub">Match each emotion with its coping skill</p>
            </div>

            {/* Stats */}
            <div className="mm-stats-row">
              <div className="mm-stat">
                <div className="mm-stat-val" style={{ color: "#a78bfa" }}>{moves}</div>
                <div className="mm-stat-lbl">Moves</div>
              </div>
              <div className="mm-stat">
                <div className="mm-stat-val" style={{ color: "#5eead4" }}>{matched.length / 2}<span style={{ fontSize: "1rem", color: "var(--muted)" }}>/{PAIRS.length}</span></div>
                <div className="mm-stat-lbl">Matched</div>
              </div>
              <button className="mm-shuffle-btn" onClick={shuffleCards}>↺ Shuffle</button>
            </div>

            {/* Progress */}
            <div className="mm-prog-track">
              <div className="mm-prog-fill" style={{ width: `${(matched.length / cards.length) * 100}%` }} />
            </div>

            {/* Legend */}
            <div className="mm-legend">
              <div className="mm-legend-pill mm-legend-emotion">💜 Emotion</div>
              <div className="mm-legend-pill mm-legend-skill">🌊 Coping Skill</div>
            </div>

            {/* Grid */}
            <div className="mm-grid">
              {cards.map((card, index) => {
                const isFlipped  = flipped.includes(index);
                const isMatched  = matched.includes(card.id);
                const isShaking  = shakeIdx.includes(index);
                const isEmotion  = card.type === "emotion";
                const revealed   = isFlipped || isMatched;

                return (
                  <div
                    key={card.id}
                    className={`mm-card-wrap ${isMatched ? "mm-no-hover" : ""}`}
                    onClick={() => handleCardClick(index)}
                  >
                    <div className={`mm-card-inner ${isFlipped ? "flipped" : ""} ${isMatched ? "matched" : ""} ${isShaking ? "shake" : ""}`}>

                      {/* Back */}
                      <div className="mm-card-face mm-card-back">
                        <div className="mm-card-back-dot" />
                        <span className="mm-card-back-q">?</span>
                      </div>

                      {/* Front */}
                      <div className={`mm-card-face mm-card-front ${isEmotion ? "mm-card-emotion" : "mm-card-skill"}`}>
                        <span className="mm-card-emoji">{card.emoji}</span>
                        <span className="mm-card-text" style={{ color: isEmotion ? "#c4b5fd" : "#5eead4" }}>{card.text}</span>
                        <span className="mm-card-type-tag" style={{ color: isEmotion ? "#a78bfa" : "#5eead4" }}>
                          {isEmotion ? "emotion" : "skill"}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </main>

        <Footer />
      </div>

      {/* Win modal */}
      {gameComplete && (
        <div className="mm-overlay">
          <div className="mm-modal">
            <span className="mm-modal-icon">🎯</span>
            <h3 className="mm-modal-title">All Matched!</h3>
            <p className="mm-modal-sub">You connected every emotion to its coping skill.</p>
            <div className="mm-stars">
              {[1, 2, 3].map(s => (
                <span key={s} className={stars >= s ? "mm-star-lit" : ""}>
                  {stars >= s ? "⭐" : "☆"}
                </span>
              ))}
            </div>
            <div className="mm-score-box">
              Completed in <span>{moves}</span> move{moves !== 1 ? "s" : ""}
              {stars === 3 && " 🏆 Perfect!"}
            </div>
            <div className="mm-modal-btns">
              <button className="mm-btn-ghost" onClick={shuffleCards}>Play Again</button>
              <button className="mm-btn-solid" onClick={() => navigate("/challenges")}>Finish →</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MindfulMatchGame;