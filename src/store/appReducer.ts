import { UserProfile, INITIAL_MOCK_USER } from '../data/mockUser';
import { BankAccountState, INITIAL_MOCK_BANK } from '../data/mockBankAccount';
import { Transaction, INITIAL_MOCK_TRANSACTIONS } from '../data/mockTransactions';
import { evaluateAnomalies } from '../services/expenseService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // e.g. '2027-03-31'
  monthlyContributionNeeded: number;
}

export interface AppState {
  auth: {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isOnboarded: boolean;
  };
  preferences: {
    currency: string;
    monthlyIncome: number;
    monthlyBudget: number;
    financialGoal: string;
    preferredCategories: string[];
  };
  savingsGoal: SavingsGoal;
  bank: BankAccountState;
  expenses: Transaction[];
  ui: {
    activeModal: string | null;
    selectedExpense: Transaction | null;
    activeWhyAnomaly: Transaction | null;
    toast: ToastMessage | null;
    isProcessing: boolean;
    projectionPrefillAmount?: number;
  };
}

export const INITIAL_STATE: AppState = {
  auth: {
    user: INITIAL_MOCK_USER,
    isAuthenticated: true,
    isOnboarded: true
  },
  preferences: {
    currency: "INR",
    monthlyIncome: 85000,
    monthlyBudget: 50000,
    financialGoal: "Save more",
    preferredCategories: ["Food", "Shopping", "Transport", "Bills"]
  },
  savingsGoal: {
    id: "goal-emergency-fund",
    name: "Emergency Fund",
    targetAmount: 150000,
    currentAmount: 35000,
    targetDate: "2027-03-31",
    monthlyContributionNeeded: 9583
  },
  bank: INITIAL_MOCK_BANK,
  expenses: evaluateAnomalies(INITIAL_MOCK_TRANSACTIONS),
  ui: {
    activeModal: null,
    selectedExpense: null,
    activeWhyAnomaly: null,
    toast: null,
    isProcessing: false,
    projectionPrefillAmount: undefined
  }
};

export type AppAction =
  | { type: 'LOGIN'; payload: UserProfile }
  | { type: 'SIGNUP'; payload: UserProfile }
  | { type: 'COMPLETE_ONBOARDING'; payload: Partial<AppState['preferences']> }
  | { type: 'LOGOUT' }
  | { type: 'RESET_DEMO_DATA' }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<AppState['preferences']> }
  | { type: 'UPDATE_SAVINGS_GOAL'; payload: Partial<SavingsGoal> }
  | { type: 'MARK_ANOMALY_PLANNED'; payload: string }
  | { type: 'SET_WHY_ANOMALY'; payload: Transaction | null }
  | { type: 'CONNECT_BANK'; payload: BankAccountState }
  | { type: 'DISCONNECT_BANK' }
  | { type: 'UPDATE_BANK_SYNC'; payload: { updatedTransactions: Transaction[]; newBalance: number; lastSynced: string } }
  | { type: 'ADD_EXPENSE'; payload: Transaction }
  | { type: 'UPDATE_EXPENSE'; payload: Transaction }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_ACTIVE_MODAL'; payload: string | null }
  | { type: 'SELECT_EXPENSE'; payload: Transaction | null }
  | { type: 'SET_TOAST'; payload: ToastMessage | null }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_PROJECTION_PREFILL'; payload: number | undefined }
  | {
      type: 'SET_PERSISTED_STATE';
      payload: {
        expenses?: Transaction[];
        bank?: BankAccountState;
        preferences?: Partial<AppState['preferences']>;
        savingsGoal?: SavingsGoal;
      };
    };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PERSISTED_STATE': {
      return {
        ...state,
        expenses: action.payload.expenses && action.payload.expenses.length > 0
          ? evaluateAnomalies(action.payload.expenses)
          : state.expenses,
        bank: action.payload.bank ? { ...state.bank, ...action.payload.bank } : state.bank,
        preferences: action.payload.preferences ? { ...state.preferences, ...action.payload.preferences } : state.preferences,
        savingsGoal: action.payload.savingsGoal ? { ...state.savingsGoal, ...action.payload.savingsGoal } : state.savingsGoal
      };
    }
    case 'LOGIN':
      return {
        ...state,
        auth: {
          user: action.payload,
          isAuthenticated: true,
          isOnboarded: true
        }
      };

    case 'SIGNUP':
      return {
        ...state,
        auth: {
          user: action.payload,
          isAuthenticated: true,
          isOnboarded: false
        }
      };

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        auth: {
          ...state.auth,
          isOnboarded: true
        },
        preferences: {
          ...state.preferences,
          ...action.payload
        },
        ui: {
          ...state.ui,
          toast: {
            id: Date.now().toString(),
            type: 'success',
            title: 'Welcome to Spendwise!',
            message: 'Your personal financial intelligence dashboard is ready.'
          }
        }
      };

    case 'LOGOUT':
      return {
        ...state,
        auth: {
          user: null,
          isAuthenticated: false,
          isOnboarded: false
        },
        ui: {
          ...state.ui,
          activeModal: null,
          selectedExpense: null,
          toast: {
            id: Date.now().toString(),
            type: 'info',
            title: 'Logged Out',
            message: 'You have been safely signed out of your demo session.'
          }
        }
      };

    case 'RESET_DEMO_DATA':
      return {
        ...INITIAL_STATE,
        ui: {
          ...INITIAL_STATE.ui,
          toast: {
            id: Date.now().toString(),
            type: 'info',
            title: 'Demo Data Restored',
            message: 'Default transactions, bank balance, and categories have been reset.'
          }
        }
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        },
        ui: {
          ...state.ui,
          toast: {
            id: Date.now().toString(),
            type: 'success',
            title: 'Preferences Updated',
            message: 'Your spending profile and targets have been saved.'
          }
        }
      };

    case 'CONNECT_BANK':
      return {
        ...state,
        bank: action.payload,
        ui: {
          ...state.ui,
          activeModal: null,
          toast: {
            id: Date.now().toString(),
            type: 'success',
            title: 'Bank Account Linked',
            message: `Successfully connected ${action.payload.bankName} (${action.payload.maskedAccountNumber}).`
          }
        }
      };

    case 'DISCONNECT_BANK':
      return {
        ...state,
        bank: {
          isConnected: false,
          bankName: null,
          accountType: null,
          maskedAccountNumber: null,
          currentBalance: 0,
          availableBalance: 0,
          lastSynced: null,
          syncStatus: 'not_connected'
        },
        ui: {
          ...state.ui,
          toast: {
            id: Date.now().toString(),
            type: 'info',
            title: 'Bank Disconnected',
            message: 'Your simulated bank connection has been removed.'
          }
        }
      };

    case 'UPDATE_BANK_SYNC':
      return {
        ...state,
        bank: {
          ...state.bank,
          currentBalance: action.payload.newBalance,
          availableBalance: action.payload.newBalance,
          lastSynced: action.payload.lastSynced,
          syncStatus: 'connected'
        },
        expenses: action.payload.updatedTransactions,
        ui: {
          ...state.ui,
          toast: {
            id: Date.now().toString(),
            type: 'success',
            title: 'Transactions Synchronized',
            message: 'Latest mock bank statements and classifications are up to date.'
          }
        }
      };

    case 'ADD_EXPENSE': {
      const merged = [action.payload, ...state.expenses];
      const withAnomalies = evaluateAnomalies(merged);
      return {
        ...state,
        expenses: withAnomalies,
        ui: {
          ...state.ui,
          activeModal: null,
          toast: {
            id: Date.now().toString(),
            type: 'success',
            title: 'Expense Added Successfully',
            message: `${action.payload.merchant} (₹${action.payload.amount.toLocaleString('en-IN')}) classified under ${action.payload.category}.`
          }
        }
      };
    }

    case 'UPDATE_EXPENSE': {
      const updated = state.expenses.map(e => e.id === action.payload.id ? action.payload : e);
      const withAnomalies = evaluateAnomalies(updated);
      return {
        ...state,
        expenses: withAnomalies,
        ui: {
          ...state.ui,
          selectedExpense: action.payload,
          toast: {
            id: Date.now().toString(),
            type: 'success',
            title: 'Expense Updated',
            message: 'Changes saved successfully.'
          }
        }
      };
    }

    case 'DELETE_EXPENSE': {
      const remaining = state.expenses.filter(e => e.id !== action.payload);
      const withAnomalies = evaluateAnomalies(remaining);
      return {
        ...state,
        expenses: withAnomalies,
        ui: {
          ...state.ui,
          selectedExpense: null,
          toast: {
            id: Date.now().toString(),
            type: 'info',
            title: 'Expense Removed',
            message: 'The transaction has been deleted from your history.'
          }
        }
      };
    }

    case 'SET_ACTIVE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeModal: action.payload
        }
      };

    case 'SELECT_EXPENSE':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedExpense: action.payload
        }
      };

    case 'SET_TOAST':
      return {
        ...state,
        ui: {
          ...state.ui,
          toast: action.payload
        }
      };

    case 'SET_PROCESSING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isProcessing: action.payload
        }
      };

    case 'UPDATE_SAVINGS_GOAL': {
      const currentGoal = state.savingsGoal || INITIAL_STATE.savingsGoal;
      const updatedGoal = {
        ...currentGoal,
        ...action.payload
      };
      // Auto-recalculate monthly contribution needed if target or date changes
      const remainingTarget = Math.max(0, (updatedGoal.targetAmount || 0) - (updatedGoal.currentAmount || 0));
      // Rough months to target date (assumes ~12 months default or parses date)
      const months = 12;
      updatedGoal.monthlyContributionNeeded = Math.round(remainingTarget / months);

      return {
        ...state,
        savingsGoal: updatedGoal,
        ui: {
          ...state.ui,
          activeModal: null,
          toast: {
            id: Date.now().toString(),
            type: 'success',
            title: 'Goal Adjusted',
            message: `Target updated: ${updatedGoal.name || 'Emergency Fund'} (₹${(updatedGoal.targetAmount || 0).toLocaleString('en-IN')})`
          }
        }
      };
    }

    case 'MARK_ANOMALY_PLANNED': {
      const updatedExpenses = state.expenses.map(e => {
        if (e.id === action.payload) {
          return {
            ...e,
            isAnomaly: false,
            anomalyAcknowledged: true,
            notes: (e.notes ? `${e.notes} · ` : '') + 'Verified as planned expense'
          };
        }
        return e;
      });

      return {
        ...state,
        expenses: updatedExpenses,
        ui: {
          ...state.ui,
          activeWhyAnomaly: null,
          toast: {
            id: Date.now().toString(),
            type: 'info',
            title: 'Outlier Acknowledged',
            message: 'Expense marked as planned. Anomaly alert suppressed.'
          }
        }
      };
    }

    case 'SET_WHY_ANOMALY':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeWhyAnomaly: action.payload
        }
      };

    case 'SET_PROJECTION_PREFILL':
      return {
        ...state,
        ui: {
          ...state.ui,
          projectionPrefillAmount: action.payload
        }
      };

    default:
      return state;
  }
}
