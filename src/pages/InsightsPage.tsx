import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { InsightCard } from '../components/insights/InsightCard';
import { SavingsSuggestionCard } from '../components/insights/SavingsSuggestionCard';
import { DecisionSimulatorCard } from '../components/dashboard/DecisionSimulatorCard';
import { formatINR } from '../utils/currency';
import { formatDate } from '../utils/dates';
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const { insights, savingsSuggestions, state, selectExpense, openWhyAnomaly } = useApp();

  const anomalies = state.expenses.filter(t => t.isAnomaly);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Financial Intelligence & Insights
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Automated pattern detection, outlier alerts, and actionable recommendations to optimize cash flow.
        </p>
      </div>

      {/* SECTION 1: SMART INSIGHTS GRID */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Spending Signals & Patterns
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map(item => (
            <InsightCard key={item.id} insight={item} />
          ))}
        </div>
      </div>

      {/* SECTION 2: ANOMALY DETECTION (PROMPT REQUIREMENT) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Outlier & Anomaly Detection
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {anomalies.length} unusual {anomalies.length === 1 ? 'transaction' : 'transactions'} flagged
          </span>
        </div>

        {anomalies.length === 0 ? (
          <div className="p-6 bg-white border border-slate-200/90 rounded-2xl text-center text-xs text-slate-500">
            No unusual spending spikes detected this cycle. All transactions align with baseline averages.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.map(anom => (
              <div
                key={anom.id}
                onClick={() => selectExpense(anom)}
                className="p-5 bg-white border border-amber-200/90 rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Unusual Spike
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{formatDate(anom.date)}</span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <h4 className="text-sm font-bold text-slate-900">{anom.merchant}</h4>
                    <span className="text-base font-bold text-slate-900 font-mono" data-tabular>
                      {formatINR(anom.amount)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {anom.anomalyReason ||
                      `This purchase is significantly higher than your typical ${anom.category} average.`}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWhyAnomaly(anom);
                    }}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Why? (Calculation)</span>
                  </button>
                  <span className="font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: DECISION SIMULATOR & SAVINGS OPPORTUNITIES */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Savings Opportunities & Compounding Projections
          </h3>
        </div>

        <DecisionSimulatorCard />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {savingsSuggestions.map(sugg => (
            <SavingsSuggestionCard key={sugg.id} suggestion={sugg} />
          ))}
        </div>
      </div>
    </div>
  );
};
