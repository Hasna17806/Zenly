import { useEffect, useState } from "react";
import axios from "axios";
import PsychiatristSidebar from "../components/PsychiatristSidebar";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const PsychiatristAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [fieldError, setFieldError] = useState({});
  const [toast, setToast] = useState(null);
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

  const acceptAppointment = async (id) => {
    const selected = schedule[id];
    if (!selected || !selected.date || !selected.time) {
      setFieldError(prev => ({ ...prev, [id]: "Please select both date and time." }));
      return;
    }
    setFieldError(prev => ({ ...prev, [id]: "" }));
    setActionLoading(prev => ({ ...prev, [id]: "accept" }));
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/accept/${id}`,
        { date: selected.date, time: selected.time },
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

  // Only accepted appointments with date+time show on calendar
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
      fontSize: "11.5px",
      fontWeight: "600",
      fontFamily: "'IBM Plex Sans', sans-serif",
      padding: "2px 6px",
    }
  });

  const CustomEvent = ({ event }) => (
    <div style={{ lineHeight: 1.35 }}>
      <div style={{ fontWeight: 600, fontSize: "11.5px", color: "#a8dce8" }}>
        {event.patientName}
      </div>
      <div style={{ fontSize: "10.5px", color: "rgba(168,220,232,0.65)" }}>
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .appt-page  { display: flex; min-height: 100vh; background: #0b1520; font-family: 'IBM Plex Sans', sans-serif; }
        .appt-main  { flex: 1; padding: 40px 48px; overflow-y: auto; }
        .appt-eyebrow { font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #64b4c8; margin-bottom: 6px; }
        .appt-title { font-size: 24px; font-weight: 600; color: #eef2f5; letter-spacing: -0.02em; margin: 0; }
        .appt-sub   { font-size: 13px; color: rgba(255,255,255,0.28); font-weight: 300; margin-top: 4px; margin-bottom: 36px; }

        /* Toast */
        .toast {
          position: fixed; top: 24px; right: 24px; z-index: 9999;
          padding: 12px 20px; border-radius: 10px; font-size: 13.5px; font-weight: 500;
          font-family: 'IBM Plex Sans', sans-serif; display: flex; align-items: center; gap: 10px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4); animation: slideIn 0.22s ease; pointer-events: none;
        }
        .toast.success { background: #132e42; border: 1px solid rgba(109,212,164,0.3); color: #6dd4a4; }
        .toast.error   { background: #1f1520; border: 1px solid rgba(248,113,113,0.3); color: #f87171; }
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }

        /* Calendar card */
        .cal-card {
          background: #111d2b; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 28px 32px; margin-bottom: 36px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        .cal-header { margin-bottom: 20px; }
        .cal-title  { font-size: 15px; font-weight: 600; color: #eef2f5; }
        .cal-sub    { font-size: 12px; color: rgba(255,255,255,0.25); margin-top: 2px; }

        /* ── react-big-calendar dark theme ── */
        .cal-card .rbc-calendar {
          background: transparent !important;
          font-family: 'IBM Plex Sans', sans-serif !important;
          color: rgba(255,255,255,0.65) !important;
        }
        .cal-card .rbc-toolbar {
          margin-bottom: 16px !important; display: flex !important;
          align-items: center !important; flex-wrap: wrap !important; gap: 8px !important;
        }
        /* CRITICAL — buttons must be clickable */
        .cal-card .rbc-toolbar button {
          font-family: 'IBM Plex Sans', sans-serif !important;
          font-size: 12px !important; font-weight: 500 !important;
          color: rgba(255,255,255,0.5) !important;
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 7px !important; padding: 6px 13px !important;
          cursor: pointer !important; pointer-events: auto !important;
          position: relative !important; z-index: 10 !important;
          transition: all 0.15s ease !important; user-select: none !important;
        }
        .cal-card .rbc-toolbar button:hover {
          background: rgba(100,180,200,0.15) !important;
          color: #64b4c8 !important; border-color: rgba(100,180,200,0.35) !important;
        }
        .cal-card .rbc-toolbar button:active { background: rgba(100,180,200,0.25) !important; transform: scale(0.97) !important; }
        .cal-card .rbc-toolbar button.rbc-active,
        .cal-card .rbc-toolbar button.rbc-active:hover {
          background: rgba(100,180,200,0.2) !important; color: #64b4c8 !important;
          border-color: rgba(100,180,200,0.45) !important;
        }
        .cal-card .rbc-toolbar-label {
          font-size: 15px !important; font-weight: 600 !important;
          color: #eef2f5 !important; flex-grow: 1 !important; text-align: center !important;
        }
        .cal-card .rbc-month-view,
        .cal-card .rbc-time-view,
        .cal-card .rbc-agenda-view {
          border: 1px solid rgba(255,255,255,0.07) !important;
          border-radius: 10px !important; overflow: hidden !important;
        }
        .cal-card .rbc-header {
          font-size: 10.5px !important; font-weight: 600 !important;
          letter-spacing: 0.08em !important; text-transform: uppercase !important;
          color: rgba(255,255,255,0.28) !important; border-color: rgba(255,255,255,0.07) !important;
          padding: 10px 0 !important; background: rgba(0,0,0,0.1) !important;
        }
        .cal-card .rbc-day-bg       { border-color: rgba(255,255,255,0.05) !important; }
        .cal-card .rbc-month-row    { border-color: rgba(255,255,255,0.05) !important; }
        .cal-card .rbc-today        { background: rgba(100,180,200,0.07) !important; }
        .cal-card .rbc-off-range-bg { background: rgba(0,0,0,0.18) !important; }
        .cal-card .rbc-date-cell    { font-size: 12px !important; color: rgba(255,255,255,0.3) !important; padding: 5px 8px !important; text-align: right !important; }
        .cal-card .rbc-date-cell.rbc-now button,
        .cal-card .rbc-date-cell.rbc-now a { color: #64b4c8 !important; font-weight: 700 !important; }
        .cal-card .rbc-date-cell button,
        .cal-card .rbc-date-cell a  { color: rgba(255,255,255,0.3) !important; background: none !important; border: none !important; font-size: 12px !important; }
        .cal-card .rbc-show-more    { color: #64b4c8 !important; font-size: 11px !important; background: transparent !important; }
        .cal-card .rbc-time-slot    { border-color: rgba(255,255,255,0.04) !important; }
        .cal-card .rbc-timeslot-group { border-color: rgba(255,255,255,0.06) !important; }
        .cal-card .rbc-time-gutter .rbc-label { font-size: 11px !important; color: rgba(255,255,255,0.22) !important; }
        .cal-card .rbc-time-content { border-color: rgba(255,255,255,0.07) !important; }
        .cal-card .rbc-time-header  { border-color: rgba(255,255,255,0.07) !important; }
        .cal-card .rbc-time-header-content { border-color: rgba(255,255,255,0.07) !important; }
        .cal-card .rbc-current-time-indicator { background: #64b4c8 !important; height: 2px !important; }
        .cal-card .rbc-agenda-table { border-color: rgba(255,255,255,0.07) !important; }
        .cal-card .rbc-agenda-table thead tr th { color: rgba(255,255,255,0.3) !important; border-color: rgba(255,255,255,0.07) !important; font-size: 11px !important; letter-spacing: 0.08em !important; text-transform: uppercase !important; }
        .cal-card .rbc-agenda-table tbody tr td { color: rgba(255,255,255,0.55) !important; border-color: rgba(255,255,255,0.05) !important; font-size: 13px !important; }
        .cal-card .rbc-agenda-date-cell, .cal-card .rbc-agenda-time-cell { color: rgba(255,255,255,0.35) !important; }
        .cal-card .rbc-agenda-empty { color: rgba(255,255,255,0.25) !important; padding: 24px !important; }

        /* Section labels */
        .section-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,255,255,0.25); margin-bottom: 12px; margin-top: 32px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-count { background: rgba(255,255,255,0.07); border-radius: 20px; padding: 2px 8px; font-size: 10px; color: rgba(255,255,255,0.3); }

        /* Appointment card */
        .app-card {
          background: #111d2b; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px;
          padding: 20px 24px; margin-bottom: 12px; display: flex;
          align-items: flex-start; justify-content: space-between; gap: 20px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .app-card:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
        .app-left  { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .app-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
        .app-name  { font-size: 15px; font-weight: 600; color: #eef2f5; letter-spacing: -0.01em; }
        .app-meta  { font-size: 12.5px; color: rgba(255,255,255,0.35); display: flex; gap: 16px; flex-wrap: wrap; }
        .app-meta span { display: flex; align-items: center; gap: 5px; }
        .app-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 10.5px; font-weight: 500; letter-spacing: 0.05em; width: fit-content; margin-top: 4px; }
        .badge-dot { width: 5px; height: 5px; border-radius: 50%; }

        .schedule-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
        .sched-input {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; color: #eef2f5; font-family: 'IBM Plex Sans', sans-serif;
          font-size: 13px; padding: 8px 12px; outline: none; transition: border-color 0.15s; color-scheme: dark;
        }
        .sched-input:focus { border-color: rgba(100,180,200,0.45); }
        .field-error { font-size: 11.5px; color: #f87171; margin-top: 6px; }

        .btn-accept {
          padding: 9px 18px; background: rgba(109,212,164,0.12); border: 1px solid rgba(109,212,164,0.25);
          border-radius: 8px; color: #6dd4a4; font-family: 'IBM Plex Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s ease;
          display: flex; align-items: center; gap: 6px; white-space: nowrap;
        }
        .btn-accept:hover:not(:disabled) { background: rgba(109,212,164,0.2); border-color: rgba(109,212,164,0.4); }
        .btn-reject {
          padding: 9px 18px; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2);
          border-radius: 8px; color: #f87171; font-family: 'IBM Plex Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s ease;
          display: flex; align-items: center; gap: 6px; white-space: nowrap;
        }
        .btn-reject:hover:not(:disabled) { background: rgba(248,113,113,0.18); border-color: rgba(248,113,113,0.35); }
        .btn-session {
          padding: 9px 20px; background: #64b4c8; border: none; border-radius: 8px;
          color: #0b1520; font-family: 'IBM Plex Sans', sans-serif; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease; display: flex; align-items: center; gap: 6px; white-space: nowrap;
        }
        .btn-session:hover { background: #7dc6d8; }
        .btn-accept:disabled, .btn-reject:disabled { opacity: 0.45; cursor: not-allowed; }

        .empty-state { text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.2); font-size: 13.5px; }

        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; border-radius: 8px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skel-card { background: #111d2b; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 22px 24px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 10px; }

        .spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.1); border-top-color: currentColor; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success"
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          }
          {toast.msg}
        </div>
      )}

      <div className="appt-page">
        <PsychiatristSidebar />
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
              style={{ height: 460 }}
              eventPropGetter={eventStyleGetter}
              components={{ event: CustomEvent }}
            />
          </div>

          {/* Lists */}
          {loading ? (
            [1,2,3].map(i => (
              <div className="skel-card" key={i}>
                <div className="skeleton" style={{ width: "35%", height: 15 }} />
                <div className="skeleton" style={{ width: "55%", height: 12 }} />
                <div className="skeleton" style={{ width: "20%", height: 22, borderRadius: 20 }} />
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
                    <AppCard key={app._id} app={app} schedule={schedule} setSchedule={setSchedule}
                      error={fieldError[app._id]} actionLoading={actionLoading[app._id]}
                      onAccept={() => acceptAppointment(app._id)} onReject={() => rejectAppointment(app._id)}
                      statusConfig={statusConfig} />
                  ))}
                </>
              )}
              {accepted.length > 0 && (
                <>
                  <div className="section-label">
                    Accepted Sessions <span className="section-count">{accepted.length}</span>
                  </div>
                  {accepted.map(app => (
                    <AppCard key={app._id} app={app} schedule={schedule} setSchedule={setSchedule}
                      error={fieldError[app._id]} actionLoading={actionLoading[app._id]}
                      onAccept={() => acceptAppointment(app._id)} onReject={() => rejectAppointment(app._id)}
                      statusConfig={statusConfig} navigate={navigate} />
                  ))}
                </>
              )}
              {rejected.length > 0 && (
                <>
                  <div className="section-label">
                    Rejected <span className="section-count">{rejected.length}</span>
                  </div>
                  {rejected.map(app => (
                    <AppCard key={app._id} app={app} schedule={schedule} setSchedule={setSchedule}
                      error={fieldError[app._id]} actionLoading={actionLoading[app._id]}
                      onAccept={() => acceptAppointment(app._id)} onReject={() => rejectAppointment(app._id)}
                      statusConfig={statusConfig} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

/* ── Appointment Card ── */
const AppCard = ({ app, schedule, setSchedule, error, actionLoading, onAccept, onReject, statusConfig, navigate }) => {
  const cfg = statusConfig[app.status] || statusConfig.Pending;
  return (
    <div className="app-card">
      <div className="app-left">
        <div className="app-name">{app.userId?.name || "Unknown Patient"}</div>
        <div className="app-meta">
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            {app.userId?.currentMood || "Mood not recorded"}
          </span>
          {app.status === "Accepted" && app.date && app.time && (
            <span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {app.date} at {app.time}
            </span>
          )}
        </div>
        <div className="app-badge" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
          <span className="badge-dot" style={{ background: cfg.color }} />
          {app.status}
        </div>
        {app.status === "Pending" && (
          <div style={{ marginTop: 12 }}>
            <div className="schedule-row">
              <input className="sched-input" type="date" value={schedule[app._id]?.date || ""}
                onChange={e => setSchedule(prev => ({ ...prev, [app._id]: { ...(prev[app._id] || {}), date: e.target.value } }))} />
              <input className="sched-input" type="time" value={schedule[app._id]?.time || ""}
                onChange={e => setSchedule(prev => ({ ...prev, [app._id]: { ...(prev[app._id] || {}), time: e.target.value } }))} />
            </div>
            {error && <div className="field-error">{error}</div>}
          </div>
        )}
      </div>

      <div className="app-right">
        {app.status === "Pending" && (
          <>
            <button className="btn-accept" onClick={onAccept} disabled={!!actionLoading}>
              {actionLoading === "accept"
                ? <><span className="spinner-sm" /> Accepting…</>
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Accept</>
              }
            </button>
            <button className="btn-reject" onClick={onReject} disabled={!!actionLoading}>
              {actionLoading === "reject"
                ? <><span className="spinner-sm" /> Rejecting…</>
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Reject</>
              }
            </button>
          </>
        )}
        {app.status === "Accepted" && navigate && (
          <button className="btn-session" onClick={() => navigate(`/psychiatrist/session/${app._id}`)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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