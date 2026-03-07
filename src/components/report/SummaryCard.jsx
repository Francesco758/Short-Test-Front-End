import React from 'react';
import { FaLightbulb, FaExclamationTriangle } from 'react-icons/fa';

export default function SummaryCard({ text, strengths = [], improvements = [] }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="font-bold text-gray-900 mb-3">AI Assessment Summary</div>
        <div className="text-sm leading-relaxed text-gray-700">{text}</div>
      </div>

      {(strengths.length > 0 || improvements.length > 0) && (
        <div className="grid grid-cols-1 gap-4">
          {strengths.length > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-green-800 font-bold mb-3">
                <FaLightbulb className="w-4 h-4" />
                Key Strengths
              </div>
              <ul className="space-y-2">
                {strengths.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {improvements.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-800 font-bold mb-3">
                <FaExclamationTriangle className="w-4 h-4" />
                Areas for Improvement
              </div>
              <ul className="space-y-2">
                {improvements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
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
