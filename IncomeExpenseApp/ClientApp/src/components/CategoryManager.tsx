import React, { useState, useEffect, memo } from 'react';
import { categoryApi, Category, CategoryCreateDto, TransactionType } from '../services/api';

interface CategoryManagerProps {
  onBack?: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = memo(({ onBack }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState<CategoryCreateDto>({
    name: '',
    description: '',
    type: TransactionType.Expense,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setError(null);
      
      if (editingCategory) {
        // Update existing category
        await categoryApi.update(editingCategory.id, formData);
      } else {
        // Create new category
        await categoryApi.create(formData);
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: TransactionType.Expense,
      });
      setEditingCategory(null);
      setShowForm(false);
      
      // Reload categories
      loadCategories();
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(editingCategory ? 'Failed to update category' : 'Category name already exists for this type');
      } else {
        setError(editingCategory ? 'Failed to update category' : 'Failed to create category');
      }
      console.error('Category operation error:', err);
    }
  };

  const handleDelete = async (categoryId: number, isDefault: boolean) => {
    if (isDefault) {
      setError('Cannot delete default categories');
      return;
    }

    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        setError(null);
        await categoryApi.delete(categoryId);
        loadCategories();
      } catch (err) {
        setError('Failed to delete category. It may still have associated transactions.');
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      type: category.type
    });
    setEditingCategory(category);
    setShowForm(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      type: TransactionType.Expense,
    });
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'type' ? parseInt(value) as TransactionType : value 
    }));
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  // Filter categories by type
  const incomeCategories = categories.filter(cat => cat.type === TransactionType.Income);
  const expenseCategories = categories.filter(cat => cat.type === TransactionType.Expense);

  const CategoryActions = ({ category }: { category: Category }) => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {!category.isDefault ? (
        <>
          <button
            onClick={() => handleEdit(category)}
            className="btn btn-secondary"
            style={{ 
              padding: '0.25rem 0.5rem', 
              fontSize: '0.75rem',
              minWidth: '50px'
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => handleDelete(category.id, category.isDefault)}
            className="btn btn-danger"
            style={{ 
              padding: '0.25rem 0.5rem', 
              fontSize: '0.75rem',
              minWidth: '50px'
            }}
          >
            🗑️ Delete
          </button>
        </>
      ) : (
        <span style={{ 
          color: 'rgba(255, 255, 255, 0.5)', 
          fontSize: '0.75rem',
          fontStyle: 'italic'
        }}>
          System Default
        </span>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="glass-card">
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
          Category Management
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
          style={{ whiteSpace: 'nowrap' }}
        >
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {error && (
        <div className="glass-card" style={{ marginBottom: '1rem' }}>
          <div style={{ color: '#f87171', textAlign: 'center', padding: '1rem' }}>
            {error}
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'none',
              border: 'none',
              color: '#f87171',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '4px',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Add/Edit Category Form */}
      {showForm && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <label className="form-label">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-control"
                  style={{ 
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <option value={TransactionType.Income} style={{ backgroundColor: '#1f2937', color: 'white' }}>
                    Income
                  </option>
                  <option value={TransactionType.Expense} style={{ backgroundColor: '#1f2937', color: 'white' }}>
                    Expense
                  </option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Income Categories */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#4ade80', marginBottom: '1.5rem', textAlign: 'center' }}>
          💰 Income Categories ({incomeCategories.length})
        </h3>
        
        {incomeCategories.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Default</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomeCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '600', color: 'white' }}>
                          {category.name}
                        </div>
                        {category.description && (
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginTop: '0.25rem'
                          }}>
                            {category.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {category.isDefault ? (
                        <span style={{ color: '#4ade80' }}>Yes</span>
                      ) : (
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No</span>
                      )}
                    </td>
                    <td>{formatDate(category.createdAt)}</td>
                    <td>
                      <CategoryActions category={category} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            color: 'rgba(255, 255, 255, 0.7)', 
            padding: '2rem' 
          }}>
            No income categories found
          </div>
        )}
      </div>

      {/* Expense Categories */}
      <div className="glass-card">
        <h3 style={{ color: '#f87171', marginBottom: '1.5rem', textAlign: 'center' }}>
          💸 Expense Categories ({expenseCategories.length})
        </h3>
        
        {expenseCategories.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Default</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenseCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '600', color: 'white' }}>
                          {category.name}
                        </div>
                        {category.description && (
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginTop: '0.25rem'
                          }}>
                            {category.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {category.isDefault ? (
                        <span style={{ color: '#4ade80' }}>Yes</span>
                      ) : (
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No</span>
                      )}
                    </td>
                    <td>{formatDate(category.createdAt)}</td>
                    <td>
                      <CategoryActions category={category} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            color: 'rgba(255, 255, 255, 0.7)', 
            padding: '2rem' 
          }}>
            No expense categories found
          </div>
        )}
      </div>
    </div>
  );
});

export default CategoryManager;