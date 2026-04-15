import { NavLink } from "react-router-dom";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

  .sidebar {
    width: 260px;
    height: 100vh;
    background: #0e1017;
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    padding: 28px 18px;
    position: fixed;
    top: 0; left: 0;
    font-family: 'Outfit', sans-serif;
    z-index: 200;
  }

  .sidebar::before {
    content: '';
    position: absolute;
    top: -60px; left: -60px;
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(108,142,247,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 10px 28px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 24px;
  }
  .brand-icon {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, #6c8ef7, #a78bfa);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 16px rgba(108,142,247,0.35);
    flex-shrink: 0;
  }
  .brand-icon svg { width: 19px; height: 19px; color: white; }
  .brand-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 17px;
    font-weight: 800;
    color: #f0f2f8;
    letter-spacing: -0.2px;
  }
  .brand-sub {
    font-size: 11px;
    font-weight: 800;
    color: #3e4558;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 2px;
    margin-left: 60px;
  }

  .nav-section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #3e4558;
    padding: 0 12px;
    margin-bottom: 8px;
  }

  .nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 11px;
    font-size: 15px;
    font-weight: 500;
    color: #7a8099;
    text-decoration: none;
    transition: background 0.18s, color 0.18s, transform 0.15s;
    position: relative;
    border: 1px solid transparent;
  }
  .nav-link:hover {
    background: rgba(255,255,255,0.04);
    color: #c8cfe8;
    transform: translateX(2px);
  }
  .nav-link.active {
    background: rgba(108,142,247,0.1);
    color: #a5b8fa;
    border-color: rgba(108,142,247,0.18);
  }
  .nav-link.active::before {
    content: '';
    position: absolute;
    left: -18px;
    top: 50%; transform: translateY(-50%);
    width: 3px; height: 22px;
    background: linear-gradient(180deg, #6c8ef7, #a78bfa);
    border-radius: 0 3px 3px 0;
  }

  .nav-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    background: rgba(255,255,255,0.04);
    transition: background 0.18s;
  }
  .nav-icon svg { width: 18px; height: 18px; }
  .nav-link.active .nav-icon {
    background: rgba(108,142,247,0.15);
  }
  .nav-link:hover .nav-icon {
    background: rgba(255,255,255,0.07);
  }

  .nav-label { flex: 1; }

  .nav-link.active .nav-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #6c8ef7;
    box-shadow: 0 0 6px #6c8ef7;
  }

  .sidebar-footer {
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .sidebar-user {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 12px;
    border-radius: 11px;
    cursor: pointer;
    transition: background 0.18s;
  }
  .sidebar-user:hover { background: rgba(255,255,255,0.04); }
  .user-avatar {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #2dd4bf, #4db8ff);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #0a0c10;
    flex-shrink: 0;
  }
  .user-info { flex: 1; overflow: hidden; }
  .user-name { font-size: 14px; font-weight: 600; color: #c8cfe8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role { font-size: 12px; color: #3e4558; margin-top: 2px; }
  .user-chevron { color: #3e4558; }
  .user-chevron svg { width: 15px; height: 15px; }
`;

const navItems = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
      </svg>
    ),
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>
    ),
  },
  {
    to: "/admin/psychiatrists",  
    label: "Psychiatrists",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
  },
  {
    to: "/admin/reviews",
    label: "Reviews",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
      </svg>
    ),
  },
  {
    to: "/admin/payments",
    label: "Payments",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M3 10h18M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M16 14a4 4 0 1 0-8 0" />
      </svg>
    ),
  },
  {
    to: "/admin/challenges",
    label: "Challenges",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
];

const Sidebar = () => {
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('token');
    window.location.href = '/admin/login';
  };

  return (
    <>
      <style>{style}</style>
      <div className="sidebar">

        <div className="sidebar-brand">
          <div>
            <img 
              src="https://res.cloudinary.com/dkqjn6dqw/image/upload/v1771944890/s__1_-removebg-preview_b54v9c.png" 
              alt="zenly logo" 
              className="w-40 h-auto" 
            />
            <div className="brand-sub">Admin Panel</div>
          </div>
        </div>

        <div className="nav-section-label">Main Menu</div>
        <nav className="nav">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
              <span className="nav-dot"></span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout}>
            <div className="user-avatar">A</div>
            <div className="user-info">
              <div className="user-name">Admin</div>
              <div className="user-role">Click to Logout</div>
            </div>
            <div className="user-chevron">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Sidebar;