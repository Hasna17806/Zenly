import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const TapStarGame = () => {
  const [stars, setStars] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (gameActive) {
      const interval = setInterval(() => {
        setStars(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: Math.random() * 90,
            y: Math.random() * 90,
          }
        ]);
      }, 500);

      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
        clearInterval(timer);
      };
    }
  }, [gameActive]);

  const handleTap = (id) => {
    setStars(prev => prev.filter(s => s.id !== id));
    setScore(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">Tap the Star</h1>
          
          <div className="flex justify-between mb-8 text-2xl">
            <span>⭐ {score}</span>
            <span>⏱️ {timeLeft}s</span>
          </div>

          {!gameActive && timeLeft === 30 && (
            <button
              onClick={() => setGameActive(true)}
              className="block mx-auto px-12 py-6 bg-yellow-500 text-white rounded-2xl text-2xl"
            >
              Start Game
            </button>
          )}

          {gameActive && (
            <div className="relative h-[500px] bg-indigo-100 rounded-3xl overflow-hidden">
              {stars.map(star => (
                <button
                  key={star.id}
                  onClick={() => handleTap(star.id)}
                  className="absolute text-4xl hover:scale-125 transition-all"
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
          )}

          {!gameActive && timeLeft === 0 && (
            <div className="text-center mt-8">
              <h2 className="text-3xl mb-4">You tapped {score} stars!</h2>
              <button
                onClick={async () => {
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
                }}
                className="px-8 py-4 bg-green-600 text-white rounded-xl"
              >
                Complete Challenge
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TapStarGame;