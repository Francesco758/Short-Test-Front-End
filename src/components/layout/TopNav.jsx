import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  FaUser, 
  FaSignOutAlt,
} from 'react-icons/fa';

export default function TopNav() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  function doLogout() { 
    logout(); 
    navigate('/login'); 
  }

  return (
    <nav className="bg-green-50 border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">
                Assessment Platform
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Desktop links are currently empty or commented out in the user's version */}
            </div>
          </div>

          <div className="flex items-center">
            {/* Search Bar */}
            <div className="hidden md:block mr-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-white border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {user ? (
              <div className="ml-3 relative flex items-center gap-4">
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-sm font-medium text-gray-700">{user.name || user.email}</span>
                  <span className="text-xs text-gray-500">{user.role}</span>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {(user.name || user.email)[0].toUpperCase()}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Profile Settings
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          doLogout();
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu - REMOVED AS REQUESTED */}
      {/* Dashboard, Reports, Test, Home links should not be shown here */}
      
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}