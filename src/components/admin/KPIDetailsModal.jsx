import React from 'react';
import { FaTimes, FaChartLine, FaInfoCircle, FaLightbulb, FaExclamationTriangle } from 'react-icons/fa';

export default function KPIDetailsModal({ isOpen, onClose, title = "Change KPI Details", data = {} }) {
  if (!isOpen) return null;

  const {
    averages = {
      simplification: 0,
      originality: 0,
      feasibility: 0,
      criticalThinking: 0,
      proactivity: 0
    },
    componentTrends = {
      simplification: 0,
      originality: 0,
      feasibility: 0,
      criticalThinking: 0,
      proactivity: 0
    },
    totalReports = 0,
    trend = 0,
    lastUpdated = new Date().toLocaleString(),
    strengths = [],
    improvements = [],
    summary = ""
  } = data;

  const allComponents = {
    simplification: 'Simplification',
    originality: 'Originality', 
    feasibility: 'Feasibility',
    criticalThinking: 'Critical Thinking',
    proactivity: 'Proactivity'
  };

  const getTrendIndicator = (trendValue) => {
    if (trendValue > 0) return { icon: '↑', color: 'text-green-600', label: 'improved' };
    if (trendValue < 0) return { icon: '↓', color: 'text-red-600', label: 'worsened' };
    return { icon: '→', color: 'text-gray-500', label: 'stable' };
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-[#0f172a] rounded-[40px] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-800 flex flex-col">
        {/* Header */}
        <div className="px-10 py-8 border-b border-gray-800 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-[#1e293b] border border-gray-700 rounded-2xl flex items-center justify-center shadow-inner">
              <FaChartLine className="w-6 h-6 text-[#00f2aa]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{title}</h2>
              {trend !== 0 && (
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mt-1">
                  <span className={trend > 0 ? 'text-[#00f2aa]' : 'text-red-500'}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% trend
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-all"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1e293b] border border-gray-800 rounded-2xl p-6 shadow-xl group hover:border-gray-700 transition-all">
              <div className="text-3xl font-black text-white mb-1">{totalReports}</div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Reports</div>
            </div>
            <div className="bg-[#1e293b] border border-gray-800 rounded-2xl p-6 shadow-xl group hover:border-gray-700 transition-all">
              <div className={`text-3xl font-black mb-1 ${trend >= 0 ? 'text-[#00f2aa]' : 'text-red-500'}`}>
                {trend !== 0 ? `${trend > 0 ? '+' : ''}${trend}%` : '—'}
              </div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Trend</div>
            </div>
            <div className="bg-[#1e293b] border border-gray-800 rounded-2xl p-6 shadow-xl group hover:border-gray-700 transition-all">
              <div className="text-sm font-bold text-white mb-1 truncate">{lastUpdated}</div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Updated</div>
            </div>
          </div>

          {/* Component Averages & Trends */}
          <div className="bg-[#1e293b] rounded-[32px] border border-gray-800 p-10 shadow-xl">
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-10 flex items-center gap-4">
              <span className="w-8 h-1 bg-[#00f2aa]"></span>
              CKPI Component Analysis
            </h3>
            
            <div className="space-y-8">
              {Object.entries(allComponents).map(([key, label]) => {
                const score = averages[key] || 0;
                const compTrend = componentTrends[key] || 0;
                const indicator = getTrendIndicator(compTrend);
                const pct = Math.round(score);
                
                return (
                  <div key={key} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-black text-gray-400 uppercase tracking-widest">{label}</div>
                      <div className="flex items-center gap-6">
                        <div className="text-lg font-black text-white">{pct}%</div>
                        <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                          compTrend > 0 ? 'text-[#00f2aa] border-[#00f2aa]/20 bg-[#00f2aa]/5' : 
                          compTrend < 0 ? 'text-red-500 border-red-500/20 bg-red-500/5' : 
                          'text-gray-500 border-gray-800 bg-gray-800/50'
                        }`}>
                          <span>{indicator.icon}</span>
                          <span>{indicator.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-2.5 bg-[#0f172a] rounded-full border border-gray-800 overflow-hidden">
                      <div 
                        className="h-full bg-[#00f2aa] rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Insights - Summary, Strengths, Weaknesses */}
          {(summary || strengths.length > 0 || improvements.length > 0) && (
            <div className="space-y-8">
              {summary && (
                <div className="bg-[#1e293b] rounded-[32px] border border-gray-800 p-10 shadow-xl group hover:border-gray-700 transition-all">
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-4">
                    <span className="w-8 h-1 bg-[#00f2aa]"></span>
                    AI Performance Summary
                  </h3>
                  <p className="text-lg font-medium leading-relaxed text-gray-300 group-hover:text-white transition-colors">{summary}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {strengths.length > 0 && (
                  <div className="bg-[#1e293b] border border-gray-800 rounded-[32px] p-8 shadow-xl hover:border-[#00f2aa]/30 transition-all group">
                    <h4 className="flex items-center gap-3 text-[#00f2aa] font-black uppercase tracking-widest text-xs mb-6">
                      <FaLightbulb className="w-4 h-4" />
                      Key Strengths
                    </h4>
                    <ul className="space-y-4">
                      {strengths.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-4 text-gray-300 group-hover:text-white transition-colors">
                          <span className="mt-2 w-1.5 h-1.5 bg-[#00f2aa] rounded-full flex-shrink-0" />
                          <span className="text-sm font-medium leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {improvements.length > 0 && (
                  <div className="bg-[#1e293b] border border-gray-800 rounded-[32px] p-8 shadow-xl hover:border-red-500/30 transition-all group">
                    <h4 className="flex items-center gap-3 text-red-500 font-black uppercase tracking-widest text-xs mb-6">
                      <FaExclamationTriangle className="w-4 h-4" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-4">
                      {improvements.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-4 text-gray-300 group-hover:text-white transition-colors">
                          <span className="mt-2 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                          <span className="text-sm font-medium leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Information Panel */}
          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-gray-800 rounded-[32px] p-10 shadow-2xl">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-[#0f172a] border border-gray-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FaInfoCircle className="w-6 h-6 text-[#00f2aa]" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-black text-white uppercase tracking-widest">About CKPI Components</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                  {[
                    { label: 'Simplification', desc: 'Ability to break down complex problems into manageable parts' },
                    { label: 'Originality', desc: 'Capacity for creative and innovative thinking' },
                    { label: 'Feasibility', desc: 'Assessment of practical implementation potential' },
                    { label: 'Critical Thinking', desc: 'Analytical reasoning and logical evaluation' },
                    { label: 'Proactivity', desc: 'Initiative and forward-thinking approach' }
                  ].map((comp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="font-black text-[#00f2aa] uppercase tracking-widest text-[10px]">{comp.label}</div>
                      <div className="text-gray-400 font-medium leading-relaxed">{comp.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-gray-800 bg-[#0f172a]/80 backdrop-blur-xl flex justify-center">
          <button
            onClick={onClose}
            className="px-12 py-3 bg-[#00f2aa] text-[#0f172a] font-black uppercase tracking-widest rounded-xl hover:bg-[#00d496] transition-all shadow-[0_0_20px_rgba(0,242,170,0.2)]"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}