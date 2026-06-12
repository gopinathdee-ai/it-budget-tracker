import { useState, useEffect } from 'react';
import { FaBriefcase, FaCheck, FaArrowUp, FaArrowDown, FaChartBar, FaSync } from 'react-icons/fa';
import { useApi } from '../../hooks/useApi.js';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

const YEARS = [2024, 2025, 2026, 2027];

export default function GACostsDashboard({ refreshTrigger }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const { request, loading } = useApi();

  useEffect(() => {
    fetchData();
  }, [selectedYear, refreshTrigger]);

  const fetchData = async () => {
    try {
      setError(null);
      const response = await request('GET', `/api/gacosts?year=${selectedYear}&pageSize=1000`);

      let totalBudget = 0;
      let totalActual = 0;
      const byCategory = {};

      (response.data || []).forEach(item => {
        totalBudget += item.budgetTotal || 0;
        totalActual += item.actualTotal || 0;

        if (!byCategory[item.category]) {
          byCategory[item.category] = { budget: 0, actual: 0 };
        }
        byCategory[item.category].budget += item.budgetTotal || 0;
        byCategory[item.category].actual += item.actualTotal || 0;
      });

      const variance = totalBudget - totalActual;
      const utilization = totalBudget > 0 ? (totalActual / totalBudget * 100) : 0;

      setSummary({
        totalBudget,
        totalActual,
        variance,
        utilization,
        byCategory
      });
    } catch (err) {
      setError('Failed to load G&A costs summary');
    }
  };

  if (loading) return <LoadingSpinner message="Loading summary..." />;

  return (
    <div className="space-y-6">
      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">G&A Costs Summary</h2>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">Total Budget</p>
                <p className="text-3xl font-bold text-blue-900">{formatCurrency(summary.totalBudget)}</p>
              </div>
              <FaBriefcase className="text-4xl text-blue-600 opacity-80" />
            </div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-600 mb-2 uppercase tracking-wide">Total Actual</p>
                <p className="text-3xl font-bold text-green-900">{formatCurrency(summary.totalActual)}</p>
              </div>
              <FaCheck className="text-4xl text-green-600 opacity-80" />
            </div>
          </div>
          <div className={`card p-6 bg-gradient-to-br ${summary.variance >= 0 ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'} shadow-md hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-2 uppercase tracking-wide" style={{ color: summary.variance >= 0 ? '#047857' : '#dc2626' }}>
                  Variance
                </p>
                <p className={`text-3xl font-bold ${summary.variance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {formatCurrency(summary.variance)}
                </p>
              </div>
              {summary.variance >= 0 ? (
                <FaArrowUp className="text-4xl text-green-600 opacity-80" />
              ) : (
                <FaArrowDown className="text-4xl text-red-600 opacity-80" />
              )}
            </div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-600 mb-2 uppercase tracking-wide">Utilization</p>
                <p className="text-3xl font-bold text-purple-900">{formatPercent(summary.utilization)}</p>
              </div>
              <FaChartBar className="text-4xl text-purple-600 opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown Table */}
      {summary && Object.keys(summary.byCategory).length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow">
          <h3 className="text-xl font-semibold mb-4">By Category</h3>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left text-sm font-semibold">Category</th>
                <th className="p-3 text-right text-sm font-semibold">Budget</th>
                <th className="p-3 text-right text-sm font-semibold">Actual</th>
                <th className="p-3 text-right text-sm font-semibold">Variance</th>
                <th className="p-3 text-right text-sm font-semibold">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.byCategory).map(([category, data]) => {
                const variance = data.budget - data.actual;
                const utilization = data.budget > 0 ? (data.actual / data.budget * 100) : 0;
                return (
                  <tr key={category} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm font-medium">{category}</td>
                    <td className="p-3 text-right text-sm">{formatCurrency(data.budget)}</td>
                    <td className="p-3 text-right text-sm">{formatCurrency(data.actual)}</td>
                    <td className={`p-3 text-right text-sm font-semibold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(variance)}
                    </td>
                    <td className="p-3 text-right text-sm">{formatPercent(utilization)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {summary && Object.keys(summary.byCategory).length === 0 && (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          No G&A costs data for {selectedYear}
        </div>
      )}
    </div>
  );
}
