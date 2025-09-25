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
  date: string;
  notes?: string;
}

export interface TransactionUpdateDto {
  description?: string;
  amount?: number;
  type?: TransactionType;
  category?: string;
  date?: string;
  notes?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  type: TransactionType;
  isDefault: boolean;
  createdAt: string;
}

export interface CategoryCreateDto {
  name: string;
  description?: string;
  type: TransactionType;
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

export default api;