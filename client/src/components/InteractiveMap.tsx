import React, { useState } from 'react';
import { ExternalLink, Navigation, CheckCircle2 } from 'lucide-react';

interface InteractiveMapProps {
  activeStop?: number;
  onSelectStop?: (stopNumber: number) => void;
}

interface MapMarker {
  number: number;
  name: string;
  category: string;
  x: number;
  y: number;
  time: string;
}

const STOPS: MapMarker[] = [
  { number: 1, name: 'Fort Aguada', category: 'Heritage', x: 105, y: 310, time: '09:00 AM' },
  { number: 2, name: 'Candolim Beach', category: 'Beach Walk', x: 120, y: 260, time: '11:00 AM' },
  { number: 3, name: 'Gunpowder', category: 'Lunch', x: 195, y: 195, time: '01:30 PM' },
  { number: 4, name: 'Baga Beach', category: 'Water Sports', x: 155, y: 175, time: '04:00 PM' },
  { number: 5, name: 'Thalassa', category: 'Cliffside Dinner', x: 170, y: 110, time: '07:30 PM' },
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ activeStop = 1, onSelectStop }) => {
  const [hoveredStop, setHoveredStop] = useState<number | null>(null);
  const selectedStop = STOPS.find((s) => s.number === (hoveredStop || activeStop)) || STOPS[0];

  return (
    <div id="north-goa-map-container" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm tracking-tight">North Goa Route Map</h3>
            <p className="text-xs text-slate-500 font-medium">Total: 24.9 km • ~1h 15m drive</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60">
          5 Waypoints
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="relative my-3 rounded-xl overflow-hidden bg-[#e8f1f5] border border-slate-200/80 aspect-[4/3] flex items-center justify-center">
        <svg viewBox="0 0 340 380" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          {/* Water gradient */}
          <defs>
            <linearGradient id="seaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4edf4" />
              <stop offset="100%" stopColor="#c3e4ee" />
            </linearGradient>
            <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f3f6ec" />
              <stop offset="100%" stopColor="#e7ede0" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Sea base */}
          <rect width="340" height="380" fill="url(#seaGrad)" />

          {/* Coastal Land contour */}
          <path
            d="M 120 0 
               Q 140 40, 160 80 
               T 170 120 
               Q 150 140, 145 160 
               T 140 210 
               Q 120 230, 110 250 
               T 95 300 
               Q 90 330, 130 360 
               L 340 380 
               L 340 0 Z"
            fill="url(#landGrad)"
            stroke="#c8d7bd"
            strokeWidth="1.5"
          />

          {/* River Inlets (Chapora & Mandovi) */}
          <path
            d="M 160 80 Q 200 85, 260 70 T 340 60"
            fill="none"
            stroke="#c3e4ee"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 105 310 Q 170 320, 240 340 T 340 350"
            fill="none"
            stroke="#c3e4ee"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Internal roads */}
          <path
            d="M 105 310 Q 115 285, 120 260 T 155 175 Q 190 185, 195 195 T 170 110"
            fill="none"
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Animated Route Path */}
          <path
            d="M 105 310 L 120 260 L 195 195 L 155 175 L 170 110"
            fill="none"
            stroke="#0d9488"
            strokeWidth="3.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />

          {/* Location Labels on Land */}
          <text x="215" y="85" fontSize="9" fill="#788c6e" fontWeight="600">Siolim / Chapora</text>
          <text x="215" y="180" fontSize="9" fill="#788c6e" fontWeight="600">Assagao</text>
          <text x="220" y="270" fontSize="9" fill="#788c6e" fontWeight="600">Mapusa Inland</text>
          <text x="40" y="200" fontSize="10" fill="#6797a7" fontStyle="italic" fontWeight="500">Arabian Sea</text>

          {/* Markers */}
          {STOPS.map((stop) => {
            const isActive = (hoveredStop || activeStop) === stop.number;
            return (
              <g
                key={stop.number}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => onSelectStop && onSelectStop(stop.number)}
                onMouseEnter={() => setHoveredStop(stop.number)}
                onMouseLeave={() => setHoveredStop(null)}
                id={`map-pin-${stop.number}`}
              >
                {/* Active pulse ring */}
                {isActive && (
                  <circle
                    cx={stop.x}
                    cy={stop.y}
                    r="18"
                    fill="#0d9488"
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Pin Circle */}
                <circle
                  cx={stop.x}
                  cy={stop.y}
                  r={isActive ? "13" : "11"}
                  fill={isActive ? "#0f172a" : "#0d9488"}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  filter="url(#shadow)"
                />

                {/* Number inside */}
                <text
                  x={stop.x}
                  y={stop.y + 4}
                  fontSize="11"
                  fontWeight="700"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  {stop.number}
                </text>

                {/* Stop Label pill on hover or active */}
                {isActive && (
                  <g>
                    <rect
                      x={stop.x + 16}
                      y={stop.y - 14}
                      width={stop.name.length * 7 + 16}
                      height="24"
                      rx="6"
                      fill="#0f172a"
                      filter="url(#shadow)"
                    />
                    <text
                      x={stop.x + 24}
                      y={stop.y + 2}
                      fontSize="11"
                      fontWeight="600"
                      fill="#ffffff"
                    >
                      {stop.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Mini Legend inside map */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200/90 shadow-xs flex items-center gap-2 text-[11px] text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{selectedStop.number}. {selectedStop.name} ({selectedStop.time})</span>
        </div>
      </div>

      {/* Traffic notice and Open in Google Maps */}
      <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Normal coastal traffic expected</span>
        </div>
        <a
          href="https://maps.google.com/?q=Goa+India"
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 hover:text-orange-700 font-semibold inline-flex items-center gap-1 hover:underline"
        >
          Open in Google Maps
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
