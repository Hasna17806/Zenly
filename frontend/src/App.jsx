import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import MoodPage from './pages/MoodPage';
import ProtectedRoute from './components/ProtectedRoute';
import ChallengesPage from './pages/ChallengesPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import UserPsychiatrists from './pages/UserPsychiatrists';
import UserAppointments from './pages/UserAppointments';
import SessionChat from './pages/SessionChat';
import NotificationsPage from './pages/NotificationsPage';
import ProgressPage from './pages/ProgressPage';
import PsychiatristReviews from './pages/PsychiatristReviews';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import "./utils/axiosConfig";

// game components
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
import BreathBubbleGame from "./pages/games/BreathBubbleGame";
import GratitudeCatchGame from "./pages/games/GratitudeCatchGame";
import MindfulMatchGame from "./pages/games/MindfulMatchGame";
import AffirmationStackGame from "./pages/games/AffirmationStackGame";
import ColorCalmGame from "./pages/games/ColorCalmGame";
import SoundSanctuaryGame from "./pages/games/SoundSanctuaryGame";
import RecallRushGame from './pages/games/RecallRushGame';
import OneShotMathGame from './pages/games/OneShotMathGame';
import FlashMemoryGame from './pages/games/FlashMemoryGame';
import CatchTheMoodGame from './pages/games/CatchTheMoodGame';
import MemeReactionGame from './pages/games/MemeReactionGame';
import SpeedSortGame from './pages/games/SpeedSortGame';
import TapRushGame from './pages/games/TapRushGame';


// Admin
import AdminLayout from './layout/AdminLayout';
import AdminLogin from './adminPages/AdminLogin';
import AdminDashboard from './adminPages/AdminDashboard';
import AdminUsers from './adminPages/AdminUsers';
import AdminPsychiatrists from './adminPages/AdminPsychiatrists';
import AdminSettings from './adminPages/AdminSettings';
import AdminChallenges from './adminPages/AdminChallenges';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminReviews from './adminPages/AdminReviews';
import AdminPayments from './adminPages/AdminPayments';

// Psychiatrist
import PsychiatristLogin from './pages/psychiatristLogin';
import PsychiatristDashboard from './pages/PsychiatristDashboard';
import PsychiatristAppointments from './pages/PsychiatristAppointments';
import PsychiatristProfile from './pages/PsychiatristProfile';
import PsychiatristSession from './pages/PsychiatristSession';
import ProtectedPsychiatristRoute from './components/ProtectedPsychiatristRoute';
import MyPsychiatrists from './pages/MyPsychiatrists';
import PsychiatristChatPage from './pages/PsychiatristChatPage';
import PsychiatristAvailability from './pages/PsychiatristAvailability';
import PatientProgress from './components/PatientProgress';
import PsychiatristPatients from './pages/PsychiatristPatients';
import PsychiatristEarnings from './pages/PsychiatristEarnings';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Password Reset Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* User Protected Routes */}
        <Route path="/mood" element={<ProtectedRoute><MoodPage /></ProtectedRoute>} />
        <Route path="/challenges" element={<ProtectedRoute><ChallengesPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/psychiatrists" element={<ProtectedRoute><UserPsychiatrists /></ProtectedRoute>} />
        <Route path="/my-appointments" element={<ProtectedRoute><UserAppointments /></ProtectedRoute>} />
        <Route path="/session/:appointmentId" element={<ProtectedRoute><SessionChat /></ProtectedRoute>} />
        <Route path="/my-psychiatrists" element={<ProtectedRoute><MyPsychiatrists /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
        <Route path="/psychiatrist-reviews/:psychiatristId" element={<ProtectedRoute><PsychiatristReviews /></ProtectedRoute>} />
        <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/payment-cancel" element={<ProtectedRoute><PaymentCancel /></ProtectedRoute>} />

        {/* Games */}
        <Route path="/games/breathe" element={<ProtectedRoute><BreathingGame /></ProtectedRoute>} />
        <Route path="/games/gratitude-tap" element={<ProtectedRoute><GratitudeTapGame /></ProtectedRoute>} />
        <Route path="/games/smile-challenge" element={<ProtectedRoute><SmileChallengeGame /></ProtectedRoute>} />
        <Route path="/games/calm-taps" element={<ProtectedRoute><CalmTapsGame /></ProtectedRoute>} />
        <Route path="/games/focus-sprint" element={<ProtectedRoute><FocusSprintGame /></ProtectedRoute>} />
        <Route path="/games/memory-flip" element={<ProtectedRoute><MemoryFlipGame /></ProtectedRoute>} />
        <Route path="/games/quick-quiz" element={<ProtectedRoute><QuickQuizGame /></ProtectedRoute>} />
        <Route path="/games/distraction-block" element={<ProtectedRoute><DistractionBlockGame /></ProtectedRoute>} />
        <Route path="/games/guess-sound" element={<ProtectedRoute><GuessSoundGame /></ProtectedRoute>} />
        <Route path="/games/emoji-match" element={<ProtectedRoute><EmojiMatchGame /></ProtectedRoute>} />
        <Route path="/games/tap-star" element={<ProtectedRoute><TapStarGame /></ProtectedRoute>} />
        <Route path="/games/spin-wheel" element={<ProtectedRoute><SpinWheelGame /></ProtectedRoute>} />
        <Route path="/games/60-second-breath" element={<ProtectedRoute><SixtySecondBreathGame /></ProtectedRoute>} />
        <Route path="/games/blink-break" element={<ProtectedRoute><BlinkBreakGame /></ProtectedRoute>} />
        <Route path="/games/one-thought" element={<ProtectedRoute><OneThoughtGame /></ProtectedRoute>} />
        <Route path="/games/timer" element={<ProtectedRoute><TimerGame /></ProtectedRoute>} />
        <Route path="/games/breath-bubble" element={<ProtectedRoute><BreathBubbleGame /></ProtectedRoute>} />
        <Route path="/games/gratitude-catch" element={<ProtectedRoute><GratitudeCatchGame /></ProtectedRoute>} />
        <Route path="/games/mindful-match" element={<ProtectedRoute><MindfulMatchGame /></ProtectedRoute>} />
        <Route path="/games/affirmation-stack" element={<ProtectedRoute><AffirmationStackGame /></ProtectedRoute>} />
        <Route path="/games/color-calm" element={<ProtectedRoute><ColorCalmGame /></ProtectedRoute>} />
        <Route path="/games/sound-sanctuary" element={<ProtectedRoute><SoundSanctuaryGame /></ProtectedRoute>} />
        <Route path="/games/brain-sprint" element={<ProtectedRoute><OneShotMathGame /></ProtectedRoute>} />
        <Route path="/games/word-builder" element={<ProtectedRoute><SpeedSortGame /></ProtectedRoute>} />
        <Route path="/games/meme-reaction" element={<ProtectedRoute><MemeReactionGame /></ProtectedRoute>} />
        <Route path="/games/weird-quiz" element={<ProtectedRoute><RecallRushGame /></ProtectedRoute>} />
        <Route path="/games/tap-burst" element={<ProtectedRoute><TapRushGame /></ProtectedRoute>} />
        <Route path="/games/color-rush" element={<ProtectedRoute><ColorCalmGame /></ProtectedRoute>} />
        <Route path="/games/mini-memory" element={<ProtectedRoute><FlashMemoryGame /></ProtectedRoute>} />
        <Route path="/games/catch-the-mood" element={<ProtectedRoute><CatchTheMoodGame/></ProtectedRoute>} />

        {/* ================= ADMIN SECTION ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="psychiatrists" element={<AdminPsychiatrists />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="challenges" element={<AdminChallenges />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        {/* ================= PSYCHIATRIST SECTION ================= */}
        <Route path="/psychiatrist/login" element={<PsychiatristLogin />} />
        <Route 
          path="/psychiatrist/dashboard" 
          element={
            <ProtectedPsychiatristRoute>
              <PsychiatristDashboard />
            </ProtectedPsychiatristRoute>
          } 
        />
        <Route 
          path="/psychiatrist/appointments" 
          element={
            <ProtectedPsychiatristRoute>
              <PsychiatristAppointments />
            </ProtectedPsychiatristRoute>
          } 
        />
        <Route 
          path="/psychiatrist/chats" 
          element={
            <ProtectedPsychiatristRoute>
              <PsychiatristChatPage />
            </ProtectedPsychiatristRoute>
          } 
        />
        <Route 
          path="/psychiatrist/profile" 
          element={
            <ProtectedPsychiatristRoute>
              <PsychiatristProfile />
            </ProtectedPsychiatristRoute>
          } 
        />
        <Route 
          path="/psychiatrist/session/:appointmentId" 
          element={
            <ProtectedPsychiatristRoute>
              <PsychiatristSession />
            </ProtectedPsychiatristRoute>
          } 
        />
        <Route 
          path="/psychiatrist/availability" 
          element={
            <ProtectedPsychiatristRoute>
              <PsychiatristAvailability />
            </ProtectedPsychiatristRoute>
          } 
        />
        <Route 
          path="/psychiatrist/patients" 
          element={
            <ProtectedPsychiatristRoute>
              <PsychiatristPatients />
            </ProtectedPsychiatristRoute>
          } 
        />
        <Route 
          path="/psychiatrist/patient-progress/:patientId" 
          element={
            <ProtectedPsychiatristRoute>
              <PatientProgress />
            </ProtectedPsychiatristRoute>
          } 
        />
        <Route 
          path="/psychiatrist/earnings" 
          element={
            <ProtectedPsychiatristRoute>
              <PsychiatristEarnings />
            </ProtectedPsychiatristRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;