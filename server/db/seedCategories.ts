import { db } from './client';
import { categories } from './schema';
import { eq, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const defaultSystemCategories: Array<{
  name: string;
  kind: 'income' | 'expense' | 'transfer';
  icon: string;
  color: string;
  isBusinessCogs?: number;
}> = [
  // Income
  { name: 'Salary', kind: 'income', icon: 'Briefcase', color: '#059669' },
  { name: 'Business Sales', kind: 'income', icon: 'ShoppingBag', color: '#047857' },
  { name: 'Investments & Dividends', kind: 'income', icon: 'TrendingUp', color: '#0284c7' },
  { name: 'Freelance & Consulting', kind: 'income', icon: 'Laptop', color: '#0891b2' },
  { name: 'Other Income', kind: 'income', icon: 'DollarSign', color: '#10b981' },

  // Personal Expenses
  { name: 'Groceries & Supermarket', kind: 'expense', icon: 'ShoppingCart', color: '#eab308' },
  { name: 'Transportation & Fuel', kind: 'expense', icon: 'Car', color: '#0284c7' },
  { name: 'Dining & Food Out', kind: 'expense', icon: 'Utensils', color: '#f97316' },
  { name: 'Housing & Rent', kind: 'expense', icon: 'Home', color: '#6366f1' },
  { name: 'Utilities & Electricity', kind: 'expense', icon: 'Zap', color: '#e11d48' },
  { name: 'Telecommunications & Airtime', kind: 'expense', icon: 'Phone', color: '#8b5cf6' },
  { name: 'Healthcare & Pharmacy', kind: 'expense', icon: 'Heart', color: '#ec4899' },
  { name: 'Subscriptions & Entertainment', kind: 'expense', icon: 'Film', color: '#a855f7' },
  { name: 'Education & Learning', kind: 'expense', icon: 'BookOpen', color: '#3b82f6' },
  { name: 'Personal Care', kind: 'expense', icon: 'Smile', color: '#14b8a6' },

  // Business Expenses
  { name: 'Cost of Goods Sold (Wholesale Stock)', kind: 'expense', icon: 'Package', color: '#dc2626', isBusinessCogs: 1 },
  { name: 'Rent & Facilities', kind: 'expense', icon: 'Building', color: '#7c3aed' },
  { name: 'Shipping, Delivery & Logistics', kind: 'expense', icon: 'Truck', color: '#ea580c' },
  { name: 'Salaries & Staff Wages', kind: 'expense', icon: 'Users', color: '#2563eb' },
  { name: 'Marketing & Promotion', kind: 'expense', icon: 'Megaphone', color: '#db2777' },
  { name: 'Generator Fuel & Power Backup', kind: 'expense', icon: 'Fuel', color: '#d97706' },
  { name: 'POS & Bank Charges', kind: 'expense', icon: 'CreditCard', color: '#64748b' },
  { name: 'Government Fees & Taxes', kind: 'expense', icon: 'FileText', color: '#475569' },

  // Transfers
  { name: 'Internal Transfer', kind: 'transfer', icon: 'ArrowRightLeft', color: '#6b7280' },
  { name: 'Owner Equity Contribution', kind: 'transfer', icon: 'PlusCircle', color: '#059669' },
  { name: 'Owner Drawing / Withdrawal', kind: 'transfer', icon: 'MinusCircle', color: '#e11d48' }
];

export async function seedDefaultCategories() {
  const existing = await db
    .select()
    .from(categories)
    .where(isNull(categories.workspaceId));

  if (existing.length === 0) {
    const now = new Date().toISOString();
    const rows = defaultSystemCategories.map(cat => ({
      id: `cat_sys_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
      workspaceId: null,
      name: cat.name,
      kind: cat.kind,
      parentId: null,
      icon: cat.icon,
      color: cat.color,
      isBusinessCogs: cat.isBusinessCogs || 0,
      createdAt: now
    }));

    for (const r of rows) {
      await db.insert(categories).values(r);
    }
    console.log(`[CashDeck DB] Seeded ${rows.length} default categories.`);
  }
}
