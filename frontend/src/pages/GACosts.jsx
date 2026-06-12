import { useState } from 'react';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">G&A Costs Management</h1>
          <p className="text-gray-500">Manage and track all G&A costs across your organization</p>
        </div>
        <button
          onClick={() => {
            setSelectedCost(null);
            setShowForm(true);
          }}
          className="btn-success shadow-lg hover:shadow-xl"
        >
          ➕ New G&A Cost
        </button>
      </div>

      {/* Dashboard */}
      <GACostsDashboard refreshTrigger={refreshKey} />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
        <h2 className="text-2xl font-bold mb-4">G&A Costs List</h2>
        <GACostsTable
          onEdit={handleEdit}
          refreshTrigger={refreshKey}
        />
      </div>
    </div>
  );
}
