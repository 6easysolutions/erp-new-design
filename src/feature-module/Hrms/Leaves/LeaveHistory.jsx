import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchFromApi from "../../../components/data-table/search";
import PrimeDataTable from "../../../components/data-table";
import TableTopHead from "../../../components/table-top-head";
import DeleteModal from "../../../components/delete-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { URLS } from "../../../Urls";
import axios from "axios";

const LeavesAdmin = () => {
  const [dataSource, setDataSource] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showMultipleDays, setShowMultipleDays] = useState(false);

  // Form states for Add Leave
  const [leaveData, setLeaveData] = useState({
    employeeId: "",
    leaveType: "",
    dayType: "full",
    halfType: "first_half",
    fromDate: "",
    toDate: "",
    reason: "",
    status: "pending",
    isForOtherUser: false,
    otherUserId: "",
  });

  // Form states for Edit Leave
  const [editLeaveId, setEditLeaveId] = useState(null);
  const [editLeaveData, setEditLeaveData] = useState({
    employeeId: "",
    leaveType: "",
    dayType: "full",
    halfType: "first_half",
    fromDate: "",
    toDate: "",
    reason: "",
    status: "pending",
  });

  // Delete state
  const [deleteLeaveId, setDeleteLeaveId] = useState(null);

  // Leave types
  const leaveTypes = [
    { value: "SICK_LEAVE", label: "Sick Leave" },
    { value: "COMPENSATORY_OFF", label: "Compensatory Off" },
    { value: "LEAVE_WITHOUT_PAY", label: "Leave Without Pay" },
    { value: "CASUAL_LEAVE", label: "Casual Leave" },
    { value: "EARNED_LEAVE", label: "Earned Leave" },
  ];

  const dayTypes = [
    { value: "full", label: "Full Day" },
    { value: "half", label: "Half Day" },
  ];

  const halfDayTypes = [
    { value: "first_half", label: "First Half" },
    { value: "second_half", label: "Second Half" },
  ];

  const employeeOptions = [
    { value: "", label: "Select Employee" },
    { value: "1", label: "Mitchum Daniel" },
    { value: "2", label: "Susan Lopez" },
    { value: "3", label: "Robert Grossman" },
    { value: "4", label: "Janet Hembre" },
  ];

  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  // Fetch all leaves
  const fetchLeaves = async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        URLS.GetHrmsLeaveApply,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        const leaves = response.data || [];
        setDataSource(leaves);
        setTotalRecords(leaves.length);
      } else {
        toast.error(response.data?.message || "Failed to fetch leaves");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch leaves");
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Leave form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveData({
      ...leaveData,
      [name]: value,
    });
  };

  // Handle Edit Leave form changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditLeaveData({
      ...editLeaveData,
      [name]: value,
    });
  };

  // Handle day type change for Add
  const handleDayTypeChange = (type) => {
    setLeaveData({
      ...leaveData,
      dayType: type,
      halfType: type === "half" ? leaveData.halfType : "first_half",
    });
  };

  // Handle day type change for Edit
  const handleEditDayTypeChange = (type) => {
    setEditLeaveData({
      ...editLeaveData,
      dayType: type,
      halfType: type === "half" ? editLeaveData.halfType : "first_half",
    });
  };

  // Apply for leave
  const handleApplyLeave = async (e) => {
    e.preventDefault();

    // Validation
    if (!leaveData.employeeId) {
      toast.error("Please select an employee");
      return;
    }

    if (!leaveData.leaveType) {
      toast.error("Please select leave type");
      return;
    }

    if (!leaveData.fromDate) {
      toast.error("Please select from date");
      return;
    }

    if (leaveData.dayType === "full" && showMultipleDays && !leaveData.toDate) {
      toast.error("Please select to date for multiple days");
      return;
    }

    if (
      leaveData.dayType === "full" &&
      showMultipleDays &&
      leaveData.toDate &&
      new Date(leaveData.toDate) < new Date(leaveData.fromDate)
    ) {
      toast.error("End date cannot be before start date");
      return;
    }

    if (!leaveData.reason.trim()) {
      toast.error("Please provide reason");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    // Prepare payload
    const payload = {
      employeeId: parseInt(leaveData.employeeId),
      leaveType: leaveData.leaveType,
      dayType: leaveData.dayType,
      halfType: leaveData.dayType === "half" ? leaveData.halfType : null,
      fromDate: leaveData.fromDate,
      toDate: showMultipleDays ? leaveData.toDate : leaveData.fromDate,
      reason: leaveData.reason,
      status: "pending",
    };

    try {
      setFormLoading(true);
      const response = await axios.post(URLS.AddHrmsLeaveApply, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.data?.success) {
        toast.success("Leave applied successfully!");
        // Close modal
        document.querySelector('[data-bs-dismiss="modal"]').click();
        // Reset form
        handleCancel();
        // Refresh data
        fetchLeaves();
      } else {
        toast.error(response.data?.message || "Failed to apply leave");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply leave");
      console.error("Error applying leave:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Edit leave
  const handleEditLeave = async (e) => {
    e.preventDefault();

    // Validation
    if (!editLeaveData.employeeId) {
      toast.error("Please select an employee");
      return;
    }

    if (!editLeaveData.leaveType) {
      toast.error("Please select leave type");
      return;
    }

    if (!editLeaveData.fromDate) {
      toast.error("Please select from date");
      return;
    }

    if (!editLeaveData.reason.trim()) {
      toast.error("Please provide reason");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    // Prepare payload
    const payload = {
      employeeId: parseInt(editLeaveData.employeeId),
      leaveType: editLeaveData.leaveType,
      dayType: editLeaveData.dayType,
      halfType:
        editLeaveData.dayType === "half" ? editLeaveData.halfType : null,
      fromDate: editLeaveData.fromDate,
      toDate: editLeaveData.toDate || editLeaveData.fromDate,
      reason: editLeaveData.reason,
      status: editLeaveData.status,
    };

    try {
      setFormLoading(true);
      const response = await axios.post(
        URLS.EditHrmsLeaveApply + editLeaveId,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Leave updated successfully!");
        // Close modal
        document.querySelector('[data-bs-dismiss="modal"]').click();
        // Refresh data
        fetchLeaves();
      } else {
        toast.error(response.data?.message || "Failed to update leave");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update leave");
      console.error("Error updating leave:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete leave
  const handleDeleteLeave = async () => {
    if (!deleteLeaveId) {
      toast.error("No leave selected for deletion");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    const payload = {
      id: deleteLeaveId,
    };

    try {
      setFormLoading(true);
      const response = await axios.post(URLS.DeleteHrmsLeaveApply, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.data?.success) {
        toast.success("Leave deleted successfully!");
        // Close modal
        document.querySelector('[data-bs-dismiss="modal"]').click();
        // Refresh data
        fetchLeaves();
      } else {
        toast.error(response.data?.message || "Failed to delete leave");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete leave");
      console.error("Error deleting leave:", error);
    } finally {
      setFormLoading(false);
      setDeleteLeaveId(null);
    }
  };

  // Open edit modal with data
  const openEditModal = (leave) => {
    setEditLeaveId(leave.id);
    setEditLeaveData({
      employeeId: leave.employeeId?.toString() || "",
      leaveType: leave.leaveType || "",
      dayType: leave.dayType || "full",
      halfType: leave.halfType || "first_half",
      fromDate: leave.fromDate ? formatDateForInput(leave.fromDate) : "",
      toDate: leave.toDate ? formatDateForInput(leave.toDate) : "",
      reason: leave.reason || "",
      status: leave.status || "pending",
    });
  };

  // Open delete modal
  const openDeleteModal = (leaveId) => {
    setDeleteLeaveId(leaveId);
  };

  // Reset form
  const handleCancel = () => {
    setLeaveData({
      employeeId: "",
      leaveType: "",
      dayType: "full",
      halfType: "first_half",
      fromDate: "",
      toDate: "",
      reason: "",
      status: "pending",
      isForOtherUser: false,
      otherUserId: "",
    });
    setShowMultipleDays(false);
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getLeaveTypeLabel = (type) => {
    const found = leaveTypes.find((lt) => lt.value === type);
    return found ? found.label : type;
  };

  const getEmployeeName = (employeeId) => {
    const employee = employeeOptions.find(
      (emp) => emp.value === employeeId.toString()
    );
    return employee ? employee.label : `Employee ${employeeId}`;
  };

  const handleSearch = (value) => {
    // Filter data based on search query
    if (value) {
      const filtered = dataSource.filter(
        (leave) =>
          getEmployeeName(leave.employeeId)
            ?.toLowerCase()
            .includes(value.toLowerCase()) ||
          leave.employeeId?.toString().includes(value) ||
          getLeaveTypeLabel(leave.leaveType)
            ?.toLowerCase()
            .includes(value.toLowerCase())
      );
      setDataSource(filtered);
      setTotalRecords(filtered.length);
    } else {
      fetchLeaves();
    }
  };

  const columns = [
    {
      field: "employeeId",
      header: "Employee",
      sortable: true,
      body: (rowData) => getEmployeeName(rowData.employeeId),
    },
    {
      field: "leaveType",
      header: "Leave Type",
      sortable: true,
      body: (rowData) => getLeaveTypeLabel(rowData.leaveType),
    },
    {
      field: "fromDate",
      header: "From Date",
      sortable: true,
      body: (rowData) => formatDate(rowData.fromDate),
    },
    {
      field: "toDate",
      header: "To Date",
      sortable: true,
      body: (rowData) => formatDate(rowData.toDate),
    },
    {
      field: "dayType",
      header: "Day Type",
      sortable: true,
      body: (rowData) => (
        <span className="text-capitalize">
          {rowData.dayType === "half"
            ? `Half Day (${
                rowData.halfType === "first_half" ? "First Half" : "Second Half"
              })`
            : "Full Day"}
        </span>
      ),
    },
    {
      field: "reason",
      header: "Reason",
      sortable: false,
      body: (rowData) => (
        <div
          className="text-truncate"
          style={{ maxWidth: "150px" }}
          title={rowData.reason}
        >
          {rowData.reason}
        </div>
      ),
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      body: (rowData) => (
        <span
          className={`badge ${
            rowData.status === "approved"
              ? "badge-success"
              : rowData.status === "rejected"
              ? "badge-danger"
              : "badge-warning"
          } d-inline-flex align-items-center badge-xs`}
        >
          <i className="ti ti-point-filled me-1" />
          {rowData.status.charAt(0).toUpperCase() + rowData.status.slice(1)}
        </span>
      ),
    },
    {
      header: "Actions",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (rowData) => (
        <div className="edit-delete-action d-flex align-items-center">
          <Link
            className="me-2 p-2 d-flex align-items-center border rounded"
            to="#"
            data-bs-toggle="modal"
            data-bs-target="#edit-leave"
            onClick={() => openEditModal(rowData)}
          >
            <i className="feather icon-edit"></i>
          </Link>
          <Link
            className="p-2 d-flex align-items-center border rounded"
            to="#"
            data-bs-toggle="modal"
            data-bs-target="#delete-modal"
            onClick={() => openDeleteModal(rowData.id)}
          >
            <i className="feather icon-trash-2"></i>
          </Link>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Leaves</h4>
                <h6>Manage your Leaves</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link to="/hrms/applyforLeave" className="btn btn-primary">
                Apply Leave
              </Link>
            </div>
          </div>

          {/* Leaves List */}
          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows}
              />

              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="dropdown">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Filter by Status
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        All
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Pending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Approved
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Rejected
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card-body pb-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading leave data...</p>
                </div>
              ) : dataSource.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No leave applications found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <PrimeDataTable
                    column={columns}
                    data={dataSource}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={totalRecords}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Leave Modal */}
      <div className="modal fade" id="add-leave">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="page-title">
                <h4>Apply Leave</h4>
              </div>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleCancel}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form onSubmit={handleApplyLeave}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Employee <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="employeeId"
                        value={leaveData.employeeId}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Employee</option>
                        {employeeOptions
                          .filter((emp) => emp.value !== "")
                          .map((emp, index) => (
                            <option key={index} value={emp.value}>
                              {emp.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Leave Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="leaveType"
                        value={leaveData.leaveType}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Leave Type</option>
                        {leaveTypes.map((type, index) => (
                          <option key={index} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Day Type:</label>
                      <div className="d-flex gap-4 flex-wrap">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="dayType"
                            id="fullDay"
                            checked={leaveData.dayType === "full"}
                            onChange={() => handleDayTypeChange("full")}
                          />
                          <label className="form-check-label" htmlFor="fullDay">
                            Full Day
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="dayType"
                            id="halfDay"
                            checked={leaveData.dayType === "half"}
                            onChange={() => handleDayTypeChange("half")}
                          />
                          <label className="form-check-label" htmlFor="halfDay">
                            Half day
                          </label>
                        </div>
                      </div>
                    </div>
                    {leaveData.dayType === "half" && (
                      <div className="mb-3">
                        <label className="form-label">Half Day Type:</label>
                        <select
                          className="form-control"
                          name="halfType"
                          value={leaveData.halfType}
                          onChange={handleInputChange}
                        >
                          {halfDayTypes.map((type, index) => (
                            <option key={index} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="col-lg-12">
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label className="form-label">
                            From Date <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            name="fromDate"
                            value={leaveData.fromDate}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="multipleDaysCheck"
                              checked={showMultipleDays}
                              onChange={(e) => {
                                setShowMultipleDays(e.target.checked);
                                if (!e.target.checked) {
                                  setLeaveData({ ...leaveData, toDate: "" });
                                }
                              }}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="multipleDaysCheck"
                            >
                              Apply for multiple days
                            </label>
                          </div>
                          {showMultipleDays && (
                            <div>
                              <label className="form-label">To Date:</label>
                              <input
                                type="date"
                                className="form-control"
                                name="toDate"
                                value={leaveData.toDate}
                                onChange={handleInputChange}
                                min={leaveData.fromDate}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Reason <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        name="reason"
                        value={leaveData.reason}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Enter reason for leave"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  data-bs-dismiss="modal"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Leave Modal */}
      <div className="modal fade" id="edit-leave">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="page-title">
                <h4>Edit Leave</h4>
              </div>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form onSubmit={handleEditLeave}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Employee <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="employeeId"
                        value={editLeaveData.employeeId}
                        onChange={handleEditInputChange}
                      >
                        <option value="">Select Employee</option>
                        {employeeOptions
                          .filter((emp) => emp.value !== "")
                          .map((emp, index) => (
                            <option key={index} value={emp.value}>
                              {emp.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Leave Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="leaveType"
                        value={editLeaveData.leaveType}
                        onChange={handleEditInputChange}
                      >
                        <option value="">Select Leave Type</option>
                        {leaveTypes.map((type, index) => (
                          <option key={index} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Day Type:</label>
                      <div className="d-flex gap-4 flex-wrap">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="editDayType"
                            id="editFullDay"
                            checked={editLeaveData.dayType === "full"}
                            onChange={() => handleEditDayTypeChange("full")}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="editFullDay"
                          >
                            Full Day
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="editDayType"
                            id="editHalfDay"
                            checked={editLeaveData.dayType === "half"}
                            onChange={() => handleEditDayTypeChange("half")}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="editHalfDay"
                          >
                            Half day
                          </label>
                        </div>
                      </div>
                    </div>
                    {editLeaveData.dayType === "half" && (
                      <div className="mb-3">
                        <label className="form-label">Half Day Type:</label>
                        <select
                          className="form-control"
                          name="halfType"
                          value={editLeaveData.halfType}
                          onChange={handleEditInputChange}
                        >
                          {halfDayTypes.map((type, index) => (
                            <option key={index} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="col-lg-12">
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label className="form-label">
                            From Date <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            name="fromDate"
                            value={editLeaveData.fromDate}
                            onChange={handleEditInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label className="form-label">To Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="toDate"
                            value={editLeaveData.toDate}
                            onChange={handleEditInputChange}
                            min={editLeaveData.fromDate}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select
                        className="form-control"
                        name="status"
                        value={editLeaveData.status}
                        onChange={handleEditInputChange}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Reason <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        name="reason"
                        value={editLeaveData.reason}
                        onChange={handleEditInputChange}
                        rows="4"
                        placeholder="Enter reason for leave"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        onDelete={handleDeleteLeave}
        title="Delete Leave"
        message="Are you sure you want to delete this leave application?"
      />
    </div>
  );
};

export default LeavesAdmin;
