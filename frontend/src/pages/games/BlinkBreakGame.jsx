import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const BlinkBreakGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = location.state?.challenge;

  const [timer, setTimer] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [completed, setCompleted] = useState(false);
  const [phase, setPhase] = useState(1);

  const BLINK_GOAL = 20;

  useEffect(() => {
    let interval;

    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (isActive) {
      if (timer <= 30 && timer > 20) {
        setPhase(1); // Blink
      } else if (timer <= 20 && timer > 10) {
        setPhase(2); // Look away
      } else if (timer <= 10 && timer > 0) {
        setPhase(3); // Focus reset
      }
    }

    if (timer === 0 && isActive) {
      setIsActive(false);
      setCompleted(true);
    }

    return () => clearInterval(interval);
  }, [isActive, timer]);

  const startGame = () => {
    setTimer(30);
    setBlinkCount(0);
    setCompleted(false);
    setIsActive(true);
    setErrorMsg("");
    setPhase(1);
  };

  const handleBlink = () => {
    if (isActive && phase === 1) {
      setBlinkCount((prev) => prev + 1);
    }
  };

  const handleComplete = async () => {
  try {
    setLoading(true);
    setErrorMsg("");

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const challengeId = challenge?._id;

    console.log("Challenge data:", challenge);
    console.log("Sending DB challengeId:", challengeId);

    if (!challengeId) {
      setErrorMsg(
        "This challenge is not linked to the database yet. Please add Blink Break in admin challenges first."
      );
      return;
    }

    if (!token) {
      setErrorMsg("You are not logged in. Please login and try again.");
      return;
    }

    const response = await axios.post(
      "http://localhost:5000/api/completed-challenges",
      { challengeId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Completion response:", response.data);

    setTimeout(() => navigate("/challenges"), 2000);
  } catch (error) {
    console.error("Error completing challenge:", error);
    console.log("Backend error response:", error.response?.data);

    setErrorMsg(
      error.response?.data?.message ||
        "Could not complete challenge. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  const progress = ((30 - timer) / 30) * 100;

  const getPhaseContent = () => {
    switch (phase) {
      case 1:
        return {
          title: "Phase 1: Blink Gently 👁️",
          instruction: "Tap the eye each time you blink naturally.",
          action: (
            <button
              onClick={handleBlink}
              className="text-8xl hover:scale-110 transition transform active:scale-95"
            >
              👁️
            </button>
          ),
        };
      case 2:
        return {
          title: "Phase 2: Look Away 🌿",
          instruction:
            "Take your eyes off the screen and look at something far away.",
          action: (
            <div className="text-7xl animate-pulse">🌿</div>
          ),
        };
      case 3:
        return {
          title: "Phase 3: Focus Reset 🎯",
          instruction:
            "Take a deep breath and focus on the dot below for a few seconds.",
          action: (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          ),
        };
      default:
        return {};
    }
  };

  const phaseContent = getPhaseContent();

  const wellnessScore =
    blinkCount >= BLINK_GOAL ? 100 : Math.min(100, Math.round((blinkCount / BLINK_GOAL) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-cyan-50 to-teal-50">
      <Navbar />

      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center bg-white/80 backdrop-blur-md shadow-xl rounded-3xl p-8 border border-blue-100">

          <h1 className="text-4xl font-bold mb-4 text-blue-700">
            Blink + Focus Reset
          </h1>

          <p className="text-slate-600 mb-8">
            A quick eye refresh and mental reset for tired students
          </p>

          {!isActive && !completed && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-2xl p-6 text-left shadow-sm">
                <h3 className="text-xl font-semibold text-blue-700 mb-3">
                  What this helps with:
                </h3>
                <ul className="text-slate-600 space-y-2">
                  <li>👁️ Reduces eye strain</li>
                  <li>🧠 Gives your brain a short reset</li>
                  <li>🌿 Helps you feel less overwhelmed</li>
                  <li>📚 Prepares you to focus again</li>
                </ul>
              </div>

              <button
                onClick={startGame}
                className="px-12 py-5 bg-blue-600 text-white rounded-2xl text-2xl hover:bg-blue-700 transition shadow-lg"
              >
                Start Refresh
              </button>
            </div>
          )}

          {isActive && (
            <div className="space-y-8">

              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="text-5xl font-bold text-blue-600">
                {timer}s
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-blue-700 mb-3">
                  {phaseContent.title}
                </h2>
                <p className="text-slate-600 mb-6">{phaseContent.instruction}</p>

                <div className="flex justify-center">{phaseContent.action}</div>
              </div>

              <div className="text-lg">
                Blinks: <span className="font-bold text-blue-700">{blinkCount}</span>
              </div>

              <p className="text-gray-500">
                Blink Goal: {BLINK_GOAL}
              </p>
            </div>
          )}

          {completed && (
            <div className="space-y-8">

              <div className="text-6xl animate-bounce">✨</div>

              <h2 className="text-3xl font-bold text-green-600">
                Refresh Complete!
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-5 rounded-2xl shadow-sm">
                  <p className="text-sm text-gray-500">Total Blinks</p>
                  <p className="text-3xl font-bold text-green-700">{blinkCount}</p>
                </div>

                <div className="bg-blue-50 p-5 rounded-2xl shadow-sm">
                  <p className="text-sm text-gray-500">Wellness Score</p>
                  <p className="text-3xl font-bold text-blue-700">{wellnessScore}%</p>
                </div>
              </div>

              {blinkCount >= BLINK_GOAL ? (
                <p className="text-green-600 font-semibold text-lg">
                  Great job! Your eyes and mind got a healthy reset 👁️🧠
                </p>
              ) : (
                <p className="text-yellow-600 text-lg">
                  Nice try! You still gave your brain and eyes a useful break 🌿
                </p>
              )}

              <div className="bg-cyan-50 rounded-2xl p-5 text-left shadow-sm">
                <h3 className="font-semibold text-cyan-700 mb-2">
                  Zenly Tip 💡
                </h3>
                <p className="text-slate-600">
                  After every 20–30 minutes of study, take a 30-second visual reset like this to reduce fatigue and improve focus.
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                  Try Again
                </button>

                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl disabled:opacity-50 hover:bg-green-700 transition"
                >
                  {loading ? "Saving..." : "Complete Challenge"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlinkBreakGame;