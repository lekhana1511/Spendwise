import { MongoClient, Db, Collection } from 'mongodb';
import { Transaction, INITIAL_MOCK_TRANSACTIONS } from '../data/mockTransactions';
import { INITIAL_MOCK_BANK, BankAccountState } from '../data/mockBankAccount';
import { evaluateAnomalies } from '../services/expenseService';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spendwise';
const DB_NAME = process.env.MONGODB_DB_NAME || 'spendwise';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;

// In-memory fallback store
let fallbackExpenses: Transaction[] = evaluateAnomalies([...INITIAL_MOCK_TRANSACTIONS]);
let fallbackBank: BankAccountState = { ...INITIAL_MOCK_BANK };
let fallbackPreferences = {
  currency: 'INR',
  monthlyIncome: 85000,
  monthlyBudget: 50000,
  financialGoal: 'Save more',
  preferredCategories: ['Food', 'Shopping', 'Transport', 'Bills']
};
let fallbackSavingsGoal = {
  id: 'goal-emergency-fund',
  name: 'Emergency Fund',
  targetAmount: 150000,
  currentAmount: 35000,
  targetDate: '2027-03-31',
  monthlyContributionNeeded: 9583
};

export async function initDb(): Promise<{ connected: boolean; using: string }> {
  if (isConnected && db) {
    return { connected: true, using: 'mongodb' };
  }

  try {
    console.log(`[Spendwise DB] Attempting connection to MongoDB (${MONGODB_URI.replace(/\/\/.*@/, '//<auth>@')})...`);
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });

    await client.connect();
    db = client.db(DB_NAME);
    isConnected = true;
    console.log(`[Spendwise DB] Successfully connected to MongoDB database: "${DB_NAME}"`);

    // Initialize collections and seed if empty
    await seedIfEmpty();

    return { connected: true, using: 'mongodb' };
  } catch (err: any) {
    console.warn(`[Spendwise DB] MongoDB unavailable (${err.message}). Using resilient in-memory fallback.`);
    isConnected = false;
    db = null;
    return { connected: false, using: 'memory' };
  }
}

async function seedIfEmpty() {
  if (!db) return;
  try {
    const expensesCol = db.collection<Transaction>('expenses');
    const count = await expensesCol.countDocuments();
    if (count === 0) {
      console.log('[Spendwise DB] Seeding initial mock transactions to MongoDB...');
      const initialWithAnomalies = evaluateAnomalies([...INITIAL_MOCK_TRANSACTIONS]);
      await expensesCol.insertMany(initialWithAnomalies as any);
      console.log(`[Spendwise DB] Seeded ${initialWithAnomalies.length} transactions.`);
    }

    const bankCol = db.collection('bank_account');
    const bankCount = await bankCol.countDocuments();
    if (bankCount === 0) {
      await bankCol.insertOne({ id: 'primary-bank', ...INITIAL_MOCK_BANK } as any);
    }

    const goalCol = db.collection('savings_goal');
    const goalCount = await goalCol.countDocuments();
    if (goalCount === 0) {
      await goalCol.insertOne(fallbackSavingsGoal as any);
    }

    const prefsCol = db.collection('preferences');
    const prefsCount = await prefsCol.countDocuments();
    if (prefsCount === 0) {
      await prefsCol.insertOne({ id: 'user-prefs', ...fallbackPreferences } as any);
    }
  } catch (err) {
    console.error('[Spendwise DB] Error seeding database:', err);
  }
}

export function getDbStatus() {
  return {
    connected: isConnected,
    mode: isConnected ? 'mongodb' : 'memory_fallback',
    database: DB_NAME
  };
}

// ----------------- EXPENSES -----------------

export async function getAllExpenses(): Promise<Transaction[]> {
  if (isConnected && db) {
    try {
      const expensesCol = db.collection<Transaction>('expenses');
      const docs = await expensesCol.find({}).sort({ date: -1, createdAt: -1 }).toArray();
      // Remove Mongo _id before sending to frontend
      return docs.map(d => {
        const { _id, ...rest } = d as any;
        return rest as Transaction;
      });
    } catch (err) {
      console.error('[Spendwise DB] Error fetching expenses from Mongo, using fallback:', err);
    }
  }
  return [...fallbackExpenses].sort((a, b) => (b.date > a.date ? 1 : -1));
}

export async function insertExpense(expense: Transaction): Promise<Transaction> {
  // Always update memory fallback
  fallbackExpenses = [expense, ...fallbackExpenses.filter(e => e.id !== expense.id)];

  if (isConnected && db) {
    try {
      const expensesCol = db.collection<Transaction>('expenses');
      await expensesCol.updateOne(
        { id: expense.id } as any,
        { $set: expense as any },
        { upsert: true }
      );
    } catch (err) {
      console.error('[Spendwise DB] Error saving expense to Mongo:', err);
    }
  }

  return expense;
}

export async function updateExpense(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
  let updatedItem: Transaction | null = null;

  // Update in memory fallback
  fallbackExpenses = fallbackExpenses.map(item => {
    if (item.id === id) {
      updatedItem = { ...item, ...updates };
      return updatedItem;
    }
    return item;
  });

  if (isConnected && db) {
    try {
      const expensesCol = db.collection<Transaction>('expenses');
      await expensesCol.updateOne({ id } as any, { $set: updates as any });
      const doc = await expensesCol.findOne({ id } as any);
      if (doc) {
        const { _id, ...rest } = doc as any;
        updatedItem = rest as Transaction;
      }
    } catch (err) {
      console.error('[Spendwise DB] Error updating expense in Mongo:', err);
    }
  }

  return updatedItem;
}

export async function deleteExpense(id: string): Promise<boolean> {
  fallbackExpenses = fallbackExpenses.filter(item => item.id !== id);

  if (isConnected && db) {
    try {
      const expensesCol = db.collection<Transaction>('expenses');
      await expensesCol.deleteOne({ id } as any);
      return true;
    } catch (err) {
      console.error('[Spendwise DB] Error deleting expense in Mongo:', err);
    }
  }

  return true;
}

export async function bulkInsertExpenses(expenses: Transaction[]): Promise<Transaction[]> {
  const existingIds = new Set(expenses.map(e => e.id));
  fallbackExpenses = [...expenses, ...fallbackExpenses.filter(e => !existingIds.has(e.id))];

  if (isConnected && db && expenses.length > 0) {
    try {
      const expensesCol = db.collection<Transaction>('expenses');
      for (const txn of expenses) {
        await expensesCol.updateOne({ id: txn.id } as any, { $set: txn as any }, { upsert: true });
      }
    } catch (err) {
      console.error('[Spendwise DB] Error bulk inserting to Mongo:', err);
    }
  }

  return expenses;
}

// ----------------- BANK & PREFERENCES -----------------

export async function getBankState(): Promise<BankAccountState> {
  if (isConnected && db) {
    try {
      const bankCol = db.collection('bank_account');
      const doc = await bankCol.findOne({ id: 'primary-bank' });
      if (doc) {
        const { _id, id, ...rest } = doc as any;
        return rest as BankAccountState;
      }
    } catch (err) {
      console.error('[Spendwise DB] Error fetching bank from Mongo:', err);
    }
  }
  return { ...fallbackBank };
}

export async function saveBankState(bank: BankAccountState): Promise<BankAccountState> {
  fallbackBank = { ...bank };
  if (isConnected && db) {
    try {
      const bankCol = db.collection('bank_account');
      await bankCol.updateOne(
        { id: 'primary-bank' },
        { $set: { id: 'primary-bank', ...bank } as any },
        { upsert: true }
      );
    } catch (err) {
      console.error('[Spendwise DB] Error updating bank in Mongo:', err);
    }
  }
  return { ...fallbackBank };
}

export async function getSavingsGoal(): Promise<any> {
  if (isConnected && db) {
    try {
      const col = db.collection('savings_goal');
      const doc = await col.findOne({});
      if (doc) {
        const { _id, ...rest } = doc as any;
        return rest;
      }
    } catch (err) {
      console.error('[Spendwise DB] Error fetching savings goal from Mongo:', err);
    }
  }
  return { ...fallbackSavingsGoal };
}

export async function saveSavingsGoal(goal: any): Promise<any> {
  fallbackSavingsGoal = { ...fallbackSavingsGoal, ...goal };
  if (isConnected && db) {
    try {
      const col = db.collection('savings_goal');
      await col.updateOne(
        { id: fallbackSavingsGoal.id },
        { $set: fallbackSavingsGoal as any },
        { upsert: true }
      );
    } catch (err) {
      console.error('[Spendwise DB] Error updating goal in Mongo:', err);
    }
  }
  return { ...fallbackSavingsGoal };
}

export async function getPreferences(): Promise<any> {
  if (isConnected && db) {
    try {
      const col = db.collection('preferences');
      const doc = await col.findOne({ id: 'user-prefs' });
      if (doc) {
        const { _id, id, ...rest } = doc as any;
        return rest;
      }
    } catch (err) {
      console.error('[Spendwise DB] Error fetching preferences from Mongo:', err);
    }
  }
  return { ...fallbackPreferences };
}

export async function savePreferences(prefs: any): Promise<any> {
  fallbackPreferences = { ...fallbackPreferences, ...prefs };
  if (isConnected && db) {
    try {
      const col = db.collection('preferences');
      await col.updateOne(
        { id: 'user-prefs' },
        { $set: { id: 'user-prefs', ...prefs } as any },
        { upsert: true }
      );
    } catch (err) {
      console.error('[Spendwise DB] Error updating preferences in Mongo:', err);
    }
  }
  return { ...fallbackPreferences };
}

export async function resetDatabase(): Promise<boolean> {
  fallbackExpenses = evaluateAnomalies([...INITIAL_MOCK_TRANSACTIONS]);
  fallbackBank = { ...INITIAL_MOCK_BANK };
  fallbackSavingsGoal = {
    id: 'goal-emergency-fund',
    name: 'Emergency Fund',
    targetAmount: 150000,
    currentAmount: 35000,
    targetDate: '2027-03-31',
    monthlyContributionNeeded: 9583
  };
  fallbackPreferences = {
    currency: 'INR',
    monthlyIncome: 85000,
    monthlyBudget: 50000,
    financialGoal: 'Save more',
    preferredCategories: ['Food', 'Shopping', 'Transport', 'Bills']
  };

  if (isConnected && db) {
    try {
      await db.collection('expenses').deleteMany({});
      await db.collection('bank_account').deleteMany({});
      await db.collection('savings_goal').deleteMany({});
      await db.collection('preferences').deleteMany({});
      await seedIfEmpty();
    } catch (err) {
      console.error('[Spendwise DB] Error resetting Mongo DB:', err);
    }
  }

  return true;
}
