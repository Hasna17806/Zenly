import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const PsychiatristReviews = () => {
  const { psychiatristId } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [psychiatrist, setPsychiatrist] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, newest, oldest, highest

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/psychiatrist/${psychiatristId}`);
      setReviews(res.data.reviews);
      setAverageRating(res.data.averageRating);
      setTotalReviews(res.data.totalReviews);
      
      // Also fetch psychiatrist details
      const psyRes = await axios.get(`http://localhost:5000/api/psychiatrist/all`);
      const foundPsychiatrist = psyRes.data.find(p => p._id === psychiatristId);
      setPsychiatrist(foundPsychiatrist);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [psychiatristId]);

  const getSortedReviews = () => {
    let sorted = [...reviews];
    if (filter === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filter === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (filter === "highest") {
      sorted.sort((a, b) => b.rating - a.rating);
    }
    return sorted;
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`star ${rating >= star ? "filled" : "empty"}`}>★</span>
        ))}
      </div>
    );
  };

  const cleanName = (name = "") => name.replace(/^Dr\.?\s*/i, "").trim();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="reviews-loading">
          <div className="spinner"></div>
          <p>Loading reviews...</p>
        </div>
        <Footer />
        <style>{`
          .reviews-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #eee;
            border-top-color: #A0856A;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="reviews-page">
        <div className="reviews-container">
          {/* Header */}
          <div className="reviews-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <div className="psychiatrist-info">
              <h1>Dr. {cleanName(psychiatrist?.name || "Psychiatrist")}</h1>
              <p className="specialization">{psychiatrist?.specialization || "Psychiatrist"}</p>
              <div className="rating-summary">
                <div className="average-rating">
                  <span className="rating-number">{averageRating.toFixed(1)}</span>
                  {renderStars(Math.round(averageRating))}
                </div>
                <span className="review-count">{totalReviews} {totalReviews === 1 ? "review" : "reviews"}</span>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          {reviews.length > 0 && (
            <div className="filter-section">
              <label>Sort by:</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Reviews</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
              </select>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="no-reviews">
              <div className="no-reviews-icon">📝</div>
              <h3>No Reviews Yet</h3>
              <p>Be the first to review this psychiatrist!</p>
              <button 
                className="write-review-btn-large"
                onClick={() => navigate(`/psychiatrists`)}
              >
                Go to Psychiatrists
              </button>
            </div>
          ) : (
            <div className="reviews-list">
              {getSortedReviews().map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.userId?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="reviewer-details">
                        <span className="reviewer-name">{review.userId?.name || "Anonymous"}</span>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <div className="review-content">
                    <h4 className="review-title">{review.title}</h4>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                  {review.isVerified && (
                    <div className="verified-badge">
                      ✓ Verified Patient
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />

      <style>{`
        .reviews-page {
          min-height: 100vh;
          background: #faf7f3;
          padding: 40px 24px 80px;
        }

        .reviews-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .reviews-header {
          margin-bottom: 32px;
        }

        .back-btn {
          background: none;
          border: none;
          color: #A0856A;
          font-size: 14px;
          cursor: pointer;
          padding: 8px 0;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
        }

        .back-btn:hover {
          color: #2C2318;
        }

        .psychiatrist-info h1 {
          font-size: 32px;
          font-weight: 600;
          color: #2C2318;
          margin: 0 0 8px 0;
        }

        .specialization {
          font-size: 16px;
          color: #A0856A;
          margin-bottom: 16px;
        }

        .rating-summary {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .average-rating {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rating-number {
          font-size: 24px;
          font-weight: 700;
          color: #2C2318;
        }

        .stars-display {
          display: flex;
          gap: 4px;
        }

        .star {
          font-size: 18px;
        }

        .star.filled {
          color: #ffc107;
        }

        .star.empty {
          color: #ddd;
        }

        .review-count {
          font-size: 14px;
          color: #A0856A;
        }

        .filter-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e8e0d8;
        }

        .filter-section label {
          font-size: 14px;
          color: #666;
        }

        .filter-section select {
          padding: 8px 16px;
          border: 1px solid #e0d8d0;
          border-radius: 8px;
          background: #fff;
          font-size: 14px;
          cursor: pointer;
          outline: none;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .review-card {
          background: #fff;
          border: 1px solid #e8e0d8;
          border-radius: 16px;
          padding: 24px;
          transition: box-shadow 0.2s;
        }

        .review-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .reviewer-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #A0856A, #C8A87A);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          color: #fff;
        }

        .reviewer-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .reviewer-name {
          font-weight: 600;
          color: #2C2318;
        }

        .review-date {
          font-size: 12px;
          color: #999;
        }

        .review-rating {
          flex-shrink: 0;
        }

        .review-content {
          margin-bottom: 16px;
        }

        .review-title {
          font-size: 18px;
          font-weight: 600;
          color: #2C2318;
          margin: 0 0 8px 0;
        }

        .review-comment {
          font-size: 15px;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }

        .verified-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #EAF5EA;
          color: #2E7D52;
          font-size: 12px;
          border-radius: 20px;
        }

        .no-reviews {
          text-align: center;
          padding: 60px 20px;
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e8e0d8;
        }

        .no-reviews-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .no-reviews h3 {
          font-size: 20px;
          color: #2C2318;
          margin-bottom: 8px;
        }

        .no-reviews p {
          color: #999;
          margin-bottom: 24px;
        }

        .write-review-btn-large {
          padding: 10px 24px;
          background: #2C2318;
          color: #fff;
          border: none;
          border-radius: 30px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .write-review-btn-large:hover {
          background: #1A1510;
        }

        @media (max-width: 768px) {
          .reviews-page {
            padding: 20px 16px 60px;
          }
          .psychiatrist-info h1 {
            font-size: 24px;
          }
          .review-header {
            flex-direction: column;
          }
          .review-card {
            padding: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default PsychiatristReviews;