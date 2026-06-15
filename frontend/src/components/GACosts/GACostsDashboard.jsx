import { useState, useEffect } from 'react';
import { FaBriefcase, FaCheck, FaArrowUp, FaArrowDown, FaChartBar, FaSync } from 'react-icons/fa';
import { useApi } from '../../hooks/useApi.js';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import Number from '../common/Number.jsx';

const YEARS = [2024, 2025, 2026, 2027];

export default function GACostsDashboard({ selectedYear, refreshTrigger }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const { request, loading } = useApi();

  useEffect(() => {
    fetchData();
  }, [selectedYear, refreshTrigger, request]);

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

      {/* Title */}
      <h2 className="text-lg font-bold text-white">G&A Costs Summary</h2>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-6 bg-gradient-to-br from-blue-900/50 to-blue-800/40 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-300 mb-1 uppercase tracking-wide">Total Budget</p>
                <p className="text-xl font-bold text-white truncate"><Number>{formatCurrency(summary.totalBudget)}</Number></p>
              </div>
              <FaBriefcase className="text-2xl text-blue-400 opacity-60 flex-shrink-0 mt-1" />
            </div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-emerald-900/50 to-emerald-800/40 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-300 mb-1 uppercase tracking-wide">Total Actual</p>
                <p className="text-xl font-bold text-white truncate"><Number>{formatCurrency(summary.totalActual)}</Number></p>
              </div>
              <FaCheck className="text-2xl text-emerald-400 opacity-60 flex-shrink-0 mt-1" />
            </div>
          </div>
          <div className={`card p-6 bg-gradient-to-br ${summary.variance >= 0 ? 'from-emerald-900/50 to-emerald-800/40' : 'from-red-900/50 to-red-800/40'} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: summary.variance >= 0 ? '#a7f3d0' : '#fca5a5' }}>
                  Variance
                </p>
                <p className="text-xl font-bold text-white truncate">
                  <Number>{formatCurrency(summary.variance)}</Number>
                </p>
              </div>
              {summary.variance >= 0 ? (
                <FaArrowUp className="text-2xl text-emerald-400 opacity-60 flex-shrink-0 mt-1" />
              ) : (
                <FaArrowDown className="text-2xl text-red-400 opacity-60 flex-shrink-0 mt-1" />
              )}
            </div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-purple-900/50 to-purple-800/40 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-purple-300 mb-1 uppercase tracking-wide">Utilization</p>
                <p className="text-xl font-bold text-white truncate"><Number>{formatPercent(summary.utilization)}</Number></p>
              </div>
              <FaChartBar className="text-2xl text-purple-400 opacity-60 flex-shrink-0 mt-1" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
