/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { ValuationInputs, ValuationResults, MortgageInputs, MortgageResults } from '../types/bto';
import { FLOOR_TIERS, FACING_OPTIONS, RESALE_BENCHMARKS, LAND_USE_CATALYSTS } from '../data/btoData';
import { formatSgd, formatPct } from './calculator';

export function generateBtoValuationPdf(
  valInputs: ValuationInputs,
  valResults: ValuationResults,
  mortInputs: MortgageInputs,
  mortResults: MortgageResults
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 23, 42]; // Slate 900
  const secondaryColor = [71, 85, 105]; // Slate 600
  const accentColor = [13, 148, 136]; // Teal 600
  const lightBg = [248, 250, 252]; // Slate 50
  const borderCol = [226, 232, 240]; // Slate 200

  const margin = 18;
  let y = margin;
  const pageWidth = 210;
  const contentWidth = pageWidth - margin * 2;

  // Header Bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SINGAPORE BTO MOP VALUATION REPORT', margin + 6, y + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('POST-MOP RESALE FORECAST & FINANCIAL PLANNING ADVISORY', margin + 6, y + 15);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}`, margin + contentWidth - 45, y + 15);

  y += 30;

  // Section 1: Property Profile
  doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. PROPERTY PROFILE & TIMELINE', margin + 5, y + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

  const unitSpec = valInputs.project.flatTypes[valInputs.flatType];
  const floorInfo = FLOOR_TIERS[valInputs.floorLevelTier];
  const facingInfo = FACING_OPTIONS[valInputs.facing];

  // Grid column 1
  doc.text(`Development:`, margin + 5, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${valInputs.project.name} (${valInputs.project.town})`, margin + 30, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Flat Type:`, margin + 5, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${valInputs.flatType.toUpperCase()} (${unitSpec?.sqm || 93} sqm / ${unitSpec?.sqft || 1001} sqft)`, margin + 30, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Classification:`, margin + 5, y + 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${valInputs.project.classification} Framework (${valInputs.project.mopYears}-Year MOP)`, margin + 30, y + 28);

  // Grid column 2
  const col2X = margin + 95;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Floor Level:`, col2X, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${floorInfo.label} (${floorInfo.floorRange}) [${formatPct(valResults.floorPremiumPct)}]`, col2X + 25, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Facing:`, col2X, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${facingInfo.label.split('(')[0]} [${formatPct(valResults.facingAdjustmentPct)}]`, col2X + 25, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Est. MOP Year:`, col2X, y + 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(`Year ${valResults.mopYear} (TOP: ${valInputs.project.estTopYear})`, col2X + 25, y + 28);

  y += 44;

  // Section 2: Valuation & Net Profit Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y, contentWidth, 54, 2, 2, 'FD');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. PROJECTED MOP VALUATION & RESALE CAPITAL GAIN', margin + 5, y + 7);

  // Sub columns
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

  doc.text('Original Purchase Price:', margin + 5, y + 15);
  doc.text(formatSgd(valResults.originalPurchasePrice), margin + 60, y + 15);

  doc.text('Less: CPF Housing Grants (EHG):', margin + 5, y + 21);
  doc.text(`- ${formatSgd(valInputs.grantAmount)}`, margin + 60, y + 21);

  doc.text('Net Effective Purchase Cost:', margin + 5, y + 27);
  doc.setFont('helvetica', 'bold');
  doc.text(formatSgd(valResults.netPurchasePrice), margin + 60, y + 27);

  doc.setFont('helvetica', 'normal');
  doc.text('Annualized Growth Rate Assumed:', margin + 5, y + 33);
  doc.text(`${valResults.annualGrowthRatePct}% p.a. (${valInputs.growthScenario.toUpperCase()})`, margin + 60, y + 33);

  doc.text('Floor Level & Catalyst Premium:', margin + 5, y + 39);
  doc.text(`${formatPct(valResults.floorPremiumPct + valResults.facingAdjustmentPct + valResults.catalystAdjustmentPct)} total`, margin + 60, y + 39);

  // Right column: Big Numbers
  doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
  doc.line(col2X - 5, y + 10, col2X - 5, y + 49);

  doc.setFont('helvetica', 'normal');
  doc.text('ESTIMATED MOP RESALE VALUE', col2X, y + 15);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(formatSgd(valResults.projectedMopResaleValue), col2X, y + 22);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Est. PSF: S$ ${valResults.projectedPsf} psf`, col2X, y + 27);

  if (valResults.subsidyClawbackAmount > 0) {
    doc.text(`Less: Subsidy Clawback (${valInputs.project.clawbackPct}%):`, col2X, y + 33);
    doc.setTextColor(220, 38, 38);
    doc.text(`- ${formatSgd(valResults.subsidyClawbackAmount)}`, col2X + 60, y + 33);
  } else {
    doc.text(`Subsidy Clawback: S$ 0 (Standard BTO)`, col2X, y + 33);
  }

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Less: Est. Legal & Agent Commission:`, col2X, y + 39);
  doc.text(`- ${formatSgd(valResults.estimatedResaleExpenses)}`, col2X + 60, y + 39);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('ESTIMATED NET PROFIT:', col2X, y + 46);
  doc.text(`${formatSgd(valResults.estimatedNetProfit)} (+${valResults.totalRoiPct}%)`, col2X + 46, y + 46);

  y += 60;

  // Section 3: Monthly Mortgage & Financing Summary
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. MONTHLY MORTGAGE & CPF OA SERVICING BREAKDOWN', margin + 5, y + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

  doc.text(`Financing Structure:`, margin + 5, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${mortInputs.loanType.toUpperCase()} Loan @ ${mortInputs.interestRatePct}% (${mortInputs.loanTenureYears} Years)`, margin + 42, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.text(`Loan Quantum Borrowed:`, margin + 5, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.text(formatSgd(mortResults.loanQuantum), margin + 42, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Downpayment:`, margin + 5, y + 28);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatSgd(mortResults.downpaymentTotal)} (${formatSgd(mortResults.downpaymentCpf)} CPF + ${formatSgd(mortResults.downpaymentCash)} Cash)`, margin + 42, y + 28);

  // Right column of mortgage
  doc.setFont('helvetica', 'normal');
  doc.text(`Monthly Installment:`, col2X, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${formatSgd(mortResults.monthlyInstallment)} / month`, col2X + 35, y + 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`- Covered by CPF OA:`, col2X, y + 20);
  doc.text(formatSgd(mortResults.monthlyCpfPortion), col2X + 35, y + 20);

  doc.text(`- Out-of-Pocket Cash:`, col2X, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.text(formatSgd(mortResults.monthlyCashPortion), col2X + 35, y + 25);

  doc.setFont('helvetica', 'normal');
  doc.text(`Mortgage Servicing Ratio:`, col2X, y + 31);
  const msrColor = mortResults.msrStatus === 'healthy' ? [13, 148, 136] : [220, 38, 38];
  doc.setTextColor(msrColor[0], msrColor[1], msrColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`${mortResults.msrPct}% (Max HDB limit 30% - ${mortResults.msrStatus.toUpperCase()})`, col2X + 35, y + 31);

  y += 44;

  // Section 4: Neighboring Resale Comparison & URA Land Use
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y, contentWidth, 40, 2, 2, 'FD');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('4. NEIGHBORING RESALE BENCHMARKS & URA FUTURE LAND USE', margin + 5, y + 7);

  const townBenchmark = RESALE_BENCHMARKS[valInputs.project.town];
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

  doc.text(`Town Resale Benchmark:`, margin + 5, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${valInputs.project.town} (Median PSF: S$ ${townBenchmark?.avgPsf || 750})`, margin + 45, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Nearby 5-Yr MOP Cluster:`, margin + 5, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${townBenchmark?.fiveYearMopClusterName || 'Recent MOP cluster'} (Avg S$ ${townBenchmark?.fiveYearMopAvgPsf || 800} psf)`, margin + 45, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`BTO Entry Discount Buffer:`, margin + 5, y + 26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  const btoPsf = Math.round(valResults.originalPurchasePrice / (unitSpec?.sqft || 1001));
  const benchmarkPsf = townBenchmark?.fiveYearMopAvgPsf || 800;
  const discountPct = Math.round(((benchmarkPsf - btoPsf) / benchmarkPsf) * 100);
  doc.text(`~${Math.max(10, discountPct)}% below existing neighboring 5-year resale cluster`, margin + 45, y + 26);

  // Selected Land Use Catalysts
  const activeCatalysts = valInputs.selectedCatalysts
    .map((id) => LAND_USE_CATALYSTS.find((c) => c.id === id))
    .filter(Boolean) as (typeof LAND_USE_CATALYSTS)[0][];

  const catalystNames = activeCatalysts.slice(0, 3).map((c) => c.title).join('; ');
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Active Land Use Catalysts:`, margin + 5, y + 33);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(catalystNames || 'Standard Master Plan zoning baselines applied', margin + 45, y + 33);

  y += 46;

  // Disclaimer / Footer
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(
    'Notice: Projections are model simulations based on historical HDB resale indices, floor level premiums, and URA Master Plan gazettes. Actual prices upon MOP depend on macroeconomic interest rates, HDB policy adjustments, and prevailing secondary market demand. Please consult certified Singapore estate & financial planners before executing property transactions.',
    margin,
    y,
    { maxWidth: contentWidth }
  );

  // Save the PDF
  const filename = `SG_BTO_MOP_Report_${valInputs.project.name.replace(/[^a-zA-Z0-9]/g, '_')}_${valInputs.flatType}.pdf`;
  doc.save(filename);
}
