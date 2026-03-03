import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const FocusSprintGame = () => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setCompleted(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Focus Sprint</h1>
          <p className="text-xl mb-12">Stay focused. You got this 💪</p>

          {!isActive && !completed && (
            <button
              onClick={() => setIsActive(true)}
              className="px-12 py-6 bg-green-500 text-white rounded-2xl text-2xl"
            >
              Start Focus
            </button>
          )}

          {isActive && (
            <div className="space-y-8">
              <div className="text-8xl font-bold text-green-400">
                {formatTime()}
              </div>
              <p className="text-2xl">Stay focused...</p>
              <button
                onClick={() => setIsActive(false)}
                className="px-6 py-3 bg-red-500 text-white rounded-xl"
              >
                Stop Early
              </button>
            </div>
          )}

          {completed && (
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-green-400">🎉 Deep work done!</h2>
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

export default FocusSprintGame;