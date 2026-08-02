import React from 'react';

export default function KPIBarChart({ values = [], labels = [], theme = "dark", barColor }) {
  const isLightTheme = theme === "light";
  const useWhiteBar = barColor === 'white';

  return (
    <div className="space-y-4">
      {values.map((v, i) => {
        const pct = Math.round(v);
        return (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className={`font-semibold ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>{labels[i]}</div>
              <div className={`font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-emerald-500'}`}>{pct}%</div>
            </div>
            <div className={`h-3 rounded-full overflow-hidden border ${isLightTheme ? 'bg-white/60 border-emerald-600' : 'bg-[#27272A] border-[#2e2e36]'}`}>
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${useWhiteBar ? 'bg-white' : isLightTheme ? 'bg-emerald-500' : 'bg-emerald-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}