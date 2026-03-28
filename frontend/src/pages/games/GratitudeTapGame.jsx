import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const prompts = [
  "Someone who helped you recently",
  "Something small that made you smile today",
  "A skill or talent you are proud of",
  "A place that makes you feel peaceful",
  "Something you learned this week",
  "A friend who supports you",
  "A challenge that made you stronger"
];

/* ── Floating heart particle ── */
const FloatingHeart = ({ id, onDone }) => {
  const size = 14 + Math.random() * 14;
  const left = 30 + Math.random() * 40;
  const dur  = 1.2 + Math.random() * 0.8;
  useEffect(() => {
    const t = setTimeout(onDone, dur * 1000 + 200);
    return () => clearTimeout(t);
  }, []);
  return (
    <span style={{
      position: 'absolute',
      left: `${left}%`,
      bottom: '60%',
      fontSize: `${size}px`,
      animation: `heartRise ${dur}s ease-out forwards`,
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 10,
    }}>❤️</span>
  );
};

const GratitudeTapGame = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const challenge = location.state?.challenge;

  const [gratitude, setGratitude] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errorMsg,  setErrorMsg]  = useState("");
  const [prompt,    setPrompt]    = useState(() => prompts[Math.floor(Math.random() * prompts.length)]);
  const [taps,      setTaps]      = useState(0);
  const [hearts,    setHearts]    = useState([]);
  const [tapScale,  setTapScale]  = useState(false);
  const [charCount, setCharCount] = useState(0);
  const heartIdRef = useRef(0);

  const MAX_CHARS = 300;

  const handleTap = () => {
    setTaps(p => p + 1);
    setTapScale(true);
    setTimeout(() => setTapScale(false), 150);
    const id = heartIdRef.current++;
    setHearts(h => [...h, id]);
  };

  const removeHeart = (id) => setHearts(h => h.filter(x => x !== id));

  const newPrompt = () => {
    let r;
    do { r = prompts[Math.floor(Math.random() * prompts.length)]; } while (r === prompt);
    setPrompt(r);
  };

  const handleChange = (e) => {
    if (e.target.value.length <= MAX_CHARS) {
      setGratitude(e.target.value);
      setCharCount(e.target.value.length);
    }
  };

  const handleSubmit = async () => {
    if (!gratitude.trim()) { setErrorMsg("Please write something you are grateful for."); return; }
    if (taps === 0)         { setErrorMsg("Tap appreciation at least once ❤️"); return; }
    try {
      setLoading(true); setErrorMsg("");
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post("http://localhost:5000/api/completed-challenges",
        { challengeId: challenge?._id, gratitude, taps },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
      setTimeout(() => navigate("/challenges"), 3500);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tapBarWidth = Math.min(taps * 10, 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --bg: #0d0a0f;
          --surface: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --rose: #fb7185;
          --amber: #fbbf24;
          --mauve: #c084fc;
          --text: #f5f0ff;
          --muted: #8b7fa8;
          --radius: 24px;
        }

        .gt-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 75% 55% at 50% -8%, rgba(251,113,133,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 45% 35% at 5% 95%, rgba(251,191,36,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 95% 80%, rgba(192,132,252,0.1) 0%, transparent 55%);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text);
        }

        .gt-main { padding: 5rem 1.5rem 4rem; display: flex; justify-content: center; }

        .gt-wrap { width: 100%; max-width: 500px; }

        .gt-header { text-align: center; margin-bottom: 2.2rem; }
        .gt-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(251,113,133,0.12);
          border: 1px solid rgba(251,113,133,0.25);
          color: #fda4af;
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.35rem 0.9rem; border-radius: 50px;
          margin-bottom: 1rem;
        }
        .gt-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5vw, 2.6rem);
          font-weight: 500;
          background: linear-gradient(135deg, #fda4af 0%, #f472b6 40%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 0.4rem;
          line-height: 1.2;
        }
        .gt-sub { color: var(--muted); font-size: 0.92rem; font-weight: 400; }

        /* ── Card ── */
        .gt-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.8rem;
          margin-bottom: 1rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
        }
        .gt-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(251,113,133,0.3), transparent);
        }

        /* Prompt card */
        .gt-prompt-label {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 0.7rem;
        }
        .gt-prompt-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem; font-weight: 400;
          color: var(--text); line-height: 1.5;
          margin-bottom: 1rem;
        }
        .gt-prompt-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.78rem; font-weight: 600;
          padding: 0.4rem 0.9rem;
          border-radius: 50px; cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .gt-prompt-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }

        /* Textarea */
        .gt-textarea-wrap { position: relative; }
        .gt-textarea {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.03);
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 1rem 1.1rem;
          color: var(--text);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.95rem; font-weight: 400;
          line-height: 1.7; resize: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .gt-textarea::placeholder { color: var(--muted); }
        .gt-textarea:focus {
          border-color: rgba(251,113,133,0.5);
          box-shadow: 0 0 0 3px rgba(251,113,133,0.08);
        }
        .gt-char-count {
          text-align: right; font-size: 0.72rem; color: var(--muted);
          margin-top: 0.4rem;
        }

        /* Tap section */
        .gt-tap-section { text-align: center; position: relative; }
        .gt-tap-btn {
          position: relative;
          display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem;
          padding: 1rem 2.2rem;
          background: linear-gradient(135deg, rgba(251,113,133,0.15), rgba(244,114,182,0.1));
          border: 1.5px solid rgba(251,113,133,0.35);
          color: #fda4af;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1rem; font-weight: 700;
          border-radius: 50px; cursor: pointer;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(251,113,133,0.15);
          user-select: none; -webkit-tap-highlight-color: transparent;
        }
        .gt-tap-btn:hover {
          background: linear-gradient(135deg, rgba(251,113,133,0.22), rgba(244,114,182,0.16));
          border-color: rgba(251,113,133,0.6);
          box-shadow: 0 6px 28px rgba(251,113,133,0.25);
        }
        .gt-tap-btn.scaled { transform: scale(0.93); }

        .gt-tap-meta { margin-top: 1rem; }
        .gt-tap-count {
          font-size: 0.8rem; color: var(--muted); margin-bottom: 0.5rem;
        }
        .gt-tap-count span { color: var(--rose); font-weight: 700; }
        .gt-tap-bar-track {
          height: 3px; background: rgba(255,255,255,0.06);
          border-radius: 3px; overflow: hidden;
        }
        .gt-tap-bar-fill {
          height: 100%; border-radius: 3px;
          background: linear-gradient(90deg, #fb7185, #f472b6);
          transition: width 0.4s cubic-bezier(0.34,1.5,0.64,1);
        }

        /* Error */
        .gt-error {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(251,113,133,0.08);
          border: 1px solid rgba(251,113,133,0.2);
          color: #fda4af;
          font-size: 0.85rem; font-weight: 500;
          padding: 0.75rem 1rem; border-radius: 12px;
        }

        /* Submit */
        .gt-submit {
          width: 100%; padding: 1rem;
          background: linear-gradient(135deg, #f472b6, #c084fc);
          color: white;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1rem; font-weight: 700;
          border: none; border-radius: 16px; cursor: pointer;
          box-shadow: 0 8px 30px rgba(244,114,182,0.35);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s;
          letter-spacing: 0.02em;
        }
        .gt-submit:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(244,114,182,0.45); }
        .gt-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* ── Success ── */
        .gt-success {
          text-align: center;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 3rem 2rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 40px 80px rgba(0,0,0,0.4);
          animation: popIn 0.5s cubic-bezier(0.34,1.5,0.64,1) both;
        }
        .gt-success-icon { font-size: 4rem; animation: floatIcon 3s ease-in-out infinite; display: block; margin-bottom: 1rem; }
        .gt-success-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem; margin: 0 0 0.4rem;
          background: linear-gradient(135deg, #fda4af, #c084fc);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .gt-success-sub { color: var(--muted); font-size: 0.9rem; margin-bottom: 1.8rem; }
        .gt-quote-box {
          background: rgba(251,113,133,0.06);
          border: 1px solid rgba(251,113,133,0.15);
          border-radius: 16px; padding: 1.2rem 1.5rem;
          margin-bottom: 1.2rem; text-align: left;
        }
        .gt-quote-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem; color: var(--text);
          line-height: 1.6; font-style: italic;
        }
        .gt-quote-meta { font-size: 0.75rem; color: var(--muted); margin-top: 0.6rem; }
        .gt-redirect { font-size: 0.78rem; color: var(--muted); margin-top: 1rem; }

        /* Animations */
        @keyframes heartRise {
          0%   { transform: translateY(0) scale(0.8); opacity: 1; }
          100% { transform: translateY(-120px) scale(1.2); opacity: 0; }
        }
        @keyframes popIn {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
      `}</style>

      <div className="gt-root">
        <Navbar />

        <main className="gt-main">
          <div className="gt-wrap">

            {/* Header */}
            <div className="gt-header">
              <div className="gt-badge">✦ Daily Practice</div>
              <h1 className="gt-title">Gratitude Boost</h1>
              <p className="gt-sub">Reflect on the good — rewire your mind for positivity</p>
            </div>

            {!submitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

                {/* Prompt */}
                <div className="gt-card">
                  <p className="gt-prompt-label">✦ Today's prompt</p>
                  <p className="gt-prompt-text">{prompt}</p>
                  <button className="gt-prompt-btn" onClick={newPrompt}>↻ New prompt</button>
                </div>

                {/* Textarea */}
                <div className="gt-card">
                  <p className="gt-prompt-label">✦ Your gratitude</p>
                  <div className="gt-textarea-wrap">
                    <textarea
                      className="gt-textarea"
                      value={gratitude}
                      onChange={handleChange}
                      placeholder="Write what you are grateful for..."
                      rows={4}
                    />
                  </div>
                  <p className="gt-char-count">{charCount} / {MAX_CHARS}</p>
                </div>

                {/* Tap */}
                <div className="gt-card">
                  <p className="gt-prompt-label" style={{ textAlign: 'center' }}>✦ Send appreciation</p>
                  <div className="gt-tap-section">
                    {/* Floating hearts */}
                    {hearts.map(id => <FloatingHeart key={id} id={id} onDone={() => removeHeart(id)} />)}
                    <button
                      className={`gt-tap-btn ${tapScale ? 'scaled' : ''}`}
                      onClick={handleTap}
                    >
                      <span>❤️</span> Tap to Appreciate
                    </button>
                    <div className="gt-tap-meta">
                      <p className="gt-tap-count">
                        Appreciation taps: <span>{taps}</span>
                      </p>
                      <div className="gt-tap-bar-track">
                        <div className="gt-tap-bar-fill" style={{ width: `${tapBarWidth}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {errorMsg && (
                  <div className="gt-error">
                    <span>⚠️</span> {errorMsg}
                  </div>
                )}

                {/* Submit */}
                <button className="gt-submit" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : "Complete Challenge →"}
                </button>

              </div>
            ) : (
              <div className="gt-success">
                <span className="gt-success-icon">🌸</span>
                <h2 className="gt-success-title">Challenge Complete!</h2>
                <p className="gt-success-sub">Gratitude rewires your brain for positivity.</p>

                <div className="gt-quote-box">
                  <p className="gt-quote-text">"{gratitude}"</p>
                  <p className="gt-quote-meta">
                    {taps} appreciation tap{taps !== 1 ? 's' : ''} sent
                  </p>
                </div>

                <p className="gt-redirect">Returning to challenges in a moment…</p>
              </div>
            )}

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default GratitudeTapGame;