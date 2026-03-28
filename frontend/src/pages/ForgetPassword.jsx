import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, X } from "lucide-react";

// Custom Modal Component
const CustomModal = ({ isOpen, onClose, type, title, message }) => {
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
            <button onClick={onClose} className={`w-full bg-gradient-to-r ${bgColor} text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all`}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'error',
    title: '',
    message: ''
  });

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const showModal = (type, title, message) => {
    setModalState({ isOpen: true, type, title, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showModal('error', 'Missing Email', 'Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await API.post("/auth/forgot-password", { email });
      
      showModal(
        'success',
        'Reset Link Sent! ✉️',
        data.message || "If an account exists with this email, you'll receive password reset instructions."
      );
      
      setEmail("");
    } catch (error) {
      showModal(
        'error',
        'Request Failed',
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-purple-50 py-12">
          <div className="max-w-md w-full px-4">
            {/* Back to Login Link */}
            <Link to="/login" className="inline-flex items-center text-teal-600 hover:text-teal-800 mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>

            {/* Forgot Password Card */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-600 to-purple-600 rounded-2xl shadow-lg mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
                <p className="text-gray-600 text-sm">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-teal-700 hover:to-purple-700 focus:ring-4 focus:ring-teal-200 transition-all disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </div>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </button>
              </form>

              {/* Security Note */}
              <div className="mt-6 p-4 bg-teal-50 rounded-xl">
                <p className="text-xs text-teal-700 text-center">
                  🔒 We'll never share your email. This helps keep your account secure.
                </p>
              </div>
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
      />
    </>
  );
}

export default ForgotPassword;