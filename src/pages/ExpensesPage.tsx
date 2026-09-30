import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { filterTransactions } from '../services/expenseService';
import { getCategoryMeta, CATEGORY_NAMES } from '../data/categories';
import { formatINR } from '../utils/currency';
import { formatDate } from '../utils/dates';
import { EmptyState } from '../components/common/EmptyState';
import {
  Search,
  Filter,
  Plus,
  Upload,
  AlertTriangle,
  ShieldCheck,
  X,
  CreditCard,
  Building2,
  Wallet
} from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, openModal, selectExpense } = useApp();

  // URL query parameter presets
  const initialCategory = searchParams.get('category') || 'all';
  const initialAnomalies = searchParams.get('anomalies') === 'true';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [anomaliesOnly, setAnomaliesOnly] = useState(initialAnomalies);

  // Sync state if URL query params change
  React.useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const anom = searchParams.get('anomalies');
    if (anom === 'true') setAnomaliesOnly(true);
  }, [searchParams]);

  const filteredTransactions = useMemo(() => {
    return filterTransactions(state.expenses, {
      search,
      category: selectedCategory,
      source: selectedSource,
      paymentMethod: selectedMethod,
      month: selectedMonth,
      anomaliesOnly
    });
  }, [
    state.expenses,
    search,
    selectedCategory,
    selectedSource,
    selectedMethod,
    selectedMonth,
    anomaliesOnly
  ]);

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedSource !== 'all' ||
    selectedMethod !== 'all' ||
    selectedMonth !== 'all' ||
    anomaliesOnly;

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedSource('all');
    setSelectedMethod('all');
    setSelectedMonth('all');
    setAnomaliesOnly(false);
    setSearchParams({});
  };

  const totalFilteredSum = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Expense History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full ledger of automated classifications, manual receipts, and anomaly detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('csv_import')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs transition-colors whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => openModal('add_expense')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Data Quality Summary Strip */}
      <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-700 uppercase text-[10px] tracking-wider">
          Classification Pipeline Quality:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-slate-300 transition-colors font-mono"
          >
            <strong>{state.expenses.length}</strong> Total Analyzed
          </button>
          <button
            type="button"
            onClick={() => {
              handleClearFilters();
              setSelectedMethod('all');
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors font-mono"
          >
            <strong>{state.expenses.filter(t => t.confidence >= 0.85).length}</strong> High Confidence (≥85%)
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setSelectedSource('all');
              setSelectedMethod('all');
              setSelectedMonth('all');
              setAnomaliesOnly(false);
              // Filter to pending review
              setSelectedCategory('all');
              setSearch('POS'); // Filter to ambiguous terminal
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors font-mono"
          >
            <strong>{state.expenses.filter(t => t.status === 'pending_review' || t.confidence < 0.70).length}</strong> Need Review
          </button>
          <button
            type="button"
            onClick={() => setAnomaliesOnly(true)}
            className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 transition-colors font-mono"
          >
            <strong>{state.expenses.filter(t => t.isAnomaly).length}</strong> Outliers Detected
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by merchant, keyword, or description..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-44">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
            >
              <option value="all">All Categories</option>
              {CATEGORY_NAMES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Source Dropdown */}
          <div className="w-full md:w-36">
            <select
              value={selectedSource}
              onChange={e => setSelectedSource(e.target.value)}
              aria-label="Filter by source"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
            >
              <option value="all">All Sources</option>
              <option value="bank">Bank Sync</option>
              <option value="manual">Manual Entry</option>
            </select>
          </div>

          {/* Month Dropdown */}
          <div className="w-full md:w-36">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              aria-label="Filter by billing cycle month"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
            >
              <option value="all">All Months</option>
              <option value="2026-09">Sep 2026</option>
              <option value="2026-08">Aug 2026</option>
            </select>
          </div>

          {/* Anomalies Toggle */}
          <button
            type="button"
            onClick={() => setAnomaliesOnly(prev => !prev)}
            className={`w-full md:w-auto px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
              anomaliesOnly
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Unusual Only</span>
          </button>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <span>Showing <strong>{filteredTransactions.length}</strong> matching transactions:</span>
              <span className="font-mono text-slate-800 font-semibold" data-tabular>
                Total: {formatINR(totalFilteredSum)}
              </span>
            </div>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors font-medium"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Transactions Data Table */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No expenses match your filters."
          description="Try adjusting your search criteria, clearing selected filters, or adding a new expense."
          action={{
            label: "Reset Filters",
            onClick: handleClearFilters
          }}
        />
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Merchant / Description</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Status & Anomaly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map(txn => {
                  const catMeta = getCategoryMeta(txn.category);

                  return (
                    <tr
                      key={txn.id}
                      onClick={() => selectExpense(txn)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {formatDate(txn.date)}
                      </td>

                      {/* Merchant & Description */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {txn.merchant}
                        </div>
                        {txn.description !== txn.merchant && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                            {txn.description}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono text-xs whitespace-nowrap" data-tabular>
                        {formatINR(txn.amount)}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: catMeta.color }}
                          />
                          <span className="font-medium text-slate-800">{txn.category}</span>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          <span>{txn.paymentMethod}</span>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {txn.source === 'bank' ? (
                            <Building2 className="w-3 h-3 text-slate-400" />
                          ) : (
                            <Wallet className="w-3 h-3 text-slate-400" />
                          )}
                          <span className="capitalize">{txn.source}</span>
                        </div>
                      </td>

                      {/* Status / Anomaly */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {txn.isAnomaly ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200"
                              title={txn.anomalyReason}
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Unusual</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span className="font-mono">{Math.round(txn.confidence * 100)}%</span>
                            </span>
                          )}

                          {txn.status === 'pending_review' && (
                            <span className="text-[10px] text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                              Review
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
