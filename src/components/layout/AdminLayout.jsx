import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBuilding,
  FaClipboardList,
  FaCog,
  FaUsers,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaChevronLeft
} from 'react-icons/fa';
import { getCurrentUser } from '../../utils/auth';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const navigationItems = [
    {
      id: 'overview',
      path: '/dashboard',
      icon: FaTachometerAlt,
      label: 'Overview',
      description: 'Dashboard overview'
    },
    {
      id: 'companies',
      path: '/dashboard/companies',
      icon: FaBuilding,
      label: 'Companies',
      description: 'Manage companies'
    },
    {
      id: 'tests',
      path: '/dashboard/tests',
      icon: FaClipboardList,
      label: 'Tests',
      description: 'Manage assessments'
    },
    {
      id: 'settings',
      path: '/dashboard/settings',
      icon: FaCog,
      label: 'Settings',
      description: 'System configuration'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActivePath = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Sidebar Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <FaTachometerAlt className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 truncate">
                  Admin Dashboard
                </h2>
                <p className="text-xs lg:text-sm text-gray-600 truncate">
                  Control Center
                </p>
              </div>
            )}
          </div>
          {/* Desktop toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-2 hover:bg-blue-200 rounded-lg transition-colors"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <FaChevronLeft
              className={`w-4 h-4 text-gray-700 transition-transform ${
                !sidebarOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {/* Mobile close */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-blue-200 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 overflow-y-auto bg-gradient-to-b from-blue-50 to-white">
        <div className="space-y-1 lg:space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`
                  group relative flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl border transition-all duration-200 w-full
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-700 shadow-lg shadow-blue-500/30 text-white'
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                <div
                  className={`
                  w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0
                  ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }
                `}
                >
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0 text-left">
                    <p
                      className={`
                      font-medium transition-colors duration-200 text-sm lg:text-base truncate
                      ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}
                    `}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`
                      text-xs transition-colors duration-200 mt-0.5 lg:mt-1 truncate
                      ${isActive ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-600'}
                    `}
                    >
                      {item.description}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 lg:p-4 border-t border-gray-200 bg-gray-50">
        {sidebarOpen && (
          <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <FaUsers className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200"
        >
          <FaSignOutAlt className="w-4 h-4" />
          {sidebarOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`
        hidden lg:block flex-shrink-0 transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-72 xl:w-80' : 'w-20'}
      `}
      >
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-screen w-72 z-50 lg:hidden transform transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaBars className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FaTachometerAlt className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ST</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">shorTest</p>
                  <p className="text-xs text-gray-500">Conversational Assessment Platform</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="text-xs md:text-sm">© 2024 shorTest. All rights reserved.</span>
                <div className="hidden md:flex items-center gap-4">
                  <button className="hover:text-blue-600 transition-colors text-xs">
                    Privacy
                  </button>
                  <button className="hover:text-blue-600 transition-colors text-xs">
                    Terms
                  </button>
                  <button className="hover:text-blue-600 transition-colors text-xs">
                    Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
