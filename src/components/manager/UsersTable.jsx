// src/components/manager/UsersTable.jsx
import React, { useState, useMemo } from "react";
import { 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaFileAlt, 
  FaShare, 
  FaChevronLeft, 
  FaChevronRight,
  FaUser,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFrown,
  FaCheck,
  FaTimes
} from "react-icons/fa";
import { HiDotsHorizontal } from "react-icons/hi";

/**
 * UsersTable - responsive user table with real API data
 * 
 * Props:
 * - users: array of { id, name, email, role, lastLoginAt, createdAt, companyId, assignedTests }
 * - onToggleSelect(userId)
 * - selectedIds: array
 * - onAssignClick(userId)
 * - onDelete(userId)
 * - onEdit(user)
 * - onReport(userId)
 */
export default function UsersTable({
  users = [],
  selectedIds = [],
  onToggleSelect = () => {},
  onAssignClick = () => {},
  onDelete = () => {},
  onEdit = () => {},
  onReport = () => {},
  onAddUser = () => {},
  theme = "dark",
}) {
  const isLightTheme = theme === "light";
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter and sort users
  const filtered = useMemo(() => {
    let filteredUsers = users;
    
    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      filteredUsers = users.filter((u) => 
        (u.name?.toLowerCase() || '').includes(q) || 
        (u.email?.toLowerCase() || '').includes(q) ||
        (u.role?.toLowerCase() || '').includes(q)
      );
    }
    
    // Apply sorting
    filteredUsers.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'lastLoginAt' || sortField === 'createdAt') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }
      
      // Handle null/undefined values
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filteredUsers;
  }, [users, search, sortField, sortDirection]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const pageData = filtered.slice((current - 1) * pageSize, current * pageSize);

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function handlePageSizeChange(e) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  function toggleSelectAllOnPage() {
    const allIdsOnPage = pageData.map((u) => u.id);
    const allSelected = allIdsOnPage.every((id) => selectedIds.includes(id));
    
    if (allSelected) {
      allIdsOnPage.forEach((id) => onToggleSelect(id));
    } else {
      allIdsOnPage.forEach((id) => {
        if (!selectedIds.includes(id)) onToggleSelect(id);
      });
    }
  }

  function getSortIcon(field) {
    if (sortField !== field) {
      return <FaSort className="w-3 h-3 text-gray-600" />;
    }
    return sortDirection === 'asc' ? 
      <FaSortUp className="w-3 h-3 text-emerald-500" /> : 
      <FaSortDown className="w-3 h-3 text-emerald-500" />;
  }

  // Format date for display
  function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  // Get user initials safely
  function getUserInitials(user) {
    if (!user.name) return <FaUser className="w-3 h-3" />;
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  const roleInfoMap = useMemo(() => ({
    SUPER_ADMIN: isLightTheme
      ? { display: 'Super Admin', color: 'bg-red-100 text-[#0F172A] border-red-200' }
      : { display: 'Super Admin', color: 'bg-red-900/20 text-red-400 border-red-900/30' },
    COMPANY_ADMIN: isLightTheme
      ? { display: 'Company Manager', color: 'bg-emerald-100 text-[#0F172A] border-emerald-200' }
      : { display: 'Company Manager', color: 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' },
    USER: isLightTheme
      ? { display: 'User', color: 'bg-gray-100 text-[#0F172A] border-gray-200' }
      : { display: 'User', color: 'bg-gray-800 text-gray-400 border-gray-700' }
  }), [isLightTheme]);

  return (
    <div className={`${isLightTheme ? 'bg-white border-emerald-700' : 'bg-[#18181B] border-emerald-500'} rounded-2xl shadow-sm border overflow-hidden`}>
      {/* Add User Button */}
      <div className={`px-4 lg:px-6 py-3 border-b ${isLightTheme ? 'border-emerald-200' : 'border-emerald-500'}`}>
        <button
          onClick={onAddUser}
          className={`px-4 py-2 ${isLightTheme ? 'bg-[#17be8e] text-white hover:bg-[#15a87d]' : 'bg-emerald-500 text-[#0a0e14] hover:bg-emerald-600'} font-bold uppercase tracking-widest rounded-md`}
        >
          Add user
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${isLightTheme ? 'bg-emerald-50/50 border-b border-emerald-200' : 'bg-[#09090B] border-b border-emerald-500'}`}>
            <tr>
              <th className={`px-4 lg:px-6 py-4 text-left text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} uppercase tracking-wider`}>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pageData.length > 0 && pageData.every(u => selectedIds.includes(u.id))}
                    onChange={toggleSelectAllOnPage}
                    disabled={pageData.length === 0}
                    className={`h-4 w-4 ${isLightTheme ? 'bg-white border-gray-300' : 'bg-[#09090B] border-[#2e2e36]'} border text-emerald-600 focus:ring-emerald-500 rounded disabled:opacity-50`}
                  />
                  <span className="hidden sm:inline">Select</span>
                </div>
              </th>
              <th className={`px-4 lg:px-6 py-4 text-center text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`} onClick={() => handleSort('name')}>Name</th>
              <th className={`px-4 lg:px-6 py-4 text-center text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`} onClick={() => handleSort('email')}>Email</th>
              <th className={`px-4 lg:px-6 py-4 text-center text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hidden md:table-cell`} onClick={() => handleSort('role')}>Access level</th>
              <th className={`px-4 lg:px-6 py-4 text-center text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hidden md:table-cell`} onClick={() => handleSort('function')}>Sector</th>
              <th className={`px-4 lg:px-6 py-4 text-center text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hidden md:table-cell`} onClick={() => handleSort('seniorityBand')}>Seniority</th>
              <th className={`px-4 lg:px-6 py-4 text-center text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} uppercase tracking-wider cursor-pointer hidden lg:table-cell`} onClick={() => handleSort('lastLoginAt')}>Last active</th>
              <th className={`px-4 lg:px-6 py-4 text-center text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} uppercase tracking-wider`}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody className={`${isLightTheme ? 'bg-white divide-y divide-gray-200' : 'bg-[#18181B] divide-y divide-[#2e2e36]'}`}>
            {pageData.map((user) => {
              const roleInfo = roleInfoMap[user.role] || roleInfoMap.USER;
              return (
                <tr
                  key={user.id}
                  className={`${isLightTheme ? 'hover:bg-gray-50' : 'hover:bg-[#202025]'} transition-colors duration-150 ${
                    selectedIds.includes(user.id) ? (isLightTheme ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'bg-emerald-500/5 border-l-4 border-l-emerald-500') : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => onToggleSelect(user.id)}
                      className={`h-4 w-4 ${isLightTheme ? 'bg-white border-gray-300' : 'bg-[#09090B] border-[#2e2e36]'} border text-emerald-600 focus:ring-emerald-500 rounded`}
                    />
                  </td>

                  {/* Name */}
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className={`font-medium ${isLightTheme ? 'text-gray-900' : 'text-white'} text-left lg:text-center truncate`}>
                      {user.name || 'Unknown User'}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className={`${isLightTheme ? 'text-[#0F172A]' : 'text-gray-300'} text-sm lg:text-base text-center`}>
                      {user.email}
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="flex justify-center">
                      <span className={`inline-flex px-3 py-0.5 rounded-md text-xs font-medium border ${roleInfo.color}`}>
                        {roleInfo.display}
                      </span>
                    </div>
                  </td>

                  {/* Function */}
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className={`text-center text-sm ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-300'}`}>
                      {user.function ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border bg-transparent ${isLightTheme ? 'text-[#0F172A] border-gray-200' : 'text-gray-300 border-[#2a364a]'}`}>
                          {user.function}
                        </span>
                      ) : (
                        <span className={isLightTheme ? 'text-gray-400' : 'text-gray-600'}>—</span>
                      )}
                    </div>
                  </td>

                  {/* Seniority */}
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className={`text-center text-sm ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-300'}`}>
                      {user.seniorityBand ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border bg-transparent ${isLightTheme ? 'text-[#0F172A] border-gray-200' : 'text-gray-300 border-[#2a364a]'}`}>
                          {user.seniorityBand}
                        </span>
                      ) : (
                        <span className={isLightTheme ? 'text-gray-400' : 'text-gray-600'}>—</span>
                      )}
                    </div>
                  </td>

                  {/* Last Active */}
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <div className={`text-sm ${isLightTheme ? 'text-gray-600' : 'text-gray-300'} flex items-center justify-center gap-2`}>
                      {user.lastLoginAt ? (
                        <>
                          <FaCheck className="w-3 h-3 text-emerald-500" />
                          {formatDate(user.lastLoginAt)}
                        </>
                      ) : (
                        <>
                          <FaTimes className={`w-3 h-3 ${isLightTheme ? 'text-gray-400' : 'text-gray-600'}`} />
                          Never
                        </>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2 flex-nowrap min-w-max">
                      <button
                        onClick={() => onAssignClick(user.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-md text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200 whitespace-nowrap ${isLightTheme ? 'border-gray-300 text-gray-600 hover:border-emerald-500 hover:text-emerald-600' : 'border-[#2a364a] text-gray-300 hover:border-emerald-500 hover:text-emerald-500'}`}
                        title="Assign Test"
                      >
                        <FaShare className="w-3 h-3" />
                        Assign
                      </button>
                      <button
                        onClick={() => onEdit(user)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-md text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200 whitespace-nowrap ${isLightTheme ? 'border-gray-300 text-gray-600 hover:border-emerald-500 hover:text-emerald-600' : 'border-[#2a364a] text-gray-300 hover:border-emerald-500 hover:text-emerald-500'}`}
                        title="Edit User"
                      >
                        <FaEdit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(user.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-md text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200 whitespace-nowrap ${isLightTheme ? 'border-gray-300 text-gray-600 hover:border-emerald-500 hover:text-emerald-600' : 'border-[#2a364a] text-gray-300 hover:border-emerald-500 hover:text-emerald-500'}`}
                        title="Delete User"
                      >
                        <FaTrash className="w-3 h-3" />
                        Delete
                      </button>
                      <button
                        onClick={() => onReport(user.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-md text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200 whitespace-nowrap ${isLightTheme ? 'border-gray-300 text-gray-600 hover:border-emerald-500 hover:text-emerald-600' : 'border-[#2a364a] text-gray-300 hover:border-emerald-500 hover:text-emerald-500'}`}
                        title="View Reports"
                      >
                        <FaFileAlt className="w-3 h-3" />
                        Report
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {pageData.length === 0 && (
          <div className="text-center py-12">
            <FaFrown className={`w-16 h-16 mx-auto ${isLightTheme ? 'text-gray-300' : 'text-gray-700'} mb-4`} />
            <h3 className={`mt-4 text-lg font-medium ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>No users found</h3>
            <p className={`mt-2 text-sm ${isLightTheme ? 'text-gray-500' : 'text-gray-500'} max-w-md mx-auto`}>
              {search ? 'Try adjusting your search terms' : 'No users available in the system'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pageData.length > 0 && (
        <div className={`px-4 lg:px-6 py-4 border-t ${isLightTheme ? 'border-emerald-200 bg-emerald-50/50' : 'border-emerald-500 bg-[#09090B]'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className={`text-sm ${isLightTheme ? 'text-gray-500' : 'text-gray-500'}`}>
              Showing <span className={`font-medium ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>{(current - 1) * pageSize + 1}</span> to{' '}
              <span className={`font-medium ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>
                {Math.min(current * pageSize, total)}
              </span>{' '}
              of <span className={`font-medium ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>{total}</span> results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={current === 1}
                className={`px-3 lg:px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 ${isLightTheme ? 'border-emerald-300 text-gray-600 bg-white hover:bg-emerald-50' : 'border-emerald-500 text-gray-300 bg-[#18181B] hover:bg-[#202025]'}`}
              >
                <FaChevronLeft className="w-3 h-3" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - current) <= 1)
                  .map((pageNum, index, array) => {
                    const showEllipsis = index < array.length - 1 && array[index + 1] - pageNum > 1;
                    return (
                      <React.Fragment key={pageNum}>
                        <button
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 min-w-[40px] ${
                            pageNum === current
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : (isLightTheme ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-400 hover:bg-[#202025]')
                          }`}
                        >
                          {pageNum}
                        </button>
                        {showEllipsis && (
                          <span className={`px-1 ${isLightTheme ? 'text-gray-400' : 'text-gray-600'}`}>...</span>
                        )}
                      </React.Fragment>
                    );
                  })}
              </div>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={current === totalPages}
                className={`px-3 lg:px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 ${isLightTheme ? 'border-emerald-300 text-gray-600 bg-white hover:bg-emerald-50' : 'border-emerald-500 text-gray-300 bg-[#18181B] hover:bg-[#202025]'}`}
              >
                <span className="hidden sm:inline">Next</span>
                <FaChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
