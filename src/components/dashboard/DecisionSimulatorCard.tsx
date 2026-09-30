import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { formatINR } from '../../utils/currency';
import { calculateFutureValue } from '../../services/projectionService';
import { Sliders, Sparkles, TrendingUp, Check } from 'lucide-react';

export const DecisionSimulatorCard: React.FC = () => {
  const navigate = useNavigate();
  const { analytics, setProjectionPrefill, updateSavingsGoal, state, showToast } = useApp();

  const [categoryType, setCategoryType] = useState<'food' | 'shopping' | 'transport'>('food');
  const [reductionPct, setReductionPct] = useState(20);

  // Derive current spending for chosen category
  const getCurrentSpend = () => {
    if (categoryType === 'food') return analytics.foodDeliverySpend.total || 4200;
    if (categoryType === 'shopping') {
      const shop = analytics.categoryBreakdown.find(c => c.category === 'Shopping');
      return shop ? shop.amount : 6500;
    }
    const trans = analytics.categoryBreakdown.find(c => c.category === 'Transport');
    return trans ? trans.amount : 2100;
  };

  const getCategoryLabel = () => {
    if (categoryType === 'food') return 'Food Delivery (Swiggy/Zomato)';
    if (categoryType === 'shopping') return 'Digital Shopping Checkouts';
    return 'Ride Hailing & Fuel';
  };

  const currentSpend = getCurrentSpend();
  const monthlySaving = Math.round(currentSpend * (reductionPct / 100));
  const annualSaving = monthlySaving * 12;
  const fiveYearValue = calculateFutureValue(monthlySaving, 10, 5);

  const handleSimulateInProjection = () => {
    setProjectionPrefill(monthlySaving);
    navigate('/projection');
  };

  const handleApplyToGoal = () => {
    const currentGoalAmount = state.savingsGoal?.currentAmount || 0;
    const goalName = state.savingsGoal?.name || 'Emergency Fund';
    updateSavingsGoal({
      currentAmount: currentGoalAmount + monthlySaving
    });
    showToast({
      type: 'success',
      title: 'Applied to Goal',
      message: `Allocated ${formatINR(monthlySaving)} monthly reduction to ${goalName}.`
    });
  };

  return (
    <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Spending Decision Simulator
            </h4>
            <p className="text-[11px] text-slate-500">
              Interactive "What if" model to see compound wealth impact
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
          +{formatINR(monthlySaving)}/mo
        </span>
      </div>

      {/* Control Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
        <button
          type="button"
          onClick={() => setCategoryType('food')}
          className={`flex-1 py-1.5 font-medium rounded-lg transition-colors text-center ${
            categoryType === 'food'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Food Delivery
        </button>
        <button
          type="button"
          onClick={() => setCategoryType('shopping')}
          className={`flex-1 py-1.5 font-medium rounded-lg transition-colors text-center ${
            categoryType === 'shopping'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Shopping
        </button>
        <button
          type="button"
          onClick={() => setCategoryType('transport')}
          className={`flex-1 py-1.5 font-medium rounded-lg transition-colors text-center ${
            categoryType === 'transport'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Commute
        </button>
      </div>

      {/* Slider */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-600">
            What if I reduce <strong>{getCategoryLabel()}</strong> by:
          </span>
          <span className="font-bold text-blue-600 font-mono" data-tabular>
            {reductionPct}%
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="50"
          step="5"
          value={reductionPct}
          onChange={e => setReductionPct(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
          <span>5% cut</span>
          <span>25% cut</span>
          <span>50% cut</span>
        </div>
      </div>

      {/* Outcome Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-500 font-sans block">Current Spend</span>
          <span className="font-bold text-slate-800" data-tabular>{formatINR(currentSpend)}/mo</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-sans block">Annual Saving</span>
          <span className="font-bold text-emerald-700" data-tabular>{formatINR(annualSaving)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-sans block">5-Yr Compound</span>
          <span className="font-bold text-blue-700" data-tabular>{formatINR(fiveYearValue)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 text-xs">
        <button
          type="button"
          onClick={handleApplyToGoal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
        >
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Apply to {state.savingsGoal?.name || 'Emergency Fund'}</span>
        </button>

        <button
          type="button"
          onClick={handleSimulateInProjection}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Simulate in Projection</span>
        </button>
      </div>
    </div>
  );
};
