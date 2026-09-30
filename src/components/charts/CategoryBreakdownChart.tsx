import React, { useState } from 'react';
import { CategoryMetric } from '../../services/analyticsService';
import { getCategoryMeta } from '../../data/categories';
import { formatINR } from '../../utils/currency';

interface CategoryBreakdownChartProps {
  data: CategoryMetric[];
  totalSpending: number;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  data,
  totalSpending
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  if (!data || data.length === 0 || totalSpending === 0) {
    return (
      <div className="h-56 flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
        <span>No categorized spending recorded for this period</span>
      </div>
    );
  }

  // Calculate SVG donut segments
  const size = 184;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const segments = data.slice(0, 6).map(item => {
    const fraction = item.amount / totalSpending;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += fraction;

    const meta = getCategoryMeta(item.category);
    return {
      category: item.category,
      amount: item.amount,
      percentage: item.percentage,
      color: meta.color,
      strokeDasharray,
      strokeDashoffset
    };
  });

  const activeItem = hoveredCategory
    ? data.find(d => d.category === hoveredCategory) || data[0]
    : data[0];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
      {/* Donut Chart SVG */}
      <div className="relative shrink-0 flex items-center justify-center p-1">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {segments.map(seg => (
            <circle
              key={seg.category}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={hoveredCategory === seg.category ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredCategory(seg.category)}
              onMouseLeave={() => setHoveredCategory(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[90px]">
            {hoveredCategory ? activeItem.category : 'Total'}
          </span>
          <span className="text-base font-bold text-slate-900 font-mono tracking-tight mt-0.5" data-tabular>
            {formatINR(hoveredCategory ? activeItem.amount : totalSpending, { compact: true })}
          </span>
          <span className="text-[10px] text-blue-600 font-mono font-semibold">
            {hoveredCategory ? `${activeItem.percentage}% Share` : `${data.length} Categories`}
          </span>
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="flex-1 w-full space-y-1.5">
        {data.slice(0, 5).map(item => {
          const meta = getCategoryMeta(item.category);
          const isHovered = hoveredCategory === item.category;

          return (
            <div
              key={item.category}
              onMouseEnter={() => setHoveredCategory(item.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`p-2 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs ${
                isHovered
                  ? 'bg-slate-100/90 shadow-2xs'
                  : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: meta.color }}
                />
                <span className="font-semibold text-slate-800 truncate">{item.category}</span>
                <span className="text-[10px] text-slate-400 font-mono">({item.count})</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-slate-900 font-mono" data-tabular>
                  {formatINR(item.amount)}
                </span>
                <span className="text-[11px] font-mono text-slate-500 w-8 text-right font-medium">
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
