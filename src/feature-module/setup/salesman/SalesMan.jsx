
import React, { useState, useEffect } from 'react';
import { User, Plus, Edit2, Trash2, Search, Filter } from 'react-feather';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Select from "react-select";
import { URLS } from '../../../Urls';

const SalesMan = () => {
    const [formData, setFormData] = useState({
        store: '',
        type: '',
        name: '',
        employeeCode: '',
        address: '',
        mobile: '',
        designation: ''
    });

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);

    const [stores, setStores] = useState([]);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await fetch(URLS.GetAllStore, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setStores(data.data.map(store => ({ label: store.storeName, value: store.id })));
                }
            } catch (error) {
                console.error("Error fetching stores:", error);
            }
        };
        fetchStores();
        fetchSalesmen();
    }, []);

    const fetchSalesmen = async () => {
        try {
            const response = await fetch(URLS.GetSalesmans, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setEmployees(data.data);
            }
        } catch (error) {
            console.error("Error fetching salesmen:", error);
        } finally {
            setLoading(false);
        }
    };

    const [employeeTypes] = useState([
        { label: 'Salesman', value: 'create salesman' },
        { label: 'Employee', value: 'create employee' },
    ]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.store || !formData.type) {
            alert("Please select Store and Employee Type.");
            return;
        }

        const payload = {
            storeId: formData.store,
            employeeType: formData.type, // Map formData.type to employeeType
            name: formData.name,
            code: formData.employeeCode,
            designation: formData.designation,
            address: formData.address,
            mobile: formData.mobile,
            status: "active"
        };

        const url = isEdit ? `${URLS.EditSalesman}${editId}` : URLS.AddSalesman;
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.success) {
                alert(data.message);
                fetchSalesmen();
                resetForm();
            } else {
                alert(data.message || "Operation failed");
            }
        } catch (error) {
            console.error("Error saving salesman:", error);
            alert("An error occurred while saving.");
        }
    };

    const handleEdit = (rowData) => {
        setIsEdit(true);
        setEditId(rowData.id);
        const selectedStore = stores.find(s => s.value === rowData.storeId);

        setFormData({
            store: rowData.storeId,
            type: rowData.employeeName || rowData.employeeType, // Handle both for safety
            name: rowData.name,
            employeeCode: rowData.code,
            address: rowData.address,
            mobile: rowData.mobile,
            designation: rowData.designation
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this salesman?")) return;

        try {
            const response = await fetch(`${URLS.DeleteSalesman}${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                alert(data.message);
                fetchSalesmen();
            } else {
                alert(data.message || "Delete failed");
            }
        } catch (error) {
            console.error("Error deleting salesman:", error);
            alert("An error occurred while deleting.");
        }
    };

    const resetForm = () => {
        setFormData({
            store: '',
            employeeType: '',
            employeeName: '',
            employeeCode: '',
            address: '',
            mobile: '',
            designation: ''
        });
        setIsEdit(false);
        setEditId(null);
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="d-flex gap-2">
                <button className="btn btn-icon btn-sm btn-light-primary" title="Edit" onClick={() => handleEdit(rowData)}>
                    <Edit2 size={16} />
                </button>
                <button className="btn btn-icon btn-sm btn-light-danger" title="Delete" onClick={() => handleDelete(rowData.id)}>
                    <Trash2 size={16} />
                </button>
            </div>
        );
    };

    const typeBodyTemplate = (rowData) => {
        return (
            <span className={`badge ${rowData.employeeType === 'create salesman' ? 'bg-light-info text-info' : 'bg-light-success text-success'}`}>
                {rowData.employeeType === 'create salesman' ? 'Salesman' : 'Employee'}
            </span>
        );
    };

    return (
        <div className="page-wrapper">
            <div className="content">
                <div className="page-header">
                    <div className="page-title">
                        <h4>Salesman Management</h4>
                        <h6>Add and Manage Sales Employees</h6>
                    </div>
                </div>

                <div className="row">
                    {/* Add Employee Form */}
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header border-bottom-0">
                                <h5 className="card-title d-flex align-items-center mb-0">
                                    <span className="bg-light-primary p-2 rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                        <Plus size={18} className="text-primary" />
                                    </span>
                                    {isEdit ? 'Edit Salesman' : 'Add New Salesman'}
                                </h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                            <label className="form-label">Store</label>
                                            <Select
                                                className="w-100"
                                                options={stores}
                                                value={stores.find(option => option.value === formData.store)}
                                                onChange={(option) => handleSelectChange('store', option.value)}
                                                placeholder="Select Store"
                                                classNamePrefix="react-select"
                                            />
                                        </div>

                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                            <label className="form-label">Employee Type</label>
                                            <Select
                                                className="w-100"
                                                options={employeeTypes}
                                                value={employeeTypes.find(option => option.value === formData.type)}
                                                onChange={(option) => handleSelectChange('type', option.value)}
                                                placeholder="Select Type"
                                                classNamePrefix="react-select"
                                            />
                                        </div>

                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                            <label className="form-label">Employee Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Enter Name"

                                            />
                                        </div>

                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                            <label className="form-label">Employee Code</label>
                                            <input
                                                type="text"
                                                name="employeeCode"
                                                className="form-control"
                                                value={formData.employeeCode}
                                                onChange={handleInputChange}
                                                placeholder="Enter Code"
                                            />
                                        </div>

                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                            <label className="form-label">Designation</label>
                                            <input
                                                type="text"
                                                name="designation"
                                                className="form-control"
                                                value={formData.designation}
                                                onChange={handleInputChange}
                                                placeholder="Enter Designation"
                                            />
                                        </div>

                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                            <label className="form-label">Mobile</label>
                                            <input
                                                type="text"
                                                name="mobile"
                                                className="form-control"
                                                value={formData.mobile}
                                                onChange={handleInputChange}
                                                placeholder="Enter Mobile"
                                            />
                                        </div>

                                        <div className="col-lg-6 col-md-8 col-sm-12">
                                            <label className="form-label">Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                className="form-control"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="Enter Address"
                                            />
                                        </div>

                                        <div className="col-12 d-flex justify-content-end align-items-end mt-4">
                                            <button type="button" className="btn btn-secondary me-2" onClick={resetForm}>Cancel</button>
                                            <button type="submit" className="btn btn-primary d-flex align-items-center">
                                                {isEdit ? <Edit2 size={16} className="me-1" /> : <Plus size={16} className="me-1" />}
                                                {isEdit ? 'Update Employee' : 'Add Employee'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Employee List Table */}
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header border-bottom-0 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <h5 className="card-title mb-0 d-flex align-items-center">
                                    <span className="bg-light-info p-2 rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                        <User size={18} className="text-info" />
                                    </span>
                                    Salesman List
                                </h5>
                                <div className="search-set">
                                    <div className="search-input">
                                        <a className="btn btn-searchset"><Search size={16} /></a>
                                        <div className="dataTables_filter">
                                            <label> <input type="search" className="form-control" placeholder="Search..." /></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <DataTable value={employees} paginator rows={5} rowsPerPageOptions={[5, 10, 25]}
                                        className="p-datatable-striped" emptyMessage="No employees found.">
                                        <Column field="id" header="S.No" style={{ width: '5%' }}></Column>
                                        <Column field="name" header="Employee Name" ></Column>
                                        <Column field="code" header="Code" ></Column>
                                        <Column field="Store.storeName" header="Store" ></Column>
                                        <Column field="designation" header="Designation" ></Column>
                                        <Column field="mobile" header="Mobile" ></Column>
                                        <Column field="employeeType" header="Type" body={typeBodyTemplate}></Column>
                                        <Column body={actionBodyTemplate} header="Action" style={{ width: '10%' }}></Column>
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SalesMan;