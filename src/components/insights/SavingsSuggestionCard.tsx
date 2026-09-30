import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SavingsSuggestion } from '../../services/insightService';
import { formatINR } from '../../utils/currency';
import { useApp } from '../../store/AppContext';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface SavingsSuggestionCardProps {
  suggestion: SavingsSuggestion;
}

export const SavingsSuggestionCard: React.FC<SavingsSuggestionCardProps> = ({ suggestion }) => {
  const navigate = useNavigate();
  const { setProjectionPrefill } = useApp();

  const handleAction = () => {
    setProjectionPrefill(suggestion.monthlySaving);
    navigate('/projection');
  };

  return (
    <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {suggestion.category} Optimization
          </span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
            {suggestion.reductionPercentage}% Target
          </span>
        </div>

        <h4 className="text-sm font-bold text-slate-900">{suggestion.title}</h4>
        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{suggestion.description}</p>

        {/* Financial Numbers Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 mt-4 text-xs font-mono">
          <div>
            <span className="text-[11px] text-slate-500 font-sans block">Monthly Saving</span>
            <span className="text-sm font-bold text-emerald-700" data-tabular>
              {formatINR(suggestion.monthlySaving)}
            </span>
            <span className="text-[10px] text-slate-400 block font-sans">per month</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-sans block">Annual Potential</span>
            <span className="text-sm font-bold text-slate-900" data-tabular>
              {formatINR(suggestion.yearlySaving)}
            </span>
            <span className="text-[10px] text-slate-400 block font-sans">per year</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-2 italic">
          Potential saving if spending is reduced by {suggestion.reductionPercentage}%.
        </p>
      </div>

      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Current spend:{' '}
          <strong className="text-slate-800 font-mono">
            {formatINR(suggestion.currentSpend)}
          </strong>
        </span>
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>See what this could become</span>
        </button>
      </div>
    </div>
  );
};
