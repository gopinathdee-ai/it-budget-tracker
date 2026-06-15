import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaLock, FaShare } from 'react-icons/fa';
import { useApi } from '../../hooks/useApi.js';
import { formatCurrency } from '../../utils/formatters.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import Number from '../common/Number.jsx';

const CATEGORIES = ['Business Apps', 'IT Services', 'Other'];
const COST_TYPES = ['Retained', 'Distributed'];
const YEARS = [2024, 2025, 2026, 2027];

export default function GACostsTable({ onEdit, onDelete, refreshTrigger, selectedYear }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [filters, setFilters] = useState({ year: selectedYear?.toString() || '', category: '', costType: '' });
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const { request, loading } = useApi();

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await request('GET', '/api/config/currencies');
        setCurrencies(response.data || []);
      } catch (err) {
        console.error('Failed to load currencies');
      }
    };
    fetchCurrencies();
  }, [request]);

  const fetchData = useCallback(async () => {
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
  }, [page, filters, pageSize, request]);

  useEffect(() => {
    if (selectedYear) {
      setFilters(prev => ({ ...prev, year: selectedYear.toString() }));
      setPage(1);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleFilterChange = (field, value) => {
    setPage(1);
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setPage(1);
    setFilters({ year: '', category: '', costType: '' });
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await request('DELETE', `/api/gacosts/${deleteConfirm}`);
      setDeleteConfirm(null);
      fetchData();
      onDelete?.(deleteConfirm);
    } catch (err) {
      setError('Failed to delete G&A cost');
    } finally {
      setDeleting(false);
    }
  };

  const getConversionRate = (currency) => {
    if (currency === 'CAD') return 1;
    const curr = currencies.find(c => c.code === currency);
    return curr?.conversionRateToCAD || 1;
  };

  if (loading && data.length === 0) return <LoadingSpinner message="Loading G&A costs..." />;

  return (
    <div className="space-y-4">
      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      {/* Filters */}
      <div className="card p-6 bg-slate-800/40 rounded-2xl shadow-lg mb-6 border border-slate-700/20">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <FaSearch className="text-sm text-blue-400" /> Filters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Year</label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-slate-700/40 rounded bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-slate-700/40 rounded bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Cost Type</label>
            <select
              value={filters.costType}
              onChange={(e) => handleFilterChange('costType', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-slate-700/40 rounded bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {COST_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleClearFilters}
          className="mt-2 px-3 py-1.5 text-xs bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors font-medium"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden shadow-2xl rounded-2xl bg-slate-800/50">
        {data.length === 0 ? (
          <div className="p-8 text-center">
            <FaSearch className="text-3xl mb-3 mx-auto text-slate-600" />
            <p className="text-slate-400 text-sm">No G&A costs found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 text-white sticky top-0 backdrop-blur-sm">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Category</th>
                  <th className="px-3 py-2 text-left font-semibold">Vendor</th>
                  <th className="px-3 py-2 text-left font-semibold">Service/Software</th>
                  <th className="px-3 py-2 text-center font-semibold">Currency</th>
                  <th className="px-3 py-2 text-right font-semibold">Budget</th>
                  <th className="px-3 py-2 text-right font-semibold">Budget (CAD)</th>
                  <th className="px-3 py-2 text-right font-semibold">Actual</th>
                  <th className="px-3 py-2 text-right font-semibold">Variance</th>
                  <th className="px-3 py-2 text-center font-semibold">Type</th>
                  <th className="px-3 py-2 text-center font-semibold">Actions</th>
                </tr>
              </thead>
            <tbody>
              {data.map((item, idx) => {
                const variance = (item.budgetTotal || 0) - (item.actualTotal || 0);
                const rate = getConversionRate(item.currency);
                const budgetCAD = (item.budgetTotal || 0) * rate;
                return (
                  <tr key={item.id} className={`border-b border-slate-700/30 transition-all duration-200 ${idx % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/10'} hover:bg-slate-700/40 hover:shadow-inner`}>
                    <td className="px-3 py-2 text-slate-300">{item.category}</td>
                    <td className="px-3 py-2 text-slate-300">{item.vendor}</td>
                    <td className="px-3 py-2 text-slate-300 truncate" title={item.serviceSoftware}>{item.serviceSoftware}</td>
                    <td className="px-3 py-2 text-center text-slate-300 font-medium">{item.currency}</td>
                    <td className="px-3 py-2 text-right font-semibold text-white"><Number>{formatCurrency(item.budgetTotal)}</Number></td>
                    <td className="px-3 py-2 text-right font-semibold text-white"><Number>{formatCurrency(budgetCAD)}</Number></td>
                    <td className="px-3 py-2 text-right font-semibold text-white"><Number>{formatCurrency(item.actualTotal)}</Number></td>
                    <td className={`px-3 py-2 text-right font-bold ${variance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      <Number>{formatCurrency(variance)}</Number>
                    </td>
                    <td className="px-3 py-2 text-center" title={item.costType}>
                      {item.costType === 'Retained' ? (
                        <FaLock className="text-blue-400 inline-block" title="Retained" />
                      ) : (
                        <FaShare className="text-emerald-400 inline-block" title="Distributed" />
                      )}
                    </td>
                    <td className="px-3 py-2 text-center space-x-2">
                      <button
                        onClick={() => onEdit?.(item)}
                        title="Edit"
                        className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors inline-flex items-center"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        title="Delete"
                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors inline-flex items-center"
                      >
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}

        {/* Pagination */}
        {data.length > 0 && (
        <div className="flex justify-between items-center mt-6 p-4 bg-slate-800/30 rounded-xl shadow-md">
          <div className="text-xs font-medium text-slate-400">
            Page <span className="font-bold text-white"><Number>{page}</Number></span> • <span className="font-bold text-white"><Number>{data.length}</Number></span> items
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded text-xs hover:bg-slate-600 disabled:opacity-50 transition-colors font-medium inline-flex items-center gap-1 h-8"
            >
              <FaChevronLeft size={12} /> Prev
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={data.length < pageSize}
              className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded text-xs hover:bg-slate-600 disabled:opacity-50 transition-colors font-medium inline-flex items-center gap-1 h-8"
            >
              Next <FaChevronRight size={12} />
            </button>
          </div>
        </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete G&A Cost"
        message="This action cannot be undone. Are you sure you want to delete this cost?"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
