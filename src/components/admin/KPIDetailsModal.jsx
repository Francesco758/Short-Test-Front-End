import React from 'react';
import { FaChartLine } from 'react-icons/fa';

export default function KPIDetailsModal({ isOpen, onClose, title = "Change KPI Details", data = {}, isLightTheme = false }) {
  if (!isOpen) return null;

  const {
    globalCkpi = 0,
    averages = {
      simplification: 0,
      originality: 0,
      feasibility: 0,
      criticalThinking: 0,
      proactivity: 0,
      impact: 0
    },
    componentTrends = {
      simplification: 0,
      originality: 0,
      feasibility: 0,
      criticalThinking: 0,
      proactivity: 0,
      impact: 0
    },
    totalReports = 0,
    trend = 0,
    lastUpdated = new Date().toLocaleString(),
    strengths = [],
    improvements = [],
    summary = ""
  } = data;

  const detailDescription = summary || `Overall company CKPI trend: ${trend > 0 ? '+' : ''}${trend}% from last month.`;
  const ckpiValueRaw = typeof globalCkpi === 'number' ? globalCkpi : 0;
  const ckpiValue = Number.isFinite(ckpiValueRaw) ? ckpiValueRaw : 0;
  const ckpiPct = Math.max(0, Math.min(100, Math.round(ckpiValue)));

  const rows = [
    { key: 'criticalThinking', label: 'Critical Thinking', value: averages.criticalThinking },
    { key: 'originality', label: 'Creative Thinking', value: averages.originality },
    { key: 'feasibility', label: 'Feasibility', value: averages.feasibility },
    { key: 'simplification', label: 'Simplification', value: averages.simplification },
    { key: 'proactivity', label: 'Proactivity', value: averages.proactivity },
    { key: 'impact', label: 'Impact', value: averages.impact }
  ];

  return (
    <div className={`fixed inset-0 ${isLightTheme ? 'bg-black/50' : 'bg-black/80'} flex items-center justify-center z-[9999]`} style={{ padding: '24px' }}>
      <style>{`
        @media (max-width: 640px) {
          .ckpi-row {
            grid-template-columns: 1fr 1fr auto !important;
            gap: 8px !important;
          }
        }
      `}</style>
      <div className={`${isLightTheme ? 'bg-white border-2 border-emerald-700' : 'bg-[#09090B] border border-emerald-500'} rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl`}>
        <div className={`px-7 py-6 border-b ${isLightTheme ? 'border-emerald-200' : 'border-gray-700'} flex items-center justify-between`}>
          <div className={`text-lg md:text-xl font-semibold ${isLightTheme ? 'text-gray-900' : 'text-gray-100'}`}>
            Global CKPI - detail view
          </div>
          <button
            onClick={onClose}
            className={`px-5 py-2 ${isLightTheme ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-black border border-gray-700 text-gray-200 hover:bg-gray-800'} rounded-xl text-[13px] font-black uppercase tracking-widest transition-colors`}
          >
            CHIUDI
          </button>
        </div>

        <div className="p-6 md:p-7">
          <div className={`rounded-2xl border ${isLightTheme ? 'border-emerald-700/30 bg-emerald-50/50' : 'border border-gray-700 bg-black/40'} p-6`}>
            <div className="flex items-center justify-between">
              <div className={`${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'} font-medium`}>Global CKPI</div>
              <div className={`font-bold tabular-nums ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-600'}`}>{ckpiPct}%</div>
            </div>
            <div className={`my-4 h-px ${isLightTheme ? 'bg-emerald-200' : 'bg-gray-700'}`} />
            <div className={`text-sm ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-400'} leading-relaxed`}>
              {detailDescription}
            </div>
          </div>

          <div className={`mt-6 rounded-2xl border ${isLightTheme ? 'border-emerald-700/30 bg-emerald-50/50' : 'border border-gray-700 bg-black/40'} p-6`}>
            <div className="space-y-3">
              {rows.map((row) => {
                const vRaw = typeof row.value === 'number' ? row.value : 0;
                const v = Number.isFinite(vRaw) ? vRaw : 0;
                const pct = Math.max(0, Math.min(100, Math.round(v)));

                return (
                  <div key={row.key} className="ckpi-row grid grid-cols-[1fr_140px_52px] items-center gap-4">
                    <div className={`${isLightTheme ? 'text-gray-700' : 'text-gray-200'} text-sm`}>{row.label}</div>
                    <div className={`h-[6px] rounded-full ${isLightTheme ? 'bg-gray-200' : 'bg-white/10'} overflow-hidden`}>
                      <div
                        className={`h-full ${isLightTheme ? 'bg-gray-200' : 'bg-white/20'}`}
                        style={{ width: '100%' }}
                      />
                      <div
                        className={`-mt-[6px] h-[6px] ${isLightTheme ? 'bg-emerald-500' : 'bg-emerald-500'} rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className={`text-sm font-bold tabular-nums text-right ${isLightTheme ? 'text-emerald-600' : 'text-emerald-600'}`}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}