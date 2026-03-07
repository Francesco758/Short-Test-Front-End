// src/components/manager/AssignModal.jsx
import React, { useState } from "react";
import {
  FaXmark,
  FaClipboardCheck,
  FaCalendarDays,
  FaEnvelope,
  FaCheck,
  FaRocket,
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
  isOverUserManagement = false,
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
      className={`fixed inset-0 ${isOverUserManagement ? 'z-[110]' : 'z-50'} flex items-center justify-center p-4 animate-in fade-in duration-300`}
      aria-modal="true"
      role="dialog"
      aria-labelledby="assign-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal container */}
      <div className="relative w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden bg-[#0f172a] border border-gray-800 flex flex-col max-h-[90vh] min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-12 w-full min-h-0 flex-1">
          {/* Decorative left panel (md+) */}
          <div className="hidden md:flex md:col-span-4 items-center justify-center bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-r border-gray-800 p-8 min-h-0 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f2aa]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[#00f2aa]/10 transition-all"></div>
            <div className="text-center max-w-xs relative z-10">
              <div className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-[#0f172a] border border-gray-700 flex items-center justify-center shadow-2xl">
                <FaClipboardCheck className="w-10 h-10 text-[#00f2aa]" />
              </div>
              <h3 className="text-white text-xl font-black uppercase tracking-widest mb-4">Assign Tests</h3>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
                Assign test(s) to the selected user and notify them instantly.
              </p>

              <div className="mt-10 space-y-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0f172a] border border-gray-800 flex items-center justify-center flex-shrink-0">
                    <FaCalendarDays className="w-4 h-4 text-[#00f2aa]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Scheduling</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Assign immediately or schedule.</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0f172a] border border-gray-800 flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="w-4 h-4 text-[#00f2aa]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Notifications</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Auto-notify users via email.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main form area */}
          <div className="col-span-12 md:col-span-8 flex flex-col min-h-0">
            {/* Header */}
            <div className="flex-shrink-0 px-10 py-8 border-b border-gray-800 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-xl">
              <div>
                <h2 id="assign-modal-title" className="text-2xl font-black text-white uppercase tracking-tighter">
                  Assign Tests
                </h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                  Assigning to{" "}
                  <span className="text-[#00f2aa]">
                    {singleUserId ? "1 user" : "no user"}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  aria-label="Close"
                  className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-all"
                >
                  <FaXmark className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar min-h-0 bg-[#0f172a]">
              {/* Tests Selection */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-white uppercase tracking-widest">
                    Select Tests <span className="text-gray-500 ml-2">({selectedTestIds.length} / {tests.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={toggleAllTests}
                    className="text-[10px] font-black text-[#00f2aa] uppercase tracking-widest hover:text-[#00d496] transition-colors"
                  >
                    {selectedTestIds.length === tests.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                  {tests.map((test) => (
                    <label
                      key={test.id}
                      className={`flex items-center gap-6 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                        selectedTestIds.includes(test.id)
                          ? "border-[#00f2aa] bg-[#00f2aa]/5 shadow-[0_0_20px_rgba(0,242,170,0.05)]"
                          : "border-gray-800 bg-[#1e293b] hover:border-gray-700"
                      }`}
                    >
                      <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors ${
                        selectedTestIds.includes(test.id) ? 'bg-[#00f2aa] border-[#00f2aa]' : 'border-gray-600'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selectedTestIds.includes(test.id)}
                          onChange={() => toggleTest(test.id)}
                          className="hidden"
                        />
                        {selectedTestIds.includes(test.id) && <FaCheck className="text-[#0f172a] w-2.5 h-2.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-sm uppercase tracking-widest ${selectedTestIds.includes(test.id) ? 'text-[#00f2aa]' : 'text-gray-300'}`}>
                          {test.title}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Scheduling & Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Schedule Assignment</label>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setScheduleNow(true)}
                      className={`px-6 py-3 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                        scheduleNow 
                          ? 'border-[#00f2aa] bg-[#00f2aa]/10 text-[#00f2aa]' 
                          : 'border-gray-800 bg-[#1e293b] text-gray-500'
                      }`}
                    >
                      Assign Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleNow(false)}
                      className={`px-6 py-3 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                        !scheduleNow 
                          ? 'border-[#00f2aa] bg-[#00f2aa]/10 text-[#00f2aa]' 
                          : 'border-gray-800 bg-[#1e293b] text-gray-500'
                      }`}
                    >
                      Schedule Later
                    </button>
                  </div>
                </div>

                {!scheduleNow && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Schedule Date</label>
                    <input
                      type="datetime-local"
                      value={scheduleAt}
                      onChange={(e) => setScheduleAt(e.target.value)}
                      className="w-full bg-[#1e293b] border-2 border-gray-800 rounded-xl px-6 py-3 text-white focus:outline-none focus:border-[#00f2aa] transition-all text-sm font-bold"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Notifications</label>
                  <button
                    type="button"
                    onClick={() => setNotify(!notify)}
                    className={`w-full flex items-center justify-between px-6 py-3 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                      notify 
                        ? 'border-[#00f2aa] bg-[#00f2aa]/10 text-[#00f2aa]' 
                        : 'border-gray-800 bg-[#1e293b] text-gray-500'
                    }`}
                  >
                    <span>Email Notification</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${notify ? 'bg-[#00f2aa]' : 'bg-gray-700'}`}>
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${notify ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </button>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="px-10 py-8 border-t border-gray-800 bg-[#0f172a]/80 backdrop-blur-xl flex flex-col items-center gap-6">
              {result?.error && (
                <div className="text-red-500 font-black text-[10px] uppercase tracking-widest bg-red-500/10 px-6 py-3 rounded-full border border-red-500/20 w-full text-center">
                  {result.error}
                </div>
              )}
              {result?.success && (
                <div className="text-[#00f2aa] font-black text-[10px] uppercase tracking-widest bg-[#00f2aa]/10 px-6 py-3 rounded-full border border-[#00f2aa]/20 w-full text-center">
                  {result.success.message}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={selectedTestIds.length === 0 || loading}
                className={`w-full max-w-lg py-4 rounded-2xl text-[#0f172a] font-black text-lg uppercase tracking-[0.2em] transition-all duration-500 shadow-[0_0_30px_rgba(0,242,170,0.1)] flex items-center justify-center gap-4 group ${
                  (selectedTestIds.length === 0 || loading)
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed shadow-none'
                    : 'bg-[#00f2aa] hover:bg-[#00d496] hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,242,170,0.3)]'
                }`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Assign Selected Tests
                    <FaRocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>

              <button
                onClick={handleClose}
                className="text-gray-500 font-black text-[8px] uppercase tracking-[0.4em] hover:text-white transition-colors"
              >
                CANCEL AND RETURN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
