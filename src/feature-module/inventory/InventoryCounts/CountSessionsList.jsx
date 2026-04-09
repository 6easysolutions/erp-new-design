import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../../components/footer/commonFooter";
import PrimeDataTable from "../../../components/data-table";
import { Modal } from "react-bootstrap";
import {
    Search,
    Plus,
    Eye,
    Trash2,
    Filter,
    Calendar,
    CheckCircle,
    AlertCircle,
    Clock,
    Lock
} from "react-feather";

const CountSessionsList = () => {
    // --- STATE ---
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [scopeFilter, setScopeFilter] = useState("");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [rows, setRows] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Mock Sessions Data
    const [sessions] = useState([
        {
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
            variances: 3,
            varianceValue: -208
        },
        {
            id: "CS002",
            name: "Full Warehouse Count",
            scope: "Full_Warehouse",
            scopeValue: "All Products",
            status: "Draft",
            createdAt: "2024-03-08",
            createdBy: "Jane Smith",
            totalItems: 500,
            countedItems: 0,
            progress: 0,
            variances: 0,
            varianceValue: 0
        },
        {
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
            varianceValue: 45
        },
        {
            id: "CS004",
            name: "Monthly Inventory Count",
            scope: "Full_Warehouse",
            scopeValue: "All Products",
            status: "Posted",
            createdAt: "2024-02-28",
            createdBy: "Sarah Wilson",
            totalItems: 500,
            countedItems: 500,
            progress: 100,
            variances: 8,
            varianceValue: -125,
            approvedBy: "Manager Admin",
            postedAt: "2024-03-01"
        },
        {
            id: "CS005",
            name: "Shoes Category Count",
            scope: "By_Category",
            scopeValue: "Shoes",
            status: "Posted",
            createdAt: "2024-02-25",
            createdBy: "Tom Brown",
            totalItems: 180,
            countedItems: 180,
            progress: 100,
            variances: 5,
            varianceValue: 32,
            approvedBy: "Manager Admin",
            postedAt: "2024-02-26"
        },
        {
            id: "CS006",
            name: "Cancelled Count",
            scope: "By_Category",
            scopeValue: "Laptops",
            status: "Cancelled",
            createdAt: "2024-02-20",
            createdBy: "Lisa Anderson",
            totalItems: 85,
            countedItems: 30,
            progress: 35.3,
            variances: 0,
            varianceValue: 0
        }
    ]);

    // Filtered Data
    const filteredSessions = useMemo(() => {
        return sessions.filter(session => {
            const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                session.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = !statusFilter || session.status === statusFilter;
            const matchesScope = !scopeFilter || session.scope === scopeFilter;
            return matchesSearch && matchesStatus && matchesScope;
        });
    }, [searchQuery, statusFilter, scopeFilter]);

    // --- TABLE COLUMNS ---
    const columns = useMemo(() => [
        {
            header: "Session",
            field: "name",
            key: "name",
            sortable: true,
            body: (data) => (
                <div>
                    <h6 className="mb-0 fw-bold text-dark">{data.name}</h6>
                    <small className="text-muted">ID: {data.id}</small>
                </div>
            )
        },
        {
            header: "Scope",
            field: "scope",
            key: "scope",
            sortable: true,
            body: (data) => (
                <div>
                    <span className="fw-medium">{data.scope.replace(/_/g, ' ')}</span>
                    <br />
                    <small className="text-muted">{data.scopeValue}</small>
                </div>
            )
        },
        {
            header: "Status",
            field: "status",
            key: "status",
            sortable: true,
            body: (data) => {
                const statusConfig = {
                    Draft: { bg: "bg-secondary", icon: Clock },
                    Active: { bg: "bg-primary", icon: Lock },
                    In_Review: { bg: "bg-warning", icon: AlertCircle },
                    Approved: { bg: "bg-info", icon: CheckCircle },
                    Posted: { bg: "bg-success", icon: CheckCircle },
                    Cancelled: { bg: "bg-danger", icon: AlertCircle }
                };
                const config = statusConfig[data.status] || statusConfig.Draft;
                const Icon = config.icon;
                return (
                    <span className={`badge ${config.bg} bg-opacity-10 text-${config.bg.replace('bg-', '')} border border-${config.bg.replace('bg-', '')} d-inline-flex align-items-center gap-1`}>
                        <Icon size={14} />
                        {data.status.replace(/_/g, ' ')}
                    </span>
                );
            }
        },
        {
            header: "Progress",
            field: "progress",
            key: "progress",
            sortable: true,
            body: (data) => (
                <div className="d-flex align-items-center gap-2">
                    <div className="progress flex-grow-1" style={{ height: '6px' }}>
                        <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${data.progress}%` }}
                            aria-valuenow={data.progress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                        ></div>
                    </div>
                    <small className="text-muted fw-bold">{data.progress.toFixed(1)}%</small>
                </div>
            )
        },
        {
            header: "Variances",
            field: "variances",
            key: "variances",
            sortable: true,
            body: (data) => (
                <div>
                    <span className={`fw-bold ${data.variances > 0 ? 'text-danger' : 'text-success'}`}>
                        {data.variances} items
                    </span>
                    <br />
                    <small className={data.varianceValue < 0 ? 'text-danger' : 'text-success'}>
                        {data.varianceValue > 0 ? '+' : ''}{data.varianceValue} units
                    </small>
                </div>
            )
        },
        {
            header: "Created",
            field: "createdAt",
            key: "createdAt",
            sortable: true,
            body: (data) => (
                <div>
                    <small className="text-muted">{data.createdAt}</small>
                    <br />
                    <small className="text-muted">by {data.createdBy}</small>
                </div>
            )
        },
        {
            header: "Action",
            field: "action",
            key: "action",
            sortable: false,
            body: (data) => (
                <div className="edit-delete-action d-flex gap-2">
                    <Link
                        to="#"
                        className="p-2 rounded-circle bg-white shadow-sm border text-primary d-flex align-items-center justify-content-center hover-bg-primary hover-text-white transition-all"
                        title="View Details"
                        style={{ width: '32px', height: '32px' }}
                    >
                        <Eye size={14} />
                    </Link>
                    {data.status === 'Draft' && (
                        <Link
                            to="#"
                            className="p-2 rounded-circle bg-white shadow-sm border text-danger d-flex align-items-center justify-content-center hover-bg-danger hover-text-white transition-all"
                            title="Delete"
                            style={{ width: '32px', height: '32px' }}
                        >
                            <Trash2 size={14} />
                        </Link>
                    )}
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
                            <h4 className="mb-1">Count Sessions</h4>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">Count Sessions</li>
                                </ol>
                            </nav>
                        </div>
                        <Link to="#" className="btn btn-primary d-inline-flex align-items-center gap-2">
                            <Plus size={18} />
                            New Session
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <small className="text-muted d-block mb-1">Active Sessions</small>
                                        <h4 className="mb-0 fw-bold">1</h4>
                                    </div>
                                    <Lock className="text-primary" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <small className="text-muted d-block mb-1">In Review</small>
                                        <h4 className="mb-0 fw-bold">1</h4>
                                    </div>
                                    <AlertCircle className="text-warning" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <small className="text-muted d-block mb-1">Posted This Month</small>
                                        <h4 className="mb-0 fw-bold">2</h4>
                                    </div>
                                    <CheckCircle className="text-success" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <small className="text-muted d-block mb-1">Total Variances</small>
                                        <h4 className="mb-0 fw-bold">28</h4>
                                    </div>
                                    <AlertCircle className="text-danger" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter / Search Bar */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-3">
                        <div className="row g-3 align-items-center">
                            <div className="col-md-6 col-lg-4 position-relative">
                                <input
                                    type="text"
                                    className="form-control ps-5"
                                    placeholder="Search session name, ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                            </div>
                            <div className="col-md-6 col-lg-2">
                                <select
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Active">Active</option>
                                    <option value="In_Review">In Review</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Posted">Posted</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="col-md-6 col-lg-2">
                                <select
                                    className="form-select"
                                    value={scopeFilter}
                                    onChange={(e) => setScopeFilter(e.target.value)}
                                >
                                    <option value="">All Scopes</option>
                                    <option value="Full_Warehouse">Full Warehouse</option>
                                    <option value="By_Category">By Category</option>
                                    <option value="By_Location">By Location</option>
                                </select>
                            </div>
                            <div className="col-md-6 col-lg-4 text-end">
                                <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2">
                                    <Calendar size={16} />
                                    Date Range
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                        <h5 className="card-title mb-0 d-flex align-items-center gap-2">
                            <Filter size={18} className="text-primary" />
                            All Sessions ({filteredSessions.length})
                        </h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <PrimeDataTable
                                column={columns}
                                data={filteredSessions}
                                rows={rows}
                                setRows={setRows}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                totalRecords={filteredSessions.length}
                            />
                        </div>
                    </div>
                </div>

            </div>
            <CommonFooter />
        </div>
    );
};

export default CountSessionsList;
