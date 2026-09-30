import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { formatINR } from '../utils/currency';
import { CATEGORIES } from '../data/categories';
import {
  User,
  Building2,
  Settings,
  RotateCcw,
  LogOut,
  ShieldCheck,
  Check,
  CheckCircle2,
  Unlink
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { state, dispatch, disconnectBank, openModal, resetDemoData, showToast } = useApp();
  const user = state.auth?.user;
  const bank = state.bank || { isConnected: false, bankName: null, currentBalance: 0 };
  const prefs = state.preferences || {
    currency: "INR",
    monthlyIncome: 85000,
    monthlyBudget: 50000,
    financialGoal: "Save more",
    preferredCategories: ["Food", "Shopping", "Transport", "Bills"]
  };

  const [name, setName] = useState(user?.name || 'Aarav Mehta');
  const [email, setEmail] = useState(user?.email || 'aarav.mehta@example.com');
  const [monthlyIncome, setMonthlyIncome] = useState(prefs.monthlyIncome || 85000);
  const [monthlyBudget, setMonthlyBudget] = useState(prefs.monthlyBudget || 50000);
  const [financialGoal, setFinancialGoal] = useState(prefs.financialGoal || 'Save more');
  const [preferredCats, setPreferredCats] = useState<string[]>(prefs.preferredCategories || ['Food', 'Shopping', 'Transport', 'Bills']);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: {
        monthlyIncome,
        monthlyBudget,
        financialGoal,
        preferredCategories: preferredCats
      }
    });
  };

  const handleToggleCat = (cat: string) => {
    if (preferredCats.includes(cat)) {
      if (preferredCats.length > 1) {
        setPreferredCats(prev => prev.filter(c => c !== cat));
      }
    } else {
      setPreferredCats(prev => [...prev, cat]);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Profile & Preferences
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your financial targets, linked demo accounts, and simulation parameters.
        </p>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal Details Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Personal & Financial Identity</h3>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={user?.avatarUrl || "/src/assets/images/avatar_aarav_mehta_1790748868096.jpg"}
              alt="Avatar"
              className="w-14 h-14 rounded-full object-cover border-2 border-slate-200"
            />
            <div>
              <p className="text-sm font-bold text-slate-900">{user?.name || 'Aarav Mehta'}</p>
              <p className="text-xs text-slate-500">{user?.role || 'Senior Product Designer'}</p>
              <span className="text-[11px] text-blue-600 font-mono mt-0.5 block">
                Currency: INR (₹)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Financial Parameters */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Settings className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Income & Budget Targets</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Inflow / Income (₹)
              </label>
              <input
                type="number"
                step="1000"
                value={monthlyIncome}
                onChange={e => setMonthlyIncome(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 font-mono"
                data-tabular
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Spending Ceiling (₹)
              </label>
              <input
                type="number"
                step="1000"
                value={monthlyBudget}
                onChange={e => setMonthlyBudget(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 font-mono"
                data-tabular
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Main Financial Goal
            </label>
            <select
              value={financialGoal}
              onChange={e => setFinancialGoal(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900"
            >
              <option value="Save more">Save more</option>
              <option value="Control spending">Control spending</option>
              <option value="Track expenses">Track expenses</option>
              <option value="Build emergency savings">Build emergency savings</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Monitored Focus Categories:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => {
                const isSelected = preferredCats.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleToggleCat(c.name)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </form>

      {/* Linked Bank Account Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Simulated Bank Connection</h3>
          </div>
          {bank.isConnected ? (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Sync
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Disconnected
            </span>
          )}
        </div>

        {bank.isConnected ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div>
              <p className="text-sm font-bold text-slate-900">{bank.bankName}</p>
              <p className="text-xs text-slate-500">{bank.accountType}</p>
              <p className="text-xs text-slate-600 font-mono mt-1" data-tabular>
                Account: {bank.maskedAccountNumber}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Balance: {formatINR(bank.currentBalance)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openModal('bank_connect')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Change Bank
              </button>
              <button
                type="button"
                onClick={disconnectBank}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 inline-flex items-center gap-1"
              >
                <Unlink className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <span className="text-xs text-slate-600">No bank is currently linked to your session.</span>
            <button
              type="button"
              onClick={() => openModal('bank_connect')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Connect Demo Bank
            </button>
          </div>
        )}
      </div>

      {/* Account Actions / Reset Demo Data */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
          Sandbox & Demo Controls
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Reset Demo Data</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Restores the original 23+ Indian transactions, HDFC bank link, and ₹48,650 mock balance.
            </p>
          </div>
          <button
            type="button"
            onClick={resetDemoData}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
