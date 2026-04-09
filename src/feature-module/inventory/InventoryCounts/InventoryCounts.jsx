import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommonFooter from "../../../components/footer/commonFooter";
import {
  Search, Edit3, Clipboard, Filter, ChevronLeft, ChevronRight,
  X, Eye, Plus, RefreshCw, Activity, CheckCircle, Clock,
  AlertCircle, ChevronRight as BreadArrow, Archive, BarChart2
} from "react-feather";
import { URLS } from "../../../Urls";


const InventoryCounts = () => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [sessions, setSessions]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [searchQuery, setSearchQuery]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rows, setRows]                 = useState(10);
  const [currentPage, setCurrentPage]   = useState(1);
  const [showModal, setShowModal]       = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // ── Fetch sessions ─────────────────────────────────────────────────────────
  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const storeIdStr = localStorage.getItem("selectedStoreId")  ;
      const res   = await fetch(URLS.GetInventoryCounts, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: parseInt(storeIdStr) }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessions(data.sessions || []);
      } else {
        setError(data.message || "Failed to fetch inventory counts.");
        toast.error(data.message || "Failed to fetch inventory counts.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  // ── Status meta ────────────────────────────────────────────────────────────
  const getStatusMeta = (status) => {
    switch (status) {
      case "Completed":   return { bg: "rgba(16,185,129,0.1)",  color: "#059669", border: "rgba(16,185,129,0.25)",  dot: "#10b981" };
      case "Submitted":   return { bg: "rgba(139,92,246,0.1)",  color: "#7c3aed", border: "rgba(139,92,246,0.25)", dot: "#8b5cf6" };
      case "In Progress": return { bg: "rgba(59,130,246,0.1)",  color: "#2563eb", border: "rgba(59,130,246,0.25)", dot: "#3b82f6" };
      default:            return { bg: "rgba(245,158,11,0.1)",  color: "#b45309", border: "rgba(245,158,11,0.25)", dot: "#f59e0b" };
    }
  };

  // ── Filtered + paginated ───────────────────────────────────────────────────
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        (s.sessionCode || "").toLowerCase().includes(q) ||
        (String(s.storeId) || "").toLowerCase().includes(q) ||
        (s.categoryName || "").toLowerCase().includes(q) ||
        (s.countType   || "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [sessions, searchQuery, statusFilter]);

  const totalPages   = Math.max(1, Math.ceil(filteredSessions.length / rows));
  const safePage     = Math.min(currentPage, totalPages);
  const startIdx     = (safePage - 1) * rows;
  const paginated    = filteredSessions.slice(startIdx, startIdx + rows);
  const startRecord  = filteredSessions.length === 0 ? 0 : startIdx + 1;
  const endRecord    = Math.min(safePage * rows, filteredSessions.length);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     sessions.length,
    draft:     sessions.filter((s) => s.status === "Draft").length,
    progress:  sessions.filter((s) => s.status === "In Progress").length,
    submitted: sessions.filter((s) => s.status === "Submitted").length,
    completed: sessions.filter((s) => s.status === "Completed").length,
  }), [sessions]);

  // ── Page numbers for pagination ────────────────────────────────────────────
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1;
    const left  = safePage - delta;
    const right = safePage + delta;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pages.push(i);
      } else if (i === left - 1 || i === right + 1) {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .ic-root {
          background: linear-gradient(135deg, #f8faff 0%, #dbe8ff 100%);
          min-height: 100vh;
          padding: 24px;
          padding-top: 100px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ── Main glass card ────────────────────────────────────────────── */
        .ic-main-card {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          padding: 28px 32px;
          margin-bottom: 24px;
        }

        /* ── Section glass sub-cards ────────────────────────────────────── */
        .ic-section-card {
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px;
          margin-bottom: 20px;
          overflow: visible;
        }
        .ic-section-header {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(226,232,240,0.55);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          background: rgba(255,255,255,0.4);
          border-radius: 18px 18px 0 0;
        }
        .ic-section-header-left {
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .ic-section-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.1px;
        }
        .ic-section-body { padding: 18px 20px; }

        /* ── Stat mini cards ────────────────────────────────────────────── */
        .ic-stats-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .ic-stat-card {
          flex: 1 1 160px;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .ic-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .ic-stat-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ic-stat-val {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
          margin-bottom: 2px;
        }
        .ic-stat-lbl {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }

        /* ── Filter row ─────────────────────────────────────────────────── */
        .ic-filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          align-items: flex-end;
        }
        .ic-field-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ic-field-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .ic-input-wrap {
          background: #fff;
          border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px;
          padding: 0 14px;
          height: 38px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: border-color 0.2s;
        }
        .ic-input-wrap:focus-within { border-color: rgba(59,130,246,0.45); }
        .ic-input {
          background: transparent; border: none; outline: none;
          font-size: 13px; color: #1e293b; font-weight: 500;
          flex: 1; min-width: 0;
          font-family: inherit;
        }
        .ic-input::placeholder { color: #94a3b8; font-weight: 400; }
        .ic-select {
          background: transparent; border: none; outline: none;
          font-size: 13px; color: #1e293b; font-weight: 500;
          flex: 1; cursor: pointer;
          font-family: inherit;
          appearance: none; -webkit-appearance: none;
        }

        /* ── Table card ─────────────────────────────────────────────────── */
        .ic-table-card {
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .ic-table-head { width: 100%; border-collapse: collapse; }
        .ic-th {
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: rgba(248,250,252,0.7);
          border-bottom: 1px solid rgba(226,232,240,0.6);
          white-space: nowrap;
          text-align: left;
        }
        .ic-th-right { text-align: right; }
        .ic-th-center { text-align: center; }
        .ic-td {
          padding: 13px 16px;
          font-size: 13px;
          color: #1e293b;
          border-bottom: 1px solid rgba(226,232,240,0.45);
          vertical-align: middle;
        }
        .ic-td-muted { color: #64748b; }
        .ic-td-right { text-align: right; }
        .ic-td-center { text-align: center; }
        .ic-tr { transition: background 0.14s; }
        .ic-tr:hover td { background: rgba(59,130,246,0.025); }
        .ic-tr:last-child td { border-bottom: none; }

        /* Session cell icon */
        .ic-session-icon {
          width: 40px; height: 40px; min-width: 40px;
          border-radius: 11px;
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.15);
          color: #3b82f6;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* Status badge */
        .ic-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          border: 1px solid transparent;
        }
        .ic-status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Progress bar */
        .ic-progress-bar-track {
          width: 80px; height: 5px;
          border-radius: 999px;
          background: rgba(226,232,240,0.8);
          overflow: hidden;
          margin-top: 5px;
        }
        .ic-progress-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        /* Action buttons */
        .ic-action-btn {
          width: 30px; height: 30px;
          border-radius: 8px;
          border: 1px solid rgba(226,232,240,0.8);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.18s;
          flex-shrink: 0;
        }
        .ic-action-btn:hover { transform: scale(1.1); }

        /* ── Pagination ─────────────────────────────────────────────────── */
        .ic-pagination-bar {
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(226,232,240,0.5);
          flex-wrap: wrap;
          gap: 10px;
          background: rgba(248,250,252,0.4);
        }
        .ic-page-btn {
          width: 30px; height: 30px;
          border-radius: 8px;
          border: 1.5px solid rgba(226,232,240,0.9);
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          font-size: 12px; font-weight: 700;
          color: #475569;
          transition: all 0.15s;
        }
        .ic-page-btn:hover:not(:disabled) {
          border-color: rgba(59,130,246,0.4);
          color: #3b82f6;
          background: rgba(59,130,246,0.05);
        }
        .ic-page-btn:disabled { cursor: default; opacity: 0.45; }
        .ic-page-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #fff;
          box-shadow: 0 3px 10px rgba(59,130,246,0.3);
        }
        .ic-page-ellipsis {
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; color: #94a3b8;
        }

        /* ── Header buttons ─────────────────────────────────────────────── */
        .ic-btn {
          padding: 9px 18px;
          border-radius: 12px; border: none;
          font-size: 13px; font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; gap: 7px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .ic-btn:hover { transform: translateY(-1px); }
        .ic-btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
          box-shadow: 0 4px 14px rgba(37,99,235,0.28);
        }
        .ic-btn-primary:hover { box-shadow: 0 6px 20px rgba(37,99,235,0.38); }
        .ic-btn-ghost {
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(226,232,240,0.8);
          color: #475569;
        }
        .ic-btn-ghost:hover { background: rgba(255,255,255,0.8); }

        /* ── Icon box ───────────────────────────────────────────────────── */
        .ic-icon-box {
          width: 30px; height: 30px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ── Empty / loading ────────────────────────────────────────────── */
        .ic-empty-cell {
          padding: 40px 16px;
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
        }

        /* ── Modal ──────────────────────────────────────────────────────── */
        .ic-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.35);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 2000; padding: 20px;
        }
        .ic-modal {
          width: 100%; max-width: 520px;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(20px);
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.6);
          box-shadow: 0 24px 60px rgba(0,0,0,0.18);
          overflow: hidden;
          animation: ic-modal-in 0.22s ease;
        }
        @keyframes ic-modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .ic-modal-header {
          padding: 18px 22px;
          border-bottom: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(248,250,252,0.6);
        }
        .ic-modal-body { padding: 22px; display: flex; flex-direction: column; gap: 14px; }
        .ic-modal-field-label {
          font-size: 10px; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
        }
        .ic-modal-field-val {
          font-size: 13px; font-weight: 600; color: #1e293b;
        }
        .ic-modal-footer {
          padding: 14px 22px;
          border-top: 1px solid rgba(226,232,240,0.55);
          display: flex; justify-content: flex-end; gap: 10px;
          background: rgba(248,250,252,0.4);
        }

        /* ── Misc ───────────────────────────────────────────────────────── */
        .ic-title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; }

        @keyframes ic-fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ic-fade-in { animation: ic-fade-in 0.2s ease; }

        @media (max-width: 768px) {
          .ic-root { padding: 16px; padding-top: 80px; }
          .ic-main-card { padding: 18px; }
          .ic-section-body { padding: 14px; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="ic-root">
        <div style={{ maxWidth: "95%", margin: "0 auto" }}>
          <div className="ic-main-card">

            {/* ── Page Header ───────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
              <div>
                {/* Breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, fontSize: 12, color: "#94a3b8" }}>
                  <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>
                    Dashboard
                  </Link>
                  <BreadArrow size={12} />
                  <Link to="/inventory" style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>
                    Inventory
                  </Link>
                  <BreadArrow size={12} />
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>Count Sessions</span>
                </div>

                {/* Title + subtitle */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(59,130,246,0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Clipboard size={20} />
                  </div>
                  <div>
                    <h4 className="ic-title">Inventory Count Sessions</h4>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 0" }}>
                      View and manage all created inventory count sessions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <button type="button" className="ic-btn ic-btn-ghost" onClick={fetchSessions}>
                  <RefreshCw size={13} /> Refresh
                </button>
                <button
                  type="button"
                  className="ic-btn ic-btn-primary"
                  onClick={() => navigate("/inventory/count-sessions/create")}
                >
                  <Plus size={14} /> Create Session
                </button>
              </div>
            </div>

            {/* ── Overview Stats ─────────────────────────────────────────────── */}
            <div className="ic-stats-grid" style={{ marginBottom: 20 }}>
              {[
                { title: "Total Sessions", value: stats.total,     icon: <BarChart2 size={15} />,   bg: "rgba(59,130,246,0.1)",  color: "#3b82f6" },
                { title: "Draft",          value: stats.draft,     icon: <Clock size={15} />,       bg: "rgba(245,158,11,0.1)",  color: "#b45309" },
                { title: "In Progress",    value: stats.progress,  icon: <Activity size={15} />,    bg: "rgba(59,130,246,0.1)",  color: "#2563eb" },
                { title: "Submitted",      value: stats.submitted, icon: <AlertCircle size={15} />, bg: "rgba(139,92,246,0.1)",  color: "#7c3aed" },
                { title: "Completed",      value: stats.completed, icon: <CheckCircle size={15} />, bg: "rgba(16,185,129,0.1)",  color: "#059669" },
              ].map((s) => (
                <div key={s.title} className="ic-stat-card">
                  <div className="ic-stat-icon" style={{ background: s.bg, color: s.color }}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="ic-stat-val" style={{ color: s.color }}>{s.value}</div>
                    <div className="ic-stat-lbl">{s.title}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Filters ────────────────────────────────────────────────────── */}
            <div className="ic-section-card">
              <div className="ic-section-header">
                <div className="ic-section-header-left">
                  <div className="ic-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <Filter size={13} />
                  </div>
                  <h2 className="ic-section-title">Filters & Search</h2>
                </div>
                {(searchQuery || statusFilter !== "all") && (
                  <button
                    type="button"
                    className="ic-btn ic-btn-ghost"
                    style={{ padding: "5px 12px", fontSize: 11, borderRadius: 8 }}
                    onClick={() => { setSearchQuery(""); setStatusFilter("all"); setCurrentPage(1); }}
                  >
                    <X size={11} /> Clear Filters
                  </button>
                )}
              </div>

              <div className="ic-section-body">
                <div className="ic-filter-row">
                  {/* Search */}
                  <div className="ic-field-block" style={{ flex: "1 1 320px", minWidth: 220 }}>
                    <label className="ic-field-label">Search sessions</label>
                    <div className="ic-input-wrap">
                      <Search size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <input
                        type="text"
                        className="ic-input"
                        placeholder="Session code, warehouse, category, type..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="ic-field-block" style={{ flex: "0 1 200px", minWidth: 160 }}>
                    <label className="ic-field-label">Status</label>
                    <div className="ic-input-wrap">
                      <Filter size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <select
                        className="ic-select"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                      >
                        <option value="all">All Status</option>
                        <option value="Draft">Draft</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Rows per page */}
                  <div className="ic-field-block" style={{ flex: "0 1 120px", minWidth: 100 }}>
                    <label className="ic-field-label">Rows / page</label>
                    <div className="ic-input-wrap">
                      <select
                        className="ic-select"
                        value={rows}
                        onChange={(e) => { setRows(Number(e.target.value)); setCurrentPage(1); }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Error banner ───────────────────────────────────────────────── */}
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 12, padding: "12px 16px", marginBottom: 16,
                display: "flex", alignItems: "center", gap: 10,
                color: "#b91c1c", fontSize: 13, fontWeight: 500,
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* ── Sessions Table ──────────────────────────────────────────────── */}
            <div className="ic-table-card">
              <div className="ic-section-header" style={{ borderRadius: "18px 18px 0 0" }}>
                <div className="ic-section-header-left">
                  <div className="ic-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <Clipboard size={13} />
                  </div>
                  <h2 className="ic-section-title">Created Sessions</h2>
                  <span style={{
                    background: "rgba(59,130,246,0.1)", color: "#3b82f6",
                    fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                  }}>
                    {filteredSessions.length} records
                  </span>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1050 }}>
                  <thead>
                    <tr>
                      <th className="ic-th">Session</th>
                      <th className="ic-th">Count Type</th>
                      <th className="ic-th">Store ID</th>
                      <th className="ic-th">Scope</th>
                      <th className="ic-th">Category</th>
                      <th className="ic-th ic-th-right">Items</th>
                      <th className="ic-th ic-th-right">Progress</th>
                      <th className="ic-th">Status</th>
                      <th className="ic-th">Created On</th>
                      <th className="ic-th ic-th-center" style={{ width: 90 }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={10} className="ic-empty-cell">
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div className="spinner-border" style={{ width: 28, height: 28, color: "#3b82f6" }} role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <span style={{ fontSize: 13, color: "#94a3b8" }}>Loading sessions…</span>
                          </div>
                        </td>
                      </tr>
                    ) : paginated.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="ic-empty-cell">
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 48, height: 48, borderRadius: 14,
                              background: "rgba(148,163,184,0.1)", display: "flex",
                              alignItems: "center", justifyContent: "center",
                            }}>
                              <Clipboard size={22} style={{ color: "#cbd5e1" }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#64748b", fontSize: 14 }}>No sessions found</div>
                              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 3 }}>
                                {searchQuery || statusFilter !== "all" ? "Try adjusting your filters." : "Create your first session to get started."}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginated.map((session) => {
                        const statusMeta      = getStatusMeta(session.status);
                        const itemsArr        = Array.isArray(session.items) ? session.items : [];
                        const approvedCnt     = itemsArr.filter(i => i.approvalStatus === "approved" || i.approvalStatus === "complete").length;
                        const total           = session.totalItems ?? itemsArr.length;
                        const progressPct     = total === 0 ? 0 : Math.round((approvedCnt / total) * 100);
                        const progressText    = `${approvedCnt} / ${total}`;
                        const isComplete      = session.status === "Completed";

                        return (
                          <tr key={session.sessionId} className="ic-tr ic-fade-in">

                            {/* Session */}
                            <td className="ic-td">
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div className="ic-session-icon">
                                  <Clipboard size={16} />
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                                    {session.sessionCode}
                                  </div>
                                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                                    {session.scopeType} Session
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Count Type */}
                            <td className="ic-td ic-td-muted">{session.countType || "—"}</td>

                            {/* Store ID */}
                            <td className="ic-td ic-td-muted">{session.storeId || "N/A"}</td>

                            {/* Scope */}
                            <td className="ic-td ic-td-muted">{session.scopeType || "—"}</td>

                            {/* Category */}
                            <td className="ic-td">
                              {session.categoryName ? (
                                <span style={{
                                  background: "rgba(100,116,139,0.08)", color: "#475569",
                                  padding: "2px 9px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                                }}>
                                  {session.categoryName}
                                </span>
                              ) : <span style={{ color: "#94a3b8" }}>N/A</span>}
                            </td>

                            {/* Items */}
                            <td className="ic-td ic-td-right">
                              <span style={{ fontWeight: 700, color: "#0f172a" }}>{total}</span>
                            </td>

                            {/* Progress */}
                            <td className="ic-td ic-td-right">
                              <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end" }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                                  {progressText}
                                </span>
                                <div className="ic-progress-bar-track">
                                  <div
                                    className="ic-progress-bar-fill"
                                    style={{
                                      width: `${progressPct}%`,
                                      background: isComplete
                                        ? "linear-gradient(90deg,#10b981,#059669)"
                                        : "linear-gradient(90deg,#3b82f6,#2563eb)",
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>
                                  {progressPct}%
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="ic-td">
                              <span
                                className="ic-status-badge"
                                style={{
                                  background: statusMeta.bg,
                                  color: statusMeta.color,
                                  borderColor: statusMeta.border,
                                }}
                              >
                                <span className="ic-status-dot" style={{ background: statusMeta.dot }} />
                                {session.status}
                              </span>
                            </td>

                            {/* Created On */}
                            <td className="ic-td ic-td-muted" style={{ fontSize: 12 }}>
                              {new Date(session.startDate || session.createdOn).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric",
                              })}
                            </td>

                            {/* Actions */}
                            <td className="ic-td ic-td-center">
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                                {/* View */}
                                <button
                                  type="button"
                                  className="ic-action-btn"
                                  title="View Session"
                                  style={{ background: "rgba(59,130,246,0.08)", color: "#3b82f6", borderColor: "rgba(59,130,246,0.2)" }}
                                  onClick={() => navigate(`/inventory/count-sessions/review/${session.sessionId}`, { state: { storeId: session.storeId } })}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.color = "#fff"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.08)"; e.currentTarget.style.color = "#3b82f6"; }}
                                >
                                  <Eye size={13} />
                                </button>

                                {/* Edit */}
                                <button
                                  type="button"
                                  className="ic-action-btn"
                                  title="Edit Session"
                                  style={{ background: "rgba(245,158,11,0.08)", color: "#b45309", borderColor: "rgba(245,158,11,0.2)" }}
                                  onClick={() => navigate(`/inventory/count-sessions/edit/${session.sessionId}`, { state: { storeId: session.storeId } })}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f59e0b"; e.currentTarget.style.color = "#fff"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.08)"; e.currentTarget.style.color = "#b45309"; }}
                                >
                                  <Edit3 size={13} />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ─────────────────────────────────────────────── */}
              {!loading && filteredSessions.length > 0 && (
                <div className="ic-pagination-bar">
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                    Showing <strong style={{ color: "#0f172a" }}>{startRecord}</strong>–<strong style={{ color: "#0f172a" }}>{endRecord}</strong> of{" "}
                    <strong style={{ color: "#0f172a" }}>{filteredSessions.length}</strong> sessions
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    {/* Prev */}
                    <button
                      type="button"
                      className="ic-page-btn"
                      disabled={safePage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft size={14} />
                    </button>

                    {/* Page numbers */}
                    {getPageNumbers().map((p, i) =>
                      p === "..." ? (
                        <div key={`ellipsis-${i}`} className="ic-page-ellipsis">…</div>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          className={`ic-page-btn${p === safePage ? " active" : ""}`}
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      type="button"
                      className="ic-page-btn"
                      disabled={safePage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* ── Session Detail Modal ─────────────────────────────────────────────── */}
      {showModal && selectedSession && (
        <div className="ic-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ic-modal" onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="ic-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clipboard size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Session Details</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{selectedSession.sessionCode}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "rgba(100,116,139,0.08)", border: "1px solid rgba(226,232,240,0.8)", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal body */}
            <div className="ic-modal-body">
              {[
                { label: "Session Code",  value: selectedSession.sessionCode },
                { label: "Count Type",    value: selectedSession.countType },
                { label: "Store ID",      value: selectedSession.storeId || "N/A" },
                { label: "Scope",         value: selectedSession.scopeType },
                { label: "Category",      value: selectedSession.categoryName || "N/A" },
                { label: "Total Items",   value: selectedSession.totalItems ?? (selectedSession.items?.length || 0) },
                { label: "Start Date",    value: new Date(selectedSession.startDate || selectedSession.createdOn).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column" }}>
                  <span className="ic-modal-field-label">{label}</span>
                  <span className="ic-modal-field-val">{value}</span>
                </div>
              ))}

              {/* Status badge */}
              <div>
                <div className="ic-modal-field-label">Status</div>
                {(() => {
                  const m = getStatusMeta(selectedSession.status);
                  return (
                    <span className="ic-status-badge" style={{ background: m.bg, color: m.color, borderColor: m.border }}>
                      <span className="ic-status-dot" style={{ background: m.dot }} />
                      {selectedSession.status}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Modal footer */}
            <div className="ic-modal-footer">
              <button
                type="button"
                className="ic-btn ic-btn-ghost"
                style={{ padding: "8px 16px" }}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="ic-btn ic-btn-primary"
                style={{ padding: "8px 16px" }}
                onClick={() => { setShowModal(false); navigate(`/inventory/count-sessions/posted/${selectedSession.sessionId}`); }}
              >
                <Eye size={13} /> View Full Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryCounts;