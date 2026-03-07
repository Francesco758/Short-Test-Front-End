// src/components/manager/ReportsModal.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import ReportScreen from '../report/ReportScreen';
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
  FaCalendar,
  FaCheckCircle,
  FaFileAlt
} from 'react-icons/fa';

export default function ReportsModal({ isOpen, onClose, userId, userName, isOverUserManagement = false }) {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
      
      const userReports = await api('/api/company/reports/user-reports');
      
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
    <div className={`fixed inset-0 ${isOverUserManagement ? 'z-[110]' : 'z-50'} flex items-center justify-center p-4 animate-in fade-in duration-300`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-[#0f172a] rounded-[40px] shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-800 flex flex-col transition-all duration-300 scale-100">
        
        {/* Header */}
        <div className="border-b border-gray-800 bg-[#0f172a]/80 backdrop-blur-xl px-10 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-[#1e293b] border border-gray-700 rounded-2xl flex items-center justify-center shadow-inner">
                <FaChartLine className="w-6 h-6 text-[#00f2aa]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Test Reports</h2>
                <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">
                  {userName ? `Reports for ${userName}` : 'Viewing user assessment reports'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-3 px-6 py-2.5 bg-[#1e293b] border border-gray-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 hover:border-gray-600 transition-all disabled:opacity-50"
              >
                <FaSync className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-all group"
              >
                <FaTimes className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row h-[calc(95vh-100px)]">
          
          {/* Reports List Sidebar */}
          <div className="w-full md:w-96 border-r border-gray-800 bg-[#0f172a] overflow-y-auto custom-scrollbar">
            <div className="p-8">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <FaHistory className="w-4 h-4 text-[#00f2aa]" />
                Test History ({reports.length})
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse bg-[#1e293b] border border-gray-800 rounded-2xl h-24"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12 bg-[#1e293b] rounded-3xl border border-gray-800 border-dashed">
                  <FaExclamationTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12 bg-[#1e293b] rounded-3xl border border-gray-800 border-dashed">
                  <FaChartLine className="text-gray-700 w-12 h-12 mx-auto mb-4" />
                  <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">No test reports found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map(report => {
                    const isSelected = selectedReport?.id === report.id;
                    const score = report.kpis?.final || 0;
                    return (
                      <div
                        key={report.id}
                        onClick={() => {
                          if (!isSelected) {
                            loadDetailedReport(report.userTestId);
                          }
                        }}
                        className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                          isSelected
                            ? 'border-[#00f2aa] bg-[#00f2aa]/5 shadow-[0_0_20px_rgba(0,242,170,0.05)]'
                            : 'border-gray-800 bg-[#1e293b] hover:border-gray-700 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className={`text-sm font-black uppercase tracking-widest truncate max-w-[160px] ${
                            isSelected ? 'text-[#00f2aa]' : 'text-white'
                          }`}>
                            {report.userTest?.test?.title || 'Unknown Test'}
                          </h4>
                          <span className={`text-sm font-black ${
                            score >= 80 ? 'text-[#00f2aa]' :
                            score >= 60 ? 'text-yellow-500' :
                            'text-red-500'
                          }`}>
                            {score}%
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-500">
                          <div className="flex items-center gap-2">
                            <FaCalendar className="w-3 h-3" />
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                          {isSelected && (
                             <div className="flex items-center gap-2 text-[#00f2aa] animate-pulse">
                               <FaCheckCircle className="w-3 h-3" />
                               <span>Selected</span>
                             </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Report Display Area */}
          <div className="flex-1 overflow-y-auto bg-[#0f172a] custom-scrollbar p-10">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#00f2aa] border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Analyzing report data...</p>
              </div>
            ) : selectedReport ? (
              <div className="animate-in fade-in zoom-in duration-500">
                {/* Custom Styling for ReportScreen inside Modal */}
                <div className="bg-[#1e293b] rounded-[40px] border border-gray-800 shadow-2xl overflow-hidden mb-10">
                   <div className="px-10 py-6 border-b border-gray-800 bg-[#1e293b]/80 backdrop-blur-md flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <FaFileAlt className="text-[#00f2aa] w-5 h-5" />
                         <span className="text-xs font-black text-white uppercase tracking-widest">Detailed Analysis</span>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleExportPDF(selectedReport)}
                          className="p-3 bg-[#0f172a] border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all group"
                          title="Export PDF"
                        >
                          <FaDownload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button 
                          onClick={() => handleShareReport(selectedReport)}
                          className="p-3 bg-[#0f172a] border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all group"
                          title="Share"
                        >
                          <FaShare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button 
                          onClick={handlePrint}
                          className="p-3 bg-[#0f172a] border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all group"
                          title="Print"
                        >
                          <FaPrint className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                   </div>
                   <div className="p-10">
                      <ReportScreen 
                        report={selectedReport} 
                        isModalView={true} 
                      />
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-24 h-24 bg-[#1e293b] border border-gray-800 rounded-[32px] flex items-center justify-center shadow-inner mb-8">
                   <FaHistory className="w-10 h-10 text-gray-700" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Select a Report</h3>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-widest leading-relaxed">
                  Choose a test from the history sidebar to view the full detailed performance analysis and AI insights.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <SuccessNotificationModal
        isOpen={successNotification.isOpen}
        onClose={() => setSuccessNotification({ ...successNotification, isOpen: false })}
        title={successNotification.title}
        message={successNotification.message}
      />
    </div>
  );
}
