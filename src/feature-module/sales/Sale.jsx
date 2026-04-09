import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { URLS } from '../../Urls';

const Sale = () => {
    const [saleMode, setSaleMode] = useState('cash'); // 'cash' | 'credit' | 'return'
    const [formData, setFormData] = useState({
        saleType: 'GST',
        priceType: 'Rate',
        billType: 'Invoice',
        taxType: 'Inclusive',
        saleTo: '',
        billingDate: new Date().toISOString().split('T')[0],
        billDueDays: '15',
        billDueDate: '',
    });
    const [itemSearch, setItemSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [inStock, setInStock] = useState(true);
    const [items, setItems] = useState([]);
    const [otherCharges, setOtherCharges] = useState([{ name: '', gstType: '', amount: '' }]);
    const [coupon, setCoupon] = useState('');
    const [extraDiscPct, setExtraDiscPct] = useState(0);
    const [extraDiscRs, setExtraDiscRs] = useState(0);
    const [roundOff, setRoundOff] = useState(0);
    const [draftCount, setDraftCount] = useState(0);

    // Computed totals
    const totalMRP = items.reduce((s, i) => s + (parseFloat(i.mrp || 0) * parseInt(i.qty || 0)), 0);
    const totalSale = items.reduce((s, i) => s + (parseFloat(i.rate || 0) * parseInt(i.qty || 0)), 0);
    const taxableValue = totalSale;
    const gstAmt = items.reduce((s, i) => s + parseFloat(i.gstRs || 0), 0);
    const grossSale = taxableValue + gstAmt;
    const netSale = grossSale - extraDiscRs + parseFloat(roundOff || 0);
    const totalQty = items.reduce((s, i) => s + parseInt(i.qty || 0), 0);

    // Handle outside click for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search API call
    const fetchSearchResults = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${URLS.SearchByStore}?searchQuery=${query}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data && response.data.data) {
                setSearchResults(response.data.data);
                setShowDropdown(true);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            setSearchResults([]);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setItemSearch(value);
        // Add a small debounce or direct call (direct for now)
        fetchSearchResults(value);
    };

    const handleSelectProduct = (product) => {
        const newItem = {
            id: Date.now() + Math.random(),
            barcode: product.barcode || `BC${Date.now()}`,
            itemName: product.name || 'Unknown Item',
            priceType: formData.priceType,
            qty: 1,
            mrp: product.mrp || 0,
            rate: product.salePrice || 0,
            disc1Pct: 0,
            disc1Rs: 0,
            taxableVal: product.salePrice || 0,
            gstPct: product.gstPercent || 0,
            gstRs: ((product.salePrice || 0) * (product.gstPercent || 0)) / 100,
            grossRate: product.salePrice || 0,
            netAmt: product.salePrice || 0,
        };
        setItems(prev => [...prev, newItem]);
        setItemSearch('');
        setSearchResults([]);
        setShowDropdown(false);
    };

    const handleAddItem = () => {
        if (!itemSearch.trim() && !barcodeInput.trim()) return;
        const newItem = {
            id: Date.now(),
            barcode: barcodeInput || `BC${Date.now()}`,
            itemName: itemSearch || 'Unknown Item',
            priceType: formData.priceType,
            qty: 1,
            mrp: 100,
            rate: 90,
            disc1Pct: 0,
            disc1Rs: 10,
            taxableVal: 90,
            gstPct: 0,
            gstRs: 0,
            grossRate: 90,
            netAmt: 90,
        };
        setItems(prev => [...prev, newItem]);
        setItemSearch('');
        setBarcodeInput('');
    };

    const handleItemChange = (id, field, value) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleDeleteItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className='page-wrapper'>

            <div className="d-flex w-100 vh-100 bg-light overflow-hidden font-monospace" style={{ fontSize: '11px' }}>

                {/* LEFT SIDE: Transaction Area (Flexible Width) */}
                <div className="d-flex flex-column flex-grow-1 h-100" style={{ minWidth: 0 }}>

                    {/* Top Shortcut Bar */}
                    {/* <div className="d-flex justify-content-between align-items-center border-bottom px-2 py-2 flex-shrink-0" style={{ backgroundColor: '#ffe5e5', borderColor: '#fca5a5' }}>
                        <div className="d-flex align-items-center gap-1">
                            <span className="badge bg-danger text-white border border-danger p-1">Credit Due Alert</span>
                            <button className="btn btn-primary btn-sm py-0 px-2 fw-bold" style={{ fontSize: '15px' }}>+ Challan</button>
                            <button className="btn btn-primary btn-sm py-0 px-2 fw-bold" style={{ fontSize: '15px' }}>+ Estimate / Quote</button>
                            <button className="btn btn-primary btn-sm py-0 px-2 fw-bold" style={{ fontSize: '15px' }}>+ Sale Order</button>
                            <button className="btn btn-primary btn-sm py-0 px-2 fw-bold" style={{ fontSize: '15px' }}>+ Approval</button>
                            <button className="btn btn-primary btn-sm py-0 px-2 fw-bold" style={{ fontSize: '15px' }}>◎ Sale Logs</button>
                        </div>
                       
                    </div> */}

                    {/* Main Sale Header (Dark Blue Box) */}
                    <div className="d-flex justify-content-between align-items-center px-2 py-1 flex-shrink-0 text-white" style={{ backgroundColor: '#1e3a8a' }}>
                        <div className="d-flex align-items-center gap-3 fw-bold" style={{ fontSize: '12px' }}>
                            <span>New Sale</span>
                            <div className="d-flex align-items-center gap-3 ms-2">
                                <div className="form-check form-check-inline mb-0">
                                    <input className="form-check-input" type="radio" name="salemode" id="cashMode" style={{ accentColor: '#4ade80' }} checked={saleMode === 'cash'} onChange={() => setSaleMode('cash')} />
                                    <label className="form-check-label text-success" htmlFor="cashMode">Cash Sale</label>
                                </div>
                                <div className="form-check form-check-inline mb-0">
                                    <input className="form-check-input" type="radio" name="salemode" id="creditMode" checked={saleMode === 'credit'} onChange={() => setSaleMode('credit')} />
                                    <label className="form-check-label" htmlFor="creditMode">Credit Sale</label>
                                </div>
                                <div className="form-check form-check-inline mb-0">
                                    <input className="form-check-input" type="radio" name="salemode" id="returnMode" checked={saleMode === 'return'} onChange={() => setSaleMode('return')} />
                                    <label className="form-check-label text-warning" htmlFor="returnMode">Return / Issue Credit Note</label>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <select className="form-select form-select-sm py-0 bg-primary text-white border-primary" style={{ fontSize: '11px', minWidth: '130px' }}>
                                <option>DRAFT LIST - [{draftCount}]</option>
                            </select>
                            <button className="btn btn-primary btn-sm py-0 fw-bold" style={{ fontSize: '11px' }}>+ Add Service</button>
                            <span className="fw-bold text-warning ms-1">Last Invoice | <span className="bg-danger text-white px-1 rounded">₹3265</span></span>
                        </div>
                    </div>

                    {/* Top Form Grid */}
                    <div className="row g-2 p-2 bg-white border-bottom m-0 flex-shrink-0">
                        <div className="col-4 col-md-2 p-1">
                            <label className="fw-bold text-secondary mb-1">Sale Type</label>
                            <select value={formData.saleType} onChange={e => handleFormChange('saleType', e.target.value)} className="form-select form-select-sm py-0 shadow-none border-secondary-subtle" style={{ fontSize: '11px' }}>
                                <option>GST</option><option>Non-GST</option>
                            </select>
                        </div>
                        <div className="col-4 col-md-2 p-1">
                            <label className="fw-bold text-secondary mb-1">Price Type</label>
                            <select value={formData.priceType} onChange={e => handleFormChange('priceType', e.target.value)} className="form-select form-select-sm py-0 shadow-none border-secondary-subtle" style={{ fontSize: '11px' }}>
                                <option>Rate</option><option>MRP</option><option>Wholesale</option>
                            </select>
                        </div>
                        <div className="col-4 col-md-2 p-1">
                            <label className="fw-bold text-secondary mb-1">Bill Type</label>
                            <select value={formData.billType} onChange={e => handleFormChange('billType', e.target.value)} className="form-select form-select-sm py-0 shadow-none border-secondary-subtle" style={{ fontSize: '11px' }}>
                                <option>Invoice</option><option>Challan</option><option>Estimate/Quote</option>
                            </select>
                        </div>
                        <div className="col-4 col-md-2 p-1">
                            <label className="fw-bold text-secondary mb-1">Tax Type</label>
                            <select value={formData.taxType} onChange={e => handleFormChange('taxType', e.target.value)} className="form-select form-select-sm py-0 shadow-none border-secondary-subtle" style={{ fontSize: '11px' }}>
                                <option>Inclusive</option><option>Exclusive</option>
                            </select>
                        </div>
                        <div className="col-4 col-md-2 p-1">
                            <label className="fw-bold text-secondary mb-1">Sale To</label>
                            <select value={formData.saleTo} onChange={e => handleFormChange('saleTo', e.target.value)} className="form-select form-select-sm py-0 shadow-none border-secondary-subtle" style={{ fontSize: '11px' }}>
                                <option value="">Select</option><option>Customer A</option>
                            </select>
                        </div>
                        <div className="col-4 col-md-2 p-1">
                            <label className="fw-bold text-secondary mb-1">Billing Date</label>
                            <input type="date" value={formData.billingDate} onChange={e => handleFormChange('billingDate', e.target.value)} className="form-control form-control-sm py-0 shadow-none border-secondary-subtle" style={{ fontSize: '11px' }} />
                        </div>
                        {/* Row 2 */}
                        <div className="col-4 col-md-2 p-1">
                            <label className="fw-bold text-secondary mb-1">Bill Due Days</label>
                            <input type="number" value={formData.billDueDays} onChange={e => handleFormChange('billDueDays', e.target.value)} className="form-control form-control-sm py-0 shadow-none border-secondary-subtle" style={{ fontSize: '11px' }} />
                        </div>
                        <div className="col-4 col-md-2 p-1">
                            <label className="fw-bold text-secondary mb-1">Bill Due Date</label>
                            <input type="date" value={formData.billDueDate} onChange={e => handleFormChange('billDueDate', e.target.value)} className="form-control form-control-sm py-0 shadow-none border-secondary-subtle" style={{ fontSize: '11px' }} />
                        </div>
                    </div>

                    {/* Item Entry Bar (Green Bar Logic Fix) */}
                    <div className="flex-shrink-0">
                        {/* Row 1: Inputs */}
                        <div className="d-flex align-items-center gap-2 p-1 bg-white border-bottom position-relative">
                            <div className="input-group input-group-sm flex-grow-1 h-100 position-relative" ref={searchRef}>
                                <input
                                    type="text"
                                    value={itemSearch}
                                    onChange={handleSearchChange}
                                    onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                                    onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                                    placeholder="Search by # item or #barcode & Press tab to select items"
                                    className="form-control"
                                    style={{ fontSize: '11px' }}
                                />
                                <button className="btn btn-info text-white fw-bold px-3">🔍</button>

                                {/* Search Dropdown */}
                                {showDropdown && searchResults.length > 0 && (
                                    <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{ top: '100%', left: 0, zIndex: 1050, maxHeight: '250px', overflowY: 'auto' }}>
                                        <table className="table table-hover table-sm mb-0 p-0" style={{ fontSize: '11px', cursor: 'pointer' }}>
                                            <thead className="table-light sticky-top" style={{ top: 0 }}>
                                                <tr>
                                                    <th className="py-1 px-2">Item Name</th>
                                                    <th className="py-1 px-2">Barcode</th>
                                                    <th className="py-1 px-2 text-end">MRP</th>
                                                    <th className="py-1 px-2 text-end">Sale Price</th>
                                                    <th className="py-1 px-2 text-center">Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {searchResults.map((product) => (
                                                    <tr key={product._id} onClick={() => handleSelectProduct(product)}>
                                                        <td className="py-1 px-2 fw-bold">{product.name}</td>
                                                        <td className="py-1 px-2 text-muted">{product.barcode}</td>
                                                        <td className="py-1 px-2 text-end">{product.mrp}</td>
                                                        <td className="py-1 px-2 text-end text-success fw-bold">{product.salePrice}</td>
                                                        <td className="py-1 px-2 text-center">
                                                            <span className={`badge ${product.quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                                {product.quantity || 0}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            {/* <div className="input-group input-group-sm h-100" style={{ width: '150px' }}>
                                <input type="text" value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddItem()} placeholder="#BarCode" className="form-control" style={{ fontSize: '11px' }} />
                                <button className="btn btn-info text-white fw-bold px-2">▤</button>
                            </div> */}
                            {/* <div className="form-check form-check-inline mb-0 h-100 d-flex align-items-center ms-1">
                                <input className="form-check-input mt-0 me-1" type="checkbox" id="inStock" checked={inStock} onChange={e => setInStock(e.target.checked)} />
                                <label className="form-check-label fw-bold text-secondary" htmlFor="inStock" style={{ fontSize: '11px' }}>In Stock</label>
                            </div> */}
                            <button className="btn btn-primary btn-sm ms-auto py-0 fw-bold" style={{ backgroundColor: '#1e3a8a', fontSize: '11px' }}>📱 Phonepe Transaction</button>
                            <button className="btn btn-primary btn-sm py-0 fw-bold" style={{ backgroundColor: '#1e3a8a', fontSize: '11px' }}>Last Bill</button>
                        </div>
                    </div>

                    {/* Main Transaction Table */}
                    <div className="flex-grow-1 overflow-auto bg-light border-bottom">
                        <table className="table table-sm table-bordered table-hover mb-0" style={{ fontSize: '11px', minWidth: '950px' }}>
                            <thead className="sticky-top" style={{ top: 0, zIndex: 10 }}>

                                {/* Blue Headers */}
                                <tr className="text-white text-center align-middle" style={{ backgroundColor: '#1e3a8a', height: '28px' }}>
                                    <th style={{ width: '40px' }} className="p-1 border-primary">Sno.</th>
                                    <th style={{ width: '35px' }} className="p-1 border-primary">Chk</th>
                                    <th style={{ width: '100px' }} className="p-1 border-primary">Barcode</th>
                                    <th className="text-start p-1 border-primary">Item Name</th>
                                    <th style={{ width: '80px' }} className="p-1 border-primary">Price Type</th>
                                    <th style={{ width: '60px' }} className="p-1 border-primary">QTY</th>
                                    <th style={{ width: '70px' }} className="p-1 border-primary text-end">MRP</th>
                                    <th style={{ width: '80px' }} className="p-1 border-primary text-end">Rate</th>
                                    <th style={{ width: '70px' }} className="p-1 border-primary text-center">Disc1(%)</th>
                                    <th style={{ width: '70px' }} className="p-1 border-primary text-center">Disc1(Rs)</th>
                                    <th style={{ width: '80px' }} className="p-1 border-primary text-end">Taxable Val</th>
                                    <th style={{ width: '60px' }} className="p-1 border-primary text-center">GST(%)</th>
                                    <th style={{ width: '70px' }} className="p-1 border-primary text-center">GST(Rs)</th>
                                    <th style={{ width: '80px' }} className="p-1 border-primary text-end">Gross Rate</th>
                                    <th style={{ width: '80px' }} className="p-1 border-primary text-end">Net.Amt</th>
                                    <th style={{ width: '40px' }} className="p-1 border-primary"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="16" className="text-center text-muted py-4 fw-bold">No items added. Search and press Enter to add items.</td>
                                    </tr>
                                ) : (
                                    items.map((item, idx) => (
                                        <tr key={item.id} className="text-center align-middle" style={{ height: '28px' }}>
                                            <td className="p-1 text-secondary">{idx + 1}</td>
                                            <td className="p-1"><input type="checkbox" className="form-check-input m-0" /></td>
                                            <td className="p-1 text-truncate" style={{ maxWidth: '100px' }}>{item.barcode}</td>
                                            <td className="p-1 text-start fw-bold text-truncate" style={{ maxWidth: '150px' }}>{item.itemName}</td>
                                            <td className="p-1">
                                                <select value={item.priceType} onChange={e => handleItemChange(item.id, 'priceType', e.target.value)} className="form-select form-select-sm py-0 px-1 shadow-none" style={{ fontSize: '10px' }}>
                                                    <option>Rate</option><option>MRP</option>
                                                </select>
                                            </td>
                                            <td className="p-1">
                                                <input type="number" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', e.target.value)} className="form-control form-control-sm py-0 px-1 text-center shadow-none" style={{ fontSize: '11px' }} />
                                            </td>
                                            <td className="p-1 text-end">{item.mrp}</td>
                                            <td className="p-1">
                                                <input type="number" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', e.target.value)} className="form-control form-control-sm py-0 px-1 text-end shadow-none" style={{ fontSize: '11px' }} />
                                            </td>
                                            <td className="p-1">{item.disc1Pct}</td>
                                            <td className="p-1">{item.disc1Rs}</td>
                                            <td className="p-1 text-end">{(item.rate * item.qty).toFixed(2)}</td>
                                            <td className="p-1">{item.gstPct}</td>
                                            <td className="p-1">{item.gstRs}</td>
                                            <td className="p-1 text-end">{item.grossRate}</td>
                                            <td className="p-1 text-end fw-bold">{(item.rate * item.qty).toFixed(2)}</td>
                                            <td className="p-1">
                                                <button onClick={() => handleDeleteItem(item.id)} className="btn btn-sm btn-outline-danger py-0 px-1 border-0 fw-bold" style={{ fontSize: '12px' }}>&times;</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Split Area */}
                    <div className="d-flex flex-shrink-0 bg-white" style={{ height: '120px' }}>
                        {/* Left: Add Other Charges */}
                        <div className="flex-grow-1 border-end d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-center px-2 text-white fw-bold" style={{ backgroundColor: '#1e3a8a', height: '24px', fontSize: '11px' }}>
                                <span>Add Other Charges</span>
                                <button className="btn btn-light py-0 px-1 fw-bold border-0 text-primary" style={{ fontSize: '12px', lineHeight: 1 }}>+</button>
                            </div>
                            <div className="flex-grow-1 overflow-auto p-1">
                                <table className="table table-sm table-borderless mb-0 text-start" style={{ fontSize: '11px' }}>
                                    <thead className="border-bottom text-secondary">
                                        <tr style={{ height: '20px' }}>
                                            <th style={{ width: '24px' }}></th>
                                            <th className="font-weight-bold">Charges Name</th>
                                            <th className="font-weight-bold">GST Type</th>
                                            <th className="text-end font-weight-bold">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {otherCharges.map((charge, idx) => (
                                            <tr key={idx} className="align-middle" style={{ height: '24px' }}>
                                                <td className="text-center"><input type="checkbox" className="form-check-input m-0" /></td>
                                                <td><input type="text" value={charge.name} onChange={e => { const n = [...otherCharges]; n[idx].name = e.target.value; setOtherCharges(n); }} className="form-control form-control-sm py-0 px-1 shadow-none" style={{ fontSize: '11px' }} /></td>
                                                <td>
                                                    <select value={charge.gstType} onChange={e => { const n = [...otherCharges]; n[idx].gstType = e.target.value; setOtherCharges(n); }} className="form-select form-select-sm py-0 px-1 shadow-none" style={{ fontSize: '11px' }}><option></option><option>IGST</option></select>
                                                </td>
                                                <td><input type="number" value={charge.amount} onChange={e => { const n = [...otherCharges]; n[idx].amount = e.target.value; setOtherCharges(n); }} className="form-control form-control-sm py-0 px-1 text-end shadow-none" style={{ fontSize: '11px' }} placeholder="0" /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Right: Credit Note / Advance Adjustment */}
                        <div className="flex-grow-1 d-flex flex-column bg-light">
                            <div className="px-2 text-white fw-bold d-flex align-items-center" style={{ backgroundColor: '#1e3a8a', height: '24px', fontSize: '11px' }}>
                                <span>Credit Note/Advance Adjustment</span>
                            </div>
                            <div className="flex-grow-1 overflow-auto p-1 bg-white">
                                <table className="table table-sm table-borderless mb-0 text-start" style={{ fontSize: '11px' }}>
                                    <thead className="border-bottom text-secondary">
                                        <tr style={{ height: '20px' }}>
                                            <th className="font-weight-bold">Status</th>
                                            <th className="text-end font-weight-bold">Amount</th>
                                            <th className="text-center font-weight-bold">Adjust</th>
                                            <th className="text-end font-weight-bold">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="align-middle" style={{ height: '24px' }}>
                                            <td>
                                                <select className="form-select form-select-sm py-0 px-1 shadow-none" style={{ fontSize: '11px' }}><option>Select</option><option>Credit Note</option></select>
                                            </td>
                                            <td className="text-end fw-bold">0</td>
                                            <td><input type="number" className="form-control form-control-sm py-0 px-1 text-center shadow-none" style={{ fontSize: '11px' }} defaultValue={0} /></td>
                                            <td className="text-end fw-bold">0</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Summary Sidebar (Fixed Width) */}
                <div className="d-flex flex-column bg-white border-start flex-shrink-0 shadow" style={{ width: '300px', zIndex: 20 }}>
                    <button className="btn w-100 text-white fw-bold rounded-0 py-2 flex-shrink-0" style={{ backgroundColor: '#0ea5e9', fontSize: '13px' }}>
                        💾 SAVE & PRINT INVOICE
                    </button>

                    <div className="flex-grow-1 overflow-auto p-2">
                        {/* Totals Section */}
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Total MRP</span>
                            <div className="border bg-light rounded px-2 text-end fw-bold border-secondary-subtle" style={{ width: '90px', height: '22px', lineHeight: '20px' }}>{totalMRP.toFixed(2)}</div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Total Sale</span>
                            <div className="border bg-light rounded px-2 text-end fw-bold border-secondary-subtle" style={{ width: '90px', height: '22px', lineHeight: '20px' }}>{totalSale.toFixed(2)}</div>
                        </div>

                        <hr className="my-2 border-secondary-subtle" />

                        {/* Apply Coupon */}
                        <div className="bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded p-2 mb-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-bold text-danger text-uppercase" style={{ fontSize: '11px' }}>Apply Coupon</span>
                                <button className="btn btn-sm btn-danger py-0 px-1 fw-bold" style={{ fontSize: '10px', height: '18px', lineHeight: '10px' }}>+</button>
                            </div>
                            <div className="d-flex gap-1 mb-2">
                                <input type="text" value={coupon} onChange={e => setCoupon(e.target.value)} className="form-control form-control-sm flex-grow-1 py-0 shadow-none border-secondary-subtle" placeholder="#Enter Coupon Here" style={{ fontSize: '11px', height: '22px' }} />
                                <button className="btn btn-sm btn-secondary py-0 px-2 fw-bold" style={{ fontSize: '11px', height: '22px' }}>✓</button>
                                <button className="btn btn-sm btn-secondary py-0 px-2 fw-bold" style={{ fontSize: '11px', height: '22px' }}>✕</button>
                            </div>
                            <div className="row g-2">
                                <div className="col-6">
                                    <label className="fw-bold text-secondary mb-1" style={{ fontSize: '10px' }}>Coupon Percent</label>
                                    <input type="number" className="form-control form-control-sm py-0 shadow-none border-secondary-subtle" defaultValue={0} style={{ fontSize: '11px', height: '22px' }} />
                                </div>
                                <div className="col-6">
                                    <label className="fw-bold text-secondary mb-1" style={{ fontSize: '10px' }}>Coupon Amount</label>
                                    <input type="number" className="form-control form-control-sm py-0 shadow-none border-secondary-subtle" defaultValue={0} style={{ fontSize: '11px', height: '22px' }} />
                                </div>
                            </div>
                        </div>

                        {/* Redeem Amount */}
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Redeem Amount</span>
                            <input type="number" className="form-control form-control-sm text-end py-0 shadow-none border-secondary-subtle" style={{ width: '90px', fontSize: '11px', height: '22px' }} defaultValue={0} />
                        </div>

                        <hr className="my-2 border-secondary-subtle" />

                        {/* Extra Disc */}
                        <div className="bg-light border border-secondary-subtle rounded p-2 mb-2 row g-2 m-0 mt-2">
                            <div className="col-6 p-0 pe-1">
                                <label className="fw-bold text-secondary mb-1" style={{ fontSize: '11px' }}>Extra Disc(%)</label>
                                <input type="number" value={extraDiscPct} onChange={e => setExtraDiscPct(e.target.value)} className="form-control form-control-sm text-end py-0 shadow-none" style={{ fontSize: '11px', height: '22px' }} />
                            </div>
                            <div className="col-6 p-0 ps-1">
                                <label className="fw-bold text-secondary mb-1" style={{ fontSize: '11px' }}>Extra Disc(Rs)</label>
                                <input type="number" value={extraDiscRs} onChange={e => setExtraDiscRs(parseFloat(e.target.value) || 0)} className="form-control form-control-sm text-end py-0 shadow-none" style={{ fontSize: '11px', height: '22px' }} />
                            </div>
                        </div>

                        {/* Breakdown List */}
                        <div className="mt-2 space-y-1">
                            {[
                                { label: 'Taxable Value', value: taxableValue.toFixed(2) },
                                { label: 'GST Amt.', value: gstAmt.toFixed(2) },
                                { label: 'Gross Sale', value: grossSale.toFixed(2) },
                            ].map(row => (
                                <div key={row.label} className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="fw-bold text-secondary" style={{ fontSize: '11px' }}>{row.label}</span>
                                    <div className="border border-secondary-subtle bg-light rounded px-2 text-end fw-bold" style={{ width: '90px', height: '22px', lineHeight: '20px' }}>{row.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Round Off */}
                        <div className="d-flex justify-content-between align-items-center border-top border-secondary-subtle pt-2 mt-2">
                            <span className="fw-bold text-secondary" style={{ fontSize: '11px' }}>Round Off</span>
                            <input type="number" value={roundOff} onChange={e => setRoundOff(e.target.value)} className="form-control form-control-sm text-end py-0 shadow-none border-secondary-subtle" style={{ width: '90px', fontSize: '11px', height: '22px' }} />
                        </div>

                        <hr className="my-2 border-secondary-subtle" />

                        {/* Counters */}
                        <div>
                            {[
                                { label: 'Total Quantity', value: totalQty },
                                { label: 'Total Item', value: items.length },
                            ].map(row => (
                                <div key={row.label} className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="fw-bold text-secondary" style={{ fontSize: '11px' }}>{row.label}</span>
                                    <div className="border border-secondary-subtle bg-white rounded px-2 text-end fw-bold" style={{ width: '90px', height: '22px', lineHeight: '20px' }}>{row.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* NET SALE Footer */}
                    <div className="bg-white border-top border-2 p-3 d-flex justify-content-between align-items-center shadow flex-shrink-0 border-secondary" style={{ height: '60px' }}>
                        <span className="fw-bolder text-dark text-uppercase" style={{ fontSize: '13px' }}>Net Sale</span>
                        <span className="fw-bold text-danger" style={{ fontSize: '26px' }}>₹ {netSale.toFixed(0)}</span>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Sale;