import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const GuessSoundGame = () => {
  const [currentSound, setCurrentSound] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showInsight, setShowInsight] = useState(false);
  const audioRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const challenge = location.state?.challenge;

  const sounds = [
    {
      emoji: "📚",
      title: "Library Silence",
      options: [
        "Deep Focus Environment",
        "Creative Brainstorm Mode",
        "High Distraction Zone",
        "Stress Recovery Mode"
      ],
      correct: "Deep Focus Environment",
      insight:
        "Quiet environments help your brain hold attention longer during reading or problem-solving."
    },
    {
      emoji: "☕",
      title: "Cafe Background",
      options: [
        "Deep Sleep Mode",
        "Creative Brainstorm Mode",
        "Panic Study Mode",
        "Phone Addiction Zone"
      ],
      correct: "Creative Brainstorm Mode",
      insight:
        "Mild background noise can sometimes boost creative thinking more than total silence."
    },
    {
      emoji: "🌧️",
      title: "Rain Ambience",
      options: [
        "Stress Recovery Mode",
        "Exam Hall Pressure",
        "Social Energy Boost",
        "Distraction Trigger"
      ],
      correct: "Stress Recovery Mode",
      insight:
        "Calm natural sounds can reduce mental clutter and help you settle into study mode."
    },
    {
      emoji: "📱",
      title: "Notification Chaos",
      options: [
        "Motivation Booster",
        "Deep Focus Environment",
        "High Distraction Zone",
        "Memory Enhancement Mode"
      ],
      correct: "High Distraction Zone",
      insight:
        "Even small phone interruptions can break focus and make your brain restart attention."
    }
  ];

  const playSound = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2200);
  };

  const handleGuess = (option) => {
    if (showInsight) return;

    setSelectedOption(option);

    if (option === sounds[currentSound].correct) {
      setScore((prev) => prev + 1);
    }

    setShowInsight(true);

    setTimeout(() => {
      setSelectedOption(null);
      setShowInsight(false);

      if (currentSound < sounds.length - 1) {
        setCurrentSound((prev) => prev + 1);
      } else {
        setShowResult(true);
      }
    }, 2200);
  };

  const handleComplete = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        {
          challengeId: challenge?._id || challenge?.id,
          score,
          totalQuestions: sounds.length,
          accuracy: Math.round((score / sounds.length) * 100),
          gameType: "focus-sound-recognition"
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate("/challenges");
    } catch (error) {
      console.error("Error completing challenge:", error);
      alert(
        error.response?.data?.message || "Could not complete challenge"
      );
    }
  };

  const accuracy = Math.round((score / sounds.length) * 100);

  const finalMessage =
    accuracy >= 75
      ? "You’re becoming more aware of what helps and hurts your focus."
      : "Nice start — now you’ll notice your study environment more clearly.";

  if (!showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50 to-purple-50">
        <Navbar />

        <main className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-6 text-sm text-slate-500">
                <span>
                  Sound {currentSound + 1}/{sounds.length}
                </span>
                <span>Score: {score}</span>
              </div>

              <div className="text-center mb-8">
                <div className="inline-flex px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-5">
                  🎧 Study Focus Awareness
                </div>

                <div className="text-8xl mb-4 animate-pulse">
                  {sounds[currentSound].emoji}
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {sounds[currentSound].title}
                </h1>

                <p className="text-slate-600 max-w-xl mx-auto">
                  Listen to the clue and guess what kind of mental environment it creates.
                </p>

                <button
                  onClick={playSound}
                  disabled={isPlaying}
                  className="mt-6 px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 font-semibold shadow-lg"
                >
                  {isPlaying ? "🔊 Playing..." : "🔊 Play Sound Cue"}
                </button>

                {isPlaying && (
                  <div className="flex justify-center gap-2 mt-5">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-10 bg-indigo-500 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <h2 className="text-xl font-semibold mb-5 text-slate-900">
                What does this environment usually create?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sounds[currentSound].options.map((option) => {
                  const isCorrect = option === sounds[currentSound].correct;
                  const isSelected = selectedOption === option;

                  return (
                    <button
                      key={option}
                      onClick={() => handleGuess(option)}
                      disabled={showInsight}
                      className={`p-5 rounded-2xl text-left font-medium border transition-all duration-200 ${
                        showInsight
                          ? isCorrect
                            ? "bg-green-100 border-green-400 text-green-800"
                            : isSelected
                            ? "bg-red-100 border-red-400 text-red-700"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                          : "bg-slate-50 hover:bg-indigo-50 border-slate-200 hover:border-indigo-300 text-slate-800"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {showInsight && (
                <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                  <p className="text-sm uppercase tracking-wider text-indigo-500 font-semibold mb-2">
                    Focus Insight
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    {sounds[currentSound].insight}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50 to-purple-50">
      <Navbar />

      <main className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-slate-200 text-center">
            <div className="text-6xl mb-4">{accuracy >= 75 ? "🧠🎧" : "🎧✨"}</div>

            <h2 className="text-4xl font-bold text-slate-900 mb-3">
              Sound Challenge Complete
            </h2>

            <p className="text-xl text-slate-700 mb-2">
              Score: <span className="font-bold">{score}/{sounds.length}</span>
            </p>

            <p className="text-slate-600 max-w-xl mx-auto mb-8">
              {finalMessage}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-indigo-50 rounded-2xl p-5">
                <p className="text-sm text-slate-500 mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-indigo-700">{accuracy}%</p>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-5">
                <p className="text-sm text-slate-500 mb-1">Focus Awareness</p>
                <p className="text-3xl font-bold text-emerald-700">
                  {accuracy >= 75 ? "High" : accuracy >= 50 ? "Growing" : "Starting"}
                </p>
              </div>

              <div className="bg-orange-50 rounded-2xl p-5">
                <p className="text-sm text-slate-500 mb-1">Takeaway</p>
                <p className="text-lg font-bold text-orange-600">Environment Matters</p>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-3xl p-6 mb-8 text-left">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-2">
                What you learned
              </p>
              <ul className="space-y-2 text-slate-200">
                <li>• Your surroundings directly affect concentration.</li>
                <li>• Not every sound is bad — some help calm or creativity.</li>
                <li>• Notifications are one of the biggest focus killers.</li>
                <li>• Better study setup = better brain performance.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setCurrentSound(0);
                  setScore(0);
                  setShowResult(false);
                  setSelectedOption(null);
                  setShowInsight(false);
                }}
                className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-semibold"
              >
                Play Again
              </button>

              <button
                onClick={handleComplete}
                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 font-semibold"
              >
                Complete Challenge
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GuessSoundGame;