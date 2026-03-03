import { useEffect, useState } from "react";
import axios from "axios";
import { Timer, X, CheckCircle, AlertCircle, Play, Pause, RotateCcw, Save } from "lucide-react";

const FocusTimerModal = ({ isOpen, onClose }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Timer effect
  useEffect(() => {
    let interval;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  // Format time
  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Save to backend
  const saveSession = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        setErrorMessage("You must be logged in to save sessions");
        setShowErrorModal(true);
        return;
      }

      await axios.post(
        "http://localhost:5000/api/focus",
        { duration: seconds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowSuccessModal(true);
      handleReset();
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.message || "Error saving session");
      setShowErrorModal(true);
    }
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Timer Modal */}
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

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
              <div className="flex items-center gap-3 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Timer className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold">Focus Session</h2>
                  <p className="text-white/80 text-sm">Stay focused, one breath at a time</p>
                </div>
              </div>
            </div>

            {/* Timer Display */}
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="text-7xl font-bold font-mono bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {formatTime()}
                </div>
                <p className="text-gray-500 mt-2">Elapsed time</p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${Math.min((seconds / 3600) * 100, 100)}%` }}
                />
              </div>

              {/* Control Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    className="col-span-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-4 rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all hover:scale-105"
                  >
                    <Play className="w-5 h-5" />
                    Start
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="col-span-1 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-200 transition-all hover:scale-105"
                  >
                    <Pause className="w-5 h-5" />
                    Pause
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="col-span-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-all hover:scale-105"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={saveSession}
                  className="col-span-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-4 rounded-xl hover:shadow-lg hover:shadow-green-200 transition-all hover:scale-105"
                >
                  <Save className="w-5 h-5" />
                  Finish
                </button>

                <button
                  onClick={onClose}
                  className="col-span-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-all hover:scale-105"
                >
                  <X className="w-5 h-5" />
                  Close
                </button>
              </div>

              {/* Session info */}
              {seconds > 0 && (
                <p className="text-center text-sm text-gray-500 mt-6">
                  {Math.floor(seconds / 60)} minute{Math.floor(seconds / 60) !== 1 ? 's' : ''} of focus
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all animate-slide-up">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">
                  Session Saved! 🎉
                </h3>
                <p className="text-gray-600 mb-6">
                  Great job! You've completed {Math.floor(seconds / 60)} minute{Math.floor(seconds / 60) !== 1 ? 's' : ''} of focused work.
                </p>
                <div className="bg-green-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-green-700">
                    ✓ Session logged to your progress tracker
                  </p>
                </div>
                <button
                  onClick={handleCloseSuccessModal}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-4 rounded-xl hover:shadow-lg hover:shadow-green-200 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowErrorModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all animate-slide-up">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">
                  Oops! Something went wrong
                </h3>
                <p className="text-gray-600 mb-6">
                  {errorMessage}
                </p>
                <div className="bg-red-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-red-700">
                    ✨ Don't worry, your focus time is still counting
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowErrorModal(false)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-4 rounded-xl hover:shadow-lg hover:shadow-red-200 transition-all"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      setShowErrorModal(false);
                      onClose();
                    }}
                    className="flex-1 border border-gray-200 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
};

export default FocusTimerModal;