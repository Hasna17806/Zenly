import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const MemeReactionGame = () => {
  const memes = [
    {
      text: "Your WiFi disconnects during exam 😭",
      options: ["Cry", "Rage", "Stay Calm", "Laugh"],
    },
    {
      text: "You studied the wrong chapter 💀",
      options: ["Panic", "Guess", "Sleep", "Accept fate"],
    },
    {
      text: "Teacher says 'this won't come for exam' 😏",
      options: ["Trust", "Doubt", "Ignore", "Screenshot"],
    }
  ];

  const reactions = [
    "😂 Chaos energy unlocked",
    "🧠 Big brain move",
    "💀 You survived somehow",
    "🔥 Main character vibes"
  ];

  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState("");

  const handleClick = () => {
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    setResult(randomReaction);

    setTimeout(() => {
      setResult("");
      setCurrent((prev) => (prev + 1) % memes.length);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />
      <main className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl">

          <h2 className="text-2xl font-bold mb-6">
            {memes[current].text}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {memes[current].options.map((opt, i) => (
              <button
                key={i}
                onClick={handleClick}
                className="p-4 bg-pink-100 rounded-xl hover:bg-pink-300"
              >
                {opt}
              </button>
            ))}
          </div>

          {result && (
            <p className="mt-6 text-xl font-semibold">{result}</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MemeReactionGame;