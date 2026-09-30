import { BankAccountState, AVAILABLE_DEMO_BANKS } from '../data/mockBankAccount';
import { Transaction, SYNCABLE_BANK_TRANSACTIONS } from '../data/mockTransactions';
import { evaluateAnomalies } from './expenseService';

export interface SyncResult {
  addedTransactionsCount: number;
  totalSyncedCount: number;
  automaticallyClassified: number;
  needsReviewCount: number;
  updatedTransactions: Transaction[];
  newBalance: number;
}

export async function simulateBankConnection(bankCode: string): Promise<BankAccountState> {
  const bank = AVAILABLE_DEMO_BANKS.find(b => b.code === bankCode) || AVAILABLE_DEMO_BANKS[0];
  
  // Simulate network verification delay
  await new Promise(resolve => setTimeout(resolve, 1400));

  return {
    isConnected: true,
    bankName: bank?.name || 'HDFC Bank',
    accountType: bank?.accountType || 'Savings Account',
    maskedAccountNumber: bank?.defaultMask || 'XXXX 4521',
    currentBalance: 48650,
    availableBalance: 48650,
    lastSynced: new Date().toISOString(),
    syncStatus: 'connected'
  };
}

export async function simulateBankSync(
  currentTransactions: Transaction[],
  currentBalance: number
): Promise<SyncResult> {
  // Simulate realistic network delay
  await new Promise(resolve => setTimeout(resolve, 1600));

  // Determine which syncable transactions aren't in current list yet
  const existingIds = new Set(currentTransactions.map(t => t.id));
  const newTransactionsToInject = SYNCABLE_BANK_TRANSACTIONS.filter(t => !existingIds.has(t.id));

  const merged = [...newTransactionsToInject, ...currentTransactions];
  const evaluated = evaluateAnomalies(merged);

  const autoClassified = newTransactionsToInject.filter(t => t.confidence >= 0.85).length;
  const needsReview = newTransactionsToInject.filter(t => t.confidence < 0.85).length;

  const totalDeducted = newTransactionsToInject.reduce((sum, t) => sum + t.amount, 0);
  const updatedBalance = Math.max(10000, currentBalance - totalDeducted);

  return {
    addedTransactionsCount: newTransactionsToInject.length,
    totalSyncedCount: evaluated.filter(t => t.source === 'bank').length,
    automaticallyClassified: autoClassified,
    needsReviewCount: needsReview,
    updatedTransactions: evaluated,
    newBalance: updatedBalance
  };
}
