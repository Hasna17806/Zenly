import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalMoods: 0, completedChallenges: 0, streak: 0, chatMessages: 0 });
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });
  const [profilePic, setProfilePic] = useState(null);       // preview URL
  const [uploadingPic, setUploadingPic] = useState(false);
  const picInputRef = React.useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) { navigate('/login'); return; }
    fetchUserProfile();
    fetchUserStats();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData({ name: response.data.name || '', email: response.data.email || '', role: response.data.role || 'student' });
      if (response.data.profilePic) setProfilePic(response.data.profilePic);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const moodsRes = await axios.get("http://localhost:5000/api/mood", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }));
      const challengesRes = await axios.get("http://localhost:5000/api/completed-challenges", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }));
      const chatRes = await axios.get("http://localhost:5000/api/chatbot/history", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }));
      setStats({
        totalMoods: moodsRes.data?.length || 0,
        completedChallenges: challengesRes.data?.length || 0,
        streak: Math.min(moodsRes.data?.length || 0, 7),
        chatMessages: chatRes.data?.length || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSaveProfile = async () => { alert("Profile update feature coming soon! 🚀"); setEditing(false); };
  const handleLogout = () => { localStorage.removeItem('token'); sessionStorage.removeItem('token'); navigate('/login'); };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePic(ev.target.result);
    reader.readAsDataURL(file);
    handlePicUpload(file);
  };

  const handlePicUpload = async (file) => {
    try {
      setUploadingPic(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const data = new FormData();
      data.append("profilePic", file);
      await axios.post("http://localhost:5000/api/users/profile-pic", data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      alert("Profile picture updated! ✅");
    } catch (error) {
      console.error("Error uploading picture:", error);
      // Preview still shows even if upload fails
    } finally {
      setUploadingPic(false);
    }
  };

  const getRoleIcon = (role) => ({ admin: '👑', psychiatrist: '🩺' }[role] || '🧘');
  const getRoleBadge = (role) => ({
    admin:        { bg: '#fef3c7', color: '#92400e' },
    psychiatrist: { bg: '#dbeafe', color: '#1e40af' },
  }[role] || { bg: '#d4ede8', color: '#2d4a47' });

  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600&display=swap');
          .prof-spinner { width:38px;height:38px;border:3px solid #d4ede8;border-top-color:#5b9e96;border-radius:50%;animation:profspin .75s linear infinite;margin:0 auto; }
          @keyframes profspin { to { transform:rotate(360deg); } }
        `}</style>
        <div style={{ minHeight:'100vh', background:'#e8f4f1', display:'flex', flexDirection:'column', fontFamily:'Nunito,sans-serif' }}>
          <Navbar />
          <main style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ textAlign:'center' }}>
              <div className="prof-spinner" />
              <p style={{ marginTop:16, color:'#7a9e9b' }}>Loading profile…</p>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  const roleBadge = getRoleBadge(user?.role);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Nunito:wght@400;500;600;700&display=swap');

        .prof-page { min-height:100vh; background:#e8f4f1; font-family:'Nunito',sans-serif; display:flex; flex-direction:column; }
        .prof-main { flex:1; padding:60px 24px 80px; }
        .prof-inner { max-width:860px; margin:0 auto; }

        /* Header */
        .prof-header { text-align:center; margin-bottom:44px; }
        .prof-title { font-family:'Playfair Display',serif; font-size:clamp(24px,4vw,40px); font-weight:400; letter-spacing:0.16em; text-transform:uppercase; color:#3d5a58; margin:0 0 10px; }
        .prof-subtitle { font-size:15px; color:#7a9e9b; margin:0; }

        /* Card */
        .prof-card { background:#fff; border-radius:24px; border:1.5px solid #eaf4f2; box-shadow:0 4px 24px rgba(80,140,130,0.10); overflow:hidden; margin-bottom:20px; }

        /* Cover */
        .prof-cover { height:110px; background:linear-gradient(135deg,#5b9e96 0%,#3d7a73 100%); position:relative; }
        .prof-cover-dots { position:absolute; inset:0; background-image:radial-gradient(circle,rgba(255,255,255,0.1) 1px,transparent 1px); background-size:20px 20px; }
        .prof-avatar-wrap { width:90px; height:90px; border-radius:50%; background:#fff; padding:4px; box-shadow:0 4px 16px rgba(80,140,130,0.2); position:absolute; bottom:-45px; left:32px; cursor:pointer; }
        .prof-avatar-inner { width:100%; height:100%; border-radius:50%; background:linear-gradient(135deg,#d4ede8,#a8d5c8); display:flex; align-items:center; justify-content:center; font-size:36px; overflow:hidden; position:relative; }
        .prof-avatar-img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
        .prof-avatar-overlay { position:absolute; inset:0; border-radius:50%; background:rgba(0,0,0,0); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; transition:background .25s ease; }
        .prof-avatar-wrap:hover .prof-avatar-overlay { background:rgba(0,0,0,0.42); }
        .prof-avatar-overlay-icon { font-size:20px; opacity:0; transform:translateY(4px); transition:all .25s ease; }
        .prof-avatar-overlay-text { font-size:10px; font-weight:700; color:#fff; opacity:0; transform:translateY(4px); transition:all .25s ease .05s; letter-spacing:.05em; }
        .prof-avatar-wrap:hover .prof-avatar-overlay-icon,
        .prof-avatar-wrap:hover .prof-avatar-overlay-text { opacity:1; transform:translateY(0); }
        .prof-avatar-uploading { position:absolute; inset:0; border-radius:50%; background:rgba(255,255,255,0.7); display:flex; align-items:center; justify-content:center; }
        .prof-pic-spinner { width:22px; height:22px; border:2.5px solid #d4ede8; border-top-color:#5b9e96; border-radius:50%; animation:profspin .75s linear infinite; }
        @media(max-width:560px){ .prof-avatar-wrap{left:20px;} }

        /* Body */
        .prof-body { padding:60px 32px 28px; }
        @media(max-width:560px){ .prof-body{padding:60px 18px 24px;} }

        .prof-info-row { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; margin-bottom:28px; }
        .prof-role-badge { display:inline-block; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:4px 12px; border-radius:100px; margin-bottom:7px; }
        .prof-name { font-family:'Playfair Display',serif; font-size:24px; font-weight:600; color:#3d5a58; margin:0 0 5px; }
        .prof-email { font-size:13.5px; color:#7a9e9b; margin:0 0 6px; }
        .prof-since { font-size:12px; color:#9ab5b2; margin:0; }

        .prof-action-btns { display:flex; gap:10px; flex-shrink:0; }
        .prof-btn { padding:10px 22px; border-radius:50px; font-family:'Nunito',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:all .2s ease; }
        .prof-btn-edit { border:1.5px solid #c8e0db; background:#fff; color:#3d5a58; }
        .prof-btn-edit:hover { background:#3d5a58; color:#fff; border-color:#3d5a58; box-shadow:0 4px 12px rgba(61,90,88,.2); }
        .prof-btn-logout { border:1.5px solid #fca5a5; background:#fff; color:#dc2626; }
        .prof-btn-logout:hover { background:#dc2626; color:#fff; border-color:#dc2626; box-shadow:0 4px 12px rgba(220,38,38,.2); }

        /* Edit form */
        .prof-edit-form { background:#f8fdfc; border:1.5px solid #d4ede8; border-radius:18px; padding:24px; margin-bottom:24px; }
        .prof-edit-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:600; color:#3d5a58; margin:0 0 16px; }
        .prof-field { margin-bottom:13px; }
        .prof-label { display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#7a9e9b; margin-bottom:5px; }
        .prof-input,.prof-select { width:100%; padding:11px 16px; border:1.5px solid #d4ede8; border-radius:12px; font-family:'Nunito',sans-serif; font-size:14px; color:#3d5a58; background:#fff; outline:none; transition:border-color .2s; box-sizing:border-box; }
        .prof-input:focus,.prof-select:focus { border-color:#5b9e96; }
        .prof-edit-btns { display:flex; gap:10px; margin-top:16px; }
        .prof-btn-save { padding:10px 24px; border-radius:50px; border:none; background:#3d5a58; color:#fff; font-family:'Nunito',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:all .2s; }
        .prof-btn-save:hover { background:#2d4a47; box-shadow:0 4px 12px rgba(61,90,88,.22); }
        .prof-btn-cancel { padding:10px 24px; border-radius:50px; border:1.5px solid #d4ede8; background:#fff; color:#7a9e9b; font-family:'Nunito',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:all .2s; }
        .prof-btn-cancel:hover { border-color:#aaa; color:#555; }

        /* Stats */
        .prof-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        @media(max-width:560px){ .prof-stats{grid-template-columns:repeat(2,1fr);} }
        .prof-stat { border-radius:16px; padding:18px 10px; text-align:center; border:1.5px solid transparent; }
        .prof-stat-num { font-family:'Playfair Display',serif; font-size:30px; font-weight:600; line-height:1; margin-bottom:5px; }
        .prof-stat-label { font-size:11.5px; font-weight:600; color:#7a9e9b; }

        /* Section title */
        .prof-section-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:600; color:#3d5a58; margin:0 0 18px; }

        /* Activity */
        .prof-activity-item { display:flex; align-items:center; gap:14px; padding:15px; background:#f8fdfc; border:1.5px solid #e4f2ef; border-radius:14px; margin-bottom:10px; }
        .prof-activity-icon { width:42px; height:42px; border-radius:50%; display:grid; place-items:center; font-size:20px; flex-shrink:0; }
        .prof-activity-title { font-size:14px; font-weight:700; color:#3d5a58; margin:0 0 3px; }
        .prof-activity-sub { font-size:12px; color:#9ab5b2; margin:0; }

        /* Empty */
        .prof-empty { text-align:center; padding:32px 20px; }
        .prof-empty p { color:#9ab5b2; font-size:14px; margin:0 0 14px; }
        .prof-btn-start { padding:11px 26px; border-radius:50px; border:none; background:#3d5a58; color:#fff; font-family:'Nunito',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:all .2s; }
        .prof-btn-start:hover { background:#2d4a47; box-shadow:0 4px 12px rgba(61,90,88,.22); }

        /* Quick actions */
        .prof-actions-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
        @media(max-width:520px){ .prof-actions-grid{grid-template-columns:1fr;} }
        .prof-action-card { background:#fff; border:1.5px solid #eaf4f2; border-radius:20px; padding:28px 14px 22px; text-align:center; cursor:pointer; transition:all .25s ease; box-shadow:0 3px 14px rgba(80,140,130,.08); }
        .prof-action-card:hover { transform:translateY(-4px); box-shadow:0 10px 28px rgba(80,140,130,.16); border-color:#b8ddd8; }
        .prof-action-emoji { font-size:36px; margin-bottom:10px; display:block; transition:transform .3s ease; }
        .prof-action-card:hover .prof-action-emoji { transform:scale(1.15); }
        .prof-action-title { font-size:14px; font-weight:700; color:#3d5a58; margin:0 0 4px; }
        .prof-action-desc { font-size:12px; color:#9ab5b2; margin:0; }

        /* Meta */
        .prof-meta { text-align:center; font-size:12px; color:#b0ceca; padding:4px 0 8px; }
        .prof-meta p { margin:0 0 3px; }

        /* Spinner */
        .prof-spinner { width:38px; height:38px; border:3px solid #d4ede8; border-top-color:#5b9e96; border-radius:50%; animation:profspin .75s linear infinite; margin:0 auto; }
        @keyframes profspin { to { transform:rotate(360deg); } }
      `}</style>

      <div className="prof-page">
        <Navbar />

        <main className="prof-main">
          <div className="prof-inner">

            {/* Header */}
            <div className="prof-header">
              <h1 className="prof-title">My Profile</h1>
              <p className="prof-subtitle">Track your wellness journey and manage your account</p>
            </div>

            {/* Profile Card */}
            <div className="prof-card">
              <div className="prof-cover">
                <div className="prof-cover-dots" />
                <div className="prof-avatar-wrap" onClick={() => picInputRef.current?.click()} title="Change profile picture">
                  <div className="prof-avatar-inner">
                    {profilePic
                      ? <img src={profilePic} alt="Profile" className="prof-avatar-img" />
                      : getRoleIcon(user?.role)
                    }
                    <div className="prof-avatar-overlay">
                      <span className="prof-avatar-overlay-icon">📷</span>
                      <span className="prof-avatar-overlay-text">Change</span>
                    </div>
                    {uploadingPic && (
                      <div className="prof-avatar-uploading">
                        <div className="prof-pic-spinner" />
                      </div>
                    )}
                  </div>
                </div>
                <input
                  ref={picInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePicChange}
                />
              </div>

              <div className="prof-body">
                {!editing ? (
                  <div className="prof-info-row">
                    <div>
                      <span className="prof-role-badge" style={{ background: roleBadge.bg, color: roleBadge.color }}>
                        {user?.role}
                      </span>
                      <h2 className="prof-name">{user?.name}</h2>
                      <p className="prof-email">{user?.email}</p>
                      <p className="prof-since">✨ Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="prof-action-btns">
                      <button className="prof-btn prof-btn-edit" onClick={() => setEditing(true)}>Edit Profile</button>
                      <button className="prof-btn prof-btn-logout" onClick={handleLogout}>Logout</button>
                    </div>
                  </div>
                ) : (
                  <div className="prof-edit-form">
                    <h3 className="prof-edit-title">Edit Profile</h3>
                    <div className="prof-field">
                      <label className="prof-label">Name</label>
                      <input className="prof-input" type="text" name="name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="prof-field">
                      <label className="prof-label">Email</label>
                      <input className="prof-input" type="email" name="email" value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div className="prof-field">
                      <label className="prof-label">Role</label>
                      <select className="prof-select" name="role" value={formData.role} onChange={handleInputChange}>
                        <option value="student">Student</option>
                        <option value="psychiatrist">Psychiatrist</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="prof-edit-btns">
                      <button className="prof-btn-save" onClick={handleSaveProfile}>Save Changes</button>
                      <button className="prof-btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="prof-stats">
                  {[
                    { num: stats.totalMoods,           label: 'Moods Logged',     bg: '#f0f9f7', border: '#d4ede8', color: '#3d7a73' },
                    { num: stats.completedChallenges,  label: 'Challenges Done',  bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a' },
                    { num: stats.streak,               label: 'Day Streak 🔥',    bg: '#fff7ed', border: '#fed7aa', color: '#ea580c' },
                    { num: stats.chatMessages,         label: 'Chat Messages',    bg: '#faf5ff', border: '#e9d5ff', color: '#9333ea' },
                  ].map(({ num, label, bg, border, color }) => (
                    <div key={label} className="prof-stat" style={{ background: bg, borderColor: border }}>
                      <div className="prof-stat-num" style={{ color }}>{num}</div>
                      <div className="prof-stat-label">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="prof-card" style={{ padding: '28px 32px' }}>
              <h2 className="prof-section-title">Recent Activity</h2>
              {stats.totalMoods > 0 ? (
                <>
                  <div className="prof-activity-item">
                    <div className="prof-activity-icon" style={{ background: '#f0f9f7' }}>😊</div>
                    <div>
                      <p className="prof-activity-title">Logged {stats.totalMoods} mood{stats.totalMoods !== 1 ? 's' : ''}</p>
                      <p className="prof-activity-sub">Keep checking in! 🌟</p>
                    </div>
                  </div>
                  <div className="prof-activity-item">
                    <div className="prof-activity-icon" style={{ background: '#f0fdf4' }}>🏆</div>
                    <div>
                      <p className="prof-activity-title">Completed {stats.completedChallenges} challenge{stats.completedChallenges !== 1 ? 's' : ''}</p>
                      <p className="prof-activity-sub">Great progress! 🎉</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="prof-empty">
                  <p>No recent activity yet. Start your wellness journey!</p>
                  <button className="prof-btn-start" onClick={() => navigate('/mood')}>Log Your First Mood</button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="prof-actions-grid">
              {[
                { emoji: '😊', title: 'Log Mood',       desc: 'Check in how you feel', path: '/mood' },
                { emoji: '🎮', title: 'Play Games',      desc: 'Take a fun break',      path: '/challenges' },
                { emoji: '💬', title: 'Chat with Zenly', desc: 'Talk it out',            path: '/chat' },
              ].map(({ emoji, title, desc, path }) => (
                <button key={title} className="prof-action-card" onClick={() => navigate(path)}>
                  <span className="prof-action-emoji">{emoji}</span>
                  <p className="prof-action-title">{title}</p>
                  <p className="prof-action-desc">{desc}</p>
                </button>
              ))}
            </div>

            {/* Account meta */}
            <div className="prof-meta">
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