import React, { useState, useEffect } from 'react';
import { transactionApi, Transaction, Summary, TransactionType } from '../services/api';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load summary and recent transactions in parallel
      const [summaryResponse, transactionsResponse] = await Promise.all([
        transactionApi.getSummary(),
        transactionApi.getAll({ pageSize: 5 })
      ]);

      setSummary(summaryResponse.data);
      setRecentTransactions(transactionsResponse.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="glass-card">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card">
        <div className="error">{error}</div>
        <button className="btn btn-primary" onClick={loadDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: 'white', marginBottom: '2rem', textAlign: 'center' }}>
        Dashboard
      </h1>
      
      {/* Summary Cards */}
      {summary && (
        <div className="dashboard">
          <div className="stat-card income">
            <div className="stat-value">{formatCurrency(summary.totalIncome)}</div>
            <div className="stat-label">Total Income</div>
          </div>
          <div className="stat-card expense">
            <div className="stat-value">{formatCurrency(summary.totalExpense)}</div>
            <div className="stat-label">Total Expenses</div>
          </div>
          <div className="stat-card balance">
            <div className="stat-value">{formatCurrency(summary.balance)}</div>
            <div className="stat-label">Net Balance</div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>
          Recent Transactions
        </h2>
        
        {recentTransactions.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', padding: '2rem' }}>
            No transactions found. Start by adding your first transaction!
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;