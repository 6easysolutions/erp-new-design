import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { all_routes } from "../../../../routes/all_routes";
import { toast, ToastContainer } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "react-toastify/dist/ReactToastify.css";
import {
  Settings,
  RotateCcw,
  ArrowLeft,
  Save,
  Plus,
  X,
  Info,
  Image as ImageIcon,
  ChevronRight,
} from "react-feather";
import axios from "axios";
import Select from "react-select";
import { URLS } from "../../../../Urls"; // adjust path if needed

// ==================== Helper Component: SelectWithCreate ====================
const SelectWithCreate = ({
  label,
  value,
  options,
  onChange,
  onCreateNew,
  disabled = false,
  isCreating = false,
  name = "",
  required = false,
  visible = true,
  wrapperClass = "", // allow custom class for the container
}) => {
  const [showModal, setShowModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "m") {
        e.preventDefault();
        setShowModal(true);
        setNewItemName("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCreateItem = async () => {
    if (!newItemName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    setIsLoading(true);
    try {
      await onCreateNew(newItemName);
      toast.success(`${label} created successfully!`);
      setShowModal(false);
      setNewItemName("");
    } catch {
      toast.error(`Failed to create ${label}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = (option) => {
    if (!option) return "";
    return option.name || option.hsnsacName || option.weight || option.gst_percentage || "";
  };

  const selectOptions = options.map((opt) => ({
    value: String(opt.id || getDisplayName(opt)),
    label: String(getDisplayName(opt)),
  }));

  const currentValue = selectOptions.find((opt) => opt.value === String(value)) || null;

  if (!visible) return null;

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "36px",
      height: "36px",
      borderRadius: "12px",
      border: "none",
      background: "transparent",
      boxShadow: "none",
      fontSize: "13px",
      color: "#000",
    }),
    valueContainer: (provided) => ({ ...provided, padding: "0 12px", height: "36px" }),
    indicatorsContainer: (provided) => ({ ...provided, height: "36px" }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (provided) => ({ ...provided, padding: "0 8px", color: "#64748b" }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "10px",
      overflow: "hidden",
      zIndex: 9999,
      fontSize: "13px",
      background: "#ffffff",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#2f80ed" : state.isFocused ? "#e2e8f0" : "transparent",
      color: state.isSelected ? "#fff" : "#1e293b",
      cursor: "pointer",
      fontSize: "13px",
      padding: "8px 12px",
    }),
    placeholder: (provided) => ({ ...provided, color: "#94a3b8", fontSize: "13px" }),
    singleValue: (provided) => ({ ...provided, color: "#1e293b", fontSize: "13px" }),
  };

  return (
    <div className={wrapperClass}>
      <div className="d-flex justify-content-between align-items-center">
        <span className="pms-field-label">{label}</span>
        {onCreateNew && (
          <span
            className="text-primary fw-semibold"
            style={{ fontSize: "11px", cursor: "pointer" }}
            onClick={() => setShowModal(true)}
          >
            + New
          </span>
        )}
      </div>
      <div className="pms-field-group-dropdown">
        <Select
          value={currentValue}
          onChange={(val) => onChange({ target: { name, value: val ? val.value : "" } })}
          options={selectOptions}
          placeholder={`Select ${label}`}
          isDisabled={disabled || isCreating}
          isClearable
          isSearchable
          styles={customStyles}
          menuPortalTarget={document.body}
        />
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15,23,42,0.4)",
            zIndex: 1100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              width: "340px",
              padding: "16px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold" style={{ fontSize: 14 }}>
                New {label}
              </span>
              <X
                size={14}
                style={{ cursor: "pointer", color: "#64748b" }}
                onClick={() => setShowModal(false)}
              />
            </div>
            <input
              type="text"
              className="form-control form-control-sm mb-2"
              style={{ background: "rgba(255,255,255,0.5)", border: "1px solid #ced4da" }}
              placeholder={`Enter ${label} name`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateItem()}
            />
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-sm btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-sm btn-primary" onClick={handleCreateItem} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Field Settings Modal ====================
const FieldSettingsModal = ({ show, onClose, fieldVisibility, onFieldToggle }) => {
  const fieldGroups = {
    "Basic Details": [
      { key: "supplierId", label: "Supplier" },
      { key: "name", label: "Product Name" },
      { key: "barcode", label: "Barcode" },
      { key: "quantityType", label: "Unit" },
      { key: "quantity", label: "Quantity" },
      { key: "purchase_price", label: "Purchase Price" },
      { key: "mrp", label: "MRP" },
      { key: "selling_price", label: "Selling Price" },
      { key: "wholesale_price", label: "Wholesale Price" },
      { key: "online_retail_price", label: "Online Retail Price" },
      { key: "expiryDate", label: "Expiry Date" },
      { key: "rackId", label: "Rack Location" },
      { key: "batchNumber", label: "Batch Number" },
      { key: "openingStock", label: "Opening Stock" },
      { key: "low_stock_alert", label: "Low Stock Alert" },
      { key: "gst_percentage", label: "GST Percentage" },
      { key: "hsnsacId", label: "HSN/SAC" },
      { key: "categoryId", label: "Category" },
      { key: "subcategoryId", label: "Sub Category" },
      { key: "brandId", label: "Brand" },
      { key: "sizeId", label: "Size" },
      { key: "colourId", label: "Colour" },
      { key: "styleId", label: "Style" },
      { key: "packOf", label: "Pack Of" },
      { key: "online_visibility", label: "Online Visibility" },
    ],
    "Visuals & Description": [
      { key: "product_images", label: "Product Images" },
      { key: "attachments", label: "Document Attachments" },
      { key: "short_description", label: "Short Description" },
      { key: "large_description", label: "Large Description" },
    ],
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15,23,42,0.4)",
        backdropFilter: "blur(10px)",
        zIndex: 1055,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(30px)",
          borderRadius: "24px",
          width: "720px",
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflow: "hidden",
          boxShadow: "0 40px 80px rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: "#1e293b" }}>
            <Settings size={16} /> Field Visibility Settings
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          />
        </div>
        <div className="p-4 overflow-auto" style={{ maxHeight: "calc(90vh - 120px)" }}>
          {Object.entries(fieldGroups).map(([groupName, fields]) => (
            <div key={groupName} className="mb-4">
              <h6 className="text-uppercase fw-bold mb-3 border-bottom pb-2" style={{ fontSize: 11, color: "#64748b" }}>
                {groupName}
              </h6>
              <div className="row g-2">
                {fields.map((field) => (
                  <div key={field.key} className="col-md-6">
                    <div
                      className="form-check form-switch p-3 rounded-3 d-flex flex-row align-items-center gap-2"
                      style={{ background: "rgba(255,255,255,0.5)" }}
                    >
                      <input
                        className="form-check-input ms-0"
                        type="checkbox"
                        checked={fieldVisibility[field.key] !== false}
                        onChange={() => onFieldToggle(field.key)}
                        id={`field-${field.key}`}
                      />
                      <label className="form-check-label flex-grow-1 fw-medium" htmlFor={`field-${field.key}`}>
                        {field.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-top text-end">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
            style={{ borderRadius: "12px", padding: "8px 24px" }}
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== Main Component ====================
const AddProduct = ({ isModal = false, onClose, onSuccess, categories: propCategories = [] }) => {
  const navigate = useNavigate();
  const route = all_routes;
  const token = localStorage.getItem("authToken");

  const searchContainerRef = useRef(null);

  // ---------- Tabs ----------
  const [activeTab, setActiveTab] = useState(1); // 1 = Basic Details, 2 = Description

  // ---------- Field Visibility ----------
  const [fieldVisibility, setFieldVisibility] = useState(() => {
    const saved = localStorage.getItem("productFieldSettings");
    return saved
      ? JSON.parse(saved)
      : {
          supplierId: true,
          name: true,
          barcode: true,
          quantityType: true,
          quantity: true,
          purchase_price: true,
          mrp: true,
          selling_price: true,
          wholesale_price: true,
          online_retail_price: true,
          expiryDate: true,
          rackId: true,
          batchNumber: true,
          openingStock: true,
          low_stock_alert: true,
          gst_percentage: true,
          hsnsacId: true,
          categoryId: true,
          subcategoryId: true,
          brandId: true,
          sizeId: true,
          colourId: true,
          styleId: true,
          packOf: true,
          online_visibility: true,
          product_images: true,
          attachments: true,
          short_description: true,
          large_description: true,
        };
  });

  const [showSettings, setShowSettings] = useState(false);

  const handleFieldToggle = (key) => {
    const updated = { ...fieldVisibility, [key]: !fieldVisibility[key] };
    setFieldVisibility(updated);
    localStorage.setItem("productFieldSettings", JSON.stringify(updated));
  };

  // ---------- Form Data ----------
  const [formData, setFormData] = useState({
    supplierId: "",
    name: "",
    barcode: "",
    categoryId: "",
    subcategoryId: "",
    brandId: "",
    sizeId: "",
    colourId: "",
    styleId: "",
    quantity: "",
    quantityType: "",
    expiryDate: "",
    hsnsacId: "",
    qrcode: "",
    purchase_price: "",
    mrp: "",
    selling_price: "",
    wholesale_price: "",
    online_retail_price: "",
    gst_percentage: "",
    packOf: "",
    batchNumber: "",
    rackId: "",
    openingStock: "",
    low_stock_alert: "",
    online_visibility: "Yes", // default
  });

  const [editorData, setEditorData] = useState({
    short_description: "",
    large_description: "",
  });

  // ---------- Dropdown Data ----------
  const [dropdownData, setDropdownData] = useState({
    suppliers: [],
    categories: propCategories || [],
    subcategories: [],
    brands: [],
    sizes: [],
    colors: [],
    styles: [],
    hsnsac: [],
    gst: [],
    racks: [],
    quantityTypes: [],
    uomTypes: [],
  });
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [creatingItems, setCreatingItems] = useState({});

  // ---------- Product Search ----------
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [productSearchResults, setProductSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);

  // ---------- Images & Attachments ----------
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [previewModal, setPreviewModal] = useState({ open: false, index: 0 });

  // ---------- Multi-UOM ----------
  const [uomConversions, setUomConversions] = useState([
    { fromUnit: "", toUnit: "", conversionRate: "" },
  ]);

  // ---------- Submitting ----------
  const [submitting, setSubmitting] = useState(false);

  // ---------- Fetch all dropdowns on mount ----------
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    if (!isModal || propCategories.length === 0) fetchAllDropdownData();
    hasFetchedRef.current = true;
    return () => clearTimeout(searchTimeoutRef.current);
  }, [isModal, propCategories]);

  const fetchAllDropdownData = async () => {
    setLoadingDropdowns(true);
    const headers = { Authorization: `Bearer ${token}` };
    const fetchEndpoint = async (url, key, mappingFunc) => {
      try {
        const res = await axios.post(url, {}, { headers });
        if (res.data) setDropdownData((prev) => ({ ...prev, [key]: mappingFunc(res.data) }));
      } catch (error) {
        console.error(`Error fetching ${key}:`, error);
      }
    };
    await Promise.allSettled([
      fetchEndpoint(URLS.GetCategory, "categories", (d) => d.category || []),
      fetchEndpoint(URLS.GetBrand, "brands", (d) => d.brands || []),
      fetchEndpoint(URLS.GetSize, "sizes", (d) => d.sizes || []),
      fetchEndpoint(URLS.GetColour, "colors", (d) => d.colors || []),
      fetchEndpoint(URLS.GetStyle, "styles", (d) => d.style || []),
      fetchEndpoint(URLS.GetHsnSac, "hsnsac", (d) => d.hsnsac || []),
      fetchEndpoint(URLS.GetGst, "gst", (d) => d.gst || []),
      fetchEndpoint(URLS.GetRack, "racks", (d) => d.rack || []),
      fetchEndpoint(URLS.GetQuantityType, "quantityTypes", (d) => d.weights || []),
      fetchEndpoint(URLS.GetSuppliers, "suppliers", (d) => d.data || []),
      fetchEndpoint(URLS.GetAllUomTypes, "uomTypes", (d) => (Array.isArray(d) ? d : d.data || [])),
    ]);
    setLoadingDropdowns(false);
  };

  // ---------- Create new dropdown item ----------
  const createDropdownItem = async (type, name) => {
    const endpoints = {
      category: URLS.AddCategory,
      subcategory: URLS.AddSubCategory,
      brand: URLS.AddBrand,
      size: URLS.AddSize,
      colour: URLS.AddColour,
      style: URLS.AddStyle,
      hsnsac: URLS.AddHsnSac,
      gst: URLS.AddGst,
      rack: URLS.AddRack,
      quantityType: URLS.AddUomType,
    };
    if (!endpoints[type]) return;
    setCreatingItems((prev) => ({ ...prev, [type]: true }));
    try {
      const body = { name, ...(type === "subcategory" ? { categoryId: formData.categoryId } : {}) };
      const res = await axios.post(endpoints[type], body, { headers: { Authorization: `Bearer ${token}` } });
      const typeMap = {
        category: "categories",
        subcategory: "subcategories",
        brand: "brands",
        size: "sizes",
        colour: "colors",
        style: "styles",
        hsnsac: "hsnsac",
        gst: "gst",
        rack: "racks",
        quantityType: "uomTypes",
      };
      const createdKey = typeMap[type];
      const createdItem =
        res?.data?.[type] ||
        res?.data?.data ||
        res?.data?.category ||
        res?.data?.subcategory ||
        res?.data?.brand ||
        res?.data?.size ||
        res?.data?.colour ||
        res?.data?.style ||
        res?.data?.hsnsac ||
        res?.data?.gst ||
        res?.data?.rack ||
        res?.data?.quantityType;
      if (createdKey && createdItem) {
        setDropdownData((prev) => ({ ...prev, [createdKey]: [...prev[createdKey], createdItem] }));
      }
      return res;
    } finally {
      setCreatingItems((prev) => ({ ...prev, [type]: false }));
    }
  };

  // ---------- Product search ----------
  const handleProductSearch = useCallback(
    (name) => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (!name.trim()) return setProductSearchResults([]);
      setSearchingProducts(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await axios.post(
            `${URLS.GetProductsFromLibrary}${encodeURIComponent(name)}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setProductSearchResults(res.data.data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setSearchingProducts(false);
        }
      }, 500);
    },
    [token]
  );

  const handleProductSelect = async (id) => {
    try {
      const res = await axios.post(
        URLS.GetProductById,
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const p = res.data.data;
      setFormData((prev) => ({
        ...prev,
        name: p.name || "",
        categoryId: String(p.categoryId || ""),
        subcategoryId: String(p.subcategoryId || ""),
        brandId: String(p.brandId || ""),
        sizeId: String(p.sizeId || ""),
        colourId: String(p.colourId || ""),
        styleId: String(p.styleId || ""),
        hsnsacId: String(p.hsnsacId || ""),
        supplierId: String(p.supplierId || ""),
        rackId: String(p.rackId || ""),
        quantityType: p.quantityType || "",
        barcode: p.barcode || "",
        qrcode: p.qrcode || "",
        quantity: p.quantity || "",
        expiryDate: p.expiryDate || "",
        purchase_price: p.purchase_price || "",
        mrp: p.mrp || "",
        selling_price: p.selling_price || "",
        wholesale_price: p.wholesale_price || "",
        online_retail_price: p.online_retail_price || "",
        gst_percentage: String(p.gst_percentage || ""),
        packOf: p.packOf || "",
        batchNumber: p.batchNumber || "",
        openingStock: p.openingStock || "",
        low_stock_alert: p.low_stock_alert || "",
        online_visibility: p.online_visibility || "Yes",
      }));
      setEditorData({
        short_description: p.short_description || "",
        large_description: p.large_description || "",
      });
      setProductSearchResults([]);
      if (!isModal) toast.success("Product details loaded");
    } catch (err) {
      console.error(err);
    }
  };

  // ---------- Category change (load subcategories) ----------
  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setFormData((prev) => ({ ...prev, categoryId, subcategoryId: "" }));
    if (categoryId) {
      try {
        const response = await axios.post(
          URLS.GetByCategoryID,
          { categoryId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDropdownData((prev) => ({ ...prev, subcategories: response.data.subcategories || [] }));
      } catch {
        setDropdownData((prev) => ({ ...prev, subcategories: [] }));
      }
    } else {
      setDropdownData((prev) => ({ ...prev, subcategories: [] }));
    }
  };

  // ---------- Generic input change ----------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") handleProductSearch(value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------- Image handling ----------
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error("Max 5 images allowed");
      return;
    }
    const validFiles = files.filter(
      (f) =>
        ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(f.type) &&
        f.size <= 5 * 1024 * 1024
    );
    if (validFiles.length !== files.length)
      toast.warning("Some files were rejected (Invalid type or size)");
    setImages((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index, e) => {
    e.stopPropagation();
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (previewModal.open && previewModal.index === index) {
      setPreviewModal({ open: false, index: 0 });
    }
  };

  const openPreview = (index) => setPreviewModal({ open: true, index });
  const closePreview = () => setPreviewModal({ open: false, index: 0 });
  const prevImage = () =>
    setPreviewModal((p) => ({ ...p, index: (p.index - 1 + images.length) % images.length }));
  const nextImage = () =>
    setPreviewModal((p) => ({ ...p, index: (p.index + 1) % images.length }));

  // ---------- Document handling ----------
  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => f.size <= 10 * 1024 * 1024);
    if (validFiles.length !== files.length) toast.warning("Some files were rejected (Max size 10MB)");
    setAttachments((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeDocument = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- UOM conversions ----------
  const addUomConversion = () => {
    setUomConversions((prev) => [...prev, { fromUnit: "", toUnit: "", conversionRate: "" }]);
  };

  const removeUomConversion = (index) => {
    setUomConversions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateUomConversion = (index, field, value) => {
    setUomConversions((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  // ---------- Submit ----------
  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      setActiveTab(1);
      return toast.error("Product Name is required");
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });

      // Get serviceId from local storage
      const selectedStoreId = localStorage.getItem("selectedStoreId");
      if (selectedStoreId) {
        fd.append("storeId", selectedStoreId);
      }

      fd.append("short_description", editorData.short_description);
      fd.append("large_description", editorData.large_description);
      images.forEach((img) => fd.append("product_images", img));
      attachments.forEach((file) => fd.append("attachments", file));

      // Map UOM conversions to new API format
      const validConversions = uomConversions
        .filter((c) => c.fromUnit && c.toUnit && c.conversionRate)
        .map((c) => ({
          uomTypeId: parseInt(c.fromUnit),
          unitId: parseInt(c.toUnit),
          conversionTrack: parseInt(c.conversionRate),
        }));

      if (validConversions.length > 0) {
        fd.append("uomConversions", JSON.stringify(validConversions));
      }

      await axios.post(URLS.AddProduct, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      handleReset();

      if (isModal) {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        toast.success("Product Added Successfully");
        navigate(route.itemslist);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Reset ----------
  const handleReset = () => {
    setFormData({
      supplierId: "",
      name: "",
      barcode: "",
      categoryId: "",
      subcategoryId: "",
      brandId: "",
      sizeId: "",
      colourId: "",
      styleId: "",
      quantity: "",
      quantityType: "",
      expiryDate: "",
      hsnsacId: "",
      qrcode: "",
      purchase_price: "",
      mrp: "",
      selling_price: "",
      wholesale_price: "",
      online_retail_price: "",
      gst_percentage: "",
      packOf: "",
      batchNumber: "",
      rackId: "",
      openingStock: "",
      low_stock_alert: "",
      online_visibility: "Yes",
    });
    setEditorData({ short_description: "", large_description: "" });
    setImages([]);
    setImagePreviews([]);
    setAttachments([]);
    setUomConversions([{ fromUnit: "", toUnit: "", conversionRate: "" }]);
    setProductSearchResults([]);
    setActiveTab(1);
  };

  // ---------- Render ----------
  if (!isModal && loadingDropdowns) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  const steps = [
    { id: 1, label: "Basic Details" },
    { id: 2, label: "Description" },
  ];

  return (
    <>
      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .pms-root {
          background: linear-gradient(135deg, #fbfbfbff 0%, #aec4f6ff 100%);
          min-height: 100vh;
          padding: 24px;
          padding-top: 100px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .pms-main-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(30px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          padding: 32px;
          margin-bottom: 24px;
        }
        .pms-section-card {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          padding: 16px;
          height: 100%;
        }
        .pms-title {
          font-size: 28px;
          font-weight: 700;
          color: #000;
          margin: 0 0 28px 0;
        }

        /* Stepper */
        .pms-stepper {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 50px;
          padding: 8px;
          margin-bottom: 28px;
          display: flex;
          justify-content: center;
          gap: 4px;
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .pms-step {
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          border-radius: 25px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .pms-step:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #1e293b;
        }
        .pms-step-active {
          background: #ffffff;
          color: #1e293b !important;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        /* Header icon */
        .pms-header-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }

        /* Section title */
        .pms-section-title {
          color: #1e293b;
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Fields */
        .pms-field-group {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 12px;
          padding: 8px 12px;
          margin-bottom: 8px;
        }
        .pms-field-group-dropdown {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 12px;
          margin-bottom: 8px;
        }
        .pms-field-label {
          color: #475569;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 4px;
          display: block;
        }
        .pms-field-input,
        .pms-field-select {
          background: transparent;
          border: none;
          color: #000;
          font-size: 13px;
          font-weight: 500;
          width: 100%;
          padding: 2px 0;
          outline: none;
        }
        .pms-field-select option {
          background: #1e293b;
          color: white;
        }
        .pms-field-textarea {
          background: transparent;
          border: none;
          color: #000;
          font-size: 13px;
          font-weight: 500;
          width: 100%;
          padding: 4px 0;
          outline: none;
          resize: none;
          line-height: 1.6;
        }
        .pms-textarea-short {
          min-height: 120px;
        }
        .pms-textarea-long {
          min-height: 220px;
        }

        /* Price */
        .pms-price-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pms-rupee {
          color: #10b981;
          font-size: 14px;
          font-weight: 700;
        }

        /* Grids (now using Bootstrap row/col, so no custom grid classes needed) */

        /* IMAGE GALLERY CARD */
        .img-upload-zone {
          border: 2px dashed rgba(148, 163, 184, 0.5);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.15);
          padding: 10px 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 14px;
        }
        .img-upload-zone:hover {
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(59, 130, 246, 0.05);
        }
        .img-upload-zone.disabled {
          opacity: 0.45;
          cursor: not-allowed;
          pointer-events: none;
        }
        .img-count-badge {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .img-thumb-grid {
          display: grid;
          grid-template-columns: repeat(5, 50px);
          gap: 6px;
        }
        .img-thumb {
          width: 50px;
          height: 42px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.3);
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.1);
        }
        .img-thumb:hover {
          transform: scale(1.04);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        .img-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .img-thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.2s ease;
        }
        .img-thumb:hover .img-thumb-overlay {
          background: rgba(0, 0, 0, 0.38);
        }
        .img-thumb-btn {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          border: none;
          cursor: pointer;
          opacity: 0;
          transform: scale(0.7);
          transition: all 0.2s ease;
        }
        .img-thumb:hover .img-thumb-btn {
          opacity: 1;
          transform: scale(1);
        }
        .img-thumb-btn-view {
          background: rgba(255, 255, 255, 0.92);
          color: #3b82f6;
        }
        .img-thumb-btn-del {
          background: rgba(239, 68, 68, 0.92);
          color: white;
        }
        .img-thumb-badge {
          position: absolute;
          bottom: 3px;
          left: 3px;
          background: rgba(59, 130, 246, 0.85);
          color: white;
          font-size: 8px;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 6px;
        }
        .img-empty-slot {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          border: 2px dashed rgba(148, 163, 184, 0.25);
          background: rgba(255, 255, 255, 0.06);
        }
        .img-limit-warning {
          font-size: 11px;
          color: #ef4444;
          margin-top: 8px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* PREVIEW MODAL */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .modal-box {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 24px;
          padding: 24px;
          max-width: 700px;
          width: 100%;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.25s ease;
          position: relative;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.05);
          color: #1e293b;
          border: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 2;
        }
        .modal-close:hover {
          background: #ef4444;
          color: white;
        }
        .modal-img-wrap {
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: #f8fafc;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 260px;
          max-height: 420px;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .modal-img-wrap img {
          width: 100%;
          max-height: 420px;
          object-fit: contain;
          display: block;
        }
        .modal-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .modal-filename {
          color: #1e293b;
          font-size: 13px;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 72%;
        }
        .modal-counter {
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
          background: rgba(0, 0, 0, 0.05);
          padding: 4px 12px;
          border-radius: 20px;
          flex-shrink: 0;
        }
        .modal-thumbs {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .modal-thumb {
          width: 54px;
          height: 54px;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
          flex-shrink: 0;
          background: #f1f5f9;
        }
        .modal-thumb:hover {
          transform: scale(1.07);
        }
        .modal-thumb.active {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        .modal-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .modal-nav-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .modal-nav-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.05);
          color: #1e293b;
          border: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .modal-nav-btn:hover {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .modal-nav-label {
          color: #64748b;
          font-size: 12px;
          font-weight: 500;
          min-width: 60px;
          text-align: center;
        }

        /* Document Upload */
        .pms-doc-upload-area {
          border: 2px dashed rgba(148, 163, 184, 0.5);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.15);
          padding: 22px 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 12px;
        }
        .pms-doc-upload-area:hover {
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(59, 130, 246, 0.05);
        }
        .pms-doc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          padding: 8px 12px;
          margin-bottom: 6px;
        }
        .pms-doc-item-name {
          font-size: 12px;
          font-weight: 500;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 72%;
        }
        .pms-doc-item-size {
          font-size: 11px;
          color: #64748b;
          margin-right: 8px;
          flex-shrink: 0;
        }
        .pms-doc-remove {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: none;
          border-radius: 6px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .pms-doc-empty {
          color: #94a3b8;
          font-size: 12px;
          text-align: center;
          padding: 12px 0;
        }

        /* Misc buttons */
        .pms-add-conversion {
          background: rgba(255, 255, 255, 0.2);
          color: #000;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }
        .pms-action-btn {
          background: rgba(255, 255, 255, 0.15);
          color: #000;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
        }

        /* Toggle */
        .pms-toggle-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pms-toggle {
          position: relative;
          width: 42px;
          height: 24px;
          flex-shrink: 0;
        }
        .pms-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .pms-toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(203, 213, 225, 0.8);
          border-radius: 24px;
          transition: 0.3s;
        }
        .pms-toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.3s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .pms-toggle input:checked + .pms-toggle-slider {
          background: #3b82f6;
        }
        .pms-toggle input:checked + .pms-toggle-slider:before {
          transform: translateX(18px);
        }

        /* Bottom buttons */
        .pms-btn-container {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .pms-btn {
          padding: 10px 28px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          transition: all 0.3s ease;
        }
        .pms-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        .pms-btn-next {
          background: rgba(255, 255, 255, 0.2);
          color: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .pms-btn-add {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .pms-btn-add:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
        }

        /* Search dropdown */
        .pms-search-dd {
          position: absolute;
          width: 100%;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          margin-top: 4px;
          overflow: hidden;
          z-index: 9999;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .pms-search-item {
          padding: 10px 14px;
          cursor: pointer;
          font-size: 13px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          color: #1e293b;
          transition: background 0.2s ease;
        }
        .pms-search-item:last-child {
          border-bottom: none;
        }
        .pms-search-item:hover {
          background: #f8fafc;
        }
      `}</style>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* IMAGE PREVIEW MODAL */}
      {previewModal.open && images.length > 0 && (
        <div className="modal-backdrop" onClick={closePreview}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closePreview}>
              <i className="bi bi-x"></i>
            </button>
            <div className="modal-info">
              <span className="modal-filename">
                <i className="bi bi-image me-2" style={{ color: "#60a5fa" }}></i>
                {images[previewModal.index]?.name}
              </span>
              <span className="modal-counter me-5">
                {previewModal.index + 1} / {images.length}
              </span>
            </div>
            <div className="modal-img-wrap">
              <img src={imagePreviews[previewModal.index]} alt="Preview" />
            </div>
            {images.length > 1 && (
              <div className="modal-nav-row">
                <button className="modal-nav-btn" onClick={prevImage}>
                  <i className="bi bi-chevron-left"></i>
                </button>
                <span className="modal-nav-label">Navigate</span>
                <button className="modal-nav-btn" onClick={nextImage}>
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
            {images.length > 1 && (
              <div className="modal-thumbs">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`modal-thumb ${previewModal.index === idx ? "active" : ""}`}
                    onClick={() => setPreviewModal((p) => ({ ...p, index: idx }))}
                  >
                    <img src={imagePreviews[idx]} alt={`t-${idx}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pms-root">
        <div style={{ maxWidth: "95%", margin: "0 auto" }}>
          {/* Stepper */}
          <div className="pms-stepper">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`pms-step ${activeTab === step.id ? "pms-step-active" : ""}`}
                onClick={() => setActiveTab(step.id)}
              >
                <span style={{ opacity: activeTab === step.id ? 1 : 0.6 }}>{step.id}</span>
                {step.label}
              </div>
            ))}
          </div>

          {/* Main Card */}
          <div className="pms-main-card">
            {/* Header with title and settings button */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="pms-title" style={{ margin: 0 }}>Add Product</h1>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-light btn-sm d-flex align-items-center gap-1"
                  onClick={() => navigate(-1)}
                  style={{ borderRadius: "12px", padding: "8px 16px" }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  className="btn btn-light btn-sm d-flex align-items-center gap-1"
                  onClick={() => setShowSettings(true)}
                  style={{ borderRadius: "12px", padding: "8px 16px" }}
                >
                  <Settings size={16} /> Fields
                </button>
              </div>
            </div>

            {/* TAB 1: BASIC DETAILS */}
            {activeTab === 1 && (
              <div className="row g-4">
                {/* LEFT COLUMN */}
                <div className="col-lg-7 d-flex flex-column gap-3">
                  {/* Product & Pricing */}
                  <div className="pms-section-card">
                    <div className="pms-section-title">
                      <div
                        className="pms-header-icon"
                        style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}
                      >
                        <i className="bi bi-box-seam"></i>
                      </div>
                      Product & Pricing
                    </div>

                    {/* Product Name (always visible) */}
                    {fieldVisibility.name && (
                      <>
                        <div className="pms-field-label">Product Name</div>
                        <div className="pms-field-group position-relative" ref={searchContainerRef}>
                          <input
                            className="pms-field-input"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Nike Air Max"
                          />
                          {searchingProducts && (
                            <small
                              style={{
                                color: "#94a3b8",
                                fontSize: 11,
                                position: "absolute",
                                right: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            >
                              Searching...
                            </small>
                          )}
                          {productSearchResults.length > 0 &&
                            createPortal(
                              <div
                                className="pms-search-dd"
                                style={{
                                  position: "fixed",
                                  top: searchContainerRef.current
                                    ? searchContainerRef.current.getBoundingClientRect().bottom + 4
                                    : 0,
                                  left: searchContainerRef.current
                                    ? searchContainerRef.current.getBoundingClientRect().left
                                    : 0,
                                  width: searchContainerRef.current
                                    ? searchContainerRef.current.offsetWidth
                                    : "auto",
                                  backgroundColor: "#ffffff",
                                  opacity: 1,
                                  zIndex: 1000000,
                                  maxHeight: "300px",
                                  overflowY: "auto",
                                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                                  border: "1px solid rgba(0,0,0,0.1)",
                                  borderRadius: "12px",
                                }}
                              >
                                {productSearchResults.map((p) => (
                                  <div
                                    key={p.id}
                                    className="pms-search-item"
                                    style={{
                                      backgroundColor: "#ffffff",
                                      color: "#1e293b",
                                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                                      cursor: "pointer",
                                      padding: "10px 14px",
                                    }}
                                    onClick={() => handleProductSelect(p.id)}
                                  >
                                    <div className="fw-semibold" style={{ fontSize: "14px" }}>
                                      {p.name}
                                    </div>
                                  </div>
                                ))}
                              </div>,
                              document.body
                            )}
                        </div>
                      </>
                    )}

                    {/* Row 1: Unit, Quantity, Expiry Date */}
                    <div className="row g-2">
                      {fieldVisibility.quantityType && (
                        <div className="col-lg-4 col-md-6">
                          <SelectWithCreate
                            label="Unit"
                            name="quantityType"
                            value={formData.quantityType}
                            options={dropdownData.uomTypes}
                            onChange={handleInputChange}
                            onCreateNew={(n) => createDropdownItem("quantityType", n)}
                            isCreating={creatingItems.quantityType}
                            wrapperClass=""
                          />
                        </div>
                      )}
                      {fieldVisibility.quantity && (
                        <div className="col-lg-4 col-md-6">
                          <div className="pms-field-label">Quantity</div>
                          <div className="pms-field-group">
                            <input
                              className="pms-field-input"
                              name="quantity"
                              value={formData.quantity}
                              onChange={handleInputChange}
                              placeholder="Enter quantity"
                            />
                          </div>
                        </div>
                      )}
                      {fieldVisibility.expiryDate && (
                        <div className="col-lg-4 col-md-6">
                          <div className="pms-field-label">Expiry Date</div>
                          <div className="pms-field-group mb-0">
                            <input
                              className="pms-field-input"
                              type="date"
                              name="expiryDate"
                              value={formData.expiryDate}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Row 2: Barcode, Pack Off, Batch Number */}
                    <div className="row g-2">
                      {fieldVisibility.barcode && (
                        <div className="col-lg-4 col-md-6">
                          <div className="pms-field-label">Barcode</div>
                          <div className="pms-field-group">
                            <input
                              className="pms-field-input"
                              name="barcode"
                              value={formData.barcode}
                              onChange={handleInputChange}
                              placeholder="Enter Barcode"
                            />
                          </div>
                        </div>
                      )}
                      {fieldVisibility.packOf && (
                        <div className="col-lg-4 col-md-6">
                          <div className="pms-field-label">Pack Off</div>
                          <div className="pms-field-group">
                            <input
                              className="pms-field-input"
                              name="packOf"
                              value={formData.packOf}
                              onChange={handleInputChange}
                              placeholder="Enter pack off"
                            />
                          </div>
                        </div>
                      )}
                      {fieldVisibility.batchNumber && (
                        <div className="col-lg-4 col-md-6">
                          <div className="pms-field-label">Batch Number</div>
                          <div className="pms-field-group mb-0">
                            <input
                              className="pms-field-input"
                              name="batchNumber"
                              value={formData.batchNumber}
                              onChange={handleInputChange}
                              placeholder="Enter Batch Number"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stock & Tax */}
                  <div className="pms-section-card">
                    <div className="pms-section-title">
                      <div
                        className="pms-header-icon"
                        style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}
                      >
                        <i className="bi bi-bar-chart"></i>
                      </div>
                      Stock & Tax
                    </div>
                    <div className="row g-2">
                      {fieldVisibility.openingStock && (
                        <div className="col-md-6">
                          <div className="pms-field-label">Opening Stock</div>
                          <div className="pms-field-group">
                            <input
                              className="pms-field-input"
                              name="openingStock"
                              value={formData.openingStock}
                              onChange={handleInputChange}
                              placeholder="e.g. 350"
                            />
                          </div>
                        </div>
                      )}
                      {fieldVisibility.low_stock_alert && (
                        <div className="col-md-6">
                          <div className="pms-field-label">Stock Alert</div>
                          <div className="pms-field-group">
                            <input
                              className="pms-field-input"
                              name="low_stock_alert"
                              value={formData.low_stock_alert}
                              onChange={handleInputChange}
                              placeholder="e.g. 50"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="row g-2">
                      {fieldVisibility.gst_percentage && (
                        <div className="col-md-6">
                          <SelectWithCreate
                            label="GST %"
                            name="gst_percentage"
                            value={formData.gst_percentage}
                            options={dropdownData.gst}
                            onChange={handleInputChange}
                            onCreateNew={(n) => createDropdownItem("gst", n)}
                            isCreating={creatingItems.gst}
                            wrapperClass=""
                          />
                        </div>
                      )}
                      {fieldVisibility.hsnsacId && (
                        <div className="col-md-6">
                          <SelectWithCreate
                            label="HSN/SAC"
                            name="hsnsacId"
                            value={formData.hsnsacId}
                            options={dropdownData.hsnsac}
                            onChange={handleInputChange}
                            onCreateNew={(n) => createDropdownItem("hsnsac", n)}
                            isCreating={creatingItems.hsnsac}
                            wrapperClass=""
                          />
                        </div>
                      )}
                    </div>
                    <div className="row g-2">
                      {fieldVisibility.rackId && (
                        <div className="col-md-6">
                          <SelectWithCreate
                            label="Rack Location"
                            name="rackId"
                            value={formData.rackId}
                            options={dropdownData.racks}
                            onChange={handleInputChange}
                            onCreateNew={(n) => createDropdownItem("rack", n)}
                            isCreating={creatingItems.rack}
                            wrapperClass=""
                          />
                        </div>
                      )}
                      {fieldVisibility.online_visibility && (
                        <div className="col-md-6">
                          <div className="pms-field-label">Online Visibility</div>
                          <div
                            className="pms-field-group d-flex align-items-center"
                            style={{ padding: "10px 12px" }}
                          >
                            <div className="pms-toggle-wrapper">
                              <label className="pms-toggle">
                                <input
                                  type="checkbox"
                                  name="online_visibility"
                                  checked={formData.online_visibility === "Yes"}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      online_visibility: e.target.checked ? "Yes" : "No",
                                    }))
                                  }
                                />
                                <span className="pms-toggle-slider"></span>
                              </label>
                              <span style={{ fontSize: "12px", color: "#475569", fontWeight: 500 }}>
                                Visible Online
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multi-UOM (always visible) */}
                  <div className="pms-section-card">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="pms-section-title mb-0">
                        <div
                          className="pms-header-icon"
                          style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}
                        >
                          <i className="bi bi-arrow-left-right"></i>
                        </div>
                        Multi-UOM Conversions
                      </div>
                      <button className="pms-add-conversion" onClick={addUomConversion}>
                        + Add Conversion
                      </button>
                    </div>

                    {uomConversions.map((row, idx) => (
                      <div className="row g-2 align-items-center mb-2" key={idx}>
                        <div className="col-4">
                          <SelectWithCreate
                            label={idx === 0 ? "From Unit" : ""}
                            name="fromUnit"
                            value={row.fromUnit}
                            options={dropdownData.uomTypes}
                            onChange={(e) => updateUomConversion(idx, "fromUnit", e.target.value)}
                            onCreateNew={(n) => createDropdownItem("quantityType", n)}
                            isCreating={creatingItems.quantityType}
                            wrapperClass="mb-0"
                          />
                        </div>
                        <div className="col-3">
                          {idx === 0 && <span className="pms-field-label">Conversion Factor</span>}
                          <div className="pms-field-group mb-0">
                            <input
                              className="pms-field-input"
                              value={row.conversionRate}
                              placeholder="e.g. 12"
                              onChange={(e) =>
                                updateUomConversion(idx, "conversionRate", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="col-4">
                          <SelectWithCreate
                            label={idx === 0 ? "To Unit" : ""}
                            name="toUnit"
                            value={row.toUnit}
                            options={dropdownData.uomTypes}
                            onChange={(e) => updateUomConversion(idx, "toUnit", e.target.value)}
                            onCreateNew={(n) => createDropdownItem("quantityType", n)}
                            isCreating={creatingItems.quantityType}
                            wrapperClass="mb-0"
                          />
                        </div>
                        <div className="col-1 d-flex align-items-end" style={{ paddingTop: idx === 0 ? "18px" : "0" }}>
                          <div
                            className="pms-action-btn"
                            onClick={() => removeUomConversion(idx)}
                            title="Remove row"
                          >
                            −
                          </div>
                        </div>
                      </div>
                    ))}

                    {uomConversions.length === 0 && (
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "12px",
                          textAlign: "center",
                          padding: "12px 0",
                        }}
                      >
                        No conversions added yet. Click "+ Add Conversion" to begin.
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-lg-5 d-flex flex-column gap-3">
                  {/* IMAGES CARD */}
                  {fieldVisibility.product_images && (
                    <div className="pms-section-card">
                      <div className="pms-section-title">
                        <div
                          className="pms-header-icon"
                          style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}
                        >
                          <i className="bi bi-images"></i>
                        </div>
                        Product Images
                      </div>

                      <div style={{ display: "flex", gap: "12px" }}>
                        {/* Left half: Upload zone */}
                        <div
                          style={{
                            flex: "1",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          <input
                            type="file"
                            id="product-image-upload"
                            className="d-none"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                          />
                          <label
                            htmlFor="product-image-upload"
                            className={`img-upload-zone d-block ${images.length >= 5 ? "disabled" : ""}`}
                            style={{ marginBottom: 0 }}
                          >
                            <i
                              className="bi bi-cloud-arrow-up"
                              style={{ fontSize: "22px", color: "#94a3b8" }}
                            ></i>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#64748b",
                                fontWeight: "500",
                                marginTop: "4px",
                              }}
                            >
                              Click to upload images
                            </div>
                            <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>
                              PNG, JPG, WEBP – up to 5 images
                            </div>
                          </label>
                        </div>

                        {/* Right half: Thumbnail grid */}
                        <div
                          style={{
                            flex: "1",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          <div className="img-thumb-grid" style={{ minHeight: "60px" }}>
                            {Array.from({ length: 5 }).map((_, idx) => {
                              const img = images[idx];
                              return img ? (
                                <div
                                  key={idx}
                                  className="img-thumb"
                                  onClick={() => openPreview(idx)}
                                >
                                  <img src={imagePreviews[idx]} alt={`img-${idx}`} />
                                  {idx === 0 && <span className="img-thumb-badge">Main</span>}
                                  <div className="img-thumb-overlay">
                                    <button
                                      className="img-thumb-btn img-thumb-btn-view"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openPreview(idx);
                                      }}
                                      title="Preview"
                                    >
                                      <i className="bi bi-eye"></i>
                                    </button>
                                    <button
                                      className="img-thumb-btn img-thumb-btn-del"
                                      onClick={(e) => {
                                        removeImage(idx, e);
                                      }}
                                      title="Remove"
                                    >
                                      <i className="bi bi-trash3"></i>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div key={idx} className="img-empty-slot"></div>
                              );
                            })}
                          </div>
                          <div className="img-count-badge" style={{ marginTop: "8px" }}>
                            <span>{images.length}/5 uploaded</span>
                            {images.length === 0 && (
                              <span style={{ color: "#3b82f6", fontSize: "10px" }}>
                                Click thumbnail to preview
                              </span>
                            )}
                          </div>
                          {images.length >= 5 && (
                            <div className="img-limit-warning" style={{ marginTop: "4px", fontSize: "10px" }}>
                              <i className="bi bi-exclamation-circle"></i>
                              Maximum 5 images only.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="pms-section-card">
                    <div className="pms-section-title">
                      <div
                        className="pms-header-icon"
                        style={{ background: "rgba(234,179,8,0.1)", color: "#eab308" }}
                      >
                        <i className="bi bi-coin"></i>
                      </div>
                      Pricing
                    </div>
                    <div className="row g-2">
                      {fieldVisibility.supplierId && (
                        <div className="col-md-6">
                          <SelectWithCreate
                            label="Select Supplier"
                            name="supplierId"
                            value={formData.supplierId}
                            options={dropdownData.suppliers}
                            onChange={handleInputChange}
                            onCreateNew={(n) => createDropdownItem("supplier", n)}
                            isCreating={creatingItems.supplier}
                            wrapperClass=""
                          />
                        </div>
                      )}
                      {fieldVisibility.wholesale_price && (
                        <div className="col-md-6">
                          <div className="pms-field-label">Wholesale Price</div>
                          <div className="pms-field-group">
                            <div className="pms-price-group">
                              <span className="pms-rupee">₹</span>
                              <input
                                className="pms-field-input"
                                name="wholesale_price"
                                value={formData.wholesale_price}
                                onChange={handleInputChange}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="row g-2">
                      {fieldVisibility.purchase_price && (
                        <div className="col-md-6">
                          <div className="pms-field-label">Purchase Price</div>
                          <div className="pms-field-group">
                            <div className="pms-price-group">
                              <span className="pms-rupee">₹</span>
                              <input
                                className="pms-field-input"
                                name="purchase_price"
                                value={formData.purchase_price}
                                onChange={handleInputChange}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {fieldVisibility.selling_price && (
                        <div className="col-md-6">
                          <div className="pms-field-label">Selling Price</div>
                          <div className="pms-field-group">
                            <div className="pms-price-group">
                              <span className="pms-rupee">₹</span>
                              <input
                                className="pms-field-input"
                                name="selling_price"
                                value={formData.selling_price}
                                onChange={handleInputChange}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="row g-2">
                      {fieldVisibility.online_retail_price && (
                        <div className="col-md-6">
                          <div className="pms-field-label">Online Price</div>
                          <div className="pms-field-group">
                            <div className="pms-price-group">
                              <span className="pms-rupee">₹</span>
                              <input
                                className="pms-field-input"
                                name="online_retail_price"
                                value={formData.online_retail_price}
                                onChange={handleInputChange}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {fieldVisibility.mrp && (
                        <div className="col-md-6">
                          <div className="pms-field-label">MRP</div>
                          <div className="pms-field-group">
                            <div className="pms-price-group">
                              <span className="pms-rupee">₹</span>
                              <input
                                className="pms-field-input"
                                name="mrp"
                                value={formData.mrp}
                                onChange={handleInputChange}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Classification */}
                  <div className="pms-section-card">
                    <div className="pms-section-title">
                      <div
                        className="pms-header-icon"
                        style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}
                      >
                        <i className="bi bi-grid-3x3-gap"></i>
                      </div>
                      Classification
                    </div>
                    <div className="row g-2">
                      {fieldVisibility.categoryId && (
                        <div className="col-md-6">
                          <SelectWithCreate
                            label="Category"
                            name="categoryId"
                            value={formData.categoryId}
                            options={dropdownData.categories}
                            onChange={handleCategoryChange}
                            onCreateNew={(n) => createDropdownItem("category", n)}
                            isCreating={creatingItems.category}
                            wrapperClass=""
                          />
                        </div>
                      )}
                      {fieldVisibility.subcategoryId && (
                        <div className="col-md-6">
                          <SelectWithCreate
                            label="Sub Category"
                            name="subcategoryId"
                            value={formData.subcategoryId}
                            options={dropdownData.subcategories}
                            onChange={handleInputChange}
                            onCreateNew={(n) => createDropdownItem("subcategory", n)}
                            isCreating={creatingItems.subcategory}
                            disabled={!formData.categoryId}
                            wrapperClass=""
                          />
                        </div>
                      )}
                    </div>
                    <div className="row g-2">
                      {fieldVisibility.brandId && (
                        <div className="col-md-6">
                          <SelectWithCreate
                            label="Brand"
                            name="brandId"
                            value={formData.brandId}
                            options={dropdownData.brands}
                            onChange={handleInputChange}
                            onCreateNew={(n) => createDropdownItem("brand", n)}
                            isCreating={creatingItems.brand}
                            wrapperClass=""
                          />
                        </div>
                      )}
                      {fieldVisibility.sizeId && (
                        <div className="col-md-6">
                          <SelectWithCreate
                            label="Size"
                            name="sizeId"
                            value={formData.sizeId}
                            options={dropdownData.sizes}
                            onChange={handleInputChange}
                            onCreateNew={(n) => createDropdownItem("size", n)}
                            isCreating={creatingItems.size}
                            wrapperClass=""
                          />
                        </div>
                      )}
                    </div>
                    <div className="row g-2">
                      {fieldVisibility.colourId && (
                        <div className="col-md-6">
                          <SelectWithCreate
                            label="Color"
                            name="colourId"
                            value={formData.colourId}
                            options={dropdownData.colors}
                            onChange={handleInputChange}
                            onCreateNew={(n) => createDropdownItem("colour", n)}
                            isCreating={creatingItems.colour}
                            wrapperClass=""
                          />
                        </div>
                      )}
                      {fieldVisibility.styleId && (
                        <div className="col-md-6">
                          <SelectWithCreate
                            label="Style"
                            name="styleId"
                            value={formData.styleId}
                            options={dropdownData.styles}
                            onChange={handleInputChange}
                            onCreateNew={(n) => createDropdownItem("style", n)}
                            isCreating={creatingItems.style}
                            wrapperClass=""
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DESCRIPTION */}
            {activeTab === 2 && (
              <div className="row g-4">
                {/* Short Description */}
                {fieldVisibility.short_description && (
                  <div className="col-lg-6">
                    <div className="pms-section-card">
                      <div className="pms-section-title">
                        <div
                          className="pms-header-icon"
                          style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}
                        >
                          <i className="bi bi-text-paragraph"></i>
                        </div>
                        Short Description
                      </div>
                      <span className="pms-field-label">
                        Brief summary of the product (max 150 characters)
                      </span>
                      <div className="pms-field-group" style={{ marginBottom: 0 }}>
                        <textarea
                          className="pms-field-textarea pms-textarea-short"
                          placeholder="Enter a short description about the product..."
                          value={editorData.short_description}
                          onChange={(e) =>
                            setEditorData((prev) => ({ ...prev, short_description: e.target.value }))
                          }
                          maxLength={150}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Attachments */}
                {fieldVisibility.attachments && (
                  <div className="col-lg-6">
                    <div className="pms-section-card">
                      <div className="pms-section-title">
                        <div
                          className="pms-header-icon"
                          style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
                        >
                          <i className="bi bi-paperclip"></i>
                        </div>
                        Document Attachments
                      </div>
                      <input
                        type="file"
                        id="doc-upload"
                        className="d-none"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                        onChange={handleDocumentChange}
                      />
                      <label htmlFor="doc-upload" className="pms-doc-upload-area d-block">
                        <i
                          className="bi bi-cloud-arrow-up"
                          style={{ fontSize: "28px", color: "#94a3b8" }}
                        ></i>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#64748b",
                            fontWeight: 500,
                            marginTop: "6px",
                          }}
                        >
                          Click to upload or drag & drop
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                          PDF, DOC, XLS, PNG, JPG (max 10MB each)
                        </div>
                      </label>
                      <div style={{ maxHeight: "132px", overflowY: "auto" }}>
                        {attachments.length === 0 ? (
                          <div className="pms-doc-empty">
                            <i
                              className="bi bi-folder2-open"
                              style={{ fontSize: "20px", display: "block", marginBottom: "4px" }}
                            ></i>
                            No documents attached yet
                          </div>
                        ) : (
                          attachments.map((doc, i) => (
                            <div className="pms-doc-item" key={i}>
                              <i
                                className="bi bi-file-earmark-text"
                                style={{ color: "#3b82f6", fontSize: "14px", marginRight: "8px", flexShrink: 0 }}
                              ></i>
                              <span className="pms-doc-item-name">{doc.name}</span>
                              <span className="pms-doc-item-size">
                                {(doc.size / 1024).toFixed(1)} KB
                              </span>
                              <button className="pms-doc-remove" onClick={() => removeDocument(i)}>
                                <i className="bi bi-x"></i>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Long Description */}
                {fieldVisibility.large_description && (
                  <div className="col-12">
                    <div className="pms-section-card">
                      <div className="pms-section-title">
                        <div
                          className="pms-header-icon"
                          style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}
                        >
                          <i className="bi bi-justify-left"></i>
                        </div>
                        Long Description
                      </div>
                      <span className="pms-field-label">
                        Detailed product description for customers
                      </span>
                      <div className="pms-field-group" style={{ marginBottom: 0 }}>
                        <textarea
                          className="pms-field-textarea pms-textarea-long"
                          placeholder="Enter a detailed description including features, specifications, usage instructions..."
                          value={editorData.large_description}
                          onChange={(e) =>
                            setEditorData((prev) => ({ ...prev, large_description: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Buttons */}
            <div className="pms-btn-container">
              {activeTab > 1 && (
                <button
                  className="pms-btn pms-btn-next"
                  onClick={() => setActiveTab(activeTab - 1)}
                >
                  <i className="bi bi-arrow-left"></i>
                  <span>Back</span>
                </button>
              )}
              {activeTab < steps.length && (
                <button
                  className="pms-btn pms-btn-next"
                  onClick={() => setActiveTab(activeTab + 1)}
                >
                  <span>Next</span>
                  <i className="bi bi-arrow-right"></i>
                </button>
              )}
              {activeTab === steps.length && (
                <button
                  className="pms-btn pms-btn-add"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  <i className="bi bi-plus-lg"></i>
                  <span>{submitting ? "Saving..." : "Add Product"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Field Settings Modal */}
      <FieldSettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        fieldVisibility={fieldVisibility}
        onFieldToggle={handleFieldToggle}
      />
    </>
  );
};

export default AddProduct;