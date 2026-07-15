import React, { useState, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router';
const AllMasters = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const mastersData = [
        {
            id: 1,
            name: 'Item Name',
            description: 'Manage all product item names and identifiers',
            icon: 'bi-box-seam',
            iconBg: 'rgba(99, 102, 241, 0.1)',
            iconColor: '#6366f1',
            route: '/item-name'
        },
        {
            id: 2,
            name: 'Brand',
            description: 'Configure and manage product brands',
            icon: 'bi-bookmark-star',
            iconBg: 'rgba(34, 197, 94, 0.1)',
            iconColor: '#22c55e',
            route: '/brand'
        },
        {
            id: 3,
            name: 'Size',
            description: 'Define size variations for inventory items',
            icon: 'bi-rulers',
            iconBg: 'rgba(251, 146, 60, 0.1)',
            iconColor: '#fb923c',
            route: '/size'
        },
        {
            id: 4,
            name: 'Colour',
            description: 'Manage color options and variants',
            icon: 'bi-palette',
            iconBg: 'rgba(168, 85, 247, 0.1)',
            iconColor: '#a855f7',
            route: '/colour'
        },
        {
            id: 5,
            name: 'Style',
            description: 'Configure product styles and designs',
            icon: 'bi-brush',
            iconBg: 'rgba(236, 72, 153, 0.1)',
            iconColor: '#ec4899',
            route: '/style'
        },
        {
            id: 6,
            name: 'HSN/SAC',
            description: 'Harmonized System Nomenclature codes',
            icon: 'bi-upc-scan',
            iconBg: 'rgba(20, 184, 166, 0.1)',
            iconColor: '#14b8a6',
            route: '/hsn-sac'
        },
        {
            id: 7,
            name: 'Category',
            description: 'Organize items into main categories',
            icon: 'bi-grid',
            iconBg: 'rgba(59, 130, 246, 0.1)',
            iconColor: '#3b82f6',
            route: '/category'
        },
        {
            id: 8,
            name: 'Subcategory',
            description: 'Define detailed subcategory classifications',
            icon: 'bi-diagram-3',
            iconBg: 'rgba(16, 185, 129, 0.1)',
            iconColor: '#10b981',
            route: '/subcategory'
        },
        {
            id: 9,
            name: 'Racks',
            description: 'Manage storage rack locations and layouts',
            icon: 'bi-server',
            iconBg: 'rgba(245, 158, 11, 0.1)',
            iconColor: '#f59e0b',
            route: '/racks'
        },
        {
            id: 10,
            name: 'Item Type',
            description: 'Configure different types of inventory items',
            icon: 'bi-tags',
            iconBg: 'rgba(6, 182, 212, 0.1)',
            iconColor: '#06b6d4',
            route: '/item-type'
        },
        {
            id: 11,
            name: 'GST',
            description: 'Goods and Services Tax configuration',
            icon: 'bi-percent',
            iconBg: 'rgba(239, 68, 68, 0.1)',
            iconColor: '#ef4444',
            route: '/gst'
        },
        {
            id: 12,
            name: 'Contact',
            description: 'Goods and Services Tax configuration',
            icon: 'bi-percent',
            iconBg: 'rgba(239, 68, 68, 0.1)',
            iconColor: '#ef4444',
            route: '/contact'
        },
        {
            id: 13,
            name: 'Product',
            description: 'Goods and Services Tax configuration',
            icon: 'bi-percent',
            iconBg: 'rgba(239, 68, 68, 0.1)',
            iconColor: '#ef4444',
            route: '/add-product'
        },
        {
            id: 13,
            name: 'Quantity-Type',
            description: 'Types of Quantity',
            icon: 'bi-percent',
            iconBg: 'rgba(239, 68, 68, 0.1)',
            iconColor: '#ef4444',
            route: '/quantity-type'
        },
        {
            id: 14,
            name: 'Stock Reasons',
            description: 'Manage reason for stock adjustments',
            icon: 'bi-chat-square-text',
            iconBg: 'rgba(99, 102, 241, 0.1)',
            iconColor: '#6366f1',
            route: '/stock-reasons'
        },
        {
            id: 16,
            name: 'UOM Types',
            description: 'Manage UOM Types',
            icon: 'bi-chat-square-text',
            iconBg: 'rgba(99, 102, 241, 0.1)',
            iconColor: '#6366f1',
            route: '/uom-types'
        }
    ];
    const filteredMasters = useMemo(() => {
        if (!searchTerm.trim()) return mastersData;
        return mastersData.filter(master =>
            master.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            master.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, mastersData]);
    const handleCardClick = (route) => {
        navigate(route);
    };
    return (
        <div className="page-wrapper" style={{ paddingTop: '80px', minHeight: '100vh' }}>
            <div className="container-fluid px-4" style={{ maxWidth: '1400px' }}>
                {/* Compact Header */}
                <div className="row mb-3">
                    <div className="col-12">
                        <h2 className="mb-0 fw-bold" style={{ color: '#1e293b', fontSize: '26px', letterSpacing: '-0.5px' }}>
                            All Masters
                        </h2>
                    </div>
                </div>
                {/* Perfectly-Sized Masters Grid */}
                <div className="row g-3">
                    {filteredMasters.length > 0 ? (
                        filteredMasters.map((master) => (
                            <div key={master.id} className="col-6 col-md-4 col-lg-3">
                                <div
                                    className="card border-0 h-100 master-card-optimized"
                                    onClick={() => handleCardClick(master.route)}
                                    role="button"
                                    tabIndex={0}
                                    style={{
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                        position: 'relative'
                                    }}
                                >
                                    <div className="card-body p-3">
                                        {/* Icon and Arrow */}
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-3"
                                                style={{
                                                    width: '56px',
                                                    height: '56px',
                                                    backgroundColor: master.iconBg,
                                                    transition: 'transform 0.3s ease'
                                                }}
                                            >
                                                <i className={`${master.icon}`} style={{ fontSize: '26px', color: master.iconColor }}></i>
                                            </div>
                                            <i className="bi bi-arrow-right-short master-arrow"
                                                style={{ fontSize: '28px', color: master.iconColor, marginTop: '-6px' }}></i>
                                        </div>
                                        {/* Title */}
                                        <h6 className="mb-2 fw-semibold" style={{ fontSize: '15px', color: '#1e293b', lineHeight: '1.3' }}>
                                            {master.name}
                                        </h6>
                                        {/* Description */}
                                        <p className="text-muted mb-0" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                            {master.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12">
                            <div className="card border-0" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                                <div className="card-body text-center py-5">
                                    <i className="bi bi-inbox" style={{ fontSize: '64px', color: '#e2e8f0' }}></i>
                                    <h5 className="mt-3" style={{ color: '#64748b' }}>No masters found</h5>
                                    <p className="mb-0" style={{ color: '#94a3b8', fontSize: '14px' }}>Try adjusting your search terms</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .master-card-optimized:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.12) !important;
                }
                
                .master-card-optimized:hover .master-arrow {
                    transform: translateX(4px);
                }
                
                .master-arrow {
                    transition: transform 0.3s ease;
                }
            `}</style>
        </div>
    );
};
export default AllMasters;
