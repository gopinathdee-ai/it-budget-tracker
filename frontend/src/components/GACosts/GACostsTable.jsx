import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

const CATEGORIES = ['Business Apps', 'IT Services', 'Other'];
const COST_TYPES = ['Retained', 'Distributed'];
const YEARS = [2024, 2025, 2026, 2027];

export default function GACostsTable({ onEdit, onDelete, refreshTrigger }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({ year: '', category: '', costType: '' });
  const [error, setError] = useState(null);
  const { request, loading } = useApi();

  useEffect(() => {
    fetchData();
  }, [page, filters, refreshTrigger]);

  const fetchData = async () => {
    try {
      setError(null);
      const params = new URLSearchParams({
        page,
        pageSize,
        ...(filters.year && { year: filters.year }),
        ...(filters.category && { category: filters.category }),
        ...(filters.costType && { costType: filters.costType })
      });

      const response = await request('GET', `/api/gacosts?${params.toString()}`);
      setData(response.data || []);
    } catch (err) {
      setError('Failed to load G&A costs');
    }
  };

  const handleFilterChange = (field, value) => {
    setPage(1);
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setPage(1);
    setFilters({ year: '', category: '', costType: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this G&A cost?')) {
      try {
        await request('DELETE', `/api/gacosts/${id}`);
        fetchData();
        onDelete?.(id);
      } catch (err) {
        setError('Failed to delete G&A cost');
      }
    }
  };

  if (loading && data.length === 0) return <LoadingSpinner message="Loading G&A costs..." />;

  return (
    <div className="space-y-4">
      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost Type</label>
            <select
              value={filters.costType}
              onChange={(e) => handleFilterChange('costType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {COST_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleClearFilters}
          className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 text-sm"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No G&A costs found. Try adjusting your filters.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-sm font-semibold">Year</th>
                <th className="p-3 text-left text-sm font-semibold">Category</th>
                <th className="p-3 text-left text-sm font-semibold">Type</th>
                <th className="p-3 text-left text-sm font-semibold">Service/Software</th>
                <th className="p-3 text-left text-sm font-semibold">Vendor</th>
                <th className="p-3 text-right text-sm font-semibold">Budget</th>
                <th className="p-3 text-right text-sm font-semibold">Actual</th>
                <th className="p-3 text-right text-sm font-semibold">Variance</th>
                <th className="p-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => {
                const variance = (item.budgetTotal || 0) - (item.actualTotal || 0);
                return (
                  <tr key={item.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                    <td className="p-3 text-sm">{item.year}</td>
                    <td className="p-3 text-sm">{item.category}</td>
                    <td className="p-3 text-sm">{item.costType}</td>
                    <td className="p-3 text-sm">{item.serviceSoftware}</td>
                    <td className="p-3 text-sm">{item.vendor}</td>
                    <td className="p-3 text-right text-sm">{formatCurrency(item.budgetTotal)}</td>
                    <td className="p-3 text-right text-sm">{formatCurrency(item.actualTotal)}</td>
                    <td className={`p-3 text-right text-sm font-semibold ${variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(variance)}
                    </td>
                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => onEdit?.(item)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Page {page} | {data.length} items
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={data.length < pageSize}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
