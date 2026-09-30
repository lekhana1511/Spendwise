import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { INITIAL_MOCK_USER } from '../data/mockUser';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Receipt,
  CheckCircle2,
  PieChart,
  Lightbulb,
  Building2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();

  const handleDemoLogin = () => {
    login(INITIAL_MOCK_USER);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header - Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-6 lg:px-12 py-4 flex items-center justify-between">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
            S
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Spendwise</span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#intelligence" className="hover:text-blue-600 transition-colors">Intelligence</a>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 py-16 lg:py-24 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/80 rounded-full text-xs font-medium text-blue-700 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Automated Personal Financial Intelligence</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight" style={{ textWrap: 'balance' }}>
          Understand where your money goes. Automatically.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed">
          Spendwise classifies your expenses, explains your spending patterns, and shows practical ways to make your money work harder.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleDemoLogin}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/90 rounded-xl shadow-2xs transition-all"
          >
            <span>Explore Live Demo</span>
            <span className="text-[11px] text-blue-600 font-mono">(Instant Aarav Mehta Profile)</span>
          </button>
        </div>

        {/* Hero Interactive Preview Card */}
        <div className="mt-14 p-4 sm:p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xl max-w-4xl mx-auto text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-800">Simulated Bank Statement Sync</span>
              <span className="text-slate-400">· HDFC Bank (XXXX 4521)</span>
            </div>
            <span className="font-mono text-emerald-700 font-semibold">₹48,650 Balance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">September Spend</span>
              <span className="text-lg font-bold text-slate-900 font-mono">₹38,248</span>
              <p className="text-[11px] text-emerald-700 mt-1">✓ Within ₹50,000 budget</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Top Category</span>
              <span className="text-lg font-bold text-slate-900 font-mono">Shopping (38%)</span>
              <p className="text-[11px] text-amber-700 mt-1">⚠ 1 large unusual transaction</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Savings Potential</span>
              <span className="text-lg font-bold text-emerald-700 font-mono">₹840/mo</span>
              <p className="text-[11px] text-slate-500 mt-1">From food delivery reduction</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white border-y border-slate-200/80 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Simplicity First</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">How Spendwise Works</h2>
            <p className="text-xs text-slate-500 mt-2">Zero complicated setups. Designed for immediate financial clarity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Connect or add expenses</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sync mock bank statements or log cash payments in seconds. No sensitive bank passwords required.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Review what Spendwise finds</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Explainable rules automatically classify merchants, calculate confidence ratings, and detect outlier spikes.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Make informed decisions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Act on personalized savings suggestions and project long-term wealth growth through interactive compounding calculators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Features</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Engineered for Calm, Transparent Finances
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Automatic Classification</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent, explainable merchant matching with confidence percentages and instant category override.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Spending Analysis</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clean visual breakdown by categories, month-over-month comparisons, and budget consumption tracking.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Smart Insights & Anomalies</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pinpoint repeated delivery charges, sudden spikes, and unusually high purchases before they erode savings.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Future-Value Projections</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect small daily cutbacks directly to 1-, 5-, and 10-year compound interest projections.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 lg:px-12 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Spendwise</span>
            <span>· Personal Financial Intelligence</span>
          </div>
          <p>© 2026 Spendwise Prototype. Demo sandbox application with simulated Indian financial data.</p>
        </div>
      </footer>
    </div>
  );
};
