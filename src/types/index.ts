export type AccountType = 'bank' | 'cash' | 'card' | 'wallet' | 'investment' | 'business';

export interface Account {
  id: string;
  name: string;
  bankName: string;
  type: AccountType;
  accountNumber?: string;
  maskedAccountNumber?: string;
  balance: number;
  availableBalance?: number;
  currentBalance?: number;
  currency: string;
  isBusiness: boolean;
  status: 'active' | 'syncing' | 'needs_reauth' | 'needs_attention' | 'disconnected';
  institutionId?: string;
  providerId?: string;
  providerName?: string;
  providerLogo?: string;
  color?: string;
  lastSyncedAt?: string;
  errorMessage?: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'investment';
export type TransactionStatus = 'Completed' | 'Pending' | 'Needs review' | 'Reversed';

export interface Transaction {
  id: string;
  date: string;
  time?: string;
  description: string;
  merchantOrParty?: string;
  category: string;
  amount: number; // positive for received, negative for spent
  direction?: 'inflow' | 'outflow';
  accountId: string;
  accountName: string;
  accountMasked?: string;
  type: TransactionType;
  status: TransactionStatus;
  isBusiness: boolean;
  notes?: string;
  referenceId?: string;
  transferToAccountId?: string;
  sender?: string;
  recipient?: string;
  merchant?: string;
  channel?: 'Bank Transfer' | 'POS Payment' | 'Web Checkout' | 'ATM Withdrawal' | 'Direct Debit' | 'Cash';
  rawDescription?: string;
  providerCategory?: string;
  cashdeckCategory?: string;
  cashdeckClassification?: 'Personal' | 'Business';
  classification?: 'Personal' | 'Business' | 'Transfer' | 'Unknown';
  syncStatus?: 'synced' | 'pending';
  isCashEntry?: boolean;
  reconciliationStatus?: 'unreconciled' | 'reconciled' | 'ignored';
  reconciledWith?: {
    type: 'sale' | 'purchase' | 'expense' | 'customer_payment' | 'supplier_payment' | 'internal_transfer' | 'pos_settlement' | 'owner_contribution' | 'owner_withdrawal';
    id: string;
    label: string;
  };
}

export * from './business';

export interface Budget {
  id: string;
  name: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  color: string;
  iconName: string;
  isBusiness?: boolean;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  frequency: 'Monthly' | 'Weekly' | 'Yearly';
  nextPaymentDate: string;
  category: string;
  status: 'Active' | 'Paused' | 'Due Soon';
  accountName: string;
  iconBg?: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  title: string;
  amount: number;
  type: 'expense' | 'income' | 'supplier' | 'goal' | 'bill';
  category: string;
  isCompleted?: boolean;
  statusText?: string;
  dueText?: string;
  isBusiness?: boolean;
}

export type SalePaymentMethod = 'Cash' | 'Transfer' | 'Card' | 'POS' | 'Credit sale' | 'Partial payment';
export type SalePaymentStatus = 'Completed' | 'Pending' | 'Refunded' | 'Returned' | 'Cancelled';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  amountPaid: number;
  discount: number;
  paymentMethod: SalePaymentMethod;
  paymentStatus: SalePaymentStatus;
  date: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  stockValue: number;
  status: 'In stock' | 'Low stock' | 'Out of stock';
  minAlertThreshold: number;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  purchasesCount: number;
  totalSpent: number;
  amountOwed: number;
  lastPurchaseDate: string;
  notes: string;
  status: 'Active' | 'VIP' | 'Has Due Balance';
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  productsSupplied: string[];
  totalPurchases: number;
  amountPaid: number;
  amountOwed: number;
  lastOrderDate: string;
}

export interface Goal {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  iconName: string;
  color: string;
}

export interface Investment {
  id: string;
  name: string;
  type: 'Stocks' | 'Mutual funds' | 'Treasury bills' | 'Fixed deposits' | 'Crypto' | 'Other assets';
  institution: string;
  investedAmount: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  lastUpdated: string;
}

export interface Insight {
  id: string;
  title: string;
  category: 'spending' | 'income' | 'savings' | 'goals' | 'business';
  whatHappened: string;
  evidence: string;
  explanation: string;
  recommendation: string;
  impact: 'positive' | 'warning' | 'neutral' | 'urgent';
  date: string;
}

export interface NotificationItem {
  id: string;
  type:
    | 'budget_exceeded'
    | 'unusual_spending'
    | 'upcoming_payment'
    | 'low_balance'
    | 'savings_milestone'
    | 'monthly_report'
    | 'business_expense'
    | 'profit_decline'
    | 'transaction'
    | 'system';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  category: 'Transactions' | 'Goals' | 'Insights' | 'System';
  actionTarget?: string;
}

export interface FinancialProvider {
  id: string;
  name: string;
  category: 'Banks' | 'Cards' | 'Wallets' | 'Other';
  tagline: string;
  logoBg: string;
  logoTextColor: string;
  logoLetter: string;
  iconType?: string;
}
