import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ReviewModal from "../components/ReviewModal";
import Footer from "../components/Footer";

const UserPsychiatrists = () => {
  const [psychiatrists, setPsychiatrists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState({});
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    psychiatristId: null,
    psychiatristName: "",
  });
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    psychiatristId: null,
    psychiatristName: "",
  });
  const [reviews, setReviews] = useState({});
  const [ratings, setRatings] = useState({});

  const navigate = useNavigate();

  const cleanName = (name = "") => name.replace(/^Dr\.?\s*/i, "").trim();

  const fetchPsychiatrists = async () => {
    try {
      const [psyRes, myRes] = await Promise.all([
        API.get("/psychiatrist/all"),
        API.get("/my-psychiatrists/my"),
      ]);

      setPsychiatrists(psyRes.data);

      const addedMap = {};
      myRes.data.forEach((item) => {
        const psychId = item.psychiatristId?._id || item.psychiatristId;
        if (psychId) addedMap[psychId] = true;
      });

      setAdded(addedMap);
      
      await fetchAllReviews(psyRes.data);
    } catch (error) {
      console.error("Error fetching psychiatrists:", error);
      showToast("error", "Load Failed", "Failed to load psychiatrists.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReviews = async (psychiatristsList) => {
    const ratingsData = {};
    
    for (const doc of psychiatristsList) {
      try {
        const res = await API.get(`/reviews/psychiatrist/${doc._id}`);
        ratingsData[doc._id] = {
          average: res.data.averageRating || 0,
          total: res.data.totalReviews || 0
        };
      } catch (error) {
        console.error(`Error fetching reviews for ${doc._id}:`, error);
        ratingsData[doc._id] = { average: 0, total: 0 };
      }
    }
    
    setRatings(ratingsData);
  };

  useEffect(() => { fetchPsychiatrists(); }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3000);
  };

  const openAddModal = (id, name) =>
    setModal({ isOpen: true, psychiatristId: id, psychiatristName: name });

  const closeModal = () =>
    setModal({ isOpen: false, psychiatristId: null, psychiatristName: "" });

  const openReviewModal = (id, name) =>
    setReviewModal({ isOpen: true, psychiatristId: id, psychiatristName: name });

  const closeReviewModal = () =>
    setReviewModal({ isOpen: false, psychiatristId: null, psychiatristName: "" });

  const confirmAddPsychiatrist = async () => {
    try {
      await API.post("/my-psychiatrists/add", { psychiatristId: modal.psychiatristId });
      setAdded((prev) => ({ ...prev, [modal.psychiatristId]: true }));
      showToast("success", "Added successfully", `Dr. ${cleanName(modal.psychiatristName)} has been added to your list.`);
      closeModal();
    } catch (error) {
      console.error("Error adding psychiatrist:", error);
      if (error.response?.status === 400 && error.response?.data?.message?.toLowerCase().includes("already")) {
        showToast("error", "Already added", "This psychiatrist is already in your list.");
      } else {
        showToast("error", "Addition failed", "Failed to add psychiatrist. Please try again.");
      }
      closeModal();
    }
  };

  const handleReviewSuccess = async () => {
    showToast("success", "Review Submitted", "Thank you for your feedback!");
    await fetchAllReviews(psychiatrists);
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`star ${Math.round(rating) >= star ? "filled" : "empty"}`}>★</span>
        ))}
      </div>
    );
  };

  const filtered = psychiatrists.filter(
    (d) =>
      cleanName(d.name).toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const palettes = [
    { bg: "#EEE8FF", color: "#5C3FA3" },
    { bg: "#FFE8EE", color: "#A33F5C" },
    { bg: "#E8F4FF", color: "#3F6EA3" },
    { bg: "#E8FFF0", color: "#2A7A4E" },
    { bg: "#FFF4E8", color: "#A36E2A" },
    { bg: "#F0E8FF", color: "#7A3FA3" },
  ];

  const palette = (name = "") => palettes[name.charCodeAt(0) % palettes.length];

  const initials = (name = "") =>
    cleanName(name).split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const specColor = (spec = "") => {
    const s = spec.toLowerCase();
    if (s.includes("anxiety")) return { bg: "#EEF3FF", color: "#3B5DB8", border: "#C8D8FF" };
    if (s.includes("depress")) return { bg: "#F0EEFF", color: "#5C3FA3", border: "#D4C8FF" };
    if (s.includes("stress")) return { bg: "#FFF0EE", color: "#A34A3F", border: "#FFD4C8" };
    if (s.includes("trauma")) return { bg: "#EEFAF4", color: "#2A7A5A", border: "#B0E8CC" };
    return { bg: "#F5F5F5", color: "#5A5A5A", border: "#E0E0E0" };
  };

  return (
    <div className="up-page">
      <Navbar />

      {/* Toast */}
      <div className="toast-container">
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === "success" ? "✓" : "!"}
            </div>
            <div style={{ flex: 1 }}>
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button className="toast-close" onClick={() => setToast(null)}>✕</button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon-wrap">+</div>
              <span className="modal-title">Add Psychiatrist</span>
            </div>
            <div className="modal-body">
              <p className="modal-msg">
                Are you sure you want to add{" "}
                <strong>Dr. {cleanName(modal.psychiatristName)}</strong> to your list?
              </p>
              <div className="modal-actions">
                <button className="modal-btn modal-btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button className="modal-btn modal-btn-confirm" onClick={confirmAddPsychiatrist}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={closeReviewModal}
        psychiatristId={reviewModal.psychiatristId}
        psychiatristName={reviewModal.psychiatristName}
        onSuccess={handleReviewSuccess}
      />

      <main className="up-main">
        <div className="up-inner">
          <div className="up-hero">
            <h1 className="up-title">Find a <em>Psychiatrist</em></h1>
            <p className="up-subtitle">Browse and connect with trusted mental health professionals.</p>
          </div>

          <div className="up-orn">
            <span className="up-orn-line" />
            <span className="up-orn-dot" />
            <span className="up-orn-line" />
          </div>

          {!loading && (
            <div className="up-toolbar">
              <button className="up-my-btn" onClick={() => navigate("/my-psychiatrists")}>
                My Psychiatrists
              </button>

              <div className="up-search-wrap">
                <svg className="up-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <input
                  className="up-search"
                  placeholder="Search by name or specialization…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="up-count">
                <strong>{filtered.length}</strong> doctors available
              </div>
            </div>
          )}

          {loading ? (
            <div className="up-loader">
              <div className="up-loader-spin" />
              <span>Finding professionals…</span>
            </div>
          ) : (
            <div className="up-grid">
              {filtered.length > 0 ? (
                filtered.map((doc) => {
                  const name = cleanName(doc.name);
                  const pal = palette(doc.name);
                  const inits = initials(doc.name);
                  const sc = specColor(doc.specialization || "");
                  const isAdded = added[doc._id];
                  const docRatings = ratings[doc._id] || { average: 0, total: 0 };

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
                          <span className="up-spec-dot" style={{ background: sc.color }} />
                          {doc.specialization || "General Psychiatry"}
                        </div>

                        <div className="rating-container">
                          <div className="stars-display">
                            {renderStars(docRatings.average)}
                          </div>
                          <div>
                            <span className="rating-text">{docRatings.average.toFixed(1)}</span>
                            <button 
                              className="write-review-btn"
                              onClick={() => openReviewModal(doc._id, doc.name)}
                            >
                              Write a review
                            </button>
                          </div>
                        </div>
                        <div 
                          className="review-count" 
                          onClick={() => navigate(`/psychiatrist-reviews/${doc._id}`)}
                        >
                          {docRatings.total} {docRatings.total === 1 ? "review" : "reviews"}
                        </div>

                        <div className="up-fee-box">
                          <span className="up-fee-label">Consultation Fee</span>
                          <span className="up-fee-amount">₹{doc.consultationFee}</span>
                        </div>

                        <div className="up-button-row">
                          <button
                            className={`up-add-btn ${isAdded ? "added" : ""}`}
                            onClick={() => !isAdded && openAddModal(doc._id, doc.name)}
                            disabled={isAdded}
                          >
                            {isAdded ? "✓ Added to My List" : "+ Add to My Psychiatrists"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="up-empty">
                  <div className="up-empty-icon">🔍</div>
                  <div>No results found for "{search}"</div>
                  <p style={{ fontSize: "12px", marginTop: "8px", color: "#bbb" }}>
                    Try searching with a different name or specialization
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 8px; }

        /* Toast */
        .toast-container {
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          display: flex; flex-direction: column; gap: 10px; pointer-events: none;
        }
        .toast-container > * { pointer-events: auto; }
        .toast {
          background: #fff; border-radius: 14px; padding: 14px 18px;
          display: flex; align-items: center; gap: 12px;
          min-width: 300px; max-width: 380px;
          border: 1px solid #eee;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          animation: toastIn .25s ease forwards;
        }
        .toast-success { border-left: 3px solid #4CAF7D; }
        .toast-error   { border-left: 3px solid #E05C4B; }
        .toast-icon {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0;
        }
        .toast-success .toast-icon { background: #EDFAF3; color: #2E7D52; }
        .toast-error   .toast-icon { background: #FCEEED; color: #C0392B; }
        .toast-title   { font-size: 13px; font-weight: 500; color: #1a1a1a; margin-bottom: 2px; }
        .toast-message { font-size: 12px; color: #888; }
        .toast-close { background: none; border: none; color: #ccc; cursor: pointer; font-size: 14px; margin-left: auto; }
        @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(3px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9998; padding: 20px;
        }
        .modal {
          background: #fff; border-radius: 20px;
          width: 380px; max-width: 100%;
          border: 1px solid #eee;
          box-shadow: 0 16px 40px rgba(0,0,0,0.12);
          overflow: hidden;
        }
        .modal-header {
          padding: 20px 22px; border-bottom: 1px solid #f0f0f0;
          display: flex; align-items: center; gap: 12px;
        }
        .modal-icon-wrap {
          width: 36px; height: 36px; border-radius: 10px;
          background: #EDFAF3; color: #2E7D52;
          display: flex; align-items: center; justify-content: center; font-size: 16px;
        }
        .modal-title {
          font-family: 'Lora', serif;
          font-size: 17px; font-weight: 500; color: #1a1a1a;
        }
        .modal-body { padding: 20px 22px; }
        .modal-msg {
          font-size: 14px; color: #666; line-height: 1.65; margin-bottom: 18px;
        }
        .modal-msg strong { color: #1a1a1a; }
        .modal-actions { display: flex; gap: 10px; }
        .modal-btn {
          flex: 1; padding: 11px; border-radius: 50px;
          font-size: 13px; font-weight: 500; cursor: pointer; border: none;
          transition: opacity .15s;
        }
        .modal-btn:hover { opacity: .85; }
        .modal-btn-cancel { background: #f5f5f5; color: #666; }
        .modal-btn-confirm { background: #1a1a1a; color: #fff; }

        /* Page */
        .up-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #faf7f3 0%, #f0ede8 100%);
          font-family: 'Inter', sans-serif;
          color: #1a1a1a;
        }

        .up-main { padding: 52px 24px 80px; }
        .up-inner { max-width: 1200px; margin: 0 auto; }

        .up-hero { text-align: center; margin-bottom: 32px; }
        .up-title {
          font-family: 'Lora', serif;
          font-size: clamp(34px, 5vw, 52px);
          font-weight: 400;
          color: #2C2318;
          line-height: 1.2;
        }
        .up-title em { font-style: italic; color: #A0856A; }
        .up-subtitle { font-size: 14px; color: #888; margin-top: 10px; }

        .up-orn {
          display: flex; align-items: center; gap: 12px;
          justify-content: center; margin: 18px 0 32px;
        }
        .up-orn-line { height: 1px; width: 52px; background: #e8e8e8; }
        .up-orn-dot  { width: 5px; height: 5px; transform: rotate(45deg); background: #C8A87A; }

        .up-toolbar {
          display: flex; align-items: center; gap: 12px;
          flex-wrap: wrap; margin-bottom: 28px;
        }
        .up-my-btn {
          padding: 10px 24px;
          background: #2C2318;
          color: #fff;
          border: none;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .up-my-btn:hover { background: #1A1510; transform: translateY(-1px); }

        .up-search-wrap { position: relative; flex: 1; min-width: 240px; }
        .up-search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          width: 14px; height: 14px; color: #aaa;
        }
        .up-search {
          width: 100%; padding: 10px 16px 10px 42px;
          background: #fff; border: 1px solid #e8e8e8;
          border-radius: 50px; font-size: 13px;
          font-family: 'Inter', sans-serif; color: #1a1a1a;
          outline: none;
        }
        .up-search:focus { border-color: #ccc; }
        .up-count { font-size: 12px; color: #aaa; white-space: nowrap; }
        .up-count strong { color: #A0856A; }

        .up-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .up-card {
          background: #fff;
          border: 1px solid #e8e0d8;
          border-radius: 20px;
          overflow: hidden;
          display: flex; flex-direction: column;
          transition: all 0.3s ease;
        }
        .up-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.1);
          border-color: #d4c5b0;
        }

        .up-band {
          height: 80px;
          background: linear-gradient(135deg, #f5f0ea 0%, #ede5dc 100%);
          position: relative;
        }

        .up-av {
          position: absolute; bottom: -28px; left: 20px;
          width: 56px; height: 56px; border-radius: 50%;
          border: 3px solid #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .up-body {
          padding: 40px 20px 20px;
          display: flex; flex-direction: column; gap: 12px; flex: 1;
        }

        .up-doc-name {
          font-family: 'Lora', serif;
          font-size: 20px;
          font-weight: 600;
          color: #2C2318;
          margin-bottom: 4px;
        }

        .up-spec-tag {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 500;
          border-radius: 30px; padding: 4px 12px;
          width: fit-content;
          font-family: 'Inter', sans-serif;
        }

        .up-fee-box {
          display: flex; align-items: center; justify-content: space-between;
          background: #f8f6f3;
          border-radius: 12px; padding: 12px 16px;
          margin-top: 8px;
        }
        .up-fee-label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: .06em;
          color: #A0856A;
        }
        .up-fee-amount {
          font-family: 'Lora', serif;
          font-size: 22px;
          font-weight: 600;
          color: #2C2318;
        }

        /* Rating Stars */
        .rating-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 8px 0 4px;
        }
        .stars-display {
          display: flex;
          gap: 3px;
        }
        .star {
          font-size: 14px;
        }
        .star.filled {
          color: #ffc107;
        }
        .star.empty {
          color: #e0e0e0;
        }
        .rating-text {
          font-size: 12px;
          color: #A0856A;
          font-weight: 500;
        }
        .review-count {
          font-size: 11px;
          color: #C8A87A;
          cursor: pointer;
          margin-top: 4px;
          display: inline-block;
        }
        .review-count:hover {
          text-decoration: underline;
        }
        .write-review-btn {
          font-size: 11px;
          color: #A0856A;
          background: none;
          border: none;
          cursor: pointer;
          margin-left: 8px;
          font-weight: 500;
        }
        .write-review-btn:hover {
          text-decoration: underline;
        }

        .up-button-row {
          margin-top: 8px;
        }
        .up-add-btn {
          width: 100%; padding: 12px;
          border-radius: 50px;
          border: 1px solid #e0d8d0;
          background: #fff;
          color: #2C2318;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .up-add-btn:hover:not(:disabled) {
          background: #f5f0ea;
          border-color: #c8b8a8;
          transform: translateY(-1px);
        }
        .up-add-btn.added {
          background: #EAF5EA;
          border-color: #A8D8BC;
          color: #2E7D52;
          cursor: default;
        }

        /* Loader */
        .up-loader {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 0; gap: 14px; color: #aaa; font-size: 13px;
        }
        .up-loader-spin {
          width: 40px; height: 40px;
          border: 3px solid #f0f0f0;
          border-top-color: #A0856A;
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .up-empty {
          grid-column: 1 / -1;
          text-align: center; padding: 64px 24px;
          color: #aaa; font-size: 14px;
        }
        .up-empty-icon {
          width: 60px; height: 60px; border-radius: 50%;
          background: #f5f0ea;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          font-size: 24px;
        }

        @media (max-width: 768px) {
          .up-main { padding: 32px 16px 60px; }
          .up-grid { gap: 16px; }
        }
      `}</style>
    </div>
  );
};

export default UserPsychiatrists;