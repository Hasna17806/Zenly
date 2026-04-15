import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const BellIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CheckCircleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const InboxIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const TrashIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const CheckAllIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClockIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const getVariant = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("accepted"))  return { icon: <CheckCircleIcon />, color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", pill: "#dcfce7", pillText: "#15803d" };
  if (t.includes("rejected"))  return { icon: <XCircleIcon />,    color: "#dc2626", bg: "#fff5f5", border: "#fecaca", pill: "#fee2e2", pillText: "#b91c1c" };
  if (t.includes("requested")) return { icon: <InboxIcon />,      color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", pill: "#dbeafe", pillText: "#1d4ed8" };
  if (t.includes("cancelled")) return { icon: <TrashIcon />,      color: "#d97706", bg: "#fffbeb", border: "#fde68a", pill: "#fef3c7", pillText: "#b45309" };
  return                               { icon: <BellIcon size={16}/>, color: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff", pill: "#ede9fe", pillText: "#6d28d9" };
};

const cleanMessage = (msg = "") =>
  msg.replace(/\bDr\.\s*Dr\.\s*/gi, "Dr. ").replace(/\bDr\s+Dr\s+/gi, "Dr. ");

const formatDate = (d) =>
  new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// ── Styles with Larger Fonts ────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Lato:wght@300;400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .np-root {
    min-height: 100vh;
    background: #f8f9fc;
    font-family: 'Lato', sans-serif;
    padding: 52px 24px 96px;
  }

  .np-inner {
    max-width: 800px;
    margin: 0 auto;
  }

  .np-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 36px;
  }

  .np-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Lato', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 12px;
  }

  .np-label-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #3b82f6;
    animation: blink 2.4s ease-in-out infinite;
  }

  @keyframes blink {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.35; transform:scale(.7); }
  }

  .np-title {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 44px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #0f172a;
    line-height: 1.1;
    margin-bottom: 10px;
  }

  .np-sub {
    font-size: 16px;
    color: #94a3b8;
    font-weight: 400;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .np-unread-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 14px;
    color: #64748b;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  .np-unread-dot {
    width: 9px; height: 9px;
    border-radius: 50%;
    background: #3b82f6;
  }

  .np-unread-count {
    font-weight: 700;
    color: #1e40af;
  }

  .np-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    border-radius: 12px;
    font-family: 'Lato', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s ease;
    white-space: nowrap;
    margin-top: 8px;
    flex-shrink: 0;
  }

  .np-btn-active {
    background: #0f172a;
    color: #fff;
    border: 1.5px solid #0f172a;
    box-shadow: 0 4px 14px rgba(15,23,42,0.18);
  }

  .np-btn-active:hover {
    background: #1e293b;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(15,23,42,0.22);
  }

  .np-btn-done {
    background: #fff;
    color: #94a3b8;
    border: 1.5px solid #e2e8f0;
    cursor: default;
  }

  .np-divider {
    height: 1px;
    background: linear-gradient(90deg, #e2e8f0 0%, transparent 100%);
    margin-bottom: 32px;
  }

  .np-list { display: flex; flex-direction: column; gap: 14px; }

  .np-section-label {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #cbd5e1;
    margin-bottom: 12px;
    margin-top: 8px;
    padding-left: 4px;
  }

  .np-card {
    background: #ffffff;
    border: 1.5px solid #e8ecf3;
    border-radius: 20px;
    padding: 24px 26px;
    display: flex;
    align-items: flex-start;
    gap: 18px;
    transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
    position: relative;
    overflow: hidden;
    animation: fadeUp 0.3s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .np-card:hover {
    box-shadow: 0 8px 32px rgba(15,23,42,0.09);
    border-color: #cbd5e1;
    transform: translateY(-2px);
  }

  .np-card.unread {
    border-color: var(--c-border);
  }

  .np-card.unread::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--c-accent);
    border-radius: 20px 20px 0 0;
  }

  .np-icon {
    width: 48px; height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1.5px solid var(--c-border);
    background: var(--c-bg);
    color: var(--c-accent);
    margin-top: 2px;
    transition: transform 0.18s ease;
  }

  .np-card:hover .np-icon { transform: scale(1.08); }

  .np-body { flex: 1; min-width: 0; }

  .np-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .np-card-title {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.01em;
  }

  .np-card.read .np-card-title { color: #64748b; font-weight: 600; }

  .np-new-pill {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 999px;
    background: var(--c-pill);
    color: var(--c-pill-text);
    border: 1px solid var(--c-border);
    flex-shrink: 0;
  }

  .np-msg {
    font-size: 15px;
    color: #94a3b8;
    line-height: 1.65;
    margin-bottom: 14px;
    font-weight: 400;
  }

  .np-card.unread .np-msg { color: #475569; }

  .np-meta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #94a3b8;
    font-weight: 400;
  }

  /* Read indicator button */
  .np-read-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    background: transparent;
    border: 1px solid #e2e8f0;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .np-read-btn:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    color: #3b82f6;
  }

  .np-read-btn.done {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #16a34a;
    cursor: default;
  }

  .np-read-btn.done:hover {
    background: #f0fdf4;
    color: #16a34a;
  }

  .np-empty {
    text-align: center;
    padding: 100px 20px;
    background: #fff;
    border: 1.5px dashed #e2e8f0;
    border-radius: 24px;
  }

  .np-empty-icon {
    width: 70px; height: 70px;
    border-radius: 20px;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }

  .np-empty-title {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 26px;
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 12px;
  }

  .np-empty-sub {
    font-size: 16px;
    color: #cbd5e1;
    max-width: 320px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

// ── NotifCard ─────────────────────────────────────────────────────────────────
const NotifCard = ({ item, delay = 0, onMarkAsRead }) => {
  const v = getVariant(item.title);
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkAsRead = async () => {
    if (item.isRead) return;
    setIsMarking(true);
    await onMarkAsRead(item._id);
    setIsMarking(false);
  };

  return (
    <div
      className={`np-card ${item.isRead ? "read" : "unread"}`}
      style={{
        "--c-accent": v.color,
        "--c-bg": v.bg,
        "--c-border": v.border,
        "--c-pill": v.pill,
        "--c-pill-text": v.pillText,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="np-icon">{v.icon}</div>
      <div className="np-body">
        <div className="np-top-row">
          <span className="np-card-title">{item.title}</span>
          {!item.isRead && <span className="np-new-pill">New</span>}
        </div>
        <p className="np-msg">{cleanMessage(item.message)}</p>
        <div className="np-meta">
          <ClockIcon size={14} />
          {formatDate(item.createdAt)}
        </div>
      </div>
      {!item.isRead && (
        <button 
          className="np-read-btn" 
          onClick={handleMarkAsRead}
          disabled={isMarking}
        >
          {isMarking ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 2a10 10 0 1 1 0 20" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              Marking...
            </>
          ) : (
            <>
              <CheckCircleIcon size={14} />
              Mark as read
            </>
          )}
        </button>
      )}
      {item.isRead && (
        <button className="np-read-btn done" disabled>
          <CheckCircleIcon size={14} />
          Read
        </button>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAllAsRead = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await axios.put(
        "http://localhost:5000/api/notifications/read-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchNotifications();
    } catch (err) {
      console.error("Error marking as read:", err);
    } finally {
      setLoading(false);
    }
  };

  const markSingleAsRead = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/read/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchNotifications();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const allRead = unreadCount === 0;

  return (
    <>
      <style>{css}</style>
      <Navbar />
      <div className="np-root">
        <div className="np-inner">

          <div className="np-header">
            <div>
              <div className="np-label">
                <span className="np-label-dot" />
                Activity Center
              </div>
              <h1 className="np-title">Notifications</h1>
              <p className="np-sub">Stay updated with your appointment activity.</p>
              {notifications.length > 0 && (
                <div className="np-unread-badge">
                  <span className="np-unread-dot" />
                  <span className="np-unread-count">{unreadCount}</span>
                  &nbsp;unread {unreadCount === 1 ? "notification" : "notifications"}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <button
                className={`np-btn ${allRead ? "np-btn-done" : "np-btn-active"}`}
                onClick={!allRead ? markAllAsRead : undefined}
                disabled={allRead || loading}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M12 2a10 10 0 1 1 0 20" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                    Marking...
                  </>
                ) : (
                  <>
                    <CheckAllIcon />
                    {allRead ? "All caught up" : "Mark all read"}
                  </>
                )}
              </button>
            )}
          </div>

          <div className="np-divider" />

          <div className="np-list">
            {notifications.length > 0 ? (
              <>
                {unreadCount > 0 && (
                  <>
                    <div className="np-section-label">New</div>
                    {notifications.filter(n => !n.isRead).map((item, i) => (
                      <NotifCard 
                        key={item._id} 
                        item={item} 
                        delay={i * 0.05} 
                        onMarkAsRead={markSingleAsRead}
                      />
                    ))}
                  </>
                )}
                {notifications.some(n => n.isRead) && (
                  <>
                    <div className="np-section-label" style={{ marginTop: unreadCount > 0 ? "20px" : 0 }}>
                      Earlier
                    </div>
                    {notifications.filter(n => n.isRead).map((item, i) => (
                      <NotifCard 
                        key={item._id} 
                        item={item} 
                        delay={i * 0.04} 
                        onMarkAsRead={markSingleAsRead}
                      />
                    ))}
                  </>
                )}
              </>
            ) : (
              <div className="np-empty">
                <div className="np-empty-icon">
                  <BellIcon size={28} color="#cbd5e1" />
                </div>
                <h2 className="np-empty-title">Nothing here yet</h2>
                <p className="np-empty-sub">
                  Once you book appointments or get updates, they'll appear here.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default NotificationsPage;