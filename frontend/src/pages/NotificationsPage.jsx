import { useEffect, useState } from "react";
import axios from "axios";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/notifications/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c10", color: "#fff", padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700" }}>Notifications</h1>
          <p style={{ color: "#9ca3af", marginTop: "6px" }}>Stay updated with your appointment activity.</p>
        </div>

        <button
          onClick={markAllAsRead}
          style={{
            background: "#7c3aed",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          Mark All as Read
        </button>
      </div>

      <div style={{ display: "grid", gap: "16px" }}>
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div
              key={item._id}
              style={{
                background: item.isRead ? "#161a22" : "#1f1630",
                border: item.isRead ? "1px solid #2a2f3a" : "1px solid #7c3aed",
                borderRadius: "14px",
                padding: "18px 20px"
              }}
            >
              <h3 style={{ marginBottom: "6px", fontSize: "16px" }}>{item.title}</h3>
              <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "8px" }}>{item.message}</p>
              <small style={{ color: "#6b7280" }}>
                {new Date(item.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        ) : (
          <div style={{ color: "#6b7280", textAlign: "center", padding: "60px 0" }}>
            No notifications yet 🔔
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;