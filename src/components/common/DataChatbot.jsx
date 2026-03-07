import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaUser, FaPaperPlane, FaSpinner, FaChartBar, FaImage, FaCopy, FaCheck, FaCode } from 'react-icons/fa';
import { Button, Tooltip, message } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ChartRenderer from '../ui/ChartRenderer';
import KPIBarChart from '../report/KPIBarChart';

export default function DataChatbot({ 
  onSendMessage, 
  placeholder = "Ask me anything about your data...",
  title = "Data Assistant",
  className = "",
  maxHeight = "400px",
  storageKey = null, // Optional localStorage key for persistence
  maxMessages = 50, // Maximum messages to keep in history
  autoClearOnRefresh = true, // Automatically clear chat on page refresh
  suggestedQuestions = [
    "Which problems are most frequent?",
    "Which problems should we focus on first?",
    "Which solutions are most implementable?",
    "Where can we get quick wins?"
  ]
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
  }, [storageKey, autoClearOnRefresh]);

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
    inputRef.current?.focus();
  }, []);

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

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call the provided message handler
      const response = await onSendMessage(messageText);
      
      // Check if response contains visual components (charts or images)
      const hasVisualComponents = response.chartSpec || response.imageUrl;
      
      // Add bot response with potential visual components
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.answer || response,
        timestamp: new Date(),
        chartSpec: response.chartSpec,
        imageUrl: response.imageUrl,
        imageSize: response.imageSize,
        hasVisualComponents
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: err.message || 'Failed to get response',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    inputRef.current?.focus();
    
    // Clear from localStorage if persistence is enabled
    if (storageKey) {
      try {
        localStorage.removeItem(`${storageKey}_messages`);
      } catch (err) {
        console.warn('Failed to clear conversation history:', err);
      }
    }
  };



  // Component to render visual content (charts and images)
  const VisualComponent = ({ message }) => {
    if (!message.hasVisualComponents) return null;

    return (
      <div className="mt-4 space-y-4">
        {message.chartSpec && (
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaChartBar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Generated Chart</h4>
                  <p className="text-xs text-gray-500">Interactive data visualization</p>
                </div>
              </div>
              <Tooltip title="Copy chart data">
                  <Button
                    size="small"
                    icon={<FaCopy className="w-3 h-3" />}
                    onClick={() => copyToClipboard(JSON.stringify(message.chartSpec, null, 2))}
                    className="text-gray-400 hover:text-gray-600 border-0"
                    ghost
                  />
                </Tooltip>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <ChartRenderer spec={message.chartSpec} />
            </div>
          </div>
        )}

        {message.imageUrl && (
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaImage className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Generated Analysis</h4>
                  <p className="text-xs text-gray-500">AI-powered visual insight</p>
                </div>
              </div>
            </div>
            <div className="p-2 bg-gray-900 flex justify-center">
              <img 
                src={message.imageUrl} 
                alt="AI Generated Analysis" 
                className={`max-w-full h-auto rounded shadow-lg ${message.imageSize === 'large' ? 'w-full' : 'max-h-[400px]'}`}
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-transparent ${className} overflow-hidden`}>
      {/* Messages */}
      <div 
        className="p-5 space-y-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white"
        style={{ maxHeight }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <FaRobot className="w-10 h-10 text-indigo-400 opacity-50" />
            </div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">Hello! How can I help you today?</h4>
            <p className="text-sm text-gray-500 max-w-xs mb-8">
              I can analyze your company data, generate charts, and provide insights into your performance metrics.
            </p>
            
            {/* Suggested Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(question)}
                  className="p-4 text-left text-sm text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md transition-all duration-300 group"
                >
                  <span className="text-indigo-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Avatar */}
            {message.type !== 'user' && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {message.type === 'bot' ? (
                  <FaRobot className="w-4 h-4 text-blue-600" />
                ) : (
                  <FaRobot className="w-4 h-4 text-red-600" />
                )}
              </div>
            )}

            {/* Message Content */}
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                <div className={`rounded-2xl px-5 py-4 shadow-sm ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-100' 
                    : message.type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-white border border-gray-200 text-gray-900 hover:shadow-md transition-shadow'
                }`}>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');
                          
                          if (inline) {
                            return (
                              <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
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
                                    className="text-gray-400 hover:text-gray-600 bg-white/80 backdrop-blur border-0"
                                    ghost
                                  />
                                </Tooltip>
                              </div>
                              <SyntaxHighlighter
                                style={tomorrow}
                                language={match ? match[1] : 'text'}
                                PreTag="div"
                                className="rounded-lg !mt-0 !mb-0"
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
                              <table className="min-w-full divide-y divide-gray-200">
                                {children}
                              </table>
                            </div>
                          );
                        },
                        th({ children }) {
                          return (
                            <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {children}
                            </th>
                          );
                        },
                        td({ children }) {
                          return (
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 border-t border-gray-200">
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
                <div className={`text-xs text-gray-500 mt-2 flex items-center gap-2 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <span>{formatTime(message.timestamp)}</span>
                  {message.type === 'bot' && (
                    <Tooltip title="Copy message">
                      <Button
                        size="small"
                        icon={<FaCopy className="w-3 h-3" />}
                        onClick={() => copyToClipboard(message.content)}
                        className="text-gray-400 hover:text-gray-600 !p-1 border-0"
                        ghost
                      />
                    </Tooltip>
                  )}
                </div>
                
                {/* Visual Components (Charts and Images) */}
                {message.type === 'bot' && <VisualComponent message={message} />}
              </div>

            {/* User Avatar */}
            {message.type === 'user' && (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 order-2">
                <FaUser className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <div className="relative">
                <FaSpinner className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 text-gray-900 rounded-2xl px-5 py-4 shadow-sm max-w-md">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Analyzing your data and generating insights
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input and Suggestions */}
      <div className="p-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        {/* Predefined Questions (FAQ style) */}
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-xs bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 px-3 py-1.5 rounded-full transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLoading ? "Analyzing your data..." : placeholder}
              disabled={isLoading}
              className="w-full px-5 py-4 rounded-2xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all shadow-sm hover:shadow-md"
            />
            {inputText && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  Press Enter to send
                </span>
              </div>
            )}
          </div>
          <Tooltip title={isLoading ? "Processing..." : "Send message"}>
            <Button
              type="primary"
              size="large"
              icon={isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`rounded-2xl shadow-lg transition-all ${
                !inputText.trim() || isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-xl hover:scale-105'
              }`}
              style={{
                background: !inputText.trim() || isLoading 
                  ? undefined 
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: 'none',
                height: '56px',
                width: '56px'
              }}
            />
          </Tooltip>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>AI Assistant is online</span>
          </div>
          <div>
            Powered by GPT-4o-mini
          </div>
        </div>
      </div>
    </div>
  );
}