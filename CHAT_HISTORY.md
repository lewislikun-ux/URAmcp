# Project Chat History & Engineering Log

**Application**: SG BTO MOP Valuation & Growth Intelligence  
**Repository**: `https://github.com/lewislikun-ux/URAmcp.git`  
**Branch**: `main`  
**Timestamp**: October 7, 2026  

---

## Turn 1: Initial Requirements & Application Build

### User Request:
> "create a mobile reponsive website for users to check for their BTO is going to worth how much once it has MOP, it needs to show current BTO choices and estimated appreciation rates based on location and floor level data + include a simple calculator for monthly mortgage payments + a comparison tool against neighboring resale HDB transaction prices + a clean dashboard to visualize long-term investment growth + export reports to PDF for easier sharing with family members + users should be able to check on future land use which may increase or decrease the BTO future price. This should all be integrated within a seamless, mobile-responsive web application. Website design to be white background with sleek minimalist typography and intuitive data visualization icons. DO not use clutter and keep the navigation intuitive for all age groups. create an API folder as i will be keying in the api key myself for the URA in vercel, also include a health.js to monitor the API health. Ensure the error handling is robust. make no mistakes"

### Key Implementation Deliverables:
1. **Core Valuation Engine (`src/utils/calculator.ts`, `src/types/bto.ts`)**:
   - Compound appreciation rates across BTO estates and classification models: Standard (5-yr MOP, 0% clawback), Plus (10-yr MOP, 6% clawback), Prime (10-yr MOP, 9% clawback).
   - Floor elevation tiers: Low (`#02–#06`), Mid (`#07–#15`), High (`#16–#25`), Sky (`#26–#40+`).
   - Facing adjustments (North-South, unblocked park/waterfront, morning sun, afternoon sun, expressway facing).
   - Accurate deduction of subsidy clawbacks, CPF accrued interest refunds, and conveyancing/agent fees.
2. **Monthly Mortgage Calculator (`src/components/MortgageCalculator.tsx`)**:
   - HDB Concessionary (2.60%) vs Bank Loans with loan tenure sliders (15–30 years).
   - Split between CPF OA monthly contributions and out-of-pocket cash.
   - Statutory Mortgage Servicing Ratio (MSR capped at 30%) and TDSR gauge.
3. **Neighboring Resale HDB Comparison (`src/components/ResaleComparison.tsx`)**:
   - Compares entry BTO price and PSF against actual town resale medians for 2-room, 3-room, 4-room, 5-room, and 3Gen units.
   - Benchmarks against 5-year recently MOP-ed clusters (e.g. *SkyVille @ Dawson*, *St George Towers*, *Woodlands Glen*).
   - Measures entry price discount cushion (typically 30%–45%).
4. **URA Master Plan Future Land Use Checker (`src/components/FutureLandUse.tsx`)**:
   - Evaluates price drivers (Cross Island Line CRL, Jurong Region Line JRL, RTS Link to Johor Bahru, Punggol Digital District, Jurong Lake District, primary schools <1km) and headwinds (high competing BTO supply, industrial corridors, MSCP facing).
5. **Long-Term Investment Growth Dashboard (`src/components/GrowthTimeline.tsx`)**:
   - Visualizes equity accumulation vs amortizing mortgage debt over 15 years.
   - Compares asset growth with risk-free CPF OA 2.5% compounding opportunity cost.
6. **Family PDF Export (`src/utils/pdfExport.ts`, `src/components/PdfExportModal.tsx`)**:
   - Generates and downloads a clean A4 PDF advisory report directly in-browser using `jspdf`.
7. **Vercel Serverless API Infrastructure (`api/health.js`, `api/ura.js`)**:
   - `/api/health.js`: Health monitoring with uptime, memory, node runtime, and API readiness.
   - `/api/ura.js`: Proxy for Singapore URA DataService token exchange and planning decisions, backed by verified public baseline fallbacks when keys are pending.

---

## Turn 2: Error Recovery

### User Request:
> "There was an unexpected error. Finish what you were doing."

### Action:
- Verified and resumed system lifecycle tasks, verified file tree and package configurations, installed required packages (`jspdf`), set up `metadata.json`, and configured local API dev server middlewares.

---

## Turn 3: Git Initialization & Initial Push

### User Request:
> `git push https://<GITHUB_PERSONAL_ACCESS_TOKEN>@github.com/lewislikun-ux/URAmcp.git`

### Action:
- Initialized local git repository in `/app/applet`.
- Configured user email (`lewislikun@gmail.com`) and username (`lewislikun-ux`).
- Corrected URL syntax (stripping redundant `@https://`).
- Added all 26 initial project files, committed under `"Initial commit: Singapore BTO MOP Valuation App with URA API & Health monitor"`.
- Pushed branch `main` to `https://github.com/lewislikun-ux/URAmcp.git`.
- Sanitized remote URL in git config.

---

## Turn 4: Push Status Verification

### User Request:
> `git push`

### Action:
- Verified working tree status (`git status`).
- Confirmed that branch `main` is completely in sync with `origin/main` (`Everything up-to-date`).

---

## Turn 5: Environment Variable Configuration

### User Request:
> "could you check on the .env.example, URA_ACCESS_KEY was not included."

### Action:
- Updated `.env.example` to document `URA_ACCESS_KEY` along with setup instructions for the URA Developer Portal (`https://www.ura.gov.sg/maps/api/`).
- Committed change with message: `"docs: add URA_ACCESS_KEY to .env.example"`.
- Pushed to `https://github.com/lewislikun-ux/URAmcp.git` (`main`).

---

## Turn 6: SLA OneMap Integration & Amenity Pricing Engine

### User Request:
> "i would like to include a onemap of singapore in regards to the webapp, include the necessary keys that is needed for the onemap, the onemap should show where is the bto location at, what other amenties would increase or decrease its pricing"

### Key Deliverables:
1. **Installed Leaflet & Types**:
   - Added `leaflet` and `@types/leaflet`.
   - Imported `leaflet/dist/leaflet.css` in `src/index.css`.
2. **SLA OneMap GIS Viewer (`src/components/OneMapViewer.tsx`)**:
   - Real-time tiles streaming from Singapore Land Authority (OneMap v2).
   - Theme toggle: Default, Minimalist Grey, and Night Mode.
   - Dynamic 500m (doorstep walking zone) and 1km (school admission boundary) cadastral rings.
3. **Amenity Pricing Impact Engine**:
   - Added exact Singapore coordinates and surrounding amenities to all BTO developments in `src/data/btoData.ts`.
   - Tagged price boosters (MRT transit, primary schools, shopping hubs, green corridors, healthcare) with `+X.X%` impact.
   - Tagged price headwinds (expressway noise, construction zones, industrial corridors) with `-X.X%` impact.
4. **API Integration & Keys**:
   - Created `/api/onemap.js` for token generation and address searching.
   - Updated `.env.example` with `ONEMAP_EMAIL`, `ONEMAP_PASSWORD`, and `ONEMAP_ACCESS_TOKEN`.
   - Updated `/api/health.js` and `ApiHealthModal.tsx` to monitor OneMap status.
5. **Git Push**:
   - Committed with `"feat: add Singapore SLA OneMap GIS integration with BTO locations and amenity pricing impact"`.
   - Pushed commit `302d715` to GitHub `main`.

---

## Turn 7: Export Chat History & Final Push

### User Request:
> "could you help to save the chat_history as a markdown and gitpush"

### Action:
- Compiled full engineering log and user discussion history into `CHAT_HISTORY.md`.
- Staged, committed, and pushed `CHAT_HISTORY.md` to `https://github.com/lewislikun-ux/URAmcp.git`.
