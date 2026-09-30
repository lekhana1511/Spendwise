import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { CATEGORY_NAMES, getCategoryMeta } from '../../data/categories';
import { X, Trash2, Edit2, AlertTriangle, Check, ShieldCheck, Clock, CreditCard } from 'lucide-react';

export const ExpenseDetailDrawer: React.FC = () => {
  const { state, selectExpense, updateExpense, deleteExpense, markAnomalyPlanned } = useApp();
  const expense = state.ui.selectedExpense;

  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [selectedCat, setSelectedCat] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!expense) return null;

  const catMeta = getCategoryMeta(expense.category);

  const handleSaveCategory = () => {
    if (!selectedCat || selectedCat === expense.category) {
      setIsEditingCategory(false);
      return;
    }
    updateExpense({
      ...expense,
      category: selectedCat,
      confidence: 1.0,
      classificationReason: `Manually re-categorized to ${selectedCat}`
    });
    setIsEditingCategory(false);
  };

  const handleDelete = () => {
    deleteExpense(expense.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => selectExpense(null)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Transaction Detail
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{expense.merchant}</h3>
            </div>
            <button
              onClick={() => selectExpense(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Amount Banner */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-baseline justify-between">
              <span className="text-xs font-medium text-slate-500">Transaction Amount</span>
              <span className="text-2xl font-bold text-slate-900 font-mono" data-tabular>
                {formatINR(expense.amount)}
              </span>
            </div>

            {/* Anomaly Notice if applicable */}
            {expense.isAnomaly && (
              <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Unusual Expense Detected</span>
                  </div>
                  {expense.anomalyMultiplier && (
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-mono">
                      {expense.anomalyMultiplier}× Baseline
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {expense.anomalyReason ||
                    'This transaction is notably higher than your standard category spending.'}
                </p>
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-amber-700 font-mono">
                    Baseline: {formatINR(expense.categoryBaseline || 1850)}
                  </span>
                  <button
                    type="button"
                    onClick={() => markAnomalyPlanned(expense.id)}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Mark as Planned</span>
                  </button>
                </div>
              </div>
            )}

            {/* Category Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Category</label>
                {!isEditingCategory && (
                  <button
                    onClick={() => {
                      setSelectedCat(expense.category);
                      setIsEditingCategory(true);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {isEditingCategory ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                    {CATEGORY_NAMES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCat(cat)}
                        className={`px-2.5 py-1.5 text-xs text-left rounded border transition-colors flex items-center gap-1.5 ${
                          selectedCat === cat
                            ? 'bg-blue-600 text-white border-blue-600 font-medium'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: getCategoryMeta(cat).color }}
                        />
                        <span className="truncate">{cat}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsEditingCategory(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCategory}
                      className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: catMeta.color }}
                    />
                    <span className="text-sm font-semibold text-slate-900">{expense.category}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{Math.round(expense.confidence * 100)}% match</span>
                  </div>
                </div>
              )}
            </div>

            {/* Classification Explainability */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-slate-700 block">Classification Reasoning:</span>
              <p className="text-slate-600 leading-relaxed">{expense.classificationReason}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-4">
              <div>
                <span className="text-slate-500 block">Date</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{formatDate(expense.date)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Payment Method</span>
                <div className="flex items-center gap-1 font-medium text-slate-800 mt-0.5">
                  <CreditCard className="w-3 h-3 text-slate-400" />
                  <span>{expense.paymentMethod}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Source</span>
                <span className="font-medium text-slate-800 mt-0.5 block capitalize">
                  {expense.source === 'bank' ? 'Bank Statement' : 'Manual Cash Entry'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Verification Status</span>
                <span className="font-medium text-slate-800 mt-0.5 block capitalize">
                  {expense.status === 'confirmed' ? 'Verified' : 'Pending Review'}
                </span>
              </div>
            </div>

            {/* Notes */}
            {expense.notes && (
              <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="font-semibold text-slate-700 block mb-0.5">User Notes:</span>
                <p className="text-slate-600 italic">"{expense.notes}"</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 pt-4">
              <Clock className="w-3.5 h-3.5" />
              <span>Created {formatDate(expense.createdAt || expense.date)}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            {showDeleteConfirm ? (
              <div className="w-full flex items-center justify-between bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                <span className="text-xs text-rose-800 font-medium">Confirm deletion?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 text-xs font-semibold text-white bg-rose-600 rounded hover:bg-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Expense</span>
                </button>
                <button
                  onClick={() => selectExpense(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
