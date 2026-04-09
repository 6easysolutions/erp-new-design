import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { URLS } from '../../../Urls';

const ViewStore = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [storeData, setStoreData] = useState(null);

  useEffect(() => {
    if (id) {
      fetchStoreById(id);
    }
  }, [id]);

  const fetchStoreById = async (storeId) => {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await fetch(URLS.GetByStoreId, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: storeId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStoreData(data.data);
      } else {
        setError(data.message || 'Failed to fetch store details');
      }
    } catch (err) {
      console.error('Error fetching store:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${URLS.Base}${imagePath}`;
  };

  // Loading State
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="mt-4 text-muted">Loading store details...</h5>
              <p className="text-muted small">Please wait while we fetch the information</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header border-bottom pb-3 mb-4">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title mb-1">View Store</h3>
                <p className="text-muted mb-0">Store information details</p>
              </div>
              <div className="col-auto">
                <Link to="/store-setting" className="btn btn-outline-secondary">
                  <i className="ti ti-arrow-left me-2"></i>
                  Back to Store List
                </Link>
              </div>
            </div>
          </div>
          <div className="alert alert-danger border-0 shadow-sm" role="alert">
            <div className="d-flex align-items-center">
              <i className="ti ti-alert-circle me-3" style={{ fontSize: '24px' }}></i>
              <div>
                <h6 className="mb-1">Error Loading Store</h6>
                <p className="mb-0">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!storeData) {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header border-bottom pb-3 mb-4">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title mb-1">View Store</h3>
                <p className="text-muted mb-0">Store information details</p>
              </div>
              <div className="col-auto">
                <Link to="/store-setting" className="btn btn-outline-secondary">
                  <i className="ti ti-arrow-left me-2"></i>
                  Back to Store List
                </Link>
              </div>
            </div>
          </div>
          <div className="alert alert-warning border-0 shadow-sm" role="alert">
            <div className="d-flex align-items-center">
              <i className="ti ti-info-circle me-3" style={{ fontSize: '24px' }}></i>
              <div>
                <h6 className="mb-1">Store Not Found</h6>
                <p className="mb-0">The requested store could not be found in our records.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Content
  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        {/* Enhanced Page Header */}
        <div className="page-header border-bottom pb-3 mb-4">
          <div className="row align-items-center ">
            <div className="col">
              <h3 className="page-title mb-1">Store Details</h3>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item"><Link to="/store-setting">Stores</Link></li>
                  <li className="breadcrumb-item active">{storeData.storeName}</li>
                </ol>
              </nav>
            </div>
            <div className="col-auto">
              <div className="d-flex gap-2">
                <Link to={`/edit-store/${id}`} className="btn btn-primary shadow-sm">
                  <i className="ti ti-edit me-2"></i>
                  Edit Store
                </Link>
                <Link to="/store-setting" className="btn btn-outline-secondary">
                  <i className="ti ti-arrow-left me-2"></i>
                  Back to List
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Store Overview Card */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-auto">
                <div className="avatar avatar-xl rounded" style={{ width: '80px', height: '80px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getImageUrl(storeData.storeLogo) ? (
                    <img
                      src={getImageUrl(storeData.storeLogo)}
                      alt="Store Logo"
                      className="rounded"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <i className="ti ti-building-store" style={{ fontSize: '40px', color: '#999' }}></i>
                  )}
                </div>
              </div>
              <div className="col">
                <h4 className="mb-1">{storeData.storeName || 'N/A'}</h4>
                <p className="text-muted mb-2">
                  <i className="ti ti-id me-1"></i>
                  {storeData.storeUniqueId || 'N/A'}
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <span className={`badge ${storeData.storeStatus === 'active' ? 'bg-success' : 'bg-danger'} px-3 py-2`}>
                    <i className="ti ti-circle-filled me-1" style={{ fontSize: '8px' }}></i>
                    {storeData.storeStatus ? storeData.storeStatus.toUpperCase() : 'INACTIVE'}
                  </span>
                  {storeData.registerType && (
                    <span className="badge bg-primary px-3 py-2">
                      <i className="ti ti-tag me-1"></i>
                      {storeData.registerType}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Basic Information */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="card-title mb-0">
              <i className="ti ti-info-circle me-2 text-primary"></i>
              Basic Information
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-id-badge me-1"></i>
                    Store Unique ID
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.storeUniqueId || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-building-store me-1"></i>
                    Store Name
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.storeName || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-mail me-1"></i>
                    Email Address
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.email || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-briefcase me-1"></i>
                    Service Name
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.serviceName || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-phone me-1"></i>
                    Store Phone
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.storePhone || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-file-invoice me-1"></i>
                    Store GST
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.storeGst || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-user me-1"></i>
                    Vendor Name
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.vendorName || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-package me-1"></i>
                    Package Name
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.packageName || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-status-change me-1"></i>
                    Status
                  </label>
                  <p className="mb-0">
                    <span className={`badge ${storeData.storeStatus === 'active' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} px-3 py-2`}>
                      <i className="ti ti-circle-filled me-1" style={{ fontSize: '8px' }}></i>
                      {storeData.storeStatus ? storeData.storeStatus.toUpperCase() : 'INACTIVE'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="card-title mb-0">
              <i className="ti ti-map-pin me-2 text-primary"></i>
              Address Information
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-12">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-home me-1"></i>
                    Store Address
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.storeAddress || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-map me-1"></i>
                    State
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.stateName || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-building-community me-1"></i>
                    City
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.cityName || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-mailbox me-1"></i>
                    Pincode
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.storePincode || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="card-title mb-0">
              <i className="ti ti-file-description me-2 text-primary"></i>
              Additional Information
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-map-pin-filled me-1"></i>
                    Location Shortcut
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.locationShortcut || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-clipboard-list me-1"></i>
                    Register Type
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.registerType || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-building me-1"></i>
                    Main Store
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.mainstore || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-receipt-tax me-1"></i>
                    Under GST Scheme
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.underGstScheme || '-'}</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-map-pins me-1"></i>
                    Multiple Address Type
                  </label>
                  <p className="mb-0">
                    <span className={`badge ${storeData.multipleAdressType ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'} px-3 py-2`}>
                      {storeData.multipleAdressType ? 'Yes' : 'No'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="col-12">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-file-text me-1"></i>
                    Invoice Terms and Conditions
                  </label>
                  <div className="p-3 bg-light rounded-3 border">
                    <p className="mb-0 text-dark">{storeData.invoiceTermsAndCondition || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="card-title mb-0">
              <i className="ti ti-clock me-2 text-primary"></i>
              System Information
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-calendar-plus me-1"></i>
                    Created Date
                  </label>
                  <p className="fw-semibold mb-0 text-dark">
                    {storeData.logCreatedDate 
                      ? new Date(storeData.logCreatedDate).toLocaleString('en-IN', {
                          dateStyle: 'long',
                          timeStyle: 'short'
                        })
                      : '-'}
                  </p>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-calendar-event me-1"></i>
                    Last Modified Date
                  </label>
                  <p className="fw-semibold mb-0 text-dark">
                    {storeData.logModifiedDate 
                      ? new Date(storeData.logModifiedDate).toLocaleString('en-IN', {
                          dateStyle: 'long',
                          timeStyle: 'short'
                        })
                      : '-'}
                  </p>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="info-item">
                  <label className="form-label text-muted small mb-1">
                    <i className="ti ti-user-check me-1"></i>
                    Created By
                  </label>
                  <p className="fw-semibold mb-0 text-dark">{storeData.createdBy || storeData.vendorName || '-'}</p>
                </div>
              </div>

              {storeData.adminName && (
                <div className="col-lg-6">
                  <div className="info-item">
                    <label className="form-label text-muted small mb-1">
                      <i className="ti ti-user-shield me-1"></i>
                      Admin Name
                    </label>
                    <p className="fw-semibold mb-0 text-dark">{storeData.adminName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


                {/* Store Images Section */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="card-title mb-0">
              <i className="ti ti-photo me-2 text-primary"></i>
              Store Media
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              {/* Store Logo */}
              <div className="col-lg-4 col-md-6">
                <div className="text-center">
                  <div className="mb-3">
                    <span className="badge bg-light text-dark px-3 py-2">
                      <i className="ti ti-photo me-1"></i>
                      Store Logo
                    </span>
                  </div>
                  <div className="border rounded-3 p-3 bg-light position-relative" style={{ minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getImageUrl(storeData.storeLogo) ? (
                      <img
                        src={getImageUrl(storeData.storeLogo)}
                        alt="Store Logo"
                        className="img-fluid rounded-3 shadow-sm"
                        style={{ maxHeight: '220px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`text-muted ${getImageUrl(storeData.storeLogo) ? 'd-none' : 'd-flex'} flex-column align-items-center justify-content-center`} style={{ minHeight: '220px' }}>
                      <i className="ti ti-photo-off mb-3" style={{ fontSize: '48px', opacity: 0.5 }}></i>
                      <p className="mb-0 small">No logo uploaded</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Document */}
              <div className="col-lg-4 col-md-6">
                <div className="text-center">
                  <div className="mb-3">
                    <span className="badge bg-light text-dark px-3 py-2">
                      <i className="ti ti-file-text me-1"></i>
                      Store Document
                    </span>
                  </div>
                  <div className="border rounded-3 p-3 bg-light position-relative" style={{ minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getImageUrl(storeData.storeDocument) ? (
                      <img
                        src={getImageUrl(storeData.storeDocument)}
                        alt="Store Document"
                        className="img-fluid rounded-3 shadow-sm"
                        style={{ maxHeight: '220px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`text-muted ${getImageUrl(storeData.storeDocument) ? 'd-none' : 'd-flex'} flex-column align-items-center justify-content-center`} style={{ minHeight: '220px' }}>
                      <i className="ti ti-file-off mb-3" style={{ fontSize: '48px', opacity: 0.5 }}></i>
                      <p className="mb-0 small">No document uploaded</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Banner */}
              <div className="col-lg-4 col-md-6">
                <div className="text-center">
                  <div className="mb-3">
                    <span className="badge bg-light text-dark px-3 py-2">
                      <i className="ti ti-panorama me-1"></i>
                      Store Banner
                    </span>
                  </div>
                  <div className="border rounded-3 p-3 bg-light position-relative" style={{ minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getImageUrl(storeData.storeBannerImage) ? (
                      <img
                        src={getImageUrl(storeData.storeBannerImage)}
                        alt="Store Banner"
                        className="img-fluid rounded-3 shadow-sm"
                        style={{ maxHeight: '220px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`text-muted ${getImageUrl(storeData.storeBannerImage) ? 'd-none' : 'd-flex'} flex-column align-items-center justify-content-center`} style={{ minHeight: '220px' }}>
                      <i className="ti ti-photo-off mb-3" style={{ fontSize: '48px', opacity: 0.5 }}></i>
                      <p className="mb-0 small">No banner uploaded</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>





        {/* Action Footer */}
        <div className="card shadow-sm border-0 bg-light">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">Need to make changes?</h6>
                <p className="text-muted small mb-0">You can edit store information or go back to the store list.</p>
              </div>
              <div className="d-flex gap-2">
                <Link to={`/edit-store/${id}`} className="btn btn-primary shadow-sm px-4">
                  <i className="ti ti-edit me-2"></i>
                  Edit Store
                </Link>
                <Link to="/store-setting" className="btn btn-outline-secondary px-4">
                  <i className="ti ti-arrow-left me-2"></i>
                  Back to List
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStore;
