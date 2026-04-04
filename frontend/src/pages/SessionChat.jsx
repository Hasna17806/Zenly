import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const SessionChat = ({ appointmentId, onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const bottomRef = useRef(null);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const role = localStorage.getItem("role") || "student";

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/chat/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();

    socket.emit("joinRoom", appointmentId);

    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receiveMessage", handleMessage);
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    return () => {
      socket.off("receiveMessage", handleMessage);
      socket.emit("leaveRoom", appointmentId);
    };
  }, [appointmentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (message.trim() === "") return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/chat/send",
        { appointmentId, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const savedMessage = res.data;
      socket.emit("sendMessage", { roomId: appointmentId, message: savedMessage });
      setMessage("");
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

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-status">
            <span className={`status-dot ${isConnected ? "online" : "offline"}`}></span>
            <span>{isConnected ? "Connected" : "Connecting..."}</span>
          </div>
          <h3>Live Consultation Session</h3>
        </div>
        {onClose && (
          <button className="chat-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C8A87A" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>Start the conversation with your doctor</p>
          </div>
        )}
        
        {messages.map((m, i) => {
          const isMe = m.senderRole === role;
          return (
            <div key={i} className={`message ${isMe ? "outgoing" : "incoming"}`}>
              <div className="message-bubble">
                <div className="message-text">{m.message}</div>
                <div className="message-time">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          rows="1"
        />
        <button className="chat-send-btn" onClick={sendMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Send
        </button>
      </div>

      <style>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }

        .chat-header {
          padding: 20px 24px;
          background: #2C2318;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .chat-header-info h3 {
          margin: 8px 0 0 0;
          font-size: 18px;
          font-weight: 500;
        }

        .chat-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          opacity: 0.8;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4CAF50;
          animation: pulse 2s infinite;
        }

        .status-dot.offline {
          background: #f44336;
          animation: none;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .chat-close {
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .chat-close:hover {
          background: rgba(255,255,255,0.2);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
          background: #F8F6F3;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-empty {
          text-align: center;
          padding: 60px 20px;
          color: #C8A87A;
        }

        .chat-empty svg {
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .chat-empty p {
          font-size: 14px;
          margin: 0;
        }

        .message {
          display: flex;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.outgoing {
          justify-content: flex-end;
        }

        .message.incoming {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 20px;
          position: relative;
        }

        .message.outgoing .message-bubble {
          background: #2C2318;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.incoming .message-bubble {
          background: white;
          color: #2C2318;
          border: 1px solid #E8D5BE;
          border-bottom-left-radius: 4px;
        }

        .message-text {
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .message-time {
          font-size: 10px;
          margin-top: 6px;
          opacity: 0.6;
        }

        .chat-input-area {
          padding: 16px 24px;
          background: white;
          border-top: 1px solid #EDE6DC;
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .chat-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #E8D5BE;
          border-radius: 24px;
          font-family: inherit;
          font-size: 14px;
          resize: none;
          outline: none;
          transition: border-color 0.2s;
          max-height: 100px;
        }

        .chat-input:focus {
          border-color: #C8A87A;
        }

        .chat-send-btn {
          padding: 12px 24px;
          background: #2C2318;
          color: white;
          border: none;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }

        .chat-send-btn:hover {
          background: #1A1510;
        }

        .chat-send-btn:active {
          transform: scale(0.98);
        }

        @media (max-width: 768px) {
          .chat-header { padding: 16px 20px; }
          .chat-messages { padding: 16px 20px; }
          .chat-input-area { padding: 12px 20px; }
          .message-bubble { max-width: 85%; }
          .chat-send-btn { padding: 10px 20px; }
        }
      `}</style>
    </div>
  );
};

export default SessionChat;