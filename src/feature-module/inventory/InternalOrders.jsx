import { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommonFooter from "../../components/footer/commonFooter";
import {
  Plus, Search, ChevronDown, ChevronLeft, ChevronRight,
  Check, Calendar, ArrowUpRight, Package, User,
  MapPin, Clock, TrendingUp, Filter, RefreshCw, ChevronRight as Chevron,
} from "react-feather";
import { useNavigate, Link } from "react-router-dom";
import { URLS } from "../../Urls";


const InternalOrders = () => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]         = useState("");
  const [statusFilter, setStatusFilter]       = useState("All");
  const [dateFilter, setDateFilter]           = useState("Last 30 Days");
  const [rows, setRows]                       = useState(10);
  const [currentPage, setCurrentPage]         = useState(1);
  const [orders, setOrders]                   = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [totalRecords, setTotalRecords]       = useState(0);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const res    = await fetch(URLS.GetAllInternalOrders, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ search: searchQuery, page: currentPage, limit: rows, storeId: localStorage.getItem("selectedStoreId") }),
      });
      const result = await res.json();
      if (result.success) {
        setOrders(result.data || []);
        setTotalRecords(result.total || 0);
      } else {
        toast.error(result.message || "Failed to fetch orders");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [currentPage, rows, searchQuery]);

  // ── Status steps ───────────────────────────────────────────────────────────
  const statusSteps = useMemo(() => [
    { key: "Draft",      label: "Draft",      color: "#64748b", bg: "rgba(100,116,139,0.1)" },
    { key: "Submitted",  label: "Submitted",  color: "#2563eb", bg: "rgba(59,130,246,0.1)"  },
    { key: "Approved",   label: "Approved",   color: "#059669", bg: "rgba(16,185,129,0.1)"  },
    { key: "Dispatched", label: "Dispatched", color: "#b45309", bg: "rgba(245,158,11,0.1)"  },
    { key: "Received",   label: "Received",   color: "#7c3aed", bg: "rgba(139,92,246,0.1)"  },
  ].map((step) => ({
    ...step,
    count: orders.filter((o) =>
      step.key === "Approved"
        ? o.status === "Approve" || o.status === "Approved"
        : o.status === step.key
    ).length,
  })), [orders]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages      = Math.max(1, Math.ceil(totalRecords / rows));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startRecord     = totalRecords === 0 ? 0 : (safeCurrentPage - 1) * rows + 1;
  const endRecord       = Math.min(safeCurrentPage * rows, totalRecords);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "NA";
    return name.split(" ").slice(0, 2).map((p) => p[0] || "").join("").toUpperCase();
  };

  const getStatusMeta = (status) => {
    switch (status) {
      case "Approve":
      case "Approved":   return { color: "#059669", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  dot: "#10b981" };
      case "Submitted":
      case "pending":    return { color: "#2563eb", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  dot: "#3b82f6" };
      case "Dispatched": return { color: "#b45309", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  dot: "#f59e0b" };
      case "Received":
      case "Completed":  return { color: "#7c3aed", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)",  dot: "#8b5cf6" };
      default:           return { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)", dot: "#94a3b8" };
    }
  };

  const avatarColors = [
    ["#dbeafe","#1d4ed8"],["#dcfce7","#15803d"],["#fce7f3","#be185d"],
    ["#fef3c7","#92400e"],["#ede9fe","#6d28d9"],["#fee2e2","#991b1b"],
  ];
  const getAvatarColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length] || avatarColors[0];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .io-root {
          background: linear-gradient(135deg, #f8faff 0%, #dbe8ff 100%);
          min-height: 100vh;
          padding: 24px;
          padding-top: 100px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ── Main glass card ──────────────────────────────────────────── */
        .io-main-card {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          padding: 28px 32px;
          margin-bottom: 24px;
        }

        /* ── Section sub-cards ────────────────────────────────────────── */
        .io-card {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px;
          margin-bottom: 18px;
          overflow: visible;
        }
        .io-card-header {
          padding: 13px 20px;
          border-bottom: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; flex-wrap: wrap;
          background: rgba(255,255,255,0.4);
          border-radius: 18px 18px 0 0;
        }
        .io-card-header-left { display: flex; align-items: center; gap: 9px; }
        .io-card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }

        /* ── Icon box ─────────────────────────────────────────────────── */
        .io-icon-box {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* ── Status pipeline ──────────────────────────────────────────── */
        .io-pipeline {
          display: flex; align-items: stretch;
          gap: 0; padding: 18px 20px; overflow-x: auto;
        }
        .io-pipe-step {
          flex: 1; min-width: 110px;
          display: flex; align-items: center; position: relative;
        }
        .io-pipe-step:not(:last-child)::after {
          content: "";
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          width: 1px; height: 60%; background: rgba(226,232,240,0.7);
        }
        .io-pipe-inner {
          flex: 1; padding: 10px 16px;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          cursor: pointer; border-radius: 12px; transition: background 0.18s;
        }
        .io-pipe-inner:hover { background: rgba(59,130,246,0.04); }
        .io-pipe-bubble {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800;
          transition: transform 0.18s;
        }
        .io-pipe-inner:hover .io-pipe-bubble { transform: scale(1.1); }
        .io-pipe-label {
          font-size: 12px; font-weight: 700; color: #64748b; text-align: center;
        }

        /* ── Filter row ───────────────────────────────────────────────── */
        .io-filter-body {
          padding: 16px 20px;
          display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
        }
        .io-filter-item { flex: 1; min-width: 160px; position: relative; }
        .io-filter-item-wide { flex: 2; min-width: 240px; }
        .io-select {
          width: 100%; height: 38px;
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 11px; padding: 0 36px 0 14px;
          font-size: 13px; font-weight: 500; color: #1e293b;
          appearance: none; -webkit-appearance: none; cursor: pointer;
          font-family: inherit; outline: none; transition: border-color 0.2s;
        }
        .io-select:focus { border-color: rgba(59,130,246,0.4); }
        .io-select-with-icon { padding-left: 36px; }
        .io-input {
          width: 100%; height: 38px;
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 11px; padding: 0 14px 0 36px;
          font-size: 13px; color: #1e293b; outline: none;
          font-family: inherit; transition: border-color 0.2s;
        }
        .io-input:focus { border-color: rgba(59,130,246,0.4); }
        .io-input::placeholder { color: #94a3b8; }
        .io-field-icon {
          position: absolute; top: 50%; transform: translateY(-50%);
          pointer-events: none; color: #94a3b8;
        }
        .io-field-icon-left  { left: 11px; }
        .io-field-icon-right { right: 11px; }

        /* ── Table card ───────────────────────────────────────────────── */
        .io-table-card {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px; overflow: hidden; margin-bottom: 18px;
        }
        .io-th {
          padding: 11px 14px;
          font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.5px;
          background: rgba(248,250,252,0.7);
          border-bottom: 1px solid rgba(226,232,240,0.6);
          white-space: nowrap; text-align: left;
        }
        .io-td {
          padding: 13px 14px;
          font-size: 13px; color: #1e293b;
          border-bottom: 1px solid rgba(226,232,240,0.4);
          vertical-align: middle; white-space: nowrap;
        }
        .io-tr { transition: background 0.13s; cursor: pointer; }
        .io-tr:hover td { background: rgba(59,130,246,0.03); }
        .io-tr:last-child td { border-bottom: none; }
        .io-tr-active td { background: rgba(59,130,246,0.05) !important; }

        /* Order code link style */
        .io-order-code {
          font-weight: 700; color: #2563eb; font-size: 13px;
          display: flex; align-items: center; gap: 5px;
        }
        .io-order-code:hover { text-decoration: underline; }

        /* Status badge */
        .io-status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 20px;
          font-size: 11px; font-weight: 700; border: 1px solid transparent;
        }
        .io-status-dot {
          width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
        }

        /* Avatar */
        .io-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800; flex-shrink: 0;
        }

        /* ── Table footer / pagination ────────────────────────────────── */
        .io-table-footer {
          padding: 12px 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
          border-top: 1px solid rgba(226,232,240,0.55);
          background: rgba(255,255,255,0.4);
        }
        .io-pager-info {
          font-size: 12px; font-weight: 500; color: #64748b;
        }
        .io-pager-controls {
          display: flex; align-items: center; gap: 6px;
        }
        .io-page-btn {
          width: 32px; height: 32px; border-radius: 9px;
          border: 1.5px solid rgba(226,232,240,0.9);
          background: #fff; color: #64748b; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; transition: all 0.18s;
        }
        .io-page-btn:hover:not(:disabled) {
          background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.3); color: #2563eb;
        }
        .io-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .io-page-btn.active {
          background: linear-gradient(135deg,#3b82f6,#2563eb);
          border-color: transparent; color: #fff;
          box-shadow: 0 3px 8px rgba(37,99,235,0.25);
        }
        .io-rows-select {
          height: 32px; border-radius: 9px;
          border: 1.5px solid rgba(226,232,240,0.9);
          background: #fff; padding: 0 26px 0 10px;
          font-size: 12px; font-weight: 500; color: #64748b;
          appearance: none; -webkit-appearance: none;
          cursor: pointer; font-family: inherit; outline: none;
        }

        /* ── Buttons ──────────────────────────────────────────────────── */
        .io-btn {
          height: 38px; padding: 0 18px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px;
          transition: all 0.2s; white-space: nowrap; font-family: inherit;
        }
        .io-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .io-btn-primary {
          background: linear-gradient(135deg,#10b981,#059669);
          color: #fff; box-shadow: 0 4px 14px rgba(5,150,105,0.25);
        }
        .io-btn-primary:hover { box-shadow: 0 6px 20px rgba(5,150,105,0.35); }
        .io-btn-ghost {
          background: rgba(255,255,255,0.5);
          border: 1.5px solid rgba(226,232,240,0.9); color: #475569;
        }
        .io-btn-ghost:hover { background: rgba(255,255,255,0.85); }

        /* ── Page title ───────────────────────────────────────────────── */
        .io-title { font-size: 23px; font-weight: 700; color: #0f172a; margin: 0; }

        /* ── Loading skeleton row ─────────────────────────────────────── */
        @keyframes io-shimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 0.9; }
          100% { opacity: 0.4; }
        }
        .io-skeleton { animation: io-shimmer 1.4s ease-in-out infinite; background: rgba(226,232,240,0.6); border-radius: 6px; }

        /* ── Spinner ──────────────────────────────────────────────────── */
        @keyframes io-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .io-spinner {
          width: 12px; height: 12px; border-radius: 50%;
          border: 2px solid transparent; border-top-color: currentColor;
          animation: io-spin 0.8s linear infinite; flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .io-root { padding: 16px; padding-top: 80px; }
          .io-main-card { padding: 18px; }
          .io-filter-body { flex-direction: column; }
          .io-filter-item, .io-filter-item-wide { flex: unset; width: 100%; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="io-root">
        <div style={{ maxWidth: "95%", margin: "0 auto" }}>
          <div className="io-main-card">

            {/* ── Page Header ───────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
              <div>
                {/* Breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, fontSize: 12, color: "#94a3b8" }}>
                  <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>Dashboard</Link>
                  <Chevron size={12} />
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>Internal Orders</span>
                </div>

                {/* Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(59,130,246,0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <h4 className="io-title">Internal Orders</h4>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 0" }}>
                      Manage and track all internal stock requests across departments.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button type="button" className="io-btn io-btn-ghost" onClick={fetchOrders}>
                  <RefreshCw size={13} /> Refresh
                </button>
                <button
                  type="button"
                  className="io-btn io-btn-primary"
                  onClick={() => navigate("/internal-orders/create")}
                >
                  <Plus size={14} /> Create Internal Order
                </button>
              </div>
            </div>

            {/* ── Status Pipeline ────────────────────────────────────────────── */}
            {/* <div className="io-card" style={{ marginBottom: 18 }}>
              <div className="io-card-header">
                <div className="io-card-header-left">
                  <div className="io-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <TrendingUp size={13} />
                  </div>
                  <h2 className="io-card-title">Order Pipeline</h2>
                </div>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                  {totalRecords} total orders
                </span>
              </div>

              <div className="io-pipeline">
                {statusSteps.map((step, idx) => (
                  <div key={step.key} className="io-pipe-step">
                    <div
                      className="io-pipe-inner"
                      onClick={() => { setStatusFilter(step.key); setCurrentPage(1); }}
                    >
                      <div
                        className="io-pipe-bubble"
                        style={{ background: step.bg, color: step.color, boxShadow: `0 4px 12px ${step.bg}` }}
                      >
                        {step.count > 0 && step.count}
                        {step.count === 0 && <span style={{ fontSize: 11, opacity: 0.5 }}>0</span>}
                      </div>
                      <div className="io-pipe-label" style={{ color: step.color }}>{step.label}</div>
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div style={{
                        position: "absolute", right: -1, top: "50%", transform: "translateY(-50%)",
                        zIndex: 2, color: "#cbd5e1",
                      }}>
                        <Chevron size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div> */}

            {/* ── Filters ────────────────────────────────────────────────────── */}
            <div className="io-card">
              <div className="io-card-header">
                <div className="io-card-header-left">
                  <div className="io-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <Filter size={13} />
                  </div>
                  <h2 className="io-card-title">Filters</h2>
                </div>
                {(statusFilter !== "All" || searchQuery) && (
                  <button
                    type="button"
                    className="io-btn io-btn-ghost"
                    style={{ height: 30, padding: "0 12px", fontSize: 11, borderRadius: 8 }}
                    onClick={() => { setStatusFilter("All"); setSearchQuery(""); setCurrentPage(1); }}
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="io-filter-body">

                {/* Status filter */}
                <div className="io-filter-item">
                  <select
                    className="io-select"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Approved">Approved</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Received">Received</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <ChevronDown size={13} className="io-field-icon io-field-icon-right" />
                </div>

                {/* Date filter */}
                <div className="io-filter-item">
                  <select
                    className="io-select io-select-with-icon"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="This Month">This Month</option>
                    <option value="This Quarter">This Quarter</option>
                  </select>
                  <Calendar size={13} className="io-field-icon io-field-icon-left" />
                  <ChevronDown size={13} className="io-field-icon io-field-icon-right" />
                </div>

                {/* Search */}
                <div className="io-filter-item io-filter-item-wide">
                  <input
                    type="text"
                    className="io-input"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by order number, department, or requested by…"
                  />
                  <Search size={13} className="io-field-icon io-field-icon-left" />
                </div>

              </div>
            </div>

            {/* ── Table ──────────────────────────────────────────────────────── */}
            <div className="io-table-card">
              <div className="io-card-header" style={{ borderRadius: "18px 18px 0 0" }}>
                <div className="io-card-header-left">
                  <div className="io-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <Package size={13} />
                  </div>
                  <h2 className="io-card-title">Orders</h2>
                  {!loading && (
                    <span style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
                      {totalRecords}
                    </span>
                  )}
                  {loading && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
                      <div className="io-spinner" style={{ borderTopColor: "#3b82f6" }} /> Loading…
                    </span>
                  )}
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                  <thead>
                    <tr>
                      <th className="io-th">Order #</th>
                      <th className="io-th">Department</th>
                      <th className="io-th">Requested By</th>
                      <th className="io-th">Delivery Location</th>
                      <th className="io-th">Date Requested</th>
                      <th className="io-th">Status</th>
                      <th className="io-th">Items / Cost</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Loading skeletons */}
                    {loading && orders.length === 0 && Array.from({ length: rows }).map((_, i) => (
                      <tr key={`skel-${i}`}>
                        {[80, 120, 150, 120, 100, 80, 100].map((w, j) => (
                          <td key={j} className="io-td">
                            <div className="io-skeleton" style={{ height: 14, width: w }} />
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Empty */}
                    {!loading && orders.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: "48px 16px", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 52, height: 52, borderRadius: 15, background: "rgba(148,163,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Package size={24} style={{ color: "#cbd5e1" }} />
                            </div>
                            <div style={{ fontWeight: 600, color: "#64748b", fontSize: 14 }}>No internal orders found</div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>Try adjusting your filters or create a new order</div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Data rows */}
                    {orders.map((order) => {
                      const statusMeta  = getStatusMeta(order.status);
                      const [avatarBg, avatarColor] = getAvatarColor(order.requestedBy || "");
                      const isApproved  = order.status === "Approve" || order.status === "Approved";

                      return (
                        <tr
                          key={order.orderId}
                          className="io-tr"
                          onClick={() => navigate(`/internal-order/${order.orderId}`)}
                        >
                          {/* Order code */}
                          <td className="io-td">
                            <div className="io-order-code">
                              <span>{order.orderCode}</span>
                              <ArrowUpRight size={11} style={{ opacity: 0.5 }} />
                            </div>
                          </td>

                          {/* Department */}
                          <td className="io-td" style={{ color: "#475569", fontWeight: 500 }}>
                            {order.department || "—"}
                          </td>

                          {/* Requested by */}
                          <td className="io-td">
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <div
                                className="io-avatar"
                                style={{ background: avatarBg, color: avatarColor }}
                              >
                                {getInitials(order.requestedBy || "User")}
                              </div>
                              <span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>
                                {order.requestedBy || "System Admin"}
                              </span>
                            </div>
                          </td>

                          {/* Delivery location */}
                          <td className="io-td">
                            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#475569" }}>
                              <MapPin size={11} style={{ color: "#94a3b8", flexShrink: 0 }} />
                              {order.deliveryLocation || "—"}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="io-td">
                            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", fontSize: 12 }}>
                              <Clock size={11} style={{ flexShrink: 0, color: "#94a3b8" }} />
                              {order.dateRequested ? new Date(order.dateRequested).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="io-td">
                            <span
                              className="io-status-badge"
                              style={{ background: statusMeta.bg, color: statusMeta.color, borderColor: statusMeta.border }}
                            >
                              <span className="io-status-dot" style={{ background: statusMeta.dot }} />
                              {order.status}
                            </span>
                          </td>

                          {/* Items / Cost */}
                          <td className="io-td">
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{
                                background: "rgba(100,116,139,0.08)", color: "#475569",
                                padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                              }}>
                                {order.totalItems} items
                              </span>
                              <span style={{
                                fontWeight: 800, fontSize: 13,
                                color: isApproved ? "#059669" : "#0f172a",
                              }}>
                                ${Number(order.totalCost || 0).toFixed(2)}
                              </span>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination footer ─────────────────────────────────────────── */}
              <div className="io-table-footer">
                <div className="io-pager-info">
                  Showing <strong>{startRecord}–{endRecord}</strong> of <strong>{totalRecords}</strong> orders
                </div>

                <div className="io-pager-controls">
                  {/* Rows per page */}
                  <div style={{ position: "relative" }}>
                    <select
                      className="io-rows-select"
                      value={rows}
                      onChange={(e) => { setRows(Number(e.target.value)); setCurrentPage(1); }}
                    >
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                    <ChevronDown size={11} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                  </div>

                  {/* Prev */}
                  <button
                    type="button"
                    className="io-page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage === 1}
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (safeCurrentPage <= 3) {
                      page = i + 1;
                    } else if (safeCurrentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = safeCurrentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        type="button"
                        className={`io-page-btn${page === safeCurrentPage ? " active" : ""}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    type="button"
                    className="io-page-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage === totalPages}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default InternalOrders;