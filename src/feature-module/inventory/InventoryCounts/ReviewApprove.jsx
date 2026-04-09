import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../../components/footer/commonFooter";
import PrimeDataTable from "../../../components/data-table";
import { Modal } from "react-bootstrap";
import {
    Search,
    Edit3,
    Package,
    AlertCircle,
    Filter,
    CheckCircle,
    X,
    MessageSquare,
    TrendingDown,
    TrendingUp,
    ArrowLeft,
    Send
} from "react-feather";

const ReviewApprove = () => {
    // --- STATE ---
    const [searchQuery, setSearchQuery] = useState("");
    const [varianceFilter, setVarianceFilter] = useState("");
    const [rows, setRows] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [physicalCount, setPhysicalCount] = useState("");
    const [notes, setNotes] = useState("");

    // Session Data
    const session = {
        id: "CS003",
        name: "Warehouse A Spot Check",
        scope: "By_Location",
        scopeValue: "Warehouse A",
        status: "In_Review",
        createdAt: "2024-03-07",
        createdBy: "Mike Johnson",
        totalItems: 250,
        countedItems: 250,
        progress: 100,
        variances: 12,
        varianceValue: 45,
        totalVarianceUnits: 45,
        overCount: 8,
        underCount: 4
    };

    // Mock Variance Data
    const [variances, setVariances] = useState([
        { id: 1, productId: 101, name: "Nike Air Jordan", sku: "PT002", systemQty: 120, counted: 115, variance: -5, variancePercent: -4.17, notes: "Possible damage during count" },
        { id: 2, productId: 102, name: "Lenovo IdeaPad 3", sku: "PT001", systemQty: 85, counted: 92, variance: 7, variancePercent: 8.24, notes: "Recount confirmed" },
        { id: 3, productId: 103, name: "Apple Watch Series 5", sku: "PT004", systemQty: 45, counted: 42, variance: -3, variancePercent: -6.67, notes: "" },
        { id: 4, productId: 104, name: "Logitech Mouse", sku: "PT005", systemQty: 200, counted: 200, variance: 0, variancePercent: 0, notes: "Matched" },
        { id: 5, productId: 105, name: "Samsung Monitor", sku: "PT006", systemQty: 15, counted: 18, variance: 3, variancePercent: 20, notes: "Found in storage" },
        { id: 6, productId: 106, name: "Sony Headphones", sku: "PT007", systemQty: 60, counted: 58, variance: -2, variancePercent: -3.33, notes: "" },
        { id: 7, productId: 107, name: "Canon Camera", sku: "PT008", systemQty: 25, counted: 28, variance: 3, variancePercent: 12, notes: "Recount confirmed" },
        { id: 8, productId: 108, name: "Nikon Lens", sku: "PT009", systemQty: 40, counted: 35, variance: -5, variancePercent: -12.5, notes: "Missing items" },
        { id: 9, productId: 109, name: "GoPro Camera", sku: "PT010", systemQty: 30, counted: 32, variance: 2, variancePercent: 6.67, notes: "" },
        { id: 10, productId: 110, name: "DJI Drone", sku: "PT011", systemQty: 12, counted: 10, variance: -2, variancePercent: -16.67, notes: "Pending investigation" },
        { id: 11, productId: 111, name: "Fujifilm Camera", sku: "PT012", systemQty: 18, counted: 20, variance: 2, variancePercent: 11.11, notes: "" },
        { id: 12, productId: 112, name: "Pentax Camera", sku: "PT013", systemQty: 22, counted: 19, variance: -3, variancePercent: -13.64, notes: "Damaged units" }
    ]);

    // Filter to show only variances
    const varianceItems = variances.filter(v => v.variance !== 0);

    // Filtered Data
    const filteredVariances = useMemo(() => {
        return varianceItems.filter(v => {
            const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.sku.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = !varianceFilter || (
                (varianceFilter === 'over' && v.variance > 0) ||
                (varianceFilter === 'under' && v.variance < 0)
            );
            return matchesSearch && matchesFilter;
        });
    }, [searchQuery, varianceFilter]);

    // --- ACTIONS ---
    const handleEditClick = (variance) => {
        setEditingProduct(variance);
        setPhysicalCount(variance.counted);
        setNotes(variance.notes);
        setShowEditModal(true);
    };

    const handleUpdateVariance = () => {
        if (!editingProduct) return;
        const newQty = parseInt(physicalCount);
        const finalQty = isNaN(newQty) ? 0 : newQty;

        setVariances(prev => prev.map(v =>
            v.id === editingProduct.id
                ? { ...v, counted: finalQty, variance: finalQty - v.systemQty, notes }
                : v
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
                <div>
                    <h6 className="mb-0 fw-bold text-dark">{data.name}</h6>
                    <small className="text-muted">SKU: {data.sku}</small>
                </div>
            )
        },
        {
            header: "System Qty",
            field: "systemQty",
            key: "systemQty",
            sortable: true,
            body: (data) => <span className="fw-medium">{data.systemQty}</span>
        },
        {
            header: "Physical Qty",
            field: "counted",
            key: "counted",
            sortable: true,
            body: (data) => <span className="fw-bold">{data.counted}</span>
        },
        {
            header: "Variance",
            field: "variance",
            key: "variance",
            sortable: true,
            body: (data) => {
                const isOver = data.variance > 0;
                return (
                    <div className="d-flex align-items-center gap-2">
                        {isOver ? (
                            <TrendingUp size={16} className="text-success" />
                        ) : (
                            <TrendingDown size={16} className="text-danger" />
                        )}
                        <span className={`fw-bold ${isOver ? 'text-success' : 'text-danger'}`}>
                            {data.variance > 0 ? '+' : ''}{data.variance}
                        </span>
                        <span className="text-muted">({data.variancePercent > 0 ? '+' : ''}{data.variancePercent.toFixed(2)}%)</span>
                    </div>
                );
            }
        },
        {
            header: "Notes",
            field: "notes",
            key: "notes",
            sortable: false,
            body: (data) => (
                <div>
                    {data.notes ? (
                        <small className="text-muted">{data.notes}</small>
                    ) : (
                        <span className="text-muted">-</span>
                    )}
                </div>
            )
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
                        title="Edit Variance"
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
                        <div className="d-flex align-items-center gap-3">
                            <Link to="#" className="btn btn-light p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                <ArrowLeft size={18} />
                            </Link>
                            <div>
                                <h4 className="mb-1">Review & Approve</h4>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-0">
                                        <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                                        <li className="breadcrumb-item"><Link to="/inventory/count-sessions">Count Sessions</Link></li>
                                        <li className="breadcrumb-item active" aria-current="page">Review & Approve</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Session Info */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="row g-4">
                            <div className="col-md-3">
                                <div>
                                    <small className="text-muted d-block mb-1">Session</small>
                                    <h6 className="mb-0 fw-bold">{session.name}</h6>
                                    <small className="text-muted">ID: {session.id}</small>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div>
                                    <small className="text-muted d-block mb-1">Scope</small>
                                    <h6 className="mb-0 fw-bold">{session.scope.replace(/_/g, ' ')}</h6>
                                    <small className="text-muted">{session.scopeValue}</small>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div>
                                    <small className="text-muted d-block mb-1">Status</small>
                                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning d-inline-flex align-items-center gap-1">
                                        <AlertCircle size={12} />
                                        In Review
                                    </span>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div>
                                    <small className="text-muted d-block mb-1">Created By</small>
                                    <h6 className="mb-0 fw-bold">{session.createdBy}</h6>
                                    <small className="text-muted">{session.createdAt}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Variance Summary */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <small className="text-muted d-block mb-1">Total Variances</small>
                                        <h4 className="mb-0 fw-bold">{session.variances}</h4>
                                    </div>
                                    <AlertCircle className="text-danger" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <small className="text-muted d-block mb-1">Over Count</small>
                                        <h4 className="mb-0 fw-bold text-success">{session.overCount}</h4>
                                    </div>
                                    <TrendingUp className="text-success" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <small className="text-muted d-block mb-1">Under Count</small>
                                        <h4 className="mb-0 fw-bold text-danger">{session.underCount}</h4>
                                    </div>
                                    <TrendingDown className="text-danger" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <small className="text-muted d-block mb-1">Total Variance</small>
                                        <h4 className={`mb-0 fw-bold ${session.totalVarianceUnits > 0 ? 'text-success' : 'text-danger'}`}>
                                            {session.totalVarianceUnits > 0 ? '+' : ''}{session.totalVarianceUnits}
                                        </h4>
                                    </div>
                                    <CheckCircle className={session.totalVarianceUnits > 0 ? 'text-success' : 'text-danger'} size={24} />
                                </div>
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
                                    value={varianceFilter}
                                    onChange={(e) => setVarianceFilter(e.target.value)}
                                >
                                    <option value="">All Variances</option>
                                    <option value="over">Over Count</option>
                                    <option value="under">Under Count</option>
                                </select>
                            </div>
                            <div className="col-md-6 col-lg-4 text-end">
                                <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 me-2">
                                    <X size={16} />
                                    Reject
                                </button>
                                <button className="btn btn-primary d-inline-flex align-items-center gap-2">
                                    <CheckCircle size={16} />
                                    Approve & Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                        <h5 className="card-title mb-0 d-flex align-items-center gap-2">
                            <AlertCircle size={18} className="text-danger" />
                            Variance Details ({filteredVariances.length})
                        </h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <PrimeDataTable
                                column={columns}
                                data={filteredVariances}
                                rows={rows}
                                setRows={setRows}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                totalRecords={filteredVariances.length}
                            />
                        </div>
                    </div>
                </div>

            </div>
            <CommonFooter />

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-bottom-0">
                    <Modal.Title className="fw-bold fs-6">Review Variance</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    {editingProduct && (
                        <div>
                            <div className="d-flex align-items-center mb-4 p-3 bg-light rounded border">
                                <div>
                                    <h6 className="mb-1 fw-bold text-dark">{editingProduct.name}</h6>
                                    <small className="text-muted">SKU: {editingProduct.sku}</small>
                                </div>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <div className="p-3 bg-light rounded">
                                        <small className="text-muted d-block mb-1">System Quantity</small>
                                        <h5 className="mb-0 fw-bold">{editingProduct.systemQty}</h5>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 bg-light rounded">
                                        <small className="text-muted d-block mb-1">Physical Quantity</small>
                                        <h5 className="mb-0 fw-bold">{editingProduct.counted}</h5>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold text-uppercase">Update Physical Quantity</label>
                                <input
                                    type="number"
                                    className="form-control form-control-lg fw-bold"
                                    placeholder="Enter quantity"
                                    value={physicalCount}
                                    onChange={(e) => setPhysicalCount(e.target.value)}
                                />
                                {physicalCount && (
                                    <div className="mt-3 p-3 bg-light rounded">
                                        <small className="text-muted d-block mb-1">New Variance:</small>
                                        <h6 className={`mb-0 fw-bold ${parseInt(physicalCount) === editingProduct.systemQty ? 'text-success' : parseInt(physicalCount) > editingProduct.systemQty ? 'text-success' : 'text-danger'}`}>
                                            {parseInt(physicalCount) - editingProduct.systemQty > 0 ? '+' : ''}{parseInt(physicalCount) - editingProduct.systemQty}
                                        </h6>
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold text-uppercase">Notes</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Add notes about this variance..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-top-0 pt-0">
                    <button className="btn btn-light" onClick={() => setShowEditModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleUpdateVariance}>Save Changes</button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReviewApprove;
