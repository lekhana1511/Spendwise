import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { AddExpenseModal } from '../expenses/AddExpenseModal';
import { BankConnectModal } from '../bank/BankConnectModal';
import { CsvImportModal } from '../expenses/CsvImportModal';
import { ExpenseDetailDrawer } from '../expenses/ExpenseDetailDrawer';
import { AnomalyWhyModal } from '../expenses/AnomalyWhyModal';
import { Toast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { useApp } from '../../store/AppContext';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { state, openModal, closeModal, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const activeModal = state.ui.activeModal;

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Toast Notification Container */}
      <Toast />

      {/* Sidebar */}
      <Sidebar
        onAddExpenseClick={() => openModal('add_expense')}
        onLogoutClick={() => setShowLogoutConfirm(true)}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <TopNav
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          onAddExpenseClick={() => openModal('add_expense')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <AddExpenseModal
        isOpen={activeModal === 'add_expense'}
        onClose={closeModal}
      />

      <BankConnectModal
        isOpen={activeModal === 'bank_connect'}
        onClose={closeModal}
      />

      <CsvImportModal
        isOpen={activeModal === 'csv_import'}
        onClose={closeModal}
      />

      <ExpenseDetailDrawer />

      <AnomalyWhyModal />

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Sign Out of Spendwise"
        subtitle="Are you sure you want to end your demo session?"
        maxWidth="max-w-sm"
      >
        <p className="text-xs text-slate-600 leading-relaxed mb-5">
          Your active demo transactions and balance are safely stored in your browser's local storage and will be ready when you return.
        </p>
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(false)}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
          >
            Confirm Logout
          </button>
        </div>
      </Modal>
    </div>
  );
};
