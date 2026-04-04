import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

// Toast Icons
const SuccessIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// Toast Component
const Toast = ({ type = "success", title, message, onClose }) => {
  const [exiting, setExiting] = useState(false);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const getStyles = () => {
    switch(type) {
      case "success":
        return {
          bg: "#EAF5EA",
          border: "#B8DDB8",
          color: "#2E7D32",
          icon: <SuccessIcon />
        };
      case "error":
        return {
          bg: "#FCEAEA",
          border: "#F0B8B8",
          color: "#B71C1C",
          icon: <ErrorIcon />
        };
      default:
        return {
          bg: "#FDF6EE",
          border: "#E8D5BE",
          color: "#A0856A",
          icon: <InfoIcon />
        };
    }
  };

  const styles = getStyles();

  return (
    <div style={{
      background: styles.bg,
      border: `1px solid ${styles.border}`,
      borderRadius: "16px",
      padding: "16px 20px",
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      minWidth: "320px",
      maxWidth: "400px",
      boxShadow: "0 12px 32px rgba(160, 133, 106, 0.15)",
      animation: exiting ? "slideOut 0.2s ease forwards" : "slideIn 0.3s ease",
      position: "relative"
    }}>
      <div style={{
        width: "36px",
        height: "36px",
        borderRadius: "12px",
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: styles.color,
        flexShrink: 0
      }}>
        {styles.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "14px", fontWeight: "600", color: "#2C2318", marginBottom: "4px" }}>
          {title}
        </div>
        <div style={{ fontSize: "13px", color: "#9D8E82" }}>
          {message}
        </div>
      </div>
      <button
        onClick={handleClose}
        style={{
          background: "transparent",
          border: "none",
          color: "#B8A898",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "#2C2318"}
        onMouseLeave={(e) => e.currentTarget.style.color = "#B8A898"}
      >
        <CloseIcon />
      </button>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(30px); }
        }
      `}</style>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, onConfirm, appointment }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(44, 35, 24, 0.5)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px",
      animation: "fadeIn 0.2s ease"
    }} onClick={onClose}>
      <div style={{
        background: "#fff",
        borderRadius: "24px",
        width: "400px",
        maxWidth: "90%",
        boxShadow: "0 24px 48px rgba(44, 35, 24, 0.2)",
        animation: "scaleIn 0.3s ease"
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: "24px",
          borderBottom: "1px solid #EDE6DC",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "#FCEAEA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#B71C1C"
          }}>
            <WarningIcon />
          </div>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "20px",
            fontWeight: 600,
            color: "#2C2318",
            margin: 0
          }}>
            Cancel Appointment
          </h3>
        </div>

        <div style={{ padding: "24px" }}>
          <p style={{
            fontSize: "15px",
            color: "#9D8E82",
            lineHeight: 1.6,
            marginBottom: "16px"
          }}>
            Are you sure you want to cancel your appointment with <strong style={{ color: "#2C2318" }}>Dr. {appointment?.psychiatristId?.name?.replace(/^Dr\.?\s*/i, "")}</strong>?
          </p>

          <div style={{
            background: "#FCEAEA",
            border: "1px solid #F0B8B8",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px"
          }}>
            <WarningIcon />
            <span style={{
              fontSize: "13px",
              color: "#B71C1C",
              lineHeight: 1.5
            }}>
              This action cannot be undone. The time slot will be released for other patients.
            </span>
          </div>

          <div style={{
            display: "flex",
            gap: "12px"
          }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "50px",
                border: "1px solid #EDE6DC",
                background: "#fff",
                color: "#9D8E82",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#FAF7F3";
                e.currentTarget.style.color = "#2C2318";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#9D8E82";
              }}
            >
              Keep Appointment
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "50px",
                border: "none",
                background: "#EF5350",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(239, 83, 80, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#D32F2F";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#EF5350";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Yes, Cancel
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

const UserAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, appointment: null });
  const navigate = useNavigate();

  // Get token from storage
 const getToken = () => {
  const directToken =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (directToken) return directToken;

  const localUserInfo = localStorage.getItem("userInfo");
  const sessionUserInfo = sessionStorage.getItem("userInfo");

  const userInfo = localUserInfo
    ? JSON.parse(localUserInfo)
    : sessionUserInfo
    ? JSON.parse(sessionUserInfo)
    : null;

  return userInfo?.token || null;
};

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const cancelAppointment = async (id) => {
    const token = getToken();
    if (!token) {
      showToast("error", "Session Expired", "Please login again");
      navigate("/login");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/appointments/cancel/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // remove appointment from UI
      setAppointments(prev => prev.filter(a => a._id !== id));
      showToast("success", "Appointment Cancelled", "Your appointment has been successfully cancelled.");
    } catch (error) {
      console.log(error.response?.data);
      console.error(error);
      showToast("error", "Cancellation Failed", error.response?.data?.message || "Failed to cancel appointment. Please try again.");
    }
  };

  const fetchAppointments = async () => {
  try {
    setLoading(true);
    setError(null);

    const token = getToken();

    console.log("Token being used:", token ? "Token exists" : "No token found");

    if (!token) {
      setError("Please login to view your appointments");
      setLoading(false);
      return;
    }

    const res = await axios.get("http://localhost:5000/api/appointments/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Appointments fetched:", res.data);
    setAppointments(Array.isArray(res.data) ? res.data : []);
  } catch (error) {
    console.log("Error response:", error.response?.data);
    console.error("FETCH APPOINTMENTS ERROR:", error);

    if (error.response?.status === 401) {
      setError("Your session has expired. Please login again.");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      sessionStorage.removeItem("userInfo");
    } else {
      setError(error.response?.data?.message || "Failed to load appointments");
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { 
    fetchAppointments(); 
  }, []);

  const cleanName = (name = "") => name.replace(/^Dr\.?\s*/i, "").trim();

  /* status config */
  const statusConfig = {
    Pending:  { bg:"#FFF8EC", color:"#B8860B", border:"#F0DCA0", dot:"#D4A820", label:"Pending Review" },
    Accepted: { bg:"#EAF5EA", color:"#2E7D32", border:"#B8DDB8", dot:"#4CAF50", label:"Confirmed"      },
    Rejected: { bg:"#FCEAEA", color:"#B71C1C", border:"#F0B8B8", dot:"#EF5350", label:"Declined"       },
    Completed:{ bg:"#EEF3FF", color:"#3949AB", border:"#C5CFFF", dot:"#5C6BC0", label:"Completed"      },
  };
  const getStatus = (s="") => statusConfig[s] || statusConfig["Pending"];

  /* avatar palette */
  const palettes = [
    { bg:"#EEE8FF", color:"#7C5CBF" }, { bg:"#FFE8EE", color:"#BF5C7C" },
    { bg:"#E8F4FF", color:"#5C8FBF" }, { bg:"#E8FFF0", color:"#3D9E65" },
    { bg:"#FFF4E8", color:"#BF8C3D" }, { bg:"#F0E8FF", color:"#9B5CBF" },
  ];
  const palette = (name="") => palettes[name?.charCodeAt(0) % palettes.length || 0];
  const initials = (name="") => cleanName(name).split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) || "?";

  // Retry button component
  const RetryButton = () => (
    <button
      onClick={fetchAppointments}
      style={{
        marginTop: "16px",
        padding: "10px 24px",
        background: "#2C2318",
        color: "white",
        border: "none",
        borderRadius: "30px",
        cursor: "pointer",
        fontSize: "14px"
      }}
    >
      Try Again
    </button>
  );

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
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }

        .toast-container > * {
          pointer-events: auto;
        }

        .ua-page {
          min-height: 100vh;
          background: #FAF7F3;
          font-family: 'DM Sans', sans-serif;
          color: #2C2318;
          display: flex; flex-direction: column;
        }
        .ua-main { flex:1; padding:56px 24px 80px; }
        .ua-inner { max-width: 780px; margin: 0 auto; }

        /* ─── Heading ─── */
        .ua-heading { text-align:center; margin-bottom:10px; animation:fadeDown 0.55s ease both; }
        .ua-eyebrow {
          display:inline-flex; align-items:center; gap:8px;
          font-size:11px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase;
          color:#A0856A; background:#FDF6EE; border:1px solid #E8D5BE;
          border-radius:30px; padding:5px 14px; margin-bottom:18px;
        }
        .ua-eyebrow-dot {
          width:6px; height:6px; border-radius:50%; background:#C8A87A;
          animation:pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .ua-title {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(36px,5.5vw,56px); font-weight:300;
          color:#2C2318; line-height:1.05; letter-spacing:-0.01em;
        }
        .ua-title em { font-style:italic; color:#A0856A; }
        .ua-subtitle { font-size:14px; color:#9D8E82; font-weight:300; margin-top:12px; line-height:1.6; }

        /* ornament */
        .ua-orn { display:flex; align-items:center; gap:14px; justify-content:center; margin:20px 0 36px; animation:fadeUp 0.6s 0.1s ease both; }
        .ua-orn-line { height:1px; width:64px; }
        .ua-orn-line.l { background:linear-gradient(90deg,transparent,#D4C5B0); }
        .ua-orn-line.r { background:linear-gradient(90deg,#D4C5B0,transparent); }
        .ua-orn-dot { width:5px; height:5px; border-radius:50%; background:#C8A87A; }

        /* ─── Count strip ─── */
        .ua-strip {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:24px; animation:fadeUp 0.5s 0.15s ease both;
        }
        .ua-strip-label { font-size:13px; color:#B8A898; font-weight:300; }
        .ua-strip-label strong { color:#A0856A; font-weight:600; }
        .ua-strip-legend { display:flex; align-items:center; gap:16px; }
        .ua-legend-item { display:flex; align-items:center; gap:6px; font-size:12px; color:#B8A898; }
        .ua-legend-dot  { width:7px; height:7px; border-radius:50%; }

        /* ─── Card ─── */
        .ua-card {
          background: #fff;
          border: 1px solid #EDE6DC;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 2px 18px rgba(160,133,106,0.07);
          margin-bottom: 16px;
          display: flex;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          animation: fadeUp 0.5s ease both;
        }
        .ua-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 32px rgba(160,133,106,0.13);
          border-color: #D4C5B0;
        }
        .ua-card:nth-child(1){animation-delay:0.05s}
        .ua-card:nth-child(2){animation-delay:0.10s}
        .ua-card:nth-child(3){animation-delay:0.15s}
        .ua-card:nth-child(n+4){animation-delay:0.20s}

        /* left accent bar */
        .ua-card-accent {
          width: 5px; flex-shrink:0; border-radius:22px 0 0 22px;
        }

        /* card body */
        .ua-card-body {
          flex: 1; padding: 22px 24px;
          display: flex; align-items: center; gap: 18px;
          flex-wrap: wrap;
        }

        /* avatar */
        .ua-av {
          width: 52px; height: 52px; border-radius: 50%; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          font-family:'DM Sans',sans-serif; font-size:16px; font-weight:600;
          box-shadow: 0 3px 12px rgba(0,0,0,0.08);
        }

        /* info */
        .ua-info { flex:1; min-width: 160px; }
        .ua-doc-name {
          font-family:'Cormorant Garamond',serif;
          font-size:20px; font-weight:600; color:#2C2318; margin-bottom:5px; line-height:1.1;
        }
        .ua-meta { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .ua-meta-item {
          display:flex; align-items:center; gap:6px;
          font-size:13px; color:#9D8E82; font-weight:300;
        }
        .ua-meta-item svg { width:13px; height:13px; color:#C4B5A5; flex-shrink:0; }

        /* status badge */
        .ua-status {
          display:inline-flex; align-items:center; gap:6px;
          font-size:12px; font-weight:500; border-radius:30px;
          padding:5px 13px; border:1px solid; white-space:nowrap; flex-shrink:0;
        }
        .ua-status-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

        /* join button */
        .ua-join-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:11px 22px; border-radius:50px; border:none;
          background:#2C2318; color:#fff;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
          cursor:pointer; transition:all 0.22s ease; white-space:nowrap; flex-shrink:0;
          box-shadow: 0 4px 16px rgba(44,35,24,0.18);
        }
        .ua-join-btn:hover {
          background:#1A1510;
          box-shadow: 0 8px 24px rgba(44,35,24,0.26);
          transform:translateY(-1px);
        }
        .ua-join-btn svg { width:14px; height:14px; }

        /* cancel button */
        .ua-cancel-btn {
          background: #EF5350;
          color: white;
          border: none;
          padding: 11px 22px;
          border-radius: 50px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.22s ease;
        }
        .ua-cancel-btn:hover {
          background: #D32F2F;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239,83,80,0.3);
        }

        /* pending status text */
        .ua-pending-text {
          color: #B8A898;
          font-size: 13px;
          padding: 11px 0;
          font-style: italic;
        }

        /* ─── Empty ─── */
        .ua-empty {
          text-align:center; padding:80px 24px;
          animation: fadeUp 0.5s 0.2s ease both;
        }
        .ua-empty-circle {
          width:80px; height:80px; border-radius:50%;
          background:#FDF6EE; border:1px solid #E8D5BE;
          display:flex; align-items:center; justify-content:center;
          font-size:34px; margin:0 auto 22px;
        }
        .ua-empty-title {
          font-family:'Cormorant Garamond',serif;
          font-size:26px; font-weight:400; color:#B8A898; margin-bottom:8px;
        }
        .ua-empty-sub { font-size:13px; color:#D4C5B0; font-weight:300; margin-bottom:24px; }
        .ua-empty-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:12px 26px; border-radius:50px; border:none;
          background:#2C2318; color:#fff;
          font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500;
          cursor:pointer; transition:all 0.22s ease;
          box-shadow: 0 4px 16px rgba(44,35,24,0.18);
        }
        .ua-empty-btn:hover { background:#1A1510; box-shadow:0 8px 24px rgba(44,35,24,0.26); transform:translateY(-1px); }

        /* ─── Loader ─── */
        .ua-loader { display:flex; flex-direction:column; align-items:center; padding:80px 0; gap:16px; }
        .ua-loader-spin { width:36px; height:36px; border:2.5px solid #EAE0D5; border-top-color:#A0856A; border-radius:50%; animation:spin .85s linear infinite; }
        .ua-loader-txt { font-size:14px; color:#C4B5A5; font-weight:300; }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* ─── Error ─── */
        .ua-error {
          text-align: center;
          padding: 60px 24px;
        }
        .ua-error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .ua-error-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          color: #B71C1C;
          margin-bottom: 8px;
        }
        .ua-error-sub {
          font-size: 14px;
          color: #B8A898;
          margin-bottom: 24px;
        }

        @keyframes fadeDown { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="ua-page">
        <Navbar />

        {/* Toast Container */}
        <div className="toast-container">
          {toast && (
            <Toast
              type={toast.type}
              title={toast.title}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          )}
        </div>

        {/* Delete Modal */}
        <DeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, appointment: null })}
          onConfirm={() => {
            if (deleteModal.appointment) {
              cancelAppointment(deleteModal.appointment._id);
            }
          }}
          appointment={deleteModal.appointment}
        />

        <main className="ua-main">
          <div className="ua-inner">

            {/* ─── Heading ─── */}
            <div className="ua-heading">
              <div><div className="ua-eyebrow"><span className="ua-eyebrow-dot"/>Your Sessions</div></div>
              <h1 className="ua-title">My <em>Appointments</em></h1>
              <p className="ua-subtitle">Track your upcoming and past sessions with mental health professionals.</p>
            </div>

            <div className="ua-orn">
              <span className="ua-orn-line l"/>
              <span className="ua-orn-dot"/>
              <span className="ua-orn-line r"/>
            </div>

            {/* ─── Content ─── */}
            {loading ? (
              <div className="ua-loader">
                <div className="ua-loader-spin"/>
                <span className="ua-loader-txt">Loading your appointments…</span>
              </div>

            ) : error ? (
              <div className="ua-error">
                <div className="ua-error-icon">🔒</div>
                <div className="ua-error-title">
                  {error.toLowerCase().includes("login") || error.toLowerCase().includes("session")
                    ? "Authentication Error"
                    : "Something Went Wrong"}
                </div>
                <div className="ua-error-sub">{error}</div>
                <button 
                  className="ua-empty-btn"
                  onClick={() => {
                    if (error.includes("login")) {
                      navigate("/login");
                    } else {
                      fetchAppointments();
                    }
                  }}
                >
                  {error.includes("login") ? "Go to Login" : "Try Again"}
                </button>
              </div>

            ) : appointments.length === 0 ? (
              <div className="ua-empty">
                <div className="ua-empty-circle">📅</div>
                <div className="ua-empty-title">No appointments yet</div>
                <div className="ua-empty-sub">Book a session with a psychiatrist to get started.</div>
                <button className="ua-empty-btn" onClick={() => navigate("/psychiatrists")}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Find a Psychiatrist
                </button>
              </div>

            ) : (
              <>
                {/* count strip */}
                <div className="ua-strip">
                  <div className="ua-strip-label">
                    <strong>{appointments.length}</strong> {appointments.length === 1 ? "appointment" : "appointments"}
                  </div>
                  <div className="ua-strip-legend">
                    {[
                      { label:"Confirmed", color:"#4CAF50" },
                      { label:"Pending",   color:"#D4A820" },
                      { label:"Declined",  color:"#EF5350" },
                    ].map(l => (
                      <div className="ua-legend-item" key={l.label}>
                        <span className="ua-legend-dot" style={{ background:l.color }}/>
                        {l.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* appointment cards */}
                {appointments.map(a => {
                  const sc    = getStatus(a.status);
                  const name  = a.psychiatristId?.name || "Unknown";
                  const pal   = palette(name);
                  const inits = initials(name);

                  return (
                    <div className="ua-card" key={a._id}>
                      {/* left accent bar */}
                      <div className="ua-card-accent" style={{ background: sc.dot }}/>

                      <div className="ua-card-body">
                        {/* avatar */}
                        <div className="ua-av" style={{ background:pal.bg, color:pal.color }}>
                          {inits}
                        </div>

                        {/* info */}
                        <div className="ua-info">
                          <div className="ua-doc-name">Dr. {cleanName(name)}</div>
                          <div className="ua-meta">
                            {a.date && (
                              <span className="ua-meta-item">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                {a.date}
                              </span>
                            )}
                            {a.time && (
                              <span className="ua-meta-item">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                {a.time}
                              </span>
                            )}
                            {!a.date && a.status === "Pending" && (
                              <span className="ua-meta-item">Awaiting confirmation</span>
                            )}
                          </div>
                        </div>

                        {/* status badge */}
                        <div
                          className="ua-status"
                          style={{ background:sc.bg, color:sc.color, borderColor:sc.border }}
                        >
                          <span className="ua-status-dot" style={{ background:sc.dot }}/>
                          {sc.label}
                        </div>

                        {/* Action buttons based on status */}
                        {a.status === "Accepted" && (
                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <button 
                              className="ua-join-btn"
                              onClick={() => navigate(`/session/${a._id}`)}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Join Session
                            </button>

                            <button
                              className="ua-cancel-btn"
                              onClick={() => setDeleteModal({ isOpen: true, appointment: a })}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Cancel
                            </button>
                          </div>
                        )}

                        {a.status === "Pending" && (
                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <span className="ua-pending-text">
                              Awaiting psychiatrist confirmation
                            </span>
                            
                            <button
                              className="ua-cancel-btn"
                              onClick={() => setDeleteModal({ isOpen: true, appointment: a })}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel Request
                            </button>
                          </div>
                        )}

                        {a.status === "Rejected" && (
                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <span style={{ color: "#B8A898", fontSize: "13px" }}>
                              This request was declined
                            </span>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, appointment: a })}
                              style={{
                                background: "transparent",
                                color: "#9D8E82",
                                border: "1px solid #E8D5BE",
                                padding: "11px 22px",
                                borderRadius: "50px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "500",
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        )}

                        {a.status === "Completed" && (
                          <span style={{ color: "#B8A898", fontSize: "13px" }}>
                            Session completed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

          </div>
        </main>
      </div>
    </>
  );
};

export default UserAppointments;