import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const DistractionBlockGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = location.state?.challenge;
  
  const [step, setStep] = useState('choose'); // 'choose', 'focus', 'complete'
  const [selectedDistraction, setSelectedDistraction] = useState(null);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [showTip, setShowTip] = useState(false);

  const distractions = [
    { 
      id: 'phone', 
      name: '📱 Phone', 
      description: 'Put your phone face down and on silent',
      tip: 'Out of sight, out of mind!'
    },
    { 
      id: 'social', 
      name: '📺 Social Media', 
      description: 'Close all social media tabs',
      tip: 'Social media can wait 5 minutes'
    },
    { 
      id: 'games', 
      name: '🎮 Games', 
      description: 'No gaming during focus time',
      tip: 'Games will be more fun after!'
    },
    { 
      id: 'chatting', 
      name: '💬 Chatting', 
      description: 'Let friends know you\'re focusing',
      tip: 'Set a status to "Focusing"'
    },
    { 
      id: 'music', 
      name: '🎵 Music with Lyrics', 
      description: 'Switch to instrumental music',
      tip: 'Lo-fi or classical works best'
    },
    { 
      id: 'browser', 
      name: '🌐 Random Browsing', 
      description: 'Close unnecessary tabs',
      tip: 'Stay on task!'
    }
  ];

  const focusQuotes = [
    "🧘 Your focus is your superpower",
    "⚡ One task at a time",
    "🎯 You're building discipline",
    "💪 This gets easier with practice",
    "🌟 5 minutes of focus = progress",
    "🌀 Distractions fade, focus stays"
  ];

  useEffect(() => {
    let interval;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setStep('complete');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDistractionSelect = (distraction) => {
    setSelectedDistraction(distraction);
  };

  const handleStartFocus = () => {
    if (selectedDistraction) {
      setStep('focus');
      setIsActive(true);
      setTimer(300);
    }
  };

  const handleInterruption = () => {
    setInterruptions(prev => prev + 1);
    setShowTip(true);
    setTimeout(() => setShowTip(false), 3000);
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { 
          challengeId: challenge?.id || 'distraction-block',
          challengeTitle: challenge?.title || 'Distraction Block'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/challenges');
    } catch (error) {
      console.error("Error:", error);
      // Still navigate back even if API fails
      navigate('/challenges');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-900 mb-2">Distraction Block</h1>
            <p className="text-slate-600">Choose one distraction to avoid for 5 minutes</p>
          </div>

          {/* Step 1: Choose Distraction */}
          {step === 'choose' && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold mb-6">What's your biggest distraction?</h2>
              
              <div className="space-y-3 mb-8">
                {distractions.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleDistractionSelect(d)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      selectedDistraction?.id === d.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{d.name}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 ml-2">{d.description}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={handleStartFocus}
                disabled={!selectedDistraction}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  selectedDistraction
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                Start 5-Minute Focus
              </button>

              {selectedDistraction && (
                <p className="text-sm text-green-600 mt-4 text-center">
                  💡 {selectedDistraction.tip}
                </p>
              )}
            </div>
          )}

          {/* Step 2: Focus Mode */}
          {step === 'focus' && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              {/* Timer */}
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-indigo-600 mb-2">
                  {formatTime()}
                </div>
                <p className="text-slate-600">
                  Avoiding: <span className="font-semibold">{selectedDistraction?.name}</span>
                </p>
              </div>

              {/* Focus Quote */}
              <div className="bg-indigo-50 p-6 rounded-xl mb-8 text-center">
                <p className="text-lg text-indigo-800">
                  {focusQuotes[Math.floor(Math.random() * focusQuotes.length)]}
                </p>
              </div>

              {/* Interruption Button */}
              <div className="text-center mb-6">
                <button
                  onClick={handleInterruption}
                  className="px-6 py-3 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-all"
                >
                  😅 I Got Distracted
                </button>
              </div>

              {/* Tip Popup */}
              {showTip && (
                <div className="bg-green-100 p-4 rounded-xl text-green-700 text-center animate-fade-in">
                  That's okay! Just refocus. You've got this! 💪
                </div>
              )}

              {/* Stats */}
              <div className="flex justify-between text-sm text-slate-500 mt-6 pt-6 border-t">
                <span>Interruptions: {interruptions}</span>
                <span>Focus Streak: {interruptions === 0 ? '🔥 Perfect' : '🔄 Keep going'}</span>
              </div>

              {/* Pause Button */}
              <button
                onClick={() => setIsActive(!isActive)}
                className="mt-4 text-sm text-slate-500 hover:text-slate-700"
              >
                {isActive ? '⏸️ Pause' : '▶️ Resume'}
              </button>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 'complete' && (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">Great Job!</h2>
              <p className="text-xl mb-4">You focused for 5 minutes</p>
              
              <div className="bg-indigo-50 p-4 rounded-xl mb-8">
                <p className="text-indigo-800">
                  Interruptions resisted: {interruptions}
                </p>
                {interruptions === 0 && (
                  <p className="text-sm text-green-600 mt-2">✨ Perfect focus session!</p>
                )}
              </div>

              <p className="text-slate-600 mb-8">
                {interruptions === 0 
                  ? "You're a focus master! 🏆" 
                  : "Every minute of focus counts. Keep practicing!"}
              </p>

              <button
                onClick={handleComplete}
                className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
              >
                Complete Challenge
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DistractionBlockGame;