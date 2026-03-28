import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PsychiatristLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
  setError("");
  setLoading(true);
  try {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    const res = await axios.post(
      "http://localhost:5000/api/psychiatrist/login",
      { email, password }
    );

    localStorage.setItem("psychiatristToken", res.data.token);

    navigate("/psychiatrist/dashboard");
  } catch (err) {
    console.log(err);
    setError("Invalid email or password. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page {
          min-height: 100vh;
          background: #0b1520;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'IBM Plex Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .login-page::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -120px;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(100,180,200,0.08) 0%, transparent 65%);
          pointer-events: none;
        }

        .login-page::after {
          content: '';
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(60,120,160,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: #111d2b;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 44px 40px 40px;
          position: relative;
          z-index: 1;
          box-shadow: 0 24px 64px rgba(0,0,0,0.4);
        }

        .login-logo-zone {
          width: 100%;
          height: 56px;
          border: 1.5px dashed rgba(255,255,255,0.13);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: rgba(255,255,255,0.18);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 32px;
        }

        .login-eyebrow {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #64b4c8;
          margin-bottom: 6px;
        }

        .login-title {
          font-size: 22px;
          font-weight: 600;
          color: #eef2f5;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }

        .login-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          font-weight: 300;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .login-field {
          margin-bottom: 16px;
        }

        .login-label {
          display: block;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .login-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 9px;
          color: #eef2f5;
          font-size: 14px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-weight: 400;
          outline: none;
          transition: border-color 0.16s ease, background 0.16s ease;
          letter-spacing: 0.01em;
        }

        .login-input::placeholder {
          color: rgba(255,255,255,0.18);
        }

        .login-input:focus {
          border-color: rgba(100,180,200,0.45);
          background: rgba(100,180,200,0.04);
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(220,80,80,0.08);
          border: 1px solid rgba(220,80,80,0.2);
          border-radius: 8px;
          padding: 10px 14px;
          color: #e88a8a;
          font-size: 12.5px;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .login-btn {
          width: 100%;
          padding: 13px;
          background: #64b4c8;
          border: none;
          border-radius: 9px;
          color: #0b1520;
          font-size: 14px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-weight: 600;
          letter-spacing: 0.03em;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.16s ease, opacity 0.16s ease, transform 0.1s ease;
        }

        .login-btn:hover:not(:disabled) {
          background: #7dc6d8;
        }

        .login-btn:active:not(:disabled) {
          transform: scale(0.99);
        }

        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 28px 0 20px;
        }

        .login-footer {
          text-align: center;
          font-size: 11.5px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.02em;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(11,21,32,0.3);
          border-top-color: #0b1520;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          vertical-align: middle;
          margin-right: 8px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">

          {/* Logo Zone */}
          <div className="login-logo-zone">
             <img src="https://res.cloudinary.com/dkqjn6dqw/image/upload/v1771944890/s__1_-removebg-preview_b54v9c.png" alt="zenly logo" 
             className="w-40 h-auto" />
            
           
          </div>

          <div className="login-eyebrow">Psychiatrist Portal</div>
          <h2 className="login-title">Welcome back</h2>
          <p className="login-desc">Sign in to access your patient management dashboard.</p>

          {error && (
            <div className="login-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <div className="login-field">
            <label className="login-label">Email Address</label>
            <input
              className="login-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? <><span className="spinner" />Signing in…</> : "Sign In"}
          </button>

          <div className="login-divider" />
          <div className="login-footer">Secure access · Patient Management System</div>

        </div>
      </div>
    </>
  );
}