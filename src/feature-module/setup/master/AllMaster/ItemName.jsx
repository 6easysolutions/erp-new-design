import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./AllMasters.css";
import { URLS } from '../../../../Urls';

const ItemName = () => {
    const navigate = useNavigate();

    const [itemName, setItemName]         = useState('');
    const [searchTerm, setSearchTerm]     = useState('');
    const [rowsPerPage, setRowsPerPage]   = useState(5);
    const [currentPage, setCurrentPage]   = useState(1);
    const [editingId, setEditingId]       = useState(null);
    const [editValue, setEditValue]       = useState('');
    const [itemsData, setItemsData]       = useState([]);
    const [isLoading, setIsLoading]       = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getAuthToken = () => localStorage.getItem('authToken') || '';
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        }
    };

    useEffect(() => { fetchAllItems(); }, []);

    const fetchAllItems = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${URLS.GetItemName}`, {}, axiosConfig);
            if (response.data.success) {
                setItemsData(response.data.itemname || []);
            } else {
                toast.error('Failed to fetch items');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch items. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!itemName.trim()) { toast.error('Please enter an item name!'); return; }
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${URLS.AddItemName}`, { name: itemName }, axiosConfig);
            if (response.data.success) {
                toast.success(response.data.message || 'Item added successfully!');
                setItemName('');
                await fetchAllItems();
            } else {
                toast.error('Failed to add item');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit       = (id, name) => { setEditingId(id); setEditValue(name); };
    const handleCancelEdit = ()         => { setEditingId(null); setEditValue(''); };

    const handleSaveEdit = async (id) => {
        if (!editValue.trim()) { toast.error('Item name cannot be empty!'); return; }
        setIsSubmitting(true);
        try {
            const response = await axios.put(`${URLS.EditItemName}/${id}`, { name: editValue }, axiosConfig);
            if (response.data.success) {
                toast.success(response.data.message || 'Item updated successfully!');
                setEditingId(null);
                setEditValue('');
                await fetchAllItems();
            } else {
                toast.error('Failed to update item');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        setIsSubmitting(true);
        try {
            const response = await axios.delete(`${URLS.DeleteItemName}/${id}`, axiosConfig);
            if (response.data.success) {
                toast.success(response.data.message || 'Item deleted successfully!');
                await fetchAllItems();
            } else {
                toast.error('Failed to delete item');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredData  = itemsData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages    = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex    = (currentPage - 1) * rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="pms-m-root">
                <div className="pms-m-main-card">

                    {/* ── Page Header ── */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="pms-m-title">Item Name List</h1>
                        <button className="pms-m-btn pms-m-btn-back" onClick={() => navigate('/all-masters')}>
                            <i className="bi bi-arrow-left"></i>
                            Back
                        </button>
                    </div>

                    {/* ── Two Column Layout ── */}
                    <div className="row g-4 align-items-start">

                        {/* ── LEFT: Add Form ── */}
                        <div className="col-lg-4">
                            <div className="pms-m-section-card">
                                <div className="pms-m-section-title">
                                    <div className="pms-m-header-icon pms-m-header-icon-blue">
                                        <i className="bi bi-plus-circle"></i>
                                    </div>
                                    Add Item Name
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <span className="pms-m-field-label">Item Name</span>
                                    <div className="pms-m-field-group">
                                        <input
                                            className="pms-m-field-input"
                                            type="text"
                                            value={itemName}
                                            onChange={(e) => setItemName(e.target.value)}
                                            placeholder="Enter item name"
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>

                                    <div className="pms-m-hint">
                                        <i className="bi bi-info-circle"></i>
                                        Enter a unique item name
                                    </div>

                                    <button
                                        type="submit"
                                        className="pms-m-btn pms-m-btn-add"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                Submitting...
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
                                        Item Names
                                        <span className="pms-m-count-badge">{filteredData.length}</span>
                                    </div>
                                    <div className="pms-m-search-group">
                                        <i className="bi bi-search pms-m-search-icon"></i>
                                        <input
                                            className="pms-m-search-input"
                                            type="text"
                                            placeholder="Search item names..."
                                            value={searchTerm}
                                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        />
                                    </div>
                                </div>

                                {/* Table or Inline Loader */}
                                {isLoading ? (
                                    <div className="pms-m-empty">
                                        <div className="spinner-border mb-3"
                                            style={{ color: '#3b82f6', width: '36px', height: '36px' }}
                                            role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="pms-m-pg-text" style={{ margin: 0 }}>
                                            Loading items...
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="pms-m-table-wrapper">
                                            <table className="pms-m-table">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '10%' }}>S.No</th>
                                                        <th style={{ width: '60%' }}>Item Name</th>
                                                        <th style={{ width: '30%', textAlign: 'right' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedData.length > 0 ? (
                                                        paginatedData.map((item, index) => (
                                                            <tr key={item.id}>
                                                                <td>
                                                                    <span className="pms-m-sno">{startIndex + index + 1}</span>
                                                                </td>
                                                                <td>
                                                                    {editingId === item.id ? (
                                                                        <input
                                                                            className="pms-m-edit-input"
                                                                            value={editValue}
                                                                            onChange={(e) => setEditValue(e.target.value)}
                                                                            autoFocus
                                                                            disabled={isSubmitting}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter')  handleSaveEdit(item.id);
                                                                                if (e.key === 'Escape') handleCancelEdit();
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <span style={{ fontWeight: 500, color: '#1e293b' }}>
                                                                            {item.name}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex gap-2 justify-content-end">
                                                                        {editingId === item.id ? (
                                                                            <>
                                                                                <button
                                                                                    className="pms-m-act-btn pms-m-act-save"
                                                                                    onClick={() => handleSaveEdit(item.id)}
                                                                                    disabled={isSubmitting}
                                                                                    title="Save"
                                                                                >
                                                                                    {isSubmitting
                                                                                        ? <span className="spinner-border spinner-border-sm" />
                                                                                        : <i className="bi bi-check-lg"></i>
                                                                                    }
                                                                                </button>
                                                                                <button
                                                                                    className="pms-m-act-btn pms-m-act-cancel"
                                                                                    onClick={handleCancelEdit}
                                                                                    disabled={isSubmitting}
                                                                                    title="Cancel"
                                                                                >
                                                                                    <i className="bi bi-x-lg"></i>
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <button
                                                                                    className="pms-m-act-btn pms-m-act-edit"
                                                                                    onClick={() => handleEdit(item.id, item.name)}
                                                                                    disabled={isSubmitting}
                                                                                    title="Edit"
                                                                                >
                                                                                    <i className="bi bi-pencil-square"></i>
                                                                                </button>
                                                                                <button
                                                                                    className="pms-m-act-btn pms-m-act-delete"
                                                                                    onClick={() => handleDelete(item.id, item.name)}
                                                                                    disabled={isSubmitting}
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
                                                                        {searchTerm
                                                                            ? 'No items found matching your search'
                                                                            : 'No items to display. Add your first item!'
                                                                        }
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
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ItemName;
