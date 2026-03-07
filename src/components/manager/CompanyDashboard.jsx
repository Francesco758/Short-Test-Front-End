// src/components/manager/CompanyDashboard.jsx
import React, { useState, useEffect } from "react";
import { 
  FaUsers, 
  FaChartLine, 
  FaCheckCircle, 
  FaClock,
  FaExclamationTriangle,
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaTimes,
  FaUserCog,
  FaPlus,
  FaFileAlt,
  FaRocket
} from "react-icons/fa";
import { HiOutlineUserGroup } from "react-icons/hi";
import useCompanyData from "../../hooks/useCompanyData";
import ReactMarkdown from "react-markdown";
import TestsMultiSelect from "./TestsMultiSelect";
import UsersTable from "./UsersTable";
import ShortTestModal from "./ShortTestModal";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import KPIDetailsModal from "../admin/KPIDetailsModal";
import SuccessNotificationModal from "../../models/SuccessNotificationModal";
import DeleteConfirmModal from "../../models/DeleteConfirmModal";
import ReportsModal from "./ReportsModal";
import AssignModal from "./AssignModal";
import AIQueryPanel from "./AIQueryPanel";

export default function CompanyDashboard({ companyId }) {
  const {
    users, 
    tests, 
    kpis,
    ckpiMetrics,
    recentRuns, 
    deadlines,
    problemSolutionData,
    loading, 
    error, 
    addUser, 
    updateUser, 
    deleteUser,
    // bulkAssignTests, // Not currently used
    assignTestToUsers,
    fetchUserTestReport,
    refetch 
  } = useCompanyData(companyId);

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  // const [selectedTestIds, setSelectedTestIds] = useState([]); // Not currently used
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  // const [isEditOpen, setIsEditOpen] = useState(false); // Not currently used
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [assignTargetSingle, setAssignTargetSingle] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [reportUserId, setReportUserId] = useState(null);
  // const [bulkAssignLoading, setBulkAssignLoading] = useState(false); // Not currently used
  const [isShortTestOpen, setIsShortTestOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showKPIDetails, setShowKPIDetails] = useState(false);
  const [showAllProblems, setShowAllProblems] = useState(false);
  const [showTopShorters, setShowTopShorters] = useState(false);
  const [showEmergingProblems, setShowEmergingProblems] = useState(false);
  const [showAllSolutions, setShowAllSolutions] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState(null);

  const toggleShortTest = () => setIsShortTestOpen(!isShortTestOpen);
  const toggleChatbot = () => setShowChatbot(!showChatbot);
  const toggleKPIDetails = () => setShowKPIDetails(!showKPIDetails);
  
  // Notification states
  const [successNotification, setSuccessNotification] = useState({
    isOpen: false,
    title: "",
    message: ""
  });
  
  // Delete confirmation states
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);

  // Dynamic problem/solution data from API
  const emergingProblems = problemSolutionData.problems.map(problem => ({
    label: problem.cluster,
    key: problem.key,
    value: problem.avgFinal,
    count: problem.count
  }));
  
  const desiredSolutions = problemSolutionData.solutions.map(solution => ({
    label: solution.cluster,
    key: solution.key,
    value: solution.avgFinal,
    count: solution.count,
    feasibility: solution.avgFeasibility,
    proactivity: solution.avgProactivity,
    bestExample: solution.bestExample
  }));

  // Prepare data for Emerging Problems Modal
  const recentProblemsGrouped = (problemSolutionData.recentProblems || []).reduce((acc, problem) => {
    const category = problem.cluster || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(problem);
    return acc;
  }, {});

  // Prepare data for Top Solutions Modal (sorted by feasibility)
  const topSolutionsSorted = [...(problemSolutionData.allSolutions || [])]
    .sort((a, b) => (b.avgFeasibility || 0) - (a.avgFeasibility || 0))
    .slice(0, 10)
    .map(solution => ({
      label: solution.cluster,
      key: solution.key,
      value: solution.avgFinal,
      count: solution.count,
      feasibility: solution.avgFeasibility,
      proactivity: solution.avgProactivity,
      bestExample: solution.bestExample
    }));

  function toggleUserSelection(userId) {
    setSelectedUserIds((prev) => 
      prev.includes(userId) 
        ? prev.filter((id) => id !== userId) 
        : [...prev, userId]
    );
  }

  function openAssignForUser(userId) {
    setAssignTargetSingle(userId);
    setIsAssignOpen(true);
  }

  function closeAssign() {
    setAssignTargetSingle(null);
    setIsAssignOpen(false);
  }

  async function handleCreateUser(newUser) {
    console.log("User created successfully:", newUser);
    // Modal will close automatically after successful creation
  }

  /**
   * Handle bulk assignment - uses POST /api/company/tests/bulk-assign
   * NOTE: Currently not used - bulk assignment is handled through the UI
   */
  // async function handleBulkAssign() {
  //   if (selectedUserIds.length === 0) {
  //     alert("Please select at least one user to assign.");
  //     return;
  //   }

  //   if (selectedTestIds.length === 0) {
  //     alert("Please select at least one test to assign.");
  //     return;
  //   }

  //   setBulkAssignLoading(true);
  //   try {
  //     const result = await bulkAssignTests({
  //       testIds: selectedTestIds,
  //       userIds: selectedUserIds,
  //       notify: true // ✅ Add notify parameter - always send emails for bulk assign
  //     });

  //     console.log("Bulk assignment successful:", result);
  //     alert(`Successfully assigned ${selectedTestIds.length} test(s) to ${selectedUserIds.length} user(s)! Emails have been sent.`);
  //     
  //     // Clear selections after successful assignment
  //     setSelectedUserIds([]);
  //     setSelectedTestIds([]);
  //   } catch (err) {
  //     console.error("Bulk assignment failed:", err);
  //     alert("Failed to assign tests: " + (err.message || "Unknown error"));
  //   } finally {
  //     setBulkAssignLoading(false);
  //   }
  // }

  /**
   * Handle edit user - uses PUT /api/company/users/:id
   */
  async function handleEditUser(updates) {
    try {
      await updateUser(editingUser.id, updates);
      setEditingUser(null); // Close modal
      console.log("User updated successfully");
      setSuccessNotification({
        isOpen: true,
        title: "User Updated",
        message: "User has been updated successfully!"
      });
    } catch (err) {
      setSuccessNotification({
        isOpen: true,
        title: "Update Failed",
        message: "Failed to update user: " + err.message,
        type: "warning"
      });
    }
  }

  /**
   * Handle delete user - uses DELETE /api/company/users/:id
   */
  function showDeleteUserConfirmation(userId) {
    setUserToDelete(userId);
    setShowDeleteUserModal(true);
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete);
      console.log("User deleted successfully");
      setShowDeleteUserModal(false);
      setSuccessNotification({
        isOpen: true,
        title: "User Deleted",
        message: "User has been deleted successfully!"
      });
    } catch (err) {
      console.error("Failed to delete user:", err);
      setShowDeleteUserModal(false);
      setSuccessNotification({
        isOpen: true,
        title: "Delete Failed",
        message: "Failed to delete user: " + err.message,
        type: "warning"
      });
    } finally {
      setUserToDelete(null);
    }
  }

  /**
   * Handle view reports - uses GET /api/company/reports/user-reports and GET /api/company/reports/user-test/:userTestId
   */
  function handleViewReports(userId) {
    setReportUserId(userId);
    setIsReportsOpen(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00f2aa] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading company data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load data</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-[#00f2aa] text-[#0f172a] font-bold rounded-lg hover:bg-[#00d496] flex items-center justify-center gap-2 mx-auto"
          >
            <FaSync className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-white p-6 lg:p-12">
      {/* Main Container */}
      <div className="mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white uppercase">
              Shortest Dashboard
            </h1>
            <p className="text-gray-500 text-sm font-bold tracking-widest uppercase mt-1">
              Manager Level Cockpit | 2026
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsUserManagementOpen(true)}
              className="px-6 py-3 border border-gray-700 text-gray-300 font-bold text-xs uppercase tracking-widest rounded-md hover:bg-gray-800 transition-all"
            >
              Manage People
            </button>
            <button
              onClick={() => setIsShortTestOpen(true)}
              className="px-6 py-3 bg-[#00f2aa] text-[#0f172a] font-black text-xs uppercase tracking-widest rounded-md hover:bg-[#00d496] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,170,0.3)]"
            >
              Launch shorTest 🚀
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* TOP LEFT: Change KPI */}
          <div 
            onClick={() => setShowKPIDetails(true)} 
            className="bg-[#1e293b] rounded-xl p-10 shadow-xl border border-gray-800 cursor-pointer hover:border-gray-700 transition-all group relative overflow-hidden h-[450px]"
          >
            <h3 className="text-white font-black text-xl uppercase tracking-widest mb-10">Change KPI</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 h-full pb-10">
              {/* Circular Progress */}
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="112"
                    cy="112"
                    r="100"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="transparent"
                    className="text-gray-800"
                  />
                  <circle
                    cx="112"
                    cy="112"
                    r="100"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 100}
                    strokeDashoffset={2 * Math.PI * 100 * (1 - (kpis.changeKpiPercent ?? 0) / 100)}
                    className="text-[#00f2aa] transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black text-white">{kpis.changeKpiPercent ?? 0}%</span>
                </div>
              </div>

              {/* KPI Bars */}
              <div className="flex-1 w-full space-y-6">
                {[
                  { label: 'Simplification', value: ckpiMetrics?.averages?.simplification || 0 },
                  { label: 'Originality', value: ckpiMetrics?.averages?.originality || 0 },
                  { label: 'Feasibility', value: ckpiMetrics?.averages?.feasibility || 0 },
                  { label: 'Critical Thinking', value: ckpiMetrics?.averages?.criticalThinking || 0 },
                  { label: 'Proactivity', value: ckpiMetrics?.averages?.proactivity || 0 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white">
                      <span>{item.label}</span>
                      <span>{Math.round(item.value)}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00f2aa] transition-all duration-1000 ease-out" 
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TOP RIGHT: People Involved */}
          <div 
            onClick={() => setShowTopShorters(true)} 
            className="bg-[#1e293b] rounded-xl p-10 shadow-xl border border-gray-800 cursor-pointer hover:border-gray-700 transition-all h-[450px]"
          >
            <h3 className="text-white font-black text-xl uppercase tracking-widest mb-10">People Involved</h3>
            
            <div className="flex flex-col md:flex-row items-center gap-16 h-full pb-10">
              <div className="text-9xl font-black text-white tracking-tighter">
                {kpis.activeUsers?.toLocaleString() ?? '0'}
              </div>
              
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-800">
                  <h4 className="text-[10px] font-black text-[#00f2aa] uppercase tracking-[0.2em]">Top 3 Shorter</h4>
                </div>
                
                <div className="space-y-8">
                  {(kpis.topShorters || []).slice(0, 3).map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <span className="text-lg font-bold text-gray-300 group-hover:text-white transition-colors">
                        {user.name}
                      </span>
                      <span className="text-lg font-black text-[#00f2aa]">
                        {user.avgCKPI}
                      </span>
                    </div>
                  ))}
                  {(!kpis.topShorters || kpis.topShorters.length === 0) && (
                    <div className="text-sm text-gray-500 italic font-bold uppercase tracking-widest">No data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CENTER LEFT: Emerging Problems */}
          <div 
            onClick={() => setShowEmergingProblems(true)} 
            className="bg-[#1e293b] rounded-xl p-10 shadow-xl border border-gray-800 cursor-pointer hover:border-gray-700 transition-all h-[450px]"
          >
            <h3 className="text-white font-black text-xl uppercase tracking-widest mb-10">Emerging Problems</h3>
            
            <div className="space-y-10">
              {emergingProblems.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center gap-8 group">
                  <span className={`text-4xl font-black ${idx === 0 ? 'text-[#00f2aa]' : idx === 1 ? 'text-[#00f2aa]/70' : 'text-[#00f2aa]/40'}`}>
                    {item.count}
                  </span>
                  <span className="text-xl font-bold text-gray-300 group-hover:text-white transition-colors truncate">
                    {item.label}
                  </span>
                </div>
              ))}
              {emergingProblems.length === 0 && (
                <div className="text-sm text-gray-500 italic font-bold uppercase tracking-widest">No emerging problems detected.</div>
              )}
            </div>
          </div>

          {/* CENTER RIGHT: Top Solutions */}
          <div 
            onClick={() => setShowAllSolutions(true)} 
            className="bg-[#1e293b] rounded-xl p-10 shadow-xl border border-gray-800 cursor-pointer hover:border-gray-700 transition-all h-[450px]"
          >
            <h3 className="text-white font-black text-xl uppercase tracking-widest mb-10">Top Solutions</h3>
            
            <div className="space-y-10">
              {desiredSolutions.slice(0, 3).map((item, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white">
                    <span>{item.label}</span>
                    <span>{Math.round(item.feasibility)}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#00f2aa] transition-all duration-1000 ease-out" 
                      style={{ width: `${item.feasibility}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {desiredSolutions.length === 0 && (
                <div className="text-sm text-gray-500 italic font-bold uppercase tracking-widest">No solutions available.</div>
              )}
            </div>
          </div>

          {/* BOTTOM SECTION - AI QUERY PANEL */}
          <div className="lg:col-span-2">
            <AIQueryPanel 
              onQuery={async (question) => {
                const { api } = await import("../../utils/api");
                const res = await api('/api/company/reports/query', {
                  method: 'POST',
                  body: JSON.stringify({ question })
                });
                return res;
              }}
              onManagePeople={() => setIsUserManagementOpen(true)}
              onLaunchTest={() => setIsShortTestOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreate={handleCreateUser}
        companyId={companyId}
        addUser={addUser}
        isOverUserManagement={isUserManagementOpen}
      />

      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onUpdate={handleEditUser}
        isOverUserManagement={isUserManagementOpen}
      />

      <ReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        userId={reportUserId}
        userName={users.find(u => u.id === reportUserId)?.name}
        fetchUserTestReport={fetchUserTestReport}
        isOverUserManagement={isUserManagementOpen}
      />

      <KPIDetailsModal 
        isOpen={showKPIDetails}
        onClose={() => setShowKPIDetails(false)}
        title="Company CKPI Analysis"
        data={ckpiMetrics}
      />

      <AssignModal
        isOpen={isAssignOpen}
        onClose={closeAssign}
        userIds={assignTargetSingle ? [assignTargetSingle] : []}
        tests={tests}
        assignTestToUsers={assignTestToUsers} 
        companyId={companyId}
        isOverUserManagement={isUserManagementOpen}
      />

      {isShortTestOpen && (
        <ShortTestModal
          isOpen={isShortTestOpen}
          onClose={() => setIsShortTestOpen(false)}
          tests={tests}
          users={users}
          assignTestToUsers={assignTestToUsers}
        />
      )}

      {/* User Management Modal */}
      {isUserManagementOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-[#0f172a] rounded-[40px] shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden border border-gray-800 flex flex-col">
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-gray-800 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-xl">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[#1e293b] border border-gray-700 rounded-2xl flex items-center justify-center shadow-inner">
                  <FaUserCog className="w-6 h-6 text-[#00f2aa]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">User Management</h2>
                  <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">Manage company users, assign tests, and view reports</p>
                </div>
              </div>
              <button
                onClick={() => setIsUserManagementOpen(false)}
                className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 transition-all group"
              >
                <FaTimes className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Modal Content - Users Table */}
            <div className="flex-1 overflow-auto p-10 custom-scrollbar">
              <div className="bg-[#1e293b] rounded-3xl border border-gray-800 p-8 shadow-xl">
                <UsersTable
                  users={users}
                  selectedIds={selectedUserIds}
                  onToggleSelect={toggleUserSelection}
                  onAssignClick={(userId) => openAssignForUser(userId)}
                  onDelete={showDeleteUserConfirmation}
                  onEdit={(user) => setEditingUser(user)}
                  onReport={handleViewReports}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-8 border-t border-gray-800 bg-[#0f172a]/80 backdrop-blur-xl flex items-center justify-between">
              <div className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">
                Total Users: <span className="text-[#00f2aa] ml-2">{users.length}</span>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="flex items-center gap-3 px-6 py-3 bg-[#1e293b] border border-gray-700 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 hover:border-gray-600 transition-all"
                >
                  <FaPlus className="w-4 h-4 text-[#00f2aa]" />
                  <span>Add User</span>
                </button>
                <button
                  onClick={() => setIsUserManagementOpen(false)}
                  className="px-8 py-3 bg-[#00f2aa] text-[#0f172a] text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#00d496] transition-all shadow-[0_0_20px_rgba(0,242,170,0.2)]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteUserModal}
        onClose={() => setShowDeleteUserModal(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />

      {/* Success Notification Modal */}
      <SuccessNotificationModal
        isOpen={successNotification.isOpen}
        onClose={() => setSuccessNotification({ ...successNotification, isOpen: false })}
        title={successNotification.title}
        message={successNotification.message}
        type={successNotification.type || "success"}
        duration={3000}
      />

      {/* Top Shorters Modal */}
      {showTopShorters && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#0f172a] rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border border-gray-800 flex flex-col">
            <div className="px-8 py-6 border-b border-gray-800 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#1e293b] border border-gray-700 rounded-2xl flex items-center justify-center shadow-inner">
                  <FaUsers className="text-[#00f2aa] w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter">Top Shorters</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Ordered by CKPI</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTopShorters(false)}
                className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-all"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <div className="p-8 max-h-[400px] overflow-y-auto custom-scrollbar">
              {kpis.topShorters && kpis.topShorters.length > 0 ? (
                <div className="space-y-4">
                  {kpis.topShorters.map((shorter, idx) => (
                    <div key={shorter.id} className="flex items-center justify-between p-5 bg-[#1e293b] rounded-2xl border border-gray-800 hover:border-gray-700 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-[#0f172a] border border-gray-700 flex items-center justify-center text-sm font-black text-gray-500 group-hover:text-[#00f2aa] transition-colors">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg group-hover:text-[#00f2aa] transition-colors">{shorter.name}</div>
                          <div className="text-[9px] text-gray-600 uppercase tracking-widest font-black">ID: {String(shorter.id).slice(-6)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-[#00f2aa]">{shorter.avgCKPI}%</div>
                        <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Avg CKPI</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#1e293b] rounded-3xl border border-gray-800 border-dashed">
                  <FaUsers className="text-gray-700 w-12 h-12 mx-auto mb-4" />
                  <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No user data available</p>
                </div>
              )}
            </div>
            <div className="p-6 bg-[#0f172a] border-t border-gray-800">
              <button 
                onClick={() => setShowTopShorters(false)}
                className="w-full py-3 bg-[#00f2aa] text-[#0f172a] font-black uppercase tracking-widest rounded-xl hover:bg-[#00d496] transition-all shadow-[0_0_20px_rgba(0,242,170,0.2)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emerging Problems Modal */}
      {showEmergingProblems && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div 
            className="bg-[#0f172a] rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-800"
          >
            <div className="px-10 py-8 border-b border-gray-800 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-xl">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[#1e293b] border border-gray-700 rounded-2xl flex items-center justify-center shadow-inner">
                  <FaExclamationTriangle className="text-[#00f2aa] w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Emerging Problems</h3>
                  <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">10 most recent problem summaries grouped by Category</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEmergingProblems(false)}
                className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-all"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
              {Object.keys(recentProblemsGrouped).length === 0 ? (
                <div className="text-center py-20 bg-[#1e293b] rounded-[40px] border border-gray-800 border-dashed">
                  <div className="text-gray-500 font-black uppercase tracking-widest text-sm italic">No emerging problems identified yet.</div>
                </div>
              ) : (
                Object.entries(recentProblemsGrouped).map(([category, problems]) => (
                  <div key={category} className="space-y-6 pb-10 border-b border-gray-800 last:border-0 last:pb-0">
                    <h4 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-4">
                      <span className="w-8 h-1 bg-[#00f2aa]"></span>
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                      {problems.map((problem) => (
                        <div key={problem.id} className="bg-[#1e293b] rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all group">
                          <div className="flex items-center justify-between mb-4">
                             <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                               {new Date(problem.date).toLocaleDateString()}
                             </span>
                          </div>
                          <p className="text-gray-300 text-lg font-medium leading-relaxed group-hover:text-white transition-colors">{problem.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="px-10 py-8 border-t border-gray-800 bg-[#0f172a]/80 backdrop-blur-xl flex justify-end">
               <button 
                onClick={() => setShowEmergingProblems(false)}
                className="px-10 py-3 bg-[#00f2aa] text-[#0f172a] font-black uppercase tracking-widest rounded-xl hover:bg-[#00d496] transition-all shadow-[0_0_20px_rgba(0,242,170,0.2)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Solutions Modal (List View) */}
      {showAllSolutions && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div 
            className="bg-[#0f172a] rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-800"
          >
            <div className="px-10 py-8 border-b border-gray-800 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-xl">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[#1e293b] border border-gray-700 rounded-2xl flex items-center justify-center shadow-inner">
                  <FaCheckCircle className="text-[#00f2aa] w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Top Solutions</h3>
                  <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">Top 10 solutions sorted by feasibility</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAllSolutions(false)}
                className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-all"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-10 overflow-y-auto space-y-12 custom-scrollbar">
              {topSolutionsSorted.length === 0 ? (
                <div className="text-center py-20 bg-[#1e293b] rounded-[40px] border border-gray-800 border-dashed">
                  <div className="text-gray-500 font-black uppercase tracking-widest text-sm italic">No solutions identified yet.</div>
                </div>
              ) : (
                topSolutionsSorted.map((item, idx) => (
                  <div key={idx} className="space-y-6 pb-12 border-b border-gray-800 last:border-0 last:pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <h4 className="text-2xl font-black text-white uppercase tracking-widest mb-3">{item.label}</h4>
                        <div className="flex flex-wrap items-center gap-6">
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">{item.key}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Feasibility:</span>
                            <span className="text-[#00f2aa] font-black text-lg">{Math.round(item.feasibility)}%</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Occurrences:</span>
                            <span className="text-white font-black text-lg">{item.count}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-64">
                        <div className="h-3 bg-[#0f172a] rounded-full border border-gray-800 overflow-hidden">
                          <div className="h-full bg-[#00f2aa] transition-all duration-1000 ease-out" style={{ width: `${item.feasibility}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1e293b] rounded-[32px] p-8 border border-gray-800 shadow-xl group hover:border-gray-700 transition-all">
                      <h5 className="font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-3 mb-6 text-xs">
                        <FaFileAlt className="text-[#00f2aa] w-4 h-4" />
                        Extended Summary
                      </h5>
                      {item.bestExample ? (
                        <div className="text-gray-300 text-lg font-medium leading-relaxed group-hover:text-white transition-colors prose prose-invert prose-lg max-w-none">
                          <ReactMarkdown>
                            {item.bestExample}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-gray-600 italic text-sm font-black uppercase tracking-widest">No extended summary available for this solution.</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
             {/* Anchored Footer Section */}
             <div className="px-8 py-4 border-t border-gray-800 bg-[#0f172a]/80 backdrop-blur-xl">
               <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl border border-gray-800 p-6 shadow-2xl relative overflow-hidden group max-w-4xl mx-auto">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-[#00f2aa]/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-[#00f2aa]/10 transition-all"></div>
                 <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                   <div className="text-center md:text-left">
                     <div className="font-black text-lg text-white uppercase tracking-tighter mb-1">Develop these solutions in shorTest</div>
                     <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest leading-relaxed">Ready to implement these insights with your team?</p>
                   </div>
                   <button 
                     onClick={() => {
                       setShowAllSolutions(false);
                       setIsShortTestOpen(true);
                     }}
                     className="px-6 py-2.5 bg-[#00f2aa] text-[#0f172a] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#00d496] hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(0,242,170,0.3)] whitespace-nowrap"
                   >
                     <FaRocket className="w-4 h-4" />
                     Launch shorTest
                   </button>
                 </div>
               </div>

               <div className="mt-4 flex justify-center">
                 <button 
                   onClick={() => setShowAllSolutions(false)}
                   className="text-gray-600 font-black text-[9px] uppercase tracking-[0.4em] hover:text-white transition-colors"
                 >
                   CANCEL AND RETURN TO DASHBOARD
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Solution Detail Modal (Keep for legacy support or specific detail view if needed) */}
      {selectedSolution && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FaCheckCircle className="text-emerald-600 w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedSolution.label}</h3>
                  <p className="text-xs text-gray-500">Solution Detail & Extended Summary</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSolution(null)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-400" />
              </button>
            </div>
            <div className="p-8 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                  <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Feasibility</div>
                  <div className="text-2xl font-black text-emerald-700">{selectedSolution.value}%</div>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                  <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-1">Occurrences</div>
                  <div className="text-2xl font-black text-indigo-700">{selectedSolution.count}</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Pattern Key</div>
                  <div className="text-sm font-mono text-gray-700 truncate">{selectedSolution.key}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <FaFileAlt className="text-indigo-500 w-4 h-4" />
                  Extended Summary (Best Example)
                </h4>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 prose prose-indigo max-w-none">
                  {selectedSolution.bestExample ? (
                    <div className="text-gray-700 text-sm leading-relaxed">
                      <ReactMarkdown>
                        {selectedSolution.bestExample}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm text-center py-4">No extended summary available for this solution.</p>
                  )}
                </div>
              </div>

              <div className="mt-8 p-5 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl text-white shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-lg mb-1">Actionable Insight</div>
                    <p className="text-indigo-100 text-xs">Ready to implement this solution in your team?</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedSolution(null);
                      setIsShortTestOpen(true);
                    }}
                    className="px-6 py-2.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
                  >
                    <FaRocket className="w-4 h-4" />
                    Develop with shorTest
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedSolution(null)}
                className="px-6 py-2 text-gray-600 font-semibold hover:text-gray-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
