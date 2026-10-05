import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiV1, UserDTO, WorkspaceDTO } from '../services/apiV1';

interface AuthContextType {
  user: UserDTO | null;
  activeWorkspace: WorkspaceDTO | null;
  workspaces: WorkspaceDTO[];
  isLoadingAuth: boolean;
  isAuthenticated: boolean;
  isVerified: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; phone?: string; password: string; termsAccepted: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  verifyPhone: (code: string) => Promise<void>;
  resendVerification: (type: 'email' | 'phone') => Promise<string>;
  switchActiveWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (type: 'personal' | 'business', name?: string) => Promise<WorkspaceDTO>;
  saveOnboardingStep: (stepKey: string, payload?: any, nextStepKey?: string, skipped?: boolean) => Promise<void>;
  completeOnboarding: () => Promise<string>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceDTO | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceDTO[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const refreshMe = async () => {
    try {
      const data = await apiV1.getMe();
      setUser(data.user);
      setActiveWorkspace(data.activeWorkspace);
      setWorkspaces(data.workspaces);
    } catch {
      setUser(null);
      setActiveWorkspace(null);
      setWorkspaces([]);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const res = await apiV1.login(data);
    setUser(res.user);
    if (res.activeWorkspace) {
      setActiveWorkspace(res.activeWorkspace);
    }
    await refreshMe();
  };

  const register = async (data: { name: string; email: string; phone?: string; password: string; termsAccepted: boolean }) => {
    const res = await apiV1.register(data);
    setUser(res.user);
    await refreshMe();
  };

  const logout = async () => {
    try {
      await apiV1.logout();
    } finally {
      setUser(null);
      setActiveWorkspace(null);
      setWorkspaces([]);
    }
  };

  const verifyEmail = async (code: string) => {
    await apiV1.verifyEmail(code);
    await refreshMe();
  };

  const verifyPhone = async (code: string) => {
    await apiV1.verifyPhone(code);
    await refreshMe();
  };

  const resendVerification = async (type: 'email' | 'phone') => {
    const res = await apiV1.resendVerification(type);
    return res.message;
  };

  const switchActiveWorkspace = async (workspaceId: string) => {
    const res = await apiV1.switchActiveWorkspace(workspaceId);
    setActiveWorkspace(res.activeWorkspace);
    await refreshMe();
  };

  const createWorkspace = async (type: 'personal' | 'business', name?: string) => {
    const res = await apiV1.createWorkspace({ type, name });
    await refreshMe();
    return res.workspace;
  };

  const saveOnboardingStep = async (stepKey: string, payload?: any, nextStepKey?: string, skipped?: boolean) => {
    if (!activeWorkspace) throw new Error('No active workspace');
    await apiV1.saveOnboardingStep(activeWorkspace.id, { stepKey, nextStepKey, payload, skipped });
    await refreshMe();
  };

  const completeOnboarding = async () => {
    if (!activeWorkspace) throw new Error('No active workspace');
    const res = await apiV1.completeOnboarding(activeWorkspace.id);
    await refreshMe();
    return res.redirectUrl;
  };

  const isAuthenticated = !!user;
  const isVerified = !!user?.emailVerifiedAt;

  return (
    <AuthContext.Provider
      value={{
        user,
        activeWorkspace,
        workspaces,
        isLoadingAuth,
        isAuthenticated,
        isVerified,
        login,
        register,
        logout,
        verifyEmail,
        verifyPhone,
        resendVerification,
        switchActiveWorkspace,
        createWorkspace,
        saveOnboardingStep,
        completeOnboarding,
        refreshMe
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
