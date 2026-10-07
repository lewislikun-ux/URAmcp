/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ValuationInputs, ValuationResults, MortgageInputs, MortgageResults } from '../types/bto';
import { generateBtoValuationPdf } from '../utils/pdfExport';
import { formatSgd } from '../utils/calculator';
import { FileDown, Printer, X, CheckCircle2, Share2, Users, Building, ShieldCheck } from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  valInputs: ValuationInputs;
  valResults: ValuationResults;
  mortInputs: MortgageInputs;
  mortResults: MortgageResults;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  valInputs,
  valResults,
  mortInputs,
  mortResults,
}) => {
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      generateBtoValuationPdf(valInputs, valResults, mortInputs, mortResults);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.alert('Failed to generate PDF. You can also print the page directly.');
    } finally {
      setDownloading(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-slate-900 text-white">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Export BTO Valuation Report</h3>
              <p className="text-[11px] text-slate-500">Ready for sharing with family members and spouse</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Executive Summary Snapshot Preview */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-xs font-bold text-slate-900">
                {valInputs.project.name} ({valInputs.project.town})
              </span>
              <span className="text-xs font-mono font-semibold text-slate-700">
                {valInputs.flatType.toUpperCase()} · #{valInputs.floorNumber.toString().padStart(2, '0')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Original Entry Price:</span>
                <div className="font-mono font-bold text-slate-900 mt-0.5">
                  {formatSgd(valResults.originalPurchasePrice)}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Est. MOP Valuation ({valResults.mopYear}):</span>
                <div className="font-mono font-bold text-teal-700 mt-0.5">
                  {formatSgd(valResults.projectedMopResaleValue)}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Estimated Net Capital Profit:</span>
                <div className="font-mono font-bold text-teal-700 mt-0.5">
                  +{formatSgd(valResults.estimatedNetProfit)} ({valResults.totalRoiPct}%)
                </div>
              </div>
              <div>
                <span className="text-slate-500">Monthly Mortgage:</span>
                <div className="font-mono font-bold text-slate-900 mt-0.5">
                  {formatSgd(mortResults.monthlyInstallment)} / mo
                </div>
              </div>
            </div>
          </div>

          {/* Family Discussion Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-700" />
              Key Discussion Points for Family &amp; Partners:
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                <span>
                  <strong>MOP Holding Horizon:</strong> Flat cannot be sold or rented out whole until <strong>Year {valResults.mopYear}</strong> ({valInputs.project.mopYears}-year MOP framework).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                <span>
                  <strong>CPF OA Monthly Burden:</strong> Monthly installment is <strong>{formatSgd(mortResults.monthlyInstallment)}</strong> (CPF OA covers {formatSgd(mortResults.monthlyCpfPortion)}, Cash out-of-pocket is {formatSgd(mortResults.monthlyCashPortion)}).
                </span>
              </div>
              {valResults.subsidyClawbackAmount > 0 && (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>Subsidy Clawback:</strong> Under the {valInputs.project.classification} framework, ~{formatSgd(valResults.subsidyClawbackAmount)} ({valInputs.project.clawbackPct}%) must be repaid to HDB upon resale.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleBrowserPrint}
            className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white rounded-lg flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>{downloadSuccess ? 'Downloaded!' : downloading ? 'Generating PDF...' : 'Download Official PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
