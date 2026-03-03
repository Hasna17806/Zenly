import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const EmojiMatchGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = location.state?.challenge;
  
  const [currentEmoji, setCurrentEmoji] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  const emojiQuestions = [
    { 
      emoji: "😊", 
      correct: "Happy",
      options: ["Happy", "Sad", "Angry", "Tired"],
      hint: "When you get good news"
    },
    { 
      emoji: "😢", 
      correct: "Sad",
      options: ["Happy", "Sad", "Excited", "Calm"],
      hint: "When something makes you cry"
    },
    { 
      emoji: "😠", 
      correct: "Angry",
      options: ["Happy", "Angry", "Tired", "Nervous"],
      hint: "When someone cuts you off in traffic"
    },
    { 
      emoji: "😰", 
      correct: "Anxious",
      options: ["Happy", "Anxious", "Angry", "Bored"],
      hint: "Before a big exam"
    },
    { 
      emoji: "😴", 
      correct: "Tired",
      options: ["Tired", "Happy", "Angry", "Excited"],
      hint: "After studying all night"
    },
    { 
      emoji: "😌", 
      correct: "Relieved",
      options: ["Relieved", "Stressed", "Sad", "Angry"],
      hint: "After finishing a difficult assignment"
    },
    { 
      emoji: "🤔", 
      correct: "Confused",
      options: ["Confused", "Happy", "Angry", "Excited"],
      hint: "When you don't understand the question"
    },
    { 
      emoji: "🥳", 
      correct: "Celebrating",
      options: ["Celebrating", "Sad", "Tired", "Bored"],
      hint: "When you pass all your exams"
    }
  ];

  useEffect(() => {
    if (round < emojiQuestions.length) {
      setCurrentEmoji(emojiQuestions[round]);
      // Shuffle options
      setOptions([...emojiQuestions[round].options].sort(() => Math.random() - 0.5));
    } else {
      setShowResult(true);
    }
  }, [round]);

  const handleAnswer = (selected) => {
    if (selected === currentEmoji.correct) {
      setScore(score + 1);
      setFeedback("✅ Correct! Great job!");
      setFeedbackType("correct");
    } else {
      setFeedback(`❌ Oops! That's ${selected}. The correct answer is ${currentEmoji.correct}`);
      setFeedbackType("wrong");
    }

    // Show feedback for 1.5 seconds then move to next
    setTimeout(() => {
      setFeedback('');
      setFeedbackType('');
      setRound(round + 1);
    }, 1500);
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { 
          challengeId: challenge?.id || 'emoji-match',
          challengeTitle: challenge?.title || 'Emoji Match'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/challenges');
    } catch (error) {
      console.error("Error:", error);
      navigate('/challenges');
    }
  };

  const handlePlayAgain = () => {
    setRound(0);
    setScore(0);
    setShowResult(false);
    setFeedback('');
  };

  // Progress percentage
  const progress = ((round) / emojiQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-900 mb-2">Emoji Match</h1>
            <p className="text-slate-600">Match the emoji to the correct emotion</p>
          </div>

          {!showResult ? (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                  <span>Round {round + 1}/{emojiQuestions.length}</span>
                  <span>Score: {score}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Emoji display */}
              {currentEmoji && (
                <div className="text-center mb-8">
                  <div className="text-8xl mb-4 animate-bounce">
                    {currentEmoji.emoji}
                  </div>
                  <p className="text-lg text-slate-500 italic">
                    Hint: {currentEmoji.hint}
                  </p>
                </div>
              )}

              {/* Options grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={feedback !== ''}
                    className={`
                      p-6 text-lg font-semibold rounded-xl transition-all
                      ${feedback === '' 
                        ? 'bg-slate-100 hover:bg-indigo-100 hover:scale-105' 
                        : 'opacity-50 cursor-not-allowed'}
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Feedback message */}
              {feedback && (
                <div className={`
                  p-4 rounded-xl text-center transition-all
                  ${feedbackType === 'correct' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'}
                `}>
                  {feedback}
                </div>
              )}

              {/* Quick stats */}
              <div className="mt-6 text-sm text-slate-400 text-center">
                Click on the emotion that matches the emoji
              </div>
            </div>
          ) : (
            /* Results screen */
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <div className="text-7xl mb-4">
                {score === emojiQuestions.length ? '🏆' : '🎯'}
              </div>
              
              <h2 className="text-3xl font-bold mb-2">
                {score === emojiQuestions.length 
                  ? 'Perfect Score!' 
                  : 'Game Complete!'}
              </h2>
              
              <p className="text-2xl mb-4">
                Score: {score}/{emojiQuestions.length}
              </p>
              
              <div className="bg-indigo-50 p-4 rounded-xl mb-8">
                <p className="text-indigo-800">
                  {score === emojiQuestions.length 
                    ? "You're an emoji expert! 🎉" 
                    : score >= 6 
                    ? "Great job! You understand emotions well! 🌟"
                    : "Keep practicing! You'll get better at recognizing emotions! 💪"}
                </p>
              </div>

              {/* Fun fact based on score */}
              <div className="mb-8 text-slate-600">
                {score === emojiQuestions.length && (
                  <p>✨ Fun fact: People who are good at recognizing emotions often have higher EQ!</p>
                )}
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handlePlayAgain}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
                >
                  Play Again
                </button>
                <button
                  onClick={handleComplete}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                >
                  Complete Challenge
                </button>
              </div>
            </div>
          )}

          {/* Instructions for new players */}
          {round === 0 && !showResult && (
            <div className="mt-6 bg-indigo-50 p-4 rounded-xl text-sm text-indigo-700">
              <p className="font-semibold mb-1">📝 How to play:</p>
              <p>1. Look at the emoji shown above</p>
              <p>2. Read the hint if you're unsure</p>
              <p>3. Click on the correct emotion from the options</p>
              <p>4. Complete all {emojiQuestions.length} rounds!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmojiMatchGame;