import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import CustomerForm from './CustomerForm';
import SupplierVendorForm from './SupplierVendorForm';
import TransportForm from './TransportForm';
import FieldSettings from './FieldSettings';

const Contacts = () => {
    const [activeTab, setActiveTab]         = useState('customer');
    const [showSettings, setShowSettings]   = useState(false);
    const [fieldVisibility, setFieldVisibility] = useState({
        customer: {
            companyName: true, email: true, mobileNo: true, panNo: true,
            telephoneNo: true, remarks: true, paymentMode: true, paymentTerms: true,
            openingBalance: true, whatsappNo: true, dateOfBirth: true,
            anniversaryDate: true, customerCategory: true, type: true,
            gstType: true, gstin: true, contactFirstName: true, contactLastName: true,
            contactCompanyName: true, contactNo: true, contactEmail: true,
            addressLine1: true, addressLine2: true, country: true,
            state: true, city: true, pincode: true,
        },
        supplier: {
            companyName: true, email: true, mobileNo: true, panNo: true,
            telephoneNo: true, remarks: true, paymentMode: true, paymentTerms: true,
            openingBalance: true, whatsappNo: true, dateOfBirth: true,
            anniversaryDate: true, supplierCategory: true, type: true,
            gstType: true, gstin: true, contactFirstName: true, contactLastName: true,
            contactCompanyName: true, contactNo: true, contactEmail: true,
            addressLine1: true, addressLine2: true, country: true,
            state: true, city: true, pincode: true,
        },
        transport: {
            companyName: true, email: true, mobileNo: true, panNo: true,
            telephoneNo: true, remarks: true, paymentMode: true, paymentTerms: true,
            openingBalance: true, whatsappNo: true, dateOfBirth: true,
            anniversaryDate: true, transportCategory: true, vehicleNo: true,
            licenseNo: true, gstType: true, gstin: true, contactFirstName: true,
            contactLastName: true, contactCompanyName: true, contactNo: true,
            contactEmail: true, addressLine1: true, addressLine2: true,
            country: true, state: true, city: true, pincode: true,
        },
    });

    const navigate = useNavigate();
    const handleBack                  = () => navigate(-1);
    const toggleSettings              = () => setShowSettings(prev => !prev);
    const handleFieldVisibilityChange = (field) => {
        setFieldVisibility(prev => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], [field]: !prev[activeTab][field] },
        }));
    };

    const tabs = [
        { key: 'customer',  label: 'Customer'        },
        { key: 'supplier',  label: 'Supplier/Vendor' },
        { key: 'transport', label: 'Transport'       },
    ];

    return (
        <>
            <style>{`
                /* ══════════════════════════════════════════════
                   THE FIX: gradient background so glassmorphism
                   cards in child forms are actually visible
                ══════════════════════════════════════════════ */
                .ct-root {
                    background: linear-gradient(135deg, #f0f4ff 0%, #c7d9f8 50%, #aec4f6 100%);
                    min-height: 100vh;
                    padding-top: 90px;
                    padding-left: 16px;
                    padding-right: 16px;
                    padding-bottom: 40px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    
                }
                .ct-wrap {
                    width: 95%;
                    margin: 0 auto;
                }

                /* ── Header ── */
                .ct-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .ct-breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .ct-home-btn {
                    background: rgba(255,255,255,0.4);
                    border: 1px solid rgba(255,255,255,0.5);
                    border-radius: 8px;
                    padding: 6px 10px;
                    color: #2c3e50;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    transition: background 0.2s;
                }
                .ct-home-btn:hover { background: rgba(255,255,255,0.6); }
                .ct-home-btn i { font-size: 18px; }
                .ct-chevron { color: #6c757d; font-size: 12px; }
                .ct-breadcrumb-label {
                    color: #1e293b;
                    font-size: 14px;
                    font-weight: 600;
                }

                /* ── Settings ── */
                .ct-settings-wrap { position: relative; }
                .ct-settings-btn {
                    background: rgba(255,255,255,0.55);
                    backdrop-filter: blur(12px);
                    color: #1e293b;
                    border: 1px solid rgba(255,255,255,0.4);
                    border-radius: 10px;
                    padding: 8px 16px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: background 0.2s;
                }
                .ct-settings-btn:hover { background: rgba(255,255,255,0.75); }

                /* ── Main card: transparent so child gradient cards show ── */
                .ct-card {
                    background: transparent;
                    padding: 0;
                }

                /* ── Tab pill bar ── */
                .ct-tabs {
                    display: flex;
                    gap: 4px;
                    background: rgba(255,255,255,0.45);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.4);
                    border-radius: 14px;
                    padding: 5px 6px;
                    margin-bottom: 20px;
                    width: fit-content;
                }
                .ct-tab-btn {
                    background: transparent;
                    border: none;
                    border-radius: 10px;
                    padding: 8px 20px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #475569;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .ct-tab-btn:hover:not(.ct-tab-active) {
                    background: rgba(255,255,255,0.4);
                    color: #1e293b;
                }
                .ct-tab-active {
                    background: white !important;
                    color: #4a90e2 !important;
                    font-weight: 600 !important;
                    box-shadow: 0 2px 8px rgba(74,144,226,0.18);
                }
                .ct-tab-dot {
                    width: 7px; height: 7px;
                    border-radius: 50%;
                    background: currentColor;
                    flex-shrink: 0;
                }

                @media (max-width: 576px) {
                    .ct-tabs { width: 100%; overflow-x: auto; }
                    .ct-tab-btn { padding: 8px 14px; font-size: 12px; }
                }
            `}</style>

            <div className="ct-root">
                <div className="ct-wrap">

                    {/* ── Header ── */}
                    <div className="ct-header">
                        <div className="ct-breadcrumb">
                            <button className="ct-home-btn" onClick={handleBack} title="Go back">
                                <i className="bi bi-house-door"></i>
                            </button>
                            <i className="bi bi-chevron-right ct-chevron"></i>
                            <span className="ct-breadcrumb-label">Contact</span>
                        </div>

                        <div className="ct-settings-wrap">
                            <button className="ct-settings-btn" onClick={toggleSettings}>
                                <i className="bi bi-gear"></i>
                                Settings
                            </button>
                            {showSettings && (
                                <FieldSettings
                                    activeTab={activeTab}
                                    fieldVisibility={fieldVisibility[activeTab]}
                                    onFieldChange={handleFieldVisibilityChange}
                                    onClose={() => setShowSettings(false)}
                                />
                            )}
                        </div>
                    </div>

                    {/* ── Content ── */}
                    <div className="ct-card">

                        {/* Tab pill bar */}
                        <div className="ct-tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    className={`ct-tab-btn ${activeTab === tab.key ? 'ct-tab-active' : ''}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    <span className="ct-tab-dot"></span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Active form — renders directly over gradient, no white wrapper */}
                        {activeTab === 'customer'  && <CustomerForm       fieldVisibility={fieldVisibility.customer}  />}
                        {activeTab === 'supplier'  && <SupplierVendorForm fieldVisibility={fieldVisibility.supplier}  />}
                        {activeTab === 'transport' && <TransportForm      fieldVisibility={fieldVisibility.transport} />}
                    </div>

                </div>
            </div>
        </>
    );
};

export default Contacts;
