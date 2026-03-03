import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import EffectivenessDashboard from '../../components/EffectivenessDashboard';
import axios from 'axios';

const FocusSprintGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = location.state?.challenge;
  
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [focusScore, setFocusScore] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [showEffectiveness, setShowEffectiveness] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setCompleted(true);
      calculateFocusScore();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const calculateFocusScore = () => {
    const score = Math.max(0, 100 - (distractions * 15) + (tasksCompleted * 20));
    setFocusScore(Math.min(100, score));
    setShowEffectiveness(true);
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const addTask = () => {
    if (taskInput.trim()) {
      setTasks([...tasks, { text: taskInput, completed: false }]);
      setTaskInput('');
    }
  };

  const completeTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].completed = true;
    setTasks(newTasks);
    setTasksCompleted(prev => prev + 1);
  };

  const handleDistraction = () => {
    setDistractions(prev => prev + 1);
    // Show a quick tip
    alert("💡 Tip: Take a deep breath and refocus!");
  };

  const handleStart = () => {
    setIsActive(true);
    setTimeLeft(300);
    setDistractions(0);
    setTasksCompleted(0);
    setFocusScore(0);
    setShowEffectiveness(false);
  };

  const effectivenessStats = [
    { label: "Focus Score", value: `${focusScore}%` },
    { label: "Distractions", value: distractions },
    { label: "Tasks Done", value: tasksCompleted }
  ];

  const benefits = [
    "Increases attention span by 40%",
    "Builds deep work capability",
    "Reduces procrastination tendency",
    "Improves task completion rate"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h1 className="text-4xl font-bold text-center text-indigo-900 mb-2">
              {challenge?.title || "Focus Sprint"}
            </h1>
            <p className="text-center text-slate-600 mb-8">
              5 minutes of deep work • Train your attention span
            </p>

            {!isActive && !completed && (
              <div className="text-center">
                <div className="mb-8">
                  <p className="text-lg text-slate-600 mb-4">Science of Focus:</p>
                  <ul className="text-left space-y-2 text-sm text-slate-600 bg-blue-50 p-4 rounded-xl">
                    <li>🧠 5-minute sprints build neural pathways</li>
                    <li>⚡ Each distraction costs 23 minutes to refocus</li>
                    <li>📈 Daily practice increases attention span by 40%</li>
                    <li>🎯 Deep work produces 400% more output</li>
                  </ul>
                </div>

                {/* Task input for focus session */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">What will you focus on?</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      placeholder="e.g., Read chapter 3"
                      className="flex-1 px-4 py-2 border rounded-xl"
                    />
                    <button
                      onClick={addTask}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {tasks.length > 0 && (
                  <div className="mb-6 text-left">
                    <h4 className="font-semibold mb-2">Today's tasks:</h4>
                    {tasks.map((task, index) => (
                      <div key={index} className="flex items-center gap-2 mb-1">
                        <span>{task.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleStart}
                  className="px-12 py-6 bg-indigo-600 text-white rounded-2xl text-2xl font-bold hover:bg-indigo-700"
                >
                  Start Focus Sprint
                </button>
              </div>
            )}

            {isActive && (
              <div className="text-center space-y-6">
                <div className="text-7xl font-bold text-indigo-600 mb-4">
                  {formatTime()}
                </div>

                {/* Task list during focus */}
                <div className="bg-slate-50 p-4 rounded-xl text-left">
                  <h3 className="font-semibold mb-2">Tasks:</h3>
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => completeTask(index)}
                        className={`w-5 h-5 rounded border ${task.completed ? 'bg-green-500' : 'bg-white'}`}
                      />
                      <span className={task.completed ? 'line-through text-slate-400' : ''}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleDistraction}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl"
                >
                  😅 I got distracted
                </button>

                <p className="text-sm text-slate-500">
                  Distractions logged: {distractions}
                </p>
              </div>
            )}

            {completed && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-3xl font-bold text-green-600 mb-2">Focus Sprint Complete!</h2>
                </div>

                <EffectivenessDashboard
                  gameType="focus"
                  stats={effectivenessStats}
                  benefits={benefits}
                  research="Pomodoro technique improves productivity by 40% (University of Illinois study)"
                />

                {/* Focus insights */}
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <p className="font-semibold mb-2">📊 Focus Insights:</p>
                  <p>• You focused for 5 minutes without stopping</p>
                  <p>• {distractions === 0 ? 'Perfect focus! 🎯' : `Managed ${distractions} distractions`}</p>
                  <p>• Completed {tasksCompleted} of {tasks.length} tasks</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleStart}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                  >
                    Another Sprint
                  </button>
                  <button
                    onClick={async () => {
                      await axios.post("http://localhost:5000/api/completed", {
                        challengeId: challenge?.id,
                        focusScore,
                        distractions
                      });
                      navigate('/challenges');
                    }}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
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

export default FocusSprintGame;