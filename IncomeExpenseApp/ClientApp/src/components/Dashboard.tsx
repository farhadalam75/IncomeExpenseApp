import React, { useState, useEffect, memo } from 'react';
import { transactionApi, accountApi, Transaction, Summary, TransactionType, Account } from '../services/api';

interface DashboardProps {
  onNavigate: (page: 'dashboard' | 'add-transaction' | 'transactions' | 'categories' | 'transfer') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cashAccount, setCashAccount] = useState<Account | null>(null);
  
  // Date filters
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  useEffect(() => {
    loadDashboardData();
  }, [fromDate, toDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load summary, recent transactions, and accounts in parallel
      const [summaryResponse, transactionsResponse, accountsResponse] = await Promise.all([
        transactionApi.getSummary(fromDate, toDate),
        transactionApi.getAll({ pageSize: 5, fromDate, toDate }),
        accountApi.getAll()
      ]);

      setSummary(summaryResponse.data);
      setRecentTransactions(transactionsResponse.data);
      setAccounts(accountsResponse.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
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
      <h1 style={{ color: 'white', marginBottom: '2rem', textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>
        📊 Income Expense Tracker
      </h1>
      
      {/* Date Filters */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
            <label style={{ color: 'white', marginBottom: '0.5rem', fontSize: '0.9rem' }}>From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
            <label style={{ color: 'white', marginBottom: '0.5rem', fontSize: '0.9rem' }}>To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <button
            onClick={loadDashboardData}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginTop: 'auto'
            }}
          >
            Filter
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      {summary && (
        <div className="dashboard" style={{ 
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          <div className="stat-card income" style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.15))',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            padding: '2rem 1rem',
            textAlign: 'center'
          }}>
            <div className="stat-icon" style={{ fontSize: '2rem', marginBottom: '1rem', color: '#22c55e' }}>💰</div>
            <div className="stat-value" style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
              fontWeight: '700', 
              color: '#22c55e',
              marginBottom: '0.5rem'
            }}>
              {formatCurrency(summary.totalIncome)}
            </div>
            <div className="stat-label" style={{ 
              fontSize: '1rem', 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '500' 
            }}>
              Total Income
            </div>
          </div>
          
          <div className="stat-card expense" style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '2rem 1rem',
            textAlign: 'center'
          }}>
            <div className="stat-icon" style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ef4444' }}>💸</div>
            <div className="stat-value" style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
              fontWeight: '700', 
              color: '#ef4444',
              marginBottom: '0.5rem'
            }}>
              {formatCurrency(summary.totalExpense)}
            </div>
            <div className="stat-label" style={{ 
              fontSize: '1rem', 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '500' 
            }}>
              Total Expenses
            </div>
          </div>
          
          <div 
            className="stat-card balance" 
            onClick={() => setShowAllAccounts(!showAllAccounts)}
            style={{
              background: `linear-gradient(135deg, ${summary.balance >= 0 
                ? 'rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15)'
                : 'rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15)'
              })`,
              border: `1px solid ${summary.balance >= 0 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              padding: '2rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div className="stat-icon" style={{ 
              fontSize: '2rem', 
              marginBottom: '1rem', 
              color: summary.balance >= 0 ? '#3b82f6' : '#ef4444' 
            }}>
              {showAllAccounts ? '�️' : '�'}
            </div>
            
            {!showAllAccounts ? (
              // Show Cash account balance only
              <>
                <div className="stat-value" style={{ 
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
                  fontWeight: '700', 
                  color: (accounts.find(a => a.name === 'Cash')?.balance || 0) >= 0 ? '#3b82f6' : '#ef4444',
                  marginBottom: '0.5rem'
                }}>
                  {formatCurrency(accounts.find(a => a.name === 'Cash')?.balance || 0)}
                </div>
                <div className="stat-label" style={{ 
                  fontSize: '1rem', 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: '500' 
                }}>
                  Cash Balance
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: '0.5rem'
                }}>
                  Click to see all accounts
                </div>
              </>
            ) : (
              // Show all account balances
              <div style={{ fontSize: '0.9rem' }}>
                {accounts.map(account => (
                  <div key={account.id} style={{ 
                    marginBottom: '0.8rem', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'rgba(255, 255, 255, 0.9)'
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>{account.icon}</span>
                      {account.name}
                    </span>
                    <span style={{ 
                      color: account.balance >= 0 ? '#4ade80' : '#ef4444',
                      fontWeight: 'bold'
                    }}>
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
                <div style={{ 
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                  paddingTop: '0.8rem',
                  marginTop: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 'bold'
                }}>
                  <span>Total:</span>
                  <span style={{ 
                    color: summary.balance >= 0 ? '#4ade80' : '#ef4444'
                  }}>
                    {formatCurrency(summary.balance)}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: '0.5rem'
                }}>
                  Click to show Cash only
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        margin: '2rem 0'
      }}>
        <div 
          className="glass-card quick-action-card"
          onClick={() => onNavigate('add-transaction')}
          style={{
            cursor: 'pointer',
            padding: '1.2rem',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            border: '2px solid rgba(34, 197, 94, 0.2)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>➕</div>
          <h3 style={{ color: '#4ade80', marginBottom: '0.4rem', fontSize: '1.1rem' }}>Add Transaction</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
            Record income or expense
          </p>
        </div>
        
        <div 
          className="glass-card quick-action-card"
          onClick={() => onNavigate('transfer')}
          style={{
            cursor: 'pointer',
            padding: '1.2rem',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            border: '2px solid rgba(249, 115, 22, 0.2)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>🔄</div>
          <h3 style={{ color: '#fb923c', marginBottom: '0.4rem', fontSize: '1.1rem' }}>Transfer Money</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
            Move between accounts
          </p>
        </div>
        
        <div 
          className="glass-card quick-action-card"
          onClick={() => onNavigate('transactions')}
          style={{
            cursor: 'pointer',
            padding: '1.2rem',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            border: '2px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>📊</div>
          <h3 style={{ color: '#60a5fa', marginBottom: '0.4rem', fontSize: '1.1rem' }}>View Transactions</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
            Browse and filter
          </p>
        </div>
        
        <div 
          className="glass-card quick-action-card"
          onClick={() => onNavigate('categories')}
          style={{
            cursor: 'pointer',
            padding: '1.2rem',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            border: '2px solid rgba(168, 85, 247, 0.2)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>⚙️</div>
          <h3 style={{ color: '#a855f7', marginBottom: '0.4rem', fontSize: '1.1rem' }}>Manage Categories</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
            Add or edit categories
          </p>
        </div>
      </div>

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
                {recentTransactions.map((transaction) => {
                  const isTransfer = transaction.category === 'Transfer';
                  return (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.date)}</td>
                    <td>{transaction.description}</td>
                    <td>
                      {isTransfer && (
                        <span style={{ marginRight: '0.5rem' }}>↔️</span>
                      )}
                      {transaction.category}
                    </td>
                    <td>
                      <span
                        style={{
                          color: isTransfer ? '#8b5cf6' :
                                 transaction.type === TransactionType.Income ? '#4ade80' : '#fbbf24',
                          fontWeight: 'bold',
                        }}
                      >
                        {isTransfer ? 'Transfer' :
                         transaction.type === TransactionType.Income ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td
                      style={{
                        color: isTransfer ? '#8b5cf6' :
                               transaction.type === TransactionType.Income ? '#4ade80' : '#fbbf24',
                        fontWeight: 'bold',
                      }}
                    >
                      {isTransfer ? '↔️' : 
                       transaction.type === TransactionType.Income ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </td>
                  </tr>
                  );
                })}
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