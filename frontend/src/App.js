import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import GACosts from './pages/GACosts';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">IT Budget Tracker</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-4 py-2 rounded ${currentPage === 'dashboard' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('gacosts')}
              className={`px-4 py-2 rounded ${currentPage === 'gacosts' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              G&A Costs
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'gacosts' && <GACosts />}
      </main>
    </div>
  );
}

export default App;
