import React from 'react';
import { Layers } from 'lucide-react';

interface BankLogoProps {
  bankName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BankLogo: React.FC<BankLogoProps> = ({ bankName, size = 'md', className = '' }) => {
  const normalized = bankName.toLowerCase().replace(/[\s-]/g, '');

  const dimensions = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-9 h-9 text-xs rounded-xl',
    lg: 'w-12 h-12 text-sm rounded-2xl'
  }[size];

  // Specific logo vector styling per bank/provider
  if (normalized.includes('all') || normalized === 'allaccounts') {
    return (
      <div
        className={`${dimensions} bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0 shadow-xs ring-1 ring-emerald-600/30 ${className}`}
        title="All Accounts"
      >
        <Layers className="w-4 h-4 text-emerald-100" />
      </div>
    );
  }

  if (normalized.includes('gtbank') || normalized.includes('gtco') || normalized.includes('gtb')) {
    return (
      <div
        className={`${dimensions} bg-[#e03a00] text-white flex items-center justify-center font-black tracking-tighter shrink-0 shadow-xs relative overflow-hidden select-none ${className}`}
        title="Guaranty Trust Bank"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/15 to-transparent pointer-events-none" />
        <span className="font-extrabold text-[13px] tracking-tight">GT</span>
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-90" />
      </div>
    );
  }

  if (normalized.includes('access')) {
    return (
      <div
        className={`${dimensions} bg-[#005baa] text-white flex items-center justify-center shrink-0 shadow-xs relative overflow-hidden select-none ${className}`}
        title="Access Bank"
      >
        <svg viewBox="0 0 32 32" className="w-5 h-5 fill-current">
          <path d="M16 6 L26 16 L22 20 L16 14 L10 20 L6 16 Z" fill="#ffffff" />
          <path d="M16 16 L22 22 L20 24 L16 20 L12 24 L10 22 Z" fill="#f59e0b" />
        </svg>
      </div>
    );
  }

  if (normalized.includes('uba')) {
    return (
      <div
        className={`${dimensions} bg-[#dc2626] text-white flex items-center justify-center font-black shrink-0 shadow-xs relative select-none ${className}`}
        title="United Bank for Africa"
      >
        <span className="font-black text-[11px] tracking-tight">UBA</span>
      </div>
    );
  }

  if (normalized.includes('opay')) {
    return (
      <div
        className={`${dimensions} bg-[#059669] text-white flex items-center justify-center font-black shrink-0 shadow-xs relative overflow-hidden select-none ${className}`}
        title="OPay"
      >
        <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-200" />
        </div>
      </div>
    );
  }

  if (normalized.includes('zenith')) {
    return (
      <div
        className={`${dimensions} bg-[#991b1b] text-white flex items-center justify-center font-black shrink-0 shadow-xs relative select-none ${className}`}
        title="Zenith Bank"
      >
        <span className="font-black text-[14px] italic">Z</span>
      </div>
    );
  }

  if (normalized.includes('firstbank') || normalized.includes('first')) {
    return (
      <div
        className={`${dimensions} bg-[#0b2341] text-[#fbbf24] flex items-center justify-center font-bold shrink-0 shadow-xs relative select-none ${className}`}
        title="First Bank of Nigeria"
      >
        <span className="font-extrabold text-[11px] tracking-tight">FBN</span>
      </div>
    );
  }

  if (normalized.includes('kuda')) {
    return (
      <div
        className={`${dimensions} bg-[#40196d] text-white flex items-center justify-center font-extrabold shrink-0 shadow-xs relative select-none ${className}`}
        title="Kuda Bank"
      >
        <span className="font-black text-[13px]">K</span>
      </div>
    );
  }

  if (normalized.includes('palmpay')) {
    return (
      <div
        className={`${dimensions} bg-[#7c3aed] text-white flex items-center justify-center font-extrabold shrink-0 shadow-xs relative select-none ${className}`}
        title="PalmPay"
      >
        <span className="font-bold text-[12px]">P</span>
      </div>
    );
  }

  if (normalized.includes('stanbic')) {
    return (
      <div
        className={`${dimensions} bg-[#0284c7] text-white flex items-center justify-center font-bold shrink-0 shadow-xs relative select-none ${className}`}
        title="Stanbic IBTC"
      >
        <span className="font-bold text-[11px]">SB</span>
      </div>
    );
  }

  if (normalized.includes('moniepoint')) {
    return (
      <div
        className={`${dimensions} bg-[#003399] text-white flex items-center justify-center font-bold shrink-0 shadow-xs relative select-none ${className}`}
        title="Moniepoint"
      >
        <div className="w-5 h-5 rounded-full border-2 border-[#ffcc00] flex items-center justify-center">
          <span className="text-[10px] font-black text-[#ffcc00]">M</span>
        </div>
      </div>
    );
  }

  if (normalized.includes('fidelity')) {
    return (
      <div
        className={`${dimensions} bg-[#102a45] text-[#22c55e] flex items-center justify-center font-bold shrink-0 shadow-xs relative select-none ${className}`}
        title="Fidelity Bank"
      >
        <span className="font-bold text-[11px] text-[#22c55e]">FID</span>
      </div>
    );
  }

  if (normalized.includes('fcmb')) {
    return (
      <div
        className={`${dimensions} bg-[#5c2d91] text-[#ffdd00] flex items-center justify-center font-bold shrink-0 shadow-xs relative select-none ${className}`}
        title="FCMB"
      >
        <span className="font-black text-[11px]">FCMB</span>
      </div>
    );
  }

  // Fallback for custom or cash
  return (
    <div
      className={`${dimensions} bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${className}`}
    >
      {bankName.slice(0, 2).toUpperCase()}
    </div>
  );
};
