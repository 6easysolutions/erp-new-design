import { Link } from "react-router-dom";
import { customer15, logo, logoSmall, logoWhite } from "../../utils/imagepath";
import { all_routes } from "../../routes/all_routes";

const TwoColumnSidebar = () => {
  const route = all_routes;

  return (
    <>
      {/* Two Col Sidebar */}
      <div className="two-col-sidebar" id="two-col-sidebar">
        <div className="sidebar sidebar-twocol">
          <div className="twocol-mini">
            <div className="sidebar-left slimscroll">
              <div
                className="nav flex-column align-items-center nav-pills"
                id="sidebar-tabs"
                role="tablist"
                aria-orientation="vertical"
              >
                <Link
                  to="#"
                  className="nav-link active"
                  title="Dashboard"
                  data-bs-toggle="tab"
                  data-bs-target="#dashboard"
                >
                  <i className="ti ti-smart-home" />
                </Link>
                <Link
                  to="#"
                  className="nav-link "
                  title="Super Admin"
                  data-bs-toggle="tab"
                  data-bs-target="#super-admin"
                >
                  <i className="ti ti-user-star" />
                </Link>
                <Link
                  to="#"
                  className="nav-link "
                  title="Apps"
                  data-bs-toggle="tab"
                  data-bs-target="#application"
                >
                  <i className="ti ti-layout-grid-add" />
                </Link>
                <Link
                  to="#"
                  className="nav-link"
                  title="Layout"
                  data-bs-toggle="tab"
                  data-bs-target="#layout"
                >
                  <i className="ti ti-layout-board-split" />
                </Link>
                <Link
                  to="#"
                  className="nav-link"
                  title="Inventory"
                  data-bs-toggle="tab"
                  data-bs-target="#inventory"
                >
                  <i className="ti ti-table-plus" />
                </Link>
                <Link
                  to="#"
                  className="nav-link"
                  title="Stock"
                  data-bs-toggle="tab"
                  data-bs-target="#stock"
                >
                  <i className="ti ti-stack-3" />
                </Link>
                <Link
                  to="#"
                  className="nav-link"
                  title="Sales"
                  data-bs-toggle="tab"
                  data-bs-target="#sales"
                >
                  <i className="ti ti-device-laptop" />
                </Link>
                <Link
                  to="#"
                  className="nav-link"
                  title="Finance"
                  data-bs-toggle="tab"
                  data-bs-target="#finance"
                >
                  <i className="ti ti-shopping-cart-dollar" />
                </Link>
                <Link
                  to="#"
                  className="nav-link"
                  title="Hrm"
                  data-bs-toggle="tab"
                  data-bs-target="#hrm"
                >
                  <i className="ti ti-cash" />
                </Link>
                <Link
                  to="#"
                  className="nav-link"
                  title="Reports"
                  data-bs-toggle="tab"
                  data-bs-target="#reports"
                >
                  <i className="ti ti-license" />
                </Link>
                <Link
                  to="#"
                  className="nav-link"
                  title="Pages"
                  data-bs-toggle="tab"
                  data-bs-target="#pages"
                >
                  <i className="ti ti-page-break" />
                </Link>
                <Link
                  to="#"
                  className="nav-link"
                  title="Settings"
                  data-bs-toggle="tab"
                  data-bs-target="#settings"
                >
                  <i className="ti ti-lock-check" />
                </Link>
                <Link
                  to="#"
                  className="nav-link "
                  title="UI Elements"
                  data-bs-toggle="tab"
                  data-bs-target="#ui-elements"
                >
                  <i className="ti ti-ux-circle" />
                </Link>
                <Link
                  to="#"
                  className="nav-link"
                  title="Extras"
                  data-bs-toggle="tab"
                  data-bs-target="#extras"
                >
                  <i className="ti ti-vector-triangle" />
                </Link>
              </div>
            </div>
          </div>
          <div className="sidebar-right">
            <>
              {/* Logo */}
              <div className="sidebar-logo">
                <Link to={route.newdashboard} className="logo logo-normal">
                  <img src={logo} alt="Img" />
                </Link>
                <Link to={route.newdashboard} className="logo logo-white">
                  <img src={logoWhite} alt="Img" />
                </Link>
                <Link to={route.newdashboard} className="logo-small">
                  <img src={logoSmall} alt="Img" />
                </Link>
              </div>
              {/* /Logo */}
            </>

          </div>
        </div>
      </div>
      {/* /Two Col Sidebar */}
    </>
  );
};

export default TwoColumnSidebar;
