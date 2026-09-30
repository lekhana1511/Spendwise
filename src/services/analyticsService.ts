import { Transaction } from '../data/mockTransactions';

export interface CategoryMetric {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  previousAmount: number;
  changePercentage: number;
}

export interface MonthlyTrendMetric {
  monthKey: string; // e.g., '2026-08', '2026-09'
  monthLabel: string; // e.g., 'Aug 2026', 'Sep 2026'
  totalSpending: number;
  transactionCount: number;
}

export interface RecurringExpenseItem {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  frequency: string;
}

export interface RecurringSummary {
  totalMonthly: number;
  count: number;
  items: RecurringExpenseItem[];
}

export interface AnalyticsSummary {
  currentMonth: string;
  totalSpending: number;
  previousMonthSpending: number;
  spendingChangePct: number;
  averageTransaction: number;
  totalTransactions: number;
  highestCategory: { name: string; amount: number; percentage: number };
  categoryBreakdown: CategoryMetric[];
  monthlyTrends: MonthlyTrendMetric[];
  foodDeliverySpend: { count: number; total: number };
  recurringSpend: RecurringSummary;
  budgetUtilizationPct: number;
  remainingBudget: number;
}

export function computeAnalytics(
  transactions: Transaction[],
  monthlyIncome = 85000,
  monthlyBudget = 50000,
  targetMonth = '2026-09',
  previousMonth = '2026-08'
): AnalyticsSummary {
  // Current month transactions
  const currentMonthTxns = transactions.filter(t => t.date.startsWith(targetMonth));
  const prevMonthTxns = transactions.filter(t => t.date.startsWith(previousMonth));

  const totalSpending = currentMonthTxns.reduce((sum, t) => sum + t.amount, 0);
  const previousMonthSpending = prevMonthTxns.reduce((sum, t) => sum + t.amount, 0);

  const spendingChangePct =
    previousMonthSpending > 0
      ? Math.round(((totalSpending - previousMonthSpending) / previousMonthSpending) * 100)
      : 0;

  const totalTransactions = currentMonthTxns.length;
  const averageTransaction = totalTransactions > 0 ? Math.round(totalSpending / totalTransactions) : 0;

  // Category breakdown for current month vs previous month
  const currentCatTotals: Record<string, { amount: number; count: number }> = {};
  currentMonthTxns.forEach(t => {
    if (!currentCatTotals[t.category]) {
      currentCatTotals[t.category] = { amount: 0, count: 0 };
    }
    currentCatTotals[t.category].amount += t.amount;
    currentCatTotals[t.category].count += 1;
  });

  const prevCatTotals: Record<string, number> = {};
  prevMonthTxns.forEach(t => {
    prevCatTotals[t.category] = (prevCatTotals[t.category] || 0) + t.amount;
  });

  const categoryBreakdown: CategoryMetric[] = Object.keys(currentCatTotals).map(cat => {
    const cur = currentCatTotals[cat];
    const prevAmt = prevCatTotals[cat] || 0;
    const changePct =
      prevAmt > 0 ? Math.round(((cur.amount - prevAmt) / prevAmt) * 100) : 100;
    const percentage = totalSpending > 0 ? Math.round((cur.amount / totalSpending) * 100) : 0;

    return {
      category: cat,
      amount: cur.amount,
      count: cur.count,
      percentage,
      previousAmount: prevAmt,
      changePercentage: changePct
    };
  });

  // Sort by highest spending
  categoryBreakdown.sort((a, b) => b.amount - a.amount);

  const highestCat =
    categoryBreakdown.length > 0
      ? {
          name: categoryBreakdown[0].category,
          amount: categoryBreakdown[0].amount,
          percentage: categoryBreakdown[0].percentage
        }
      : { name: 'None', amount: 0, percentage: 0 };

  // Calculate Monthly Trends across all distinct months
  const monthsMap: Record<string, { total: number; count: number }> = {};
  transactions.forEach(t => {
    const monthKey = t.date.substring(0, 7); // 'YYYY-MM'
    if (!monthsMap[monthKey]) {
      monthsMap[monthKey] = { total: 0, count: 0 };
    }
    monthsMap[monthKey].total += t.amount;
    monthsMap[monthKey].count += 1;
  });

  const monthlyTrends: MonthlyTrendMetric[] = Object.keys(monthsMap)
    .sort()
    .map(key => {
      const [year, month] = key.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthLabel = dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      return {
        monthKey: key,
        monthLabel,
        totalSpending: monthsMap[key].total,
        transactionCount: monthsMap[key].count
      };
    });

  // Food delivery specific calculation (Swiggy + Zomato)
  const foodDeliveryTxns = currentMonthTxns.filter(t => {
    const m = t.merchant.toLowerCase();
    const d = t.description.toLowerCase();
    return m.includes('swiggy') || m.includes('zomato') || d.includes('swiggy') || d.includes('zomato');
  });
  const foodDeliverySpend = {
    count: foodDeliveryTxns.length,
    total: foodDeliveryTxns.reduce((sum, t) => sum + t.amount, 0)
  };

  // Recurring subscriptions and fixed utility calculation
  const recurringKeywords = ['netflix', 'spotify', 'jio recharge', 'bescom', 'broadband', 'electricity', 'prime video', 'youtube', 'gym', 'cult.fit'];
  const recurringItems: RecurringExpenseItem[] = [];
  const seenMerchants = new Set<string>();

  currentMonthTxns.forEach(t => {
    const text = `${t.merchant} ${t.description}`.toLowerCase();
    const isRecurring = recurringKeywords.some(kw => text.includes(kw));
    if (isRecurring && !seenMerchants.has(t.merchant.toLowerCase())) {
      seenMerchants.add(t.merchant.toLowerCase());
      recurringItems.push({
        id: t.id,
        merchant: t.merchant,
        category: t.category,
        amount: t.amount,
        frequency: 'Monthly'
      });
    }
  });

  const recurringTotal = recurringItems.reduce((sum, item) => sum + item.amount, 0);
  const recurringSpend: RecurringSummary = {
    totalMonthly: recurringTotal,
    count: recurringItems.length,
    items: recurringItems
  };

  const budgetUtilizationPct = monthlyBudget > 0 ? Math.round((totalSpending / monthlyBudget) * 100) : 0;
  const remainingBudget = Math.max(0, monthlyBudget - totalSpending);

  return {
    currentMonth: targetMonth,
    totalSpending,
    previousMonthSpending,
    spendingChangePct,
    averageTransaction,
    totalTransactions,
    highestCategory: highestCat,
    categoryBreakdown,
    monthlyTrends,
    foodDeliverySpend,
    recurringSpend,
    budgetUtilizationPct,
    remainingBudget
  };
}
