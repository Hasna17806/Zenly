import React, { useState, useEffect, useRef, useCallback } from "react";

const DIFFS = {
  easy:   { range: 20, ops: ["+", "-"],          time: 15, points: 10 },
  medium: { range: 50, ops: ["+", "-", "×"],     time: 12, points: 20 },
  hard:   { range: 99, ops: ["+", "-", "×", "÷"], time: 9, points: 35 },
};

const ACCENTS = { easy: "#639922", medium: "#185FA5", hard: "#A32D2D" };

function rand(n) { return Math.floor(Math.random() * n) + 1; }

function opName(o) {
  return { "+": "Addition", "-": "Subtraction", "×": "Multiplication", "÷": "Division" }[o];
}

function buildQuestion(diff) {
  const cfg = DIFFS[diff];
  const op = cfg.ops[Math.floor(Math.random() * cfg.ops.length)];
  let a, b, answer;
  if (op === "+") { a = rand(cfg.range); b = rand(cfg.range); answer = a + b; }
  else if (op === "-") { a = rand(cfg.range); b = rand(a); answer = a - b; }
  else if (op === "×") { a = rand(12); b = rand(12); answer = a * b; }
  else { b = rand(12); answer = rand(10); a = b * answer; }
  return { a, b, op, answer };
}

export default function OneShotMathGame() {
  const [diff, setDiff] = useState("easy");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [solved, setSolved] = useState(0);
  const [question, setQuestion] = useState(() => buildQuestion("easy"));
  const [phase, setPhase] = useState("question"); // question | result | gameover
  const [resultType, setResultType] = useState(null);
  const [inputVal, setInputVal] = useState("");
  const [timeLeft, setTimeLeft] = useState(DIFFS["easy"].time);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const totalTime = DIFFS[diff].time;

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startTimer = useCallback((duration) => {
    stopTimer();
    let t = duration;
    setTimeLeft(t);
    timerRef.current = setInterval(() => {
      t = parseFloat((t - 0.1).toFixed(1));
      setTimeLeft(t);
      if (t <= 0) {
        stopTimer();
        setPhase("result");
        setResultType("timeout");
        setStreak(0);
        setLives((l) => l - 1);
      }
    }, 100);
  }, [stopTimer]);

  const nextQuestion = useCallback((currentDiff) => {
    const q = buildQuestion(currentDiff);
    setQuestion(q);
    setInputVal("");
    setPhase("question");
    setResultType(null);
    startTimer(DIFFS[currentDiff].time);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [startTimer]);

  const resetGame = useCallback((newDiff) => {
    const d = newDiff || diff;
    setScore(0);
    setStreak(0);
    setLives(3);
    setSolved(0);
    nextQuestion(d);
  }, [diff, nextQuestion]);

  useEffect(() => {
    startTimer(DIFFS[diff].time);
    return stopTimer;
  }, []);

  useEffect(() => {
    if (lives <= 0 && phase === "result") {
      stopTimer();
      setPhase("gameover");
    }
  }, [lives, phase, stopTimer]);

  const handleDiff = (d) => {
    setDiff(d);
    resetGame(d);
  };

  const submit = () => {
    if (phase !== "question") return;
    const val = parseInt(inputVal);
    if (isNaN(val)) { inputRef.current?.focus(); return; }
    stopTimer();
    const cfg = DIFFS[diff];
    if (val === question.answer) {
      const bonus = Math.ceil((timeLeft / totalTime) * cfg.points * 0.5);
      setScore((s) => { const n = s + cfg.points + bonus; setBest((b) => Math.max(b, n)); return n; });
      setStreak((s) => s + 1);
      setSolved((s) => s + 1);
      setResultType("correct");
    } else {
      setStreak(0);
      setLives((l) => l - 1);
      setResultType("wrong");
    }
    setPhase("result");
  };

  const accent = ACCENTS[diff];
  const timerPct = Math.max(0, (timeLeft / totalTime) * 100);
  const timerColor = timerPct > 50 ? accent : timerPct > 25 ? "#EF9F27" : "#E24B4A";

  const styles = {
    wrap: {
      fontFamily: "'DM Sans', system-ui, sans-serif",
      padding: "2rem 1.5rem 3rem",
      maxWidth: 480,
      margin: "0 auto",
    },
    header: {
      display: "flex", justifyContent: "space-between",
      alignItems: "center", marginBottom: "1.5rem",
    },
    title: {
      fontFamily: "monospace", fontSize: 15,
      fontWeight: 700, letterSpacing: "0.08em",
    },
    statsRow: { display: "flex", gap: 10, alignItems: "center" },
    pill: {
      display: "flex", alignItems: "center", gap: 5,
      fontSize: 13, fontWeight: 500,
      border: "0.5px solid #ccc", borderRadius: 20,
      padding: "4px 10px", background: "transparent",
    },
    diffRow: { display: "flex", gap: 6, marginBottom: "1.5rem" },
    diffBtn: (active) => ({
      flex: 1, padding: "7px 0", fontSize: 12, fontWeight: 500,
      borderRadius: 8, border: "0.5px solid #ccc",
      background: active ? "#111" : "transparent",
      color: active ? "#fff" : "#666",
      cursor: "pointer",
    }),
    scoreStrip: {
      display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
      gap: 8, marginBottom: "1.25rem",
    },
    scoreCell: {
      background: "#f5f5f5", borderRadius: 8,
      padding: "10px 8px", textAlign: "center",
    },
    scoreLabel: { fontSize: 11, color: "#888", letterSpacing: "0.04em", marginBottom: 3 },
    scoreVal: { fontFamily: "monospace", fontSize: 18, fontWeight: 700 },
    livesRow: { display: "flex", gap: 6, justifyContent: "center", marginBottom: "1.25rem" },
    dot: (alive) => ({
      width: 10, height: 10, borderRadius: "50%",
      background: alive ? "#111" : "#ddd",
      transition: "all 0.3s",
    }),
    card: {
      border: "0.5px solid #ddd", borderRadius: 12,
      padding: "1.75rem 1.5rem 1.25rem",
      marginBottom: "1rem", textAlign: "center",
      position: "relative", overflow: "hidden",
    },
    accentBar: {
      position: "absolute", top: 0, left: 0, right: 0,
      height: 3, background: accent, borderRadius: "2px 2px 0 0",
    },
    opBadge: {
      display: "inline-block", fontSize: 11, fontWeight: 500,
      letterSpacing: "0.08em", color: "#888",
      background: "#f0f0f0", borderRadius: 20,
      padding: "3px 10px", marginBottom: "1rem",
    },
    expr: {
      fontFamily: "monospace", fontSize: 40,
      fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1,
    },
    timerWrap: {
      marginTop: "1.25rem", height: 3,
      background: "#eee", borderRadius: 3, overflow: "hidden",
    },
    timerBar: {
      height: "100%", borderRadius: 3,
      background: timerColor, width: timerPct + "%",
      transition: "width 0.1s linear, background 0.3s",
    },
    inputRow: { display: "flex", gap: 8, marginBottom: "1rem" },
    input: {
      flex: 1, fontFamily: "monospace", fontSize: 22,
      fontWeight: 700, padding: "12px 16px",
      borderRadius: 8, border: "0.5px solid #ccc",
      background: "#f9f9f9", textAlign: "center", outline: "none",
    },
    submitBtn: {
      padding: "12px 18px", fontSize: 15, fontWeight: 500,
      borderRadius: 8, border: "none",
      background: "#111", color: "#fff",
      cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
    },
    feedbackCard: (type) => ({
      borderRadius: 12, border: "0.5px solid #ddd",
      padding: "1.25rem 1.5rem", marginBottom: "1rem",
      display: "flex", alignItems: "center", gap: 12,
      background: type === "correct" ? "#EAF3DE" : type === "wrong" ? "#FCEBEB" : "#FAEEDA",
    }),
    feedbackIcon: (type) => ({
      width: 40, height: 40, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "monospace", fontWeight: 700, fontSize: 18,
      background: type === "correct" ? "#c5e5a0" : type === "wrong" ? "#f5b0b0" : "#FAC775",
      flexShrink: 0,
    }),
    nextBtn: {
      width: "100%", padding: 12, fontSize: 15, fontWeight: 500,
      borderRadius: 8, border: "0.5px solid #ccc",
      background: "transparent", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    },
    gameoverWrap: { textAlign: "center", padding: "2rem 0" },
    gameoverTitle: { fontFamily: "monospace", fontSize: 28, fontWeight: 700, marginBottom: "0.5rem" },
    restartBtn: {
      padding: "12px 32px", fontSize: 15, fontWeight: 500,
      borderRadius: 8, border: "none",
      background: "#111", color: "#fff",
      cursor: "pointer", marginTop: "1.5rem",
    },
  };

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.title}>ONE SHOT MATH</span>
        <div style={styles.statsRow}>
          <div style={styles.pill}>⭐ <strong>{score}</strong></div>
          <div style={styles.pill}>🔥 <strong>{streak}</strong></div>
        </div>
      </div>

      {/* Difficulty */}
      <div style={styles.diffRow}>
        {["easy", "medium", "hard"].map((d) => (
          <button key={d} style={styles.diffBtn(diff === d)} onClick={() => handleDiff(d)}>
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {/* Score strip */}
      <div style={styles.scoreStrip}>
        {[["SCORE", score], ["BEST", best], ["SOLVED", solved]].map(([label, val]) => (
          <div key={label} style={styles.scoreCell}>
            <div style={styles.scoreLabel}>{label}</div>
            <div style={styles.scoreVal}>{val}</div>
          </div>
        ))}
      </div>

      {/* Lives */}
      <div style={styles.livesRow}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={styles.dot(i < lives)} />
        ))}
      </div>

      {/* Game area */}
      {phase === "gameover" ? (
        <div style={styles.gameoverWrap}>
          <div style={{ fontSize: 48, marginBottom: "1rem" }}>
            {score >= 200 ? "🥇" : score >= 100 ? "🥈" : "🥉"}
          </div>
          <div style={styles.gameoverTitle}>Game Over</div>
          <div style={{ fontSize: 14, color: "#888" }}>
            You solved {solved} question{solved !== 1 ? "s" : ""} · Final score: {score}
          </div>
          <button style={styles.restartBtn} onClick={() => resetGame()}>Play again</button>
        </div>
      ) : (
        <>
          {/* Question card */}
          <div style={styles.card}>
            <div style={styles.accentBar} />
            <div style={styles.opBadge}>{opName(question.op)}</div>
            <div style={styles.expr}>
              {question.a} {question.op} {question.b} ={" "}
              {phase === "result" ? (
                <span style={{ color: resultType === "correct" ? "#3B6D11" : "#A32D2D" }}>
                  {question.answer}
                </span>
              ) : "?"}
            </div>
            {phase === "question" && (
              <div style={styles.timerWrap}>
                <div style={styles.timerBar} />
              </div>
            )}
          </div>

          {phase === "question" && (
            <div style={styles.inputRow}>
              <input
                ref={inputRef}
                style={styles.input}
                type="number"
                placeholder="?"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                autoComplete="off"
              />
              <button style={styles.submitBtn} onClick={submit}>→</button>
            </div>
          )}

          {phase === "result" && resultType && (
            <>
              <div style={styles.feedbackCard(resultType)}>
                <div style={styles.feedbackIcon(resultType)}>
                  {resultType === "correct" ? "✓" : resultType === "wrong" ? "✗" : "⏱"}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
                    {resultType === "correct"
                      ? streak > 2 ? `${streak} in a row!` : "Correct!"
                      : resultType === "wrong" ? "Wrong answer" : "Time's up!"}
                  </div>
                  <div style={{ fontSize: 14, color: "#666" }}>
                    {resultType === "correct"
                      ? `+${DIFFS[diff].points} pts · Time bonus added`
                      : `The answer was ${question.answer}`}
                  </div>
                </div>
              </div>
              <button style={styles.nextBtn} onClick={() => nextQuestion(diff)}>
                Next question →
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}