/**
 * PremiumStatCard Molecule
 * Displays a statistic with a gradient background, title, value, and icon.
 */
import React from 'react';
import PropTypes from 'prop-types';

const PremiumStatCard = ({ title, value, icon, variant = 'primary' }) => {
    return (
        <div className="col-xl-3 col-sm-6 col-12">
            <div className={`premium-card bg-gradient-premium-${variant} h-100 p-3`}>
                <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-1 text-muted">{title}</h5>
                        <h2 className="mb-0 fw-bold">{value}</h2>
                    </div>
                    <div className="icon-wrapper">
                        <i className={`feather icon-${icon} fs-24`}></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

PremiumStatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info'])
};

export default PremiumStatCard;
