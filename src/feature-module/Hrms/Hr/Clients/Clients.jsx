import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router";
import { URLS } from "../../../../Urls";
import axios from "axios";

const Clients = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    phone: "",
    address: "",
    gstNo: "",
    notes: "",
  });

  const [editFormData, setEditFormData] = useState({
    clientName: "",
    email: "",
    phone: "",
    address: "",
    gstNo: "",
    notes: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    const token = localStorage.getItem("authToken");

    setLoading(true);
    axios
      .get(URLS.GetHrmsClients, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setClientsData(res?.data?.data || []);
        setPageLoading(false);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching clients:", error);
        toast.error("Failed to fetch clients");
        setPageLoading(false);
        setLoading(false);
      });
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.clientName.trim()) {
      errors.clientName = "Client Name is required";
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (data.phone && !/^[0-9]{10}$/.test(data.phone)) {
      errors.phone = "Phone number must be 10 digits";
    }

    if (
      data.gstNo &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        data.gstNo
      )
    ) {
      errors.gstNo = "Invalid GST number format";
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
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

    // Validate form
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.post(URLS.AddHrmsClients, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Client added successfully!");
        setFormData({
          clientName: "",
          email: "",
          phone: "",
          address: "",
          gstNo: "",
          notes: "",
        });
        setValidationErrors({});
        fetchClients();
      } else {
        toast.error(response.data?.message || "Failed to add client");
      }
    } catch (err) {
      console.error("Error adding client:", err);
      toast.error(
        err.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setEditingId(client.id);
    setEditFormData({
      clientName: client.clientName || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      gstNo: client.gstNo || "",
      notes: client.notes || "",
    });
    setShowEditModal(true);
    setValidationErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    // Validate edit form
    const errors = validateForm(editFormData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix the validation errors");
      return;
    }

    if (!editFormData.clientName.trim()) {
      toast.error("Client Name cannot be empty!");
      return;
    }

    setActionLoading(`edit-${editingId}`);

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.put(
        `${URLS.EditHrmsClients}${editingId}`,
        editFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Client updated successfully!");
        setEditingId(null);
        setShowEditModal(false);
        setEditFormData({
          clientName: "",
          email: "",
          phone: "",
          address: "",
          gstNo: "",
          notes: "",
        });
        fetchClients();
      } else {
        toast.error(response.data?.message || "Failed to update client");
      }
    } catch (err) {
      console.error("Error updating client:", err);
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
      clientName: "",
      email: "",
      phone: "",
      address: "",
      gstNo: "",
      notes: "",
    });
    setValidationErrors({});
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
      const response = await axios.delete(`${URLS.DeleteHrmsClients}${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        toast.success("Client deleted successfully!");
        fetchClients();
      } else {
        toast.error(response.data?.message || "Failed to delete client");
      }
    } catch (err) {
      console.error("Error deleting client:", err);
      toast.error(
        err.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleBack = () => {
    navigate("/all-masters");
  };

  const totalPages = Math.ceil(clientsData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = clientsData.slice(startIndex, endIndex);

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
            <p className="mt-3 text-muted">Loading clients...</p>
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
            Client List
          </h5>
          <button
            className="btn d-flex align-items-center gap-2 px-3 py-2"
            onClick={handleBack}
            style={{
              backgroundColor: "#4a90e2",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <i className="bi bi-arrow-left"></i>
            Back
          </button>
        </div>
        <div className="row g-3">
          <div className="col-lg-4 col-md-5">
            <div
              className="card border-0"
              style={{
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                height: "fit-content",
              }}
            >
              <div className="card-body p-4">
                <h6
                  className="fw-semibold mb-3 pb-2 border-bottom"
                  style={{ color: "#2c3e50" }}
                >
                  Add Client
                </h6>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      className="form-label fw-medium"
                      style={{ fontSize: "13px", color: "#495057" }}
                    >
                      Client Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        validationErrors.clientName ? "is-invalid" : ""
                      }`}
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      placeholder="Enter Client Name"
                      style={{
                        fontSize: "14px",
                        padding: "8px 12px",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                      }}
                      disabled={loading}
                      required
                    />
                    {validationErrors.clientName && (
                      <div className="invalid-feedback">
                        {validationErrors.clientName}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      className="form-label fw-medium"
                      style={{ fontSize: "13px", color: "#495057" }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${
                        validationErrors.email ? "is-invalid" : ""
                      }`}
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter Email Address"
                      style={{
                        fontSize: "14px",
                        padding: "8px 12px",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                      }}
                      disabled={loading}
                    />
                    {validationErrors.email && (
                      <div className="invalid-feedback">
                        {validationErrors.email}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      className="form-label fw-medium"
                      style={{ fontSize: "13px", color: "#495057" }}
                    >
                      Phone
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        validationErrors.phone ? "is-invalid" : ""
                      }`}
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
                    />
                    {validationErrors.phone && (
                      <div className="invalid-feedback">
                        {validationErrors.phone}
                      </div>
                    )}
                  </div>

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
                      style={{
                        fontSize: "14px",
                        padding: "8px 12px",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        minHeight: "80px",
                      }}
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      className="form-label fw-medium"
                      style={{ fontSize: "13px", color: "#495057" }}
                    >
                      GST Number
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        validationErrors.gstNo ? "is-invalid" : ""
                      }`}
                      name="gstNo"
                      value={formData.gstNo}
                      onChange={handleInputChange}
                      placeholder="Enter GST Number"
                      style={{
                        fontSize: "14px",
                        padding: "8px 12px",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                      }}
                      disabled={loading}
                    />
                    {validationErrors.gstNo && (
                      <div className="invalid-feedback">
                        {validationErrors.gstNo}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      className="form-label fw-medium"
                      style={{ fontSize: "13px", color: "#495057" }}
                    >
                      Notes
                    </label>
                    <textarea
                      className="form-control"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Enter Notes"
                      style={{
                        fontSize: "14px",
                        padding: "8px 12px",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        minHeight: "60px",
                      }}
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn w-100"
                    disabled={loading}
                    style={{
                      backgroundColor: "#4a90e2",
                      color: "white",
                      border: "none",
                      padding: "10px",
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
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-8 col-md-7">
            <div
              className="card border-0"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <h6 className="fw-semibold mb-0" style={{ color: "#2c3e50" }}>
                    Clients ({clientsData.length})
                  </h6>
                  <div style={{ width: "280px" }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search by Name, Email or Phone"
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
                            width: "20%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          Client Name
                        </th>
                        <th
                          className="fw-semibold py-2"
                          style={{
                            width: "20%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          Email
                        </th>
                        <th
                          className="fw-semibold py-2"
                          style={{
                            width: "15%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          Phone
                        </th>
                        <th
                          className="fw-semibold py-2"
                          style={{
                            width: "15%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          GST No
                        </th>
                        <th
                          className="fw-semibold py-2 text-end"
                          style={{
                            width: "10%",
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
                        paginatedData.map((client, index) => (
                          <tr
                            key={client.id}
                            style={{ borderBottom: "1px solid #f0f0f0" }}
                          >
                            <td className="py-2" style={{ color: "#6c757d" }}>
                              {startIndex + index + 1}
                            </td>
                            <td className="py-2" style={{ color: "#2c3e50" }}>
                              <div className="d-flex align-items-center">
                                <div style={{ fontWeight: "500" }}>
                                  {client.clientName}
                                </div>
                              </div>
                              {client.address && (
                                <small
                                  className="text-muted d-block mt-1"
                                  style={{ fontSize: "12px" }}
                                >
                                  {client.address.length > 30
                                    ? `${client.address.substring(0, 30)}...`
                                    : client.address}
                                </small>
                              )}
                            </td>
                            <td className="py-2" style={{ color: "#2c3e50" }}>
                              {client.email || "-"}
                            </td>
                            <td className="py-2" style={{ color: "#2c3e50" }}>
                              {client.phone || "-"}
                            </td>
                            <td className="py-2" style={{ color: "#2c3e50" }}>
                              {client.gstNo || "-"}
                            </td>
                            <td className="py-2 text-end">
                              <div className="d-inline-flex gap-1">
                                <button
                                  className="btn btn-sm"
                                  onClick={() => handleEdit(client)}
                                  disabled={actionLoading}
                                  title="Edit"
                                  style={{
                                    backgroundColor: "#e3f2fd",
                                    color: "#4a90e2",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                  }}
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                                <button
                                  className="btn btn-sm"
                                  onClick={() =>
                                    handleDelete(client.id, client.clientName)
                                  }
                                  disabled={
                                    actionLoading === `delete-${client.id}`
                                  }
                                  title="Delete"
                                  style={{
                                    backgroundColor: "#ffebee",
                                    color: "#dc3545",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                  }}
                                >
                                  {actionLoading === `delete-${client.id}` ? (
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
                          <td colSpan="6" className="text-center py-5">
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
                                  ? "No clients found"
                                  : "No clients to display"}
                              </p>
                              {!searchTerm && clientsData.length === 0 && (
                                <small className="text-muted">
                                  Click "Submit" to create your first client
                                </small>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {clientsData.length > 0 && (
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
                        {Math.min(endIndex, clientsData.length)} of{" "}
                        {clientsData.length}
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
                <h5 className="modal-title">Edit Client</h5>
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
                        Client Name *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          validationErrors.clientName ? "is-invalid" : ""
                        }`}
                        name="clientName"
                        value={editFormData.clientName}
                        onChange={handleEditInputChange}
                        placeholder="Enter Client Name"
                        required
                      />
                      {validationErrors.clientName && (
                        <div className="invalid-feedback">
                          {validationErrors.clientName}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">Email</label>
                      <input
                        type="email"
                        className={`form-control ${
                          validationErrors.email ? "is-invalid" : ""
                        }`}
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditInputChange}
                        placeholder="Enter Email Address"
                      />
                      {validationErrors.email && (
                        <div className="invalid-feedback">
                          {validationErrors.email}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">Phone</label>
                      <input
                        type="text"
                        className={`form-control ${
                          validationErrors.phone ? "is-invalid" : ""
                        }`}
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleEditInputChange}
                        placeholder="Enter Phone Number"
                      />
                      {validationErrors.phone && (
                        <div className="invalid-feedback">
                          {validationErrors.phone}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">GST Number</label>
                      <input
                        type="text"
                        className={`form-control ${
                          validationErrors.gstNo ? "is-invalid" : ""
                        }`}
                        name="gstNo"
                        value={editFormData.gstNo}
                        onChange={handleEditInputChange}
                        placeholder="Enter GST Number"
                      />
                      {validationErrors.gstNo && (
                        <div className="invalid-feedback">
                          {validationErrors.gstNo}
                        </div>
                      )}
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-medium">Address</label>
                      <textarea
                        className="form-control"
                        name="address"
                        value={editFormData.address}
                        onChange={handleEditInputChange}
                        placeholder="Enter Address"
                        rows="3"
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-medium">Notes</label>
                      <textarea
                        className="form-control"
                        name="notes"
                        value={editFormData.notes}
                        onChange={handleEditInputChange}
                        placeholder="Enter Notes"
                        rows="2"
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
                    "Update Client"
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

export default Clients;
