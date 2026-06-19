import { useState, useEffect, useContext, useCallback } from 'react';
import { FaCog } from 'react-icons/fa';
import { ThemeContext } from '../../contexts/ThemeContext.js';
import { useApi } from '../../hooks/useApi.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

export default function ManageGeneral() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { currentTheme } = useContext(ThemeContext);
  const { request } = useApi();
  const isLightTheme = currentTheme === 'light-clean';
  const textColor = isLightTheme ? 'text-slate-900' : 'text-white';
  const inputBg = isLightTheme ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700';
  const labelColor = isLightTheme ? 'text-slate-700' : 'text-slate-300';

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await request('GET', '/api/settings/general');
      setSettings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load general settings');
      setSettings({ showAdditionalCost: false, additionalCostFieldName: 'Additional Cost' });
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    setSaved(false);
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await request('PUT', '/api/settings/general', {
        showAdditionalCost: settings.showAdditionalCost,
        additionalCostFieldName: settings.additionalCostFieldName
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading general settings..." />;

  return (
    <div className="space-y-6">
      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      {saved && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm">
          ✓ Settings saved successfully
        </div>
      )}

      {/* Additional Cost Field Configuration */}
      <div className={`p-6 rounded-lg border ${isLightTheme ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/50 border-slate-700'}`}>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${textColor} mb-2 flex items-center gap-2`}>
              <FaCog className="text-blue-400" />
              Additional Cost Field
            </h3>
            <p className={`text-sm ${isLightTheme ? 'text-slate-600' : 'text-slate-400'} mb-4`}>
              Enable an optional additional cost column in the G&A Costs table. This can be used for supplementary costs that need to be tracked separately.
            </p>

            {/* Toggle */}
            <div className="mb-4">
              <label className={`block text-sm font-medium ${labelColor} mb-2`}>
                Show Additional Cost Field
              </label>
              <button
                onClick={() => handleToggle('showAdditionalCost')}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  settings?.showAdditionalCost ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings?.showAdditionalCost ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <p className={`text-xs ${isLightTheme ? 'text-slate-600' : 'text-slate-500'} mt-1`}>
                Status: <span className={settings?.showAdditionalCost ? 'text-emerald-500' : 'text-slate-400'}>
                  {settings?.showAdditionalCost ? 'Enabled' : 'Disabled'}
                </span>
              </p>
            </div>

            {/* Field Name Input */}
            {settings?.showAdditionalCost && (
              <div>
                <label className={`block text-sm font-medium ${labelColor} mb-2`}>
                  Field Name
                </label>
                <input
                  type="text"
                  value={settings?.additionalCostFieldName || ''}
                  onChange={(e) => handleInputChange('additionalCostFieldName', e.target.value)}
                  placeholder="e.g., Additional Cost, Contingency, Buffer"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${inputBg} ${textColor}`}
                />
                <p className={`text-xs ${isLightTheme ? 'text-slate-600' : 'text-slate-500'} mt-2`}>
                  This name will appear as the column header in the table. Default: "Additional Cost"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            saving
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          }`}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
