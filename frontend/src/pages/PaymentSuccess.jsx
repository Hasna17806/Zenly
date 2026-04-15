import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("token");
    
    console.log("Payment success params:", { orderId });
    
    if (orderId) {
      capturePayment(orderId);
    } else {
      setLoading(false);
    }
  }, [location]);

  const capturePayment = async (orderId) => {
    try {
      const pendingPaymentId = localStorage.getItem("pendingPaymentId");
      
      const response = await axios.post(
        "http://localhost:5000/api/payments/capture-order",
        { orderId, paymentId: pendingPaymentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Capture response:", response.data);
      
      if (response.data.success) {
        setPaymentDetails(response.data.payment);
        localStorage.removeItem("pendingPaymentId");
      }
    } catch (error) {
      console.error("Error capturing payment:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToAppointments = () => {
    // Use window.location.href to force a full page reload with refresh flag
    window.location.href = "/my-psychiatrists?payment_success=true";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="payment-loading">
          <div className="spinner"></div>
          <p>Processing your payment...</p>
        </div>
        <Footer />
        <style>{`
          .payment-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #f0f0f0;
            border-top-color: #A0856A;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .payment-loading p {
            color: #666;
            font-size: 16px;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="payment-success-container">
        <div className="success-card">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          
          <h1>Payment Successful! 🎉</h1>
          <p>Your appointment has been confirmed and payment has been received.</p>
          
          {paymentDetails && (
            <div className="payment-details">
              <div className="detail-row">
                <span>Amount Paid:</span>
                <strong>₹{paymentDetails.amount}</strong>
              </div>
              <div className="detail-row">
                <span>Transaction ID:</span>
                <strong>{paymentDetails.paypalCaptureId?.slice(0, 20)}...</strong>
              </div>
              <div className="detail-row">
                <span>Date:</span>
                <strong>{new Date(paymentDetails.createdAt).toLocaleString()}</strong>
              </div>
            </div>
          )}
          
          <div className="next-steps">
            <h3>What's next?</h3>
            <ul>
              <li>✓ Your appointment is now confirmed</li>
              <li>✓ You can join the live session at the scheduled time</li>
              <li>✓ A reminder will be sent before your session</li>
            </ul>
          </div>
          
          <div className="button-group">
            <button className="btn-primary" onClick={handleGoToAppointments}>
              Go to My Appointments
            </button>
            <button className="btn-secondary" onClick={() => navigate("/")}>
              Return to Home
            </button>
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
        .payment-success-container {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          background: #faf7f3;
        }
        .success-card {
          max-width: 550px;
          width: 100%;
          background: white;
          border-radius: 28px;
          padding: 48px 40px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border: 1px solid #e8e0d8;
        }
        .success-icon {
          width: 80px;
          height: 80px;
          background: #e8f5e9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #4caf50;
        }
        .success-card h1 {
          font-size: 28px;
          color: #2C2318;
          margin-bottom: 12px;
        }
        .success-card > p {
          color: #666;
          margin-bottom: 32px;
        }
        .payment-details {
          background: #f8f6f3;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 32px;
          text-align: left;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e8e0d8;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-row span {
          color: #666;
        }
        .detail-row strong {
          color: #2C2318;
        }
        .next-steps {
          text-align: left;
          margin-bottom: 32px;
        }
        .next-steps h3 {
          font-size: 18px;
          color: #2C2318;
          margin-bottom: 16px;
        }
        .next-steps ul {
          list-style: none;
          padding: 0;
        }
        .next-steps li {
          padding: 8px 0;
          color: #555;
        }
        .button-group {
          display: flex;
          gap: 16px;
          justify-content: center;
        }
        .btn-primary {
          padding: 12px 28px;
          background: #2C2318;
          color: white;
          border: none;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover {
          background: #1A1510;
          transform: translateY(-2px);
        }
        .btn-secondary {
          padding: 12px 28px;
          background: transparent;
          color: #2C2318;
          border: 1px solid #d0c8c0;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: #f5f5f5;
        }
        @media (max-width: 600px) {
          .success-card {
            padding: 32px 24px;
          }
          .button-group {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};

export default PaymentSuccess;