import { useState, useContext } from 'react';
import { FaPlus, FaSync } from 'react-icons/fa';
import { ThemeContext } from '../contexts/ThemeContext.js';
import { THEMES } from '../utils/themes.js';
import GACostsTable from '../components/GACosts/GACostsTable.jsx';
import GACostsForm from '../components/GACosts/GACostsForm.jsx';
import GACostsDashboard from '../components/GACosts/GACostsDashboard.jsx';

export default function GACostsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCost, setSelectedCost] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { currentTheme } = useContext(ThemeContext);
  const themeColors = THEMES[currentTheme];

  const handleEdit = (cost) => {
    setSelectedCost(cost);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedCost(null);
    setRefreshKey(k => k + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedCost(null);
  };

  const handleDelete = () => {
    setRefreshKey(k => k + 1);
  };

  const isLightTheme = currentTheme === 'light-clean';
  const textColor = isLightTheme ? 'text-slate-900' : 'text-white';
  const textMuted = isLightTheme ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className="space-y-8">
      {/* Header with Year Selector & Refresh */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${textColor} mb-1`}>G&A Costs Management</h1>
          <p className={`text-xs ${textMuted}`}>Manage and track all G&A costs across your organization</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium ${isLightTheme ? 'border-slate-400 bg-white text-slate-900' : 'border-slate-600 bg-slate-900 text-white'}`}
          >
            {[2024, 2025, 2026, 2027].map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className={`px-3 py-2.5 bg-gradient-to-r ${themeColors?.accentColor} text-white rounded-lg hover:opacity-90 flex items-center gap-0 font-semibold transition-all duration-200 hover:shadow-lg active:scale-95 text-sm`}
            title="Refresh"
          >
            <FaSync />
          </button>
          <button
            onClick={() => {
              setSelectedCost(null);
              setShowForm(true);
            }}
            className={`px-4 py-2.5 bg-gradient-to-r ${themeColors?.accentColor} text-white rounded-lg hover:opacity-90 flex items-center gap-2 font-semibold transition-all duration-200 hover:shadow-lg active:scale-95 text-sm`}
          >
            <FaPlus /> New G&A Cost
          </button>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <GACostsDashboard selectedYear={selectedYear} refreshTrigger={refreshKey} />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <GACostsForm
              cost={selectedCost}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div>
        <h2 className={`text-lg font-bold mb-3 ${textColor}`}>G&A Costs List</h2>
        <GACostsTable
          onEdit={handleEdit}
          onDelete={handleDelete}
          refreshTrigger={refreshKey}
          selectedYear={selectedYear}
        />
      </div>
    </div>
  );
}
