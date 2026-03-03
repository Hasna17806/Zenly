import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Smile, Timer, MessageCircle, TrendingUp,
  ChevronRight, Sparkles, Users, Clock, Award, Activity,
  Brain, Zap, Calendar, Bell, BookOpen, Shield,
  Moon, Sun, Wind, Leaf, Heart, ArrowRight, Play,
  CheckCircle, Star, BarChart2, Headphones, Lock,
  Compass, Target, Volume2, X
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FocusTimerModal from "../components/FocusTimerModal";

/* ─────────────────────────────────────────────
   Custom Modal Component
───────────────────────────────────────────── */
const CustomModal = ({ isOpen, onClose, feature, onAction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
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
          <div className="p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div 
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
                style={{ background: feature.lightBg, color: feature.accent }}
              >
                {feature.icon}
              </div>
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">
                Unlock {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description || "Create a free account to access this feature and start your wellness journey."}
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Free account includes:</p>
                  <p className="text-sm text-gray-600">✓ Mood tracking • Focus sessions • Progress analytics</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onClose();
                  onAction();
                }}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-4 rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all hover:scale-105"
              >
                Sign up free
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all"
              >
                Later
              </button>
            </div>

            {/* Trust indicator */}
            <p className="text-xs text-gray-400 text-center mt-4">
              ✨ No credit card required • 30-second setup
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
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

/* ─────────────────────────────────────────────
   Counter component
───────────────────────────────────────────── */
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const num = parseInt(target.replace(/\D/g, ""), 10);
        const duration = 1500;
        const step = Math.ceil(num / (duration / 16));
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + step, num);
          setCount(current);
          if (current >= num) clearInterval(timer);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Testimonial data
───────────────────────────────────────────── */
const testimonials = [
  {
    quote: "Zenly helped me understand that my study habits were tied to my mood. My grades went up by a full letter.",
    name: "Priya S.",
    role: "2nd Year, Computer Science",
    rating: 5,
    avatar: "P"
  },
  {
    quote: "The Focus Sessions actually work. I stopped procrastinating and started finishing assignments on time.",
    name: "James K.",
    role: "3rd Year, Psychology",
    rating: 5,
    avatar: "J"
  },
  {
    quote: "I love the mood check-ins. They're quick and they actually changed how I approach stressful days.",
    name: "Aisha M.",
    role: "1st Year, Pre-Med",
    rating: 5,
    avatar: "A"
  }
];

/* ─────────────────────────────────────────────
   Main Home Component
───────────────────────────────────────────── */
function Home() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [time, setTime] = useState(new Date());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openTimer, setOpenTimer] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  
  // Modal states
  const [modalState, setModalState] = useState({
    isOpen: false,
    feature: null
  });

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const features = [
    {
      icon: <Smile className="w-8 h-8" />,
      title: "Mood Check-in",
      desc: "Track emotional patterns with daily check-ins. Understand triggers and build self-awareness over time.",
      tag: "Emotional IQ",
      link: "/mood",
      accent: "#6366f1",
      lightBg: "#eef2ff",
      emoji: "😊",
      locked: !isLoggedIn,
      gradient: "from-indigo-500 to-indigo-600",
      description: "Track your daily mood and get personalized insights about your emotional patterns."
    },
    {
      icon: <Timer className="w-8 h-8" />,
      title: "Focus Sessions",
      desc: "Pomodoro-style study sprints tailored to how you're feeling — energized or gentle pacing when you're low.",
      tag: "Deep Work",
      link: "/focus",
      accent: "#0ea5e9",
      lightBg: "#f0f9ff",
      emoji: "⏱️",
      locked: !isLoggedIn,
      gradient: "from-sky-500 to-sky-600",
      action: () => setOpenTimer(true),
      description: "Access personalized study sprints and track your focus time with our Pomodoro timer."
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Support Chat",
      desc: "A private space to journal, vent, or reflect. No judgment — just clarity and calm.",
      tag: "Safe Space",
      link: "/chat",
      accent: "#10b981",
      lightBg: "#f0fdf4",
      emoji: "💬",
      locked: !isLoggedIn,
      gradient: "from-emerald-500 to-emerald-600",
      description: "Journal your thoughts in a private, judgment-free space."
    },
    {
      icon: <BarChart2 className="w-8 h-8" />,
      title: "Progress Tracker",
      desc: "Visualize weekly mood trends, study streaks, and growth. Data that actually motivates.",
      tag: "Analytics",
      link: "/progress",
      accent: "#f59e0b",
      lightBg: "#fffbeb",
      emoji: "📈",
      locked: !isLoggedIn,
      gradient: "from-amber-500 to-amber-600",
      description: "Visualize your progress with beautiful charts and insights."
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Calm Sounds",
      desc: "Lo-fi beats, white noise, and focus playlists that adapt to your current mood setting.",
      tag: "NEW",
      link: "/sounds",
      accent: "#8b5cf6",
      lightBg: "#f5f3ff",
      emoji: "🎵",
      locked: !isLoggedIn,
      gradient: "from-violet-500 to-violet-600",
      description: "Listen to focus-enhancing sounds and music tailored to your mood."
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Wellness Goals",
      desc: "Set micro-habits — sleep targets, water intake, break reminders — and watch them compound.",
      tag: "Habits",
      link: "/wellness",
      accent: "#ec4899",
      lightBg: "#fdf2f8",
      emoji: "🌱",
      locked: !isLoggedIn,
      gradient: "from-pink-500 to-pink-600",
      description: "Build healthy habits with personalized wellness goals and reminders."
    }
  ];

  // Handle feature click
  const handleFeatureClick = (feature) => {
    // If feature has a custom action (like opening timer)
    if (feature.action) {
      if (isLoggedIn) {
        feature.action();
      } else {
        openModal(feature);
      }
      return;
    }
    
    // If logged in and feature has a link, navigate
    if (isLoggedIn && feature.link) {
      navigate(feature.link);
      return;
    }
    
    // Otherwise show modal
    openModal(feature);
  };

  const openModal = (feature) => {
    setModalState({
      isOpen: true,
      feature: feature
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      feature: null
    });
  };

  const handleModalAction = () => {
    navigate("/signup");
  };

  const handleMoodCheck = () => {
    if (isLoggedIn) {
      navigate("/mood");
    } else {
      openModal(features.find(f => f.title === "Mood Check-in"));
    }
  };

  const handleFocusSession = () => {
    if (isLoggedIn) {
      setOpenTimer(true);
    } else {
      openModal(features.find(f => f.title === "Focus Sessions"));
    }
  };

  const hourStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const isDay = time.getHours() >= 6 && time.getHours() < 20;

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }

        .font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-gradient {
          background: radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                      linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);
        }

        .feature-card {
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 30px 40px -20px rgba(0, 0, 0, 0.3);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .float { animation: float 6s ease-in-out infinite; }
        .float-delayed { animation: float 6s ease-in-out 2s infinite; }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        
        .pulse-ring {
          animation: pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; }
        .animate-slide-up-delay-1 { animation: slideUp 0.8s ease-out 0.2s forwards; opacity: 0; }
        .animate-slide-up-delay-2 { animation: slideUp 0.8s ease-out 0.4s forwards; opacity: 0; }
        .animate-slide-up-delay-3 { animation: slideUp 0.8s ease-out 0.6s forwards; opacity: 0; }

        .grain-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { 
          background: linear-gradient(180deg, #6366f1, #8b5cf6);
          border-radius: 4px; 
        }
      `}</style>

      <div className="min-h-screen flex flex-col font-body bg-white">
        <Navbar />

        <main className="flex-grow">

          {/* HERO SECTION */}
<section className="hero-gradient grain-overlay relative min-h-screen flex items-center overflow-hidden">
  {/* Animated background elements */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
  </div>

  {/* Grid overlay */}
  <div className="absolute inset-0 opacity-20" style={{
    backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)",
    backgroundSize: "40px 40px"
  }} />

  <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 py-24 w-full grid lg:grid-cols-2 gap-16 items-center">

    {/* Left Content */}
    <div className="space-y-8">
      <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-sm font-semibold text-white/90 tracking-wider">Student Wellbeing Platform</span>
      </div>

      <div className="space-y-4">
        <h1 className="font-heading text-6xl lg:text-7xl xl:text-8xl leading-[1.1] text-white font-bold">
          {isLoggedIn ? (
            <>
              Ready to<br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                focus today?
              </span>
            </>
          ) : (
            <>
              Ready for a<br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                better study day?
              </span>
            </>
          )}
        </h1>
        <p className="text-xl text-white/70 max-w-xl leading-relaxed font-light">
          <span className="text-white font-semibold tracking-widest">ZENLY</span> connects your emotional state to your study strategy — so every session counts.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-row flex-wrap gap-4 pt-4">
        {isLoggedIn ? (
          <>
            <button
              onClick={handleMoodCheck}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3.5 rounded-2xl font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Smile className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Check Today's Mood</span>
            </button>

            <button
              onClick={handleFocusSession}
              className="group inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3.5 rounded-2xl font-semibold text-base transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <Timer className="w-4 h-4" />
              <span>Start Focus Session</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/signup")}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3.5 rounded-2xl font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Sparkles className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Get Started — It's Free</span>
            </button>

            {/* <button
              // onClick={() => navigate("/login")}
              className="group inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3.5 rounded-2xl font-semibold text-base transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <span>Login</span>
            </button> */}
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/10">
        {[
          { val: "1000", suffix: "+", label: "Active Students", icon: Users },
          { val: "5000", suffix: "+", label: "Focus Sessions", icon: Timer },
          { val: "4.8", suffix: "/5", label: "User Rating", icon: Star },
          { val: "95", suffix: "%", label: "Report Growth", icon: TrendingUp }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <Icon className="w-4 h-4 text-indigo-400" />
                <p className="text-3xl font-bold text-white">
                  {i === 2 ? stat.val : <><Counter target={stat.val} />{stat.suffix}</>}
                </p>
              </div>
              <p className="text-sm text-white/50 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>

    {/* Right - Floating cards (unchanged) */}
    <div className="relative hidden lg:flex flex-col gap-6 items-end">
      {/* Time widget */}
      <div className="float w-72 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            {isDay ? <Sun className="w-7 h-7 text-white" /> : <Moon className="w-7 h-7 text-white" />}
          </div>
          <div>
            <p className="text-3xl font-bold text-white tabular-nums">{hourStr}</p>
            <p className="text-white/60 text-sm font-medium">{isDay ? "Prime study hours" : "Time to recharge"}</p>
          </div>
        </div>
      </div>

      {/* Mood card */}
      <div className="float-delayed relative w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Today's Vibe</p>
            <p className="text-white font-bold text-2xl">Feeling Calm 🌿</p>
          </div>
          <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* Mood selector */}
        <div className="flex gap-2 mb-6">
          {["😫", "😔", "😐", "😊", "🤩"].map((emoji, i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${
                i === 3
                  ? "bg-emerald-400/30 ring-2 ring-emerald-400/60 scale-110"
                  : "bg-white/5 hover:bg-white/20"
              }`}
            >
              {emoji}
            </div>
          ))}
        </div>

        {/* Progress bars */}
        <div className="space-y-3">
          {[
            { label: "Focus", value: 78, color: "#6366f1" },
            { label: "Energy", value: 55, color: "#10b981" },
            { label: "Stress", value: 30, color: "#f59e0b" }
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/60 text-xs font-medium">{item.label}</span>
                <span className="text-white/80 text-xs font-semibold">{item.value}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
                  style={{ width: `${item.value}%`, background: item.color }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak card */}
      <div className="float w-72 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border border-indigo-400/30 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-orange-400/20 rounded-xl flex items-center justify-center">
              <Zap className="w-7 h-7 text-orange-400" />
            </div>
            <div className="pulse-ring absolute inset-0 rounded-xl border-2 border-orange-400/40" />
          </div>
          <div>
            <p className="text-white font-bold text-2xl">7-day streak</p>
            <p className="text-white/60 text-sm font-medium">🔥 You're on fire! Keep going</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

          {/* FEATURES SECTION */}
          <section id="features" className="py-28 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-16">

              {/* Section header */}
              <div className="text-center mb-20 space-y-4">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-bold text-indigo-600 tracking-wide">FEATURES</span>
                </div>
                <h2 className="font-heading text-5xl md:text-6xl text-gray-900 font-bold leading-tight">
                  Study Based on <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">How You Feel</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Six tools built around your emotional state — because the best study strategy starts from within.
                </p>
              </div>

              {/* Features grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    onClick={() => handleFeatureClick(feature)}
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    className="feature-card group relative bg-white rounded-3xl p-8 border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-2xl overflow-hidden"
                  >
                    {/* Gradient background on hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    />

                    {/* Lock indicator */}
                    {feature.locked && (
                      <div className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                    )}

                    {/* Icon */}
                    <div className="relative mb-6">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
                        style={{ background: feature.lightBg, color: feature.accent }}
                      >
                        {feature.icon}
                      </div>
                    </div>

                    {/* Tag */}
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className="text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full"
                        style={{ background: feature.lightBg, color: feature.accent }}
                      >
                        {feature.tag}
                      </span>
                      {feature.tag === "NEW" && (
                        <span className="bg-gradient-to-r from-green-400 to-emerald-400 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                          HOT
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-heading text-2xl font-bold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-base leading-relaxed mb-6">
                      {feature.desc}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 font-semibold text-base transition-all" style={{ color: feature.accent }}>
                      {feature.locked ? (
                        <>
                          <span>Join to access</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </>
                      ) : (
                        <>
                          <span>Try now</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </div>

                    {/* Animated border */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 w-0 group-hover:w-full transition-all duration-500 rounded-b-3xl"
                      style={{ background: `linear-gradient(90deg, ${feature.accent}, transparent)` }}
                    />
                  </div>
                ))}
              </div>

              {/* CTA for visitors */}
              {!isLoggedIn && (
                <div className="text-center mt-16">
                  <button
                    onClick={() => navigate("/signup")}
                    className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-200 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Sparkles className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Create free account</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-base text-gray-500 mt-4">✨ No credit card required • 30-second setup</p>
                </div>
              )}
            </div>
          </section>

          {/* HOW IT WORKS - Timeline */}
          <section className="py-28 bg-white">
            <div className="max-w-5xl mx-auto px-6 lg:px-16">
              <div className="text-center mb-20 space-y-4">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-100 to-blue-100 px-4 py-2 rounded-full">
                  <Compass className="w-4 h-4 text-sky-600" />
                  <span className="text-sm font-bold text-sky-600 tracking-wide">JOURNEY</span>
                </div>
                <h2 className="font-heading text-5xl md:text-6xl text-gray-900 font-bold leading-tight">
                  Three Steps to a <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Calmer Day</span>
                </h2>
              </div>

              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200 lg:transform lg:-translate-x-1/2" />

                {[
                  {
                    step: "01",
                    icon: <Smile className="w-8 h-8" />,
                    title: "Check in with yourself",
                    desc: "Open Zenly and take 30 seconds to rate your mood, energy, and stress. No overthinking — just honest.",
                    color: "#6366f1",
                    gradient: "from-indigo-500 to-indigo-600",
                    side: "left",
                    benefits: ["Quick 30-second check-in", "Track emotional patterns", "Build self-awareness"]
                  },
                  {
                    step: "02",
                    icon: <Brain className="w-8 h-8" />,
                    title: "Get a personalized plan",
                    desc: "Zenly reads your state and suggests the right session type, playlist, and duration for you right now.",
                    color: "#0ea5e9",
                    gradient: "from-sky-500 to-sky-600",
                    side: "right",
                    benefits: ["AI-powered recommendations", "Adaptive study plans", "Mood-based suggestions"]
                  },
                  {
                    step: "03",
                    icon: <TrendingUp className="w-8 h-8" />,
                    title: "Study, track, grow",
                    desc: "Complete your session, log notes, and watch your mood and productivity improve week over week.",
                    color: "#10b981",
                    gradient: "from-emerald-500 to-emerald-600",
                    side: "left",
                    benefits: ["Progress analytics", "Streak tracking", "Weekly insights"]
                  }
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`relative flex items-start gap-8 mb-20 last:mb-0 ${
                      item.side === "right" ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Dot with pulse effect */}
                    <div className="absolute left-8 lg:left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full border-4 border-white shadow-xl z-10" style={{ background: item.color, top: "2rem" }}>
                      <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ background: item.color }} />
                    </div>

                    {/* Content card */}
                    <div className={`ml-20 lg:ml-0 lg:w-5/12 ${
                      item.side === "right" ? "lg:mr-auto" : "lg:ml-auto"
                    }`}>
                      <div className="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                        {/* Header with step number */}
                        <div className={`flex items-center gap-4 mb-4 ${
                          item.side === "right" ? "lg:flex-row-reverse" : ""
                        }`}>
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            {item.icon}
                          </div>
                          <span className="text-7xl font-black text-gray-100 font-heading">{item.step}</span>
                        </div>

                        {/* Content */}
                        <h3 className="font-heading text-2xl font-bold text-gray-800 mb-3 group-hover:text-gray-900">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                          {item.desc}
                        </p>

                        {/* Benefits list */}
                        <ul className="space-y-2">
                          {item.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-gray-600">
                              <CheckCircle className="w-5 h-5" style={{ color: item.color }} />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* STUDY SMARTER - Dark Section */}
          <section className="relative py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                opacity: 0.2
              }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 grid lg:grid-cols-2 gap-20 items-center">

              {/* Left content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-bold text-white/90 tracking-wide">WHY ZENLY</span>
                </div>

                <h2 className="font-heading text-5xl md:text-6xl text-white font-bold leading-tight">
                  Study Smarter.<br />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Feel Better.
                  </span>
                </h2>

                <p className="text-xl text-gray-300 leading-relaxed">
                  Zenly isn't just a timer or a journal — it's a feedback loop between your emotions and your performance.
                </p>

                {/* Feature grid */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {[
                    { icon: Shield, text: "100% Private", color: "#6366f1", desc: "Your data stays yours" },
                    { icon: Bell, text: "Smart Nudges", color: "#0ea5e9", desc: "Know when to take breaks" },
                    { icon: Wind, text: "Breathwork", color: "#10b981", desc: "Grounding exercises" },
                    { icon: Calendar, text: "Weekly Reports", color: "#f59e0b", desc: "Track your progress" }
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: item.color + "20", color: item.color }}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-white font-semibold">{item.text}</span>
                        </div>
                        <p className="text-sm text-gray-400">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => isLoggedIn ? navigate("/suggestions") : openModal(features[0])}
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Get personalized suggestion</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Right - Image with floating elements */}
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur-3xl animate-pulse" />

                <img
                  src="https://res.cloudinary.com/dkqjn6dqw/image/upload/v1771911129/Gemini_Generated_Image_trkgr6trkgr6trkg_npk9d4.png"
                  alt="Peaceful meditation"
                  className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover border-4 border-white/10"
                />

                {/* Floating cards */}
                <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl p-4 shadow-2xl max-w-[250px] animate-bounce">
                  {/* <div className="flex items-center gap-2 mb-2">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div> */}
                  <p className="text-gray-700 text-base font-medium italic leading-relaxed">
                    "You're doing great — one breath at a time."
                  </p>
                  <p className="text-sm text-gray-500 mt-2 font-semibold">— Zenly Daily</p>
                </div>

                <div className="absolute -top-8 -right-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-6 h-6 text-white" />
                    <div>
                      <p className="text-white font-bold text-lg">528 Hz</p>
                      <p className="text-white/80 text-xs">Frequency</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="py-28 bg-gradient-to-b from-white to-indigo-50/30">
            <div className="max-w-5xl mx-auto px-6 lg:px-16">

              {/* Section header */}
              <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full">
                  <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                  <span className="text-sm font-bold text-amber-600 tracking-wide">TESTIMONIALS</span>
                </div>
                <h2 className="font-heading text-5xl md:text-6xl text-gray-900 font-bold leading-tight">
                  Loved by <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Students</span>
                </h2>
              </div>

              {/* Testimonial carousel */}
              <div className="relative">
                {/* Background decoration */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-50" />

                <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 lg:p-16">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className={`transition-all duration-500 ${
                        index === activeTestimonial ? "opacity-100 translate-x-0" : "opacity-0 absolute inset-0 pointer-events-none translate-x-10"
                      }`}
                    >
                      {/* Quote mark */}
                      <div className="text-8xl font-serif text-indigo-200 leading-none mb-4">"</div>

                      <p className="font-heading text-3xl lg:text-4xl text-gray-800 leading-relaxed mb-8">
                        {testimonial.quote}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                            {testimonial.avatar}
                          </div>
                          <div>
                            <p className="font-heading text-xl font-bold text-gray-800">{testimonial.name}</p>
                            <p className="text-gray-500 text-base">{testimonial.role}</p>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Navigation dots */}
                  <div className="flex justify-center gap-3 mt-8">
                    {testimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveTestimonial(i)}
                        className={`transition-all duration-300 rounded-full ${
                          i === activeTestimonial
                            ? "w-12 h-3 bg-gradient-to-r from-indigo-500 to-purple-500"
                            : "w-3 h-3 bg-gray-200 hover:bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ABOUT SECTION */}
          <section className="py-28 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-16">
              <div className="grid lg:grid-cols-2 gap-20 items-center">

                {/* Left - Image with stats */}
                <div className="relative order-2 lg:order-1">
                  <div className="absolute -inset-6 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-3xl blur-3xl" />

                  <img
                    src="https://res.cloudinary.com/dkqjn6dqw/image/upload/v1771914001/Gemini_Generated_Image_b7fai9b7fai9b7fa_ogtkdn.png"
                    alt="Students collaborating"
                    className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover border-4 border-white"
                  />

                  {/* Stats badges */}
                <div className="absolute top-6 -right-6 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
  <p className="text-4xl font-bold text-gray-900">1,000<span className="text-indigo-500">+</span></p>
  <p className="text-gray-500 text-sm mt-1 font-medium">Active Students</p>
  <div className="flex -space-x-2 mt-3">
    {/* Profile 1 - Using real profile images */}
    <img 
      src="https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772343843/497-4973038_profile-picture-circle-png-transparent-png_fxpc4b.png" 
      alt="Student profile" 
      className="w-8 h-8 rounded-full border-2 border-white shadow-lg object-cover hover:scale-110 transition-transform"
    />
    <img 
      src="https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772343855/circle-photo_qdfgns.jpg" 
      alt="Student profile" 
      className="w-8 h-8 rounded-full border-2 border-white shadow-lg object-cover hover:scale-110 transition-transform"
    />
    <img 
      src="https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772343938/round_profile_picture_og_image-removebg-preview_amqaq8.png" 
      alt="Student profile" 
      className="w-8 h-8 rounded-full border-2 border-white shadow-lg object-cover hover:scale-110 transition-transform"
    />
    <img 
      src="https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772343868/Screenshot_2026-01-07_173606_ikavwn.png" 
      alt="Student profile" 
      className="w-8 h-8 rounded-full border-2 border-white shadow-lg object-cover hover:scale-110 transition-transform"
    />
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">
      +999
    </div>
  </div>
</div>

                  <div className="absolute bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-5 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">95%</p>
                        <p className="text-sm text-gray-500">Report improvement</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right - Content */}
                <div className="space-y-8 order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full">
                    <Heart className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-600 tracking-wide">OUR STORY</span>
                  </div>

                  <h2 className="font-heading text-5xl md:text-6xl text-gray-900 font-bold leading-tight">
                    Built by students,<br />
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      for students
                    </span>
                  </h2>

                  <p className="text-xl text-gray-600 leading-relaxed">
                    Zenly was born from a simple observation — students thrive when their emotional well-being is prioritized. We believe every student has good days and tough days, and both are part of the journey.
                  </p>

                  {/* Values grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Heart, label: "Compassionate", desc: "Kindness first approach" },
                      { icon: Shield, label: "Private & Safe", desc: "Your data stays yours" },
                      { icon: Leaf, label: "Science-backed", desc: "Research-based methods" },
                      { icon: Users, label: "Community", desc: "Supportive environment" }
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <Icon className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="font-semibold text-gray-800">{item.label}</span>
                          </div>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quote */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                    <p className="font-heading text-xl text-gray-700 italic leading-relaxed">
                      "It's okay to slow down — you're still moving forward."
                    </p>
                  </div>

                  {/* CTA */}
                  {!isLoggedIn && (
                    <button
                      onClick={() => navigate("/signup")}
                      className="group inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-200"
                    >
                      <Users className="w-5 h-5" />
                      <span>Join the community</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* CTA BANNER */}
          {!isLoggedIn && (
            <section className="relative py-24 overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  opacity: 0.2
                }} />
              </div>

              {/* Floating orbs */}
              <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

              <div className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-8">
                <h2 className="font-heading text-5xl md:text-6xl text-white font-bold leading-tight">
                  Start your journey today
                </h2>
                <p className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                  Join 1,000+ students who've transformed their study habits and found balance with Zenly.
                </p>

                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button
                    onClick={() => navigate("/signup")}
                    className="group relative inline-flex items-center gap-3 bg-white text-indigo-600 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Play className="w-5 h-5 fill-current relative z-10" />
                    <span className="relative z-10">Get Started — it's free</span>
                  </button>

                  <button
                    onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                    className="group inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Learn more</span>
                  </button>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-8 pt-8">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-white/60" />
                    <span className="text-white/60 text-sm">No credit card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-white/60" />
                    <span className="text-white/60 text-sm">30-second setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-white/60" />
                    <span className="text-white/60 text-sm">Join 1k+ students</span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>

      {/* Custom Modal */}
      <CustomModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        feature={modalState.feature || { 
          icon: <Sparkles className="w-8 h-8" />, 
          title: "Feature", 
          lightBg: "#eef2ff", 
          accent: "#6366f1",
          description: "Create a free account to access this feature and start your wellness journey."
        }}
        onAction={handleModalAction}
      />

      {/* Focus Timer Modal */}
      <FocusTimerModal
        isOpen={openTimer}
        onClose={() => setOpenTimer(false)}
      />
    </>
  );
}

export default Home;