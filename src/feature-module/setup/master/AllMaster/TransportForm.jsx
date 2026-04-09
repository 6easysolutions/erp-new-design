import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TransportForm = ({ fieldVisibility }) => {
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
        dateOfBirth: '',
        anniversaryDate: '',
        transporterId: '',

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
            country: 'India',
            state: 'Gujarat',
            city: 'Ahmedabad',
            pincode: ''
        }]
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddressChange = (index, field, value) => {
        const newAddresses = [...formData.addresses];
        newAddresses[index][field] = value;
        setFormData(prev => ({
            ...prev,
            addresses: newAddresses
        }));
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
                country: 'India',
                state: 'Gujarat',
                city: 'Ahmedabad',
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

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.mobileNo.trim()) {
            newErrors.mobileNo = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(formData.mobileNo)) {
            newErrors.mobileNo = 'Mobile number must be 10 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('Transport Data:', formData);
            alert('Transport contact saved successfully!');
        }
    };

    const inputStyle = {
        fontSize: '14px',
        padding: '8px 12px',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        backgroundColor: 'white'
    };

    const labelStyle = {
        fontSize: '13px',
        color: '#495057',
        fontWeight: '500',
        marginBottom: '6px'
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* General Details Section */}
            <div className="mb-4">
                <h6 className="text-primary mb-3" style={{ fontSize: '15px', fontWeight: '600' }}>
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
                            />
                        </div>
                        {errors.firstName && (
                            <div className="text-danger" style={{ fontSize: '12px' }}>
                                {errors.firstName}
                            </div>
                        )}
                    </div>

                    {/* Company Name */}
                    {fieldVisibility.companyName && (
                        <div className="col-md-3">
                            <label className="form-label" style={labelStyle}>
                                Company Name<span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Company Name"
                                style={inputStyle}
                            />
                        </div>
                    )}

                    {/* Email */}
                    {fieldVisibility.email && (
                        <div className="col-md-3">
                            <label className="form-label" style={labelStyle}>
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Email"
                                style={inputStyle}
                            />
                        </div>
                    )}

                    {/* Mobile No */}
                    {fieldVisibility.mobileNo && (
                        <div className="col-md-3">
                            <label className="form-label" style={labelStyle}>
                                Mobile No.
                            </label>
                            <div className="d-flex gap-2">
                                <select
                                    name="mobileCountryCode"
                                    value={formData.mobileCountryCode}
                                    onChange={handleChange}
                                    className="form-select"
                                    style={{ ...inputStyle, maxWidth: '100px' }}
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
                                    placeholder="Mobile No"
                                    style={inputStyle}
                                    required
                                />
                            </div>
                            {errors.mobileNo && (
                                <div className="text-danger" style={{ fontSize: '12px' }}>
                                    {errors.mobileNo}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PAN No */}
                    {fieldVisibility.panNo && (
                        <div className="col-md-3">
                            <label className="form-label" style={labelStyle}>
                                PAN No.
                            </label>
                            <input
                                type="text"
                                name="panNo"
                                value={formData.panNo}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="PAN No."
                                style={inputStyle}
                            />
                        </div>
                    )}

                    {/* Telephone No */}
                    {fieldVisibility.telephoneNo && (
                        <div className="col-md-3">
                            <label className="form-label" style={labelStyle}>
                                Telephone No.
                            </label>
                            <div className="d-flex gap-2">
                                <select
                                    name="telephoneCountryCode"
                                    value={formData.telephoneCountryCode}
                                    onChange={handleChange}
                                    className="form-select"
                                    style={{ ...inputStyle, maxWidth: '100px' }}
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
                                    className="form-control"
                                    placeholder="Telephone No."
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    )}

                    {/* Remarks */}
                    {fieldVisibility.remarks && (
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
                                placeholder="Remarks"
                                style={inputStyle}
                            />
                        </div>
                    )}

                    {/* Payment Mode */}
                    {fieldVisibility.paymentMode && (
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
                            >
                                <option value="">Select Payment Mode</option>
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="upi">UPI</option>
                                <option value="netbanking">Net Banking</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>
                    )}

                    {/* Payment Terms */}
                    {fieldVisibility.paymentTerms && (
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
                            >
                                <option value="">Select Payment Term</option>
                                <option value="immediate">Immediate</option>
                                <option value="15 Days">15 Days</option>
                                <option value="30 Days">30 Days</option>
                                <option value="45 Days">45 Days</option>
                                <option value="60 Days">60 Days</option>
                            </select>
                        </div>
                    )}

                    {/* Opening Balance */}
                    {fieldVisibility.openingBalance && (
                        <div className="col-md-3">
                            <label className="form-label" style={labelStyle}>
                                Opening Balance
                            </label>
                            <div className="d-flex gap-2">
                                <input
                                    type="text"
                                    name="debitAmount"
                                    value={formData.debitAmount}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Debit Amount"
                                    style={inputStyle}
                                />
                                <input
                                    type="text"
                                    name="creditAmount"
                                    value={formData.creditAmount}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Credit Amount"
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    )}

                    {/* Date of Birth */}
                    {fieldVisibility.dateOfBirth && (
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
                            />
                        </div>
                    )}

                    {/* Anniversary Date */}
                    {fieldVisibility.anniversaryDate && (
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
                            />
                        </div>
                    )}

                    {/* Transporter Id */}
                    {fieldVisibility.transporterId && (
                        <div className="col-md-3">
                            <label className="form-label" style={labelStyle}>
                                Transporter Id
                            </label>
                            <input
                                type="text"
                                name="transporterId"
                                value={formData.transporterId}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Transporter Id"
                                style={inputStyle}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Address Details Section */}
            <div className="mb-4">
                <h6 className="text-primary mb-3" style={{ fontSize: '15px', fontWeight: '600' }}>
                    Address Details
                </h6>

                {formData.addresses.map((address, index) => (
                    <div key={index} className="mb-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#495057' }}>
                                Address {index + 1}
                            </span>
                            {formData.addresses.length > 1 && (
                                <button
                                    type="button"
                                    className="btn btn-sm"
                                    onClick={() => removeAddress(index)}
                                    style={{
                                        backgroundColor: '#ffebee',
                                        color: '#dc3545',
                                        border: 'none',
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            )}
                        </div>

                        <div className="row g-3">
                            {/* GST Type */}
                            {fieldVisibility.gstType && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        GST Type
                                    </label>
                                    <select
                                        value={address.gstType}
                                        onChange={(e) => handleAddressChange(index, 'gstType', e.target.value)}
                                        className="form-select"
                                        style={inputStyle}
                                    >
                                        <option value="UnRegistered">UnRegistered</option>
                                        <option value="Registered">Registered</option>
                                        <option value="Composition">Composition</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            )}

                            {/* GSTIN */}
                            {fieldVisibility.gstin && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        GSTIN<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={address.gstin}
                                        onChange={(e) => handleAddressChange(index, 'gstin', e.target.value)}
                                        className="form-control"
                                        placeholder="GSTIN"
                                        style={inputStyle}
                                    />
                                </div>
                            )}

                            {/* Contact First Name */}
                            {fieldVisibility.contactFirstName && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Contact First Name<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={address.contactFirstName}
                                        onChange={(e) => handleAddressChange(index, 'contactFirstName', e.target.value)}
                                        className="form-control"
                                        placeholder="Contact First Name"
                                        style={inputStyle}
                                    />
                                </div>
                            )}

                            {/* Contact Last Name */}
                            {fieldVisibility.contactLastName && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Contact Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={address.contactLastName}
                                        onChange={(e) => handleAddressChange(index, 'contactLastName', e.target.value)}
                                        className="form-control"
                                        placeholder="Contact Last Name"
                                        style={inputStyle}
                                    />
                                </div>
                            )}

                            {/* Contact Company Name */}
                            {fieldVisibility.contactCompanyName && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Contact Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={address.contactCompanyName}
                                        onChange={(e) => handleAddressChange(index, 'contactCompanyName', e.target.value)}
                                        className="form-control"
                                        placeholder="Contact Company Name"
                                        style={inputStyle}
                                    />
                                </div>
                            )}

                            {/* Contact No */}
                            {fieldVisibility.contactNo && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Contact No.
                                    </label>
                                    <div className="d-flex gap-2">
                                        <select
                                            value={address.contactCountryCode}
                                            onChange={(e) => handleAddressChange(index, 'contactCountryCode', e.target.value)}
                                            className="form-select"
                                            style={{ ...inputStyle, maxWidth: '100px' }}
                                        >
                                            <option value="+91">🇮🇳 +91</option>
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+44">🇬🇧 +44</option>
                                        </select>
                                        <input
                                            type="tel"
                                            value={address.contactNo}
                                            onChange={(e) => handleAddressChange(index, 'contactNo', e.target.value)}
                                            className="form-control"
                                            placeholder="Contact Number"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Contact Email */}
                            {fieldVisibility.contactEmail && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        value={address.contactEmail}
                                        onChange={(e) => handleAddressChange(index, 'contactEmail', e.target.value)}
                                        className="form-control"
                                        placeholder="Contact Email"
                                        style={inputStyle}
                                    />
                                </div>
                            )}

                            {/* Address Line 1 */}
                            {fieldVisibility.addressLine1 && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Address Line 1
                                    </label>
                                    <input
                                        type="text"
                                        value={address.addressLine1}
                                        onChange={(e) => handleAddressChange(index, 'addressLine1', e.target.value)}
                                        className="form-control"
                                        placeholder="Address Line 1"
                                        style={inputStyle}
                                    />
                                </div>
                            )}

                            {/* Address Line 2 */}
                            {fieldVisibility.addressLine2 && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Address Line 2
                                    </label>
                                    <input
                                        type="text"
                                        value={address.addressLine2}
                                        onChange={(e) => handleAddressChange(index, 'addressLine2', e.target.value)}
                                        className="form-control"
                                        placeholder="Address Line 2"
                                        style={inputStyle}
                                    />
                                </div>
                            )}

                            {/* Select Country */}
                            {fieldVisibility.country && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Select Country<span className="text-danger">*</span>
                                    </label>
                                    <select
                                        value={address.country}
                                        onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                                        className="form-select"
                                        style={inputStyle}
                                    >
                                        <option value="India">India</option>
                                        <option value="USA">USA</option>
                                        <option value="UK">UK</option>
                                        <option value="Australia">Australia</option>
                                    </select>
                                </div>
                            )}

                            {/* Select State */}
                            {fieldVisibility.state && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Select State<span className="text-danger">*</span>
                                    </label>
                                    <select
                                        value={address.state}
                                        onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                                        className="form-select"
                                        style={inputStyle}
                                    >
                                        <option value="Gujarat">Gujarat</option>
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Delhi">Delhi</option>
                                        <option value="Karnataka">Karnataka</option>
                                        <option value="Tamil Nadu">Tamil Nadu</option>
                                    </select>
                                </div>
                            )}

                            {/* Select City */}
                            {fieldVisibility.city && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Select City<span className="text-danger">*</span>
                                    </label>
                                    <select
                                        value={address.city}
                                        onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                                        className="form-select"
                                        style={inputStyle}
                                    >
                                        <option value="Ahmedabad">Ahmedabad</option>
                                        <option value="Surat">Surat</option>
                                        <option value="Vadodara">Vadodara</option>
                                        <option value="Rajkot">Rajkot</option>
                                    </select>
                                </div>
                            )}

                            {/* Pincode */}
                            {fieldVisibility.pincode && (
                                <div className="col-md-3">
                                    <label className="form-label" style={labelStyle}>
                                        Pincode
                                    </label>
                                    <input
                                        type="text"
                                        value={address.pincode}
                                        onChange={(e) => handleAddressChange(index, 'pincode', e.target.value)}
                                        className="form-control"
                                        placeholder="ZIP/Postal code"
                                        style={inputStyle}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    className="btn d-flex align-items-center gap-2"
                    onClick={addMoreAddress}
                    style={{
                        backgroundColor: 'transparent',
                        color: '#4a90e2',
                        border: '1px dashed #4a90e2',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '500',
                        borderRadius: '4px'
                    }}
                >
                    <i className="bi bi-plus-circle"></i>
                    Add More Address
                </button>
            </div>

            {/* Submit Buttons */}
            <div className="d-flex justify-content-end gap-3">
                <button
                    type="button"
                    className="btn"
                    style={{
                        backgroundColor: 'white',
                        color: '#6c757d',
                        border: '1px solid #dee2e6',
                        padding: '10px 30px',
                        fontSize: '14px',
                        fontWeight: '500',
                        borderRadius: '6px'
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn"
                    style={{
                        backgroundColor: '#4a90e2',
                        color: 'white',
                        border: 'none',
                        padding: '10px 30px',
                        fontSize: '14px',
                        fontWeight: '500',
                        borderRadius: '6px'
                    }}
                >
                    <i className="bi bi-check-lg me-2"></i>
                    Save Contact
                </button>
            </div>
        </form>
    );
};

export default TransportForm;
