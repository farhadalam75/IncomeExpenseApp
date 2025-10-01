import React, { useState } from 'react';
import { transactionApi } from '../services/api';
import './Settings.css';

const Settings: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteAll = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    try {
      setIsDeleting(true);
      const response = await transactionApi.deleteAll();
      
      alert('✅ All transactions deleted and account balances reset to zero!');
      
      // Reset confirmation state
      setShowConfirm(false);
      
      // Refresh the page to update all components
      window.location.reload();
    } catch (error) {
      console.error('Error deleting transactions:', error);
      alert('❌ Error deleting transactions. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>⚙️ Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>Data Management</h2>
          <p className="settings-description">
            Manage your transaction data and account information.
          </p>

          <div className="danger-zone">
            <h3>⚠️ Danger Zone</h3>
            <div className="danger-action">
              <div className="action-info">
                <h4>Reset All Data</h4>
                <p>
                  This will permanently delete all transactions and reset all account balances to zero. 
                  This action cannot be undone.
                </p>
              </div>
              
              {!showConfirm ? (
                <button
                  className="btn-danger"
                  onClick={handleDeleteAll}
                  disabled={isDeleting}
                  title="Delete all transactions and reset account balances"
                >
                  <span className="gear-icon">⚙️</span>
                  Reset All Data
                </button>
              ) : (
                <div className="confirm-actions">
                  <p className="confirm-text">
                    ⚠️ Are you sure? This will delete ALL transactions and reset account balances to zero!
                  </p>
                  <div className="confirm-buttons">
                    <button
                      className="btn-danger-confirm"
                      onClick={handleDeleteAll}
                      disabled={isDeleting}
                    >
                      {isDeleting ? '🔄 Deleting...' : '✅ Yes, Delete All'}
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={handleCancelDelete}
                      disabled={isDeleting}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>About</h2>
          <div className="about-info">
            <p><strong>Income Expense App</strong></p>
            <p>Version: 1.0.0</p>
            <p>A simple and elegant way to track your income, expenses, and transfers.</p>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Settings;