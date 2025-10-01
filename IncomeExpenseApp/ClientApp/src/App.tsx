import React, { useState, useCallback, Suspense, lazy } from 'react';
import './App.css';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const TransactionForm = lazy(() => import('./components/TransactionForm'));
const TransactionList = lazy(() => import('./components/TransactionList'));
const CategoryManager = lazy(() => import('./components/CategoryManager'));
const TransferForm = lazy(() => import('./components/TransferForm'));
const Settings = lazy(() => import('./components/Settings'));

type Page = 'dashboard' | 'add-transaction' | 'transactions' | 'categories' | 'transfer' | 'settings';

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
            case 'settings':
              return <Settings />;
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
      case 'settings':
        return 'Settings';
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

          {/* Mobile-Optimized Navigation */}
          <div className="nav-links mobile-nav">
            <button 
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => navigateToPage('dashboard')}
              title="Dashboard"
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Dashboard</span>
            </button>
            <button 
              className={`nav-link ${currentPage === 'add-transaction' ? 'active' : ''}`}
              onClick={() => navigateToPage('add-transaction')}
              title="Add Transaction"
            >
              <span className="nav-icon">➕</span>
              <span className="nav-text">Add</span>
            </button>
            <button 
              className={`nav-link ${currentPage === 'transfer' ? 'active' : ''}`}
              onClick={() => navigateToPage('transfer')}
              title="Transfer Money"
            >
              <span className="nav-icon">🔄</span>
              <span className="nav-text">Transfer</span>
            </button>
            <button 
              className={`nav-link ${currentPage === 'transactions' ? 'active' : ''}`}
              onClick={() => navigateToPage('transactions')}
              title="View Transactions"
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">View</span>
            </button>
            <button 
              className={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => navigateToPage('settings')}
              title="Settings"
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Settings</span>
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
