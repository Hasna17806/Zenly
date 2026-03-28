import React from "react";

const GameControls = ({ onComplete, onStop, onBack }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-10">

      {/* Complete */}
      <button
        onClick={onComplete}
        className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
      >
        Complete Challenge
      </button>

      {/* Stop */}
      <button
        onClick={onStop}
        className="px-8 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition"
      >
        Stop Challenge
      </button>

      {/* Back */}
      <button
        onClick={onBack}
        className="px-8 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
      >
        Back to Challenges
      </button>

    </div>
  );
};

export default GameControls;