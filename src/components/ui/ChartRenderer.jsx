import React from 'react';

export default function ChartRenderer({ spec }) {
  const type = spec?.type || 'bar';
  const labels = Array.isArray(spec?.labels) ? spec.labels : [];
  const data = Array.isArray(spec?.data) ? spec.data : [];
  const title = spec?.title || '';
  const color = spec?.color || '#3b82f6'; // Default blue to match screenshot

  const maxVal = data.length > 0 ? Math.max(...data) : 100;
  const minVal = data.length > 0 ? Math.min(...data) : 0;
  
  // For percentage charts like CKPI, we might want a fixed range or dynamic
  // Let's make it slightly more than max and slightly less than min for padding
  const yMax = Math.min(100, Math.ceil(maxVal / 5) * 5 + 5);
  const yMin = Math.max(0, Math.floor(minVal / 5) * 5 - 5);
  const yRange = yMax - yMin;

  const padding = { top: 30, right: 20, bottom: 40, left: 50 };
  const width = 800; // Increased width
  const height = 350; // Increased height
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const yScale = (v) => {
    return padding.top + plotH - ((v - yMin) / (yRange || 1)) * plotH;
  };
  
  const xScale = (i) => {
    if (labels.length <= 1) return padding.left + plotW / 2;
    return padding.left + i * (plotW / (labels.length - 1));
  };

  // Generate Y-axis ticks (4 or 5 steps)
  const yTicks = [];
  for (let i = 0; i <= 4; i++) {
    yTicks.push(yMin + (yRange * i) / 4);
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl p-2">
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Definitions for gradients */}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines (Horizontal) */}
            {yTicks.map((tick, i) => (
              <g key={`grid-${i}`}>
                <line
                  x1={padding.left}
                  y1={yScale(tick)}
                  x2={padding.left + plotW}
                  y2={yScale(tick)}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                  strokeDasharray={i === 0 ? "" : "4 4"}
                />
                <text
                  x={padding.left - 10}
                  y={yScale(tick) + 4}
                  textAnchor="end"
                  className="fill-gray-400 text-[12px] font-medium"
                >
                  {Math.round(tick)}%
                </text>
              </g>
            ))}

            {type === 'line' && data.length > 0 && (
              <>
                {/* Area under the line */}
                <path
                  d={`
                    M ${xScale(0)} ${yScale(data[0])}
                    ${data.map((v, i) => `L ${xScale(i)} ${yScale(v)}`).join(' ')}
                    L ${xScale(data.length - 1)} ${padding.top + plotH}
                    L ${xScale(0)} ${padding.top + plotH}
                    Z
                  `}
                  fill="url(#chartGradient)"
                />

                {/* The Line */}
                <path
                  d={`M ${xScale(0)} ${yScale(data[0])} ${data.map((v, i) => `L ${xScale(i)} ${yScale(v)}`).join(' ')}`}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points (dots) */}
                {data.map((v, i) => {
                  // Only show dots every few points if there are too many, or just show them all
                  // For 30 days, showing all is fine.
                  const showLabel = i === 0 || i === data.length - 1 || i % Math.floor(data.length / 5) === 0;
                  return (
                    <g key={`pt-${i}`}>
                      <circle
                        cx={xScale(i)}
                        cy={yScale(v)}
                        r="4"
                        fill="white"
                        stroke={color}
                        strokeWidth="2"
                      />
                      {showLabel && (
                        <text
                          x={xScale(i)}
                          y={padding.top + plotH + 20}
                          textAnchor="middle"
                          className="fill-gray-500 text-[11px]"
                        >
                          {labels[i]}
                        </text>
                      )}
                    </g>
                  );
                })}
              </>
            )}

            {type === 'bar' && labels.map((label, i) => {
              const barW = plotW / labels.length * 0.6;
              const x = padding.left + i * (plotW / labels.length) + (plotW / labels.length - barW) / 2;
              const y = yScale(data[i] || 0);
              const h = padding.top + plotH - y;
              return (
                <g key={i}>
                  <rect x={x} y={y} width={barW} height={h} fill={color} rx="2" />
                  <text
                    x={x + barW / 2}
                    y={padding.top + plotH + 20}
                    className="fill-gray-500 text-[11px]"
                    textAnchor="middle"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
