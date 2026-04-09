import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import { URLS } from '../../../../Urls';

const CustomerForm = ({ isModal = false, onClose, onSuccess, fieldVisibility }) => {

    const defaultFieldVisibility = {
        companyName: true, email: true, mobileNo: true, panNo: true,
        telephoneNo: true, remarks: true, paymentMode: true, paymentTerms: true,
        openingBalance: true, whatsappNo: true, dateOfBirth: true,
        anniversaryDate: true, customerCategory: true, type: true,
        gstType: true, gstin: true, contactFirstName: true, contactLastName: true,
        contactCompanyName: true, contactNo: true, contactEmail: true,
        addressLine1: true, addressLine2: true, country: true,
        state: true, city: true, pincode: true,
    };
    const fv = { ...defaultFieldVisibility, ...fieldVisibility };

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', companyName: '', email: '', emailCode: '',
        mobileNo: '', mobileCountryCode: '+91', panNo: '',
        telephoneNo: '', telephoneCountryCode: '+91', remarks: '',
        paymentMode: '', paymentTerms: '30 Days', debitAmount: '', creditAmount: '',
        whatsappNo: '', whatsappCountryCode: '+91', dateOfBirth: '',
        anniversaryDate: '', customerCategory: '', type: 'Wholesaler',
        addresses: [{
            gstType: 'Other', gstin: '', contactFirstName: '', contactLastName: '',
            contactCompanyName: '', contactNo: '', contactCountryCode: '+91',
            contactEmail: '', addressLine1: '', addressLine2: '',
            country: '', state: '', city: '', pincode: '',
        }],
    });

    const [errors, setErrors]             = useState({});
    const [countries, setCountries]       = useState([]);
    const [states, setStates]             = useState([]);
    const [cities, setCities]             = useState([]);
    const [loading, setLoading]           = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

    useEffect(() => { fetchCountries(); }, []);

    const fetchCountries = async () => {
        try {
            const res = await axios.post(URLS.GetCountries, {}, { headers: { 'Content-Type': 'application/json' } });
            if (res.data.success) setCountries(res.data.country || []);
        } catch {
            setSubmitStatus({ type: 'error', message: 'Failed to load countries.' });
        }
    };

    const fetchStatesByCountry = async (countryId, idx) => {
        if (!countryId) { setStates([]); return; }
        try {
            const res = await axios.post(URLS.GetStates, { country_id: countryId }, { headers: { 'Content-Type': 'application/json' } });
            if (res.data.success) {
                setStates(res.data.states || []);
                const a = [...formData.addresses];
                a[idx].state = ''; a[idx].city = '';
                setFormData(p => ({ ...p, addresses: a }));
                setCities([]);
            }
        } catch { setSubmitStatus({ type: 'error', message: 'Failed to load states.' }); }
    };

    const fetchCitiesByState = async (stateId, idx) => {
        if (!stateId) { setCities([]); return; }
        try {
            const res = await axios.post(URLS.GetCities, { state_id: stateId }, { headers: { 'Content-Type': 'application/json' } });
            if (res.data.success) {
                setCities(res.data.cities || []);
                const a = [...formData.addresses];
                a[idx].city = '';
                setFormData(p => ({ ...p, addresses: a }));
            }
        } catch { setSubmitStatus({ type: 'error', message: 'Failed to load cities.' }); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    };

    const handleAddressChange = (index, field, value) => {
        const a = [...formData.addresses];
        a[index][field] = value;
        setFormData(p => ({ ...p, addresses: a }));
        if (field === 'country') fetchStatesByCountry(value, index);
        if (field === 'state')   fetchCitiesByState(value, index);
        if (errors[`address_${index}_${field}`])
            setErrors(p => ({ ...p, [`address_${index}_${field}`]: '' }));
    };

    const addMoreAddress = () => {
        setFormData(p => ({
            ...p,
            addresses: [...p.addresses, {
                gstType: 'Other', gstin: '', contactFirstName: '', contactLastName: '',
                contactCompanyName: '', contactNo: '', contactCountryCode: '+91',
                contactEmail: '', addressLine1: '', addressLine2: '',
                country: '', state: '', city: '', pincode: '',
            }],
        }));
    };

    const removeAddress = (index) => {
        if (formData.addresses.length > 1)
            setFormData(p => ({ ...p, addresses: p.addresses.filter((_, i) => i !== index) }));
    };

    const validateForm = () => {
        const e = {};
        if (!formData.firstName.trim())               e.firstName   = 'Required';
        else if (formData.firstName.trim().length < 2) e.firstName  = 'Min 2 chars';
        if (!formData.lastName.trim())                 e.lastName   = 'Required';
        else if (formData.lastName.trim().length < 2)  e.lastName   = 'Min 2 chars';
        if (fv.companyName && !formData.companyName.trim()) e.companyName = 'Required';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email';
        if (!formData.mobileNo.trim())                 e.mobileNo   = 'Required';
        else if (!/^\d{10}$/.test(formData.mobileNo)) e.mobileNo   = 'Must be 10 digits';
        if (formData.panNo && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.panNo.toUpperCase())) e.panNo = 'Invalid PAN';
        if (formData.telephoneNo && !/^\d{10,11}$/.test(formData.telephoneNo)) e.telephoneNo = '10-11 digits';
        if (formData.whatsappNo && !/^\d{10}$/.test(formData.whatsappNo)) e.whatsappNo = 'Must be 10 digits';
        if (formData.debitAmount  && isNaN(formData.debitAmount))  e.debitAmount  = 'Must be a number';
        if (formData.creditAmount && isNaN(formData.creditAmount)) e.creditAmount = 'Must be a number';
        if (fv.customerCategory && !formData.customerCategory) e.customerCategory = 'Required';
        formData.addresses.forEach((addr, i) => {
            if (addr.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.contactEmail))
                e[`address_${i}_contactEmail`] = 'Invalid email';
            if (addr.contactNo && !/^\d{10}$/.test(addr.contactNo))
                e[`address_${i}_contactNo`]    = 'Must be 10 digits';
            if (!addr.country) e[`address_${i}_country`] = 'Required';
            if (!addr.state)   e[`address_${i}_state`]   = 'Required';
            if (!addr.city)    e[`address_${i}_city`]    = 'Required';
            if (addr.pincode && !/^\d{6}$/.test(addr.pincode))
                e[`address_${i}_pincode`]      = 'Must be 6 digits';
        });
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validateForm()) {
            setSubmitStatus({ type: 'error', message: 'Please fix all validation errors.' });
            return;
        }
        setLoading(true);
        setSubmitStatus({ type: '', message: '' });
        try {
            const token    = localStorage.getItem('authToken');
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();
            const debit    = parseFloat(formData.debitAmount)  || 0;
            const credit   = parseFloat(formData.creditAmount) || 0;
            const pa       = formData.addresses[0];
            const payload  = {
                name: fullName, companyName: formData.companyName || '',
                email: formData.email || '', mobile: formData.mobileNo,
                panNumber: formData.panNo.toUpperCase() || '',
                telephoneNumber: formData.telephoneNo || '',
                remarks: formData.remarks || '',
                paymentMode: formData.paymentMode || 'Cash',
                paymentTerms: formData.paymentTerms || '30 days',
                openingBalance: (credit - debit).toString(),
                whatsappNumber: formData.whatsappNo || formData.mobileNo,
                dateOfBirth: formData.dateOfBirth || '',
                anniversaryDate: formData.anniversaryDate || '',
                customerCategory: formData.customerCategory || 'Standard',
                type: formData.type,
                address: {
                    gst: pa.gstin.toUpperCase() || '',
                    gstIn: formData.panNo.toUpperCase() || '',
                    contactFirstName:   pa.contactFirstName   || formData.firstName,
                    contactLastName:    pa.contactLastName    || formData.lastName,
                    contactCompanyName: pa.contactCompanyName || formData.companyName || '',
                    contactNumber:      pa.contactNo          || formData.mobileNo,
                    contactEmail:       pa.contactEmail       || formData.email || '',
                    addressLineOne: pa.addressLine1 || '', addressLineTwo: pa.addressLine2 || '',
                    countryId: pa.country || '', stateId: pa.state || '',
                    cityId: pa.city || '', pincode: pa.pincode || '',
                },
            };
            const response = await axios.post(URLS.AddCustomer, payload, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                setSubmitStatus({ type: 'success', message: response.data.message || 'Customer added!' });
                if (onSuccess) onSuccess();
                setTimeout(() => { resetForm(); if (isModal && onClose) onClose(); }, 2000);
            } else {
                setSubmitStatus({ type: 'error', message: response.data.message || 'Failed to add.' });
            }
        } catch (error) {
            let msg = 'An error occurred.';
            if (error.response)     msg = error.response.data.message || msg;
            else if (error.request) msg = 'Network error. Check your connection.';
            setSubmitStatus({ type: 'error', message: msg });
        } finally { setLoading(false); }
    };

    const resetForm = () => {
        setFormData({
            firstName: '', lastName: '', companyName: '', email: '', emailCode: '',
            mobileNo: '', mobileCountryCode: '+91', panNo: '',
            telephoneNo: '', telephoneCountryCode: '+91', remarks: '',
            paymentMode: '', paymentTerms: '30 Days', debitAmount: '', creditAmount: '',
            whatsappNo: '', whatsappCountryCode: '+91', dateOfBirth: '',
            anniversaryDate: '', customerCategory: '', type: 'Wholesaler',
            addresses: [{
                gstType: 'Other', gstin: '', contactFirstName: '', contactLastName: '',
                contactCompanyName: '', contactNo: '', contactCountryCode: '+91',
                contactEmail: '', addressLine1: '', addressLine2: '',
                country: '', state: '', city: '', pincode: '',
            }],
        });
        setErrors({});
        setSubmitStatus({ type: '', message: '' });
    };

    /* ─── small helpers ─── */
    const Label = ({ children }) => (
        <span className="cf-label">{children}</span>
    );
    const FieldGroup = ({ children, style }) => (
        <div className="cf-field-group" style={style}>{children}</div>
    );
    const ErrMsg = ({ msg }) => msg ? <small className="cf-err">{msg}</small> : null;

    return (
        <>
        <style>{`
            /* ══════════════════════════════════════════════════════
               CustomerForm — prefix: cf-
               Mirrors AddProduct pms-* design 1:1
            ══════════════════════════════════════════════════════ */

            /* ── Section card (= pms-section-card) ── */
            .cf-section {
                background: rgba(255,255,255,0.25);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 20px;
                padding: 20px;
                margin-bottom: 20px;
            }

            /* ── Section title (= pms-section-title) ── */
            .cf-section-title {
                color: #1e293b;
                font-size: 15px;
                font-weight: 600;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            /* ── Header icon (= pms-header-icon) ── */
            .cf-icon {
                width: 32px; height: 32px;
                border-radius: 10px;
                display: flex; align-items: center; justify-content: center;
                font-size: 15px; flex-shrink: 0;
            }
            .cf-icon-blue  { background: rgba(59,130,246,0.1); color: #3b82f6; }
            .cf-icon-green { background: rgba(16,185,129,0.1); color: #10b981; }
            .cf-icon-amber { background: rgba(234,179,8,0.1);  color: #eab308; }

            /* ── Label (= pms-field-label) ── */
            .cf-label {
                color: #475569;
                font-size: 12px;
                font-weight: 500;
                margin-bottom: 4px;
                display: block;
            }
            .cf-label-required::after {
                content: ' *';
                color: #ef4444;
            }

            /* ── Field group container (= pms-field-group) ── */
            .cf-field-group {
                background: rgba(255,255,255,0.2);
                backdrop-filter: blur(15px);
                border: 1px solid rgba(255,255,255,0.25);
                border-radius: 12px;
                padding: 8px 12px;
                margin-bottom: 8px;
                transition: border-color 0.2s;
            }
            .cf-field-group:focus-within {
                border-color: rgba(59,130,246,0.4);
                background: rgba(255,255,255,0.3);
            }
            .cf-field-group.cf-err-border {
                border-color: rgba(239,68,68,0.4) !important;
            }

            /* ── Input / Select (= pms-field-input / pms-field-select) ── */
            .cf-input,
            .cf-select {
                background: transparent !important;
                border: none !important;
                color: #000 !important;
                font-size: 13px !important;
                font-weight: 500 !important;
                width: 100% !important;
                padding: 2px 0 !important;
                outline: none !important;
                box-shadow: none !important;
            }
            .cf-input::placeholder { color: #94a3b8; }
            .cf-select option { background: #1e293b; color: white; }

            /* ── Input group (phone + code) ── */
            .cf-input-group {
                display: flex; gap: 6px; align-items: center;
            }
            .cf-code-select {
                background: transparent !important;
                border: none !important;
                color: #475569 !important;
                font-size: 12px !important;
                font-weight: 500 !important;
                outline: none !important;
                width: auto !important;
                flex-shrink: 0;
                padding: 2px 0 !important;
            }
            .cf-divider {
                width: 1px; height: 18px;
                background: rgba(255,255,255,0.4);
                flex-shrink: 0;
            }

            /* ── Error text ── */
            .cf-err {
                color: #ef4444;
                font-size: 11px;
                font-weight: 500;
                display: block;
                margin-top: 2px;
                margin-bottom: 4px;
            }

            /* ── Status alert ── */
            .cf-status {
                display: flex; align-items: center; gap: 10px;
                padding: 12px 18px; border-radius: 14px;
                font-size: 13px; font-weight: 500; margin-bottom: 20px;
                backdrop-filter: blur(12px);
            }
            .cf-status-success {
                background: rgba(16,185,129,0.15);
                color: #059669;
                border: 1px solid rgba(16,185,129,0.25);
            }
            .cf-status-error {
                background: rgba(239,68,68,0.12);
                color: #dc2626;
                border: 1px solid rgba(239,68,68,0.22);
            }
            .cf-status-close {
                margin-left: auto; background: none;
                border: none; cursor: pointer;
                color: inherit; font-size: 16px; line-height: 1;
            }

            /* ── Radio pills (customer type) ── */
            .cf-radio-row { display: flex; flex-wrap: wrap; gap: 8px; }
            .cf-radio-pill {
                display: flex; align-items: center; gap: 6px;
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 20px;
                padding: 6px 14px;
                cursor: pointer;
                font-size: 13px; font-weight: 500; color: #475569;
                transition: all 0.2s;
                user-select: none;
            }
            .cf-radio-pill input[type="radio"] { display: none; }
            .cf-radio-pill:has(input:checked) {
                background: rgba(59,130,246,0.15);
                border-color: rgba(59,130,246,0.4);
                color: #2563eb;
            }
            .cf-radio-dot {
                width: 8px; height: 8px; border-radius: 50%;
                border: 2px solid currentColor; display: inline-block;
                flex-shrink: 0;
            }
            .cf-radio-pill:has(input:checked) .cf-radio-dot {
                background: #3b82f6;
            }

            /* ── Address block ── */
            .cf-addr-block {
                background: rgba(255,255,255,0.15);
                border: 1px solid rgba(255,255,255,0.25);
                border-radius: 14px;
                padding: 16px 18px;
                margin-bottom: 14px;
            }
            .cf-addr-header {
                display: flex; justify-content: space-between;
                align-items: center; margin-bottom: 14px;
            }
            .cf-addr-title {
                font-size: 12px; font-weight: 700;
                color: #3b82f6; text-transform: uppercase;
                letter-spacing: 0.05em;
                display: flex; align-items: center; gap: 6px;
            }
            .cf-addr-num {
                width: 20px; height: 20px; border-radius: 50%;
                background: #3b82f6; color: white;
                font-size: 10px; font-weight: 700;
                display: inline-flex; align-items: center; justify-content: center;
            }

            /* ── Add address / remove buttons ── */
            .cf-add-addr-btn {
                display: inline-flex; align-items: center; gap: 7px;
                background: rgba(255,255,255,0.2);
                border: 1px dashed rgba(59,130,246,0.4);
                border-radius: 10px;
                color: #3b82f6;
                padding: 8px 18px;
                font-size: 13px; font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
                margin-top: 4px;
            }
            .cf-add-addr-btn:hover { background: rgba(59,130,246,0.08); }

            .cf-remove-btn {
                background: rgba(239,68,68,0.1);
                color: #ef4444;
                border: 1px solid rgba(239,68,68,0.2);
                border-radius: 8px;
                padding: 4px 10px;
                font-size: 12px; font-weight: 500;
                cursor: pointer;
                display: inline-flex; align-items: center; gap: 4px;
                transition: background 0.2s;
            }
            .cf-remove-btn:hover:not(:disabled) { background: rgba(239,68,68,0.18); }
            .cf-remove-btn:disabled { opacity: 0.35; cursor: not-allowed; }

            /* ── Bottom buttons (= pms-btn-container) ── */
            .cf-footer {
                display: flex; justify-content: flex-end;
                align-items: center; gap: 12px;
                margin-top: 32px; padding-top: 24px;
                border-top: 1px solid rgba(255,255,255,0.15);
            }
            .cf-btn {
                padding: 10px 28px;
                border-radius: 12px;
                font-size: 14px; font-weight: 600;
                cursor: pointer;
                display: inline-flex; align-items: center; gap: 8px;
                border: none;
                transition: all 0.3s ease;
            }
            .cf-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
            .cf-btn-secondary {
                background: rgba(255,255,255,0.2);
                color: #1e293b;
                border: 1px solid rgba(255,255,255,0.3) !important;
            }
            .cf-btn-primary {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                box-shadow: 0 4px 12px rgba(37,99,235,0.3);
            }
            .cf-btn-primary:hover {
                background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
                box-shadow: 0 6px 20px rgba(37,99,235,0.4) !important;
            }
            .cf-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }
        `}</style>

        <form onSubmit={handleSubmit}>

            {/* ── Status Alert ── */}
            {submitStatus.message && (
                <div className={`cf-status ${submitStatus.type === 'success' ? 'cf-status-success' : 'cf-status-error'}`}>
                    <i className={`bi ${submitStatus.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                    <span>{submitStatus.message}</span>
                    <button type="button" className="cf-status-close"
                        onClick={() => setSubmitStatus({ type: '', message: '' })}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>
            )}

            {/* ════════════════════════════
                SECTION 1 — General Details
            ════════════════════════════ */}
            <div className="cf-section">
                <div className="cf-section-title">
                    <span className="cf-icon cf-icon-blue"><i className="bi bi-person-fill"></i></span>
                    General Details
                </div>

                <div className="row g-3">

                    {/* Full Name */}
                    <div className="col-md-6 col-lg-3">
                        <Label>Full Name <span style={{ color: '#ef4444' }}>*</span></Label>
                        <FieldGroup style={{ display: 'flex', gap: 8 }}>
                            <input type="text" name="firstName" value={formData.firstName}
                                onChange={handleChange} className="cf-input"
                                placeholder="First" disabled={loading} />
                            <span className="cf-divider"></span>
                            <input type="text" name="lastName" value={formData.lastName}
                                onChange={handleChange} className="cf-input"
                                placeholder="Last" disabled={loading} />
                        </FieldGroup>
                        <ErrMsg msg={errors.firstName || errors.lastName} />
                    </div>

                    {/* Company Name */}
                    {fv.companyName && (
                        <div className="col-md-6 col-lg-3">
                            <Label>Company Name <span style={{ color: '#ef4444' }}>*</span></Label>
                            <FieldGroup>
                                <input type="text" name="companyName" value={formData.companyName}
                                    onChange={handleChange} className="cf-input"
                                    placeholder="Company Name" disabled={loading} />
                            </FieldGroup>
                            <ErrMsg msg={errors.companyName} />
                        </div>
                    )}

                    {/* Email */}
                    {fv.email && (
                        <div className="col-md-6 col-lg-3">
                            <Label>Email</Label>
                            <FieldGroup>
                                <input type="email" name="email" value={formData.email}
                                    onChange={handleChange} className="cf-input"
                                    placeholder="email@example.com" disabled={loading} />
                            </FieldGroup>
                            <ErrMsg msg={errors.email} />
                        </div>
                    )}

                    {/* Mobile */}
                    {fv.mobileNo && (
                        <div className="col-md-6 col-lg-3">
                            <Label>Mobile No. <span style={{ color: '#ef4444' }}>*</span></Label>
                            <FieldGroup>
                                <div className="cf-input-group">
                                    <select name="mobileCountryCode" value={formData.mobileCountryCode}
                                        onChange={handleChange} className="cf-code-select" disabled={loading}>
                                        <option value="+91">🇮🇳 +91</option>
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+44">🇬🇧 +44</option>
                                    </select>
                                    <span className="cf-divider"></span>
                                    <input type="tel" name="mobileNo" value={formData.mobileNo}
                                        onChange={handleChange} className="cf-input"
                                        placeholder="Mobile Number" maxLength="10" disabled={loading} />
                                </div>
                            </FieldGroup>
                            <ErrMsg msg={errors.mobileNo} />
                        </div>
                    )}

                    {/* PAN */}
                    {fv.panNo && (
                        <div className="col-md-6 col-lg-3">
                            <Label>PAN No.</Label>
                            <FieldGroup>
                                <input type="text" name="panNo" value={formData.panNo}
                                    onChange={e => handleChange({ target: { name: 'panNo', value: e.target.value.toUpperCase() } })}
                                    className="cf-input" placeholder="ABCDE1234F"
                                    maxLength="10" disabled={loading} />
                            </FieldGroup>
                            <ErrMsg msg={errors.panNo} />
                        </div>
                    )}

                    {/* Telephone */}
                    {fv.telephoneNo && (
                        <div className="col-md-6 col-lg-3">
                            <Label>Telephone No.</Label>
                            <FieldGroup>
                                <div className="cf-input-group">
                                    <select name="telephoneCountryCode" value={formData.telephoneCountryCode}
                                        onChange={handleChange} className="cf-code-select" disabled={loading}>
                                        <option value="+91">🇮🇳 +91</option>
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+44">🇬🇧 +44</option>
                                    </select>
                                    <span className="cf-divider"></span>
                                    <input type="tel" name="telephoneNo" value={formData.telephoneNo}
                                        onChange={handleChange} className="cf-input"
                                        placeholder="Telephone" maxLength="11" disabled={loading} />
                                </div>
                            </FieldGroup>
                            <ErrMsg msg={errors.telephoneNo} />
                        </div>
                    )}

                    {/* WhatsApp */}
                    {fv.whatsappNo && (
                        <div className="col-md-6 col-lg-3">
                            <Label>WhatsApp No.</Label>
                            <FieldGroup>
                                <div className="cf-input-group">
                                    <select name="whatsappCountryCode" value={formData.whatsappCountryCode}
                                        onChange={handleChange} className="cf-code-select" disabled={loading}>
                                        <option value="+91">🇮🇳 +91</option>
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+44">🇬🇧 +44</option>
                                    </select>
                                    <span className="cf-divider"></span>
                                    <input type="tel" name="whatsappNo" value={formData.whatsappNo}
                                        onChange={handleChange} className="cf-input"
                                        placeholder="WhatsApp" maxLength="10" disabled={loading} />
                                </div>
                            </FieldGroup>
                            <ErrMsg msg={errors.whatsappNo} />
                        </div>
                    )}

                    {/* Remarks */}
                    {fv.remarks && (
                        <div className="col-md-6 col-lg-3">
                            <Label>Remarks</Label>
                            <FieldGroup>
                                <input type="text" name="remarks" value={formData.remarks}
                                    onChange={handleChange} className="cf-input"
                                    placeholder="Additional notes" disabled={loading} />
                            </FieldGroup>
                        </div>
                    )}

                    {/* Payment Mode */}
                    {fv.paymentMode && (
                        <div className="col-md-6 col-lg-3">
                            <Label>Payment Mode</Label>
                            <FieldGroup>
                                <select name="paymentMode" value={formData.paymentMode}
                                    onChange={handleChange} className="cf-select" disabled={loading}>
                                    <option value="">Select Mode</option>
                                    {['Cash','Credit','Debit Card','Credit Card','UPI','Net Banking'].map(m =>
                                        <option key={m} value={m}>{m}</option>)}
                                </select>
                            </FieldGroup>
                        </div>
                    )}

                    {/* Payment Terms */}
                    {fv.paymentTerms && (
                        <div className="col-md-6 col-lg-3">
                            <Label>Payment Terms</Label>
                            <FieldGroup>
                                <select name="paymentTerms" value={formData.paymentTerms}
                                    onChange={handleChange} className="cf-select" disabled={loading}>
                                    <option value="">Select Terms</option>
                                    {['15 Days','30 Days','45 Days','60 Days','90 Days'].map(t =>
                                        <option key={t} value={t}>{t}</option>)}
                                </select>
                            </FieldGroup>
                        </div>
                    )}

                    {/* Opening Balance */}
                    {fv.openingBalance && (
                        <div className="col-md-6 col-lg-3">
                            <Label>Opening Balance (Debit / Credit)</Label>
                            <FieldGroup style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ color: '#10b981', fontWeight: 700, fontSize: 14 }}>₹</span>
                                <input type="number" name="debitAmount" value={formData.debitAmount}
                                    onChange={handleChange} className="cf-input"
                                    placeholder="Debit" min="0" step="0.01" disabled={loading} />
                                <span className="cf-divider"></span>
                                <input type="number" name="creditAmount" value={formData.creditAmount}
                                    onChange={handleChange} className="cf-input"
                                    placeholder="Credit" min="0" step="0.01" disabled={loading} />
                            </FieldGroup>
                            <ErrMsg msg={errors.debitAmount || errors.creditAmount} />
                        </div>
                    )}

                    {/* Date of Birth */}
                    {fv.dateOfBirth && (
                        <div className="col-md-6 col-lg-3">
                            <Label>Date of Birth</Label>
                            <FieldGroup>
                                <input type="date" name="dateOfBirth" value={formData.dateOfBirth}
                                    onChange={handleChange} className="cf-input" disabled={loading} />
                            </FieldGroup>
                        </div>
                    )}

                    {/* Anniversary */}
                    {fv.anniversaryDate && (
                        <div className="col-md-6 col-lg-3">
                            <Label>Anniversary Date</Label>
                            <FieldGroup>
                                <input type="date" name="anniversaryDate" value={formData.anniversaryDate}
                                    onChange={handleChange} className="cf-input" disabled={loading} />
                            </FieldGroup>
                        </div>
                    )}

                    {/* Category */}
                    {fv.customerCategory && (
                        <div className="col-md-6 col-lg-3">
                            <Label>Customer Category <span style={{ color: '#ef4444' }}>*</span></Label>
                            <FieldGroup>
                                <select name="customerCategory" value={formData.customerCategory}
                                    onChange={handleChange} className="cf-select" disabled={loading}>
                                    <option value="">Select Category</option>
                                    {['Premium','Standard','Basic','VIP'].map(c =>
                                        <option key={c} value={c}>{c}</option>)}
                                </select>
                            </FieldGroup>
                            <ErrMsg msg={errors.customerCategory} />
                        </div>
                    )}

                    {/* Type — radio pills */}
                    {fv.type && (
                        <div className="col-12">
                            <Label>Customer Type <span style={{ color: '#ef4444' }}>*</span></Label>
                            <div className="cf-radio-row mt-1">
                                {['Wholesaler','Retailer','Distributor','Retail','Other'].map(t => (
                                    <label className="cf-radio-pill" key={t}>
                                        <input type="radio" name="type" value={t}
                                            checked={formData.type === t}
                                            onChange={handleChange} disabled={loading} />
                                        <span className="cf-radio-dot"></span>
                                        {t}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* ════════════════════════════
                SECTION 2 — Address Details
            ════════════════════════════ */}
            <div className="cf-section">
                <div className="cf-section-title">
                    <span className="cf-icon cf-icon-green"><i className="bi bi-geo-alt-fill"></i></span>
                    Address Details
                </div>

                {formData.addresses.map((addr, idx) => (
                    <div className="cf-addr-block" key={idx}>

                        <div className="cf-addr-header">
                            <div className="cf-addr-title">
                                <span className="cf-addr-num">{idx + 1}</span>
                                Address {idx + 1}
                            </div>
                            <button type="button" className="cf-remove-btn"
                                onClick={() => removeAddress(idx)}
                                disabled={formData.addresses.length <= 1 || loading}>
                                <i className="bi bi-trash3"></i> Remove
                            </button>
                        </div>

                        <div className="row g-3">

                            {/* GST Type */}
                            {fv.gstType && (
                                <div className="col-md-6 col-lg-3">
                                    <Label>GST Type</Label>
                                    <FieldGroup>
                                        <select className="cf-select" value={addr.gstType}
                                            onChange={e => handleAddressChange(idx, 'gstType', e.target.value)}
                                            disabled={loading}>
                                            {['Other','Registered','Unregistered','Consumer','Overseas'].map(g =>
                                                <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </FieldGroup>
                                </div>
                            )}

                            {/* GSTIN */}
                            {fv.gstin && addr.gstType === 'Registered' && (
                                <div className="col-md-6 col-lg-3">
                                    <Label>GSTIN</Label>
                                    <FieldGroup>
                                        <input type="text" className="cf-input"
                                            value={addr.gstin}
                                            onChange={e => handleAddressChange(idx, 'gstin', e.target.value.toUpperCase())}
                                            placeholder="27AAPFU0939F1ZV" maxLength="15" disabled={loading} />
                                    </FieldGroup>
                                    <ErrMsg msg={errors[`address_${idx}_gstin`]} />
                                </div>
                            )}

                            {/* Contact First Name */}
                            {fv.contactFirstName && (
                                <div className="col-md-6 col-lg-3">
                                    <Label>Contact First Name</Label>
                                    <FieldGroup>
                                        <input type="text" className="cf-input"
                                            value={addr.contactFirstName}
                                            onChange={e => handleAddressChange(idx, 'contactFirstName', e.target.value)}
                                            placeholder="First Name" disabled={loading} />
                                    </FieldGroup>
                                </div>
                            )}

                            {/* Contact Last Name */}
                            {fv.contactLastName && (
                                <div className="col-md-6 col-lg-3">
                                    <Label>Contact Last Name</Label>
                                    <FieldGroup>
                                        <input type="text" className="cf-input"
                                            value={addr.contactLastName}
                                            onChange={e => handleAddressChange(idx, 'contactLastName', e.target.value)}
                                            placeholder="Last Name" disabled={loading} />
                                    </FieldGroup>
                                </div>
                            )}

                            {/* Contact Company */}
                            {fv.contactCompanyName && (
                                <div className="col-md-6 col-lg-3">
                                    <Label>Contact Company</Label>
                                    <FieldGroup>
                                        <input type="text" className="cf-input"
                                            value={addr.contactCompanyName}
                                            onChange={e => handleAddressChange(idx, 'contactCompanyName', e.target.value)}
                                            placeholder="Company Name" disabled={loading} />
                                    </FieldGroup>
                                </div>
                            )}

                            {/* Contact No */}
                            {fv.contactNo && (
                                <div className="col-md-6 col-lg-3">
                                    <Label>Contact No.</Label>
                                    <FieldGroup>
                                        <div className="cf-input-group">
                                            <select className="cf-code-select" value={addr.contactCountryCode}
                                                onChange={e => handleAddressChange(idx, 'contactCountryCode', e.target.value)}
                                                disabled={loading}>
                                                <option value="+91">🇮🇳 +91</option>
                                                <option value="+1">🇺🇸 +1</option>
                                            </select>
                                            <span className="cf-divider"></span>
                                            <input type="tel" className="cf-input"
                                                value={addr.contactNo}
                                                onChange={e => handleAddressChange(idx, 'contactNo', e.target.value)}
                                                placeholder="Contact Number" maxLength="10" disabled={loading} />
                                        </div>
                                    </FieldGroup>
                                    <ErrMsg msg={errors[`address_${idx}_contactNo`]} />
                                </div>
                            )}

                            {/* Contact Email */}
                            {fv.contactEmail && (
                                <div className="col-md-6 col-lg-3">
                                    <Label>Contact Email</Label>
                                    <FieldGroup>
                                        <input type="email" className="cf-input"
                                            value={addr.contactEmail}
                                            onChange={e => handleAddressChange(idx, 'contactEmail', e.target.value)}
                                            placeholder="contact@email.com" disabled={loading} />
                                    </FieldGroup>
                                    <ErrMsg msg={errors[`address_${idx}_contactEmail`]} />
                                </div>
                            )}

                            {/* Address Line 1 */}
                            {fv.addressLine1 && (
                                <div className="col-md-6">
                                    <Label>Address Line 1</Label>
                                    <FieldGroup>
                                        <input type="text" className="cf-input"
                                            value={addr.addressLine1}
                                            onChange={e => handleAddressChange(idx, 'addressLine1', e.target.value)}
                                            placeholder="Street, Building No." disabled={loading} />
                                    </FieldGroup>
                                </div>
                            )}

                            {/* Address Line 2 */}
                            {fv.addressLine2 && (
                                <div className="col-md-6">
                                    <Label>Address Line 2</Label>
                                    <FieldGroup>
                                        <input type="text" className="cf-input"
                                            value={addr.addressLine2}
                                            onChange={e => handleAddressChange(idx, 'addressLine2', e.target.value)}
                                            placeholder="Area, Landmark" disabled={loading} />
                                    </FieldGroup>
                                </div>
                            )}

                            {/* Country */}
                            {fv.country && (
                                <div className="col-md-6 col-lg-3">
                                    <Label>Country <span style={{ color: '#ef4444' }}>*</span></Label>
                                    <FieldGroup>
                                        <select className="cf-select" value={addr.country}
                                            onChange={e => handleAddressChange(idx, 'country', e.target.value)}
                                            disabled={loading}>
                                            <option value="">Select Country</option>
                                            {countries.map(c =>
                                                <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </FieldGroup>
                                    <ErrMsg msg={errors[`address_${idx}_country`]} />
                                </div>
                            )}

                            {/* State */}
                            {fv.state && (
                                <div className="col-md-6 col-lg-3">
                                    <Label>State <span style={{ color: '#ef4444' }}>*</span></Label>
                                    <FieldGroup>
                                        <select className="cf-select" value={addr.state}
                                            onChange={e => handleAddressChange(idx, 'state', e.target.value)}
                                            disabled={loading || !addr.country}>
                                            <option value="">Select State</option>
                                            {states.map(s =>
                                                <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </FieldGroup>
                                    <ErrMsg msg={errors[`address_${idx}_state`]} />
                                </div>
                            )}

                            {/* City */}
                            {fv.city && (
                                <div className="col-md-6 col-lg-3">
                                    <Label>City <span style={{ color: '#ef4444' }}>*</span></Label>
                                    <FieldGroup>
                                        <select className="cf-select" value={addr.city}
                                            onChange={e => handleAddressChange(idx, 'city', e.target.value)}
                                            disabled={loading || !addr.state}>
                                            <option value="">Select City</option>
                                            {cities.map(c =>
                                                <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </FieldGroup>
                                    <ErrMsg msg={errors[`address_${idx}_city`]} />
                                </div>
                            )}

                            {/* Pincode */}
                            {fv.pincode && (
                                <div className="col-md-6 col-lg-3">
                                    <Label>Pincode</Label>
                                    <FieldGroup>
                                        <input type="text" className="cf-input"
                                            value={addr.pincode}
                                            onChange={e => handleAddressChange(idx, 'pincode', e.target.value)}
                                            placeholder="6-digit Pincode" maxLength="6" disabled={loading} />
                                    </FieldGroup>
                                    <ErrMsg msg={errors[`address_${idx}_pincode`]} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <button type="button" className="cf-add-addr-btn"
                    onClick={addMoreAddress} disabled={loading}>
                    <i className="bi bi-plus-lg"></i> Add Another Address
                </button>
            </div>

            {/* ── Footer Buttons (= pms-btn-container) ── */}
            <div className="cf-footer">
                <button type="button" className="cf-btn cf-btn-secondary"
                    onClick={resetForm} disabled={loading}>
                    <i className="bi bi-arrow-counterclockwise"></i>
                    Reset
                </button>
                <button type="submit" className="cf-btn cf-btn-primary" disabled={loading}>
                    {loading
                        ? <><span className="spinner-border spinner-border-sm"></span> Saving...</>
                        : <><i className="bi bi-plus-lg"></i> Add Customer</>
                    }
                </button>
            </div>

        </form>
        </>
    );
};

export default CustomerForm;
