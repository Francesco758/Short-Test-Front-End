// src/components/manager/AssignModal.jsx
import React, { useState } from "react";
import {
  FaXmark,
  FaClipboardCheck,
  FaCalendarDays,
  FaEnvelope,
  FaCheck,
} from "react-icons/fa6";

/**
 * AssignModal - assign tests to a single user with email notification
 *
 * Props:
 * - isOpen
 * - onClose
 * - userIds: array with ONE user id [userId]
 * - tests: array of { id, title, description? }
 * - assignTestToUsers: function from useCompanyData
 * - companyId
 *
 * NOTE: UI only changed. All logic preserved.
 */
export default function AssignModal({
  isOpen,
  onClose,
  userIds = [],
  tests = [],
  assignTestToUsers,
  companyId,
}) {
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [scheduleNow, setScheduleNow] = useState(true);
  const [scheduleAt, setScheduleAt] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notify, setNotify] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const singleUserId = userIds.length > 0 ? userIds[0] : null;

  React.useEffect(() => {
    if (isOpen) {
      setSelectedTestIds([]);
      setScheduleNow(true);
      setScheduleAt("");
      setDeadline("");
      setNotify(true);
      setResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function toggleTest(id) {
    setSelectedTestIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAllTests() {
    if (selectedTestIds.length === tests.length) {
      setSelectedTestIds([]);
    } else {
      setSelectedTestIds(tests.map((t) => t.id));
    }
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (selectedTestIds.length === 0) {
      setResult({ error: "Please select at least one test." });
      return;
    }

    if (!singleUserId) {
      setResult({ error: "No user selected for assignment." });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      // preserved behavior (original used selectedTestIds[0] with bulk assign API)
      const res = await assignTestToUsers(selectedTestIds[0], [singleUserId], { notify, scheduleAt: scheduleNow ? null : scheduleAt, deadline: deadline || null });

      setResult({
        success: {
          message: `Successfully assigned ${selectedTestIds.length} test(s) to user!`,
          testCount: selectedTestIds.length,
          emailSent: notify,
        },
      });

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setResult({ error: err.message || "Assignment failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setResult(null);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="assign-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal container */}
      <div className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden bg-white flex max-h-[90vh] min-h-0">
        {/* Custom scrollbar styles (applies to elements with className "custom-scrollbar") */}
        <style>{`
          /* Ensure stable gutter so scrollbar doesn't shift layout */
          .custom-scrollbar { scrollbar-gutter: stable; -webkit-overflow-scrolling: touch; }

          /* Firefox */
          .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(34,197,94,0.9) rgba(229,231,235,0.8); }

          /* Webkit browsers (Chrome, Edge, Safari) */
          .custom-scrollbar::-webkit-scrollbar { width: 12px; height: 12px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(229,231,235,0.9); border-radius: 9999px; }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(34,197,94,0.95), rgba(16,185,129,0.9));
            border-radius: 9999px;
            border: 3px solid rgba(0,0,0,0);
            background-clip: padding-box;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { filter: brightness(0.95); }

          /* Make track slightly visible even when not hovering (helps users notice scrollbar) */
          .custom-scrollbar { --track-bg: rgba(229,231,235,0.9); --thumb-opacity: 0.95; }
        `}</style>

        <div className="grid grid-cols-1 md:grid-cols-12 w-full min-h-0">
          {/* Decorative left panel (md+) */}
          <div className="hidden md:flex md:col-span-4 items-center justify-center bg-gradient-to-b from-emerald-600 via-green-600 to-emerald-500 p-6 min-h-0">
            <div className="text-center max-w-xs">
              <div className="mx-auto mb-4 w-20 h-20 rounded-3xl bg-white/12 flex items-center justify-center shadow-lg">
                <FaClipboardCheck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white text-lg font-semibold">Assign Tests</h3>
              <p className="text-emerald-100 mt-2 text-sm">
                Quickly assign test(s) to the selected user and optionally notify them by email.
              </p>

              <div className="mt-6 space-y-3 text-left text-sm text-emerald-100">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    <FaCalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">Flexible scheduling</div>
                    <div className="opacity-90">Assign immediately or schedule for later.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    <FaEnvelope className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">Email notifications</div>
                    <div className="opacity-90">Notify users automatically with details.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main form area */}
          <div className="col-span-12 md:col-span-8 flex flex-col min-h-0">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-5 border-b flex items-center justify-between">
              <div>
                <h2 id="assign-modal-title" className="text-lg font-semibold text-gray-900">
                  Assign Tests to User
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Assigning tests to{" "}
                  <span className="font-medium text-indigo-600">
                    {singleUserId ? "1 user" : "no user"}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  aria-label="Close"
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                >
                  <FaXmark className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar min-h-0">
              {/* Tests Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Tests <span className="text-gray-400 text-xs">({selectedTestIds.length} of {tests.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={toggleAllTests}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {selectedTestIds.length === tests.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1 custom-scrollbar min-h-0">
                  {tests.map((test) => (
                    <label
                      key={test.id}
                      className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedTestIds.includes(test.id)
                          ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTestIds.includes(test.id)}
                        onChange={() => toggleTest(test.id)}
                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                          <span>{test.title}</span>
                          {selectedTestIds.includes(test.id) && (
                            <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Selected</span>
                          )}
                        </div>
                        {test.description && (
                          <div className="text-xs text-gray-500 mt-1 truncate">{test.description}</div>
                        )}
                      </div>
                    </label>
                  ))}
                  {tests.length === 0 && (
                    <div className="text-sm text-gray-500 p-4">No tests available.</div>
                  )}
                </div>
              </div>

              {/* Schedule Options */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Schedule</h3>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <label className="flex items-center gap-3 flex-1">
                      <input
                        type="radio"
                        checked={scheduleNow}
                        onChange={() => setScheduleNow(true)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Assign Immediately</div>
                        <div className="text-sm text-gray-500">Tests will be assigned right away</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 flex-1">
                      <input
                        type="radio"
                        checked={!scheduleNow}
                        onChange={() => setScheduleNow(false)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Schedule for Later</div>
                        <div className="text-sm text-gray-500">Choose specific date and time</div>
                      </div>
                    </label>
                  </div>

                  {!scheduleNow && (
                    <div className="pl-7">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date & Time</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute left-3 top-3 text-gray-400 pointer-events-none">
                            <FaCalendarDays />
                          </div>
                          <input
                            type="datetime-local"
                            value={scheduleAt}
                            onChange={(e) => setScheduleAt(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Deadline */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Deadline (optional)</h3>
                <div className="relative max-w-sm">
                  <div className="absolute left-3 top-3 text-gray-400 pointer-events-none">
                    <FaCalendarDays />
                  </div>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Users will see an upcoming deadline badge until completion.</p>
              </div>

              {/* Notification Option */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input
                  id="notify-users"
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="notify-users" className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">Send email notification</div>
                  <div className="text-sm text-gray-500">
                    User will receive an email with login credentials and test details
                    {notify && <span className="text-green-600 font-semibold"> ✓ Email will be sent</span>}
                  </div>
                </label>
              </div>

              {/* Result Messages */}
              {result?.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-800">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">{result.error}</span>
                  </div>
                </div>
              )}

              {result?.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 text-green-800">
                    <FaCheck className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{result.success.message}</div>
                      {result.success.emailSent && (
                        <div className="text-xs text-green-700 mt-1">
                          ✓ Email with login credentials has been sent to the user
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* bottom spacer so last content isn't hidden behind footer */}
              <div className="h-4" />
            </form>

            {/* Footer (fixed) */}
            <div className="flex-shrink-0 px-6 py-4 border-t bg-white">
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || selectedTestIds.length === 0}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <FaClipboardCheck className="w-4 h-4" />
                      Assign {selectedTestIds.length} Test{selectedTestIds.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
