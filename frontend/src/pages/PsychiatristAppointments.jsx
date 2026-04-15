import { useEffect, useState } from "react";
import axios from "axios";
import PsychiatristLayout from "../components/PsychiatristLayout";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const PsychiatristAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);
  const [calendarView, setCalendarView] = useState("month");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const token = localStorage.getItem("psychiatristToken");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  const acceptAppointment = async (id, preferredDate, preferredTime) => {
    setActionLoading(prev => ({ ...prev, [id]: "accept" }));
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/accept/${id}`,
        { date: preferredDate, time: preferredTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Appointment accepted successfully.");
      fetchAppointments();
    } catch (error) {
      console.error(error);
      showToast("Failed to accept appointment.", "error");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const rejectAppointment = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: "reject" }));
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/reject/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Appointment rejected.", "error");
      fetchAppointments();
    } catch (error) {
      console.error(error);
      showToast("Failed to reject.", "error");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleNavigate = (date) => {
    setCalendarDate(date);
  };

  const handleViewChange = (view) => {
    setCalendarView(view);
  };

  const events = appointments
    .filter(a => a.status === "Accepted" && a.date && a.time)
    .map(a => {
      const start = new Date(`${a.date}T${a.time}`);
      return {
        title: a.userId?.name || "Session",
        start,
        end: new Date(start.getTime() + 60 * 60 * 1000),
        patientName: a.userId?.name || "Session",
        time: a.time,
      };
    });

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: "#0f3044",
      border: "1px solid #64b4c8",
      borderLeft: "3px solid #64b4c8",
      borderRadius: "5px",
      color: "#a8dce8",
      fontSize: "13px",
      fontWeight: "600",
      fontFamily: "'IBM Plex Sans', sans-serif",
      padding: "4px 8px",
    }
  });

  const CustomEvent = ({ event }) => (
    <div style={{ lineHeight: 1.4 }}>
      <div style={{ fontWeight: 600, fontSize: "13px", color: "#a8dce8" }}>
        {event.patientName}
      </div>
      <div style={{ fontSize: "11.5px", color: "rgba(168,220,232,0.65)" }}>
        {event.time}
      </div>
    </div>
  );

  const statusConfig = {
    Pending:  { color: "#f0b45a", bg: "rgba(240,180,90,0.1)",  border: "rgba(240,180,90,0.2)"  },
    Accepted: { color: "#6dd4a4", bg: "rgba(109,212,164,0.1)", border: "rgba(109,212,164,0.2)" },
    Rejected: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)" },
  };

  const pending  = appointments.filter(a => a.status === "Pending");
  const accepted = appointments.filter(a => a.status === "Accepted");
  const rejected = appointments.filter(a => a.status === "Rejected");

  return (
    <PsychiatristLayout>
      <div className="appt-main">
        <div className="appt-eyebrow">Schedule</div>
        <h2 className="appt-title">Appointments</h2>
        <p className="appt-sub">Manage consultation requests and view your calendar.</p>

        {/* Calendar */}
        <div className="cal-card">
          <div className="cal-header">
            <div className="cal-title">Session Calendar</div>
            <div className="cal-sub">Accepted appointments shown as events</div>
          </div>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 520 }}
            eventPropGetter={eventStyleGetter}
            components={{ event: CustomEvent }}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            date={calendarDate}
            view={calendarView}
          />
        </div>

        {/* Lists */}
        {loading ? (
          [1,2,3].map(i => (
            <div className="skel-card" key={i}>
              <div className="skeleton" style={{ width: "35%", height: 18 }} />
              <div className="skeleton" style={{ width: "55%", height: 14 }} />
              <div className="skeleton" style={{ width: "20%", height: 28, borderRadius: 20 }} />
            </div>
          ))
        ) : appointments.length === 0 ? (
          <div className="empty-state">No appointments yet.</div>
        ) : (
          <>
            {pending.length > 0 && (
              <>
                <div className="section-label">
                  Pending Requests <span className="section-count">{pending.length}</span>
                </div>
                {pending.map(app => (
                  <AppCard 
                    key={app._id} 
                    app={app} 
                    actionLoading={actionLoading[app._id]}
                    onAccept={() => acceptAppointment(app._id, app.date, app.time)} 
                    onReject={() => rejectAppointment(app._id)}
                    statusConfig={statusConfig} 
                  />
                ))}
              </>
            )}
            {accepted.length > 0 && (
              <>
                <div className="section-label">
                  Accepted Sessions <span className="section-count">{accepted.length}</span>
                </div>
                {accepted.map(app => (
                  <AppCard 
                    key={app._id} 
                    app={app} 
                    actionLoading={actionLoading[app._id]}
                    onAccept={() => acceptAppointment(app._id, app.date, app.time)} 
                    onReject={() => rejectAppointment(app._id)}
                    statusConfig={statusConfig} 
                    navigate={navigate} 
                  />
                ))}
              </>
            )}
            {rejected.length > 0 && (
              <>
                <div className="section-label">
                  Rejected <span className="section-count">{rejected.length}</span>
                </div>
                {rejected.map(app => (
                  <AppCard 
                    key={app._id} 
                    app={app} 
                    actionLoading={actionLoading[app._id]}
                    onAccept={() => acceptAppointment(app._id, app.date, app.time)} 
                    onReject={() => rejectAppointment(app._id)}
                    statusConfig={statusConfig} 
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        .appt-main {
          flex: 1;
          padding: 48px 56px;
          overflow-y: auto;
        }
        .appt-eyebrow { font-size: 13px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #64b4c8; margin-bottom: 8px; }
        .appt-title { font-size: 32px; font-weight: 700; color: #eef2f5; letter-spacing: -0.02em; margin: 0; }
        .appt-sub   { font-size: 16px; color: rgba(255,255,255,0.4); font-weight: 400; margin-top: 6px; margin-bottom: 40px; line-height: 1.5; }

        .toast {
          position: fixed; top: 24px; right: 24px; z-index: 9999;
          padding: 14px 24px; border-radius: 12px; font-size: 14px; font-weight: 500;
          font-family: 'IBM Plex Sans', sans-serif; display: flex; align-items: center; gap: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4); animation: slideIn 0.22s ease; pointer-events: none;
        }
        .toast.success { background: #132e42; border: 1px solid rgba(109,212,164,0.3); color: #6dd4a4; }
        .toast.error   { background: #1f1520; border: 1px solid rgba(248,113,113,0.3); color: #f87171; }
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }

        .cal-card {
          background: #111d2b; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 32px 36px; margin-bottom: 40px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.25);
        }
        .cal-header { margin-bottom: 24px; }
        .cal-title  { font-size: 18px; font-weight: 600; color: #eef2f5; }
        .cal-sub    { font-size: 14px; color: rgba(255,255,255,0.35); margin-top: 4px; }

        .cal-card .rbc-calendar {
          background: transparent !important;
          font-family: 'IBM Plex Sans', sans-serif !important;
          color: rgba(255,255,255,0.65) !important;
        }
        .cal-card .rbc-toolbar {
          margin-bottom: 24px !important;
          display: flex !important;
          align-items: center !important;
          flex-wrap: wrap !important;
          gap: 12px !important;
        }
        .cal-card .rbc-toolbar button {
          font-family: 'IBM Plex Sans', sans-serif !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          color: rgba(255,255,255,0.6) !important;
          background: rgba(100,180,200,0.1) !important;
          border: 1px solid rgba(100,180,200,0.2) !important;
          border-radius: 10px !important;
          padding: 10px 18px !important;
          cursor: pointer !important;
          pointer-events: auto !important;
          position: relative !important;
          z-index: 10 !important;
          transition: all 0.2s ease !important;
          user-select: none !important;
        }
        .cal-card .rbc-toolbar button:hover {
          background: rgba(100,180,200,0.2) !important;
          color: #64b4c8 !important;
          border-color: rgba(100,180,200,0.4) !important;
          transform: translateY(-1px);
        }
        .cal-card .rbc-toolbar button.rbc-active,
        .cal-card .rbc-toolbar button.rbc-active:hover {
          background: rgba(100,180,200,0.25) !important;
          color: #64b4c8 !important;
          border-color: rgba(100,180,200,0.5) !important;
          box-shadow: 0 0 8px rgba(100,180,200,0.2);
        }
        .cal-card .rbc-toolbar-label {
          font-size: 18px !important;
          font-weight: 700 !important;
          color: #eef2f5 !important;
          flex-grow: 1 !important;
          text-align: center !important;
        }
        .cal-card .rbc-header {
          font-size: 13px !important;
          font-weight: 700 !important;
          letter-spacing: 0.06em !important;
          text-transform: uppercase !important;
          color: rgba(255,255,255,0.4) !important;
          border-color: rgba(255,255,255,0.07) !important;
          padding: 12px 0 !important;
          background: rgba(0,0,0,0.15) !important;
        }
        .cal-card .rbc-date-cell { font-size: 14px !important; color: rgba(255,255,255,0.4) !important; padding: 6px 10px !important; text-align: right !important; }
        .cal-card .rbc-date-cell.rbc-now button,
        .cal-card .rbc-date-cell.rbc-now a { color: #64b4c8 !important; font-weight: 700 !important; }
        .cal-card .rbc-today { background: rgba(100,180,200,0.08) !important; }

        .section-label {
          font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.35); margin-bottom: 16px; margin-top: 36px;
          display: flex; align-items: center; gap: 10px;
        }
        .section-count { background: rgba(255,255,255,0.1); border-radius: 20px; padding: 4px 10px; font-size: 12px; color: rgba(255,255,255,0.5); font-weight: 600; }

        .app-card {
          background: #111d2b; border: 1px solid rgba(255,255,255,0.07); border-radius: 18px;
          padding: 24px 28px; margin-bottom: 14px; display: flex;
          align-items: flex-start; justify-content: space-between; gap: 24px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .app-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
        .app-left  { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .app-right { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; flex-shrink: 0; }
        .app-name  { font-size: 18px; font-weight: 700; color: #eef2f5; letter-spacing: -0.01em; }
        .app-meta  { font-size: 14px; color: rgba(255,255,255,0.4); display: flex; gap: 20px; flex-wrap: wrap; }
        .app-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 30px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; width: fit-content; margin-top: 6px; }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; }

        .btn-accept {
          padding: 10px 20px; background: rgba(109,212,164,0.12); border: 1px solid rgba(109,212,164,0.3);
          border-radius: 10px; color: #6dd4a4; font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;
          display: flex; align-items: center; gap: 8px; white-space: nowrap;
        }
        .btn-accept:hover:not(:disabled) {
          background: rgba(109,212,164,0.2);
          transform: translateY(-1px);
        }
        .btn-reject {
          padding: 10px 20px; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25);
          border-radius: 10px; color: #f87171; font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;
          display: flex; align-items: center; gap: 8px; white-space: nowrap;
        }
        .btn-reject:hover:not(:disabled) {
          background: rgba(248,113,113,0.2);
          transform: translateY(-1px);
        }
        .btn-accept:disabled, .btn-reject:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-session {
          padding: 10px 22px; background: #64b4c8; border: none; border-radius: 10px;
          color: #0b1520; font-family: 'IBM Plex Sans', sans-serif; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; white-space: nowrap;
        }
        .btn-session:hover {
          background: #7dc6d8;
          transform: translateY(-1px);
        }
        .empty-state { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); font-size: 15px; background: #111d2b; border-radius: 18px; }

        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; border-radius: 10px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skel-card { background: #111d2b; border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; padding: 24px 28px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 12px; }

        .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2); border-top-color: currentColor; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </PsychiatristLayout>
  );
};

/* ── Appointment Card ── */
const AppCard = ({ app, actionLoading, onAccept, onReject, statusConfig, navigate }) => {
  const cfg = statusConfig[app.status] || statusConfig.Pending;
  
  return (
    <div className="app-card">
      <div className="app-left">
        <div className="app-name">{app.userId?.name || "Unknown Patient"}</div>
        <div className="app-meta">
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            {app.userId?.currentMood || "Mood not recorded"}
          </span>
          {app.date && app.time && (
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {app.date} at {app.time}
            </span>
          )}
          {app.status === "Pending" && !app.date && !app.time && (
            <span style={{ color: "#f0b45a" }}>Awaiting patient's preferred time</span>
          )}
        </div>
        <div className="app-badge" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
          <span className="badge-dot" style={{ background: cfg.color }} />
          {app.status}
        </div>
        {app.status === "Pending" && app.date && app.time && (
          <div style={{ marginTop: 8, fontSize: "13px", color: "#64b4c8" }}>
            📅 Patient requested: {app.date} at {app.time}
          </div>
        )}
      </div>

      <div className="app-right">
        {app.status === "Pending" && (
          <>
            <button 
              className="btn-accept" 
              onClick={onAccept} 
              disabled={!!actionLoading}
            >
              {actionLoading === "accept"
                ? <><span className="spinner-sm" /> Accepting…</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Accept</>
              }
            </button>
            <button 
              className="btn-reject" 
              onClick={onReject} 
              disabled={!!actionLoading}
            >
              {actionLoading === "reject"
                ? <><span className="spinner-sm" /> Rejecting…</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Reject</>
              }
            </button>
          </>
        )}
        {app.status === "Accepted" && navigate && (
          <button className="btn-session" onClick={() => navigate(`/psychiatrist/session/${app._id}`)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Start Session
          </button>
        )}
      </div>
    </div>
  );
};

export default PsychiatristAppointments;