import React from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../store/AppContext';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { AlertTriangle, CheckCircle2, Edit2, ShieldAlert } from 'lucide-react';

export const AnomalyWhyModal: React.FC = () => {
  const { state, closeWhyAnomaly, markAnomalyPlanned, selectExpense } = useApp();
  const anomaly = state.ui.activeWhyAnomaly;

  if (!anomaly) return null;

  const baseline = anomaly.categoryBaseline || 1850;
  const multiplier = anomaly.anomalyMultiplier || (anomaly.amount / baseline).toFixed(1);
  const variance = Math.max(0, anomaly.amount - baseline);

  const handleMarkPlanned = () => {
    markAnomalyPlanned(anomaly.id);
  };

  const handleReviewCategory = () => {
    closeWhyAnomaly();
    selectExpense(anomaly);
  };

  return (
    <Modal
      isOpen={Boolean(anomaly)}
      onClose={closeWhyAnomaly}
      title="Anomaly Detection Breakdown"
      subtitle="Explainable mathematical basis for flagging this transaction as unusual."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Banner */}
        <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-amber-900 block">
              {anomaly.merchant} · {formatINR(anomaly.amount)}
            </span>
            <span className="text-amber-800 leading-relaxed block mt-0.5">
              Detected as <strong>{multiplier}× higher</strong> than your standard {anomaly.category} baseline.
            </span>
          </div>
        </div>

        {/* Calculation Table */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5 text-xs font-mono">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-sans">Category Baseline Average:</span>
            <span className="font-bold text-slate-800" data-tabular>{formatINR(baseline)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-sans">This Specific Transaction:</span>
            <span className="font-bold text-slate-900" data-tabular>{formatINR(anomaly.amount)}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-amber-800">
            <span className="font-sans font-semibold">Positive Variance (Delta):</span>
            <span className="font-bold" data-tabular>+{formatINR(variance)} ({multiplier}×)</span>
          </div>
        </div>

        {/* Natural Language Explanation */}
        <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/70 space-y-1">
          <span className="font-semibold text-slate-800 block">Why it was flagged:</span>
          <p className="leading-relaxed">
            Spendwise monitors your historical spending velocity per category. When a single payment exceeds 2× the category baseline and represents a significant absolute amount, it is flagged for review to prevent unnoticed budget drain.
          </p>
          <div className="text-[11px] text-slate-400 pt-1 font-mono">
            Date: {formatDate(anomaly.date)} · Payment: {anomaly.paymentMethod}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleReviewCategory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Review Category</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleMarkPlanned}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark as Planned</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
