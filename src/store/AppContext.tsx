import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { AppState, AppAction, appReducer, INITIAL_STATE, ToastMessage, SavingsGoal } from './appReducer';
import { loadStoredState, saveStoredState } from '../utils/storage';
import { computeAnalytics, AnalyticsSummary } from '../services/analyticsService';
import { generateSmartInsights, generateSavingsSuggestions, SmartInsight, SavingsSuggestion } from '../services/insightService';
import { Transaction } from '../data/mockTransactions';
import { BankAccountState } from '../data/mockBankAccount';
import { UserProfile, INITIAL_MOCK_USER } from '../data/mockUser';
import { apiService } from '../services/apiService';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  analytics: AnalyticsSummary;
  insights: SmartInsight[];
  savingsSuggestions: SavingsSuggestion[];
  // Convenience action helpers
  login: (user: UserProfile) => void;
  signup: (user: UserProfile) => void;
  logout: () => void;
  resetDemoData: () => void;
  addExpense: (expense: Transaction) => void;
  updateExpense: (expense: Transaction) => void;
  deleteExpense: (id: string) => void;
  connectBank: (bank: BankAccountState) => void;
  disconnectBank: () => void;
  openModal: (modalName: string) => void;
  closeModal: () => void;
  selectExpense: (expense: Transaction | null) => void;
  openWhyAnomaly: (expense: Transaction | null) => void;
  closeWhyAnomaly: () => void;
  markAnomalyPlanned: (id: string) => void;
  updateSavingsGoal: (goal: Partial<SavingsGoal>) => void;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  setProjectionPrefill: (amount: number | undefined) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE, () => {
    try {
      const saved = loadStoredState<AppState>();
      if (saved && saved.auth && saved.expenses && Array.isArray(saved.expenses)) {
        const merged: AppState = {
          ...INITIAL_STATE,
          ...saved,
          auth: {
            ...INITIAL_STATE.auth,
            ...(saved.auth || {}),
            user: saved.auth.user
              ? {
                  ...(saved.auth.user.id === INITIAL_MOCK_USER.id ? INITIAL_MOCK_USER : {}),
                  ...saved.auth.user,
                  avatarUrl: saved.auth.user.id === INITIAL_MOCK_USER.id ? INITIAL_MOCK_USER.avatarUrl : saved.auth.user.avatarUrl
                }
              : null
          },
          preferences: {
            ...INITIAL_STATE.preferences,
            ...(saved.preferences || {})
          },
          savingsGoal: {
            ...INITIAL_STATE.savingsGoal,
            ...(saved.savingsGoal || {})
          },
          bank: {
            ...INITIAL_STATE.bank,
            ...(saved.bank || {})
          },
          ui: {
            ...INITIAL_STATE.ui,
            ...(saved.ui || {}),
            activeModal: null,
            activeWhyAnomaly: null,
            toast: null
          }
        };
        return merged;
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
    return INITIAL_STATE;
  });

  // Save to localStorage on state changes
  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  // Fetch persisted data from MongoDB backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      try {
        const [expenses, bank, preferences, savingsGoal] = await Promise.all([
          apiService.getExpenses(),
          apiService.getBank(),
          apiService.getPreferences(),
          apiService.getSavingsGoal()
        ]);
        if (!isMounted) return;
        if (expenses && expenses.length > 0) {
          dispatch({
            type: 'SET_PERSISTED_STATE',
            payload: {
              expenses,
              bank: bank || undefined,
              preferences: preferences || undefined,
              savingsGoal: savingsGoal || undefined
            }
          });
        }
      } catch (err) {
        console.warn('[Spendwise Context] Could not load state from API, continuing with local state:', err);
      }
    }
    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live analytics from current expenses and preferences
  const analytics = useMemo(() => {
    return computeAnalytics(
      state.expenses,
      state.preferences.monthlyIncome,
      state.preferences.monthlyBudget,
      '2026-09',
      '2026-08'
    );
  }, [state.expenses, state.preferences.monthlyIncome, state.preferences.monthlyBudget]);

  // Compute live smart insights
  const insights = useMemo(() => {
    return generateSmartInsights(state.expenses, analytics, state.preferences.monthlyBudget);
  }, [state.expenses, analytics, state.preferences.monthlyBudget]);

  // Compute live savings suggestions
  const savingsSuggestions = useMemo(() => {
    return generateSavingsSuggestions(analytics);
  }, [analytics]);

  const login = (user: UserProfile) => dispatch({ type: 'LOGIN', payload: user });
  const signup = (user: UserProfile) => dispatch({ type: 'SIGNUP', payload: user });
  const logout = () => dispatch({ type: 'LOGOUT' });

  const resetDemoData = () => {
    dispatch({ type: 'RESET_DEMO_DATA' });
    apiService.resetDatabase();
  };

  const addExpense = (expense: Transaction) => {
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
    apiService.createExpense(expense);
  };

  const updateExpense = (expense: Transaction) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
    apiService.updateExpense(expense.id, expense);
  };

  const deleteExpense = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
    apiService.deleteExpense(id);
  };

  const connectBank = (bank: BankAccountState) => {
    dispatch({ type: 'CONNECT_BANK', payload: bank });
    apiService.updateBank(bank);
  };

  const disconnectBank = () => {
    dispatch({ type: 'DISCONNECT_BANK' });
    apiService.updateBank({
      isConnected: false,
      bankName: null,
      accountType: null,
      maskedAccountNumber: null,
      currentBalance: 0,
      availableBalance: 0,
      lastSynced: null,
      syncStatus: 'disconnected'
    });
  };

  const openModal = (modalName: string) => dispatch({ type: 'SET_ACTIVE_MODAL', payload: modalName });
  const closeModal = () => dispatch({ type: 'SET_ACTIVE_MODAL', payload: null });
  const selectExpense = (expense: Transaction | null) => dispatch({ type: 'SELECT_EXPENSE', payload: expense });
  const openWhyAnomaly = (expense: Transaction | null) => dispatch({ type: 'SET_WHY_ANOMALY', payload: expense });
  const closeWhyAnomaly = () => dispatch({ type: 'SET_WHY_ANOMALY', payload: null });

  const markAnomalyPlanned = (id: string) => {
    dispatch({ type: 'MARK_ANOMALY_PLANNED', payload: id });
    apiService.updateExpense(id, { isAnomaly: false, anomalyAcknowledged: true });
  };

  const updateSavingsGoal = (goal: Partial<SavingsGoal>) => {
    dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: goal });
    apiService.updateSavingsGoal(goal);
  };
  const setProjectionPrefill = (amount: number | undefined) => dispatch({ type: 'SET_PROJECTION_PREFILL', payload: amount });
  
  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const fullToast: ToastMessage = { ...toast, id: Date.now().toString() };
    dispatch({ type: 'SET_TOAST', payload: fullToast });
    setTimeout(() => {
      dispatch({ type: 'SET_TOAST', payload: null });
    }, 4000);
  };

  const value: AppContextValue = {
    state,
    dispatch,
    analytics,
    insights,
    savingsSuggestions,
    login,
    signup,
    logout,
    resetDemoData,
    addExpense,
    updateExpense,
    deleteExpense,
    connectBank,
    disconnectBank,
    openModal,
    closeModal,
    selectExpense,
    openWhyAnomaly,
    closeWhyAnomaly,
    markAnomalyPlanned,
    updateSavingsGoal,
    showToast,
    setProjectionPrefill
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
