import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import GameControls from "../../components/GameControls";
import axios from "axios";

const BREATH_PHASES = [
  { name: "Breathe In", duration: 4000, instruction: "Slowly fill your lungs...", action: "inhale" },
  { name: "Hold", duration: 4000, instruction: "Gently hold...", action: "hold" },
  { name: "Breathe Out", duration: 6000, instruction: "Softly release...", action: "exhale" },
  { name: "Hold", duration: 2000, instruction: "Rest here...", action: "hold" },
];

const BreathBubbleGame = () => {
  const navigate = useNavigate();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showStop, setShowStop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bubbleScale, setBubbleScale] = useState(1);
  
  const intervalRef = useRef(null);
  const currentPhase = BREATH_PHASES[phaseIndex];

  useEffect(() => {
    if (!isActive) return;

    const startTime = Date.now();
    const duration = currentPhase.duration;
    
    const animateBubble = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (currentPhase.action === "inhale") {
        setBubbleScale(1 + progress * 0.6);
      } else if (currentPhase.action === "exhale") {
        setBubbleScale(1.6 - progress * 0.6);
      } else {
        setBubbleScale(currentPhase.action === "hold" ? 1.6 : 1);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animateBubble);
      }
    };
    
    requestAnimationFrame(animateBubble);
    
    const timeout = setTimeout(() => {
      const nextIndex = (phaseIndex + 1) % BREATH_PHASES.length;
      setPhaseIndex(nextIndex);
      
      if (nextIndex === 0) {
        setCyclesCompleted(prev => prev + 1);
      }
    }, duration);
    
    intervalRef.current = timeout;
    return () => clearTimeout(timeout);
  }, [phaseIndex, isActive, currentPhase]);

  const startBreathing = () => {
    setIsActive(true);
    setPhaseIndex(0);
    setCyclesCompleted(0);
    setBubbleScale(1);
  };

  const stopBreathing = () => {
    setIsActive(false);
    if (intervalRef.current) clearTimeout(intervalRef.current);
  };

  const completeSession = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { cyclesCompleted, duration: cyclesCompleted * 16 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowCompletion(true);
      setTimeout(() => navigate("/challenges"), 3000);
    } catch (err) {
      console.error(err);
      alert("Could not complete session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .bb-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          display: flex;
          flex-direction: column;
        }
        .bb-main {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 5rem 1.5rem;
        }
        .bb-container {
          text-align: center;
          max-width: 600px;
          width: 100%;
        }
        .bb-bubble {
          width: 200px;
          height: 200px;
          margin: 2rem auto;
          background: radial-gradient(circle at 30% 30%, rgba(94,234,212,0.3), rgba(167,139,250,0.2));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.05s linear;
          box-shadow: 0 0 60px rgba(94,234,212,0.3);
          border: 2px solid rgba(94,234,212,0.5);
        }
        .bb-bubble-inner {
          text-align: center;
          color: white;
        }
        .bb-phase-name {
          font-size: 2rem;
          font-weight: bold;
          font-family: 'DM Serif Display', serif;
          background: linear-gradient(135deg, #a78bfa, #5eead4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .bb-instruction {
          color: #a78bfa;
          margin-top: 0.5rem;
          font-size: 1rem;
        }
        .bb-cycles {
          margin-top: 2rem;
          color: #8d82b7;
          font-size: 0.9rem;
        }
        .bb-start-btn {
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 999px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          margin-top: 2rem;
          transition: transform 0.2s;
        }
        .bb-start-btn:hover {
          transform: scale(1.05);
        }
      `}</style>
      
      <div className="bb-root">
        <Navbar />
        <main className="bb-main">
          <div className="bb-container">
            <div className="ct-badge">✦ Breathwork</div>
            <h1 className="ct-title">Breath Bubble</h1>
            <p className="ct-sub">Follow the bubble's rhythm to calm your mind</p>
            
            {!isActive && cyclesCompleted === 0 ? (
              <button className="bb-start-btn" onClick={startBreathing}>
                Start Breathing 🌊
              </button>
            ) : (
              <>
                <div 
                  className="bb-bubble"
                  style={{ transform: `scale(${bubbleScale})` }}
                >
                  <div className="bb-bubble-inner">
                    <div className="bb-phase-name">{currentPhase.name}</div>
                    <div className="bb-instruction">{currentPhase.instruction}</div>
                  </div>
                </div>
                
                <div className="bb-cycles">
                  Cycles completed: {cyclesCompleted}
                </div>
                
                <GameControls
                  onComplete={completeSession}
                  onStop={() => setShowStop(true)}
                  onBack={() => navigate("/challenges")}
                />
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
      
      {/* Stop and completion modals - same as CalmTapsGame */}
      {showStop && (
        <div className="ct-overlay">
          <div className="ct-modal">
            <span className="ct-modal-icon">🌊</span>
            <h3 className="ct-modal-title">Leave your breath session?</h3>
            <div className="ct-modal-btns">
              <button className="ct-btn-ghost" onClick={() => setShowStop(false)}>Stay</button>
              <button className="ct-btn-danger" onClick={stopBreathing}>Leave</button>
            </div>
          </div>
        </div>
      )}
      
      {showCompletion && (
        <div className="ct-overlay">
          <div className="ct-modal">
            <span className="ct-modal-icon">✨</span>
            <h3 className="ct-modal-title">You found your center</h3>
            <p className="ct-modal-sub">{cyclesCompleted} cycles of peaceful breathing</p>
          </div>
        </div>
      )}
    </>
  );
};

export default BreathBubbleGame;