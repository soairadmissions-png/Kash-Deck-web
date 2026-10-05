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
  FinancialProvider
} from '../types';

export const initialAccounts: Account[] = [
  {
    id: 'acc-gtb',
    name: 'GTBank',
    bankName: 'GTBank',
    type: 'bank',
    accountNumber: '0123454821',
    maskedAccountNumber: '•••• 4821',
    balance: 2100000,
    availableBalance: 2100000,
    currentBalance: 2100000,
    currency: '₦',
    isBusiness: false,
    status: 'active',
    institutionId: 'gtbank',
    providerId: 'gtbank',
    providerName: 'Guaranty Trust Bank',
    color: '#e03a00',
    lastSyncedAt: 'Updated just now'
  },
  {
    id: 'acc-access',
    name: 'Access',
    bankName: 'Access Bank',
    type: 'bank',
    accountNumber: '0459821934',
    maskedAccountNumber: '•••• 1934',
    balance: 850000,
    availableBalance: 850000,
    currentBalance: 850000,
    currency: '₦',
    isBusiness: false,
    status: 'active',
    institutionId: 'access',
    providerId: 'access',
    providerName: 'Access Bank Plc',
    color: '#005baa',
    lastSyncedAt: 'Updated just now'
  },
  {
    id: 'acc-uba',
    name: 'UBA',
    bankName: 'UBA',
    type: 'bank',
    accountNumber: '1098237712',
    maskedAccountNumber: '•••• 7712',
    balance: 1400000,
    availableBalance: 1400000,
    currentBalance: 1400000,
    currency: '₦',
    isBusiness: false,
    status: 'active',
    institutionId: 'uba',
    providerId: 'uba',
    providerName: 'United Bank for Africa',
    color: '#dc2626',
    lastSyncedAt: 'Updated just now'
  },
  {
    id: 'acc-opay',
    name: 'OPay',
    bankName: 'OPay',
    type: 'wallet',
    accountNumber: '8012346291',
    maskedAccountNumber: '•••• 6291',
    balance: 500000,
    availableBalance: 500000,
    currentBalance: 500000,
    currency: '₦',
    isBusiness: false,
    status: 'active',
    institutionId: 'opay',
    providerId: 'opay',
    providerName: 'OPay Digital Services',
    color: '#059669',
    lastSyncedAt: 'Updated just now'
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-amaka',
    date: '2026-10-03',
    time: '11:20 AM',
    description: 'Transfer received',
    merchantOrParty: 'AMAKA STORES',
    sender: 'Amaka Stores',
    category: 'Sales',
    amount: 150000,
    direction: 'inflow',
    accountId: 'acc-gtb',
    accountName: 'GTBank',
    accountMasked: '•••• 4821',
    type: 'income',
    status: 'Completed',
    isBusiness: true,
    referenceId: 'TRX1042918',
    channel: 'Bank Transfer',
    rawDescription: 'NIP/GTB/AMAKA STORES/INVOICE 1042/TRX1042918',
    cashdeckCategory: 'Sales',
    cashdeckClassification: 'Business',
    reconciliationStatus: 'unreconciled',
    syncStatus: 'synced'
  },
  {
    id: 'tx-unknown',
    date: '2026-10-03',
    time: '09:45 AM',
    description: 'Direct Deposit',
    merchantOrParty: 'UNKNOWN PERSON',
    sender: 'UNKNOWN PERSON',
    category: 'Other',
    amount: 73000,
    direction: 'inflow',
    accountId: 'acc-gtb',
    accountName: 'GTBank',
    accountMasked: '•••• 4821',
    type: 'income',
    status: 'Completed',
    isBusiness: true,
    referenceId: 'TRX7300092',
    channel: 'Bank Transfer',
    rawDescription: 'NIP/FBN/UNKNOWN PERSON/DIRECT TRANSFER/TRX7300092',
    cashdeckCategory: 'Other',
    cashdeckClassification: 'Business',
    reconciliationStatus: 'unreconciled',
    syncStatus: 'synced'
  },
  {
    id: 'tx-abc',
    date: '2026-10-03',
    time: '08:30 AM',
    description: 'Supplier Settlement',
    merchantOrParty: 'ABC Wholesale',
    recipient: 'ABC Wholesale',
    category: 'Inventory',
    amount: -500000,
    direction: 'outflow',
    accountId: 'acc-gtb',
    accountName: 'GTBank',
    accountMasked: '•••• 4821',
    type: 'expense',
    status: 'Completed',
    isBusiness: true,
    referenceId: 'TRX5010091',
    channel: 'Bank Transfer',
    rawDescription: 'NIP/GTB/ABC WHOLESALE/SUPPLY P-501/TRX5010091',
    cashdeckCategory: 'Inventory',
    cashdeckClassification: 'Business',
    reconciliationStatus: 'unreconciled',
    syncStatus: 'synced'
  },
  {
    id: 'tx-internal',
    date: '2026-10-02',
    time: '04:15 PM',
    description: 'TRF TO ACCESS BANK',
    merchantOrParty: 'Self • Access Bank',
    category: 'Transfer',
    amount: -45000,
    direction: 'outflow',
    accountId: 'acc-gtb',
    accountName: 'GTBank',
    accountMasked: '•••• 4821',
    transferToAccountId: 'acc-access',
    type: 'transfer',
    status: 'Completed',
    isBusiness: true,
    referenceId: 'TRX4500912',
    channel: 'Bank Transfer',
    rawDescription: 'FT/GTB/INTERNAL TRF TO ACCESS BANK 1934/TRX4500912',
    cashdeckCategory: 'Transfer',
    cashdeckClassification: 'Business',
    reconciliationStatus: 'unreconciled',
    syncStatus: 'synced'
  },
  {
    id: 'tx-pos-settle',
    date: '2026-10-02',
    time: '02:00 PM',
    description: 'POS Settlement',
    merchantOrParty: 'Moniepoint POS Settlement',
    category: 'Sales',
    amount: 441000,
    direction: 'inflow',
    accountId: 'acc-gtb',
    accountName: 'GTBank',
    accountMasked: '•••• 4821',
    type: 'income',
    status: 'Completed',
    isBusiness: true,
    referenceId: 'TRX8821901',
    channel: 'POS Payment',
    rawDescription: 'POS/MONIEPOINT/DAILY SETTLEMENT/BATCH-8821901',
    cashdeckCategory: 'Sales',
    cashdeckClassification: 'Business',
    reconciliationStatus: 'unreconciled',
    syncStatus: 'synced'
  },
  {
    id: 'tx-1',
    date: '2026-10-02',
    time: '10:42 AM',
    description: 'Transfer received',
    merchantOrParty: 'John Doe',
    sender: 'John Doe',
    category: 'Transfer',
    amount: 500000,
    direction: 'inflow',
    accountId: 'acc-gtb',
    accountName: 'GTBank',
    accountMasked: '•••• 4821',
    type: 'income',
    status: 'Completed',
    isBusiness: true,
    referenceId: 'TRX8392018',
    channel: 'Bank Transfer',
    rawDescription: 'NIP/GTB/JOHN DOE/BUSINESS PAYMENT/TRX8392018',
    cashdeckCategory: 'Transfer',
    cashdeckClassification: 'Business',
    notes: 'Consulting milestone payment for Q4 platform rollout',
    syncStatus: 'synced'
  },
  {
    id: 'tx-2',
    date: '2026-10-02',
    time: '08:15 AM',
    description: 'Transfer',
    merchantOrParty: 'Mrs. Funke Adeleke',
    recipient: 'Mrs. Funke Adeleke',
    category: 'Transfer',
    amount: -45000,
    direction: 'outflow',
    accountId: 'acc-access',
    accountName: 'Access',
    accountMasked: '•••• 1934',
    type: 'expense',
    status: 'Completed',
    isBusiness: false,
    referenceId: 'TRX9021844',
    channel: 'Bank Transfer',
    rawDescription: 'FT/ACC/FUNKE ADELEKE/FAMILY SUPPORT/TRX9021844',
    cashdeckCategory: 'Personal',
    cashdeckClassification: 'Personal',
    notes: 'Family upkeep allowance',
    syncStatus: 'synced'
  },
  {
    id: 'tx-3',
    date: '2026-10-02',
    time: '01:20 PM',
    description: 'POS Payment',
    merchantOrParty: 'Shoprite Ikeja',
    merchant: 'Shoprite Ikeja City Mall',
    category: 'Groceries',
    amount: -12500,
    direction: 'outflow',
    accountId: 'acc-uba',
    accountName: 'UBA',
    accountMasked: '•••• 7712',
    type: 'expense',
    status: 'Completed',
    isBusiness: false,
    referenceId: 'TRX7192081',
    channel: 'POS Payment',
    rawDescription: 'POS/002910/SHOPRITE IKEJA MALL/LAGOS',
    cashdeckCategory: 'Groceries',
    cashdeckClassification: 'Personal',
    notes: 'Fresh groceries & pantry supplies',
    syncStatus: 'synced'
  },
  {
    id: 'tx-4',
    date: '2026-10-02',
    time: '03:40 PM',
    description: 'Transfer received',
    merchantOrParty: 'Chinedu Eze',
    sender: 'Chinedu Eze',
    category: 'Receivable',
    amount: 100000,
    direction: 'inflow',
    accountId: 'acc-opay',
    accountName: 'OPay',
    accountMasked: '•••• 6291',
    type: 'income',
    status: 'Completed',
    isBusiness: true,
    referenceId: 'TRX4091823',
    channel: 'Bank Transfer',
    rawDescription: 'OPAY/TRF/CHINEDU EZE/GADGET SETTLEMENT',
    cashdeckCategory: 'Receivable',
    cashdeckClassification: 'Business',
    notes: 'Balance settlement for headphone units',
    syncStatus: 'synced'
  },
  {
    id: 'tx-5',
    date: '2026-10-01',
    time: '09:12 AM',
    description: 'Bank transfer',
    merchantOrParty: 'Acme Global NG',
    sender: 'Acme Global NG',
    category: 'Income',
    amount: 150000,
    direction: 'inflow',
    accountId: 'acc-access',
    accountName: 'Access',
    accountMasked: '•••• 1934',
    type: 'income',
    status: 'Completed',
    isBusiness: false,
    referenceId: 'TRX9018442',
    channel: 'Bank Transfer',
    rawDescription: 'NIP/ACC/ACME GLOBAL/MONTHLY RETAINER',
    cashdeckCategory: 'Income',
    cashdeckClassification: 'Personal',
    notes: 'Monthly advisory retainer',
    syncStatus: 'synced'
  },
  {
    id: 'tx-6',
    date: '2026-10-01',
    time: '11:32 AM',
    description: 'TechWorld (Inventory Purchase)',
    merchantOrParty: 'TechWorld Supplies',
    recipient: 'TechWorld Supplies',
    category: 'Business',
    amount: -600000,
    direction: 'outflow',
    accountId: 'acc-gtb',
    accountName: 'GTBank',
    accountMasked: '•••• 4821',
    type: 'expense',
    status: 'Completed',
    isBusiness: true,
    referenceId: 'TRX8391104',
    channel: 'Bank Transfer',
    rawDescription: 'NIP/GTB/TECHWORLD SUPPLIES/INV0928',
    cashdeckCategory: 'Business',
    cashdeckClassification: 'Business',
    notes: 'AirPods Pro wholesale inventory order',
    syncStatus: 'synced'
  },
  {
    id: 'tx-7',
    date: '2026-10-01',
    time: '02:11 PM',
    description: 'Airtime Purchase',
    merchantOrParty: 'MTN Nigeria',
    merchant: 'MTN Nigeria VTU',
    category: 'Personal',
    amount: -2000,
    direction: 'outflow',
    accountId: 'acc-uba',
    accountName: 'UBA',
    accountMasked: '•••• 7712',
    type: 'expense',
    status: 'Completed',
    isBusiness: false,
    referenceId: 'TRX7184201',
    channel: 'Web Checkout',
    rawDescription: 'VTU/MTN/AIRTIME TOPUP/08032418901',
    cashdeckCategory: 'Personal',
    cashdeckClassification: 'Personal',
    notes: 'Mobile broadband top-up',
    syncStatus: 'synced'
  },
  {
    id: 'tx-8',
    date: '2026-10-01',
    time: '10:24 AM',
    description: 'Bolt Ride',
    merchantOrParty: 'Bolt',
    merchant: 'Bolt Ride Hailing',
    category: 'Transport',
    amount: -8500,
    direction: 'outflow',
    accountId: 'acc-opay',
    accountName: 'OPay',
    accountMasked: '•••• 6291',
    type: 'expense',
    status: 'Completed',
    isBusiness: false,
    referenceId: 'TRX4088192',
    channel: 'POS Payment',
    rawDescription: 'POS/BOLT LAGOS/TRIP_88291',
    cashdeckCategory: 'Transport',
    cashdeckClassification: 'Personal',
    notes: 'Ride to Lagos Island meeting',
    syncStatus: 'synced'
  },
  {
    id: 'tx-9',
    date: '2026-09-29',
    time: '04:18 PM',
    description: 'Netflix',
    merchantOrParty: 'Netflix',
    merchant: 'Netflix Nigeria',
    category: 'Subscriptions',
    amount: -5000,
    direction: 'outflow',
    accountId: 'acc-access',
    accountName: 'Access',
    accountMasked: '•••• 1934',
    type: 'expense',
    status: 'Completed',
    isBusiness: false,
    referenceId: 'TRX9011029',
    channel: 'Web Checkout',
    rawDescription: 'CARD/NETFLIX.COM/MONTHLY SUB',
    cashdeckCategory: 'Subscriptions',
    cashdeckClassification: 'Personal',
    notes: 'Monthly 4K streaming sub',
    syncStatus: 'synced'
  },
  {
    id: 'tx-10',
    date: '2026-09-28',
    time: '09:05 AM',
    description: 'ATM Cash Withdrawal',
    merchantOrParty: 'ATM • GTBank Lekki',
    merchant: 'GTBank ATM Lekki Phase 1',
    category: 'Cash',
    amount: -100000,
    direction: 'outflow',
    accountId: 'acc-gtb',
    accountName: 'GTBank',
    accountMasked: '•••• 4821',
    type: 'transfer',
    status: 'Completed',
    isBusiness: false,
    referenceId: 'TRX8389012',
    channel: 'ATM Withdrawal',
    rawDescription: 'ATM/GTB LEKKI 1/CASH WDL',
    cashdeckCategory: 'Cash',
    cashdeckClassification: 'Personal',
    notes: 'Pocket cash',
    syncStatus: 'synced'
  }
];

export const initialBudgets: Budget[] = [
  {
    id: 'b-1',
    name: 'Transport',
    category: 'Transport',
    monthlyLimit: 100000,
    spent: 45000,
    color: '#0ea5e9',
    iconName: 'Car'
  },
  {
    id: 'b-2',
    name: 'Food & Dining',
    category: 'Food & Dining',
    monthlyLimit: 80000,
    spent: 32000,
    color: '#10b981',
    iconName: 'Utensils'
  },
  {
    id: 'b-3',
    name: 'Shopping',
    category: 'Shopping',
    monthlyLimit: 60000,
    spent: 28000,
    color: '#ec4899',
    iconName: 'ShoppingBag'
  },
  {
    id: 'b-4',
    name: 'Bills & Utilities',
    category: 'Bills & Utilities',
    monthlyLimit: 50000,
    spent: 25000,
    color: '#f59e0b',
    iconName: 'Zap'
  }
];

export const initialRecurringExpenses: RecurringExpense[] = [
  {
    id: 'rec-1',
    name: 'Netflix',
    amount: 5000,
    frequency: 'Monthly',
    nextPaymentDate: '2026-10-05',
    category: 'Subscriptions',
    status: 'Active',
    accountName: 'Kuda Card',
    iconBg: '#fee2e2'
  },
  {
    id: 'rec-2',
    name: 'DSTV Premium',
    amount: 29500,
    frequency: 'Monthly',
    nextPaymentDate: '2026-10-14',
    category: 'Entertainment',
    status: 'Active',
    accountName: 'GTBank Checking',
    iconBg: '#e0f2fe'
  },
  {
    id: 'rec-3',
    name: 'MTN 5G Data Bundle',
    amount: 15000,
    frequency: 'Weekly',
    nextPaymentDate: '2026-10-08',
    category: 'Utilities',
    status: 'Active',
    accountName: 'GTBank Checking',
    iconBg: '#dcfce7'
  },
  {
    id: 'rec-4',
    name: 'Apartment Rent (Quarterly Reserve)',
    amount: 600000,
    frequency: 'Monthly',
    nextPaymentDate: '2026-10-03',
    category: 'Housing',
    status: 'Due Soon',
    accountName: 'GTBank Checking',
    iconBg: '#fef3c7'
  }
];

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: 'cal-1',
    date: '2026-10-03',
    dayOfMonth: 3,
    title: 'Rent Payment',
    amount: 2400000,
    type: 'expense',
    category: 'Housing',
    dueText: 'Due in 1 day',
    isBusiness: false
  },
  {
    id: 'cal-2',
    date: '2026-10-05',
    dayOfMonth: 5,
    title: 'Netflix Subscription',
    amount: 5000,
    type: 'expense',
    category: 'Subscriptions',
    dueText: 'Due in 3 days',
    isBusiness: false
  },
  {
    id: 'cal-3',
    date: '2026-10-10',
    dayOfMonth: 10,
    title: 'EKEDC Electricity Bill',
    amount: 25000,
    type: 'bill',
    category: 'Utilities',
    dueText: 'Due in 8 days',
    isBusiness: false
  },
  {
    id: 'cal-4',
    date: '2026-10-12',
    dayOfMonth: 12,
    title: 'TechWorld Supplier Settlement',
    amount: 600000,
    type: 'supplier',
    category: 'Business',
    dueText: 'Due in 10 days',
    isBusiness: true
  },
  {
    id: 'cal-5',
    date: '2026-10-15',
    dayOfMonth: 15,
    title: 'Chinedu Expected Balance Payment',
    amount: 300000,
    type: 'income',
    category: 'Receivable',
    dueText: 'Expected',
    isBusiness: true
  },
  {
    id: 'cal-6',
    date: '2026-10-25',
    dayOfMonth: 25,
    title: 'Monthly Salary Inflow',
    amount: 850000,
    type: 'income',
    category: 'Income',
    dueText: 'Scheduled',
    isBusiness: false
  }
];

export const initialGoals: Goal[] = [
  {
    id: 'g-1',
    name: 'Car Fund',
    category: 'Vehicle',
    targetAmount: 5000000,
    currentAmount: 850000,
    targetDate: 'Dec 2027',
    iconName: 'Car',
    color: '#0d9488'
  },
  {
    id: 'g-2',
    name: 'MacBook Pro M3',
    category: 'Gadgets',
    targetAmount: 2000000,
    currentAmount: 1200000,
    targetDate: 'Dec 2026',
    iconName: 'Laptop',
    color: '#10b981'
  },
  {
    id: 'g-3',
    name: 'Emergency Fund',
    category: 'Safety',
    targetAmount: 3000000,
    currentAmount: 1500000,
    targetDate: 'Jun 2027',
    iconName: 'ShieldCheck',
    color: '#3b82f6'
  },
  {
    id: 'g-4',
    name: 'Business Expansion Lekki Outlet',
    category: 'Business',
    targetAmount: 8000000,
    currentAmount: 2400000,
    targetDate: 'Mar 2028',
    iconName: 'Store',
    color: '#8b5cf6'
  }
];

export const initialInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'AirPods Pro (2nd Gen)',
    sku: 'APP-GEN2-001',
    category: 'Audio',
    quantity: 32,
    costPrice: 140000,
    sellingPrice: 200000,
    stockValue: 6400000,
    status: 'In stock',
    minAlertThreshold: 5
  },
  {
    id: 'inv-2',
    name: 'iPhone 15 (128GB Black)',
    sku: 'IPH-15-128-BLK',
    category: 'Smartphones',
    quantity: 18,
    costPrice: 850000,
    sellingPrice: 1100000,
    stockValue: 19800000,
    status: 'In stock',
    minAlertThreshold: 4
  },
  {
    id: 'inv-3',
    name: '20W USB-C Fast Charger',
    sku: 'CHG-20W-WHT',
    category: 'Accessories',
    quantity: 48,
    costPrice: 8500,
    sellingPrice: 15000,
    stockValue: 720000,
    status: 'In stock',
    minAlertThreshold: 10
  },
  {
    id: 'inv-4',
    name: 'MagSafe Silicone Cases',
    sku: 'CAS-MS-CLR',
    category: 'Accessories',
    quantity: 4,
    costPrice: 4000,
    sellingPrice: 12000,
    stockValue: 48000,
    status: 'Low stock',
    minAlertThreshold: 10
  },
  {
    id: 'inv-5',
    name: 'Samsung Galaxy S24 Ultra',
    sku: 'SAM-S24U-256',
    category: 'Smartphones',
    quantity: 0,
    costPrice: 1200000,
    sellingPrice: 1550000,
    stockValue: 0,
    status: 'Out of stock',
    minAlertThreshold: 2
  },
  {
    id: 'inv-6',
    name: 'Luxury Cotton Crew Neck Shirt',
    sku: 'APP-SHT-WHT-L',
    category: 'Apparel',
    quantity: 40,
    costPrice: 8000,
    sellingPrice: 15000,
    stockValue: 320000,
    status: 'In stock',
    minAlertThreshold: 8
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-amaka',
    name: 'Amaka Stores',
    phone: '+234 803 555 1042',
    email: 'amaka.stores@gmail.com',
    purchasesCount: 3,
    totalSpent: 450000,
    amountOwed: 150000,
    lastPurchaseDate: '2026-10-01',
    notes: 'Fashion boutique client on Lagos Mainland. Has pending Sale #1042 for ₦150k.',
    status: 'Has Due Balance'
  },
  {
    id: 'cust-1',
    name: 'Chinedu Eze',
    phone: '+234 803 241 8901',
    email: 'chinedu.eze@gmail.com',
    purchasesCount: 8,
    totalSpent: 2850000,
    amountOwed: 300000,
    lastPurchaseDate: '2026-09-27',
    notes: 'Bulk gadget reseller, preferred customer with 5% wholesale discount.',
    status: 'Has Due Balance'
  },
  {
    id: 'cust-2',
    name: 'Funke Adeleke',
    phone: '+234 812 770 9923',
    email: 'funke.a@outlook.com',
    purchasesCount: 14,
    totalSpent: 1640000,
    amountOwed: 20000,
    lastPurchaseDate: '2026-09-30',
    notes: 'Regular corporate gift buyer for her PR agency.',
    status: 'VIP'
  },
  {
    id: 'cust-3',
    name: 'Emeka Okafor',
    phone: '+234 802 443 1188',
    email: 'emeka.ok@yahoo.com',
    purchasesCount: 4,
    totalSpent: 520000,
    amountOwed: 0,
    lastPurchaseDate: '2026-09-15',
    notes: 'Audio gear enthusiast, always pays via POS/Instant Transfer.',
    status: 'Active'
  },
  {
    id: 'cust-4',
    name: 'Zainab Bello',
    phone: '+234 905 882 1450',
    email: 'zainab.b@fintechlagos.com',
    purchasesCount: 6,
    totalSpent: 890000,
    amountOwed: 0,
    lastPurchaseDate: '2026-09-20',
    notes: 'Purchases devices for team onboarding.',
    status: 'Active'
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-abc',
    name: 'ABC Wholesale',
    contactPerson: 'Alhaji Bashir',
    phone: '+234 803 111 5010',
    email: 'sales@abcwholesale.ng',
    productsSupplied: ['Luxury Cotton Shirts', 'Textiles', 'Packaging'],
    totalPurchases: 2500000,
    amountPaid: 2000000,
    amountOwed: 500000,
    lastOrderDate: '2026-10-01'
  },
  {
    id: 'sup-1',
    name: 'TechWorld Global Distro',
    contactPerson: 'Kazeem Oladipo',
    phone: '+234 802 991 3340',
    email: 'orders@techworlddistro.ng',
    productsSupplied: ['AirPods Pro', 'iPhone 15', 'Original Chargers'],
    totalPurchases: 18500000,
    amountPaid: 17900000,
    amountOwed: 600000,
    lastOrderDate: '2026-09-26'
  },
  {
    id: 'sup-2',
    name: 'Slot Wholesale Hub',
    contactPerson: 'Nnamdi Umeh',
    phone: '+234 809 312 4488',
    email: 'b2b@slothub.ng',
    productsSupplied: ['Samsung Smartphones', 'Screen Protectors'],
    totalPurchases: 9400000,
    amountPaid: 9400000,
    amountOwed: 0,
    lastOrderDate: '2026-09-10'
  },
  {
    id: 'sup-3',
    name: 'Alaba Prime Accessories',
    contactPerson: 'Mrs. Chioma Okeke',
    phone: '+234 803 762 1099',
    email: 'chioma@alabaprime.com',
    productsSupplied: ['MagSafe Cases', 'Cables', 'Powerbanks'],
    totalPurchases: 3200000,
    amountPaid: 2950000,
    amountOwed: 250000,
    lastOrderDate: '2026-09-18'
  }
];

export const initialSales: Sale[] = [
  {
    id: 'sale-1',
    invoiceNo: 'INV-2026-018',
    customerId: 'cust-1',
    customerName: 'Chinedu Eze',
    items: [
      {
        productId: 'inv-1',
        productName: 'AirPods Pro (2nd Gen)',
        quantity: 3,
        unitPrice: 200000,
        total: 600000
      }
    ],
    totalAmount: 600000,
    amountPaid: 300000,
    discount: 0,
    paymentMethod: 'Transfer',
    paymentStatus: 'Pending',
    date: '2026-09-27',
    notes: '50% deposit received, balance expected by Oct 15.'
  },
  {
    id: 'sale-2',
    invoiceNo: 'INV-2026-017',
    customerId: 'cust-2',
    customerName: 'Funke Adeleke',
    items: [
      {
        productId: 'inv-2',
        productName: 'iPhone 15 (128GB Black)',
        quantity: 1,
        unitPrice: 1100000,
        total: 1100000
      },
      {
        productId: 'inv-3',
        productName: '20W USB-C Fast Charger',
        quantity: 1,
        unitPrice: 15000,
        total: 15000
      }
    ],
    totalAmount: 1115000,
    amountPaid: 1095000,
    discount: 0,
    paymentMethod: 'POS',
    paymentStatus: 'Completed',
    date: '2026-09-30',
    notes: '₦20,000 pending cash balance.'
  },
  {
    id: 'sale-3',
    invoiceNo: 'INV-2026-016',
    customerId: 'cust-3',
    customerName: 'Emeka Okafor',
    items: [
      {
        productId: 'inv-1',
        productName: 'AirPods Pro (2nd Gen)',
        quantity: 1,
        unitPrice: 200000,
        total: 200000
      }
    ],
    totalAmount: 200000,
    amountPaid: 200000,
    discount: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'Completed',
    date: '2026-09-15'
  }
];

export const initialInvestments: Investment[] = [
  {
    id: 'inv-asset-1',
    name: 'Federal Govt 364-Day Treasury Bills',
    type: 'Treasury bills',
    institution: 'Central Bank of Nigeria / GTBank',
    investedAmount: 2000000,
    currentValue: 2280000,
    gainLoss: 280000,
    gainLossPercent: 14.0,
    lastUpdated: 'Today'
  },
  {
    id: 'inv-asset-2',
    name: 'Stanbic IBTC Money Market Fund',
    type: 'Mutual funds',
    institution: 'Stanbic IBTC Asset Mgt',
    investedAmount: 1500000,
    currentValue: 1695000,
    gainLoss: 195000,
    gainLossPercent: 13.0,
    lastUpdated: 'Yesterday'
  },
  {
    id: 'inv-asset-3',
    name: 'MTN Nigeria (MTNN) Shares',
    type: 'Stocks',
    institution: 'Nigerian Exchange (NGX)',
    investedAmount: 800000,
    currentValue: 944000,
    gainLoss: 144000,
    gainLossPercent: 18.0,
    lastUpdated: 'Today'
  },
  {
    id: 'inv-asset-4',
    name: 'GTCO Holdings Plc Shares',
    type: 'Stocks',
    institution: 'Nigerian Exchange (NGX)',
    investedAmount: 600000,
    currentValue: 710000,
    gainLoss: 110000,
    gainLossPercent: 18.3,
    lastUpdated: 'Today'
  },
  {
    id: 'inv-asset-5',
    name: 'Bitcoin (Cold Storage Tracking)',
    type: 'Crypto',
    institution: 'Hardware Wallet',
    investedAmount: 1200000,
    currentValue: 1580000,
    gainLoss: 380000,
    gainLossPercent: 31.6,
    lastUpdated: 'Today'
  }
];

export const initialInsights: Insight[] = [
  {
    id: 'ins-1',
    title: 'Transport spending is up 22%',
    category: 'spending',
    whatHappened: 'Transport expenses increased from ₦36,800 to ₦45,000 this month.',
    evidence: '6 Bolt rides logged in the last 10 days averaging ₦7,500 each.',
    explanation: 'Peak rainy season surged ride hailing tariffs on Lagos Island routes.',
    recommendation: 'Bundle daily errands or utilize scheduled carpooling to keep transport under ₦50,000.',
    impact: 'warning',
    date: 'Today'
  },
  {
    id: 'ins-2',
    title: 'Rent payment due in 4 days',
    category: 'spending',
    whatHappened: 'Annual housing lease renewal of ₦2,400,000 is due on October 3rd.',
    evidence: 'Checking account holds ₦1,250,000 and savings holds ₦620,000.',
    explanation: 'Your total liquid balance covers ₦2,080,000 of the required sum, leaving a ₦320,000 shortfall.',
    recommendation: 'Collect the ₦300,000 pending receivable from Chinedu Eze before Oct 3.',
    impact: 'urgent',
    date: 'Today'
  },
  {
    id: 'ins-3',
    title: 'Business profit margin expanded to 48.3%',
    category: 'business',
    whatHappened: 'Business operating profit rose 22% compared to the previous month.',
    evidence: 'High-margin accessory sales (chargers and cases) offset shipping costs.',
    explanation: 'Sourcing directly from TechWorld bulk packs reduced unit purchase costs by 12%.',
    recommendation: 'Reinvest ₦250,000 into restocking high-turnover fast chargers before peak December rush.',
    impact: 'positive',
    date: 'Yesterday'
  },
  {
    id: 'ins-4',
    title: 'Savings rate is on target at 35.3%',
    category: 'savings',
    whatHappened: 'You saved ₦300,000 out of ₦850,000 earned this month.',
    evidence: 'Consistent transfer of ₦150,000 twice a month into Access Bank savings reserve.',
    explanation: 'You are outperforming the recommended 20% personal emergency savings standard.',
    recommendation: 'Maintain automatic savings transfers on salary deposit dates.',
    impact: 'positive',
    date: '2 days ago'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'transaction',
    title: 'Transaction completed',
    description: 'Your ₦500,000 transfer to TechWorld has been completed.',
    time: '10:24 AM',
    isRead: false,
    category: 'Transactions'
  },
  {
    id: 'notif-2',
    type: 'unusual_spending',
    title: 'Spending update',
    description: 'Your transport spending increased by 18% this month.',
    time: 'Yesterday',
    isRead: false,
    category: 'Transactions'
  },
  {
    id: 'notif-3',
    type: 'savings_milestone',
    title: 'Goal update',
    description: 'You\'ve saved ₦200,000 towards your Laptop goal. 60% complete.',
    time: 'Yesterday',
    isRead: false,
    category: 'Goals'
  },
  {
    id: 'notif-4',
    type: 'monthly_report',
    title: 'Insight',
    description: 'Your food & dining spending is 22% higher than last month.',
    time: 'Jun 27',
    isRead: true,
    category: 'Insights'
  },
  {
    id: 'notif-5',
    type: 'upcoming_payment',
    title: 'Payment due soon',
    description: 'Your rent of ₦2,400,000 is due in 4 days.',
    time: 'Jun 26',
    isRead: true,
    category: 'Transactions'
  },
  {
    id: 'notif-6',
    type: 'business_expense',
    title: 'Business update',
    description: 'Your business revenue increased by 18% compared to last month.',
    time: 'Jun 24',
    isRead: true,
    category: 'System'
  },
  {
    id: 'notif-7',
    type: 'budget_exceeded',
    title: 'Reminder',
    description: 'You have 2 pending transactions to review in your business workspace.',
    time: 'Jun 23',
    isRead: true,
    category: 'Transactions'
  },
  {
    id: 'notif-8',
    type: 'savings_milestone',
    title: 'Goal milestone',
    description: 'You\'re 50% towards your Emergency Fund goal. Keep going!',
    time: 'Jun 22',
    isRead: true,
    category: 'Goals'
  },
  {
    id: 'notif-9',
    type: 'low_balance',
    title: 'Account connection',
    description: 'Your GTBank account was successfully connected and verified.',
    time: 'Jun 20',
    isRead: true,
    category: 'System'
  }
];

export const financialProvidersList: FinancialProvider[] = [
  {
    id: 'gtbank',
    name: 'GTBank',
    category: 'Banks',
    tagline: 'Reliable banking for a better tomorrow.',
    logoBg: '#e03a00',
    logoTextColor: '#ffffff',
    logoLetter: 'GT'
  },
  {
    id: 'access',
    name: 'Access Bank',
    category: 'Banks',
    tagline: 'Your future, our priority.',
    logoBg: '#005baa',
    logoTextColor: '#ffffff',
    logoLetter: 'AC'
  },
  {
    id: 'firstbank',
    name: 'First Bank',
    category: 'Banks',
    tagline: 'Since 1894, truly the first.',
    logoBg: '#0b2341',
    logoTextColor: '#fbbf24',
    logoLetter: 'FB'
  },
  {
    id: 'uba',
    name: 'UBA',
    category: 'Banks',
    tagline: "Africa's global bank.",
    logoBg: '#dc2626',
    logoTextColor: '#ffffff',
    logoLetter: 'UBA'
  },
  {
    id: 'zenith',
    name: 'Zenith Bank',
    category: 'Banks',
    tagline: 'In your best interest.',
    logoBg: '#991b1b',
    logoTextColor: '#ffffff',
    logoLetter: 'Z'
  },
  {
    id: 'fcmb',
    name: 'FCMB',
    category: 'Banks',
    tagline: 'My bank and I.',
    logoBg: '#581c87',
    logoTextColor: '#ffffff',
    logoLetter: 'F'
  },
  {
    id: 'wema',
    name: 'Wema Bank',
    category: 'Banks',
    tagline: "People's bank & ALAT.",
    logoBg: '#701a75',
    logoTextColor: '#ffffff',
    logoLetter: 'W'
  },
  {
    id: 'fidelity',
    name: 'Fidelity Bank',
    category: 'Banks',
    tagline: 'We keep our word.',
    logoBg: '#1e3a8a',
    logoTextColor: '#22c55e',
    logoLetter: 'FD'
  },
  {
    id: 'stanbic',
    name: 'Stanbic IBTC',
    category: 'Banks',
    tagline: 'A partner for growth.',
    logoBg: '#0284c7',
    logoTextColor: '#ffffff',
    logoLetter: 'SB'
  },
  {
    id: 'ecobank',
    name: 'Ecobank',
    category: 'Banks',
    tagline: 'The Pan African Bank.',
    logoBg: '#0369a1',
    logoTextColor: '#ffffff',
    logoLetter: 'ECO'
  },
  {
    id: 'polaris',
    name: 'Polaris Bank',
    category: 'Banks',
    tagline: 'New possibilities.',
    logoBg: '#4c1d95',
    logoTextColor: '#f59e0b',
    logoLetter: 'PL'
  },
  {
    id: 'union',
    name: 'Union Bank',
    category: 'Banks',
    tagline: 'Building a better tomorrow.',
    logoBg: '#0284c7',
    logoTextColor: '#ffffff',
    logoLetter: 'UB'
  },
  {
    id: 'verve',
    name: 'Verve',
    category: 'Cards',
    tagline: 'Secure. Simple. Global.',
    logoBg: '#dc2626',
    logoTextColor: '#ffffff',
    logoLetter: 'V'
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    category: 'Cards',
    tagline: 'Accepted worldwide.',
    logoBg: '#ea580c',
    logoTextColor: '#ffffff',
    logoLetter: 'MC'
  },
  {
    id: 'visa',
    name: 'Visa',
    category: 'Cards',
    tagline: 'Everywhere you want to be.',
    logoBg: '#1e40af',
    logoTextColor: '#fbbf24',
    logoLetter: 'VISA'
  },
  {
    id: 'opay',
    name: 'Opay',
    category: 'Wallets',
    tagline: 'Fast. Secure. Reliable.',
    logoBg: '#059669',
    logoTextColor: '#ffffff',
    logoLetter: 'OP'
  },
  {
    id: 'palmpay',
    name: 'Palmpay',
    category: 'Wallets',
    tagline: 'Payments made easy.',
    logoBg: '#7c3aed',
    logoTextColor: '#ffffff',
    logoLetter: 'PP'
  },
  {
    id: 'kuda',
    name: 'Kuda',
    category: 'Wallets',
    tagline: 'Banking for everyone.',
    logoBg: '#40196d',
    logoTextColor: '#ffffff',
    logoLetter: 'K'
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    category: 'Wallets',
    tagline: 'Online payments, simplified.',
    logoBg: '#f97316',
    logoTextColor: '#ffffff',
    logoLetter: 'FW'
  }
];
