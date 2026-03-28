import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const TimerGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = location.state?.challenge;
  const [timer, setTimer] = useState(300); 
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (challenge?.time) {
      const minutes = parseInt(challenge.time);
      if (!isNaN(minutes)) {
        setTimer(minutes * 60);
      }
    }
  }, [challenge]);

  useEffect(() => {
    let interval;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCompleted(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">{challenge?.title || "Timer Challenge"}</h1>
          <p className="text-xl mb-12">{challenge?.description}</p>

          {!isActive && !completed && (
            <button
              onClick={() => setIsActive(true)}
              className="px-12 py-6 bg-indigo-600 text-white rounded-2xl text-2xl"
            >
              Start Timer
            </button>
          )}

          {isActive && (
            <div className="space-y-8">
              <div className="text-8xl font-bold text-indigo-600">
                {formatTime()}
              </div>
              <button
                onClick={() => setIsActive(false)}
                className="px-6 py-3 bg-red-500 text-white rounded-xl"
              >
                Pause
              </button>
            </div>
          )}

          {completed && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-green-600">Time's up! 🎉</h2>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                    await axios.post(
                      "http://localhost:5000/api/completed-challenges",
                      { challengeId: challenge?.id },
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

export default TimerGame;