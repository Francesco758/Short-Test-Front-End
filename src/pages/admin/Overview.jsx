// src/pages/admin/Overview.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardObservatory from '../../components/common/DashboardObservatory';
import { useSidebar } from '../../components/layout/AdminLayout';

export default function AdminOverview() {
  const { toggleSidebar, isLightTheme, toggleTheme } = useSidebar();
  const navigate = useNavigate();

  return (
    <DashboardObservatory
      isLightTheme={isLightTheme}
      toggleTheme={toggleTheme}
      apiBasePath="/api/admin/dashboard"
      chatEndpoint="/api/admin/dashboard/query"
      onDashboardClick={() => { navigate('/dashboard'); }}
      showSidebarToggle={true}
      pageTitle="OBSERVATORY"
      onToggleSidebar={toggleSidebar}
      showDashboardButton={false}
    />
  );
}
