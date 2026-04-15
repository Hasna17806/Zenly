import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import GameControls from "../../components/GameControls";

const GRATITUDE_ITEMS = [
  { emoji: "☀️", text: "Warm sunlight" },
  { emoji: "🌸", text: "A kind word" },
  { emoji: "💪", text: "Your strength" },
  { emoji: "🎵", text: "Favorite song" },
  { emoji: "📖", text: "A good book" },
  { emoji: "💝", text: "Someone who cares" },
  { emoji: "🌙", text: "Quiet night" },
  { emoji: "🍵", text: "Warm tea" },
];

const GratitudeCatchGame = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [fallingItems, setFallingItems] = useState([]);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showStop, setShowStop] = useState(false);
  
  const animationRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!gameActive) return;
    
    const spawnInterval = setInterval(() => {
      const newItem = {
        id: Date.now() + Math.random(),
        emoji: GRATITUDE_ITEMS[Math.floor(Math.random() * GRATITUDE_ITEMS.length)].emoji,
        text: GRATITUDE_ITEMS[Math.floor(Math.random() * GRATITUDE_ITEMS.length)].text,
        x: Math.random() * 80 + 10,
        y: 0,
      };
      setFallingItems(prev => [...prev, newItem]);
    }, 800);
    
    const moveItems = () => {
      setFallingItems(prev => 
        prev.map(item => ({ ...item, y: item.y + 2 }))
          .filter(item => item.y < 85)
      );
      animationRef.current = requestAnimationFrame(moveItems);
    };
    animationRef.current = requestAnimationFrame(moveItems);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(spawnInterval);
          cancelAnimationFrame(animationRef.current);
          setGameActive(false);
          setShowCompletion(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(spawnInterval);
      clearInterval(timer);
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameActive]);

  const catchItem = (id, emoji, text) => {
    setFallingItems(prev => prev.filter(item => item.id !== id));
    setScore(prev => prev + 1);
    
    // Show floating affirmation
    const affirmation = document.createElement('div');
    affirmation.textContent = `✨ Grateful for ${text} ✨`;
    affirmation.style.position = 'fixed';
    affirmation.style.bottom = '20%';
    affirmation.style.left = '50%';
    affirmation.style.transform = 'translateX(-50%)';
    affirmation.style.background = 'rgba(94,234,212,0.2)';
    affirmation.style.color = '#5eead4';
    affirmation.style.padding = '0.5rem 1rem';
    affirmation.style.borderRadius = '999px';
    affirmation.style.animation = 'affirmRise 2s ease-out forwards';
    document.body.appendChild(affirmation);
    setTimeout(() => affirmation.remove(), 2000);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setFallingItems([]);
    setGameActive(true);
  };

  return (
    <>
      <style>{`
        .gc-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a, #1e1b4b);
        }
        .gc-arena {
          position: relative;
          min-height: 500px;
          background: rgba(255,255,255,0.05);
          border-radius: 30px;
          overflow: hidden;
          cursor: pointer;
          margin: 1rem 0;
        }
        .gc-falling-item {
          position: absolute;
          background: rgba(167,139,250,0.2);
          border: 1px solid rgba(167,139,250,0.3);
          border-radius: 50%;
          padding: 1rem;
          cursor: pointer;
          transition: transform 0.1s;
          animation: float 0.3s ease-out;
        }
        .gc-falling-item:hover {
          transform: scale(1.1);
        }
        @keyframes float {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      
      <div className="gc-root">
        <Navbar />
        <main className="ct-main">
          <div className="ct-wrap">
            <div className="ct-badge">✦ Gratitude Practice</div>
            <h1 className="ct-title">Gratitude Catch</h1>
            <p className="ct-sub">Catch the blessings before they fall</p>
            
            {!gameActive && score === 0 ? (
              <button className="bb-start-btn" onClick={startGame}>
                Start Catching 🎁
              </button>
            ) : (
              <>
                <div className="ct-top-row">
                  <div className="ct-stat">
                    <div className="ct-stat-value">{score}</div>
                    <div className="ct-stat-label">Caught</div>
                  </div>
                  <div className="ct-stat">
                    <div className="ct-stat-value">{timeLeft}s</div>
                    <div className="ct-stat-label">Time</div>
                  </div>
                </div>
                
                <div 
                  className="gc-arena" 
                  ref={containerRef}
                  style={{ position: 'relative', height: '500px' }}
                >
                  {fallingItems.map(item => (
                    <div
                      key={item.id}
                      className="gc-falling-item"
                      onClick={() => catchItem(item.id, item.emoji, item.text)}
                      style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        position: 'absolute',
                        fontSize: '2rem',
                        textAlign: 'center',
                      }}
                    >
                      {item.emoji}
                    </div>
                  ))}
                </div>
                
                <GameControls
                  onComplete={() => setShowCompletion(true)}
                  onStop={() => setShowStop(true)}
                  onBack={() => navigate("/challenges")}
                />
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default GratitudeCatchGame;