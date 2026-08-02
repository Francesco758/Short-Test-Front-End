// src/components/manager/ReportsModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../utils/api';
import ReportScreen from '../report/ReportScreen';
import KPIAnimatedNumber from '../report/KPIAnimatedNumber';
import KPIBarChart from '../report/KPIBarChart';
import SuccessNotificationModal from "../../models/SuccessNotificationModal";
import { 
  FaDownload, 
  FaShare, 
  FaPrint, 
  FaSync, 
  FaExclamationTriangle, 
  FaHistory, 
  FaChartLine,
  FaTimes,
  FaUser,
  FaBolt,
  FaCalendar,
  FaCheckCircle
} from 'react-icons/fa';

const CKPI_LABELS = {
  simplification: 'Simplification',
  originality: 'Originality',
  feasibility: 'Feasibility',
  criticalThinking: 'Critical Thinking',
  proactivity: 'Proactivity',
  impact: 'Impact'
};

export default function ReportsModal({ isOpen, onClose, userId, userName, theme = "dark" }) {
  const isLightTheme = theme === "light";
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalSummary, setGlobalSummary] = useState(null);

  // Derive user-specific global CKPI from the user's own reports
  const userGlobalCKPI = useMemo(() => {
    const all = reports.filter(r => r.kpis?.final != null);
    const completed = all.filter(r => r.summary && r.kpis?.final > 0);
    if (completed.length === 0) {
      return { globalCkpi: 0, averages: {}, globalSummary: null, globalStrengths: [], globalImprovements: [] };
    }

    const globalCkpi = Math.round(completed.reduce((sum, r) => sum + r.kpis.final, 0) / completed.length);

    const allComponents = completed.reduce((acc, r) => {
      const c = r.kpis?.components || {};
      Object.keys(c).forEach(key => {
        if (typeof c[key] === 'number') acc[key] = (acc[key] || 0) + c[key];
      });
      return acc;
    }, {});
    const averages = {};
    Object.keys(allComponents).forEach(key => {
      averages[key] = Math.round(allComponents[key] / completed.length);
    });

    const sortedByDate = [...completed].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const globalSummary = sortedByDate[0]?.summary || null;

    const recent = sortedByDate.slice(0, 5);
    const aggregateList = (key) => {
      const items = recent.flatMap(r => r.kpis?.[key] || []);
      if (!items.length) return [];
      const counts = items.reduce((acc, item) => { acc[item] = (acc[item] || 0) + 1; return acc; }, {});
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([item]) => item).slice(0, 3);
    };

    return {
      globalCkpi,
      averages,
      globalSummary,
      globalStrengths: aggregateList('strengths'),
      globalImprovements: aggregateList('improvements')
    };
  }, [reports]);
  
  // Success notification state
  const [successNotification, setSuccessNotification] = useState({
    isOpen: false,
    title: "",
    message: ""
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      // Reset selected report when userId changes
      setSelectedReport(null);
      setReports([]);
      loadUserReports();
    }
  }, [isOpen, userId]);

  const loadUserReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [userReports, gs] = await Promise.all([
        api('/api/company/reports/user-reports'),
        userId ? api(`/api/company/reports/user/${userId}/global-summary`) : Promise.resolve({ summary: null })
      ]);
      setGlobalSummary(gs?.summary || null);
      
      // Filter reports for this specific user
      const userSpecificReports = userReports.filter(report => 
        report.userTest?.userId === userId
      );
      
      setReports(userSpecificReports);
      
      // Auto-select the first report if available (don't load detailed yet to avoid double loading)
      if (userSpecificReports.length > 0 && !selectedReport) {
        const firstReport = userSpecificReports[0];
        // Load detailed report after a short delay to avoid conflicts
        setTimeout(() => {
          if (firstReport.userTestId) {
            loadDetailedReport(firstReport.userTestId);
          } else {
            setSelectedReport(firstReport);
          }
        }, 100);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Failed to load user reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserReports();
    setRefreshing(false);
  };

  const handleExportPDF = (report) => {
    // Simulate PDF export for specific report
    setSuccessNotification({
      isOpen: true,
      title: "PDF Export",
      message: `PDF export for report ${report.id} would be implemented here!`
    });
  };

  const handleShareReport = (report) => {
    if (navigator.share) {
      navigator.share({
        title: `Test Report - ${report.userTest?.test?.title || 'Unknown Test'}`,
        text: `Test Score: ${report.kpis?.final || 0}% - ${report.summary?.substring(0, 100)}...`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSuccessNotification({
        isOpen: true,
        title: "Link Copied",
        message: "Report link copied to clipboard!"
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const loadDetailedReport = async (userTestId) => {
    try {
      // Don't set loading here to avoid conflicts with list loading
      setError(null);
      const detailedReport = await api(`/api/company/reports/user-test/${userTestId}`);
      
      // Verify this report belongs to the current user
      if (detailedReport && detailedReport.userTest?.userId === userId) {
        setSelectedReport(detailedReport);
      } else if (detailedReport) {
        // If report exists but doesn't match user, show error
        setError('Report not found for this user.');
        setSelectedReport(null);
      } else {
        setError('Report not found.');
        setSelectedReport(null);
      }
    } catch (err) {
      console.error('Failed to load detailed report:', err);
      setError(err?.error || err?.message || 'Failed to load detailed report.');
      setSelectedReport(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <style>{HIDE_SCROLLBAR_STYLE}</style>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className={`reports-modal-container relative ${isLightTheme ? 'bg-white border-emerald-700' : 'bg-[#09090B] border-emerald-500'} border rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100`}>
        
        {/* Header - Full width top bar */}
        <div className={`reports-modal-header border-b px-6 py-4 ${isLightTheme ? 'border-emerald-200 bg-white' : 'border-[#2e2e36] bg-[#09090B]'}`}>
          <div className="header-top flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isLightTheme ? 'bg-emerald-500' : 'bg-emerald-500'}`}>
                <FaChartLine className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className={`text-lg font-bold truncate ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                  {userName || selectedReport?.userTest?.user?.name || 'User'} report
                </h3>
              </div>
            </div>

            <div className="header-buttons flex items-center gap-2 flex-shrink-0">
              {selectedReport && (
                <>
                  <button
                    onClick={() => handleExportPDF(selectedReport)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition-colors ${isLightTheme ? 'bg-[#17be8e] text-white hover:bg-[#15a87d]' : 'bg-emerald-500 text-[#0a0e14] hover:bg-emerald-600'}`}
                  >
                    <FaDownload className="w-4 h-4" />
                    <span className="btn-label">Export</span>
                  </button>
                  <button
                    onClick={() => handleShareReport(selectedReport)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition-colors ${isLightTheme ? 'bg-white border border-emerald-700 text-[#0F172A] hover:bg-gray-50' : 'bg-[#18181B] border border-[#2e2e36] text-gray-300 hover:bg-[#202025]'}`}
                  >
                    <FaShare className="w-4 h-4" />
                    <span className="btn-label">Share</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition-colors ${isLightTheme ? 'bg-white border border-emerald-700 text-[#0F172A] hover:bg-gray-50' : 'bg-[#18181B] border border-[#2e2e36] text-gray-300 hover:bg-[#202025]'}`}
                  >
                    <FaPrint className="w-4 h-4" />
                    <span className="btn-label">Print</span>
                  </button>
                </>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition-colors disabled:opacity-50 ${isLightTheme ? 'bg-white border border-emerald-700 text-[#0F172A] hover:bg-gray-50' : 'bg-[#18181B] border border-[#2e2e36] text-gray-300 hover:bg-[#202025]'}`}
              >
                <FaSync className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="btn-label">Refresh</span>
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${isLightTheme ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-[#202025] text-gray-400'}`}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Three columns */}
        <div className="reports-modal-content flex flex-col md:flex-row h-[calc(90vh-80px)]">

          {/* Left Column - Global CKPI (fixed) */}
          <div className={`w-full md:flex-1 border-r overflow-y-auto flex-shrink-0 hide-scrollbar ${isLightTheme ? 'border-emerald-200 bg-white' : 'border-[#2e2e36] bg-[#09090B]'}`}>
            <div className="p-4">
              <h3 className={`font-extrabold uppercase tracking-wider mb-4 text-center ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>TOTAL CHANGE KPI SCORE</h3>
              <div className="text-center mb-5">
                <KPIAnimatedNumber value={Math.round(userGlobalCKPI.globalCkpi ?? 0)} theme={theme} />
              </div>
              <KPIBarChart
                values={Object.keys(CKPI_LABELS).map(k => Math.round(userGlobalCKPI.averages?.[k] ?? 0))}
                labels={Object.keys(CKPI_LABELS).map(k => CKPI_LABELS[k])}
                theme={theme}
              />
              {(globalSummary || userGlobalCKPI.globalSummary) && (
                <div className={`mt-5 pt-4 border-t ${isLightTheme ? 'border-emerald-600' : 'border-[#2e2e36]'}`}>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>Overall Insight</div>
                  <div className={`text-xs leading-relaxed rounded-lg p-3 ${isLightTheme ? 'bg-[#22C58B] text-black' : 'bg-[#202025] text-gray-400'}`}>
                    {globalSummary || userGlobalCKPI.globalSummary}
                  </div>
                </div>
              )}
              {(userGlobalCKPI.globalStrengths?.length > 0 || userGlobalCKPI.globalImprovements?.length > 0) && (
                <div className={`mt-5 pt-4 border-t space-y-4 ${isLightTheme ? 'border-emerald-600' : 'border-[#2e2e36]'}`}>
                  {userGlobalCKPI.globalStrengths?.length > 0 && (
                    <div className={`rounded-lg p-3 ${isLightTheme ? 'bg-[#22C58B]' : 'bg-[#202025]'}`}>
                      <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isLightTheme ? 'text-black' : 'text-emerald-500'}`}>Strengths</div>
                      <ul className="space-y-1">
                        {userGlobalCKPI.globalStrengths.map((s, i) => (
                          <li key={i} className={`text-xs flex items-start gap-1.5 ${isLightTheme ? 'text-black' : 'text-gray-300'}`}>
                            <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLightTheme ? 'bg-black' : 'bg-emerald-500'}`} />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {userGlobalCKPI.globalImprovements?.length > 0 && (
                    <div className={`rounded-lg p-3 ${isLightTheme ? 'bg-[#22C58B]' : 'bg-[#202025]'}`}>
                      <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isLightTheme ? 'text-black' : 'text-amber-400'}`}>Weaknesses</div>
                      <ul className="space-y-1">
                        {userGlobalCKPI.globalImprovements.map((s, i) => (
                          <li key={i} className={`text-xs flex items-start gap-1.5 ${isLightTheme ? 'text-black' : 'text-gray-300'}`}>
                            <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLightTheme ? 'bg-black' : 'bg-amber-500'}`} />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Middle Column - Reports List */}
          <div className={`w-full md:w-64 border-r overflow-y-auto flex-shrink-0 hide-scrollbar ${isLightTheme ? 'border-emerald-200 bg-white' : 'border-[#2e2e36] bg-[#09090B]'}`}>
            <div className="p-4">
              <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                <FaHistory className={`w-4 h-4 ${isLightTheme ? 'text-emerald-600' : 'text-emerald-500'}`} />
                Test History ({reports.length})
              </h3>
              
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className={`h-20 rounded-lg ${isLightTheme ? 'bg-emerald-100' : 'bg-[#18181B]'}`}></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <FaExclamationTriangle className="w-8 h-8 mx-auto mb-2" />
                  {error}
                </div>
              ) : reports.length === 0 ? (
                <div className={`text-center py-8 ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-500'}`}>
                  <FaChartLine className={`w-8 h-8 mx-auto mb-2 ${isLightTheme ? 'text-gray-300' : 'text-gray-600'}`} />
                  <p>No test reports found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map(report => {
                    const isSelected = selectedReport?.id === report.id;
                    return (
                      <div
                        key={report.id}
                        onClick={() => {
                          if (!isSelected) {
                            loadDetailedReport(report.userTestId);
                          }
                        }}
                        className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                          isSelected
                            ? (isLightTheme ? 'border-emerald-700 bg-[#22C58B] shadow-md' : 'border-emerald-500 bg-[#18181B] shadow-md')
                            : (isLightTheme ? 'border-emerald-200 bg-white hover:border-emerald-500' : 'border-[#2e2e36] bg-[#18181B] hover:border-emerald-500')
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-semibold text-sm truncate ${
                            isSelected
                              ? (isLightTheme ? 'text-[#0F172A]' : 'text-white')
                              : (isLightTheme ? 'text-[#0F172A]' : 'text-gray-200')
                          }`}>
                            {report.userTest?.test?.title || 'Unknown Test'}
                          </h4>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            (report.kpis?.final || 0) >= 80
                              ? (isLightTheme ? 'bg-white text-emerald-800' : 'bg-emerald-900/30 text-emerald-400')
                              : (report.kpis?.final || 0) >= 60
                                ? (isLightTheme ? 'bg-white text-yellow-800' : 'bg-yellow-900/30 text-yellow-400')
                                : (isLightTheme ? 'bg-white text-red-800' : 'bg-red-900/30 text-red-400')
                          }`}>
                            {report.kpis?.final || 0}%
                          </span>
                        </div>
                        
                        <div className={`flex items-center gap-2 text-xs mb-2 ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-500'}`}>
                          <FaCalendar className="w-3 h-3" />
                          <span>{new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        
                        <div className={`text-xs line-clamp-2 ${
                          isSelected
                            ? (isLightTheme ? 'text-[#0F172A]' : 'text-gray-300')
                            : (isLightTheme ? 'text-gray-600' : 'text-gray-500')
                        }`}>
                          {report.summary?.substring(0, 100) || 'No summary available'}...
                        </div>
                        
                        {isSelected && (
                          <div className={`mt-2 pt-2 border-t ${isLightTheme ? 'border-emerald-600' : 'border-emerald-500'}`}>
                            <div className={`flex items-center gap-1 text-xs font-medium ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'}`}>
                              <FaCheckCircle className="w-3 h-3" />
                              <span>Viewing</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Report Detail View */}
          <div className={`flex-1 overflow-y-auto hide-scrollbar ${isLightTheme ? 'bg-white' : 'bg-[#09090B]'}`}>
            {selectedReport ? (
              <div className="p-6">
                {/* Report Screen Component */}
                <div className={`rounded-2xl p-6 mb-6 shadow-sm border ${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'bg-[#18181B] border-[#2e2e36]'}`}>
                  <ReportScreen 
                    report={{
                      percentage: selectedReport.kpis?.final || 0,
                      summary: selectedReport.summary || 'No summary available',
                      kpis: selectedReport.kpis,
                      detailedAnalysis: selectedReport.detailedAnalysis
                    }}
                    theme={theme}
                  />
                </div>

                {/* Evaluation Reasoning + Version Info */}
                {/* {selectedReport.kpis?.evaluationMetadata?.reasoning ||
                  selectedReport.kpis?.evaluationMetadata?.modelVersion ||
                  selectedReport.kpis?.evaluationMetadata?.promptVersion ||
                  selectedReport.kpis?.evaluationMetadata?.scoringVersion) && (
                  <div className={`rounded-2xl p-6 shadow-sm border mb-6 ${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'bg-[#18181B] border-[#2e2e36]'}`}>
                    {selectedReport.kpis?.evaluationMetadata?.reasoning && (
                      <div>
                        <h5 className={`text-sm font-semibold mb-2 ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>Evaluation Rationale</h5>
                        <p className={`text-sm leading-relaxed ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-300'}`}>
                          {selectedReport.kpis.evaluationMetadata.reasoning}
                        </p>
                      </div>
                    )}
                    {(selectedReport.kpis?.evaluationMetadata?.modelVersion ||
                      selectedReport.kpis?.evaluationMetadata?.promptVersion ||
                      selectedReport.kpis?.evaluationMetadata?.scoringVersion) && (
                      <div className={`${selectedReport.kpis?.evaluationMetadata?.reasoning ? 'mt-4 pt-4 border-t' : ''} ${isLightTheme ? 'border-emerald-600' : 'border-[#2e2e36]'}`}>
                        <h5 className={`text-sm font-semibold mb-2 ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>Version Info</h5>
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 text-xs ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-400'}`}>
                          <div>
                            <div className={`font-medium ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>Model</div>
                            <div>{selectedReport.kpis.evaluationMetadata.modelVersion || 'N/A'}</div>
                          </div>
                          <div>
                            <div className={`font-medium ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>Prompt</div>
                            <div>{selectedReport.kpis.evaluationMetadata.promptVersion || 'N/A'}</div>
                          </div>
                          <div>
                            <div className={`font-medium ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>Scoring</div>
                            <div>{selectedReport.kpis.evaluationMetadata.scoringVersion || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )} */}

                {selectedReport.detailedAnalysis && (
                  <div className={`rounded-2xl p-6 shadow-sm border mt-6 ${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'bg-[#18181B] border-[#2e2e36]'}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className={`text-sm font-semibold mb-2 ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>Problem Summary</div>
                        <div className={`text-sm rounded-lg p-3 border ${isLightTheme ? 'bg-white/80 text-[#0F172A] border-emerald-600' : 'bg-[#202025] text-gray-200 border-[#2e2e36]'}`}>
                          {selectedReport.detailedAnalysis.problem_summary || 'N/A'}
                        </div>
                        {selectedReport.detailedAnalysis.problem_cluster && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full border ${isLightTheme ? 'bg-white text-[#0F172A] border-emerald-600' : 'bg-[#202025] text-gray-300 border-[#2e2e36]'}`}>
                              {selectedReport.detailedAnalysis.problem_cluster}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold mb-2 ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>Solution Summary</div>
                        <div className={`text-sm rounded-lg p-3 border ${isLightTheme ? 'bg-white/80 text-[#0F172A] border-emerald-600' : 'bg-[#202025] text-gray-200 border-[#2e2e36]'}`}>
                          {selectedReport.detailedAnalysis.solution_summary || 'N/A'}
                        </div>
                        {selectedReport.detailedAnalysis.solution_cluster && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full border ${isLightTheme ? 'bg-white text-[#0F172A] border-emerald-600' : 'bg-[#202025] text-gray-300 border-[#2e2e36]'}`}>
                              {selectedReport.detailedAnalysis.solution_cluster}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Report Metadata */}
                {selectedReport && (
                  <div className={`rounded-2xl p-6 shadow-sm border mt-6 ${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'bg-[#18181B] border-[#2e2e36]'}`}>
                    <h3 className={`font-semibold mb-4 ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>Report Information</h3>
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-300'}`}>
                      <div>
                        <div className={`font-medium mb-1 ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-400'}`}>Generated On</div>
                        <div>{new Date(selectedReport.createdAt).toLocaleString()}</div>
                      </div>
                      {selectedReport.userTest?.totalTime && (
                        <div>
                          <div className={`font-medium mb-1 ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-400'}`}>Completion Time</div>
                          <div>{Math.round(selectedReport.userTest.totalTime / 60)} min</div>
                        </div>
                      )}
                      {selectedReport.kpis?.evaluationMetadata?.messageCount && (
                        <div>
                          <div className={`font-medium mb-1 ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-400'}`}>Conversation Exchanges</div>
                          <div>{selectedReport.kpis.evaluationMetadata.messageCount}</div>
                        </div>
                      )}
                    </div>
                    {selectedReport.kpis?.evaluationMetadata?.evaluationAttempts > 1 && (
                      <div className={`mt-4 pt-4 border-t ${isLightTheme ? 'border-emerald-600' : 'border-[#2e2e36]'}`}>
                        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${isLightTheme ? 'bg-white/80 text-yellow-800' : 'bg-yellow-900/20 text-yellow-400 border border-yellow-900/30'}`}>
                          <FaExclamationTriangle className="w-4 h-4" />
                          <span>Evaluation required {selectedReport.kpis.evaluationMetadata.evaluationAttempts} attempts</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className={`text-center ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-500'}`}>
                  <FaChartLine className={`w-16 h-16 mx-auto mb-4 ${isLightTheme ? 'text-gray-300' : 'text-gray-600'}`} />
                  <p className="text-lg font-medium">Select a report to view details</p>
                  <p className="text-sm mt-2">Click a test from the list</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile CSS */}
      <style>{`
        @media (max-width: 640px) {
          .reports-modal-container {
            max-height: 100vh !important;
            height: 100vh !important;
            border-radius: 0 !important;
            overflow-y: auto !important;
          }
          .reports-modal-header {
            padding: 12px 16px !important;
          }
          .reports-modal-header .header-top {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .reports-modal-header .header-top > div:first-child {
            justify-content: center !important;
            width: 100% !important;
          }
          .reports-modal-header .header-top > div:first-child .w-10 {
            width: 32px !important;
            height: 32px !important;
          }
          .reports-modal-header .header-top > div:first-child .w-10 svg {
            width: 16px !important;
            height: 16px !important;
          }
          .reports-modal-header .header-top > div:first-child h3 {
            font-size: 14px !important;
            text-align: center !important;
          }
          .reports-modal-header .header-buttons {
            width: 100% !important;
            justify-content: center !important;
            gap: 4px !important;
          }
          .reports-modal-header .header-buttons button {
            padding: 5px 6px !important;
            font-size: 9px !important;
          }
          .reports-modal-header .header-buttons button span.btn-label {
            display: none !important;
          }
          .reports-modal-content {
            flex-direction: column !important;
            height: auto !important;
            min-height: 0 !important;
          }
          .reports-modal-content > div {
            max-height: none !important;
            overflow-y: visible !important;
            border-right: none !important;
            border-bottom: 1px solid !important;
          }
        }
      `}</style>

      {/* Success Notification Modal */}
      <SuccessNotificationModal
        isOpen={successNotification.isOpen}
        onClose={() => setSuccessNotification({ isOpen: false, title: "", message: "" })}
        title={successNotification.title}
        message={successNotification.message}
        type={successNotification.type || "info"}
        duration={3000}
      />
    </div>
  );
}

  const HIDE_SCROLLBAR_STYLE = `
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.hide-scrollbar::-webkit-scrollbar { width: 0; height: 0; display: none; }
`;
