/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { BtoProject, BtoAmenity } from '../types/bto';
import { formatPct } from '../utils/calculator';
import {
  MapPin,
  Layers,
  Train,
  GraduationCap,
  ShoppingBag,
  Trees,
  HeartPulse,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface OneMapViewerProps {
  selectedProject: BtoProject;
}

export const OneMapViewer: React.FC<OneMapViewerProps> = ({ selectedProject }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapTheme, setMapTheme] = useState<'Default' | 'Grey' | 'Night'>('Default');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showRadiusCircles, setShowRadiusCircles] = useState<boolean>(true);
  const [selectedAmenity, setSelectedAmenity] = useState<BtoAmenity | null>(null);

  // OneMap tile URLs
  const tileUrls = {
    Default: 'https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png',
    Grey: 'https://www.onemap.gov.sg/maps/tiles/Grey/{z}/{x}/{y}.png',
    Night: 'https://www.onemap.gov.sg/maps/tiles/Night/{z}/{x}/{y}.png',
  };

  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: selectedProject.coordinates,
        zoom: 15,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      // Add OneMap tile layer
      const tiles = L.tileLayer(tileUrls[mapTheme], {
        maxZoom: 18,
        minZoom: 11,
        detectRetina: true,
      }).addTo(map);

      tileLayerRef.current = tiles;

      // Create layers
      markersLayerRef.current = L.layerGroup().addTo(map);
      circlesLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Theme when user toggles
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(tileUrls[mapTheme]);
  }, [mapTheme]);

  // Update Markers, Circles, and Center when Project or Category changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const circlesLayer = circlesLayerRef.current;
    if (!map || !markersLayer || !circlesLayer) return;

    // Clear previous elements
    markersLayer.clearLayers();
    circlesLayer.clearLayers();

    const [lat, lng] = selectedProject.coordinates;
    map.setView([lat, lng], 15, { animate: true });

    // 1. Draw 500m & 1km radius rings
    if (showRadiusCircles) {
      const circle500 = L.circle([lat, lng], {
        radius: 500,
        color: '#0d9488', // teal
        fillColor: '#0d9488',
        fillOpacity: 0.06,
        weight: 1.5,
        dashArray: '4, 4',
      }).bindTooltip('500m Doorstep Walk Zone', { permanent: false, direction: 'top' });

      const circle1000 = L.circle([lat, lng], {
        radius: 1000,
        color: '#0284c7', // sky
        fillColor: '#0284c7',
        fillOpacity: 0.03,
        weight: 1.5,
        dashArray: '6, 6',
      }).bindTooltip('1km Primary School Admission Zone', { permanent: false, direction: 'top' });

      circlesLayer.addLayer(circle500);
      circlesLayer.addLayer(circle1000);
    }

    // 2. Add Main BTO Marker
    const btoIconHtml = `
      <div style="background-color: #0f172a; color: white; border-radius: 9999px; padding: 7px; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      </div>
    `;

    const btoIcon = L.divIcon({
      html: btoIconHtml,
      className: 'bto-marker-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const btoMarker = L.marker([lat, lng], { icon: btoIcon })
      .bindPopup(
        `<div style="font-family: inherit; font-size: 12px;">
          <strong style="font-size: 13px; color: #0f172a;">${selectedProject.name}</strong><br/>
          <span style="color: #64748b;">Town: ${selectedProject.town}</span><br/>
          <span style="color: #0d9488; font-weight: 600;">${selectedProject.classification} (${selectedProject.mopYears}-Yr MOP)</span><br/>
          <span style="font-size: 11px; color: #475569;">${selectedProject.mrtProximity}</span>
        </div>`
      );

    markersLayer.addLayer(btoMarker);

    // 3. Add Surrounding Amenity Markers
    const filteredAmenities = selectedProject.surroundingAmenities.filter((amenity) => {
      if (activeCategory === 'all') return true;
      if (activeCategory === 'positive') return amenity.type === 'positive';
      if (activeCategory === 'negative') return amenity.type === 'negative';
      return amenity.category === activeCategory;
    });

    filteredAmenities.forEach((amenity) => {
      const isPositive = amenity.type === 'positive';
      const bgColor = isPositive ? (amenity.category === 'school' ? '#d97706' : '#0d9488') : '#e11d48';

      let iconSvg = '';
      if (amenity.category === 'mrt') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>`;
      } else if (amenity.category === 'school') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
      } else if (amenity.category === 'mall') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
      } else if (amenity.category === 'park') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-4 4.3a1 1 0 0 0 .8 1.7H10l-3 3.3a1 1 0 0 0 .7 1.7H10l-3 3.3a1 1 0 0 0 .7 1.7H12"/></svg>`;
      } else {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
      }

      const amenityIconHtml = `
        <div style="background-color: ${bgColor}; color: white; border-radius: 9999px; padding: 5px; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; cursor: pointer;">
          ${iconSvg}
        </div>
      `;

      const amenityIcon = L.divIcon({
        html: amenityIconHtml,
        className: 'amenity-marker-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(amenity.coordinates, { icon: amenityIcon })
        .bindPopup(
          `<div style="font-family: inherit; font-size: 11px; line-height: 1.4;">
            <strong style="font-size: 12px; color: #0f172a;">${amenity.name}</strong><br/>
            <span style="color: #64748b;">Distance: ${amenity.distanceMeters}m from BTO</span><br/>
            <span style="color: ${isPositive ? '#0d9488' : '#e11d48'}; font-weight: 700;">
              Valuation Impact: ${formatPct(amenity.impactPct)}
            </span><br/>
            <p style="margin-top: 4px; color: #334155; font-size: 11px;">${amenity.description}</p>
          </div>`
        );

      marker.on('click', () => {
        setSelectedAmenity(amenity);
      });

      markersLayer.addLayer(marker);
    });
  }, [selectedProject, activeCategory, showRadiusCircles]);

  // Recenter helper
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(selectedProject.coordinates, 15, { animate: true });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  // Compute total positive vs negative impact from all amenities
  const totalPositiveImpact = selectedProject.surroundingAmenities
    .filter((a) => a.type === 'positive')
    .reduce((acc, a) => acc + a.impactPct, 0);

  const totalNegativeImpact = selectedProject.surroundingAmenities
    .filter((a) => a.type === 'negative')
    .reduce((acc, a) => acc + a.impactPct, 0);

  const netAmenityImpact = totalPositiveImpact + totalNegativeImpact;

  return (
    <div className="space-y-4">
      {/* Top Map Header & Controls */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-700" />
              Singapore SLA OneMap · {selectedProject.name}
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
              Official SLA GIS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time geospatial layout of BTO plot, 500m doorstep walk zone, and 1km primary school admission radius
          </p>
        </div>

        {/* Right Map Options */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tile Layer Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            {(['Default', 'Grey', 'Night'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setMapTheme(style)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  mapTheme === style
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {/* Toggle Radius */}
          <button
            onClick={() => setShowRadiusCircles(!showRadiusCircles)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              showRadiusCircles
                ? 'bg-teal-50 border-teal-300 text-teal-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span>500m / 1km Rings</span>
          </button>
        </div>
      </div>

      {/* Main Map Box & Side Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Container (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs relative flex flex-col min-h-[460px] h-[520px]">
          {/* Category Filter Chips Bar */}
          <div className="p-2 border-b border-slate-100 bg-white/95 backdrop-blur-xs flex items-center gap-1 overflow-x-auto no-scrollbar z-10">
            {[
              { id: 'all', label: 'All Amenities' },
              { id: 'mrt', label: 'Transit (MRT)' },
              { id: 'school', label: 'Primary Schools' },
              { id: 'mall', label: 'Malls & Hawkers' },
              { id: 'park', label: 'Parks & Trails' },
              { id: 'negative', label: 'Headwinds / Risks' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Leaflet Map Target */}
          <div ref={mapContainerRef} className="flex-1 w-full h-full relative z-0" />

          {/* Floating Map Floating Controls */}
          <div className="absolute right-3 bottom-8 flex flex-col gap-1.5 z-20">
            <button
              onClick={handleRecenter}
              title="Recenter on BTO"
              className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Map Legend */}
          <div className="p-2.5 border-t border-slate-100 bg-white/95 backdrop-blur-xs flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2 z-10">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                <span>BTO Site</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                <span>Transit / Malls / Parks</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <span>Primary School</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>Headwinds</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Tiles © Singapore Land Authority (OneMap v2)
            </div>
          </div>
        </div>

        {/* Right Side: Proximity Pricing Intelligence (1 Col) */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Geospatial Valuation Impact
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-extrabold font-mono text-teal-700">
                  {formatPct(netAmenityImpact)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Doorstep Infrastructure Upside
                </span>
              </div>
            </div>

            {/* List of nearby amenities */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900">
                Surrounding Key Points of Interest:
              </h4>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {selectedProject.surroundingAmenities.map((amenity) => {
                  const isSelected = selectedAmenity?.id === amenity.id;
                  const isPositive = amenity.type === 'positive';
                  return (
                    <div
                      key={amenity.id}
                      onClick={() => {
                        setSelectedAmenity(amenity);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.setView(amenity.coordinates, 16, { animate: true });
                        }
                      }}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                          : 'border-slate-200/80 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {amenity.name}
                        </span>
                        <span
                          className={`text-xs font-bold font-mono shrink-0 ${
                            isPositive ? 'text-teal-700' : 'text-rose-600'
                          }`}
                        >
                          {formatPct(amenity.impactPct)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>{amenity.distanceMeters}m away</span>
                        <span className="capitalize">{amenity.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SLA OneMap Notice */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-700" />
              SLA 1km Distance Rule
            </div>
            <p className="text-[11px] leading-relaxed">
              Distances are measured from the residential block perimeter using official Singapore Land Authority cadastral standards. Properties located within 1km of top schools qualify for Phase 2C admission priority.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
