import { useState, useEffect } from "react";
import axios from "axios";
import PsychiatristLayout from "../components/PsychiatristLayout";

const PsychiatristAvailability = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [toast, setToast] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const token = localStorage.getItem("psychiatristToken");

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAvailabilities = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/availability/psychiatrist",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailabilities(res.data);
    } catch (error) {
      console.error("Error fetching availabilities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const handleAddAvailability = async () => {
    if (!selectedDate) {
      showToast("Please select a date", "error");
      return;
    }
    if (selectedSlots.length === 0) {
      showToast("Please select at least one time slot", "error");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/availability/add",
        { date: selectedDate, slots: selectedSlots },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Availability added successfully!");
      fetchAvailabilities();
      setSelectedDate("");
      setSelectedSlots([]);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding availability:", error);
      showToast(error.response?.data?.message || "Failed to add availability", "error");
    }
  };

  const handleDeleteAvailability = async (id) => {
    if (!confirm("Are you sure you want to remove this availability?")) return;
    
    try {
      await axios.delete(
        `http://localhost:5000/api/availability/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Availability removed successfully!");
      fetchAvailabilities();
    } catch (error) {
      console.error("Error deleting availability:", error);
      showToast("Failed to remove availability", "error");
    }
  };

  const toggleSlot = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <PsychiatristLayout>
      <div className="availability-main">
        <div className="availability-header">
          <div>
            <div className="availability-eyebrow">Schedule Management</div>
            <h2 className="availability-title">Availability</h2>
            <p className="availability-sub">Set your available time slots for patient bookings</p>
          </div>
          <button className="add-btn" onClick={() => setShowAddForm(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Availability
          </button>
        </div>

        {/* Add Availability Form Modal */}
        {showAddForm && (
          <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Available Slots</h3>
                <button className="modal-close" onClick={() => setShowAddForm(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Date</label>
                  <input
                    type="date"
                    className="date-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                  />
                </div>
                <div className="form-group">
                  <label>Select Time Slots</label>
                  <div className="slots-grid">
                    {timeSlots.map(slot => (
                      <button
                        key={slot}
                        className={`slot-btn ${selectedSlots.includes(slot) ? "selected" : ""}`}
                        onClick={() => toggleSlot(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button className="save-btn" onClick={handleAddAvailability}>Save Availability</button>
              </div>
            </div>
          </div>
        )}

        {/* Availability List */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading availability...</p>
          </div>
        ) : availabilities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No availability set</h3>
            <p>Add your available time slots so patients can book appointments with you.</p>
            <button className="empty-add-btn" onClick={() => setShowAddForm(true)}>
              + Add Your First Availability
            </button>
          </div>
        ) : (
          <div className="availability-list">
            {availabilities.map((item) => (
              <div key={item._id} className="availability-card">
                <div className="card-header">
                  <div className="card-date">
                    <span className="date-day">
                      {new Date(item.date).toLocaleDateString("en-US", { weekday: "long" })}
                    </span>
                    <span className="date-number">
                      {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteAvailability(item._id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* //Update the slot display to show booked status */}
            <div className="card-slots">
              {item.slots.map((slot, idx) => (
                <span key={idx} className={`slot-tag ${slot.isBooked ? "booked" : "available"}`}>
                  {slot.time}
                  {slot.isBooked && " (Booked)"}
                </span>
              ))}
            </div>
            <div className="card-stats">
              <span>Available: {item.slots.filter(s => !s.isBooked).length}</span>
              <span>Booked: {item.slots.filter(s => s.isBooked).length}</span>
            </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .availability-main {
          flex: 1;
          padding: 48px 56px;
          overflow-y: auto;
        }

        .availability-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }

        .availability-eyebrow {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #64b4c8;
          margin-bottom: 8px;
        }

        .availability-title {
          font-size: 32px;
          font-weight: 700;
          color: #eef2f5;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .availability-sub {
          font-size: 16px;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
          margin-top: 6px;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #64b4c8;
          border: none;
          border-radius: 12px;
          color: #0b1520;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-btn:hover {
          background: #7dc6d8;
          transform: translateY(-1px);
        }

        /* Modal Styles */
        .modal-overlay {
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

        .modal-content {
          background: #111d2b;
          border-radius: 24px;
          width: 500px;
          max-width: 100%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #eef2f5;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: rgba(255,255,255,0.5);
          transition: color 0.2s;
        }

        .modal-close:hover { color: #fff; }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          margin-bottom: 8px;
        }

        .date-input {
          width: 100%;
          padding: 12px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          color: #eef2f5;
          font-size: 14px;
          outline: none;
        }

        .date-input:focus {
          border-color: #64b4c8;
        }

        .slots-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .slot-btn {
          padding: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slot-btn:hover {
          background: rgba(100,180,200,0.2);
          border-color: #64b4c8;
        }

        .slot-btn.selected {
          background: #64b4c8;
          color: #0b1520;
          border-color: #64b4c8;
        }

        .cancel-btn {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
        }

        .save-btn {
          padding: 10px 24px;
          background: #64b4c8;
          border: none;
          border-radius: 10px;
          color: #0b1520;
          font-weight: 600;
          cursor: pointer;
        }

        /* List Styles */
        .availability-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .availability-card {
          background: #111d2b;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 20px 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .card-date {
          display: flex;
          flex-direction: column;
        }

        .date-day {
          font-size: 14px;
          color: #64b4c8;
          font-weight: 600;
        }

        .date-number {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
        }

        .delete-btn {
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          color: #f87171;
          transition: all 0.2s ease;
        }

        .delete-btn:hover {
          background: rgba(248,113,113,0.2);
        }

        .card-slots {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .slot-tag {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .slot-tag.available {
          background: rgba(109,212,164,0.15);
          color: #6dd4a4;
          border: 1px solid rgba(109,212,164,0.3);
        }

        .slot-tag.booked {
          background: rgba(248,113,113,0.15);
          color: #f87171;
          border: 1px solid rgba(248,113,113,0.3);
          text-decoration: line-through;
        }

        .card-stats {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: rgba(255,255,255,0.4);
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: #111d2b;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.07);
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 20px;
          color: #eef2f5;
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 24px;
        }

        .empty-add-btn {
          padding: 12px 24px;
          background: #64b4c8;
          border: none;
          border-radius: 12px;
          color: #0b1520;
          font-weight: 600;
          cursor: pointer;
        }

        .loading-state {
          text-align: center;
          padding: 80px 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #64b4c8;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          animation: slideIn 0.3s ease;
        }

        .toast.success {
          background: #132e42;
          border: 1px solid rgba(109,212,164,0.3);
          color: #6dd4a4;
        }

        .toast.error {
          background: #1f1520;
          border: 1px solid rgba(248,113,113,0.3);
          color: #f87171;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </PsychiatristLayout>
  );
};

export default PsychiatristAvailability;