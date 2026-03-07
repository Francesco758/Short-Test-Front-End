import React, { useState, useEffect } from "react";
import AOS from 'aos';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaClipboardList,
  FaSearch,
  FaBuilding,
  FaUsers,
  FaRobot,
  FaEye
} from "react-icons/fa";
import { api } from "../../utils/api";
import SuccessNotificationModal from "../../models/SuccessNotificationModal";
import DeleteConfirmModal from "../../models/DeleteConfirmModal";

export default function AdminTestsPageSimplified() {
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
    AOS.refresh();
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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-sky-600 to-indigo-600 rounded-xl text-white shadow-md">
            <FaClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Tests Management
            </h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              Create and manage conversational assessments
            </p>
          </div>
        </div>

      <div className="flex items-center gap-2">
          <button
            onClick={openBulkAssignModal}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition"
          >
            <FaClipboardList /> Bulk Assign
          </button>
        <button
          onClick={() => {
            setSystemPrompt(defaultSystemPrompt);
            setShowCreateModal(true);
            setCreatingCustom(false);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          <FaPlus /> New Test
        </button>
      </div>
    </div>

    {/* Custom Test Management */}
    <div className="mb-6" data-aos="fade-up" data-aos-delay="150">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Custom Test</h2>
          <p className="text-sm text-gray-600">
            Single company-wide custom test. First question can be shaped by manager's brief.
          </p>
        </div>
        {!customTest && (
          <button
            onClick={() => {
              setTestTitle("Custom Test");
              setTestDescription("");
              setSystemPrompt(defaultSystemPrompt);
              setTestStatus("ACTIVE");
              setShowCreateModal(true);
              setCreatingCustom(true);
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <FaPlus className="w-3 h-3" /> Create Custom Test
          </button>
        )}
      </div>

      {customTest ? (
        <TestCard
          test={customTest}
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
      ) : (
        <div className="p-8 border-2 border-dashed border-emerald-100 rounded-2xl bg-emerald-50/30 text-center">
          <FaRobot className="w-8 h-8 text-emerald-300 mx-auto mb-3" />
          <p className="text-emerald-700 font-medium">No custom test configured yet</p>
          <p className="text-emerald-600/60 text-xs mt-1">Create one to enable personalized assessments</p>
        </div>
      )}
    </div>
      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              placeholder="Search tests by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="w-full md:w-auto min-w-[150px] p-2 border rounded-lg text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Published</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div data-aos="fade-up" data-aos-delay="200">
          <StatsCard title="Total Tests" value={totalTests} color="from-blue-50 to-blue-100" />
        </div>
        <div data-aos="fade-up" data-aos-delay="250">
          <StatsCard title="Published" value={publishedTests} color="from-emerald-50 to-emerald-100" />
        </div>
        <div data-aos="fade-up" data-aos-delay="300">
          <StatsCard title="Draft" value={draftTests} color="from-yellow-50 to-yellow-100" />
        </div>
        <div data-aos="fade-up" data-aos-delay="350">
          <StatsCard title="Assignments" value={totalAssignments} color="from-violet-50 to-violet-100" />
        </div>
      </div>

      {/* Tests List */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200" data-aos="fade-up" data-aos-delay="400">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="text-gray-500 mt-3">Loading tests...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">Error loading tests</div>
            <div className="text-gray-600">{error}</div>
            <div className="mt-4">
              <button
                onClick={fetchTests}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-12">
            <FaClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No tests found</h3>
            <p className="text-gray-500 mt-2">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by creating your first test"}
            </p>
            <div className="mt-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Create Test
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTests.map((test, index) => (
              <div key={test.id} data-aos="fade-up" data-aos-delay={500 + (index * 50)}>
                <TestCard
                  test={test}
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
function StatsCard({ title, value, color }) {
  return (
    <div className={`p-4 rounded-lg bg-gradient-to-br ${color} border border-gray-100 shadow-sm`}>
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function TestCard({ test, onAssign, onEdit, onDelete }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <article className="p-4 border rounded-lg hover:shadow-sm transition bg-white">
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <FaClipboardList />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-lg truncate">{test.title}</h3>
              {test.description && (
                <p className="text-sm text-gray-500 truncate">{test.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    test.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800"
                      : test.status === "DRAFT"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {test.status}
                </span>
                {test.isCustom && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Custom
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <FaBuilding className="w-3 h-3" />{" "}
                  <span>{test._count?.companyAssignments || 0} companies</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUsers className="w-3 h-3" />{" "}
                  <span>{test._count?.userAssignments || 0} users</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaRobot className="w-3 h-3" /> <span>GPT-powered</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-3">
            Created: {new Date(test.createdAt).toLocaleDateString()} • Updated:{" "}
            {new Date(test.updatedAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-md text-sm hover:bg-purple-100 transition"
            title="Preview prompt"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={onAssign}
            className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-sm"
          >
            Assign
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-1 bg-sky-50 border border-sky-200 text-sky-700 rounded-md text-sm"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm"
          >
            Delete
          </button>
        </div>
      </div>
      
      {/* System Prompt Preview */}
      {showPreview && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-gray-700">System Prompt:</h4>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
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
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={onCancel}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Test Title *</label>
              <input
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                placeholder="Enter test title"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={testStatus}
                onChange={(e) => setTestStatus(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg text-sm"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Published</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              rows={2}
              className="w-full mt-1 p-3 border rounded-lg text-sm"
              placeholder="Enter test description (optional)"
            />
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-3">
              <FaRobot className="w-5 h-5 text-sky-600" />
              <h4 className="font-medium">System Prompt</h4>
              <span className="text-xs text-gray-500">(minimum 50 characters)</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This is the main instruction that guides GPT throughout the entire conversation.
              Write clear, comprehensive instructions for how GPT should conduct the assessment.
            </p>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={16}
              className="w-full p-4 border rounded-lg text-sm font-mono leading-relaxed"
              placeholder="Enter the system prompt that will guide GPT through the entire conversation..."
              required
              minLength={50}
            />
            <div className="text-xs text-gray-500 mt-2">
              Character count: {systemPrompt.length} / 50 minimum
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={formLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
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
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-lg">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {companies.map((company) => (
              <label
                key={company.id}
                className="flex items-center p-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCompanies.includes(company.id)}
                  onChange={() => onToggle(company.id)}
                  className="rounded border-gray-300"
                />
                <div className="ml-3 text-sm">{company.name}</div>
              </label>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading || selectedCompanies.length === 0}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50"
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
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-lg">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Bulk Assign Tests</h3>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Select Tests</h4>
                <button
                  type="button"
                  onClick={onSelectAllTests}
                  className="text-sm text-blue-600"
                >
                  Select All
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                {tests.map((test) => (
                  <label
                    key={test.id}
                    className="flex items-center p-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.id)}
                      onChange={() => onToggleTest(test.id)}
                      className="rounded border-gray-300"
                    />
                    <div className="ml-3 flex-1 text-sm">{test.title}</div>
                    <div className="text-xs px-2 py-1 rounded bg-gray-100">
                      {test.status}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Select Companies</h4>
                <button
                  type="button"
                  onClick={onSelectAllCompanies}
                  className="text-sm text-blue-600"
                >
                  Select All
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                {companies.map((company) => (
                  <label
                    key={company.id}
                    className="flex items-center p-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company.id)}
                      onChange={() => onToggleCompany(company.id)}
                      className="rounded border-gray-300"
                    />
                    <div className="ml-3 text-sm">{company.name}</div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                formLoading || selectedTests.length === 0 || selectedCompanies.length === 0
              }
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50"
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
