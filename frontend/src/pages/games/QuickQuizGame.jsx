import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import EffectivenessDashboard from '../../components/EffectivenessDashboard';
import axios from 'axios';

const QuickQuizGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [responseTime, setResponseTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showEffectiveness, setShowEffectiveness] = useState(false);

  const categories = [
    { 
      id: 'gk', 
      name: 'General Knowledge', 
      icon: '🌍', 
      color: 'bg-blue-500',
      description: 'Test your world knowledge'
    },
    { 
      id: 'math', 
      name: 'Mathematics', 
      icon: '🔢', 
      color: 'bg-green-500',
      description: 'Sharpen your numerical skills'
    },
    { 
      id: 'science', 
      name: 'Science', 
      icon: '🔬', 
      color: 'bg-purple-500',
      description: 'Explore scientific facts'
    },
    { 
      id: 'comedy', 
      name: 'Comedy & Fun', 
      icon: '😂', 
      color: 'bg-orange-500',
      description: 'Lighten up with humor'
    }
  ];

  const questions = {
    gk: [
      {
        question: "What is the capital of India?",
        options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
        correct: 1,
        explanation: "New Delhi is the capital of India, a city rich in history and culture."
      },
      {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correct: 1,
        explanation: "Shakespeare wrote this classic tragedy in the 1590s."
      },
      {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correct: 3,
        explanation: "The Pacific Ocean covers more than 63 million square miles!"
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
        explanation: "Diamond is the hardest natural substance on Earth."
      }
    ],
    comedy: [
      {
        question: "Why don't scientists trust atoms?",
        options: ["Too small", "They make up everything", "Unstable", "Lazy"],
        correct: 1,
        explanation: "Because they make up everything! (Get it? Atoms make up everything)"
      },
      {
        question: "What do you call a fake noodle?",
        options: ["Pasta-fake", "An impasta", "Faux pasta", "Noodle not"],
        correct: 1,
        explanation: "An impasta! (Like 'imposter' but with pasta)"
      },
      {
        question: "Why did the scarecrow win an award?",
        options: ["Outstanding", "Funny", "Scared crows", "Tall"],
        correct: 0,
        explanation: "He was outstanding in his field! 🌾"
      }
    ]
  };

  const handleAnswer = (index) => {
    if (!startTime) setStartTime(Date.now());
    
    const timeTaken = startTime ? (Date.now() - startTime) / 1000 : 0;
    setResponseTime(prev => prev + timeTaken);
    
    const isCorrect = index === questions[category][currentQ].correct;
    
    setUserAnswers([
      ...userAnswers,
      {
        question: questions[category][currentQ].question,
        selected: questions[category][currentQ].options[index],
        correct: questions[category][currentQ].options[questions[category][currentQ].correct],
        isCorrect,
        explanation: questions[category][currentQ].explanation
      }
    ]);

    if (isCorrect) {
      setScore(score + 1);
    }

    setStartTime(Date.now());

    if (currentQ < questions[category].length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
      setShowEffectiveness(true);
    }
  };

  const wrongAnswers = userAnswers.filter(a => !a.isCorrect);
  const avgResponseTime = (responseTime / questions[category]?.length).toFixed(1);

  const effectivenessStats = [
    { label: "Score", value: `${score}/${questions[category]?.length}` },
    { label: "Accuracy", value: `${Math.round((score/3)*100)}%` },
    { label: "Avg Response", value: `${avgResponseTime}s` }
  ];

  const benefits = [
    "Improves cognitive processing speed",
    "Enhances long-term memory retention",
    "Strengthens neural connections",
    "Increases general knowledge"
  ];

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
                  onClick={() => setCategory(cat.id)}
                  className={`p-8 ${cat.color} text-white rounded-3xl shadow-xl hover:scale-105 transition-all`}
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

  if (!showResult) {
    const q = questions[category][currentQ];
    const progress = ((currentQ) / questions[category].length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
        <Navbar />
        <main className="py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-xl">
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-3xl shadow-xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{score === 3 ? '🏆' : '🎉'}</div>
              <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
            </div>

            <EffectivenessDashboard
              gameType="quiz"
              stats={effectivenessStats}
              benefits={benefits}
              research="Daily quizzes improve cognitive function by 23% and memory retention by 35%"
            />

            {wrongAnswers.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold mb-3">📚 Learn from mistakes:</h3>
                {wrongAnswers.map((answer, index) => (
                  <div key={index} className="bg-orange-50 p-4 rounded-xl mb-3">
                    <p className="font-semibold text-sm mb-2">{answer.question}</p>
                    <p className="text-sm text-red-600">❌ Your answer: {answer.selected}</p>
                    <p className="text-sm text-green-600">✅ Correct: {answer.correct}</p>
                    <p className="text-xs text-slate-600 mt-2">💡 {answer.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setCategory(null);
                  setCurrentQ(0);
                  setScore(0);
                  setUserAnswers([]);
                  setShowResult(false);
                }}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
              >
                Try Another Category
              </button>
              <button
                onClick={async () => {
                  await axios.post("http://localhost:5000/api/completed", {
                    challengeId: location.state?.challenge?.id,
                    score,
                    accuracy: Math.round((score/3)*100)
                  });
                  navigate('/challenges');
                }}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
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