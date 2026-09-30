import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../store/AppContext';
import { AVAILABLE_DEMO_BANKS } from '../../data/mockBankAccount';
import { simulateBankConnection, simulateBankSync } from '../../services/bankService';
import { Building2, CheckCircle2, ShieldCheck, RefreshCw, Unlink } from 'lucide-react';
import { formatINR } from '../../utils/currency';

interface BankConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BankConnectModal: React.FC<BankConnectModalProps> = ({ isOpen, onClose }) => {
  const { state, connectBank, disconnectBank, dispatch, showToast } = useApp();
  const bank = state.bank;

  const [selectedBankCode, setSelectedBankCode] = useState(AVAILABLE_DEMO_BANKS[0].code);
  const [connecting, setConnecting] = useState(false);
  const [connectStage, setConnectStage] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const handleStartConnection = async () => {
    setConnecting(true);
    setConnectStage(1);

    setTimeout(() => setConnectStage(2), 500);
    setTimeout(() => setConnectStage(3), 1000);

    setTimeout(async () => {
      const newBank = await simulateBankConnection(selectedBankCode);
      connectBank(newBank);
      setConnecting(false);
      setConnectStage(0);
      onClose();
    }, 1500);
  };

  const handleSyncTransactions = async () => {
    try {
      setSyncing(true);
      const res = await simulateBankSync(state.expenses, state.bank.currentBalance);
      dispatch({
        type: 'UPDATE_BANK_SYNC',
        payload: {
          updatedTransactions: res.updatedTransactions,
          newBalance: res.newBalance,
          lastSynced: new Date().toISOString()
        }
      });
      showToast({
        type: 'success',
        title: 'Sync Complete',
        message: `${res.addedTransactionsCount} transactions imported (${res.automaticallyClassified} auto-classified, ${res.needsReviewCount} review needed)`
      });
      onClose();
    } catch {
      showToast({
        type: 'error',
        title: 'Sync Error',
        message: 'Could not sync bank transactions.'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = () => {
    disconnectBank();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bank.isConnected ? 'Manage Demo Bank Connection' : 'Connect Demo Bank Account'}
      subtitle="Simulate open banking API connection using realistic Indian banking records."
    >
      {/* SIMULATED LABEL DISCLAIMER */}
      <div className="mb-5 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-xs text-blue-800">
        <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold block">Simulated Sandbox Environment</span>
          <span className="text-blue-700/90 leading-relaxed">
            This demo uses fictional transactions for prototyping. No real credentials or live banking connections are requested or stored.
          </span>
        </div>
      </div>

      {bank.isConnected ? (
        /* ALREADY CONNECTED VIEW */
        <div className="space-y-5">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-blue-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {bank.bankName?.slice(0, 4) || 'BANK'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{bank.bankName}</h4>
                  <p className="text-xs text-slate-500">{bank.accountType}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Connected
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Account Number</span>
                <span className="font-medium text-slate-800 font-mono" data-tabular>
                  {bank.maskedAccountNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Balance</span>
                <span className="font-bold text-slate-900 font-mono" data-tabular>
                  {formatINR(bank.currentBalance)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1">
              Last synced:{' '}
              {bank.lastSynced
                ? new Date(bank.lastSynced).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Just now'}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleDisconnect}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-800 p-2 rounded hover:bg-rose-50 transition-colors"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span>Disconnect Bank</span>
            </button>

            <button
              type="button"
              onClick={handleSyncTransactions}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Synchronizing...' : 'Sync Transactions Now'}</span>
            </button>
          </div>
        </div>
      ) : connecting ? (
        /* CONNECTING ANIMATION */
        <div className="py-6 text-center space-y-5">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-base font-semibold text-slate-900">Connecting Securely...</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulating Open Banking Account Aggregator handshake
            </p>
          </div>

          <div className="max-w-xs mx-auto space-y-2 text-left text-xs">
            <div className={`flex items-center gap-2 ${connectStage >= 1 ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
              <CheckCircle2 className={`w-4 h-4 ${connectStage >= 1 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Handshake with Demo Bank Gateway</span>
            </div>
            <div className={`flex items-center gap-2 ${connectStage >= 2 ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
              <CheckCircle2 className={`w-4 h-4 ${connectStage >= 2 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Account credentials verified</span>
            </div>
            <div className={`flex items-center gap-2 ${connectStage >= 3 ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
              <CheckCircle2 className={`w-4 h-4 ${connectStage >= 3 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Simulated statements loaded</span>
            </div>
          </div>
        </div>
      ) : (
        /* BANK SELECTION LIST */
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-slate-700">
            Select a Demo Financial Institution:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {AVAILABLE_DEMO_BANKS.map(item => (
              <button
                type="button"
                key={item.code}
                onClick={() => setSelectedBankCode(item.code)}
                className={`p-3 text-left rounded-xl border transition-all flex items-start gap-3 ${
                  selectedBankCode === item.code
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0"
                  style={{ backgroundColor: item.logoColor }}
                >
                  {item.code}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{item.accountType}</p>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1" data-tabular>
                    {item.defaultMask}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartConnection}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Connect & Authorize</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
