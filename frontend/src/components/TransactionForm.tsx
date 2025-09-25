import React, { useState, useEffect } from 'react';
import { transactionApi, categoryApi, TransactionCreateDto, Category, TransactionType } from '../services/api';

interface TransactionFormProps {
  onSuccess?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<TransactionCreateDto>({
    description: '',
    amount: 0,
    type: TransactionType.Expense,
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [formData.type]);

  const loadCategories = async () => {
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
  };

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
    
    if (!formData.description.trim() || formData.amount <= 0 || !formData.category) {
      setError('Please fill in all required fields');
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
        date: new Date().toISOString().split('T')[0],
        notes: '',
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
      <div className="glass-card">
        <h1 style={{ color: 'white', marginBottom: '2rem', textAlign: 'center' }}>
          Add New Transaction
        </h1>

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
          <div className="form-group">
            <label className="form-label">Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value={TransactionType.Expense}>Expense</option>
              <option value={TransactionType.Income}>Income</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter transaction description"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Amount *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount || ''}
              onChange={handleInputChange}
              className="form-control"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Optional notes about this transaction"
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Creating...' : 'Create Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;