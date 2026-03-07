import { useState, useEffect } from "react";
import { 
  getUserProfile, 
  updateUserProfile, 
  changeUserPassword,
  getAssignedTests,
  startUserTest,
  submitTestAnswer,
  finishUserTest 
} from "../utils/api";

/**
 * useUserData - complete hook for user-specific functionality
 */
export default function useUserData() {
  const [profile, setProfile] = useState(null);
  const [assignedTests, setAssignedTests] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  /**
   * Fetch all user data
   */
  async function fetchUserData() {
    try {
      setLoading(true);
      setError(null);
      
      const [profileData, testsData] = await Promise.all([
        getUserProfile(),
        getAssignedTests()
      ]);

      setProfile(profileData);
      setAssignedTests(testsData || []);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError(err?.error || err?.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  }

  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Update user profile
   */
  async function updateProfile(profileData) {
    try {
      setLoading(true);
      const updatedProfile = await updateUserProfile(profileData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Change user password
   */
  async function changePassword(passwordData) {
    try {
      setLoading(true);
      const result = await changeUserPassword(passwordData);
      return result;
    } catch (err) {
      console.error('Failed to change password:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // ==================== TEST MANAGEMENT ====================

  /**
   * Start a test
   */
  async function startTest(userTestId) {
    try {
      setLoading(true);
      const result = await startUserTest(userTestId);
      setCurrentTest(result);
      return result;
    } catch (err) {
      console.error('Failed to start test:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Submit test answer
   */
  async function submitAnswer(userTestId, answerData) {
    try {
      const result = await submitTestAnswer(userTestId, answerData);
      
      // Update current test state if this is for the active test
      if (currentTest && currentTest.attempt.id === userTestId) {
        setCurrentTest(prev => ({
          ...prev,
          ...result
        }));
      }
      
      return result;
    } catch (err) {
      console.error('Failed to submit answer:', err);
      throw err;
    }
  }

  /**
   * Finish test and get results
   */
  async function finishTest(userTestId) {
    try {
      setLoading(true);
      const result = await finishUserTest(userTestId);
      setTestResults(result);
      
      // Remove from assigned tests and clear current test
      setAssignedTests(prev => prev.filter(test => test.id !== userTestId));
      setCurrentTest(null);
      
      return result;
    } catch (err) {
      console.error('Failed to finish test:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Refresh assigned tests
   */
  async function refreshTests() {
    try {
      const testsData = await getAssignedTests();
      setAssignedTests(testsData || []);
      return testsData;
    } catch (err) {
      console.error('Failed to refresh tests:', err);
      throw err;
    }
  }

  /**
   * Get test by ID from assigned tests
   */
  function getTestById(userTestId) {
    return assignedTests.find(test => test.id === userTestId);
  }

  /**
   * Get tests by status
   */
  function getTestsByStatus(status) {
    return assignedTests.filter(test => test.status === status);
  }

  return {
    // Data
    profile,
    assignedTests,
    currentTest,
    testResults,
    loading,
    error,
    
    // Refetch
    refetch: fetchUserData,
    
    // Profile management
    updateProfile,
    changePassword,
    
    // Test management
    startTest,
    submitAnswer,
    finishTest,
    refreshTests,
    getTestById,
    getTestsByStatus,
    
    // Status helpers
    hasAssignedTests: assignedTests.length > 0,
    hasCompletedTests: testResults !== null,
    testsInProgress: assignedTests.filter(test => test.status === 'IN_PROGRESS')
  };
}