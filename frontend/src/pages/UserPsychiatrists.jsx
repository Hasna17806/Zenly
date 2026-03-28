import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const UserPsychiatrists = () => {
  const [psychiatrists, setPsychiatrists] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [added, setAdded]                 = useState({});
  const [search, setSearch]               = useState("");
  const [toast, setToast]                 = useState(null);
  const [modal, setModal]                 = useState({ isOpen: false, psychiatristId: null, psychiatristName: "" });
  const navigate = useNavigate();

  const fetchPsychiatrists = async () => {
    try {
      const res = await API.get("/psychiatrist/all");
      setPsychiatrists(res.data);
      fetchAddedPsychiatrists();
    } catch (error) {
      console.log(error.response?.data);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddedPsychiatrists = async () => {
    try {
      const res = await API.get("/my-psychiatrists");
      const addedIds = {};
      res.data.forEach(p => {
        addedIds[p._id] = true;
      });
      setAdded(addedIds);
    } catch (error) {
      console.error("Error fetching added psychiatrists:", error);
    }
  };

  useEffect(() => { fetchPsychiatrists(); }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const openAddModal = (id, name) => {
    setModal({ isOpen: true, psychiatristId: id, psychiatristName: name });
  };

  const closeModal = () => {
    setModal({ isOpen: false, psychiatristId: null, psychiatristName: "" });
  };

  const confirmAddPsychiatrist = async () => {
    try {
      await API.post("/my-psychiatrists/add", {
        psychiatristId: modal.psychiatristId
      });

      setAdded(prev => ({ ...prev, [modal.psychiatristId]: true }));
      showToast("success", "Added Successfully", `Dr. ${cleanName(modal.psychiatristName)} has been added to your list.`);
      closeModal();

    } catch (error) {
      console.error("Error adding psychiatrist:", error);
      
      if (error.response?.status === 400 && error.response?.data?.message?.includes("already")) {
        showToast("error", "Already Added", "This psychiatrist is already in your list.");
      } else {
        showToast("error", "Addition Failed", "Failed to add psychiatrist. Please try again.");
      }
      closeModal();
    }
  };

  const cleanName = (name = "") => name.replace(/^Dr\.?\s*/i, "").trim();

  const filtered = psychiatrists.filter(d =>
    cleanName(d.name).toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const palettes = [
    { bg:"#EEE8FF", color:"#7C5CBF" },
    { bg:"#FFE8EE", color:"#BF5C7C" },
    { bg:"#E8F4FF", color:"#5C8FBF" },
    { bg:"#E8FFF0", color:"#3D9E65" },
    { bg:"#FFF4E8", color:"#BF8C3D" },
    { bg:"#F0E8FF", color:"#9B5CBF" },
  ];
  const palette = (name="") => palettes[name.charCodeAt(0) % palettes.length];

  const initials = (name="") => cleanName(name).split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) || "?";

  const specColor = (spec="") => {
    const s = spec.toLowerCase();
    if (s.includes("anxiety"))    return { bg:"#EEF3FF", color:"#5B7FD4", border:"#D0DCFF" };
    if (s.includes("depress"))    return { bg:"#F0EEFF", color:"#7C5CBF", border:"#D8D0FF" };
    if (s.includes("stress"))     return { bg:"#FFF0EE", color:"#BF6A5C", border:"#FFD8D0" };
    if (s.includes("trauma"))     return { bg:"#EEFAF4", color:"#3D9E72", border:"#C0EDD6" };
    return                               { bg:"#F5F3F0", color:"#9D8E82", border:"#E0D8D0" };
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:#ddd5c8; border-radius:10px; }

        /* Toast Container */
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

        /* Toast Notification */
        .toast {
          background: #fff;
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 320px;
          max-width: 400px;
          box-shadow: 0 12px 32px rgba(44, 35, 24, 0.15);
          animation: slideIn 0.3s ease forwards;
          position: relative;
        }
        .toast-success { border-left: 4px solid #5A9E6A; }
        .toast-error { border-left: 4px solid #BF6050; }
        .toast-info { border-left: 4px solid #C8A87A; }
        .toast-icon { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .toast-success .toast-icon { background: #EAF3EA; color: #2E7D32; }
        .toast-error .toast-icon { background: #FCEAEA; color: #B71C1C; }
        .toast-info .toast-icon { background: #FDF6EE; color: #A0856A; }
        .toast-content { flex: 1; }
        .toast-title { font-size: 14px; font-weight: 600; color: #2C2318; margin-bottom: 2px; }
        .toast-message { font-size: 13px; color: #9D8E82; }
        .toast-close { background: transparent; border: none; color: #C4B5A5; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
        .toast-close:hover { color: #2C2318; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(30px); }
        }
        .toast-exit { animation: slideOut 0.2s ease forwards; }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(44, 35, 24, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        /* Modal */
        .modal {
          background: #fff;
          border-radius: 24px;
          width: 400px;
          max-width: 90%;
          box-shadow: 0 24px 48px rgba(44, 35, 24, 0.2);
          animation: scaleIn 0.3s ease;
        }
        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #EDE6DC;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .modal-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #EAF3EA;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2E7D32;
        }
        .modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 600;
          color: #2C2318;
          margin: 0;
        }
        .modal-body {
          padding: 24px;
        }
        .modal-message {
          font-size: 15px;
          color: #9D8E82;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .modal-message strong {
          color: #2C2318;
        }
        .modal-actions {
          display: flex;
          gap: 12px;
        }
        .modal-btn {
          flex: 1;
          padding: 12px;
          border-radius: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .modal-btn-cancel {
          background: transparent;
          border: 1px solid #EDE6DC;
          color: #9D8E82;
        }
        .modal-btn-cancel:hover {
          background: #FAF7F3;
          color: #2C2318;
        }
        .modal-btn-confirm {
          background: #2C2318;
          color: white;
          box-shadow: 0 4px 12px rgba(44, 35, 24, 0.15);
        }
        .modal-btn-confirm:hover {
          background: #1A1510;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(44, 35, 24, 0.2);
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        .up-page {
          min-height: 100vh;
          background: #FAF7F3;
          font-family: 'DM Sans', sans-serif;
          color: #2C2318;
          display: flex;
          flex-direction: column;
        }

        .up-main {
          flex: 1;
          padding: 56px 24px 80px;
        }

        .up-inner { max-width: 1040px; margin: 0 auto; }

        /* ─── Hero heading ─── */
        .up-hero {
          text-align: center;
          margin-bottom: 40px;
          animation: fadeDown 0.55s ease both;
        }
        .up-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 500; letter-spacing: 0.2em;
          text-transform: uppercase; color: #A0856A;
          background: #FDF6EE; border: 1px solid #E8D5BE;
          border-radius: 30px; padding: 5px 14px;
          margin-bottom: 18px;
        }
        .up-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #C8A87A;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .up-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px, 5.5vw, 60px);
          font-weight: 300; color: #2C2318; line-height: 1.05;
          letter-spacing: -0.01em;
        }
        .up-title em { font-style: italic; color: #A0856A; }
        .up-subtitle {
          font-size: 15px; color: #9D8E82; font-weight: 300;
          margin-top: 12px; max-width: 480px; margin-left: auto; margin-right: auto;
          line-height: 1.6;
        }

        /* ornament */
        .up-orn {
          display: flex; align-items: center; gap: 14px;
          justify-content: center; margin: 20px 0 36px;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .up-orn-line { height:1px; width:64px; }
        .up-orn-line.l { background: linear-gradient(90deg,transparent,#D4C5B0); }
        .up-orn-line.r { background: linear-gradient(90deg,#D4C5B0,transparent); }
        .up-orn-dot { width:5px; height:5px; border-radius:50%; background:#C8A87A; }

        /* ─── Toolbar ─── */
        .up-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 32px;
          animation: fadeUp 0.5s 0.15s ease both;
        }
        
        .up-toolbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .up-my-psychiatrists-btn {
          padding: 10px 18px;
          background: #2C2318;
          color: white;
          border: none;
          border-radius: 30px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(44,35,24,0.15);
        }
        
        .up-my-psychiatrists-btn:hover {
          background: #1A1510;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(44,35,24,0.2);
        }
        
        .up-my-psychiatrists-btn svg {
          width: 14px;
          height: 14px;
        }

        .up-search-wrap { 
          position: relative; 
          flex: 1; 
          min-width: 260px;
        }
        
        .up-search-icon {
          position:absolute; left:16px; top:50%; transform:translateY(-50%);
          width:15px; height:15px; color:#C4B5A5; pointer-events:none;
        }
        .up-search {
          width:100%; padding:12px 18px 12px 46px;
          background:#fff; border:1px solid #EAE0D5;
          border-radius:50px;
          font-family:'DM Sans',sans-serif; font-size:14px; color:#2C2318;
          outline:none; transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 10px rgba(160,133,106,0.06);
        }
        .up-search::placeholder { color:#C4B5A5; }
        .up-search:focus {
          border-color:#C8A87A;
          box-shadow: 0 0 0 3px rgba(200,168,122,0.14), 0 2px 10px rgba(160,133,106,0.06);
        }
        .up-count {
          font-size: 13px; color: #B8A898; font-weight: 300; white-space: nowrap;
        }
        .up-count strong { color: #A0856A; font-weight: 600; }

        /* ─── Grid ─── */
        .up-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 22px;
        }

        /* ─── Card ─── */
        .up-card {
          background: #fff;
          border: 1px solid #EDE6DC;
          border-radius: 26px;
          overflow: visible;
          box-shadow: 0 2px 18px rgba(160,133,106,0.07);
          display: flex; flex-direction: column;
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
          animation: fadeUp 0.5s ease both;
          position: relative;
          margin-top: 30px;
        }
        .up-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(160,133,106,0.16);
          border-color: #D4C5B0;
        }

        .up-band {
          height: 100px;
          background: linear-gradient(135deg, #F8F0E6 0%, #F2E8DA 100%);
          position: relative;
          overflow: visible;
          flex-shrink: 0;
          border-top-left-radius: 26px;
          border-top-right-radius: 26px;
        }
        .up-band::before {
          content:''; position:absolute; inset:0;
          background-image: radial-gradient(circle 80px at 90% 100%, rgba(200,168,122,0.15) 0%, transparent 70%);
          border-top-left-radius: 26px;
          border-top-right-radius: 26px;
        }
        .up-band::after {
          content:''; position:absolute; inset:0;
          background-image: repeating-linear-gradient(
            112deg,
            transparent 0px, transparent 30px,
            rgba(160,133,106,0.06) 30px, rgba(160,133,106,0.06) 31px
          );
          border-top-left-radius: 26px;
          border-top-right-radius: 26px;
        }

        .up-av {
          position: absolute;
          bottom: -30px; left: 22px;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 4px solid #fff;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 22px; font-weight: 600;
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
          z-index: 10;
          letter-spacing: 0.02em;
        }

        .up-body {
          padding: 50px 22px 24px;
          display: flex; flex-direction: column; gap: 14px; flex:1;
        }

        .up-doc-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 23px; font-weight: 600; color: #2C2318; line-height: 1.1;
        }

        .up-spec-tag {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 12px; font-weight: 500;
          border-radius: 30px; padding: 5px 12px;
          width: fit-content; border: 1px solid;
          letter-spacing: 0.02em;
        }
        .up-spec-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }

        .up-fee-box {
          display: flex; align-items: center; justify-content: space-between;
          background: #FDFAF7; border: 1px solid #F0E9DF;
          border-radius: 14px; padding: 13px 16px;
        }
        .up-fee-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: #C4B5A5;
        }
        .up-fee-amount {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 600; color: #A0856A; line-height: 1;
        }
        .up-fee-amount span { font-size:15px; font-weight:400; margin-right:1px; }

        .up-button-row {
          display: flex;
          gap: 8px;
          margin-top: auto;
        }

        .up-add-btn {
          width: 100%;
          padding: 14px;
          border-radius: 50px;
          border: 1px solid #C4B5A5;
          background: transparent;
          color: #2C2318;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.22s ease;
        }
        .up-add-btn:hover:not(:disabled) {
          background: #F5F0EA;
          border-color: #A0856A;
          transform: translateY(-1px);
        }
        .up-add-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }
        .up-add-btn.added {
          background: #EAF3EA;
          border-color: #5A9E6A;
          color: #2E7D32;
        }

        .up-loader {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 0; gap: 16px;
        }
        .up-loader-spin {
          width: 38px; height: 38px;
          border: 2.5px solid #EAE0D5;
          border-top-color: #A0856A;
          border-radius: 50%;
          animation: spin .85s linear infinite;
        }
        .up-loader-txt { font-size:14px; color:#C4B5A5; font-weight:300; }

        .up-empty {
          grid-column: 1/-1;
          text-align: center; padding: 72px 24px;
        }
        .up-empty-icon { font-size:48px; margin-bottom:16px; }
        .up-empty-title {
          font-family:'Cormorant Garamond',serif;
          font-size:26px; font-weight:400; color:#C4B5A5; margin-bottom:6px;
        }
        .up-empty-sub { font-size:13px; color:#D4C5B0; font-weight:300; }

        @keyframes fadeDown { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }

        .up-grid .up-card:nth-child(1) { animation-delay:0.05s }
        .up-grid .up-card:nth-child(2) { animation-delay:0.10s }
        .up-grid .up-card:nth-child(3) { animation-delay:0.15s }
        .up-grid .up-card:nth-child(4) { animation-delay:0.20s }
        .up-grid .up-card:nth-child(5) { animation-delay:0.25s }
        .up-grid .up-card:nth-child(n+6){ animation-delay:0.30s }
      `}</style>

      <div className="up-page">
        <Navbar />

        {/* Toast Container */}
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
                {toast.type === "info" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

        {/* Confirmation Modal */}
        {modal.isOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="modal-title">Add Psychiatrist</h3>
              </div>
              <div className="modal-body">
                <p className="modal-message">
                  Are you sure you want to add <strong>Dr. {cleanName(modal.psychiatristName)}</strong> to your list?
                </p>
                <div className="modal-actions">
                  <button className="modal-btn modal-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="modal-btn modal-btn-confirm" onClick={confirmAddPsychiatrist}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="up-main">
          <div className="up-inner">
            <div className="up-hero">
              <div><div className="up-eyebrow"><span className="up-eyebrow-dot"/>Professional Support</div></div>
              <h1 className="up-title">Find a <em>Psychiatrist</em></h1>
              <p className="up-subtitle">Browse and save mental health professionals to your list.</p>
            </div>

            <div className="up-orn">
              <span className="up-orn-line l"/>
              <span className="up-orn-dot"/>
              <span className="up-orn-line r"/>
            </div>

            {!loading && (
              <div className="up-toolbar">
                <div className="up-toolbar-left">
                  <button
                    onClick={() => navigate("/my-psychiatrists")}
                    className="up-my-psychiatrists-btn"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Psychiatrists
                  </button>
                </div>

                <div className="up-search-wrap">
                  <svg className="up-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
                  </svg>
                  <input
                    className="up-search"
                    placeholder="Search by name or specialization…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <div className="up-count">
                  <strong>{filtered.length}</strong> {filtered.length === 1 ? "doctor" : "doctors"} available
                </div>
              </div>
            )}

            {loading ? (
              <div className="up-loader">
                <div className="up-loader-spin"/>
                <span className="up-loader-txt">Finding professionals…</span>
              </div>
            ) : (
              <div className="up-grid">
                {filtered.length > 0 ? filtered.map(doc => {
                  const name   = cleanName(doc.name);
                  const pal    = palette(doc.name);
                  const inits  = initials(doc.name);
                  const sc     = specColor(doc.specialization || "");
                  const isAdded = added[doc._id];

                  return (
                    <div className="up-card" key={doc._id}>
                      <div className="up-band">
                        <div className="up-av" style={{ background: pal.bg, color: pal.color }}>
                          {inits}
                        </div>
                      </div>

                      <div className="up-body">
                        <div className="up-doc-name">Dr. {name}</div>

                        <div
                          className="up-spec-tag"
                          style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}
                        >
                          <span className="up-spec-dot" style={{ background: sc.color }}/>
                          {doc.specialization || "General Psychiatry"}
                        </div>

                        <div className="up-fee-box">
                          <span className="up-fee-label">Consultation Fee</span>
                          <span className="up-fee-amount"><span>₹</span>{doc.consultationFee}</span>
                        </div>

                        <div className="up-button-row">
                          <button
                            className={`up-add-btn ${isAdded ? "added" : ""}`}
                            onClick={() => !isAdded && openAddModal(doc._id, doc.name)}
                            disabled={isAdded}
                          >
                            {isAdded ? (
                              <>
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                                Added to My List
                              </>
                            ) : (
                              <>
                                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add to My Psychiatrists
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="up-empty">
                    <div className="up-empty-icon">🔍</div>
                    <div className="up-empty-title">No results for "{search}"</div>
                    <div className="up-empty-sub">Try a different name or specialization.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default UserPsychiatrists;