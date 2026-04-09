import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const FieldSettings = ({ activeTab, fieldVisibility, onFieldChange, onClose }) => {
    const fieldLabels = {
        customer: {
            companyName: 'Company Name',
            email: 'Email',
            mobileNo: 'Mobile No.',
            panNo: 'PAN No.',
            telephoneNo: 'Telephone No.',
            remarks: 'Remarks',
            paymentMode: 'Payment Mode',
            paymentTerms: 'Payment Terms',
            openingBalance: 'Opening Balance',
            whatsappNo: 'WhatsApp No.',
            dateOfBirth: 'Date of Birth',
            anniversaryDate: 'Anniversary Date',
            customerCategory: 'Customer Category',
            type: 'Type',
            gstType: 'GST Type',
            gstin: 'GSTIN',
            contactFirstName: 'Contact First Name',
            contactLastName: 'Contact Last Name',
            contactCompanyName: 'Contact Company Name',
            contactNo: 'Contact No.',
            contactEmail: 'Contact Email',
            addressLine1: 'Address Line 1',
            addressLine2: 'Address Line 2',
            country: 'Country',
            state: 'State',
            city: 'City',
            pincode: 'Pincode'
        },
        supplier: {
            companyName: 'Company Name',
            email: 'Email',
            mobileNo: 'Mobile No.',
            panNo: 'PAN No.',
            telephoneNo: 'Telephone No.',
            remarks: 'Remarks',
            paymentMode: 'Payment Mode',
            paymentTerms: 'Payment Terms',
            openingBalance: 'Opening Balance',
            whatsappNo: 'WhatsApp No.',
            dateOfBirth: 'Date of Birth',
            anniversaryDate: 'Anniversary Date',
            supplierCategory: 'Supplier Category',
            type: 'Type',
            gstType: 'GST Type',
            gstin: 'GSTIN',
            contactFirstName: 'Contact First Name',
            contactLastName: 'Contact Last Name',
            contactCompanyName: 'Contact Company Name',
            contactNo: 'Contact No.',
            contactEmail: 'Contact Email',
            addressLine1: 'Address Line 1',
            addressLine2: 'Address Line 2',
            country: 'Country',
            state: 'State',
            city: 'City',
            pincode: 'Pincode'
        },
        transport: {
            companyName: 'Company Name',
            email: 'Email',
            mobileNo: 'Mobile No.',
            panNo: 'PAN No.',
            telephoneNo: 'Telephone No.',
            remarks: 'Remarks',
            paymentMode: 'Payment Mode',
            paymentTerms: 'Payment Terms',
            openingBalance: 'Opening Balance',
            whatsappNo: 'WhatsApp No.',
            dateOfBirth: 'Date of Birth',
            anniversaryDate: 'Anniversary Date',
            transportCategory: 'Transport Category',
            vehicleNo: 'Vehicle No.',
            licenseNo: 'License No.',
            gstType: 'GST Type',
            gstin: 'GSTIN',
            contactFirstName: 'Contact First Name',
            contactLastName: 'Contact Last Name',
            contactCompanyName: 'Contact Company Name',
            contactNo: 'Contact No.',
            contactEmail: 'Contact Email',
            addressLine1: 'Address Line 1',
            addressLine2: 'Address Line 2',
            country: 'Country',
            state: 'State',
            city: 'City',
            pincode: 'Pincode'
        }
    };

    const currentFields = fieldLabels[activeTab] || {};

    return (
        <>
            {/* Overlay */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1040
                }}
                onClick={onClose}
            />

            {/* Settings Dropdown */}
            <div
                className="card border-0 position-absolute"
                style={{
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '320px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1050,
                    borderRadius: '8px'
                }}
            >
                <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                        <h6 className="mb-0" style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                            Field Visibility Settings
                        </h6>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            style={{ fontSize: '12px' }}
                        />
                    </div>

                    <div className="mb-2">
                        <small className="text-muted" style={{ fontSize: '12px' }}>
                            Select fields to display in the form
                        </small>
                    </div>

                    {/* Field List */}
                    <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                        {Object.entries(currentFields).map(([key, label]) => (
                            <div
                                key={key}
                                className="form-check py-2 px-2 mb-1"
                                style={{
                                    borderRadius: '4px',
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`field-${key}`}
                                    checked={fieldVisibility[key] || false}
                                    onChange={() => onFieldChange(key)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <label
                                    className="form-check-label ms-2"
                                    htmlFor={`field-${key}`}
                                    style={{
                                        fontSize: '13px',
                                        color: '#495057',
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                    }}
                                >
                                    {label}
                                </label>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 mt-3 pt-3 border-top">
                        <button
                            type="button"
                            className="btn btn-sm flex-fill"
                            onClick={() => {
                                Object.keys(currentFields).forEach(field => {
                                    if (!fieldVisibility[field]) {
                                        onFieldChange(field);
                                    }
                                });
                            }}
                            style={{
                                backgroundColor: '#e3f2fd',
                                color: '#4a90e2',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}
                        >
                            Select All
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm flex-fill"
                            onClick={() => {
                                Object.keys(currentFields).forEach(field => {
                                    if (fieldVisibility[field]) {
                                        onFieldChange(field);
                                    }
                                });
                            }}
                            style={{
                                backgroundColor: '#ffebee',
                                color: '#dc3545',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FieldSettings;
