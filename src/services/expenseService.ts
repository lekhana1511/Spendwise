import { Transaction } from '../data/mockTransactions';

export function evaluateAnomalies(transactions: Transaction[]): Transaction[] {
  // Group by category to find category averages and maxes
  const categoryStats: Record<string, { total: number; count: number; max: number; maxId: string }> = {};

  transactions.forEach(t => {
    if (!categoryStats[t.category]) {
      categoryStats[t.category] = { total: 0, count: 0, max: 0, maxId: '' };
    }
    categoryStats[t.category].total += t.amount;
    categoryStats[t.category].count += 1;
    if (t.amount > categoryStats[t.category].max) {
      categoryStats[t.category].max = t.amount;
      categoryStats[t.category].maxId = t.id;
    }
  });

  return transactions.map(t => {
    const stats = categoryStats[t.category];
    if (!stats || stats.count <= 1) {
      return { ...t, isAnomaly: false };
    }

    const avg = stats.total / stats.count;
    
    // Anomaly condition: significantly higher than category average and notable absolute amount
    const isUnusual = t.amount > avg * 2 && t.amount >= 2500;
    const isHighest = t.id === stats.maxId && stats.count >= 3 && t.amount > avg * 1.8;

    if (isUnusual || isHighest) {
      const multiplier = parseFloat((t.amount / avg).toFixed(1));
      const baseline = Math.round(avg);
      return {
        ...t,
        isAnomaly: !t.anomalyAcknowledged,
        categoryBaseline: baseline,
        anomalyMultiplier: multiplier,
        anomalyReason: `This ₹${t.amount.toLocaleString('en-IN')} expense is ${multiplier}x higher than your typical ${t.category} baseline (₹${baseline.toLocaleString('en-IN')}).`
      };
    }

    return {
      ...t,
      isAnomaly: false,
      categoryBaseline: Math.round(avg),
      anomalyMultiplier: 1.0,
      anomalyReason: undefined
    };
  });
}

export function filterTransactions(
  transactions: Transaction[],
  filters: {
    search?: string;
    category?: string;
    source?: string;
    paymentMethod?: string;
    status?: string;
    month?: string; // e.g. "2026-09"
    anomaliesOnly?: boolean;
  }
): Transaction[] {
  return transactions.filter(t => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        t.merchant.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filters.category && filters.category !== 'all' && t.category !== filters.category) {
      return false;
    }

    if (filters.source && filters.source !== 'all' && t.source !== filters.source) {
      return false;
    }

    if (filters.paymentMethod && filters.paymentMethod !== 'all' && t.paymentMethod !== filters.paymentMethod) {
      return false;
    }

    if (filters.status && filters.status !== 'all' && t.status !== filters.status) {
      return false;
    }

    if (filters.month && filters.month !== 'all') {
      if (!t.date.startsWith(filters.month)) return false;
    }

    if (filters.anomaliesOnly && !t.isAnomaly) {
      return false;
    }

    return true;
  });
}
