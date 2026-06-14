import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { THEMES } from '../../utils/themes';

export default function ManageTheme() {
  const { currentTheme, applyTheme } = useTheme();
  const [savedTheme, setSavedTheme] = useState(null);

  const handleThemeChange = (themeKey) => {
    applyTheme(themeKey);
    setSavedTheme(themeKey);
    setTimeout(() => setSavedTheme(null), 2000);
  };

  const themeList = Object.entries(THEMES).map(([key, value]) => ({
    key,
    ...value,
  }));

  const getThemePreviewClass = (themeKey) => {
    switch (themeKey) {
      case 'dark-blue':
        return 'from-slate-900 to-slate-800 border-2 border-blue-500';
      case 'dark-indigo':
        return 'from-indigo-900 to-indigo-800 border-2 border-indigo-500';
      case 'dark-cyan':
        return 'from-slate-900 to-slate-800 border-2 border-cyan-500';
      case 'dark-emerald':
        return 'from-slate-900 to-slate-800 border-2 border-emerald-500';
      case 'light-clean':
        return 'from-white to-slate-100 border-2 border-blue-400';
      case 'dark-amber':
        return 'from-slate-900 to-slate-800 border-2 border-orange-500';
      default:
        return 'from-slate-900 to-slate-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-white mb-6">Color Scheme</h2>
        <p className="text-slate-400 mb-6">Choose your preferred color theme for the application</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {themeList.map((theme) => (
            <button
              key={theme.key}
              onClick={() => handleThemeChange(theme.key)}
              className={`relative group p-4 rounded-lg transition-all cursor-pointer ${
                currentTheme === theme.key ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-blue-500' : ''
              }`}
            >
              <div className={`bg-gradient-to-br ${getThemePreviewClass(theme.key)} rounded-lg h-24 mb-3 flex items-center justify-center transition-transform ${
                savedTheme === theme.key ? 'scale-95' : 'scale-100'
              }`}>
                <div className="text-center">
                  <div className={`text-sm font-semibold ${theme.key === 'light-clean' ? 'text-slate-900' : 'text-white'}`}>
                    {theme.name}
                  </div>
                </div>
              </div>

              {currentTheme === theme.key && (
                <div className={`absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-300 ${
                  savedTheme === theme.key ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}>
                  <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    ✓ Saved
                  </div>
                </div>
              )}

              {!savedTheme && currentTheme === theme.key && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Active
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Toast Notification */}
        {savedTheme && (
          <div className="mt-6 p-4 bg-emerald-900/30 border border-emerald-600 rounded-lg animate-pulse">
            <p className="text-emerald-400 text-sm font-medium">
              ✓ Theme saved successfully!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
