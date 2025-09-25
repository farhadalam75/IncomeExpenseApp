import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import CategoryManager from './components/CategoryManager';

type Page = 'dashboard' | 'add-transaction' | 'transactions' | 'categories';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'add-transaction':
        return <TransactionForm onSuccess={() => setCurrentPage('transactions')} />;
      case 'transactions':
        return <TransactionList />;
      case 'categories':
        return <CategoryManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="nav-title">Income Expense Tracker</h1>
          <div className="nav-links">
            <button 
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-link ${currentPage === 'add-transaction' ? 'active' : ''}`}
              onClick={() => setCurrentPage('add-transaction')}
            >
              Add Transaction
            </button>
            <button 
              className={`nav-link ${currentPage === 'transactions' ? 'active' : ''}`}
              onClick={() => setCurrentPage('transactions')}
            >
              Transactions
            </button>
            <button 
              className={`nav-link ${currentPage === 'categories' ? 'active' : ''}`}
              onClick={() => setCurrentPage('categories')}
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
