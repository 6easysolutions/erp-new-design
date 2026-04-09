// import React, { useState, useEffect } from "react";
// import { URLS } from "../../../Urls";
// import axios from "axios";

// function EmployeeProfile() {
//   const [showEditGroupModal, setShowEditGroupModal] = useState(false);
//   const [showAddFieldModal, setShowAddFieldModal] = useState(false);
//   const [selectedGroup, setSelectedGroup] = useState("Basic Info");

//   useEffect(() => {
//     fetchDepartments();
//   }, []);

//   const fetchDepartments = () => {
//     const token = localStorage.getItem("authToken");

//     axios
//       .post(
//         URLS.GetOneHrmsEmployee + 59,
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       )
//       .then((res) => {

//       })
//       .catch((error) => {
//         console.error("Error fetching departments:", error);
//         toast.error("Failed to fetch departments");
//       });
//   };

//   const groups = [
//     { name: "Personal Information", fields: [], published: false },
//     { name: "Contact Information", fields: [], published: false },
//     { name: "Educational Information", fields: [], published: false },
//     { name: "Employment Information", fields: [], published: false },
//     { name: "Bank / PF Account Information", fields: [], published: false },
//     { name: "Documents", fields: [], published: false },
//     { name: "Salary Information", fields: [], published: false },
//   ];

//   const [profileGroups, setProfileGroups] = useState(groups);

//   const openEditGroup = (groupName) => {
//     setSelectedGroup(groupName);
//     setShowEditGroupModal(true);
//   };

//   const openAddField = (groupName) => {
//     setSelectedGroup(groupName);
//     setShowAddFieldModal(true);
//   };

//   return (
//     <>
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="alert alert-success rounded-0 py-2 text-center m-0">
//             <strong>Hey!!</strong> You have not punched in for the day. Your
//             attendance is not recorded.
//           </div>

//           <div className="card rounded-0 border-0 border-bottom shadow-sm">
//             <div className="card-body p-4 d-flex align-items-start gap-4">
//               <div
//                 className="rounded-circle border overflow-hidden"
//                 style={{
//                   width: "120px",
//                   height: "120px",
//                   background:
//                     "conic-gradient(#ff9999 0% 15%, #ffcc99 15% 30%, #ffff99 30% 45%, #ccff99 45% 60%, #99ffcc 60% 75%, #99ccff 75% 90%, #cc99ff 90% 100%)",
//                 }}
//               ></div>

//               <div className="flex-grow-1">
//                 <h4 className="fw-semibold mb-1">Md</h4>
//                 <div className="row text-muted small mb-3">
//                   <div className="col-md-3 col-6">Employee Code: NA</div>
//                   <div className="col-md-3 col-6">Email: info@iotroncs.com</div>
//                   <div className="col-md-3 col-6">Mobile No: 9849344919</div>
//                   <div className="col-md-3 col-6">Employment Status: NA</div>
//                 </div>
//                 <div className="row text-muted small">
//                   <div className="col-md-3 col-6">Usergroup: Admin</div>
//                   <div className="col-md-3 col-6 d-flex align-items-center gap-2">
//                     Reports To:
//                     <img
//                       src="https://static.startuptalky.com/2022/05/uKnowva-Logo-StartupTalky.jpg"
//                       className="rounded-circle"
//                       width="30"
//                       height="30"
//                       alt="uKnowva"
//                       style={{ objectFit: "contain" }}
//                     />{" "}
//                     uKnowva System
//                   </div>
//                 </div>

//                 <div className="mt-3 d-flex gap-3 align-items-center small">
//                   <button className="btn btn-light btn-sm">
//                     <i className="bi bi-heart"></i> Like
//                   </button>
//                   {["Points", "Colleagues", "Photos", "Activities"].map(
//                     (item) => (
//                       <span
//                         key={item}
//                         className="badge bg-secondary rounded-pill"
//                       >
//                         0 {item}
//                       </span>
//                     )
//                   )}
//                 </div>
//               </div>

//               <button className="btn btn-success btn-sm align-self-start">
//                 Edit Profile
//               </button>
//             </div>
//           </div>

//           <div className="card border-0 rounded-0 shadow-sm mt-4">
//             <div className="card-body p-4">
//               <div className="d-flex justify-content-between align-items-center mb-4">
//                 <div className="d-flex gap-3">
//                   <h5 className="fw-semibold mb-0">Basic Info</h5>
//                   <button className="btn btn-outline-secondary btn-sm">
//                     Configure Profile Fields{" "}
//                     <span className="badge bg-danger ms-1">Off</span>
//                   </button>
//                   <button className="btn btn-success btn-sm">Add Group</button>
//                 </div>
//               </div>

//               {/* Tabs */}
//               <ul className="nav nav-tabs mb-4 border-bottom">
//                 {[
//                   "Employee Details",
//                   "Payroll",
//                   "Leaves",
//                   "Employee Timeline",
//                 ].map((tab, i) => (
//                   <li className="nav-item" key={i}>
//                     <a
//                       className={`nav-link ${i === 0 ? "active" : ""}`}
//                       href="#"
//                     >
//                       {tab}
//                     </a>
//                   </li>
//                 ))}
//               </ul>

//               {/* Dynamic Groups Rendering */}
//               {profileGroups.map((group, groupIdx) => (
//                 <div key={groupIdx} className={groupIdx > 0 ? "mt-4" : ""}>
//                   {/* Basic Info - Grid Layout */}
//                   {group.name === "Basic Info" ? (
//                     <>
//                       <div className="d-flex justify-content-end gap-2 mb-3">
//                         <button
//                           className="btn btn-outline-secondary btn-sm"
//                           onClick={() => openEditGroup(group.name)}
//                         >
//                           Edit Group
//                         </button>
//                         <button
//                           className="btn btn-success btn-sm"
//                           onClick={() => openAddField(group.name)}
//                         >
//                           Add Field
//                         </button>
//                       </div>

//                       <div className="row g-4">
//                         {group.fields.map((field, idx) => (
//                           <div className="col-md-4" key={idx}>
//                             <div className="border rounded p-3 d-flex justify-content-between align-items-center bg-white shadow-sm">
//                               <div>
//                                 {field.icon && (
//                                   <i className="bi bi-pencil-square text-info me-2"></i>
//                                 )}
//                                 <strong>{field.label}</strong>
//                                 {field.value && (
//                                   <div className="text-muted small mt-1">
//                                     {field.value}
//                                   </div>
//                                 )}
//                               </div>
//                               <i
//                                 className="bi bi-pencil-square text-info"
//                                 style={{ fontSize: "18px" }}
//                               ></i>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </>
//                   ) : (
//                     /* Accordion for other groups */
//                     <div className="accordion" id="profileAccordion">
//                       <div className="accordion-item border-0 border-bottom">
//                         <h2 className="accordion-header">
//                           <button
//                             className="accordion-button collapsed shadow-none fw-semibold"
//                             type="button"
//                             data-bs-toggle="collapse"
//                             data-bs-target={`#collapse${groupIdx}`}
//                           >
//                             {group.name}
//                           </button>
//                         </h2>
//                         <div
//                           id={`collapse${groupIdx}`}
//                           className="accordion-collapse collapse"
//                           data-bs-parent="#profileAccordion"
//                         >
//                           <div className="accordion-body pt-3">
//                             <div className="d-flex justify-content-end gap-2 mb-3">
//                               <button
//                                 className="btn btn-outline-secondary btn-sm"
//                                 onClick={() => openEditGroup(group.name)}
//                               >
//                                 Edit Group
//                               </button>
//                               <button
//                                 className="btn btn-success btn-sm"
//                                 onClick={() => openAddField(group.name)}
//                               >
//                                 Add Field
//                               </button>
//                             </div>
//                             <p className="text-muted small m-0">
//                               {group.fields.length === 0
//                                 ? "No data available"
//                                 : `${group.fields.length} field(s) configured`}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}

//               {/* Organization Chart */}
//               <div className="mt-5 p-4 bg-white rounded shadow-sm">
//                 <h5 className="fw-semibold mb-4">Organization Chart</h5>
//                 <div className="row g-3 align-items-end mb-4">
//                   <div className="col-md-3">
//                     <select className="form-select">
//                       <option>Level 2</option>
//                     </select>
//                   </div>
//                   <div className="col-md-3">
//                     <select className="form-select">
//                       <option>--Company--</option>
//                     </select>
//                   </div>
//                   <div className="col-md-3">
//                     <select className="form-select">
//                       <option>--Department--</option>
//                     </select>
//                   </div>
//                   <div className="col-md-3">
//                     <button className="btn btn-primary w-100">Reset</button>
//                   </div>
//                 </div>

//                 <div className="d-flex flex-column align-items-center mt-5">
//                   <div className="text-center mb-4">
//                     <img
//                       src="https://static.startuptalky.com/2022/05/uKnowva-Logo-StartupTalky.jpg"
//                       className="rounded-circle mb-2 border"
//                       width="80"
//                       height="80"
//                       alt="uKnowva"
//                       style={{ objectFit: "contain" }}
//                     />
//                     <div className="fw-semibold">uKnowva System</div>
//                   </div>
//                   <div
//                     className="border-start border-4 border-secondary mx-auto"
//                     style={{ height: "80px", width: "1px" }}
//                   ></div>
//                   <div className="text-center">
//                     <div
//                       className="rounded-circle border overflow-hidden d-flex align-items-center justify-content-center mx-auto mb-2"
//                       style={{
//                         width: "80px",
//                         height: "80px",
//                         background:
//                           "conic-gradient(#ff9999 0% 15%, #ffcc99 15% 30%, #ffff99 30% 45%, #ccff99 45% 60%, #99ffcc 60% 75%, #99ccff 75% 90%, #cc99ff 90% 100%)",
//                       }}
//                     ></div>
//                     <div className="fw-semibold">Info md</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Edit Group Modal */}
//       {showEditGroupModal && (
//         <div
//           className="modal fade show d-block"
//           style={{ background: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content rounded-4 shadow">
//               <div className="modal-header border-0">
//                 <h5 className="modal-title fw-bold">Edit Group</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setShowEditGroupModal(false)}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <div className="mb-3">
//                   <label className="form-label fw-semibold">Group Name</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     defaultValue={selectedGroup}
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label fw-semibold">Published</label>
//                   <div className="form-check form-switch">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       defaultChecked
//                     />
//                     <label className="form-check-label text-success">YES</label>
//                   </div>
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label fw-semibold">Visible To</label>
//                   <select className="form-select">
//                     <option>All</option>
//                     <option>Self</option>
//                     <option>Admin Only</option>
//                   </select>
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label fw-semibold">Access Level</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Select Some Options"
//                   />
//                 </div>
//               </div>
//               <div className="modal-footer border-0 justify-content-center gap-3">
//                 <button className="btn btn-primary px-4">Save</button>
//                 <button
//                   className="btn btn-light px-4"
//                   onClick={() => setShowEditGroupModal(false)}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add Profile Field Modal */}
//       {showAddFieldModal && (
//         <div
//           className="modal fade show d-block"
//           style={{ background: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="modal-dialog modal-dialog-centered modal-lg">
//             <div className="modal-content rounded-4 shadow">
//               <div className="modal-header border-0">
//                 <h5 className="modal-title fw-bold">Add Profile Field</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setShowAddFieldModal(false)}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <div className="row g-3">
//                   <div className="col-md-3">
//                     <label className="form-label">Name</label>
//                     <input type="text" className="form-control" />
//                   </div>
//                   <div className="col-md-3">
//                     <label className="form-label">Type</label>
//                     <select className="form-select">
//                       <option>Textbox</option>
//                       <option>Textarea</option>
//                       <option>Date</option>
//                       <option>Select</option>
//                     </select>
//                   </div>
//                   <div className="col-md-3">
//                     <label className="form-label">Group</label>
//                     <select className="form-select" defaultValue="Basic Info">
//                       <option>Basic Info</option>
//                       <option>Personal Information</option>
//                     </select>
//                   </div>
//                   <div className="col-md-3">
//                     <label className="form-label">Field Code</label>
//                     <input type="text" className="form-control" />
//                   </div>

//                   {["Is Unique", "Published", "Required", "Searchable"].map(
//                     (label, i) => (
//                       <div className="col-md-3" key={i}>
//                         <label className="form-label">{label}</label>
//                         <div className="form-check form-switch">
//                           <input
//                             className="form-check-input"
//                             type="checkbox"
//                             defaultChecked={label === "Published"}
//                           />
//                           <label
//                             className={`form-check-label ${
//                               label === "Published" ? "text-success" : ""
//                             }`}
//                           >
//                             {label === "Published"
//                               ? "YES"
//                               : label === "Required"
//                               ? "NO"
//                               : "NO"}
//                           </label>
//                         </div>
//                       </div>
//                     )
//                   )}

//                   <div className="col-md-3">
//                     <label className="form-label">Visible To</label>
//                     <select className="form-select">
//                       <option>Self</option>
//                       <option>All</option>
//                     </select>
//                   </div>
//                   <div className="col-md-3">
//                     <label className="form-label">Access Level</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       placeholder="Select Some Options"
//                     />
//                   </div>
//                   <div className="col-md-3">
//                     <label className="form-label">Editable by</label>
//                     <select className="form-select">
//                       <option>Admin only</option>
//                     </select>
//                   </div>
//                   <div className="col-md-3">
//                     <label className="form-label">Tooltip</label>
//                     <input type="text" className="form-control" />
//                   </div>

//                   {[
//                     "Read Only",
//                     "Auto Suggest",
//                     "Numeric",
//                     "Alphabets Only",
//                     "Alpha Numeric",
//                   ].map((label) => (
//                     <div className="col-md-3" key={label}>
//                       <label className="form-label">{label}</label>
//                       <div className="form-check form-switch">
//                         <input className="form-check-input" type="checkbox" />
//                         <label className="form-check-label">No Yes</label>
//                       </div>
//                     </div>
//                   ))}

//                   <div className="col-md-3">
//                     <label className="form-label">Type</label>
//                     <div className="btn-group w-100" role="group">
//                       <input
//                         type="radio"
//                         className="btn-check"
//                         name="type"
//                         id="text"
//                         defaultChecked
//                       />
//                       <label className="btn btn-outline-primary" htmlFor="text">
//                         Text
//                       </label>
//                       <input
//                         type="radio"
//                         className="btn-check"
//                         name="type"
//                         id="password"
//                       />
//                       <label
//                         className="btn btn-outline-primary"
//                         htmlFor="password"
//                       >
//                         Password
//                       </label>
//                     </div>
//                   </div>

//                   {[
//                     "Minimum Character",
//                     "Maximum Character",
//                     "Maximum Length",
//                     "Style Attribute",
//                     "Additional class",
//                     "Additional Javascript",
//                   ].map((label) => (
//                     <div className="col-md-3" key={label}>
//                       <label className="form-label">{label}</label>
//                       <input type="text" className="form-control" />
//                     </div>
//                   ))}

//                   <div className="col-12">
//                     <label className="form-label">Additional Validators</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       placeholder="There are no Parameters for this item"
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="modal-footer border-0 justify-content-center gap-3">
//                 <button className="btn btn-primary px-4">Save</button>
//                 <button
//                   className="btn btn-light px-4"
//                   onClick={() => setShowAddFieldModal(false)}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default EmployeeProfile;