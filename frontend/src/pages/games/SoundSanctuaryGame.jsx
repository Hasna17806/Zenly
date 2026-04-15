// SoundSanctuaryGame.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import GameControls from "../../components/GameControls";
import axios from "axios";

const SOUNDS = [
  { id: "rain", name: "Rain", emoji: "🌧️", color: "#60a5fa", description: "Gentle rainfall" },
  { id: "waves", name: "Ocean Waves", emoji: "🌊", color: "#5eead4", description: "Calming seas" },
  { id: "forest", name: "Forest", emoji: "🌲", color: "#84cc16", description: "Birds & leaves" },
  { id: "fire", name: "Fireplace", emoji: "🔥", color: "#fbbf24", description: "Warm crackling" },
  { id: "wind", name: "Wind", emoji: "💨", color: "#a78bfa", description: "Soft breeze" },
  { id: "singingbowl", name: "Singing Bowl", emoji: "🕯️", color: "#f472b6", description: "Tibetan tones" },
];

const BREATHING_GUIDE = [
  { phase: "Breathe In", duration: 4000, instruction: "Fill your lungs with peace..." },
  { phase: "Hold", duration: 4000, instruction: "Hold gently..." },
  { phase: "Breathe Out", duration: 6000, instruction: "Release all tension..." },
];

const SoundSanctuaryGame = () => {
  const navigate = useNavigate();
  const [volumes, setVolumes] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showStop, setShowStop] = useState(false);
  const [minutesListened, setMinutesListened] = useState(0);
  
  const audioRefs = useRef({});
  const breathIntervalRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize audio elements
  useEffect(() => {
    SOUNDS.forEach(sound => {
      // Create audio context for each sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      // For demo, we'll use pre-recorded web audio oscillators
      // In production, replace with actual audio files
      audioRefs.current[sound.id] = { context: audioContext, source: null, gain: null };
    });
    
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio.context) audio.context.close();
      });
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const createSoundSource = (soundId, volume) => {
    const audio = audioRefs.current[soundId];
    if (!audio || !audio.context) return null;
    
    // Create oscillator for demonstration (replace with actual audio files in production)
    const oscillator = audio.context.createOscillator();
    const gain = audio.context.createGain();
    
    // Set different frequencies for different sounds
    const frequencies = {
      rain: 200,
      waves: 150,
      forest: 300,
      fire: 100,
      wind: 250,
      singingbowl: 440
    };
    
    oscillator.type = "sine";
    oscillator.frequency.value = frequencies[soundId] || 200;
    oscillator.connect(gain);
    gain.connect(audio.context.destination);
    gain.gain.value = volume / 100;
    
    oscillator.start();
    
    return { oscillator, gain };
  };

  const toggleSound = (soundId) => {
    const newVolume = volumes[soundId] ? 0 : 50;
    setVolumes(prev => ({ ...prev, [soundId]: newVolume }));
    
    if (newVolume > 0 && isPlaying) {
      const source = createSoundSource(soundId, newVolume);
      if (source) {
        audioRefs.current[soundId].source = source;
        audioRefs.current[soundId].gain = source.gain;
      }
    } else if (audioRefs.current[soundId].source) {
      audioRefs.current[soundId].source.oscillator.stop();
      audioRefs.current[soundId].source = null;
    }
  };

  const updateVolume = (soundId, newVolume) => {
    setVolumes(prev => ({ ...prev, [soundId]: newVolume }));
    
    if (audioRefs.current[soundId]?.gain) {
      audioRefs.current[soundId].gain.gain.value = newVolume / 100;
    } else if (newVolume > 0 && isPlaying) {
      const source = createSoundSource(soundId, newVolume);
      if (source) {
        audioRefs.current[soundId].source = source;
        audioRefs.current[soundId].gain = source.gain;
      }
    }
  };

  const startSession = () => {
    setIsPlaying(true);
    
    // Start timer for session duration
    timerRef.current = setInterval(() => {
      setMinutesListened(prev => {
        if (prev >= 4) {
          completeSession();
          return prev;
        }
        return prev + 1;
      });
    }, 60000);
  };

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathPhase(0);
    
    let phaseIndex = 0;
    breathIntervalRef.current = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % BREATHING_GUIDE.length;
      setBreathPhase(phaseIndex);
    }, BREATHING_GUIDE[phaseIndex]?.duration || 4000);
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
  };

  const stopAllSounds = () => {
    Object.keys(audioRefs.current).forEach(soundId => {
      if (audioRefs.current[soundId]?.source) {
        audioRefs.current[soundId].source.oscillator.stop();
        audioRefs.current[soundId].source = null;
      }
    });
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    stopBreathing();
  };

  const completeSession = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      await axios.post(
        "http://localhost:5000/api/completed-challenges",
        { minutesListened: minutesListened + 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      stopAllSounds();
      setShowCompletion(true);
      setTimeout(() => navigate("/challenges"), 3000);
    } catch (err) {
      console.error(err);
      alert("Could not complete session");
    }
  };

  const currentBreathPhase = BREATHING_GUIDE[breathPhase];

  return (
    <>
      <style>{`
        .ss-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        }
        .ss-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }
        .ss-sound-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }
        .ss-sound-card {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 1.2rem;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s;
        }
        .ss-sound-card:hover {
          transform: translateY(-4px);
          background: rgba(255,255,255,0.12);
        }
        .ss-sound-header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1rem;
        }
        .ss-sound-emoji {
          font-size: 2rem;
        }
        .ss-sound-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: white;
        }
        .ss-sound-desc {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.5);
          margin-bottom: 1rem;
        }
        .ss-volume-slider {
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          outline: none;
        }
        .ss-volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #5eead4;
          cursor: pointer;
        }
        .ss-play-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #5eead4, #a78bfa);
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.2s;
          margin: 1rem auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ss-play-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(94,234,212,0.3);
        }
        .ss-breathing-card {
          background: rgba(94,234,212,0.1);
          border: 1px solid rgba(94,234,212,0.3);
          border-radius: 24px;
          padding: 1.5rem;
          text-align: center;
          margin-top: 2rem;
        }
        .ss-breath-phase {
          font-size: 1.8rem;
          font-weight: 600;
          color: #5eead4;
          margin-bottom: 0.5rem;
        }
        .ss-breath-instruction {
          color: rgba(255,255,255,0.7);
          font-size: 1rem;
        }
        .ss-breath-toggle {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 0.8rem 1.5rem;
          border-radius: 40px;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s;
        }
        .ss-breath-toggle:hover {
          background: rgba(94,234,212,0.2);
          border-color: #5eead4;
        }
        .ss-timer {
          text-align: center;
          color: white;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }
      `}</style>

      <div className="ss-root">
        <Navbar />
        
        <main className="ss-container">
          <div className="ct-badge" style={{ textAlign: 'center' }}>✦ Sound Sanctuary</div>
          <h1 className="ct-title" style={{ textAlign: 'center' }}>Sound Sanctuary</h1>
          <p className="ct-sub" style={{ textAlign: 'center' }}>Create your perfect soundscape</p>
          
          {!isPlaying ? (
            <button className="ss-play-btn" onClick={startSession}>
              ▶ Start Session
            </button>
          ) : (
            <>
              <div className="ss-timer">
                🎧 Listening: {minutesListened + 1} min / 5 min
              </div>
              
              <div className="ss-sound-grid">
                {SOUNDS.map((sound) => (
                  <div key={sound.id} className="ss-sound-card">
                    <div className="ss-sound-header">
                      <span className="ss-sound-emoji">{sound.emoji}</span>
                      <span className="ss-sound-name">{sound.name}</span>
                    </div>
                    <div className="ss-sound-desc">{sound.description}</div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volumes[sound.id] || 0}
                      onChange={(e) => updateVolume(sound.id, parseInt(e.target.value))}
                      className="ss-volume-slider"
                      style={{ background: `linear-gradient(90deg, ${sound.color} ${volumes[sound.id] || 0}%, rgba(255,255,255,0.2) ${volumes[sound.id] || 0}%)` }}
                    />
                  </div>
                ))}
              </div>
              
              <div className="ss-breathing-card">
                {isBreathing ? (
                  <>
                    <div className="ss-breath-phase">{currentBreathPhase?.phase}</div>
                    <div className="ss-breath-instruction">{currentBreathPhase?.instruction}</div>
                    <button className="ss-breath-toggle" onClick={stopBreathing}>
                      Stop Breathing Guide
                    </button>
                  </>
                ) : (
                  <>
                    <div className="ss-breath-instruction">Enhance your relaxation with guided breathing</div>
                    <button className="ss-breath-toggle" onClick={startBreathing}>
                      🌬️ Start Breathing Guide
                    </button>
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
        </main>
        
        <Footer />
      </div>
      
      {/* Stop Modal */}
      {showStop && (
        <div className="ct-overlay">
          <div className="ct-modal">
            <span className="ct-modal-icon">🎵</span>
            <h3 className="ct-modal-title">Leave your sanctuary?</h3>
            <p className="ct-modal-sub">Your soundscape will fade away.</p>
            <div className="ct-modal-btns">
              <button className="ct-btn-ghost" onClick={() => setShowStop(false)}>Stay</button>
              <button className="ct-btn-danger" onClick={stopAllSounds}>Leave</button>
            </div>
          </div>
        </div>
      )}
      
      {showCompletion && (
        <div className="ct-overlay">
          <div className="ct-modal">
            <span className="ct-modal-icon">🎧</span>
            <h3 className="ct-modal-title">You found your calm</h3>
            <p className="ct-modal-sub">Your mind and body thank you for this peaceful moment.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default SoundSanctuaryGame;