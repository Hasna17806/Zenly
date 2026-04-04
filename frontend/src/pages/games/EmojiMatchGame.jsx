import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const moodScenarios = [
  {
    id: 1,
    prompt: "You sit down to study, but suddenly everything feels too much and you keep avoiding starting.",
    options: ["Overwhelmed", "Excited", "Relieved", "Confident"],
    correct: "Overwhelmed",
    insight: "Avoidance is often overload, not laziness."
  },
  {
    id: 2,
    prompt: "You made one small mistake and now your mind keeps replaying it again and again.",
    options: ["Calm", "Overthinking", "Motivated", "Proud"],
    correct: "Overthinking",
    insight: "Repeating thoughts can drain energy more than the mistake itself."
  },
  {
    id: 3,
    prompt: "Your chest feels tight before opening your books, even though nothing bad has happened yet.",
    options: ["Anxious", "Happy", "Relaxed", "Curious"],
    correct: "Anxious",
    insight: "Anxiety often shows up before action, not after."
  },
  {
    id: 4,
    prompt: "You finished even a small task and suddenly feel lighter inside.",
    options: ["Relieved", "Ashamed", "Angry", "Numb"],
    correct: "Relieved",
    insight: "Completion creates emotional release, even in small doses."
  },
  {
    id: 5,
    prompt: "You want to do well, but you keep feeling like you're already behind everyone else.",
    options: ["Jealous", "Discouraged", "Energetic", "Playful"],
    correct: "Discouraged",
    insight: "Comparison can quietly weaken motivation."
  },
  {
    id: 6,
    prompt: "You’ve been working for a while, but your brain feels foggy and heavy.",
    options: ["Tired", "Focused", "Inspired", "Proud"],
    correct: "Tired",
    insight: "Mental fatigue often looks like lack of motivation."
  }
];

const MoodDecodeGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const challenge = location.state?.challenge;

  const shuffledQuestions = useMemo(() => {
    return [...moodScenarios]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [completed, setCompleted] = useState(false);

  const current = shuffledQuestions[currentIndex];
  const progress = ((currentIndex + (showFeedback ? 1 : 0)) / shuffledQuestions.length) * 100;

  const handleSelect = (option) => {
    if (showFeedback) return;
    setSelected(option);
  };

  const handleSubmit = () => {
    if (!selected) return;

    const isCorrect = selected === current.correct;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCorrectCount((prev) => prev + 1);
    }

    setAnswers((prev) => [
      ...prev,
      {
        question: current.prompt,
        selected,
        correct: current.correct,
        isCorrect
      }
    ]);

    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex === shuffledQuestions.length - 1) {
      setCompleted(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelected("");
    setShowFeedback(false);
  };

  const resetGame = () => {
    window.location.reload();
  };

  const completeChallenge = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        {
          challengeId: challenge?._id,
          score,
          total: shuffledQuestions.length,
          correctCount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/challenges");
    } catch (error) {
      console.error("Completion error:", error);
      navigate("/challenges");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <Navbar />

      <main className="py-20 px-6">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              ✦ Emotional Awareness
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-fuchsia-200 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              Mood Decode
            </h1>

            <p className="text-slate-400 mt-3 text-base md:text-lg">
              Notice what you feel before it controls you.
            </p>
          </div>

          {!completed ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10 backdrop-blur-xl">

              {/* Top stats */}
              <div className="flex justify-between items-center mb-6 text-sm text-slate-400">
                <span>Scenario {currentIndex + 1} / {shuffledQuestions.length}</span>
                <span>Insight Score: {score}</span>
              </div>

              {/* Progress */}
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Scenario */}
              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">
                  Situation
                </p>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xl md:text-2xl leading-relaxed text-white font-medium">
                    {current.prompt}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="grid gap-4 md:grid-cols-2 mb-8">
                {current.options.map((option) => {
                  const isChosen = selected === option;
                  const isCorrect = option === current.correct;

                  let classes =
                    "p-5 rounded-2xl border text-left transition-all duration-200";

                  if (showFeedback) {
                    if (isCorrect) {
                      classes += " border-emerald-400 bg-emerald-500/10 text-emerald-100";
                    } else if (isChosen) {
                      classes += " border-red-400 bg-red-500/10 text-red-100";
                    } else {
                      classes += " border-white/10 bg-white/5 text-slate-300";
                    }
                  } else {
                    classes += isChosen
                      ? " border-fuchsia-400 bg-fuchsia-500/10 text-white shadow-lg shadow-fuchsia-500/10"
                      : " border-white/10 bg-white/5 text-slate-200 hover:border-fuchsia-300/40 hover:bg-white/8";
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleSelect(option)}
                      className={classes}
                    >
                      <span className="text-lg font-semibold">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {showFeedback && (
                <div className="mb-8 p-5 rounded-2xl bg-cyan-500/10 border border-cyan-400/15">
                  <p className="text-cyan-300 text-xs uppercase tracking-[0.2em] mb-2">
                    Emotional Insight
                  </p>
                  <p className="text-lg text-white leading-relaxed">
                    {current.insight}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                {!showFeedback ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!selected}
                    className={`px-8 py-3 rounded-2xl font-semibold text-lg transition-all ${
                      selected
                        ? "bg-gradient-to-r from-fuchsia-600 via-violet-500 to-cyan-500 text-white hover:scale-[1.02] shadow-xl shadow-fuchsia-500/20"
                        : "bg-slate-700 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Decode Feeling →
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 rounded-2xl font-semibold text-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:scale-[1.02] transition-all shadow-xl shadow-violet-500/20"
                  >
                    {currentIndex === shuffledQuestions.length - 1 ? "See Results →" : "Next Scenario →"}
                  </button>
                )}

                <button
                  onClick={() => navigate("/challenges")}
                  className="px-6 py-3 bg-white/8 border border-white/10 rounded-2xl hover:bg-white/12 transition-all"
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-10 text-center backdrop-blur-xl">
              <div className="text-5xl mb-4">✨</div>

              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Mood Decode Complete
              </h2>

              <p className="text-slate-300 mb-6 text-lg">
                You recognized <span className="font-semibold text-white">{correctCount}</span> out of{" "}
                <span className="font-semibold text-white">{shuffledQuestions.length}</span> emotional patterns.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Insight Score</p>
                  <p className="text-2xl font-semibold">{score}</p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Awareness Level</p>
                  <p className="text-2xl font-semibold">
                    {correctCount >= 4 ? "Strong" : correctCount >= 2 ? "Growing" : "Beginning"}
                  </p>
                </div>
              </div>

              <div className="mb-8 p-5 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-400/15">
                <p className="text-fuchsia-100 italic text-lg">
                  “Naming a feeling is often the first step to calming it.”
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-white/8 border border-white/10 rounded-2xl hover:bg-white/12 transition-all"
                >
                  Play Again
                </button>

                <button
                  onClick={completeChallenge}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl font-semibold text-lg hover:scale-[1.02] transition-all shadow-xl shadow-emerald-500/20"
                >
                  Complete Challenge ✓
                </button>

                <button
                  onClick={() => navigate("/challenges")}
                  className="px-6 py-3 bg-slate-700/70 text-white rounded-2xl hover:bg-slate-600 transition-all"
                >
                  Back to Challenges
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MoodDecodeGame;