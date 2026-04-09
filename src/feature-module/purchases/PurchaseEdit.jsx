import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import { URLS } from "../../Urls";
import axios from "axios";
import AddProductModal from "../setup/master/AllMaster/AddProductModal";
import {
  Plus,
  Search,
  Trash2,
  Save,
  Edit,
  RefreshCw,
  X,
  CreditCard,
  List,
  ShoppingCart,
} from "react-feather";

import "./Purchase.css";

// ── React-Select Styles (reused from NewPurchase) ──────────
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
      const amt     = parseFloat(field === "amount"    ? value : updated.amount)    || 0;
      const gstRate = parseFloat(field === "gst_rate"  ? value : updated.gst_rate)  || 0;
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

  const formatNumber = (v) => (Number(v) || 0).toFixed(2);

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
                <div className="pms-select-shell">
                  <Select
                    styles={selectStyles}
                    options={storeOptions}
                    value={storeOptions.find((o) => o.value === formData.storeId)}
                    onChange={(o) => handleChange("storeId", o.value)}
                  />
                </div>
              </div>

              <div className="pms-col-3">
                <label className="pms-field-label">Charge Type <span className="pms-required">*</span></label>
                <div className="pms-select-shell">
                  <Select
                    styles={selectStyles}
                    options={chargeNameOptions}
                    value={chargeNameOptions.find((o) => o.value === formData.charges_name) || null}
                    onChange={(o) => handleChange("charges_name", o.value)}
                    placeholder="Select Charge"
                  />
                </div>
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
                <div className="pms-select-shell">
                  <Select
                    styles={selectStyles}
                    options={[
                      { value: 0,  label: "0%"  },
                      { value: 5,  label: "5%"  },
                      { value: 12, label: "12%" },
                      { value: 18, label: "18%" },
                      { value: 28, label: "28%" },
                    ]}
                    value={{ value: formData.gst_rate, label: `${formData.gst_rate}%` }}
                    onChange={(o) => handleChange("gst_rate", o.value)}
                  />
                </div>
              </div>

              <div className="pms-col-3">
                <label className="pms-field-label">GST Type</label>
                <div className="pms-select-shell">
                  <Select
                    styles={selectStyles}
                    options={gstTypeChargesOptions}
                    value={gstTypeChargesOptions.find((o) => o.value === formData.gst_type)}
                    onChange={(o) => handleChange("gst_type", o.value)}
                  />
                </div>
              </div>

              <div className="pms-col-3">
                <label className="pms-field-label">GST Amount</label>
                <div className="pms-field-group">
                  <input
                    type="text"
                    className="pms-field-input"
                    value={`₹${formatNumber(formData.gst_amount)}`}
                    readOnly
                  />
                </div>
              </div>

              <div className="pms-col-6">
                <div className="pms-soft-card">
                  <div className="pms-summary-total" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
                    <span>Total Amount (incl. GST)</span>
                    <span style={{ fontSize: "22px" }}>₹{formatNumber(formData.total_amount)}</span>
                  </div>
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
const PurchaseEdit = () => {
  const [gstType, setGstType]               = useState("nonGST");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [purchaseDate, setPurchaseDate]     = useState("");
  const [creditDueDate, setCreditDueDate]   = useState("");
  const [creditDueDays, setCreditDueDays]   = useState("");
  const [invoiceNumber, setInvoiceNumber]   = useState("");
  const [selectedStore, setSelectedStore]   = useState("store1");

  const [purchasesList, setPurchasesList]   = useState([]);
  const [purchaseItems, setPurchaseItems]   = useState([]);
  const [charges, setCharges]               = useState([]);
  const [suppliers, setSuppliers]           = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [searchQuery, setSearchQuery]       = useState("");
  const [searchResults, setSearchResults]   = useState([]);
  const [isSearching, setIsSearching]       = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showChargesModal, setShowChargesModal] = useState(false);

  const [isLoadingPurchases, setIsLoadingPurchases]           = useState(false);
  const [isLoadingPurchaseDetails, setIsLoadingPurchaseDetails] = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [error, setError]                   = useState(null);

  const gstOptions = [
    { value: "nonGST",    label: "Non GST"        },
    { value: "Inclusive", label: "GST Inclusive"   },
    { value: "Exclusive", label: "GST Exclusive"   },
    { value: "INTRA",     label: "INTRA"           },
    { value: "INTER",     label: "INTER"           },
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

  const safeToNumber = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const formatNumber = (value) => safeToNumber(value).toFixed(2);

  const fetchAllPurchases = async () => {
    setIsLoadingPurchases(true);
    setError(null);
    try {
      const config = getAxiosConfig();
      const response = await axios.post(URLS.GetAllPurchases, {}, config);
      if (response.data.success) setPurchasesList(response.data.data || []);
      else setError("Failed to fetch purchases");
    } catch (err) {
      setError("Failed to load purchases. Please try again.");
    } finally {
      setIsLoadingPurchases(false);
    }
  };

  const fetchPurchaseById = async (purchaseId) => {
    setIsLoadingPurchaseDetails(true);
    setError(null);
    try {
      const config = getAxiosConfig();
      const response = await axios.post(URLS.GetPurchseById, { id: purchaseId }, config);
      if (response.data.success) {
        setSelectedPurchase(response.data.data);
        loadPurchaseIntoForm(response.data.data);
      } else {
        setError("Failed to fetch purchase details");
      }
    } catch (err) {
      setError("Failed to load purchase details. Please try again.");
    } finally {
      setIsLoadingPurchaseDetails(false);
    }
  };

  const loadPurchaseIntoForm = (purchase) => {
    setSelectedSupplier(purchase.supplierId);
    setGstType(purchase.gst_type);
    setPurchaseDate(purchase.purchase_date);
    setCreditDueDate(purchase.credit_due_date);
    setCreditDueDays(purchase.credit_due_date_days);
    setInvoiceNumber(purchase.invoice_number || "");

    if (purchase.products?.length) {
      setPurchaseItems(purchase.products.map((p, i) => ({
        id: Date.now() + i,
        productId:       p.id || 0,
        barcode:         p.barcode || "N/A",
        item_name:       p.item_name,
        hsn_code:        p.hsn_code || "",
        gstId:           safeToNumber(p.gstId),
        gst:             safeToNumber(p.gst),
        brandId:         safeToNumber(p.brandId),
        brand:           p.brand || "N/A",
        sizeId:          safeToNumber(p.sizeId),
        size:            p.size || "N/A",
        colourId:        safeToNumber(p.colourId),
        colour:          p.colour || "N/A",
        styleId:         safeToNumber(p.styleId),
        style:           p.style || "N/A",
        quantity_stock:  safeToNumber(p.quantity_stock),
        total_quantity:  safeToNumber(p.total_quantity),
        total_tax:       safeToNumber(p.total_tax),
        mrp:             safeToNumber(p.mrp),
        purchase_rate:   safeToNumber(p.purchase_rate),
        wholesale_price: safeToNumber(p.wholesale_price),
      })));
    } else {
      setPurchaseItems([]);
    }

    if (purchase.charges?.length) {
      setCharges(purchase.charges.map((c, i) => ({
        id:           Date.now() + i,
        storeId:      safeToNumber(c.storeId),
        charges_name: safeToNumber(c.charges_name),
        gst_rate:     safeToNumber(c.gst_rate),
        gst_type:     safeToNumber(c.gst_type),
        amount:       safeToNumber(c.amount),
        gst_amount:   safeToNumber(c.gst_amount),
        total_amount: safeToNumber(c.total_amount),
        tax_rate:     safeToNumber(c.tax_rate),
      })));
    } else {
      setCharges([]);
    }

    setSearchQuery("");
    setSearchResults([]);
  };

  const fetchSuppliers = async () => {
    try {
      const config = getAxiosConfig();
      const response = await axios.post(URLS.GetSuppliers, {}, config);
      if (response.data.success) {
        setSuppliers(response.data.data.map((s) => ({
          value: s.id, label: s.name, companyName: s.companyName,
        })));
      }
    } catch (err) {}
  };

  const searchProducts = async (query) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const config = getAxiosConfig();
      const response = await axios.post(
        `${URLS.SearchByStore}?searchQuery=${encodeURIComponent(query)}`, {}, config
      );
      setSearchResults(response.data.success ? response.data.data || [] : []);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim() && selectedPurchase) searchProducts(searchQuery);
      else setSearchResults([]);
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const addProductToPurchase = (product) => {
    setPurchaseItems([...purchaseItems, {
      id:              Date.now(),
      productId:       product.id,
      barcode:         product.barcode || "N/A",
      item_name:       product.name,
      hsn_code:        product.hsnsacId || "",
      gstId:           safeToNumber(product.gst_percentage),
      gst:             safeToNumber(product.gst_percentage),
      brandId:         safeToNumber(product.brandId),
      brand:           product.brandName || "N/A",
      sizeId:          safeToNumber(product.sizeId),
      size:            product.sizeName || "N/A",
      colourId:        safeToNumber(product.colourId),
      colour:          product.colourName || "N/A",
      styleId:         safeToNumber(product.styleId),
      style:           product.styleName || "N/A",
      quantity_stock:  1,
      total_quantity:  1,
      total_tax:       0,
      mrp:             safeToNumber(product.mrp),
      purchase_rate:   safeToNumber(product.purchase_price),
      wholesale_price: safeToNumber(product.wholesale_price),
    }]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleProductAdded = (newProduct) => {
    addProductToPurchase(newProduct);
    setShowProductModal(false);
  };

  const handleEditPurchase = (purchase) => fetchPurchaseById(purchase.id);

  const handleAddCharge = (chargeData) => {
    setCharges([...charges, { ...chargeData, id: Date.now() }]);
    setShowChargesModal(false);
  };

  const calculateTotals = () => {
    const noOfItems     = purchaseItems.length;
    const totalQty      = purchaseItems.reduce((s, i) => s + safeToNumber(i.total_quantity), 0);
    const taxableAmount = purchaseItems.reduce((s, i) => s + safeToNumber(i.purchase_rate) * safeToNumber(i.quantity_stock), 0);
    const taxAmount     = purchaseItems.reduce((s, i) => s + safeToNumber(i.total_tax), 0);
    const igst_amount   = gstType === "INTER"  ? taxAmount : 0;
    const cgst_amount   = gstType === "INTRA"  ? taxAmount / 2 : 0;
    const sgst_amount   = gstType === "INTRA"  ? taxAmount / 2 : 0;
    const total_charges_amount = charges.reduce((s, c) => s + safeToNumber(c.total_amount), 0);
    return { noOfItems, totalQty, taxableAmount, taxAmount, igst_amount, cgst_amount, sgst_amount, total_charges_amount };
  };

  const totals = calculateTotals();

  const calculatePurchaseTotal = (purchase) =>
    safeToNumber(purchase.taxable_amount) + safeToNumber(purchase.tax_amount) + safeToNumber(purchase.total_charges_amount);

  const handleUpdatePurchase = async () => {
    if (!selectedSupplier)     return alert("Please select a supplier");
    if (!purchaseDate)         return alert("Please select purchase date");
    if (!purchaseItems.length) return alert("Please add at least one product");
    if (!selectedPurchase)     return alert("No purchase selected for editing");

    setIsSubmitting(true);
    setError(null);
    try {
      const config = getAxiosConfig();
      const payload = {
        supplierId:           selectedSupplier,
        gst_type:             gstType,
        purchase_date:        purchaseDate,
        credit_due_date:      creditDueDate || purchaseDate,
        credit_due_date_days: creditDueDays || "0",
        invoice_number:       invoiceNumber,
        products: purchaseItems.map((item) => ({
          item_name:       item.item_name,
          hsn_code:        item.hsn_code || "",
          gstId:           String(item.gstId || 0),
          brandId:         String(item.brandId || 0),
          sizeId:          String(item.sizeId || 0),
          colourId:        String(item.colourId || 0),
          styleId:         String(item.styleId || 0),
          quantity_stock:  String(item.quantity_stock || 0),
          total_quantity:  String(item.total_quantity || 0),
          total_tax:       String(item.total_tax || 0),
          mrp:             String(item.mrp || 0),
          purchase_rate:   String(item.purchase_rate || 0),
          wholesale_price: String(item.wholesale_price || 0),
        })),
        charges: charges.map((c) => ({
          storeId: c.storeId, charges_name: c.charges_name, gst_rate: c.gst_rate,
          gst_type: c.gst_type, amount: c.amount, gst_amount: c.gst_amount,
          total_amount: c.total_amount, tax_rate: c.tax_rate,
        })),
        taxable_amount:       totals.taxableAmount,
        igst_amount:          totals.igst_amount,
        cgst_amount:          totals.cgst_amount,
        sgst_amount:          totals.sgst_amount,
        tax_amount:           totals.taxAmount,
        total_charges_amount: totals.total_charges_amount,
        isDraft:              false,
        storeId:              localStorage.getItem("selectedStoreId"),
      };

      const response = await axios.put(`${URLS.PurchaseEdit}/${selectedPurchase.id}`, payload, config);
      if (response.data.success) {
        alert("Purchase order updated successfully!");
        fetchAllPurchases();
      } else {
        alert("Failed to update purchase order");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(`Failed to update purchase order: ${msg}`);
      alert(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeItem   = (id) => setPurchaseItems(purchaseItems.filter((i) => i.id !== id));
  const removeCharge = (id) => setCharges(charges.filter((c) => c.id !== id));

  const updateItemQuantity = (itemId, field, value) => {
    setPurchaseItems(purchaseItems.map((item) => {
      if (item.id !== itemId) return item;
      const updated = { ...item, [field]: safeToNumber(value) };
      if (["quantity_stock", "purchase_rate", "gst"].includes(field)) {
        const total = safeToNumber(updated.quantity_stock) * safeToNumber(updated.purchase_rate);
        updated.total_tax      = (total * safeToNumber(updated.gst)) / 100;
        updated.total_quantity = updated.quantity_stock;
      }
      return updated;
    }));
  };

  const resetForm = () => {
    setSelectedPurchase(null);
    setSelectedSupplier(null);
    setGstType("nonGST");
    setPurchaseDate("");
    setCreditDueDate("");
    setCreditDueDays("");
    setInvoiceNumber("");
    setPurchaseItems([]);
    setCharges([]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-GB"); } catch { return d; }
  };

  const getStatusClass = (purchase) => {
    if (purchase.isDraft) return "pms-badge pms-badge-warning";
    switch (purchase.status) {
      case "return":    return "pms-badge pms-badge-danger";
      case "completed": return "pms-badge pms-badge-success";
      default:          return "pms-badge pms-badge-info";
    }
  };

  const getStatusText = (purchase) => {
    if (purchase.isDraft) return "Draft";
    switch (purchase.status) {
      case "return":    return "Return";
      case "completed": return "Completed";
      default:          return "Active";
    }
  };

  const selectedSupplierOption = suppliers.find((s) => s.value === selectedSupplier) || null;

  useEffect(() => {
    fetchAllPurchases();
    fetchSuppliers();
  }, []);

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="pms-root">
      <div className="pms-main-card">

        {/* Error Alert */}
        {error && (
          <div className="pms-alert" role="alert">
            <span>{error}</span>
            <button type="button" className="pms-alert-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* ── Purchases List ───────────────────────────── */}
        <div className="pms-section-card">
          <div className="pms-section-head">
            <h2 className="pms-section-title">
              <span className="pms-header-icon pms-header-icon-blue">
                <List size={16} />
              </span>
              Purchase Orders
            </h2>
            <button
              type="button"
              className="pms-btn pms-btn-soft"
              onClick={fetchAllPurchases}
              disabled={isLoadingPurchases}
            >
              {isLoadingPurchases
                ? <><div className="pms-loader-inline" /> Loading...</>
                : <><RefreshCw size={14} /> Refresh</>}
            </button>
          </div>

          <div className="pms-table-wrapper">
            <table className="pms-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Batch ID</th>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th className="pms-center">Total Items</th>
                  <th className="pms-right">Total Amount</th>
                  <th className="pms-center">Status</th>
                  <th className="pms-center">Edit</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingPurchases ? (
                  <tr>
                    <td colSpan="9">
                      <div className="pms-loader-center">
                        <div className="pms-loader-inline" style={{ width: 32, height: 32 }} />
                        <span className="pms-note">Loading purchases...</span>
                      </div>
                    </td>
                  </tr>
                ) : purchasesList.length > 0 ? (
                  purchasesList.map((purchase, index) => (
                    <tr key={purchase.id}>
                      <td><span className="pms-sno">{index + 1}</span></td>
                      <td>
                        <span className="pms-chip">{purchase.batchId}</span>
                      </td>
                      <td>{purchase.invoice_number || "—"}</td>
                      <td>{formatDate(purchase.purchase_date)}</td>
                      <td>
                        <div className="pms-product-name">{purchase.vendorName}</div>
                      </td>
                      <td className="pms-center">
                        <span className="pms-count-badge">{purchase.products?.length || 0} items</span>
                      </td>
                      <td className="pms-right">
                        <div className="pms-amount">₹{formatNumber(calculatePurchaseTotal(purchase))}</div>
                      </td>
                      <td className="pms-center">
                        <span className={getStatusClass(purchase)}>
                          {getStatusText(purchase)}
                        </span>
                      </td>
                      <td className="pms-center">
                        <button
                          type="button"
                          className="pms-action-icon pms-action-edit"
                          onClick={() => handleEditPurchase(purchase)}
                          disabled={isLoadingPurchaseDetails}
                          title="Edit Purchase"
                          aria-label="Edit Purchase"
                        >
                          {isLoadingPurchaseDetails && selectedPurchase?.id === purchase.id
                            ? <div className="pms-loader-inline" />
                            : <Edit size={15} />}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9">
                      <div className="pms-empty">
                        <div className="pms-empty-icon"><ShoppingCart size={44} /></div>
                        <div className="pms-empty-title">No Purchases Found</div>
                        <div className="pms-empty-text">There are no purchase orders available.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Edit Form (shown only when a purchase is selected) ── */}
        {selectedPurchase && (
          <>
            {/* Editing Banner */}
            <div className="pms-edit-banner">
              <div className="pms-edit-banner-title">
                <span className="pms-header-icon pms-header-icon-blue"><Edit size={15} /></span>
                Editing Purchase: <span className="pms-chip" style={{ marginLeft: 4 }}>{selectedPurchase.batchId}</span>
                {selectedPurchase.invoice_number && (
                  <span className="pms-note" style={{ marginLeft: 4 }}>— {selectedPurchase.invoice_number}</span>
                )}
              </div>
              <button type="button" className="pms-btn pms-btn-soft" onClick={resetForm}>
                <X size={14} /> Cancel Edit
              </button>
            </div>

            {/* Purchase Details Form */}
            <div className="pms-section-card pms-search-section">
              <div className="pms-section-head">
                <h2 className="pms-section-title">
                  <span className="pms-header-icon pms-header-icon-blue"><Edit size={16} /></span>
                  Purchase Details
                </h2>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="pms-btn pms-btn-soft" onClick={fetchAllPurchases}>
                    <RefreshCw size={14} />
                  </button>
                  <Link to="#" className="pms-btn pms-btn-add">
                    <Plus size={14} /> Tax Master
                  </Link>
                </div>
              </div>

              <div className="pms-grid pms-grid-6">

                {/* Supplier */}
                <div className="pms-col-3">
                  <label className="pms-field-label">Select Supplier <span className="pms-required">*</span></label>
                  <div className="pms-select-shell">
                    <Select
                      styles={selectStyles}
                      options={suppliers}
                      value={selectedSupplierOption}
                      onChange={(o) => setSelectedSupplier(o.value)}
                      placeholder="Select Supplier"
                    />
                  </div>
                </div>

                {/* GST Type */}
                <div className="pms-col-1">
                  <label className="pms-field-label">GST Type <span className="pms-required">*</span></label>
                  <div className="pms-select-shell">
                    <Select
                      styles={selectStyles}
                      options={gstOptions}
                      value={gstOptions.find((o) => o.value === gstType)}
                      onChange={(o) => setGstType(o.value)}
                      placeholder="GST Type"
                    />
                  </div>
                </div>

                {/* Purchase Date */}
                <div className="pms-col-1">
                  <label className="pms-field-label">Purchase Date <span className="pms-required">*</span></label>
                  <div className="pms-field-group">
                    <input
                      type="date"
                      className="pms-field-input"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                {/* Credit Due Date */}
                <div className="pms-col-1">
                  <label className="pms-field-label">Credit Due Date</label>
                  <div className="pms-field-group">
                    <input
                      type="date"
                      className="pms-field-input"
                      value={creditDueDate}
                      onChange={(e) => setCreditDueDate(e.target.value)}
                      min={purchaseDate}
                    />
                  </div>
                </div>

                {/* Credit Days */}
                <div className="pms-col-1">
                  <label className="pms-field-label">Credit Days</label>
                  <div className="pms-field-group">
                    <input
                      type="number"
                      className="pms-field-input"
                      placeholder="Days"
                      value={creditDueDays}
                      onChange={(e) => setCreditDueDays(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                {/* Invoice Number */}
                <div className="pms-col-2">
                  <label className="pms-field-label">Invoice Number</label>
                  <div className="pms-field-group">
                    <input
                      type="text"
                      className="pms-field-input"
                      placeholder="Invoice No."
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Add Products / Search */}
            <div className="pms-section-card pms-search-section">
              <div className="pms-section-head" style={{ justifyContent: "center" }}>
                <h2 className="pms-section-title">
                  <span className="pms-header-icon pms-header-icon-green"><Search size={16} /></span>
                  Add More Products
                </h2>
              </div>

              <div className="pms-search-wrap">
                <div className="pms-search-group">
                  <Search size={18} className="pms-search-icon" />
                  <input
                    type="text"
                    className="pms-search-input"
                    placeholder="Search product by name or barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {isSearching && <div className="pms-loader-inline" />}
                  <button
                    type="button"
                    className="pms-inline-add"
                    onClick={() => setShowProductModal(true)}
                    aria-label="Add new product"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="pms-search-dd">
                    {searchResults.map((product) => (
                      <div className="pms-search-result" key={product.id}>
                        <div>
                          <div className="pms-product-name">{product.name}</div>
                          <div className="pms-product-sub">{product.barcode || "No Barcode"}</div>
                        </div>
                        <div className="pms-chip-wrap">
                          <span className="pms-chip">{product.brandName || "No Brand"}</span>
                        </div>
                        <div className="pms-amount">
                          ₹{formatNumber(product.purchase_price)}
                          <div className="pms-amount-sub">MRP ₹{formatNumber(product.mrp)}</div>
                        </div>
                        <div>
                          <button
                            type="button"
                            className="pms-btn pms-btn-add"
                            style={{ padding: "8px 14px" }}
                            onClick={() => addProductToPurchase(product)}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Purchase Items Table */}
            <div className="pms-section-card">
              <div className="pms-section-head">
                <h2 className="pms-section-title">
                  <span className="pms-header-icon pms-header-icon-blue"><List size={16} /></span>
                  Purchase Items
                </h2>
                <span className="pms-count-badge">{purchaseItems.length} item(s)</span>
              </div>

              <div className="pms-table-wrapper">
                <table className="pms-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Barcode</th>
                      <th>Item Name</th>
                      <th>HSN</th>
                      <th>GST%</th>
                      <th>Brand</th>
                      <th>Size</th>
                      <th>Colour</th>
                      <th>Style</th>
                      <th className="pms-center">QTY-ST</th>
                      <th className="pms-center">Total Qty</th>
                      <th className="pms-right">Total Tax</th>
                      <th className="pms-right">MRP</th>
                      <th className="pms-right">Rate</th>
                      <th className="pms-right">WP</th>
                      <th className="pms-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseItems.length > 0 ? (
                      purchaseItems.map((item, index) => (
                        <tr key={item.id}>
                          <td><span className="pms-sno">{index + 1}</span></td>
                          <td>{item.barcode}</td>
                          <td>
                            <div className="pms-product-name">{item.item_name}</div>
                          </td>
                          <td>
                            <span className="pms-chip">{item.hsn_code || "N/A"}</span>
                          </td>
                          <td>
                            <span className="pms-chip">{item.gst}%</span>
                          </td>
                          <td>{item.brand}</td>
                          <td><span className="pms-chip">{item.size}</span></td>
                          <td>{item.colour}</td>
                          <td>{item.style}</td>
                          <td className="pms-center">
                            <input
                              type="number"
                              className="pms-edit-input"
                              style={{ minWidth: 64 }}
                              value={item.quantity_stock}
                              onChange={(e) => updateItemQuantity(item.id, "quantity_stock", e.target.value)}
                              min="1"
                            />
                          </td>
                          <td className="pms-center">
                            <span className="pms-count-badge">{item.total_quantity}</span>
                          </td>
                          <td className="pms-right">
                            <div className="pms-amount">₹{formatNumber(item.total_tax)}</div>
                          </td>
                          <td className="pms-right">
                            <input
                              type="number"
                              className="pms-edit-input"
                              style={{ minWidth: 80 }}
                              value={item.mrp}
                              onChange={(e) => updateItemQuantity(item.id, "mrp", e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="pms-right">
                            <input
                              type="number"
                              className="pms-edit-input"
                              style={{ minWidth: 80 }}
                              value={item.purchase_rate}
                              onChange={(e) => updateItemQuantity(item.id, "purchase_rate", e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="pms-right">
                            <input
                              type="number"
                              className="pms-edit-input"
                              style={{ minWidth: 80 }}
                              value={item.wholesale_price}
                              onChange={(e) => updateItemQuantity(item.id, "wholesale_price", e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="pms-center">
                            <button
                              type="button"
                              className="pms-action-icon pms-action-delete"
                              onClick={() => removeItem(item.id)}
                              title="Remove"
                              aria-label={`Remove ${item.item_name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="16">
                          <div className="pms-empty">
                            <div className="pms-empty-icon"><ShoppingCart size={44} /></div>
                            <div className="pms-empty-title">No Items Added</div>
                            <div className="pms-empty-text">Add products using the search bar above.</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Charges */}
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
                        <button type="button" className="pms-remove-link" onClick={() => removeCharge(charge.id)}>
                          REMOVE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer: Totals Bar + Summary + Actions */}
            <div className="pms-footer-grid">

              <div>
                {/* Totals Bar */}
                <div className="pms-totals-bar">
                  <div className="pms-totals-bar-item">
                    <span>Items</span>
                    <strong>{totals.noOfItems}</strong>
                  </div>
                  <div className="pms-totals-bar-item">
                    <span>Total Qty</span>
                    <strong>{formatNumber(totals.totalQty)}</strong>
                  </div>
                  <div className="pms-totals-bar-item">
                    <span>Taxable</span>
                    <strong>₹{formatNumber(totals.taxableAmount)}</strong>
                  </div>
                  <div className="pms-totals-bar-item">
                    <span>Tax</span>
                    <strong>₹{formatNumber(totals.taxAmount)}</strong>
                  </div>
                  <div className="pms-totals-bar-item">
                    <span>Charges</span>
                    <strong>₹{formatNumber(totals.total_charges_amount)}</strong>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="pms-action-bar">
                  <button
                    type="button"
                    className="pms-btn pms-btn-soft"
                    onClick={() => setShowChargesModal(true)}
                    disabled={isSubmitting}
                  >
                    <CreditCard size={15} /> Add Charges
                  </button>
                </div>
              </div>

              {/* Summary + Update Button */}
              <div className="pms-summary-box">
                <div className="pms-summary-row"><span>Subtotal</span><strong>₹{formatNumber(totals.taxableAmount)}</strong></div>
                <div className="pms-summary-row"><span>Total Tax</span><strong>₹{formatNumber(totals.taxAmount)}</strong></div>
                {gstType === "INTRA" && (
                  <>
                    <div className="pms-summary-row"><span>CGST</span><strong>₹{formatNumber(totals.cgst_amount)}</strong></div>
                    <div className="pms-summary-row"><span>SGST</span><strong>₹{formatNumber(totals.sgst_amount)}</strong></div>
                  </>
                )}
                {gstType === "INTER" && (
                  <div className="pms-summary-row"><span>IGST</span><strong>₹{formatNumber(totals.igst_amount)}</strong></div>
                )}
                {totals.total_charges_amount > 0 && (
                  <div className="pms-summary-row"><span>Charges</span><strong>₹{formatNumber(totals.total_charges_amount)}</strong></div>
                )}
                <div className="pms-summary-total">
                  <span>Grand Total</span>
                  <span>₹{formatNumber(totals.taxableAmount + totals.taxAmount + totals.total_charges_amount)}</span>
                </div>
                <div className="pms-button-row">
                  <button
                    type="button"
                    className="pms-btn pms-btn-add"
                    onClick={handleUpdatePurchase}
                    disabled={isSubmitting || !purchaseItems.length}
                  >
                    {isSubmitting
                      ? <><div className="pms-loader-inline" /> Updating...</>
                      : <><Save size={15} /> Update Purchase</>}
                  </button>
                </div>
              </div>

            </div>
          </>
        )}

        {/* Modals */}
        {showChargesModal && (
          <AddChargesModal
            onClose={() => setShowChargesModal(false)}
            onAdd={handleAddCharge}
            chargeNameOptions={chargeNameOptions}
            gstTypeChargesOptions={gstTypeChargesOptions}
            storeOptions={storeOptions}
          />
        )}
        {showProductModal && (
          <AddProductModal
            onClose={() => setShowProductModal(false)}
            onSuccess={handleProductAdded}
          />
        )}

      </div>
    </div>
  );
};

export default PurchaseEdit;