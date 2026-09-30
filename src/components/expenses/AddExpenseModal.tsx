import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../store/AppContext';
import { classifyExpense, ClassificationResult } from '../../services/classificationService';
import { CATEGORY_NAMES, getCategoryMeta } from '../../data/categories';
import { isValidAmount } from '../../utils/validation';
import { formatINR } from '../../utils/currency';
import { Check, CheckCircle2, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'input' | 'processing' | 'review';

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense } = useApp();

  const [step, setStep] = useState<Step>('input');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-09-30');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Net Banking'>('Cash');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Processing animation steps
  const [processingStage, setProcessingStage] = useState(0);

  // Classification result
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Other');
  const [isChangingCategory, setIsChangingCategory] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setMerchant('');
      setAmount('');
      setDate('2026-09-30');
      setPaymentMethod('Cash');
      setNotes('');
      setValidationError(null);
      setProcessingStage(0);
      setIsChangingCategory(false);
    }
  }, [isOpen]);

  const handleSubmitInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim()) {
      setValidationError('Please enter a merchant name or expense description.');
      return;
    }
    const amountVal = parseFloat(amount);
    const amountCheck = isValidAmount(amountVal);
    if (!amountCheck.valid) {
      setValidationError(amountCheck.message || 'Invalid amount.');
      return;
    }

    setValidationError(null);
    setStep('processing');
    setProcessingStage(1);

    // Simulate multi-step classification engine
    setTimeout(() => setProcessingStage(2), 400);
    setTimeout(() => setProcessingStage(3), 850);
    setTimeout(() => {
      setProcessingStage(4);
      const result = classifyExpense(merchant, notes);
      setClassification(result);
      setSelectedCategory(result.category);
      setStep('review');
    }, 1300);
  };

  const handleFinalConfirm = () => {
    const amountVal = parseFloat(amount);
    const newTxn = {
      id: `manual-txn-${Date.now()}`,
      merchant: merchant.trim(),
      description: notes.trim() || merchant.trim(),
      amount: amountVal,
      date,
      category: selectedCategory,
      paymentMethod,
      source: 'manual' as const,
      status: 'confirmed' as const,
      confidence: selectedCategory === classification?.category ? (classification?.confidence || 0.95) : 1.0,
      classificationReason:
        selectedCategory === classification?.category
          ? (classification?.reason || 'Automatic classification')
          : `User selected category: ${selectedCategory}`,
      isAnomaly: false,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    addExpense(newTxn);
    onClose();
  };

  // Demo presets for quick testing
  const applyPreset = (presetMerchant: string, presetAmount: number, presetMethod: 'Cash' | 'UPI' | 'Card', presetNotes: string) => {
    setMerchant(presetMerchant);
    setAmount(presetAmount.toString());
    setPaymentMethod(presetMethod);
    setNotes(presetNotes);
    setValidationError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'input' ? 'Add New Expense' : step === 'processing' ? 'Automated Intelligence' : 'Confirm Classification'}
      subtitle={
        step === 'input'
          ? 'Enter your manual cash, UPI, or card purchase.'
          : step === 'processing'
          ? 'Spendwise is analyzing and categorizing your transaction.'
          : 'Review the automatically assigned category.'
      }
    >
      {/* STEP 1: INPUT FORM */}
      {step === 'input' && (
        <form onSubmit={handleSubmitInput} className="space-y-4">
          {/* Quick presets for hackathon demo */}
          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">
              Quick Demo Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('Lunch with friends', 500, 'Cash', 'Team lunch at cafe')}
                className="text-xs px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 rounded border border-slate-200 text-slate-700 transition-colors"
              >
                🍛 Lunch with friends (₹500 Cash)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('Auto rickshaw commute', 120, 'Cash', 'Metro to office')}
                className="text-xs px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 rounded border border-slate-200 text-slate-700 transition-colors"
              >
                🛺 Auto commute (₹120 Cash)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('Medicine from local chemist', 450, 'UPI', 'Cough syrup & paracetamol')}
                className="text-xs px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 rounded border border-slate-200 text-slate-700 transition-colors"
              >
                💊 Chemist (₹450 UPI)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Merchant or Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
              placeholder="e.g. Lunch with friends, Swiggy, Uber..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              No need to choose a category yet — Spendwise will detect it automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 font-mono"
                  data-tabular
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Cash', 'UPI', 'Card', 'Net Banking'] as const).map(method => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 text-xs font-medium rounded-lg border text-center transition-all ${
                    paymentMethod === method
                      ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-semibold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Optional Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Paid in cash, split with Rohit"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {validationError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <span>Analyze & Classify</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: MULTI-STEP PROCESSING STATE */}
      {step === 'processing' && (
        <div className="py-6 space-y-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin duration-1000" />
          </div>

          <div>
            <h4 className="text-base font-semibold text-slate-900">Analyzing Expense...</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluating merchant tokens and semantic classification rules
            </p>
          </div>

          <div className="max-w-xs mx-auto space-y-2.5 text-left text-xs">
            <div className={`flex items-center gap-2.5 ${processingStage >= 1 ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
              <CheckCircle2 className={`w-4 h-4 ${processingStage >= 1 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Validating transaction parameters</span>
            </div>
            <div className={`flex items-center gap-2.5 ${processingStage >= 2 ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
              <CheckCircle2 className={`w-4 h-4 ${processingStage >= 2 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Identifying merchant & keyword signatures</span>
            </div>
            <div className={`flex items-center gap-2.5 ${processingStage >= 3 ? 'text-blue-700 font-medium' : 'text-slate-400'}`}>
              {processingStage >= 3 ? (
                <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300" />
              )}
              <span>Classifying category & computing confidence</span>
            </div>
            <div className={`flex items-center gap-2.5 ${processingStage >= 4 ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
              {processingStage >= 4 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300" />
              )}
              <span>Checking historical spending pattern anomalies</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CLASSIFICATION REVIEW */}
      {step === 'review' && classification && (
        <div className="space-y-5">
          {/* Summary Box */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Expense Added
                </span>
                <p className="text-base font-semibold text-slate-900 mt-0.5">{merchant}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>{date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{paymentMethod}</span>
                  <span aria-hidden="true">·</span>
                  <span>Manual Entry</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-slate-900 font-mono" data-tabular>
                  {formatINR(parseFloat(amount) || 0)}
                </span>
              </div>
            </div>

            {/* Classification Badge Card */}
            <div className="p-3 bg-white border border-slate-200/90 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Detected Category</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCategoryMeta(selectedCategory).color }}
                  />
                  <span className="text-sm font-semibold text-slate-900">{selectedCategory}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Confidence</span>
                <span className={`text-xs font-semibold font-mono ${classification.confidence >= 0.85 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {Math.round((selectedCategory === classification.category ? classification.confidence : 1) * 100)}%
                </span>
              </div>
            </div>

            {/* Reason */}
            <div className="text-xs text-slate-600 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
              <span>
                <strong>Reason: </strong>
                {classification.reason}
              </span>
            </div>

            {classification.confidence < 0.70 && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200/80">
                Confidence is moderate. You can confirm this or select a more accurate category below.
              </p>
            )}
          </div>

          {/* Change Category Selector (Expandable) */}
          {isChangingCategory ? (
            <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="block text-xs font-semibold text-slate-700">
                Select Correct Category:
              </label>
              <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {CATEGORY_NAMES.map(cat => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsChangingCategory(false);
                    }}
                    className={`px-2.5 py-1.5 text-xs text-left rounded border transition-colors flex items-center gap-1.5 ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white border-blue-600 font-medium'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: getCategoryMeta(cat).color }}
                    />
                    <span className="truncate">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsChangingCategory(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium underline-offset-2 hover:underline block"
            >
              Category incorrect? Click here to change category
            </button>
          )}

          {/* Final Action Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep('input')}
              className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Back to Edit
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Save Expense</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
