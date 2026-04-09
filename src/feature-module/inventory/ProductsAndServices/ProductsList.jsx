import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Brand from "../../../core/modals/inventory/brand";
import { all_routes } from "../../../routes/all_routes";
import PrimeDataTable from "../../../components/data-table";
import DeleteModal from "../../../components/delete-modal";
import SearchFromApi from "../../../components/data-table/search";
import { Eye, Edit, ChevronDown, Package, Plus, Download, Filter, X } from "react-feather";
import axios from "axios";
import { URLS } from "../../../Urls";
import debounce from "lodash.debounce";

const ProductsList = () => {
  // -------------------- State --------------------
  const [products, setProducts] = useState([]);          // raw products from API
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [dropdowns, setDropdowns] = useState({
    categories: [],
    subcategories: [],
    brands: [],
  });

  const [filters, setFilters] = useState({
    category: "All",
    subCategory: "All",
    brand: "All",
  });

  const [filterSearch, setFilterSearch] = useState({
    category: "",
    subCategory: "",
    brand: "",
  });

  const navigate = useNavigate();
  const route = all_routes;
  const token = localStorage.getItem("authToken");
  const storeId = localStorage.getItem("selectedStoreId");   // <-- get store ID

  // -------------------- Helper: fetch dropdowns --------------------
  const fetchDropdowns = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [categoriesRes, brandsRes] = await Promise.all([
        axios.post(URLS.GetCategory, {}, { headers }),
        axios.post(URLS.GetBrand, {}, { headers }),
      ]);
      setDropdowns((prev) => ({
        ...prev,
        categories: categoriesRes.data.category || [],
        brands: brandsRes.data.brands || [],
      }));
    } catch (error) {
      console.error("Error loading sorting dropdowns:", error);
    }
  }, [token]);

  const fetchSubcategories = async (categoryId) => {
    try {
      if (!categoryId || categoryId === "All") {
        setDropdowns((prev) => ({ ...prev, subcategories: [] }));
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(URLS.GetByCategoryID, { categoryId }, { headers });
      setDropdowns((prev) => ({
        ...prev,
        subcategories: response.data.subcategories || [],
      }));
    } catch (error) {
      setDropdowns((prev) => ({ ...prev, subcategories: [] }));
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  // -------------------- Fetch products (server‑side pagination) --------------------
  const fetchProducts = useCallback(
    async (page = currentPage, limit = rows, search = searchQuery, filterValues = filters) => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        };

        // Build payload – only send IDs when not "All"
        const payload = {
          categoryId: filterValues.category === "All" ? "" : filterValues.category,
          subcategoryId: filterValues.subCategory === "All" ? "" : filterValues.subCategory,
          brandId: filterValues.brand === "All" ? "" : filterValues.brand,
          storeId: storeId || "",               // required by API
          page: page,
        };

        // Decide URL – search is appended as query param (adjust if API expects it differently)
        const url = search
          ? `${URLS.GetAllStoreProducts}?searchQuery=${encodeURIComponent(search)}`
          : URLS.GetAllStoreProducts;

        const response = await axios.post(url, payload, config);

        if (response.data.success) {
          // Store raw products – we'll map them later using dropdowns
          setProducts(response.data.data || []);
          setTotalRecords(response.data.totalCount || 0);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
    },
    [token, storeId] // dependencies that don't change often
  );

  // Trigger fetch when page, rows, search, or filters change
  useEffect(() => {
    // Only fetch if storeId is available (prevents useless calls)
    if (storeId) {
      fetchProducts(currentPage, rows, searchQuery, filters);
    }
  }, [currentPage, rows, searchQuery, filters, storeId, fetchProducts]);

  // Debounced search to avoid too many requests
  const debouncedSearch = useRef(
    debounce((value) => {
      setCurrentPage(1);          // reset to first page on new search
      // The actual fetch will be triggered by the useEffect above
    }, 500)
  ).current;

  const handleSearch = useCallback(
    (value) => {
      setSearchQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filterName, value) => {
      setFilters((prev) => ({ ...prev, [filterName]: value }));
      if (filterName === "category") {
        setFilters((prev) => ({ ...prev, subCategory: "All" }));
        fetchSubcategories(value);
      }
      setCurrentPage(1);          // reset page on filter change
      setOpenDropdown(null);
    },
    [fetchSubcategories]
  );

  // Clear all filters
  const clearFilters = () => {
    setFilters({ category: "All", subCategory: "All", brand: "All" });
    setCurrentPage(1);
    setOpenDropdown(null);
  };

  // Handle rows per page change (from SearchFromApi)
  const handleRowsChange = (newRows) => {
    setRows(newRows);
    setCurrentPage(1);            // reset to first page
  };

  // -------------------- Map product data using dropdowns --------------------
  const mappedProducts = useMemo(() => {
    // Helper to find name by ID
    const getCategoryName = (id) => {
      const cat = dropdowns.categories.find((c) => c.id === id);
      return cat ? cat.name : "N/A";
    };
    const getSubcategoryName = (id) => {
      const sub = dropdowns.subcategories.find((s) => s.id === id);
      return sub ? sub.name : "N/A";
    };
    const getBrandName = (id) => {
      const brand = dropdowns.brands.find((b) => b.id === id);
      return brand ? brand.name : "N/A";
    };

    return products.map((item) => ({
      id: item.id,
      product: item.name || "",
      productImage:
        item.product_images && item.product_images.length > 0
          ? `${URLS.ImageUrl}${item.product_images[0]}`
          : null,
      barcode: item.barcode || "",
      category: getCategoryName(item.categoryId),
      subCategory: getSubcategoryName(item.subcategoryId),
      brand: getBrandName(item.brandId),
      hsn: "N/A",                  // not present in response, adjust if needed
      price: item.selling_price ? `₹${item.selling_price}` : "N/A",
      unit: item.quantityType || "N/A",
      qty: item.quantity || "0",
      createdby: item.vendorName || "N/A",
    }));
  }, [products, dropdowns]);

  // -------------------- Filter dropdown helpers --------------------
  const getFilteredOptions = (options, searchTerm) => {
    if (!searchTerm) return options;
    return options.filter((opt) =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== "All").length;

  // -------------------- Columns definition --------------------
  const columns = useMemo(
    () => [
      {
        header: "Barcode",
        field: "barcode",
        key: "barcode",
        sortable: false,
        body: (data) => (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "12px",
              background: "rgba(255,255,255,0.3)",
              padding: "2px 8px",
              borderRadius: "6px",
              color: "#1e293b",
            }}
          >
            {data.barcode || "—"}
          </span>
        ),
      },
      {
        header: "Product",
        field: "product",
        key: "product",
        sortable: false,
        body: (data) => (
          <div className="d-flex align-items-center gap-2">
            {data.productImage ? (
              <img
                alt={data.product}
                src={data.productImage}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.4)",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                  border: "2px solid rgba(255,255,255,0.4)",
                }}
              >
                {data.product.charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>
              {data.product}
            </span>
          </div>
        ),
      },
      {
        header: "Category",
        field: "category",
        key: "category",
        sortable: false,
        body: (data) => (
          <span
            style={{
              background: "rgba(59,130,246,0.1)",
              color: "#3b82f6",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 10px",
              borderRadius: 20,
            }}
          >
            {data.category}
          </span>
        ),
      },
      {
        header: "Brand",
        field: "brand",
        key: "brand",
        sortable: false,
        body: (data) => (
          <span
            style={{
              background: "rgba(16,185,129,0.1)",
              color: "#10b981",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 10px",
              borderRadius: 20,
            }}
          >
            {data.brand}
          </span>
        ),
      },
      {
        header: "Price",
        field: "price",
        key: "price",
        sortable: false,
        body: (data) => (
          <span style={{ fontWeight: 700, color: "#10b981", fontSize: 13 }}>
            {data.price}
          </span>
        ),
      },
      {
        header: "Unit",
        field: "unit",
        key: "unit",
        sortable: false,
        body: (data) => (
          <span style={{ color: "#64748b", fontSize: 12 }}>{data.unit}</span>
        ),
      },
      {
        header: "Qty",
        field: "qty",
        key: "qty",
        sortable: false,
        body: (data) => <span className="pms-m-sno">{data.qty}</span>,
      },
      {
        header: "Created By",
        field: "createdby",
        key: "createdby",
        sortable: false,
        body: (data) => (
          <span style={{ color: "#475569", fontSize: 12 }}>{data.createdby}</span>
        ),
      },
      {
        header: "Actions",
        field: "actions",
        key: "actions",
        sortable: false,
        body: (row) => (
          <div className="d-flex align-items-center gap-2">
            <button
              className="pms-m-act-btn pms-m-act-edit"
              title="View Product"
              onClick={() => navigate(`/view-product/${row.id}`)}
            >
              <Eye size={14} />
            </button>
            <button
              className="pms-m-act-btn pms-m-act-save"
              title="Edit Product"
              onClick={() => navigate(`/edit-product/${row.id}`)}
            >
              <Edit size={14} />
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  // -------------------- FilterDropdown component (unchanged) --------------------
  const FilterDropdown = ({ name, label, value, options = [] }) => {
    const filteredOptions = getFilteredOptions(options, filterSearch[name]);
    const isOpen = openDropdown === name;
    const selectedLabel =
      value === "All" ? "All" : options.find((o) => o.id === value)?.name || value;

    return (
      <div style={{ position: "relative" }}>
        <span className="pms-m-field-label">{label}</span>
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : name)}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
            border: isOpen
              ? "1px solid rgba(59,130,246,0.5)"
              : "1px solid rgba(255,255,255,0.3)",
            borderRadius: 12,
            padding: "8px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 13,
            fontWeight: 500,
            color: value === "All" ? "#94a3b8" : "#1e293b",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: isOpen ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedLabel}
          </span>
          <ChevronDown
            size={14}
            style={{
              flexShrink: 0,
              marginLeft: 6,
              color: "#94a3b8",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </button>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: 14,
              boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
              zIndex: 9999,
              overflow: "hidden",
              animation: "fadeDropdown 0.15s ease",
            }}
          >
            <div style={{ padding: "10px 10px 6px" }}>
              <div
                style={{
                  background: "rgba(241,245,249,0.8)",
                  border: "1px solid rgba(226,232,240,0.8)",
                  borderRadius: 8,
                  padding: "5px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Filter size={11} color="#94a3b8" />
                <input
                  type="text"
                  placeholder={`Search ${label}...`}
                  value={filterSearch[name]}
                  onChange={(e) =>
                    setFilterSearch((prev) => ({ ...prev, [name]: e.target.value }))
                  }
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 12,
                    color: "#1e293b",
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>
            </div>
            <div style={{ maxHeight: 220, overflowY: "auto", padding: "4px 6px 8px" }}>
              <button
                type="button"
                onClick={() => {
                  handleFilterChange(name, "All");
                  setFilterSearch((prev) => ({ ...prev, [name]: "" }));
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "7px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: value === "All" ? "linear-gradient(135deg,#3b82f6,#2563eb)" : "transparent",
                  color: value === "All" ? "#fff" : "#475569",
                  fontSize: 13,
                  fontWeight: value === "All" ? 600 : 400,
                  cursor: "pointer",
                  marginBottom: 2,
                  transition: "background 0.15s",
                }}
              >
                All
              </button>
              {filteredOptions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "12px 0", color: "#94a3b8", fontSize: 12 }}>
                  No results found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      handleFilterChange(name, option.id);
                      setFilterSearch((prev) => ({ ...prev, [name]: "" }));
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "7px 10px",
                      borderRadius: 8,
                      border: "none",
                      background:
                        value === option.id
                          ? "linear-gradient(135deg,#3b82f6,#2563eb)"
                          : "transparent",
                      color: value === option.id ? "#fff" : "#1e293b",
                      fontSize: 13,
                      fontWeight: value === option.id ? 600 : 400,
                      cursor: "pointer",
                      marginBottom: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (value !== option.id)
                        e.currentTarget.style.background = "rgba(59,130,246,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      if (value !== option.id)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {option.name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // -------------------- Render --------------------
  return (
    <>
      <style>{`
        @keyframes fadeDropdown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        /* (keep all the existing style overrides) */
      `}</style>

      <div className="pms-m-root" onClick={() => openDropdown && setOpenDropdown(null)}>
        <div className="pms-m-main-card">
          {/* Header row */}
          <div
            className="d-flex flex-wrap justify-content-between align-items-center"
            style={{ marginBottom: 24 }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="pms-m-header-icon pms-m-header-icon-blue"
                style={{ width: 44, height: 44, borderRadius: 14, fontSize: 20 }}
              >
                <Package size={20} />
              </div>
              <div>
                <h4 className="pms-m-title" style={{ fontSize: 22, marginBottom: 2 }}>
                  Product List
                </h4>
                <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>
                  {totalRecords} product{totalRecords !== 1 ? "s" : ""} found
                </p>
              </div>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2 mt-2 mt-md-0">
              <div className="pms-search-wrap">
                <SearchFromApi
                  callback={handleSearch}
                  rows={rows}
                  setRows={handleRowsChange}   // pass our handler
                />
              </div>
              <button
                type="button"
                className="pms-m-btn pms-m-btn-back"
                onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }}
                style={{ position: "relative" }}
              >
                <Filter size={15} />
                Filters
                {activeFilterCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 18,
                      height: 18,
                      background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                      color: "#fff",
                      borderRadius: "50%",
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                className="pms-m-btn pms-m-btn-back"
                data-bs-toggle="modal"
                data-bs-target="#export-modal"
              >
                <Download size={15} />
                Import / Export
              </button>
              <Link
                to={route.addproduct}
                className="pms-m-btn pms-m-btn-add"
                style={{ textDecoration: "none", width: "auto" }}
              >
                <Plus size={15} />
                New Product
              </Link>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div
              className="pms-m-section-card"
              style={{ marginBottom: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="d-flex justify-content-between align-items-center"
                style={{ marginBottom: 16 }}
              >
                <div className="pms-m-section-title" style={{ marginBottom: 0 }}>
                  <div className="pms-m-header-icon pms-m-header-icon-yellow">
                    <Filter size={14} />
                  </div>
                  Filter Products
                  {activeFilterCount > 0 && (
                    <span className="pms-m-count-badge">{activeFilterCount} active</span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    className="pms-m-btn pms-m-btn-back"
                    style={{ padding: "6px 14px", fontSize: 12 }}
                    onClick={clearFilters}
                  >
                    <X size={13} />
                    Clear All
                  </button>
                )}
              </div>
              <div className="row g-3">
                <div className="col-md-4 col-lg-3">
                  <FilterDropdown
                    name="category"
                    label="Category"
                    value={filters.category}
                    options={dropdowns.categories}
                  />
                </div>
                <div className="col-md-4 col-lg-3">
                  <FilterDropdown
                    name="subCategory"
                    label="Sub Category"
                    value={filters.subCategory}
                    options={dropdowns.subcategories}
                  />
                </div>
                <div className="col-md-4 col-lg-3">
                  <FilterDropdown
                    name="brand"
                    label="Brand"
                    value={filters.brand}
                    options={dropdowns.brands}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Table section */}
          <div className="pms-m-section-card" style={{ padding: 0, overflow: "hidden" }}>
            {/* <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className="pms-m-section-title" style={{ marginBottom: 0 }}>
                <div className="pms-m-header-icon pms-m-header-icon-blue">
                  <Package size={14} />
                </div>
                All Products
                <span className="pms-m-count-badge">{totalRecords}</span>
              </div>
            </div> */}

            <div className="pms-products-table" style={{ overflowX: "auto" }}>
              <PrimeDataTable
                column={columns}
                data={mappedProducts}
                rows={rows}
                setRows={handleRowsChange}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalRecords={totalRecords}
              />
            </div>

            {mappedProducts.length === 0 && (
              <div className="pms-m-empty">
                <span className="pms-m-empty-icon">
                  <Package size={40} />
                </span>
                <p className="pms-m-empty-text">No products found</p>
                <Link
                  to={route.addproduct}
                  className="pms-m-btn pms-m-btn-add"
                  style={{ display: "inline-flex", marginTop: 12, width: "auto" }}
                >
                  <Plus size={14} />
                  Add First Product
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Brand />
      <DeleteModal />
    </>
  );
};

export default ProductsList;