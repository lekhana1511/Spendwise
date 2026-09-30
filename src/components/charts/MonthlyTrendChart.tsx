import React, { useState } from 'react';
import { MonthlyTrendMetric } from '../../services/analyticsService';
import { formatINR } from '../../utils/currency';

interface MonthlyTrendChartProps {
  data: MonthlyTrendMetric[];
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-slate-400 text-xs">
        No monthly trends recorded yet.
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.totalSpending), 1000);

  return (
    <div className="w-full pt-2">
      {/* Chart Canvas with Subtle Grid Lines */}
      <div className="relative h-48 flex items-end justify-around gap-6 px-4 border-b border-slate-200/80 pb-2">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-2">
          <div className="border-b border-dashed border-slate-200/60 w-full flex justify-end">
            <span className="text-[9px] text-slate-400 font-mono pr-1 -mt-2">
              {formatINR(maxVal, { compact: true })}
            </span>
          </div>
          <div className="border-b border-dashed border-slate-200/60 w-full flex justify-end">
            <span className="text-[9px] text-slate-400 font-mono pr-1 -mt-2">
              {formatINR(maxVal * 0.5, { compact: true })}
            </span>
          </div>
          <div className="border-b border-dashed border-slate-200/40 w-full" />
        </div>

        {/* Bars */}
        {data.map((item, idx) => {
          const heightPercent = Math.max(12, Math.round((item.totalSpending / maxVal) * 100));
          const isHovered = hoveredIdx === idx;
          const isLatest = idx === data.length - 1;

          return (
            <div
              key={item.monthKey}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex-1 max-w-[88px] flex flex-col items-center group relative cursor-pointer z-10"
            >
              {/* Floating Tooltip */}
              {isHovered && (
                <div className="absolute -top-12 z-30 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs whitespace-nowrap shadow-lg pointer-events-none font-mono flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <span className="font-bold text-white">{formatINR(item.totalSpending)}</span>
                  <span className="text-slate-400 font-sans text-[10px]">· {item.transactionCount} txns</span>
                </div>
              )}

              {/* Number Label */}
              <span
                className={`text-[11px] font-mono mb-2 transition-colors font-semibold ${
                  isHovered ? 'text-blue-600' : 'text-slate-500'
                }`}
                data-tabular
              >
                {formatINR(item.totalSpending, { compact: true })}
              </span>

              {/* Bar column */}
              <div className="w-full bg-slate-100/90 rounded-t-xl h-32 flex items-end overflow-hidden p-0.5">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    isLatest
                      ? 'bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-700 group-hover:to-indigo-600 shadow-xs'
                      : 'bg-gradient-to-t from-slate-400 to-slate-300 group-hover:from-slate-500 group-hover:to-slate-400'
                  }`}
                />
              </div>

              {/* Month Label */}
              <span className="text-xs font-semibold text-slate-700 mt-2.5 truncate w-full text-center">
                {item.monthLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* Accessible Footer Line */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-xs bg-blue-600" />
          <span>Active Billing Cycle</span>
          <span className="w-2 h-2 rounded-xs bg-slate-400 ml-2" />
          <span>Prior Cycle</span>
        </span>
        <span className="font-mono text-slate-700">
          Latest total: <strong className="font-bold text-slate-900">{formatINR(data[data.length - 1]?.totalSpending || 0)}</strong>
        </span>
      </div>
    </div>
  );
};
