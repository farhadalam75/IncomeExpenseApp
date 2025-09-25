import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { transactionApi, Transaction, TransactionType, categoryApi, Category } from '../services/api';

interface TransactionListProps {
  onNavigate?: (page: 'dashboard' | 'add-transaction' | 'transactions' | 'categories') => void;
  onBack?: () => void;
}

const TransactionList: React.FC<TransactionListProps> = memo(({ onNavigate, onBack }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters - separate applied from draft to optimize performance
  const [appliedFilters, setAppliedFilters] = useState({
    type: '' as string,
    category: '',
    fromDate: '',
    toDate: '',
  });
  
  const [draftFilters, setDraftFilters] = useState({
    type: '' as string,
    category: '',
    fromDate: '',
    toDate: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Memoize expensive operations
  const loadTransactionsCallback = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        pageSize,
        ...(appliedFilters.type && { type: parseInt(appliedFilters.type) as TransactionType }),
        ...(appliedFilters.category && { category: appliedFilters.category }),
        ...(appliedFilters.fromDate && { fromDate: appliedFilters.fromDate }),
        ...(appliedFilters.toDate && { toDate: appliedFilters.toDate }),
      };

      const response = await transactionApi.getAll(params);
      setTransactions(response.data);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, currentPage]);

  const loadCategoriesCallback = useCallback(async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);

  useEffect(() => {
    loadTransactionsCallback();
    loadCategoriesCallback();
  }, [loadTransactionsCallback, loadCategoriesCallback]);

  // Memoized filtered categories for better performance
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      !draftFilters.type || cat.type === parseInt(draftFilters.type)
    );
  }, [categories, draftFilters.type]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await transactionApi.delete(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete transaction');
      console.error('Transaction deletion error:', err);
    }
  };

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setDraftFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
  }, [draftFilters]);

  const clearFilters = useCallback(() => {
    const emptyFilters = {
      type: '',
      category: '',
      fromDate: '',
      toDate: '',
    };
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  }, []);

  const hasFilterChanges = useMemo(() => {
    return JSON.stringify(appliedFilters) !== JSON.stringify(draftFilters);
  }, [appliedFilters, draftFilters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <h1 style={{ color: 'white', marginBottom: '2rem', textAlign: 'center' }}>
        Transactions
      </h1>

      {/* Filters */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'white', marginBottom: '1rem' }}>Filters</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          alignItems: 'end'
        }}>
          <div>
            <label className="form-label">Type</label>
            <select
              name="type"
              value={draftFilters.type}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Types</option>
              <option value={TransactionType.Income}>Income</option>
              <option value={TransactionType.Expense}>Expense</option>
            </select>
          </div>

          <div>
            <label className="form-label">Category</label>
            <select
              name="category"
              value={draftFilters.category}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Categories</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={draftFilters.fromDate}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">To Date</label>
            <input
              type="date"
              name="toDate"
              value={draftFilters.toDate}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={applyFilters}
              className={`btn ${hasFilterChanges ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              disabled={!hasFilterChanges}
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card">
        {error && (
          <div style={{ 
            background: 'rgba(248, 113, 113, 0.1)', 
            border: '1px solid #f87171', 
            color: '#f87171',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading">Loading transactions...</div>
        ) : transactions.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.date)}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.category}</td>
                    <td>
                      <span
                        style={{
                          color: transaction.type === TransactionType.Income ? '#4ade80' : '#f87171',
                          fontWeight: 'bold',
                        }}
                      >
                        {transaction.type === TransactionType.Income ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td
                      style={{
                        color: transaction.type === TransactionType.Income ? '#4ade80' : '#f87171',
                        fontWeight: 'bold',
                      }}
                    >
                      {transaction.type === TransactionType.Income ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {transaction.notes || '-'}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', padding: '2rem' }}>
            No transactions found. Try adjusting your filters or add some transactions!
          </div>
        )}

        {/* Pagination */}
        {transactions.length > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem', 
            marginTop: '2rem' 
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span style={{ 
              color: 'white', 
              alignSelf: 'center',
              padding: '0 1rem'
            }}>
              Page {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={transactions.length < pageSize}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default TransactionList;