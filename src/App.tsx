/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { BTO_PROJECTS, LAND_USE_CATALYSTS } from './data/btoData';
import {
  BtoProject,
  FlatType,
  FloorLevelTier,
  FacingType,
  ValuationInputs,
  MortgageInputs,
} from './types/bto';
import { calculateMopValuation, calculateMortgage, formatSgd } from './utils/calculator';
import { Header } from './components/Header';
import { BtoSelector } from './components/BtoSelector';
import { ValuationDashboard } from './components/ValuationDashboard';
import { MortgageCalculator } from './components/MortgageCalculator';
import { ResaleComparison } from './components/ResaleComparison';
import { FutureLandUse } from './components/FutureLandUse';
import { GrowthTimeline } from './components/GrowthTimeline';
import { OneMapViewer } from './components/OneMapViewer';
import { ApiHealthModal } from './components/ApiHealthModal';
import { PdfExportModal } from './components/PdfExportModal';
import { Building2, Sparkles, Shield, ArrowUpRight, CheckCircle2, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('valuation');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(false);
  const [apiHealthy, setApiHealthy] = useState<boolean>(true);

  // Configuration State
  const [selectedProject, setSelectedProject] = useState<BtoProject>(BTO_PROJECTS[0]);
  const [selectedFlatType, setSelectedFlatType] = useState<FlatType>('4-room');
  const [customPrice, setCustomPrice] = useState<number>(
    BTO_PROJECTS[0].flatTypes['4-room']?.basePrice || 668000
  );
  const [floorLevelTier, setFloorLevelTier] = useState<FloorLevelTier>('mid');
  const [floorNumber, setFloorNumber] = useState<number>(12);
  const [facing, setFacing] = useState<FacingType>('north_south');
  const [grantAmount, setGrantAmount] = useState<number>(30000);
  const [growthScenario, setGrowthScenario] = useState<'conservative' | 'moderate' | 'bullish'>('moderate');
  const [selectedCatalysts, setSelectedCatalysts] = useState<string[]>([
    'crl-mrt',
    'elite-primary-school',
    'integrated-polyclinic',
  ]);

  // Mortgage Inputs
  const [mortInputs, setMortInputs] = useState<MortgageInputs>({
    propertyPrice: 668000,
    grantAmount: 30000,
    downpaymentPct: 20,
    downpaymentFromCpf: 80000,
    loanType: 'hdb',
    interestRatePct: 2.6,
    loanTenureYears: 25,
    monthlyHouseholdIncome: 9500,
    monthlyCpfOaContribution: 1800,
  });

  // Keep mortgage propertyPrice and grantAmount synced with BTO selection
  useEffect(() => {
    setMortInputs((prev) => ({
      ...prev,
      propertyPrice: customPrice,
      grantAmount: grantAmount,
    }));
  }, [customPrice, grantAmount]);

  // Calculate Valuation Results
  const valInputs: ValuationInputs = useMemo(
    () => ({
      project: selectedProject,
      flatType: selectedFlatType,
      customPrice,
      floorLevelTier,
      floorNumber,
      facing,
      grantAmount,
      growthScenario,
      selectedCatalysts,
    }),
    [
      selectedProject,
      selectedFlatType,
      customPrice,
      floorLevelTier,
      floorNumber,
      facing,
      grantAmount,
      growthScenario,
      selectedCatalysts,
    ]
  );

  const valResults = useMemo(() => calculateMopValuation(valInputs), [valInputs]);

  // Calculate Mortgage Results
  const mortResults = useMemo(() => calculateMortgage(mortInputs), [mortInputs]);

  // Initial API health check probe
  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (res.ok) setApiHealthy(true);
        else setApiHealthy(false);
      })
      .catch(() => setApiHealthy(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        onOpenHealthModal={() => setIsHealthModalOpen(true)}
        apiHealthy={apiHealthy}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Universal BTO Configuration Panel (Always accessible for quick tweaking) */}
        <BtoSelector
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedFlatType={selectedFlatType}
          setSelectedFlatType={setSelectedFlatType}
          customPrice={customPrice}
          setCustomPrice={setCustomPrice}
          floorLevelTier={floorLevelTier}
          setFloorLevelTier={setFloorLevelTier}
          floorNumber={floorNumber}
          setFloorNumber={setFloorNumber}
          facing={facing}
          setFacing={setFacing}
          grantAmount={grantAmount}
          setGrantAmount={setGrantAmount}
          growthScenario={growthScenario}
          setGrowthScenario={setGrowthScenario}
        />

        {/* Tab 1: MOP Valuation & Resale Gain Forecast */}
        {activeTab === 'valuation' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ValuationDashboard valInputs={valInputs} valResults={valResults} />
          </div>
        )}

        {/* Tab: SLA OneMap & Nearby Amenities Analysis */}
        {activeTab === 'onemap' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <OneMapViewer selectedProject={selectedProject} />
          </div>
        )}

        {/* Tab 2: Monthly Mortgage Calculator */}
        {activeTab === 'mortgage' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <MortgageCalculator
              mortInputs={mortInputs}
              setMortInputs={setMortInputs}
              mortResults={mortResults}
            />
          </div>
        )}

        {/* Tab 3: Neighboring Resale Comparison */}
        {activeTab === 'resale' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ResaleComparison
              selectedProject={selectedProject}
              selectedFlatType={selectedFlatType}
              btoPrice={customPrice}
            />
          </div>
        )}

        {/* Tab 4: URA Future Land Use Checker */}
        {activeTab === 'landuse' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <FutureLandUse
              selectedCatalysts={selectedCatalysts}
              setSelectedCatalysts={setSelectedCatalysts}
            />
          </div>
        )}

        {/* Tab 5: Long-term Investment Growth Timeline */}
        {activeTab === 'growth' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <GrowthTimeline
              valInputs={valInputs}
              valResults={valResults}
              mortResults={mortResults}
            />
          </div>
        )}
      </main>

      {/* Sleek Minimalist Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">
              SG
            </div>
            <span className="font-semibold text-slate-800">Singapore BTO MOP Valuation Intelligence</span>
            <span className="text-slate-300">·</span>
            <span>HDB &amp; URA Master Plan Integrated Baseline</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsHealthModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${apiHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>API Health Monitor</span>
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Export Report PDF
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        valInputs={valInputs}
        valResults={valResults}
        mortInputs={mortInputs}
        mortResults={mortResults}
      />

      <ApiHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        onHealthStatusChange={(healthy) => setApiHealthy(healthy)}
      />
    </div>
  );
}
