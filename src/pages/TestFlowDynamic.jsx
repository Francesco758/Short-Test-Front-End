import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SuccessNotificationModal from "../models/SuccessNotificationModal";
import TestSubmitModal from "../models/TestSubmitModal";
import { 
  FaPaperPlane, 
  FaRobot, 
  FaUser, 
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaArrowLeft,
  FaPlayCircle,
  FaClock,
  FaClipboardCheck,
  FaMagic,
  FaChartLine
} from 'react-icons/fa';
import { api } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import TopNav from '../components/layout/TopNav';
import ChartRenderer from '../components/ui/ChartRenderer';
import KPIDetailsModal from '../components/admin/KPIDetailsModal';
import StartShortTestModal from '../components/user/StartShortTestModal';

export default function TestFlowDynamic() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const userName = user?.name || '';
  const [assignedTests, setAssignedTests] = useState([]);
  const [allTests, setAllTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testAttemptId, setTestAttemptId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isCustom, setIsCustom] = useState(false);
  const [managerBrief, setManagerBrief] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showKPIDetails, setShowKPIDetails] = useState(false);
  const [showProblemsModal, setShowProblemsModal] = useState(false);
  const [showSolutionsModal, setShowSolutionsModal] = useState(false);
  const [ckpiMetrics, setCkpiMetrics] = useState(null);
  const [teamProblems, setTeamProblems] = useState([]);
  const [teamSolutions, setTeamSolutions] = useState([]);
  const [teamActionLoading, setTeamActionLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState({});
  const [briefType, setBriefType] = useState(null);

  // Self-serve "Start a shorTest"
  const [availableShorTests, setAvailableShorTests] = useState([]);
  const [shorTestGate, setShorTestGate] = useState({ pendingCount: 0, pendingLimit: 5, canStartNew: true });
  const [showStartShortTestModal, setShowStartShortTestModal] = useState(false);
  const [shorTestLoading, setShorTestLoading] = useState(false);
  const [launchingShorTest, setLaunchingShorTest] = useState(false);
  
  // Success notification state
  const [successNotification, setSuccessNotification] = useState({
    isOpen: false,
    title: "",
    message: ""
  });
  const [reportReady, setReportReady] = useState(false);
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const [typingStates, setTypingStates] = useState({});
  const typingTimerRef = useRef(null);
  const messageIndexRef = useRef(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [theme, setTheme] = useState(() => localStorage.getItem('observatoryTheme') === 'light' ? 'light' : 'dark');
  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('observatoryTheme', next);
      return next;
    });
  };
  const isLightTheme = theme === 'light';

  const goToDashboard = async () => {
    setSelectedTest(null);
    setReportReady(false);
    setTestCompleted(false);
    setTestAttemptId(null);
    setMessages([]);
    setTypingStates({});
    setBriefType(null);
    window.scrollTo(0, 0);
    setTimeout(() => {
      fetchAssignedTests();
      fetchCKPIMetrics();
      fetchTeamProblems();
      fetchTeamSolutions();
      fetchAvailableShorTests();
    }, 2500);
  };

  useEffect(() => {
    fetchAssignedTests();
    fetchCKPIMetrics();
    fetchTeamProblems();
    fetchTeamSolutions();
    fetchAvailableShorTests();
  }, []);



  const fetchCKPIMetrics = async () => {
    try {
      const metrics = await api('/api/user/reports/ckpi-metrics');
      setCkpiMetrics(metrics);
    } catch (err) {
      console.error('Failed to fetch CKPI metrics:', err);
    }
  };

  const fetchTeamProblems = async () => {
    try {
      const data = await api('/api/team/problems');
      setTeamProblems(data || []);
    } catch (err) {
      console.error('Failed to fetch team problems:', err);
    }
  };

  const fetchTeamSolutions = async () => {
    try {
      const data = await api('/api/team/solutions');
      setTeamSolutions(data || []);
    } catch (err) {
      console.error('Failed to fetch team solutions:', err);
    }
  };

  const handleLike = async (solutionId) => {
    try {
      setLikeLoading(prev => ({ ...prev, [solutionId]: true }));
      const result = await api(`/api/team/solutions/${solutionId}/like`, { method: 'POST' });
      setTeamSolutions(prev => prev.map(s =>
        s.id === solutionId ? { ...s, likes: result.likes, likedByMe: result.liked } : s
      ));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setLikeLoading(prev => ({ ...prev, [solutionId]: false }));
    }
  };

  const handleStartProblemTest = async (problem) => {
    try {
      setTeamActionLoading(true);
      setBriefType('problem');
      const result = await api('/api/team/start-problem', {
        method: 'POST',
        body: JSON.stringify({ problemId: problem.id })
      });
      setSelectedTest({ id: result.userTestId, test: { title: problem.topic } });
      startTest(result.userTestId);
    } catch (err) {
      console.error('Failed to start problem test:', err);
      setError(err?.error || err?.message || 'Failed to start problem');
    } finally {
      setTeamActionLoading(false);
    }
  };

  const handleStartSolutionTest = async (solution) => {
    try {
      setTeamActionLoading(true);
      setBriefType('solution');
      const result = await api('/api/team/start-solution', {
        method: 'POST',
        body: JSON.stringify({ solutionId: solution.id })
      });
      setSelectedTest({ id: result.userTestId, test: { title: solution.topic } });
      startTest(result.userTestId);
    } catch (err) {
      console.error('Failed to start solution test:', err);
      setError(err?.error || err?.message || 'Failed to start solution improvement');
    } finally {
      setTeamActionLoading(false);
    }
  };

  // ==================== SELF-SERVE "START A shorTEST" ====================

  // Standard shorTests the user may start on their own, plus the pending-test gate.
  // Never throws — same pattern as the other dashboard fetchers.
  const fetchAvailableShorTests = async () => {
    try {
      const data = await api('/api/user/tests/available');
      const tests = Array.isArray(data?.tests) ? data.tests : [];
      setAvailableShorTests(tests);
      setShorTestGate({
        pendingCount: data?.pendingCount ?? 0,
        pendingLimit: data?.pendingLimit ?? 5,
        canStartNew: data?.canStartNew !== false
      });
      return { tests, canStartNew: data?.canStartNew !== false, error: null };
    } catch (err) {
      console.error('Failed to fetch available shorTests:', err);
      return { tests: [], canStartNew: true, error: err };
    }
  };

  // Click on the "Start a shorTest" tile: start straight away when there is
  // nothing to choose (a single shorTest with nothing pending), otherwise open
  // the selection / pending pop-up.
  const handleOpenStartShortTest = async () => {
    if (shorTestLoading || launchingShorTest) return;
    setError(null);
    setShorTestLoading(true);
    try {
      const { tests, canStartNew, error: fetchError } = await fetchAvailableShorTests();

      if (fetchError) {
        setError(fetchError?.error || fetchError?.message || 'Failed to load available shorTests');
        return;
      }

      const onlyTest = tests.length === 1 ? tests[0] : null;
      if (onlyTest && onlyTest.pendingCount === 0 && canStartNew) {
        await launchShorTest(onlyTest.testId);
        return;
      }

      setShowStartShortTestModal(true);
    } finally {
      setShorTestLoading(false);
    }
  };

  // Launch a brand new shorTest: the backend creates the assignment and the
  // existing conversation flow then runs exactly like a manager-assigned test.
  const launchShorTest = async (testId) => {
    try {
      setLaunchingShorTest(true);
      setError(null);
      const result = await api('/api/user/tests/launch', {
        method: 'POST',
        body: JSON.stringify({ testId, source: 'web' })
      });

      setShowStartShortTestModal(false);
      setSelectedTest({ id: result.userTestId, test: { title: result.title } });
      await startTest(result.userTestId, { source: 'web' });
      fetchAssignedTests();
      fetchAvailableShorTests();
    } catch (err) {
      console.error('Failed to start shorTest:', err);
      // The pop-up stays open so the reason (e.g. pending limit) remains visible
      setError(err?.error || err?.message || 'Failed to start shorTest');
    } finally {
      setLaunchingShorTest(false);
    }
  };

  useEffect(() => {    scrollToBottom();
  }, [messages, typingStates]);

  useEffect(() => {
    let timer;
    if (showCompletionBanner) {
      timer = setTimeout(() => {
        setShowCompletionBanner(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showCompletionBanner]);

  // Typing animation: progressively reveal AI response text
  const typingStatesRef = useRef({});
  useEffect(() => {
    typingStatesRef.current = typingStates;
  }, [typingStates]);

  const isAnimating = Object.keys(typingStates).some(k => !typingStates[k]?.done);
  useEffect(() => {
    if (!isAnimating) return;

    const interval = 20;
    const charsPerTick = 2;

    typingTimerRef.current = setInterval(() => {
      const current = typingStatesRef.current;
      const keys = Object.keys(current);
      if (keys.length === 0) {
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        return;
      }

      setTypingStates(prev => {
        const next = { ...prev };
        let allDone = true;

        for (const key of keys) {
          const state = next[key];
          if (!state || state.done) continue;
          if (state.displayedChars < state.fullContent.length) {
            allDone = false;
            next[key] = {
              ...state,
              displayedChars: Math.min(state.fullContent.length, state.displayedChars + charsPerTick)
            };
          } else {
            next[key] = { ...state, done: true };
          }
        }

        if (allDone) {
          if (typingTimerRef.current) {
            clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
          }
          return {};
        }

        return next;
      });
    }, interval);

    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [isAnimating]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAssignedTests = async () => {
    try {
      setLoading(true);
      const data = await api('/api/user/tests/assigned');
      const tests = Array.isArray(data) ? data : data?.tests || [];
      setAllTests(tests);
      setAssignedTests(tests.filter(t => t.status !== 'COMPLETED'));
    } catch (err) {
      console.error('Failed to fetch tests:', err);
      setError('Failed to load assigned tests');
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (userTestId, launchOptions = {}) => {
    try {
      setStarting(true);
      setError(null);
      
      const result = await api('/api/conversation/start', {
        method: 'POST',
        body: JSON.stringify({ userTestId, ...launchOptions })
      });

      setTestAttemptId(result.testAttemptId);
      setIsCustom(result.isCustom || false);
      setManagerBrief(result.brief || null);

      // Prefer the full messages array (includes components, timestamps, etc.)
      // Fallback to the single gptResponse field for older API shapes.
      if (result.messages && result.messages.length > 0) {
        const formatted = result.messages.map((m, i) => ({
          ...m,
          timestamp: new Date(m.createdAt)
        }));
        setMessages(formatted);
        messageIndexRef.current = formatted.length;
        // Start typing for the last AI message (only if test is not already complete)
        const lastMsg = formatted[formatted.length - 1];
        if (lastMsg && lastMsg.role !== 'user' && !result.isCompleted) {
          setTypingStates({
            [formatted.length - 1]: { fullContent: lastMsg.content || '', displayedChars: 0, done: false }
          });
        }
      } else if (result.gptResponse) {
        const assistantMsg = {
          role: 'assistant',
          content: result.gptResponse,
          timestamp: new Date(),
          components: result.components || null
        };
        setMessages([assistantMsg]);
        messageIndexRef.current = 1;
        setTypingStates({
          0: { fullContent: result.gptResponse || '', displayedChars: 0, done: false }
        });
      }

      setTestCompleted(result.isCompleted || false);
      
      // Focus input after starting
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error('Failed to start test:', err);
      setError(err?.error || err?.message || 'Failed to start test');
    } finally {
      setStarting(false);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || loading || testCompleted) return;

    const message = userInput.trim();
    setUserInput('');

    // Add user message to UI immediately
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => {
      const next = [...prev, userMessage];
      messageIndexRef.current = next.length;
      return next;
    });

    try {
      setLoading(true);
      setError(null);

      const result = await api('/api/conversation/message', {
        method: 'POST',
        body: JSON.stringify({
          userTestId: selectedTest.id,
          message
        })
      });

      // Check if test should be completed BEFORE adding AI message to UI
      const completionKeywords = [
        'assessment is now complete', 'completed the assessment', 'finished the assessment',
        'end of the assessment', 'assessment is complete', 'concluded the assessment',
        'generating your report', 'generated your report', 'here is your report',
        'here is your final evaluation', 'your test is complete', 'this test is now complete',
        'you have completed the', 'your results have been recorded', 'shortest is now complete',
        'test is now complete', 'the assessment is finished'
      ];
      const hasCompletionPhrase = result.gptResponse && completionKeywords.some(k =>
        result.gptResponse.toLowerCase().includes(k)
      );

      if (result.suggestedCompletion || result.isCompleted || hasCompletionPhrase) {
        setTestCompleted(true);
        setShowCompletionBanner(true);
        await completeTest();
      } else {
        // Only show AI response if test is NOT completing
        if (result.gptResponse || (result.components && Object.keys(result.components).length > 0)) {
          const gptMessage = {
            role: 'assistant',
            content: result.gptResponse || '',
            timestamp: new Date(),
            components: result.components || null
          };
          const aiIndex = messageIndexRef.current; // This will be the AI message's index
          setMessages(prev => {
            const next = [...prev, gptMessage];
            messageIndexRef.current = next.length;
            return next;
          });
          // Start typing animation for this message
          setTypingStates(prev => ({
            ...prev,
            [aiIndex]: { fullContent: result.gptResponse || '', displayedChars: 0, done: false }
          }));
        } else {
          console.warn('Received empty GPT response');
          const fallbackMsg = {
            role: 'assistant',
            content: "I'm sorry, I encountered an issue processing that. Could you please rephrase or try again?",
            timestamp: new Date()
          };
          setMessages(prev => {
            const next = [...prev, fallbackMsg];
            messageIndexRef.current = next.length;
            return next;
          });
        }
      }

    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err?.error || err?.message || 'Failed to send message');
      // Keep user message visible on rate-limit errors, remove on other errors
      if (err?.status !== 429) {
        setMessages(prev => prev.filter(m => m !== userMessage));
      }
    } finally {
      setLoading(false);
    }
  };

  async function completeTest(retryCount = 0) {
    if (completing && retryCount === 0) return;
    
    try {
      setCompleting(true);
      setError(null);

      const result = await api('/api/conversation/complete', {
        method: 'POST',
        body: JSON.stringify({
          userTestId: selectedTest.id
        })
      });

      // Save report data to localStorage for immediate access
      if (result.evaluation) {
        const ev = result.evaluation;
        const reportPayload = {
          percentage: ev.overallScore || 0,
          summary: ev.summary || 'Assessment completed',
          kpis: {
            final: ev.overallScore || 0,
            components: {
              creativity: ev.creativity ?? 0,
              feasibility: ev.feasibility ?? 0,
              proactivity: ev.proactivity ?? 0
            },
            evaluationMetadata: {
              confidence: ev.confidence ?? null
            }
          }
        };
        localStorage.setItem('lastReport', JSON.stringify(reportPayload));
      }

      setReportReady(true);
      
    } catch (err) {
      console.error('Failed to complete test:', err);
      
      const errorMsg = err?.error || err?.message || '';
      const isConflict = err.status === 409 || errorMsg.includes('already being processed') || errorMsg.includes('already completed');

      // If it's already completed or being processed, we can try to redirect anyway
      if (isConflict) {
        if (retryCount < 10) {
          setError('Finalizing report, please wait...');
          const delay = Math.min(2000 + (retryCount * 1000), 5000);
          setTimeout(() => {
            completeTest(retryCount + 1);
          }, delay);
          return;
        } else {
          // If we've retried a lot and still get 409, maybe the report IS actually there
          setReportReady(true);
          return;
        }
      }
      
      setError(err?.error || err?.message || 'Failed to complete assessment');
      setCompleting(false);
    }
  };
  const handleConfirmLeave = () => {
    setSelectedTest(null);
    setMessages([]);
    setTypingStates({});
    setTestAttemptId(null);
    setTestCompleted(false);
    setShowLeaveModal(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Test selection screen
  if (!selectedTest) {
    return (
      <div className={`min-h-screen flex flex-col font-montserrat selection:bg-emerald-500/30 ${isLightTheme ? 'bg-white text-black' : 'bg-[#09090B] text-white'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <style>{`
          @keyframes rpltBorderPulse {
            0%, 100% {
              box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.55), 0 0 0 rgba(16, 185, 129, 0);
            }
            50% {
              box-shadow: 0 0 0 1px rgba(16, 185, 129, 1), 0 0 18px rgba(16, 185, 129, 0.25);
            }
          }
           .rplt-border-pulse {
             animation: rpltBorderPulse 1.6s ease-in-out infinite;
           }
           @keyframes dotFlash {
             0%, 100% { background-color: #FACC15; }
             50% { background-color: #FFFFFF; }
           }
           .dot-flash {
             animation: dotFlash 1.2s ease-in-out infinite;
           }
            .explanation-scroll {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            .explanation-scroll::-webkit-scrollbar {
              display: none;
            }
            .explanation-scroll:hover {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            .explanation-scroll:hover::-webkit-scrollbar {
              display: none;
            }
           @media (max-width: 640px) {
             .change-kpi-title {
               text-align: center !important;
               max-width: 100% !important;
             }
             .change-kpi-subtitle {
               text-align: center !important;
               max-width: 100% !important;
             }
             .explanation-title {
               text-align: center !important;
             }
             .explanation-text {
               text-align: center !important;
             }
             .change-story-section {
               margin-bottom: 16px !important;
             }
             .metrics-section {
               margin-bottom: 20px !important;
             }
           }
         `}</style>
        {/* Header */}
        <header className="flex items-center justify-between px-3 sm:px-4 lg:px-5 py-3 sm:py-4">
          <div className={`text-[10px] sm:text-xs font-medium tracking-[0.3em] uppercase ${isLightTheme ? 'text-[#334155]' : 'text-gray-500'}`}>
            {userName ? `${userName} DASHBOARD` : 'USER DASHBOARD'}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className={`px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-semibold rounded-md transition-colors uppercase tracking-wider ${isLightTheme ? 'bg-white text-[#0F172A] border border-emerald-700 hover:bg-[#ECEFF1]' : 'text-gray-300 bg-[#18181B] border border-[#2e2e36] hover:bg-[#202025]'}`}>
              <span className="hidden sm:inline">Theme:</span> {isLightTheme ? 'Dark' : 'Light'}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-3 sm:px-4 lg:px-5 py-3 sm:py-4 lg:pt-4 lg:pb-2">
          <div className="w-full space-y-4 sm:space-y-5">
            
            {/* Change KPI Card */}
              <div className={`border rounded-xl p-4 sm:p-5 lg:p-6 shadow-xl ${isLightTheme ? 'bg-[#22C58B] border-emerald-700' : 'bg-[#18181B] border-emerald-500'}`}>
                {(() => {
                  const completed = allTests.filter(t => t.status === 'COMPLETED' && t.report);
                  const valid = completed.filter(t => t.report?.summary);
                  const latestReport = valid.length > 0 ? valid.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b).report : null;
                  const avgKpi = valid.length 
                    ? Math.round(valid.reduce((acc, t) => acc + (t.report?.kpis?.final ?? 0), 0) / valid.length)
                    : 0;

                  const metrics = [
                    { label: 'Critical Thinking', value: Math.round(ckpiMetrics?.averages?.criticalThinking ?? 0) },
                    { label: 'Originality', value: Math.round(ckpiMetrics?.averages?.originality ?? 0) },
                    { label: 'Feasibility', value: Math.round(ckpiMetrics?.averages?.feasibility ?? 0) },
                    { label: 'Proactivity', value: Math.round(ckpiMetrics?.averages?.proactivity ?? 0) },
                    { label: 'Simplification', value: Math.round(ckpiMetrics?.averages?.simplification ?? 0) },
                    { label: 'Impact', value: Math.round(ckpiMetrics?.averages?.impact ?? 0) },
                  ].map(m => ({ ...m, value: Number.isFinite(m.value) ? m.value : 0 }));

                  const trendSeriesRaw = valid
                    .map(t => t.report?.kpis?.final)
                    .filter(v => typeof v === 'number' && Number.isFinite(v));

                  const trendSeries = (
                    trendSeriesRaw.length >= 2
                      ? trendSeriesRaw
                      : trendSeriesRaw.length === 1
                        ? [trendSeriesRaw[0], trendSeriesRaw[0]]
                        : [0, 0]
                  ).slice(-8);
                  const w = 180;
                  const h = 56;
                  const padX = 0;
                  const padY = 4;
                  const min = Math.min(...trendSeries);
                  const max = Math.max(...trendSeries);
                  const range = Math.max(1, max - min);
                  const toX = (i) => padX + (i * (w - padX * 2)) / Math.max(1, trendSeries.length - 1);
                  const toY = (v) => padY + ((max - v) * (h - padY * 2)) / range;
                  const pts = trendSeries.map((v, i) => ({ x: toX(i), y: toY(v) }));
                  let sparkPath = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
                  for (let i = 0; i < pts.length - 1; i++) {
                    const p0 = pts[i === 0 ? 0 : i - 1];
                    const p1 = pts[i];
                    const p2 = pts[i + 1];
                    const p3 = pts[i + 2] || p2;
                    const cp1x = p1.x + (p2.x - p0.x) / 6;
                    const cp1y = p1.y + (p2.y - p0.y) / 6;
                    const cp2x = p2.x - (p3.x - p1.x) / 6;
                    const cp2y = p2.y - (p3.y - p1.y) / 6;
                    sparkPath += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
                  }

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_1fr_1fr] gap-4 sm:gap-5 items-stretch">
                      {/* Donut (left) */}
                      <div className="flex items-center justify-center lg:justify-start">
                        <div className="relative w-44 h-44 sm:w-52 sm:h-52 lg:w-56 lg:h-56 flex-shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              fill="none"
                              stroke={`${isLightTheme ? 'rgba(255,255,255,0.4)' : '#27272a'}`}
                              strokeWidth="10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              fill="none"
                              stroke={`${isLightTheme ? '#FFFFFF' : '#10B981'}`}
                              strokeWidth="10"
                              strokeLinecap="round"
                              strokeDasharray={`${Math.max(0, Math.min(100, avgKpi)) * 2.64} 264`}
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-4xl sm:text-5xl lg:text-5xl font-extrabold tabular-nums ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>{Math.max(0, Math.min(100, avgKpi))}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Title + trend + your change story (middle) */}
                      <div className="min-w-0 flex flex-col justify-between h-full pt-2 pb-0">
                        <div>
                          <h2 className={`change-kpi-title text-[24px] sm:text-[28px] lg:text-[32px] font-extrabold uppercase leading-none mb-1 tracking-wider ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>Change KPI</h2>
                          <p className={`change-kpi-subtitle text-[12px] sm:text-[13px] lg:text-[14px] max-w-[220px] leading-relaxed ${isLightTheme ? 'text-gray-900' : 'text-gray-400'}`}>overall psychometric index of observed change.</p>
                        </div>
                        <div className="mt-auto mb-2">
                          <svg
                            viewBox={`0 0 ${w} ${h}`}
                            preserveAspectRatio="none"
                            className="w-full h-[56px] sm:h-[64px] lg:h-[72px] block"
                            aria-hidden="true"
                          >
                            <path
                              d={sparkPath}
                              fill="none"
                              stroke={`${isLightTheme ? '#FFFFFF' : '#10B981'}`}
                              strokeWidth="2"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <div className={`change-story-section text-sm sm:text-base lg:text-lg font-medium italic text-left ${isLightTheme ? 'text-gray-900' : 'text-emerald-500'}`}>
                          your change story
                        </div>
                      </div>

                      {/* Metrics (right-middle) */}
                      <div className="metrics-section flex flex-col justify-start h-full pt-0.5 max-w-[280px] pl-20">
                        {metrics.map((metric, idx) => (
                          <div key={idx} className="pt-2 pb-2 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm sm:text-base font-medium ${isLightTheme ? 'text-gray-900' : 'text-gray-300'}`}>{metric.label}</span>
                              <span className={`text-xs sm:text-sm font-bold ${isLightTheme ? 'text-gray-900' : 'text-emerald-500'}`}>{metric.value}%</span>
                            </div>
                            <div className={`mt-2 h-[4px] overflow-hidden ${isLightTheme ? 'bg-white/40' : 'bg-[#27272A]'}`}>
                              <div
                                className={`h-full rounded-none ${isLightTheme ? 'bg-white' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.max(0, Math.min(100, metric.value))}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Explanation (rightmost) */}
                      <div className="flex flex-col justify-start h-full pt-0.5 pl-4">
                        <h3 className={`explanation-title text-[22px] sm:text-[26px] lg:text-[30px] font-medium italic mb-3 ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>EXPLANATION</h3>
                        <div className="explanation-scroll relative overflow-y-auto max-h-[180px] sm:max-h-[200px] lg:max-h-[220px] pr-1">
                          <p className={`explanation-text text-[12px] sm:text-[13px] lg:text-[14px] leading-relaxed ${isLightTheme ? 'text-gray-900' : 'text-gray-400'}`}>
                            {ckpiMetrics?.globalSummary || latestReport?.summary || (completed.length > 0 ? 'Evaluation completed.' : 'Complete your first assessment to see your evaluation.')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>



            {/* Start a shorTest / Problems & Solutions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
              {/* Start a shorTest */}
              <button
                onClick={handleOpenStartShortTest}
                disabled={shorTestLoading || launchingShorTest}
                className={`border rounded-xl p-4 sm:p-5 lg:p-6 shadow-xl text-left transition-colors cursor-pointer h-full flex flex-col justify-center min-h-[96px] sm:min-h-[108px] disabled:opacity-60 disabled:cursor-wait ${isLightTheme ? 'bg-white border-emerald-700 hover:bg-gray-50' : 'bg-[#22C58B] border-emerald-500 hover:bg-[#1a9e6e]'}`}
              >
                <h3 className={`text-lg sm:text-xl font-extrabold uppercase tracking-wide ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                  Start a shorTest
                </h3>
                {shorTestLoading || launchingShorTest ? (
                  <p className={`text-xs sm:text-sm mt-2 ${isLightTheme ? 'text-gray-500' : 'text-white/80'}`}>
                    Loading...
                  </p>
                ) : !shorTestGate.canStartNew ? (
                  <p className={`text-xs sm:text-sm mt-2 ${isLightTheme ? 'text-amber-700' : 'text-amber-300'}`}>
                    Complete one of your {shorTestGate.pendingCount} pending tests
                  </p>
                ) : availableShorTests.length > 0 ? (
                  <p className={`text-xs sm:text-sm mt-2 ${isLightTheme ? 'text-gray-500' : 'text-white/80'}`}>
                    {availableShorTests.length} shorTest{availableShorTests.length !== 1 ? 's' : ''} available
                  </p>
                ) : null}
              </button>

              {/* Join a Problem */}
              <button
                onClick={() => setShowProblemsModal(true)}
                className={`border rounded-xl p-4 sm:p-5 lg:p-6 shadow-xl text-left transition-colors cursor-pointer h-full flex flex-col justify-center min-h-[96px] sm:min-h-[108px] ${isLightTheme ? 'bg-white border-emerald-700 hover:bg-gray-50' : 'bg-[#22C58B] border-emerald-500 hover:bg-[#1a9e6e]'}`}
              >
                <h3 className={`text-lg sm:text-xl font-extrabold uppercase tracking-wide ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                  Join a Problem
                </h3>
                {teamProblems.length > 0 && (
                  <p className={`text-xs sm:text-sm mt-2 ${isLightTheme ? 'text-gray-500' : 'text-white/80'}`}>
                    {teamProblems.length} problem{teamProblems.length !== 1 ? 's' : ''} available
                  </p>
                )}
              </button>

              {/* Improve a Solution */}
              <button
                onClick={() => setShowSolutionsModal(true)}
                className={`border rounded-xl p-4 sm:p-5 lg:p-6 shadow-xl text-left transition-colors cursor-pointer h-full flex flex-col justify-center min-h-[96px] sm:min-h-[108px] ${isLightTheme ? 'bg-white border-emerald-700 hover:bg-gray-50' : 'bg-[#22C58B] border-emerald-500 hover:bg-[#1a9e6e]'}`}
              >
                <h3 className={`text-lg sm:text-xl font-extrabold uppercase tracking-wide ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                  Improve a Solution
                </h3>
                {teamSolutions.length > 0 && (
                  <p className={`text-xs sm:text-sm mt-2 ${isLightTheme ? 'text-gray-500' : 'text-white/80'}`}>
                    {teamSolutions.length} solution{teamSolutions.length !== 1 ? 's' : ''} available
                  </p>
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className={`p-3 sm:p-4 rounded-lg border ${isLightTheme ? 'bg-red-50 border-red-200' : 'bg-red-900/30 border-red-800'}`}>
                <p className={`text-xs sm:text-sm ${isLightTheme ? 'text-red-600' : 'text-red-400'}`}>{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12 sm:py-16">
                <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : assignedTests.length === 0 ? (
              /* Empty State */
              <div className={`border rounded-xl p-6 sm:p-8 text-center shadow-xl ${isLightTheme ? 'bg-white border-emerald-700' : 'bg-[#18181B] border-emerald-500'}`}>
                <p className={`text-sm sm:text-base ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-400'}`}>No pending assessments available.</p>
              </div>
            ) : (
              /* Test Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {assignedTests.map((test, index) => (
                  <button
                    key={test.id}
                    onClick={() => {
                      setSelectedTest(test);
                      startTest(test.id);
                    }}
                    disabled={starting}
                    className={`relative text-left rounded-xl p-4 sm:p-5 min-h-[96px] sm:min-h-[108px] transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl border ${isLightTheme ? 'bg-[#22C58B] border-emerald-700 hover:bg-[#1fb87a]' : 'bg-[#18181B] border-emerald-500 hover:bg-[#202025]'}`}
                  >
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex-shrink-0 ${isLightTheme ? 'dot-flash' : 'bg-emerald-500 animate-pulse'}`} />
                        <div className={`text-lg sm:text-xl font-extrabold uppercase tracking-wide ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'}`}>
                          {test.status === 'IN_PROGRESS' ? 'resume' : 'start'}{' '}
                          {test.source === 'self' ? 'your test' : 'assigned test'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-7">
                       <p className={`text-xs sm:text-sm truncate ${isLightTheme ? 'text-emerald-700' : 'text-emerald-400'}`}>
                        {test.test?.title?.toLowerCase() || 'assessment'}
                      </p>
                      {test.assignedAt && (
                        <p className={`text-[10px] sm:text-xs mt-1 ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(test.assignedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    {test.status === 'IN_PROGRESS' && (
                      <span className={`inline-flex items-center gap-1 mt-2 text-[10px] sm:text-xs ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-400'}`}>
                        Pending
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Problems Modal */}
        {showProblemsModal && (
          <div className={`fixed inset-0 ${isLightTheme ? 'bg-black/50' : 'bg-black/80'} flex items-center justify-center z-[9999] p-4`}>
            <div className={`${isLightTheme ? 'bg-white' : 'bg-[#18181B]'} border rounded-xl ${isLightTheme ? 'border-emerald-700' : 'border-emerald-500'} max-w-2xl w-full overflow-hidden shadow-xl`}>
              <div className={`px-6 py-5 border-b ${isLightTheme ? 'border-gray-200' : 'border-gray-700'} flex items-center justify-between`}>
                <h3 className={`text-sm font-extrabold tracking-wider ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>Join a Problem</h3>
                <button onClick={() => setShowProblemsModal(false)} className={`text-lg leading-none ${isLightTheme ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-white'}`}>&times;</button>
              </div>
              <div className="p-6 max-h-[480px] overflow-y-auto space-y-3">
                {teamProblems.length === 0 ? (
                  <p className={`text-xs text-center py-6 ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>No problems identified yet.</p>
                ) : (
                  teamProblems.map(problem => (
                    <div key={problem.id} className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${isLightTheme ? 'border-emerald-700 hover:bg-gray-50' : 'border-emerald-500 hover:bg-[#202025]'}`}>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>{problem.topic}</p>
                        <p className={`text-xs mt-1 ${isLightTheme ? 'text-gray-500' : 'text-gray-500'}`}>{problem.frequency}x identified</p>
                      </div>
                      <button
                        onClick={() => handleStartProblemTest(problem)}
                        disabled={teamActionLoading}
                        className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl border transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0 ${isLightTheme ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'}`}
                      >
                        {teamActionLoading ? '...' : 'Work on this Problem'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Team Solutions Modal */}
        {showSolutionsModal && (
          <div className={`fixed inset-0 ${isLightTheme ? 'bg-black/50' : 'bg-black/80'} flex items-center justify-center z-[9999] p-4`}>
            <div className={`${isLightTheme ? 'bg-white' : 'bg-[#18181B]'} border rounded-xl ${isLightTheme ? 'border-emerald-700' : 'border-emerald-500'} max-w-2xl w-full overflow-hidden shadow-xl`}>
              <div className={`px-6 py-5 border-b ${isLightTheme ? 'border-gray-200' : 'border-gray-700'} flex items-center justify-between`}>
                <h3 className={`text-sm font-extrabold tracking-wider ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>Improve a Solution</h3>
                <button onClick={() => setShowSolutionsModal(false)} className={`text-lg leading-none ${isLightTheme ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-white'}`}>&times;</button>
              </div>
              <div className="p-6 max-h-[480px] overflow-y-auto space-y-3">
                {teamSolutions.length === 0 ? (
                  <p className={`text-xs text-center py-6 ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>No solutions yet.</p>
                ) : (
                  teamSolutions.map(solution => (
                    <div key={solution.id} className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${isLightTheme ? 'border-emerald-700 hover:bg-gray-50' : 'border-emerald-500 hover:bg-[#202025]'}`}>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>{solution.topic}</p>
                        <p className={`text-xs mt-1 ${isLightTheme ? 'text-gray-500' : 'text-gray-500'}`}>{solution.likes} validations</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleLike(solution.id)}
                          disabled={likeLoading[solution.id]}
                          className={`px-3 py-2 text-xs rounded-xl border transition-colors disabled:opacity-50 ${solution.likedByMe
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : (isLightTheme ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700')}`}
                        >
                          {likeLoading[solution.id] ? '...' : solution.likedByMe ? '👍 Validated' : '👍 Validate'}
                        </button>
                        <button
                          onClick={() => handleStartSolutionTest(solution)}
                          disabled={teamActionLoading}
                          className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl border transition-colors disabled:opacity-50 whitespace-nowrap ${isLightTheme ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'}`}
                        >
                          {teamActionLoading ? '...' : 'Improve'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <StartShortTestModal
          isOpen={showStartShortTestModal}
          onClose={() => setShowStartShortTestModal(false)}
          isLightTheme={isLightTheme}
          availableTests={availableShorTests}
          gate={shorTestGate}
          loading={shorTestLoading}
          starting={launchingShorTest}
          onStartNew={launchShorTest}
        />

        <KPIDetailsModal 
          isOpen={showKPIDetails}
          onClose={() => setShowKPIDetails(false)}
          title="Your Personal CKPI Analysis"
          data={ckpiMetrics}
          isLightTheme={isLightTheme}
        />

        <SuccessNotificationModal
          isOpen={successNotification.isOpen}
          onClose={() => setSuccessNotification({ isOpen: false, title: "", message: "" })}
          title={successNotification.title}
          message={successNotification.message}
          type={successNotification.type || "success"}
          duration={3000}
        />
      </div>
    );
  }

// Conversation screen
return (
  <div className={`min-h-screen flex flex-col font-montserrat ${isLightTheme ? 'bg-white text-[#0F172A]' : 'bg-[#09090B] text-white'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <style>{`
        @media (max-width: 640px) {
          .chat-input::placeholder {
            color: transparent !important;
          }
        }
      `}</style>
      {/* Header - Matching Dashboard Style */}
      <div className={`sticky top-0 z-10 ${isLightTheme ? 'bg-white' : 'bg-[#09090B]'}`}>
        <div className="max-w-6xl mx-auto">
          <div className={`mx-4 sm:mx-6 lg:mx-8 border-b ${isLightTheme ? 'border-emerald-700' : 'border-emerald-500'}`}>
            <div className="py-4 sm:py-5 flex items-center justify-between">
              <div className={`text-xs sm:text-sm font-bold tracking-widest uppercase`}>
                <span className={isLightTheme ? 'text-[#334155]' : 'text-white'}>SHOR</span><span className="text-[#00d4aa]">TEST</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={goToDashboard}
                  className={`px-6 sm:px-7 py-2.5 rounded-xl transition-colors font-bold text-[11px] sm:text-xs uppercase tracking-wider border ${isLightTheme ? 'bg-[#17be8e] text-white border-emerald-700 hover:bg-[#15a87d]' : 'bg-emerald-500 text-black border-transparent hover:bg-emerald-400'}`}
                >
                  Dashboard &gt;
                </button>
                <button
                  onClick={toggleTheme}
                  className={`px-6 sm:px-7 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors border ${isLightTheme ? 'bg-white border-emerald-700 text-gray-900 hover:bg-gray-50' : 'bg-[#18181B] border-[#2e2e36] text-white hover:bg-[#202025]'}`}
                >
                  {isLightTheme ? 'Dark' : 'Light'}
                </button>
                {testCompleted && !reportReady && (
                  <button
                    onClick={() => completeTest()}
                    disabled={completing}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg transition-colors font-semibold disabled:opacity-50 text-xs sm:text-sm ${isLightTheme ? 'bg-[#17be8e] text-white hover:bg-[#15a87d]' : 'bg-emerald-500 text-white hover:bg-emerald-400'}`}
                  >
                    {completing ? (
                      <FaSpinner className="inline animate-spin" />
                    ) : (
                      <>
                        <FaCheckCircle className="inline mr-1" />
                        <span className="hidden sm:inline">View Report</span>
                        <span className="sm:hidden">Report</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Completion Banner */}
        {showCompletionBanner && !reportReady && (
          <div className="bg-emerald-500 text-white py-2 px-4 text-center text-sm font-bold">
            <FaCheckCircle className="inline-block mr-2" />
            Assessment Complete! Your report is ready.
          </div>
        )}
      </div>


      <TestSubmitModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleConfirmLeave}
        title="Leave Assessment"
        message="Are you sure you want to leave? Your progress will be saved."
        confirmText="Leave"
        cancelText="Stay"
        type="info"
      />

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto flex flex-col ${isLightTheme ? 'bg-white' : 'bg-[#09090B]'}`}>
        <div className={`max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 flex-1 flex flex-col ${messages.length <= 2 ? 'justify-center' : 'justify-end'}`}>
          {/* Centered Test Description / Brief */}
          {isCustom && managerBrief && (
            <div className="w-full flex justify-center" data-aos="fade-down">
              <div className={`max-w-2xl w-full rounded-xl p-5 sm:p-6 border text-center ${isLightTheme ? 'bg-[#22C58B] text-[#0F172A] border-emerald-700' : 'bg-[#18181B] text-white border-emerald-500'}`}>
                <p className={`text-sm sm:text-base leading-relaxed ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>
                  <span className={`font-bold mr-2 ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'}`}>
                    {briefType === 'problem' ? 'Develop this problem' : briefType === 'solution' ? 'Develop this solution' : 'MANAGER BRIEF:'}
                  </span>
                  {briefType === 'problem' ? managerBrief.replace(/^Problem:\s*/i, '') : briefType === 'solution' ? managerBrief.replace(/^Solution:\s*/i, '') : managerBrief}
                </p>
              </div>
            </div>
          )}

          {/* Loading state for first AI response */}
          {starting && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className={`text-sm font-medium tracking-wider ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>AI is preparing your assessment...</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1;
            const isLastAIResponse = isLastMessage && msg.role !== 'user' && testCompleted;
            if (isLastAIResponse) return null;

            const typingState = typingStates[index];
            const displayContent = typingState && !typingState.done && msg.role !== 'user'
              ? msg.content.slice(0, typingState.displayedChars)
              : msg.content;

            return (
              <MessageBubble
                key={index}
                message={{ ...msg, content: displayContent }}
                isFirst={index === 0 && !isCustom}
                isLightTheme={isLightTheme}
              />
            );
          })}

          {testCompleted && (
            <div className={`rounded-xl p-5 sm:p-6 border text-center ${isLightTheme ? 'bg-[#F4F6F8] border-emerald-700 text-[#0F172A]' : 'bg-[#18181B] border border-emerald-500 text-white'}`}>
              <div className="flex flex-col items-center gap-3">
                <FaCheckCircle className={`w-8 h-8 ${isLightTheme ? 'text-emerald-700' : 'text-emerald-500'}`} />
                <p className={`text-sm sm:text-base font-semibold ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                  Your shorTest is complete.
                </p>
                <p className={`text-xs ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                  You can view report in your dashboard.
                </p>
              </div>
            </div>
          )}
          
          {error && (
            <div className={`p-3 sm:p-4 border rounded-xl text-sm ${isLightTheme ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-900/30 border-red-800 text-red-400'}`}>
              <div className="flex items-center gap-2">
                <FaExclamationCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className={`sticky bottom-0 ${isLightTheme ? 'bg-white' : 'bg-[#09090B]'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          {reportReady ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <p className={`text-[10px] uppercase tracking-wider ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`}>Assessment Submitted Successfully</p>
            </div>
          ) : testCompleted ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <button
                onClick={() => completeTest()}
                disabled={completing}
                className={`px-6 py-2.5 rounded-lg transition-colors font-bold disabled:opacity-50 text-sm flex items-center gap-2 ${isLightTheme ? 'bg-[#17be8e] text-white hover:bg-[#15a87d]' : 'bg-emerald-500 text-white hover:bg-emerald-400'}`}
              >
                {completing ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                {completing ? "Finalizing..." : "Generate Your Report"}
              </button>
              <p className={`text-[10px] uppercase tracking-wider ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`}>Assessment Ready for Submission</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => {
                    setUserInput(e.target.value);
                    if (inputRef.current) {
                      inputRef.current.style.height = 'auto';
                      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts... (Press Enter to send, Shift+Enter for new line)"
                  disabled={loading}
                  className={`chat-input w-full min-h-[48px] max-h-[180px] p-3 pr-14 border rounded-xl resize-none focus:outline-none text-base sm:text-base leading-relaxed overflow-hidden ${isLightTheme ? 'bg-white border-emerald-700 text-[#0F172A] placeholder-gray-400 focus:border-[#22C58B] disabled:bg-gray-100 disabled:text-gray-400' : 'bg-[#18181B] border-emerald-500 text-white placeholder-gray-500 focus:border-emerald-500 disabled:bg-[#202025] disabled:text-gray-500'}`}
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={!userInput.trim() || loading}
                  className={`absolute right-3 bottom-3 w-10 h-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${isLightTheme ? 'text-emerald-700 hover:bg-emerald-700/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                >
                  {loading ? (
                    <FaSpinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-lg font-extrabold leading-none">&gt;</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Modal */}
      <SuccessNotificationModal
        isOpen={successNotification.isOpen}
        onClose={() => setSuccessNotification({ isOpen: false, title: "", message: "" })}
        title={successNotification.title}
        message={successNotification.message}
        type={successNotification.type || "success"}
        duration={3000}
      />
    </div>
  );
}

function SafeAIImage({ src, className }) {
  const [error, setError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-200`}>
        <span className="text-sm text-gray-500">Image unavailable</span>
      </div>
    );
  }
  return (
    <>
      <img
        src={src}
        alt="AI generated content"
        className={`${className} cursor-pointer`}
        onClick={() => setFullscreen(true)}
        onError={() => setError(true)}
      />
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-pointer"
          onClick={() => setFullscreen(false)}
        >
          <img
            src={src}
            alt="AI generated content fullscreen"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function MessageBubble({ message, isFirst, isLightTheme = false }) {
  const isUser = message.role === 'user';
  const hasCharts = !!message.components?.chartSpecs?.length || !!message.components?.chartSpec;
  const hasImage = !!message.components?.imageUrl;
  const hasSearch = !!message.components?.webSearch;
  const hasWebSummary = !!message.components?.webSummary;
  
  // Normalize charts to array
  const charts = message.components?.chartSpecs || (message.components?.chartSpec ? [message.components.chartSpec] : []);
  
  // Special rendering for the first AI message
  if (isFirst && !isUser) {
    return (
      <div className="mb-6" data-aos="fade-down">
        <div className="w-full">
          <div className={`rounded-xl p-5 sm:p-6 ${isLightTheme ? 'bg-[#F4F6F8] border border-emerald-700 text-[#0F172A]' : 'bg-[#18181B] border border-gray-600 text-white'}`}>
            <div className={`max-w-none ${isLightTheme ? 'prose' : 'prose prose-invert'}`}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: (props) => <p className={`text-sm sm:text-base leading-relaxed mb-4 last:mb-0 ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`} {...props} />,
                  a: (props) => <a className={`no-underline ${isLightTheme ? 'text-[#22C58B] hover:text-emerald-700' : 'text-emerald-400 hover:text-emerald-300'}`} {...props} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Components inside AI message */}
            {(hasCharts || hasImage || hasSearch || hasWebSummary) && (
              <div className={`mt-4 pt-4 border-t ${isLightTheme ? 'border-emerald-700/20' : 'border-white/20'}`}>
                {charts.map((spec, idx) => (
                  <div key={`chart-${idx}`} className={`mb-4 p-3 rounded-lg ${isLightTheme ? 'bg-gray-100' : 'bg-white/5'}`}>
                    <ChartRenderer spec={spec} />
                  </div>
                ))}
                
                {hasImage && (
                  <div className="mb-4 rounded-lg overflow-hidden aspect-video">
                    <SafeAIImage src={message.components.imageUrl} className="w-full h-full object-cover" />
                  </div>
                )}

                {hasSearch && (
                  <div className={`mb-4 p-3 rounded-lg ${isLightTheme ? 'bg-gray-100' : 'bg-white/5'}`}>
                    <div className={`flex items-center gap-2 mb-2 font-bold text-xs uppercase ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                      <FaMagic className={`w-3 h-3 ${isLightTheme ? 'text-[#22C58B]' : 'text-emerald-400'}`} />
                      <span>Web Search Results</span>
                    </div>
                    {message.components.webSearch.answer && (
                      <div className={`mb-3 text-sm italic ${isLightTheme ? 'text-gray-600' : 'text-gray-300'}`}>
                        {message.components.webSearch.answer}
                      </div>
                    )}
                    <div className="space-y-2">
                      {(message.components.webSearch.results || []).slice(0, 3).map((res, i) => (
                        <div key={i} className={`p-2 rounded ${isLightTheme ? 'bg-white' : 'bg-white/5'}`}>
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="block">
                            <h4 className={`text-xs font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>{res.title}</h4>
                            <p className={`text-[10px] ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>{res.snippet}</p>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasWebSummary && (
                  <div className={`p-3 rounded-lg ${isLightTheme ? 'bg-gray-100' : 'bg-white/5'}`}>
                    <div className={`flex items-center gap-2 mb-2 font-bold text-xs uppercase ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                      <FaClipboardCheck className={`w-3 h-3 ${isLightTheme ? 'text-[#22C58B]' : 'text-emerald-400'}`} />
                      <span>Web Content Analysis</span>
                    </div>
                    <div className={`text-sm leading-relaxed ${isLightTheme ? 'text-gray-600' : 'text-gray-300'}`}>
                      {message.components.webSummary}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className={`w-full rounded-xl ${
        isUser 
          ? (isLightTheme ? 'bg-[#22C58B] border border-emerald-700 text-[#0F172A]' : 'bg-[#18181B] border border-emerald-500 text-white')
          : (isLightTheme ? 'bg-white border border-emerald-700 text-[#0F172A]' : 'bg-[#18181B] border border-gray-600 text-white')
      }`}>
        <div className="p-4 sm:p-5">
          {isUser ? (
            <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
              {message.content}
            </p>
          ) : (
            <div className={`prose prose-sm max-w-none ${isLightTheme ? '' : 'prose-invert'}`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: (props) => <h1 className={`text-lg sm:text-xl font-bold mb-3 ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`} {...props} />,
                    h2: (props) => <h2 className={`text-base sm:text-lg font-bold mb-2 ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`} {...props} />,
                    h3: (props) => <h3 className={`text-sm sm:text-base font-semibold mb-2 ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`} {...props} />,
                    p: (props) => <p className={`mb-2 leading-relaxed ${isLightTheme ? 'text-gray-700' : 'text-white'}`} {...props} />,
                    ul: (props) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                    ol: (props) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                    li: (props) => <li className={`leading-relaxed ${isLightTheme ? 'text-gray-700' : 'text-white'}`} {...props} />,
                    strong: (props) => <strong className={`font-semibold ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`} {...props} />,
                    em: (props) => <em className={`italic ${isLightTheme ? 'text-gray-500' : 'text-white/70'}`} {...props} />,
                    code: ({ inline, ...props }) => 
                      inline ? (
                        <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${isLightTheme ? 'bg-gray-100 text-[#0F172A]' : 'bg-white/10 text-white'}`} {...props} />
                      ) : (
                        <code className={`block p-3 rounded-lg text-xs font-mono overflow-x-auto my-2 ${isLightTheme ? 'bg-gray-100 text-[#0F172A]' : 'bg-white/5'}`} {...props} />
                      ),
                    blockquote: (props) => (
                      <blockquote className={`border-l-2 pl-3 py-1 italic my-2 ${isLightTheme ? 'border-emerald-700/30 text-gray-500' : 'border-white/30 text-white/70'}`} {...props} />
                    ),
                  a: (props) => <a className={`no-underline ${isLightTheme ? 'text-[#22C58B] hover:text-emerald-700' : 'text-emerald-400 hover:text-emerald-300'}`} {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                
                {charts.map((spec, idx) => (
                  <div key={`chart-reg-${idx}`} className={`mt-4 p-3 rounded-lg ${isLightTheme ? 'bg-gray-100' : 'bg-white/5'}`}>
                    <ChartRenderer spec={spec} />
                  </div>
                ))}
                
                {hasImage && (
                  <div className="mt-4 rounded-lg overflow-hidden aspect-video">
                    <SafeAIImage src={message.components.imageUrl} className="w-full h-full object-cover" />
                  </div>
                )}

                {hasSearch && (
                  <div className={`mt-4 p-3 rounded-lg ${isLightTheme ? 'bg-gray-100' : 'bg-white/5'}`}>
                    <div className={`flex items-center gap-2 mb-2 font-bold text-xs uppercase ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                      <FaMagic className={`w-3 h-3 ${isLightTheme ? 'text-[#22C58B]' : 'text-emerald-400'}`} />
                      <span>Web Search Results</span>
                    </div>
                    {message.components.webSearch.answer && (
                      <div className={`mb-3 text-sm italic ${isLightTheme ? 'text-gray-600' : 'text-gray-300'}`}>
                        {message.components.webSearch.answer}
                      </div>
                    )}
                    <div className="space-y-2">
                      {(message.components.webSearch.results || []).slice(0, 3).map((res, i) => (
                        <div key={i} className={`p-2 rounded ${isLightTheme ? 'bg-white' : 'bg-white/5'}`}>
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block no-underline ${isLightTheme ? 'text-[#22C58B] hover:text-emerald-700' : 'text-emerald-400 hover:text-emerald-300'}`}
                          >
                            <h4 className={`text-xs font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>{res.title}</h4>
                            <p className={`text-[10px] ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>{res.snippet}</p>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasWebSummary && (
                  <div className={`mt-4 p-3 rounded-lg ${isLightTheme ? 'bg-gray-100' : 'bg-white/5'}`}>
                    <div className={`flex items-center gap-2 mb-2 font-bold text-xs uppercase ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                      <FaClipboardCheck className={`w-3 h-3 ${isLightTheme ? 'text-[#22C58B]' : 'text-emerald-400'}`} />
                      <span>Web Content Analysis</span>
                    </div>
                    <div className={`text-sm leading-relaxed ${isLightTheme ? 'text-gray-600' : 'text-gray-300'}`}>
                      {message.components.webSummary}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
