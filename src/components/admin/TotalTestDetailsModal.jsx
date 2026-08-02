import React from 'react';

export default function TotalTestDetailsModal({ isOpen, onClose, data = {}, isLightTheme = false }) {
  if (!isOpen) return null;

  const {
    totalTests = 0,
    peopleTotal = 0,
    organizationsTotal = 0,
    countriesTotal = 0,
    peopleDetail = [],
    organizationsDetail = [],
    countriesDetail = []
  } = data;

  const formatList = (items) => items.filter(Boolean).join(' · ');

  return (
    <div className={`fixed inset-0 ${isLightTheme ? 'bg-black/50' : 'bg-black/80'} flex items-center justify-center z-[9999]`} style={{ padding: '24px' }}>
      <div className={`${isLightTheme ? 'bg-white border-2 border-emerald-700' : 'bg-[#09090B] border border-emerald-500'} rounded-2xl max-w-5xl w-full max-h-[calc(100dvh-2rem)] overflow-hidden shadow-2xl flex flex-col`}>
        <div className={`px-7 py-6 border-b ${isLightTheme ? 'border-emerald-200' : 'border-gray-700'} flex items-start justify-between`}>
          <div>
            <div className={`text-lg md:text-xl font-semibold ${isLightTheme ? 'text-gray-900' : 'text-gray-100'}`}>Total test - detail view</div>
            <div className={`text-sm ${isLightTheme ? 'text-gray-500' : 'text-gray-400'} mt-1`}>People, organizations and countries breakdown</div>
          </div>
          <button
            onClick={onClose}
            className={`px-5 py-2 ${isLightTheme ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-black border border-gray-700 text-gray-200 hover:bg-gray-800'} rounded-xl text-[13px] font-black uppercase tracking-widest transition-colors`}
          >
            CHIUDI
          </button>
        </div>

        <div className="p-6 md:p-7 overflow-y-auto">
          <div className={`rounded-2xl border ${isLightTheme ? 'border-emerald-700/30 bg-emerald-50/50' : 'border-gray-700 bg-black/40'} p-6`}>
            <div className="flex items-center justify-between">
              <div className={`${isLightTheme ? 'text-gray-700' : 'text-gray-200'} font-medium`}>Total test</div>
              <div className={`font-bold tabular-nums ${isLightTheme ? 'text-emerald-600' : 'text-emerald-600'}`}>{Math.round(totalTests)}</div>
            </div>
            <div className={`my-4 h-px ${isLightTheme ? 'bg-emerald-200' : 'bg-gray-700'}`} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <div className={`${isLightTheme ? 'text-gray-500' : 'text-gray-400'} text-sm`}>People</div>
                <div className={`text-sm font-bold tabular-nums ${isLightTheme ? 'text-emerald-600' : 'text-emerald-600'}`}>{peopleTotal}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className={`${isLightTheme ? 'text-gray-500' : 'text-gray-400'} text-sm`}>Organizations</div>
                <div className={`text-sm font-bold tabular-nums ${isLightTheme ? 'text-emerald-600' : 'text-emerald-600'}`}>{organizationsTotal}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className={`${isLightTheme ? 'text-gray-500' : 'text-gray-400'} text-sm`}>Countries</div>
                <div className={`text-sm font-bold tabular-nums ${isLightTheme ? 'text-emerald-600' : 'text-emerald-600'}`}>{countriesTotal}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4 pr-2">
            <div className={`rounded-2xl border ${isLightTheme ? 'border-emerald-700/30 bg-emerald-50/50' : 'border-gray-700 bg-black/40'} p-6`}>
              <div className={`text-sm font-black tracking-widest ${isLightTheme ? 'text-gray-900' : 'text-gray-100'} uppercase`}>PEOPLE DETAIL</div>
              <div className={`mt-4 ${isLightTheme ? 'text-gray-600' : 'text-gray-200'}`}>{formatList(peopleDetail)}</div>
            </div>

            <div className={`rounded-2xl border ${isLightTheme ? 'border-emerald-700/30 bg-emerald-50/50' : 'border-gray-700 bg-black/40'} p-6`}>
              <div className={`text-sm font-black tracking-widest ${isLightTheme ? 'text-gray-900' : 'text-gray-100'} uppercase`}>ORGANIZATIONS DETAIL</div>
              <div className={`mt-4 ${isLightTheme ? 'text-gray-600' : 'text-gray-200'}`}>{formatList(organizationsDetail)}</div>
            </div>

            <div className={`rounded-2xl border ${isLightTheme ? 'border-emerald-700/30 bg-emerald-50/50' : 'border-gray-700 bg-black/40'} p-6`}>
              <div className={`text-sm font-black tracking-widest ${isLightTheme ? 'text-gray-900' : 'text-gray-100'} uppercase`}>COUNTRIES DETAIL</div>
              <div className={`mt-4 ${isLightTheme ? 'text-gray-600' : 'text-gray-200'}`}>{formatList(countriesDetail)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
