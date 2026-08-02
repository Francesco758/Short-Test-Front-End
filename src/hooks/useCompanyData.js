// src/hooks/useCompanyData.js (Fixed version)
import { useState, useEffect } from "react";
import { api } from "../utils/api";

export default function useCompanyData(companyId) {
  const [kpis, setKpis] = useState({});
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [recentRuns, setRecentRuns] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [problemSolutionData, setProblemSolutionData] = useState({ 
    problems: [], 
    solutions: [], 
    problemCategories: [],
    solutionCategories: [],
    matrix: [], 
    totalProblemCount: 0,
    totalSolutionCount: 0,
    totalReports: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [ckpiMetrics, setCkpiMetrics] = useState({
    averages: { simplification: 0, originality: 0, feasibility: 0, criticalThinking: 0, proactivity: 0 },
    componentTrends: { simplification: 0, originality: 0, feasibility: 0, criticalThinking: 0, proactivity: 0 },
    totalReports: 0,
    trend: 0,
    lastUpdated: new Date().toLocaleString()
  });

  // Fetch all company data on mount
  useEffect(() => {
    if (companyId && companyId !== "company_demo") {
      fetchCompanyData();
    }
  }, [companyId]);

  async function fetchCompanyData() {
    try {
      setLoading(true);
      setError(null);
      
      const [usersData, testsData, statsData, reportsData, deadlinesData, problemSolutionData, metricsData] = await Promise.all([
        fetchCompanyUsers(),
        fetchAssignedTests(),
        fetchCompanyStats(),
        fetchUserReports(),
        fetchDeadlines(),
        fetchProblemSolutionOverview(),
        fetchCKPIMetrics()
      ]);

      setUsers(usersData || []);
      setTests(testsData || []);
      
      // Pass metricsData to formatKpis to get trend/delta
      setKpis(formatKpis(statsData, metricsData));
      setCompanyName(statsData?.companyName || '');
      
      setRecentRuns(formatRecentRuns(reportsData));
      setDeadlines(formatDeadlines(deadlinesData));
      setProblemSolutionData(problemSolutionData);
      if (metricsData) {
        setCkpiMetrics({
          averages: metricsData.averages,
          componentTrends: metricsData.componentTrends,
          totalReports: metricsData.totalReports,
          trend: metricsData.trend,
          lastUpdated: metricsData.lastUpdated,
          globalCkpi: metricsData.globalCkpi,
          globalSummary: metricsData.globalSummary,
          globalStrengths: metricsData.globalStrengths,
          globalImprovements: metricsData.globalImprovements
        });
      }
    } catch (err) {
      console.error('Failed to fetch company data:', err);
      setError(err?.error || err?.message || 'Failed to load company data');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCompanyUsers() {
    try {
      const usersData = await api('/api/company/users');
      return usersData || [];
    } catch (err) {
      console.error('Failed to fetch users:', err);
      throw err;
    }
  }

  async function fetchAssignedTests() {
    try {
      const testsData = await api('/api/company/tests/assigned');
      return testsData?.map(test => ({
        id: test.test?.id,
        title: test.test?.title,
        description: test.test?.description,
        isCustom: test.test?.isCustom === true,
        prompts: test.test?.prompts,
        assignmentCount: test.test?._count?.userAssignments
      })) || [];
    } catch (err) {
      console.error('Failed to fetch tests:', err);
      throw err;
    }
  }

  async function fetchCompanyStats() {
    try {
      const statsData = await api('/api/company/reports/stats');
      return statsData || {};
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      throw err;
    }
  }

  async function fetchUserReports() {
    try {
      const reportsData = await api('/api/company/reports/user-reports');
      return reportsData || [];
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      throw err;
    }
  }

  async function fetchDeadlines() {
    try {
      const rows = await api('/api/company/reports/deadlines');
      return rows || [];
    } catch (err) {
      console.error('Failed to fetch deadlines:', err);
      throw err;
    }
  }

  async function fetchProblemSolutionOverview() {
    try {
      // Use company-specific endpoint for company managers
      const overview = await api(`/api/company/reports/problem-solution-overview`);
      return {
        problems: overview.problems?.slice(0, 3) || [], // Top 3 problems for card
        solutions: overview.solutions?.slice(0, 3) || [], // Top 3 solutions for card
        problemCategories: overview.problemCategories || [], // All problem categories with reports
        solutionCategories: overview.solutionCategories || [], // All solution categories with reports
        matrix: overview.matrix || [], // Full matrix
        totalProblemCount: overview.totalProblemCount || 0,
        totalSolutionCount: overview.totalSolutionCount || 0,
        totalReports: overview.totalReports || 0
      };
    } catch (err) {
      console.warn('Failed to fetch problem-solution overview:', err);
      return { 
        problems: [], 
        solutions: [], 
        problemCategories: [],
        solutionCategories: [],
        matrix: [], 
        totalProblemCount: 0,
        totalSolutionCount: 0,
        totalReports: 0 
      };
    }
  }

  async function fetchCKPIMetrics() {
    try {
      const metrics = await api('/api/company/reports/ckpi-metrics');
      return metrics;
    } catch (err) {
      console.error('Failed to fetch CKPI metrics:', err);
      return null;
    }
  }

  async function fetchUserTestReport(userTestId) {
    try {
      const report = await api(`/api/company/reports/user-test/${userTestId}`);
      return report;
    } catch (err) {
      console.error('Failed to fetch detailed report:', err);
      throw err;
    }
  }

  async function addUser(userData) {
    try {
      const createdUser = await api('/api/company/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      setUsers(prev => [createdUser, ...prev]);
      return createdUser;
    } catch (err) {
      console.error('Failed to create user:', err);
      throw err;
    }
  }

  async function updateUser(userId, updates) {
    try {
      const updatedUser = await api(`/api/company/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updatedUser } : user
      ));

      return updatedUser;
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  }

  async function deleteUser(userId) {
    try {
      await api(`/api/company/users/${userId}`, {
        method: 'DELETE'
      });

      setUsers(prev => prev.filter(user => user.id !== userId));

      const statsData = await fetchCompanyStats();
      if (statsData) {
        setKpis(formatKpis(statsData, ckpiMetrics));
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
      throw err;
    }
  }

  async function assignTestToUsers(testId, userIds, options = {}) {
    try {
      const { notify = true, brief = null, deadline = null, scheduleAt = null } = options;
      
      const result = await api(`/api/company/tests/${testId}/assign-users`, {
        method: 'POST',
        body: JSON.stringify({ 
          userIds, 
          notify,
          brief,
          deadline,
          scheduleAt
        })
      });

      await fetchCompanyUsers();
      return result;
    } catch (err) {
      console.error('Failed to assign test:', err);
      throw err;
    }
  }

  async function bulkAssignTests({ testIds, userIds, notify = true, deadline = null, scheduleAt = null }) {
    try {
      const result = await api('/api/company/tests/bulk-assign', {
        method: 'POST',
        body: JSON.stringify({ 
          testIds, 
          userIds,
          notify,
          deadline,
          scheduleAt
        })
      });

      await fetchCompanyUsers();
      return result;
    } catch (err) {
      console.error('Failed to bulk assign tests:', err);
      throw err;
    }
  }

  async function bulkCreateUsers(usersData) {
    try {
      const result = await api('/api/company/users/bulk', {
        method: 'POST',
        body: JSON.stringify({ users: usersData })
      });

      await fetchCompanyUsers();
      return result;
    } catch (err) {
      console.error('Failed to bulk create users:', err);
      throw err;
    }
  }

  function formatKpis(stats, metrics) {
    if (!stats) return {};
    
    return {
      changeKpiPercent: stats.avgKPI || 0,
      kpiDelta: metrics?.trend || 0,
      totalTests: stats.testCount || 0,
      testsDelta: 0,
      activeUsers: stats.userCount || 0,
      usersDelta: 0,
      avgCompletion: stats.completionRate || 0,
      completionDelta: 0,
      lastUpdated: new Date().toLocaleString(),
      completedTests: stats.completedTests || 0,
      avgTime: stats.avgTime || 0,
      topShorters: stats.topShorters || []
    };
  }

  function formatRecentRuns(reports) {
    if (!reports) return [];
    
    return reports.slice(0, 5).map(report => ({
      id: report.id,
      title: `Test - ${report.userTest?.test?.title || 'Unknown'}`,
      testType: 'Assessment',
      date: new Date(report.createdAt).toLocaleDateString(),
      avgKpi: report.kpis?.final || 0,
      status: 'completed',
      userTestId: report.userTestId
    }));
  }

  function formatDeadlines(rows) {
    return (rows || []).map(r => ({
      userId: r.user?.id,
      userName: r.user?.name || r.user?.email,
      testId: r.test?.id,
      testTitle: r.test?.title,
      deadline: r.deadline,
      assignedAt: r.assignedAt,
      status: r.status
    }));
  }

  return {
    companyName,
    users, 
    tests, 
    kpis,
    ckpiMetrics,
    recentRuns, 
    deadlines,
    problemSolutionData,
    loading,
    error,
    refetch: fetchCompanyData,
    addUser,
    updateUser,
    deleteUser,
    bulkCreateUsers,
    assignTestToUsers,
    bulkAssignTests,
    fetchUserTestReport
  };
}
