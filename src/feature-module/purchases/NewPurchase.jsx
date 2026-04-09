import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";

import { URLS } from "../../Urls";
import axios from "axios";
import AddProductModal from "../setup/master/AllMaster/AddProductModal";
import SupplierFormModal from "../setup/master/AllMaster/SupplierFormModal";
import {
  Plus,
  Search,
  Trash2,
  Save,
  FileText,
  List,
  ArrowLeft,
  CreditCard,
  User,
  Calendar,
} from "react-feather";

// ── Import the extracted CSS file ──────────────────────────
import "./Purchase.css";

// ----------------------------------------------------------------------
// React Select Custom Styles
const selectStyles = {
  control: (base, state) => ({
    ...base,
    background: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(12px)",
    borderRadius: "14px",
    border: state.isFocused ? "1px solid #3b82f6" : "1px solid rgba(255, 255, 255, 0.4)",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(59, 130, 246, 0.12)" : "none",
    padding: "4px 8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f172a",
    minHeight: "44px",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.45)",
      borderColor: "rgba(59, 130, 246, 0.4)",
    },
  }),
  menu: (base) => ({
    ...base,
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.12)",
    padding: "8px",
    zIndex: 1000,
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: "10px",
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
        ? "rgba(59, 130, 246, 0.08)"
        : "transparent",
    color: state.isSelected ? "#ffffff" : "#1e293b",
    fontSize: "13px",
    fontWeight: "500",
    padding: "10px 14px",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "rgba(59, 130, 246, 0.15)",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "#0f172a",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    padding: "0 4px",
  }),
};

// ----------------------------------------------------------------------
// Helper functions
const safeToNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const formatNumber = (value) => safeToNumber(value).toFixed(2);

const calculateDaysBetweenDates = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const calculateDateByAddingDays = (startDate, days) => {
  if (!startDate || !days) return "";
  const date = new Date(startDate);
  date.setDate(date.getDate() + parseInt(days, 10));
  return date.toISOString().split("T")[0];
};

// ----------------------------------------------------------------------
// Product Row
const ProductRow = React.memo(({ item, index, updateItemQuantity, removeItem }) => {
  const itemTotal =
    safeToNumber(item.purchase_rate) * safeToNumber(item.buying_quantity) +
    safeToNumber(item.total_tax);

  return (
    <tr>
      <td>
        <span className="pms-sno">{index + 1}</span>
      </td>
      <td>{item.barcode || "N/A"}</td>
      <td>
        <div className="pms-product-name">{item.item_name}</div>
        <div className="pms-product-sub">{item.brand || "No Brand"}</div>
      </td>
      <td>{item.hsn_code || "-"}</td>
      <td>
        <div className="pms-chip-wrap">
          <span className="pms-chip">{item.size || "N/A"}</span>
          <span className="pms-chip">{item.colour || "N/A"}</span>
          <span className="pms-chip">{item.style || "N/A"}</span>
        </div>
      </td>
      <td className="pms-center">
        <input
          type="number"
          className="pms-edit-input"
          value={item.buying_quantity}
          onChange={(e) => updateItemQuantity(item.id, "buying_quantity", e.target.value)}
          min="1"
        />
      </td>
      <td className="pms-right">
        <input
          type="number"
          className="pms-edit-input"
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
          value={item.wholesale_price}
          onChange={(e) => updateItemQuantity(item.id, "wholesale_price", e.target.value)}
          min="0"
          step="0.01"
        />
      </td>
      <td className="pms-right">
        <div className="pms-amount">₹{formatNumber(itemTotal)}</div>
        <div className="pms-amount-sub">Tax: ₹{formatNumber(item.total_tax)}</div>
      </td>
      <td className="pms-center">
        <button
          type="button"
          className="pms-action-icon pms-action-delete"
          onClick={() => removeItem(item.id)}
          aria-label={`Remove ${item.item_name}`}
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
});

ProductRow.displayName = "ProductRow";

// ----------------------------------------------------------------------
// Add Charges Modal
const AddChargesModal = React.memo(
  ({ onClose, onAdd, chargeNameOptions, gstTypeChargesOptions, storeOptions }) => {
    const [formData, setFormData] = useState({
      storeId: "store1",
      charges_name: "",
      gst_rate: 18,
      gst_type: 1,
      amount: "",
      gst_amount: 0,
      total_amount: 0,
      tax_rate: 18,
    });

    const handleChange = useCallback((field, value) => {
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };

        if (field === "amount" || field === "gst_rate") {
          const amount = parseFloat(field === "amount" ? value : updated.amount) || 0;
          const gstRate = parseFloat(field === "gst_rate" ? value : updated.gst_rate) || 0;
          const gstAmount = (amount * gstRate) / 100;
          const totalAmount = amount + gstAmount;
          updated.gst_amount = gstAmount;
          updated.total_amount = totalAmount;
          updated.tax_rate = gstRate;
        }

        return updated;
      });
    }, []);

    const handleSubmit = useCallback(
      (e) => {
        e.preventDefault();
        if (!formData.charges_name || !formData.amount) {
          alert("Please fill in all required fields");
          return;
        }
        onAdd(formData);
      },
      [formData, onAdd]
    );

    return (
      <div className="pms-modal-backdrop">
        <div className="pms-modal-box">
          <div className="pms-modal-head">
            <h5 className="pms-modal-title">
              <span className="pms-header-icon pms-header-icon-yellow">
                <CreditCard size={16} />
              </span>
              Add Additional Charges
            </h5>
            <button type="button" className="pms-modal-close" onClick={onClose}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="pms-modal-body">
              <div className="pms-grid pms-grid-6">
                <div className="pms-col-3">
                  <label className="pms-field-label">
                    Charge Type <span className="pms-required">*</span>
                  </label>
                  <div className="pms-field-group">
                    <Select
                      styles={selectStyles}
                      options={chargeNameOptions}
                      value={chargeNameOptions.find((opt) => opt.value === formData.charges_name)}
                      onChange={(opt) => handleChange("charges_name", opt.value)}
                      placeholder="Select Charge"
                      required
                    />
                  </div>
                </div>

                <div className="pms-col-3">
                  <label className="pms-field-label">Store</label>
                  <div className="pms-field-group">
                    <Select
                      styles={selectStyles}
                      options={storeOptions}
                      value={storeOptions.find((opt) => opt.value === formData.storeId)}
                      onChange={(opt) => handleChange("storeId", opt.value)}
                    />
                  </div>
                </div>

                <div className="pms-col-2">
                  <label className="pms-field-label">
                    Amount <span className="pms-required">*</span>
                  </label>
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

                <div className="pms-col-2">
                  <label className="pms-field-label">Tax Rate</label>
                  <div className="pms-field-group">
                    <Select
                      styles={selectStyles}
                      options={[
                        { value: 0, label: "0%" },
                        { value: 5, label: "5%" },
                        { value: 12, label: "12%" },
                        { value: 18, label: "18%" },
                        { value: 28, label: "28%" },
                      ]}
                      value={{ value: formData.gst_rate, label: `${formData.gst_rate}%` }}
                      onChange={(opt) => handleChange("gst_rate", opt.value)}
                    />
                  </div>
                </div>

                <div className="pms-col-2">
                  <label className="pms-field-label">GST Split</label>
                  <div className="pms-field-group">
                    <Select
                      styles={selectStyles}
                      options={gstTypeChargesOptions}
                      value={gstTypeChargesOptions.find((opt) => opt.value === formData.gst_type)}
                      onChange={(opt) => handleChange("gst_type", opt.value)}
                    />
                  </div>
                </div>

                <div className="pms-col-6">
                  <div className="pms-soft-card">
                    <div className="pms-summary-row">
                      <span>GST Amount</span>
                      <strong>₹{formatNumber(formData.gst_amount)}</strong>
                    </div>
                    <div className="pms-summary-total" style={{ marginTop: 0, paddingTop: 12 }}>
                      <span>Total Payable</span>
                      <span style={{ fontSize: "22px" }}>₹{formatNumber(formData.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pms-modal-foot">
              <button type="button" className="pms-btn pms-btn-soft" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="pms-btn pms-btn-add">
                <Plus size={16} />
                Add Charge
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

AddChargesModal.displayName = "AddChargesModal";

// ----------------------------------------------------------------------
// Draft List Modal
const DraftListModal = React.memo(({ drafts, onClose, onLoadDraft, isLoading }) => {
  return (
    <div className="pms-modal-backdrop">
      <div className="pms-modal-box pms-modal-box-xl">
        <div className="pms-modal-head">
          <h5 className="pms-modal-title">
            <span className="pms-header-icon pms-header-icon-blue">
              <FileText size={16} />
            </span>
            Draft Purchase Orders
          </h5>
          <button type="button" className="pms-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="pms-modal-body pms-drafts-table-wrap">
          {isLoading ? (
            <div className="pms-loader-center">
              <div className="pms-loader-inline" style={{ width: 32, height: 32 }} />
              <p className="pms-note" style={{ margin: 0 }}>Loading drafts...</p>
            </div>
          ) : drafts.length === 0 ? (
            <div className="pms-empty">
              <div className="pms-empty-icon">
                <FileText size={44} />
              </div>
              <div className="pms-empty-title">No Drafts Found</div>
              <div className="pms-empty-text">
                You have not saved any draft purchase orders yet.
              </div>
            </div>
          ) : (
            <div className="pms-table-wrapper">
              <table className="pms-table">
                <thead>
                  <tr>
                    <th>Draft ID</th>
                    <th>Supplier</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th className="pms-right">Amount</th>
                    <th className="pms-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((draft) => (
                    <tr key={draft.id}>
                      <td>
                        <span className="pms-chip">#{String(draft.id).slice(-4)}</span>
                      </td>
                      <td>
                        <div className="pms-product-name">
                          {draft.vendorName || "Unknown Vendor"}
                        </div>
                        <div className="pms-product-sub">
                          {draft.invoice_number ? `Inv: ${draft.invoice_number}` : "No Invoice #"}
                        </div>
                      </td>
                      <td>{new Date(draft.purchase_date).toLocaleDateString()}</td>
                      <td>
                        <span className="pms-chip">{draft.products?.length || 0} items</span>
                      </td>
                      <td className="pms-right">
                        ₹{formatNumber(
                          safeToNumber(draft.taxable_amount) +
                          safeToNumber(draft.tax_amount) +
                          safeToNumber(draft.total_charges_amount)
                        )}
                      </td>
                      <td className="pms-center">
                        <button
                          type="button"
                          onClick={() => onLoadDraft(draft)}
                          className="pms-btn pms-btn-add"
                          style={{ padding: "8px 14px" }}
                        >
                          Load Draft
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

DraftListModal.displayName = "DraftListModal";

// ----------------------------------------------------------------------
// Main Component
const NewPurchase = () => {
  const [gstType, setGstType] = useState("INTRA");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [creditDueDate, setCreditDueDate] = useState("");
  const [creditDueDays, setCreditDueDays] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [suppliers, setSuppliers] = useState([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const [purchaseItems, setPurchaseItems] = useState([]);

  const [charges, setCharges] = useState([]);
  const [showChargesModal, setShowChargesModal] = useState(false);

  const [drafts, setDrafts] = useState([]);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const gstOptions = useMemo(() => [
    { value: "INTRA", label: "GST Inclusive (Intra State)" },
    { value: "INTER", label: "GST Inclusive (Inter State)" },
    { value: "NON_GST", label: "Non GST" },
  ], []);

  const storeOptions = useMemo(() => [
    { value: "store1", label: "Main Store" },
    { value: "store2", label: "Warehouse A" },
    { value: "store3", label: "Warehouse B" },
  ], []);

  const chargeNameOptions = useMemo(() => [
    { value: 1, label: "Freight Charges" },
    { value: 2, label: "Loading Charges" },
    { value: 3, label: "Unloading Charges" },
    { value: 4, label: "Packaging Charges" },
    { value: 5, label: "Other Charges" },
  ], []);

  const gstTypeChargesOptions = useMemo(() => [
    { value: 1, label: "CGST + SGST" },
    { value: 2, label: "IGST" },
  ], []);

  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) setError("Authentication token not found. Please login again.");
    return token;
  }, []);

  const getAxiosConfig = useCallback(() => {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication token not available");
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
  }, [getAuthToken]);

  const selectedSupplierOption = useMemo(
    () => suppliers.find((s) => s.value === selectedSupplier) || null,
    [suppliers, selectedSupplier]
  );

  const handlePurchaseDateChange = useCallback((date) => {
    setPurchaseDate(date);
    if (date && creditDueDays) setCreditDueDate(calculateDateByAddingDays(date, creditDueDays));
    if (date && creditDueDate) setCreditDueDays(calculateDaysBetweenDates(date, creditDueDate).toString());
  }, [creditDueDate, creditDueDays]);

  const handleCreditDueDateChange = useCallback((date) => {
    setCreditDueDate(date);
    if (purchaseDate && date) setCreditDueDays(calculateDaysBetweenDates(purchaseDate, date).toString());
  }, [purchaseDate]);

  const handleCreditDaysChange = useCallback((days) => {
    setCreditDueDays(days);
    if (purchaseDate && days) setCreditDueDate(calculateDateByAddingDays(purchaseDate, days));
    if (!days) setCreditDueDate("");
  }, [purchaseDate]);

  const fetchSuppliers = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setIsLoadingSuppliers(true);
    setError(null);
    try {
      const config = getAxiosConfig();
      const response = await axios.post(URLS.GetSuppliers, {}, { ...config, signal: abortControllerRef.current.signal });
      if (response.data.success) {
        setSuppliers(response.data.data.map((s) => ({
          value: s.id,
          label: s.name,
          companyName: s.companyName,
          data: s,
        })));
      } else {
        setError("Failed to fetch suppliers");
      }
    } catch (err) {
      if (err.name !== "AbortError" && err.code !== "ERR_CANCELED")
        setError("Failed to load suppliers. Please try again.");
    } finally {
      setIsLoadingSuppliers(false);
    }
  }, [getAxiosConfig]);

  const fetchDrafts = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setIsLoadingDrafts(true);
    setError(null);
    try {
      const config = getAxiosConfig();
      const response = await axios.post(URLS.GetAllDrafts, { isDraft: true }, { ...config, signal: abortControllerRef.current.signal });
      if (response.data.success) {
        setDrafts(response.data.data || []);
        setShowDraftsModal(true);
      } else {
        setError("Failed to fetch drafts");
      }
    } catch (err) {
      if (err.name !== "AbortError" && err.code !== "ERR_CANCELED")
        setError("Failed to load drafts. Please try again.");
    } finally {
      setIsLoadingDrafts(false);
    }
  }, [getAxiosConfig]);

  const loadDraft = useCallback((draft) => {
    setSelectedSupplier(draft.supplierId);
    setGstType(draft.gst_type || "INTRA");
    setPurchaseDate(draft.purchase_date || "");
    setCreditDueDate(draft.credit_due_date || "");
    setCreditDueDays(draft.credit_due_date_days || "");
    setInvoiceNumber(draft.invoice_number || "");
    if (draft.products?.length) {
      setPurchaseItems(draft.products.map((p, i) => ({
        id: Date.now() + i,
        productId: p.id || 0,
        barcode: p.barcode || "N/A",
        item_name: p.item_name,
        hsn_code: p.hsn_code || "",
        gstId: safeToNumber(p.gstId),
        gst: safeToNumber(p.gst),
        brandId: safeToNumber(p.brandId),
        brand: p.brand || "N/A",
        sizeId: safeToNumber(p.sizeId),
        size: p.size || "N/A",
        colourId: safeToNumber(p.colourId),
        colour: p.colour || "N/A",
        styleId: safeToNumber(p.styleId),
        style: p.style || "N/A",
        buying_quantity: safeToNumber(p.quantity_stock),
        total_tax: safeToNumber(p.total_tax),
        mrp: safeToNumber(p.mrp),
        purchase_rate: safeToNumber(p.purchase_rate),
        wholesale_price: safeToNumber(p.wholesale_price),
      })));
    } else {
      setPurchaseItems([]);
    }
    setCharges(draft.charges?.length ? draft.charges.map((c, i) => ({ id: Date.now() + i, ...c })) : []);
    setShowDraftsModal(false);
    alert("Draft loaded successfully!");
  }, []);

  const searchProducts = useCallback(async (query) => {
    if (!query.trim()) { setSearchResults([]); return; }
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setIsSearching(true);
    setError(null);
    try {
      const config = getAxiosConfig();
      const response = await axios.post(
        `${URLS.SearchByStore}?searchQuery=${encodeURIComponent(query)}`,
        {},
        { ...config, signal: abortControllerRef.current.signal }
      );
      setSearchResults(response.data.success ? response.data.data || [] : []);
    } catch (err) {
      if (err.name !== "AbortError" && err.code !== "ERR_CANCELED") setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [getAxiosConfig]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => searchProducts(searchQuery), 500);
    } else {
      setSearchResults([]);
    }
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, searchProducts]);

  const addProductToPurchase = useCallback((product) => {
    setPurchaseItems((prev) => [...prev, {
      id: Date.now(),
      productId: product.id,
      barcode: product.barcode || "N/A",
      item_name: product.name,
      hsn_code: product.hsnsacId || "",
      gstId: safeToNumber(product.gst_percentage),
      gst: safeToNumber(product.gst_percentage),
      brandId: safeToNumber(product.brandId),
      brand: product.brandName || "N/A",
      sizeId: safeToNumber(product.sizeId),
      size: product.sizeName || "N/A",
      colourId: safeToNumber(product.colourId),
      colour: product.colourName || "N/A",
      styleId: safeToNumber(product.styleId),
      style: product.styleName || "N/A",
      buying_quantity: 1,
      total_tax: 0,
      mrp: safeToNumber(product.mrp),
      purchase_rate: safeToNumber(product.purchase_price),
      wholesale_price: safeToNumber(product.wholesale_price),
    }]);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const handleProductAdded = useCallback((newProduct) => {
    addProductToPurchase(newProduct);
    setShowProductModal(false);
  }, [addProductToPurchase]);

  const removeItem = useCallback((itemId) => {
    setPurchaseItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateItemQuantity = useCallback((itemId, field, value) => {
    setPurchaseItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const updated = { ...item, [field]: safeToNumber(value) };
        if (["buying_quantity", "purchase_rate", "gst"].includes(field)) {
          const total = safeToNumber(updated.buying_quantity) * safeToNumber(updated.purchase_rate);
          updated.total_tax = (total * safeToNumber(updated.gst)) / 100;
        }
        return updated;
      })
    );
  }, []);

  const totals = useMemo(() => {
    const noOfItems = purchaseItems.length;
    const taxableAmount = purchaseItems.reduce((s, i) => s + safeToNumber(i.purchase_rate) * safeToNumber(i.buying_quantity), 0);
    const taxAmount = purchaseItems.reduce((s, i) => s + safeToNumber(i.total_tax), 0);
    const igst_amount = gstType === "INTER" ? taxAmount : 0;
    const cgst_amount = gstType === "INTRA" ? taxAmount / 2 : 0;
    const sgst_amount = gstType === "INTRA" ? taxAmount / 2 : 0;
    const total_charges_amount = charges.reduce((s, c) => s + safeToNumber(c.total_amount), 0);
    const total_amount = taxableAmount + taxAmount + total_charges_amount;
    return { noOfItems, taxableAmount, taxAmount, igst_amount, cgst_amount, sgst_amount, total_charges_amount, total_amount };
  }, [purchaseItems, charges, gstType]);

  const handleSubmit = useCallback(async (isDraft = false) => {
    if (!selectedSupplier) return alert("Please select a supplier");
    if (!purchaseDate) return alert("Please select purchase date");
    if (!purchaseItems.length) return alert("Please add at least one product");

    setIsSubmitting(true);
    setError(null);
    try {
      const config = getAxiosConfig();
      const payload = {
        supplierId: selectedSupplier,
        gst_type: gstType,
        purchase_date: purchaseDate,
        credit_due_date: creditDueDate || purchaseDate,
        credit_due_date_days: creditDueDays || "0",
        invoice_number: invoiceNumber,
        products: purchaseItems.map((item) => ({
          productId: item.productId,
          item_name: item.item_name,
          hsn_code: item.hsn_code || "",
          gstId: String(item.gstId || 0),
          brandId: String(item.brandId || 0),
          sizeId: String(item.sizeId || 0),
          colourId: String(item.colourId || 0),
          styleId: String(item.styleId || 0),
          buying_quantity: String(item.buying_quantity || 0),
          total_tax: String(item.total_tax || 0),
          mrp: String(item.mrp || 0),
          purchase_rate: String(item.purchase_rate || 0),
          wholesale_price: String(item.wholesale_price || 0),
        })),
        charges,
        taxable_amount: totals.taxableAmount,
        igst_amount: totals.igst_amount,
        cgst_amount: totals.cgst_amount,
        sgst_amount: totals.sgst_amount,
        tax_amount: totals.taxAmount,
        total_charges_amount: totals.total_charges_amount,
        isDraft,
        storeId: localStorage.getItem("selectedStoreId"),
      };

      const response = await axios.post(URLS.NewPurchaseOrder, payload, config);
      if (response.data.success) {
        alert(isDraft ? "Draft saved successfully!" : "Purchase order created successfully!");
        setPurchaseItems([]);
        setCharges([]);
        setSelectedSupplier(null);
        setPurchaseDate("");
        setCreditDueDate("");
        setCreditDueDays("");
        setInvoiceNumber("");
        setSearchQuery("");
        setSearchResults([]);
      } else {
        alert("Failed to create purchase order");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(`Failed to submit purchase order: ${msg}`);
      alert(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedSupplier, purchaseDate, purchaseItems, gstType, creditDueDate, creditDueDays, invoiceNumber, charges, totals, getAxiosConfig]);

  const handleAddCharge = useCallback((data) => { setCharges((p) => [...p, { ...data, id: Date.now() }]); setShowChargesModal(false); }, []);
  const removeCharge = useCallback((id) => { setCharges((p) => p.filter((c) => c.id !== id)); }, []);
  const handleSupplierAdded = useCallback(() => { fetchSuppliers(); setShowSupplierModal(false); }, [fetchSuppliers]);

  useEffect(() => {
    fetchSuppliers();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [fetchSuppliers]);

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="pms-root">
      <div className="pms-main-card">

        {/* Top Bar */}
        <div className="pms-topbar">
          <div>
            <Link to="/purchases/purchase-list" className="pms-back-link">
              <ArrowLeft size={15} /> Back to Purchase List
            </Link>
            <h1 className="pms-title">New Purchase Order</h1>
            <div className="pms-breadcrumb">
              <Link to="/dashboard">Dashboard</Link>
              <span>/</span>
              <Link to="/purchases/purchase-list">Purchases</Link>
              <span>/</span>
              <span>New Purchase</span>
            </div>
          </div>

          <div className="pms-top-actions">
            <button type="button" className="pms-btn pms-btn-soft" onClick={fetchDrafts}>
              <List size={15} />
              {isLoadingDrafts ? "Loading Drafts..." : "Drafts"}
            </button>
            <Link to="#" className="pms-btn pms-btn-add">
              <Plus size={15} /> Tax Master
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="pms-alert" role="alert">
            <span>{error}</span>
            <button type="button" className="pms-alert-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Purchase Details */}
        <div className="pms-section-card pms-search-section">
          <div className="pms-section-head">
            <h2 className="pms-section-title">
              <span className="pms-header-icon pms-header-icon-blue"><User size={16} /></span>
              Purchase Details
            </h2>
          </div>

          <div className="pms-grid pms-grid-6">

            {/* Supplier */}
            <div className="pms-col-3">
              <label className="pms-field-label">Select Supplier <span className="pms-required">*</span></label>
              <div className="pms-field-row">
                <div className="pms-select-shell" style={{ flex: 1 }}>
                  <Select
                    styles={selectStyles}
                    options={suppliers}
                    value={selectedSupplierOption}
                    onChange={(opt) => setSelectedSupplier(opt.value)}
                    placeholder={isLoadingSuppliers ? "Loading..." : "Select Supplier"}
                    isDisabled={isLoadingSuppliers}
                    isLoading={isLoadingSuppliers}
                  />
                </div>
                <button type="button" className="pms-inline-add" onClick={() => setShowSupplierModal(true)} aria-label="Add supplier">
                  <Plus size={16} />
                </button>
              </div>
              <div className="pms-hint"><User size={12} /> Add a new supplier instantly if it is not listed.</div>
            </div>

            {/* GST Type */}
            <div className="pms-col-1">
              <label className="pms-field-label">GST Type <span className="pms-required">*</span></label>
              <div className="pms-select-shell">
                <Select styles={selectStyles} options={gstOptions} value={gstOptions.find((o) => o.value === gstType)} onChange={(o) => setGstType(o.value)} placeholder="Select GST" />
              </div>
            </div>

            {/* Purchase Date */}
            <div className="pms-col-1">
              <label className="pms-field-label">Purchase Date <span className="pms-required">*</span></label>
              <div className="pms-field-group">
                <input type="date" className="pms-field-input" value={purchaseDate} onChange={(e) => handlePurchaseDateChange(e.target.value)} />
              </div>
            </div>

            {/* Credit Due Date */}
            <div className="pms-col-1">
              <label className="pms-field-label">Credit Due Date</label>
              <div className="pms-field-group">
                <input type="date" className="pms-field-input" value={creditDueDate} onChange={(e) => handleCreditDueDateChange(e.target.value)} />
              </div>
            </div>

            {/* Credit Days */}
            <div className="pms-col-1">
              <label className="pms-field-label">Credit Days</label>
              <div className="pms-field-group">
                <input type="number" className="pms-field-input" placeholder="Days" value={creditDueDays} onChange={(e) => handleCreditDaysChange(e.target.value)} min="0" />
              </div>
            </div>

            {/* Invoice Number */}
            <div className="pms-col-2">
              <label className="pms-field-label">Invoice Number</label>
              <div className="pms-field-group">
                <input type="text" className="pms-field-input" placeholder="Invoice No" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
              </div>
            </div>

            {/* Order Snapshot */}
            <div className="pms-col-4">
              <div className="pms-soft-card" style={{ height: "100%", background: "rgba(255,255,255,0.5)" }}>
                <div className="pms-section-title" style={{ marginBottom: 16, fontSize: "14px" }}>
                  <span className="pms-header-icon pms-header-icon-green"><Calendar size={14} /></span>
                  Order Snapshot
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
                  <div className="pms-summary-row" style={{ marginBottom: 0 }}><span>Supplier:</span><strong style={{ color: "#2563eb" }}>{selectedSupplierOption?.label || "None"}</strong></div>
                  <div className="pms-summary-row" style={{ marginBottom: 0 }}><span>GST:</span><strong>{gstType}</strong></div>
                  <div className="pms-summary-row" style={{ marginBottom: 0 }}><span>Credit:</span><strong>{creditDueDays || 0} days</strong></div>
                  <div className="pms-summary-row" style={{ marginBottom: 0 }}><span>Invoice:</span><strong>{invoiceNumber || "—"}</strong></div>
                </div>
              </div>
            </div>

            {/* Totals Preview */}
            <div className="pms-col-2">
              <div className="pms-soft-card" style={{ height: "100%", background: "rgba(37,99,235,0.04)" }}>
                <div className="pms-section-title" style={{ marginBottom: 16, fontSize: "14px" }}>
                  <span className="pms-header-icon pms-header-icon-yellow"><CreditCard size={14} /></span>
                  Totals Preview
                </div>
                <div className="pms-summary-row"><span>Items:</span><strong>{totals.noOfItems}</strong></div>
                <div className="pms-summary-row" style={{ marginBottom: 0, paddingTop: 8, borderTop: "1px dashed rgba(0,0,0,0.05)" }}>
                  <span>Total Amount:</span>
                  <strong style={{ fontSize: "16px", color: "#1e293b" }}>₹{formatNumber(totals.total_amount)}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Add Products / Search */}
        <div className="pms-section-card pms-search-section">
          <div className="pms-section-head" style={{ justifyContent: "center" }}>
            <h2 className="pms-section-title">
              <span className="pms-header-icon pms-header-icon-green"><Search size={16} /></span>
              Add Products
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
              <button type="button" className="pms-inline-add" onClick={() => setShowProductModal(true)} aria-label="Add product">
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
                      <button type="button" className="pms-btn pms-btn-add" style={{ padding: "8px 14px" }} onClick={() => addProductToPurchase(product)}>
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
            <span className="pms-count-badge">{totals.noOfItems} item(s)</span>
          </div>

          <div className="pms-table-wrapper">
            <table className="pms-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Barcode</th>
                  <th>Product Name</th>
                  <th>HSN</th>
                  <th>Details</th>
                  <th className="pms-center">Qty</th>
                  <th className="pms-right">Rate</th>
                  <th className="pms-right">MRP</th>
                  <th className="pms-right">WP</th>
                  <th className="pms-right">Total</th>
                  <th className="pms-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseItems.length > 0 ? (
                  purchaseItems.map((item, idx) => (
                    <ProductRow key={item.id} item={item} index={idx} updateItemQuantity={updateItemQuantity} removeItem={removeItem} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="11">
                      <div className="pms-empty">
                        <div className="pms-empty-icon"><Search size={42} /></div>
                        <div className="pms-empty-title">No items added yet</div>
                        <div className="pms-empty-text">Search for products above to start building your purchase order.</div>
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
                    <div className="pms-charge-meta">Tax: {charge.gst_rate}%</div>
                    <div className="pms-charge-meta">Store: {charge.storeId}</div>
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

        {/* Footer: Actions + Summary */}
        <div className="pms-footer-grid">
          <div className="pms-action-bar">
            <button type="button" className="pms-btn pms-btn-soft" onClick={fetchDrafts} disabled={isLoadingDrafts}>
              <List size={16} /> {isLoadingDrafts ? "Loading Drafts..." : "View Drafts"}
            </button>
            <button type="button" className="pms-btn pms-btn-soft" onClick={() => setShowChargesModal(true)}>
              <Plus size={16} /> Add Charges
            </button>
          </div>

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
              <span style={{ textShadow: "0 2px 10px rgba(37,99,235,0.2)" }}>₹{formatNumber(totals.total_amount)}</span>
            </div>

            <div className="pms-button-row">
              <button type="button" className="pms-btn pms-btn-warning" onClick={() => handleSubmit(true)} disabled={!purchaseItems.length || isSubmitting}>
                Save Draft
              </button>
              <button type="button" className="pms-btn pms-btn-add" onClick={() => handleSubmit(false)} disabled={!purchaseItems.length || isSubmitting}>
                <Save size={16} /> {isSubmitting ? "Processing..." : "Complete Purchase"}
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showChargesModal && <AddChargesModal onClose={() => setShowChargesModal(false)} onAdd={handleAddCharge} chargeNameOptions={chargeNameOptions} gstTypeChargesOptions={gstTypeChargesOptions} storeOptions={storeOptions} />}
        {showSupplierModal && <SupplierFormModal onClose={() => setShowSupplierModal(false)} onSuccess={handleSupplierAdded} />}
        {showProductModal && <AddProductModal onClose={() => setShowProductModal(false)} onSuccess={handleProductAdded} />}
        {showDraftsModal && <DraftListModal drafts={drafts} onClose={() => setShowDraftsModal(false)} onLoadDraft={loadDraft} isLoading={isLoadingDrafts} />}

      </div>
    </div>
  );
};

export default NewPurchase;