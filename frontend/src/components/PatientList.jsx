import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const token = localStorage.getItem("psychiatristToken");
  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/psychiatrist/patients",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatients(res.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const getMoodColor = (mood) => {
    const moods = {
      "happy/Energetic": "#4CAF50",
      "calm/Okay": "#8BC34A",
      "sad/Low": "#FFC107",
      "stressed/Heavy": "#FF9800",
      "angry/Frustrated": "#F44336",
      "tired/Burned Out": "#9C27B0"
    };
    return moods[mood] || "#64b4c8";
  };

  const getInitials = (name) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === "active")    return matchesSearch && patient.activeAppointments > 0;
    if (filter === "completed") return matchesSearch && patient.completedAppointments > 0;
    return matchesSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pl-wrap { font-family: 'IBM Plex Sans', sans-serif; }

        /* Header */
        .pl-header {
          display: flex; justify-content: space-between;
          align-items: flex-start; margin-bottom: 32px;
          flex-wrap: wrap; gap: 20px;
        }
        .pl-header-left {}
        .pl-eyebrow {
          font-size: 10px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: #64b4c8; margin-bottom: 6px;
        }
        .pl-title {
          font-size: 24px; font-weight: 600; color: #eef2f5;
          letter-spacing: -0.02em; margin-bottom: 4px;
        }
        .pl-sub { font-size: 13px; color: rgba(255,255,255,0.28); font-weight: 300; }

        /* Stat chips */
        .pl-stats { display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
        .pl-stat {
          background: #111d2b; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 14px 20px; text-align: center; min-width: 90px;
        }
        .pl-stat-val {
          display: block; font-size: 26px; font-weight: 600;
          color: #64b4c8; letter-spacing: -0.03em; line-height: 1;
        }
        .pl-stat-label {
          display: block; font-size: 10.5px; color: rgba(255,255,255,0.3);
          font-weight: 500; letter-spacing: 0.05em; margin-top: 5px; text-transform: uppercase;
        }

        /* Filters row */
        .pl-filters {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 24px;
          flex-wrap: wrap; gap: 12px;
        }
        .pl-search {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px; padding: 10px 14px;
          flex: 1; max-width: 320px; transition: border-color 0.15s;
        }
        .pl-search:focus-within { border-color: rgba(100,180,200,0.4); }
        .pl-search svg { color: rgba(255,255,255,0.25); flex-shrink: 0; }
        .pl-search input {
          background: none; border: none; color: #eef2f5;
          font-size: 13.5px; font-family: 'IBM Plex Sans', sans-serif;
          outline: none; width: 100%;
        }
        .pl-search input::placeholder { color: rgba(255,255,255,0.2); }

        .pl-filter-btns { display: flex; gap: 6px; }
        .pl-filter-btn {
          padding: 8px 18px; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
          color: rgba(255,255,255,0.45); font-size: 12.5px; font-weight: 500;
          font-family: 'IBM Plex Sans', sans-serif; cursor: pointer;
          transition: all 0.15s ease;
        }
        .pl-filter-btn:hover { background: rgba(100,180,200,0.08); color: rgba(255,255,255,0.7); border-color: rgba(100,180,200,0.2); }
        .pl-filter-btn.active { background: #64b4c8; color: #0b1520; border-color: #64b4c8; font-weight: 600; }

        /* Grid */
        .pl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 16px;
        }

        /* Patient card */
        .pl-card {
          background: #111d2b; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 20px 22px;
          display: flex; gap: 16px;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .pl-card:hover {
          transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.3);
          border-color: rgba(100,180,200,0.2);
        }

        .pl-avatar {
          width: 56px; height: 56px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; font-weight: 600; color: #0b1520; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .pl-info { flex: 1; min-width: 0; }
        .pl-name {
          font-size: 15px; font-weight: 600; color: #eef2f5;
          letter-spacing: -0.01em; margin-bottom: 3px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .pl-email {
          font-size: 11.5px; color: rgba(255,255,255,0.3);
          margin-bottom: 10px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .pl-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .pl-mood-badge {
          font-size: 10.5px; font-weight: 500; padding: 3px 9px;
          border-radius: 20px; letter-spacing: 0.03em;
        }
        .pl-count {
          font-size: 11px; color: rgba(255,255,255,0.3);
          display: flex; align-items: center; gap: 4px;
        }
        .pl-count-dot {
          width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
        }

        .pl-actions { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
        .pl-btn-progress {
          padding: 8px 14px; background: rgba(100,180,200,0.1);
          border: 1px solid rgba(100,180,200,0.25); border-radius: 8px;
          color: #64b4c8; font-size: 12px; font-weight: 500;
          font-family: 'IBM Plex Sans', sans-serif; cursor: pointer;
          transition: all 0.15s ease; white-space: nowrap;
        }
        .pl-btn-progress:hover { background: rgba(100,180,200,0.2); border-color: rgba(100,180,200,0.4); }
        .pl-btn-msg {
          padding: 8px 14px; background: rgba(109,212,164,0.1);
          border: 1px solid rgba(109,212,164,0.25); border-radius: 8px;
          color: #6dd4a4; font-size: 12px; font-weight: 500;
          font-family: 'IBM Plex Sans', sans-serif; cursor: pointer;
          transition: all 0.15s ease; white-space: nowrap;
          display: flex; align-items: center; gap: 5px;
        }
        .pl-btn-msg:hover:not(:disabled) { background: rgba(109,212,164,0.2); border-color: rgba(109,212,164,0.4); }
        .pl-btn-msg:disabled { opacity: 0.35; cursor: not-allowed; }

        /* Loading */
        .pl-loading { text-align: center; padding: 72px 0; }
        .pl-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.08);
          border-top-color: #64b4c8;
          animation: plspin 0.8s linear infinite;
          margin: 0 auto 14px;
        }
        @keyframes plspin { to { transform: rotate(360deg); } }
        .pl-loading p { font-size: 13px; color: rgba(255,255,255,0.25); }

        /* Empty */
        .pl-empty {
          text-align: center; padding: 72px 40px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05); border-radius: 16px;
        }
        .pl-empty-icon { margin-bottom: 16px; opacity: 0.3; }
        .pl-empty h3 { font-size: 17px; color: rgba(255,255,255,0.4); font-weight: 500; margin-bottom: 8px; }
        .pl-empty p { font-size: 13px; color: rgba(255,255,255,0.2); line-height: 1.6; }

        /* Skeleton */
        .pl-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%; animation: plshimmer 1.4s ease-in-out infinite; border-radius: 8px;
        }
        @keyframes plshimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .pl-skel-card {
          background: #111d2b; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 20px 22px;
          display: flex; gap: 16px; margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .pl-grid { grid-template-columns: 1fr; }
          .pl-stats { width: 100%; }
          .pl-stat { flex: 1; }
          .pl-search { max-width: 100%; }
        }
      `}</style>

      <div className="pl-wrap">

        {/* Header */}
        <div className="pl-header">
          <div className="pl-header-left">
            <div className="pl-eyebrow">Directory</div>
            <h2 className="pl-title">My Patients</h2>
            <p className="pl-sub">Manage and track your patients' progress.</p>
          </div>
          <div className="pl-stats">
            <div className="pl-stat">
              <span className="pl-stat-val">{patients.length}</span>
              <span className="pl-stat-label">Total</span>
            </div>
            <div className="pl-stat">
              <span className="pl-stat-val">{patients.filter(p => p.activeAppointments > 0).length}</span>
              <span className="pl-stat-label">Active</span>
            </div>
            <div className="pl-stat">
              <span className="pl-stat-val">{patients.reduce((s, p) => s + (p.completedAppointments || 0), 0)}</span>
              <span className="pl-stat-label">Sessions</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="pl-filters">
          <div className="pl-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text" placeholder="Search by name or email…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="pl-filter-btns">
            {["all","active","completed"].map(f => (
              <button key={f} className={`pl-filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="pl-grid">
            {[1,2,3,4].map(i => (
              <div className="pl-skel-card" key={i}>
                <div className="pl-skeleton" style={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="pl-skeleton" style={{ width: "55%", height: 15 }} />
                  <div className="pl-skeleton" style={{ width: "75%", height: 11 }} />
                  <div className="pl-skeleton" style={{ width: "40%", height: 22, borderRadius: 20 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="pl-empty">
            <div className="pl-empty-icon">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>No patients found</h3>
            <p>When patients book and complete appointments,<br/>they'll appear here.</p>
          </div>
        ) : (
          <div className="pl-grid">
            {filteredPatients.map(patient => {
              const moodColor = getMoodColor(patient.currentMood);
              return (
                <div key={patient._id} className="pl-card">
                  <div className="pl-avatar" style={{ background: `linear-gradient(135deg, ${moodColor}, ${moodColor}bb)` }}>
                    {getInitials(patient.name)}
                  </div>
                  <div className="pl-info">
                    <div className="pl-name">{patient.name}</div>
                    <div className="pl-email">{patient.email}</div>
                    <div className="pl-meta">
                      <span className="pl-mood-badge" style={{ background: `${moodColor}18`, color: moodColor, border: `1px solid ${moodColor}30` }}>
                        {patient.currentMood || "Mood not set"}
                      </span>
                      <span className="pl-count">
                        <span className="pl-count-dot" style={{ background: "#6dd4a4" }} />
                        {patient.activeAppointments || 0} active
                      </span>
                      <span className="pl-count">
                        <span className="pl-count-dot" style={{ background: "#64b4c8" }} />
                        {patient.completedAppointments || 0} done
                      </span>
                    </div>
                  </div>
                  <div className="pl-actions">
                    <button className="pl-btn-progress" onClick={() => navigate(`/psychiatrist/patient-progress/${patient._id}`)}>
                      View Progress
                    </button>
                    <button
                      className="pl-btn-msg"
                      onClick={() => { if (patient.activeAppointmentId) navigate(`/psychiatrist/session/${patient.activeAppointmentId}`); }}
                      disabled={!patient.activeAppointmentId}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default PatientList;