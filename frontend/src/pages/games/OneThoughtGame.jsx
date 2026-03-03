import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const OneThoughtGame = () => {
  const [thought, setThought] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { challengeId: location.state?.challenge?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
      setTimeout(() => navigate('/challenges'), 2000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">One-Thought Dump</h1>
          <p className="text-xl mb-8">Write one thought and let it go</p>

          {!submitted ? (
            <div className="space-y-6">
              <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-6 border-2 rounded-2xl text-lg"
                rows="6"
              />
              <button
                onClick={handleSubmit}
                disabled={!thought.trim()}
                className="px-8 py-4 bg-amber-600 text-white rounded-xl disabled:opacity-50"
              >
                Release Thought
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">✨ Thought released!</h2>
              <p className="text-xl">Your mind feels lighter</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OneThoughtGame;