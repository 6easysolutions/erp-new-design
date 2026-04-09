import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router";
import { URLS } from "../../../Urls";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

const LeavesRules = () => {
  const navigate = useNavigate();

  // Initial form state
  const [formData, setFormData] = useState({
    leaveTypeName: "",
    shortCode: "",
    description: "",
    totalLeaves: 0,
    paidLeave: true,
    publish: true,
    applicableUsergroups: [],
    excludeUsergroups: [],
    allocated: "Yearly Basis",
    calculateOnProRataBasis: false,
    minLeavesAllowed: "",
    maxLeavesAllowed: "",
    applySandwichRule: false,
    carryForward: false,
    conditionalLeave: false,
    eligibleAfterDays: "",
    lapseBeforeAllocation: false,
    lapseAfterDays: "",
    applyInAdvance: "No",
    proofRequired: false,
    proofRequiredAfterDays: "",
    allocationDateField: new Date(),
    maxUpperThreshold: "",
    showAdvancedSettings: false
  });

  const [editFormData, setEditFormData] = useState({...formData});
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [leavesData, setLeavesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [userGroups, setUserGroups] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sample user groups (you should fetch these from your API)
  const sampleUserGroups = [
    { id: 1, name: "Administrators" },
    { id: 2, name: "Managers" },
    { id: 3, name: "Employees" },
    { id: 4, name: "Contractors" },
    { id: 5, name: "Interns" },
    { id: 6, name: "HR Staff" },
    { id: 7, name: "Finance Team" }
  ];

  useEffect(() => {
    fetchLeavesRules();
    setUserGroups(sampleUserGroups);
  }, []);

  const fetchLeavesRules = () => {
    const token = localStorage.getItem("authToken");

    setLoading(true);
    axios
      .post(
        URLS.GetHrmsLeaveRules,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        const data = res?.data?.leaveRules || res?.data || [];
        // Convert string dates to Date objects
        const formattedData = data.map((rule) => ({
          ...rule,
          allocationDateField: rule.allocationDateField ? new Date(rule.allocationDateField) : new Date(),
          createdAt: rule.createdAt ? new Date(rule.createdAt) : new Date()
        }));
        setLeavesData(formattedData);
        setPageLoading(false);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching leave rules:", error);
        toast.error("Failed to fetch leave rules");
        setPageLoading(false);
        setLoading(false);
      });
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.leaveTypeName.trim()) {
      errors.leaveTypeName = "Leave Type Name is required";
    }

    if (!data.shortCode.trim()) {
      errors.shortCode = "Short Code is required";
    } else if (data.shortCode.length > 5) {
      errors.shortCode = "Short Code should be max 5 characters";
    }

    if (!data.totalLeaves || data.totalLeaves < 0) {
      errors.totalLeaves = "Total Leaves must be a positive number";
    }

    if (!data.allocated) {
      errors.allocated = "Allocation basis is required";
    }

    if (data.minLeavesAllowed && data.maxLeavesAllowed) {
      const min = parseInt(data.minLeavesAllowed);
      const max = parseInt(data.maxLeavesAllowed);
      if (min > max) {
        errors.minLeavesAllowed = "Min leaves cannot be greater than max leaves";
        errors.maxLeavesAllowed = "Max leaves cannot be less than min leaves";
      }
    }

    if (data.conditionalLeave && !data.eligibleAfterDays) {
      errors.eligibleAfterDays = "Eligible after days is required when conditional leave is enabled";
    }

    if (data.lapseBeforeAllocation && !data.lapseAfterDays) {
      errors.lapseAfterDays = "Lapse after days is required when lapse before allocation is enabled";
    }

    if (data.proofRequired && !data.proofRequiredAfterDays) {
      errors.proofRequiredAfterDays = "Proof required after days is required when proof is required";
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        // Reset dependent fields when parent checkbox is unchecked
        ...(name === "conditionalLeave" && !checked && {
          eligibleAfterDays: ""
        }),
        ...(name === "lapseBeforeAllocation" && !checked && {
          lapseAfterDays: ""
        }),
        ...(name === "proofRequired" && !checked && {
          proofRequiredAfterDays: ""
        })
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : parseFloat(value)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleMultiSelectChange = (e, fieldName) => {
    const options = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({
      ...prev,
      [fieldName]: options
    }));
  };

  const handleEditMultiSelectChange = (e, fieldName) => {
    const options = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setEditFormData(prev => ({
      ...prev,
      [fieldName]: options
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      allocationDateField: date,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setEditFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === "conditionalLeave" && !checked && {
          eligibleAfterDays: ""
        }),
        ...(name === "lapseBeforeAllocation" && !checked && {
          lapseAfterDays: ""
        }),
        ...(name === "proofRequired" && !checked && {
          proofRequiredAfterDays: ""
        })
      }));
    } else if (type === "number") {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : parseFloat(value)
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditDateChange = (date) => {
    setEditFormData((prev) => ({
      ...prev,
      allocationDateField: date,
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
      allocationDateField: formData.allocationDateField.toISOString().split("T")[0],
      applicableUsergroups: formData.applicableUsergroups,
      excludeUsergroups: formData.excludeUsergroups
    };

    try {
      const response = await axios.post(URLS.AddHrmsLeaveRules, formattedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Leave rule added successfully!");
        // Reset form to initial state
        setFormData({
          leaveTypeName: "",
          shortCode: "",
          description: "",
          totalLeaves: 0,
          paidLeave: true,
          publish: true,
          applicableUsergroups: [],
          excludeUsergroups: [],
          allocated: "Yearly Basis",
          calculateOnProRataBasis: false,
          minLeavesAllowed: "",
          maxLeavesAllowed: "",
          applySandwichRule: false,
          carryForward: false,
          conditionalLeave: false,
          eligibleAfterDays: "",
          lapseBeforeAllocation: false,
          lapseAfterDays: "",
          applyInAdvance: "No",
          proofRequired: false,
          proofRequiredAfterDays: "",
          allocationDateField: new Date(),
          maxUpperThreshold: "",
          showAdvancedSettings: false
        });
        setShowAdvanced(false);
        setValidationErrors({});
        fetchLeavesRules();
      } else {
        toast.error(response.data?.message || "Failed to add leave rule");
      }
    } catch (err) {
      console.error("Error adding leave rule:", err);
      toast.error(
        err.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule) => {
    setEditingId(rule.id);
    setEditFormData({
      ...rule,
      applicableUsergroups: rule.applicableUsergroups || [],
      excludeUsergroups: rule.excludeUsergroups || []
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
      allocationDateField: editFormData.allocationDateField.toISOString().split("T")[0],
      applicableUsergroups: editFormData.applicableUsergroups,
      excludeUsergroups: editFormData.excludeUsergroups
    };

    try {
      const response = await axios.post(
        `${URLS.EditHrmsLeaveRules}${editingId}`,
        formattedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Leave rule updated successfully!");
        setEditingId(null);
        setShowEditModal(false);
        setEditFormData({...formData});
        fetchLeavesRules();
      } else {
        toast.error(response.data?.message || "Failed to update leave rule");
      }
    } catch (err) {
      console.error("Error updating leave rule:", err);
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
    setEditFormData({...formData});
    setValidationErrors({});
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}" leave rule? This action cannot be undone.`
      )
    ) {
      return;
    }

    setActionLoading(`delete-${id}`);

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.post(
        `${URLS.DeleteHrmsLeaveRules}${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Leave rule deleted successfully!");
        fetchLeavesRules();
      } else {
        toast.error(response.data?.message || "Failed to delete leave rule");
      }
    } catch (err) {
      console.error("Error deleting leave rule:", err);
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
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (publish) => {
    return publish ? 
      <span className="badge bg-success">Published</span> : 
      <span className="badge bg-secondary">Draft</span>;
  };

  const getPaidBadge = (paid) => {
    return paid ? 
      <span className="badge bg-info">Paid</span> : 
      <span className="badge bg-warning">Unpaid</span>;
  };

  const filteredData = leavesData.filter(
    (rule) =>
      rule.leaveTypeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.shortCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <p className="mt-3 text-muted">Loading leave rules...</p>
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
            Leave Rules Management
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
                  Add Leave Rule
                </h6>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Leave Type Name *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.leaveTypeName ? "is-invalid" : ""}`}
                        name="leaveTypeName"
                        value={formData.leaveTypeName}
                        onChange={handleInputChange}
                        placeholder="e.g., Casual Leave"
                        disabled={loading}
                      />
                      {validationErrors.leaveTypeName && (
                        <div className="invalid-feedback">
                          {validationErrors.leaveTypeName}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Short Code *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.shortCode ? "is-invalid" : ""}`}
                        name="shortCode"
                        value={formData.shortCode}
                        onChange={handleInputChange}
                        placeholder="e.g., CL"
                        maxLength="5"
                        disabled={loading}
                      />
                      {validationErrors.shortCode && (
                        <div className="invalid-feedback">
                          {validationErrors.shortCode}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Description of the leave type"
                      rows="2"
                      disabled={loading}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Total Leaves *
                      </label>
                      <input
                        type="number"
                        className={`form-control ${validationErrors.totalLeaves ? "is-invalid" : ""}`}
                        name="totalLeaves"
                        value={formData.totalLeaves}
                        onChange={handleInputChange}
                        min="0"
                        step="0.5"
                        disabled={loading}
                      />
                      {validationErrors.totalLeaves && (
                        <div className="invalid-feedback">
                          {validationErrors.totalLeaves}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Allocated *
                      </label>
                      <select
                        className={`form-select ${validationErrors.allocated ? "is-invalid" : ""}`}
                        name="allocated"
                        value={formData.allocated}
                        onChange={handleInputChange}
                        disabled={loading}
                      >
                        <option value="Yearly Basis">Yearly Basis</option>
                        <option value="Monthly Basis">Monthly Basis</option>
                        <option value="Quarterly Basis">Quarterly Basis</option>
                        <option value="Half-Yearly Basis">Half-Yearly Basis</option>
                      </select>
                      {validationErrors.allocated && (
                        <div className="invalid-feedback">
                          {validationErrors.allocated}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Applicable User Groups
                      </label>
                      <select
                        multiple
                        className="form-select"
                        value={formData.applicableUsergroups}
                        onChange={(e) => handleMultiSelectChange(e, "applicableUsergroups")}
                        disabled={loading}
                        style={{ height: "100px" }}
                      >
                        {userGroups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">Hold Ctrl to select multiple</small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Exclude User Groups
                      </label>
                      <select
                        multiple
                        className="form-select"
                        value={formData.excludeUsergroups}
                        onChange={(e) => handleMultiSelectChange(e, "excludeUsergroups")}
                        disabled={loading}
                        style={{ height: "100px" }}
                      >
                        {userGroups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">Hold Ctrl to select multiple</small>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="paidLeave"
                          checked={formData.paidLeave}
                          onChange={handleInputChange}
                          disabled={loading}
                        />
                        <label className="form-check-label fw-medium">
                          Paid Leave
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="publish"
                          checked={formData.publish}
                          onChange={handleInputChange}
                          disabled={loading}
                        />
                        <label className="form-check-label fw-medium">
                          Publish
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      {showAdvanced ? "Hide" : "Show"} Advanced Settings
                      <i className={`bi bi-chevron-${showAdvanced ? "up" : "down"} ms-2`}></i>
                    </button>
                  </div>

                  {showAdvanced && (
                    <div className="advanced-settings border-top pt-3 mt-3">
                      <h6 className="fw-semibold mb-3">Advanced Settings</h6>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-medium">
                            Min Leaves Allowed
                          </label>
                          <input
                            type="number"
                            className={`form-control ${validationErrors.minLeavesAllowed ? "is-invalid" : ""}`}
                            name="minLeavesAllowed"
                            value={formData.minLeavesAllowed}
                            onChange={handleInputChange}
                            min="0"
                            disabled={loading}
                          />
                          {validationErrors.minLeavesAllowed && (
                            <div className="invalid-feedback">
                              {validationErrors.minLeavesAllowed}
                            </div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-medium">
                            Max Leaves Allowed
                          </label>
                          <input
                            type="number"
                            className={`form-control ${validationErrors.maxLeavesAllowed ? "is-invalid" : ""}`}
                            name="maxLeavesAllowed"
                            value={formData.maxLeavesAllowed}
                            onChange={handleInputChange}
                            min="0"
                            disabled={loading}
                          />
                          {validationErrors.maxLeavesAllowed && (
                            <div className="invalid-feedback">
                              {validationErrors.maxLeavesAllowed}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="calculateOnProRataBasis"
                              checked={formData.calculateOnProRataBasis}
                              onChange={handleInputChange}
                              disabled={loading}
                            />
                            <label className="form-check-label fw-medium">
                              Calculate on Pro-Rata Basis
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="applySandwichRule"
                              checked={formData.applySandwichRule}
                              onChange={handleInputChange}
                              disabled={loading}
                            />
                            <label className="form-check-label fw-medium">
                              Apply Sandwich Rule
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="carryForward"
                              checked={formData.carryForward}
                              onChange={handleInputChange}
                              disabled={loading}
                            />
                            <label className="form-check-label fw-medium">
                              Carry Forward
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="conditionalLeave"
                              checked={formData.conditionalLeave}
                              onChange={handleInputChange}
                              disabled={loading}
                            />
                            <label className="form-check-label fw-medium">
                              Conditional Leave
                            </label>
                          </div>
                        </div>
                      </div>

                      {formData.conditionalLeave && (
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            Eligible After (Days) *
                          </label>
                          <input
                            type="number"
                            className={`form-control ${validationErrors.eligibleAfterDays ? "is-invalid" : ""}`}
                            name="eligibleAfterDays"
                            value={formData.eligibleAfterDays}
                            onChange={handleInputChange}
                            min="0"
                            disabled={loading}
                          />
                          {validationErrors.eligibleAfterDays && (
                            <div className="invalid-feedback">
                              {validationErrors.eligibleAfterDays}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="lapseBeforeAllocation"
                              checked={formData.lapseBeforeAllocation}
                              onChange={handleInputChange}
                              disabled={loading}
                            />
                            <label className="form-check-label fw-medium">
                              Lapse Before Allocation
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-medium">
                            Apply in Advance
                          </label>
                          <select
                            className="form-select"
                            name="applyInAdvance"
                            value={formData.applyInAdvance}
                            onChange={handleInputChange}
                            disabled={loading}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                            <option value="With Approval">With Approval</option>
                          </select>
                        </div>
                      </div>

                      {formData.lapseBeforeAllocation && (
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            Lapse After (Days) *
                          </label>
                          <input
                            type="number"
                            className={`form-control ${validationErrors.lapseAfterDays ? "is-invalid" : ""}`}
                            name="lapseAfterDays"
                            value={formData.lapseAfterDays}
                            onChange={handleInputChange}
                            min="0"
                            disabled={loading}
                          />
                          {validationErrors.lapseAfterDays && (
                            <div className="invalid-feedback">
                              {validationErrors.lapseAfterDays}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="proofRequired"
                              checked={formData.proofRequired}
                              onChange={handleInputChange}
                              disabled={loading}
                            />
                            <label className="form-check-label fw-medium">
                              Proof Required
                            </label>
                          </div>
                        </div>
                      </div>

                      {formData.proofRequired && (
                        <div className="mb-3">
                          <label className="form-label fw-medium">
                            Proof Required After (Days) *
                          </label>
                          <input
                            type="number"
                            className={`form-control ${validationErrors.proofRequiredAfterDays ? "is-invalid" : ""}`}
                            name="proofRequiredAfterDays"
                            value={formData.proofRequiredAfterDays}
                            onChange={handleInputChange}
                            min="0"
                            disabled={loading}
                          />
                          {validationErrors.proofRequiredAfterDays && (
                            <div className="invalid-feedback">
                              {validationErrors.proofRequiredAfterDays}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label fw-medium">
                          Allocation Date
                        </label>
                        <DatePicker
                          selected={formData.allocationDateField}
                          onChange={handleDateChange}
                          className="form-control"
                          dateFormat="MMMM d, yyyy"
                          placeholderText="Select Allocation Date"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-medium">
                          Max Upper Threshold
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="maxUpperThreshold"
                          value={formData.maxUpperThreshold}
                          onChange={handleInputChange}
                          min="0"
                          disabled={loading}
                          placeholder="Maximum threshold for leaves"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn w-100 mt-3"
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
                        Add Leave Rule
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
                    Leave Rules ({filteredData.length})
                  </h6>
                  <div style={{ width: "280px" }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search by Name, Code or Description"
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
                        <th className="fw-semibold py-2">S. No</th>
                        <th className="fw-semibold py-2">Leave Type</th>
                        <th className="fw-semibold py-2">Code</th>
                        <th className="fw-semibold py-2">Total Leaves</th>
                        <th className="fw-semibold py-2">Status</th>
                        <th className="fw-semibold py-2">Allocation</th>
                        <th className="fw-semibold py-2 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((rule, index) => (
                          <tr
                            key={rule.id}
                            style={{ borderBottom: "1px solid #f0f0f0" }}
                          >
                            <td className="py-2">{startIndex + index + 1}</td>
                            <td className="py-2">
                              <div style={{ fontWeight: "500" }}>
                                {rule.leaveTypeName}
                              </div>
                              <small className="text-muted">{rule.description}</small>
                            </td>
                            <td className="py-2">
                              <span className="badge bg-primary">{rule.shortCode}</span>
                            </td>
                            <td className="py-2">
                              <div className="d-flex align-items-center gap-2">
                                <span style={{ fontWeight: "500" }}>
                                  {rule.totalLeaves}
                                </span>
                                {getPaidBadge(rule.paidLeave)}
                              </div>
                            </td>
                            <td className="py-2">
                              {getStatusBadge(rule.publish)}
                            </td>
                            <td className="py-2">
                              <small>{rule.allocated}</small>
                              <div className="text-muted">
                                <small>{formatDate(rule.allocationDateField)}</small>
                              </div>
                            </td>
                            <td className="py-2 text-end">
                              <div className="d-inline-flex gap-1">
                                <button
                                  className="btn btn-sm"
                                  onClick={() => handleEdit(rule)}
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
                                  onClick={() => handleDelete(rule.id, rule.leaveTypeName)}
                                  disabled={actionLoading === `delete-${rule.id}`}
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
                                  {actionLoading === `delete-${rule.id}` ? (
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
                                className="bi bi-calendar-x"
                                style={{ fontSize: "40px", opacity: 0.3 }}
                              ></i>
                              <p
                                className="mb-0 mt-2"
                                style={{ fontSize: "14px" }}
                              >
                                {searchTerm
                                  ? "No leave rules found"
                                  : "No leave rules to display"}
                              </p>
                              {!searchTerm && leavesData.length === 0 && (
                                <small className="text-muted">
                                  Click "Add Leave Rule" to create your first rule
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

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Leave Rule</h5>
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
                        Leave Type Name *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.leaveTypeName ? "is-invalid" : ""}`}
                        name="leaveTypeName"
                        value={editFormData.leaveTypeName}
                        onChange={handleEditInputChange}
                        required
                      />
                      {validationErrors.leaveTypeName && (
                        <div className="invalid-feedback">
                          {validationErrors.leaveTypeName}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Short Code *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.shortCode ? "is-invalid" : ""}`}
                        name="shortCode"
                        value={editFormData.shortCode}
                        onChange={handleEditInputChange}
                        maxLength="5"
                        required
                      />
                      {validationErrors.shortCode && (
                        <div className="invalid-feedback">
                          {validationErrors.shortCode}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditInputChange}
                      rows="2"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Total Leaves *
                      </label>
                      <input
                        type="number"
                        className={`form-control ${validationErrors.totalLeaves ? "is-invalid" : ""}`}
                        name="totalLeaves"
                        value={editFormData.totalLeaves}
                        onChange={handleEditInputChange}
                        min="0"
                        step="0.5"
                        required
                      />
                      {validationErrors.totalLeaves && (
                        <div className="invalid-feedback">
                          {validationErrors.totalLeaves}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Allocated *
                      </label>
                      <select
                        className={`form-select ${validationErrors.allocated ? "is-invalid" : ""}`}
                        name="allocated"
                        value={editFormData.allocated}
                        onChange={handleEditInputChange}
                        required
                      >
                        <option value="Yearly Basis">Yearly Basis</option>
                        <option value="Monthly Basis">Monthly Basis</option>
                        <option value="Quarterly Basis">Quarterly Basis</option>
                        <option value="Half-Yearly Basis">Half-Yearly Basis</option>
                      </select>
                      {validationErrors.allocated && (
                        <div className="invalid-feedback">
                          {validationErrors.allocated}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Applicable User Groups
                      </label>
                      <select
                        multiple
                        className="form-select"
                        value={editFormData.applicableUsergroups}
                        onChange={(e) => handleEditMultiSelectChange(e, "applicableUsergroups")}
                        style={{ height: "100px" }}
                      >
                        {userGroups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Exclude User Groups
                      </label>
                      <select
                        multiple
                        className="form-select"
                        value={editFormData.excludeUsergroups}
                        onChange={(e) => handleEditMultiSelectChange(e, "excludeUsergroups")}
                        style={{ height: "100px" }}
                      >
                        {userGroups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="paidLeave"
                          checked={editFormData.paidLeave}
                          onChange={handleEditInputChange}
                        />
                        <label className="form-check-label fw-medium">
                          Paid Leave
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="publish"
                          checked={editFormData.publish}
                          onChange={handleEditInputChange}
                        />
                        <label className="form-check-label fw-medium">
                          Publish
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Advanced settings in modal */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Min Leaves Allowed
                      </label>
                      <input
                        type="number"
                        className={`form-control ${validationErrors.minLeavesAllowed ? "is-invalid" : ""}`}
                        name="minLeavesAllowed"
                        value={editFormData.minLeavesAllowed}
                        onChange={handleEditInputChange}
                        min="0"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">
                        Max Leaves Allowed
                      </label>
                      <input
                        type="number"
                        className={`form-control ${validationErrors.maxLeavesAllowed ? "is-invalid" : ""}`}
                        name="maxLeavesAllowed"
                        value={editFormData.maxLeavesAllowed}
                        onChange={handleEditInputChange}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="carryForward"
                          checked={editFormData.carryForward}
                          onChange={handleEditInputChange}
                        />
                        <label className="form-check-label fw-medium">
                          Carry Forward
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="conditionalLeave"
                          checked={editFormData.conditionalLeave}
                          onChange={handleEditInputChange}
                        />
                        <label className="form-check-label fw-medium">
                          Conditional Leave
                        </label>
                      </div>
                    </div>
                  </div>

                  {editFormData.conditionalLeave && (
                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        Eligible After (Days) *
                      </label>
                      <input
                        type="number"
                        className={`form-control ${validationErrors.eligibleAfterDays ? "is-invalid" : ""}`}
                        name="eligibleAfterDays"
                        value={editFormData.eligibleAfterDays}
                        onChange={handleEditInputChange}
                        min="0"
                      />
                    </div>
                  )}
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
                    "Update Rule"
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

export default LeavesRules;