import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { URLS } from "../../../Urls";
import {
  ArrowLeft, Edit, Package, Tag, Layers,
  ShoppingBag, Box, MapPin, Calendar, CheckCircle,
  AlertTriangle, Info, FileText, Download,
  TrendingUp, Cpu, Image as ImageIcon, ChevronRight,
} from "react-feather";

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("specs");
  const [selectedImage, setSelectedImage] = useState(null);
  const token = localStorage.getItem("authToken");
  const storeId = localStorage.getItem("selectedStoreId");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!storeId) {
        console.error("No store selected");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // API expects { id, storeId }
        const response = await axios.post(
          URLS.GetStoreProductById,
          { id, storeId },
          config
        );
        if (response.data.success) {
          const p = response.data.data;
          // Normalize some field names to match the existing component expectations
          const normalized = {
            ...p,
            // Keep the original names where they already match (categoryName, brandName, etc.)
            // but add aliases for fields used in the component that have different names
            log_modified_date: p.logModifiedDate,
            expiry: p.expiryDate,
            batch: p.batchNumber,
            low_stock: p.low_stock_alert,
            opening_stock: p.openingStock,
            pack_of: p.packOf,
            gst: p.gst_percentage,
            // attachments not present in response, so leave undefined
          };
          setProduct(normalized);
          if (p.product_images?.length > 0) {
            setSelectedImage(`${URLS.ImageUrl}${p.product_images[0]}`);
          }
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, token, storeId]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pms-m-page-loader">
        <div className="text-center">
          <div className="spinner-border pms-m-loader-spinner" role="status" />
          <p className="pms-m-loader-text">Loading product details...</p>
        </div>
      </div>
    );
  }

  // ── Not Found or No Store ───────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="pms-m-root">
        <div className="pms-m-main-card" style={{ textAlign: "center", padding: 60 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "rgba(239,68,68,0.1)",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 32,
            }}
          >
            <Package size={32} />
          </div>
          <h5 style={{ color: "#1e293b", fontWeight: 700, marginBottom: 8 }}>
            Product Not Found
          </h5>
          <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            className="pms-m-btn pms-m-btn-add"
            style={{ width: "auto", display: "inline-flex" }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={15} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  // Stock status: compare quantity with low stock alert
  const qty = parseInt(product.quantity) || 0;
  const lowStock = parseInt(product.low_stock_alert) || 0;
  const stockStatus = qty <= lowStock ? "low" : "ok";

  const images = product.product_images || [];

  // UOM conversions – new structure: array of { unitId, uomTypeId, conversionTrack }
  const uomConversions = product.uomConversions || [];

  const tabs = [
    { id: "specs",     label: "Specifications" },
    { id: "inventory", label: "Inventory"       },
    { id: "tax",       label: "Tax Details"     },
    { id: "desc",      label: "Description"     },
  ];

  // ── Shared detail-row renderer ───────────────────────────────────────────────
  const DetailRow = ({ icon: Icon, label, value, accent }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "#475569",
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        {Icon && <Icon size={13} />}
        {label}
      </span>
      <span
        style={{
          fontWeight: 600,
          fontSize: 13,
          color: accent || "#1e293b",
          textAlign: "right",
          maxWidth: "55%",
        }}
      >
        {value || "N/A"}
      </span>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes pv-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .pv-fade { animation: pv-fade-in 0.25s ease; }

        /* Scrollbar for image gallery */
        .pv-gallery::-webkit-scrollbar { height: 4px; }
        .pv-gallery::-webkit-scrollbar-track { background: transparent; }
        .pv-gallery::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.4);
          border-radius: 4px;
        }

        /* Description HTML content */
        .pv-desc-html p  { color: #475569; font-size: 13px; line-height: 1.7; margin-bottom: 8px; }
        .pv-desc-html ul { color: #475569; font-size: 13px; padding-left: 18px; }
      `}</style>

      {/* ── Root ──────────────────────────────────────────────────────────────── */}
      <div className="pms-m-root">
        <div className="pms-m-main-card">

          {/* ── Page Header ─────────────────────────────────────────────────── */}
          <div
            className="d-flex flex-wrap justify-content-between align-items-start"
            style={{ marginBottom: 28 }}
          >
            {/* Breadcrumb + Title */}
            <div>
              {/* Breadcrumb */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                  fontSize: 12,
                  color: "#94a3b8",
                }}
              >
                <Link
                  to="/product-list"
                  style={{ color: "#94a3b8", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                  onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}
                >
                  Inventory
                </Link>
                <ChevronRight size={12} />
                <span style={{ color: "#3b82f6", fontWeight: 600 }}>View Product</span>
              </div>

              {/* Title row */}
              <div className="d-flex align-items-center gap-3">
                <div
                  className="pms-m-header-icon pms-m-header-icon-blue"
                  style={{ width: 44, height: 44, borderRadius: 14, fontSize: 20 }}
                >
                  <Package size={20} />
                </div>
                <div>
                  <h4 className="pms-m-title" style={{ fontSize: 22, marginBottom: 4 }}>
                    {product.name}
                  </h4>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Stock badge */}
                    <span
                      style={{
                        background:
                          stockStatus === "low"
                            ? "rgba(239,68,68,0.12)"
                            : "rgba(16,185,129,0.12)",
                        color: stockStatus === "low" ? "#ef4444" : "#10b981",
                        border: `1px solid ${
                          stockStatus === "low"
                            ? "rgba(239,68,68,0.25)"
                            : "rgba(16,185,129,0.25)"
                        }`,
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      {stockStatus === "low" ? (
                        <AlertTriangle size={10} />
                      ) : (
                        <CheckCircle size={10} />
                      )}
                      {stockStatus === "low" ? "Low Stock" : "In Stock"}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: 11 }}>
                      Updated:{" "}
                      {product.log_modified_date
                        ? new Date(product.log_modified_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="d-flex gap-2 mt-2 mt-md-0">
              <button
                className="pms-m-btn pms-m-btn-back"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                className="pms-m-btn pms-m-btn-add"
                style={{ width: "auto" }}
                onClick={() => navigate(`/edit-product/${product.id}`)}
              >
                <Edit size={15} /> Edit Product
              </button>
            </div>
          </div>

          {/* ── Two-column layout ───────────────────────────────────────────── */}
          <div className="row g-4">

            {/* ── LEFT: Image Gallery ──────────────────────────────────────── */}
            <div className="col-lg-4">
              <div className="pms-m-section-card" style={{ padding: 16 }}>

                {/* Section title */}
                <div className="pms-m-section-title" style={{ marginBottom: 14 }}>
                  <div className="pms-m-header-icon pms-m-header-icon-blue">
                    <ImageIcon size={14} />
                  </div>
                  Product Images
                </div>

                {/* Main image viewer */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.3)",
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    marginBottom: 14,
                    position: "relative",
                  }}
                >
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: 12,
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", color: "#94a3b8" }}>
                      <ImageIcon size={52} style={{ opacity: 0.25, display: "block", margin: "0 auto 8px" }} />
                      <span style={{ fontSize: 12 }}>No Image Available</span>
                    </div>
                  )}

                  {/* Discount badge removed – not present in API */}
                </div>

                {/* Thumbnail strip */}
                {images.length > 0 && (
                  <div
                    className="pv-gallery"
                    style={{
                      display: "flex",
                      gap: 8,
                      overflowX: "auto",
                      paddingBottom: 4,
                    }}
                  >
                    {images.map((img, idx) => {
                      const src = `${URLS.ImageUrl}${img}`;
                      const isActive = selectedImage === src;
                      return (
                        <img
                          key={idx}
                          src={src}
                          alt={`Thumb ${idx + 1}`}
                          onClick={() => setSelectedImage(src)}
                          style={{
                            width: 60,
                            height: 52,
                            borderRadius: 10,
                            objectFit: "cover",
                            flexShrink: 0,
                            cursor: "pointer",
                            border: isActive
                              ? "2px solid #3b82f6"
                              : "2px solid rgba(255,255,255,0.3)",
                            transform: isActive ? "scale(1.06)" : "scale(1)",
                            transition: "all 0.2s ease",
                            boxShadow: isActive
                              ? "0 4px 12px rgba(59,130,246,0.3)"
                              : "none",
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Identification card inside left column */}
                <div
                  style={{
                    marginTop: 16,
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.3)",
                    padding: "12px 14px",
                  }}
                >
                  <div className="pms-m-section-title" style={{ fontSize: 12, marginBottom: 10 }}>
                    <div className="pms-m-header-icon pms-m-header-icon-yellow" style={{ width: 26, height: 26, fontSize: 12 }}>
                      <Tag size={12} />
                    </div>
                    Identification
                  </div>
                  <DetailRow label="Barcode" value={product.barcode} />
                  <DetailRow label="QR Code" value={product.qrcode} />
                  <div style={{ paddingTop: 4 }}>
                    <DetailRow label="SKU / Unique ID" value={product.id} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Information ───────────────────────────────────────── */}
            <div className="col-lg-8">

              {/* ── Quick Stats Row ─────────────────────────────────────── */}
              <div className="row g-3" style={{ marginBottom: 20 }}>

                {/* Pricing */}
                <div className="col-md-4">
                  <div
                    className="pms-m-section-card"
                    style={{ padding: "16px 18px", height: "100%" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div className="pms-m-header-icon pms-m-header-icon-blue">
                        <Tag size={14} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6" }}>
                        Pricing
                      </span>
                    </div>
                    <div
                      style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", lineHeight: 1.1 }}
                    >
                      ₹{product.selling_price || "0.00"}
                    </div>
                    {product.mrp && (
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                        MRP:{" "}
                        <span style={{ textDecoration: "line-through" }}>
                          ₹{product.mrp}
                        </span>
                      </div>
                    )}
                    {product.purchase_price && (
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                        Cost: ₹{product.purchase_price}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inventory */}
                <div className="col-md-4">
                  <div
                    className="pms-m-section-card"
                    style={{ padding: "16px 18px", height: "100%" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div className="pms-m-header-icon pms-m-header-icon-green">
                        <Package size={14} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#10b981" }}>
                        Inventory
                      </span>
                    </div>
                    <div
                      style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", lineHeight: 1.1 }}
                    >
                      {product.quantity}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                      {product.quantityType || "Units"}
                    </div>
                    {/* Mini stock bar */}
                    <div
                      style={{
                        marginTop: 8,
                        height: 4,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.3)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 4,
                          width: `${Math.min(
                            100,
                            (qty / Math.max(lowStock * 3, 10)) * 100
                          )}%`,
                          background:
                            stockStatus === "low"
                              ? "linear-gradient(90deg,#ef4444,#dc2626)"
                              : "linear-gradient(90deg,#10b981,#059669)",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Wholesale / Online Price */}
                <div className="col-md-4">
                  <div
                    className="pms-m-section-card"
                    style={{ padding: "16px 18px", height: "100%" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div className="pms-m-header-icon pms-m-header-icon-yellow">
                        <TrendingUp size={14} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#eab308" }}>
                        Alt Prices
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        Wholesale:{" "}
                        <span style={{ fontWeight: 700, color: "#1e293b" }}>
                          {product.wholesale_price ? `₹${product.wholesale_price}` : "N/A"}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        Online:{" "}
                        <span style={{ fontWeight: 700, color: "#1e293b" }}>
                          {product.online_retail_price
                            ? `₹${product.online_retail_price}`
                            : "N/A"}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        Online Visibility:{" "}
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              product.online_visibility === "Yes" ? "#10b981" : "#ef4444",
                          }}
                        >
                          {product.online_visibility || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── AI Insights ─────────────────────────────────────────── */}
              {/* <div className="pms-m-section-card" style={{ marginBottom: 20, padding: "16px 18px" }}>
                <div className="pms-m-section-title" style={{ marginBottom: 12 }}>
                  <div className="pms-m-header-icon pms-m-header-icon-blue">
                    <Cpu size={14} />
                  </div>
                  AI Inventory Insights
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginBottom: 12,
                    lineHeight: 1.6,
                  }}
                >
                  Based on current sales velocity and lead times, we recommend adjusting
                  your reorder parameters.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {(() => {
                    // Parse selling price safely
                    const price = parseFloat(product.selling_price) || 100;
                    return [
                      {
                        label: "Suggested Reorder Level",
                        value: `${Math.max(10, Math.floor(price / 10))} Units`,
                        color: "#3b82f6",
                      },
                      {
                        label: "Optimal Order Qty",
                        value: `${Math.max(50, Math.floor(price / 2))} Units`,
                        color: "#10b981",
                      },
                    ];
                  })().map((insight) => (
                    <div
                      key={insight.label}
                      style={{
                        background: "rgba(255,255,255,0.25)",
                        border: "1px solid rgba(255,255,255,0.35)",
                        borderRadius: 12,
                        padding: "10px 16px",
                        minWidth: 160,
                      }}
                    >
                      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                        {insight.label}
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: insight.color,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {insight.value}
                        <TrendingUp size={13} />
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* ── Multi-UOM Conversions (updated for new structure) ───────── */}
              {uomConversions.length > 0 && (
                <div
                  className="pms-m-section-card"
                  style={{ marginBottom: 20, padding: "16px 18px" }}
                >
                  <div className="pms-m-section-title" style={{ marginBottom: 14 }}>
                    <div className="pms-m-header-icon pms-m-header-icon-green">
                      <Layers size={14} />
                    </div>
                    Multi-UOM Conversions
                    <span className="pms-m-count-badge">{uomConversions.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {uomConversions.map((conv, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          background: "rgba(255,255,255,0.2)",
                          border: "1px solid rgba(255,255,255,0.3)",
                          borderRadius: 10,
                          padding: "8px 14px",
                        }}
                      >
                        <span className="pms-m-sno">{idx + 1}</span>
                        <span
                          style={{
                            background: "rgba(255,255,255,0.35)",
                            border: "1px solid rgba(255,255,255,0.4)",
                            borderRadius: 8,
                            padding: "2px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#1e293b",
                          }}
                        >
                          Unit ID: {conv.unitId}
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: 13 }}>
                          (Type {conv.uomTypeId})
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: 13 }}>→</span>
                        <span
                          style={{
                            background: "rgba(59,130,246,0.12)",
                            border: "1px solid rgba(59,130,246,0.2)",
                            borderRadius: 8,
                            padding: "2px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#3b82f6",
                          }}
                        >
                          Factor: {conv.conversionTrack}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── File Attachments (hidden because not in API) ───────────── */}

              {/* ── Detail Tabs ──────────────────────────────────────────── */}
              <div className="pms-m-section-card" style={{ padding: 0, overflow: "hidden" }}>

                {/* Tab stepper nav */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.2)",
                    display: "flex",
                    gap: 4,
                    overflowX: "auto",
                  }}
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: "7px 16px",
                        fontSize: 12,
                        fontWeight: activeTab === tab.id ? 700 : 500,
                        color: activeTab === tab.id ? "#1e293b" : "#64748b",
                        background:
                          activeTab === tab.id
                            ? "#ffffff"
                            : "rgba(255,255,255,0.1)",
                        border:
                          activeTab === tab.id
                            ? "1px solid rgba(255,255,255,0.5)"
                            : "1px solid transparent",
                        borderRadius: 20,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s ease",
                        boxShadow:
                          activeTab === tab.id
                            ? "0 4px 12px rgba(0,0,0,0.06)"
                            : "none",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="pv-fade" key={activeTab} style={{ padding: "20px 20px" }}>

                  {/* ── Specifications ─────────────────────────────────── */}
                  {activeTab === "specs" && (
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            marginBottom: 12,
                          }}
                        >
                          Classification
                        </div>
                        <DetailRow icon={Layers}      label="Category"     value={product.categoryName}    />
                        <DetailRow icon={Layers}      label="Sub Category" value={product.subcategoryName} />
                        <DetailRow icon={ShoppingBag} label="Brand"        value={product.brandName}       />
                      </div>
                      <div className="col-md-6">
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            marginBottom: 12,
                          }}
                        >
                          Attributes
                        </div>
                        <DetailRow icon={Box}      label="Size"        value={product.sizeName}   />
                        <DetailRow icon={Box}      label="Color"       value={product.colourName} />
                        <DetailRow icon={Box}      label="Style"       value={product.styleName}  />
                        <DetailRow
                          icon={Calendar}
                          label="Expiry Date"
                          value={
                            product.expiryDate
                              ? new Date(product.expiryDate).toLocaleDateString()
                              : null
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* ── Inventory Details ──────────────────────────────── */}
                  {activeTab === "inventory" && (
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            marginBottom: 12,
                          }}
                        >
                          Stock Management
                        </div>
                        <DetailRow icon={MapPin}        label="Rack Location"   value={product.rackName || "Unassigned"} />
                        <DetailRow icon={Package}       label="Batch Number"    value={product.batchNumber}            />
                        <DetailRow icon={AlertTriangle} label="Low Stock Alert" value={product.low_stock_alert || "0"} accent={stockStatus === "low" ? "#ef4444" : undefined} />
                        <DetailRow icon={Layers}        label="Opening Stock"   value={product.openingStock || "0"}    />
                      </div>
                      <div className="col-md-6">
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            marginBottom: 12,
                          }}
                        >
                          Unit Details
                        </div>
                        <DetailRow label="Quantity Type" value={product.quantityType || "PCs"} />
                        <DetailRow label="Pack Of"       value={product.packOf || "1"}        />
                      </div>
                    </div>
                  )}

                  {/* ── Tax Details ────────────────────────────────────── */}
                  {activeTab === "tax" && (
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            marginBottom: 12,
                          }}
                        >
                          Tax & Compliance
                        </div>
                        <DetailRow icon={Info} label="HSN / SAC" value={product.hsnsacName || product.hsnsacId} />
                        <DetailRow icon={Info} label="GST Rate"  value={product.gst_percentage ? `${product.gst_percentage}%` : null} accent="#3b82f6" />
                        {/* Cess not present in API */}
                      </div>
                    </div>
                  )}

                  {/* ── Description ────────────────────────────────────── */}
                  {activeTab === "desc" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {/* Short */}
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            marginBottom: 10,
                          }}
                        >
                          Short Description
                        </div>
                        <div
                          className="pv-desc-html"
                          style={{
                            background: "rgba(255,255,255,0.2)",
                            border: "1px solid rgba(255,255,255,0.3)",
                            borderRadius: 12,
                            padding: "14px 16px",
                            color: "#475569",
                            fontSize: 13,
                            lineHeight: 1.7,
                            minHeight: 64,
                          }}
                        >
                          {product.short_description ? (
                            <div
                              dangerouslySetInnerHTML={{ __html: product.short_description }}
                            />
                          ) : (
                            <span style={{ color: "#94a3b8" }}>No short description available.</span>
                          )}
                        </div>
                      </div>

                      {/* Long */}
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            marginBottom: 10,
                          }}
                        >
                          Detailed Description
                        </div>
                        <div
                          className="pv-desc-html"
                          style={{
                            background: "rgba(255,255,255,0.2)",
                            border: "1px solid rgba(255,255,255,0.3)",
                            borderRadius: 12,
                            padding: "14px 16px",
                            color: "#475569",
                            fontSize: 13,
                            lineHeight: 1.7,
                            minHeight: 120,
                          }}
                        >
                          {product.large_description ? (
                            <div
                              dangerouslySetInnerHTML={{ __html: product.large_description }}
                            />
                          ) : (
                            <span style={{ color: "#94a3b8" }}>No detailed description available.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* end tabs card */}

            </div>
            {/* end right col */}

          </div>
          {/* end row */}

        </div>
        {/* end main card */}
      </div>
      {/* end root */}
    </>
  );
};

export default ProductView;