import { useEffect, useState } from "react";
import axios from "axios";
import PsychiatristLayout from "../components/PsychiatristLayout";

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
    <PsychiatristLayout>
      <div className="profile-main">
        <div className="profile-topbar">
          <div className="profile-eyebrow">Account</div>
          <h2 className="profile-page-title">My Profile</h2>
          <p className="profile-page-sub">Your professional details and account information.</p>
        </div>

        {loading ? (
          <div className="skeleton-card">
            <div className="skeleton" style={{ width: 96, height: 96, borderRadius: "50%" }} />
            <div className="skeleton" style={{ width: 200, height: 22 }} />
            <div className="skeleton" style={{ width: 140, height: 16 }} />
            <div className="skeleton" style={{ width: "100%", height: 16, marginTop: 16 }} />
            <div className="skeleton" style={{ width: "100%", height: 16 }} />
            <div className="skeleton" style={{ width: "80%", height: 16 }} />
          </div>
        ) : profile ? (
          <div className="profile-card">
            <div className="profile-banner">
              <div className="profile-avatar">{getInitials(profile.name)}</div>
              <h3 className="profile-name">{profile.name}</h3>
              <div className="profile-spec">{profile.specialization}</div>
              <div className={`profile-status ${profile.isBlocked ? "blocked" : "active"}`}>
                <span className="status-dot" />
                {profile.isBlocked ? "Blocked" : "Active"}
              </div>
            </div>

            <div className="profile-body">
              <div className="profile-row">
                <span className="profile-row-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Full Name
                </span>
                <span className="profile-row-value">{profile.name}</span>
              </div>

              <div className="profile-row">
                <span className="profile-row-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Email
                </span>
                <span className="profile-row-value">{profile.email}</span>
              </div>

              <div className="profile-row">
                <span className="profile-row-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
          <div className="error-message">
            Could not load profile. Please try again later.
          </div>
        )}
      </div>

      <style>{`
        .profile-main {
          flex: 1;
          padding: 48px 56px;
          overflow-y: auto;
        }

        .profile-topbar {
          margin-bottom: 44px;
        }

        .profile-eyebrow {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #64b4c8;
          margin-bottom: 8px;
        }

        .profile-page-title {
          font-size: 32px;
          font-weight: 700;
          color: #eef2f5;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .profile-page-sub {
          font-size: 16px;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
          margin-top: 6px;
          line-height: 1.5;
        }

        .profile-card {
          background: #111d2b;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          max-width: 560px;
          overflow: hidden;
          box-shadow: 0 20px 48px rgba(0,0,0,0.4);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .profile-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 56px rgba(0,0,0,0.45);
        }

        .profile-banner {
          background: linear-gradient(135deg, #0f2438 0%, #132e42 100%);
          padding: 40px 40px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: relative;
        }

        .profile-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3a7a90, #64b4c8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          font-weight: 700;
          color: #0b1520;
          letter-spacing: -0.02em;
          box-shadow: 0 0 0 5px rgba(100,180,200,0.2), 0 12px 28px rgba(0,0,0,0.4);
          margin-bottom: 18px;
        }

        .profile-name {
          font-size: 24px;
          font-weight: 700;
          color: #eef2f5;
          letter-spacing: -0.01em;
          margin: 0 0 6px;
        }

        .profile-spec {
          font-size: 15px;
          color: #64b4c8;
          font-weight: 500;
          letter-spacing: 0.04em;
          margin-bottom: 24px;
        }

        .profile-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 28px;
        }

        .profile-status.active {
          background: rgba(80,200,140,0.12);
          border: 1px solid rgba(80,200,140,0.25);
          color: #6dd4a4;
        }

        .profile-status.blocked {
          background: rgba(220,80,80,0.12);
          border: 1px solid rgba(220,80,80,0.25);
          color: #e88a8a;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .active .status-dot { background: #6dd4a4; box-shadow: 0 0 8px rgba(110,212,164,0.8); }
        .blocked .status-dot { background: #e88a8a; }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }

        .profile-body {
          padding: 32px 40px 36px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .profile-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .profile-row:last-child {
          border-bottom: none;
        }

        .profile-row-label {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .profile-row-label svg {
          width: 16px;
          height: 16px;
          opacity: 0.6;
        }

        .profile-row-value {
          font-size: 16px;
          font-weight: 500;
          color: #eef2f5;
          letter-spacing: 0.01em;
        }

        .profile-fee-value {
          font-size: 18px;
          font-weight: 700;
          color: #64b4c8;
        }

        .skeleton-card {
          background: #111d2b;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          max-width: 560px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 8px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .error-message {
          color: rgba(255,255,255,0.5);
          font-size: 15px;
          background: rgba(255,255,255,0.05);
          padding: 20px;
          border-radius: 16px;
          text-align: center;
          max-width: 560px;
        }

        @media (max-width: 768px) {
          .profile-main {
            padding: 32px 24px;
          }
          .profile-page-title {
            font-size: 28px;
          }
          .profile-name {
            font-size: 20px;
          }
          .profile-avatar {
            width: 80px;
            height: 80px;
            font-size: 28px;
          }
          .profile-body {
            padding: 24px 28px;
          }
        }
      `}</style>
    </PsychiatristLayout>
  );
};

export default PsychiatristProfile;