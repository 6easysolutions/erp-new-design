/**
 * StockProgressBar Atom
 * Visualizes stock level vs max stock.
 */
import React from 'react';
import PropTypes from 'prop-types';

const StockProgressBar = ({ current, max }) => {
    const percentage = Math.min(100, (current / max) * 100);

    let progressColor = 'bg-success';
    if (current === 0) progressColor = 'bg-danger';
    else if (percentage < 20) progressColor = 'bg-warning';

    return (
        <div style={{ minWidth: '120px' }}>
            <div className="d-flex justify-content-between mb-1">
                <span className="fs-12 fw-semibold">{current} / {max}</span>
                <span className="fs-12 text-muted">{Math.round(percentage)}%</span>
            </div>
            <div className="progress-thin">
                <div
                    className={`progress-bar ${progressColor}`}
                    role="progressbar"
                    style={{ width: `${percentage}%` }}
                    aria-valuenow={current}
                    aria-valuemin="0"
                    aria-valuemax={max}
                    aria-label="Stock Level"
                ></div>
            </div>
        </div>
    );
};

StockProgressBar.propTypes = {
    current: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired
};

export default StockProgressBar;
