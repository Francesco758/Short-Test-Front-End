// src/Router.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import TestFlowDynamic from "./pages/TestFlowDynamic";
import Report from "./pages/Report";
import Register from "./pages/Register";
import CompanyPage from "./components/manager";
import ObservatoryPage from "./pages/manager/Observatory";

// Admin Layout and Pages
import AdminLayout from "./components/layout/AdminLayout";
import AdminOverview from "./pages/admin/Overview";
import AdminCompaniesPage from "./pages/admin/Companies";
import AdminTestsPageSimplified from "./pages/admin/TestsSimplified";
import AdminTransforMachinePage from "./pages/admin/TransforMachine";
import AdminSettingsPage from "./pages/admin/Settings";
import AdminAiUsagePage from "./pages/admin/AiUsage";

import { getCurrentUser, getToken } from "./utils/auth";

function SuperAdminProtected({ children }) {
  const token = getToken();
  const user = getCurrentUser();
  const role = (user?.role || "").toString().toUpperCase();
  if (!token || role !== "SUPER_ADMIN") return <Navigate to="/login" replace />;
  return children;
}

function CompanyAdminProtected({ children }) {
  const token = getToken();
  const user = getCurrentUser();
  const role = (user?.role || "").toString().toUpperCase();
  // Allow both COMPANY_ADMIN and SUPER_ADMIN to access company routes
  if (!token || (role !== "COMPANY_ADMIN" && role !== "SUPER_ADMIN")) return <Navigate to="/login" replace />;
  return children;
}

function UserProtected({ children }) {
  const token = getToken();
  const user = getCurrentUser();
  const role = (user?.role || "").toString().toUpperCase();
  if (!token || (role !== "USER" && role !== "GUEST")) return <Navigate to="/login" replace />;
  return children;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER routes - all authenticated users can access */}
        <Route path="/test" element={<UserProtected><TestFlowDynamic /></UserProtected>} />
        <Route path="/report" element={<UserProtected><Report /></UserProtected>} />

        {/* SUPER_ADMIN routes with nested layout */}
        <Route
          path="/dashboard"
          element={
            <SuperAdminProtected>
              <AdminLayout />
            </SuperAdminProtected>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="companies" element={<AdminCompaniesPage />} />
          <Route path="tests" element={<AdminTestsPageSimplified />} />
          <Route path="transformachine" element={<AdminTransforMachinePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="usage" element={<AdminAiUsagePage />} />
        </Route>

        {/* Legacy /admin route - redirect to /dashboard */}
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

        {/* COMPANY_ADMIN routes */}
        <Route path="/company" element={<CompanyAdminProtected><CompanyPage /></CompanyAdminProtected>} />
        <Route path="/company/observatory" element={<CompanyAdminProtected><ObservatoryPage /></CompanyAdminProtected>} />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}