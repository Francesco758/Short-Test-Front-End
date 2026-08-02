import React, { useState, useMemo, useEffect } from "react";
import { FaRocket, FaTimes, FaClipboardList, FaUsers, FaCheck, FaSearch, FaMagic, FaChevronDown, FaGlobe } from "react-icons/fa";
import { api } from "../../utils/api";
import SuccessNotificationModal from "../../models/SuccessNotificationModal";

export default function ShortTestModal({
  isOpen,
  onClose,
  tests = [],
  users = [],
  assignTestToUsers,
  theme = "dark",
  defaultTestId = null,
}) {
  const isLightTheme = theme === "light";
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [brief, setBrief] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTestList, setShowTestList] = useState(false);
  const [testQuery, setTestQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [dropdownRendered, setDropdownRendered] = useState(false);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    if (isOpen && defaultTestId) {
      setSelectedTestId(defaultTestId);
    } else if (!isOpen) {
      setSelectedTestId(null);
      setBrief("");
      setSelectedUserIds([]);
      setDeadline("");
      setError(null);
      setShowTestList(false);
      setTestQuery("");
      setUserQuery("");
      setGuestMode(false);
    }
  }, [isOpen, defaultTestId]);

  useEffect(() => {
    if (showTestList) {
      setDropdownRendered(true);
    } else {
      const timer = setTimeout(() => setDropdownRendered(false), 700);
      return () => clearTimeout(timer);
    }
  }, [showTestList]);
  const selectedTest = useMemo(
    () => tests.find(t => String(t.id) === String(selectedTestId)) || null,
    [tests, selectedTestId]
  );
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
    if (!selectedTestId) return;
    if (!guestMode && selectedUserIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      if (guestMode) {
        await api(`/api/company/tests/${selectedTest?.id ?? selectedTestId}/guest-access`, {
          method: 'POST',
          body: JSON.stringify({ enabled: true })
        });
      } else {
        await assignTestToUsers(
          selectedTest?.id ?? selectedTestId,
          selectedUserIds,
          { notify: true, brief: isCustomSelected ? brief : null, deadline: deadline || null }
        );
      }
      onClose();
      setShowSuccessModal(true);
    } catch (e) {
      setError(e?.message || "Failed to launch test");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`absolute inset-0 ${isLightTheme ? 'bg-black/60' : 'bg-black/70'}`} onClick={onClose} />
      <div className={`rplt-modal-content relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl border ${isLightTheme ? 'border-emerald-700 bg-white' : 'border-emerald-500 bg-[#09090B]'} flex flex-col`}>
        <style>{`
          .rplt-scrollbar-hide {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .rplt-scrollbar-hide::-webkit-scrollbar {
            width: 0px;
            height: 0px;
          }
          .rplt-dropdown-enter {
            animation: rplt-dropdown-in 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            transform-origin: top center;
          }
          @keyframes rplt-dropdown-in {
            from { opacity: 0; transform: scaleY(0.92) translateY(-6px); }
            to   { opacity: 1; transform: scaleY(1) translateY(0); }
          }
          .rplt-dropdown-exit {
            animation: rplt-dropdown-out 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            transform-origin: top center;
          }
          @keyframes rplt-dropdown-out {
            from { opacity: 1; transform: scaleY(1) translateY(0); }
            to   { opacity: 0; transform: scaleY(0.92) translateY(-6px); }
          }
          .rplt-dropdown-item {
            opacity: 0;
            transform: translateY(8px);
            animation: rplt-item-in 750ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          @keyframes rplt-item-in {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @media (max-width: 640px) {
            .rplt-modal-content {
              margin: 8px !important;
              max-height: 95vh !important;
              border-radius: 12px !important;
            }
            .rplt-modal-content .rplt-modal-body {
              padding: 14px !important;
              gap: 14px !important;
            }
            .rplt-modal-content .rplt-participants-header {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 8px !important;
            }
            .rplt-modal-content .rplt-participants-header .rplt-search-row {
              width: 100% !important;
              flex-wrap: wrap !important;
              gap: 6px !important;
            }
            .rplt-modal-content .rplt-participants-header .rplt-search-row input {
              flex: 1 !important;
              min-width: 0 !important;
              width: auto !important;
            }
            .rplt-modal-content .rplt-participants-header .rplt-search-row button {
              display: none !important;
            }
            .rplt-modal-content .rplt-footer {
              padding: 12px 14px !important;
            }
          }
        `}</style>
        <button
          onClick={onClose}
          className={`absolute top-1 right-6 z-50 w-8 h-8 flex items-center justify-center rounded-full ${isLightTheme ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-[#2e2e36]'} transition-colors`}
        >
          <FaTimes className="w-4 h-4" />
        </button>

        <div className="rplt-modal-body rplt-scrollbar-hide flex-1 min-h-0 p-6 space-y-6 overflow-auto pt-10 pb-8">
          {/* Select Short Test */}
          <div>
            <button
              onClick={() => setShowTestList(v => !v)}
              className={`w-full px-4 py-3 border rounded-md focus:outline-none flex items-center justify-between ${isLightTheme ? 'bg-[#22C58B] border-emerald-700 text-[#0F172A] focus:ring-2 focus:ring-emerald-500' : selectedTest ? 'bg-[#18181B] border-emerald-500 text-[#22C58B] focus:ring-0' : 'bg-[#18181B] border-[#2e2e36] text-gray-200 focus:ring-0'}`}
            >
              <span className="font-semibold">{selectedTest ? selectedTest.title : 'Select ShorTest'}</span>
              <FaChevronDown className={`w-4 h-4 transition-transform ${showTestList ? 'rotate-180' : ''} ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`} />
            </button>

            <div className={`mt-1 max-h-48 overflow-auto rounded-md border divide-y rplt-scrollbar-hide ${dropdownRendered ? '' : 'hidden'} ${showTestList ? 'rplt-dropdown-enter' : 'rplt-dropdown-exit'} ${isLightTheme ? 'border-emerald-200 bg-white divide-emerald-200' : 'border-[#2e2e36] bg-[#18181B] divide-[#2e2e36]'}`}>
                {normalTests.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setSelectedTestId(t.id); setShowTestList(false); }}
                    className={`rplt-dropdown-item w-full text-left px-4 py-3 transition-colors ${isLightTheme ? 'text-gray-900 hover:bg-emerald-50' : 'text-gray-200 hover:bg-[#202025]'}`}
                    style={{ animationDelay: `${idx * 90}ms` }}
                  >
                    {t.title}
                  </button>
                ))}
                {customAssigned && (
                  <button
                    key={customAssigned.id}
                    type="button"
                    onClick={() => { setSelectedTestId(customAssigned.id); setShowTestList(false); }}
                    className={`rplt-dropdown-item w-full text-left px-4 py-3 transition-colors flex items-center justify-between ${isLightTheme ? 'text-gray-900 hover:bg-emerald-50' : 'text-gray-200 hover:bg-[#202025]'}`}
                    style={{ animationDelay: `${normalTests.length * 90}ms` }}
                  >
                    <span>{customAssigned.title || 'Custom test'}</span>
                    <FaMagic className={`w-4 h-4 ${isLightTheme ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  </button>
                )}
                {normalTests.length === 0 && !customAssigned && (
                  <div className={`px-4 py-3 text-sm ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>No tests found</div>
                )}
              </div>
          </div>

          {isCustomSelected && (
            <div>
              <label className={`block text-xs font-medium ${isLightTheme ? 'text-gray-500' : 'text-gray-500'} mb-2`}>Manager Brief</label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={6}
                placeholder="Inserisci il brief personalizzato"
                className={`w-full px-4 py-3 ${isLightTheme ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#18181B] border-[#2e2e36] text-gray-200 placeholder-gray-500'} border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              />
            </div>
          )}



          {!guestMode && (
          <div className={`rounded-xl border ${isLightTheme ? 'border-emerald-700 bg-white' : 'border-[#2e2e36] bg-[#18181B]'} p-5`}>
            <div className="rplt-participants-header flex items-center justify-between mb-4">
              <div className={`flex items-center gap-2 ${isLightTheme ? 'text-gray-900' : 'text-[#22C58B]'} font-semibold`}>
                <span>Select participants</span>
              </div>
              <div className="rplt-search-row flex items-center gap-2">
                <div className="relative flex-1 min-w-0">
                  <FaSearch className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Search participants"
                    className={`w-full pl-9 pr-3 py-2 text-sm ${isLightTheme ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#18181B] border-[#2e2e36] text-gray-200 placeholder-gray-500'} border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>
                <button onClick={selectAllUsers} className={`px-3 py-2 text-xs font-bold uppercase tracking-widest border rounded-md ${isLightTheme ? 'border-gray-300 text-gray-600 hover:border-emerald-500 hover:text-emerald-600' : 'border-[#2a364a] text-gray-300 hover:border-emerald-500 hover:text-emerald-500'}`}>Select all</button>
                <button onClick={clearSelections} className={`px-3 py-2 text-xs font-bold uppercase tracking-widest border rounded-md ${isLightTheme ? 'border-gray-300 text-gray-600 hover:border-emerald-500 hover:text-emerald-600' : 'border-[#2a364a] text-gray-300 hover:border-emerald-500 hover:text-emerald-500'}`}>Clear</button>
              </div>
            </div>
            <div className="rplt-scrollbar-hide space-y-2 max-h-64 overflow-auto">
              {filteredUsers.map(u => {
                const selected = selectedUserIds.includes(u.id);
                const roleDisplay = (u.role || 'USER').toLowerCase().replace('_',' ');
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUser(u.id)}
                    className={`w-full text-left px-4 py-3 rounded-md border transition ${selected ? (isLightTheme ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-emerald-500 text-emerald-600 bg-[#18181B]') : (isLightTheme ? 'border-gray-200 text-gray-700 hover:border-emerald-500 bg-white' : 'border-[#2a364a] text-gray-200 hover:border-emerald-500')}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{u.name || 'Unnamed'}</span>
                      <span className={`text-xs px-2 py-1 rounded-md border ${isLightTheme ? 'border-gray-200 text-gray-500' : 'border-[#2a364a] text-gray-300'}`}>{roleDisplay}</span>
                    </div>
                  </button>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className={`text-sm ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>No users found</div>
              )}
            </div>
          </div>
          )}

          {/* Guest Mode Toggle */}
          <div className={`rounded-xl border ${isLightTheme ? 'border-emerald-700 bg-white' : 'border-[#2e2e36] bg-[#18181B]'} p-4`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={guestMode}
                onChange={(e) => setGuestMode(e.target.checked)}
                className="w-5 h-5 accent-emerald-500"
              />
              <div className="flex items-center gap-2">
                <FaGlobe className={`w-4 h-4 ${isLightTheme ? 'text-emerald-600' : 'text-emerald-400'}`} />
                <div>
                  <span className={`font-semibold text-sm ${isLightTheme ? 'text-gray-900' : 'text-gray-200'}`}>Guest Mode (Testing)</span>
                  <p className={`text-xs ${isLightTheme ? 'text-gray-500' : 'text-gray-500'}`}>Anyone with just a name can take this test. No email or password required.</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className={`rplt-footer px-6 py-5 border-t ${isLightTheme ? 'border-gray-200 bg-white' : 'border-[#2e2e36] bg-[#09090B]'}`}>
          <button
            onClick={handleLaunch}
            disabled={!selectedTestId || (!guestMode && selectedUserIds.length === 0) || loading}
            className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-sm font-bold tracking-widest border ${(!selectedTestId || (!guestMode && selectedUserIds.length === 0) || loading) ? (isLightTheme ? 'bg-emerald-50 text-emerald-300 border-emerald-200 cursor-not-allowed' : 'bg-transparent text-[#22C58B]/40 border border-[#22C58B]/30 cursor-not-allowed') : (isLightTheme ? 'bg-[#17be8e] text-[#0F172A] border-emerald-700 hover:bg-[#15a87d]' : 'bg-transparent text-[#22C58B] border border-[#22C58B] hover:bg-[#22C58B]/10')}`}
          >
            {loading ? (
              <div className={`w-4 h-4 border-2 ${isLightTheme ? 'border-white' : 'border-[#0a0e14]'} border-t-transparent rounded-full animate-spin`} />
            ) : (
              <FaRocket className="w-4 h-4" />
            )}
            <span>{guestMode ? 'Activate Guest Access' : 'Launch ShortTest'}</span>
          </button>
          {error && <div className={`pt-3 text-sm ${isLightTheme ? 'text-red-500' : 'text-red-400'}`}>{error}</div>}
        </div>
        {error && <div className={`px-6 pb-4 text-sm ${isLightTheme ? 'text-red-600' : 'text-red-600'}`}>{error}</div>}
      </div>

      {/* Success Notification Modal */}
      <SuccessNotificationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={guestMode ? "Guest Access Activated" : "Test Assigned Successfully"}
        message={guestMode ? "Anyone can now take this test by logging in as a guest with just their name." : "The test has been assigned to the selected users."}
        type="success"
        duration={3000}
      />
    </div>
  );
}
