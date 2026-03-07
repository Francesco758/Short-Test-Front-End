import React, { useState, useEffect } from 'react';
import {
  FaTachometerAlt,
  FaClipboardList,
  FaUsers,
  FaBuilding,
  FaChartLine,
  FaCheckCircle,
  FaRobot,
  FaEye,
  FaExclamationTriangle,
  FaLightbulb,
  FaArrowRight,
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaChartBar,
  FaTable,
  FaDatabase,
  FaCog,
  FaCaretDown
} from 'react-icons/fa';
import { api } from '../../utils/api';
import ReactMarkdown from 'react-markdown';
import DataChatbot from '../../components/common/DataChatbot';
import KPIDetailsModal from '../../components/admin/KPIDetailsModal';
import ChartRenderer from '../../components/ui/ChartRenderer';

export default function AdminOverview() {
  const [dashboardData, setDashboardData] = useState({
    stats: {}
  });
  const [globalMetrics, setGlobalMetrics] = useState({
    globalAverageCKPI: 0,
    trend: 0,
    totalReports: 0,
    currentMonthAverage: 0,
    lastMonthAverage: 0,
    globalProblems: [],
    globalSolutions: []
  });
  const [ckpiTrend, setCkpiTrend] = useState({ labels: [], data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [psOverview, setPsOverview] = useState({ problems: [], solutions: [], matrix: [], totalReports: 0 });
  const [showKPIDetails, setShowKPIDetails] = useState(false);
  const [kpiDetailsData, setKpiDetailsData] = useState({});
  const [showAllProblems, setShowAllProblems] = useState(false);
  const [trendRange, setTrendRange] = useState(30);
  const [trendLoading, setTrendLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (trendRange) {
      fetchTrendData();
    }
  }, [trendRange]);

  const fetchTrendData = async () => {
    try {
      setTrendLoading(true);
      const data = await api(`/api/admin/dashboard/ckpi-trend?days=${trendRange}`);
      if (data) setCkpiTrend(data);
    } catch (err) {
      console.error('Failed to fetch trend data:', err);
    } finally {
      setTrendLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, globalMetricsData, trendData] = await Promise.all([
        api('/api/admin/dashboard/stats'),
        api('/api/admin/dashboard/global-metrics'),
        api('/api/admin/dashboard/ckpi-trend?days=30')
      ]);

      setDashboardData({
        stats: statsData || {}
      });
      
      if (globalMetricsData) {
        setGlobalMetrics(globalMetricsData);
      }

      if (trendData) {
        setCkpiTrend(trendData);
      }
      
      try {
        const overview = await api('/api/admin/dashboard/problem-solution-overview');
        setPsOverview(overview || { problems: [], solutions: [], matrix: [], totalReports: 0 });
      } catch (err) {
        console.warn('Failed to fetch problem-solution overview:', err);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err?.message || err?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleKPIDetailsClick = () => {
    console.log('KPI Details button clicked');
    // Prepare data for KPI details modal
    const kpiData = {
      averages: globalMetrics.averages || {
        simplification: 0,
        originality: 0,
        feasibility: 0,
        criticalThinking: 0,
        proactivity: 0
      },
      componentTrends: globalMetrics.componentTrends || {
        simplification: 0,
        originality: 0,
        feasibility: 0,
        criticalThinking: 0,
        proactivity: 0
      },
      totalReports: globalMetrics.totalReports || 0,
      trend: globalMetrics.trend || 0,
      lastUpdated: globalMetrics.lastUpdated || new Date().toLocaleString()
    };
    
    setKpiDetailsData(kpiData);
    setShowKPIDetails(true);
  };

  const statsCards = [
    {
      title: 'Global Average CKPI',
      value: `${globalMetrics.globalAverageCKPI}%`,
      change: `${globalMetrics.trend > 0 ? '+' : ''}${globalMetrics.trend}%`,
      trend: globalMetrics.trend > 0 ? 'up' : globalMetrics.trend < 0 ? 'down' : 'neutral',
      icon: FaChartLine,
      color: 'indigo',
      bgColor: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      iconColor: 'text-white',
      borderColor: 'border-indigo-200',
      accentColor: 'bg-indigo-600',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Total Companies',
      value: dashboardData.stats.totals?.totalCompanies || 0,
      change: 'Active on platform',
      trend: 'neutral',
      icon: FaBuilding,
      color: 'blue',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconColor: 'text-white',
      borderColor: 'border-blue-200',
      accentColor: 'bg-blue-600',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Users',
      value: dashboardData.stats.totals?.totalUsers || 0,
      change: 'Registered users',
      trend: 'neutral',
      icon: FaUsers,
      color: 'emerald',
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconColor: 'text-white',
      borderColor: 'border-emerald-200',
      accentColor: 'bg-emerald-600',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Total Tests',
      value: dashboardData.stats.totals?.totalTests || 0,
      change: 'Completed assessments',
      trend: 'neutral',
      icon: FaClipboardList,
      color: 'amber',
      bgColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
      iconColor: 'text-white',
      borderColor: 'border-amber-200',
      accentColor: 'bg-amber-600',
      gradient: 'from-amber-500 to-amber-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-4 md:gap-6">
              <div className="relative">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaTachometerAlt className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 md:w-7 md:h-7 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                  System Overview
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-gray-600 text-sm md:text-base">
                      Live monitoring active
                    </p>
                  </div>
                  <span className="hidden md:inline text-gray-300">•</span>
                  <p className="hidden md:block text-gray-500 text-sm">
                    Updated just now
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 shadow-sm group"
              >
                <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                Refresh Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 md:py-24">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-600 mt-6 font-medium">Loading dashboard analytics...</p>
            <p className="text-gray-400 text-sm mt-2">Fetching real-time system data</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-8">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-1">Dashboard Error</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                >
                  Retry Loading Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && (
          <div className="space-y-8">
            {/* AI Assistant Section */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaRobot className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">AI Data Assistant</h3>
                      <p className="text-gray-600 mt-1">Get insights into system-wide patterns and aggregated metrics</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <DataChatbot
                    onSendMessage={async (question) => {
                      const res = await api('/api/admin/dashboard/query', {
                        method: 'POST',
                        body: JSON.stringify({ question })
                      });
                      return res;
                    }}
                    placeholder="Ask about trends, patterns, or system performance..."
                    title="Analytics Assistant"
                    maxHeight="400px"
                    storageKey="admin_dashboard_chat"
                    maxMessages={50}
                  />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
              {statsCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Corner accent */}
                    <div className={`absolute top-0 right-0 w-2 h-16 ${stat.bgColor} rounded-bl-lg`}></div>
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center shadow-md`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        {stat.title === 'Global Average CKPI' && (
                          <div className={`flex items-center gap-1 text-sm font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.trend === 'up' ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
                            {stat.change}
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">{stat.title}</p>
                        <p className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
                          {stat.value}
                        </p>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-4">
                        {stat.change}
                      </p>
                      
                      {/* Add View Details button for Global CKPI card */}
                      {stat.title === 'Global Average CKPI' && (
                        <button
                          onClick={handleKPIDetailsClick}
                          className={`w-full mt-2 py-3 bg-gradient-to-r ${stat.gradient} text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2`}
                        >
                          <FaEye className="w-4 h-4" />
                          View KPI Details
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CKPI Trend Graph Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                {/* Header with Filters */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                      CKPI Trend Over Time
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Time Range Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      {[
                        { label: '7d', value: 7 },
                        { label: '30d', value: 30 },
                        { label: '90d', value: 90 },
                        { label: '12m', value: 365 }
                      ].map((range) => (
                        <button
                          key={range.value}
                          onClick={() => setTrendRange(range.value)}
                          className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${
                            trendRange === range.value
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                        Global
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                        Sector <FaCaretDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Settings Icon */}
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <FaCog className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Graph Area */}
                <div className="relative">
                  {trendLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  {ckpiTrend.data && ckpiTrend.data.length > 0 ? (
                    <div className="w-full relative">
                      {/* Latest Value Overlay (simulating the tooltip in screenshot) */}
                      <div 
                        className="absolute hidden md:flex flex-col items-center z-20"
                        style={{ 
                          right: '2%', 
                          top: '15%'
                        }}
                      >
                        <div className="bg-white border border-gray-100 shadow-xl rounded-lg px-4 py-2 flex items-center gap-2 animate-bounce">
                          <span className="text-2xl font-black text-gray-900">
                            {ckpiTrend.data[ckpiTrend.data.length - 1]}%
                          </span>
                        </div>
                      </div>

                      <ChartRenderer
                        spec={{
                          type: 'line',
                          labels: ckpiTrend.labels,
                          data: ckpiTrend.data,
                          color: '#3b82f6' // Blue color from screenshot
                        }}
                      />

                      {/* Summary Text on Bottom Right */}
                      <div className="mt-4 flex justify-end">
                        <div className="text-right">
                          <p className="text-gray-500 text-sm font-medium">
                            The average CKPI grew by{' '}
                            <span className="text-green-600 font-bold">
                              +{Math.max(0, ckpiTrend.data[ckpiTrend.data.length - 1] - ckpiTrend.data[0])}%
                            </span>{' '}
                            in the last {trendRange} days
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="text-center">
                        <FaChartLine className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold">No data available for this period</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Problem & Solution Overview */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="p-6 md:p-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <FaChartBar className="text-indigo-600" />
                      Global Pattern Analysis
                    </h2>
                    <p className="text-gray-600 mt-1">Cross-company themes and solution effectiveness</p>
                  </div>
                  <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-semibold flex items-center gap-2">
                    <FaDatabase className="w-4 h-4" />
                    {psOverview.totalReports || 0} Reports Analyzed
                  </div>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Problem Themes */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-red-50 rounded-xl">
                        <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Top Problem Clusters</h3>
                        <p className="text-gray-500 text-sm mt-1">Most frequently reported issues</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {(psOverview.problems || []).length === 0 ? (
                        <div className="text-center py-8 text-gray-400 italic">
                          No problem themes found in current data
                        </div>
                      ) : (
                        <>
                          {(psOverview.problems || [])
                            .slice(0, showAllProblems ? undefined : 5)
                            .map((item, idx) => (
                              <div 
                                key={idx} 
                                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900">{item.cluster}</span>
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                                        {item.key}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold border border-gray-200">
                                        {item.count} occurrences
                                      </span>
                                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-200">
                                        {item.avgFinal}% avg KPI
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          
                          {(psOverview.problems || []).length > 5 && (
                            <button
                              onClick={() => setShowAllProblems(!showAllProblems)}
                              className="w-full py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              {showAllProblems ? 'Show Less' : `View All (${psOverview.problems.length})`}
                              {showAllProblems ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Solution Themes */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-emerald-50 rounded-xl">
                        <FaLightbulb className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Solution Effectiveness</h3>
                        <p className="text-gray-500 text-sm mt-1">Most feasible solutions by theme</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {(psOverview.solutions || []).length === 0 ? (
                        <div className="text-center py-8 text-gray-400 italic">
                          No solution themes found in current data
                        </div>
                      ) : (
                        (psOverview.solutions || [])
                          .slice(0, 5)
                          .map((item, idx) => (
                            <div 
                              key={idx} 
                              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900">{item.cluster}</span>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                                      {item.key}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold border border-gray-200">
                                      {item.count} occurrences
                                    </span>
                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">
                                      {item.avgFeasibility}% feasibility
                                    </span>
                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-200">
                                      {item.avgFinal}% avg KPI
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pattern Pairing Matrix - Commented out as requested
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="p-6 md:p-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaTable className="text-gray-700 w-6 h-6" />
                    <h2 className="text-xl font-bold text-gray-900">Pattern Pairing Matrix</h2>
                  </div>
                  <div className="text-sm text-gray-600">
                    Problem-solution correlation analysis
                  </div>
                </div>
              </div>
              
              <div className="overflow-hidden">
                {(psOverview.matrix || []).length === 0 ? (
                  <div className="text-center py-12">
                    <FaTable className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 italic">No pairing data available</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                            Problem Theme
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                            Solution Theme
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                            Frequency
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                            Effectiveness
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(psOverview.matrix || []).map((row, idx) => (
                          <tr 
                            key={idx} 
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{row.problem}</div>
                                <div className="text-xs text-gray-500 font-mono uppercase mt-1">{row.problemKey}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{row.solution}</div>
                                <div className="text-xs text-gray-500 font-mono uppercase mt-1">{row.solutionKey}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-gray-500 to-gray-600 h-2 rounded-full"
                                    style={{ width: `${Math.min((row.count / 50) * 100, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold text-gray-700">{row.count}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-blue-100 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(row.avgFinal, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold text-blue-700">{row.avgFinal}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            */}
          </div>
        )}
        
        {/* KPI Details Modal */}
        <KPIDetailsModal
          isOpen={showKPIDetails}
          onClose={() => setShowKPIDetails(false)}
          title="Change KPI Details"
          data={kpiDetailsData}
        />
      </div>
    </div>
  );
}