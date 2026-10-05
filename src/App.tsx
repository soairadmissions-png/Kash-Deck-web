import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinancialProvider, useFinancial } from './context/FinancialContext';

// Auth & Onboarding Views
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { SignUpScreen } from './components/auth/SignUpScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { ForgotPasswordScreen } from './components/auth/ForgotPasswordScreen';
import { VerifyScreen } from './components/auth/VerifyScreen';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';

// Workspace Shell & Dashboards
import { WorkspaceShell } from './components/common/WorkspaceShell';
import { PersonalOverview } from './components/screens/PersonalOverview';
import { BusinessOverview } from './components/screens/BusinessOverview';

// Other Screens
import { TransactionsScreen } from './components/screens/TransactionsScreen';
import { AccountsScreen } from './components/screens/AccountsScreen';
import { BudgetsScreen } from './components/screens/BudgetsScreen';
import { GoalsScreen } from './components/screens/GoalsScreen';
import { SalesScreen } from './components/screens/SalesScreen';
import { InventoryScreen } from './components/screens/InventoryScreen';
import { CustomersScreen } from './components/screens/CustomersScreen';
import { SuppliersScreen } from './components/screens/SuppliersScreen';
import { InvestmentsScreen } from './components/screens/InvestmentsScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { InsightsScreen } from './components/screens/InsightsScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { FinancialProvidersScreen } from './components/screens/FinancialProvidersScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { BusinessScreen } from './components/screens/BusinessScreen';
import { DetailModal } from './components/common/DetailModal';

const AppNavigator: React.FC = () => {
  const { user, activeWorkspace, isLoadingAuth, isAuthenticated, isVerified, refreshMe, createWorkspace } = useAuth();
  const [authView, setAuthView] = useState<'welcome' | 'signup' | 'login' | 'forgot_password'>('welcome');
  const [currentScreen, setCurrentScreen] = useState<string>('overview');

  // Handle URL hash changes for deep links & back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        const parts = hash.split('/');
        if (parts[0] === 'welcome') setAuthView('welcome');
        else if (parts[0] === 'signup') setAuthView('signup');
        else if (parts[0] === 'login') setAuthView('login');
        else if (parts[0] === 'forgot-password') setAuthView('forgot_password');
        else if (parts[0] === 'app' && parts[2]) {
          setCurrentScreen(parts[2]);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when screen changes
  useEffect(() => {
    if (activeWorkspace?.onboardingStatus === 'completed') {
      window.location.hash = `/app/${activeWorkspace.type}/${currentScreen}`;
    }
  }, [currentScreen, activeWorkspace?.type, activeWorkspace?.onboardingStatus]);

  // Loading Screen
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#edf4f0] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#047857] to-[#10b981] flex items-center justify-center text-white shadow-md animate-pulse mb-3">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            <line x1="12" y1="22" x2="12" y2="15.5" />
            <polyline points="22 8.5 12 15.5 2 8.5" />
          </svg>
        </div>
        <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Loading CashDeck...</p>
      </div>
    );
  }

  // 1. Not Authenticated
  if (!isAuthenticated) {
    if (authView === 'signup') {
      return (
        <SignUpScreen
          onSuccess={() => refreshMe()}
          onNavigateToLogin={() => setAuthView('login')}
        />
      );
    }
    if (authView === 'login') {
      return (
        <LoginScreen
          onSuccess={() => refreshMe()}
          onNavigateToSignUp={() => setAuthView('signup')}
          onForgotPassword={() => setAuthView('forgot_password')}
        />
      );
    }
    if (authView === 'forgot_password') {
      return (
        <ForgotPasswordScreen
          onBackToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <WelcomeScreen
        onGetStarted={() => setAuthView('signup')}
        onSignIn={() => setAuthView('login')}
      />
    );
  }

  // 2. Authenticated, not email verified
  if (!isVerified) {
    return <VerifyScreen onSuccess={() => refreshMe()} />;
  }

  // 3. Authenticated & verified, but workspace onboarding incomplete
  if (!activeWorkspace || activeWorkspace.onboardingStatus !== 'completed') {
    return (
      <OnboardingFlow
        onFinished={() => {
          refreshMe();
          setCurrentScreen('overview');
        }}
      />
    );
  }

  // 4. Onboarding complete: Main App with Workspace Isolation
  const isBusiness = activeWorkspace.type === 'business';

  const renderActiveScreen = () => {
    if (isBusiness) {
      // BUSINESS WORKSPACE SCREENS
      switch (currentScreen) {
        case 'overview':
          return <BusinessOverview onNavigate={setCurrentScreen} />;
        case 'sales':
          return <SalesScreen />;
        case 'expenses':
          return <BusinessScreen />;
        case 'inventory':
          return <InventoryScreen />;
        case 'customers':
          return <CustomersScreen />;
        case 'suppliers':
          return <SuppliersScreen />;
        case 'reports':
          return <ReportsScreen />;
        case 'insights':
          return <InsightsScreen />;
        case 'notifications':
          return <NotificationsScreen />;
        case 'providers':
          return <FinancialProvidersScreen />;
        case 'settings':
          return <SettingsScreen />;
        default:
          return <BusinessOverview onNavigate={setCurrentScreen} />;
      }
    } else {
      // PERSONAL WORKSPACE SCREENS
      switch (currentScreen) {
        case 'overview':
          return <PersonalOverview onNavigate={setCurrentScreen} />;
        case 'transactions':
          return <TransactionsScreen />;
        case 'budgets':
          return <BudgetsScreen />;
        case 'goals':
          return <GoalsScreen />;
        case 'savings':
        case 'accounts':
          return <AccountsScreen />;
        case 'investments':
          return <InvestmentsScreen />;
        case 'reports':
          return <ReportsScreen />;
        case 'insights':
          return <InsightsScreen />;
        case 'notifications':
          return <NotificationsScreen />;
        case 'providers':
          return <FinancialProvidersScreen />;
        case 'settings':
          return <SettingsScreen />;
        default:
          return <PersonalOverview onNavigate={setCurrentScreen} />;
      }
    }
  };

  return (
    <WorkspaceShell
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      onAddNewWorkspace={async type => {
        await createWorkspace(type);
        setCurrentScreen('overview');
      }}
    >
      {renderActiveScreen()}
      <DetailModal />
    </WorkspaceShell>
  );
};

export function App() {
  return (
    <AuthProvider>
      <FinancialProvider>
        <AppNavigator />
      </FinancialProvider>
    </AuthProvider>
  );
}

export default App;
