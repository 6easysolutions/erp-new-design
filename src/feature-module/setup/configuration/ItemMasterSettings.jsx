
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Save, Settings } from 'react-feather';

const ItemMasterSettings = () => {

  // Main Settings State (Static)
  const [mainSettings, setMainSettings] = useState({
    category: false,
    subcategory: false,
    barcode: false,
    itemName: false,
    itemType: false,
    brand: false,
    size: false,
    color: false,
    style: false,
    expiryDate: false,
    hsn: false,
    minStock: false,
    maxStock: false,
    purchaseRate: false,
    mrp: false,
    saleRate: false,
    wp: false,
    swp: false,
    uploadImage: false,
  });

  // Other Settings State
  const [otherSettings, setOtherSettings] = useState({
    itemVariant: false,
    itemVariantList: false,
  });

  // Compulsory Settings State
  const [compulsorySettings, setCompulsorySettings] = useState({
    mrpCompulsory: false,
    extraColumnCompulsary: false,
    gstCompulsary: false,
    hsnCodeCompulsary: false,
    brandCompulsary: false,
    compulsaryAllField: false,
  });

  // Extra Fields State
  const [extraFields, setExtraFields] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      label: `Grid Label ${i + 1}`,
      active: false,
      rename: '',
      type: 'Text' // Default to Text
    }))
  );

  const handleMainChange = (key) => {
    setMainSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOtherChange = (key) => {
    setOtherSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCompulsoryChange = (key) => {
    setCompulsorySettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExtraFieldChange = (index, field, value) => {
    const updatedFields = [...extraFields];
    updatedFields[index][field] = value;
    setExtraFields(updatedFields);
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <h4>Item Master Settings</h4>
            <h6>Manage Configuration</h6>
          </div>
        </div>

        <div className="row">
          {/* Main Field Settings Column */}
          <div className="col-lg-4 col-md-6 d-flex">
            <div className="card flex-fill bg-white shadow-sm rounded-3 w-100">
              <div className="card-header border-bottom-0 pb-0">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <span className="bg-light p-2 rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                    <Settings size={16} className="text-primary" />
                  </span>
                  Main Field Settings
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {Object.entries(mainSettings).map(([key, value]) => (
                    <div className="col-12" key={key}>
                      <div className="d-flex align-items-center justify-content-between p-2 border rounded-3 bg-light bg-opacity-10 hv-bg-light">
                        <label className="form-check-label fw-medium text-capitalize mb-0 cursor-pointer flex-grow-1" htmlFor={key}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <div className="form-check form-switch m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={key}
                            checked={value}
                            onChange={() => handleMainChange(key)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Other, Compulsory */}
          <div className="col-lg-4 col-md-6 d-flex flex-column">

            {/* Other Settings */}
            <div className="card flex-fill bg-white shadow-sm rounded-3 mb-4">
              <div className="card-header border-bottom-0 pb-0">
                <h5 className="card-title mb-0">Other Settings</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {Object.entries(otherSettings).map(([key, value]) => (
                    <div className="col-12" key={key}>
                      <div className="d-flex align-items-center justify-content-between p-2 border rounded-3 bg-light bg-opacity-10">
                        <label className="form-check-label fw-medium text-capitalize mb-0 cursor-pointer flex-grow-1" htmlFor={key}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <div className="form-check form-switch m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={key}
                            checked={value}
                            onChange={() => handleOtherChange(key)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compulsory Settings */}
            <div className="card flex-fill bg-white shadow-sm rounded-3">
              <div className="card-header border-bottom-0 pb-0">
                <h5 className="card-title mb-0">Compulsory Settings</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {Object.entries(compulsorySettings).map(([key, value]) => (
                    <div className="col-12" key={key}>
                      <div className="d-flex align-items-center justify-content-between p-2 border rounded-3 bg-light bg-opacity-10">
                        <label className="form-check-label fw-medium text-capitalize mb-0 cursor-pointer flex-grow-1" htmlFor={key}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <div className="form-check form-switch m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={key}
                            checked={value}
                            onChange={() => handleCompulsoryChange(key)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Extra Field Settings */}
          <div className="col-lg-4 col-md-12 d-flex">
            <div className="card flex-fill bg-white shadow-sm rounded-3 w-100">
              <div className="card-header border-bottom-0 pb-0">
                <h5 className="card-title mb-0">Extra Field Settings</h5>
              </div>
              <div className="card-body">
                {/* Header Row */}
                <div className="row g-2 mb-2 d-none d-md-flex text-muted small fw-bold text-uppercase">
                  <div className="col-4">Label</div>
                  <div className="col-4">Rename</div>
                  <div className="col-4">Type</div>
                </div>

                <div className="d-flex flex-column gap-3">
                  {extraFields.map((field, index) => (
                    <div className="row g-2 align-items-center p-2 border rounded-3 bg-light bg-opacity-10" key={field.id}>
                      {/* Toggle Label */}
                      <div className="col-md-4 col-12 d-flex align-items-center justify-content-between">
                        <label className="form-check-label fw-medium mb-0 me-2 small text-nowrap" htmlFor={`extra-${field.id}`}>
                          {field.label}
                        </label>
                        <div className="form-check form-switch m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`extra-${field.id}`}
                            checked={field.active}
                            onChange={(e) => handleExtraFieldChange(index, 'active', e.target.checked)}
                          />
                        </div>
                      </div>

                      {/* Rename Input */}
                      <div className="col-md-4 col-6">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Rename label"
                          value={field.rename}
                          onChange={(e) => handleExtraFieldChange(index, 'rename', e.target.value)}
                        />
                      </div>

                      {/* Type Select */}
                      <div className="col-md-4 col-6">
                        <select
                          className="form-select form-select-sm"
                          value={field.type}
                          onChange={(e) => handleExtraFieldChange(index, 'type', e.target.value)}
                        >
                          <option value="Text">Text</option>
                          <option value="Number">Number</option>
                          <option value="Date">Date</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button Row */}
          <div className="col-12 mt-4 mb-4">
            <div className="d-flex justify-content-end p-3 card bg-white border-0 shadow-sm rounded-3">
              <button className="btn btn-primary btn-lg px-5 d-flex align-items-center" onClick={() => console.log('Saved settings')}>
                <Save size={18} className="me-2" /> Update Settings
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ItemMasterSettings;
