import { useState, useEffect } from "react";
import { api } from "../utils/api";

/**
 * useAdminData - complete hook with all admin backend endpoints integrated
 * Follows the same pattern as useCompanyData
 */
export default function useAdminData() {
  const [dashboardStats, setDashboardStats] = useState({});
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [companyPerformance, setCompanyPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all admin data on mount
  useEffect(() => {
    fetchAdminData();
  }, []);

  /**
   * Fetch all admin data from backend APIs
   */
  async function fetchAdminData() {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all admin data in parallel
      const [statsData, companiesData, usersData, testsData, activityData, performanceData] = await Promise.all([
        fetchDashboardStats(),
        fetchAllCompanies(),
        fetchAllUsers(),
        fetchAllTests(),
        fetchRecentActivity(),
        fetchCompanyPerformance()
      ]);

      setDashboardStats(formatDashboardStats(statsData));
      setCompanies(companiesData || []);
      setUsers(usersData || []);
      setTests(testsData || []);
      setRecentActivity(formatRecentActivity(activityData));
      setCompanyPerformance(performanceData || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setError(err?.error || err?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  /**
   * GET /api/admin/dashboard/stats - Fetch dashboard statistics
   */
  async function fetchDashboardStats() {
    try {
      const statsData = await api('/api/admin/dashboard/stats');
      return statsData || {};
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      throw err;
    }
  }

  /**
   * GET /api/admin/companies - Fetch all companies
   */
  async function fetchAllCompanies(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key]) queryParams.append(key, params[key]);
      });
      
      const companiesData = await api(`/api/admin/companies?${queryParams}`);
      return companiesData?.companies || [];
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      throw err;
    }
  }

  /**
   * GET /api/admin/users - Fetch all users
   */
  async function fetchAllUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key]) queryParams.append(key, params[key]);
      });
      
      const usersData = await api(`/api/admin/users?${queryParams}`);
      return usersData?.users || [];
    } catch (err) {
      console.error('Failed to fetch users:', err);
      throw err;
    }
  }

  /**
   * GET /api/admin/tests - Fetch all tests
   */
  async function fetchAllTests(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key]) queryParams.append(key, params[key]);
      });
      
      const testsData = await api(`/api/admin/tests?${queryParams}`);
      return testsData?.tests || [];
    } catch (err) {
      console.error('Failed to fetch tests:', err);
      throw err;
    }
  }

  /**
   * GET /api/admin/dashboard/recent-activity - Fetch recent activity
   */
  async function fetchRecentActivity(limit = 10) {
    try {
      const activityData = await api(`/api/admin/dashboard/recent-activity?limit=${limit}`);
      return activityData || [];
    } catch (err) {
      console.error('Failed to fetch recent activity:', err);
      throw err;
    }
  }

  /**
   * GET /api/admin/dashboard/company-performance - Fetch company performance
   */
  async function fetchCompanyPerformance() {
    try {
      const performanceData = await api('/api/admin/dashboard/company-performance');
      return performanceData || [];
    } catch (err) {
      console.error('Failed to fetch company performance:', err);
      throw err;
    }
  }

  /**
   * GET /api/admin/companies/:id - Fetch company by ID
   */
  async function fetchCompanyById(companyId) {
    try {
      const companyData = await api(`/api/admin/companies/${companyId}`);
      return companyData;
    } catch (err) {
      console.error('Failed to fetch company:', err);
      throw err;
    }
  }

  /**
   * GET /api/admin/companies/:companyId/users - Fetch company users
   */
  async function fetchCompanyUsers(companyId) {
    try {
      const usersData = await api(`/api/admin/companies/${companyId}/users`);
      return usersData || [];
    } catch (err) {
      console.error('Failed to fetch company users:', err);
      throw err;
    }
  }

  /**
   * GET /api/admin/companies/:companyId/reports - Fetch company reports
   */
  async function fetchCompanyReports(companyId) {
    try {
      const reportsData = await api(`/api/admin/companies/${companyId}/reports`);
      return reportsData || [];
    } catch (err) {
      console.error('Failed to fetch company reports:', err);
      throw err;
    }
  }

  /**
   * GET /api/admin/tests/:id - Fetch test by ID
   */
  async function fetchTestById(testId) {
    try {
      const testData = await api(`/api/admin/tests/${testId}`);
      return testData;
    } catch (err) {
      console.error('Failed to fetch test:', err);
      throw err;
    }
  }

  /**
   * GET /api/admin/users/:id - Fetch user by ID
   */
  async function fetchUserById(userId) {
    try {
      const userData = await api(`/api/admin/users/${userId}`);
      return userData;
    } catch (err) {
      console.error('Failed to fetch user:', err);
      throw err;
    }
  }

  // --- CRUD OPERATIONS ---

  /**
   * POST /api/admin/companies - Create a new company
   */
  async function createCompany(companyData) {
    try {
      const createdCompany = await api('/api/admin/companies', {
        method: 'POST',
        body: JSON.stringify(companyData)
      });

      // Update local state optimistically
      setCompanies(prev => [createdCompany, ...prev]);
      
      return createdCompany;
    } catch (err) {
      console.error('Failed to create company:', err);
      throw err;
    }
  }

  /**
   * PUT /api/admin/companies/:id - Update company
   */
  async function updateCompany(companyId, updates) {
    try {
      const updatedCompany = await api(`/api/admin/companies/${companyId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      // Update local state
      setCompanies(prev => prev.map(company => 
        company.id === companyId ? { ...company, ...updatedCompany } : company
      ));

      return updatedCompany;
    } catch (err) {
      console.error('Failed to update company:', err);
      throw err;
    }
  }

  /**
   * DELETE /api/admin/companies/:id - Delete company
   */
  async function deleteCompany(companyId) {
    try {
      await api(`/api/admin/companies/${companyId}`, {
        method: 'DELETE'
      });

      // Update local state optimistically
      setCompanies(prev => prev.filter(company => company.id !== companyId));
    } catch (err) {
      console.error('Failed to delete company:', err);
      throw err;
    }
  }

  /**
   * POST /api/admin/tests - Create a new test
   */
  async function createTest(testData) {
    try {
      const createdTest = await api('/api/admin/tests', {
        method: 'POST',
        body: JSON.stringify(testData)
      });

      // Update local state optimistically
      setTests(prev => [createdTest, ...prev]);
      
      return createdTest;
    } catch (err) {
      console.error('Failed to create test:', err);
      throw err;
    }
  }

  /**
   * PUT /api/admin/tests/:id - Update test
   */
  async function updateTest(testId, updates) {
    try {
      const updatedTest = await api(`/api/admin/tests/${testId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      // Update local state
      setTests(prev => prev.map(test => 
        test.id === testId ? { ...test, ...updatedTest } : test
      ));

      return updatedTest;
    } catch (err) {
      console.error('Failed to update test:', err);
      throw err;
    }
  }

  /**
   * DELETE /api/admin/tests/:id - Delete test
   */
  async function deleteTest(testId) {
    try {
      await api(`/api/admin/tests/${testId}`, {
        method: 'DELETE'
      });

      // Update local state optimistically
      setTests(prev => prev.filter(test => test.id !== testId));
    } catch (err) {
      console.error('Failed to delete test:', err);
      throw err;
    }
  }

  /**
   * POST /api/admin/users - Create a new user
   */
  async function createUser(userData) {
    try {
      const createdUser = await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      // Update local state optimistically
      setUsers(prev => [createdUser, ...prev]);
      
      return createdUser;
    } catch (err) {
      console.error('Failed to create user:', err);
      throw err;
    }
  }

  /**
   * PUT /api/admin/users/:id - Update user
   */
  async function updateUser(userId, updates) {
    try {
      const updatedUser = await api(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updatedUser } : user
      ));

      return updatedUser;
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  }

  /**
   * DELETE /api/admin/users/:id - Delete user
   */
  async function deleteUser(userId) {
    try {
      await api(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      // Update local state optimistically
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Failed to delete user:', err);
      throw err;
    }
  }

  /**
   * POST /api/admin/tests/:testId/assign - Assign test to company
   */
  async function assignTestToCompany(testId, companyId) {
    try {
      const result = await api(`/api/admin/tests/${testId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ companyId })
      });

      return result;
    } catch (err) {
      console.error('Failed to assign test to company:', err);
      throw err;
    }
  }

  /**
   * POST /api/admin/tests/bulk-assign - Bulk assign tests to companies
   */
  async function bulkAssignTests({ testIds, companyIds }) {
    try {
      const result = await api('/api/admin/tests/bulk-assign', {
        method: 'POST',
        body: JSON.stringify({ testIds, companyIds })
      });

      return result;
    } catch (err) {
      console.error('Failed to bulk assign tests:', err);
      throw err;
    }
  }

  /**
   * POST /api/admin/users/bulk - Bulk create users
   */
  async function bulkCreateUsers(usersData) {
    try {
      const result = await api('/api/admin/users/bulk', {
        method: 'POST',
        body: JSON.stringify({ users: usersData })
      });

      // Refresh users list
      await fetchAllUsers();
      
      return result;
    } catch (err) {
      console.error('Failed to bulk create users:', err);
      throw err;
    }
  }

  /**
   * Format dashboard stats for display
   */
  function formatDashboardStats(stats) {
    if (!stats) return {};
    
    return {
      totalCompanies: stats.totals?.totalCompanies || 0,
      totalUsers: stats.totals?.totalUsers || 0,
      totalTests: stats.totals?.totalTests || 0,
      totalReports: stats.totals?.totalReports || 0,
      recentRegistrations: stats.recentRegistrations || [],
      companyPerformance: stats.companyPerformance || []
    };
  }

  /**
   * Format recent activity for display
   */
  function formatRecentActivity(activity) {
    if (!activity) return [];
    
    return activity.slice(0, 10).map(item => ({
      id: item.id,
      title: `Test Completed - ${item.test?.title || 'Unknown'}`,
      user: item.user?.name || 'Unknown User',
      company: item.user?.company?.name || 'Unknown Company',
      date: new Date(item.completedAt).toLocaleDateString(),
      kpi: item.report?.kpis?.final || 0,
      status: 'completed'
    }));
  }

  return {
    // Data
    dashboardStats,
    companies,
    users,
    tests,
    recentActivity,
    companyPerformance,
    loading,
    error,
    
    // Refetch function
    refetch: fetchAdminData,
    
    // Company management functions
    createCompany,
    updateCompany,
    deleteCompany,
    fetchCompanyById,
    fetchCompanyUsers,
    fetchCompanyReports,
    
    // Test management functions
    createTest,
    updateTest,
    deleteTest,
    fetchTestById,
    assignTestToCompany,
    bulkAssignTests,
    
    // User management functions
    createUser,
    updateUser,
    deleteUser,
    fetchUserById,
    bulkCreateUsers,
    
    // Individual fetch functions for specific needs
    fetchAllCompanies,
    fetchAllUsers,
    fetchAllTests,
    fetchRecentActivity,
    fetchCompanyPerformance
  };
}