import React, { useState, useEffect } from 'react';
import { transactionApi, Transaction, TransactionType, categoryApi, Category } from '../services/api';

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    type: '' as string,
    category: '',
    fromDate: '',
    toDate: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, [filters, currentPage]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        pageSize,
        ...(filters.type && { type: parseInt(filters.type) as TransactionType }),
        ...(filters.category && { category: filters.category }),
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate }),
      };

      const response = await transactionApi.getAll(params);
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Transaction loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      fromDate: '',
      toDate: '',
    });
    setCurrentPage(1);
  };

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
              value={filters.type}
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
              value={filters.category}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
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
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">To Date</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>

          <div>
            <button
              onClick={clearFilters}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Clear Filters
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
};

export default TransactionList;