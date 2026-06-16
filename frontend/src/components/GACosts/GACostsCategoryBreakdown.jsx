import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext.js';
import { useApi } from '../../hooks/useApi.js';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import Number from '../common/Number.jsx';

export default function GACostsCategoryBreakdown({ selectedYear, refreshTrigger }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const { currentTheme } = useContext(ThemeContext);
  const { request, loading } = useApi();
  const isLightTheme = currentTheme === 'light-clean';
  const textColor = isLightTheme ? 'text-slate-900' : 'text-white';
  const bgColor = isLightTheme ? 'bg-slate-100/50 border-slate-300' : 'bg-slate-800/50 border-slate-700';
  const headerBg = isLightTheme ? 'bg-slate-200/50' : 'bg-slate-900/50 border-slate-700';
  const rowBg = isLightTheme ? 'border-slate-300/50 hover:bg-slate-200/30' : 'border-slate-700/50 hover:bg-slate-700/30';

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

  useEffect(() => {
    fetchData();
  }, [selectedYear, refreshTrigger, request]);

  const getConversionRate = (currency) => {
    if (currency === 'CAD') return 1;
    const curr = currencies.find(c => c.code === currency);
    return curr?.conversionRate || 1;
  };

  const fetchData = async () => {
    try {
      setError(null);
      const response = await request('GET', `/api/gacosts?year=${selectedYear}&pageSize=1000`);

      let totalBudget = 0;
      let totalActual = 0;
      const byCategory = {};

      (response.data || []).forEach(item => {
        const rate = getConversionRate(item.currency);
        const budgetCAD = (item.budgetTotal || 0) * rate;
        const actualCAD = (item.actualTotal || 0) * rate;

        totalBudget += budgetCAD;
        totalActual += actualCAD;

        const categoryName = item.categoryName || 'Unknown';
        if (!byCategory[categoryName]) {
          byCategory[categoryName] = { budget: 0, actual: 0 };
        }
        byCategory[categoryName].budget += budgetCAD;
        byCategory[categoryName].actual += actualCAD;
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
        <div className={`${bgColor} p-3 rounded-lg border shadow-lg`}>
          <h3 className={`text-sm font-semibold mb-3 ${textColor}`}>By Category</h3>
          <table className="w-full text-xs">
            <thead className={`${headerBg} border-b`}>
              <tr>
                <th className={`p-2 text-left font-semibold ${isLightTheme ? 'text-slate-800' : 'text-slate-300'}`}>Category</th>
                <th className={`p-2 text-right font-semibold ${isLightTheme ? 'text-slate-800' : 'text-slate-300'}`}>Budget</th>
                <th className={`p-2 text-right font-semibold ${isLightTheme ? 'text-slate-800' : 'text-slate-300'}`}>Actual</th>
                <th className={`p-2 text-right font-semibold ${isLightTheme ? 'text-slate-800' : 'text-slate-300'}`}>Variance</th>
                <th className={`p-2 text-right font-semibold ${isLightTheme ? 'text-slate-800' : 'text-slate-300'}`}>Util %</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.byCategory).map(([category, data]) => {
                const variance = data.budget - data.actual;
                const utilization = data.budget > 0 ? (data.actual / data.budget * 100) : 0;
                return (
                  <tr key={category} className={`border-b ${rowBg}`}>
                    <td className={`p-2 font-medium ${textColor}`}>{category}</td>
                    <td className={`p-2 text-right ${isLightTheme ? 'text-slate-900' : 'text-slate-300'}`}><Number>{formatCurrency(data.budget)}</Number></td>
                    <td className={`p-2 text-right ${isLightTheme ? 'text-slate-900' : 'text-slate-300'}`}><Number>{formatCurrency(data.actual)}</Number></td>
                    <td className={`p-2 text-right font-semibold ${variance >= 0 ? (isLightTheme ? 'text-emerald-600' : 'text-emerald-400') : 'text-red-500'}`}>
                      <Number>{formatCurrency(variance)}</Number>
                    </td>
                    <td className={`p-2 text-right ${isLightTheme ? 'text-slate-900' : 'text-slate-300'}`}><Number>{formatPercent(utilization)}</Number></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {summary && Object.keys(summary.byCategory).length === 0 && (
        <div className={`p-8 text-center ${isLightTheme ? 'text-slate-600 bg-slate-100/30 border-slate-300' : 'text-slate-400 bg-slate-800/30 border-slate-700'} rounded-lg border`}>
          No G&A costs data for {selectedYear}
        </div>
      )}
    </div>
  );
}
