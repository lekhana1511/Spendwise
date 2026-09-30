import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../store/AppContext';
import { classifyExpense } from '../../services/classificationService';
import { Transaction } from '../../data/mockTransactions';
import { formatINR } from '../../utils/currency';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, Download } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { state, addExpense, showToast } = useApp();

  const [rawRows, setRawRows] = useState<any[]>([]);
  const [analyzedRows, setAnalyzedRows] = useState<Transaction[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [stage, setStage] = useState<'upload' | 'preview'>('upload');

  // Sample CSV string generator
  const sampleCsvContent = `Date,Merchant,Amount,PaymentMethod,Notes
2026-09-29,Cult.fit Gym,3200,Net Banking,Quarterly renewal
2026-09-28,Blue Tokai Coffee,340,Card,Cold brew and croissant
2026-09-27,Zepto Grocery,425,UPI,Evening fruits & snacks
2026-09-26,Indian Oil Petrol,1500,Card,Two wheeler tank full
2026-09-25,Chaayos Cafe,180,Cash,Kulhad chai`;

  const parseCsvText = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      showToast({ type: 'error', title: 'Invalid CSV', message: 'The file has no data rows.' });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dateIdx = headers.findIndex(h => h.includes('date'));
    const merchantIdx = headers.findIndex(h => h.includes('merchant') || h.includes('desc'));
    const amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('price'));
    const methodIdx = headers.findIndex(h => h.includes('method') || h.includes('pay'));
    const notesIdx = headers.findIndex(h => h.includes('note'));

    if (dateIdx === -1 || merchantIdx === -1 || amountIdx === -1) {
      showToast({
        type: 'error',
        title: 'Missing Required Columns',
        message: 'CSV must contain Date, Merchant/Description, and Amount columns.'
      });
      return;
    }

    const parsed: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length >= 3) {
        parsed.push({
          date: cols[dateIdx] || '2026-09-30',
          merchant: cols[merchantIdx] || 'Imported Expense',
          amount: parseFloat(cols[amountIdx]) || 0,
          paymentMethod: (cols[methodIdx] as any) || 'UPI',
          notes: notesIdx !== -1 ? cols[notesIdx] : ''
        });
      }
    }

    processImportRows(parsed);
  };

  const processImportRows = (rows: any[]) => {
    const existingDescSet = new Set(state.expenses.map(e => `${e.merchant}-${e.amount}-${e.date}`));
    let dups = 0;
    const mapped: Transaction[] = [];

    rows.forEach((r, idx) => {
      const key = `${r.merchant}-${r.amount}-${r.date}`;
      if (existingDescSet.has(key)) {
        dups += 1;
      }
      const cls = classifyExpense(r.merchant, r.notes);
      mapped.push({
        id: `csv-${Date.now()}-${idx}`,
        merchant: r.merchant,
        description: r.notes || r.merchant,
        amount: r.amount,
        date: r.date,
        category: cls.category,
        paymentMethod: ['UPI', 'Card', 'Cash', 'Net Banking'].includes(r.paymentMethod) ? r.paymentMethod : 'UPI',
        source: 'bank',
        status: cls.confidence >= 0.80 ? 'confirmed' : 'pending_review',
        confidence: cls.confidence,
        classificationReason: cls.reason,
        isAnomaly: false,
        createdAt: new Date().toISOString()
      });
    });

    setRawRows(rows);
    setAnalyzedRows(mapped);
    setDuplicateCount(dups);
    setStage('preview');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        parseCsvText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    parseCsvText(sampleCsvContent);
  };

  const handleConfirmImport = () => {
    analyzedRows.forEach(row => {
      addExpense(row);
    });
    showToast({
      type: 'success',
      title: 'CSV Import Completed',
      message: `Successfully imported and categorized ${analyzedRows.length} transactions.`
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={stage === 'upload' ? 'Import Bank Statement (CSV)' : 'Review & Confirm Import'}
      subtitle={
        stage === 'upload'
          ? 'Upload an exported CSV statement from your bank or digital passbook.'
          : `${analyzedRows.length} transactions parsed and categorized automatically.`
      }
      maxWidth="max-w-2xl"
    >
      {stage === 'upload' ? (
        <div className="space-y-5">
          {/* Dropzone */}
          <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/20 transition-all block">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Click to select a CSV file or drag & drop here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports standard bank exports with Date, Merchant/Description, and Amount columns
            </p>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Quick Demo Sample Action */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Try sample bank statement CSV</p>
                <p className="text-[11px] text-slate-500">
                  Pre-formatted 5 Indian banking transactions ready for instant test import
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors shadow-2xs whitespace-nowrap"
            >
              <span>Load Sample CSV</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* STAGE 2: PREVIEW & REVIEW TABLE */
        <div className="space-y-4">
          {/* Summary Banner */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Total Rows</span>
              <span className="text-sm font-bold text-slate-900 font-mono" data-tabular>
                {analyzedRows.length}
              </span>
            </div>
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
              <span className="block text-[11px]">Auto Classified</span>
              <span className="text-sm font-bold font-mono" data-tabular>
                {analyzedRows.filter(r => r.confidence >= 0.80).length}
              </span>
            </div>
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
              <span className="block text-[11px]">Potential Duplicates</span>
              <span className="text-sm font-bold font-mono" data-tabular>
                {duplicateCount}
              </span>
            </div>
          </div>

          {/* Table Preview */}
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-3 py-2 font-semibold">Date</th>
                  <th className="px-3 py-2 font-semibold">Merchant</th>
                  <th className="px-3 py-2 font-semibold text-right">Amount</th>
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 font-semibold text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analyzedRows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{row.date}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{row.merchant}</td>
                    <td className="px-3 py-2 font-semibold text-slate-900 text-right font-mono" data-tabular>
                      {formatINR(row.amount)}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 text-slate-700">
                        {row.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-emerald-700">
                      {Math.round(row.confidence * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStage('upload')}
              className="text-xs text-slate-600 hover:text-slate-800"
            >
              Upload Different File
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Import {analyzedRows.length} Expenses</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
