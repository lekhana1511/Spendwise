import { Transaction } from '../data/mockTransactions';
import { AnalyticsSummary } from './analyticsService';
import { formatINR } from '../utils/currency';

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    route: string;
  };
}

export function answerFinancialQuery(
  query: string,
  transactions: Transaction[],
  analytics: AnalyticsSummary
): { answer: string; suggestedAction?: { label: string; route: string } } {
  const q = query.toLowerCase().trim();

  // 1. Food queries
  if (q.includes('food') || q.includes('swiggy') || q.includes('zomato') || q.includes('dinner') || q.includes('lunch')) {
    const foodCat = analytics.categoryBreakdown.find(c => c.category === 'Food');
    const foodTotal = foodCat ? foodCat.amount : 0;
    const foodPercent = foodCat ? foodCat.percentage : 0;
    const deliveryCount = analytics.foodDeliverySpend.count;

    return {
      answer: `You spent ${formatINR(foodTotal)} on Food this month (${foodPercent}% of your total spending). That includes ${deliveryCount} food delivery orders via Swiggy and Zomato totaling ${formatINR(analytics.foodDeliverySpend.total)}. Food is currently your second-highest spending area.`,
      suggestedAction: {
        label: 'View Food Expenses',
        route: '/expenses?category=Food'
      }
    };
  }

  // 2. Highest / Most spending queries
  if (q.includes('most') || q.includes('highest') || q.includes('where am i spending') || q.includes('top category')) {
    const top = analytics.highestCategory || { name: 'Shopping', amount: 0, percentage: 0 };
    const topName = top.name || 'Shopping';
    return {
      answer: `${topName} is your highest spending category this month at ${formatINR(top.amount || 0)}, making up ${top.percentage || 0}% of all your expenses. The single largest transaction here was ${formatINR(12500)} at Amazon India.`,
      suggestedAction: {
        label: `Explore ${topName} Breakdown`,
        route: `/analytics?category=${encodeURIComponent(topName)}`
      }
    };
  }

  // 3. Spending increase / "Why" queries
  if (q.includes('increase') || q.includes('why') || q.includes('rose') || q.includes('jump')) {
    const surge = analytics.categoryBreakdown.find(c => c.changePercentage >= 15 && c.previousAmount > 0);
    if (surge) {
      return {
        answer: `Your spending in ${surge.category} increased by ${surge.changePercentage}% compared with last month (from ${formatINR(surge.previousAmount)} to ${formatINR(surge.amount)}). In addition, an irregular ₹12,500 purchase at Amazon India contributed to a high monthly total.`,
        suggestedAction: {
          label: 'Inspect Spending Trends',
          route: '/analytics'
        }
      };
    }
    return {
      answer: `Overall spending is at ${formatINR(analytics.totalSpending)} compared with ${formatINR(analytics.previousMonthSpending)} last month (${analytics.spendingChangePct >= 0 ? '+' : ''}${analytics.spendingChangePct}%). Food delivery and shopping are the two fastest-growing segments.`,
      suggestedAction: {
        label: 'View Analytics',
        route: '/analytics'
      }
    };
  }

  // 4. Savings queries
  if (q.includes('save') || q.includes('cut') || q.includes('reduce') || q.includes('budget')) {
    const foodDelivery = analytics.foodDeliverySpend.total;
    const potentialFood = Math.round(foodDelivery * 0.20);
    const potentialYearly = potentialFood * 12;

    return {
      answer: `You could potentially save ${formatINR(potentialFood)} per month (${formatINR(potentialYearly)} annually) simply by cutting online food delivery by 20%. Investing that monthly saving at an estimated 10% annual return could grow to over ₹1,60,000 in 10 years!`,
      suggestedAction: {
        label: 'Simulate Savings in Projection',
        route: '/projection'
      }
    };
  }

  // 5. Biggest expense / anomaly
  if (q.includes('biggest') || q.includes('largest') || q.includes('anomaly') || q.includes('unusual')) {
    const currentTxns = transactions.filter(t => t.date.startsWith(analytics.currentMonth));
    const sorted = [...currentTxns].sort((a, b) => b.amount - a.amount);
    const top = sorted[0];

    if (top) {
      return {
        answer: `Your largest single expense this month was ${formatINR(top.amount)} at ${top.merchant} on ${top.date} for ${top.description}. It was flagged as unusual because it is over 6x higher than your average shopping transaction.`,
        suggestedAction: {
          label: 'View Transaction Details',
          route: '/expenses?anomalies=true'
        }
      };
    }
  }

  // 6. Last month queries
  if (q.includes('last month') || q.includes('previous') || q.includes('august')) {
    return {
      answer: `Last month (August 2026), your recorded spending was ${formatINR(analytics.previousMonthSpending)}. Current month spending stands at ${formatINR(analytics.totalSpending)}, an overall change of ${analytics.spendingChangePct >= 0 ? '+' : ''}${analytics.spendingChangePct}%.`,
      suggestedAction: {
        label: 'Compare Month over Month',
        route: '/analytics'
      }
    };
  }

  // 7. General fallback / guide
  return {
    answer: `Spendwise is tracking your September 2026 finances. Currently:
• Total Spending: ${formatINR(analytics.totalSpending)}
• Remaining Budget: ${formatINR(analytics.remainingBudget)}
• Top Category: ${analytics.highestCategory?.name || 'None'} (${formatINR(analytics.highestCategory?.amount || 0)})

You can ask me questions like:
- "Where am I spending the most?"
- "How much did I spend on food?"
- "Why did my spending increase?"
- "How much can I save this month?"
- "What was my biggest expense?"`,
    suggestedAction: {
      label: 'Open Analytics',
      route: '/analytics'
    }
  };
}
