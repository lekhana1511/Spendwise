import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { formatINR } from '../../utils/currency';
import { Modal } from '../common/Modal';
import { Target, TrendingUp, Edit3, Check } from 'lucide-react';

const DEFAULT_GOAL = {
  id: "goal-emergency-fund",
  name: "Emergency Fund",
  targetAmount: 150000,
  currentAmount: 35000,
  targetDate: "2027-03-31",
  monthlyContributionNeeded: 9583
};

export const GoalSavingsCard: React.FC = () => {
  const { state, updateSavingsGoal } = useApp();
  const goal = state.savingsGoal || DEFAULT_GOAL;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalName, setGoalName] = useState(goal?.name || 'Emergency Fund');
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount || 150000);
  const [currentAmount, setCurrentAmount] = useState(goal?.currentAmount || 35000);

  useEffect(() => {
    if (state.savingsGoal) {
      setGoalName(state.savingsGoal.name || 'Emergency Fund');
      setTargetAmount(state.savingsGoal.targetAmount || 150000);
      setCurrentAmount(state.savingsGoal.currentAmount || 35000);
    }
  }, [state.savingsGoal]);

  const effectiveTarget = Number(targetAmount) || 150000;
  const effectiveCurrent = Number(currentAmount) || 0;
  const pct = effectiveTarget > 0 ? Math.min(100, Math.round((effectiveCurrent / effectiveTarget) * 100)) : 0;
  const remaining = Math.max(0, effectiveTarget - effectiveCurrent);

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    updateSavingsGoal({
      name: goalName.trim() || 'Emergency Fund',
      targetAmount: Number(targetAmount) || 150000,
      currentAmount: Number(currentAmount) || 0
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Target className="w-4 h-4 text-blue-600" />
              <span>{goal?.name || 'Emergency Fund'}</span>
            </div>
            <button
              onClick={() => {
                setGoalName(goal?.name || 'Emergency Fund');
                setTargetAmount(goal?.targetAmount || 150000);
                setCurrentAmount(goal?.currentAmount || 35000);
                setIsModalOpen(true);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Adjust plan</span>
            </button>
          </div>

          <div className="flex items-baseline justify-between mt-1 mb-2">
            <span className="text-base font-bold text-slate-900 font-mono" data-tabular>
              {formatINR(goal?.currentAmount || 0)}{' '}
              <span className="text-xs text-slate-400 font-normal font-sans">
                / {formatINR(goal?.targetAmount || 150000)}
              </span>
            </span>
            <span className="text-xs font-bold text-blue-600 font-mono">
              {pct}% complete
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
            <div
              style={{ width: `${pct}%` }}
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-sans">
            Need <strong className="text-slate-900 font-mono" data-tabular>{formatINR(goal?.monthlyContributionNeeded || 9583)}/mo</strong>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {formatINR(remaining)} to target
          </span>
        </div>
      </div>

      {/* Adjust Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adjust Savings Goal"
        subtitle="Set target amount, current reserves, and required pace."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              required
              value={goalName}
              onChange={e => setGoalName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Saved (₹)
              </label>
              <input
                type="number"
                step="500"
                required
                value={currentAmount}
                onChange={e => setCurrentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                data-tabular
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Amount (₹)
              </label>
              <input
                type="number"
                step="5000"
                required
                value={targetAmount}
                onChange={e => setTargetAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                data-tabular
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-900 font-mono">
            <span>Remaining required: </span>
            <strong>{formatINR(Math.max(0, targetAmount - currentAmount))}</strong>
            <span className="block text-[11px] text-blue-700 font-sans mt-0.5">
              Requires ~{formatINR(Math.round(Math.max(0, targetAmount - currentAmount) / 12))}/month over 12 months.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Plan</span>
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
