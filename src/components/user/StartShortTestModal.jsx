import React from 'react';

/**
 * Modal shown when an employee clicks "Start a shorTest".
 *
 * - If several standard shorTests are available, they are listed here so the
 *   employee can choose one.
 * - Pending tests are resumed from the dashboard cards at the bottom of the
 *   page, not from this modal.
 * - When the pending-test limit is reached, starting a new one is disabled with
 *   an explanation (the backend enforces the same rule).
 */
export default function StartShortTestModal({
  isOpen,
  onClose,
  isLightTheme = false,
  availableTests = [],
  gate = { pendingCount: 0, pendingLimit: 5, canStartNew: true },
  loading = false,
  starting = false,
  onStartNew
}) {
  if (!isOpen) return null;

  const pendingLimit = gate?.pendingLimit ?? 5;
  const pendingCount = gate?.pendingCount ?? 0;
  const canStartNew = gate?.canStartNew !== false;
  const newDisabled = !canStartNew || starting || loading;

  const stateLabel = (test) => {
    if (test.state === 'IN_PROGRESS') return 'in progress';
    if (test.state === 'PENDING') return `${test.pendingCount} pending`;
    if (test.state === 'COMPLETED') return test.completedCount > 1 ? `${test.completedCount} completed` : 'completed';
    return 'new';
  };

  return (
    <div className={`fixed inset-0 ${isLightTheme ? 'bg-black/50' : 'bg-black/80'} flex items-center justify-center z-[9999] p-4`}>
      <div className={`${isLightTheme ? 'bg-white' : 'bg-[#18181B]'} border rounded-xl ${isLightTheme ? 'border-emerald-700' : 'border-emerald-500'} max-w-2xl w-full overflow-hidden shadow-xl`}>
        <div className={`px-6 py-5 border-b ${isLightTheme ? 'border-gray-200' : 'border-gray-700'} flex items-center justify-between`}>
          <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>Select a shorTest</h3>
          <button
            onClick={onClose}
            className={`text-lg leading-none ${isLightTheme ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-white'}`}
          >
            &times;
          </button>
        </div>

        <div className="p-6 max-h-[480px] overflow-y-auto space-y-5">
          {/* Pending limit notice */}
          {!canStartNew && (
            <div className={`p-3 rounded-xl border text-xs ${isLightTheme ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-900/20 border-amber-700 text-amber-300'}`}>
              You have {pendingCount} pending tests (limit {pendingLimit}). Complete at least one to start a new shorTest.
            </div>
          )}

          {/* Available shorTests */}
          <div>
            <p className={`text-[10px] uppercase tracking-widest mb-2 ${isLightTheme ? 'text-gray-500' : 'text-gray-500'}`}>
              Start a new shorTest
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : availableTests.length === 0 ? (
              <p className={`text-xs text-center py-6 ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                No shorTest is available for you yet. Please contact your admin.
              </p>
            ) : (
              <div className="space-y-3">
                {availableTests.map(test => (
                  <div
                    key={test.testId}
                    className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${isLightTheme ? 'border-emerald-700 hover:bg-gray-50' : 'border-emerald-500 hover:bg-[#202025]'}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>{test.title}</p>
                      <p className={`text-xs mt-1 ${isLightTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                        {stateLabel(test)}
                        {test.estimatedDuration ? ` · ${test.estimatedDuration}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => onStartNew?.(test.testId)}
                      disabled={newDisabled}
                      className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl border transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0 ${isLightTheme ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'}`}
                    >
                      {starting ? '...' : 'Start new'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
