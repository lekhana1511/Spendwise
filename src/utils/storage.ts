// LocalStorage persistence utility with versioning
const STORAGE_KEY = 'spendwise_state_v1';

export function loadStoredState<T>(): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('Failed to load Spendwise state from storage:', err);
    return null;
  }
}

export function saveStoredState<T>(state: T): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save Spendwise state to storage:', err);
  }
}

export function clearStoredState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear Spendwise state:', err);
  }
}
