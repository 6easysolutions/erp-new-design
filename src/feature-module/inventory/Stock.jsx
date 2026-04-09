import React, { useMemo, useState, useEffect } from "react";
import {
  ChevronDown,
  Download,
  RefreshCw,
  Package,
  AlertTriangle,
  XCircle,
  Clock,
  CheckCircle,
  BarChart2,
  Layers,
  Search,
} from "react-feather";
import Select from "react-select";
import { URLS } from "../../Urls";

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const CATEGORY_OPTIONS = ["All Categories", "Medicines", "Accessories", "Supplements", "Consumables"];
const STORE_OPTIONS = ["All Stores", "Clinic A", "Clinic B", "Clinic C"];

// ─────────────────────────────────────────
// Constants / helpers
// ─────────────────────────────────────────

const STATUS_META = {
  "Low Stock": { color: "#c2410c", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.28)", dot: "#f97316", Icon: AlertTriangle },
  "Out of Stock": { color: "#be123c", bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.28)", dot: "#f43f5e", Icon: XCircle },
  "Expiring Soon": { color: "#b45309", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.30)", dot: "#f59e0b", Icon: Clock },
  "In Stock": { color: "#166534", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.28)", dot: "#22c55e", Icon: CheckCircle },
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

const getCategoryForItem = (name) => {
  if (["Amoxicillin 250mg", "Heartworm Prevention"].includes(name)) return "Medicines";
  if (["Flea & Tick Collar"].includes(name)) return "Accessories";
  if (["Joint Supplements", "Vitamin Chews"].includes(name)) return "Supplements";
  return "Consumables";
};

// ─────────────────────────────────────────
// Reusable sub-components
// ─────────────────────────────────────────

/** Coloured status pill with the correct icon */
const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] ?? STATUS_META["In Stock"];
  const { Icon } = meta;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 12px 4px 8px", borderRadius: 999,
        background: meta.bg, border: `1px solid ${meta.border}`,
        color: meta.color, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 18, height: 18, borderRadius: 999, background: meta.dot,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: "#fff", flexShrink: 0,
        }}
      >
        <Icon size={10} />
      </span>
      {status}
    </span>
  );
};

/** Product avatar + name */
const ProductCell = ({ name }) => {
  const [bg, color] = getProductColor(name);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 34, height: 34, borderRadius: 10,
          background: bg, border: "1px solid rgba(148,163,184,0.18)",
          color, display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Package size={16} />
      </div>
      <span style={{ fontWeight: 600, color: "#1e293b" }}>{name}</span>
    </div>
  );
};

/** Summary metric card */
const SummaryCard = ({
  title, value, accent, gradient,
}) => (
  <div className="summary-card">
    <div style={{ background: gradient }} className="summary-card__header">
      {title}
    </div>
    <div className="summary-card__body">
      <span style={{ fontSize: 28, fontWeight: 900, color: accent, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginTop: 2 }}>items</span>
    </div>
  </div>
);

/** Shared section header: icon + title on the left, action buttons on the right */
const SectionHeader = ({
  icon,
  title,
  badge,
  children
}) => (
  <div className="section-head">
    <div className="section-title">
      <span className="section-title__icon">{icon}</span>
      <span>{title}</span>
      {badge}
    </div>
    <div className="section-actions">
      {children}
      <button className="action-btn" type="button" aria-label="Export data">
        <Download size={15} />
        <span>Export</span>
        <ChevronDown size={14} />
      </button>
      <button className="action-btn" type="button" aria-label="Refresh data">
        <RefreshCw size={15} />
        <span>Refresh</span>
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────
// SVG Trend Chart
// ─────────────────────────────────────────
const TrendChart = ({ data }) => {
  const W = 1200, H = 280;
  const L = 64, R = W - 64, T = 28, B = H - 44;
  const cw = R - L, ch = B - T;
  const xStep = cw / data.length;

  const MAX_SALES = 100000, MIN_SALES = 0;
  const MAX_STOCK = 400, MIN_STOCK = 0;

  const salesY = (v) => T + ch - ((Math.max(MIN_SALES, Math.min(MAX_SALES, v))) / (MAX_SALES - MIN_SALES)) * ch;
  const stockY = (v) => T + ch - ((Math.max(MIN_STOCK, Math.min(MAX_STOCK, v))) / (MAX_STOCK - MIN_STOCK)) * ch;

  const linePoints = data
    .map((d, i) => `${L + xStep * i + xStep / 2},${salesY(d.sales)}`)
    .join(" ");

  const leftTicks = [0, 25000, 50000, 75000, 100000];
  const rightTicks = [0, 100, 200, 300, 400];
  const fmtSales = (v) => (v >= 1000 ? `${v / 1000}K` : `${v}`);
  const fmtStock = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", minWidth: 720, display: "block" }}
        role="img"
        aria-label="Sales and inventory trend chart"
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>

        {/* Axis labels */}
        <text x={L} y={16} fontSize="12" fill="#475569" fontWeight="600">Sales Revenue ($)</text>
        <text x={R} y={16} fontSize="12" fill="#475569" fontWeight="600" textAnchor="end">Inventory Quantity</text>

        {/* Grid + tick labels */}
        {leftTicks.map((tick, idx) => {
          const y = salesY(tick);
          return (
            <g key={tick}>
              <line x1={L} y1={y} x2={R} y2={y} stroke="rgba(148,163,184,0.22)" strokeDasharray="4 4" />
              <text x={L - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">{fmtSales(tick)}</text>
              {rightTicks[idx] !== undefined && (
                <text x={R + 8} y={y + 4} fontSize="11" fill="#64748b">{fmtStock(rightTicks[idx])}</text>
              )}
            </g>
          );
        })}

        {/* Bars (stock) */}
        {data.map((d, i) => {
          const cx = L + i * xStep + xStep / 2;
          const barW = Math.min(36, xStep * 0.55);
          const y = stockY(d.stock);
          return (
            <g key={d.month}>
              <rect x={cx - barW / 2} y={y} width={barW} height={B - y} rx="4" fill="url(#barGrad)" opacity="0.85" />
              <text x={cx} y={B + 22} textAnchor="middle" fontSize="12" fill="#475569">{d.month}</text>
            </g>
          );
        })}

        {/* Sales line */}
        <polyline
          fill="none" stroke="#2563eb" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round"
          points={linePoints}
        />

        {/* Sales dots */}
        {data.map((d, i) => (
          <circle
            key={d.month}
            cx={L + xStep * i + xStep / 2} cy={salesY(d.sales)}
            r="5" fill="#2563eb" stroke="#fff" strokeWidth="2"
          />
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 28, height: 3, background: "#2563eb", borderRadius: 2, display: "inline-block" }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563eb", border: "2px solid #fff", outline: "2px solid #2563eb", display: "inline-block" }} />
          </span>
          Sales Revenue
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#166534" }}>
          <span style={{ width: 20, height: 12, borderRadius: 3, background: "linear-gradient(135deg,#4ade80,#15803d)", display: "inline-block" }} />
          Stock Levels
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────
const Stock = () => {
  const token = localStorage.getItem("authToken");

  // ── Filters & Options ──────────────────────────────────────────────────────
  const [category, setCategory] = useState({ value: 0, label: "All Categories" });
  const [store, setStore] = useState({ value: 0, label: "All Stores" });

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [storeOptions, setStoreOptions] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ── Select Styles ──────────────────────────────────────────────────────────
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 12,
      border: state.isFocused ? "1.5px solid rgba(148,163,184,0.9)" : "1.5px solid rgba(203,213,225,0.9)",
      background: state.isFocused ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.72)",
      boxShadow: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 14,
      color: "#1e293b",
      transition: "background 0.15s, border-color 0.15s"
    }),
    valueContainer: (base) => ({ ...base, padding: "0 14px" }),
    placeholder: (base) => ({ ...base, color: "#1e293b" }),
    singleValue: (base) => ({ ...base, color: "#1e293b", fontWeight: 600 }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({ ...base, color: "#64748b", padding: "0 12px" }),
    menu: (base) => ({
      ...base,
      borderRadius: 12,
      boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
      border: "1px solid rgba(226,232,240,0.8)",
      overflow: "hidden",
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: 14,
      padding: "10px 14px",
      fontWeight: 500,
      backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "rgba(59,130,246,0.06)" : "transparent",
      color: state.isSelected ? "#fff" : "#1e293b",
      cursor: "pointer",
    }),
  };

  // ── Stock Data State ───────────────────────────────────────────────────────
  const [summary, setSummary] = useState({
    low_stock: "0",
    out_of_stock: "0",
    expiring_soon: "0",
    in_stock: "0",
    total: 0,
  });
  const [items, setItems] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch Filter Options ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch Stores
        const sRes = await fetch(URLS.GetAllStore, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const sData = await sRes.json();
        if (sData.success) {
          setStoreOptions([
            { value: 0, label: "All Stores" },
            ...sData.data.map((s) => ({ value: s.id, label: s.storeName })),
          ]);
        }

        // Fetch Categories
        const cRes = await fetch(URLS.GetCategory, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const cData = await cRes.json();
        if (cData.success) {
          setCategoryOptions([
            { value: 0, label: "All Categories" },
            ...cData.category.map((c) => ({ value: c.id, label: c.name })),
          ]);
        }
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };
    fetchOptions();
  }, [token]);

  // ── Fetch Stock Data ───────────────────────────────────────────────────────
  const fetchStockData = async () => {
    setLoading(true);
    try {
      const sId = parseInt(store.value) || "";
      const cId = parseInt(category.value) || "";
      let url = `${URLS.GetStock}?storeId=${sId}&categoryid=${cId}`;
      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setSummary({
          ...data.summary,
          total: data.items?.length || 0,
        });
        setItems(data.items || []);

        // Transform graph object { "Mar": 202 } to array [{ month: "Mar", sales: 0, stock: 202 }]
        const transformedGraph = Object.entries(data.graph || {}).map(([month, stock]) => ({
          month,
          sales: 0, // API doesn't seem to provide sales revenue in this endpoint
          stock: Number(stock),
        }));
        setGraphData(transformedGraph);
      }
    } catch (err) {
      console.error("Error fetching stock data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [category, store, debouncedSearch]);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .stock-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f4ff 0%, #dbe8ff 100%);
          padding: 80px 24px 40px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1e293b;
        }

        .stock-wrap {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Page title */
        .page-title {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(226,232,240,0.7);
        }

        /* Filter row */
        .filter-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          max-width: 640px;
        }

        .filter-select-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .filter-select {
          width: 100%;
          height: 44px;
          padding: 0 40px 0 14px;
          border-radius: 12px;
          border: 1.5px solid rgba(203,213,225,0.9);
          background: rgba(255,255,255,0.72);
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          font-family: inherit;
          transition: background 0.15s, border-color 0.15s;
          outline: none;
        }

        .filter-select:hover,
        .filter-select:focus {
          background: rgba(255,255,255,0.92);
          border-color: rgba(148,163,184,0.9);
        }

        .filter-select-icon {
          position: absolute;
          right: 12px;
          pointer-events: none;
          color: #64748b;
          display: flex;
          align-items: center;
        }

        /* Section card */
        .section-card {
          background: rgba(255,255,255,0.56);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(15,23,42,0.06);
        }

        /* Section header */
        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(226,232,240,0.6);
          background: rgba(255,255,255,0.45);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .section-title__icon {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: rgba(59,130,246,0.1);
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Section action buttons */
        .section-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .action-btn {
          height: 38px;
          border-radius: 10px;
          border: 1.5px solid rgba(203,213,225,0.9);
          background: rgba(255,255,255,0.65);
          color: #334155;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.12s;
        }

        .action-btn:hover {
          background: rgba(255,255,255,0.9);
          transform: translateY(-1px);
        }

        /* Summary grid */
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
          padding: 18px 20px;
        }

        /* Summary card */
        .summary-card {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow: 0 4px 14px rgba(15,23,42,0.06);
          background: rgba(255,255,255,0.6);
        }

        .summary-card__header {
          padding: 10px 14px;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.15);
          letter-spacing: 0.01em;
        }

        .summary-card__body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px 12px;
          min-height: 72px;
          gap: 2px;
        }

        /* Chart section body */
        .chart-body {
          padding: 16px 20px 20px;
        }

        /* Table */
        .stock-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 720px;
        }

        .stock-table thead th {
          text-align: left;
          padding: 12px 16px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #64748b;
          background: rgba(248,250,252,0.85);
          border-bottom: 1px solid rgba(226,232,240,0.65);
          white-space: nowrap;
        }

        .stock-table thead th.th-center { text-align: center; }

        .stock-table tbody td {
          padding: 13px 16px;
          font-size: 14px;
          color: #1e293b;
          border-bottom: 1px solid rgba(226,232,240,0.45);
          vertical-align: middle;
        }

        .stock-table tbody tr:hover td {
          background: rgba(59,130,246,0.03);
        }

        .stock-table tbody tr:last-child td {
          border-bottom: none;
        }

        .td-sku      { font-weight: 500; color: #475569; font-size: 13px; }
        .td-location { font-weight: 500; color: #334155; }
        .td-qty      { text-align: center; font-weight: 700; font-size: 16px; }

        /* Empty state */
        .empty-state {
          padding: 56px 20px;
          text-align: center;
          color: #64748b;
        }

        .empty-state__icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          margin: 0 auto 14px;
          background: rgba(148,163,184,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-state__title {
          font-size: 15px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 6px;
        }

        .empty-state__sub {
          font-size: 13px;
          color: #94a3b8;
        }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .summary-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 720px) {
          .stock-root { padding: 72px 16px 32px; }
          .filter-row { grid-template-columns: 1fr; max-width: 100%; }
          .summary-grid { grid-template-columns: repeat(2, 1fr); }
          .section-head { padding: 12px 14px; }
          .chart-body { padding: 12px 14px 16px; }
        }

        @media (max-width: 480px) {
          .summary-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main className="stock-root" role="main">
        <div className="stock-wrap">

          {/* Page heading */}
          <h1 className="page-title">Inventory Performance Overview</h1>

          {/* Filters */}
          <div className="filter-row">
            <div style={{ position: "relative" }}>
              <Select
                value={category}
                onChange={(opt) => {
                  setCategory(opt || { value: 0, label: "All Categories" });
                }}
                options={categoryOptions}
                styles={selectStyles}
                aria-label="Filter by category"
                isSearchable={false}
              />
            </div>

            <div style={{ position: "relative" }}>
              <Select
                value={store}
                onChange={(opt) => {
                  setStore(opt || { value: 0, label: "All Stores" });
                }}
                options={storeOptions}
                styles={selectStyles}
                aria-label="Filter by store"
                isSearchable={false}
              />
            </div>
          </div>

          <section className="section-card" aria-label="Stock levels summary">
            <SectionHeader
              icon={<Package size={15} />}
              title="Stock Levels"
              badge={loading && <span style={{ fontSize: 12, color: "#64748b" }}>Loading...</span>}
            />

            <div className="summary-grid">
              <SummaryCard
                title="Low Stock"
                value={summary.low_stock}
                accent="#dc2626"
                gradient="linear-gradient(135deg,#f43f5e,#e11d48)"
              />
              <SummaryCard
                title="Out of Stock"
                value={summary.out_of_stock}
                accent="#c2410c"
                gradient="linear-gradient(135deg,#fb923c,#ea580c)"
              />
              <SummaryCard
                title="Expiring Soon"
                value={summary.expiring_soon}
                accent="#b45309"
                gradient="linear-gradient(135deg,#fbbf24,#d97706)"
              />
              <SummaryCard
                title="In Stock"
                value={summary.in_stock}
                accent="#15803d"
                gradient="linear-gradient(135deg,#4ade80,#16a34a)"
              />
              <SummaryCard
                title="Total Items"
                value={summary.total}
                accent="#2563eb"
                gradient="linear-gradient(135deg,#60a5fa,#2563eb)"
              />
            </div>
          </section>

          {/* ── Trend Chart ── */}
          <section className="section-card" aria-label="Sales and inventory trend">
            <SectionHeader
              icon={<BarChart2 size={15} />}
              title="Sales & Inventory Trend"
            />
            <div className="chart-body">
              {loading ? (
                <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                  Loading trend data...
                </div>
              ) : graphData.length > 0 ? (
                <TrendChart data={graphData} />
              ) : (
                <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                  No trend data available for selected filters.
                </div>
              )}
            </div>
          </section>

          {/* ── Inventory Table ── */}
          <section className="section-card" aria-label="Inventory items table">
            <SectionHeader
              icon={<Layers size={15} />}
              title="Inventory Items"
            >
              <div style={{ position: "relative", width: 220 }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
                <input
                  type="text"
                  placeholder="Search item by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%", height: 38, padding: "0 12px 0 32px",
                    borderRadius: 10, border: "1.5px solid rgba(203,213,225,0.9)",
                    background: "rgba(255,255,255,0.65)", fontSize: 13,
                    color: "#1e293b", fontWeight: 500, outline: "none",
                    transition: "border-color 0.2s, background 0.2s"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(148,163,184,0.9)"; e.target.style.background = "rgba(255,255,255,0.92)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(203,213,225,0.9)"; e.target.style.background = "rgba(255,255,255,0.65)"; }}
                />
              </div>
            </SectionHeader>
            <div style={{ overflowX: "auto" }}>
              <table className="stock-table">
                <caption style={{ display: "none" }}>Inventory stock items</caption>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Barcode</th>
                    <th className="th-center">Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                        <RefreshCw size={24} className="spin" style={{ color: "#3b82f6" }} />
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="empty-state">
                          <div className="empty-state__icon">
                            <Package size={22} color="#94a3b8" />
                          </div>
                          <p className="empty-state__title">No stock items found</p>
                          <p className="empty-state__sub">Try adjusting the category or store filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={idx}>
                        <td><ProductCell name={item.name} /></td>
                        <td className="td-sku">{item.barcode || "N/A"}</td>
                        <td className="td-qty">{item.quantity}</td>
                        <td><StatusBadge status={item.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
    </>
  );
};

export default Stock;
