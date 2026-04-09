// import React, { useState, useMemo } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import { useNavigate } from 'react-router';


// const AllMasters = () => {
//     const [searchTerm, setSearchTerm] = useState('');
//     const navigate = useNavigate()


//     const mastersData = [
//         {
//             id: 1,
//             name: 'Item Name',
//             description: 'Manage all product item names and identifiers',
//             icon: 'bi-box-seam',
//             iconColor: 'icon-blue',
//             route: '/item-name'
//         },
//         {
//             id: 2,
//             name: 'Brand',
//             description: 'Configure and manage product brands',
//             icon: 'bi-bookmark-star',
//             iconColor: 'icon-green',
//             route: '/brand'
//         },
//         {
//             id: 3,
//             name: 'Size',
//             description: 'Define size variations for inventory items',
//             icon: 'bi-rulers',
//             iconColor: 'icon-orange',
//             route: '/size'
//         },
//         {
//             id: 4,
//             name: 'Colour',
//             description: 'Manage color options and variants',
//             icon: 'bi-palette',
//             iconColor: 'icon-purple',
//             route: '/colour'
//         },
//         {
//             id: 5,
//             name: 'Style',
//             description: 'Configure product styles and designs',
//             icon: 'bi-brush',
//             iconColor: 'icon-red',
//             route: '/style'
//         },
//         {
//             id: 6,
//             name: 'HSN/SAC',
//             description: 'Harmonized System Nomenclature codes',
//             icon: 'bi-upc-scan',
//             iconColor: 'icon-teal',
//             route: '/hsn-sac'
//         },
//         {
//             id: 7,
//             name: 'Category',
//             description: 'Organize items into main categories',
//             icon: 'bi-grid',
//             iconColor: 'icon-pink',
//             route: '/category'
//         },
//         {
//             id: 8,
//             name: 'Subcategory',
//             description: 'Define detailed subcategory classifications',
//             icon: 'bi-diagram-3',
//             iconColor: 'icon-yellow',
//             route: '/subcategory'
//         },
//         {
//             id: 9,
//             name: 'Racks',
//             description: 'Manage storage rack locations and layouts',
//             icon: 'bi-server',
//             iconColor: 'icon-indigo',
//             route: '/racks'
//         },
//         {
//             id: 10,
//             name: 'Item Type',
//             description: 'Configure different types of inventory items',
//             icon: 'bi-tags',
//             iconColor: 'icon-cyan',
//             route: '/item-type'
//         },
//         {
//             id: 11,
//             name: 'GST',
//             description: 'Goods and Services Tax configuration',
//             icon: 'bi-percent',
//             iconColor: 'icon-lime',
//             route: '/gst'
//         }
//     ];


//     const filteredMasters = useMemo(() => {
//         if (!searchTerm.trim()) return mastersData;
//         
//         return mastersData.filter(master =>
//             master.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             master.description.toLowerCase().includes(searchTerm.toLowerCase())
//         );
//     }, [searchTerm]);


//     const handleCardClick = (route, name) => {
//         console.log(`Navigating to ${route} - ${name}`);
//         // Add your navigation logic here
//         navigate(route);
//     };


//     const handleSearchChange = (e) => {
//         setSearchTerm(e.target.value);
//     };


//     const styles = `
//         .all-masters-container {
//             --primary-color: #5f72bd;
//             --secondary-color: #6c757d;
//             --hover-color: #4a5a9d;
//             --card-shadow: 0 2px 8px rgba(0,0,0,0.1);
//             --card-hover-shadow: 0 6px 20px rgba(95, 114, 189, 0.3);
//             --transition: all 0.3s ease;
//         }


//         .all-masters-container .page-container {
//             padding: 20px;
//             max-width: 1400px;
//             margin: 0 auto;
//         }


//         .all-masters-container .breadcrumb-section {
//             background: white;
//             padding: 15px 20px;
//             border-radius: 8px;
//             margin-bottom: 25px;
//             box-shadow: var(--card-shadow);
//         }


//         .all-masters-container .breadcrumb {
//             margin: 0;
//             background: transparent;
//             padding: 0;
//         }


//         .all-masters-container .page-title {
//             font-size: 28px;
//             font-weight: 600;
//             color: #2c3e50;
//             margin-bottom: 5px;
//         }


//         .all-masters-container .page-subtitle {
//             color: #6c757d;
//             font-size: 14px;
//             margin-bottom: 0;
//         }


//         .all-masters-container .masters-grid {
//             display: grid;
//             grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
//             gap: 20px;
//             margin-top: 20px;
//         }


//         .all-masters-container .master-card {
//             background: white;
//             border-radius: 12px;
//             padding: 25px;
//             box-shadow: var(--card-shadow);
//             transition: var(--transition);
//             cursor: pointer;
//             border: 2px solid transparent;
//             position: relative;
//             overflow: hidden;
//         }


//         .all-masters-container .master-card::before {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 0;
//             width: 4px;
//             height: 100%;
//             background: linear-gradient(to bottom, var(--primary-color), var(--hover-color));
//             opacity: 0;
//             transition: var(--transition);
//         }


//         .all-masters-container .master-card:hover {
//             transform: translateY(-5px);
//             box-shadow: var(--card-hover-shadow);
//             border-color: var(--primary-color);
//         }


//         .all-masters-container .master-card:hover::before {
//             opacity: 1;
//         }


//         .all-masters-container .master-card-icon {
//             width: 50px;
//             height: 50px;
//             border-radius: 10px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-size: 24px;
//             margin-bottom: 15px;
//             transition: var(--transition);
//         }


//         .all-masters-container .master-card:hover .master-card-icon {
//             transform: scale(1.1);
//         }


//         .all-masters-container .master-card-title {
//             font-size: 18px;
//             font-weight: 600;
//             color: #2c3e50;
//             margin-bottom: 8px;
//         }


//         .all-masters-container .master-card-description {
//             font-size: 13px;
//             color: #6c757d;
//             margin-bottom: 15px;
//             line-height: 1.5;
//         }


//         .all-masters-container .master-card-arrow {
//             color: var(--primary-color);
//             font-size: 20px;
//             transition: var(--transition);
//         }


//         .all-masters-container .master-card:hover .master-card-arrow {
//             transform: translateX(5px);
//         }


//         .all-masters-container .stats-bar {
//             display: flex;
//             gap: 15px;
//             margin-bottom: 25px;
//         }


//         .all-masters-container .stat-card {
//             flex: 1;
//             background: white;
//             padding: 20px;
//             border-radius: 10px;
//             box-shadow: var(--card-shadow);
//             display: flex;
//             align-items: center;
//             gap: 15px;
//         }


//         .all-masters-container .stat-icon {
//             width: 50px;
//             height: 50px;
//             border-radius: 10px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-size: 24px;
//         }


//         .all-masters-container .stat-content h3 {
//             font-size: 24px;
//             font-weight: 700;
//             margin: 0;
//             color: #2c3e50;
//         }
//         
//         .wrapper {
//             padding-top:70px;
//             }


//         .all-masters-container .stat-content p {
//             margin: 0;
//             font-size: 13px;
//             color: #6c757d;
//         }


//         /* Icon colors */
//         .all-masters-container .icon-blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
//         .all-masters-container .icon-green { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; }
//         .all-masters-container .icon-orange { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; }
//         .all-masters-container .icon-purple { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #764ba2; }
//         .all-masters-container .icon-red { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
//         .all-masters-container .icon-teal { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }
//         .all-masters-container .icon-pink { background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%); color: #764ba2; }
//         .all-masters-container .icon-yellow { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: #d35400; }
//         .all-masters-container .icon-indigo { background: linear-gradient(135deg, #c471f5 0%, #fa71cd 100%); color: white; }
//         .all-masters-container .icon-cyan { background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%); color: white; }
//         .all-masters-container .icon-lime { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); color: white; }


//         .all-masters-container .search-section {
//             background: white;
//             padding: 20px;
//             border-radius: 10px;
//             box-shadow: var(--card-shadow);
//             margin-bottom: 25px;
//         }


//         .all-masters-container .search-input {
//             border: 2px solid #e9ecef;
//             border-radius: 8px;
//             padding: 12px 45px 12px 15px;
//             width: 100%;
//             font-size: 14px;
//             transition: var(--transition);
//         }


//         .all-masters-container .search-input:focus {
//             outline: none;
//             border-color: var(--primary-color);
//             box-shadow: 0 0 0 3px rgba(95, 114, 189, 0.1);
//         }


//         .all-masters-container .search-wrapper {
//             position: relative;
//         }


//         .all-masters-container .search-icon {
//             position: absolute;
//             right: 15px;
//             top: 50%;
//             transform: translateY(-50%);
//             color: #6c757d;
//             font-size: 18px;
//         }


//         @media (max-width: 768px) {
//             .all-masters-container .masters-grid {
//                 grid-template-columns: 1fr;
//             }


//             .all-masters-container .stats-bar {
//                 flex-direction: column;
//             }


//             .all-masters-container .page-title {
//                 font-size: 24px;
//             }
//         }


//         @media (max-width: 992px) and (min-width: 769px) {
//             .all-masters-container .masters-grid {
//                 grid-template-columns: repeat(2, 1fr);
//             }
//         }
//     `;


//     return (
//         <div className='wrapper ' >


//         
//             <div className="all-masters-container">
//                 <style>{styles}</style>
//                 <div className="page-container">
//                     {/* Breadcrumb Section */}
//                     <div className="breadcrumb-section">
//                         <h1 className="page-title">All Masters</h1>
//                         <p className="page-subtitle">Manage and configure all master data entries</p>
//                     </div>
//  


//                     {/* Masters Grid */}
//                     <div className="masters-grid">
//                         {filteredMasters.length > 0 ? (
//                             filteredMasters.map((master) => (
//                                 <div
//                                     key={master.id}
//                                     className="master-card"
//                                     onClick={() => handleCardClick(master.route, master.name)}
//                                     role="button"
//                                     tabIndex={0}
//                                     onKeyDown={(e) => {
//                                         if (e.key === 'Enter' || e.key === ' ') {
//                                             handleCardClick(master.route, master.name);
//                                         }
//                                     }}
//                                 >
//                                     <div className={`master-card-icon ${master.iconColor}`}>
//                                         <i className={master.icon}></i>
//                                     </div>
//                                     <h3 className="master-card-title">{master.name}</h3>
//                                     <p className="master-card-description">{master.description}</p>
//                                     <div className="d-flex justify-content-between align-items-center">
//                                         <span className="badge bg-light text-dark">Master Data</span>
//                                         <i className="bi bi-arrow-right master-card-arrow"></i>
//                                     </div>
//                                 </div>
//                             ))
//                         ) : (
//                             <div className="col-12 text-center py-5">
//                                 <i className="bi bi-search" style={{ fontSize: '48px', color: '#dee2e6' }}></i>
//                                 <h3 className="mt-3 text-muted">No masters found</h3>
//                                 <p className="text-muted">Try adjusting your search terms</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };


// export default AllMasters;





// import React, { useState, useMemo } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import { useNavigate } from 'react-router';

// const AllMasters = () => {
//     const [searchTerm, setSearchTerm] = useState('');
//     const navigate = useNavigate();

//     const mastersData = [
//         {
//             id: 1,
//             name: 'Item Name',
//             description: 'Manage all product item names and identifiers',
//             icon: 'bi-box-seam',
//             iconColor: 'bg-info',
//             route: '/item-name'
//         },
//         {
//             id: 2,
//             name: 'Brand',
//             description: 'Configure and manage product brands',
//             icon: 'bi-bookmark-star',
//             iconColor: 'bg-success',
//             route: '/brand'
//         },
//         {
//             id: 3,
//             name: 'Size',
//             description: 'Define size variations for inventory items',
//             icon: 'bi-rulers',
//             iconColor: 'bg-warning',
//             route: '/size'
//         },
//         {
//             id: 4,
//             name: 'Colour',
//             description: 'Manage color options and variants',
//             icon: 'bi-palette',
//             iconColor: 'bg-info',
//             route: '/colour'
//         },
//         {
//             id: 5,
//             name: 'Style',
//             description: 'Configure product styles and designs',
//             icon: 'bi-brush',
//             iconColor: 'bg-danger',
//             route: '/style'
//         },
//         {
//             id: 6,
//             name: 'HSN/SAC',
//             description: 'Harmonized System Nomenclature codes',
//             icon: 'bi-upc-scan',
//             iconColor: 'bg-secondary',
//             route: '/hsn-sac'
//         },
//         {
//             id: 7,
//             name: 'Category',
//             description: 'Organize items into main categories',
//             icon: 'bi-grid',
//             iconColor: 'bg-info',
//             route: '/category'
//         },
//         {
//             id: 8,
//             name: 'Subcategory',
//             description: 'Define detailed subcategory classifications',
//             icon: 'bi-diagram-3',
//             iconColor: 'bg-success',
//             route: '/subcategory'
//         },
//         {
//             id: 9,
//             name: 'Racks',
//             description: 'Manage storage rack locations and layouts',
//             icon: 'bi-server',
//             iconColor: 'bg-warning',
//             route: '/racks'
//         },
//         {
//             id: 10,
//             name: 'Item Type',
//             description: 'Configure different types of inventory items',
//             icon: 'bi-tags',
//             iconColor: 'bg-info',
//             route: '/item-type'
//         },
//         {
//             id: 11,
//             name: 'GST',
//             description: 'Goods and Services Tax configuration',
//             icon: 'bi-percent',
//             iconColor: 'bg-danger',
//             route: '/gst'
//         }
//     ];

//     const filteredMasters = useMemo(() => {
//         if (!searchTerm.trim()) return mastersData;

//         return mastersData.filter(master =>
//             master.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             master.description.toLowerCase().includes(searchTerm.toLowerCase())
//         );
//     }, [searchTerm, mastersData]);

//     const handleCardClick = (route) => {
//         navigate(route);
//     };

//     return (
//         <div className=" page-wrapper">
//             <div className="container-fluid px-4">
//                 {/* Page Header */}
//                 <div className="row mb-2">
//                     <div className="col-12">
//                         <div className="card border-0 shadow-sm">
//                             <div className="card-body py-3">
//                                 <h4 className="mb-1 fw-semibold text-dark">All Masters</h4>
//                                 <p className="mb-0 text-muted small">Manage and configure all master data entries</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>


//                 {/* Masters Grid */}
//                 <div className="row g-3">
//                     {filteredMasters.length > 0 ? (
//                         filteredMasters.map((master) => (
//                             <div key={master.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
//                                 <div 
//                                     className="card border-0 shadow-sm h-100 hover-card mb-1"
//                                     onClick={() => handleCardClick(master.route)}
//                                     role="button"
//                                     tabIndex={0}
//                                     onKeyDown={(e) => {
//                                         if (e.key === 'Enter' || e.key === ' ') {
//                                             handleCardClick(master.route);
//                                         }
//                                     }}
//                                 >
//                                     <div className="p-3 ">
//                                         <div className={`d-flex align-items-center justify-content-center rounded-3 mb-3 ${master.iconColor} bg-opacity-10`}
//                                             style={{ width: '56px', height: '56px' }}>
//                                             <i className={`${master.icon} fs-3 text-${master.iconColor.replace('bg-', '')}`}></i>
//                                         </div>
//                                         <h5 className="card-title mb-2 fw-semibold">{master.name}</h5>
//                                         <p className="card-text text-muted small mb-3">{master.description}</p>
//                                         <div className="d-flex justify-content-between align-items-center">
//                                             <span className="badge bg-light text-dark small">Master Data</span>
//                                             <i className="bi bi-arrow-right text-primary"></i>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <div className="col-12">
//                             <div className="card border-0 shadow-sm">
//                                 <div className="card-body text-center py-5">
//                                     <i className="bi bi-inbox display-1 text-muted opacity-25"></i>
//                                     <h5 className="mt-3 text-muted">No masters found</h5>
//                                     <p className="text-muted mb-0">Try adjusting your search terms</p>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <style>{`
//                 .hover-card {
//                     transition: all 0.3s ease;
//                     cursor: pointer;
//                 }
//                 .hover-card:hover {
//                     transform: translateY(-5px);
//                     box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default AllMasters;





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
        // {
        //     id: 15,
        //     name: 'Warehouse',
        //     description: 'Manage warehouse',
        //     icon: 'bi-chat-square-text',
        //     iconBg: 'rgba(99, 102, 241, 0.1)',
        //     iconColor: '#6366f1',
        //     route: '/warehouse'
        // },
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
