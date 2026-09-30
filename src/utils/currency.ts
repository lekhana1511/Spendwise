// Currency utilities with Indian Rupee formatting
export function formatINR(amount: number, options?: { hideSymbol?: boolean; compact?: boolean }): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return options?.hideSymbol ? '0' : '₹0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (options?.compact) {
    if (absAmount >= 10000000) {
      const cr = (absAmount / 10000000).toFixed(2);
      return `${isNegative ? '-' : ''}${options?.hideSymbol ? '' : '₹'}${cr} Cr`;
    }
    if (absAmount >= 100000) {
      const lakh = (absAmount / 100000).toFixed(2);
      return `${isNegative ? '-' : ''}${options?.hideSymbol ? '' : '₹'}${lakh} L`;
    }
    if (absAmount >= 1000) {
      const k = (absAmount / 1000).toFixed(1);
      return `${isNegative ? '-' : ''}${options?.hideSymbol ? '' : '₹'}${k}k`;
    }
  }

  // Indian standard comma separation: 3 digits, then groups of 2
  const parts = absAmount.toFixed(0).split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `${isNegative ? '-' : ''}${options?.hideSymbol ? '' : '₹'}${formatted}`;
}

export function parseINR(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
