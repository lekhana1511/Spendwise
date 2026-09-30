import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { formatINR } from '../../utils/currency';
import { Repeat, ArrowRight } from 'lucide-react';

export const RecurringExpensesBanner: React.FC = () => {
  const navigate = useNavigate();
  const { analytics } = useApp();
  const recurring = analytics.recurringSpend;

  if (!recurring || recurring.count === 0) return null;

  return (
    <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Repeat className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              Recurring Subscriptions & Fixed Utilities
            </span>
            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
              {recurring.count} merchants
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Committed fixed outflow: <strong className="text-slate-900 font-mono" data-tabular>{formatINR(recurring.totalMonthly)}/mo</strong> (Netflix, Spotify, Jio, BESCOM)
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/expenses?category=Entertainment')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
      >
        <span>Review Subscriptions</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
