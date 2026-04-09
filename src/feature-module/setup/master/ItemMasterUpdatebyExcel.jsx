import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ItemMasterUpdatebyExcel = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    // Sample data - Replace with actual API data
    const [uploadedData, setUploadedData] = useState([
        {
            id: 1,
            date: '2025-06-07',
            name: 'keerthan',
            fileName: 'item_master_update.xlsx',
            uploadedBy: 'Admin',
            status: 'completed'
        },
        {
            id: 2,
            date: '2025-06-05',
            name: 'rajesh',
            fileName: 'inventory_items.xlsx',
            uploadedBy: 'Manager',
            status: 'completed'
        },
        {
            id: 3,
            date: '2025-06-03',
            name: 'priya',
            fileName: 'master_data_update.xlsx',
            uploadedBy: 'Admin',
            status: 'completed'
        }
    ]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedFile) {
            alert('Please select both date and file before submitting!');
            return;
        }
        // Add your upload logic here
        alert(`File uploaded successfully!\nDate: ${selectedDate}\nFile: ${selectedFile.name}`);
    };

    const handleDownload = (id, fileName) => {
        console.log(`Downloading file: ${fileName}`);
        alert(`Downloading: ${fileName}`);
    };

    const handleEdit = (id) => {
        console.log(`Editing record: ${id}`);
        alert(`Editing record ID: ${id}`);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setUploadedData(uploadedData.filter(item => item.id !== id));
            alert(`Record ${id} deleted successfully!`);
        }
    };

    // Filter data based on search term
    const filteredData = uploadedData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.includes(searchTerm) ||
        item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
      <div className='page-wrapper'>

      
        <div className="bg-light min-vh-100 py-4">
            <div className="container-fluid px-4">
                {/* Page Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="bg-white rounded-3 shadow-sm p-3">
                            <h4 className="mb-0 fw-semibold text-primary">
                                <i className="bi bi-file-earmark-excel me-2"></i>
                                Item Master Update By Excel
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Left Column - Upload Form */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body p-4">
                                <h5 className="card-title fw-bold mb-4">
                                    <i className="bi bi-cloud-upload text-primary me-2"></i>
                                    Add Item Master Update By Excel
                                </h5>

                                <form onSubmit={handleSubmit}>
                                    {/* Date Input */}
                                    <div className="mb-4">
                                        <label htmlFor="dateInput" className="form-label fw-semibold">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control form-control-lg"
                                            id="dateInput"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            placeholder="dd-mm-yyyy"
                                            required
                                        />
                                        <div className="form-text">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Select the date for this upload
                                        </div>
                                    </div>

                                    {/* File Input */}
                                    <div className="mb-4">
                                        <label htmlFor="fileInput" className="form-label fw-semibold">
                                            Excel File
                                        </label>
                                        <div className="position-relative">
                                            <input
                                                type="file"
                                                className="form-control form-control-lg"
                                                id="fileInput"
                                                accept=".xlsx,.xls,.csv"
                                                onChange={handleFileChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-text">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Supported formats: .xlsx, .xls, .csv
                                        </div>
                                        {selectedFile && (
                                            <div className="mt-2 p-2 bg-success bg-opacity-10 rounded border border-success border-opacity-25">
                                                <small className="text-success">
                                                    <i className="bi bi-check-circle-fill me-1"></i>
                                                    Selected: <strong>{selectedFile.name}</strong>
                                                </small>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg w-100"
                                    >
                                        <i className="bi bi-upload me-2"></i>
                                        Submit
                                    </button>
                                </form>

                                {/* Info Box */}
                                <div className="mt-4 p-3 bg-info bg-opacity-10 rounded border border-info border-opacity-25">
                                    <h6 className="fw-semibold text-info mb-2">
                                        <i className="bi bi-lightbulb me-2"></i>
                                        Upload Guidelines
                                    </h6>
                                    <ul className="small mb-0 text-muted">
                                        <li>Ensure data is properly formatted</li>
                                        <li>Check for duplicate entries</li>
                                        <li>File size should not exceed 10MB</li>
                                        <li>Use the provided template</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Data Table */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body p-4">
                                {/* Table Header with Search */}
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="card-title fw-bold mb-0">
                                        <i className="bi bi-table text-primary me-2"></i>
                                        Item Master Update By Excel
                                    </h5>
                                    <div style={{ width: '250px' }}>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0">
                                                <i className="bi bi-search text-muted"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 ps-0"
                                                placeholder="Search by date"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="fw-semibold">S. No</th>
                                                <th className="fw-semibold">Date</th>
                                                <th className="fw-semibold">Name</th>
                                                <th className="fw-semibold">Download</th>
                                                <th className="fw-semibold text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.length > 0 ? (
                                                paginatedData.map((item, index) => (
                                                    <tr key={item.id}>
                                                        <td className="fw-medium">{startIndex + index + 1}</td>
                                                        <td>{item.date}</td>
                                                        <td>
                                                            <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                                                {item.name}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => handleDownload(item.id, item.fileName)}
                                                            >
                                                                <i className="bi bi-download me-1"></i>
                                                                Download
                                                            </button>
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="btn-group" role="group">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => handleEdit(item.id)}
                                                                    title="Edit"
                                                                >
                                                                    <i className="bi bi-pencil-square"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleDelete(item.id)}
                                                                    title="Delete"
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-5">
                                                        <div className="text-muted">
                                                            <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                                                            <h6>No records found</h6>
                                                            <p className="small">Try adjusting your search criteria</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Footer */}
                                {filteredData.length > 0 && (
                                    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="text-muted small">Rows per page:</span>
                                            <select
                                                className="form-select form-select-sm"
                                                style={{ width: '80px' }}
                                                value={rowsPerPage}
                                                onChange={(e) => {
                                                    setRowsPerPage(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                <option value={5}>5</option>
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                            </select>
                                        </div>

                                        <div className="d-flex align-items-center gap-3">
                                            <span className="text-muted small">
                                                {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
                                            </span>
                                            <div className="btn-group" role="group">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={handlePreviousPage}
                                                    disabled={currentPage === 1}
                                                >
                                                    <i className="bi bi-chevron-left"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={handleNextPage}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    <i className="bi bi-chevron-right"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Footer */}
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="flex-shrink-0">
                                                <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                                                    <i className="bi bi-file-earmark-spreadsheet fs-4 text-primary"></i>
                                                </div>
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                <h4 className="mb-0 fw-bold">{uploadedData.length}</h4>
                                                <p className="text-muted mb-0 small">Total Uploads</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="flex-shrink-0">
                                                <div className="bg-success bg-opacity-10 rounded-3 p-3">
                                                    <i className="bi bi-check-circle fs-4 text-success"></i>
                                                </div>
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                <h4 className="mb-0 fw-bold">{uploadedData.length}</h4>
                                                <p className="text-muted mb-0 small">Completed</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="flex-shrink-0">
                                                <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                                                    <i className="bi bi-clock-history fs-4 text-warning"></i>
                                                </div>
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                <h4 className="mb-0 fw-bold">0</h4>
                                                <p className="text-muted mb-0 small">Pending</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="flex-shrink-0">
                                                <div className="bg-info bg-opacity-10 rounded-3 p-3">
                                                    <i className="bi bi-calendar-event fs-4 text-info"></i>
                                                </div>
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                <h4 className="mb-0 fw-bold">Today</h4>
                                                <p className="text-muted mb-0 small">Last Upload</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
};

export default ItemMasterUpdatebyExcel;
