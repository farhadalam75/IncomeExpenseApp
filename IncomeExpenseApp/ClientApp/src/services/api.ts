import axios from 'axios';

// API configuration - use relative path since React and API are served from same server
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: number;
  accountName?: string;
  accountIcon?: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionCreateDto {
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: number;
  date: string;
}

export interface TransactionUpdateDto {
  description?: string;
  amount?: number;
  type?: TransactionType;
  category?: string;
  accountId?: number;
  date?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  type: TransactionType;
  isDefault: boolean;
  createdAt: string;
  transactionCount?: number;
  totalAmount?: number;
}

export interface CategoryCreateDto {
  name: string;
  description?: string;
  type: TransactionType;
}

export interface Account {
  id: number;
  name: string;
  description?: string;
  type: AccountType;
  icon: string;
  balance: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransferDto {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
  date: string;
}

export interface AccountCreateDto {
  name: string;
  description?: string;
  type: AccountType;
  icon: string;
}

export interface AccountUpdateDto {
  name?: string;
  description?: string;
  type?: AccountType;
  icon?: string;
}

export enum AccountType {
  Cash = 0,
  Bank = 1,
  CreditCard = 2,
  Investment = 3,
  Savings = 4,
  Other = 5,
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  fromDate?: string;
  toDate?: string;
}

export enum TransactionType {
  Income = 1,
  Expense = 2,
}

// API functions
export const transactionApi = {
  // Get all transactions with optional filters
  getAll: (params?: {
    type?: TransactionType;
    category?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }) => api.get<Transaction[]>('/transactions', { params }),

  // Get transaction by ID
  getById: (id: number) => api.get<Transaction>(`/transactions/${id}`),

  // Create new transaction
  create: (transaction: TransactionCreateDto) => 
    api.post<Transaction>('/transactions', transaction),

  // Update transaction
  update: (id: number, transaction: TransactionUpdateDto) => 
    api.put<Transaction>(`/transactions/${id}`, transaction),

  // Delete transaction
  delete: (id: number) => api.delete(`/transactions/${id}`),

  // Get summary
  getSummary: (fromDate?: string, toDate?: string) => 
    api.get<Summary>('/transactions/summary', { 
      params: { fromDate, toDate } 
    }),

  // Delete all transactions
  deleteAll: () => api.delete('/transactions/all'),
};

export const categoryApi = {
  // Get all categories with optional type filter
  getAll: (type?: TransactionType) => 
    api.get<Category[]>('/categories', { params: { type } }),

  // Get category by ID
  getById: (id: number) => api.get<Category>(`/categories/${id}`),

  // Create new category
  create: (category: CategoryCreateDto) => 
    api.post<Category>('/categories', category),

  // Update category
  update: (id: number, category: Partial<CategoryCreateDto>) => 
    api.put<Category>(`/categories/${id}`, category),

  // Delete category
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const accountApi = {
  // Get all accounts
  getAll: () => api.get<Account[]>('/accounts'),

  // Get account by ID
  getById: (id: number) => api.get<Account>(`/accounts/${id}`),

  // Create new account
  create: (account: AccountCreateDto) => 
    api.post<Account>('/accounts', account),

  // Update account
  update: (id: number, account: AccountUpdateDto) => 
    api.put<Account>(`/accounts/${id}`, account),

  // Delete account
  delete: (id: number) => api.delete(`/accounts/${id}`),

  // Adjust account balance
  adjustBalance: (id: number, amount: number) => 
    api.post(`/accounts/${id}/adjust-balance`, { amount }),
    
  // Transfer money between accounts
  transfer: (data: TransferDto) => api.post('/accounts/transfer', data),
};

export default api;