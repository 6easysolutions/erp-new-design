import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { URLS } from '../../../Urls';

const StoreSettings = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');

  // Fetch stores on component mount
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(URLS.GetAllStore, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStores(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch stores');
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter stores based on search term
  const filteredStores = stores.filter((store) =>
    store.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.storePhone?.includes(searchTerm) ||
    store.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastStore = currentPage * rowsPerPage;
  const indexOfFirstStore = indexOfLastStore - rowsPerPage;
  const currentStores = filteredStores.slice(indexOfFirstStore, indexOfLastStore);
  const totalPages = Math.ceil(filteredStores.length / rowsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDelete = async (storeId) => {
    if (!window.confirm('Are you sure you want to delete this store?')) {
      return;
    }

    const token = localStorage.getItem('authToken');
    
    try {
      const response = await fetch(`${URLS.DeleteStore}${storeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh the store list
        fetchStores();
        alert('Store deleted successfully');
      } else {
        alert(data.message || 'Failed to delete store');
      }
    } catch (err) {
      console.error('Error deleting store:', err);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <h4>Store Setting</h4>
          </div>
        </div>

        {/* Store List Card */}
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Store List</h5>
              <div className="d-flex gap-3 align-items-center">
                <div className="search-set">
                  <div className="search-input">
                    <input
                      type="text"
                      placeholder="Search by name"
                      className="form-control form-control-sm"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                      }}
                    />
                    <Link to="#" className="btn btn-searchset">
                      <i className="ti ti-search" />
                    </Link>
                  </div>
                </div>
                <Link
                  to="/add-store"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-plus me-1" />
                  Create Store
                </Link>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError('')}
                  aria-label="Close"
                ></button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading stores...</p>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Store Name</th>
                        <th>Service Name</th>
                        <th>Store Email</th>
                        <th>Store Phone</th>
                        <th>Store Pincode</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStores.length > 0 ? (
                        currentStores.map((store, index) => (
                          <tr key={store.id}>
                            <td>{indexOfFirstStore + index + 1}</td>
                            <td>{store.storeName || '-'}</td>
                            <td>{store.serviceName || '-'}</td>
                            <td>{store.email || '-'}</td>
                            <td>{store.storePhone || '-'}</td>
                            <td>{store.storePincode || '-'}</td>
                            <td>
                              <span
                                className={`badge ${
                                  store.storeStatus === 'active'
                                    ? 'bg-success'
                                    : 'bg-danger'
                                }`}
                              >
                                {store.storeStatus || 'inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Link
                                  to={`/edit-store/${store.id}`}
                                  className="btn btn-md btn-icon btn-light-info "
                                  title="Edit"
                                >
                                  <i className="ti ti-edit" />
                                </Link>
                                <Link
                                  to={`/view-store/${store.id}`}
                                  className="btn btn-md btn-icon btn-light-primary"
                                  title="View"
                                >
                                  <i className="ti ti-eye " />
                                </Link>
                                <button
                                  onClick={() => handleDelete(store.id)}
                                  className="btn btn-md btn-icon btn-light-danger"
                                  title="Delete"
                                >
                                  <i className="ti ti-trash" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            <div className="text-muted">
                              <i className="ti ti-folder-off fs-2 mb-2" />
                              <p>No stores found</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredStores.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="d-flex align-items-center gap-2">
                      <span>Rows per page:</span>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: 'auto' }}
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                    
                    <div className="d-flex align-items-center gap-3">
                      <span>
                        {indexOfFirstStore + 1}-
                        {Math.min(indexOfLastStore, filteredStores.length)} of{' '}
                        {filteredStores.length}
                      </span>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-icon btn-light"
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                        >
                          <i className="ti ti-chevron-left" />
                        </button>
                        <button
                          className="btn btn-sm btn-icon btn-light"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                        >
                          <i className="ti ti-chevron-right" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
