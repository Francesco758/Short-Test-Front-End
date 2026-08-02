import React, { useState } from 'react';

export default function EmergingProblemsModal({ isOpen, onClose, categories = [], items, isLightTheme = false }) {
  if (!isOpen) return null;

  // Accept both `categories` (with reports) and `items` (flat) for backward compat
  const data = categories.length > 0 ? categories : (items || []);
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={`fixed inset-0 ${isLightTheme ? 'bg-black/50' : 'bg-black/80'} flex items-center justify-center z-[9999]`} style={{ padding: '24px' }}>
      <div className={`${isLightTheme ? 'bg-white border-2 border-emerald-700' : 'bg-[#09090B] border border-emerald-500'} rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col`}>
        <div className={`px-7 py-6 border-b ${isLightTheme ? 'border-emerald-200' : 'border-gray-700'} flex items-start justify-between`}>
          <div>
            <div className={`text-lg md:text-xl font-semibold ${isLightTheme ? 'text-gray-900' : 'text-gray-100'}`}>Top Problem Clusters</div>
            <div className={`text-sm ${isLightTheme ? 'text-gray-500' : 'text-gray-400'} mt-1`}>Problems grouped by category</div>
          </div>
          <button
            onClick={onClose}
            className={`px-5 py-2 ${isLightTheme ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-black border border-gray-700 text-gray-200 hover:bg-gray-800'} rounded-xl text-[13px] font-black uppercase tracking-widest transition-colors`}
          >
            CHIUDI
          </button>
        </div>

        <div className="p-6 md:p-7">
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
            {data.length === 0 ? (
              <div className={`text-center py-12 ${isLightTheme ? 'text-gray-400' : 'text-gray-600'} italic`}>
                No emerging problems identified yet.
              </div>
            ) : (
              data.map((item, idx) => {
                const title = item?.cluster || item?.key?.replace(/_/g, ' ') || `Problem ${idx + 1}`;
                const key = item?.key || `item-${idx}`;
                const occurrence = typeof item?.count === 'number' ? item.count : 0;
                const feasibilityRaw = typeof item?.avgFinal === 'number' ? item.avgFinal : (typeof item?.avgFeasibility === 'number' ? item.avgFeasibility : 0);
                const feasibility = Math.round(Number.isFinite(feasibilityRaw) ? feasibilityRaw : 0);
                const reports = item?.reports || [];
                const isExpanded = !!expanded[key];

                return (
                  <div
                    key={`${key}-${idx}`}
                    className={`rounded-xl border ${isLightTheme ? 'border-emerald-700/30 bg-emerald-50/50' : 'border-gray-700 bg-black/40'} overflow-hidden`}
                  >
                    <div
                      className={`p-4 cursor-pointer transition-colors ${isLightTheme ? 'hover:bg-gray-100' : 'hover:bg-gray-800/40'}`}
                      onClick={() => toggleExpand(key)}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`${isLightTheme ? 'text-gray-800' : 'text-gray-100'} font-semibold`}>{title}</div>
                      </div>
                      <div className={`mt-1 text-xs ${isLightTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                        Occurrences:{' '}
                        <span className="text-emerald-600 font-bold">{occurrence}</span>
                      </div>
                    </div>
                    {isExpanded && reports.length > 0 && (
                      <div className={`px-4 pb-4 space-y-2 border-t ${isLightTheme ? 'border-emerald-200' : 'border-gray-700'}`}>
                        {reports.map((report, rIdx) => (
                          <div key={report.id ?? rIdx} className={`mt-2 rounded-lg p-3 ${isLightTheme ? 'bg-white border border-emerald-700/20' : 'bg-gray-800/60 border border-gray-700'}`}>
                            <p className={`text-sm leading-relaxed ${isLightTheme ? 'text-gray-700' : 'text-gray-300'}`}>
                              {report.summary || 'No description available'}
                            </p>
                            {report.date && (
                              <p className={`mt-1 text-[10px] ${isLightTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                                {new Date(report.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
