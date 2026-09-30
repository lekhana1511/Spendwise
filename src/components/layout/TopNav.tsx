import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, RefreshCw, Plus, Building2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { simulateBankSync } from '../../services/bankService';
import { apiService } from '../../services/apiService';

interface TopNavProps {
  onToggleMobileMenu: () => void;
  onAddExpenseClick: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onToggleMobileMenu,
  onAddExpenseClick
}) => {
  const location = useLocation();
  const { state, dispatch, showToast, openModal } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);

  const getPageTitle = (pathname: string): { title: string; subtitle: string } => {
    switch (pathname) {
      case '/dashboard':
        return { title: 'Dashboard', subtitle: 'September 2026 Financial Overview' };
      case '/expenses':
        return { title: 'Expenses & Transactions', subtitle: 'History, classifications, and anomaly detection' };
      case '/analytics':
        return { title: 'Spending Analytics', subtitle: 'Category breakdowns and period comparisons' };
      case '/insights':
        return { title: 'Financial Intelligence', subtitle: 'Actionable smart insights and savings opportunities' };
      case '/assistant':
        return { title: 'Financial Assistant', subtitle: 'Guided natural-language spending query engine' };
      case '/projection':
        return { title: 'Future-Value Projections', subtitle: 'Compound interest simulation from recurring savings' };
      case '/profile':
        return { title: 'Profile & Settings', subtitle: 'Manage preferences, demo states, and bank link' };
      default:
        return { title: 'Spendwise', subtitle: 'Financial Intelligence' };
    }
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  const handleQuickSync = async () => {
    if (!state.bank.isConnected) {
      openModal('bank_connect');
      return;
    }

    try {
      setIsSyncing(true);
      const res = await simulateBankSync(state.expenses, state.bank.currentBalance);
      dispatch({
        type: 'UPDATE_BANK_SYNC',
        payload: {
          updatedTransactions: res.updatedTransactions,
          newBalance: res.newBalance,
          lastSynced: new Date().toISOString()
        }
      });
      apiService.bulkCreateExpenses(res.updatedTransactions);
      apiService.updateBank({
        ...state.bank,
        currentBalance: res.newBalance,
        availableBalance: res.newBalance,
        lastSynced: new Date().toISOString()
      });
      showToast({
        type: 'success',
        title: 'Sync Complete',
        message: `${res.addedTransactionsCount} new transactions synced (${res.automaticallyClassified} auto-classified, ${res.needsReviewCount} review)`
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Sync Failed',
        message: 'Could not communicate with demo bank server.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Zone 1: Mobile Hamburger & Page Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      {/* Zone 2 & 3: Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Subtle Trust Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-500 bg-slate-100/70 rounded-lg border border-slate-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Demo Mode · Simulated Bank Data</span>
        </div>

        {/* Sync Bank Button */}
        <button
          onClick={handleQuickSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-all shadow-2xs whitespace-nowrap disabled:opacity-60"
          title="Synchronize simulated bank transactions"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden sm:inline">
            {isSyncing ? 'Syncing...' : 'Sync Bank'}
          </span>
        </button>

        {/* Bank Status Badge */}
        {state.bank.isConnected ? (
          <div
            onClick={() => openModal('bank_connect')}
            className="cursor-pointer hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-800 bg-emerald-50/90 border border-emerald-200/70 rounded-xl hover:bg-emerald-100/70 transition-colors shadow-2xs"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-semibold">{state.bank.bankName || 'HDFC Bank'}</span>
          </div>
        ) : (
          <button
            onClick={() => openModal('bank_connect')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
          >
            <Building2 className="w-3 h-3 text-slate-500" />
            <span>Connect Bank</span>
          </button>
        )}

        {/* Primary Action */}
        <button
          onClick={onAddExpenseClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs shadow-blue-600/20 transition-all hover:shadow-sm whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Expense</span>
        </button>
      </div>
    </header>
  );
};
