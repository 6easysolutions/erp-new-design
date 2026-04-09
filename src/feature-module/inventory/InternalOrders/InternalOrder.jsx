import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft, ChevronRight, Printer, XCircle, CheckCircle,
  Truck, Package, Check, RefreshCw, MapPin, Calendar,
  Clock, Hash, DollarSign, ShoppingBag, Activity,
  AlertTriangle,
} from "react-feather";
import { useParams, useNavigate, Link } from "react-router-dom";
import { URLS } from "../../../Urls";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ─────────────────────────────────────────
// Status config
// ─────────────────────────────────────────
const STATUS_STEPS = [
  { id: 1, key: "pending",    label: "Pending"    },
  { id: 2, key: "approved",   label: "Approved"   },
  { id: 3, key: "dispatched", label: "Dispatched" },
  { id: 4, key: "completed",  label: "Completed"  },
];

const getStepIndex = (status) => {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status?.toLowerCase());
  return idx >= 0 ? idx + 1 : 1;
};

const STATUS_META = {
  pending:    { color: "#2563eb", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  dot: "#3b82f6" },
  approved:   { color: "#059669", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  dot: "#10b981" },
  rejected:   { color: "#dc2626", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   dot: "#ef4444" },
  dispatched: { color: "#b45309", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  dot: "#f59e0b" },
  completed:  { color: "#7c3aed", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)",  dot: "#8b5cf6" },
};

const getStatusMeta = (status) =>
  STATUS_META[status?.toLowerCase()] || { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)", dot: "#94a3b8" };

// ─────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const m = getStatusMeta(status);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 13px", borderRadius: 20,
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      fontWeight: 700, fontSize: 12, textTransform: "capitalize",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {status || "—"}
    </span>
  );
};

// ─────────────────────────────────────────
// Info Row (label + value)
// ─────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, accent }) => (
  <div style={{
    display: "flex", alignItems: "flex-start", gap: 12,
    padding: "11px 0", borderBottom: "1px solid rgba(226,232,240,0.45)",
  }}>
    <div style={{
      width: 30, height: 30, borderRadius: 9, flexShrink: 0, marginTop: 1,
      background: "rgba(59,130,246,0.08)", color: "#3b82f6",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {Icon && <Icon size={13} />}
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
const InternalOrder = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [order,    setOrder]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const res    = await fetch(URLS.GetOrderById, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: Number(id) }),
      });
      const result = await res.json();
      if (result.success) setOrder(result.order);
      else toast.error(result.message || "Failed to fetch order details");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while fetching the order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchOrder(); }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!order) return;
    setUpdating(true);
    const token = localStorage.getItem("authToken");
    try {
      const res    = await fetch(URLS.UpdateInternalOrderStatus, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: order.orderId, status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Order status updated to "${newStatus}" successfully`);
        setOrder((prev) => ({ ...prev, status: result.newStatus }));
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating the status");
    } finally {
      setUpdating(false);
    }
  };

  const currentStep    = order ? getStepIndex(order.status) : 1;
  const stepFillPct    = ((currentStep - 1) / (STATUS_STEPS.length - 1)) * 100;

  const totalQty  = useMemo(() => (order?.items || []).reduce((s, i) => s + Number(i.qtyRequested || 0), 0), [order]);
  const totalCost = useMemo(() => (order?.items || []).reduce((s, i) => s + Number(i.totalCost || 0), 0), [order]);

  const isPending    = order?.status?.toLowerCase() === "pending";
  const isApproved   = order?.status?.toLowerCase() === "approved";
  const isDispatched = order?.status?.toLowerCase() === "dispatched";
  const isRejected   = order?.status?.toLowerCase() === "rejected";
  const isCompleted  = order?.status?.toLowerCase() === "completed";

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .iov-root {
          background: linear-gradient(135deg, #f8faff 0%, #dbe8ff 100%);
          min-height: 100vh;
          padding: 24px;
          padding-top: 100px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ── Main glass card ──────────────────────────────────────────── */
        .iov-main-card {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          padding: 28px 32px;
          margin-bottom: 24px;
        }

        /* ── Glass sub-card ───────────────────────────────────────────── */
        .iov-card {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px;
          margin-bottom: 18px;
          overflow: hidden;
        }
        .iov-card-header {
          padding: 13px 20px;
          border-bottom: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; flex-wrap: wrap;
          background: rgba(255,255,255,0.4);
        }
        .iov-card-header-left { display: flex; align-items: center; gap: 9px; }
        .iov-card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }
        .iov-card-body { padding: 20px; }

        /* ── Icon box ─────────────────────────────────────────────────── */
        .iov-icon-box {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* ── Two-panel grid ───────────────────────────────────────────── */
        .iov-two-col {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 18px;
          margin-bottom: 18px;
        }
        @media (max-width: 900px) { .iov-two-col { grid-template-columns: 1fr; } }

        /* ── Stepper ──────────────────────────────────────────────────── */
        .iov-stepper {
          display: flex; align-items: flex-start; justify-content: space-between;
          position: relative; padding: 0 12px; margin-bottom: 24px;
        }
        .iov-stepper-track {
          position: absolute; top: 19px; left: 8%; right: 8%;
          height: 3px; background: rgba(226,232,240,0.7); border-radius: 4px; z-index: 0;
          overflow: hidden;
        }
        .iov-stepper-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          border-radius: 4px;
          transition: width 0.45s ease;
        }
        .iov-step {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; gap: 8px; z-index: 1; position: relative;
        }
        .iov-step-bubble {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800;
          border: 3px solid rgba(226,232,240,0.8);
          background: #fff; color: #94a3b8;
          transition: all 0.25s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .iov-step-bubble.done {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-color: transparent; color: #fff;
          box-shadow: 0 4px 14px rgba(37,99,235,0.28);
        }
        .iov-step-bubble.active {
          background: linear-gradient(135deg, #10b981, #059669);
          border-color: transparent; color: #fff;
          box-shadow: 0 4px 14px rgba(5,150,105,0.3);
          transform: scale(1.1);
        }
        .iov-step-label {
          font-size: 11px; font-weight: 700; color: #94a3b8; text-align: center;
        }
        .iov-step-label.done   { color: #2563eb; }
        .iov-step-label.active { color: #059669; }

        /* ── Table ────────────────────────────────────────────────────── */
        .iov-th {
          padding: 11px 14px;
          font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.5px;
          background: rgba(248,250,252,0.7);
          border-bottom: 1px solid rgba(226,232,240,0.6);
          white-space: nowrap; text-align: left;
        }
        .iov-th-c { text-align: center; }
        .iov-th-r { text-align: right; }

        .iov-td {
          padding: 12px 14px;
          font-size: 13px; color: #1e293b;
          border-bottom: 1px solid rgba(226,232,240,0.4);
          vertical-align: middle; white-space: nowrap;
        }
        .iov-td-c { text-align: center; }
        .iov-td-r { text-align: right; }

        .iov-tr { transition: background 0.13s; }
        .iov-tr:hover td { background: rgba(59,130,246,0.025); }
        .iov-tr:last-child td { border-bottom: none; }

        /* Product thumb */
        .iov-thumb {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.12);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .iov-sku-badge {
          background: rgba(100,116,139,0.08); color: #475569;
          padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 600;
        }

        /* ── Summary bar ──────────────────────────────────────────────── */
        .iov-summary-bar {
          padding: 13px 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
          border-top: 1px solid rgba(226,232,240,0.55);
          background: rgba(248,250,252,0.5);
        }
        .iov-summary-chip {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #475569;
        }
        .iov-summary-val { font-weight: 800; font-size: 15px; color: #0f172a; }
        .iov-summary-val.green { color: #059669; }

        /* ── Buttons ──────────────────────────────────────────────────── */
        .iov-btn {
          height: 38px; padding: 0 18px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px;
          transition: all 0.2s; white-space: nowrap; font-family: inherit;
        }
        .iov-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .iov-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .iov-btn-ghost {
          background: rgba(255,255,255,0.5);
          border: 1.5px solid rgba(226,232,240,0.9); color: #475569;
        }
        .iov-btn-ghost:hover { background: rgba(255,255,255,0.85); }

        .iov-btn-green {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; box-shadow: 0 4px 14px rgba(5,150,105,0.22);
        }
        .iov-btn-green:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(5,150,105,0.32); }

        .iov-btn-red {
          background: linear-gradient(135deg, #f87171, #dc2626);
          color: #fff; box-shadow: 0 4px 14px rgba(220,38,38,0.2);
        }
        .iov-btn-red:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(220,38,38,0.3); }

        .iov-btn-blue {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff; box-shadow: 0 4px 14px rgba(37,99,235,0.22);
        }
        .iov-btn-blue:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(37,99,235,0.32); }

        .iov-btn-teal {
          background: linear-gradient(135deg, #14b8a6, #0d9488);
          color: #fff; box-shadow: 0 4px 14px rgba(20,184,166,0.22);
        }
        .iov-btn-teal:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(20,184,166,0.32); }

        /* ── Action bar ───────────────────────────────────────────────── */
        .iov-action-bar {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 16px; padding: 14px 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px; flex-wrap: wrap;
        }

        /* ── Spinner ──────────────────────────────────────────────────── */
        @keyframes iov-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .iov-spinner {
          width: 12px; height: 12px; border-radius: 50%;
          border: 2px solid transparent; border-top-color: currentColor;
          animation: iov-spin 0.8s linear infinite; flex-shrink: 0;
        }
        @keyframes iov-spin-lg { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .iov-spinner-lg {
          width: 32px; height: 32px; border-radius: 50%;
          border: 3px solid rgba(59,130,246,0.15); border-top-color: #3b82f6;
          animation: iov-spin-lg 0.9s linear infinite;
        }

        /* ── Title ────────────────────────────────────────────────────── */
        .iov-title { font-size: 23px; font-weight: 700; color: #0f172a; margin: 0; }

        /* ── Code chip ────────────────────────────────────────────────── */
        .iov-code-chip {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2);
          border-radius: 20px; padding: 4px 12px;
          font-size: 12px; font-weight: 700; color: #2563eb;
        }

        /* ── Info row last child ──────────────────────────────────────── */
        .iov-info-row:last-child { border-bottom: none !important; }

        @media (max-width: 768px) {
          .iov-root  { padding: 16px; padding-top: 80px; }
          .iov-main-card { padding: 18px; }
          .iov-card-body { padding: 14px; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="iov-root">
        <div style={{ maxWidth: "95%", margin: "0 auto" }}>
          <div className="iov-main-card">

            {/* ── Page Header ───────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                {/* Breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, fontSize: 12, color: "#94a3b8" }}>
                  <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>Dashboard</Link>
                  <ChevronRight size={12} />
                  <Link to="/internal-orders" style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>Internal Orders</Link>
                  <ChevronRight size={12} />
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>
                    {order ? order.orderCode : "Order Details"}
                  </span>
                </div>

                {/* Title row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(59,130,246,0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <h4 className="iov-title">Internal Order</h4>
                      {order && (
                        <div className="iov-code-chip">
                          <Hash size={11} /> {order.orderCode}
                        </div>
                      )}
                      {order && <StatusBadge status={order.status} />}
                    </div>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 0" }}>
                      View order details, track status and manage approvals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Back + Refresh */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button type="button" className="iov-btn iov-btn-ghost" onClick={fetchOrder} title="Refresh">
                  <RefreshCw size={13} /> Refresh
                </button>
                <button type="button" className="iov-btn iov-btn-ghost" onClick={() => navigate("/internal-orders")}>
                  <ArrowLeft size={13} /> Back to Orders
                </button>
              </div>
            </div>

            {/* ── Loading ────────────────────────────────────────────────────── */}
            {loading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 0", gap: 14 }}>
                <div className="iov-spinner-lg" />
                <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>Loading order details…</div>
              </div>
            )}

            {/* ── Not found ──────────────────────────────────────────────────── */}
            {!loading && !order && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0", gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={26} style={{ color: "#ef4444" }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Order Not Found</div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>The requested order could not be located.</div>
                <button type="button" className="iov-btn iov-btn-blue" style={{ marginTop: 8 }} onClick={() => navigate("/internal-orders")}>
                  <ArrowLeft size={13} /> Back to Orders
                </button>
              </div>
            )}

            {/* ── Content ────────────────────────────────────────────────────── */}
            {!loading && order && (
              <>
                {/* ── Two Column Top Section ──────────────────────────────────── */}
                <div className="iov-two-col">

                  {/* Left — Order Information */}
                  <div className="iov-card" style={{ margin: 0 }}>
                    <div className="iov-card-header">
                      <div className="iov-card-header-left">
                        <div className="iov-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                          <ShoppingBag size={13} />
                        </div>
                        <h2 className="iov-card-title">Order Information</h2>
                      </div>
                    </div>

                    <div className="iov-card-body" style={{ padding: "0 20px 6px" }}>
                      <div className="iov-info-row" style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 0", borderBottom: "1px solid rgba(226,232,240,0.45)" }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, marginTop: 1, background: "rgba(59,130,246,0.08)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Hash size={13} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>Order Code</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>{order.orderCode}</div>
                        </div>
                      </div>

                      <div className="iov-info-row" style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 0", borderBottom: "1px solid rgba(226,232,240,0.45)" }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, marginTop: 1, background: "rgba(59,130,246,0.08)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <MapPin size={13} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>Delivery Location</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{order.deliveryLocation || "—"}</div>
                        </div>
                      </div>

                      <div className="iov-info-row" style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 0", borderBottom: "1px solid rgba(226,232,240,0.45)" }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, marginTop: 1, background: "rgba(59,130,246,0.08)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Package size={13} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>Warehouse</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{order.warehouseName || "—"}</div>
                        </div>
                      </div>

                      <div className="iov-info-row" style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 0", borderBottom: "1px solid rgba(226,232,240,0.45)" }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, marginTop: 1, background: "rgba(59,130,246,0.08)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Calendar size={13} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>Issue Date</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{order.issueDate || "—"}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10, padding: "13px 0" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, marginTop: 1, background: "rgba(100,116,139,0.08)", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Clock size={13} />
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>Created</div>
                              <div style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>{new Date(order.logCreatedDate).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, marginTop: 1, background: "rgba(100,116,139,0.08)", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Clock size={13} />
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>Last Modified</div>
                              <div style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>{new Date(order.logModifiedDate).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right — Status + Reason */}
                  <div className="iov-card" style={{ margin: 0 }}>
                    <div className="iov-card-header">
                      <div className="iov-card-header-left">
                        <div className="iov-icon-box" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                          <Activity size={13} />
                        </div>
                        <h2 className="iov-card-title">Status Progress</h2>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="iov-card-body">
                      {/* Stepper */}
                      <div className="iov-stepper">
                        <div className="iov-stepper-track">
                          <div className="iov-stepper-fill" style={{ width: `${stepFillPct}%` }} />
                        </div>

                        {STATUS_STEPS.map((step) => {
                          const done   = step.id < currentStep;
                          const active = step.id === currentStep;
                          return (
                            <div className="iov-step" key={step.id}>
                              <div className={`iov-step-bubble${done ? " done" : ""}${active ? " active" : ""}`}>
                                {done || active ? <Check size={15} /> : step.id}
                              </div>
                              <span className={`iov-step-label${done ? " done" : ""}${active ? " active" : ""}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Request Reason */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
                          Request Reason
                        </div>
                        <div style={{
                          background: "rgba(248,250,252,0.7)", border: "1.5px solid rgba(226,232,240,0.9)",
                          borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#1e293b",
                          fontWeight: 500, lineHeight: 1.6, minHeight: 68,
                        }}>
                          {order.requestReason || "—"}
                        </div>
                      </div>

                      {/* Status action hint */}
                      {(isPending || isApproved || isDispatched) && (
                        <div style={{
                          background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)",
                          borderRadius: 10, padding: "10px 14px",
                          display: "flex", alignItems: "center", gap: 8,
                          fontSize: 12, color: "#2563eb", fontWeight: 500,
                        }}>
                          <Activity size={13} style={{ flexShrink: 0 }} />
                          {isPending    && "This order is awaiting approval. Use the action buttons below to approve or reject."}
                          {isApproved   && "Order is approved and ready for dispatch. Click 'Dispatch Order' to proceed."}
                          {isDispatched && "Order has been dispatched. Mark it as completed once received."}
                        </div>
                      )}

                      {(isRejected || isCompleted) && (
                        <div style={{
                          background: isCompleted ? "rgba(139,92,246,0.06)" : "rgba(239,68,68,0.06)",
                          border: `1px solid ${isCompleted ? "rgba(139,92,246,0.18)" : "rgba(239,68,68,0.18)"}`,
                          borderRadius: 10, padding: "10px 14px",
                          display: "flex", alignItems: "center", gap: 8,
                          fontSize: 12, color: isCompleted ? "#7c3aed" : "#dc2626", fontWeight: 500,
                        }}>
                          {isCompleted ? <CheckCircle size={13} style={{ flexShrink: 0 }} /> : <XCircle size={13} style={{ flexShrink: 0 }} />}
                          This order is <strong style={{ marginLeft: 3 }}>{order.status}</strong>. No further actions available.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Item Details Table ──────────────────────────────────────── */}
                <div className="iov-card">
                  <div className="iov-card-header">
                    <div className="iov-card-header-left">
                      <div className="iov-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                        <Package size={13} />
                      </div>
                      <h2 className="iov-card-title">Item Details</h2>
                      <span style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
                        {order.items?.length || 0} items
                      </span>
                    </div>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                      <thead>
                        <tr>
                          <th className="iov-th" style={{ width: 44 }}>#</th>
                          <th className="iov-th">Product</th>
                          <th className="iov-th iov-th-c">Available</th>
                          <th className="iov-th iov-th-c">Qty Requested</th>
                          <th className="iov-th iov-th-r">Unit Cost</th>
                          <th className="iov-th iov-th-r">Total Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order.items || []).length === 0 && (
                          <tr>
                            <td colSpan={6} style={{ padding: "44px 16px", textAlign: "center" }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(148,163,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Package size={22} style={{ color: "#cbd5e1" }} />
                                </div>
                                <div style={{ fontWeight: 600, color: "#64748b", fontSize: 13 }}>No items found</div>
                              </div>
                            </td>
                          </tr>
                        )}

                        {(order.items || []).map((item, idx) => (
                          <tr key={item.productId} className="iov-tr">
                            <td className="iov-td">
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>{idx + 1}</span>
                            </td>

                            <td className="iov-td">
                              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                <div className="iov-thumb">
                                  <Package size={13} style={{ color: "#3b82f6" }} />
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{item.productName}</div>
                                </div>
                              </div>
                            </td>

                            <td className="iov-td iov-td-c">
                              <span style={{ background: "rgba(100,116,139,0.08)", color: "#475569", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                                {item.availableStock}
                              </span>
                            </td>

                            <td className="iov-td iov-td-c">
                              <span style={{ background: "rgba(59,130,246,0.08)", color: "#2563eb", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                                {item.qtyRequested}
                              </span>
                            </td>

                            <td className="iov-td iov-td-r">
                              <span style={{ fontWeight: 600, fontSize: 13, color: "#475569" }}>
                                ${Number(item.unitCost).toFixed(2)}
                              </span>
                            </td>

                            <td className="iov-td iov-td-r">
                              <span style={{ fontWeight: 800, fontSize: 13, color: "#059669" }}>
                                ${Number(item.totalCost).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary bar */}
                  <div className="iov-summary-bar">
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      <div className="iov-summary-chip">
                        <Package size={13} style={{ color: "#94a3b8" }} />
                        <span>Items:</span>
                        <span className="iov-summary-val">{order.items?.length || 0}</span>
                      </div>
                      <div className="iov-summary-chip">
                        <ShoppingBag size={13} style={{ color: "#94a3b8" }} />
                        <span>Total Qty:</span>
                        <span className="iov-summary-val">{totalQty}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="iov-summary-chip">
                        <DollarSign size={13} style={{ color: "#94a3b8" }} />
                        <span>Total Cost:</span>
                        <span className="iov-summary-val green">${totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Action Bar ─────────────────────────────────────────────── */}
                <div className="iov-action-bar">
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {isPending    && <span>Awaiting approval action</span>}
                    {isApproved   && <span>Ready to be dispatched</span>}
                    {isDispatched && <span>In transit — awaiting receipt</span>}
                    {isCompleted  && <span style={{ color: "#7c3aed", fontWeight: 600 }}>✓ Order completed</span>}
                    {isRejected   && <span style={{ color: "#dc2626", fontWeight: 600 }}>✕ Order rejected</span>}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    {/* Print */}
                    <button type="button" className="iov-btn iov-btn-ghost" onClick={() => window.print()}>
                      <Printer size={13} /> Print
                    </button>

                    {/* Approve */}
                    {isPending && (
                      <button type="button" className="iov-btn iov-btn-green" disabled={updating} onClick={() => handleStatusUpdate("approved")}>
                        {updating ? <><div className="iov-spinner" /> Updating…</> : <><CheckCircle size={13} /> Approve</>}
                      </button>
                    )}

                    {/* Reject */}
                    {isPending && (
                      <button type="button" className="iov-btn iov-btn-red" disabled={updating} onClick={() => handleStatusUpdate("rejected")}>
                        {updating ? <><div className="iov-spinner" /> Updating…</> : <><XCircle size={13} /> Reject</>}
                      </button>
                    )}

                    {/* Dispatch */}
                    {isApproved && (
                      <button type="button" className="iov-btn iov-btn-blue" disabled={updating} onClick={() => handleStatusUpdate("dispatched")}>
                        {updating ? <><div className="iov-spinner" /> Updating…</> : <><Truck size={13} /> Dispatch Order</>}
                      </button>
                    )}

                    {/* Complete */}
                    {isDispatched && (
                      <button type="button" className="iov-btn iov-btn-teal" disabled={updating} onClick={() => handleStatusUpdate("completed")}>
                        {updating ? <><div className="iov-spinner" /> Updating…</> : <><CheckCircle size={13} /> Mark Completed</>}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default InternalOrder;