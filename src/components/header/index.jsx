import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { all_routes } from "../../routes/all_routes";
import {
  arabicFlag,
  avatar01,
  avatar1,
  avatar10,
  avatar_02,
  avatar_03,
  avatar_13,
  avatar_17,
  avator1,
  commandSvg,
  englishFlag,
  logoPng,
  logoSmallPng,
  logoWhitePng,
  store_01,
  usFlag,
} from "../../utils/imagepath";
import { URLS } from "../../Urls";

const Header = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const [toggle, SetToggle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { t, i18n } = useTranslation();

  // Profile state
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // ─── STORE STATE ────────────────────────────────────────────────────────────
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);

  // Initialize selectedStore from localStorage (persists across reloads)
  const [selectedStore, setSelectedStore] = useState(() => {
    const saved = localStorage.getItem("selectedStoreData");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  // ────────────────────────────────────────────────────────────────────────────

  // Language state management
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem("selectedLanguage") || "en"
  );

  const languages = {
    en: { name: "English", flag: englishFlag, code: "en" },
    ar: { name: "Arabic", flag: arabicFlag, code: "ar" },
    fr: { name: "French", flag: usFlag, code: "fr" },
  };

  const [flagImage, setFlagImage] = useState(
    languages[currentLanguage]?.flag || englishFlag
  );

  // ─── FETCH ALL STORES ────────────────────────────────────────────────────────
  const fetchStores = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate(route.signin);
      return;
    }

    try {
      const response = await fetch(URLS.GetAllStore, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStores(data.data);

        // Auto-select first store if none is saved in localStorage
        if (!selectedStore && data.data.length > 0) {
          handleStoreSelect(data.data[0]);
        }
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("profileData");
        navigate(route.signin);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setStoresLoading(false);
    }
  };
  // ────────────────────────────────────────────────────────────────────────────

  // ─── STORE SELECTION HANDLER ─────────────────────────────────────────────────
  const handleStoreSelect = (store) => {
    setSelectedStore(store);

    // Persist selected store ID and full data to localStorage
    localStorage.setItem("selectedStoreId", store.id);
    localStorage.setItem("selectedStoreData", JSON.stringify(store));
  };
  // ────────────────────────────────────────────────────────────────────────────

  // Helper: build full store logo URL or fallback
  const getStoreLogoUrl = (store) => {
    if (store?.storeLogo) {
      if (store.storeLogo.startsWith("uploads/")) {
        return `${URLS.Base}${store.storeLogo}`;
      }
      return store.storeLogo;
    }
    return store_01; // fallback image
  };

  // Fetch user profile
  const fetchProfile = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate(route.signin);
      return;
    }

    try {
      const response = await fetch(URLS.GetProfile, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfileData(data.data);
        localStorage.setItem("profileData", JSON.stringify(data.data));
      } else {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("profileData");
          navigate(route.signin);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Initialize profile + stores on mount
  useEffect(() => {
    const cachedProfile = localStorage.getItem("profileData");
    if (cachedProfile) {
      try {
        setProfileData(JSON.parse(cachedProfile));
      } catch (e) {
        console.error("Error parsing cached profile:", e);
      }
    }

    fetchProfile();
    fetchStores(); // ← Fetch stores on mount
  }, []);

  // Change language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
    setFlagImage(languages[lng]?.flag || englishFlag);
    localStorage.setItem("selectedLanguage", lng);
    if (lng === "ar") {
      document.documentElement.setAttribute("dir", "rtl");
      document.documentElement.setAttribute("lang", "ar");
      document.body.classList.add("rtl");
    } else {
      document.documentElement.setAttribute("dir", "ltr");
      document.documentElement.setAttribute("lang", lng);
      document.body.classList.remove("rtl");
    }
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
    if (savedLanguage !== i18n.language) {
      changeLanguage(savedLanguage);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("profileData");
    localStorage.removeItem("selectedStoreId");    // Clear store on logout
    localStorage.removeItem("selectedStoreData");  // Clear store on logout
    navigate(route.signin);
  };

  const isElementVisible = (element) => {
    return element?.offsetWidth > 0 || element?.offsetHeight > 0;
  };

  useEffect(() => {
    const handleMouseover = (e) => {
      e.stopPropagation();
      const body = document.body;
      const toggleBtn = document.getElementById("toggle_btn");
      if (body.classList.contains("mini-sidebar") && isElementVisible(toggleBtn)) {
        e.preventDefault();
      }
    };
    document.addEventListener("mouseover", handleMouseover);
    return () => document.removeEventListener("mouseover", handleMouseover);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
      );
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handlesidebar = () => {
    document.body.classList.toggle("mini-sidebar");
    SetToggle((current) => !current);
  };

  const location = useLocation();

  const sidebarOverlay = () => {
    document?.querySelector(".main-wrapper")?.classList?.toggle("slide-nav");
    document?.querySelector(".sidebar-overlay")?.classList?.toggle("opened");
    document?.querySelector("html")?.classList?.toggle("menu-opened");
  };

  useEffect(() => {
    document.querySelector(".main-wrapper")?.classList.remove("slide-nav");
    document.querySelector(".sidebar-overlay")?.classList.remove("opened");
    document.querySelector("html")?.classList.remove("menu-opened");
  }, [location.pathname]);

  let pathname = location.pathname;

  const exclusionArray = [
    "/reactjs/template/dream-pos/index-three",
    "/reactjs/template/dream-pos/index-one",
  ];

  if (exclusionArray.indexOf(window.location.pathname) >= 0) {
    return "";
  }

  const toggleFullscreen = (elem) => {
    const doc = document;
    elem = elem || document.documentElement;
    if (
      !doc.fullscreenElement &&
      !doc.mozFullScreenElement &&
      !doc.webkitFullscreenElement &&
      !doc.msFullscreenElement
    ) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
      else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen(1);
    } else {
      if (doc.exitFullscreen) doc.exitFullscreen();
      else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
    }
  };

  const { expandMenus } = useSelector(
    (state) => state.themeSetting.expandMenus
  );
  const dataLayout = useSelector((state) => state.themeSetting.dataLayout);

  const expandMenu = () => document.body.classList.remove("expand-menu");
  const expandMenuOpen = () => document.body.classList.add("expand-menu");

  const getProfileImage = () => {
    if (profileData?.image) {
      if (profileData.image.startsWith("uploads/")) {
        return `${URLS.Base}${profileData.image}`;
      }
      return profileData.image;
    }
    return avator1;
  };

  const getDisplayName = () => {
    if (profileData?.name) {
      return profileData.name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return "User";
  };

  const getRoleDisplay = () => {
    if (profileData?.role) {
      return profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1);
    }
    return "Vendor";
  };

  return (
    <>
      <div className="header">
        <div className="main-header">
          <div
            className={`header-left ${toggle ? "" : "active"} ${
              expandMenus || dataLayout === "layout-hovered" ? "expand-menu" : ""
            }`}
            onMouseLeave={expandMenu}
            onMouseOver={expandMenuOpen}
          >
            <Link to="/dashboard" className="logo logo-normal">
              <img src={logoPng} alt="img" />
            </Link>
            <Link to="/dashboard" className="logo logo-white">
              <img src={logoWhitePng} alt="img" />
            </Link>
            <Link to="/dashboard" className="logo-small">
              <img src={logoSmallPng} alt="img" />
            </Link>
            <Link
              id="toggle_btn"
              to="#"
              style={{
                display:
                  pathname.includes("tasks") ||
                  pathname.includes("pos") ||
                  pathname.includes("compose")
                    ? "none"
                    : "",
              }}
              onClick={handlesidebar}
            >
              <i className="feather icon-chevrons-left feather-16" />
            </Link>
          </div>

          <Link id="mobile_btn" className="mobile_btn" to="#" onClick={sidebarOverlay}>
            <span className="bar-icon">
              <span />
              <span />
              <span />
            </span>
          </Link>

          <ul className="nav user-menu">
            {/* Search - unchanged */}
            <li className="nav-item nav-searchinputs">
              <div className="top-nav-search">
                <Link to="#" className="responsive-search">
                  <i className="feather icon-search" />
                </Link>
                <form action="#" className="dropdown">
                  <div
                    className="searchinputs input-group dropdown-toggle"
                    id="dropdownMenuClickable"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                  >
                    <input type="text" placeholder={t("search") || "Search"} />
                    <div className="search-addon">
                      <span>
                        <i className="ti ti-search" />
                      </span>
                    </div>
                    <span className="input-group-text">
                      <kbd className="d-flex align-items-center">
                        <img src={commandSvg} alt="img" className="me-1" />K
                      </kbd>
                    </span>
                  </div>
                  <div
                    className="dropdown-menu search-dropdown"
                    aria-labelledby="dropdownMenuClickable"
                  >
                    <div className="search-info">
                      <h6>
                        <span>
                          <i className="feather icon-search feather-16" />
                        </span>
                        {t("recent_searches") || "Recent Searches"}
                      </h6>
                      <ul className="search-tags">
                        <li><Link to="#">{t("products") || "Products"}</Link></li>
                        <li><Link to="#">{t("sales") || "Sales"}</Link></li>
                        <li><Link to="#">{t("applications") || "Applications"}</Link></li>
                      </ul>
                    </div>
                    <div className="search-info">
                      <h6>
                        <span>
                          <i className="feather-16 feather icon-help-circle" />
                        </span>
                        {t("help") || "Help"}
                      </h6>
                      <p>{t("help_text_1") || "How to Change Product Volume from 0 to 200 on Inventory management"}</p>
                      <p>{t("help_text_2") || "Change Product Name"}</p>
                    </div>
                    <div className="search-info">
                      <h6>
                        <span>
                          <i className="feather icon-user feather-16" />
                        </span>
                        {t("customers") || "Customers"}
                      </h6>
                      <ul className="customers">
                        <li>
                          <Link to="#">Aron Varu<img src={avatar1} alt="" className="img-fluid" /></Link>
                        </li>
                        <li>
                          <Link to="#">Jonita<img src={avatar01} alt="" className="img-fluid" /></Link>
                        </li>
                        <li>
                          <Link to="#">Aaron<img src={avatar10} alt="" className="img-fluid" /></Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </form>
              </div>
            </li>

            {/* ─── DYNAMIC SELECT STORE DROPDOWN ─────────────────────────────── */}
            <li className="nav-item dropdown has-arrow main-drop select-store-dropdown">
              <Link
                to="#"
                className="dropdown-toggle nav-link select-store"
                data-bs-toggle="dropdown"
              >
                <span className="user-info">
                  <span className="user-letter">
                    {storesLoading ? (
                      <div
                        className="spinner-border spinner-border-sm"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <img
                        src={getStoreLogoUrl(selectedStore)}
                        alt="Store Logo"
                        className="img-fluid"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = store_01;
                        }}
                      />
                    )}
                  </span>
                  <span className="user-detail">
                    <span className="user-name">
                      {storesLoading
                        ? t("loading") || "Loading..."
                        : selectedStore?.storeName || t("select_store") || "Select Store"}
                    </span>
                  </span>
                </span>
              </Link>

              <div className="dropdown-menu dropdown-menu-right">
                {storesLoading ? (
                  <div className="dropdown-item text-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status" />
                    {t("loading") || "Loading stores..."}
                  </div>
                ) : stores.length === 0 ? (
                  <div className="dropdown-item text-muted">
                    {t("no_stores") || "No stores available"}
                  </div>
                ) : (
                  stores.map((store) => (
                    <Link
                      key={store.id}
                      to="#"
                      className={`dropdown-item ${
                        selectedStore?.id === store.id ? "active" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleStoreSelect(store);
                      }}
                    >
                      <img
                        src={getStoreLogoUrl(store)}
                        alt={store.storeName}
                        className="img-fluid me-2"
                        style={{ width: 20, height: 20, objectFit: "cover" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = store_01;
                        }}
                      />
                      {store.storeName}
                    </Link>
                  ))
                )}
              </div>
            </li>
            {/* ─────────────────────────────────────────────────────────────────── */}

            <li className="nav-item dropdown link-nav">
              <Link
                to="#"
                className="btn btn-primary btn-md d-inline-flex align-items-center"
                data-bs-toggle="dropdown"
              >
                <i className="ti ti-circle-plus me-1" />
                {t("add_new") || "Add New"}
              </Link>
              <div className="dropdown-menu dropdown-xl dropdown-menu-center">
                <div className="row g-2">
                  <div className="col-md-2">
                    <Link to={route.categorylist} className="link-item">
                      <span className="link-icon"><i className="ti ti-brand-codepen" /></span>
                      <p>{t("category") || "Category"}</p>
                    </Link>
                  </div>
                  <div className="col-md-2">
                    <Link to={route.addproduct} className="link-item">
                      <span className="link-icon"><i className="ti ti-square-plus" /></span>
                      <p>{t("product") || "Product"}</p>
                    </Link>
                  </div>
                  <div className="col-md-2">
                    <Link to={route.categorylist} className="link-item">
                      <span className="link-icon"><i className="ti ti-shopping-bag" /></span>
                      <p>{t("purchase") || "Purchase"}</p>
                    </Link>
                  </div>
                  <div className="col-md-2">
                    <Link to={route.onlineorder} className="link-item">
                      <span className="link-icon"><i className="ti ti-shopping-cart" /></span>
                      <p>{t("sale") || "Sale"}</p>
                    </Link>
                  </div>
                  <div className="col-md-2">
                    <Link to={route.expenselist} className="link-item">
                      <span className="link-icon"><i className="ti ti-file-text" /></span>
                      <p>{t("expense") || "Expense"}</p>
                    </Link>
                  </div>
                  <div className="col-md-2">
                    <Link to={route.quotationlist} className="link-item">
                      <span className="link-icon"><i className="ti ti-device-floppy" /></span>
                      <p>{t("quotation") || "Quotation"}</p>
                    </Link>
                  </div>
                  <div className="col-md-2">
                    <Link to={route.salesreturn} className="link-item">
                      <span className="link-icon"><i className="ti ti-copy" /></span>
                      <p>{t("return") || "Return"}</p>
                    </Link>
                  </div>
                  <div className="col-md-2">
                    <Link to={route.users} className="link-item">
                      <span className="link-icon"><i className="ti ti-user" /></span>
                      <p>{t("user") || "User"}</p>
                    </Link>
                  </div>
                  <div className="col-md-2">
                    <Link to={route.customer} className="link-item">
                      <span className="link-icon"><i className="ti ti-users" /></span>
                      <p>{t("customer") || "Customer"}</p>
                    </Link>
                  </div>
                  <div className="col-md-2">
                    <Link to={route.salesreport} className="link-item">
                      <span className="link-icon"><i className="ti ti-shield" /></span>
                      <p>{t("biller") || "Biller"}</p>
                    </Link>
                  </div>
                  <div className="col-md-2">
                    <Link to={route.suppliers} className="link-item">
                      <span className="link-icon"><i className="ti ti-user-check" /></span>
                      <p>{t("supplier") || "Supplier"}</p>
                    </Link>
                  </div>
                  <div className="col-md-2">
                    <Link to={route.stocktransfer} className="link-item">
                      <span className="link-icon"><i className="ti ti-truck" /></span>
                      <p>{t("transfer") || "Transfer"}</p>
                    </Link>
                  </div>
                </div>
              </div>
            </li>

            <li className="nav-item pos-nav">
              <Link
                to={route.pos}
                className="btn btn-dark btn-md d-inline-flex align-items-center"
              >
                <i className="ti ti-device-laptop me-1" />
                {t("pos") || "POS"}
              </Link>
            </li>

            {/* Language Switcher */}
            <li className="nav-item dropdown has-arrow flag-nav nav-item-box">
              <Link
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                to="#"
                role="button"
                aria-label="Change Language"
              >
                <img src={flagImage} alt="Language Flag" height={16} />
              </Link>
              <div className="dropdown-menu dropdown-menu-right">
                <Link
                  to="#"
                  className={`dropdown-item ${currentLanguage === "en" ? "active" : ""}`}
                  onClick={(e) => { e.preventDefault(); changeLanguage("en"); }}
                >
                  <img src={englishFlag} alt="English" height={16} className="me-2" />
                  {t("english") || "English"}
                </Link>
                <Link
                  to="#"
                  className={`dropdown-item ${currentLanguage === "ar" ? "active" : ""}`}
                  onClick={(e) => { e.preventDefault(); changeLanguage("ar"); }}
                >
                  <img src={arabicFlag} alt="Arabic" height={16} className="me-2" />
                  {t("arabic") || "Arabic"}
                </Link>
              </div>
            </li>

            <li className="nav-item nav-item-box">
              <Link
                to="#"
                id="btnFullscreen"
                onClick={() => toggleFullscreen()}
                className={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
              >
                <i className="ti ti-maximize"></i>
              </Link>
            </li>

            <li className="nav-item nav-item-box">
              <Link to="/email">
                <i className="ti ti-mail"></i>
                <span className="badge rounded-pill">1</span>
              </Link>
            </li>

            {/* Notifications */}
            <li className="nav-item dropdown nav-item-box">
              <Link
                to="#"
                className="dropdown-toggle nav-link"
                data-bs-toggle="dropdown"
              >
                <i className="ti ti-bell"></i>
              </Link>
              <div className="dropdown-menu notifications">
                <div className="topnav-dropdown-header">
                  <h5 className="notification-title">{t("notifications") || "Notifications"}</h5>
                  <Link to="#" className="clear-noti">{t("mark_all_read") || "Mark all as read"}</Link>
                </div>
                <div className="noti-content">
                  <ul className="notification-list">
                    <li className="notification-message">
                      <Link to={route.activities}>
                        <div className="media d-flex">
                          <span className="avatar flex-shrink-0">
                            <img alt="Img" src={avatar_13} />
                          </span>
                          <div className="flex-grow-1">
                            <p className="noti-details">
                              <span className="noti-title">James Kirwin</span>{" "}
                              {t("notification_1") || "confirmed his order. Order No: #78901."}
                            </p>
                            <p className="noti-time">4 mins ago</p>
                          </div>
                        </div>
                      </Link>
                    </li>
                    <li className="notification-message">
                      <Link to={route.activities}>
                        <div className="media d-flex">
                          <span className="avatar flex-shrink-0">
                            <img alt="Img" src={avatar_03} />
                          </span>
                          <div className="flex-grow-1">
                            <p className="noti-details">
                              <span className="noti-title">Leo Kelly</span>{" "}
                              {t("notification_2") || "cancelled his order scheduled for 17 Jan 2025"}
                            </p>
                            <p className="noti-time">10 mins ago</p>
                          </div>
                        </div>
                      </Link>
                    </li>
                    <li className="notification-message">
                      <Link to={route.activities} className="recent-msg">
                        <div className="media d-flex">
                          <span className="avatar flex-shrink-0">
                            <img alt="Img" src={avatar_17} />
                          </span>
                          <div className="flex-grow-1">
                            <p className="noti-details">
                              {t("notification_3") || "Payment of $50 received from"}{" "}
                              <span className="noti-title">Antonio Engle</span>
                            </p>
                            <p className="noti-time">05 mins ago</p>
                          </div>
                        </div>
                      </Link>
                    </li>
                    <li className="notification-message">
                      <Link to={route.activities} className="recent-msg">
                        <div className="media d-flex">
                          <span className="avatar flex-shrink-0">
                            <img alt="Img" src={avatar_02} />
                          </span>
                          <div className="flex-grow-1">
                            <p className="noti-details">
                              <span className="noti-title">Andrea</span>{" "}
                              {t("notification_4") || "confirmed his order. Order No: #73401."}
                            </p>
                            <p className="noti-time">4 mins ago</p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="topnav-dropdown-footer d-flex align-items-center gap-3">
                  <Link to="#" className="btn btn-secondary btn-md w-100">
                    {t("cancel") || "Cancel"}
                  </Link>
                  <Link to={route.activities} className="btn btn-primary btn-md w-100">
                    {t("view_all") || "View all"}
                  </Link>
                </div>
              </div>
            </li>

            <li className="nav-item nav-item-box">
              <Link to="/general-settings">
                <i className="feather icon-settings"></i>
              </Link>
            </li>

            {/* Profile Dropdown */}
            <li className="nav-item dropdown has-arrow main-drop profile-nav">
              <Link to="#" className="nav-link userset" data-bs-toggle="dropdown">
                <span className="user-info p-0">
                  <span className="user-letter">
                    {profileLoading ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <img
                        src={getProfileImage()}
                        alt="Profile"
                        className="img-fluid"
                        onError={(e) => { e.target.onerror = null; e.target.src = avator1; }}
                      />
                    )}
                  </span>
                </span>
              </Link>
              <div className="dropdown-menu menu-drop-user">
                <div className="profileset d-flex align-items-center">
                  <span className="user-img me-2">
                    <img
                      src={getProfileImage()}
                      alt="Profile"
                      onError={(e) => { e.target.onerror = null; e.target.src = avator1; }}
                    />
                  </span>
                  <div>
                    <h6 className="fw-medium">{getDisplayName()}</h6>
                    <p>{getRoleDisplay()}</p>
                    {profileData?.email && (
                      <small className="text-muted">{profileData.email}</small>
                    )}
                  </div>
                </div>
                <Link className="dropdown-item" to={route.profile}>
                  <i className="ti ti-user-circle me-2" />{t("my_profile") || "My Profile"}
                </Link>
                <Link className="dropdown-item" to={route.salesreport}>
                  <i className="ti ti-file-text me-2" />{t("reports") || "Reports"}
                </Link>
                <Link className="dropdown-item" to={route.generalsettings}>
                  <i className="ti ti-settings-2 me-2" />{t("settings") || "Settings"}
                </Link>
                <hr className="my-2" />
                <Link
                  className="dropdown-item logout pb-0"
                  to="#"
                  onClick={(e) => { e.preventDefault(); handleLogout(); }}
                >
                  <i className="ti ti-logout me-2" />{t("logout") || "Logout"}
                </Link>
              </div>
            </li>
          </ul>

          {/* Mobile Menu */}
          <div className="dropdown mobile-user-menu">
            <Link
              to="#"
              className="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="fa fa-ellipsis-v" />
            </Link>
            <div className="dropdown-menu dropdown-menu-right">
              <Link className="dropdown-item" to="profile">{t("my_profile") || "My Profile"}</Link>
              <Link className="dropdown-item" to="generalsettings">{t("settings") || "Settings"}</Link>
              <Link
                className="dropdown-item"
                to="#"
                onClick={(e) => { e.preventDefault(); handleLogout(); }}
              >
                {t("logout") || "Logout"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
