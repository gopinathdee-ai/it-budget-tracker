import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useApi } from '../../hooks/useApi';
import { AVAILABLE_CURRENCIES } from '../../utils/currencyList';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

export default function ManageCurrency() {
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [newRate, setNewRate] = useState('');
  const [editingCode, setEditingCode] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { request, loading } = useApi();

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      setError(null);
      const response = await request('GET', '/api/config/currencies');
      setCurrencies(response.data || []);
    } catch (err) {
      setError('Failed to load currencies');
    }
  };

  const handleAddCurrency = async (e) => {
    e.preventDefault();
    if (!selectedCurrency || !newRate) {
      setError('Please select a currency and enter a conversion rate');
      return;
    }

    if (isNaN(parseFloat(newRate))) {
      setError('Please enter a valid conversion rate');
      return;
    }

    const selectedCurr = AVAILABLE_CURRENCIES.find(c => c.code === selectedCurrency);

    try {
      setError(null);
      await request('POST', '/api/config/currencies', {
        code: selectedCurrency,
        name: selectedCurr.name,
        conversionRate: parseFloat(newRate)
      });
      setSuccess('Currency added successfully!');
      setSelectedCurrency('');
      setNewRate('');
      fetchCurrencies();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message || 'Failed to add currency');
    }
  };

  const handleUpdateCurrency = async (code) => {
    if (!editValue || isNaN(parseFloat(editValue))) {
      setError('Please enter a valid conversion rate');
      return;
    }

    try {
      setError(null);
      await request('PUT', `/api/config/currencies/${code}`, {
        conversionRate: parseFloat(editValue)
      });
      setSuccess('Currency updated successfully!');
      setEditingCode(null);
      setEditValue('');
      fetchCurrencies();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to update currency');
    }
  };

  if (loading) return <LoadingSpinner message="Loading currencies..." />;

  return (
    <div className="space-y-6">
      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      <div className="bg-slate-800 rounded-lg p-8 shadow-md">
        <h2 className="text-xl font-semibold text-white mb-6">Manage Currency Conversions</h2>
        <p className="text-slate-400 mb-6">Add currencies and update conversion rates for multi-currency support (base: CAD)</p>

        {success && (
          <div className="p-4 bg-emerald-900/30 border border-emerald-600 rounded-lg mb-6 animate-pulse">
            <p className="text-emerald-400 text-sm font-medium">✓ {success}</p>
          </div>
        )}

        <div className="bg-slate-900/50 p-6 rounded-lg shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Currency</h3>
          <form onSubmit={handleAddCurrency} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Currency</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a currency...</option>
                  {AVAILABLE_CURRENCIES.map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Conversion Rate to CAD</label>
                <input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder="e.g., 1.37 for USD"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.0001"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium transition-all"
            >
              <FaPlus /> Add Currency
            </button>
          </form>
        </div>

        <h3 className="text-lg font-semibold text-white mb-4">Existing Currencies</h3>

        <div className="space-y-2">
          {currencies.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No currencies found</p>
          ) : (
            currencies.map(curr => (
              <div key={curr.code} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg shadow-sm hover:bg-slate-900 transition-all">
                {editingCode === curr.code ? (
                  <div className="flex gap-2 flex-1 items-center">
                    <span className="text-white font-bold w-16">{curr.code}</span>
                    <span className="text-slate-400 text-sm flex-1">{curr.name}</span>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Conversion rate"
                      className="w-32 px-3 py-1 bg-slate-800 border border-slate-700/40 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.0001"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateCurrency(curr.code)}
                      className="px-4 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCode(null)}
                      className="px-4 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-700 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold w-16">{curr.code}</span>
                        <span className="text-slate-400 text-sm">{curr.name}</span>
                        {curr.code === 'CAD' && (
                          <span className="px-2 py-1 bg-emerald-600/30 text-emerald-300 rounded text-xs font-medium border border-emerald-600/50">
                            Base
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400 font-mono text-sm">{parseFloat(curr.conversionRate).toFixed(4)}</span>
                      <button
                        onClick={() => {
                          setEditingCode(curr.code);
                          setEditValue(curr.conversionRate.toString());
                        }}
                        disabled={curr.code === 'CAD'}
                        className={`px-4 py-1 rounded text-sm transition-all ${
                          curr.code === 'CAD'
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
