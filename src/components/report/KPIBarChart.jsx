import React from 'react';

export default function KPIBarChart({ values = [], labels = [] }) {
  return (
    <div className="space-y-4">
      {values.map((v, i) => {
        const pct = Math.round(v);
        return (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="font-semibold text-gray-700">{labels[i]}</div>
              <div className="font-bold text-gray-900">{pct}%</div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-1000" 
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
