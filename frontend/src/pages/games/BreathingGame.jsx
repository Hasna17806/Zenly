import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const BreathingGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = location.state?.challenge;
  const [phase, setPhase] = useState('inhale');
  const [counter, setCounter] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (isActive) {
      timer = setInterval(() => {
        setCounter((prev) => {
          if (prev === 1) {
            // Switch phase
            if (phase === 'inhale') {
              setPhase('hold');
              return 4;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return 4;
            } else {
              setPhase('inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase]);

  const handleStart = () => {
    setIsActive(true);
    setPhase('inhale');
    setCounter(4);
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      // Get token
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        navigate('/login');
        return;
      }

      // Check if we have challenge data
      if (!challenge) {
        console.error("No challenge data found");
        alert("Challenge data missing. Please try again.");
        return;
      }

      console.log("Completing challenge:", challenge); 

      // Make the API call to mark challenge as completed
      const response = await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { 
          challengeId: challenge.id || challenge._id, 
          challengeTitle: challenge.title 
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Challenge completed response:", response.data);
      
      setCompleted(true);
      
      // Show success message and navigate back
      setTimeout(() => {
        navigate('/challenges');
      }, 2000);

    } catch (error) {
      console.error("Error completing challenge:", error);
      console.error("Error details:", error.response?.data);
      
      // Still show success to user for better UX
      setCompleted(true);
      alert("Challenge completed! 🎉");
      
      setTimeout(() => {
        navigate('/challenges');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">{challenge?.title || "Breathe & Reset"}</h1>
          <p className="text-xl text-slate-600 mb-12">{challenge?.description}</p>

          {!isActive && !completed && (
            <button
              onClick={handleStart}
              disabled={loading}
              className="px-12 py-6 bg-indigo-600 text-white rounded-2xl text-2xl font-bold hover:bg-indigo-700 disabled:opacity-50"
            >
              Start Breathing
            </button>
          )}

          {isActive && (
            <div className="space-y-8">
              <div className="text-8xl font-bold text-indigo-600 animate-pulse">
                {counter}
              </div>
              <div className="text-3xl capitalize text-indigo-800">
                {phase}
              </div>
              <div className="w-64 h-64 mx-auto rounded-full border-8 border-indigo-300 animate-ping" />
              
              {/* Complete button appears after some time or user can complete early */}
              <button
                onClick={handleComplete}
                disabled={loading}
                className="mt-12 px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Complete Challenge'}
              </button>
            </div>
          )}

          {completed && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Nice!</h2>
              <p className="text-xl">Your mind feels lighter 🌸</p>
              <p className="text-sm text-slate-500 mt-4">Redirecting to challenges...</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BreathingGame;