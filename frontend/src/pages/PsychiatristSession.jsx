import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import PsychiatristLayout from "../components/PsychiatristLayout";

const PsychiatristSession = () => {
  const { appointmentId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState(null);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("psychiatristToken");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/chat/messages/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages);
      setPatientInfo(res.data.patientInfo);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/chat/send`,
        {
          appointmentId,
          message: newMessage,
          sender: "psychiatrist"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (msgDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <PsychiatristLayout>
      <div className="session-container">
        <div className="session-header">
          <div className="session-patient-info">
            <div className="session-avatar">
              {getInitials(patientInfo?.name)}
            </div>
            <div>
              <h2 className="session-title">{patientInfo?.name || "Patient"}</h2>
              <p className="session-sub">
                {typing ? (
                  <span className="typing-indicator">Typing...</span>
                ) : (
                  "Online"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="messages-container">
          {loading ? (
            <div className="loading-messages">
              <div className="spinner" />
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-messages">
              <div className="empty-icon">💬</div>
              <p>No messages yet</p>
              <p className="empty-sub">Start the conversation with your patient</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const showDate = idx === 0 || 
                  new Date(msg.createdAt).toDateString() !== new Date(messages[idx-1]?.createdAt).toDateString();
                
                return (
                  <div key={msg._id}>
                    {showDate && (
                      <div className="date-divider">
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>
                    )}
                    <div className={`message-wrapper ${msg.sender === "psychiatrist" ? "outgoing" : "incoming"}`}>
                      <div className="message-bubble">
                        <p className="message-text">{msg.message}</p>
                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="message-input-container">
          <div className="message-input-wrapper">
            <textarea
              className="message-input"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button 
              className="send-button" 
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .session-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #0a0e17 0%, #0f1520 100%);
          height: calc(100vh - 64px);
        }
        
        .session-header {
          padding: 24px 32px;
          background: #111827;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }
        
        .session-patient-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .session-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          color: white;
        }
        
        .session-title {
          font-size: 20px;
          font-weight: 700;
          color: #eef2f5;
          margin: 0 0 4px 0;
        }
        
        .session-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }
        
        .typing-indicator {
          color: #7c3aed;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .date-divider {
          text-align: center;
          margin: 16px 0;
          position: relative;
        }
        
        .date-divider span {
          background: rgba(255,255,255,0.08);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          color: rgba(255,255,255,0.5);
        }
        
        .message-wrapper {
          display: flex;
          animation: fadeIn 0.3s ease;
        }
        
        .message-wrapper.incoming {
          justify-content: flex-start;
        }
        
        .message-wrapper.outgoing {
          justify-content: flex-end;
        }
        
        .message-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 18px;
          position: relative;
        }
        
        .incoming .message-bubble {
          background: #1f2937;
          border-bottom-left-radius: 4px;
        }
        
        .outgoing .message-bubble {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border-bottom-right-radius: 4px;
        }
        
        .message-text {
          font-size: 14px;
          line-height: 1.5;
          color: #eef2f5;
          margin: 0 0 4px 0;
          word-wrap: break-word;
        }
        
        .message-time {
          font-size: 10px;
          color: rgba(255,255,255,0.5);
          display: block;
          text-align: right;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .message-input-container {
          padding: 20px 32px;
          background: #111827;
          border-top: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }
        
        .message-input-wrapper {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        
        .message-input {
          flex: 1;
          background: #1f2937;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 12px 16px;
          font-size: 14px;
          color: #eef2f5;
          resize: none;
          outline: none;
          font-family: inherit;
          max-height: 120px;
          transition: all 0.2s;
        }
        
        .message-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 2px rgba(124,58,237,0.2);
        }
        
        .message-input::placeholder {
          color: rgba(255,255,255,0.3);
        }
        
        .send-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        
        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(124,58,237,0.4);
        }
        
        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .loading-messages {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        .empty-messages {
          text-align: center;
          padding: 80px 20px;
          color: rgba(255,255,255,0.4);
        }
        
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        
        .empty-messages p {
          margin: 8px 0;
        }
        
        .empty-sub {
          font-size: 13px;
          opacity: 0.7;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .session-header {
            padding: 20px 20px;
          }
          .messages-container {
            padding: 20px;
          }
          .message-input-container {
            padding: 16px 20px;
          }
          .message-bubble {
            max-width: 85%;
          }
        }
      `}</style>
    </PsychiatristLayout>
  );
};

export default PsychiatristSession;