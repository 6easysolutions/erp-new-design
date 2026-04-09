import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./AllMasters.css";
import { URLS } from '../../../../Urls';

const QuantityType = () => {
    const navigate = useNavigate();

    const [quantityTypeName, setQuantityTypeName]   = useState('');
    const [searchTerm, setSearchTerm]               = useState('');
    const [rowsPerPage, setRowsPerPage]             = useState(5);
    const [currentPage, setCurrentPage]             = useState(1);
    const [editingId, setEditingId]                 = useState(null);
    const [editValue, setEditValue]                 = useState('');
    const [quantityTypesData, setQuantityTypesData] = useState([]);
    const [loading, setLoading]                     = useState(false);
    const [pageLoading, setPageLoading]             = useState(true);

    useEffect(() => { fetchQuantityTypes(); }, []);

    const fetchQuantityTypes = async () => {
        setPageLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(URLS.GetQuantityType, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setQuantityTypesData(data.weight || []); // ← data.weight preserved
            } else {
                toast.error(data.message || 'Failed to fetch quantity types');
            }
        } catch {
            toast.error('Network error. Please try again.');
        } finally {
            setPageLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!quantityTypeName.trim()) { toast.error('Please enter a quantity type name!'); return; }
        setLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(URLS.AddQuantityType, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: quantityTypeName }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                toast.success(data.message || 'Quantity type added successfully!');
                setQuantityTypeName('');
                fetchQuantityTypes();
            } else {
                toast.error(data.message || 'Failed to add quantity type');
            }
        } catch {
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit       = (id, name) => { setEditingId(id); setEditValue(name); };
    const handleCancelEdit = ()          => { setEditingId(null); setEditValue(''); };

    const handleSaveEdit = async (id) => {
        if (!editValue.trim()) { toast.error('Quantity type name cannot be empty!'); return; }
        setLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${URLS.EditQuantityType}${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: editValue }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                toast.success(data.message || 'Quantity type updated successfully!');
                setEditingId(null);
                setEditValue('');
                fetchQuantityTypes();
            } else {
                toast.error(data.message || 'Failed to update quantity type');
            }
        } catch {
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        setLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${URLS.DeleteQuantityType}${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }), // ← DELETE body preserved
            });
            const data = await response.json();
            if (response.ok && data.success) {
                toast.success(data.message || 'Quantity type deleted successfully!');
                fetchQuantityTypes();
            } else {
                toast.error(data.message || 'Failed to delete quantity type');
            }
        } catch {
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredData  = quantityTypesData.filter(qt =>
        qt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages    = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex    = (currentPage - 1) * rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

    // ── Page Loading ──────────────────────────────────────────────────────────
    if (pageLoading) {
        return (
            <div className="pms-m-page-loader">
                <div className="text-center">
                    <div className="spinner-border pms-m-loader-spinner" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="pms-m-loader-text">Loading quantity types...</p>
                </div>
            </div>
        );
    }

    // ── Main Render ───────────────────────────────────────────────────────────
    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="pms-m-root">
                <div className="pms-m-main-card">

                    {/* ── Page Header ── */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="pms-m-title">Quantity Type List</h1>
                        <button className="pms-m-btn pms-m-btn-back" onClick={() => navigate('/all-masters')}>
                            <i className="bi bi-arrow-left"></i>
                            Back
                        </button>
                    </div>

                    {/* ── Two Column Layout (independent heights) ── */}
                    <div className="row g-4 align-items-start">

                        {/* ── LEFT: Add Form ── */}
                        <div className="col-lg-4">
                            <div className="pms-m-section-card">
                                <div className="pms-m-section-title">
                                    <div className="pms-m-header-icon pms-m-header-icon-blue">
                                        <i className="bi bi-plus-circle"></i>
                                    </div>
                                    Add Quantity Type
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <span className="pms-m-field-label">Quantity Type Name</span>
                                    <div className="pms-m-field-group">
                                        <input
                                            className="pms-m-field-input"
                                            type="text"
                                            value={quantityTypeName}
                                            onChange={(e) => setQuantityTypeName(e.target.value)}
                                            placeholder="Enter quantity type name"
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    <div className="pms-m-hint">
                                        <i className="bi bi-info-circle"></i>
                                        Enter a unique quantity type (e.g., Kg, Liter, Piece, Grams)
                                    </div>

                                    <button
                                        type="submit"
                                        className="pms-m-btn pms-m-btn-add"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-plus-lg"></i>
                                                Submit
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* ── RIGHT: Table ── */}
                        <div className="col-lg-8">
                            <div className="pms-m-section-card">

                                {/* Toolbar */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="pms-m-section-title mb-0">
                                        <div className="pms-m-header-icon pms-m-header-icon-blue">
                                            <i className="bi bi-list-ul"></i>
                                        </div>
                                        Quantity Types
                                        <span className="pms-m-count-badge">{filteredData.length}</span>
                                    </div>
                                    <div className="pms-m-search-group">
                                        <i className="bi bi-search pms-m-search-icon"></i>
                                        <input
                                            className="pms-m-search-input"
                                            type="text"
                                            placeholder="Search quantity types..."
                                            value={searchTerm}
                                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        />
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="pms-m-table-wrapper">
                                    <table className="pms-m-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '10%' }}>S.No</th>
                                                <th style={{ width: '60%' }}>Quantity Type Name</th>
                                                <th style={{ width: '30%', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.length > 0 ? (
                                                paginatedData.map((qt, index) => (
                                                    <tr key={qt.id}>
                                                        <td>
                                                            <span className="pms-m-sno">{startIndex + index + 1}</span>
                                                        </td>
                                                        <td>
                                                            {editingId === qt.id ? (
                                                                <input
                                                                    className="pms-m-edit-input"
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    autoFocus
                                                                    disabled={loading}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter')  handleSaveEdit(qt.id);
                                                                        if (e.key === 'Escape') handleCancelEdit();
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span style={{ fontWeight: 500, color: '#1e293b' }}>
                                                                    {qt.name}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex gap-2 justify-content-end">
                                                                {editingId === qt.id ? (
                                                                    <>
                                                                        <button
                                                                            className="pms-m-act-btn pms-m-act-save"
                                                                            onClick={() => handleSaveEdit(qt.id)}
                                                                            disabled={loading}
                                                                            title="Save"
                                                                        >
                                                                            {loading
                                                                                ? <span className="spinner-border spinner-border-sm" />
                                                                                : <i className="bi bi-check-lg"></i>
                                                                            }
                                                                        </button>
                                                                        <button
                                                                            className="pms-m-act-btn pms-m-act-cancel"
                                                                            onClick={handleCancelEdit}
                                                                            disabled={loading}
                                                                            title="Cancel"
                                                                        >
                                                                            <i className="bi bi-x-lg"></i>
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            className="pms-m-act-btn pms-m-act-edit"
                                                                            onClick={() => handleEdit(qt.id, qt.name)}
                                                                            disabled={loading}
                                                                            title="Edit"
                                                                        >
                                                                            <i className="bi bi-pencil-square"></i>
                                                                        </button>
                                                                        <button
                                                                            className="pms-m-act-btn pms-m-act-delete"
                                                                            onClick={() => handleDelete(qt.id, qt.name)}
                                                                            disabled={loading}
                                                                            title="Delete"
                                                                        >
                                                                            <i className="bi bi-trash"></i>
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3">
                                                        <div className="pms-m-empty">
                                                            <i className="bi bi-inbox pms-m-empty-icon"></i>
                                                            <span className="pms-m-empty-text">
                                                                {searchTerm ? 'No quantity types found matching your search' : 'No quantity types to display'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {filteredData.length > 0 && (
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="pms-m-pg-text">Rows per page:</span>
                                            <select
                                                className="pms-m-pg-select"
                                                value={rowsPerPage}
                                                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                            >
                                                <option value={5}>5</option>
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                            </select>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="pms-m-pg-text">
                                                {startIndex + 1}–{Math.min(startIndex + rowsPerPage, filteredData.length)} of {filteredData.length}
                                            </span>
                                            <button
                                                className="pms-m-pg-btn"
                                                onClick={() => setCurrentPage(p => p - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <i className="bi bi-chevron-left"></i>
                                            </button>
                                            <button
                                                className="pms-m-pg-btn"
                                                onClick={() => setCurrentPage(p => p + 1)}
                                                disabled={currentPage === totalPages || totalPages === 0}
                                            >
                                                <i className="bi bi-chevron-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default QuantityType;
