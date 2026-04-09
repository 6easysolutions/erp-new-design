import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import {
  Search, Package, MapPin, Save, X, Activity, ChevronRight,
  AlertCircle, Plus, Minus, Edit2, RefreshCw, Archive,
  TrendingUp, TrendingDown, Clock, BarChart2
} from "react-feather";
import { URLS } from "../../Urls";


const StockAdjustment = () => {
  const [selectedProduct, setSelectedProduct]           = useState(null);
  const [searchQuery, setSearchQuery]                   = useState("");
  const [currentStock, setCurrentStock]                 = useState(null);
  const [searchResults, setSearchResults]               = useState([]);
  const [isSearching, setIsSearching]                   = useState(false);

  const [newQuantity, setNewQuantity]                   = useState(0);
  const [adjustmentDifference, setAdjustmentDifference] = useState(0);
  const [selectedReason, setSelectedReason]             = useState(null);
  const [notes, setNotes]                               = useState("");
  const [reasonOptions, setReasonOptions]               = useState([]);
  const [editMode, setEditMode]                         = useState(false);
  const [editAdjustmentId, setEditAdjustmentId]         = useState(null);
  const [submitting, setSubmitting]                     = useState(false);

  // ── Product history (inside the adjustment card) ───────────────────────────
  const [productHistory, setProductHistory]             = useState(null);   // full response
  const [loadingProductHistory, setLoadingProductHistory] = useState(false);

  // ── Global adjustment history table ───────────────────────────────────────
  const [currentPage, setCurrentPage]                   = useState(1);
  const [rows, setRows]                                 = useState(10);
  const [totalRecords, setTotalRecords]                 = useState(0);
  const [adjustmentHistory, setAdjustmentHistory]       = useState([]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getImageUrl = (p) => {
    if (!p) return null;
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    return `${URLS.ImageUrl}${p}`;
  };

  const fmtDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return "—"; }
  };

  const fmtTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  };

  // ── Fetch reasons ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res   = await fetch(URLS.GetStockReason, {
          method: "POST", headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success)
          setReasonOptions(data.data.map((r) => ({ label: r.reasonName, value: r.id })));
      } catch (e) { console.error(e); }
    })();
  }, []);

  // ── Fetch global adjustment history ───────────────────────────────────────
  const fetchHistory = async (page = currentPage) => {
    try {
      const storeId = localStorage.getItem("selectedStoreId");
      if (!storeId) return;
      const token = localStorage.getItem("authToken");
      const res   = await fetch(URLS.GetStockAdjustments, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, page }),
      });
      const data = await res.json();
      if (data.success) {
        const mapped = (data.data || []).map((item) => ({
          id: item.adjustmentId,
          date: new Date(item.createdAt).toLocaleDateString(),
          productId: item.productId,
          productName: item.productName,
          from: item.from,
          to: item.to,
          qty: item.actionType === "ADD" ? `+${item.to - item.from}` : `-${item.from - item.to}`,
          reason: item.reasonName,
          user: `User ${item.changedBy}`,
          actionType: item.actionType,
          notes: item.notes || "",
        }));
        setAdjustmentHistory(mapped);
        setTotalRecords(data.pagination?.totalRecords || 0);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchHistory(currentPage); }, [currentPage]);

  // ── Fetch product-specific history (for the panel) ────────────────────────
  const fetchProductHistory = async (productId) => {
    const storeId = localStorage.getItem("selectedStoreId");
    if (!productId || !storeId) return;
    setLoadingProductHistory(true);
    try {
      const token = localStorage.getItem("authToken");
      const res   = await fetch(URLS.GetProductHistory, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ productId: Number(productId), storeId: Number(storeId) }),
      });
      const data = await res.json();
      if (data.success) setProductHistory(data);
      else setProductHistory(null);
    } catch (e) {
      console.error(e);
      setProductHistory(null);
    } finally {
      setLoadingProductHistory(false);
    }
  };

  // ── Product search (debounced) ─────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim() && !selectedProduct) searchProducts(searchQuery);
      else if (!searchQuery.trim()) setSearchResults([]);
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery, selectedProduct]);

  const searchProducts = async (query) => {
    setIsSearching(true);
    try {
      const token = localStorage.getItem("authToken");
      const res   = await fetch(`${URLS.SearchByStore}?searchQuery=${encodeURIComponent(query)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setSearchResults(data.success ? data.data || [] : []);
    } catch { setSearchResults([]); }
    finally { setIsSearching(false); }
  };

  const getProductDetails = async (id, forceReset = false) => {
    try {
      const token = localStorage.getItem("authToken");
      const res   = await fetch(URLS.GetStoreProductById, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id: String(id) }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const p        = data.data;
        const imageUrl = p.product_images?.length ? getImageUrl(p.product_images[0]) : null;
        setCurrentStock({
          id: p.id, productName: p.name,
          sku: p.sku || p.barcode || "N/A",
          currentQty: p.quantity || 0,
          warehouse: "Main Store", image: imageUrl,
        });
        if (!editMode || forceReset) { setNewQuantity(p.quantity || 0); setAdjustmentDifference(0); }
        // Fetch product-specific history right after product details load
        fetchProductHistory(p.id);
      }
    } catch (e) { console.error(e); }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setSearchResults([]);
    setProductHistory(null);
    getProductDetails(product.id);
  };

  const handleNewQuantityChange = (val) => {
    const v = Math.max(0, parseInt(val) || 0);
    setNewQuantity(v);
    if (currentStock) setAdjustmentDifference(v - currentStock.currentQty);
  };

  const handleDifferenceChange = (val) => {
    const diff = parseInt(val) || 0;
    let targetQty;
    if (typeof val === "string" && (val.startsWith("+") || val.startsWith("-"))) {
      targetQty = Math.max(0, newQuantity + diff);
    } else {
      targetQty = currentStock
        ? Math.max(0, currentStock.currentQty + diff)
        : Math.max(0, newQuantity + diff);
    }
    setNewQuantity(targetQty);
    if (currentStock) setAdjustmentDifference(targetQty - currentStock.currentQty);
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSaveAdjustment = async () => {
    if (!currentStock?.id)                         return toast.error("Please select a product first.");
    if (adjustmentDifference === 0 && !editMode)   return toast.warning("No quantity change detected.");
    if (!selectedReason)                           return toast.error("Please select a reason code.");

    setSubmitting(true);
    const token   = localStorage.getItem("authToken");
    const storeId = Number(localStorage.getItem("selectedStoreId"));
    const payload = {
      productId: currentStock.id, revisedQuantity: newQuantity,
      reasonCode: selectedReason, notes, storeId,
    };

    try {
      let url = URLS.AddStockAdjustment, method = "POST";
      if (editMode && editAdjustmentId) {
        url    = `${URLS.EditStockAdjustment}/${editAdjustmentId}`;
        method = "PUT";
      }
      const res  = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editMode ? "Adjustment updated!" : "Stock adjusted successfully!");
        // Refresh product details in panel (this updates stock and history)
        getProductDetails(currentStock.id, true);
        resetFormFields();
        setCurrentPage(1);
        fetchHistory(1);
      } else {
        toast.error(data.message || "Failed to save adjustment.");
      }
    } catch { toast.error("An error occurred while saving."); }
    finally { setSubmitting(false); }
  };

  // Reset only form fields, keep product selected (to see updated history)
  const resetFormFields = () => {
    setNewQuantity(currentStock?.currentQty || 0);
    setAdjustmentDifference(0);
    setSelectedReason(null);
    setNotes("");
    setEditMode(false);
    setEditAdjustmentId(null);
  };

  const resetForm = () => {
    setSelectedProduct(null); setCurrentStock(null);
    setSearchQuery("");        setNewQuantity(0);
    setAdjustmentDifference(0); setSelectedReason(null);
    setNotes("");              setEditMode(false);
    setEditAdjustmentId(null); setProductHistory(null);
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setEditAdjustmentId(item.id);
    getProductDetails(item.productId);
    setSelectedProduct({ id: item.productId, name: item.productName });
    setSearchQuery(item.productName);
    setNewQuantity(item.to);
    const reasonOption = reasonOptions.find((opt) => opt.label === item.reason);
    setSelectedReason(reasonOption ? reasonOption.value : null);
    setNotes(item.notes || "");
    setAdjustmentDifference(item.to - item.from);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Memoized search dropdown ───────────────────────────────────────────────
  const searchResultsDropdown = useMemo(() => {
    if (!searchQuery || selectedProduct || searchResults.length === 0) return null;
    return (
      <div style={{
        position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
        background: "rgba(255,255,255,0.98)", border: "1px solid rgba(226,232,240,0.8)",
        borderRadius: 14, boxShadow: "0 16px 40px rgba(0,0,0,0.14)",
        zIndex: 1050, maxHeight: 300, overflowY: "auto",
      }}>
        {searchResults.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductSelect(product)}
            style={{
              padding: "10px 14px", cursor: "pointer",
              borderBottom: "1px solid rgba(226,232,240,0.6)",
              display: "flex", alignItems: "center", gap: 12,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 10, overflow: "hidden",
              border: "1px solid rgba(226,232,240,0.8)", background: "#f8fafc",
              flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {product.product_images?.length
                ? <img src={getImageUrl(product.product_images[0])} alt={product.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { e.target.onerror = null; e.target.src = "/assets/img/products/product1.jpg"; }} />
                : <Package size={16} style={{ color: "#cbd5e1" }} />
              }
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {product.name}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "flex", gap: 12 }}>
                <span>Code: <strong>{product.barcode || product.sku || "N/A"}</strong></span>
                {product.quantity !== undefined && (
                  <span>Stock: <strong style={{ color: product.quantity > 0 ? "#10b981" : "#ef4444" }}>
                    {product.quantity}
                  </strong></span>
                )}
              </div>
            </div>
            <div style={{
              background: "rgba(59,130,246,0.1)", color: "#3b82f6",
              fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, flexShrink: 0,
            }}>Select</div>
          </div>
        ))}
      </div>
    );
  }, [searchQuery, selectedProduct, searchResults]);

  // ── react-select styles ────────────────────────────────────────────────────
  const selectStyles = {
    control: (base) => ({
      ...base, minHeight: 36, border: "none",
      background: "transparent", boxShadow: "none", cursor: "pointer",
    }),
    valueContainer: (base) => ({ ...base, padding: "0 2px" }),
    placeholder: (base) => ({ ...base, color: "#94a3b8", fontSize: 13 }),
    singleValue: (base) => ({ ...base, color: "#1e293b", fontSize: 13, fontWeight: 500 }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({ ...base, color: "#94a3b8", padding: "0 4px" }),
    menu: (base) => ({
      ...base, borderRadius: 12,
      boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
      border: "1px solid rgba(226,232,240,0.8)", overflow: "hidden", zIndex: 9999,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    option: (base, state) => ({
      ...base, fontSize: 13, padding: "9px 14px",
      backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "rgba(59,130,246,0.06)" : "transparent",
      color: state.isSelected ? "#fff" : "#1e293b", cursor: "pointer",
    }),
  };

  // ── History table columns ──────────────────────────────────────────────────
  const historyColumns = [
    {
      header: "Date", field: "date", key: "date", sortable: false,
      body: (d) => <span style={{ fontSize: 12, color: "#64748b" }}>{d.date}</span>,
    },
    {
      header: "Product", field: "productName", key: "productName", sortable: false,
      body: (d) => <span style={{ fontWeight: 600, fontSize: 13 }}>{d.productName}</span>,
    },
    {
      header: "From", field: "from", key: "from", sortable: false,
      body: (d) => (
        <span style={{ background: "rgba(100,116,139,0.1)", color: "#475569",
          padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
          {d.from}
        </span>
      ),
    },
    {
      header: "To", field: "to", key: "to", sortable: false,
      body: (d) => (
        <span style={{ background: "rgba(16,185,129,0.1)", color: "#059669",
          padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
          {d.to}
        </span>
      ),
    },
    {
      header: "Change", field: "qty", key: "qty", sortable: false,
      body: (d) => (
        <span style={{
          background: d.actionType === "ADD" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          color: d.actionType === "ADD" ? "#059669" : "#ef4444",
          padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
          display: "inline-flex", alignItems: "center", gap: 3,
        }}>
          {d.actionType === "ADD" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {d.qty}
        </span>
      ),
    },
    {
      header: "Reason", field: "reason", key: "reason", sortable: false,
      body: (d) => <span style={{ fontSize: 12, color: "#64748b" }}>{d.reason || "—"}</span>,
    },
    {
      header: "User", field: "user", key: "user", sortable: false,
      body: (d) => (
        <span style={{ background: "rgba(59,130,246,0.08)", color: "#3b82f6",
          padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
          {d.user || "—"}
        </span>
      ),
    },
    {
      header: "Action", field: "action", key: "action", sortable: false,
      body: (d) => (
        <button
          onClick={() => handleEdit(d)}
          style={{
            background: "rgba(59,130,246,0.1)", color: "#3b82f6",
            border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8,
            width: 30, height: 30, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; e.currentTarget.style.color = "#3b82f6"; }}
        >
          <Edit2 size={13} />
        </button>
      ),
    },
  ];

  const addCount    = adjustmentHistory.filter((h) => h.actionType === "ADD").length;
  const removeCount = adjustmentHistory.filter((h) => h.actionType !== "ADD").length;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .pms-root {
          background: linear-gradient(135deg, #f8faff 0%, #dbe8ff 100%);
          min-height: 100vh; padding: 24px; padding-top: 100px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .pms-main-card {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border-radius: 24px; border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 20px 48px rgba(0,0,0,0.12);
          padding: 28px 32px; margin-bottom: 24px;
        }

        /* ── Adjustment panel card ──────────────────────────────────────── */
        .sa-adj-card {
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 20px; margin-bottom: 24px; overflow: visible;
        }
        .sa-adj-topbar {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(226,232,240,0.6);
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
          border-radius: 20px 20px 0 0;
          background: rgba(255,255,255,0.4);
        }
        .sa-adj-topbar-left  { display: flex; align-items: center; gap: 10px; }
        .sa-adj-product-img  {
          width: 48px; height: 48px; border-radius: 10px;
          border: 1.5px solid rgba(226,232,240,0.8); background: #f8fafc;
          overflow: hidden; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .sa-adj-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .sa-adj-meta-chip {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; color: #64748b;
          background: rgba(241,245,249,0.8); border: 1px solid rgba(226,232,240,0.8);
          border-radius: 20px; padding: 3px 10px; font-weight: 500;
        }
        .sa-stock-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);
          border-radius: 20px; padding: 3px 12px;
          font-size: 12px; font-weight: 600; color: #2563eb;
        }

        /* ── 3-column body grid ─────────────────────────────────────────── */
        .sa-adj-body {
          padding: 20px;
          display: grid;
          grid-template-columns: 200px 1fr 1fr;
          gap: 16px;
          align-items: start;
        }

        /* ── Counter ────────────────────────────────────────────────────── */
        .sa-counter-wrap {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 22px 14px;
          background: rgba(248,250,252,0.6); border: 1px solid rgba(226,232,240,0.7);
          border-radius: 16px; gap: 12px;
        }
        .sa-counter-label {
          font-size: 10px; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.6px;
        }
        .sa-counter-row { display: flex; align-items: center; gap: 10px; }
        .sa-counter-btn {
          width: 38px; height: 38px; border-radius: 50%;
          border: 1.5px solid rgba(226,232,240,0.9); background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06); transition: all 0.18s;
        }
        .sa-counter-btn:hover { transform: scale(1.08); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .sa-counter-btn-minus:hover { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.06); }
        .sa-counter-btn-plus:hover  { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.06); }
        .sa-counter-input {
          background: transparent; border: none; outline: none;
          font-size: 28px; font-weight: 800; color: #0f172a;
          text-align: center; width: 80px; -moz-appearance: textfield;
        }
        .sa-counter-input::-webkit-outer-spin-button,
        .sa-counter-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .sa-diff-row {
          display: flex; align-items: center; gap: 8px; font-size: 12px;
          background: rgba(241,245,249,0.8); border: 1px solid rgba(226,232,240,0.8);
          border-radius: 20px; padding: 4px 12px;
        }
        .sa-diff-badge {
          font-size: 11px; font-weight: 700; padding: 1px 8px; border-radius: 20px;
        }

        /* ── Form section ───────────────────────────────────────────────── */
        .sa-form-wrap { display: flex; flex-direction: column; gap: 14px; }
        .sa-field-block { display: flex; flex-direction: column; gap: 6px; }
        .sa-field-label {
          font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.4px;
        }
        .sa-field-input-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 0 14px;
          display: flex; align-items: center; transition: border-color 0.2s;
        }
        .sa-field-input-wrap:focus-within { border-color: rgba(59,130,246,0.45); }
        .sa-field-input {
          background: transparent; border: none; outline: none;
          font-size: 13px; font-weight: 500; color: #1e293b;
          width: 100%; padding: 10px 0;
        }
        .sa-field-input::placeholder { color: #94a3b8; }
        .sa-select-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 3px 8px 3px 14px; transition: border-color 0.2s;
        }
        .sa-select-wrap:focus-within { border-color: rgba(59,130,246,0.45); }
        .sa-btn-row { display: flex; gap: 10px; padding-top: 2px; }
        .sa-btn {
          flex: 1; padding: 11px 18px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 7px; transition: all 0.2s ease; white-space: nowrap;
        }
        .sa-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .sa-btn-cancel {
          background: rgba(241,245,249,0.9); border: 1.5px solid rgba(226,232,240,0.9); color: #64748b;
        }
        .sa-btn-cancel:hover { background: rgba(226,232,240,0.8); }
        .sa-btn-save {
          flex: 2; background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff; box-shadow: 0 4px 14px rgba(37,99,235,0.28);
        }
        .sa-btn-save:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(37,99,235,0.38); }
        .sa-btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* ── Product History panel ──────────────────────────────────────── */
        .sa-ph-panel {
          background: rgba(248,250,252,0.6);
          border: 1px solid rgba(226,232,240,0.7);
          border-radius: 16px;
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        .sa-ph-header {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(226,232,240,0.6);
          display: flex; align-items: center; justify-content: space-between;
        }
        .sa-ph-header-title {
          display: flex; align-items: center; gap: 7px;
          font-size: 12px; font-weight: 700; color: #475569;
          text-transform: uppercase; letter-spacing: 0.4px;
        }
        /* Summary stats row */
        .sa-ph-stats {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1px; background: rgba(226,232,240,0.6);
          border-bottom: 1px solid rgba(226,232,240,0.6);
        }
        .sa-ph-stat {
          padding: 10px 14px; background: #fff;
          display: flex; align-items: center; gap: 8px;
        }
        .sa-ph-stat:first-child { border-radius: 0; }
        .sa-ph-stat-icon {
          width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .sa-ph-stat-val { font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1; }
        .sa-ph-stat-lbl { font-size: 10px; color: #94a3b8; font-weight: 500; margin-top: 1px; }

        /* Timeline list */
        .sa-ph-timeline {
          flex: 1; overflow-y: auto; padding: 10px 14px;
          max-height: 220px;
        }
        .sa-ph-timeline::-webkit-scrollbar       { width: 4px; }
        .sa-ph-timeline::-webkit-scrollbar-track  { background: transparent; }
        .sa-ph-timeline::-webkit-scrollbar-thumb  {
          background: rgba(148,163,184,0.3); border-radius: 10px;
        }
        .sa-ph-timeline::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.6); }

        /* Individual timeline entry */
        .sa-ph-entry {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 8px 0; border-bottom: 1px solid rgba(226,232,240,0.5);
          position: relative;
        }
        .sa-ph-entry:last-child { border-bottom: none; padding-bottom: 0; }
        .sa-ph-entry-dot {
          width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          margin-top: 1px;
        }
        .sa-ph-entry-body { flex: 1; min-width: 0; }
        .sa-ph-entry-top {
          display: flex; align-items: center; justify-content: space-between; gap: 6px;
        }
        .sa-ph-entry-action {
          font-size: 12px; font-weight: 700;
          display: flex; align-items: center; gap: 4px;
        }
        .sa-ph-entry-change {
          font-size: 11px; font-weight: 700;
          padding: 1px 8px; border-radius: 20px; flex-shrink: 0;
        }
        .sa-ph-entry-bottom {
          display: flex; align-items: center; gap: 8px;
          margin-top: 3px; flex-wrap: wrap;
        }
        .sa-ph-entry-meta {
          font-size: 10px; color: #94a3b8; font-weight: 500;
          display: flex; align-items: center; gap: 3px;
        }
        .sa-ph-entry-reason {
          font-size: 10px; color: #64748b; font-weight: 600;
          background: rgba(241,245,249,0.9); border: 1px solid rgba(226,232,240,0.8);
          border-radius: 10px; padding: 1px 7px;
        }
        /* Qty flow: prev → new */
        .sa-ph-entry-flow {
          display: flex; align-items: center; gap: 4px;
          font-size: 10px; color: #94a3b8;
        }
        .sa-ph-entry-flow strong { color: #475569; font-weight: 700; }

        /* Empty / loading */
        .sa-ph-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 24px 16px; text-align: center; gap: 8px;
        }

        /* ── Search bar ─────────────────────────────────────────────────── */
        .sa-search-wrap {
          position: relative;
          background: rgba(255,255,255,0.6); border: 1.5px solid rgba(255,255,255,0.8);
          border-radius: 50px; display: flex; align-items: center;
          padding: 0 18px; gap: 10px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06); transition: all 0.2s;
        }
        .sa-search-wrap:focus-within {
          border-color: rgba(59,130,246,0.4);
          box-shadow: 0 4px 24px rgba(59,130,246,0.12);
          background: rgba(255,255,255,0.85);
        }
        .sa-search-input {
          flex: 1; background: transparent; border: none; outline: none;
          font-size: 14px; color: #1e293b; padding: 14px 0; font-weight: 500;
        }
        .sa-search-input::placeholder { color: #94a3b8; font-weight: 400; }

        /* ── Stat mini cards ────────────────────────────────────────────── */
        .sa-stat {
          background: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.6);
          border-radius: 14px; padding: 12px 16px;
          display: flex; align-items: center; gap: 10px;
        }

        /* ── History table card ─────────────────────────────────────────── */
        .sa-table-card {
          background: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.6);
          border-radius: 20px; overflow: hidden;
        }
        .sa-table-header {
          padding: 14px 20px; border-bottom: 1px solid rgba(226,232,240,0.5);
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.4);
        }

        /* ── Misc ───────────────────────────────────────────────────────── */
        .pms-title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; }
        .pms-header-icon {
          width: 32px; height: 32px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .pms-btn {
          padding: 8px 16px; border-radius: 10px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 6px; transition: all 0.2s;
          background: rgba(255,255,255,0.5); border: 1px solid rgba(226,232,240,0.8); color: #475569;
        }
        .pms-btn:hover { background: rgba(255,255,255,0.8); }

        @keyframes sa-slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sa-slide-down { animation: sa-slide-down 0.22s ease; }

        @keyframes sa-ph-fade {
          from { opacity: 0; transform: translateX(6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .sa-ph-fade { animation: sa-ph-fade 0.25s ease; }

        /* Responsive: stack columns on smaller screens */
        @media (max-width: 1024px) {
          .sa-adj-body { grid-template-columns: 1fr 1fr; }
          .sa-ph-panel { grid-column: 1 / -1; }
        }
        @media (max-width: 640px) {
          .sa-adj-body { grid-template-columns: 1fr; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="pms-root">
        <div style={{ maxWidth: "95%", margin: "0 auto" }}>
          <div className="pms-main-card">

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, fontSize: 12, color: "#94a3b8" }}>
                  <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>
                    Dashboard
                  </Link>
                  <ChevronRight size={12} />
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>Stock Adjustments</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="pms-header-icon" style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <Archive size={20} />
                  </div>
                  <div>
                    <h4 className="pms-title">Stock Adjustment</h4>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 0" }}>
                      Search a product and adjust its inventory level.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ display: "flex", gap: 10 }}>
                <div className="sa-stat">
                  <div className="pms-header-icon" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                    <TrendingUp size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{addCount}</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, fontWeight: 500 }}>Additions</div>
                  </div>
                </div>
                <div className="sa-stat">
                  <div className="pms-header-icon" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                    <TrendingDown size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{removeCount}</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, fontWeight: 500 }}>Removals</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Search Bar ──────────────────────────────────────────────── */}
            <div style={{ maxWidth: 620, margin: "0 auto 28px", position: "relative" }}>
              <div className="sa-search-wrap">
                <Search size={17} style={{ color: "#94a3b8", flexShrink: 0 }} />
                <input
                  className="sa-search-input"
                  type="text"
                  placeholder="Scan barcode or search by product name / SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearching && (
                  <div className="spinner-border spinner-border-sm"
                    style={{ width: 15, height: 15, color: "#3b82f6", flexShrink: 0 }} />
                )}
                {(selectedProduct || searchQuery) && (
                  <button onClick={resetForm} style={{
                    background: "rgba(239,68,68,0.08)", color: "#ef4444",
                    border: "1px solid rgba(239,68,68,0.15)", borderRadius: "50%",
                    width: 28, height: 28, display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0,
                  }}>
                    <X size={13} />
                  </button>
                )}
              </div>

              {searchResultsDropdown}

              {searchQuery && !selectedProduct && !isSearching && searchResults.length === 0 && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                  background: "rgba(255,255,255,0.98)", border: "1px solid rgba(226,232,240,0.8)",
                  borderRadius: 14, boxShadow: "0 16px 40px rgba(0,0,0,0.1)", zIndex: 1050,
                  padding: "20px 16px", textAlign: "center",
                }}>
                  <AlertCircle size={20} style={{ color: "#94a3b8", marginBottom: 6 }} />
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    No products found for <strong>"{searchQuery}"</strong>
                  </div>
                </div>
              )}
            </div>

            {/* ── Adjustment Panel ────────────────────────────────────────── */}
            {selectedProduct && currentStock && (
              <div className="sa-adj-card sa-slide-down">

                {/* Top bar */}
                <div className="sa-adj-topbar">
                  <div className="sa-adj-topbar-left">
                    <div className="sa-adj-product-img">
                      {currentStock.image
                        ? <img src={currentStock.image} alt={currentStock.productName}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { e.target.onerror = null; e.target.src = "/assets/img/products/product1.jpg"; }} />
                        : <Package size={20} style={{ color: "#cbd5e1" }} />
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 5 }}>
                        {currentStock.productName}
                      </div>
                      <div className="sa-adj-meta">
                        <div className="sa-adj-meta-chip">
                          <span style={{ color: "#94a3b8" }}>SKU</span>
                          <strong style={{ color: "#1e293b" }}>{currentStock.sku}</strong>
                        </div>
                        <div className="sa-adj-meta-chip">
                          <MapPin size={10} style={{ color: "#94a3b8" }} />
                          {currentStock.warehouse}
                        </div>
                        <div className="sa-stock-pill">
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />
                          Current: <strong>{currentStock.currentQty}</strong> units
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                      background: editMode ? "rgba(234,179,8,0.1)" : "rgba(16,185,129,0.1)",
                      color: editMode ? "#b45309" : "#059669",
                      border: `1px solid ${editMode ? "rgba(234,179,8,0.2)" : "rgba(16,185,129,0.2)"}`,
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      {editMode ? <Edit2 size={10} /> : <Package size={10} />}
                      {editMode ? "Edit Mode" : "New Adjustment"}
                    </span>
                    <button type="button" onClick={resetForm} style={{
                      background: "rgba(239,68,68,0.07)", color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.18)", borderRadius: 8,
                      padding: "5px 12px", fontSize: 12, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5, fontWeight: 600,
                    }}>
                      <X size={12} /> Clear
                    </button>
                  </div>
                </div>

                {/* ── 3-column body ──────────────────────────────────────── */}
                <div className="sa-adj-body">

                  {/* Col 1 — Counter ────────────────────────────────────── */}
                  <div className="sa-counter-wrap">
                    <div className="sa-counter-label">New Stock Level</div>
                    <div className="sa-counter-row">
                      <button type="button" className="sa-counter-btn sa-counter-btn-minus"
                        onClick={() => handleDifferenceChange("-1")}>
                        <Minus size={16} style={{ color: "#ef4444" }} />
                      </button>
                      <input type="number" className="sa-counter-input"
                        value={newQuantity} onChange={(e) => handleNewQuantityChange(e.target.value)} />
                      <button type="button" className="sa-counter-btn sa-counter-btn-plus"
                        onClick={() => handleDifferenceChange("+1")}>
                        <Plus size={16} style={{ color: "#10b981" }} />
                      </button>
                    </div>

                    {adjustmentDifference !== 0 ? (
                      <div className="sa-diff-row">
                        <span style={{ color: "#64748b", fontWeight: 600 }}>{currentStock.currentQty}</span>
                        <span style={{ color: "#94a3b8", fontSize: 11 }}>→</span>
                        <span style={{ color: adjustmentDifference > 0 ? "#059669" : "#ef4444", fontWeight: 700 }}>
                          {newQuantity}
                        </span>
                        <span className="sa-diff-badge" style={{
                          background: adjustmentDifference > 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                          color: adjustmentDifference > 0 ? "#059669" : "#ef4444",
                        }}>
                          {adjustmentDifference > 0 ? "+" : ""}{adjustmentDifference}
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>No change yet</div>
                    )}
                  </div>

                  {/* Col 2 — Form ───────────────────────────────────────── */}
                  <div className="sa-form-wrap">
                    <div className="sa-field-block">
                      <label className="sa-field-label">
                        Reason Code <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div className="sa-select-wrap">
                        <Select
                          options={reasonOptions}
                          value={reasonOptions.find((o) => o.value === selectedReason) || null}
                          onChange={(opt) => setSelectedReason(opt ? opt.value : null)}
                          placeholder="Select reason..."
                          styles={selectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          isClearable
                          isSearchable
                        />
                      </div>
                    </div>

                    <div className="sa-field-block">
                      <label className="sa-field-label">Notes (Optional)</label>
                      <div className="sa-field-input-wrap">
                        <input type="text" className="sa-field-input"
                          placeholder="Add remarks or reference..."
                          value={notes} onChange={(e) => setNotes(e.target.value)} />
                      </div>
                    </div>

                    <div className="sa-btn-row">
                      <button type="button" className="sa-btn sa-btn-cancel" onClick={resetForm}>
                        <X size={14} /> Cancel
                      </button>
                      <button type="button" className="sa-btn sa-btn-save"
                        onClick={handleSaveAdjustment} disabled={submitting}>
                        <Save size={14} />
                        {submitting ? "Saving..." : editMode ? "Update Adjustment" : "Save Adjustment"}
                      </button>
                    </div>
                  </div>

                  {/* Col 3 — Product History ────────────────────────────── */}
                  <div className={`sa-ph-panel ${productHistory ? "sa-ph-fade" : ""}`}>

                    {/* Header */}
                    <div className="sa-ph-header">
                      <div className="sa-ph-header-title">
                        <BarChart2 size={13} style={{ color: "#3b82f6" }} />
                        Product History
                      </div>
                      <button
                        type="button"
                        className="pms-btn"
                        style={{ padding: "4px 10px", fontSize: 11 }}
                        onClick={() => fetchProductHistory(currentStock.id)}
                        disabled={loadingProductHistory}
                      >
                        <RefreshCw size={10}
                          style={{ animation: loadingProductHistory ? "spin 1s linear infinite" : "none" }} />
                        Refresh
                      </button>
                    </div>

                    {loadingProductHistory ? (
                      /* Loading skeleton */
                      <div className="sa-ph-empty">
                        <div className="spinner-border spinner-border-sm"
                          style={{ color: "#3b82f6", width: 20, height: 20 }} />
                        <span style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>Loading history…</span>
                      </div>
                    ) : !productHistory ? (
                      /* No data yet */
                      <div className="sa-ph-empty">
                        <Clock size={22} style={{ color: "#cbd5e1" }} />
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>No history available</span>
                      </div>
                    ) : (
                      <>
                        {/* ── Summary stats row ─────────────────────────── */}
                        <div className="sa-ph-stats">
                          <div className="sa-ph-stat">
                            <div className="sa-ph-stat-icon"
                              style={{ background: "rgba(16,185,129,0.1)" }}>
                              <TrendingUp size={13} style={{ color: "#10b981" }} />
                            </div>
                            <div>
                              <div className="sa-ph-stat-val" style={{ color: "#059669" }}>
                                {productHistory.history?.totalStockAdded ?? 0}
                              </div>
                              <div className="sa-ph-stat-lbl">Times Added</div>
                            </div>
                          </div>
                          <div className="sa-ph-stat">
                            <div className="sa-ph-stat-icon"
                              style={{ background: "rgba(239,68,68,0.1)" }}>
                              <TrendingDown size={13} style={{ color: "#ef4444" }} />
                            </div>
                            <div>
                              <div className="sa-ph-stat-val" style={{ color: "#ef4444" }}>
                                {productHistory.history?.totalStockRemoved ?? 0}
                              </div>
                              <div className="sa-ph-stat-lbl">Times Removed</div>
                            </div>
                          </div>
                        </div>

                        {/* ── Recent entries timeline ───────────────────── */}
                        <div className="sa-ph-timeline">
                          {(!productHistory.recentHistory || productHistory.recentHistory.length === 0) ? (
                            <div className="sa-ph-empty" style={{ padding: "16px 0" }}>
                              <Clock size={18} style={{ color: "#cbd5e1" }} />
                              <span style={{ fontSize: 12, color: "#94a3b8" }}>No recent activity</span>
                            </div>
                          ) : (
                            productHistory.recentHistory.map((entry) => {
                              const isAdd    = entry.actionType === "ADD";
                              const diffQty  = isAdd
                                ? entry.revisedQuantity - entry.previousQuantity
                                : entry.previousQuantity - entry.revisedQuantity;
                              return (
                                <div key={entry.id} className="sa-ph-entry">
                                  {/* Dot icon */}
                                  <div className="sa-ph-entry-dot" style={{
                                    background: isAdd ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                                  }}>
                                    {isAdd
                                      ? <TrendingUp size={13} style={{ color: "#10b981" }} />
                                      : <TrendingDown size={13} style={{ color: "#ef4444" }} />
                                    }
                                  </div>

                                  {/* Content */}
                                  <div className="sa-ph-entry-body">
                                    <div className="sa-ph-entry-top">
                                      <span className="sa-ph-entry-action" style={{ color: isAdd ? "#059669" : "#ef4444" }}>
                                        {isAdd ? "Stock Added" : "Stock Removed"}
                                      </span>
                                      <span className="sa-ph-entry-change" style={{
                                        background: isAdd ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                                        color: isAdd ? "#059669" : "#ef4444",
                                      }}>
                                        {isAdd ? "+" : "-"}{diffQty}
                                      </span>
                                    </div>

                                    <div className="sa-ph-entry-bottom">
                                      {/* Qty flow */}
                                      <div className="sa-ph-entry-flow">
                                        <strong>{entry.previousQuantity}</strong>
                                        <span>→</span>
                                        <strong style={{ color: isAdd ? "#059669" : "#ef4444" }}>
                                          {entry.revisedQuantity}
                                        </strong>
                                      </div>

                                      {/* Reason chip */}
                                      {entry.reasonName && (
                                        <span className="sa-ph-entry-reason">{entry.reasonName}</span>
                                      )}

                                      {/* Date + time */}
                                      <div className="sa-ph-entry-meta">
                                        <Clock size={9} />
                                        {fmtDate(entry.createdAt)}, {fmtTime(entry.createdAt)}
                                      </div>
                                    </div>

                                    {/* Notes if present */}
                                    {entry.notes && (
                                      <div style={{
                                        marginTop: 4, fontSize: 10, color: "#94a3b8",
                                        fontStyle: "italic", whiteSpace: "nowrap",
                                        overflow: "hidden", textOverflow: "ellipsis",
                                      }}>
                                        "{entry.notes}"
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {/* End Col 3 */}

                </div>
                {/* End sa-adj-body */}
              </div>
            )}

            {/* ── Global History Table ─────────────────────────────────────── */}
            <div className="sa-table-card">
              <div className="sa-table-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="pms-header-icon" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <Activity size={14} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                    Adjustment History
                  </span>
                  <span style={{
                    background: "rgba(59,130,246,0.1)", color: "#3b82f6",
                    fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                  }}>
                    {totalRecords} records
                  </span>
                </div>
                <button type="button" className="pms-btn"
                  onClick={() => { setCurrentPage(1); fetchHistory(1); }}>
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>

              <PrimeDataTable
                column={historyColumns}
                data={adjustmentHistory}
                rows={rows}
                setRows={setRows}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalRecords={totalRecords}
              />
            </div>

          </div>

          <CommonFooter />
        </div>
      </div>
    </>
  );
};

export default StockAdjustment;