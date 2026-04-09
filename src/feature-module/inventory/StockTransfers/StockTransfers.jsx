import React, { useState, useMemo, useEffect } from "react";
import {
  Plus, Search, Eye, Edit2, Filter, RefreshCw, Package,
  ChevronLeft, ChevronRight, ArrowUpRight, Truck,
  Clock, CheckCircle, Hash, TrendingUp,
} from "react-feather";
import { all_routes } from "../../../routes/all_routes";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { URLS } from "../../../Urls";

const PAGE_SIZE = 10;

// ─────────────────────────────────────────
// Status config
// ─────────────────────────────────────────
const STATUS_META = {
  Draft:      { color: "#92400e", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  dot: "#f59e0b" },
  Pending:    { color: "#2563eb", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  dot: "#3b82f6" },
  Approved:   { color: "#059669", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  dot: "#10b981" },
  Dispatched: { color: "#7c3aed", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)",  dot: "#8b5cf6" },
  Received:   { color: "#0369a1", bg: "rgba(14,165,233,0.1)",  border: "rgba(14,165,233,0.25)",  dot: "#0ea5e9" },
  Cancelled:  { color: "#dc2626", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   dot: "#ef4444" },
};

const getStatusMeta = (status) => {
  const s = status ? status.toLowerCase() : "";
  if (s === "draft") return STATUS_META.Draft;
  if (s === "pending") return STATUS_META.Pending;
  if (s === "approved" || s === "approve") return STATUS_META.Approved;
  if (s === "dispatched") return STATUS_META.Dispatched;
  if (s === "received") return STATUS_META.Received;
  if (s === "cancelled") return STATUS_META.Cancelled;
  return { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)", dot: "#94a3b8" };
};

// ─────────────────────────────────────────
// Avatar color bank
// ─────────────────────────────────────────
const AVATAR_COLORS = [
  ["rgba(59,130,246,0.15)",  "#1d4ed8"],
  ["rgba(16,185,129,0.15)",  "#065f46"],
  ["rgba(139,92,246,0.15)",  "#6d28d9"],
  ["rgba(245,158,11,0.15)",  "#92400e"],
  ["rgba(239,68,68,0.15)",   "#991b1b"],
  ["rgba(20,184,166,0.15)",  "#0d9488"],
];
const getAvatarColor = (name = "") => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

// ─────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const m = getStatusMeta(status);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 11px", borderRadius: 20,
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      fontWeight: 700, fontSize: 11,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : ""}
    </span>
  );
};

// ─────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, iconBg, iconColor, valueColor }) => (
  <div style={{
    background: "rgba(255,255,255,0.52)", border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: 18, padding: "18px 20px",
    display: "flex", alignItems: "center", gap: 14,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 13, flexShrink: 0,
      background: iconBg, color: iconColor,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={19} />
    </div>
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: valueColor || "#0f172a", lineHeight: 1 }}>
        {value}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
const StockTransferList = () => {
  const navigate = useNavigate();

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page,         setPage]         = useState(1);
  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);

  const fetchTransfers = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`${URLS.GetAllStockTransfers}?page=${page}&search=${search}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data || []);
        setTotalRecords(result.totalRecords || 0);
        setTotalPages(result.totalPages || 1);
      } else {
        toast.error(result.message || "Failed to fetch stock transfers");
      }
    } catch (err) {
      toast.error("Network error while fetching stock transfers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [page, search]);

  const filtered = useMemo(() => data.filter((t) => {
    return statusFilter === "All" || (t.status && t.status.toLowerCase() === statusFilter.toLowerCase());
  }), [data, statusFilter]);

  const stats = {
    total:      totalRecords,
    dispatched: data.filter((t) => t.status && t.status.toLowerCase() === "dispatched").length,
    inProgress: data.filter((t) => t.status && ["pending", "approved", "approve"].includes(t.status.toLowerCase())).length,
    draft:      data.filter((t) => t.status && t.status.toLowerCase() === "draft").length,
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .stl-root {
          background: linear-gradient(135deg, #f8faff 0%, #dbe8ff 100%);
          min-height: 100vh;
          padding: 24px;
          padding-top: 100px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ── Main glass card ──────────────────────────────────────────── */
        .stl-main-card {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          padding: 28px 32px;
          margin-bottom: 24px;
        }

        /* ── Stats grid ───────────────────────────────────────────────── */
        .stl-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        @media (max-width: 900px) { .stl-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .stl-stats-grid { grid-template-columns: 1fr; } }

        /* ── Table card ───────────────────────────────────────────────── */
        .stl-table-card {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px; overflow: hidden;
        }

        /* ── Toolbar ──────────────────────────────────────────────────── */
        .stl-toolbar {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
          background: rgba(255,255,255,0.4);
        }
        .stl-toolbar-left  { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .stl-toolbar-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

        /* Search */
        .stl-search-wrap {
          display: flex; align-items: center; gap: 8px;
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 11px; padding: 0 14px; height: 38px; min-width: 280px;
          transition: border-color 0.2s;
        }
        .stl-search-wrap:focus-within { border-color: rgba(59,130,246,0.4); }
        .stl-search-wrap input {
          border: none; outline: none; background: transparent;
          font-size: 13px; color: #1e293b; flex: 1; font-family: inherit;
        }
        .stl-search-wrap input::placeholder { color: #94a3b8; }

        /* Select */
        .stl-select {
          height: 38px; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 11px; background: #fff; padding: 0 14px;
          font-size: 13px; font-weight: 500; color: #1e293b;
          outline: none; appearance: none; -webkit-appearance: none;
          cursor: pointer; font-family: inherit; transition: border-color 0.2s;
          min-width: 140px;
        }
        .stl-select:focus { border-color: rgba(59,130,246,0.4); }

        /* ── Table ────────────────────────────────────────────────────── */
        .stl-th {
          padding: 11px 14px;
          font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.5px;
          background: rgba(248,250,252,0.7);
          border-bottom: 1px solid rgba(226,232,240,0.6);
          white-space: nowrap; text-align: left;
        }
        .stl-th-c { text-align: center; }

        .stl-td {
          padding: 13px 14px;
          font-size: 13px; color: #1e293b;
          border-bottom: 1px solid rgba(226,232,240,0.4);
          vertical-align: middle; white-space: nowrap;
        }
        .stl-td-c { text-align: center; }

        .stl-tr { transition: background 0.13s; cursor: pointer; }
        .stl-tr:hover td { background: rgba(59,130,246,0.025); }
        .stl-tr:last-child td { border-bottom: none; }

        /* Transfer ID */
        .stl-transfer-id {
          display: inline-flex; align-items: center; gap: 5px;
          font-weight: 700; color: #2563eb; font-size: 13px;
        }

        /* Avatar */
        .stl-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800; flex-shrink: 0;
        }

        /* Warehouse route cell */
        .stl-route {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: #475569;
        }
        .stl-route-arrow {
          width: 18px; height: 18px; border-radius: 5px;
          background: rgba(59,130,246,0.08); color: #3b82f6;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* Qty pill */
        .stl-qty-pill {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.2);
          color: #0369a1; padding: 3px 10px; border-radius: 20px;
          font-size: 12px; font-weight: 700;
        }

        /* Action buttons */
        .stl-act-btn {
          width: 30px; height: 30px; border-radius: 9px; border: 1px solid transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s;
        }
        .stl-act-view  { background: rgba(59,130,246,0.08);  border-color: rgba(59,130,246,0.2);  color: #2563eb; }
        .stl-act-view:hover  { background: rgba(59,130,246,0.18); transform: translateY(-1px); }
        .stl-act-edit  { background: rgba(234,88,12,0.08);   border-color: rgba(234,88,12,0.2);   color: #ea580c; }
        .stl-act-edit:hover  { background: rgba(234,88,12,0.18);  transform: translateY(-1px); }

        /* ── Pagination ───────────────────────────────────────────────── */
        .stl-pagination {
          padding: 13px 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
          border-top: 1px solid rgba(226,232,240,0.55);
          background: rgba(255,255,255,0.4);
        }
        .stl-pager-info { font-size: 12px; font-weight: 500; color: #64748b; }
        .stl-pager-controls { display: flex; align-items: center; gap: 5px; }
        .stl-page-btn {
          width: 32px; height: 32px; border-radius: 9px;
          border: 1.5px solid rgba(226,232,240,0.9);
          background: #fff; color: #64748b; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; transition: all 0.18s;
        }
        .stl-page-btn:hover:not(:disabled):not(.active) {
          background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.3); color: #2563eb;
        }
        .stl-page-btn.active {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-color: transparent; color: #fff;
          box-shadow: 0 3px 8px rgba(37,99,235,0.28);
        }
        .stl-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Buttons ──────────────────────────────────────────────────── */
        .stl-btn {
          height: 38px; padding: 0 16px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px;
          transition: all 0.2s; white-space: nowrap; font-family: inherit;
        }
        .stl-btn:hover { transform: translateY(-1px); }

        .stl-btn-primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; box-shadow: 0 4px 14px rgba(5,150,105,0.22);
        }
        .stl-btn-primary:hover { box-shadow: 0 6px 20px rgba(5,150,105,0.32); }

        .stl-btn-ghost {
          background: rgba(255,255,255,0.5);
          border: 1.5px solid rgba(226,232,240,0.9); color: #475569;
        }
        .stl-btn-ghost:hover { background: rgba(255,255,255,0.85); }

        /* ── Empty state ──────────────────────────────────────────────── */
        .stl-empty {
          padding: 54px 20px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .stl-empty-icon {
          width: 54px; height: 54px; border-radius: 16px;
          background: rgba(148,163,184,0.1);
          display: flex; align-items: center; justify-content: center;
        }

        /* ── Title ────────────────────────────────────────────────────── */
        .stl-title { font-size: 23px; font-weight: 700; color: #0f172a; margin: 0; }

        /* ── Shimmer loading skeleton ──────────────────────────────────── */
        @keyframes stl-shimmer { 0%,100% { opacity: 0.4; } 50% { opacity: 0.9; } }
        .stl-skeleton {
          background: rgba(226,232,240,0.6); border-radius: 6px;
          animation: stl-shimmer 1.4s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .stl-root { padding: 16px; padding-top: 80px; }
          .stl-main-card { padding: 18px; }
          .stl-search-wrap { min-width: 200px; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} />
      <div className="stl-root">
        <div style={{ maxWidth: "95%", margin: "0 auto" }}>
          <div className="stl-main-card">

            {/* ── Page Header ───────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
              <div>
                {/* Breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, fontSize: 12, color: "#94a3b8" }}>
                  <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>Dashboard</Link>
                  <ChevronRight size={12} />
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>Stock Transfers</span>
                </div>

                {/* Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                    background: "rgba(59,130,246,0.1)", color: "#3b82f6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Truck size={20} />
                  </div>
                  <div>
                    <h4 className="stl-title">Stock Transfers</h4>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 0" }}>
                      Manage and track all warehouse stock transfer requests.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button type="button" className="stl-btn stl-btn-ghost" onClick={fetchTransfers}>
                  <RefreshCw size={13} /> Refresh
                </button>
                <button
                  type="button"
                  className="stl-btn stl-btn-primary"
                  onClick={() => navigate(all_routes.createTransfer)}
                >
                  <Plus size={14} /> New Transfer
                </button>
              </div>
            </div>

            {/* ── Stats ─────────────────────────────────────────────────────── */}
            <div className="stl-stats-grid">
              <StatCard
                icon={Package}
                label="Total Transfers"
                value={stats.total}
                iconBg="rgba(59,130,246,0.1)"
                iconColor="#3b82f6"
              />
              <StatCard
                icon={Truck}
                label="Dispatched"
                value={stats.dispatched}
                iconBg="rgba(139,92,246,0.1)"
                iconColor="#7c3aed"
                valueColor="#7c3aed"
              />
              <StatCard
                icon={TrendingUp}
                label="In Progress"
                value={stats.inProgress}
                iconBg="rgba(59,130,246,0.1)"
                iconColor="#3b82f6"
                valueColor="#2563eb"
              />
              <StatCard
                icon={Clock}
                label="Draft"
                value={stats.draft}
                iconBg="rgba(245,158,11,0.1)"
                iconColor="#f59e0b"
                valueColor="#b45309"
              />
            </div>

            {/* ── Table Card ────────────────────────────────────────────────── */}
            <div className="stl-table-card">

              {/* Toolbar */}
              <div className="stl-toolbar">
                <div className="stl-toolbar-left">
                  {/* Search */}
                  <div className="stl-search-wrap">
                    <Search size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
                    <input
                      placeholder="Search by ID, requester or warehouse…"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => { setSearch(""); setPage(1); }}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Status filter */}
                  <select
                    className="stl-select"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  >
                    <option value="All">All Statuses</option>
                    <option>Draft</option>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Dispatched</option>
                    <option>Received</option>
                    <option>Cancelled</option>
                  </select>
                </div>

                <div className="stl-toolbar-right">
                  {/* Result count */}
                  <span style={{
                    background: "rgba(59,130,246,0.08)", color: "#3b82f6",
                    padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                  }}>
                    {totalRecords} result{totalRecords !== 1 ? "s" : ""}
                  </span>

                  {/* Active filter chip */}
                  {statusFilter !== "All" && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: getStatusMeta(statusFilter).bg,
                      color: getStatusMeta(statusFilter).color,
                      border: `1px solid ${getStatusMeta(statusFilter).border}`,
                      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    }}>
                      {statusFilter}
                      <button
                        type="button"
                        onClick={() => { setStatusFilter("All"); setPage(1); }}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", lineHeight: 1, display: "flex" }}
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                  <thead>
                    <tr>
                      <th className="stl-th" style={{ width: 44 }}>#</th>
                      <th className="stl-th">Transfer ID</th>
                      <th className="stl-th">Date</th>
                      <th className="stl-th">Route</th>
                      <th className="stl-th">Requested By</th>
                      <th className="stl-th stl-th-c">Items</th>
                      <th className="stl-th stl-th-c">Total Qty</th>
                      <th className="stl-th">Status</th>
                      <th className="stl-th stl-th-c">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Empty state */}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={9}>
                          <div className="stl-empty">
                            <div className="stl-empty-icon">
                              <Package size={24} style={{ color: "#cbd5e1" }} />
                            </div>
                            <div style={{ fontWeight: 600, color: "#64748b", fontSize: 14 }}>No transfers found</div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>
                              Try adjusting your search or status filter.
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {loading && filtered.length === 0 && Array.from({ length: 5 }).map((_, i) => (
                      <tr key={`skel-${i}`}>
                        {[40, 100, 80, 150, 120, 60, 60, 80, 80].map((w, j) => (
                          <td key={j} className="stl-td">
                            <div className="stl-skeleton" style={{ height: 14, width: w }} />
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Data rows */}
                    {filtered.map((row, i) => {
                      const reqBy = row.requestedByName || row.requestedBy || "User";
                      const [avatarBg, avatarColor] = getAvatarColor(reqBy);
                      
                      // Calculate Items and Total Qty
                      const numItems = row.items ? row.items.length : 0;
                      const totalQty = row.items ? row.items.reduce((sum, it) => sum + (Number(it.transferQty) || 0), 0) : 0;

                      return (
                        <tr
                          key={row.id}
                          className="stl-tr"
                          onClick={() => navigate(all_routes.viewtransfer.replace(":id", row.id))}
                        >
                          {/* # */}
                          <td className="stl-td">
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>
                              {(page - 1) * PAGE_SIZE + i + 1}
                            </span>
                          </td>

                          {/* Transfer ID */}
                          <td className="stl-td">
                            <div className="stl-transfer-id">
                              <Hash size={11} style={{ opacity: 0.6 }} />
                              {row.transferCode}
                              <ArrowUpRight size={11} style={{ opacity: 0.4 }} />
                            </div>
                          </td>

                          {/* Date */}
                          <td className="stl-td">
                            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", fontSize: 12 }}>
                              <Clock size={11} style={{ color: "#94a3b8", flexShrink: 0 }} />
                              {row.transferDate ? new Date(row.transferDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                            </div>
                          </td>

                          {/* Route (Source → Destination) */}
                          <td className="stl-td">
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
                                <span style={{ fontWeight: 600, color: "#0f172a" }}>{row.sourceWarehouseName}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, paddingLeft: 2 }}>
                                <div style={{ width: 3, height: 10, marginLeft: 2, borderLeft: "2px dashed rgba(59,130,246,0.3)" }} />
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                                <span style={{ fontWeight: 600, color: "#0f172a" }}>{row.destinationWarehouseName}</span>
                              </div>
                            </div>
                          </td>

                          {/* Requested By */}
                          <td className="stl-td">
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div
                                className="stl-avatar"
                                style={{ background: avatarBg, color: avatarColor }}
                              >
                                {reqBy.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                              </div>
                              <span style={{ fontWeight: 600, fontSize: 13 }}>{reqBy}</span>
                            </div>
                          </td>

                          {/* Items */}
                          <td className="stl-td stl-td-c">
                            <span style={{
                              background: "rgba(100,116,139,0.08)", color: "#475569",
                              padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                            }}>
                              {numItems}
                            </span>
                          </td>

                          {/* Total Qty */}
                          <td className="stl-td stl-td-c">
                            <span className="stl-qty-pill">{totalQty}</span>
                          </td>

                          {/* Status */}
                          <td className="stl-td">
                            <StatusBadge status={row.status} />
                          </td>

                          {/* Actions */}
                          <td className="stl-td stl-td-c" onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                              <button
                                type="button"
                                className="stl-act-btn stl-act-view"
                                title="View"
                                onClick={() => navigate(all_routes.viewtransfer.replace(":id", row.id))}
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                type="button"
                                className="stl-act-btn stl-act-edit"
                                title="Edit"
                                onClick={() => navigate(all_routes.edittransfer.replace(":id", row.id))}
                              >
                                <Edit2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalRecords > 0 && (
                <div className="stl-pagination">
                  <div className="stl-pager-info">
                    Showing{" "}
                    <strong>{Math.min((page - 1) * PAGE_SIZE + 1, totalRecords)}–{Math.min(page * PAGE_SIZE, totalRecords)}</strong>
                    {" "}of <strong>{totalRecords}</strong> transfers
                  </div>

                  <div className="stl-pager-controls">
                    <button
                      type="button"
                      className="stl-page-btn"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft size={14} />
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let p;
                      if (totalPages <= 5) p = i + 1;
                      else if (page <= 3) p = i + 1;
                      else if (page >= totalPages - 2) p = totalPages - 4 + i;
                      else p = page - 2 + i;
                      return (
                        <button
                          key={p}
                          type="button"
                          className={`stl-page-btn${page === p ? " active" : ""}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      className="stl-page-btn"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
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
    </>
  );
};

export default StockTransferList;