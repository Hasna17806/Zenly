import { useParams } from "react-router-dom";
import SessionChat from "./SessionChat";
import PsychiatristSidebar from "../components/PsychiatristSidebar";

const PsychiatristSession = () => {

  const { appointmentId } = useParams();

  return (
    <div style={{ display: "flex" }}>
      <PsychiatristSidebar />

      <div style={{ flex: 1, padding: "30px" }}>
        <h2>Consultation Session</h2>

        <SessionChat appointmentId={appointmentId} />
      </div>
    </div>
  );
};

export default PsychiatristSession;