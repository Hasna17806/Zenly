import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const EmojiMatchGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const challenge = location.state?.challenge;

  const emotionPairs = [
    { emoji: "😊", word: "Happy" },
    { emoji: "😢", word: "Sad" },
    { emoji: "😠", word: "Angry" },
    { emoji: "😰", word: "Anxious" },
    { emoji: "😌", word: "Relieved" },
    { emoji: "😴", word: "Tired" }
  ];

  const generateCards = () => {
    const cards = [];

    emotionPairs.forEach((pair, index) => {
      cards.push({
        id: `emoji-${index}`,
        type: "emoji",
        value: pair.emoji,
        pairId: index
      });

      cards.push({
        id: `word-${index}`,
        type: "word",
        value: pair.word,
        pairId: index
      });
    });

    return cards.sort(() => Math.random() - 0.5);
  };

  const [cards, setCards] = useState(generateCards());
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const handleFlip = (card) => {
    if (
      flipped.length === 2 ||
      flipped.includes(card.id) ||
      matched.includes(card.id)
    )
      return;

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);

      const first = cards.find((c) => c.id === newFlipped[0]);
      const second = cards.find((c) => c.id === newFlipped[1]);

      if (first.pairId === second.pairId) {
        setMatched((prev) => [...prev, first.id, second.id]);
        setFlipped([]);
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 900);
      }
    }
  };

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameComplete(true);
    }
  }, [matched]);

  const resetGame = () => {
    setCards(generateCards());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameComplete(false);
  };

  const stopChallenge = () => {
    navigate("/challenges");
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
      console.error(error);
      navigate("/challenges");
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50">
      <Navbar />

      <main className="py-20 px-6">
        <div className="max-w-3xl mx-auto">

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-indigo-900">
              Emotion Memory Match
            </h1>
            <p className="text-slate-600">
              Match each emoji with the correct emotion.
            </p>
          </div>

          {/* Game stats */}
          <div className="flex justify-between mb-6 text-slate-600">
            <span>Moves: {moves}</span>
            <span>Matches: {matched.length / 2} / {emotionPairs.length}</span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-4 gap-4">

            {cards.map((card) => {
              const isFlipped =
                flipped.includes(card.id) || matched.includes(card.id);

              return (
                <button
                  key={card.id}
                  onClick={() => handleFlip(card)}
                  className={`h-24 rounded-xl text-xl font-semibold flex items-center justify-center transition 
                  ${
                    isFlipped
                      ? "bg-white border"
                      : "bg-indigo-500 text-white"
                  }`}
                >
                  {isFlipped ? card.value : "?"}
                </button>
              );
            })}

          </div>

          {/* Completion */}
          {gameComplete && (
            <div className="mt-10 bg-white rounded-xl p-6 text-center shadow">

              <h2 className="text-2xl font-semibold mb-2">
                Game Complete
              </h2>

              <p className="text-slate-600 mb-4">
                You finished in {moves} moves.
              </p>

              <div className="flex justify-center gap-4">

                <button
                  onClick={resetGame}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Play Again
                </button>

                <button
                  onClick={completeChallenge}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg"
                >
                  Complete Challenge
                </button>

                <button
                  onClick={stopChallenge}
                  className="px-5 py-2 bg-slate-500 text-white rounded-lg"
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

export default EmojiMatchGame;