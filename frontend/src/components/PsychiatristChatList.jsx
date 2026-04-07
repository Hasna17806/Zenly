import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "./Modal";
import SessionChat from "../pages/SessionChat";

const PsychiatristChatList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const token = localStorage.getItem("psychiatristToken") || localStorage.getItem("token");

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/appointments/psychiatrist", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter only accepted appointments
      const acceptedAppointments = res.data.filter(app => app.status === "Accepted");
      setAppointments(acceptedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  const openChat = (appointment) => {
    setSelectedChat({
      appointmentId: appointment._id,
      patientName: appointment.userId?.name || "Patient",
      patientId: appointment.userId?._id
    });
  };

  const closeChat = () => {
    setSelectedChat(null);
  };

  const getInitials = (name) => {
    if (!name) return "P";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="chat-list-container">
        <div className="chat-list-header">
          <h2>Patient Conversations</h2>
          <p>Chat with patients who have accepted appointments</p>
        </div>

        {loading ? (
          <div className="chat-list-loading">
            <div className="spinner"></div>
            <p>Loading conversations...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="chat-list-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#C8A87A" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h3>No active conversations</h3>
            <p>When patients book and accept appointments, they'll appear here</p>
          </div>
        ) : (
          <div className="chat-list">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="chat-item"
                onClick={() => openChat(appointment)}
              >
                <div className="chat-avatar">
                  {getInitials(appointment.userId?.name || "Patient")}
                </div>
                <div className="chat-info">
                  <div className="chat-name">{appointment.userId?.name || "Patient"}</div>
                  <div className="chat-details">
                    <span className="chat-date">
                      {appointment.date ? new Date(appointment.date).toLocaleDateString() : "Date TBD"} at {appointment.time || "TBD"}
                    </span>
                  </div>
                </div>
                <div className="chat-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedChat && (
        <Modal onClose={closeChat} title={`Chat with ${selectedChat.patientName}`}>
          <SessionChat appointmentId={selectedChat.appointmentId} onClose={closeChat} />
        </Modal>
      )}

      <style>{`
        .chat-list-container {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }

        .chat-list-header {
          padding: 24px;
          border-bottom: 1px solid #EDE6DC;
          background: #FAF7F3;
        }

        .chat-list-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 600;
          color: #2C2318;
          margin: 0 0 8px 0;
        }

        .chat-list-header p {
          font-size: 14px;
          color: #A0856A;
          margin: 0;
        }

        .chat-list-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          gap: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #EDE6DC;
          border-top-color: #C8A87A;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .chat-list-empty {
          text-align: center;
          padding: 60px 24px;
        }

        .chat-list-empty svg {
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .chat-list-empty h3 {
          font-size: 18px;
          color: #B8A898;
          margin: 0 0 8px 0;
        }

        .chat-list-empty p {
          font-size: 14px;
          color: #D4C5B0;
          margin: 0;
        }

        .chat-list {
          max-height: 500px;
          overflow-y: auto;
        }

        .chat-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid #F0ECE6;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .chat-item:hover {
          background: #FAF7F3;
        }

        .chat-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C8A87A, #A0856A);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
          flex-shrink: 0;
        }

        .chat-info {
          flex: 1;
        }

        .chat-name {
          font-size: 16px;
          font-weight: 600;
          color: #2C2318;
          margin-bottom: 6px;
        }

        .chat-details {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #A0856A;
        }

        .chat-date {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .chat-arrow {
          color: #C8A87A;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .chat-item:hover .chat-arrow {
          opacity: 1;
        }
      `}</style>
    </>
  );
};

export default PsychiatristChatList;