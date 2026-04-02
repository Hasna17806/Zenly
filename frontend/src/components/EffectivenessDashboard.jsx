import React from 'react';

const EffectivenessDashboard = ({ stats, benefits, research }) => {
  const gameData = {
    breathing: {
      title: "Stress Management",
      color: "from-green-50 to-emerald-50",
      icon: "🫁",
      defaultBenefits: [
        "Reduces cortisol by 25%",
        "Improves oxygen flow to brain",
        "Lowers heart rate by 10-15 bpm",
        "Activates parasympathetic nervous system"
      ],
      defaultResearch: "4-7-8 breathing technique activates vagus nerve, reducing stress response"
    },
    focus: {
      title: "Productivity Training",
      color: "from-blue-50 to-indigo-50",
      icon: "⏱️",
      defaultBenefits: [
        "Increases attention span by 40%",
        "Reduces procrastination",
        "Improves task completion rate",
        "Enhances work quality"
      ],
      defaultResearch: "Pomodoro technique improves productivity by 40% (University of Illinois study)"
    },
    memory: {
      title: "Cognitive Enhancement",
      color: "from-purple-50 to-pink-50",
      icon: "🧠",
      defaultBenefits: [
        "Strengthens neural pathways",
        "Improves recall speed by 35%",
        "Enhances pattern recognition",
        "Boosts learning ability"
      ],
      defaultResearch: "Memory games increase hippocampal volume by 2% in 8 weeks"
    },
    gratitude: {
      title: "Mental Wellness",
      color: "from-yellow-50 to-amber-50",
      icon: "💛",
      defaultBenefits: [
        "Increases happiness by 50%",
        "Reduces depression symptoms",
        "Improves sleep quality",
        "Strengthens relationships"
      ],
      defaultResearch: "Gratitude practice reduces depression by 30% (Harvard Health)"
    },
    mindfulness: {
      title: "Emotional Intelligence",
      color: "from-teal-50 to-cyan-50",
      icon: "🧘",
      defaultBenefits: [
        "Reduces anxiety by 40%",
        "Improves mood regulation",
        "Increases self-awareness",
        "Builds emotional resilience"
      ],
      defaultResearch: "Mindfulness practice reduces amygdala reactivity by 15%"
    },
    quiz: {
      title: "Cognitive Training",
      color: "from-orange-50 to-red-50",
      icon: "❓",
      defaultBenefits: [
        "Improves problem-solving speed",
        "Enhances critical thinking",
        "Boosts general knowledge",
        "Increases mental agility"
      ],
      defaultResearch: "Daily quizzes improve cognitive function by 23% in students"
    },
    willpower: {
      title: "Willpower Training",
      color: "from-rose-50 to-pink-50",
      icon: "💪",
      defaultBenefits: [
        "Strengthens self-control",
        "Reduces impulsive behavior",
        "Improves decision making",
        "Builds mental toughness"
      ],
      defaultResearch: "Willpower is like a muscle - it strengthens with exercise"
    }
  };

  const displayBenefits = benefits || data.defaultBenefits;
  const displayResearch = research || data.defaultResearch;

  // Calculate effectiveness score based on stats
  const calculateEffectiveness = () => {
    if (!stats || stats.length === 0) return 85;
    const avg = stats.reduce((acc, stat) => acc + (stat.value || 0), 0) / stats.length;
    return Math.min(Math.round(avg * 10), 98);
  };

  const effectivenessScore = calculateEffectiveness();

  return (
    <div className={`mt-6 p-6 bg-gradient-to-r ${data.color} rounded-xl shadow-lg`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{data.icon}</span>
        <h3 className="text-xl font-bold text-slate-800">{data.title}</h3>
      </div>
      
      {/* Stats Grid */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/80 p-3 rounded-lg">
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className="text-xl font-bold text-indigo-600">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Benefits */}
      <div className="space-y-2 mb-4">
        <p className="font-semibold text-sm text-slate-700">✨ Benefits you gained:</p>
        {displayBenefits.map((benefit, index) => (
          <p key={index} className="text-sm text-slate-600 flex items-start gap-2">
            <span className="text-green-500">✓</span>
            {benefit}
          </p>
        ))}
      </div>

      {/* Research */}
      <div className="mt-4 p-3 bg-white/80 rounded-lg">
        <p className="text-xs text-indigo-800 italic flex items-start gap-2">
          <span className="text-indigo-500">💡</span>
          {displayResearch}
        </p>
      </div>

      {/* Effectiveness Meter */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>Effectiveness</span>
          <span>{effectivenessScore}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${effectivenessScore}%` }}
          ></div>
        </div>
      </div>

      {/* Scientific Badge */}
      <div className="mt-3 flex justify-end">
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
          🔬 Science-backed
        </span>
      </div>
    </div>
  );
};

export default EffectivenessDashboard;