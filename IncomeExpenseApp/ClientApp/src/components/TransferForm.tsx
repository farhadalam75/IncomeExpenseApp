import React, { useState, useEffect } from 'react';
import { accountApi, Account } from '../services/api';

interface TransferFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    fromAccountId: 0,
    toAccountId: 0,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await accountApi.getAll();
      setAccounts(response.data);
      // Auto-select first two different accounts
      if (response.data.length >= 2) {
        setFormData(prev => ({
          ...prev,
          fromAccountId: response.data[0].id,
          toAccountId: response.data[1].id
        }));
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
      setError('Failed to load accounts');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : 
              name === 'fromAccountId' || name === 'toAccountId' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount <= 0 || !formData.fromAccountId || !formData.toAccountId) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.fromAccountId === formData.toAccountId) {
      setError('Source and destination accounts must be different');
      return;
    }

    const fromAccount = accounts.find(acc => acc.id === formData.fromAccountId);
    if (fromAccount && fromAccount.balance < formData.amount) {
      setError('Insufficient balance in source account');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use the transfer API endpoint
      await accountApi.transfer(formData);
      
      setSuccess(true);
      setFormData({
        fromAccountId: accounts.length >= 2 ? accounts[0].id : 0,
        toAccountId: accounts.length >= 2 ? accounts[1].id : 0,
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
      });

      // Reload accounts to update balances
      loadAccounts();

      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);

    } catch (err) {
      setError('Failed to transfer money');
      console.error('Transfer error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableToAccounts = () => {
    return accounts.filter(acc => acc.id !== formData.fromAccountId);
  };

  const getAvailableFromAccounts = () => {
    return accounts.filter(acc => acc.id !== formData.toAccountId);
  };

  return (
    <div className="form-container">
      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{ 
            color: 'white', 
            margin: 0, 
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)'
          }}>
            🔄 Transfer Money
          </h2>
          {onBack && (
            <button
              onClick={onBack}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              ← Back
            </button>
          )}
        </div>

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

        {success && (
          <div style={{ 
            background: 'rgba(74, 222, 128, 0.1)', 
            border: '1px solid #4ade80', 
            color: '#4ade80',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            Money transferred successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* First Row: From Account */}
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>From Account *</label>
            <select
              name="fromAccountId"
              value={formData.fromAccountId}
              onChange={handleInputChange}
              className="form-control"
              style={{ 
                color: 'white',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '0.5rem',
                fontSize: '0.875rem'
              }}
              required
            >
              <option value={0} style={{ backgroundColor: '#1e293b', color: 'white' }}>
                Select source account
              </option>
              {getAvailableFromAccounts().map((account) => (
                <option key={account.id} value={account.id} style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  {account.icon} {account.name} (৳{account.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Second Row: To Account */}
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>To Account *</label>
            <select
              name="toAccountId"
              value={formData.toAccountId}
              onChange={handleInputChange}
              className="form-control"
              style={{ 
                color: 'white',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '0.5rem',
                fontSize: '0.875rem'
              }}
              required
            >
              <option value={0} style={{ backgroundColor: '#1e293b', color: 'white' }}>
                Select destination account
              </option>
              {getAvailableToAccounts().map((account) => (
                <option key={account.id} value={account.id} style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  {account.icon} {account.name} (৳{account.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Third Row: Amount and Date */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Amount *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount || ''}
                onChange={handleInputChange}
                className="form-control"
                style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="form-control"
                style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                required
              />
            </div>
          </div>

          {/* Fourth Row: Description */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-control"
              style={{ padding: '0.5rem', fontSize: '0.875rem', minHeight: '60px' }}
              placeholder="Enter transfer description (optional)"
              rows={2}
            />
          </div>

          {/* Transfer Preview */}
          {formData.fromAccountId && formData.toAccountId && formData.amount > 0 && (
            <div style={{ 
              background: 'rgba(59, 130, 246, 0.1)', 
              border: '1px solid rgba(59, 130, 246, 0.3)', 
              color: 'rgba(255, 255, 255, 0.9)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Transfer Preview:</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>From: {accounts.find(acc => acc.id === formData.fromAccountId)?.name}</span>
                <span style={{ color: '#ef4444' }}>-৳{formData.amount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>To: {accounts.find(acc => acc.id === formData.toAccountId)?.name}</span>
                <span style={{ color: '#4ade80' }}>+৳{formData.amount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ 
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            {loading ? 'Transferring...' : '🔄 Transfer Money'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferForm;