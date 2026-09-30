export interface BankAccountState {
  isConnected: boolean;
  bankName: string | null;
  accountType: string | null;
  maskedAccountNumber: string | null;
  currentBalance: number;
  availableBalance: number;
  lastSynced: string | null;
  syncStatus: 'connected' | 'syncing' | 'not_connected' | 'error';
}

export const INITIAL_MOCK_BANK: BankAccountState = {
  isConnected: true,
  bankName: "HDFC Bank",
  accountType: "Savings Account",
  maskedAccountNumber: "XXXX XXXX 4521",
  currentBalance: 48650,
  availableBalance: 48650,
  lastSynced: "2026-09-30T09:42:00+05:30",
  syncStatus: "connected"
};

export const AVAILABLE_DEMO_BANKS = [
  {
    name: "HDFC Bank",
    code: "HDFC",
    accountType: "Salary Advantage Account",
    defaultMask: "XXXX XXXX 4521",
    logoColor: "#004C8F"
  },
  {
    name: "ICICI Bank",
    code: "ICICI",
    accountType: "Privilege Savings Account",
    defaultMask: "XXXX XXXX 8912",
    logoColor: "#BD3825"
  },
  {
    name: "State Bank of India",
    code: "SBI",
    accountType: "Regular Savings Account",
    defaultMask: "XXXX XXXX 3480",
    logoColor: "#280071"
  },
  {
    name: "Axis Bank",
    code: "AXIS",
    accountType: "Liberty Savings Account",
    defaultMask: "XXXX XXXX 6724",
    logoColor: "#97144D"
  }
];
