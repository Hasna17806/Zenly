import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const CatchTheMoodGame = () => {
  const [position, setPosition] = useState({ top: 50, left: 50 });
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(15);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (time <= 0) {
      setGameOver(true);
      return;
    }

    const timer = setTimeout(() => setTime(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [time]);

  useEffect(() => {
    if (gameOver) return;

    const move = setInterval(() => {
      setPosition({
        top: Math.random() * 80,
        left: Math.random() * 80
      });
    }, 800);

    return () => clearInterval(move);
  }, [gameOver]);

  const handleClick = () => {
    setScore(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-yellow-50">
      <Navbar />
      <main className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl relative h-[400px]">

          {!gameOver ? (
            <>
              <div className="flex justify-between mb-4">
                <span>Score: {score}</span>
                <span>Time: {time}s</span>
              </div>

              <div
                onClick={handleClick}
                className="text-5xl cursor-pointer absolute"
                style={{
                  top: `${position.top}%`,
                  left: `${position.left}%`,
                  transform: "translate(-50%, -50%)"
                }}
              >
                😂
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-4">Game Over 🎉</h2>
              <p className="text-xl mb-4">Score: {score}</p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CatchTheMoodGame;