import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const TapRushGame = () => {
  const [count, setCount] = useState(0);
  const [time, setTime] = useState(10);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;

    if (time <= 0) {
      setActive(false);
      return;
    }

    const timer = setTimeout(() => setTime(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [time, active]);

  const startGame = () => {
    setCount(0);
    setTime(10);
    setActive(true);
  };

  return (
    <div className="min-h-screen bg-indigo-50">
      <Navbar />
      <main className="py-20 text-center">
        <h1 className="text-3xl font-bold mb-6">Tap Rush</h1>

        {!active ? (
          <button
            onClick={startGame}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl"
          >
            Start
          </button>
        ) : (
          <>
            <p className="text-xl mb-4">Time: {time}s</p>
            <p className="text-xl mb-4">Taps: {count}</p>

            <button
              onClick={() => setCount(c => c + 1)}
              className="px-10 py-6 bg-pink-500 text-white text-2xl rounded-xl"
            >
              TAP!
            </button>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TapRushGame;