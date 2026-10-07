/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FlatType = '2-room' | '3-room' | '4-room' | '5-room' | '3Gen';

export type BtoClassification = 'Standard' | 'Plus' | 'Prime';

export type FloorLevelTier = 'low' | 'mid' | 'high' | 'sky';

export type FacingType = 'north_south' | 'unblocked_park_water' | 'east_morning_sun' | 'west_afternoon_sun' | 'expressway_facing';

export interface BtoAmenity {
  id: string;
  name: string;
  category: 'mrt' | 'school' | 'mall' | 'park' | 'healthcare' | 'headwind';
  type: 'positive' | 'negative';
  distanceMeters: number;
  impactPct: number; // e.g. +4.5% or -2.0%
  description: string;
  coordinates: [number, number]; // [latitude, longitude]
}

export interface BtoProject {
  id: string;
  name: string;
  town: string;
  launchYear: number;
  estTopYear: number;
  classification: BtoClassification;
  mopYears: number; // 5 or 10
  clawbackPct: number; // 0 for Standard, 6-8 for Plus, 9-12 for Prime
  description: string;
  mrtProximity: string;
  coordinates: [number, number]; // [latitude, longitude]
  surroundingAmenities: BtoAmenity[];
  flatTypes: {
    [key in FlatType]?: {
      sqm: number;
      sqft: number;
      basePrice: number;
      priceRange: [number, number];
    };
  };
  keyHighlights: string[];
}

export interface TownResaleBenchmark {
  town: string;
  avgPsf: number;
  medianPrices: {
    [key in FlatType]?: number;
  };
  fiveYearMopClusterName: string;
  fiveYearMopAvgPsf: number;
  fiveYearMopMedianPrice4Room: number;
  avgRemainingLeaseYears: number;
  recentTransactionsCount: number;
  annualHistoricalGrowthPct: number;
}

export interface LandUseCatalyst {
  id: string;
  category: 'mrt' | 'commercial' | 'schools' | 'greenspace' | 'healthcare' | 'headwind';
  title: string;
  description: string;
  impactPct: number; // e.g. +3.5% or -2.0%
  timing: string; // e.g. "2027-2030"
  type: 'positive' | 'negative';
}

export interface ValuationInputs {
  project: BtoProject;
  flatType: FlatType;
  customPrice?: number;
  floorLevelTier: FloorLevelTier;
  floorNumber: number;
  facing: FacingType;
  grantAmount: number; // EHG Grant (S$)
  growthScenario: 'conservative' | 'moderate' | 'bullish';
  selectedCatalysts: string[]; // catalyst IDs
}

export interface ValuationResults {
  originalPurchasePrice: number;
  netPurchasePrice: number; // after grants
  floorPremiumPct: number;
  floorPremiumAmount: number;
  facingAdjustmentPct: number;
  catalystAdjustmentPct: number;
  mopYear: number;
  holdingYearsToMop: number;
  annualGrowthRatePct: number;
  projectedMopResaleValue: number;
  projectedPsf: number;
  subsidyClawbackAmount: number;
  estimatedResaleExpenses: number; // agent fee 2% + legal
  estimatedCpfAccruedInterest: number;
  estimatedNetProfit: number;
  totalRoiPct: number;
}

export interface MortgageInputs {
  propertyPrice: number;
  grantAmount: number;
  downpaymentPct: number; // e.g. 20%
  downpaymentFromCpf: number;
  loanType: 'hdb' | 'bank';
  interestRatePct: number; // e.g. 2.6% for HDB, 2.9% for Bank
  loanTenureYears: number; // 15 to 30
  monthlyHouseholdIncome: number;
  monthlyCpfOaContribution: number;
}

export interface MortgageResults {
  downpaymentTotal: number;
  downpaymentCash: number;
  downpaymentCpf: number;
  loanQuantum: number;
  monthlyInstallment: number;
  monthlyCpfPortion: number;
  monthlyCashPortion: number;
  totalInterestPaid: number;
  totalAmountRepaid: number;
  msrPct: number; // Mortgage Servicing Ratio (< 30%)
  tdsrPct: number; // Total Debt Servicing Ratio (< 55%)
  msrStatus: 'healthy' | 'caution' | 'exceeded';
}
