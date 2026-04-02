import { useState } from "react";

const TestTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const startTimer = () => {
    setIsRunning(true);
    const interval = setInterval(() => {
      setSeconds(prev => {
        const newSeconds = prev + 1;
        console.log("Timer ticking:", newSeconds);
        return newSeconds;
      });
    }, 1000);
    
    // Store interval to clear later
    window.timerInterval = interval;
  };

  const stopTimer = () => {
    if (window.timerInterval) {
      clearInterval(window.timerInterval);
      window.timerInterval = null;
    }
    setIsRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    setSeconds(0);
  };

  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "10px" }}>
      <h2>Timer Test</h2>
      <div style={{ fontSize: "48px", margin: "20px 0" }}>
        {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={startTimer}>Start</button>
        <button onClick={stopTimer}>Stop</button>
        <button onClick={resetTimer}>Reset</button>
      </div>
      <div style={{ marginTop: "10px" }}>
        <strong>Seconds:</strong> {seconds}
      </div>
    </div>
  );
};

export default TestTimer;