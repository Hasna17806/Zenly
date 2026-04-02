import { Link, useLocation } from "react-router-dom";

const PsychiatristSidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      to: "/psychiatrist/dashboard",
      label: "Dashboard",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      to: "/psychiatrist/appointments",
      label: "Appointments",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      to: "/psychiatrist/session/:appointmentId",
      label: "Session Chat",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="9" y1="10" x2="15" y2="10" />
          <line x1="12" y1="13" x2="12" y2="7" />
        </svg>
      ),
    },
    {
      to: "/psychiatrist/profile",
      label: "Profile",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

        .psy-sidebar {
          width: 260px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          background: #0f1923;
          display: flex;
          flex-direction: column;
          font-family: 'IBM Plex Sans', sans-serif;
          overflow-y: auto;
          z-index: 100;
        }

        /* Custom scrollbar for sidebar */
        .psy-sidebar::-webkit-scrollbar {
          width: 4px;
        }
        .psy-sidebar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .psy-sidebar::-webkit-scrollbar-thumb {
          background: rgba(100,180,200,0.2);
          border-radius: 4px;
        }
        .psy-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(100,180,200,0.4);
        }

        .psy-sidebar::after {
          content: '';
          position: absolute;
          bottom: 80px;
          left: -60px;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(80, 140, 180, 0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Logo Zone ── */
        .psy-logo-zone {
          padding: 32px 24px 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .psy-logo-placeholder {
          width: 100%;
          height: 60px;
          border: 1.5px dashed rgba(255,255,255,0.15);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: rgba(255,255,255,0.2);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ── Role Header ── */
        .psy-header {
          padding: 24px 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .psy-role-tag {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #64b4c8;
          margin-bottom: 6px;
        }

        .psy-title {
          font-size: 20px;
          font-weight: 700;
          color: #eef2f5;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .psy-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-top: 4px;
          font-weight: 400;
          letter-spacing: 0.01em;
        }

        /* ── Nav ── */
        .psy-nav {
          flex: 1;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .psy-nav-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          padding: 0 12px;
          margin-bottom: 12px;
        }

        .psy-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 10px;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.2s ease;
          position: relative;
          letter-spacing: 0.01em;
        }

        .psy-link:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
        }

        .psy-link.active {
          background: rgba(100, 180, 200, 0.12);
          color: #a8dce8;
          font-weight: 600;
        }

        .psy-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: #64b4c8;
          border-radius: 0 3px 3px 0;
          box-shadow: 0 0 10px rgba(100, 180, 200, 0.5);
        }

        .psy-link-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .psy-link.active .psy-link-icon {
          opacity: 1;
        }

        /* ── Footer ── */
        .psy-footer {
          padding: 20px 16px 28px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .psy-logout {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 15px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }

        .psy-logout:hover {
          background: rgba(220, 80, 80, 0.1);
          color: #e88a8a;
        }

        .psy-logout svg {
          width: 18px;
          height: 18px;
        }

        /* Main content offset - add this to your main container */
        .main-content {
          margin-left: 260px;
          min-height: 100vh;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .psy-sidebar {
            width: 220px;
          }
          .psy-title {
            font-size: 18px;
          }
          .psy-link {
            font-size: 14px;
            padding: 10px 12px;
          }
          .psy-logout {
            font-size: 14px;
          }
          .main-content {
            margin-left: 220px;
          }
        }
      `}</style>

      <div className="psy-sidebar">

        {/* Logo Zone */}
        <div className="psy-logo-zone">
          <img 
            src="https://res.cloudinary.com/dkqjn6dqw/image/upload/v1771944890/s__1_-removebg-preview_b54v9c.png" 
            alt="zenly logo"
            style={{ width: "140px", height: "auto" }}
          />
        </div>

        {/* Role Header */}
        <div className="psy-header">
          <div className="psy-role-tag">Portal</div>
          <h2 className="psy-title">Psychiatrist</h2>
          <p className="psy-subtitle">Patient Management</p>
        </div>

        {/* Nav Links */}
        <nav className="psy-nav">
          <div className="psy-nav-label">Menu</div>
          {navItems.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`psy-link${location.pathname === to ? " active" : ""}`}
            >
              <span className="psy-link-icon">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="psy-footer">
          <button
            className="psy-logout"
            onClick={() => {
              localStorage.removeItem("psychiatristToken");
              window.location.href = "/psychiatrist/login";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>

      </div>
    </>
  );
};

export default PsychiatristSidebar;