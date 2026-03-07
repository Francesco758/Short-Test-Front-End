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
}) {
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
      return <FaSort className="w-3 h-3 text-gray-300" />;
    }
    return sortDirection === 'asc' ? 
      <FaSortUp className="w-3 h-3 text-indigo-600" /> : 
      <FaSortDown className="w-3 h-3 text-indigo-600" />;
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

  // Get role display name and color
  function getRoleInfo(role) {
    switch (role) {
      case 'SUPER_ADMIN':
        return { display: 'Super Admin', color: 'bg-red-100 text-red-800 border-red-200' };
      case 'COMPANY_ADMIN':
        return { display: 'Company Manager', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'STUDENT':
        return { display: 'Student', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'TEACHER':
        return { display: 'Teacher', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'USER':
      default:
        return { display: 'User', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  }

  return (
    <div className="bg-[#1e293b] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
      
      {/* Toolbar */}
      <div className="p-8 border-b border-gray-800 bg-[#1e293b]/50 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Section */}
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-[#0f172a] border border-gray-700 rounded-2xl flex items-center justify-center shadow-inner">
              <FaUser className="w-6 h-6 text-[#00f2aa]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                Fleet Management
              </h3>
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total:</span>
                  <span className="text-xs font-black text-white">{users.length}</span>
                </div>
                <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selected:</span>
                  <span className="text-xs font-black text-[#00f2aa]">{selectedIds.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            
            {/* Search */}
            <div className="relative group flex-1 sm:w-72">
              <FaSearch className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 group-focus-within:text-[#00f2aa] transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="SEARCH OPERATIVES..."
                className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-[#00f2aa]/20 focus:border-[#00f2aa] transition-all font-bold text-xs uppercase tracking-widest"
              />
            </div>

            {/* Page Size */}
            <div className="relative">
              <select 
                value={pageSize} 
                onChange={handlePageSizeChange}
                className="appearance-none pl-4 pr-10 py-3 bg-[#0f172a] border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-[#00f2aa]/20 focus:border-[#00f2aa] transition-all font-bold text-xs uppercase tracking-widest cursor-pointer"
              >
                <option value={5}>05 / PAGE</option>
                <option value={10}>10 / PAGE</option>
                <option value={20}>20 / PAGE</option>
                <option value={50}>50 / PAGE</option>
              </select>
              <HiDotsHorizontal className="w-4 h-4 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
            </div>

            {/* Select All Button */}
            <button
              onClick={toggleSelectAllOnPage}
              disabled={pageData.length === 0}
              className="px-6 py-3 bg-[#0f172a] border border-gray-800 text-gray-400 rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 hover:text-white disabled:opacity-50 transition-all text-[10px] flex items-center gap-3"
            >
              <FaCheck className="w-3 h-3 text-[#00f2aa]" />
              Sync Selection
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#0f172a]/30 border-b border-gray-800">
              <th className="px-8 py-5 text-left">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={pageData.length > 0 && pageData.every(u => selectedIds.includes(u.id))}
                    onChange={toggleSelectAllOnPage}
                    disabled={pageData.length === 0}
                    className="h-5 w-5 bg-[#0f172a] border-gray-700 rounded text-[#00f2aa] focus:ring-[#00f2aa]/20 disabled:opacity-30 transition-all cursor-pointer"
                  />
                </div>
              </th>
              <th 
                className="px-6 py-5 text-left cursor-pointer hover:bg-white/5 transition-colors group"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Operative</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th 
                className="px-6 py-5 text-left cursor-pointer hover:bg-white/5 transition-colors group hidden md:table-cell"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Communication</span>
                  {getSortIcon('email')}
                </div>
              </th>
              <th 
                className="px-6 py-5 text-center cursor-pointer hover:bg-white/5 transition-colors group hidden md:table-cell"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Access Level</span>
                  {getSortIcon('role')}
                </div>
              </th>
              <th 
                className="px-6 py-5 text-center cursor-pointer hover:bg-white/5 transition-colors group hidden lg:table-cell"
                onClick={() => handleSort('function')}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Sector</span>
                  {getSortIcon('function')}
                </div>
              </th>
              <th 
                className="px-6 py-5 text-center cursor-pointer hover:bg-white/5 transition-colors group hidden lg:table-cell"
                onClick={() => handleSort('seniorityBand')}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Rank</span>
                  {getSortIcon('seniorityBand')}
                </div>
              </th>
              <th className="px-8 py-5 text-right">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800/50">
            {pageData.map((user) => {
              const roleInfo = getRoleInfo(user.role);
              const isSelected = selectedIds.includes(user.id);
              
              // Map old colors to new cockpit theme
              const getRankColor = (band) => {
                if (!band) return 'text-gray-600 border-gray-800 bg-gray-900/30';
                return 'text-[#00f2aa] border-[#00f2aa]/20 bg-[#00f2aa]/5';
              };

              return (
                <tr 
                  key={user.id} 
                  className={`group transition-all duration-300 ${
                    isSelected ? 'bg-[#00f2aa]/5' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="px-8 py-6 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(user.id)}
                      className="h-5 w-5 bg-[#0f172a] border-gray-700 rounded text-[#00f2aa] focus:ring-[#00f2aa]/20 transition-all cursor-pointer"
                    />
                  </td>

                  {/* Name */}
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#0f172a] border border-gray-700 rounded-xl flex items-center justify-center shadow-inner group-hover:border-[#00f2aa]/50 transition-colors overflow-hidden">
                        <span className="text-[#00f2aa] text-xs font-black">
                          {getUserInitials(user)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className={`text-sm font-black uppercase tracking-tight transition-colors ${isSelected ? 'text-[#00f2aa]' : 'text-white'}`}>
                          {user.name || 'ANONYMOUS'}
                        </div>
                        {user.assignedTests && user.assignedTests.length > 0 && (
                          <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00f2aa] animate-pulse"></div>
                            {user.assignedTests.length} ACTIVE ASSIGNMENTS
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-6 whitespace-nowrap hidden md:table-cell">
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-widest group-hover:text-gray-200 transition-colors">
                      {user.email}
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-6 whitespace-nowrap hidden md:table-cell text-center">
                    <span className="inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-800 bg-gray-900/50 text-gray-400 group-hover:border-gray-700 transition-colors">
                      {roleInfo.display}
                    </span>
                  </td>
                  
                  {/* Function */}
                  <td className="px-6 py-6 whitespace-nowrap hidden lg:table-cell text-center">
                    {user.function ? (
                      <span className="inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-[#00f2aa]/10 bg-[#00f2aa]/5 text-[#00f2aa]/70 group-hover:text-[#00f2aa] transition-all">
                        {user.function}
                      </span>
                    ) : (
                      <span className="text-gray-700 font-black text-[10px]">—</span>
                    )}
                  </td>
                  
                  {/* Seniority */}
                  <td className="px-6 py-6 whitespace-nowrap hidden lg:table-cell text-center">
                    {user.seniorityBand ? (
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getRankColor(user.seniorityBand)}`}>
                        {user.seniorityBand}
                      </span>
                    ) : (
                      <span className="text-gray-700 font-black text-[10px]">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onAssignClick(user.id)}
                        className="p-2.5 bg-[#0f172a] border border-gray-800 text-gray-500 rounded-xl hover:text-[#00f2aa] hover:border-[#00f2aa]/30 transition-all"
                        title="DEPLOY TEST"
                      >
                        <FaShare className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onEdit(user)}
                        className="p-2.5 bg-[#0f172a] border border-gray-800 text-gray-500 rounded-xl hover:text-white hover:border-gray-700 transition-all"
                        title="MODIFY IDENTITY"
                      >
                        <FaEdit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onReport(user.id)}
                        className="p-2.5 bg-[#0f172a] border border-gray-800 text-gray-500 rounded-xl hover:text-[#00f2aa] hover:border-[#00f2aa]/30 transition-all"
                        title="INTEL REPORT"
                      >
                        <FaFileAlt className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-6 bg-gray-800 mx-1"></div>
                      <button 
                        onClick={() => onDelete(user.id)}
                        className="p-2.5 bg-[#0f172a] border border-gray-800 text-gray-500 rounded-xl hover:text-red-500 hover:border-red-900/30 transition-all"
                        title="TERMINATE ACCESS"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
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
          <div className="text-center py-24 bg-[#0f172a]/20">
            <div className="w-20 h-20 bg-[#1e293b] rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
              <FaFrown className="w-10 h-10 text-gray-700" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">No Operatives Located</h3>
            <p className="mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] max-w-xs mx-auto">
              {search ? 'Refine your radar search parameters' : 'The system contains no registered users at this time'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pageData.length > 0 && (
        <div className="px-8 py-6 border-t border-gray-800 bg-[#0f172a]/40 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
              Sectors <span className="text-white">{(current - 1) * pageSize + 1}</span> — <span className="text-white">{Math.min(current * pageSize, total)}</span> of <span className="text-[#00f2aa]">{total}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={current === 1}
                className="px-5 py-2.5 bg-[#0f172a] border border-gray-800 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white hover:border-gray-600 disabled:opacity-30 transition-all flex items-center gap-3"
              >
                <FaChevronLeft className="w-3 h-3" />
                Prev
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - current) <= 1)
                  .map((pageNum, index, array) => {
                    const showEllipsis = index < array.length - 1 && array[index + 1] - pageNum > 1;
                    return (
                      <React.Fragment key={pageNum}>
                        <button
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-[10px] font-black uppercase transition-all border ${
                            pageNum === current
                              ? 'bg-[#00f2aa] text-[#0f172a] border-[#00f2aa] shadow-[0_0_15px_rgba(0,242,170,0.3)]'
                              : 'bg-[#0f172a] text-gray-500 border-gray-800 hover:border-gray-600 hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                        {showEllipsis && <span className="text-gray-700 font-black px-1">...</span>}
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={current === totalPages}
                className="px-5 py-2.5 bg-[#0f172a] border border-gray-800 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white hover:border-gray-600 disabled:opacity-30 transition-all flex items-center gap-3"
              >
                Next
                <FaChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
