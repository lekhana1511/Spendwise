import { CATEGORIES } from '../data/categories';

export interface ClassificationResult {
  category: string;
  confidence: number;
  reason: string;
  alternatives: string[];
}

export function classifyExpense(merchantOrDesc: string, notes?: string): ClassificationResult {
  const text = `${merchantOrDesc || ''} ${notes || ''}`.toLowerCase().trim();

  if (!text) {
    return {
      category: 'Other',
      confidence: 0.40,
      reason: 'No merchant or description provided for classification.',
      alternatives: ['Food', 'Shopping']
    };
  }

  // 1. Direct merchant exact or leading match
  for (const cat of CATEGORIES) {
    for (const kw of cat.keywords) {
      // Check if text starts with keyword or contains it as a distinct word
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(text)) {
        // High confidence for known brand names
        const isBrandName = ['swiggy', 'zomato', 'uber', 'ola', 'amazon', 'flipkart', 'netflix', 'spotify', 'apollo', 'blinkit', 'dmart', 'bescom', 'jio recharge'].includes(kw);
        const confidence = isBrandName ? 0.98 : 0.92;
        
        // Alternatives
        const alternatives = CATEGORIES
          .filter(c => c.name !== cat.name)
          .slice(0, 2)
          .map(c => c.name);

        return {
          category: cat.name,
          confidence,
          reason: `Matched merchant / keyword: "${kw}" in "${merchantOrDesc}"`,
          alternatives
        };
      }
    }
  }

  // 2. Partial / Substring Match
  for (const cat of CATEGORIES) {
    for (const kw of cat.keywords) {
      if (text.includes(kw)) {
        const alternatives = CATEGORIES
          .filter(c => c.name !== cat.name)
          .slice(0, 2)
          .map(c => c.name);

        return {
          category: cat.name,
          confidence: 0.78,
          reason: `Matched descriptive term "${kw}"`,
          alternatives
        };
      }
    }
  }

  // 3. Fallback heuristic (e.g. check for common codes like POS, ATM, CASH)
  if (text.includes('pos') || text.includes('upi') || text.includes('pay') || text.includes('transfer')) {
    return {
      category: 'Other',
      confidence: 0.58,
      reason: 'Ambiguous merchant pattern detected (requires user confirmation)',
      alternatives: ['Food', 'Shopping', 'Utilities']
    };
  }

  return {
    category: 'Other',
    confidence: 0.45,
    reason: 'Unrecognized merchant or generic description',
    alternatives: ['Food', 'Shopping', 'Bills']
  };
}
