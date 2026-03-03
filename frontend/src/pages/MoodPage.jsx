import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, X, Sparkles } from 'lucide-react';

// Custom Modal Component
const CustomModal = ({ isOpen, onClose, type, title, message, onAction }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all animate-slide-up">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${bgColor} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {message}
            </p>

            {isSuccess ? (
              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-700">
                  ✨ Your mood has been saved! Check out your personalized challenges below.
                </p>
              </div>
            ) : (
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-700">
                  Please try again or check your connection.
                </p>
              </div>
            )}

            <button
              onClick={onAction || onClose}
              className={`w-full bg-gradient-to-r ${bgColor} text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all hover:scale-105`}
            >
              {isSuccess ? "View Challenges" : "Try Again"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Simple Toast for quick notifications
const Toast = ({ message, type = 'success', onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  
  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-in">
      <div className={`${bgColor} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3`}>
        {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-80">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const MoodPage = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedFactors, setSelectedFactors] = useState([]);
  const [showFactors, setShowFactors] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [suggestedChallenges, setSuggestedChallenges] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Modal states
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  
  // Toast state
  const [toast, setToast] = useState(null);

  // Mood Data with simple emoji icons
  const moods = [
    {
      id: 'happy',
      label: 'Happy / Energetic',
      emoji: '😁',
      gradient: 'from-[#FFD978] to-[#FFF1C1]',
      textColor: 'text-amber-700',
      borderColor: 'border-blue-400',
      backendValue: 'happy/Energetic'
    },
    {
      id: 'calm',
      label: 'Calm / Okay',
      emoji: '😊',
      gradient: 'from-[#8CCBB9] to-[#E6F4F1]',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-400',
      backendValue: 'calm/Okay'
    },
    {
      id: 'anger',
      label: 'Anger / Frustrated',
      emoji: '😤',
      gradient: 'from-[#F28B82] to-[#FCE8E6]',
      textColor: 'text-rose-800',
      borderColor: 'border-rose-400',
      backendValue: 'angry/Frustrated'
    },
    {
      id: 'stressed',
      label: 'Stressed / Heavy',
      emoji: '😰',
      gradient: 'from-[#A7B1C2] to-[#F1F3F4]',
      textColor: 'text-slate-600',
      borderColor: 'border-slate-400',
      backendValue: 'stressed/Heavy'
    },
    {
      id: 'sad',
      label: 'Sad / Low',
      emoji: '☹️',
      gradient: 'from-[#9CA3FF] to-[#E8E9FF]',
      textColor: 'text-indigo-800',
      borderColor: 'border-indigo-400',
      hasBar: true,
      backendValue: 'sad/Low'
    },
    {
      id: 'tired',
      label: 'Tired / Burned Out',
      emoji: '😫',
      gradient: 'from-[#FFAD5A] to-[#FFF0E0]',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-400',
      backendValue: 'tired/Burned Out'
    }
  ];

  // Factors (What's affecting your mood) - with emoji icons
  const factors = [
    { id: 'studies', label: 'Studies', icon: '📚', color: 'bg-[#CDE4B4] text-slate-800' },
    { id: 'sleep', label: 'Sleep', icon: '😴', color: 'bg-[#CEC2EB] text-slate-800' },
    { id: 'people', label: 'People', icon: '👥', color: 'bg-[#A6DEE5] text-slate-800' },
    { id: 'thoughts', label: 'Thoughts', icon: '🧠', color: 'bg-[#BCBFC2] text-slate-800' },
    { id: 'personal', label: 'Personal', icon: '💡', color: 'bg-[#E5D4B1] text-slate-800' },
  ];

  const showModal = (type, title, message) => {
    setModalState({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId);
    setShowFactors(true);
    setShowSuggestions(false);
    setSelectedFactors([]);
    setError("");
    setTimeout(() => {
      document.getElementById('factors-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const toggleFactor = (factorId) => {
    setSelectedFactors(prev => 
      prev.includes(factorId)
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showModal(
          'error',
          'Login Required',
          'Please login first to save your mood and get personalized suggestions.'
        );
        return;
      }

      if (!selectedMood) {
        showModal(
          'error',
          'No Mood Selected',
          'Please select a mood before continuing.'
        );
        return;
      }

      const selectedMoodData = moods.find(m => m.id === selectedMood);
      
      if (!selectedMoodData) {
        showModal(
          'error',
          'Invalid Selection',
          'Please select a valid mood option.'
        );
        return;
      }

      // 1. Save mood to database
      const moodResponse = await axios.post(
        "http://localhost:5000/api/mood",
        { 
          mood: selectedMoodData.backendValue,
          note: note || "" 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("Mood saved successfully:", moodResponse.data);

      // 2. Fetch challenges based on mood from backend
      try {
        const challengesResponse = await axios.get(
          `http://localhost:5000/api/challenges/${encodeURIComponent(selectedMoodData.backendValue)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        console.log("Challenges fetched:", challengesResponse.data);
        
        if (challengesResponse.data && challengesResponse.data.length > 0) {
          setSuggestedChallenges(challengesResponse.data);
          setSuggestions(challengesResponse.data.map(c => c.title));
        } else {
          // Fallback to default suggestions if no challenges found
          setSuggestedChallenges([]);
          setSuggestions(getDefaultSuggestions(selectedMood));
        }
      } catch (challengeError) {
        console.error("Error fetching challenges:", challengeError);
        // Fallback to default suggestions
        setSuggestions(getDefaultSuggestions(selectedMood));
      }

      // Show suggestions and hide factors
      setShowSuggestions(true);
      
      // Show success modal
      showModal(
        'success',
        'Mood Saved! ✨',
        'Your mood has been recorded. Check out your personalized challenges below.'
      );

    } catch (error) {
      console.error("Error saving mood:", error);
      
      if (error.response) {
        showModal(
          'error',
          'Server Error',
          error.response.data.message || 'Failed to save mood. Please try again.'
        );
      } else if (error.request) {
        showModal(
          'error',
          'Connection Error',
          'Cannot connect to server. Please check if the backend is running.'
        );
      } else {
        showModal(
          'error',
          'Error',
          error.message || 'An unexpected error occurred.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function for default suggestions
  const getDefaultSuggestions = (mood) => {
    if (mood === "stressed" || mood === "sad") {
      return [
        "5-minute breathing exercise",
        "Write down 3 thoughts",
        "Short 15-min focus session"
      ];
    } else if (mood === "tired") {
      return [
        "Drink water",
        "Take a 10-min walk",
        "25-min light focus session"
      ];
    } else if (mood === "anger") {
      return [
        "Count to 10 slowly",
        "Go for a quick walk",
        "Write down what's frustrating you"
      ];
    } else {
      return [
        "45-min deep focus session",
        "Review today's goals",
        "Help a friend with studies"
      ];
    }
  };

  const selectedMoodData = moods.find(m => m.id === selectedMood);

  const handleComplete = async (challenge) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showModal(
          'error',
          'Login Required',
          'Please login first to complete challenges.'
        );
        return;
      }

      // Find the challenge ID from suggestedChallenges
      const challengeObj = suggestedChallenges.find(c => c.title === challenge);
      
      if (!challengeObj || !challengeObj._id) {
        console.error("Challenge ID not found:", challenge);
        // If we can't find the ID, still mark as completed in UI
        setCompleted(prev => [...prev, challenge]);
        showToast("Challenge marked as completed locally!", 'success');
        return;
      }

      // Post to the correct completed challenges endpoint
      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { challengeId: challengeObj._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      setCompleted(prev => [...prev, challenge]);
      showToast("Challenge completed! +5 Focus Points 🎉", 'success');

    } catch (error) {
      console.error("Error completing challenge:", error);
      
      // Still mark as completed in UI for better UX
      setCompleted(prev => [...prev, challenge]);
      showToast("Challenge marked as completed!", 'success');
    }
  };

  const handlePlayChallenge = (challenge) => {
    const challengeObj = suggestedChallenges.find(c => c.title === challenge);
    
    if (challenge.includes("breathing") || challenge.includes("Breathe")) {
      navigate("/games/breathe");
    } else if (challenge.includes("Match") || challenge.includes("Emoji")) {
      navigate("/games/emoji-match");
    } else if (challenge.includes("Star") || challenge.includes("Tap")) {
      navigate("/games/tap-star");
    } else if (challenge.includes("Guess") || challenge.includes("Sound")) {
      navigate("/games/guess-sound");
    } else if (challenge.includes("Spin") || challenge.includes("Wheel")) {
      navigate("/games/spin-wheel");
    } else {
      navigate("/challenges");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col font-sans">
      <Navbar />

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <main className="flex-grow py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-serif text-slate-800 tracking-[0.2em] uppercase mb-4">
              HOW ARE YOU FEELING TODAY?
            </h1>
            <p className="text-2xl italic text-slate-400 font-serif">
              There's no right or wrong feeling.
            </p>
          </div>

          {/* Mood Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`
                  relative flex flex-col items-center justify-center p-12 
                  rounded-[2.5rem] border-2 transition-all duration-500 transform
                  bg-gradient-to-b ${mood.gradient}
                  ${selectedMood === mood.id 
                    ? `${mood.borderColor} scale-105 shadow-2xl ring-4 ring-white/50` 
                    : 'border-transparent shadow-md hover:shadow-lg hover:-translate-y-1'
                  }
                `}
              >
                <span className="text-7xl mb-6">{mood.emoji}</span>
                <span className={`text-xl font-bold tracking-tight ${mood.textColor}`}>
                  {mood.label}
                </span>
                {selectedMood === mood.id && mood.hasBar && (
                  <div className="absolute bottom-6 w-20 h-1.5 bg-indigo-600/40 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Factors Section - Only show when suggestions are not visible */}
          {showFactors && selectedMood && !showSuggestions && (
            <div id="factors-section" className="animate-in fade-in slide-in-from-bottom-10 duration-700 max-w-4xl mx-auto">
              <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-12 border border-slate-50">
                
                {/* Selected Mood Summary */}
                <div className="flex items-center justify-center gap-3 mb-10">
                  <span className="text-4xl">{selectedMoodData?.emoji}</span>
                  <h2 className="text-2xl font-bold text-slate-800">
                    What's affecting your mood?
                  </h2>
                </div>
                
                {/* Note Input Field */}
                <div className="mb-8">
                  <label htmlFor="note" className="block text-sm font-medium text-slate-700 mb-2 text-center">
                    Add a note (optional)
                  </label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="How are you feeling? What's on your mind?"
                    className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                    rows="3"
                  />
                </div>

                {/* Factors Grid */}
                <div className="flex flex-wrap justify-center gap-5 mb-12">
                  {factors.map((factor) => (
                    <button
                      key={factor.id}
                      onClick={() => toggleFactor(factor.id)}
                      className={`
                        flex items-center gap-3 px-8 py-4 rounded-full font-bold transition-all border-2
                        ${factor.color}
                        ${selectedFactors.includes(factor.id) 
                          ? 'border-slate-900 scale-110 shadow-md ring-2 ring-white' 
                          : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}
                      `}
                    >
                      <span className="text-xl">{factor.icon}</span>
                      <span className="italic text-lg">{factor.label}</span>
                    </button>
                  ))}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button 
                    onClick={handleSubmit}
                    disabled={selectedFactors.length === 0 || isSubmitting}
                    className={`
                      px-12 py-5 rounded-2xl font-bold text-white transition-all text-lg
                      ${selectedFactors.length > 0 && !isSubmitting
                        ? 'bg-[#9499A1] hover:bg-slate-700 shadow-xl shadow-slate-200 hover:scale-105' 
                        : 'bg-slate-300 cursor-not-allowed'}
                    `}
                  >
                    {isSubmitting ? 'Saving...' : "See Today's Suggestions"}
                  </button>
                </div>

                {/* Selected factors summary */}
                {selectedFactors.length > 0 && (
                  <div className="mt-6 text-sm text-slate-500 text-center">
                    Selected: {selectedFactors.map(f => factors.find(c => c.id === f)?.label).join(' • ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggestions Section - Show after submission */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-16 bg-white p-10 rounded-3xl shadow-xl max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-serif text-slate-800 mb-2">
                    Today's Challenges
                  </h2>
                  <p className="text-slate-500">
                    Based on your {selectedMoodData?.label} mood
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/challenges')}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  View All <span>→</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((item, index) => {
                  const challengeObj = suggestedChallenges.find(c => c.title === item);
                  const isCompleted = completed.includes(item);
                  
                  return (
                    <div
                      key={index}
                      className={`bg-slate-50 p-6 rounded-xl border-2 transition-all ${
                        isCompleted ? 'border-green-300 bg-green-50' : 'border-transparent hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg">{item}</h3>
                        {challengeObj?.moodTag && (
                          <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">
                            {Array.isArray(challengeObj.moodTag) 
                              ? challengeObj.moodTag[0] 
                              : challengeObj.moodTag}
                          </span>
                        )}
                      </div>
                      
                      {challengeObj?.description && (
                        <p className="text-slate-600 text-sm mb-4">{challengeObj.description}</p>
                      )}
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => handlePlayChallenge(item)}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all text-sm"
                        >
                          Play 🎮
                        </button>
                        
                        <button
                          onClick={() => handleComplete(item)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                            isCompleted
                              ? "bg-green-500 text-white cursor-not-allowed"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          }`}
                          disabled={isCompleted}
                        >
                          {isCompleted ? "✅ Completed" : "✓ Mark Done"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Progress summary - Fixed banner message */}
              <div className="mt-8 p-6 bg-indigo-50 rounded-xl text-center">
                <p className="text-indigo-800 text-lg font-medium">
                  {completed.length > 0 
                    ? `🎉 Nice job! You've completed ${completed.length} challenge${completed.length !== 1 ? 's' : ''} today.`
                    : "✨ Ready to start your first challenge?"}
                </p>
                <p className="text-sm text-indigo-600 mt-2">
                  Zenly uses your daily challenges to help you feel better step-by-step.
                </p>
                
                {/* Back button to factors */}
                <button
                  onClick={() => {
                    setShowSuggestions(false);
                    setShowFactors(true);
                  }}
                  className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-center gap-1"
                >
                  ← Back to edit factors
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Custom Modal */}
      <CustomModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onAction={() => {
          closeModal();
          if (modalState.type === 'success') {
            // Scroll to suggestions if needed
            document.getElementById('suggestions-section')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
};

export default MoodPage;