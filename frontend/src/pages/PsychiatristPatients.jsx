import PsychiatristLayout from "../components/PsychiatristLayout";
import PatientList from "../components/PatientList";

const PsychiatristPatients = () => {
  return (
    <PsychiatristLayout>
      <div className="patients-page">
        <PatientList />
      </div>
      <style>{`
        .patients-page {
          flex: 1;
          padding: 48px 56px;
          overflow-y: auto;
        }
        @media (max-width: 768px) {
          .patients-page {
            padding: 32px 24px;
          }
        }
      `}</style>
    </PsychiatristLayout>
  );
};

export default PsychiatristPatients;