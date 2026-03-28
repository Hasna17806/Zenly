import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ─── Inject Google Fonts + Global Styles ────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0c10;
      --surface: #111318;
      --surface-2: #181c24;
      --surface-3: #1e2330;
      --border: rgba(255,255,255,0.07);
      --border-hover: rgba(255,255,255,0.14);
      --text-primary: #f0f2f8;
      --text-secondary: #7a8099;
      --text-muted: #3e4558;
      --accent-indigo: #6c8ef7;
      --accent-blue: #4db8ff;
      --accent-teal: #2dd4bf;
      --accent-amber: #f59e0b;
      --accent-rose: #fb7185;
      --accent-violet: #a78bfa;
      --glow-indigo: rgba(108,142,247,0.15);
      --glow-blue: rgba(77,184,255,0.12);
      --glow-teal: rgba(45,212,191,0.12);
      --font-display: 'Plus Jakarta Sans', sans-serif;
      --font-body: 'Outfit', sans-serif;
      --radius: 16px;
      --radius-sm: 10px;
      --radius-lg: 24px;
    }

    body { background: var(--bg); font-family: var(--font-body); font-size: 16px; color: var(--text-primary); }

    .dashboard-root { min-height: 100vh; background: var(--bg); }

    /* ── Header ── */
    .header {
      background: rgba(17,19,24,0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      position: sticky; top: 0; z-index: 100;
      padding: 0 40px;
      height: 72px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .logo-mark {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, var(--accent-indigo), var(--accent-violet));
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 20px var(--glow-indigo);
    }
    .logo-mark svg { width: 20px; height: 20px; color: white; }
    .header-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: -0.2px; color: var(--text-primary); }
    .header-badge {
      font-family: var(--font-body); font-size: 12px; font-weight: 600;
      letter-spacing: 0.05em; text-transform: uppercase;
      background: var(--surface-3); color: var(--accent-teal);
      border: 1px solid rgba(45,212,191,0.2); border-radius: 6px;
      padding: 4px 10px; margin-left: 6px;
    }
    .header-right { display: flex; align-items: center; gap: 12px; }

    .btn {
      display: inline-flex; align-items: center; gap: 8px;
      font-family: var(--font-body); font-size: 15px; font-weight: 500;
      padding: 10px 18px; border-radius: var(--radius-sm); border: none;
      cursor: pointer; transition: all 0.2s; text-decoration: none;
    }
    .btn svg { width: 16px; height: 16px; }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent-indigo), var(--accent-violet));
      color: white; box-shadow: 0 0 20px var(--glow-indigo);
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 24px var(--glow-indigo); }
    .btn-ghost {
      background: var(--surface-2); color: var(--text-secondary);
      border: 1px solid var(--border);
    }
    .btn-ghost:hover { background: var(--surface-3); color: var(--text-primary); border-color: var(--border-hover); }
    .btn-danger { background: rgba(251,113,133,0.12); color: var(--accent-rose); border: 1px solid rgba(251,113,133,0.2); }
    .btn-danger:hover { background: rgba(251,113,133,0.2); transform: translateY(-1px); }

    /* ── Layout ── */
    .main-content { padding: 40px; max-width: 1440px; margin: 0 auto; }

    .page-header {
      margin-bottom: 40px;
      display: flex; align-items: flex-end; justify-content: space-between;
    }
    .page-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; letter-spacing: -0.3px; }
    .page-subtitle { font-size: 16px; color: var(--text-secondary); margin-top: 6px; }
    .date-chip {
      font-size: 14px; color: var(--text-secondary);
      background: var(--surface-2); border: 1px solid var(--border);
      border-radius: 24px; padding: 8px 18px;
      display: flex; align-items: center; gap: 8px;
    }
    .date-chip::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--accent-teal); display: inline-block; box-shadow: 0 0 8px var(--accent-teal); }

    /* ── Stat Cards ── */
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
    @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr; } }

    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
      position: relative; overflow: hidden;
      transition: border-color 0.25s, transform 0.25s;
      cursor: default;
    }
    .stat-card:hover { border-color: var(--border-hover); transform: translateY(-2px); }
    .stat-card::after {
      content: ''; position: absolute; inset: 0;
      background: var(--card-glow, transparent);
      pointer-events: none; border-radius: inherit;
    }
    .stat-card-indigo { --card-glow: radial-gradient(ellipse at top right, var(--glow-indigo), transparent 60%); }
    .stat-card-blue   { --card-glow: radial-gradient(ellipse at top right, var(--glow-blue), transparent 60%); }
    .stat-card-teal   { --card-glow: radial-gradient(ellipse at top right, var(--glow-teal), transparent 60%); }
    .stat-card-amber  { --card-glow: radial-gradient(ellipse at top right, rgba(245,158,11,0.1), transparent 60%); }

    .stat-icon {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
    }
    .stat-icon svg { width: 24px; height: 24px; }
    .icon-indigo { background: rgba(108,142,247,0.12); color: var(--accent-indigo); border: 1px solid rgba(108,142,247,0.2); }
    .icon-blue   { background: rgba(77,184,255,0.1); color: var(--accent-blue); border: 1px solid rgba(77,184,255,0.2); }
    .icon-teal   { background: rgba(45,212,191,0.1); color: var(--accent-teal); border: 1px solid rgba(45,212,191,0.2); }
    .icon-amber  { background: rgba(245,158,11,0.1); color: var(--accent-amber); border: 1px solid rgba(245,158,11,0.2); }

    .stat-label { font-size: 14px; font-weight: 500; letter-spacing: 0.02em; color: var(--text-secondary); margin-bottom: 10px; }
    .stat-value { font-family: var(--font-display); font-size: 32px; font-weight: 700; letter-spacing: -0.5px; color: var(--text-primary); line-height: 1.1; }
    .stat-footer { display: flex; align-items: center; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
    .stat-delta { font-size: 14px; font-weight: 600; }
    .delta-up { color: var(--accent-teal); }
    .delta-down { color: var(--accent-rose); }
    .stat-period { font-size: 14px; color: var(--text-muted); }

    /* ── Charts Grid ── */
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    @media (max-width: 1024px) { .charts-grid { grid-template-columns: 1fr; } }

    .chart-full { grid-column: 1 / -1; }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
      transition: border-color 0.2s;
    }
    .card:hover { border-color: var(--border-hover); }

    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
    .card-title-group { display: flex; align-items: center; gap: 12px; }
    .card-dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot-blue   { background: var(--accent-blue);   box-shadow: 0 0 8px var(--accent-blue); }
    .dot-purple { background: var(--accent-violet); box-shadow: 0 0 8px var(--accent-violet); }
    .dot-pink   { background: var(--accent-rose);   box-shadow: 0 0 8px var(--accent-rose); }
    .card-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: -0.1px; }
    .card-meta { font-size: 14px; color: var(--text-secondary); }

    /* Chart Customization */
    .recharts-cartesian-grid-horizontal line,
    .recharts-cartesian-grid-vertical line { stroke: var(--border) !important; }
    .recharts-text { fill: var(--text-secondary) !important; font-family: var(--font-body) !important; font-size: 13px !important; }

    .chart-stats-row {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 1px; background: var(--border);
      border-radius: var(--radius-sm); overflow: hidden;
      margin-top: 24px; border: 1px solid var(--border);
    }
    .chart-stat { background: var(--surface-2); padding: 16px 20px; text-align: center; }
    .chart-stat-label { font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-secondary); }
    .chart-stat-value { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); margin-top: 4px; }

    /* ── Activity Feed ── */
    .activity-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .activity-item {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px;
      background: var(--surface-2); border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      transition: background 0.2s, border-color 0.2s;
    }
    .activity-item:hover { background: var(--surface-3); border-color: var(--border-hover); }
    .activity-emoji { font-size: 22px; width: 32px; text-align: center; flex-shrink: 0; }
    .activity-info { flex: 1; }
    .activity-user { font-size: 16px; font-weight: 600; color: var(--text-primary); }
    .activity-action { font-size: 14px; color: var(--text-secondary); margin-top: 2px; }
    .activity-time { font-size: 13px; color: var(--text-muted); flex-shrink: 0; }

    /* ── Mood Distribution ── */
    .mood-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
    @media (max-width: 768px) { .mood-grid { grid-template-columns: 1fr; } }

    .mood-legend { display: flex; flex-direction: column; gap: 16px; }
    .mood-row { display: flex; align-items: center; gap: 12px; }
    .mood-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .mood-name { font-size: 15px; color: var(--text-secondary); flex: 1; }
    .mood-bar-wrap { flex: 2; height: 6px; background: var(--surface-3); border-radius: 4px; overflow: hidden; }
    .mood-bar-fill { height: 100%; border-radius: 4px; }
    .mood-count { font-size: 15px; font-weight: 600; color: var(--text-primary); min-width: 35px; text-align: right; }
    .mood-pct { font-size: 13px; color: var(--text-muted); min-width: 42px; text-align: right; }

    /* ── Tooltip ── */
    .custom-tooltip {
      background: var(--surface-3); border: 1px solid var(--border-hover);
      border-radius: var(--radius-sm); padding: 12px 16px;
      font-family: var(--font-body); font-size: 15px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .tooltip-label { color: var(--text-secondary); font-size: 13px; margin-bottom: 4px; }
    .tooltip-value { color: var(--text-primary); font-weight: 600; font-size: 16px; }

    /* ── States ── */
    .state-screen {
      min-height: 100vh; background: var(--bg);
      display: flex; align-items: center; justify-content: center;
    }
    .state-box {
      text-align: center; padding: 56px; border-radius: var(--radius-lg);
      background: var(--surface); border: 1px solid var(--border);
      max-width: 420px; width: 90%;
    }
    .spinner {
      width: 52px; height: 52px;
      border: 4px solid var(--surface-3);
      border-top-color: var(--accent-indigo);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 24px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .state-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; margin-bottom: 10px; }
    .state-msg { font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px; }

    /* ── Divider ── */
    .divider { height: 1px; background: var(--border); margin: 24px 0; }
  `}</style>
);

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label}</div>
      <div className="tooltip-value">{payload[0].value}h</div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const COLORS = ["#6c8ef7", "#2dd4bf", "#f59e0b", "#fb7185", "#a78bfa"];

  const [stats, setStats] = useState({ totalUsers:0, focusHoursToday:0, moodLogsToday:0, challengesCompleted:0, newUsers:0, focusChange:0, moodChange:0, challengeChange:0 });
  const [focusData, setFocusData] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token') ||
                  sessionStorage.getItem('adminToken') || sessionStorage.getItem('token');
    if (!token) navigate('/admin/login');
    else fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token') ||
                    sessionStorage.getItem('adminToken') || sessionStorage.getItem('token');
      if (!token) { setError('No authentication token found'); setLoading(false); return; }

      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, focusRes, moodRes, activityRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', { headers }).catch(() => ({ data: null })),
        axios.get('http://localhost:5000/api/admin/focus-weekly', { headers }).catch(() => ({ data: null })),
        axios.get('http://localhost:5000/api/admin/mood-distribution', { headers }).catch(() => ({ data: null })),
        axios.get('http://localhost:5000/api/admin/recent-activity', { headers }).catch(() => ({ data: null })),
      ]);

      setStats(statsRes.data || { totalUsers:1248, focusHoursToday:126*3600, moodLogsToday:312, challengesCompleted:89, newUsers:150, focusChange:8, moodChange:15, challengeChange:6 });
      setFocusData(focusRes.data || [{ day:'Mon',hours:3 },{ day:'Tue',hours:4 },{ day:'Wed',hours:2 },{ day:'Thu',hours:5 },{ day:'Fri',hours:4 },{ day:'Sat',hours:1 },{ day:'Sun',hours:2 }]);
      setMoodData(moodRes.data || [{ name:'Happy',value:35 },{ name:'Calm',value:16 },{ name:'Sad',value:13 },{ name:'Stressed',value:25 },{ name:'Angry',value:11 }]);
      setRecentActivity(activityRes.data || [
        { emoji:'🟢', user:'Hasna', action:'Logged a mood entry', time:'5m ago' },
        { emoji:'🔵', user:'Ahmed', action:'Completed daily challenge', time:'12m ago' },
        { emoji:'🟣', user:'Rahna', action:'New account registration', time:'25m ago' },
        { emoji:'🟡', user:'Yousaf', action:'Started focus session', time:'1h ago' },
        { emoji:'🔴', user:'John', action:'Logged a mood entry', time:'2h ago' },
      ]);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  const formatFocusHours = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const handleLogout = () => {
    ['adminToken','token'].forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
    navigate('/admin/login');
  };

  if (loading) return (
    <><GlobalStyles />
    <div className="state-screen">
      <div className="state-box">
        <div className="spinner"></div>
        <div className="state-title">Loading Dashboard</div>
        <div className="state-msg">Fetching your analytics data…</div>
      </div>
    </div></>
  );

  if (error) return (
    <><GlobalStyles />
    <div className="state-screen">
      <div className="state-box">
        <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
        <div className="state-title">Something went wrong</div>
        <div className="state-msg">{error}</div>
        <button className="btn btn-primary" onClick={() => { setLoading(true); setError(null); fetchDashboardData(); }}>
          Retry
        </button>
      </div>
    </div></>
  );

  const moodTotal = moodData.reduce((a, c) => a + c.value, 0);
  const focusAvg = focusData.length ? Math.round(focusData.reduce((a,c) => a+c.hours, 0) / focusData.length) : 0;
  const focusTotal = focusData.reduce((a,c) => a+c.hours, 0);
  const focusPeak = focusData.length ? focusData.reduce((mx, it) => it.hours > mx.hours ? it : mx, focusData[0]).day : '—';

  return (
    <>
      <GlobalStyles />
      <div className="dashboard-root">

        {/* ── Header ── */}
        <header className="header">
          <div className="header-left">
            <div className="logo-mark">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
              </svg>
            </div>
          </div>
          <div className="header-right">
            <button className="btn btn-ghost" onClick={() => navigate("/admin/users")}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              Manage Users
            </button>
            <button className="btn btn-danger" onClick={handleLogout}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Sign Out
            </button>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="main-content">

          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Overview</h1>
              <p className="page-subtitle">Track engagement, focus trends, and user wellbeing in real time.</p>
            </div>
            <div className="date-chip">{today}</div>
          </div>

          {/* Stat Cards */}
          <div className="stats-grid">
            <div className="stat-card stat-card-indigo">
              <div className="stat-icon icon-indigo">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
              <div className="stat-footer">
                <span className="stat-delta delta-up">+{stats.newUsers || 0} this week</span>
              </div>
            </div>

            <div className="stat-card stat-card-blue">
              <div className="stat-icon icon-blue">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="stat-label">Focus Hours Today</div>
              <div className="stat-value">{formatFocusHours(stats.focusHoursToday)}</div>
              <div className="stat-footer">
                <span className={`stat-delta ${stats.focusChange >= 0 ? 'delta-up' : 'delta-down'}`}>
                  {stats.focusChange > 0 ? '+' : ''}{stats.focusChange}%
                </span>
                <span className="stat-period">vs yesterday</span>
              </div>
            </div>

            <div className="stat-card stat-card-teal">
              <div className="stat-icon icon-teal">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="stat-label">Mood Logs Today</div>
              <div className="stat-value">{stats.moodLogsToday.toLocaleString()}</div>
              <div className="stat-footer">
                <span className={`stat-delta ${stats.moodChange >= 0 ? 'delta-up' : 'delta-down'}`}>
                  {stats.moodChange > 0 ? '+' : ''}{stats.moodChange}%
                </span>
                <span className="stat-period">vs yesterday</span>
              </div>
            </div>

            <div className="stat-card stat-card-amber">
              <div className="stat-icon icon-amber">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="stat-label">Challenges Completed</div>
              <div className="stat-value">{stats.challengesCompleted}</div>
              <div className="stat-footer">
                <span className={`stat-delta ${stats.challengeChange >= 0 ? 'delta-up' : 'delta-down'}`}>
                  {stats.challengeChange > 0 ? '+' : ''}{stats.challengeChange}%
                </span>
                <span className="stat-period">vs yesterday</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-grid">
            {/* Focus Trend */}
            <div className="card">
              <div className="card-header">
                <div className="card-title-group">
                  <span className="card-dot dot-blue"></span>
                  <span className="card-title">Weekly Focus Trend</span>
                </div>
                <span className="card-meta">Last 7 days</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={focusData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4db8ff" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#4db8ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill:'#7a8099', fontSize:12, fontFamily:'DM Sans' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#7a8099', fontSize:12, fontFamily:'DM Sans' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke:'rgba(255,255,255,0.06)', strokeWidth:1 }} />
                  <Area type="monotone" dataKey="hours" stroke="#4db8ff" strokeWidth={2.5}
                    fill="url(#focusGrad)" dot={{ fill:'#4db8ff', strokeWidth:0, r:5 }}
                    activeDot={{ r:7, fill:'#4db8ff', stroke:'#0a0c10', strokeWidth:2 }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="chart-stats-row">
                <div className="chart-stat">
                  <div className="chart-stat-label">Avg / Day</div>
                  <div className="chart-stat-value">{focusAvg}h</div>
                </div>
                <div className="chart-stat">
                  <div className="chart-stat-label">Peak Day</div>
                  <div className="chart-stat-value">{focusPeak}</div>
                </div>
                <div className="chart-stat">
                  <div className="chart-stat-label">Total</div>
                  <div className="chart-stat-value">{focusTotal}h</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="card-header">
                <div className="card-title-group">
                  <span className="card-dot dot-purple"></span>
                  <span className="card-title">Recent Activity</span>
                </div>
                <span className="card-meta">{recentActivity.length} events</span>
              </div>
              {recentActivity.length > 0 ? (
                <ul className="activity-list">
                  {recentActivity.map((a, i) => (
                    <li key={i} className="activity-item">
                      <span className="activity-emoji">{a.emoji || '🔵'}</span>
                      <div className="activity-info">
                        <div className="activity-user">{a.user}</div>
                        <div className="activity-action">{a.action}</div>
                      </div>
                      <span className="activity-time">{a.time}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text-muted)', fontSize:14 }}>No recent activity</div>
              )}
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="card">
            <div className="card-header">
              <div className="card-title-group">
                <span className="card-dot dot-pink"></span>
                <span className="card-title">Mood Distribution</span>
              </div>
              <span className="card-meta">{moodTotal} total logs</span>
            </div>

            {moodData.length > 0 ? (
              <div className="mood-grid">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={moodData} cx="50%" cy="50%" innerRadius={70} outerRadius={115}
                      paddingAngle={3} dataKey="value" stroke="none">
                      {moodData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background:'var(--surface-3)', border:'1px solid var(--border-hover)', borderRadius:8, fontFamily:'DM Sans', fontSize:14 }}
                      labelStyle={{ color:'var(--text-secondary)' }}
                      itemStyle={{ color:'var(--text-primary)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mood-legend">
                  {moodData.map((item, idx) => {
                    const pct = Math.round((item.value / moodTotal) * 100);
                    return (
                      <div key={idx} className="mood-row">
                        <div className="mood-dot" style={{ background: COLORS[idx % COLORS.length] }}></div>
                        <span className="mood-name">{item.name}</span>
                        <div className="mood-bar-wrap">
                          <div className="mood-bar-fill" style={{ width:`${pct}%`, background: COLORS[idx % COLORS.length] }}></div>
                        </div>
                        <span className="mood-count">{item.value}</span>
                        <span className="mood-pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'70px 0', color:'var(--text-muted)', fontSize:14 }}>No mood data available</div>
            )}
          </div>

        </main>
      </div>
    </>
  );
};

export default AdminDashboard;