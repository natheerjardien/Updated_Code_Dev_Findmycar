import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { SideBar } from "./components/SideBar";
import { TopBar } from "./components/TopBar";

import { BookPage } from "./pages/BookPage";
import { HealthCheckPage } from "./pages/HealthCheckPage";
import { TicketsPage } from "./pages/TicketsPage";
import { TicketResponsesPage } from "./pages/TicketResponsesPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

const AppContent: React.FC = () => {
  const location = useLocation();

  // const isLoginPage = location.pathname === "/login";
  const isLoginPage =
  location.pathname === "/login" ||
  location.pathname === "/register";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div
      className={
        isLoginPage
          ? ""
          : `app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`
      }
    >

      {/* dont show sidebar when on login */}
      {!isLoginPage && <SideBar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />}

      <div className={isLoginPage ? "" : "workspace"}>

          {/* dont show topbar when on login */}
        {!isLoginPage && <TopBar />}

        <main className={isLoginPage ? "" : "page-wrap"}>
          <Routes>

            <Route
              path="/register"
              element={<Register />}
            />

            {/* Login */}
            <Route
              path="/login"
              element={<Login />}
            />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<BookPage />}
            />

           
            <Route
              path="/tickets"
              element={<TicketsPage />}
            />

            <Route
              path="/responses"
              element={<TicketResponsesPage />}
            />

            <Route
              path="/analytics"
              element={<AnalyticsPage />}
            />

            <Route
              path="/settings"
              element={<SettingsPage />}
            />

            {/* Backend health */}
            <Route
              path="/health"
              element={<HealthCheckPage />}
            />

            {/* Root */}
            {/* <Route
              path="/"
              element={<Navigate to="/login" replace />}
            /> */}

            <Route
              path="/"
              element={<Navigate to="/register" replace />}
            />

            {/* Unknown URL */}
            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />

          </Routes>
        </main>

      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
{/*
  References
  rudderz243.2026. rudderz243/insy7314-library.  (Version 2.0) [Source code]. Available at: <https://github.com/rudderz243/insy7314-library> [Accessed 17 Aug. 2026].
           */}