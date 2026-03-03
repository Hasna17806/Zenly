import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MoodPage from './pages/MoodPage';
import ProtectedRoute from './components/ProtectedRoute';
import ChallengesPage from './pages/ChallengesPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';

// Import all 15 game components
import BreathingGame from './pages/games/BreathingGame';
import GratitudeTapGame from './pages/games/GratitudeTapGame';
import SmileChallengeGame from './pages/games/SmileChallengeGame';
import CalmTapsGame from './pages/games/CalmTapsGame';
import FocusSprintGame from './pages/games/FocusSprintGame';
import MemoryFlipGame from './pages/games/MemoryFlipGame';
import QuickQuizGame from './pages/games/QuickQuizGame';
import DistractionBlockGame from './pages/games/DistractionBlockGame';
import GuessSoundGame from './pages/games/GuessSoundGame';
import EmojiMatchGame from './pages/games/EmojiMatchGame';
import TapStarGame from './pages/games/TapStarGame';
import SpinWheelGame from './pages/games/SpinWheelGame';
import SixtySecondBreathGame from './pages/games/SixtySecondBreathGame';
import BlinkBreakGame from './pages/games/BlinkBreakGame';
import OneThoughtGame from './pages/games/OneThoughtGame';
import TimerGame from './pages/games/TimerGame';

// Admin Routes
import AdminLogin from './adminPages/AdminLogin';
import AdminDashboard from './adminPages/AdminDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route path="/mood" element={<ProtectedRoute><MoodPage /></ProtectedRoute>} />
        <Route path="/challenges" element={<ProtectedRoute><ChallengesPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* All 15 Game Routes */}
        
        {/* Mood Boost */}
        <Route path="/games/breathe" element={<ProtectedRoute><BreathingGame /></ProtectedRoute>} />
        <Route path="/games/gratitude-tap" element={<ProtectedRoute><GratitudeTapGame /></ProtectedRoute>} />
        <Route path="/games/smile-challenge" element={<ProtectedRoute><SmileChallengeGame /></ProtectedRoute>} />
        <Route path="/games/calm-taps" element={<ProtectedRoute><CalmTapsGame /></ProtectedRoute>} />
        
        {/* Study */}
        <Route path="/games/focus-sprint" element={<ProtectedRoute><FocusSprintGame /></ProtectedRoute>} />
        <Route path="/games/memory-flip" element={<ProtectedRoute><MemoryFlipGame /></ProtectedRoute>} />
        <Route path="/games/quick-quiz" element={<ProtectedRoute><QuickQuizGame /></ProtectedRoute>} />
        <Route path="/games/distraction-block" element={<ProtectedRoute><DistractionBlockGame /></ProtectedRoute>} />
        
        {/* Fun */}
        <Route path="/games/guess-sound" element={<ProtectedRoute><GuessSoundGame /></ProtectedRoute>} />
        <Route path="/games/emoji-match" element={<ProtectedRoute><EmojiMatchGame /></ProtectedRoute>} />
        <Route path="/games/tap-star" element={<ProtectedRoute><TapStarGame /></ProtectedRoute>} />
        <Route path="/games/spin-wheel" element={<ProtectedRoute><SpinWheelGame /></ProtectedRoute>} />
        
        {/* Quick Play */}
        <Route path="/games/60-second-breath" element={<ProtectedRoute><SixtySecondBreathGame /></ProtectedRoute>} />
        <Route path="/games/blink-break" element={<ProtectedRoute><BlinkBreakGame /></ProtectedRoute>} />
        <Route path="/games/one-thought" element={<ProtectedRoute><OneThoughtGame /></ProtectedRoute>} />
        
        {/* Timer (fallback) */}
        <Route path="/games/timer" element={<ProtectedRoute><TimerGame /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;