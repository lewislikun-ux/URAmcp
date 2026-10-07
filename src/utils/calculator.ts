/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FLOOR_TIERS, FACING_OPTIONS, RESALE_BENCHMARKS, LAND_USE_CATALYSTS } from '../data/btoData';
import {
  ValuationInputs,
  ValuationResults,
  MortgageInputs,
  MortgageResults,
} from '../types/bto';

export function calculateMopValuation(inputs: ValuationInputs): ValuationResults {
  const { project, flatType, customPrice, floorLevelTier, facing, grantAmount, growthScenario, selectedCatalysts } = inputs;

  const unitSpec = project.flatTypes[flatType];
  const originalPurchasePrice = customPrice || unitSpec?.basePrice || 500000;
  const netPurchasePrice = Math.max(0, originalPurchasePrice - grantAmount);

  const floorTier = FLOOR_TIERS[floorLevelTier] || FLOOR_TIERS.mid;
  const floorPremiumPct = floorTier.premiumPct;
  const floorPremiumAmount = Math.round(originalPurchasePrice * (floorPremiumPct / 100));

  const facingObj = FACING_OPTIONS[facing] || FACING_OPTIONS.north_south;
  const facingAdjustmentPct = facingObj.adjustmentPct;

  // Calculate cumulative catalyst adjustment
  const catalystAdjustmentPct = selectedCatalysts.reduce((acc, catId) => {
    const catalyst = LAND_USE_CATALYSTS.find((c) => c.id === catId);
    return acc + (catalyst ? catalyst.impactPct : 0);
  }, 0);

  // Holding period in years: from TOP to MOP
  const holdingYearsToMop = project.mopYears;
  const mopYear = project.estTopYear + project.mopYears;

  // Town baseline growth rate
  const townBenchmark = RESALE_BENCHMARKS[project.town];
  const townBaseGrowth = townBenchmark ? townBenchmark.annualHistoricalGrowthPct : 4.2;

  let annualGrowthRatePct = townBaseGrowth;
  if (growthScenario === 'conservative') {
    annualGrowthRatePct = Math.max(2.2, townBaseGrowth - 1.4);
  } else if (growthScenario === 'bullish') {
    annualGrowthRatePct = townBaseGrowth + 1.2;
  }

  // Compound growth calculation
  // Future Value = Base * (1 + annualGrowthRate)^holdingYears
  const baseGrowthFactor = Math.pow(1 + annualGrowthRatePct / 100, holdingYearsToMop);
  
  // Floor and facing multiplier
  const featureMultiplier = 1 + (floorPremiumPct + facingAdjustmentPct + catalystAdjustmentPct) / 100;

  // Projected MOP Resale Valuation
  const projectedMopResaleValue = Math.round(originalPurchasePrice * baseGrowthFactor * featureMultiplier);

  const sqft = unitSpec?.sqft || 1001;
  const projectedPsf = Math.round(projectedMopResaleValue / sqft);

  // Subsidy clawback for Plus & Prime models
  const subsidyClawbackAmount = project.clawbackPct > 0
    ? Math.round(projectedMopResaleValue * (project.clawbackPct / 100))
    : 0;

  // Estimated seller expenses: 2% agent commission + 9% GST (2.18%) + S$2,800 conveyancing legal fees
  const estimatedResaleExpenses = Math.round(projectedMopResaleValue * 0.0218 + 2800);

  // CPF Accrued interest estimate (assuming 2.5% p.a. on typical CPF OA usage over holding period)
  const estimatedCpfUsed = netPurchasePrice * 0.65; // ~65% paid via CPF
  const estimatedCpfAccruedInterest = Math.round(estimatedCpfUsed * (Math.pow(1.025, holdingYearsToMop) - 1));

  // Net cash & CPF capital gain
  const estimatedNetProfit = Math.round(
    projectedMopResaleValue - netPurchasePrice - subsidyClawbackAmount - estimatedResaleExpenses
  );

  const totalRoiPct = Number(((estimatedNetProfit / Math.max(netPurchasePrice, 1)) * 100).toFixed(1));

  return {
    originalPurchasePrice,
    netPurchasePrice,
    floorPremiumPct,
    floorPremiumAmount,
    facingAdjustmentPct,
    catalystAdjustmentPct,
    mopYear,
    holdingYearsToMop,
    annualGrowthRatePct: Number(annualGrowthRatePct.toFixed(2)),
    projectedMopResaleValue,
    projectedPsf,
    subsidyClawbackAmount,
    estimatedResaleExpenses,
    estimatedCpfAccruedInterest,
    estimatedNetProfit,
    totalRoiPct,
  };
}

export function calculateMortgage(inputs: MortgageInputs): MortgageResults {
  const effectivePrice = Math.max(0, inputs.propertyPrice - inputs.grantAmount);
  const downpaymentTotal = Math.round(effectivePrice * (inputs.downpaymentPct / 100));
  
  const downpaymentCpf = Math.min(downpaymentTotal, inputs.downpaymentFromCpf);
  const downpaymentCash = Math.max(0, downpaymentTotal - downpaymentCpf);

  const loanQuantum = Math.max(0, effectivePrice - downpaymentTotal);

  const monthlyRate = inputs.interestRatePct / 100 / 12;
  const totalMonths = inputs.loanTenureYears * 12;

  let monthlyInstallment = 0;
  if (loanQuantum > 0 && monthlyRate > 0) {
    monthlyInstallment = Math.round(
      (loanQuantum * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
  } else if (loanQuantum > 0) {
    monthlyInstallment = Math.round(loanQuantum / totalMonths);
  }

  // Monthly breakdown: CPF OA vs Cash out of pocket
  const monthlyCpfPortion = Math.min(monthlyInstallment, inputs.monthlyCpfOaContribution);
  const monthlyCashPortion = Math.max(0, monthlyInstallment - monthlyCpfPortion);

  const totalAmountRepaid = monthlyInstallment * totalMonths;
  const totalInterestPaid = Math.max(0, totalAmountRepaid - loanQuantum);

  // Mortgage Servicing Ratio (MSR = installment / gross income)
  const msrPct = inputs.monthlyHouseholdIncome > 0
    ? Number(((monthlyInstallment / inputs.monthlyHouseholdIncome) * 100).toFixed(1))
    : 0;

  // Total Debt Servicing Ratio (assuming property is primary debt)
  const tdsrPct = msrPct;

  let msrStatus: 'healthy' | 'caution' | 'exceeded' = 'healthy';
  if (msrPct > 30) {
    msrStatus = 'exceeded';
  } else if (msrPct >= 28) {
    msrStatus = 'caution';
  }

  return {
    downpaymentTotal,
    downpaymentCash,
    downpaymentCpf,
    loanQuantum,
    monthlyInstallment,
    monthlyCpfPortion,
    monthlyCashPortion,
    totalInterestPaid,
    totalAmountRepaid,
    msrPct,
    tdsrPct,
    msrStatus,
  };
}

export function formatSgd(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPct(val: number): string {
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(1)}%`;
}
