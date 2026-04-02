import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ProgressPage = () => {

  const [data, setData] = useState(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/completed-challenges/progress",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setData(res.data);

    } catch (error) {
      console.error(error);
    }
  };

  if (!data) return <p style={{ padding: "50px" }}>Loading...</p>;

  return (
    <>
      <Navbar />

      <div style={{ padding: "40px" }}>

        <h1>Your Progress 📊</h1>

        {/* Stats */}
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          
          <div className="card">
            <h3>Total Completed</h3>
            <p>{data.total}</p>
          </div>

          <div className="card">
            <h3>Completed Today</h3>
            <p>{data.today}</p>
          </div>

        </div>

        {/* Category Stats */}
        <h2 style={{ marginTop: "30px" }}>Category Progress</h2>

        <div style={{ marginTop: "10px" }}>
          {Object.entries(data.categoryStats).map(([cat, count]) => (
            <div key={cat}>
              <strong>{cat}</strong>: {count}
            </div>
          ))}
        </div>

        {/* Recent */}
        <h2 style={{ marginTop: "30px" }}>Recent Activity</h2>

        {data.completed.slice(-5).map(c => (
          <div key={c._id} style={{ marginBottom: "10px" }}>
            ✅ {c.challenge?.title}
          </div>
        ))}

      </div>

      <Footer />
    </>
  );
};

export default ProgressPage;