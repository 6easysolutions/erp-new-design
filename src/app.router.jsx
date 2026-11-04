import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import FeatureModule from "./feature-module/feature-module";
import { authRoutes, posPages, unAuthRoutes } from "./routes/path";
import { base_path } from "./environment";

// ⚡ Bolt Optimization: Moved RouterContent outside of AppRouter
// What: Define RouterContent component at module scope rather than inside AppRouter
// Why: Defining components inside other components defeats React.memo and causes full unmounts/remounts
// Impact: Prevents expensive re-rendering of the entire routing tree when AppRouter updates
const RouterContent = React.memo(() => {
  const renderRoutes = (routeList, _isProtected) =>
  routeList?.map((item) =>
  <Route
    key={`route-${item?.id}`}
    path={item?.path}
    element={item?.element} />

  );

  return (
    <>
      <Routes>
        <Route path="/" element={<FeatureModule />}>
          {renderRoutes(unAuthRoutes, false)}
          {renderRoutes(authRoutes, true)}
          {renderRoutes(posPages, true)}
        </Route>
      </Routes>
    </>);

});

const AppRouter = () => {
  return (
    <BrowserRouter basename={base_path}>
      <RouterContent />
    </BrowserRouter>);

};

export default AppRouter;