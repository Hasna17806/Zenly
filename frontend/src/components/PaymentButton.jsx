import { useState, useEffect } from "react";
import API from "../api/axios";

const PaymentButton = ({ appointmentId, psychiatristName, amount, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checking, setChecking] = useState(true);
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const checkPaymentStatus = async () => {
    try {
      const res = await API.get(`/payments/status/${appointmentId}`);
      console.log("Payment status check:", res.data);
      setPaymentStatus(res.data.status);
      if (res.data.status === "completed") {
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkPaymentStatus();
    
    // Check for URL parameter indicating successful payment return
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get("payment_success");
    if (paymentSuccess === "true") {
      // Re-check payment status after returning from PayPal
      setTimeout(() => {
        checkPaymentStatus();
      }, 1000);
    }
  }, [appointmentId]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await API.post("/payments/create-order", { appointmentId });
      localStorage.setItem("pendingPaymentId", res.data.paymentId);
      window.location.href = res.data.approvalUrl;
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.response?.data?.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="payment-button-container">
        <button className="pay-now-btn" disabled>
          <div className="loading-spinner-small"></div>
          Checking...
        </button>
      </div>
    );
  }

  if (paymentStatus === "completed") {
    return (
      <div className="payment-completed">
        <span className="paid-badge">✓ Payment Completed</span>
      </div>
    );
  }

  return (
    <div className="payment-button-container">
      <button className="pay-now-btn" onClick={handlePayment} disabled={loading}>
        {loading ? (
          <div className="loading-spinner-small"></div>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10h18M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
              <path d="M16 14a4 4 0 1 0-8 0" />
            </svg>
            Pay ₹{amount} via PayPal
          </>
        )}
      </button>

      <style>{`
        .payment-button-container {
          display: inline-block;
        }
        .pay-now-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #0070ba;
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pay-now-btn:hover:not(:disabled) {
          background: #003087;
          transform: translateY(-1px);
        }
        .pay-now-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .payment-completed {
          display: inline-block;
        }
        .paid-badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: #e8f5e9;
          color: #2e7d32;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 500;
        }
        .loading-spinner-small {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentButton;