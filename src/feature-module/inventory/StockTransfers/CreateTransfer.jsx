import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ArrowLeft, X, Plus, Save, Truck, Trash2,
  Package, Search, CheckSquare, Square, ShoppingCart,
  ChevronRight, Hash, Calendar,  User,
  FileText, AlertTriangle, Check,
} from "react-feather";

import { useNavigate, Link } from "react-router-dom";
import { all_routes } from "../../../routes/all_routes";
import { URLS } from "../../../Urls";

// ─────────────────────────────────────────
// Helper: Debounce
// ─────────────────────────────────────────
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ─────────────────────────────────────────
// Load Items Modal (dynamic) – FIXED
// ─────────────────────────────────────────
const LoadItemsModal = ({ onClose, onAddItems, alreadyAddedIds = [], sourceStore }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const debouncedSearch = useDebounce(search, 500);

  // Fetch products when search or sourceStore changes
  useEffect(() => {
    if (!sourceStore?.id) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('authToken');
        const url = `${URLS.SearchByStore}?searchQuery=${encodeURIComponent(debouncedSearch)}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ storeId: sourceStore.id }), // ✅ FIXED: use sourceStore.id
        });
        const result = await response.json();
        if (result.success) {
          setProducts(result.data);
        } else {
          setError(result.message || 'Failed to load products');
        }
      } catch (err) {
        console.error('Product fetch error:', err);
        setError('Error loading products. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearch, sourceStore]);

  const isSelected = (id) => selected.some((p) => p.id === id);
  const allVisibleSelected = products.length > 0 && products.every((p) => isSelected(p.id));

  const toggleItem = (product) => {
    setSelected((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelected((prev) => prev.filter((p) => !products.some((f) => f.id === p.id)));
    } else {
      const toAdd = products.filter((p) => !isSelected(p.id));
      setSelected((prev) => [...prev, ...toAdd]);
    }
  };

  const handleAdd = () => {
    if (selected.length === 0) return;
    // Map selected products to the format expected by parent
    const selectedWithStoreQty = selected.map(p => {
      const storeData = p.stores?.find(s => s.storeId === sourceStore.id);
      const availableQty = storeData ? parseInt(storeData.quantity, 10) : 0;
      return {
        id: p.id,
        productId: p.id,
        product: p.name,
        sku: p.barcode || `PROD-${p.id}`,
        availableQty,
        transferQty: 0,
        unit: p.uomConversions?.[0]?.unitName || "pcs",
        remarks: "",
      };
    });
    onAddItems(selectedWithStoreQty);
    onClose();
  };

  const getStockMeta = (qty) => {
    if (qty === 0)  return { label: "Out of Stock", color: "#dc2626", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"  };
    if (qty < 30)   return { label: "Low Stock",    color: "#b45309", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)" };
    return              { label: "In Stock",      color: "#059669", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)" };
  };

  return (
    <>
      <style>{`
        @keyframes lim-fade  { from { opacity: 0; }                                    to { opacity: 1; } }
        @keyframes lim-slide { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .lim-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15,23,42,0.42);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
          animation: lim-fade 0.18s ease;
        }
        .lim-modal {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 22px;
          box-shadow: 0 28px 64px rgba(15,23,42,0.18);
          width: 100%; max-width: 680px; max-height: 88vh;
          display: flex; flex-direction: column;
          animation: lim-slide 0.22s cubic-bezier(.34,1.56,.64,1);
          overflow: hidden;
        }
        .lim-header {
          padding: 18px 22px; border-bottom: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          background: rgba(248,250,252,0.6);
        }
        .lim-header-left { display: flex; align-items: center; gap: 10px; }
        .lim-icon-box {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(59,130,246,0.1); color: #3b82f6;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .lim-search-wrap {
          padding: 14px 22px; border-bottom: 1px solid rgba(226,232,240,0.55);
          background: rgba(255,255,255,0.5);
        }
        .lim-search-inner {
          display: flex; align-items: center; gap: 8px;
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 0 14px; height: 40px;
          transition: border-color 0.2s;
        }
        .lim-search-inner:focus-within { border-color: rgba(59,130,246,0.4); }
        .lim-search-inner input {
          border: none; outline: none; background: transparent;
          font-size: 13px; color: #1e293b; flex: 1; font-family: inherit;
        }
        .lim-search-inner input::placeholder { color: #94a3b8; }
        .lim-list { flex: 1; overflow-y: auto; padding: 6px 0; }
        .lim-row {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 22px; cursor: pointer; transition: background 0.13s;
          border-bottom: 1px solid rgba(226,232,240,0.35);
        }
        .lim-row:last-child { border-bottom: none; }
        .lim-row:hover:not(.lim-row-disabled) { background: rgba(59,130,246,0.03); }
        .lim-row.lim-row-selected { background: rgba(59,130,246,0.05); }
        .lim-row.lim-row-disabled { opacity: 0.4; cursor: not-allowed; }
        .lim-check-box {
          width: 18px; height: 18px; border-radius: 5px;
          border: 1.5px solid rgba(203,213,225,0.9); background: #fff;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s;
        }
        .lim-check-box.active { background: #3b82f6; border-color: #3b82f6; }
        .lim-thumb {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: rgba(59,130,246,0.07); border: 1px solid rgba(59,130,246,0.12);
          display: flex; align-items: center; justify-content: center;
        }
        .lim-info { flex: 1; min-width: 0; }
        .lim-name { font-size: 13px; font-weight: 600; color: #0f172a; }
        .lim-sku  { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        .lim-footer {
          padding: 13px 22px; border-top: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          background: rgba(248,250,252,0.5);
        }
        .lim-no-results {
          padding: 48px 20px; display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
      `}</style>

      <div className="lim-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="lim-modal">

          {/* Header */}
          <div className="lim-header">
            <div className="lim-header-left">
              <div className="lim-icon-box">
                <ShoppingCart size={16} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Load Items</div>
                <div style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                  {sourceStore ? `Source: ${sourceStore.storeName}` : 'Select a source warehouse first'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 9, border: "1.5px solid rgba(226,232,240,0.9)",
                background: "rgba(255,255,255,0.6)", color: "#64748b", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Search */}
          <div className="lim-search-wrap">
            <div className="lim-search-inner">
              <Search size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
              <input
                placeholder="Search by product name or SKU…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                disabled={!sourceStore}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#94a3b8", display: "flex" }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Product list */}
          <div className="lim-list">
            {loading && (
              <div className="lim-no-results">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(148,163,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={22} style={{ color: "#cbd5e1" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Loading products...</div>
              </div>
            )}
            {!loading && error && (
              <div className="lim-no-results">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={22} style={{ color: "#dc2626" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>{error}</div>
              </div>
            )}
            {!loading && !error && products.length === 0 && (
              <div className="lim-no-results">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(148,163,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={22} style={{ color: "#cbd5e1" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>
                  {search ? 'No products match your search' : 'No products available'}
                </div>
              </div>
            )}
            {!loading && !error && products.map((product) => {
              const storeData = product.stores?.find(s => s.storeId === sourceStore?.id);
              const availableQty = storeData ? parseInt(storeData.quantity, 10) : 0;
              const sel = isSelected(product.id);
              const alreadyIn = alreadyAddedIds.includes(product.id);
              const stock = getStockMeta(availableQty);
              return (
                <div
                  key={product.id}
                  className={`lim-row${sel ? " lim-row-selected" : ""}${alreadyIn ? " lim-row-disabled" : ""}`}
                  onClick={() => !alreadyIn && toggleItem(product)}
                  title={alreadyIn ? "Already added" : ""}
                >
                  <div className={`lim-check-box${sel ? " active" : ""}`}>
                    {sel && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="lim-thumb">
                    <Package size={14} style={{ color: "#3b82f6" }} />
                  </div>
                  <div className="lim-info">
                    <div className="lim-name">{product.name}</div>
                    <div className="lim-sku">
                      <span style={{ background: "rgba(100,116,139,0.08)", padding: "1px 7px", borderRadius: 10, fontSize: 10, fontWeight: 600, color: "#64748b" }}>
                        {product.barcode || `PROD-${product.id}`}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      {availableQty} <span style={{ fontSize: 10, fontWeight: 500, color: "#94a3b8" }}>
                        {product.uomConversions?.[0]?.unitName || "pcs"}
                      </span>
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                      background: stock.bg, color: stock.color, border: `1px solid ${stock.border}`,
                    }}>
                      {stock.label}
                    </span>
                  </div>
                  {alreadyIn && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.08)", padding: "3px 8px", borderRadius: 20, border: "1px solid rgba(16,185,129,0.2)", flexShrink: 0 }}>
                      <Check size={9} style={{ marginRight: 3 }} /> Added
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="lim-footer">
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
              {selected.length > 0
                ? <span><strong style={{ color: "#3b82f6" }}>{selected.length}</strong> product{selected.length > 1 ? "s" : ""} selected</span>
                : <span style={{ color: "#94a3b8" }}>No products selected</span>
              }
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {products.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  style={{
                    height: 34, padding: "0 12px", borderRadius: 10,
                    border: "1.5px solid rgba(226,232,240,0.9)", background: "rgba(255,255,255,0.6)",
                    fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "inherit",
                  }}
                >
                  {allVisibleSelected ? <><X size={11} /> Deselect All</> : <><CheckSquare size={11} /> Select All</>}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                style={{
                  height: 34, padding: "0 14px", borderRadius: 10,
                  border: "1.5px solid rgba(226,232,240,0.9)", background: "rgba(255,255,255,0.6)",
                  fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={selected.length === 0}
                style={{
                  height: 34, padding: "0 16px", borderRadius: 10, border: "none",
                  background: selected.length === 0 ? "rgba(59,130,246,0.3)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "#fff", fontSize: 12, fontWeight: 700, cursor: selected.length === 0 ? "not-allowed" : "pointer",
                  display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit",
                  boxShadow: selected.length > 0 ? "0 4px 12px rgba(37,99,235,0.25)" : "none",
                  transition: "all 0.2s",
                }}
              >
                <Plus size={13} />
                Add {selected.length > 0 ? `${selected.length} Item${selected.length > 1 ? "s" : ""}` : "Items"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
const CreateStockTransfer = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [storesError, setStoresError] = useState('');
  const [submitting, setSubmitting] = useState(false); // for dispatch button

  const [formData, setFormData] = useState({
    transferId:           "TRF-1035",
    transferDate:         new Date().toISOString().split('T')[0], // today's date
    sourceWarehouse:      "",
    destinationWarehouse: "",
    requestedBy:          "John Smith",
    notes:                "Urgent transfer to restock store.",
  });

  const [items, setItems] = useState([]);
  const [showLoadModal, setShowLoadModal] = useState(false);

  // Fetch stores on mount
  useEffect(() => {
    const fetchStores = async () => {
      setLoadingStores(true);
      setStoresError('');
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(URLS.GetAllStore, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        if (result.success) {
          setStores(result.data);
          if (result.data.length >= 2 && !formData.sourceWarehouse && !formData.destinationWarehouse) {
            setFormData(prev => ({
              ...prev,
              sourceWarehouse: result.data[0].storeName,
              destinationWarehouse: result.data[1].storeName,
            }));
          } else if (result.data.length === 1 && !formData.sourceWarehouse) {
            setFormData(prev => ({
              ...prev,
              sourceWarehouse: result.data[0].storeName,
            }));
          }
        } else {
          setStoresError(result.message || 'Failed to load stores');
        }
      } catch (err) {
        console.error('Store fetch error:', err);
        setStoresError('Error loading stores. Please check your connection.');
      } finally {
        setLoadingStores(false);
      }
    };
    fetchStores();
  }, []); // eslint-disable-line

  // Get selected source and destination store objects
  const selectedSourceStore = useMemo(() => {
    return stores.find(s => s.storeName === formData.sourceWarehouse);
  }, [stores, formData.sourceWarehouse]);

  const selectedDestStore = useMemo(() => {
    return stores.find(s => s.storeName === formData.destinationWarehouse);
  }, [stores, formData.destinationWarehouse]);

  const handleFormChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleItemChange = (id, field, value) => setItems((p) => p.map((item) => item.id === id ? { ...item, [field]: value } : item));
  const removeItem = (id) => setItems((p) => p.filter((item) => item.id !== id));

  const handleAddItems = (selectedProducts) => {
    const newRows = selectedProducts.map((p) => ({
      id: `${p.productId}-${Date.now()}`,
      productId: p.productId,
      product: p.product,
      sku: p.sku,
      availableQty: p.availableQty,
      transferQty: 0,
      unit: p.unit,
      remarks: p.remarks || "",
    }));
    setItems((p) => [...p, ...newRows]);
  };

  const alreadyAddedIds = items.map((i) => i.productId);
  const totalQty = items.reduce((s, i) => s + Number(i.transferQty || 0), 0);

  // Dispatch transfer
  const handleDispatchTransfer = async () => {
    // Validate source and destination are selected
    if (!selectedSourceStore || !selectedDestStore) {
      alert("Please select both source and destination warehouses.");
      return;
    }

    // Validate items: at least one item with transferQty > 0
    const validItems = items.filter(item => Number(item.transferQty) > 0);
    if (validItems.length === 0) {
      alert("Please add at least one product with a transfer quantity > 0.");
      return;
    }

    // Build payload
    const payload = {
      sourceWarehouse: selectedSourceStore.id,
      destinationWarehouse: selectedDestStore.id,
      transferDate: formData.transferDate,
      notes: formData.notes,
      items: validItems.map(item => ({
        productId: item.productId,
        transferQty: Number(item.transferQty),
        remarks: item.remarks || undefined,
      })),
    };

    setSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(URLS.CreateStockTransfer, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.success) {
        alert("Transfer created successfully!");
        if (onSuccess) onSuccess();
        navigate(all_routes.transfers);
      } else {
        // Show detailed error from API
        const errorMsg = result.message || "Failed to create transfer.";
        alert(errorMsg);
      }
    } catch (err) {
      console.error("Dispatch error:", err);
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .cst-root {
          background: linear-gradient(135deg, #f8faff 0%, #dbe8ff 100%);
          min-height: 100vh; padding: 24px; padding-top: 100px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .cst-main-card {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border-radius: 24px; border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          padding: 28px 32px; margin-bottom: 24px;
        }

        .cst-card {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px; margin-bottom: 18px; overflow: visible;
        }
        .cst-card-header {
          padding: 13px 20px;
          border-bottom: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; flex-wrap: wrap;
          background: rgba(255,255,255,0.4);
          border-radius: 18px 18px 0 0;
        }
        .cst-card-header-left { display: flex; align-items: center; gap: 9px; }
        .cst-card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }
        .cst-card-body { padding: 20px; }

        .cst-icon-box {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .cst-field-label {
          font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.4px;
          display: block; margin-bottom: 6px;
        }
        .cst-input-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 0 14px; height: 38px;
          display: flex; align-items: center; gap: 8px; transition: border-color 0.2s;
        }
        .cst-input-wrap:focus-within { border-color: rgba(59,130,246,0.45); }
        .cst-input-wrap.readonly { background: rgba(248,250,252,0.8); }
        .cst-input {
          background: transparent; border: none; outline: none;
          font-size: 13px; color: #1e293b; font-weight: 500;
          flex: 1; min-width: 0; font-family: inherit; width: 100%;
        }
        .cst-input::placeholder { color: #94a3b8; font-weight: 400; }
        .cst-input[type="date"] { cursor: pointer; }
        .cst-select-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 3px 8px 3px 14px; transition: border-color 0.2s;
        }
        .cst-select-wrap:focus-within { border-color: rgba(59,130,246,0.45); }
        .cst-select {
          background: transparent; border: none; outline: none;
          font-size: 13px; color: #1e293b; font-weight: 500;
          width: 100%; cursor: pointer; font-family: inherit;
          appearance: none; -webkit-appearance: none; height: 34px;
        }
        .cst-textarea-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 10px 14px; transition: border-color 0.2s;
        }
        .cst-textarea-wrap:focus-within { border-color: rgba(59,130,246,0.45); }
        .cst-textarea {
          background: transparent; border: none; outline: none;
          font-size: 13px; color: #1e293b; font-family: inherit;
          width: 100%; resize: vertical; min-height: 60px; font-weight: 500;
        }
        .cst-textarea::placeholder { color: #94a3b8; font-weight: 400; }

        .cst-form-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        @media (max-width: 900px) { .cst-form-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 600px) { .cst-form-grid { grid-template-columns: 1fr; } }

        .cst-th {
          padding: 11px 14px;
          font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.5px;
          background: rgba(248,250,252,0.7);
          border-bottom: 1px solid rgba(226,232,240,0.6);
          white-space: nowrap; text-align: left;
        }
        .cst-th-c { text-align: center; }
        .cst-td {
          padding: 11px 14px; font-size: 13px; color: #1e293b;
          border-bottom: 1px solid rgba(226,232,240,0.4);
          vertical-align: middle; white-space: nowrap;
        }
        .cst-td-c { text-align: center; }
        .cst-tr { transition: background 0.13s; }
        .cst-tr:hover td { background: rgba(59,130,246,0.02); }
        .cst-tr:last-child td { border-bottom: none; }

        .cst-thumb {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.12);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .cst-sku-badge {
          background: rgba(100,116,139,0.08); color: #475569;
          padding: 1px 8px; border-radius: 20px; font-size: 10px; font-weight: 600;
        }

        .cst-qty-input {
          width: 80px; height: 32px;
          border: 1.5px solid rgba(226,232,240,0.9); border-radius: 8px;
          padding: 0 8px; text-align: right; font-size: 13px; font-weight: 700;
          outline: none; background: #fff; font-family: inherit; color: #1e293b;
          transition: border-color 0.2s;
        }
        .cst-qty-input:focus { border-color: rgba(59,130,246,0.45); box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }

        .cst-remarks-input {
          height: 32px; border: 1.5px solid rgba(226,232,240,0.9); border-radius: 8px;
          padding: 0 12px; font-size: 12px; color: #1e293b; outline: none;
          background: #fff; font-family: inherit; width: 100%; min-width: 120px;
          transition: border-color 0.2s;
        }
        .cst-remarks-input:focus { border-color: rgba(59,130,246,0.45); }
        .cst-remarks-input::placeholder { color: #94a3b8; }

        .cst-remove-btn {
          width: 28px; height: 28px; border-radius: 8px;
          border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.06);
          color: #dc2626; cursor: pointer; display: flex; align-items: center;
          justify-content: center; transition: all 0.15s; flex-shrink: 0;
          margin: 0 auto;
        }
        .cst-remove-btn:hover { background: rgba(239,68,68,0.14); transform: translateY(-1px); }

        .cst-table-bottom {
          padding: 12px 20px; border-top: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; gap: 12px;
          background: rgba(248,250,252,0.4);
        }

        .cst-summary-bar {
          padding: 12px 20px;
          border-top: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; gap: 20px; justify-content: flex-end;
          background: rgba(248,250,252,0.5);
        }
        .cst-summary-chip {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #475569;
        }
        .cst-summary-val { font-weight: 800; font-size: 15px; color: #0f172a; }

        .cst-btn {
          height: 38px; padding: 0 18px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px;
          transition: all 0.2s; white-space: nowrap; font-family: inherit;
        }
        .cst-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .cst-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .cst-btn-ghost {
          background: rgba(255,255,255,0.5);
          border: 1.5px solid rgba(226,232,240,0.9); color: #475569;
        }
        .cst-btn-ghost:hover { background: rgba(255,255,255,0.85); }

        .cst-btn-blue {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff; box-shadow: 0 4px 14px rgba(37,99,235,0.22);
        }
        .cst-btn-blue:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(37,99,235,0.32); }

        .cst-btn-teal {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; box-shadow: 0 4px 14px rgba(5,150,105,0.22);
        }
        .cst-btn-teal:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(5,150,105,0.32); }

        .cst-btn-draft {
          background: rgba(245,158,11,0.1);
          border: 1.5px solid rgba(245,158,11,0.3); color: #92400e;
        }
        .cst-btn-draft:hover { background: rgba(245,158,11,0.18); }

        .cst-btn-load {
          background: rgba(59,130,246,0.1);
          border: 1.5px solid rgba(59,130,246,0.25); color: #2563eb;
        }
        .cst-btn-load:hover { background: rgba(59,130,246,0.18); }

        .cst-action-bar {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 16px; padding: 14px 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px; flex-wrap: wrap;
        }

        .cst-title { font-size: 23px; font-weight: 700; color: #0f172a; margin: 0; }
        .cst-code-chip {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2);
          border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #2563eb;
        }

        .cst-empty {
          padding: 52px 20px; display: flex; flex-direction: column;
          align-items: center; gap: 12px; text-align: center;
        }

        @media (max-width: 768px) {
          .cst-root { padding: 16px; padding-top: 80px; }
          .cst-main-card { padding: 18px; }
          .cst-card-body { padding: 14px; }
        }
      `}</style>

      {/* Modal */}
      {showLoadModal && (
        <LoadItemsModal
          onClose={() => setShowLoadModal(false)}
          onAddItems={handleAddItems}
          alreadyAddedIds={alreadyAddedIds}
          sourceStore={selectedSourceStore}
        />
      )}

      <div className="cst-root">
        <div style={{ maxWidth: "95%", margin: "0 auto" }}>
          <div className="cst-main-card">

            {/* Page Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, fontSize: 12, color: "#94a3b8" }}>
                  <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>Dashboard</Link>
                  <ChevronRight size={12} />
                  <Link to={all_routes.transfers} style={{ color: "#94a3b8", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                    onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}>Stock Transfers</Link>
                  <ChevronRight size={12} />
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>Create Transfer</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(59,130,246,0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Truck size={20} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <h4 className="cst-title">Create Stock Transfer</h4>
                      <div className="cst-code-chip">
                        <Hash size={11} /> {formData.transferId}
                      </div>
                    </div>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 0" }}>
                      Define the transfer route, select products and dispatch.
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

            {/* Transfer Information */}
            <div className="cst-card">
              <div className="cst-card-header">
                <div className="cst-card-header-left">
                  <div className="cst-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <Truck size={13} />
                  </div>
                  <h2 className="cst-card-title">Transfer Information</h2>
                </div>
              </div>
              <div className="cst-card-body">
                <div className="cst-form-grid">
                  {/* Transfer ID */}
                  <div>
                    <label className="cst-field-label"><Hash size={10} style={{ marginRight: 3 }} /> Transfer ID</label>
                    <div className="cst-input-wrap readonly">
                      <Hash size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <input className="cst-input" value={formData.transferId} readOnly style={{ color: "#2563eb", fontWeight: 700 }} />
                      <span style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic", flexShrink: 0 }}>Auto</span>
                    </div>
                  </div>
                  {/* Transfer Date */}
                  <div>
                    <label className="cst-field-label"><Calendar size={10} style={{ marginRight: 3 }} /> Transfer Date</label>
                    <div className="cst-input-wrap">
                      <Calendar size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <input type="date" className="cst-input" name="transferDate" value={formData.transferDate} onChange={handleFormChange} />
                    </div>
                  </div>
                  {/* Requested By */}
                  <div>
                    <label className="cst-field-label"><User size={10} style={{ marginRight: 3 }} /> Requested By</label>
                    <div className="cst-input-wrap">
                      <User size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <input type="text" className="cst-input" name="requestedBy" value={formData.requestedBy} onChange={handleFormChange} placeholder="Enter name…" />
                    </div>
                  </div>
                  {/* Source Warehouse */}
                  <div>
                    <label className="cst-field-label">Source Warehouse</label>
                    <div className="cst-select-wrap" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Square size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      {loadingStores ? (
                        <div style={{ padding: "8px 0", fontSize: 12, color: "#64748b" }}>Loading stores...</div>
                      ) : storesError ? (
                        <div style={{ color: "#dc2626", fontSize: 12 }}>{storesError}</div>
                      ) : (
                        <select className="cst-select" name="sourceWarehouse" value={formData.sourceWarehouse} onChange={handleFormChange}>
                          <option value="">Select source warehouse</option>
                          {stores.map(store => (
                            <option key={store.id} value={store.storeName}>{store.storeName}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  {/* Destination Warehouse */}
                  <div>
                    <label className="cst-field-label">Destination Warehouse</label>
                    <div className="cst-select-wrap" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Square size={12} style={{ color: "#10b981", flexShrink: 0 }} />
                      {loadingStores ? (
                        <div style={{ padding: "8px 0", fontSize: 12, color: "#64748b" }}>Loading stores...</div>
                      ) : storesError ? (
                        <div style={{ color: "#dc2626", fontSize: 12 }}>{storesError}</div>
                      ) : (
                        <select className="cst-select" name="destinationWarehouse" value={formData.destinationWarehouse} onChange={handleFormChange}>
                          <option value="">Select destination warehouse</option>
                          {stores.map(store => (
                            <option key={store.id} value={store.storeName}>{store.storeName}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  {/* Route preview */}
                  <div>
                    <label className="cst-field-label">Route Preview</label>
                    <div style={{
                      background: "rgba(248,250,252,0.8)", border: "1.5px solid rgba(226,232,240,0.9)",
                      borderRadius: 12, padding: "6px 14px", height: 38,
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      {formData.sourceWarehouse ? (
                        <>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
                            {formData.sourceWarehouse}
                          </span>
                          <ChevronRight size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                            {formData.destinationWarehouse || "Not selected"}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>Select source and destination warehouses</span>
                      )}
                    </div>
                  </div>
                  {/* Notes */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="cst-field-label"><FileText size={10} style={{ marginRight: 3 }} /> Notes</label>
                    <div className="cst-textarea-wrap">
                      <textarea className="cst-textarea" name="notes" value={formData.notes} onChange={handleFormChange} placeholder="Add any transfer notes or instructions…" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Card */}
            <div className="cst-card">
              <div className="cst-card-header">
                <div className="cst-card-header-left">
                  <div className="cst-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <Package size={13} />
                  </div>
                  <h2 className="cst-card-title">Products to Transfer</h2>
                  {items.length > 0 && (
                    <span style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="cst-btn cst-btn-load"
                  onClick={() => setShowLoadModal(true)}
                  disabled={!selectedSourceStore}
                  title={!selectedSourceStore ? "Please select a source warehouse first" : ""}
                >
                  <ShoppingCart size={13} /> Load Items
                </button>
              </div>

              {/* Empty state */}
              {items.length === 0 && (
                <div className="cst-empty">
                  <div style={{ width: 52, height: 52, borderRadius: 15, background: "rgba(59,130,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Package size={22} style={{ color: "#3b82f6" }} />
                  </div>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>No items added yet</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", maxWidth: 300 }}>
                    Click <strong style={{ color: "#3b82f6" }}>Load Items</strong> to browse your inventory catalogue and select products to transfer.
                  </div>
                  <button
                    type="button"
                    className="cst-btn cst-btn-blue"
                    style={{ marginTop: 8 }}
                    onClick={() => setShowLoadModal(true)}
                    disabled={!selectedSourceStore}
                  >
                    <ShoppingCart size={13} /> Browse Catalogue
                  </button>
                </div>
              )}

              {/* Table */}
              {items.length > 0 && (
                <>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                      <thead>
                        <tr>
                          <th className="cst-th" style={{ width: 44 }}>#</th>
                          <th className="cst-th">Product</th>
                          <th className="cst-th cst-th-c">Available</th>
                          <th className="cst-th cst-th-c">Transfer Qty</th>
                          <th className="cst-th cst-th-c">Unit</th>
                          <th className="cst-th">Remarks</th>
                          <th className="cst-th cst-th-c" style={{ width: 60 }}>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => {
                          const overQty = Number(item.transferQty) > item.availableQty;
                          return (
                            <tr key={item.id} className="cst-tr">
                              <td className="cst-td"><span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>{index + 1}</span></td>
                              <td className="cst-td">
                                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                  <div className="cst-thumb"><Package size={13} style={{ color: "#3b82f6" }} /></div>
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{item.product}</div>
                                    <span className="cst-sku-badge">{item.sku}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="cst-td cst-td-c">
                                <span style={{ background: "rgba(100,116,139,0.08)", color: "#475569", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                                  {item.availableQty}
                                </span>
                              </td>
                              <td className="cst-td cst-td-c">
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                                  <input
                                    type="number" className="cst-qty-input"
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
                              <td className="cst-td cst-td-c">
                                <span style={{ background: "rgba(59,130,246,0.07)", color: "#2563eb", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                  {item.unit}
                                </span>
                              </td>
                              <td className="cst-td">
                                <input
                                  type="text" className="cst-remarks-input"
                                  value={item.remarks} placeholder="Add remark…"
                                  onChange={(e) => handleItemChange(item.id, "remarks", e.target.value)}
                                />
                              </td>
                              <td className="cst-td cst-td-c">
                                <button type="button" className="cst-remove-btn" onClick={() => removeItem(item.id)} title="Remove">
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="cst-table-bottom">
                    <button type="button" className="cst-btn cst-btn-load" style={{ height: 34, fontSize: 12, padding: "0 14px", borderRadius: 10 }} onClick={() => setShowLoadModal(true)} disabled={!selectedSourceStore}>
                      <Plus size={12} /> Add More Items
                    </button>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      <strong style={{ color: "#3b82f6" }}>{items.length}</strong> product{items.length !== 1 ? "s" : ""} loaded
                    </span>
                  </div>
                  <div className="cst-summary-bar">
                    <div className="cst-summary-chip">
                      <Package size={13} style={{ color: "#94a3b8" }} />
                      <span>Total Items:</span>
                      <span className="cst-summary-val">{items.length}</span>
                    </div>
                    <div style={{ width: 1, height: 16, background: "rgba(59,130,246,0.2)" }} />
                    <div className="cst-summary-chip">
                      <Truck size={13} style={{ color: "#94a3b8" }} />
                      <span>Total Qty:</span>
                      <span className="cst-summary-val">{totalQty}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action Bar */}
            <div className="cst-action-bar">
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {items.length > 0
                  ? <span><strong style={{ color: "#3b82f6" }}>{items.length}</strong> item{items.length !== 1 ? "s" : ""} ready to transfer</span>
                  : <span style={{ color: "#94a3b8" }}>Add products above to begin the transfer.</span>
                }
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button type="button" className="cst-btn cst-btn-ghost" onClick={() => navigate(all_routes.transfers)}>
                  <X size={13} /> Cancel
                </button>
                <button type="button" className="cst-btn cst-btn-draft" onClick={() => console.log("Saving draft:", { formData, items })}>
                  <Save size={13} /> Save Draft
                </button>
                <button
                  type="button"
                  className="cst-btn cst-btn-teal"
                  onClick={handleDispatchTransfer}
                  disabled={submitting || items.length === 0}
                >
                  {submitting ? "Dispatching..." : <><Truck size={13} /> Dispatch Transfer</>}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CreateStockTransfer;