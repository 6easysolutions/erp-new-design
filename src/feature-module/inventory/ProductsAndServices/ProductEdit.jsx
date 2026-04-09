import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createPortal } from "react-dom";
import axios from "axios";
import { URLS } from "../../../Urls";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowLeft, Save, Plus, X, Info, Image as ImageIcon, ChevronRight,
  Edit, Settings, RotateCcw, Package
} from "react-feather";
import Select from "react-select";
import { all_routes } from "../../../routes/all_routes";

// ==================== Helper Component: SelectWithCreate (from AddProduct) ====================
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
  wrapperClass = "",
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

// ==================== Field Settings Modal (from AddProduct) ====================
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
          <button type="button" className="btn-close" onClick={onClose} />
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
          <button type="button" className="btn btn-primary" onClick={onClose} style={{ borderRadius: "12px", padding: "8px 24px" }}>
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== Main Component ====================
const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const storeId = localStorage.getItem("selectedStoreId");

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
    online_visibility: "Yes",
  });

  const [editorData, setEditorData] = useState({
    short_description: "",
    large_description: "",
  });

  // ---------- Dropdown Data ----------
  const [dropdownData, setDropdownData] = useState({
    suppliers: [],
    categories: [],
    subcategories: [],
    brands: [],
    sizes: [],
    colors: [],
    styles: [],
    hsnsac: [],
    gst: [],
    racks: [],
    quantityTypes: [],   // UOM types (from GetUomTypes)
  });
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [creatingItems, setCreatingItems] = useState({});

  // ---------- Existing Images & Attachments ----------
  const [existingImages, setExistingImages] = useState([]);     // URLs from API
  const [newImages, setNewImages] = useState([]);               // File objects
  const [imagePreviews, setImagePreviews] = useState([]);       // data URLs for new images

  const [existingAttachments, setExistingAttachments] = useState([]); // URLs from API
  const [newAttachments, setNewAttachments] = useState([]);           // File objects

  // ---------- Multi-UOM ----------
  const [uomConversions, setUomConversions] = useState([]); // array of { fromUnit, toUnit, conversionRate } for UI

  // ---------- UI state ----------
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewModal, setPreviewModal] = useState({ open: false, src: "", name: "" });

  // Ref for search portal positioning (if needed, but not used in edit)
  const searchContainerRef = useRef(null);

  // ---------- Fetch dropdowns (same as AddProduct) ----------
  const fetchAllDropdownData = useCallback(async () => {
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
    ]);
    setLoadingDropdowns(false);
  }, [token]);

  // ---------- Create new dropdown item (same as AddProduct) ----------
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
        quantityType: "quantityTypes",
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

  // ---------- Fetch product ----------
  useEffect(() => {
    const fetchProduct = async () => {
      if (!storeId) {
        toast.error("No store selected");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.post(
          URLS.GetStoreProductById,
          { id, storeId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          const p = res.data.data;

          // Populate form fields
          setFormData({
            supplierId: p.supplierId || "",
            name: p.name || "",
            barcode: p.barcode || "",
            categoryId: p.categoryId || "",
            subcategoryId: p.subcategoryId || "",
            brandId: p.brandId || "",
            sizeId: p.sizeId || "",
            colourId: p.colourId || "",
            styleId: p.styleId || "",
            quantity: p.quantity || "",
            quantityType: p.quantityType || "",
            expiryDate: p.expiryDate ? p.expiryDate.slice(0, 10) : "",
            hsnsacId: p.hsnsacId || "",
            qrcode: p.qrcode || "",
            purchase_price: p.purchase_price || "",
            mrp: p.mrp || "",
            selling_price: p.selling_price || "",
            wholesale_price: p.wholesale_price || "",
            online_retail_price: p.online_retail_price || "",
            gst_percentage: p.gst_percentage || "",
            packOf: p.packOf || "",
            batchNumber: p.batchNumber || "",
            rackId: p.rackId || "",
            openingStock: p.openingStock || "",
            low_stock_alert: p.low_stock_alert || "",
            online_visibility: p.online_visibility || "Yes",
          });

          setEditorData({
            short_description: p.short_description || "",
            large_description: p.large_description || "",
          });

          setExistingImages(p.product_images || []);
          setExistingAttachments(p.attachments || []);

          // Convert API uomConversions to UI format (fromUnit, toUnit, conversionRate)
          if (p.uomConversions && Array.isArray(p.uomConversions)) {
            const uiUoms = p.uomConversions.map((conv) => ({
              fromUnit: conv.uomTypeId?.toString() || "",
              toUnit: conv.unitId?.toString() || "",
              conversionRate: conv.conversionTrack?.toString() || "",
            }));
            setUomConversions(uiUoms);
          } else {
            setUomConversions([]);
          }

          // Load subcategories if category selected
          if (p.categoryId) {
            try {
              const subRes = await axios.post(
                URLS.GetByCategoryID,
                { categoryId: p.categoryId },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setDropdownData((prev) => ({ ...prev, subcategories: subRes.data.subcategories || [] }));
            } catch {
              setDropdownData((prev) => ({ ...prev, subcategories: [] }));
            }
          }
        }
      } catch (error) {
        console.error("Error loading product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchAllDropdownData();
    fetchProduct();
  }, [id, token, storeId, fetchAllDropdownData]);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "categoryId") handleCategoryChange(e);
  };

  // ---------- Image handling ----------
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImages.length;
    if (totalImages + files.length > 5) {
      toast.error("Max 5 images allowed");
      return;
    }
    const validFiles = files.filter(
      (f) =>
        ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(f.type) &&
        f.size <= 5 * 1024 * 1024
    );
    if (validFiles.length !== files.length)
      toast.warning("Some files were rejected (Invalid type or >5MB)");
    setNewImages((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- Attachment handling ----------
  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => f.size <= 10 * 1024 * 1024);
    if (validFiles.length !== files.length)
      toast.warning("Some files were rejected (Max size 10MB)");
    setNewAttachments((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeExistingAttachment = (index) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewAttachment = (index) => {
    setNewAttachments((prev) => prev.filter((_, i) => i !== index));
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setActiveTab(1);
      return toast.error("Product Name is required");
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      // Append basic fields
      Object.entries(formData).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });
      fd.append("short_description", editorData.short_description);
      fd.append("large_description", editorData.large_description);
      fd.append("storeId", storeId);

      // Append existing images as JSON array of URLs
      if (existingImages.length > 0) {
        fd.append("existing_images", JSON.stringify(existingImages));
      }
      // Append new image files
      newImages.forEach((img) => fd.append("product_images", img));

      // Append existing attachments as JSON array of URLs
      if (existingAttachments.length > 0) {
        fd.append("existing_attachments", JSON.stringify(existingAttachments));
      }
      // Append new attachment files
      newAttachments.forEach((file) => fd.append("attachments", file));

      // Format UOM conversions for API: array of { uomTypeId, unitId, conversionTrack }
      const validConversions = uomConversions
        .filter((c) => c.fromUnit && c.toUnit && c.conversionRate)
        .map((c) => ({
          uomTypeId: parseInt(c.fromUnit),
          unitId: parseInt(c.toUnit),
          conversionTrack: parseFloat(c.conversionRate),
        }));
      if (validConversions.length > 0) {
        fd.append("uomConversions", JSON.stringify(validConversions));
      }

      const res = await axios.put(`${URLS.UpdateProduct}/${id}`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("Product updated successfully");
        navigate(all_routes.productlist);
      } else {
        toast.error(res.data.message || "Failed to update product");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating product");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Loading state ----------
  if (loading || loadingDropdowns) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const steps = [
    { id: 1, label: "Basic Details" },
    { id: 2, label: "Description" },
  ];

  const totalImages = existingImages.length + newImages.length;

  // Helper components (same as AddProduct)
  const SectionTitle = ({ icon, color, bg, children }) => (
    <div className="pms-section-title">
      <div className="pms-header-icon" style={{ background: bg, color }}>{icon}</div>
      {children}
    </div>
  );

  const PriceField = ({ label, name, value }) => (
    <>
      <span className="pms-field-label">{label}</span>
      <div className="pms-field-group">
        <div className="pms-price-group">
          <span className="pms-rupee">₹</span>
          <input
            className="pms-field-input"
            type="number"
            step="0.01"
            name={name}
            value={value}
            onChange={handleInputChange}
            placeholder="0.00"
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Copy the exact same <style> block from AddProduct here */}
      <style>{`
        * { box-sizing: border-box; }
        .pms-root {
          background: linear-gradient(135deg, #fbfbfbff 0%, #aec4f6ff 100%);
          min-height: 100vh;
          padding: 24px;
          padding-top: 100px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .pms-main-card {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(30px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          padding: 32px;
          margin-bottom: 24px;
        }
        .pms-section-card {
          background: rgba(255,255,255,0.25);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.3);
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
          background: rgba(255,255,255,0.1);
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
          border: 1px solid rgba(255,255,255,0.2);
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
          border: none;
          background: transparent;
        }
        .pms-step:hover { background: rgba(255,255,255,0.15); color: #1e293b; }
        .pms-step-active {
          background: #ffffff !important;
          color: #1e293b !important;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        /* Header icon */
        .pms-header-icon {
          width: 32px; height: 32px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0;
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
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 12px;
          padding: 8px 12px;
          margin-bottom: 8px;
        }
        .pms-field-group-dropdown {
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255,255,255,0.25);
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
        .pms-field-input, .pms-field-select {
          background: transparent;
          border: none;
          color: #000;
          font-size: 13px;
          font-weight: 500;
          width: 100%;
          padding: 2px 0;
          outline: none;
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
        .pms-textarea-short  { min-height: 120px; }
        .pms-textarea-long   { min-height: 220px; }

        /* Select options */
        .pms-field-select option { background: #1e293b; color: white; }

        /* Price */
        .pms-price-group { display: flex; align-items: center; gap: 6px; }
        .pms-rupee { color: #10b981; font-size: 14px; font-weight: 700; }

        /* Image upload zone */
        .img-upload-zone {
          border: 2px dashed rgba(148,163,184,0.5);
          border-radius: 14px;
          background: rgba(255,255,255,0.15);
          padding: 10px 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 14px;
        }
        .img-upload-zone:hover {
          border-color: rgba(59,130,246,0.5);
          background: rgba(59,130,246,0.05);
        }
        .img-upload-zone.disabled {
          opacity: 0.45; cursor: not-allowed; pointer-events: none;
        }

        /* Image thumbnails */
        .img-count-badge {
          font-size: 11px; color: #64748b; font-weight: 500;
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 10px;
        }
        .img-thumb-grid {
          display: grid;
          grid-template-columns: repeat(5, 50px);
          gap: 6px;
        }
        .img-thumb {
          width: 50px; height: 42px;
          border-radius: 8px; overflow: hidden;
          border: 2px solid rgba(255,255,255,0.3);
          cursor: pointer; position: relative;
          transition: all 0.2s ease;
          background: rgba(255,255,255,0.1);
        }
        .img-thumb:hover { transform: scale(1.04); border-color: rgba(59,130,246,0.5); }
        .img-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .img-thumb-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
        }
        .img-thumb:hover .img-thumb-overlay { background: rgba(0,0,0,0.38); }
        .img-thumb-btn {
          width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; border: none; cursor: pointer;
          opacity: 0; transform: scale(0.7); transition: all 0.2s ease;
        }
        .img-thumb:hover .img-thumb-btn { opacity: 1; transform: scale(1); }
        .img-thumb-btn-del { background: rgba(239,68,68,0.92); color: white; }
        .img-thumb-badge {
          position: absolute; bottom: 3px; left: 3px;
          color: white; font-size: 8px; font-weight: 700;
          padding: 1px 4px; border-radius: 6px;
        }
        .img-empty-slot {
          width: 50px; height: 42px; border-radius: 8px;
          border: 2px dashed rgba(148,163,184,0.25);
          background: rgba(255,255,255,0.06);
        }

        /* Documents */
        .pms-doc-upload-area {
          border: 2px dashed rgba(148,163,184,0.5);
          border-radius: 12px; background: rgba(255,255,255,0.15);
          padding: 22px 16px; text-align: center;
          cursor: pointer; transition: all 0.2s ease; margin-bottom: 12px;
        }
        .pms-doc-upload-area:hover {
          border-color: rgba(59,130,246,0.5);
          background: rgba(59,130,246,0.05);
        }
        .pms-doc-item {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.25);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 10px; padding: 8px 12px; margin-bottom: 6px;
        }
        .pms-doc-item-name {
          font-size: 12px; font-weight: 500; color: #1e293b;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 68%;
        }
        .pms-doc-remove {
          background: rgba(239,68,68,0.1); color: #ef4444;
          border: none; border-radius: 6px;
          width: 24px; height: 24px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; cursor: pointer; flex-shrink: 0;
        }
        .pms-doc-empty {
          color: #94a3b8; font-size: 12px;
          text-align: center; padding: 12px 0;
        }
        .pms-doc-badge {
          font-size: 9px; font-weight: 700;
          padding: 1px 6px; border-radius: 5px;
          flex-shrink: 0; margin-right: 6px;
        }

        /* UOM */
        .pms-add-conversion {
          background: rgba(255,255,255,0.2); color: #000;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 10px; padding: 8px 16px;
          font-size: 12px; font-weight: 500; cursor: pointer;
        }
        .pms-action-btn {
          background: rgba(255,255,255,0.15); color: #000;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px; width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; cursor: pointer;
        }

        /* Toggle */
        .pms-toggle-wrapper { display: flex; align-items: center; gap: 10px; }
        .pms-toggle { position: relative; width: 42px; height: 24px; flex-shrink: 0; }
        .pms-toggle input { opacity: 0; width: 0; height: 0; }
        .pms-toggle-slider {
          position: absolute; cursor: pointer; inset: 0;
          background: rgba(203,213,225,0.8); border-radius: 24px; transition: 0.3s;
        }
        .pms-toggle-slider:before {
          position: absolute; content: ""; height: 18px; width: 18px;
          left: 3px; bottom: 3px; background: white;
          border-radius: 50%; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .pms-toggle input:checked + .pms-toggle-slider { background: #3b82f6; }
        .pms-toggle input:checked + .pms-toggle-slider:before { transform: translateX(18px); }

        /* Bottom Buttons */
        .pms-btn-container {
          display: flex; justify-content: flex-end; gap: 12px;
          margin-top: 32px; padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .pms-btn {
          padding: 10px 28px; border-radius: 12px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          border: none; transition: all 0.3s ease;
        }
        .pms-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
        .pms-btn-next {
          background: rgba(255,255,255,0.2); color: #1e293b;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .pms-btn-save {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white; box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        }
        .pms-btn-save:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 6px 20px rgba(37,99,235,0.4);
        }
        .pms-btn-cancel {
          background: transparent; color: #64748b;
          border: 1px solid rgba(100,116,139,0.3);
        }

        /* Fade-in animation */
        @keyframes pms-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .pms-fade-in { animation: pms-fade 0.22s ease; }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} />

      {/* Image preview modal */}
      {previewModal.open && (
        <div
          onClick={() => setPreviewModal({ open: false, src: "", name: "" })}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: "rgba(255,255,255,0.95)", borderRadius: 20,
            padding: 20, maxWidth: 600, width: "100%",
            boxShadow: "0 40px 80px rgba(0,0,0,0.25)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{previewModal.name}</span>
              <button onClick={() => setPreviewModal({ open: false, src: "", name: "" })}
                style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ borderRadius: 14, overflow: "hidden", background: "#f8fafc", maxHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={previewModal.src} alt={previewModal.name} style={{ width: "100%", maxHeight: 400, objectFit: "contain" }} />
            </div>
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
            <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: 28 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 12, color: "#94a3b8" }}>
                  <Link to="/product-list" style={{ color: "#94a3b8", textDecoration: "none" }}>Inventory</Link>
                  <ChevronRight size={12} />
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>Edit Product</span>
                </div>
                <h1 className="pms-title" style={{ margin: 0 }}>Edit Product</h1>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-light btn-sm d-flex align-items-center gap-1"
                  onClick={() => navigate(-1)}
                  style={{ borderRadius: 12, padding: "8px 16px" }}
                >
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  type="button"
                  className="btn btn-light btn-sm d-flex align-items-center gap-1"
                  onClick={() => setShowSettings(true)}
                  style={{ borderRadius: 12, padding: "8px 16px" }}
                >
                  <Settings size={15} /> Fields
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>

              {/* TAB 1: BASIC DETAILS */}
              {activeTab === 1 && (
                <div className="row g-4 pms-fade-in">
                  {/* LEFT COLUMN */}
                  <div className="col-lg-7 d-flex flex-column gap-3">
                    {/* Product & Pricing */}
                    <div className="pms-section-card">
                      <SectionTitle icon={<Package size={14} />} color="#3b82f6" bg="rgba(59,130,246,0.1)">
                        Product & Pricing
                      </SectionTitle>

                      {/* Product Name */}
                      {fieldVisibility.name && (
                        <>
                          <span className="pms-field-label">Product Name <span style={{ color: "#ef4444" }}>*</span></span>
                          <div className="pms-field-group" ref={searchContainerRef}>
                            <input
                              className="pms-field-input"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="e.g. Nike Air Max"
                            />
                          </div>
                        </>
                      )}

                      {/* Row: Unit, Quantity, Expiry Date */}
                      <div className="row g-2">
                        {fieldVisibility.quantityType && (
                          <div className="col-md-4">
                            <SelectWithCreate
                              label="Unit"
                              name="quantityType"
                              value={formData.quantityType}
                              options={dropdownData.quantityTypes}
                              onChange={handleInputChange}
                              onCreateNew={(n) => createDropdownItem("quantityType", n)}
                              isCreating={creatingItems.quantityType}
                              wrapperClass=""
                            />
                          </div>
                        )}
                        {fieldVisibility.quantity && (
                          <div className="col-md-4">
                            <span className="pms-field-label">Quantity</span>
                            <div className="pms-field-group">
                              <input
                                className="pms-field-input"
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                placeholder="Enter quantity"
                              />
                            </div>
                          </div>
                        )}
                        {fieldVisibility.expiryDate && (
                          <div className="col-md-4">
                            <span className="pms-field-label">Expiry Date</span>
                            <div className="pms-field-group">
                              <input
                                className="pms-field-input"
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                style={{ colorScheme: "light" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Row: Barcode, Pack Of, Batch Number */}
                      <div className="row g-2">
                        {fieldVisibility.barcode && (
                          <div className="col-md-4">
                            <span className="pms-field-label">Barcode</span>
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
                          <div className="col-md-4">
                            <span className="pms-field-label">Pack Of</span>
                            <div className="pms-field-group">
                              <input
                                className="pms-field-input"
                                name="packOf"
                                value={formData.packOf}
                                onChange={handleInputChange}
                                placeholder="e.g. 6"
                              />
                            </div>
                          </div>
                        )}
                        {fieldVisibility.batchNumber && (
                          <div className="col-md-4">
                            <span className="pms-field-label">Batch Number</span>
                            <div className="pms-field-group">
                              <input
                                className="pms-field-input"
                                name="batchNumber"
                                value={formData.batchNumber}
                                onChange={handleInputChange}
                                placeholder="e.g. BT-2026"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stock & Tax */}
                    <div className="pms-section-card">
                      <SectionTitle icon={<i className="bi bi-bar-chart" />} color="#3b82f6" bg="rgba(59,130,246,0.1)">
                        Stock & Tax
                      </SectionTitle>

                      <div className="row g-2">
                        {fieldVisibility.openingStock && (
                          <div className="col-md-6">
                            <span className="pms-field-label">Opening Stock</span>
                            <div className="pms-field-group">
                              <input
                                className="pms-field-input"
                                type="number"
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
                            <span className="pms-field-label">Low Stock Alert</span>
                            <div className="pms-field-group">
                              <input
                                className="pms-field-input"
                                type="number"
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
                            <span className="pms-field-label">Online Visibility</span>
                            <div className="pms-field-group d-flex align-items-center" style={{ padding: "10px 12px" }}>
                              <div className="pms-toggle-wrapper">
                                <label className="pms-toggle">
                                  <input
                                    type="checkbox"
                                    name="online_visibility"
                                    checked={formData.online_visibility === "Yes" || formData.online_visibility === "visible"}
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        online_visibility: e.target.checked ? "Yes" : "No",
                                      }))
                                    }
                                  />
                                  <span className="pms-toggle-slider"></span>
                                </label>
                                <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>
                                  Visible Online
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Multi-UOM Conversions */}
                    <div className="pms-section-card">
                      <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: 14 }}>
                        <SectionTitle icon={<i className="bi bi-arrow-left-right" />} color="#3b82f6" bg="rgba(59,130,246,0.1)">
                          Multi-UOM Conversions
                        </SectionTitle>
                        <button type="button" className="pms-add-conversion" onClick={addUomConversion}>
                          + Add Conversion
                        </button>
                      </div>

                      {uomConversions.map((row, idx) => (
                        <div className="row g-2 align-items-center mb-2" key={idx}>
                          <div className="col-4">
                            {idx === 0 && <span className="pms-field-label">From Unit</span>}
                            <SelectWithCreate
                              label=""
                              name="fromUnit"
                              value={row.fromUnit}
                              options={dropdownData.quantityTypes}
                              onChange={(e) => updateUomConversion(idx, "fromUnit", e.target.value)}
                              onCreateNew={(n) => createDropdownItem("quantityType", n)}
                              isCreating={creatingItems.quantityType}
                              wrapperClass="mb-0"
                            />
                          </div>
                          <div className="col-3">
                            {idx === 0 && <span className="pms-field-label">Conversion Rate</span>}
                            <div className="pms-field-group">
                              <input
                                className="pms-field-input"
                                value={row.conversionRate}
                                placeholder="e.g. 12"
                                onChange={(e) => updateUomConversion(idx, "conversionRate", e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="col-4">
                            {idx === 0 && <span className="pms-field-label">To Unit</span>}
                            <SelectWithCreate
                              label=""
                              name="toUnit"
                              value={row.toUnit}
                              options={dropdownData.quantityTypes}
                              onChange={(e) => updateUomConversion(idx, "toUnit", e.target.value)}
                              onCreateNew={(n) => createDropdownItem("quantityType", n)}
                              isCreating={creatingItems.quantityType}
                              wrapperClass="mb-0"
                            />
                          </div>
                          <div className="col-1 d-flex align-items-end" style={{ paddingTop: idx === 0 ? 18 : 0 }}>
                            <div className="pms-action-btn" onClick={() => removeUomConversion(idx)}>
                              −
                            </div>
                          </div>
                        </div>
                      ))}

                      {uomConversions.length === 0 && (
                        <div style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", padding: "12px 0" }}>
                          No conversions added yet. Click "+ Add Conversion" to begin.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="col-lg-5 d-flex flex-column gap-3">
                    {/* Product Images */}
                    {fieldVisibility.product_images && (
                      <div className="pms-section-card">
                        <SectionTitle icon={<ImageIcon size={14} />} color="#3b82f6" bg="rgba(59,130,246,0.1)">
                          Product Images
                        </SectionTitle>

                        <div style={{ display: "flex", gap: 12 }}>
                          {/* Upload zone */}
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <input
                              type="file"
                              id="img-edit-upload"
                              className="d-none"
                              accept="image/*"
                              multiple
                              onChange={handleImageChange}
                            />
                            <label
                              htmlFor="img-edit-upload"
                              className={`img-upload-zone d-block ${totalImages >= 5 ? "disabled" : ""}`}
                              style={{ marginBottom: 0 }}
                            >
                              <i className="bi bi-cloud-arrow-up" style={{ fontSize: 22, color: "#94a3b8" }} />
                              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginTop: 4 }}>
                                Click to upload
                              </div>
                              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                                PNG, JPG, WEBP – max 5 images
                              </div>
                            </label>
                          </div>

                          {/* Thumbnail grid */}
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <div className="img-thumb-grid" style={{ minHeight: 60 }}>
                              {Array.from({ length: 5 }).map((_, idx) => {
                                if (idx < existingImages.length) {
                                  // Existing image
                                  const img = existingImages[idx];
                                  return (
                                    <div
                                      key={`ex-${idx}`}
                                      className="img-thumb"
                                      onClick={() => setPreviewModal({ open: true, src: `${URLS.ImageUrl}${img}`, name: img.split("/").pop() })}
                                    >
                                      <img src={`${URLS.ImageUrl}${img}`} alt={`img-${idx}`} />
                                      {idx === 0 && <span className="img-thumb-badge" style={{ background: "rgba(59,130,246,0.85)" }}>Main</span>}
                                      <div className="img-thumb-overlay">
                                        <button
                                          type="button"
                                          className="img-thumb-btn img-thumb-btn-del"
                                          onClick={(e) => { e.stopPropagation(); removeExistingImage(idx); }}
                                          title="Remove"
                                        >
                                          <X size={9} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                }
                                const newIdx = idx - existingImages.length;
                                if (newIdx < newImages.length) {
                                  // New image
                                  return (
                                    <div
                                      key={`new-${newIdx}`}
                                      className="img-thumb"
                                      onClick={() => setPreviewModal({ open: true, src: imagePreviews[newIdx], name: newImages[newIdx].name })}
                                    >
                                      <img src={imagePreviews[newIdx]} alt={`new-${newIdx}`} />
                                      <span className="img-thumb-badge" style={{ background: "rgba(16,185,129,0.85)" }}>New</span>
                                      <div className="img-thumb-overlay">
                                        <button
                                          type="button"
                                          className="img-thumb-btn img-thumb-btn-del"
                                          onClick={(e) => { e.stopPropagation(); removeNewImage(newIdx); }}
                                          title="Remove"
                                        >
                                          <X size={9} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                }
                                return <div key={`empty-${idx}`} className="img-empty-slot" />;
                              })}
                            </div>
                            <div className="img-count-badge" style={{ marginTop: 8 }}>
                              <span>{totalImages}/5 uploaded</span>
                            </div>
                            {totalImages >= 5 && (
                              <div className="img-limit-warning" style={{ fontSize: 10, color: "#ef4444" }}>
                                <i className="bi bi-exclamation-circle" /> Maximum 5 images only.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="pms-section-card">
                      <SectionTitle icon={<i className="bi bi-coin" />} color="#eab308" bg="rgba(234,179,8,0.1)">
                        Pricing
                      </SectionTitle>

                      <div className="row g-2">
                        {fieldVisibility.supplierId && (
                          <div className="col-md-6">
                            <SelectWithCreate
                              label="Supplier"
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
                            <PriceField label="Wholesale Price" name="wholesale_price" value={formData.wholesale_price} />
                          </div>
                        )}
                      </div>

                      <div className="row g-2">
                        {fieldVisibility.purchase_price && (
                          <div className="col-md-6">
                            <PriceField label="Purchase Price" name="purchase_price" value={formData.purchase_price} />
                          </div>
                        )}
                        {fieldVisibility.selling_price && (
                          <div className="col-md-6">
                            <PriceField label="Selling Price" name="selling_price" value={formData.selling_price} />
                          </div>
                        )}
                      </div>

                      <div className="row g-2">
                        {fieldVisibility.online_retail_price && (
                          <div className="col-md-6">
                            <PriceField label="Online Price" name="online_retail_price" value={formData.online_retail_price} />
                          </div>
                        )}
                        {fieldVisibility.mrp && (
                          <div className="col-md-6">
                            <PriceField label="MRP" name="mrp" value={formData.mrp} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Classification */}
                    <div className="pms-section-card">
                      <SectionTitle icon={<i className="bi bi-grid-3x3-gap" />} color="#3b82f6" bg="rgba(59,130,246,0.1)">
                        Classification
                      </SectionTitle>

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
                              label="Colour"
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
                <div className="row g-4 pms-fade-in">
                  {/* Short Description */}
                  {fieldVisibility.short_description && (
                    <div className="col-lg-6">
                      <div className="pms-section-card">
                        <SectionTitle icon={<i className="bi bi-text-paragraph" />} color="#3b82f6" bg="rgba(59,130,246,0.1)">
                          Short Description
                        </SectionTitle>
                        <span className="pms-field-label">Brief summary (max 300 characters)</span>
                        <div className="pms-field-group" style={{ marginBottom: 0 }}>
                          <textarea
                            className="pms-field-textarea pms-textarea-short"
                            placeholder="Enter a short description..."
                            value={editorData.short_description}
                            onChange={(e) => setEditorData((prev) => ({ ...prev, short_description: e.target.value }))}
                            maxLength={300}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Attachments */}
                  {fieldVisibility.attachments && (
                    <div className="col-lg-6">
                      <div className="pms-section-card">
                        <SectionTitle icon={<i className="bi bi-paperclip" />} color="#10b981" bg="rgba(16,185,129,0.1)">
                          Document Attachments
                        </SectionTitle>

                        <input
                          type="file"
                          id="doc-edit-upload"
                          className="d-none"
                          multiple
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                          onChange={handleAttachmentChange}
                        />
                        <label htmlFor="doc-edit-upload" className="pms-doc-upload-area d-block">
                          <i className="bi bi-cloud-arrow-up" style={{ fontSize: 28, color: "#94a3b8" }} />
                          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500, marginTop: 6 }}>
                            Click to upload or drag & drop
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                            PDF, DOC, XLS, PNG, JPG (max 10MB each)
                          </div>
                        </label>

                        <div style={{ maxHeight: 200, overflowY: "auto" }}>
                          {/* Existing attachments */}
                          {existingAttachments.map((file, i) => (
                            <div className="pms-doc-item" key={`ea-${i}`}>
                              <i className="bi bi-file-earmark-text" style={{ color: "#3b82f6", fontSize: 14, marginRight: 8, flexShrink: 0 }} />
                              <span className="pms-doc-item-name">{file.split("/").pop()}</span>
                              <span className="pms-doc-badge" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                                Saved
                              </span>
                              <button type="button" className="pms-doc-remove" onClick={() => removeExistingAttachment(i)}>
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {/* New attachments */}
                          {newAttachments.map((file, i) => (
                            <div className="pms-doc-item" key={`na-${i}`}>
                              <i className="bi bi-file-earmark-text" style={{ color: "#10b981", fontSize: 14, marginRight: 8, flexShrink: 0 }} />
                              <span className="pms-doc-item-name">{file.name}</span>
                              <span className="pms-doc-badge" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                                New
                              </span>
                              <button type="button" className="pms-doc-remove" onClick={() => removeNewAttachment(i)}>
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {existingAttachments.length === 0 && newAttachments.length === 0 && (
                            <div className="pms-doc-empty">
                              <i className="bi bi-folder2-open" style={{ fontSize: 20, display: "block", marginBottom: 4 }} />
                              No documents attached yet
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Long Description */}
                  {fieldVisibility.large_description && (
                    <div className="col-12">
                      <div className="pms-section-card">
                        <SectionTitle icon={<i className="bi bi-justify-left" />} color="#3b82f6" bg="rgba(59,130,246,0.1)">
                          Detailed Description
                        </SectionTitle>
                        <span className="pms-field-label">Full product description for customers</span>
                        <div className="pms-field-group" style={{ marginBottom: 0 }}>
                          <textarea
                            className="pms-field-textarea pms-textarea-long"
                            placeholder="Enter detailed description including features, specifications, usage..."
                            value={editorData.large_description}
                            onChange={(e) => setEditorData((prev) => ({ ...prev, large_description: e.target.value }))}
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
                    type="button"
                    className="pms-btn pms-btn-next"
                    onClick={() => setActiveTab(activeTab - 1)}
                  >
                    <i className="bi bi-arrow-left" />
                    <span>Back</span>
                  </button>
                )}
                {activeTab < steps.length && (
                  <button
                    type="button"
                    className="pms-btn pms-btn-next"
                    onClick={() => setActiveTab(activeTab + 1)}
                  >
                    <span>Next</span>
                    <i className="bi bi-arrow-right" />
                  </button>
                )}
                {activeTab === steps.length && (
                  <button
                    type="submit"
                    className="pms-btn pms-btn-save"
                    disabled={submitting}
                  >
                    <Save size={15} />
                    {submitting ? "Updating..." : "Update Product"}
                  </button>
                )}
                {/* Cancel button always visible */}
                <button
                  type="button"
                  className="pms-btn pms-btn-cancel"
                  onClick={() => navigate(-1)}
                >
                  <X size={15} /> Cancel
                </button>
              </div>
            </form>
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

export default ProductEdit;