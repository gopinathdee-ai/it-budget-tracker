import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import GACostsTable from '../components/GACosts/GACostsTable.jsx';
import GACostsForm from '../components/GACosts/GACostsForm.jsx';
import GACostsDashboard from '../components/GACosts/GACostsDashboard.jsx';

export default function GACostsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCost, setSelectedCost] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">G&A Costs Management</h1>
          <p className="text-xs text-slate-400">Manage and track all G&A costs across your organization</p>
        </div>
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

      {/* Dashboard */}
      <GACostsDashboard refreshTrigger={refreshKey} />

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
          refreshTrigger={refreshKey}
        />
      </div>
    </div>
  );
}
