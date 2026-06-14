import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import GACosts from './pages/GACosts';
import AdminUsers from './pages/Admin/Users';
import AdminSettings from './pages/Admin/Settings';
import AdminAudit from './pages/Admin/Audit';
import Projects from './pages/Projects';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'gacosts':
        return <GACosts />;
      case 'admin-users':
        return <AdminUsers />;
      case 'admin-settings':
        return <AdminSettings />;
      case 'admin-audit':
        return <AdminAudit />;
      case 'projects':
        return <Projects />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 shadow-lg sticky top-0 z-40 h-16 flex items-center">
        <div className="px-6 flex items-center gap-3 h-full">
          <img src="/logo.png" alt="IT Budget Tracker" className="w-8 h-8" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            IT Budget Tracker
          </h1>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
