import React from 'react';
import { FaLightbulb, FaExclamationTriangle } from 'react-icons/fa';

export default function SummaryCard({ text, strengths = [], improvements = [], theme = "dark" }) {
  const isLightTheme = theme === "light";

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-5 shadow-sm ${isLightTheme ? 'bg-white border-emerald-600' : 'bg-[#202025] border-[#2e2e36]'}`}>
        <div className={`font-bold mb-3 ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>Test Insight</div>
        <div className={`text-sm leading-relaxed ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-300'}`}>{text}</div>
      </div>

      {(strengths.length > 0 || improvements.length > 0) && (
        <div className="grid grid-cols-1 gap-4">
          {strengths.length > 0 && (
            <div className={`rounded-xl border p-5 shadow-sm ${isLightTheme ? 'bg-white/80 border-emerald-600' : 'bg-[#202025] border-[#2e2e36]'}`}>
              <div className={`flex items-center gap-2 font-bold mb-3 ${isLightTheme ? 'text-emerald-800' : 'text-emerald-500'}`}>
                <FaLightbulb className="w-4 h-4" />
                Key Strengths
              </div>
              <ul className="space-y-2">
                {strengths.map((item, idx) => (
                  <li key={idx} className={`flex items-start gap-2 text-sm ${isLightTheme ? 'text-emerald-800' : 'text-gray-300'}`}>
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLightTheme ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {improvements.length > 0 && (
            <div className={`rounded-xl border p-5 shadow-sm ${isLightTheme ? 'bg-white/80 border-emerald-600' : 'bg-[#202025] border-[#2e2e36]'}`}>
              <div className={`flex items-center gap-2 font-bold mb-3 ${isLightTheme ? 'text-amber-800' : 'text-amber-400'}`}>
                <FaExclamationTriangle className="w-4 h-4" />
                Areas for Growth
              </div>
              <ul className="space-y-2">
                {improvements.map((item, idx) => (
                  <li key={idx} className={`flex items-start gap-2 text-sm ${isLightTheme ? 'text-amber-800' : 'text-gray-300'}`}>
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLightTheme ? 'bg-amber-400' : 'bg-amber-500'}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}