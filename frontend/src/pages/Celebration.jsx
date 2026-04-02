import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

const Celebration = ({ onComplete, challengeTitle }) => {
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      startVelocity: 25,
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#ffac46', '#6feb6f']
    });

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5, x: 0.3 },
        startVelocity: 20,
      });
    }, 150);

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5, x: 0.7 },
        startVelocity: 20,
      });
    }, 300);

    // Auto close after 3 seconds
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 pointer-events-auto animate-bounce-in">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🎉</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">Challenge Completed!</h3>
          <p className="text-gray-700 mb-2">Great job completing:</p>
          <p className="font-semibold text-indigo-600 text-lg">{challengeTitle}</p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="text-yellow-500 text-2xl animate-bounce">⭐</span>
            <span className="text-yellow-500 text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>⭐</span>
            <span className="text-yellow-500 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
          </div>
          <p className="text-sm text-gray-500 mt-4">+5 Focus Points earned!</p>
        </div>
      </div>
      <style>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
          80% {
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Celebration;