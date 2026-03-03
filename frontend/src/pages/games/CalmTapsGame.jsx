import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const CalmTapsGame = () => {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const navigate = useNavigate();

  // Relaxing quotes that appear after bubbles pop
  const quotes = [
    "🌸 Just breathe...",
    "💭 This moment is yours",
    "🌊 Let it go...",
    "✨ You're doing great",
    "🍃 Peace begins with you",
    "💫 Be kind to your mind",
    "🌙 Rest is productive too",
    "🎵 Listen to the silence"
  ];

  useEffect(() => {
    if (gameActive) {
      // Create bubbles at random intervals
      const bubbleInterval = setInterval(() => {
        createBubble();
      }, 800);

      // Clean up bubbles that last too long
      const cleanupInterval = setInterval(() => {
        setBubbles(prev => prev.filter(bubble => {
          // Remove bubbles older than 5 seconds
          if (Date.now() - bubble.createdAt > 5000) {
            // Gently fade away without penalty
            return false;
          }
          return true;
        }));
      }, 1000);

      return () => {
        clearInterval(bubbleInterval);
        clearInterval(cleanupInterval);
      };
    }
  }, [gameActive]);

  const createBubble = () => {
    const newBubble = {
      id: Date.now() + Math.random(),
      x: Math.random() * 85 + 5, // Keep bubbles away from edges
      y: Math.random() * 85 + 5,
      size: Math.random() * 50 + 30, // Random size between 30-80px
      speed: Math.random() * 0.5 + 0.2, // Floating speed
      createdAt: Date.now(),
      opacity: 0.9,
      color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, 255, 0.7)`
    };
    setBubbles(prev => [...prev, newBubble]);
  };

  const handleTap = (id) => {
    // Gentle "pop" sound effect simulation
    const pop = new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoAAACAgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgIAAAAD//w==');
    pop.volume = 0.2;
    pop.play().catch(() => {}); // Ignore autoplay restrictions

    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(prev => prev + 1);
    setBreathCount(prev => prev + 1);

    // Show encouraging message every 5 taps
    if ((score + 1) % 5 === 0) {
      setShowQuote(true);
      setTimeout(() => setShowQuote(false), 2000);
    }
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setBreathCount(0);
    setBubbles([]);
  };

  const endGame = () => {
    setGameActive(false);
    setBubbles([]);
  };

  const completeChallenge = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { challengeId: location.state?.challenge?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/challenges');
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
      <Navbar />
      
      {/* Background floating animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <main className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center text-white mb-8">
            <h1 className="text-4xl font-bold mb-2">Calm Taps</h1>
            <p className="text-xl text-blue-200">Tap floating bubbles to relax</p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-center text-white">
              <div className="text-3xl font-bold">{score}</div>
              <div className="text-sm text-blue-200">Bubbles Popped</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-center text-white">
              <div className="text-3xl font-bold">{breathCount}</div>
              <div className="text-sm text-blue-200">Deep Breaths</div>
            </div>
          </div>

          {/* Motivational Quote */}
          {showQuote && (
            <div className="text-center mb-8 animate-fade-in">
              <p className="text-2xl text-white font-light italic">
                {quotes[Math.floor(Math.random() * quotes.length)]}
              </p>
            </div>
          )}

          {/* Game Area */}
          <div className="relative bg-gradient-to-b from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-3xl p-4 mb-8" 
               style={{ minHeight: '500px' }}>
            
            {/* Instructions overlay when game not active */}
            {!gameActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm rounded-3xl z-10">
                <div className="text-white text-center p-8">
                  <div className="text-8xl mb-6 animate-float">💭</div>
                  <h2 className="text-3xl font-bold mb-4">Ready to relax?</h2>
                  <p className="text-xl mb-8 text-blue-200">Tap bubbles mindfully. Let each pop be a deep breath.</p>
                  <button
                    onClick={startGame}
                    className="px-12 py-6 bg-white text-indigo-900 rounded-2xl text-2xl font-bold hover:bg-blue-100 transition-all transform hover:scale-105 shadow-2xl"
                  >
                    Begin 🌊
                  </button>
                </div>
              </div>
            )}

            {/* Bubbles container */}
            <div className="relative w-full h-[500px] overflow-hidden rounded-2xl">
              {bubbles.map(bubble => (
                <button
                  key={bubble.id}
                  onClick={() => handleTap(bubble.id)}
                  className="absolute rounded-full transition-all duration-300 hover:scale-110 focus:outline-none group"
                  style={{
                    left: `${bubble.x}%`,
                    top: `${bubble.y}%`,
                    width: bubble.size,
                    height: bubble.size,
                    background: `radial-gradient(circle at 30% 30%, white, ${bubble.color})`,
                    boxShadow: '0 0 20px rgba(255,255,255,0.3)',
                    animation: `float ${3 + bubble.speed}s ease-in-out infinite`,
                    transform: `translate(-50%, -50%)`
                  }}
                >
                  {/* Inner glow */}
                  <div className="absolute inset-2 rounded-full bg-white/20 blur-sm"></div>
                  
                  {/* Reflection */}
                  <div className="absolute top-2 left-2 w-3 h-3 bg-white/40 rounded-full"></div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white/10"></div>
                </button>
              ))}

              {/* Ambient particles */}
              {gameActive && bubbles.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/50 text-xl animate-pulse">
                    ✨ Bubbles will appear soon... ✨
                  </p>
                </div>
              )}
            </div>

            {/* Game controls */}
            {gameActive && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                <button
                  onClick={endGame}
                  className="px-6 py-3 bg-white/20 backdrop-blur-lg text-white rounded-xl hover:bg-white/30 transition-all"
                >
                  End Session
                </button>
              </div>
            )}
          </div>

          {/* Complete Challenge Button - appears after popping some bubbles */}
          {score >= 10 && (
            <div className="text-center animate-fade-in-up">
              <button
                onClick={completeChallenge}
                className="px-12 py-5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl font-bold text-xl hover:from-green-500 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-2xl"
              >
                ✨ Complete Challenge ✨
              </button>
              <p className="text-white/70 mt-4 text-sm">
                You've popped {score} bubbles. Feel more relaxed? 🌸
              </p>
            </div>
          )}

          {/* Relaxation tips */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-white/80 text-sm">
            <div className="bg-white/5 backdrop-blur rounded-xl p-4">
              <span className="text-2xl mb-2 block">🎯</span>
              Tap bubbles gently
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-4">
              <span className="text-2xl mb-2 block">🌬️</span>
              Breathe with each pop
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-4">
              <span className="text-2xl mb-2 block">💫</span>
              No rush, just relax
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CalmTapsGame;