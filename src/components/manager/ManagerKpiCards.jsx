// Alternative enhanced version with gradient backgrounds
import React from "react";
import { 
  FaChartLine, 
  FaFileAlt, 
  FaUsers, 
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";

export function KpiCard({ title, value, delta, note, icon, trend, index, onClick, drillDownButton, children }) {
  const isPositive = delta >= 0;
  
  const TrendIcon = trend === 'up' ? (
    <FaArrowUp className="w-3 h-3" />
  ) : (
    <FaArrowDown className="w-3 h-3" />
  );

  // Different gradient backgrounds for each card
  const gradients = [
    "from-blue-50 to-indigo-50 border-blue-100",
    "from-green-50 to-emerald-50 border-green-100", 
    "from-purple-50 to-pink-50 border-purple-100",
    "from-orange-50 to-amber-50 border-orange-100"
  ];

  const iconColors = [
    "text-blue-600",
    "text-green-600",
    "text-purple-600", 
    "text-orange-600"
  ];

  return (
    <div 
      onClick={onClick}
      className={`bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl shadow-sm border p-6 hover:shadow-lg transition-all duration-300 group ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''} flex flex-col h-full`} 
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-gray-700 tracking-wide">{title}</div>
        <div className="flex items-center gap-2">
          {drillDownButton && (
            <div onClick={(e) => e.stopPropagation()}>
              {drillDownButton}
            </div>
          )}
          {icon && (
            <div className={`p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300 ${iconColors[index % iconColors.length]}`}>
              {icon}
            </div>
          )}
        </div>
      </div>
      
      {children ? (
        <div className="flex-1">
          {children}
        </div>
      ) : (
        <>
          <div className="flex items-end justify-between mb-2">
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              {value}
            </div>
            
            {delta !== undefined && (
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                isPositive 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              } transition-all duration-300 hover:shadow-md`}>
                {TrendIcon}
                <span>{isPositive ? `+${delta}%` : `${delta}%`}</span>
              </div>
            )}
          </div>
          
          {note && (
            <div className="text-xs text-gray-600 mt-3 flex items-center">
              <span className="bg-white/60 px-2 py-1 rounded-md backdrop-blur-sm">{note}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ManagerKpiCards({ kpis = {}, onActiveUsersClick, ckpiDrillDown }) {
  const cardData = [
    {
      title: "Average Change KPI (company / team)",
      value: `${kpis.changeKpiPercent ?? 0}%`,
      delta: kpis.kpiDelta ?? 0,
      note: "vs last period",
      trend: (kpis.kpiDelta ?? 0) >= 0 ? 'up' : 'down',
      icon: <FaChartLine className="w-5 h-5" />,
      drillDownButton: ckpiDrillDown
    },
    {
      title: "Number of People involved",
      value: kpis.activeUsers?.toLocaleString() ?? '0',
      delta: kpis.usersDelta ?? 0,
      note: "vs last week",
      trend: (kpis.usersDelta ?? 0) >= 0 ? 'up' : 'down',
      icon: <FaUsers className="w-5 h-5" />,
      onClick: onActiveUsersClick
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
      {cardData.map((card, index) => (
        <KpiCard
          key={index}
          title={card.title}
          value={card.value}
          delta={card.delta}
          note={card.note}
          icon={card.icon}
          trend={card.trend}
          index={index}
          onClick={card.onClick}
          drillDownButton={card.drillDownButton}
        />
      ))}
    </div>
  );
}