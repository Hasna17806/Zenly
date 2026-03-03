import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const GratitudeTapGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = location.state?.challenge;
  const [gratitude, setGratitude] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { challengeId: challenge?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
      setTimeout(() => navigate('/challenges'), 2000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-red-50">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Gratitude Tap</h1>
          <p className="text-xl text-slate-600 mb-12">Think of one good thing today</p>

          {!submitted ? (
            <div className="space-y-8">
              <textarea
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="I'm grateful for..."
                className="w-full p-6 border-2 rounded-2xl text-lg"
                rows="4"
              />
              <button
                onClick={handleSubmit}
                disabled={!gratitude.trim()}
                className="px-12 py-4 bg-pink-600 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                Complete Challenge
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">✨ Gratitude builds positivity!</h2>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GratitudeTapGame;