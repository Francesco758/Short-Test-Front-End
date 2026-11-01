// src/components/common/DashboardObservatory.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import {
  FaClipboardList,
  FaChartLine,
  FaEye,
  FaExclamationTriangle,
  FaCog,
  FaCaretDown,
  FaBars,
  FaArrowLeft
} from 'react-icons/fa';

import KPIDetailsModal from '../admin/KPIDetailsModal';
import TotalTestDetailsModal from '../admin/TotalTestDetailsModal';
import EmergingProblemsModal from '../admin/EmergingProblemsModal';
import EmergingSolutionsModal from '../admin/EmergingSolutionsModal';
import { api, apiStream } from '../../utils/api';
import DataChatbot from './DataChatbot';

export default function DashboardObservatory({
  isLightTheme,
  toggleTheme,
  apiBasePath = '/api/admin/dashboard',
  chatEndpoint = '/api/admin/dashboard/query',
  onDashboardClick,
  showSidebarToggle = false,
  pageTitle = 'OBSERVATORY',
  onToggleSidebar,
  className = '',
  showDashboardButton = true
}) {
  // Responsive layout system from CompanyDashboard
  const BASE_DESKTOP_WIDTH = 1600;
  const BASE_DESKTOP_HEIGHT = 900;
  const MIN_DESKTOP_WIDTH = 960;
  const MIN_DESKTOP_HEIGHT = 540;
  const MIN_DESKTOP_ASPECT = 1.0;

  const [layoutMode, setLayoutMode] = useState("desktop");
  const [viewportSize, setViewportSize] = useState({ width: BASE_DESKTOP_WIDTH, height: BASE_DESKTOP_HEIGHT });

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
  const [psOverview, setPsOverview] = useState({ problems: [], solutions: [], matrix: [], totalReports: 0 });
  const [showKPIDetails, setShowKPIDetails] = useState(false);
  const [kpiDetailsData, setKpiDetailsData] = useState({});
  const [showTotalTestDetails, setShowTotalTestDetails] = useState(false);
  const [totalTestDetailsData, setTotalTestDetailsData] = useState({});
  const [showEmergingProblems, setShowEmergingProblems] = useState(false);
  const [showEmergingSolutions, setShowEmergingSolutions] = useState(false);
  const [trendLoading, setTrendLoading] = useState(false);
  const [isAIConversationExpanded, setIsAIConversationExpanded] = useState(false);
  const [isChatOpening, setIsChatOpening] = useState(false);
  const [aiConversationId, setAiConversationId] = useState(null);
  const [aiInitialMessages, setAiInitialMessages] = useState(null);
  const [aiConversationLoaded, setAiConversationLoaded] = useState(false);
  const chatOpenTimerRef = useRef(null);
  const chatOpenDurationMs = 1150;

  const [filters, setFilters] = useState({
    period: 'all',
    ages: [],
    functions: [],
    orgSizes: [],
    orgTypes: []
  });
  const PERIOD_DAYS = { '1m': 30, '3m': 90, '6m': 180, '1y': 365, 'all': 'all' };
  const trendDays = PERIOD_DAYS[filters.period] || 30;
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);

  // Responsive layout effects
  useEffect(() => {
    function updateResponsiveLayout() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = w / Math.max(h, 1);
      setViewportSize({ width: w, height: h });

      const shouldBreakToStack =
        w < MIN_DESKTOP_WIDTH ||
        h < MIN_DESKTOP_HEIGHT ||
        aspect < MIN_DESKTOP_ASPECT;

      if (shouldBreakToStack) {
        setLayoutMode("stack");
        return;
      }

      setLayoutMode("desktop");
    }

    updateResponsiveLayout();
    window.addEventListener("resize", updateResponsiveLayout);
    return () => window.removeEventListener("resize", updateResponsiveLayout);
  }, []);

  // Load the latest persisted AI conversation on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api("/api/admin/dashboard/conversations");
        const latest = Array.isArray(list) && list.length > 0 ? list[0] : null;
        if (!latest) { if (!cancelled) setAiConversationLoaded(true); return; }

        const conv = await api(`/api/admin/dashboard/conversations/${latest.id}`);
        if (cancelled) return;
        setAiConversationId(latest.id);
        setAiInitialMessages(Array.isArray(conv?.messages) ? conv.messages : []);
      } catch (err) {
        console.warn("Failed to load AI conversation:", err?.message);
      } finally {
        if (!cancelled) setAiConversationLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Responsive calculations
  const isDesktopLocked = layoutMode === "desktop";
  const widthScale = viewportSize.width / BASE_DESKTOP_WIDTH;
  const heightScale = viewportSize.height / BASE_DESKTOP_HEIGHT;
  const desktopScaleRaw = (widthScale * 0.62) + (heightScale * 0.38);
  const calibrationTargets = [
    { w: 1440, h: 900, adjust: 0.025 },
    { w: 1512, h: 982, adjust: 0.02 },
    { w: 1728, h: 1117, adjust: 0.012 }
  ];
  const calibration = calibrationTargets.reduce(
    (acc, target) => {
      const dw = viewportSize.width - target.w;
      const dh = viewportSize.height - target.h;
      const distance = Math.hypot(dw, dh);
      const weight = 1 / Math.max(distance, 1);
      return {
        weightedAdjust: acc.weightedAdjust + (target.adjust * weight),
        weightTotal: acc.weightTotal + weight
      };
    },
    { weightedAdjust: 0, weightTotal: 0 }
  );
  const calibrationAdjust = calibration.weightTotal > 0
    ? calibration.weightedAdjust / calibration.weightTotal
    : 0;
  const desktopScale = Math.max(0.94, Math.min(1.16, desktopScaleRaw + calibrationAdjust));
  const viewportAspect = viewportSize.width / Math.max(viewportSize.height, 1);
  const isUltraWideIrregularViewport = isDesktopLocked && viewportAspect >= 2.06 && viewportSize.width >= 1700;
  const isPortraitStackViewport = !isDesktopLocked && viewportAspect <= 0.8 && viewportSize.width <= 620;
  const isPortraitScreenshotViewport = isPortraitStackViewport
    && viewportSize.width >= 340
    && viewportSize.width <= 430
    && viewportSize.height >= 680
    && viewportAspect <= 0.62;
  const constrainedDesktopWidth = Math.max(1360, Math.min(1820, Math.round(viewportSize.height * 1.74)));
  const isMacAirLikeViewport = isDesktopLocked && viewportAspect <= 1.62 && viewportSize.width <= 1550 && viewportSize.height >= 820;
  const isMacAir2020Viewport = isDesktopLocked
    && viewportSize.width >= 1280
    && viewportSize.width <= 1550
    && viewportSize.height >= 820
    && viewportSize.height <= 980
    && viewportAspect >= 1.45
    && viewportAspect <= 1.68;
  const isFullscreen1440x900 = isDesktopLocked
    && viewportSize.width >= 1400
    && viewportSize.width <= 1460
    && viewportSize.height >= 860
    && viewportSize.height <= 940;
  const macAirFineTune = isMacAir2020Viewport ? (isFullscreen1440x900 ? 1.08 : 1.14) : 1;

  const estimatedHeaderHeight = 76;
  const estimatedRowGapTotal = 16;
  const estimatedVerticalPadding = 10;
  const desktopRowHeight = isDesktopLocked
    ? Math.max(170, (viewportSize.height - estimatedHeaderHeight - estimatedRowGapTotal - estimatedVerticalPadding) / 3)
    : 0;
  const fromRow = (ratio, minPx, maxPx) => `${Math.max(minPx, Math.min(maxPx, desktopRowHeight * ratio))}px`;
  const fromRowTuned = (ratio, minPx, maxPx) => fromRow(ratio * macAirFineTune, minPx, maxPx);
  const tallDesktopBoost = viewportAspect <= 1.62 ? 1.28 : (viewportAspect <= 1.75 ? 1.16 : 1);
  const fluidClamp = (minPx, viewportWidthUnit, maxPx) => `clamp(${minPx}px, calc(${viewportWidthUnit}vw * ${tallDesktopBoost}), ${maxPx}px)`;

  // Header styles from CompanyDashboard
  const headerButtonStyle = isDesktopLocked
    ? {
        fontSize: isMacAirLikeViewport ? fromRowTuned(0.068, 14, 22) : fluidClamp(12, 1.0, 18),
        padding: isMacAirLikeViewport
          ? `${fromRowTuned(0.032, 8, 15)} ${fromRowTuned(0.06, 14, 28)}`
          : `${fluidClamp(8, 0.62, 13)} ${fluidClamp(14, 1.18, 24)}`,
        minHeight: isMacAirLikeViewport ? fromRowTuned(0.175, 38, 56) : fluidClamp(36, 2.6, 48),
        letterSpacing: fluidClamp(1.2, 0.14, 2.6)
      }
    : undefined;

  const portraitStackButtonStyle = isPortraitStackViewport
    ? {
        fontSize: isPortraitScreenshotViewport ? '11.5px' : '11px',
        padding: isPortraitScreenshotViewport ? '8px 13px' : '7px 12px',
        minHeight: isPortraitScreenshotViewport ? '36px' : '34px',
        letterSpacing: isPortraitScreenshotViewport ? '0.11em' : '0.12em'
      }
    : undefined;

  const portraitPanelRowGap = isPortraitScreenshotViewport ? '12px' : (isPortraitStackViewport ? '10px' : '14px');
  const portraitGridGapClass = isPortraitStackViewport
    ? (isPortraitScreenshotViewport ? 'gap-4' : 'gap-3')
    : 'gap-2';
  const portraitCardStyle = isPortraitStackViewport
    ? {
        height: isPortraitScreenshotViewport ? '176px' : '170px',
        borderWidth: isPortraitScreenshotViewport ? '2px' : undefined
      }
    : undefined;

  // Card title styles from CompanyDashboard
  const cardTitleStyle = isDesktopLocked
    ? {
        fontSize: isMacAirLikeViewport
          ? (isFullscreen1440x900 ? fromRowTuned(0.104, 17, 28) : fromRowTuned(0.132, 21, 38))
          : fluidClamp(16, 1.3, 30),
        letterSpacing: isMacAirLikeViewport
          ? (isFullscreen1440x900 ? fromRowTuned(0.0078, 1.3, 2.8) : fromRowTuned(0.0162, 3.0, 6.2))
          : fluidClamp(2.7, 0.25, 5.4),
        lineHeight: isFullscreen1440x900 ? '1.15' : undefined,
        width: '100%',
        textAlign: 'center',
        whiteSpace: 'normal',
        overflow: 'visible',
        textOverflow: 'clip',
        fontFamily: 'Montserrat, sans-serif'
      }
    : {
        fontSize: 'clamp(15px, 3.2vw, 22px)',
        letterSpacing: '0.12em',
        lineHeight: '1.2',
        width: '100%',
        textAlign: 'center',
        whiteSpace: 'normal',
        overflow: 'visible',
        textOverflow: 'clip',
        fontFamily: 'Montserrat, sans-serif'
      };

  const cardTitleSlotStyle = isDesktopLocked
    ? {
        minHeight: isFullscreen1440x900 ? fromRow(0.188, 36, 74) : fromRow(0.172, 32, 68),
        paddingTop: isMacAirLikeViewport ? fromRowTuned(0.029, 8, 16) : fromRow(0.016, 5, 12),
        justifyContent: 'center',
        alignItems: 'center'
      }
    : undefined;

  const rightItemLabelStyle = {
    minWidth: 0,
    width: '100%',
    overflow: 'hidden',
    textOverflow: isFullscreen1440x900 ? 'clip' : 'ellipsis',
    whiteSpace: isFullscreen1440x900 ? 'normal' : 'nowrap',
    display: isFullscreen1440x900 ? '-webkit-box' : 'block',
    WebkitLineClamp: isFullscreen1440x900 ? 2 : 1,
    WebkitBoxOrient: isFullscreen1440x900 ? 'vertical' : 'initial',
    lineHeight: isFullscreen1440x900 ? 1.5 : 1.46,
    fontFamily: 'Montserrat, sans-serif'
  };

  const kpiLargeNumberStyle = isDesktopLocked
    ? { fontSize: isMacAirLikeViewport ? fromRowTuned(0.39, 68, 172) : fluidClamp(64, 6.2, 148) }
    : undefined;

  const stackKpiNumberStyle = isPortraitStackViewport
    ? { fontSize: '58px', fontWeight: 700 }
    : { fontSize: '64px', fontWeight: 700 };

  const rightItemRowStyle = isDesktopLocked
    ? {
        minHeight: isFullscreen1440x900
          ? fromRow(0.208, 40, 62)
          : (isMacAirLikeViewport ? fromRowTuned(0.165, 30, 48) : fluidClamp(28, 1.6, 40))
      }
    : { minHeight: '24px' };

  const rightItemTextStyle = isDesktopLocked
    ? {
        fontSize: isMacAirLikeViewport ? fromRowTuned(0.099, 15, 29) : fluidClamp(12, 1.0, 20),
        fontFamily: 'Montserrat, sans-serif'
      }
    : { fontSize: '13px', fontFamily: 'Montserrat, sans-serif' };

  const rightItemValueStyle = isDesktopLocked
    ? {
        fontSize: isMacAirLikeViewport ? fromRowTuned(0.066, 11, 16) : fluidClamp(11, 0.78, 15),
        fontFamily: 'Montserrat, sans-serif'
      }
    : { fontSize: '13px', fontFamily: 'Montserrat, sans-serif' };

  const deltaLabelStyle = isDesktopLocked
    ? { fontSize: isMacAirLikeViewport ? fromRowTuned(0.064, 12, 22) : fluidClamp(12, 0.9, 18) }
    : undefined;

  useEffect(() => {
    if (filters.period) {
      fetchTrendData();
    }
  }, [filters.period]);

  useEffect(() => {
    return () => {
      if (chatOpenTimerRef.current) {
        clearTimeout(chatOpenTimerRef.current);
      }
    };
  }, []);

  function buildFilterQuery() {
    const params = new URLSearchParams();
    if (filters.period) params.set('period', filters.period);
    if (filters.ages.length) params.set('ages', filters.ages.join(','));
    if (filters.functions.length) params.set('functions', filters.functions.join(','));
    if (filters.orgSizes.length) params.set('orgSizes', filters.orgSizes.join(','));
    if (filters.orgTypes.length) params.set('orgTypes', filters.orgTypes.join(','));
    return params.toString();
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !e.target.closest('.observatory-dropdown')) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: next };
    });
  };

  const clearFilter = (category) => {
    setFilters(prev => ({ ...prev, [category]: category === 'period' ? 'all' : [] }));
  };

  const fetchTrendData = async () => {
    try {
      setTrendLoading(true);
      const fq = buildFilterQuery();
      const data = await api(`${apiBasePath}/ckpi-trend?days=${trendDays}${fq ? '&' + fq : ''}`);
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
      const fq = buildFilterQuery();

      const [statsData, globalMetricsData, trendData] = await Promise.all([
        api(`${apiBasePath}/stats${fq ? '?' + fq : ''}`),
        api(`${apiBasePath}/global-metrics${fq ? '?' + fq : ''}`),
        api(`${apiBasePath}/ckpi-trend?days=${trendDays}${fq ? '&' + fq : ''}`)
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
        const overview = await api(`${apiBasePath}/problem-solution-overview${fq ? '?' + fq : ''}`);
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
      globalCkpi: globalMetrics.globalAverageCKPI || 0,
      averages: globalMetrics.averages || {
        simplification: 0,
        originality: 0,
        feasibility: 0,
        criticalThinking: 0,
        proactivity: 0,
        impact: 0
      },
      componentTrends: globalMetrics.componentTrends || {
        simplification: 0,
        originality: 0,
        feasibility: 0,
        criticalThinking: 0,
        proactivity: 0,
        impact: 0
      },
      totalReports: globalMetrics.totalReports || 0,
      trend: globalMetrics.trend || 0,
      lastUpdated: globalMetrics.lastUpdated || new Date().toLocaleString()
    };
    
    setKpiDetailsData(kpiData);
    setShowKPIDetails(true);
  };

  const handleTotalTestDetailsClick = () => {
    const totals = dashboardData.stats.totals || {};

    setTotalTestDetailsData({
      totalTests: totals.totalTests || 0,
      peopleTotal: totals.peopleTotal || 0,
      organizationsTotal: totals.organizationsTotal || 0,
      countriesTotal: totals.countriesTotal || 0,
      peopleDetail: totals.peopleBreakdown || [],
      organizationsDetail: totals.orgBreakdown || [],
      countriesDetail: totals.countriesBreakdown || []
    });
    setShowTotalTestDetails(true);
  };

  function handleRequestExpandChat() {
    if (isAIConversationExpanded) return;
    setIsChatOpening(true);
    setIsAIConversationExpanded(true);

    if (chatOpenTimerRef.current) {
      clearTimeout(chatOpenTimerRef.current);
    }
    chatOpenTimerRef.current = setTimeout(() => {
      setIsChatOpening(false);
    }, chatOpenDurationMs);
  }

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
    <div
      className={`observatory-root h-full w-full flex flex-col overflow-hidden ${isLightTheme ? 'bg-white text-[#0F172A]' : 'bg-[#09090B] text-white'} font-montserrat selection:bg-emerald-500/30 ${className}`}
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      <style>{`
        .observatory-dropdown::-webkit-scrollbar { display: none; }
        .observatory-dropdown { scrollbar-width: none; }
        @keyframes chatRiseIn {
          0% {
            transform: translateY(16%) scaleY(0.8);
            opacity: 0.5;
          }
          100% {
            transform: translateY(0) scaleY(1);
            opacity: 1;
          }
        }
        @media (max-width: 640px) {
          /* Allow scrolling on mobile */
          .observatory-root {
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          .observatory-root > div {
            overflow: visible !important;
            height: auto !important;
          }
          .observatory-root > div > div {
            height: auto !important;
          }
          /* Outer container: no side margins */
          body > #root > div > div > div {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          /* Header */
          header {
            padding: 12px 14px !important;
            gap: 10px !important;
          }
          header h1 {
            font-size: 12px !important;
            letter-spacing: 0.15em !important;
          }
          header a {
            font-size: 12px !important;
            letter-spacing: 0.15em !important;
          }
          header button svg {
            width: 14px !important;
            height: 14px !important;
          }
          header > div:first-child > div {
            flex-wrap: wrap;
            gap: 4px !important;
          }
          header > div:last-child {
            flex-wrap: wrap;
            gap: 6px !important;
          }
          header > div:last-child > button {
            font-size: 9px !important;
            padding: 6px 10px !important;
            min-height: 30px !important;
            letter-spacing: 0.08em !important;
          }
          /* Override portraitCardStyle inline height */
          .observatory-card {
            height: auto !important;
            min-height: 200px !important;
            padding: 14px !important;
          }
          /* Hide Function, Org size, Org type filters on mobile */
          .observatory-filter-item[data-idx="2"],
          .observatory-filter-item[data-idx="3"],
          .observatory-filter-item[data-idx="4"] {
            display: none !important;
          }
          /* Card titles */
          .font-montserrat.font-extrabold.uppercase.text-center {
            font-size: 15px !important;
            letter-spacing: 0.06em !important;
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: clip !important;
            line-height: 1.2 !important;
          }
          /* Large KPI numbers - bigger on mobile */
          .font-montserrat.tabular-nums.leading-none.tracking-tight.text-center {
            font-size: 68px !important;
          }
          /* Push delta labels to bottom of card but closer to number */
          .flex.flex-col.items-center.justify-center.flex-1.min-w-0 {
            justify-content: flex-end !important;
            gap: 2px !important;
            padding-bottom: 4px !important;
          }
          /* Delta label styling - larger and pushed down */
          .text-gray-400.whitespace-nowrap.text-center,
          .text-\\[\\#334155\\].whitespace-nowrap.text-center {
            margin-top: 0 !important;
            font-size: 12px !important;
          }
          /* Sections: consistent horizontal padding */
          section {
            padding-left: 14px !important;
            padding-right: 14px !important;
          }
          /* First and second row sections: consistent vertical gap */
          section:nth-child(1),
          section:nth-child(2) {
            margin-bottom: 6px !important;
          }
          /* List rows - more spacing between parameters */
          .space-y-3 > div {
            min-height: 32px !important;
          }
          /* Metric bar labels - larger text */
          .font-bold.uppercase.tracking-wider.font-montserrat {
            font-size: 13px !important;
            letter-spacing: 0.08em !important;
          }
          /* CKPI card parameters container - reduce top/left padding */
          .space-y-3 {
            padding-top: 0px !important;
            margin-left: -4px !important;
          }
          /* Metric bar thickness */
          .h-\\[2px\\] {
            height: 3px !important;
          }
          .h-\\[4px\\] {
            height: 4px !important;
          }
          /* Cards */
          .border.rounded-lg.p-3.flex.items-stretch {
            padding: 8px 10px !important;
          }
          /* Filter pills - wrap on mobile */
          .observatory-filters {
            flex-wrap: wrap !important;
            gap: 6px !important;
          }
          /* Sparkline labels on mobile */
          .grid.grid-cols-6.gap-2 {
            text-align: center !important;
          }
        }
        @media (max-width: 640px) and (orientation: landscape) {
          section {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          header {
            padding: 8px 10px !important;
          }
        }
      `}</style>
      <div className="flex-1 w-full flex items-start justify-center overflow-hidden p-4">
        <div
          className={`${isDesktopLocked ? '' : 'w-full'} ${isLightTheme ? 'bg-white' : 'bg-[#09090B]'} h-full flex flex-col`}
          style={
            isDesktopLocked
              ? {
                  height: '100%',
                  margin: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  width: isUltraWideIrregularViewport ? `${constrainedDesktopWidth}px` : '100%',
                }
              : undefined
          }
        >
          <div className="h-full flex flex-col px-0 py-0 overflow-hidden">
            {/* Header - CompanyDashboard styling with optional sidebar button */}
            <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-2 mb-4 px-0 flex-shrink-0">
              <div className="flex items-center gap-4">
                {isAIConversationExpanded ? (
                    <button
                      onClick={() => setIsAIConversationExpanded(false)}
                      style={isDesktopLocked ? headerButtonStyle : portraitStackButtonStyle}
                      className={`${isDesktopLocked ? 'px-4 py-1.5 text-[11px]' : 'px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px]'} bg-transparent border ${isLightTheme ? 'border-emerald-700' : 'border-emerald-500'} rounded-md font-bold uppercase tracking-wider whitespace-nowrap hover:bg-emerald-500/10 transition-colors ${isLightTheme ? 'text-gray-900' : 'text-white'} leading-none font-montserrat`}
                    >
                      Dashboard
                    </button>
                ) : (
                  <>
                    {showSidebarToggle && onToggleSidebar && (
                      <button
                        onClick={onToggleSidebar}
                        className={`p-2 ${isLightTheme ? 'hover:bg-gray-100' : 'hover:bg-[#18181B]'} rounded-lg transition-colors flex-shrink-0`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 lg:w-[18px] lg:h-[18px] ${isLightTheme ? 'text-[#334155]' : 'text-gray-400'}`}>
                          <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    <div>
                      <h1 className={`m-0 leading-none text-[10px] lg:text-xs font-medium tracking-[0.3em] ${isLightTheme ? 'text-[#334155]' : 'text-gray-500'} uppercase font-montserrat`}>
                        {pageTitle}
                      </h1>
                    </div>
                    {onDashboardClick && showDashboardButton && (
                      <button
                        onClick={onDashboardClick}
                        className="m-0 leading-none text-[10px] lg:text-xs font-medium tracking-[0.3em] text-[#22C58B] hover:text-[#0B3D2E] transition-colors uppercase font-montserrat cursor-pointer"
                      >
                        {'>'} DASHBOARD
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className={`flex flex-wrap items-center ${isDesktopLocked ? 'gap-2' : (isPortraitStackViewport ? (isPortraitScreenshotViewport ? 'gap-2.5' : 'gap-3') : 'gap-2 lg:gap-3')}`}>
                <button 
                  onClick={toggleTheme}
                  style={isDesktopLocked ? headerButtonStyle : portraitStackButtonStyle}
                  className={`${isDesktopLocked ? '' : 'px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px] lg:text-[12px]'} ${isLightTheme ? 'bg-white border-emerald-700 text-[#0F172A] hover:bg-[#ECEFF1]' : 'bg-[#18181B] border-[#2e2e36] text-white hover:bg-[#202025]'} border rounded-lg font-bold uppercase tracking-widest whitespace-nowrap transition-colors font-montserrat`}
                >
                  THEME:{isLightTheme ? 'DARK' : 'LIGHT'}
                </button>
              </div>
            </header>

            {/* Loading State */}
            {loading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className={`${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>Loading dashboard data...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isLightTheme ? 'bg-red-100' : 'bg-red-900/20'}`}>
                    <FaExclamationTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>Failed to load data</h3>
                  <p className={`mb-4 ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>{error}</p>
                  <button
                    onClick={fetchDashboardData}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 mx-auto"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Dashboard Content - 3 equal-height rows */}
            {!loading && !error && (
              <div
                className="flex flex-col gap-4 flex-1 min-h-0"
                style={{ rowGap: isAIConversationExpanded ? 0 : (isDesktopLocked ? '16px' : portraitPanelRowGap) }}
              >
                {/* First row - Global CKPI and Total Tests - exactly 33% height */}
                <section
                  className={`min-h-0 px-0 py-0 flex flex-col overflow-hidden transform-gpu transition-[max-height,opacity,transform] duration-700 ease-in-out ${isAIConversationExpanded ? 'opacity-0 pointer-events-none max-h-0 -translate-y-6 scale-[0.985]' : 'opacity-100 max-h-[1200px] translate-y-0 scale-100'}`}
                  style={isDesktopLocked ? { flex: isAIConversationExpanded ? '0 1 0%' : '1 1 0%', minHeight: 0 } : undefined}
                >
                  <div className={`h-full min-h-0 ${isDesktopLocked ? 'flex flex-row gap-[14px]' : `grid grid-cols-1 lg:grid-cols-2 gap-4 ${portraitGridGapClass}`}`}>
                    {/* GLOBAL CKPI Card - CHANGE KPI styling with donut + filters + sparkline */}
                    <div
                      onClick={handleKPIDetailsClick}
                      style={portraitCardStyle}
                      className={`observatory-card ${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'bg-[#18181B] border-[#2e2e36] shadow-xl'} border rounded-lg p-3 flex items-stretch justify-between cursor-pointer transition-all duration-300 ${isLightTheme ? 'hover:bg-[#45d9a5] hover:border-emerald-700' : 'hover:bg-[#202025] hover:border-transparent'} group overflow-visible min-h-0 h-full ${isDesktopLocked ? 'flex-1' : ''}`}
                    >
                      {/* Left side - Title, Donut, Number */}
                      <div className="flex flex-col items-center justify-center min-w-0 h-full" style={{ flex: '0 0 auto', width: '45%' }}>
                        <div className="w-full flex items-center justify-center" style={cardTitleSlotStyle}>
                          <h3 style={cardTitleStyle} className={`font-extrabold uppercase mb-0 ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'} text-center font-montserrat`}>
                            GLOBAL CKPI
                          </h3>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                          {/* Donut chart with number */}
                          {(() => {
                            const ckpiValueRaw = typeof globalMetrics.globalAverageCKPI === 'number' ? globalMetrics.globalAverageCKPI : 0;
                            const ckpiValue = Number.isFinite(ckpiValueRaw) ? ckpiValueRaw : 0;
                            const donutPct = Math.max(0, Math.min(100, Math.round(ckpiValue)));
                            const ringSize = isDesktopLocked
                              ? (isMacAirLikeViewport
                                ? Math.max(142, Math.min(222, Math.round(desktopRowHeight * (0.54 * macAirFineTune))))
                                : Math.max(122, Math.min(196, Math.round(Math.min(viewportSize.width * 0.098, viewportSize.height * 0.245)))))
                              : 120;
                            const stroke = isDesktopLocked
                              ? Math.max(7, Math.min(10, Math.round(ringSize * 0.065)))
                              : 8;
                            const radius = (ringSize - stroke * 2) / 2;
                            const circumference = 2 * Math.PI * radius;
                            const offset = circumference - (donutPct / 100) * circumference;

                            return (
                              <div className="relative flex items-center justify-center" style={{ width: ringSize, height: ringSize }}>
                                <svg width={ringSize} height={ringSize} className="-rotate-90">
                                  <circle
                                    cx={ringSize / 2}
                                    cy={ringSize / 2}
                                    r={radius}
                                    stroke={isLightTheme ? 'rgba(255,255,255,0.35)' : '#27272A'}
                                    strokeWidth={stroke}
                                    fill="transparent"
                                  />
                                  <circle
                                    cx={ringSize / 2}
                                    cy={ringSize / 2}
                                    r={radius}
                                    stroke={isLightTheme ? '#ffffff' : '#10B981'}
                                    strokeWidth={stroke}
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span
                                    className={`font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'} tabular-nums leading-none whitespace-nowrap font-montserrat`}
                                    style={{ fontSize: isDesktopLocked ? (isMacAirLikeViewport ? fromRowTuned(0.31, 52, 108) : fluidClamp(48, 3.8, 90)) : '36px' }}
                                  >
                                    {donutPct}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className={`hidden lg:block w-px ${isLightTheme ? 'bg-emerald-200' : 'bg-[#27272A]'} mx-4 xl:mx-6 flex-shrink-0 h-full self-center max-h-28`} />

                      {/* Right side - Filters and Sparkline */}
                      <div className="min-w-0 flex flex-col pr-2 min-h-0" style={{ flex: '1 1 auto' }}>
                        {/* Filter dropdowns - align vertically with GLOBAL CKPI heading */}
                        <div ref={dropdownRef}
                          className="observatory-filters flex items-center justify-start md:justify-end gap-[min(2vw,8px)] lg:gap-[min(0.8vw,4px)] flex-nowrap overflow-visible relative"
                          style={cardTitleSlotStyle}
                        >
                          {[
                            { key: 'period', label: 'Period', type: 'single', options: ['all', '1y', '6m', '3m', '1m'] },
                            { key: 'ages', label: 'Age', type: 'multi', options: ['18-30', '31-45', '46-55', '56-65', '66+'] },
                            { key: 'functions', label: 'Function', type: 'multi', options: ['Marketing', 'Sales', 'HR', 'Engineering', 'Operations', 'Finance', 'Management', 'Other'] },
                            { key: 'orgSizes', label: 'Org size', type: 'multi', options: ['1-10', '11-50', '51-200', '201-1000', '1000+'] },
                            { key: 'orgTypes', label: 'Org type', type: 'multi', options: ['COMPANY', 'TEAM', 'UNIVERSITY', 'CLASSROOM'] }
                          ].map((filter, idx) => {
                            const isOpen = openDropdown === filter.key;
                            const selected = filters[filter.key];
                            const hasSelection = filter.type === 'single' ? selected !== '6m' : selected.length > 0;
                            const displayLabel = filter.type === 'single'
                              ? (selected === '6m' ? filter.label : selected)
                              : (selected.length === 0 ? filter.label : `${filter.label} (${selected.length})`);
                            return (
                              <div key={filter.key} data-idx={idx} className="observatory-filter-item shrink-0 relative">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); if (isOpen) { setOpenDropdown(null); } else { const r = e.currentTarget.getBoundingClientRect(); setDropdownPos({ top: r.bottom + 4, left: r.right - 160 }); setOpenDropdown(filter.key); } }}
                                  className={`observatory-filter-item shrink-0 px-3 py-1.5 lg:px-[min(0.75vw,12px)] lg:py-[min(0.25vw,4px)] rounded-lg ${isLightTheme ? 'bg-white/30 border-[#D6DEE5]/20 text-[#334155]' : 'bg-[#0B1220]/60 border-[#22304A] text-gray-200'} text-[min(3vw,12px)] sm:text-[min(2vw,11px)] md:text-[min(1.2vw,10px)] lg:text-[min(0.7vw,10px)] font-semibold flex items-center gap-[min(2vw,8px)] lg:gap-[min(0.5vw,6px)] ${hasSelection ? (isLightTheme ? 'ring-1 ring-white/50' : 'ring-1 ring-emerald-500/50') : ''}`}
                                >
                                  <span>{displayLabel}</span>
                                  <FaCaretDown className={`w-3 h-3 lg:w-[min(0.7vw,10px)] lg:h-[min(0.7vw,10px)] ${isLightTheme ? 'text-[#334155]/60' : 'text-gray-400'} ${isOpen ? 'rotate-180' : ''} transition-transform`} />
                                </button>
                                {isOpen && createPortal(
                                  <div onClick={(e) => e.stopPropagation()} className={`observatory-dropdown z-[9999] min-w-[160px] max-h-[50vh] overflow-y-auto rounded-lg border shadow-xl ${isLightTheme ? 'bg-white border-gray-200' : 'bg-[#18181B] border-[#2e2e36]'}`} style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left }}>
                                    {filter.type === 'single' && (
                                      <div className="py-1">
                                        {filter.options.map(opt => (
                                          <button
                                            key={opt}
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setFilters(prev => ({ ...prev, period: opt })); setOpenDropdown(null); }}
                                            className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${selected === opt
                                              ? (isLightTheme ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-500/10 text-emerald-400')
                                              : (isLightTheme ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-[#27272A]')
                                            }`}
                                          >
                                            {opt}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                    {filter.type === 'multi' && (
                                      <div className="py-1">
                                        {filter.options.map(opt => (
                                          <button
                                            key={opt}
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); toggleFilter(filter.key, opt); }}
                                            className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 ${selected.includes(opt)
                                              ? (isLightTheme ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-500/10 text-emerald-400')
                                              : (isLightTheme ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-[#27272A]')
                                            }`}
                                          >
                                            <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${selected.includes(opt)
                                              ? (isLightTheme ? 'bg-emerald-600 border-emerald-600' : 'bg-emerald-500 border-emerald-500')
                                              : (isLightTheme ? 'border-gray-300' : 'border-gray-600')
                                            }`}>
                                              {selected.includes(opt) && <span className="text-white text-[9px] font-bold">✓</span>}
                                            </span>
                                            {opt}
                                          </button>
                                        ))}
                                        {selected.length > 0 && (
                                          <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); clearFilter(filter.key); }}
                                            className={`w-full text-left px-3 py-2 text-xs font-semibold border-t transition-colors ${isLightTheme ? 'text-red-500 border-gray-100 hover:bg-red-50' : 'text-red-400 border-[#27272A] hover:bg-red-500/5'}`}
                                          >
                                            Clear all
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>,
                                  document.body
                                )}
                              </div>
                            );
                          })}
                          </div>

                        {/* Sparkline chart - move line + months closer to lower border */}
                        <div className="flex-1 min-h-0 flex flex-col justify-end pt-1">
                          {(() => {
                          const ckpiSeries = Array.isArray(ckpiTrend?.data) && ckpiTrend.data.length >= 2
                            ? ckpiTrend.data
                            : [58, 57, 62, 60, 61, 59, 60, 61, 62];
                          const sparkW = 620;
                          const sparkH = 120;
                          const sparkPad = 10;
                          const numericSeries = ckpiSeries.map((v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0));
                          const minV = Math.min(...numericSeries);
                          const maxV = Math.max(...numericSeries);
                          const rangeV = Math.max(1, maxV - minV);
                          const toX = (i) => sparkPad + (i * (sparkW - sparkPad * 2)) / (numericSeries.length - 1);
                          const toY = (v) => sparkPad + (1 - (v - minV) / rangeV) * (sparkH - sparkPad * 2);
                          const points = numericSeries.map((v, i) => ({ x: toX(i), y: toY(v) }));
                          let sparkPath = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
                          for (let i = 0; i < points.length - 1; i++) {
                            const p0 = points[i === 0 ? 0 : i - 1];
                            const p1 = points[i];
                            const p2 = points[i + 1];
                            const p3 = points[i + 2] || p2;
                            const cp1x = p1.x + (p2.x - p0.x) / 6;
                            const cp1y = p1.y + (p2.y - p0.y) / 6;
                            const cp2x = p2.x - (p3.x - p1.x) / 6;
                            const cp2y = p2.y - (p3.y - p1.y) / 6;
                            sparkPath += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
                          }
                          const baseY = toY(minV + rangeV * 0.3);

                          return (
                            <div className="flex flex-col h-full min-h-0 justify-end">
                              <div className="mt-auto h-[10vh] sm:h-[10vh] md:h-[10vh] lg:h-[5.5vh] w-full">
                                <svg viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
                                  <line x1="0" y1={baseY} x2={sparkW} y2={baseY} stroke={isLightTheme ? '#334155' : '#22304A'} strokeWidth="1" opacity={isLightTheme ? '0.15' : '0.65'} />
                                  <path d={sparkPath} fill="none" stroke={isLightTheme ? '#ffffff' : '#10B981'} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
                                </svg>
                              </div>
                              <div className={`pt-2 grid grid-cols-6 gap-2 text-[min(3vw,14px)] sm:text-[min(2vw,15px)] lg:text-[min(0.9vw,14px)] ${isLightTheme ? 'text-[#334155]/80' : 'text-gray-400'} leading-none`}>
                                {['start', '', '', '', '', 'today'].map((t, i) => (
                                  <div key={i} className={`text-center ${t ? '' : 'invisible'}`}>{t}</div>
                                ))}
                              </div>
                            </div>
                          );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* TOTAL TESTS Card - SHORTERS INVOLVED styling */}
                    <div
                      onClick={handleTotalTestDetailsClick}
                      style={portraitCardStyle}
                      className={`observatory-card ${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'bg-[#18181B] border-[#2e2e36] shadow-xl'} border rounded-lg p-3 flex items-stretch justify-between cursor-pointer transition-all duration-300 ${isLightTheme ? 'hover:bg-[#45d9a5] hover:border-emerald-700' : 'hover:bg-[#202025] hover:border-transparent'} group overflow-hidden min-h-0 h-full ${isDesktopLocked ? 'flex-1' : ''}`}
                    >
                      <div className="flex flex-col items-center justify-center flex-1 min-w-0 h-full">
                        <div className="w-full flex items-end justify-center" style={cardTitleSlotStyle}>
                          <h3 style={cardTitleStyle} className={`font-extrabold uppercase mb-0 ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'} text-center font-montserrat`}>
                            TOTAL TESTS
                          </h3>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                          <div
                            className={`font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'} tabular-nums leading-none tracking-tight text-center font-montserrat`}
                            style={isDesktopLocked ? kpiLargeNumberStyle : stackKpiNumberStyle}
                          >
                            {(() => {
                              const totalTestsValueRaw = typeof dashboardData.stats.totals?.totalTests === 'number' ? dashboardData.stats.totals.totalTests : 0;
                              return Math.round(totalTestsValueRaw).toString();
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className={`hidden lg:block w-px ${isLightTheme ? 'bg-emerald-200' : 'bg-[#27272A]'} mx-4 xl:mx-6 flex-shrink-0 h-full self-center max-h-28`} />

                      <div className="flex-1 min-w-0 flex flex-col justify-center pr-2">
                        <div className="space-y-3">
                          {[
                            { label: 'People', value: dashboardData.stats.totals?.peopleTotal || 0 },
                            { label: 'Organizations', value: dashboardData.stats.totals?.organizationsTotal || 0 },
                            { label: 'Countries', value: dashboardData.stats.totals?.countriesTotal || 0 }
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3" style={rightItemRowStyle}>
                              <div
                                style={{ ...rightItemTextStyle, ...rightItemLabelStyle }}
                                className={`${isLightTheme ? 'font-semibold text-[#0F172A]' : 'font-medium text-white'} lowercase tracking-wide font-montserrat`}
                              >
                                {item.label}
                              </div>
                              <div style={rightItemValueStyle} className={`font-semibold ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'} tabular-nums font-montserrat whitespace-nowrap`} title={item.value}>
                                {item.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Second row - EMERGING PROBLEMS and EMERGING SOLUTIONS - exactly 33% height */}
                <section
                  className={`min-h-0 px-0 py-0 overflow-hidden transform-gpu transition-[max-height,opacity,transform] duration-700 ease-in-out ${isAIConversationExpanded ? 'opacity-0 pointer-events-none max-h-0 -translate-y-6 scale-[0.985]' : 'opacity-100 max-h-[1200px] translate-y-0 scale-100'}`}
                  style={isDesktopLocked ? { flex: isAIConversationExpanded ? '0 1 0%' : '1 1 0%', minHeight: 0 } : undefined}
                >
                  <div className={`h-full min-h-0 ${isDesktopLocked ? 'flex flex-row gap-[14px]' : `grid grid-cols-1 lg:grid-cols-2 gap-4 ${portraitGridGapClass}`}`}>
                    {/* EMERGING PROBLEMS Card */}
                    <div
                      onClick={() => setShowEmergingProblems(true)}
                      style={portraitCardStyle}
                      className={`observatory-card ${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'bg-[#18181B] border-[#2e2e36] shadow-xl'} border rounded-lg p-3 flex items-stretch justify-between cursor-pointer transition-all duration-300 ${isLightTheme ? 'hover:bg-[#45d9a5] hover:border-emerald-700' : 'hover:bg-[#202025] hover:border-transparent'} group overflow-hidden min-h-0 h-full ${isDesktopLocked ? 'flex-1' : ''}`}
                    >
                      <div className="flex flex-col items-center justify-center flex-1 min-w-0 h-full">
                        <div className="w-full flex items-center justify-center" style={cardTitleSlotStyle}>
                          <h3 style={cardTitleStyle} className={`font-extrabold uppercase mb-0 ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'} text-center font-montserrat`}>
                            EMERGING PROBLEMS
                          </h3>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                          <div
                            className={`font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'} tabular-nums leading-none tracking-tight text-center font-montserrat`}
                            style={isDesktopLocked ? kpiLargeNumberStyle : stackKpiNumberStyle}
                          >
                            {(psOverview.problems || []).length}
                          </div>
                          <div style={deltaLabelStyle} className={`text-[11px] ${isLightTheme ? 'font-semibold text-[#334155]' : 'font-medium text-gray-400'} mt-1 whitespace-nowrap text-center font-montserrat`}>
                            0 vs week
                          </div>
                        </div>
                      </div>

                      <div className={`hidden lg:block w-px ${isLightTheme ? 'bg-emerald-200' : 'bg-[#27272A]'} mx-4 xl:mx-6 flex-shrink-0 h-full self-center max-h-28`} />

                      <div className="flex-1 min-w-0 flex flex-col justify-center pr-2">
                        <div className="space-y-3">
                          {(psOverview.problems || []).slice(0, 3).map((p, idx) => (
                            <div key={p.key ?? idx} className="flex items-center gap-3" style={rightItemRowStyle}>
                              <div
                                style={{ ...rightItemTextStyle, ...rightItemLabelStyle }}
                                className={`${isLightTheme ? 'font-semibold text-[#0F172A]' : 'font-medium text-white'} lowercase tracking-wide font-montserrat`}
                                title={p.cluster || 'No description'}
                              >
                                {String(p.cluster || '').slice(0, 34)}{String(p.cluster || '').length > 34 ? '...' : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* EMERGING SOLUTIONS Card */}
                    <div
                      onClick={() => setShowEmergingSolutions(true)}
                      style={portraitCardStyle}
                      className={`observatory-card ${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'bg-[#18181B] border-[#2e2e36] shadow-xl'} border rounded-lg p-3 flex items-stretch justify-between cursor-pointer transition-all duration-300 ${isLightTheme ? 'hover:bg-[#45d9a5] hover:border-emerald-700' : 'hover:bg-[#202025] hover:border-transparent'} group overflow-hidden min-h-0 h-full ${isDesktopLocked ? 'flex-1' : ''}`}
                    >
                      <div className="flex flex-col items-center justify-center flex-1 min-w-0 h-full">
                        <div className="w-full flex items-center justify-center" style={cardTitleSlotStyle}>
                          <h3 style={cardTitleStyle} className={`font-extrabold uppercase mb-0 ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'} text-center font-montserrat`}>
                            EMERGING SOLUTIONS
                          </h3>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                          <div
                            className={`font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'} tabular-nums leading-none tracking-tight text-center font-montserrat`}
                            style={isDesktopLocked ? kpiLargeNumberStyle : stackKpiNumberStyle}
                          >
                            {(psOverview.solutions || []).length}
                          </div>
                          <div style={deltaLabelStyle} className={`text-[11px] ${isLightTheme ? 'font-semibold text-[#334155]' : 'font-medium text-gray-400'} mt-1 whitespace-nowrap text-center font-montserrat`}>
                            0 vs week
                          </div>
                        </div>
                      </div>

                      <div className={`hidden lg:block w-px ${isLightTheme ? 'bg-emerald-200' : 'bg-[#27272A]'} mx-4 xl:mx-6 flex-shrink-0 h-full self-center max-h-28`} />

                      <div className="flex-1 min-w-0 flex flex-col justify-center pr-2">
                        <div className="space-y-3">
                          {(psOverview.solutions || []).slice(0, 3).map((s, idx) => (
                            <div key={s.key ?? idx} className="flex items-center gap-2" style={rightItemRowStyle}>
                              <div className="flex-1 min-w-0">
                                <div
                                  style={{ ...rightItemTextStyle, ...rightItemLabelStyle }}
                                  className={`${isLightTheme ? 'font-semibold text-[#0F172A]' : 'font-medium text-white'} lowercase tracking-wide font-montserrat`}
                                  title={s.cluster || 'No description'}
                                >
                                  {String(s.cluster || '').slice(0, 34)}{String(s.cluster || '').length > 34 ? '...' : ''}
                                </div>
                                <div className="flex gap-2 mt-0.5">
                                  {typeof s.avgImpact === 'number' && (
                                    <span className={`text-[10px] font-semibold ${isLightTheme ? 'text-emerald-800' : 'text-emerald-400'}`}>
                                      Impact {Math.round(s.avgImpact)}%
                                    </span>
                                  )}
                                  {typeof s.avgFeasibility === 'number' && (
                                    <span className={`text-[10px] font-semibold ${isLightTheme ? 'text-emerald-800' : 'text-emerald-400'}`}>
                                      Feas {Math.round(s.avgFeasibility)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Third row - TRANSFORMACHINE - exactly 33% height */}
                <section
                  className="min-h-0 px-0 py-0 flex flex-col overflow-hidden"
                  style={isDesktopLocked ? { flex: '1 1 0%', minHeight: 0 } : undefined}
                >
                  <div
                    className={`${isDesktopLocked ? 'flex-1 min-h-0' : (isAIConversationExpanded ? 'h-[78vh] min-h-[520px]' : 'h-[220px] lg:h-full lg:flex-1')} overflow-hidden relative flex flex-col origin-bottom ${isLightTheme ? 'border border-emerald-700 rounded-lg' : ''}`}
                    style={isAIConversationExpanded && isChatOpening ? { animation: `chatRiseIn ${chatOpenDurationMs}ms cubic-bezier(0.22, 1, 0.36, 1)` } : undefined}
                  >
                    <DataChatbot
                      onSendMessage={async (payload) => {
                        const { signal, ...bodyPayload } = payload;
                        const res = await api(chatEndpoint, {
                          method: 'POST',
                          body: JSON.stringify(bodyPayload),
                          signal
                        });
                        return res;
                      }}
                      onStreamMessage={async (payload) => {
                        const { signal, onChunk, ...bodyPayload } = payload;
                        return apiStream(`${chatEndpoint}/stream`, {
                          body: bodyPayload,
                          signal,
                          onEvent: (ev) => {
                            if (ev.type === 'chunk') onChunk(ev.data?.text || '');
                          }
                        });
                      }}
                      conversationId={aiConversationId}
                      onConversationIdChange={(id) => setAiConversationId(id)}
                      initialMessages={aiConversationLoaded ? aiInitialMessages : null}
                      onClearConversation={async () => {
                        try {
                          if (aiConversationId) await api(`/api/admin/dashboard/conversations/${aiConversationId}`, { method: 'DELETE' });
                        } catch (err) {
                          console.warn("Failed to clear conversation:", err?.message);
                        }
                        setAiConversationId(null);
                        setAiInitialMessages(null);
                      }}
                      placeholder="ASK AI - Augmented Intelligence: use change data to..."
                      title=""
                      maxHeight={isDesktopLocked ? '100%' : '320px'}
                      fillHeight={isDesktopLocked}
                      fullHeightQuery={true}
                      fullHeightExpanded={isAIConversationExpanded}
                      fullHeightQueryLabel={'TRANSFORMACHINE'}
                      storageKey="admin_dashboard_chat"
                      maxMessages={50}
                      className="dark-chatbot h-full"
                      compact={!isDesktopLocked}
                      suggestedQuestions={[]}
                      theme={isLightTheme ? 'light' : 'dark'}
                      fullHeightLabelStyleOverride={{
                        fontSize: cardTitleStyle?.fontSize,
                        letterSpacing: cardTitleStyle?.letterSpacing,
                        lineHeight: cardTitleStyle?.lineHeight || '1.15',
                        fontFamily: 'Montserrat, sans-serif',
                        color: isLightTheme ? '#22C58B' : undefined
                      }}
                      fullHeightHelperStyleOverride={{
                        fontSize: cardTitleStyle?.fontSize,
                        fontWeight: 400,
                        lineHeight: cardTitleStyle?.lineHeight || '1.15',
                        letterSpacing: cardTitleStyle?.letterSpacing,
                        fontFamily: 'Montserrat, sans-serif',
                        color: isLightTheme ? '#334155' : undefined
                      }}
                      onRequestExpand={handleRequestExpandChat}
                      onDashboardClick={onDashboardClick}
                    />
                  </div>
                </section>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* KPI Details Modal */}
      <KPIDetailsModal
        isOpen={showKPIDetails}
        onClose={() => setShowKPIDetails(false)}
        title="Change KPI Details"
        data={kpiDetailsData}
        isLightTheme={isLightTheme}
      />

      <TotalTestDetailsModal
        isOpen={showTotalTestDetails}
        onClose={() => setShowTotalTestDetails(false)}
        data={totalTestDetailsData}
        isLightTheme={isLightTheme}
      />

      <EmergingProblemsModal
        isOpen={showEmergingProblems}
        onClose={() => setShowEmergingProblems(false)}
        categories={psOverview.problemCategories || []}
        items={psOverview.problems || []}
        isLightTheme={isLightTheme}
      />

      <EmergingSolutionsModal
        isOpen={showEmergingSolutions}
        onClose={() => setShowEmergingSolutions(false)}
        categories={psOverview.solutionCategories || []}
        items={psOverview.solutions || []}
        isLightTheme={isLightTheme}
      />
    </div>
  );
}
