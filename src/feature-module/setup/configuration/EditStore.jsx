import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { URLS } from '../../../Urls';

const EditStore = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dropdown data
  const [services, setServices] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    storeName: '',
    email: '',
    serviceId: '',
    storeAddress: '',
    storePincode: '',
    storeGst: '',
    storeStatus: 'active',
    storePhone: '',
    locationShortcut: '',
    state_id: '',
    registerType: '',
    mainstore: '',
    multipleAdressType: false,
    city_id: '',
    underGstScheme: '',
    invoiceTermsAndCondition: '',
    multipleAdress: '[]',
  });

  // File state
  const [files, setFiles] = useState({
    storeLogo: null,
    storeDocument: null,
    storeBannerImage: null,
  });

  // File preview state
  const [filePreviews, setFilePreviews] = useState({
    storeLogo: null,
    storeDocument: null,
    storeBannerImage: null,
  });

  // Existing images from database
  const [existingImages, setExistingImages] = useState({
    storeLogo: null,
    storeDocument: null,
    storeBannerImage: null,
  });

  // Fetch initial data on mount
  useEffect(() => {
    fetchServices();
    fetchStates();
    if (id) {
      fetchStoreById(id);
    }
  }, [id]);

  // Fetch cities when state changes
  useEffect(() => {
    if (formData.state_id) {
      fetchCities(formData.state_id);
    }
  }, [formData.state_id]);

  const fetchStoreById = async (storeId) => {
    setPageLoading(true);
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
        const store = data.data;
        
        // Populate form with existing data
        setFormData({
          storeName: store.storeName || '',
          email: store.email || '',
          serviceId: store.serviceId?.toString() || '',
          storeAddress: store.storeAddress || '',
          storePincode: store.storePincode || '',
          storeGst: store.storeGst || '',
          storeStatus: store.storeStatus || 'active',
          storePhone: store.storePhone || '',
          locationShortcut: store.locationShortcut || '',
          state_id: store.state_id?.toString() || '',
          registerType: store.registerType || '',
          mainstore: store.mainstore || '',
          multipleAdressType: store.multipleAdressType || false,
          city_id: store.city_id?.toString() || '',
          underGstScheme: store.underGstScheme || '',
          invoiceTermsAndCondition: store.invoiceTermsAndCondition || '',
          multipleAdress: store.multipleAdress || '[]',
        });

        // Set existing images
        if (store.storeLogo) {
          const logoUrl = store.storeLogo.startsWith('http') 
            ? store.storeLogo 
            : `${URLS.Base}${store.storeLogo}`;
          setExistingImages(prev => ({ ...prev, storeLogo: logoUrl }));
          setFilePreviews(prev => ({ ...prev, storeLogo: logoUrl }));
        }
        if (store.storeDocument) {
          const docUrl = store.storeDocument.startsWith('http') 
            ? store.storeDocument 
            : `${URLS.Base}${store.storeDocument}`;
          setExistingImages(prev => ({ ...prev, storeDocument: docUrl }));
          setFilePreviews(prev => ({ ...prev, storeDocument: docUrl }));
        }
        if (store.storeBannerImage) {
          const bannerUrl = store.storeBannerImage.startsWith('http') 
            ? store.storeBannerImage 
            : `${URLS.Base}${store.storeBannerImage}`;
          setExistingImages(prev => ({ ...prev, storeBannerImage: bannerUrl }));
          setFilePreviews(prev => ({ ...prev, storeBannerImage: bannerUrl }));
        }
      } else {
        setError(data.message || 'Failed to fetch store details');
      }
    } catch (err) {
      console.error('Error fetching store:', err);
      setError('Network error. Please try again.');
    } finally {
      setPageLoading(false);
    }
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await fetch(URLS.GetService, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Send empty body
      });

      const data = await response.json();
      console.log('Services API Response:', data); // Debug log
      
      // Handle the response - services array is directly in data.services
      if (response.ok && data.success && Array.isArray(data.services)) {
        setServices(data.services);
      } else {
        console.error('Failed to fetch services:', data);
        setServices([]);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchStates = async () => {
    setStatesLoading(true);
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await fetch(URLS.GetCountryByState, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country_id: '5' }), // India default
      });

      const data = await response.json();
      console.log('States API Response:', data); // Debug log
      
      if (response.ok && data.success && Array.isArray(data.states)) {
        setStates(data.states);
      } else {
        console.error('Failed to fetch states:', data);
        setStates([]);
      }
    } catch (err) {
      console.error('Error fetching states:', err);
      setStates([]);
    } finally {
      setStatesLoading(false);
    }
  };

  const fetchCities = async (stateId) => {
    setCitiesLoading(true);
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await fetch(URLS.GetStateByCity, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state_id: stateId }),
      });

      const data = await response.json();
      console.log('Cities API Response:', data); // Debug log
      
      if (response.ok && data.success && Array.isArray(data.cities)) {
        setCities(data.cities);
      } else {
        console.error('Failed to fetch cities:', data);
        setCities([]);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear city selection when state changes
    if (name === 'state_id') {
      setFormData((prev) => ({ ...prev, city_id: '' }));
      setCities([]);
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError(`${name} file size should not exceed 5MB`);
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError(`${name} must be an image file (JPEG, PNG, or GIF)`);
        return;
      }
      
      setFiles((prev) => ({
        ...prev,
        [name]: file,
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => ({
          ...prev,
          [name]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (fieldName) => {
    setFiles((prev) => ({
      ...prev,
      [fieldName]: null,
    }));
    
    // Revert to existing image if available
    if (existingImages[fieldName]) {
      setFilePreviews((prev) => ({
        ...prev,
        [fieldName]: existingImages[fieldName],
      }));
    } else {
      setFilePreviews((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.storeName.trim()) {
      setError('Store name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.serviceId) {
      setError('Please select a service');
      return false;
    }
    
    if (!formData.storePhone.trim()) {
      setError('Store phone is required');
      return false;
    }
    
    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.storePhone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    
    if (!formData.storeAddress.trim()) {
      setError('Store address is required');
      return false;
    }
    
    if (!formData.storePincode.trim()) {
      setError('Store pincode is required');
      return false;
    }
    
    if (!formData.state_id) {
      setError('Please select a state');
      return false;
    }
    
    if (!formData.city_id) {
      setError('Please select a city');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const token = localStorage.getItem('authToken');
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (key === 'multipleAdressType') {
          formDataToSend.append(key, formData[key].toString());
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append files only if new files are selected
      if (files.storeLogo) {
        formDataToSend.append('storeLogo', files.storeLogo);
      }
      if (files.storeDocument) {
        formDataToSend.append('storeDocument', files.storeDocument);
      }
      if (files.storeBannerImage) {
        formDataToSend.append('storeBannerImage', files.storeBannerImage);
      }
      
      const response = await fetch(`${URLS.EditStore}${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Store updated successfully!');
        setTimeout(() => {
          navigate('/store-setting');
        }, 1500);
      } else {
        setError(data.message || 'Failed to update store');
      }
    } catch (err) {
      console.error('Error updating store:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading store details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <h4>Edit Store</h4>
            <h6>Update store information</h6>
          </div>
          <div className="page-btn">
            <Link to="/store-setting" className="btn btn-secondary">
              <i className="ti ti-arrow-left me-1" />
              Back to Store List
            </Link>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="ti ti-alert-circle me-2"></i>
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
            <i className="ti ti-check-circle me-2"></i>
            {success}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccess('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Basic Information</h5>
              
              <div className="row">
                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">
                    Store Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    className="form-control"
                    placeholder="Enter store name"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">
                    Service <span className="text-danger">*</span>
                  </label>
                  <select
                    name="serviceId"
                    className="form-select"
                    value={formData.serviceId}
                    onChange={handleInputChange}
                    disabled={loading || servicesLoading}
                  >
                    <option value="">Select Service</option>
                    {services.length > 0 ? (
                      services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {servicesLoading ? 'Loading services...' : 'No services available'}
                      </option>
                    )}
                  </select>
                  {servicesLoading && (
                    <small className="text-muted">Loading services...</small>
                  )}
                </div>

                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">
                    Store Phone <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    name="storePhone"
                    className="form-control"
                    placeholder="Enter 10-digit phone number"
                    value={formData.storePhone}
                    onChange={handleInputChange}
                    maxLength={10}
                    disabled={loading}
                  />
                </div>

                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">Store GST</label>
                  <input
                    type="text"
                    name="storeGst"
                    className="form-control"
                    placeholder="Enter GST number"
                    value={formData.storeGst}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">
                    Status <span className="text-danger">*</span>
                  </label>
                  <select
                    name="storeStatus"
                    className="form-select"
                    value={formData.storeStatus}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Address Information</h5>
              
              <div className="row">
                <div className="col-lg-12 mb-3">
                  <label className="form-label">
                    Store Address <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="storeAddress"
                    className="form-control"
                    rows="3"
                    placeholder="Enter complete address"
                    value={formData.storeAddress}
                    onChange={handleInputChange}
                    disabled={loading}
                  ></textarea>
                </div>

                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">
                    State <span className="text-danger">*</span>
                  </label>
                  <select
                    name="state_id"
                    className="form-select"
                    value={formData.state_id}
                    onChange={handleInputChange}
                    disabled={loading || statesLoading}
                  >
                    <option value="">Select State</option>
                    {states.length > 0 ? (
                      states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {statesLoading ? 'Loading states...' : 'No states available'}
                      </option>
                    )}
                  </select>
                </div>

                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">
                    City <span className="text-danger">*</span>
                  </label>
                  <select
                    name="city_id"
                    className="form-select"
                    value={formData.city_id}
                    onChange={handleInputChange}
                    disabled={loading || citiesLoading || !formData.state_id}
                  >
                    <option value="">Select City</option>
                    {cities.length > 0 ? (
                      cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {citiesLoading ? 'Loading cities...' : !formData.state_id ? 'Select a state first' : 'No cities available'}
                      </option>
                    )}
                  </select>
                </div>

                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">
                    Pincode <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="storePincode"
                    className="form-control"
                    placeholder="Enter pincode"
                    value={formData.storePincode}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Additional Information</h5>
              
              <div className="row">
                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">Location Shortcut</label>
                  <input
                    type="text"
                    name="locationShortcut"
                    className="form-control"
                    placeholder="Enter location shortcut"
                    value={formData.locationShortcut}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">Register Type</label>
                  <input
                    type="text"
                    name="registerType"
                    className="form-control"
                    placeholder="Enter register type"
                    value={formData.registerType}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">Main Store</label>
                  <input
                    type="text"
                    name="mainstore"
                    className="form-control"
                    placeholder="Enter main store"
                    value={formData.mainstore}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">Under GST Scheme</label>
                  <input
                    type="text"
                    name="underGstScheme"
                    className="form-control"
                    placeholder="Enter GST scheme"
                    value={formData.underGstScheme}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="col-lg-8 col-md-6 mb-3">
                  <label className="form-label">Invoice Terms and Conditions</label>
                  <textarea
                    name="invoiceTermsAndCondition"
                    className="form-control"
                    rows="2"
                    placeholder="Enter invoice terms and conditions"
                    value={formData.invoiceTermsAndCondition}
                    onChange={handleInputChange}
                    disabled={loading}
                  ></textarea>
                </div>

                <div className="col-lg-12 mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="multipleAdressType"
                      id="multipleAdressType"
                      checked={formData.multipleAdressType}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="multipleAdressType">
                      Multiple Address Type
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Store Images</h5>
              
              <div className="row">
                {/* Store Logo */}
                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">Store Logo</label>
                  <div className="mb-2">
                    <input
                      type="file"
                      name="storeLogo"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                    <small className="text-muted">Max size: 5MB (JPEG, PNG, GIF)</small>
                  </div>
                  {filePreviews.storeLogo && (
                    <div className="position-relative d-inline-block">
                      <img
                        src={filePreviews.storeLogo}
                        alt="Store Logo Preview"
                        className="img-thumbnail"
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      {files.storeLogo && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0"
                          onClick={() => removeFile('storeLogo')}
                          disabled={loading}
                        >
                          <i className="ti ti-x" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Store Document */}
                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">Store Document</label>
                  <div className="mb-2">
                    <input
                      type="file"
                      name="storeDocument"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                    <small className="text-muted">Max size: 5MB (JPEG, PNG, GIF)</small>
                  </div>
                  {filePreviews.storeDocument && (
                    <div className="position-relative d-inline-block">
                      <img
                        src={filePreviews.storeDocument}
                        alt="Store Document Preview"
                        className="img-thumbnail"
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      {files.storeDocument && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0"
                          onClick={() => removeFile('storeDocument')}
                          disabled={loading}
                        >
                          <i className="ti ti-x" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Store Banner Image */}
                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">Store Banner</label>
                  <div className="mb-2">
                    <input
                      type="file"
                      name="storeBannerImage"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                    <small className="text-muted">Max size: 5MB (JPEG, PNG, GIF)</small>
                  </div>
                  {filePreviews.storeBannerImage && (
                    <div className="position-relative d-inline-block">
                      <img
                        src={filePreviews.storeBannerImage}
                        alt="Store Banner Preview"
                        className="img-thumbnail"
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      {files.storeBannerImage && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0"
                          onClick={() => removeFile('storeBannerImage')}
                          disabled={loading}
                        >
                          <i className="ti ti-x" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-end gap-3">
                <Link
                  to="/store-setting"
                  className="btn btn-secondary"
                >
                  <i className="ti ti-x me-1" />
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Updating Store...
                    </>
                  ) : (
                    <>
                      <i className="ti ti-check me-1" />
                      Update Store
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStore;
