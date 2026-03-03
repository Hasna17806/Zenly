import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const BlinkBreakGame = () => {
  const [timer, setTimer] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const handleBlink = () => {
    if (isActive) {
      setBlinkCount(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Blink Break</h1>

          {!isActive && timer === 30 && (
            <button
              onClick={() => setIsActive(true)}
              className="px-12 py-6 bg-blue-600 text-white rounded-2xl text-2xl"
            >
              Start
            </button>
          )}

          {isActive && timer > 0 && (
            <div className="space-y-8">
              <div className="text-6xl font-bold text-blue-600">{timer}s</div>
              <div className="text-2xl">Blinks: {blinkCount}</div>
              <button
                onClick={handleBlink}
                className="text-8xl hover:scale-110 transition-all"
              >
                👁️
              </button>
            </div>
          )}

          {timer === 0 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-green-600">Eyes refreshed! ✨</h2>
              <p className="text-xl">You blinked {blinkCount} times</p>
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

export default BlinkBreakGame;