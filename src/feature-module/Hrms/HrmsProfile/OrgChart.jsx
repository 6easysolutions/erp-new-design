
import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { URLS } from "../../../Urls";
import axios from "axios";

function OrgChart() {
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [profileGroups, setProfileGroups] = useState([]);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [teamData, setTeamData] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [profileFieldsData, setProfileFieldsData] = useState([]);
  const [originalEmployeeData, setOriginalEmployeeData] = useState({});
  const [activeGroup, setActiveGroup] = useState(null);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);
  const employeeId = 59;

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  const fetchInitialData = useCallback(async () => {
    try {
      setLoadingDropdowns(true);
      const [departmentsRes, designationsRes, teamsRes] = await Promise.all([
        axios.get(URLS.GetHrmsDepartments, getAuthConfig()),
        axios.get(URLS.GetHrmsDesignations, getAuthConfig()),
        axios.get(URLS.GetHrmsTeam, getAuthConfig()),
      ]);

      setDepartments(departmentsRes?.data?.data || []);
      setDesignations(designationsRes?.data?.data || []);
      setTeamData(teamsRes?.data?.data || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      toast.error("Failed to fetch dropdown data");
    } finally {
      setLoadingDropdowns(false);
    }
  }, []);

  const transformProfileGroups = useCallback((groups) => {
    if (!groups || !Array.isArray(groups)) return [];

    return groups
      .filter(
        (group) =>
          group.groupName?.trim() &&
          !group.groupName.includes("[") &&
          !group.groupName.includes("]") &&
          group.fields?.length > 0
      )
      .map((group) => ({
        id: group.id,
        name: group.groupName,
        description: group.description || "",
        displayOrder: group.displayOrder || 0,
        published: true,
        fields: group.fields
          .filter((field) => field.isVisible !== false)
          .map((field) => ({
            id: field.id,
            label: field.fieldLabel || "",
            key: field.fieldKey,
            type: field.fieldType?.toLowerCase() || "text",
            value: field.fieldValue || field.value || "",
            isRequired: field.isRequired || false,
            isVisible: field.isVisible !== false,
            displayOrder: field.displayOrder || 0,
            options: Array.isArray(field.options) ? field.options : [],
            readOnly: field.readOnly || false,
            placeholder: field.placeholder || "",
            tooltip: field.tooltip || "",
            minChar: field.minChar || 0,
            maxChar: field.maxChar || 255,
            numericOnly: field.numericOnly || false,
            alphabetsOnly: field.alphabetsOnly || false,
            alphaNumeric: field.alphaNumeric || false,
            autoSuggest: field.autoSuggest || false,
            inputFormat: field.inputFormat || "",
            isSystemField: field.isSystemField || false,
            visibleTo: field.visibleTo || "ALL",
            editableBy: field.editableBy || "ADMIN",
            accessLevel: field.accessLevel || { role: "EMPLOYEE" },
            isUnique: field.isUnique || false,
            isSearchable: field.isSearchable || false,
            isPublished: field.isPublished !== false,
            validationRules: field.validationRules || {},
          }))
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
      }))
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, []);

  const initializeFormData = useCallback((employee, groups) => {
    const initialFormData = {};
    const initialProfileFields = [];

    if (employee) {
      Object.keys(employee).forEach((key) => {
        if (employee[key] !== null && employee[key] !== undefined) {
          initialFormData[key] = employee[key];
        }
      });
    }
    groups.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.key && field.value !== undefined && field.value !== null) {
          let formattedValue = field.value;

          if (field.isRequired && !formattedValue && field.options?.length) {
            if (field.type === "select" || field.type === "radio") {
              formattedValue = field.options[0]?.value || "";
            } else if (field.type === "checkbox") {
              formattedValue = false;
            }
          }
          initialFormData[field.key] = formattedValue;
          if (field.id) {
            initialProfileFields.push({
              id: field.id,
              value: formattedValue,
              key: field.key,
              type: field.type,
            });
          }
        }
      });
    });

    return { formData: initialFormData, profileFields: initialProfileFields };
  }, []);

  const fetchEmployeeProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${URLS.GetOneHrmsEmployee}${employeeId}`,
        {},
        getAuthConfig()
      );
      if (response.data.success) {
        const { employee, profile } = response.data.data;
        setEmployeeData(employee);
        setOriginalEmployeeData({ ...employee });
        if (employee.profileImg) {
          const imgUrl =
            employee.profileImg.startsWith("http") ||
            employee.profileImg.startsWith("data:")
              ? employee.profileImg
              : `${URLS.Base}${employee.profileImg}`;
          setProfileImagePreview(imgUrl);
        } else {
          setProfileImagePreview(null);
        }
        const transformedGroups = transformProfileGroups(profile?.groups || []);
        setProfileGroups(transformedGroups);
        if (transformedGroups.length > 0) {
          setActiveGroup(transformedGroups[0].id);
        }
        const {
          formData: initialFormData,
          profileFields: initialProfileFields,
        } = initializeFormData(employee, transformedGroups);
        setFormData(initialFormData);
        setProfileFieldsData(initialProfileFields);
        setErrors({});
      }
    } catch (error) {
      console.error("Error fetching employee profile:", error);
      toast.error("Failed to fetch employee profile");
    } finally {
      setLoading(false);
    }
  }, [initializeFormData, transformProfileGroups]);

  useEffect(() => {
    fetchInitialData();
    fetchEmployeeProfile();
  }, [fetchInitialData, fetchEmployeeProfile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (
    fieldKey,
    value,
    fieldId = null,
    fieldType = null
  ) => {
    let formattedValue = value;

    switch (fieldType) {
      case "checkbox":
        formattedValue =
          value === true || value === "true" || value === 1 || value === "1";
        break;
      case "number":
        formattedValue = value === "" ? "" : Number(value);
        break;
      case "select":
      case "radio":
        formattedValue = String(value);
        break;
      default:
        formattedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [fieldKey]: formattedValue,
    }));

    if (fieldId) {
      setProfileFieldsData((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === fieldId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            value: formattedValue,
            key: fieldKey,
            type: fieldType,
          };
          return updated;
        }
        return [
          ...prev,
          {
            id: fieldId,
            value: formattedValue,
            key: fieldKey,
            type: fieldType,
          },
        ];
      });
    }

    if (errors[fieldKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const formDataObj = new FormData();

      if (profileImage) {
        formDataObj.append("profileImg", profileImage);
      }

      const employeeFields = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "designationId",
        "departmentId",
        "teamId",
        "role",
        "status",
        "joiningDate",
        "employeeCode",
      ];

      employeeFields.forEach((field) => {
        if (formData[field] !== undefined && formData[field] !== null) {
          formDataObj.append(field, formData[field]);
        }
      });

      const profileFieldsToSend = profileFieldsData.map((field) => ({
        id: field.id,
        value: field.value,
      }));

      if (profileFieldsToSend.length > 0) {
        formDataObj.append(
          "profileFields",
          JSON.stringify(profileFieldsToSend)
        );
      }

      const response = await axios.post(
        `${URLS.EditHrmsEmployee}${employeeId}`,
        formDataObj,
        {
          headers: {
            ...getAuthConfig().headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Employee profile updated successfully");
        if (response.data.data) {
          setEmployeeData(response.data.data);
          setOriginalEmployeeData({ ...response.data.data });
        }
        setProfileImage(null);
        await fetchEmployeeProfile();
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating employee profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldValue = (fieldKey, defaultValue = "") => {
    const value = formData[fieldKey];
    return value === undefined || value === null ? defaultValue : value;
  };

  const getDisplayValue = (id, array, fieldName = "name") => {
    if (!id || !Array.isArray(array)) return "";
    const item = array.find((item) => item.id == id);
    return item ? item[fieldName] : id;
  };

  const hasChanges = () => {
    const basicFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "designationId",
      "departmentId",
      "teamId",
      "status",
      "joiningDate",
      "employeeCode",
    ];

    const hasBasicChanges = basicFields.some((field) => {
      const currentValue = formData[field] || "";
      const originalValue = originalEmployeeData[field] || "";
      return String(currentValue) !== String(originalValue);
    });

    const hasCustomChanges = profileFieldsData.some((field) => {
      const originalField = profileGroups
        .flatMap((g) => g.fields)
        .find((f) => f.id === field.id);
      const originalValue = originalField?.value || "";
      return String(field.value) !== String(originalValue);
    });

    return hasBasicChanges || hasCustomChanges || profileImage;
  };

  const renderFieldInput = (field) => {
    const fieldValue = getFieldValue(field.key, "");
    const error = errors[field.key];
    const fieldType = field.type?.toLowerCase() || "text";
    const options = Array.isArray(field.options) ? field.options : [];

    const commonProps = {
      className: `form-control ${error ? "is-invalid" : ""}`,
      value: fieldValue,
      onChange: (e) =>
        handleInputChange(field.key, e.target.value, field.id, field.type),
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
      title: field.tooltip || "",
      disabled: field.readOnly,
      required: field.isRequired,
    };

    const renderLengthCounter = () => {
      if (
        field.maxChar > 0 &&
        (field.type === "text" || field.type === "textarea")
      ) {
        return (
          <small className="text-muted float-end mt-1">
            {String(fieldValue).length}/{field.maxChar}
          </small>
        );
      }
      return null;
    };

    switch (fieldType) {
      case "textarea":
        return (
          <div>
            <textarea
              {...commonProps}
              rows={1}
              maxLength={field.maxChar > 0 ? field.maxChar : undefined}
            />
            {renderLengthCounter()}
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );

      case "select":
        return (
          <div>
            <select
              className={`form-select ${error ? "is-invalid" : ""}`}
              value={fieldValue}
              onChange={(e) =>
                handleInputChange(
                  field.key,
                  e.target.value,
                  field.id,
                  field.type
                )
              }
              title={field.tooltip || ""}
              disabled={field.readOnly}
              required={field.isRequired}
            >
              <option value="">Select {field.label.toLowerCase()}...</option>
              {options.map((option, idx) => (
                <option key={idx} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );

      case "date":
        return (
          <div>
            <input
              type="date"
              className={`form-control ${error ? "is-invalid" : ""}`}
              value={fieldValue}
              onChange={(e) =>
                handleInputChange(
                  field.key,
                  e.target.value,
                  field.id,
                  field.type
                )
              }
              placeholder={field.placeholder || ""}
              title={field.tooltip || ""}
              max={new Date().toISOString().split("T")[0]}
              disabled={field.readOnly}
              required={field.isRequired}
            />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );

      case "email":
        return (
          <div>
            <input
              type="email"
              className={`form-control ${error ? "is-invalid" : ""}`}
              value={fieldValue}
              onChange={(e) =>
                handleInputChange(
                  field.key,
                  e.target.value,
                  field.id,
                  field.type
                )
              }
              placeholder={
                field.placeholder || `Enter ${field.label.toLowerCase()}`
              }
              title={field.tooltip || ""}
              maxLength={field.maxChar > 0 ? field.maxChar : undefined}
              disabled={field.readOnly}
              required={field.isRequired}
            />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );

      case "number":
        return (
          <div>
            <input
              type="number"
              className={`form-control ${error ? "is-invalid" : ""}`}
              value={fieldValue}
              onChange={(e) =>
                handleInputChange(
                  field.key,
                  e.target.value,
                  field.id,
                  field.type
                )
              }
              placeholder={
                field.placeholder || `Enter ${field.label.toLowerCase()}`
              }
              title={field.tooltip || ""}
              min={field.minChar || undefined}
              max={field.maxChar || undefined}
              disabled={field.readOnly}
              required={field.isRequired}
            />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );

      case "checkbox":
        if (options.length > 0) {
          const currentValues = Array.isArray(fieldValue)
            ? fieldValue
            : [fieldValue].filter(Boolean);

          return (
            <div className="checkbox-group">
              {options.map((option, idx) => {
                const checkboxId = `checkbox-${field.id}-${idx}`;
                const isChecked = currentValues.includes(option.value);

                return (
                  <div className="form-check" key={idx}>
                    <input
                      className={`form-check-input ${
                        error ? "is-invalid" : ""
                      }`}
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        let newValues;
                        if (e.target.checked) {
                          newValues = [...currentValues, option.value];
                        } else {
                          newValues = currentValues.filter(
                            (v) => v !== option.value
                          );
                        }
                        handleInputChange(
                          field.key,
                          newValues,
                          field.id,
                          field.type
                        );
                      }}
                      id={checkboxId}
                      disabled={field.readOnly}
                    />
                    <label className="form-check-label" htmlFor={checkboxId}>
                      {option.label}
                    </label>
                  </div>
                );
              })}
              {error && <div className="invalid-feedback d-block">{error}</div>}
            </div>
          );
        } else {
          return (
            <div className="form-check">
              <input
                className={`form-check-input ${error ? "is-invalid" : ""}`}
                type="checkbox"
                checked={
                  fieldValue === true ||
                  fieldValue === "true" ||
                  fieldValue === 1 ||
                  fieldValue === "1"
                }
                onChange={(e) =>
                  handleInputChange(
                    field.key,
                    e.target.checked,
                    field.id,
                    field.type
                  )
                }
                id={`checkbox-${field.id}`}
                disabled={field.readOnly}
              />
              <label
                className="form-check-label"
                htmlFor={`checkbox-${field.id}`}
              >
                {field.label}
              </label>
              {error && <div className="invalid-feedback d-block">{error}</div>}
            </div>
          );
        }

      case "radio":
        return (
          <div className="radio-group">
            {options.map((option, idx) => {
              const radioId = `radio-${field.id}-${idx}`;
              return (
                <div className="form-check" key={idx}>
                  <input
                    className={`form-check-input ${error ? "is-invalid" : ""}`}
                    type="radio"
                    name={`radio-${field.id}`}
                    value={option.value}
                    checked={fieldValue === option.value}
                    onChange={(e) =>
                      handleInputChange(
                        field.key,
                        e.target.value,
                        field.id,
                        field.type
                      )
                    }
                    id={radioId}
                    disabled={field.readOnly}
                  />
                  <label className="form-check-label" htmlFor={radioId}>
                    {option.label}
                  </label>
                </div>
              );
            })}
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </div>
        );

      default:
        return (
          <div>
            <input
              type="text"
              className={`form-control ${error ? "is-invalid" : ""}`}
              value={fieldValue}
              onChange={(e) =>
                handleInputChange(
                  field.key,
                  e.target.value,
                  field.id,
                  field.type
                )
              }
              placeholder={
                field.placeholder || `Enter ${field.label.toLowerCase()}`
              }
              title={field.tooltip || ""}
              maxLength={field.maxChar > 0 ? field.maxChar : undefined}
              pattern={field.inputFormat || undefined}
              disabled={field.readOnly}
              required={field.isRequired}
            />
            {renderLengthCounter()}
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
    }
  };

  if (loading || loadingDropdowns) {
    return (
      <div className="page-wrapper">
        <div className="content p-3">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "70vh" }}
          >
            <div className="text-center">
              <div
                className="spinner-border text-primary"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading employee profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="page-wrapper">
        <div className="content p-3">
          <div
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>
                <strong>Failed to load employee data</strong>
                <p className="mb-0">
                  Please try refreshing the page or contact support.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
            ></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Edit Employee Profile</h3>
            <p className="text-muted small mb-0">
              Manage employee information and profile details
            </p>
          </div>
          {hasChanges() && (
            <div
              className="alert alert-warning alert-dismissible fade show py-2"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle me-2"></i>
              You have unsaved changes
            </div>
          )}
        </div>
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="row g-4">
              <div className="col-xl-4 col-lg-5">
                <div className="card border-0 bg-light-subtle h-100">
                  <div className="card-body p-3">
                    <h5 className="fw-bold mb-3">Profile Image</h5>
                    <div className="position-relative mb-4">
                      <div className="avatar-xxl text-center">
                        {profileImagePreview ? (
                          <img
                            src={profileImagePreview}
                            alt="Profile"
                            className="img-fluid rounded-circle border border-3 border-white shadow"
                            style={{
                              width: "140px",
                              height: "140px",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                `${formData.firstName || ""} ${
                                  formData.lastName || ""
                                }`
                              )}&background=0d6efd&color=fff&size=140`;
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-white border border-3 border-white d-flex align-items-center justify-content-center mx-auto shadow"
                            style={{
                              width: "140px",
                              height: "140px",
                            }}
                          >
                            <i
                              className="bi bi-person"
                              style={{ fontSize: "3.5rem", color: "#6c757d" }}
                            ></i>
                          </div>
                        )}
                        <button
                          className="btn btn-primary btn-sm rounded-circle shadow position-absolute border border-2 border-white"
                          onClick={triggerFileInput}
                          title="Change Photo"
                          style={{
                            width: "36px",
                            height: "36px",
                            bottom: "10px",
                            right: "calc(50% - 70px + 15px)",
                          }}
                        >
                          <i
                            className="bi bi-camera"
                            style={{ fontSize: "16px" }}
                          ></i>
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          className="d-none"
                        />
                      </div>
                    </div>
                    <div className="text-center mb-2">
                      <h4 className="fw-bold mb-2">
                        {formData.firstName} {formData.lastName}
                      </h4>
                      <p className="text-muted mb-1">
                        {getDisplayValue(
                          formData.designationId,
                          designations
                        ) || "No Designation"}
                      </p>
                      <p className="text-muted small">
                        {getDisplayValue(formData.departmentId, departments) ||
                          "No Department"}
                      </p>
                      {formData.employeeCode && (
                        <p className="text-muted small">
                          {formData.employeeCode}
                        </p>
                      )}
                    </div>
                    {profileImage && (
                      <div className="mt-3 pt-3 border-top">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-file-earmark-image text-primary me-2"></i>
                          <small className="text-muted text-truncate">
                            Selected: {profileImage.name}
                          </small>
                        </div>
                      </div>
                    )}
                    <div className="mt-3 pt-2 border-top">
                      <div className="row g-2">
                        <div className="col-6">
                          <small className="text-muted d-block">
                            Joined Date
                          </small>
                          <span className="fw-medium small">
                            {formData.joiningDate?.slice(0, 10) || "N/A"}
                          </span>
                        </div>
                        <div className="col-6 text-end">
                          <small className="text-muted d-block">Status</small>
                          <span
                            className={`badge ${
                              formData.status === "Active"
                                ? "bg-success"
                                : formData.status === "Inactive"
                                ? "bg-danger"
                                : formData.status === "On Leave"
                                ? "bg-warning"
                                : "bg-secondary"
                            }`}
                          >
                            {formData.status || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-8 col-lg-7">
                <div className="card border-0 h-100">
                  <div className="card-body p-3">
                    <h5 className="fw-bold mb-4">Basic Information</h5>
                    <div className="row g-2">
                      <div className="col-md-4">
                        <label className="form-label small fw-medium mb-1">
                          First Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${
                            errors.firstName ? "is-invalid" : ""
                          }`}
                          value={formData.firstName || ""}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          placeholder="Enter first name"
                          required
                        />
                        {errors.firstName && (
                          <div className="invalid-feedback">
                            {errors.firstName}
                          </div>
                        )}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-medium mb-1">
                          Last Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${
                            errors.lastName ? "is-invalid" : ""
                          }`}
                          value={formData.lastName || ""}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          placeholder="Enter last name"
                          required
                        />
                        {errors.lastName && (
                          <div className="invalid-feedback">
                            {errors.lastName}
                          </div>
                        )}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-medium mb-1">
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className={`form-control ${
                            errors.email ? "is-invalid" : ""
                          }`}
                          value={formData.email || ""}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="Enter email address"
                          required
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-medium mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.phone || ""}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-medium mb-1">
                          Designation
                        </label>
                        <select
                          className="form-select"
                          value={formData.designationId || ""}
                          onChange={(e) =>
                            handleInputChange("designationId", e.target.value)
                          }
                        >
                          <option value="">Select Designation</option>
                          {designations.map((designation) => (
                            <option key={designation.id} value={designation.id}>
                              {designation.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-medium mb-1">
                          Department
                        </label>
                        <select
                          className="form-select"
                          value={formData.departmentId || ""}
                          onChange={(e) =>
                            handleInputChange("departmentId", e.target.value)
                          }
                        >
                          <option value="">Select Department</option>
                          {departments.map((department) => (
                            <option key={department.id} value={department.id}>
                              {department.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-medium mb-1">
                          Team
                        </label>
                        <select
                          className="form-select"
                          value={formData.teamId || ""}
                          onChange={(e) =>
                            handleInputChange("teamId", e.target.value)
                          }
                        >
                          <option value="">Select Team</option>
                          {teamData.map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-medium mb-1">
                          Employee Code
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.employeeCode || ""}
                          onChange={(e) =>
                            handleInputChange("employeeCode", e.target.value)
                          }
                          placeholder="Auto-generated"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-medium mb-1">
                          Joining Date
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.joiningDate?.slice(0, 10) || ""}
                          onChange={(e) =>
                            handleInputChange("joiningDate", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-medium mb-1">
                          Status
                        </label>
                        <select
                          className="form-select"
                          value={formData.status || ""}
                          onChange={(e) =>
                            handleInputChange("status", e.target.value)
                          }
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Terminated">Terminated</option>
                        </select>
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
}

export default OrgChart;
