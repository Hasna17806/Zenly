import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const SESSION_SECONDS = 300;

const distractions = [
  {
    id: "phone",
    name: "Phone",
    icon: "📱",
    description: "Put your phone face down and away from your desk.",
    tip: "Distance reduces the urge to check it."
  },
  {
    id: "social",
    name: "Social Media",
    icon: "📲",
    description: "Close apps or tabs that pull your attention away.",
    tip: "Out of sight helps your brain settle faster."
  },
  {
    id: "games",
    name: "Gaming",
    icon: "🎮",
    description: "Pause gaming and return to your current goal.",
    tip: "Save the reward for after your work session."
  },
  {
    id: "chatting",
    name: "Chatting",
    icon: "💬",
    description: "Mute or pause conversations for a short while.",
    tip: "A few quiet minutes can rebuild your concentration."
  },
  {
    id: "music",
    name: "Music with Lyrics",
    icon: "🎵",
    description: "Switch to silence or instrumental sounds.",
    tip: "Lyrics often compete with study attention."
  },
  {
    id: "browser",
    name: "Random Browsing",
    icon: "🌐",
    description: "Close unnecessary tabs and simplify your screen.",
    tip: "A cleaner screen creates a calmer mind."
  }
];

const focusMessages = [
  "You don’t need perfect focus. Just return gently.",
  "One calm minute can reset your whole study mood.",
  "Your attention is trainable.",
  "You are not behind — you are rebuilding rhythm.",
  "Small focus wins matter.",
  "Come back to one task. That is enough.",
  "Progress grows from repeated returns.",
  "You are creating mental space."
];

const completionReflections = [
  "A calmer mind studies better.",
  "You just proved you can return to focus.",
  "This is how discipline quietly grows.",
  "Your attention got stronger today.",
  "You created space between impulse and action."
];

const DistractionBlockGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = location.state?.challenge;

  const [step, setStep] = useState("choose");
  const [selectedDistraction, setSelectedDistraction] = useState(null);
  const [timer, setTimer] = useState(SESSION_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [intention, setIntention] = useState("");
  const [sessionMessage, setSessionMessage] = useState(
    focusMessages[Math.floor(Math.random() * focusMessages.length)]
  );
  const [reflection] = useState(
    completionReflections[Math.floor(Math.random() * completionReflections.length)]
  );

  useEffect(() => {
    let interval;

    if (isActive && timer > 0 && step === "focus") {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            setStep("complete");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timer, step]);

  useEffect(() => {
    if (step !== "focus") return;

    const messageInterval = setInterval(() => {
      const randomMessage =
        focusMessages[Math.floor(Math.random() * focusMessages.length)];
      setSessionMessage(randomMessage);
    }, 9000);

    return () => clearInterval(messageInterval);
  }, [step]);

  const formatTime = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = ((SESSION_SECONDS - timer) / SESSION_SECONDS) * 100;

  const startFocus = () => {
    if (!selectedDistraction || !intention.trim()) return;

    setTimer(SESSION_SECONDS);
    setInterruptions(0);
    setShowTip(false);
    setStep("focus");
    setIsActive(true);
  };

  const stopChallenge = () => {
    setIsActive(false);
    setStep("choose");
    setTimer(SESSION_SECONDS);
    setInterruptions(0);
    setShowTip(false);
    setIntention("");
    setSelectedDistraction(null);
  };

  const backToChallenges = () => {
    navigate("/challenges");
  };

  const handleInterruption = () => {
    setInterruptions((prev) => prev + 1);
    setShowTip(true);

    const randomMessage =
      focusMessages[Math.floor(Math.random() * focusMessages.length)];
    setSessionMessage(randomMessage);

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
        {
          challengeId: challenge?._id,
          distraction: selectedDistraction?.name,
          interruptions,
          intention,
          duration: SESSION_SECONDS
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/challenges");
    } catch (error) {
      console.error("Completion error:", error);
      navigate("/challenges");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <Navbar />

      <main className="py-20 px-6">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-400/20 bg-violet-400/10 text-violet-200 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              ✦ Study Reset
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-200 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              Focus Reset
            </h1>

            <p className="text-slate-400 mt-3 text-base md:text-lg">
              Quiet the distraction. Return to one meaningful task.
            </p>
          </div>

          {/* CHOOSE STEP */}
          {step === "choose" && (
            <div className="bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10 backdrop-blur-xl">

              <h2 className="text-2xl font-semibold mb-2">What is pulling your focus today?</h2>
              <p className="text-slate-400 mb-8">
                Pick the biggest distraction, then set one small study intention.
              </p>

              <div className="grid gap-4 md:grid-cols-2 mb-8">
                {distractions.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDistraction(d)}
                    className={`text-left p-5 rounded-2xl border transition-all duration-200 ${
                      selectedDistraction?.id === d.id
                        ? "border-violet-400 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                        : "border-white/10 bg-white/5 hover:border-violet-300/40 hover:bg-white/8"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{d.icon}</span>
                      <div className="font-semibold text-lg">{d.name}</div>
                    </div>
                    <div className="text-sm text-slate-400">{d.description}</div>
                  </button>
                ))}
              </div>

              {selectedDistraction && (
                <div className="mb-8 p-4 rounded-2xl bg-violet-500/10 border border-violet-400/15 text-violet-100">
                  <span className="font-semibold">Tip:</span> {selectedDistraction.tip}
                </div>
              )}

              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  What will you focus on for the next 5 minutes?
                </label>
                <textarea
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  rows={3}
                  maxLength={120}
                  placeholder="Example: Finish 2 paragraphs of my notes..."
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-4 text-white placeholder:text-slate-500 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 resize-none"
                />
                <p className="text-right text-xs text-slate-500 mt-2">
                  {intention.length}/120
                </p>
              </div>

              <button
                onClick={startFocus}
                disabled={!selectedDistraction || !intention.trim()}
                className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                  selectedDistraction && intention.trim()
                    ? "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 text-white hover:scale-[1.01] shadow-xl shadow-violet-500/20"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}
              >
                Start 5-Minute Reset →
              </button>
            </div>
          )}

          {/* FOCUS STEP */}
          {step === "focus" && (
            <div className="bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10 text-center backdrop-blur-xl">

              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-3">
                  Your Focus Reset
                </p>

                <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-violet-200 to-cyan-300 bg-clip-text text-transparent mb-4">
                  {formatTime()}
                </div>

                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="text-slate-400 text-sm">
                  Avoiding: <span className="text-white font-medium">{selectedDistraction?.name}</span>
                </p>
              </div>

              <div className="mb-6 p-5 rounded-2xl bg-cyan-500/10 border border-cyan-400/15">
                <p className="text-sm uppercase tracking-[0.18em] text-cyan-300 mb-2">
                  Your intention
                </p>
                <p className="text-lg text-white font-medium">{intention}</p>
              </div>

              <div className="mb-6 p-5 rounded-2xl bg-violet-500/10 border border-violet-400/15 min-h-[92px] flex items-center justify-center">
                <p className="text-violet-100 text-lg italic leading-relaxed">
                  “{sessionMessage}”
                </p>
              </div>

              <button
                onClick={handleInterruption}
                className="px-6 py-3 bg-white/8 border border-white/10 rounded-2xl hover:bg-white/12 transition-all"
              >
                I got distracted
              </button>

              {showTip && (
                <p className="text-sm text-cyan-300 mt-4">
                  That’s okay. Notice it, release it, return.
                </p>
              )}

              <div className="mt-6 text-sm text-slate-400">
                Refocus count: <span className="text-white font-semibold">{interruptions}</span>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className="px-6 py-3 bg-white/8 border border-white/10 rounded-2xl hover:bg-white/12 transition-all"
                >
                  {isActive ? "Pause" : "Resume"}
                </button>

                <button
                  onClick={stopChallenge}
                  className="px-6 py-3 bg-red-500/10 border border-red-400/20 text-red-300 rounded-2xl hover:bg-red-500/15 transition-all"
                >
                  Stop Session
                </button>

                <button
                  onClick={backToChallenges}
                  className="px-6 py-3 bg-slate-700/70 text-white rounded-2xl hover:bg-slate-600 transition-all"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* COMPLETE STEP */}
          {step === "complete" && (
            <div className="bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-10 text-center backdrop-blur-xl">

              <div className="text-5xl mb-4">✨</div>

              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Focus Reset Complete
              </h2>

              <p className="text-slate-300 mb-6 text-lg">
                You stayed with your mind instead of escaping it.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Distraction faced</p>
                  <p className="text-lg font-semibold">{selectedDistraction?.name}</p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Refocus count</p>
                  <p className="text-lg font-semibold">{interruptions}</p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Your intention</p>
                  <p className="text-lg font-semibold">{intention}</p>
                </div>
              </div>

              <div className="mb-8 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-400/15">
                <p className="text-emerald-100 italic text-lg">“{reflection}”</p>
              </div>

              <button
                onClick={completeChallenge}
                className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl font-semibold text-lg hover:scale-[1.02] transition-all shadow-xl shadow-emerald-500/20"
              >
                Complete Challenge ✓
              </button>

              <div className="mt-5">
                <button
                  onClick={backToChallenges}
                  className="text-sm text-slate-500 hover:text-slate-300 transition"
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