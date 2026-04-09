import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommonFooter from "../../../components/footer/commonFooter";
import {
  X, Search, BarChart2, Filter, Package, MapPin, Tag,
  Calendar, ChevronRight, Plus, RefreshCw, Clipboard,
  CheckSquare, Square, AlertCircle, List, Download
} from "react-feather";
import Select from "react-select";
import { URLS } from "../../../Urls";
import CommonDatePicker from "../../../components/date-picker/common-date-picker";


const CreateEditSession = () => {
  const navigate = useNavigate();
  const token    = localStorage.getItem("authToken");

  // ── Responsive width ───────────────────────────────────────────────────────
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Session form state ─────────────────────────────────────────────────────
  const [sessionCode]                     = useState("CNT-00124");
  const [countType, setCountType]         = useState({ value: "spot", label: "Spot Count" });
  const [warehouse, setWarehouse]         = useState({ value: "", label: "Select StoreName" });
  const [category, setCategory]           = useState({ value: "", label: "Please Select Category" });
  const [endDate, setEndDate]             = useState(null);
  const [isFullCount, setIsFullCount]     = useState(true);
  const [scopeType, setScopeType]         = useState("category");
  const [selectedCategory, setSelectedCategory] = useState({ value: "", label: "" });

  // ── Filter state ───────────────────────────────────────────────────────────
  const [filterBrand, setFilterBrand]               = useState({ value: "", label: "Select Brand" });
  const [filterLocation, setFilterLocation]         = useState({ value: "", label: "Select Location" });
  const [filterWarehouse, setFilterWarehouse]       = useState({ value: "", label: "Select Store" });
  const [searchQuery, setSearchQuery]               = useState("");
  const [filterSearchQuery, setFilterSearchQuery]   = useState("");

  // ── Options ────────────────────────────────────────────────────────────────
  const [warehouseOptions, setWarehouseOptions]               = useState([]);
  const [categoryOptions, setCategoryOptions]                 = useState([]);
  const [brandOptions, setBrandOptions]                       = useState([]);
  const [warehouseLocationOptions, setWarehouseLocationOptions] = useState([]);

  // ── Items & selection ──────────────────────────────────────────────────────
  const [items, setItems]               = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading]           = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // ── Fetch options ──────────────────────────────────────────────────────────
  const fetchWarehouses = async () => {
    try {
      const res  = await fetch(URLS.GetAllStore, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.success) {
        const opts = data.data.map((w) => ({ value: w.id, label: w.storeName }));
        setWarehouseOptions(opts);
        setWarehouseLocationOptions(opts);
      }
    } catch (e) { console.error(e); }
  };

  const fetchCategories = async () => {
    try {
      const res  = await fetch(URLS.GetCategory, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setCategoryOptions(data.category.map((c) => ({ value: c.id, label: c.name })));
    } catch (e) { console.error(e); }
  };

  const fetchBrands = async () => {
    try {
      const res  = await fetch(URLS.GetBrand, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setBrandOptions(data.brands.map((b) => ({ value: b.id, label: b.name })));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchCategories();
    fetchBrands();
  }, []);

  // ── Static options ─────────────────────────────────────────────────────────
  const countTypeOptions = [
    { value: "spot",  label: "Spot Count" },
    { value: "full",  label: "Full Count" },
    { value: "cycle", label: "Cycle Count" },
  ];

  const locationOptions = [
    { value: "all",    label: "All Locations" },
    { value: "aisle1", label: "Aisle 1" },
    { value: "aisle2", label: "Aisle 2" },
    { value: "shelf",  label: "Shelf B2" },
  ];

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totalItems      = items.length;
  const totalSystemQty  = items.reduce((s, i) => s + i.systemQty, 0);
  const totalPhysicalQty = items.reduce((s, i) => s + i.physicalQty, 0);
  const totalVariance   = totalPhysicalQty - totalSystemQty;
  const totalVarianceValue = items.reduce((s, i) => s + i.varianceValue, 0);

  // ── Load items ─────────────────────────────────────────────────────────────
  const handleLoadItems = async () => {
    setLoading(true);
    try {
      const selWarehouse = filterWarehouse.value || warehouse.value;
      const warehouseId  = selWarehouse === "main" ? 4 : selWarehouse;
      const payload      = { warehouse: warehouseId , storeId: localStorage.getItem("selectedStoreId") };
      if (filterBrand.value)    payload.brandId  = filterBrand.value;
      if (filterSearchQuery)    payload.products = filterSearchQuery;

      const res  = await fetch(URLS.GetLoadItems, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.items.map((item) => {
          const sysQty = parseInt(item.systemQty) || 0;
          const cost   = parseFloat(item.unitCost) || 0;
          return {
            id: item.productId, name: item.product, sku: item.sku,
            location: item.warehouseName, systemQty: sysQty,
            physicalQty: sysQty, variance: 0, unitCost: cost, varianceValue: 0,
          };
        }));
      } else {
        toast.error("Failed to load items.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error loading items.");
    } finally {
      setLoading(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (action) => {
    if (action === "counting") {
      setSubmitLoading(true);
      try {
        const selWarehouse  = filterWarehouse?.value || warehouse?.value;
        const warehouseId   = selWarehouse === "main" ? 4 : parseInt(selWarehouse);
        let mappedCountType = countType?.value || "";
        if (!mappedCountType.endsWith("count")) mappedCountType += "count";
        let mappedScopeType = scopeType;
        if (scopeType === "category") mappedScopeType = "Category";

        const payload = {
          countType: mappedCountType.toLowerCase(),
          scopeType: mappedScopeType.toLowerCase(),
          categoryId: parseInt(selectedCategory?.value || category?.value || "0"),
          startDate: new Date().toISOString().split("T")[0],
          endDate: endDate ? new Date(endDate).toISOString().split("T")[0] : "",
          storeId: warehouseId || parseInt(localStorage.getItem("selectedStoreId") || "0"),
          items: items
            .filter((i) => selectedItems.has(i.id))
            .map((i) => ({
              productId: i.id,
              physicalQty: i.physicalQty,
            })),
        };

        const res  = await fetch(URLS.CreateInventoryCounts, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`Session created! Code: ${data.sessionCode}`);
          setTimeout(() => window.history.back(), 1500);
        } else {
          toast.error(`Failed: ${data.message || "Unknown error"}`);
        }
      } catch (e) {
        console.error(e);
        toast.error("An error occurred while creating the session.");
      } finally {
        setSubmitLoading(false);
      }
    } else {
      console.log({ action, sessionCode, countType, warehouse, category, endDate, isFullCount, scopeType, selectedCategory });
    }
  };

  // ── Selection helpers ──────────────────────────────────────────────────────
  const handleSelectItem = (id) => {
    const next = new Set(selectedItems);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedItems(next);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length && items.length > 0) setSelectedItems(new Set());
    else setSelectedItems(new Set(items.map((i) => i.id)));
  };

  const handlePhysicalQtyChange = (id, val) => {
    const numericVal = parseInt(val) || 0;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              physicalQty: numericVal,
              variance: numericVal - item.systemQty,
              varianceValue: (numericVal - item.systemQty) * item.unitCost,
            }
          : item
      )
    );
  };

  const allSelected = items.length > 0 && selectedItems.size === items.length;

  // ── react-select shared styles ─────────────────────────────────────────────
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

  // ── Responsive span helper ─────────────────────────────────────────────────
  const getSpan = (spans) => {
    const { xs = 12, md = xs, lg = md } = spans;
    const active = screenWidth >= 992 ? lg : screenWidth >= 768 ? md : xs;
    const pct    = `${(active / 12) * 100}%`;
    return { flex: `0 0 ${pct}`, maxWidth: pct, paddingLeft: 9, paddingRight: 9, boxSizing: "border-box" };
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .ce-root {
          background: linear-gradient(135deg, #f8faff 0%, #dbe8ff 100%);
          min-height: 100vh;
          padding: 24px;
          padding-top: 100px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ── Main glass card ──────────────────────────────────────────── */
        .ce-main-card {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          padding: 28px 32px;
          margin-bottom: 24px;
        }

        /* ── Section sub-cards ────────────────────────────────────────── */
        .ce-card {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px;
          margin-bottom: 18px;
          overflow: visible;
        }
        .ce-card-header {
          padding: 13px 20px;
          border-bottom: 1px solid rgba(226,232,240,0.55);
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; flex-wrap: wrap;
          background: rgba(255,255,255,0.4);
          border-radius: 18px 18px 0 0;
        }
        .ce-card-header-left {
          display: flex; align-items: center; gap: 9px;
        }
        .ce-card-title {
          font-size: 14px; font-weight: 700; color: #0f172a; margin: 0;
          letter-spacing: -0.1px;
        }
        .ce-card-body { padding: 18px 20px; }

        /* ── Icon box ─────────────────────────────────────────────────── */
        .ce-icon-box {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* ── Field blocks ─────────────────────────────────────────────── */
        .ce-field-label {
          font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.4px;
          display: block; margin-bottom: 6px;
        }
        .ce-input-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 0 14px; height: 38px;
          display: flex; align-items: center; gap: 8px;
          transition: border-color 0.2s;
        }
        .ce-input-wrap:focus-within { border-color: rgba(59,130,246,0.45); }
        .ce-input {
          background: transparent; border: none; outline: none;
          font-size: 13px; color: #1e293b; font-weight: 500;
          flex: 1; min-width: 0; font-family: inherit;
        }
        .ce-input::placeholder { color: #94a3b8; font-weight: 400; }
        .ce-select-wrap {
          background: #fff; border: 1.5px solid rgba(226,232,240,0.9);
          border-radius: 12px; padding: 3px 8px 3px 14px;
          transition: border-color 0.2s;
        }
        .ce-select-wrap:focus-within { border-color: rgba(59,130,246,0.45); }

        /* Scope type toggle */
        .ce-scope-toggle {
          display: flex; gap: 8px;
        }
        .ce-scope-chip {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 10px; cursor: pointer;
          font-size: 12px; font-weight: 600; transition: all 0.18s;
          border: 1.5px solid rgba(226,232,240,0.9);
          background: #fff; color: #64748b;
          user-select: none;
        }
        .ce-scope-chip.active {
          background: rgba(59,130,246,0.1);
          border-color: rgba(59,130,246,0.3);
          color: #2563eb;
        }
        .ce-scope-dot {
          width: 7px; height: 7px; border-radius: 50%;
          border: 1.5px solid currentColor; transition: background 0.15s;
        }
        .ce-scope-dot.filled { background: currentColor; }

        /* ── Table ────────────────────────────────────────────────────── */
        .ce-table-card {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 18px; overflow: hidden; margin-bottom: 18px;
        }
        .ce-th {
          padding: 11px 14px;
          font-size: 11px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.5px;
          background: rgba(248,250,252,0.7);
          border-bottom: 1px solid rgba(226,232,240,0.6);
          white-space: nowrap; text-align: left;
        }
        .ce-th-right  { text-align: right; }
        .ce-th-center { text-align: center; width: 48px; }
        .ce-td {
          padding: 11px 14px;
          font-size: 13px; color: #1e293b;
          border-bottom: 1px solid rgba(226,232,240,0.4);
          vertical-align: middle;
        }
        .ce-td-muted  { color: #64748b; }
        .ce-td-right  { text-align: right; font-weight: 700; }
        .ce-td-center { text-align: center; }
        .ce-tr { transition: background 0.13s; }
        .ce-tr:hover td { background: rgba(59,130,246,0.025); }
        .ce-tr:last-child td { border-bottom: none; }

        /* Checkbox style */
        .ce-check {
          width: 15px; height: 15px; cursor: pointer;
          accent-color: #3b82f6;
        }

        /* ── Totals bar ───────────────────────────────────────────────── */
        .ce-totals-bar {
          background: rgba(59,130,246,0.07);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 14px; padding: 13px 20px;
          display: flex; flex-wrap: wrap; gap: 10px 28px; align-items: center;
          margin-bottom: 18px;
        }
        .ce-total-item {
          font-size: 13px; color: #475569; font-weight: 500;
          display: flex; align-items: center; gap: 5px;
        }
        .ce-total-val { font-weight: 800; color: #0f172a; font-size: 14px; }

        /* ── Selection bar (shown when items selected) ────────────────── */
        .ce-selection-bar {
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.18);
          border-radius: 10px; padding: 9px 16px;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 12px; font-weight: 600; color: #2563eb;
        }

        /* ── Footer action bar ────────────────────────────────────────── */
        .ce-action-bar {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 16px; padding: 14px 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px; flex-wrap: wrap; margin-bottom: 24px;
        }
        .ce-action-bar-left { font-size: 12px; color: #64748b; }

        /* ── Buttons ──────────────────────────────────────────────────── */
        .ce-btn {
          height: 38px; padding: 0 20px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px;
          transition: all 0.2s ease; white-space: nowrap; font-family: inherit;
        }
        .ce-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .ce-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .ce-btn-cancel {
          background: rgba(241,245,249,0.9);
          border: 1.5px solid rgba(226,232,240,0.9); color: #64748b;
        }
        .ce-btn-cancel:hover { background: rgba(226,232,240,0.8); }

        .ce-btn-draft {
          background: rgba(245,158,11,0.1);
          border: 1.5px solid rgba(245,158,11,0.3); color: #92400e;
        }
        .ce-btn-draft:hover { background: rgba(245,158,11,0.18); }

        .ce-btn-load {
          background: rgba(59,130,246,0.1);
          border: 1.5px solid rgba(59,130,246,0.25); color: #2563eb;
        }
        .ce-btn-load:hover { background: rgba(59,130,246,0.18); }

        .ce-btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff; box-shadow: 0 4px 14px rgba(37,99,235,0.28);
        }
        .ce-btn-primary:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(37,99,235,0.38); }

        .ce-btn-approve {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; box-shadow: 0 4px 14px rgba(5,150,105,0.22);
        }
        .ce-btn-approve:hover { box-shadow: 0 6px 20px rgba(5,150,105,0.32); }

        .ce-btn-close {
          width: 34px; height: 34px; padding: 0; border-radius: 10px;
          background: rgba(255,255,255,0.5); border: 1.5px solid rgba(226,232,240,0.9);
          color: #64748b; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.18s;
        }
        .ce-btn-close:hover { background: rgba(255,255,255,0.85); color: #1e293b; }

        /* ── Page title ───────────────────────────────────────────────── */
        .ce-title { font-size: 23px; font-weight: 700; color: #0f172a; margin: 0; }

        /* ── Empty state ──────────────────────────────────────────────── */
        .ce-empty {
          padding: 40px 16px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }

        @media (max-width: 768px) {
          .ce-root { padding: 16px; padding-top: 80px; }
          .ce-main-card { padding: 18px; }
          .ce-card-body { padding: 14px; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="ce-root">
        <div style={{ maxWidth: "95%", margin: "0 auto" }}>
          <div className="ce-main-card">

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
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>Create Session</span>
                </div>

                {/* Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(59,130,246,0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Clipboard size={20} />
                  </div>
                  <div>
                    <h4 className="ce-title">Add Inventory Count Session</h4>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 0" }}>
                      Configure session details, apply filters, then load and select items.
                    </p>
                  </div>
                </div>
              </div>

              {/* Close */}
              <button className="ce-btn-close" type="button" onClick={() => window.history.back()} title="Go back">
                <X size={15} />
              </button>
            </div>

            {/* ── Session Information ────────────────────────────────────────── */}
            <div className="ce-card">
              <div className="ce-card-header">
                <div className="ce-card-header-left">
                  <div className="ce-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <Clipboard size={13} />
                  </div>
                  <h2 className="ce-card-title">Session Information</h2>
                </div>
              </div>

              <div className="ce-card-body">
                <div style={{ display: "flex", flexWrap: "wrap", marginLeft: -9, marginRight: -9, rowGap: 16 }}>

                  {/* Count Type */}
                  <div style={getSpan({ xs: 12, md: 6, lg: 2 })}>
                    <label className="ce-field-label">Count Type</label>
                    <div className="ce-select-wrap">
                      <Select
                        value={countType}
                        onChange={setCountType}
                        options={countTypeOptions}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </div>
                  </div>

                  {/* Warehouse */}
                  <div style={getSpan({ xs: 12, md: 6, lg: 3 })}>
                    <label className="ce-field-label">StoreName</label>
                    <div className="ce-select-wrap">
                      <Select
                        value={warehouse}
                        onChange={setWarehouse}
                        options={warehouseOptions}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </div>
                  </div>

                  {/* End Date */}
                  <div style={getSpan({ xs: 12, md: 6, lg: 2 })}>
                    <label className="ce-field-label">End Date</label>
                    <div className="ce-input-wrap" style={{ padding: 0, overflow: "hidden" }}>
                      <CommonDatePicker
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="Select date"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div style={getSpan({ xs: 12, md: 6, lg: 3 })}>
                    <label className="ce-field-label">Category</label>
                    <div className="ce-select-wrap">
                      <Select
                        value={category}
                        onChange={setCategory}
                        options={categoryOptions}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </div>
                  </div>

                  {/* Scope Type */}
                  <div style={getSpan({ xs: 12, md: 6, lg: 2 })}>
                    <label className="ce-field-label">Scope Type</label>
                    <div className="ce-scope-toggle">
                      <div
                        className={`ce-scope-chip${scopeType === "category" ? " active" : ""}`}
                        onClick={() => setScopeType("category")}
                      >
                        <span className={`ce-scope-dot${scopeType === "category" ? " filled" : ""}`} />
                        Category
                      </div>
                      <div
                        className={`ce-scope-chip${scopeType === "full" ? " active" : ""}`}
                        onClick={() => setScopeType("full")}
                      >
                        <span className={`ce-scope-dot${scopeType === "full" ? " filled" : ""}`} />
                        Full
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ── Filters for Items ──────────────────────────────────────────── */}
            <div className="ce-card">
              <div className="ce-card-header">
                <div className="ce-card-header-left">
                  <div className="ce-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <Filter size={13} />
                  </div>
                  <h2 className="ce-card-title">Filters for Items</h2>
                </div>
                <button
                  type="button"
                  className="ce-btn ce-btn-load"
                  onClick={handleLoadItems}
                  disabled={loading}
                >
                  {loading
                    ? <><div className="spinner-border" style={{ width: 13, height: 13 }} /> Loading…</>
                    : <><RefreshCw size={13} /> Load Items</>
                  }
                </button>
              </div>

              <div className="ce-card-body">
                <div style={{ display: "flex", flexWrap: "wrap", marginLeft: -9, marginRight: -9, rowGap: 16 }}>

                  {/* Brand */}
                  <div style={getSpan({ xs: 12, md: 6, lg: 3 })}>
                    <label className="ce-field-label">Brand</label>
                    <div className="ce-select-wrap">
                      <Select
                        value={filterBrand}
                        onChange={setFilterBrand}
                        options={brandOptions}
                        styles={selectStyles}
                        isClearable
                        placeholder="All Brands"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </div>
                  </div>

                  {/* Warehouse Location */}
                  <div style={getSpan({ xs: 12, md: 6, lg: 3 })}>
                    <label className="ce-field-label">Store Location</label>
                    <div className="ce-select-wrap">
                      <Select
                        value={filterWarehouse}
                        onChange={setFilterWarehouse}
                        options={warehouseLocationOptions}
                        styles={selectStyles}
                        isClearable
                        placeholder="All Store"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </div>
                  </div>

                  {/* Product Search */}
                  <div style={getSpan({ xs: 12, md: 12, lg: 4 })}>
                    <label className="ce-field-label">Search by product name or SKU</label>
                    <div className="ce-input-wrap">
                      <Search size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
                      <input
                        type="text"
                        className="ce-input"
                        value={filterSearchQuery}
                        onChange={(e) => setFilterSearchQuery(e.target.value)}
                        placeholder="Product name or SKU…"
                      />
                      {filterSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setFilterSearchQuery("")}
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ── Items Table ────────────────────────────────────────────────── */}
            <div className="ce-table-card">
              {/* Table header */}
              <div className="ce-card-header" style={{ borderRadius: "18px 18px 0 0" }}>
                <div className="ce-card-header-left">
                  <div className="ce-icon-box" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <List size={13} />
                  </div>
                  <h2 className="ce-card-title">Item List</h2>
                  {items.length > 0 && (
                    <span style={{
                      background: "rgba(59,130,246,0.1)", color: "#3b82f6",
                      fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                    }}>
                      {items.length} items
                    </span>
                  )}
                </div>

                {/* Selection indicator */}
                {selectedItems.size > 0 && (
                  <div className="ce-selection-bar">
                    <span><strong>{selectedItems.size}</strong> item{selectedItems.size !== 1 ? "s" : ""} selected</span>
                    <button
                      type="button"
                      onClick={() => setSelectedItems(new Set())}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: "0 0 0 10px", fontSize: 12, fontWeight: 600 }}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                  <thead>
                    <tr>
                      {/* Select all */}
                      <th className="ce-th ce-th-center">
                        <input
                          type="checkbox"
                          className="ce-check"
                          checked={allSelected}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="ce-th">Product</th>
                      <th className="ce-th">SKU</th>
                      <th className="ce-th">Location</th>
                      <th className="ce-th ce-th-right">System Qty</th>
                      <th className="ce-th ce-th-right" style={{ width: 140 }}>Physical Qty</th>
                      <th className="ce-th ce-th-right">Variance</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <div className="ce-empty">
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(148,163,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Package size={22} style={{ color: "#cbd5e1" }} />
                            </div>
                            <div style={{ fontWeight: 600, color: "#64748b", fontSize: 14 }}>No items loaded yet</div>
                            <div style={{ color: "#94a3b8", fontSize: 12 }}>
                              Apply filters above and click <strong style={{ color: "#3b82f6" }}>Load Items</strong> to fetch products.
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => {
                        const isSelected = selectedItems.has(item.id);
                        return (
                          <tr key={item.id} className="ce-tr"
                            style={{ background: isSelected ? "rgba(59,130,246,0.04)" : "transparent" }}>
                            <td className="ce-td ce-td-center">
                              <input
                                type="checkbox"
                                className="ce-check"
                                checked={isSelected}
                                onChange={() => handleSelectItem(item.id)}
                              />
                            </td>
                            <td className="ce-td">
                              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: 8,
                                  background: "rgba(59,130,246,0.08)",
                                  border: "1px solid rgba(59,130,246,0.12)",
                                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                }}>
                                  <Package size={13} style={{ color: "#3b82f6" }} />
                                </div>
                                <span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{item.name}</span>
                              </div>
                            </td>
                            <td className="ce-td ce-td-muted">
                              <span style={{
                                background: "rgba(100,116,139,0.08)", color: "#475569",
                                padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                              }}>
                                {item.sku}
                              </span>
                            </td>
                            <td className="ce-td ce-td-muted">
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <MapPin size={11} style={{ color: "#94a3b8", flexShrink: 0 }} />
                                {item.location}
                              </div>
                            </td>
                            <td className="ce-td ce-td-right">
                              <span style={{
                                background: "rgba(59,130,246,0.08)", color: "#2563eb",
                                padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                                display: "inline-block",
                              }}>
                                {item.systemQty}
                              </span>
                            </td>
                            <td className="ce-td ce-td-right">
                              <div className="ce-input-wrap" style={{ height: 32, width: 100, marginLeft: "auto", padding: "0 8px" }}>
                                <input
                                  type="number"
                                  className="ce-input"
                                  style={{ textAlign: "right" }}
                                  value={item.physicalQty}
                                  onChange={(e) => handlePhysicalQtyChange(item.id, e.target.value)}
                                />
                              </div>
                            </td>
                            <td className="ce-td ce-td-right">
                              <span style={{
                                color: item.variance < 0 ? "#ef4444" : item.variance > 0 ? "#10b981" : "#64748b",
                                fontWeight: 700
                              }}>
                                {item.variance > 0 ? `+${item.variance}` : item.variance}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Totals Bar ─────────────────────────────────────────────────── */}
            <div className="ce-totals-bar">
              <div className="ce-total-item">
                <span>Total Items</span>
                <span className="ce-total-val">{totalItems}</span>
              </div>
              <div style={{ width: 1, height: 16, background: "rgba(59,130,246,0.2)" }} />
              <div className="ce-total-item">
                <span>System Qty</span>
                <span className="ce-total-val">{totalSystemQty}</span>
              </div>
              <div style={{ width: 1, height: 16, background: "rgba(59,130,246,0.2)" }} />
              <div className="ce-total-item">
                <span>Selected</span>
                <span className="ce-total-val" style={{ color: "#3b82f6" }}>{selectedItems.size}</span>
              </div>
              {/* Commented totals preserved: Physical Qty, Variance, Variance Value */}
            </div>

            {/* ── Action Bar ─────────────────────────────────────────────────── */}
            <div className="ce-action-bar">
              <div className="ce-action-bar-left">
                {selectedItems.size > 0
                  ? <span><strong style={{ color: "#3b82f6" }}>{selectedItems.size}</strong> item{selectedItems.size !== 1 ? "s" : ""} selected for this session</span>
                  : <span style={{ color: "#94a3b8" }}>Select items from the table above to include in this session.</span>
                }
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {/* Cancel */}
                <button
                  type="button"
                  className="ce-btn ce-btn-cancel"
                  onClick={() => window.history.back()}
                >
                  <X size={13} /> Cancel
                </button>

                {/* Save Draft */}
                <button
                  type="button"
                  className="ce-btn ce-btn-draft"
                  onClick={() => handleSubmit("draft")}
                >
                  Save Draft
                </button>

                {/* Start Counting */}
                <button
                  type="button"
                  className="ce-btn ce-btn-primary"
                  onClick={() => handleSubmit("counting")}
                  disabled={submitLoading}
                >
                  {submitLoading
                    ? <><div className="spinner-border" style={{ width: 13, height: 13, color: "#fff" }} /> Processing…</>
                    : <><Clipboard size={13} /> Start Counting</>
                  }
                </button>

                {/* Submit for Approval */}
                <button
                  type="button"
                  className="ce-btn ce-btn-approve"
                  onClick={() => handleSubmit("approval")}
                >
                  Submit for Approval
                </button>
              </div>
            </div>

          </div>

          {/* <CommonFooter /> */}
        </div>
      </div>
    </>
  );
};

export default CreateEditSession;