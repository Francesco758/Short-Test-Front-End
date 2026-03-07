import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AOS from 'aos';
import SuccessNotificationModal from "../models/SuccessNotificationModal";
import TestSubmitModal from "../models/TestSubmitModal";
import { 
  FaPaperPlane, 
  FaRobot, 
  FaUser, 
  FaCheckCircle,
  FaSpinner,
  FaArrowLeft,
  FaPlayCircle,
  FaClock,
  FaClipboardCheck,
  FaRocket,
  FaStar,
  FaMagic,
  FaChartLine
} from 'react-icons/fa';
import { api } from '../utils/api';
import TopNav from '../components/layout/TopNav';
import ChartRenderer from '../components/ui/ChartRenderer';
import KPIDetailsModal from '../components/admin/KPIDetailsModal';

export default function TestFlowDynamic() {
  const navigate = useNavigate();
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
  const [ckpiMetrics, setCkpiMetrics] = useState(null);
  
  // Success notification state
  const [successNotification, setSuccessNotification] = useState({
    isOpen: false,
    title: "",
    message: ""
  });
  const [reportReady, setReportReady] = useState(false);
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchAssignedTests();
    fetchCKPIMetrics();
    AOS.refresh();
  }, []);

  const fetchCKPIMetrics = async () => {
    try {
      const metrics = await api('/api/user/reports/ckpi-metrics');
      setCkpiMetrics(metrics);
    } catch (err) {
      console.error('Failed to fetch CKPI metrics:', err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let timer;
    if (showCompletionBanner) {
      timer = setTimeout(() => {
        setShowCompletionBanner(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showCompletionBanner]);

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

  const startTest = async (userTestId) => {
    try {
      setStarting(true);
      setError(null);
      
      const result = await api('/api/conversation/start', {
        method: 'POST',
        body: JSON.stringify({ userTestId })
      });

      setTestAttemptId(result.testAttemptId);
      setIsCustom(result.isCustom || false);
      setManagerBrief(result.brief || null);
      
      // If there's an initial GPT response
      if (result.gptResponse) {
        const assistantMsg = {
          role: 'assistant',
          content: result.gptResponse,
          timestamp: new Date(),
          components: result.components || null
        };
        setMessages([assistantMsg]);
      }
      
      // If there are existing messages (resumed conversation)
      if (result.messages && result.messages.length > 0) {
        setMessages(result.messages.map(m => ({
          ...m,
          timestamp: new Date(m.createdAt)
        })));
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
    setMessages(prev => [...prev, userMessage]);

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

      // Add GPT response if there's content OR components
      if (result.gptResponse || (result.components && Object.keys(result.components).length > 0)) {
        const gptMessage = {
          role: 'assistant',
          content: result.gptResponse || '',
          timestamp: new Date(),
          components: result.components || null
        };
        setMessages(prev => [...prev, gptMessage]);
      } else {
        // Fallback for empty responses to prevent "freezing" UI
        console.warn('Received empty GPT response');
        const fallbackMsg = {
          role: 'assistant',
          content: "I'm sorry, I encountered an issue processing that. Could you please rephrase or try again?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMsg]);
      }

      // Check if test should be completed
      // Add logic to check for "Your test is complete"
      const completionPhrase = "your test is complete";
      const hasCompletionPhrase = result.gptResponse && result.gptResponse.toLowerCase().includes(completionPhrase);

      if (result.suggestedCompletion || result.isCompleted || hasCompletionPhrase) {
        setTestCompleted(true);
        setShowCompletionBanner(true);
        await completeTest();
      }

    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err?.error || err?.message || 'Failed to send message');
      // Optionally remove the user message from UI on error
      setMessages(prev => prev.filter(m => m !== userMessage));
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <TopNav />
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pt-20">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl mb-6 transform hover:scale-105 transition-transform" data-aos="zoom-in" data-aos-delay="100">
              <FaRocket className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4" data-aos="fade-up" data-aos-delay="200">
              Your Assessments
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="300">
              Ready to showcase your skills? Select an assessment below and let's begin your journey
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500" data-aos="fade-up" data-aos-delay="400">
              <FaStar className="w-4 h-4 text-yellow-500" />
              <span>AI-Powered • Dynamic • Personalized</span>
            </div>
          </div>

          {/* Personal Progress */}
          {allTests.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6" data-aos="fade-up" data-aos-delay="450">
              {(() => {
                const completed = allTests.filter(t => t.status === 'COMPLETED' && t.report);
                const completedCount = completed.length;
                const averages = completed.reduce((acc, t) => {
                  const final = t.report?.kpis?.final ?? null;
                  acc.kpi.push(final ?? 0);
                  return acc;
                }, { kpi: [] });
                const avgKpi = averages.kpi.length ? Math.round(averages.kpi.reduce((a,b)=>a+b,0)/averages.kpi.length) : 0;
                
                return (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-10 w-full sm:w-auto">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                          <FaChartLine className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Average CKPI</div>
                          <div className="text-4xl font-black text-gray-900">{avgKpi}%</div>
                        </div>
                      </div>
                      
                      {/* Simple Average Chart */}
                      <div className="hidden md:block flex-1 max-w-[200px]">
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                          <div 
                            className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all duration-1000" 
                            style={{ width: `${avgKpi}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Performance</span>
                          <span className="text-[10px] text-indigo-600 font-bold">{completedCount} Assessment{completedCount!==1?'s':''}</span>
                        </div>
                      </div>
                    </div>

                    {ckpiMetrics && (
                      <button
                        onClick={() => setShowKPIDetails(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 transform hover:-translate-y-1 active:translate-y-0"
                      >
                        <FaChartLine className="w-5 h-5" />
                        View CKPI Details
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 shadow-sm">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mb-6 shadow-lg">
                <FaSpinner className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Assessments</h3>
              <p className="text-gray-600">Preparing everything for you...</p>
            </div>
          ) : assignedTests.length === 0 ? (
            <div className="max-w-md mx-auto" data-aos="fade-up" data-aos-delay="500">
              <div className="text-center py-16 bg-white rounded-3xl shadow-lg border-2 border-gray-100">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6" data-aos="zoom-in" data-aos-delay="550">
                  <FaClipboardCheck className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3" data-aos="fade-up" data-aos-delay="600">All Caught Up!</h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto" data-aos="fade-up" data-aos-delay="650">
                  You don't have any pending assessments at the moment. Check back soon for new opportunities!
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500" data-aos="fade-up" data-aos-delay="700">
                  <FaClock className="w-4 h-4" />
                  <span>New assessments will appear here when assigned</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <div className={`${assignedTests.length === 1 ? 'w-full max-w-md' : 'grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl'}`}>
                {assignedTests.map((test, index) => (
                  <div
                    key={test.id}
                    className="group relative bg-white rounded-3xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1"
                    data-aos="fade-up"
                    data-aos-delay={100 + (index * 100)}
                  >
                    {/* Gradient Accent Bar */}
                    <div className={`h-2 bg-gradient-to-r ${
                      test.status === 'IN_PROGRESS' 
                        ? 'from-yellow-400 via-orange-500 to-red-500' 
                        : 'from-indigo-500 via-purple-500 to-pink-500'
                    }`}></div>
                    
                    <div className="p-6 sm:p-8">
                      {/* Header with Icon */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:scale-110 transition-transform ${
                          test.status === 'IN_PROGRESS'
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                            : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        }`}>
                          <FaRobot className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {test.test?.title || 'Assessment'}
                            </h3>
                          </div>
                          {test.status === 'IN_PROGRESS' && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-xs font-semibold text-yellow-700 mb-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                              In Progress
                            </div>
                          )}
                          {test.status === 'ASSIGNED' && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-semibold text-indigo-700 mb-3">
                              <FaStar className="w-3 h-3" />
                              Ready to Start
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {test.test?.description && (
                        <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                          {test.test.description}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <FaClock className="w-4 h-4 text-gray-400" />
                          <span>Assigned {new Date(test.assignedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        {test.deadline && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-xs font-semibold text-red-700">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Due {new Date(test.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <FaClipboardCheck className="w-4 h-4 text-gray-400" />
                          <span>AI-Powered</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => {
                          setSelectedTest(test);
                          startTest(test.id);
                        }}
                        disabled={starting}
                        className={`w-full py-4 px-6 rounded-xl font-semibold text-white shadow-lg transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                          test.status === 'IN_PROGRESS'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 hover:shadow-xl hover:scale-[1.02]'
                            : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-xl hover:scale-[1.02]'
                        }`}
                      >
                        {starting ? (
                          <>
                            <FaSpinner className="w-5 h-5 animate-spin" />
                            <span>Starting...</span>
                          </>
                        ) : test.status === 'IN_PROGRESS' ? (
                          <>
                            <FaPlayCircle className="w-5 h-5" />
                            <span>Continue Assessment</span>
                          </>
                        ) : (
                          <>
                            <FaRocket className="w-5 h-5" />
                            <span>Start Assessment</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Decorative Corner Element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <KPIDetailsModal 
            isOpen={showKPIDetails}
            onClose={() => setShowKPIDetails(false)}
            title="Your Personal CKPI Analysis"
            data={ckpiMetrics}
          />

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
    </div>
  );
}

// Conversation screen
return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
    <TopNav />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-2xl sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105 group"
            >
              <FaArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
            </button>
            <div>
              <h2 className="font-bold text-white text-lg tracking-wide bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{selectedTest.test?.title}</h2>
              <p className="text-xs text-gray-400 font-medium">
                {testCompleted ? 'Completed' : 'In Progress'} • {messages.length} messages
              </p>
            </div>
          </div>
          {testCompleted && !reportReady && (
            <button
              onClick={() => completeTest()}
              disabled={completing}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold disabled:opacity-50 text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              {completing ? (
                <>
                  <FaSpinner className="inline animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <FaCheckCircle className="inline mr-2" />
                  View Report
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Minimal Completion Banner */}
        {showCompletionBanner && !reportReady && (
          <div className="bg-emerald-600 text-white py-2 px-4 text-center text-sm font-bold shadow-lg animate-pulse">
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
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Custom Test Manager Brief - Redesigned to match screenshot */}
          {isCustom && managerBrief && (
            <div className="flex flex-col items-center mb-12" data-aos="fade-down">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-xl border-4 border-white">
                <img 
                  src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg" 
                  alt="Manager" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative group max-w-2xl w-full">
                <div className="bg-[#1e2330] text-white rounded-[20px] p-8 shadow-2xl border border-gray-800 relative overflow-hidden">
                  <div className="flex flex-col gap-2">
                    <p className="text-lg leading-relaxed font-medium">
                      <span className="text-[#7c83ff] font-bold mr-2">MANAGER_BRIEF:</span>
                      {managerBrief}
                    </p>
                    <div className="self-end mt-4 text-[10px] text-gray-500 font-medium">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                    </div>
                  </div>
                </div>
                {/* Decorative tail */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1e2330] rotate-45 border-l border-t border-gray-800"></div>
              </div>
              
              <div className="mt-12 w-full flex items-center gap-4 opacity-50">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Assessment Active</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
              </div>
            </div>
          )}

          {/* Normal Test Initial Message Styling - If not custom and no messages yet, 
              the first GPT response will be rendered by MessageBubble below. 
              We just need to make sure MessageBubble matches the screenshot style. */}

          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} isFirst={index === 0 && !isCustom} />
          ))}
          
          {loading && (
            <div className="flex items-start gap-4 animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                <FaRobot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <FaSpinner className="animate-spin text-blue-600" />
                  <span className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm shadow-lg">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="w-4 h-4" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gradient-to-b from-white via-gray-50 to-gray-100 border-t border-gray-200 shadow-2xl sticky bottom-0 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          {reportReady ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <button
                onClick={() => {
                  setSelectedTest(null);
                  setReportReady(false);
                  setTestCompleted(false);
                   setTestAttemptId(null);
                   setMessages([]);
                  fetchAssignedTests();
                  window.scrollTo(0, 0);
                }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-bold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <FaCheckCircle />
                Go To Dashboard
              </button>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Assessment Submitted Successfully</p>
            </div>
          ) : testCompleted ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <button
                onClick={() => completeTest()}
                disabled={completing}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-bold disabled:opacity-50 text-sm shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                {completing ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                {completing ? "Finalizing..." : "Generate Your Report"}
              </button>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Assessment Ready for Submission</p>
            </div>
          ) : (
            // Professional input area
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts... (Press Enter to send, Shift+Enter for new line)"
                  disabled={loading}
                  className="w-full p-6 pr-16 bg-white border-2 border-gray-200 rounded-2xl resize-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 shadow-lg hover:shadow-xl focus:shadow-xl text-gray-800 placeholder-gray-400 leading-relaxed"
                  rows={4}
                />
                <button
                  onClick={sendMessage}
                  disabled={!userInput.trim() || loading}
                  className="absolute right-3 bottom-3 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center group"
                >
                  {loading ? (
                    <FaSpinner className="w-5 h-5 animate-spin" />
                  ) : (
                    <FaPaperPlane className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="font-medium">AI Assistant • Assessment in Progress</span>
                <span>Auto-saved • {userInput.length}/2000</span>
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

function MessageBubble({ message, isFirst }) {
  const isUser = message.role === 'user';
  const hasCharts = !!message.components?.chartSpecs?.length || !!message.components?.chartSpec;
  const hasImage = !!message.components?.imageUrl;
  const hasSearch = !!message.components?.webSearch;
  const hasWebSummary = !!message.components?.webSummary;
  
  // Normalize charts to array
  const charts = message.components?.chartSpecs || (message.components?.chartSpec ? [message.components.chartSpec] : []);
  
  // Special rendering for the first message in a Normal Test (matches screenshot)
  if (isFirst && !isUser) {
    return (
      <div className="flex flex-col items-center mb-12" data-aos="fade-down">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-xl border-4 border-white">
          <FaRobot className="w-12 h-12 text-white" />
        </div>
        <div className="relative group max-w-2xl w-full">
          <div className="bg-[#1e2330] text-white rounded-[20px] p-8 shadow-2xl border border-gray-800 relative overflow-hidden text-center">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: (props) => <p className="text-lg leading-relaxed font-medium text-white mb-0" {...props} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Render components in first message if any */}
            {(hasCharts || hasImage || hasSearch || hasWebSummary) && (
              <div className="mt-6 pt-6 border-t border-gray-700 text-left">
                {charts.map((spec, idx) => (
                  <div key={`chart-${idx}`} className="mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-inner">
                    <ChartRenderer spec={spec} />
                  </div>
                ))}
                
                {hasImage && (
                  <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-gray-700">
                    <img src={message.components.imageUrl} alt="AI generated content" className="w-full h-auto transform hover:scale-105 transition-transform duration-500" />
                  </div>
                )}

                {hasSearch && (
                  <div className="mb-6 p-4 bg-blue-900/30 rounded-xl border border-blue-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-blue-300 font-bold text-xs uppercase tracking-wider">
                      <FaMagic className="w-3 h-3" />
                      <span>Web Search Results</span>
                    </div>
                    {message.components.webSearch.answer && (
                      <div className="mb-4 text-sm text-gray-200 bg-gray-800/50 p-3 rounded-lg border border-blue-900 shadow-sm italic leading-relaxed">
                        {message.components.webSearch.answer}
                      </div>
                    )}
                    <div className="space-y-3">
                      {(message.components.webSearch.results || []).slice(0, 3).map((res, i) => (
                        <div key={i} className="group/link bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-800 transition-all shadow-sm">
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="block">
                            <h4 className="text-xs font-bold text-blue-400 group-hover/link:text-blue-300 transition-colors line-clamp-1 mb-1">{res.title}</h4>
                            <p className="text-[11px] text-gray-400 line-clamp-2 leading-tight">{res.snippet}</p>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasWebSummary && (
                  <div className="p-4 bg-emerald-900/30 rounded-xl border border-emerald-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                      <FaClipboardCheck className="w-3 h-3" />
                      <span>Web Content Analysis</span>
                    </div>
                    <div className="text-sm text-gray-200 leading-relaxed">
                      {message.components.webSummary}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Decorative tail */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1e2330] rotate-45 border-l border-t border-gray-800"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in group`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transform transition-transform group-hover:scale-110 ${
        isUser 
          ? 'bg-gradient-to-br from-gray-700 via-gray-800 to-black' 
          : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600'
      }`}>
        {isUser ? (
          <FaUser className="w-5 h-5 text-white" />
        ) : (
          <FaRobot className="w-5 h-5 text-white" />
        )}
      </div>
      
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block max-w-[85%] rounded-2xl shadow-xl border backdrop-blur-sm ${
          isUser 
            ? 'bg-[#1e2330] border-gray-800 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <div className="p-4 sm:p-6">
            {isUser ? (
              <div className="text-white font-medium leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {message.content}
              </div>
            ) : (
              <div className="prose prose-sm sm:prose-base max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Professional markdown styling
                    h1: (props) => <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 tracking-tight" {...props} />,
                    h2: (props) => <h2 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 tracking-tight" {...props} />,
                    h3: (props) => <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900" {...props} />,
                    p: (props) => <p className="mb-3 text-gray-800 leading-relaxed" {...props} />,
                    ul: (props) => <ul className="list-disc list-inside mb-3 space-y-2" {...props} />,
                    ol: (props) => <ol className="list-decimal list-inside mb-3 space-y-2" {...props} />,
                    li: (props) => <li className="text-gray-800 leading-relaxed" {...props} />,
                    strong: (props) => <strong className="font-semibold text-gray-900" {...props} />,
                    em: (props) => <em className="italic text-gray-700" {...props} />,
                    code: ({ inline, ...props }) => 
                      inline ? (
                        <code className="px-2 py-1 bg-gray-100 rounded-md text-xs sm:text-sm font-mono text-blue-600 border border-gray-200" {...props} />
                      ) : (
                        <code className="block p-4 bg-gray-50 rounded-lg text-xs sm:text-sm font-mono overflow-x-auto border border-gray-200 my-3" {...props} />
                      ),
                    blockquote: (props) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 py-1 italic text-gray-700 bg-blue-50/50 rounded-r-lg my-3" {...props} />
                    ),
                    a: (props) => <a className="text-blue-600 hover:text-blue-800 underline font-medium" {...props} />,
                    table: (props) => (
                      <div className="overflow-x-auto my-4 rounded-xl border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200" {...props} />
                      </div>
                    ),
                    th: (props) => <th className="px-4 py-3 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider" {...props} />,
                    td: (props) => <td className="px-4 py-3 text-sm text-gray-700 border-t border-gray-100" {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                
                {charts.map((spec, idx) => (
                  <div key={`chart-reg-${idx}`} className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-inner">
                    <ChartRenderer spec={spec} />
                  </div>
                ))}
                
                {hasImage && (
                  <div className="mt-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                    <img src={message.components.imageUrl} alt="AI generated content" className="w-full h-auto transform hover:scale-105 transition-transform duration-500" />
                  </div>
                )}

                {hasSearch && (
                  <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2 mb-3 text-blue-800 font-bold text-xs uppercase tracking-wider">
                      <FaMagic className="w-3 h-3" />
                      <span>Web Search Results</span>
                    </div>
                    {message.components.webSearch.answer && (
                      <div className="mb-4 text-sm text-gray-800 bg-white/80 p-3 rounded-lg border border-blue-50 shadow-sm italic leading-relaxed">
                        {message.components.webSearch.answer}
                      </div>
                    )}
                    <div className="space-y-3">
                      {(message.components.webSearch.results || []).slice(0, 3).map((res, i) => (
                        <div key={i} className="group/link bg-white p-3 rounded-lg border border-gray-100 hover:border-blue-200 transition-all shadow-sm">
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="block">
                            <h4 className="text-xs font-bold text-blue-600 group-hover/link:text-blue-800 transition-colors line-clamp-1 mb-1">{res.title}</h4>
                            <p className="text-[11px] text-gray-500 line-clamp-2 leading-tight">{res.snippet}</p>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasWebSummary && (
                  <div className="mt-6 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                      <FaClipboardCheck className="w-3 h-3" />
                      <span>Web Content Analysis</span>
                    </div>
                    <div className="text-sm text-gray-800 leading-relaxed">
                      {message.components.webSummary}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={`px-4 pb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${isUser ? 'justify-end text-gray-500' : 'text-gray-400'}`}>
            <span>{isUser ? 'You' : 'AI Assistant'}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
