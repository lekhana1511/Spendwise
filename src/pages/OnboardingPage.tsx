import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { CATEGORIES } from '../data/categories';
import { AVAILABLE_DEMO_BANKS } from '../data/mockBankAccount';
import { simulateBankConnection } from '../services/bankService';
import { formatINR } from '../utils/currency';
import { Check, ChevronRight, ChevronLeft, Building2, Target, Wallet, Sparkles } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch, connectBank, showToast } = useApp();

  const [step, setStep] = useState(1);
  const [monthlyIncome, setMonthlyIncome] = useState(state.preferences?.monthlyIncome || 85000);
  const [monthlyBudget, setMonthlyBudget] = useState(state.preferences?.monthlyBudget || 50000);
  const [financialGoal, setFinancialGoal] = useState(state.preferences?.financialGoal || 'Save more');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    state.preferences?.preferredCategories || ['Food', 'Shopping', 'Transport', 'Bills']
  );
  const [selectedBankCode, setSelectedBankCode] = useState<string | null>('HDFC');
  const [connectingBank, setConnectingBank] = useState(false);

  const goalOptions = [
    { id: 'Save more', label: 'Save more', desc: 'Build recurring wealth by reducing unneeded impulse buys' },
    { id: 'Control spending', label: 'Control spending', desc: 'Keep strict tabs on monthly limits & delivery surge' },
    { id: 'Track expenses', label: 'Track expenses', desc: 'Gain transparent visibility into where every rupee goes' },
    { id: 'Build emergency savings', label: 'Build emergency savings', desc: 'Amass 6 months of living cushion in high-yield reserves' }
  ];

  const handleToggleCategory = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(prev => prev.filter(c => c !== catName));
      }
    } else {
      setSelectedCategories(prev => [...prev, catName]);
    }
  };

  const handleFinishOnboarding = async (connectDemoBank = false) => {
    if (connectDemoBank && selectedBankCode) {
      setConnectingBank(true);
      const bank = await simulateBankConnection(selectedBankCode);
      connectBank(bank);
      setConnectingBank(false);
    }

    dispatch({
      type: 'COMPLETE_ONBOARDING',
      payload: {
        monthlyIncome,
        monthlyBudget,
        financialGoal,
        preferredCategories: selectedCategories
      }
    });

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s ? 'w-8 bg-blue-600' : step > s ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-200'
              }`}
            />
          ))}
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
          {/* STEP 1: INCOME & BUDGET */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Monthly Income & Budget</h3>
                  <p className="text-xs text-slate-500">Establish your baseline cash inflow and spending ceiling</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Take-Home Income (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-slate-400 font-medium">₹</span>
                    <input
                      type="number"
                      step="1000"
                      value={monthlyIncome}
                      onChange={e => setMonthlyIncome(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 font-mono"
                      data-tabular
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Default: {formatINR(85000)}/month (Salary or primary income)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Monthly Spending Budget (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-slate-400 font-medium">₹</span>
                    <input
                      type="number"
                      step="1000"
                      value={monthlyBudget}
                      onChange={e => setMonthlyBudget(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 font-mono"
                      data-tabular
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Spendwise will warn you when your spending pace approaches {formatINR(monthlyBudget)}.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleFinishOnboarding(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  Skip Onboarding
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: FINANCIAL GOALS & CATEGORIES */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Financial Focus & Categories</h3>
                  <p className="text-xs text-slate-500">Pick your priority objective and frequent spending categories</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700">Primary Financial Goal</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {goalOptions.map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFinancialGoal(g.id)}
                      className={`p-3 text-left rounded-xl border transition-all ${
                        financialGoal === g.id
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold block">{g.label}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Preferred Spending Categories ({selectedCategories.length} selected)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => {
                    const active = selectedCategories.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleToggleCategory(c.name)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {active && <Check className="w-3 h-3" />}
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DEMO BANK LINK */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Connect a Demo Bank Account</h3>
                  <p className="text-xs text-slate-500">Optional: Link mock account to view realistic statement transactions</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Connecting a demo bank preloads realistic Indian merchant expenses (Swiggy, Amazon, Uber, BESCOM, etc.) for instant analysis.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-slate-700">Select Bank:</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {AVAILABLE_DEMO_BANKS.map(b => (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => setSelectedBankCode(b.code)}
                      className={`p-3 text-left rounded-xl border transition-all flex items-center gap-2.5 ${
                        selectedBankCode === b.code
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded text-white font-bold flex items-center justify-center text-[10px] shrink-0"
                        style={{ backgroundColor: b.logoColor }}
                      >
                        {b.code}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-900 block truncate">{b.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">{b.defaultMask}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleFinishOnboarding(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                  >
                    Skip Bank Link
                  </button>
                  <button
                    type="button"
                    disabled={connectingBank}
                    onClick={() => handleFinishOnboarding(true)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                  >
                    <span>{connectingBank ? 'Connecting...' : 'Finish & Open Dashboard'}</span>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
