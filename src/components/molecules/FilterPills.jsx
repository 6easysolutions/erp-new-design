/**
 * FilterPills Molecule
 * A group of clickable pills for filtering content.
 */
import React from 'react';
import PropTypes from 'prop-types';

const FilterPills = ({ activeFilter, fileters, onFilterChange }) => {
    return (
        <div className="mb-4 d-flex align-items-center">
            {fileters.map((filter) => (
                <div
                    key={filter.value}
                    className={`inventory-pill ${activeFilter === filter.value ? 'active' : ''}`}
                    onClick={() => onFilterChange(filter.value)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            onFilterChange(filter.value);
                        }
                    }}
                    aria-pressed={activeFilter === filter.value}
                >
                    {filter.showDot && (
                        <span className={`badge bg-${filter.color} rounded-circle me-2 p-1`}> </span>
                    )}
                    {filter.label}
                </div>
            ))}
        </div>
    );
};

FilterPills.propTypes = {
    activeFilter: PropTypes.string.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    fileters: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        color: PropTypes.string, // 'success', 'warning', etc.
        showDot: PropTypes.bool
    })).isRequired
};

export default FilterPills;
