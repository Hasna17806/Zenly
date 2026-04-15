import { useState, useEffect } from "react";
import axios from "axios";
import PsychiatristLayout from "../components/PsychiatristLayout";

const PsychiatristEarnings = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("psychiatristToken");

  const fetchEarnings = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/payments/psychiatrist/earnings",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments(res.data.payments);
      setSummary(res.data.summary);
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <PsychiatristLayout>
        <div className="loading">Loading earnings...</div>
      </PsychiatristLayout>
    );
  }

  return (
    <PsychiatristLayout>
      <div className="earnings-container">
        <div className="earnings-header">
          <h2>My Earnings</h2>
          <p>Track your consultation payments</p>
        </div>

        <div className="earnings-summary">
          <div className="summary-box">
            <span className="summary-label">Total Earned</span>
            <span className="summary-value">₹{summary.totalEarned?.toFixed(2) || 0}</span>
          </div>
          <div className="summary-box">
            <span className="summary-label">Total Sessions</span>
            <span className="summary-value">{summary.totalPayments || 0}</span>
          </div>
          <div className="summary-box">
            <span className="summary-label">Platform Fee (10%)</span>
            <span className="summary-value">₹{summary.totalCommission?.toFixed(2) || 0}</span>
          </div>
        </div>

        <div className="payments-list">
          <h3>Payment History</h3>
          {payments.length === 0 ? (
            <p className="no-payments">No payments yet</p>
          ) : (
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Amount</th>
                  <th>Platform Fee</th>
                  <th>You Receive</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td>{payment.userId?.name || "N/A"}</td>
                    <td>₹{payment.amount}</td>
                    <td>₹{payment.adminCommission}</td>
                    <td>₹{payment.psychiatristAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        .earnings-container {
          padding: 32px;
        }
        .earnings-header h2 {
          font-size: 28px;
          color: #eef2f5;
          margin-bottom: 8px;
        }
        .earnings-header p {
          color: rgba(255,255,255,0.4);
          margin-bottom: 32px;
        }
        .earnings-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .summary-box {
          background: #111d2b;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px;
        }
        .summary-label {
          display: block;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 8px;
        }
        .summary-value {
          font-size: 28px;
          font-weight: 700;
          color: #64b4c8;
        }
        .payments-list h3 {
          font-size: 18px;
          color: #eef2f5;
          margin-bottom: 20px;
        }
        .payments-table {
          width: 100%;
          background: #111d2b;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
        }
        .payments-table th,
        .payments-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .payments-table th {
          background: rgba(0,0,0,0.2);
          color: rgba(255,255,255,0.6);
          font-weight: 600;
        }
        .payments-table td {
          color: #eef2f5;
        }
        .no-payments {
          text-align: center;
          padding: 40px;
          color: rgba(255,255,255,0.4);
        }
        .loading {
          text-align: center;
          padding: 60px;
          color: rgba(255,255,255,0.4);
        }
      `}</style>
    </PsychiatristLayout>
  );
};

export default PsychiatristEarnings;