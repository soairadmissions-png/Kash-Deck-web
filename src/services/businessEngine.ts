// CashDeck Business Engine
// Deterministic Rule Engine, Transaction Matching, Reconciliation & Accounting Calculations

import {
  Account,
  Transaction,
  Customer,
  Supplier,
  BusinessSale,
  BusinessPurchase,
  BusinessExpenseRecord,
  BusinessPayment,
  InventoryMovement,
  Product,
  TransactionMatchCandidate,
  TransactionClassification,
  AuditTrailEntry,
  POSSettlement
} from '../types';

export interface BusinessState {
  businessId: string;
  accounts: Account[];
  transactions: Transaction[];
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  movements: InventoryMovement[];
  sales: BusinessSale[];
  purchases: BusinessPurchase[];
  expenses: BusinessExpenseRecord[];
  payments: BusinessPayment[];
  auditTrail: AuditTrailEntry[];
  posSettlements: POSSettlement[];
  cashOnHand: number;
}

// 1. INVENTORY DERIVATION (Source of truth is inventory movements)
export function deriveProductStock(
  productId: string,
  movements: InventoryMovement[]
): number {
  return movements
    .filter(m => m.product_id === productId)
    .reduce((total, m) => {
      switch (m.movement_type) {
        case 'opening_stock':
        case 'purchase':
        case 'return':
          return total + m.quantity;
        case 'sale':
        case 'damage':
          return total - Math.abs(m.quantity);
        case 'adjustment':
        case 'transfer':
          return total + m.quantity; // adjustment can be positive or negative
        default:
          return total + m.quantity;
      }
    }, 0);
}

// 2. RECEIVABLES DERIVATION
export function deriveCustomerBalance(
  customerId: string,
  sales: BusinessSale[],
  payments: BusinessPayment[]
): {
  totalPurchased: number;
  totalPaid: number;
  amountOwed: number;
  outstandingSales: BusinessSale[];
} {
  const customerSales = sales.filter(
    s => s.customer_id === customerId && s.status !== 'cancelled'
  );
  const totalPurchased = customerSales.reduce((sum, s) => sum + s.total, 0);

  // Customer payments specifically
  const customerPayments = payments.filter(
    p => p.customer_id === customerId && p.payment_type === 'customer_payment'
  );
  const totalPaid = customerPayments.reduce((sum, p) => sum + p.amount, 0);

  const outstandingSales = customerSales.filter(s => s.outstanding_amount > 0);
  const amountOwed = outstandingSales.reduce((sum, s) => sum + s.outstanding_amount, 0);

  return {
    totalPurchased,
    totalPaid,
    amountOwed: Math.max(0, amountOwed),
    outstandingSales
  };
}

// 3. PAYABLES DERIVATION
export function deriveSupplierBalance(
  supplierId: string,
  purchases: BusinessPurchase[],
  payments: BusinessPayment[]
): {
  totalPurchases: number;
  totalPaid: number;
  amountOwed: number;
  outstandingPurchases: BusinessPurchase[];
} {
  const supPurchases = purchases.filter(
    p => p.supplier_id === supplierId && p.status !== 'cancelled'
  );
  const totalPurchases = supPurchases.reduce((sum, p) => sum + p.total, 0);

  const supPayments = payments.filter(
    p => p.supplier_id === supplierId && p.payment_type === 'supplier_payment'
  );
  const totalPaid = supPayments.reduce((sum, p) => sum + p.amount, 0);

  const outstandingPurchases = supPurchases.filter(p => p.outstanding_amount > 0);
  const amountOwed = outstandingPurchases.reduce((sum, p) => sum + p.outstanding_amount, 0);

  return {
    totalPurchases,
    totalPaid,
    amountOwed: Math.max(0, amountOwed),
    outstandingPurchases
  };
}

// 4. TRANSACTION CLASSIFICATION & MATCHING ENGINE (Rules before AI)
export function classifyTransaction(
  tx: Transaction,
  state: BusinessState
): TransactionMatchCandidate {
  const amount = Math.abs(tx.amount);
  const isInflow = tx.amount > 0;
  const desc = (tx.description + ' ' + (tx.rawDescription || '') + ' ' + (tx.merchantOrParty || '')).toUpperCase();
  const counterparty = (tx.merchantOrParty || tx.sender || tx.recipient || '').trim();

  // RULE 1: INTERNAL TRANSFER (Deterministic High Confidence)
  // Check if both accounts belong to the user/business or description indicates internal transfer
  const connectedAccountNames = state.accounts.map(a => a.name.toUpperCase());
  const connectedBankNames = state.accounts.map(a => a.bankName.toUpperCase());

  const mentionsOwnBank = connectedBankNames.some(
    b => desc.includes(`TRF TO ${b}`) || desc.includes(`TRF FROM ${b}`) || desc.includes(`TRANSFER TO ${b}`) || desc.includes(`TRANSFER FROM ${b}`)
  );

  const isMarkedInternal = tx.type === 'transfer' && tx.transferToAccountId;

  if (isMarkedInternal || (mentionsOwnBank && desc.includes('SELF'))) {
    return {
      classification: 'internal_transfer',
      confidence: 1.0,
      confidenceLevel: 'high',
      isInternalTransfer: true,
      reason: 'Transfer between connected accounts owned by the same business.'
    };
  }

  // RULE 2: POS SETTLEMENT MATCHING (e.g. Moniepoint, OPay POS, POS Settlement)
  if (isInflow && (desc.includes('POS SETTLEMENT') || desc.includes('MONIEPOINT') || desc.includes('PAYSTACK') || desc.includes('FLUTTERWAVE') || desc.includes('OPAY POS'))) {
    // Check if there are today/recent POS sales totaling close to this amount
    const posSales = state.sales.filter(
      s => s.payment_method === 'POS' && s.status !== 'cancelled'
    );
    const grossTotal = posSales.reduce((sum, s) => sum + s.total, 0);
    const difference = grossTotal - amount;

    if (posSales.length > 0 && difference >= 0 && difference <= grossTotal * 0.05) {
      // difference is processing fee (e.g. ₦450k sales - ₦9k fee = ₦441k deposit)
      return {
        classification: 'sale',
        confidence: 0.95,
        confidenceLevel: 'medium',
        posMatchingSales: posSales.map(s => s.id),
        posProcessingFee: difference,
        reason: `POS settlement matches ${posSales.length} recorded sales (₦${grossTotal.toLocaleString()}) with ₦${difference.toLocaleString()} processing fee.`
      };
    }
  }

  // RULE 3: CUSTOMER PAYMENT (Inflow matching known customer & outstanding sale)
  if (isInflow) {
    // 3a. Search customer by exact or partial name match
    const matchingCustomer = state.customers.find(c => {
      const cName = c.name.toUpperCase();
      return desc.includes(cName) || (counterparty && cName.includes(counterparty.toUpperCase()));
    });

    if (matchingCustomer) {
      const { outstandingSales } = deriveCustomerBalance(
        matchingCustomer.id,
        state.sales,
        state.payments
      );

      // Check if amount matches an exact outstanding sale
      const exactSale = outstandingSales.find(s => Math.abs(s.outstanding_amount - amount) < 1);
      if (exactSale) {
        return {
          classification: 'customer_payment',
          confidence: 0.96,
          confidenceLevel: 'medium',
          customerId: matchingCustomer.id,
          customerName: matchingCustomer.name,
          candidateSaleId: exactSale.id,
          candidateSaleNumber: exactSale.sale_number,
          outstandingAmount: exactSale.outstanding_amount,
          reason: `Customer ${matchingCustomer.name} has Sale #${exactSale.sale_number} with exact ₦${exactSale.outstanding_amount.toLocaleString()} outstanding.`
        };
      }

      // Check if customer has multiple outstanding sales
      if (outstandingSales.length > 1) {
        const totalOutstanding = outstandingSales.reduce((s, x) => s + x.outstanding_amount, 0);
        return {
          classification: 'customer_payment',
          confidence: 0.91,
          confidenceLevel: 'medium',
          customerId: matchingCustomer.id,
          customerName: matchingCustomer.name,
          candidateSaleId: outstandingSales[0].id,
          candidateSaleNumber: outstandingSales[0].sale_number,
          outstandingAmount: totalOutstanding,
          reason: `Customer ${matchingCustomer.name} owes ₦${totalOutstanding.toLocaleString()} across ${outstandingSales.length} outstanding sales.`
        };
      }

      // Check if single outstanding sale and amount is a valid partial payment
      if (outstandingSales.length === 1 && amount < outstandingSales[0].outstanding_amount) {
        return {
          classification: 'customer_payment',
          confidence: 0.90,
          confidenceLevel: 'medium',
          customerId: matchingCustomer.id,
          customerName: matchingCustomer.name,
          candidateSaleId: outstandingSales[0].id,
          candidateSaleNumber: outstandingSales[0].sale_number,
          outstandingAmount: outstandingSales[0].outstanding_amount,
          reason: `Partial payment candidate for Sale #${outstandingSales[0].sale_number} (Outstanding: ₦${outstandingSales[0].outstanding_amount.toLocaleString()}).`
        };
      }

      // Customer found but no outstanding sales -> Direct sale / other income
      return {
        classification: 'customer_payment',
        confidence: 0.85,
        confidenceLevel: 'medium',
        customerId: matchingCustomer.id,
        customerName: matchingCustomer.name,
        reason: `Payment from known customer ${matchingCustomer.name}. No previous outstanding invoice found.`
      };
    }

    // 3b. Check if amount matches any outstanding sale in the system even if customer name in narrative is slightly different
    const anyMatchingSale = state.sales.find(
      s => s.outstanding_amount === amount && s.status !== 'cancelled'
    );
    if (anyMatchingSale) {
      return {
        classification: 'customer_payment',
        confidence: 0.75,
        confidenceLevel: 'medium',
        customerId: anyMatchingSale.customer_id,
        customerName: anyMatchingSale.customer_name,
        candidateSaleId: anyMatchingSale.id,
        candidateSaleNumber: anyMatchingSale.sale_number,
        outstandingAmount: anyMatchingSale.outstanding_amount,
        reason: `Amount ₦${amount.toLocaleString()} matches outstanding Sale #${anyMatchingSale.sale_number} for ${anyMatchingSale.customer_name}.`
      };
    }

    // 3c. Owner contribution detection
    if (desc.includes('CAPITAL') || desc.includes('OWNER') || desc.includes('DIRECTOR') || desc.includes('INJECTION')) {
      return {
        classification: 'owner_contribution',
        confidence: 0.88,
        confidenceLevel: 'medium',
        reason: 'Appears to be owner capital injection (not counted as taxable business revenue).'
      };
    }

    // Low confidence inflow: Unknown party
    return {
      classification: 'needs_review',
      confidence: 0.35,
      confidenceLevel: 'low',
      reason: "Unidentified money received. We need to know what this was for."
    };
  }

  // RULE 4: SUPPLIER PAYMENT (Outflow matching known supplier & outstanding purchase)
  if (!isInflow) {
    const matchingSupplier = state.suppliers.find(s => {
      const sName = s.name.toUpperCase();
      return desc.includes(sName) || (counterparty && sName.includes(counterparty.toUpperCase()));
    });

    if (matchingSupplier) {
      const { outstandingPurchases } = deriveSupplierBalance(
        matchingSupplier.id,
        state.purchases,
        state.payments
      );

      const exactPurchase = outstandingPurchases.find(
        p => Math.abs(p.outstanding_amount - amount) < 1
      );

      if (exactPurchase) {
        return {
          classification: 'supplier_payment',
          confidence: 0.96,
          confidenceLevel: 'medium',
          supplierId: matchingSupplier.id,
          supplierName: matchingSupplier.name,
          candidatePurchaseId: exactPurchase.id,
          candidatePurchaseNumber: exactPurchase.purchase_number,
          outstandingAmount: exactPurchase.outstanding_amount,
          reason: `Payment to supplier ${matchingSupplier.name} for Purchase #${exactPurchase.purchase_number} (₦${exactPurchase.outstanding_amount.toLocaleString()}).`
        };
      }

      if (outstandingPurchases.length > 0) {
        return {
          classification: 'supplier_payment',
          confidence: 0.90,
          confidenceLevel: 'medium',
          supplierId: matchingSupplier.id,
          supplierName: matchingSupplier.name,
          candidatePurchaseId: outstandingPurchases[0].id,
          candidatePurchaseNumber: outstandingPurchases[0].purchase_number,
          outstandingAmount: outstandingPurchases[0].outstanding_amount,
          reason: `Payment to known supplier ${matchingSupplier.name} with outstanding balance.`
        };
      }

      return {
        classification: 'supplier_payment',
        confidence: 0.85,
        confidenceLevel: 'medium',
        supplierId: matchingSupplier.id,
        supplierName: matchingSupplier.name,
        reason: `Payment to known supplier ${matchingSupplier.name}.`
      };
    }

    // 4b. Owner withdrawal
    if (desc.includes('DRAWING') || desc.includes('DIVIDEND') || desc.includes('OWNER WITHDRAWAL')) {
      return {
        classification: 'owner_withdrawal',
        confidence: 0.88,
        confidenceLevel: 'medium',
        reason: 'Owner drawing / personal withdrawal (not counted as business operating expense).'
      };
    }

    // 4c. Known recurring expense categories
    if (desc.includes('EKEDC') || desc.includes('IKEDC') || desc.includes('ELECTRICITY') || desc.includes('POWER')) {
      return {
        classification: 'business_expense',
        confidence: 0.92,
        confidenceLevel: 'medium',
        suggestedCategory: 'Utilities',
        reason: 'Consistent utility provider pattern (Electricity).'
      };
    }
    if (desc.includes('AIRTIME') || desc.includes('MTN') || desc.includes('AIRTEL') || desc.includes('INTERNET') || desc.includes('DATA')) {
      return {
        classification: 'business_expense',
        confidence: 0.90,
        confidenceLevel: 'medium',
        suggestedCategory: 'Telecommunications',
        reason: 'Recurring telecommunications & internet expense.'
      };
    }
    if (desc.includes('RENT') || desc.includes('LEASE') || desc.includes('FACILITY')) {
      return {
        classification: 'business_expense',
        confidence: 0.90,
        confidenceLevel: 'medium',
        suggestedCategory: 'Rent & Facilities',
        reason: 'Facility lease / rent expense.'
      };
    }
    if (desc.includes('LOGISTICS') || desc.includes('COURIER') || desc.includes('GIG') || desc.includes('KOPAR')) {
      return {
        classification: 'business_expense',
        confidence: 0.88,
        confidenceLevel: 'medium',
        suggestedCategory: 'Shipping & Delivery',
        reason: 'Logistics delivery service.'
      };
    }

    // ATM cash withdrawal
    if (desc.includes('ATM') && desc.includes('CASH')) {
      return {
        classification: 'cash_withdrawal',
        confidence: 0.85,
        confidenceLevel: 'medium',
        reason: 'Cash withdrawal. Moves funds to physical cash-on-hand.'
      };
    }

    // Low confidence outflow
    return {
      classification: 'needs_review',
      confidence: 0.40,
      confidenceLevel: 'low',
      reason: 'Unidentified expenditure. Please confirm whether this was an expense, supplier payment, or personal.'
    };
  }

  return {
    classification: 'needs_review',
    confidence: 0.30,
    confidenceLevel: 'low',
    reason: 'Requires classification review.'
  };
}

// 5. TRACEABLE FINANCIAL REPORTING (100% computed from underlying records)
export interface BusinessMetricsSummary {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  expenses: number; // alias for operatingExpenses
  netProfit: number;
  profit: number; // alias for netProfit
  profitMargin: number;
  cashInflow: number;
  cashOutflow: number;
  netCashFlow: number;
  cashFlow: number; // alias for netCashFlow
  bankBalances: number;
  cashOnHand: number;
  totalBusinessCash: number;
  totalReceivables: number;
  overdueReceivables: number;
  totalPayables: number;
  overduePayables: number;
  totalInventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  needsReviewCount: number;
  // Traceability lists
  salesCount: number;
  expensesCount: number;
}

export function calculateBusinessMetrics(state: BusinessState): BusinessMetricsSummary {
  // 1. REVENUE: Sum of all non-cancelled sales
  const validSales = state.sales.filter(s => s.status !== 'cancelled' && s.status !== 'refunded');
  const revenue = validSales.reduce((sum, s) => sum + s.total, 0);

  // 2. COGS: Sum of cost_price * quantity for all sold items
  let costOfGoodsSold = 0;
  validSales.forEach(sale => {
    sale.items.forEach(item => {
      costOfGoodsSold += item.cost_price * item.quantity;
    });
  });

  const grossProfit = revenue - costOfGoodsSold;

  // 3. OPERATING EXPENSES: Sum of business expenses (excluding owner withdrawals & internal transfers)
  const operatingExpenses = state.expenses.reduce((sum, e) => sum + e.amount, 0);

  const netProfit = grossProfit - operatingExpenses;
  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  // 4. CASH FLOW (Cash received minus Cash paid)
  // Inflow: customer payments + direct cash sales + other income (excluding internal transfers)
  const cashPaymentsIn = state.payments.filter(
    p => p.payment_type === 'customer_payment' || p.payment_type === 'other_income'
  );
  const cashInflow = cashPaymentsIn.reduce((sum, p) => sum + p.amount, 0);

  // Outflow: supplier payments + expense payments + refunds (excluding owner withdrawals & internal transfers)
  const cashPaymentsOut = state.payments.filter(
    p => p.payment_type === 'supplier_payment' || p.payment_type === 'expense_payment'
  );
  const cashOutflow = cashPaymentsOut.reduce((sum, p) => sum + p.amount, 0);

  const netCashFlow = cashInflow - cashOutflow;

  // 5. CASH POSITION: Connected business bank balances + Cash-on-hand
  const businessBankAccounts = state.accounts.filter(a => a.isBusiness && a.type !== 'card');
  const bankBalances = businessBankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalBusinessCash = bankBalances + state.cashOnHand;

  // 6. RECEIVABLES & PAYABLES
  let totalReceivables = 0;
  let overdueReceivables = 0;
  state.customers.forEach(c => {
    const bal = deriveCustomerBalance(c.id, state.sales, state.payments);
    totalReceivables += bal.amountOwed;
    if (bal.amountOwed > 0) {
      overdueReceivables += bal.amountOwed;
    }
  });

  let totalPayables = 0;
  let overduePayables = 0;
  state.suppliers.forEach(s => {
    const bal = deriveSupplierBalance(s.id, state.purchases, state.payments);
    totalPayables += bal.amountOwed;
    if (bal.amountOwed > 0) {
      overduePayables += bal.amountOwed;
    }
  });

  // 7. INVENTORY VALUATION (derived from current stock * cost price)
  let totalInventoryValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  state.products.forEach(p => {
    const stock = deriveProductStock(p.id, state.movements);
    totalInventoryValue += Math.max(0, stock) * p.cost_price;
    if (stock <= 0) {
      outOfStockCount++;
    } else if (stock <= p.reorder_level) {
      lowStockCount++;
    }
  });

  // 8. UNRESOLVED REVIEW ITEMS
  const needsReviewCount = state.transactions.filter(
    t => t.isBusiness && (!t.reconciliationStatus || t.reconciliationStatus === 'unreconciled')
  ).length;

  return {
    revenue,
    costOfGoodsSold,
    grossProfit,
    operatingExpenses,
    expenses: operatingExpenses,
    netProfit,
    profit: netProfit,
    profitMargin: Math.round(profitMargin * 10) / 10,
    cashInflow,
    cashOutflow,
    netCashFlow,
    cashFlow: netCashFlow,
    bankBalances,
    cashOnHand: state.cashOnHand,
    totalBusinessCash,
    totalReceivables,
    overdueReceivables,
    totalPayables,
    overduePayables,
    totalInventoryValue,
    lowStockCount,
    outOfStockCount,
    needsReviewCount,
    salesCount: validSales.length,
    expensesCount: state.expenses.length
  };
}
