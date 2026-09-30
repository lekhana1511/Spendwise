import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { HeroFinancialSummary } from '../components/dashboard/HeroFinancialSummary';
import { SmartInsightBanner } from '../components/dashboard/SmartInsightBanner';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { CategoryBreakdownChart } from '../components/charts/CategoryBreakdownChart';
import { MonthlyTrendChart } from '../components/charts/MonthlyTrendChart';
import { EmptyState } from '../components/common/EmptyState';
import { GoalSavingsCard } from '../components/dashboard/GoalSavingsCard';
import { RecurringExpensesBanner } from '../components/dashboard/RecurringExpensesBanner';
import { DecisionSimulatorCard } from '../components/dashboard/DecisionSimulatorCard';
import { simulateBankSync } from '../services/bankService';
import { apiService } from '../services/apiService';
import {
  Plus,
  RefreshCw,
  Receipt
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, analytics, insights, savingsSuggestions, dispatch, openModal, showToast } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);

  const user = state.auth?.user;
  const bank = state.bank || { isConnected: false, bankName: null, currentBalance: 0 };

  const handleSyncBank = async () => {
    if (!bank.isConnected) {
      openModal('bank_connect');
      return;
    }
    try {
      setIsSyncing(true);
      const res = await simulateBankSync(state.expenses, bank.currentBalance);
      dispatch({
        type: 'UPDATE_BANK_SYNC',
        payload: {
          updatedTransactions: res.updatedTransactions,
          newBalance: res.newBalance,
          lastSynced: new Date().toISOString()
        }
      });
      showToast({
        type: 'success',
        title: 'Bank Statement Synced',
        message: `${res.addedTransactionsCount} transactions fetched and categorized.`
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Sync Failed',
        message: 'Could not connect to mock bank gateway.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const hasExpenses = state.expenses.length > 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Top Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Good morning, {user?.name?.split(' ')[0] || 'Aarav'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            September 2026 Financial Intelligence Overview · Powered by rule-based analysis
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSyncBank}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Bank'}</span>
          </button>

          <button
            onClick={() => openModal('add_expense')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-600/20 transition-all hover:shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Hero Financial Summary & Key Metrics */}
      <HeroFinancialSummary />

      {/* Main Content Area */}
      {!hasExpenses ? (
        <EmptyState
          icon={Receipt}
          title="Your spending overview will appear here."
          description="Add your first cash expense or connect a demo bank account to instantly view automated category classifications and intelligence."
          action={{
            label: "Add First Expense",
            onClick: () => openModal('add_expense')
          }}
        />
      ) : (
        <>
          {/* 2 Primary Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Category Breakdown */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Category Breakdown</h3>
                    <p className="text-xs text-slate-500">September 2026 expense distribution</p>
                  </div>
                  <button
                    onClick={() => navigate('/analytics')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </button>
                </div>
                <CategoryBreakdownChart
                  data={analytics.categoryBreakdown}
                  totalSpending={analytics.totalSpending}
                />
              </div>
            </div>

            {/* Chart 2: Monthly Trend */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Monthly Spending Trend</h3>
                    <p className="text-xs text-slate-500">Historical comparison across billing cycles</p>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    {analytics.monthlyTrends.length} cycles tracked
                  </span>
                </div>
                <MonthlyTrendChart data={analytics.monthlyTrends} />
              </div>
            </div>
          </div>

          {/* Compact Insights & Outlier Banner */}
          <SmartInsightBanner
            topInsight={insights[0]}
            topSuggestion={savingsSuggestions[0]}
          />

          {/* Goal-Based Savings Planner & Recurring Subscriptions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GoalSavingsCard />
            <div className="flex flex-col justify-center">
              <RecurringExpensesBanner />
            </div>
          </div>

          {/* Decision Simulator Card */}
          <DecisionSimulatorCard />

          {/* Recent Transactions List */}
          <RecentTransactions transactions={state.expenses} />
        </>
      )}
    </div>
  );
};
