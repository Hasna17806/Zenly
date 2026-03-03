import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const SpinWheelGame = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const navigate = useNavigate();

  const surprises = [
    "Take a sip of water 💧",
    "Stretch your arms 🧘",
    "Take a deep breath 🌬️",
    "Smile for 5 seconds 😊",
    "Look away from screen 👀",
    "Drink some water 💧"
  ];

  const spinWheel = () => {
    setSpinning(true);
    const spins = 5 + Math.floor(Math.random() * 5);
    const newRotation = rotation + (spins * 360) + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      const index = Math.floor(Math.random() * surprises.length);
      setResult(surprises[index]);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Spin & Smile</h1>

          <div className="relative w-64 h-64 mx-auto mb-12">
            <div
              className="w-full h-full rounded-full border-8 border-purple-400 transition-transform duration-3000"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 3s ease-out' : 'none'
              }}
            >
              {surprises.map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-16 bg-purple-600 origin-bottom"
                  style={{
                    left: 'calc(50% - 4px)',
                    top: '0',
                    transform: `rotate(${i * 60}deg)`
                  }}
                />
              ))}
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              🎯
            </div>
          </div>

          {!spinning && !result && (
            <button
              onClick={spinWheel}
              className="px-12 py-6 bg-purple-600 text-white rounded-2xl text-2xl"
            >
              Spin Wheel
            </button>
          )}

          {result && (
            <div className="space-y-6">
              <p className="text-2xl p-6 bg-white rounded-2xl">{result}</p>
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

export default SpinWheelGame;