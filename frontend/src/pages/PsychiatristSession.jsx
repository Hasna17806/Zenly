import { useParams } from "react-router-dom";
import SessionChat from "./SessionChat";
import PsychiatristLayout from "../components/PsychiatristLayout";

const PsychiatristSession = () => {
  const { appointmentId } = useParams();

  return (
    <PsychiatristLayout>
      <div className="session-container">
        <div className="session-header">
          <h2 className="session-title">Consultation Session</h2>
          <p className="session-sub">Live chat with patient</p>
        </div>
        <SessionChat appointmentId={appointmentId} />
      </div>

      <style>{`
        .session-container {
          flex: 1;
          padding: 48px 56px;
          overflow-y: auto;
        }
        
        .session-header {
          margin-bottom: 32px;
        }
        
        .session-title {
          font-size: 32px;
          font-weight: 700;
          color: #eef2f5;
          letter-spacing: -0.02em;
          margin: 0 0 8px 0;
        }
        
        .session-sub {
          font-size: 16px;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .session-container {
            padding: 32px 24px;
          }
          .session-title {
            font-size: 28px;
          }
        }
      `}</style>
    </PsychiatristLayout>
  );
};

export default PsychiatristSession;