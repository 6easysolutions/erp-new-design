import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router';
import { URLS } from '../../../../Urls';

const Warehouse = () => {
    const navigate = useNavigate();

    const [warehouseName, setWarehouseName] = useState('');
    const [warehouseType, setWarehouseType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState('');

    const [warehouseData, setWarehouseData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch warehouses on component mount
    useEffect(() => {
        fetchWarehouses();
    }, []);

    // Fetch all warehouses
    const fetchWarehouses = async () => {
        setPageLoading(true);
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(URLS.GetWarehouse, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setWarehouseData(data.data || []);
            } else {
                setError(data.message || 'Failed to fetch warehouses');
            }
        } catch (err) {
            console.error('Error fetching warehouses:', err);
            setError('Network error. Please try again.');
        } finally {
            setPageLoading(false);
        }
    };

    // Handle form submission - Add Warehouse
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!warehouseName.trim() || !warehouseType.trim()) {
            setError('Please enter both warehouse name and type!');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(URLS.AddWarehouse, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    warehouseName: warehouseName,
                    warehouseType: warehouseType
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('Warehouse created successfully');
                setWarehouseName('');
                setWarehouseType('');
                fetchWarehouses(); // Refresh the list

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message || 'Failed to add warehouse');
            }
        } catch (err) {
            console.error('Error adding warehouse:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle edit
    const handleEdit = (warehouse) => {
        setEditingId(warehouse.id);
        setEditName(warehouse.warehouseName);
        setEditType(warehouse.warehouseType);
        setError('');
        setSuccess('');
    };

    // Handle save edit
    const handleSaveEdit = async (id) => {
        if (!editName.trim() || !editType.trim()) {
            setError('Fields cannot be empty!');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${URLS.EditWarehouse}${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    warehouseName: editName,
                    warehouseType: editType
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('Warehouse updated successfully!');
                setEditingId(null);
                setEditName('');
                setEditType('');
                fetchWarehouses(); // Refresh the list

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message || 'Failed to update warehouse');
            }
        } catch (err) {
            console.error('Error updating warehouse:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditType('');
        setError('');
    };

    // Handle delete
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${URLS.DeleteWarehouse}${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('Warehouse deleted successfully');
                fetchWarehouses(); // Refresh the list

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message || 'Failed to delete warehouse');
            }
        } catch (err) {
            console.error('Error deleting warehouse:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle back navigation
    const handleBack = () => {
        navigate('/all-masters');
    };

    // Filter data based on search term
    const filteredData = warehouseData.filter(item =>
        (item.warehouseName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.warehouseType || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // Show loading state
    if (pageLoading) {
        return (
            <div style={{ paddingTop: '90px', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
                <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading warehouses...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '90px', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
            <div className="container-fluid" style={{ maxWidth: '1400px' }}>
                {/* Page Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-semibold" style={{ color: '#2c3e50' }}>
                        Warehouses
                    </h5>
                    <button
                        className="btn d-flex align-items-center gap-2 px-3 py-2"
                        onClick={handleBack}
                        style={{
                            backgroundColor: '#4a90e2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        <i className="bi bi-arrow-left"></i>
                        Back
                    </button>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setError('')}
                            aria-label="Close"
                        ></button>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                        <i className="bi bi-check-circle me-2"></i>
                        {success}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setSuccess('')}
                            aria-label="Close"
                        ></button>
                    </div>
                )}

                <div className="row g-3">
                    {/* Left Column - Add Warehouse Form */}
                    <div className="col-lg-4 col-md-5">
                        <div className="card border-0" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div className="card-body p-4">
                                <h6 className="fw-semibold mb-3 pb-2 border-bottom" style={{ color: '#2c3e50' }}>
                                    Add Warehouse
                                </h6>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#495057' }}>
                                            Warehouse Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={warehouseName}
                                            onChange={(e) => setWarehouseName(e.target.value)}
                                            placeholder="Enter Warehouse Name"
                                            style={{
                                                fontSize: '14px',
                                                padding: '8px 12px',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '4px'
                                            }}
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#495057' }}>
                                            Warehouse Type
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={warehouseType}
                                            onChange={(e) => setWarehouseType(e.target.value)}
                                            placeholder="Enter Warehouse Type (e.g., central)"
                                            style={{
                                                fontSize: '14px',
                                                padding: '8px 12px',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '4px'
                                            }}
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn w-100"
                                        disabled={loading}
                                        style={{
                                            backgroundColor: '#4a90e2',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-plus-circle me-2"></i>
                                                Submit
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Data Table */}
                    <div className="col-lg-8 col-md-7">
                        <div className="card border-0" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div className="card-body p-4">
                                {/* Table Header */}
                                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                    <h6 className="fw-semibold mb-0" style={{ color: '#2c3e50' }}>
                                        Warehouse List ({filteredData.length})
                                    </h6>
                                    <div style={{ width: '280px' }}>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Search warehouses"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            style={{
                                                fontSize: '13px',
                                                padding: '6px 12px',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0" style={{ fontSize: '14px' }}>
                                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                                            <tr>
                                                <th className="fw-semibold py-2" style={{ width: '10%', fontSize: '13px', color: '#495057' }}>S. No</th>
                                                <th className="fw-semibold py-2" style={{ width: '40%', fontSize: '13px', color: '#495057' }}>Warehouse Name</th>
                                                <th className="fw-semibold py-2" style={{ width: '25%', fontSize: '13px', color: '#495057' }}>Type</th>
                                                <th className="fw-semibold py-2 text-end" style={{ width: '25%', fontSize: '13px', color: '#495057' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.length > 0 ? (
                                                paginatedData.map((item, index) => (
                                                    <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                        <td className="py-2" style={{ color: '#6c757d' }}>
                                                            {startIndex + index + 1}
                                                        </td>
                                                        <td className="py-2" style={{ color: '#2c3e50' }}>
                                                            {editingId === item.id ? (
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={editName}
                                                                    onChange={(e) => setEditName(e.target.value)}
                                                                    autoFocus
                                                                    disabled={loading}
                                                                />
                                                            ) : (
                                                                item.warehouseName
                                                            )}
                                                        </td>
                                                        <td className="py-2" style={{ color: '#2c3e50' }}>
                                                            {editingId === item.id ? (
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={editType}
                                                                    onChange={(e) => setEditType(e.target.value)}
                                                                    disabled={loading}
                                                                />
                                                            ) : (
                                                                item.warehouseType
                                                            )}
                                                        </td>
                                                        <td className="py-2 text-end">
                                                            {editingId === item.id ? (
                                                                <div className="d-inline-flex gap-1">
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        onClick={() => handleSaveEdit(item.id)}
                                                                        disabled={loading}
                                                                        style={{ backgroundColor: '#28a745', color: 'white' }}
                                                                    >
                                                                        {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-check-lg"></i>}
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        onClick={handleCancelEdit}
                                                                        disabled={loading}
                                                                        style={{ backgroundColor: '#6c757d', color: 'white' }}
                                                                    >
                                                                        <i className="bi bi-x-lg"></i>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="d-inline-flex gap-1">
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        onClick={() => handleEdit(item)}
                                                                        disabled={loading}
                                                                        style={{ backgroundColor: '#e3f2fd', color: '#4a90e2', border: 'none' }}
                                                                    >
                                                                        <i className="bi bi-pencil-square"></i>
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        onClick={() => handleDelete(item.id, item.warehouseName)}
                                                                        disabled={loading}
                                                                        style={{ backgroundColor: '#ffebee', color: '#dc3545', border: 'none' }}
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-5">
                                                        <div className="text-muted">
                                                            <i className="bi bi-inbox" style={{ fontSize: '40px', opacity: 0.3 }}></i>
                                                            <p className="mb-0 mt-2" style={{ fontSize: '14px' }}>No warehouses to display</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {filteredData.length > 0 && (
                                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="text-muted" style={{ fontSize: '13px' }}>Rows per page:</span>
                                            <select
                                                className="form-select form-select-sm"
                                                value={rowsPerPage}
                                                onChange={(e) => {
                                                    setRowsPerPage(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                                style={{ width: '70px', fontSize: '13px' }}
                                            >
                                                <option value={5}>5</option>
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                            </select>
                                        </div>

                                        <div className="d-flex align-items-center gap-3">
                                            <span className="text-muted" style={{ fontSize: '13px' }}>
                                                {startIndex + 1}–{Math.min(endIndex, filteredData.length)} of {filteredData.length}
                                            </span>
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm"
                                                    onClick={handlePreviousPage}
                                                    disabled={currentPage === 1}
                                                    style={{ backgroundColor: 'white', border: '1px solid #dee2e6' }}
                                                >
                                                    <i className="bi bi-chevron-left"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm"
                                                    onClick={handleNextPage}
                                                    disabled={currentPage === totalPages}
                                                    style={{ backgroundColor: 'white', border: '1px solid #dee2e6' }}
                                                >
                                                    <i className="bi bi-chevron-right"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Warehouse;