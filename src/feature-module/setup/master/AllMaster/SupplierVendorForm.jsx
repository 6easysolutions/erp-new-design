import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import { URLS } from '../../../../Urls';

const SupplierVendorForm = ({ isModal = false, onClose, onSuccess, fieldVisibility }) => {
    // Default field visibility settings for supplier
    const defaultFieldVisibility = {
        companyName: true,
        email: true,
        mobileNo: true,
        panNo: true,
        telephoneNo: true,
        remarks: true,
        paymentMode: true,
        paymentTerms: true,
        openingBalance: true,
        tanNo: true,
        whatsappNo: true,
        dateOfBirth: true,
        anniversaryDate: true,
        type: true,
        bankIFSCCode: true,
        bankName: true,
        branchName: true,
        accountNo: true,
        productDetails: true,
        gstType: true,
        gstin: true,
        contactFirstName: true,
        contactLastName: true,
        contactCompanyName: true,
        contactNo: true,
        contactEmail: true,
        addressLine1: true,
        addressLine2: true,
        country: true,
        state: true,
        city: true,
        pincode: true
    };

    // Merge provided fieldVisibility with defaults
    const mergedFieldVisibility = {
        ...defaultFieldVisibility,
        ...fieldVisibility
    };

    const [formData, setFormData] = useState({
        // General Details
        firstName: '',
        lastName: '',
        companyName: '',
        email: '',
        mobileNo: '',
        mobileCountryCode: '+91',
        panNo: '',
        telephoneNo: '',
        telephoneCountryCode: '+91',
        remarks: '',
        paymentMode: '',
        paymentTerms: '',
        debitAmount: '',
        creditAmount: '',
        tanNo: '',
        whatsappNo: '',
        whatsappCountryCode: '+91',
        dateOfBirth: '',
        anniversaryDate: '',
        type: 'Manufacturer',
        
        // Banking Details
        bankIFSCCode: '',
        bankName: '',
        branchName: '',
        accountNo: '',
        
        // Product Details
        productSearch: '',
        selectedProducts: [],

        // Address Details
        addresses: [{
            gstType: 'UnRegistered',
            gstin: '',
            contactFirstName: '',
            contactLastName: '',
            contactCompanyName: '',
            contactNo: '',
            contactCountryCode: '+91',
            contactEmail: '',
            addressLine1: '',
            addressLine2: '',
            country: '',
            state: '',
            city: '',
            pincode: ''
        }]
    });

    const [errors, setErrors] = useState({});
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

    // Fetch Countries on component mount
    useEffect(() => {
        fetchCountries();
    }, []);

    // Fetch Countries
    const fetchCountries = async () => {
        try {
            const response = await axios.post(URLS.GetCountries, {}, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                setCountries(response.data.country || []);
            }
        } catch (error) {
            console.error('Error fetching countries:', error);
            setSubmitStatus({ 
                type: 'error', 
                message: 'Failed to load countries. Please refresh the page.' 
            });
        }
    };

    // Fetch States by Country ID
    const fetchStatesByCountry = async (countryId, addressIndex) => {
        if (!countryId) {
            setStates([]);
            return;
        }

        try {
            const response = await axios.post(URLS.GetStates, {
                country_id: countryId
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                setStates(response.data.states || []);
                
                // Reset state and city for this address
                const newAddresses = [...formData.addresses];
                newAddresses[addressIndex].state = '';
                newAddresses[addressIndex].city = '';
                setFormData(prev => ({
                    ...prev,
                    addresses: newAddresses
                }));
                setCities([]);
            }
        } catch (error) {
            console.error('Error fetching states:', error);
            setSubmitStatus({ 
                type: 'error', 
                message: 'Failed to load states.' 
            });
        }
    };

    // Fetch Cities by State ID
    const fetchCitiesByState = async (stateId, addressIndex) => {
        if (!stateId) {
            setCities([]);
            return;
        }

        try {
            const response = await axios.post(URLS.GetCities, {
                state_id: stateId
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                setCities(response.data.cities || []);
                
                // Reset city for this address
                const newAddresses = [...formData.addresses];
                newAddresses[addressIndex].city = '';
                setFormData(prev => ({
                    ...prev,
                    addresses: newAddresses
                }));
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
            setSubmitStatus({ 
                type: 'error', 
                message: 'Failed to load cities.' 
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleAddressChange = (index, field, value) => {
        const newAddresses = [...formData.addresses];
        newAddresses[index][field] = value;
        setFormData(prev => ({
            ...prev,
            addresses: newAddresses
        }));

        // Handle country change
        if (field === 'country') {
            fetchStatesByCountry(value, index);
        }

        // Handle state change
        if (field === 'state') {
            fetchCitiesByState(value, index);
        }

        // Clear address errors
        if (errors[`address_${index}_${field}`]) {
            setErrors(prev => ({
                ...prev,
                [`address_${index}_${field}`]: ''
            }));
        }
    };

    const addMoreAddress = () => {
        setFormData(prev => ({
            ...prev,
            addresses: [...prev.addresses, {
                gstType: 'UnRegistered',
                gstin: '',
                contactFirstName: '',
                contactLastName: '',
                contactCompanyName: '',
                contactNo: '',
                contactCountryCode: '+91',
                contactEmail: '',
                addressLine1: '',
                addressLine2: '',
                country: '',
                state: '',
                city: '',
                pincode: ''
            }]
        }));
    };

    const removeAddress = (index) => {
        if (formData.addresses.length > 1) {
            const newAddresses = formData.addresses.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                addresses: newAddresses
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.trim().length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.trim().length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }

        // Company name validation
        if (mergedFieldVisibility.companyName && !formData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        }

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Mobile number validation
        if (!formData.mobileNo.trim()) {
            newErrors.mobileNo = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(formData.mobileNo)) {
            newErrors.mobileNo = 'Mobile number must be exactly 10 digits';
        }

        // PAN validation
        if (formData.panNo && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) {
            newErrors.panNo = 'Invalid PAN format (e.g., ABCDE1234F)';
        }

        // Telephone validation
        if (formData.telephoneNo && !/^\d{10,11}$/.test(formData.telephoneNo)) {
            newErrors.telephoneNo = 'Telephone number must be 10-11 digits';
        }

        // WhatsApp validation
        if (formData.whatsappNo && !/^\d{10}$/.test(formData.whatsappNo)) {
            newErrors.whatsappNo = 'WhatsApp number must be exactly 10 digits';
        }

        // Opening Balance validation
        if (formData.debitAmount && isNaN(formData.debitAmount)) {
            newErrors.debitAmount = 'Debit amount must be a number';
        }

        if (formData.creditAmount && isNaN(formData.creditAmount)) {
            newErrors.creditAmount = 'Credit amount must be a number';
        }

        // IFSC Code validation
        if (formData.bankIFSCCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankIFSCCode.toUpperCase())) {
            newErrors.bankIFSCCode = 'Invalid IFSC code format';
        }

        // Account number validation
        if (formData.accountNo && !/^\d{9,18}$/.test(formData.accountNo)) {
            newErrors.accountNo = 'Account number must be 9-18 digits';
        }

        // Address validation
        formData.addresses.forEach((address, index) => {
            // GST validation
            if (address.gstType === 'Registered' && address.gstin) {
                if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(address.gstin.toUpperCase())) {
                    newErrors[`address_${index}_gstin`] = 'Invalid GSTIN format';
                }
            }

            // Contact email validation
            if (address.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.contactEmail)) {
                newErrors[`address_${index}_contactEmail`] = 'Invalid email format';
            }

            // Contact number validation
            if (address.contactNo && !/^\d{10}$/.test(address.contactNo)) {
                newErrors[`address_${index}_contactNo`] = 'Contact number must be exactly 10 digits';
            }

            // Required address fields
            if (!address.country) {
                newErrors[`address_${index}_country`] = 'Country is required';
            }

            if (!address.state) {
                newErrors[`address_${index}_state`] = 'State is required';
            }

            if (!address.city) {
                newErrors[`address_${index}_city`] = 'City is required';
            }

            // Pincode validation
            if (address.pincode && !/^\d{6}$/.test(address.pincode)) {
                newErrors[`address_${index}_pincode`] = 'Pincode must be exactly 6 digits';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setSubmitStatus({ 
                type: 'error', 
                message: 'Please fix all validation errors before submitting.' 
            });
            return;
        }

        setLoading(true);
        setSubmitStatus({ type: '', message: '' });

        try {
            // Get token from localStorage or your auth context
            const token = localStorage.getItem('authToken');

            // Construct the full name
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            // Calculate opening balance
            const debit = parseFloat(formData.debitAmount) || 0;
            const credit = parseFloat(formData.creditAmount) || 0;
            const openingBalance = (credit - debit).toString();

            // Prepare the first address data
            const primaryAddress = formData.addresses[0];
            
            // Construct the API payload matching the exact structure
            const payload = {
                name: fullName,
                companyName: formData.companyName || '',
                email: formData.email || '',
                mobile: formData.mobileNo,
                panNumber: formData.panNo.toUpperCase() || '',
                telephoneNumber: formData.telephoneNo || '',
                remarks: formData.remarks || '',
                paymentMode: formData.paymentMode || 'Cash',
                paymentTerms: formData.paymentTerms || '30 days',
                openingBalance: openingBalance,
                whatsappNumber: formData.whatsappNo || formData.mobileNo,
                dateOfBirth: formData.dateOfBirth || '',
                anniversaryDate: formData.anniversaryDate || '',
                type: formData.type,
                address: {
                    gst: primaryAddress.gstin.toUpperCase() || '',
                    gstIn: formData.panNo.toUpperCase() || primaryAddress.gstin.toUpperCase() || '',
                    contactFirstName: primaryAddress.contactFirstName || formData.firstName,
                    contactLastName: primaryAddress.contactLastName || formData.lastName,
                    contactCompanyName: primaryAddress.contactCompanyName || formData.companyName || '',
                    contactNumber: primaryAddress.contactNo || formData.mobileNo,
                    contactEmail: primaryAddress.contactEmail || formData.email || '',
                    addressLineOne: primaryAddress.addressLine1 || '',
                    addressLineTwo: primaryAddress.addressLine2 || '',
                    countryId: primaryAddress.country || '',
                    stateId: primaryAddress.state || '',
                    cityId: primaryAddress.city || '',
                    pincode: primaryAddress.pincode || ''
                }
            };

            // Make API call
            const response = await axios.post(
                URLS.AddSupplier,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setSubmitStatus({ 
                    type: 'success', 
                    message: response.data.message || 'Supplier added successfully!' 
                });
                
                // Call onSuccess callback and close modal after successful submission
                if (onSuccess) {
                    onSuccess();
                }
                
                // Reset form after successful submission
                setTimeout(() => {
                    resetForm();
                    if (isModal && onClose) {
                        onClose();
                    }
                }, 2000);
            } else {
                setSubmitStatus({ 
                    type: 'error', 
                    message: response.data.message || 'Failed to add supplier.' 
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            
            let errorMessage = 'An error occurred while saving the supplier.';
            
            if (error.response) {
                errorMessage = error.response.data.message || errorMessage;
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection.';
            }
            
            setSubmitStatus({ 
                type: 'error', 
                message: errorMessage 
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            companyName: '',
            email: '',
            mobileNo: '',
            mobileCountryCode: '+91',
            panNo: '',
            telephoneNo: '',
            telephoneCountryCode: '+91',
            remarks: '',
            paymentMode: '',
            paymentTerms: '',
            debitAmount: '',
            creditAmount: '',
            tanNo: '',
            whatsappNo: '',
            whatsappCountryCode: '+91',
            dateOfBirth: '',
            anniversaryDate: '',
            type: 'Manufacturer',
            bankIFSCCode: '',
            bankName: '',
            branchName: '',
            accountNo: '',
            productSearch: '',
            selectedProducts: [],
            addresses: [{
                gstType: 'UnRegistered',
                gstin: '',
                contactFirstName: '',
                contactLastName: '',
                contactCompanyName: '',
                contactNo: '',
                contactCountryCode: '+91',
                contactEmail: '',
                addressLine1: '',
                addressLine2: '',
                country: '',
                state: '',
                city: '',
                pincode: ''
            }]
        });
        setErrors({});
        setSubmitStatus({ type: '', message: '' });
    };

    const labelStyle = {
        fontSize: '13px',
        color: '#495057',
        fontWeight: '500',
        marginBottom: '6px'
    };

    const inputStyle = {
        fontSize: '14px',
        padding: '8px 12px'
    };

    return (
        <div className={isModal ? "p-3" : "container mb-5 "} >
            {/* Header for standalone page mode */}
            {!isModal && (
                <div className="mb-4">
                    <h2 className="mb-2">Add New Supplier</h2>
                    <p className="text-muted">Fill in all the details to create a new supplier</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Status Message */}
                {submitStatus.message && (
                    <div className={`alert ${submitStatus.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
                        <i className={`bi ${submitStatus.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                        {submitStatus.message}
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setSubmitStatus({ type: '', message: '' })}
                            aria-label="Close"
                        ></button>
                    </div>
                )}

                {/* General Details Section */}
                <div className="mb-4">
                    <h6 className="text-primary mb-3 fw-semibold">
                        <i className="bi bi-person-circle me-2"></i>
                        General Details
                    </h6>

                    <div className="row g-3">
                        {/* Name */}
                        <div className="col-md-3">
                            <label className="form-label" style={labelStyle}>
                                Name<span className="text-danger">*</span>
                            </label>
                            <div className="d-flex gap-2">
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                                    placeholder="First Name"
                                    style={inputStyle}
                                    required
                                    disabled={loading}
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                                    placeholder="Last Name"
                                    style={inputStyle}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            {(errors.firstName || errors.lastName) && (
                                <div className="invalid-feedback d-block">
                                    {errors.firstName || errors.lastName}
                                </div>
                            )}
                        </div>

                        {/* Company Name */}
                        {mergedFieldVisibility.companyName && (
                            <div className="col-md-3">
                                <label className="form-label" style={labelStyle}>
                                    Company Name{mergedFieldVisibility.companyName && <span className="text-danger">*</span>}
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className={`form-control ${errors.companyName ? 'is-invalid' : ''}`}
                                    placeholder="Company Name"
                                    style={inputStyle}
                                    disabled={loading}
                                />
                                {errors.companyName && (
                                    <div className="invalid-feedback">{errors.companyName}</div>
                                )}
                            </div>
                        )}

                        {/* Email */}
                        {mergedFieldVisibility.email && (
                            <div className="col-md-3">
                                <label className="form-label" style={labelStyle}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    placeholder="email@example.com"
                                    style={inputStyle}
                                    disabled={loading}
                                />
                                {errors.email && (
                                    <div className="invalid-feedback">{errors.email}</div>
                                )}
                            </div>
                        )}

                        {/* Mobile No */}
                        {mergedFieldVisibility.mobileNo && (
                            <div className="col-md-3">
                                <label className="form-label" style={labelStyle}>
                                    Mobile No.<span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                    <select
                                        name="mobileCountryCode"
                                        value={formData.mobileCountryCode}
                                        onChange={handleChange}
                                        className="form-select"
                                        style={{ ...inputStyle, maxWidth: '100px' }}
                                        disabled={loading}
                                    >
                                        <option value="+91">🇮🇳 +91</option>
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+44">🇬🇧 +44</option>
                                    </select>
                                    <input
                                        type="tel"
                                        name="mobileNo"
                                        value={formData.mobileNo}
                                        onChange={handleChange}
                                        className={`form-control ${errors.mobileNo ? 'is-invalid' : ''}`}
                                        placeholder="Mobile Number"
                                        style={inputStyle}
                                        maxLength="10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                {errors.mobileNo && (
                                    <div className="invalid-feedback d-block">{errors.mobileNo}</div>
                                )}
                            </div>
                        )}

                        {/* PAN No */}
                        {mergedFieldVisibility.panNo && (
                            <div className="col-md-3">
                                <label className="form-label" style={labelStyle}>
                                    PAN No.
                                </label>
                                <input
                                    type="text"
                                    name="panNo"
                                    value={formData.panNo}
                                    onChange={(e) => handleChange({
                                        target: {
                                            name: 'panNo',
                                            value: e.target.value.toUpperCase()
                                        }
                                    })}
                                    className={`form-control ${errors.panNo ? 'is-invalid' : ''}`}
                                    placeholder="ABCDE1234F"
                                    style={inputStyle}
                                    maxLength="10"
                                    disabled={loading}
                                />
                                {errors.panNo && (
                                    <div className="invalid-feedback">{errors.panNo}</div>
                                )}
                            </div>
                        )}

                        {/* Telephone No */}
                        {mergedFieldVisibility.telephoneNo && (
                            <div className="col-md-3">
                                <label className="form-label" style={labelStyle}>
                                    Telephone No.
                                </label>
                                <div className="input-group">
                                    <select
                                        name="telephoneCountryCode"
                                        value={formData.telephoneCountryCode}
                                        onChange={handleChange}
                                        className="form-select"
                                        style={{ ...inputStyle, maxWidth: '100px' }}
                                        disabled={loading}
                                    >
                                        <option value="+91">🇮🇳 +91</option>
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+44">🇬🇧 +44</option>
                                    </select>
                                    <input
                                        type="tel"
                                        name="telephoneNo"
                                        value={formData.telephoneNo}
                                        onChange={handleChange}
                                        className={`form-control ${errors.telephoneNo ? 'is-invalid' : ''}`}
                                        placeholder="Telephone Number"
                                        style={inputStyle}
                                        maxLength="11"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.telephoneNo && (
                                    <div className="invalid-feedback d-block">{errors.telephoneNo}</div>
                                )}
                            </div>
                        )}

                        {/* Remarks */}
                        {mergedFieldVisibility.remarks && (
                            <div className="col-md-3">
                                <label className="form-label" style={labelStyle}>
                                    Remarks
                                </label>
                                <input
                                    type="text"
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Additional notes"
                                    style={inputStyle}
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {/* Payment Mode */}
                        {mergedFieldVisibility.paymentMode && (
                            <div className="col-md-3">
                                <label className="form-label" style={labelStyle}>
                                    Payment Mode
                                </label>
                                <select
                                    name="paymentMode"
                                    value={formData.paymentMode}
                                    onChange={handleChange}
                                    className="form-select"
                                    style={inputStyle}
                                    disabled={loading}
                                >
                                    <option value="">Select Mode</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Credit">Credit</option>
                                    <option value="Debit Card">Debit Card</option>
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Net Banking">Net Banking</option>
                                </select>
                            </div>
                        )}

                        {/* Payment Terms */}
                        {mergedFieldVisibility.paymentTerms && (
                            <div className="col-md-3">
                                <label className="form-label" style={labelStyle}>
                                    Payment Terms
                                </label>
                                <select
                                    name="paymentTerms"
                                    value={formData.paymentTerms}
                                    onChange={handleChange}
                                    className="form-select"
                                    style={inputStyle}
                                    disabled={loading}
                                >
                                    <option value="">Select Terms</option>
                                    <option value="15 days">15 Days</option>
                                    <option value="30 days">30 Days</option>
                                    <option value="45 days">45 Days</option>
                                    <option value="60 days">60 Days</option>
                                    <option value="90 days">90 Days</option>
                                </select>
                            </div>
                        )}

                        {/* Opening Balance */}
                        {mergedFieldVisibility.openingBalance && (
                            <div className="col-md-3">
                                <label className="form-label" style={labelStyle}>
                                    Opening Balance
                                </label>
                                <div className="d-flex gap-2">
                                    <input
                                        type="number"
                                        name="debitAmount"
                                        value={formData.debitAmount}
                                        onChange={handleChange}
                                        className={`form-control ${errors.debitAmount ? 'is-invalid' : ''}`}
                                        placeholder="Debit"
                                        style={inputStyle}
                                        min="0"
                                        step="0.01"
                                        disabled={loading}
                                    />
                                    <input
                                        type="number"
                                        name="creditAmount"
                                        value={formData.creditAmount}
                                        onChange={handleChange}
                                        className={`form-control ${errors.creditAmount ? 'is-invalid' : ''}`}
                                        placeholder="Credit"
                                        style={inputStyle}
                                        min="0"
                                        step="0.01"
                                        disabled={loading}
                                    />
                                </div>
                                {(errors.debitAmount || errors.creditAmount) && (
                                    <div className="invalid-feedback d-block">
                                        {errors.debitAmount || errors.creditAmount}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAN No */}
                        {mergedFieldVisibility.tanNo && (
                            <div className="col-md-3">
                                <label className="form-label" style={labelStyle}>
                                    TAN No.
                                </label>
                                <input
                                    type="text"
                                    name="tanNo"
                                    value={formData.tanNo}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="TAN Number"
                                    style={inputStyle}
                                    maxLength="10"
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {/* WhatsApp No */}
                        {mergedFieldVisibility.whatsappNo && (
                            <div className="col-md-3">
                                <label className="form-label" style={labelStyle}>
                                    WhatsApp No.
                                </label>
                                <div className="input-group">
                                    <select
                                        name="whatsappCountryCode"
                                        value={formData.whatsappCountryCode}
                                        onChange={handleChange}
                                        className="form-select"
                                        style={{ ...inputStyle, maxWidth: '100px' }}
                                        disabled={loading}
                                    >
                                        <option value="+91">🇮🇳 +91</option>
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+44">🇬🇧 +44</option>
                                    </select>
                                    <input
                                        type="tel"
                                        name="whatsappNo"
                                        value={formData.whatsappNo}
                                        onChange={handleChange}
                                        className={`form-control ${errors.whatsappNo ? 'is-invalid' : ''}`}
                                        placeholder="WhatsApp Number"
                                        style={inputStyle}
                                        maxLength="10"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.whatsappNo && (
                                    <div className="invalid-feedback d-block">{errors.whatsappNo}</div>
                                )}
                            </div>
                        )}

                        {/* Date of Birth */}
                        {mergedFieldVisibility.dateOfBirth && (
                            <div className="col-md-3">
                                <label className="form-label" style={labelStyle}>
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={inputStyle}
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {/* Anniversary Date */}
                        {mergedFieldVisibility.anniversaryDate && (
                            <div className="col-md-3">
                                <label className="form-label" style={labelStyle}>
                                    Anniversary Date
                                </label>
                                <input
                                    type="date"
                                    name="anniversaryDate"
                                    value={formData.anniversaryDate}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={inputStyle}
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {/* Type - Radio Buttons */}
                        {mergedFieldVisibility.type && (
                            <div className="col-md-12">
                                <label className="form-label d-block" style={labelStyle}>
                                    Type<span className="text-danger">*</span>
                                </label>
                                <div className="d-flex gap-4 mt-2 flex-wrap">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="type"
                                            id="manufacturer"
                                            value="Manufacturer"
                                            checked={formData.type === 'Manufacturer'}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        <label className="form-check-label" htmlFor="manufacturer">
                                            Manufacturer
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="type"
                                            id="stockiest"
                                            value="Stockiest"
                                            checked={formData.type === 'Stockiest'}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        <label className="form-check-label" htmlFor="stockiest">
                                            Stockiest
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="type"
                                            id="trader"
                                            value="Trader"
                                            checked={formData.type === 'Trader'}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        <label className="form-check-label" htmlFor="trader">
                                            Trader
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="type"
                                            id="retail"
                                            value="Retail"
                                            checked={formData.type === 'Retail'}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        <label className="form-check-label" htmlFor="retail">
                                            Retail
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="type"
                                            id="supplierOther"
                                            value="Other"
                                            checked={formData.type === 'Other'}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        <label className="form-check-label" htmlFor="supplierOther">
                                            Other
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Banking Details Section */}
                {(mergedFieldVisibility.bankIFSCCode || mergedFieldVisibility.bankName || mergedFieldVisibility.branchName || mergedFieldVisibility.accountNo) && (
                    <div className="mb-4">
                        <h6 className="text-primary mb-3 fw-semibold">
                            <i className="bi bi-bank me-2"></i>
                            Banking Details
                        </h6>

                        <div className="row g-3">
                            {/* Bank IFSC Code */}
                            {mergedFieldVisibility.bankIFSCCode && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Bank IFSC Code
                                    </label>
                                    <input
                                        type="text"
                                        name="bankIFSCCode"
                                        value={formData.bankIFSCCode}
                                        onChange={(e) => handleChange({
                                            target: {
                                                name: 'bankIFSCCode',
                                                value: e.target.value.toUpperCase()
                                            }
                                        })}
                                        className={`form-control ${errors.bankIFSCCode ? 'is-invalid' : ''}`}
                                        placeholder="ABCD0123456"
                                        style={inputStyle}
                                        maxLength="11"
                                        disabled={loading}
                                    />
                                    {errors.bankIFSCCode && (
                                        <div className="invalid-feedback">{errors.bankIFSCCode}</div>
                                    )}
                                </div>
                            )}

                            {/* Bank Name */}
                            {mergedFieldVisibility.bankName && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Bank Name
                                    </label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Bank Name"
                                        style={inputStyle}
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            {/* Branch Name */}
                            {mergedFieldVisibility.branchName && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Branch Name
                                    </label>
                                    <input
                                        type="text"
                                        name="branchName"
                                        value={formData.branchName}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Branch Name"
                                        style={inputStyle}
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            {/* Account No */}
                            {mergedFieldVisibility.accountNo && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Account No.
                                    </label>
                                    <input
                                        type="text"
                                        name="accountNo"
                                        value={formData.accountNo}
                                        onChange={handleChange}
                                        className={`form-control ${errors.accountNo ? 'is-invalid' : ''}`}
                                        placeholder="Account Number"
                                        style={inputStyle}
                                        maxLength="18"
                                        disabled={loading}
                                    />
                                    {errors.accountNo && (
                                        <div className="invalid-feedback">{errors.accountNo}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Product Details Section */}
                {mergedFieldVisibility.productDetails && (
                    <div className="mb-4">
                        <h6 className="text-primary mb-3 fw-semibold">
                            <i className="bi bi-box-seam me-2"></i>
                            Product Details
                        </h6>
                        
                        <div className="col-md-12">
                            <input
                                type="text"
                                name="productSearch"
                                value={formData.productSearch}
                                onChange={handleChange}
                                className="form-control mb-3"
                                placeholder="Scan Barcode/Enter Product Name"
                                style={inputStyle}
                                disabled={loading}
                            />
                            
                            {/* Product Table */}
                            <div className="table-responsive bg-light rounded">
                                <table className="table table-hover mb-0">
                                    <thead className="table-secondary">
                                        <tr>
                                            <th className="py-3">Sr. No.</th>
                                            <th className="py-3">Product Name</th>
                                            <th className="py-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.selectedProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-center py-5 text-muted">
                                                    <i className="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                                                    <p className="mb-0">No products added</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            formData.selectedProducts.map((product, index) => (
                                                <tr key={index} className="bg-white">
                                                    <td className="py-3">{index + 1}</td>
                                                    <td className="py-3">{product.name}</td>
                                                    <td className="py-3 text-center">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            disabled={loading}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Address Details Section */}
                <div className="mb-4">
                    <h6 className="text-primary mb-3 fw-semibold">
                        <i className="bi bi-geo-alt me-2"></i>
                        Address Details
                    </h6>

                    {formData.addresses.map((address, index) => (
                        <div key={index} className="mb-4 p-4 bg-light rounded">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="fw-semibold">
                                    <i className="bi bi-pin-map me-2"></i>
                                    Address {index + 1}
                                </span>
                                {formData.addresses.length > 1 && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => removeAddress(index)}
                                        disabled={loading}
                                    >
                                        <i className="bi bi-trash me-1"></i>
                                        Remove
                                    </button>
                                )}
                            </div>

                            <div className="row g-3">
                                {/* GST Type */}
                                {mergedFieldVisibility.gstType && (
                                    <div className="col-md-3">
                                        <label className="form-label" style={labelStyle}>
                                            GST Type
                                        </label>
                                        <select
                                            value={address.gstType}
                                            onChange={(e) => handleAddressChange(index, 'gstType', e.target.value)}
                                            className="form-select"
                                            style={inputStyle}
                                            disabled={loading}
                                        >
                                            <option value="UnRegistered">UnRegistered</option>
                                            <option value="Registered">Registered</option>
                                            <option value="Composition">Composition</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                )}

                                {/* GSTIN */}
                                {mergedFieldVisibility.gstin && (
                                    <div className="col-md-3">
                                        <label className="form-label" style={labelStyle}>
                                            GSTIN
                                        </label>
                                        <input
                                            type="text"
                                            value={address.gstin}
                                            onChange={(e) => handleAddressChange(index, 'gstin', e.target.value.toUpperCase())}
                                            className={`form-control ${errors[`address_${index}_gstin`] ? 'is-invalid' : ''}`}
                                            placeholder="33ABCDE1234F1Z5"
                                            style={inputStyle}
                                            maxLength="15"
                                            disabled={loading}
                                        />
                                        {errors[`address_${index}_gstin`] && (
                                            <div className="invalid-feedback">{errors[`address_${index}_gstin`]}</div>
                                        )}
                                    </div>
                                )}

                                {/* Contact First Name */}
                                {mergedFieldVisibility.contactFirstName && (
                                    <div className="col-md-3">
                                        <label className="form-label" style={labelStyle}>
                                            Contact First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={address.contactFirstName}
                                            onChange={(e) => handleAddressChange(index, 'contactFirstName', e.target.value)}
                                            className="form-control"
                                            placeholder="First Name"
                                            style={inputStyle}
                                            disabled={loading}
                                        />
                                    </div>
                                )}

                                {/* Contact Last Name */}
                                {mergedFieldVisibility.contactLastName && (
                                    <div className="col-md-3">
                                        <label className="form-label" style={labelStyle}>
                                            Contact Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={address.contactLastName}
                                            onChange={(e) => handleAddressChange(index, 'contactLastName', e.target.value)}
                                            className="form-control"
                                            placeholder="Last Name"
                                            style={inputStyle}
                                            disabled={loading}
                                        />
                                    </div>
                                )}

                                {/* Contact Company Name */}
                                {mergedFieldVisibility.contactCompanyName && (
                                    <div className="col-md-3">
                                        <label className="form-label" style={labelStyle}>
                                            Contact Company Name
                                        </label>
                                        <input
                                            type="text"
                                            value={address.contactCompanyName}
                                            onChange={(e) => handleAddressChange(index, 'contactCompanyName', e.target.value)}
                                            className="form-control"
                                            placeholder="Company Name"
                                            style={inputStyle}
                                            disabled={loading}
                                        />
                                    </div>
                                )}

                                {/* Contact No */}
                                {mergedFieldVisibility.contactNo && (
                                    <div className="col-md-3">
                                        <label className="form-label" style={labelStyle}>
                                            Contact No.
                                        </label>
                                        <div className="input-group">
                                            <select
                                                value={address.contactCountryCode}
                                                onChange={(e) => handleAddressChange(index, 'contactCountryCode', e.target.value)}
                                                className="form-select"
                                                style={{ ...inputStyle, maxWidth: '100px' }}
                                                disabled={loading}
                                            >
                                                <option value="+91">🇮🇳 +91</option>
                                                <option value="+1">🇺🇸 +1</option>
                                                <option value="+44">🇬🇧 +44</option>
                                            </select>
                                            <input
                                                type="tel"
                                                value={address.contactNo}
                                                onChange={(e) => handleAddressChange(index, 'contactNo', e.target.value)}
                                                className={`form-control ${errors[`address_${index}_contactNo`] ? 'is-invalid' : ''}`}
                                                placeholder="Contact Number"
                                                style={inputStyle}
                                                maxLength="10"
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors[`address_${index}_contactNo`] && (
                                            <div className="invalid-feedback d-block">{errors[`address_${index}_contactNo`]}</div>
                                        )}
                                    </div>
                                )}

                                {/* Contact Email */}
                                {mergedFieldVisibility.contactEmail && (
                                    <div className="col-md-3">
                                        <label className="form-label" style={labelStyle}>
                                            Contact Email
                                        </label>
                                        <input
                                            type="email"
                                            value={address.contactEmail}
                                            onChange={(e) => handleAddressChange(index, 'contactEmail', e.target.value)}
                                            className={`form-control ${errors[`address_${index}_contactEmail`] ? 'is-invalid' : ''}`}
                                            placeholder="email@example.com"
                                            style={inputStyle}
                                            disabled={loading}
                                        />
                                        {errors[`address_${index}_contactEmail`] && (
                                            <div className="invalid-feedback">{errors[`address_${index}_contactEmail`]}</div>
                                        )}
                                    </div>
                                )}

                                {/* Address Line 1 */}
                                {mergedFieldVisibility.addressLine1 && (
                                    <div className="col-md-3">
                                        <label className="form-label" style={labelStyle}>
                                            Address Line 1
                                        </label>
                                        <input
                                            type="text"
                                            value={address.addressLine1}
                                            onChange={(e) => handleAddressChange(index, 'addressLine1', e.target.value)}
                                            className="form-control"
                                            placeholder="Street Address"
                                            style={inputStyle}
                                            disabled={loading}
                                        />
                                    </div>
                                )}

                                {/* Address Line 2 */}
                                {mergedFieldVisibility.addressLine2 && (
                                    <div className="col-md-3">
                                        <label className="form-label" style={labelStyle}>
                                            Address Line 2
                                        </label>
                                        <input
                                            type="text"
                                            value={address.addressLine2}
                                            onChange={(e) => handleAddressChange(index, 'addressLine2', e.target.value)}
                                            className="form-control"
                                            placeholder="Apartment, Suite, etc."
                                            style={inputStyle}
                                            disabled={loading}
                                        />
                                    </div>
                                )}

                                {/* Select Country */}
                                {mergedFieldVisibility.country && (
                                    <div className="col-md-3">
                                        <label className="form-label" style={labelStyle}>
                                            Select Country<span className="text-danger">*</span>
                                        </label>
                                        <select
                                            value={address.country}
                                            onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                                            className={`form-select ${errors[`address_${index}_country`] ? 'is-invalid' : ''}`}
                                            style={inputStyle}
                                            disabled={loading}
                                        >
                                            <option value="">Select Country</option>
                                            {countries.map((country) => (
                                                <option key={country.id} value={country.id}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors[`address_${index}_country`] && (
                                            <div className="invalid-feedback">{errors[`address_${index}_country`]}</div>
                                        )}
                                    </div>
                                )}

                                {/* Select State */}
                                {mergedFieldVisibility.state && (
                                    <div className="col-md-3">
                                        <label className="form-label" style={labelStyle}>
                                            Select State<span className="text-danger">*</span>
                                        </label>
                                        <select
                                            value={address.state}
                                            onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                                            className={`form-select ${errors[`address_${index}_state`] ? 'is-invalid' : ''}`}
                                            style={inputStyle}
                                            disabled={!address.country || loading}
                                        >
                                            <option value="">Select State</option>
                                            {states.map((state) => (
                                                <option key={state.id} value={state.id}>
                                                    {state.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors[`address_${index}_state`] && (
                                            <div className="invalid-feedback">{errors[`address_${index}_state`]}</div>
                                        )}
                                    </div>
                                )}

                                {/* Select City */}
                                {mergedFieldVisibility.city && (
                                    <div className="col-md-3">
                                        <label className="form-label" style={labelStyle}>
                                            Select City<span className="text-danger">*</span>
                                        </label>
                                        <select
                                            value={address.city}
                                            onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                                            className={`form-select ${errors[`address_${index}_city`] ? 'is-invalid' : ''}`}
                                            style={inputStyle}
                                            disabled={!address.state || loading}
                                        >
                                            <option value="">Select City</option>
                                            {cities.map((city) => (
                                                <option key={city.id} value={city.id}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors[`address_${index}_city`] && (
                                            <div className="invalid-feedback">{errors[`address_${index}_city`]}</div>
                                        )}
                                    </div>
                                )}

                                {/* Pincode */}
                                {mergedFieldVisibility.pincode && (
                                    <div className="col-md-3">
                                        <label className="form-label" style={labelStyle}>
                                            Pincode
                                        </label>
                                        <input
                                            type="text"
                                            value={address.pincode}
                                            onChange={(e) => handleAddressChange(index, 'pincode', e.target.value)}
                                            className={`form-control ${errors[`address_${index}_pincode`] ? 'is-invalid' : ''}`}
                                            placeholder="Postal Code"
                                            style={inputStyle}
                                            maxLength="6"
                                            disabled={loading}
                                        />
                                        {errors[`address_${index}_pincode`] && (
                                            <div className="invalid-feedback">{errors[`address_${index}_pincode`]}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={addMoreAddress}
                        disabled={loading}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add More Address
                    </button>
                </div>

                {/* Submit Buttons */}
                <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                    {isModal && (
                        <button
                            type="button"
                            className="btn btn-outline-secondary px-4"
                            onClick={onClose}
                            disabled={loading}
                        >
                            <i className="bi bi-x-circle me-2"></i>
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-outline-secondary px-4"
                        onClick={resetForm}
                        disabled={loading}
                    >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Reset
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-lg me-2"></i>
                                Save Supplier
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SupplierVendorForm;