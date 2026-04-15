// MindfulMatchGame.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const CARDS = [
  { id: 1, type: "emotion", text: "Anxiety", matchId: "a" },
  { id: 2, type: "skill", text: "Box Breathing", matchId: "a" },
  { id: 3, type: "emotion", text: "Sadness", matchId: "b" },
  { id: 4, type: "skill", text: "Journaling", matchId: "b" },
  { id: 5, type: "emotion", text: "Anger", matchId: "c" },
  { id: 6, type: "skill", text: "Walk Away", matchId: "c" },
  { id: 7, type: "emotion", text: "Overwhelm", matchId: "d" },
  { id: 8, type: "skill", text: "One Thing at a Time", matchId: "d" },
];

const MindfulMatchGame = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    shuffleCards();
  }, []);

  const shuffleCards = () => {
    const shuffled = [...CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameComplete(false);
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2) return;
    if (flipped.includes(index)) return;
    if (matched.includes(cards[index].id)) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const card1 = cards[newFlipped[0]];
      const card2 = cards[newFlipped[1]];
      
      if (card1.matchId === card2.matchId) {
        setMatched(prev => [...prev, card1.id, card2.id]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  useEffect(() => {
    if (matched.length === CARDS.length) {
      setGameComplete(true);
    }
  }, [matched]);

  return (
    <>
      <style>{`
        .mm-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin: 2rem 0;
        }
        .mm-card {
          aspect-ratio: 1;
          background: rgba(167,139,250,0.1);
          border: 1px solid rgba(167,139,250,0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.9rem;
          text-align: center;
          padding: 1rem;
          color: white;
        }
        .mm-card.flipped {
          background: rgba(94,234,212,0.2);
          border-color: #5eead4;
          transform: scale(0.98);
        }
        .mm-card.matched {
          opacity: 0.5;
          cursor: default;
          background: rgba(94,234,212,0.1);
        }
        .mm-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          color: #a78bfa;
        }
      `}</style>
      
      <div className="ct-root">
        <Navbar />
        <main className="ct-main">
          <div className="ct-wrap">
            <div className="ct-badge">✦ Mindful Learning</div>
            <h1 className="ct-title">Mindful Match</h1>
            <p className="ct-sub">Match each emotion with its coping skill</p>
            
            <div className="mm-stats">
              <span>Moves: {moves}</span>
              <span>Matched: {matched.length / 2} / {CARDS.length / 2}</span>
              <button onClick={shuffleCards} style={{ background: 'none', border: 'none', color: '#5eead4', cursor: 'pointer' }}>
                🔄 Shuffle
              </button>
            </div>
            
            <div className="mm-grid">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className={`mm-card ${flipped.includes(index) ? 'flipped' : ''} ${matched.includes(card.id) ? 'matched' : ''}`}
                  onClick={() => handleCardClick(index)}
                >
                  {flipped.includes(index) || matched.includes(card.id) ? card.text : "?"}
                </div>
              ))}
            </div>
            
            {gameComplete && (
              <div className="ct-overlay">
                <div className="ct-modal">
                  <span className="ct-modal-icon">🎯</span>
                  <h3 className="ct-modal-title">You matched them all!</h3>
                  <p className="ct-modal-sub">in {moves} moves</p>
                  <button className="ct-btn-ghost" onClick={shuffleCards}>Play Again</button>
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

export default MindfulMatchGame;