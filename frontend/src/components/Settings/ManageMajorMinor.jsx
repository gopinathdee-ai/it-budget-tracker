import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmDialog from '../common/ConfirmDialog';

export default function ManageMajorMinor() {
  const [majorMinors, setMajorMinors] = useState([]);
  const [newCode, setNewCode] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editCode, setEditCode] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const { request, loading } = useApi();

  useEffect(() => {
    fetchMajorMinors();
  }, []);

  const fetchMajorMinors = async () => {
    try {
      setError(null);
      const response = await request('GET', '/api/config/majorminor');
      setMajorMinors(response.data || []);
    } catch (err) {
      setError('Failed to load Major.Minor codes');
    }
  };

  const handleAddMajorMinor = async (e) => {
    e.preventDefault();
    if (!newCode.trim()) {
      setError('Major.Minor code is required');
      return;
    }

    try {
      setError(null);
      await request('POST', '/api/config/majorminor', {
        code: newCode.trim(),
        description: newDescription.trim() || null
      });
      setSuccess('Major.Minor code added successfully!');
      setNewCode('');
      setNewDescription('');
      fetchMajorMinors();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message || 'Failed to add Major.Minor code');
    }
  };

  const handleDeleteMajorMinor = async (id) => {
    try {
      setError(null);
      await request('DELETE', `/api/config/majorminor/${id}`);
      setSuccess('Major.Minor code deleted successfully!');
      setDeleteConfirm({ isOpen: false, id: null });
      fetchMajorMinors();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to delete Major.Minor code');
    }
  };

  const handleEditMajorMinor = async (id) => {
    if (!editCode.trim()) {
      setError('Major.Minor code is required');
      return;
    }

    try {
      setError(null);
      await request('PUT', `/api/config/majorminor/${id}`, {
        code: editCode.trim(),
        description: editDescription.trim() || null
      });
      setSuccess('Major.Minor code updated successfully!');
      setEditingId(null);
      setEditCode('');
      setEditDescription('');
      fetchMajorMinors();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update Major.Minor code');
    }
  };

  if (loading) return <LoadingSpinner message="Loading Major.Minor codes..." />;

  return (
    <div className="space-y-6">
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Major.Minor Code"
        message="Are you sure you want to delete this code?"
        isDangerous={true}
        onConfirm={() => handleDeleteMajorMinor(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />
      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-white mb-6">Add New Major.Minor Code</h2>

        <form onSubmit={handleAddMajorMinor} className="flex gap-3 mb-6">
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Major.Minor code (e.g., 10000.50000)"
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)"
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium transition-all whitespace-nowrap"
          >
            <FaPlus /> Add
          </button>
        </form>

        {success && (
          <div className="p-4 bg-emerald-900/30 border border-emerald-600 rounded-lg mb-6 animate-pulse">
            <p className="text-emerald-400 text-sm font-medium">✓ {success}</p>
          </div>
        )}

        <h3 className="text-lg font-semibold text-white mb-4">Existing Codes</h3>

        <div className="space-y-2">
          {majorMinors.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No Major.Minor codes yet. Add one to get started!</p>
          ) : (
            majorMinors.map(mm => (
              <div key={mm.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg hover:bg-slate-900 transition-all">
                {editingId === mm.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditMajorMinor(mm.id)}
                        className="px-4 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-700 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-white font-mono font-bold flex-shrink-0">{mm.code}</div>
                    <div className="text-slate-400 text-sm flex-1 truncate">{mm.description || '-'}</div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(mm.id);
                          setEditCode(mm.code);
                          setEditDescription(mm.description || '');
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-900/30 rounded transition-all"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: mm.id })}
                        className="p-2 text-red-400 hover:bg-red-900/30 rounded transition-all"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
