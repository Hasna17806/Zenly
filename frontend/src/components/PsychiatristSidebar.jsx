import { Link, useLocation } from "react-router-dom";

const PsychiatristSidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      to: "/psychiatrist/dashboard",
      label: "Dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

        .psy-sidebar {
          width: 240px;
          height: 100vh;
          background: #0f1923;
          display: flex;
          flex-direction: column;
          font-family: 'IBM Plex Sans', sans-serif;
          position: relative;
          overflow: hidden;
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
          padding: 28px 24px 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 90px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .psy-logo-placeholder {
          width: 100%;
          height: 52px;
          border: 1.5px dashed rgba(255,255,255,0.15);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: rgba(255,255,255,0.2);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ── Role Header ── */
        .psy-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .psy-role-tag {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #64b4c8;
          margin-bottom: 4px;
        }

        .psy-title {
          font-size: 17px;
          font-weight: 600;
          color: #eef2f5;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .psy-subtitle {
          font-size: 11.5px;
          color: rgba(255,255,255,0.3);
          margin-top: 3px;
          font-weight: 300;
          letter-spacing: 0.01em;
        }

        /* ── Nav ── */
        .psy-nav {
          flex: 1;
          padding: 18px 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .psy-nav-label {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.18);
          padding: 0 10px;
          margin-bottom: 8px;
        }

        .psy-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 400;
          transition: all 0.16s ease;
          position: relative;
          letter-spacing: 0.01em;
        }

        .psy-link:hover {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.8);
        }

        .psy-link.active {
          background: rgba(100, 180, 200, 0.11);
          color: #a8dce8;
          font-weight: 500;
        }

        .psy-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 55%;
          background: #64b4c8;
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 8px rgba(100, 180, 200, 0.45);
        }

        .psy-link-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          opacity: 0.65;
        }

        .psy-link.active .psy-link-icon {
          opacity: 1;
        }

        /* ── Footer ── */
        .psy-footer {
          padding: 14px 14px 26px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .psy-logout {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.3);
          font-size: 13.5px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.16s ease;
          letter-spacing: 0.01em;
        }

        .psy-logout:hover {
          background: rgba(220, 80, 80, 0.09);
          color: #e88a8a;
        }
      `}</style>

      <div className="psy-sidebar">

        {/* Logo Zone */}
        <div className="psy-logo-zone">
          <img src="https://res.cloudinary.com/dkqjn6dqw/image/upload/v1771944890/s__1_-removebg-preview_b54v9c.png" alt="zenly logo"
          className="w-36 h-auto mr-10" />
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
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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