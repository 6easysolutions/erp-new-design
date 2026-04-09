import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router";
import { URLS } from "../../../Urls";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

const Holidays = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: new Date(),
    name: "",
    type: "Public",
  });

  const [editFormData, setEditFormData] = useState({
    date: new Date(),
    name: "",
    type: "Public",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [holidaysData, setHolidaysData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = () => {
    const token = localStorage.getItem("authToken");

    setLoading(true);
    axios
      .post(URLS.GetHrmsHoliday,{}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Convert date strings to Date objects for display
        const formattedData = (res?.data?.holidays || []).map((holiday) => ({
          ...holiday,
          date: new Date(holiday.date),
        }));
        setHolidaysData(formattedData);
        setPageLoading(false);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching holidays:", error);
        toast.error("Failed to fetch holidays");
        setPageLoading(false);
        setLoading(false);
      });
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.name.trim()) {
      errors.name = "Holiday Name is required";
    }

    if (!data.date) {
      errors.date = "Date is required";
    }

    if (!data.type) {
      errors.type = "Holiday Type is required";
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

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date: date,
    }));
    if (validationErrors.date) {
      setValidationErrors((prev) => ({
        ...prev,
        date: "",
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

  const handleEditDateChange = (date) => {
    setEditFormData((prev) => ({
      ...prev,
      date: date,
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

    // Format date to YYYY-MM-DD for API
    const formattedData = {
      ...formData,
      date: formData.date.toISOString().split("T")[0],
    };

    try {
      const response = await axios.post(URLS.AddHrmsHoliday, formattedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Holiday added successfully!");
        setFormData({
          date: new Date(),
          name: "",
          type: "Public",
        });
        setValidationErrors({});
        fetchHolidays();
      } else {
        toast.error(response.data?.message || "Failed to add holiday");
      }
    } catch (err) {
      console.error("Error adding holiday:", err);
      toast.error(
        err.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (holiday) => {
    setEditingId(holiday.id);
    setEditFormData({
      date: new Date(holiday.date),
      name: holiday.name || "",
      type: holiday.type || "Public",
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

    setActionLoading(`edit-${editingId}`);

    const token = localStorage.getItem("authToken");

    // Format date to YYYY-MM-DD for API
    const formattedData = {
      ...editFormData,
      date: editFormData.date.toISOString().split("T")[0],
    };

    try {
      const response = await axios.post(
        `${URLS.EditHrmsHoliday}${editingId}`,
        formattedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Holiday updated successfully!");
        setEditingId(null);
        setShowEditModal(false);
        setEditFormData({
          date: new Date(),
          name: "",
          type: "Public",
        });
        fetchHolidays();
      } else {
        toast.error(response.data?.message || "Failed to update holiday");
      }
    } catch (err) {
      console.error("Error updating holiday:", err);
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
      date: new Date(),
      name: "",
      type: "Public",
    });
    setValidationErrors({});
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}" holiday? This action cannot be undone.`
      )
    ) {
      return;
    }

    setActionLoading(`delete-${id}`);

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.post(`${URLS.DeleteHrmsHoliday}${id}`, {},{
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        toast.success("Holiday deleted successfully!");
        fetchHolidays();
      } else {
        toast.error(response.data?.message || "Failed to delete holiday");
      }
    } catch (err) {
      console.error("Error deleting holiday:", err);
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

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "Public":
        return "badge bg-primary";
      case "Regional":
        return "badge bg-success";
      case "National":
        return "badge bg-warning";
      case "Company":
        return "badge bg-info";
      case "Optional":
        return "badge bg-secondary";
      default:
        return "badge bg-secondary";
    }
  };

  const filteredData = holidaysData.filter(
    (holiday) =>
      holiday.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      holiday.type?.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Sort by date (most recent first)
  const sortedHolidays = [...filteredData].sort((a, b) => b.date - a.date);

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
            <p className="mt-3 text-muted">Loading holidays...</p>
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
            Holiday List
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
                  Add Holiday
                </h6>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      className="form-label fw-medium"
                      style={{ fontSize: "13px", color: "#495057" }}
                    >
                      Holiday Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        validationErrors.name ? "is-invalid" : ""
                      }`}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter Holiday Name (e.g., Diwali, Christmas)"
                      style={{
                        fontSize: "14px",
                        padding: "8px 12px",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                      }}
                      disabled={loading}
                      required
                    />
                    {validationErrors.name && (
                      <div className="invalid-feedback">
                        {validationErrors.name}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      className="form-label fw-medium"
                      style={{ fontSize: "13px", color: "#495057" }}
                    >
                      Date *
                    </label>
                    <DatePicker
                      selected={formData.date}
                      onChange={handleDateChange}
                      className={`form-control ${
                        validationErrors.date ? "is-invalid" : ""
                      }`}
                      dateFormat="MMMM d, yyyy"
                      placeholderText="Select Date"
                      minDate={new Date()}
                      style={{
                        fontSize: "14px",
                        padding: "8px 12px",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        width: "100%",
                      }}
                      required
                    />
                    {validationErrors.date && (
                      <div className="invalid-feedback">
                        {validationErrors.date}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      className="form-label fw-medium"
                      style={{ fontSize: "13px", color: "#495057" }}
                    >
                      Holiday Type *
                    </label>
                    <select
                      className={`form-select ${
                        validationErrors.type ? "is-invalid" : ""
                      }`}
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      style={{
                        fontSize: "14px",
                        padding: "8px 12px",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                      }}
                      disabled={loading}
                      required
                    >
                      <option value="Public">Public Holiday</option>
                      <option value="National">National Holiday</option>
                    </select>
                    {validationErrors.type && (
                      <div className="invalid-feedback">
                        {validationErrors.type}
                      </div>
                    )}
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
                        <i className="bi bi-calendar-plus me-2"></i>
                        Add Holiday
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
                    Holidays ({filteredData.length})
                  </h6>
                  <div style={{ width: "280px" }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search by Name or Type"
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
                            width: "25%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          Holiday Name
                        </th>
                        <th
                          className="fw-semibold py-2"
                          style={{
                            width: "25%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          Date
                        </th>
                        <th
                          className="fw-semibold py-2"
                          style={{
                            width: "20%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          Type
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
                        paginatedData.map((holiday, index) => (
                          <tr
                            key={holiday.id}
                            style={{ borderBottom: "1px solid #f0f0f0" }}
                          >
                            <td className="py-2" style={{ color: "#6c757d" }}>
                              {startIndex + index + 1}
                            </td>
                            <td className="py-2" style={{ color: "#2c3e50" }}>
                              <div className="d-flex align-items-center">
                                <div style={{ fontWeight: "500" }}>
                                  {holiday.name}
                                </div>
                              </div>
                            </td>
                            <td className="py-2" style={{ color: "#2c3e50" }}>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-calendar-event me-2 text-primary"></i>
                                <span style={{ fontWeight: "500" }}>
                                  {formatDate(holiday.date)}
                                </span>
                              </div>
                            </td>
                            <td className="py-2">
                              <span
                                className={getTypeBadgeColor(holiday.type)}
                                style={{ fontSize: "12px" }}
                              >
                                {holiday.type}
                              </span>
                            </td>
                            <td className="py-2 text-end">
                              <div className="d-inline-flex gap-1">
                                <button
                                  className="btn btn-sm"
                                  onClick={() => handleEdit(holiday)}
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
                                    handleDelete(holiday.id, holiday.name)
                                  }
                                  disabled={
                                    actionLoading === `delete-${holiday.id}`
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
                                  {actionLoading === `delete-${holiday.id}` ? (
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
                          <td colSpan="5" className="text-center py-5">
                            <div className="text-muted">
                              <i
                                className="bi bi-calendar-x"
                                style={{ fontSize: "40px", opacity: 0.3 }}
                              ></i>
                              <p
                                className="mb-0 mt-2"
                                style={{ fontSize: "14px" }}
                              >
                                {searchTerm
                                  ? "No holidays found"
                                  : "No holidays to display"}
                              </p>
                              {!searchTerm && holidaysData.length === 0 && (
                                <small className="text-muted">
                                  Click "Add Holiday" to create your first
                                  holiday
                                </small>
                              )}
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
          <div className="modal-dialog modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Holiday</h5>
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
                    <div className="col-12 mb-3">
                      <label className="form-label fw-medium">
                        Holiday Name *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          validationErrors.name ? "is-invalid" : ""
                        }`}
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditInputChange}
                        placeholder="Enter Holiday Name"
                        required
                      />
                      {validationErrors.name && (
                        <div className="invalid-feedback">
                          {validationErrors.name}
                        </div>
                      )}
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-medium">Date *</label>
                      <DatePicker
                        selected={editFormData.date}
                        onChange={handleEditDateChange}
                        className={`form-control ${
                          validationErrors.date ? "is-invalid" : ""
                        }`}
                        dateFormat="MMMM d, yyyy"
                        placeholderText="Select Date"
                        minDate={new Date()}
                        style={{
                          width: "100%",
                        }}
                        required
                      />
                      {validationErrors.date && (
                        <div className="invalid-feedback">
                          {validationErrors.date}
                        </div>
                      )}
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-medium">
                        Holiday Type *
                      </label>
                      <select
                        className={`form-select ${
                          validationErrors.type ? "is-invalid" : ""
                        }`}
                        name="type"
                        value={editFormData.type}
                        onChange={handleEditInputChange}
                        required
                      >
                        <option value="Public">Public Holiday</option>
                        <option value="National">National Holiday</option>
                      </select>
                      {validationErrors.type && (
                        <div className="invalid-feedback">
                          {validationErrors.type}
                        </div>
                      )}
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
                    "Update Holiday"
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

export default Holidays;
