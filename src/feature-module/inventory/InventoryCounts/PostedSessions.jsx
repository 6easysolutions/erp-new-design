import { useMemo, useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommonFooter from "../../../components/footer/commonFooter";
import {
  CheckCircle, X, Save, RefreshCw, ChevronRight, Clipboard,
  Package, MapPin, AlertCircle, TrendingUp, TrendingDown,
  Activity, DollarSign, BarChart2, User, Calendar, Archive,
  ChevronLeft
} from "react-feather";
import { URLS } from "../../../Urls";
import { all_routes } from "../../../routes/all_routes";


const PostedSessions = () => {
  const { id } = useParams();
  const location = useLocation();
  const storeId = location.state?.storeId  || "";

  // ── State ──────────────────────────────────────────────────────────────────
  const [sessionData, setSessionData]         = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [freezeStock, setFreezeStock]         = useState(false);
  const [editingItems, setEditingItems]       = useState({});
  const [saving, setSaving]                   = useState(false);
  const [updatingApproval, setUpdatingApproval] = useState({});

  // ── Fetch session ──────────────────────────────────────────────────────────
  const fetchSessionData = async (sessionId, storeId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const res   = await fetch(URLS.GetInventoryCountBySessionId, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: parseInt(sessionId), storeId: storeId }),
      });
      const data = await res.json();
      if (res.ok && data.success) setSessionData(data.session);
      else setError(data.message || "Failed to fetch session data.");
    } catch (e) {
      console.error(e);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchSessionData(id, storeId); }, [id]);

  // ── Transform API data ─────────────────────────────────────────────────────
  const transformedSession = useMemo(() => {
    if (!sessionData) return null;
    const items = sessionData.productsArray?.map((p) => ({
      id: p.productId,
      item: p.productName,
      sku: p.sku || "N/A",
      location: "N/A",
      systemQty: parseInt(p.systemQty) || 0,
      physicalQty: p.physicalQty || 0,
      unitCost: parseFloat(p.unitCost) || 0,
      approvalStatus: p.approvalStatus === "approved" ? "Approved"
        : p.approvalStatus === "rejected" ? "Rejected" : "Pending",
    })) || [];

    const totalItems         = items.length;
    const totalVarianceQty   = items.reduce((s, i) => s + (i.physicalQty - i.systemQty), 0);
    const totalVarianceValue = items.reduce((s, i) => s + (i.physicalQty - i.systemQty) * i.unitCost, 0);

    return {
      sessionId: sessionData.sessionId,
      code: sessionData.sessionCode,
      freezeStock,
      status: "In Progress",
      countType: sessionData.countType === "fullcount" ? "Full Count" : "Spot Count",
      createdBy: "System",
      approvedBy: "—",
      scopeType: sessionData.scopeType,
      scopeValue: sessionData.categoryName || "N/A",
      warehouse: sessionData.warehouseName,
      started: sessionData.startDate
        ? new Date(sessionData.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "—",
      approvalDate: "—",
      totalItems, totalVarianceQty, totalVarianceValue,
      notes: `${sessionData.countType} session for ${sessionData.categoryName || "selected items"}.`,
      items,
    };
  }, [sessionData, freezeStock]);

  const session = transformedSession;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatCurrency = (v) => {
    const sign = v < 0 ? "-" : "";
    return `${sign}$${Math.abs(v).toFixed(2)}`;
  };

  const getVarianceColor = (v) => v > 0 ? "#059669" : v < 0 ? "#ef4444" : "#1e293b";
  const getVarianceBg    = (v) => v > 0 ? "rgba(16,185,129,0.08)" : v < 0 ? "rgba(239,68,68,0.08)" : "rgba(100,116,139,0.08)";

  const getStatusMeta = (status) => {
    switch (status) {
      case "Completed":   return { bg: "rgba(16,185,129,0.1)",  color: "#059669", border: "rgba(16,185,129,0.25)", dot: "#10b981" };
      case "Submitted":   return { bg: "rgba(139,92,246,0.1)",  color: "#7c3aed", border: "rgba(139,92,246,0.25)", dot: "#8b5cf6" };
      case "In Progress": return { bg: "rgba(59,130,246,0.1)",  color: "#2563eb", border: "rgba(59,130,246,0.25)", dot: "#3b82f6" };
      default:            return { bg: "rgba(245,158,11,0.1)",  color: "#b45309", border: "rgba(245,158,11,0.25)", dot: "#f59e0b" };
    }
  };

  const getApprovalMeta = (status) => {
    switch (status) {
      case "Approved": return { bg: "rgba(16,185,129,0.1)",  color: "#059669", border: "rgba(16,185,129,0.25)", dot: "#10b981" };
      case "Rejected": return { bg: "rgba(239,68,68,0.1)",   color: "#dc2626", border: "rgba(239,68,68,0.25)",  dot: "#ef4444" };
      default:         return { bg: "rgba(245,158,11,0.1)",  color: "#b45309", border: "rgba(245,158,11,0.25)", dot: "#f59e0b" };
    }
  };

  // ── Live variance totals (respects editing state) ──────────────────────────
  const getLiveVarianceQty = () => {
    if (!session?.items) return 0;
    return session.items.reduce((sum, item) => {
      const pQty = editingItems[item.id] ? parseInt(editingItems[item.id].physicalQty) || 0 : item.physicalQty;
      return sum + (pQty - item.systemQty);
    }, 0);
  };

  const getLiveVarianceValue = () => {
    if (!session?.items) return 0;
    return session.items.reduce((sum, item) => {
      const pQty = editingItems[item.id] ? parseInt(editingItems[item.id].physicalQty) || 0 : item.physicalQty;
      return sum + ((pQty - item.systemQty) * item.unitCost);
    }, 0);
  };

  // ── Save physical counts ───────────────────────────────────────────────────
  const savePhysicalCounts = async () => {
    if (!id || Object.keys(editingItems).length === 0) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const items = Object.entries(editingItems).map(([productId, d]) => ({
        productId: parseInt(productId),
        physicalQty: parseInt(d.physicalQty) || 0,
      }));
      const res  = await fetch(URLS.SavePhysicalCounts, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: parseInt(id), items }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditingItems({});
        await fetchSessionData(id, storeId);
        toast.success(`${data.message} — ${data.summary?.totalItems ?? ""} items updated`);
      } else {
        toast.error(data.message || "Failed to save physical counts.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => setEditingItems({});

  // ── Update approval status ─────────────────────────────────────────────────
  const updateApprovalStatus = async (productId, newStatus) => {
    if (!id) return;
    setUpdatingApproval((prev) => ({ ...prev, [productId]: true }));
    try {
      const token = localStorage.getItem("authToken");
      const res   = await fetch(URLS.UpdateApprovalStatus, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: parseInt(id), productId: parseInt(productId), status: newStatus.toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchSessionData(id, storeId);
        toast.success(`Approval updated to ${newStatus}`);
      } else {
        toast.error(data.message || "Failed to update approval status.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error. Please try again.");
    } finally {
      setUpdatingApproval((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const getNextApprovalStatus = (s) => ({ Pending: "Approved", Approved: "Rejected", Rejected: "Pending" }[s] ?? "Approved");

  const hasEdits = Object.keys(editingItems).length > 0;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{`.ps-root { background: linear-gradient(135deg,#f8faff 0%,#dbe8ff 100%); min-height:100vh; padding:100px 24px 24px; font-family:"Inter",-apple-system,sans-serif; }`}</style>
      <div className="ps-root">
        <div style={{ maxWidth: "95%", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="spinner-border" style={{ width: 24, height: 24, color: "#3b82f6" }} role="status"><span className="visually-hidden">Loading…</span></div>
          </div>
          <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>Loading session data…</div>
        </div>
      </div>
    </>
  );

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) return (
    <>
      <style>{`.ps-root { background: linear-gradient(135deg,#f8faff 0%,#dbe8ff 100%); min-height:100vh; padding:100px 24px 24px; font-family:"Inter",-apple-system,sans-serif; }`}</style>
      <div className="ps-root">
        <div style={{ maxWidth: "95%", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: "16px 22px", display: "flex", alignItems: "center", gap: 10, color: "#b91c1c", fontSize: 13, fontWeight: 500 }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
          </div>
          <button
            type="button"
            onClick={() => id && fetchSessionData(id, storeId)}
            style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", border: "none", borderRadius: 12, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    </>
  );

  if (!session) return null;

  const statusMeta = getStatusMeta(session.status);
  const liveVarianceQty   = getLiveVarianceQty();
  const liveVarianceValue = getLiveVarianceValue();

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .ps-root {
          background: linear-gradient(135deg, #f8faff 0%, #dbe8ff 100%);
          min-height: 100vh;
          padding: 24px;
          padding-top: 100px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ── Main glass card ──────────────────────────────────────────── */
        .ps-main-card {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          padding: 28px 32px;
          margin-bottom: 24px;
        }

        /* ── Section sub-cards ────────────────────────────────────────── */
        .ps-card {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px;
          margin-bottom: 18px;
          overflow: visible;
        }
        .ps-card-header {
          padding: 13px 20px;
          border-bottom: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; flex-wrap: wrap;
          background: rgba(255,255,255,0.4);
          border-radius: 18px 18px 0 0;
        }
        .ps-card-header-left { display: flex; align-items: center; gap: 9px; }
        .ps-card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }
        .ps-card-body { padding: 20px; }

        /* ── Icon box ─────────────────────────────────────────────────── */
        .ps-icon-box {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* ── Info grid ────────────────────────────────────────────────── */
        .ps-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .ps-info-label {
          font-size: 10px; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;
        }
        .ps-info-val {
          font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.4;
        }

        /* ── Stat bar ─────────────────────────────────────────────────── */
        .ps-stat-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
        }
        .ps-stat-tile {
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          transition: transform 0.18s;
        }
        .ps-stat-tile:hover { transform: translateY(-2px); }
        .ps-stat-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .ps-stat-val { font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1; margin-bottom: 2px; }
        .ps-stat-lbl { font-size: 11px; color: #64748b; font-weight: 500; }

        /* ── Table card ───────────────────────────────────────────────── */
        .ps-table-card {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 18px;
        }
        .ps-th {
          padding: 11px 14px;
          font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.5px;
          background: rgba(248,250,252,0.7);
          border-bottom: 1px solid rgba(226,232,240,0.6);
          white-space: nowrap; text-align: left;
        }
        .ps-th-right  { text-align: right; }
        .ps-th-center { text-align: center; width: 46px; }
        .ps-td {
          padding: 11px 14px;
          font-size: 13px; color: #1e293b;
          border-bottom: 1px solid rgba(226,232,240,0.4);
          vertical-align: middle; white-space: nowrap;
        }
        .ps-td-muted  { color: #64748b; }
        .ps-td-right  { text-align: right; }
        .ps-td-center { text-align: center; }
        .ps-tr { transition: background 0.13s; }
        .ps-tr:hover td { background: rgba(59,130,246,0.025); }
        .ps-tr:last-child td { border-bottom: none; }

        /* Physical qty click-to-edit span */
        .ps-qty-span {
          display: inline-block;
          padding: 4px 10px; border-radius: 8px;
          border: 1.5px solid transparent;
          cursor: pointer; transition: all 0.18s;
          font-weight: 700;
        }
        .ps-qty-span:hover {
          background: rgba(59,130,246,0.07);
          border-color: rgba(59,130,246,0.3);
          color: #2563eb;
        }
        .ps-qty-input {
          width: 80px; height: 32px;
          border: 2px solid rgba(59,130,246,0.5);
          border-radius: 8px; padding: 0 8px;
          text-align: right; font-size: 13px; font-weight: 700;
          outline: none; background: #fff;
          font-family: inherit; color: #1e293b;
        }
        .ps-qty-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }

        /* Approval badge */
        .ps-approval-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 20px;
          font-size: 11px; font-weight: 700;
          cursor: pointer; transition: all 0.18s;
          border: 1px solid transparent;
          user-select: none;
        }
        .ps-approval-badge:hover:not(.updating) {
          transform: scale(1.04);
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        .ps-approval-badge.updating { cursor: wait; opacity: 0.65; }
        .ps-approval-dot {
          width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
        }

        /* Status badge */
        .ps-status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 700;
          border: 1px solid transparent;
        }

        /* Session code chip */
        .ps-code-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 20px; padding: 5px 14px;
          font-size: 13px; font-weight: 700; color: #2563eb;
        }

        /* ── Buttons ──────────────────────────────────────────────────── */
        .ps-btn {
          height: 36px; padding: 0 16px; border-radius: 11px; border: none;
          font-size: 12px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px;
          transition: all 0.2s; white-space: nowrap; font-family: inherit;
        }
        .ps-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .ps-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .ps-btn-cancel {
          background: rgba(241,245,249,0.9);
          border: 1.5px solid rgba(226,232,240,0.9); color: #64748b;
        }
        .ps-btn-cancel:hover { background: rgba(226,232,240,0.8); }
        .ps-btn-save {
          background: linear-gradient(135deg,#3b82f6,#2563eb);
          color: #fff; box-shadow: 0 4px 12px rgba(37,99,235,0.25);
        }
        .ps-btn-save:hover:not(:disabled) { box-shadow: 0 6px 18px rgba(37,99,235,0.35); }
        .ps-btn-ghost {
          background: rgba(255,255,255,0.5);
          border: 1.5px solid rgba(226,232,240,0.9); color: #475569;
        }
        .ps-btn-ghost:hover { background: rgba(255,255,255,0.85); }

        /* ── Page title ───────────────────────────────────────────────── */
        .ps-title { font-size: 23px; font-weight: 700; color: #0f172a; margin: 0; }

        /* ── Notes bar ────────────────────────────────────────────────── */
        .ps-notes-bar {
          background: rgba(248,250,252,0.6);
          border: 1px solid rgba(226,232,240,0.6);
          border-radius: 14px; padding: 12px 18px;
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: #64748b;
          margin-bottom: 18px;
        }

        /* ── Spinner ──────────────────────────────────────────────────── */
        @keyframes ps-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .ps-spinner {
          width: 12px; height: 12px; border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: currentColor;
          animation: ps-spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .ps-root { padding: 16px; padding-top: 80px; }
          .ps-main-card { padding: 18px; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="ps-root">
        <div style={{ maxWidth: "95%", margin: "0 auto" }}>
          <div className="ps-main-card">

            {/* ── Page Header ───────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                {/* Breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, fontSize: 12, color: "#94a3b8" }}>
                  <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>Dashboard</Link>
                  <ChevronRight size={12} />
                  <Link to="/inventory/count-sessions" style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>Count Sessions</Link>
                  <ChevronRight size={12} />
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>Session Details</span>
                </div>

                {/* Title + code chip */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(59,130,246,0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Clipboard size={20} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <h4 className="ps-title">Inventory Count Session</h4>
                      <div className="ps-code-chip">
                        <Clipboard size={11} /> {session.code}
                      </div>
                    </div>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 0" }}>
                      Review counted items, update physical quantities, and manage approvals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: back + refresh + status */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Link to={all_routes.inventorycounts} className="ps-btn ps-btn-ghost">
                  <ChevronLeft size={13} /> Back
                </Link>
                <button type="button" className="ps-btn ps-btn-ghost" onClick={() => id && fetchSessionData(id, storeId)}>
                  <RefreshCw size={12} /> Refresh
                </button>
                <div
                  className="ps-status-badge"
                  style={{ background: statusMeta.bg, color: statusMeta.color, borderColor: statusMeta.border }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusMeta.dot, flexShrink: 0 }} />
                  <CheckCircle size={12} />
                  {session.status}
                </div>
              </div>
            </div>

            {/* ── Overview Stat Tiles ────────────────────────────────────────── */}
            <div className="ps-stat-bar" style={{ marginBottom: 20 }}>
              {[
                { label: "Total Items",      val: session.totalItems,  icon: <Package size={15} />,    bg: "rgba(59,130,246,0.1)",  color: "#3b82f6" },
                {
                  label: "Variance Qty",
                  val: hasEdits
                    ? (liveVarianceQty > 0 ? `+${liveVarianceQty}` : liveVarianceQty)
                    : (session.totalVarianceQty > 0 ? `+${session.totalVarianceQty}` : session.totalVarianceQty),
                  icon: <BarChart2 size={15} />,
                  bg: liveVarianceQty > 0 ? "rgba(16,185,129,0.1)" : liveVarianceQty < 0 ? "rgba(239,68,68,0.1)" : "rgba(100,116,139,0.1)",
                  color: getVarianceColor(liveVarianceQty),
                },
                {
                  label: "Variance Value",
                  val: formatCurrency(hasEdits ? liveVarianceValue : session.totalVarianceValue),
                  icon: <DollarSign size={15} />,
                  bg: liveVarianceValue > 0 ? "rgba(16,185,129,0.1)" : liveVarianceValue < 0 ? "rgba(239,68,68,0.1)" : "rgba(100,116,139,0.1)",
                  color: getVarianceColor(liveVarianceValue),
                },
                {
                  label: "Pending Approval",
                  val: session.items.filter((i) => i.approvalStatus === "Pending").length,
                  icon: <Activity size={15} />,
                  bg: "rgba(245,158,11,0.1)", color: "#b45309",
                },
              ].map((s) => (
                <div key={s.label} className="ps-stat-tile">
                  <div className="ps-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                  <div>
                    <div className="ps-stat-val" style={{ color: s.color, fontSize: 18 }}>{s.val}</div>
                    <div className="ps-stat-lbl">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Session Information Grid ───────────────────────────────────── */}
            <div className="ps-card">
              <div className="ps-card-header">
                <div className="ps-card-header-left">
                  <div className="ps-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <Clipboard size={13} />
                  </div>
                  <h2 className="ps-card-title">Session Information</h2>
                </div>
              </div>

              <div className="ps-card-body">
                <div className="ps-info-grid">
                  {[
                    { label: "Count Type",    val: session.countType,   icon: <Archive size={12} /> },
                    { label: "Created By",    val: session.createdBy,   icon: <User size={12} /> },
                    { label: "Approved By",   val: session.approvedBy,  icon: <CheckCircle size={12} /> },
                    { label: "Scope",         val: `${session.scopeType} — ${session.scopeValue}`, icon: <Activity size={12} /> },
                    { label: "Started",       val: session.started,     icon: <Calendar size={12} /> },
                    { label: "Approval Date", val: session.approvalDate,icon: <Calendar size={12} /> },
                    { label: "Warehouse",     val: session.warehouse,   icon: <MapPin size={12} /> },
                  ].map(({ label, val, icon }) => (
                    <div key={label}>
                      <div className="ps-info-label" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ color: "#94a3b8" }}>{icon}</span> {label}
                      </div>
                      <div className="ps-info-val">{val || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Items Table ────────────────────────────────────────────────── */}
            <div className="ps-table-card">
              <div className="ps-card-header">
                <div className="ps-card-header-left">
                  <div className="ps-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <Package size={13} />
                  </div>
                  <h2 className="ps-card-title">Counted Items</h2>
                  <span style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
                    {session.items.length} items
                  </span>
                  {hasEdits && (
                    <span style={{ background: "rgba(245,158,11,0.1)", color: "#b45309", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, border: "1px solid rgba(245,158,11,0.25)" }}>
                      {Object.keys(editingItems).length} edited
                    </span>
                  )}
                </div>

                {/* Save / Cancel editing */}
                {hasEdits && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="ps-btn ps-btn-cancel" onClick={cancelEditing} disabled={saving}>
                      <X size={12} /> Discard
                    </button>
                    <button type="button" className="ps-btn ps-btn-save" onClick={savePhysicalCounts} disabled={saving}>
                      {saving
                        ? <><div className="ps-spinner" /> Saving…</>
                        : <><Save size={12} /> Save Changes</>
                      }
                    </button>
                  </div>
                )}
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
                  <thead>
                    <tr>
                      <th className="ps-th ps-th-center">
                        <input type="checkbox" style={{ accentColor: "#3b82f6", cursor: "pointer" }} />
                      </th>
                      <th className="ps-th">Item</th>
                      <th className="ps-th">SKU</th>
                      <th className="ps-th">Location</th>
                      <th className="ps-th ps-th-right">System Qty</th>
                      <th className="ps-th ps-th-right">Physical Qty</th>
                      <th className="ps-th ps-th-right">Variance Qty</th>
                      <th className="ps-th ps-th-right">Unit Cost</th>
                      <th className="ps-th ps-th-right">Variance Value</th>
                      <th className="ps-th">Approval</th>
                    </tr>
                  </thead>

                  <tbody>
                    {session.items.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ padding: "40px 16px", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(148,163,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Package size={22} style={{ color: "#cbd5e1" }} />
                            </div>
                            <div style={{ fontWeight: 600, color: "#64748b", fontSize: 14 }}>No items in this session.</div>
                          </div>
                        </td>
                      </tr>
                    ) : session.items.map((item) => {
                      const isEditing       = !!editingItems[item.id];
                      const currentPhysQty  = isEditing ? editingItems[item.id].physicalQty : item.physicalQty;
                      const varianceQty     = parseInt(currentPhysQty) - item.systemQty;
                      const varianceValue   = varianceQty * item.unitCost;
                      const approvalMeta    = getApprovalMeta(item.approvalStatus);
                      const isUpdating      = !!updatingApproval[item.id];

                      return (
                        <tr key={item.id} className="ps-tr" style={{ background: isEditing ? "rgba(59,130,246,0.025)" : "transparent" }}>

                          {/* Checkbox */}
                          <td className="ps-td ps-td-center">
                            <input type="checkbox" style={{ accentColor: "#3b82f6", cursor: "pointer" }} />
                          </td>

                          {/* Item */}
                          <td className="ps-td">
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Package size={13} style={{ color: "#3b82f6" }} />
                              </div>
                              <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{item.item}</span>
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="ps-td ps-td-muted">
                            <span style={{ background: "rgba(100,116,139,0.08)", color: "#475569", padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                              {item.sku}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="ps-td ps-td-muted">
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <MapPin size={11} style={{ color: "#94a3b8", flexShrink: 0 }} />
                              {item.location}
                            </div>
                          </td>

                          {/* System Qty */}
                          <td className="ps-td ps-td-right">
                            <span style={{ background: "rgba(100,116,139,0.08)", color: "#475569", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                              {item.systemQty}
                            </span>
                          </td>

                          {/* Physical Qty — click to edit */}
                          <td className="ps-td ps-td-right">
                            {isEditing ? (
                              <input
                                type="number"
                                className="ps-qty-input"
                                value={currentPhysQty}
                                min="0"
                                onChange={(e) => setEditingItems((prev) => ({ ...prev, [item.id]: { physicalQty: e.target.value } }))}
                                autoFocus
                              />
                            ) : (
                              <span
                                className="ps-qty-span"
                                title="Click to edit"
                                onClick={() => setEditingItems((prev) => ({ ...prev, [item.id]: { physicalQty: item.physicalQty } }))}
                              >
                                {item.physicalQty}
                              </span>
                            )}
                          </td>

                          {/* Variance Qty */}
                          <td className="ps-td ps-td-right">
                            <span style={{
                              background: getVarianceBg(varianceQty),
                              color: getVarianceColor(varianceQty),
                              padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                              display: "inline-flex", alignItems: "center", gap: 3,
                            }}>
                              {varianceQty > 0 ? <TrendingUp size={10} /> : varianceQty < 0 ? <TrendingDown size={10} /> : null}
                              {varianceQty > 0 ? `+${varianceQty}` : varianceQty}
                            </span>
                          </td>

                          {/* Unit Cost */}
                          <td className="ps-td ps-td-right" style={{ color: "#475569", fontWeight: 600 }}>
                            {item.unitCost > 0 ? `$${item.unitCost.toFixed(2)}` : "N/A"}
                          </td>

                          {/* Variance Value */}
                          <td className="ps-td ps-td-right">
                            <span style={{
                              background: getVarianceBg(varianceValue),
                              color: getVarianceColor(varianceValue),
                              padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                            }}>
                              {formatCurrency(varianceValue)}
                            </span>
                          </td>

                          {/* Approval */}
                          <td className="ps-td">
                            <span
                              className={`ps-approval-badge${isUpdating ? " updating" : ""}`}
                              style={{ background: approvalMeta.bg, color: approvalMeta.color, borderColor: approvalMeta.border }}
                              onClick={() => { if (!isUpdating) updateApprovalStatus(item.id, getNextApprovalStatus(item.approvalStatus)); }}
                              title={isUpdating ? "Updating…" : `Click → ${getNextApprovalStatus(item.approvalStatus)}`}
                            >
                              {isUpdating
                                ? <><div className="ps-spinner" /> Updating…</>
                                : <><span className="ps-approval-dot" style={{ background: approvalMeta.dot }} />{item.approvalStatus}</>
                              }
                            </span>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Bottom Totals Bar ──────────────────────────────────────────── */}
            <div style={{
              background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.14)",
              borderRadius: 14, padding: "13px 20px", marginBottom: 18,
              display: "flex", flexWrap: "wrap", gap: "10px 28px", alignItems: "center",
            }}>
              {[
                { label: "Total Items",      val: session.totalItems,                         color: "#0f172a" },
                { label: "Variance Qty",     val: liveVarianceQty > 0 ? `+${liveVarianceQty}` : liveVarianceQty, color: getVarianceColor(liveVarianceQty) },
                { label: "Variance Value",   val: formatCurrency(liveVarianceValue),           color: getVarianceColor(liveVarianceValue) },
              ].map(({ label, val, color }, i, arr) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 13, color: "#475569" }}>
                    <span style={{ fontWeight: 500 }}>{label}: </span>
                    <span style={{ fontWeight: 800, color }}>{val}</span>
                  </div>
                  {i < arr.length - 1 && <div style={{ width: 1, height: 16, background: "rgba(59,130,246,0.2)" }} />}
                </div>
              ))}
            </div>

            {/* ── Notes ─────────────────────────────────────────────────────── */}
            <div className="ps-notes-bar">
              <div className="ps-icon-box" style={{ background: "rgba(100,116,139,0.08)", color: "#64748b", flexShrink: 0 }}>
                <AlertCircle size={13} />
              </div>
              <span style={{ fontWeight: 700, color: "#475569", fontSize: 13, flexShrink: 0 }}>Notes:</span>
              <span style={{ fontSize: 13, color: "#64748b" }}>{session.notes || "No notes available."}</span>
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default PostedSessions;