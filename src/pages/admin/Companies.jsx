import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaChartLine, FaBuilding, FaSearch, FaClipboardList, FaSignInAlt, FaSun, FaMoon } from "react-icons/fa";
import { useSidebar } from '../../components/layout/AdminLayout';
import { api } from "../../utils/api";
import DeleteConfirmModal from "../../models/DeleteConfirmModal";
import SuccessNotificationModal from "../../models/SuccessNotificationModal";

export default function AdminCompaniesPage() {
  const navigate = useNavigate();
  const { toggleSidebar, isLightTheme, toggleTheme } = useSidebar();
  const [companies, setCompanies] = useState([]);
  const [tests, setTests] = useState([]); // For assign test dropdown
  const [loading, setLoading] = useState(true);
  const [testsLoading, setTestsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedTest, setSelectedTest] = useState("");
  
  // Form states
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPassword, setCompanyPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [successNotification, setSuccessNotification] = useState({
    isOpen: false,
    title: "",
    message: ""
  });

  // Assigned tests (per company) + un-assign
  const [showAssignedTestsModal, setShowAssignedTestsModal] = useState(false);
  const [assignedTestsCompany, setAssignedTestsCompany] = useState(null);
  const [assignedTestsData, setAssignedTestsData] = useState([]);
  const [assignedTestsLoading, setAssignedTestsLoading] = useState(false);
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  // Fetch companies and tests on component mount
  useEffect(() => {
    fetchCompanies();
    fetchTests();
  }, []);

  /**
   * Fetch all companies from backend
   */
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api('/api/admin/companies');
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError(err?.error || err?.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch all tests for assignment dropdown
   */
  const fetchTests = async () => {
    try {
      setTestsLoading(true);
      const data = await api('/api/admin/tests');
      setTests(data.tests || []);
    } catch (err) {
      console.error('Failed to fetch tests:', err);
    } finally {
      setTestsLoading(false);
    }
  };

  /**
   * Create new company with email and password
   */
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !companyEmail.trim() || !companyPassword) {
      setSuccessNotification({
        isOpen: true,
        title: "Validation Error",
        message: "Company name, email and password are required",
        type: "warning"
      });
      return;
    }

    if (companyPassword.length < 6) {
      setSuccessNotification({
        isOpen: true,
        title: "Validation Error",
        message: "Password must be at least 6 characters long",
        type: "warning"
      });
      return;
    }

    try {
      setFormLoading(true);
      
      // First create the company
      const newCompany = await api('/api/admin/companies', {
        method: 'POST',
        body: JSON.stringify({
          name: companyName.trim(),
          description: null // Remove description as per requirement
        })
      });

      // Then create a company admin user
      await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          name: `${companyName.trim()} Admin`,
          email: companyEmail.trim(),
          password: companyPassword,
          role: 'COMPANY_ADMIN',
          companyId: newCompany.id
        })
      });

      // Refresh companies list
      await fetchCompanies();
      
      // Reset form and close modal
      setCompanyName("");
      setCompanyEmail("");
      setCompanyPassword("");
      setShowCreateModal(false);
      
    } catch (err) {
      console.error('Failed to create company:', err);
      setSuccessNotification({
        isOpen: true,
        title: "Creation Failed",
        message: err?.error || err?.message || 'Failed to create company',
        type: "warning"
      });
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Update company
   */
  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !companyEmail.trim()) {
      setSuccessNotification({
        isOpen: true,
        title: "Validation Error",
        message: "Company name and email are required",
        type: "warning"
      });
      return;
    }

    try {
      setFormLoading(true);
      const updatedCompany = await api(`/api/admin/companies/${selectedCompany.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: companyName.trim()
        })
      });

      // Update local state
      setCompanies(prev => prev.map(company => 
        company.id === selectedCompany.id ? updatedCompany : company
      ));
      
      // Reset form and close modal
      setSelectedCompany(null);
      setCompanyName("");
      setCompanyEmail("");
      setCompanyPassword("");
      setShowEditModal(false);
      
    } catch (err) {
      console.error('Failed to update company:', err);
      setSuccessNotification({
        isOpen: true,
        title: "Update Failed",
        message: err?.error || err?.message || 'Failed to update company',
        type: "warning"
      });
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Show delete confirmation modal
   */
  const showDeleteConfirmation = (company) => {
    setCompanyToDelete(company);
    setShowDeleteModal(true);
  };

  /**
   * Handle confirmed delete
   */
  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;

    try {
      await api(`/api/admin/companies/${companyToDelete.id}`, {
        method: 'DELETE'
      });

      // Remove from local state
      setCompanies(prev => prev.filter(company => company.id !== companyToDelete.id));
      
      // Show success notification
      setSuccessNotification({
        isOpen: true,
        title: "Company Deleted",
        message: `"${companyToDelete.name}" has been deleted successfully.`
      });
      
    } catch (err) {
      console.error('Failed to delete company:', err);
      setSuccessNotification({
        isOpen: true,
        title: "Delete Failed",
        message: err?.error || err?.message || 'Failed to delete company',
        type: "warning"
      });
    } finally {
      setShowDeleteModal(false);
      setCompanyToDelete(null);
    }
  };

  /**
   * Assign test to company
   */
  const handleAssignTest = async (e) => {
    e.preventDefault();
    if (!selectedTest) {
      setSuccessNotification({
        isOpen: true,
        title: "Selection Required",
        message: "Please select a test to assign",
        type: "warning"
      });
      return;
    }

    try {
      setAssignLoading(true);
      await api(`/api/admin/tests/${selectedTest}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          companyId: selectedCompany.id
        })
      });

      // Refresh companies to get updated assignment count
      await fetchCompanies();
      
      // Reset and close modal
      setSelectedTest("");
      setShowAssignModal(false);
      setSelectedCompany(null);
      
      setSuccessNotification({
        isOpen: true,
        title: "Test Assigned Successfully",
        message: "Test has been assigned to the company successfully!"
      });
      
    } catch (err) {
      console.error('Failed to assign test:', err);
      setSuccessNotification({
        isOpen: true,
        title: "Assignment Failed",
        message: err?.error || err?.message || 'Failed to assign test',
        type: "warning"
      });
    } finally {
      setAssignLoading(false);
    }
  };

  /**
   * Open edit modal with company data
   */
  const openEditModal = (company) => {
    setSelectedCompany(company);
    setCompanyName(company.name);
    setCompanyEmail(""); // Email would need to be fetched separately
    setCompanyPassword(""); // Password cannot be retrieved for security
    setShowEditModal(true);
  };

  /**
   * Open assign test modal
   */
  const openAssignModal = (company) => {
    setSelectedCompany(company);
    setSelectedTest("");
    setShowAssignModal(true);
  };

  /**
   * Show every test assigned to this company
   */
  const openAssignedTestsModal = async (company) => {
    setAssignedTestsCompany(company);
    setAssignedTestsData([]);
    setAssignedTestsLoading(true);
    setShowAssignedTestsModal(true);

    try {
      const detail = await api(`/api/admin/companies/${company.id}`);
      const rows = Array.isArray(detail?.assignedTests) ? detail.assignedTests : [];
      setAssignedTestsData(
        rows.map((row) => ({
          testId: row.testId,
          title: row.test?.title || 'shorTest',
          status: row.test?.status || 'ACTIVE',
          isCustom: !!row.test?.isCustom,
          assignedAt: row.assignedAt,
          guestAccess: !!row.guestAccess
        }))
      );
    } catch (err) {
      console.error('Failed to fetch assigned tests:', err);
      setShowAssignedTestsModal(false);
      setAssignedTestsCompany(null);
      setSuccessNotification({
        isOpen: true,
        title: "Load Failed",
        message: err?.error || err?.message || 'Failed to load assigned tests',
        type: "warning"
      });
    } finally {
      setAssignedTestsLoading(false);
    }
  };

  /**
   * Ask for confirmation before un-assigning a test
   */
  const requestUnassign = (assignment) => {
    setUnassignTarget({
      companyId: assignedTestsCompany?.id,
      companyName: assignedTestsCompany?.name,
      testId: assignment.testId,
      testTitle: assignment.title
    });
    setShowUnassignConfirm(true);
  };

  /**
   * Un-assign the test: removes the company assignment and only the cards that
   * were never started. In-progress / completed tests and their results are kept.
   */
  const handleUnassign = async () => {
    if (!unassignTarget) return;

    try {
      setUnassignLoading(true);
      await api(`/api/admin/tests/${unassignTarget.testId}/assign/${unassignTarget.companyId}`, {
        method: 'DELETE'
      });

      setAssignedTestsData((prev) => prev.filter((row) => row.testId !== unassignTarget.testId));
      setShowUnassignConfirm(false);
      setUnassignTarget(null);
      await fetchCompanies();

      setSuccessNotification({
        isOpen: true,
        title: "Test Unassigned",
        message: `"${unassignTarget.testTitle}" is no longer assigned to ${unassignTarget.companyName}.`
      });
    } catch (err) {
      console.error('Failed to unassign test:', err);
      setSuccessNotification({
        isOpen: true,
        title: "Unassign Failed",
        message: err?.error || err?.message || 'Failed to unassign test',
        type: "warning"
      });
    } finally {
      setUnassignLoading(false);
    }
  };

  /**
   * Close modals and reset form
   */
  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowAssignModal(false);
    setSelectedCompany(null);
    setSelectedTest("");
    setCompanyName("");
    setCompanyEmail("");
    setCompanyPassword("");
  };

  // Filter companies based on search
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats from data
  const totalCompanies = companies.length;
  const totalUsers = companies.reduce((total, company) => total + (company._count?.users || 0), 0);
  const totalAssignments = companies.reduce((total, company) => total + (company._count?.assignedTests || 0), 0);

  // Subcomponents
  const StatsCard = ({ title, value, delay }) => (
    <div className={`text-left ${isLightTheme ? 'bg-white border-[#D6DEE5] shadow-sm' : 'bg-[#18181B] border-gray-700'} rounded-xl border-[1.5px] p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,12px)] ${isLightTheme ? 'hover:bg-[#ECEFF1]' : 'hover:bg-[#202025]'} transition-colors`}>
      <div className="flex items-center justify-start text-left text-[min(3vw,16px)] sm:text-[min(2vw,14px)] md:text-[min(1.2vw,12px)] lg:text-[min(0.8vw,10px)] font-extrabold tracking-[0.25em] text-emerald-500 uppercase leading-none mb-[min(1.5vw,8px)] sm:mb-[min(1vw,6px)] lg:mb-[min(0.5vw,4px)] pl-[7%]">
        {title}
      </div>
      <div className="text-[min(8vw,64px)] sm:text-[min(6vw,56px)] md:text-[min(8vh,48px)] lg:text-[min(10vh,56px)] font-bold text-emerald-500 tabular-nums leading-none tracking-tight text-center">
        {value}
      </div>
    </div>
  );

  // Theme-aware class helper
  const themeClasses = {
    container: isLightTheme ? 'bg-white' : 'bg-black',
    card: isLightTheme ? 'bg-white border-[#D6DEE5] shadow-sm' : 'bg-[#18181B] border-gray-700',
    cardHover: isLightTheme ? 'hover:bg-[#ECEFF1]' : 'hover:bg-[#202025]',
    input: isLightTheme ? 'bg-white border-gray-300 text-gray-700 placeholder-gray-500' : 'bg-black border-gray-700 text-gray-200 placeholder-gray-500',
    inputFocus: 'focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
    text: isLightTheme ? 'text-gray-700' : 'text-gray-200',
    textMuted: isLightTheme ? 'text-gray-600' : 'text-gray-400',
    textSecondary: isLightTheme ? 'text-gray-500' : 'text-gray-500',
    buttonPrimary: isLightTheme ? 'bg-white border-gray-300 text-emerald-600 hover:bg-gray-50' : 'bg-black border-gray-700 text-emerald-500 hover:bg-gray-900',
    buttonSecondary: isLightTheme ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700',
    buttonDanger: isLightTheme ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100' : 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20',
    buttonSuccess: isLightTheme ? 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/30',
    buttonViolet: isLightTheme ? 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20',
    modalBg: isLightTheme ? 'bg-white' : 'bg-[#09090B]',
    modalBorder: isLightTheme ? 'border-gray-300' : 'border-emerald-500',
    label: isLightTheme ? 'text-gray-700' : 'text-gray-300',
    selectOption: isLightTheme ? 'bg-white' : 'bg-[#18181B]',
  };

  return (
    <div className={`min-h-screen overflow-y-auto ${themeClasses.container} selection:bg-emerald-500/30 px-[min(4vw,16px)] md:px-[min(3vw,24px)] lg:px-[min(2vw,32px)] py-4 md:py-6 lg:pt-2 lg:pb-2 font-montserrat lg:min-h-0 lg:h-screen`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
      `}</style>
      {/* HEADER WITH BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isLightTheme ? 'hover:bg-gray-100' : 'hover:bg-[#18181B]'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 lg:w-[18px] lg:h-[18px] ${isLightTheme ? 'text-[#334155]' : 'text-gray-400'}`}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isLightTheme ? 'hover:bg-gray-100' : 'hover:bg-[#18181B]'}`}
            title={isLightTheme ? 'Switch to Dark' : 'Switch to Light'}
          >
            {isLightTheme ? (
              <FaMoon className={`w-5 h-5 lg:w-[18px] lg:h-[18px] text-[#334155]`} />
            ) : (
              <FaSun className={`w-5 h-5 lg:w-[18px] lg:h-[18px] text-gray-400`} />
            )}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`px-4 py-2 lg:px-[min(1vw,16px)] lg:py-[min(0.55vw,10px)] rounded-xl text-[min(3vw,18px)] sm:text-[min(2vw,16px)] md:text-[min(1.2vw,15px)] lg:text-[min(0.8vw,13px)] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${themeClasses.buttonPrimary}`}
          >
            <FaPlus className="w-4 h-4 lg:w-[min(0.8vw,14px)] lg:h-[min(0.8vw,14px)]" />
            New Company
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`${themeClasses.card} rounded-xl border-[1.5px] p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,12px)] mb-4 sm:mb-5`}>
        <div className="relative">
          <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} w-4 h-4 lg:w-[min(0.8vw,16px)] lg:h-[min(0.8vw,16px)]`} />
          <input
            type="text"
            placeholder="Search companies by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)] ${themeClasses.input} ${themeClasses.inputFocus}`}
          />
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
        <StatsCard title="COMPANIES" value={totalCompanies} delay="200" />
        <StatsCard title="USERS" value={totalUsers} delay="250" />
        <StatsCard title="ASSIGNMENTS" value={totalAssignments} delay="300" />
      </div>


      {/* Companies List */}
      <div className="space-y-4 sm:space-y-5">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className={`${themeClasses.textMuted} mt-2 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)]`}>Loading companies...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2 text-[min(4vw,18px)] sm:text-[min(3vw,16px)] md:text-[min(2vw,14px)]">Error loading companies</div>
            <p className={`${themeClasses.textMuted} text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)]`}>{error}</p>
            <button
              onClick={fetchCompanies}
              className={`mt-4 px-4 py-2 rounded-xl text-[min(3vw,18px)] sm:text-[min(2vw,16px)] md:text-[min(1.2vw,15px)] lg:text-[min(0.8vw,13px)] font-black uppercase tracking-widest transition-colors ${themeClasses.buttonPrimary}`}
            >
              Try Again
            </button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-8">
            <FaBuilding className={`w-12 h-12 ${themeClasses.textSecondary} mx-auto mb-4`} />
            <h3 className={`text-[min(4.5vw,20px)] sm:text-[min(3.5vw,18px)] md:text-[min(2.2vw,16px)] lg:text-[min(1.4vw,14px)] font-medium ${themeClasses.text} mb-2`}>No companies found</h3>
            <p className={`${themeClasses.textMuted} mb-4 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)]`}>
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first company'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className={`px-4 py-2 rounded-xl text-[min(3vw,18px)] sm:text-[min(2vw,16px)] md:text-[min(1.2vw,15px)] lg:text-[min(0.8vw,13px)] font-black uppercase tracking-widest transition-colors ${themeClasses.buttonPrimary}`}
            >
              Create Company
            </button>
          </div>
        ) : (
          <>
            {filteredCompanies.map((company) => (
              <div key={company.id} className={`p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,12px)] border rounded-xl transition-colors ${isLightTheme ? 'bg-white border-[#D6DEE5] hover:bg-[#F5F5F5]' : 'bg-[#18181B] border-gray-700 hover:bg-[#202025]'}`}>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                      <div className="w-10 h-10 lg:w-[min(2.5vw,44px)] lg:h-[min(2.5vw,44px)] bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaBuilding className="w-5 h-5 lg:w-[min(1.2vw,22px)] lg:h-[min(1.2vw,22px)] text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-[min(4.5vw,20px)] sm:text-[min(3.5vw,18px)] md:text-[min(2.2vw,16px)] lg:text-[min(1.4vw,14px)] break-words ${themeClasses.text}`}>{company.name}</h3>
                        <div className={`flex flex-wrap items-center gap-4 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)] ${themeClasses.textMuted} mt-2`}>
                          <div className="flex items-center gap-2">
                            <FaUsers className={`w-4 h-4 lg:w-[min(0.8vw,16px)] lg:h-[min(0.8vw,16px)] ${themeClasses.textSecondary}`} />
                            <span>{company._count?.users || 0} users</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaChartLine className={`w-4 h-4 lg:w-[min(0.8vw,16px)] lg:h-[min(0.8vw,16px)] ${themeClasses.textSecondary}`} />
                            <span>{company._count?.assignedTests || 0} assigned tests</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`text-[min(3vw,14px)] sm:text-[min(2.2vw,13px)] md:text-[min(1.4vw,12px)] lg:text-[min(0.8vw,11px)] ${themeClasses.textSecondary} mt-2`}>
                      Created: {new Date(company.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center flex-wrap gap-2 justify-start lg:justify-end">
                    <button
                      onClick={() => {
                        localStorage.setItem('impersonatedCompanyId', String(company.id));
                        navigate('/company');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.8vw,11px)] ${themeClasses.buttonViolet}`}
                    >
                      <FaSignInAlt className="w-3 h-3 lg:w-[min(0.7vw,14px)] lg:h-[min(0.7vw,14px)]" />
                      Login As
                    </button>
                    <button
                      onClick={() => openAssignModal(company)}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.8vw,11px)] ${themeClasses.buttonSuccess}`}
                    >
                      <FaClipboardList className="w-3 h-3 lg:w-[min(0.7vw,14px)] lg:h-[min(0.7vw,14px)]" />
                      Assign Test
                    </button>
                    <button
                      onClick={() => openAssignedTestsModal(company)}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.8vw,11px)] ${themeClasses.buttonPrimary}`}
                    >
                      <FaClipboardList className="w-3 h-3 lg:w-[min(0.7vw,14px)] lg:h-[min(0.7vw,14px)]" />
                      Assigned Tests ({company._count?.assignedTests || 0})
                    </button>
                    <button
                      onClick={() => openEditModal(company)}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.8vw,11px)] ${themeClasses.buttonSecondary}`}
                    >
                      <FaEdit className="w-3 h-3 lg:w-[min(0.7vw,14px)] lg:h-[min(0.7vw,14px)]" />
                      Edit
                    </button>
                    <button
                      onClick={() => showDeleteConfirmation(company)}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.8vw,11px)] ${themeClasses.buttonDanger}`}
                    >
                      <FaTrash className="w-3 h-3 lg:w-[min(0.7vw,14px)] lg:h-[min(0.7vw,14px)]" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${themeClasses.modalBg} rounded-xl border-[1.5px] ${themeClasses.modalBorder} p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
            <h3 className="text-[min(4.5vw,20px)] sm:text-[min(3.5vw,18px)] md:text-[min(2.2vw,16px)] lg:text-[min(1.4vw,18px)] font-extrabold tracking-[0.25em] text-emerald-500 uppercase mb-6">Create New Company</h3>
            <form onSubmit={handleCreateCompany}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${themeClasses.label} mb-2`}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={`w-full p-3 border rounded-lg ${themeClasses.inputFocus} text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] ${themeClasses.input}`}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${themeClasses.label} mb-2`}>
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className={`w-full p-3 border rounded-lg ${themeClasses.inputFocus} text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] ${themeClasses.input}`}
                    placeholder="Enter admin email"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${themeClasses.label} mb-2`}>
                    Admin Password *
                  </label>
                  <input
                    type="password"
                    value={companyPassword}
                    onChange={(e) => setCompanyPassword(e.target.value)}
                    className={`w-full p-3 border rounded-lg ${themeClasses.inputFocus} text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] ${themeClasses.input}`}
                    placeholder="Enter admin password (min. 6 characters)"
                    required
                    minLength="6"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className={`flex-1 px-4 py-2 rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest transition-colors ${themeClasses.buttonSecondary}`}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`flex-1 px-4 py-2 rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest disabled:opacity-50 transition-colors ${themeClasses.buttonSuccess}`}
                >
                  {formLoading ? 'Creating...' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${themeClasses.modalBg} rounded-xl border-[1.5px] ${themeClasses.modalBorder} p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
            <h3 className="text-[min(4.5vw,20px)] sm:text-[min(3.5vw,18px)] md:text-[min(2.2vw,16px)] lg:text-[min(1.4vw,18px)] font-extrabold tracking-[0.25em] text-emerald-500 uppercase mb-6">Edit Company</h3>
            <form onSubmit={handleUpdateCompany}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${themeClasses.label} mb-2`}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={`w-full p-3 border rounded-lg ${themeClasses.inputFocus} text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] ${themeClasses.input}`}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${themeClasses.label} mb-2`}>
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className={`w-full p-3 border rounded-lg ${themeClasses.inputFocus} text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] ${themeClasses.input}`}
                    placeholder="Enter admin email"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${themeClasses.label} mb-2`}>
                    New Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={companyPassword}
                    onChange={(e) => setCompanyPassword(e.target.value)}
                    className={`w-full p-3 border rounded-lg ${themeClasses.inputFocus} text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] ${themeClasses.input}`}
                    placeholder="Leave blank to keep current password"
                    minLength="6"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className={`flex-1 px-4 py-2 rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest transition-colors ${themeClasses.buttonSecondary}`}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`flex-1 px-4 py-2 rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest disabled:opacity-50 transition-colors ${themeClasses.buttonSecondary}`}
                >
                  {formLoading ? 'Updating...' : 'Update Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Test Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${themeClasses.modalBg} rounded-xl border-[1.5px] ${themeClasses.modalBorder} p-6 w-full max-w-md`}>
            <h3 className="text-[min(4.5vw,20px)] sm:text-[min(3.5vw,18px)] md:text-[min(2.2vw,16px)] lg:text-[min(1.4vw,18px)] font-extrabold tracking-[0.25em] text-emerald-500 uppercase mb-6">
              Assign Test to {selectedCompany?.name}
            </h3>
            <form onSubmit={handleAssignTest}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${themeClasses.label} mb-2`}>
                    Select Test *
                  </label>
                  <select
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className={`w-full p-3 border rounded-lg ${themeClasses.inputFocus} text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] ${themeClasses.input}`}
                    required
                    disabled={testsLoading}
                  >
                    <option value="" className={themeClasses.selectOption}>Choose a test...</option>
                    {tests.map((test) => (
                      <option key={test.id} value={test.id} className={themeClasses.selectOption}>
                        {test.title} {test.status && `(${test.status})`}
                      </option>
                    ))}
                  </select>
                  {testsLoading && (
                    <p className={`text-[min(3vw,12px)] sm:text-[min(2.2vw,11px)] md:text-[min(1.4vw,11px)] lg:text-[min(0.8vw,11px)] ${themeClasses.textMuted} mt-2`}>Loading tests...</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className={`flex-1 px-4 py-2 rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest transition-colors ${themeClasses.buttonSecondary}`}
                  disabled={assignLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading || !selectedTest}
                  className={`flex-1 px-4 py-2 rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest disabled:opacity-50 transition-colors ${themeClasses.buttonSuccess}`}
                >
                  {assignLoading ? 'Assigning...' : 'Assign Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assigned Tests Modal */}
      {showAssignedTestsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${themeClasses.modalBg} rounded-xl border-[1.5px] ${themeClasses.modalBorder} p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <h3 className="text-[min(4.5vw,20px)] sm:text-[min(3.5vw,18px)] md:text-[min(2.2vw,16px)] lg:text-[min(1.4vw,18px)] font-extrabold tracking-[0.25em] text-emerald-500 uppercase mb-6">
              Assigned Tests — {assignedTestsCompany?.name}
            </h3>

            {assignedTestsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className={`${themeClasses.textMuted} mt-2 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)]`}>
                  Loading assigned tests...
                </p>
              </div>
            ) : assignedTestsData.length === 0 ? (
              <div className="text-center py-8">
                <FaClipboardList className={`w-12 h-12 ${themeClasses.textSecondary} mx-auto mb-4`} />
                <p className={`${themeClasses.textMuted} text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)]`}>
                  No tests assigned to this company yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedTestsData.map((assignment) => (
                  <div
                    key={assignment.testId}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-xl ${isLightTheme ? 'border-[#D6DEE5]' : 'border-gray-700'}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] truncate ${themeClasses.text}`}>
                        {assignment.title}
                      </p>
                      <div className={`flex flex-wrap items-center gap-3 mt-2 text-[min(3vw,14px)] sm:text-[min(2.2vw,13px)] ${themeClasses.textMuted}`}>
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium border ${
                            assignment.status === "ACTIVE"
                              ? isLightTheme ? "bg-emerald-100 text-emerald-600 border-emerald-300" : "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                              : assignment.status === "DRAFT"
                              ? isLightTheme ? "bg-yellow-100 text-yellow-600 border-yellow-300" : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                              : isLightTheme ? "bg-gray-100 text-gray-600 border-gray-300" : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }`}
                        >
                          {assignment.status}
                        </span>
                        {assignment.isCustom && (
                          <span className={`px-2 py-0.5 rounded-full font-medium border ${isLightTheme ? 'bg-emerald-100 text-emerald-600 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                            Custom
                          </span>
                        )}
                        <span>Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                        <span>Guest access: {assignment.guestAccess ? 'On' : 'Off'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => requestUnassign(assignment)}
                      disabled={unassignLoading}
                      className={`px-3 py-2 rounded-xl text-[min(3vw,14px)] sm:text-[min(2.2vw,13px)] font-black uppercase tracking-wider transition-colors disabled:opacity-50 flex-shrink-0 self-start ${themeClasses.buttonDanger}`}
                    >
                      Unassign
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAssignedTestsModal(false);
                  setAssignedTestsCompany(null);
                }}
                className={`flex-1 px-4 py-2 rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest transition-colors ${themeClasses.buttonSecondary}`}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const company = assignedTestsCompany;
                  setShowAssignedTestsModal(false);
                  setAssignedTestsCompany(null);
                  openAssignModal(company);
                }}
                className={`flex-1 px-4 py-2 rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest transition-colors ${themeClasses.buttonSuccess}`}
              >
                Assign Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCompanyToDelete(null);
        }}
        onConfirm={handleDeleteCompany}
        title="Delete Company"
        message="Are you sure you want to delete this company? This action cannot be undone."
        itemName={companyToDelete?.name}
        confirmText="Delete Company"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Un-assign Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showUnassignConfirm}
        onClose={() => {
          setShowUnassignConfirm(false);
          setUnassignTarget(null);
        }}
        onConfirm={handleUnassign}
        title="Unassign Test"
        message="The test will no longer be available to this company."
        itemName={unassignTarget?.testTitle}
        confirmText="Unassign"
        cancelText="Cancel"
        variant="warning"
        isLoading={unassignLoading}
        warningHeading="Please note:"
        warningItems={[
          'Pending (never started) assignments will be removed',
          'In-progress and completed tests are kept, with their results',
          'You can assign the test again at any time'
        ]}
        loadingText="Unassigning..."
        confirmIcon={FaClipboardList}
      />

      {/* Success Notification Modal */}
      <SuccessNotificationModal
        isOpen={successNotification.isOpen}
        onClose={() => setSuccessNotification({ isOpen: false, title: "", message: "" })}
        title={successNotification.title}
        message={successNotification.message}
        type={successNotification.type || "success"}
        duration={3000}
      />
    </div>
  );
}