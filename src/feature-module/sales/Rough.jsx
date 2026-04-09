import React, { useState, useEffect } from 'react';
import Select from 'react-select';

// Options excluding Proforma Invoice as per constraints
const billTypeOptions = [
    { value: 'Challan', label: 'Challan' },
    { value: 'Estimate Quote', label: 'Estimate Quote' },
    { value: 'Sales Order', label: 'Sales Order' },
    { value: 'Approval', label: 'Approval' },
    { value: 'Invoice', label: 'Invoice' }
];

// Mock customers
const customerOptions = [
    { value: 'CUST001', label: 'Customer 1' },
    { value: 'CUST002', label: 'Customer 2' }
];

// Mock previous order database mappings based on target document
const mockPreviousOrders = {
    'Approval': [
        { value: 'APP-1001', label: 'APP-1001 (Pending)' },
        { value: 'APP-1002', label: 'APP-1002 (Pending)' }
    ],
    'Sales Order': [
        { value: 'SO-2001', label: 'SO-2001 (Pending)' }
    ],
    'Estimate Quote': [
        { value: 'EST-3001', label: 'EST-3001 (Pending)' }
    ],
    'Challan': [
        { value: 'CHL-4001', label: 'CHL-4001 (Pending)' }
    ]
};

// Mock conversion items
const mockItems = [
    { id: 1, barcode: '123456', itemName: 'Product A', brand: 'Brand X', size: 'M', availQty: 10, orderQty: 5, pendingQty: 5, transferQty: 5 },
    { id: 2, barcode: '789012', itemName: 'Product B', brand: 'Brand Y', size: 'L', availQty: 15, orderQty: 10, pendingQty: 8, transferQty: 8 },
    { id: 3, barcode: '345678', itemName: 'Product C', brand: 'Brand Z', size: 'S', availQty: 5, orderQty: 2, pendingQty: 2, transferQty: 2 }
];

const Sale = () => {
    // Top Bar Context State
    const [billType, setBillType] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [previousOrder, setPreviousOrder] = useState(null);

    // Grid Data State
    const [items, setItems] = useState([]);

    // Advance Payment State
    const [advanceAmount, setAdvanceAmount] = useState('');
    const [isAdvancePaid, setIsAdvancePaid] = useState(false);

    // Derived Logic: Stock Deduct Governor
    const isStockDeduct = billType && ['Challan', 'Invoice'].includes(billType.value);

    // Derived Logic: Previous Order Options based on pipeline constraint
    const getPreviousOrderOptions = () => {
        if (!billType) return [];
        switch (billType.value) {
            case 'Sales Order': return mockPreviousOrders['Approval'] || [];
            case 'Estimate Quote': return mockPreviousOrders['Sales Order'] || [];
            case 'Challan': return mockPreviousOrders['Estimate Quote'] || [];
            case 'Invoice': return mockPreviousOrders['Challan'] || [];
            default: return [];
        }
    };

    const previousOrderOptions = getPreviousOrderOptions();

    // Conditional Visibility Flags
    const showPreviousOrderDropdown = customer !== null && previousOrderOptions.length > 0;
    const showAdvancePaymentUI = billType?.value === 'Estimate Quote' && previousOrder !== null;

    // Side-effects: Reset dependent data when billType changes
    useEffect(() => {
        setPreviousOrder(null);
        setItems([]);
        setAdvanceAmount('');
        setIsAdvancePaid(false);
    }, [billType]);

    // Side-effects: Reset dependent data when customer changes
    useEffect(() => {
        setPreviousOrder(null);
        setItems([]);
    }, [customer]);

    // Handlers
    const handlePreviousOrderChange = (selected) => {
        setPreviousOrder(selected);
        if (selected) {
            console.log(`Fetching items for ${selected.value}...`);
            // Load mock items. Deep copy prevents mutating source.
            setItems(JSON.parse(JSON.stringify(mockItems)));
        } else {
            setItems([]);
        }
    };

    const handleTransferQtyChange = (id, value) => {
        const numValue = parseInt(value, 10);

        setItems(prevItems => prevItems.map(item => {
            if (item.id === id) {
                // Core Constraints: Must handle NaN, cannot go below 0, cannot exceed pendingQty
                let newTransferQty = isNaN(numValue) ? 0 : numValue;
                if (newTransferQty > item.pendingQty) {
                    newTransferQty = item.pendingQty; // Partial Conversion logic gate
                }
                if (newTransferQty < 0) {
                    newTransferQty = 0;
                }
                return { ...item, transferQty: newTransferQty };
            }
            return item;
        }));
    };

    const handleAdvancePaymentClick = () => {
        if (!advanceAmount || isNaN(advanceAmount) || advanceAmount <= 0) {
            alert('Please enter a valid positive advance amount');
            return;
        }
        setIsAdvancePaid(true);
        console.log(`Advance Payment of ₹${advanceAmount} verified & logged.`);
    };

    return (
        <div className="page-wrapper container-fluid pt-4">
            <div className="content">

                {/* Header Sector */}
                <div className="page-header mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="mb-0">Sales & Billing Flow</h4>
                            {/* <small className="text-muted">Manage comprehensive document conversion pipeline.</small> */}
                        </div>
                        {/* <button className="btn btn-outline-secondary btn-sm" onClick={() => window.location.reload()}>
                            <i className="feather icon-refresh-cw me-1"></i> Refresh Context
                        </button> */}
                    </div>
                </div>

                {/* Top Nav / Search Filter Sector */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="row g-3">
                            {/* Bill Type Master Switch */}
                            <div className="col-md-4">
                                <label className="form-label fw-semibold small">Bill Type <span className="text-danger">*</span></label>
                                <Select
                                    className="w-100"
                                    options={billTypeOptions}
                                    value={billType}
                                    onChange={setBillType}
                                    placeholder="Select Target Bill Type..."
                                />
                                {billType && (
                                    <div className="mt-1 small text-muted">
                                        Stock Deduct Logic: <strong className={isStockDeduct ? 'text-danger' : 'text-success'}>
                                            {isStockDeduct ? 'TRUE (Mutates Inventory)' : 'FALSE (Virtual Allocation)'}
                                        </strong>
                                    </div>
                                )}
                            </div>

                            {/* Customer Select */}
                            <div className="col-md-4">
                                <label className="form-label fw-semibold small">Customer <span className="text-danger">*</span></label>
                                <Select
                                    className="w-100"
                                    options={customerOptions}
                                    value={customer}
                                    onChange={setCustomer}
                                    placeholder="Select Customer Profile..."
                                />
                            </div>

                            {/* Previous Order Trigger (Conditional Render) */}
                            {showPreviousOrderDropdown && (
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold small text-primary">Previous Order (Conversion Source)</label>
                                    <Select
                                        className="w-100 border-primary"
                                        options={previousOrderOptions}
                                        value={previousOrder}
                                        onChange={handlePreviousOrderChange}
                                        placeholder={`Select ${getPreviousOrderOptions()[0]?.label.split('-')[0] || 'Source'} Document...`}
                                        styles={{ control: (base) => ({ ...base, borderColor: '#0d6efd' }) }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Advance Payment Block (Conditional Render) */}
                        {showAdvancePaymentUI && (
                            <div className="row mt-4 p-3 bg-light rounded border align-items-end" style={{ borderLeft: '4px solid #0d6efd !important' }}>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold small">Advance Amount Tracking</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white">₹</span>
                                        <input
                                            type="number"
                                            className="form-control fw-bold"
                                            value={advanceAmount}
                                            onChange={(e) => {
                                                setAdvanceAmount(e.target.value);
                                                setIsAdvancePaid(false); // Dirty state drops verification
                                            }}
                                            disabled={isAdvancePaid}
                                            placeholder="Extracted Advance..."
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <button
                                        className={`btn ${isAdvancePaid ? 'btn-success' : 'btn-primary'} w-100 fw-bold`}
                                        onClick={handleAdvancePaymentClick}
                                        disabled={isAdvancePaid || !advanceAmount}
                                    >
                                        {isAdvancePaid ? (
                                            <><i className="feather icon-check-circle me-1"></i> Received</>
                                        ) : (
                                            'Advance Payment'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid Sector */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white py-3 border-bottom">
                        <h5 className="card-title mb-0 d-flex align-items-center">
                            <i className="feather icon-list me-2"></i> Line Items Grid
                        </h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light text-muted small uppercase tracking-wide">
                                    <tr>
                                        <th className="ps-4">Barcode</th>
                                        <th>Item Name</th>
                                        <th>Brand & Size</th>
                                        <th>Avail Qty</th>
                                        <th>Order Qty</th>
                                        <th style={{ width: '200px' }} className="pe-4 text-primary">Transfer Qty (Editable)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length > 0 ? (
                                        items.map(item => (
                                            <tr key={item.id}>
                                                <td className="ps-4 text-muted">{item.barcode}</td>
                                                <td className="fw-semibold">{item.itemName}</td>
                                                <td>
                                                    <span className="badge bg-light border text-dark me-1">{item.brand}</span>
                                                    <span className="badge bg-light border text-dark">{item.size}</span>
                                                </td>
                                                <td><span className="badge bg-secondary px-2 py-1">{item.availQty}</span></td>
                                                <td>
                                                    <div className="fw-bold">{item.orderQty}</div>
                                                    <small className="text-muted">Pending: {item.pendingQty}</small>
                                                </td>
                                                <td className="pe-4">
                                                    <div className="input-group input-group-sm">
                                                        <input
                                                            type="number"
                                                            className="form-control border-primary bg-light"
                                                            value={item.transferQty}
                                                            onChange={(e) => handleTransferQtyChange(item.id, e.target.value)}
                                                            max={item.pendingQty}
                                                            min="0"
                                                        />
                                                        <span className="input-group-text bg-white text-muted">/{item.pendingQty}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5 text-muted">
                                                <div className="mb-2"><i className="feather icon-inbox" style={{ fontSize: '2rem' }}></i></div>
                                                No conversion data active. Select a valid Conversion Source.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Command Sector */}
                <div className="d-flex justify-content-end gap-3 pb-5">
                    <button className="btn btn-outline-secondary px-4 fw-semibold" onClick={() => setItems([])}>Reset Grid</button>
                    <button className="btn btn-info px-4 text-white fw-semibold">Add to Sale</button>
                    <button className="btn btn-primary px-4 fw-semibold">
                        <i className="feather icon-save me-1"></i> Save Draft
                    </button>
                    <button className="btn btn-success px-4 bg-success border-success shadow-sm fw-semibold">
                        <i className="feather icon-printer me-1"></i> Save & Print
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Sale;
