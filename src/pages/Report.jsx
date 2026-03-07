import React, { useState, useEffect } from 'react';
import ReportScreen from '../components/report/ReportScreen';
import AOS from 'aos';
import { FaDownload, FaShare, FaPrint, FaSync, FaExclamationTriangle, FaHistory, FaChartLine } from 'react-icons/fa';
import SuccessNotificationModal from "../models/SuccessNotificationModal";
import KPIDetailsModal from '../components/admin/KPIDetailsModal';

export default function Report(){
  const [report, setReport] = useState({ percentage: 0, summary: 'No report yet' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showKPIDetails, setShowKPIDetails] = useState(false);
  const [ckpiMetrics, setCkpiMetrics] = useState(null);
  
  // Success notification state
  const [successNotification, setSuccessNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  useEffect(() => {
    loadReport();
    fetchCKPIMetrics();
    AOS.refresh();
  }, []);

  const fetchCKPIMetrics = async () => {
    try {
      const { api } = await import('../utils/api');
      const metrics = await api('/api/user/reports/ckpi-metrics');
      setCkpiMetrics(metrics);
    } catch (err) {
      console.error('Failed to fetch CKPI metrics:', err);
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try localStorage (for just-completed tests)
      const raw = localStorage.getItem('lastReport');
      if (raw) {
        const parsedReport = JSON.parse(raw);
        setReport(parsedReport);
        setLastUpdated(new Date());
      }
      
      // Otherwise, fetch from API (user's most recent completed test)
      try {
        const { api } = await import('../utils/api');
        const response = await api('/api/user/tests/assigned');
        
        // Find most recently completed test
        const completedTests = Array.isArray(response) ? response : response?.tests || [];
        const recentCompleted = completedTests
          .filter(t => t.status === 'COMPLETED' && t.report)
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
        
        if (recentCompleted && recentCompleted.report) {
          const reportData = recentCompleted.report;
          setReport({
            percentage: reportData.kpis?.final || 0,
            summary: reportData.summary || 'Assessment completed',
            kpis: reportData.kpis,
            detailedAnalysis: reportData.detailedAnalysis
          });
          setLastUpdated(new Date(recentCompleted.completedAt));
        } else {
          setError('No assessment report found. Complete an assessment to generate your first report.');
        }
      } catch (apiErr) {
        console.error('Failed to fetch report from API:', apiErr);
        if (!raw) {
          setError('No assessment report found. Complete an assessment to generate your first report.');
        }
      }
    } catch (err) {
      console.error('Failed to load report:', err);
      setError('Failed to load assessment report. The data might be corrupted.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // Simulate PDF export
    setSuccessNotification({
      isOpen: true,
      title: "PDF Export",
      message: "PDF export functionality would be implemented here!"
    });
  };

  const handleShareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: 'shorTest Assessment Report',
        text: `My assessment score: ${report.percentage}% - ${report.summary}`,
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

  const handleRefresh = () => {
    loadReport();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Report</h3>
          <p className="text-gray-600">Preparing your assessment insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaChartLine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assessment Report</h1>
                <p className="text-gray-600 mt-1">
                  Detailed analysis of your performance
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <FaSync className="w-4 h-4" />
                Refresh
              </button>
              
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <FaDownload className="w-4 h-4" />
                Export PDF
              </button>

              <button
                onClick={handleShareReport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <FaShare className="w-4 h-4" />
                Share
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <FaPrint className="w-4 h-4" />
                Print
              </button>

              {ckpiMetrics && (
                <button
                  onClick={() => setShowKPIDetails(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
                >
                  <FaChartLine className="w-4 h-4" />
                  View CKPI Details
                </button>
              )}
            </div>
          </div>

          {/* Status Bar */}
          {lastUpdated && (
            <div className="flex items-center justify-between pb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Report generated {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString()}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <FaHistory className="w-4 h-4" />
                  <span>Latest Assessment</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <span>Score: {report.percentage}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Report Available</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="flex gap-3">
                  <a
                    href="/test"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Take Assessment
                  </a>
                  <button
                    onClick={loadReport}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Content */}
        {!error && (
          <div className="space-y-6">
        {/* Report Screen */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm" data-aos="fade-up" data-aos-delay="300">
          <ReportScreen report={report} />
        </div>

        {report?.detailedAnalysis && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6" data-aos="fade-up" data-aos-delay="350">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-2">Problem Summary</div>
                <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  {report.detailedAnalysis.problem_summary || 'N/A'}
                </div>
                {report.detailedAnalysis.problem_topic && (
                  <div className="mt-3 flex flex-col gap-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                        {report.detailedAnalysis.problem_topic}
                      </span>
                    </div>
                    {report.detailedAnalysis.problem_key && (
                      <span className="text-[10px] font-mono text-gray-400 uppercase ml-1">{report.detailedAnalysis.problem_key}</span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-2">Solution Summary</div>
                <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  {report.detailedAnalysis.solution_summary || 'N/A'}
                </div>
                {report.detailedAnalysis.solution_topic && (
                  <div className="mt-3 flex flex-col gap-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                        {report.detailedAnalysis.solution_topic}
                      </span>
                    </div>
                    {report.detailedAnalysis.solution_key && (
                      <span className="text-[10px] font-mono text-gray-400 uppercase ml-1">{report.detailedAnalysis.solution_key}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-aos="fade-up" data-aos-delay="400">
              {/* Performance Trends */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaChartLine className="w-5 h-5 text-blue-600" />
                  Performance Trends
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">Current Score</span>
                    <span className="text-lg font-bold text-blue-600">{report.percentage}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Assessment Date</span>
                    <span className="text-sm text-gray-600">{lastUpdated?.toLocaleDateString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Report ID</span>
                    <span className="text-sm text-gray-600">#{Date.now().toString().slice(-6)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <a
                    href="/test"
                    className="block w-full text-left p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
                  >
                    <div className="font-medium text-blue-900 group-hover:text-blue-700">
                      Retake Assessment
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      Improve your score with another attempt
                    </div>
                  </a>
                  
                  <button
                    onClick={handleExportPDF}
                    className="block w-full text-left p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
                  >
                    <div className="font-medium text-green-900 group-hover:text-green-700">
                      Download Full Report
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      Get detailed PDF analysis
                    </div>
                  </button>

                  <a
                    href="/dashboard"
                    className="block w-full text-left p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors group"
                  >
                    <div className="font-medium text-purple-900 group-hover:text-purple-700">
                      View Dashboard
                    </div>
                    <div className="text-sm text-purple-700 mt-1">
                      See all your assessments
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Report Metadata */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Report Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700 mb-1">Generated On</div>
                  <div className="text-gray-600">{lastUpdated?.toLocaleString() || 'N/A'}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700 mb-1">Report Version</div>
                  <div className="text-gray-600">v2.1.0</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700 mb-1">Data Source</div>
                  <div className="text-gray-600">Local Assessment</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <KPIDetailsModal 
          isOpen={showKPIDetails}
          onClose={() => setShowKPIDetails(false)}
          title="Your Personal CKPI Analysis"
          data={ckpiMetrics}
        />

        <SuccessNotificationModal
          isOpen={successNotification.isOpen}
          onClose={() => setSuccessNotification({ ...successNotification, isOpen: false })}
          title={successNotification.title}
          message={successNotification.message}
          type={successNotification.type}
        />

        {/* Empty State Illustration */}
        {error && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaChartLine className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assessment Data</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Complete your first assessment to generate a detailed performance report.
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href="/test"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Start Assessment
              </a>
              <a
                href="/dashboard"
                className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                View History
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .bg-gradient-to-br {
            background: white !important;
          }
          .bg-white {
            background: white !important;
          }
          .shadow-sm, .shadow-lg {
            box-shadow: none !important;
          }
          .border {
            border: 1px solid #e5e7eb !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Compact version for embedded reports
export function CompactReport({ reportData }) {
  const report = reportData || { percentage: 0, summary: 'No report data' };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Quick Report</h3>
        <span className="text-sm text-gray-500">Latest</span>
      </div>
      <ReportScreen report={report} />
    </div>
  );
}
