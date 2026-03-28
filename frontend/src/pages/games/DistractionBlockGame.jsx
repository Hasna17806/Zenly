import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const DistractionBlockGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = location.state?.challenge;

  const [step, setStep] = useState("choose");
  const [selectedDistraction, setSelectedDistraction] = useState(null);
  const [timer, setTimer] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [showTip, setShowTip] = useState(false);

  const distractions = [
    {
      id: "phone",
      name: "Phone",
      description: "Put your phone face down and keep it silent.",
      tip: "Keeping it out of sight reduces the urge to check it."
    },
    {
      id: "social",
      name: "Social Media",
      description: "Close social media tabs during the focus session.",
      tip: "Five minutes away can help reset your attention."
    },
    {
      id: "games",
      name: "Games",
      description: "Avoid gaming until the focus timer ends.",
      tip: "Rewards feel better after productive work."
    },
    {
      id: "chatting",
      name: "Chatting",
      description: "Pause conversations temporarily.",
      tip: "Let others know you're focusing for a few minutes."
    },
    {
      id: "music",
      name: "Music with Lyrics",
      description: "Switch to instrumental music.",
      tip: "Instrumental music helps maintain concentration."
    },
    {
      id: "browser",
      name: "Random Browsing",
      description: "Close unnecessary browser tabs.",
      tip: "A clean workspace improves focus."
    }
  ];

  const focusQuotes = [
    "Focus on one task at a time.",
    "Consistency builds discipline.",
    "Small sessions of focus lead to big progress.",
    "Your attention is your strongest tool.",
    "Stay present with the task in front of you."
  ];

  const [quote] = useState(
    focusQuotes[Math.floor(Math.random() * focusQuotes.length)]
  );

  useEffect(() => {
    let interval;

    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setStep("complete");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const startFocus = () => {
    if (!selectedDistraction) return;

    setTimer(300);
    setStep("focus");
    setIsActive(true);
  };

  const stopChallenge = () => {
    setIsActive(false);
    setStep("choose");
    setTimer(300);
    setInterruptions(0);
  };

  const backToChallenges = () => {
    navigate("/challenges");
  };

  const handleInterruption = () => {
    setInterruptions(prev => prev + 1);
    setShowTip(true);

    setTimeout(() => {
      setShowTip(false);
    }, 2500);
  };

  const completeChallenge = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { challengeId: challenge?._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/challenges");
    } catch (error) {
      console.error("Completion error:", error);
      navigate("/challenges");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-800">
              Distraction Block
            </h1>
            <p className="text-slate-600 mt-2">
              Choose a distraction and avoid it for five minutes.
            </p>
          </div>

          {step === "choose" && (
            <div className="bg-white rounded-2xl shadow p-8">

              <h2 className="text-xl font-semibold mb-6">
                Select your main distraction
              </h2>

              <div className="space-y-3 mb-8">
                {distractions.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDistraction(d)}
                    className={`w-full text-left p-4 rounded-lg border transition ${
                      selectedDistraction?.id === d.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="font-medium">{d.name}</div>
                    <div className="text-sm text-slate-500">
                      {d.description}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={startFocus}
                disabled={!selectedDistraction}
                className={`w-full py-3 rounded-lg font-medium ${
                  selectedDistraction
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                Start Focus Session
              </button>

              {selectedDistraction && (
                <p className="text-sm text-slate-500 mt-4 text-center">
                  Tip: {selectedDistraction.tip}
                </p>
              )}
            </div>
          )}

          {step === "focus" && (
            <div className="bg-white rounded-2xl shadow p-10 text-center">

              <div className="text-5xl font-bold text-indigo-600 mb-4">
                {formatTime()}
              </div>

              <p className="text-slate-600 mb-6">
                Avoiding: {selectedDistraction?.name}
              </p>

              <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                <p className="text-indigo-800">{quote}</p>
              </div>

              <button
                onClick={handleInterruption}
                className="px-6 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
              >
                I got distracted
              </button>

              {showTip && (
                <p className="text-sm text-indigo-600 mt-3">
                  Refocus and continue the session.
                </p>
              )}

              <div className="mt-6 text-sm text-slate-500">
                Interruptions: {interruptions}
              </div>

              <div className="flex justify-center gap-4 mt-8">

                <button
                  onClick={() => setIsActive(!isActive)}
                  className="px-5 py-2 bg-slate-200 rounded-lg"
                >
                  {isActive ? "Pause" : "Resume"}
                </button>

                <button
                  onClick={stopChallenge}
                  className="px-5 py-2 bg-red-100 text-red-600 rounded-lg"
                >
                  Stop Challenge
                </button>

                <button
                  onClick={backToChallenges}
                  className="px-5 py-2 bg-slate-700 text-white rounded-lg"
                >
                  Back
                </button>

              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="bg-white rounded-2xl shadow p-10 text-center">

              <h2 className="text-2xl font-semibold mb-3">
                Focus session completed
              </h2>

              <p className="text-slate-600 mb-6">
                Interruptions during session: {interruptions}
              </p>

              <button
                onClick={completeChallenge}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Complete Challenge
              </button>

              <div className="mt-4">
                <button
                  onClick={backToChallenges}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Back to Challenges
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

export default DistractionBlockGame;