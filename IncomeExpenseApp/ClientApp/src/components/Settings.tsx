import React, { useState, useEffect } from 'react';
import { transactionApi } from '../services/api';
import './Settings.css';

const Settings: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{isAuthenticated: boolean, message: string} | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    checkSyncStatus();
  }, []);

  const checkSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync/status');
      const data = await response.json();
      setSyncStatus(data);
    } catch (error) {
      console.error('Failed to check sync status:', error);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const response = await fetch('/api/sync/auth-url');
      const data = await response.json();
      
      if (data.authUrl) {
        // Open Google auth in new window
        window.open(data.authUrl, '_blank', 'width=500,height=600');
        // Check auth status periodically
        const checkAuth = setInterval(async () => {
          await checkSyncStatus();
          if (syncStatus?.isAuthenticated) {
            clearInterval(checkAuth);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      alert('❌ Failed to start Google authentication');
    }
  };

  const handleBackup = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch('/api/sync/backup', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Data backed up to Google Drive successfully!');
      } else {
        alert(`❌ Backup failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Backup failed:', error);
      alert('❌ Backup failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm('⚠️ This will replace all current data with backup. Continue?')) {
      return;
    }
    
    try {
      setIsSyncing(true);
      const response = await fetch('/api/sync/restore', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Data restored from Google Drive successfully!');
        window.location.reload();
      } else {
        alert(`❌ Restore failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert('❌ Restore failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

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
          <h2>📱 Google Drive Sync</h2>
          <p className="settings-description">
            Backup your data to Google Drive to keep it safe across devices and app installations.
          </p>

          <div className="sync-status">
            {syncStatus ? (
              <div className={`status-indicator ${syncStatus.isAuthenticated ? 'connected' : 'disconnected'}`}>
                <span className="status-icon">
                  {syncStatus.isAuthenticated ? '✅' : '❌'}
                </span>
                <span className="status-text">{syncStatus.message}</span>
              </div>
            ) : (
              <div className="status-indicator loading">
                <span className="status-icon">🔄</span>
                <span className="status-text">Checking status...</span>
              </div>
            )}
          </div>

          <div className="sync-actions">
            {!syncStatus?.isAuthenticated ? (
              <button
                className="btn-primary"
                onClick={handleGoogleAuth}
                disabled={isSyncing}
              >
                <span className="sync-icon">🔗</span>
                Connect Google Drive
              </button>
            ) : (
              <div className="sync-buttons">
                <button
                  className="btn-backup"
                  onClick={handleBackup}
                  disabled={isSyncing}
                >
                  <span className="sync-icon">☁️</span>
                  {isSyncing ? 'Backing up...' : 'Backup to Drive'}
                </button>
                <button
                  className="btn-restore"
                  onClick={handleRestore}
                  disabled={isSyncing}
                >
                  <span className="sync-icon">📥</span>
                  {isSyncing ? 'Restoring...' : 'Restore from Drive'}
                </button>
              </div>
            )}
          </div>
        </div>

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