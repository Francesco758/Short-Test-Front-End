import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaClipboardList,
  FaBuilding,
  FaUsers,
  FaRobot,
  FaSearch,
  FaFilter,
  FaEye,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import { useSidebar } from '../../components/layout/AdminLayout';
import { api } from "../../utils/api";
import SuccessNotificationModal from "../../models/SuccessNotificationModal";
import DeleteConfirmModal from "../../models/DeleteConfirmModal";

export default function AdminTestsPageSimplified() {
  const { toggleSidebar, isLightTheme, toggleTheme } = useSidebar();

  // Theme-aware class helper
  const themeClasses = {
    container: isLightTheme ? 'bg-white' : 'bg-black',
    card: isLightTheme ? 'bg-white border-gray-300 shadow-sm' : 'bg-[#18181B] border-gray-700',
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
    buttonPurple: isLightTheme ? 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20',
    buttonBlue: isLightTheme ? 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20',
    modalBg: isLightTheme ? 'bg-white' : 'bg-[#09090B]',
    modalBorder: isLightTheme ? 'border-gray-300' : 'border-gray-700',
    label: isLightTheme ? 'text-gray-700' : 'text-gray-300',
    selectOption: isLightTheme ? 'bg-white' : 'bg-[#18181B]',
    headerBorder: isLightTheme ? 'border-gray-200' : 'border-gray-700',
  };
  const [tests, setTests] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [customTest, setCustomTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  
  // Success notification state
  const [successNotification, setSuccessNotification] = useState({
    isOpen: false,
    title: "",
    message: ""
  });
  
  // Delete confirmation state
  const [showDeleteCustomTestModal, setShowDeleteCustomTestModal] = useState(false);
  const [showDeleteTestModal, setShowDeleteTestModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  
  // Form states
  const [testTitle, setTestTitle] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [testStatus, setTestStatus] = useState("DRAFT");
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchTests();
    fetchCompanies();
    fetchCustomTest();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api("/api/admin/tests");
      setTests(data.tests || []);
    } catch (err) {
      console.error("Failed to fetch tests:", err);
      setError(err?.error || err?.message || "Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await api("/api/admin/companies");
      setCompanies(data.companies || []);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  const handleCreateSubmit = async (e) => {
    if (creatingCustom) {
      await createCustomTest();
    } else {
      await handleCreateTest(e);
    }
    setCreatingCustom(false);
  };

  const fetchCustomTest = async () => {
    try {
      const data = await api("/api/admin/tests/custom");
      setCustomTest(data || null);
    } catch (err) {
      console.error("Failed to fetch custom test:", err);
    }
  };

  const createCustomTest = async () => {
    if (!testTitle.trim() || !systemPrompt.trim()) {
      setSuccessNotification({
        isOpen: true,
        title: "Validation Error",
        message: "Custom test title and system prompt are required",
        type: "warning"
      });
      return;
    }
    if (systemPrompt.trim().length < 50) {
      setSuccessNotification({
        isOpen: true,
        title: "Validation Error",
        message: "System prompt must be at least 50 characters long",
        type: "warning"
      });
      return;
    }
    try {
      setFormLoading(true);
      const created = await api("/api/admin/tests/custom", {
        method: "POST",
        body: JSON.stringify({
          title: testTitle.trim(),
          description: testDescription.trim() || null,
          systemPrompt: systemPrompt.trim(),
        }),
      });
      setCustomTest(created);
      setShowCreateModal(false);
      resetForm();
      setSuccessNotification({
        isOpen: true,
        title: "Custom Test Created",
        message: "Custom test has been created successfully!"
      });
      await fetchTests();
    } catch (err) {
      setSuccessNotification({
        isOpen: true,
        title: "Creation Failed",
        message: err?.error || err?.message || "Failed to create custom test",
        type: "warning"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const updateCustomTest = async () => {
    if (!testTitle.trim() || !systemPrompt.trim()) {
      setSuccessNotification({
        isOpen: true,
        title: "Validation Error",
        message: "Custom test title and system prompt are required",
        type: "warning"
      });
      return;
    }
    try {
      setFormLoading(true);
      const updated = await api("/api/admin/tests/custom", {
        method: "PUT",
        body: JSON.stringify({
          title: testTitle.trim(),
          description: testDescription.trim() || null,
          systemPrompt: systemPrompt.trim(),
          status: testStatus,
        }),
      });
      setCustomTest(updated);
      setShowEditModal(false);
      resetForm();
      setSuccessNotification({
        isOpen: true,
        title: "Custom Test Updated",
        message: "Custom test has been updated successfully!"
      });
      await fetchTests();
    } catch (err) {
      setSuccessNotification({
        isOpen: true,
        title: "Update Failed",
        message: err?.error || err?.message || "Failed to update custom test",
        type: "warning"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const showDeleteCustomTestConfirmation = () => {
    setShowDeleteCustomTestModal(true);
  };

  const deleteCustomTest = async () => {
    try {
      await api("/api/admin/tests/custom", { method: "DELETE" });
      setCustomTest(null);
      setShowDeleteCustomTestModal(false);
      setSuccessNotification({
        isOpen: true,
        title: "Custom Test Deleted",
        message: "Custom test has been deleted successfully!"
      });
      await fetchTests();
    } catch (err) {
      setShowDeleteCustomTestModal(false);
      setSuccessNotification({
        isOpen: true,
        title: "Delete Failed",
        message: err?.error || err?.message || "Failed to delete custom test",
        type: "warning"
      });
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!testTitle.trim() || !systemPrompt.trim()) {
      setSuccessNotification({
        isOpen: true,
        title: "Validation Error",
        message: "Test title and system prompt are required",
        type: "warning"
      });
      return;
    }

    if (systemPrompt.trim().length < 50) {
      setSuccessNotification({
        isOpen: true,
        title: "Validation Error",
        message: "System prompt must be at least 50 characters long",
        type: "warning"
      });
      return;
    }

    try {
      setFormLoading(true);
      const newTest = await api("/api/admin/tests", {
        method: "POST",
        body: JSON.stringify({
          title: testTitle.trim(),
          description: testDescription.trim() || null,
          systemPrompt: systemPrompt.trim(),
          status: testStatus,
        }),
      });
      setTests((prev) => [newTest, ...prev]);
      resetForm();
      setShowCreateModal(false);
      setSuccessNotification({
        isOpen: true,
        title: "Test Created",
        message: "Test has been created successfully!"
      });
    } catch (err) {
      console.error("Failed to create test:", err);
      setSuccessNotification({
        isOpen: true,
        title: "Creation Failed",
        message: err?.error || err?.message || "Failed to create test",
        type: "warning"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTest = async (e) => {
    e.preventDefault();
    if (!testTitle.trim() || !systemPrompt.trim()) {
      setSuccessNotification({
        isOpen: true,
        title: "Validation Error",
        message: "Test title and system prompt are required",
        type: "warning"
      });
      return;
    }

    try {
      setFormLoading(true);
      const updatedTest = await api(`/api/admin/tests/${selectedTest.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: testTitle.trim(),
          description: testDescription.trim() || null,
          systemPrompt: systemPrompt.trim(),
          status: testStatus,
        }),
      });
      setTests((prev) =>
        prev.map((t) => (t.id === selectedTest.id ? updatedTest : t))
      );
      resetForm();
      setShowEditModal(false);
      setSuccessNotification({
        isOpen: true,
        title: "Test Updated",
        message: "Test has been updated successfully!"
      });
    } catch (err) {
      console.error("Failed to update test:", err);
      setSuccessNotification({
        isOpen: true,
        title: "Update Failed",
        message: err?.error || err?.message || "Failed to update test",
        type: "warning"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const showDeleteTestConfirmation = (testId) => {
    setTestToDelete(testId);
    setShowDeleteTestModal(true);
  };

  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    try {
      await api(`/api/admin/tests/${testToDelete}`, { method: "DELETE" });
      setTests((prev) => prev.filter((t) => t.id !== testToDelete));
      setShowDeleteTestModal(false);
      setSuccessNotification({
        isOpen: true,
        title: "Test Deleted",
        message: "Test has been deleted successfully!"
      });
    } catch (err) {
      console.error("Failed to delete test:", err);
      setShowDeleteTestModal(false);
      setSuccessNotification({
        isOpen: true,
        title: "Delete Failed",
        message: err?.error || err?.message || "Failed to delete test",
        type: "warning"
      });
    } finally {
      setTestToDelete(null);
    }
  };

  const handleAssignTest = async (e) => {
    e.preventDefault();
    if (selectedCompanies.length === 0) {
      setSuccessNotification({
        isOpen: true,
        title: "Validation Error",
        message: "Please select at least one company",
        type: "warning"
      });
      return;
    }
    try {
      setFormLoading(true);
      for (const companyId of selectedCompanies) {
        await api(`/api/admin/tests/${selectedTest.id}/assign`, {
          method: "POST",
          body: JSON.stringify({ companyId }),
        });
      }
      await fetchTests();
      setSelectedCompanies([]);
      setShowAssignModal(false);
      setSelectedTest(null);
      setSuccessNotification({
        isOpen: true,
        title: "Test Assigned Successfully",
        message: `Test assigned to ${selectedCompanies.length} company(s) successfully!`
      });
    } catch (err) {
      console.error("Failed to assign test:", err);
      setSuccessNotification({
        isOpen: true,
        title: "Assignment Failed",
        message: err?.error || err?.message || "Failed to assign test",
        type: "warning"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkAssignTests = async (e) => {
    e.preventDefault();
    if (selectedTests.length === 0 || selectedCompanies.length === 0) {
      setSuccessNotification({
        isOpen: true,
        title: "Selection Required",
        message: "Please select at least one test and one company",
        type: "warning"
      });
      return;
    }
    try {
      setFormLoading(true);
      await api("/api/admin/tests/bulk-assign", {
        method: "POST",
        body: JSON.stringify({
          testIds: selectedTests,
          companyIds: selectedCompanies,
        }),
      });
      await fetchTests();
      setSelectedTests([]);
      setSelectedCompanies([]);
      setShowBulkAssignModal(false);
      setSuccessNotification({
        isOpen: true,
        title: "Bulk Assignment Completed",
        message: "Bulk assignment completed successfully!"
      });
    } catch (err) {
      console.error("Failed to bulk assign tests:", err);
      setSuccessNotification({
        isOpen: true,
        title: "Bulk Assignment Failed",
        message: err?.error || err?.message || "Failed to bulk assign tests",
        type: "warning"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (test) => {
    setSelectedTest(test);
    setTestTitle(test.title || "");
    setTestDescription(test.description || "");
    setSystemPrompt(test.systemPrompt || "");
    setTestStatus(test.status || "DRAFT");
    setShowEditModal(true);
  };

  const openAssignModal = (test) => {
    setSelectedTest(test);
    setSelectedCompanies([]);
    setShowAssignModal(true);
  };

  const openBulkAssignModal = () => {
    setSelectedTests([]);
    setSelectedCompanies([]);
    setShowBulkAssignModal(true);
  };

  const resetForm = () => {
    setTestTitle("");
    setTestDescription("");
    setSystemPrompt("");
    setTestStatus("DRAFT");
    setSelectedTest(null);
    setSelectedCompanies([]);
    setSelectedTests([]);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowAssignModal(false);
    setShowBulkAssignModal(false);
    resetForm();
  };

  const toggleCompanySelection = (companyId) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const toggleTestSelection = (testId) => {
    setSelectedTests((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    );
  };

  const selectAllTests = () => setSelectedTests(tests.map((t) => t.id));
  const selectAllCompanies = () => setSelectedCompanies(companies.map((c) => c.id));

  const filteredTests = tests.filter((test) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      test.title.toLowerCase().includes(q) ||
      (test.description && test.description.toLowerCase().includes(q));
    const matchesStatus = !statusFilter || test.status === statusFilter;
    return matchesSearch && matchesStatus && !test.isCustom;
  });

  const totalTests = tests.length;
  const publishedTests = tests.filter((t) => t.status === "ACTIVE").length;
  const draftTests = tests.filter((t) => t.status === "DRAFT").length;
  const totalAssignments = tests.reduce(
    (total, test) => total + (test._count?.userAssignments || 0),
    0
  );

  // Default system prompt template
  const defaultSystemPrompt = `You are an expert conversational interviewer conducting a behavioral assessment. Your goal is to guide a natural, flowing conversation that evaluates the participant's:

1. **Problem-Solving Skills** - Understanding and approach to challenges
2. **Creative Thinking** - Innovative solutions and perspectives  
3. **Practical Feasibility** - Realistic implementation planning
4. **Proactive Mindset** - Initiative and forward-thinking

CONVERSATION GUIDELINES:
- Start with a warm introduction and explain the assessment
- Ask open-ended questions that encourage detailed responses
- Build on their answers naturally - don't follow a rigid script
- Adapt your questions based on their responses
- Use follow-up questions to dig deeper into interesting points
- Keep the conversation professional but friendly
- When appropriate, present scenarios or ask for examples
- Guide them through discussing a challenge, their approach, and their planned actions

IMPORTANT INSTRUCTIONS:
- Let the conversation flow naturally - adapt to the user's responses
- You can use lists, bullet points, or markdown formatting in your responses
- Ask clarifying questions when needed
- Provide thoughtful transitions between topics
- When you feel the assessment is complete (after substantial discussion), clearly state: "This assessment is now complete. Thank you for your thoughtful participation."

Begin by introducing yourself and the assessment, then start the conversation naturally.`;

  return (
    <div className={`min-h-screen overflow-y-auto ${themeClasses.container} selection:bg-emerald-500/30 px-[min(4vw,16px)] md:px-[min(3vw,24px)] lg:px-[min(2vw,32px)] py-4 md:py-6 lg:pt-2 lg:pb-2 font-montserrat lg:min-h-0 lg:h-screen`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
      `}</style>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-5">
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
            className={`p-3 rounded-lg transition-colors flex-shrink-0 ${isLightTheme ? 'hover:bg-gray-100' : 'hover:bg-[#18181B]'}`}
            title={isLightTheme ? 'Switch to Dark' : 'Switch to Light'}
          >
            {isLightTheme ? (
              <FaMoon className={`w-5 h-5 lg:w-[20px] lg:h-[20px] text-emerald-500`} />
            ) : (
              <FaSun className={`w-5 h-5 lg:w-[20px] lg:h-[20px] text-white`} />
            )}
          </button>
          <button
            onClick={openBulkAssignModal}
            className={`hidden sm:inline-flex items-center gap-2 px-6 py-3 lg:px-[min(1.5vw,24px)] lg:py-[min(0.8vw,14px)] rounded-xl text-[min(3.5vw,20px)] sm:text-[min(2.5vw,18px)] md:text-[min(1.5vw,16px)] lg:text-[min(1vw,14px)] font-black uppercase tracking-widest transition-colors ${isLightTheme ? 'bg-transparent border border-emerald-700 text-emerald-700 hover:bg-emerald-50' : 'bg-black border border-gray-700 text-emerald-500 hover:bg-gray-900'}`}
          >
            <FaClipboardList className="w-4 h-4 lg:w-[min(0.8vw,14px)] lg:h-[min(0.8vw,14px)]" /> Bulk Assign
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
              setCreatingCustom(false);
            }}
            className={`inline-flex items-center gap-2 px-6 py-3 lg:px-[min(1.5vw,24px)] lg:py-[min(0.8vw,14px)] rounded-xl text-[min(3.5vw,20px)] sm:text-[min(2.5vw,18px)] md:text-[min(1.5vw,16px)] lg:text-[min(1vw,14px)] font-black uppercase tracking-widest transition-colors ${isLightTheme ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700' : 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'}`}
          >
            <FaPlus className="w-5 h-5 lg:w-[min(1vw,18px)] lg:h-[min(1vw,18px)]" /> New Test
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mb-4 sm:mb-5">
        <div>
          <StatsCard title="TESTS" value={totalTests} isLightTheme={isLightTheme} />
        </div>
        <div>
          <StatsCard title="PUBLISHED" value={publishedTests} isLightTheme={isLightTheme} />
        </div>
        <div>
          <StatsCard title="ASSIGNMENTS" value={totalAssignments} isLightTheme={isLightTheme} />
        </div>
        <div>
          <StatsCard title="DRAFT" value={draftTests} isLightTheme={isLightTheme} />
        </div>
      </div>

      {/* Search & Filter */}
      <div className={`${themeClasses.card} rounded-xl border p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,12px)] mb-4 sm:mb-5`}>
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} w-4 h-4 lg:w-[min(0.8vw,16px)] lg:h-[min(0.8vw,16px)]`} />
            <input
              className={`w-full pl-10 pr-4 py-3 border rounded-lg ${themeClasses.inputFocus} text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)] ${themeClasses.input}`}
              placeholder="Search tests by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className={`w-full md:w-auto min-w-[150px] p-3 border rounded-lg text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)] ${themeClasses.input}`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="" className={themeClasses.selectOption}>All Status</option>
            <option value="DRAFT" className={themeClasses.selectOption}>Draft</option>
            <option value="ACTIVE" className={themeClasses.selectOption}>Published</option>
            <option value="INACTIVE" className={themeClasses.selectOption}>Inactive</option>
            <option value="ARCHIVED" className={themeClasses.selectOption}>Archived</option>
          </select>
        </div>
      </div>

      {/* Custom Test (anchored at top of lists) */}
      <div className="mb-4 sm:mb-5">
        {!customTest && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setTestTitle("Custom Test");
                setTestDescription("");
                setSystemPrompt(defaultSystemPrompt);
                setTestStatus("ACTIVE");
                setShowCreateModal(true);
                setCreatingCustom(true);
              }}
              className={`px-4 py-2 lg:px-[min(1vw,16px)] lg:py-[min(0.55vw,10px)] rounded-xl text-[min(3vw,18px)] sm:text-[min(2vw,16px)] md:text-[min(1.2vw,15px)] lg:text-[min(0.8vw,13px)] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${themeClasses.buttonSuccess}`}
            >
              <FaPlus className="w-3 h-3 lg:w-[min(0.7vw,14px)] lg:h-[min(0.7vw,14px)]" /> Create Custom Test
            </button>
          </div>
        )}

        {customTest ? (
          <div className="space-y-4">
            <TestCard
              test={customTest}
              iconTone="red"
              isLightTheme={isLightTheme}
              onAssign={() => openAssignModal(customTest)}
              onEdit={() => {
                setSelectedTest(customTest);
                setTestTitle(customTest.title || "");
                setTestDescription(customTest.description || "");
                setSystemPrompt(customTest.systemPrompt || "");
                setTestStatus(customTest.status || "ACTIVE");
                setShowEditModal(true);
              }}
              onDelete={showDeleteCustomTestConfirmation}
            />
          </div>
        ) : (
          <div className={`p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,12px)] rounded-xl border text-center ${isLightTheme ? 'bg-white border-gray-300' : 'bg-[#18181B] border-gray-700'}`}>
            <FaRobot className={`w-8 h-8 lg:w-[min(2vw,32px)] lg:h-[min(2vw,32px)] mx-auto mb-3 ${isLightTheme ? 'text-emerald-400' : 'text-emerald-500/50'}`} />
            <p className={`font-medium text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)] ${isLightTheme ? 'text-emerald-600' : 'text-emerald-500'}`}>No custom test configured yet</p>
            <p className={`${themeClasses.textMuted} text-[min(3vw,14px)] sm:text-[min(2.2vw,13px)] md:text-[min(1.4vw,12px)] lg:text-[min(0.8vw,11px)] mt-1`}>Create one to enable personalized assessments</p>
          </div>
        )}
      </div>

      {/* Tests List */}
      <div className="">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className={`${themeClasses.textMuted} mt-3 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)]`}>Loading tests...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-2 text-[min(4vw,18px)] sm:text-[min(3vw,16px)] md:text-[min(2vw,14px)]">Error loading tests</div>
            <div className={`${themeClasses.textMuted} text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)]`}>{error}</div>
            <div className="mt-4">
              <button
                onClick={fetchTests}
                className={`px-4 py-2 rounded-xl text-[min(3vw,18px)] sm:text-[min(2vw,16px)] md:text-[min(1.2vw,15px)] lg:text-[min(0.8vw,13px)] font-black uppercase tracking-widest transition-colors ${themeClasses.buttonPrimary}`}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-12">
            <FaClipboardList className={`w-12 h-12 ${themeClasses.textSecondary} mx-auto mb-4`} />
            <h3 className={`text-[min(4.5vw,20px)] sm:text-[min(3.5vw,18px)] md:text-[min(2.2vw,16px)] lg:text-[min(1.4vw,14px)] font-medium ${themeClasses.text}`}>No tests found</h3>
            <p className={`${themeClasses.textMuted} mt-2 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)]`}>
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by creating your first test"}
            </p>
            <div className="mt-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className={`px-4 py-2 rounded-xl text-[min(3vw,18px)] sm:text-[min(2vw,16px)] md:text-[min(1.2vw,15px)] lg:text-[min(0.8vw,13px)] font-black uppercase tracking-widest transition-colors ${themeClasses.buttonPrimary}`}
              >
                Create Test
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTests.map((test, index) => (
              <div key={test.id}>
                <TestCard
                  test={test}
                  isLightTheme={isLightTheme}
                  onAssign={() => openAssignModal(test)}
                  onEdit={() => openEditModal(test)}
                  onDelete={() => showDeleteTestConfirmation(test.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <TestFormModal
          title="Create New Test"
          testTitle={testTitle}
          setTestTitle={setTestTitle}
          testDescription={testDescription}
          setTestDescription={setTestDescription}
          systemPrompt={systemPrompt}
          setSystemPrompt={setSystemPrompt}
          testStatus={testStatus}
          setTestStatus={setTestStatus}
          onSubmit={handleCreateSubmit}
          onCancel={closeModals}
          formLoading={formLoading}
          isLightTheme={isLightTheme}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <TestFormModal
          title="Edit Test"
          testTitle={testTitle}
          setTestTitle={setTestTitle}
          testDescription={testDescription}
          setTestDescription={setTestDescription}
          systemPrompt={systemPrompt}
          setSystemPrompt={setSystemPrompt}
          testStatus={testStatus}
          setTestStatus={setTestStatus}
          onSubmit={selectedTest?.isCustom ? updateCustomTest : handleUpdateTest}
          onCancel={closeModals}
          formLoading={formLoading}
          isLightTheme={isLightTheme}
        />
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <AssignModal
          title={`Assign "${selectedTest?.title}" to Companies`}
          companies={companies}
          selectedCompanies={selectedCompanies}
          onToggle={toggleCompanySelection}
          onSubmit={handleAssignTest}
          onCancel={closeModals}
          formLoading={formLoading}
          isLightTheme={isLightTheme}
        />
      )}

      {/* Bulk Assign Modal */}
      {showBulkAssignModal && (
        <BulkAssignModal
          tests={tests}
          companies={companies}
          selectedTests={selectedTests}
          selectedCompanies={selectedCompanies}
          onToggleTest={toggleTestSelection}
          onToggleCompany={toggleCompanySelection}
          onSelectAllTests={selectAllTests}
          onSelectAllCompanies={selectAllCompanies}
          onSubmit={handleBulkAssignTests}
          onCancel={closeModals}
          formLoading={formLoading}
          isLightTheme={isLightTheme}
        />
      )}

      {/* Delete Custom Test Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteCustomTestModal}
        onClose={() => setShowDeleteCustomTestModal(false)}
        onConfirm={deleteCustomTest}
        title="Delete Custom Test"
        message="Are you sure you want to delete the custom test? You can create a new one after."
        itemName={customTest?.title || "Custom Test"}
        confirmText="Delete Custom Test"
        cancelText="Keep Test"
        variant="danger"
        isLoading={formLoading}
      />

      {/* Delete Test Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteTestModal}
        onClose={() => setShowDeleteTestModal(false)}
        onConfirm={handleDeleteTest}
        title="Delete Test"
        message="Are you sure you want to delete this test? This action cannot be undone."
        itemName={(tests.find(t => t.id === testToDelete)?.title) || "this test"}
        confirmText="Delete Test"
        cancelText="Keep Test"
        variant="danger"
        isLoading={formLoading}
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

// Subcomponents
function StatsCard({ title, value, isLightTheme }) {
  return (
    <div className={`text-left rounded-xl border p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,12px)] h-full transition-colors ${isLightTheme ? 'bg-white border-gray-300 hover:bg-[#ECEFF1] shadow-sm' : 'bg-[#18181B] border-gray-700 hover:bg-[#202025]'}`}>
      <div className="flex items-center justify-start text-left text-[min(3vw,16px)] sm:text-[min(2vw,14px)] md:text-[min(1.2vw,12px)] lg:text-[min(0.8vw,10px)] font-extrabold tracking-[0.25em] text-emerald-500 uppercase leading-none mb-[min(1.5vw,8px)] sm:mb-[min(1vw,6px)] lg:mb-[min(0.5vw,4px)] pl-[7%]">
        {title}
      </div>
      <div className="text-[min(8vw,64px)] sm:text-[min(6vw,56px)] md:text-[min(8vh,48px)] lg:text-[min(10vh,56px)] font-bold text-emerald-500 tabular-nums leading-none tracking-tight text-center">
        {value}
      </div>
    </div>
  );
}

function TestCard({ test, iconTone = 'green', isLightTheme, onAssign, onEdit, onDelete }) {
  const [showPreview, setShowPreview] = useState(false);

  const iconClassName =
    iconTone === 'red'
      ? 'bg-gradient-to-br from-red-500 to-red-600'
      : 'bg-gradient-to-br from-emerald-500 to-emerald-600';

  const tc = {
    card: isLightTheme ? 'bg-white border-gray-300 shadow-sm hover:bg-[#F5F5F5]' : 'bg-[#18181B] border-gray-700 hover:bg-[#202025]',
    text: isLightTheme ? 'text-gray-700' : 'text-gray-200',
    textMuted: isLightTheme ? 'text-gray-600' : 'text-gray-400',
    textSecondary: isLightTheme ? 'text-gray-500' : 'text-gray-500',
    buttonPurple: isLightTheme ? 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20',
    buttonSuccess: isLightTheme ? 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20',
    buttonSecondary: isLightTheme ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700',
    buttonBlue: isLightTheme ? 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20',
    previewBg: isLightTheme ? 'bg-gray-50 border-gray-300' : 'bg-black border-gray-700',
    previewLabel: isLightTheme ? 'text-gray-700' : 'text-gray-300',
    previewText: isLightTheme ? 'text-gray-600' : 'text-gray-400',
  };

  return (
    <article className={`border rounded-lg p-3 transition-colors ${tc.card}`}>
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 lg:w-[min(2.5vw,44px)] lg:h-[min(2.5vw,44px)] rounded-lg ${iconClassName} flex items-center justify-center text-white shrink-0`}>
              <FaClipboardList className="w-5 h-5 lg:w-[min(1.2vw,22px)] lg:h-[min(1.2vw,22px)]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`font-semibold text-[min(4.5vw,20px)] sm:text-[min(3.5vw,18px)] md:text-[min(2.2vw,16px)] lg:text-[min(1.4vw,14px)] truncate ${tc.text}`}>{test.title}</h3>
              {test.description && (
                <p className={`text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)] truncate ${tc.textMuted}`}>{test.description}</p>
              )}
              <div className={`flex flex-wrap items-center gap-3 text-[min(3vw,14px)] sm:text-[min(2.2vw,13px)] md:text-[min(1.4vw,12px)] lg:text-[min(0.8vw,11px)] mt-2 ${tc.textMuted}`}>
                <span
                  className={`px-2 py-0.5 rounded-full font-medium ${
                    test.status === "ACTIVE"
                      ? isLightTheme ? "bg-emerald-100 text-emerald-600 border border-emerald-300" : "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                      : test.status === "DRAFT"
                      ? isLightTheme ? "bg-yellow-100 text-yellow-600 border border-yellow-300" : "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                      : isLightTheme ? "bg-gray-100 text-gray-600 border border-gray-300" : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                  }`}
                >
                  {test.status}
                </span>
                {test.isCustom && (
                  <span className={`px-2 py-0.5 rounded-full font-medium border ${isLightTheme ? 'bg-emerald-100 text-emerald-600 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                    Custom
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <FaBuilding className={`w-3 h-3 lg:w-[min(0.7vw,14px)] lg:h-[min(0.7vw,14px)] ${tc.textSecondary}`} />{" "}
                  <span>{test._count?.companyAssignments || 0} companies</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUsers className={`w-3 h-3 lg:w-[min(0.7vw,14px)] lg:h-[min(0.7vw,14px)] ${tc.textSecondary}`} />{" "}
                  <span>{test._count?.userAssignments || 0} users</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaRobot className={`w-3 h-3 lg:w-[min(0.7vw,14px)] lg:h-[min(0.7vw,14px)] ${tc.textSecondary}`} /> <span>GPT-powered</span>
                </div>
              </div>
            </div>
          </div>
          <div className={`text-[min(3vw,14px)] sm:text-[min(2.2vw,13px)] md:text-[min(1.4vw,12px)] lg:text-[min(0.8vw,11px)] mt-3 ${tc.textSecondary}`}>
            Created: {new Date(test.createdAt).toLocaleDateString()} • Updated:{" "}
            {new Date(test.updatedAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1.5 rounded-lg text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.8vw,11px)] transition-colors ${tc.buttonPurple}`}
            title="Preview prompt"
          >
            <FaEye className="w-4 h-4 lg:w-[min(0.8vw,16px)] lg:h-[min(0.8vw,16px)]" />
          </button>
          <button
            onClick={onAssign}
            className={`px-3 py-1.5 rounded-lg text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.8vw,11px)] transition-colors ${tc.buttonSuccess}`}
          >
            Assign
          </button>
          <button
            onClick={onEdit}
            className={`px-3 py-1.5 rounded-lg text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.8vw,11px)] transition-colors ${tc.buttonSecondary}`}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className={`px-3 py-1.5 rounded-lg text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.8vw,11px)] transition-colors ${tc.buttonBlue}`}
          >
            Delete
          </button>
        </div>
      </div>

      {/* System Prompt Preview */}
      {showPreview && (
        <div className={`mt-4 p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,12px)] rounded-lg border ${tc.previewBg}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-semibold text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] ${tc.previewLabel}`}>System Prompt:</h4>
            <button
              onClick={() => setShowPreview(false)}
              className={tc.textSecondary}
            >
              ✕
            </button>
          </div>
          <pre className="text-[min(3vw,14px)] sm:text-[min(2.2vw,13px)] md:text-[min(1.4vw,12px)] lg:text-[min(0.8vw,11px)] text-gray-400 whitespace-pre-wrap font-mono">
            {test.systemPrompt}
          </pre>
        </div>
      )}
    </article>
  );
}

function TestFormModal({
  title,
  testTitle,
  setTestTitle,
  testDescription,
  setTestDescription,
  systemPrompt,
  setSystemPrompt,
  testStatus,
  setTestStatus,
  onSubmit,
  onCancel,
  formLoading,
  isLightTheme,
}) {
  const tc = {
    modalBg: isLightTheme ? 'bg-white' : 'bg-[#09090B]',
    modalBorder: isLightTheme ? 'border-gray-300' : 'border-gray-700',
    headerBorder: isLightTheme ? 'border-gray-200' : 'border-gray-700',
    input: isLightTheme ? 'bg-white border-gray-300 text-gray-700 placeholder-gray-500' : 'bg-black border-gray-700 text-gray-200 placeholder-gray-500',
    label: isLightTheme ? 'text-gray-700' : 'text-gray-300',
    text: isLightTheme ? 'text-gray-700' : 'text-gray-200',
    textMuted: isLightTheme ? 'text-gray-600' : 'text-gray-400',
    textSecondary: isLightTheme ? 'text-gray-500' : 'text-gray-500',
    buttonSecondary: isLightTheme ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200' : 'bg-black border-gray-700 text-gray-300 hover:bg-gray-800',
    buttonSuccess: isLightTheme ? 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/30',
    selectOption: isLightTheme ? 'bg-white' : 'bg-[#18181B]',
    previewBg: isLightTheme ? 'bg-gray-50 border-gray-300 text-gray-700 placeholder-gray-400' : 'bg-black border-gray-700 text-gray-200 placeholder-gray-500',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`rounded-xl border-[1.5px] w-full max-w-4xl max-h-[90vh] overflow-y-auto ${tc.modalBg} ${tc.modalBorder}`}>
        <div className={`flex items-center justify-between p-4 border-b sticky top-0 z-10 ${tc.headerBorder} ${tc.modalBg}`}>
          <h3 className="text-[min(4.5vw,20px)] sm:text-[min(3.5vw,18px)] md:text-[min(2.2vw,16px)] lg:text-[min(1.4vw,18px)] font-extrabold tracking-[0.25em] text-emerald-500 uppercase">{title}</h3>
          <button
            onClick={onCancel}
            className={`p-2 rounded-md transition-colors ${isLightTheme ? 'text-gray-500 hover:bg-gray-200' : 'text-gray-500 hover:bg-gray-800'}`}
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${tc.label}`}>Test Title *</label>
              <input
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className={`w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] ${tc.input}`}
                placeholder="Enter test title"
                required
              />
            </div>
            <div>
              <label className={`text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${tc.label}`}>Status</label>
              <select
                value={testStatus}
                onChange={(e) => setTestStatus(e.target.value)}
                className={`w-full mt-1 p-3 border rounded-lg text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] ${tc.input}`}
              >
                <option value="DRAFT" className={tc.selectOption}>Draft</option>
                <option value="ACTIVE" className={tc.selectOption}>Published</option>
                <option value="INACTIVE" className={tc.selectOption}>Inactive</option>
                <option value="ARCHIVED" className={tc.selectOption}>Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${tc.label}`}>Description</label>
            <textarea
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              rows={2}
              className={`w-full mt-1 p-3 border rounded-lg text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] ${tc.input}`}
              placeholder="Enter test description (optional)"
            />
          </div>

          <div className={`border-t pt-6 ${tc.headerBorder}`}>
            <div className="flex items-center gap-2 mb-3">
              <FaRobot className="w-5 h-5 text-emerald-500" />
              <h4 className={`font-medium ${tc.text}`}>System Prompt</h4>
              <span className={`text-[min(3vw,12px)] sm:text-[min(2.2vw,11px)] md:text-[min(1.4vw,11px)] lg:text-[min(0.8vw,11px)] ${tc.textSecondary}`}>(minimum 50 characters)</span>
            </div>
            <p className={`text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] mb-4 ${tc.textMuted}`}>
              This is the main instruction that guides GPT throughout the entire conversation.
              Write clear, comprehensive instructions for how GPT should conduct the assessment.
            </p>
            {/* Prompt Writer's Guide — shows when prompt area is empty */}
            {systemPrompt.trim().length === 0 && (
            <div className={`mb-4 p-3 rounded-lg border ${isLightTheme ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/5 border-amber-500/20'}`}>
              <p className={`text-[min(3vw,12px)] sm:text-[min(2.2vw,11px)] md:text-[min(1.4vw,11px)] lg:text-[min(0.75vw,11px)] font-semibold ${isLightTheme ? 'text-amber-800' : 'text-amber-400'} mb-1.5`}>
                Prompt Writer's Guide — follow these rules for a working test:
              </p>
              <ul className={`text-[min(2.8vw,11px)] sm:text-[min(2vw,10.5px)] md:text-[min(1.2vw,10.5px)] lg:text-[min(0.7vw,10.5px)] ${isLightTheme ? 'text-amber-700' : 'text-amber-300'} list-disc pl-4 space-y-0.5`}>
                <li>Keep all test methodology &amp; scoring logic inside the system prompt</li>
                <li>Use the 6 standard dimensions: <code className={`${isLightTheme ? 'text-amber-800' : 'text-amber-200'} text-[min(2.6vw,10.5px)]`}>simplification</code>, <code className={`${isLightTheme ? 'text-amber-800' : 'text-amber-200'} text-[min(2.6vw,10.5px)]`}>originality</code>, <code className={`${isLightTheme ? 'text-amber-800' : 'text-amber-200'} text-[min(2.6vw,10.5px)]`}>feasibility</code>, <code className={`${isLightTheme ? 'text-amber-800' : 'text-amber-200'} text-[min(2.6vw,10.5px)]`}>criticalThinking</code>, <code className={`${isLightTheme ? 'text-amber-800' : 'text-amber-200'} text-[min(2.6vw,10.5px)]`}>proactivity</code>, <code className={`${isLightTheme ? 'text-amber-800' : 'text-amber-200'} text-[min(2.6vw,10.5px)]`}>impact</code> (camelCase, no underscores)</li>
                <li>Use <strong>0–100</strong> scale for all scores (not 1–5)</li>
                <li>Return <strong>all required JSON fields</strong> (6 scores + 14 analysis fields)</li>
                <li>The backend only validates, averages scores, and generates the report — all scoring logic must be in your prompt</li>
                <li><strong>Auto-complete trigger (critical):</strong> Instruct the AI to end the visible closure with these exact sentences (case-insensitive match):<br/>
                  <code>"You have completed the shorTest. Your results have been recorded. This test is now complete."</code><br/>
                  The system looks for phrases <code>"your results have been recorded"</code> and <code>"this test is now complete"</code> to auto-close. If missing, the test will hang forever and no report button will appear.</li>
                <li><strong>JSON template — use empty/null values only:</strong> The JSON block at the end of your prompt must use <code>""</code> (empty string) or <code>null</code> for all text fields. <strong>Never use example values</strong> like <code>"Problem Identification"</code>, <code>"Solution Direction"</code>, <code>"Not Applicable"</code>, or <code>"BUSINESS_PROBLEM"</code> — GPT copies them verbatim into real evaluations, causing fake problems/solutions to appear in the dashboard. The template should show <em>structure</em>, not <em>content</em>.</li>
              </ul>
            </div>
            )}
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={16}
              className={`w-full p-4 border rounded-lg text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] font-mono leading-relaxed ${tc.previewBg}`}
              placeholder="Enter the system prompt that will guide GPT through the entire conversation..."
              required
              minLength={50}
            />
            <div className={`text-[min(3vw,12px)] sm:text-[min(2.2vw,11px)] md:text-[min(1.4vw,11px)] lg:text-[min(0.8vw,11px)] mt-2 ${tc.textSecondary}`}>
              Character count: {systemPrompt.length} / 50 minimum
            </div>
          </div>

          <div className={`flex gap-2 justify-end pt-4 border-t ${tc.headerBorder}`}>
            <button
              type="button"
              onClick={onCancel}
              className={`px-4 py-2 rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest transition-colors disabled:opacity-50 ${tc.buttonSecondary}`}
              disabled={formLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className={`px-6 py-2 rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest transition-colors disabled:opacity-50 ${tc.buttonSuccess}`}
            >
              {formLoading ? "Saving..." : "Save Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignModal({
  title,
  companies,
  selectedCompanies,
  onToggle,
  onSubmit,
  onCancel,
  formLoading,
  isLightTheme,
}) {
  const tc = {
    modalBg: isLightTheme ? 'bg-white' : 'bg-[#09090B]',
    modalBorder: isLightTheme ? 'border-gray-300' : 'border-gray-700',
    headerBorder: isLightTheme ? 'border-gray-200' : 'border-gray-700',
    listBg: isLightTheme ? 'bg-gray-50 border-gray-300' : 'bg-black/40 border-gray-700',
    listItemHover: isLightTheme ? 'hover:bg-gray-100' : 'hover:bg-gray-800',
    listItemBorder: isLightTheme ? 'border-gray-200' : 'border-gray-700',
    checkbox: isLightTheme ? 'border-gray-400 bg-white' : 'border-gray-600 bg-black',
    text: isLightTheme ? 'text-gray-700' : 'text-gray-200',
    buttonSecondary: isLightTheme ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200' : 'bg-black border-gray-700 text-gray-300 hover:bg-gray-800',
    buttonSuccess: isLightTheme ? 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`rounded-xl border-[1.5px] w-full max-w-xl ${tc.modalBg} ${tc.modalBorder}`}>
        <div className={`p-4 border-b ${tc.headerBorder}`}>
          <h3 className="text-[min(4.5vw,20px)] sm:text-[min(3.5vw,18px)] md:text-[min(2.2vw,16px)] lg:text-[min(1.4vw,18px)] font-extrabold tracking-[0.25em] text-emerald-500 uppercase">{title}</h3>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className={`max-h-60 overflow-y-auto border rounded-lg ${tc.listBg}`}>
            {companies.map((company) => (
              <label
                key={company.id}
                className={`flex items-center p-3 cursor-pointer border-b last:border-b-0 ${tc.listItemHover} ${tc.listItemBorder}`}
              >
                <input
                  type="checkbox"
                  checked={selectedCompanies.includes(company.id)}
                  onChange={() => onToggle(company.id)}
                  className={`rounded text-emerald-500 focus:ring-emerald-500/50 ${tc.checkbox}`}
                />
                <div className={`ml-3 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] ${tc.text}`}>{company.name}</div>
              </label>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className={`px-4 py-2 rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest transition-colors disabled:opacity-50 ${tc.buttonSecondary}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading || selectedCompanies.length === 0}
              className={`px-4 py-2 rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest transition-colors disabled:opacity-50 ${tc.buttonSuccess}`}
            >
              {formLoading ? "Assigning..." : `Assign (${selectedCompanies.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BulkAssignModal({
  tests,
  companies,
  selectedTests,
  selectedCompanies,
  onToggleTest,
  onToggleCompany,
  onSelectAllTests,
  onSelectAllCompanies,
  onSubmit,
  onCancel,
  formLoading,
  isLightTheme,
}) {
  const tc = {
    modalBg: isLightTheme ? 'bg-white' : 'bg-[#09090B]',
    modalBorder: isLightTheme ? 'border-gray-300' : 'border-gray-700',
    headerBorder: isLightTheme ? 'border-gray-200' : 'border-gray-700',
    listBg: isLightTheme ? 'bg-gray-50 border-gray-300' : 'bg-black/40 border-gray-700',
    listItemHover: isLightTheme ? 'hover:bg-gray-100' : 'hover:bg-gray-800',
    listItemBorder: isLightTheme ? 'border-gray-200' : 'border-gray-700',
    checkbox: isLightTheme ? 'border-gray-400 bg-white' : 'border-gray-600 bg-black',
    text: isLightTheme ? 'text-gray-700' : 'text-gray-200',
    textMuted: isLightTheme ? 'text-gray-600' : 'text-gray-400',
    buttonSecondary: isLightTheme ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200' : 'bg-black border-gray-700 text-gray-300 hover:bg-gray-800',
    buttonSuccess: isLightTheme ? 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/30',
    statusBadge: isLightTheme ? 'bg-gray-200 text-gray-600' : 'bg-gray-700 text-gray-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`rounded-xl border-[1.5px] w-full max-w-4xl ${tc.modalBg} ${tc.modalBorder}`}>
        <div className={`p-4 border-b ${tc.headerBorder}`}>
          <h3 className="text-[min(4.5vw,20px)] sm:text-[min(3.5vw,18px)] md:text-[min(2.2vw,16px)] lg:text-[min(1.4vw,18px)] font-extrabold tracking-[0.25em] text-emerald-500 uppercase">Bulk Assign Tests</h3>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${tc.text}`}>Select Tests</h4>
                <button
                  type="button"
                  onClick={onSelectAllTests}
                  className="text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] text-emerald-500 hover:text-emerald-400"
                >
                  Select All
                </button>
              </div>
              <div className={`max-h-60 overflow-y-auto border rounded-lg ${tc.listBg}`}>
                {tests.map((test) => (
                  <label
                    key={test.id}
                    className={`flex items-center p-3 cursor-pointer border-b last:border-b-0 ${tc.listItemHover} ${tc.listItemBorder}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.id)}
                      onChange={() => onToggleTest(test.id)}
                      className={`rounded text-emerald-500 focus:ring-emerald-500/50 ${tc.checkbox}`}
                    />
                    <div className={`ml-3 flex-1 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] ${tc.text}`}>{test.title}</div>
                    <div className={`text-[min(3vw,12px)] sm:text-[min(2.2vw,11px)] md:text-[min(1.4vw,11px)] lg:text-[min(0.8vw,11px)] px-2 py-1 rounded ${tc.statusBadge}`}>
                      {test.status}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${tc.text}`}>Select Companies</h4>
                <button
                  type="button"
                  onClick={onSelectAllCompanies}
                  className="text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] text-emerald-500 hover:text-emerald-400"
                >
                  Select All
                </button>
              </div>
              <div className={`max-h-60 overflow-y-auto border rounded-lg ${tc.listBg}`}>
                {companies.map((company) => (
                  <label
                    key={company.id}
                    className={`flex items-center p-3 cursor-pointer border-b last:border-b-0 ${tc.listItemHover} ${tc.listItemBorder}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company.id)}
                      onChange={() => onToggleCompany(company.id)}
                      className={`rounded text-emerald-500 focus:ring-emerald-500/50 ${tc.checkbox}`}
                    />
                    <div className={`ml-3 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] ${tc.text}`}>{company.name}</div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className={`px-4 py-2 rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest transition-colors disabled:opacity-50 ${tc.buttonSecondary}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                formLoading || selectedTests.length === 0 || selectedCompanies.length === 0
              }
              className={`px-4 py-2 rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest transition-colors disabled:opacity-50 ${tc.buttonSuccess}`}
            >
              {formLoading
                ? "Assigning..."
                : `Bulk Assign (${selectedTests.length} × ${selectedCompanies.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
