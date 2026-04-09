import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./AllMasters.css";
import { URLS } from '../../../../Urls';

const Brand = () => {
    const navigate = useNavigate();

    const [brandName, setBrandName]     = useState('');
    const [searchTerm, setSearchTerm]   = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingId, setEditingId]     = useState(null);
    const [editValue, setEditValue]     = useState('');
    const [brandsData, setBrandsData]   = useState([]);
    const [loading, setLoading]         = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => { fetchBrands(); }, []);

    const fetchBrands = async () => {
        setPageLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(URLS.GetBrand, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setBrandsData(data.brands || []);
            } else {
                toast.error(data.message || 'Failed to fetch brands');
            }
        } catch {
            toast.error('Network error. Please try again.');
        } finally {
            setPageLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!brandName.trim()) { toast.error('Please enter a brand name!'); return; }
        setLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(URLS.AddBrand, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: brandName }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                toast.success('Brand added successfully!');
                setBrandName('');
                fetchBrands();
            } else {
                toast.error(data.message || 'Failed to add brand');
            }
        } catch {
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit       = (id, name) => { setEditingId(id); setEditValue(name); };
    const handleCancelEdit = ()         => { setEditingId(null); setEditValue(''); };

    const handleSaveEdit = async (id) => {
        if (!editValue.trim()) { toast.error('Brand name cannot be empty!'); return; }
        setLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${URLS.EditBrand}${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: editValue }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                toast.success('Brand updated successfully!');
                setEditingId(null);
                setEditValue('');
                fetchBrands();
            } else {
                toast.error(data.message || 'Failed to update brand');
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
            const response = await fetch(`${URLS.DeleteBrand}${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok && data.success) {
                toast.success('Brand deleted successfully!');
                fetchBrands();
            } else {
                toast.error(data.message || 'Failed to delete brand');
            }
        } catch {
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredData  = brandsData.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <p className="pms-m-loader-text">Loading brands...</p>
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
                        <h1 className="pms-m-title">Brand List</h1>
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
                                    Add Brand
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <span className="pms-m-field-label">Brand Name</span>
                                    <div className="pms-m-field-group">
                                        <input
                                            className="pms-m-field-input"
                                            type="text"
                                            value={brandName}
                                            onChange={(e) => setBrandName(e.target.value)}
                                            placeholder="Enter brand name"
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    <div className="pms-m-hint">
                                        <i className="bi bi-info-circle"></i>
                                        Enter a unique brand name
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
                                        Brands
                                        <span className="pms-m-count-badge">{filteredData.length}</span>
                                    </div>
                                    <div className="pms-m-search-group">
                                        <i className="bi bi-search pms-m-search-icon"></i>
                                        <input
                                            className="pms-m-search-input"
                                            type="text"
                                            placeholder="Search brands..."
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
                                                <th style={{ width: '60%' }}>Brand Name</th>
                                                <th style={{ width: '30%', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.length > 0 ? (
                                                paginatedData.map((brand, index) => (
                                                    <tr key={brand.id}>
                                                        <td>
                                                            <span className="pms-m-sno">{startIndex + index + 1}</span>
                                                        </td>
                                                        <td>
                                                            {editingId === brand.id ? (
                                                                <input
                                                                    className="pms-m-edit-input"
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    autoFocus
                                                                    disabled={loading}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter')  handleSaveEdit(brand.id);
                                                                        if (e.key === 'Escape') handleCancelEdit();
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span style={{ fontWeight: 500, color: '#1e293b' }}>
                                                                    {brand.name}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex gap-2 justify-content-end">
                                                                {editingId === brand.id ? (
                                                                    <>
                                                                        <button
                                                                            className="pms-m-act-btn pms-m-act-save"
                                                                            onClick={() => handleSaveEdit(brand.id)}
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
                                                                            onClick={() => handleEdit(brand.id, brand.name)}
                                                                            disabled={loading}
                                                                            title="Edit"
                                                                        >
                                                                            <i className="bi bi-pencil-square"></i>
                                                                        </button>
                                                                        <button
                                                                            className="pms-m-act-btn pms-m-act-delete"
                                                                            onClick={() => handleDelete(brand.id, brand.name)}
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
                                                                {searchTerm ? 'No brands found matching your search' : 'No brands to display'}
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

export default Brand;
