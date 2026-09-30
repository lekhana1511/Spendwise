import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../../data/mockTransactions';
import { getCategoryMeta } from '../../data/categories';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { useApp } from '../../store/AppContext';
import { ArrowRight, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const navigate = useNavigate();
  const { selectExpense } = useApp();

  const recent = transactions.slice(0, 5);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
          <p className="text-xs text-slate-500">Live ledger of classified expenses & detected outliers</p>
        </div>
        <button
          onClick={() => navigate('/expenses')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>View all {transactions.length} expenses</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-slate-100/80">
        {recent.map(txn => {
          const catMeta = getCategoryMeta(txn.category);

          return (
            <div
              key={txn.id}
              onClick={() => selectExpense(txn)}
              className="py-3 px-2.5 -mx-2 rounded-xl hover:bg-slate-50/90 cursor-pointer transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: catMeta.bgColor,
                    color: catMeta.color
                  }}
                >
                  {txn.category.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {txn.merchant}
                    </p>
                    {txn.isAnomaly && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                        Unusual ({txn.anomalyMultiplier || 6.8}×)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-medium text-slate-700">{txn.category}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>{formatDate(txn.date)}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-slate-400">{txn.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right shrink-0">
                <div>
                  <span className="text-xs font-bold text-slate-900 font-mono block" data-tabular>
                    {formatINR(txn.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono inline-flex items-center gap-0.5 justify-end">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                    {Math.round(txn.confidence * 100)}%
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
