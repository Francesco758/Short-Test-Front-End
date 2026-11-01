import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaUser, FaPaperPlane, FaSpinner, FaChartBar, FaImage, FaCopy, FaCheck, FaCode, FaTimes } from 'react-icons/fa';
import { Button, Tooltip, message } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ChartRenderer from '../ui/ChartRenderer';
import KPIBarChart from '../report/KPIBarChart';

function detectLanguage(text) {
  const t = text.trim();
  if (!t) return null;
  if (/[\u4e00-\u9fff]/.test(t) && /[\u4e00-\u9fff]/.test(t.replace(/[\u3040-\u309f\u30a0-\u30ff]/g, ''))) return 'Chinese';
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) return 'Japanese';
  if (/[\uac00-\ud7af]/.test(t)) return 'Korean';
  if (/[\u0400-\u04ff]/.test(t)) return 'Russian';
  if (/[\u0600-\u06ff]/.test(t)) return 'Arabic';
  if (/[\u0e00-\u0e7f]/.test(t)) return 'Thai';
  if (/[\u0900-\u097f]/.test(t)) return 'Hindi';
  const words = t.toLowerCase().match(/\b[a-zà-ÿ]+\b/g) || [];
  if (words.length < 2) return null;
  const langPatterns = {
    Italian: /\b(il|lo|la|gli|le|un|uno|una|di|che|e|è|sono|ha|ho|hai|hanno|non|si|ci|mi|con|per|tra|fra|dove|quando|come|quale|quali|cosa|perché|perche|anche|molto|può|fare|questo|questa|questi|queste|essere|avere)\b/i,
    French: /\b(le|la|les|un|une|des|du|je|tu|il|elle|nous|vous|ils|elles|est|sont|ai|as|a|avons|avez|ont|ce|cette|ces|qui|que|quoi|où|comment|pourquoi|très|avec|dans|faire)\b/i,
    Spanish: /\b(el|la|los|las|un|una|y|o|pero|porque|qué|cómo|dónde|cuándo|quién|cuál|cuáles|es|son|está|están|muy|con|para|por|sin|sobre|hacer)\b/i,
    German: /\b(der|die|das|ein|eine|und|oder|aber|denn|weil|dass|nicht|kein|keine|ist|sind|hat|habe|hast|haben|sehr|mit|für|auf|bei|nach|von|aus|durch|machen)\b/i,
    Portuguese: /\b(o|a|os|as|um|uma|e|ou|mas|porque|que|quem|como|onde|quando|qual|quais|é|são|está|estão|muito|com|para|por|em|no|na|fazer)\b/i,
    Dutch: /\b(de|het|een|en|of|maar|want|omdat|dat|die|dit|niet|geen|is|ben|heeft|heb|hebben|met|voor|op|bij|na|van|uit|door|maken)\b/i
  };
  let bestLang = null, bestScore = 0;
  for (const [lang, pattern] of Object.entries(langPatterns)) {
    const matches = t.match(pattern);
    const score = matches ? matches.length : 0;
    if (score > bestScore) { bestScore = score; bestLang = lang; }
  }
  return bestLang;
}

export default function DataChatbot({
  onSendMessage,
  onStreamMessage = null, // Optional: (payload) => { ... }, called with { question, history, signal, onChunk }. If provided, streaming is used.
  placeholder = "Ask me anything about your data...",
  title = "Data Assistant",
  className = "",
  compact = false,
  maxHeight = "400px",
  fillHeight = false,
  fullHeightQuery = false,
  fullHeightQueryLabel = "",
  fullHeightExpanded = false,
  onRequestExpand = null,
  onDashboardClick = null,
  onConversationStateChange = null,
  fullHeightLabelStyleOverride = null,
  fullHeightHelperStyleOverride = null,
  storageKey = null, // Optional localStorage key for persistence
  maxMessages = 50, // Maximum messages to keep in history
  autoClearOnRefresh = true, // Automatically clear chat on page refresh
  theme = "dark", // Theme: 'dark' or 'light'
  conversationId = null, // Optional persisted conversation id (server-side)
  onConversationIdChange = null, // (conversationId, conversationTitle) => void
  initialMessages = null, // Optional array of persisted messages to load on mount
  onClearConversation = null, // () => void — clear the current persisted conversation
  suggestedQuestions = [
    "Which problems are most frequent?",
    "Which problems should we focus on first?",
    "Which solutions are most implementable?",
    "Where can we get quick wins?"
  ]
}) {
  const isLightTheme = theme === "light";
  const fluidClamp = (minPx, viewportWidthUnit, maxPx) => `clamp(${minPx}px, calc(${viewportWidthUnit}vw + 0.6vh), ${maxPx}px)`;
  const fullHeightInputInsetX = fluidClamp(14, 1.2, 26);
  const fullHeightLabelStyle = fullHeightQuery
    ? {
        fontSize: fluidClamp(14, 0.92, 22),
        letterSpacing: fluidClamp(2.2, 0.2, 4.4)
      }
    : undefined;
  const fullHeightHelperStyle = fullHeightQuery
    ? {
        fontSize: fluidClamp(13, 0.9, 19)
      }
    : undefined;
  const fullHeightInputStyle = fullHeightQuery
    ? {
        fontSize: fluidClamp(16, 1.1, 24),
        paddingLeft: fullHeightInputInsetX,
        paddingRight: fullHeightInputInsetX,
        caretColor: '#22C58B'
      }
    : undefined;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const hasConversation = messages.length > 0 || isLoading;

  useEffect(() => {
    if (typeof onConversationStateChange === 'function') {
      onConversationStateChange(hasConversation);
    }
  }, [hasConversation, onConversationStateChange]);

  // Load conversation history on mount
  useEffect(() => {
    if (storageKey && autoClearOnRefresh) {
      try {
        // Clear any existing conversation on page refresh
        localStorage.removeItem(`${storageKey}_messages`);
        // Start with empty messages on each page load
        setMessages([]);
      } catch (err) {
        console.warn('Failed to clear conversation history:', err);
      }
    }

    // Load persisted server-side conversation (takes precedence over storageKey).
    if (Array.isArray(initialMessages) && initialMessages.length > 0) {
      const loaded = initialMessages.map((m, idx) => ({
        id: `persisted-${idx}-${m.id ?? idx}`,
        type: m.role === 'user' ? 'user' : 'bot',
        content: m.content || '',
        timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
        chartSpec: m.chartSpec || null,
        imageUrl: m.imageUrl || null,
        imageSize: m.imageSize || null,
        hasVisualComponents: !!(m.chartSpec || m.imageUrl),
        source: m.source || null,
        metadata: m.metadata || null
      }));
      setMessages(loaded);
    }

    // Cleanup function to clear messages when component unmounts
    return () => {
      if (storageKey && autoClearOnRefresh) {
        try {
          localStorage.removeItem(`${storageKey}_messages`);
        } catch (err) {
          console.warn('Failed to clear conversation on unmount:', err);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, autoClearOnRefresh, initialMessages]);

  const suppressFullHeightInputChrome = (inputEl) => {
    if (!fullHeightQuery || !inputEl) return;
    inputEl.style.outline = 'none';
    inputEl.style.boxShadow = 'none';
    inputEl.style.border = '0';
  };

  const focusQueryInput = () => {
    const inputEl = inputRef.current;
    if (!inputEl) return;
    inputEl.focus({ preventScroll: true });
    suppressFullHeightInputChrome(inputEl);
  };

  const animateBotMessageContent = (messageId, fullText, onDone) => {
    const text = typeof fullText === 'string' ? fullText : '';
    if (!text.length) {
      if (typeof onDone === 'function') onDone();
      return;
    }

    let cursor = 0;
    const total = text.length;
    const chunkSize = Math.max(3, Math.min(18, Math.ceil(total / 180)));
    const frameDelay = 14;

    const tick = () => {
      cursor = Math.min(total, cursor + chunkSize);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: text.slice(0, cursor) }
            : msg
        )
      );

      if (cursor < total) {
        setTimeout(tick, frameDelay);
      } else if (typeof onDone === 'function') {
        onDone();
      }
    };

    tick();
  };

  // Save conversation history when messages change (disabled for auto-clear on refresh)
  // Note: Conversation will be cleared on page refresh as requested
  useEffect(() => {
    // Intentionally empty - we don't want to persist messages
  }, [messages, storageKey, maxMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on component mount
  useEffect(() => {
    if (!fullHeightQuery) {
      inputRef.current?.focus();
    }
  }, [fullHeightQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Copied to clipboard!');
    } catch {
      message.error('Failed to copy to clipboard');
    }
  };

  const formatTime = (date) => {
    try {
      if (!date) return '';
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return '';
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      console.warn('Invalid date format:', date);
      return '';
    }
  };

  const handleSendMessage = async (text = null) => {
    const messageText = (typeof text === 'string' ? text : inputText).trim();
    if (!messageText || isLoading) return;
    let streamingStarted = false;

    if (fullHeightQuery && typeof onRequestExpand === 'function') {
      onRequestExpand();
    }

    // Build conversation history from previous messages (before adding current one)
    const history = messages
      .filter(m => m.type === 'user' || m.type === 'bot')
      .slice(-20)
      .map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

    // Detect language and prepend instruction so the AI responds in the same language
    const detectedLang = detectLanguage(messageText);
    const messageToSend = detectedLang ? `[${detectedLang}] ${messageText}` : messageText;

    // Add user message (show original text, not the modified one)
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Create abort controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Streaming path: consume SSE tokens as they arrive for a real-time experience.
      if (typeof onStreamMessage === 'function') {
        const botMessageId = Date.now() + 1;
        const botMessage = {
          id: botMessageId,
          type: 'bot',
          content: '',
          timestamp: new Date(),
          chartSpec: null,
          imageUrl: null,
          hasVisualComponents: false
        };
        setMessages(prev => [...prev, botMessage]);

        const onChunk = (chunk) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === botMessageId
                ? { ...msg, content: (msg.content || '') + chunk }
                : msg
            )
          );
        };

        const done = await onStreamMessage({
          question: messageToSend,
          history,
          signal: controller.signal,
          onChunk,
          conversationId: conversationId || undefined
        });

        setIsLoading(false);
        streamingStarted = true;

        // Propagate the persisted conversation id/title to the parent.
        if (typeof onConversationIdChange === 'function') {
          const nextId = done?.conversationId || done?.conversation_id || conversationId;
          if (nextId) onConversationIdChange(nextId, done?.conversationTitle || done?.title || null);
        }

        // Finalize with any metadata/visual components from the done event.
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId
              ? {
                  ...msg,
                  chartSpec: done?.chartSpec || msg.chartSpec,
                  imageUrl: done?.imageUrl || msg.imageUrl,
                  imageSize: done?.imageSize,
                  hasVisualComponents: !!(done?.chartSpec || done?.imageUrl),
                  source: done?.source || msg.source,
                  metadata: done?.metadata || msg.metadata
                }
              : msg
          )
        );

        setTimeout(() => focusQueryInput(), 0);
        return;
      }

      // Call the provided message handler with question and conversation history
      const response = await onSendMessage({ question: messageToSend, history, signal: controller.signal, conversationId: conversationId || undefined });
      const normalizedContent =
        typeof response?.answer === 'string'
          ? response.answer
          : typeof response === 'string'
            ? response
            : JSON.stringify(response, null, 2);
      
      // Check if response contains visual components (charts or images)
      const hasVisualComponents = response.chartSpec || response.imageUrl;
      const botMessageId = Date.now() + 1;
      
      // Add bot response with potential visual components
      const botMessage = {
        id: botMessageId,
        type: 'bot',
        content: '',
        timestamp: new Date(),
        chartSpec: response.chartSpec,
        imageUrl: response.imageUrl,
        imageSize: response.imageSize,
        hasVisualComponents,
        source: response.source,
        metadata: response.metadata
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
      streamingStarted = true;

      // Propagate the persisted conversation id/title to the parent.
      if (typeof onConversationIdChange === 'function') {
        const nextId = response?.conversationId || response?.conversation_id || conversationId;
        if (nextId) onConversationIdChange(nextId, response?.conversationTitle || response?.title || null);
      }

      animateBotMessageContent(botMessageId, normalizedContent, () => {
        setTimeout(() => focusQueryInput(), 0);
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        const cancelledMessage = {
          id: Date.now() + 1,
          type: 'error',
          content: 'Request was cancelled.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, cancelledMessage]);
      } else {
        const isRateLimit = err.status === 429;
        const content = isRateLimit
          ? err.retryAfter
            ? `Rate limit reached. Please wait ${err.retryAfter} before asking another question.`
            : 'Rate limit reached. Please wait a moment before asking another question.'
          : err.message || err.error || 'Failed to get response';
        const errorMessage = {
          id: Date.now() + 1,
          type: 'error',
          content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      if (!streamingStarted) {
        setIsLoading(false);
      }
      abortControllerRef.current = null;
      setTimeout(() => focusQueryInput(), 0);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
    if (typeof onConversationStateChange === 'function') {
      onConversationStateChange(false);
    }
    if (typeof onConversationIdChange === 'function') {
      onConversationIdChange(null, null);
    }
    if (typeof onClearConversation === 'function') {
      onClearConversation();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputFocus = (e) => {
    setIsInputFocused(true);
    suppressFullHeightInputChrome(e.currentTarget);
  };

  const handleInputBlur = (e) => {
    setIsInputFocused(false);
    suppressFullHeightInputChrome(e.currentTarget);
  };



  // Component to render visual content (charts and images)
  const VisualComponent = ({ message }) => {
    if (!message.hasVisualComponents) return null;

    return (
      <div className="mt-4 space-y-4">
        {message.chartSpec && (
          <div className={`border rounded-lg p-4 hover:border-[#22C58B]/30 transition-all ${isLightTheme ? 'border-[#0B3D2E] bg-[#F4F6F8]' : 'border-[#1e2736] bg-[#1e2736]'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLightTheme ? 'bg-[#22C58B]/10' : 'bg-emerald-500/10'}`}>
                  <FaChartBar className={`w-4 h-4 ${isLightTheme ? 'text-[#22C58B]' : 'text-emerald-500'}`} />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>Generated Chart</h4>
                  <p className="text-xs text-[#0F172A]">Interactive data visualization</p>
                </div>
              </div>
              <Tooltip title="Copy chart data">
                  <Button
                    size="small"
                    icon={<FaCopy className="w-3 h-3" />}
                    onClick={() => copyToClipboard(JSON.stringify(message.chartSpec, null, 2))}
                    className={`border-0 ${isLightTheme ? 'text-[#0F172A] hover:text-[#0F172A]' : 'text-gray-500 hover:text-white'}`}
                    ghost
                  />
                </Tooltip>
            </div>
            <div className={`rounded-lg p-3 overflow-hidden ${isLightTheme ? 'bg-[#F4F6F8]' : 'bg-[#0a0e14]'}`}>
              <ChartRenderer spec={message.chartSpec} />
            </div>
          </div>
        )}

        {message.imageUrl && (
          <div className={`border rounded-lg overflow-hidden hover:border-[#22C58B]/30 transition-all ${isLightTheme ? 'border-[#0B3D2E] bg-[#F4F6F8]' : 'border-[#1e2736] bg-[#1e2736]'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isLightTheme ? 'border-[#0B3D2E] bg-[#F4F6F8]' : 'border-[#1e2736] bg-[#0a0e14]/30'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLightTheme ? 'bg-purple-100' : 'bg-purple-500/10'}`}>
                  <FaImage className={`w-4 h-4 ${isLightTheme ? 'text-purple-600' : 'text-purple-400'}`} />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>Generated Analysis</h4>
                  <p className="text-xs text-[#0F172A]">AI-powered visual insight</p>
                </div>
              </div>
            </div>
            <div className={`p-2 flex justify-center ${isLightTheme ? 'bg-[#F4F6F8]' : 'bg-[#0a0e14]'}`}>
              <img
                src={message.imageUrl}
                alt="AI Generated Analysis"
                className={`max-w-full h-auto rounded-lg ${message.imageSize === 'large' ? 'w-full' : 'max-h-[400px]'}`}
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-transparent ${className} ${fullHeightQuery ? `${isLightTheme ? '' : 'border border-emerald-500/95'} overflow-hidden rounded-lg` : 'overflow-visible'} ${fillHeight || fullHeightQuery ? 'h-full min-h-0 flex flex-col' : ''} font-montserrat`}>
      <style>{`
        @keyframes transformachineCaretFlash { 0% { opacity: 1; } 50% { opacity: 0; } }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { width: 0; height: 0; display: none; }
      `}</style>
      {fullHeightQuery && (
        <div className={`flex items-center gap-2 px-5 sm:px-7 lg:px-8 py-3 ${isLightTheme ? 'bg-white' : 'bg-[#07080A]'} ${fullHeightExpanded ? 'sticky top-0 z-20' : ''}`}>
          <h3
            className={`font-extrabold uppercase ${isLightTheme ? 'text-[#22C58B]' : 'text-emerald-500'} font-montserrat whitespace-nowrap text-[min(4vw,24px)] sm:text-[min(3vw,22px)] md:text-[min(1.8vw,16px)] lg:text-[1.5vw] xl:text-[1.4vw] 2xl:text-[1.3vw] lg:tracking-[0.25em]`}
            style={{ ...(fullHeightLabelStyle || {}), ...(fullHeightLabelStyleOverride || {}) }}
          >
            {isLightTheme ? (fullHeightQueryLabel || 'TRANSFORMACHINE') + ' >' : (fullHeightQueryLabel || 'TRANSFORMACHINE') + ':'}
          </h3>
          <p
            className={`${isLightTheme ? 'text-[#0F172A]' : 'text-gray-400'} truncate font-montserrat -ml-1 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(1.3vw,14px)] lg:tracking-[0.08em]`}
            style={{ ...(fullHeightHelperStyle || {}), ...(fullHeightHelperStyleOverride || {}) }}
          >
            {isLightTheme ? 'turn data into action' : 'turn change data into action!'}
          </p>
          <div className="flex-1" />
          {typeof onClearConversation === 'function' && messages.length > 0 && (
            <button
              onClick={handleClearConversation}
              className={`shrink-0 text-[10px] sm:text-xs uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg border transition ${
                isLightTheme
                  ? 'text-[#0F172A] border-[#0B3D2E] hover:bg-[#0B3D2E] hover:text-white'
                  : 'text-gray-400 border-[#2e2e36] hover:border-red-500/50 hover:text-red-400'
              }`}
              title="Start a new conversation"
            >
              NEW
            </button>
          )}
        </div>
      )}
      {/* Messages */}
      <div
        className={`hide-scrollbar ${compact ? 'space-y-3' : 'space-y-6'} overflow-y-auto ${(fillHeight || fullHeightQuery) ? `flex-1 min-h-0 px-3 sm:px-6 pt-3 sm:pt-4 ${isLightTheme ? 'bg-white' : 'bg-transparent'}` : 'bg-transparent'} ${fullHeightExpanded ? 'pb-3 sm:pb-4' : ''}`}
        style={(fillHeight || fullHeightQuery) ? undefined : { maxHeight }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${fullHeightQuery && message.type !== 'user' ? 'w-full' : ''}`}
          >
            {/* Message Content */}
              <div className={`${fullHeightQuery && message.type !== 'user' ? 'flex-1 min-w-0' : 'max-w-[80%]'} ${message.type === 'user' ? 'order-1' : ''}`}>
                <div className={`rounded-lg px-5 py-4 text-[15px] sm:text-[16px] ${fullHeightQuery && message.type !== 'user' ? 'w-full' : ''} ${
                  message.type === 'user'
                    ? 'bg-[#22C58B] text-[#0F172A] font-medium'
                    : message.type === 'error'
                    ? (isLightTheme ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-red-900/20 border border-red-900/30 text-red-400')
                    : (isLightTheme ? 'bg-white border border-[#0B3D2E] text-[#0F172A]' : 'bg-[#18181B] border border-[#27272A] text-gray-200')
                }`}>
                  <div className={`prose prose-base max-w-none ${message.type === 'user' ? 'prose-invert' : ''}`}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');
                          
                          if (inline) {
                            return (
                              <code className="bg-[#0a0e14] text-[#22C58B] px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                {children}
                              </code>
                            );
                          }
                          
                          return (
                            <div className="relative group my-3">
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Tooltip title="Copy code">
                                  <Button
                                    size="small"
                                    icon={<FaCopy className="w-3 h-3" />}
                                    onClick={() => copyToClipboard(codeString)}
                                    className="text-gray-400 hover:text-white bg-[#0a0e14]/80 backdrop-blur border-0"
                                    ghost
                                  />
                                </Tooltip>
                              </div>
                              <SyntaxHighlighter
                                style={tomorrow}
                                language={match ? match[1] : 'text'}
                                PreTag="div"
                                className="rounded-lg !mt-0 !mb-0 border border-[#2a364a]"
                                {...props}
                              >
                                {codeString}
                              </SyntaxHighlighter>
                            </div>
                          );
                        },
                        table({ children }) {
                          return (
                            <div className="overflow-x-auto my-3">
                              <table className={`min-w-full divide-y border rounded-lg overflow-hidden ${isLightTheme ? 'divide-gray-200 border-gray-200 bg-white' : 'divide-[#2a364a] border-[#2a364a]'}`}>
                                {children}
                              </table>
                            </div>
                          );
                        },
                        th({ children }) {
                          return (
                            <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${isLightTheme ? 'bg-gray-100 text-gray-700' : 'bg-[#0a0e14] text-gray-400'}`}>
                              {children}
                            </th>
                          );
                        },
                        td({ children }) {
                          return (
                            <td className={`px-4 py-2 whitespace-nowrap text-sm border-t ${isLightTheme ? 'text-gray-700 border-gray-200' : 'text-gray-300 border-[#2a364a]'}`}>
                              {children}
                            </td>
                          );
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
                <div className={`text-[13px] sm:text-sm mt-2 flex items-center gap-2 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                } ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-500'}`}>
                  {message.type === 'bot' && message.source && (
                    <span className={`px-2 py-0.5 rounded border uppercase tracking-wide text-[10px] ${isLightTheme ? 'border-[#0B3D2E] bg-white text-[#0F172A]' : 'border-[#2e2e36] bg-[#18181B] text-gray-400'}`}>
                      {message.source}
                    </span>
                  )}
                  <span>{formatTime(message.timestamp)}</span>
                  {message.type === 'bot' && (
                    <Tooltip title="Copy message">
                      <Button
                          size="small"
                          icon={<FaCopy className="w-3 h-3" />}
                          onClick={() => copyToClipboard(message.content)}
                          className={`!p-1 border-0 ${isLightTheme ? 'text-[#0F172A] hover:text-[#0F172A]' : 'text-gray-500 hover:text-white'}`}
                          ghost
                        />
                    </Tooltip>
                  )}
                </div>
                
                {/* Visual Components (Charts and Images) */}
                {message.type === 'bot' && <VisualComponent message={message} />}
              </div>

          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${isLightTheme ? 'bg-[#22C58B]/10 border-[#0B3D2E]' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
              <div className="relative">
                <FaSpinner className={`w-5 h-5 ${isLightTheme ? 'text-[#22C58B]' : 'text-emerald-500'} animate-spin`} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#22C58B] rounded-full animate-pulse"></div>
              </div>
            </div>
          <div className={`rounded-lg px-5 py-4 max-w-md border ${isLightTheme ? 'bg-white border-[#0B3D2E] text-[#0F172A]' : 'bg-[#1e2736] border-[#2a364a] text-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#22C58B] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#22C58B] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-[#22C58B] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className={`text-sm ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-400'}`}>Thinking...</span>
              </div>
              <div className={`mt-2 text-xs ${isLightTheme ? 'text-[#0F172A]' : 'text-[#334155]'}`}>
                Analyzing your data and generating insights
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input and Suggestions */}
      <div className={`${fullHeightQuery ? `p-3 flex-shrink-0 border-t ${isLightTheme ? 'border-[#0B3D2E] bg-white' : 'border-[#2e2e36] bg-[#07080A]'}` : (compact ? "pt-1" : "pt-2")} ${fillHeight || fullHeightQuery ? 'min-h-0 flex flex-col' : ''}`}>
        <div className={`relative flex items-center ${fullHeightQuery ? 'gap-3' : (compact ? 'gap-2 mb-2' : 'gap-3 mb-3')}`}>
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyPress={handleKeyPress}
              placeholder={fullHeightQuery ? '' : (isLoading ? "Analyzing your data..." : placeholder)}
              disabled={isLoading}
              style={{
                ...(fullHeightQuery ? {
                  outline: 'none',
                  boxShadow: 'none',
                  border: '0',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  backgroundColor: 'transparent'
                } : {}),
                ...(fullHeightQuery ? (fullHeightInputStyle || {}) : {})
              }}
              className={`w-full rounded-none ${isLightTheme ? 'text-[#0F172A] placeholder-[#334155]' : 'text-gray-200 placeholder-gray-500'} caret-[#22C58B] appearance-none focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed ${fullHeightQuery ? 'transition-none !border-0 focus:border-0 bg-transparent text-[16px] sm:text-[18px] leading-none h-10 sm:h-11 font-montserrat' : `transition-all border focus:border-[#22C58B] ${isLightTheme ? 'bg-white border-[#0B3D2E]' : 'bg-[#09090B] border-[#27272A]'}`} ${fullHeightQuery ? '' : (compact ? 'px-3 py-2 text-sm' : 'px-4 py-3')}`}
            />
            {fullHeightQuery && !isLoading && !isInputFocused ? (
              <span
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-[2px] h-[1.05em] rounded-[1px] bg-[#22C58B]"
                style={{ left: fullHeightInputInsetX, animation: 'transformachineCaretFlash 1s step-end infinite' }}
              />
            ) : null}
          </div>
          {(!fullHeightQuery || fullHeightQuery) && (
            isLoading ? (
              <button
                onClick={handleStop}
                className={`${fullHeightQuery ? 'min-w-[108px] sm:min-w-[140px] px-5 sm:px-8 h-10 sm:h-11 text-[12px] sm:text-[13px] rounded-lg' : (compact ? 'px-4 py-2 text-xs rounded-lg' : 'px-5 py-3 rounded-lg')} font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 ${isLightTheme ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-600 text-white hover:bg-red-700'}`}
              >
                <FaTimes className="w-3 h-3" /> STOP
              </button>
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className={`${fullHeightQuery ? `min-w-[108px] sm:min-w-[140px] px-5 sm:px-8 h-10 sm:h-11 text-[12px] sm:text-[13px] rounded-lg` : (compact ? 'px-4 py-2 text-xs rounded-lg' : 'px-5 py-3 rounded-lg')} font-bold uppercase tracking-widest transition ${
                  fullHeightQuery
                    ? (isLightTheme
                        ? (!inputText.trim() ? 'bg-white text-[#0F172A] border border-[#0B3D2E] opacity-50 cursor-not-allowed' : 'bg-[#22C58B] text-white border border-transparent')
                        : (!inputText.trim() ? 'bg-transparent text-white border border-gray-500 opacity-50 cursor-not-allowed' : 'bg-transparent text-white border border-[#22C58B] hover:border-[#22C58B]'))
                    : ((!inputText.trim())
                        ? `opacity-50 cursor-not-allowed ${isLightTheme ? 'bg-[#22C58B]/60 text-white' : 'text-white border-gray-500'}`
                        : `${isLightTheme ? 'text-white bg-[#22C58B]' : 'text-white border-[#22C58B] hover:border-[#22C58B]'}`)
                }`}
              >
                SEND
              </button>
            )
          )}
        </div>
        {!fullHeightQuery && (
        <div className={`flex flex-wrap ${compact ? 'gap-2' : 'gap-3'}`}>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className={`border rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${isLightTheme ? 'bg-[#F4F6F8] border-[#0B3D2E] text-[#0F172A] hover:border-[#22C58B]' : 'bg-[#09090B] border-[#27272A] text-gray-200 hover:border-emerald-500'} ${compact ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'}`}
            >
              {q}
            </button>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
