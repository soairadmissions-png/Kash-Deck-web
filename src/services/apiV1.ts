// Typed Client API for CashDeck v1 endpoints

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  activeWorkspaceId?: string | null;
}

export interface WorkspaceDTO {
  id: string;
  type: 'personal' | 'business';
  name: string;
  currency: string;
  onboardingStatus: 'not_started' | 'in_progress' | 'completed';
  onboardingStep: string;
  isDemo?: number;
  role?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: UserDTO;
  activeWorkspace?: WorkspaceDTO | null;
  accessToken: string;
}

let currentAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  currentAccessToken = token;
  if (token) {
    sessionStorage.setItem('cashdeck_access_token', token);
    try {
      localStorage.setItem('cashdeck_access_token', token);
    } catch {}
  } else {
    sessionStorage.removeItem('cashdeck_access_token');
    try {
      localStorage.removeItem('cashdeck_access_token');
    } catch {}
  }
}

export function getAccessToken(): string | null {
  if (!currentAccessToken) {
    currentAccessToken = sessionStorage.getItem('cashdeck_access_token');
    if (!currentAccessToken) {
      try {
        currentAccessToken = localStorage.getItem('cashdeck_access_token');
      } catch {}
    }
  }
  return currentAccessToken;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, credentials: 'include', headers });

  if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
    // Try to refresh token
    const refreshRes = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setAccessToken(data.accessToken);
      headers.set('Authorization', `Bearer ${data.accessToken}`);
      return fetch(url, { ...options, credentials: 'include', headers });
    } else {
      setAccessToken(null);
    }
  }

  return response;
}

export const apiV1 = {
  // Auth
  async register(data: { name: string; email: string; phone?: string; password: string; termsAccepted: boolean }): Promise<AuthResponse & { devCode?: string }> {
    const res = await fetchWithAuth('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    setAccessToken(json.accessToken);
    if (json.devCode) {
      sessionStorage.setItem('cashdeck_last_dev_code', json.devCode);
    }
    return json;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetchWithAuth('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    setAccessToken(json.accessToken);
    return json;
  },

  async logout(): Promise<void> {
    await fetchWithAuth('/api/v1/auth/logout', { method: 'POST' });
    setAccessToken(null);
  },

  async verifyEmail(code: string): Promise<{ success: boolean; message: string }> {
    const res = await fetchWithAuth('/api/v1/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Verification failed');
    return json;
  },

  async verifyPhone(code: string): Promise<{ success: boolean; message: string }> {
    const res = await fetchWithAuth('/api/v1/auth/verify-phone', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Phone verification failed');
    return json;
  },

  async resendVerification(type: 'email' | 'phone'): Promise<{ success: boolean; message: string; devCode?: string }> {
    const res = await fetchWithAuth('/api/v1/auth/resend', {
      method: 'POST',
      body: JSON.stringify({ type })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Resend failed');
    if (json.devCode) {
      sessionStorage.setItem('cashdeck_last_dev_code', json.devCode);
    }
    return json;
  },

  async forgotPassword(identifier: string): Promise<{ success: boolean; message: string; devCode?: string }> {
    const res = await fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to process request');
    return json;
  },

  async verifyResetCode(identifier: string, code: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/v1/auth/verify-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, code })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Code verification failed');
    return json;
  },

  async resetPassword(data: { identifier: string; code: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Password reset failed');
    return json;
  },

  async getMe(): Promise<{ user: UserDTO; activeWorkspace: WorkspaceDTO | null; workspaces: WorkspaceDTO[]; profile: any }> {
    const res = await fetchWithAuth('/api/v1/me');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch user');
    return json;
  },

  // Workspaces
  async createWorkspace(data: { type: 'personal' | 'business'; name?: string }): Promise<{ workspace: WorkspaceDTO }> {
    const res = await fetchWithAuth('/api/v1/workspaces', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create workspace');
    return json;
  },

  async switchActiveWorkspace(workspaceId: string): Promise<{ activeWorkspace: WorkspaceDTO }> {
    const res = await fetchWithAuth('/api/v1/me/active-workspace', {
      method: 'POST',
      body: JSON.stringify({ workspaceId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to switch workspace');
    return json;
  },

  async saveOnboardingStep(workspaceId: string, data: { stepKey: string; nextStepKey?: string; payload?: any; skipped?: boolean }): Promise<any> {
    const res = await fetchWithAuth(`/api/v1/workspaces/${workspaceId}/onboarding`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to save onboarding');
    return json;
  },

  async completeOnboarding(workspaceId: string): Promise<{ success: boolean; redirectUrl: string; workspace: WorkspaceDTO }> {
    const res = await fetchWithAuth(`/api/v1/workspaces/${workspaceId}/onboarding/complete`, {
      method: 'POST'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to complete onboarding');
    return json;
  },

  async getDashboard(workspaceId: string): Promise<any> {
    const res = await fetchWithAuth(`/api/v1/workspaces/${workspaceId}/dashboard`);
    const json = await res.json();
    if (res.status === 409) {
      return { requiresOnboarding: true, ...json };
    }
    if (!res.ok) throw new Error(json.error || 'Failed to load dashboard');
    return json;
  },

  async createAccount(workspaceId: string, data: {
    name: string;
    type: string;
    accountNumber?: string;
    bankName?: string;
    openingBalanceMinor?: number;
  }): Promise<any> {
    const res = await fetchWithAuth(`/api/v1/workspaces/${workspaceId}/accounts`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      return { success: true };
    }
    return res.json();
  },

  async recordDailySales(workspaceId: string, data: {
    date: string;
    totalSalesMinor: number;
    cashMinor?: number;
    transferMinor?: number;
    posMinor?: number;
    otherMinor?: number;
    transactionCount?: number;
    notes?: string;
  }): Promise<any> {
    const res = await fetchWithAuth(`/api/v1/workspaces/${workspaceId}/daily-sales`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to record sales');
    return json;
  }
};
