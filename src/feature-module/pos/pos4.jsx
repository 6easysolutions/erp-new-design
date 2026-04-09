import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PosModals from "./PosModals";
import axios from "axios";
import {
  card,
  cashIcon,
  category1,
  category2,
  category3,
  category4,
  category5,
  category6,
  category7,
  cheque,
  desposit,
  emptyCart,
} from "../../utils/imagepath";
import CommonSelect from "../../components/select/common-select";
import { URLS } from "../../Urls";
import AddProductModal from "../setup/master/AllMaster/AddProductModal";
import CustomerFormModal from "../setup/master/AllMaster/CustomerFormModal";

/**
 * 🚀 POS COMPONENT - PRODUCTION-READY DYNAMIC BILLING SYSTEM
 * Features:
 * - Selling price based rate calculation with GST
 * - Auto-discount calculation (MRP - Selling Price)
 * - Dynamic GST input if not available from backend
 * - No shipping charges
 * - Complete order management
 * - Integrated AddProduct and CustomerForm modals
 */
const Pos4 = () => {
  // ==================== STATE MANAGEMENT ====================

  const [activeTab, setActiveTab] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerData, setSelectedCustomerData] = useState(null);
  const [weightScale, setWeightScale] = useState(null);
  const [weightValue, setWeightValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");

  // API States
  const [storeProducts, setStoreProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [weights, setWeights] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [weightsLoading, setWeightsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // 🛒 CART STATE - Dynamic Order Management
  const [cart, setCart] = useState([]);
  const [orderDiscount, setOrderDiscount] = useState({ type: "fixed", value: 0 });

  // Modal States
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const Location = useLocation();
  const searchDebounceTimerRef = useRef(null);

  // ==================== CONSTANTS ====================
  const DEFAULT_GST = 0;

  // ==================== SLIDER SETTINGS ====================
  const settings = {
    dots: false,
    autoplay: false,
    slidesToShow: 6,
    margin: 0,
    arrows: false,
    speed: 500,
    infinite: false,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 8 } },
      { breakpoint: 800, settings: { slidesToShow: 5 } },
      { breakpoint: 776, settings: { slidesToShow: 2 } },
      { breakpoint: 567, settings: { slidesToShow: 1 } },
    ],
  };

  // ==================== HELPER FUNCTIONS ====================
  const getAuthToken = () => localStorage.getItem("authToken");

  const getAxiosConfig = () => ({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  /**
   * 💰 Calculate Rate: Selling Price + GST Amount
   */
  const calculateRate = (sellingPrice, gstPercent) => {
    const gstAmount = (sellingPrice * gstPercent) / 100;
    return parseFloat((sellingPrice + gstAmount).toFixed(2));
  };

  /**
   * 💰 Calculate GST Amount
   */
  const calculateGstAmount = (sellingPrice, gstPercent) => {
    return parseFloat(((sellingPrice * gstPercent) / 100).toFixed(2));
  };

  /**
   * 💰 Calculate Discount: MRP - Selling Price
   */
  const calculateDiscount = (mrp, sellingPrice) => {
    return parseFloat((mrp - sellingPrice).toFixed(2));
  };

  /**
   * 💰 Calculate Discount Percentage
   */
  const calculateDiscountPercent = (mrp, sellingPrice) => {
    if (!mrp || mrp === 0) return 0;
    return parseFloat((((mrp - sellingPrice) / mrp) * 100).toFixed(2));
  };

  /**
   * 💰 Calculate Total for a cart item
   */
  const calculateItemTotal = (quantity, rate) => {
    return parseFloat((quantity * rate).toFixed(2));
  };

  /**
   * 🔔 Show Success Message
   */
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  /**
   * 🔔 Show Error Message
   */
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  // ==================== CART MANAGEMENT FUNCTIONS ====================

  /**
   * 🛒 ADD PRODUCT TO CART
   */
  const addToCart = useCallback((product) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const currentQty = updatedCart[existingItemIndex].quantity;
        const newQty = currentQty + 1;
        const rate = updatedCart[existingItemIndex].rate;

        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: newQty,
          total: calculateItemTotal(newQty, rate),
        };

        return updatedCart;
      } else {
        const sellingPrice = parseFloat(product.selling_price) || parseFloat(product.purchase_price) || 0;
        const mrp = parseFloat(product.mrp) || sellingPrice;
        const gst = parseFloat(product.gst_percentage) || DEFAULT_GST;
        const discountAmount = calculateDiscount(mrp, sellingPrice);
        const discountPercent = calculateDiscountPercent(mrp, sellingPrice);
        const rate = calculateRate(sellingPrice, gst);
        const quantity = 1;
        const total = calculateItemTotal(quantity, rate);

        const newItem = {
          id: product.id,
          productId: product.id,
          name: product.name,
          quantity: quantity,
          sellingPrice: sellingPrice,
          mrp: mrp,
          gst: gst,
          hasGst: !!product.gst_percentage,
          discountAmount: discountAmount,
          discountPercent: discountPercent,
          rate: rate,
          total: total,
          image: product.product_images?.[0] || null,
        };

        return [...prevCart, newItem];
      }
    });
  }, []);

  /**
   * 🔄 UPDATE CART ITEM QUANTITY
   */
  const updateCartQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === itemId) {
          const total = calculateItemTotal(newQuantity, item.rate);
          return { ...item, quantity: newQuantity, total };
        }
        return item;
      })
    );
  }, []);

  /**
   * 📝 UPDATE CART ITEM GST (if not from backend)
   */
  const updateCartGst = useCallback((itemId, newGst) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === itemId && !item.hasGst) {
          const rate = calculateRate(item.sellingPrice, newGst);
          const total = calculateItemTotal(item.quantity, rate);
          return { ...item, gst: newGst, rate, total };
        }
        return item;
      })
    );
  }, []);

  /**
   * 🗑️ REMOVE ITEM FROM CART
   */
  const removeFromCart = useCallback((itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  }, []);

  /**
   * 🧹 CLEAR ENTIRE CART
   */
  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
    setSelectedCustomerData(null);
    setWeightValue("");
    setOrderDiscount({ type: "fixed", value: 0 });
  }, []);

  // ==================== CALCULATION FUNCTIONS ====================

  /**
   * 💰 CALCULATE ORDER TOTALS
   */
  const calculateTotals = useCallback(() => {
    const subTotal = cart.reduce((acc, item) => acc + item.total, 0);

    const taxAmount = cart.reduce((acc, item) => {
      const gstAmount = calculateGstAmount(item.sellingPrice * item.quantity, item.gst);
      return acc + gstAmount;
    }, 0);

    const discountAmount = cart.reduce((acc, item) => {
      return acc + (item.discountAmount * item.quantity);
    }, 0);

    // Apply order-level discount
    let finalDiscount = discountAmount;
    let orderLevelDiscount = 0;

    if (orderDiscount.value > 0) {
      if (orderDiscount.type === "percentage") {
        orderLevelDiscount = (subTotal * orderDiscount.value) / 100;
      } else {
        orderLevelDiscount = orderDiscount.value;
      }
      finalDiscount += orderLevelDiscount;
    }

    const grandTotal = Math.max(0, subTotal - orderLevelDiscount);

    return {
      subTotal: parseFloat(subTotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      discountAmount: parseFloat(finalDiscount.toFixed(2)),
      orderLevelDiscount: parseFloat(orderLevelDiscount.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
  }, [cart, orderDiscount]);

  const totals = useMemo(() => calculateTotals(), [calculateTotals]);

  // ==================== API FUNCTIONS ====================

  /**
   * 📥 FETCH CATEGORIES
   */
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.post(
        URLS.GetCategory,
        {},
        getAxiosConfig()
      );

      if (response.data.success && response.data.category) {
        setCategories(response.data.category);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      showError("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  /**
   * 📥 FETCH CUSTOMERS
   */
  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const response = await axios.post(
        URLS.GetAllCustomers,
        {},
        getAxiosConfig()
      );

      if (response.data.success && response.data.data) {
        const customerOptions = response.data.data.map((customer) => ({
          value: customer.id,
          label: customer.name,
          data: customer,
        }));
        setCustomers(customerOptions);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      showError("Failed to load customers");
    } finally {
      setCustomersLoading(false);
    }
  };

  /**
   * 📥 FETCH WEIGHT TYPES
   */
  const fetchWeights = async () => {
    try {
      setWeightsLoading(true);
      const response = await axios.get(
        URLS.GetQuantityType,
        getAxiosConfig()
      );

      if (response.data.success && response.data.weight) {
        const weightOptions = response.data.weight.map((weight) => ({
          value: weight.id,
          label: weight.name,
          data: weight,
        }));
        setWeights(weightOptions);

        // Set default weight scale only if not already set
        if (weightOptions.length > 0 && !weightScale) {
          setWeightScale(weightOptions[0].value);
        }
      }
    } catch (err) {
      console.error("Error fetching weights:", err);
      showError("Failed to load weight units");
    } finally {
      setWeightsLoading(false);
    }
  };

  /**
   * 📥 FETCH ALL STORE PRODUCTS
   */
  const fetchAllStoreProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        URLS.GetAllStoreProducts,
        {},
        getAxiosConfig()
      );

      if (response.data.success && response.data.data) {
        setStoreProducts(response.data.data);
        setAllProducts(response.data.data);
      } else {
        showError("Failed to fetch products");
        setStoreProducts([]);
        setAllProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      showError(err.response?.data?.message || "Error fetching products");
      setStoreProducts([]);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📥 FETCH PRODUCTS BY CATEGORY
   */
  const fetchProductsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        URLS.GetProductsByCategory,
        { categoryId: categoryId.toString() },
        getAxiosConfig()
      );

      if (response.data.success && response.data.data) {
        setStoreProducts(response.data.data);
      } else {
        showError("No products found in this category");
        setStoreProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products by category:", err);
      showError("Error fetching category products");
      setStoreProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔍 SEARCH PRODUCTS
   */
  const searchProducts = async (query) => {
    if (!query || query.trim() === "") {
      setStoreProducts(allProducts);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${URLS.SearchByStore}?searchQuery=${encodeURIComponent(query)}`,
        {},
        getAxiosConfig()
      );

      if (response.data.success && response.data.data) {
        setStoreProducts(response.data.data);
      } else {
        setStoreProducts([]);
      }
    } catch (err) {
      console.error("Error searching products:", err);
      showError("Error searching products");
      setStoreProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔍 SEARCH BY BARCODE - FIXED VERSION
   */
  const searchByBarcode = async (barcode) => {
    if (!barcode || barcode.trim() === "") {
      showError("Please enter a barcode to search");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Searching barcode:", barcode);

      const response = await axios.post(
        `${URLS.SearchByBarcode}${barcode}`,
        {},
        getAxiosConfig()
      );

      console.log("Barcode search response:", response.data);

      if (response.data.success && response.data.data) {
        // FIX: Handle both array and single object responses
        const productData = response.data.data;
        const products = Array.isArray(productData) ? productData : [productData];

        if (products.length > 0) {
          const product = products[0];
          addToCart(product);
          setBarcodeInput("");
          setStoreProducts(products);
          showSuccess(`Product "${product.name}" added to cart`);
        } else {
          showError(`No product found with barcode: ${barcode}`);
          setStoreProducts([]);
        }
      } else {
        showError(`No product found with barcode: ${barcode}`);
        setStoreProducts([]);
      }
    } catch (err) {
      console.error("Error searching by barcode:", err);

      // FIX: Better error handling with specific messages
      let errorMessage = "Error searching by barcode";
      if (err.response?.status === 404) {
        errorMessage = `No product found with barcode: ${barcode}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      showError(errorMessage);
      setStoreProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📥 FETCH ALL POS ORDERS
   */
  const fetchPosOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await axios.post(
        URLS.GetAllPosOrders,
        {},
        getAxiosConfig()
      );

      if (response.data.success && response.data.data) {
        setOrders(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      showError("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  /**
   * 🔄 RETRIEVE HELD ORDER
   */
  const retrieveHeldOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        URLS.GetPosOrderById,
        { orderId },
        getAxiosConfig()
      );

      if (response.data.success && response.data.data) {
        const order = response.data.data;
        showSuccess(`Order #${order.id} retrieved successfully`);
        closeModal('orders');
      }
    } catch (err) {
      console.error("Error retrieving order:", err);
      showError("Failed to retrieve order");
    } finally {
      setLoading(false);
    }
  };

  // ==================== MODAL HANDLERS ====================

  /**
   * 🎯 HANDLE CUSTOMER SELECTION - FIXED VERSION
   */
  const handleCustomerSelect = (selectedOption) => {
    console.log("Customer selected:", selectedOption);

    if (selectedOption) {
      setSelectedCustomer(selectedOption.value);
      setSelectedCustomerData(selectedOption.data || selectedOption);
    } else {
      setSelectedCustomer(null);
      setSelectedCustomerData(null);
    }
  };

  /**
   * 🎯 HANDLE WEIGHT SCALE SELECTION - FIXED VERSION
   */
  const handleWeightScaleSelect = (selectedOption) => {
    console.log("Weight scale selected:", selectedOption);

    if (selectedOption) {
      setWeightScale(selectedOption.value);
    } else {
      setWeightScale(null);
    }
  };

  /**
   * 🎯 HANDLE DISCOUNT APPLICATION
   */
  const handleDiscountApply = (discount) => {
    setOrderDiscount(discount);
    showSuccess(`Order discount applied successfully`);
  };

  /**
   * 📝 HANDLE PRODUCT ADDED SUCCESS
   */
  const handleProductAdded = () => {
    setShowAddProduct(false);
    fetchAllStoreProducts(); // Refresh products list
    showSuccess("Product added successfully!");
  };

  /**
   * 👥 HANDLE CUSTOMER ADDED SUCCESS
   */
  const handleCustomerAdded = () => {
    setShowCustomerForm(false);
    fetchCustomers(); // Refresh customers list
    showSuccess("Customer added successfully!");
  };

  /**
   * 🔒 CLOSE MODAL
   */
  const closeModal = (modalId) => {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = window.bootstrap?.Modal?.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  };

  // ==================== EVENT HANDLERS ====================

  const handleCategoryClick = (tabId, categoryId = null) => {
    setActiveTab(tabId);
    setSearchQuery("");

    if (categoryId) {
      fetchProductsByCategory(categoryId);
    } else {
      setStoreProducts(allProducts);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }

    searchDebounceTimerRef.current = setTimeout(() => {
      searchProducts(query);
    }, 500);
  };

  const handleBarcodeSubmit = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      searchByBarcode(barcodeInput);
    }
  };

  // ==================== MEMOIZED VALUES ====================

  const customerOptions = useMemo(() => {
    return customers.map(customer => ({
      value: customer.value,
      label: customer.label,
      data: customer.data || customer
    }));
  }, [customers]);

  const selectedCustomerOption = useMemo(() => {
    return customerOptions.find(opt => opt.value === selectedCustomer) || null;
  }, [customerOptions, selectedCustomer]);

  const weightOptions = useMemo(() => {
    return weights.map(weight => ({
      value: weight.value,
      label: weight.label,
      data: weight.data || weight
    }));
  }, [weights]);

  const selectedWeightOption = useMemo(() => {
    return weightOptions.find(opt => opt.value === weightScale) || null;
  }, [weightOptions, weightScale]);

  // ==================== LIFECYCLE HOOKS ====================

  useEffect(() => {
    fetchAllStoreProducts();
    fetchCategories();
    fetchCustomers();
    fetchWeights();
    fetchPosOrders();

    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    document.body.classList.add("pos-page");
    return () => {
      document.body.classList.remove("pos-page");
    };
  }, [Location.pathname]);

  // Debug selected values
  useEffect(() => {
    console.log("Selected Customer:", selectedCustomer, selectedCustomerOption);
    console.log("Selected Weight Scale:", weightScale, selectedWeightOption);
  }, [selectedCustomer, selectedCustomerOption, weightScale, selectedWeightOption]);

  // ==================== RENDER ====================
  return (
    <div className="main-wrapper pos-three">
      <div className="page-wrapper pos-pg-wrapper ms-0">
        <div className="content pos-design p-0">
          <div className="row align-items-start pos-wrapper">
            {/* ==================== PRODUCTS SECTION ==================== */}
            <div className="col-md-12 col-lg-7 col-xl-8">
              <div className="pos-categories tabs_wrapper">
                {/* Search Bar */}
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2 flex-wrap flex-fill">
                    <div
                      className="input-icon-start pos-search position-relative flex-fill"
                      style={{ maxWidth: "300px" }}
                    >
                      <span className="input-icon-addon">
                        <i className="ti ti-search" />
                      </span>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search Product"
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </div>

                    <div
                      className="input-icon-start pos-search position-relative"
                      style={{ maxWidth: "200px" }}
                    >
                      <span className="input-icon-addon">
                        <i className="ti ti-barcode" />
                      </span>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Scan Barcode"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        onKeyPress={handleBarcodeSubmit}
                      />
                      <button
                        className="btn btn-sm btn-primary position-absolute end-0 top-0 h-100"
                        style={{
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          fontSize: "12px",
                          padding: "0 8px"
                        }}
                        onClick={handleBarcodeSubmit}
                      >
                        <i className="ti ti-search"></i>
                      </button>
                    </div>

                    {/* ADD PRODUCT BUTTON - Opens AddProduct Modal */}
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => setShowAddProduct(true)}
                    >
                      Add +
                    </button>
                  </div>

                  {/* VIEW ALL ORDERS BUTTON */}
                  <button
                    className="btn btn-sm btn-secondary"
                    data-bs-toggle="modal"
                    data-bs-target="#orders"
                  >
                    <i className="ti ti-list me-1"></i>
                    Orders ({orders.length})
                  </button>
                </div>

                {/* Category Slider */}
                <Slider
                  {...settings}
                  className="tabs owl-carousel pos-category3 mb-3"
                >
                  <li
                    onClick={() => handleCategoryClick("all", null)}
                    className={`owl-item ${activeTab === "all" ? "active" : ""}`}
                  >
                    <a href="#">
                      <img src={category1} alt="All" />
                    </a>
                    <h6>
                      <a href="#">All</a>
                    </h6>
                  </li>

                  {categories.map((category, index) => {
                    const categoryImages = [
                      category2,
                      category3,
                      category4,
                      category5,
                      category6,
                      category7,
                    ];
                    const categoryImage = categoryImages[index % categoryImages.length];

                    return (
                      <li
                        key={category.id}
                        onClick={() => handleCategoryClick(`category-${category.id}`, category.id)}
                        className={`owl-item ${activeTab === `category-${category.id}` ? "active" : ""}`}
                      >
                        <a href="#">
                          <img src={categoryImage} alt={category.name} />
                        </a>
                        <h6>
                          <a href="#" title={category.name}>
                            {category.name.length > 10
                              ? `${category.name.substring(0, 10)}...`
                              : category.name}
                          </a>
                        </h6>
                      </li>
                    );
                  })}
                </Slider>

                {/* Success/Error/Loading Messages */}
                {successMessage && (
                  <div className="alert alert-success alert-dismissible fade show mb-3">
                    <i className="ti ti-check-circle me-2"></i>
                    {successMessage}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSuccessMessage(null)}
                    ></button>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show mb-3">
                    <i className="ti ti-alert-circle me-2"></i>
                    {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError(null)}
                    ></button>
                  </div>
                )}

                {loading && (
                  <div className="alert alert-info alert-sm mb-3">
                    <div className="d-flex align-items-center">
                      <div
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></div>
                      Loading products...
                    </div>
                  </div>
                )}

                {/* Products Grid */}
                <div className="pos-products">
                  <div className="tabs_container">
                    <div className="tab_content active">
                      {storeProducts.length > 0 ? (
                        <div className="row g-2">
                          {storeProducts.map((product) => {
                            const isInCart = cart.some((item) => item.id === product.id);
                            const cartItem = cart.find((item) => item.id === product.id);

                            return (
                              <div
                                key={product.id}
                                className="col-6 col-sm-4 col-md-3 col-lg-3 col-xl-2"
                              >
                                <div
                                  className={`product-card ${isInCart ? "in-cart" : ""}`}
                                  onClick={() => addToCart(product)}
                                  style={{
                                    position: "relative",
                                    cursor: "pointer",
                                    border: "1px solid #e9ecef",
                                    borderRadius: "8px",
                                    padding: "8px",
                                    transition: "all 0.2s ease",
                                    backgroundColor: isInCart ? "#f0f9ff" : "#fff",
                                    borderColor: isInCart ? "#3b82f6" : "#e9ecef",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = "none";
                                    e.currentTarget.style.transform = "translateY(0)";
                                  }}
                                >
                                  {/* In Cart Badge */}
                                  {isInCart && (
                                    <div
                                      style={{
                                        position: "absolute",
                                        top: "4px",
                                        right: "4px",
                                        backgroundColor: "#3b82f6",
                                        color: "white",
                                        borderRadius: "12px",
                                        padding: "2px 6px",
                                        fontSize: "10px",
                                        fontWeight: "bold",
                                        zIndex: 10,
                                      }}
                                    >
                                      {cartItem?.quantity}x
                                    </div>
                                  )}

                                  {/* Product Image */}
                                  <div
                                    style={{
                                      position: "relative",
                                      width: "100%",
                                      paddingTop: "100%",
                                      borderRadius: "6px",
                                      overflow: "hidden",
                                      backgroundColor: "#f8f9fa",
                                      marginBottom: "6px",
                                    }}
                                  >
                                    {product.product_images && product.product_images.length > 0 ? (
                                      <img
                                        alt={product.name}
                                        src={`${URLS.ImageUrl}${product.product_images[0]}`}
                                        onError={(e) => {
                                          e.target.src = "https://via.placeholder.com/150?text=No+Image";
                                        }}
                                        style={{
                                          position: "absolute",
                                          top: 0,
                                          left: 0,
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                        }}
                                      />
                                    ) : (
                                      <div
                                        style={{
                                          position: "absolute",
                                          top: 0,
                                          left: 0,
                                          width: "100%",
                                          height: "100%",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          backgroundColor: "#e9ecef",
                                        }}
                                      >
                                        <i
                                          className="ti ti-photo"
                                          style={{
                                            fontSize: "32px",
                                            color: "#adb5bd",
                                          }}
                                        ></i>
                                      </div>
                                    )}
                                  </div>

                                  {/* Product Info */}
                                  <div>
                                    <h6
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        margin: "0 0 4px 0",
                                        lineHeight: "1.3",
                                        height: "28px",
                                        overflow: "hidden",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                      }}
                                      title={product.name}
                                    >
                                      {product.name}
                                    </h6>

                                    <div className="d-flex justify-content-between align-items-center">
                                      <div>
                                        <div
                                          style={{
                                            fontSize: "13px",
                                            fontWeight: "bold",
                                            color: "#059669",
                                          }}
                                        >
                                          ₹{product.selling_price || product.purchase_price || "0"}
                                        </div>
                                        {product.mrp && product.mrp !== product.selling_price && (
                                          <div
                                            style={{
                                              fontSize: "10px",
                                              color: "#6c757d",
                                              textDecoration: "line-through",
                                            }}
                                          >
                                            ₹{product.mrp}
                                          </div>
                                        )}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "10px",
                                          color: "#6c757d",
                                          backgroundColor: "#f8f9fa",
                                          padding: "2px 6px",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        {product.quantity || "0"} pc
                                      </div>
                                    </div>

                                    {/* Add Button */}
                                    <button
                                      className="btn btn-sm btn-primary w-100 mt-2"
                                      style={{
                                        fontSize: "10px",
                                        padding: "4px 8px",
                                        backgroundColor: isInCart ? "#059669" : "#3b82f6",
                                        borderColor: isInCart ? "#059669" : "#3b82f6",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(product);
                                      }}
                                    >
                                      <i
                                        className={`ti ${isInCart ? "ti-check" : "ti-plus"} me-1`}
                                      ></i>
                                      {isInCart ? "Added" : "Add"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        !loading && (
                          <div className="text-center py-5">
                            <i
                              className="ti ti-package"
                              style={{ fontSize: "48px", color: "#adb5bd" }}
                            ></i>
                            <h5 className="mt-3 text-muted">No products found</h5>
                            <p className="text-muted">
                              {searchQuery ? `Try a different search` : `Products will appear here`}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== ORDER PANEL ==================== */}
            <div className="col-md-12 col-lg-5 col-xl-4 ps-0">
              <aside
                className="product-order-list"
                style={{ position: "sticky", top: "20px" }}
              >
                {/* Customer Info */}
                <div className="customer-info p-3 bg-white border-bottom">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div>
                      <h6 className="mb-0 fw-bold" style={{ fontSize: "14px" }}>
                        New Order
                      </h6>
                      <span className="badge bg-primary" style={{ fontSize: "10px" }}>
                        {cart.length} items
                      </span>
                    </div>
                    {/* CUSTOMER BUTTON - Opens CustomerForm Modal */}
                    <button
                      className="btn btn-xs btn-outline-primary"
                      onClick={() => setShowCustomerForm(true)}
                    >
                      <i className="ti ti-plus me-1"></i>Customer
                    </button>
                  </div>
                  <CommonSelect
                    options={customerOptions}
                    className="select"
                    value={selectedCustomerOption}
                    onChange={handleCustomerSelect}
                    placeholder={customersLoading ? "Loading..." : "Choose Customer"}
                    filter={true}
                    disabled={customersLoading}
                  />

                </div>

                {/* Weight Scale - FIXED VERSION */}
                <div className="p-2 bg-light border-bottom">
                  <div className="row g-2">
                    <div className="col-7">
                      <label className="form-label mb-1" style={{ fontSize: "11px", fontWeight: "600" }}>
                        <i className="ti ti-scale me-1"></i>Weight Unit
                      </label>
                      <CommonSelect
                        options={weightOptions}
                        className="select select-sm"
                        value={selectedWeightOption}
                        onChange={handleWeightScaleSelect}
                        placeholder={weightsLoading ? "Loading..." : "Select Unit"}
                        filter={false}
                        disabled={weightsLoading}
                      />
                    </div>
                    <div className="col-5">
                      <label className="form-label mb-1" style={{ fontSize: "11px", fontWeight: "600" }}>
                        Weight
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="0.00"
                        step="0.01"
                        value={weightValue}
                        onChange={(e) => setWeightValue(e.target.value)}
                        style={{ fontSize: "11px" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 fw-bold" style={{ fontSize: "13px" }}>
                      <i className="ti ti-shopping-cart me-1"></i>Order Details
                    </h6>
                    <span className="badge bg-light text-dark" style={{ fontSize: "10px" }}>
                      {cart.length} item{cart.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Cart Items */}
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {cart.length === 0 ? (
                      <div className="text-center py-4">
                        <img
                          src={emptyCart}
                          alt="Empty"
                          style={{ width: "80px", opacity: 0.5 }}
                        />
                        <p className="text-muted mt-2" style={{ fontSize: "12px" }}>
                          No items in cart
                        </p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm mb-0" style={{ fontSize: "10px" }}>
                          <thead className="bg-light sticky-top">
                            <tr>
                              <th style={{ padding: "4px" }}>Item</th>
                              <th className="text-center" style={{ padding: "4px", width: "60px" }}>Qty</th>
                              <th className="text-end" style={{ padding: "4px", width: "55px" }}>MRP</th>
                              <th className="text-end" style={{ padding: "4px", width: "55px" }}>GST%</th>
                              <th className="text-end" style={{ padding: "4px", width: "55px" }}>Disc%</th>
                              <th className="text-end" style={{ padding: "4px", width: "60px" }}>Rate</th>
                              <th className="text-end" style={{ padding: "4px", width: "60px" }}>Total</th>
                              <th className="text-center" style={{ padding: "4px", width: "30px" }}>Act</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cart.map((item) => (
                              <tr key={item.id} className="border-bottom">
                                <td style={{ padding: "4px" }}>
                                  <div className="d-flex align-items-center gap-1">
                                    <div
                                      title={item.name}
                                      style={{
                                        maxWidth: "80px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        fontWeight: "600",
                                      }}
                                    >
                                      {item.name}
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center" style={{ padding: "4px" }}>
                                  <div className="d-flex align-items-center justify-content-center gap-1">
                                    <button
                                      className="btn btn-xs btn-light"
                                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                      style={{ padding: "0 4px", fontSize: "10px", lineHeight: "1.2" }}
                                    >
                                      <i className="ti ti-minus"></i>
                                    </button>
                                    <span style={{ minWidth: "20px", textAlign: "center", fontWeight: "bold" }}>
                                      {item.quantity}
                                    </span>
                                    <button
                                      className="btn btn-xs btn-light"
                                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                      style={{ padding: "0 4px", fontSize: "10px", lineHeight: "1.2" }}
                                    >
                                      <i className="ti ti-plus"></i>
                                    </button>
                                  </div>
                                </td>
                                <td className="text-end" style={{ padding: "4px" }}>₹{item.mrp}</td>
                                <td className="text-end" style={{ padding: "4px" }}>
                                  {item.hasGst ? (
                                    <span className="text-success">{item.gst}%</span>
                                  ) : (
                                    <input
                                      type="number"
                                      value={item.gst}
                                      onChange={(e) => updateCartGst(item.id, parseFloat(e.target.value) || 0)}
                                      className="form-control form-control-sm text-end"
                                      style={{ width: "50px", padding: "2px", fontSize: "10px" }}
                                      min="0"
                                      max="100"
                                      placeholder="0"
                                    />
                                  )}
                                </td>
                                <td className="text-end text-danger" style={{ padding: "4px" }}>
                                  {item.discountPercent.toFixed(1)}%
                                </td>
                                <td className="text-end fw-bold" style={{ padding: "4px" }}>₹{item.rate}</td>
                                <td className="text-end fw-bold text-success" style={{ padding: "4px" }}>₹{item.total}</td>
                                <td className="text-center" style={{ padding: "4px" }}>
                                  <button
                                    className="btn btn-xs btn-light text-danger"
                                    onClick={() => removeFromCart(item.id)}
                                    style={{ padding: "0 4px", fontSize: "12px" }}
                                  >
                                    <i className="ti ti-trash"></i>
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

                {/* Billing Summary */}
                <div className="p-3 bg-light border-bottom">
                  <h6 className="mb-2 fw-bold" style={{ fontSize: "12px" }}>
                    <i className="ti ti-receipt me-1"></i>Billing Summary
                  </h6>
                  <table className="table table-sm table-borderless mb-0" style={{ fontSize: "11px" }}>
                    <tbody>
                      <tr>
                        <td className="py-1">Sub Total</td>
                        <td className="py-1 text-end fw-bold">₹{totals.subTotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-success">Total GST</td>
                        <td className="py-1 text-end text-success fw-bold">+₹{totals.taxAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-danger">Total Discount</td>
                        <td className="py-1 text-end text-danger fw-bold">-₹{totals.discountAmount.toFixed(2)}</td>
                      </tr>
                      {orderDiscount.value > 0 && (
                        <tr>
                          <td className="py-1 text-info">Order Discount</td>
                          <td className="py-1 text-end text-info fw-bold">
                            -₹{totals.orderLevelDiscount.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr className="border-top">
                        <td className="py-2 fw-bold">Grand Total</td>
                        <td className="py-2 text-end fw-bold text-primary" style={{ fontSize: "14px" }}>
                          ₹{totals.grandTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Action Buttons */}
                <div className="p-2 bg-white border-bottom">
                  <div className="row g-1">
                    <div className="col-4">
                      <button
                        className="btn btn-sm btn-teal w-100"
                        style={{ fontSize: "10px", padding: "6px" }}
                        disabled={cart.length === 0}
                        data-bs-toggle="modal"
                        data-bs-target="#discount"
                      >
                        <i className="ti ti-percentage"></i> Discount
                      </button>
                    </div>
                    <div className="col-4">
                      <button
                        className="btn btn-sm btn-warning w-100"
                        style={{ fontSize: "10px", padding: "6px" }}
                        disabled={cart.length === 0}
                        data-bs-toggle="modal"
                        data-bs-target="#hold-order"
                      >
                        <i className="ti ti-player-pause"></i> Hold
                      </button>
                    </div>
                    <div className="col-4">
                      <button
                        className="btn btn-sm btn-danger w-100"
                        style={{ fontSize: "10px", padding: "6px" }}
                        onClick={() => {
                          if (cart.length > 0) {
                            const modal = new bootstrap.Modal(document.getElementById('reset'));
                            modal.show();
                          }
                        }}
                        disabled={cart.length === 0}
                      >
                        <i className="ti ti-trash"></i> Clear
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="p-3 bg-white">
                  <h6 className="mb-2 fw-bold" style={{ fontSize: "12px" }}>
                    Payment Method
                  </h6>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <button
                        className="btn btn-outline-success w-100"
                        style={{ fontSize: "11px", padding: "8px" }}
                        disabled={cart.length === 0}
                        data-bs-toggle="modal"
                        data-bs-target="#payment-cash"
                      >
                        <img src={cashIcon} alt="Cash" style={{ height: "20px" }} />
                        <div>Cash</div>
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        className="btn btn-outline-primary w-100"
                        style={{ fontSize: "11px", padding: "8px" }}
                        disabled={cart.length === 0}
                        data-bs-toggle="modal"
                        data-bs-target="#payment-card"
                      >
                        <img src={card} alt="Card" style={{ height: "20px" }} />
                        <div>Card</div>
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        className="btn btn-outline-info w-100"
                        style={{ fontSize: "11px", padding: "8px" }}
                        disabled={cart.length === 0}
                        data-bs-toggle="modal"
                        data-bs-target="#payment-deposit"
                      >
                        <img src={desposit} alt="Deposit" style={{ height: "20px" }} />
                        <div>Deposit</div>
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        className="btn btn-outline-warning w-100"
                        style={{ fontSize: "11px", padding: "8px" }}
                        disabled={cart.length === 0}
                        data-bs-toggle="modal"
                        data-bs-target="#payment-cheque"
                      >
                        <img src={cheque} alt="Cheque" style={{ height: "20px" }} />
                        <div>Cheque</div>
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary w-100 fw-bold"
                    style={{ fontSize: "13px", padding: "10px" }}
                    disabled={cart.length === 0}
                    data-bs-toggle="modal"
                    data-bs-target="#payment-cash"
                  >
                    <i className="ti ti-check me-2"></i>
                    Pay ₹{totals.grandTotal.toFixed(2)}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}
      <PosModals
        cart={cart}
        totals={totals}
        selectedCustomer={selectedCustomer}
        selectedCustomerData={selectedCustomerData}
        weightScale={weightScale}
        weightValue={weightValue}
        clearCart={clearCart}
        orders={orders}
        ordersLoading={ordersLoading}
        onOrderSuccess={(order) => {
          showSuccess(`Order #${order.id} placed successfully!`);
          fetchPosOrders();
        }}
        onDiscountApply={handleDiscountApply}
        onOrderRetrieve={retrieveHeldOrder}
        customers={customers}
        weights={weights}
      />

      {showAddProduct && (
        <AddProductModal
          onClose={() => setShowAddProduct(false)}
          onSuccess={handleProductAdded}
          categories={categories}
        />
      )}

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <CustomerFormModal
          onClose={() => setShowCustomerForm(false)}
          onSuccess={handleCustomerAdded}
        />
      )}
    </div>
  );
};

export default Pos4;