/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ValuationInputs, ValuationResults } from '../types/bto';
import { formatSgd, formatPct } from '../utils/calculator';
import { FLOOR_TIERS, FACING_OPTIONS } from '../data/btoData';
import {
  TrendingUp,
  Clock,
  Coins,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface ValuationDashboardProps {
  valInputs: ValuationInputs;
  valResults: ValuationResults;
}

export const ValuationDashboard: React.FC<ValuationDashboardProps> = ({
  valInputs,
  valResults,
}) => {
  const { project, flatType, floorLevelTier, floorNumber, facing } = valInputs;
  const unitSpec = project.flatTypes[flatType];
  const floorTier = FLOOR_TIERS[floorLevelTier];

  return (
    <div className="space-y-6">
      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Estimated MOP Resale Valuation */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
            <span>Est. MOP Resale Value</span>
            <span className="font-mono text-slate-700 font-semibold">{valResults.mopYear} MOP</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {formatSgd(valResults.projectedMopResaleValue)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800 font-mono">S$ {valResults.projectedPsf} psf</span>
            <span className="text-slate-300">·</span>
            <span>{unitSpec?.sqft} sqft ({unitSpec?.sqm} sqm)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Projected Growth:</span>
            <span className="font-semibold text-teal-700 font-mono">
              +{valResults.annualGrowthRatePct}% p.a.
            </span>
          </div>
        </div>

        {/* Card 2: Estimated Net Capital Gain */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
            <span>Estimated Net Profit</span>
            <span className="text-teal-700 font-semibold inline-flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {valResults.totalRoiPct}% ROI
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-700 tracking-tight font-mono">
            +{formatSgd(valResults.estimatedNetProfit)}
          </div>
          <div className="text-xs text-slate-600 mt-2">
            Net capital gain after subsidy clawback & fees
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Net Entry Cost:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {formatSgd(valResults.netPurchasePrice)}
            </span>
          </div>
        </div>

        {/* Card 3: Floor Elevation & View Premium */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
            <span>Floor & Orientation Premium</span>
            <span className="font-mono text-slate-700 font-semibold">#{floorNumber}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            +{formatSgd(valResults.floorPremiumAmount)}
          </div>
          <div className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{floorTier.label} ({formatPct(valResults.floorPremiumPct)})</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Facing Impact:</span>
            <span className={`font-semibold font-mono ${valResults.facingAdjustmentPct >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
              {formatPct(valResults.facingAdjustmentPct)}
            </span>
          </div>
        </div>

        {/* Card 4: Classification & Subsidy Clawback */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
            <span>Framework Model</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
              {project.classification}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {project.mopYears} Years
          </div>
          <div className="text-xs text-slate-600 mt-2">
            {project.classification === 'Standard'
              ? 'Zero subsidy clawback upon resale'
              : `${project.clawbackPct}% clawback on resale transacted price`}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Clawback Amount:</span>
            <span className="font-semibold text-rose-600 font-mono">
              {valResults.subsidyClawbackAmount > 0 ? `-${formatSgd(valResults.subsidyClawbackAmount)}` : 'S$ 0'}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Journey Visualizer */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-slate-700" />
          BTO Lifecycle & MOP Milestone Journey
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Milestone 1: Launch & Booking */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Milestone 1</span>
              <span className="text-xs font-mono font-bold text-slate-700">{project.launchYear}</span>
            </div>
            <div className="text-sm font-bold text-slate-900">BTO Launch & Booking</div>
            <p className="text-xs text-slate-600">
              Entry price locked at <span className="font-mono font-semibold text-slate-900">{formatSgd(valResults.originalPurchasePrice)}</span>. Initial downpayment paid with CPF OA/Cash.
            </p>
          </div>

          {/* Milestone 2: TOP & Key Collection */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Milestone 2</span>
              <span className="text-xs font-mono font-bold text-slate-700">Est. {project.estTopYear}</span>
            </div>
            <div className="text-sm font-bold text-slate-900">Key Collection (TOP)</div>
            <p className="text-xs text-slate-600">
              Keys issued, mortgage commencement, and start of official {project.mopYears}-year Minimum Occupation Period.
            </p>
          </div>

          {/* Milestone 3: MOP Complete & Full Liquidity */}
          <div className="p-4 rounded-lg bg-teal-50/70 border border-teal-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Milestone 3</span>
              <span className="text-xs font-mono font-bold text-teal-900">Year {valResults.mopYear}</span>
            </div>
            <div className="text-sm font-bold text-teal-950">MOP Attained (Full Liquidity)</div>
            <p className="text-xs text-teal-800">
              Permitted to sell on open resale market or rent out whole flat. Estimated value: <span className="font-mono font-bold">{formatSgd(valResults.projectedMopResaleValue)}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Financial Breakdown & Disclosures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Detailed Financial Waterfall Table */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Coins className="w-4 h-4 text-slate-700" />
            Financial Breakdown & Resale Proceeds Waterfall
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Original BTO Launch Price</span>
              <span className="font-mono font-semibold text-slate-900">{formatSgd(valResults.originalPurchasePrice)}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Less: Enhanced CPF Housing Grant (EHG)</span>
              <span className="font-mono font-semibold text-teal-700">- {formatSgd(valInputs.grantAmount)}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 bg-slate-50/70 px-2 rounded">
              <span className="font-medium text-slate-700">Net Outlay / Purchase Baseline</span>
              <span className="font-mono font-bold text-slate-900">{formatSgd(valResults.netPurchasePrice)}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Projected MOP Resale Value (Gross)</span>
              <span className="font-mono font-bold text-slate-900">{formatSgd(valResults.projectedMopResaleValue)}</span>
            </div>

            {valResults.subsidyClawbackAmount > 0 && (
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">
                  HDB Subsidy Clawback ({project.clawbackPct}% for {project.classification})
                </span>
                <span className="font-mono font-semibold text-rose-600">- {formatSgd(valResults.subsidyClawbackAmount)}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Est. Resale Fees (2% Agent + 9% GST + Legal)</span>
              <span className="font-mono font-semibold text-slate-600">- {formatSgd(valResults.estimatedResaleExpenses)}</span>
            </div>

            <div className="flex items-center justify-between py-2 bg-slate-900 text-white px-3 rounded-lg font-medium">
              <span>Estimated Net Capital Profit</span>
              <span className="font-mono font-bold text-sm text-emerald-400">
                +{formatSgd(valResults.estimatedNetProfit)} ({valResults.totalRoiPct}%)
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
            * Estimated CPF Accrued Interest (returned to your CPF OA upon sale, not lost): ~{formatSgd(valResults.estimatedCpfAccruedInterest)}.
          </p>
        </div>

        {/* Right: Policy & Eligibility Intelligence */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            HDB Policy Rules & Resale Eligibility Guardrails
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="font-semibold text-slate-900 mb-1">
                Classification: {project.classification} Framework
              </div>
              <p className="text-slate-600 leading-relaxed">
                {project.classification === 'Standard' &&
                  'Standard BTO flats have a 5-year MOP from key collection. No subsidy clawback upon resale. Subsequent resale buyers do not face income ceiling restrictions.'}
                {project.classification === 'Plus' &&
                  'Plus BTO flats have a 10-year MOP. Subsidy clawback is recovered by HDB upon first resale. Resale buyers must meet BTO eligibility rules including a S$14,000 household income ceiling.'}
                {project.classification === 'Prime' &&
                  'Prime (PLH) flats have a strict 10-year MOP and highest clawback percentage (typically 9%-12%). Subletting of the whole flat is prohibited even after MOP.'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="font-semibold text-slate-900 mb-1">
                Floor Elevation Advantage (Level #{floorNumber})
              </div>
              <p className="text-slate-600 leading-relaxed">
                Your unit sits in the <span className="font-semibold text-slate-800">{floorTier.label}</span> tier ({floorTier.floorRange}). Historical HDB transaction data shows an average premium of {floorTier.premiumPct}% over lower levels due to superior airflow, natural lighting, and sound isolation.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="font-semibold text-slate-900 mb-1">
                Facing Impact: {FACING_OPTIONS[facing]?.label}
              </div>
              <p className="text-slate-600 leading-relaxed">
                Facing orientation directly determines indoor thermal comfort and desirability. Units avoiding direct afternoon sun consistently command tighter price negotiations and quicker sales turnaround times.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
