import { useState, useRef } from "react";
import axios from "axios";
import { Timer, X, CheckCircle, Play, Pause, RotateCcw, Save } from "lucide-react";

const FocusTimerModal = ({ isOpen, onClose }) => {
  const [time, setTime] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const intervalRef = useRef(null);

  // Start timer
  const startTimer = () => {
    if (intervalRef.current) return;
    
    intervalRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    setIsActive(true);
  };

  // Pause timer
  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
  };

  // Reset timer
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTime(0);
    setIsActive(false);
  };

  // Format time display
  const formatTime = () => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Save session
  const saveSession = async () => {
    if (time === 0) {
      alert("Please focus for at least a few seconds!");
      return;
    }

    setIsSaving(true);
    
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!token) {
        alert("Please login again");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/focus",
        { duration: time },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Stop timer and show success
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setShowSuccess(true);
      
    } catch (error) {
      console.error(error);
      alert("Failed to save session. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTime(0);
    setIsActive(false);
    onClose();
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    closeModal();
  };

  if (!isOpen) return null;

  const minutes = Math.floor(time / 60);

  return (
    <>
      {/* Timer Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Timer className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Focus Session</h2>
            </div>
            <button onClick={closeModal} className="p-1 hover:bg-white/20 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Timer Display */}
          <div className="p-8 text-center">
            <div className="text-7xl font-mono font-bold text-gray-800 mb-2">
              {formatTime()}
            </div>
            <p className="text-gray-500 text-sm">Elapsed time</p>
            
            {time > 0 && (
              <p className="text-sm text-purple-600 mt-2 font-medium">
                {minutes} minute{minutes !== 1 ? 's' : ''} of focus
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="p-6 pt-0 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {!isActive ? (
                <button
                  onClick={startTimer}
                  className="col-span-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> Start
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="col-span-1 bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
              )}
              
              <button
                onClick={resetTimer}
                className="col-span-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              
              <button
                onClick={saveSession}
                disabled={time === 0 || isSaving}
                className={`col-span-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                  time > 0
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Finish
                  </>
                )}
              </button>
            </div>
            
            <button
              onClick={closeModal}
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md mx-4 p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Session Saved! 🎉</h3>
            <p className="text-gray-600 mb-4">
              Great job! You've completed {minutes} minute{minutes !== 1 ? 's' : ''} of focused work.
            </p>
            <div className="bg-green-50 rounded-xl p-3 mb-6">
              <p className="text-sm text-green-700">✓ Session logged to your progress tracker</p>
            </div>
            <button
              onClick={closeSuccess}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FocusTimerModal;