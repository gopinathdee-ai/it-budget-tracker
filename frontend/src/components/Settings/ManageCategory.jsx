import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmDialog from '../common/ConfirmDialog';

export default function ManageCategory() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const { request, loading } = useApi();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setError(null);
      const response = await request('GET', '/api/categories');
      setCategories(response.data || []);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      setError(null);
      await request('POST', '/api/categories', { name: newCategory });
      setSuccess('Category added successfully!');
      setNewCategory('');
      fetchCategories();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      setError(null);
      await request('DELETE', `/api/categories/${id}`);
      setSuccess('Category deleted successfully!');
      setDeleteConfirm({ isOpen: false, id: null });
      fetchCategories();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const handleEditCategory = async (id) => {
    if (!editValue.trim()) return;

    try {
      setError(null);
      await request('PUT', `/api/categories/${id}`, { name: editValue });
      setSuccess('Category updated successfully!');
      setEditingId(null);
      setEditValue('');
      fetchCategories();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to update category');
    }
  };

  if (loading) return <LoadingSpinner message="Loading categories..." />;

  return (
    <div className="space-y-6">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? All subcategories will also be deleted."
        isDangerous={true}
        onConfirm={() => handleDeleteCategory(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />
      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      <div className="bg-slate-800 rounded-lg p-8 shadow-md">
        <h2 className="text-xl font-semibold text-white mb-6">Add New Category</h2>

        <form onSubmit={handleAddCategory} className="flex gap-3 mb-6">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name (e.g., IT Services, Business Apps)"
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium transition-all"
          >
            <FaPlus /> Add
          </button>
        </form>

        {success && (
          <div className="p-4 bg-emerald-900/30 border border-emerald-600 rounded-lg mb-6 animate-pulse">
            <p className="text-emerald-400 text-sm font-medium">✓ {success}</p>
          </div>
        )}

        <h3 className="text-lg font-semibold text-white mb-4">Existing Categories</h3>

        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No categories yet. Add one to get started!</p>
          ) : (
            categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg shadow-sm hover:bg-slate-900 transition-all">
                {editingId === cat.id ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-1 bg-slate-800 border border-slate-700/40 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleEditCategory(cat.id)}
                      className="px-4 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-700 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-white font-medium">{cat.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditValue(cat.name);
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-900/30 rounded transition-all"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: cat.id })}
                        className="p-2 text-red-400 hover:bg-red-900/30 rounded transition-all"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
