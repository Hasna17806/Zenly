import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const SixtySecondBreathGame = () => {
  const [timer, setTimer] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('inhale');
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
        setPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale');
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-teal-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">60-Second Breath</h1>

          {!isActive && timer === 60 && (
            <button
              onClick={() => setIsActive(true)}
              className="px-12 py-6 bg-green-600 text-white rounded-2xl text-2xl"
            >
              Start Breathing
            </button>
          )}

          {isActive && timer > 0 && (
            <div className="space-y-8">
              <div className="text-6xl font-bold text-green-600">{timer}s</div>
              <div className="text-3xl capitalize text-green-800">{phase}</div>
              <div className="w-48 h-48 mx-auto rounded-full bg-green-300 animate-pulse" />
            </div>
          )}

          {timer === 0 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-green-600">Well done! 🌸</h2>
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

export default SixtySecondBreathGame;