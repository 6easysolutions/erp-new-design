import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { URLS } from "../../../Urls";
import axios from "axios";

function EmployeeProfile() {
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showEditFieldModal, setShowEditFieldModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [profileGroups, setProfileGroups] = useState([]);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [activeTab, setActiveTab] = useState("basic-info-0");

  const tabsContainerRef = useRef(null);
  const tabsRef = useRef([]);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const [editGroupData, setEditGroupData] = useState({
    groupName: "",
    description: "",
    displayOrder: 0,
    isEditable: true,
    isVisible: true,
    visibleTo: "ALL",
    accessLevel: "SUPER_ADMIN",
    status: "active",
  });

  const [editFieldData, setEditFieldData] = useState({
    id: 0,
    employeeId: 0,
    groupId: 0,
    fieldLabel: "",
    fieldKey: "",
    originalFieldKey: "",
    fieldType: "text",
    displayOrder: 0,
    isVisible: true,
    isEditable: true,
    isPublished: true,
    isRequired: false,
    isUnique: false,
    isSearchable: false,
    isSystemField: false,
    visibleTo: "ALL",
    editableBy: "ADMIN",
    accessLevel: { role: "EMPLOYEE" },
    readOnly: false,
    autoSuggest: false,
    numericOnly: false,
    alphabetsOnly: false,
    alphaNumeric: false,
    inputFormat: "",
    minChar: 0,
    maxChar: 0,
    validationRules: {},
    placeholder: "",
    tooltip: "",
    options: [],
  });

  const [addFieldData, setAddFieldData] = useState({
    fieldLabel: "",
    fieldKey: "",
    originalFieldKey: "",
    fieldType: "text",
    displayOrder: 0,
    isVisible: true,
    isEditable: true,
    isPublished: true,
    isRequired: false,
    isUnique: false,
    isSearchable: false,
    isSystemField: false,
    visibleTo: "ALL",
    editableBy: "ADMIN",
    accessLevel: { role: "EMPLOYEE" },
    readOnly: false,
    autoSuggest: false,
    numericOnly: false,
    alphabetsOnly: false,
    alphaNumeric: false,
    inputFormat: "",
    minChar: 0,
    maxChar: 0,
    validationRules: {},
    placeholder: "",
    tooltip: "",
    options: [],
  });

  const employeeId = 59;

  useEffect(() => {
    fetchEmployeeProfile();
  }, []);

  useEffect(() => {
    updateScrollButtons();
    scrollActiveTabIntoView();

    const container = tabsContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", updateScrollButtons);
      }
    };
  }, [profileGroups, activeTab]);

  const updateScrollButtons = () => {
    const container = tabsContainerRef.current;
    if (!container) return;

    setShowLeftScroll(container.scrollLeft > 0);
    setShowRightScroll(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  };

  const scrollActiveTabIntoView = () => {
    if (activeTab && tabsContainerRef.current) {
      const activeTabElement = tabsRef.current.find(
        (tab) => tab?.dataset?.tabId === activeTab
      );
      if (activeTabElement) {
        const container = tabsContainerRef.current;
        const containerWidth = container.offsetWidth;
        const tabOffset = activeTabElement.offsetLeft;
        const tabWidth = activeTabElement.offsetWidth;

        const scrollPosition = tabOffset - containerWidth / 2 + tabWidth / 2;

        container.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });
      }
    }
  };

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${URLS.GetOneHrmsEmployee}${employeeId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const { employee, profile } = response.data.data;
        setEmployeeData(employee);

        const transformedGroups = (profile?.groups || [])
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map((group) => ({
            id: group.id,
            name: group.groupName,
            description: group.description || "",
            displayOrder: group.displayOrder || 0,
            published: true,
            fields: (group.fields || [])
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
              .map((field) => ({
                id: field.id,
                label: field.fieldLabel,
                key: field.fieldKey,
                type: field.fieldType,
                value: field.value || "",
                isRequired: field.isRequired || false,
                isVisible: field.isVisible !== false,
                displayOrder: field.displayOrder || 0,
                isEditable: field.isEditable !== false,
                isPublished: field.isPublished !== false,
                isUnique: field.isUnique || false,
                isSearchable: field.isSearchable || false,
                visibleTo: field.visibleTo || "ALL",
                editableBy: field.editableBy || "ADMIN",
                accessLevel: field.accessLevel || { role: "EMPLOYEE" },
                readOnly: field.readOnly || false,
                autoSuggest: field.autoSuggest || false,
                numericOnly: field.numericOnly || false,
                alphabetsOnly: field.alphabetsOnly || false,
                alphaNumeric: field.alphaNumeric || false,
                inputFormat: field.inputFormat || "",
                minChar: field.minChar || 0,
                maxChar: field.maxChar || 0,
                placeholder: field.placeholder || "",
                tooltip: field.tooltip || "",
                options: Array.isArray(field.options) ? field.options : [],
              })),
          }));

        const allGroups = [...transformedGroups].sort(
          (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
        );

        setProfileGroups(allGroups);
        if (allGroups.length > 0) {
          setActiveTab(allGroups[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching employee profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      const container = tabsContainerRef.current;

      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  const openEditGroup = (group, isAddNew = false) => {
    if (isAddNew) {
      setEditGroupData({
        groupName: "",
        description: "",
        displayOrder: profileGroups.length,
        isEditable: true,
        isVisible: true,
        visibleTo: "ALL",
        accessLevel: "SUPER_ADMIN",
        status: "active",
      });
      setSelectedGroup(null);
    } else {
      if (group.id === "basic-info-0") {
        toast.info("Basic Information group cannot be modified");
        return;
      }
      setSelectedGroup(group);
      setEditGroupData({
        groupName: group.name,
        description: group.description || "",
        displayOrder: group.displayOrder || 0,
        isEditable: true,
        isVisible: true,
        visibleTo: "ALL",
        accessLevel: "SUPER_ADMIN",
        status: "active",
      });
    }
    setIsAddingGroup(isAddNew);
    setShowEditGroupModal(true);
  };

  const openAddField = (group) => {
    if (group.id === "basic-info-0") {
      toast.info("Cannot add fields to Basic Information group");
      return;
    }
    setSelectedGroup(group);
    setAddFieldData({
      fieldLabel: "",
      fieldKey: "",
      originalFieldKey: "",
      fieldType: "text",
      displayOrder: group.fields?.length || 0,
      isVisible: true,
      isEditable: true,
      isPublished: true,
      isRequired: false,
      isUnique: false,
      isSearchable: false,
      isSystemField: false,
      visibleTo: "ALL",
      editableBy: "ADMIN",
      accessLevel: { role: "EMPLOYEE" },
      readOnly: false,
      autoSuggest: false,
      numericOnly: false,
      alphabetsOnly: false,
      alphaNumeric: false,
      inputFormat: "",
      minChar: 0,
      maxChar: 0,
      validationRules: {},
      placeholder: "",
      tooltip: "",
      options: [],
    });
    setShowAddFieldModal(true);
  };

  const openEditField = (field, group) => {
    if (group.id === "basic-info-0") {
      toast.info("Basic Information fields cannot be modified");
      return;
    }

    setSelectedField(field);
    setSelectedGroup(group);
    setEditFieldData({
      id: field.id || 0,
      employeeId: employeeId,
      groupId: group.id,
      fieldLabel: field.label || "",
      fieldKey: field.key || "",
      originalFieldKey: field.key || "",
      fieldType: field.type || "text",
      displayOrder: field.displayOrder || 0,
      isVisible: field.isVisible !== false,
      isEditable: field.isEditable !== false,
      isPublished: field.isPublished !== false,
      isRequired: field.isRequired || false,
      isUnique: field.isUnique || false,
      isSearchable: field.isSearchable || false,
      isSystemField: false,
      visibleTo: field.visibleTo || "ALL",
      editableBy: field.editableBy || "ADMIN",
      accessLevel: field.accessLevel || { role: "EMPLOYEE" },
      readOnly: field.readOnly || false,
      autoSuggest: field.autoSuggest || false,
      numericOnly: field.numericOnly || false,
      alphabetsOnly: field.alphabetsOnly || false,
      alphaNumeric: field.alphaNumeric || false,
      inputFormat: field.inputFormat || "",
      minChar: field.minChar || 0,
      maxChar: field.maxChar || 0,
      validationRules: {},
      placeholder: field.placeholder || "",
      tooltip: field.tooltip || "",
      options: Array.isArray(field.options) ? field.options : [],
    });

    setShowEditFieldModal(true);
  };

  const handleSaveGroup = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!editGroupData.groupName.trim()) {
        toast.error("Group name is required");
        return;
      }

      const payload = {
        employeeId: employeeId,
        groupName: editGroupData.groupName.trim(),
        description: editGroupData.description.trim(),
        displayOrder: parseInt(editGroupData.displayOrder) || 0,
        isEditable: editGroupData.isEditable,
        isVisible: editGroupData.isVisible,
        visibleTo: editGroupData.visibleTo,
        accessLevel: editGroupData.accessLevel,
        status: editGroupData.status,
      };

      let response;
      if (isAddingGroup) {
        response = await axios.post(
          URLS.AddHrmsEmployeeProfileFieldGroup,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else if (selectedGroup) {
        response = await axios.post(
          URLS.EditHrmsEmployeeProfileFieldGroup,
          {
            id: selectedGroup.id,
            ...payload,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      if (response.data.success) {
        toast.success(
          isAddingGroup
            ? "Group added successfully"
            : "Group updated successfully"
        );
        fetchEmployeeProfile();
        setShowEditGroupModal(false);
      } else {
        toast.error(response.data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving group:", error);
      toast.error("Failed to save group");
    }
  };

  const handleSaveField = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!addFieldData.fieldLabel.trim()) {
        toast.error("Field Label is required");
        return;
      }
      if (!addFieldData.fieldKey.trim()) {
        toast.error("Field Key is required");
        return;
      }
      if (!selectedGroup) {
        toast.error("No group selected");
        return;
      }

      const payload = {
        employeeId: employeeId,
        groupId: selectedGroup.id,
        fieldLabel: addFieldData.fieldLabel.trim(),
        fieldKey: addFieldData.fieldKey.trim(),
        originalFieldKey: addFieldData.fieldKey.trim(),
        fieldType: addFieldData.fieldType,
        displayOrder: parseInt(addFieldData.displayOrder) || 0,
        isVisible: addFieldData.isVisible,
        isEditable: addFieldData.isEditable,
        isPublished: addFieldData.isPublished,
        isRequired: addFieldData.isRequired,
        isUnique: addFieldData.isUnique,
        isSearchable: addFieldData.isSearchable,
        isSystemField: addFieldData.isSystemField,
        visibleTo: addFieldData.visibleTo,
        editableBy: addFieldData.editableBy,
        accessLevel: addFieldData.accessLevel,
        readOnly: addFieldData.readOnly,
        autoSuggest: addFieldData.autoSuggest,
        numericOnly: addFieldData.numericOnly,
        alphabetsOnly: addFieldData.alphabetsOnly,
        alphaNumeric: addFieldData.alphaNumeric,
        inputFormat: addFieldData.inputFormat,
        minChar: addFieldData.minChar ? parseInt(addFieldData.minChar) : 0,
        maxChar: addFieldData.maxChar ? parseInt(addFieldData.maxChar) : 0,
        validationRules: addFieldData.validationRules,
        placeholder: addFieldData.placeholder,
        tooltip: addFieldData.tooltip,
        options: addFieldData.options,
      };

      const response = await axios.post(
        URLS.AddHrmsEmployeeProfileField,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Field added successfully");
        fetchEmployeeProfile();
        setShowAddFieldModal(false);
      } else {
        toast.error(response.data.message || "Failed to add field");
      }
    } catch (error) {
      console.error("Error adding field:", error);
      toast.error("Failed to add field");
    }
  };

  const handleUpdateField = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!editFieldData.fieldLabel.trim()) {
        toast.error("Field Label is required");
        return;
      }
      if (!editFieldData.id) {
        toast.error("Field ID is required for editing");
        return;
      }

      const payload = {
        id: editFieldData.id,
        employeeId: editFieldData.employeeId,
        groupId: editFieldData.groupId,
        fieldLabel: editFieldData.fieldLabel.trim(),
        fieldKey: editFieldData.fieldKey.trim(),
        originalFieldKey: editFieldData.originalFieldKey,
        fieldType: editFieldData.fieldType,
        displayOrder: parseInt(editFieldData.displayOrder) || 0,
        isVisible: editFieldData.isVisible,
        isEditable: editFieldData.isEditable,
        isPublished: editFieldData.isPublished,
        isRequired: editFieldData.isRequired,
        isUnique: editFieldData.isUnique,
        isSearchable: editFieldData.isSearchable,
        isSystemField: editFieldData.isSystemField,
        visibleTo: editFieldData.visibleTo,
        editableBy: editFieldData.editableBy,
        accessLevel: editFieldData.accessLevel,
        readOnly: editFieldData.readOnly,
        autoSuggest: editFieldData.autoSuggest,
        numericOnly: editFieldData.numericOnly,
        alphabetsOnly: editFieldData.alphabetsOnly,
        alphaNumeric: editFieldData.alphaNumeric,
        inputFormat: editFieldData.inputFormat,
        minChar: editFieldData.minChar ? parseInt(editFieldData.minChar) : 0,
        maxChar: editFieldData.maxChar ? parseInt(editFieldData.maxChar) : 0,
        validationRules: editFieldData.validationRules,
        placeholder: editFieldData.placeholder,
        tooltip: editFieldData.tooltip,
        options: editFieldData.options,
      };

      const response = await axios.post(
        URLS.EditHrmsEmployeeProfileField,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Field updated successfully");
        fetchEmployeeProfile();
        setShowEditFieldModal(false);
      } else {
        toast.error(response.data.message || "Failed to update field");
      }
    } catch (error) {
      console.error("Error updating field:", error);
      toast.error("Failed to update field");
    }
  };

  const handleAddOption = (type = "add") => {
    const newOption = { label: "", value: "" };

    if (type === "add") {
      setAddFieldData({
        ...addFieldData,
        options: [...addFieldData.options, newOption],
      });
    } else {
      setEditFieldData({
        ...editFieldData,
        options: [...editFieldData.options, newOption],
      });
    }
  };

  const handleUpdateOption = (index, field, value, type = "add") => {
    if (type === "add") {
      const updatedOptions = [...addFieldData.options];
      updatedOptions[index][field] = value;
      setAddFieldData({
        ...addFieldData,
        options: updatedOptions,
      });
    } else {
      const updatedOptions = [...editFieldData.options];
      updatedOptions[index][field] = value;
      setEditFieldData({
        ...editFieldData,
        options: updatedOptions,
      });
    }
  };

  const handleRemoveOption = (index, type = "add") => {
    if (type === "add") {
      const updatedOptions = [...addFieldData.options];
      updatedOptions.splice(index, 1);
      setAddFieldData({
        ...addFieldData,
        options: updatedOptions,
      });
    } else {
      const updatedOptions = [...editFieldData.options];
      updatedOptions.splice(index, 1);
      setEditFieldData({
        ...editFieldData,
        options: updatedOptions,
      });
    }
  };

  const activeGroup = profileGroups.find((group) => group.id === activeTab);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content p-3">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "50vh" }}
          >
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading profile...</p>
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
          <div className="alert alert-danger">Failed to load employee data</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="content mb-4">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="avatar-xl position-relative">
                    {employeeData.profileImg ? (
                      <img
                        src={URLS.Base + employeeData.profileImg}
                        alt="Profile"
                        className="img-fluid rounded-circle border"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center border"
                        style={{ width: "80px", height: "80px" }}
                      >
                        <i
                          className="bi bi-person text-muted"
                          style={{ fontSize: "2rem" }}
                        ></i>
                      </div>
                    )}
                    <span
                      className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
                      style={{ width: "12px", height: "12px" }}
                    ></span>
                  </div>
                </div>
                <div className="col">
                  <h4 className="fw-bold mb-1">
                    {employeeData.firstName} {employeeData.lastName}
                  </h4>
                  <p className="text-muted mb-2">
                    {employeeData.designationName || "Employee"}
                  </p>
                  <div className="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-2 g-md-3">
                    <div>
                      <small className="text-muted d-block">
                        Employee Code
                      </small>
                      <span className="fw-medium">
                        {employeeData.employeeCode}
                      </span>
                    </div>
                    <div>
                      <small className="text-muted d-block">Email</small>
                      <span className="fw-medium">{employeeData.email}</span>
                    </div>
                    <div>
                      <small className="text-muted d-block">Phone</small>
                      <span className="fw-medium">{employeeData.phone}</span>
                    </div>
                    <div>
                      <small className="text-muted d-block">Designation</small>
                      <span className="fw-medium">
                        {employeeData.designationName}
                      </span>
                    </div>
                    <div>
                      <small className="text-muted d-block">Department</small>
                      <span className="fw-medium">
                        {employeeData.departmentName}
                      </span>
                    </div>
                    <div>
                      <small className="text-muted d-block">Team</small>
                      <span className="fw-medium">{employeeData.teamName}</span>
                    </div>
                  </div>
                </div>
                <div className="col-auto">
                  <Link to="/hrms/editprofiledata">
                    <button className="btn btn-primary">
                      <i className="bi bi-pencil me-2"></i>Edit Profile
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="card border-0 shadow-sm ">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold mb-1">Profile Information</h5>
                  <p className="text-muted mb-0">
                    Manage custom profile fields and groups
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => openEditGroup(null, true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>Add Group
                </button>
              </div>
              <div
                className="position-relative mb-4"
                style={{ minHeight: "60px" }}
              >
                {profileGroups.length > 0 && (
                  <>
                    {showLeftScroll && (
                      <button
                        className="btn btn-light border position-absolute start-0 top-50 translate-middle-y z-2 shadow-sm"
                        style={{
                          left: "-15px",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          padding: "0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "white",
                        }}
                        onClick={() => scrollTabs("left")}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    )}
                    <div
                      ref={tabsContainerRef}
                      className="d-flex overflow-auto hide-scrollbar"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        padding: "0 10px",
                      }}
                    >
                      <style>
                        {`
                          .hide-scrollbar::-webkit-scrollbar { display: none; }
                          .nav-tab { min-width: 140px; transition: all 0.2s ease; }
                          .nav-tab:hover { transform: translateY(-2px); }
                          @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                          }
                          .animate-fade-in { animation: fadeIn 0.3s ease-out; }
                        `}
                      </style>
                      <div className="d-flex flex-nowrap gap-2 pb-1">
                        {profileGroups.map((group, index) => (
                          <button
                            key={group.id}
                            ref={(el) => (tabsRef.current[index] = el)}
                            data-tab-id={group.id}
                            className={`nav-tab btn d-flex align-items-center justify-content-center gap-2 ${
                              activeTab === group.id
                                ? "btn-primary text-white shadow-sm"
                                : "btn-outline-primary"
                            }`}
                            onClick={() => setActiveTab(group.id)}
                            style={{
                              whiteSpace: "nowrap",
                              padding: "8px 16px",
                              borderRadius: "8px",
                              borderWidth: "2px",
                            }}
                          >
                            {group.id === "basic-info-0" ? (
                              <i className="bi bi-person-badge"></i>
                            ) : (
                              <i className="bi bi-folder2"></i>
                            )}
                            <span className="fw-medium">{group.name}</span>
                            {group.id === "basic-info-0" && (
                              <span
                                className="badge bg-light text-dark ms-1"
                                style={{ fontSize: "0.6rem" }}
                              >
                                System
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    {showRightScroll && (
                      <button
                        className="btn btn-light border position-absolute end-0 top-50 translate-middle-y z-2 shadow-sm"
                        style={{
                          right: "-15px",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          padding: "0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "white",
                        }}
                        onClick={() => scrollTabs("right")}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    )}
                  </>
                )}
              </div>
              {activeGroup && (
                <div className="mt-4 animate-fade-in">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h6 className="fw-bold text-dark mb-1">
                        {activeGroup.name}
                      </h6>
                      {activeGroup.description && (
                        <p className="text-muted small mb-0">
                          {activeGroup.description}
                        </p>
                      )}
                      <div className="mt-1">
                        <span className="badge bg-light text-dark border me-2">
                          {activeGroup.fields?.length || 0} Fields
                        </span>
                        {activeGroup.id === "basic-info-0" && (
                          <span className="badge bg-info bg-opacity-10 text-info border-0">
                            System Group
                          </span>
                        )}
                      </div>
                    </div>
                    {activeGroup.id !== "basic-info-0" && (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => openEditGroup(activeGroup)}
                        >
                          <i className="bi bi-pencil me-1"></i>Edit Group
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => openAddField(activeGroup)}
                        >
                          <i className="bi bi-plus-circle me-1"></i>Add Field
                        </button>
                      </div>
                    )}
                  </div>
                  {activeGroup.fields && activeGroup.fields.length > 0 ? (
                    <div className="row g-3">
                      {activeGroup.fields.map((field) => (
                        <div className="col-md-4" key={field.id}>
                          <div className="border rounded p-3 bg-white h-100 d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <span className="fw-semibold text-dark">
                                  {field.label}
                                </span>
                                {field.isRequired && (
                                  <span
                                    className="badge bg-danger bg-opacity-10 text-danger border-0"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    Required
                                  </span>
                                )}
                                {!field.isVisible && (
                                  <span
                                    className="badge bg-warning bg-opacity-10 text-warning border-0"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    Hidden
                                  </span>
                                )}
                                {field.isUnique && (
                                  <span
                                    className="badge bg-info bg-opacity-10 text-info border-0"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    Unique
                                  </span>
                                )}
                              </div>
                              {activeGroup.id !== "basic-info-0" && (
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-link btn-sm p-0 text-decoration-none"
                                    onClick={() =>
                                      openEditField(field, activeGroup)
                                    }
                                    title="Edit Field"
                                  >
                                    <i className="bi bi-pencil text-primary"></i>
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="d-flex flex-wrap gap-2 mb-3">
                              <span className="badge bg-light text-dark border">
                                <i className="bi bi-tag me-1"></i>
                                {field.type}
                              </span>
                              <span className="badge bg-info bg-opacity-10 text-info border-0">
                                <i className="bi bi-eye me-1"></i>
                                {field.visibleTo}
                              </span>
                              {field.minChar > 0 && (
                                <span className="badge bg-light text-dark border">
                                  Min: {field.minChar}
                                </span>
                              )}
                              {field.maxChar > 0 && (
                                <span className="badge bg-light text-dark border">
                                  Max: {field.maxChar}
                                </span>
                              )}
                              {field.readOnly && (
                                <span className="badge bg-secondary bg-opacity-10 text-secondary border-0">
                                  <i className="bi bi-lock me-1"></i>Read Only
                                </span>
                              )}
                            </div>

                            {field.tooltip && (
                              <div className="text-muted small mt-auto">
                                <i className="bi bi-info-circle me-1"></i>
                                {field.tooltip}
                              </div>
                            )}

                            {field.options && field.options.length > 0 && (
                              <div className="mt-2">
                                <small className="text-muted d-block mb-1">
                                  Options:
                                </small>
                                <div className="d-flex flex-wrap gap-1">
                                  {field.options
                                    .slice(0, 3)
                                    .map((option, idx) => (
                                      <span
                                        key={idx}
                                        className="badge bg-light text-dark border"
                                      >
                                        {option.label}
                                      </span>
                                    ))}
                                  {field.options.length > 3 && (
                                    <span className="badge bg-light text-dark border">
                                      +{field.options.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5 border rounded bg-light-subtle">
                      <i
                        className="bi bi-inboxes text-muted mb-3"
                        style={{ fontSize: "2.5rem" }}
                      ></i>
                      <p className="text-muted mb-3">No fields configured</p>
                      {activeGroup.id !== "basic-info-0" && (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => openAddField(activeGroup)}
                        >
                          <i className="bi bi-plus-circle me-1"></i>Add First
                          Field
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showEditGroupModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom p-4">
                <h5 className="modal-title fw-bold">
                  {isAddingGroup ? "Add New Group" : "Edit Group"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditGroupModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-4">
                  <label className="form-label fw-medium">
                    Group Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editGroupData.groupName}
                    onChange={(e) =>
                      setEditGroupData({
                        ...editGroupData,
                        groupName: e.target.value,
                      })
                    }
                    placeholder="Enter group name"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editGroupData.description}
                    onChange={(e) =>
                      setEditGroupData({
                        ...editGroupData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Optional description"
                  />
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Display Order
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={editGroupData.displayOrder}
                      onChange={(e) =>
                        setEditGroupData({
                          ...editGroupData,
                          displayOrder: e.target.value,
                        })
                      }
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Visible To</label>
                    <select
                      className="form-select"
                      value={editGroupData.visibleTo}
                      onChange={(e) =>
                        setEditGroupData({
                          ...editGroupData,
                          visibleTo: e.target.value,
                        })
                      }
                    >
                      <option value="ALL">All</option>
                      <option value="SELF">Self</option>
                      <option value="ADMIN">Admin Only</option>
                      <option value="MANAGER">Manager Only</option>
                    </select>
                  </div>
                </div>
                <div className="row g-3 mb-2">
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={editGroupData.isVisible}
                        onChange={(e) =>
                          setEditGroupData({
                            ...editGroupData,
                            isVisible: e.target.checked,
                          })
                        }
                      />
                      <label className="form-check-label fw-medium">
                        Visible
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={editGroupData.isEditable}
                        onChange={(e) =>
                          setEditGroupData({
                            ...editGroupData,
                            isEditable: e.target.checked,
                          })
                        }
                      />
                      <label className="form-check-label fw-medium">
                        Editable
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top p-4">
                <button
                  className="btn btn-light px-4"
                  onClick={() => setShowEditGroupModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary px-4"
                  onClick={handleSaveGroup}
                >
                  {isAddingGroup ? "Add Group" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddFieldModal && selectedGroup && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom p-4">
                <h5 className="modal-title fw-bold">
                  Add Field to {selectedGroup.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddFieldModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Field Label <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={addFieldData.fieldLabel}
                      onChange={(e) =>
                        setAddFieldData({
                          ...addFieldData,
                          fieldLabel: e.target.value,
                        })
                      }
                      placeholder="e.g., Date of Birth"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Field Key <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={addFieldData.fieldKey}
                      onChange={(e) =>
                        setAddFieldData({
                          ...addFieldData,
                          fieldKey: e.target.value,
                        })
                      }
                      placeholder="e.g., dateOfBirth"
                    />
                  </div>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label fw-medium">Field Type</label>
                    <select
                      className="form-select"
                      value={addFieldData.fieldType}
                      onChange={(e) =>
                        setAddFieldData({
                          ...addFieldData,
                          fieldType: e.target.value,
                        })
                      }
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Text Area</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="date">Date</option>
                      <option value="select">Select</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="radio">Radio</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-medium">
                      Display Order
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={addFieldData.displayOrder}
                      onChange={(e) =>
                        setAddFieldData({
                          ...addFieldData,
                          displayOrder: e.target.value,
                        })
                      }
                      min="0"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-medium">Visible To</label>
                    <select
                      className="form-select"
                      value={addFieldData.visibleTo}
                      onChange={(e) =>
                        setAddFieldData({
                          ...addFieldData,
                          visibleTo: e.target.value,
                        })
                      }
                    >
                      <option value="ALL">All</option>
                      <option value="SELF">Self</option>
                      <option value="ADMIN">Admin Only</option>
                      <option value="MANAGER">Manager Only</option>
                    </select>
                  </div>
                </div>
                {(addFieldData.fieldType === "select" ||
                  addFieldData.fieldType === "radio" ||
                  addFieldData.fieldType === "checkbox") && (
                  <div className="border rounded p-3 mb-4 bg-light-subtle">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-medium mb-0">Field Options</h6>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleAddOption("add")}
                      >
                        <i className="bi bi-plus me-1"></i>Add Option
                      </button>
                    </div>
                    {addFieldData.options.map((option, index) => (
                      <div
                        key={index}
                        className="row g-2 mb-2 align-items-center"
                      >
                        <div className="col-md-6">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Display Label"
                            value={option.label || ""}
                            onChange={(e) =>
                              handleUpdateOption(
                                index,
                                "label",
                                e.target.value,
                                "add"
                              )
                            }
                          />
                        </div>
                        <div className="col-md-5">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Value"
                            value={option.value || ""}
                            onChange={(e) =>
                              handleUpdateOption(
                                index,
                                "value",
                                e.target.value,
                                "add"
                              )
                            }
                          />
                        </div>
                        <div className="col-md-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger p-0"
                            onClick={() => handleRemoveOption(index, "add")}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    {addFieldData.options.length === 0 && (
                      <div className="text-center py-2 text-muted">
                        No options added. Click "Add Option" to add choices.
                      </div>
                    )}
                  </div>
                )}
                <div className="border rounded p-3 mb-4 bg-light-subtle">
                  <h6 className="fw-medium mb-3">Field Settings</h6>
                  <div className="row g-3">
                    {[
                      { key: "isRequired", label: "Required", color: "danger" },
                      {
                        key: "isPublished",
                        label: "Published",
                        color: "success",
                      },
                      { key: "isVisible", label: "Visible", color: "primary" },
                      {
                        key: "isEditable",
                        label: "Editable",
                        color: "warning",
                      },
                      {
                        key: "readOnly",
                        label: "Read Only",
                        color: "secondary",
                      },
                      {
                        key: "isSearchable",
                        label: "Searchable",
                        color: "info",
                      },
                      { key: "isUnique", label: "Unique", color: "dark" },
                      {
                        key: "numericOnly",
                        label: "Numeric Only",
                        color: "info",
                      },
                      {
                        key: "alphabetsOnly",
                        label: "Alphabets Only",
                        color: "info",
                      },
                      {
                        key: "alphaNumeric",
                        label: "Alpha Numeric",
                        color: "info",
                      },
                      {
                        key: "autoSuggest",
                        label: "Auto Suggest",
                        color: "info",
                      },
                    ].map((item) => (
                      <div className="col-md-4" key={item.key}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={addFieldData[item.key]}
                            onChange={(e) =>
                              setAddFieldData({
                                ...addFieldData,
                                [item.key]: e.target.checked,
                              })
                            }
                          />
                          <label className="form-check-label small">
                            {item.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-medium">
                      Min Characters
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={addFieldData.minChar}
                      onChange={(e) =>
                        setAddFieldData({
                          ...addFieldData,
                          minChar: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-medium">
                      Max Characters
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={addFieldData.maxChar}
                      onChange={(e) =>
                        setAddFieldData({
                          ...addFieldData,
                          maxChar: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-medium">Placeholder</label>
                    <input
                      type="text"
                      className="form-control"
                      value={addFieldData.placeholder}
                      onChange={(e) =>
                        setAddFieldData({
                          ...addFieldData,
                          placeholder: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-medium">Tooltip</label>
                    <input
                      type="text"
                      className="form-control"
                      value={addFieldData.tooltip}
                      onChange={(e) =>
                        setAddFieldData({
                          ...addFieldData,
                          tooltip: e.target.value,
                        })
                      }
                      placeholder="Help text for users"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top p-4">
                <button
                  className="btn btn-light px-4"
                  onClick={() => setShowAddFieldModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary px-4"
                  onClick={handleSaveField}
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditFieldModal && selectedField && selectedGroup && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom p-4">
                <h5 className="modal-title fw-bold">
                  Edit Field: {selectedField.label}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditFieldModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Field Label <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFieldData.fieldLabel}
                      onChange={(e) =>
                        setEditFieldData({
                          ...editFieldData,
                          fieldLabel: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Field Key</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFieldData.fieldKey}
                      onChange={(e) =>
                        setEditFieldData({
                          ...editFieldData,
                          fieldKey: e.target.value,
                        })
                      }
                      readOnly={editFieldData.isSystemField}
                    />
                  </div>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label fw-medium">Field Type</label>
                    <select
                      className="form-select"
                      value={editFieldData.fieldType}
                      onChange={(e) =>
                        setEditFieldData({
                          ...editFieldData,
                          fieldType: e.target.value,
                        })
                      }
                      disabled={editFieldData.isSystemField}
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Text Area</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="date">Date</option>
                      <option value="select">Select</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="radio">Radio</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-medium">
                      Display Order
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={editFieldData.displayOrder}
                      onChange={(e) =>
                        setEditFieldData({
                          ...editFieldData,
                          displayOrder: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-medium">Visible To</label>
                    <select
                      className="form-select"
                      value={editFieldData.visibleTo}
                      onChange={(e) =>
                        setEditFieldData({
                          ...editFieldData,
                          visibleTo: e.target.value,
                        })
                      }
                    >
                      <option value="ALL">All</option>
                      <option value="SELF">Self</option>
                      <option value="ADMIN">Admin Only</option>
                      <option value="MANAGER">Manager Only</option>
                    </select>
                  </div>
                </div>
                {(editFieldData.fieldType === "select" ||
                  editFieldData.fieldType === "radio" ||
                  editFieldData.fieldType === "checkbox") && (
                  <div className="border rounded p-3 mb-4 bg-light-subtle">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-medium mb-0">Field Options</h6>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleAddOption("edit")}
                      >
                        <i className="bi bi-plus me-1"></i>Add Option
                      </button>
                    </div>
                    {editFieldData.options.map((option, index) => (
                      <div
                        key={index}
                        className="row g-2 mb-2 align-items-center"
                      >
                        <div className="col-md-6">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Display Label"
                            value={option.label || ""}
                            onChange={(e) =>
                              handleUpdateOption(
                                index,
                                "label",
                                e.target.value,
                                "edit"
                              )
                            }
                          />
                        </div>
                        <div className="col-md-5">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Value"
                            value={option.value || ""}
                            onChange={(e) =>
                              handleUpdateOption(
                                index,
                                "value",
                                e.target.value,
                                "edit"
                              )
                            }
                          />
                        </div>
                        <div className="col-md-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger p-0"
                            onClick={() => handleRemoveOption(index, "edit")}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    {editFieldData.options.length === 0 && (
                      <div className="text-center py-2 text-muted">
                        No options added. Click "Add Option" to add choices.
                      </div>
                    )}
                  </div>
                )}
                <div className="border rounded p-3 mb-4 bg-light-subtle">
                  <h6 className="fw-medium mb-3">Field Settings</h6>
                  <div className="row g-3">
                    {[
                      { key: "isRequired", label: "Required", color: "danger" },
                      {
                        key: "isPublished",
                        label: "Published",
                        color: "success",
                      },
                      { key: "isVisible", label: "Visible", color: "primary" },
                      {
                        key: "isEditable",
                        label: "Editable",
                        color: "warning",
                      },
                      {
                        key: "readOnly",
                        label: "Read Only",
                        color: "secondary",
                      },
                      {
                        key: "isSearchable",
                        label: "Searchable",
                        color: "info",
                      },
                      { key: "isUnique", label: "Unique", color: "dark" },
                      {
                        key: "numericOnly",
                        label: "Numeric Only",
                        color: "info",
                      },
                      {
                        key: "alphabetsOnly",
                        label: "Alphabets Only",
                        color: "info",
                      },
                      {
                        key: "alphaNumeric",
                        label: "Alpha Numeric",
                        color: "info",
                      },
                      {
                        key: "autoSuggest",
                        label: "Auto Suggest",
                        color: "info",
                      },
                    ].map((item) => (
                      <div className="col-md-4" key={item.key}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={editFieldData[item.key]}
                            onChange={(e) =>
                              setEditFieldData({
                                ...editFieldData,
                                [item.key]: e.target.checked,
                              })
                            }
                            disabled={
                              item.key === "isSystemField" &&
                              editFieldData.isSystemField
                            }
                          />
                          <label className="form-check-label small">
                            {item.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-medium">
                      Min Characters
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={editFieldData.minChar}
                      onChange={(e) =>
                        setEditFieldData({
                          ...editFieldData,
                          minChar: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-medium">
                      Max Characters
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={editFieldData.maxChar}
                      onChange={(e) =>
                        setEditFieldData({
                          ...editFieldData,
                          maxChar: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-medium">Placeholder</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFieldData.placeholder}
                      onChange={(e) =>
                        setEditFieldData({
                          ...editFieldData,
                          placeholder: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-medium">Tooltip</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFieldData.tooltip}
                      onChange={(e) =>
                        setEditFieldData({
                          ...editFieldData,
                          tooltip: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top p-4">
                <button
                  className="btn btn-light px-4"
                  onClick={() => setShowEditFieldModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary px-4"
                  onClick={handleUpdateField}
                >
                  Update Field
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EmployeeProfile;
