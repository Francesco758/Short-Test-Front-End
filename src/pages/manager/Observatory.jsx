// src/pages/manager/Observatory.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardObservatory from '../../components/common/DashboardObservatory';

export default function ObservatoryPage() {
  const [isLightTheme, setIsLightTheme] = useState(() => localStorage.getItem('observatoryTheme') === 'light');
  const toggleTheme = () => {
    setIsLightTheme(v => {
      const next = !v;
      localStorage.setItem('observatoryTheme', next ? 'light' : 'dark');
      return next;
    });
  };
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen overflow-hidden">
      <DashboardObservatory
        isLightTheme={isLightTheme}
        toggleTheme={toggleTheme}
        apiBasePath="/api/observatory"
        chatEndpoint="/api/observatory/query"
        onDashboardClick={() => { navigate('/company'); }}
        showSidebarToggle={false}
        pageTitle="OBSERVATORY"
      />
    </div>
  );
}
