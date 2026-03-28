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
  const [route, setRoute] = useState("");

  const fetchChallenges = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/challenges/admin/all");
      setChallenges(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = {
      title,
      description,
      category,
      duration,
      image,
    };

    if (editingId) {
      await axios.put(
        `http://localhost:5000/api/challenges/admin/update/${editingId}`,
        payload
      );
    } else {
      await axios.post(
        "http://localhost:5000/api/challenges/admin/create",
        payload
      );
    }

    setTitle("");
    setDescription("");
    setCategory("");
    setDuration("");
    setImage("");
    setEditingId(null);

    fetchChallenges();
  } catch (error) {
    console.error(error);
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this challenge?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/challenges/admin/delete/${id}`);
      fetchChallenges();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (c) => {
    setTitle(c.title);
    setDescription(c.description);
    setCategory(c.category);
    setDuration(c.duration || "");
    setImage(c.image || "");
    setRoute(c.route || "");
    setEditingId(c._id);
  };

  const handleCancel = () => {
  setTitle("");
  setDescription("");
  setCategory("");
  setDuration("");
  setImage("");
  setEditingId(null);
};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ch-layout { display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; }

        .ch-main {
          flex: 1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          position: relative; overflow-x: hidden;
          padding: 36px 28px 56px;
        }
        .blob { position: fixed; border-radius: 50%; filter: blur(80px); opacity: 0.4;
                animation: bfloat 8s ease-in-out infinite; pointer-events: none; z-index: 0; }
        .b1 { width:420px;height:420px;background:#a78bfa;top:-120px;left:-120px; }
        .b2 { width:320px;height:320px;background:#f472b6;bottom:-80px;right:-80px;animation-delay:-3s; }
        .b3 { width:220px;height:220px;background:#38bdf8;top:40%;left:55%;animation-delay:-5s; }
        @keyframes bfloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-28px) scale(1.06)} }

        .ch-inner { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }

        .glass {
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.32);
          border-radius: 28px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.45);
        }

        .page-header {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 24px;
          animation: rise 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .icon-wrap {
          width: 52px; height: 52px;
          background: rgba(255,255,255,0.9); border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .page-title { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
        .page-sub   { font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 2px; }

        .form-card {
          padding: 32px 36px;
          margin-bottom: 22px;
          animation: rise 0.55s 0.05s cubic-bezier(0.16,1,0.3,1) both;
        }
        .form-card-title {
          font-size: 14px; font-weight: 700; color: #fff;
          letter-spacing: 0.01em; margin-bottom: 22px;
          display: flex; align-items: center; gap: 8px;
        }
        .form-card-title span {
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 8px; padding: 3px 10px;
          font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(255,255,255,0.8);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .form-full { grid-column: 1 / -1; }

        .label {
          display: block; font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.7); letter-spacing: 0.07em;
          text-transform: uppercase; margin-bottom: 7px;
        }
        .inp, .sel {
          width: 100%;
          background: rgba(255,255,255,0.11);
          border: 1.5px solid rgba(255,255,255,0.22);
          border-radius: 14px;
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          padding: 12px 15px;
          outline: none;
          transition: all 0.22s;
          appearance: none;
        }
        .inp::placeholder { color: rgba(255,255,255,0.32); }
        .inp:focus, .sel:focus {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.65);
          box-shadow: 0 0 0 4px rgba(255,255,255,0.1);
        }
        .sel option { background: #6d28d9; color: #fff; }

        .form-actions { display: flex; gap: 10px; margin-top: 6px; }

        .btn-primary {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.96);
          color: #6d28d9; border: none; border-radius: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 700;
          padding: 12px 24px; cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,0,0,0.13);
          transition: all 0.22s;
        }
        .btn-primary:hover { background: #fff; transform: translateY(-2px); box-shadow: 0 14px 36px rgba(0,0,0,0.18); }

        .btn-ghost {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.75); border: 1.5px solid rgba(255,255,255,0.22);
          border-radius: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          padding: 12px 20px; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.18); color: #fff; }

        .table-card {
          overflow: hidden;
          animation: rise 0.65s 0.1s cubic-bezier(0.16,1,0.3,1) both;
        }
        .table-top {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 28px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.13);
        }
        .table-title { font-size: 15px; font-weight: 700; color: #fff; }
        .pill {
          font-size: 11.5px; font-weight: 600;
          background: rgba(255,255,255,0.16); color: rgba(255,255,255,0.85);
          padding: 4px 13px; border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.22);
        }

        table { width: 100%; border-collapse: collapse; }
        thead tr { border-bottom: 1px solid rgba(255,255,255,0.12); }
        th {
          padding: 13px 18px; text-align: left;
          font-size: 10.5px; font-weight: 600;
          color: rgba(255,255,255,0.5); letter-spacing: 0.08em; text-transform: uppercase;
        }
        tbody tr { border-bottom: 1px solid rgba(255,255,255,0.07); transition: background 0.15s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: rgba(255,255,255,0.06); }
        td { padding: 14px 18px; font-size: 13.5px; color: rgba(255,255,255,0.88); vertical-align: middle; }

        .ch-title   { font-weight: 600; color: #fff; }
        .ch-desc    { color: rgba(255,255,255,0.58); font-size: 13px; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ch-dur     { color: rgba(255,255,255,0.7); font-size: 13px; }
        .ch-route   { color: #c4b5fd; font-size: 12px; font-weight: 600; }

        .cat-badge {
          display: inline-block;
          font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
          padding: 4px 11px; border-radius: 20px;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.22);
          color: rgba(255,255,255,0.85);
          text-transform: capitalize;
        }

        .ch-img {
          width: 44px; height: 44px; border-radius: 10px;
          object-fit: cover;
          border: 1.5px solid rgba(255,255,255,0.2);
        }
        .no-img {
          width: 44px; height: 44px; border-radius: 10px;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.14);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; opacity: 0.5;
        }

        .actions { display: flex; gap: 8px; }
        .act-btn {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px; font-weight: 600;
          padding: 7px 14px; border-radius: 10px; border: none; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-edit   { background: rgba(251,191,36,0.16); color: #fde68a; border: 1.5px solid rgba(251,191,36,0.28); }
        .btn-edit:hover   { background: rgba(251,191,36,0.3); transform: translateY(-1px); }
        .btn-delete { background: rgba(239,68,68,0.16);  color: #fca5a5; border: 1.5px solid rgba(239,68,68,0.28); }
        .btn-delete:hover { background: rgba(239,68,68,0.3);  transform: translateY(-1px); }

        .empty { padding: 52px; text-align: center; color: rgba(255,255,255,0.4); font-size: 14px; }
        .empty-i { font-size: 34px; margin-bottom: 10px; opacity: 0.45; }

        @keyframes rise {
          from { opacity:0; transform:translateY(28px) scale(0.97); }
          to   { opacity:1; transform:none; }
        }

        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
          .ch-main { padding: 20px 14px 40px; }
        }
      `}</style>

      <div className="ch-layout">
        <AdminSidebar />

        <div className="ch-main">
          <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />

          <div className="ch-inner">

            <div className="page-header">
              <div className="icon-wrap">🏆</div>
              <div>
                <div className="page-title">Manage Challenges</div>
                <div className="page-sub">Create, edit and remove challenges</div>
              </div>
            </div>

            <div className="glass form-card">
              <div className="form-card-title">
                {editingId ? "✏️ Edit Challenge" : "➕ New Challenge"}
                <span>{editingId ? "Editing" : "Add"}</span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div>
                    <label className="label">Title</label>
                    <input
                      className="inp"
                      type="text"
                      placeholder="Challenge title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Duration</label>
                    <input
                      className="inp"
                      type="text"
                      placeholder="e.g. 2 mins"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="label">Category</label>
                    <select
                      className="sel"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="">Select category</option>
                      <option value="mood-boost">Mood Boost</option>
                      <option value="study">Study</option>
                      <option value="fun">Fun</option>
                      <option value="quick-play">Quick Play</option>
                    </select>
                  </div>

                  <div className="form-full">
                    <label className="label">Description</label>
                    <input
                      className="inp"
                      type="text"
                      placeholder="Short description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="label">Image URL</label>
                    <input
                      className="inp"
                      type="text"
                      placeholder="Paste Cloudinary URL"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label className="label">Game Route</label>
                    <select
                      className="sel"
                      value={route}
                      onChange={(e) => setRoute(e.target.value)}
                      required
                    >
                      <option value="">Select game</option>
                      <option value="/games/breathe">Breathing Game</option>
                      <option value="/games/gratitude-tap">Gratitude Tap Game</option>
                      <option value="/games/smile-challenge">Smile Challenge Game</option>
                      <option value="/games/calm-taps">Calm Taps Game</option>
                      <option value="/games/focus-sprint">Focus Sprint Game</option>
                      <option value="/games/memory-flip">Memory Flip Game</option>
                      <option value="/games/quick-quiz">Quick Quiz Game</option>
                      <option value="/games/distraction-block">Distraction Block Game</option>
                      <option value="/games/guess-sound">Guess Sound Game</option>
                      <option value="/games/emoji-match">Emoji Match Game</option>
                      <option value="/games/tap-star">Tap Star Game</option>
                      <option value="/games/spin-wheel">Spin Wheel Game</option>
                      <option value="/games/60-second-breath">60 Second Breath Game</option>
                      <option value="/games/blink-break">Blink Break Game</option>
                      <option value="/games/one-thought">One Thought Game</option>
                      <option value="/games/timer">Timer Game</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingId ? "✓ Update Challenge" : "＋ Add Challenge"}
                  </button>
                  {editingId && (
                    <button type="button" className="btn-ghost" onClick={handleCancel}>
                      ✕ Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="glass table-card">
              <div className="table-top">
                <span className="table-title">All Challenges</span>
                <span className="pill">{challenges.length} total</span>
              </div>

              {challenges.length === 0 ? (
                <div className="empty">
                  <div className="empty-i">🏆</div>
                  No challenges yet — add one above!
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Duration</th>
                      <th>Route</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenges.map((c) => (
                      <tr key={c._id}>
                        <td>
                          {c.image ? (
                            <img className="ch-img" src={c.image} alt={c.title} />
                          ) : (
                            <div className="no-img">🖼️</div>
                          )}
                        </td>
                        <td><span className="ch-title">{c.title}</span></td>
                        <td><span className="ch-desc">{c.description}</span></td>
                        <td><span className="cat-badge">{c.category}</span></td>
                        <td><span className="ch-dur">{c.duration || "—"}</span></td>
                        <td><span className="ch-route">{c.route}</span></td>
                        <td>
                          <div className="actions">
                            <button className="act-btn btn-edit" onClick={() => handleEdit(c)}>Edit</button>
                            <button className="act-btn btn-delete" onClick={() => handleDelete(c._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminChallenges;