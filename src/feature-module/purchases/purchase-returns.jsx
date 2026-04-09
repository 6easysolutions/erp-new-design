import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import axios from "axios";
import { URLS } from "../../Urls";
import SupplierFormModal from "../setup/master/AllMaster/SupplierFormModal";
import {
  Plus,
  Search,
  Trash2,
  Save,
  RefreshCw,
  X,
  CreditCard,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Eye,
  ShoppingBag,
  ArrowRight,
} from "react-feather";

import "./Purchase.css";

// ── React-Select Styles ────────────────────────────────────
const selectStyles = {
  control: (base, state) => ({
    ...base,
    background: "rgba(255,255,255,0.25)",
    backdropFilter: "blur(12px)",
    borderRadius: "14px",
    border: state.isFocused
      ? "1px solid #3b82f6"
      : "1px solid rgba(255,255,255,0.4)",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(59,130,246,0.12)" : "none",
    padding: "4px 8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f172a",
    minHeight: "44px",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "rgba(255,255,255,0.45)",
      borderColor: "rgba(59,130,246,0.4)",
    },
  }),
  menu: (base) => ({
    ...base,
    background: "rgba(255,255,255,0.97)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.5)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
    padding: "8px",
    zIndex: 1000,
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: "10px",
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
      ? "rgba(59,130,246,0.08)"
      : "transparent",
    color: state.isSelected ? "#fff" : "#1e293b",
    fontSize: "13px",
    fontWeight: "500",
    padding: "10px 14px",
    cursor: "pointer",
    "&:active": { backgroundColor: "rgba(59,130,246,0.15)" },
  }),
  singleValue: (base) => ({ ...base, color: "#0f172a" }),
  placeholder: (base) => ({ ...base, color: "#94a3b8" }),
  indicatorsContainer: (base) => ({ ...base, padding: "0 4px" }),
};

// ── AddChargesModal ────────────────────────────────────────
const AddChargesModal = ({ onClose, onAdd, chargeNameOptions, gstTypeChargesOptions, storeOptions }) => {
  const [formData, setFormData] = useState({
    storeId: 1,
    charges_name: "",
    gst_rate: 18,
    gst_type: 1,
    amount: "",
    gst_amount: 0,
    total_amount: 0,
    tax_rate: 18,
  });

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    if (field === "amount" || field === "gst_rate") {
      const amt     = parseFloat(field === "amount"   ? value : updated.amount)   || 0;
      const gstRate = parseFloat(field === "gst_rate" ? value : updated.gst_rate) || 0;
      updated.gst_amount   = (amt * gstRate) / 100;
      updated.total_amount = amt + updated.gst_amount;
      updated.tax_rate     = gstRate;
    }
    setFormData(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.charges_name || !formData.amount) {
      alert("Please fill in all required fields");
      return;
    }
    onAdd(formData);
  };

  const fmt = (v) => (Number(v) || 0).toFixed(2);

  const gstRateOptions = [
    { value: 0,  label: "0%"  },
    { value: 5,  label: "5%"  },
    { value: 12, label: "12%" },
    { value: 18, label: "18%" },
    { value: 28, label: "28%" },
  ];

  return (
    <div className="pms-modal-backdrop">
      <div className="pms-modal-box">
        <div className="pms-modal-head">
          <h5 className="pms-modal-title">
            <span className="pms-header-icon pms-header-icon-yellow">
              <CreditCard size={16} />
            </span>
            Add Charges
          </h5>
          <button type="button" className="pms-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="pms-modal-body">
            <div className="pms-grid pms-grid-6">

              <div className="pms-col-3">
                <label className="pms-field-label">Store <span className="pms-required">*</span></label>
                <Select
                  styles={selectStyles}
                  options={storeOptions}
                  value={storeOptions.find((o) => o.value === formData.storeId)}
                  onChange={(o) => handleChange("storeId", o.value)}
                />
              </div>

              <div className="pms-col-3">
                <label className="pms-field-label">Charge Type <span className="pms-required">*</span></label>
                <Select
                  styles={selectStyles}
                  options={chargeNameOptions}
                  value={chargeNameOptions.find((o) => o.value === formData.charges_name) || null}
                  onChange={(o) => handleChange("charges_name", o.value)}
                  placeholder="Select Charge"
                />
              </div>

              <div className="pms-col-3">
                <label className="pms-field-label">Amount <span className="pms-required">*</span></label>
                <div className="pms-field-group">
                  <input
                    type="number"
                    className="pms-field-input"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="pms-col-3">
                <label className="pms-field-label">GST Rate (%)</label>
                <Select
                  styles={selectStyles}
                  options={gstRateOptions}
                  value={{ value: formData.gst_rate, label: `${formData.gst_rate}%` }}
                  onChange={(o) => handleChange("gst_rate", o.value)}
                />
              </div>

              <div className="pms-col-3">
                <label className="pms-field-label">GST Type</label>
                <Select
                  styles={selectStyles}
                  options={gstTypeChargesOptions}
                  value={gstTypeChargesOptions.find((o) => o.value === formData.gst_type)}
                  onChange={(o) => handleChange("gst_type", o.value)}
                />
              </div>

              <div className="pms-col-3">
                <label className="pms-field-label">GST Amount</label>
                <div className="pms-field-group">
                  <input
                    type="text"
                    className="pms-field-input"
                    value={`₹${fmt(formData.gst_amount)}`}
                    readOnly
                  />
                </div>
              </div>

              <div className="pms-col-6">
                <div className="pms-summary-total" style={{ marginTop: 0, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <span>Total Amount (incl. GST)</span>
                  <span style={{ fontSize: "22px" }}>₹{fmt(formData.total_amount)}</span>
                </div>
              </div>

            </div>
          </div>
          <div className="pms-modal-foot">
            <button type="button" className="pms-btn pms-btn-soft" onClick={onClose}>Cancel</button>
            <button type="submit" className="pms-btn pms-btn-add">
              <Plus size={16} /> Add Charge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────
const PurchaseReturns = () => {
  const [selectedSupplier, setSelectedSupplier]             = useState(null);
  const [returnType, setReturnType]                         = useState(null);
  const [searchInvoice, setSearchInvoice]                   = useState("");
  const [itemSearchQuery, setItemSearchQuery]               = useState("");
  const [gstType, setGstType]                               = useState("exclusiveGST");
  const [returnDate, setReturnDate]                         = useState("");
  const [debitNoteNumber, setDebitNoteNumber]               = useState("");

  const [purchaseOrders, setPurchaseOrders]                 = useState([]);
  const [selectedPurchaseItems, setSelectedPurchaseItems]   = useState([]);
  const [returnItems, setReturnItems]                       = useState([]);
  const [itemWiseResults, setItemWiseResults]               = useState([]);
  const [accumulatedItems, setAccumulatedItems]             = useState([]);
  const [returnQuantities, setReturnQuantities]             = useState({});

  const [suppliers, setSuppliers]                           = useState([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers]         = useState(false);
  const [showSupplierModal, setShowSupplierModal]           = useState(false);

  const [loading, setLoading]                               = useState(false);
  const [loadingItemSearch, setLoadingItemSearch]           = useState(false);
  const [error, setError]                                   = useState(null);
  const [successMessage, setSuccessMessage]                 = useState(null);
  const [isSaving, setIsSaving]                             = useState(false);

  const [selectedPurchaseIds, setSelectedPurchaseIds]       = useState([]);
  const [selectedItemIds, setSelectedItemIds]               = useState([]);
  const [selectAllPurchases, setSelectAllPurchases]         = useState(false);
  const [selectAllItems, setSelectAllItems]                 = useState(false);

  const [charges, setCharges]                               = useState([]);
  const [showChargesModal, setShowChargesModal]             = useState(false);

  const returnTypeOptions = [
    { value: "billWise", label: "Bill Wise" },
    { value: "itemWise", label: "Item Wise" },
  ];

  const gstOptions = [
    { value: "exclusiveGST", label: "Exclusive GST" },
    { value: "inclusiveGST", label: "Inclusive GST" },
    { value: "nonGST",       label: "Non GST"        },
    { value: "igst",         label: "IGST"           },
  ];

  const storeOptions = [
    { value: "store1", label: "Main Store"  },
    { value: "store2", label: "Warehouse A" },
    { value: "store3", label: "Warehouse B" },
  ];

  const chargeNameOptions = [
    { value: 1, label: "Freight Charges"   },
    { value: 2, label: "Loading Charges"   },
    { value: 3, label: "Unloading Charges" },
    { value: 4, label: "Packaging Charges" },
    { value: 5, label: "Other Charges"     },
  ];

  const gstTypeChargesOptions = [
    { value: 1, label: "CGST + SGST" },
    { value: 2, label: "IGST"        },
  ];

  const getAuthToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) setError("Authentication token not found. Please login again.");
    return token;
  };

  const getAxiosConfig = () => {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication token not available");
    return { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } };
  };

  const safeToNumber = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const formatNumber = (v) => safeToNumber(v).toFixed(2);

  // ── API calls ──────────────────────────────────────────
  const fetchSuppliers = async () => {
    setIsLoadingSuppliers(true);
    setError(null);
    try {
      const r = await axios.post(URLS.GetSuppliers, {}, getAxiosConfig());
      if (r.data.success) {
        setSuppliers(r.data.data.map((s) => ({
          value: s.id, label: s.name, companyName: s.companyName, data: s,
        })));
      } else {
        setError("Failed to fetch suppliers");
      }
    } catch (err) {
      setError("Failed to load suppliers. Please try again.");
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const fetchPurchasesBySupplier = async (supplierId) => {
    if (!supplierId) return;
    setLoading(true);
    setError(null);
    setPurchaseOrders([]);
    setSelectedPurchaseItems([]);
    try {
      const r = await axios.post(URLS.GetPurchasesBySupplier, { supplierId }, getAxiosConfig());
      if (r.data.success) setPurchaseOrders(r.data.data || []);
      else setError(r.data.message || "Failed to fetch purchase orders");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch purchase orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const searchPurchasedItems = useCallback(async (query) => {
    if (!query.trim()) { setItemWiseResults([]); return; }
    if (!selectedSupplier) { setError("Please select a supplier first"); return; }
    setLoadingItemSearch(true);
    setError(null);
    setItemWiseResults([]);
    try {
      const r = await axios.post(
        `${URLS.SearchPurchasedItemBySupplier}?searchQuery=${encodeURIComponent(query)}`,
        { supplierId: selectedSupplier },
        getAxiosConfig()
      );
      if (r.data.success) {
        const flat = [];
        r.data.data.forEach((po) => {
          (po.products || []).forEach((product) => {
            const productId = product.productId || product.id;
            if (!productId) return;
            const supplier = suppliers.find((s) => s.value === po.supplierId);
            flat.push({
              ...product,
              productId,
              purchaseOrderId: po.id,
              batchId:         po.batchId,
              supplierId:      po.supplierId,
              supplierName:    supplier?.label || po.vendorName || "N/A",
              invoiceNo:       po.invoice_number,
              purchaseDate:    po.purchase_date,
              gstType:         po.gst_type,
              uniqueKey:       `${po.id}-${productId}-${Math.random().toString(36).substr(2, 9)}`,
              quantity_stock:  safeToNumber(product.quantity_stock || product.buying_quantity || 0),
              total_quantity:  safeToNumber(product.total_quantity || product.buying_quantity || 0),
              mrp:             safeToNumber(product.mrp),
              purchase_rate:   safeToNumber(product.purchase_rate),
              wholesale_price: safeToNumber(product.wholesale_price),
              total_tax:       safeToNumber(product.total_tax),
              gstId:           safeToNumber(product.gstId),
              hsn_code:        product.hsn_code || "",
              brandId:         product.brandId || "",
              sizeId:          product.sizeId || "",
              colourId:        product.colourId || "",
              styleId:         product.styleId || "",
            });
          });
        });
        setItemWiseResults(flat);
      } else {
        setItemWiseResults([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search items. Please try again.");
      setItemWiseResults([]);
    } finally {
      setLoadingItemSearch(false);
    }
  }, [selectedSupplier, suppliers]);

  const handleSupplierAdded = () => { fetchSuppliers(); setShowSupplierModal(false); };

  useEffect(() => {
    if (returnType === "itemWise" && selectedSupplier && itemSearchQuery.trim()) {
      const t = setTimeout(() => searchPurchasedItems(itemSearchQuery), 500);
      return () => clearTimeout(t);
    } else if (returnType === "itemWise" && !itemSearchQuery.trim()) {
      setItemWiseResults([]);
    }
  }, [itemSearchQuery, returnType, selectedSupplier, searchPurchasedItems]);

  useEffect(() => {
    if (selectedSupplier && returnType === "billWise") fetchPurchasesBySupplier(selectedSupplier);
    else { setPurchaseOrders([]); setSelectedPurchaseItems([]); }
  }, [selectedSupplier, returnType]);

  useEffect(() => { fetchSuppliers(); }, []);

  useEffect(() => {
    const init = {};
    returnItems.forEach((item) => {
      init[item.uniqueKey] = returnQuantities[item.uniqueKey] ?? item.quantity_stock;
    });
    setReturnQuantities(init);
  }, [returnItems]);

  // ── Handlers ───────────────────────────────────────────
  const handleReturnQuantityChange = (key, value, max) => {
    const qty = Math.min(Math.max(1, safeToNumber(value)), max);
    setReturnQuantities((prev) => ({ ...prev, [key]: qty }));
  };

  const resetAll = () => {
    setSelectedSupplier(null); setReturnType(null); setSearchInvoice("");
    setItemSearchQuery(""); setGstType("exclusiveGST"); setReturnDate(""); setDebitNoteNumber("");
    setPurchaseOrders([]); setSelectedPurchaseItems([]); setReturnItems([]);
    setItemWiseResults([]); setSelectedPurchaseIds([]); setSelectedItemIds([]);
    setAccumulatedItems([]); setReturnQuantities({}); setSelectAllPurchases(false);
    setSelectAllItems(false); setCharges([]); setError(null); setSuccessMessage(null);
  };

  const handleSupplierChange = (o) => {
    setSelectedSupplier(o?.value || null);
    setReturnType(null); setPurchaseOrders([]); setSelectedPurchaseItems([]);
    setReturnItems([]); setItemWiseResults([]); setSelectedPurchaseIds([]);
    setSelectedItemIds([]); setAccumulatedItems([]); setReturnQuantities({});
    setItemSearchQuery(""); setCharges([]); setError(null); setSuccessMessage(null);
  };

  const handleReturnTypeChange = (o) => {
    setReturnType(o?.value || null);
    setPurchaseOrders([]); setSelectedPurchaseItems([]); setReturnItems([]);
    setItemWiseResults([]); setSelectedPurchaseIds([]); setSelectedItemIds([]);
    setAccumulatedItems([]); setReturnQuantities({}); setItemSearchQuery("");
    setCharges([]); setError(null); setSuccessMessage(null);
  };

  const handlePurchaseSelect = (id) =>
    setSelectedPurchaseIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSelectAllPurchases = () => {
    setSelectAllPurchases(!selectAllPurchases);
    setSelectedPurchaseIds(!selectAllPurchases ? purchaseOrders.map((o) => o.id) : []);
  };

  const handleItemSelect = (idx) =>
    setSelectedItemIds((prev) =>
      prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]
    );

  const handleSelectAllItems = () => {
    setSelectAllItems(!selectAllItems);
    setSelectedItemIds(!selectAllItems ? selectedPurchaseItems.map((_, i) => i) : []);
  };

  const handleItemWiseSelect = (item) => {
    if (!item.productId && !item.id) { setError("This item has no valid product ID"); return; }
    setAccumulatedItems((prev) =>
      prev.find((i) => i.uniqueKey === item.uniqueKey)
        ? prev.filter((i) => i.uniqueKey !== item.uniqueKey)
        : [...prev, item]
    );
  };

  const isItemSelected       = (key) => accumulatedItems.some((i) => i.uniqueKey === key);
  const areAllResultsSelected = () => {
    const valid = itemWiseResults.filter((i) => i.productId || i.id);
    return valid.length > 0 && valid.every((i) => accumulatedItems.some((a) => a.uniqueKey === i.uniqueKey));
  };

  const handleSelectAllItemWise = () => {
    const valid = itemWiseResults.filter((i) => i.productId || i.id);
    if (areAllResultsSelected()) {
      setAccumulatedItems((prev) => prev.filter((a) => !valid.some((i) => i.uniqueKey === a.uniqueKey)));
    } else {
      setAccumulatedItems((prev) => [...prev, ...valid.filter((i) => !prev.some((a) => a.uniqueKey === i.uniqueKey))]);
    }
  };

  const handleProceed = () => {
    const items = [];
    purchaseOrders
      .filter((o) => selectedPurchaseIds.includes(o.id))
      .forEach((order) => {
        (order.products || []).forEach((product, idx) => {
          const productId = product.productId || product.id;
          if (!productId) return;
          items.push({
            ...product, productId,
            purchaseId: order.id, purchaseOrderId: order.id,
            refId: order.batchId, invoiceNo: order.invoice_number,
            purchaseDate: order.purchase_date,
            supplier: suppliers.find((s) => s.value === order.supplierId)?.label || "N/A",
            uniqueKey: `${order.id}-${productId}-${idx}`,
            quantity_stock:  safeToNumber(product.quantity_stock || product.buying_quantity || 0),
            total_quantity:  safeToNumber(product.total_quantity || product.buying_quantity || 0),
            mrp:             safeToNumber(product.mrp),
            purchase_rate:   safeToNumber(product.purchase_rate),
            wholesale_price: safeToNumber(product.wholesale_price),
            total_tax:       safeToNumber(product.total_tax),
            gstId:           safeToNumber(product.gstId),
            hsn_code:        product.hsn_code || "",
            brandId:         product.brandId || "",
            sizeId:          product.sizeId || "",
            colourId:        product.colourId || "",
            styleId:         product.styleId || "",
          });
        });
      });
    setSelectedPurchaseItems(items);
    setSelectedItemIds([]);
    setSelectAllItems(false);
  };

  const handleItemWiseProceed = () => {
    const valid = accumulatedItems.filter((i) => i.productId || i.id);
    if (!valid.length) { alert("Please select at least one valid item"); return; }
    setReturnItems(valid);
  };

  const removeFromAccumulated = (key) => setAccumulatedItems((prev) => prev.filter((i) => i.uniqueKey !== key));
  const clearAccumulated      = ()    => setAccumulatedItems([]);
  const removeFromReturnItems = (idx, key) => {
    setReturnItems((prev) => prev.filter((_, i) => i !== idx));
    setReturnQuantities((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleAddCharge  = (data) => { setCharges([...charges, { ...data, id: Date.now() }]); setShowChargesModal(false); };
  const removeCharge     = (id)   => setCharges(charges.filter((c) => c.id !== id));

  const handleSaveReturn = async () => {
    if (!returnItems.length) { setError("Please select items to return"); return; }
    const valid = returnItems.filter((i) => i.productId || i.id);
    if (!valid.length) { setError("No valid items with product IDs to return"); return; }

    for (const item of valid) {
      const qty = returnQuantities[item.uniqueKey] || 0;
      if (qty <= 0) { setError(`Enter a valid return quantity for ${item.item_name}`); return; }
      if (qty > item.quantity_stock) { setError(`Return qty for ${item.item_name} cannot exceed ${item.quantity_stock}`); return; }
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const ordersMap = {};
      valid.forEach((item) => {
        const poId      = item.purchaseOrderId || item.purchaseId;
        const productId = item.productId || item.id;
        if (!poId || !productId) return;
        if (!ordersMap[poId]) ordersMap[poId] = { purchaseOrderId: poId, productIds: [] };
        ordersMap[poId].productIds.push({
          productId,
          return_quantity: returnQuantities[item.uniqueKey] || item.quantity_stock,
        });
      });

      const orders = Object.values(ordersMap);
      if (!orders.length) { setError("No valid items to return. Please check product IDs."); return; }

      const r = await axios.post(
        URLS.NewPurchaseReturn,
        { orders, storeId: localStorage.getItem("selectedStoreId") },
        getAxiosConfig()
      );

      if (r.data.success) {
        setSuccessMessage("Purchase return created successfully!");
        setTimeout(() => resetAll(), 2000);
      } else {
        setError(r.data.message || "Failed to create purchase return");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create purchase return. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPurchaseOrders = purchaseOrders.filter((o) =>
    !searchInvoice ||
    o.invoice_number?.toLowerCase().includes(searchInvoice.toLowerCase()) ||
    o.batchId?.toLowerCase().includes(searchInvoice.toLowerCase())
  );

  const calculateTotals = () => {
    const valid  = returnItems.filter((i) => i.productId || i.id);
    const noOfItems = valid.length;
    const totalQty  = valid.reduce((s, i) => s + safeToNumber(returnQuantities[i.uniqueKey] || i.quantity_stock), 0);
    const totalAmount = valid.reduce((s, i) => {
      const qty  = safeToNumber(returnQuantities[i.uniqueKey] || i.quantity_stock);
      return s + qty * safeToNumber(i.purchase_rate);
    }, 0);
    const totalTax = valid.reduce((s, i) => {
      const qty    = safeToNumber(returnQuantities[i.uniqueKey] || i.quantity_stock);
      const origQty = safeToNumber(i.quantity_stock);
      const perUnit = origQty > 0 ? safeToNumber(i.total_tax) / origQty : 0;
      return s + qty * perUnit;
    }, 0);
    const totalChargesAmount = charges.reduce((s, c) => s + safeToNumber(c.total_amount), 0);
    return { noOfItems, totalQty, totalAmount, totalTax, totalChargesAmount, finalAmount: totalAmount + totalTax + totalChargesAmount };
  };

  const totals        = calculateTotals();
  const formatDate    = (d) => { try { return new Date(d).toLocaleDateString("en-IN"); } catch { return "N/A"; } };
  const formatTime    = (d) => { try { return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); } catch { return "N/A"; } };
  const getSupplierName = () => suppliers.find((s) => s.value === selectedSupplier)?.label || "N/A";
  const selectedSupplierOption = suppliers.find((s) => s.value === selectedSupplier) || null;
  const selectedReturnTypeOption = returnTypeOptions.find((o) => o.value === returnType) || null;

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="pms-root">
      <div className="pms-main-card">

        {/* ── Top Bar ─────────────────────────────────── */}
        <div className="pms-topbar">
          <div>
            <h1 className="pms-title">Purchase Returns</h1>
            <nav className="pms-breadcrumb">
              <Link to="/">Dashboard</Link>
              <span>/</span>
              <span>Purchase Returns</span>
            </nav>
          </div>
          <div className="pms-top-actions">
            <button type="button" className="pms-btn pms-btn-warning" onClick={resetAll}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>

        {/* ── Alerts ──────────────────────────────────── */}
        {successMessage && (
          <div className="pms-alert-success" role="alert">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle size={16} /> {successMessage}
            </span>
            <button className="pms-modal-close" onClick={() => setSuccessMessage(null)}>×</button>
          </div>
        )}
        {error && (
          <div className="pms-alert" role="alert">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={16} /> {error}
            </span>
            <button className="pms-alert-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* ── Header Form ─────────────────────────────── */}
        <div className="pms-section-card pms-search-section">
          <div className="pms-grid pms-grid-6" style={{ alignItems: "flex-end" }}>

            {/* Supplier */}
            <div className="pms-col-3">
              <label className="pms-field-label">
                Return to Supplier <span className="pms-required">*</span>
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Select
                    styles={selectStyles}
                    options={suppliers}
                    value={selectedSupplierOption}
                    onChange={handleSupplierChange}
                    placeholder={isLoadingSuppliers ? "Loading suppliers..." : "Select Supplier"}
                    isDisabled={isLoadingSuppliers}
                    isSearchable
                  />
                </div>
                <button
                  type="button"
                  className="pms-btn pms-btn-add"
                  style={{ padding: "10px 14px", flexShrink: 0 }}
                  onClick={() => setShowSupplierModal(true)}
                  title="Add New Supplier"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Return Type */}
            <div className="pms-col-2">
              <label className="pms-field-label">
                Return Type <span className="pms-required">*</span>
              </label>
              <Select
                styles={selectStyles}
                options={returnTypeOptions}
                value={selectedReturnTypeOption}
                onChange={handleReturnTypeChange}
                placeholder="Select Type"
                isDisabled={!selectedSupplier}
              />
            </div>

            {/* Invoice Search - bill wise only */}
            {returnType === "billWise" && (
              <div className="pms-col-3">
                <label className="pms-field-label">Search Purchase Invoice</label>
                <div className="pms-search-group" style={{ minHeight: 44 }}>
                  <Search size={16} className="pms-search-icon" />
                  <input
                    type="text"
                    className="pms-search-input"
                    placeholder="Search invoice or batch ID..."
                    value={searchInvoice}
                    onChange={(e) => setSearchInvoice(e.target.value)}
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ══ BILL WISE ════════════════════════════════════ */}
        {returnType === "billWise" && (
          <>
            {/* Purchase Orders Table */}
            <div className="pms-section-card">
              <div className="pms-section-head">
                <h2 className="pms-section-title">
                  <span className="pms-header-icon pms-header-icon-blue"><ShoppingBag size={16} /></span>
                  Purchase Orders
                </h2>
                {loading && <div className="pms-loader-inline" />}
              </div>

              <div className="pms-table-wrapper">
                <table className="pms-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          className="pms-checkbox"
                          checked={selectAllPurchases}
                          onChange={handleSelectAllPurchases}
                        />
                      </th>
                      <th>#</th>
                      <th>Operator</th>
                      <th>Supplier</th>
                      <th className="pms-center">Purchase ID</th>
                      <th className="pms-center">Reference ID</th>
                      <th>Invoice No.</th>
                      <th className="pms-center">Purchase Date</th>
                      <th className="pms-center">Time</th>
                      <th className="pms-center">Pur.Qty</th>
                      <th className="pms-center">Avl.Qty</th>
                      <th className="pms-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="12">
                          <div className="pms-loader-center">
                            <div className="pms-loader-inline" style={{ width: 32, height: 32 }} />
                            <span className="pms-note">Loading purchase orders...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredPurchaseOrders.length > 0 ? (
                      filteredPurchaseOrders.map((order, index) => {
                        const purQty = order.products?.reduce((s, p) => s + safeToNumber(p.total_quantity || p.buying_quantity), 0) || 0;
                        const avlQty = order.products?.reduce((s, p) => s + safeToNumber(p.quantity_stock || p.buying_quantity), 0) || 0;
                        return (
                          <tr key={order.id}>
                            <td>
                              <input
                                type="checkbox"
                                className="pms-checkbox"
                                checked={selectedPurchaseIds.includes(order.id)}
                                onChange={() => handlePurchaseSelect(order.id)}
                              />
                            </td>
                            <td><span className="pms-sno">{index + 1}</span></td>
                            <td>{order.vendorName || "N/A"}</td>
                            <td>
                              <div className="pms-product-name">{getSupplierName()}</div>
                            </td>
                            <td className="pms-center">
                              <span className="pms-chip">{order.id}</span>
                            </td>
                            <td className="pms-center">
                              <span className="pms-chip">{order.batchId}</span>
                            </td>
                            <td>{order.invoice_number}</td>
                            <td className="pms-center">{formatDate(order.purchase_date)}</td>
                            <td className="pms-center">{formatTime(order.logCreatedDate)}</td>
                            <td className="pms-center">
                              <span className="pms-count-badge">{purQty}</span>
                            </td>
                            <td className="pms-center">
                              <span className="pms-badge pms-badge-success">{avlQty}</span>
                            </td>
                            <td className="pms-center">
                              <button
                                type="button"
                                className="pms-action-icon pms-action-edit"
                                title="View Items"
                                onClick={() => {
                                  setSelectedPurchaseIds([order.id]);
                                  setTimeout(() => handleProceed(), 0);
                                }}
                              >
                                <Eye size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="12">
                          <div className="pms-empty">
                            <div className="pms-empty-icon"><ShoppingBag size={44} /></div>
                            <div className="pms-empty-title">
                              {selectedSupplier ? "No purchase orders found for this supplier" : "Select a supplier to view purchase orders"}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredPurchaseOrders.length > 0 && (
                <div className="pms-proceed-bar">
                  <button
                    type="button"
                    className="pms-btn pms-btn-add"
                    onClick={handleProceed}
                    disabled={selectedPurchaseIds.length === 0}
                  >
                    <ArrowRight size={15} /> Proceed ({selectedPurchaseIds.length} selected)
                  </button>
                </div>
              )}
            </div>

            {/* Selected Purchase Items */}
            {selectedPurchaseItems.length > 0 && (
              <div className="pms-section-card pms-search-section">
                <div className="pms-section-head">
                  <h2 className="pms-section-title">
                    <span className="pms-header-icon pms-header-icon-green"><Search size={16} /></span>
                    Purchase Return — Search Items
                  </h2>
                  <span className="pms-count-badge">{selectedPurchaseItems.length} item(s)</span>
                </div>

                <div className="pms-search-wrap" style={{ marginBottom: 16 }}>
                  <div className="pms-search-group">
                    <Search size={16} className="pms-search-icon" />
                    <input
                      type="text"
                      className="pms-search-input"
                      placeholder="Filter by item name or invoice..."
                      value={itemSearchQuery}
                      onChange={(e) => setItemSearchQuery(e.target.value)}
                    />
                    {loadingItemSearch && <div className="pms-loader-inline" />}
                  </div>
                </div>

                <div className="pms-table-wrapper">
                  <table className="pms-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>
                          <input
                            type="checkbox"
                            className="pms-checkbox"
                            checked={selectAllItems}
                            onChange={handleSelectAllItems}
                          />
                        </th>
                        <th>Supplier</th>
                        <th className="pms-center">Pur.ID</th>
                        <th className="pms-center">Ref.ID</th>
                        <th>Inv.No</th>
                        <th className="pms-center">Pur.Date</th>
                        <th>Barcode</th>
                        <th>Item Name</th>
                        <th>Brand</th>
                        <th className="pms-center">Size</th>
                        <th className="pms-center">Colour</th>
                        <th className="pms-center">Style</th>
                        <th className="pms-center">Pur.Qty</th>
                        <th className="pms-center">Avl.Qty</th>
                        <th className="pms-right">MRP</th>
                        <th className="pms-right">Rate</th>
                        <th className="pms-right">WP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPurchaseItems
                        .filter((item) =>
                          !itemSearchQuery ||
                          item.item_name?.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
                          item.invoiceNo?.toLowerCase().includes(itemSearchQuery.toLowerCase())
                        )
                        .map((item, index) => (
                          <tr
                            key={item.uniqueKey || index}
                            className={selectedItemIds.includes(index) ? "pms-row-selected" : ""}
                          >
                            <td>
                              <input
                                type="checkbox"
                                className="pms-checkbox"
                                checked={selectedItemIds.includes(index)}
                                onChange={() => handleItemSelect(index)}
                              />
                            </td>
                            <td>{item.supplier}</td>
                            <td className="pms-center"><span className="pms-chip">{item.purchaseId || item.purchaseOrderId}</span></td>
                            <td className="pms-center"><span className="pms-chip">{item.refId}</span></td>
                            <td>{item.invoiceNo}</td>
                            <td className="pms-center">{formatDate(item.purchaseDate)}</td>
                            <td><span className="pms-note">{item.barcode || "—"}</span></td>
                            <td><div className="pms-product-name">{item.item_name}</div></td>
                            <td>{item.brandId || "—"}</td>
                            <td className="pms-center"><span className="pms-chip">{item.sizeId || "—"}</span></td>
                            <td className="pms-center">{item.colourId || "—"}</td>
                            <td className="pms-center">{item.styleId || "—"}</td>
                            <td className="pms-center"><span className="pms-count-badge">{item.total_quantity}</span></td>
                            <td className="pms-center"><span className="pms-badge pms-badge-success">{item.quantity_stock}</span></td>
                            <td className="pms-right"><div className="pms-amount">₹{formatNumber(item.mrp)}</div></td>
                            <td className="pms-right"><div className="pms-amount">₹{formatNumber(item.purchase_rate)}</div></td>
                            <td className="pms-right"><div className="pms-amount">₹{formatNumber(item.wholesale_price)}</div></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="pms-proceed-bar">
                  <button
                    type="button"
                    className="pms-btn pms-btn-add"
                    disabled={selectedItemIds.length === 0}
                    onClick={() => {
                      const items = selectedPurchaseItems
                        .filter((_, idx) => selectedItemIds.includes(idx))
                        .filter((i) => i.productId || i.id);
                      setReturnItems(items);
                    }}
                  >
                    <ArrowRight size={15} /> Proceed with {selectedItemIds.length} item(s)
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══ ITEM WISE ════════════════════════════════════ */}
        {returnType === "itemWise" && (
          <>
            {/* Item Search */}
            <div className="pms-section-card pms-search-section">
              <div className="pms-section-head">
                <h2 className="pms-section-title">
                  <span className="pms-header-icon pms-header-icon-green"><Search size={16} /></span>
                  Search Item to Return
                </h2>
              </div>
              <div className="pms-search-wrap">
                <div className="pms-search-group">
                  <Search size={18} className="pms-search-icon" />
                  <input
                    type="text"
                    className="pms-search-input"
                    placeholder="Search by item name, barcode..."
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                  />
                  {loadingItemSearch && <div className="pms-loader-inline" />}
                </div>
              </div>
            </div>

            {/* Accumulated Items */}
            {accumulatedItems.length > 0 && (
              <div className="pms-section-card">
                <div className="pms-accum-head">
                  <div className="pms-accum-title">
                    <CheckCircle size={15} />
                    Selected Items ({accumulatedItems.length})
                  </div>
                  <button type="button" className="pms-btn pms-btn-warning" style={{ padding: "7px 14px" }} onClick={clearAccumulated}>
                    <Trash2 size={13} /> Clear All
                  </button>
                </div>

                <div className="pms-table-scroll">
                  <table className="pms-table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th className="pms-center">Invoice No</th>
                        <th className="pms-center">Pur.ID</th>
                        <th className="pms-center">Avl.Qty</th>
                        <th className="pms-right">Rate</th>
                        <th className="pms-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accumulatedItems.map((item) => (
                        <tr key={item.uniqueKey}>
                          <td>
                            <div className="pms-product-name">{item.item_name}</div>
                            {(!item.productId && !item.id) && <div className="pms-id-warn">⚠ No Product ID</div>}
                          </td>
                          <td className="pms-center">{item.invoiceNo}</td>
                          <td className="pms-center"><span className="pms-chip">{item.purchaseOrderId}</span></td>
                          <td className="pms-center"><span className="pms-badge pms-badge-success">{item.quantity_stock}</span></td>
                          <td className="pms-right"><div className="pms-amount">₹{formatNumber(item.purchase_rate)}</div></td>
                          <td className="pms-center">
                            <button
                              type="button"
                              className="pms-action-icon pms-action-delete"
                              onClick={() => removeFromAccumulated(item.uniqueKey)}
                              aria-label="Remove"
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Item Wise Results */}
            {loadingItemSearch ? (
              <div className="pms-section-card">
                <div className="pms-loader-center" style={{ padding: "32px 0" }}>
                  <div className="pms-loader-inline" style={{ width: 32, height: 32 }} />
                  <span className="pms-note">Searching for items...</span>
                </div>
              </div>
            ) : itemWiseResults.length > 0 ? (
              <div className="pms-section-card">
                <div className="pms-section-head">
                  <h2 className="pms-section-title">
                    <span className="pms-header-icon pms-header-icon-blue"><Search size={16} /></span>
                    Search Results
                  </h2>
                  <div className="pms-result-note">{itemWiseResults.length} item(s) found</div>
                </div>

                <div className="pms-table-wrapper">
                  <table className="pms-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>
                          <input
                            type="checkbox"
                            className="pms-checkbox"
                            checked={areAllResultsSelected()}
                            onChange={handleSelectAllItemWise}
                          />
                        </th>
                        <th>Supplier</th>
                        <th className="pms-center">Pur.ID</th>
                        <th className="pms-center">Ref.ID</th>
                        <th>Inv.No</th>
                        <th className="pms-center">Pur.Date</th>
                        <th>Barcode</th>
                        <th>Item Name</th>
                        <th>Brand</th>
                        <th className="pms-center">Size</th>
                        <th className="pms-center">Colour</th>
                        <th className="pms-center">Style</th>
                        <th className="pms-center">Pur.Qty</th>
                        <th className="pms-center">Avl.Qty</th>
                        <th className="pms-right">MRP</th>
                        <th className="pms-right">Rate</th>
                        <th className="pms-right">WP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemWiseResults.map((item) => {
                        const hasId = item.productId || item.id;
                        return (
                          <tr
                            key={item.uniqueKey}
                            className={
                              isItemSelected(item.uniqueKey)
                                ? "pms-row-selected"
                                : !hasId
                                ? "pms-row-disabled"
                                : ""
                            }
                          >
                            <td>
                              <input
                                type="checkbox"
                                className="pms-checkbox"
                                checked={isItemSelected(item.uniqueKey)}
                                onChange={() => handleItemWiseSelect(item)}
                                disabled={!hasId}
                              />
                            </td>
                            <td>{item.supplierName}</td>
                            <td className="pms-center"><span className="pms-chip">{item.purchaseOrderId}</span></td>
                            <td className="pms-center"><span className="pms-chip">{item.batchId}</span></td>
                            <td>{item.invoiceNo}</td>
                            <td className="pms-center">{formatDate(item.purchaseDate)}</td>
                            <td><span className="pms-note">{item.barcode || "—"}</span></td>
                            <td>
                              <div className="pms-product-name">{item.item_name}</div>
                              {!hasId && <div className="pms-id-warn">⚠ Missing Product ID</div>}
                            </td>
                            <td>{item.brandId || "—"}</td>
                            <td className="pms-center"><span className="pms-chip">{item.sizeId || "—"}</span></td>
                            <td className="pms-center">{item.colourId || "—"}</td>
                            <td className="pms-center">{item.styleId || "—"}</td>
                            <td className="pms-center"><span className="pms-count-badge">{item.total_quantity}</span></td>
                            <td className="pms-center"><span className="pms-badge pms-badge-success">{item.quantity_stock}</span></td>
                            <td className="pms-right"><div className="pms-amount">₹{formatNumber(item.mrp)}</div></td>
                            <td className="pms-right"><div className="pms-amount">₹{formatNumber(item.purchase_rate)}</div></td>
                            <td className="pms-right"><div className="pms-amount">₹{formatNumber(item.wholesale_price)}</div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pms-proceed-bar">
                  <button
                    type="button"
                    className="pms-btn pms-btn-add"
                    onClick={handleItemWiseProceed}
                    disabled={accumulatedItems.length === 0}
                  >
                    <ArrowRight size={15} /> Proceed ({accumulatedItems.length} items selected)
                  </button>
                </div>
              </div>
            ) : itemSearchQuery ? (
              <div className="pms-section-card">
                <div className="pms-empty">
                  <div className="pms-empty-icon"><Search size={44} /></div>
                  <div className="pms-empty-title">No Items Found</div>
                  <div className="pms-empty-text">No purchase items found for "{itemSearchQuery}"</div>
                </div>
              </div>
            ) : (
              <div className="pms-section-card">
                <div className="pms-empty">
                  <div className="pms-empty-icon"><Search size={44} /></div>
                  <div className="pms-empty-title">Search for Items</div>
                  <div className="pms-empty-text">Enter an item name or barcode to begin</div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══ CHARGES ══════════════════════════════════════ */}
        {charges.length > 0 && (
          <div className="pms-section-card">
            <div className="pms-section-head">
              <h2 className="pms-section-title">
                <span className="pms-header-icon pms-header-icon-yellow"><CreditCard size={16} /></span>
                Additional Charges
              </h2>
              <span className="pms-count-badge">{charges.length} charge(s)</span>
            </div>
            <div className="pms-charges-grid">
              {charges.map((charge) => (
                <div className="pms-charge-card" key={charge.id}>
                  <div>
                    <div className="pms-charge-name">
                      {chargeNameOptions.find((o) => o.value === charge.charges_name)?.label || "Charge"}
                    </div>
                    <div className="pms-charge-meta">Amount: ₹{formatNumber(charge.amount)}</div>
                    <div className="pms-charge-meta">Tax: {charge.gst_rate}% — ₹{formatNumber(charge.gst_amount)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="pms-amount">₹{formatNumber(charge.total_amount)}</div>
                    <button type="button" className="pms-remove-link" onClick={() => removeCharge(charge.id)}>REMOVE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ RETURN ITEMS TABLE ═══════════════════════════ */}
        {returnItems.length > 0 && (
          <>
            <div className="pms-section-card">
              <div className="pms-section-head">
                <h2 className="pms-section-title">
                  <span className="pms-header-icon pms-header-icon-red"><RotateCcw size={16} /></span>
                  Items Selected for Return
                </h2>
                <span className="pms-count-badge">{returnItems.length} item(s)</span>
              </div>

              <div className="pms-table-wrapper">
                <table className="pms-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Barcode</th>
                      <th>Item Name</th>
                      <th className="pms-center">HSN</th>
                      <th className="pms-center">GST%</th>
                      <th className="pms-center">Product ID</th>
                      <th className="pms-center">PO ID</th>
                      <th>Brand</th>
                      <th className="pms-center">Size</th>
                      <th className="pms-center">Colour</th>
                      <th className="pms-center">Avl.Qty</th>
                      <th className="pms-center">Return Qty</th>
                      <th className="pms-right">Rate</th>
                      <th className="pms-right">Amount</th>
                      <th className="pms-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.map((item, index) => {
                      const returnQty = returnQuantities[item.uniqueKey] || item.quantity_stock;
                      const amount    = returnQty * safeToNumber(item.purchase_rate);
                      const productId = item.productId || item.id;
                      return (
                        <tr key={item.uniqueKey || index}>
                          <td><span className="pms-sno">{index + 1}</span></td>
                          <td>{item.barcode || "—"}</td>
                          <td>
                            <div className="pms-product-name">{item.item_name}</div>
                            <div className="pms-item-sub">
                              PO: {item.purchaseOrderId || item.purchaseId} · Inv: {item.invoiceNo}
                            </div>
                          </td>
                          <td className="pms-center"><span className="pms-chip">{item.hsn_code || "—"}</span></td>
                          <td className="pms-center"><span className="pms-badge pms-badge-success">{item.gstId || 0}%</span></td>
                          <td className="pms-center"><span className="pms-chip">{productId || "N/A"}</span></td>
                          <td className="pms-center"><span className="pms-chip">{item.purchaseOrderId || item.purchaseId}</span></td>
                          <td>{item.brandId || "—"}</td>
                          <td className="pms-center"><span className="pms-chip">{item.sizeId || "—"}</span></td>
                          <td className="pms-center">{item.colourId || "—"}</td>
                          <td className="pms-center">
                            <span className="pms-badge pms-badge-info">{item.quantity_stock}</span>
                          </td>
                          <td className="pms-center">
                            <input
                              type="number"
                              className="pms-edit-input"
                              style={{ minWidth: 72, textAlign: "center" }}
                              value={returnQty}
                              min="1"
                              max={item.quantity_stock}
                              onChange={(e) => handleReturnQuantityChange(item.uniqueKey, e.target.value, item.quantity_stock)}
                            />
                          </td>
                          <td className="pms-right"><div className="pms-amount">₹{formatNumber(item.purchase_rate)}</div></td>
                          <td className="pms-right">
                            <div className="pms-amount" style={{ color: "#059669" }}>₹{formatNumber(amount)}</div>
                          </td>
                          <td className="pms-center">
                            <button
                              type="button"
                              className="pms-action-icon pms-action-delete"
                              onClick={() => removeFromReturnItems(index, item.uniqueKey)}
                              aria-label={`Remove ${item.item_name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Footer ──────────────────────────────── */}
            <div className="pms-footer-grid">
              <div>
                <div className="pms-totals-bar">
                  <div className="pms-totals-bar-item"><span>Items</span><strong>{totals.noOfItems}</strong></div>
                  <div className="pms-totals-bar-item"><span>Total Qty</span><strong>{formatNumber(totals.totalQty)}</strong></div>
                  <div className="pms-totals-bar-item"><span>Amount</span><strong>₹{formatNumber(totals.totalAmount)}</strong></div>
                  <div className="pms-totals-bar-item"><span>Tax</span><strong>₹{formatNumber(totals.totalTax)}</strong></div>
                  {charges.length > 0 && (
                    <div className="pms-totals-bar-item"><span>Charges</span><strong>₹{formatNumber(totals.totalChargesAmount)}</strong></div>
                  )}
                </div>
                <div className="pms-action-bar">
                  <button
                    type="button"
                    className="pms-btn pms-btn-soft"
                    onClick={() => setShowChargesModal(true)}
                    disabled={isSaving}
                  >
                    <CreditCard size={15} /> Add Charges
                  </button>
                </div>
              </div>

              <div className="pms-summary-box">
                <div className="pms-summary-row"><span>Subtotal</span><strong>₹{formatNumber(totals.totalAmount)}</strong></div>
                <div className="pms-summary-row"><span>Total Tax</span><strong>₹{formatNumber(totals.totalTax)}</strong></div>
                {totals.totalChargesAmount > 0 && (
                  <div className="pms-summary-row"><span>Charges</span><strong>₹{formatNumber(totals.totalChargesAmount)}</strong></div>
                )}
                <div className="pms-summary-total">
                  <span>Final Amount</span>
                  <span>₹{formatNumber(totals.finalAmount)}</span>
                </div>
                <div className="pms-button-row">
                  <button
                    type="button"
                    className="pms-btn pms-btn-add"
                    onClick={handleSaveReturn}
                    disabled={isSaving || !returnItems.length}
                  >
                    {isSaving
                      ? <><div className="pms-loader-inline" /> Saving...</>
                      : <><Save size={15} /> Save Return</>}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Modals ────────────────────────────────────── */}
        {showSupplierModal && (
          <SupplierFormModal
            onClose={() => setShowSupplierModal(false)}
            onSuccess={handleSupplierAdded}
          />
        )}
        {showChargesModal && (
          <AddChargesModal
            onClose={() => setShowChargesModal(false)}
            onAdd={handleAddCharge}
            chargeNameOptions={chargeNameOptions}
            gstTypeChargesOptions={gstTypeChargesOptions}
            storeOptions={storeOptions}
          />
        )}

      </div>
    </div>
  );
};

export default PurchaseReturns;