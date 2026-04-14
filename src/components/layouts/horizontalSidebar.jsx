import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SidebarData1 } from "../../core/json/sidebar_dataone";

const HorizontalSidebar = () => {
  const [activeMainMenu, setActiveMainMenu] = useState("Dashboard");
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [hoveredSubMenu, setHoveredSubMenu] = useState(null);
  const sidebarRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Get the restructured menu data
  const getMenuStructure = () => {
    const menuData = [];

    // Process other categories (exclude "Main Menu" and "UI Interface")
    SidebarData1.forEach((category) => {
      if (category.tittle !== "Main Menu" && category.tittle !== "UI Interface") {
        menuData.push(category);
      }
    });

    return menuData;
  };

  const menuStructure = getMenuStructure();

  // Find active menu based on current route
  const findActiveMenuByRoute = () => {
    const currentPath = location.pathname;

    for (const mainMenu of menuStructure) {
      // Check if it's Dashboard
      if (mainMenu.tittle === "Dashboard" && (currentPath === "/sales-dashboard" || currentPath === "/")) {
        return { main: "Dashboard", sub: null };
      }

      // Check if main menu has direct route (single item like "Sale", "Transfer Stock")
      if (mainMenu.route && currentPath === mainMenu.route) {
        return { main: mainMenu.tittle, sub: null };
      }

      // Check subRoutes
      if (mainMenu.subRoutes && mainMenu.subRoutes.length > 0) {
        for (const subMenu of mainMenu.subRoutes) {
          // Check if subMenu has direct route
          if (subMenu.route && currentPath === subMenu.route) {
            return { main: mainMenu.tittle, sub: subMenu.tittle };
          }

          // Check sub-subRoutes (3rd level)
          if (subMenu.subRoutes && subMenu.subRoutes.length > 0) {
            for (const subSubMenu of subMenu.subRoutes) {
              if (subSubMenu.route && currentPath === subSubMenu.route) {
                return { main: mainMenu.tittle, sub: subMenu.tittle };
              }
            }
          }
        }
      }
    }

    return { main: "Dashboard", sub: null }; // Default to Dashboard
  };

  // Set active menu on mount and route change
  useEffect(() => {
    const activeMenus = findActiveMenuByRoute();
    setActiveMainMenu(activeMenus.main);
    setActiveSubMenu(activeMenus.sub);
  }, [location.pathname]);

  // Handle main menu click
  const handleMainMenuClick = (mainMenu, e) => {
    e.preventDefault();
    
    // Check if it's a single item with direct route (Dashboard, Sale, Transfer Stock)
    if (!mainMenu.hasSubRoute || !mainMenu.subRoutes || mainMenu.subRoutes.length === 0) {
      setActiveMainMenu(mainMenu.tittle);
      setActiveSubMenu(null);
      
      if (mainMenu.route) {
        navigate(mainMenu.route);
      }
      return;
    }

    // For menus with sub-menus, show them
    setActiveMainMenu(mainMenu.tittle);

    // Auto-select first sub-menu
    if (mainMenu.subRoutes && mainMenu.subRoutes.length > 0) {
      const firstSubMenu = mainMenu.subRoutes[0];
      setActiveSubMenu(firstSubMenu.tittle);

      // Navigate to first available route
      if (firstSubMenu.hasSubRoute && firstSubMenu.subRoutes && firstSubMenu.subRoutes.length > 0) {
        // Has 3rd level, navigate to first child's route
        const firstSubSubMenu = firstSubMenu.subRoutes[0];
        if (firstSubSubMenu.route) {
          navigate(firstSubSubMenu.route);
        }
      } else if (firstSubMenu.route) {
        // No 3rd level, navigate to 2nd level route
        navigate(firstSubMenu.route);
      }
    }
  };

  // Handle sub-menu click (2nd level)
  const handleSubMenuClick = (subMenu, e) => {
    e.preventDefault();
    
    // Only navigate if subMenu has no children (3rd level)
    if (!subMenu.hasSubRoute || !subMenu.subRoutes || subMenu.subRoutes.length === 0) {
      setActiveSubMenu(subMenu.tittle);
      if (subMenu.route) {
        navigate(subMenu.route);
      }
    }
  };

  // Handle sub-sub menu click (3rd level)
  const handleSubSubMenuClick = (subSubMenu, parentSubMenu, e) => {
    e.preventDefault();
    setActiveSubMenu(parentSubMenu.tittle);
    if (subSubMenu.route) {
      navigate(subSubMenu.route);
    }
    setHoveredSubMenu(null); // Close dropdown after click
  };

  // Check if main menu is active
  const isMainMenuActive = (mainMenu) => {
    return activeMainMenu === mainMenu.tittle;
  };

  // Check if sub menu is active
  const isSubMenuActive = (subMenu) => {
    return activeSubMenu === subMenu.tittle;
  };

  // Check if sub-sub menu is active
  const isSubSubMenuActive = (subSubMenu) => {
    return location.pathname === subSubMenu.route;
  };

  // Handle click outside to close menus
  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setHoveredSubMenu(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get current active main menu data
  const currentMainMenuData = menuStructure.find((m) => m.tittle === activeMainMenu);

  return (
    <div 
      className="sidebar sidebar-horizontal bg-white border-bottom" 
      id="horizontal-menu" 
      ref={sidebarRef}
      style={{ 
        position: 'sticky', 
        top: '64px', 
        zIndex: 998,
        borderColor: '#e5e7eb',
      }}
    >
      <div className="" id="sidebar-menu-3">
        {/* 1st Level - Main Menu */}
        <div className="main-menu border-bottom" style={{ borderColor: '#e5e7eb' }}>
          <div className="container-fluid px-3" style={{ maxWidth: '1320px', margin: '0 auto' }}>
            <ul className="nav mb-0 py-0" style={{ listStyle: 'none' }}>
              {menuStructure.map((mainMenu, mainIndex) => (
                <li key={mainIndex} className="nav-item">
                  <a
                    href="#"
                    className={`nav-link px-3 py-3 ${
                      isMainMenuActive(mainMenu) ? 'text-primary' : 'text-secondary'
                    }`}
                    onClick={(e) => handleMainMenuClick(mainMenu, e)}
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      borderBottom: isMainMenuActive(mainMenu) ? '3px solid #0d6efd' : '3px solid transparent',
                      transition: 'all 0.3s ease',
                      backgroundColor: isMainMenuActive(mainMenu) ? '#eff6ff' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMainMenuActive(mainMenu)) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMainMenuActive(mainMenu)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {mainMenu.tittle === "Components" ? (
                      <i className="feather icon-layers me-2" style={{ fontSize: '18px' }}></i>
                    ) : (
                      <i className={`ti ti-${mainMenu.icon} me-2`} style={{ fontSize: '18px' }}></i>
                    )}
                    <span>{mainMenu.tittle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2nd Level - Sub Menu */}
        {activeMainMenu && 
         currentMainMenuData && 
         currentMainMenuData.hasSubRoute && 
         currentMainMenuData.subRoutes && 
         currentMainMenuData.subRoutes.length > 0 && (
          <div className="sub-menu-bar bg-light"style={{ marginTop:"2px" }}>
            <div className="container-fluid px-3" style={{ backgroundColor:"#ffffff", maxWidth: "1320px", margin: "0 auto" }}>
              <ul className="nav mb-0 py-0" style={{ listStyle: 'none' }}>
                {currentMainMenuData.subRoutes.map((subMenu, subIndex) => (
                  <li
                    key={subIndex}
                    className="nav-item position-relative"
                    onMouseEnter={() => {
                      if (subMenu.hasSubRoute && subMenu.subRoutes && subMenu.subRoutes.length > 0) {
                        setHoveredSubMenu(subMenu.tittle);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredSubMenu(null);
                    }}
                  >
                    <a
                      href="#"
                      className={`nav-link px-3 py-2 ${
                        isSubMenuActive(subMenu) ? 'text-primary' : 'text-muted'
                      }`}
                      onClick={(e) => handleSubMenuClick(subMenu, e)}
                      style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        cursor: (subMenu.hasSubRoute && subMenu.subRoutes && subMenu.subRoutes.length > 0) ? 'default' : 'pointer',
                        borderRadius: '6px 6px 0 0',
                        transition: 'all 0.3s ease',
                        borderBottom: isSubMenuActive(subMenu) ? '2px solid #0d6efd' : '2px solid transparent',
                        backgroundColor: isSubMenuActive(subMenu) ? '#ffffff' : 'transparent',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubMenuActive(subMenu)) {
                          e.currentTarget.style.backgroundColor = '#e0e7ff';
                          e.currentTarget.style.color = '#0d6efd';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubMenuActive(subMenu)) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#6c757d';
                        }
                      }}
                    >
                      <span>{subMenu.tittle}</span>
                      {subMenu.hasSubRoute && subMenu.subRoutes && subMenu.subRoutes.length > 0 && (
                        <i className="ti ti-chevron-down ms-1" style={{ fontSize: '12px' }}></i>
                      )}
                    </a>

                    {/* 3rd Level - Sub-Sub Menu (dropdown on hover) */}
                    {subMenu.hasSubRoute &&
                      subMenu.subRoutes &&
                      subMenu.subRoutes.length > 0 &&
                      hoveredSubMenu === subMenu.tittle && (
                        <ul 
                          className="dropdown-menu d-block position-absolute bg-white border shadow-sm"
                          style={{
                            top: '100%',
                            left: '0',
                            minWidth: '220px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            zIndex: 1050,
                            listStyle: 'none',
                            padding: '8px 0',
                            margin: '0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            borderColor: '#e5e7eb'
                          }}
                        >
                          {subMenu.subRoutes.map((subSubMenu, subSubIndex) => (
                            <li key={subSubIndex}>
                              <a
                                href="#"
                                className={`dropdown-item d-block px-3 py-2 ${
                                  isSubSubMenuActive(subSubMenu) ? 'bg-primary text-white' : 'text-dark'
                                }`}
                                onClick={(e) => handleSubSubMenuClick(subSubMenu, subMenu, e)}
                                style={{
                                  fontSize: '13px',
                                  textDecoration: 'none',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  borderRadius: '4px',
                                  margin: '2px 8px'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSubSubMenuActive(subSubMenu)) {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    e.currentTarget.style.color = '#0d6efd';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSubSubMenuActive(subSubMenu)) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#212529';
                                  }
                                }}
                              >
                                {subSubMenu.tittle}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HorizontalSidebar;
