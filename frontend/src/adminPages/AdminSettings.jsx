import { useState } from "react";
import axios from "axios";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');

    :root {
      --bg:        #0a0c10;
      --surface:   #111318;
      --surface-2: #181c24;
      --surface-3: #1e2330;
      --border:    rgba(255,255,255,0.07);
      --border-h:  rgba(255,255,255,0.13);
      --txt:       #f0f2f8;
      --txt-2:     #7a8099;
      --txt-3:     #3e4558;
      --indigo:    #6c8ef7;
      --blue:      #4db8ff;
      --teal:      #2dd4bf;
      --amber:     #f59e0b;
      --rose:      #fb7185;
      --violet:    #a78bfa;
      --green:     #4ade80;
      --font-d:    'Plus Jakarta Sans', sans-serif;
      --font-b:    'Outfit', sans-serif;
      --r:   12px;
      --rl:  18px;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 4px; }

    .st-page {
      min-height: 100vh;
      background: var(--bg);
      font-family: var(--font-b);
      color: var(--txt);
      padding: 40px;
      margin-left: 240px;
    }

    /* ── Page header ── */
    .st-header { margin-bottom: 32px; }
    .st-title  { font-family: var(--font-d); font-size: 28px; font-weight: 800; letter-spacing: -0.3px; }
    .st-subtitle { font-size: 15px; color: var(--txt-2); margin-top: 6px; }

    /* ── Two-col layout ── */
    .st-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 24px;
      align-items: start;
    }

    /* ── Sidebar tabs ── */
    .st-tabs {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--rl);
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.2);
      position: sticky;
      top: 24px;
    }
    .st-tabs-header {
      padding: 18px 20px;
      border-bottom: 1px solid var(--border);
      background: var(--surface-2);
      font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--txt-3);
    }
    .st-tab {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 18px;
      font-family: var(--font-b); font-size: 15px; font-weight: 500;
      color: var(--txt-2);
      cursor: pointer; transition: all 0.15s;
      border-left: 3px solid transparent;
      background: none; border-right: none; border-top: none; border-bottom: none;
      width: 100%; text-align: left;
      border-bottom: 1px solid var(--border);
    }
    .st-tab:last-child { border-bottom: none; }
    .st-tab svg { width: 18px; height: 18px; flex-shrink: 0; }
    .st-tab:hover { background: rgba(255,255,255,0.03); color: var(--txt); }
    .st-tab.active {
      background: rgba(108,142,247,0.07);
      color: var(--indigo);
      border-left-color: var(--indigo);
      font-weight: 600;
    }

    /* ── Content card ── */
    .st-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--rl);
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.25);
    }
    .st-card-header {
      background: var(--surface-2);
      border-bottom: 1px solid var(--border);
      padding: 22px 28px;
      display: flex; align-items: center; gap: 14px;
    }
    .st-card-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .st-card-icon svg { width: 20px; height: 20px; }
    .st-card-title   { font-family: var(--font-d); font-size: 18px; font-weight: 700; }
    .st-card-desc    { font-size: 14px; color: var(--txt-2); margin-top: 3px; }

    .st-card-body { padding: 28px; display: flex; flex-direction: column; gap: 24px; }

    /* ── Field ── */
    .st-field { display: flex; flex-direction: column; gap: 8px; }
    .st-label {
      font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--txt-3);
    }
    .st-input-wrap { position: relative; }
    .st-input-icon {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      width: 18px; height: 18px; color: var(--txt-3); pointer-events: none;
    }
    .st-input {
      width: 100%;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r);
      padding: 13px 15px 13px 44px;
      font-family: var(--font-b); font-size: 15px; color: var(--txt);
      outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .st-input.no-icon { padding-left: 15px; }
    .st-input::placeholder { color: var(--txt-3); }
    .st-input:focus { border-color: var(--indigo); box-shadow: 0 0 0 3px rgba(108,142,247,0.12); }
    .st-input:disabled { opacity: 0.45; cursor: not-allowed; }

    /* pw toggle */
    .pw-eye {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      color: var(--txt-3); padding: 2px;
      display: flex; align-items: center; transition: color 0.15s;
    }
    .pw-eye:hover { color: var(--txt-2); }
    .pw-eye svg { width: 18px; height: 18px; }
    .st-input.has-eye { padding-right: 44px; }

    .st-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .st-hint { font-size: 13px; color: var(--txt-3); margin-top: 3px; }

    /* ── Divider ── */
    .st-divider { height: 1px; background: var(--border); }

    /* ── Toggle switch ── */
    .st-toggle-row {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 16px; padding: 16px 0;
      border-bottom: 1px solid var(--border);
    }
    .st-toggle-row:last-child { border-bottom: none; padding-bottom: 0; }
    .st-toggle-row:first-child { padding-top: 0; }
    .st-toggle-info {}
    .st-toggle-name { font-size: 15px; font-weight: 600; color: var(--txt); }
    .st-toggle-desc { font-size: 13px; color: var(--txt-2); margin-top: 4px; }
    .toggle-wrap { position: relative; flex-shrink: 0; margin-top: 2px; }
    .toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }
    .toggle-track {
      display: block; width: 44px; height: 24px;
      background: var(--surface-3); border-radius: 30px;
      cursor: pointer; transition: background 0.2s;
      border: 1px solid var(--border);
    }
    .toggle-input:checked + .toggle-track { background: var(--indigo); border-color: var(--indigo); }
    .toggle-track::after {
      content: ''; position: absolute;
      top: 3px; left: 3px;
      width: 18px; height: 18px;
      background: #fff; border-radius: 50%;
      transition: transform 0.2s;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    }
    .toggle-input:checked + .toggle-track::after { transform: translateX(20px); }

    /* ── Select ── */
    .st-select {
      width: 100%;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r);
      padding: 13px 15px;
      font-family: var(--font-b); font-size: 15px; color: var(--txt);
      outline: none; cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233e4558'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      background-size: 18px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .st-select:focus { border-color: var(--indigo); box-shadow: 0 0 0 3px rgba(108,142,247,0.12); }
    .st-select option { background: #181c24; }

    /* ── Buttons ── */
    .st-btn-row { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
    .st-btn {
      display: inline-flex; align-items: center; gap: 8px;
      font-family: var(--font-b); font-size: 15px; font-weight: 600;
      padding: 12px 24px; border-radius: var(--r); border: none;
      cursor: pointer; transition: all 0.2s;
    }
    .st-btn svg { width: 16px; height: 16px; }
    .st-btn-primary {
      background: linear-gradient(135deg, var(--indigo), #5a7cf0);
      color: #fff; box-shadow: 0 4px 16px rgba(108,142,247,0.25);
    }
    .st-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(108,142,247,0.35); }
    .st-btn-ghost {
      background: var(--surface-2); color: var(--txt-2);
      border: 1px solid var(--border);
    }
    .st-btn-ghost:hover { background: var(--surface-3); color: var(--txt); }
    .st-btn-danger {
      background: rgba(251,113,133,0.1); color: var(--rose);
      border: 1px solid rgba(251,113,133,0.2);
    }
    .st-btn-danger:hover { background: rgba(251,113,133,0.2); transform: translateY(-1px); }
    .st-btn-amber {
      background: rgba(245,158,11,0.1); color: var(--amber);
      border: 1px solid rgba(245,158,11,0.2);
    }
    .st-btn-amber:hover { background: rgba(245,158,11,0.2); transform: translateY(-1px); }

    /* ── Toast ── */
    .st-toast {
      display: flex; align-items: center; gap: 10px;
      border-radius: var(--r); padding: 14px 18px;
      font-size: 14px; animation: fadeUp 0.3s ease;
    }
    .st-toast svg { width: 18px; height: 18px; flex-shrink: 0; }
    .st-toast.success { background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25); color: var(--green); }
    .st-toast.error   { background: rgba(251,113,133,0.1); border: 1px solid rgba(251,113,133,0.25); color: var(--rose); }
    @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

    /* ── Danger zone ── */
    .danger-zone {
      background: rgba(251,113,133,0.05);
      border: 1px solid rgba(251,113,133,0.15);
      border-radius: var(--r); padding: 20px;
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
    }
    .danger-title { font-size: 15px; font-weight: 600; color: var(--rose); }
    .danger-desc  { font-size: 13px; color: var(--txt-2); margin-top: 4px; }

    /* ── Profile avatar ── */
    .profile-av-row {
      display: flex; align-items: center; gap: 20px;
      padding: 20px;
      background: var(--surface-2); border-radius: var(--r);
      border: 1px solid var(--border);
    }
    .profile-av {
      width: 72px; height: 72px; border-radius: 18px;
      background: linear-gradient(135deg, var(--indigo), var(--violet));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-d); font-size: 30px; font-weight: 800; color: #fff;
      box-shadow: 0 4px 20px rgba(108,142,247,0.3);
      flex-shrink: 0;
    }
    .profile-av-info { flex: 1; }
    .profile-av-name { font-family: var(--font-d); font-size: 18px; font-weight: 700; }
    .profile-av-role { font-size: 13px; color: var(--txt-2); margin-top: 4px; }
    .profile-av-badge {
      display: inline-flex; align-items: center; gap: 6px; margin-top: 10px;
      background: rgba(108,142,247,0.1); border: 1px solid rgba(108,142,247,0.2);
      border-radius: 20px; padding: 4px 12px;
      font-size: 12px; font-weight: 600; color: var(--indigo);
    }
    .profile-av-badge::before {
      content: ''; width: 7px; height: 7px; border-radius: 50%;
      background: var(--indigo); box-shadow: 0 0 6px var(--indigo);
    }

    /* stat row in about */
    .about-stats {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
    }
    .about-stat {
      background: var(--surface-2); border: 1px solid var(--border);
      border-radius: var(--r); padding: 16px;
      text-align: center;
    }
    .about-stat-val { font-family: var(--font-d); font-size: 24px; font-weight: 800; }
    .about-stat-lbl { font-size: 12px; color: var(--txt-2); margin-top: 4px; }
    .about-stat-val.indigo { color: var(--indigo); }
    .about-stat-val.teal   { color: var(--teal); }
    .about-stat-val.violet { color: var(--violet); }

    .version-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 0; border-bottom: 1px solid var(--border);
      font-size: 14px;
    }
    .version-row:last-child { border-bottom: none; }
    .version-key { color: var(--txt-2); }
    .version-val { font-weight: 600; color: var(--txt); }
    .version-badge {
      font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
    }
    .version-badge.green { background: rgba(74,222,128,0.1); color: var(--green); border: 1px solid rgba(74,222,128,0.2); }
    .version-badge.amber { background: rgba(245,158,11,0.1); color: var(--amber); border: 1px solid rgba(245,158,11,0.2); }
  `}</style>
);

/* ── Eye icons ── */
const EyeIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
  </svg>
);

/* ── Toast helper ── */
const Toast = ({ msg, type }) => (
  <div className={`st-toast ${type}`}>
    {type === "success"
      ? <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
      : <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    }
    {msg}
  </div>
);

/* ════════════════════════════════════════════
   SECTION COMPONENTS
════════════════════════════════════════════ */

/* ── Profile ── */
const ProfileSection = () => {
  const [name, setName]   = useState("Admin");
  const [email, setEmail] = useState("admin@zenly.com");
  const [toast, setToast] = useState(null);

  const save = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put("http://localhost:5000/api/admin/profile",
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } });
      flash("Profile updated successfully!", "success");
    } catch {
      flash("Failed to update profile.", "error");
    }
  };

  const flash = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="st-card">
      <div className="st-card-header">
        <div className="st-card-icon" style={{ background: "rgba(108,142,247,0.12)", color: "var(--indigo)" }}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <div>
          <div className="st-card-title">Profile</div>
          <div className="st-card-desc">Update your admin display name and email.</div>
        </div>
      </div>
      <div className="st-card-body">
        {toast && <Toast {...toast} />}

        {/* Avatar preview */}
        <div className="profile-av-row">
          <div className="profile-av">{name.charAt(0).toUpperCase()}</div>
          <div className="profile-av-info">
            <div className="profile-av-name">{name || "Admin"}</div>
            <div className="profile-av-role">{email || "—"}</div>
            <div className="profile-av-badge">Super Admin</div>
          </div>
        </div>

        <div className="st-divider" />

        <div className="st-field-row">
          <div className="st-field">
            <label className="st-label">Display Name</label>
            <div className="st-input-wrap">
              <svg className="st-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <input className="st-input" value={name} onChange={e => setName(e.target.value)} placeholder="Admin name" />
            </div>
          </div>
          <div className="st-field">
            <label className="st-label">Email Address</label>
            <div className="st-input-wrap">
              <svg className="st-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <input className="st-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@email.com" />
            </div>
          </div>
        </div>

        <div className="st-btn-row">
          <button className="st-btn st-btn-primary" onClick={save}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            Save Changes
          </button>
          <button className="st-btn st-btn-ghost" onClick={() => { setName("Admin"); setEmail("admin@zenly.com"); }}>Reset</button>
        </div>
      </div>
    </div>
  );
};

/* ── Security ── */
const SecuritySection = () => {
  const [cur, setCur]     = useState("");
  const [nw, setNw]       = useState("");
  const [conf, setConf]   = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNw,  setShowNw]  = useState(false);
  const [showCf,  setShowCf]  = useState(false);
  const [toast, setToast] = useState(null);

  const flash = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const changePassword = async () => {
    if (!cur || !nw || !conf) return flash("Please fill in all fields.", "error");
    if (nw !== conf)           return flash("New passwords do not match.", "error");
    if (nw.length < 8)         return flash("Password must be at least 8 characters.", "error");
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put("http://localhost:5000/api/admin/change-password",
        { currentPassword: cur, newPassword: nw },
        { headers: { Authorization: `Bearer ${token}` } });
      setCur(""); setNw(""); setConf("");
      flash("Password changed successfully!", "success");
    } catch (e) {
      flash(e?.response?.data?.message || "Incorrect current password.", "error");
    }
  };

  const PwField = ({ label, val, setVal, show, setShow, placeholder }) => (
    <div className="st-field">
      <label className="st-label">{label}</label>
      <div className="st-input-wrap">
        <svg className="st-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 9V7a2 2 0 114 0v2m-4 0h4"/>
        </svg>
        <input className="st-input has-eye" type={show ? "text" : "password"}
          value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder} />
        <button className="pw-eye" type="button" onClick={() => setShow(s => !s)}>
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="st-card">
      <div className="st-card-header">
        <div className="st-card-icon" style={{ background: "rgba(251,113,133,0.1)", color: "var(--rose)" }}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 9V7a2 2 0 114 0v2m-4 0h4"/>
          </svg>
        </div>
        <div>
          <div className="st-card-title">Security</div>
          <div className="st-card-desc">Change your admin account password.</div>
        </div>
      </div>
      <div className="st-card-body">
        {toast && <Toast {...toast} />}

        <PwField label="Current Password" val={cur} setVal={setCur} show={showCur} setShow={setShowCur} placeholder="Enter current password" />
        <div className="st-divider" />
        <PwField label="New Password" val={nw} setVal={setNw} show={showNw} setShow={setShowNw} placeholder="Minimum 8 characters" />
        <PwField label="Confirm New Password" val={conf} setVal={setConf} show={showCf} setShow={setShowCf} placeholder="Repeat new password" />

        <div className="st-btn-row">
          <button className="st-btn st-btn-primary" onClick={changePassword}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            Update Password
          </button>
          <button className="st-btn st-btn-ghost" onClick={() => { setCur(""); setNw(""); setConf(""); }}>Clear</button>
        </div>
      </div>
    </div>
  );
};

/* ── Notifications ── */
const NotificationsSection = () => {
  const [settings, setSettings] = useState({
    newUser:     true,
    newBooking:  true,
    blockEvent:  false,
    dailyDigest: false,
    systemAlerts: true,
  });
  const [toast, setToast] = useState(null);

  const toggle = key => setSettings(s => ({ ...s, [key]: !s[key] }));

  const save = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put("http://localhost:5000/api/admin/notifications", settings,
        { headers: { Authorization: `Bearer ${token}` } });
      setToast({ msg: "Notification preferences saved!", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({ msg: "Failed to save. Try again.", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const toggles = [
    { key: "newUser",     name: "New User Registration",   desc: "Get notified when a new user signs up." },
    { key: "newBooking",  name: "New Appointment Booking", desc: "Alert when a user books a psychiatrist session." },
    { key: "blockEvent",  name: "Block / Unblock Events",  desc: "Notify when an account is blocked or unblocked." },
    { key: "dailyDigest", name: "Daily Summary Digest",    desc: "Receive a daily summary of platform activity." },
    { key: "systemAlerts",name: "System Alerts",           desc: "Critical errors, downtime, and server alerts." },
  ];

  return (
    <div className="st-card">
      <div className="st-card-header">
        <div className="st-card-icon" style={{ background: "rgba(245,158,11,0.1)", color: "var(--amber)" }}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </div>
        <div>
          <div className="st-card-title">Notifications</div>
          <div className="st-card-desc">Choose what events you want to be notified about.</div>
        </div>
      </div>
      <div className="st-card-body">
        {toast && <Toast {...toast} />}
        <div>
          {toggles.map(t => (
            <div className="st-toggle-row" key={t.key}>
              <div className="st-toggle-info">
                <div className="st-toggle-name">{t.name}</div>
                <div className="st-toggle-desc">{t.desc}</div>
              </div>
              <label className="toggle-wrap">
                <input className="toggle-input" type="checkbox"
                  checked={settings[t.key]} onChange={() => toggle(t.key)} />
                <span className="toggle-track" />
              </label>
            </div>
          ))}
        </div>
        <div className="st-btn-row">
          <button className="st-btn st-btn-primary" onClick={save}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Appearance ── */
const AppearanceSection = () => {
  const [timezone, setTimezone]   = useState("Asia/Kolkata");
  const [dateFmt, setDateFmt]     = useState("DD/MM/YYYY");
  const [language, setLanguage]   = useState("en");
  const [toast, setToast]         = useState(null);

  const save = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put("http://localhost:5000/api/admin/preferences",
        { timezone, dateFormat: dateFmt, language },
        { headers: { Authorization: `Bearer ${token}` } });
      setToast({ msg: "Preferences saved!", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({ msg: "Failed to save preferences.", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="st-card">
      <div className="st-card-header">
        <div className="st-card-icon" style={{ background: "rgba(45,212,191,0.1)", color: "var(--teal)" }}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
          </svg>
        </div>
        <div>
          <div className="st-card-title">Preferences</div>
          <div className="st-card-desc">Timezone, date format, and language settings.</div>
        </div>
      </div>
      <div className="st-card-body">
        {toast && <Toast {...toast} />}

        <div className="st-field">
          <label className="st-label">Timezone</label>
          <select className="st-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
            <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
            <option value="UTC">UTC (Universal Time)</option>
            <option value="America/New_York">America/New_York (EST, UTC-5)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST, UTC-8)</option>
            <option value="Europe/London">Europe/London (GMT, UTC+0)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
            <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+8)</option>
          </select>
        </div>

        <div className="st-field-row">
          <div className="st-field">
            <label className="st-label">Date Format</label>
            <select className="st-select" value={dateFmt} onChange={e => setDateFmt(e.target.value)}>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="D MMM YYYY">D MMM YYYY</option>
            </select>
          </div>
          <div className="st-field">
            <label className="st-label">Language</label>
            <select className="st-select" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ml">Malayalam</option>
              <option value="ta">Tamil</option>
            </select>
          </div>
        </div>

        <div className="st-btn-row">
          <button className="st-btn st-btn-primary" onClick={save}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── About / System ── */
const AboutSection = () => (
  <div className="st-card">
    <div className="st-card-header">
      <div className="st-card-icon" style={{ background: "rgba(167,139,250,0.1)", color: "var(--violet)" }}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <div>
        <div className="st-card-title">About & System</div>
        <div className="st-card-desc">App version, build info, and system status.</div>
      </div>
    </div>
    <div className="st-card-body">
      <div className="about-stats">
        <div className="about-stat">
          <div className="about-stat-val indigo">v1.0</div>
          <div className="about-stat-lbl">App Version</div>
        </div>
        <div className="about-stat">
          <div className="about-stat-val teal">99.9%</div>
          <div className="about-stat-lbl">Uptime</div>
        </div>
        <div className="about-stat">
          <div className="about-stat-val violet">MERN</div>
          <div className="about-stat-lbl">Stack</div>
        </div>
      </div>

      <div className="st-divider" />

      <div>
        {[
          { key: "Application",   val: "Zenly Admin Panel" },
          { key: "Backend",       val: "Node.js + Express" },
          { key: "Database",      val: "MongoDB" },
          { key: "Frontend",      val: "React 18" },
          { key: "Environment",   val: "Production",  badge: { label: "Live", cls: "green" } },
          { key: "API Version",   val: "v1",          badge: { label: "Stable", cls: "green" } },
        ].map(r => (
          <div className="version-row" key={r.key}>
            <span className="version-key">{r.key}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="version-val">{r.val}</span>
              {r.badge && <span className={`version-badge ${r.badge.cls}`}>{r.badge.label}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════════
   TABS CONFIG
════════════════════════════════════════════ */
const TABS = [
  {
    id: "profile",
    label: "Profile",
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
    component: <ProfileSection />,
  },
  {
    id: "security",
    label: "Security",
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 9V7a2 2 0 114 0v2m-4 0h4"/></svg>,
    component: <SecuritySection />,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>,
    component: <NotificationsSection />,
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>,
    component: <AppearanceSection />,
  },
  {
    id: "about",
    label: "About",
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    component: <AboutSection />,
  },
];

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const active = TABS.find(t => t.id === activeTab);

  return (
    <>
      <GlobalStyles />
      <div className="st-page">
        <div className="st-header">
          <h1 className="st-title">Settings</h1>
          <p className="st-subtitle">Manage your account, security, and platform preferences.</p>
        </div>

        <div className="st-layout">
          {/* Sidebar tabs */}
          <div className="st-tabs">
            <div className="st-tabs-header">Settings</div>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`st-tab${activeTab === t.id ? " active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Active section */}
          {active.component}
        </div>
      </div>
    </>
  );
};

export default AdminSettings;