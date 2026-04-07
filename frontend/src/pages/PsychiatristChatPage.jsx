import PsychiatristLayout from "../components/PsychiatristLayout";
import PsychiatristChatList from "../components/PsychiatristChatList";

const PsychiatristChatPage = () => {
  return (
    <PsychiatristLayout>
      <div className="chat-page-container">
        <PsychiatristChatList />
      </div>
      
      <style>{`
        .chat-page-container {
          flex: 1;
          padding: 48px 56px;
          overflow-y: auto;
        }
        
        @media (max-width: 768px) {
          .chat-page-container {
            padding: 32px 24px;
          }
        }
      `}</style>
    </PsychiatristLayout>
  );
};

export default PsychiatristChatPage;