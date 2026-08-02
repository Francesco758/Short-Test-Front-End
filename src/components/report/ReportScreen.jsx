import React from 'react';
import KPIAnimatedNumber from './KPIAnimatedNumber';
import KPIBarChart from './KPIBarChart';
import SummaryCard from './SummaryCard';

const CKPI_LABELS = [
  { key: 'simplification', label: 'Simplification' },
  { key: 'originality', label: 'Originality' },
  { key: 'feasibility', label: 'Feasibility' },
  { key: 'criticalThinking', label: 'Critical Thinking' },
  { key: 'proactivity', label: 'Proactivity' },
  { key: 'impact', label: 'Impact' }
];

export default function ReportScreen({ report, theme = "dark" }) {
  const isLightTheme = theme === "light";
  const components = report?.kpis?.components || {};
  const isEmpty = !report.summary;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`text-sm font-semibold uppercase tracking-wider mb-1 ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>Test CKPI Score</div>
        <KPIAnimatedNumber value={report.percentage || 0} theme={theme} />
      </div>

      <div>
        <KPIBarChart
          values={CKPI_LABELS.map(({ key }) => components[key] ?? 0)}
          labels={CKPI_LABELS.map(({ label }) => label)}
          theme={theme}
          barColor={isLightTheme ? 'white' : undefined}
        />
      </div>
      <div>
        {isEmpty ? (
          <div className={`rounded-xl border p-5 shadow-sm space-y-2 ${isLightTheme ? 'bg-white border-emerald-600' : 'bg-[#202025] border-[#2e2e36]'}`}>
            <div className={`font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-gray-200'}`}>Test Insight</div>
            <p className={`text-sm leading-relaxed ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>
              The user left this test too early without describing any problem or solution. Ensure users complete the full test with sufficient conversation for a proper evaluation.
            </p>
          </div>
        ) : (
          <SummaryCard 
            text={report.summary || 'No summary'} 
            strengths={report.kpis?.strengths || []}
            improvements={report.kpis?.improvements || []}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}