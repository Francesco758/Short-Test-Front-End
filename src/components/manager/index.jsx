// src/pages/Company.jsx
import React from "react";
import CompanyDashboard from "./CompanyDashboard";
import { getCurrentUser } from "../../utils/auth";

/**
 * Company route page. Reads companyId from current user (auth util).
 * Supports admin impersonation via localStorage 'impersonatedCompanyId'.
 * If companyId is not present, falls back to "company_demo" so UI still renders.
 */
export default function CompanyPage() {
  const user = getCurrentUser() || {};
  const impersonatedId = localStorage.getItem('impersonatedCompanyId');
  const companyId = impersonatedId || user.companyId || "company_demo";

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <CompanyDashboard companyId={companyId} />
    </div>
  );
}
