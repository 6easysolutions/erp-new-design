import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import CommonSelect from "../../components/select/common-select";
import axios from "axios";
import { URLS } from "../../Urls";
import SupplierFormModal from "../setup/master/AllMaster/SupplierFormModal";

const PurchaseReturnEdit = () => {
  // State Management
  const [gstType, setGstType] = useState("exclusiveGST");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [returnDate, setReturnDate] = useState("");
  const [debitNoteNumber, setDebitNoteNumber] = useState("");

  // Data States
  const [returnsList, setReturnsList] = useState([]);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [charges, setCharges] = useState([]);

  // Return quantities state
  const [returnQuantities, setReturnQuantities] = useState({});

  // Supplier States
  const [suppliers, setSuppliers] = useState([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // Charges Modal
  const [showChargesModal, setShowChargesModal] = useState(false);

  // Loading & Error States
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [loadingReturnDetails, setLoadingReturnDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Options
  const supplierOptions = [
    { value: "supplier1", label: "Tech Distributors Ltd" },
    { value: "supplier2", label: "Global Electronics" },
    { value: "supplier3", label: "Metro Suppliers" },
    { value: "supplier4", label: "Prime Wholesale" }
  ];

  const gstOptions = [
    { value: "Inclusive", label: "GST Inclusive" },
    { value: "Exclusive", label: "GST Exclusive" },
    { value: "NON_GST", label: "Non GST" },
    { value: "INTRA", label: "INTRA" },
    { value: "INTER", label: "INTER" }
  ];

  const storeOptions = [
    { value: "store1", label: "Main Store" },
    { value: "store2", label: "Warehouse A" },
    { value: "store3", label: "Warehouse B" }
  ];

  const chargeNameOptions = [
    { value: 1, label: "Freight Charges" },
    { value: 2, label: "Loading Charges" },
    { value: 3, label: "Unloading Charges" },
    { value: 4, label: "Packaging Charges" },
    { value: 5, label: "Other Charges" }
  ];

  const gstTypeChargesOptions = [
    { value: 1, label: "CGST + SGST" },
    { value: 2, label: "IGST" }
  ];

  // Get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found in localStorage");
      setError("Authentication token not found. Please login again.");
      return null;
    }
    return token;
  };

  const getAxiosConfig = () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication token not available");
    }
    return {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    };
  };

  // Helper functions
  const safeToNumber = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const formatNumber = (value) => {
    const num = safeToNumber(value);
    return num.toFixed(2);
  };

  // Format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return "";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN");
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Fetch all purchase returns
  const fetchPurchaseReturns = async () => {
    setLoadingReturns(true);
    setError(null);

    try {
      const config = getAxiosConfig();
      const response = await axios.post(
        URLS.GetAllPurchaseReturns,
        {},
        config
      );

      if (response.data.success) {
        setReturnsList(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to fetch purchase returns");
      }
    } catch (err) {
      console.error("Error fetching purchase returns:", err);
      setError(err.response?.data?.message || "Failed to fetch purchase returns. Please try again.");
    } finally {
      setLoadingReturns(false);
    }
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setIsLoadingSuppliers(true);
    setError(null);

    try {
      const config = getAxiosConfig();
      const response = await axios.post(
        URLS.GetSuppliers,
        {},
        config
      );

      if (response.data.success) {
        const supplierOptions = response.data.data.map(supplier => ({
          value: supplier.id,
          label: supplier.name,
          companyName: supplier.companyName,
          data: supplier
        }));
        setSuppliers(supplierOptions);
      } else {
        setError("Failed to fetch suppliers");
      }
    } catch (err) {
      console.error("Fetch suppliers error:", err);
      setError("Failed to load suppliers. Please try again.");
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  // Handle supplier added
  const handleSupplierAdded = () => {
    fetchSuppliers();
    setShowSupplierModal(false);
  };

  // Load return details for editing
  const loadReturnForEdit = async (returnId) => {
    setLoadingReturnDetails(true);
    setError(null);
    setSelectedReturn(null);
    setReturnItems([]);
    setCharges([]);
    setReturnQuantities({});

    try {
      // Find the return in the list
      const returnItem = returnsList.find(item => item.id === returnId);
      if (!returnItem) {
        setError("Return not found");
        return;
      }

      setSelectedReturn(returnItem);
      setSelectedSupplier(returnItem.supplierId);
      setGstType(returnItem.gst_type);
      setReturnDate(formatDateForInput(returnItem.date || returnItem.logCreatedDate));
      setDebitNoteNumber(returnItem.invoice_number || "");

      // Set products
      if (returnItem.products && Array.isArray(returnItem.products)) {
        const itemsWithKeys = returnItem.products.map((product, index) => ({
          ...product,
          uniqueKey: `${returnItem.id}-${product.productId}-${index}`,
          productId: product.productId || product.id,
          quantity_stock: safeToNumber(product.quantity_stock || product.buying_quantity || 0),
          total_quantity: safeToNumber(product.total_quantity || product.buying_quantity || 0),
          return_quantity: safeToNumber(product.return_quantity || 0),
          mrp: safeToNumber(product.mrp),
          purchase_rate: safeToNumber(product.purchase_rate),
          wholesale_price: safeToNumber(product.wholesale_price),
          total_tax: safeToNumber(product.total_tax),
          gstId: safeToNumber(product.gstId),
          hsn_code: product.hsn_code || "",
          brandId: product.brandId || "",
          sizeId: product.sizeId || "",
          colourId: product.colourId || "",
          styleId: product.styleId || ""
        }));

        setReturnItems(itemsWithKeys);

        // Initialize return quantities
        const initialQuantities = {};
        itemsWithKeys.forEach((item) => {
          initialQuantities[item.uniqueKey] = safeToNumber(item.return_quantity);
        });
        setReturnQuantities(initialQuantities);
      }

      // Set charges
      if (returnItem.charges && Array.isArray(returnItem.charges)) {
        const chargesWithIds = returnItem.charges.map((charge, index) => ({
          ...charge,
          id: Date.now() + index
        }));
        setCharges(chargesWithIds);
      }

    } catch (err) {
      console.error("Error loading return details:", err);
      setError("Failed to load return details. Please try again.");
    } finally {
      setLoadingReturnDetails(false);
    }
  };

  // Handle Return Quantity Change
  const handleReturnQuantityChange = (uniqueKey, value, maxQty) => {
    const qty = safeToNumber(value);
    const validQty = Math.min(Math.max(1, qty), maxQty);
    setReturnQuantities((prev) => ({
      ...prev,
      [uniqueKey]: validQty
    }));
  };

  // Remove item from return items
  const removeFromReturnItems = (index, uniqueKey) => {
    setReturnItems((prev) => prev.filter((_, i) => i !== index));
    setReturnQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[uniqueKey];
      return newQuantities;
    });
  };

  // Add Charge
  const handleAddCharge = (chargeData) => {
    setCharges([...charges, { ...chargeData, id: Date.now() }]);
    setShowChargesModal(false);
  };

  // Remove Charge
  const removeCharge = (chargeId) => {
    setCharges(charges.filter(charge => charge.id !== chargeId));
  };

  // Handle Reset
  const handleReset = () => {
    setSelectedReturn(null);
    setReturnItems([]);
    setCharges([]);
    setReturnQuantities({});
    setGstType("exclusiveGST");
    setSelectedSupplier(null);
    setReturnDate("");
    setDebitNoteNumber("");
    setError(null);
    setSuccessMessage(null);
  };

  // Calculate totals
  const calculateTotals = () => {
    const noOfItems = returnItems.length;
    const totalQty = returnItems.reduce((sum, item) => {
      return sum + safeToNumber(returnQuantities[item.uniqueKey] || item.return_quantity || 0);
    }, 0);
    const totalAmount = returnItems.reduce((sum, item) => {
      const qty = safeToNumber(returnQuantities[item.uniqueKey] || item.return_quantity || 0);
      const rate = safeToNumber(item.purchase_rate);
      return sum + (qty * rate);
    }, 0);
    const totalTax = returnItems.reduce((sum, item) => {
      const qty = safeToNumber(returnQuantities[item.uniqueKey] || item.return_quantity || 0);
      const originalQty = safeToNumber(item.quantity_stock);
      const taxPerUnit = originalQty > 0 ? safeToNumber(item.total_tax) / originalQty : 0;
      return sum + (qty * taxPerUnit);
    }, 0);
    
    // Calculate charges
    const totalChargesAmount = charges.reduce((sum, charge) => 
      sum + safeToNumber(charge.total_amount), 0
    );

    const finalAmount = totalAmount + totalTax + totalChargesAmount;

    return { 
      noOfItems, 
      totalQty, 
      totalAmount, 
      totalTax,
      totalChargesAmount,
      finalAmount 
    };
  };

  const totals = calculateTotals();

  // Handle Update Purchase Return
  const handleUpdateReturn = async () => {
    if (!selectedReturn) {
      setError("No return selected for update");
      return;
    }

    if (returnItems.length === 0) {
      setError("Please add items to return");
      return;
    }

    // Validate all quantities
    for (const item of returnItems) {
      const returnQty = returnQuantities[item.uniqueKey] || item.return_quantity || 0;
      if (returnQty <= 0) {
        setError(`Please enter a valid return quantity for ${item.item_name}`);
        return;
      }
      if (returnQty > item.quantity_stock) {
        setError(`Return quantity for ${item.item_name} cannot exceed available quantity (${item.quantity_stock})`);
        return;
      }
    }

    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Prepare products array
      const products = returnItems.map((item) => {
        const returnQty = returnQuantities[item.uniqueKey] || item.return_quantity || 0;
        return {
          item_name: item.item_name,
          hsn_code: item.hsn_code || "",
          gstId: safeToNumber(item.gstId),
          brandId: safeToNumber(item.brandId),
          sizeId: safeToNumber(item.sizeId),
          colourId: safeToNumber(item.colourId),
          styleId: safeToNumber(item.styleId),
          quantity_stock: String(item.quantity_stock),
          total_quantity: String(item.total_quantity),
          total_tax: String(item.total_tax),
          mrp: String(item.mrp),
          purchase_rate: String(item.purchase_rate),
          wholesale_price: String(item.wholesale_price),
          return_quantity: returnQty
        };
      });

      // Prepare charges array (remove temporary id)
      const chargesForApi = charges.map(charge => ({
        storeId: charge.storeId,
        charges_name: charge.charges_name,
        gst_rate: charge.gst_rate,
        gst_type: charge.gst_type,
        amount: charge.amount,
        gst_amount: charge.gst_amount,
        total_amount: charge.total_amount,
        tax_rate: charge.tax_rate
      }));

      // Prepare payload
      const payload = {
        supplierId: selectedSupplier || selectedReturn.supplierId,
        gst_type: gstType || selectedReturn.gst_type,
        purchase_date: formatDateForInput(selectedReturn.purchase_date) || formatDateForInput(new Date()),
        credit_due_date: selectedReturn.credit_due_date || formatDateForInput(new Date()),
        credit_due_date_days: selectedReturn.credit_due_date_days || "30",
        products: products,
        charges: chargesForApi,
        taxable_amount: safeToNumber(selectedReturn.taxable_amount || totals.totalAmount),
        igst_amount: safeToNumber(selectedReturn.igst_amount || 0),
        cgst_amount: safeToNumber(selectedReturn.cgst_amount || 0),
        sgst_amount: safeToNumber(selectedReturn.sgst_amount || 0),
        tax_amount: safeToNumber(selectedReturn.tax_amount || totals.totalTax),
        total_charges_amount: safeToNumber(selectedReturn.total_charges_amount || totals.totalChargesAmount),
        isDraft: false,
        storeId: localStorage.getItem("selectedStoreId")
      };

      console.log("Updating purchase return payload:", JSON.stringify(payload, null, 2));

      const config = getAxiosConfig();
      const response = await axios.put(
        `${URLS.PurchaseReturnEdit}/${selectedReturn.id}`,
        payload,
        config
      );

      if (response.data.success) {
        setSuccessMessage("Purchase return updated successfully!");
        
        // Refresh the returns list
        setTimeout(() => {
          fetchPurchaseReturns();
          handleReset();
        }, 2000);
      } else {
        setError(response.data.message || "Failed to update purchase return");
      }
    } catch (err) {
      console.error("Error updating purchase return:", err);
      setError(err.response?.data?.message || "Failed to update purchase return. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPurchaseReturns();
    fetchSuppliers();
  }, []);

  // Calculate credit due date days
  const calculateCreditDays = (creditDueDate, purchaseDate) => {
    if (!creditDueDate || !purchaseDate) return "0";
    try {
      const start = new Date(purchaseDate);
      const end = new Date(creditDueDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return String(diffDays);
    } catch (e) {
      return "0";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'RETURN_CREATED':
        return 'bg-success-transparent text-success';
      case 'PENDING':
        return 'bg-warning-transparent text-warning';
      case 'CANCELLED':
        return 'bg-danger-transparent text-danger';
      case 'COMPLETED':
        return 'bg-info-transparent text-info';
      default:
        return 'bg-secondary-transparent text-secondary';
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
            <i className="ti ti-check me-2"></i>
            {successMessage}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccessMessage(null)}
            ></button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
            <i className="ti ti-alert-circle me-2"></i>
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        {/* Purchase Returns List Card */}
        <div className="card mb-3">
          <div className="card-body p-3">
            <div className="table-responsive">
              <table className="table table-hover table-borderless mb-0">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="py-2 fw-semibold" style={{ width: "40px" }}>
                      #
                    </th>
                    <th className="py-2 fw-semibold" style={{ width: "80px" }}>
                      ID
                    </th>
                    <th className="py-2 fw-semibold" style={{ width: "100px" }}>
                      PO ID
                    </th>
                    <th className="py-2 fw-semibold" style={{ minWidth: "180px" }}>
                      Batch ID
                    </th>
                    <th className="py-2 fw-semibold" style={{ width: "150px" }}>
                      Date
                    </th>
                    <th className="py-2 fw-semibold" style={{ minWidth: "250px" }}>
                      Supplier
                    </th>
                    <th className="py-2 fw-semibold text-center" style={{ width: "150px" }}>
                      Total Items
                    </th>
                    <th className="py-2 fw-semibold text-center" style={{ width: "100px" }}>
                      Status
                    </th>
                    <th className="py-2 fw-semibold text-center" style={{ width: "80px" }}>
                      Edit
                    </th> 
                  </tr>
                </thead>
                <tbody className="bg-light">
                  {loadingReturns ? (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 mb-0 text-muted">Loading purchase returns...</p>
                      </td>
                    </tr>
                  ) : returnsList.length > 0 ? (
                    returnsList.map((returnItem, index) => (
                      <tr key={returnItem.id} className="border-bottom">
                        <td className="py-2">
                          <span className="text-dark fw-medium">{index + 1}</span>
                        </td>
                        <td className="py-2">
                          <span className="text-dark fw-medium">{returnItem.id}</span>
                        </td>
                        <td className="py-2">
                          <span className="text-dark fw-medium">{returnItem.purchaseOrderId}</span>
                        </td>
                        <td className="py-2">
                          <span className="text-dark">{returnItem.batchId || "-"}</span>
                        </td>
                        <td className="py-2">
                          <span className="text-dark">{formatDate(returnItem.date)}</span>
                        </td>
                        <td className="py-2">
                          <span className="text-dark fw-medium">{returnItem.vendorName}</span>
                          <br />
                          <small className="text-muted">
                            Invoice: {returnItem.invoice_number}
                          </small>
                        </td>
                        <td className="py-2 text-center">
                          <span className="text-dark fw-semibold">
                            {returnItem.products?.length || 0}
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          <span className={`badge ${getStatusBadgeColor(returnItem.status)} fw-semibold`}>
                            {returnItem.status || "N/A"}
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => loadReturnForEdit(returnItem.id)}
                            disabled={loadingReturnDetails}
                          >
                            <i className="ti ti-edit"></i>
                          </button>
                        </td> 
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
                        <div className="empty-state py-3">
                          <i className="ti ti-file-off fs-1 text-muted mb-2 d-block"></i>
                          <h5 className="text-muted mb-2">No Purchase Returns Found</h5>
                          <p className="text-muted mb-0">No purchase returns have been created yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Purchase Return Edit Form Card - Only show when a return is selected */}
        {selectedReturn && (
          <div className="card">
            <div className="card-body">
              {/* Form Header */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">
                  Editing Purchase Return #{selectedReturn.id} - {selectedReturn.batchId}
                </h5>
                <button
                  type="button"
                  className="btn btn-warning btn-sm"
                  onClick={handleReset}
                >
                  <i className="ti ti-x me-1"></i>
                  Cancel Edit
                </button>
              </div>

              {/* Loading State for Return Details */}
              {loadingReturnDetails ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 mb-0 text-muted">Loading return details...</p>
                </div>
              ) : (
                <>
                  {/* Single Combined Header Bar */}
                  <div className="row align-items-end g-2 mb-3">
                    {/* Left Side - Form Fields */}
                    <div className="col-lg-7 col-xl-8">
                      <div className="row g-2">
                        {/* Supplier Selection */}
                        <div className="col-lg-2 col-md-4">
                          <label className="form-label fw-semibold fs-13 mb-1">
                            Select Supplier
                          </label>
                          <div className="input-group">
                            <CommonSelect
                              options={suppliers}
                              className="select flex-grow-1"
                              value={selectedSupplier}
                              onChange={(e) => setSelectedSupplier(e.value)}
                              placeholder={isLoadingSuppliers ? "Loading..." : "Select Supplier"}
                              filter={true}
                              isDisabled={isLoadingSuppliers}
                            />
                            <button
                              className="btn btn-outline-primary"
                              type="button"
                              onClick={() => setShowSupplierModal(true)}
                              title="Add New Supplier"
                            >
                              <i className="ti ti-plus"></i>
                            </button>
                          </div>
                        </div>

                        {/* GST Type */}
                        <div className="col-lg-2 col-md-3">
                          <label className="form-label fw-semibold fs-13 mb-1">
                            GST Type
                          </label>
                          <CommonSelect
                            options={gstOptions}
                            className="select"
                            value={gstType}
                            onChange={(e) => setGstType(e.value)}
                            placeholder="Select GST"
                            filter={false}
                          />
                        </div>

                        {/* Purchase Return Date */}
                        <div className="col-lg-2 col-md-4">
                          <label className="form-label fw-semibold fs-13 mb-1">
                            Purchase Return Date
                          </label>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            placeholder="dd-mm-yyyy"
                          />
                        </div>

                        {/* Debit Note Number */}
                        <div className="col-lg-2 col-md-4">
                          <label className="form-label fw-semibold fs-13 mb-1">
                            Debit Note Number
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Debit Note Number"
                            value={debitNoteNumber}
                            onChange={(e) => setDebitNoteNumber(e.target.value)}
                          />
                        </div>

                        {/* More Button */}
                        <div className="col-lg-1 col-md-6">
                          <label className="form-label fs-13 mb-1 invisible">.</label>
                          <button
                            className="btn btn-dark btn-sm w-100"
                            onClick={() => alert("More options coming soon")}
                          >
                            More
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Action Buttons */}
                    <div className="col-lg-5 col-xl-4">
                      <label className="form-label fs-13 mb-1 invisible">.</label>
                      <div className="d-flex align-items-center justify-content-end gap-2 flex-wrap">
                        <CommonSelect
                          options={storeOptions}
                          className="select w-auto"
                          value="store1"
                          placeholder="ST"
                          filter={false}
                        />
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            data-bs-toggle="dropdown"
                          >
                            Purchase Submenu
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                              <Link className="dropdown-item" to="#">
                                Return History
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to="#">
                                Pending Returns
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to="#">
                                Reports
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => alert("Tax Master coming soon")}
                        >
                          <i className="ti ti-plus me-1"></i>
                          Tax Master
                        </button>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={fetchPurchaseReturns}
                        >
                          <i className="ti ti-refresh"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Charges Section */}
                  {charges.length > 0 && (
                    <div className="mb-4">
                      <h6 className="fw-semibold">Additional Charges</h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered">
                          <thead className="bg-light">
                            <tr>
                              <th>Charge Name</th>
                              <th>Amount</th>
                              <th>GST Rate</th>
                              <th>GST Amount</th>
                              <th>Total</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {charges.map((charge) => (
                              <tr key={charge.id}>
                                <td>{chargeNameOptions.find(opt => opt.value === charge.charges_name)?.label}</td>
                                <td>₹{formatNumber(charge.amount)}</td>
                                <td>{charge.gst_rate}%</td>
                                <td>₹{formatNumber(charge.gst_amount)}</td>
                                <td>₹{formatNumber(charge.total_amount)}</td>
                                <td>
                                  <button
                                    onClick={() => removeCharge(charge.id)}
                                    className="btn btn-sm btn-danger"
                                  >
                                    <i className="ti ti-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Purchase Return Items Table */}
                  <div className="table-responsive mb-3">
                    <table className="table table-hover table-borderless mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="fw-semibold py-2 text-center" style={{ width: "60px" }}>Sno.</th>
                          <th className="fw-semibold py-2" style={{ minWidth: "120px" }}>Barcode</th>
                          <th className="fw-semibold py-2" style={{ minWidth: "180px" }}>Item Name</th>
                          <th className="fw-semibold text-center py-2" style={{ width: "100px" }}>HSN Code</th>
                          <th className="fw-semibold text-center py-2" style={{ width: "80px" }}>GST %</th>
                          <th className="fw-semibold text-center py-2" style={{ width: "100px" }}>Product ID</th>
                          <th className="fw-semibold py-2" style={{ minWidth: "100px" }}>Brand</th>
                          <th className="fw-semibold text-center py-2" style={{ width: "80px" }}>Size</th>
                          <th className="fw-semibold text-center py-2" style={{ width: "80px" }}>Colour</th>
                          <th className="fw-semibold text-center py-2" style={{ width: "80px" }}>Avl.Qty</th>
                          <th className="fw-semibold text-center py-2" style={{ width: "100px" }}>Return Qty</th>
                          <th className="fw-semibold text-end py-2" style={{ width: "100px" }}>Rate</th>
                          <th className="fw-semibold text-end py-2" style={{ width: "110px" }}>Amount</th>
                          <th className="fw-semibold text-center py-2" style={{ width: "80px" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnItems.length > 0 ? (
                          returnItems.map((item, index) => {
                            const returnQty = returnQuantities[item.uniqueKey] || item.return_quantity || 0;
                            const amount = returnQty * safeToNumber(item.purchase_rate);

                            return (
                              <tr key={item.uniqueKey || index} className="border-bottom">
                                <td className="py-2 text-center">{index + 1}</td>
                                <td className="py-2">
                                  <span className="fw-medium text-dark">{item.barcode || "-"}</span>
                                </td>
                                <td className="py-2">
                                  <span className="text-primary fw-semibold">{item.item_name}</span>
                                </td>
                                <td className="text-center py-2">
                                  <span className="badge bg-info-transparent text-info">
                                    {item.hsn_code || "-"}
                                  </span>
                                </td>
                                <td className="text-center py-2">
                                  <span className="badge bg-success-transparent text-success">
                                    {item.gstId || 0}%
                                  </span>
                                </td>
                                <td className="text-center py-2">
                                  <span className="badge bg-primary-transparent text-primary">
                                    {item.productId || "N/A"}
                                  </span>
                                </td>
                                <td className="py-2">
                                  <span className="text-dark">{item.brandId || "-"}</span>
                                </td>
                                <td className="text-center py-2">
                                  <span className="badge bg-light text-dark">{item.sizeId || "-"}</span>
                                </td>
                                <td className="text-center py-2">
                                  <span className="text-dark">{item.colourId || "-"}</span>
                                </td>
                                <td className="text-center py-2">
                                  <span className="fw-semibold text-info">{item.quantity_stock}</span>
                                </td>
                                <td className="text-center py-2">
                                  <input
                                    type="number"
                                    className="form-control form-control-sm text-center"
                                    style={{ width: "80px", margin: "0 auto" }}
                                    value={returnQty}
                                    min="1"
                                    max={item.quantity_stock}
                                    onChange={(e) => handleReturnQuantityChange(
                                      item.uniqueKey,
                                      e.target.value,
                                      item.quantity_stock
                                    )}
                                  />
                                </td>
                                <td className="text-end py-2">
                                  <span className="fw-medium">₹{formatNumber(item.purchase_rate)}</span>
                                </td>
                                <td className="text-end py-2">
                                  <span className="fw-semibold text-success">₹{formatNumber(amount)}</span>
                                </td>
                                <td className="text-center py-2">
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeFromReturnItems(index, item.uniqueKey)}
                                  >
                                    <i className="ti ti-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="14" className="text-center py-5">
                              <div className="empty-state py-4">
                                <i className="ti ti-file-off fs-1 text-muted mb-3 d-block"></i>
                                <h5 className="text-muted fw-semibold mb-2">
                                  No Items in this Return
                                </h5>
                                <p className="text-muted mb-0">
                                  This return doesn't contain any items.
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer Section */}
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 pt-3 border-top">
                    {/* Totals Info */}
                    <div className="d-flex align-items-center gap-4 flex-wrap">
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted fw-medium">No. Of Items:</span>
                        <h5 className="mb-0 text-primary fw-bold">{totals.noOfItems}</h5>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted fw-medium">Total Qty:</span>
                        <h5 className="mb-0 text-info fw-bold">{totals.totalQty}</h5>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted fw-medium">Total Amount:</span>
                        <h5 className="mb-0 text-success fw-bold">₹{formatNumber(totals.totalAmount)}</h5>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted fw-medium">Total Tax:</span>
                        <h5 className="mb-0 text-warning fw-bold">₹{formatNumber(totals.totalTax)}</h5>
                      </div>
                      {charges.length > 0 && (
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted fw-medium">Charges:</span>
                          <h5 className="mb-0 text-purple fw-bold">₹{formatNumber(totals.totalChargesAmount)}</h5>
                        </div>
                      )}
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted fw-medium">Final Amount:</span>
                        <h5 className="mb-0 text-danger fw-bold">₹{formatNumber(totals.finalAmount)}</h5>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <button
                        className="btn btn-purple"
                        onClick={() => setShowChargesModal(true)}
                        disabled={isUpdating}
                      >
                        <i className="ti ti-receipt me-2"></i>
                        Add Charges
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={handleUpdateReturn}
                        disabled={isUpdating || returnItems.length === 0}
                      >
                        {isUpdating ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <i className="ti ti-refresh me-2"></i>
                            Update Return
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Supplier Modal */}
        {showSupplierModal && (
          <SupplierFormModal
            onClose={() => setShowSupplierModal(false)}
            onSuccess={handleSupplierAdded}
          />
        )}

        {/* Charges Modal */}
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

// Add Charges Modal Component (Same as in PurchaseReturns)
const AddChargesModal = ({ onClose, onAdd, chargeNameOptions, gstTypeChargesOptions, storeOptions }) => {
  const [formData, setFormData] = useState({
    storeId: 1,
    charges_name: "",
    gst_rate: 18,
    gst_type: 1,
    amount: "",
    gst_amount: 0,
    total_amount: 0,
    tax_rate: 18
  });

  const handleChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };

    if (field === 'amount' || field === 'gst_rate') {
      const amount = parseFloat(field === 'amount' ? value : updatedData.amount) || 0;
      const gstRate = parseFloat(field === 'gst_rate' ? value : updatedData.gst_rate) || 0;
      
      const gstAmount = (amount * gstRate) / 100;
      const totalAmount = amount + gstAmount;

      updatedData.gst_amount = gstAmount;
      updatedData.total_amount = totalAmount;
      updatedData.tax_rate = gstRate;
    }

    setFormData(updatedData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.charges_name || !formData.amount) {
      alert("Please fill in all required fields");
      return;
    }

    onAdd(formData);
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Charges</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Store <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.storeId}
                    onChange={(e) => handleChange('storeId', parseInt(e.target.value))}
                  >
                    {storeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Charge Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.charges_name}
                    onChange={(e) => handleChange('charges_name', parseInt(e.target.value))}
                    required
                  >
                    <option value="">Select Charge</option>
                    {chargeNameOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Amount <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    GST Rate (%) <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.gst_rate}
                    onChange={(e) => handleChange('gst_rate', parseFloat(e.target.value))}
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    GST Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.gst_type}
                    onChange={(e) => handleChange('gst_type', parseInt(e.target.value))}
                  >
                    {gstTypeChargesOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">GST Amount</label>
                  <input
                    type="text"
                    className="form-control"
                    value={`₹${formData.gst_amount.toFixed(2)}`}
                    readOnly
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold">Total Amount (Including GST)</label>
                  <input
                    type="text"
                    className="form-control fw-bold"
                    value={`₹${formData.total_amount.toFixed(2)}`}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="ti ti-plus me-2"></i>
                Add Charge
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReturnEdit;