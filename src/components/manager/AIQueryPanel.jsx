import React, { useState } from 'react';
import { FaSearch, FaUserCog, FaRocket, FaChevronDown, FaRobot, FaTimes } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

export default function AIQueryPanel({ onQuery, onManagePeople, onLaunchTest }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showManageDropdown, setShowManageDropdown] = useState(false);

  const PRESET_QUERIES = [
    "Where is change slowing down?",
    "Which teams are improving fastest?",
    "What patterns repeat across organizations?",
    "What is blocking solution feasibility?"
  ];

  const handleQuerySubmit = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await onQuery(text);
      setResult(response.answer || "No insights found.");
    } catch (error) {
      setResult("Error processing query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleQuerySubmit(query);
    }
  };

  return (
    <div className="bg-[#1e293b] rounded-xl shadow-xl border border-gray-800 p-8 transition-all duration-300">
      {/* Header / Input Area */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="relative w-full">
          <input
            type="text"
            className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-6 py-5 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-all text-lg font-medium"
            placeholder="Ask the database..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Preset Queries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(q);
                handleQuerySubmit(q);
              }}
              className="px-6 py-4 bg-[#0f172a] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md hover:bg-gray-800 border border-gray-800 transition-all text-center leading-relaxed h-full flex items-center justify-center"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Results Area */}
      {(result || loading) && (
        <div className="mt-8 bg-[#0f172a] rounded-xl p-8 border border-gray-800 animate-in fade-in slide-in-from-top-4 duration-300 relative">
          <button 
            onClick={() => setResult(null)}
            className="absolute top-6 right-6 text-gray-500 hover:text-white p-2 transition-colors"
          >
            <FaTimes />
          </button>
          
          <div className="flex items-start gap-6">
            <div className="w-10 h-10 bg-[#1e293b] border border-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-inner">
              <FaRobot className="text-[#00f2aa] w-5 h-5" />
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
              {loading ? (
                <div className="flex items-center gap-3 text-gray-500 font-bold uppercase tracking-widest text-xs">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[#00f2aa] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-[#00f2aa] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-[#00f2aa] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>Analyzing company data...</span>
                </div>
              ) : (
                <ReactMarkdown>{result}</ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
