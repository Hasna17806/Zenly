import { useState, useEffect } from "react";
import axios from "axios";
import API from "../api/axios";

const BookingModal = ({ isOpen, onClose, psychiatrist, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: date selection, 2: time selection
  const [bookingLoading, setBookingLoading] = useState(false);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // Fetch available dates
  useEffect(() => {
    if (isOpen && psychiatrist) {
      fetchAvailableDates();
    }
  }, [isOpen, psychiatrist]);

  const fetchAvailableDates = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/availability/dates/${psychiatrist._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableDates(res.data);
    } catch (error) {
      console.error("Error fetching dates:", error);
    }
  };

  const fetchAvailableSlots = async (date) => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/availability/slots/${psychiatrist._id}/${date}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAvailableSlots(res.data); // This now only returns non-booked slots
        setStep(2);
      } catch (error) {
        console.error("Error fetching slots:", error);
      } finally {
        setLoading(false);
      }
    };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    fetchAvailableSlots(date);
  };

  const handleBooking = async () => {
    if (!selectedTime) return;
    
    setBookingLoading(true);
    try {
      const res = await API.post("/appointments/book", { 
        psychiatristId: psychiatrist._id,
        preferredDate: selectedDate,
        preferredTime: selectedTime
      });
      
      onSuccess(res.data);
      onClose();
    } catch (error) {
      console.error("Booking error:", error);
      alert(error.response?.data?.message || "Failed to book appointment");
    } finally {
      setBookingLoading(false);
    }
  };

  if (!isOpen) return null;

  const cleanName = (name = "") => name.replace(/^Dr\.?\s*/i, "").trim();

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="booking-modal-header">
          <h3>Book Appointment with Dr. {cleanName(psychiatrist.name)}</h3>
          <button className="booking-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="booking-modal-body">
          {step === 1 && (
            <div className="booking-step">
              <h4>Select a Date</h4>
              <div className="booking-dates-grid">
                {availableDates.length === 0 ? (
                  <p className="no-dates">No available dates found. Please check back later.</p>
                ) : (
                  availableDates.map((date) => (
                    <button
                      key={date}
                      className={`booking-date-btn ${selectedDate === date ? "selected" : ""}`}
                      onClick={() => handleDateSelect(date)}
                    >
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                      })}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="booking-step">
              <button className="booking-back-btn" onClick={() => setStep(1)}>
                ← Back to Dates
              </button>
              
              <h4>Select a Time Slot for {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric"
              })}</h4>
              
              {loading ? (
                <div className="booking-loading">Loading available slots...</div>
              ) : (
                <div className="booking-times-grid">
                  {availableSlots.length === 0 ? (
                    <p className="no-slots">No available slots for this date.</p>
                  ) : (
                    availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        className={`booking-time-btn ${selectedTime === slot.time ? "selected" : ""}`}
                        onClick={() => setSelectedTime(slot.time)}
                      >
                        {slot.time}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="booking-modal-footer">
          <button className="booking-cancel-btn" onClick={onClose}>Cancel</button>
          {step === 2 && (
            <button
              className="booking-confirm-btn"
              onClick={handleBooking}
              disabled={!selectedTime || bookingLoading}
            >
              {bookingLoading ? "Booking..." : "Confirm Appointment"}
            </button>
          )}
        </div>

        <style>{`
          .booking-modal-overlay {
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
          .booking-modal {
            background: #fff;
            border-radius: 24px;
            width: 500px;
            max-width: 100%;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          }
          .booking-modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .booking-modal-header h3 {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0;
          }
          .booking-modal-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #999;
            transition: color 0.2s;
          }
          .booking-modal-close:hover { color: #333; }
          .booking-modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
          }
          .booking-step h4 {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin: 0 0 16px 0;
          }
          .booking-dates-grid, .booking-times-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 10px;
          }
          .booking-date-btn, .booking-time-btn {
            padding: 12px;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            background: #fff;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 13px;
          }
          .booking-date-btn:hover, .booking-time-btn:hover {
            border-color: #A0856A;
            background: #FDF6EE;
          }
          .booking-date-btn.selected, .booking-time-btn.selected {
            background: #2C2318;
            color: #fff;
            border-color: #2C2318;
          }
          .booking-back-btn {
            background: none;
            border: none;
            color: #A0856A;
            cursor: pointer;
            font-size: 14px;
            padding: 0 0 16px 0;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .booking-back-btn:hover { text-decoration: underline; }
          .booking-modal-footer {
            padding: 16px 24px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          }
          .booking-cancel-btn {
            padding: 10px 20px;
            border: 1px solid #ddd;
            border-radius: 12px;
            background: #fff;
            cursor: pointer;
            font-size: 14px;
          }
          .booking-confirm-btn {
            padding: 10px 24px;
            border: none;
            border-radius: 12px;
            background: #2C2318;
            color: #fff;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          }
          .booking-confirm-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .no-dates, .no-slots {
            text-align: center;
            color: #999;
            padding: 40px;
          }
          .booking-loading {
            text-align: center;
            padding: 40px;
            color: #999;
          }
        `}</style>
      </div>
    </div>
  );
};

export default BookingModal;