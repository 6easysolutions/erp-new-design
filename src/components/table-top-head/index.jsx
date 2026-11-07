import { excel, pdf } from "../../utils/imagepath";
import { Link } from "react-router";
import { Tooltip } from "primereact/tooltip";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setToggleHeader } from "../../core/redux/sidebarSlice";

const TableTopHead = () => {
  const dispatch = useDispatch();
  const { toggleHeader } = useSelector((state) => state.sidebar);
  const handleToggleHeader = () => {
    dispatch(setToggleHeader(!toggleHeader));
  };
  return (
    <>
      <Tooltip target=".pr-tooltip" />
      <ul className="table-top-head">
        <li>
          <Link
            to="#"
            className="pr-tooltip"
            data-pr-tooltip="Pdf"
            data-pr-position="top"
            aria-label="Export as PDF"
          >
            <img src={pdf} alt="PDF export icon" />
          </Link>
        </li>
        <li>
          <Link
            to="#"
            className="pr-tooltip"
            data-pr-tooltip="Excel"
            data-pr-position="top"
            aria-label="Export as Excel"
          >
            <img src={excel} alt="Excel export icon" />
          </Link>
        </li>
        <li>
          <Link
            to="#"
            className="pr-tooltip"
            data-pr-tooltip="Refresh"
            data-pr-position="top"
            aria-label="Refresh table data"
          >
            <i className="ti ti-refresh" aria-hidden="true" />
          </Link>
        </li>
        <li>
          <Link
            to="#"
            className="pr-tooltip"
            data-pr-tooltip={toggleHeader ? "Expand" : "Collapse"}
            data-pr-position="top"
            id="collapse-header"
            aria-label={toggleHeader ? "Expand header" : "Collapse header"}
            aria-expanded={!toggleHeader}
            role="button"
            onClick={handleToggleHeader}
          >
            <i
              className={`ti  ${
                toggleHeader ? "ti-chevron-down" : "ti-chevron-up"
              }`}
              aria-hidden="true"
            />
          </Link>
        </li>
      </ul>
    </>
  );
};

export default TableTopHead;
