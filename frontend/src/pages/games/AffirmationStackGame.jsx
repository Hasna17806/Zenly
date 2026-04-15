import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const AFFIRMATIONS = [
  "I am enough",
  "I deserve peace",
  "I grow every day",
  "I am resilient",
  "I choose joy",
  "I am capable",
  "I am worthy of love",
  "I trust myself",
];

const AffirmationStackGame = () => {
  const navigate = useNavigate();
  const [stack, setStack] = useState([]);
  const [currentAffirmation, setCurrentAffirmation] = useState("");
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    pickNewAffirmation();
  }, []);

  const pickNewAffirmation = () => {
    const remaining = AFFIRMATIONS.filter(a => !stack.includes(a));
    if (remaining.length === 0) {
      setMessage("🎉 You've collected all affirmations! 🎉");
      return;
    }
    setCurrentAffirmation(remaining[Math.floor(Math.random() * remaining.length)]);
  };

  const addToStack = () => {
    if (stack.includes(currentAffirmation)) {
      setMessage("You already have this one! Try another.");
      return;
    }
    
    setStack(prev => [...prev, currentAffirmation]);
    setScore(prev => prev + 10);
    setMessage(`✨ "${currentAffirmation}" added to your stack ✨`);
    
    if (stack.length + 1 === AFFIRMATIONS.length) {
      setMessage("🎉 Amazing! You've built a full stack of self-belief! 🎉");
    }
    
    pickNewAffirmation();
  };

  const skipAffirmation = () => {
    pickNewAffirmation();
    setMessage("Looking for a better fit...");
  };

  return (
    <>
      <style>{`
        .as-stack {
          display: flex;
          flex-direction: column-reverse;
          align-items: center;
          margin: 2rem 0;
          min-height: 300px;
        }
        .as-stack-item {
          background: linear-gradient(135deg, rgba(167,139,250,0.2), rgba(94,234,212,0.1));
          border: 1px solid rgba(167,139,250,0.3);
          border-radius: 12px;
          padding: 0.8rem 1.5rem;
          margin: 0.2rem 0;
          animation: slideUp 0.3s ease;
          color: white;
          font-family: 'DM Serif Display', serif;
        }
        .as-current-card {
          background: rgba(94,234,212,0.15);
          border: 2px solid #5eead4;
          border-radius: 24px;
          padding: 2rem;
          margin: 1rem 0;
          text-align: center;
        }
        .as-current-text {
          font-size: 1.8rem;
          font-family: 'DM Serif Display', serif;
          color: #5eead4;
        }
        .as-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1rem;
        }
        .as-add-btn {
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          border: none;
          color: white;
          padding: 0.8rem 1.5rem;
          border-radius: 999px;
          cursor: pointer;
        }
        .as-skip-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: #a78bfa;
          padding: 0.8rem 1.5rem;
          border-radius: 999px;
          cursor: pointer;
        }
        .as-message {
          margin-top: 1rem;
          color: #5eead4;
          font-style: italic;
          animation: fadeInOut 2s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      
      <div className="ct-root">
        <Navbar />
        <main className="ct-main">
          <div className="ct-wrap">
            <div className="ct-badge">✦ Affirmation Building</div>
            <h1 className="ct-title">Affirmation Stack</h1>
            <p className="ct-sub">Collect the beliefs that lift you up</p>
            
            <div className="ct-top-row">
              <div className="ct-stat">
                <div className="ct-stat-value">{score}</div>
                <div className="ct-stat-label">Points</div>
              </div>
              <div className="ct-stat">
                <div className="ct-stat-value">{stack.length}</div>
                <div className="ct-stat-label">Collected</div>
              </div>
            </div>
            
            <div className="as-stack">
              {stack.slice(-5).map((aff, i) => (
                <div key={i} className="as-stack-item">"{aff}"</div>
              ))}
              {stack.length === 0 && (
                <div className="as-stack-item" style={{ opacity: 0.5 }}>Your stack is empty — add affirmations!</div>
              )}
            </div>
            
            <div className="as-current-card">
              <div className="as-current-text">"{currentAffirmation}"</div>
              <div className="as-buttons">
                <button className="as-add-btn" onClick={addToStack}>➕ Add to Stack</button>
                <button className="as-skip-btn" onClick={skipAffirmation}>Skip</button>
              </div>
            </div>
            
            {message && <div className="as-message">{message}</div>}
            
            {stack.length === AFFIRMATIONS.length && (
              <div className="ct-overlay">
                <div className="ct-modal">
                  <span className="ct-modal-icon">🏆</span>
                  <h3 className="ct-modal-title">Your affirmation stack is complete!</h3>
                  <p className="ct-modal-sub">You've collected all {AFFIRMATIONS.length} beliefs</p>
                  <button className="ct-btn-ghost" onClick={() => window.location.reload()}>Play Again</button>
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

export default AffirmationStackGame;