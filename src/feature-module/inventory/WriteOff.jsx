import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import {
  Search, Package, MapPin, Trash2, X, Activity, ChevronRight,
  AlertCircle, RefreshCw, AlertTriangle, Hash, FileText,
  TrendingDown, ShieldOff, Clock
} from "react-feather";
import { URLS } from "../../Urls";


const WriteOff = () => {
  // ── Product selection ──────────────────────────────────────────────────────
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery]         = useState("");
  const [searchResults, setSearchResults]     = useState([]);
  const [isSearching, setIsSearching]         = useState(false);

  // ── Write-off form ─────────────────────────────────────────────────────────
  const [writeOffQty, setWriteOffQty]     = useState(0);
  const [selectedReason, setSelectedReason] = useState(null);
  const [notes, setNotes]                 = useState("");
  const [batchOptions, setBatchOptions]   = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [reasonOptions, setReasonOptions] = useState([]);
  const [submitting, setSubmitting]       = useState(false);

  // ── History table ──────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows]               = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [writeOffHistory, setWriteOffHistory] = useState([]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getImageUrl = (p) => {
    if (!p) return null;
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    return `${URLS.ImageUrl}${p}`;
  };

  // ── Fetch reason codes ─────────────────────────────────────────────────────
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

  // ── Fetch write-off history ────────────────────────────────────────────────
  const fetchWriteOffHistory = async (query = "") => {
    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        storeId: localStorage.getItem("selectedStoreId")
      }
      const res   = await fetch(`${URLS.GetAllWriteOffsapi}?searchQuery=${encodeURIComponent(query)}`, {
        method: "POST", 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.data) {
        const formatted = data.data.map((item) => ({
          id: item.id,
          date: new Date(item.logCreatedDate).toLocaleDateString(),
          product: item.productName,
          batchId: item.batchId,
          qty: item.quantityRemoved,
          reason: item.reasonName,
          notes: item.notes,
          user: item.createdBy,
        }));
        setWriteOffHistory(formatted);
        setTotalRecords(formatted.length);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchWriteOffHistory(); }, []);

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

  // ── Fetch product details ──────────────────────────────────────────────────
  const getProductDetails = async (id) => {
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
        const details  = {
          id: p.id, name: p.name,
          sku: p.sku || p.barcode || "N/A",
          currentQty: p.quantity || 0,
          warehouse: "Main Store", image: imageUrl,
        };
        setSelectedProduct(details);
        setWriteOffQty(details.currentQty);
        fetchBatchIds(p.id);
      }
    } catch (e) { console.error(e); }
  };

  // ── Fetch batch IDs ────────────────────────────────────────────────────────
  const fetchBatchIds = async (productId) => {
    try {
      const token = localStorage.getItem("authToken");
      const res   = await fetch(URLS.GetBatchIdByProductId, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ productId: Number(productId) }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBatchOptions(data.data.map((item) => ({ value: item.batchId, label: item.batchId })));
      } else {
        setBatchOptions([]);
      }
    } catch (e) {
      console.error(e);
      setBatchOptions([]);
    }
  };

  const handleProductSelect = (product) => {
    setSearchQuery(product.name);
    setSearchResults([]);
    getProductDetails(product.id);
  };

  // ── Save write-off ─────────────────────────────────────────────────────────
  const handleSaveWriteOff = async () => {
    if (!selectedProduct)           return toast.error("Please select a product.");
    if (selectedProduct.currentQty <= 0) return toast.error("This product has no stock to write off.");
    if (!selectedBatch)             return toast.error("Please select a batch.");
    if (!selectedReason)            return toast.error("Please select a reason code.");

    setSubmitting(true);
    try {
      const token   = localStorage.getItem("authToken");
      const payload = {
        productId: selectedProduct.id,
        batchId: selectedBatch.value,
        reasonCode: selectedReason.value,
        notes,
        storeId: localStorage.getItem("selectedStoreId"),

      };
      const res  = await fetch(URLS.CreateWriteOff, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Batch written off successfully!");
        resetForm();
        fetchWriteOffHistory();
      } else {
        toast.error(data.message || "Failed to create write-off.");
      }
    } catch { toast.error("An error occurred while creating write-off."); }
    finally { setSubmitting(false); }
  };

  const resetForm = () => {
    setSelectedProduct(null); setSearchQuery("");
    setSearchResults([]);     setWriteOffQty(0);
    setSelectedReason(null);  setSelectedBatch(null);
    setBatchOptions([]);      setNotes("");
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
              display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.04)")}
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
              background: "rgba(239,68,68,0.1)", color: "#ef4444",
              fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, flexShrink: 0,
            }}>Select</div>
          </div>
        ))}
      </div>
    );
  }, [searchQuery, selectedProduct, searchResults]);

  // ── react-select portal styles ─────────────────────────────────────────────
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
      backgroundColor: state.isSelected ? "#ef4444" : state.isFocused ? "rgba(239,68,68,0.06)" : "transparent",
      color: state.isSelected ? "#fff" : "#1e293b", cursor: "pointer",
    }),
  };

  // ── History table columns ──────────────────────────────────────────────────
  const columns = [
    {
      header: "Date", field: "date", key: "date", sortable: false,
      body: (d) => <span style={{ fontSize: 12, color: "#64748b" }}>{d.date}</span>,
    },
    {
      header: "Product", field: "product", key: "product", sortable: false,
      body: (d) => <span style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{d.product}</span>,
    },
    {
      header: "Batch ID", field: "batchId", key: "batchId", sortable: false,
      body: (d) => (
        <span style={{
          background: "rgba(100,116,139,0.09)", color: "#475569",
          padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          <Hash size={10} /> {d.batchId || "—"}
        </span>
      ),
    },
    {
      header: "Write-off Qty", field: "qty", key: "qty", sortable: false,
      body: (d) => (
        <span style={{
          background: "rgba(239,68,68,0.1)", color: "#ef4444",
          padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
          display: "inline-flex", alignItems: "center", gap: 3,
        }}>
          <TrendingDown size={11} /> -{d.qty}
        </span>
      ),
    },
    {
      header: "Reason", field: "reason", key: "reason", sortable: false,
      body: (d) => <span style={{ fontSize: 12, color: "#64748b" }}>{d.reason || "—"}</span>,
    },
    {
      header: "Notes", field: "notes", key: "notes", sortable: false,
      body: (d) => (
        <span style={{
          fontSize: 12, color: "#94a3b8", fontStyle: d.notes ? "normal" : "italic",
          maxWidth: 200, display: "inline-block",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {d.notes || "—"}
        </span>
      ),
    },
  ];

  const totalWrittenOff = writeOffHistory.reduce((s, h) => s + (Number(h.qty) || 0), 0);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .wo-root {
          /* background: linear-gradient(135deg, #fff5f5 0%, #ffe4e4 50%, #fdf2ff 100%); */
          background: linear-gradient(135deg, #f8faff 0%, #dbe8ff 100%);
          min-height: 100vh; padding: 24px; padding-top: 100px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ── Main glass card ────────────────────────────────────────────── */
        .wo-main-card {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border-radius: 24px; border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          padding: 28px 32px; margin-bottom: 24px;
        }

        /* ── Active write-off panel card ────────────────────────────────── */
        .wo-panel-card {
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 20px; margin-bottom: 24px; overflow: visible;
        }

        /* ── Panel top bar ──────────────────────────────────────────────── */
        .wo-topbar {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(226,232,240,0.6);
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
          border-radius: 20px 20px 0 0;
          background: rgba(255,255,255,0.4);
        }
        .wo-topbar-left { display: flex; align-items: center; gap: 10px; }
        .wo-product-img {
          width: 52px; height: 52px; border-radius: 12px;
          border: 1.5px solid rgba(226,232,240,0.8); background: #f8fafc;
          overflow: hidden; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .wo-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .wo-meta-chip {
          display: flex; align-items: center; gap: 5px; font-size: 12px; color: #64748b;
          background: rgba(241,245,249,0.8); border: 1px solid rgba(226,232,240,0.8);
          border-radius: 20px; padding: 3px 10px; font-weight: 500;
        }
        .wo-danger-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 20px; padding: 3px 12px;
          font-size: 12px; font-weight: 600; color: #dc2626;
        }

        /* ── Panel body ─────────────────────────────────────────────────── */
        .wo-panel-body {
          padding: 20px;
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 20px;
          align-items: start;
        }

        /* ── Stock summary widget (left) ────────────────────────────────── */
        .wo-stock-widget {
          background: rgba(248,250,252,0.6);
          border: 1px solid rgba(226,232,240,0.7);
          border-radius: 16px;
          padding: 20px 16px;
          display: flex; flex-direction: column;
          align-items: center; gap: 14px;
        }
        .wo-stock-label {
          font-size: 10px; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.6px;
        }
        .wo-stock-number {
          font-size: 52px; font-weight: 900; color: #0f172a;
          line-height: 1; letter-spacing: -2px;
        }
        .wo-stock-sub {
          font-size: 11px; color: #94a3b8; font-weight: 500;
        }
        /* Warning badge */
        .wo-warn-badge {
          width: 100%;
          background: rgba(239,68,68,0.07);
          border: 1px dashed rgba(239,68,68,0.25);
          border-radius: 10px; padding: 10px 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .wo-warn-badge-icon {
          width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
          background: rgba(239,68,68,0.1);
          display: flex; align-items: center; justify-content: center;
        }
        .wo-warn-badge-text { font-size: 11px; color: #b91c1c; font-weight: 600; line-height: 1.3; }
        .wo-warn-badge-sub  { font-size: 10px; color: #ef4444; font-weight: 400; }

        /* ── Form section (right) ───────────────────────────────────────── */
        .wo-form-wrap {
          display: flex; flex-direction: column; gap: 14px;
        }
        /* Two equal columns inside form */
        .wo-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .wo-field-block { display: flex; flex-direction: column; gap: 6px; }
        .wo-field-label {
          font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.4px;
        }
        .wo-field-input-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 0 14px;
          display: flex; align-items: center; transition: border-color 0.2s;
        }
        .wo-field-input-wrap:focus-within { border-color: rgba(239,68,68,0.4); }
        .wo-field-input {
          background: transparent; border: none; outline: none;
          font-size: 13px; font-weight: 500; color: #1e293b;
          width: 100%; padding: 10px 0;
        }
        .wo-field-input::placeholder { color: #94a3b8; }
        .wo-field-input.readonly-qty {
          color: #ef4444; font-weight: 700;
        }
        .wo-field-textarea {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 10px 14px;
          font-size: 13px; font-weight: 500; color: #1e293b;
          width: 100%; outline: none; resize: vertical; min-height: 72px;
          font-family: inherit; transition: border-color 0.2s;
        }
        .wo-field-textarea:focus { border-color: rgba(239,68,68,0.4); }
        .wo-field-textarea::placeholder { color: #94a3b8; }

        /* react-select wrapper */
        .wo-select-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 3px 8px 3px 14px; transition: border-color 0.2s;
        }
        .wo-select-wrap:focus-within { border-color: rgba(239,68,68,0.4); }

        /* info note */
        .wo-info-note {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: #94a3b8; padding: 0 2px;
        }

        /* Divider */
        .wo-divider {
          border: none; border-top: 1px solid rgba(226,232,240,0.7); margin: 2px 0;
        }

        /* ── Action buttons ─────────────────────────────────────────────── */
        .wo-btn-row { display: flex; gap: 10px; }
        .wo-btn {
          padding: 11px 20px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 7px; transition: all 0.2s ease; white-space: nowrap;
        }
        .wo-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .wo-btn-cancel {
          background: rgba(241,245,249,0.9);
          border: 1.5px solid rgba(226,232,240,0.9); color: #64748b;
        }
        .wo-btn-cancel:hover { background: rgba(226,232,240,0.8); }
        .wo-btn-confirm {
          flex: 1;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff; box-shadow: 0 4px 14px rgba(220,38,38,0.28);
        }
        .wo-btn-confirm:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(220,38,38,0.38); }
        .wo-btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* ── Search bar ─────────────────────────────────────────────────── */
        .wo-search-wrap {
          position: relative;
          background: rgba(255,255,255,0.6); border: 1.5px solid rgba(255,255,255,0.8);
          border-radius: 50px; display: flex; align-items: center;
          padding: 0 18px; gap: 10px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06); transition: all 0.2s;
        }
        .wo-search-wrap:focus-within {
          border-color: rgba(59,130,246,0.4);
          box-shadow: 0 4px 24px rgba(59,130,246,0.12);
          background: rgba(255,255,255,0.85);
        }
        .wo-search-input {
          flex: 1; background: transparent; border: none; outline: none;
          font-size: 14px; color: #1e293b; padding: 14px 0; font-weight: 500;
        }
        .wo-search-input::placeholder { color: #94a3b8; font-weight: 400; }

        /* ── Stat mini cards ────────────────────────────────────────────── */
        .wo-stat {
          background: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.6);
          border-radius: 14px; padding: 12px 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .wo-stat-icon {
          width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── Table card ─────────────────────────────────────────────────── */
        .wo-table-card {
          background: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.6);
          border-radius: 20px; overflow: hidden;
        }
        .wo-table-header {
          padding: 14px 20px; border-bottom: 1px solid rgba(226,232,240,0.5);
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.4);
        }

        /* ── Misc ───────────────────────────────────────────────────────── */
        .wo-title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; }
        .wo-icon-box {
          width: 32px; height: 32px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .wo-pms-btn {
          padding: 8px 16px; border-radius: 10px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 6px; transition: all 0.2s;
          background: rgba(255,255,255,0.5); border: 1px solid rgba(226,232,240,0.8); color: #475569;
        }
        .wo-pms-btn:hover { background: rgba(255,255,255,0.8); }

        @keyframes wo-slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wo-slide-down { animation: wo-slide-down 0.22s ease; }

        @media (max-width: 1024px) { .wo-panel-body { grid-template-columns: 1fr; } }
        @media (max-width: 640px)  { .wo-form-grid  { grid-template-columns: 1fr; } }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="wo-root">
        <div style={{ maxWidth: "95%", margin: "0 auto" }}>
          <div className="wo-main-card">

            {/* ── Page Header ───────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                {/* Breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, fontSize: 12, color: "#94a3b8" }}>
                  <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>
                    Dashboard
                  </Link>
                  <ChevronRight size={12} />
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>Write-off</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="wo-icon-box" style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                    <ShieldOff size={20} />
                  </div>
                  <div>
                    <h4 className="wo-title">Inventory Write-off</h4>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 0" }}>
                      Remove damaged, expired, or lost inventory from stock.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ display: "flex", gap: 10 }}>
                <div className="wo-stat">
                  <div className="wo-stat-icon" style={{ background: "rgba(239,68,68,0.1)" }}>
                    <Trash2 size={14} style={{ color: "#ef4444" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                      {writeOffHistory.length}
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, fontWeight: 500 }}>Total Write-offs</div>
                  </div>
                </div>
                <div className="wo-stat">
                  <div className="wo-stat-icon" style={{ background: "rgba(234,179,8,0.1)" }}>
                    <TrendingDown size={14} style={{ color: "#b45309" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                      {totalWrittenOff}
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, fontWeight: 500 }}>Units Written Off</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Search Bar ────────────────────────────────────────────────── */}
            <div style={{ maxWidth: 620, margin: "0 auto 28px", position: "relative" }}>
              <div className="wo-search-wrap">
                <Search size={17} style={{ color: "#94a3b8", flexShrink: 0 }} />
                <input
                  className="wo-search-input"
                  type="text"
                  placeholder="Scan barcode or search by product name / SKU to write off..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearching && (
                  <div className="spinner-border spinner-border-sm"
                    style={{ width: 15, height: 15, color: "#ef4444", flexShrink: 0 }} />
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

              {/* Search results dropdown */}
              {searchResultsDropdown}

              {/* No results */}
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

            {/* ── Active Write-off Panel ─────────────────────────────────────── */}
            {selectedProduct && (
              <div className="wo-panel-card wo-slide-down">

                {/* ── Top Bar ─────────────────────────────────────────────── */}
                <div className="wo-topbar">
                  <div className="wo-topbar-left">
                    {/* Thumbnail */}
                    <div className="wo-product-img">
                      {selectedProduct.image
                        ? <img src={selectedProduct.image} alt={selectedProduct.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { e.target.onerror = null; e.target.src = "/assets/img/products/product1.jpg"; }} />
                        : <Package size={20} style={{ color: "#cbd5e1" }} />
                      }
                    </div>

                    {/* Name + chips */}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 5 }}>
                        {selectedProduct.name}
                      </div>
                      <div className="wo-meta">
                        <div className="wo-meta-chip">
                          <span style={{ color: "#94a3b8" }}>SKU</span>
                          <strong style={{ color: "#1e293b" }}>{selectedProduct.sku}</strong>
                        </div>
                        <div className="wo-meta-chip">
                          <MapPin size={10} style={{ color: "#94a3b8" }} />
                          {selectedProduct.warehouse}
                        </div>
                        <div className="wo-danger-pill">
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                          Full Batch Write-off
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badge + Clear */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                      background: "rgba(239,68,68,0.08)", color: "#dc2626",
                      border: "1px solid rgba(239,68,68,0.18)",
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      <Trash2 size={10} /> Write-off Mode
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

                {/* ── Body: Stock widget (left) | Form (right) ──────────────── */}
                <div className="wo-panel-body">

                  {/* Col 1 — Stock Summary Widget ──────────────────────────── */}
                  <div className="wo-stock-widget">
                    <div className="wo-stock-label">Current Stock</div>

                    {/* Big number */}
                    <div style={{ textAlign: "center" }}>
                      <div className="wo-stock-number"
                        style={{ color: selectedProduct.currentQty > 0 ? "#0f172a" : "#ef4444" }}>
                        {selectedProduct.currentQty}
                      </div>
                      <div className="wo-stock-sub">units in stock</div>
                    </div>

                    {/* Write-off warning */}
                    <div className="wo-warn-badge">
                      <div className="wo-warn-badge-icon">
                        <AlertTriangle size={13} style={{ color: "#ef4444" }} />
                      </div>
                      <div>
                        <div className="wo-warn-badge-text">Full batch removed</div>
                        <div className="wo-warn-badge-sub">This action cannot be undone</div>
                      </div>
                    </div>

                    {/* Zero-stock alert */}
                    {selectedProduct.currentQty === 0 && (
                      <div style={{
                        width: "100%", background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10,
                        padding: "8px 12px", fontSize: 11, color: "#b91c1c",
                        fontWeight: 600, textAlign: "center",
                      }}>
                        No stock available to write off
                      </div>
                    )}
                  </div>

                  {/* Col 2 — Form ───────────────────────────────────────────── */}
                  <div className="wo-form-wrap">

                    {/* Batch + Qty row */}
                    <div className="wo-form-grid">
                      {/* Batch ID */}
                      <div className="wo-field-block">
                        <label className="wo-field-label">
                          Batch ID <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <div className="wo-select-wrap">
                          <Select
                            options={batchOptions}
                            value={selectedBatch}
                            onChange={setSelectedBatch}
                            placeholder={batchOptions.length === 0 ? "No batches found…" : "Select batch…"}
                            isDisabled={batchOptions.length === 0}
                            styles={selectStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            isClearable
                          />
                        </div>
                        {batchOptions.length === 0 && (
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, paddingLeft: 2 }}>
                            No batches are linked to this product.
                          </div>
                        )}
                      </div>

                      {/* Quantity (readonly) */}
                      <div className="wo-field-block">
                        <label className="wo-field-label">Quantity to Remove</label>
                        <div className="wo-field-input-wrap" style={{ background: "rgba(248,250,252,0.8)" }}>
                          <TrendingDown size={13} style={{ color: "#ef4444", marginRight: 6, flexShrink: 0 }} />
                          <input
                            type="text"
                            className="wo-field-input readonly-qty"
                            value={`${selectedProduct.currentQty} units (Full Batch)`}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reason Code */}
                    <div className="wo-field-block">
                      <label className="wo-field-label">
                        Reason Code <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div className="wo-select-wrap">
                        <Select
                          options={reasonOptions}
                          value={selectedReason}
                          onChange={setSelectedReason}
                          placeholder="Select reason for write-off…"
                          styles={selectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          isClearable
                          isSearchable
                        />
                      </div>
                    </div>

                    {/* Info note */}
                    <div className="wo-info-note">
                      <AlertCircle size={11} style={{ flexShrink: 0 }} />
                      Writing off this batch will permanently remove all stock units associated with the selected batch ID.
                    </div>

                    {/* Notes / Remarks */}
                    <div className="wo-field-block">
                      <label className="wo-field-label">
                        <FileText size={10} style={{ display: "inline", marginRight: 4 }} />
                        Notes / Remarks (Optional)
                      </label>
                      <textarea
                        className="wo-field-textarea"
                        placeholder="Enter any additional details about this write-off (e.g. expiry date, damage description)..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <hr className="wo-divider" />

                    {/* Action Buttons */}
                    <div className="wo-btn-row">
                      <button type="button" className="wo-btn wo-btn-cancel" onClick={resetForm}>
                        <X size={14} /> Cancel
                      </button>
                      <button
                        type="button"
                        className="wo-btn wo-btn-confirm"
                        onClick={handleSaveWriteOff}
                        disabled={submitting || selectedProduct.currentQty === 0}
                      >
                        <Trash2 size={14} />
                        {submitting ? "Processing…" : "Confirm Write-off"}
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ── Write-off History Table ──────────────────────────────────── */}
            <div className="wo-table-card">
              <div className="wo-table-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="wo-icon-box" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                    <Activity size={14} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                    Write-off History
                  </span>
                  <span style={{
                    background: "rgba(239,68,68,0.1)", color: "#ef4444",
                    fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                  }}>
                    {totalRecords} records
                  </span>
                </div>
                <button type="button" className="wo-pms-btn" onClick={fetchWriteOffHistory}>
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>

              <PrimeDataTable
                column={columns}
                data={writeOffHistory}
                rows={rows}
                setRows={setRows}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalRecords={totalRecords}
              />
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default WriteOff;