import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const FlashMemoryGame = () => {
  const [number, setNumber] = useState("");
  const [show, setShow] = useState(true);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setNumber(num.toString());

    setTimeout(() => {
      setShow(false);
    }, 2000);
  }, []);

  const check = () => {
    if (input === number) {
      setResult("Perfect memory 🧠✨");
    } else {
      setResult(`Wrong 😅 (It was ${number})`);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <Navbar />
      <main className="py-20 text-center">
        <h1 className="text-3xl font-bold mb-6">Flash Memory</h1>

        {show ? (
          <h2 className="text-5xl">{number}</h2>
        ) : (
          <>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="px-4 py-2 border rounded-xl mb-4"
            />
            <br />
            <button
              onClick={check}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl"
            >
              Submit
            </button>
          </>
        )}

        {result && <p className="mt-4">{result}</p>}
      </main>
      <Footer />
    </div>
  );
};

export default FlashMemoryGame;