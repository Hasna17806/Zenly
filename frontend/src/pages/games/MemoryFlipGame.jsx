import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const MemoryFlipGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const navigate = useNavigate();

  const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }));
    setCards(shuffled);
  };

  const handleCardClick = (id) => {
    if (flipped.length === 2 || matched.includes(id)) return;

    setFlipped(prev => [...prev, id]);
    setMoves(prev => prev + 1);

    if (flipped.length === 1) {
      const firstCard = cards.find(c => c.id === flipped[0]);
      const secondCard = cards.find(c => c.id === id);

      if (firstCard.emoji === secondCard.emoji) {
        setMatched(prev => [...prev, flipped[0], id]);
        setFlipped([]);
        
        if (matched.length + 2 === cards.length) {
          setGameComplete(true);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Memory Flip</h1>
          <p className="text-xl mb-4">Moves: {moves}</p>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {cards.map(card => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  h-24 text-3xl rounded-xl transition-all
                  ${flipped.includes(card.id) || matched.includes(card.id)
                    ? 'bg-white shadow-lg'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                  }
                `}
              >
                {flipped.includes(card.id) || matched.includes(card.id) ? card.emoji : '?'}
              </button>
            ))}
          </div>

          {gameComplete && (
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                  await axios.post(
                    "http://localhost:5000/api/completed-challenges",
                    { challengeId: location.state?.challenge?.id },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  navigate('/challenges');
                } catch (error) {
                  console.error("Error:", error);
                }
              }}
              className="px-8 py-4 bg-green-600 text-white rounded-xl"
            >
              Complete Challenge
            </button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MemoryFlipGame;