import React, { useState, useEffect } from "react";
import AOS from 'aos';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaChartLine, FaBuilding, FaSearch, FaClipboardList } from "react-icons/fa";
import { api } from "../../utils/api";
import DeleteConfirmModal from "../../models/DeleteConfirmModal";
import SuccessNotificationModal from "../../models/SuccessNotificationModal";

export default function AdminCompaniesPage() {
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

  // Fetch companies and tests on component mount
  useEffect(() => {
    fetchCompanies();
    fetchTests();
    AOS.refresh();
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* HEADER WITH BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6" data-aos="fade-down" data-aos-delay="100">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Companies Management</h1>
          <p className="text-gray-600 text-sm lg:text-base mt-1">Create and manage companies</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm:text-base shadow-sm"
          >
            <FaPlus className="w-4 h-4" />
            New Company
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search companies by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg" data-aos="fade-up" data-aos-delay="200">
          <div className="text-2xl font-bold text-blue-600">{totalCompanies}</div>
          <div className="text-sm text-blue-700">Total Companies</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg" data-aos="fade-up" data-aos-delay="250">
          <div className="text-2xl font-bold text-green-600">{totalUsers}</div>
          <div className="text-sm text-green-700">Total Users</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg" data-aos="fade-up" data-aos-delay="300">
          <div className="text-2xl font-bold text-purple-600">{totalAssignments}</div>
          <div className="text-sm text-purple-700">Total Assignments</div>
        </div>
      </div>

      {/* Companies List */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200" data-aos="fade-up" data-aos-delay="400">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading companies...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Error loading companies</div>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={fetchCompanies}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-8">
            <FaBuilding className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first company'}
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Company
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaBuilding className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg break-words">{company.name}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-2">
                            <FaUsers className="w-4 h-4 text-gray-400" />
                            <span>{company._count?.users || 0} users</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaChartLine className="w-4 h-4 text-gray-400" />
                            <span>{company._count?.assignedTests || 0} assigned tests</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {new Date(company.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
                    <button
                      onClick={() => openAssignModal(company)}
                      className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-md hover:bg-green-100 transition-colors flex items-center gap-2 text-sm"
                    >
                      <FaClipboardList className="w-3 h-3" />
                      Assign Test
                    </button>
                    <button
                      onClick={() => openEditModal(company)}
                      className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm"
                    >
                      <FaEdit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => showDeleteConfirmation(company)}
                      className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-md hover:bg-red-100 transition-colors flex items-center gap-2 text-sm"
                    >
                      <FaTrash className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Company</h3>
            <form onSubmit={handleCreateCompany}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter admin email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Password *
                  </label>
                  <input
                    type="password"
                    value={companyPassword}
                    onChange={(e) => setCompanyPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Company</h3>
            <form onSubmit={handleUpdateCompany}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter admin email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={companyPassword}
                    onChange={(e) => setCompanyPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Leave blank to keep current password"
                    minLength="6"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Test to {selectedCompany?.name}
            </h3>
            <form onSubmit={handleAssignTest}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Test *
                  </label>
                  <select
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                    disabled={testsLoading}
                  >
                    <option value="">Choose a test...</option>
                    {tests.map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.title} {test.status && `(${test.status})`}
                      </option>
                    ))}
                  </select>
                  {testsLoading && (
                    <p className="text-xs text-gray-500 mt-1">Loading tests...</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  disabled={assignLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading || !selectedTest}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                >
                  {assignLoading ? 'Assigning...' : 'Assign Test'}
                </button>
              </div>
            </form>
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