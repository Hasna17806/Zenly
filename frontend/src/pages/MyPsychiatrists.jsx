import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import SessionButton from "../components/SessionButton";
import Modal from "../components/Modal";
import SessionChat from "./SessionChat";

const MyPsychiatrists = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({});
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  const deleteBookingState = (psychiatristId) => {
    setBooking((prev) => {
      const n = { ...prev };
      delete n[psychiatristId];
      return n;
    });
  };

  const fetchMyPsychiatrists = async () => {
    try {
      const [psyRes, appRes] = await Promise.all([
        API.get("/my-psychiatrists/my"),
        API.get("/appointments/user")
      ]);

      setList(psyRes.data);

      const bookingMap = {};

      appRes.data.forEach((app) => {
        const psychId = app.psychiatristId?._id || app.psychiatristId;
        if (!psychId) return;

        if (app.status === "Pending") {
          bookingMap[psychId] = { status: "pending", appointmentId: app._id };
        } else if (app.status === "Accepted") {
          bookingMap[psychId] = { status: "accepted", appointmentId: app._id };
        } else if (app.status === "Rejected") {
          bookingMap[psychId] = { status: "rejected", appointmentId: app._id };
        }
      });

      setBooking(bookingMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPsychiatrists();
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const bookAppointment = async (psychiatristId) => {
    setBooking((prev) => ({ ...prev, [psychiatristId]: { status: "pending" } }));

    try {
      const res = await API.post("/appointments/book", { psychiatristId });
      console.log("BOOK SUCCESS:", res.data);

      setBooking((prev) => ({ ...prev, [psychiatristId]: { status: "pending", appointmentId: res.data.appointment?._id } }));

      showToast(
        "success",
        "Appointment Requested",
        "Your appointment request has been sent. Please wait for confirmation."
      );
    } catch (err) {
      console.error("BOOK ERROR FULL:", err);
      console.error("BOOK ERROR RESPONSE:", err.response);
      console.error("BOOK ERROR DATA:", err.response?.data);

      if (err.response?.status === 400) {
        const errorMsg =
          err.response?.data?.message || "You already have a pending request.";

        if (
          errorMsg.toLowerCase().includes("already") ||
          errorMsg.toLowerCase().includes("pending")
        ) {
          setBooking((prev) => ({ ...prev, [psychiatristId]: { status: "pending" } }));
        } else {
          deleteBookingState(psychiatristId);
        }

        showToast("error", "Request Failed", errorMsg);
        return;
      }

      setBooking((prev) => ({ ...prev, [psychiatristId]: { status: "error" } }));

      showToast(
        "error",
        "Booking Failed",
        "Failed to book appointment. Please try again."
      );

      setTimeout(() => {
        deleteBookingState(psychiatristId);
      }, 3000);
    }
  };

  const removePsychiatrist = async () => {
    if (!confirm) return;
    const { id, name } = confirm;
    setConfirm(null);

    try {
      await API.delete(`/my-psychiatrists/remove/${id}`);
      setList((prev) => prev.filter((p) => p._id !== id));

      showToast(
        "success",
        "Removed",
        `Dr. ${cleanName(name)} has been removed from your list.`
      );
    } catch (err) {
      console.error(err);
      showToast(
        "error",
        "Removal Failed",
        "Failed to remove psychiatrist. Please try again."
      );
    }
  };

  const openSession = (appointmentId, psychiatristName) => {
    setActiveSession({ appointmentId, psychiatristName });
  };

  const closeSession = () => {
    setActiveSession(null);
  };

  /* helpers */
  const cleanName = (name = "") => name.replace(/^Dr\.?\s*/i, "").trim();

  const palettes = [
    { bg: "#EEE8FF", color: "#7C5CBF" },
    { bg: "#FFE8EE", color: "#BF5C7C" },
    { bg: "#E8F4FF", color: "#5C8FBF" },
    { bg: "#E8FFF0", color: "#3D9E65" },
    { bg: "#FFF4E8", color: "#BF8C3D" },
    { bg: "#F0E8FF", color: "#9B5CBF" },
  ];

  const palette = (name = "") => {
    const code = name?.charCodeAt(0) || 0;
    return palettes[code % palettes.length];
  };

  const initials = (name = "") =>
    cleanName(name)
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const specColor = (spec = "") => {
    const s = spec.toLowerCase();
    if (s.includes("anxiety"))
      return { bg: "#EEF3FF", color: "#5B7FD4", border: "#D0DCFF" };
    if (s.includes("depress"))
      return { bg: "#F0EEFF", color: "#7C5CBF", border: "#D8D0FF" };
    if (s.includes("stress"))
      return { bg: "#FFF0EE", color: "#BF6A5C", border: "#FFD8D0" };
    if (s.includes("trauma"))
      return { bg: "#EEFAF4", color: "#3D9E72", border: "#C0EDD6" };
    return { bg: "#F5F3F0", color: "#9D8E82", border: "#E0D8D0" };
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:#ddd5c8; border-radius:10px; }

        .toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 10001;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }

        .toast-container > * {
          pointer-events: auto;
        }

        .toast {
          background: #fff;
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 320px;
          max-width: 400px;
          box-shadow: 0 12px 32px rgba(44, 35, 24, 0.15);
          animation: slideIn 0.3s ease forwards;
        }

        .toast-success { border-left: 4px solid #5A9E6A; }
        .toast-error { border-left: 4px solid #BF6050; }
        .toast-info { border-left: 4px solid #C8A87A; }

        .toast-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .toast-success .toast-icon { background: #EAF3EA; color: #2E7D32; }
        .toast-error .toast-icon { background: #FCEAEA; color: #B71C1C; }
        .toast-info .toast-icon { background: #FDF6EE; color: #A0856A; }

        .toast-content { flex: 1; }
        .toast-title { font-size: 14px; font-weight: 600; color: #2C2318; margin-bottom: 2px; }
        .toast-message { font-size: 13px; color: #9D8E82; }

        .toast-close {
          background: transparent;
          border: none;
          color: #C4B5A5;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .toast-close:hover { color: #2C2318; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .mp-page {
          min-height:100vh;
          background:#FAF7F3;
          font-family:'DM Sans',sans-serif;
          color:#2C2318;
          display:flex;
          flex-direction:column;
        }

        .mp-main { flex:1; padding:56px 24px 80px; }
        .mp-inner { max-width:780px; margin:0 auto; }

        .mp-heading { text-align:center; margin-bottom:10px; animation:fadeDown 0.55s ease both; }

        .mp-eyebrow {
          display:inline-flex;
          align-items:center;
          gap:8px;
          font-size:11px;
          font-weight:500;
          letter-spacing:0.2em;
          text-transform:uppercase;
          color:#A0856A;
          background:#FDF6EE;
          border:1px solid #E8D5BE;
          border-radius:30px;
          padding:5px 14px;
          margin-bottom:18px;
        }

        .mp-eyebrow-dot {
          width:6px;
          height:6px;
          border-radius:50%;
          background:#C8A87A;
          animation:pulse 2s ease-in-out infinite;
        }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .mp-title {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(36px,5.5vw,56px);
          font-weight:300;
          color:#2C2318;
          line-height:1.05;
          letter-spacing:-0.01em;
        }

        .mp-title em { font-style:italic; color:#A0856A; }

        .mp-subtitle {
          font-size:14px;
          color:#9D8E82;
          font-weight:300;
          margin-top:12px;
          line-height:1.6;
        }

        .mp-orn {
          display:flex;
          align-items:center;
          gap:14px;
          justify-content:center;
          margin:20px 0 36px;
          animation:fadeUp 0.6s 0.1s ease both;
        }

        .mp-orn-line { height:1px; width:64px; }
        .mp-orn-line.l { background:linear-gradient(90deg,transparent,#D4C5B0); }
        .mp-orn-line.r { background:linear-gradient(90deg,#D4C5B0,transparent); }
        .mp-orn-dot { width:5px; height:5px; border-radius:50%; background:#C8A87A; }

        .mp-strip {
          display:flex;
          align-items:center;
          justify-content:space-between;
          margin-bottom:22px;
          animation:fadeUp 0.5s 0.15s ease both;
        }

        .mp-strip-label { font-size:13px; color:#B8A898; font-weight:300; }
        .mp-strip-label strong { color:#A0856A; font-weight:600; }

        .mp-card {
          background:#fff;
          border:1px solid #EDE6DC;
          border-radius:22px;
          overflow:hidden;
          box-shadow:0 2px 18px rgba(160,133,106,0.07);
          margin-bottom:16px;
          display:flex;
          transition:transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          animation:fadeUp 0.5s ease both;
        }

        .mp-card:hover {
          transform:translateY(-3px);
          box-shadow:0 12px 32px rgba(160,133,106,0.13);
          border-color:#D4C5B0;
        }

        .mp-accent {
          width:5px;
          flex-shrink:0;
          border-radius:22px 0 0 22px;
          background:linear-gradient(180deg,#C8A87A,#A0856A);
        }

        .mp-card-body {
          flex:1;
          padding:20px 22px;
          display:flex;
          align-items:center;
          gap:16px;
          flex-wrap:wrap;
        }

        .mp-av {
          width:52px;
          height:52px;
          border-radius:50%;
          flex-shrink:0;
          display:flex;
          align-items:center;
          justify-content:center;
          font-family:'DM Sans',sans-serif;
          font-size:16px;
          font-weight:600;
          box-shadow:0 3px 12px rgba(0,0,0,0.08);
        }

        .mp-info { flex:1; min-width:150px; }

        .mp-doc-name {
          font-family:'Cormorant Garamond',serif;
          font-size:21px;
          font-weight:600;
          color:#2C2318;
          margin-bottom:7px;
          line-height:1.1;
        }

        .mp-fee {
          margin-top: 8px;
          font-size: 13px;
          color: #A0856A;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .mp-fee::before {
          content: '💰';
          font-size: 11px;
        }

        .mp-spec-tag {
          display:inline-flex;
          align-items:center;
          gap:7px;
          font-size:12px;
          font-weight:500;
          border-radius:30px;
          padding:4px 12px;
          border:1px solid;
          width:fit-content;
        }

        .mp-spec-dot {
          width:5px;
          height:5px;
          border-radius:50%;
          flex-shrink:0;
        }

        .mp-actions {
          display:flex;
          gap:10px;
          align-items:center;
          flex-shrink:0;
          flex-wrap:wrap;
        }

        .mp-book-btn {
          display:inline-flex;
          align-items:center;
          gap:7px;
          padding:10px 20px;
          border-radius:50px;
          border:none;
          font-family:'DM Sans',sans-serif;
          font-size:13px;
          font-weight:500;
          cursor:pointer;
          transition:all 0.22s ease;
          white-space:nowrap;
        }

        .mp-book-btn svg { width:13px; height:13px; }

        .mp-book-idle  {
          background:#2C2318;
          color:#fff;
          box-shadow:0 4px 14px rgba(44,35,24,0.18);
        }

        .mp-book-idle:hover {
          background:#1A1510;
          box-shadow:0 8px 22px rgba(44,35,24,0.26);
          transform:translateY(-1px);
        }

        .mp-book-pend  {
          background:#F5ECE0;
          color:#C8A87A;
          border:1px solid #E8D5BE;
          cursor:not-allowed;
        }

        .mp-book-done  {
          background:#EAF3EA;
          color:#5A9E6A;
          border:1px solid #BED8BE;
          cursor:default;
        }

        .mp-book-err   {
          background:#F5EAE8;
          color:#BF6050;
          border:1px solid #E8C0B8;
          cursor:pointer;
        }

        .mp-spin {
          width:13px;
          height:13px;
          border:2px solid rgba(200,168,122,0.3);
          border-top-color:#C8A87A;
          border-radius:50%;
          animation:spin .7s linear infinite;
        }

        @keyframes spin { to{transform:rotate(360deg)} }

        .mp-remove-btn {
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:10px 16px;
          border-radius:50px;
          border:1px solid #F0CECE;
          background:#fff;
          color:#B05A5A;
          font-family:'DM Sans',sans-serif;
          font-size:13px;
          font-weight:500;
          cursor:pointer;
          transition:all 0.22s ease;
          white-space:nowrap;
        }

        .mp-remove-btn svg { width:13px; height:13px; }

        .mp-remove-btn:hover {
          background:#B05A5A;
          color:#fff;
          border-color:#B05A5A;
          box-shadow:0 6px 18px rgba(176,90,90,0.18);
        }

        .mp-empty {
          text-align:center;
          padding:80px 24px;
          animation:fadeUp 0.5s 0.2s ease both;
        }

        .mp-empty-circle {
          width:80px;
          height:80px;
          border-radius:50%;
          background:#FDF6EE;
          border:1px solid #E8D5BE;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:34px;
          margin:0 auto 22px;
        }

        .mp-empty-title {
          font-family:'Cormorant Garamond',serif;
          font-size:26px;
          font-weight:400;
          color:#B8A898;
          margin-bottom:8px;
        }

        .mp-empty-sub {
          font-size:13px;
          color:#D4C5B0;
          font-weight:300;
        }

        .mp-loader {
          display:flex;
          flex-direction:column;
          align-items:center;
          padding:80px 0;
          gap:16px;
        }

        .mp-loader-spin {
          width:36px;
          height:36px;
          border:2.5px solid #EAE0D5;
          border-top-color:#A0856A;
          border-radius:50%;
          animation:spin .85s linear infinite;
        }

        .mp-loader-txt {
          font-size:14px;
          color:#C4B5A5;
          font-weight:300;
        }

        .mp-overlay {
          position:fixed;
          inset:0;
          z-index:1000;
          background:rgba(44,35,24,0.35);
          backdrop-filter:blur(6px);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:24px;
          animation:fadeIn 0.2s ease;
        }

        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        .mp-modal {
          background:#fff;
          border-radius:24px;
          border:1px solid #EDE6DC;
          box-shadow:0 24px 60px rgba(44,35,24,0.2);
          padding:36px 32px 28px;
          max-width:380px;
          width:100%;
          text-align:center;
          animation:slideUp 0.25s ease;
        }

        @keyframes slideUp {
          from{opacity:0;transform:translateY(20px)}
          to{opacity:1;transform:translateY(0)}
        }

        .mp-modal-icon {
          width:60px;
          height:60px;
          border-radius:50%;
          background:#FFF0EE;
          border:1px solid #F0CECE;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:26px;
          margin:0 auto 20px;
        }

        .mp-modal-title {
          font-family:'Cormorant Garamond',serif;
          font-size:24px;
          font-weight:600;
          color:#2C2318;
          margin-bottom:10px;
        }

        .mp-modal-desc {
          font-size:14px;
          color:#9D8E82;
          font-weight:300;
          line-height:1.6;
          margin-bottom:28px;
        }

        .mp-modal-name { font-weight:500; color:#2C2318; }

        .mp-modal-btns {
          display:flex;
          gap:12px;
          justify-content:center;
        }

        .mp-modal-cancel {
          flex:1;
          padding:12px;
          border:1px solid #E0D8D0;
          border-radius:50px;
          background:#fff;
          color:#9D8E82;
          font-family:'DM Sans',sans-serif;
          font-size:14px;
          font-weight:500;
          cursor:pointer;
          transition:all 0.2s;
        }

        .mp-modal-cancel:hover {
          border-color:#C0B4A4;
          color:#2C2318;
        }

        .mp-modal-confirm {
          flex:1;
          padding:12px;
          border:none;
          border-radius:50px;
          background:#B05A5A;
          color:#fff;
          font-family:'DM Sans',sans-serif;
          font-size:14px;
          font-weight:500;
          cursor:pointer;
          transition:all 0.2s;
          box-shadow:0 4px 14px rgba(176,90,90,0.22);
        }

        .mp-modal-confirm:hover {
          background:#934848;
          box-shadow:0 8px 22px rgba(176,90,90,0.3);
        }

        @keyframes fadeDown { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Toast */}
      <div className="toast-container">
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === "success" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {toast.type === "error" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button className="toast-close" onClick={() => setToast(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirm && (
        <div className="mp-overlay" onClick={() => setConfirm(null)}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-icon">🗑️</div>
            <div className="mp-modal-title">Remove Psychiatrist?</div>
            <div className="mp-modal-desc">
              Are you sure you want to remove{" "}
              <span className="mp-modal-name">Dr. {cleanName(confirm.name)}</span>{" "}
              from your saved list? You can always add them back later.
            </div>
            <div className="mp-modal-btns">
              <button className="mp-modal-cancel" onClick={() => setConfirm(null)}>Keep</button>
              <button className="mp-modal-confirm" onClick={removePsychiatrist}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Session Modal */}
      {activeSession && (
        <Modal onClose={closeSession} title={`Consultation with Dr. ${cleanName(activeSession.psychiatristName)}`}>
          <SessionChat appointmentId={activeSession.appointmentId} onClose={closeSession} />
        </Modal>
      )}

      <div className="mp-page">
        <Navbar />

        <main className="mp-main">
          <div className="mp-inner">

            <div className="mp-heading">
              <div>
                <div className="mp-eyebrow">
                  <span className="mp-eyebrow-dot" />
                  Your Saved Doctors
                </div>
              </div>
              <h1 className="mp-title">My <em>Psychiatrists</em></h1>
              <p className="mp-subtitle">
                Manage your saved mental health professionals and book sessions.
              </p>
            </div>

            <div className="mp-orn">
              <span className="mp-orn-line l" />
              <span className="mp-orn-dot" />
              <span className="mp-orn-line r" />
            </div>

            {loading ? (
              <div className="mp-loader">
                <div className="mp-loader-spin" />
                <span className="mp-loader-txt">Loading your list…</span>
              </div>
            ) : list.length === 0 ? (
              <div className="mp-empty">
                <div className="mp-empty-circle">🩺</div>
                <div className="mp-empty-title">No saved psychiatrists</div>
                <div className="mp-empty-sub">
                  Add some from the psychiatrists page to get started.
                </div>
              </div>
            ) : (
              <>
                <div className="mp-strip">
                  <div className="mp-strip-label">
                    <strong>{list.length}</strong> saved {list.length === 1 ? "doctor" : "doctors"}
                  </div>
                </div>

                {list.map((item) => {
                  const doc = item.psychiatristId || item.psychiatrist;
                  if (!doc) return null;

                  const state = booking[doc._id]?.status;
                  const appointmentId = booking[doc._id]?.appointmentId;
                  const pal = palette(doc.name || "");
                  const inits = initials(doc.name || "");
                  const sc = specColor(doc.specialization || "");

                  return (
                    <div className="mp-card" key={item._id}>
                      <div className="mp-accent" />
                      <div className="mp-card-body">

                        <div className="mp-av" style={{ background: pal.bg, color: pal.color }}>
                          {inits}
                        </div>

                        <div className="mp-info">
                          <div className="mp-doc-name">Dr. {cleanName(doc.name)}</div>
                          <div
                            className="mp-spec-tag"
                            style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}
                          >
                            <span className="mp-spec-dot" style={{ background: sc.color }} />
                            {doc.specialization || "General Psychiatry"}
                          </div>

                          <div className="mp-fee">
                            ₹{doc.consultationFee || "N/A"}
                          </div>
                        </div>

                        <div className="mp-actions">
                          <button
                            className={`mp-book-btn ${
                              state === "pending"  ? "mp-book-pend" :
                              state === "accepted" ? "mp-book-done" :
                              state === "rejected" ? "mp-book-err"  :
                              state === "error"    ? "mp-book-err"  :
                              "mp-book-idle"
                            }`}
                            onClick={() => {
                              if (!state || state === "error" || state === "rejected") {
                                bookAppointment(doc._id);
                              }
                            }}
                            disabled={state === "pending" || state === "accepted"}
                          >
                            {state === "pending" && <><div className="mp-spin" /> Request Pending</>}
                            {state === "accepted" && <>✓ Request Accepted</>}
                            {state === "rejected" && <>⚠ Book Again</>}
                            {state === "error" && <>⚠ Retry</>}
                            {!state && (
                              <>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                Book Appointment
                              </>
                            )}
                          </button>

                          {/* Session Button - Only show when appointment is accepted */}
                          {state === "accepted" && appointmentId && (
                            <button
                              className="session-btn"
                              onClick={() => openSession(appointmentId, doc.name)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                              Join Session
                            </button>
                          )}

                          <button
                            className="mp-remove-btn"
                            onClick={() => setConfirm({ id: item._id, name: doc.name })}
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Remove
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .session-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #5A9E6A;
          color: white;
          border: none;
          border-radius: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.22s ease;
          white-space: nowrap;
        }

        .session-btn:hover {
          background: #4A8E5A;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(90, 158, 106, 0.3);
        }

        .session-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </>
  );
};

export default MyPsychiatrists;