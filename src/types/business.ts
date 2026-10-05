// CashDeck Business Domain Types & Relational Data Model

export type BusinessType = 'Retail' | 'Food' | 'Services' | 'Wholesale' | 'Manufacturing' | 'Other';

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  business_type: BusinessType;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  user_name?: string;
  role: 'owner' | 'manager' | 'cashier' | 'accountant';
  created_at: string;
}

export type InventoryMovementType =
  | 'purchase'
  | 'sale'
  | 'return'
  | 'damage'
  | 'adjustment'
  | 'transfer'
  | 'opening_stock';

export interface InventoryMovement {
  id: string;
  business_id: string;
  product_id: string;
  movement_type: InventoryMovementType;
  quantity: number; // positive for addition (purchase, return, opening), negative for reduction (sale, damage)
  unit_cost: number;
  source_type: 'sale' | 'purchase' | 'manual_adjustment' | 'return' | 'damage';
  source_id?: string;
  notes?: string;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  sku: string;
  category_id: string;
  selling_price: number;
  cost_price: number;
  stock_quantity: number; // derived from movements
  reorder_level: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type SaleStatus = 'paid' | 'partially_paid' | 'unpaid' | 'cancelled' | 'refunded';

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  line_total: number;
}

export interface BusinessSale {
  id: string;
  business_id: string;
  customer_id?: string;
  customer_name?: string;
  sale_number: string;
  subtotal: number;
  discount: number;
  total: number;
  paid_amount: number;
  outstanding_amount: number;
  status: SaleStatus;
  payment_method: 'Bank' | 'Cash' | 'POS' | 'Card' | 'Transfer' | 'Credit sale';
  sale_date: string;
  notes?: string;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
}

export type PurchaseStatus = 'paid' | 'partially_paid' | 'unpaid' | 'cancelled';

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  line_total: number;
}

export interface BusinessPurchase {
  id: string;
  business_id: string;
  supplier_id?: string;
  supplier_name?: string;
  purchase_number: string;
  subtotal: number;
  total: number;
  paid_amount: number;
  outstanding_amount: number;
  status: PurchaseStatus;
  purchase_date: string;
  notes?: string;
  items: PurchaseItem[];
  created_at: string;
  updated_at: string;
}

export interface BusinessExpenseRecord {
  id: string;
  business_id: string;
  category_id: string;
  amount: number;
  description: string;
  payment_method: 'bank' | 'cash' | 'pos' | 'transfer';
  transaction_id?: string;
  expense_date: string;
  recurring_expense_id?: string;
  created_at: string;
}

export type PaymentType =
  | 'customer_payment'
  | 'supplier_payment'
  | 'expense_payment'
  | 'other_income'
  | 'owner_contribution'
  | 'owner_withdrawal'
  | 'refund';

export interface BusinessPayment {
  id: string;
  business_id: string;
  amount: number;
  payment_type: PaymentType;
  method: 'bank' | 'cash' | 'pos' | 'card' | 'transfer';
  customer_id?: string;
  supplier_id?: string;
  sale_id?: string;
  purchase_id?: string;
  transaction_id?: string;
  payment_date: string;
  reference?: string;
  notes?: string;
  created_at: string;
}

export type TransactionClassification =
  | 'customer_payment'
  | 'supplier_payment'
  | 'sale'
  | 'purchase'
  | 'business_expense'
  | 'owner_contribution'
  | 'owner_withdrawal'
  | 'internal_transfer'
  | 'other_income'
  | 'refund'
  | 'cash_withdrawal'
  | 'needs_review'
  | 'personal';

export interface TransactionMatchCandidate {
  classification: TransactionClassification;
  confidence: number; // 0.0 to 1.0 (internal only)
  confidenceLevel: 'high' | 'medium' | 'low';
  customerId?: string;
  customerName?: string;
  candidateSaleId?: string;
  candidateSaleNumber?: string;
  supplierId?: string;
  supplierName?: string;
  candidatePurchaseId?: string;
  candidatePurchaseNumber?: string;
  suggestedCategory?: string;
  outstandingAmount?: number;
  reason: string;
  isInternalTransfer?: boolean;
  transferSourceAccount?: string;
  transferDestAccount?: string;
  posMatchingSales?: string[];
  posProcessingFee?: number;
}

export interface AuditTrailEntry {
  id: string;
  business_id: string;
  entity_type: 'sale' | 'purchase' | 'inventory' | 'payment' | 'expense' | 'reconciliation' | 'customer';
  entity_id: string;
  action: 'create' | 'update' | 'reconcile' | 'cancel' | 'status_change';
  changed_by: string;
  previous_value?: string;
  new_value: string;
  timestamp: string;
  created_at?: string;
  reason?: string;
  linked_transaction_id?: string;
  linked_event_id?: string;
}

export interface POSSettlement {
  id: string;
  business_id: string;
  settlement_date: string;
  gross_sales_amount: number;
  processing_fee: number;
  net_deposit_amount: number;
  transaction_id?: string;
  matched_sale_ids: string[];
  status: 'matched' | 'pending';
}
