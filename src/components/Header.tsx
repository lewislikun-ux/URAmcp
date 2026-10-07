/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileDown, Activity, Sparkles, Building2, Calculator, BarChart3, Compass, TrendingUp, MapPin } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPdfModal: () => void;
  onOpenHealthModal: () => void;
  apiHealthy: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenPdfModal,
  onOpenHealthModal,
  apiHealthy,
}) => {
  const tabs = [
    { id: 'valuation', label: 'MOP Valuation', icon: Building2 },
    { id: 'onemap', label: 'SLA OneMap & Amenities', icon: MapPin },
    { id: 'mortgage', label: 'Mortgage Calculator', icon: Calculator },
    { id: 'resale', label: 'Neighbor Resale Comps', icon: BarChart3 },
    { id: 'landuse', label: 'URA Future Land Use', icon: Compass },
    { id: 'growth', label: 'Investment Growth', icon: TrendingUp },
  ];

  return (
    <header className="border-b border-slate-200/80 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm">
              SG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  BTO MOP Valuation
                </h1>
                <span className="text-slate-400 hidden sm:inline">·</span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">Singapore Housing Intelligence</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Post-MOP pricing forecaster, mortgage servicing, and URA Master Plan analysis
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* API Health Monitor Button */}
            <button
              onClick={onOpenHealthModal}
              title="Check Vercel API & URA Service Health"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${apiHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <Activity className="w-3.5 h-3.5 text-slate-600 hidden xs:inline" />
              <span>API Health</span>
            </button>

            {/* Export PDF Button */}
            <button
              onClick={onOpenPdfModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm"
            >
              <FileDown className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Clean, sleek, mobile-scrollable */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
