import { useEffect, useState } from "react";
import axios from "axios";
import PsychiatristSidebar from "../components/PsychiatristSidebar";

const PsychiatristProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("psychiatristToken");

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/psychiatrist/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
    } catch (error) {
      console.error("Error fetching profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

        .profile-page {
          display: flex;
          min-height: 100vh;
          background: #0b1520;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .profile-main {
          flex: 1;
          padding: 40px 48px;
          overflow-y: auto;
        }

        .profile-topbar {
          margin-bottom: 36px;
        }

        .profile-eyebrow {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #64b4c8;
          margin-bottom: 6px;
        }

        .profile-page-title {
          font-size: 24px;
          font-weight: 600;
          color: #eef2f5;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .profile-page-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.28);
          font-weight: 300;
          margin-top: 4px;
        }

        /* Card */
        .profile-card {
          background: #111d2b;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          max-width: 520px;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.35);
        }

        /* Avatar banner */
        .profile-banner {
          background: linear-gradient(135deg, #0f2438 0%, #132e42 100%);
          padding: 32px 32px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: relative;
        }

        .profile-avatar {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3a7a90, #64b4c8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 600;
          color: #0b1520;
          letter-spacing: -0.02em;
          box-shadow: 0 0 0 4px rgba(100,180,200,0.15), 0 8px 24px rgba(0,0,0,0.3);
          margin-bottom: 14px;
        }

        .profile-name {
          font-size: 18px;
          font-weight: 600;
          color: #eef2f5;
          letter-spacing: -0.01em;
          margin: 0 0 4px;
        }

        .profile-spec {
          font-size: 12.5px;
          color: #64b4c8;
          font-weight: 400;
          letter-spacing: 0.04em;
          margin-bottom: 20px;
        }

        /* Status pill */
        .profile-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .profile-status.active {
          background: rgba(80,200,140,0.1);
          border: 1px solid rgba(80,200,140,0.2);
          color: #6dd4a4;
        }

        .profile-status.blocked {
          background: rgba(220,80,80,0.1);
          border: 1px solid rgba(220,80,80,0.2);
          color: #e88a8a;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .active .status-dot { background: #6dd4a4; box-shadow: 0 0 6px rgba(110,212,164,0.7); }
        .blocked .status-dot { background: #e88a8a; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Info rows */
        .profile-body {
          padding: 28px 32px 32px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .profile-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .profile-row:last-child {
          border-bottom: none;
        }

        .profile-row-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .profile-row-label svg {
          opacity: 0.5;
        }

        .profile-row-value {
          font-size: 14px;
          font-weight: 400;
          color: #d0dce8;
          letter-spacing: 0.01em;
        }

        .profile-fee-value {
          font-size: 15px;
          font-weight: 600;
          color: #64b4c8;
        }

        /* Skeleton loader */
        .skeleton-card {
          background: #111d2b;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          max-width: 520px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 6px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="profile-page">
        <PsychiatristSidebar />

        <div className="profile-main">
          <div className="profile-topbar">
            <div className="profile-eyebrow">Account</div>
            <h2 className="profile-page-title">My Profile</h2>
            <p className="profile-page-sub">Your professional details and account information.</p>
          </div>

          {loading ? (
            <div className="skeleton-card">
              <div className="skeleton" style={{ width: 76, height: 76, borderRadius: "50%" }} />
              <div className="skeleton" style={{ width: 160, height: 18 }} />
              <div className="skeleton" style={{ width: 110, height: 13 }} />
              <div className="skeleton" style={{ width: "100%", height: 13, marginTop: 12 }} />
              <div className="skeleton" style={{ width: "100%", height: 13 }} />
              <div className="skeleton" style={{ width: "80%", height: 13 }} />
            </div>
          ) : profile ? (
            <div className="profile-card">
              {/* Banner + Avatar */}
              <div className="profile-banner">
                <div className="profile-avatar">{getInitials(profile.name)}</div>
                <h3 className="profile-name">{profile.name}</h3>
                <div className="profile-spec">{profile.specialization}</div>
                <div className={`profile-status ${profile.isBlocked ? "blocked" : "active"}`}>
                  <span className="status-dot" />
                  {profile.isBlocked ? "Blocked" : "Active"}
                </div>
              </div>

              {/* Info Rows */}
              <div className="profile-body">
                <div className="profile-row">
                  <span className="profile-row-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Full Name
                  </span>
                  <span className="profile-row-value">{profile.name}</span>
                </div>

                <div className="profile-row">
                  <span className="profile-row-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Email
                  </span>
                  <span className="profile-row-value">{profile.email}</span>
                </div>

                <div className="profile-row">
                  <span className="profile-row-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                    Specialization
                  </span>
                  <span className="profile-row-value">{profile.specialization}</span>
                </div>

                <div className="profile-row">
                  <span className="profile-row-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    Consultation Fee
                  </span>
                  <span className="profile-fee-value">₹{profile.consultationFee}</span>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Could not load profile.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default PsychiatristProfile;