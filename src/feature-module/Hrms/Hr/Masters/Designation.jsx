import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router";
import { URLS } from "../../../../Urls";
import axios from "axios";


const Designation = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    departmentId: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    departmentId: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [designationsData, setDesignationsData] = useState([]);
  const [departmentsData, setDepartmentsData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const token = localStorage.getItem("authToken");

    try {
      setLoading(true);

      const [designationsResponse, departmentsResponse] = await Promise.all([
        axios.get(URLS.GetHrmsDesignations, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(URLS.GetHrmsDepartments, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDesignationsData(designationsResponse?.data?.data || []);
      setDepartmentsData(departmentsResponse?.data?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setPageLoading(false);
      setLoading(false);
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

    if (!formData.name.trim()) {
      toast.error("Please enter Designation Name!");
      return;
    }
    if (!formData.departmentId) {
      toast.error("Please select a Department!");
      return;
    }

    setLoading(true);

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.post(URLS.AddHrmsDesignation, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        toast.success("Designation added successfully!");
        setFormData({
          name: "",
          departmentId: "",
        });
        fetchInitialData();
      } else {
        toast.error(response.data?.message || "Failed to add designation");
      }
    } catch (err) {
      console.error("Error adding designation:", err);
      toast.error(
        err.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (designation) => {
    setEditingId(designation.id);
    setEditFormData({
      name: designation.name || "",
      departmentId: designation.departmentId || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    if (!editFormData.name.trim()) {
      toast.error("Designation Name cannot be empty!");
      return;
    }
    if (!editFormData.departmentId) {
      toast.error("Please select a Department!");
      return;
    }

    setActionLoading(`edit-${editingId}`);

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.put(
        `${URLS.EditHrmsDesignation}${editingId}`,
        editFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Designation updated successfully!");
        setEditingId(null);
        setShowEditModal(false);
        fetchInitialData();
      } else {
        toast.error(response.data?.message || "Failed to update designation");
      }
    } catch (err) {
      console.error("Error updating designation:", err);
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
      name: "",
      departmentId: "",
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
      const response = await axios.put(
        `${URLS.DeleteHrmsDesignation}${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Designation deleted successfully!");
        fetchInitialData();
      } else {
        toast.error(response.data?.message || "Failed to delete designation");
      }
    } catch (err) {
      console.error("Error deleting designation:", err);
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

  const getDepartmentName = (departmentId) => {
    const department = departmentsData.find((dept) => dept.id === departmentId);
    return department ? department.name : "N/A";
  };

  const filteredData = designationsData.filter(
    (designation) =>
      designation.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDepartmentName(designation.departmentId)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
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
            <p className="mt-3 text-muted">Loading designations...</p>
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
            Designation List
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
                  Add Designation
                </h6>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      className="form-label fw-medium"
                      style={{ fontSize: "13px", color: "#495057" }}
                    >
                      Designation Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter Designation Name"
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

                  <div className="mb-3">
                    <label
                      className="form-label fw-medium"
                      style={{ fontSize: "13px", color: "#495057" }}
                    >
                      Department *
                    </label>
                    <select
                      className="form-select"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                      style={{
                        fontSize: "14px",
                        padding: "8px 12px",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                      }}
                    >
                      <option value="">Select Department</option>
                      {departmentsData.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
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
                    Designations ({filteredData.length})
                  </h6>
                  <div style={{ width: "280px" }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search by Designation or Department"
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
                            width: "30%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          Designation Name
                        </th>
                        <th
                          className="fw-semibold py-2"
                          style={{
                            width: "30%",
                            fontSize: "13px",
                            color: "#495057",
                          }}
                        >
                          Department
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
                        paginatedData.map((designation, index) => (
                          <tr
                            key={designation.id}
                            style={{ borderBottom: "1px solid #f0f0f0" }}
                          >
                            <td className="py-2" style={{ color: "#6c757d" }}>
                              {startIndex + index + 1}
                            </td>
                            <td className="py-2" style={{ color: "#2c3e50" }}>
                              <div className="d-flex align-items-center">
                                <div style={{ fontWeight: "500" }}>
                                  {designation.name}
                                </div>
                              </div>
                            </td>
                            <td className="py-2" style={{ color: "#2c3e50" }}>
                              <div className="d-flex align-items-center">
                                <div style={{ fontWeight: "500" }}>
                                  {getDepartmentName(designation.departmentId)}
                                </div>
                              </div>
                            </td>
                            <td className="py-2 text-end">
                              <div className="d-inline-flex gap-1">
                                <button
                                  className="btn btn-sm"
                                  onClick={() => handleEdit(designation)}
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
                                    handleDelete(
                                      designation.id,
                                      designation.name
                                    )
                                  }
                                  disabled={
                                    actionLoading === `delete-${designation.id}`
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
                                  {actionLoading ===
                                  `delete-${designation.id}` ? (
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
                                className="bi bi-inbox"
                                style={{ fontSize: "40px", opacity: 0.3 }}
                              ></i>
                              <p
                                className="mb-0 mt-2"
                                style={{ fontSize: "14px" }}
                              >
                                {searchTerm
                                  ? "No designations found"
                                  : "No designations to display"}
                              </p>
                              {!searchTerm && designationsData.length === 0 && (
                                <small className="text-muted">
                                  Click "Submit" to create your first
                                  designation
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
                <h5 className="modal-title">Edit Designation</h5>
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
                        Designation Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditInputChange}
                        placeholder="Enter Designation Name"
                        required
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-medium">
                        Department *
                      </label>
                      <select
                        className="form-select"
                        name="departmentId"
                        value={editFormData.departmentId}
                        onChange={handleEditInputChange}
                        required
                      >
                        <option value="">Select Department</option>
                        {departmentsData.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.name}
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
                    "Update Designation"
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

export default Designation;