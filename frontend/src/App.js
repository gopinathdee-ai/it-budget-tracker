import { useState } from 'react';
import { FaChartLine, FaDollarSign } from 'react-icons/fa';
import Dashboard from './pages/Dashboard';
import GACosts from './pages/GACosts';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">₿</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              IT Budget Tracker
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                currentPage === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FaChartLine /> Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('gacosts')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                currentPage === 'gacosts'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FaDollarSign /> G&A Costs
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'gacosts' && <GACosts />}
      </main>
    </div>
  );
}

export default App;
