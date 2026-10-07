/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BtoProject, FlatType, TownResaleBenchmark } from '../types/bto';
import { RESALE_BENCHMARKS } from '../data/btoData';
import { formatSgd, formatPct } from '../utils/calculator';
import {
  BarChart3,
  Building,
  TrendingUp,
  Shield,
  ArrowRight,
  Sparkles,
  Info,
  Scale,
} from 'lucide-react';

interface ResaleComparisonProps {
  selectedProject: BtoProject;
  selectedFlatType: FlatType;
  btoPrice: number;
}

export const ResaleComparison: React.FC<ResaleComparisonProps> = ({
  selectedProject,
  selectedFlatType,
  btoPrice,
}) => {
  const [selectedTown, setSelectedTown] = useState<string>(selectedProject.town);

  const benchmark: TownResaleBenchmark =
    RESALE_BENCHMARKS[selectedTown] || RESALE_BENCHMARKS['Queenstown'];

  const unitSpec = selectedProject.flatTypes[selectedFlatType];
  const sqft = unitSpec?.sqft || 1001;
  const btoPsf = Math.round(btoPrice / sqft);

  const medianResaleForType =
    benchmark.medianPrices[selectedFlatType] ||
    benchmark.medianPrices['4-room'] ||
    750000;

  const resalePsfForType = Math.round(medianResaleForType / sqft);

  // Price gap analysis
  const priceSavings = Math.max(0, medianResaleForType - btoPrice);
  const discountPct = Math.round((priceSavings / medianResaleForType) * 100);

  // 5-year MOP cluster comparison
  const mopClusterPrice = benchmark.fiveYearMopMedianPrice4Room;
  const mopClusterPsf = benchmark.fiveYearMopAvgPsf;
  const mopGapPsf = mopClusterPsf - btoPsf;
  const mopDiscountPct = Math.round((mopGapPsf / mopClusterPsf) * 100);

  return (
    <div className="space-y-6">
      {/* Overview Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: BTO Entry PSF */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">
            Your BTO Entry PSF
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            S$ {btoPsf}
            <span className="text-xs text-slate-500 font-normal ml-1">psf</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Launch Price:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {formatSgd(btoPrice)}
            </span>
          </div>
        </div>

        {/* Card 2: Neighboring 5-Yr MOP Resale PSF */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">
            Neighboring 5-Yr MOP PSF
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            S$ {mopClusterPsf}
            <span className="text-xs text-slate-500 font-normal ml-1">psf</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Cluster:</span>
            <span className="font-semibold text-slate-800 truncate max-w-[130px]">
              {benchmark.fiveYearMopClusterName}
            </span>
          </div>
        </div>

        {/* Card 3: Instant Price Discount Buffer */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">
            Entry Price Discount Buffer
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-700 tracking-tight font-mono">
            ~{mopDiscountPct}%
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>PSF Discount Gap:</span>
            <span className="font-semibold text-teal-700 font-mono">
              S$ {mopGapPsf} psf buffer
            </span>
          </div>
        </div>

        {/* Card 4: Remaining Lease Advantage */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">
            Full 99-Yr Fresh Lease
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            +{(99 - benchmark.avgRemainingLeaseYears)} Yrs
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Avg Resale Lease:</span>
            <span className="font-semibold text-slate-800">
              {benchmark.avgRemainingLeaseYears} years left
            </span>
          </div>
        </div>
      </div>

      {/* Main Comparative Analysis Board */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-700" />
              Direct Resale Benchmark Comparison in {benchmark.town}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Based on official HDB secondary market transactions in the past 12 months
            </p>
          </div>

          {/* Town Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Compare Town:</span>
            <select
              value={selectedTown}
              onChange={(e) => setSelectedTown(e.target.value)}
              className="text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {Object.keys(RESALE_BENCHMARKS).map((town) => (
                <option key={town} value={town}>
                  {town}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Box 1: Your BTO Flat Specification */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your BTO Selection
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-200 font-semibold text-slate-800">
                Fresh Build
              </span>
            </div>

            <div className="text-lg font-bold text-slate-900">
              {selectedProject.name}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Flat Type:</span>
                <span className="font-semibold text-slate-900">{selectedFlatType.toUpperCase()} ({sqft} sqft)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">BTO Entry Price:</span>
                <span className="font-mono font-bold text-slate-900">{formatSgd(btoPrice)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Effective PSF:</span>
                <span className="font-mono font-bold text-slate-900">S$ {btoPsf} psf</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Remaining Lease:</span>
                <span className="font-semibold text-teal-700">Full 99 Years</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">MOP Commitment:</span>
                <span className="font-semibold text-slate-900">{selectedProject.mopYears} Years ({selectedProject.classification})</span>
              </div>
            </div>
          </div>

          {/* Box 2: Neighboring 5-Year MOP Resale Cluster */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Neighboring Benchmark Cluster
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-teal-100 font-semibold text-teal-800">
                5-8 Yr Resale
              </span>
            </div>

            <div className="text-lg font-bold text-slate-900">
              {benchmark.fiveYearMopClusterName}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-teal-200/60">
                <span className="text-slate-600">Town Median ({selectedFlatType}):</span>
                <span className="font-mono font-bold text-slate-900">{formatSgd(medianResaleForType)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-teal-200/60">
                <span className="text-slate-600">5-Yr MOP Cluster PSF:</span>
                <span className="font-mono font-bold text-slate-900">S$ {mopClusterPsf} psf</span>
              </div>
              <div className="flex justify-between py-1 border-b border-teal-200/60">
                <span className="text-slate-600">Price Gap Cushion:</span>
                <span className="font-mono font-bold text-teal-800">+{formatSgd(priceSavings)} ({discountPct}% discount)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-teal-200/60">
                <span className="text-slate-600">Remaining Lease:</span>
                <span className="font-semibold text-slate-700">~{benchmark.avgRemainingLeaseYears} Years</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Secondary Market Velocity:</span>
                <span className="font-semibold text-slate-900">{benchmark.recentTransactionsCount.toLocaleString()} units / yr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Town-wide Flat Type Price Matrix */}
        <div className="pt-2">
          <h4 className="text-xs font-semibold text-slate-900 mb-2">
            Town Resale Median Price Matrix for {benchmark.town}:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(benchmark.medianPrices).map(([type, price]) => (
              <div key={type} className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <div className="text-[11px] font-medium text-slate-500 uppercase">{type} Flat</div>
                <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">{formatSgd(price)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Est. {Math.round(price / (type === '3-room' ? 732 : type === '5-room' ? 1216 : 1001))} psf</div>
              </div>
            ))}
          </div>
        </div>

        {/* Insight Callout */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-900">Subsidized Entry Advantage: </span>
            You are acquiring your unit at an estimated <span className="font-semibold text-teal-800">{mopDiscountPct}% discount</span> compared to already MOP-ed units in {benchmark.town}. This built-in discount acts as a massive equity margin of safety against market downturns, while granting you a full 99-year lease restart.
          </div>
        </div>
      </div>
    </div>
  );
};
