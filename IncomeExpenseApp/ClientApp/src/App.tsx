import React, { useState, useCallback, Suspense, lazy } from 'react';
import './App.css';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const TransactionForm = lazy(() => import('./components/TransactionForm'));
const TransactionList = lazy(() => import('./components/TransactionList'));
const CategoryManager = lazy(() => import('./components/CategoryManager'));
const TransferForm = lazy(() => import('./components/TransferForm'));

type Page = 'dashboard' | 'add-transaction' | 'transactions' | 'categories' | 'transfer';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [previousPage, setPreviousPage] = useState<Page>('dashboard');

  const navigateToPage = useCallback((page: Page) => {
    setPreviousPage(currentPage);
    setCurrentPage(page);
  }, [currentPage]);

  const goBack = useCallback(() => {
    setCurrentPage(previousPage);
  }, [previousPage]);

  const renderPage = () => {
    const LoadingSpinner = () => (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px',
        color: 'rgba(255, 255, 255, 0.8)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderTop: '3px solid #60a5fa',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );

    return (
      <Suspense fallback={<LoadingSpinner />}>
        {(() => {
          switch (currentPage) {
            case 'dashboard':
              return <Dashboard onNavigate={navigateToPage} />;
            case 'add-transaction':
              return <TransactionForm onSuccess={() => navigateToPage('transactions')} onBack={goBack} />;
            case 'transfer':
              return <TransferForm onSuccess={() => navigateToPage('dashboard')} onBack={goBack} />;
            case 'transactions':
              return <TransactionList onNavigate={navigateToPage} onBack={goBack} />;
            case 'categories':
              return <CategoryManager onBack={goBack} />;
            default:
              return <Dashboard onNavigate={navigateToPage} />;
          }
        })()}
      </Suspense>
    );
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'add-transaction':
        return 'Add Transaction';
      case 'transfer':
        return 'Transfer Money';
      case 'transactions':
        return 'Transactions';
      case 'categories':
        return 'Categories';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="nav-title">Income Expense Tracker</h1>
          
          {/* Page Title and Back Button */}
          <div className="page-header">
            <h2 className="page-title">{getPageTitle()}</h2>
            {currentPage !== 'dashboard' && (
              <button className="back-btn" onClick={goBack}>
                ← Back
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="nav-actions">
            <button 
              className="quick-btn add-btn"
              onClick={() => navigateToPage('add-transaction')}
              title="Add Transaction"
            >
              + Add
            </button>
            <button 
              className="quick-btn transfer-btn"
              onClick={() => navigateToPage('transfer')}
              title="Transfer Money"
            >
              🔄 Transfer
            </button>
            <button 
              className="quick-btn view-btn"
              onClick={() => navigateToPage('transactions')}
              title="View Transactions"
            >
              📊 View
            </button>
            <button 
              className="quick-btn settings-btn"
              onClick={() => navigateToPage('categories')}
              title="Manage Categories"
            >
              ⚙️ Settings
            </button>
          </div>

          {/* Main Navigation */}
          <div className="nav-links">
            <button 
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => navigateToPage('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-link ${currentPage === 'add-transaction' ? 'active' : ''}`}
              onClick={() => navigateToPage('add-transaction')}
            >
              Add Transaction
            </button>
            <button 
              className={`nav-link ${currentPage === 'transactions' ? 'active' : ''}`}
              onClick={() => navigateToPage('transactions')}
            >
              Transactions
            </button>
            <button 
              className={`nav-link ${currentPage === 'categories' ? 'active' : ''}`}
              onClick={() => navigateToPage('categories')}
            >
              Categories
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
