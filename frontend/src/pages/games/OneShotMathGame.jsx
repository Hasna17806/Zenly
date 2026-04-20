import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const OneShotMathGame = () => {
  const a = Math.floor(Math.random() * 20);
  const b = Math.floor(Math.random() * 20);

  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);

  const checkAnswer = () => {
    if (parseInt(answer) === a + b) {
      setResult("Correct 🎉");
    } else {
      setResult("Wrong 😅");
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <main className="py-20 text-center">
        <h1 className="text-3xl font-bold mb-6">One Shot Math</h1>

        <h2 className="text-4xl mb-6">{a} + {b} = ?</h2>

        {!result ? (
          <>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="px-4 py-2 border rounded-xl mb-4"
            />
            <br />
            <button
              onClick={checkAnswer}
              className="px-6 py-3 bg-green-600 text-white rounded-xl"
            >
              Submit
            </button>
          </>
        ) : (
          <h2 className="text-2xl">{result}</h2>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OneShotMathGame;