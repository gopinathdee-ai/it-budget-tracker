import { useState, useEffect, useContext } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { ThemeContext } from '../../contexts/ThemeContext.js';
import { useApi } from '../../hooks/useApi.js';
import { formatCurrency } from '../../utils/formatters.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import Number from '../common/Number.jsx';

const COLORS = {
  Retained: '#3b82f6',
  Distributed: '#10b981'
};

export default function GACostsDashboardSection({ selectedYear }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubCategory, setExpandedSubCategory] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const { currentTheme } = useContext(ThemeContext);
  const { request, loading } = useApi();
  const isLightTheme = currentTheme === 'light-clean';
  const textColor = isLightTheme ? 'text-slate-900' : 'text-white';
  const headerBg = isLightTheme ? 'bg-slate-100' : 'bg-slate-900/50';
  const rowBg = isLightTheme ? 'border-slate-300/50 hover:bg-slate-200/30' : 'border-slate-700/50 hover:bg-slate-700/30';
  const cardBg = isLightTheme ? 'bg-slate-100/50 border-slate-300' : 'bg-slate-800/50 border-slate-700';

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
    if (currencies.length > 0) {
      fetchData();
    }
  }, [selectedYear, currencies, request]);

  const getConversionRate = (currency) => {
    if (currency === 'CAD') return 1;
    const curr = currencies.find(c => c.code === currency);
    return curr?.conversionRate || 1;
  };

  const fetchData = async () => {
    try {
      setError(null);
      const response = await request('GET', `/api/gacosts?year=${selectedYear}&pageSize=1000`);

      const retained = { budget: 0, actual: 0, categories: {} };
      const distributed = { budget: 0, actual: 0, categories: {} };

      (response.data || []).forEach(item => {
        const type = item.costType === 'Retained' ? retained : distributed;
        const categoryName = item.categoryName || 'Unknown';
        const subCategoryName = item.subCategoryName || 'Uncategorized';
        const softwareName = item.serviceSoftware || 'Unknown';
        const rate = getConversionRate(item.currency);
        const budgetWithAdditional = ((item.budgetTotal || 0) + (item.additionalCost || 0)) * rate;

        type.budget += budgetWithAdditional;
        type.actual += item.actualTotal || 0;

        if (!type.categories[categoryName]) {
          type.categories[categoryName] = { budget: 0, actual: 0, subCategories: {} };
        }
        type.categories[categoryName].budget += budgetWithAdditional;
        type.categories[categoryName].actual += item.actualTotal || 0;

        if (!type.categories[categoryName].subCategories[subCategoryName]) {
          type.categories[categoryName].subCategories[subCategoryName] = { budget: 0, actual: 0, software: {} };
        }
        type.categories[categoryName].subCategories[subCategoryName].budget += budgetWithAdditional;
        type.categories[categoryName].subCategories[subCategoryName].actual += item.actualTotal || 0;

        if (!type.categories[categoryName].subCategories[subCategoryName].software[softwareName]) {
          type.categories[categoryName].subCategories[subCategoryName].software[softwareName] = { budget: 0, actual: 0 };
        }
        type.categories[categoryName].subCategories[subCategoryName].software[softwareName].budget += budgetWithAdditional;
        type.categories[categoryName].subCategories[subCategoryName].software[softwareName].actual += item.actualTotal || 0;
      });

      setData({ retained, distributed });
    } catch (err) {
      setError('Failed to load G&A dashboard');
    }
  };

  if (loading && !data) return <LoadingSpinner message="Loading dashboard..." />;

  const pieData = data ? [
    { name: 'Retained', value: data.retained.budget },
    { name: 'Distributed', value: data.distributed.budget }
  ] : [];

  const renderCategoryTable = (costType, categories) => {
    if (Object.keys(categories).length === 0) {
      return (
        <div className={`p-6 text-center ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>
          No data for {costType.toLowerCase()}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-4 gap-2 px-3 py-2">
          <div className={`text-left font-semibold text-xs ${isLightTheme ? 'text-slate-800' : 'text-slate-300'}`}>Category / SubCategory / Software</div>
          <div className={`text-right font-semibold text-xs ${isLightTheme ? 'text-slate-800' : 'text-slate-300'}`}>Budget (CAD)</div>
          <div className={`text-right font-semibold text-xs ${isLightTheme ? 'text-slate-800' : 'text-slate-300'}`}>Actual (CAD)</div>
          <div className={`text-right font-semibold text-xs ${isLightTheme ? 'text-slate-800' : 'text-slate-300'}`}>Variance (CAD)</div>
        </div>

        {/* Rows */}
        {Object.entries(categories).map(([categoryName, catData]) => {
          const catKey = `cat-${categoryName}`;
          return (
            <div key={categoryName}>
              {/* Category Row */}
              <div
                className={`grid grid-cols-4 gap-2 px-3 py-2 cursor-pointer border-b transition-colors ${rowBg}`}
                onClick={() => setExpandedCategory(expandedCategory === catKey ? null : catKey)}
              >
                <div className={`text-left font-semibold ${textColor} flex items-center gap-2 truncate`}>
                  {expandedCategory === catKey ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                  <span className="truncate">{categoryName}</span>
                </div>
                <div className={`text-right font-semibold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
                  <Number>{formatCurrency(catData.budget)}</Number>
                </div>
                <div className={`text-right font-semibold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
                  <Number>{formatCurrency(catData.actual)}</Number>
                </div>
                <div className={`text-right font-semibold ${catData.budget - catData.actual < 0 ? 'text-red-500' : isLightTheme ? 'text-emerald-600' : 'text-emerald-400'}`}>
                  <Number>{formatCurrency(catData.budget - catData.actual)}</Number>
                </div>
              </div>

              {/* SubCategory Rows */}
              {expandedCategory === catKey && Object.entries(catData.subCategories).map(([subCatName, subCatData]) => {
                const subCatKey = `${catKey}-${subCatName}`;
                return (
                  <div key={subCatName}>
                    {/* SubCategory Row */}
                    <div
                      className={`grid grid-cols-4 gap-2 px-3 py-2 cursor-pointer border-b text-xs transition-colors ${isLightTheme ? 'bg-slate-100/30' : 'bg-slate-800/20'} ${rowBg}`}
                      onClick={() => setExpandedSubCategory(expandedSubCategory === subCatKey ? null : subCatKey)}
                    >
                      <div className={`text-left ${textColor} flex items-center gap-2 pl-4 truncate`}>
                        {expandedSubCategory === subCatKey ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                        <span className={`flex-shrink-0 ${isLightTheme ? 'text-slate-600' : 'text-slate-500'}`}>→</span>
                        <span className="truncate font-medium">{subCatName}</span>
                      </div>
                      <div className={`text-right ${isLightTheme ? 'text-slate-700' : 'text-slate-300'}`}>
                        <Number>{formatCurrency(subCatData.budget)}</Number>
                      </div>
                      <div className={`text-right ${isLightTheme ? 'text-slate-700' : 'text-slate-300'}`}>
                        <Number>{formatCurrency(subCatData.actual)}</Number>
                      </div>
                      <div className={`text-right ${subCatData.budget - subCatData.actual < 0 ? 'text-red-500' : isLightTheme ? 'text-emerald-600' : 'text-emerald-400'}`}>
                        <Number>{formatCurrency(subCatData.budget - subCatData.actual)}</Number>
                      </div>
                    </div>

                    {/* Software/Service Rows */}
                    {expandedSubCategory === subCatKey && Object.entries(subCatData.software).map(([softwareName, softwareData], idx) => (
                      <div key={softwareName} className={`grid grid-cols-4 gap-2 px-3 py-2 text-xs transition-colors ${isLightTheme ? 'bg-slate-100/40 hover:bg-slate-100/60' : 'bg-slate-800/20 hover:bg-slate-800/40'} ${idx > 0 ? 'mt-1' : ''}`}>
                        <div className={`text-left ${textColor} flex items-center gap-2 pl-8 truncate`}>
                          <span className={`flex-shrink-0 text-xs ${isLightTheme ? 'text-slate-500' : 'text-slate-600'}`}>•</span>
                          <span className="truncate">{softwareName}</span>
                        </div>
                        <div className={`text-right ${isLightTheme ? 'text-slate-700' : 'text-slate-300'}`}>
                          <Number>{formatCurrency(softwareData.budget)}</Number>
                        </div>
                        <div className={`text-right ${isLightTheme ? 'text-slate-700' : 'text-slate-300'}`}>
                          <Number>{formatCurrency(softwareData.actual)}</Number>
                        </div>
                        <div className={`text-right ${softwareData.budget - softwareData.actual < 0 ? 'text-red-500' : isLightTheme ? 'text-emerald-600' : 'text-emerald-400'}`}>
                          <Number>{formatCurrency(softwareData.budget - softwareData.actual)}</Number>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      {data && (
        <>
          {/* Retained vs Distributed Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <div className={`${cardBg} p-6 rounded-2xl shadow-lg border`}>
              <h3 className={`text-sm font-semibold mb-4 ${textColor}`}>Cost Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: isLightTheme ? '#f1f5f9' : '#1e293b', border: `1px solid ${isLightTheme ? '#cbd5e1' : '#475569'}`, color: textColor }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Retained Summary Card */}
            <div className={`${cardBg} p-6 rounded-2xl shadow-lg border bg-gradient-to-br from-blue-900/30 to-blue-800/20`}>
              <h3 className={`text-sm font-semibold mb-4 text-blue-300`}>Retained (CAD)</h3>
              <div className="space-y-3">
                <div>
                  <p className={`text-xs ${isLightTheme ? 'text-slate-600' : 'text-slate-400'} mb-1`}>Budget</p>
                  <p className={`text-2xl font-bold ${textColor}`}><Number>{formatCurrency(data.retained.budget)}</Number></p>
                </div>
                <div>
                  <p className={`text-xs ${isLightTheme ? 'text-slate-600' : 'text-slate-400'} mb-1`}>Actual</p>
                  <p className={`text-2xl font-bold ${textColor}`}><Number>{formatCurrency(data.retained.actual)}</Number></p>
                </div>
                <div>
                  <p className={`text-xs ${isLightTheme ? 'text-slate-600' : 'text-slate-400'} mb-1`}>Variance</p>
                  <p className={`text-2xl font-bold ${data.retained.budget - data.retained.actual < 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                    <Number>{formatCurrency(data.retained.budget - data.retained.actual)}</Number>
                  </p>
                </div>
              </div>
            </div>

            {/* Distributed Summary Card */}
            <div className={`${cardBg} p-6 rounded-2xl shadow-lg border bg-gradient-to-br from-emerald-900/30 to-emerald-800/20`}>
              <h3 className={`text-sm font-semibold mb-4 text-emerald-300`}>Distributed (CAD)</h3>
              <div className="space-y-3">
                <div>
                  <p className={`text-xs ${isLightTheme ? 'text-slate-600' : 'text-slate-400'} mb-1`}>Budget</p>
                  <p className={`text-2xl font-bold ${textColor}`}><Number>{formatCurrency(data.distributed.budget)}</Number></p>
                </div>
                <div>
                  <p className={`text-xs ${isLightTheme ? 'text-slate-600' : 'text-slate-400'} mb-1`}>Actual</p>
                  <p className={`text-2xl font-bold ${textColor}`}><Number>{formatCurrency(data.distributed.actual)}</Number></p>
                </div>
                <div>
                  <p className={`text-xs ${isLightTheme ? 'text-slate-600' : 'text-slate-400'} mb-1`}>Variance</p>
                  <p className={`text-2xl font-bold ${data.distributed.budget - data.distributed.actual < 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                    <Number>{formatCurrency(data.distributed.budget - data.distributed.actual)}</Number>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Retained Category Breakdown */}
          <div className={`${cardBg} p-6 rounded-2xl shadow-lg border`}>
            <h3 className={`text-sm font-semibold mb-4 ${textColor}`}>Retained - Category Breakdown</h3>
            {renderCategoryTable('Retained', data.retained.categories)}
          </div>

          {/* Distributed Category Breakdown */}
          <div className={`${cardBg} p-6 rounded-2xl shadow-lg border`}>
            <h3 className={`text-sm font-semibold mb-4 ${textColor}`}>Distributed - Category Breakdown</h3>
            {renderCategoryTable('Distributed', data.distributed.categories)}
          </div>
        </>
      )}
    </div>
  );
}
