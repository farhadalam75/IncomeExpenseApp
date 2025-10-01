import React, { useState, useEffect, useCallback } from 'react';
import { transactionApi, categoryApi, accountApi, TransactionCreateDto, Category, TransactionType, Account } from '../services/api';

interface TransactionFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess, onBack }) => {
  const [formData, setFormData] = useState<TransactionCreateDto>({
    description: '',
    amount: 0,
    type: TransactionType.Expense,
    category: '',
    accountId: 1, // Default to Cash account (ID 1)
    date: new Date().toISOString().split('T')[0],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const response = await categoryApi.getAll(formData.type);
      setCategories(response.data);
      // Auto-select first category if none selected
      if (response.data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: response.data[0].name }));
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, [formData.type, formData.category]);

  const loadAccounts = useCallback(async () => {
    try {
      const response = await accountApi.getAll();
      setAccounts(response.data);
      // Auto-select Cash account (ID 1) if none selected, or first account as fallback
      if (response.data.length > 0 && !formData.accountId) {
        const cashAccount = response.data.find(acc => acc.name === 'Cash') || response.data[0];
        setFormData(prev => ({ ...prev, accountId: cashAccount.id }));
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  }, [formData.accountId]);

  useEffect(() => {
    loadAccounts();
    loadCategories();
  }, [loadAccounts, loadCategories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : 
              name === 'type' ? parseInt(value) as TransactionType : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount <= 0 || !formData.category || !formData.accountId) {
      setError('Please fill in all required fields (amount, category, account)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await transactionApi.create(formData);
      
      setSuccess(true);
      setFormData({
        description: '',
        amount: 0,
        type: TransactionType.Expense,
        category: categories.length > 0 ? categories[0].name : '',
        accountId: accounts.length > 0 ? (accounts.find(acc => acc.name === 'Cash')?.id || accounts[0].id) : 1,
        date: new Date().toISOString().split('T')[0],
      });

      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);

    } catch (err) {
      setError('Failed to create transaction');
      console.error('Transaction creation error:', err);
    } finally {
      setLoading(false);
    }
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
            💰 Add Transaction
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
            Transaction created successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* First Row: Account Selection */}
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Account *</label>
            <select
              name="accountId"
              value={formData.accountId}
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
              {accounts.map((account) => (
                <option key={account.id} value={account.id} style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  {account.icon} {account.name} (৳{account.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Second Row: Type, Amount, Date */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Type *</label>
              <select
                name="type"
                value={formData.type}
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
                <option value={TransactionType.Expense} style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  💸 Expense
                </option>
                <option value={TransactionType.Income} style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  💰 Income
                </option>
              </select>
            </div>

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

          {/* Third Row: Category */}
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Category *</label>
            <select
              name="category"
              value={formData.category}
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
              <option value="" style={{ backgroundColor: '#1e293b', color: 'white' }}>
                Select category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.name} style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fourth Row: Description (textarea like notes) */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-control"
              style={{ padding: '0.5rem', fontSize: '0.875rem', minHeight: '60px' }}
              placeholder="Enter transaction description (optional)"
              rows={2}
            />
          </div>

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
            {loading ? 'Creating...' : '✅ Create Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;