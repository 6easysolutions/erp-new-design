import React from 'react';
import CustomerForm from './CustomerForm';

/**
 * 🎯 CUSTOMER FORM MODAL WRAPPER
 * Wraps the CustomerForm component to work as a modal
 */
const CustomerFormModal = ({ onClose, onSuccess, fieldVisibility }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '95%',
          maxWidth: '1200px',
          maxHeight: '95vh',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <i className="ti ti-user-plus me-2"></i>
            Add New Customer
          </h4>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>

        {/* Modal Body - CustomerForm Component */}
        <div style={{ maxHeight: 'calc(95vh - 120px)', overflowY: 'auto' }}>
          <CustomerForm 
            isModal={true}
            onClose={onClose}
            onSuccess={onSuccess}
            fieldVisibility={fieldVisibility}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerFormModal;