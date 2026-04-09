/**
 * StockTable Organism
 * Wraps the PrimeDataTable and defines the columns using atomic components.
 */
import React, { useState } from 'react';
import { Link } from 'react-router';
import PrimeDataTable from '../data-table';
import StatusBadge from '../atoms/StatusBadge';
import StockProgressBar from '../atoms/StockProgressBar';
import PropTypes from 'prop-types';


const StockTable = ({ products, loading }) => {
    const [rows, setRows] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const columns = [
        {
            header: "Product Info",
            field: "name",
            key: "name",
            sortable: true,
            body: (data) => (
                <div className="productimgname">
                    <Link to="#" className="product-img">
                        <img
                            src={data.img}
                            alt={data.name}
                            className="rounded-3 border"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        />
                    </Link>
                    <div>
                        <Link to="#" className="fw-bold fs-15 text-dark">{data.name}</Link>
                        <div className="text-muted fs-12">{data.cat} • {data.sku}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Stock Health",
            key: "stockHealth",
            sortable: true, // Typically sortable by stock value
            field: "stock",
            body: (data) => (
                <StockProgressBar current={data.stock} max={data.maxStock} />
            )
        },
        { header: "Price", field: "price", key: "price", sortable: true },
        {
            header: "Status",
            field: "status",
            key: "status",
            sortable: true,
            body: (data) => <StatusBadge status={data.status} />
        },
        {
            header: "Action",
            key: "action",
            body: () => (
                <div className="action-table-data">
                    <div className="edit-delete-action">
                        <Link to="#" className="me-2 p-2 bg-light rounded-circle text-primary hover-effect" aria-label="Edit">
                            <i className="feather icon-edit" />
                        </Link>
                        <Link to="#" className="p-2 bg-light rounded-circle text-danger hover-effect" aria-label="Delete">
                            <i className="feather icon-trash-2" />
                        </Link>
                    </div>
                </div>
            )
        }
    ];

    if (loading) {
        // Simple loading skeleton or spinner
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading inventory data...</p>
            </div>
        );
    }

    return (
        <div className="card table-list-card border-0 shadow-lg px-3 py-3" style={{ borderRadius: '16px' }}>
            <div className="card-body">
                <div className="table-top">
                    <div className="search-set">
                        <div className="search-input">
                            <input type="text" className="form-control rounded-pill border-0 bg-light" placeholder="Search product name, SKU..." />
                            <Link to="#" className="btn btn-searchset"><i className="feather icon-search" /></Link>
                        </div>
                    </div>
                </div>
                <div className="table-responsive">
                    <PrimeDataTable
                        data={products}
                        column={columns}
                        rows={rows}
                        setRows={setRows}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalRecords={products.length}
                    />
                </div>
            </div>
        </div>
    );
};

StockTable.propTypes = {
    products: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired
};

export default StockTable;
