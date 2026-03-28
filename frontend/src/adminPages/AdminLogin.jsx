import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, Shield, Key } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const { data } = await axios.post("http://localhost:5000/api/admin/login", { 
        email, 
        password 
      });
      
      localStorage.setItem("adminToken", data.token);
      navigate("/admin/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Inter', sans-serif;
          background: #f0f2f5;
        }
        
        .admin-login {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #f6f8fc 0%, #eef2f6 100%);
          padding: 1.5rem;
          position: relative;
        }
        
        /* Grid background */
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        
        /* Main card */
        .login-card {
          position: relative;
          width: 100%;
          max-width: 440px;
          background: white;
          border-radius: 32px;
          box-shadow: 
            0 20px 40px -10px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Header with subtle gradient */
        .card-header {
          padding: 2.5rem 2.5rem 1.5rem;
          background: linear-gradient(135deg, #fafbff 0%, #ffffff 100%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          text-align: center;
        }
        
        .logo-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #f0f2ff 0%, #e6e9ff 100%);
          border-radius: 24px;
          margin-bottom: 1.5rem;
          box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.1);
        }
        
        .logo-wrapper svg {
          width: 36px;
          height: 36px;
          color: #4f46e5;
          stroke-width: 1.5;
        }
        
        .card-header h1 {
          font-size: 1.75rem;
          font-weight: 600;
          color: #1a1f36;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }
        
        .card-header p {
          font-size: 0.9rem;
          color: #5b6c84;
          font-weight: 400;
        }
        
        /* Form section */
        .card-body {
          padding: 2rem 2.5rem 2.5rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #4b5a73;
          margin-bottom: 0.5rem;
        }
        
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .input-icon {
          position: absolute;
          left: 1rem;
          color: #8b9ab5;
          width: 18px;
          height: 18px;
          transition: color 0.2s;
        }
        
        .input-field {
          width: 100%;
          padding: 0.9rem 1rem 0.9rem 2.8rem;
          font-size: 0.95rem;
          font-family: 'Inter', sans-serif;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          background: white;
          color: #1e293b;
          transition: all 0.2s;
          outline: none;
        }
        
        .input-field:hover {
          border-color: #cbd5e1;
        }
        
        .input-field:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }
        
        .input-field::placeholder {
          color: #a0b2ce;
          font-weight: 300;
        }
        
        .toggle-password {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #8b9ab5;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        
        .toggle-password:hover {
          color: #4f46e5;
        }
        
        .forgot-link {
          text-align: right;
          margin-top: 0.5rem;
        }
        
        .forgot-link a {
          font-size: 0.85rem;
          color: #5b6c84;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .forgot-link a:hover {
          color: #4f46e5;
        }
        
        .error-message {
          padding: 0.9rem 1rem;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 14px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #b91c1c;
          font-size: 0.9rem;
        }
        
        .error-dot {
          width: 6px;
          height: 6px;
          background: #ef4444;
          border-radius: 50%;
        }
        
        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          border: none;
          border-radius: 18px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 8px 20px -6px rgba(79, 70, 229, 0.3);
          margin-top: 0.5rem;
        }
        
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -8px rgba(79, 70, 229, 0.4);
        }
        
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0 1rem;
        }
        
        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
        }
        
        .divider-text {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #8b9ab5;
        }
        
        .security-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #edf2f7;
        }
        
        .badge-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: #5b6c84;
        }
        
        .badge-item svg {
          width: 14px;
          height: 14px;
          color: #8b9ab5;
        }
        
        .back-link {
          text-align: center;
          margin-top: 1.5rem;
        }
        
        .back-link a {
          font-size: 0.85rem;
          color: #5b6c84;
          text-decoration: none;
          transition: color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .back-link a:hover {
          color: #4f46e5;
        }
        
        .back-link a span {
          font-size: 1.1rem;
        }
      `}</style>

      <div className="admin-login">
        <div className="grid-bg" />
        
        <div className="login-card">
          <div className="card-header">
            <div className="logo-wrapper">
              <Shield />
            </div>
            <h1>Welcome back</h1>
            <p>Sign in to access the admin dashboard</p>
          </div>

          <div className="card-body">
            {error && (
              <div className="error-message">
                <div className="error-dot" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    className="input-field"
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
             
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign in to dashboard
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">Secure access</span>
              <div className="divider-line" />
            </div>

            <div className="security-badge">
              <div className="badge-item">
                <Lock size={14} />
                <span>256-bit SSL</span>
              </div>
              <div className="badge-item">
                <Key size={14} />
                <span>2FA ready</span>
              </div>
            </div>

            <div className="back-link">
              <a href="/">
                <span>←</span> Return to Zenly HomePage
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;