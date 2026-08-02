// src/components/manager/CompanyDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaExclamationTriangle,
  FaSync,
  FaArrowLeft
} from "react-icons/fa";
import useCompanyData from "../../hooks/useCompanyData";
import { api } from "../../utils/api";
import ReactMarkdown from "react-markdown";
import UsersTable from "./UsersTable";
import ShortTestModal from "./ShortTestModal";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import KPIDetailsModal from "../admin/KPIDetailsModal";
import SuccessNotificationModal from "../../models/SuccessNotificationModal";
import DeleteConfirmModal from "../../models/DeleteConfirmModal";
import ReportsModal from "./ReportsModal";
import AssignModal from "./AssignModal";
import DataChatbot from "../common/DataChatbot";

const AnimatedCounter = ({ value, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const targetValue = parseFloat(value);
  const isNumericValue = Number.isFinite(targetValue);

  useEffect(() => {
    let startTimestamp = null;
    
    if (!isNumericValue) {
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * targetValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(targetValue);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [isNumericValue, targetValue, duration]);

  return <>{isNumericValue ? count : value}</>;
};

const BASE_DESKTOP_WIDTH = 1600;
const BASE_DESKTOP_HEIGHT = 900;
const MIN_DESKTOP_WIDTH = 960;
const MIN_DESKTOP_HEIGHT = 540;
const MIN_DESKTOP_ASPECT = 1.0;
const CALIBRATION_TARGETS = [
  { w: 1440, h: 900, adjust: 0.025 },
  { w: 1512, h: 982, adjust: 0.02 },
  { w: 1728, h: 1117, adjust: 0.012 }
];
const ESTIMATED_HEADER_HEIGHT = 76;
const ESTIMATED_ROW_GAP_TOTAL = 16;
const ESTIMATED_VERTICAL_PADDING = 10;

function formatCluster(raw) {
  if (!raw || raw === 'uncategorized') return 'Uncategorized';
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export default function CompanyDashboard({ companyId }) {
  const navigate = useNavigate();

  const {
    companyName,
    users, 
    tests, 
    kpis,
    ckpiMetrics,
    problemSolutionData,
    loading, 
    error, 
    addUser, 
    updateUser, 
    deleteUser,
    assignTestToUsers,
    fetchUserTestReport,
    refetch 
  } = useCompanyData(companyId);

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [assignTargetSingle, setAssignTargetSingle] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [reportUserId, setReportUserId] = useState(null);
  const [isShortTestOpen, setIsShortTestOpen] = useState(false);
  const [showKPIDetails, setShowKPIDetails] = useState(false);
  const [showTopShorters, setShowTopShorters] = useState(false);
  const [showEmergingProblems, setShowEmergingProblems] = useState(false);
  const [showAllSolutions, setShowAllSolutions] = useState(false);
  const [shortTestDefaultId, setShortTestDefaultId] = useState(null);
  const [expandedProblemDetails, setExpandedProblemDetails] = useState({});
  const [expandedSolutionDetails, setExpandedSolutionDetails] = useState({});
  const [expandedShorterDetails, setExpandedShorterDetails] = useState({});
  const [shorterExplanations, setShorterExplanations] = useState({});
  const [isAIConversationExpanded, setIsAIConversationExpanded] = useState(false);
  const [isChatOpening, setIsChatOpening] = useState(false);
  const [layoutMode, setLayoutMode] = useState("desktop");
  const [viewportSize, setViewportSize] = useState({ width: BASE_DESKTOP_WIDTH, height: BASE_DESKTOP_HEIGHT });
  const [theme, setTheme] = useState(() => localStorage.getItem('observatoryTheme') === 'light' ? 'light' : 'dark');
  const chatOpenTimerRef = useRef(null);
  const chatOpenDurationMs = 1150;

  // Delete confirmation states
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);

  // Notification states
  const [successNotification, setSuccessNotification] = useState({
    isOpen: false,
    title: "",
    message: ""
  });


  useEffect(() => {
    return () => {
      if (chatOpenTimerRef.current) {
        clearTimeout(chatOpenTimerRef.current);
      }
    };
  }, []);

  // Push a history entry so browser back goes to home
  useEffect(() => {
    window.history.pushState({ from: 'companyDashboard' }, '', window.location.href);
    const handlePopState = () => navigate('/', { replace: true });
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

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

    let rafId = null;
    function handleResize() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateResponsiveLayout);
    }

    updateResponsiveLayout();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (layoutMode !== "desktop") return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverscrollBehavior = document.body.style.overscrollBehavior;
    const prevHtmlOverscrollBehavior = document.documentElement.style.overscrollBehavior;
    const prevBodyMargin = document.body.style.margin;
    const prevHtmlMargin = document.documentElement.style.margin;
    const prevBodyPadding = document.body.style.padding;
    const prevHtmlPadding = document.documentElement.style.padding;
    const prevBodyHeight = document.body.style.height;
    const prevHtmlHeight = document.documentElement.style.height;
    const prevBodyMinHeight = document.body.style.minHeight;
    const prevHtmlMinHeight = document.documentElement.style.minHeight;
    const prevBodyMaxHeight = document.body.style.maxHeight;
    const prevHtmlMaxHeight = document.documentElement.style.maxHeight;
    const prevBodyWidth = document.body.style.width;
    const prevHtmlWidth = document.documentElement.style.width;
    const prevBodyPosition = document.body.style.position;
    const prevBodyTop = document.body.style.top;
    const prevBodyLeft = document.body.style.left;
    const prevBodyRight = document.body.style.right;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.margin = "0";
    document.documentElement.style.margin = "0";
    document.body.style.padding = "0";
    document.documentElement.style.padding = "0";
    document.body.style.height = "100dvh";
    document.documentElement.style.height = "100dvh";
    document.body.style.minHeight = "100dvh";
    document.documentElement.style.minHeight = "100dvh";
    document.body.style.maxHeight = "100dvh";
    document.documentElement.style.maxHeight = "100dvh";
    document.body.style.width = "100%";
    document.documentElement.style.width = "100%";
    document.body.style.position = "fixed";
    document.body.style.top = "0";
    document.body.style.left = "0";
    document.body.style.right = "0";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overscrollBehavior = prevBodyOverscrollBehavior;
      document.documentElement.style.overscrollBehavior = prevHtmlOverscrollBehavior;
      document.body.style.margin = prevBodyMargin;
      document.documentElement.style.margin = prevHtmlMargin;
      document.body.style.padding = prevBodyPadding;
      document.documentElement.style.padding = prevHtmlPadding;
      document.body.style.height = prevBodyHeight;
      document.documentElement.style.height = prevHtmlHeight;
      document.body.style.minHeight = prevBodyMinHeight;
      document.documentElement.style.minHeight = prevHtmlMinHeight;
      document.body.style.maxHeight = prevBodyMaxHeight;
      document.documentElement.style.maxHeight = prevHtmlMaxHeight;
      document.body.style.width = prevBodyWidth;
      document.documentElement.style.width = prevHtmlWidth;
      document.body.style.position = prevBodyPosition;
      document.body.style.top = prevBodyTop;
      document.body.style.left = prevBodyLeft;
      document.body.style.right = prevBodyRight;
    };
  }, [layoutMode]);

  const {
    isDesktopLocked,
    viewportAspect,
    isUltraWideIrregularViewport,
    isPortraitStackViewport,
    isPortraitScreenshotViewport,
    constrainedDesktopWidth,
    isMacAirLikeViewport,
    isMacAir2020Viewport,
    isFullscreen1440x900,
    macAirFineTune,
    desktopRowHeight,
    fromRow,
    fromRowTuned,
    tallDesktopBoost,
    fluidClamp
  } = useMemo(() => {
    const isDesktopLocked = layoutMode === "desktop";
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
    const desktopRowHeight = isDesktopLocked
      ? Math.max(170, (viewportSize.height - ESTIMATED_HEADER_HEIGHT - ESTIMATED_ROW_GAP_TOTAL - ESTIMATED_VERTICAL_PADDING) / 3)
      : 0;
    const fromRow = (ratio, minPx, maxPx) => `${Math.max(minPx, Math.min(maxPx, desktopRowHeight * ratio))}px`;
    const fromRowTuned = (ratio, minPx, maxPx) => fromRow(ratio * macAirFineTune, minPx, maxPx);
    const tallDesktopBoost = viewportAspect <= 1.62 ? 1.28 : (viewportAspect <= 1.75 ? 1.16 : 1);
    const fluidClamp = (minPx, viewportWidthUnit, maxPx) => `clamp(${minPx}px, calc(${viewportWidthUnit}vw * ${tallDesktopBoost}), ${maxPx}px)`;

    return {
      isDesktopLocked,
      viewportAspect,
      isUltraWideIrregularViewport,
      isPortraitStackViewport,
      isPortraitScreenshotViewport,
      constrainedDesktopWidth,
      isMacAirLikeViewport,
      isMacAir2020Viewport,
      isFullscreen1440x900,
      macAirFineTune,
      desktopRowHeight,
      fromRow,
      fromRowTuned,
      tallDesktopBoost,
      fluidClamp
    };
  }, [layoutMode, viewportSize]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('observatoryTheme', next);
      return next;
    });
  };

  const isLightTheme = theme === "light";

  const {
    headerButtonStyle,
    portraitStackButtonStyle,
    portraitPanelRowGap,
    portraitGridGapClass,
    portraitCardStyle,
    cardTitleStyle,
    shortersTitleStyle,
    cardTitleSlotStyle,
    rightItemLabelStyle,
    metricLabelStyle,
    dashboardLabelStyle,
    deltaLabelStyle,
    rightItemTextStyle,
    rightItemValueStyle,
    kpiLargeNumberStyle,
    stackKpiNumberStyle,
    rightItemRowStyle,
    solutionItemLabelStyle
  } = useMemo(() => {
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

    const shortersTitleStyle = cardTitleStyle;
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

    const metricLabelStyle = isDesktopLocked
      ? {
          fontSize: isMacAirLikeViewport ? fromRowTuned(0.086, 14, 27) : fluidClamp(12, 0.95, 20),
          fontFamily: 'Montserrat, sans-serif'
        }
      : { fontSize: 'clamp(11px, 2.45vw, 15px)', fontFamily: 'Montserrat, sans-serif' };

    const dashboardLabelStyle = isDesktopLocked
      ? { fontSize: isMacAirLikeViewport ? fromRowTuned(0.062, 11, 19) : fluidClamp(11, 0.85, 16) }
      : undefined;
    const deltaLabelStyle = isDesktopLocked
      ? { fontSize: isMacAirLikeViewport ? fromRowTuned(0.064, 12, 22) : fluidClamp(12, 0.9, 18) }
      : undefined;
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
    const solutionItemLabelStyle = isDesktopLocked
      ? { lineHeight: isFullscreen1440x900 ? 1.72 : 1.66 }
      : { lineHeight: 1.5 };

    return {
      headerButtonStyle,
      portraitStackButtonStyle,
      portraitPanelRowGap,
      portraitGridGapClass,
      portraitCardStyle,
      cardTitleStyle,
      shortersTitleStyle,
      cardTitleSlotStyle,
      rightItemLabelStyle,
      metricLabelStyle,
      dashboardLabelStyle,
      deltaLabelStyle,
      rightItemTextStyle,
      rightItemValueStyle,
      kpiLargeNumberStyle,
      stackKpiNumberStyle,
      rightItemRowStyle,
      solutionItemLabelStyle
    };
  }, [layoutMode, viewportSize]);

  const CircularProgress = ({ percent }) => {
    const normalized = Math.max(0, Math.min(100, Number(percent) || 0));
    const size = isDesktopLocked
      ? (isMacAirLikeViewport
        ? Math.max(142, Math.min(222, Math.round(desktopRowHeight * (0.54 * macAirFineTune))))
        : Math.max(122, Math.min(196, Math.round(Math.min(viewportSize.width * 0.098, viewportSize.height * 0.245)))))
      : 120;

    const stroke = isDesktopLocked
      ? Math.max(isLightTheme ? 10 : 7, Math.min(isLightTheme ? 14 : 10, Math.round(size * (isLightTheme ? 0.085 : 0.065))))
      : (isLightTheme ? 10 : 8);

    const radius = (size - stroke * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (normalized / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isLightTheme ? "rgba(255,255,255,0.4)" : "#27272A"}
            strokeWidth={stroke}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isLightTheme ? "#FFFFFF" : "#10B981"}
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
            className={`font-bold ${isLightTheme ? 'text-gray-900' : 'text-emerald-500'} tabular-nums leading-none whitespace-nowrap font-montserrat`}
            style={{ fontSize: isDesktopLocked ? (isMacAirLikeViewport ? fromRowTuned(0.31, 52, 108) : fluidClamp(48, 3.8, 90)) : '36px' }}
          >
            {Math.round(normalized)}
          </span>
        </div>
      </div>
    );
  };

  const MetricBar = ({ label, value }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center font-bold uppercase tracking-wider font-montserrat" style={metricLabelStyle}>
        <span className={isLightTheme ? "text-gray-900" : "text-white"}>{label}</span>
      </div>

      <div className={`${isLightTheme ? 'h-[4px] bg-white/60' : 'h-[2px] bg-white'} rounded-none overflow-hidden`}>
        <div
          className={`h-full ${isLightTheme ? 'bg-white' : 'bg-emerald-500'} transition-all duration-1000`}
          style={{ width: `${Math.max(0, Math.min(100, Number(value) || 0))}%` }}
        />
      </div>
    </div>
  );

  // Recency sort helper — latest report date per category
  const getLatestDate = (cat) => {
    const dates = (cat.reports || []).map(r => new Date(r.date)).filter(d => !isNaN(d));
    return dates.length ? Math.max(...dates) : 0;
  };

  // Sort problemCategories and solutionCategories by recency (most recent first)
  const sortedProblemCategories = [...(problemSolutionData.problemCategories || [])].sort((a, b) => getLatestDate(b) - getLatestDate(a));
  const sortedSolutionCategories = [...(problemSolutionData.solutionCategories || [])].sort((a, b) => getLatestDate(b) - getLatestDate(a));

  // Card data — top 3 sorted by recency
  const emergingProblems = sortedProblemCategories.slice(0, 3).map(cat => ({
    label: cat.cluster,
    key: cat.key,
    value: cat.avgFinal,
    count: cat.count
  }));

  const desiredSolutions = sortedSolutionCategories.slice(0, 3).map(cat => ({
    label: cat.cluster,
    key: cat.key,
    value: cat.avgFinal,
    count: cat.count,
    feasibility: cat.avgFeasibility,
    proactivity: cat.avgProactivity,
    impact: cat.avgImpact,
    bestExample: cat.bestExample
  }));

  const getTwoWordDottedPreview = (text, limit = 2) => {
    const raw = String(text || '').trim();
    if (!raw) return 'No description available';
    const normalized = raw.replace(/\s+/g, ' ').trim();
    const words = normalized.split(' ').filter(Boolean);
    if (words.length <= limit) return normalized;
    return `${words.slice(0, limit).join(' ')}...`;
  };

  const getDottedPreviewByChars = (text, maxChars = 34) => {
    const raw = String(text || '').trim();
    if (!raw) return 'No description available';
    const normalized = raw.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxChars) return normalized;
    return `${normalized.slice(0, Math.max(6, maxChars - 3)).trimEnd()}...`;
  };

  const cardTextPreviewChars = isDesktopLocked
    ? (isMacAirLikeViewport ? 56 : 52)
    : 44;

  const toggleProblemDetails = (itemKey) => {
    setExpandedProblemDetails((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const toggleSolutionDetails = (itemKey) => {
    setExpandedSolutionDetails((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  async function toggleShorterDetails(itemKey, userId) {
    const isExpanding = !expandedShorterDetails[itemKey];
    setExpandedShorterDetails((prev) => ({
      ...prev,
      [itemKey]: isExpanding
    }));

    if (isExpanding && !shorterExplanations[itemKey]) {
      try {
        const result = await api(`/api/company/reports/user/${userId}/global-summary`);
        const explanation = result?.summary || 'No global explanation available.';
        setShorterExplanations((prev) => ({ ...prev, [itemKey]: explanation }));
      } catch (err) {
        console.error('Failed to load shorter explanation:', err);
        setShorterExplanations((prev) => ({ ...prev, [itemKey]: 'Failed to load explanation.' }));
      }
    }
  }

  function toggleUserSelection(userId) {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }

  function openAssignForUser(userId) {
    setAssignTargetSingle(userId);
    setIsAssignOpen(true);
  }

  function closeAssign() {
    setAssignTargetSingle(null);
    setIsAssignOpen(false);
  }

  async function handleCreateUser(newUser) {
    console.log("User created successfully:", newUser);
  }

  async function handleEditUser(updates) {
    try {
      await updateUser(editingUser.id, updates);
      setEditingUser(null);
      setSuccessNotification({
        isOpen: true,
        title: "User Updated",
        message: "User has been updated successfully!"
      });
    } catch (err) {
      setSuccessNotification({
        isOpen: true,
        title: "Update Failed",
        message: "Failed to update user: " + (err?.message || "Unknown error"),
        type: "warning"
      });
    }
  }

  function showDeleteUserConfirmation(userId) {
    setUserToDelete(userId);
    setShowDeleteUserModal(true);
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete);
      setShowDeleteUserModal(false);
      setSuccessNotification({
        isOpen: true,
        title: "User Deleted",
        message: "User has been deleted successfully!"
      });
    } catch (err) {
      setShowDeleteUserModal(false);
      setSuccessNotification({
        isOpen: true,
        title: "Delete Failed",
        message: "Failed to delete user: " + (err?.message || "Unknown error"),
        type: "warning"
      });
    } finally {
      setUserToDelete(null);
    }
  }

  function handleViewReports(userId) {
    setReportUserId(userId);
    setIsReportsOpen(true);
  }

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

  if (loading) {
    return (
      <div className={`min-h-screen p-4 lg:p-6 flex items-center justify-center ${isLightTheme ? 'bg-white' : 'bg-[#0a0e14]'}`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
          <p className={`${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>Loading company data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen p-4 lg:p-6 flex items-center justify-center ${isLightTheme ? 'bg-white' : 'bg-[#0a0e14]'}`}>
        <div className="text-center max-w-md">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isLightTheme ? 'bg-red-100' : 'bg-red-900/20'}`}>
            <FaExclamationTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>Failed to load data</h3>
          <p className={`mb-4 ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 mx-auto"
          >
            <FaSync className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isDesktopLocked ? 'fixed inset-0 h-[100dvh] overflow-hidden' : 'min-h-screen overflow-y-auto'} ${isLightTheme ? 'bg-white text-gray-900' : 'bg-black text-white'} font-montserrat selection:bg-emerald-500/30`}
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      <style>{`
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
      `}</style>
      <div className={`${isDesktopLocked ? 'h-full w-full flex items-start justify-center overflow-hidden p-4' : 'w-full px-0 py-0'}`}>
        <div
          className={`${isDesktopLocked ? '' : 'w-full'} ${isLightTheme ? 'bg-white' : 'bg-[#09090B]'}`}
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
          <div className={`${isDesktopLocked ? 'h-full flex flex-col px-0 py-0' : 'flex flex-col gap-0'}`} style={isDesktopLocked ? { height: '100%' } : undefined}>
            {/* Header - Completely removed spacing above buttons */}
            <header className={`flex flex-col lg:flex-row lg:items-start justify-between ${isDesktopLocked ? 'gap-0 px-0 pt-0 pb-0 mb-3' : 'gap-2 mb-2'} flex-shrink-0`}>
              <div>
                {isAIConversationExpanded ? (
                  <button
                    onClick={() => setIsAIConversationExpanded(false)}
                    style={isDesktopLocked ? headerButtonStyle : portraitStackButtonStyle}
                    className={`${isDesktopLocked ? 'px-4 py-1.5 text-[11px]' : 'px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px]'} bg-transparent border ${isLightTheme ? 'border-emerald-700' : 'border-emerald-500'} rounded-md font-bold uppercase tracking-wider whitespace-nowrap hover:bg-emerald-500/10 transition-colors ${isLightTheme ? 'text-gray-900' : 'text-white'} leading-none font-montserrat`}
                  >
                    Dashboard
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/')}
                      className={`${isLightTheme ? 'text-emerald-700 hover:text-emerald-900' : 'text-gray-400 hover:text-white'} transition-colors`}
                    >
                      <FaArrowLeft className="w-4 h-4" />
                    </button>
                    <h1 style={dashboardLabelStyle} className={`m-0 leading-none text-[10px] lg:text-xs font-medium tracking-[0.3em] ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} uppercase font-montserrat`}>
                      {companyName || 'Company'} DASHBOARD
                    </h1>
                    {localStorage.getItem('impersonatedCompanyId') && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-violet-500/10 border border-violet-500/30 text-violet-400 rounded text-[9px] lg:text-[10px] font-semibold tracking-wide font-montserrat">
                        IMPERSONATING
                        <button
                          onClick={() => {
                            localStorage.removeItem('impersonatedCompanyId');
                            window.location.reload();
                          }}
                          className="ml-1 text-violet-300 hover:text-white underline cursor-pointer"
                        >
                          Exit
                        </button>
                      </span>
                    )}
                    <button
                      onClick={() => navigate('/company/observatory')}
                      className="m-0 leading-none text-[10px] lg:text-xs font-medium tracking-[0.3em] text-[#22C58B] hover:text-emerald-700 transition-colors uppercase font-montserrat cursor-pointer"
                    >
                      {'>'} OBSERVATORY
                    </button>
                  </div>
                )}
              </div>

              <div className={`flex flex-wrap items-center ${isDesktopLocked ? 'gap-2' : (isPortraitStackViewport ? (isPortraitScreenshotViewport ? 'gap-2.5' : 'gap-3') : 'gap-2 lg:gap-3')}`}>
                <button
                  onClick={toggleTheme}
                  style={isDesktopLocked ? headerButtonStyle : portraitStackButtonStyle}
                  className={`${isDesktopLocked ? '' : 'px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px] lg:text-[12px]'} ${isLightTheme ? 'bg-white border border-emerald-700 text-gray-900 hover:bg-gray-50' : 'bg-[#18181B] border border-[#2e2e36] hover:bg-[#202025]'} rounded-lg font-bold uppercase tracking-widest whitespace-nowrap transition-colors font-montserrat`}
                >
                  {isLightTheme ? 'Theme:Dark' : 'Theme:Light'}
                </button>

                <button
                  onClick={() => setIsUserManagementOpen(true)}
                  style={isDesktopLocked ? headerButtonStyle : portraitStackButtonStyle}
                  className={`${isDesktopLocked ? '' : 'px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px] lg:text-[12px]'} ${isLightTheme ? 'bg-white border border-emerald-700 text-gray-900 hover:bg-gray-50' : 'bg-[#18181B] border border-[#2e2e36] hover:bg-[#202025]'} rounded-lg font-bold uppercase tracking-widest whitespace-nowrap transition-colors font-montserrat`}
                >
                  Manage People
                </button>

                <button
                  onClick={() => {
                    setShortTestDefaultId(null);
                    setIsShortTestOpen(true);
                  }}
                  style={isDesktopLocked ? headerButtonStyle : portraitStackButtonStyle}
                  className={`${isDesktopLocked ? '' : 'px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px] lg:text-[12px]'} bg-[#17be8e] ${isLightTheme ? 'text-[#0F172A] hover:bg-[#45d9a5] hover:border-transparent' : 'text-white hover:bg-[#15a87d]'} border border-emerald-700 rounded-lg font-bold uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 font-montserrat`}
                >
                  Launch shorTest
                </button>
              </div>
            </header>

            {/* Main content area - 3 equal-height rows with fixed desktop row gap */}
            <div
              className={`${isDesktopLocked ? 'flex-1 min-h-0 flex flex-col' : 'flex flex-col gap-0'}`}
              style={{ rowGap: isAIConversationExpanded ? 0 : portraitPanelRowGap }}
            >

              {/* First row - KPI and Shorters Involved - exactly 33% height */}
              <section
                className={`min-h-0 ${isDesktopLocked ? 'px-0 py-0' : 'px-0 py-0'} flex flex-col overflow-hidden transform-gpu will-change-[max-height,opacity,transform] transition-[max-height,opacity,transform] duration-700 ease-in-out ${isAIConversationExpanded ? 'opacity-0 pointer-events-none max-h-0 -translate-y-6 scale-[0.985]' : 'opacity-100 max-h-[1200px] translate-y-0 scale-100'}`}
                style={isDesktopLocked ? { flex: isAIConversationExpanded ? '0 1 0%' : '1 1 0%', minHeight: 0 } : undefined}
              >
                <div className={`h-full min-h-0 ${isDesktopLocked ? 'flex flex-row gap-[14px]' : `grid grid-cols-1 lg:grid-cols-2 ${portraitGridGapClass}`} ${isLightTheme ? 'bg-white' : ''}`}>
                  <div
                    onClick={() => setShowKPIDetails(true)}
                    style={portraitCardStyle}
                    className={`${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'bg-[#18181B] border-[#2e2e36] hover:bg-[#202025] shadow-xl'} border rounded-lg p-3 flex items-stretch justify-between cursor-pointer transition-all duration-300 ${isLightTheme ? 'hover:bg-[#45d9a5] hover:border-emerald-700' : (isPortraitScreenshotViewport ? 'hover:border-[#2e2e36]' : 'hover:border-transparent')} group overflow-hidden min-h-0 h-full ${isDesktopLocked ? 'flex-1' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center flex-1 min-w-0 h-full">
                      <div className="w-full flex items-center justify-center" style={cardTitleSlotStyle}>
                        <h3 style={cardTitleStyle} className={`font-extrabold uppercase mb-0 ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'} text-center font-montserrat`}>
                          CHANGE KPI
                        </h3>
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center w-full">
                        <CircularProgress percent={kpis.changeKpiPercent ?? 0} />
                      </div>
                    </div>

                    <div className={`hidden lg:block w-px ${isLightTheme ? 'bg-emerald-200' : 'bg-[#27272A]'} mx-4 xl:mx-6 flex-shrink-0 h-full self-center max-h-28`} />

                    <div className="flex-1 min-w-0 flex flex-col justify-center pr-2">
                      <div className="space-y-3">
                        <MetricBar label="critical thinking" value={Math.round(ckpiMetrics.averages?.criticalThinking ?? 0)} />
                        <MetricBar label="creativity" value={Math.round(ckpiMetrics.averages?.originality ?? 0)} />
                        <MetricBar label="feasibility" value={Math.round(ckpiMetrics.averages?.feasibility ?? 0)} />
                      </div>
                    </div>
                  </div>

                  {/* SHORTERS INVOLVED Card */}
                  <div
                    onClick={() => setShowTopShorters(true)}
                    style={portraitCardStyle}
                    className={`${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'bg-[#18181B] border-[#2e2e36] hover:bg-[#202025] shadow-xl'} border rounded-lg p-3 flex items-stretch justify-between cursor-pointer transition-all duration-300 ${isLightTheme ? 'hover:bg-[#45d9a5] hover:border-emerald-700' : (isPortraitScreenshotViewport ? 'hover:border-[#2e2e36]' : 'hover:border-transparent')} group overflow-hidden min-h-0 h-full ${isDesktopLocked ? 'flex-1' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center flex-1 min-w-0 h-full">
                      <div className="w-full flex items-end justify-center" style={cardTitleSlotStyle}>
                        <h3 style={shortersTitleStyle} className={`font-extrabold uppercase mb-0 ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'} text-center font-montserrat`}>
                          SHORTERS INVOLVED
                        </h3>
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center w-full">
                        <div
                          className={`font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'} tabular-nums leading-none tracking-tight text-center font-montserrat`}
                          style={isDesktopLocked ? kpiLargeNumberStyle : stackKpiNumberStyle}
                        >
                          <AnimatedCounter value={kpis.activeUsers ?? 0} />
                        </div>
                        <div style={deltaLabelStyle} className={`text-[11px] ${isLightTheme ? 'font-semibold text-[#334155]' : 'font-medium text-gray-400'} mt-1 whitespace-nowrap text-center font-montserrat`}>
                          {kpis.usersDelta >= 0 ? `↑ ${kpis.usersDelta} vs week` : `${kpis.usersDelta} vs week`}
                        </div>
                      </div>
                    </div>

                    <div className={`hidden lg:block w-px ${isLightTheme ? 'bg-emerald-200' : 'bg-[#27272A]'} mx-4 xl:mx-6 flex-shrink-0 h-full self-center max-h-28`} />

                    <div className="flex-1 min-w-0 flex flex-col justify-center pr-2">
                      <div className="space-y-3">
                        {(kpis.topShorters || []).slice(0, 3).map((shorter, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-3" style={rightItemRowStyle}>

                            <div
                              style={{ ...rightItemTextStyle, ...rightItemLabelStyle }}
                              className={`${isLightTheme ? 'font-semibold text-[#0F172A]' : 'font-medium text-white'} lowercase tracking-wide font-montserrat`}
                              title={(shorter.name || '').toLowerCase()}
                            >
                              {getTwoWordDottedPreview((shorter.name || '').toLowerCase())}
                            </div>
                            <div style={rightItemValueStyle} className={`font-semibold ${isLightTheme ? 'text-gray-900' : 'text-emerald-500'} tabular-nums font-montserrat whitespace-nowrap`}>
                              CKPI {Math.round(Number(shorter.avgCKPI ?? 0))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Second row - EMERGING PROBLEMS and SHORT SOLUTIONS - exactly 33% height */}
              <section
                className={`min-h-0 ${isDesktopLocked ? 'px-0 py-0' : 'px-0 py-0'} overflow-hidden transform-gpu will-change-[max-height,opacity,transform] transition-[max-height,opacity,transform] duration-700 ease-in-out ${isAIConversationExpanded ? 'opacity-0 pointer-events-none max-h-0 -translate-y-6 scale-[0.985]' : 'opacity-100 max-h-[1200px] translate-y-0 scale-100'}`}
                style={isDesktopLocked ? { flex: isAIConversationExpanded ? '0 1 0%' : '1 1 0%', minHeight: 0 } : undefined}
              >
                <div className={`h-full min-h-0 ${isDesktopLocked ? 'flex flex-row gap-[14px]' : `grid grid-cols-1 lg:grid-cols-2 ${portraitGridGapClass}`} ${isLightTheme ? 'bg-white' : ''}`}>

                  {/* EMERGING PROBLEMS Card */}
                  <div
                    onClick={() => setShowEmergingProblems(true)}
                    style={portraitCardStyle}
                    className={`${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'bg-[#18181B] border-[#2e2e36] hover:bg-[#202025] shadow-xl'} border rounded-lg p-3 flex items-stretch justify-between cursor-pointer transition-all duration-300 ${isLightTheme ? 'hover:bg-[#45d9a5] hover:border-emerald-700' : (isPortraitScreenshotViewport ? 'hover:border-[#2e2e36]' : 'hover:border-transparent')} group overflow-hidden min-h-0 h-full ${isDesktopLocked ? 'flex-1' : ''}`}
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
                          <AnimatedCounter value={problemSolutionData.totalProblemCount ?? 0} />
                        </div>
                        <div style={deltaLabelStyle} className={`text-[11px] ${isLightTheme ? 'font-semibold text-[#334155]' : 'font-medium text-gray-400'} mt-1 whitespace-nowrap text-center font-montserrat`}>
                          {problemSolutionData.totalReportsDelta != null
                            ? (problemSolutionData.totalReportsDelta >= 0 ? `↑ ${problemSolutionData.totalReportsDelta} vs week` : `${problemSolutionData.totalReportsDelta} vs week`)
                            : '0 vs week'}
                        </div>
                      </div>
                    </div>

                    <div className={`hidden lg:block w-px ${isLightTheme ? 'bg-emerald-200' : 'bg-[#27272A]'} mx-4 xl:mx-6 flex-shrink-0 h-full self-center max-h-28`} />

                    <div className="flex-1 min-w-0 flex flex-col justify-center pr-2">
                      <div className="space-y-3">
                        {(emergingProblems || []).slice(0, 3).map((p, idx) => (
                          <div key={p.key ?? idx} className="flex items-center justify-between gap-3" style={rightItemRowStyle}>

                            <div
                              style={{ ...rightItemTextStyle, ...rightItemLabelStyle }}
                              className={`${isLightTheme ? 'font-semibold text-[#0F172A]' : 'font-medium text-white'} lowercase tracking-wide font-montserrat`}
                              title={p.label || p.key || 'No description'}
                            >
                              {getDottedPreviewByChars(p.label || p.key || 'No description', cardTextPreviewChars)}
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* EMERGING SOLUTIONS Card */}
                  <div
                    onClick={() => setShowAllSolutions(true)}
                    style={portraitCardStyle}
                    className={`${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'bg-[#18181B] border-[#2e2e36] hover:bg-[#202025] shadow-xl'} border rounded-lg p-3 flex items-stretch justify-between cursor-pointer transition-all duration-300 ${isLightTheme ? 'hover:bg-[#45d9a5] hover:border-emerald-700' : (isPortraitScreenshotViewport ? 'hover:border-[#2e2e36]' : 'hover:border-transparent')} group overflow-hidden min-h-0 h-full ${isDesktopLocked ? 'flex-1' : ''}`}
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
                          <AnimatedCounter value={problemSolutionData.totalSolutionCount ?? 0} />
                        </div>
                        <div style={deltaLabelStyle} className={`text-[11px] ${isLightTheme ? 'font-semibold text-[#334155]' : 'font-medium text-gray-400'} mt-1 whitespace-nowrap text-center font-montserrat`}>
                          {problemSolutionData.newSolutionsToday != null
                            ? `↑ ${problemSolutionData.newSolutionsToday} vs week`
                            : '0 vs week'}
                        </div>
                      </div>
                    </div>

                    <div className={`hidden lg:block w-px ${isLightTheme ? 'bg-emerald-200' : 'bg-[#27272A]'} mx-4 xl:mx-6 flex-shrink-0 h-full self-center max-h-28`} />

                    <div className="flex-1 min-w-0 flex flex-col justify-center pr-2">
                      <div className="space-y-3">
                        {(desiredSolutions || []).slice(0, 3).map((s, idx) => (
                          <div key={s.key ?? idx} className="flex items-center justify-between gap-3" style={rightItemRowStyle}>

                            <div
                              style={{ ...rightItemTextStyle, ...rightItemLabelStyle, ...solutionItemLabelStyle }}
                              className={`${isLightTheme ? 'font-semibold text-[#0F172A]' : 'font-medium text-white'} lowercase tracking-wide font-montserrat`}
                              title={s.label || s.bestExample || 'No description'}
                            >
                              {getDottedPreviewByChars(s.label || s.cluster || 'No description', cardTextPreviewChars)}
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
                className={`min-h-0 ${isDesktopLocked ? 'px-0 py-0' : 'px-0 py-0 min-h-[220px]'} flex flex-col overflow-hidden`}
                style={isDesktopLocked ? { flex: isAIConversationExpanded ? '1 1 0%' : '1 1 0%', minHeight: 0 } : undefined}
              >
                <div
                  className={`${isDesktopLocked ? 'flex-1 min-h-0' : (isAIConversationExpanded ? 'h-[78vh] min-h-[520px]' : 'h-[220px]')} overflow-hidden relative flex flex-col origin-bottom ${isLightTheme ? 'border border-emerald-700 rounded-lg' : ''}`}
                  style={isAIConversationExpanded && isChatOpening ? { animation: `chatRiseIn ${chatOpenDurationMs}ms cubic-bezier(0.22, 1, 0.36, 1)` } : undefined}
                >
                    <DataChatbot
                      onSendMessage={async (payload) => {
                        const { signal, ...bodyPayload } = payload;
                        const { api } = await import("../../utils/api");
                        const res = await api('/api/company/reports/query', {
                          method: 'POST',
                          body: JSON.stringify(bodyPayload),
                          signal
                        });
                        return res;
                      }}
                      placeholder="ASK AI - Augmented Intelligence of your team: use change data to.."
                      title=""
                      maxHeight={isDesktopLocked ? '100%' : '320px'}
                      fillHeight={isDesktopLocked}
                      fullHeightQuery={true}
                      fullHeightExpanded={isAIConversationExpanded}
                      fullHeightQueryLabel={'TRANSFORMACHINE'}
                      onConversationStateChange={(active) => {
                        // Keep chat open on mobile once user taps into query field.
                      }}
                      onRequestExpand={handleRequestExpandChat}
                      theme={isLightTheme ? 'light' : 'dark'}
                      storageKey={`company_${companyId}_dashboard_chat`}
                      maxMessages={50}
                      className={`${isLightTheme ? 'light-chatbot' : 'dark-chatbot'} h-full`}
                      compact={!isDesktopLocked}
                      suggestedQuestions={[]}
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
                    />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreate={handleCreateUser}
        companyId={companyId}
        addUser={addUser}
        isOverUserManagement={isUserManagementOpen}
        theme={isLightTheme ? 'light' : 'dark'}
      />

      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onUpdate={handleEditUser}
      />

      <ReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        userId={reportUserId}
        userName={(users.find(u => u.id === reportUserId) || {}).name}
        theme={theme}
      />

      <KPIDetailsModal
        isOpen={showKPIDetails}
        onClose={() => setShowKPIDetails(false)}
        title="Company CKPI Analysis"
        data={ckpiMetrics}
        isLightTheme={isLightTheme}
      />

      <AssignModal
        isOpen={isAssignOpen}
        onClose={closeAssign}
        userIds={assignTargetSingle ? [assignTargetSingle] : []}
        tests={tests}
        assignTestToUsers={assignTestToUsers} 
        companyId={companyId}
      />

      {isShortTestOpen && (
        <ShortTestModal
          isOpen={isShortTestOpen}
          onClose={() => {
            setIsShortTestOpen(false);
            setShortTestDefaultId(null);
          }}
          tests={tests}
          users={users}
          assignTestToUsers={assignTestToUsers}
          theme={isLightTheme ? 'light' : 'dark'}
          defaultTestId={shortTestDefaultId}
        />
      )}

      {/* User Management Modal */}
      {isUserManagementOpen && (
        <div className={`fixed inset-0 ${isLightTheme ? 'bg-black/60' : 'bg-black/80'} flex items-center justify-center z-40 p-4`}>
          <div className={`${isLightTheme ? 'bg-white border border-emerald-700' : 'bg-[#09090B] border border-emerald-500'} rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isLightTheme ? 'border-emerald-200' : 'border-[#2e2e36]'}`}>
              <h2 className={`text-lg font-semibold ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>User management</h2>
              <button
                onClick={() => setIsUserManagementOpen(false)}
                className={`px-3 py-1.5 text-[13px] font-bold uppercase tracking-widest ${isLightTheme ? 'bg-gray-100 border-emerald-700 text-gray-700 hover:bg-gray-200' : 'bg-[#18181B] border-[#2e2e36] text-gray-300 hover:bg-[#202025]'} border rounded-md`}
              >
                Chiudi
              </button>
            </div>

            {/* Modal Content - Users Table */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-200px)]">
              <UsersTable
                users={users}
                selectedIds={selectedUserIds}
                onToggleSelect={toggleUserSelection}
                onAssignClick={(userId) => openAssignForUser(userId)}
                onDelete={showDeleteUserConfirmation}
                onEdit={(user) => setEditingUser(user)}
                onReport={handleViewReports}
                onAddUser={() => setIsAddOpen(true)}
                theme={theme}
              />
            </div>

            {/* Modal Footer */}
            <div className={`flex items-center justify-between p-6 border-t ${isLightTheme ? 'border-emerald-200 bg-white' : 'border-[#2e2e36] bg-[#09090B]'}`}>
              <div className={`text-sm ${isLightTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                Total Users: <span className={`font-medium ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>{users.length}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsUserManagementOpen(false)}
                  className={`px-4 py-2 ${isLightTheme ? 'bg-gray-100 border-emerald-700 text-gray-700 hover:bg-gray-200' : 'bg-[#18181B] border-[#2e2e36] text-gray-300 hover:bg-[#202025]'} border text-sm font-medium rounded-md transition-all duration-200`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteUserModal}
        onClose={() => setShowDeleteUserModal(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />

      {/* Success Notification Modal */}
      <SuccessNotificationModal
        isOpen={successNotification.isOpen}
        onClose={() => setSuccessNotification({ ...successNotification, isOpen: false })}
        title={successNotification.title}
        message={successNotification.message}
        type={successNotification.type || "success"}
        duration={3000}
      />

      {/* Top Shorters Modal */}
      {showTopShorters && (
        <div className={`fixed inset-0 ${isLightTheme ? 'bg-black/60' : 'bg-black/80'} z-[60] flex items-center justify-center p-4`}>
          <div className={`${isLightTheme ? 'bg-white border-emerald-700' : 'bg-[#09090B] border-emerald-500'} border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200`}>
            <div className={`px-8 py-6 border-b ${isLightTheme ? 'border-emerald-200' : 'border-[#2e2e36]'} flex items-start justify-between flex-shrink-0`}>
              <div>
                <h3 className={`text-2xl font-bold ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>Top Shorters</h3>
                <p className={`text-sm ${isLightTheme ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Ordered by CKPI</p>
              </div>
              <button
                onClick={() => setShowTopShorters(false)}
                className={`px-6 py-2 bg-transparent border ${isLightTheme ? 'border-emerald-700 text-gray-700 hover:bg-gray-100' : 'border-[#3f3f46] text-gray-200 hover:bg-[#202025]'} rounded-lg text-[13px] font-black uppercase tracking-widest transition-colors`}
              >
                CHIUDI
              </button>
            </div>
            <div className={`max-h-[520px] overflow-y-auto p-6 space-y-4 flex-1 min-h-0 ${isLightTheme ? 'bg-white' : ''}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {(kpis.topShorters || []).length > 0 ? (
                <>
                  {kpis.topShorters.map((shorter, idx) => {
                    const shorterItemKey = shorter.id ?? `shorter-${idx}`;
                    const isShorterExpanded = !!expandedShorterDetails[shorterItemKey];
                    const explanationText = shorterExplanations[shorterItemKey];
                    return (
                      <div key={shorterItemKey}>
                        <div
                          onClick={() => toggleShorterDetails(shorterItemKey, shorter.id)}
                          className={`rounded-2xl border p-5 flex items-center justify-between cursor-pointer transition-transform duration-200 hover:scale-[1.01] ${isLightTheme ? 'bg-[#22C58B] border-emerald-700 hover:bg-[#1db47a]' : 'bg-[#18181B] border-emerald-500 hover:bg-[#202025]'}`}
                        >
                          <div className={`font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>
                            <span className={`tabular-nums ${isLightTheme ? 'text-[#0F172A]/60' : 'text-gray-400'}`}>{idx + 1}.</span>{' '}
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowTopShorters(false);
                                setReportUserId(shorter.id);
                                setIsReportsOpen(true);
                              }}
                              className={`${isLightTheme ? 'text-[#0F172A] hover:underline cursor-pointer' : 'text-gray-100 hover:underline cursor-pointer'}`}
                            >{shorter.name}</span>
                          </div>
                          <div className={`tabular-nums ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'}`}>
                            <span className="font-normal">CKPI </span><span className="font-black">{Math.round(Number(shorter.avgCKPI ?? 0))}</span>
                          </div>
                        </div>
                        {isShorterExpanded && (
                          <div className={`mt-2 rounded-2xl border p-5 ${isLightTheme ? 'bg-white border-emerald-700' : 'bg-[#18181B] border-emerald-500'}`}>
                            <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                              EXPLANATION
                            </div>
                            {explanationText === undefined ? (
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${isLightTheme ? 'border-emerald-500' : 'border-emerald-500'}`} />
                                <span className={`text-sm ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>Loading explanation...</span>
                              </div>
                            ) : (
                              <p className={`text-sm leading-relaxed ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>
                                {explanationText}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="text-center py-16">
                  <FaUsers className={`${isLightTheme ? 'text-gray-300' : 'text-gray-700'} w-12 h-12 mx-auto mb-3`} />
                  <p className={`${isLightTheme ? 'text-gray-500' : 'text-gray-500'} font-medium`}>No user data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emerging Problems Modal */}
      {showEmergingProblems && (
        <div className={`fixed inset-0 ${isLightTheme ? 'bg-black/60' : 'bg-black/80'} flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300`}>
          <div
            className={`${isLightTheme ? 'bg-white border-emerald-700' : 'bg-[#09090B] border-emerald-500'} border rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col`}
          >
            <div className={`px-8 py-6 border-b ${isLightTheme ? 'border-emerald-200' : 'border-[#2e2e36]'} flex items-start justify-between`}>
              <div>
                <h3 className={`text-2xl font-bold ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>Emerging Problems</h3>
                <p className={`text-sm ${isLightTheme ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Problems grouped by category, sorted by recency</p>
              </div>
              <button
                onClick={() => setShowEmergingProblems(false)}
                className={`px-6 py-2 bg-transparent border ${isLightTheme ? 'border-emerald-700 text-gray-700 hover:bg-gray-100' : 'border-[#3f3f46] text-gray-200 hover:bg-[#202025]'} rounded-lg text-[13px] font-black uppercase tracking-widest transition-colors`}
              >
                CHIUDI
              </button>
            </div>

            <div className={`p-6 max-h-[520px] overflow-y-auto ${isLightTheme ? 'bg-white' : ''}`}>
              {(problemSolutionData.problemCategories || []).length === 0 ? (
                <div className="text-center py-16">
                  <div className={`${isLightTheme ? 'text-gray-500' : 'text-gray-600'} italic`}>No emerging problems identified yet.</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedProblemCategories.map((category) => {
                    const categoryKey = category.key || category.cluster || 'uncategorized';
                    const isProblemExpanded = !!expandedProblemDetails[categoryKey];
                    return (
                      <div key={categoryKey} className={`problem-card rounded-2xl border p-6 ${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'border-emerald-500 bg-[#18181B]'}`}>
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleProblemDetails(categoryKey)}
                        >
                          <div className={`text-lg font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                            {formatCluster(category.cluster)}
                          </div>
                        </div>
                        {isProblemExpanded && (
                          <div className="mt-4 space-y-3">
                            {(category.reports || []).map((report, rIdx) => (
                              <div key={report.id ?? rIdx} className={`rounded-xl border p-4 ${isLightTheme ? 'bg-white/80 border-emerald-600' : 'bg-[#202025] border-[#2e2e36]'}`}>
                                <p className={`text-sm leading-relaxed ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>
                                  {report.summary || 'No description available'}
                                </p>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const customTest = tests.find(t => t.isCustom);
                                setShortTestDefaultId(customTest?.id || null);
                                setShowEmergingProblems(false);
                                setIsShortTestOpen(true);
                              }}
                              className={`mt-2 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-md border transition-colors ${isLightTheme ? 'border-[#0B3D2E] text-[#0F172A] hover:bg-[#0B3D2E]/10' : 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10'}`}
                            >
                              RELAUNCH IN A SHORTEST
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Solutions Modal */}
      {showAllSolutions && (
        <div className={`fixed inset-0 ${isLightTheme ? 'bg-black/60' : 'bg-black/80'} flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300`}>
          <div
            className={`top-solutions-modal ${isLightTheme ? 'bg-white border-emerald-700' : 'bg-[#09090B] border-emerald-500'} border rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col`}
          >
            <div className={`px-8 py-6 border-b ${isLightTheme ? 'border-emerald-200' : 'border-[#2e2e36]'} flex items-start justify-between`}>
              <div>
                <h3 className={`text-2xl font-bold ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>Top Solutions</h3>
                <p className={`text-sm ${isLightTheme ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Solutions grouped by category, sorted by recency</p>
              </div>
              <button
                onClick={() => setShowAllSolutions(false)}
                className={`px-6 py-2 bg-transparent border ${isLightTheme ? 'border-emerald-700 text-gray-700 hover:bg-gray-100' : 'border-[#3f3f46] text-gray-200 hover:bg-[#202025]'} rounded-lg text-[13px] font-black uppercase tracking-widest transition-colors`}
              >
                CHIUDI
              </button>
            </div>

            <div className={`p-6 overflow-y-auto max-h-[520px] space-y-4 ${isLightTheme ? 'bg-white' : ''}`}>
              {(problemSolutionData.solutionCategories || []).length === 0 ? (
                <div className="text-center py-12">
                  <div className={`${isLightTheme ? 'text-gray-500' : 'text-gray-600'} italic`}>No solutions identified yet.</div>
                </div>
              ) : (
                sortedSolutionCategories.map((category) => {
                  const categoryKey = category.key || category.cluster || 'uncategorized';
                  const isSolutionExpanded = !!expandedSolutionDetails[categoryKey];
                  return (
                    <div key={categoryKey} className={`solution-card rounded-2xl border p-6 ${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'border-emerald-500 bg-[#18181B]'}`}>
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSolutionDetails(categoryKey)}
                      >
                        <div className={`text-lg font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                          {formatCluster(category.cluster)}
                        </div>
                        <div className="solution-stats flex items-center gap-4">
                          <div className={`text-sm ${isLightTheme ? 'text-gray-700' : 'text-gray-400'}`}>Feasibility: <span className={`font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'}`}>{category.avgFeasibility ?? 'N/A'}%</span></div>
                          <div className={`text-sm ${isLightTheme ? 'text-gray-700' : 'text-gray-400'}`}>Impact: <span className={`font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'}`}>{category.avgImpact ?? 'N/A'}%</span></div>
                        </div>
                      </div>
                      {isSolutionExpanded && (
                        <div className="mt-4 space-y-3">
                          {(category.reports || []).map((report, rIdx) => (
                            <div key={report.id ?? rIdx} className={`rounded-xl border p-4 ${isLightTheme ? 'bg-white/80 border-emerald-600' : 'bg-[#202025] border-[#2e2e36]'}`}>
                              <p className={`text-sm leading-relaxed ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>
                                {report.summary || 'No description available'}
                              </p>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const customTest = tests.find(t => t.isCustom);
                              setShortTestDefaultId(customTest?.id || null);
                              setShowAllSolutions(false);
                              setIsShortTestOpen(true);
                            }}
                            className={`mt-2 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-md border transition-colors ${isLightTheme ? 'border-[#0B3D2E] text-[#0F172A] hover:bg-[#0B3D2E]/10' : 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10'}`}
                          >
                            RELAUNCH IN A SHORTEST
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
      {/* Mobile CSS overrides — ONLY applies below 640px, desktop untouched */}
      <style>{`
        @media (max-width: 640px) {
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
          /* Cards */
          .border.rounded-lg.p-3.flex.items-stretch {
            padding: 8px 10px !important;
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
          /* Top Solutions modal */
          .solution-card > div:first-child {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 6px !important;
          }
          .solution-card .solution-stats {
            width: 100% !important;
            gap: 12px !important;
          }
          /* Top Solutions modal container */
          .top-solutions-modal {
            max-height: 100vh !important;
            border-radius: 16px !important;
            margin: 8px !important;
          }
          .top-solutions-modal .overflow-y-auto {
            max-height: calc(100vh - 120px) !important;
          }
        }
        /* Landscape mobile: tighter padding, full width */
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
    </div>
  );
}
