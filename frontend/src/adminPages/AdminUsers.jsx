import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";

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
      --rl:  20px;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 4px; }

    .au-page {
      min-height: 100vh;
      background: var(--bg);
      font-family: var(--font-b);
      color: var(--txt);
      padding: 40px;
      margin-left: 240px;
    }

    /* ── Header ── */
    .au-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 32px;
    }
    .au-title {
      font-family: var(--font-d);
      font-size: 28px; font-weight: 800; letter-spacing: -0.3px; color: var(--txt);
    }
    .au-subtitle { font-size: 15px; color: var(--txt-2); margin-top: 6px; }
    .au-live-chip {
      display: inline-flex; align-items: center; gap: 10px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 40px; padding: 10px 20px;
      font-size: 15px; color: var(--txt-2);
    }
    .live-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--teal); box-shadow: 0 0 7px var(--teal);
      animation: breathe 2s ease-in-out infinite;
    }
    @keyframes breathe { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
    .live-count { font-weight: 700; color: var(--txt); font-size: 16px; }

    /* ── Toolbar ── */
    .au-toolbar {
      display: flex; gap: 12px; align-items: center;
      margin-bottom: 20px;
    }
    .au-search-wrap { flex: 1; position: relative; }
    .au-search-icon {
      position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
      width: 18px; height: 18px; color: var(--txt-3); pointer-events: none;
    }
    .au-search {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r);
      padding: 12px 16px 12px 44px;
      font-family: var(--font-b); font-size: 15px; color: var(--txt);
      outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .au-search::placeholder { color: var(--txt-3); }
    .au-search:focus { border-color: var(--indigo); box-shadow: 0 0 0 3px rgba(108,142,247,0.1); }
    .au-select {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r);
      padding: 12px 16px;
      font-family: var(--font-b); font-size: 15px; color: var(--txt);
      outline: none; cursor: pointer; min-width: 150px;
      transition: border-color 0.2s;
    }
    .au-select:focus { border-color: var(--indigo); }
    .au-select option { background: var(--surface-2); }
    .au-results {
      font-size: 14px; color: var(--txt-2);
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--r); padding: 12px 16px; white-space: nowrap;
    }

    /* ── Table card ── */
    .au-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--rl);
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.3);
    }
    .au-table { width: 100%; border-collapse: collapse; }
    .au-table thead th {
      background: var(--surface-2);
      padding: 16px 20px;
      font-size: 12px; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--txt-3);
      border-bottom: 1px solid var(--border);
      text-align: left;
    }
    .au-table tbody tr {
      border-bottom: 1px solid var(--border);
      transition: background 0.15s;
      position: relative;
    }
    .au-table tbody tr:last-child { border-bottom: none; }
    .au-table tbody tr:hover { background: rgba(108,142,247,0.04); }
    .au-table tbody tr::after {
      content: ''; position: absolute;
      left: 0; top: 0; bottom: 0; width: 0;
      background: linear-gradient(180deg, var(--indigo), var(--violet));
      transition: width 0.2s;
    }
    .au-table tbody tr:hover::after { width: 3px; }
    .au-table tbody td {
      padding: 16px 20px;
      font-size: 15px; color: var(--txt-2);
      vertical-align: middle;
    }

    /* ── User cell ── */
    .user-cell { display: flex; align-items: center; gap: 14px; }
    .user-av {
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--indigo), var(--violet));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-d); font-size: 18px; font-weight: 800; color: #fff;
      box-shadow: 0 2px 10px rgba(108,142,247,0.3);
    }
    .user-name { font-size: 16px; font-weight: 600; color: var(--txt); line-height: 1.3; }
    .user-email { font-size: 13px; color: var(--txt-3); margin-top: 2px; }
    .td-date { font-size: 14px; color: var(--txt-3); white-space: nowrap; }

    /* ── Status badges ── */
    .sbadge {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 600;
      padding: 6px 14px; border-radius: 30px; white-space: nowrap;
    }
    .sbadge::before { content:''; width:7px; height:7px; border-radius:50%; flex-shrink:0; }
    .sbadge-active  { background:rgba(45,212,191,0.1);  color:var(--teal); border:1px solid rgba(45,212,191,0.25); }
    .sbadge-active::before  { background:var(--teal);  box-shadow:0 0 6px var(--teal); }
    .sbadge-blocked { background:rgba(251,113,133,0.1); color:var(--rose); border:1px solid rgba(251,113,133,0.25); }
    .sbadge-blocked::before { background:var(--rose); box-shadow:0 0 6px var(--rose); }

    /* ── Action buttons ── */
    .act-row { display: flex; gap: 8px; }
    .abtn {
      display: inline-flex; align-items: center; gap: 6px;
      font-family: var(--font-b); font-size: 13px; font-weight: 600;
      padding: 8px 16px; border-radius: 10px; border: 1px solid transparent;
      cursor: pointer; transition: all 0.18s; white-space: nowrap;
    }
    .abtn svg { width: 15px; height: 15px; flex-shrink: 0; }
    .abtn-view    { background:rgba(108,142,247,0.1); color:var(--indigo); border-color:rgba(108,142,247,0.2); }
    .abtn-view:hover    { background:rgba(108,142,247,0.2); transform:translateY(-1px); box-shadow:0 4px 12px rgba(108,142,247,0.15); }
    .abtn-block   { background:rgba(245,158,11,0.08);  color:var(--amber); border-color:rgba(245,158,11,0.2); }
    .abtn-block:hover   { background:rgba(245,158,11,0.18); transform:translateY(-1px); box-shadow:0 4px 12px rgba(245,158,11,0.12); }
    .abtn-unblock { background:rgba(74,222,128,0.08);  color:var(--green); border-color:rgba(74,222,128,0.2); }
    .abtn-unblock:hover { background:rgba(74,222,128,0.18); transform:translateY(-1px); box-shadow:0 4px 12px rgba(74,222,128,0.12); }
    .abtn-toggle {
      background:rgba(108,142,247,0.08);
      color:var(--indigo);
      border-color:rgba(108,142,247,0.2);
    }
    .abtn-toggle:hover {
      background:rgba(108,142,247,0.18);
      transform:translateY(-1px);
      box-shadow:0 4px 12px rgba(108,142,247,0.12);
    }

    /* ── Empty ── */
    .au-empty { padding: 80px 20px; text-align: center; color: var(--txt-3); }
    .au-empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.35; }
    .au-empty-text { font-size: 15px; }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; padding: 20px;
    }
    .modal {
      background: var(--surface); border: 1px solid var(--border-h);
      border-radius: var(--rl); width: 600px; max-height: 90vh;
      overflow-y: auto; box-shadow: 0 32px 80px rgba(0,0,0,0.7);
    }
    .modal::-webkit-scrollbar { width: 5px; }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 24px 28px; border-bottom: 1px solid var(--border);
      position: sticky; top: 0; background: var(--surface); z-index: 10;
    }
    .modal-title { font-family: var(--font-d); font-size: 20px; font-weight: 800; letter-spacing: -0.2px; }
    .modal-x {
      width: 36px; height: 36px; border-radius: 10px;
      background: var(--surface-2); border: 1px solid var(--border);
      color: var(--txt-2); display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 18px; transition: all 0.15s;
    }
    .modal-x:hover { background: var(--surface-3); color: var(--txt); }
    .modal-body { padding: 24px 28px 28px; }

    .m-user-banner {
      background: linear-gradient(135deg, rgba(108,142,247,0.08), rgba(167,139,250,0.05));
      border: 1px solid rgba(108,142,247,0.15);
      border-radius: var(--r); padding: 20px 22px;
      display: flex; align-items: center; gap: 18px; margin-bottom: 24px;
    }
    .m-user-av {
      width: 60px; height: 60px; border-radius: 16px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--indigo), var(--violet));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-d); font-size: 24px; font-weight: 800; color: #fff;
      box-shadow: 0 4px 18px rgba(108,142,247,0.35);
    }
    .m-user-name { font-family: var(--font-d); font-size: 20px; font-weight: 700; color: var(--txt); }
    .m-user-email { font-size: 14px; color: var(--txt-2); margin-top: 4px; }
    .m-user-meta { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; align-items: center; }
    .m-chip {
      font-size: 12px; color: var(--txt-3);
      background: rgba(255,255,255,0.04); border: 1px solid var(--border);
      border-radius: 8px; padding: 4px 10px;
    }

    .sec-lbl {
      font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--txt-3);
      margin: 24px 0 14px;
    }

    .stat-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
    .stat-mini {
      background: var(--surface-2); border: 1px solid var(--border);
      border-radius: var(--r); padding: 18px; text-align: center;
    }
    .stat-mini-val { font-family: var(--font-d); font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .stat-mini-lbl { font-size: 12px; color: var(--txt-3); margin-top: 6px; }

    .mood-legend-row { display: flex; flex-direction: column; gap: 12px; }
    .mood-leg-item { display: flex; align-items: center; gap: 12px; }
    .mood-leg-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .mood-leg-name { font-size: 14px; color: var(--txt-2); flex: 1; }
    .mood-leg-bar-bg { flex: 2; height: 5px; background: var(--surface-3); border-radius: 3px; overflow: hidden; }
    .mood-leg-bar-fill { height: 100%; border-radius: 3px; }
    .mood-leg-count { font-size: 14px; font-weight: 600; color: var(--txt); min-width: 28px; text-align: right; }

    .focus-row {
      display: flex; justify-content: space-between; align-items: center;
      background: var(--surface-2); border: 1px solid var(--border);
      border-radius: var(--r); padding: 12px 16px; margin-bottom: 8px;
    }
    .focus-date { font-size: 14px; color: var(--txt-2); }
    .focus-dur {
      font-size: 13px; font-weight: 600; color: var(--blue);
      background: rgba(77,184,255,0.1); border: 1px solid rgba(77,184,255,0.2);
      border-radius: 20px; padding: 4px 14px;
    }

    .m-close-btn {
      width: 100%; margin-top: 24px; padding: 14px;
      background: var(--surface-2); border: 1px solid var(--border);
      border-radius: var(--r); color: var(--txt-2);
      font-family: var(--font-b); font-size: 15px; font-weight: 500;
      cursor: pointer; transition: all 0.18s;
    }
    .m-close-btn:hover { background: var(--surface-3); color: var(--txt); border-color: var(--border-h); }

    .recharts-cartesian-grid-horizontal line,
    .recharts-cartesian-grid-vertical line { stroke: rgba(255,255,255,0.05) !important; }
    .recharts-text { font-size: 12px !important; fill: var(--txt-3) !important; }
    .recharts-legend-item-text { font-size: 12px !important; }
  `}</style>
);

const COLORS = ["#6c8ef7","#2dd4bf","#f59e0b","#fb7185","#a78bfa","#4db8ff","#4ade80"];
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "N/A";

const AdminUsers = () => {
  const [users, setUsers]               = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch]             = useState("");
  const [filter, setFilter]             = useState("all");
  const token = localStorage.getItem("adminToken");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users",
        { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (e) { console.error(e); }
  };
  useEffect(() => { fetchUsers(); }, []);

  const handleToggleActive = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}/block`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  const viewUser = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/users/${id}/activity`,
        { headers: { Authorization: `Bearer ${token}` } });
      setSelectedUser(res.data);
    } catch (e) { console.error(e); }
  };

  const moodData = selectedUser?.stats?.moodDistribution?.map(i => ({ name: i._id, value: i.count })) || [];
  const moodTotal = moodData.reduce((a, c) => a + c.value, 0);
  const focusTrendData = selectedUser?.stats?.recentFocus?.map(s => ({
    date: new Date(s.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric" }),
    duration: s.duration,
  })) || [];

  const filtered = users
    .filter(u => {
      const ms = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
      const mf = filter === "all" || (filter === "active" && !u.isBlocked) || (filter === "blocked" && u.isBlocked);
      return ms && mf;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <>
      <GlobalStyles />
      <div className="au-page">

        {/* Header */}
        <div className="au-header">
          <div>
            <h1 className="au-title">User Management</h1>
            <p className="au-subtitle">View, manage and monitor all registered users.</p>
          </div>
          <div className="au-live-chip">
            <span className="live-dot" />
            Total Users: <span className="live-count">{users.length}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="au-toolbar">
          <div className="au-search-wrap">
            <svg className="au-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input className="au-search" type="text" placeholder="Search by name or email…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="au-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <div className="au-results">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>
        </div>

        {/* Table */}
        <div className="au-card">
          <table className="au-table">
            <thead>
              <tr>
                <th style={{ width:"38%" }}>User</th>
                <th style={{ width:"16%" }}>Joined</th>
                <th style={{ width:"14%" }}>Status</th>
                <th style={{ width:"32%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(user => (
                <tr key={user._id}>
                   <td>
                    <div className="user-cell">
                      <div className="user-av">{user.name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                   </td>
                  <td className="td-date">{fmtDate(user.createdAt)}</td>
                  <td>
                    <span className={`sbadge ${user.isBlocked ? "sbadge-blocked" : "sbadge-active"}`}>
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td>
                    <div className="act-row">
                      <button className="abtn abtn-view" onClick={() => viewUser(user._id)}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        View
                      </button>
                      <button className="abtn abtn-toggle" onClick={() => handleToggleActive(user._id)}>
                        {user.isBlocked ? (
                          <>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                            </svg>
                            Set Active
                          </>
                        ) : (
                          <>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 9V7a2 2 0 114 0v2m-4 0h4"/>
                            </svg>
                            Set Inactive
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4">
                  <div className="au-empty">
                    <div className="au-empty-icon">🔍</div>
                    <div className="au-empty-text">No users match your search criteria.</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {selectedUser && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedUser(null)}>
            <div className="modal">
              <div className="modal-header">
                <span className="modal-title">User Profile</span>
                <button className="modal-x" onClick={() => setSelectedUser(null)}>✕</button>
              </div>
              <div className="modal-body">

                <div className="m-user-banner">
                  <div className="m-user-av">{selectedUser.user.name?.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="m-user-name">{selectedUser.user.name}</div>
                    <div className="m-user-email">{selectedUser.user.email}</div>
                    <div className="m-user-meta">
                      <span className={`sbadge ${selectedUser.user.isBlocked ? "sbadge-blocked" : "sbadge-active"}`}>
                        {selectedUser.user.isBlocked ? "Blocked" : "Active"}
                      </span>
                      <span className="m-chip">Joined {fmtDate(selectedUser.user.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="sec-lbl">Activity Overview</div>
                <div className="stat-row">
                  {[
                    { val: selectedUser.stats.totalFocusSessions, lbl: "Focus Sessions", color: "var(--indigo)" },
                    { val: selectedUser.stats.totalFocusMinutes,  lbl: "Total Minutes",  color: "var(--teal)" },
                    { val: selectedUser.stats.totalMoodEntries,   lbl: "Mood Entries",   color: "var(--violet)" },
                  ].map((s, i) => (
                    <div key={i} className="stat-mini">
                      <div className="stat-mini-val" style={{ color: s.color }}>{s.val}</div>
                      <div className="stat-mini-lbl">{s.lbl}</div>
                    </div>
                  ))}
                </div>

                {moodData.length > 0 ? (
                  <>
                    <div className="sec-lbl">Mood Distribution</div>
                    <div style={{ display:"flex", gap:24, alignItems:"center" }}>
                      <div style={{ width:170, height:170, flexShrink:0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={moodData} dataKey="value" cx="50%" cy="50%"
                              innerRadius={45} outerRadius={70} paddingAngle={3} stroke="none">
                              {moodData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background:"var(--surface-3)", border:"1px solid var(--border-h)", borderRadius:8, fontFamily:"Outfit", fontSize:13 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mood-legend-row" style={{ flex:1 }}>
                        {moodData.map((item, i) => {
                          const pct = moodTotal ? Math.round((item.value / moodTotal) * 100) : 0;
                          return (
                            <div key={i} className="mood-leg-item">
                              <div className="mood-leg-dot" style={{ background: COLORS[i % COLORS.length] }} />
                              <span className="mood-leg-name">{item.name}</span>
                              <div className="mood-leg-bar-bg">
                                <div className="mood-leg-bar-fill" style={{ width:`${pct}%`, background: COLORS[i % COLORS.length] }} />
                              </div>
                              <span className="mood-leg-count">{item.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign:"center", padding:"20px 0", color:"var(--txt-3)", fontSize:14 }}>No mood data yet.</div>
                )}

                <div className="sec-lbl">Recent Focus Sessions</div>
                {selectedUser.stats.recentFocus.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"20px 0", color:"var(--txt-3)", fontSize:14 }}>No sessions yet.</div>
                ) : (
                  <>
                    {focusTrendData.length > 1 && (
                      <div style={{ height:140, marginBottom:16 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={focusTrendData} margin={{ top:5, right:10, bottom:0, left:-20 }}>
                            <defs>
                              <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#4db8ff" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#4db8ff" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="date" tick={{ fill:"#3e4558", fontSize:11 }} axisLine={false} tickLine={false}/>
                            <YAxis tick={{ fill:"#3e4558", fontSize:11 }} axisLine={false} tickLine={false}/>
                            <Tooltip contentStyle={{ background:"var(--surface-3)", border:"1px solid var(--border-h)", borderRadius:8, fontFamily:"Outfit", fontSize:13 }}/>
                            <Area type="monotone" dataKey="duration" stroke="#4db8ff" strokeWidth={2}
                              fill="url(#fg)" dot={{ fill:"#4db8ff", r:3, strokeWidth:0 }}
                              activeDot={{ r:5, fill:"#4db8ff", stroke:"#0a0c10", strokeWidth:2 }}/>
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    <div style={{ maxHeight:200, overflowY:"auto", paddingRight:4 }}>
                      {selectedUser.stats.recentFocus.map(s => (
                        <div key={s._id} className="focus-row">
                          <span className="focus-date">{fmtDate(s.createdAt)}</span>
                          <span className="focus-dur">{s.duration} mins</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <button className="m-close-btn" onClick={() => setSelectedUser(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminUsers;