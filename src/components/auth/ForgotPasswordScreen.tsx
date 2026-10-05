import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { apiV1 } from '../../services/apiV1';
import { AuthHeader } from '../common/AuthHeader';
import { PadlockIllustration, SuccessCheckIllustration } from '../common/AuthIllustrations';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBackToLogin }) => {
  // Step 1: 'request' (Screen 5), Step 2: 'verify' (Screen 6), Step 3: 'new_password' (Screen 7), Step 4: 'success' (Screen 8)
  const [step, setStep] = useState<'request' | 'verify' | 'new_password' | 'success'>('request');

  const [identifier, setIdentifier] = useState('');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (step !== 'verify') return;
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown, step]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-emerald-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-600' };
  };

  const strength = getPasswordStrength(newPassword);

  // STEP 1: Request code
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or phone number');
      return;
    }

    setIsLoading(true);
    try {
      await apiV1.forgotPassword(identifier.trim());
      setStep('verify');
      setResendCooldown(60);
      setCanResend(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify code
  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (!cleanVal) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    if (cleanVal.length > 1) {
      const next = [...digits];
      for (let i = 0; i < cleanVal.length && index + i < 6; i++) {
        next[index + i] = cleanVal[i];
      }
      setDigits(next);
      const nextIndex = Math.min(index + cleanVal.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = cleanVal;
    setDigits(next);

    if (index < 5 && cleanVal) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const code = digits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      await apiV1.verifyResetCode(identifier.trim(), code);
      setStep('new_password');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setErrorMessage(null);
    try {
      await apiV1.forgotPassword(identifier.trim());
      setResendCooldown(60);
      setCanResend(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code');
    }
  };

  // STEP 3: Set new password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage('Your new password must be at least 8 characters and include a number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await apiV1.resetPassword({
        identifier: identifier.trim(),
        code: digits.join(''),
        newPassword
      });
      setStep('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // SCREEN 8: RESET PASSWORD SUCCESS
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#edf4f0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full mx-auto">
          <AuthHeader currentStep={4} totalSteps={4} />
        </div>

        <main className="max-w-md w-full mx-auto my-auto py-4">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md text-center">
            <div className="flex justify-center mb-6">
              <SuccessCheckIllustration size={135} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Password updated!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
              Your password has been reset successfully.
            </p>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full mt-8 py-3.5 px-6 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-400 py-3">
          CashDeck Financial Operating System • NDPA Compliant
        </footer>
      </div>
    );
  }

  // SCREEN 7: CREATE NEW PASSWORD
  if (step === 'new_password') {
    return (
      <div className="min-h-screen bg-[#edf4f0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full mx-auto">
          <AuthHeader
            currentStep={3}
            totalSteps={4}
          />

          <div className="pt-1 pb-3">
            <button
              type="button"
              onClick={() => setStep('verify')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 cursor-pointer"
            >
              <span className="text-slate-400">←</span>
              <span>Back</span>
            </button>
          </div>
        </div>

        <main className="max-w-md w-full mx-auto my-auto py-2">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md text-center">
            <div className="flex justify-center mb-5">
              <PadlockIllustration size={120} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create a new password
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
              Your new password must be at least 8 characters and include a number.
            </p>

            {errorMessage && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Create a password"
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 flex-1 max-w-[160px]">
                      {[1, 2, 3, 4].map(stepNum => (
                        <div
                          key={stepNum}
                          className={`h-1.5 flex-1 rounded-full ${
                            strength.score >= stepNum ? strength.color : 'bg-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-slate-500">
                      Password strength: <strong className="text-emerald-700">{strength.label}</strong>
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3.5 px-6 bg-[#047857] hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer"
              >
                {isLoading ? 'Resetting password...' : 'Reset password'}
              </button>
            </form>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-400 py-3">
          CashDeck Financial Operating System • NDPA Compliant
        </footer>
      </div>
    );
  }

  // SCREEN 6: RESET PASSWORD VERIFICATION CODE
  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-[#edf4f0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full mx-auto">
          <AuthHeader
            currentStep={2}
            totalSteps={4}
          />

          <div className="pt-1 pb-3">
            <button
              type="button"
              onClick={() => setStep('request')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 cursor-pointer"
            >
              <span className="text-slate-400">←</span>
              <span>Back</span>
            </button>
          </div>
        </div>

        <main className="max-w-md w-full mx-auto my-auto py-2">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md text-center">
            <div className="flex justify-center mb-5">
              <PadlockIllustration size={120} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Verify your account
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
              Enter the 6-digit code sent to your email or phone.
            </p>

            {errorMessage && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="mt-6 space-y-6">
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleDigitChange(i, e.target.value)}
                    className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border-2 transition-all focus:outline-none ${
                      digit
                        ? 'border-[#047857] bg-emerald-50/40 text-slate-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-900 focus:border-[#047857] focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                ))}
              </div>

              <div className="space-y-1.5 text-xs text-slate-500">
                <p>
                  Didn't receive the code?{' '}
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="font-bold text-[#047857] hover:underline cursor-pointer"
                    >
                      Resend now
                    </button>
                  ) : (
                    <span className="text-slate-400">Resend code in 01:00</span>
                  )}
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setStep('request')}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline transition-colors cursor-pointer"
                  >
                    Change email or phone
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || digits.join('').length !== 6}
                className="w-full py-3.5 px-6 bg-[#047857] hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-400 py-3">
          CashDeck Financial Operating System • NDPA Compliant
        </footer>
      </div>
    );
  }

  // SCREEN 5: FORGOT YOUR PASSWORD?
  return (
    <div className="min-h-screen bg-[#edf4f0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full mx-auto">
        <AuthHeader
          currentStep={1}
          totalSteps={4}
        />

        <div className="pt-1 pb-3">
          <button
            type="button"
            onClick={onBackToLogin}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 cursor-pointer"
          >
            <span className="text-slate-400">←</span>
            <span>Back</span>
          </button>
        </div>
      </div>

      <main className="max-w-md w-full mx-auto my-auto py-2">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md text-center">
          <div className="flex justify-center mb-5">
            <PadlockIllustration size={120} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Forgot your password?
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            Enter your email or phone number and we'll help you reset it.
          </p>

          {errorMessage && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRequestSubmit} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email or phone
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 px-6 bg-[#047857] hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer"
            >
              {isLoading ? 'Sending code...' : 'Continue'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Back to sign in
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 py-3">
        CashDeck Financial Operating System • NDPA Compliant
      </footer>
    </div>
  );
};

