import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PrimeDataTable from "../../../components/data-table";
import { Modal } from "react-bootstrap";
import {
    Search,
    Edit3,
    Package,
    Clipboard,
    Filter,
    Lock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Save,
    X
} from "react-feather";
import CommonFooter from "../../../components/footer/commonFooter";

const ActiveSession = () => {
    // --- STATE ---
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [rows, setRows] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [physicalCount, setPhysicalCount] = useState("");

    // Session Data
    const session = {
        id: "CS001",
        name: "Daily Count - Electronics",
        scope: "By_Category",
        scopeValue: "Electronics",
        status: "Active",
        createdAt: "2024-03-09",
        createdBy: "John Doe",
        totalItems: 120,
        countedItems: 45,
        progress: 37.5,
        stockFrozen: true,
        frozenSince: "2024-03-09 09:30 AM"
    };

    // Mock Product Data
    const [products, setProducts] = useState([
        { id: 101, name: "Nike Air Jordan", sku: "PT002", category: "Shoes", systemQty: 120, counted: null, image: "/assets/img/products/stock-img-02.png" },
        { id: 102, name: "Lenovo IdeaPad 3", sku: "PT001", category: "Laptops", systemQty: 85, counted: null, image: "/assets/img/products/stock-img-01.png" },
        { id: 103, name: "Apple Watch Series 5", sku: "PT004", category: "Electronics", systemQty: 45, counted: 42, image: "/assets/img/products/stock-img-03.png" },
        { id: 104, name: "Logitech Mouse", sku: "PT005", category: "Electronics", systemQty: 200, counted: 200, image: "/assets/img/products/stock-img-04.png" },
        { id: 105, name: "Samsung Monitor", sku: "PT006", category: "Electronics", systemQty: 15, counted: null, image: "/assets/img/products/stock-img-05.png" },
        { id: 106, name: "Sony Headphones", sku: "PT007", category: "Electronics", systemQty: 60, counted: 58, image: "/assets/img/products/stock-img-02.png" },
        { id: 107, name: "Canon Camera", sku: "PT008", category: "Electronics", systemQty: 25, counted: null, image: "/assets/img/products/stock-img-03.png" },
    ]);

    // Derived Data
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = !statusFilter || (
                (statusFilter === 'Matched' && p.counted !== null && p.counted === p.systemQty) ||
                (statusFilter === 'Variance' && p.counted !== null && p.counted !== p.systemQty) ||
                (statusFilter === 'Not_Counted' && p.counted === null)
            );
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    // --- ACTIONS ---
    const handleEditClick = (product) => {
        setEditingProduct(product);
        setPhysicalCount(product.counted !== null ? product.counted : "");
        setShowEditModal(true);
    };

    const handleUpdateStock = () => {
        if (!editingProduct) return;
        const newQty = parseInt(physicalCount);
        const finalQty = isNaN(newQty) ? 0 : newQty;

        setProducts(prev => prev.map(p =>
            p.id === editingProduct.id
                ? { ...p, counted: finalQty }
                : p
        ));
        setShowEditModal(false);
    };

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.classList.remove('d-none');
        e.target.nextSibling.classList.add('d-flex');
    };

    // --- TABLE COLUMNS ---
    const columns = useMemo(() => [
        {
            header: "Product",
            field: "name",
            key: "name",
            sortable: true,
            body: (data) => (
                <div className="d-flex align-items-center gap-3">
                    <div className="avatar avatar-md border rounded p-1 bg-white position-relative d-flex align-items-center justify-content-center" style={{ minWidth: '40px', minHeight: '40px' }}>
                        <img
                            src={data.image}
                            alt={data.name}
                            className="img-fluid rounded"
                            onError={handleImageError}
                        />
                        <div className="fallback-icon position-absolute w-100 h-100 d-none align-items-center justify-content-center bg-light rounded text-muted top-0 start-0">
                            <Package size={20} />
                        </div>
                    </div>
                    <div>
                        <h6 className="mb-0 fw-bold text-dark">{data.name}</h6>
                        <small className="text-muted">{data.sku}</small>
                    </div>
                </div>
            )
        },
        {
            header: "Category",
            field: "category",
            key: "category",
            sortable: true
        },
        {
            header: "Expected",
            field: "systemQty",
            key: "systemQty",
            sortable: true,
            body: (data) => <span className="fw-medium">{data.systemQty}</span>
        },
        {
            header: "Counted",
            field: "counted",
            key: "counted",
            sortable: true,
            body: (data) => {
                if (data.counted === null) return <span className="text-muted">-</span>;
                return (
                    <span className={`fw-bold ${data.counted !== data.systemQty ? 'text-danger' : 'text-success'}`}>
                        {data.counted}
                    </span>
                );
            }
        },
        {
            header: "Variance",
            field: "variance",
            key: "variance",
            sortable: true,
            body: (data) => {
                if (data.counted === null) return <span className="text-muted">-</span>;
                const variance = data.counted - data.systemQty;
                return (
                    <span className={`fw-bold ${variance === 0 ? 'text-success' : 'text-danger'}`}>
                        {variance > 0 ? '+' : ''}{variance}
                    </span>
                );
            }
        },
        {
            header: "Status",
            field: "status",
            key: "status",
            sortable: false,
            body: (data) => {
                if (data.counted === null) return <span className="badge bg-light text-muted border">Pending</span>;
                const diff = data.counted - data.systemQty;
                if (diff === 0) return <span className="badge bg-success bg-opacity-10 text-success border border-success d-inline-flex align-items-center gap-1"><CheckCircle size={12} /> Matched</span>;
                return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger d-inline-flex align-items-center gap-1"><AlertCircle size={12} /> Variance</span>;
            }
        },
        {
            header: "Action",
            field: "action",
            key: "action",
            sortable: false,
            body: (data) => (
                <div className="edit-delete-action">
                    <Link
                        to="#"
                        className="me-2 p-2 rounded-circle bg-white shadow-sm border text-primary d-flex align-items-center justify-content-center hover-bg-primary hover-text-white transition-all"
                        onClick={() => handleEditClick(data)}
                        title="Update Count"
                        style={{ width: '32px', height: '32px' }}
                    >
                        <Edit3 size={14} />
                    </Link>
                </div>
            )
        }
    ], []);

    return (
        <div className="page-wrapper container-fluid pt-4">
            <div className="content">

                {/* Header */}
                <div className="page-header mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="mb-1">{session.name}</h4>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                                    <li className="breadcrumb-item"><Link to="/inventory/count-sessions">Count Sessions</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">Active Session</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Session Info Card */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="row g-4">
                            <div className="col-md-3">
                                <div>
                                    <small className="text-muted d-block mb-1">Session ID</small>
                                    <h6 className="mb-0 fw-bold">{session.id}</h6>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div>
                                    <small className="text-muted d-block mb-1">Scope</small>
                                    <h6 className="mb-0 fw-bold">{session.scope.replace(/_/g, ' ')} - {session.scopeValue}</h6>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div>
                                    <small className="text-muted d-block mb-1">Status</small>
                                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary d-inline-flex align-items-center gap-1">
                                        <Lock size={12} />
                                        Active
                                    </span>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div>
                                    <small className="text-muted d-block mb-1">Stock Frozen Since</small>
                                    <h6 className="mb-0 fw-bold text-danger">{session.frozenSince}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Card */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="row align-items-center">
                            <div className="col-md-8">
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 className="mb-0 fw-bold">Count Progress</h6>
                                        <span className="fw-bold text-primary">{session.countedItems} of {session.totalItems} items</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div
                                            className="progress-bar bg-primary"
                                            role="progressbar"
                                            style={{ width: `${session.progress}%` }}
                                            aria-valuenow={session.progress}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        ></div>
                                    </div>
                                </div>
                                <small className="text-muted">{session.progress.toFixed(1)}% Complete</small>
                            </div>
                            <div className="col-md-4 text-end">
                                <button className="btn btn-primary d-inline-flex align-items-center gap-2">
                                    <CheckCircle size={16} />
                                    Complete Count
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter / Search Bar */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-3">
                        <div className="row g-3 align-items-center">
                            <div className="col-md-6 col-lg-5 position-relative">
                                <input
                                    type="text"
                                    className="form-control ps-5"
                                    placeholder="Search product name, SKU..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <select
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="Matched">Matched</option>
                                    <option value="Variance">Variance</option>
                                    <option value="Not_Counted">Not Counted</option>
                                </select>
                            </div>
                            <div className="col-md-6 col-lg-4 text-end">
                                <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2">
                                    <Filter size={16} />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                        <h5 className="card-title mb-0 d-flex align-items-center gap-2">
                            <Clipboard size={18} className="text-primary" />
                            Stock Count Entry ({filteredProducts.length})
                        </h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <PrimeDataTable
                                column={columns}
                                data={filteredProducts}
                                rows={rows}
                                setRows={setRows}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                totalRecords={filteredProducts.length}
                            />
                        </div>
                    </div>
                </div>

            </div>
            <CommonFooter />

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton className="border-bottom-0">
                    <Modal.Title className="fw-bold fs-6">Update Physical Count</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    {editingProduct && (
                        <div>
                            <div className="d-flex align-items-center mb-4 p-3 bg-light rounded border">
                                <div className="avatar avatar-md me-3 bg-white rounded border p-1 d-flex align-items-center justify-content-center position-relative" style={{ width: '60px', height: '60px' }}>
                                    <img
                                        src={editingProduct.image}
                                        alt={editingProduct.name}
                                        className="img-fluid rounded"
                                        onError={handleImageError}
                                    />
                                    <div className="fallback-icon w-100 h-100 d-none align-items-center justify-content-center bg-light rounded text-muted top-0 start-0 position-absolute">
                                        <Package size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h6 className="mb-1 fw-bold text-dark">{editingProduct.name}</h6>
                                    <small className="text-muted">SKU: {editingProduct.sku}</small>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold text-uppercase">Physical Quantity</label>
                                <input
                                    type="number"
                                    className="form-control form-control-lg fw-bold"
                                    placeholder="Enter counted quantity"
                                    value={physicalCount}
                                    onChange={(e) => setPhysicalCount(e.target.value)}
                                    autoFocus
                                />
                                <div className="form-text mt-2">
                                    Expected System Quantity: <span className="fw-bold text-dark">{editingProduct.systemQty}</span>
                                </div>
                                {physicalCount && (
                                    <div className="mt-3 p-3 bg-light rounded">
                                        <small className="text-muted d-block mb-1">Variance:</small>
                                        <h6 className={`mb-0 fw-bold ${parseInt(physicalCount) === editingProduct.systemQty ? 'text-success' : 'text-danger'}`}>
                                            {parseInt(physicalCount) - editingProduct.systemQty > 0 ? '+' : ''}{parseInt(physicalCount) - editingProduct.systemQty}
                                        </h6>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-top-0 pt-0">
                    <button className="btn btn-light" onClick={() => setShowEditModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleUpdateStock}>Update</button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ActiveSession;
