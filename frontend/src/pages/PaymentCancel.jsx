import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="payment-cancel-container">
        <div className="cancel-card">
          <div className="cancel-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          
          <h1>Payment Cancelled</h1>
          <p>Your payment was not completed. You can try again whenever you're ready.</p>
          
          <div className="info-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>No payment has been charged. Your appointment request is still pending.</span>
          </div>
          
          <div className="button-group">
            <button className="btn-primary" onClick={() => navigate("/my-psychiatrists")}>
              Try Again
            </button>
            <button className="btn-secondary" onClick={() => navigate("/")}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
        .payment-cancel-container {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          background: #faf7f3;
        }
        .cancel-card {
          max-width: 500px;
          width: 100%;
          background: white;
          border-radius: 28px;
          padding: 48px 40px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border: 1px solid #e8e0d8;
        }
        .cancel-icon {
          width: 80px;
          height: 80px;
          background: #ffebee;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #f44336;
        }
        .cancel-card h1 {
          font-size: 28px;
          color: #2C2318;
          margin-bottom: 12px;
        }
        .cancel-card > p {
          color: #666;
          margin-bottom: 24px;
        }
        .info-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff8e1;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 32px;
          text-align: left;
          color: #856404;
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
          .cancel-card {
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

export default PaymentCancel;