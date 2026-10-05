import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Account,
  Transaction,
  Budget,
  RecurringExpense,
  CalendarEvent,
  Sale,
  InventoryItem,
  Customer,
  Supplier,
  Goal,
  Investment,
  Insight,
  NotificationItem,
  AccountType,
  TransactionType,
  Business,
  BusinessMember,
  Product,
  InventoryMovement,
  BusinessSale,
  BusinessPurchase,
  BusinessExpenseRecord,
  BusinessPayment,
  AuditTrailEntry,
  POSSettlement,
  TransactionMatchCandidate,
  TransactionClassification
} from '../types';
import {
  initialAccounts,
  initialTransactions,
  initialBudgets,
  initialRecurringExpenses,
  initialCalendarEvents,
  initialSales,
  initialInventory,
  initialCustomers,
  initialSuppliers,
  initialGoals,
  initialInvestments,
  initialInsights,
  initialNotifications
} from '../data/initialData';
import {
  initialBusiness,
  initialMembers,
  initialProducts,
  initialInventoryMovements,
  initialBusinessSales,
  initialBusinessPurchases,
  initialBusinessExpenses,
  initialBusinessPayments,
  initialAuditTrail,
  initialPOSSettlement
} from '../data/initialBusinessData';
import {
  deriveProductStock,
  deriveCustomerBalance,
  deriveSupplierBalance,
  classifyTransaction,
  calculateBusinessMetrics,
  BusinessMetricsSummary,
  BusinessState
} from '../services/businessEngine';

export type ScreenType =
  | 'home'
  | 'money'
  | 'business'
  | 'goals'
  | 'insights'
  | 'accounts'
  | 'transactions'
  | 'budgets'
  | 'recurring'
  | 'calendar'
  | 'sales'
  | 'inventory'
  | 'customers'
  | 'suppliers'
  | 'investments'
  | 'reports'
  | 'notifications'
  | 'providers'
  | 'settings'
  | 'receivables'
  | 'payables'
  | 'review'
  | 'expenses';

interface FinancialContextType {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  recurringExpenses: RecurringExpense[];
  calendarEvents: CalendarEvent[];
  sales: Sale[];
  inventory: InventoryItem[];
  customers: Customer[];
  suppliers: Supplier[];
  goals: Goal[];
  investments: Investment[];
  insights: Insight[];
  notifications: NotificationItem[];
  userMode: 'personal' | 'business';
  setUserMode: (mode: 'personal' | 'business') => void;
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  hideBalances: boolean;
  setHideBalances: (hide: boolean) => void;
  toggleHideBalances: () => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  activeDetailItem: { type: string; data: any } | null;
  openDetail: (type: string, data: any) => void;
  closeDetail: () => void;

  selectedMoneyAccountId: string | 'all';
  setSelectedMoneyAccountId: (id: string | 'all') => void;
  isSyncing: boolean;
  refreshAccount: (id?: string | 'all') => Promise<void>;
  reconnectAccount: (id: string) => void;
  disconnectAccount: (id: string) => void;
  toggleAccountAttention: (id: string) => void;
  addCashTransaction: (description: string, amount: number, category: string, classification: 'Personal' | 'Business') => void;
  updateTransactionMetadata: (txId: string, updates: Partial<Transaction>) => void;
  connectFullProvider: (
    providerName: string,
    accountName: string,
    maskedNum: string,
    balance: number,
    type: AccountType,
    transactionsToAdd: Array<{
      date: string;
      time?: string;
      description: string;
      amount: number;
      category: string;
      type: TransactionType;
      referenceId?: string;
      sender?: string;
      recipient?: string;
      merchant?: string;
      channel?: 'Bank Transfer' | 'POS Payment' | 'Web Checkout' | 'ATM Withdrawal' | 'Direct Debit';
      rawDescription?: string;
    }>
  ) => void;

  // Relational Business Entities
  business: Business;
  updateBusiness: (updates: Partial<Business>) => void;
  businessMembers: BusinessMember[];
  products: Product[];
  movements: InventoryMovement[];
  businessSales: BusinessSale[];
  businessPurchases: BusinessPurchase[];
  businessExpenses: BusinessExpenseRecord[];
  businessPayments: BusinessPayment[];
  auditTrail: AuditTrailEntry[];
  posSettlements: POSSettlement[];
  cashOnHand: number;

  // Derivation Helpers
  deriveStock: (productId: string) => number;
  deriveCustBalance: (customerId: string) => ReturnType<typeof deriveCustomerBalance>;
  deriveSupBalance: (supplierId: string) => ReturnType<typeof deriveSupplierBalance>;
  classifyTx: (tx: Transaction) => TransactionMatchCandidate;

  // Business Operations
  recordBusinessSale: (
    saleData: Omit<BusinessSale, 'id' | 'sale_number' | 'created_at' | 'updated_at'>
  ) => void;
  recordCustomerPayment: (
    paramsOrCustomerId:
      | string
      | {
          customerId: string;
          amount: number;
          method?: 'bank' | 'cash' | 'pos' | 'card' | 'transfer';
          saleId?: string;
          transactionId?: string;
          reference?: string;
          notes?: string;
          applyStrategy?: 'single' | 'oldest_first' | 'split';
          splitSales?: { saleId: string; amount: number }[];
        },
    maybeAmount?: number,
    maybeAccountId?: string
  ) => void;
  recordBusinessPurchase: (
    purchaseData: Omit<BusinessPurchase, 'id' | 'purchase_number' | 'created_at' | 'updated_at'>
  ) => void;
  recordSupplierPayment: (params: {
    supplierId: string;
    amount: number;
    method: 'bank' | 'cash' | 'pos' | 'card' | 'transfer';
    purchaseId?: string;
    transactionId?: string;
    reference?: string;
    notes?: string;
  }) => void;
  recordBusinessExpense: (
    expenseData: Omit<BusinessExpenseRecord, 'id' | 'created_at'>
  ) => void;
  recordInventoryMovement: (
    movementData: Omit<InventoryMovement, 'id' | 'created_at'>
  ) => void;
  recordCashSale: (params: {
    customerName?: string;
    productId: string;
    quantity: number;
    amount: number;
    notes?: string;
  }) => void;
  recordCashExpense: (params: {
    categoryId: string;
    amount: number;
    description: string;
    notes?: string;
  }) => void;
  recordOwnerContribution: (amount: number, method: 'bank' | 'cash', notes?: string) => void;
  confirmTransactionMatch: (txId: string, match: TransactionMatchCandidate) => void;
  ignoreOrMarkPersonal: (txId: string) => void;
  classifyTransactionCustom: (
    txId: string,
    classification: TransactionClassification,
    extra?: any
  ) => void;
  reconcilePOSSettlement: (
    txId: string,
    saleIds: string[],
    processingFee: number
  ) => void;

  // Legacy compatibility actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  addSale: (sale: Omit<Sale, 'id' | 'invoiceNo'>) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'stockValue'>) => void;
  updateInventoryStock: (itemId: string, qtyDelta: number, reason: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  depositToGoal: (goalId: string, amount: number, accountId: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  addRecurringExpense: (rec: Omit<RecurringExpense, 'id'>) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  addSupplierOrder: (
    supplierId: string,
    items: { productId: string; quantity: number; unitCost: number }[],
    totalCost: number,
    amountPaid: number,
    accountId: string
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  connectBankAccounts: (
    bankName: string,
    accountsToAdd: { name: string; balance: number; type: AccountType; isBusiness?: boolean }[]
  ) => void;
  resetToDemoData: () => void;

  // Computed metrics
  personalMetrics: {
    totalBalance: number;
    income: number;
    expenses: number;
    savings: number;
    netWorth: number;
  };
  businessMetrics: BusinessMetricsSummary;
  unreadNotificationsCount: number;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const STORAGE_PREFIX = 'cashdeck_v2_';

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}accounts`);
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}transactions`);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}budgets`);
    return saved ? JSON.parse(saved) : initialBudgets;
  });

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}recurring`);
    return saved ? JSON.parse(saved) : initialRecurringExpenses;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}calendar`);
    return saved ? JSON.parse(saved) : initialCalendarEvents;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}sales`);
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}inventory`);
    return saved ? JSON.parse(saved) : initialInventory;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}customers`);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}suppliers`);
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}goals`);
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}investments`);
    return saved ? JSON.parse(saved) : initialInvestments;
  });

  const [insights, setInsights] = useState<Insight[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}insights`);
    return saved ? JSON.parse(saved) : initialInsights;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Business relational entities
  const [business, setBusiness] = useState<Business>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}business`);
    return saved ? JSON.parse(saved) : initialBusiness;
  });

  const [businessMembers] = useState<BusinessMember[]>(initialMembers);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}products`);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [movements, setMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}movements`);
    return saved ? JSON.parse(saved) : initialInventoryMovements;
  });

  const [businessSales, setBusinessSales] = useState<BusinessSale[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}businessSales`);
    return saved ? JSON.parse(saved) : initialBusinessSales;
  });

  const [businessPurchases, setBusinessPurchases] = useState<BusinessPurchase[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}businessPurchases`);
    return saved ? JSON.parse(saved) : initialBusinessPurchases;
  });

  const [businessExpenses, setBusinessExpenses] = useState<BusinessExpenseRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}businessExpenses`);
    return saved ? JSON.parse(saved) : initialBusinessExpenses;
  });

  const [businessPayments, setBusinessPayments] = useState<BusinessPayment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}businessPayments`);
    return saved ? JSON.parse(saved) : initialBusinessPayments;
  });

  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}auditTrail`);
    return saved ? JSON.parse(saved) : initialAuditTrail;
  });

  const [posSettlements, setPosSettlements] = useState<POSSettlement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}posSettlements`);
    return saved ? JSON.parse(saved) : [initialPOSSettlement];
  });

  const [cashOnHand, setCashOnHand] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}cashOnHand`);
    return saved ? JSON.parse(saved) : 350000;
  });

  const [userMode, setUserMode] = useState<'personal' | 'business'>('business');
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('business');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('This Month (October 2026)');
  const [hideBalances, setHideBalances] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [activeDetailItem, setActiveDetailItem] = useState<{ type: string; data: any } | null>(null);

  const [selectedMoneyAccountId, setSelectedMoneyAccountId] = useState<string | 'all'>('all');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}accounts`, JSON.stringify(accounts));
  }, [accounts]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}transactions`, JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}businessSales`, JSON.stringify(businessSales));
  }, [businessSales]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}businessPurchases`, JSON.stringify(businessPurchases));
  }, [businessPurchases]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}businessExpenses`, JSON.stringify(businessExpenses));
  }, [businessExpenses]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}businessPayments`, JSON.stringify(businessPayments));
  }, [businessPayments]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}movements`, JSON.stringify(movements));
  }, [movements]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}products`, JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}customers`, JSON.stringify(customers));
  }, [customers]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}cashOnHand`, JSON.stringify(cashOnHand));
  }, [cashOnHand]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}auditTrail`, JSON.stringify(auditTrail));
  }, [auditTrail]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}business`, JSON.stringify(business));
  }, [business]);

  // Derivation Helpers
  const deriveStock = (productId: string) => deriveProductStock(productId, movements);
  const deriveCustBalance = (customerId: string) => deriveCustomerBalance(customerId, businessSales, businessPayments);
  const deriveSupBalance = (supplierId: string) => deriveSupplierBalance(supplierId, businessPurchases, businessPayments);

  const businessState: BusinessState = {
    businessId: business.id,
    accounts,
    transactions,
    customers,
    suppliers,
    products,
    movements,
    sales: businessSales,
    purchases: businessPurchases,
    expenses: businessExpenses,
    payments: businessPayments,
    auditTrail,
    posSettlements,
    cashOnHand
  };

  const classifyTx = (tx: Transaction) => classifyTransaction(tx, businessState);

  // Computations
  const personalAccounts = accounts.filter(a => !a.isBusiness);
  const totalBalance = personalAccounts.reduce((sum, a) => sum + a.balance, 0);

  const personalMetrics = {
    totalBalance,
    income: 850000,
    expenses: 420000,
    savings: 300000,
    netWorth: totalBalance + investments.reduce((sum, i) => sum + i.currentValue, 0)
  };

  // 100% Traceable real calculated business metrics
  const businessMetrics = calculateBusinessMetrics(businessState);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const openDetail = (type: string, data: any) => {
    setActiveDetailItem({ type, data });
  };
  const closeDetail = () => {
    setActiveDetailItem(null);
  };
  const toggleHideBalances = () => {
    setHideBalances(prev => !prev);
  };

  const updateBusiness = (updates: Partial<Business>) => {
    setBusiness(prev => ({
      ...prev,
      ...updates,
      updated_at: new Date().toISOString()
    }));
  };

  // Add Audit Entry Helper
  const addAuditEntry = (entry: Omit<AuditTrailEntry, 'id' | 'business_id' | 'timestamp'>) => {
    const newEntry: AuditTrailEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      business_id: business.id,
      timestamp: new Date().toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    };
    setAuditTrail(prev => [newEntry, ...prev]);
  };

  // ==========================================
  // BUSINESS OPERATIONS (End-to-End Connected)
  // ==========================================

  // Scenario 1: User creates sale -> creates sale, sale items, inventory movement (-qty), customer balance, payment/cash/bank link, revenue, profit.
  const recordBusinessSale = (
    saleData: Omit<BusinessSale, 'id' | 'sale_number' | 'created_at' | 'updated_at'>
  ) => {
    const saleId = `sale-${Date.now()}`;
    const saleNumber = String(businessSales.length + 1045);
    const nowIso = new Date().toISOString();

    const newSale: BusinessSale = {
      ...saleData,
      id: saleId,
      sale_number: saleNumber,
      created_at: nowIso,
      updated_at: nowIso
    };

    setBusinessSales(prev => [newSale, ...prev]);

    // 1. Create inventory movements for each sold item (SOURCE OF TRUTH IS MOVEMENTS)
    const newMovements: InventoryMovement[] = saleData.items.map((item, idx) => ({
      id: `mov-${Date.now()}-${idx}`,
      business_id: business.id,
      product_id: item.product_id,
      movement_type: 'sale',
      quantity: -Math.abs(item.quantity),
      unit_cost: item.cost_price,
      source_type: 'sale',
      source_id: saleId,
      notes: `Sale #${saleNumber} to ${saleData.customer_name || 'Walk-in'} (${item.quantity} units)`,
      created_at: nowIso
    }));
    setMovements(prev => [...newMovements, ...prev]);

    // Also update legacy inventory for older screens
    setInventory(prev =>
      prev.map(invItem => {
        const matchingSaleItem = saleData.items.find(i => i.product_id === invItem.id || i.product_name === invItem.name);
        if (matchingSaleItem) {
          const newQty = Math.max(0, invItem.quantity - matchingSaleItem.quantity);
          return {
            ...invItem,
            quantity: newQty,
            stockValue: newQty * invItem.costPrice,
            status: newQty === 0 ? 'Out of stock' : newQty <= invItem.minAlertThreshold ? 'Low stock' : 'In stock'
          };
        }
        return invItem;
      })
    );

    // 2. If customer is recorded, update customer record
    if (saleData.customer_id) {
      setCustomers(prev =>
        prev.map(c => {
          if (c.id === saleData.customer_id) {
            const newTotalSpent = c.totalSpent + saleData.total;
            const newAmountOwed = c.amountOwed + saleData.outstanding_amount;
            return {
              ...c,
              totalSpent: newTotalSpent,
              amountOwed: newAmountOwed,
              purchasesCount: c.purchasesCount + 1,
              lastPurchaseDate: saleData.sale_date,
              status: newAmountOwed > 0 ? 'Has Due Balance' : 'Active'
            };
          }
          return c;
        })
      );
    }

    // 3. If payment made, record payment and reflect in cash-on-hand or bank
    if (saleData.paid_amount > 0) {
      const paymentMethod = (saleData.payment_method.toLowerCase() as any) || 'bank';
      const paymentId = `pay-${Date.now()}`;
      const newPayment: BusinessPayment = {
        id: paymentId,
        business_id: business.id,
        amount: saleData.paid_amount,
        payment_type: 'customer_payment',
        method: paymentMethod,
        customer_id: saleData.customer_id,
        sale_id: saleId,
        payment_date: saleData.sale_date,
        reference: `PAY-${saleNumber}`,
        notes: `Immediate payment on Sale #${saleNumber} via ${saleData.payment_method}`,
        created_at: nowIso
      };
      setBusinessPayments(prev => [newPayment, ...prev]);

      if (paymentMethod === 'cash') {
        setCashOnHand(prev => prev + saleData.paid_amount);
      } else {
        // Find business bank account (e.g. GTBank)
        setAccounts(prev =>
          prev.map(acc => (acc.id === 'acc-gtb' || acc.isBusiness ? { ...acc, balance: acc.balance + saleData.paid_amount } : acc))
        );
      }
    }

    // 4. Audit trail
    addAuditEntry({
      entity_type: 'sale',
      entity_id: saleId,
      action: 'create',
      changed_by: 'Business Owner',
      new_value: `Recorded Sale #${saleNumber} for ₦${saleData.total.toLocaleString()} (Paid: ₦${saleData.paid_amount.toLocaleString()})`
    });

    // Gentle notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'transaction',
      title: 'Sale recorded',
      description: `Sale #${saleNumber} (₦${saleData.total.toLocaleString()}) recorded. Inventory & accounts updated.`,
      time: 'Just now',
      isRead: false,
      category: 'Transactions'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Scenario 2, 13, 14: Customer Payment Workflow with Single, Oldest-First, or Split Sales support
  const recordCustomerPayment = (
    paramsOrCustomerId:
      | string
      | {
          customerId: string;
          amount: number;
          method?: 'bank' | 'cash' | 'pos' | 'card' | 'transfer';
          saleId?: string;
          transactionId?: string;
          reference?: string;
          notes?: string;
          applyStrategy?: 'single' | 'oldest_first' | 'split';
          splitSales?: { saleId: string; amount: number }[];
        },
    maybeAmount?: number,
    maybeAccountId?: string
  ) => {
    let customerId: string;
    let amount: number;
    let method: 'bank' | 'cash' | 'pos' | 'card' | 'transfer' = 'bank';
    let saleId: string | undefined;
    let transactionId: string | undefined;
    let reference: string | undefined;
    let notes: string | undefined;
    let applyStrategy: 'single' | 'oldest_first' | 'split' = 'single';
    let splitSales: { saleId: string; amount: number }[] | undefined;

    if (typeof paramsOrCustomerId === 'string') {
      customerId = paramsOrCustomerId;
      amount = maybeAmount || 0;
      method = 'bank';
      if (maybeAccountId) {
        // Find if linked to an account
      }
    } else {
      customerId = paramsOrCustomerId.customerId;
      amount = paramsOrCustomerId.amount;
      method = paramsOrCustomerId.method || 'bank';
      saleId = paramsOrCustomerId.saleId;
      transactionId = paramsOrCustomerId.transactionId;
      reference = paramsOrCustomerId.reference;
      notes = paramsOrCustomerId.notes;
      applyStrategy = paramsOrCustomerId.applyStrategy || 'single';
      splitSales = paramsOrCustomerId.splitSales;
    }

    const cust = customers.find(c => c.id === customerId);
    const nowIso = new Date().toISOString();
    let remainingAmountToApply = amount;

    // Apply payment to sales
    setBusinessSales(prev => {
      return prev.map(sale => {
        // If split strategy provided
        if (applyStrategy === 'split' && splitSales) {
          const split = splitSales.find(s => s.saleId === sale.id);
          if (split && split.amount > 0) {
            const newPaid = sale.paid_amount + split.amount;
            const newOutstanding = Math.max(0, sale.total - newPaid);
            return {
              ...sale,
              paid_amount: newPaid,
              outstanding_amount: newOutstanding,
              status: newOutstanding === 0 ? 'paid' : 'partially_paid',
              updated_at: nowIso
            };
          }
          return sale;
        }

        // If specific sale targeted
        if (saleId && sale.id === saleId) {
          const newPaid = sale.paid_amount + amount;
          const newOutstanding = Math.max(0, sale.total - newPaid);
          return {
            ...sale,
            paid_amount: newPaid,
            outstanding_amount: newOutstanding,
            status: newOutstanding === 0 ? 'paid' : 'partially_paid',
            updated_at: nowIso
          };
        }

        // If oldest first strategy or no specific sale: apply to customer's outstanding sales
        if (sale.customer_id === customerId && sale.outstanding_amount > 0 && remainingAmountToApply > 0) {
          const toApply = Math.min(sale.outstanding_amount, remainingAmountToApply);
          remainingAmountToApply -= toApply;
          const newPaid = sale.paid_amount + toApply;
          const newOutstanding = Math.max(0, sale.total - newPaid);
          return {
            ...sale,
            paid_amount: newPaid,
            outstanding_amount: newOutstanding,
            status: newOutstanding === 0 ? 'paid' : 'partially_paid',
            updated_at: nowIso
          };
        }

        return sale;
      });
    });

    // Record Payment entity
    const paymentId = `pay-${Date.now()}`;
    const newPayment: BusinessPayment = {
      id: paymentId,
      business_id: business.id,
      amount,
      payment_type: 'customer_payment',
      method,
      customer_id: customerId,
      sale_id: saleId,
      transaction_id: transactionId,
      payment_date: new Date().toISOString().split('T')[0],
      reference: reference || `RCPT-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: notes || `Customer payment from ${cust?.name || 'Customer'}`,
      created_at: nowIso
    };
    setBusinessPayments(prev => [newPayment, ...prev]);

    // Recalculate customer balance
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          const newOwed = Math.max(0, c.amountOwed - amount);
          return {
            ...c,
            amountOwed: newOwed,
            status: newOwed === 0 ? 'Active' : 'Has Due Balance'
          };
        }
        return c;
      })
    );

    // If transaction linked, mark it reconciled
    if (transactionId) {
      setTransactions(prev =>
        prev.map(t =>
          t.id === transactionId
            ? {
                ...t,
                reconciliationStatus: 'reconciled',
                reconciledWith: {
                  type: 'customer_payment',
                  id: paymentId,
                  label: `Customer payment: ${cust?.name || 'Customer'}`
                }
              }
            : t
        )
      );
    } else {
      // If cash, update cash-on-hand; if bank without tx, update bank account
      if (method === 'cash') {
        setCashOnHand(prev => prev + amount);
      }
    }

    // Audit trail
    addAuditEntry({
      entity_type: 'payment',
      entity_id: paymentId,
      action: 'create',
      changed_by: 'Business Owner',
      new_value: `Applied customer payment of ₦${amount.toLocaleString()} from ${cust?.name || 'Customer'}`
    });
  };

  // Scenario 3: Supplier purchase -> creates purchase, purchase items, inventory movements (+qty), supplier payable, payment if paid
  const recordBusinessPurchase = (
    purchaseData: Omit<BusinessPurchase, 'id' | 'purchase_number' | 'created_at' | 'updated_at'>
  ) => {
    const purchaseId = `purch-${Date.now()}`;
    const purchaseNumber = `P-${businessPurchases.length + 502}`;
    const nowIso = new Date().toISOString();

    const newPurchase: BusinessPurchase = {
      ...purchaseData,
      id: purchaseId,
      purchase_number: purchaseNumber,
      created_at: nowIso,
      updated_at: nowIso
    };
    setBusinessPurchases(prev => [newPurchase, ...prev]);

    // 1. Create inventory movements for each purchased item (+qty)
    const newMovements: InventoryMovement[] = purchaseData.items.map((item, idx) => ({
      id: `mov-${Date.now()}-${idx}`,
      business_id: business.id,
      product_id: item.product_id,
      movement_type: 'purchase',
      quantity: Math.abs(item.quantity),
      unit_cost: item.unit_cost,
      source_type: 'purchase',
      source_id: purchaseId,
      notes: `Purchase #${purchaseNumber} from ${purchaseData.supplier_name || 'Vendor'} (${item.quantity} units)`,
      created_at: nowIso
    }));
    setMovements(prev => [...newMovements, ...prev]);

    // Also update legacy inventory for legacy views
    setInventory(prev =>
      prev.map(invItem => {
        const matchingPurchItem = purchaseData.items.find(i => i.product_id === invItem.id || i.product_name === invItem.name);
        if (matchingPurchItem) {
          const newQty = invItem.quantity + matchingPurchItem.quantity;
          return {
            ...invItem,
            quantity: newQty,
            stockValue: newQty * invItem.costPrice,
            status: newQty <= invItem.minAlertThreshold ? 'Low stock' : 'In stock'
          };
        }
        return invItem;
      })
    );

    // 2. Update supplier record
    if (purchaseData.supplier_id) {
      setSuppliers(prev =>
        prev.map(s => {
          if (s.id === purchaseData.supplier_id) {
            return {
              ...s,
              totalPurchases: s.totalPurchases + purchaseData.total,
              amountOwed: s.amountOwed + purchaseData.outstanding_amount,
              lastOrderDate: purchaseData.purchase_date
            };
          }
          return s;
        })
      );
    }

    // 3. If paid amount > 0, deduct from cash or bank
    if (purchaseData.paid_amount > 0) {
      const paymentId = `pay-${Date.now()}`;
      const newPayment: BusinessPayment = {
        id: paymentId,
        business_id: business.id,
        amount: purchaseData.paid_amount,
        payment_type: 'supplier_payment',
        method: 'bank',
        supplier_id: purchaseData.supplier_id,
        purchase_id: purchaseId,
        payment_date: purchaseData.purchase_date,
        reference: `SUP-PAY-${purchaseNumber}`,
        notes: `Immediate payment on Purchase #${purchaseNumber}`,
        created_at: nowIso
      };
      setBusinessPayments(prev => [newPayment, ...prev]);

      setAccounts(prev =>
        prev.map(acc => (acc.id === 'acc-gtb' || acc.isBusiness ? { ...acc, balance: acc.balance - purchaseData.paid_amount } : acc))
      );
    }

    // 4. Audit trail
    addAuditEntry({
      entity_type: 'purchase',
      entity_id: purchaseId,
      action: 'create',
      changed_by: 'Business Owner',
      new_value: `Recorded Purchase #${purchaseNumber} for ₦${purchaseData.total.toLocaleString()} from ${purchaseData.supplier_name}`
    });
  };

  // Supplier Payment (settling payable)
  const recordSupplierPayment = ({
    supplierId,
    amount,
    method,
    purchaseId,
    transactionId,
    reference,
    notes
  }: {
    supplierId: string;
    amount: number;
    method: 'bank' | 'cash' | 'pos' | 'card' | 'transfer';
    purchaseId?: string;
    transactionId?: string;
    reference?: string;
    notes?: string;
  }) => {
    const sup = suppliers.find(s => s.id === supplierId);
    const nowIso = new Date().toISOString();

    // Settle target purchase or oldest outstanding
    let remaining = amount;
    setBusinessPurchases(prev =>
      prev.map(p => {
        if (purchaseId && p.id === purchaseId) {
          const newPaid = p.paid_amount + amount;
          const newOutstanding = Math.max(0, p.total - newPaid);
          return {
            ...p,
            paid_amount: newPaid,
            outstanding_amount: newOutstanding,
            status: newOutstanding === 0 ? 'paid' : 'partially_paid',
            updated_at: nowIso
          };
        }
        if (p.supplier_id === supplierId && p.outstanding_amount > 0 && remaining > 0) {
          const toApply = Math.min(p.outstanding_amount, remaining);
          remaining -= toApply;
          const newPaid = p.paid_amount + toApply;
          const newOutstanding = Math.max(0, p.total - newPaid);
          return {
            ...p,
            paid_amount: newPaid,
            outstanding_amount: newOutstanding,
            status: newOutstanding === 0 ? 'paid' : 'partially_paid',
            updated_at: nowIso
          };
        }
        return p;
      })
    );

    // Update supplier payable
    setSuppliers(prev =>
      prev.map(s => (s.id === supplierId ? { ...s, amountOwed: Math.max(0, s.amountOwed - amount) } : s))
    );

    const paymentId = `pay-${Date.now()}`;
    const newPayment: BusinessPayment = {
      id: paymentId,
      business_id: business.id,
      amount,
      payment_type: 'supplier_payment',
      method,
      supplier_id: supplierId,
      purchase_id: purchaseId,
      transaction_id: transactionId,
      payment_date: new Date().toISOString().split('T')[0],
      reference: reference || `SUP-PAY-${Math.floor(10000 + Math.random() * 90000)}`,
      notes: notes || `Settlement to ${sup?.name || 'Supplier'}`,
      created_at: nowIso
    };
    setBusinessPayments(prev => [newPayment, ...prev]);

    if (transactionId) {
      setTransactions(prev =>
        prev.map(t =>
          t.id === transactionId
            ? {
                ...t,
                reconciliationStatus: 'reconciled',
                reconciledWith: {
                  type: 'supplier_payment',
                  id: paymentId,
                  label: `Supplier payment: ${sup?.name || 'Supplier'}`
                }
              }
            : t
        )
      );
    } else {
      if (method === 'cash') {
        setCashOnHand(prev => Math.max(0, prev - amount));
      } else {
        setAccounts(prev =>
          prev.map(acc => (acc.id === 'acc-gtb' || acc.isBusiness ? { ...acc, balance: acc.balance - amount } : acc))
        );
      }
    }

    addAuditEntry({
      entity_type: 'payment',
      entity_id: paymentId,
      action: 'create',
      changed_by: 'Business Owner',
      new_value: `Paid ₦${amount.toLocaleString()} to supplier ${sup?.name || 'Supplier'}`
    });
  };

  // Section 18: Expense Workflow
  const recordBusinessExpense = (
    expenseData: Omit<BusinessExpenseRecord, 'id' | 'created_at'>
  ) => {
    const expenseId = `bexp-${Date.now()}`;
    const newExpense: BusinessExpenseRecord = {
      ...expenseData,
      id: expenseId,
      created_at: new Date().toISOString()
    };
    setBusinessExpenses(prev => [newExpense, ...prev]);

    // Payment record
    const paymentId = `pay-${Date.now()}`;
    const newPayment: BusinessPayment = {
      id: paymentId,
      business_id: business.id,
      amount: expenseData.amount,
      payment_type: 'expense_payment',
      method: expenseData.payment_method,
      transaction_id: expenseData.transaction_id,
      payment_date: expenseData.expense_date,
      reference: `EXP-${expenseId.slice(-5)}`,
      notes: expenseData.description,
      created_at: new Date().toISOString()
    };
    setBusinessPayments(prev => [newPayment, ...prev]);

    if (expenseData.transaction_id) {
      setTransactions(prev =>
        prev.map(t =>
          t.id === expenseData.transaction_id
            ? {
                ...t,
                reconciliationStatus: 'reconciled',
                reconciledWith: {
                  type: 'expense',
                  id: expenseId,
                  label: `Expense: ${expenseData.description}`
                }
              }
            : t
        )
      );
    } else {
      if (expenseData.payment_method === 'cash') {
        setCashOnHand(prev => Math.max(0, prev - expenseData.amount));
      } else {
        setAccounts(prev =>
          prev.map(acc => (acc.id === 'acc-gtb' || acc.isBusiness ? { ...acc, balance: acc.balance - expenseData.amount } : acc))
        );
      }
    }

    addAuditEntry({
      entity_type: 'expense',
      entity_id: expenseId,
      action: 'create',
      changed_by: 'Business Owner',
      new_value: `Recorded expense ₦${expenseData.amount.toLocaleString()} for ${expenseData.description}`
    });
  };

  // Section 16: Inventory Movement
  const recordInventoryMovement = (
    movementData: Omit<InventoryMovement, 'id' | 'created_at'>
  ) => {
    const movId = `mov-${Date.now()}`;
    const newMov: InventoryMovement = {
      ...movementData,
      id: movId,
      created_at: new Date().toISOString()
    };
    setMovements(prev => [newMov, ...prev]);

    addAuditEntry({
      entity_type: 'inventory',
      entity_id: movementData.product_id,
      action: 'update',
      changed_by: 'Business Owner',
      new_value: `Inventory ${movementData.movement_type}: ${movementData.quantity > 0 ? '+' : ''}${movementData.quantity} units (${movementData.notes || 'Adjustment'})`
    });
  };

  // Section 20: Cash Transactions
  const recordCashSale = ({
    customerName,
    productId,
    quantity,
    amount,
    notes
  }: {
    customerName?: string;
    productId: string;
    quantity: number;
    amount: number;
    notes?: string;
  }) => {
    const prod = products.find(p => p.id === productId);
    recordBusinessSale({
      business_id: business.id,
      customer_name: customerName || 'Walk-in Cash Customer',
      subtotal: amount,
      discount: 0,
      total: amount,
      paid_amount: amount,
      outstanding_amount: 0,
      status: 'paid',
      payment_method: 'Cash',
      sale_date: new Date().toISOString().split('T')[0],
      notes: notes || 'Direct cash counter sale',
      items: [
        {
          id: `si-${Date.now()}`,
          sale_id: '',
          product_id: productId,
          product_name: prod?.name || 'Product',
          quantity,
          unit_price: prod?.selling_price || amount,
          cost_price: prod?.cost_price || 0,
          line_total: amount
        }
      ]
    });
  };

  const recordCashExpense = ({
    categoryId,
    amount,
    description,
    notes
  }: {
    categoryId: string;
    amount: number;
    description: string;
    notes?: string;
  }) => {
    recordBusinessExpense({
      business_id: business.id,
      category_id: categoryId,
      amount,
      description,
      payment_method: 'cash',
      expense_date: new Date().toISOString().split('T')[0]
    });
  };

  const recordOwnerContribution = (amount: number, method: 'bank' | 'cash', notes?: string) => {
    const paymentId = `pay-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const newPayment: BusinessPayment = {
      id: paymentId,
      business_id: business.id,
      amount,
      payment_type: 'owner_contribution',
      method,
      payment_date: new Date().toISOString().split('T')[0],
      reference: `CAP-${paymentId.slice(-5)}`,
      notes: notes || 'Owner Capital Contribution / Equity Injection',
      created_at: nowIso
    };
    setBusinessPayments(prev => [newPayment, ...prev]);

    if (method === 'cash') {
      setCashOnHand(prev => prev + amount);
    } else {
      setAccounts(prev =>
        prev.map(acc => (acc.id === 'acc-gtb' || acc.isBusiness ? { ...acc, balance: acc.balance + amount } : acc))
      );
    }

    addAuditEntry({
      entity_type: 'payment',
      entity_id: paymentId,
      action: 'create',
      changed_by: 'Business Owner',
      new_value: `Recorded Owner Capital Injection of ₦${amount.toLocaleString()}`
    });
  };

  // Section 10 & 34: One-Tap Transaction Confirmation from Reconciliation Review
  const confirmTransactionMatch = (txId: string, match: TransactionMatchCandidate) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    if (match.classification === 'customer_payment' && match.customerId) {
      recordCustomerPayment({
        customerId: match.customerId,
        amount: Math.abs(tx.amount),
        method: 'transfer',
        saleId: match.candidateSaleId,
        transactionId: txId,
        reference: tx.referenceId,
        notes: `Reconciled from bank feed: ${tx.rawDescription || tx.description}`
      });
    } else if (match.classification === 'supplier_payment' && match.supplierId) {
      recordSupplierPayment({
        supplierId: match.supplierId,
        amount: Math.abs(tx.amount),
        method: 'transfer',
        purchaseId: match.candidatePurchaseId,
        transactionId: txId,
        reference: tx.referenceId,
        notes: `Reconciled from bank feed: ${tx.rawDescription || tx.description}`
      });
    } else if (match.classification === 'internal_transfer') {
      // Internal transfer: does NOT impact revenue or expense!
      setTransactions(prev =>
        prev.map(t =>
          t.id === txId
            ? {
                ...t,
                type: 'transfer',
                reconciliationStatus: 'reconciled',
                reconciledWith: {
                  type: 'internal_transfer',
                  id: txId,
                  label: 'Internal transfer between business accounts'
                }
              }
            : t
        )
      );
      addAuditEntry({
        entity_type: 'reconciliation',
        entity_id: txId,
        action: 'reconcile',
        changed_by: 'Business Owner',
        new_value: `Confirmed internal transfer of ₦${Math.abs(tx.amount).toLocaleString()}`
      });
    } else if (match.classification === 'owner_contribution') {
      const paymentId = `pay-${Date.now()}`;
      setBusinessPayments(prev => [
        {
          id: paymentId,
          business_id: business.id,
          amount: Math.abs(tx.amount),
          payment_type: 'owner_contribution',
          method: 'bank',
          transaction_id: txId,
          payment_date: tx.date,
          reference: tx.referenceId,
          notes: 'Owner capital injection',
          created_at: new Date().toISOString()
        },
        ...prev
      ]);
      setTransactions(prev =>
        prev.map(t =>
          t.id === txId
            ? {
                ...t,
                reconciliationStatus: 'reconciled',
                reconciledWith: {
                  type: 'owner_contribution',
                  id: paymentId,
                  label: 'Owner capital injection'
                }
              }
            : t
        )
      );
    } else if (match.classification === 'owner_withdrawal') {
      const paymentId = `pay-${Date.now()}`;
      setBusinessPayments(prev => [
        {
          id: paymentId,
          business_id: business.id,
          amount: Math.abs(tx.amount),
          payment_type: 'owner_withdrawal',
          method: 'bank',
          transaction_id: txId,
          payment_date: tx.date,
          reference: tx.referenceId,
          notes: 'Owner drawing / withdrawal',
          created_at: new Date().toISOString()
        },
        ...prev
      ]);
      setTransactions(prev =>
        prev.map(t =>
          t.id === txId
            ? {
                ...t,
                reconciliationStatus: 'reconciled',
                reconciledWith: {
                  type: 'owner_withdrawal',
                  id: paymentId,
                  label: 'Owner drawing'
                }
              }
            : t
        )
      );
    } else if (match.classification === 'business_expense') {
      recordBusinessExpense({
        business_id: business.id,
        category_id: match.suggestedCategory || tx.category || 'Operating Expense',
        amount: Math.abs(tx.amount),
        description: tx.description,
        payment_method: 'bank',
        transaction_id: txId,
        expense_date: tx.date
      });
    } else {
      // General reconciliation
      setTransactions(prev =>
        prev.map(t => (t.id === txId ? { ...t, reconciliationStatus: 'reconciled' } : t))
      );
    }
  };

  // Mark Personal / Ignore
  const ignoreOrMarkPersonal = (txId: string) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === txId
          ? {
              ...t,
              isBusiness: false,
              classification: 'Personal',
              cashdeckClassification: 'Personal',
              reconciliationStatus: 'ignored'
            }
          : t
      )
    );
  };

  // Custom classification from low-confidence prompt
  const classifyTransactionCustom = (
    txId: string,
    classification: TransactionClassification,
    extra?: any
  ) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    if (classification === 'customer_payment' && extra?.customerId) {
      confirmTransactionMatch(txId, {
        classification: 'customer_payment',
        confidence: 1.0,
        confidenceLevel: 'high',
        customerId: extra.customerId,
        candidateSaleId: extra.saleId,
        reason: 'User manual classification'
      });
    } else if (classification === 'owner_contribution') {
      confirmTransactionMatch(txId, {
        classification: 'owner_contribution',
        confidence: 1.0,
        confidenceLevel: 'high',
        reason: 'User marked as owner contribution'
      });
    } else if (classification === 'internal_transfer') {
      confirmTransactionMatch(txId, {
        classification: 'internal_transfer',
        confidence: 1.0,
        confidenceLevel: 'high',
        reason: 'User marked as internal transfer'
      });
    } else if (classification === 'personal') {
      ignoreOrMarkPersonal(txId);
    } else {
      setTransactions(prev =>
        prev.map(t =>
          t.id === txId
            ? {
                ...t,
                reconciliationStatus: 'reconciled',
                notes: `Classified as ${classification}`
              }
            : t
        )
      );
    }
  };

  // Section 21: POS Settlement Reconciliation
  const reconcilePOSSettlement = (
    txId: string,
    saleIds: string[],
    processingFee: number
  ) => {
    setPosSettlements(prev =>
      prev.map(pos =>
        pos.transaction_id === txId || (!pos.transaction_id && pos.status === 'pending')
          ? {
              ...pos,
              transaction_id: txId,
              matched_sale_ids: saleIds,
              processing_fee: processingFee,
              status: 'matched'
            }
          : pos
      )
    );

    // If fee > 0, record as business expense so net deposit matches
    if (processingFee > 0) {
      recordBusinessExpense({
        business_id: business.id,
        category_id: 'Financial Charges',
        amount: processingFee,
        description: 'POS merchant processing fee deduction',
        payment_method: 'bank',
        transaction_id: txId,
        expense_date: new Date().toISOString().split('T')[0]
      });
    }

    setTransactions(prev =>
      prev.map(t =>
        t.id === txId
          ? {
              ...t,
              reconciliationStatus: 'reconciled',
              reconciledWith: {
                type: 'pos_settlement',
                id: txId,
                label: `POS Settlement for ${saleIds.length} sales (Fee: ₦${processingFee.toLocaleString()})`
              }
            }
          : t
      )
    );
  };

  // Legacy Action handlers
  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newId = `tx-${Date.now()}`;
    const newTx: Transaction = {
      ...txData,
      id: newId
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'invoiceNo'>) => {
    recordBusinessSale({
      business_id: business.id,
      customer_id: saleData.customerId,
      customer_name: saleData.customerName,
      subtotal: saleData.totalAmount,
      discount: saleData.discount,
      total: saleData.totalAmount,
      paid_amount: saleData.amountPaid,
      outstanding_amount: Math.max(0, saleData.totalAmount - saleData.amountPaid),
      status: saleData.paymentStatus === 'Completed' ? 'paid' : saleData.amountPaid > 0 ? 'partially_paid' : 'unpaid',
      payment_method: (saleData.paymentMethod as any) || 'Bank',
      sale_date: saleData.date,
      notes: saleData.notes,
      items: saleData.items.map(i => ({
        id: `si-${Date.now()}`,
        sale_id: '',
        product_id: i.productId,
        product_name: i.productName,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        cost_price: i.unitPrice * 0.7,
        line_total: i.total
      }))
    });
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'stockValue'>) => {
    const newId = `prod-${Date.now()}`;
    const newProd: Product = {
      id: newId,
      business_id: business.id,
      name: item.name,
      sku: item.sku,
      category_id: item.category,
      cost_price: item.costPrice,
      selling_price: item.sellingPrice,
      stock_quantity: item.quantity,
      reorder_level: item.minAlertThreshold,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProducts(prev => [newProd, ...prev]);

    // Record opening stock movement
    recordInventoryMovement({
      business_id: business.id,
      product_id: newId,
      movement_type: 'opening_stock',
      quantity: item.quantity,
      unit_cost: item.costPrice,
      source_type: 'manual_adjustment',
      notes: 'Initial product creation'
    });

    setInventory(prev => [
      {
        ...item,
        id: newId,
        stockValue: item.quantity * item.costPrice
      },
      ...prev
    ]);
  };

  const updateInventoryStock = (itemId: string, qtyDelta: number, reason: string) => {
    recordInventoryMovement({
      business_id: business.id,
      product_id: itemId,
      movement_type: 'adjustment',
      quantity: qtyDelta,
      unit_cost: 0,
      source_type: 'manual_adjustment',
      notes: reason
    });
  };

  const addAccount = (accountData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accountData,
      id: `acc-${Date.now()}`
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  const depositToGoal = (goalId: string, amount: number, accountId: string) => {
    setGoals(prev =>
      prev.map(g => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );
  };
  const addGoal = (goalData: Omit<Goal, 'id' | 'currentAmount'>) => {
    setGoals(prev => [...prev, { ...goalData, id: `g-${Date.now()}`, currentAmount: 0 }]);
  };
  const addBudget = (budgetData: Omit<Budget, 'id' | 'spent'>) => {
    setBudgets(prev => [...prev, { ...budgetData, id: `b-${Date.now()}`, spent: 0 }]);
  };
  const addRecurringExpense = (recData: Omit<RecurringExpense, 'id'>) => {
    setRecurringExpenses(prev => [...prev, { ...recData, id: `rec-${Date.now()}` }]);
  };
  const addCustomer = (customerData: Omit<Customer, 'id'>) => {
    setCustomers(prev => [...prev, { ...customerData, id: `cust-${Date.now()}` }]);
  };
  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    setSuppliers(prev => [...prev, { ...supplierData, id: `sup-${Date.now()}` }]);
  };
  const addSupplierOrder = (
    supplierId: string,
    items: { productId: string; quantity: number; unitCost: number }[],
    totalCost: number,
    amountPaid: number,
    accountId: string
  ) => {
    const sup = suppliers.find(s => s.id === supplierId);
    recordBusinessPurchase({
      business_id: business.id,
      supplier_id: supplierId,
      supplier_name: sup?.name,
      subtotal: totalCost,
      total: totalCost,
      paid_amount: amountPaid,
      outstanding_amount: Math.max(0, totalCost - amountPaid),
      status: amountPaid >= totalCost ? 'paid' : amountPaid > 0 ? 'partially_paid' : 'unpaid',
      purchase_date: new Date().toISOString().split('T')[0],
      items: items.map(i => ({
        id: `pi-${Date.now()}`,
        purchase_id: '',
        product_id: i.productId,
        product_name: products.find(p => p.id === i.productId)?.name || 'Product',
        quantity: i.quantity,
        unit_cost: i.unitCost,
        line_total: i.quantity * i.unitCost
      }))
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const connectBankAccounts = (
    bankName: string,
    accountsToAdd: { name: string; balance: number; type: AccountType; isBusiness?: boolean }[]
  ) => {
    const newAccs: Account[] = accountsToAdd.map((a, idx) => ({
      id: `acc-${Date.now()}-${idx}`,
      name: `${bankName} ${a.name}`,
      bankName: bankName,
      type: a.type,
      accountNumber: `01${Math.floor(10000000 + Math.random() * 90000000)}`,
      balance: a.balance,
      currency: '₦',
      isBusiness: !!a.isBusiness,
      status: 'active'
    }));
    setAccounts(prev => [...prev, ...newAccs]);
  };

  const refreshAccount = async (id?: string | 'all') => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 850));
    setAccounts(prev =>
      prev.map(acc => {
        if (!id || id === 'all' || acc.id === id) {
          return {
            ...acc,
            lastSyncedAt: 'Updated just now',
            status: acc.status === 'needs_reauth' ? 'active' : acc.status
          };
        }
        return acc;
      })
    );
    setIsSyncing(false);
  };

  const reconnectAccount = (id: string) => {
    setAccounts(prev =>
      prev.map(acc =>
        acc.id === id ? { ...acc, status: 'active', errorMessage: undefined, lastSyncedAt: 'Updated just now' } : acc
      )
    );
  };

  const disconnectAccount = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  const toggleAccountAttention = (id: string) => {
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === id) {
          const newStatus = acc.status === 'needs_reauth' ? 'active' : 'needs_reauth';
          return {
            ...acc,
            status: newStatus,
            errorMessage: newStatus === 'needs_reauth' ? 'Session expired with provider. Re-authentication required.' : undefined
          };
        }
        return acc;
      })
    );
  };

  const addCashTransaction = (
    description: string,
    amount: number,
    category: string,
    classification: 'Personal' | 'Business'
  ) => {
    if (classification === 'Business') {
      if (amount > 0) {
        recordCashSale({
          productId: products[0]?.id || 'prod-1',
          quantity: 1,
          amount,
          notes: description
        });
      } else {
        recordCashExpense({
          categoryId: category,
          amount: Math.abs(amount),
          description
        });
      }
    }
  };

  const updateTransactionMetadata = (txId: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => (t.id === txId ? { ...t, ...updates } : t)));
  };

  const connectFullProvider = (
    providerName: string,
    accountName: string,
    maskedNum: string,
    balance: number,
    type: AccountType,
    transactionsToAdd: Array<{
      date: string;
      time?: string;
      description: string;
      amount: number;
      category: string;
      type: TransactionType;
      referenceId?: string;
      sender?: string;
      recipient?: string;
      merchant?: string;
      channel?: 'Bank Transfer' | 'POS Payment' | 'Web Checkout' | 'ATM Withdrawal' | 'Direct Debit';
      rawDescription?: string;
    }>
  ) => {
    const newAccountId = `acc-${providerName.toLowerCase().replace(/[\s-]/g, '')}-${Date.now()}`;
    const newAcc: Account = {
      id: newAccountId,
      name: accountName,
      bankName: providerName,
      type: type,
      accountNumber: maskedNum.replace(/[^\d]/g, '') || `01${Math.floor(10000000 + Math.random() * 90000000)}`,
      maskedAccountNumber: maskedNum || `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
      balance: balance,
      availableBalance: balance,
      currentBalance: balance,
      currency: '₦',
      isBusiness: false,
      status: 'active',
      institutionId: providerName.toLowerCase().replace(/[\s-]/g, ''),
      providerId: providerName.toLowerCase().replace(/[\s-]/g, ''),
      providerName: providerName,
      lastSyncedAt: 'Updated just now'
    };

    const newTxs: Transaction[] = transactionsToAdd.map((item, idx) => ({
      id: `tx-${newAccountId}-${idx}-${Date.now()}`,
      date: item.date,
      time: item.time || '10:00 AM',
      description: item.description,
      amount: item.amount,
      direction: item.amount > 0 ? 'inflow' : 'outflow',
      accountId: newAccountId,
      accountName: providerName,
      accountMasked: newAcc.maskedAccountNumber,
      category: item.category,
      type: item.type,
      status: 'Completed',
      isBusiness: false,
      referenceId: item.referenceId || `TRX${Math.floor(1000000 + Math.random() * 9000000)}`,
      sender: item.sender,
      recipient: item.recipient,
      merchant: item.merchant,
      channel: item.channel || 'Bank Transfer',
      rawDescription: item.rawDescription || `${item.description.toUpperCase()}/${item.referenceId || 'REF'}`,
      cashdeckCategory: item.category,
      cashdeckClassification: 'Personal',
      syncStatus: 'synced'
    }));

    setAccounts(prev => [...prev, newAcc]);
    setTransactions(prev => [...newTxs, ...prev]);
    setSelectedMoneyAccountId(newAccountId);
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setAccounts(initialAccounts);
    setTransactions(initialTransactions);
    setBudgets(initialBudgets);
    setRecurringExpenses(initialRecurringExpenses);
    setCalendarEvents(initialCalendarEvents);
    setSales(initialSales);
    setInventory(initialInventory);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setGoals(initialGoals);
    setInvestments(initialInvestments);
    setInsights(initialInsights);
    setNotifications(initialNotifications);
    setBusiness(initialBusiness);
    setProducts(initialProducts);
    setMovements(initialInventoryMovements);
    setBusinessSales(initialBusinessSales);
    setBusinessPurchases(initialBusinessPurchases);
    setBusinessExpenses(initialBusinessExpenses);
    setBusinessPayments(initialBusinessPayments);
    setAuditTrail(initialAuditTrail);
    setPosSettlements([initialPOSSettlement]);
    setCashOnHand(350000);
  };

  return (
    <FinancialContext.Provider
      value={{
        accounts,
        transactions,
        budgets,
        recurringExpenses,
        calendarEvents,
        sales,
        inventory,
        customers,
        suppliers,
        goals,
        investments,
        insights,
        notifications,
        userMode,
        setUserMode,
        currentScreen,
        setCurrentScreen,
        searchQuery,
        setSearchQuery,
        dateRange,
        setDateRange,
        hideBalances,
        setHideBalances,
        toggleHideBalances,
        isOnboardingOpen,
        setIsOnboardingOpen,
        activeDetailItem,
        openDetail,
        closeDetail,
        addTransaction,
        addSale,
        recordCustomerPayment,
        addInventoryItem,
        updateInventoryStock,
        addAccount,
        depositToGoal,
        addGoal,
        addBudget,
        addRecurringExpense,
        addCustomer,
        addSupplier,
        addSupplierOrder,
        markNotificationRead,
        markAllNotificationsRead,
        connectBankAccounts,
        resetToDemoData,
        selectedMoneyAccountId,
        setSelectedMoneyAccountId,
        isSyncing,
        refreshAccount,
        reconnectAccount,
        disconnectAccount,
        toggleAccountAttention,
        addCashTransaction,
        updateTransactionMetadata,
        connectFullProvider,
        personalMetrics,
        businessMetrics,
        unreadNotificationsCount,

        // Business Engine & Relational Model
        business,
        updateBusiness,
        businessMembers,
        products,
        movements,
        businessSales,
        businessPurchases,
        businessExpenses,
        businessPayments,
        auditTrail,
        posSettlements,
        cashOnHand,

        deriveStock,
        deriveCustBalance,
        deriveSupBalance,
        classifyTx,

        recordBusinessSale,
        recordBusinessPurchase,
        recordSupplierPayment,
        recordBusinessExpense,
        recordInventoryMovement,
        recordCashSale,
        recordCashExpense,
        recordOwnerContribution,
        confirmTransactionMatch,
        ignoreOrMarkPersonal,
        classifyTransactionCustom,
        reconcilePOSSettlement
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
