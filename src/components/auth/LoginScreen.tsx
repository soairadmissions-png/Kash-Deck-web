import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthHeader } from '../common/AuthHeader';
import { WalletIllustration } from '../common/AuthIllustrations';

interface LoginScreenProps {
  onSuccess: () => void;
  onNavigateToSignUp: () => void;
  onForgotPassword: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onNavigateToSignUp,
  onForgotPassword
}) => {
  const { login } = useAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailOrPhone.trim() || !password) {
      setErrorMessage('Please enter your email or phone number and password');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: emailOrPhone.trim(), password });
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf4f0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto">
        <AuthHeader
          rightAction={{
            text: "Don't have an account?",
            actionText: 'Create account',
            onAction: onNavigateToSignUp
          }}
        />
      </div>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto my-auto py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Wallet Illustration */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center text-center">
            <WalletIllustration size={320} />
          </div>

          {/* Right Column: Sign In Form Card */}
          <div className="lg:col-span-7 max-w-md w-full mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome back
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Sign in to continue managing your finances.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email or phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email or phone
                  </label>
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={e => setEmailOrPhone(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password link */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-xs font-semibold text-[#047857] hover:text-emerald-800 hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 py-3.5 px-6 bg-[#047857] hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>

                {/* Quick Demo Fill */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailOrPhone('demo@cashdeck.ng');
                      setPassword('Password123!');
                    }}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline transition-colors cursor-pointer"
                  >
                    Quick fill Demo credentials (demo@cashdeck.ng)
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-3">
        CashDeck Financial Operating System • NDPA Compliant
      </footer>
    </div>
  );
};
