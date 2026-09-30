import { Transaction } from '../data/mockTransactions';
import { AnalyticsSummary } from './analyticsService';
import { formatINR } from '../utils/currency';

export interface SmartInsight {
  id: string;
  type: 'category_high' | 'category_increase' | 'anomaly' | 'repeated_expenses' | 'budget_warning' | 'positive_habit';
  severity: 'info' | 'warning' | 'alert' | 'success';
  title: string;
  message: string;
  supportingValue?: string;
  actionLabel?: string;
  actionRoute?: string;
  category?: string;
}

export interface SavingsSuggestion {
  id: string;
  title: string;
  category: string;
  currentSpend: number;
  reductionPercentage: number;
  monthlySaving: number;
  yearlySaving: number;
  description: string;
  actionLabel: string;
  projectionAmount: number;
}

export function generateSmartInsights(
  transactions: Transaction[],
  analytics: AnalyticsSummary,
  monthlyBudget: number
): SmartInsight[] {
  const insights: SmartInsight[] = [];

  // 1. Highest spending category
  if (analytics.highestCategory?.name && analytics.highestCategory.amount > 0) {
    const highestName = analytics.highestCategory.name;
    insights.push({
      id: 'insight-highest-cat',
      type: 'category_high',
      severity: 'info',
      title: `${highestName} is your highest spending category`,
      message: `You spent ${formatINR(analytics.highestCategory.amount)} on ${highestName} this month, accounting for ${analytics.highestCategory.percentage}% of your total spending.`,
      supportingValue: `${analytics.highestCategory.percentage}% of total`,
      actionLabel: `View ${highestName} Analysis`,
      actionRoute: `/analytics?category=${encodeURIComponent(highestName)}`,
      category: highestName
    });
  }

  // 2. Category increase > 15%
  const significantSurge = analytics.categoryBreakdown.find(c => c.changePercentage >= 15 && c.previousAmount > 0);
  if (significantSurge) {
    insights.push({
      id: 'insight-surge-cat',
      type: 'category_increase',
      severity: 'warning',
      title: `${significantSurge.category} spending increased by ${significantSurge.changePercentage}%`,
      message: `Your spending in ${significantSurge.category} rose from ${formatINR(significantSurge.previousAmount)} in the previous period to ${formatINR(significantSurge.amount)} this month.`,
      supportingValue: `+${significantSurge.changePercentage}% change`,
      actionLabel: 'Inspect Transactions',
      actionRoute: `/expenses?category=${encodeURIComponent(significantSurge.category)}`,
      category: significantSurge.category
    });
  }

  // 3. Anomaly detected
  const activeAnomalies = transactions.filter(t => t.isAnomaly && t.date.startsWith(analytics.currentMonth));
  if (activeAnomalies.length > 0) {
    const highestAnomaly = activeAnomalies.reduce((max, t) => t.amount > max.amount ? t : max, activeAnomalies[0]);
    insights.push({
      id: 'insight-anomaly',
      type: 'anomaly',
      severity: 'warning',
      title: `Unusual transaction at ${highestAnomaly.merchant}`,
      message: highestAnomaly.anomalyReason || `Your ${formatINR(highestAnomaly.amount)} purchase at ${highestAnomaly.merchant} is noticeably higher than your category baseline.`,
      supportingValue: formatINR(highestAnomaly.amount),
      actionLabel: 'Review Anomaly',
      actionRoute: `/expenses?anomalies=true`,
      category: highestAnomaly.category
    });
  }

  // 4. Repeated small expenses (Food delivery)
  if (analytics.foodDeliverySpend.count >= 4) {
    insights.push({
      id: 'insight-repeated-food',
      type: 'repeated_expenses',
      severity: 'info',
      title: `${analytics.foodDeliverySpend.count} Food Delivery Orders this Month`,
      message: `You made ${analytics.foodDeliverySpend.count} food delivery purchases totaling ${formatINR(analytics.foodDeliverySpend.total)}. Repeated small orders add up quickly.`,
      supportingValue: formatINR(analytics.foodDeliverySpend.total),
      actionLabel: 'See Savings Potential',
      actionRoute: '/projection'
    });
  }

  // 5. Budget warning / status
  if (analytics.budgetUtilizationPct >= 80) {
    insights.push({
      id: 'insight-budget-warning',
      type: 'budget_warning',
      severity: analytics.budgetUtilizationPct >= 95 ? 'alert' : 'warning',
      title: `Used ${analytics.budgetUtilizationPct}% of your monthly budget`,
      message: `You have spent ${formatINR(analytics.totalSpending)} out of your ${formatINR(monthlyBudget)} monthly allowance. ${formatINR(analytics.remainingBudget)} remains.`,
      supportingValue: `${analytics.budgetUtilizationPct}% utilized`,
      actionLabel: 'View Budget Breakdown',
      actionRoute: '/analytics'
    });
  } else {
    insights.push({
      id: 'insight-budget-healthy',
      type: 'positive_habit',
      severity: 'success',
      title: 'Spending is currently within monthly budget',
      message: `You are on pace to retain ${formatINR(analytics.remainingBudget)} of your monthly budget this cycle.`,
      supportingValue: `${100 - analytics.budgetUtilizationPct}% headroom`,
      actionLabel: 'Project Future Wealth',
      actionRoute: '/projection'
    });
  }

  return insights;
}

export function generateSavingsSuggestions(
  analytics: AnalyticsSummary
): SavingsSuggestion[] {
  const suggestions: SavingsSuggestion[] = [];

  // Suggestion 1: Food Delivery Reduction
  if (analytics.foodDeliverySpend.total > 0) {
    const rate = 0.20; // 20%
    const monthlySaving = Math.round(analytics.foodDeliverySpend.total * rate);
    suggestions.push({
      id: 'saving-food-delivery',
      title: 'Reduce Online Food Delivery',
      category: 'Food',
      currentSpend: analytics.foodDeliverySpend.total,
      reductionPercentage: 20,
      monthlySaving,
      yearlySaving: monthlySaving * 12,
      description: `Cooking at home twice more per week could reduce food delivery expenses from ${formatINR(analytics.foodDeliverySpend.total)} to ${formatINR(analytics.foodDeliverySpend.total - monthlySaving)}.`,
      actionLabel: 'See what this could become',
      projectionAmount: monthlySaving
    });
  }

  // Suggestion 2: Shopping Discipline
  const shoppingCat = analytics.categoryBreakdown.find(c => c.category === 'Shopping');
  if (shoppingCat && shoppingCat.amount >= 5000) {
    const rate = 0.15; // 15%
    const monthlySaving = Math.round(shoppingCat.amount * rate);
    suggestions.push({
      id: 'saving-shopping',
      title: 'Implement 48-Hour Cart Rule',
      category: 'Shopping',
      currentSpend: shoppingCat.amount,
      reductionPercentage: 15,
      monthlySaving,
      yearlySaving: monthlySaving * 12,
      description: `Waiting 48 hours before non-essential purchases typically prevents 15% of impulsive digital checkouts.`,
      actionLabel: 'See what this could become',
      projectionAmount: monthlySaving
    });
  }

  // Suggestion 3: Commute / Transport Optimization
  const transportCat = analytics.categoryBreakdown.find(c => c.category === 'Transport');
  if (transportCat && transportCat.amount >= 2000) {
    const rate = 0.15;
    const monthlySaving = Math.round(transportCat.amount * rate);
    suggestions.push({
      id: 'saving-transport',
      title: 'Optimize Peak-Hour Commuting',
      category: 'Transport',
      currentSpend: transportCat.amount,
      reductionPercentage: 15,
      monthlySaving,
      yearlySaving: monthlySaving * 12,
      description: `Using metro passes or carpooling during surge hours could save roughly 15% on monthly transit.`,
      actionLabel: 'See what this could become',
      projectionAmount: monthlySaving
    });
  }

  return suggestions;
}
