import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft, X, Save, Truck, Plus, Trash2, Package,
  RotateCcw, ChevronRight, Hash, Calendar,  
  User, FileText, AlertTriangle, AlertCircle,
  Square,
} from "react-feather";
import { useNavigate, Link, useParams } from "react-router-dom";
import { all_routes } from "../../../routes/all_routes";
import { URLS } from "../../../Urls";


// ─────────────────────────────────────────
// Status config (same as original)
// ─────────────────────────────────────────
const STATUS_META = {
  Draft:    { color: "#92400e", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  dot: "#f59e0b" },
  Pending:  { color: "#2563eb", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  dot: "#3b82f6" },
  Approved: { color: "#059669", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  dot: "#10b981" },
};
const getStatusMeta = (s) =>
  STATUS_META[s] || { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)", dot: "#94a3b8" };

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
      {status}
    </span>
  );
};

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
const EditStockTransfer = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { id: transferId } = useParams(); // get transfer ID from URL, fallback to prop if needed

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]); // for product dropdowns
  const [stores, setStores] = useState([]);     // for warehouse dropdowns

  const [formData, setFormData] = useState({
    transferId: "",
    transferCode: "",
    transferDate: "",
    sourceWarehouse: "",
    destinationWarehouse: "",
    requestedBy: "",
    notes: "",
    status: "",
  });

  const [items, setItems] = useState([]);

  // Helper: mark changes
  const markChanged = () => setHasChanges(true);

  // ─────────────────────────────────────────
  // Fetch transfer data
  // ─────────────────────────────────────────
  const fetchTransfer = async () => {
    if (!transferId) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      // Adjust the endpoint to include the transfer ID (e.g., ?id= or /:id)
      const url = `${URLS.GetStockTransferById}`;
      const response = await fetch(url, {
        method: 'POST', // or POST depending on backend
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: transferId }),
      });
      const result = await response.json();
      if (result.success) {
        const data = result.data;
        setFormData({
          transferId: data.id,
          transferCode: data.transferCode,
          transferDate: data.transferDate ? data.transferDate.substring(0, 10) : "",
          sourceWarehouse: data.sourceWarehouseName || data.sourceWarehouse,
          destinationWarehouse: data.destinationWarehouseName || data.destinationWarehouse,
          requestedBy: data.requestedByName || data.requestedBy,
          notes: data.notes || "",
          status: data.status,
        });
        setItems(data.items || []);
      } else {
        setError(result.message || 'Failed to load transfer');
      }
    } catch (err) {
      console.error('Fetch transfer error:', err);
      setError('Error loading transfer. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products and stores for dropdowns
  const fetchMasterData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      // Fetch products
      const productsRes = await fetch(URLS.GetAllStoreProducts, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const productsData = await productsRes.json();
      if (productsData.success) setProducts(productsData.data);

      // Fetch stores
      const storesRes = await fetch(URLS.GetAllStore, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const storesData = await storesRes.json();
      if (storesData.success) setStores(storesData.data);
    } catch (err) {
      console.error('Master data fetch error:', err);
    }
  };

  useEffect(() => {
    fetchTransfer();
    fetchMasterData();
  }, [transferId]);

  // ─────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    markChanged();
  };

  const handleItemChange = (id, field, value) => {
    setItems((p) => p.map((item) => item.id === id ? { ...item, [field]: value } : item));
    markChanged();
  };

  const addProduct = () => {
    setItems((p) => [...p, {
      id: Date.now(),
      productId: "",
      product: "",
      availableQty: 0,
      transferQty: 0,
      unit: "pcs",
      remarks: "",
    }]);
    markChanged();
  };

  const removeItem = (id) => {
    setItems((p) => p.filter((item) => item.id !== id));
    markChanged();
  };

  // Save Changes (update transfer details including items)
  const handleSaveChanges = async () => {
    // Build payload – you need to adapt to your backend structure
    const payload = {
      transferId: formData.transferId,
      transferDate: formData.transferDate,
      sourceWarehouse: formData.sourceWarehouse,
      destinationWarehouse: formData.destinationWarehouse,
      requestedBy: formData.requestedBy,
      notes: formData.notes,
      status: formData.status,
      items: items.map(i => ({
        id: i.id,
        productId: i.productId,
        product: i.product,
        transferQty: i.transferQty,
        remarks: i.remarks,
        // include other fields as needed
      })),
    };

    setSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const apiEndpoint = URLS.UpdateStockTransferStatus || URLS.UpdateStockTransfer;
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        alert('Transfer updated successfully');
        setHasChanges(false);
        if (onSuccess) onSuccess();
        // Optionally refresh data
        fetchTransfer();
      } else {
        alert(result.message || 'Failed to update transfer');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Dispatch Transfer – update status to "approved" (or whatever)
  const handleDispatch = async () => {
    // Ensure at least one item with transferQty > 0
    const hasValidItems = items.some(i => Number(i.transferQty) > 0);
    if (!hasValidItems) {
      alert('Please add at least one product with a transfer quantity > 0.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(URLS.UpdateStockTransfer, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transferId: Number(formData.transferId || transferId),
          status: 'approved'
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert('Transfer dispatched successfully!');
        setFormData(prev => ({ ...prev, status: result.newStatus || 'approved' }));
        setHasChanges(false);
        if (onSuccess) onSuccess();
        navigate(all_routes.transfers);
      } else {
        alert(result.message || 'Failed to dispatch transfer');
      }
    } catch (err) {
      console.error('Dispatch error:', err);
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    setHasChanges(false);
    // Optionally reload original data
    fetchTransfer();
  };

  const totalQty = items.reduce((s, i) => s + Number(i.transferQty || 0), 0);

  // Show loading state
  if (loading) {
    return (
      <div className="est-root">
        <div style={{ maxWidth: "95%", margin: "0 auto", textAlign: "center", padding: "50px" }}>
          Loading transfer...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="est-root">
        <div style={{ maxWidth: "95%", margin: "0 auto", textAlign: "center", padding: "50px", color: "#dc2626" }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* All original styles from the component (unchanged) */
        * { box-sizing: border-box; }
        .est-root {
          background: linear-gradient(135deg, #f8faff 0%, #dbe8ff 100%);
          min-height: 100vh; padding: 24px; padding-top: 100px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .est-main-card {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border-radius: 24px; border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          padding: 28px 32px; margin-bottom: 24px;
        }
        .est-card {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px; margin-bottom: 18px; overflow: visible;
        }
        .est-card-header {
          padding: 13px 20px;
          border-bottom: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; flex-wrap: wrap;
          background: rgba(255,255,255,0.4);
          border-radius: 18px 18px 0 0;
        }
        .est-card-header-left { display: flex; align-items: center; gap: 9px; }
        .est-card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }
        .est-card-body { padding: 20px; }
        .est-icon-box {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .est-unsaved-banner {
          display: flex; align-items: center; gap: 10px;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.3);
          border-radius: 14px; padding: 11px 16px; margin-bottom: 18px;
          font-size: 12px; font-weight: 600; color: #92400e;
        }
        .est-unsaved-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #f59e0b;
          flex-shrink: 0; animation: est-pulse 1.4s ease-in-out infinite;
        }
        @keyframes est-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }
        .est-field-label {
          font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.4px;
          display: block; margin-bottom: 6px;
        }
        .est-input-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 0 14px; height: 38px;
          display: flex; align-items: center; gap: 8px; transition: border-color 0.2s;
        }
        .est-input-wrap:focus-within { border-color: rgba(245,158,11,0.5); box-shadow: 0 0 0 3px rgba(245,158,11,0.08); }
        .est-input-wrap.readonly { background: rgba(248,250,252,0.8); }
        .est-input {
          background: transparent; border: none; outline: none;
          font-size: 13px; color: #1e293b; font-weight: 500;
          flex: 1; min-width: 0; font-family: inherit; width: 100%;
        }
        .est-input::placeholder { color: #94a3b8; font-weight: 400; }
        .est-input[type="date"] { cursor: pointer; }
        .est-select-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 3px 8px 3px 14px;
          display: flex; align-items: center; gap: 8px;
          transition: border-color 0.2s;
        }
        .est-select-wrap:focus-within { border-color: rgba(245,158,11,0.5); box-shadow: 0 0 0 3px rgba(245,158,11,0.08); }
        .est-select {
          background: transparent; border: none; outline: none;
          font-size: 13px; color: #1e293b; font-weight: 500;
          width: 100%; cursor: pointer; font-family: inherit;
          appearance: none; -webkit-appearance: none; height: 34px;
        }
        .est-textarea-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 10px 14px; transition: border-color 0.2s;
        }
        .est-textarea-wrap:focus-within { border-color: rgba(245,158,11,0.5); box-shadow: 0 0 0 3px rgba(245,158,11,0.08); }
        .est-textarea {
          background: transparent; border: none; outline: none;
          font-size: 13px; color: #1e293b; font-family: inherit;
          width: 100%; resize: vertical; min-height: 60px; font-weight: 500;
        }
        .est-textarea::placeholder { color: #94a3b8; font-weight: 400; }
        .est-form-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        @media (max-width: 900px) { .est-form-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .est-form-grid { grid-template-columns: 1fr; } }
        .est-th {
          padding: 11px 14px; font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.5px;
          background: rgba(248,250,252,0.7);
          border-bottom: 1px solid rgba(226,232,240,0.6);
          white-space: nowrap; text-align: left;
        }
        .est-th-c { text-align: center; }
        .est-td {
          padding: 11px 14px; font-size: 13px; color: #1e293b;
          border-bottom: 1px solid rgba(226,232,240,0.4);
          vertical-align: middle; white-space: nowrap;
        }
        .est-td-c { text-align: center; }
        .est-tr { transition: background 0.13s; }
        .est-tr:hover td { background: rgba(245,158,11,0.02); }
        .est-tr:last-child td { border-bottom: none; }
        .est-thumb {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.18);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .est-product-select-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9); border-radius: 10px;
          padding: 0 10px; height: 32px; display: flex; align-items: center; min-width: 140px;
          transition: border-color 0.2s;
        }
        .est-product-select-wrap:focus-within { border-color: rgba(245,158,11,0.5); }
        .est-product-select {
          background: transparent; border: none; outline: none; font-size: 12px;
          color: #1e293b; font-weight: 600; width: 100%; cursor: pointer;
          font-family: inherit; appearance: none; -webkit-appearance: none;
        }
        .est-qty-input {
          width: 80px; height: 32px;
          border: 1.5px solid rgba(226,232,240,0.9); border-radius: 8px;
          padding: 0 8px; text-align: right; font-size: 13px; font-weight: 700;
          outline: none; background: #fff; font-family: inherit; color: #1e293b;
          transition: border-color 0.2s;
        }
        .est-qty-input:focus { border-color: rgba(245,158,11,0.5); box-shadow: 0 0 0 3px rgba(245,158,11,0.08); }
        .est-remarks-input {
          height: 32px; border: 1.5px solid rgba(226,232,240,0.9); border-radius: 8px;
          padding: 0 12px; font-size: 12px; color: #1e293b; outline: none;
          background: #fff; font-family: inherit; width: 100%; min-width: 120px;
          transition: border-color 0.2s;
        }
        .est-remarks-input:focus { border-color: rgba(245,158,11,0.5); }
        .est-remarks-input::placeholder { color: #94a3b8; }
        .est-remove-btn {
          width: 28px; height: 28px; border-radius: 8px;
          border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.06);
          color: #dc2626; cursor: pointer; display: flex; align-items: center;
          justify-content: center; transition: all 0.15s; flex-shrink: 0; margin: 0 auto;
        }
        .est-remove-btn:hover { background: rgba(239,68,68,0.14); transform: translateY(-1px); }
        .est-table-bottom {
          padding: 12px 20px; border-top: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; gap: 12px;
          background: rgba(248,250,252,0.4);
        }
        .est-summary-bar {
          padding: 12px 20px;
          border-top: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; gap: 20px; justify-content: flex-end;
          background: rgba(248,250,252,0.5);
        }
        .est-summary-chip {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #475569;
        }
        .est-summary-val { font-weight: 800; font-size: 15px; color: #0f172a; }
        .est-btn {
          height: 38px; padding: 0 18px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px;
          transition: all 0.2s; white-space: nowrap; font-family: inherit;
        }
        .est-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .est-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .est-btn-ghost {
          background: rgba(255,255,255,0.5);
          border: 1.5px solid rgba(226,232,240,0.9); color: #475569;
        }
        .est-btn-ghost:hover { background: rgba(255,255,255,0.85); }
        .est-btn-amber {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #fff; box-shadow: 0 4px 14px rgba(245,158,11,0.28);
        }
        .est-btn-amber:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(245,158,11,0.38); }
        .est-btn-teal {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; box-shadow: 0 4px 14px rgba(5,150,105,0.22);
        }
        .est-btn-teal:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(5,150,105,0.32); }
        .est-btn-discard {
          background: rgba(239,68,68,0.08);
          border: 1.5px solid rgba(239,68,68,0.2); color: #dc2626;
        }
        .est-btn-discard:hover { background: rgba(239,68,68,0.14); }
        .est-btn-add {
          background: rgba(245,158,11,0.1);
          border: 1.5px solid rgba(245,158,11,0.3); color: #92400e;
        }
        .est-btn-add:hover { background: rgba(245,158,11,0.18); }
        .est-action-bar {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 16px; padding: 14px 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px; flex-wrap: wrap;
        }
        .est-title-text { font-size: 23px; font-weight: 700; color: #0f172a; margin: 0; }
        .est-code-chip {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3);
          border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #92400e;
        }
        @media (max-width: 768px) {
          .est-root { padding: 16px; padding-top: 80px; }
          .est-main-card { padding: 18px; }
          .est-card-body { padding: 14px; }
        }
      `}</style>

      <div className="est-root">
        <div style={{ maxWidth: "95%", margin: "0 auto" }}>
          <div className="est-main-card">

            {/* Page Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, fontSize: 12, color: "#94a3b8" }}>
                  <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#f59e0b")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>Dashboard</Link>
                  <ChevronRight size={12} />
                  <Link to={all_routes.transfers} style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#f59e0b")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>Stock Transfers</Link>
                  <ChevronRight size={12} />
                  <span style={{ color: "#f59e0b", fontWeight: 600 }}>Edit Transfer</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(245,158,11,0.1)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Truck size={20} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <h4 className="est-title-text">Edit Stock Transfer</h4>
                      <div className="est-code-chip">
                        <Hash size={11} /> {formData.transferCode}
                      </div>
                      <StatusBadge status={formData.status} />
                    </div>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 0" }}>
                      Modify transfer details, update quantities and redispatch.
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(all_routes.transfers)}
                style={{
                  width: 34, height: 34, borderRadius: 10, padding: 0,
                  background: "rgba(255,255,255,0.5)", border: "1.5px solid rgba(226,232,240,0.9)",
                  color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", transition: "all 0.18s",
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Unsaved Changes Banner */}
            {hasChanges && (
              <div className="est-unsaved-banner">
                <div className="est-unsaved-dot" />
                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                <span>You have unsaved changes — save or discard before leaving.</span>
                <button
                  type="button"
                  onClick={handleDiscard}
                  style={{
                    marginLeft: "auto", background: "none", border: "none", padding: 0,
                    cursor: "pointer", color: "#92400e", fontSize: 11, fontWeight: 700,
                    textDecoration: "underline", fontFamily: "inherit",
                  }}
                >
                  Discard
                </button>
              </div>
            )}

            {/* Transfer Information Card */}
            <div className="est-card">
              <div className="est-card-header">
                <div className="est-card-header-left">
                  <div className="est-icon-box" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                    <Truck size={13} />
                  </div>
                  <h2 className="est-card-title">Transfer Information</h2>
                  {hasChanges && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "#92400e",
                      background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
                      padding: "2px 9px", borderRadius: 20,
                    }}>
                      Modified
                    </span>
                  )}
                </div>
              </div>
              <div className="est-card-body">
                <div className="est-form-grid">
                  {/* Transfer ID (readonly) */}
                  <div>
                    <label className="est-field-label"><Hash size={10} style={{ marginRight: 3 }} /> Transfer ID</label>
                    <div className="est-input-wrap readonly">
                      <Hash size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <input className="est-input" value={formData.transferCode} readOnly style={{ color: "#92400e", fontWeight: 700 }} />
                      <span style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic", flexShrink: 0 }}>Auto</span>
                    </div>
                  </div>

                  {/* Transfer Date */}
                  <div>
                    <label className="est-field-label"><Calendar size={10} style={{ marginRight: 3 }} /> Transfer Date</label>
                    <div className="est-input-wrap">
                      <Calendar size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <input
                        type="date" className="est-input"
                        name="transferDate" value={formData.transferDate}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  {/* Requested By */}
                  <div>
                    <label className="est-field-label"><User size={10} style={{ marginRight: 3 }} /> Requested By</label>
                    <div className="est-input-wrap">
                      <User size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <input
                        type="text" className="est-input"
                        name="requestedBy" value={formData.requestedBy}
                        onChange={handleFormChange} placeholder="Enter name…"
                      />
                    </div>
                  </div>

                  {/* Source Warehouse (dynamic from API) */}
                  <div>
                    <label className="est-field-label">Source Warehouse</label>
                    <div className="est-select-wrap">
                      <Square size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <select className="est-select" name="sourceWarehouse" value={formData.sourceWarehouse} onChange={handleFormChange}>
                        <option value="">Select source warehouse</option>
                        {stores.map(store => (
                          <option key={store.id} value={store.storeName}>{store.storeName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Destination Warehouse */}
                  <div>
                    <label className="est-field-label">Destination Warehouse</label>
                    <div className="est-select-wrap">
                      <Square size={12} style={{ color: "#10b981", flexShrink: 0 }} />
                      <select className="est-select" name="destinationWarehouse" value={formData.destinationWarehouse} onChange={handleFormChange}>
                        <option value="">Select destination warehouse</option>
                        {stores.map(store => (
                          <option key={store.id} value={store.storeName}>{store.storeName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Route Preview */}
                  <div>
                    <label className="est-field-label">Route Preview</label>
                    <div style={{
                      background: "rgba(248,250,252,0.8)", border: "1.5px solid rgba(226,232,240,0.9)",
                      borderRadius: 12, padding: "6px 14px", height: 38,
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
                        {formData.sourceWarehouse || "Not selected"}
                      </span>
                      <ChevronRight size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                        {formData.destinationWarehouse || "Not selected"}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="est-field-label"><FileText size={10} style={{ marginRight: 3 }} /> Notes</label>
                    <div className="est-textarea-wrap">
                      <textarea
                        className="est-textarea" name="notes"
                        value={formData.notes} onChange={handleFormChange}
                        placeholder="Add any transfer notes or instructions…"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Card */}
            <div className="est-card">
              <div className="est-card-header">
                <div className="est-card-header-left">
                  <div className="est-icon-box" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                    <Package size={13} />
                  </div>
                  <h2 className="est-card-title">Transfer Products</h2>
                  <span style={{ background: "rgba(245,158,11,0.1)", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                  <thead>
                    <tr>
                      <th className="est-th" style={{ width: 44 }}>#</th>
                      <th className="est-th">Product</th>
                      <th className="est-th est-th-c">Available</th>
                      <th className="est-th est-th-c">Transfer Qty</th>
                      <th className="est-th est-th-c">Unit</th>
                      <th className="est-th">Remarks</th>
                      <th className="est-th est-th-c" style={{ width: 60 }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const overQty = Number(item.transferQty) > item.availableQty;
                      return (
                        <tr key={item.id} className="est-tr">
                          <td className="est-td"><span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>{index + 1}</span></td>
                          <td className="est-td">
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <div className="est-thumb"><Package size={13} style={{ color: "#f59e0b" }} /></div>
                              <div className="est-product-select-wrap">
                                <select
                                  className="est-product-select"
                                  value={item.productId || ""}
                                  onChange={(e) => {
                                    const selectedProduct = products.find(p => p.id == e.target.value);
                                    if (selectedProduct) {
                                      handleItemChange(item.id, "productId", selectedProduct.id);
                                      handleItemChange(item.id, "product", selectedProduct.name);
                                      // Optionally set availableQty from store data? For now, keep as is
                                    }
                                  }}
                                >
                                  <option value="">Select Product</option>
                                  {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </td>
                          <td className="est-td est-td-c">
                            <span style={{
                              background: "rgba(100,116,139,0.08)", color: "#475569",
                              padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                            }}>
                              {item.availableQty}
                            </span>
                          </td>
                          <td className="est-td est-td-c">
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                              <input
                                type="number" className="est-qty-input"
                                value={item.transferQty} min={0} max={item.availableQty}
                                onChange={(e) => handleItemChange(item.id, "transferQty", Number(e.target.value))}
                                style={{ borderColor: overQty ? "rgba(239,68,68,0.5)" : undefined }}
                              />
                              {overQty && (
                                <span style={{ fontSize: 10, color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                                  <AlertTriangle size={9} /> Exceeds stock
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="est-td est-td-c">
                            <span style={{
                              background: "rgba(245,158,11,0.08)", color: "#92400e",
                              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                            }}>
                              {item.unit || "pcs"}
                            </span>
                          </td>
                          <td className="est-td">
                            <input
                              type="text" className="est-remarks-input"
                              value={item.remarks} placeholder="Add remark…"
                              onChange={(e) => handleItemChange(item.id, "remarks", e.target.value)}
                            />
                          </td>
                          <td className="est-td est-td-c">
                            <button type="button" className="est-remove-btn" onClick={() => removeItem(item.id)} title="Remove">
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={7}>
                          <div style={{ padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(245,158,11,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Package size={20} style={{ color: "#f59e0b" }} />
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>No products in this transfer</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>Click "Add Product" below to add items.</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table bottom */}
              <div className="est-table-bottom">
                <button type="button" className="est-btn est-btn-add" style={{ height: 34, fontSize: 12, padding: "0 14px", borderRadius: 10 }} onClick={addProduct}>
                  <Plus size={12} /> Add Product
                </button>
                {items.length > 0 && (
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    <strong style={{ color: "#92400e" }}>{items.length}</strong> product{items.length !== 1 ? "s" : ""} in transfer
                  </span>
                )}
              </div>

              {/* Summary */}
              {items.length > 0 && (
                <div className="est-summary-bar">
                  <div className="est-summary-chip">
                    <Package size={13} style={{ color: "#94a3b8" }} />
                    <span>Total Items:</span>
                    <span className="est-summary-val">{items.length}</span>
                  </div>
                  <div style={{ width: 1, height: 16, background: "rgba(245,158,11,0.2)" }} />
                  <div className="est-summary-chip">
                    <Truck size={13} style={{ color: "#94a3b8" }} />
                    <span>Total Qty:</span>
                    <span className="est-summary-val">{totalQty}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="est-action-bar">
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {hasChanges
                  ? <span style={{ color: "#92400e", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><AlertCircle size={12} /> Unsaved changes — save to apply.</span>
                  : <span style={{ color: "#94a3b8" }}>All changes saved.</span>
                }
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button type="button" className="est-btn est-btn-ghost" onClick={() => navigate(all_routes.transfers)}>
                  <X size={13} /> Cancel
                </button>
                {hasChanges && (
                  <button type="button" className="est-btn est-btn-discard" onClick={handleDiscard} disabled={submitting}>
                    <RotateCcw size={13} /> Discard
                  </button>
                )}
                <button
                  type="button"
                  className="est-btn est-btn-amber"
                  onClick={handleSaveChanges}
                  disabled={!hasChanges || submitting}
                >
                  <Save size={13} /> Save Changes
                </button>
                <button
                  type="button"
                  className="est-btn est-btn-teal"
                  onClick={handleDispatch}
                  disabled={submitting}
                >
                  <Truck size={13} /> Dispatch Transfer
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default EditStockTransfer;