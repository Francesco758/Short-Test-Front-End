// src/pages/Company.jsx
import React from "react";
import CompanyDashboard from "./CompanyDashboard";
import { getCurrentUser } from "../../utils/auth";

/**
 * Company route page. Reads companyId from current user (auth util).
 * If companyId is not present, falls back to "company_demo" so UI still renders.
 */
export default function CompanyPage() {
  const user = getCurrentUser() || {};
  const companyId = user.companyId || "company_demo";

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <CompanyDashboard companyId={companyId} />
    </div>
  );
}
