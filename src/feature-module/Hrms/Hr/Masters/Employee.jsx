import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { URLS } from "../../../../Urls";
import axios from "axios";

const Employee = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    fatherName: "",
    gender: "",
    dob: "",
    bankName: "",
    bankAccountNumber: "",
    ifsc: "",
    pfNumber: "",
    uan: "",
    organizationId: "",
    designationId: "",
  });

  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    fatherName: "",
    gender: "",
    dob: "",
    bankName: "",
    bankAccountNumber: "",
    ifsc: "",
    pfNumber: "",
    uan: "",
    organizationId: "",
    designationId: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [employeesData, setEmployeesData] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const [employeesResponse, orgsResponse, designationsResponse] =
        await Promise.all([
          axios.post(
            URLS.GetHrmsEmployee,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(URLS.GetHrmsOrganizations, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(URLS.GetHrmsDesignations, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      setEmployeesData(employeesResponse?.data?.data || []);
      setOrganizations(orgsResponse?.data?.data || []);
      setDesignations(designationsResponse?.data?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setPageLoading(false);
    }
  };

  const fetchEmployees = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.post(URLS.GetHrmsEmployee,{}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployeesData(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      toast.error("Please enter First Name!");
      return;
    }
    if (!formData.lastName.trim()) {
      toast.error("Please enter Last Name!");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter Email!");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter Phone Number!");
      return;
    }
    if (!formData.password.trim()) {
      toast.error("Please enter Password!");
      return;
    }
    if (!formData.gender) {
      toast.error("Please select Gender!");
      return;
    }
    if (!formData.dob) {
      toast.error("Please select Date of Birth!");
      return;
    }
    if (!formData.organizationId) {
      toast.error("Please select Organization!");
      return;
    }
    if (!formData.designationId) {
      toast.error("Please select Designation!");
      return;
    }

    setLoading(true);

    const token = localStorage.getItem("authToken");

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post(URLS.AddHrmsEmployee, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Employee added successfully!");

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          fatherName: "",
          gender: "",
          dob: "",
          bankName: "",
          bankAccountNumber: "",
          ifsc: "",
          pfNumber: "",
          uan: "",
          organizationId: "",
          designationId: "",
        });
        setShowAddForm(false);
        fetchEmployees();
      } else {
        toast.error(response.data?.message || "Failed to add employee");
      }
    } catch (err) {
      console.error("Error adding employee:", err);
      toast.error(
        err.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setEditFormData({
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      fatherName: employee.fatherName || "",
      gender: employee.gender || "",
      dob: employee.dob || "",
      bankName: employee.bankName || "",
      bankAccountNumber: employee.bankAccountNumber || "",
      ifsc: employee.ifsc || "",
      pfNumber: employee.pfNumber || "",
      uan: employee.uan || "",
      organizationId: employee.organizationId || "",
      designationId: employee.designationId || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    if (!editFormData.firstName.trim()) {
      toast.error("First Name cannot be empty!");
      return;
    }
    if (!editFormData.lastName.trim()) {
      toast.error("Last Name cannot be empty!");
      return;
    }
    if (!editFormData.email.trim()) {
      toast.error("Email cannot be empty!");
      return;
    }
    if (!editFormData.phone.trim()) {
      toast.error("Phone cannot be empty!");
      return;
    }
    if (!editFormData.gender) {
      toast.error("Please select Gender!");
      return;
    }
    if (!editFormData.dob) {
      toast.error("Please select Date of Birth!");
      return;
    }
    if (!editFormData.organizationId) {
      toast.error("Please select Organization!");
      return;
    }
    if (!editFormData.designationId) {
      toast.error("Please select Designation!");
      return;
    }

    setActionLoading(`edit-${editingId}`);
    const token = localStorage.getItem("authToken");

    try {
      const formDataToSend = new FormData();

      Object.keys(editFormData).forEach((key) => {
        if (editFormData[key]) {
          formDataToSend.append(key, editFormData[key]);
        }
      });

      const response = await axios.post(
        `${URLS.EditHrmsEmployee}${editingId}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Employee updated successfully!");
        setEditingId(null);
        setShowEditModal(false);
        fetchEmployees();
      } else {
        toast.error(response.data?.message || "Failed to update employee");
      }
    } catch (err) {
      console.error("Error updating employee:", err);
      toast.error(
        err.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowEditModal(false);
    setEditFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      fatherName: "",
      gender: "",
      dob: "",
      bankName: "",
      bankAccountNumber: "",
      ifsc: "",
      pfNumber: "",
      uan: "",
      organizationId: "",
      designationId: "",
    });
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setActionLoading(`delete-${id}`);
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.post(
        `${URLS.DeleteHrmsEmployee}${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Employee deleted successfully!");
        fetchEmployees();
      } else {
        toast.error(response.data?.message || "Failed to delete employee");
      }
    } catch (err) {
      console.error("Error deleting employee:", err);
      toast.error(
        err.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (showAddForm) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        fatherName: "",
        gender: "",
        dob: "",
        bankName: "",
        bankAccountNumber: "",
        ifsc: "",
        pfNumber: "",
        uan: "",
        organizationId: "",
        designationId: "",
      });
    }
  };

  const getOrganizationName = (organizationId) => {
    const organization = organizations.find((org) => org.id === organizationId);
    return organization ? organization.name : "N/A";
  };

  const getDesignationName = (designationId) => {
    const designation = designations.find((des) => des.id === designationId);
    return designation ? designation.name : "N/A";
  };

  const filteredData = employeesData.filter(
    (emp) =>
      emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (pageLoading) {
    return (
      <div
        style={{
          paddingTop: "90px",
          minHeight: "100vh",
          backgroundColor: "#f4f6f9",
        }}
      >
        <div
          className="container-fluid d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading employees...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: "90px",
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
      }}
    >
      <div className="container-fluid" style={{ maxWidth: "1400px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 fw-semibold" style={{ color: "#2c3e50" }}>
            Employee Management
          </h5>
          <button
            className="btn"
            onClick={toggleAddForm}
            style={{
              backgroundColor: "#4a90e2",
              color: "white",
              border: "none",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "4px",
            }}
          >
            <i className={`bi ${showAddForm ? "bi-dash" : "bi-plus"} me-2`}></i>
            {showAddForm ? "Hide Form" : "Add Employee"}
          </button>
        </div>

        <div className="row g-3">
          {showAddForm && (
            <div className="col-lg-12">
              <div
                className="card border-0"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
              >
                <div className="card-body p-4">
                  <h6
                    className="fw-semibold mb-3 pb-2 border-bottom"
                    style={{ color: "#2c3e50" }}
                  >
                    Add Employee
                  </h6>

                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            First Name *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter First Name"
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter Last Name"
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            Father's Name
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleInputChange}
                            placeholder="Enter Father's Name"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            Gender *
                          </label>
                          <select
                            className="form-select"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            disabled={loading}
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            Date of Birth *
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            Email *
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter Email"
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter Phone Number"
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            Password *
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter Password"
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleInputChange}
                            placeholder="Enter Bank Name"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            Bank Account Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="bankAccountNumber"
                            value={formData.bankAccountNumber}
                            onChange={handleInputChange}
                            placeholder="Enter Account Number"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            IFSC Code
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="ifsc"
                            value={formData.ifsc}
                            onChange={handleInputChange}
                            placeholder="Enter IFSC Code"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            PF Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="pfNumber"
                            value={formData.pfNumber}
                            onChange={handleInputChange}
                            placeholder="Enter PF Number"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            UAN Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="uan"
                            value={formData.uan}
                            onChange={handleInputChange}
                            placeholder="Enter UAN Number"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            Organization *
                          </label>
                          <select
                            className="form-select"
                            name="organizationId"
                            value={formData.organizationId}
                            onChange={handleInputChange}
                            disabled={loading}
                            required
                          >
                            <option value="">Select Organization</option>
                            {organizations.map((org) => (
                              <option key={org.id} value={org.id}>
                                {org.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            Designation *
                          </label>
                          <select
                            className="form-select"
                            name="designationId"
                            value={formData.designationId}
                            onChange={handleInputChange}
                            disabled={loading}
                            required
                          >
                            <option value="">Select Designation</option>
                            {designations.map((designation) => (
                              <option
                                key={designation.id}
                                value={designation.id}
                              >
                                {designation.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-12">
                        <button
                          type="submit"
                          className="btn float-end"
                          disabled={loading}
                          style={{
                            backgroundColor: "#4a90e2",
                            color: "white",
                            border: "none",
                            padding: "10px 30px",
                            fontSize: "14px",
                            fontWeight: "500",
                            borderRadius: "4px",
                          }}
                        >
                          {loading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Adding...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-plus-circle me-2"></i>
                              Submit
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="col-lg-12">
            <div
              className="card border-0"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <h6 className="fw-semibold mb-0" style={{ color: "#2c3e50" }}>
                    Employees ({filteredData.length})
                  </h6>
                  <div style={{ width: "280px" }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search by Name, Email, or Phone"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th>S. No</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Organization</th>
                        <th>Designation</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((emp, index) => (
                          <tr key={emp.id}>
                            <td>{startIndex + index + 1}</td>
                            <td>
                              {emp.firstName} {emp.lastName}
                            </td>
                            <td>{emp.email}</td>
                            <td>{emp.phone}</td>
                            <td>{getOrganizationName(emp.organizationId)}</td>
                            <td>{getDesignationName(emp.designationId)}</td>
                            <td className="text-end">
                              <div className="d-inline-flex gap-1">
                                <button
                                  className="btn btn-sm"
                                  onClick={() => handleEdit(emp)}
                                  disabled={actionLoading}
                                  title="Edit"
                                  style={{
                                    backgroundColor: "#e3f2fd",
                                    color: "#4a90e2",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                                <button
                                  className="btn btn-sm"
                                  onClick={() =>
                                    handleDelete(
                                      emp.id,
                                      `${emp.firstName} ${emp.lastName}`
                                    )
                                  }
                                  disabled={
                                    actionLoading === `delete-${emp.id}`
                                  }
                                  title="Delete"
                                  style={{
                                    backgroundColor: "#ffebee",
                                    color: "#dc3545",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {actionLoading === `delete-${emp.id}` ? (
                                    <span
                                      className="spinner-border spinner-border-sm"
                                      role="status"
                                    ></span>
                                  ) : (
                                    <i className="bi bi-trash"></i>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-5">
                            <div className="text-muted">
                              <i
                                className="bi bi-inbox"
                                style={{ fontSize: "40px", opacity: 0.3 }}
                              ></i>
                              <p className="mb-0 mt-2">
                                {searchTerm
                                  ? "No employees found"
                                  : "No employees to display"}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredData.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted">Rows per page:</span>
                      <select
                        className="form-select form-select-sm"
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        style={{ width: "70px" }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <span className="text-muted">
                        {startIndex + 1}–
                        {Math.min(endIndex, filteredData.length)} of{" "}
                        {filteredData.length}
                      </span>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                        <button
                          className="btn btn-sm"
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
      </div>

      {showEditModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Employee</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelEdit}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        First Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={editFormData.firstName}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={editFormData.lastName}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Father's Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="fatherName"
                        value={editFormData.fatherName}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">Gender *</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={editFormData.gender}
                        onChange={handleEditInputChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="dob"
                        value={editFormData.dob}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">Phone *</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">Bank Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="bankName"
                        value={editFormData.bankName}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="bankAccountNumber"
                        value={editFormData.bankAccountNumber}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">IFSC Code</label>
                      <input
                        type="text"
                        className="form-control"
                        name="ifsc"
                        value={editFormData.ifsc}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">PF Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="pfNumber"
                        value={editFormData.pfNumber}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">UAN Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="uan"
                        value={editFormData.uan}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Organization *
                      </label>
                      <select
                        className="form-select"
                        name="organizationId"
                        value={editFormData.organizationId}
                        onChange={handleEditInputChange}
                        required
                      >
                        <option value="">Select Organization</option>
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Designation *
                      </label>
                      <select
                        className="form-select"
                        name="designationId"
                        value={editFormData.designationId}
                        onChange={handleEditInputChange}
                        required
                      >
                        <option value="">Select Designation</option>
                        {designations.map((designation) => (
                          <option key={designation.id} value={designation.id}>
                            {designation.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating...
                    </>
                  ) : (
                    "Update Employee"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Employee;
