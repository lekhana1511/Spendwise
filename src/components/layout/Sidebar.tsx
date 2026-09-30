import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Lightbulb,
  Sparkles,
  TrendingUp,
  User,
  LogOut,
  Building2,
  Plus,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatINR } from '../../utils/currency';

interface SidebarProps {
  onAddExpenseClick: () => void;
  onLogoutClick: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onAddExpenseClick,
  onLogoutClick,
  isMobileOpen,
  onCloseMobile
}) => {
  const { state, openModal } = useApp();
  const bank = state.bank || { isConnected: false, bankName: null, currentBalance: 0 };

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'Understand',
      items: [
        { label: 'Expenses', path: '/expenses', icon: Receipt },
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Smart Insights', path: '/insights', icon: Lightbulb }
      ]
    },
    {
      group: 'Plan',
      items: [
        { label: 'Financial Assistant', path: '/assistant', icon: Sparkles },
        { label: 'Wealth Projection', path: '/projection', icon: TrendingUp }
      ]
    },
    {
      group: 'Account',
      items: [
        { label: 'Profile & Settings', path: '/profile', icon: User }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shadow-blue-500/20">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900">Spendwise</span>
                <span className="text-[9px] font-bold tracking-wider uppercase text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded">
                  PRO
                </span>
              </div>
              <span className="block text-[11px] text-slate-500 font-medium -mt-0.5">Financial Intelligence</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="px-3.5 pt-3.5 pb-1">
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onAddExpenseClick();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs shadow-blue-600/20 transition-all hover:shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Grouped Navigation Links */}
        <div className="flex-1 px-3 py-2 space-y-3 overflow-y-auto">
          {navGroups.map(grp => (
            <div key={grp.group} className="space-y-0.5">
              <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block pt-1.5 pb-0.5">
                {grp.group}
              </span>
              {grp.items.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap group ${
                        isActive
                          ? 'bg-blue-50/90 text-blue-700 font-semibold ring-1 ring-blue-500/10'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-blue-600" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Demo Mode Trust Badge */}
        <div className="px-3.5 py-1.5">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center gap-2 text-[10px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-medium text-slate-600 truncate">
              Demo Mode · Simulated Bank Data
            </span>
          </div>
        </div>

        {/* Bank Connection Mini Card */}
        <div className="p-3 mx-3 mb-2 bg-slate-50/90 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{bank.isConnected ? (bank.bankName || 'Demo Bank') : 'No Bank'}</span>
            </div>
            {bank.isConnected ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            ) : (
              <span className="inline-flex items-center text-[9px] font-medium text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded shrink-0">
                Offline
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[11px] text-slate-500">Available</span>
            <span className="text-xs font-bold text-slate-900 font-mono" data-tabular>
              {bank.isConnected ? formatINR(bank.currentBalance) : '₹0'}
            </span>
          </div>

          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              openModal('bank_connect');
            }}
            className="w-full mt-2 py-1 px-2 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50/50 rounded-lg border border-blue-200/60 transition-colors text-center block shadow-2xs"
          >
            {bank.isConnected ? 'Manage Connection' : 'Connect Demo Bank'}
          </button>
        </div>

        {/* User Footer / Logout */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={state.auth.user?.avatarUrl || "/src/assets/images/avatar_aarav_mehta_1790748868096.jpg"}
              alt="User profile"
              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                {state.auth.user?.name || 'Aarav Mehta'}
              </p>
              <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                {state.auth.user?.email || 'aarav.mehta@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogoutClick}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
