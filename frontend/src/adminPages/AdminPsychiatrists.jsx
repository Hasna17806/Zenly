import { useEffect, useState } from "react";
import axios from "axios";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');

    :root {
      --bg:        #0a0c10;
      --surface:   #111318;
      --surface-2: #181c24;
      --surface-3: #1e2330;
      --border:    rgba(255,255,255,0.07);
      --border-h:  rgba(255,255,255,0.13);
      --txt:       #f0f2f8;
      --txt-2:     #7a8099;
      --txt-3:     #3e4558;
      --indigo:    #6c8ef7;
      --blue:      #4db8ff;
      --teal:      #2dd4bf;
      --amber:     #f59e0b;
      --rose:      #fb7185;
      --violet:    #a78bfa;
      --green:     #4ade80;
      --font-d:    'Plus Jakarta Sans', sans-serif;
      --font-b:    'Outfit', sans-serif;
      --r:   12px;
      --rl:  18px;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 4px; }

    .ap-page {
      min-height: 100vh;
      background: var(--bg);
      font-family: var(--font-b);
      color: var(--txt);
      padding: 40px;
      margin-left: 260px;
    }

    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .toast {
      background: var(--surface-2);
      border-left: 4px solid var(--violet);
      border-radius: var(--r);
      padding: 18px 22px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 360px;
      max-width: 420px;
      pointer-events: auto;
      animation: toastSlideIn 0.3s ease forwards;
      border: 1px solid rgba(167, 139, 250, 0.2);
      backdrop-filter: blur(8px);
    }

    .toast-success { border-left-color: var(--teal); }
    .toast-success .toast-icon { background: rgba(45, 212, 191, 0.15); color: var(--teal); }

    .toast-error { border-left-color: var(--rose); }
    .toast-error .toast-icon { background: rgba(251, 113, 133, 0.15); color: var(--rose); }

    .toast-info { border-left-color: var(--blue); }
    .toast-info .toast-icon { background: rgba(77, 184, 255, 0.15); color: var(--blue); }

    .toast-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .toast-icon svg { width: 22px; height: 22px; }
    .toast-content { flex: 1; }
    .toast-title {
      font-family: var(--font-d);
      font-size: 16px;
      font-weight: 700;
      color: var(--txt);
      margin-bottom: 4px;
    }
    .toast-message { font-size: 14px; color: var(--txt-2); }

    .toast-close {
      background: transparent;
      border: none;
      color: var(--txt-3);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .toast-close:hover { color: var(--txt-2); }

    @keyframes toastSlideIn {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes toastSlideOut {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(30px); }
    }

    .toast-exit { animation: toastSlideOut 0.2s ease forwards; }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }

    .delete-modal {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--rl);
      width: 440px;
      max-width: 90%;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
      animation: slideUp 0.3s ease;
    }

    .delete-modal-header {
      padding: 24px 28px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .delete-modal-icon {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: rgba(251, 113, 133, 0.15);
      color: var(--rose);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .delete-modal-title {
      font-family: var(--font-d);
      font-size: 20px;
      font-weight: 700;
      color: var(--txt);
    }

    .delete-modal-body { padding: 28px; }

    .delete-modal-message {
      font-size: 16px;
      color: var(--txt-2);
      line-height: 1.6;
      margin-bottom: 10px;
    }

    .delete-modal-warning {
      font-size: 14px;
      color: var(--rose);
      background: rgba(251, 113, 133, 0.1);
      border: 1px solid rgba(251, 113, 133, 0.2);
      border-radius: var(--r);
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .delete-modal-actions {
      display: flex;
      gap: 14px;
      margin-top: 28px;
    }

    .delete-modal-btn {
      flex: 1;
      padding: 14px;
      border-radius: var(--r);
      font-family: var(--font-b);
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .delete-modal-btn-cancel {
      background: var(--surface-3);
      color: var(--txt-2);
      border: 1px solid var(--border);
    }

    .delete-modal-btn-confirm {
      background: linear-gradient(135deg, #fb7185, #f43f5e);
      color: white;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .ap-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 32px;
    }

    .ap-title {
      font-family: var(--font-d);
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.3px;
    }

    .ap-subtitle {
      font-size: 15px;
      color: var(--txt-2);
      margin-top: 6px;
    }

    .ap-header-right { display: flex; align-items: center; gap: 14px; }

    .ap-count-chip {
      display: inline-flex; align-items: center; gap: 10px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 40px; padding: 10px 20px;
      font-size: 14px; color: var(--txt-2);
    }

    .ap-count-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--violet); box-shadow: 0 0 7px var(--violet);
      animation: breathe 2s ease-in-out infinite;
    }

    @keyframes breathe { 0%,100%{opacity:1;} 50%{opacity:0.35;} }

    .ap-count-num { font-weight: 700; color: var(--txt); }

    .btn-add, .btn-back {
      display: inline-flex; align-items: center; gap: 8px;
      border-radius: var(--r);
      font-family: var(--font-b); font-size: 15px; font-weight: 600;
      padding: 12px 22px; cursor: pointer;
      transition: all 0.2s;
    }

    .btn-add {
      background: linear-gradient(135deg, var(--violet), var(--indigo));
      border: none;
      color: #fff;
      box-shadow: 0 4px 16px rgba(167,139,250,0.25);
    }

    .btn-back {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--txt-2);
    }

    .ap-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--rl);
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.25);
    }

    .ap-card-header {
      background: var(--surface-2);
      padding: 18px 24px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
    }

    .ap-card-title {
      display: flex; align-items: center; gap: 10px;
      font-family: var(--font-d); font-size: 16px; font-weight: 700;
    }

    .ap-card-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--violet); box-shadow: 0 0 6px var(--violet);
    }

    .ap-card-meta { font-size: 13px; color: var(--txt-3); }

    .ap-table { width: 100%; border-collapse: collapse; }

    .ap-table thead th {
      padding: 14px 20px;
      font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--txt-3); text-align: left; border-bottom: 1px solid var(--border);
    }

    .ap-table tbody tr {
      border-bottom: 1px solid var(--border);
      transition: background 0.15s; position: relative;
    }

    .ap-table tbody tr:hover { background: rgba(167,139,250,0.04); }

    .ap-table tbody td {
      padding: 16px 20px; font-size: 15px; color: var(--txt-2); vertical-align: middle;
    }

    .doc-cell { display: flex; align-items: center; gap: 14px; }

    .doc-av {
      width: 42px; height: 42px; border-radius: 12px;
      background: linear-gradient(135deg, var(--violet), var(--indigo));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-d); font-size: 16px; font-weight: 800; color: #fff;
    }

    .doc-name { font-size: 16px; font-weight: 600; color: var(--txt); }
    .doc-email { font-size: 13px; color: var(--txt-3); margin-top: 2px; }

    .spec-pill {
      display: inline-block; font-size: 13px; font-weight: 500; color: var(--blue);
      background: rgba(77,184,255,0.08); border: 1px solid rgba(77,184,255,0.18);
      border-radius: 20px; padding: 4px 12px; white-space: nowrap;
    }

    .fee-txt { font-size: 15px; font-weight: 600; color: var(--teal); }

    .sbadge {
      display: inline-flex; align-items: center; gap: 7px;
      font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 30px;
    }

    .sbadge-active  { background:rgba(45,212,191,0.1); color:var(--teal); border:1px solid rgba(45,212,191,0.25); }
    .sbadge-blocked { background:rgba(251,113,133,0.1); color:var(--rose); border:1px solid rgba(251,113,133,0.25); }

    .act-row { display: flex; gap: 8px; flex-wrap: wrap; }

    .abtn {
      display: inline-flex; align-items: center; gap: 6px;
      font-family: var(--font-b); font-size: 13px; font-weight: 600;
      padding: 8px 14px; border-radius: 10px; border: 1px solid transparent;
      cursor: pointer; transition: all 0.18s; white-space: nowrap;
    }

    .abtn-block   { background:rgba(245,158,11,0.08); color:var(--amber); border-color:rgba(245,158,11,0.2); }
    .abtn-unblock { background:rgba(74,222,128,0.08); color:var(--green); border-color:rgba(74,222,128,0.2); }
    .abtn-delete  { background:rgba(251,113,133,0.08); color:var(--rose); border-color:rgba(251,113,133,0.2); }
    .abtn-edit    { background:rgba(77,184,255,0.08); color:var(--blue); border-color:rgba(77,184,255,0.2); }

    .ap-empty { padding: 80px 20px; text-align: center; color: var(--txt-3); font-size: 15px; }

    .add-page-wrap { max-width: 780px; }

    .add-form-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--rl);
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.3);
    }

    .add-form-banner {
      background: linear-gradient(135deg, rgba(167,139,250,0.12), rgba(108,142,247,0.08));
      border-bottom: 1px solid rgba(167,139,250,0.15);
      padding: 28px 32px;
      display: flex; align-items: center; gap: 16px;
    }

    .add-form-banner-icon {
      width: 56px; height: 56px; border-radius: 16px;
      background: linear-gradient(135deg, var(--violet), var(--indigo));
      display: flex; align-items: center; justify-content: center;
    }

    .add-form-banner-title { font-family: var(--font-d); font-size: 20px; font-weight: 800; }
    .add-form-banner-sub { font-size: 14px; color: var(--txt-2); margin-top: 4px; }

    .add-form-body {
      padding: 28px 32px 32px;
      display: flex; flex-direction: column; gap: 22px;
    }

    .ap-field { display: flex; flex-direction: column; gap: 8px; }

    .ap-label {
      font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--txt-3);
    }

    .ap-input-wrap { position: relative; }

    .ap-input-icon {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      width: 18px; height: 18px; color: var(--txt-3); pointer-events: none;
    }

    .ap-input {
      width: 100%;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r);
      padding: 13px 15px 13px 44px;
      font-family: var(--font-b); font-size: 15px; color: var(--txt);
      outline: none;
    }

    .ap-input.no-icon { padding-left: 15px; }
    .ap-input.has-toggle { padding-right: 46px; }

    .pw-toggle {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; color: var(--txt-3);
    }

    .ap-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .form-divider { height: 1px; background: var(--border); }

    .ap-submit {
      width: 100%; padding: 15px;
      background: linear-gradient(135deg, var(--violet), var(--indigo));
      border: none; border-radius: var(--r);
      color: #fff; font-family: var(--font-b); font-size: 16px; font-weight: 600;
      cursor: pointer;
    }

    .file-upload-box {
      background: var(--surface-2);
      border: 1px dashed rgba(167,139,250,0.35);
      border-radius: var(--r);
      padding: 20px;
    }

    .file-upload-input {
      width: 100%;
      color: var(--txt-2);
      font-size: 14px;
    }

    .file-preview-list {
      margin-top: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .file-preview-item {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 14px;
      color: var(--txt-2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .remove-file-btn {
      background: transparent;
      border: none;
      color: var(--rose);
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    }

    @media (max-width: 900px) {
      .ap-page { margin-left: 0; padding: 24px; }
      .ap-field-row { grid-template-columns: 1fr; }
      .ap-header { flex-direction: column; gap: 16px; }
    }
  `}</style>
);

/* Icons remain the same... */
const EyeIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
  </svg>
);

const SuccessIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InfoIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const WarningIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const Toast = ({ type = "success", title, message, onClose }) => {
  const [exiting, setExiting] = useState(false);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onClose(), 200);
  };

  return (
    <div className={`toast ${type === "success" ? "toast-success" : type === "error" ? "toast-error" : "toast-info"} ${exiting ? "toast-exit" : ""}`}>
      <div className="toast-icon">
        {type === "success" ? <SuccessIcon /> : type === "error" ? <ErrorIcon /> : <InfoIcon />}
      </div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
      </div>
      <button className="toast-close" onClick={handleClose}>
        <CloseIcon />
      </button>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, doctorName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delete-modal" onClick={e => e.stopPropagation()}>
        <div className="delete-modal-header">
          <div className="delete-modal-icon"><WarningIcon /></div>
          <div className="delete-modal-title">Delete Psychiatrist</div>
        </div>

        <div className="delete-modal-body">
          <p className="delete-modal-message">
            Are you sure you want to delete <strong style={{ color: 'var(--txt)' }}>{doctorName}</strong>?
          </p>

          <div className="delete-modal-warning">
            <WarningIcon />
            <span>This action cannot be undone.</span>
          </div>

          <div className="delete-modal-actions">
            <button className="delete-modal-btn delete-modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="delete-modal-btn delete-modal-btn-confirm" onClick={onConfirm}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPsychiatrists = () => {
  const [view, setView] = useState("list");
  const [psychiatrists, setPsychiatrists] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [specialization, setSpecialization] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [phone, setPhone] = useState("");
  const [documents, setDocuments] = useState([]);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });

  const token = localStorage.getItem("adminToken");

  const fetchPsychiatrists = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/psychiatrists", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPsychiatrists(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPsychiatrists();
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setSpecialization("");
    setConsultationFee("");
    setPhone("");
    setDocuments([]);
    setShowPw(false);
    setEditingId(null);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAdd = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("specialization", specialization);
      formData.append("consultationFee", consultationFee);
      formData.append("phone", phone);

      documents.forEach((file) => {
        formData.append("documents", file);
      });

      await axios.post("http://localhost:5000/api/admin/psychiatrists", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      showToast("success", "Psychiatrist Added", `${name} has been successfully registered.`);
      resetForm();
      setTimeout(() => setView("list"), 1200);
      fetchPsychiatrists();
    } catch (e) {
      console.error("ADD ERROR FULL:", e);
      console.error("ADD ERROR RESPONSE:", e.response);
      console.error("ADD ERROR DATA:", e.response?.data);

      showToast(
        "error",
        "Registration Failed",
        e.response?.data?.message || "Could not add psychiatrist."
      );
    }
  };

  const handleEdit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (password.trim()) formData.append("password", password);
      formData.append("specialization", specialization);
      formData.append("consultationFee", consultationFee);
      formData.append("phone", phone);

      documents.forEach((file) => {
        formData.append("documents", file);
      });

      await axios.put(`http://localhost:5000/api/admin/psychiatrists/${editingId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      showToast("success", "Psychiatrist Updated", `${name}'s details have been updated.`);
      resetForm();
      setTimeout(() => setView("list"), 1200);
      fetchPsychiatrists();
    } catch (e) {
      console.error("EDIT ERROR FULL:", e);
      console.error("EDIT ERROR RESPONSE:", e.response);
      console.error("EDIT ERROR DATA:", e.response?.data);

      showToast(
        "error",
        "Update Failed",
        e.response?.data?.message || "Could not update psychiatrist."
      );
    }
  };

  const openEditForm = (doc) => {
    setEditingId(doc._id);
    setName(doc.name || "");
    setEmail(doc.email || "");
    setPassword("");
    setSpecialization(doc.specialization || "");
    setConsultationFee(doc.consultationFee || "");
    setPhone(doc.phone || "");
    setDocuments([]);
    setView("edit");
  };

  const handleBlock = async (id) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/admin/psychiatrists/${id}/block`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("success", "Status Updated", data.message || "Psychiatrist status updated.");

      setPsychiatrists(prev =>
        prev.map(psy =>
          psy._id === id ? { ...psy, isBlocked: !psy.isBlocked } : psy
        )
      );
    } catch (error) {
      console.error(error);
      showToast("error", "Action Failed", error.response?.data?.message || "Failed to update status.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/psychiatrists/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showToast("success", "Psychiatrist Deleted", "The psychiatrist has been removed.");
      setDeleteModal({ isOpen: false, id: null, name: "" });
      fetchPsychiatrists();
    } catch (e) {
      console.error(e);
      showToast("error", "Deletion Failed", "Could not delete psychiatrist.");
      setDeleteModal({ isOpen: false, id: null, name: "" });
    }
  };

  const openDeleteModal = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  return (
    <>
      <GlobalStyles />

      <div className="toast-container">
        {toast && (
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onConfirm={handleDelete}
        doctorName={deleteModal.name}
      />

      <div className="ap-page">
        {view === "list" && (
          <>
            <div className="ap-header">
              <div>
                <h1 className="ap-title">Psychiatrists</h1>
                <p className="ap-subtitle">Manage all registered mental health professionals.</p>
              </div>
              <div className="ap-header-right">
                <div className="ap-count-chip">
                  <span className="ap-count-dot" />
                  Total: <span className="ap-count-num">{psychiatrists.length}</span>
                </div>
                <button className="btn-add" onClick={() => { resetForm(); setView("add"); }}>
                  Add Psychiatrist
                </button>
              </div>
            </div>

            <div className="ap-card">
              <div className="ap-card-header">
                <div className="ap-card-title">
                  <span className="ap-card-dot" />
                  All Psychiatrists
                </div>
                <span className="ap-card-meta">{psychiatrists.length} registered</span>
              </div>

              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Phone</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {psychiatrists.length > 0 ? psychiatrists.map(doc => (
                    <tr key={doc._id}>
                      <td>
                        <div className="doc-cell">
                          <div className="doc-av">{doc.name?.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="doc-name">{doc.name}</div>
                            <div className="doc-email">{doc.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="spec-pill">{doc.specialization || "—"}</span></td>
                      <td>{doc.phone || "—"}</td>
                      <td><span className="fee-txt">₹{doc.consultationFee}</span></td>
                      <td>
                        <span className={`sbadge ${doc.isBlocked ? "sbadge-blocked" : "sbadge-active"}`}>
                          {doc.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                       <td>
                        <div className="act-row">
                          <button className="abtn abtn-edit" onClick={() => openEditForm(doc)}>
                            Edit
                          </button>

                          <button className={`abtn ${doc.isBlocked ? "abtn-unblock" : "abtn-block"}`} onClick={() => handleBlock(doc._id)}>
                            {doc.isBlocked ? "Unblock" : "Block"}
                          </button>

                          <button className="abtn abtn-delete" onClick={() => openDeleteModal(doc._id, doc.name)}>
                            Delete
                          </button>
                        </div>
                       </td>
                     </tr>
                  )) : (
                    <tr>
                      <td colSpan="6">
                        <div className="ap-empty">
                          No psychiatrists added yet.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {(view === "add" || view === "edit") && (
          <>
            <div className="ap-header">
              <div>
                <h1 className="ap-title">{view === "edit" ? "Edit Psychiatrist" : "Add Psychiatrist"}</h1>
                <p className="ap-subtitle">
                  {view === "edit"
                    ? "Update psychiatrist information and documents."
                    : "Fill in the details to register a new mental health professional."}
                </p>
              </div>
              <button className="btn-back" onClick={() => { resetForm(); setView("list"); }}>
                Back to List
              </button>
            </div>

            <div className="add-page-wrap">
              <div className="add-form-card">
                <div className="add-form-banner">
                  <div className="add-form-banner-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="add-form-banner-title">
                      {view === "edit" ? "Edit Psychiatrist" : "New Psychiatrist"}
                    </div>
                    <div className="add-form-banner-sub">
                      Add professional details, contact info and supporting documents.
                    </div>
                  </div>
                </div>

                <div className="add-form-body">
                  <div className="ap-field">
                    <label className="ap-label">Full Name</label>
                    <div className="ap-input-wrap">
                      <input className="ap-input no-icon" placeholder="Dr. Jane Smith"
                        value={name} onChange={e => setName(e.target.value)} />
                    </div>
                  </div>

                  <div className="ap-field-row">
                    <div className="ap-field">
                      <label className="ap-label">Email Address</label>
                      <div className="ap-input-wrap">
                        <input className="ap-input no-icon" type="email" placeholder="doctor@clinic.com"
                          value={email} onChange={e => setEmail(e.target.value)} />
                      </div>
                    </div>

                    <div className="ap-field">
                      <label className="ap-label">Phone Number</label>
                      <div className="ap-input-wrap">
                        <input className="ap-input no-icon" type="text" placeholder="+91 9876543210"
                          value={phone} onChange={e => setPhone(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="ap-field">
                    <label className="ap-label">
                      Password {view === "edit" && "(Leave blank to keep same password)"}
                    </label>
                    <div className="ap-input-wrap">
                      <input
                        className="ap-input has-toggle no-icon"
                        type={showPw ? "text" : "password"}
                        placeholder={view === "edit" ? "Enter new password (optional)" : "Minimum 8 characters"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      <button className="pw-toggle" type="button" onClick={() => setShowPw(p => !p)}>
                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <div className="form-divider" />

                  <div className="ap-field-row">
                    <div className="ap-field">
                      <label className="ap-label">Specialization</label>
                      <div className="ap-input-wrap">
                        <input className="ap-input no-icon" placeholder="e.g. Anxiety & Depression"
                          value={specialization} onChange={e => setSpecialization(e.target.value)} />
                      </div>
                    </div>

                    <div className="ap-field">
                      <label className="ap-label">Consultation Fee (₹)</label>
                      <div className="ap-input-wrap">
                        <input className="ap-input no-icon" type="number" placeholder="500"
                          value={consultationFee} onChange={e => setConsultationFee(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="form-divider" />

                  <div className="ap-field">
                    <label className="ap-label">Upload Documents</label>
                    <div className="file-upload-box">
                      <input
                        className="file-upload-input"
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                      <p style={{ marginTop: "12px", fontSize: "13px", color: "var(--txt-3)" }}>
                        Upload certificates, licenses, profile images, or PDF documents.
                      </p>

                      {documents.length > 0 && (
                        <div className="file-preview-list">
                          {documents.map((file, index) => (
                            <div key={index} className="file-preview-item">
                              <span>{file.name}</span>
                              <button className="remove-file-btn" type="button" onClick={() => removeFile(index)}>
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button className="ap-submit" onClick={view === "edit" ? handleEdit : handleAdd}>
                    {view === "edit" ? "Update Psychiatrist" : "Add Psychiatrist"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminPsychiatrists;