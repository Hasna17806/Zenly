import { useState, useEffect, useRef, useMemo } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const SessionChat = ({ appointmentId, onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ---------------- TOKEN ----------------
  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("psychiatristToken")
    );
  };

  const token = getToken();

  // ---------------- CURRENT USER ROLE ----------------
  const getCurrentUserRole = () => {
    if (localStorage.getItem("psychiatristToken")) {
      return "psychiatrist";
    }
    if (localStorage.getItem("token") || sessionStorage.getItem("token")) {
      return "student";
    }
    return "student";
  };

  const currentUserRole = getCurrentUserRole();

  // ---------------- CURRENT USER ID ----------------
  const getCurrentUserId = () => {
  try {
    if (!token) return null;

    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    return decoded.id || decoded._id || null;
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
};

const currentUserId = useMemo(() => getCurrentUserId(), [token]);

  useEffect(() => {
    console.log("=== SessionChat Debug Info ===");
    console.log("Current User Role:", currentUserRole);
    console.log("Current User ID:", currentUserId);
    console.log("Token exists:", !!token);
    console.log("Appointment ID:", appointmentId);
    console.log("==============================");
  }, [currentUserRole, currentUserId, token, appointmentId]);

  // ---------------- FETCH MESSAGES ----------------
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/chat/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Fetched messages:", res.data);
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();

    socket.emit("joinRoom", appointmentId);

    const handleReceiveMessage = (data) => {
      console.log("Message received:", data);

      setMessages((prev) => {
        const exists = prev.some(
          (msg) =>
            msg._id === data._id ||
            (msg.isTemp &&
              msg.message === data.message &&
              msg.senderRole === data.senderRole)
        );

        if (!exists) {
          return [...prev, data];
        }
        return prev.map((msg) => (msg.isTemp && msg.message === data.message ? data : msg));
      });
    };

    const handleUserTyping = ({ isTyping: typing }) => {
      setUserTyping(typing);
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userTyping", handleUserTyping);

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userTyping", handleUserTyping);
      socket.emit("leaveRoom", appointmentId);
    };
  }, [appointmentId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, userTyping]);

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = async () => {
    if (message.trim() === "" || sending) return;

    console.log("=== Sending Message ===");
    console.log("Message:", message);
    console.log("Current User Role:", currentUserRole);
    console.log("Current User ID:", currentUserId);

    setSending(true);

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      message: message.trim(),
      senderRole: currentUserRole,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/chat/send",
        { appointmentId, message: message.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Message saved successfully:", response.data);

      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempMessage._id ? response.data : msg))
      );

      socket.emit("sendMessage", {
        roomId: appointmentId,
        message: response.data,
      });

      setMessage("");

      setIsTyping(false);
      socket.emit("typing", { roomId: appointmentId, isTyping: false });
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error response data:", error.response?.data);

      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
      alert(
        `Failed to send message: ${
          error.response?.data?.message || "Please try again."
        }`
      );
    } finally {
      setSending(false);
    }
  };

  // ---------------- TYPING ----------------
  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { roomId: appointmentId, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typing", { roomId: appointmentId, isTyping: false });
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !sending) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ---------------- FIXED SENDER CHECK ----------------
  const isMessageFromCurrentUser = (msg) => {
    // 1. BEST: compare senderId
    if (currentUserId && msg.senderId) {
      return String(msg.senderId) === String(currentUserId);
    }

    // 2. fallback if backend returns sender object
    if (currentUserId && msg.sender?._id) {
      return String(msg.sender._id) === String(currentUserId);
    }

    // 3. fallback to role if no senderId exists
    return msg.senderRole === currentUserRole;
  };

  const getAvatarName = (role) => {
    if (role === "psychiatrist") return "Dr";
    return "P";
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
          <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}>
            You are: {currentUserRole === "psychiatrist" ? "Doctor" : "Patient"}
          </p>
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
            <p>Start the conversation</p>
          </div>
        )}

        {messages.map((m, i) => {
          const isFromMe = isMessageFromCurrentUser(m);

          return (
            <div key={m._id || i} className={`message-row ${isFromMe ? "me" : "other"}`}>
              {!isFromMe && (
                <div className="avatar">
                  {getAvatarName(m.senderRole)}
                </div>
              )}

              <div className={`message-bubble ${isFromMe ? "me" : "other"}`}>
                <div className="message-text">{m.message}</div>
                <div className="message-time">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {m.isTemp && " (sending...)"}
                </div>
              </div>

              {isFromMe && (
                <div className="avatar me">
                  {currentUserRole === "psychiatrist" ? "Dr" : "Me"}
                </div>
              )}
            </div>
          );
        })}

        {userTyping && (
          <div className="typing-indicator">
            <span>Someone is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder="Type your message..."
          value={message}
          onChange={handleTyping}
          onKeyDown={handleKeyPress}
          rows="1"
          disabled={sending}
        />

        <button
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={sending || !message.trim()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          {sending ? "Sending..." : "Send"}
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

        .message-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          animation: fadeIn 0.3s ease;
        }

        .message-row.me {
          justify-content: flex-end;
        }

        .message-row.other {
          justify-content: flex-start;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C8A87A, #A0856A);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .avatar.me {
          background: #2C2318;
          order: 2;
        }

        .message-bubble {
          max-width: 65%;
          padding: 10px 14px;
          border-radius: 18px;
        }

        .message-bubble.me {
          background: #2C2318;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-bubble.other {
          background: white;
          color: #2C2318;
          border: 1px solid #E8D5BE;
          border-bottom-left-radius: 4px;
        }

        .message-text {
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .message-time {
          font-size: 10px;
          margin-top: 5px;
          opacity: 0.6;
        }

        .typing-indicator {
          padding: 8px 12px;
          font-size: 12px;
          color: #A0856A;
          font-style: italic;
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

        .chat-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
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

        .chat-send-btn:hover:not(:disabled) {
          background: #1A1510;
        }

        .chat-send-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .chat-header { padding: 16px 20px; }
          .chat-messages { padding: 16px 20px; }
          .chat-input-area { padding: 12px 20px; }
          .message-bubble { max-width: 80%; }
          .chat-send-btn { padding: 10px 20px; }
          .avatar { width: 28px; height: 28px; font-size: 10px; }
        }
      `}</style>
    </div>
  );
};

export default SessionChat;