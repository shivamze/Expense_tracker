// ==========================================
// ENUMS
// ==========================================
export enum CategoryEnum {
  FOOD = "Food",
  TRANSPORT = "Transport",
  UTILITIES = "Utilities",
  RENT = "Rent",
  ENTERTAINMENT = "Entertainment",
  HEALTHCARE = "Healthcare",
  SHOPING = "Shoping",
  OTHER = "Other",
}

export enum SavingsTypeEnum {
  INCOME = "Income",
  SIP = "SIP",
  INVESTMENT = "Investment",
  OTHER = "Other",
}

// ==========================================
// AUTHENTICATION
// ==========================================
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

// ==========================================
// EXPENSES
// ==========================================
export interface ExpenseRead {
  id: number;
  user_id: number;
  category: CategoryEnum;
  amount: number;
  title: string;
  tags?: string[];
  expense_date: string; // Serialized as ISO string (YYYY-MM-DD)
}

export interface ExpenseCreate {
  category: CategoryEnum;
  amount: number;
  title: string;
  tags?: string[];
  expense_date?: string;
}

export interface ExpenseUpdate {
  // id?: number
  category?: CategoryEnum;
  amount?: number;
  title?: string;
  tags?: string[];
  expense_date?: string;
}

// ==========================================
// SAVINGS
// ==========================================
export interface SavingsRead {
  id: number;
  user_id: number;
  savings_type: SavingsTypeEnum;
  amount: number;
  source: string;
  transaction_date?: string; // Serialized as ISO string
}

export interface SavingsCreate {
  savings_type: SavingsTypeEnum;
  amount: number;
  source: string;
  transaction_date?: string;
}

export interface SavingsUpdate {
  savings_type?: SavingsTypeEnum;
  amount?: number;
  source?: string;
  transaction_date?: string;
}

// ==========================================
// DASHBOARD ANALYTICS
// ==========================================
export interface CategoryTotal {
  category: string;
  total: number;
}

export interface DailyTrend {
  date: string;
  total: number;
}

export interface DashboardSummary {
  current_month_total: number;
  category_breakdown: CategoryTotal[];
  daily_trend: DailyTrend[];
  recent_transactions: ExpenseRead[];
  total_transactions: number;
}

export interface SavingsSummary {
  income: {
    total_income: number;
    recent_transactions: SavingsRead[];
  };
  savings: {
    total_savings: number;
    breakdown_by_type: { type: SavingsTypeEnum; amount: number }[];
    recent_transactions: SavingsRead[];
    total_deposits: number;
  };
}

export interface ExpenseFilters {
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  sort?: "newest" | "oldest";
}

export interface ExpensePagination {
  items: ExpenseRead[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}