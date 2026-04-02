import PsychiatristSidebar from "./PsychiatristSidebar";

const PsychiatristLayout = ({ children }) => {
  return (
    <>
      <style>{`
        .psychiatrist-layout {
          display: flex;
          min-height: 100vh;
        }
        
        .psychiatrist-content {
          flex: 1;
          margin-left: 260px;
          background: #0b1520; /* Change this to your desired color */
          min-height: 100vh;
        }
        
        @media (max-width: 768px) {
          .psychiatrist-content {
            margin-left: 220px;
          }
        }
      `}</style>
      
      <div className="psychiatrist-layout">
        <PsychiatristSidebar />
        <div className="psychiatrist-content">
          {children}
        </div>
      </div>
    </>
  );
};

export default PsychiatristLayout;