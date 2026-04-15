import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, X, Sparkles } from 'lucide-react';
import Celebration from './Celebration';

// Custom Modal Component
const CustomModal = ({ isOpen, onClose, type, title, message, onAction }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all animate-slide-up">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

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

// ========== EXPANDED CHALLENGES WITH MORE VARIETY ==========
const allChallenges = {
  'Mood Boost': [
    { id: 'breathe-reset', title: 'Breathe & Reset', description: 'Calm your mind with guided breathing', time: '3 mins', image: '', moodTag: ['stressed/Heavy', 'sad/Low', 'tired/Burned Out', 'angry/Frustrated'], gameType: 'breathing', difficulty: 'easy' },
    { id: 'gratitude-tap', title: 'Gratitude Tap', description: 'Think of one good thing today', time: '2 mins', image: '', moodTag: ['sad/Low', 'calm/Okay', 'tired/Burned Out'], gameType: 'gratitude', difficulty: 'easy' },
    { id: 'smile-challenge', title: 'Smile Challenge', description: 'Hold a gentle smile for 20 seconds', time: '20 secs', image: '', moodTag: ['happy/Energetic', 'calm/Okay', 'sad/Low'], gameType: 'smile-challenge', difficulty: 'easy' },
    { id: 'calm-taps', title: 'Calm Taps', description: 'Tap floating bubbles to relax', time: '2 mins', image: '', moodTag: ['stressed/Heavy', 'angry/Frustrated', 'tired/Burned Out', 'anxious/Worried'], gameType: 'bubbles', difficulty: 'medium' },
    { id: 'breath-bubble', title: 'Breath Bubble', description: 'Follow the bubble\'s rhythm to find calm', time: '4 mins', image: '', moodTag: ['stressed/Heavy', 'anxious/Worried', 'angry/Frustrated'], gameType: 'breath-bubble', difficulty: 'easy' },
    { id: 'gratitude-catch', title: 'Gratitude Catch', description: 'Catch falling blessings before they pass', time: '2 mins', image: '', moodTag: ['sad/Low', 'calm/Okay', 'tired/Burned Out'], gameType: 'gratitude-catch', difficulty: 'medium' },
    { id: 'mindful-match', title: 'Mindful Match', description: 'Match emotions with their coping skills', time: '3 mins', image: '', moodTag: ['calm/Okay', 'happy/Energetic', 'stressed/Heavy'], gameType: 'mindful-match', difficulty: 'hard' },
    { id: 'affirmation-stack', title: 'Affirmation Stack', description: 'Build a tower of positive beliefs', time: '3 mins', image: '', moodTag: ['sad/Low', 'stressed/Heavy', 'Self-doubt'], gameType: 'affirmation-stack', difficulty: 'easy' },
    { id: 'color-calm', title: 'Color Calm', description: 'Color a mandala and find your center', time: '5 mins', image: '', moodTag: ['stressed/Heavy', 'angry/Frustrated', 'anxious/Worried'], gameType: 'color-calm', difficulty: 'easy' },
    { id: 'sound-sanctuary', title: 'Sound Sanctuary', description: 'Mix calming sounds to create peace', time: '5 mins', image: '', moodTag: ['stressed/Heavy', 'anxious/Worried', 'tired/Burned Out'], gameType: 'sound-sanctuary', difficulty: 'easy' },
  ],
  'Study': [
    { id: 'focus-sprint', title: 'Focus Sprint', description: 'Stay focused. You got this 💪', time: '5 mins', image: '', moodTag: ['tired/Burned Out', 'calm/Okay', 'stressed/Heavy'], gameType: 'focus-sprint', difficulty: 'medium' },
    { id: 'memory-flip', title: 'Memory Flip', description: 'Match pairs to exercise your brain', time: '3 mins', image: '', moodTag: ['happy/Energetic', 'calm/Okay'], gameType: 'memory', difficulty: 'medium' },
    { id: 'quick-quiz', title: 'Quick Quiz', description: 'Test your knowledge with 3 questions', time: '2 mins', image: '', moodTag: ['happy/Energetic', 'calm/Okay'], gameType: 'quiz', difficulty: 'easy' },
    { id: 'distraction-block', title: 'Distraction Block', description: 'Choose one distraction to avoid', time: '5 mins', image: '', moodTag: ['tired/Burned Out', 'stressed/Heavy'], gameType: 'focus', difficulty: 'hard' },
  ],
  'Fun': [
    { id: 'guess-sound', title: 'Guess the Sound', description: 'Listen and guess the sound', time: '3 mins', image: '', moodTag: ['happy/Energetic', 'calm/Okay'], gameType: 'sound', difficulty: 'easy' },
    { id: 'emoji-match', title: 'Mood Decode', description: 'Notice what you feel before it controls you.', time: '2 mins', image: '', moodTag: ['happy/Energetic', 'sad/Low'], gameType: 'matching', difficulty: 'easy' },
    { id: 'tap-star', title: 'Tap the Star', description: 'Tap as many stars as you can', time: '30 secs', image: '', moodTag: ['angry/Frustrated', 'stressed/Heavy', 'tired/Burned Out'], gameType: 'stars', difficulty: 'easy' },
    { id: 'spin-smile', title: 'Spin & Smile', description: 'Spin the wheel for a fun surprise', time: '1 min', image: '', moodTag: ['tired/Burned Out', 'sad/Low'], gameType: 'wheel', difficulty: 'easy' },
  ],
  'Quick Play': [
    { id: '60-second-breath', title: '60-Second Breath', description: 'One minute of mindful breathing', time: '1 min', image: '', moodTag: ['stressed/Heavy', 'angry/Frustrated', 'tired/Burned Out'], gameType: 'breathing', difficulty: 'easy' },
    { id: 'blink-break', title: 'Blink Break', description: 'Rest your eyes for 30 seconds', time: '30 secs', image: '', moodTag: ['tired/Burned Out', 'stressed/Heavy'], gameType: 'blink-break', difficulty: 'easy' },
    { id: 'one-thought-dump', title: 'One-Thought Dump', description: 'Write down one thought and let it go', time: '1 min', image: '', moodTag: ['stressed/Heavy', 'sad/Low', 'tired/Burned Out'], gameType: 'journal', difficulty: 'easy' },
  ],
};

// ========== EXPANDED FALLBACK SUGGESTIONS FOR EACH MOOD ==========
const moodFallbackSuggestions = {
  'happy/Energetic': [
    { title: 'Smile Challenge', description: 'Hold a gentle smile for 20 seconds', gameType: 'smile-challenge', difficulty: 'easy' },
    { title: 'Memory Flip', description: 'Match pairs to exercise your brain', gameType: 'memory', difficulty: 'medium' },
    { title: 'Quick Quiz', description: 'Test your knowledge with 3 questions', gameType: 'quiz', difficulty: 'easy' },
    { title: 'Mindful Match', description: 'Match emotions with their coping skills', gameType: 'mindful-match', difficulty: 'hard' },
    { title: 'Gratitude Catch', description: 'Catch falling blessings', gameType: 'gratitude-catch', difficulty: 'medium' },
  ],
  'calm/Okay': [
    { title: 'Breathe & Reset', description: 'Calm your mind with guided breathing', gameType: 'breathing', difficulty: 'easy' },
    { title: 'Gratitude Tap', description: 'Think of one good thing today', gameType: 'gratitude', difficulty: 'easy' },
    { title: 'Memory Flip', description: 'Match pairs to exercise your brain', gameType: 'memory', difficulty: 'medium' },
    { title: 'Sound Sanctuary', description: 'Create your perfect soundscape', gameType: 'sound-sanctuary', difficulty: 'easy' },
    { title: 'Color Calm', description: 'Color a mandala', gameType: 'color-calm', difficulty: 'easy' },
    { title: 'Mindful Match', description: 'Learn coping skills', gameType: 'mindful-match', difficulty: 'hard' },
  ],
  'stressed/Heavy': [
    { title: 'Breathe & Reset', description: 'Calm your mind with guided breathing', gameType: 'breathing', difficulty: 'easy' },
    { title: 'Calm Taps', description: 'Tap floating bubbles to relax', gameType: 'bubbles', difficulty: 'medium' },
    { title: '60-Second Breath', description: 'One minute of mindful breathing', gameType: 'breathing', difficulty: 'easy' },
    { title: 'One-Thought Dump', description: 'Write down one thought and let it go', gameType: 'journal', difficulty: 'easy' },
    { title: 'Breath Bubble', description: 'Follow the bubble\'s rhythm', gameType: 'breath-bubble', difficulty: 'easy' },
    { title: 'Sound Sanctuary', description: 'Mix calming sounds', gameType: 'sound-sanctuary', difficulty: 'easy' },
    { title: 'Color Calm', description: 'Color a mandala', gameType: 'color-calm', difficulty: 'easy' },
    { title: 'Affirmation Stack', description: 'Build positive beliefs', gameType: 'affirmation-stack', difficulty: 'easy' },
  ],
  'sad/Low': [
    { title: 'Gratitude Tap', description: 'Think of one good thing today', gameType: 'gratitude', difficulty: 'easy' },
    { title: 'Breathe & Reset', description: 'Calm your mind with guided breathing', gameType: 'breathing', difficulty: 'easy' },
    { title: 'Spin & Smile', description: 'Spin the wheel for a fun surprise', gameType: 'wheel', difficulty: 'easy' },
    { title: 'Gratitude Catch', description: 'Catch falling blessings', gameType: 'gratitude-catch', difficulty: 'medium' },
    { title: 'Affirmation Stack', description: 'Build a tower of positive beliefs', gameType: 'affirmation-stack', difficulty: 'easy' },
    { title: 'Smile Challenge', description: 'Hold a gentle smile', gameType: 'smile-challenge', difficulty: 'easy' },
    { title: 'One-Thought Dump', description: 'Write down one thought', gameType: 'journal', difficulty: 'easy' },
  ],
  'angry/Frustrated': [
    { title: 'Calm Taps', description: 'Tap floating bubbles to relax', gameType: 'bubbles', difficulty: 'medium' },
    { title: 'Tap the Star', description: 'Tap as many stars as you can', gameType: 'stars', difficulty: 'easy' },
    { title: '60-Second Breath', description: 'One minute of mindful breathing', gameType: 'breathing', difficulty: 'easy' },
    { title: 'Breath Bubble', description: 'Follow the bubble\'s rhythm', gameType: 'breath-bubble', difficulty: 'easy' },
    { title: 'Color Calm', description: 'Color a mandala', gameType: 'color-calm', difficulty: 'easy' },
    { title: 'Sound Sanctuary', description: 'Create calming sounds', gameType: 'sound-sanctuary', difficulty: 'easy' },
  ],
  'tired/Burned Out': [
    { title: 'Focus Sprint', description: 'Stay focused. You got this 💪', gameType: 'focus-sprint', difficulty: 'medium' },
    { title: 'Distraction Block', description: 'Choose one distraction to avoid', gameType: 'focus', difficulty: 'hard' },
    { title: 'Blink Break', description: 'Rest your eyes for 30 seconds', gameType: 'blink-break', difficulty: 'easy' },
    { title: 'Spin & Smile', description: 'Spin the wheel for a fun surprise', gameType: 'wheel', difficulty: 'easy' },
    { title: 'One-Thought Dump', description: 'Write down one thought and let it go', gameType: 'journal', difficulty: 'easy' },
    { title: 'Breathe & Reset', description: 'Calm your mind', gameType: 'breathing', difficulty: 'easy' },
    { title: 'Sound Sanctuary', description: 'Restorative sounds', gameType: 'sound-sanctuary', difficulty: 'easy' },
    { title: 'Gratitude Tap', description: 'One good thing', gameType: 'gratitude', difficulty: 'easy' },
  ],
};

// ========== SHUFFLING UTILITY FUNCTIONS ==========

// Fisher-Yates shuffle algorithm for true randomness
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get random subset of challenges (different each time)
const getRandomizedChallenges = (challenges, maxCount = 4) => {
  if (!challenges || challenges.length === 0) return [];
  const shuffled = shuffleArray(challenges);
  return shuffled.slice(0, Math.min(maxCount, shuffled.length));
};

// Get challenges with difficulty variety (easy/medium/hard mix)
const getBalancedChallenges = (challenges, maxCount = 4) => {
  if (!challenges || challenges.length === 0) return [];
  
  // Group by difficulty
  const easy = challenges.filter(c => c.difficulty === 'easy');
  const medium = challenges.filter(c => c.difficulty === 'medium');
  const hard = challenges.filter(c => c.difficulty === 'hard');
  
  const result = [];
  
  // Take 2 easy, 1 medium, 1 hard (if available)
  const shuffledEasy = shuffleArray(easy);
  const shuffledMedium = shuffleArray(medium);
  const shuffledHard = shuffleArray(hard);
  
  result.push(...shuffledEasy.slice(0, 2));
  result.push(...shuffledMedium.slice(0, 1));
  result.push(...shuffledHard.slice(0, 1));
  
  // If we don't have enough, fill with whatever is available
  if (result.length < maxCount) {
    const remaining = challenges.filter(c => !result.includes(c));
    const shuffledRemaining = shuffleArray(remaining);
    result.push(...shuffledRemaining.slice(0, maxCount - result.length));
  }
  
  return shuffleArray(result.slice(0, maxCount));
};

// Track shown challenges in localStorage to avoid repeats
const getPreviouslyShownChallenges = (moodValue) => {
  const key = `shown_challenges_${moodValue}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

const saveShownChallenges = (moodValue, challengeTitles) => {
  const key = `shown_challenges_${moodValue}`;
  const existing = getPreviouslyShownChallenges(moodValue);
  const updated = [...existing, ...challengeTitles].slice(-20); // Keep last 20
  localStorage.setItem(key, JSON.stringify(updated));
};

// Get challenges that haven't been shown recently
const getUnseenChallenges = (allAvailable, moodValue, maxCount = 4) => {
  const previouslyShown = getPreviouslyShownChallenges(moodValue);
  const unseen = allAvailable.filter(c => !previouslyShown.includes(c.title));
  
  if (unseen.length >= maxCount) {
    return getRandomizedChallenges(unseen, maxCount);
  } else {
    // If not enough unseen, mix unseen with some previously shown
    const shown = allAvailable.filter(c => previouslyShown.includes(c.title));
    const mixed = [...unseen, ...getRandomizedChallenges(shown, maxCount - unseen.length)];
    return getRandomizedChallenges(mixed, maxCount);
  }
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
  const [celebration, setCelebration] = useState(null);
  const [lastMoodDate, setLastMoodDate] = useState(null);
  
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
    { id: 'happy', label: 'Happy / Energetic', emoji: '😁', gradient: 'from-[#FFD978] to-[#FFF1C1]', textColor: 'text-amber-700', borderColor: 'border-blue-400', backendValue: 'happy/Energetic' },
    { id: 'calm', label: 'Calm / Okay', emoji: '😊', gradient: 'from-[#8CCBB9] to-[#E6F4F1]', textColor: 'text-emerald-700', borderColor: 'border-emerald-400', backendValue: 'calm/Okay' },
    { id: 'anger', label: 'Anger / Frustrated', emoji: '😤', gradient: 'from-[#F28B82] to-[#FCE8E6]', textColor: 'text-rose-800', borderColor: 'border-rose-400', backendValue: 'angry/Frustrated' },
    { id: 'stressed', label: 'Stressed / Heavy', emoji: '😰', gradient: 'from-[#A7B1C2] to-[#F1F3F4]', textColor: 'text-slate-600', borderColor: 'border-slate-400', backendValue: 'stressed/Heavy' },
    { id: 'sad', label: 'Sad / Low', emoji: '☹️', gradient: 'from-[#9CA3FF] to-[#E8E9FF]', textColor: 'text-indigo-800', borderColor: 'border-indigo-400', hasBar: true, backendValue: 'sad/Low' },
    { id: 'tired', label: 'Tired / Burned Out', emoji: '😫', gradient: 'from-[#FFAD5A] to-[#FFF0E0]', textColor: 'text-orange-800', borderColor: 'border-orange-400', backendValue: 'tired/Burned Out' }
  ];

  // Factors (What's affecting your mood)
  const factors = [
    { id: 'studies', label: 'Studies', icon: '📚', color: 'bg-[#CDE4B4] text-slate-800' },
    { id: 'sleep', label: 'Sleep', icon: '😴', color: 'bg-[#CEC2EB] text-slate-800' },
    { id: 'people', label: 'People', icon: '👥', color: 'bg-[#A6DEE5] text-slate-800' },
    { id: 'thoughts', label: 'Thoughts', icon: '🧠', color: 'bg-[#BCBFC2] text-slate-800' },
    { id: 'personal', label: 'Personal', icon: '💡', color: 'bg-[#E5D4B1] text-slate-800' },
  ];

  // Check if mood was logged today to show different suggestions
  useEffect(() => {
    const checkTodayMood = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      
      try {
        const response = await axios.get("http://localhost:5000/api/mood", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.length > 0) {
          const today = new Date().toDateString();
          const todayMood = response.data.find(m => new Date(m.createdAt).toDateString() === today);
          if (todayMood) {
            setLastMoodDate(today);
          }
        }
      } catch (error) {
        console.error("Error checking today's mood:", error);
      }
    };
    
    checkTodayMood();
  }, []);

  const showModal = (type, title, message) => {
    setModalState({ isOpen: true, type, title, message });
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
      prev.includes(factorId) ? prev.filter(id => id !== factorId) : [...prev, factorId]
    );
  };

  const getCategoryFromMood = (moodValue) => {
    return 'Mood Boost';
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showModal('error', 'Login Required', 'Please login first to save your mood and get personalized suggestions.');
        setIsSubmitting(false);
        return;
      }

      if (!selectedMood) {
        showModal('error', 'No Mood Selected', 'Please select a mood before continuing.');
        setIsSubmitting(false);
        return;
      }

      const selectedMoodData = moods.find(m => m.id === selectedMood);
      
      if (!selectedMoodData) {
        showModal('error', 'Invalid Selection', 'Please select a valid mood option.');
        setIsSubmitting(false);
        return;
      }

      const backendMoodValue = selectedMoodData.backendValue;

      // 1. Save mood to database
      await axios.post(
        "http://localhost:5000/api/mood",
        { mood: backendMoodValue, note: note || "" },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      // 2. Fetch and RANDOMIZE challenges based on mood
      let availableChallenges = [];
      
      try {
        const category = getCategoryFromMood(backendMoodValue);
        const challengesResponse = await axios.get(
          `http://localhost:5000/api/challenges/category/${encodeURIComponent(category)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (challengesResponse.data && challengesResponse.data.length > 0) {
          // Filter challenges that match the selected mood
          const moodMatchedChallenges = challengesResponse.data.filter(
            challenge => challenge.moodTag && challenge.moodTag.includes(backendMoodValue)
          );
          
          if (moodMatchedChallenges.length > 0) {
            availableChallenges = moodMatchedChallenges;
          } else {
            availableChallenges = challengesResponse.data;
          }
        } else {
          // Fallback to static challenges
          const staticChallenges = allChallenges['Mood Boost'] || [];
          availableChallenges = staticChallenges.filter(
            challenge => challenge.moodTag && challenge.moodTag.includes(backendMoodValue)
          );
        }
      } catch (challengeError) {
        console.error("Error fetching challenges:", challengeError);
        // Use mood-specific fallback suggestions
        const fallback = moodFallbackSuggestions[backendMoodValue] || moodFallbackSuggestions['calm/Okay'];
        availableChallenges = fallback;
      }

      // ========== SMART RANDOMIZATION LOGIC ==========
      
      // If no challenges found, use fallback
      if (!availableChallenges || availableChallenges.length === 0) {
        const fallback = moodFallbackSuggestions[backendMoodValue] || moodFallbackSuggestions['calm/Okay'];
        availableChallenges = fallback;
      }
      
      // Check if user already logged mood today - if yes, show different challenges
      const today = new Date().toDateString();
      const isSameDayMood = lastMoodDate === today;
      
      let randomizedChallenges;
      
      if (isSameDayMood) {
        // User already logged mood today - show completely different challenges
        // First try to get unseen challenges
        randomizedChallenges = getUnseenChallenges(availableChallenges, backendMoodValue, 4);
        
        // Add a special message for repeat mood
        showToast("✨ Here are some new challenges for you today!", 'success');
      } else {
        // First time logging mood today - show balanced variety
        randomizedChallenges = getBalancedChallenges(availableChallenges, 4);
      }
      
      // Ensure we have exactly 4 challenges (or less if not enough available)
      const finalChallenges = randomizedChallenges.slice(0, 4);
      
      // Save shown challenges to localStorage to avoid repeats in future
      const shownTitles = finalChallenges.map(c => c.title);
      saveShownChallenges(backendMoodValue, shownTitles);
      
      setSuggestedChallenges(finalChallenges);
      setSuggestions(finalChallenges.map(c => c.title));
      setShowSuggestions(true);
      
      // Update last mood date
      setLastMoodDate(today);
      
      showModal('success', 'Mood Saved! ✨', 'Your mood has been recorded. Check out your personalized challenges below.');

    } catch (error) {
      console.error("Error saving mood:", error);
      showModal('error', 'Error', error.response?.data?.message || 'Failed to save mood. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMoodData = moods.find(m => m.id === selectedMood);

  const handleComplete = async (challengeTitle) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showModal('error', 'Login Required', 'Please login first to complete challenges.');
        return;
      }

      const challengeObj = suggestedChallenges.find(c => c.title === challengeTitle);
      
      if (!challengeObj || !challengeObj._id) {
        setCompleted(prev => [...prev, challengeTitle]);
        setCelebration({ title: challengeTitle });
        return;
      }

      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { challengeId: challengeObj._id },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      
      setCompleted(prev => [...prev, challengeTitle]);
      setCelebration({ title: challengeTitle });
      showToast("Challenge completed! +5 Focus Points 🎉", 'success');

    } catch (error) {
      console.error("Error completing challenge:", error);
      setCompleted(prev => [...prev, challengeTitle]);
      setCelebration({ title: challengeTitle });
      showToast("Challenge completed!", 'success');
    }
  };

  const handlePlayChallenge = (challengeTitle) => {
    const challengeObj = suggestedChallenges.find(c => c.title === challengeTitle);
    
    if (!challengeObj) {
      console.error("Challenge not found:", challengeTitle);
      navigate("/challenges");
      return;
    }

    const gameRoutes = {
      'breathing': '/games/breathe',
      'gratitude': '/games/gratitude-tap',
      'smile-challenge': '/games/smile-challenge',
      'bubbles': '/games/calm-taps',
      'focus-sprint': '/games/focus-sprint',
      'memory': '/games/memory-flip',
      'quiz': '/games/quick-quiz',
      'focus': '/games/distraction-block',
      'sound': '/games/guess-sound',
      'matching': '/games/emoji-match',
      'stars': '/games/tap-star',
      'wheel': '/games/spin-wheel',
      'timer': '/games/timer',
      'blink-break': '/games/blink-break',
      'journal': '/games/one-thought',
      'breath-bubble': '/games/breath-bubble',
      'gratitude-catch': '/games/gratitude-catch',
      'mindful-match': '/games/mindful-match',
      'affirmation-stack': '/games/affirmation-stack',
      'color-calm': '/games/color-calm',
      'sound-sanctuary': '/games/sound-sanctuary',
    };

    const route = gameRoutes[challengeObj.gameType] || '/games/timer';
    navigate(route, { state: { challenge: challengeObj } });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col font-sans">
      <Navbar />

      {/* Celebration Modal */}
      {celebration && (
        <Celebration 
          challengeTitle={celebration.title}
          onComplete={() => setCelebration(null)}
        />
      )}

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

          {/* Factors Section */}
          {showFactors && selectedMood && !showSuggestions && (
            <div id="factors-section" className="animate-in fade-in slide-in-from-bottom-10 duration-700 max-w-4xl mx-auto">
              <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-12 border border-slate-50">
                
                <div className="flex items-center justify-center gap-3 mb-10">
                  <span className="text-4xl">{selectedMoodData?.emoji}</span>
                  <h2 className="text-2xl font-bold text-slate-800">
                    What's affecting your mood?
                  </h2>
                </div>
                
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

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
                    {error}
                  </div>
                )}

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

                {selectedFactors.length > 0 && (
                  <div className="mt-6 text-sm text-slate-500 text-center">
                    Selected: {selectedFactors.map(f => factors.find(c => c.id === f)?.label).join(' • ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggestions Section */}
          {showSuggestions && suggestions.length > 0 && (
            <div id="suggestions-section" className="mt-16 bg-white p-10 rounded-3xl shadow-xl max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-serif text-slate-800 mb-2">
                    Today's Challenges
                  </h2>
                  <p className="text-slate-500">
                    Based on your {selectedMoodData?.label} mood
                  </p>
                  {lastMoodDate === new Date().toDateString() && (
                    <p className="text-xs text-indigo-500 mt-1">
                      ✨ Fresh challenges for today!
                    </p>
                  )}
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
                        {challengeObj?.difficulty && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            challengeObj.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            challengeObj.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {challengeObj.difficulty}
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
              
              <div className="mt-8 p-6 bg-indigo-50 rounded-xl text-center">
                <p className="text-indigo-800 text-lg font-medium">
                  {completed.length > 0 
                    ? `🎉 Nice job! You've completed ${completed.length} challenge${completed.length !== 1 ? 's' : ''} today.`
                    : "✨ Ready to start your first challenge?"}
                </p>
                <p className="text-sm text-indigo-600 mt-2">
                  Zenly uses your daily challenges to help you feel better step-by-step.
                </p>
                
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

              {/* Find Psychiatrist Section */}
              <div className="mt-10 pt-6 border-t border-slate-100">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 shadow-md">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                        <span className="text-3xl">👨‍⚕️</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-purple-800 mb-1">
                          Need Professional Support?
                        </h3>
                        <p className="text-purple-600">
                          Connect with licensed psychiatrists for personalized guidance
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/psychiatrists')}
                      className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition transform hover:scale-105 shadow-lg whitespace-nowrap flex items-center gap-2"
                    >
                      Find Psychiatrists
                      <span className="text-xl">→</span>
                    </button>
                  </div>
                </div>
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
            document.getElementById('suggestions-section')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
};

export default MoodPage;