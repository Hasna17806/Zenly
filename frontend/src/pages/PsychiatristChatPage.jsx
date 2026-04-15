import PsychiatristLayout from "../components/PsychiatristLayout";
import PsychiatristChatList from "../components/PsychiatristChatList";

const PsychiatristChatPage = () => {
  return (
    <PsychiatristLayout>
      <div className="chat-page-container">
        <div className="chat-page-header">
          <div className="chat-page-title-section">
            <div className="chat-page-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="chat-page-title">Messages</h1>
              <p className="chat-page-subtitle">Connect with your patients</p>
            </div>
          </div>
        </div>
        <PsychiatristChatList />
      </div>
      
      <style>{`
        .chat-page-container {
          flex: 1;
          padding: 32px 40px;
          overflow-y: auto;
          background: linear-gradient(135deg, #0a0e17 0%, #0f1520 100%);
          min-height: calc(100vh - 64px);
        }
        
        .chat-page-header {
          margin-bottom: 32px;
        }
        
        .chat-page-title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .chat-page-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(124,58,237,0.3);
        }
        
        .chat-page-title {
          font-size: 28px;
          font-weight: 700;
          color: #eef2f5;
          letter-spacing: -0.02em;
          margin: 0 0 4px 0;
        }
        
        .chat-page-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          font-weight: 400;
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .chat-page-container {
            padding: 24px 20px;
          }
          .chat-page-title {
            font-size: 24px;
          }
          .chat-page-icon {
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
    </PsychiatristLayout>
  );
};

export default PsychiatristChatPage;