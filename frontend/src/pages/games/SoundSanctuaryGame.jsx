import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import GameControls from "../../components/GameControls";
import axios from "axios";

const SOUNDS = [
  { id: "rain",        name: "Rain",         emoji: "🌧️", color: "#60a5fa", glow: "rgba(96,165,250,0.3)",   description: "Gentle rainfall" },
  { id: "waves",       name: "Ocean Waves",  emoji: "🌊", color: "#5eead4", glow: "rgba(94,234,212,0.3)",   description: "Calming seas" },
  { id: "forest",      name: "Forest",       emoji: "🌲", color: "#86efac", glow: "rgba(134,239,172,0.3)",  description: "Birds & leaves" },
  { id: "fire",        name: "Fireplace",    emoji: "🔥", color: "#fbbf24", glow: "rgba(251,191,36,0.3)",   description: "Warm crackling" },
  { id: "wind",        name: "Wind",         emoji: "💨", color: "#c4b5fd", glow: "rgba(196,181,253,0.3)",  description: "Soft breeze" },
  { id: "singingbowl", name: "Singing Bowl", emoji: "🔔", color: "#f9a8d4", glow: "rgba(249,168,212,0.3)",  description: "Tibetan tones" },
];

const BREATHING_PHASES = [
  { phase: "Breathe In",  duration: 4000, instruction: "Fill your lungs with peace…",  scale: 1.4, color: "#60a5fa" },
  { phase: "Hold",        duration: 4000, instruction: "Hold gently…",                  scale: 1.15, color: "#c4b5fd" },
  { phase: "Breathe Out", duration: 6000, instruction: "Release all tension…",          scale: 0.75, color: "#5eead4" },
];

/* ── Ambient orb that pulses with breath ── */
const BreathOrb = ({ phase }) => {
  const cfg = BREATHING_PHASES[phase] ?? BREATHING_PHASES[0];
  return (
    <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 1.2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Outer glow ring */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        border: `1.5px solid ${cfg.color}40`,
        transform: `scale(${cfg.scale * 1.25})`,
        transition: `transform ${cfg.duration}ms ease-in-out, border-color ${cfg.duration}ms ease`,
      }} />
      {/* Main orb */}
      <div style={{
        width: 100, height: 100, borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${cfg.color}cc, ${cfg.color}55)`,
        boxShadow: `0 0 40px ${cfg.color}55, 0 0 80px ${cfg.color}22`,
        transform: `scale(${cfg.scale})`,
        transition: `transform ${cfg.duration}ms cubic-bezier(0.4,0,0.2,1), background ${cfg.duration}ms ease, box-shadow ${cfg.duration}ms ease`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "0.7rem", fontStyle: "italic", color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.2 }}>
          {cfg.phase}
        </div>
      </div>
    </div>
  );
};

/* ── Sound card ── */
const SoundCard = ({ sound, volume, onChange }) => {
  const active = volume > 0;
  return (
    <div style={{
      background: active ? `rgba(${hexToRgb(sound.color)},0.1)` : "rgba(255,255,255,0.03)",
      border: `1.5px solid ${active ? sound.color + "55" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 20, padding: "1.1rem 1.2rem",
      transition: "all 0.35s ease",
      boxShadow: active ? `0 0 24px ${sound.glow}` : "none",
      cursor: "pointer",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.8rem" }}>
        <span style={{ fontSize: "1.6rem", filter: active ? `drop-shadow(0 0 8px ${sound.color})` : "none", transition: "filter 0.3s" }}>{sound.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.88rem", color: active ? sound.color : "#ede9fe", transition: "color 0.3s" }}>
            {sound.name}
          </div>
          <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", marginTop: "0.1rem" }}>{sound.description}</div>
        </div>
        {/* Active dot */}
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: active ? sound.color : "rgba(255,255,255,0.1)",
          boxShadow: active ? `0 0 8px ${sound.color}` : "none",
          transition: "all 0.3s",
        }} />
      </div>
      {/* Volume slider */}
      <div style={{ position: "relative" }}>
        <input
          type="range" min="0" max="100"
          value={volume}
          onChange={e => onChange(parseInt(e.target.value))}
          style={{
            width: "100%", height: 4, appearance: "none", WebkitAppearance: "none",
            borderRadius: 4, outline: "none", cursor: "pointer",
            background: `linear-gradient(90deg, ${sound.color} ${volume}%, rgba(255,255,255,0.1) ${volume}%)`,
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
        <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.2)" }}>silent</span>
        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: active ? sound.color : "rgba(255,255,255,0.2)" }}>{volume > 0 ? `${volume}%` : "off"}</span>
        <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.2)" }}>loud</span>
      </div>
    </div>
  );
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

const SoundSanctuaryGame = () => {
  const navigate = useNavigate();

  const [volumes,        setVolumes]        = useState({});
  const [isPlaying,      setIsPlaying]      = useState(false);
  const [isBreathing,    setIsBreathing]    = useState(false);
  const [breathPhase,    setBreathPhase]    = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showStop,       setShowStop]       = useState(false);
  const [minutesListened, setMinutesListened] = useState(0);

  const audioRefs     = useRef({});
  const breathRef     = useRef(null);
  const timerRef      = useRef(null);
  const phaseIndexRef = useRef(0);

  useEffect(() => {
    SOUNDS.forEach(s => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioRefs.current[s.id] = { context: ctx, source: null, gain: null };
    });
    return () => {
      Object.values(audioRefs.current).forEach(a => { try { a.context?.close(); } catch {} });
      clearInterval(breathRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const createSoundSource = (soundId, volume) => {
    const audio = audioRefs.current[soundId];
    if (!audio?.context) return null;
    const osc  = audio.context.createOscillator();
    const gain = audio.context.createGain();
    const freqs = { rain: 200, waves: 150, forest: 300, fire: 100, wind: 250, singingbowl: 440 };
    osc.type = "sine";
    osc.frequency.value = freqs[soundId] || 200;
    osc.connect(gain);
    gain.connect(audio.context.destination);
    gain.gain.value = volume / 100;
    osc.start();
    return { oscillator: osc, gain };
  };

  const updateVolume = (soundId, newVolume) => {
    setVolumes(prev => ({ ...prev, [soundId]: newVolume }));
    if (audioRefs.current[soundId]?.gain) {
      audioRefs.current[soundId].gain.gain.value = newVolume / 100;
    } else if (newVolume > 0 && isPlaying) {
      const src = createSoundSource(soundId, newVolume);
      if (src) { audioRefs.current[soundId].source = src; audioRefs.current[soundId].gain = src.gain; }
    }
  };

  const startSession = () => {
    setIsPlaying(true);
    timerRef.current = setInterval(() => {
      setMinutesListened(prev => {
        if (prev >= 4) { completeSession(); return prev; }
        return prev + 1;
      });
    }, 60000);
  };

  const advanceBreath = (currentIndex) => {
    const nextIndex = (currentIndex + 1) % BREATHING_PHASES.length;
    phaseIndexRef.current = nextIndex;
    setBreathPhase(nextIndex);
    clearTimeout(breathRef.current);
    breathRef.current = setTimeout(() => advanceBreath(nextIndex), BREATHING_PHASES[nextIndex].duration);
  };

  const startBreathing = () => {
    setIsBreathing(true);
    phaseIndexRef.current = 0;
    setBreathPhase(0);
    breathRef.current = setTimeout(() => advanceBreath(0), BREATHING_PHASES[0].duration);
  };

  const stopBreathing = () => { setIsBreathing(false); clearTimeout(breathRef.current); };

  const stopAllSounds = () => {
    Object.keys(audioRefs.current).forEach(id => {
      try { audioRefs.current[id]?.source?.oscillator?.stop(); } catch {}
      audioRefs.current[id].source = null;
    });
    setIsPlaying(false);
    clearInterval(timerRef.current);
    stopBreathing();
    setShowStop(false);
  };

  const completeSession = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post("http://localhost:5000/api/completed-challenges",
        { minutesListened: minutesListened + 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {}
    stopAllSounds();
    setShowCompletion(true);
    setTimeout(() => navigate("/challenges"), 3000);
  };

  const activeCount    = Object.values(volumes).filter(v => v > 0).length;
  const progressWidth  = ((minutesListened) / 5) * 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --bg: #040810;
          --surface: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.07);
          --teal: #5eead4;
          --blue: #60a5fa;
          --text: #e8f4ff;
          --muted: #5a6a8a;
          --radius: 24px;
        }

        .ss-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 90% 60% at 50% -10%, rgba(15,30,80,0.9) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 10% 100%, rgba(94,234,212,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 90% 80%, rgba(96,165,250,0.07) 0%, transparent 55%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
        }

        /* Stars */
        .ss-stars {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }
        .ss-star {
          position: absolute; border-radius: 50%;
          background: white;
          animation: twinkle var(--dur) ease-in-out infinite var(--delay);
        }

        .ss-main { padding: 5rem 1.5rem 4rem; position: relative; z-index: 1; }
        .ss-inner { max-width: 680px; margin: 0 auto; }

        /* Header */
        .ss-header { text-align: center; margin-bottom: 2rem; }
        .ss-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(94,234,212,0.08); border: 1px solid rgba(94,234,212,0.2);
          color: #5eead4; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.35rem 0.9rem; border-radius: 50px; margin-bottom: 0.9rem;
        }
        .ss-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2rem, 5vw, 2.8rem);
          background: linear-gradient(135deg, #bae6fd 0%, #5eead4 50%, #a5b4fc 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.3rem;
        }
        .ss-sub { color: var(--muted); font-size: 0.9rem; }

        /* Ready card */
        .ss-ready-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 2.5rem 2rem; text-align: center;
          backdrop-filter: blur(20px);
          box-shadow: 0 50px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
          position: relative; overflow: hidden;
        }
        .ss-ready-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(94,234,212,0.3), transparent);
        }
        .ss-ready-icon { font-size: 4rem; margin-bottom: 1rem; display: block; animation: floatIcon 4s ease-in-out infinite; }
        .ss-sounds-preview {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem;
          margin: 1.2rem 0 1.8rem;
        }
        .ss-preview-chip {
          display: flex; align-items: center; gap: 0.3rem;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          border-radius: 50px; padding: 0.3rem 0.7rem;
          font-size: 0.75rem; color: rgba(255,255,255,0.4);
        }
        .ss-start-btn {
          width: 100%; padding: 1.05rem;
          background: linear-gradient(135deg, #0e7490, #5eead4);
          color: #041014; font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 700;
          border: none; border-radius: 16px; cursor: pointer;
          box-shadow: 0 8px 32px rgba(94,234,212,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ss-start-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(94,234,212,0.45); }

        /* Session layout */
        .ss-session-header {
          display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.2rem;
        }
        .ss-session-stat {
          flex: 1; background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 0.65rem 0.8rem; text-align: center;
        }
        .ss-session-stat-val {
          font-family: 'DM Serif Display', serif; font-size: 1.4rem; line-height: 1;
        }
        .ss-session-stat-lbl { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 0.15rem; }

        /* Progress */
        .ss-prog-track { height: 3px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-bottom: 1.2rem; }
        .ss-prog-fill {
          height: 100%; border-radius: 3px;
          background: linear-gradient(90deg, #0e7490, #5eead4, #a5b4fc);
          transition: width 60s linear;
        }

        /* Sound grid */
        .ss-sound-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem;
          margin-bottom: 1rem;
        }

        /* Breathing section */
        .ss-breath-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 1.8rem 1.5rem; text-align: center;
          margin-bottom: 1rem; backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
          position: relative; overflow: hidden;
          transition: border-color 0.4s;
        }
        .ss-breath-card.active { border-color: rgba(94,234,212,0.25); }
        .ss-breath-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(94,234,212,0.2), transparent);
        }
        .ss-breath-lbl { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.6rem; }
        .ss-breath-phase-text {
          font-family: 'DM Serif Display', serif; font-size: 1.4rem;
          color: var(--text); margin-bottom: 0.2rem;
        }
        .ss-breath-instruction { font-size: 0.85rem; color: var(--muted); font-style: italic; margin-bottom: 1.2rem; }
        .ss-breath-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1.4rem;
          background: rgba(94,234,212,0.08); border: 1px solid rgba(94,234,212,0.25);
          color: #5eead4; font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; font-weight: 600;
          border-radius: 50px; cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .ss-breath-btn:hover { background: rgba(94,234,212,0.15); box-shadow: 0 0 20px rgba(94,234,212,0.15); }
        .ss-breath-btn.stop { background: rgba(248,113,113,0.08); border-color: rgba(248,113,113,0.25); color: #fca5a5; }
        .ss-breath-btn.stop:hover { background: rgba(248,113,113,0.15); }

        /* ── Modals ── */
        .ss-overlay {
          position: fixed; inset: 0;
          background: rgba(2,5,12,0.9); backdrop-filter: blur(16px);
          display: flex; align-items: center; justify-content: center;
          z-index: 300; animation: fadeIn 0.3s ease; padding: 1.5rem;
        }
        .ss-modal {
          background: #060c18; border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius); padding: 2.5rem 2rem;
          max-width: 360px; width: 100%; text-align: center;
          box-shadow: 0 60px 100px rgba(0,0,0,0.8);
          animation: popIn 0.45s cubic-bezier(0.34,1.5,0.64,1) both;
          position: relative; overflow: hidden;
        }
        .ss-modal::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(94,234,212,0.35), transparent);
        }
        .ss-modal-icon { font-size: 3.5rem; display: block; animation: floatIcon 3s ease-in-out infinite; margin-bottom: 0.8rem; }
        .ss-modal-title {
          font-family: 'DM Serif Display', serif; font-size: 1.9rem;
          background: linear-gradient(135deg, #bae6fd, #5eead4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 0.4rem;
        }
        .ss-modal-sub { color: var(--muted); font-size: 0.88rem; margin-bottom: 1.6rem; line-height: 1.6; }
        .ss-modal-btns { display: flex; gap: 0.8rem; }
        .ss-btn-ghost {
          flex: 1; padding: 0.9rem;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          color: var(--muted); font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 600;
          border-radius: 14px; cursor: pointer; transition: color 0.2s, border-color 0.2s;
        }
        .ss-btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
        .ss-btn-danger {
          flex: 1; padding: 0.9rem;
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          border: none; border-radius: 14px; cursor: pointer; transition: transform 0.15s;
        }
        .ss-btn-danger:hover { transform: translateY(-2px); }

        /* Slider thumb */
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%; cursor: pointer;
          background: white;
          box-shadow: 0 0 6px rgba(255,255,255,0.4);
          transition: transform 0.15s;
        }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.3); }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 4px; outline: none; cursor: pointer; }

        /* Keyframes */
        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes popIn {
          from { transform: scale(0.82); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes twinkle {
          0%,100% { opacity: 0.1; transform: scale(1); }
          50%     { opacity: 0.7; transform: scale(1.5); }
        }
      `}</style>

      {/* Starfield */}
      <div className="ss-stars" aria-hidden>
        {Array.from({ length: 60 }, (_, i) => (
          <div key={i} className="ss-star" style={{
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            "--dur": `${2 + Math.random() * 4}s`,
            "--delay": `${Math.random() * 4}s`,
          }} />
        ))}
      </div>

      <div className="ss-root">
        <Navbar />

        <main className="ss-main">
          <div className="ss-inner">

            {/* Header */}
            <div className="ss-header">
              <div className="ss-badge">✦ Sound Sanctuary</div>
              <h1 className="ss-title">Sound Sanctuary</h1>
              <p className="ss-sub">Craft your perfect soundscape and find stillness</p>
            </div>

            {/* ── Ready ── */}
            {!isPlaying && (
              <div className="ss-ready-card">
                <span className="ss-ready-icon">🎧</span>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "0.3rem" }}>
                  Blend up to 6 ambient sounds into your perfect sanctuary.
                </p>
                <div className="ss-sounds-preview">
                  {SOUNDS.map(s => (
                    <div key={s.id} className="ss-preview-chip">
                      <span>{s.emoji}</span><span>{s.name}</span>
                    </div>
                  ))}
                </div>
                <button className="ss-start-btn" onClick={startSession}>
                  Enter the Sanctuary →
                </button>
              </div>
            )}

            {/* ── Session ── */}
            {isPlaying && (
              <>
                {/* Stats */}
                <div className="ss-session-header">
                  <div className="ss-session-stat">
                    <div className="ss-session-stat-val" style={{ color: "#5eead4" }}>{minutesListened + 1}<span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>/5</span></div>
                    <div className="ss-session-stat-lbl">Minutes</div>
                  </div>
                  <div className="ss-session-stat">
                    <div className="ss-session-stat-val" style={{ color: "#60a5fa" }}>{activeCount}</div>
                    <div className="ss-session-stat-lbl">Active sounds</div>
                  </div>
                  <div className="ss-session-stat">
                    <div className="ss-session-stat-val" style={{ color: "#c4b5fd" }}>{isBreathing ? "On" : "Off"}</div>
                    <div className="ss-session-stat-lbl">Breath guide</div>
                  </div>
                </div>

                {/* Timer progress */}
                <div className="ss-prog-track">
                  <div className="ss-prog-fill" style={{ width: `${progressWidth}%` }} />
                </div>

                {/* Sound grid */}
                <div className="ss-sound-grid">
                  {SOUNDS.map(sound => (
                    <SoundCard
                      key={sound.id}
                      sound={sound}
                      volume={volumes[sound.id] || 0}
                      onChange={v => updateVolume(sound.id, v)}
                    />
                  ))}
                </div>

                {/* Breathing guide */}
                <div className={`ss-breath-card ${isBreathing ? "active" : ""}`}>
                  <p className="ss-breath-lbl">✦ Guided breathing</p>
                  {isBreathing ? (
                    <>
                      <BreathOrb phase={breathPhase} />
                      <div className="ss-breath-phase-text">{BREATHING_PHASES[breathPhase].phase}</div>
                      <div className="ss-breath-instruction">{BREATHING_PHASES[breathPhase].instruction}</div>
                      <button className="ss-breath-btn stop" onClick={stopBreathing}>✕ Stop Guide</button>
                    </>
                  ) : (
                    <>
                      <div className="ss-breath-instruction" style={{ marginBottom: "1rem" }}>
                        Pair breathing with your soundscape for deeper calm.
                      </div>
                      <button className="ss-breath-btn" onClick={startBreathing}>🌬️ Start Breathing Guide</button>
                    </>
                  )}
                </div>

                <GameControls
                  onComplete={completeSession}
                  onStop={() => setShowStop(true)}
                  onBack={() => navigate("/challenges")}
                />
              </>
            )}

          </div>
        </main>

        <Footer />
      </div>

      {/* Stop modal */}
      {showStop && (
        <div className="ss-overlay">
          <div className="ss-modal">
            <span className="ss-modal-icon">🌙</span>
            <h3 className="ss-modal-title">Leave your sanctuary?</h3>
            <p className="ss-modal-sub">Your soundscape will fade into silence.</p>
            <div className="ss-modal-btns">
              <button className="ss-btn-ghost" onClick={() => setShowStop(false)}>Stay</button>
              <button className="ss-btn-danger" onClick={stopAllSounds}>Leave</button>
            </div>
          </div>
        </div>
      )}

      {/* Completion modal */}
      {showCompletion && (
        <div className="ss-overlay">
          <div className="ss-modal">
            <span className="ss-modal-icon">🎧</span>
            <h3 className="ss-modal-title">You found your calm</h3>
            <p className="ss-modal-sub">Your mind and body thank you for this peaceful moment. Carry this stillness with you.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default SoundSanctuaryGame;