import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CreateUserPage from "./pages/CreateUserPage";
import BikersPage from "./pages/BikersPage";
import DocsPage from "./pages/DocsPage";
import BikersStatePage from "./pages/BikersStatePage";
import PrivateRoute from "./privateRoute";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { loadUserFromStorage } from "./features/auth/authSlice";
import "./App.css";
import { GoogleMapProvider } from "./context/GoogleMaps";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const userInfo = useSelector((state) => state.auth.userInfo);

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(() => {
    const savedPreference = localStorage.getItem("sidebarOpen");
    return savedPreference === null ? true : savedPreference === "true";
  });

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    localStorage.setItem("sidebarOpen", !isSidebarOpen);
  };

  const shouldShowHeaderAndSidebar = location.pathname !== "/";

  return (
    <GoogleMapProvider>
      <div
        className={`App ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"} ${
          !shouldShowHeaderAndSidebar && "login-page"
        }`}
      >
        {shouldShowHeaderAndSidebar && (
          <>
            <Header
              toggleSidebar={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
            />
            <Sidebar isSidebarOpen={isSidebarOpen} />
          </>
        )}
        <div
          className={`main-content ${
            shouldShowHeaderAndSidebar ? "" : "login-content"
          }`}
        >
          <div
            className={`content ${
              shouldShowHeaderAndSidebar ? "" : "login-content"
            }`}
          >
            <Routes>
              <Route path="/" element={<LoginPage />} />
              {userInfo && userInfo.role === 1 && (
                <Route
                  path="/CreateUserPage"
                  element={
                    <PrivateRoute>
                      <CreateUserPage />
                    </PrivateRoute>
                  }
                />
              )}
              <Route
                path="/SellersPage"
                element={
                  <PrivateRoute>
                    <BikersPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/DocsPage"
                element={
                  <PrivateRoute>
                    <DocsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/SellersStatePage"
                element={
                  <PrivateRoute>
                    <BikersStatePage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </GoogleMapProvider>
  );
}

export default App;
