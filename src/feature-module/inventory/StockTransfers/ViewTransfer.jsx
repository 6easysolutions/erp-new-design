import React, { useState, useEffect } from "react";
import {
  ArrowLeft, X, Printer, Package, CheckCircle,
  Truck, ChevronRight, Hash, Calendar, Square,
  User, FileText, Check, Edit2, MapPin, Clock,
} from "react-feather";
import { all_routes } from "../../../routes/all_routes";
import { useNavigate, Link, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { URLS } from "../../../Urls";

// ─────────────────────────────────────────
// Status config
// ─────────────────────────────────────────
const STATUS_META = {
  Draft:      { color: "#92400e", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  dot: "#f59e0b" },
  Pending:    { color: "#2563eb", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  dot: "#3b82f6" },
  Submitted:  { color: "#2563eb", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  dot: "#3b82f6" },
  Approved:   { color: "#059669", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  dot: "#10b981" },
  Dispatched: { color: "#7c3aed", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)",  dot: "#8b5cf6" },
  Received:   { color: "#0369a1", bg: "rgba(14,165,233,0.1)",  border: "rgba(14,165,233,0.25)",  dot: "#0ea5e9" },
  Cancelled:  { color: "#dc2626", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   dot: "#ef4444" },
};

const getStatusMeta = (s) => {
  if (!s) return { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)", dot: "#94a3b8" };
  const st = s.toLowerCase();
  if (st === "draft") return STATUS_META.Draft;
  if (st === "pending" || st === "submitted") return STATUS_META.Pending;
  if (st === "approved" || st === "approve") return STATUS_META.Approved;
  if (st === "dispatched") return STATUS_META.Dispatched;
  if (st === "received") return STATUS_META.Received;
  if (st === "cancelled") return STATUS_META.Cancelled;
  return { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)", dot: "#94a3b8" };
};

// ─────────────────────────────────────────
// Timeline steps
// ─────────────────────────────────────────
const TL_STEPS = ["Draft", "Submitted", "Approved", "Dispatched", "Received"];

// ─────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const m = getStatusMeta(status);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: 20,
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      fontWeight: 700, fontSize: 11,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
    </span>
  );
};

// ─────────────────────────────────────────
// Info Row
// ─────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, accent, fullWidth }) => (
  <div style={{
    gridColumn: fullWidth ? "1 / -1" : undefined,
    display: "flex", alignItems: "flex-start", gap: 11,
    padding: "11px 0", borderBottom: "1px solid rgba(226,232,240,0.4)",
  }}>
    <div style={{
      width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 1,
      background: "rgba(139,92,246,0.08)", color: "#7c3aed",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {Icon && <Icon size={12} />}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: accent || "#1e293b", wordBreak: "break-word" }}>
        {value || "—"}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
const ViewStockTransfer = ({ onClose, onEdit }) => {
  const navigate    = useNavigate();
  const { id }      = useParams();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransfer = async () => {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      try {
        const res = await fetch(URLS.GetStockTransferById, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: Number(id) })
        });
        const result = await res.json();
        if (res.ok && result.success) {
          setData(result.data);
        } else {
          toast.error(result.message || "Failed to fetch transfer details");
        }
      } catch (err) {
        toast.error("Network error while fetching details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTransfer();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8faff" }}>
        <p style={{ color: "#64748b", fontWeight: 600 }}>Loading transfer details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8faff" }}>
        <p style={{ color: "#dc2626", fontWeight: 600 }}>Transfer not found</p>
        <button
          onClick={() => navigate(all_routes.transfers)}
          style={{
            marginTop: 10, padding: "8px 16px", borderRadius: 8, border: "none",
            background: "#3b82f6", color: "#fff", cursor: "pointer", fontWeight: 600
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const getStatusStep = (s) => {
    const st = s ? s.toLowerCase() : "";
    if (st === "draft") return 1;
    if (st === "submitted" || st === "pending") return 2;
    if (st === "approved" || st === "approve") return 3;
    if (st === "dispatched") return 4;
    if (st === "received") return 5;
    return 1;
  };

  const currentStep = getStatusStep(data.status);
  const items = data.items || [];
  const reqBy = data.requestedByName || data.requestedBy || "User";
  const approvedBy = data.approvedBy || "—";
  const totalQty  = items.reduce((s, i) => s + (Number(i.transferQty) || 0), 0);
  const fillPct   = `${((currentStep - 1) / (TL_STEPS.length - 1)) * 100}%`;
  const transfer  = data;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <style>{`
        * { box-sizing: border-box; }

        .vst-root {
          background: linear-gradient(135deg, #f8faff 0%, #dbe8ff 100%);
          min-height: 100vh; padding: 24px; padding-top: 100px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ── Main glass card ──────────────────────────────────────────── */
        .vst-main-card {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border-radius: 24px; border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          padding: 28px 32px; margin-bottom: 24px;
        }

        /* ── Sub glass card ───────────────────────────────────────────── */
        .vst-card {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px; margin-bottom: 18px; overflow: hidden;
        }
        .vst-card-header {
          padding: 13px 20px;
          border-bottom: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; flex-wrap: wrap;
          background: rgba(255,255,255,0.4);
        }
        .vst-card-header-left { display: flex; align-items: center; gap: 9px; }
        .vst-card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }

        /* ── Icon box ─────────────────────────────────────────────────── */
        .vst-icon-box {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* ── Two-col info grid ────────────────────────────────────────── */
        .vst-info-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; padding: 0 4px;
        }
        @media (max-width: 640px) { .vst-info-grid { grid-template-columns: 1fr; } }

        /* ── Route visual ─────────────────────────────────────────────── */
        .vst-route-bar {
          display: flex; align-items: center; gap: 10px;
          background: rgba(139,92,246,0.04);
          border: 1px solid rgba(139,92,246,0.12);
          border-radius: 14px; padding: 12px 18px; margin-bottom: 0;
        }
        .vst-route-node {
          display: flex; align-items: center; gap: 7px; flex: 1; min-width: 0;
        }
        .vst-route-dot {
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .vst-route-connector {
          display: flex; align-items: center; gap: 3px; flex-shrink: 0;
          color: #94a3b8;
        }
        .vst-route-dash { width: 16px; height: 2px; background: rgba(139,92,246,0.25); border-radius: 2px; }

        /* ── Timeline stepper ─────────────────────────────────────────── */
        .vst-stepper {
          display: flex; align-items: flex-start; justify-content: space-between;
          position: relative; padding: 20px 24px 20px;
        }
        .vst-stepper-track {
          position: absolute; top: 40px; left: 12%; right: 12%;
          height: 3px; background: rgba(226,232,240,0.7); z-index: 0; border-radius: 4px;
        }
        .vst-stepper-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, #8b5cf6, #7c3aed);
          transition: width 0.4s;
        }
        .vst-step {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; z-index: 1; flex: 1;
        }
        .vst-step-circle {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; border: 2.5px solid rgba(226,232,240,0.8);
          background: rgba(255,255,255,0.8); color: "#94a3b8"; transition: all 0.2s;
        }
        .vst-step-circle.done {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          border-color: #8b5cf6; color: #fff;
        }
        .vst-step-circle.active {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          border-color: #7c3aed; color: #fff;
          box-shadow: 0 4px 14px rgba(124,58,237,0.35);
        }
        .vst-step-label {
          font-size: 11px; font-weight: 600; color: #94a3b8; text-align: center; white-space: nowrap;
        }
        .vst-step-label.done   { color: #8b5cf6; }
        .vst-step-label.active { color: #7c3aed; font-weight: 700; }

        /* ── Table ────────────────────────────────────────────────────── */
        .vst-th {
          padding: 11px 14px; font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.5px;
          background: rgba(248,250,252,0.7);
          border-bottom: 1px solid rgba(226,232,240,0.6);
          white-space: nowrap; text-align: left;
        }
        .vst-th-c { text-align: center; }
        .vst-td {
          padding: 12px 14px; font-size: 13px; color: #1e293b;
          border-bottom: 1px solid rgba(226,232,240,0.4);
          vertical-align: middle; white-space: nowrap;
        }
        .vst-td-c { text-align: center; }
        .vst-tr { transition: background 0.13s; }
        .vst-tr:hover td { background: rgba(139,92,246,0.02); }
        .vst-tr:last-child td { border-bottom: none; }

        .vst-thumb {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.15);
          display: flex; align-items: center; justify-content: center;
        }
        .vst-sku-badge {
          background: rgba(100,116,139,0.08); color: #475569;
          padding: 1px 8px; border-radius: 20px; font-size: 10px; font-weight: 600;
        }
        .vst-qty-chip {
          display: inline-flex; align-items: center; justify-content: center;
          background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.2);
          color: #6d28d9; border-radius: 20px; padding: "3px 12px";
          font-size: 13px; font-weight: 700; min-width: 48px; padding: "4px 12px";
        }
        .vst-unit-pill {
          background: rgba(14,165,233,0.07); color: #0369a1;
          border: 1px solid rgba(14,165,233,0.2);
          padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
        }
        .vst-remarks {
          font-size: 12px; color: #64748b; font-style: italic;
        }

        /* ── Summary bar ──────────────────────────────────────────────── */
        .vst-summary-bar {
          padding: 13px 20px; border-top: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px; flex-wrap: wrap;
          background: rgba(248,250,252,0.5);
        }
        .vst-summary-chip {
          display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569;
        }
        .vst-summary-val { font-weight: 800; font-size: 15px; color: #0f172a; }

        /* ── Buttons ──────────────────────────────────────────────────── */
        .vst-btn {
          height: 38px; padding: 0 18px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px;
          transition: all 0.2s; white-space: nowrap; font-family: inherit;
        }
        .vst-btn:hover { transform: translateY(-1px); }

        .vst-btn-ghost {
          background: rgba(255,255,255,0.5);
          border: 1.5px solid rgba(226,232,240,0.9); color: #475569;
        }
        .vst-btn-ghost:hover { background: rgba(255,255,255,0.85); }

        .vst-btn-purple {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: #fff; box-shadow: 0 4px 14px rgba(124,58,237,0.25);
        }
        .vst-btn-purple:hover { box-shadow: 0 6px 20px rgba(124,58,237,0.35); }

        .vst-btn-outline-purple {
          background: rgba(139,92,246,0.08);
          border: 1.5px solid rgba(139,92,246,0.25); color: #6d28d9;
        }
        .vst-btn-outline-purple:hover { background: rgba(139,92,246,0.14); }

        /* ── Action bar ───────────────────────────────────────────────── */
        .vst-action-bar {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 16px; padding: 14px 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px; flex-wrap: wrap;
        }

        /* ── Title ────────────────────────────────────────────────────── */
        .vst-title-text { font-size: 23px; font-weight: 700; color: #0f172a; margin: 0; }
        .vst-code-chip {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.25);
          border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: "#6d28d9";
          color: #6d28d9;
        }

        @media (max-width: 768px) {
          .vst-root { padding: 16px; padding-top: 80px; }
          .vst-main-card { padding: 18px; }
        }
        @media (max-width: 600px) {
          .vst-stepper { padding: 16px 10px; }
          .vst-step-label { font-size: 9px; }
        }
      `}</style>

      <div className="vst-root">
        <div style={{ maxWidth: "95%", margin: "0 auto" }}>
          <div className="vst-main-card">

            {/* ── Page Header ───────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                {/* Breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, fontSize: 12, color: "#94a3b8" }}>
                  <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#7c3aed")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>Dashboard</Link>
                  <ChevronRight size={12} />
                  <Link to={all_routes.transfers} style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#7c3aed")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>Stock Transfers</Link>
                  <ChevronRight size={12} />
                  <span style={{ color: "#7c3aed", fontWeight: 600 }}>View Transfer</span>
                </div>

                {/* Title + chips */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                    background: "rgba(139,92,246,0.1)", color: "#7c3aed",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Truck size={20} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <h4 className="vst-title-text">View Stock Transfer</h4>
                      <div className="vst-code-chip">
                        <Hash size={11} /> {transfer.transferCode}
                      </div>
                      <StatusBadge status={transfer.status} />
                    </div>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 0" }}>
                      Read-only view of transfer details, route and line items.
                    </p>
                  </div>
                </div>
              </div>

              {/* Top-right actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  title="Print"
                  style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: "rgba(255,255,255,0.5)", border: "1.5px solid rgba(226,232,240,0.9)",
                    color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", transition: "all 0.18s",
                  }}
                >
                  <Printer size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(all_routes.transfers)}
                  style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: "rgba(255,255,255,0.5)", border: "1.5px solid rgba(226,232,240,0.9)",
                    color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", transition: "all 0.18s",
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* ── Route Visual Banner ────────────────────────────────────────── */}
            <div className="vst-route-bar" style={{ marginBottom: 18 }}>
              {/* Source */}
              <div className="vst-route-node">
                <div className="vst-route-dot" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                  <Square size={14} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px" }}>Source</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{transfer.sourceWarehouseName}</div>
                </div>
              </div>

              {/* Connector */}
              <div className="vst-route-connector">
                <div className="vst-route-dash" />
                <div className="vst-route-dash" />
                <ChevronRight size={14} style={{ color: "#8b5cf6" }} />
                <div className="vst-route-dash" />
                <div className="vst-route-dash" />
              </div>

              {/* Destination */}
              <div className="vst-route-node">
                <div className="vst-route-dot" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                  <MapPin size={14} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px" }}>Destination</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{transfer.destinationWarehouseName}</div>
                </div>
              </div>

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Quick stats */}
              <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px" }}>Items</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{items.length}</div>
                </div>
                <div style={{ width: 1, background: "rgba(226,232,240,0.6)" }} />
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px" }}>Total Qty</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#7c3aed" }}>{totalQty}</div>
                </div>
              </div>
            </div>

            {/* ── Two-column info grid ───────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 18, marginBottom: 18 }}>

              {/* Left — Transfer Details */}
              <div className="vst-card">
                <div className="vst-card-header">
                  <div className="vst-card-header-left">
                    <div className="vst-icon-box" style={{ background: "rgba(139,92,246,0.1)", color: "#7c3aed" }}>
                      <Hash size={13} />
                    </div>
                    <h2 className="vst-card-title">Transfer Details</h2>
                  </div>
                </div>
                <div style={{ padding: "4px 20px 10px" }}>
                  <InfoRow icon={Hash}     label="Transfer ID"   value={transfer.transferCode}   accent="#6d28d9" />
                  <InfoRow icon={Calendar} label="Transfer Date" value={transfer.transferDate ? new Date(transfer.transferDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "—"} />
                  <InfoRow icon={User}     label="Requested By"  value={reqBy}  />
                  <InfoRow icon={User}     label="Approved By"   value={approvedBy}   accent="#059669" />
                  <InfoRow icon={Clock}    label="Created At"    value={transfer.logCreatedDate ? new Date(transfer.logCreatedDate).toLocaleString() : "—"}    />
                </div>
              </div>

              {/* Right — Status Timeline */}
              <div className="vst-card">
                <div className="vst-card-header">
                  <div className="vst-card-header-left">
                    <div className="vst-icon-box" style={{ background: "rgba(139,92,246,0.1)", color: "#7c3aed" }}>
                      <Truck size={13} />
                    </div>
                    <h2 className="vst-card-title">Transfer Progress</h2>
                  </div>
                  <StatusBadge status={transfer.status} />
                </div>

                {/* Stepper */}
                <div className="vst-stepper">
                  <div className="vst-stepper-track">
                    <div className="vst-stepper-fill" style={{ width: fillPct }} />
                  </div>
                  {TL_STEPS.map((step, i) => {
                    const done   = i + 1 < currentStep;
                    const active = i + 1 === currentStep;
                    return (
                      <div className="vst-step" key={step}>
                        <div className={`vst-step-circle${done ? " done" : active ? " active" : ""}`}>
                          {(done || active) ? <Check size={14} /> : i + 1}
                        </div>
                        <span className={`vst-step-label${done ? " done" : active ? " active" : ""}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Notes */}
                <div style={{ padding: "0 20px 18px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                    <FileText size={10} /> Notes
                  </div>
                  <div style={{
                    background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.1)",
                    borderRadius: 10, padding: "10px 14px",
                    fontSize: 13, color: "#475569", fontStyle: "italic", lineHeight: 1.5,
                  }}>
                    {transfer.notes || "No notes added."}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Line Items ────────────────────────────────────────────────── */}
            <div className="vst-card">
              <div className="vst-card-header">
                <div className="vst-card-header-left">
                  <div className="vst-icon-box" style={{ background: "rgba(139,92,246,0.1)", color: "#7c3aed" }}>
                    <Package size={13} />
                  </div>
                  <h2 className="vst-card-title">Transferred Products</h2>
                  <span style={{ background: "rgba(139,92,246,0.1)", color: "#6d28d9", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                  <thead>
                    <tr>
                      <th className="vst-th"   style={{ width: 44 }}>#</th>
                      <th className="vst-th">Product</th>
                      <th className="vst-th">SKU</th>
                      <th className="vst-th vst-th-c">Available</th>
                      <th className="vst-th vst-th-c">Transferred</th>
                      <th className="vst-th vst-th-c">Unit</th>
                      <th className="vst-th">Remarks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="vst-tr">

                        {/* # */}
                        <td className="vst-td">
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>{index + 1}</span>
                        </td>

                        {/* Product */}
                        <td className="vst-td">
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div className="vst-thumb">
                              <Package size={13} style={{ color: "#7c3aed" }} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{item.productName || item.product}</span>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="vst-td">
                          <span className="vst-sku-badge">{item.sku || `PROD-${item.productId}`}</span>
                        </td>

                        {/* Available */}
                        <td className="vst-td vst-td-c">
                          <span style={{ background: "rgba(100,116,139,0.08)", color: "#475569", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                            {item.availableQty}
                          </span>
                        </td>

                        {/* Transferred */}
                        <td className="vst-td vst-td-c">
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
                            color: "#6d28d9", borderRadius: 20, padding: "3px 14px",
                            fontSize: 13, fontWeight: 700, minWidth: 46,
                          }}>
                            {item.transferQty}
                          </span>
                        </td>

                        {/* Unit */}
                        <td className="vst-td vst-td-c">
                          <span className="vst-unit-pill">{item.unit}</span>
                        </td>

                        {/* Remarks */}
                        <td className="vst-td">
                          {item.remarks ? (
                            <span className="vst-remarks">"{item.remarks}"</span>
                          ) : (
                            <span style={{ color: "#d1d5db", fontSize: 12 }}>—</span>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="vst-summary-bar">
                <div className="vst-summary-chip">
                  <Package size={13} style={{ color: "#94a3b8" }} />
                  <span>Total Items:</span>
                  <span className="vst-summary-val">{items.length}</span>
                </div>
                <div style={{ width: 1, height: 16, background: "rgba(139,92,246,0.2)" }} />
                <div className="vst-summary-chip">
                  <Truck size={13} style={{ color: "#94a3b8" }} />
                  <span>Total Qty Transferred:</span>
                  <span className="vst-summary-val" style={{ color: "#7c3aed" }}>{totalQty}</span>
                </div>
              </div>
            </div>

            {/* ── Action Bar ─────────────────────────────────────────────────── */}
            <div className="vst-action-bar">
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Last updated: <strong style={{ color: "#1e293b" }}>{transfer.logModifiedDate ? new Date(transfer.logModifiedDate).toLocaleString() : "—"}</strong>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button type="button" className="vst-btn vst-btn-ghost" onClick={() => navigate(all_routes.transfers)}>
                  <ArrowLeft size={13} /> Back to List
                </button>
                <button type="button" className="vst-btn vst-btn-ghost">
                  <Printer size={13} /> Print
                </button>
                <button
                  type="button"
                  className="vst-btn vst-btn-outline-purple"
                  onClick={() => navigate(all_routes.edittransfer?.replace(":id", transfer.id))}
                >
                  <Edit2 size={13} /> Edit Transfer
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ViewStockTransfer;