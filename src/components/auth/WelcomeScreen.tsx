import React from 'react';
import { ShieldCheck, ArrowRight, TrendingUp, Building, UserCheck } from 'lucide-react';
import { CurrencyWaveVector, SecurityPatternVector } from '../common/UiVectors';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen bg-[#edf4f0] flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative Vectors */}
      <div className="absolute -right-16 -top-16 w-80 h-80 pointer-events-none opacity-20">
        <SecurityPatternVector className="text-emerald-700" />
      </div>
      <div className="absolute left-0 bottom-0 w-full h-48 pointer-events-none opacity-25">
        <CurrencyWaveVector className="text-emerald-600" />
      </div>

      {/* Top Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#047857] to-[#10b981] flex items-center justify-center text-white shadow-xs">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <line x1="12" y1="22" x2="12" y2="15.5" />
              <polyline points="22 8.5 12 15.5 2 8.5" />
            </svg>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-emerald-950">CashDeck</span>
        </div>

        <button
          onClick={onSignIn}
          className="px-4 py-2 text-xs sm:text-sm font-bold text-emerald-900 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-200/80 shadow-xs transition-colors"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-2xl w-full mx-auto my-auto text-center py-10 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Built for Nigeria • Personal & Business Money</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Your money, finally in one place.
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          Understand where every naira goes, track real profit and cash flow, and build genuine financial clarity with intelligent diagnostics.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 text-left">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 mb-2.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Understand Cash Flow</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Know exactly what you earned, spent, and saved every month.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 mb-2.5">
              <Building className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Separate Workspaces</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Never mix personal living expenses with business operating revenue.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700 mb-2.5">
              <UserCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Honest Diagnostics</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">No accounting jargon or fake numbers. Real ledger facts only.</p>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#047857] hover:bg-emerald-800 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            <span>Get Started with CashDeck</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 py-4 z-10">
        Strict privacy • Bank-grade encrypted storage • NDPA compliant
      </footer>
    </div>
  );
};
