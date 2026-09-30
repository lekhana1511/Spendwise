import { Transaction } from '../data/mockTransactions';
import { BankAccountState } from '../data/mockBankAccount';
import { SavingsGoal } from '../store/appReducer';

const BASE_URL = '/api';

export const apiService = {
  // Check health and db status
  async getHealth(): Promise<{ status: string; db: { connected: boolean; mode: string } } | null> {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // ---------------- Expenses ----------------
  async getExpenses(): Promise<Transaction[] | null> {
    try {
      const res = await fetch(`${BASE_URL}/expenses`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[Spendwise API] Failed to fetch expenses from backend:', err);
      return null;
    }
  },

  async createExpense(expense: Transaction): Promise<Transaction | null> {
    try {
      const res = await fetch(`${BASE_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[Spendwise API] Failed to save expense to MongoDB:', err);
      return null;
    }
  },

  async updateExpense(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    try {
      const res = await fetch(`${BASE_URL}/expenses/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[Spendwise API] Failed to update expense in MongoDB:', err);
      return null;
    }
  },

  async deleteExpense(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/expenses/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (err) {
      console.warn('[Spendwise API] Failed to delete expense from MongoDB:', err);
      return false;
    }
  },

  async bulkCreateExpenses(expenses: Transaction[]): Promise<Transaction[] | null> {
    try {
      const res = await fetch(`${BASE_URL}/expenses/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenses)
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.expenses || expenses;
    } catch (err) {
      console.warn('[Spendwise API] Failed to bulk insert expenses:', err);
      return null;
    }
  },

  // ---------------- Bank ----------------
  async getBank(): Promise<BankAccountState | null> {
    try {
      const res = await fetch(`${BASE_URL}/bank`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateBank(bank: BankAccountState): Promise<BankAccountState | null> {
    try {
      const res = await fetch(`${BASE_URL}/bank`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bank)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // ---------------- Preferences ----------------
  async getPreferences(): Promise<any | null> {
    try {
      const res = await fetch(`${BASE_URL}/preferences`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updatePreferences(prefs: any): Promise<any | null> {
    try {
      const res = await fetch(`${BASE_URL}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // ---------------- Savings Goal ----------------
  async getSavingsGoal(): Promise<SavingsGoal | null> {
    try {
      const res = await fetch(`${BASE_URL}/savings-goal`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateSavingsGoal(goal: Partial<SavingsGoal>): Promise<SavingsGoal | null> {
    try {
      const res = await fetch(`${BASE_URL}/savings-goal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // ---------------- Reset Database ----------------
  async resetDatabase(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  }
};
