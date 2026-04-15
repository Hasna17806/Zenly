import { useState, useEffect } from "react";
import axios from "axios";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const token = localStorage.getItem("adminToken");

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/reviews/admin/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(res.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const toggleVisibility = async (id, currentStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/reviews/admin/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReviews();
    } catch (error) {
      console.error("Error toggling review:", error);
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === "visible") return review.isVisible;
    if (filter === "hidden") return !review.isVisible;
    return true;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? "#f59e0b" : "#27272a", fontSize: "15px" }}>★</span>
    ));
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const cleanDoctorName = (name = "") => name.replace(/^Dr\.?\s*/i, "").trim();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rv-wrap {
          min-height: 100vh;
          background: #08080a;
          font-family: 'Inter', sans-serif;
          padding: 36px 32px 64px;
        }

        .rv-inner { max-width: 860px; margin: 0 auto; }

        /* ── Header ── */
        .rv-header {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 32px;
          animation: rise 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .rv-hdr-icon {
          width: 50px; height: 50px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(124,58,237,0.4);
          flex-shrink: 0;
        }
        .rv-hdr-icon svg { width: 24px; height: 24px; }
        .rv-title { font-size: 21px; font-weight: 700; color: #f5f5f5; letter-spacing: -0.025em; }
        .rv-sub   { font-size: 13px; color: #52525b; margin-top: 3px; }

        /* ── Stats row ── */
        .rv-stats {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
          margin-bottom: 24px;
          animation: rise 0.55s 0.05s cubic-bezier(0.16,1,0.3,1) both;
        }
        .rv-stat {
          background: #111115;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 18px 20px;
        }
        .rv-stat-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: #52525b; margin-bottom: 8px;
        }
        .rv-stat-val { font-size: 30px; font-weight: 700; color: #f5f5f5; letter-spacing: -0.03em; line-height: 1; }
        .rv-stat-icon { font-size: 18px; margin-bottom: 8px; }

        /* ── Filter Pills ── */
        .rv-filters {
          display: flex; gap: 8px; margin-bottom: 24px;
          animation: rise 0.55s 0.08s cubic-bezier(0.16,1,0.3,1) both;
        }
        .fpill {
          padding: 8px 18px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.07);
          background: #111115; color: #71717a;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.18s;
        }
        .fpill:hover { border-color: rgba(124,58,237,0.35); color: #c4b5fd; }
        .fpill.on {
          background: rgba(124,58,237,0.18);
          border-color: rgba(124,58,237,0.45);
          color: #c4b5fd; font-weight: 600;
        }

        /* ── Review Cards ── */
        .rv-list {
          display: flex; flex-direction: column; gap: 14px;
          animation: rise 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both;
        }

        .rv-card {
          background: #111115;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .rv-card:hover {
          border-color: rgba(124,58,237,0.22);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .rv-card.is-hidden {
          opacity: 0.5;
          border-style: dashed;
        }

        /* card top stripe accent */
        .rv-card-stripe {
          height: 3px;
          background: linear-gradient(90deg, #7c3aed, #4f46e5);
        }
        .rv-card.is-hidden .rv-card-stripe {
          background: #27272a;
        }

        .rv-card-body { padding: 20px 22px; }

        /* user row */
        .rv-user-row {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 14px;
          margin-bottom: 14px; flex-wrap: wrap;
        }
        .rv-user-left { display: flex; align-items: center; gap: 12px; }
        .rv-avatar {
          width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.3));
          border: 1px solid rgba(124,58,237,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; color: #c4b5fd;
        }
        .rv-user-name { font-size: 14px; font-weight: 600; color: #f5f5f5; }
        .rv-user-email { font-size: 12px; color: #52525b; margin-top: 2px; }

        /* stars */
        .rv-stars-wrap { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .rv-rating-num { font-size: 12px; color: #52525b; font-weight: 500; }

        /* Doctor section - HIGHLIGHTED */
        .rv-doctor-section {
          background: linear-gradient(135deg, rgba(124,58,237,0.08), rgba(79,70,229,0.05));
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 14px;
          padding: 12px 16px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .rv-doctor-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .rv-doctor-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #a78bfa;
        }
        .rv-doctor-name {
          font-size: 16px;
          font-weight: 700;
          color: #c4b5fd;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .rv-doctor-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
          background: rgba(124,58,237,0.2);
          border: 1px solid rgba(124,58,237,0.3);
          color: #a78bfa;
        }

        /* review content */
        .rv-review-title {
          font-size: 14.5px; font-weight: 600; color: #e4e4e7;
          margin-bottom: 6px; line-height: 1.4;
        }
        .rv-review-comment {
          font-size: 13.5px; color: #71717a; line-height: 1.65;
          margin-bottom: 14px;
        }

        /* meta */
        .rv-meta {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 16px; flex-wrap: wrap;
        }
        .rv-meta-item { font-size: 11.5px; color: #52525b; font-weight: 500; }
        .rv-verified {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11.5px; font-weight: 600;
          padding: 3px 10px; border-radius: 20px;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.25);
          color: #6ee7b7;
        }
        .rv-unverified {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11.5px; font-weight: 600;
          padding: 3px 10px; border-radius: 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #52525b;
        }
        .rv-hidden-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11.5px; font-weight: 600;
          padding: 3px 10px; border-radius: 20px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171;
        }

        /* divider */
        .rv-divider { height: 1px; background: rgba(255,255,255,0.05); margin-bottom: 16px; }

        /* actions - only one button now */
        .rv-actions { display: flex; gap: 8px; }
        .rv-btn {
          display: flex; align-items: center; gap: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 12.5px; font-weight: 600;
          padding: 8px 16px; border-radius: 9px; border: none; cursor: pointer;
          transition: all 0.18s;
        }
        .rv-btn-show {
          background: rgba(16,185,129,0.12);
          color: #6ee7b7;
          border: 1px solid rgba(16,185,129,0.25);
        }
        .rv-btn-show:hover { background: rgba(16,185,129,0.22); transform: translateY(-1px); }
        .rv-btn-hide {
          background: rgba(234,179,8,0.12);
          color: #fbbf24;
          border: 1px solid rgba(234,179,8,0.25);
        }
        .rv-btn-hide:hover { background: rgba(234,179,8,0.22); transform: translateY(-1px); }

        /* loading */
        .rv-loading {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 72px; gap: 16px; color: #52525b; font-size: 14px;
        }
        .rv-spinner {
          width: 28px; height: 28px;
          border: 3px solid rgba(255,255,255,0.06);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* empty */
        .rv-empty {
          text-align: center; padding: 72px 24px;
          background: #111115;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 18px;
          color: #3f3f46; font-size: 14px;
        }
        .rv-empty-icon { font-size: 40px; display: block; margin-bottom: 12px; opacity: 0.25; }

        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes rise {
          from { opacity:0; transform:translateY(22px) scale(0.97); }
          to   { opacity:1; transform:none; }
        }

        @media (max-width: 600px) {
          .rv-wrap { padding: 20px 16px 48px; }
          .rv-stats { grid-template-columns: 1fr 1fr; }
          .rv-filters { flex-wrap: wrap; }
        }
      `}</style>

      <div className="rv-wrap">
        <div className="rv-inner">

          {/* ── Header ── */}
          <div className="rv-header">
            <div className="rv-hdr-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <div className="rv-title">Reviews Management</div>
              <div className="rv-sub">Moderate patient reviews for psychiatrists</div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="rv-stats">
            {[
              { icon: "💬", label: "Total Reviews",   val: reviews.length },
              { icon: "👁️",  label: "Visible",         val: reviews.filter(r => r.isVisible).length },
              { icon: "🚫", label: "Hidden",           val: reviews.filter(r => !r.isVisible).length },
            ].map(s => (
              <div key={s.label} className="rv-stat">
                <div className="rv-stat-icon">{s.icon}</div>
                <div className="rv-stat-label">{s.label}</div>
                <div className="rv-stat-val">{s.val}</div>
              </div>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="rv-filters">
            {[
              { key: "all",     label: `All (${reviews.length})` },
              { key: "visible", label: `Visible (${reviews.filter(r => r.isVisible).length})` },
              { key: "hidden",  label: `Hidden (${reviews.filter(r => !r.isVisible).length})` },
            ].map(f => (
              <button key={f.key}
                className={`fpill ${filter === f.key ? "on" : ""}`}
                onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className="rv-loading">
              <div className="rv-spinner" />
              Loading reviews…
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="rv-empty">
              <span className="rv-empty-icon">💬</span>
              No reviews found
            </div>
          ) : (
            <div className="rv-list">
              {filteredReviews.map(review => (
                <div key={review._id} className={`rv-card ${!review.isVisible ? "is-hidden" : ""}`}>
                  <div className="rv-card-stripe" />
                  <div className="rv-card-body">

                    {/* User + Stars */}
                    <div className="rv-user-row">
                      <div className="rv-user-left">
                        <div className="rv-avatar">
                          {getInitials(review.userId?.name)}
                        </div>
                        <div>
                          <div className="rv-user-name">{review.userId?.name || "Unknown User"}</div>
                          <div className="rv-user-email">{review.userId?.email}</div>
                        </div>
                      </div>
                      <div className="rv-stars-wrap">
                        {renderStars(review.rating)}
                        <span className="rv-rating-num">{review.rating}/5</span>
                      </div>
                    </div>

                    {/* Doctor Section - HIGHLIGHTED */}
                    <div className="rv-doctor-section">
                      <div className="rv-doctor-icon">
                        👨‍⚕️
                      </div>
                      <div>
                        <div className="rv-doctor-label">REVIEW FOR</div>
                        <div className="rv-doctor-name">
                          Dr. {cleanDoctorName(review.psychiatristId?.name)}
                          <span className="rv-doctor-badge">
                            Psychiatrist
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    {review.title && <div className="rv-review-title">{review.title}</div>}
                    <div className="rv-review-comment">{review.comment}</div>

                    {/* Meta */}
                    <div className="rv-meta">
                      <span className="rv-meta-item">
                        📅 {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                      {review.isVerified
                        ? <span className="rv-verified">✓ Verified Patient</span>
                        : <span className="rv-unverified">Unverified</span>
                      }
                      {!review.isVisible && <span className="rv-hidden-badge">⊘ Hidden</span>}
                    </div>

                    <div className="rv-divider" />

                    {/* Actions - Only Show/Hide button */}
                    <div className="rv-actions">
                      <button
                        className={`rv-btn ${review.isVisible ? "rv-btn-hide" : "rv-btn-show"}`}
                        onClick={() => toggleVisibility(review._id, review.isVisible)}
                      >
                        {review.isVisible ? "⊘ Hide" : "◎ Show"}
                      </button>
                    </div>

                  </div>  
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default AdminReviews;