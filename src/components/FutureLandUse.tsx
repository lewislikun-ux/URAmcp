/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LandUseCatalyst } from '../types/bto';
import { LAND_USE_CATALYSTS } from '../data/btoData';
import { formatPct } from '../utils/calculator';
import {
  Compass,
  Train,
  Briefcase,
  GraduationCap,
  Trees,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  Sparkles,
  Info,
} from 'lucide-react';

interface FutureLandUseProps {
  selectedCatalysts: string[];
  setSelectedCatalysts: React.Dispatch<React.SetStateAction<string[]>>;
}

export const FutureLandUse: React.FC<FutureLandUseProps> = ({
  selectedCatalysts,
  setSelectedCatalysts,
}) => {
  const toggleCatalyst = (id: string) => {
    setSelectedCatalysts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const positiveCatalysts = LAND_USE_CATALYSTS.filter((c) => c.type === 'positive');
  const negativeCatalysts = LAND_USE_CATALYSTS.filter((c) => c.type === 'negative');

  const totalPositiveImpact = selectedCatalysts.reduce((acc, id) => {
    const c = positiveCatalysts.find((item) => item.id === id);
    return acc + (c ? c.impactPct : 0);
  }, 0);

  const totalNegativeImpact = selectedCatalysts.reduce((acc, id) => {
    const c = negativeCatalysts.find((item) => item.id === id);
    return acc + (c ? c.impactPct : 0);
  }, 0);

  const netImpact = totalPositiveImpact + totalNegativeImpact;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mrt':
        return <Train className="w-4 h-4 text-sky-600" />;
      case 'commercial':
        return <Briefcase className="w-4 h-4 text-indigo-600" />;
      case 'schools':
        return <GraduationCap className="w-4 h-4 text-amber-600" />;
      case 'greenspace':
        return <Trees className="w-4 h-4 text-emerald-600" />;
      case 'healthcare':
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Top Impact Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-700" />
              Singapore URA Master Plan & Future Land Use Checker
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate how upcoming infrastructure, transit links, and zoning changes alter your BTO's post-MOP valuation
            </p>
          </div>

          {/* Net Impact Pill */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg self-start sm:self-auto">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Net Valuation Impact</div>
              <div className={`text-xl font-extrabold font-mono ${netImpact >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
                {formatPct(netImpact)}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 border-l border-slate-200 pl-3">
              <div>+{formatPct(totalPositiveImpact)} Upside</div>
              <div className="text-rose-600">{formatPct(totalNegativeImpact)} Headwind</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Positive Catalysts Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Value Drivers & Positive Catalysts (Increases Price)
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              {positiveCatalysts.filter((c) => selectedCatalysts.includes(c.id)).length} / {positiveCatalysts.length} active
            </span>
          </div>

          <div className="space-y-2.5">
            {positiveCatalysts.map((catalyst) => {
              const isSelected = selectedCatalysts.includes(catalyst.id);
              return (
                <div
                  key={catalyst.id}
                  onClick={() => toggleCatalyst(catalyst.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500/70 bg-emerald-50/30 shadow-xs ring-1 ring-emerald-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 p-1 rounded-md bg-slate-100">
                        {getCategoryIcon(catalyst.category)}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          {catalyst.title}
                          <span className="text-[10px] font-normal text-slate-400">· {catalyst.timing}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {catalyst.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono text-emerald-700 bg-emerald-100/70">
                        +{catalyst.impactPct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Negative Headwinds Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Potential Valuation Headwinds (Decreases or Moderates Price)
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              {negativeCatalysts.filter((c) => selectedCatalysts.includes(c.id)).length} / {negativeCatalysts.length} active
            </span>
          </div>

          <div className="space-y-2.5">
            {negativeCatalysts.map((catalyst) => {
              const isSelected = selectedCatalysts.includes(catalyst.id);
              return (
                <div
                  key={catalyst.id}
                  onClick={() => toggleCatalyst(catalyst.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-rose-500/70 bg-rose-50/30 shadow-xs ring-1 ring-rose-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 p-1 rounded-md bg-slate-100">
                        {getCategoryIcon(catalyst.category)}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          {catalyst.title}
                          <span className="text-[10px] font-normal text-slate-400">· {catalyst.timing}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {catalyst.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono text-rose-700 bg-rose-100/70">
                        {catalyst.impactPct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* URA Master Plan Technical Note */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mt-4">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-700" />
              How Does URA Master Plan Zoning Dictate Secondary Resale Prices?
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Every 5 years, the Urban Redevelopment Authority (URA) reviews Singapore's Master Plan to outline land use zoning (Plot Ratios, Commercial Reserve, Educational reserves, and Mass Rapid Transit alignments).
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Properties sited within 500m of upcoming MRT stations (such as the Cross Island Line or Jurong Region Line) have historically enjoyed an average <strong>8% to 15% outperformance</strong> over non-MRT peers once operational. Conversely, sudden increases in BTO plot density without commercial support can lead to short-term listing dilution upon MOP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
