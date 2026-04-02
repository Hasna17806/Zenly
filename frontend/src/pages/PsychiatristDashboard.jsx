import { useEffect, useState } from "react";
import axios from "axios";
import PsychiatristLayout from "../components/PsychiatristLayout";
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
          borderRadius: 10, padding: "12px 18px", fontFamily: "'IBM Plex Sans', sans-serif"
        }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 6 }}>{label}</p>
          <p style={{ color: "#64b4c8", fontSize: 18, fontWeight: 600 }}>
            {payload[0].value} <span style={{ fontWeight: 400, fontSize: 14 }}>appointments</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <PsychiatristLayout>
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
                  <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 14, marginBottom: 20 }} />
                  <div className="skeleton" style={{ width: "75%", height: 14, marginBottom: 12 }} />
                  <div className="skeleton" style={{ width: "45%", height: 42 }} />
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
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={last7Days} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "IBM Plex Sans", fontWeight: 500 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "IBM Plex Sans", fontWeight: 500 }}
                axisLine={false} tickLine={false} width={32}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="appointments" fill="#64b4c8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        .dash-main {
          flex: 1;
          padding: 48px 56px;
          overflow-y: auto;
        }

        .dash-topbar { margin-bottom: 44px; }

        .dash-eyebrow {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #64b4c8;
          margin-bottom: 10px;
        }

        .dash-title {
          font-size: 32px;
          font-weight: 700;
          color: #eef2f5;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .dash-sub {
          font-size: 16px;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
          margin-top: 8px;
          line-height: 1.5;
        }

        .dash-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .dash-card {
          background: #111d2b;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 26px 24px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .dash-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.35);
        }

        .dash-card-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .dash-card-label {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 10px;
        }

        .dash-card-value {
          font-size: 42px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .dash-card-glow {
          position: absolute; bottom: -30px; right: -30px;
          width: 110px; height: 110px; border-radius: 50%;
          filter: blur(32px); opacity: 0.18; pointer-events: none;
        }

        .dash-chart-card {
          background: #111d2b;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 32px 36px 28px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.25);
        }

        .dash-chart-header {
          display: flex; align-items: baseline;
          justify-content: space-between;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .dash-chart-title {
          font-size: 18px;
          font-weight: 600;
          color: #eef2f5;
          letter-spacing: -0.01em;
        }

        .dash-chart-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          font-weight: 400;
        }

        .skeleton {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.09) 50%,
            rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 10px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .dash-main {
            padding: 32px 24px;
          }
          .dash-title {
            font-size: 28px;
          }
          .dash-card-value {
            font-size: 36px;
          }
          .dash-chart-card {
            padding: 24px;
          }
        }
      `}</style>
    </PsychiatristLayout>
  );
};

export default PsychiatristDashboard;