import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import Number from '../common/Number.jsx';

export default function GACostsCategoryBreakdown({ selectedYear, refreshTrigger }) {
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

      setSummary({
        byCategory
      });
    } catch (err) {
      setError('Failed to load category breakdown');
    }
  };

  if (loading) return <LoadingSpinner message="Loading..." />;

  return (
    <div className="space-y-6">
      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      {/* Category Breakdown Table */}
      {summary && Object.keys(summary.byCategory).length > 0 && (
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 shadow-lg">
          <h3 className="text-sm font-semibold mb-3 text-white">By Category</h3>
          <table className="w-full text-xs">
            <thead className="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="p-2 text-left font-semibold text-slate-300">Category</th>
                <th className="p-2 text-right font-semibold text-slate-300">Budget</th>
                <th className="p-2 text-right font-semibold text-slate-300">Actual</th>
                <th className="p-2 text-right font-semibold text-slate-300">Variance</th>
                <th className="p-2 text-right font-semibold text-slate-300">Util %</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.byCategory).map(([category, data]) => {
                const variance = data.budget - data.actual;
                const utilization = data.budget > 0 ? (data.actual / data.budget * 100) : 0;
                return (
                  <tr key={category} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-2 font-medium text-white">{category}</td>
                    <td className="p-2 text-right text-slate-300"><Number>{formatCurrency(data.budget)}</Number></td>
                    <td className="p-2 text-right text-slate-300"><Number>{formatCurrency(data.actual)}</Number></td>
                    <td className={`p-2 text-right font-semibold ${variance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      <Number>{formatCurrency(variance)}</Number>
                    </td>
                    <td className="p-2 text-right text-slate-300"><Number>{formatPercent(utilization)}</Number></td>
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
