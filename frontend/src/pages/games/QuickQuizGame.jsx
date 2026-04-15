import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const QuickQuizGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const challenge = location.state?.challenge;

  const [category, setCategory] = useState(null);
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [responseTimes, setResponseTimes] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    {
      id: "logic",
      name: "Logic Boost",
      icon: "🧠",
      color: "from-violet-500 to-fuchsia-500",
      description: "Wake up your reasoning skills"
    },
    {
      id: "math",
      name: "Mental Math",
      icon: "⚡",
      color: "from-emerald-500 to-teal-500",
      description: "Sharpen speed and accuracy"
    },
    {
      id: "focus",
      name: "Focus Recall",
      icon: "🎯",
      color: "from-blue-500 to-cyan-500",
      description: "Train concentration and memory"
    },
    {
      id: "pattern",
      name: "Pattern Hunt",
      icon: "🔍",
      color: "from-amber-500 to-orange-500",
      description: "Spot hidden logic quickly"
    }
  ];

  const questions = {
    logic: [
      {
        question: "If all roses are flowers and some flowers fade quickly, which statement must be true?",
        options: [
          "All roses fade quickly",
          "Some roses are flowers",
          "No flowers are roses",
          "All flowers are roses"
        ],
        correct: 1,
        explanation: "If all roses are flowers, then roses definitely belong to the flower group."
      },
      {
        question: "A clock shows 3:15. What is the angle between the hour and minute hands?",
        options: ["0°", "7.5°", "15°", "22.5°"],
        correct: 1,
        explanation: "At 3:15, the hour hand has moved slightly past 3, creating a 7.5° difference."
      },
      {
        question: "If CAT = 24, BAT = 23, then HAT = ?",
        options: ["28", "29", "30", "31"],
        correct: 1,
        explanation: "H=8, A=1, T=20 → 29."
      },
      {
        question: "Which number comes next: 2, 6, 12, 20, 30, ?",
        options: ["36", "40", "42", "44"],
        correct: 2,
        explanation: "Pattern: +4, +6, +8, +10, next is +12 → 42."
      },
      {
        question: "If today is Wednesday, what day will it be 17 days later?",
        options: ["Friday", "Saturday", "Sunday", "Monday"],
        correct: 0,
        explanation: "17 mod 7 = 3 → Friday."
      },
      {
        question: "Which one is the strongest conclusion?",
        options: [
          "Some students are always late",
          "All students are disciplined",
          "A disciplined student can still be tired",
          "Tiredness means failure"
        ],
        correct: 2,
        explanation: "This is the most logically reasonable statement."
      },
      {
        question: "If every book on the shelf is blue, and this book is on the shelf, what must be true?",
        options: [
          "This book is expensive",
          "This book is blue",
          "This book is new",
          "This book is small"
        ],
        correct: 1,
        explanation: "If every book there is blue, this one must also be blue."
      }
    ],
    math: [
      {
        question: "What is 18 × 7?",
        options: ["112", "126", "132", "144"],
        correct: 1,
        explanation: "18 × 7 = 126."
      },
      {
        question: "Solve: 3x + 9 = 24",
        options: ["3", "4", "5", "6"],
        correct: 2,
        explanation: "3x = 15 → x = 5."
      },
      {
        question: "What is 25% of 240?",
        options: ["40", "50", "60", "80"],
        correct: 2,
        explanation: "25% = one-fourth → 240 ÷ 4 = 60."
      },
      {
        question: "What is 13²?",
        options: ["156", "169", "176", "196"],
        correct: 1,
        explanation: "13 × 13 = 169."
      },
      {
        question: "If a notebook costs ₹45, how much do 6 notebooks cost?",
        options: ["₹250", "₹260", "₹270", "₹280"],
        correct: 2,
        explanation: "45 × 6 = ₹270."
      },
      {
        question: "What is 84 ÷ 7?",
        options: ["10", "11", "12", "13"],
        correct: 2,
        explanation: "84 ÷ 7 = 12."
      },
      {
        question: "What is 15% of 200?",
        options: ["20", "25", "30", "35"],
        correct: 2,
        explanation: "10% = 20 and 5% = 10, total = 30."
      }
    ],
    focus: [
      {
        question: "Which word is spelled correctly?",
        options: ["Recieve", "Receive", "Receeve", "Receve"],
        correct: 1,
        explanation: "The correct spelling is 'Receive'."
      },
      {
        question: "Which number appears twice: 4, 9, 2, 7, 9, 1?",
        options: ["2", "4", "7", "9"],
        correct: 3,
        explanation: "9 appears twice."
      },
      {
        question: "Which one does NOT belong?",
        options: ["Book", "Pen", "Laptop", "Banana"],
        correct: 3,
        explanation: "Banana is unrelated to study tools."
      },
      {
        question: "Find the odd one out: Calm, Peace, Noise, Relax",
        options: ["Calm", "Peace", "Noise", "Relax"],
        correct: 2,
        explanation: "Noise does not fit with the calm-related words."
      },
      {
        question: "How many vowels are in 'Education'?",
        options: ["4", "5", "6", "7"],
        correct: 2,
        explanation: "E, u, a, i, o = 5 vowels."
      },
      {
        question: "Which comes first alphabetically?",
        options: ["Focus", "Discipline", "Clarity", "Mind"],
        correct: 2,
        explanation: "Clarity comes first alphabetically."
      },
      {
        question: "Spot the different one: 1113, 1118, 1113, 1113",
        options: ["1st", "2nd", "3rd", "4th"],
        correct: 1,
        explanation: "1118 is different."
      }
    ],
    pattern: [
      {
        question: "Which comes next: A, C, F, J, O, ?",
        options: ["S", "T", "U", "V"],
        correct: 2,
        explanation: "Pattern increases by +2, +3, +4, +5, next is +6 → U."
      },
      {
        question: "Which number is the odd one out: 3, 5, 11, 14, 17",
        options: ["3", "5", "11", "14"],
        correct: 3,
        explanation: "14 is even; others are odd."
      },
      {
        question: "If RED = 27, BLUE = 40, then GREEN = ?",
        options: ["49", "50", "51", "52"],
        correct: 0,
        explanation: "Letter values added together give 49."
      },
      {
        question: "Which shape has the most sides?",
        options: ["Triangle", "Hexagon", "Pentagon", "Square"],
        correct: 1,
        explanation: "Hexagon has 6 sides."
      },
      {
        question: "What comes next: 1, 1, 2, 3, 5, 8, ?",
        options: ["11", "12", "13", "14"],
        correct: 2,
        explanation: "Fibonacci sequence → next is 13."
      },
      {
        question: "What comes next: 5, 10, 20, 40, ?",
        options: ["50", "60", "70", "80"],
        correct: 3,
        explanation: "Each number doubles → 80."
      },
      {
        question: "Which pair matches the same pattern as 2 : 8?",
        options: ["3 : 9", "4 : 16", "5 : 20", "6 : 30"],
        correct: 1,
        explanation: "2²×2 = 8 and 4² = 16 fits the strongest pattern pair here."
      }
    ]
  };

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const prepareQuestions = (categoryId) => {
    const selected = shuffleArray(questions[categoryId]).slice(0, 5);

    return selected.map((q) => {
      const correctAnswer = q.options[q.correct];
      const shuffledOptions = shuffleArray(q.options);
      const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);

      return {
        ...q,
        options: shuffledOptions,
        correct: newCorrectIndex
      };
    });
  };

  const currentQuestions = gameQuestions;

  useEffect(() => {
    if (gameStarted && !showResult && category && !showFeedback) {
      setQuestionStartTime(Date.now());
      setQuestionTimer(12);
    }
  }, [currentQ, gameStarted, category, showFeedback, showResult]);

  useEffect(() => {
    if (!gameStarted || showResult || showFeedback) return;

    if (questionTimer <= 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => {
      setQuestionTimer((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [questionTimer, gameStarted, showResult, showFeedback]);

  const startCategory = (catId) => {
    const prepared = prepareQuestions(catId);
    setCategory(catId);
    setGameQuestions(prepared);
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((prev) => prev - 1), 900);
      return () => clearTimeout(t);
    }

    if (countdown === 0) {
      setGameStarted(true);
      setCountdown(null);
      setQuestionStartTime(Date.now());
    }
  }, [countdown]);

  const nextStep = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);

    if (currentQ < currentQuestions.length - 1) {
      setCurrentQ((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleTimeout = () => {
    const q = currentQuestions[currentQ];
    if (!q) return;

    setUserAnswers((prev) => [
      ...prev,
      {
        question: q.question,
        selected: "No answer",
        correct: q.options[q.correct],
        isCorrect: false,
        explanation: q.explanation
      }
    ]);

    setResponseTimes((prev) => [...prev, 12]);
    setStreak(0);
    setFeedbackText("⏳ Time’s up — stay calm, keep going.");
    setShowFeedback(true);

    setTimeout(nextStep, 1400);
  };

  const handleAnswer = (index) => {
    if (showFeedback) return;

    const q = currentQuestions[currentQ];
    if (!q) return;

    const timeTaken = questionStartTime
      ? (Date.now() - questionStartTime) / 1000
      : 0;

    const isCorrect = index === q.correct;

    setSelectedAnswer(index);
    setResponseTimes((prev) => [...prev, Number(timeTaken.toFixed(1))]);

    setUserAnswers((prev) => [
      ...prev,
      {
        question: q.question,
        selected: q.options[index],
        correct: q.options[q.correct],
        isCorrect,
        explanation: q.explanation
      }
    ]);

    if (isCorrect) {
      const newStreak = streak + 1;
      setScore((prev) => prev + 1);
      setStreak(newStreak);
      setBestStreak((prev) => Math.max(prev, newStreak));

      if (newStreak >= 3) setFeedbackText("🔥 Locked in. Your brain is on.");
      else if (newStreak === 2) setFeedbackText("⚡ Nice. You’re getting sharper.");
      else setFeedbackText("✅ Correct — good focus.");
    } else {
      setStreak(0);
      setFeedbackText("🧠 Close — your brain is warming up.");
    }

    setShowFeedback(true);
    setTimeout(nextStep, 1400);
  };

  const resetGame = () => {
    setCategory(null);
    setGameQuestions([]);
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setUserAnswers([]);
    setResponseTimes([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setFeedbackText("");
    setStreak(0);
    setBestStreak(0);
    setCountdown(null);
    setGameStarted(false);
    setQuestionTimer(12);
    setIsSubmitting(false);
  };

  const completeChallenge = async () => {
    try {
      if (!challenge?._id) {
        console.error("Challenge ID missing");
        navigate("/challenges");
        return;
      }

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        navigate("/challenges");
        return;
      }

      setIsSubmitting(true);

      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        {
          challengeId: challenge._id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate("/challenges");
    } catch (error) {
      console.error("Challenge completion failed:", error.response?.data || error.message);
      navigate("/challenges");
    } finally {
      setIsSubmitting(false);
    }
  };

  const wrongAnswers = userAnswers.filter((a) => !a.isCorrect);
  const avgResponseTime =
    responseTimes.length > 0
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
      : "0.0";

  const accuracy = currentQuestions.length
    ? Math.round((score / currentQuestions.length) * 100)
    : 0;

  const focusScore = Math.max(
    0,
    Math.min(100, Math.round(accuracy * 0.7 + Math.max(0, 30 - avgResponseTime * 2)))
  );

  if (!category) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef2ff,_#f8fafc,_#ffffff)]">
        <Navbar />
        <main className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-4">
                ✦ Study Activation Challenge
              </div>
              <h1 className="text-5xl font-bold text-slate-900 mb-4">Brain Sprint</h1>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                A short mental warm-up to switch your brain into study mode.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => startCategory(cat.id)}
                  className={`p-8 bg-gradient-to-br ${cat.color} text-white rounded-3xl shadow-xl hover:scale-[1.03] transition-all duration-300 text-left`}
                >
                  <span className="text-6xl mb-4 block">{cat.icon}</span>
                  <h2 className="text-2xl font-bold">{cat.name}</h2>
                  <p className="text-sm mt-2 opacity-90">{cat.description}</p>
                </button>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (countdown !== null) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-slate-400 uppercase tracking-[0.2em] text-sm mb-4">Get Ready</p>
            <h1 className="text-8xl font-bold mb-4">{countdown === 0 ? "GO" : countdown}</h1>
            <p className="text-slate-300 text-lg">Focus in. Clear the noise.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!showResult) {
    const q = currentQuestions[currentQ];
    const progress = currentQuestions.length
      ? ((currentQ + 1) / currentQuestions.length) * 100
      : 0;

    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef2ff,_#f8fafc,_#ffffff)]">
        <Navbar />
        <main className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] shadow-2xl p-8">
              <div className="mb-8">
                <div className="flex flex-wrap justify-between gap-3 text-sm text-slate-500 mb-3">
                  <span>Mode: {categories.find((c) => c.id === category)?.name}</span>
                  <span>Question {currentQ + 1}/{currentQuestions.length}</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-4">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-2xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Score</p>
                    <p className="text-2xl font-bold text-slate-900">{score}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Streak</p>
                    <p className="text-2xl font-bold text-orange-500">{streak}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Time Left</p>
                    <p className={`text-2xl font-bold ${questionTimer <= 4 ? "text-red-500" : "text-indigo-600"}`}>
                      {questionTimer}s
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-8 leading-snug">
                {q?.question}
              </h2>

              <div className="space-y-4">
                {q?.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showFeedback}
                      className={`w-full p-5 text-left rounded-2xl border transition-all duration-200 font-medium ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 scale-[1.01]"
                          : "bg-slate-50 hover:bg-indigo-50 border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {showFeedback && (
                <div className="mt-6 text-center text-lg font-semibold text-slate-700 animate-pulse">
                  {feedbackText}
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef2ff,_#f8fafc,_#ffffff)]">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{accuracy >= 80 ? "🧠" : "⚡"}</div>
              <h2 className="text-4xl font-bold text-slate-900 mb-3">Brain Activated</h2>
              <p className="text-slate-600 text-lg">
                Nice. Your mind is more alert and ready to study now.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-indigo-50 rounded-2xl p-5 text-center">
                <p className="text-sm text-slate-500 mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-indigo-700">{accuracy}%</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-5 text-center">
                <p className="text-sm text-slate-500 mb-1">Avg Speed</p>
                <p className="text-3xl font-bold text-emerald-700">{avgResponseTime}s</p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-5 text-center">
                <p className="text-sm text-slate-500 mb-1">Best Streak</p>
                <p className="text-3xl font-bold text-orange-600">{bestStreak}</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white mb-8">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400 mb-2">Focus Score</p>
              <h3 className="text-5xl font-bold mb-3">{focusScore}/100</h3>
              <p className="text-slate-300">
                A mix of your speed, consistency, and answer accuracy.
              </p>
            </div>

            {wrongAnswers.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-xl mb-4 text-slate-900">Review your misses</h3>
                {wrongAnswers.map((answer, index) => (
                  <div key={index} className="bg-amber-50 border border-amber-100 p-5 rounded-2xl mb-4">
                    <p className="font-semibold text-slate-900 mb-2">{answer.question}</p>
                    <p className="text-sm text-red-600">❌ Your answer: {answer.selected}</p>
                    <p className="text-sm text-green-700">✅ Correct: {answer.correct}</p>
                    <p className="text-sm text-slate-600 mt-3">💡 {answer.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={resetGame}
                className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-semibold transition"
              >
                Try Another Mode
              </button>
              <button
                onClick={completeChallenge}
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 font-semibold transition disabled:opacity-60"
              >
                {isSubmitting ? "Completing..." : "Complete Challenge"}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuickQuizGame;