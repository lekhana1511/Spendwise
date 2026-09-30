import React from 'react';
import { useApp } from '../../store/AppContext';
import { formatINR } from '../../utils/currency';
import { Building2, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const HeroFinancialSummary: React.FC = () => {
  const { state, analytics, openModal } = useApp();
  const bank = state.bank || { isConnected: false, bankName: null, currentBalance: 0 };
  const income = state.preferences?.monthlyIncome || 85000;
  const spending = analytics?.totalSpending || 0;
  const remaining = Math.max(0, income - spending);
  const budget = state.preferences?.monthlyBudget || 50000;
  const utilization = budget > 0 ? Math.min(100, Math.round((spending / budget) * 100)) : 0;

  const isHealthy = utilization < 85;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-white to-slate-50/70 border border-slate-200/90 shadow-xs p-6 sm:p-7">
      {/* Subtle background ambient mesh */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar within Hero */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Financial Status · Sep 2026
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              isHealthy
                ? 'text-emerald-700 bg-emerald-50/90 border-emerald-200/80'
                : 'text-amber-700 bg-amber-50/90 border-amber-200/80'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>{isHealthy ? 'On Track (Healthy Pace)' : 'Budget Caution'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Demo Mode · Simulated Bank Data</span>
          </span>
        </div>
      </div>

      {/* Hero Financial Metrics Strip */}
      <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-5">
        {/* Metric 1: Current Balance */}
        <div
          onClick={() => openModal('bank_connect')}
          className="group cursor-pointer p-4 rounded-2xl bg-white border border-slate-200/70 hover:border-blue-300 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Balance
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight" data-tabular>
            {bank.isConnected ? formatINR(bank.currentBalance) : '₹0'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold font-mono">
              {bank.isConnected ? bank.bankName : 'Unlinked'}
            </span>
            <span>· Available liquidity</span>
          </p>
        </div>

        {/* Metric 2: Monthly Income */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/70 hover:border-slate-300 hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly Inflow
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight" data-tabular>
            {formatINR(income)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Primary take-home salary
          </p>
        </div>

        {/* Metric 3: Total Spending */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/70 hover:border-amber-300 hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Spending
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight" data-tabular>
            {formatINR(spending)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span
              className={`font-mono font-semibold ${
                analytics.spendingChangePct >= 0 ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {analytics.spendingChangePct >= 0 ? '+' : ''}
              {analytics.spendingChangePct}%
            </span>
            <span>vs previous month</span>
          </p>
        </div>

        {/* Metric 4: Remaining Net Amount */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/70 hover:border-emerald-300 hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Remaining Amount
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono tracking-tight" data-tabular>
            {formatINR(remaining)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Cash surplus after expenses
          </p>
        </div>
      </div>

      {/* Budget Utilization Progress Bar */}
      <div className="relative mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <span className="text-slate-500 font-medium shrink-0">Budget Used:</span>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              style={{ width: `${utilization}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                utilization > 85 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
            />
          </div>
          <span className="font-mono font-bold text-slate-800 shrink-0" data-tabular>
            {utilization}%
          </span>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Budget allowance: <strong className="text-slate-800">{formatINR(state.preferences?.monthlyBudget || 50000)}</strong>
        </div>
      </div>
    </div>
  );
};
