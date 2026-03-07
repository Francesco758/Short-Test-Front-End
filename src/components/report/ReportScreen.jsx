import React from 'react';
import KPIAnimatedNumber from './KPIAnimatedNumber';
import KPIBarChart from './KPIBarChart';
import SummaryCard from './SummaryCard';

export default function ReportScreen({ report }) {
  const components = report?.kpis?.components || {};
  const confidence = report?.kpis?.evaluationMetadata?.confidence || null;
  const messageCount = report?.kpis?.evaluationMetadata?.messageCount || null;
  const engagement = messageCount ? Math.min(100, Math.round((messageCount / 12) * 100)) : null;

  return (
    <div className="space-y-6">
      <div className="text-center" data-aos="fade-up" data-aos-delay="100">
        <div className="text-sm text-gray-500">Your current Change KPI is</div>
        <KPIAnimatedNumber value={report.percentage || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div data-aos="fade-right" data-aos-delay="200">
          <KPIBarChart
            values={[
              components.creativity ?? 0,
              components.feasibility ?? 0,
              components.proactivity ?? 0,
              confidence ?? 0,
              engagement ?? 0
            ]}
            labels={['Creativity','Feasibility','Proactivity','Confidence','Engagement']}
          />
        </div>
        <div data-aos="fade-left" data-aos-delay="300">
          <SummaryCard 
            text={report.summary || 'No summary'} 
            strengths={report.kpis?.strengths || []}
            improvements={report.kpis?.improvements || []}
          />
        </div>
      </div>

      {(components.simplification != null || components.originality != null || components.criticalThinking != null) && (
        <div data-aos="fade-up" data-aos-delay="350">
          <KPIBarChart
            values={[
              components.simplification ?? 0,
              components.originality ?? 0,
              components.criticalThinking ?? 0
            ]}
            labels={['Simplification','Originality','Critical Thinking']}
          />
        </div>
      )}
    </div>
  );
}
