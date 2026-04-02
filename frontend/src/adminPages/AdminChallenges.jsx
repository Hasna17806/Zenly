import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../components/Sidebar";

const AdminChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState("");
  const [duration, setDuration] = useState("");
  const [moodTags, setMoodTags] = useState([]);

  const moodOptions = [
    "stressed/Heavy","sad/Low","calm/Okay",
    "happy/Energetic","angry/Frustrated","tired/Burned Out",
  ];

  const fetchChallenges = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/challenges/admin/all");
      setChallenges(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchChallenges(); }, []);

  const handleMoodChange = (mood) => {
    setMoodTags(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { title, description, category, duration, image, moodTag: moodTags };
      if (editingId) {
        await axios.put(`http://localhost:5000/api/challenges/admin/update/${editingId}`, payload);
      } else {
        await axios.post("http://localhost:5000/api/challenges/admin/create", payload);
      }
      handleCancel(); fetchChallenges();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save challenge");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this challenge?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/challenges/admin/delete/${id}`);
      fetchChallenges();
    } catch (error) { console.error(error); }
  };

  const handleEdit = (c) => {
    setTitle(c.title); setDescription(c.description); setCategory(c.category);
    setDuration(c.duration || ""); setImage(c.image || "");
    setMoodTags(c.moodTag || []); setEditingId(c._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setTitle(""); setDescription(""); setCategory("");
    setDuration(""); setImage(""); setMoodTags([]); setEditingId(null);
  };

  const catColors = {
    "Mood Boost": { bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.35)", color: "#c4b5fd" },
    "Study":      { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.35)", color: "#93c5fd" },
    "Fun":        { bg: "rgba(234,179,8,0.15)",  border: "rgba(234,179,8,0.35)",  color: "#fde047" },
    "Quick Play": { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.35)", color: "#6ee7b7" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ch-layout {
          display: flex; min-height: 100vh;
          font-family: 'Inter', sans-serif;
          background: #08080a;
        }

        .ch-main {
          flex: 1;
          background: #08080a;
          position: relative; overflow-x: hidden;
          padding: 36px 32px 64px;
          min-height: 100vh;
        }

        .ch-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }

        /* ── Dark card ── */
        .dcard {
          background: #111115;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.5);
        }

        /* ── Header ── */
        .page-header {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 28px;
          animation: rise 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .hdr-icon {
          width: 50px; height: 50px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(124,58,237,0.45);
          flex-shrink: 0;
        }
        .hdr-icon svg { width: 24px; height: 24px; }
        .page-title { font-size: 21px; font-weight: 700; color: #f5f5f5; letter-spacing: -0.025em; }
        .page-sub   { font-size: 13px; color: #52525b; margin-top: 3px; }

        /* ── Form ── */
        .form-card {
          padding: 26px 28px;
          margin-bottom: 28px;
          animation: rise 0.55s 0.06s cubic-bezier(0.16,1,0.3,1) both;
        }
        .form-top {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 20px; padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .form-heading { font-size: 14px; font-weight: 600; color: #e4e4e7; }
        .form-badge {
          margin-left: auto; font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 3px 10px; border-radius: 20px;
          background: rgba(124,58,237,0.15);
          border: 1px solid rgba(124,58,237,0.3);
          color: #a78bfa;
        }
        .form-badge.editing {
          background: rgba(234,179,8,0.12);
          border-color: rgba(234,179,8,0.3);
          color: #fbbf24;
        }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .col-full  { grid-column: 1 / -1; }

        .flabel {
          display: block; font-size: 10.5px; font-weight: 600;
          color: #52525b; letter-spacing: 0.09em;
          text-transform: uppercase; margin-bottom: 7px;
        }
        .finp, .fsel {
          width: 100%; background: #0d0d10;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; color: #e4e4e7;
          font-family: 'Inter', sans-serif;
          font-size: 14px; padding: 11px 13px;
          outline: none; transition: all 0.2s; appearance: none;
        }
        .finp::placeholder { color: #3f3f46; }
        .finp:focus, .fsel:focus {
          background: #111118;
          border-color: rgba(124,58,237,0.55);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
        .fsel option { background: #111115; color: #e4e4e7; }

        /* mood chips */
        .mood-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .mchip {
          padding: 7px 14px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.08);
          background: #0d0d10; color: #71717a;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.18s; user-select: none;
        }
        .mchip:hover { border-color: rgba(124,58,237,0.4); color: #c4b5fd; background: rgba(124,58,237,0.08); }
        .mchip.on {
          background: rgba(124,58,237,0.2);
          border-color: rgba(124,58,237,0.55);
          color: #c4b5fd; font-weight: 600;
          box-shadow: 0 0 0 1px rgba(124,58,237,0.2);
        }

        .form-actions { display: flex; gap: 10px; margin-top: 18px; }
        .btn-submit {
          display: flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; border: none; border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 600;
          padding: 11px 22px; cursor: pointer;
          box-shadow: 0 4px 16px rgba(124,58,237,0.4);
          transition: all 0.22s;
        }
        .btn-submit:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,58,237,0.5); }
        .btn-submit:active { transform: translateY(0); }
        .btn-cancel {
          display: flex; align-items: center; gap: 7px;
          background: transparent; color: #52525b;
          border: 1px solid rgba(255,255,255,0.07); border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 500;
          padding: 11px 18px; cursor: pointer; transition: all 0.2s;
        }
        .btn-cancel:hover { background: rgba(255,255,255,0.04); color: #a1a1aa; border-color: rgba(255,255,255,0.12); }

        /* ── Section top ── */
        .section-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px;
          animation: rise 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both;
        }
        .section-title { font-size: 16px; font-weight: 700; color: #f5f5f5; letter-spacing: -0.02em; }
        .count-pill {
          font-size: 11.5px; font-weight: 600;
          background: rgba(124,58,237,0.12); color: #a78bfa;
          padding: 4px 13px; border-radius: 20px;
          border: 1px solid rgba(124,58,237,0.25);
        }

        /* ── Cards Grid ── */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 18px;
          animation: rise 0.65s 0.12s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* ── Individual Card ── */
        .ch-card {
          background: #111115;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          overflow: hidden;
          display: flex; flex-direction: column;
          transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4);
        }
        .ch-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.6);
          border-color: rgba(124,58,237,0.3);
        }
        .ch-card.is-editing {
          outline: 2px solid #fbbf24;
          outline-offset: 2px;
        }

        /* ── Image — perfectly fitted ── */
        .card-img-wrap {
          width: 100%; height: 185px;
          position: relative; flex-shrink: 0;
          background: #0a0a0d;
          overflow: hidden;
        }
        .card-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          display: block;
          transition: transform 0.35s ease;
        }
        .ch-card:hover .card-img { transform: scale(1.05); }
        .card-img-empty {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 10px;
          color: #3f3f46; font-size: 13px; font-weight: 500;
        }
        .card-img-empty svg { width: 36px; height: 36px; }

        /* subtle gradient overlay on image bottom */
        .card-img-wrap::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 60px;
          background: linear-gradient(to top, #111115, transparent);
          pointer-events: none;
        }

        /* ── Card Body ── */
        .card-body { padding: 14px 16px 6px; flex: 1; display: flex; flex-direction: column; }

        .card-title-row {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 10px;
          margin-bottom: 7px;
        }
        .card-name { font-size: 14.5px; font-weight: 700; color: #f5f5f5; line-height: 1.35; flex: 1; }

        .cat-badge {
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.03em;
          padding: 3px 10px; border-radius: 999px;
          white-space: nowrap; flex-shrink: 0; border: 1px solid;
        }

        .card-desc {
          font-size: 12.5px; color: #52525b; line-height: 1.55;
          margin-bottom: 11px;
          display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }

        .card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .meta-item {
          display: flex; align-items: center; gap: 4px;
          font-size: 12px; color: #52525b; font-weight: 500;
        }
        .meta-sep { color: #27272a; }

        .card-moods { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
        .mood-tag {
          font-size: 10.5px; font-weight: 500;
          padding: 3px 9px; border-radius: 999px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: #71717a;
        }

        /* ── Card Actions ── */
        .card-actions {
          display: flex;
          border-top: 1px solid rgba(255,255,255,0.05);
          margin-top: auto;
        }
        .cta {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600;
          padding: 13px 0; border: none; cursor: pointer;
          background: transparent; transition: background 0.18s, color 0.18s;
        }
        .cta-edit {
          color: #71717a;
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .cta-edit:hover { background: rgba(124,58,237,0.08); color: #c4b5fd; }
        .cta-del { color: #7f1d1d; }
        .cta-del:hover { background: rgba(239,68,68,0.08); color: #f87171; }

        /* ── Empty ── */
        .empty-state {
          grid-column: 1 / -1; padding: 64px 24px; text-align: center;
          color: #3f3f46; font-size: 14px;
          background: #0d0d10;
          border: 1px solid rgba(255,255,255,0.05); border-radius: 18px;
        }
        .empty-icon { font-size: 40px; display: block; margin-bottom: 12px; opacity: 0.25; }

        @keyframes rise {
          from { opacity:0; transform:translateY(24px) scale(0.97); }
          to   { opacity:1; transform:none; }
        }

        @media (max-width: 860px) {
          .form-grid { grid-template-columns: 1fr 1fr; }
          .ch-main { padding: 20px 16px 48px; }
          .form-card { padding: 20px 16px; }
        }
        @media (max-width: 560px) {
          .form-grid { grid-template-columns: 1fr; }
          .cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ch-layout">
        <AdminSidebar />

        <div className="ch-main">
          <div className="ch-inner">

            {/* Header */}
            <div className="page-header">
              <div className="hdr-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L4.5 13.5H11L10 22L20.5 9.5H14L13 2Z"
                    fill="white" stroke="white" strokeWidth="1.5"
                    strokeLinejoin="round" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="page-title">Manage Challenges</div>
                <div className="page-sub">Create, edit and remove challenges</div>
              </div>
            </div>

            {/* Form */}
            <div className="dcard form-card">
              <div className="form-top">
                <span className="form-heading">
                  {editingId ? "✏️  Edit Challenge" : "✦  New Challenge"}
                </span>
                <span className={`form-badge ${editingId ? "editing" : ""}`}>
                  {editingId ? "Editing" : "Create"}
                </span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div>
                    <label className="flabel">Title</label>
                    <input className="finp" type="text" placeholder="Challenge title"
                      value={title} onChange={e => setTitle(e.target.value)} required />
                  </div>
                  <div>
                    <label className="flabel">Duration</label>
                    <input className="finp" type="text" placeholder="e.g. 2 mins"
                      value={duration} onChange={e => setDuration(e.target.value)} />
                  </div>
                  <div>
                    <label className="flabel">Category</label>
                    <select className="fsel" value={category} onChange={e => setCategory(e.target.value)} required>
                      <option value="">Select category</option>
                      <option value="Mood Boost">Mood Boost</option>
                      <option value="Study">Study</option>
                      <option value="Fun">Fun</option>
                      <option value="Quick Play">Quick Play</option>
                    </select>
                  </div>
                  <div className="col-full">
                    <label className="flabel">Description</label>
                    <input className="finp" type="text" placeholder="Short description"
                      value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                  <div className="col-full">
                    <label className="flabel">Image URL</label>
                    <input className="finp" type="text" placeholder="Paste Cloudinary URL"
                      value={image} onChange={e => setImage(e.target.value)} />
                  </div>
                  <div className="col-full">
                    <label className="flabel">Mood Based Tags</label>
                    <div className="mood-grid">
                      {moodOptions.map(mood => (
                        <div key={mood}
                          className={`mchip ${moodTags.includes(mood) ? "on" : ""}`}
                          onClick={() => handleMoodChange(mood)}>
                          {mood}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    {editingId ? "✓ Update Challenge" : "+ Add Challenge"}
                  </button>
                  {editingId && (
                    <button type="button" className="btn-cancel" onClick={handleCancel}>✕ Cancel</button>
                  )}
                </div>
              </form>
            </div>

            {/* Cards */}
            <div className="section-top">
              <span className="section-title">All Challenges</span>
              <span className="count-pill">{challenges.length} total</span>
            </div>

            <div className="cards-grid">
              {challenges.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">⚡</span>
                  No challenges yet — add your first one above!
                </div>
              ) : (
                challenges.map(c => {
                  const cs = catColors[c.category] || {
                    bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)", color: "#71717a"
                  };
                  return (
                    <div key={c._id} className={`ch-card ${editingId === c._id ? "is-editing" : ""}`}>

                      {/* Image */}
                      <div className="card-img-wrap">
                        {c.image ? (
                          <img className="card-img" src={c.image} alt={c.title} />
                        ) : (
                          <div className="card-img-empty">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                              <rect x="3" y="3" width="18" height="18" rx="3"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <path d="M21 15l-5-5L5 21"/>
                            </svg>
                            No image
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="card-body">
                        <div className="card-title-row">
                          <span className="card-name">{c.title}</span>
                          {c.category && (
                            <span className="cat-badge" style={{ background: cs.bg, borderColor: cs.border, color: cs.color }}>
                              {c.category}
                            </span>
                          )}
                        </div>

                        {c.description && <p className="card-desc">{c.description}</p>}

                        <div className="card-meta">
                          {c.duration && <span className="meta-item">⏱ {c.duration}</span>}
                          {c.duration && c.moodTag?.length > 0 && <span className="meta-sep">•</span>}
                          {c.moodTag?.length > 0 && (
                            <span className="meta-item">
                              🏷 {c.moodTag.length} mood{c.moodTag.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {c.moodTag?.length > 0 && (
                          <div className="card-moods">
                            {c.moodTag.map((m, i) => (
                              <span key={i} className="mood-tag">{m}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="card-actions">
                        <button className="cta cta-edit" onClick={() => handleEdit(c)}>— Edit</button>
                        <button className="cta cta-del" onClick={() => handleDelete(c._id)}>✕ Delete</button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminChallenges;