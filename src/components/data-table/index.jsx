import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Skeleton } from "primereact/skeleton";
import CustomPaginator from "./custom-paginator";
import { Inbox } from "react-feather";

const PrimeDataTable = ({
  column,
  data = [],
  totalRecords,
  currentPage = 1,
  setCurrentPage,
  rows = 10,
  setRows,
  sortable = true,
  footer = null,
  loading = false,
  isPaginationEnabled = true,
  selectionMode,
  selection,
  onSelectionChange,
}) => {
  const skeletonRows   = Array(rows).fill({});
  const totalPages     = Math.ceil(totalRecords / rows);
  const startIndex     = (currentPage - 1) * rows;
  const paginatedData  = loading ? skeletonRows : data.slice(startIndex, startIndex + rows);

  const onPageChange = (newPage) => setCurrentPage(newPage);

  // ── Empty State ────────────────────────────────────────────────────────────
  const customEmptyMessage = () => (
    <div className="pdt-empty">
      <div className="pdt-empty-icon">
        <Inbox size={32} />
      </div>
      <h6 className="pdt-empty-title">No records found</h6>
      <p className="pdt-empty-sub">There are no records to display at the moment.</p>
    </div>
  );

  // ── DataTable props ────────────────────────────────────────────────────────
  const getDataTableProps = () => {
    const base = {
      value:        paginatedData,
      className:    "pdt-table",
      totalRecords: totalRecords,
      paginator:    false,
      emptyMessage: customEmptyMessage,
      footer:       footer,
      dataKey:      "id",
    };
    if (
      selectionMode &&
      ["multiple", "checkbox", "single", "radiobutton"].includes(selectionMode)
    ) {
      return { ...base, selectionMode, selection, onSelectionChange };
    }
    return base;
  };

  return (
    <>
      {/* ── Scoped CSS overrides for PrimeReact internals ─────────────────── */}
      <style>{`
        /* ── Wrapper ─────────────────────────────────────────────────────── */
        .pdt-root {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          overflow: hidden;
        }

        /* ── PrimeReact DataTable shell ──────────────────────────────────── */
        .pdt-root .p-datatable                   { border: none; background: transparent; }
        .pdt-root .p-datatable-wrapper           { overflow-x: auto; }
        .pdt-root .p-datatable .p-datatable-table{ border-collapse: separate; border-spacing: 0; width: 100%; }

        /* ── THEAD ───────────────────────────────────────────────────────── */
        .pdt-root .p-datatable .p-datatable-thead > tr > th {
          background     : rgba(248,250,252,0.6);
          backdrop-filter: blur(12px);
          color          : #475569;
          font-size      : 11px;
          font-weight    : 700;
          text-transform : uppercase;
          letter-spacing : 0.5px;
          padding        : 12px 16px;
          border-bottom  : 1px solid rgba(226,232,240,0.8);
          border-top     : none;
          border-left    : none;
          border-right   : none;
          white-space    : nowrap;
          transition     : background 0.2s;
        }
        .pdt-root .p-datatable .p-datatable-thead > tr > th:first-child { border-radius: 0; }
        .pdt-root .p-datatable .p-datatable-thead > tr > th:last-child  { border-radius: 0; }

        /* Sort icons */
        .pdt-root .p-datatable .p-sortable-column:hover {
          background: rgba(59,130,246,0.06) !important;
          color: #3b82f6 !important;
        }
        .pdt-root .p-datatable .p-sortable-column.p-highlight {
          background: rgba(59,130,246,0.08) !important;
          color: #3b82f6 !important;
        }
        .pdt-root .p-datatable .p-sortable-column .p-sortable-column-icon {
          color: #cbd5e1;
          font-size: 11px;
          margin-left: 6px;
        }
        .pdt-root .p-datatable .p-sortable-column.p-highlight .p-sortable-column-icon {
          color: #3b82f6;
        }
        /* Remove default focus outline */
        .pdt-root .p-datatable .p-sortable-column:focus { box-shadow: none !important; outline: none !important; }

        /* ── TBODY rows ──────────────────────────────────────────────────── */
        .pdt-root .p-datatable .p-datatable-tbody > tr > td {
          padding       : 11px 16px;
          font-size     : 13px;
          color         : #1e293b;
          font-weight   : 450;
          border-bottom : 1px solid rgba(226,232,240,0.6);
          border-top    : none;
          border-left   : none;
          border-right  : none;
          background    : transparent;
          vertical-align: middle;
          transition    : background 0.15s;
        }
        .pdt-root .p-datatable .p-datatable-tbody > tr {
          transition: background 0.15s;
        }
        .pdt-root .p-datatable .p-datatable-tbody > tr:hover > td {
          background: rgba(59,130,246,0.04) !important;
        }
        /* Zebra stripe (subtle) */
        .pdt-root .p-datatable .p-datatable-tbody > tr:nth-child(even) > td {
          background: rgba(248,250,252,0.5);
        }
        .pdt-root .p-datatable .p-datatable-tbody > tr:nth-child(even):hover > td {
          background: rgba(59,130,246,0.04) !important;
        }
        /* Last row — no bottom border */
        .pdt-root .p-datatable .p-datatable-tbody > tr:last-child > td {
          border-bottom: none;
        }

        /* ── Selection highlight ─────────────────────────────────────────── */
        .pdt-root .p-datatable .p-datatable-tbody > tr.p-highlight > td {
          background : rgba(59,130,246,0.08) !important;
          color      : #1e293b !important;
        }
        .pdt-root .p-datatable .p-checkbox .p-checkbox-box.p-highlight {
          background  : #3b82f6 !important;
          border-color: #3b82f6 !important;
        }

        /* ── Footer ──────────────────────────────────────────────────────── */
        .pdt-root .p-datatable .p-datatable-tfoot > tr > td {
          background   : rgba(248,250,252,0.6);
          border-top   : 1px solid rgba(226,232,240,0.8);
          border-bottom: none;
          font-size    : 12px;
          font-weight  : 600;
          color        : #475569;
          padding      : 10px 16px;
        }

        /* ── Scrollbar ───────────────────────────────────────────────────── */
        .pdt-root .p-datatable-wrapper::-webkit-scrollbar       { height: 5px; }
        .pdt-root .p-datatable-wrapper::-webkit-scrollbar-track { background: transparent; }
        .pdt-root .p-datatable-wrapper::-webkit-scrollbar-thumb {
          background: rgba(148,163,184,0.35); border-radius: 10px;
        }
        .pdt-root .p-datatable-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(148,163,184,0.6);
        }

        /* ── Skeleton ────────────────────────────────────────────────────── */
        .pdt-root .p-skeleton {
          background     : rgba(226,232,240,0.5) !important;
          border-radius  : 6px !important;
          overflow       : hidden;
        }
        .pdt-root .p-skeleton::after {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.6),
            transparent
          ) !important;
        }

        /* ── Empty state ─────────────────────────────────────────────────── */
        .pdt-empty {
          display        : flex;
          flex-direction : column;
          align-items    : center;
          justify-content: center;
          padding        : 48px 24px;
          text-align     : center;
        }
        .pdt-empty-icon {
          width          : 64px;
          height         : 64px;
          border-radius  : 18px;
          background     : rgba(148,163,184,0.1);
          border         : 1px solid rgba(148,163,184,0.2);
          display        : flex;
          align-items    : center;
          justify-content: center;
          color          : #cbd5e1;
          margin-bottom  : 14px;
        }
        .pdt-empty-title {
          font-size  : 14px;
          font-weight: 600;
          color      : #64748b;
          margin     : 0 0 4px;
        }
        .pdt-empty-sub {
          font-size: 12px;
          color    : #94a3b8;
          margin   : 0;
        }

        /* ── Paginator wrapper ───────────────────────────────────────────── */
        .pdt-paginator-wrap {
          padding      : 12px 16px;
          border-top   : 1px solid rgba(226,232,240,0.6);
          background   : rgba(248,250,252,0.4);
          backdrop-filter: blur(8px);
        }

        /* ── Row-count badge (top right summary) ─────────────────────────── */
        .pdt-summary {
          padding     : 8px 16px 0;
          display     : flex;
          align-items : center;
          justify-content: flex-end;
          gap         : 6px;
          font-size   : 11px;
          color       : #94a3b8;
        }
        .pdt-summary strong { color: #475569; }

        /* ── Loading row fade ─────────────────────────────────────────────── */
        @keyframes pdt-row-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pdt-root .p-datatable .p-datatable-tbody > tr {
          animation: pdt-row-in 0.18s ease both;
        }
      `}</style>

      <div className="pdt-root">

        {/* ── Row count summary ───────────────────────────────────────────── */}
        {!loading && data.length > 0 && (
          <div className="pdt-summary">
            Showing{" "}
            <strong>
              {startIndex + 1}–{Math.min(startIndex + rows, totalRecords)}
            </strong>{" "}
            of <strong>{totalRecords}</strong> records
          </div>
        )}

        {/* ── DataTable ───────────────────────────────────────────────────── */}
        <DataTable {...getDataTableProps()}>
          {column?.map((col, index) => (
            <Column
              key={col.field || index}
              header={col.header}
              field={col.field}
              sortable={sortable === false ? false : col.sortable !== false}
              sortField={col.sortField ?? col.field}
              className={col.className ?? ""}
              body={(rowData, options) => {
                if (loading) {
                  return (
                    <Skeleton
                      width={`${60 + Math.random() * 30}%`}
                      height="1.5rem"
                      style={{ borderRadius: 6 }}
                    />
                  );
                }
                return col.body ? col.body(rowData, options) : rowData[col.field];
              }}
            />
          ))}
        </DataTable>

        {/* ── Paginator ───────────────────────────────────────────────────── */}
        {isPaginationEnabled && totalRecords > 0 && (
          <div className="pdt-paginator-wrap">
            <CustomPaginator
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              onPageChange={onPageChange}
              rows={rows}
              setRows={setRows}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default PrimeDataTable;