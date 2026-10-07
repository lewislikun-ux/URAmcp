/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MortgageInputs, MortgageResults } from '../types/bto';
import { formatSgd } from '../utils/calculator';
import {
  Calculator,
  Percent,
  Wallet,
  ShieldCheck,
  AlertCircle,
  PiggyBank,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface MortgageCalculatorProps {
  mortInputs: MortgageInputs;
  setMortInputs: React.Dispatch<React.SetStateAction<MortgageInputs>>;
  mortResults: MortgageResults;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  mortInputs,
  setMortInputs,
  mortResults,
}) => {
  const handleLoanTypeToggle = (type: 'hdb' | 'bank') => {
    setMortInputs((prev) => ({
      ...prev,
      loanType: type,
      interestRatePct: type === 'hdb' ? 2.6 : 3.0,
      downpaymentPct: type === 'hdb' ? 20 : 25,
      loanTenureYears: type === 'hdb' ? Math.min(prev.loanTenureYears, 25) : prev.loanTenureYears,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Installment */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">
            Monthly Installment
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {formatSgd(mortResults.monthlyInstallment)}
            <span className="text-xs text-slate-500 font-normal ml-1">/ mo</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Loan Quantum:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {formatSgd(mortResults.loanQuantum)}
            </span>
          </div>
        </div>

        {/* CPF OA vs Cash Split */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">
            Out-of-Pocket Cash
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${mortResults.monthlyCashPortion > 0 ? 'text-amber-700' : 'text-teal-700'}`}>
            {formatSgd(mortResults.monthlyCashPortion)}
            <span className="text-xs text-slate-500 font-normal ml-1">/ mo</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">CPF OA Covers:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {formatSgd(mortResults.monthlyCpfPortion)} / mo
            </span>
          </div>
        </div>

        {/* Total Interest Over Tenure */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">
            Total Interest Payable
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {formatSgd(mortResults.totalInterestPaid)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Tenure:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {mortInputs.loanTenureYears} Years @ {mortInputs.interestRatePct}%
            </span>
          </div>
        </div>

        {/* MSR Ratio */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Mortgage Servicing (MSR)</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              mortResults.msrStatus === 'healthy'
                ? 'bg-emerald-50 text-emerald-700'
                : mortResults.msrStatus === 'caution'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-rose-50 text-rose-700'
            }`}>
              {mortResults.msrStatus.toUpperCase()}
            </span>
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
            mortResults.msrStatus === 'healthy'
              ? 'text-emerald-700'
              : mortResults.msrStatus === 'caution'
              ? 'text-amber-700'
              : 'text-rose-700'
          }`}>
            {mortResults.msrPct}%
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>HDB Statutory Cap:</span>
            <span className="font-semibold text-slate-700">Max 30% of Income</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Calculator Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Sliders & Inputs */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-slate-700" />
                Loan Structure & Financing Parameters
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate your exact monthly payments and CPF OA utilization
              </p>
            </div>

            {/* Loan Type Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => handleLoanTypeToggle('hdb')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  mortInputs.loanType === 'hdb'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                HDB Loan (2.6%)
              </button>
              <button
                type="button"
                onClick={() => handleLoanTypeToggle('bank')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  mortInputs.loanType === 'bank'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bank Loan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Interest Rate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Interest Rate (% p.a.)
                </label>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {mortInputs.interestRatePct}%
                </span>
              </div>
              <input
                type="number"
                step="0.05"
                min="1.0"
                max="6.0"
                value={mortInputs.interestRatePct}
                onChange={(e) =>
                  setMortInputs((p) => ({ ...p, interestRatePct: Number(e.target.value) || 2.6 }))
                }
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <p className="text-[11px] text-slate-400">
                {mortInputs.loanType === 'hdb'
                  ? 'Pegged to CPF OA rate + 0.1% = 2.60% fixed'
                  : 'Commercial bank 3M SORA package (floating/fixed)'}
              </p>
            </div>

            {/* Loan Tenure */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Loan Tenure (Years)
                </label>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {mortInputs.loanTenureYears} Years
                </span>
              </div>
              <input
                type="range"
                min="10"
                max={mortInputs.loanType === 'hdb' ? 25 : 30}
                value={mortInputs.loanTenureYears}
                onChange={(e) =>
                  setMortInputs((p) => ({ ...p, loanTenureYears: Number(e.target.value) }))
                }
                className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg mt-3"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10 yrs</span>
                <span>{mortInputs.loanType === 'hdb' ? 'Max 25 yrs (HDB limit)' : 'Max 30 yrs (Bank)'}</span>
              </div>
            </div>

            {/* Downpayment Percentage */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Downpayment Percentage
                </label>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {mortInputs.downpaymentPct}% ({formatSgd(mortResults.downpaymentTotal)})
                </span>
              </div>
              <input
                type="range"
                min={mortInputs.loanType === 'hdb' ? 20 : 25}
                max="50"
                step="5"
                value={mortInputs.downpaymentPct}
                onChange={(e) =>
                  setMortInputs((p) => ({ ...p, downpaymentPct: Number(e.target.value) }))
                }
                className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg mt-3"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Min {mortInputs.loanType === 'hdb' ? '20%' : '25%'}</span>
                <span>50%</span>
              </div>
            </div>

            {/* Downpayment from CPF OA */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Downpayment Paid with CPF OA
                </label>
                <span className="text-xs font-mono font-bold text-teal-700">
                  {formatSgd(mortInputs.downpaymentFromCpf)}
                </span>
              </div>
              <input
                type="number"
                step="5000"
                value={mortInputs.downpaymentFromCpf}
                onChange={(e) =>
                  setMortInputs((p) => ({ ...p, downpaymentFromCpf: Number(e.target.value) || 0 }))
                }
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <p className="text-[11px] text-slate-400">
                Remaining cash downpayment: {formatSgd(mortResults.downpaymentCash)}
              </p>
            </div>

            {/* Combined Monthly Household Income */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Combined Monthly Household Income
                </label>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {formatSgd(mortInputs.monthlyHouseholdIncome)}
                </span>
              </div>
              <input
                type="number"
                step="500"
                value={mortInputs.monthlyHouseholdIncome}
                onChange={(e) =>
                  setMortInputs((p) => ({ ...p, monthlyHouseholdIncome: Number(e.target.value) || 0 }))
                }
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <p className="text-[11px] text-slate-400">
                Used to compute statutory Mortgage Servicing Ratio (MSR)
              </p>
            </div>

            {/* Combined Monthly CPF OA Inflow */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Combined Monthly CPF OA Contribution
                </label>
                <span className="text-xs font-mono font-bold text-teal-700">
                  {formatSgd(mortInputs.monthlyCpfOaContribution)}
                </span>
              </div>
              <input
                type="number"
                step="100"
                value={mortInputs.monthlyCpfOaContribution}
                onChange={(e) =>
                  setMortInputs((p) => ({ ...p, monthlyCpfOaContribution: Number(e.target.value) || 0 }))
                }
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <p className="text-[11px] text-slate-400">
                Typically 23% of gross salary for Singapore citizens &lt; 35 years old
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: MSR Gauge & Health Check Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              Mortgage Affordability Audit
            </h3>

            {/* Visual MSR Progress Bar */}
            <div className="space-y-1.5 mt-3">
              <div className="flex justify-between text-xs font-medium text-slate-700">
                <span>MSR Utilization:</span>
                <span className="font-mono font-bold">{mortResults.msrPct}% / 30%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-300 ${
                    mortResults.msrStatus === 'healthy'
                      ? 'bg-emerald-500'
                      : mortResults.msrStatus === 'caution'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, (mortResults.msrPct / 30) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                <span>0% Safe</span>
                <span className="font-semibold text-slate-700">30% Max Legal Cap</span>
              </div>
            </div>

            {/* Diagnostic Message */}
            <div className={`mt-4 p-3 rounded-lg border text-xs leading-relaxed ${
              mortResults.msrStatus === 'healthy'
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : mortResults.msrStatus === 'caution'
                ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                : 'bg-rose-50/60 border-rose-200 text-rose-900'
            }`}>
              <div className="font-semibold flex items-center gap-1.5 mb-1">
                {mortResults.msrStatus === 'healthy' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                )}
                {mortResults.msrStatus === 'healthy'
                  ? 'Within Healthy Limits'
                  : mortResults.msrStatus === 'caution'
                  ? 'Approaching Statutory Limit'
                  : 'Exceeds Statutory 30% MSR Limit'}
              </div>
              <p>
                {mortResults.msrStatus === 'healthy' &&
                  `Your monthly mortgage is ${mortResults.msrPct}% of household income, well within the Monetary Authority of Singapore (MAS) and HDB 30% cap. No stress test concerns.`}
                {mortResults.msrStatus === 'caution' &&
                  `Your mortgage is at ${mortResults.msrPct}%, right near the 30% ceiling. Consider increasing your initial downpayment or extending tenure to maintain emergency cash flow.`}
                {mortResults.msrStatus === 'exceeded' &&
                  `HDB and financial institutions will NOT approve this loan quantum without higher downpayment or lower purchase quantum. Increase downpayment by at least S$30,000.`}
              </p>
            </div>
          </div>

          {/* Quick Summary Pill Box */}
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between">
              <span>Total Borrowed:</span>
              <span className="font-mono font-semibold text-slate-900">{formatSgd(mortResults.loanQuantum)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Interest Paid:</span>
              <span className="font-mono font-semibold text-slate-900">{formatSgd(mortResults.totalInterestPaid)}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-900 pt-1 border-t border-slate-100">
              <span>Total Lifetime Repayment:</span>
              <span className="font-mono font-bold">{formatSgd(mortResults.totalAmountRepaid)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
