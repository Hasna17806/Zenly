import { useState, useEffect } from "react";
import axios from "axios";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("adminToken");

  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/payments/admin/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments(res.data.payments);
      setSummary(res.data.summary);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const statusStyle = {
    completed: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", color: "#6ee7b7" },
    pending:   { bg: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.25)",  color: "#fbbf24" },
    failed:    { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)",   color: "#f87171" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .py-wrap {
          min-height: 100vh;
          background: #08080a;
          font-family: 'Inter', sans-serif;
          padding: 36px 32px 64px;
        }
        .py-inner { max-width: 1200px; margin: 0 auto; }

        /* ── Header ── */
        .py-header {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 28px;
          animation: rise 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .py-hdr-icon {
          width: 50px; height: 50px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(124,58,237,0.4);
          flex-shrink: 0;
        }
        .py-hdr-icon svg { width: 24px; height: 24px; }
        .py-title { font-size: 21px; font-weight: 700; color: #f5f5f5; letter-spacing: -0.025em; }
        .py-sub   { font-size: 13px; color: #52525b; margin-top: 3px; }

        /* ── Summary Cards ── */
        .py-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
          animation: rise 0.55s 0.05s cubic-bezier(0.16,1,0.3,1) both;
        }
        .py-stat {
          background: #111115;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px 22px;
          position: relative; overflow: hidden;
        }
        .py-stat::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #7c3aed, #4f46e5);
        }
        .py-stat-icon { font-size: 20px; margin-bottom: 12px; display: block; }
        .py-stat-label {
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.09em;
          text-transform: uppercase; color: #52525b; margin-bottom: 8px;
        }
        .py-stat-val {
          font-size: 26px; font-weight: 700; color: #f5f5f5;
          letter-spacing: -0.03em; line-height: 1;
        }
        .py-stat-val.green { color: #6ee7b7; }
        .py-stat-val.purple { color: #c4b5fd; }
        .py-stat-val.amber  { color: #fbbf24; }

        /* ── Table Card ── */
        .py-table-card {
          background: #111115;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.5);
          animation: rise 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both;
        }

        .py-table-top {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .py-table-title { font-size: 14px; font-weight: 600; color: #e4e4e7; }
        .py-count-pill {
          font-size: 11.5px; font-weight: 600;
          background: rgba(124,58,237,0.12); color: #a78bfa;
          padding: 4px 12px; border-radius: 20px;
          border: 1px solid rgba(124,58,237,0.25);
        }

        .py-table-wrap { overflow-x: auto; }

        table { width: 100%; border-collapse: collapse; }
        thead tr { border-bottom: 1px solid rgba(255,255,255,0.05); }
        th {
          padding: 12px 18px; text-align: left;
          font-size: 10.5px; font-weight: 600;
          color: #52525b; letter-spacing: 0.08em; text-transform: uppercase;
          white-space: nowrap;
        }
        tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: rgba(124,58,237,0.04); }
        td {
          padding: 14px 18px; font-size: 13.5px;
          color: #a1a1aa; vertical-align: middle;
          white-space: nowrap;
        }

        /* cell variants */
        .td-date { color: #71717a; font-size: 12.5px; }
        .td-name { color: #e4e4e7; font-weight: 500; }
        .td-doctor { color: #a1a1aa; }
        .td-amount {
          color: #f5f5f5; font-weight: 600;
          font-size: 14px; letter-spacing: -0.01em;
        }
        .td-commission { color: #c4b5fd; font-weight: 500; }
        .td-payout { color: #6ee7b7; font-weight: 500; }

        .status-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11.5px; font-weight: 600; letter-spacing: 0.03em;
          padding: 4px 11px; border-radius: 20px; border: 1px solid;
          text-transform: capitalize;
        }
        .status-dot {
          width: 5px; height: 5px; border-radius: 50%;
        }

        /* patient avatar */
        .td-user { display: flex; align-items: center; gap: 10px; }
        .td-avatar {
          width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
          background: rgba(124,58,237,0.18);
          border: 1px solid rgba(124,58,237,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #c4b5fd;
        }

        /* loading */
        .py-loading {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 100vh; gap: 16px;
          background: #08080a; color: #52525b;
          font-family: 'Inter', sans-serif; font-size: 14px;
        }
        .py-spinner {
          width: 28px; height: 28px;
          border: 3px solid rgba(255,255,255,0.06);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* empty */
        .py-empty {
          padding: 60px; text-align: center;
          color: #3f3f46; font-size: 14px;
        }
        .py-empty-icon { font-size: 38px; display: block; margin-bottom: 12px; opacity: 0.25; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes rise {
          from { opacity:0; transform:translateY(22px) scale(0.97); }
          to   { opacity:1; transform:none; }
        }

        @media (max-width: 900px) {
          .py-stats { grid-template-columns: 1fr 1fr; }
          .py-wrap  { padding: 20px 16px 48px; }
        }
        @media (max-width: 560px) {
          .py-stats { grid-template-columns: 1fr; }
        }
      `}</style>

      {loading ? (
        <div className="py-loading">
          <div className="py-spinner" />
          Loading payments…
        </div>
      ) : (
        <div className="py-wrap">
          <div className="py-inner">

            {/* ── Header ── */}
            <div className="py-header">
              <div className="py-hdr-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="3"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <div>
                <div className="py-title">Payments Overview</div>
                <div className="py-sub">Track revenue, commissions and payouts</div>
              </div>
            </div>

            {/* ── Stats ── */}
            <div className="py-stats">
              {[
                { icon: "💰", label: "Total Revenue",        val: `₹${summary.totalAmount?.toFixed(2) || "0.00"}`,                   cls: "green"  },
                { icon: "🏦", label: "Admin Commission (10%)",val: `₹${summary.totalCommission?.toFixed(2) || "0.00"}`,               cls: "purple" },
                { icon: "👨‍⚕️", label: "Psychiatrist Payouts", val: `₹${summary.totalPsychiatristEarnings?.toFixed(2) || "0.00"}`,    cls: "amber"  },
                { icon: "🧾", label: "Total Transactions",    val: summary.totalPayments || 0,                                        cls: ""       },
              ].map(s => (
                <div key={s.label} className="py-stat">
                  <span className="py-stat-icon">{s.icon}</span>
                  <div className="py-stat-label">{s.label}</div>
                  <div className={`py-stat-val ${s.cls}`}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* ── Table ── */}
            <div className="py-table-card">
              <div className="py-table-top">
                <span className="py-table-title">All Transactions</span>
                <span className="py-count-pill">{payments.length} records</span>
              </div>

              {payments.length === 0 ? (
                <div className="py-empty">
                  <span className="py-empty-icon">🧾</span>
                  No payment records found
                </div>
              ) : (
                <div className="py-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Patient</th>
                        <th>Psychiatrist</th>
                        <th>Amount</th>
                        <th>Commission</th>
                        <th>Dr. Gets</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => {
                        const ss = statusStyle[payment.status] || statusStyle.pending;
                        const initials = payment.userId?.name
                          ?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
                        return (
                          <tr key={payment._id}>
                            <td className="td-date">
                              {new Date(payment.createdAt).toLocaleDateString("en-US", {
                                year: "numeric", month: "short", day: "numeric"
                              })}
                            </td>
                            <td>
                              <div className="td-user">
                                <div className="td-avatar">{initials}</div>
                                <span className="td-name">{payment.userId?.name || "N/A"}</span>
                              </div>
                            </td>
                            <td className="td-doctor">
                              Dr. {payment.psychiatristId?.name?.replace(/^Dr\.?\s*/i, "") || "N/A"}
                            </td>
                            <td className="td-amount">₹{payment.amount}</td>
                            <td className="td-commission">₹{payment.adminCommission}</td>
                            <td className="td-payout">₹{payment.psychiatristAmount}</td>
                            <td>
                              <span className="status-pill" style={{
                                background: ss.bg,
                                borderColor: ss.border,
                                color: ss.color,
                              }}>
                                <span className="status-dot" style={{ background: ss.color }} />
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default AdminPayments;