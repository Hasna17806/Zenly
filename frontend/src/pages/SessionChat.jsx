import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const SessionChat = ({ appointmentId }) => {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const bottomRef = useRef(null);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("psychiatristToken");

  const role = localStorage.getItem("role");

  /* LOAD CHAT HISTORY FROM MONGODB */

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/chat/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessages(res.data);

    } catch (error) {
      console.error(error);
    }
  };

  /* JOIN ROOM + LISTEN */

  useEffect(() => {

    fetchMessages();

    socket.emit("joinRoom", appointmentId);

    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receiveMessage", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage);
    };

  }, [appointmentId]);

  /* AUTO SCROLL */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* SEND MESSAGE */

  const sendMessage = async () => {

    if (message.trim() === "") return;

    try {

      const res = await axios.post(
        "http://localhost:5000/api/chat/send",
        {
          appointmentId,
          message
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const savedMessage = res.data;

      socket.emit("sendMessage", {
        roomId: appointmentId,
        message: savedMessage
      });

      setMessage("");

    } catch (error) {
      console.error(error);
    }

  };

  return (

    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        height: "80vh"
      }}
    >

      <h2>Session Chat</h2>

      {/* CHAT BOX */}

      <div
        style={{
          flex: 1,
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "15px",
          overflowY: "auto",
          background: "#f9fafb",
          marginBottom: "10px"
        }}
      >

        {messages.length === 0 && (
          <p style={{ color: "gray" }}>Start the conversation...</p>
        )}

        {messages.map((m, i) => {

          const isMe = m.senderRole === role;

          return (

            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: "8px"
              }}
            >

              <div
                style={{
                  background: isMe ? "#2563eb" : "#e5e7eb",
                  color: isMe ? "white" : "black",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  maxWidth: "60%"
                }}
              >

                <div style={{ fontSize: "14px" }}>
                  {m.message}
                </div>

                <div
                  style={{
                    fontSize: "10px",
                    marginTop: "4px",
                    opacity: 0.7
                  }}
                >
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>

              </div>

            </div>

          );

        })}

        <div ref={bottomRef} />

      </div>

      {/* INPUT */}

      <div style={{ display: "flex", gap: "10px" }}>

        <input
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={sendMessage}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "10px 20px",
            cursor: "pointer"
          }}
        >
          Send
        </button>

      </div>

    </div>

  );

};

export default SessionChat;