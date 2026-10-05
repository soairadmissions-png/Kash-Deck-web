import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { OnboardingWelcomeScreen } from './OnboardingWelcomeScreen';
import { OnboardingChooseScreen } from './OnboardingChooseScreen';
import { OnboardingShell } from './OnboardingShell';

// Personal Steps (Matching Reference UI screens 11 to 15)
import { PersonalStep1 } from './personal/PersonalStep1';
import { ConnectAccountsStep } from './ConnectAccountsStep';
import { OptionalFinancialSetupStep } from './OptionalFinancialSetupStep';

// Business Steps
import { BusinessStep1 } from './business/BusinessStep1';
import { BusinessStep2 } from './business/BusinessStep2';
import { BusinessStep3 } from './business/BusinessStep3';
import { BusinessStep4 } from './business/BusinessStep4';

interface OnboardingFlowProps {
  onFinished: (redirectUrl: string) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onFinished }) => {
  const {
    user,
    activeWorkspace,
    createWorkspace,
    saveOnboardingStep,
    completeOnboarding
  } = useAuth();

  const [internalStep, setInternalStep] = useState<string>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [tempAnswers, setTempAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (activeWorkspace) {
      if (activeWorkspace.onboardingStatus === 'completed') {
        onFinished(activeWorkspace.type === 'personal' ? '/app/personal/overview' : '/app/business/overview');
      } else if (activeWorkspace.onboardingStep) {
        setInternalStep(activeWorkspace.onboardingStep);
      }
    }
  }, [activeWorkspace]);

  // Handle workspace choice (Personal vs Business)
  const handleChooseType = async (type: 'personal' | 'business') => {
    setIsLoading(true);
    try {
      await createWorkspace(type);
      setInternalStep(type === 'personal' ? 'p1' : 'b1');
    } finally {
      setIsLoading(false);
    }
  };

  // Personal Step Handlers
  const handlePersonalP1 = async (data: any) => {
    setTempAnswers(prev => ({ ...prev, p1: data }));
    await saveOnboardingStep('p1', data, 'p2');
    setInternalStep('p2');
  };

  const handlePersonalP2 = async () => {
    await saveOnboardingStep('p2', { accountsConnected: true }, 'p3');
    setInternalStep('p3');
  };

  const handlePersonalComplete = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = await completeOnboarding();
      onFinished(redirectUrl || '/app/personal/overview');
    } finally {
      setIsLoading(false);
    }
  };

  // Business Step Handlers
  const handleBusinessB1 = async (data: any) => {
    setTempAnswers(prev => ({ ...prev, b1: data }));
    await saveOnboardingStep('b1', data, 'b2');
    setInternalStep('b2');
  };

  const handleBusinessB2 = async (data: any, skipped = false) => {
    setTempAnswers(prev => ({ ...prev, b2: data }));
    await saveOnboardingStep('b2', data, 'b3', skipped);
    setInternalStep('b3');
  };

  const handleBusinessB3 = async (data: any) => {
    setTempAnswers(prev => ({ ...prev, b3: data }));
    await saveOnboardingStep('b3', data, 'b4');
    setInternalStep('b4');
  };

  const handleBusinessComplete = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = await completeOnboarding();
      onFinished(redirectUrl || '/app/business/overview');
    } finally {
      setIsLoading(false);
    }
  };

  // SCREEN 9: ONBOARDING WELCOME
  if (internalStep === 'welcome' && !activeWorkspace) {
    return (
      <OnboardingWelcomeScreen
        userName={user?.name}
        onContinue={() => setInternalStep('choose')}
        onSkip={() => handleChooseType('personal')}
      />
    );
  }

  // SCREEN 10: WHAT ARE YOU MANAGING? (Personal vs Business)
  if (internalStep === 'choose' || !activeWorkspace) {
    return (
      <OnboardingChooseScreen
        onChoose={handleChooseType}
        onBack={() => setInternalStep('welcome')}
        isLoading={isLoading}
      />
    );
  }

  const workspaceType = activeWorkspace.type;

  // -----------------------------------------------------------------
  // PERSONAL WORKSPACE JOURNEY (Reference UI screens 11 to 15)
  // -----------------------------------------------------------------
  if (workspaceType === 'personal') {
    switch (internalStep) {
      // SCREEN 11: PERSONAL SETUP ("Let's set up your finances")
      case 'p1':
        return (
          <OnboardingShell
            currentStep={2}
            totalSteps={4}
            type="personal"
            onBack={() => setInternalStep('choose')}
          >
            <PersonalStep1
              onContinue={handlePersonalP1}
              onSkip={() => handlePersonalP1({ incomeSource: 'salary', incomePattern: 'regular' })}
              initialData={tempAnswers.p1}
            />
          </OnboardingShell>
        );

      // SCREEN 12, 13, 14: CONNECT FINANCIAL ACCOUNTS & CATALOG
      case 'p2':
        return (
          <OnboardingShell
            currentStep={3}
            totalSteps={4}
            type="personal"
            onBack={() => setInternalStep('p1')}
          >
            <ConnectAccountsStep
              workspaceId={activeWorkspace.id}
              onContinue={handlePersonalP2}
              onSkip={handlePersonalP2}
            />
          </OnboardingShell>
        );

      // SCREEN 15: OPTIONAL FINANCIAL SETUP ("Want to add anything else?")
      case 'p3':
      case 'p4':
      default:
        return (
          <OnboardingShell
            currentStep={4}
            totalSteps={4}
            type="personal"
            onBack={() => setInternalStep('p2')}
          >
            <OptionalFinancialSetupStep
              onComplete={handlePersonalComplete}
              isLoading={isLoading}
            />
          </OnboardingShell>
        );
    }
  }

  // -----------------------------------------------------------------
  // BUSINESS WORKSPACE JOURNEY
  // -----------------------------------------------------------------
  switch (internalStep) {
    case 'b1':
      return (
        <OnboardingShell
          currentStep={1}
          totalSteps={4}
          type="business"
          onBack={() => setInternalStep('choose')}
        >
          <BusinessStep1
            onContinue={handleBusinessB1}
            initialData={tempAnswers.b1}
          />
        </OnboardingShell>
      );

    case 'b2':
      return (
        <OnboardingShell
          currentStep={2}
          totalSteps={4}
          type="business"
          onBack={() => setInternalStep('b1')}
        >
          <BusinessStep2
            onContinue={data => handleBusinessB2(data, false)}
            onSkip={() => handleBusinessB2({}, true)}
            initialData={tempAnswers.b2}
          />
        </OnboardingShell>
      );

    case 'b3':
      return (
        <OnboardingShell
          currentStep={3}
          totalSteps={4}
          type="business"
          onBack={() => setInternalStep('b2')}
        >
          <BusinessStep3
            onContinue={handleBusinessB3}
            initialData={tempAnswers.b3}
          />
        </OnboardingShell>
      );

    case 'b4':
    default:
      return (
        <OnboardingShell
          currentStep={4}
          totalSteps={4}
          type="business"
          onBack={() => setInternalStep('b3')}
        >
          <BusinessStep4
            businessName={activeWorkspace.name}
            onComplete={handleBusinessComplete}
            isLoading={isLoading}
          />
        </OnboardingShell>
      );
  }
};
