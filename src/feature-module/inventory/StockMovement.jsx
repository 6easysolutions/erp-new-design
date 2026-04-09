import React, { useMemo, useState, useEffect } from "react";
import Select from "react-select";
import {
  ChevronRight,
  Package,
  ArrowUp,
  ArrowDown,
  Repeat,
  Archive,
  AlertTriangle,
  Clipboard,
  CheckCircle,
  Search,
  Download,
  RefreshCw
} from "react-feather";
import { URLS } from "../../Urls";

// ─── Constants & Helpers ──────────────────────────────────────────────────────

const DATE_RANGES = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "This Month", value: "month" },
];

const getDateBounds = (rangeValue) => {
  const toDate = new Date();
  const fromDate = new Date();

  if (rangeValue === "7d") {
    fromDate.setDate(toDate.getDate() - 7);
  } else if (rangeValue === "30d") {
    fromDate.setDate(toDate.getDate() - 30);
  } else if (rangeValue === "month") {
    fromDate.setDate(1);
  }

  const format = (d) => d.toISOString().split("T")[0];
  return { fromDate: format(fromDate), toDate: format(toDate) };
};

const TYPE_META = {
  Added: { color: "#166534", bg: "rgba(22,163,74,0.12)", border: "rgba(22,163,74,0.22)", iconBg: "linear-gradient(135deg,#4ade80,#16a34a)", Icon: ArrowUp },
  Removed: { color: "#be123c", bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.22)", iconBg: "linear-gradient(135deg,#fb7185,#e11d48)", Icon: ArrowDown },
  "Transferred In": { color: "#1d4ed8", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.22)", iconBg: "linear-gradient(135deg,#60a5fa,#2563eb)", Icon: Repeat },
  "Transferred Out": { color: "#1d4ed8", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.22)", iconBg: "linear-gradient(135deg,#60a5fa,#2563eb)", Icon: Repeat },
  Expired: { color: "#b45309", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.24)", iconBg: "linear-gradient(135deg,#fbbf24,#f59e0b)", Icon: Archive },
};

const PRODUCT_COLORS = [
  ["rgba(20,184,166,0.12)", "#0f766e"],
  ["rgba(59,130,246,0.12)", "#2563eb"],
  ["rgba(245,158,11,0.12)", "#d97706"],
  ["rgba(139,92,246,0.12)", "#7c3aed"],
  ["rgba(236,72,153,0.12)", "#db2777"],
];

const getProductColor = (name = "") =>
  PRODUCT_COLORS[(name.charCodeAt(0) || 0) % PRODUCT_COLORS.length];

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso || "—"; }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const TypeBadge = ({ type }) => {
  const meta = TYPE_META[type] || TYPE_META.Added;
  const { Icon } = meta;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px 4px 6px", borderRadius: 999,
      background: meta.bg, border: `1px solid ${meta.border}`,
      color: meta.color, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: 999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: meta.iconBg, color: "#fff", flexShrink: 0,
      }}>
        <Icon size={11} />
      </span>
      {type}
    </span>
  );
};

const SummaryCard = ({
  title, Icon, headerGradient, value, suffix, accent, extraText,
}) => (
  <div style={{
    background: "rgba(255,255,255,0.56)", border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  }}>
    <div style={{
      background: headerGradient, color: "#fff",
      padding: "10px 14px", display: "flex", alignItems: "center",
      gap: 8, fontSize: 13, fontWeight: 800,
      textShadow: "0 1px 1px rgba(0,0,0,0.18)",
    }}>
      <Icon size={15} />
      <span>{title}</span>
    </div>

    <div style={{
      padding: "14px", minHeight: 58,
      display: "flex", alignItems: "center", justifyContent: "center",
      textAlign: "center",
    }}>
      {extraText ? (
        <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>{extraText}</span>
      ) : (
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: accent }}>{value}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#64748b" }}>{suffix}</span>
        </div>
      )}
    </div>
  </div>
);

const ProductCell = ({ name }) => {
  const [bg, color] = getProductColor(name);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: bg, border: "1px solid rgba(148,163,184,0.18)",
        color, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Package size={16} />
      </div>
      <span style={{ fontWeight: 600, color: "#1e293b" }}>{name}</span>
    </div>
  );
};

const ActionButton = ({ icon, label }) => (
  <button
    type="button"
    style={{
      height: 38, borderRadius: 10, border: "1.5px solid rgba(226,232,240,0.9)",
      background: "rgba(255,255,255,0.62)", color: "#1e293b",
      display: "inline-flex", alignItems: "center", gap: 8, padding: "0 14px",
      fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
      fontFamily: "inherit", transition: "background 0.18s, transform 0.18s",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = "rgba(255,255,255,0.9)";
      e.currentTarget.style.transform = "translateY(-1px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = "rgba(255,255,255,0.62)";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const SearchInput = ({ value, onChange, placeholder = "Search…" }) => (
  <label style={{
    display: "flex", alignItems: "center", gap: 8,
    background: "#fff", border: "1.5px solid rgba(226,232,240,0.9)",
    borderRadius: 11, padding: "0 14px", height: 40,
    transition: "border-color 0.2s", cursor: "text", minWidth: 260, maxWidth: 340
  }}>
    <Search size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      style={{
        border: "none", outline: "none", background: "transparent",
        fontSize: 13, color: "#1e293b", flex: 1, fontFamily: "inherit",
      }}
    />
  </label>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const StockMovement = () => {
  const token = localStorage.getItem("authToken");

  // ── Filters & Options ──────────────────────────────────────────────────────
  const [dateRange, setDateRange] = useState(DATE_RANGES[0]);
  const [category, setCategory] = useState({ value: 0, label: "All Categories" });
  const [store, setStore] = useState({ value: 0, label: "All Stores" });
  const [search, setSearch] = useState("");

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [storeOptions, setStoreOptions] = useState([]);

  // ── API State ──────────────────────────────────────────────────────────────
  const [movements, setMovements] = useState([]);
  const [summary, setSummary] = useState({
    stockAdded: "0",
    stockRemoved: "0",
    transfers: "0",
    writeOff: "0"
  });
  const [loading, setLoading] = useState(true);

  // ── Select Styles ──────────────────────────────────────────────────────────
  const selectStyles = {
    control: (base, state) => ({
      ...base, minHeight: 44, borderRadius: 12,
      border: state.isFocused ? "1.5px solid rgba(148,163,184,0.9)" : "1.5px solid rgba(203,213,225,0.9)",
      background: state.isFocused ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.72)",
      boxShadow: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#1e293b",
      transition: "background 0.15s, border-color 0.15s"
    }),
    valueContainer: (base) => ({ ...base, padding: "0 14px" }),
    placeholder: (base) => ({ ...base, color: "#1e293b" }),
    singleValue: (base) => ({ ...base, color: "#1e293b", fontWeight: 600 }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({ ...base, color: "#64748b", padding: "0 12px" }),
    menu: (base) => ({ ...base, borderRadius: 12, boxShadow: "0 12px 32px rgba(0,0,0,0.14)", border: "1px solid rgba(226,232,240,0.8)", overflow: "hidden", zIndex: 9999 }),
    option: (base, state) => ({
      ...base, fontSize: 14, padding: "10px 14px", fontWeight: 500,
      backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "rgba(59,130,246,0.06)" : "transparent",
      color: state.isSelected ? "#fff" : "#1e293b", cursor: "pointer",
    }),
  };

  // ── Fetch Options ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const sRes = await fetch(URLS.GetAllStore, {
          method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const sData = await sRes.json();
        if (sData.success) {
          setStoreOptions([{ value: 0, label: "All Stores" }, ...sData.data.map(s => ({ value: s.id, label: s.storeName }))]);
        }

        const cRes = await fetch(URLS.GetCategory, {
          method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const cData = await cRes.json();
        if (cData.success) {
          setCategoryOptions([{ value: 0, label: "All Categories" }, ...cData.category.map(c => ({ value: c.id, label: c.name }))]);
        }
      } catch (err) { console.error("Error fetching options:", err); }
    };
    fetchOptions();
  }, [token]);

  // ── Fetch Movements ────────────────────────────────────────────────────────
  const fetchMovements = async () => {
    setLoading(true);
    try {
      const dates = getDateBounds(dateRange.value);
      const sId = parseInt(store.value) || "";
      const cId = parseInt(category.value) || "";
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";

      const url = `${URLS.GetStockMovement}?storeId=${sId}&categoryId=${cId}&fromDate=${dates.fromDate}&toDate=${dates.toDate}${searchParam}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setMovements(data.data || []);
        if (data.summary) setSummary(data.summary);
      } else {
        setMovements([]);
      }
    } catch (err) {
      console.error("Error fetching stock movements:", err);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search changes
  useEffect(() => {
    const t = setTimeout(() => { fetchMovements(); }, 400);
    return () => clearTimeout(t);
  }, [category, store, dateRange, search]);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .sm-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f5ff 0%, #dbe8ff 100%);
          padding: 100px 24px 40px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .sm-card {
          margin: 0 auto;
          background: rgba(255,255,255,0.22);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.32);
          border-radius: 24px;
          box-shadow: 0 20px 48px rgba(0,0,0,0.09);
          padding: 28px 32px 32px;
        }

        .sm-breadcrumb {
          display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(226,232,240,0.55);
        }
        .sm-breadcrumb a { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
        .sm-breadcrumb a:hover { color: #3b82f6; }
        .sm-breadcrumb-active { color: #0f172a; font-weight: 700; }

        .sm-page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .sm-page-icon { width: 44px; height: 44px; border-radius: 13px; background: rgba(59,130,246,0.1); color: #3b82f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sm-page-title { margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; }

        .sm-filter-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; z-index: 10; position: relative; }

        .sm-summary-strip { background: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.68); border-radius: 18px; padding: 14px; margin-bottom: 20px; }
        .sm-summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }

        .sm-section-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
        .sm-section-title { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 17px; font-weight: 800; color: #0f172a; }
        .sm-section-badge { width: 20px; height: 20px; border-radius: 50%; background: rgba(22,163,74,0.12); border: 1px solid rgba(22,163,74,0.22); color: #15803d; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sm-toolbar-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

        .sm-table-card { background: rgba(255,255,255,0.54); border: 1px solid rgba(255,255,255,0.72); border-radius: 18px; overflow: hidden; }
        .sm-table-topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; background: rgba(255,255,255,0.48); border-bottom: 1px solid rgba(226,232,240,0.55); flex-wrap: wrap; }
        .sm-table-topbar-left { display: flex; align-items: center; gap: 10px; }
        .sm-table-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.16); color: #2563eb; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        .sm-table { width: 100%; border-collapse: collapse; min-width: 900px; }
        .sm-table th { text-align: left; padding: 13px 16px; font-size: 11px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; color: #64748b; background: rgba(248,250,252,0.82); border-bottom: 1px solid rgba(226,232,240,0.6); white-space: nowrap; }
        .sm-table th.center { text-align: center; }
        .sm-table td { padding: 13px 16px; font-size: 13.5px; color: #1e293b; border-bottom: 1px solid rgba(226,232,240,0.45); vertical-align: middle; }
        .sm-table td.center { text-align: center; }
        .sm-table tbody tr:last-child td { border-bottom: none; }
        .sm-table tbody tr:hover td { background: rgba(59,130,246,0.03); }

        .sm-sku-chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; background: rgba(59,130,246,0.08); color: #2563eb; border: 1px solid rgba(59,130,246,0.18); font-family: monospace; }
        .sm-qty { font-size: 15px; font-weight: 800; color: #0f172a; }
        .sm-date { color: #475569; font-weight: 500; font-size: 13px; }
        .sm-store { font-weight: 600; }
        .sm-reason { color: #334155; font-size: 13px; }

        .sm-empty { padding: 56px 20px; text-align: center; }
        .sm-empty-icon { width: 52px; height: 52px; border-radius: 14px; margin: 0 auto 12px; background: rgba(148,163,184,0.1); display: flex; align-items: center; justify-content: center; }

        @media (max-width: 1100px) {
          .sm-filter-row    { grid-template-columns: repeat(2, 1fr); }
          .sm-summary-grid  { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .sm-root          { padding: 80px 14px 32px; }
          .sm-card          { padding: 18px 16px 24px; }
          .sm-filter-row    { grid-template-columns: 1fr; }
          .sm-summary-grid  { grid-template-columns: 1fr 1fr; }
          .sm-table-topbar  { flex-direction: column; align-items: stretch; }
          .sm-toolbar-actions { justify-content: flex-end; }
        }
        @media (max-width: 400px) {
          .sm-summary-grid  { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="sm-root">
        <div className="sm-card">
          <nav className="sm-breadcrumb" aria-label="Breadcrumb">
            <a href="/dashboard">Inventory Tracking</a>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="sm-breadcrumb-active">Stock Movements</span>
          </nav>

          <header className="sm-page-header">
            <div className="sm-page-icon" aria-hidden="true">
              <Package size={20} />
            </div>
            <h1 className="sm-page-title">Stock Movements</h1>
          </header>

          <div className="sm-filter-row" role="group" aria-label="Filters">
            <div style={{ position: "relative" }}>
              <Select
                value={dateRange}
                onChange={(opt) => setDateRange(opt || DATE_RANGES[0])}
                options={DATE_RANGES}
                styles={selectStyles}
                aria-label="Filter by Date Range"
                isSearchable={false}
              />
            </div>
            <div style={{ position: "relative" }}>
              <Select
                value={category}
                onChange={(opt) => setCategory(opt || { value: 0, label: "All Categories" })}
                options={categoryOptions}
                styles={selectStyles}
                aria-label="Filter by Category"
                isSearchable={false}
              />
            </div>
            <div style={{ position: "relative" }}>
              <Select
                value={store}
                onChange={(opt) => setStore(opt || { value: 0, label: "All Stores" })}
                options={storeOptions}
                styles={selectStyles}
                aria-label="Filter by Store"
                isSearchable={false}
              />
            </div>
          </div>

          <section className="sm-summary-strip" aria-label="Summary">
            <div className="sm-summary-grid">
              <SummaryCard
                title="Stock Added"
                Icon={ArrowUp}
                headerGradient="linear-gradient(135deg,#4ade80,#15803d)"
                value={`+${summary.stockAdded}`}
                suffix="Units"
                accent="#15803d"
              />
              <SummaryCard
                title="Stock Removed"
                Icon={ArrowDown}
                headerGradient="linear-gradient(135deg,#fb7185,#e11d48)"
                value={`${summary.stockRemoved}`}
                suffix="Units"
                accent="#dc2626"
              />
              <SummaryCard
                title="Transfers"
                Icon={Repeat}
                headerGradient="linear-gradient(135deg,#60a5fa,#2563eb)"
                value={summary.transfers}
                suffix="Transfers"
                accent="#2563eb"
              />
              <SummaryCard
                title="Write-off"
                Icon={Archive}
                headerGradient="linear-gradient(135deg,#fbbf24,#f59e0b)"
                value={`${summary.writeOff}`}
                suffix="Units"
                accent="#ea580c"
              />
              <SummaryCard
                title="Low-Stock Alerts"
                Icon={AlertTriangle}
                headerGradient="linear-gradient(135deg,#fb923c,#f97316)"
                value={`${summary.lowStock}`}
                suffix="Items"
                accent="#ea580c"
              />
            </div>
          </section>

          <div className="sm-section-toolbar">
            <h2 className="sm-section-title">
              Movement Log
              <span className="sm-section-badge" aria-label="Active">
                <CheckCircle size={11} />
              </span>
            </h2>
            <div className="sm-toolbar-actions">
              <ActionButton icon={<Download size={15} color="#475569" />} label="Export" />
              <button
                type="button"
                onClick={fetchMovements}
                style={{
                  height: 38, borderRadius: 10, border: "1.5px solid rgba(226,232,240,0.9)",
                  background: "rgba(255,255,255,0.62)", color: "#1e293b",
                  display: "inline-flex", alignItems: "center", gap: 8, padding: "0 14px",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap"
                }}>
                <RefreshCw size={15} color="#475569" className={loading ? "spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="sm-table-card">
            <div className="sm-table-topbar">
              <div className="sm-table-topbar-left">
                <div className="sm-table-icon" aria-hidden="true">
                  <Clipboard size={15} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>All Movements</span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 999,
                  background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)",
                  fontSize: 11, fontWeight: 700, color: "#2563eb",
                }}>
                  {movements.length} records
                </span>
              </div>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search movements..."
              />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="sm-table" aria-label="Stock movements table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>SKU</th>
                    <th>Store</th>
                    <th>Type</th>
                    <th className="center">Qty</th>
                    <th>Date</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                        <RefreshCw size={24} className="spin" style={{ color: "#3b82f6" }} />
                      </td>
                    </tr>
                  ) : movements.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="sm-empty" role="status">
                          <div className="sm-empty-icon" aria-hidden="true">
                            <Package size={22} color="#94a3b8" />
                          </div>
                          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#334155" }}>
                            No stock movements found
                          </p>
                          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
                            Try adjusting the filters or search term.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    movements.map(row => (
                      <tr key={row.id}>
                        <td><ProductCell name={row.itemName} /></td>
                        <td><span className="sm-sku-chip">{row.sku || row.barcode || "N/A"}</span></td>
                        <td className="sm-store">{row.store}</td>
                        <td><TypeBadge type={row.type} /></td>
                        <td className="center sm-qty">{row.quantity}</td>
                        <td className="sm-date">{fmtDate(row.date)}</td>
                        <td className="sm-reason">{row.reason}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StockMovement;