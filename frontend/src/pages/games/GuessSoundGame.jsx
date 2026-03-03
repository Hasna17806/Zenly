import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const GuessSoundGame = () => {
  const [currentSound, setCurrentSound] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const sounds = [
    { 
      emoji: "🎹", 
      name: "Piano",
      options: ["Piano", "Guitar", "Drums", "Violin"], 
      correct: "Piano",
      funFact: "The piano has 88 keys!"
    },
    { 
      emoji: "🌧️", 
      name: "Rain",
      options: ["Rain", "Ocean", "Wind", "Thunder"], 
      correct: "Rain",
      funFact: "Rain sounds can help you sleep better!"
    },
    { 
      emoji: "☕", 
      name: "Coffee Shop",
      options: ["Coffee Shop", "Library", "Restaurant", "Park"], 
      correct: "Coffee Shop",
      funFact: "Background cafe noise can boost creativity!"
    },
    { 
      emoji: "🐦", 
      name: "Birds",
      options: ["Birds", "Crickets", "Frogs", "Cats"], 
      correct: "Birds",
      funFact: "Some birds learn new songs throughout their lives!"
    }
  ];

  // Simulated sound playback (in real app, you'd use actual audio files)
  const playSound = () => {
    setIsPlaying(true);
    // Simulate sound playing for 2 seconds
    setTimeout(() => setIsPlaying(false), 2000);
    
    // In production, you'd do:
    // if (audioRef.current) {
    //   audioRef.current.play();
    // }
  };

  const handleGuess = (option) => {
    if (option === sounds[currentSound].correct) {
      setScore(score + 1);
    }
    
    if (currentSound < sounds.length - 1) {
      setCurrentSound(currentSound + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleComplete = async () => {
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

  if (!showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
        <Navbar />
        <main className="py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-xl">
              <div className="flex justify-between mb-6">
                <span className="text-sm text-slate-500">Sound {currentSound + 1}/4</span>
                <span className="text-sm text-slate-500">Score: {score}</span>
              </div>
              
              <div className="text-center mb-8">
                <div className="text-8xl mb-4 animate-pulse">{sounds[currentSound].emoji}</div>
                
                <button
                  onClick={playSound}
                  disabled={isPlaying}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 mb-4"
                >
                  {isPlaying ? '🔊 Playing...' : '🔊 Play Sound'}
                </button>

                {isPlaying && (
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-8 bg-indigo-600 rounded-full animate-sound-wave"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <h2 className="text-xl font-semibold mb-4">What sound is this?</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {sounds[currentSound].options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleGuess(option)}
                    className="p-4 bg-slate-50 rounded-xl text-lg font-medium hover:bg-indigo-100 transition-all"
                  >
                    {option}
                  </button>
                ))}
              </div>

              <p className="mt-6 text-sm text-slate-400 italic">
                Fun fact: {sounds[currentSound].funFact}
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-12 rounded-3xl shadow-xl text-center">
            <h2 className="text-3xl font-bold mb-4">Game Complete!</h2>
            <div className="text-6xl mb-4">{score >= 3 ? '🎧✨' : '👂'}</div>
            <p className="text-2xl mb-2">Score: {score}/4</p>
            <p className="text-slate-600 mb-8">
              {score === 4 ? "Perfect pitch! You have amazing ears!" :
               score === 3 ? "Great job! You're a sound master!" :
               "Good try! Your ears will get better!"}
            </p>
            <button
              onClick={handleComplete}
              className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700"
            >
              Complete Challenge & Earn Points
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GuessSoundGame;