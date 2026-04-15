import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PsychiatristSidebar from "../components/PsychiatristSidebar";
import PsychiatristLayout from "../components/PsychiatristLayout";

const PatientProgress = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [challengeProgress, setChallengeProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const token = localStorage.getItem("psychiatristToken");
  const navigate = useNavigate();

  const fetchPatientData = async () => {
    try {
      const [patientRes, appointmentsRes, moodRes, challengesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/psychiatrist/patient/${patientId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/psychiatrist/patient/${patientId}/appointments`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/psychiatrist/patient/${patientId}/mood-history`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/psychiatrist/patient/${patientId}/challenges`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPatient(patientRes.data);
      setAppointments(appointmentsRes.data);
      setMoodHistory(moodRes.data);
      setChallengeProgress(challengesRes.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatientData(); }, [patientId]);

  const getMoodColor = (mood) => {
    const moods = {
      "happy/Energetic": "#10b981", "calm/Okay": "#06b6d4",
      "sad/Low": "#f59e0b", "stressed/Heavy": "#f97316",
      "angry/Frustrated": "#ef4444", "tired/Burned Out": "#a855f7"
    };
    return moods[mood] || "#64b4c8";
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      "happy/Energetic": "😊", "calm/Okay": "😌", "sad/Low": "😔",
      "stressed/Heavy": "😫", "angry/Frustrated": "😤", "tired/Burned Out": "😴"
    };
    return emojis[mood] || "😐";
  };

  const tabs = ["overview", "appointments", "mood", "challenges"];

  if (loading) return (
    <PsychiatristLayout>
      <div className="pp-loading">
        <div className="pp-spinner"/>
        <p>Loading patient data…</p>
      </div>
      <style>{`
        .pp-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; gap: 20px; font-family: 'IBM Plex Sans', sans-serif; }
        .pp-spinner { width: 48px; height: 48px; border: 3px solid rgba(100,180,200,0.1); border-top-color: #64b4c8; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pp-loading p { color: rgba(255,255,255,0.4); font-size: 14px; }
      `}</style>
    </PsychiatristLayout>
  );

  if (!patient) return (
    <PsychiatristLayout>
      <div className="pp-error">
        <div className="pp-error-icon">⚠️</div>
        <h3>Patient not found</h3>
        <button onClick={() => navigate("/psychiatrist/patients")}>Back to Patients</button>
      </div>
      <style>{`
        .pp-error { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; gap: 20px; text-align: center; }
        .pp-error-icon { font-size: 48px; opacity: 0.5; }
        .pp-error h3 { font-size: 20px; color: rgba(255,255,255,0.6); font-weight: 500; }
        .pp-error button { padding: 12px 28px; background: linear-gradient(135deg, #64b4c8, #4a90a4); border: none; border-radius: 12px; color: #0b1520; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .pp-error button:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(100,180,200,0.3); }
      `}</style>
    </PsychiatristLayout>
  );

  const moodColor = getMoodColor(patient.currentMood);
  const statusConfig = {
    Accepted:  { color: "#6dd4a4", bg: "rgba(109,212,164,0.12)",  border: "rgba(109,212,164,0.25)"  },
    Pending:   { color: "#f0b45a", bg: "rgba(240,180,90,0.12)",   border: "rgba(240,180,90,0.25)"   },
    Rejected:  { color: "#f87171", bg: "rgba(248,113,113,0.12)",  border: "rgba(248,113,113,0.25)"  },
    Completed: { color: "#64b4c8", bg: "rgba(100,180,200,0.12)",  border: "rgba(100,180,200,0.25)"  },
  };

  return (
    <PsychiatristLayout>
      <div className="pp-container">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
          
          .pp-container {
            font-family: 'IBM Plex Sans', sans-serif;
            color: #eef2f5;
            padding: 32px;
            max-width: 1400px;
            margin: 0 auto;
          }

          /* Back button */
          .pp-back {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: rgba(100,180,200,0.1);
            border: 1px solid rgba(100,180,200,0.2);
            border-radius: 12px;
            padding: 10px 20px;
            color: #64b4c8;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            margin-bottom: 32px;
            transition: all 0.2s ease;
          }
          .pp-back:hover {
            background: rgba(100,180,200,0.2);
            transform: translateX(-4px);
          }

          /* Hero section */
          .pp-hero {
            background: linear-gradient(135deg, #111d2b 0%, #0f1923 100%);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 24px;
            padding: 32px 36px;
            margin-bottom: 32px;
            display: flex;
            align-items: center;
            gap: 28px;
            flex-wrap: wrap;
            box-shadow: 0 12px 40px rgba(0,0,0,0.3);
          }
          .pp-avatar {
            width: 88px;
            height: 88px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 700;
            color: #0b1520;
            flex-shrink: 0;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            background: linear-gradient(135deg, #64b4c8, #4a90a4);
          }
          .pp-hero-info {
            flex: 1;
            min-width: 200px;
          }
          .pp-hero-name {
            font-size: 26px;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin-bottom: 6px;
            color: #eef2f5;
          }
          .pp-hero-email {
            font-size: 14px;
            color: rgba(255,255,255,0.4);
            margin-bottom: 14px;
          }
          .pp-mood-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 16px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 600;
            background: ${moodColor}18;
            color: ${moodColor};
            border: 1px solid ${moodColor}30;
          }

          /* Tabs */
          .pp-tabs {
            display: flex;
            gap: 4px;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            margin-bottom: 32px;
            padding-bottom: 0;
          }
          .pp-tab {
            padding: 12px 28px;
            background: transparent;
            border: none;
            border-bottom: 2px solid transparent;
            color: rgba(255,255,255,0.45);
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-transform: capitalize;
            letter-spacing: 0.02em;
          }
          .pp-tab:hover {
            color: rgba(255,255,255,0.8);
          }
          .pp-tab.active {
            color: #64b4c8;
            border-bottom-color: #64b4c8;
          }

          /* Stats grid */
          .pp-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 36px;
          }
          .pp-stat-card {
            background: #111d2b;
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 20px;
            padding: 24px 20px;
            text-align: center;
            transition: all 0.2s ease;
          }
          .pp-stat-card:hover {
            transform: translateY(-3px);
            border-color: rgba(100,180,200,0.3);
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          }
          .pp-stat-value {
            font-size: 38px;
            font-weight: 700;
            color: #64b4c8;
            letter-spacing: -0.03em;
            line-height: 1;
            margin-bottom: 8px;
          }
          .pp-stat-label {
            font-size: 12px;
            color: rgba(255,255,255,0.45);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-weight: 500;
          }

          /* Section title */
          .pp-section-title {
            font-size: 18px;
            font-weight: 600;
            color: #eef2f5;
            margin-bottom: 20px;
            letter-spacing: -0.01em;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .pp-section-title::before {
            content: '';
            width: 4px;
            height: 20px;
            background: linear-gradient(135deg, #64b4c8, #4a90a4);
            border-radius: 4px;
          }

          /* Activity list */
          .pp-activity-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .pp-activity-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px 20px;
            background: #111d2b;
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 16px;
            transition: all 0.2s ease;
          }
          .pp-activity-item:hover {
            border-color: rgba(100,180,200,0.25);
            background: rgba(100,180,200,0.02);
          }
          .pp-activity-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: rgba(100,180,200,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
          }
          .pp-activity-text {
            font-size: 14px;
            color: rgba(255,255,255,0.8);
            margin-bottom: 4px;
            font-weight: 500;
          }
          .pp-activity-date {
            font-size: 12px;
            color: rgba(255,255,255,0.35);
          }

          /* Appointments */
          .pp-appointments-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .pp-appointment-item {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 18px 24px;
            background: #111d2b;
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 16px;
            flex-wrap: wrap;
            transition: all 0.2s ease;
          }
          .pp-appointment-item:hover {
            border-color: rgba(100,180,200,0.25);
          }
          .pp-appointment-badge {
            padding: 5px 14px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
          }
          .pp-appointment-info {
            flex: 1;
          }
          .pp-appointment-date {
            font-size: 14px;
            color: rgba(255,255,255,0.8);
            margin-bottom: 4px;
            font-weight: 500;
          }
          .pp-appointment-meta {
            font-size: 12px;
            color: rgba(255,255,255,0.35);
          }

          /* Mood timeline */
          .pp-mood-timeline {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .pp-mood-entry {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 16px 20px;
            background: #111d2b;
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 16px;
            flex-wrap: wrap;
            transition: all 0.2s ease;
          }
          .pp-mood-entry:hover {
            border-color: rgba(100,180,200,0.25);
          }
          .pp-mood-date {
            font-size: 13px;
            color: rgba(255,255,255,0.45);
            min-width: 100px;
            font-weight: 500;
          }
          .pp-mood-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 5px 14px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 600;
            border: 1px solid;
          }
          .pp-mood-note {
            font-size: 13px;
            color: rgba(255,255,255,0.45);
            margin-left: auto;
            font-style: italic;
          }

          /* Challenges grid */
          .pp-challenges-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 16px;
          }
          .pp-challenge-card {
            display: flex;
            gap: 16px;
            padding: 20px;
            background: #111d2b;
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 18px;
            transition: all 0.2s ease;
          }
          .pp-challenge-card:hover {
            transform: translateY(-3px);
            border-color: rgba(100,180,200,0.3);
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          }
          .pp-challenge-icon {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            background: rgba(109,212,164,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            flex-shrink: 0;
          }
          .pp-challenge-content {
            flex: 1;
          }
          .pp-challenge-title {
            font-size: 15px;
            font-weight: 700;
            color: #eef2f5;
            margin-bottom: 6px;
          }
          .pp-challenge-description {
            font-size: 13px;
            color: rgba(255,255,255,0.45);
            margin-bottom: 8px;
            line-height: 1.5;
          }
          .pp-challenge-date {
            font-size: 11px;
            color: rgba(255,255,255,0.25);
          }

          /* No data */
          .pp-no-data {
            text-align: center;
            padding: 80px 40px;
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 20px;
            color: rgba(255,255,255,0.35);
            font-size: 14px;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .pp-container {
              padding: 20px;
            }
            .pp-hero {
              padding: 24px;
            }
            .pp-avatar {
              width: 70px;
              height: 70px;
              font-size: 22px;
            }
            .pp-hero-name {
              font-size: 22px;
            }
            .pp-stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            .pp-challenges-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        {/* Back button */}
        <button className="pp-back" onClick={() => navigate("/psychiatrist/patients")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Patients
        </button>

        {/* Hero card */}
        <div className="pp-hero">
          <div className="pp-avatar" style={{ background: `linear-gradient(135deg, ${moodColor}, ${moodColor}dd)` }}>
            {patient.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div className="pp-hero-info">
            <div className="pp-hero-name">{patient.name}</div>
            <div className="pp-hero-email">{patient.email}</div>
            <div className="pp-mood-pill">
              <span>{getMoodEmoji(patient.currentMood)}</span>
              <span>{patient.currentMood || "Mood not recorded"}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pp-tabs">
          {tabs.map(t => (
            <button 
              key={t} 
              className={`pp-tab ${activeTab === t ? "active" : ""}`} 
              onClick={() => setActiveTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div className="pp-stats-grid">
              {[
                { val: appointments.filter(a => a.status === "Accepted").length,  label: "Active Sessions"     },
                { val: appointments.filter(a => a.status === "Completed").length, label: "Completed Sessions"  },
                { val: challengeProgress.length,                                  label: "Challenges Done"     },
                { val: moodHistory.length,                                        label: "Mood Entries"        },
              ].map(s => (
                <div className="pp-stat-card" key={s.label}>
                  <div className="pp-stat-value">{s.val}</div>
                  <div className="pp-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="pp-section-title">Recent Activity</div>
            <div className="pp-activity-list">
              {[...moodHistory].slice(-5).reverse().map((mood, idx) => (
                <div key={idx} className="pp-activity-item">
                  <div className="pp-activity-icon">📊</div>
                  <div>
                    <div className="pp-activity-text">
                      Mood recorded: {getMoodEmoji(mood.mood)} {mood.mood}
                    </div>
                    <div className="pp-activity-date">
                      {new Date(mood.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {challengeProgress.slice(-3).reverse().map((c, idx) => (
                <div key={idx} className="pp-activity-item">
                  <div className="pp-activity-icon">🏆</div>
                  <div>
                    <div className="pp-activity-text">
                      Completed challenge: {c.title}
                    </div>
                    <div className="pp-activity-date">
                      {new Date(c.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {moodHistory.length === 0 && challengeProgress.length === 0 && (
                <div className="pp-no-data">No recent activity yet.</div>
              )}
            </div>
          </>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          appointments.length === 0 ? (
            <div className="pp-no-data">No appointments yet.</div>
          ) : (
            <div className="pp-appointments-list">
              {appointments.map(appt => {
                const cfg = statusConfig[appt.status] || statusConfig.Pending;
                return (
                  <div key={appt._id} className="pp-appointment-item">
                    <div 
                      className="pp-appointment-badge" 
                      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                    >
                      {appt.status}
                    </div>
                    <div className="pp-appointment-info">
                      <div className="pp-appointment-date">
                        {appt.date ? `${appt.date} at ${appt.time}` : "Date & time pending"}
                      </div>
                      <div className="pp-appointment-meta">
                        Requested {new Date(appt.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Mood History Tab */}
        {activeTab === "mood" && (
          moodHistory.length === 0 ? (
            <div className="pp-no-data">No mood entries yet.</div>
          ) : (
            <div className="pp-mood-timeline">
              {moodHistory.map((mood, idx) => {
                const mc = getMoodColor(mood.mood);
                return (
                  <div key={idx} className="pp-mood-entry">
                    <div className="pp-mood-date">
                      {new Date(mood.date).toLocaleDateString()}
                    </div>
                    <div 
                      className="pp-mood-badge" 
                      style={{ background: `${mc}18`, color: mc, borderColor: `${mc}35` }}
                    >
                      <span>{getMoodEmoji(mood.mood)}</span>
                      <span>{mood.mood}</span>
                    </div>
                    {mood.note && <div className="pp-mood-note">"{mood.note}"</div>}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Challenges Tab */}
        {activeTab === "challenges" && (
          challengeProgress.length === 0 ? (
            <div className="pp-no-data">No challenges completed yet.</div>
          ) : (
            <div className="pp-challenges-grid">
              {challengeProgress.map((c, idx) => (
                <div key={idx} className="pp-challenge-card">
                  <div className="pp-challenge-icon">✅</div>
                  <div className="pp-challenge-content">
                    <div className="pp-challenge-title">{c.title}</div>
                    <div className="pp-challenge-description">{c.description}</div>
                    <div className="pp-challenge-date">
                      Completed {new Date(c.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </PsychiatristLayout>
  );
};

export default PatientProgress;