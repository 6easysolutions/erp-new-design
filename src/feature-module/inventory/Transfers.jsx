import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import TableTopHead from "../../components/table-top-head";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import "../../assets/css/inventory-premium.css";
import { all_routes } from "../../routes/all_routes";

const Transfers = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("view"); // 'view' or 'add'
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const Navigate = useNavigate();

    // Mock Data
    const [transfers, setTransfers] = useState([
        { id: 1, ref: "TR-2026-001", date: "25 Jan 2026", from: "Main Warehouse", to: "Kitchen Dept", items: 12, status: "Completed", user: "Admin", notes: "Weekly restock" },
        { id: 2, ref: "TR-2026-002", date: "24 Jan 2026", from: "Central Store", to: "Bar", items: 5, status: "Pending", user: "John Doe", notes: "Urgent request" },
        { id: 3, ref: "TR-2026-003", date: "22 Jan 2026", from: "Main Warehouse", to: "Housekeeping", items: 20, status: "Completed", user: "Jane Smith", notes: "Cleaning supplies" },
    ]);

    const [rows, setRows] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState("All");

    // Details Mock Data
    const transferItems = [
        { id: 101, name: "Tomato", sku: "VEG-001", qty: 5, unit: "kg" },
        { id: 102, name: "Onion", sku: "VEG-002", qty: 7, unit: "kg" },
    ];

    // Handlers
    const handleShowView = (data) => {
        setSelectedTransfer(data);
        setModalType("view");
        setShowModal(true);
    };

    const handleShowAdd = () => {
        setSelectedTransfer(null);
        setModalType("add");
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    // Status Step Visual
    const renderStatus = (status) => {
        const isCompleted = status === "Completed";
        const isPending = status === "Pending";

        return (
            <div className="transfer-status-step">
                <span className={`transfer-status-dot ${isCompleted ? 'completed' : 'pending'}`}></span>
                <span className={isCompleted ? 'text-success fw-bold' : 'text-warning fw-bold'}>
                    {status}
                </span>
            </div>
        );
    };

    const columns = [
        { header: "Date", field: "date", key: "date", sortable: true },
        {
            header: "Reference",
            field: "ref",
            key: "ref",
            sortable: true,
            body: (data) => <span className="text-primary fw-bold cursor-pointer hover-underline">{data.ref}</span>,
        },
        { header: "From", field: "from", key: "from", sortable: true },
        { header: "To", field: "to", key: "to", sortable: true },
        {
            header: "Items",
            field: "items",
            key: "items",
            sortable: true,
            body: (data) => <span className="badge bg-light text-dark border rounded-pill px-3 py-2">{data.items} Items</span>,
        },
        {
            header: "Status",
            field: "status",
            key: "status",
            sortable: true,
            body: (data) => renderStatus(data.status),
        },
        {
            header: "Action",
            key: "action",
            body: (data) => (
                <div className="action-table-data">
                    <div className="edit-delete-action">
                        <OverlayTrigger placement="top" overlay={<Tooltip>View Details</Tooltip>}>
                            <Link to="#" className="me-2 p-2 bg-light rounded-circle text-dark hover-effect" onClick={() => handleShowView(data)}>
                                <i className="feather icon-eye" />
                            </Link>
                        </OverlayTrigger>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="page-wrapper">
            <div className="content">
                <div className="page-header mb-4">
                    <div className="add-item d-flex">
                        <div className="page-title">
                            <h4 className="fw-bold text-dark">Stock Transfers</h4>
                            <h6 className="text-muted">Track and manage internal inventory requests</h6>
                        </div>
                    </div>
                    <ul className="table-top-head">
                        <li>
                            <button onClick={() => Navigate(all_routes.createTransfer)} className="btn btn-primary rounded-pill px-4 shadow-sm">
                                <i className="feather icon-plus me-2"></i> New Transfer
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Filters */}
                <div className="mb-4 d-flex align-items-center">
                    {['All', 'Completed', 'Pending'].map(filter => (
                        <div
                            key={filter}
                            className={`inventory-pill ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="card table-list-card border-0 shadow-lg px-3 py-3" style={{ borderRadius: '16px' }}>
                    <div className="card-body">
                        <div className="table-top">
                            <div className="search-set">
                                <div className="search-input">
                                    <input
                                        type="text"
                                        className="form-control rounded-pill border-0 bg-light"
                                        placeholder="Search Reference ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Link to="#" className="btn btn-searchset"><i className="feather icon-search" /></Link>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <PrimeDataTable
                                data={transfers}
                                column={columns}
                                rows={rows}
                                setRows={setRows}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                totalRecords={transfers.length}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <CommonFooter />

            {/* Modal */}
            <Modal show={showModal} onHide={handleClose} size="lg" centered contentClassName="border-0 rounded-4 overflow-hidden">
                <Modal.Header closeButton className="bg-light border-0">
                    <Modal.Title className="fw-bold">{modalType === 'view' ? 'Transfer Details' : 'Create New Transfer'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {modalType === 'view' && selectedTransfer ? (
                        <div className="row g-4">
                            <div className="col-12 d-flex justify-content-between align-items-center border-bottom pb-3">
                                <div>
                                    <span className="text-muted text-uppercase text-xs fw-bold">Reference</span>
                                    <h4 className="fw-bold text-primary mb-0">{selectedTransfer.ref}</h4>
                                </div>
                                <div className="text-end">
                                    <span className="text-muted text-uppercase text-xs fw-bold d-block mb-1">Status</span>
                                    {renderStatus(selectedTransfer.status)}
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="p-3 bg-light rounded-3 h-100">
                                    <label className="text-muted text-xs fw-bold text-uppercase mb-2">Source</label>
                                    <div className="d-flex align-items-center">
                                        <div className="avatar-xs bg-white rounded-circle d-flex align-items-center justify-content-center me-2"><i className="feather icon-arrow-up-right text-danger"></i></div>
                                        <h6 className="mb-0">{selectedTransfer.from}</h6>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 bg-light rounded-3 h-100">
                                    <label className="text-muted text-xs fw-bold text-uppercase mb-2">Destination</label>
                                    <div className="d-flex align-items-center">
                                        <div className="avatar-xs bg-white rounded-circle d-flex align-items-center justify-content-center me-2"><i className="feather icon-arrow-down-left text-success"></i></div>
                                        <h6 className="mb-0">{selectedTransfer.to}</h6>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 bg-light rounded-3 h-100">
                                    <label className="text-muted text-xs fw-bold text-uppercase mb-2">Date</label>
                                    <h6 className="mb-0 mt-1">{selectedTransfer.date}</h6>
                                </div>
                            </div>

                            <div className="col-12">
                                <h6 className="fw-bold mb-3">Items ({transferItems.length})</h6>
                                <div className="table-responsive rounded-3 border">
                                    <table className="table table-hover mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="border-0">Product</th>
                                                <th className="border-0">SKU</th>
                                                <th className="border-0 text-end">Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transferItems.map(item => (
                                                <tr key={item.id}>
                                                    <td className="align-middle fw-medium">{item.name}</td>
                                                    <td className="align-middle text-muted">{item.sku}</td>
                                                    <td className="align-middle text-end fw-bold">{item.qty} {item.unit}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <div className="mb-3"><i className="feather icon-plus-circle fs-1 text-primary opacity-50"></i></div>
                            <h5>Create Transfer Form Placeholder</h5>
                            <p className="text-muted">Form fields would go here (Source, Destination, Product Select).</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <button className="btn btn-light rounded-pill px-4" onClick={handleClose}>Close</button>
                    {modalType === 'add' && (
                        <button className="btn btn-primary rounded-pill px-4" onClick={handleClose}>Create Transfer</button>
                    )}
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default Transfers;