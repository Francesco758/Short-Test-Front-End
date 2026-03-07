import React, { useState, useMemo } from "react";
import { FaRocket, FaTimes, FaClipboardList, FaUsers, FaCheck, FaSearch, FaMagic, FaCalendarAlt } from "react-icons/fa";
import SuccessNotificationModal from "../../models/SuccessNotificationModal";

export default function ShortTestModal({
  isOpen,
  onClose,
  tests = [],
  users = [],
  assignTestToUsers,
}) {
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [brief, setBrief] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testQuery, setTestQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const selectedTest = useMemo(() => tests.find(t => t.id === selectedTestId) || null, [tests, selectedTestId]);
  const isCustomSelected = !!selectedTest?.isCustom;

  const filteredTests = useMemo(() => {
    const items = tests.filter(t => t?.id && t?.title);
    const q = testQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(t => (t.title || "").toLowerCase().includes(q));
  }, [tests, testQuery]);
  const normalTests = useMemo(() => filteredTests.filter(t => !t.isCustom), [filteredTests]);
  const customAssigned = useMemo(() => tests.find(t => t.isCustom) || null, [tests]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => ((u.name || u.email || "").toLowerCase().includes(q)));
  }, [users, userQuery]);

  function toggleUser(userId) {
    setSelectedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  }

  function selectAllUsers() {
    setSelectedUserIds(filteredUsers.map(u => u.id));
  }

  function clearSelections() {
    setSelectedUserIds([]);
  }

  async function handleLaunch() {
    if (!selectedTestId || selectedUserIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      await assignTestToUsers(
        selectedTestId,
        selectedUserIds,
        { notify: true, brief: isCustomSelected ? brief : null, deadline: deadline || null }
      );
      onClose();
      setShowSuccessModal(true);
    } catch (e) {
      setError(e?.message || "Failed to launch test");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  // Group users by function for the "Teams" view
  const teams = users.reduce((acc, u) => {
    if (u.function) {
      acc[u.function] = (acc[u.function] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full h-full md:w-[95vw] md:h-[95vh] bg-[#0f172a] md:rounded-[40px] shadow-2xl overflow-hidden border border-gray-800 flex flex-col transition-all duration-500 ease-in-out">
        {/* Header */}
        <div className="px-10 py-6 border-b border-gray-800 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-xl z-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Configure shorTest</h2>
            <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase">Select tests, participants and launch</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 transition-all group"
          >
            <FaTimes className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar space-y-12">
          
          {/* Section: SELECT SHORTEST (Tests) */}
          <div className="space-y-8">
            <h3 className="text-white font-black text-2xl uppercase tracking-widest flex items-center gap-4">
              <span className="w-10 h-1 border-t-4 border-[#00f2aa]"></span>
              Select Shortest
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Normal Tests List */}
              <div className="bg-[#1e293b] border border-gray-800 rounded-3xl p-10 space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#00f2aa] uppercase tracking-[0.3em]">Normal Tests</h4>
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      value={testQuery}
                      onChange={(e) => setTestQuery(e.target.value)}
                      placeholder="Search tests..."
                      className="bg-[#0f172a] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-[#00f2aa] transition-colors w-64"
                    />
                  </div>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                  {normalTests.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTestId(t.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all duration-300 ${
                        selectedTestId === t.id 
                          ? 'border-[#00f2aa] bg-[#00f2aa]/10 shadow-[0_0_20px_rgba(0,242,170,0.1)]' 
                          : 'border-gray-800 bg-[#0f172a] hover:border-gray-600'
                      }`}
                    >
                      <span className={`text-xs font-bold ${selectedTestId === t.id ? 'text-[#00f2aa]' : 'text-gray-300'}`}>
                        {t.title}
                      </span>
                      {selectedTestId === t.id && (
                        <div className="w-4 h-4 bg-[#00f2aa] rounded-full flex items-center justify-center">
                          <FaCheck className="text-[#0f172a] w-2 h-2" />
                        </div>
                      )}
                    </button>
                  ))}
                  {normalTests.length === 0 && (
                    <div className="text-center py-10 text-gray-500 font-bold uppercase tracking-widest text-sm italic">
                      No tests found matching your search
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Test & Brief */}
              <div className="bg-[#1e293b] border border-gray-800 rounded-3xl p-10 space-y-8 shadow-xl">
                <h4 className="text-xs font-black text-[#00f2aa] uppercase tracking-[0.3em]">Custom Test & Brief</h4>
                {!customAssigned ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-[#0f172a] rounded-3xl border-2 border-dashed border-gray-800">
                    <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">No custom test available</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <button
                      onClick={() => setSelectedTestId(customAssigned.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all duration-300 ${
                        selectedTestId === customAssigned.id 
                          ? 'border-[#00f2aa] bg-[#00f2aa]/10 shadow-[0_0_20px_rgba(0,242,170,0.1)]' 
                          : 'border-gray-800 bg-[#0f172a] hover:border-gray-600'
                      }`}
                    >
                      <span className={`text-xs font-bold ${selectedTestId === customAssigned.id ? 'text-[#00f2aa]' : 'text-gray-300'}`}>
                        {customAssigned.title}
                      </span>
                      {selectedTestId === customAssigned.id && (
                        <div className="w-4 h-4 bg-[#00f2aa] rounded-full flex items-center justify-center">
                          <FaCheck className="text-[#0f172a] w-2 h-2" />
                        </div>
                      )}
                    </button>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Brief Input</label>
                        {isCustomSelected && (
                          <span className="text-[10px] font-black text-[#00f2aa] uppercase tracking-[0.2em] animate-pulse">Ready to input</span>
                        )}
                      </div>
                      <textarea
                        value={brief}
                        onChange={(e) => setBrief(e.target.value)}
                        rows={8}
                        placeholder={isCustomSelected ? "Paste a short company brief to shape the first question..." : "Brief is available for Custom Test only."}
                        className={`w-full bg-[#0f172a] border-2 rounded-2xl px-6 py-5 text-gray-300 text-base focus:outline-none transition-all duration-300 ${
                          isCustomSelected 
                            ? 'border-gray-700 focus:border-[#00f2aa]' 
                            : 'border-gray-800 opacity-30 cursor-not-allowed'
                        }`}
                        disabled={!isCustomSelected}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: SELECT PEOPLE */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h3 className="text-white font-black text-2xl uppercase tracking-widest flex items-center gap-4">
                <span className="w-10 h-1 border-t-4 border-[#00f2aa]"></span>
                Select People
              </h3>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search participants..."
                  className="bg-[#1e293b] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-[#00f2aa] transition-colors w-80"
                />
              </div>
            </div>
            
            <div className="bg-[#1e293b] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {/* All Organization */}
                <button
                  onClick={() => {
                    const allIds = users.map(u => u.id);
                    const allSelected = allIds.length > 0 && allIds.every(id => selectedUserIds.includes(id));
                    setSelectedUserIds(allSelected ? [] : allIds);
                  }}
                  className={`w-full flex items-center justify-between px-10 py-2.5 border-b border-gray-800 transition-all duration-300 ${
                    users.length > 0 && users.every(u => selectedUserIds.includes(u.id)) ? 'bg-[#00f2aa]/5' : 'hover:bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-4 h-4 border-2 rounded-md flex items-center justify-center transition-colors ${
                      users.length > 0 && users.every(u => selectedUserIds.includes(u.id)) ? 'bg-[#00f2aa] border-[#00f2aa]' : 'border-gray-600'
                    }`}>
                      {users.length > 0 && users.every(u => selectedUserIds.includes(u.id)) && <FaCheck className="text-[#0f172a] w-2 h-2" />}
                    </div>
                    <span className={`text-sm font-bold ${users.length > 0 && users.every(u => selectedUserIds.includes(u.id)) ? 'text-[#00f2aa]' : 'text-gray-300'}`}>
                      All Organization
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">{users.length} Members</span>
                </button>

                {/* Teams */}
                {Object.entries(teams).map(([teamName, count]) => {
                  const teamUserIds = users.filter(u => u.function === teamName).map(u => u.id);
                  const isTeamSelected = teamUserIds.every(id => selectedUserIds.includes(id));
                  return (
                    <button
                      key={teamName}
                      onClick={() => {
                        if (isTeamSelected) {
                          setSelectedUserIds(prev => prev.filter(id => !teamUserIds.includes(id)));
                        } else {
                          setSelectedUserIds(prev => [...new Set([...prev, ...teamUserIds])]);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-10 py-2.5 border-b border-gray-800 transition-all duration-300 ${isTeamSelected ? 'bg-[#00f2aa]/5' : 'hover:bg-gray-800/30'}`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-4 h-4 border-2 rounded-md flex items-center justify-center transition-colors ${
                          isTeamSelected ? 'bg-[#00f2aa] border-[#00f2aa]' : 'border-gray-600'
                        }`}>
                          {isTeamSelected && <FaCheck className="text-[#0f172a] w-2 h-2" />}
                        </div>
                        <span className={`text-sm font-bold ${isTeamSelected ? 'text-[#00f2aa]' : 'text-gray-300'}`}>{teamName}</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">{count} Members</span>
                    </button>
                  );
                })}

                {/* Individuals */}
                {filteredUsers.map(u => {
                  const isSelected = selectedUserIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      onClick={() => toggleUser(u.id)}
                      className={`w-full flex items-center justify-between px-10 py-2.5 border-b border-gray-800 transition-all duration-300 ${isSelected ? 'bg-[#00f2aa]/5' : 'hover:bg-gray-800/30'}`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-4 h-4 border-2 rounded-md flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#00f2aa] border-[#00f2aa]' : 'border-gray-600'
                        }`}>
                          {isSelected && <FaCheck className="text-[#0f172a] w-2 h-2" />}
                        </div>
                        <span className={`text-sm font-bold ${isSelected ? 'text-[#00f2aa]' : 'text-gray-300'}`}>{u.name || "Unnamed User"}</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Individual User</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Deadline - Commented out from UI as requested
          <div className="space-y-6">
            <h3 className="text-white font-black text-2xl uppercase tracking-widest flex items-center gap-4">
              <span className="w-10 h-1 border-t-4 border-[#00f2aa]"></span>
              Set Deadline
            </h3>
            <div className="bg-[#1e293b] border border-gray-800 rounded-3xl p-10 max-w-md shadow-xl">
              <h4 className="text-[10px] font-black text-[#00f2aa] uppercase tracking-[0.3em] mb-4">Deadline (optional)</h4>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full bg-[#0f172a] border-2 border-gray-700 rounded-2xl px-6 py-5 text-gray-300 focus:outline-none focus:border-[#00f2aa] transition-all text-lg font-medium"
              />
            </div>
          </div>
          */}
        </div>

        {/* Footer */}
        <div className="px-10 py-4 border-t border-gray-800 bg-[#0f172a]/80 backdrop-blur-xl flex flex-col items-center gap-3">
          <button
            onClick={handleLaunch}
            disabled={!selectedTestId || selectedUserIds.length === 0 || loading}
            className={`w-full max-w-lg py-3 rounded-2xl text-[#0f172a] font-black text-lg uppercase tracking-[0.2em] transition-all duration-500 shadow-[0_0_30px_rgba(0,242,170,0.1)] flex items-center justify-center gap-4 group ${
              (!selectedTestId || selectedUserIds.length === 0 || loading)
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed shadow-none'
                : 'bg-[#00f2aa] hover:bg-[#00d496] hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,242,170,0.3)]'
            }`}
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Launch shorTest
                <FaRocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="text-gray-500 font-black text-[8px] uppercase tracking-[0.4em] hover:text-white transition-colors"
          >
            CANCEL AND RETURN TO DASHBOARD
          </button>

          {error && (
            <div className="text-red-500 font-black text-xs uppercase tracking-[0.2em] bg-red-500/10 px-6 py-3 rounded-full border border-red-500/20">
              Error: {error}
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Modal */}
      <SuccessNotificationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Test Assigned Successfully"
        message="The test has been assigned to the selected users."
        type="success"
        duration={3000}
      />
    </div>
  );
}
