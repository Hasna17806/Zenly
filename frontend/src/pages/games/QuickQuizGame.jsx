import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const QuickQuizGame = () => {
  const [category, setCategory] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]); // Store user's answers
  const navigate = useNavigate();

  const categories = [
    { id: 'gk', name: 'General Knowledge', icon: '🌍', color: 'bg-blue-500' },
    { id: 'math', name: 'Mathematics', icon: '🔢', color: 'bg-green-500' },
    { id: 'science', name: 'Science', icon: '🔬', color: 'bg-purple-500' },
    { id: 'comedy', name: 'Comedy & Fun', icon: '😂', color: 'bg-orange-500' }
  ];

  const questions = {
    gk: [
      {
        question: "What is the capital of India?",
        options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
        correct: 1,
        explanation: "New Delhi is the capital of India."
      },
      {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correct: 1,
        explanation: "William Shakespeare wrote Romeo and Juliet in the 1590s."
      },
      {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correct: 3,
        explanation: "The Pacific Ocean is the largest, covering about 63 million square miles."
      }
    ],
    math: [
      {
        question: "What is 15 × 12?",
        options: ["150", "170", "180", "200"],
        correct: 2,
        explanation: "15 × 12 = 180 (15 × 10 = 150, 15 × 2 = 30, 150 + 30 = 180)"
      },
      {
        question: "Solve for x: 2x + 5 = 15",
        options: ["5", "10", "7.5", "8"],
        correct: 0,
        explanation: "2x + 5 = 15 → 2x = 10 → x = 5"
      },
      {
        question: "What is the square root of 144?",
        options: ["10", "11", "12", "13"],
        correct: 2,
        explanation: "12 × 12 = 144, so √144 = 12"
      }
    ],
    science: [
      {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct: 2,
        explanation: "Au comes from the Latin word for gold, 'aurum'."
      },
      {
        question: "What planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1,
        explanation: "Mars appears red due to iron oxide (rust) on its surface."
      },
      {
        question: "What is the hardest natural substance?",
        options: ["Iron", "Diamond", "Platinum", "Titanium"],
        correct: 1,
        explanation: "Diamond is the hardest natural substance on the Mohs scale."
      }
    ],
    comedy: [
      {
        question: "Why don't scientists trust atoms?",
        options: ["They're too small", "They make up everything", "They're unstable", "They're lazy"],
        correct: 1,
        explanation: "Because they make up everything! (Get it? Atoms make up everything in the universe)"
      },
      {
        question: "What do you call a fake noodle?",
        options: ["Pasta-fake", "An impasta", "Faux pasta", "Noodle not"],
        correct: 1,
        explanation: "An impasta! (Like 'imposter' but with pasta)"
      },
      {
        question: "Why did the scarecrow win an award?",
        options: ["He was outstanding", "He was funny", "He scared crows", "He was tall"],
        correct: 0,
        explanation: "Because he was outstanding in his field! (Outstanding = really good, but also standing in a field)"
      }
    ]
  };

  const handleAnswer = (index) => {
    const isCorrect = index === questions[category][currentQ].correct;
    
    // Store user's answer
    setUserAnswers([
      ...userAnswers,
      {
        question: questions[category][currentQ].question,
        selected: questions[category][currentQ].options[index],
        correct: questions[category][currentQ].options[questions[category][currentQ].correct],
        isCorrect: isCorrect,
        explanation: questions[category][currentQ].explanation
      }
    ]);

    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQ < questions[category].length - 1) {
      setCurrentQ(currentQ + 1);
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

  const handlePlayAgain = () => {
    setCategory(null);
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setUserAnswers([]);
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
        <Navbar />
        <main className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">Quick Quiz</h1>
            <p className="text-center text-slate-600 mb-12">Choose a category to begin</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setUserAnswers([]);
                  }}
                  className={`p-8 ${cat.color} text-white rounded-3xl shadow-xl hover:scale-105 transition-all`}
                >
                  <span className="text-6xl mb-4 block">{cat.icon}</span>
                  <h2 className="text-2xl font-bold">{cat.name}</h2>
                </button>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!showResult) {
    const q = questions[category][currentQ];
    const progress = ((currentQ) / questions[category].length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
        <Navbar />
        <main className="py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-xl">
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                  <span>Category: {categories.find(c => c.id === category)?.name}</span>
                  <span>Question {currentQ + 1}/{questions[category].length}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-8">{q.question}</h2>
              
              <div className="space-y-4">
                {q.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className="w-full p-4 text-left bg-slate-50 rounded-xl hover:bg-indigo-100 transition-all"
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Score so far */}
              <div className="mt-6 text-sm text-slate-400 text-center">
                Score: {score}/{currentQ}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate wrong answers
  const wrongAnswers = userAnswers.filter(a => !a.isCorrect);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-3xl shadow-xl">
            {/* Score summary */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{score === 3 ? '🏆' : score === 2 ? '🎉' : '💪'}</div>
              <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
              <p className="text-2xl mb-2">Score: {score}/{questions[category].length}</p>
              <p className="text-slate-600">
                {score === 3 ? "Perfect! You're a genius!" :
                 score === 2 ? "Great job! Keep learning!" :
                 "Good try! Practice makes perfect!"}
              </p>
            </div>

            {/* Wrong answers review section */}
            {wrongAnswers.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-red-500">📝</span> 
                  Review Wrong Answers ({wrongAnswers.length})
                </h3>
                
                <div className="space-y-4">
                  {wrongAnswers.map((answer, index) => (
                    <div key={index} className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                      <p className="font-semibold mb-2">{answer.question}</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-red-600">
                          ❌ Your answer: {answer.selected}
                        </p>
                        <p className="text-green-600">
                          ✅ Correct answer: {answer.correct}
                        </p>
                        <p className="text-slate-600 mt-2 text-xs bg-white p-2 rounded">
                          💡 {answer.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All correct message */}
            {wrongAnswers.length === 0 && (
              <div className="mb-8 bg-green-50 p-6 rounded-xl text-center">
                <p className="text-green-700 font-semibold">
                  ✨ Perfect score! You got all questions right!
                </p>
              </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 mb-8 text-center text-sm">
              <div className="bg-slate-50 p-3 rounded">
                <div className="font-bold text-green-600">{score}</div>
                <div className="text-slate-500">Correct</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="font-bold text-red-600">{wrongAnswers.length}</div>
                <div className="text-slate-500">Wrong</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="font-bold text-indigo-600">{Math.round((score/3)*100)}%</div>
                <div className="text-slate-500">Accuracy</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePlayAgain}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
              >
                Play Again
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
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

export default QuickQuizGame;