// Initial Relational Business Data for CashDeck
import {
  Business,
  BusinessMember,
  Product,
  InventoryMovement,
  BusinessSale,
  BusinessPurchase,
  BusinessExpenseRecord,
  BusinessPayment,
  AuditTrailEntry,
  POSSettlement
} from '../types';

export const initialBusiness: Business = {
  id: 'biz-01',
  owner_id: 'usr-ada',
  name: 'Ada Luxe Tech & Apparel',
  business_type: 'Retail',
  currency: '₦',
  created_at: '2026-01-15T08:00:00Z',
  updated_at: '2026-10-02T10:00:00Z'
};

export const initialMembers: BusinessMember[] = [
  {
    id: 'bm-1',
    business_id: 'biz-01',
    user_id: 'usr-ada',
    role: 'owner',
    created_at: '2026-01-15T08:00:00Z'
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    business_id: 'biz-01',
    name: 'AirPods Pro (2nd Gen)',
    sku: 'APP-GEN2-001',
    category_id: 'Audio',
    cost_price: 140000,
    selling_price: 200000,
    stock_quantity: 32, // derived from movements
    reorder_level: 5,
    active: true,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-10-01T09:00:00Z'
  },
  {
    id: 'prod-2',
    business_id: 'biz-01',
    name: 'iPhone 15 (128GB Black)',
    sku: 'IPH-15-128-BLK',
    category_id: 'Smartphones',
    cost_price: 850000,
    selling_price: 1100000,
    stock_quantity: 18,
    reorder_level: 4,
    active: true,
    created_at: '2026-02-10T11:00:00Z',
    updated_at: '2026-10-01T09:00:00Z'
  },
  {
    id: 'prod-3',
    business_id: 'biz-01',
    name: '20W USB-C Fast Charger',
    sku: 'CHG-20W-WHT',
    category_id: 'Accessories',
    cost_price: 8500,
    selling_price: 15000,
    stock_quantity: 48,
    reorder_level: 10,
    active: true,
    created_at: '2026-02-15T12:00:00Z',
    updated_at: '2026-10-01T09:00:00Z'
  },
  {
    id: 'prod-4',
    business_id: 'biz-01',
    name: 'MagSafe Silicone Cases',
    sku: 'CAS-MS-CLR',
    category_id: 'Accessories',
    cost_price: 4000,
    selling_price: 12000,
    stock_quantity: 4,
    reorder_level: 10,
    active: true,
    created_at: '2026-03-01T09:00:00Z',
    updated_at: '2026-10-01T09:00:00Z'
  },
  {
    id: 'prod-5',
    business_id: 'biz-01',
    name: 'Samsung Galaxy S24 Ultra',
    sku: 'SAM-S24U-256',
    category_id: 'Smartphones',
    cost_price: 1200000,
    selling_price: 1550000,
    stock_quantity: 0,
    reorder_level: 2,
    active: true,
    created_at: '2026-03-10T14:00:00Z',
    updated_at: '2026-10-01T09:00:00Z'
  },
  {
    id: 'prod-6',
    business_id: 'biz-01',
    name: 'Luxury Cotton Crew Neck Shirt',
    sku: 'APP-SHT-WHT-L',
    category_id: 'Apparel',
    cost_price: 8000,
    selling_price: 15000,
    stock_quantity: 40,
    reorder_level: 8,
    active: true,
    created_at: '2026-04-01T09:00:00Z',
    updated_at: '2026-10-01T09:00:00Z'
  }
];

export const initialInventoryMovements: InventoryMovement[] = [
  {
    id: 'mov-1',
    business_id: 'biz-01',
    product_id: 'prod-1',
    movement_type: 'opening_stock',
    quantity: 35,
    unit_cost: 140000,
    source_type: 'manual_adjustment',
    notes: 'Initial warehouse intake',
    created_at: '2026-01-20T10:00:00Z'
  },
  {
    id: 'mov-2',
    business_id: 'biz-01',
    product_id: 'prod-1',
    movement_type: 'sale',
    quantity: -3,
    unit_cost: 140000,
    source_type: 'sale',
    source_id: 'sale-1',
    notes: 'Sale to Chinedu Eze (3 units)',
    created_at: '2026-09-27T14:00:00Z'
  },
  {
    id: 'mov-3',
    business_id: 'biz-01',
    product_id: 'prod-2',
    movement_type: 'opening_stock',
    quantity: 19,
    unit_cost: 850000,
    source_type: 'manual_adjustment',
    notes: 'Initial stock intake',
    created_at: '2026-02-10T11:00:00Z'
  },
  {
    id: 'mov-4',
    business_id: 'biz-01',
    product_id: 'prod-2',
    movement_type: 'sale',
    quantity: -1,
    unit_cost: 850000,
    source_type: 'sale',
    source_id: 'sale-2',
    notes: 'Sale to Funke Adeleke',
    created_at: '2026-09-30T16:00:00Z'
  },
  {
    id: 'mov-5',
    business_id: 'biz-01',
    product_id: 'prod-3',
    movement_type: 'opening_stock',
    quantity: 49,
    unit_cost: 8500,
    source_type: 'manual_adjustment',
    created_at: '2026-02-15T12:00:00Z'
  },
  {
    id: 'mov-6',
    business_id: 'biz-01',
    product_id: 'prod-3',
    movement_type: 'sale',
    quantity: -1,
    unit_cost: 8500,
    source_type: 'sale',
    source_id: 'sale-2',
    created_at: '2026-09-30T16:00:00Z'
  },
  {
    id: 'mov-7',
    business_id: 'biz-01',
    product_id: 'prod-4',
    movement_type: 'opening_stock',
    quantity: 4,
    unit_cost: 4000,
    source_type: 'manual_adjustment',
    created_at: '2026-03-01T09:00:00Z'
  },
  {
    id: 'mov-8',
    business_id: 'biz-01',
    product_id: 'prod-6',
    movement_type: 'opening_stock',
    quantity: 40,
    unit_cost: 8000,
    source_type: 'manual_adjustment',
    notes: 'Opening stock for Luxury Cotton Crew Shirts',
    created_at: '2026-04-01T09:00:00Z'
  }
];

export const initialBusinessSales: BusinessSale[] = [
  // Sale matching prompt: Amaka Stores Sale #1042 (₦150,000 outstanding)
  {
    id: 'sale-1042',
    business_id: 'biz-01',
    customer_id: 'cust-amaka',
    customer_name: 'Amaka Stores',
    sale_number: '1042',
    subtotal: 150000,
    discount: 0,
    total: 150000,
    paid_amount: 0,
    outstanding_amount: 150000,
    status: 'unpaid',
    payment_method: 'Credit sale',
    sale_date: '2026-10-01',
    notes: 'Credit sale of 10 Luxury Cotton Shirts. Payment agreed within 7 days.',
    items: [
      {
        id: 'si-1042-1',
        sale_id: 'sale-1042',
        product_id: 'prod-6',
        product_name: 'Luxury Cotton Crew Neck Shirt',
        quantity: 10,
        unit_price: 15000,
        cost_price: 8000,
        line_total: 150000
      }
    ],
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z'
  },
  // Multiple sales for Chinedu Eze (Sale #100 = ₦100k, Sale #101 = ₦200k) matching Section 14
  {
    id: 'sale-100',
    business_id: 'biz-01',
    customer_id: 'cust-1',
    customer_name: 'Chinedu Eze',
    sale_number: '100',
    subtotal: 100000,
    discount: 0,
    total: 100000,
    paid_amount: 0,
    outstanding_amount: 100000,
    status: 'unpaid',
    payment_method: 'Credit sale',
    sale_date: '2026-09-22',
    notes: 'Wholesale batch order 1',
    items: [
      {
        id: 'si-100-1',
        sale_id: 'sale-100',
        product_id: 'prod-3',
        product_name: '20W USB-C Fast Charger',
        quantity: 10,
        unit_price: 10000,
        cost_price: 8500,
        line_total: 100000
      }
    ],
    created_at: '2026-09-22T09:00:00Z',
    updated_at: '2026-09-22T09:00:00Z'
  },
  {
    id: 'sale-101',
    business_id: 'biz-01',
    customer_id: 'cust-1',
    customer_name: 'Chinedu Eze',
    sale_number: '101',
    subtotal: 200000,
    discount: 0,
    total: 200000,
    paid_amount: 0,
    outstanding_amount: 200000,
    status: 'unpaid',
    payment_method: 'Credit sale',
    sale_date: '2026-09-25',
    notes: 'Wholesale batch order 2',
    items: [
      {
        id: 'si-101-1',
        sale_id: 'sale-101',
        product_id: 'prod-1',
        product_name: 'AirPods Pro (2nd Gen)',
        quantity: 1,
        unit_price: 200000,
        cost_price: 140000,
        line_total: 200000
      }
    ],
    created_at: '2026-09-25T11:00:00Z',
    updated_at: '2026-09-25T11:00:00Z'
  },
  // Paid sale to Funke Adeleke
  {
    id: 'sale-2',
    business_id: 'biz-01',
    customer_id: 'cust-2',
    customer_name: 'Funke Adeleke',
    sale_number: '1017',
    subtotal: 1115000,
    discount: 0,
    total: 1115000,
    paid_amount: 1095000,
    outstanding_amount: 20000,
    status: 'partially_paid',
    payment_method: 'POS',
    sale_date: '2026-09-30',
    notes: '₦20k balance due on delivery',
    items: [
      {
        id: 'si-2-1',
        sale_id: 'sale-2',
        product_id: 'prod-2',
        product_name: 'iPhone 15 (128GB Black)',
        quantity: 1,
        unit_price: 1100000,
        cost_price: 850000,
        line_total: 1100000
      },
      {
        id: 'si-2-2',
        sale_id: 'sale-2',
        product_id: 'prod-3',
        product_name: '20W USB-C Fast Charger',
        quantity: 1,
        unit_price: 15000,
        cost_price: 8500,
        line_total: 15000
      }
    ],
    created_at: '2026-09-30T16:00:00Z',
    updated_at: '2026-09-30T16:00:00Z'
  }
];

export const initialBusinessPurchases: BusinessPurchase[] = [
  // Scenario 3: Supplier ABC Wholesale, 100 shirts, ₦500,000, unpaid
  {
    id: 'purch-501',
    business_id: 'biz-01',
    supplier_id: 'sup-abc',
    supplier_name: 'ABC Wholesale',
    purchase_number: 'P-501',
    subtotal: 500000,
    total: 500000,
    paid_amount: 0,
    outstanding_amount: 500000,
    status: 'unpaid',
    purchase_date: '2026-10-01',
    notes: 'Order of 100 Luxury Cotton Crew Neck Shirts at ₦5,000 unit cost.',
    items: [
      {
        id: 'pi-501-1',
        purchase_id: 'purch-501',
        product_id: 'prod-6',
        product_name: 'Luxury Cotton Crew Neck Shirt',
        quantity: 100,
        unit_cost: 5000,
        line_total: 500000
      }
    ],
    created_at: '2026-10-01T08:00:00Z',
    updated_at: '2026-10-01T08:00:00Z'
  },
  {
    id: 'purch-490',
    business_id: 'biz-01',
    supplier_id: 'sup-1',
    supplier_name: 'TechWorld Global Distro',
    purchase_number: 'P-490',
    subtotal: 600000,
    total: 600000,
    paid_amount: 0,
    outstanding_amount: 600000,
    status: 'unpaid',
    purchase_date: '2026-09-26',
    notes: 'Restock of 4 AirPods Pro',
    items: [
      {
        id: 'pi-490-1',
        purchase_id: 'purch-490',
        product_id: 'prod-1',
        product_name: 'AirPods Pro (2nd Gen)',
        quantity: 4,
        unit_cost: 150000,
        line_total: 600000
      }
    ],
    created_at: '2026-09-26T10:00:00Z',
    updated_at: '2026-09-26T10:00:00Z'
  }
];

export const initialBusinessExpenses: BusinessExpenseRecord[] = [
  {
    id: 'bexp-1',
    business_id: 'biz-01',
    category_id: 'Rent & Facilities',
    amount: 150000,
    description: 'Monthly outlet service charge & power backup',
    payment_method: 'bank',
    expense_date: '2026-10-01',
    created_at: '2026-10-01T09:00:00Z'
  },
  {
    id: 'bexp-2',
    business_id: 'biz-01',
    category_id: 'Shipping & Delivery',
    amount: 35000,
    description: 'Customer dispatch deliveries via GIG Logistics',
    payment_method: 'bank',
    expense_date: '2026-10-02',
    created_at: '2026-10-02T11:00:00Z'
  }
];

export const initialBusinessPayments: BusinessPayment[] = [
  {
    id: 'pay-1',
    business_id: 'biz-01',
    amount: 1095000,
    payment_type: 'customer_payment',
    method: 'pos',
    customer_id: 'cust-2',
    sale_id: 'sale-2',
    payment_date: '2026-09-30',
    reference: 'POS-TX-99021',
    notes: 'Settled via Moniepoint POS Terminal',
    created_at: '2026-09-30T16:05:00Z'
  }
];

export const initialAuditTrail: AuditTrailEntry[] = [
  {
    id: 'audit-1',
    business_id: 'biz-01',
    entity_type: 'sale',
    entity_id: 'sale-1042',
    action: 'create',
    changed_by: 'Ada Eze',
    new_value: 'Invoice #1042 created for Amaka Stores (₦150,000)',
    timestamp: '2026-10-01 10:00 AM'
  },
  {
    id: 'audit-2',
    business_id: 'biz-01',
    entity_type: 'purchase',
    entity_id: 'purch-501',
    action: 'create',
    changed_by: 'Ada Eze',
    new_value: 'Purchase #P-501 recorded from ABC Wholesale (₦500,000)',
    timestamp: '2026-10-01 08:00 AM'
  }
];

export const initialPOSSettlement: POSSettlement = {
  id: 'pos-settle-01',
  business_id: 'biz-01',
  settlement_date: '2026-10-02',
  gross_sales_amount: 450000,
  processing_fee: 9000,
  net_deposit_amount: 441000,
  matched_sale_ids: [],
  status: 'pending'
};
