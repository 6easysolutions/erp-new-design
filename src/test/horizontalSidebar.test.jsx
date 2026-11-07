import { describe, it, expect } from "vitest";
import { findActiveMenuByRoute } from "../components/layouts/horizontalSidebar";
import { SidebarData1 } from "../core/json/sidebar_dataone";

// Recreate original matching algorithm for exhaustive verification
function originalFindActiveMenu(currentPath) {
  const menuStructure = [];
  SidebarData1.forEach((category) => {
    if (category.tittle !== "Main Menu" && category.tittle !== "UI Interface") {
      menuStructure.push(category);
    }
  });

  for (const mainMenu of menuStructure) {
    if (mainMenu.tittle === "Dashboard" && (currentPath === "/sales-dashboard" || currentPath === "/")) {
      return { main: "Dashboard", sub: null };
    }

    if (mainMenu.route && currentPath === mainMenu.route) {
      return { main: mainMenu.tittle, sub: null };
    }

    if (mainMenu.subRoutes && mainMenu.subRoutes.length > 0) {
      for (const subMenu of mainMenu.subRoutes) {
        if (subMenu.route && currentPath === subMenu.route) {
          return { main: mainMenu.tittle, sub: subMenu.tittle };
        }

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

  return { main: "Dashboard", sub: null };
}

describe("HorizontalSidebar Route Matching Correctness", () => {
  it("matches dashboard routes correctly", () => {
    expect(findActiveMenuByRoute("/")).toEqual({ main: "Dashboard", sub: null });
    expect(findActiveMenuByRoute("/sales-dashboard")).toEqual({ main: "Dashboard", sub: null });
  });

  it("falls back to Dashboard for nonexistent routes", () => {
    expect(findActiveMenuByRoute("/non-existent-path-12345")).toEqual({ main: "Dashboard", sub: null });
    expect(findActiveMenuByRoute("")).toEqual({ main: "Dashboard", sub: null });
  });

  it("matches all existing routes identically to the original implementation", () => {
    const allPaths = new Set(["/", "/sales-dashboard", "/unknown"]);

    SidebarData1.forEach((main) => {
      if (main.route) allPaths.add(main.route);
      if (main.subRoutes) {
        main.subRoutes.forEach((sub) => {
          if (sub.route) allPaths.add(sub.route);
          if (sub.subRoutes) {
            sub.subRoutes.forEach((subSub) => {
              if (subSub.route) allPaths.add(subSub.route);
            });
          }
        });
      }
    });

    for (const path of allPaths) {
      const originalResult = originalFindActiveMenu(path);
      const optimizedResult = findActiveMenuByRoute(path);
      expect(optimizedResult).toEqual(originalResult);
    }
  });
});
