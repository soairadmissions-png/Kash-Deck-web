import React from 'react';

// Geometric Guilloche & Financial Wave Vectors for CashDeck fintech styling
export const CurrencyWaveVector: React.FC<{ className?: string }> = ({ className = 'w-full h-full text-emerald-600/10' }) => (
  <svg
    viewBox="0 0 400 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
    preserveAspectRatio="none"
  >
    <path
      d="M0 80 C 100 120, 200 40, 300 90 C 350 110, 380 70, 400 60 L 400 120 L 0 120 Z"
      fill="currentColor"
      opacity="0.25"
    />
    <path
      d="M0 65 C 80 20, 160 110, 260 50 C 330 10, 370 70, 400 45"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="4 4"
      opacity="0.4"
    />
    <path
      d="M0 95 C 120 40, 220 100, 320 60 C 360 40, 390 80, 400 75"
      stroke="currentColor"
      strokeWidth="2"
      opacity="0.6"
    />
  </svg>
);

export const SecurityPatternVector: React.FC<{ className?: string }> = ({ className = 'w-32 h-32 text-emerald-800/10' }) => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
  >
    <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
    <circle cx="80" cy="80" r="56" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    <circle cx="80" cy="80" r="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
    <circle cx="80" cy="80" r="24" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    <path d="M80 8 L80 152 M8 80 L152 80" stroke="currentColor" strokeWidth="0.75" opacity="0.25" />
    <path d="M29 29 L131 131 M29 131 L131 29" stroke="currentColor" strokeWidth="0.75" opacity="0.2" />
  </svg>
);

export const CardFlowVector: React.FC<{ className?: string }> = ({ className = 'w-48 h-32 text-slate-900/5' }) => (
  <svg
    viewBox="0 0 200 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
  >
    <path
      d="M10 100 C 60 20, 140 110, 190 30"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.5"
    />
    <path
      d="M10 110 C 70 40, 130 120, 190 50"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="4 4"
      opacity="0.3"
    />
    <circle cx="190" cy="30" r="4" fill="currentColor" opacity="0.6" />
    <circle cx="10" cy="100" r="4" fill="currentColor" opacity="0.4" />
  </svg>
);

export const ReconciliationNodesVector: React.FC<{ className?: string }> = ({ className = 'w-full h-12 text-emerald-600/30' }) => (
  <svg
    viewBox="0 0 300 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
  >
    <line x1="20" y1="20" x2="280" y2="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
    <circle cx="20" cy="20" r="6" fill="#047857" fillOpacity="0.2" stroke="#047857" strokeWidth="2" />
    <circle cx="150" cy="20" r="8" fill="#047857" fillOpacity="0.9" />
    <path d="M147 20 L149 22 L153 18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="280" cy="20" r="6" fill="#047857" fillOpacity="0.2" stroke="#047857" strokeWidth="2" />
  </svg>
);

export const LedgerGridVector: React.FC<{ className?: string }> = ({ className = 'w-full h-full text-slate-400/10' }) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
  >
    <defs>
      <pattern id="ledgerGrid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.75" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#ledgerGrid)" />
  </svg>
);
