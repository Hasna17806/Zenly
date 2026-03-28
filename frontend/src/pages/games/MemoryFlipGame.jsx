import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

/* ─── Confetti particle ─────────────────────────────────────────── */
const Particle = ({ style }) => <div style={style} className="confetti-piece" />;

const COLORS = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#FF922B','#CC5DE8','#F06595'];

function useConfetti(active) {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (!active) return;
    const pieces = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      style: {
        position: 'fixed',
        top: '-10px',
        left: `${Math.random() * 100}vw`,
        width: `${6 + Math.random() * 8}px`,
        height: `${6 + Math.random() * 8}px`,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        background: COLORS[Math.floor(Math.random() * COLORS.length)],
        animation: `fall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.8}s forwards`,
        transform: `rotate(${Math.random() * 360}deg)`,
        zIndex: 9999,
        pointerEvents: 'none',
      }
    }));
    setParticles(pieces);
    const t = setTimeout(() => setParticles([]), 4000);
    return () => clearTimeout(t);
  }, [active]);
  return particles;
}

/* ─── Card ──────────────────────────────────────────────────────── */
const Card = ({ card, isFlipped, isMatched, onClick }) => (
  <div
    className={`card-wrapper ${isMatched ? 'matched' : ''}`}
    onClick={onClick}
    role="button"
    aria-label={isFlipped || isMatched ? card.emoji : 'Hidden card'}
  >
    <div className={`card-inner ${isFlipped || isMatched ? 'flipped' : ''}`}>
      {/* Back */}
      <div className="card-face card-back">
        <span className="card-back-icon">?</span>
        <div className="card-back-pattern" />
      </div>
      {/* Front */}
      <div className="card-face card-front">
        <span className="card-emoji">{card.emoji}</span>
        {isMatched && <div className="match-ring" />}
      </div>
    </div>
  </div>
);

/* ─── Main component ─────────────────────────────────────────────── */
const MemoryFlipGame = () => {
  const [cards, setCards]             = useState([]);
  const [flipped, setFlipped]         = useState([]);
  const [matched, setMatched]         = useState([]);
  const [moves, setMoves]             = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [bestScore, setBestScore]     = useState(() => Number(localStorage.getItem('memoryBest')) || null);
  const [shake, setShake]             = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const particles = useConfetti(gameComplete);

  const emojis = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼'];

  const initializeGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameComplete(false);
  };

  useEffect(() => { initializeGame(); }, []);

  const handleCardClick = (id) => {
    if (flipped.length === 2 || matched.includes(id) || flipped.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const newMoves = moves + 1;
      setMoves(newMoves);
      const [a, b] = newFlipped;
      const first  = cards.find(c => c.id === a);
      const second = cards.find(c => c.id === b);

      if (first.emoji === second.emoji) {
        const newMatched = [...matched, a, b];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === cards.length) {
          setGameComplete(true);
          if (!bestScore || newMoves < bestScore) {
            setBestScore(newMoves);
            localStorage.setItem('memoryBest', newMoves);
          }
        }
      } else {
        // Wrong — shake feedback
        setShake(true);
        setTimeout(() => { setShake(false); setFlipped([]); }, 900);
      }
    }
  };

  const stars = gameComplete
    ? moves <= 14 ? 3 : moves <= 20 ? 2 : 1
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

        :root {
          --bg: #0f0c1d;
          --surface: #1a1535;
          --card-back: #2d2060;
          --card-back-border: #5b4ae8;
          --card-front: #fff8f0;
          --accent: #FFD93D;
          --accent2: #FF6B6B;
          --accent3: #6BCB77;
          --text: #f0ecff;
          --muted: #8b83b8;
          --radius: 16px;
        }

        .game-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 80% 50% at 20% -10%, rgba(91,74,232,0.25) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 110%, rgba(255,107,107,0.15) 0%, transparent 60%);
          font-family: 'Nunito', sans-serif;
          color: var(--text);
        }

        /* ── Header ── */
        .game-header {
          text-align: center;
          padding: 2.5rem 1rem 0;
        }
        .game-title {
          font-family: 'Fredoka One', cursive;
          font-size: clamp(2.4rem, 6vw, 3.6rem);
          line-height: 1;
          background: linear-gradient(135deg, #FFD93D 0%, #FF922B 50%, #FF6B6B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 0.02em;
          margin: 0;
        }
        .game-subtitle {
          color: var(--muted);
          font-size: 1rem;
          font-weight: 600;
          margin-top: 0.3rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ── Stats bar ── */
        .stats-bar {
          display: flex;
          justify-content: center;
          gap: 1.2rem;
          margin: 1.8rem auto 0;
          max-width: 500px;
          padding: 0 1rem;
        }
        .stat-pill {
          flex: 1;
          background: var(--surface);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50px;
          padding: 0.65rem 1rem;
          text-align: center;
          backdrop-filter: blur(10px);
        }
        .stat-label {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .stat-value {
          font-family: 'Fredoka One', cursive;
          font-size: 1.7rem;
          line-height: 1.1;
          color: var(--accent);
        }
        .stat-value.best { color: var(--accent3); }

        /* ── Grid ── */
        .grid-wrapper {
          display: flex;
          justify-content: center;
          padding: 2rem 1.2rem;
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          max-width: 520px;
          width: 100%;
        }
        .cards-grid.shake {
          animation: gridShake 0.5s ease;
        }

        /* ── Card ── */
        .card-wrapper {
          aspect-ratio: 1;
          cursor: pointer;
          perspective: 700px;
        }
        .card-wrapper.matched { pointer-events: none; }

        .card-inner {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.45s cubic-bezier(0.34,1.4,0.64,1);
          border-radius: var(--radius);
          position: relative;
        }
        .card-inner.flipped { transform: rotateY(180deg); }

        .card-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        /* Back */
        .card-back {
          background: var(--card-back);
          border: 2px solid var(--card-back-border);
          box-shadow: 0 0 0 1px rgba(91,74,232,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .card-wrapper:hover:not(.matched) .card-back {
          box-shadow: 0 0 20px rgba(91,74,232,0.5), 0 0 0 2px var(--card-back-border);
          transform: translateY(-3px) scale(1.03);
        }
        .card-back-icon {
          font-family: 'Fredoka One', cursive;
          font-size: 2rem;
          color: var(--card-back-border);
          user-select: none;
        }
        .card-back-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 1px 1px, rgba(91,74,232,0.35) 1px, transparent 0);
          background-size: 18px 18px;
          pointer-events: none;
        }

        /* Front */
        .card-front {
          background: var(--card-front);
          transform: rotateY(180deg);
          font-size: 2.4rem;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        }
        .card-emoji { position: relative; z-index: 1; user-select: none; }
        .match-ring {
          position: absolute;
          inset: -4px;
          border-radius: calc(var(--radius) + 4px);
          border: 3px solid var(--accent3);
          animation: matchPulse 0.6s ease forwards;
          pointer-events: none;
        }
        .card-wrapper.matched .card-front {
          background: linear-gradient(135deg, #e8fce8, #fff8f0);
          box-shadow: 0 4px 24px rgba(107,203,119,0.3);
        }

        /* ── Win banner ── */
        .win-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10,8,25,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          animation: fadeIn 0.4s ease;
          padding: 1rem;
        }
        .win-card {
          background: var(--surface);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 2.5rem 2rem;
          text-align: center;
          max-width: 380px;
          width: 100%;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,217,61,0.15);
          animation: popIn 0.5s cubic-bezier(0.34,1.5,0.64,1) 0.1s both;
        }
        .win-emoji { font-size: 3.5rem; display: block; margin-bottom: 0.5rem; }
        .win-title {
          font-family: 'Fredoka One', cursive;
          font-size: 2.4rem;
          background: linear-gradient(135deg, #FFD93D, #FF922B);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 0.2rem;
        }
        .win-sub { color: var(--muted); font-size: 0.9rem; font-weight: 700; margin-bottom: 1.4rem; }
        .stars-row {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          font-size: 2rem;
          margin-bottom: 1.6rem;
        }
        .star { transition: transform 0.3s; }
        .star.lit  { animation: starPop 0.4s cubic-bezier(0.34,1.8,0.64,1) both; }
        .star.lit:nth-child(2) { animation-delay: 0.12s; }
        .star.lit:nth-child(3) { animation-delay: 0.24s; }
        .win-score {
          background: rgba(255,217,61,0.08);
          border: 1px solid rgba(255,217,61,0.2);
          border-radius: 12px;
          padding: 0.8rem 1.2rem;
          margin-bottom: 1.6rem;
          font-size: 1.1rem;
          font-weight: 800;
        }
        .win-score span { color: var(--accent); }

        .btn-primary {
          display: block;
          width: 100%;
          padding: 0.95rem 1.5rem;
          background: linear-gradient(135deg, #FFD93D, #FF922B);
          color: #1a1535;
          font-family: 'Fredoka One', cursive;
          font-size: 1.2rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          margin-bottom: 0.8rem;
          box-shadow: 0 4px 20px rgba(255,146,43,0.4);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,146,43,0.5); }
        .btn-primary:active { transform: translateY(0); }

        .btn-secondary {
          display: block;
          width: 100%;
          padding: 0.85rem 1.5rem;
          background: transparent;
          color: var(--muted);
          font-family: 'Fredoka One', cursive;
          font-size: 1.1rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .btn-secondary:hover { color: var(--text); border-color: rgba(255,255,255,0.25); }

        /* ── Reset ── */
        .reset-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin: 0 auto 2rem;
          padding: 0.55rem 1.2rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          color: var(--muted);
          font-family: 'Nunito', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .reset-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.25); }

        /* ── Animations ── */
        @keyframes fall {
          0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg) scale(0.5); opacity: 0; }
        }
        @keyframes gridShake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px) rotate(-1deg); }
          40% { transform: translateX(8px) rotate(1deg); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes matchPulse {
          0%   { opacity: 1; transform: scale(0.9); }
          60%  { opacity: 0.8; transform: scale(1.12); }
          100% { opacity: 0; transform: scale(1.3); }
        }
        @keyframes popIn {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes starPop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-6px); }
        }
        .win-emoji { animation: float 2s ease-in-out infinite; }
      `}</style>

      {/* Confetti */}
      {particles.map(p => <Particle key={p.id} style={p.style} />)}

      <div className="game-root">
        <Navbar />

        <main>
          <div className="game-header">
            <h1 className="game-title">Memory Flip</h1>
            <p className="game-subtitle">Match all the pairs to win!</p>
          </div>

          {/* Stats */}
          <div className="stats-bar">
            <div className="stat-pill">
              <div className="stat-label">Moves</div>
              <div className="stat-value">{moves}</div>
            </div>
            <div className="stat-pill">
              <div className="stat-label">Matched</div>
              <div className="stat-value" style={{ color: 'var(--accent3)' }}>
                {matched.length / 2}<span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/8</span>
              </div>
            </div>
            {bestScore && (
              <div className="stat-pill">
                <div className="stat-label">Best</div>
                <div className="stat-value best">{bestScore}</div>
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="grid-wrapper">
            <div className={`cards-grid ${shake ? 'shake' : ''}`}>
              {cards.map(card => (
                <Card
                  key={card.id}
                  card={card}
                  isFlipped={flipped.includes(card.id)}
                  isMatched={matched.includes(card.id)}
                  onClick={() => handleCardClick(card.id)}
                />
              ))}
            </div>
          </div>

          {/* Reset */}
          <button className="reset-btn" onClick={initializeGame}>
            ↺ New Game
          </button>
        </main>

        <Footer />
      </div>

      {/* Win overlay */}
      {gameComplete && (
        <div className="win-overlay">
          <div className="win-card">
            <span className="win-emoji">🎉</span>
            <h2 className="win-title">You Won!</h2>
            <p className="win-sub">All pairs matched</p>

            <div className="stars-row">
              {[1,2,3].map(s => (
                <span key={s} className={`star ${stars >= s ? 'lit' : ''}`}>
                  {stars >= s ? '⭐' : '☆'}
                </span>
              ))}
            </div>

            <div className="win-score">
              Finished in <span>{moves}</span> moves
              {bestScore === moves && ' 🏆 New Best!'}
            </div>

            <button
              className="btn-primary"
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                  await axios.post(
                    'http://localhost:5000/api/completed-challenges',
                    { challengeId: location.state?.challenge?.id },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  navigate('/challenges');
                } catch (error) {
                  console.error('Error:', error);
                }
              }}
            >
              Complete Challenge 🚀
            </button>

            <button className="btn-secondary" onClick={initializeGame}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MemoryFlipGame;