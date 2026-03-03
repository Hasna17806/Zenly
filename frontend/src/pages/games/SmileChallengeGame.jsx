import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const SmileChallengeGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timer, setTimer] = useState(20);
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let interval;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
      setCompleted(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const handleStart = () => {
    setIsActive(true);
    setTimer(20);
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { challengeId: location.state?.challenge?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTimeout(() => navigate('/challenges'), 2000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Smile Challenge</h1>
          <p className="text-xl mb-12">Hold a gentle smile 😊</p>

          {!isActive && !completed && (
            <button
              onClick={handleStart}
              className="px-12 py-6 bg-yellow-500 text-white rounded-2xl text-2xl"
            >
              Start Smiling
            </button>
          )}

          {isActive && (
            <div className="space-y-8">
              <div className="text-8xl animate-bounce">😊</div>
              <div className="text-6xl font-bold text-yellow-600">{timer}s</div>
              <p className="text-xl">Keep smiling!</p>
            </div>
          )}

          {completed && (
            <div className="space-y-8">
              <div className="text-8xl">✨😊✨</div>
              <h2 className="text-3xl font-bold text-green-600">Great job!</h2>
              <button
                onClick={handleComplete}
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

export default SmileChallengeGame;