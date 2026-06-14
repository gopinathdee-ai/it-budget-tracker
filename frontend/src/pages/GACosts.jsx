import { useState } from 'react';
import { FaPlus, FaSync } from 'react-icons/fa';
import GACostsTable from '../components/GACosts/GACostsTable.jsx';
import GACostsForm from '../components/GACosts/GACostsForm.jsx';
import GACostsDashboard from '../components/GACosts/GACostsDashboard.jsx';
import GACostsCategoryBreakdown from '../components/GACosts/GACostsCategoryBreakdown.jsx';

export default function GACostsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCost, setSelectedCost] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  return (
    <div className="space-y-4">
      {/* Header with Year Selector & Refresh */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">G&A Costs Management</h1>
          <p className="text-xs text-slate-400">Manage and track all G&A costs across your organization</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-600 rounded-md bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            {[2024, 2025, 2026, 2027].map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium transition-all text-sm"
          >
            <FaSync /> Refresh
          </button>
          <button
            onClick={() => {
              setSelectedCost(null);
              setShowForm(true);
            }}
            className="btn-success shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <FaPlus /> New G&A Cost
          </button>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <GACostsDashboard selectedYear={selectedYear} refreshTrigger={refreshKey} />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
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
        <h2 className="text-lg font-bold mb-3 text-white">G&A Costs List</h2>
        <GACostsTable
          onEdit={handleEdit}
          onDelete={handleDelete}
          refreshTrigger={refreshKey}
          selectedYear={selectedYear}
        />
      </div>

      {/* Category Breakdown */}
      <div>
        <GACostsCategoryBreakdown
          selectedYear={selectedYear}
          refreshTrigger={refreshKey}
        />
      </div>
    </div>
  );
}
