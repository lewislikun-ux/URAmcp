/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ValuationInputs, ValuationResults, MortgageResults } from '../types/bto';
import { formatSgd } from '../utils/calculator';
import { TrendingUp, Landmark, LineChart, PiggyBank, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface GrowthTimelineProps {
  valInputs: ValuationInputs;
  valResults: ValuationResults;
  mortResults: MortgageResults;
}

export const GrowthTimeline: React.FC<GrowthTimelineProps> = ({
  valInputs,
  valResults,
  mortResults,
}) => {
  const { project } = valInputs;
  const launchYear = project.launchYear;
  const topYear = project.estTopYear;
  const mopYear = valResults.mopYear;
  const postMopYear5 = mopYear + 5;
  const postMopYear10 = mopYear + 10;

  // Compute projections across 5 distinct milestone epochs
  const milestones = [
    {
      label: 'BTO Launch Booking',
      year: launchYear,
      marketValue: valResults.originalPurchasePrice,
      loanBalance: mortResults.loanQuantum,
      equity: mortResults.downpaymentTotal,
      cpfPaid: mortResults.downpaymentCpf,
      status: 'Initial Commitment',
    },
    {
      label: 'Key Collection (TOP)',
      year: topYear,
      marketValue: Math.round(
        valResults.originalPurchasePrice *
          Math.pow(1 + valResults.annualGrowthRatePct / 100, Math.max(1, topYear - launchYear))
      ),
      loanBalance: Math.round(mortResults.loanQuantum * 0.96),
      equity: Math.round(valResults.originalPurchasePrice * 0.28),
      cpfPaid: Math.round(mortResults.downpaymentCpf + mortResults.monthlyCpfPortion * 12 * 2),
      status: 'Move-in & Start MOP',
    },
    {
      label: 'MOP Completion Date',
      year: mopYear,
      marketValue: valResults.projectedMopResaleValue,
      loanBalance: Math.max(
        0,
        Math.round(
          mortResults.loanQuantum *
            Math.max(0.3, 1 - (project.mopYears / (project.mopYears === 10 ? 25 : 25)) * 0.45)
        )
      ),
      equity: Math.round(
        valResults.projectedMopResaleValue -
          mortResults.loanQuantum * Math.max(0.3, 1 - (project.mopYears / 25) * 0.45)
      ),
      cpfPaid: Math.round(mortResults.downpaymentCpf + mortResults.monthlyCpfPortion * 12 * project.mopYears),
      status: 'Full Resale Liquidity',
    },
    {
      label: '+5 Yrs Post-MOP',
      year: postMopYear5,
      marketValue: Math.round(valResults.projectedMopResaleValue * Math.pow(1.032, 5)),
      loanBalance: Math.max(0, Math.round(mortResults.loanQuantum * 0.35)),
      equity: Math.round(
        valResults.projectedMopResaleValue * Math.pow(1.032, 5) - mortResults.loanQuantum * 0.35
      ),
      cpfPaid: Math.round(mortResults.downpaymentCpf + mortResults.monthlyCpfPortion * 12 * (project.mopYears + 5)),
      status: 'Upgrader Window',
    },
    {
      label: '+10 Yrs Post-MOP',
      year: postMopYear10,
      marketValue: Math.round(valResults.projectedMopResaleValue * Math.pow(1.028, 10)),
      loanBalance: Math.max(0, Math.round(mortResults.loanQuantum * 0.1)),
      equity: Math.round(
        valResults.projectedMopResaleValue * Math.pow(1.028, 10) - mortResults.loanQuantum * 0.1
      ),
      cpfPaid: Math.round(mortResults.downpaymentCpf + mortResults.monthlyCpfPortion * 12 * (project.mopYears + 10)),
      status: 'Mature Asset Holding',
    },
  ];

  // Compare with CPF OA 2.5% risk-free compounding
  const totalOutlayAtMop = mortResults.downpaymentTotal + mortResults.monthlyInstallment * 12 * project.mopYears;
  const cpfRiskFreeCompounded = Math.round(totalOutlayAtMop * Math.pow(1.025, project.mopYears));
  const btoOutperformance = Math.round(valResults.estimatedNetProfit);

  return (
    <div className="space-y-6">
      {/* Top Growth Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">
            Accumulated Home Equity at MOP
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-700 tracking-tight font-mono">
            {formatSgd(milestones[2].equity)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Net asset value (Market Value minus remaining loan balance)
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">
            BTO Wealth Creation vs CPF 2.5%
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            +{formatSgd(btoOutperformance)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Net capital gain over CPF risk-free baseline
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">
            MOP Milestone Year
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            Year {mopYear}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Eligible for open resale market or whole unit rental
          </div>
        </div>
      </div>

      {/* Visual Timeline Equity Growth Table & Progression */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <LineChart className="w-4 h-4 text-slate-700" />
            Long-Term Asset Trajectory & Debt Amortization Curve
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualizing the widening gap between property valuation growth and amortizing loan principal
          </p>
        </div>

        {/* Visual Progress Steps */}
        <div className="space-y-4">
          {milestones.map((ms, idx) => {
            const isMop = idx === 2;
            const maxVal = milestones[milestones.length - 1].marketValue;
            const widthPct = Math.round((ms.marketValue / maxVal) * 100);
            const equityPct = Math.round((ms.equity / ms.marketValue) * 100);

            return (
              <div
                key={ms.label}
                className={`p-3.5 rounded-xl border transition-all ${
                  isMop
                    ? 'border-teal-500/60 bg-teal-50/30 ring-1 ring-teal-500/30'
                    : 'border-slate-200/80 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {ms.year}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {ms.label}
                    </span>
                    {isMop && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                        MOP Attained
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Valuation: </span>
                      <span className="font-mono font-bold text-slate-900">{formatSgd(ms.marketValue)}</span>
                    </div>
                    <span className="text-slate-300">·</span>
                    <div>
                      <span className="text-slate-400">Net Equity: </span>
                      <span className="font-mono font-bold text-teal-700">{formatSgd(ms.equity)}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  {/* Equity portion (green) */}
                  <div
                    className="h-full bg-teal-600 transition-all duration-300"
                    style={{ width: `${(widthPct * equityPct) / 100}%` }}
                    title={`Equity: ${formatSgd(ms.equity)}`}
                  />
                  {/* Remaining Loan portion (slate) */}
                  <div
                    className="h-full bg-slate-400 transition-all duration-300"
                    style={{ width: `${(widthPct * (100 - equityPct)) / 100}%` }}
                    title={`Outstanding Loan: ${formatSgd(ms.loanBalance)}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>{equityPct}% Owned Equity ({formatSgd(ms.equity)})</span>
                  <span>Outstanding Loan: {formatSgd(ms.loanBalance)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-teal-600" />
            <span>Built Home Equity (Paid-down Principal & Capital Appreciation)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-400" />
            <span>Outstanding Mortgage Balance</span>
          </div>
        </div>
      </div>
    </div>
  );
};
