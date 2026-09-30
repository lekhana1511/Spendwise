import React, { useState } from 'react';
import { ProjectionDataPoint, ProjectionMilestone } from '../../services/projectionService';
import { formatINR } from '../../utils/currency';

interface ProjectionChartProps {
  dataPoints: ProjectionDataPoint[];
  milestones: ProjectionMilestone[];
  disclaimer: string;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({
  dataPoints,
  milestones,
  disclaimer
}) => {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  if (!dataPoints || dataPoints.length === 0) return null;

  const maxYear = dataPoints[dataPoints.length - 1].year;
  const maxValue = Math.max(
    ...dataPoints.map(d => d.projectedValue),
    10000
  );

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingY * 2;

  const getX = (year: number) => paddingX + (year / maxYear) * graphWidth;
  const getY = (val: number) => svgHeight - paddingY - (val / maxValue) * graphHeight;

  // Build SVG path for Projected Value Area
  const projPoints = dataPoints.map(d => `${getX(d.year)},${getY(d.projectedValue)}`);
  const projPathD = `M ${projPoints.join(' L ')}`;
  const projAreaD = `${projPathD} L ${getX(maxYear)},${svgHeight - paddingY} L ${getX(0)},${svgHeight - paddingY} Z`;

  // Build SVG path for Contributions Area
  const contribPoints = dataPoints.map(d => `${getX(d.year)},${getY(d.contributions)}`);
  const contribPathD = `M ${contribPoints.join(' L ')}`;
  const contribAreaD = `${contribPathD} L ${getX(maxYear)},${svgHeight - paddingY} L ${getX(0)},${svgHeight - paddingY} Z`;

  const hoveredData = hoveredYear !== null ? dataPoints.find(d => d.year === hoveredYear) : null;

  return (
    <div className="space-y-4">
      {/* Legend & Hover Info */}
      <div className="flex flex-wrap items-center justify-between text-xs border-b border-slate-100 pb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500/80" />
            <span className="text-slate-700 font-medium">Estimated Future Wealth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-blue-500/70" />
            <span className="text-slate-700 font-medium">Total Contributions</span>
          </div>
        </div>

        {hoveredData ? (
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-slate-500">Year {hoveredData.year}:</span>
            <span className="text-emerald-700 font-semibold">{formatINR(hoveredData.projectedValue)}</span>
            <span className="text-slate-400">({formatINR(hoveredData.contributions)} saved)</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px]">Hover over graph points for yearly breakdown</span>
        )}
      </div>

      {/* SVG Line / Area Graph */}
      <div className="relative w-full overflow-hidden bg-slate-50/50 rounded-xl p-2 border border-slate-100">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="contribGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map(pct => {
            const y = svgHeight - paddingY - pct * graphHeight;
            return (
              <g key={pct}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {formatINR(maxValue * pct, { compact: true })}
                </text>
              </g>
            );
          })}

          {/* Shaded Areas */}
          <path d={projAreaD} fill="url(#wealthGrad)" />
          <path d={contribAreaD} fill="url(#contribGrad)" />

          {/* Boundary stroke lines */}
          <path d={projPathD} fill="none" stroke="#059669" strokeWidth="2.5" />
          <path d={contribPathD} fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="3 3" />

          {/* Interactive Data Point Dots */}
          {dataPoints.map(d => {
            const x = getX(d.year);
            const y = getY(d.projectedValue);
            const isHovered = hoveredYear === d.year;

            return (
              <g
                key={d.year}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredYear(d.year)}
                onMouseLeave={() => setHoveredYear(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? '#059669' : '#FFFFFF'}
                  stroke="#059669"
                  strokeWidth="2"
                  className="transition-all"
                />
                {/* X Axis Year Labels */}
                {d.year % 2 === 0 || d.year === maxYear ? (
                  <text
                    x={x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-500 font-mono"
                  >
                    Yr {d.year}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Milestone Cards (1 yr, 5 yr, 10 yr) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        {milestones.map(m => (
          <div
            key={m.years}
            className="p-3 bg-white border border-slate-200/90 rounded-xl space-y-1"
          >
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              {m.label}
            </span>
            <p className="text-base font-bold text-slate-900 font-mono tracking-tight" data-tabular>
              {formatINR(m.futureValue)}
            </p>
            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>Saved: {formatINR(m.totalContributed, { compact: true })}</span>
              <span className="text-emerald-700 font-semibold">
                +{formatINR(m.wealthGained, { compact: true })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg text-[11px] text-slate-500 leading-relaxed">
        {disclaimer}
      </div>
    </div>
  );
};
