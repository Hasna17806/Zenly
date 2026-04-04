import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

const ProfilePage = () => {
  const navigate = useNavigate();
  const picInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [stats, setStats] = useState({
    totalMoods: 0,
    completedChallenges: 0,
    streak: 0,
    chatbotMessages: 0,
  });

  const [formData, setFormData] = useState({ name: "", email: "" });

  // ─── helpers ────────────────────────────────────────────────────────────────
  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── data fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!getToken()) { navigate("/login"); return; }
    fetchUserProfile();
    fetchUserStats();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await axios.get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setUser(data);
      setFormData({ name: data.name || "", email: data.email || "" });
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [moodsRes, challengesRes, chatRes] = await Promise.all([
        axios.get(`${API}/api/mood`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/api/completed-challenges`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/api/chatbot/history`, { headers }).catch(() => ({ data: [] })),
      ]);

      setStats({
        totalMoods: moodsRes.data?.length || 0,
        completedChallenges: challengesRes.data?.length || 0,
        streak: Math.min(moodsRes.data?.length || 0, 7),
        chatbotMessages: chatRes.data?.length || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── profile update ──────────────────────────────────────────────────────────
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      const { data } = await axios.put(`${API}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setUser(data.user || data);
      setEditing(false);
      showToast("Profile updated successfully ✓");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // ─── picture upload (FIXED) ──────────────────────────────────────────────────
  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5MB", "error");
      return;
    }
    handlePicUpload(file);
  };

  const handlePicUpload = async (file) => {
    setUploadingPic(true);
    try {
      const token = getToken(); 
      const fd = new FormData();
      fd.append("profilePic", file);

      const { data } = await axios.post(`${API}/api/auth/profile-pic`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

     
      setUser((prev) => ({ ...prev, profilePicture: data.profilePicture }));
      // window.dispatchEvent(new Event('userUpdated'));
      showToast("Profile picture updated ✓");
    } catch (err) {
      console.error("Error uploading picture:", err);
      showToast(err.response?.data?.message || "Failed to upload image", "error");
    } finally {
      setUploadingPic(false);
      // reset so same file can be re-selected
      if (picInputRef.current) picInputRef.current.value = "";
    }
  };

  // ─── misc ────────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const getProfileImage = () => user?.profilePicture || null;

  const getRoleBadge = (role) => {
    if (role === "psychiatrist") return { label: "Psychiatrist", color: "#0c4a6e", bg: "#e0f2fe" };
    if (role === "admin") return { label: "Admin", color: "#78350f", bg: "#fef3c7" };
    return { label: "Student", color: "#14532d", bg: "#dcfce7" };
  };

  // ─── loading screen ──────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Playfair+Display:wght@500;600;700&display=swap');
        .prof-loading{min-height:100vh;background:#f4f9f7;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif}
        .spin{width:40px;height:40px;border:3px solid #c8e2db;border-top-color:#2d7268;border-radius:50%;animation:s .8s linear infinite;margin:0 auto}
        @keyframes s{to{transform:rotate(360deg)}}
      `}</style>
      <div className="prof-loading">
        <Navbar />
        <main style={{flex:1,display:"grid",placeItems:"center"}}>
          <div style={{textAlign:"center"}}>
            <div className="spin"/>
            <p style={{marginTop:16,color:"#6b8f88",fontFamily:"'DM Sans',sans-serif"}}>Loading profile…</p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );

  const roleBadge = getRoleBadge(user?.role);

  // ─── render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Playfair+Display:wght@500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        /* ── toast ── */
        .toast {
          position: fixed; top: 24px; right: 24px; z-index: 9999;
          padding: 14px 20px; border-radius: 14px; font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          animation: fadeIn .25s ease;
          display: flex; align-items: center; gap: 10px;
        }
        .toast.success { background: #1a4d45; color: #fff; }
        .toast.error   { background: #7f1d1d; color: #fff; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

        /* ── page ── */
        .prof-page {
          min-height: 100vh;
          background: #f4f9f7;
          display: flex; flex-direction: column;
          font-family: 'DM Sans', sans-serif;
          color: #1a3530;
        }

        .prof-main {
          flex: 1;
          padding: 48px 20px 80px;
        }

        .prof-wrap {
          max-width: 960px;
          margin: 0 auto;
          display: flex; flex-direction: column; gap: 20px;
        }

        /* ── page heading ── */
        .prof-heading { text-align: center; }
        .prof-heading h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(30px, 4.5vw, 46px);
          font-weight: 700; margin: 0 0 8px; color: #1a3530;
        }
        .prof-heading p { color: #6b8f88; font-size: 15px; margin: 0; }

        /* ── card ── */
        .card {
          background: #fff;
          border: 1px solid #e0eeea;
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(30,80,70,0.07);
          overflow: hidden;
        }

        /* ── hero banner ── */
        .hero-banner {
          height: 120px;
          background: linear-gradient(120deg, #1a4d45 0%, #2d7268 50%, #3d9186 100%);
          position: relative;
        }

        /* ── avatar ── */
        .avatar-ring {
          position: absolute; bottom: -48px; left: 32px;
          width: 100px; height: 100px;
          border-radius: 50%; padding: 4px;
          background: #fff;
          box-shadow: 0 6px 20px rgba(0,0,0,0.14);
          cursor: pointer;
        }
        .avatar-inner {
          width: 100%; height: 100%; border-radius: 50%;
          background: #d8eeea;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 30px; font-weight: 700; color: #1a4d45;
          overflow: hidden; position: relative;
        }
        .avatar-inner img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-overlay {
        position: absolute; inset: 0; border-radius: 50%;
        background: rgba(0,0,0,0); display: flex;
        align-items: center; justify-content: center;
        color: #fff; font-size: 11px; font-weight: 700;
        letter-spacing: .05em;
        opacity: 0;                          
        transition: background .2s, opacity .2s;
      }
      .avatar-ring:hover .avatar-overlay {
        background: rgba(0,0,0,.38);
        opacity: 1;                         
      }

        /* ── profile body ── */
        .prof-body { padding: 72px 32px 32px; }

        .role-pill {
          display: inline-block; padding: 5px 13px; border-radius: 999px;
          font-size: 11px; font-weight: 700; letter-spacing: .08em;
          text-transform: uppercase; margin-bottom: 10px;
        }

        .prof-name {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 700; margin: 0 0 6px; color: #1a3530;
        }

        .prof-meta { color: #6b8f88; font-size: 14px; margin: 0 0 4px; }

        .info-row {
          display: flex; justify-content: space-between;
          align-items: flex-start; gap: 16px; flex-wrap: wrap;
          margin-bottom: 28px;
        }

        /* ── buttons ── */
        .btn {
          border: none; border-radius: 12px; padding: 11px 20px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all .2s; font-family: 'DM Sans', sans-serif;
        }
        .btn-row { display: flex; gap: 10px; flex-wrap: wrap; }

        .btn-primary   { background: #1a4d45; color: #fff; }
        .btn-primary:hover { background: #133b35; }
        .btn-primary:disabled { opacity: .6; cursor: not-allowed; }

        .btn-outline {
          background: transparent; color: #1a4d45;
          border: 1.5px solid #c5ddd8;
        }
        .btn-outline:hover { background: #f0f8f6; }

        .btn-ghost-red {
          background: transparent; color: #b91c1c;
          border: 1.5px solid #fecaca;
        }
        .btn-ghost-red:hover { background: #fff5f5; }

        /* ── edit box ── */
        .edit-box {
          background: #f8fcfb; border: 1px solid #ddeee9;
          border-radius: 18px; padding: 24px; margin-bottom: 28px;
        }
        .edit-box h3 {
          font-family: 'Playfair Display', serif;
          font-size: 20px; margin: 0 0 20px; color: #1a3530;
        }
        .field { margin-bottom: 14px; }
        .field label {
          display: block; font-size: 11px; font-weight: 700;
          color: #6b8f88; text-transform: uppercase; letter-spacing: .08em;
          margin-bottom: 6px;
        }
        .field input {
          width: 100%; padding: 12px 15px;
          border: 1.5px solid #d5e8e2; border-radius: 12px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color .2s; background: #fff;
        }
        .field input:focus { border-color: #2d7268; }

        /* ── stats ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .stat-card {
          background: #f8fcfb; border: 1px solid #e0eeea;
          border-radius: 18px; padding: 22px 16px;
          transition: transform .2s, box-shadow .2s;
        }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(30,80,70,.1); }
        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 30px; font-weight: 700;
          color: #1a4d45; margin-bottom: 6px;
        }
        .stat-lbl { font-size: 13px; color: #6b8f88; }

        /* ── divider ── */
        .divider { height: 1px; background: #e8f2ef; margin: 28px 0; }

        /* ── activity ── */
        .section-pad { padding: 28px 32px; }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; margin: 0 0 20px; color: #1a3530;
        }

        .act-item {
          display: flex; align-items: center; gap: 14px;
          background: #f8fcfb; border: 1px solid #e0eeea;
          border-radius: 16px; padding: 16px; margin-bottom: 10px;
          transition: transform .2s;
        }
        .act-item:hover { transform: translateX(4px); }
        .act-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: #d8eeea; display: grid; place-items: center;
          font-family: 'Playfair Display', serif;
          font-size: 13px; font-weight: 700; color: #1a4d45; flex-shrink: 0;
        }
        .act-title { font-size: 15px; font-weight: 600; color: #1a3530; margin: 0 0 3px; }
        .act-sub   { font-size: 13px; color: #7c9993; margin: 0; }

        /* ── quick links ── */
        .quick-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        .quick-card {
          background: #fff; border: 1px solid #e0eeea;
          border-radius: 20px; padding: 24px 18px;
          text-align: left; cursor: pointer;
          transition: all .25s;
          box-shadow: 0 4px 16px rgba(30,80,70,0.06);
        }
        .quick-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(30,80,70,0.13);
        }
        .quick-icon {
          width: 46px; height: 46px; border-radius: 13px;
          background: #d8eeea; display: grid; place-items: center;
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: #1a4d45;
          margin-bottom: 14px;
        }
        .quick-title { font-size: 16px; font-weight: 700; color: #1a3530; margin: 0 0 5px; }
        .quick-desc  { font-size: 13px; color: #7c9993; margin: 0; }

        /* ── footer meta ── */
        .foot-meta { text-align: center; color: #9ab3ad; font-size: 12px; }

        /* ── spinner inline ── */
        .spin-sm {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,.4);
          border-top-color: #fff; border-radius: 50%;
          animation: s .7s linear infinite; display: inline-block;
        }
        @keyframes s { to { transform: rotate(360deg); } }

        /* ── responsive ── */
        @media (max-width: 720px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .quick-grid { grid-template-columns: 1fr; }
          .prof-body, .section-pad { padding-left: 18px; padding-right: 18px; }
          .info-row { flex-direction: column; }
          .avatar-ring { left: 18px; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}

      <div className="prof-page">
        <Navbar />

        <main className="prof-main">
          <div className="prof-wrap">

            {/* Heading */}
            <div className="prof-heading">
              <h1>My Profile</h1>
              <p>Manage your account and track your wellness journey</p>
            </div>

            {/* Main card */}
            <div className="card">
              {/* Banner */}
              <div className="hero-banner">
                <div
                  className="avatar-ring"
                  onClick={() => !uploadingPic && picInputRef.current?.click()}
                  title="Change profile picture"
                >
                  <div className="avatar-inner">
                    {getProfileImage() ? (
                      <img src={getProfileImage()} alt="Profile" />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || "U"
                    )}
                    <div className="avatar-overlay">
                      {uploadingPic ? <div className="spin-sm" /> : "Edit"}
                    </div>
                  </div>
                </div>
              </div>

              <input
                ref={picInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePicChange}
              />

              <div className="prof-body">
                {!editing ? (
                  <div className="info-row">
                    <div>
                      <span
                        className="role-pill"
                        style={{ background: roleBadge.bg, color: roleBadge.color }}
                      >
                        {roleBadge.label}
                      </span>
                      <h2 className="prof-name">{user?.name}</h2>
                      <p className="prof-meta">{user?.email}</p>
                      <p className="prof-meta">
                        Member since {new Date(user?.createdAt).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}
                      </p>
                    </div>
                    <div className="btn-row">
                      <button className="btn btn-outline" onClick={() => setEditing(true)}>
                        Edit Profile
                      </button>
                      <button className="btn btn-ghost-red" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="edit-box">
                    <h3>Edit Profile</h3>
                    <div className="field">
                      <label>Name</label>
                      <input
                        type="text" name="name"
                        value={formData.name} onChange={handleInputChange}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="field">
                      <label>Email</label>
                      <input
                        type="email" name="email"
                        value={formData.email} onChange={handleInputChange}
                        placeholder="Your email"
                      />
                    </div>
                    <div className="btn-row" style={{ marginTop: 20 }}>
                      <button
                        className="btn btn-primary"
                        onClick={handleSaveProfile}
                        disabled={saveLoading}
                      >
                        {saveLoading ? <span className="spin-sm" /> : "Save Changes"}
                      </button>
                      <button className="btn btn-outline" onClick={() => setEditing(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="divider" />

                {/* Stats */}
                <div className="stats-grid">
                  {[
                    { num: stats.totalMoods,          label: "Moods Logged" },
                    { num: stats.completedChallenges,  label: "Challenges Done" },
                    { num: stats.streak,               label: "Day Streak" },
                    { num: stats.chatbotMessages,      label: "Chat Messages" },
                  ].map((s) => (
                    <div key={s.label} className="stat-card">
                      <div className="stat-num">{s.num}</div>
                      <div className="stat-lbl">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="card section-pad">
              <h2 className="section-title">Recent Activity</h2>
              {stats.totalMoods > 0 ? (
                <>
                  <div className="act-item">
                    <div className="act-icon">01</div>
                    <div>
                      <p className="act-title">
                        Logged {stats.totalMoods} mood{stats.totalMoods !== 1 ? "s" : ""}
                      </p>
                      <p className="act-sub">Keep checking in consistently.</p>
                    </div>
                  </div>
                  <div className="act-item">
                    <div className="act-icon">02</div>
                    <div>
                      <p className="act-title">
                        Completed {stats.completedChallenges} challenge{stats.completedChallenges !== 1 ? "s" : ""}
                      </p>
                      <p className="act-sub">Your progress is building up.</p>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
                  <p style={{ color: "#7c9993", marginBottom: 16 }}>
                    No activity yet — start your first wellness check-in.
                  </p>
                  <button className="btn btn-primary" onClick={() => navigate("/mood")}>
                    Start Now
                  </button>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="quick-grid">
              {[
                { icon: "M", title: "Log Mood",     desc: "Track how you feel today",    path: "/mood" },
                { icon: "C", title: "Challenges",   desc: "Complete wellness tasks",      path: "/challenges" },
                { icon: "Z", title: "Zenly Chat",   desc: "Talk with your AI assistant", path: "/chat" },
              ].map((item) => (
                <button key={item.title} className="quick-card" onClick={() => navigate(item.path)}>
                  <div className="quick-icon">{item.icon}</div>
                  <p className="quick-title">{item.title}</p>
                  <p className="quick-desc">{item.desc}</p>
                </button>
              ))}
            </div>

            {/* Footer meta */}
            <div className="foot-meta">
              <p>Account created: {new Date(user?.createdAt).toLocaleDateString()}</p>
              <p>Last updated: {new Date(user?.updatedAt).toLocaleDateString()}</p>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProfilePage;