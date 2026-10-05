import React from 'react';

/**
 * High-fidelity vector illustrations matching the CashDeck reference UI:
 * 1. WalletIllustration (Sign Up, Sign In, Onboarding Welcome)
 * 2. ShieldVerifyIllustration (Account Verification)
 * 3. SuccessCheckIllustration (Verification Success & Password Reset Success)
 * 4. PadlockIllustration (Forgot Password & Password Reset)
 * 5. ConnectedAccountsIllustration (Connect Financial Accounts)
 */

export const WalletIllustration: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 280
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          {/* Ambient Glows */}
          <radialGradient id="walletAmbient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#ecfdf5" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#edf4f0" stopOpacity="0" />
          </radialGradient>

          {/* Wallet Body Gradients */}
          <linearGradient id="walletBody" x1="40" y1="120" x2="240" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="60%" stopColor="#047857" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>

          <linearGradient id="walletFlap" x1="160" y1="140" x2="250" y2="210" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Cards Gradients */}
          <linearGradient id="cardGrad1" x1="100" y1="90" x2="220" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="cardGrad2" x1="80" y1="110" x2="200" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {/* Badge Glow */}
          <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#047857" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Ambient Background Circles */}
        <circle cx="160" cy="160" r="140" fill="url(#walletAmbient)" />
        <circle cx="160" cy="160" r="110" stroke="#a7f3d0" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />

        {/* FLOATING ORBIT BADGE 1: Bar Chart (Top Left) */}
        <g transform="translate(48, 56)" filter="url(#badgeShadow)">
          <circle cx="24" cy="24" r="22" fill="#ffffff" stroke="#d1fae5" strokeWidth="2" />
          {/* Chart Bars */}
          <rect x="13" y="24" width="4.5" height="10" rx="1.5" fill="#10b981" />
          <rect x="21" y="18" width="4.5" height="16" rx="1.5" fill="#059669" />
          <rect x="29" y="13" width="4.5" height="21" rx="1.5" fill="#047857" />
          {/* Trending Arrow */}
          <path d="M12 21L19 15L25 18L33 10" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M29 10H33V14" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* FLOATING ORBIT BADGE 2: Target / Goal (Top Right) */}
        <g transform="translate(228, 64)" filter="url(#badgeShadow)">
          <circle cx="24" cy="24" r="22" fill="#ffffff" stroke="#d1fae5" strokeWidth="2" />
          {/* Target concentric rings */}
          <circle cx="24" cy="24" r="14" stroke="#10b981" strokeWidth="2" fill="none" />
          <circle cx="24" cy="24" r="8" stroke="#059669" strokeWidth="2" fill="none" />
          <circle cx="24" cy="24" r="3" fill="#047857" />
          {/* Dart Arrow */}
          <path d="M27 21L35 13" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* FLOATING ORBIT BADGE 3: Bank / Columns (Bottom Left) */}
        <g transform="translate(44, 212)" filter="url(#badgeShadow)">
          <circle cx="24" cy="24" r="22" fill="#ffffff" stroke="#d1fae5" strokeWidth="2" />
          {/* Bank Pediment & Pillars */}
          <path d="M13 19L24 13L35 19H13Z" fill="#047857" />
          <rect x="15" y="21" width="3" height="9" rx="0.5" fill="#059669" />
          <rect x="22.5" y="21" width="3" height="9" rx="0.5" fill="#059669" />
          <rect x="30" y="21" width="3" height="9" rx="0.5" fill="#059669" />
          <rect x="12" y="31" width="24" height="2.5" rx="1" fill="#047857" />
        </g>

        {/* FLOATING ORBIT BADGE 4: Store / Business (Bottom Right) */}
        <g transform="translate(232, 206)" filter="url(#badgeShadow)">
          <circle cx="24" cy="24" r="22" fill="#ffffff" stroke="#d1fae5" strokeWidth="2" />
          {/* Storefront */}
          <path d="M14 18L16 13H32L34 18H14Z" fill="#047857" />
          <path d="M14 18C14 19.5 15.5 20.5 17 20.5C18.5 20.5 20 19.5 20 18C20 19.5 21.5 20.5 24 20.5C26.5 20.5 28 19.5 28 18C28 19.5 29.5 20.5 31 20.5C32.5 20.5 34 19.5 34 18" stroke="#10b981" strokeWidth="1.5" />
          <rect x="16" y="21" width="16" height="11" rx="1" fill="#ecfdf5" stroke="#047857" strokeWidth="1.5" />
          <rect x="21" y="25" width="6" height="7" rx="0.5" fill="#047857" />
        </g>

        {/* WALLET BACKDROP & SHADOW */}
        <ellipse cx="160" cy="254" rx="72" ry="12" fill="#047857" opacity="0.18" />

        {/* CREDIT CARDS PEEKING OUT */}
        {/* Card 2 (Behind) */}
        <rect
          x="108"
          y="106"
          width="104"
          height="64"
          rx="8"
          transform="rotate(-8 108 106)"
          fill="url(#cardGrad2)"
          stroke="#a7f3d0"
          strokeWidth="1.5"
        />
        {/* Card 1 (Front Card) */}
        <rect
          x="118"
          y="114"
          width="100"
          height="60"
          rx="8"
          transform="rotate(4 118 114)"
          fill="url(#cardGrad1)"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        {/* Card Chip & Magnetic Band Detail */}
        <rect x="132" y="128" width="14" height="11" rx="2" fill="#fef3c7" opacity="0.9" />

        {/* WALLET MAIN BODY */}
        <rect
          x="88"
          y="140"
          width="144"
          height="102"
          rx="18"
          fill="url(#walletBody)"
          stroke="#065f46"
          strokeWidth="2"
        />

        {/* Fine leather seam stitch line */}
        <rect
          x="94"
          y="146"
          width="132"
          height="90"
          rx="14"
          stroke="#34d399"
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity="0.45"
          fill="none"
        />

        {/* WALLET CLOSURE FLAP */}
        <path
          d="M172 170 H234 C239 170 242 174 242 179 V203 C242 208 239 212 234 212 H172 Z"
          fill="url(#walletFlap)"
          stroke="#065f46"
          strokeWidth="1.5"
        />

        {/* Flap Stitch */}
        <path
          d="M176 175 H231 C234 175 236 177 236 181 V201 C236 205 234 207 231 207 H176"
          stroke="#a7f3d0"
          strokeWidth="1"
          strokeDasharray="3 2"
          opacity="0.6"
          fill="none"
        />

        {/* Metallic Snap Button */}
        <circle cx="218" cy="191" r="7.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="218" cy="191" r="4.5" fill="#10b981" />

        {/* Subtle decorative particles */}
        <circle cx="98" cy="80" r="2.5" fill="#10b981" opacity="0.6" />
        <circle cx="226" cy="132" r="2" fill="#34d399" opacity="0.7" />
        <circle cx="82" cy="180" r="2" fill="#059669" opacity="0.5" />
        <circle cx="248" cy="154" r="3" fill="#a7f3d0" opacity="0.8" />
      </svg>
    </div>
  );
};

export const ShieldVerifyIllustration: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 130
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft circle background */}
        <circle cx="80" cy="80" r="68" fill="#d1fae5" opacity="0.7" />
        <circle cx="80" cy="80" r="54" fill="#a7f3d0" opacity="0.6" />

        {/* Shield */}
        <path
          d="M80 40 L108 52 V80 C108 98 96 113 80 120 C64 113 52 98 52 80 V52 L80 40 Z"
          fill="#047857"
          stroke="#065f46"
          strokeWidth="2.5"
        />

        {/* Inner shield gleam */}
        <path
          d="M80 46 L102 56 V78 C102 93 92 105 80 112 C68 105 58 93 58 78 V56 L80 46 Z"
          fill="#059669"
        />

        {/* Checkmark */}
        <path
          d="M70 78 L77 85 L92 70"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const SuccessCheckIllustration: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 130
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Ambient Ring & Burst Dots */}
        <circle cx="80" cy="80" r="70" fill="#ecfdf5" />
        <circle cx="80" cy="80" r="56" fill="#d1fae5" opacity="0.8" />

        {/* Orbit Dots */}
        <circle cx="42" cy="56" r="3" fill="#10b981" />
        <circle cx="118" cy="52" r="3.5" fill="#047857" />
        <circle cx="126" cy="98" r="2.5" fill="#34d399" />
        <circle cx="36" cy="104" r="3" fill="#059669" />

        {/* Central Bold Green Badge */}
        <circle cx="80" cy="80" r="36" fill="#047857" stroke="#059669" strokeWidth="3" />

        {/* Checkmark */}
        <path
          d="M68 80 L76 88 L94 70"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const PadlockIllustration: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 130
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft background aura */}
        <circle cx="80" cy="80" r="66" fill="#d1fae5" opacity="0.75" />
        <circle cx="80" cy="80" r="52" fill="#a7f3d0" opacity="0.6" />

        {/* Shackle */}
        <path
          d="M65 72 V58 C65 49.7 71.7 43 80 43 C88.3 43 95 49.7 95 58 V72"
          stroke="#047857"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Padlock Body */}
        <rect
          x="54"
          y="70"
          width="52"
          height="42"
          rx="10"
          fill="#047857"
          stroke="#065f46"
          strokeWidth="2"
        />

        {/* Keyhole */}
        <circle cx="80" cy="88" r="4" fill="#ffffff" />
        <path d="M78.5 90 L77 101 H83 L81.5 90 Z" fill="#ffffff" />
      </svg>
    </div>
  );
};

export const ConnectedAccountsIllustration: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 240
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: 110 }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 320 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Background rounded cluster */}
        <rect x="20" y="15" width="280" height="90" rx="45" fill="#e6f7f2" opacity="0.7" />

        {/* Connecting linking line */}
        <line x1="90" y1="60" x2="230" y2="60" stroke="#047857" strokeWidth="2.5" strokeDasharray="5 5" opacity="0.5" />

        {/* NODE 1: Bank (Left) */}
        <g transform="translate(65, 34)">
          <circle cx="26" cy="26" r="24" fill="#ffffff" stroke="#a7f3d0" strokeWidth="2" />
          <path d="M17 23L26 18L35 23H17Z" fill="#047857" />
          <rect x="19" y="24" width="2.5" height="8" rx="0.5" fill="#059669" />
          <rect x="25" y="24" width="2.5" height="8" rx="0.5" fill="#059669" />
          <rect x="31" y="24" width="2.5" height="8" rx="0.5" fill="#059669" />
          <rect x="16" y="33" width="20" height="2" rx="0.5" fill="#047857" />
        </g>

        {/* NODE 2: Padlock (Center) */}
        <g transform="translate(134, 32)">
          <circle cx="26" cy="26" r="26" fill="#047857" stroke="#059669" strokeWidth="2" />
          {/* Shackle */}
          <path d="M21 24V19C21 16.2 23.2 14 26 14C28.8 14 31 16.2 31 19V24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Body */}
          <rect x="17" y="24" width="18" height="15" rx="3" fill="#ffffff" />
          <circle cx="26" cy="30" r="1.5" fill="#047857" />
          <path d="M25.5 31L25 35H27L26.5 31Z" fill="#047857" />
        </g>

        {/* NODE 3: Card / Wallet (Right) */}
        <g transform="translate(205, 34)">
          <circle cx="26" cy="26" r="24" fill="#ffffff" stroke="#a7f3d0" strokeWidth="2" />
          {/* Credit card */}
          <rect x="15" y="19" width="22" height="15" rx="2.5" fill="#059669" />
          <line x1="15" y1="23" x2="37" y2="23" stroke="#047857" strokeWidth="2" />
          <rect x="18" y="27" width="5" height="3" rx="0.5" fill="#fef3c7" />
        </g>
      </svg>
    </div>
  );
};
