import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "./Modal";

const SessionButton = ({ appointmentId, psychiatristName }) => {
  const [showSession, setShowSession] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/appointments/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointment(res.data);
      } catch (error) {
        console.error("Error fetching appointment:", error);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  if (!appointment || appointment.status !== "Accepted") {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowSession(true)}
        className="session-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Join Live Session
      </button>

      {showSession && (
        <Modal onClose={() => setShowSession(false)} title={`Consultation with ${psychiatristName}`}>
          <SessionChat appointmentId={appointmentId} onClose={() => setShowSession(false)} />
        </Modal>
      )}

      <style>{`
        .session-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #5A9E6A;
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .session-btn:hover {
          background: #4A8E5A;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(90,158,106,0.3);
        }
      `}</style>
    </>
  );
};

export default SessionButton;