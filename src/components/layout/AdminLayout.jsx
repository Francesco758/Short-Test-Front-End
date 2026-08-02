import React, { useState, createContext, useContext } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBuilding,
  FaClipboardList,
  FaChartLine,
  FaCog,
  FaUsers,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaArrowLeft,
  FaRobot,
  FaChartPie,
} from 'react-icons/fa';
import { getCurrentUser } from '../../utils/auth';

// Create context for sidebar state
const SidebarContext = createContext(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within AdminLayout');
  }
  return context;
}

export default function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const isOverviewRoute = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  const navigationItems = [
    {
      id: 'overview',
      path: '/dashboard',
      icon: FaChartLine,
      label: 'Observatory',
    },
    {
      id: 'companies',
      path: '/dashboard/companies',
      icon: FaBuilding,
      label: 'Companies',
    },
    {
      id: 'tests',
      path: '/dashboard/tests',
      icon: FaClipboardList,
      label: 'Tests',
    },
    {
      id: 'transformachine',
      path: '/dashboard/transformachine',
      icon: FaRobot,
      label: 'TransforMachine',
    },
    {
      id: 'usage',
      path: '/dashboard/usage',
      icon: FaChartPie,
      label: 'AI Usage',
    },
    {
      id: 'settings',
      path: '/dashboard/settings',
      icon: FaCog,
      label: 'Settings',
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setMobileSidebarOpen(false);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(prev => !prev);
    } else {
      setSidebarOpen(prev => !prev);
    }
  };

  const toggleTheme = () => {
    setIsLightTheme(prev => !prev);
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
    <div className={`flex flex-col h-full ${isLightTheme ? 'bg-white border-r border-[#D6DEE5] shadow-sm' : 'bg-[#0a0a0a] border-r border-gray-800'} overflow-hidden`}>
      {/* Sidebar Header */}
      <div className={`px-4 py-4 lg:px-6 lg:py-5 border-b ${isLightTheme ? 'border-[#D6DEE5] bg-white' : 'border-gray-800 bg-[#0a0a0a]'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-11 h-11 lg:w-[min(2.6vw,52px)] lg:h-[min(2.6vw,52px)] ${isLightTheme ? 'bg-white border-[#D6DEE5]' : 'bg-[#111] border border-gray-700'} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
              <FaTachometerAlt className={`w-5 h-5 lg:w-[min(1.2vw,28px)] lg:h-[min(1.2vw,28px)] ${isLightTheme ? 'text-[#22C58B]' : 'text-emerald-400'}`} />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-center h-full">
              <h2 className={`text-base lg:text-lg font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-100'} truncate font-montserrat text-center`}>
                Admin Center
              </h2>
            </div>
          </div>
          {/* Mobile close */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className={`lg:hidden p-2 ${isLightTheme ? 'hover:bg-gray-50' : 'hover:bg-gray-800'} rounded-lg transition-colors`}
          >
            <FaTimes className={`w-5 h-5 ${isLightTheme ? 'text-[#334155]' : 'text-gray-300'}`} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 p-3 lg:p-4 ${isLightTheme ? 'bg-white' : 'bg-[#0a0a0a]'} flex flex-col`}>
        <div className="space-y-1.5 lg:space-y-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                title={item.label}
                className={`
                  group relative flex items-center gap-3 lg:gap-4 px-3 py-3 lg:px-[min(0.9vw,14px)] lg:py-[min(0.9vw,14px)] rounded-xl border transition-all duration-200 w-full
                  ${
                      isActive
                      ? isLightTheme
                        ? 'bg-emerald-50 border-emerald-500/30 shadow-sm text-emerald-900'
                        : 'bg-emerald-500/10 border-emerald-400/50 shadow-lg shadow-emerald-500/10 text-gray-100'
                      : isLightTheme
                        ? 'bg-white border-[#D6DEE5] hover:bg-gray-50 hover:border-[#D6DEE5] text-[#334155]'
                        : 'bg-[#111] border-gray-800 hover:bg-[#1a1a1a] hover:border-gray-700 text-gray-200'
                  }
                `}
              >
                <div
                  className={`
                  w-10 h-10 lg:w-[min(2.5vw,48px)] lg:h-[min(2.5vw,48px)] rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0
                  ${
                    isActive
                      ? isLightTheme
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-emerald-500/10 text-emerald-400'
                      : isLightTheme
                        ? 'bg-white text-[#334155] group-hover:bg-emerald-50 group-hover:text-emerald-600'
                        : 'bg-[#1a1a1a] text-gray-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-300'
                  }
                `}
                >
                  <Icon className="w-5 h-5 lg:w-[min(1vw,24px)] lg:h-[min(1vw,24px)]" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div
                    className={`
                    font-medium transition-colors duration-200 text-sm lg:text-base truncate font-montserrat
                    ${isActive ? (isLightTheme ? 'text-emerald-900' : 'text-gray-100') : (isLightTheme ? 'text-[#0F172A] group-hover:text-[#0F172A]' : 'text-gray-200 group-hover:text-gray-100')}
                  `}
                  >
                    <div className="leading-none">{item.label}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-2 lg:mt-3">
          <button
            onClick={handleLogout}
            title="Logout"
            className="group relative w-full flex items-center gap-3 lg:gap-4 px-3 py-3 lg:px-[min(0.9vw,14px)] lg:py-[min(0.9vw,14px)] rounded-xl border transition-all duration-200 border-red-500/30 bg-red-500/10 hover:bg-red-500/15 text-red-600"
          >
            <div className="w-10 h-10 lg:w-[min(2.5vw,48px)] lg:h-[min(2.5vw,48px)] rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 bg-red-500/10 text-red-600">
              <FaSignOutAlt className="w-5 h-5 lg:w-[min(1vw,24px)] lg:h-[min(1vw,24px)]" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium font-montserrat text-sm lg:text-base truncate">Logout</p>
            </div>
          </button>
        </div>
      </nav>
    </div>
  );

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar, isLightTheme, toggleTheme }}>
    <div className={`h-screen overflow-hidden ${isLightTheme ? 'bg-white' : 'bg-black'} flex transition-colors duration-300`}>
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar - Collapsible (push layout) */}
      <aside
        className={`
        hidden lg:flex flex-shrink-0 transition-all duration-300 ease-in-out z-40
        ${sidebarOpen ? 'w-[min(22vw,280px)]' : 'w-0'}
        overflow-hidden
      `}
      >
        <div className="sticky top-0 h-screen w-full">
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
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:max-w-[calc(100%-min(22vw,280px))]' : 'lg:max-w-full'}`}>
        {/* Main Content */}
        <main className={`flex-1 overflow-auto ${isOverviewRoute ? 'lg:overflow-hidden' : ''}`}>
          <Outlet />
        </main>

        {/* Footer */}
        {false && (
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
        )}
      </div>
    </div>
    </SidebarContext.Provider>
  );
}
