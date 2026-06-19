import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmDialog from '../common/ConfirmDialog';

export default function ManageSubCategory() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [newSubCategory, setNewSubCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const { request, loading } = useApi();

  const fetchCategories = useCallback(async () => {
    try {
      setError(null);
      const response = await request('GET', '/api/categories');
      const cats = response.data || [];
      setCategories(cats);
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0].id);
      }
    } catch (err) {
      setError('Failed to load categories');
    }
  }, [request, selectedCategory]);

  const fetchSubcategories = useCallback(async (categoryId) => {
    try {
      setError(null);
      const response = await request('GET', `/api/categories/${categoryId}/subcategories`);
      setSubcategories(response.data || []);
    } catch (err) {
      setError('Failed to load subcategories');
    }
  }, [request]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
    }
  }, [selectedCategory, fetchSubcategories]);

  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    if (!newSubCategory.trim() || !selectedCategory) return;

    try {
      setError(null);
      await request('POST', `/api/categories/${selectedCategory}/subcategories`, { name: newSubCategory });
      setSuccess('Subcategory added successfully!');
      setNewSubCategory('');
      fetchSubcategories(selectedCategory);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to add subcategory');
    }
  };

  const handleDeleteSubCategory = async (id) => {
    try {
      setError(null);
      await request('DELETE', `/api/categories/subcategories/${id}`);
      setSuccess('Subcategory deleted successfully!');
      setDeleteConfirm({ isOpen: false, id: null });
      fetchSubcategories(selectedCategory);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to delete subcategory');
    }
  };

  const handleEditSubCategory = async (id) => {
    if (!editValue.trim()) return;

    try {
      setError(null);
      await request('PUT', `/api/categories/subcategories/${id}`, { name: editValue });
      setSuccess('Subcategory updated successfully!');
      setEditingId(null);
      setEditValue('');
      fetchSubcategories(selectedCategory);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to update subcategory');
    }
  };

  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;

  if (loading) return <LoadingSpinner message="Loading..." />;

  return (
    <div className="space-y-6">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Subcategory"
        message="Are you sure you want to delete this subcategory?"
        isDangerous={true}
        onConfirm={() => handleDeleteSubCategory(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />
      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6">Select Category</h2>

        {categories.length === 0 ? (
          <p className="text-slate-400">No categories found. Create categories first in "Manage Category".</p>
        ) : (
          <>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {selectedCategory && (
              <div className="space-y-6">
                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Add Subcategory to {selectedCategoryName}</h3>

                  <form onSubmit={handleAddSubCategory} className="flex gap-3 mb-6">
                    <input
                      type="text"
                      value={newSubCategory}
                      onChange={(e) => setNewSubCategory(e.target.value)}
                      placeholder={`Enter subcategory name (e.g., Infrastructure Services, Cyber Security Services)`}
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

                  <h4 className="text-base font-semibold text-white mb-4">Subcategories</h4>

                  <div className="space-y-2">
                    {subcategories.length === 0 ? (
                      <p className="text-slate-400 text-center py-8">No subcategories yet.</p>
                    ) : (
                      subcategories.map(subcat => (
                        <div key={subcat.id} className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl shadow-md hover:bg-slate-900/50 transition-all duration-200 hover:shadow-lg">
                          {editingId === subcat.id ? (
                            <div className="flex gap-2 flex-1">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 px-3 py-1 bg-slate-800 border border-slate-700/40 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                              <button
                                onClick={() => handleEditSubCategory(subcat.id)}
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
                              <span className="text-white font-medium">{subcat.name}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingId(subcat.id);
                                    setEditValue(subcat.name);
                                  }}
                                  className="p-2 text-blue-400 hover:bg-blue-900/30 rounded transition-all"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm({ isOpen: true, id: subcat.id })}
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
