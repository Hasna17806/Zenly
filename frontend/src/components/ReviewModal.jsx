import { useState } from "react";
import axios from "axios";
import API from "../api/axios";

const ReviewModal = ({ isOpen, onClose, psychiatristId, psychiatristName, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    if (!comment.trim()) {
      setError("Please enter your review");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Submitting review for psychiatrist:", psychiatristId);
      
      const response = await API.post("/reviews/add", {
        psychiatristId,
        rating,
        title,
        comment
      });
      
      console.log("Review submitted:", response.data);
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error submitting review:", error);
      console.error("Error response:", error.response?.data);
      
      let errorMessage = "Failed to submit review";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = "You can only review psychiatrists you've had appointments with";
      } else if (error.response?.status === 400) {
        errorMessage = "You have already reviewed this psychiatrist";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setTitle("");
    setComment("");
    setError("");
  };

  if (!isOpen) return null;

  const cleanName = (name = "") => name.replace(/^Dr\.?\s*/i, "").trim();

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h3>Review Dr. {cleanName(psychiatristName)}</h3>
          <button className="review-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="review-modal-body">
          {error && <div className="review-error">{error}</div>}
          
          <div className="rating-section">
            <label>Your Rating</label>
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${(hoverRating || rating) >= star ? "active" : ""}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="review-input-group">
            <label>Review Title</label>
            <input
              type="text"
              placeholder="e.g., Excellent doctor, Very helpful..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="review-input-group">
            <label>Your Review</label>
            <textarea
              placeholder="Share your experience with this psychiatrist..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              maxLength={500}
            />
          </div>
          
          <div className="review-note">
            <small>Note: You can only review psychiatrists you've had appointments with.</small>
          </div>
        </div>

        <div className="review-modal-footer">
          <button className="review-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="review-submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        <style>{`
          .review-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
          }
          .review-modal {
            background: #fff;
            border-radius: 24px;
            width: 500px;
            max-width: 100%;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .review-modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .review-modal-header h3 {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0;
          }
          .review-modal-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #999;
          }
          .review-modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
          }
          .rating-section {
            margin-bottom: 20px;
          }
          .rating-section label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 8px;
          }
          .stars-container {
            display: flex;
            gap: 8px;
          }
          .star-btn {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #ddd;
            transition: color 0.2s;
          }
          .star-btn.active {
            color: #ffc107;
          }
          .review-input-group {
            margin-bottom: 20px;
          }
          .review-input-group label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 8px;
          }
          .review-input-group input,
          .review-input-group textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 12px;
            font-size: 14px;
            font-family: inherit;
            outline: none;
            transition: border-color 0.2s;
          }
          .review-input-group input:focus,
          .review-input-group textarea:focus {
            border-color: #A0856A;
          }
          .review-note {
            margin-top: 16px;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 8px;
          }
          .review-note small {
            color: #666;
            font-size: 12px;
          }
          .review-error {
            background: #fee;
            border: 1px solid #fcc;
            color: #c00;
            padding: 10px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 13px;
          }
          .review-modal-footer {
            padding: 16px 24px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          }
          .review-cancel-btn {
            padding: 10px 20px;
            border: 1px solid #ddd;
            border-radius: 12px;
            background: #fff;
            cursor: pointer;
          }
          .review-submit-btn {
            padding: 10px 24px;
            border: none;
            border-radius: 12px;
            background: #2C2318;
            color: #fff;
            cursor: pointer;
            font-weight: 500;
          }
          .review-submit-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ReviewModal;