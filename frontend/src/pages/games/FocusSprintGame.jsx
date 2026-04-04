import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const StudyLockInGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = location.state?.challenge;

  const [timeLeft, setTimeLeft] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [mainTask, setMainTask] = useState("");
  const [sessionReason, setSessionReason] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");

  const [distractions, setDistractions] = useState(0);
  const [disciplineScore, setDisciplineScore] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);

  const [lockInStep, setLockInStep] = useState("setup"); // setup | countdown | focus | result
  const [countdown, setCountdown] = useState(3);

  const [refocusMessage, setRefocusMessage] = useState("");
  const [sessionMood, setSessionMood] = useState("");

  const refocusTips = [
    "Come back. One small step is enough.",
    "You don’t need motivation — just the next action.",
    "Refocus now. Future you will thank you.",
    "Discipline is built in moments like this.",
    "One task. One mind. Stay with it."
  ];

  const reasonOptions = [
    "📚 I have to study consistently",
    "🎯 I want to improve my focus",
    "🚀 I want to stop procrastinating",
    "🧠 I want to train my discipline"
  ];

  useEffect(() => {
    let interval;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setCompleted(true);
      setLockInStep("result");
      calculateDisciplineScore();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (lockInStep === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (lockInStep === "countdown" && countdown === 0) {
      setLockInStep("focus");
      setIsActive(true);
    }
  }, [lockInStep, countdown]);

  const calculateDisciplineScore = () => {
    let score = 100;
    score -= distractions * 12;
    score += tasksCompleted * 10;

    if (mainTask.trim()) score += 5;
    if (sessionReason.trim()) score += 5;

    const finalScore = Math.max(0, Math.min(100, score));
    setDisciplineScore(finalScore);

    if (finalScore >= 85) setSessionMood("Locked in 🔥");
    else if (finalScore >= 65) setSessionMood("Good focus ⚡");
    else setSessionMood("You showed up — that matters 💪");
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const addTask = () => {
    if (!taskInput.trim()) return;

    setTasks((prev) => [
      ...prev,
      { text: taskInput.trim(), completed: false }
    ]);
    setTaskInput("");
  };

  const completeTask = (index) => {
    const updatedTasks = [...tasks];

    if (!updatedTasks[index].completed) {
      updatedTasks[index].completed = true;
      setTasks(updatedTasks);
      setTasksCompleted((prev) => prev + 1);
    }
  };

  const handleDistraction = () => {
    setDistractions((prev) => prev + 1);
    const randomTip = refocusTips[Math.floor(Math.random() * refocusTips.length)];
    setRefocusMessage(randomTip);

    setTimeout(() => {
      setRefocusMessage("");
    }, 2500);
  };

  const startChallenge = () => {
    if (!mainTask.trim()) return;

    setTimeLeft(300);
    setDistractions(0);
    setTasksCompleted(0);
    setDisciplineScore(0);
    setCompleted(false);
    setCountdown(3);
    setLockInStep("countdown");
  };

  const resetChallenge = () => {
    setTimeLeft(300);
    setIsActive(false);
    setCompleted(false);
    setDistractions(0);
    setDisciplineScore(0);
    setTasksCompleted(0);
    setRefocusMessage("");
    setSessionMood("");
    setLockInStep("setup");
    setCountdown(3);
    setTasks([]);
    setTaskInput("");
    setMainTask("");
    setSessionReason("");
  };

  const completeChallenge = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        {
          challengeId: challenge?._id,
          disciplineScore,
          distractions,
          tasksCompleted
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate("/challenges");
    } catch (error) {
      console.error("Completion error:", error);
      navigate("/challenges");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef2ff,_#f8fafc,_#ffffff)]">
      <Navbar />

      <main className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 p-8">

            {/* SETUP */}
            {lockInStep === "setup" && (
              <>
                <div className="text-center mb-10">
                  <div className="inline-flex px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-4">
                    ✦ Study Activation Challenge
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-3">
                    Study Lock-In
                  </h1>
                  <p className="text-slate-600 text-lg">
                    Switch your brain into study mode in just 5 minutes.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-2">
                      What is your main study mission?
                    </label>
                    <input
                      type="text"
                      value={mainTask}
                      onChange={(e) => setMainTask(e.target.value)}
                      placeholder="Example: Finish DBMS revision"
                      className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-3">
                      Why does this session matter today?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {reasonOptions.map((reason, index) => (
                        <button
                          key={index}
                          onClick={() => setSessionReason(reason)}
                          className={`p-4 rounded-2xl border text-left transition ${
                            sessionReason === reason
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 hover:border-indigo-300 bg-white"
                          }`}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-2">
                      Add mini tasks (optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={taskInput}
                        onChange={(e) => setTaskInput(e.target.value)}
                        placeholder="Example: Read 2 pages"
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={addTask}
                        className="px-5 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {tasks.length > 0 && (
                    <div className="bg-slate-50 rounded-2xl p-5">
                      <p className="font-semibold text-slate-800 mb-3">Mini Tasks</p>
                      <div className="space-y-2">
                        {tasks.map((task, index) => (
                          <div key={index} className="text-slate-700">
                            • {task.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-indigo-50 rounded-2xl p-5">
                    <p className="font-semibold text-indigo-800 mb-2">
                      Before you begin:
                    </p>
                    <ul className="text-sm text-indigo-700 space-y-1">
                      <li>• Keep your phone away</li>
                      <li>• Open only what you need</li>
                      <li>• Focus on one thing only</li>
                    </ul>
                  </div>

                  <button
                    onClick={startChallenge}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-lg font-bold hover:bg-indigo-700 transition"
                  >
                    Lock In Now
                  </button>
                </div>
              </>
            )}

            {/* COUNTDOWN */}
            {lockInStep === "countdown" && (
              <div className="text-center py-20">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-4">
                  Prepare Your Mind
                </p>
                <h1 className="text-8xl font-bold text-slate-900 mb-4">
                  {countdown === 0 ? "GO" : countdown}
                </h1>
                <p className="text-slate-600 text-lg">
                  Clear the noise. Enter study mode.
                </p>
              </div>
            )}

            {/* FOCUS MODE */}
            {lockInStep === "focus" && (
              <div className="text-center">
                <div className="mb-8">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-3">
                    Deep Focus Mode
                  </p>
                  <div className="text-7xl font-bold text-indigo-600 mb-4">
                    {formatTime()}
                  </div>
                  <p className="text-slate-700 text-lg">
                    Mission: <span className="font-semibold">{mainTask}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-sm text-slate-500 mb-1">Distractions</p>
                    <p className="text-3xl font-bold text-orange-500">{distractions}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-sm text-slate-500 mb-1">Tasks Done</p>
                    <p className="text-3xl font-bold text-emerald-600">{tasksCompleted}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-sm text-slate-500 mb-1">Why</p>
                    <p className="text-sm font-semibold text-slate-700 mt-2">
                      {sessionReason || "To build discipline"}
                    </p>
                  </div>
                </div>

                {tasks.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-5 text-left mb-6">
                    <h3 className="font-semibold text-slate-800 mb-3">Mini Tasks</h3>
                    <div className="space-y-3">
                      {tasks.map((task, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <button
                            onClick={() => completeTask(index)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              task.completed
                                ? "bg-green-500 border-green-500 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {task.completed ? "✓" : ""}
                          </button>
                          <span
                            className={`${
                              task.completed
                                ? "line-through text-slate-400"
                                : "text-slate-700"
                            }`}
                          >
                            {task.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleDistraction}
                  className="px-6 py-3 bg-orange-100 text-orange-700 rounded-2xl hover:bg-orange-200 font-medium"
                >
                  😵 I got distracted
                </button>

                {refocusMessage && (
                  <div className="mt-5 bg-indigo-50 text-indigo-700 rounded-2xl p-4 font-medium">
                    {refocusMessage}
                  </div>
                )}
              </div>
            )}

            {/* RESULT */}
            {lockInStep === "result" && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🧠</div>
                  <h2 className="text-4xl font-bold text-slate-900 mb-3">
                    Study Mode Activated
                  </h2>
                  <p className="text-slate-600 text-lg">
                    {sessionMood}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-indigo-50 rounded-2xl p-5 text-center">
                    <p className="text-sm text-slate-500 mb-1">Discipline Score</p>
                    <p className="text-3xl font-bold text-indigo-700">{disciplineScore}%</p>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl p-5 text-center">
                    <p className="text-sm text-slate-500 mb-1">Tasks Done</p>
                    <p className="text-3xl font-bold text-emerald-700">{tasksCompleted}</p>
                  </div>
                  <div className="bg-orange-50 rounded-2xl p-5 text-center">
                    <p className="text-sm text-slate-500 mb-1">Distractions</p>
                    <p className="text-3xl font-bold text-orange-600">{distractions}</p>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-6 text-white mb-8">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400 mb-2">
                    Reflection
                  </p>
                  <h3 className="text-2xl font-bold mb-3">
                    You proved that you can sit down and start.
                  </h3>
                  <p className="text-slate-300">
                    That’s the hardest part of studying — and you just did it.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={resetChallenge}
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-semibold"
                  >
                    Try Again
                  </button>

                  <button
                    onClick={completeChallenge}
                    className="flex-1 px-6 py-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 font-semibold"
                  >
                    Complete Challenge
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudyLockInGame;