import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { CategoryBreakdownChart } from '../components/charts/CategoryBreakdownChart';
import { MonthlyTrendChart } from '../components/charts/MonthlyTrendChart';
import { getCategoryMeta } from '../data/categories';
import { formatINR } from '../utils/currency';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { analytics, state } = useApp();

  const [periodFilter, setPeriodFilter] = useState<'this_month' | 'last_month' | 'all'>('this_month');

  const income = state.preferences.monthlyIncome;
  const spending = analytics.totalSpending;
  const savings = Math.max(0, income - spending);
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Title & Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Spending Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deep breakdown into categorical trends, velocity, and period-over-period differences.
          </p>
        </div>

        {/* Segmented Period Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setPeriodFilter('this_month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              periodFilter === 'this_month'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            September 2026
          </button>
          <button
            onClick={() => setPeriodFilter('last_month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              periodFilter === 'last_month'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            August 2026
          </button>
          <button
            onClick={() => setPeriodFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              periodFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Cycles
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Spending
          </span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-1 block" data-tabular>
            {formatINR(spending)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
            {periodFilter === 'this_month' ? 'Sep 1 - Sep 30' : 'Recorded period'}
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Average Expense
          </span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-1 block" data-tabular>
            {formatINR(analytics.averageTransaction)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
            across {analytics.totalTransactions} transactions
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Top Category
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-900 mt-1 block truncate">
            {analytics.highestCategory?.name || 'None'}
          </span>
          <span className="text-[10px] text-blue-600 font-mono mt-1 block">
            {formatINR(analytics.highestCategory?.amount || 0)} ({analytics.highestCategory?.percentage || 0}%)
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            MoM Delta
          </span>
          <div className="flex items-center gap-1 mt-1">
            {analytics.spendingChangePct >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-amber-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            )}
            <span
              className={`text-xl font-bold font-mono ${
                analytics.spendingChangePct >= 0 ? 'text-amber-700' : 'text-emerald-700'
              }`}
              data-tabular
            >
              {analytics.spendingChangePct >= 0 ? '+' : ''}
              {analytics.spendingChangePct}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
            vs {formatINR(analytics.previousMonthSpending)} last month
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Savings Rate
          </span>
          <span className="text-xl font-bold text-emerald-700 font-mono mt-1 block" data-tabular>
            {savingsRate}%
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
            {formatINR(savings)} retained
          </span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Donut */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Spending by Category</h3>
              <p className="text-xs text-slate-500">Distribution across active budget segments</p>
            </div>
          </div>
          <CategoryBreakdownChart
            data={analytics.categoryBreakdown}
            totalSpending={analytics.totalSpending}
          />
        </div>

        {/* Monthly Trend Bar Chart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Billing Cycle Trends</h3>
              <p className="text-xs text-slate-500">Month-over-month aggregate volume</p>
            </div>
          </div>
          <MonthlyTrendChart data={analytics.monthlyTrends} />
        </div>
      </div>

      {/* Category Performance Comparative Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Category Comparison & Shift</h3>
            <p className="text-xs text-slate-500">
              Detailed tracking of expenditure and variation against the previous period
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {analytics.categoryBreakdown.length} active categories
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Current Spend</th>
                <th className="py-3 px-4 text-right">Share</th>
                <th className="py-3 px-4 text-right">Previous Period</th>
                <th className="py-3 px-4 text-right">Net Change</th>
                <th className="py-3 px-4">Spending Pace Visualizer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.categoryBreakdown.map(item => {
                const meta = getCategoryMeta(item.category);
                const isIncrease = item.changePercentage > 0;

                return (
                  <tr key={item.category} className="hover:bg-slate-50/70 transition-colors">
                    {/* Category Label */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span>{item.category}</span>
                        <span className="text-[11px] text-slate-400 font-normal">({item.count} txns)</span>
                      </div>
                    </td>

                    {/* Current Amount */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono whitespace-nowrap" data-tabular>
                      {formatINR(item.amount)}
                    </td>

                    {/* Percentage Share */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600 whitespace-nowrap" data-tabular>
                      {item.percentage}%
                    </td>

                    {/* Previous Period */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-400 whitespace-nowrap" data-tabular>
                      {item.previousAmount > 0 ? formatINR(item.previousAmount) : '—'}
                    </td>

                    {/* Net Change */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {item.previousAmount > 0 ? (
                        <span
                          className={`font-mono font-semibold ${
                            isIncrease ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                          data-tabular
                        >
                          {isIncrease ? '+' : ''}
                          {item.changePercentage}%
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">New</span>
                      )}
                    </td>

                    {/* Visual Progress Bar */}
                    <td className="py-3.5 px-4 w-48">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          style={{
                            width: `${Math.min(100, item.percentage * 2.5)}%`,
                            backgroundColor: meta.color
                          }}
                          className="h-full rounded-full transition-all duration-300"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
