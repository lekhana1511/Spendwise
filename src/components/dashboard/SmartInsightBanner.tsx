import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SmartInsight, SavingsSuggestion } from '../../services/insightService';
import { formatINR } from '../../utils/currency';
import { useApp } from '../../store/AppContext';
import { Lightbulb, TrendingUp, ArrowRight, Sparkles, AlertTriangle, HelpCircle } from 'lucide-react';

interface SmartInsightBannerProps {
  topInsight?: SmartInsight;
  topSuggestion?: SavingsSuggestion;
}

export const SmartInsightBanner: React.FC<SmartInsightBannerProps> = ({
  topInsight,
  topSuggestion
}) => {
  const navigate = useNavigate();
  const { state, setProjectionPrefill, openWhyAnomaly, selectExpense } = useApp();

  const activeAnomaly = state.expenses.find(t => t.isAnomaly);

  const handleSimulate = (amount: number) => {
    setProjectionPrefill(amount);
    navigate('/projection');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card 1: Outlier Anomaly Alert OR Primary Insight */}
      {activeAnomaly ? (
        <div className="p-4.5 bg-gradient-to-br from-amber-50/90 via-white to-slate-50 border border-amber-200/90 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Unusual {activeAnomaly.category} Expense</span>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded font-mono">
                {activeAnomaly.anomalyMultiplier || 6.8}× Baseline
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-sm font-bold text-slate-900">{activeAnomaly.merchant}</h4>
              <span className="text-sm font-bold text-slate-900 font-mono" data-tabular>
                {formatINR(activeAnomaly.amount)}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
              {activeAnomaly.anomalyReason ||
                `This transaction is significantly higher than your typical ${activeAnomaly.category} baseline.`}
            </p>
          </div>

          <div className="pt-3 mt-2 border-t border-amber-100 flex items-center justify-between">
            <button
              onClick={() => openWhyAnomaly(activeAnomaly)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Why? (How calculated)</span>
            </button>

            <button
              onClick={() => selectExpense(activeAnomaly)}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 rounded-lg transition-colors"
            >
              <span>Review</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4.5 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 border border-blue-200/70 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-2">
              <Lightbulb className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Smart Spending Insight</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {topInsight?.title || 'Food spending is elevated'}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {topInsight?.message || 'Food delivery charges rose faster than essentials this cycle.'}
            </p>
          </div>

          <div className="pt-3 mt-2 border-t border-blue-100 flex items-center justify-between">
            <span className="text-xs font-mono text-blue-700 font-semibold">
              {topInsight?.supportingValue || 'Active cycle'}
            </span>
            <button
              onClick={() => navigate(topInsight?.actionRoute || '/analytics')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
            >
              <span>{topInsight?.actionLabel || 'View Analysis'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Card 2: Compact Savings Opportunity */}
      <div className="p-4.5 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border border-emerald-200/70 rounded-2xl shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Savings Opportunity</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-mono">
              20% Cut Target
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <h4 className="text-sm font-bold text-slate-900">
              {topSuggestion?.title || 'Reduce Food Delivery'}
            </h4>
            <span className="text-xs font-semibold text-slate-500 font-mono" data-tabular>
              Spent {formatINR(topSuggestion?.currentSpend || 4200)}
            </span>
          </div>

          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Potential saving: <strong className="text-emerald-700 font-mono" data-tabular>{formatINR(topSuggestion?.monthlySaving || 840)}/month</strong> ({formatINR((topSuggestion?.monthlySaving || 840) * 12)}/year).
          </p>
        </div>

        <div className="pt-3 mt-2 border-t border-emerald-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Educational projection
          </span>
          <button
            onClick={() => handleSimulate(topSuggestion?.monthlySaving || 840)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-lg transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Simulate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
