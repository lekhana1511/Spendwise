import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { generateProjectionSchedule } from '../../services/projectionService';
import { ProjectionChart } from '../charts/ProjectionChart';
import { formatINR } from '../../utils/currency';
import { Calculator, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';

export const ProjectionCalculator: React.FC = () => {
  const { state, setProjectionPrefill } = useApp();

  const prefill = state.ui.projectionPrefillAmount;

  const [monthlySavings, setMonthlySavings] = useState(prefill || 4000);
  const [annualRate, setAnnualRate] = useState(10); // 10% typical equity/index mutual fund
  const [years, setYears] = useState(10);

  // Sync if prefill was set by a savings suggestion card
  useEffect(() => {
    if (prefill) {
      setMonthlySavings(prefill);
      setProjectionPrefill(undefined); // Reset after consuming
    }
  }, [prefill, setProjectionPrefill]);

  const schedule = generateProjectionSchedule(monthlySavings, annualRate, years);

  const finalPoint = schedule.dataPoints[schedule.dataPoints.length - 1];

  return (
    <div className="space-y-6">
      {/* Control Panel & Hero Values */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-5 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Compound Simulator</h3>
            </div>
            <button
              onClick={() => {
                setMonthlySavings(5000);
                setAnnualRate(10);
                setYears(10);
              }}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Monthly Savings Input & Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Monthly Contribution</label>
              <span className="text-xs font-bold text-blue-600 font-mono" data-tabular>
                {formatINR(monthlySavings)}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={monthlySavings}
              onChange={e => setMonthlySavings(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>₹500</span>
              <span>₹25,000</span>
              <span>₹50,000</span>
            </div>
          </div>

          {/* Assumed Annual Return */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Expected Annual Return</label>
              <span className="text-xs font-bold text-emerald-700 font-mono" data-tabular>
                {annualRate}% p.a.
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="18"
              step="0.5"
              value={annualRate}
              onChange={e => setAnnualRate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>4% (FD/Debt)</span>
              <span>10% (Hybrid)</span>
              <span>15%+ (Equity)</span>
            </div>
          </div>

          {/* Timeframe Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Investment Horizon: <span className="font-mono text-slate-900">{years} Years</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 3, 5, 10, 15, 20].map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYears(y)}
                  className={`py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                    years === y
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {y} {y === 1 ? 'Yr' : 'Yrs'}
                </button>
              ))}
            </div>
          </div>

          {/* Preloaded suggestion alert if applicable */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-900">
            <span className="font-semibold block mb-0.5">Discipline Multiplier</span>
            <span className="text-blue-700 leading-relaxed text-[11px]">
              Redirecting 20% of online food delivery (₹840/mo) into an index fund at 10% yields ₹1.73 Lakh over 10 years!
            </span>
          </div>
        </div>

        {/* Projection Results & Chart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs lg:col-span-2 flex flex-col justify-between">
          <div>
            {/* Top Metrics Row */}
            <div className="grid grid-cols-3 gap-3 border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                  Projected Wealth
                </span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono tracking-tight" data-tabular>
                  {formatINR(finalPoint?.projectedValue || 0)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">at year {years}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                  Total Saved
                </span>
                <span className="text-lg sm:text-xl font-bold text-slate-800 font-mono tracking-tight" data-tabular>
                  {formatINR(finalPoint?.contributions || 0)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">principal invested</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                  Compound Returns
                </span>
                <span className="text-lg sm:text-xl font-bold text-blue-600 font-mono tracking-tight" data-tabular>
                  +{formatINR(finalPoint?.interestEarned || 0)}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">pure interest</span>
              </div>
            </div>

            {/* Interactive SVG Projection Chart */}
            <ProjectionChart
              dataPoints={schedule.dataPoints}
              milestones={schedule.milestones}
              disclaimer={schedule.disclaimer}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
