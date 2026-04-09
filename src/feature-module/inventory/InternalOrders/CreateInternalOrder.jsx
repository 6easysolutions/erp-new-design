import { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft, X, Calendar, Search, Printer, Save, Package,
  ChevronRight, ShoppingCart, Filter, RefreshCw, AlertCircle,
  DollarSign, Hash, MapPin, Tag,
} from "react-feather";
import Select from "react-select";
import { URLS } from "../../../Urls";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";

const CreateInternalOrder = () => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [departments, setDepartments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState({
    departments: false, warehouses: false, stores: false,
    categories: false, brands: false, items: false, submitting: false,
  });

  const [formData, setFormData] = useState({
    orderNo: "ION-00136",
    department: "",
    issueDate: new Date().toISOString().split("T")[0],
    deliveryLocation: "",
    warehouse: "",
    subWarehouse: "",
    requestReason: "",
    productCategory: "",
    brand: "",
    location: "All Locations",
    search: "",
  });

  // ── API fetchers ───────────────────────────────────────────────────────────
  const fetchDepartments = async () => {
    setLoading((p) => ({ ...p, departments: true }));
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(URLS.GetHrmsDepartments, { method: "GET", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      const data = await res.json();
      if (res.ok && data.data) setDepartments(data.data || []);
      else toast.error(data.message || "Failed to fetch departments");
    } catch { toast.error("Network error. Please try again."); }
    finally { setLoading((p) => ({ ...p, departments: false })); }
  };

  const fetchWarehouses = async () => {
    setLoading((p) => ({ ...p, warehouses: true }));
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(URLS.GetWarehouse, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      const data = await res.json();
      if (res.ok && data.success && data.data) setWarehouses(data.data || []);
      else toast.error(data.message || "Failed to fetch warehouses");
    } catch { toast.error("Network error. Please try again."); }
    finally { setLoading((p) => ({ ...p, warehouses: false })); }
  };

  const fetchStores = async () => {
    setLoading((p) => ({ ...p, stores: true }));
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(URLS.GetAllStore, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      const data = await res.json();
      if (res.ok && data.success && data.data) setStores(data.data || []);
      else toast.error(data.message || "Failed to fetch stores");
    } catch { toast.error("Network error. Please try again."); }
    finally { setLoading((p) => ({ ...p, stores: false })); }
  };

  const fetchCategories = async () => {
    setLoading((p) => ({ ...p, categories: true }));
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(URLS.GetCategory, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      const data = await res.json();
      if (res.ok && data.success && data.category) setCategories(data.category || []);
      else toast.error(data.message || "Failed to fetch categories");
    } catch { toast.error("Network error. Please try again."); }
    finally { setLoading((p) => ({ ...p, categories: false })); }
  };

  const fetchBrands = async () => {
    setLoading((p) => ({ ...p, brands: true }));
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(URLS.GetBrand, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      const data = await res.json();
      if (res.ok && data.success) setBrands(data.brands || data.data || []);
      else { toast.error(data.message || "Failed to fetch brands"); setBrands([]); }
    } catch { toast.error("Network error. Please try again."); setBrands([]); }
    finally { setLoading((p) => ({ ...p, brands: false })); }
  };

  const refreshAllData = async () => {
    await Promise.all([fetchDepartments(), fetchWarehouses(), fetchStores(), fetchCategories(), fetchBrands()]);
    toast.success("Data refreshed successfully");
  };

  // ── Load items ─────────────────────────────────────────────────────────────
  const loadItems = async () => {
    if (!formData.productCategory || !formData.brand) {
      toast.error("Please select both Product Category and Brand to load items");
      return;
    }
    if (formData.brand === "any") {
      toast.error("Please select a specific brand to load items");
      return;
    }
    setLoading((p) => ({ ...p, items: true }));
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(URLS.LoadItems, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: formData.productCategory, brandId: formData.brand, storeId: Number(localStorage.getItem("selectedStoreId")) }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.items) {
        setItems(data.items.map((item) => ({
          id: item.productId, checked: false, status: true,
          name: item.productName, sku: `SKU-${item.productId}`,
          location: "N/A", availablePack: 0, availableQty: item.availableStock,
          qtyRequested: item.qtyRequested || 1, unitCost: item.unitCost, image: null,
        })));
        toast.success(`${data.totalItems} items loaded successfully`);
      } else {
        toast.error(data.message || "Failed to load items");
        setItems([]);
      }
    } catch { toast.error("Network error. Please try again."); setItems([]); }
    finally { setLoading((p) => ({ ...p, items: false })); }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmitOrder = async (isDraft = false) => {
    if (!formData.department) { toast.error("Please select a department"); return; }
    // if (!formData.warehouse)     { toast.error("Please select a warehouse"); return; }
    if (!formData.deliveryLocation) { toast.error("Please select a delivery location"); return; }
    if (!formData.issueDate) { toast.error("Please select an issue date"); return; }
    if (!formData.requestReason?.trim()) { toast.error("Please provide a request reason"); return; }

    const selectedItemsWithQty = items.filter((i) => i.checked && Number(i.qtyRequested) > 0);
    if (selectedItemsWithQty.length === 0) {
      toast.error("Please select at least one item with quantity greater than 0");
      return;
    }

    setLoading((p) => ({ ...p, submitting: true }));
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(URLS.AddInternalOrder, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          department: formData.department,
          deliveryLocation: formData.deliveryLocation,
          storeId: Number(localStorage.getItem("selectedStoreId")),
          issueDate: formData.issueDate,
          requestReason: formData.requestReason,
          items: selectedItemsWithQty.map((i) => ({ productId: i.id, qtyRequested: Number(i.qtyRequested) })),
          isDraft,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(isDraft ? `Draft saved! Code: ${data.orderCode}` : `Order created! Code: ${data.orderCode}`);
        setFormData({
          orderNo: data.orderCode || "ION-00136", department: "",
          issueDate: new Date().toISOString().split("T")[0],
          deliveryLocation: "", warehouse: "", subWarehouse: "",
          requestReason: "", productCategory: "", brand: "",
          location: "All Locations", search: "",
        });
        setItems([]);
      } else {
        toast.error(data.message || "Failed to create internal order");
      }
    } catch { toast.error("Network error. Please try again."); }
    finally { setLoading((p) => ({ ...p, submitting: false })); }
  };

  useEffect(() => {
    fetchDepartments(); fetchWarehouses(); fetchStores(); fetchCategories(); fetchBrands();
  }, []);

  // ── react-select options ───────────────────────────────────────────────────
  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));
  const warehouseOptions = warehouses.map((w) => ({ value: w.id, label: w.warehouseName }));
  const storeOptions = stores.map((s) => ({ value: s.id, label: s.storeName }));
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const brandOptions = brands.map((b) => ({ value: b.id, label: b.name }));

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData((p) => ({ ...p, [name]: selectedOption ? selectedOption.value : "" }));
    if (name === "productCategory" || name === "brand") setItems([]);
  };

  const handleInputChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleQtyChange = (id, val) => setItems((p) => p.map((i) => i.id === id ? { ...i, qtyRequested: Math.max(0, Number(val) || 0) } : i));
  const handleCheckRow = (id) => setItems((p) => p.map((i) => i.id === id ? { ...i, checked: !i.checked } : i));
  const handleCheckAll = () => { const all = items.every((i) => i.checked); setItems((p) => p.map((i) => ({ ...i, checked: !all }))); };

  const filteredItems = useMemo(() => {
    const q = formData.search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.location.toLowerCase().includes(q));
  }, [items, formData.search]);

  const checkedItems = filteredItems.filter((i) => i.checked);
  const totalItems = checkedItems.reduce((s, i) => s + i.qtyRequested, 0);
  const totalCost = checkedItems.reduce((s, i) => s + i.qtyRequested * i.unitCost, 0);

  const canLoadItems = !Object.values(loading).some(Boolean) && formData.productCategory && formData.brand && formData.brand !== "any";
  const needsFilterHint = !formData.productCategory || !formData.brand || formData.brand === "any";

  // ── react-select shared styles ─────────────────────────────────────────────
  const selectStyles = {
    control: (base) => ({
      ...base, minHeight: 38, border: "none",
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

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .cio-root {
          background: linear-gradient(135deg, #f8faff 0%, #dbe8ff 100%);
          min-height: 100vh;
          padding: 24px;
          padding-top: 100px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ── Main glass card ──────────────────────────────────────────── */
        .cio-main-card {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          padding: 28px 32px;
          margin-bottom: 24px;
        }

        /* ── Section sub-cards ────────────────────────────────────────── */
        .cio-card {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px;
          margin-bottom: 18px;
          overflow: visible;
        }
        .cio-card-header {
          padding: 13px 20px;
          border-bottom: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; flex-wrap: wrap;
          background: rgba(255,255,255,0.4);
          border-radius: 18px 18px 0 0;
        }
        .cio-card-header-left { display: flex; align-items: center; gap: 9px; }
        .cio-card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }
        .cio-card-body { padding: 20px; }

        /* ── Icon box ─────────────────────────────────────────────────── */
        .cio-icon-box {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* ── Field ────────────────────────────────────────────────────── */
        .cio-field-label {
          font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.4px;
          display: block; margin-bottom: 6px;
        }
        .cio-select-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 3px 8px 3px 14px;
          transition: border-color 0.2s;
        }
        .cio-select-wrap:focus-within { border-color: rgba(59,130,246,0.45); }

        .cio-input-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 0 14px; height: 38px;
          display: flex; align-items: center; gap: 8px;
          transition: border-color 0.2s;
        }
        .cio-input-wrap:focus-within { border-color: rgba(59,130,246,0.45); }

        .cio-input {
          background: transparent; border: none; outline: none;
          font-size: 13px; color: #1e293b; font-weight: 500;
          flex: 1; min-width: 0; font-family: inherit; width: 100%;
        }
        .cio-input::placeholder { color: #94a3b8; font-weight: 400; }
        .cio-input[type="date"] { cursor: pointer; }

        .cio-textarea-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 10px 14px;
          transition: border-color 0.2s;
        }
        .cio-textarea-wrap:focus-within { border-color: rgba(59,130,246,0.45); }
        .cio-textarea {
          background: transparent; border: none; outline: none;
          font-size: 13px; color: #1e293b; font-family: inherit;
          width: 100%; resize: vertical; min-height: 60px; font-weight: 500;
        }
        .cio-textarea::placeholder { color: #94a3b8; font-weight: 400; }

        /* ── Filter hint banner ───────────────────────────────────────── */
        .cio-hint-banner {
          margin-top: 14px;
          background: rgba(245,158,11,0.07);
          border: 1px solid rgba(245,158,11,0.22);
          border-radius: 10px; padding: 10px 14px;
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: #92400e; font-weight: 500;
        }

        /* ── Table ────────────────────────────────────────────────────── */
        .cio-table-wrap {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px; overflow: hidden;
          margin-bottom: 0;
        }
        .cio-th {
          padding: 11px 14px;
          font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.5px;
          background: rgba(248,250,252,0.7);
          border-bottom: 1px solid rgba(226,232,240,0.6);
          white-space: nowrap; text-align: left;
        }
        .cio-th-center { text-align: center; }
        .cio-th-right  { text-align: right; }
        .cio-td {
          padding: 11px 14px;
          font-size: 13px; color: #1e293b;
          border-bottom: 1px solid rgba(226,232,240,0.4);
          vertical-align: middle; white-space: nowrap;
        }
        .cio-td-center { text-align: center; }
        .cio-td-right  { text-align: right; }
        .cio-tr { transition: background 0.13s; }
        .cio-tr:hover td { background: rgba(59,130,246,0.025); }
        .cio-tr.checked td { background: rgba(59,130,246,0.04); }
        .cio-tr:last-child td { border-bottom: none; }

        /* Checkbox */
        .cio-check-box {
          width: 18px; height: 18px; border-radius: 5px;
          border: 1.5px solid rgba(203,213,225,0.9);
          background: #fff; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          transition: all 0.15s; flex-shrink: 0;
        }
        .cio-check-box.active {
          background: #3b82f6; border-color: #3b82f6; color: #fff;
        }
        .cio-check-box svg { display: block; }

        /* Product thumb */
        .cio-thumb {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.12);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* SKU badge */
        .cio-sku-badge {
          background: rgba(100,116,139,0.08); color: #475569;
          padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 600;
          display: inline-block;
        }

        /* Qty input */
        .cio-qty-input {
          width: 80px; height: 32px;
          border: 1.5px solid rgba(226,232,240,0.9); border-radius: 8px;
          padding: 0 8px; text-align: right; font-size: 13px; font-weight: 700;
          outline: none; background: #fff; font-family: inherit; color: #1e293b;
          transition: border-color 0.2s;
        }
        .cio-qty-input:focus { border-color: rgba(59,130,246,0.45); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

        /* Summary bar */
        .cio-summary-bar {
          padding: 13px 20px;
          display: flex; align-items: center; justify-content: flex-end;
          gap: 20px; flex-wrap: wrap;
          border-top: 1px solid rgba(226,232,240,0.55);
          background: rgba(248,250,252,0.5);
        }
        .cio-summary-chip {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #475569;
        }
        .cio-summary-val {
          font-weight: 800; font-size: 15px; color: #0f172a;
        }
        .cio-summary-val.green { color: #059669; }

        /* ── Action footer ────────────────────────────────────────────── */
        .cio-action-bar {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 16px; padding: 14px 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px; flex-wrap: wrap; margin-bottom: 24px;
        }

        /* ── Buttons ──────────────────────────────────────────────────── */
        .cio-btn {
          height: 38px; padding: 0 18px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px;
          transition: all 0.2s; white-space: nowrap; font-family: inherit;
        }
        .cio-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .cio-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .cio-btn-cancel {
          background: rgba(241,245,249,0.9);
          border: 1.5px solid rgba(226,232,240,0.9); color: #64748b;
        }
        .cio-btn-cancel:hover { background: rgba(226,232,240,0.8); }

        .cio-btn-draft {
          background: rgba(245,158,11,0.1);
          border: 1.5px solid rgba(245,158,11,0.3); color: #92400e;
        }
        .cio-btn-draft:hover:not(:disabled) { background: rgba(245,158,11,0.18); }

        .cio-btn-blue {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff; box-shadow: 0 4px 14px rgba(37,99,235,0.25);
        }
        .cio-btn-blue:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(37,99,235,0.35); }

        .cio-btn-green {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; box-shadow: 0 4px 14px rgba(5,150,105,0.22);
        }
        .cio-btn-green:hover:not(:disabled) { box-shadow: 0 6px 18px rgba(5,150,105,0.32); }

        .cio-btn-load {
          background: rgba(59,130,246,0.1);
          border: 1.5px solid rgba(59,130,246,0.25); color: #2563eb;
        }
        .cio-btn-load:hover:not(:disabled) { background: rgba(59,130,246,0.18); }

        .cio-btn-close {
          width: 34px; height: 34px; padding: 0; border-radius: 10px;
          background: rgba(255,255,255,0.5); border: 1.5px solid rgba(226,232,240,0.9);
          color: #64748b; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.18s;
        }
        .cio-btn-close:hover { background: rgba(255,255,255,0.85); color: #1e293b; }

        /* ── Spinner ──────────────────────────────────────────────────── */
        @keyframes cio-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .cio-spinner {
          width: 12px; height: 12px; border-radius: 50%;
          border: 2px solid transparent; border-top-color: currentColor;
          animation: cio-spin 0.8s linear infinite; flex-shrink: 0;
        }

        /* ── Page title ───────────────────────────────────────────────── */
        .cio-title { font-size: 23px; font-weight: 700; color: #0f172a; margin: 0; }

        /* ── Order code chip ──────────────────────────────────────────── */
        .cio-code-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2);
          border-radius: 20px; padding: 5px 14px;
          font-size: 13px; font-weight: 700; color: #2563eb;
        }

        /* ── Row grid ─────────────────────────────────────────────────── */
        .cio-grid-row {
          display: flex; flex-wrap: wrap; margin: -8px; 
        }
        .cio-grid-col {
          padding: 8px; box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .cio-root { padding: 16px; padding-top: 80px; }
          .cio-main-card { padding: 18px; }
          .cio-card-body { padding: 14px; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="cio-root">
        <div style={{ maxWidth: "95%", margin: "0 auto" }}>
          <div className="cio-main-card">

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
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>Create Order</span>
                </div>

                {/* Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(59,130,246,0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <h4 className="cio-title">Create Internal Order</h4>
                      <div className="cio-code-chip">
                        <Hash size={11} /> {formData.orderNo}
                      </div>
                    </div>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 0" }}>
                      Fill in the order details, filter items and select quantities to request.
                    </p>
                  </div>
                </div>
              </div>

              {/* Close */}
              <button type="button" className="cio-btn-close" onClick={() => navigate(-1)} title="Go back">
                <X size={15} />
              </button>
            </div>

            {/* ── Order Information ──────────────────────────────────────────── */}
            <div className="cio-card">
              <div className="cio-card-header">
                <div className="cio-card-header-left">
                  <div className="cio-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <ShoppingCart size={13} />
                  </div>
                  <h2 className="cio-card-title">Order Information</h2>
                </div>
                <button type="button" className="cio-btn cio-btn-load" style={{ height: 30, padding: "0 12px", fontSize: 11, borderRadius: 8 }} onClick={refreshAllData}>
                  <RefreshCw size={11} /> Refresh Data
                </button>
              </div>

              <div className="cio-card-body">
                <div className="cio-grid-row">

                  {/* Department */}
                  <div className="cio-grid-col" style={{ flex: "0 0 25%", maxWidth: "25%" }}>
                    <label className="cio-field-label">Department</label>
                    <div className="cio-select-wrap">
                      <Select
                        name="department"
                        value={departmentOptions.find((d) => d.value === formData.department) || null}
                        onChange={handleSelectChange}
                        options={departmentOptions}
                        placeholder={loading.departments ? "Loading…" : "Select Department"}
                        isDisabled={loading.departments}
                        styles={selectStyles}
                        isClearable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </div>
                  </div>

                  {/* Warehouse */}
                  {/* <div className="cio-grid-col" style={{ flex: "0 0 25%", maxWidth: "25%" }}>
                    <label className="cio-field-label">Warehouse</label>
                    <div className="cio-select-wrap">
                      <Select
                        name="warehouse"
                        value={warehouseOptions.find((w) => w.value === formData.warehouse) || null}
                        onChange={handleSelectChange}
                        options={warehouseOptions}
                        placeholder={loading.warehouses ? "Loading…" : "Select Warehouse"}
                        isDisabled={loading.warehouses}
                        styles={selectStyles}
                        isClearable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </div>
                  </div> */}

                  {/* Delivery Location */}
                  <div className="cio-grid-col" style={{ flex: "0 0 25%", maxWidth: "25%" }}>
                    <label className="cio-field-label">Delivery Location</label>
                    <div className="cio-select-wrap">
                      <Select
                        name="deliveryLocation"
                        value={storeOptions.find((s) => s.value === formData.deliveryLocation) || null}
                        onChange={handleSelectChange}
                        options={storeOptions}
                        placeholder={loading.stores ? "Loading…" : "Select Delivery Location"}
                        isDisabled={loading.stores}
                        styles={selectStyles}
                        isClearable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </div>
                  </div>

                  {/* Issue Date */}
                  <div className="cio-grid-col" style={{ flex: "0 0 25%", maxWidth: "25%" }}>
                    <label className="cio-field-label">Issue Date</label>
                    <div className="cio-input-wrap">
                      <Calendar size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <input
                        type="date"
                        className="cio-input"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Request Reason */}
                  <div className="cio-grid-col" style={{ flex: "0 0 100%", maxWidth: "100%", marginTop: 4 }}>
                    <label className="cio-field-label">Request Reason</label>
                    <div className="cio-textarea-wrap">
                      <textarea
                        className="cio-textarea"
                        name="requestReason"
                        value={formData.requestReason}
                        onChange={handleInputChange}
                        placeholder="Describe the reason for this internal order request…"
                      />
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ── Filters for Items ──────────────────────────────────────────── */}
            <div className="cio-card">
              <div className="cio-card-header">
                <div className="cio-card-header-left">
                  <div className="cio-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <Filter size={13} />
                  </div>
                  <h2 className="cio-card-title">Filters for Items</h2>
                </div>
                <button
                  type="button"
                  className="cio-btn cio-btn-blue"
                  onClick={loadItems}
                  disabled={!canLoadItems}
                >
                  {loading.items
                    ? <><div className="cio-spinner" /> Loading Items…</>
                    : <><RefreshCw size={12} /> Load Items</>
                  }
                </button>
              </div>

              <div className="cio-card-body">
                <div className="cio-grid-row" style={{ alignItems: "flex-end" }}>

                  {/* Product Category */}
                  <div className="cio-grid-col" style={{ flex: "0 0 25%", maxWidth: "25%" }}>
                    <label className="cio-field-label">
                      <Tag size={10} style={{ marginRight: 4 }} />
                      Product Category
                    </label>
                    <div className="cio-select-wrap">
                      <Select
                        name="productCategory"
                        value={categoryOptions.find((c) => c.value === formData.productCategory) || null}
                        onChange={handleSelectChange}
                        options={categoryOptions}
                        placeholder={loading.categories ? "Loading…" : "Select Category"}
                        isDisabled={loading.categories}
                        styles={selectStyles}
                        isClearable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </div>
                  </div>

                  {/* Brand */}
                  <div className="cio-grid-col" style={{ flex: "0 0 20%", maxWidth: "20%" }}>
                    <label className="cio-field-label">Brand</label>
                    <div className="cio-select-wrap">
                      <Select
                        name="brand"
                        value={[{ value: "any", label: "Any Brand" }, ...brandOptions].find((b) => b.value === formData.brand) || null}
                        onChange={handleSelectChange}
                        options={brandOptions.length > 0
                          ? [{ value: "any", label: "Any Brand" }, ...brandOptions]
                          : [{ value: "any", label: "Any Brand" }]}
                        placeholder={loading.brands ? "Loading…" : brandOptions.length === 0 ? "No brands" : "Select Brand"}
                        isDisabled={loading.brands}
                        styles={selectStyles}
                        isClearable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </div>
                  </div>

                  {/* Search */}
                  <div className="cio-grid-col" style={{ flex: "0 0 55%", maxWidth: "55%" }}>
                    <label className="cio-field-label">Search by product name or SKU</label>
                    <div className="cio-input-wrap">
                      <Search size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <input
                        type="text"
                        className="cio-input"
                        name="search"
                        value={formData.search}
                        onChange={handleInputChange}
                        placeholder="Product name or SKU…"
                      />
                      {formData.search && (
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, search: "" }))}
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* Hint banner */}
                {needsFilterHint && (
                  <div className="cio-hint-banner">
                    <AlertCircle size={13} style={{ flexShrink: 0 }} />
                    <span>Select both a <strong>Product Category</strong> and a specific <strong>Brand</strong> to enable item loading.</span>
                  </div>
                )}
              </div>

              {/* ── Items Table ──────────────────────────────────────────────── */}
              <div style={{ borderTop: "1px solid rgba(226,232,240,0.55)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                  <thead>
                    <tr>
                      <th className="cio-th cio-th-center" style={{ width: 46 }}>
                        <div
                          className={`cio-check-box${items.length > 0 && items.every((i) => i.checked) ? " active" : ""}`}
                          onClick={handleCheckAll}
                          style={{ margin: "0 auto" }}
                        >
                          {items.length > 0 && items.every((i) => i.checked) && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="cio-th cio-th-center" style={{ width: 44 }}>#</th>
                      <th className="cio-th">Product</th>
                      <th className="cio-th">SKU</th>
                      <th className="cio-th">Location</th>
                      <th className="cio-th cio-th-right">Available</th>
                      <th className="cio-th cio-th-right">Qty Requested</th>
                      <th className="cio-th cio-th-right">Unit Cost</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Loading skeleton */}
                    {loading.items && (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={`skel-${i}`}>
                          {[46, 44, 200, 100, 80, 70, 90, 80].map((w, j) => (
                            <td key={j} className="cio-td">
                              <div style={{ height: 12, background: "rgba(226,232,240,0.6)", borderRadius: 6, width: w, animation: "cio-spin 0s" }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    )}

                    {/* Empty state */}
                    {!loading.items && filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ padding: "44px 16px", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 52, height: 52, borderRadius: 15, background: "rgba(148,163,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Package size={24} style={{ color: "#cbd5e1" }} />
                            </div>
                            <div style={{ fontWeight: 600, color: "#64748b", fontSize: 14 }}>No items loaded yet</div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>
                              Select a <strong>Category</strong> and <strong>Brand</strong>, then click <strong style={{ color: "#3b82f6" }}>Load Items</strong>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Data rows */}
                    {!loading.items && filteredItems.map((item, index) => (
                      <tr key={item.id} className={`cio-tr${item.checked ? " checked" : ""}`}>
                        {/* Checkbox */}
                        <td className="cio-td cio-td-center">
                          <div
                            className={`cio-check-box${item.checked ? " active" : ""}`}
                            onClick={() => handleCheckRow(item.id)}
                            style={{ margin: "0 auto" }}
                          >
                            {item.checked && (
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        </td>

                        {/* Sl No */}
                        <td className="cio-td cio-td-center">
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>{index + 1}</span>
                        </td>

                        {/* Product */}
                        <td className="cio-td">
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div className="cio-thumb">
                              {item.image
                                ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                                : <Package size={13} style={{ color: "#3b82f6" }} />
                              }
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{item.name}</span>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="cio-td">
                          <span className="cio-sku-badge">{item.sku}</span>
                        </td>

                        {/* Location */}
                        <td className="cio-td">
                          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b" }}>
                            <MapPin size={11} style={{ color: "#94a3b8", flexShrink: 0 }} />
                            {item.location}
                          </div>
                        </td>

                        {/* Available Qty */}
                        <td className="cio-td cio-td-right">
                          <span style={{ background: "rgba(100,116,139,0.08)", color: "#475569", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                            {item.availableQty}
                          </span>
                        </td>

                        {/* Qty Requested */}
                        <td className="cio-td cio-td-right">
                          <input
                            type="number"
                            className="cio-qty-input"
                            value={item.qtyRequested}
                            min={0}
                            onChange={(e) => handleQtyChange(item.id, e.target.value)}
                          />
                        </td>

                        {/* Unit Cost */}
                        <td className="cio-td cio-td-right">
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                            ${item.unitCost.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary bar */}
              <div className="cio-summary-bar">
                <div className="cio-summary-chip">
                  <Package size={13} style={{ color: "#94a3b8" }} />
                  <span>Total Items:</span>
                  <span className="cio-summary-val">{totalItems}</span>
                </div>
                <div style={{ width: 1, height: 16, background: "rgba(59,130,246,0.2)" }} />
                <div className="cio-summary-chip">
                  <DollarSign size={13} style={{ color: "#94a3b8" }} />
                  <span>Total Cost:</span>
                  <span className="cio-summary-val green">${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* ── Action Bar ─────────────────────────────────────────────────── */}
            <div className="cio-action-bar">
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {checkedItems.length > 0
                  ? <span><strong style={{ color: "#3b82f6" }}>{checkedItems.length}</strong> item{checkedItems.length !== 1 ? "s" : ""} selected</span>
                  : <span style={{ color: "#94a3b8" }}>Check items in the table above to include them in the order.</span>
                }
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button type="button" className="cio-btn cio-btn-cancel" onClick={() => navigate(-1)}>
                  <X size={13} /> Cancel
                </button>

                <button
                  type="button"
                  className="cio-btn cio-btn-draft"
                  onClick={() => handleSubmitOrder(true)}
                  disabled={loading.submitting}
                >
                  {loading.submitting
                    ? <><div className="cio-spinner" /> Saving…</>
                    : <><Save size={13} /> Save as Draft</>
                  }
                </button>

                <button
                  type="button"
                  className="cio-btn cio-btn-blue"
                  onClick={() => handleSubmitOrder(false)}
                  disabled={loading.submitting}
                >
                  {loading.submitting
                    ? <><div className="cio-spinner" /> Submitting…</>
                    : "Submit for Approval"
                  }
                </button>

                <button
                  type="button"
                  className="cio-btn cio-btn-green"
                  onClick={() => window.print()}
                  disabled={loading.submitting}
                >
                  <Printer size={13} /> Print Requisition
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CreateInternalOrder;