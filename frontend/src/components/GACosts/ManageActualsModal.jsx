import { useState, useEffect, useContext } from 'react';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaCalendarAlt, FaDollarSign, FaFileAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker.css';
import { ThemeContext } from '../../contexts/ThemeContext.js';
import { useApi } from '../../hooks/useApi.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import Number from '../common/Number.jsx';

export default function ManageActualsModal({ isOpen, gaCostId, serviceSoftware, currency, onClose, onActualsChange }) {
  const [details, setDetails] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ amount: '', entryDate: '', description: '', entryCurrency: '' });
  const [submitting, setSubmitting] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [page, setPage] = useState(1);
  const entriesPerPage = 3;
  const { currentTheme } = useContext(ThemeContext);
  const { request } = useApi();
  const isLightTheme = currentTheme === 'light-clean';

  useEffect(() => {
    if (isOpen && gaCostId) {
      fetchCurrencies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, gaCostId]);

  useEffect(() => {
    if (isOpen && gaCostId && currencies.length > 0) {
      fetchActuals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, gaCostId, currencies]);

  const fetchCurrencies = async () => {
    try {
      const response = await request('GET', '/api/config/currencies');
      setCurrencies(response.data || []);
    } catch (err) {
      console.error('Failed to load currencies');
    }
  };

  const fetchActuals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await request('GET', `/api/gacosts/${gaCostId}/actuals`);
      setDetails(response.data.details || []);

      // Calculate total in CAD, converting each entry based on its currency
      const details = response.data.details || [];
      const cadTotal = details.reduce((sum, item) => {
        const rate = item.currency === 'CAD' ? 1 : (currencies.find(c => c.code === item.currency)?.conversionRate || 1);
        return sum + (parseFloat(item.amount) || 0) * rate;
      }, 0);
      setTotal(cadTotal);
      resetForm();
    } catch (err) {
      setError('Failed to load actuals');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ amount: '', entryDate: new Date(), description: '', entryCurrency: currency || '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.entryDate) {
      setError('Amount and date are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        amount: formData.amount,
        entryDate: formData.entryDate instanceof Date
          ? formData.entryDate.toISOString().split('T')[0]
          : formData.entryDate,
        description: formData.description,
        currency: formData.entryCurrency || currency
      };

      if (editingId) {
        await request('PUT', `/api/gacosts/${gaCostId}/actuals/${editingId}`, payload);
      } else {
        await request('POST', `/api/gacosts/${gaCostId}/actuals`, payload);
      }
      await fetchActuals();
      onActualsChange?.();
    } catch (err) {
      setError(editingId ? 'Failed to update actual' : 'Failed to add actual');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (detail) => {
    const dateObj = detail.entryDate instanceof Date ? detail.entryDate : new Date(detail.entryDate);
    setFormData({
      amount: detail.amount.toString(),
      entryDate: dateObj,
      description: detail.description || '',
      entryCurrency: detail.currency || currency
    });
    setEditingId(detail.id);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSubmitting(true);
    try {
      await request('DELETE', `/api/gacosts/${gaCostId}/actuals/${deleteConfirm}`);
      setDeleteConfirm(null);
      await fetchActuals();
      onActualsChange?.();
    } catch (err) {
      setError('Failed to delete actual entry');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const bgOverlay = isLightTheme ? 'bg-black/40' : 'bg-black/60';
  const modalBg = isLightTheme ? 'bg-white' : 'bg-slate-900';
  const borderColor = isLightTheme ? 'border-slate-200' : 'border-slate-700/50';
  const textColor = isLightTheme ? 'text-slate-900' : 'text-white';
  const secondaryText = isLightTheme ? 'text-slate-600' : 'text-slate-400';
  const inputBg = isLightTheme ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700/40';
  const buttonBg = isLightTheme ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-800 hover:bg-slate-700';

  return (
    <>
      <div className={`fixed inset-0 ${bgOverlay} z-40`} onClick={onClose} />
      <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${modalBg} rounded-2xl shadow-2xl z-50 border ${borderColor}`}>
        {/* Header */}
        <div className={`sticky top-0 ${isLightTheme ? 'bg-slate-50' : 'bg-slate-800/80'} backdrop-blur-sm px-6 py-4 border-b ${borderColor} flex justify-between items-center`}>
          <div>
            <h2 className={`text-lg font-bold ${textColor}`}>Update Actuals</h2>
            <p className={`text-sm ${secondaryText}`}>{serviceSoftware}</p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${buttonBg} transition-colors`}
            title="Close"
          >
            <FaTimes size={18} className={textColor} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

          {loading ? (
            <LoadingSpinner message="Loading actuals..." />
          ) : (
            <>
              {/* Form */}
              <div className={`p-4 rounded-xl ${isLightTheme ? 'bg-slate-100/50 border border-slate-200' : 'bg-slate-800/30 border border-slate-700/40'}`}>
                <h3 className={`font-semibold ${textColor} mb-4`}>
                  {editingId ? 'Edit Entry' : 'Add New Entry'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium ${secondaryText} mb-1`}>Amount *</label>
                      <div className="relative">
                        <FaDollarSign className={`absolute left-3 top-3 ${secondaryText}`} />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          placeholder="0.00"
                          className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg} ${textColor}`}
                          disabled={submitting}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${secondaryText} mb-1`}>Date *</label>
                      <div className="relative">
                        <FaCalendarAlt className={`absolute left-3 top-3 pointer-events-none ${secondaryText}`} />
                        <DatePicker
                          selected={formData.entryDate}
                          onChange={(date) => setFormData({ ...formData, entryDate: date })}
                          dateFormat="MMM dd, yyyy"
                          className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${inputBg} ${textColor}`}
                          disabled={submitting}
                          minDate={new Date(2020, 0, 1)}
                          maxDate={new Date(2030, 11, 31)}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium ${secondaryText} mb-1`}>Currency *</label>
                    <select
                      value={formData.entryCurrency}
                      onChange={(e) => setFormData({ ...formData, entryCurrency: e.target.value })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg} ${textColor}`}
                      disabled={submitting}
                    >
                      <option value="">Select currency...</option>
                      {currencies.map(curr => (
                        <option key={curr.code} value={curr.code}>{curr.code} - {curr.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium ${secondaryText} mb-1`}>Description (Optional)</label>
                    <div className="relative">
                      <FaFileAlt className={`absolute left-3 top-3 ${secondaryText}`} />
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Add notes about this actual cost..."
                        rows="2"
                        className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${inputBg} ${textColor}`}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        disabled={submitting}
                        className={`px-4 py-2 text-sm rounded-lg font-medium ${buttonBg} transition-colors ${textColor}`}
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={submitting || !formData.amount || !formData.entryDate}
                      className="px-4 py-2 text-sm rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {submitting ? 'Saving...' : editingId ? 'Update' : 'Add'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Entries List */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className={`font-semibold ${textColor}`}>Entries</h3>
                  <div className={`text-sm font-bold ${textColor}`}>
                    Total: <span className="text-blue-500"><Number>{formatCurrency(total)}</Number></span>
                  </div>
                </div>

                {details.length === 0 ? (
                  <div className={`text-center py-8 rounded-lg ${isLightTheme ? 'bg-slate-100/50' : 'bg-slate-800/20'}`}>
                    <p className={secondaryText}>No actual entries yet. Add one above!</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {details.slice((page - 1) * entriesPerPage, page * entriesPerPage).map((detail) => (
                        <div
                          key={detail.id}
                          className={`p-3 rounded-lg border ${borderColor} ${isLightTheme ? 'bg-slate-50/50 hover:bg-slate-100/50' : 'bg-slate-800/30 hover:bg-slate-800/50'} transition-colors`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <span className={`text-sm font-bold text-blue-500`}>
                                  <Number>{formatCurrency(detail.amount)}</Number> <span className={`text-xs font-normal ${secondaryText}`}>{detail.currency}</span>
                                </span>
                                <span className={`text-xs ${secondaryText}`}>{formatDate(detail.entryDate)}</span>
                              </div>
                              {detail.description && (
                                <p className={`text-xs ${secondaryText} line-clamp-2`}>{detail.description}</p>
                              )}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleEdit(detail)}
                                disabled={submitting}
                                className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                                title="Edit"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(detail.id)}
                                disabled={submitting}
                                className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {details.length > entriesPerPage && (
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-700/40">
                        <div className={`text-xs font-medium ${secondaryText}`}>
                          Page {page} of {Math.ceil(details.length / entriesPerPage)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || submitting}
                            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${isLightTheme ? 'bg-slate-300 text-slate-800 hover:bg-slate-400 disabled:opacity-50' : 'bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-50'}`}
                          >
                            Prev
                          </button>
                          <button
                            onClick={() => setPage(p => Math.min(Math.ceil(details.length / entriesPerPage), p + 1))}
                            disabled={page === Math.ceil(details.length / entriesPerPage) || submitting}
                            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${isLightTheme ? 'bg-slate-300 text-slate-800 hover:bg-slate-400 disabled:opacity-50' : 'bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-50'}`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 border-t ${borderColor} px-6 py-4 ${isLightTheme ? 'bg-slate-50' : 'bg-slate-800/50'} backdrop-blur-sm flex justify-end`}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg font-medium bg-slate-600 text-white hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Entry"
        message="This action cannot be undone. Delete this actual entry?"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
