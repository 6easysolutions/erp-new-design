import React, { useState, useEffect } from "react";
import axios from "axios";
import { URLS } from "../../Urls";

/**
 * 🎨 POS MODALS COMPONENT - COMPLETE FIXED VERSION
 * All modals for POS system with proper API integration and dynamic updates
 */
const PosModals = ({ 
  cart = [], 
  totals = {}, 
  selectedCustomer = null,
  selectedCustomerData = null,
  weightScale = null,
  weightValue = "",
  clearCart = () => {},
  orders = [],
  ordersLoading = false,
  onOrderSuccess = () => {},
  onDiscountApply = () => {},
  onOrderRetrieve = () => {},
  customers = [],
  weights = []
}) => {
  // ==================== STATE MANAGEMENT ====================
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Payment States
  const [cashReceived, setCashReceived] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [chequeBank, setChequeBank] = useState("");
  const [depositReference, setDepositReference] = useState("");

  // Discount State
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState();

  // Hold Order State
  const [holdReason, setHoldReason] = useState("");

  // New Customer State
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    mobile: "",
    email: "",
    companyName: ""
  });

  // ==================== HELPER FUNCTIONS ====================
  const getAuthToken = () => localStorage.getItem("authToken");

  const getAxiosConfig = () => ({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  const generateTransactionId = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN${dateStr}${randomStr}`;
  };

  const calculateChange = () => {
    const received = parseFloat(cashReceived) || 0;
    const total = totals.grandTotal || 0;
    return received - total;
  };

  const closeModal = (modalId) => {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  };

  const resetModalStates = () => {
    setCashReceived("");
    setCardNumber("");
    setCardHolderName("");
    setChequeNumber("");
    setChequeBank("");
    setDepositReference("");
    setDiscountValue(0);
    setHoldReason("");
    setError(null);
    setSuccessMessage(null);
  };

  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-success';
      case 'hold': return 'bg-warning';
      case 'cancelled': return 'bg-danger';
      case 'pending': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const getPaymentBadgeClass = (paymentType) => {
    switch (paymentType?.toLowerCase()) {
      case 'cash': return 'bg-success';
      case 'card': return 'bg-primary';
      case 'cheque': return 'bg-warning';
      case 'deposit': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  // ==================== API FUNCTIONS ====================

  /**
   * 📤 PLACE POS ORDER
   */
  const placePosOrder = async (paymentType, paymentDetails = {}, isHold = false) => {
    if (cart.length === 0) {
      setError("Cart is empty. Please add products to place an order.");
      return;
    }

    if (!selectedCustomer && !isHold) {
      setError("Please select a customer before placing the order.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Prepare products array
      const productsPayload = cart.map((item) => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        mrp: item.mrp,
        gstPercent: item.gst,
        discountPercent: item.discountPercent,
        rate: item.rate,
        total: item.total,
      }));

      // Prepare order payload
      const orderPayload = {
        customerId: selectedCustomer || 0,
        customerName: selectedCustomerData?.name || "Walk-in Customer",
        weightId: weightScale || "",
        weight: weightValue || "0",
        products: productsPayload,
        subtotal: totals.subTotal,
        total_gst: totals.taxAmount,
        grand_total: totals.grandTotal,
        total_discount: totals.discountAmount,
        discount: 0,
        tax: 18,
        transaction_id: generateTransactionId(),
        is_hold: isHold,
        payment_type: paymentType || "Cash",
        payment_details: paymentDetails,
        status: isHold ? "Hold" : "Completed",
        hold_reason: isHold ? holdReason : "",
      };

      const response = await axios.post(
        URLS.AddPosOrder,
        orderPayload,
        getAxiosConfig()
      );

      if (response.data.success) {
        setSuccessMessage(
          `✅ ${isHold ? "Order held" : "Order placed"} successfully! Order #${response.data.data.id}`
        );

        setTimeout(() => {
          closeModal('payment-cash');
          closeModal('payment-card');
          closeModal('payment-cheque');
          closeModal('payment-deposit');
          closeModal('hold-order');
          
          resetModalStates();
          clearCart();
          onOrderSuccess(response.data.data);
        }, 1500);
      } else {
        setError(response.data.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      setError(
        err.response?.data?.message || "Error placing order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 📤 CREATE NEW CUSTOMER
   */
  const createCustomer = async () => {
    if (!newCustomer.name || !newCustomer.mobile) {
      setError("Name and Mobile are required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const customerPayload = {
        name: newCustomer.name,
        mobile: newCustomer.mobile,
        email: newCustomer.email || "",
        companyName: newCustomer.companyName || "",
        paymentMode: "Cash",
        paymentTerms: "Immediate",
        openingBalance: "0",
        customerCategory: "Regular",
        type: "Retail"
      };

      const response = await axios.post(
        URLS.CreateCustomer,
        customerPayload,
        getAxiosConfig()
      );

      if (response.data.success) {
        setSuccessMessage("✅ Customer created successfully!");
        
        setTimeout(() => {
          closeModal('create');
          setNewCustomer({ name: "", mobile: "", email: "", companyName: "" });
          resetModalStates();
          onOrderSuccess(); // Refresh customers list
        }, 1500);
      } else {
        setError(response.data.message || "Failed to create customer");
      }
    } catch (err) {
      console.error("Error creating customer:", err);
      setError(err.response?.data?.message || "Error creating customer");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 🎯 APPLY DISCOUNT
   */
  const applyDiscount = () => {
    if (discountValue <= 0) {
      setError("Please enter a valid discount value");
      return;
    }

    if (discountType === "percentage" && discountValue > 100) {
      setError("Discount percentage cannot exceed 100%");
      return;
    }

    if (discountType === "fixed" && discountValue > totals.grandTotal) {
      setError("Discount amount cannot exceed grand total");
      return;
    }

    onDiscountApply({
      type: discountType,
      value: parseFloat(discountValue)
    });

    setTimeout(() => {
      closeModal('discount');
      setDiscountValue(0);
      setError(null);
    }, 500);
  };

  /**
   * 📋 GET ORDER ITEMS COUNT
   */
  const getOrderItemsCount = (order) => {
    if (order.products && Array.isArray(order.products)) {
      return order.products.reduce((total, product) => total + (product.quantity || 1), 0);
    }
    return order.items_count || 0;
  };

  // ==================== RENDER MODALS ====================

  return (
    <>
      {/* ==================== PAYMENT MODAL - CASH ==================== */}
      <div className="modal fade" id="payment-cash" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title">
                <i className="ti ti-cash me-2"></i>Cash Payment
              </h5>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="ti ti-alert-circle me-2"></i>
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="alert alert-success">
                  <i className="ti ti-check-circle me-2"></i>
                  {successMessage}
                </div>
              )}

              <div className="mb-3">
                <h6 className="fw-bold">Order Summary</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>Items:</span>
                  <strong>{cart.length}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Sub Total:</span>
                  <strong>₹{totals.subTotal?.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>GST:</span>
                  <strong className="text-success">₹{totals.taxAmount?.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Discount:</span>
                  <strong className="text-danger">-₹{totals.discountAmount?.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between border-top pt-2">
                  <h6 className="mb-0">Grand Total:</h6>
                  <h5 className="mb-0 text-primary">₹{totals.grandTotal?.toFixed(2)}</h5>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Cash Received *</label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  placeholder="Enter amount received"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  autoFocus
                />
              </div>

              {cashReceived && (
                <div className={`alert ${calculateChange() >= 0 ? 'alert-success' : 'alert-danger'}`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{calculateChange() >= 0 ? 'Change to Return:' : 'Short Amount:'}</strong>
                    <h5 className="mb-0">
                      ₹{Math.abs(calculateChange()).toFixed(2)}
                    </h5>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={resetModalStates}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => placePosOrder("Cash", { cashReceived, change: calculateChange() })}
                disabled={submitting || !cashReceived || calculateChange() < 0}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="ti ti-check me-2"></i>
                    Complete Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== PAYMENT MODAL - CARD ==================== */}
      <div className="modal fade" id="payment-card" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="ti ti-credit-card me-2"></i>Card Payment
              </h5>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="ti ti-alert-circle me-2"></i>
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="alert alert-success">
                  <i className="ti ti-check-circle me-2"></i>
                  {successMessage}
                </div>
              )}

              <div className="mb-3">
                <h6 className="fw-bold">Payment Amount</h6>
                <h4 className="text-primary">₹{totals.grandTotal?.toFixed(2)}</h4>
              </div>

              <div className="mb-3">
                <label className="form-label">Card Holder Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter cardholder name"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Card Number (Last 4 digits) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="XXXX"
                  maxLength="4"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div className="alert alert-info">
                <i className="ti ti-info-circle me-2"></i>
                Please ensure the card payment is processed through your POS terminal
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={resetModalStates}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => placePosOrder("Card", { 
                  cardLastFour: cardNumber,
                  cardHolderName: cardHolderName
                })}
                disabled={submitting || !cardNumber || cardNumber.length !== 4 || !cardHolderName}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="ti ti-check me-2"></i>
                    Complete Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== PAYMENT MODAL - CHEQUE ==================== */}
      <div className="modal fade" id="payment-cheque" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-warning text-dark">
              <h5 className="modal-title">
                <i className="ti ti-file-invoice me-2"></i>Cheque Payment
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={resetModalStates}></button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="ti ti-alert-circle me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
              )}
              
              {successMessage && (
                <div className="alert alert-success">
                  <i className="ti ti-check-circle me-2"></i>
                  {successMessage}
                </div>
              )}

              <div className="mb-3">
                <h6 className="fw-bold">Payment Amount</h6>
                <h4 className="text-warning">₹{totals.grandTotal?.toFixed(2)}</h4>
              </div>

              <div className="mb-3">
                <label className="form-label">Cheque Number *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter cheque number"
                  value={chequeNumber}
                  onChange={(e) => setChequeNumber(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Bank Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter bank name"
                  value={chequeBank}
                  onChange={(e) => setChequeBank(e.target.value)}
                />
              </div>

              <div className="alert alert-warning">
                <i className="ti ti-alert-triangle me-2"></i>
                Cheque payments are subject to clearance
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={resetModalStates}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => placePosOrder("Cheque", { 
                  chequeNumber: chequeNumber,
                  bankName: chequeBank
                })}
                disabled={submitting || !chequeNumber || !chequeBank}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="ti ti-check me-2"></i>
                    Complete Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== PAYMENT MODAL - DEPOSIT ==================== */}
      <div className="modal fade" id="payment-deposit" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-info text-white">
              <h5 className="modal-title">
                <i className="ti ti-building-bank me-2"></i>Deposit Payment
              </h5>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="ti ti-alert-circle me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
              )}
              
              {successMessage && (
                <div className="alert alert-success">
                  <i className="ti ti-check-circle me-2"></i>
                  {successMessage}
                </div>
              )}

              <div className="mb-3">
                <h6 className="fw-bold">Payment Amount</h6>
                <h4 className="text-info">₹{totals.grandTotal?.toFixed(2)}</h4>
              </div>

              <div className="mb-3">
                <label className="form-label">Reference Number *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter deposit reference number"
                  value={depositReference}
                  onChange={(e) => setDepositReference(e.target.value)}
                />
              </div>

              <div className="alert alert-info">
                <i className="ti ti-info-circle me-2"></i>
                Please provide the bank deposit reference number
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={resetModalStates}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-info"
                onClick={() => placePosOrder("Deposit", { 
                  referenceNumber: depositReference
                })}
                disabled={submitting || !depositReference}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="ti ti-check me-2"></i>
                    Complete Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== DISCOUNT MODAL ==================== */}
      <div className="modal fade" id="discount" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header" style={{ backgroundColor: '#20C997', color: 'white' }}>
              <h5 className="modal-title">
                <i className="ti ti-percentage me-2"></i>Apply Discount
              </h5> 
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="ti ti-alert-circle me-2"></i>
                  {error}
                </div>
              )}

              <div className="mb-3">
                <h6 className="fw-bold">Current Total</h6>
                <h4 className="text-primary">₹{totals.grandTotal?.toFixed(2)}</h4>
              </div>

              <div className="mb-3">
                <label className="form-label">Discount Type</label>
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn ${discountType === "percentage" ? "btn-success" : "btn-outline-success"}`}
                    onClick={() => setDiscountType("percentage")}
                  >
                    Percentage %
                  </button>
                  <button
                    type="button"
                    className={`btn ${discountType === "fixed" ? "btn-success" : "btn-outline-success"}`}
                    onClick={() => setDiscountType("fixed")}
                  >
                    Fixed Amount ₹
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Discount {discountType === "percentage" ? "Percentage" : "Amount"} *
                </label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  placeholder={discountType === "percentage" ? "Enter percentage (0-100)" : "Enter amount"}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  max={discountType === "percentage" ? "100" : totals.grandTotal}
                  min="0"
                  step={discountType === "percentage" ? "0.1" : "1"}
                />
              </div>

              {discountValue > 0 && (
                <div className="alert alert-success">
                  <div className="d-flex justify-content-between mb-2">
                    <strong>Discount Amount:</strong>
                    <h6 className="mb-0 text-danger">
                      -₹
                      {discountType === "percentage"
                        ? ((totals.grandTotal * discountValue) / 100).toFixed(2)
                        : Math.min(discountValue, totals.grandTotal).toFixed(2)}
                    </h6>
                  </div>
                  <div className="d-flex justify-content-between">
                    <strong>New Total:</strong>
                    <h5 className="mb-0 text-success">
                      ₹
                      {discountType === "percentage"
                        ? (totals.grandTotal - (totals.grandTotal * discountValue) / 100).toFixed(2)
                        : (totals.grandTotal - Math.min(discountValue, totals.grandTotal)).toFixed(2)}
                    </h5>
                  </div>
                </div>
              )}

              <div className="alert alert-info">
                <i className="ti ti-info-circle me-2"></i>
                Note: This discount will be applied to the entire order
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => {
                  setDiscountValue(0);
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={applyDiscount}
                disabled={!discountValue || discountValue <= 0}
              >
                <i className="ti ti-check me-2"></i>
                Apply Discount
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== HOLD ORDER MODAL ==================== */}
      <div className="modal fade" id="hold-order" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header" style={{ backgroundColor: '#FF9F43', color: 'white' }}>
              <h5 className="modal-title">
                <i className="ti ti-player-pause me-2"></i>Hold Order
              </h5>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="ti ti-alert-circle me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
              )}
              
              {successMessage && (
                <div className="alert alert-success">
                  <i className="ti ti-check-circle me-2"></i>
                  {successMessage}
                </div>
              )}

              <div className="mb-3">
                <h6 className="fw-bold">Order Summary</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>Items:</span>
                  <strong>{cart.length}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Total Amount:</span>
                  <h5 className="mb-0 text-primary">₹{totals.grandTotal?.toFixed(2)}</h5>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Reason for Hold (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter reason for holding this order..."
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                ></textarea>
              </div>

              <div className="alert alert-warning">
                <i className="ti ti-alert-triangle me-2"></i>
                This order will be saved and can be retrieved later from the Orders list
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={resetModalStates}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: '#FF9F43', color: 'white' }}
                onClick={() => placePosOrder(null, { holdReason }, true)}
                disabled={submitting || cart.length === 0}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Holding...
                  </>
                ) : (
                  <>
                    <i className="ti ti-player-pause me-2"></i>
                    Hold Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== CREATE CUSTOMER MODAL ==================== */}
      <div className="modal fade" id="create" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="ti ti-user-plus me-2"></i>Add New Customer
              </h5> 
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="ti ti-alert-circle me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
              )}
              
              {successMessage && (
                <div className="alert alert-success">
                  <i className="ti ti-check-circle me-2"></i>
                  {successMessage}
                </div>
              )}

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Customer Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter customer name"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Mobile Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter mobile number"
                    maxLength="10"
                    value={newCustomer.mobile}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        mobile: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Email (Optional)</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter email address"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Company Name (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter company name"
                    value={newCustomer.companyName}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, companyName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="alert alert-info">
                <i className="ti ti-info-circle me-2"></i>
                Customer will be created and available for selection
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => {
                  setNewCustomer({ name: "", mobile: "", email: "", companyName: "" });
                  resetModalStates();
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={createCustomer}
                disabled={submitting || !newCustomer.name || !newCustomer.mobile}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="ti ti-check me-2"></i>
                    Create Customer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== ORDERS LIST MODAL ==================== */}
      <div className="modal fade" id="orders" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header bg-secondary text-white">
              <h5 className="modal-title" style={{color:"#fff"}}>
                <i className="ti ti-list me-2"></i>All Orders ({orders.length})
              </h5>
            </div>
            <div className="modal-body">
              {ordersLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border spinner-border-lg text-primary" role="status">
                    <span className="visually-hidden">Loading orders...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading orders...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-5">
                            <i className="ti ti-package" style={{ fontSize: "48px", color: "#adb5bd" }}></i>
                            <p className="text-muted mt-3">No orders found</p>
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <strong>#{order.id}</strong>
                              {order.transaction_id && (
                                <div className="text-muted small">{order.transaction_id}</div>
                              )}
                            </td>
                            <td>{order.customer_name || order.customerName || 'Walk-in Customer'}</td>
                            <td>
                              <span className="badge bg-light text-dark">
                                {getOrderItemsCount(order)} items
                              </span>
                            </td>
                            <td>
                              <strong>₹{parseFloat(order.grand_total || order.grandTotal || 0).toFixed(2)}</strong>
                            </td>
                            <td>
                              <span className={`badge ${getPaymentBadgeClass(order.payment_type || order.paymentType)}`}>
                                {order.payment_type || order.paymentType || 'Cash'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                {order.status || 'Completed'}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {formatOrderDate(order.created_at || order.createdAt || order.date)}
                              </small>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary"
                                  title="View Order"
                                  onClick={() => {
                                    // Implement view order details
                                    console.log('View order:', order);
                                  }}
                                >
                                  <i className="ti ti-eye"></i>
                                </button> 
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== RESET CONFIRMATION MODAL ==================== */}
      <div className="modal fade" id="reset" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">
                <i className="ti ti-reload me-2"></i>Reset Order
              </h5>
            </div>
            <div className="modal-body">
              <div className="text-center py-3">
                <i className="ti ti-alert-circle" style={{ fontSize: "64px", color: "#dc3545" }}></i>
                <h5 className="mt-3">Are you sure?</h5>
                <p className="text-muted">
                  This will clear the entire cart and reset the order. This action cannot be undone.
                </p>
                {cart.length > 0 && (
                  <div className="alert alert-warning mt-3">
                    <i className="ti ti-alert-triangle me-2"></i>
                    <strong>Warning:</strong> You have {cart.length} item(s) in cart totaling ₹{totals.grandTotal?.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                onClick={clearCart}
              >
                <i className="ti ti-reload me-2"></i>
                Yes, Reset Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PosModals;