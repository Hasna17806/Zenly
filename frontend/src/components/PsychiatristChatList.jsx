import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "./Modal";
import SessionChat from "../pages/SessionChat";

const PsychiatristChatList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const token = localStorage.getItem("psychiatristToken") || localStorage.getItem("token");

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/appointments/psychiatrist", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const accepted = res.data.filter(app => app.status === "Accepted");
      setAppointments(accepted);
      await fetchMessagesForAppointments(accepted);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesForAppointments = async (appointmentsList) => {
    const lastMsgMap = {};
    const unreadMap = {};
    for (const app of appointmentsList) {
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/messages/${app._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const messages = res.data;
        if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          lastMsgMap[app._id] = { text: lastMsg.message, time: lastMsg.createdAt, sender: lastMsg.sender };
          unreadMap[app._id] = messages.filter(m => m.receiver === "psychiatrist" && !m.isRead).length;
        } else {
          lastMsgMap[app._id] = null;
          unreadMap[app._id] = 0;
        }
      } catch {
        lastMsgMap[app._id] = null;
        unreadMap[app._id] = 0;
      }
    }
    setLastMessages(lastMsgMap);
    setUnreadMessages(unreadMap);
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 15000);
    return () => clearInterval(interval);
  }, []);

  const openChat = (appointment) => {
    setSelectedChat({
      appointmentId: appointment._id,
      patientName: appointment.userId?.name || "Patient",
      patientId: appointment.userId?._id
    });
  };

  const closeChat = () => {
    setSelectedChat(null);
    fetchAppointments();
  };

  const getInitials = (name) => {
    if (!name) return "P";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins  = Math.floor((now - date) / 60000);
    const diffHours = Math.floor((now - date) / 3600000);
    const diffDays  = Math.floor((now - date) / 86400000);
    if (diffMins  <  1) return "Just now";
    if (diffMins  < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays  === 1) return "Yesterday";
    return date.toLocaleDateString();
  };

  const totalUnread = Object.values(unreadMessages).reduce((s, v) => s + v, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cl-wrap {
          background: #0b1520;
          min-height: 100vh;
          font-family: 'IBM Plex Sans', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Header ── */
        .cl-header {
          padding: 32px 36px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: #0f1d2a;
          flex-shrink: 0;
        }
        .cl-eyebrow {
          font-size: 10px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: #64b4c8; margin-bottom: 6px;
        }
        .cl-header-row {
          display: flex; align-items: flex-end;
          justify-content: space-between; gap: 12px; flex-wrap: wrap;
        }
        .cl-title {
          font-size: 22px; font-weight: 600; color: #eef2f5;
          letter-spacing: -0.02em;
        }
        .cl-header-meta {
          display: flex; align-items: center; gap: 10px;
        }
        .cl-count-chip {
          background: rgba(100,180,200,0.1); border: 1px solid rgba(100,180,200,0.2);
          border-radius: 20px; padding: 4px 12px;
          font-size: 11px; font-weight: 500; color: #64b4c8;
        }
        .cl-unread-chip {
          background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2);
          border-radius: 20px; padding: 4px 12px;
          font-size: 11px; font-weight: 500; color: #f87171;
          display: flex; align-items: center; gap: 5px;
        }
        .cl-unread-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #f87171;
          box-shadow: 0 0 6px rgba(248,113,113,0.7);
          animation: clpulse 2s ease-in-out infinite;
        }
        @keyframes clpulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* ── List ── */
        .cl-list {
          flex: 1; overflow-y: auto; padding: 8px 0;
        }
        .cl-list::-webkit-scrollbar { width: 4px; }
        .cl-list::-webkit-scrollbar-track { background: transparent; }
        .cl-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 4px; }

        /* ── Chat item ── */
        .cl-item {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 36px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          cursor: pointer;
          transition: background 0.15s ease;
          position: relative;
        }
        .cl-item:hover { background: rgba(255,255,255,0.03); }
        .cl-item.cl-unread { background: rgba(100,180,200,0.03); }
        .cl-item.cl-unread:hover { background: rgba(100,180,200,0.06); }

        /* left accent bar on unread */
        .cl-item.cl-unread::before {
          content: '';
          position: absolute; left: 0; top: 50%;
          transform: translateY(-50%);
          width: 3px; height: 50%;
          background: #64b4c8;
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 8px rgba(100,180,200,0.4);
        }

        /* Avatar */
        .cl-avatar {
          width: 50px; height: 50px; border-radius: 50%;
          background: linear-gradient(135deg, #3a7a90, #64b4c8);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 600; color: #0b1520;
          flex-shrink: 0; position: relative;
        }
        .cl-badge {
          position: absolute; top: -3px; right: -3px;
          background: #f87171; color: white; font-size: 9px; font-weight: 700;
          min-width: 17px; height: 17px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px; border: 2px solid #0b1520;
        }

        /* Info */
        .cl-info { flex: 1; min-width: 0; }

        .cl-name-row {
          display: flex; align-items: center;
          justify-content: space-between; gap: 8px; margin-bottom: 4px;
        }
        .cl-name {
          font-size: 14.5px; font-weight: 500; color: #d6e8ef;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cl-item.cl-unread .cl-name { font-weight: 600; color: #eef2f5; }
        .cl-time {
          font-size: 10.5px; color: rgba(255,255,255,0.22); flex-shrink: 0;
        }
        .cl-item.cl-unread .cl-time { color: #64b4c8; }

        .cl-preview-row {
          display: flex; align-items: center; gap: 6px; margin-bottom: 5px;
        }
        .cl-preview {
          font-size: 12.5px; color: rgba(255,255,255,0.28);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
        }
        .cl-item.cl-unread .cl-preview { color: rgba(255,255,255,0.55); font-weight: 500; }

        .cl-session-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10.5px; color: rgba(255,255,255,0.2);
        }
        .cl-session-tag svg { opacity: 0.5; }

        /* Arrow */
        .cl-arrow {
          color: rgba(255,255,255,0.15); flex-shrink: 0;
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .cl-item:hover .cl-arrow {
          color: #64b4c8; transform: translateX(2px);
        }

        /* Loading */
        .cl-loading {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; flex: 1; gap: 14px; padding: 80px 0;
        }
        .cl-spinner {
          width: 34px; height: 34px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.07);
          border-top-color: #64b4c8;
          animation: clspin 0.8s linear infinite;
        }
        @keyframes clspin { to { transform: rotate(360deg); } }
        .cl-loading p { font-size: 13px; color: rgba(255,255,255,0.2); }

        /* Empty */
        .cl-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; flex: 1; padding: 80px 40px; text-align: center; gap: 14px;
        }
        .cl-empty-icon { opacity: 0.18; }
        .cl-empty h3 { font-size: 16px; font-weight: 500; color: rgba(255,255,255,0.35); }
        .cl-empty p  { font-size: 13px; color: rgba(255,255,255,0.18); line-height: 1.6; }

        /* Skeleton */
        .cl-skeleton {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: clshimmer 1.4s ease-in-out infinite; border-radius: 6px;
        }
        @keyframes clshimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .cl-skel-item {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 36px; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
      `}</style>

      <div className="cl-wrap">

        {/* Header */}
        <div className="cl-header">
          <div className="cl-eyebrow">Inbox</div>
          <div className="cl-header-row">
            <h2 className="cl-title">Messages</h2>
            <div className="cl-header-meta">
              <div className="cl-count-chip">{appointments.length} conversations</div>
              {totalUnread > 0 && (
                <div className="cl-unread-chip">
                  <span className="cl-unread-dot" />
                  {totalUnread} unread
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="cl-wrap" style={{ flex: 1 }}>
            {[1,2,3,4].map(i => (
              <div className="cl-skel-item" key={i}>
                <div className="cl-skeleton" style={{ width: 50, height: 50, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                  <div className="cl-skeleton" style={{ width: "45%", height: 14 }} />
                  <div className="cl-skeleton" style={{ width: "70%", height: 12 }} />
                  <div className="cl-skeleton" style={{ width: "30%", height: 10 }} />
                </div>
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="cl-empty">
            <div className="cl-empty-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>No active conversations</h3>
            <p>Accepted appointments with patients<br/>will appear here.</p>
          </div>
        ) : (
          <div className="cl-list">
            {appointments.map(appointment => {
              const lastMsg    = lastMessages[appointment._id];
              const unread     = unreadMessages[appointment._id] || 0;
              const patientName = appointment.userId?.name || "Patient";

              return (
                <div
                  key={appointment._id}
                  className={`cl-item ${unread > 0 ? "cl-unread" : ""}`}
                  onClick={() => openChat(appointment)}
                >
                  {/* Avatar */}
                  <div className="cl-avatar">
                    {getInitials(patientName)}
                    {unread > 0 && <span className="cl-badge">{unread}</span>}
                  </div>

                  {/* Info */}
                  <div className="cl-info">
                    <div className="cl-name-row">
                      <span className="cl-name">{patientName}</span>
                      {lastMsg && <span className="cl-time">{formatTime(lastMsg.time)}</span>}
                    </div>

                    <div className="cl-preview-row">
                      <span className="cl-preview">
                        {lastMsg
                          ? `${lastMsg.sender === "psychiatrist" ? "You: " : ""}${lastMsg.text.length > 55 ? lastMsg.text.slice(0, 55) + "…" : lastMsg.text}`
                          : "No messages yet — start the conversation"}
                      </span>
                    </div>

                    <div className="cl-session-tag">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {appointment.date
                        ? `${new Date(appointment.date).toLocaleDateString()} at ${appointment.time || "TBD"}`
                        : "Session date pending"}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="cl-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedChat && (
        <Modal onClose={closeChat} title={`Chat with ${selectedChat.patientName}`}>
          <SessionChat
            appointmentId={selectedChat.appointmentId}
            onClose={closeChat}
            onMessageSent={() => fetchAppointments()}
          />
        </Modal>
      )}
    </>
  );
};

export default PsychiatristChatList;