import { useEffect, useState } from "react";
import axios from "axios";
import PsychiatristSidebar from "../components/PsychiatristSidebar";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip
} from "recharts";

const PsychiatristDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("psychiatristToken");

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/appointments/psychiatrist",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(a => a.status === "Pending").length;
  const acceptedAppointments = appointments.filter(a => a.status === "Accepted").length;
  const today = new Date().toISOString().split("T")[0];
  const todaySessions = appointments.filter(a => a.date === today).length;
  const uniquePatients = new Set(appointments.map(a => a.userId?._id)).size;

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    return {
      date: date.slice(5),
      appointments: appointments.filter(a => a.date === date).length
    };
  }).reverse();

  const cards = [
    {
      title: "Total Appointments",
      value: totalAppointments,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      accent: "#64b4c8",
      accentBg: "rgba(100,180,200,0.1)",
    },
    {
      title: "Today's Sessions",
      value: todaySessions,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      accent: "#6dd4a4",
      accentBg: "rgba(109,212,164,0.1)",
    },
    {
      title: "Pending Requests",
      value: pendingAppointments,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
      accent: "#f0b45a",
      accentBg: "rgba(240,180,90,0.1)",
    },
    {
      title: "Accepted Sessions",
      value: acceptedAppointments,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
      accent: "#a78bfa",
      accentBg: "rgba(167,139,250,0.1)",
    },
    {
      title: "Total Patients",
      value: uniquePatients,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      accent: "#f87171",
      accentBg: "rgba(248,113,113,0.1)",
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "#1a2d3f", border: "1px solid rgba(100,180,200,0.2)",
          borderRadius: 8, padding: "10px 14px", fontFamily: "'IBM Plex Sans', sans-serif"
        }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 4 }}>{label}</p>
          <p style={{ color: "#64b4c8", fontSize: 15, fontWeight: 600 }}>
            {payload[0].value} <span style={{ fontWeight: 400, fontSize: 12 }}>appointments</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dash-page {
          display: flex;
          min-height: 100vh;
          background: #0b1520;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .dash-main {
          flex: 1;
          padding: 40px 48px;
          overflow-y: auto;
        }

        .dash-topbar { margin-bottom: 36px; }

        .dash-eyebrow {
          font-size: 10px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: #64b4c8; margin-bottom: 6px;
        }

        .dash-title {
          font-size: 24px; font-weight: 600; color: #eef2f5;
          letter-spacing: -0.02em; margin: 0;
        }

        .dash-sub {
          font-size: 13px; color: rgba(255,255,255,0.28);
          font-weight: 300; margin-top: 4px;
        }

        /* Cards grid */
        .dash-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .dash-card {
          background: #111d2b;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 22px 20px;
          position: relative;
          overflow: hidden;
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }

        .dash-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
        }

        .dash-card-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }

        .dash-card-label {
          font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase; color: rgba(255,255,255,0.3);
          margin-bottom: 8px;
        }

        .dash-card-value {
          font-size: 32px; font-weight: 600;
          letter-spacing: -0.03em; line-height: 1;
        }

        .dash-card-glow {
          position: absolute; bottom: -30px; right: -30px;
          width: 90px; height: 90px; border-radius: 50%;
          filter: blur(28px); opacity: 0.15; pointer-events: none;
        }

        /* Chart */
        .dash-chart-card {
          background: #111d2b;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 28px 32px 24px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }

        .dash-chart-header {
          display: flex; align-items: baseline;
          justify-content: space-between; margin-bottom: 24px;
        }

        .dash-chart-title {
          font-size: 15px; font-weight: 600;
          color: #eef2f5; letter-spacing: -0.01em;
        }

        .dash-chart-sub {
          font-size: 11.5px; color: rgba(255,255,255,0.25); font-weight: 300;
        }

        /* Skeleton */
        .skeleton {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.08) 50%,
            rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 8px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="dash-page">
        <PsychiatristSidebar />

        <div className="dash-main">
          <div className="dash-topbar">
            <div className="dash-eyebrow">Overview</div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-sub">Your appointments and patient activity at a glance.</p>
          </div>

          {/* Stat Cards */}
          <div className="dash-cards">
            {loading
              ? Array(5).fill(0).map((_, i) => (
                  <div key={i} className="dash-card">
                    <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 16 }} />
                    <div className="skeleton" style={{ width: "70%", height: 11, marginBottom: 10 }} />
                    <div className="skeleton" style={{ width: "40%", height: 32 }} />
                  </div>
                ))
              : cards.map((card) => (
                  <div className="dash-card" key={card.title}>
                    <div
                      className="dash-card-icon"
                      style={{ background: card.accentBg, color: card.accent }}
                    >
                      {card.icon}
                    </div>
                    <div className="dash-card-label">{card.title}</div>
                    <div className="dash-card-value" style={{ color: card.accent }}>
                      {card.value}
                    </div>
                    <div className="dash-card-glow" style={{ background: card.accent }} />
                  </div>
                ))
            }
          </div>

          {/* Bar Chart */}
          <div className="dash-chart-card">
            <div className="dash-chart-header">
              <span className="dash-chart-title">Appointments — Last 7 Days</span>
              <span className="dash-chart-sub">Daily volume</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={last7Days} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "IBM Plex Sans" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "IBM Plex Sans" }}
                  axisLine={false} tickLine={false} width={28}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="appointments" fill="#64b4c8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default PsychiatristDashboard;