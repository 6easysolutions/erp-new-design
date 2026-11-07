import { describe, it, expect } from "vitest";
import { SidebarData1 } from "../core/json/sidebar_dataone";

// Original nested loop implementation
function getMenuStructureOriginal() {
  const menuData = [];
  SidebarData1.forEach((category) => {
    if (category.tittle !== "Main Menu" && category.tittle !== "UI Interface") {
      menuData.push(category);
    }
  });
  return menuData;
}

function findActiveMenuOriginal(currentPath, menuStructure) {
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

// Pre-computed map implementation
function buildRouteMap(menuStructure) {
  const map = new Map();
  // Dashboard default routes
  map.set("/sales-dashboard", { main: "Dashboard", sub: null });
  map.set("/", { main: "Dashboard", sub: null });

  for (const mainMenu of menuStructure) {
    if (mainMenu.route && !map.has(mainMenu.route)) {
      map.set(mainMenu.route, { main: mainMenu.tittle, sub: null });
    }
    if (mainMenu.subRoutes && mainMenu.subRoutes.length > 0) {
      for (const subMenu of mainMenu.subRoutes) {
        if (subMenu.route && !map.has(subMenu.route)) {
          map.set(subMenu.route, { main: mainMenu.tittle, sub: subMenu.tittle });
        }
        if (subMenu.subRoutes && subMenu.subRoutes.length > 0) {
          for (const subSubMenu of subMenu.subRoutes) {
            if (subSubMenu.route && !map.has(subSubMenu.route)) {
              map.set(subSubMenu.route, { main: mainMenu.tittle, sub: subMenu.tittle });
            }
          }
        }
      }
    }
  }
  return map;
}

const DEFAULT_ACTIVE_MENU = { main: "Dashboard", sub: null };

function findActiveMenuOptimized(currentPath, routeMap) {
  return routeMap.get(currentPath) || DEFAULT_ACTIVE_MENU;
}

describe("Route lookup benchmark and correctness", () => {
  const menuStructure = getMenuStructureOriginal();
  const routeMap = buildRouteMap(menuStructure);

  // Extract all test paths
  const allKnownPaths = ["/sales-dashboard", "/", "/unknown-route", "/random/404/path"];
  for (const item of menuStructure) {
    if (item.route) allKnownPaths.push(item.route);
    if (item.subRoutes) {
      for (const sub of item.subRoutes) {
        if (sub.route) allKnownPaths.push(sub.route);
        if (sub.subRoutes) {
          for (const subSub of sub.subRoutes) {
            if (subSub.route) allKnownPaths.push(subSub.route);
          }
        }
      }
    }
  }

  it("verifies 100% correctness between original and optimized", () => {
    for (const path of allKnownPaths) {
      const orig = findActiveMenuOriginal(path, menuStructure);
      const opt = findActiveMenuOptimized(path, routeMap);
      expect(opt).toEqual(orig);
    }
  });

  it("measures performance baseline vs optimized", () => {
    const iterations = 50000;

    // Warm-up
    for (let i = 0; i < 1000; i++) {
      const path = allKnownPaths[i % allKnownPaths.length];
      findActiveMenuOriginal(path, menuStructure);
      findActiveMenuOptimized(path, routeMap);
    }

    // Baseline benchmark
    const startOriginal = performance.now();
    for (let i = 0; i < iterations; i++) {
      const path = allKnownPaths[i % allKnownPaths.length];
      findActiveMenuOriginal(path, menuStructure);
    }
    const durationOriginal = performance.now() - startOriginal;

    // Optimized benchmark
    const startOptimized = performance.now();
    for (let i = 0; i < iterations; i++) {
      const path = allKnownPaths[i % allKnownPaths.length];
      findActiveMenuOptimized(path, routeMap);
    }
    const durationOptimized = performance.now() - startOptimized;

    const opsPerSecOriginal = (iterations / (durationOriginal / 1000)).toFixed(0);
    const opsPerSecOptimized = (iterations / (durationOptimized / 1000)).toFixed(0);
    const speedup = (durationOriginal / durationOptimized).toFixed(2);

    console.log("=== BENCHMARK RESULTS ===");
    console.log(`Original Nested Loop: ${durationOriginal.toFixed(2)} ms (${opsPerSecOriginal} ops/sec)`);
    console.log(`Optimized Map Lookup: ${durationOptimized.toFixed(2)} ms (${opsPerSecOptimized} ops/sec)`);
    console.log(`Speedup: ${speedup}x faster`);
    console.log("=========================");

    expect(durationOptimized).toBeLessThan(durationOriginal);
  });
});
