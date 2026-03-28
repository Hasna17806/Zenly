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

  const BLINK_GOAL = 20;

  useEffect(() => {
    let interval;

    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
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
  };

  const handleBlink = () => {
    if (isActive) {
      setBlinkCount((prev) => prev + 1);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        {
          challengeId: challenge?._id,
          blinks: blinkCount
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate("/challenges");
    } catch (error) {
      console.error("Completion error:", error);
      setErrorMsg("Could not complete challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50">
      <Navbar />

      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">

          <h1 className="text-4xl font-bold mb-4 text-blue-700">
            Blink Break
          </h1>

          <p className="text-slate-600 mb-10">
            Give your eyes a quick refresh after screen time
          </p>

          {/* Start Screen */}
          {!isActive && !completed && (
            <button
              onClick={startGame}
              className="px-12 py-6 bg-blue-600 text-white rounded-2xl text-2xl hover:bg-blue-700 transition"
            >
              Start
            </button>
          )}

          {/* Game Screen */}
          {isActive && (
            <div className="space-y-8">

              <div className="text-6xl font-bold text-blue-600">
                {timer}s
              </div>

              <div className="text-xl">
                Blinks: <span className="font-bold">{blinkCount}</span>
              </div>

              <p className="text-gray-500">
                Goal: {BLINK_GOAL} blinks
              </p>

              <button
                onClick={handleBlink}
                className="text-8xl hover:scale-110 transition transform active:scale-95"
              >
                👁️
              </button>

            </div>
          )}

          {/* Completed Screen */}
          {completed && (
            <div className="space-y-8">

              <div className="text-6xl animate-bounce">✨</div>

              <h2 className="text-3xl font-bold text-green-600">
                Eyes Refreshed!
              </h2>

              <p className="text-xl">
                You blinked <span className="font-bold">{blinkCount}</span> times
              </p>

              {blinkCount >= BLINK_GOAL ? (
                <p className="text-green-600 font-semibold">
                  Great job! Your eyes got a healthy break 👁️
                </p>
              ) : (
                <p className="text-yellow-600">
                  Try reaching {BLINK_GOAL} next time for maximum benefit.
                </p>
              )}

              {errorMsg && (
                <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-center gap-4">

                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl"
                >
                  Try Again
                </button>

                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl disabled:opacity-50"
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