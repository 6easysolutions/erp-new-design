import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { URLS } from "../../../../Urls";
import axios from "axios";

const Organization = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    orgCode: "",
    status: "active",
    adminName: "",
    adminEmail: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    orgCode: "",
    status: "active",
    adminName: "",
    adminEmail: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [organizationsData, setOrganizationsData] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = () => {
    const token = localStorage.getItem("authToken");

    setLoading(true);
    axios
      .get(URLS.GetHrmsOrganizations, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setOrganizationsData(res?.data?.data || []);
        setPageLoading(false);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching organizations:", error);
        toast.error("Failed to fetch organizations");
        setPageLoading(false);
        setLoading(false);
      });
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

    if (!formData.name.trim()) {
      toast.error("Please enter Organization Name!");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter Email!");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter Phone!");
      return;
    }
    if (!formData.orgCode.trim()) {
      toast.error("Please enter Organization Code!");
      return;
    }
    if (!formData.adminName.trim()) {
      toast.error("Please enter Admin Name!");
      return;
    }
    if (!formData.adminEmail.trim()) {
      toast.error("Please enter Admin Email!");
      return;
    }

    setLoading(true);

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(URLS.AddHrmsOrganization, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.success("Organization added successfully!");

        setFormData({
          name: "",
          email: "",
          phone: "",
          website: "",
          address: "",
          orgCode: "",
          status: "active",
          adminName: "",
          adminEmail: "",
        });
        setShowAddForm(false);
        fetchOrganizations();
      } else {
        toast.error(data.message || "Failed to add organization");
      }
    } catch (err) {
      console.error("Error adding organization:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (organization) => {
    setEditingId(organization.id);
    setEditFormData({
      name: organization.name || "",
      email: organization.email || "",
      phone: organization.phone || "",
      website: organization.website || "",
      address: organization.address || "",
      orgCode: organization.orgCode || "",
      status: organization.status || "active",
      adminName: organization.adminName || "",
      adminEmail: organization.adminEmail || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    if (!editFormData.name.trim()) {
      toast.error("Organization Name cannot be empty!");
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
    if (!editFormData.orgCode.trim()) {
      toast.error("Organization Code cannot be empty!");
      return;
    }
    if (!editFormData.adminName.trim()) {
      toast.error("Admin Name cannot be empty!");
      return;
    }
    if (!editFormData.adminEmail.trim()) {
      toast.error("Admin Email cannot be empty!");
      return;
    }

    setActionLoading(`edit-${editingId}`);

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(`${URLS.EditHrmsOrganization}${editingId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.success("Organization updated successfully!");
        setEditingId(null);
        setShowEditModal(false);
        fetchOrganizations();
      } else {
        toast.error(data.message || "Failed to update organization");
      }
    } catch (err) {
      console.error("Error updating organization:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowEditModal(false);
    setEditFormData({
      name: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      orgCode: "",
      status: "active",
      adminName: "",
      adminEmail: "",
    });
  };

  const handleStatusToggle = async (id, currentStatus, name) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activate" : "deactivate";

    if (!window.confirm(`Are you sure you want to ${action} "${name}"?`)) {
      return;
    }

    setActionLoading(`status-${id}`);

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        `${URLS.ActiveinActiveHrmsOrganization}${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (response.status === 200) {
        toast.success(`Organization ${action}d successfully!`);
        fetchOrganizations();
      } else {
        toast.error(data.message || `Failed to ${action} organization`);
      }
    } catch (err) {
      console.error(`Error ${action}ing organization:`, err);
      toast.error("Network error. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  const filteredData = organizationsData.filter(
    (org) =>
      org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.orgCode?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <p className="mt-3 text-muted">Loading organizations...</p>
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
            Organization List
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
            {showAddForm ? "Hide Form" : "Add Organization"}
          </button>
        </div>

        <div className="row g-3">
          {showAddForm && (
            <div className="col-lg-12 col-md-5">
              <div
                className="card border-0"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
              >
                <div className="card-body p-4">
                  <h6
                    className="fw-semibold mb-3 pb-2 border-bottom"
                    style={{ color: "#2c3e50" }}
                  >
                    Add Organization
                  </h6>

                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label
                            className="form-label fw-medium"
                            style={{ fontSize: "13px", color: "#495057" }}
                          >
                            Organization Name *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter Organization Name"
                            style={{
                              fontSize: "14px",
                              padding: "8px 12px",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                            }}
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label
                            className="form-label fw-medium"
                            style={{ fontSize: "13px", color: "#495057" }}
                          >
                            Email *
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter Email"
                            style={{
                              fontSize: "14px",
                              padding: "8px 12px",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                            }}
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label
                            className="form-label fw-medium"
                            style={{ fontSize: "13px", color: "#495057" }}
                          >
                            Phone *
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter Phone Number"
                            style={{
                              fontSize: "14px",
                              padding: "8px 12px",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                            }}
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label
                            className="form-label fw-medium"
                            style={{ fontSize: "13px", color: "#495057" }}
                          >
                            Website
                          </label>
                          <input
                            type="url"
                            className="form-control"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://example.com"
                            style={{
                              fontSize: "14px",
                              padding: "8px 12px",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                            }}
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label
                            className="form-label fw-medium"
                            style={{ fontSize: "13px", color: "#495057" }}
                          >
                            Address
                          </label>
                          <textarea
                            className="form-control"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter Address"
                            rows="2"
                            style={{
                              fontSize: "14px",
                              padding: "8px 12px",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                              resize: "vertical",
                            }}
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label
                            className="form-label fw-medium"
                            style={{ fontSize: "13px", color: "#495057" }}
                          >
                            Organization Code *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="orgCode"
                            value={formData.orgCode}
                            onChange={handleInputChange}
                            placeholder="Enter Organization Code"
                            style={{
                              fontSize: "14px",
                              padding: "8px 12px",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                            }}
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label
                            className="form-label fw-medium"
                            style={{ fontSize: "13px", color: "#495057" }}
                          >
                            Status
                          </label>
                          <select
                            className="form-select"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            style={{
                              fontSize: "14px",
                              padding: "8px 12px",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                            }}
                            disabled={loading}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label
                            className="form-label fw-medium"
                            style={{ fontSize: "13px", color: "#495057" }}
                          >
                            Admin Name *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="adminName"
                            value={formData.adminName}
                            onChange={handleInputChange}
                            placeholder="Enter Admin Name"
                            style={{
                              fontSize: "14px",
                              padding: "8px 12px",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                            }}
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label
                            className="form-label fw-medium"
                            style={{ fontSize: "13px", color: "#495057" }}
                          >
                            Admin Email *
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            name="adminEmail"
                            value={formData.adminEmail}
                            onChange={handleInputChange}
                            placeholder="Enter Admin Email"
                            style={{
                              fontSize: "14px",
                              padding: "8px 12px",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                            }}
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <button
                          type="submit"
                          className="btn "
                          disabled={loading}
                          style={{
                            backgroundColor: "#4a90e2",
                            color: "white",
                            border: "none",
                            padding: "10px",
                            fontSize: "14px",
                            fontWeight: "500",
                            borderRadius: "4px",
                            float: "right",
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
                      </div>{" "}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="col-lg-12 col-md-7">
            <div
              className="card border-0"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <h6 className="fw-semibold mb-0" style={{ color: "#2c3e50" }}>
                    Organizations ({filteredData.length})
                  </h6>
                  <div style={{ width: "280px" }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search by Name, Email, or Code"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        fontSize: "13px",
                        padding: "6px 12px",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                </div>

                <div className="table-responsive">
                  <table
                    className="table table-hover mb-0"
                    style={{ fontSize: "14px" }}
                  >
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th
                          className="fw-semibold py-2"
                          style={{
                            width: "5%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          S. No
                        </th>
                        <th
                          className="fw-semibold py-2"
                          style={{
                            width: "15%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          Name
                        </th>
                        <th
                          className="fw-semibold py-2"
                          style={{
                            width: "15%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          Email
                        </th>
                        <th
                          className="fw-semibold py-2"
                          style={{
                            width: "10%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          Phone
                        </th>
                        <th
                          className="fw-semibold py-2"
                          style={{
                            width: "10%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          Code
                        </th>
                        <th
                          className="fw-semibold py-2"
                          style={{
                            width: "10%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          Status
                        </th>
                        <th
                          className="fw-semibold py-2 text-end"
                          style={{
                            width: "15%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((org, index) => (
                          <tr
                            key={org.id}
                            style={{ borderBottom: "1px solid #f0f0f0" }}
                          >
                            <td className="py-2" style={{ color: "#6c757d" }}>
                              {startIndex + index + 1}
                            </td>
                            <td className="py-2" style={{ color: "#2c3e50" }}>
                              {org.name}
                            </td>
                            <td className="py-2" style={{ color: "#2c3e50" }}>
                              {org.email}
                            </td>
                            <td className="py-2" style={{ color: "#2c3e50" }}>
                              {org.phone}
                            </td>
                            <td className="py-2" style={{ color: "#2c3e50" }}>
                              {org.orgCode}
                            </td>
                            <td className="py-2">
                              <button
                                className={`btn btn-sm ${
                                  org.status === "active"
                                    ? "btn-success"
                                    : "btn-secondary"
                                }`}
                                onClick={() =>
                                  handleStatusToggle(
                                    org.id,
                                    org.status,
                                    org.name
                                  )
                                }
                                disabled={actionLoading === `status-${org.id}`}
                                style={{
                                  fontSize: "12px",
                                  padding: "2px 8px",
                                  minWidth: "70px",
                                }}
                              >
                                {actionLoading === `status-${org.id}` ? (
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  ></span>
                                ) : (
                                  org.status
                                )}
                              </button>
                            </td>
                            <td className="py-2 text-end">
                              <div className="d-inline-flex gap-1">
                                <button
                                  className="btn btn-sm"
                                  onClick={() => handleEdit(org)}
                                  disabled={actionLoading}
                                  title="Edit"
                                  style={{
                                    backgroundColor: "#e3f2fd",
                                    color: "#4a90e2",
                                    border: "none",
                                    padding: "4px 10px",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                  }}
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                                <button
                                  className="btn btn-sm"
                                  onClick={() =>
                                    handleStatusToggle(
                                      org.id,
                                      org.status,
                                      org.name
                                    )
                                  }
                                  disabled={
                                    actionLoading === `status-${org.id}`
                                  }
                                  title={
                                    org.status === "active"
                                      ? "Deactivate"
                                      : "Activate"
                                  }
                                  style={{
                                    backgroundColor:
                                      org.status === "active"
                                        ? "#fff3cd"
                                        : "#d1edff",
                                    color:
                                      org.status === "active"
                                        ? "#856404"
                                        : "#004085",
                                    border: "none",
                                    padding: "4px 10px",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                  }}
                                >
                                  {actionLoading === `status-${org.id}` ? (
                                    <span
                                      className="spinner-border spinner-border-sm"
                                      role="status"
                                    ></span>
                                  ) : org.status === "active" ? (
                                    <i className="bi bi-pause-fill"></i>
                                  ) : (
                                    <i className="bi bi-play-fill"></i>
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
                              <p
                                className="mb-0 mt-2"
                                style={{ fontSize: "14px" }}
                              >
                                {searchTerm
                                  ? "No organizations found"
                                  : "No organizations to display"}
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
                      <span className="text-muted" style={{ fontSize: "13px" }}>
                        Rows per page:
                      </span>
                      <select
                        className="form-select form-select-sm"
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        style={{
                          width: "70px",
                          fontSize: "13px",
                          padding: "4px 8px",
                          border: "1px solid #dee2e6",
                          borderRadius: "4px",
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <span className="text-muted" style={{ fontSize: "13px" }}>
                        {startIndex + 1}–
                        {Math.min(endIndex, filteredData.length)} of{" "}
                        {filteredData.length}
                      </span>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                          style={{
                            backgroundColor: "white",
                            border: "1px solid #dee2e6",
                            color: "#495057",
                            padding: "4px 10px",
                            borderRadius: "4px",
                            fontSize: "13px",
                          }}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          style={{
                            backgroundColor: "white",
                            border: "1px solid #dee2e6",
                            color: "#495057",
                            padding: "4px 10px",
                            borderRadius: "4px",
                            fontSize: "13px",
                          }}
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
                <h5 className="modal-title">Edit Organization</h5>
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
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={editFormData.name}
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
                      <label className="form-label fw-medium">Website</label>
                      <input
                        type="url"
                        className="form-control"
                        name="website"
                        value={editFormData.website}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-medium">Address</label>
                      <textarea
                        className="form-control"
                        name="address"
                        value={editFormData.address}
                        onChange={handleEditInputChange}
                        rows="2"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Organization Code *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="orgCode"
                        value={editFormData.orgCode}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">Status</label>
                      <select
                        className="form-select"
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditInputChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Admin Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="adminName"
                        value={editFormData.adminName}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Admin Email *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        name="adminEmail"
                        value={editFormData.adminEmail}
                        onChange={handleEditInputChange}
                        required
                      />
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
                    "Update Organization"
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

export default Organization;
