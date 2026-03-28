import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Lock, ArrowLeft, CheckCircle, AlertCircle, X, Eye, EyeOff } from "lucide-react";

// Custom Modal Component
const CustomModal = ({ isOpen, onClose, type, title, message, onAction }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl animate-slide-up">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <div className="p-8 text-center">
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${bgColor} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <button 
              onClick={onAction || onClose} 
              className={`w-full bg-gradient-to-r ${bgColor} text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all`}
            >
              {isSuccess ? "Go to Login" : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'error',
    title: '',
    message: ''
  });
  
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Verify token validity when component mounts
    const verifyToken = async () => {
      try {
        await API.get(`/auth/verify-reset-token/${token}`);
        setIsValidToken(true);
      } catch (error) {
        setIsValidToken(false);
        showModal(
          'error',
          'Invalid or Expired Link',
          'This password reset link is invalid or has expired. Please request a new one.'
        );
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const showModal = (type, title, message) => {
    setModalState({ isOpen: true, type, title, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showModal('error', 'Password Mismatch', 'Passwords do not match. Please try again.');
      return;
    }

    if (password.length < 6) {
      showModal('error', 'Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await API.post(`/auth/reset-password/${token}`, { password });
      
      showModal(
        'success',
        'Password Reset Successful! 🎉',
        'Your password has been updated successfully. You can now login with your new password.'
      );

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      showModal(
        'error',
        'Reset Failed',
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <>
        <div className="min-h-screen bg-white flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600 mb-6">This password reset link has expired or is invalid.</p>
              <Link 
                to="/forgot-password" 
                className="inline-flex items-center text-teal-600 hover:text-teal-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Request New Reset Link
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-purple-50 py-12">
          <div className="max-w-md w-full px-4">
            <Link to="/login" className="inline-flex items-center text-teal-600 hover:text-teal-800 mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-600 to-purple-600 rounded-2xl shadow-lg mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Set New Password</h1>
                <p className="text-gray-600 text-sm">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                  <p className="text-xs font-medium text-gray-700 mb-2">Password must:</p>
                  <ul className="space-y-1">
                    <li className={`text-xs flex items-center ${password.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{password.length >= 6 ? '✓' : '○'}</span>
                      Be at least 6 characters long
                    </li>
                    <li className={`text-xs flex items-center ${password === confirmPassword && password ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{password === confirmPassword && password ? '✓' : '○'}</span>
                      Match the confirmation password
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !password || !confirmPassword}
                  className="w-full bg-gradient-to-r from-teal-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-teal-700 hover:to-purple-700 focus:ring-4 focus:ring-teal-200 transition-all disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting Password...
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <CustomModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onAction={() => {
          closeModal();
          if (modalState.type === 'success') {
            navigate('/login');
          }
        }}
      />
    </>
  );
}

export default ResetPassword;