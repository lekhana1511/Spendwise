import React from 'react';
import { AssistantChat } from '../components/assistant/AssistantChat';
import { useApp } from '../store/AppContext';
import { formatINR } from '../utils/currency';
import { Sparkles, HelpCircle, ShieldCheck, TrendingDown } from 'lucide-react';

export const AssistantPage: React.FC = () => {
  const { analytics, state } = useApp();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Financial Assistant
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Ask questions in natural language. Powered by real-time intent mapping grounded in your September 2026 data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Engine */}
        <div className="lg:col-span-3">
          <AssistantChat />
        </div>

        {/* Sidebar Information / Live Grounding Context */}
        <div className="space-y-4 lg:col-span-1">
          <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Grounded Knowledge Base</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The assistant calculates answers strictly from your confirmed transactions:
            </p>

            <div className="space-y-2 pt-1 text-xs border-t border-slate-100 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Active Month:</span>
                <span className="text-slate-900 font-semibold">Sep 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Total Spend:</span>
                <span className="text-slate-900 font-semibold" data-tabular>
                  {formatINR(analytics.totalSpending)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Remaining:</span>
                <span className="text-emerald-700 font-semibold" data-tabular>
                  {formatINR(analytics.remainingBudget)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Top Category:</span>
                <span className="text-blue-700 font-semibold truncate max-w-[100px]">
                  {analytics.highestCategory?.name || 'None'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs space-y-2 text-blue-900">
            <span className="font-bold block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Privacy & Intelligence
            </span>
            <p className="text-[11px] text-blue-800/90 leading-relaxed">
              Spendwise executes explainable local rule calculations. Your financial statements are never shared with external advertising or tracking platforms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
