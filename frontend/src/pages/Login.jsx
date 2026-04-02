import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import { auth, googleProvider } from "../firebase/config";

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
                  ✨ Welcome back! Your wellness journey continues.
                </p>
              </div>
            ) : (
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-700">
                  Please check your credentials and try again.
                </p>
              </div>
            )}

            <button
              onClick={onAction || onClose}
              className={`w-full bg-gradient-to-r ${bgColor} text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all hover:scale-105`}
            >
              {isSuccess ? "Continue to Dashboard" : "Try Again"}
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

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Modal states
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'error',
    title: '',
    message: ''
  });
  
  const navigate = useNavigate();

  // Rotating quotes for student wellbeing
  const quotes = [
    {
      text: "You've already survived 100% of your worst days. You're stronger than you think.",
      author: "Zenly"
    },
    {
      text: "Taking a break is not a sign of weakness, it's a sign of wisdom. Rest is productive.",
      author: "Unknown"
    },
    {
      text: "Your present circumstances don't determine where you can go; they merely determine where you start.",
      author: "Nido Qubein"
    },
    {
      text: "Healing is not linear. Some days you'll take two steps forward, some days you'll take one step back. Both are progress.",
      author: "Zenly"
    },
    {
      text: "You are not your mistakes. You are not your struggles. You are here, and you are trying - that's what matters.",
      author: "Unknown"
    },
    {
      text: "The bravest thing you can do is show up for yourself, even on days when you don't feel like it.",
      author: "Zenly"
    },
    {
      text: "Every breath is a second chance. Every day is a new beginning.",
      author: "Unknown"
    }
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Rotate quotes every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const showModal = (type, title, message) => {
    setModalState({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const handleSuccessfulLogin = (data, userEmail, userName) => {
    const token = data.token || data.user?.token;

    if (!token) {
      console.error("No token received from backend!");
      return;
    }

    if (rememberMe) {
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", userEmail);
      if (userName) {
        localStorage.setItem("userName", userName);
      }
    } else {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("userEmail", userEmail);
      if (userName) {
        sessionStorage.setItem("userName", userName);
      }
    }

    console.log("TOKEN SAVED:", localStorage.getItem("token") || sessionStorage.getItem("token"));

    showModal(
      'success',
      'Welcome Back! 🎉',
      `Great to see you again${userName ? ', ' + userName : ''}! You've been missed.`
    );

    // Navigate after showing success message
    setTimeout(() => {
      closeModal();
      navigate("/");
    }, 2000);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      showModal(
        'error',
        'Missing Information',
        'Please fill in all fields to continue.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await API.post("/auth/login", {  
        email,
        password,
      });

      console.log("LOGIN SUCCESS:", data);
      handleSuccessfulLogin(data, email, data.user?.name || data.name);

    } catch (error) {
      console.error("Login error:", error);
      showModal(
        'error',
        'Login Failed',
        error.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("Google Sign-In button clicked");
    setGoogleLoading(true);
    setError("");

    try {
      // Check if auth and googleProvider are properly initialized
      if (!auth || !googleProvider) {
        console.error("Firebase auth or provider not initialized");
        showModal('error', 'Configuration Error', 'Firebase not properly configured. Please contact support.');
        setGoogleLoading(false);
        return;
      }

      console.log("Attempting to sign in with popup...");
      
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Sign-in successful!", result);
      
      // Get the Google user info
      const user = result.user;
      console.log("User data:", {
        email: user.email,
        name: user.displayName,
        uid: user.uid,
        photoURL: user.photoURL
      });

      // Send the Google user data to your backend
      console.log("Sending to backend...");
      const { data } = await API.post("/auth/google-login", {
        email: user.email,
        name: user.displayName,
        googleId: user.uid,
        photoURL: user.photoURL
      });

      console.log("Backend response:", data);
      handleSuccessfulLogin(data, user.email, user.displayName);

    } catch (error) {
      console.error("Detailed Google Sign-In error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      let errorMessage = "Failed to sign in with Google. Please try again.";
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in popup was closed. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Pop-up was blocked by your browser. Please allow pop-ups and try again.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Another popup is already open. Please close it and try again.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for Firebase. Please check Firebase console settings.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Google Sign-In is not enabled. Please contact support.";
      } else if (error.response) {
        errorMessage = error.response.data?.message || "Server error. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showModal('error', 'Google Sign-In Failed', errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        
        <div className="flex-grow flex">
          {/* Left side - Image with wellbeing quotes */}
          <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
            {/* Background gradient overlay - calming colors for wellbeing */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-600/90 to-purple-600/90 z-10"></div>
            
            {/* Main Image - Calming nature/wellbeing image */}
            <img 
              src="https://res.cloudinary.com/dkqjn6dqw/image/upload/v1771826417/download_30_jzw0qw.jpg" 
              alt="Peaceful meditation and mindfulness" 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay content with rotating quotes */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
              {/* Animated quote container */}
              <div className="max-w-lg transition-all duration-1000 ease-in-out transform">
                <div className="relative">
                  {/* Quote icon */}
                  <svg className="absolute -top-6 -left-6 w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  
                  {/* Quote text */}
                  <p className="text-2xl font-light leading-relaxed mb-4">
                    "{quotes[currentQuoteIndex].text}"
                  </p>
                  
                  {/* Author */}
                  <p className="text-lg font-medium text-white/80 text-right">
                    — {quotes[currentQuoteIndex].author}
                  </p>
                </div>
                
                {/* Quote indicators */}
                <div className="flex justify-center mt-8 space-x-2">
                  {quotes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuoteIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentQuoteIndex 
                          ? 'w-8 bg-white' 
                          : 'w-2 bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Zenly features for wellbeing */}
              <div className="absolute bottom-12 left-12 right-12">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm">Track emotions</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-sm">Improve focus</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-sm">Mood challenges</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="text-sm">Professional support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-teal-50 via-white to-purple-50">
            <div className="max-w-md w-full mb-90">
              {/* Logo/Brand Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-600 to-purple-600 rounded-2xl shadow-lg mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back to Zenly</h1>
                <p className="text-gray-600">Continue your wellness journey</p>
              </div>

              {/* Login Card */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={submitHandler} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H8m12 0a4 4 0 01-4 4H8a4 4 0 01-4-4V8a4 4 0 014-4h8a4 4 0 014 4v4z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none"
                        placeholder="Password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                        Remember for 30 days
                      </span>
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-teal-600 hover:text-teal-800 hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-teal-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-teal-700 hover:to-purple-700 focus:ring-4 focus:ring-teal-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Welcoming you back...
                      </div>
                    ) : (
                      "Continue Your Journey"
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all duration-200 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-2">Connecting...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                {/* Sign Up Link */}
                <p className="mt-6 text-center text-gray-600">
                  New to Zenly?{" "}
                  <Link to="/signup" className="text-teal-600 hover:text-teal-800 font-medium hover:underline">
                    Start your wellness journey
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

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
            navigate("/");
          }
        }}
      />
    </>
  );
}

export default Login;