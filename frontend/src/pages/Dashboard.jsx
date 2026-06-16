import { useState, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext.js';
import GACostsDashboardSection from '../components/Dashboard/GACostsDashboardSection.jsx';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { currentTheme } = useContext(ThemeContext);
  const isLightTheme = currentTheme === 'light-clean';
  const textColor = isLightTheme ? 'text-slate-900' : 'text-white';
  const textMuted = isLightTheme ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${textColor} mb-1`}>Dashboard</h1>
          <p className={`text-xs ${textMuted}`}>Budget overview and spending analysis</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium ${isLightTheme ? 'border-slate-400 bg-white text-slate-900' : 'border-slate-600 bg-slate-900 text-white'}`}
        >
          {[2024, 2025, 2026, 2027].map(year => <option key={year} value={year}>{year}</option>)}
        </select>
      </div>

      {/* G&A Section */}
      <div>
        <h2 className={`text-xl font-bold ${textColor} mb-4`}>G&A Costs</h2>
        <GACostsDashboardSection selectedYear={selectedYear} />
      </div>

      {/* Projects Section */}
      <div>
        <h2 className={`text-xl font-bold ${textColor} mb-4`}>Projects</h2>
        <div className={`p-12 text-center rounded-2xl border-2 border-dashed ${isLightTheme ? 'border-slate-300 bg-slate-100/30 text-slate-600' : 'border-slate-700 bg-slate-800/30 text-slate-400'}`}>
          <p className="text-lg font-semibold">Coming Soon</p>
          <p className={`text-sm ${isLightTheme ? 'text-slate-500' : 'text-slate-500'}`}>Projects dashboard will be available soon</p>
        </div>
      </div>
    </div>
  );
}
