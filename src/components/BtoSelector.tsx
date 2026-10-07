/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BtoProject, FlatType, FloorLevelTier, FacingType } from '../types/bto';
import { BTO_PROJECTS, FLOOR_TIERS, FACING_OPTIONS } from '../data/btoData';
import { formatSgd } from '../utils/calculator';
import { Building, Layers, Compass, DollarSign, Gift, TrendingUp, Info } from 'lucide-react';

interface BtoSelectorProps {
  selectedProject: BtoProject;
  setSelectedProject: (p: BtoProject) => void;
  selectedFlatType: FlatType;
  setSelectedFlatType: (ft: FlatType) => void;
  customPrice: number;
  setCustomPrice: (price: number) => void;
  floorLevelTier: FloorLevelTier;
  setFloorLevelTier: (tier: FloorLevelTier) => void;
  floorNumber: number;
  setFloorNumber: (num: number) => void;
  facing: FacingType;
  setFacing: (f: FacingType) => void;
  grantAmount: number;
  setGrantAmount: (g: number) => void;
  growthScenario: 'conservative' | 'moderate' | 'bullish';
  setGrowthScenario: (s: 'conservative' | 'moderate' | 'bullish') => void;
}

export const BtoSelector: React.FC<BtoSelectorProps> = ({
  selectedProject,
  setSelectedProject,
  selectedFlatType,
  setSelectedFlatType,
  customPrice,
  setCustomPrice,
  floorLevelTier,
  setFloorLevelTier,
  floorNumber,
  setFloorNumber,
  facing,
  setFacing,
  grantAmount,
  setGrantAmount,
  growthScenario,
  setGrowthScenario,
}) => {
  const availableFlatTypes = Object.keys(selectedProject.flatTypes) as FlatType[];
  const currentUnitSpec = selectedProject.flatTypes[selectedFlatType] || selectedProject.flatTypes[availableFlatTypes[0]];

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const proj = BTO_PROJECTS.find((p) => p.id === e.target.value);
    if (proj) {
      setSelectedProject(proj);
      const flats = Object.keys(proj.flatTypes) as FlatType[];
      const defaultFlat = flats.includes(selectedFlatType) ? selectedFlatType : flats[0];
      setSelectedFlatType(defaultFlat);
      const basePrice = proj.flatTypes[defaultFlat]?.basePrice || 500000;
      setCustomPrice(basePrice);
    }
  };

  const handleFlatTypeChange = (ft: FlatType) => {
    setSelectedFlatType(ft);
    const basePrice = selectedProject.flatTypes[ft]?.basePrice || 500000;
    setCustomPrice(basePrice);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-700" />
            BTO Configuration & Unit Profile
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select your BTO project, unit type, and exact floor elevation to compute post-MOP valuation
          </p>
        </div>

        {/* Classification Badge */}
        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
          <span className="w-2 h-2 rounded-full bg-slate-900" />
          <span>{selectedProject.classification} Model</span>
          <span className="text-slate-400">·</span>
          <span>{selectedProject.mopYears}-Yr MOP</span>
          {selectedProject.clawbackPct > 0 && (
            <>
              <span className="text-slate-400">·</span>
              <span className="text-rose-600 font-semibold">{selectedProject.clawbackPct}% Clawback</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Project Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            BTO Project & Town
          </label>
          <div className="relative">
            <select
              value={selectedProject.id}
              onChange={handleProjectChange}
              className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            >
              {BTO_PROJECTS.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name} ({proj.town}) — {proj.classification}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {selectedProject.mrtProximity}
          </p>
        </div>

        {/* 2. Flat Type Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Flat Type & Size
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {availableFlatTypes.map((ft) => {
              const isActive = selectedFlatType === ft;
              const spec = selectedProject.flatTypes[ft];
              return (
                <button
                  key={ft}
                  type="button"
                  onClick={() => handleFlatTypeChange(ft)}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium border text-center transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>{ft}</div>
                  <div className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    {spec?.sqft} sqft
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Original Purchase Price */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              Original Launch Price (S$)
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              Base: {formatSgd(currentUnitSpec?.basePrice || 500000)}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 text-sm font-medium">S$</span>
            <input
              type="number"
              step="5000"
              value={customPrice}
              onChange={(e) => setCustomPrice(Number(e.target.value) || 0)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Official range: {formatSgd(currentUnitSpec?.priceRange[0] || 400000)} – {formatSgd(currentUnitSpec?.priceRange[1] || 600000)}
          </p>
        </div>
      </div>

      {/* Row 2: Floor Level, Facing, and CPF Grant */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Floor Level Tier Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              Floor Elevation Tier
            </label>
            <span className="text-xs font-bold text-slate-900 font-mono">
              Level #{floorNumber.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(FLOOR_TIERS).map(([key, tier]) => {
              const isActive = floorLevelTier === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setFloorLevelTier(key as FloorLevelTier);
                    if (key === 'low') setFloorNumber(4);
                    if (key === 'mid') setFloorNumber(11);
                    if (key === 'high') setFloorNumber(21);
                    if (key === 'sky') setFloorNumber(32);
                  }}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    isActive
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">{tier.label}</span>
                    <span className={`text-[11px] font-mono font-bold ${tier.premiumPct > 0 ? 'text-teal-700' : 'text-slate-400'}`}>
                      {tier.premiumPct > 0 ? `+${tier.premiumPct}%` : 'Base'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{tier.floorRange}</div>
                </button>
              );
            })}
          </div>

          {/* Precise floor slider */}
          <div className="pt-1">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Adjust Unit Level:</span>
              <span className="font-semibold text-slate-900">#{floorNumber}</span>
            </div>
            <input
              type="range"
              min="2"
              max="45"
              value={floorNumber}
              onChange={(e) => {
                const val = Number(e.target.value);
                setFloorNumber(val);
                if (val <= 6) setFloorLevelTier('low');
                else if (val <= 15) setFloorLevelTier('mid');
                else if (val <= 25) setFloorLevelTier('high');
                else setFloorLevelTier('sky');
              }}
              className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>
        </div>

        {/* Facing / Orientation */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-slate-600" />
            Facing & View Orientation
          </label>
          <select
            value={facing}
            onChange={(e) => setFacing(e.target.value as FacingType)}
            className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {Object.entries(FACING_OPTIONS).map(([key, opt]) => (
              <option key={key} value={key}>
                {opt.label} ({opt.adjustmentPct >= 0 ? `+${opt.adjustmentPct}%` : `${opt.adjustmentPct}%`})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            {FACING_OPTIONS[facing]?.description}
          </p>

          {/* Growth Scenario Selector */}
          <div className="pt-3">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5 mb-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
              Appreciation Growth Trajectory
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {(['conservative', 'moderate', 'bullish'] as const).map((scen) => (
                <button
                  key={scen}
                  type="button"
                  onClick={() => setGrowthScenario(scen)}
                  className={`py-1 text-[11px] font-medium rounded-md capitalize transition-colors ${
                    growthScenario === scen
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {scen}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CPF Housing Grants (EHG) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-slate-600" />
              CPF Housing Grant (EHG)
            </label>
            <span className="text-xs font-bold text-teal-700 font-mono">
              {formatSgd(grantAmount)}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {[0, 30000, 50000, 80000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setGrantAmount(amt)}
                className={`py-1.5 px-1 rounded-md text-[11px] font-medium border text-center transition-all ${
                  grantAmount === amt
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {amt === 0 ? 'None' : `$${amt / 1000}k`}
              </button>
            ))}
          </div>

          <input
            type="range"
            min="0"
            max="120000"
            step="5000"
            value={grantAmount}
            onChange={(e) => setGrantAmount(Number(e.target.value))}
            className="w-full accent-teal-700 cursor-pointer h-1.5 bg-slate-200 rounded-lg mt-2"
          />

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Enhanced CPF Housing Grant (EHG) offers up to S$80,000 (up to S$120,000 from late 2024 revisions) for first-timer citizen households earning up to S$9,000/month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
