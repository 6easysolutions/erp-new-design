import React from "react";

const DeleteModal = ({ onDelete, title, message = "Are you sure you want to delete this?" }) => (
  <div
    className="modal fade"
    id="delete-modal"
    tabIndex={-1}
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-modal-title"
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="page-wrapper-new p-0">
          <div className="content p-5 px-3 text-center">
            <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2" aria-hidden="true">
              <i className="ti ti-trash fs-24 text-danger" />
            </span>
            {title && <h5 className="modal-title mb-1 text-muted fs-14">{title}</h5>}
            <h4 id="delete-modal-title" className="mb-0 delete-account-font">
              {message}
            </h4>
            <div className="modal-footer-btn mt-3 d-flex justify-content-center">
              <button
                type="button"
                className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger fs-13 fw-medium p-2 px-3 shadow-none"
                data-bs-dismiss="modal"
                onClick={() => onDelete?.()}
              >
                Yes Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DeleteModal;
