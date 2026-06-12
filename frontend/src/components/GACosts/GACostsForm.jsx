import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

const CATEGORIES = ['Business Apps', 'IT Services', 'Other'];
const COST_TYPES = ['Retained', 'Distributed'];
const YEARS = [2024, 2025, 2026, 2027];

export default function GACostsForm({ cost, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    category: '',
    costType: '',
    serviceSoftware: '',
    vendor: '',
    version: '',
    budgetMaintenance: '',
    budgetNew: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const { request, loading } = useApi();

  useEffect(() => {
    if (cost) {
      setFormData({
        year: cost.year || '',
        category: cost.category || '',
        costType: cost.costType || '',
        serviceSoftware: cost.serviceSoftware || '',
        vendor: cost.vendor || '',
        version: cost.version || '',
        budgetMaintenance: cost.budgetMaintenance || '',
        budgetNew: cost.budgetNew || ''
      });
    }
  }, [cost]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.costType) newErrors.costType = 'Cost Type is required';
    if (!formData.serviceSoftware.trim()) newErrors.serviceSoftware = 'Service/Software is required';
    if (!formData.vendor.trim()) newErrors.vendor = 'Vendor is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setError(null);
      const payload = {
        year: parseInt(formData.year),
        category: formData.category,
        costType: formData.costType,
        serviceSoftware: formData.serviceSoftware.trim(),
        vendor: formData.vendor.trim(),
        version: formData.version.trim() || undefined,
        budgetMaintenance: formData.budgetMaintenance ? parseFloat(formData.budgetMaintenance) : 0,
        budgetNew: formData.budgetNew ? parseFloat(formData.budgetNew) : 0
      };

      if (cost) {
        await request('PUT', `/api/gacosts/${cost.id}`, payload);
      } else {
        await request('POST', '/api/gacosts', payload);
      }

      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save G&A cost');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800 p-6 rounded-lg max-h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-white sticky top-0 bg-slate-800 pb-2">
        {cost ? 'Edit G&A Cost' : 'New G&A Cost'}
      </h2>

      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}
      {loading && <LoadingSpinner message="Saving..." />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Year */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">Year *</label>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.year ? 'border-red-500' : 'border-slate-600'}`}
          >
            <option value="">Select Year</option>
            {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          {errors.year && <p className="mt-1 text-sm text-red-400">{errors.year}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? 'border-red-500' : 'border-slate-600'}`}
          >
            <option value="">Select Category</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-400">{errors.category}</p>}
        </div>

        {/* Cost Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">Cost Type *</label>
          <select
            name="costType"
            value={formData.costType}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.costType ? 'border-red-500' : 'border-slate-600'}`}
          >
            <option value="">Select Type</option>
            {COST_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          {errors.costType && <p className="mt-1 text-sm text-red-400">{errors.costType}</p>}
        </div>

        {/* Version */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">Version</label>
          <input
            type="text"
            name="version"
            value={formData.version}
            onChange={handleChange}
            placeholder="e.g., 2.1.0"
            className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Service/Software */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">Service/Software *</label>
          <input
            type="text"
            name="serviceSoftware"
            value={formData.serviceSoftware}
            onChange={handleChange}
            placeholder="e.g., Microsoft Office 365"
            className={`w-full px-3 py-2 border rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.serviceSoftware ? 'border-red-500' : 'border-slate-600'}`}
          />
          {errors.serviceSoftware && <p className="mt-1 text-sm text-red-400">{errors.serviceSoftware}</p>}
        </div>

        {/* Vendor */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">Vendor *</label>
          <input
            type="text"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            placeholder="e.g., Microsoft"
            className={`w-full px-3 py-2 border rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.vendor ? 'border-red-500' : 'border-slate-600'}`}
          />
          {errors.vendor && <p className="mt-1 text-sm text-red-400">{errors.vendor}</p>}
        </div>

        {/* Budget Maintenance */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">Budget - Maintenance</label>
          <input
            type="number"
            name="budgetMaintenance"
            value={formData.budgetMaintenance}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Budget New */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">Budget - New</label>
          <input
            type="number"
            name="budgetNew"
            value={formData.budgetNew}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium transition-all"
        >
          {loading ? 'Saving...' : cost ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 disabled:opacity-50 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
