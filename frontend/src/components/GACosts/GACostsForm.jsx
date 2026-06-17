import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

const COST_TYPES = ['Retained', 'Distributed'];
const YEARS = [2024, 2025, 2026, 2027];

export default function GACostsForm({ cost, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    category: '',
    subCategory: '',
    currency: 'CAD',
    costType: '',
    serviceSoftware: '',
    vendor: '',
    version: '',
    budgetMaintenance: '',
    budgetNew: '',
    additionalCost: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [majorMinors, setMajorMinors] = useState([]);
  const [generalSettings, setGeneralSettings] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const { request, loading } = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [catsRes, currRes, mmRes, settingsRes] = await Promise.all([
          request('GET', '/api/categories'),
          request('GET', '/api/config/currencies'),
          request('GET', '/api/config/majorminor'),
          request('GET', '/api/settings/general')
        ]);
        setCategories(catsRes.data || []);
        setCurrencies(currRes.data || []);
        setMajorMinors(mmRes.data || []);
        setGeneralSettings(settingsRes.data || {});
      } catch (err) {
        setError('Failed to load form data');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [request]);

  useEffect(() => {
    if (formData.category && categories.length > 0) {
      const fetchSubs = async () => {
        try {
          const res = await request('GET', `/api/categories/${formData.category}/subcategories`);
          setSubcategories(res.data || []);
        } catch (err) {
          setSubcategories([]);
        }
      };
      fetchSubs();
    } else {
      setSubcategories([]);
    }
  }, [formData.category, categories, request]);

  useEffect(() => {
    if (cost) {
      setFormData({
        year: cost.year || '',
        category: cost.category ? cost.category.toString() : '',
        subCategory: cost.subCategory ? cost.subCategory.toString() : '',
        currency: cost.currency || 'CAD',
        costType: cost.costType || '',
        serviceSoftware: cost.serviceSoftware || '',
        vendor: cost.vendor || '',
        version: cost.version || '',
        budgetMaintenance: cost.budgetMaintenance || '',
        budgetNew: cost.budgetNew || '',
        additionalCost: cost.additionalCost || ''
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
    if (!formData.version) newErrors.version = 'Major.Minor is required';

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
        subCategory: formData.subCategory || null,
        currency: formData.currency,
        costType: formData.costType,
        serviceSoftware: formData.serviceSoftware.trim(),
        vendor: formData.vendor.trim(),
        version: formData.version,
        budgetMaintenance: formData.budgetMaintenance ? parseFloat(formData.budgetMaintenance) : 0,
        budgetNew: formData.budgetNew ? parseFloat(formData.budgetNew) : 0,
        additionalCost: formData.additionalCost ? parseFloat(formData.additionalCost) : 0
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
    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-8 rounded-2xl max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-800 pb-2">
        <h2 className="text-xl font-bold text-white">
          {cost ? 'Edit G&A Cost' : 'New G&A Cost'}
        </h2>
        <select
          name="year"
          value={formData.year}
          onChange={handleChange}
          className={`w-32 px-3 py-2 border rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.year ? 'border-red-500' : 'border-slate-600'}`}
        >
          <option value="">Select Year</option>
          {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
      </div>
      {errors.year && <p className="mt-1 text-sm text-red-400">{errors.year}</p>}

      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}
      {(loading || loadingData) && <LoadingSpinner message={loading ? "Saving..." : "Loading form data..."} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">Category *</label>
          <select
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            disabled={loadingData}
            className={`w-full px-3 py-2 border rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? 'border-red-500' : 'border-slate-600'}`}
          >
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>)}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-400">{errors.category}</p>}
        </div>

        {/* Sub Category */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Sub Category {subcategories.length > 0 ? '*' : ''}
          </label>
          <select
            name="subCategory"
            value={formData.subCategory || ''}
            onChange={handleChange}
            disabled={!formData.category || subcategories.length === 0}
            className={`w-full px-3 py-2 border rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.subCategory ? 'border-red-500' : 'border-slate-600'}`}
          >
            <option value="">Select Sub Category</option>
            {subcategories.map(sub => <option key={sub.id} value={sub.id.toString()}>{sub.name}</option>)}
          </select>
          {errors.subCategory && <p className="mt-1 text-sm text-red-400">{errors.subCategory}</p>}
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

        {/* Service/Software */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">Software *</label>
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

        {/* Major.Minor (Version) */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">Major.Minor *</label>
          <select
            name="version"
            value={formData.version}
            onChange={handleChange}
            disabled={loadingData}
            className={`w-full px-3 py-2 border rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.version ? 'border-red-500' : 'border-slate-600'}`}
          >
            <option value="">Select Major.Minor</option>
            {majorMinors.map(mm => <option key={mm.id} value={mm.code}>{mm.code} {mm.description ? `- ${mm.description}` : ''}</option>)}
          </select>
          {errors.version && <p className="mt-1 text-sm text-red-400">{errors.version}</p>}
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">Currency *</label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            disabled={loadingData}
            className={`w-full px-3 py-2 border rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.currency ? 'border-red-500' : 'border-slate-600'}`}
          >
            {currencies.map(curr => <option key={curr.code} value={curr.code}>{curr.code} - {curr.name}</option>)}
          </select>
          {errors.currency && <p className="mt-1 text-sm text-red-400">{errors.currency}</p>}
        </div>

        {/* Software Maintenance */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">Software Maintenance</label>
          <input
            type="number"
            name="budgetMaintenance"
            value={formData.budgetMaintenance}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-slate-700/50 rounded-lg rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* New License */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">New License</label>
          <input
            type="number"
            name="budgetNew"
            value={formData.budgetNew}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-slate-700/50 rounded-lg rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Additional Cost (Conditional) */}
        {generalSettings?.showAdditionalCost && (
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              {generalSettings?.additionalCostFieldName || 'Additional Cost'}
            </label>
            <input
              type="number"
              name="additionalCost"
              value={formData.additionalCost}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-slate-700/50 rounded-lg rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Type (Cost Type) */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">Type *</label>
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
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-slate-700/30">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          {loading ? 'Saving...' : cost ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 disabled:opacity-50 font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
