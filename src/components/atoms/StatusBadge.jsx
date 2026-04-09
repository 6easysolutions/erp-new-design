/**
 * StatusBadge Atom
 * Displays a status string with appropriate color coding and icon.
 */
import React from 'react';
import PropTypes from 'prop-types';

const StatusBadge = ({ status }) => {
    let className = "text-secondary fw-bold";
    let icon = "feather icon-info me-1";

    switch (status) {
        case 'Out of Stock':
            className = "text-danger fw-bold";
            icon = "feather icon-x-circle me-1";
            break;
        case 'Low Stock':
            className = "text-warning fw-bold";
            icon = "feather icon-alert-circle me-1";
            break;
        case 'In Stock':
            className = "text-success fw-bold";
            icon = "feather icon-check-circle me-1";
            break;
        default:
            break;
    }

    return (
        <span className={className}>
            <i className={icon}></i>
            {status}
        </span>
    );
};

StatusBadge.propTypes = {
    status: PropTypes.string.isRequired
};

export default StatusBadge;
