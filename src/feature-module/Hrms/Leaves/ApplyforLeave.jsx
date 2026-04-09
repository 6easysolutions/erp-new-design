import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fileTextIcon1 } from "../../../utils/imagepath";
import { URLS } from "../../../Urls";
import axios from "axios";

const ApplyforLeave = () => {
  const [leaveBalance, setLeaveBalance] = useState({
    casualLeave: 0,
    compOff: 0,
    earnedLeave: 0,
    sickLeave: 0,
  });

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

  const [appliedLeaves, setAppliedLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showMultipleDays, setShowMultipleDays] = useState(false);

  const leaveTypes = [
    { value: "SICK_LEAVE", label: "Sick Leave" },
    { value: "CASUAL_LEAVE", label: "Casual Leave" },
    { value: "EARNED_LEAVE", label: "Earned Leave" },
    { value: "COMP_OFF", label: "Compensatory Off" },
    { value: "OPTIONAL_HOLIDAY", label: "Optional Holiday" },
    { value: "LEAVE_WITHOUT_PAY", label: "Leave Without Pay" },
  ];

  const halfDayTypes = [
    { value: "first_half", label: "First Half" },
    { value: "second_half", label: "Second Half" },
  ];

  const statusColors = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };

  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  const fetchLeaveData = async () => {
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
        setAppliedLeaves(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch leave data");
      console.error("Error fetching leave data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        URLS.GetHrmsLeaveBalance + 1,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data && response.data.success) {
        const balanceData = response.data.balance || {};
        setLeaveBalance({
          casualLeave: balanceData.casualLeave || 0,
          compOff: balanceData.compOff || 0,
          earnedLeave: balanceData.earnedLeave || 0,
          sickLeave: balanceData.sickLeave || 0,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch leave balance");
      console.error("Error fetching leave balance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
    fetchLeaveBalance();
  }, []);

  const handleDayTypeChange = (type) => {
    setLeaveData({
      ...leaveData,
      dayType: type,
    });
    if (type === "full") {
      setShowMultipleDays(false);
    }
  };

  const handleUserSelection = (isOtherUser) => {
    setLeaveData({
      ...leaveData,
      isForOtherUser: isOtherUser,
      otherUserId: isOtherUser ? "" : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!leaveData.leaveType) {
      toast.error("Please select leave type");
      return;
    }

    if (!leaveData.fromDate) {
      toast.error("Please select date");
      return;
    }

    if (showMultipleDays && !leaveData.toDate) {
      toast.error("Please select end date for multiple days");
      return;
    }

    if (
      showMultipleDays &&
      new Date(leaveData.toDate) < new Date(leaveData.fromDate)
    ) {
      toast.error("End date cannot be before start date");
      return;
    }

    if (!leaveData.reason.trim()) {
      toast.error("Please provide reason");
      return;
    }

    if (leaveData.isForOtherUser && !leaveData.otherUserId) {
      toast.error("Please select an employee");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    const payload = {
      employeeId: 1, // This should come from user data
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

      if (response.status === 200) {
        toast.success("Leave applied successfully!");
        handleCancel();
        fetchLeaveData();
        fetchLeaveBalance();
      } else {
        toast.error(response.data.message || "Failed to apply leave");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply leave");
      console.error("Error applying leave:", error);
    } finally {
      setFormLoading(false);
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getLeaveTypeLabel = (type) => {
    const found = leaveTypes.find((lt) => lt.value === type);
    return found ? found.label : type;
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div>
          <ToastContainer position="top-right" autoClose={3000} />
          <div className="row">
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="dash-count">
                <div className="dash-counts">
                  <h4>{leaveBalance.casualLeave}</h4>
                  <h5>Casual Leave</h5>
                </div>
                <div className="dash-imgs">
                  <i className="feather icon-user"></i>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="dash-count das1">
                <div className="dash-counts">
                  <h4>{leaveBalance.compOff}</h4>
                  <h5>Compensatory Off</h5>
                </div>
                <div className="dash-imgs">
                  <i className="feather user-check"></i>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="dash-count das2 bg-dark">
                <div className="dash-counts">
                  <h4>{leaveBalance.earnedLeave}</h4>
                  <h5>Earned Leave</h5>
                </div>
                <div className="dash-imgs">
                  <img src={fileTextIcon1} className="img-fluid" alt="icon" />
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="dash-count das3">
                <div className="dash-counts">
                  <h4>{leaveBalance.sickLeave}</h4>
                  <h5>Sick Leave</h5>
                </div>
                <div className="dash-imgs">
                  <i className="feather icon-file"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <div className="card border shadow-sm">
                <div className="card-header ">
                  <h3
                    className="card-title mb-0"
                    style={{ fontSize: "1.1rem", fontWeight: "600" }}
                  >
                    Apply for Leave
                  </h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            For User:
                          </label>
                          <div className="d-flex gap-4">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="userType"
                                id="me"
                                checked={!leaveData.isForOtherUser}
                                onChange={() => handleUserSelection(false)}
                              />
                              <label className="form-check-label" htmlFor="me">
                                Me
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="userType"
                                id="otherUser"
                                checked={leaveData.isForOtherUser}
                                onChange={() => handleUserSelection(true)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="otherUser"
                              >
                                Other User
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            Leave type:
                          </label>
                          <select
                            className="form-control"
                            value={leaveData.leaveType}
                            onChange={(e) =>
                              setLeaveData({
                                ...leaveData,
                                leaveType: e.target.value,
                              })
                            }
                          >
                            <option value="">--Select leave type--</option>
                            {leaveTypes.map((type, index) => (
                              <option key={index} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            Day Type:
                          </label>
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
                              <label
                                className="form-check-label"
                                htmlFor="fullDay"
                              >
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
                              <label
                                className="form-check-label"
                                htmlFor="halfDay"
                              >
                                Half day
                              </label>
                            </div>
                          </div>
                        </div>
                        {leaveData.dayType === "half" && (
                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              Half Day Type:
                            </label>
                            <select
                              className="form-control"
                              value={leaveData.halfType}
                              onChange={(e) =>
                                setLeaveData({
                                  ...leaveData,
                                  halfType: e.target.value,
                                })
                              }
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
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            On Date:
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={leaveData.fromDate}
                            onChange={(e) =>
                              setLeaveData({
                                ...leaveData,
                                fromDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        {leaveData.dayType === "full" && (
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
                                <label className="form-label fw-semibold">
                                  To Date:
                                </label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={leaveData.toDate}
                                  onChange={(e) =>
                                    setLeaveData({
                                      ...leaveData,
                                      toDate: e.target.value,
                                    })
                                  }
                                  min={leaveData.fromDate}
                                />
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            Reason
                          </label>
                          <textarea
                            className="form-control"
                            value={leaveData.reason}
                            onChange={(e) =>
                              setLeaveData({
                                ...leaveData,
                                reason: e.target.value,
                              })
                            }
                            rows="4"
                            placeholder="Enter reason for leave"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row mt-4">
                      <div className="col-12">
                        <div className="d-flex gap-2 border-top pt-3">
                          <button
                            type="button"
                            className="btn btn-light"
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
                                Saving...
                              </>
                            ) : (
                              "Save"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card h-100 border shadow-sm">
                <div className="card-header bg-light">
                  <h3
                    className="card-title mb-0"
                    style={{ fontSize: "1.1rem", fontWeight: "600" }}
                  >
                    My Leave
                  </h3>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading leave data...</p>
                    </div>
                  ) : appliedLeaves.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No leave applications found</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Leave Type</th>
                            <th>From Date</th>
                            <th>To Date</th>
                            <th>Days</th>
                            <th>Status</th>
                            <th>Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appliedLeaves?.slice(0, 6)?.map((leave, index) => {
                            const fromDate = new Date(leave.fromDate);
                            const toDate = new Date(leave.toDate);
                            const diffTime = Math.abs(toDate - fromDate);
                            const diffDays =
                              Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                            return (
                              <tr key={index}>
                                <td>
                                  <span className="fw-medium">
                                    {getLeaveTypeLabel(leave.leaveType)}
                                  </span>
                                  {leave.dayType === "half" && (
                                    <div className="text-muted small">
                                      {leave.halfType === "first_half"
                                        ? "(First Half)"
                                        : "(Second Half)"}
                                    </div>
                                  )}
                                </td>
                                <td>{formatDate(leave.fromDate)}</td>
                                <td>{formatDate(leave.toDate)}</td>
                                <td>
                                  <span className="badge bg-light text-dark">
                                    {diffDays} {diffDays === 1 ? "day" : "days"}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`badge bg-${
                                      statusColors[leave.status] || "secondary"
                                    }`}
                                  >
                                    {leave.status.charAt(0).toUpperCase() +
                                      leave.status.slice(1)}
                                  </span>
                                </td>
                                <td>
                                  <div
                                    className="text-truncate"
                                    style={{ maxWidth: "150px" }}
                                    title={leave.reason}
                                  >
                                    {leave.reason}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyforLeave;
