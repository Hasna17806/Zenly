import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// SVG Icons
const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z" />
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ChallengesPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Mood Boost');
  const [challenges, setChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [justCompletedId, setJustCompletedId] = useState(null);

  const categories = [
    { name: 'Mood Boost', icon: '🌿' },
    { name: 'Study', icon: '📚' },
    { name: 'Fun', icon: '🎮' },
    { name: 'Quick Play', icon: '⚡' },
  ];

  const allChallenges = {
    'Mood Boost': [
      {
        id: 'breathe-reset',
        title: 'Breathe & Reset',
        description: 'Calm your mind with guided breathing',
        time: '3 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772258685/Mood-removebg-preview_g4psas.png',
        moodTag: ['stressed/Heavy', 'sad/Low'],
        gameType: 'breathing',
      },
      {
        id: 'gratitude-tap',
        title: 'Gratitude Tap',
        description: 'Think of one good thing today',
        time: '2 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772258870/A_flat_illustration_of_a_girl_thinking_red_shirt_right_hand_under_chin_brown_hair-removebg-preview_irnzzg.png',
        moodTag: ['sad/Low', 'calm/Okay'],
        gameType: 'gratitude',
      },
      {
        id: 'smile-challenge',
        title: 'Smile Challenge',
        description: 'Hold a gentle smile for 20 seconds',
        time: '20 secs',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772259296/Excited_Emoji__Excitement_Concept__Excited__Happy_PNG_Transparent_Image_and_Clipart_for_Free_Download-removebg-preview_ew4xyt.png',
        moodTag: ['happy/Energetic', 'calm/Okay'],
        gameType: 'smile-challenge',
      },
      {
        id: 'calm-taps',
        title: 'Calm Taps',
        description: 'Tap floating thoughts to release stress',
        time: '3 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772259297/30_Bubbles_Clipart__Iridescent_Bubbles__Foam_Water_Bubble__Baby_Shower__Printable_Watercolor-removebg-preview_scwri9.png',
        moodTag: ['stressed/Heavy', 'angry/Frustrated', 'Overthinking'],
        gameType: 'calm-taps',
      },
      {
        id: 'breath-bubble',
        title: 'Breath Bubble',
        description: 'Follow the bubble\'s rhythm to find calm',
        time: '4 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/q_auto/f_auto/v1772261663/Illustration_-_Design_Thinking_is_a_type_of_p-removebg-preview_bmfiqp.png',
        moodTag: ['stressed/Heavy', 'anxious/Worried', 'Overthinking'],
        gameType: 'breath-bubble',
      },
      {
        id: 'gratitude-catch',
        title: 'Gratitude Catch',
        description: 'Catch falling blessings before they pass',
        time: '2 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/q_auto/f_auto/v1772260740/download__45_-removebg-preview_pwu7fi.png',
        moodTag: ['sad/Low', 'calm/Okay', 'tired/Burned Out'],
        gameType: 'gratitude-catch',
      },
      {
        id: 'mindful-match',
        title: 'Mindful Match',
        description: 'Match emotions with their coping skills',
        time: '3 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772261838/Gemini_Generated_Image_ljvlyqljvlyqljvl-removebg-preview_xdhg9y.png',
        moodTag: ['calm/Okay', 'happy/Energetic'],
        gameType: 'mindful-match',
      },
      {
        id: 'affirmation-stack',
        title: 'Affirmation Stack',
        description: 'Build a tower of positive beliefs',
        time: '3 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772260605/download__42_-removebg-preview_bgh7qn.png',
        moodTag: ['sad/Low', 'stressed/Heavy', 'Self-doubt'],
        gameType: 'affirmation-stack',
      },
      {
        id: 'color-calm',
        title: 'Color Calm',
        description: 'Color a mandala and find your center',
        time: '5 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/q_auto/f_auto/v1772261034/Golden_Tourne_La_Roue_PNG___Ic%C3%B4nes_De_Roue__Tour__Roue_Fichier_PNG_et_PSD_pour_le_t%C3%A9l%C3%A9chargement_libre-removebg-preview_deahtg.png',
        moodTag: ['stressed/Heavy', 'angry/Frustrated', 'Overthinking'],
        gameType: 'color-calm',
      },
      {
        id: 'sound-sanctuary',
        title: 'Sound Sanctuary',
        description: 'Mix calming sounds to create peace',
        time: '5 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772261663/Mind_Your_Breath___and_Prosper_-_Gulfshore_Life-removebg-preview_yeuart.png',
        moodTag: ['stressed/Heavy', 'anxious/Worried', 'tired/Burned Out'],
        gameType: 'sound-sanctuary',
      },
    ],
    'Study': [
      {
        id: 'focus-sprint',
        title: 'Focus Sprint',
        description: 'Stay focused. You got this 💪',
        time: '5 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772260605/download__42_-removebg-preview_bgh7qn.png',
        moodTag: ['tired/Burned Out', 'calm/Okay'],
        gameType: 'focus-sprint',
      },
      {
        id: 'memory-flip',
        title: 'Memory Flip',
        description: 'Match pairs to exercise your brain',
        time: '3 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772261838/Gemini_Generated_Image_ljvlyqljvlyqljvl-removebg-preview_xdhg9y.png',
        moodTag: ['happy/Energetic', 'calm/Okay'],
        gameType: 'memory',
      },
      {
        id: 'quick-quiz',
        title: 'Quick Quiz',
        description: 'Test your knowledge with 3 questions',
        time: '2 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772260625/Think-removebg-preview_ynjvut.png',
        moodTag: ['happy/Energetic'],
        gameType: 'quiz',
      },
      {
        id: 'distraction-block',
        title: 'Distraction Block',
        description: 'Choose one distraction to avoid',
        time: '5 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772260740/download__45_-removebg-preview_pwu7fi.png',
        moodTag: ['tired/Burned Out', 'stressed/Heavy'],
        gameType: 'focus',
      },
    ],
    'Fun': [
      {
        id: 'guess-sound',
        title: 'Guess the Sound',
        description: 'Listen and guess the sound',
        time: '3 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772260938/Sim%C8%9Bul_auditiv-removebg-preview_eb4c2b.png',
        moodTag: ['happy/Energetic', 'calm/Okay'],
        gameType: 'sound',
      },
      {
        id: 'emoji-match',
        title: 'Mood Decode',
        description: 'Notice what you feel before it controls you.',
        time: '2 mins',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772260984/download__41_-removebg-preview_tdx3l6.png',
        moodTag: ['happy/Energetic', 'sad/Low'],
        gameType: 'matching',
      },
      {
        id: 'tap-star',
        title: 'Tap the Star',
        description: 'Tap as many stars as you can',
        time: '30 secs',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772261045/download__15_-removebg-preview_kshs3n.png',
        moodTag: ['angry/Frustrated', 'stressed/Heavy'],
        gameType: 'stars',
      },
      {
        id: 'spin-smile',
        title: 'Spin & Smile',
        description: 'Spin the wheel for a fun surprise',
        time: '1 min',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772261034/Golden_Tourne_La_Roue_PNG___Ic%C3%B4nes_De_Roue__Tour__Roue_Fichier_PNG_et_PSD_pour_le_t%C3%A9l%C3%A9chargement_libre-removebg-preview_deahtg.png',
        moodTag: ['tired/Burned Out', 'sad/Low'],
        gameType: 'wheel',
      },
    ],
    'Quick Play': [
      {
        id: '60-second-breath',
        title: '60-Second Breath',
        description: 'One minute of mindful breathing',
        time: '1 min',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772261663/Mind_Your_Breath___and_Prosper_-_Gulfshore_Life-removebg-preview_yeuart.png',
        moodTag: ['stressed/Heavy', 'angry/Frustrated'],
        gameType: '60-second-breath',
      },
      {
        id: 'blink-break',
        title: 'Blink Break',
        description: 'Rest your eyes for 30 seconds',
        time: '30 secs',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772261663/Sign_in-removebg-preview_uagazz.png',
        moodTag: ['tired/Burned Out'],
        gameType: 'blink-break',
      },
      {
        id: 'one-thought-dump',
        title: 'One-Thought Dump',
        description: 'Write down one thought and let it go',
        time: '1 min',
        image: 'https://res.cloudinary.com/dkqjn6dqw/image/upload/v1772261663/Illustration_-_Design_Thinking_is_a_type_of_p-removebg-preview_bmfiqp.png',
        moodTag: ['stressed/Heavy', 'sad/Low'],
        gameType: 'journal',
      },
    ],
  };

  const categoryMap = {
    'Mood Boost': 'Mood Boost',
    'Study': 'Study',
    'Fun': 'Fun',
    'Quick Play': 'Quick Play',
  };

  useEffect(() => {
    fetchCompletedChallenges();
  }, []);

  useEffect(() => {
    fetchChallengesByCategory();
  }, [activeCategory]);

  const fetchChallengesByCategory = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await axios.get(
        `http://localhost:5000/api/challenges/category/${encodeURIComponent(categoryMap[activeCategory])}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const apiChallenges = (response.data || []).map((challenge) => ({
        _id: challenge._id,
        id: challenge._id,
        staticId: challenge.gameType || challenge.title?.toLowerCase().replace(/\s+/g, '-'),
        title: challenge.title,
        description: challenge.description,
        time: challenge.duration || '2 mins',
        image: challenge.image || 'https://via.placeholder.com/150',
        moodTag: challenge.moodTag || [],
        gameType: challenge.gameType || 'timer',
      }));

      const mergedChallenges = [...apiChallenges];

      const staticChallenges = allChallenges[activeCategory] || [];

      staticChallenges.forEach((staticChallenge) => {
        const matchedApiChallenge = apiChallenges.find(
          (apiChallenge) =>
            apiChallenge.title.trim().toLowerCase() ===
            staticChallenge.title.trim().toLowerCase()
        );

        if (matchedApiChallenge) {
          const index = mergedChallenges.findIndex((c) => c._id === matchedApiChallenge._id);
          if (index !== -1) {
            mergedChallenges[index] = {
              ...matchedApiChallenge,
              ...staticChallenge,
              _id: matchedApiChallenge._id,
              id: matchedApiChallenge._id,
              staticId: staticChallenge.id,
            };
          }
        } else {
          mergedChallenges.push({
            ...staticChallenge,
            _id: null,
            staticId: staticChallenge.id,
          });
        }
      });

      setChallenges(mergedChallenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setChallenges(allChallenges[activeCategory] || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedChallenges = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/completed-challenges', {
        headers: { Authorization: `Bearer ${token}` },
      });

      let completedIds = [];

      if (Array.isArray(response.data)) {
        completedIds = response.data.map((c) => c.challengeId);
      } else if (response.data.completed) {
        completedIds = response.data.completed.map((c) => c.challengeId);
      }

      setCompletedChallenges(completedIds.filter(Boolean));
    } catch (error) {
      console.error('Error fetching completed challenges:', error);
    }
  };

  const markChallengeAsCompleted = async (challenge) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const challengeId = challenge._id || challenge.id;
      
      await axios.post(
        'http://localhost:5000/api/completed-challenges',
        { challengeId: challengeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setJustCompletedId(challengeId);
      setTimeout(() => setJustCompletedId(null), 2000);

      await fetchCompletedChallenges();
    } catch (error) {
      console.error('Error marking challenge as completed:', error);
    }
  };

  const handlePlayChallenge = (challenge) => {
    const routes = {
      // Existing games
      breathing: '/games/breathe',
      gratitude: '/games/gratitude-tap',
      'smile-challenge': '/games/smile-challenge',
      'calm-taps': '/games/calm-taps',
      'focus-sprint': '/games/focus-sprint',
      memory: '/games/memory-flip',
      quiz: '/games/quick-quiz',
      focus: '/games/distraction-block',
      sound: '/games/guess-sound',
      matching: '/games/emoji-match',
      stars: '/games/tap-star',
      wheel: '/games/spin-wheel',
      '60-second-breath': '/games/60-second-breath',
      'blink-break': '/games/blink-break',
      journal: '/games/one-thought',
      timer: '/games/timer',
      
      // Mood Boost games
      'breath-bubble': '/games/breath-bubble',
      'gratitude-catch': '/games/gratitude-catch',
      'mindful-match': '/games/mindful-match',
      'affirmation-stack': '/games/affirmation-stack',
      'color-calm': '/games/color-calm',
      'sound-sanctuary': '/games/sound-sanctuary',
    };

    markChallengeAsCompleted(challenge);
    navigate(routes[challenge.gameType] || '/games/timer', { state: { challenge } });
  };

  const hasBeenPlayed = (challenge) => {
    const challengeId = challenge._id || challenge.id;
    return completedChallenges.includes(challengeId);
  };

  const getCompletedCount = () => completedChallenges.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Nunito:wght@400;500;600;700&display=swap');

        .ch-page {
          min-height: 100vh;
          background: #e8f4f1;
          font-family: 'Nunito', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .ch-main {
          flex: 1;
          padding: 60px 24px 80px;
        }

        .ch-inner {
          max-width: 1200px;
          margin: 0 auto;
        }

        .ch-header {
          text-align: center;
          margin-bottom: 44px;
        }

        .ch-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 5vw, 44px);
          font-weight: 400;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #3d5a58;
          margin: 0 0 10px;
        }

        .ch-subtitle {
          font-size: 16px;
          color: #7a9e9b;
          font-weight: 400;
          margin: 0;
        }

        .ch-tabs {
          display: flex;
          justify-content: center;
          background: #fff;
          border-radius: 50px;
          padding: 5px;
          gap: 0;
          margin-bottom: 44px;
          box-shadow: 0 2px 16px rgba(80,140,130,0.10);
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
          flex-wrap: wrap;
        }

        .ch-tab {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 22px;
          border-radius: 50px;
          border: none;
          background: transparent;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #9ab5b2;
          cursor: pointer;
          transition: all 0.22s ease;
          white-space: nowrap;
          position: relative;
        }

        .ch-tab:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 18px;
          background: #e2efed;
        }

        .ch-tab.active::after,
        .ch-tab.active + .ch-tab::after {
          display: none;
        }

        .ch-tab:hover {
          color: #3d5a58;
        }

        .ch-tab.active {
          background: #d4ede8;
          color: #2d4a47;
          box-shadow: 0 2px 8px rgba(80,140,130,0.15);
        }

        .ch-tab-icon { font-size: 17px; line-height: 1; }

        .ch-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 44px;
        }

        @keyframes chPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); background: #f0fff8; }
        }

        .ch-card.just-completed {
          animation: chPulse 0.5s ease-in-out;
          border-color: #4caf84;
        }

        @media (max-width: 900px) {
          .ch-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 600px) {
          .ch-grid { grid-template-columns: 1fr; }
          .ch-tabs { flex-wrap: wrap; border-radius: 16px; }
          .ch-tab:not(:last-child)::after { display: none; }
        }

        .ch-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 3px 18px rgba(80,140,130,0.09);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          border: 1.5px solid #eaf4f2;
        }

        .ch-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(80,140,130,0.16);
          border-color: #b8ddd8;
        }

        .ch-img-panel {
          width: 100%;
          height: 160px;
          background: linear-gradient(155deg, #edf8f5 0%, #ddf0eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          padding: 20px;
        }

        .ch-img-panel img {
          width: 120px;
          height: 120px;
          object-fit: contain;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
          filter: drop-shadow(0 5px 10px rgba(0,0,0,0.08));
        }

        .ch-card:hover .ch-img-panel img {
          transform: scale(1.08) translateY(-5px);
        }

        .ch-done-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #4caf84;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          display: grid;
          place-items: center;
          box-shadow: 0 2px 8px rgba(76,175,132,0.4);
        }

        .ch-card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
        }

        .ch-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 600;
          color: #3d5a58;
          margin: 0 0 8px;
          line-height: 1.3;
        }

        .ch-card-desc {
          font-size: 13px;
          color: #8aaeaa;
          line-height: 1.55;
          margin: 0 0 12px;
        }

        .ch-time-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          color: #7a9e9b;
          background: #f0f9f7;
          border: 1px solid #d4ede8;
          padding: 4px 12px;
          border-radius: 100px;
          margin-bottom: 12px;
          width: fit-content;
        }

        .ch-mood-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .ch-mood-tag {
          font-size: 10px;
          font-weight: 600;
          color: #9ab5b2;
          background: #f0f9f7;
          border: 1px solid #d9edea;
          padding: 3px 8px;
          border-radius: 100px;
        }

        .ch-start-btn {
          width: 100%;
          padding: 11px;
          border: 1.5px solid #c8e0db;
          border-radius: 12px;
          background: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #3d5a58;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .ch-start-btn:hover {
          background: #3d5a58;
          color: #fff;
          border-color: #3d5a58;
          box-shadow: 0 4px 14px rgba(61,90,88,0.22);
        }

        .ch-start-btn:active { transform: scale(0.98); }

        .ch-start-btn svg {
          transition: transform 0.2s ease;
        }

        .ch-start-btn:hover svg {
          transform: scale(1.1);
        }

        .ch-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 0;
          gap: 14px;
        }

        .ch-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #d4ede8;
          border-top-color: #5b9e96;
          border-radius: 50%;
          animation: chspin 0.75s linear infinite;
        }

        @keyframes chspin { to { transform: rotate(360deg); } }

        .ch-loading-text { font-size: 14px; color: #9ab5b2; }

        .ch-banner {
          background: linear-gradient(135deg, #5b9e96 0%, #3d7a73 100%);
          border-radius: 28px;
          padding: 42px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(61,122,115,0.22);
        }

        .ch-banner::before {
          content: '';
          position: absolute;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          top: -80px; right: -60px;
          pointer-events: none;
        }

        .ch-banner::after {
          content: '';
          position: absolute;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          bottom: -50px; left: -40px;
          pointer-events: none;
        }

        .ch-banner-emoji { font-size: 34px; margin-bottom: 10px; display: block; }

        .ch-banner-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 10px;
        }

        .ch-banner-desc {
          font-size: 15px;
          color: rgba(255,255,255,0.75);
          margin: 0 auto 26px;
          max-width: 420px;
          line-height: 1.6;
        }

        .ch-banner-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: #fff;
          color: #3d7a73;
          border: none;
          border-radius: 50px;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.22s ease;
          box-shadow: 0 4px 14px rgba(0,0,0,0.1);
        }

        .ch-banner-btn:hover {
          transform: scale(1.04);
          box-shadow: 0 8px 22px rgba(0,0,0,0.15);
        }

        .ch-category-badge {
          display: inline-block;
          background: #d4ede8;
          color: #3d7a73;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }
      `}</style>

      <div className="ch-page">
        <Navbar />

        <main className="ch-main">
          <div className="ch-inner">

            <div className="ch-header">
              <h1 className="ch-title">Take a Fun Break</h1>
              <p className="ch-subtitle">Refresh your brain with light activities.</p>
            </div>

            <div className="ch-tabs">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  className={`ch-tab ${activeCategory === cat.name ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.name)}
                >
                  <span className="ch-tab-icon">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="ch-loading">
                <div className="ch-spinner" />
                <p className="ch-loading-text">Loading challenges…</p>
              </div>
            ) : (
              <>
                <div className="ch-grid">
                  {challenges.length > 0 ? challenges.map((challenge) => {
                    const played = hasBeenPlayed(challenge);
                    const challengeId = challenge._id || challenge.id;
                    const justCompleted = justCompletedId === challengeId;
                    
                    return (
                      <div 
                        key={challenge.id || challenge._id} 
                        className={`ch-card ${justCompleted ? 'just-completed' : ''}`}
                      >
                        <div className="ch-img-panel">
                          <img src={challenge.image} alt={challenge.title} loading="lazy" />
                          {justCompleted && <span className="ch-done-badge">✓</span>}
                        </div>

                        <div className="ch-card-body">
                          <div>
                            <h3 className="ch-card-title">{challenge.title}</h3>
                            <p className="ch-card-desc">{challenge.description}</p>
                            <span className="ch-time-badge">⏱ {challenge.time}</span>
                            {challenge.moodTag?.length > 0 && (
                              <div className="ch-mood-tags">
                                {challenge.moodTag.slice(0, 3).map(tag => (
                                  <span key={tag} className="ch-mood-tag">{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            className="ch-start-btn"
                            onClick={() => handlePlayChallenge(challenge)}
                          >
                            {played ? (
                              <>
                                <RefreshIcon />
                                Play Again
                              </>
                            ) : (
                              <>
                                <SparkleIcon />
                                Start
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-12 text-gray-500" style={{ gridColumn: '1/-1' }}>
                      ✨ No challenges in this category yet. ✨
                    </div>
                  )}
                </div>

                <div className="ch-banner">
                  <span className="ch-banner-emoji">🎉</span>
                  <h3 className="ch-banner-title">
                    {getCompletedCount() > 0
                      ? `Nice job! You've played ${getCompletedCount()} challenge${getCompletedCount() !== 1 ? 's' : ''} today.`
                      : "Ready to start your wellness journey?"}
                  </h3>
                  <p className="ch-banner-desc">
                    {getCompletedCount() > 0
                      ? "Keep playing! Each time you complete a challenge, you're building better habits."
                      : "Try a fun challenge to boost your mood and energy!"}
                  </p>
                  <button
                    className="ch-banner-btn"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Explore All Challenges
                    <ArrowRightIcon />
                  </button>
                </div>
              </>
            )}

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ChallengesPage;