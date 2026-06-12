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
        <h2 className="text-2xl font-bold text-white">G&A Costs Summary</h2>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-slate-600 rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium transition-all"
          >
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6 bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-600/30 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-300 mb-2 uppercase tracking-wide">Total Budget</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalBudget)}</p>
              </div>
              <FaBriefcase className="text-4xl text-blue-400 opacity-60" />
            </div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-emerald-900/40 to-emerald-800/40 border-emerald-600/30 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-300 mb-2 uppercase tracking-wide">Total Actual</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalActual)}</p>
              </div>
              <FaCheck className="text-4xl text-emerald-400 opacity-60" />
            </div>
          </div>
          <div className={`card p-6 bg-gradient-to-br ${summary.variance >= 0 ? 'from-emerald-900/40 to-emerald-800/40 border-emerald-600/30' : 'from-red-900/40 to-red-800/40 border-red-600/30'} shadow-lg hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-2 uppercase tracking-wide" style={{ color: summary.variance >= 0 ? '#a7f3d0' : '#fca5a5' }}>
                  Variance
                </p>
                <p className={`text-3xl font-bold text-white`}>
                  {formatCurrency(summary.variance)}
                </p>
              </div>
              {summary.variance >= 0 ? (
                <FaArrowUp className="text-4xl text-emerald-400 opacity-60" />
              ) : (
                <FaArrowDown className="text-4xl text-red-400 opacity-60" />
              )}
            </div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-600/30 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-300 mb-2 uppercase tracking-wide">Utilization</p>
                <p className="text-3xl font-bold text-white">{formatPercent(summary.utilization)}</p>
              </div>
              <FaChartBar className="text-4xl text-purple-400 opacity-60" />
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown Table */}
      {summary && Object.keys(summary.byCategory).length > 0 && (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-white">By Category</h3>
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-slate-300">Category</th>
                <th className="p-3 text-right text-sm font-semibold text-slate-300">Budget</th>
                <th className="p-3 text-right text-sm font-semibold text-slate-300">Actual</th>
                <th className="p-3 text-right text-sm font-semibold text-slate-300">Variance</th>
                <th className="p-3 text-right text-sm font-semibold text-slate-300">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.byCategory).map(([category, data]) => {
                const variance = data.budget - data.actual;
                const utilization = data.budget > 0 ? (data.actual / data.budget * 100) : 0;
                return (
                  <tr key={category} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="p-3 text-sm font-medium text-white">{category}</td>
                    <td className="p-3 text-right text-sm text-slate-300">{formatCurrency(data.budget)}</td>
                    <td className="p-3 text-right text-sm text-slate-300">{formatCurrency(data.actual)}</td>
                    <td className={`p-3 text-right text-sm font-semibold ${variance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(variance)}
                    </td>
                    <td className="p-3 text-right text-sm text-slate-300">{formatPercent(utilization)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {summary && Object.keys(summary.byCategory).length === 0 && (
        <div className="p-8 text-center text-slate-400 bg-slate-800/30 rounded-lg border border-slate-700">
          No G&A costs data for {selectedYear}
        </div>
      )}
    </div>
  );
}
