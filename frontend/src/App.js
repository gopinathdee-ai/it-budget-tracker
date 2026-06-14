import { useState, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import GACosts from './pages/GACosts';
import AdminUsers from './pages/Admin/Users';
import AdminSettings from './pages/Admin/Settings';
import AdminAudit from './pages/Admin/Audit';
import Projects from './pages/Projects';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { currentTheme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

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

  const getContainerClasses = () => {
    switch (currentTheme) {
      case 'dark-blue':
        return 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800';
      case 'dark-indigo':
        return 'bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900';
      case 'dark-cyan':
        return 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800';
      case 'dark-emerald':
        return 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800';
      case 'light-clean':
        return 'bg-gradient-to-br from-slate-50 via-white to-slate-100';
      case 'dark-amber':
        return 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800';
      default:
        return 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800';
    }
  };

  const getNavbarClasses = () => {
    switch (currentTheme) {
      case 'dark-blue':
        return 'bg-gradient-to-r from-slate-900 to-slate-800';
      case 'dark-indigo':
        return 'bg-gradient-to-r from-indigo-900 to-indigo-800';
      case 'dark-cyan':
        return 'bg-gradient-to-r from-slate-900 to-slate-800';
      case 'dark-emerald':
        return 'bg-gradient-to-r from-slate-900 to-slate-800';
      case 'light-clean':
        return 'bg-gradient-to-r from-white to-slate-50';
      case 'dark-amber':
        return 'bg-gradient-to-r from-slate-900 to-slate-800';
      default:
        return 'bg-gradient-to-r from-slate-900 to-slate-800';
    }
  };

  const getAccentClasses = () => {
    switch (currentTheme) {
      case 'dark-blue':
        return 'from-blue-600 to-blue-800';
      case 'dark-indigo':
        return 'from-indigo-600 to-indigo-800';
      case 'dark-cyan':
        return 'from-cyan-500 to-cyan-600';
      case 'dark-emerald':
        return 'from-emerald-600 to-emerald-800';
      case 'light-clean':
        return 'from-blue-600 to-blue-800';
      case 'dark-amber':
        return 'from-orange-500 to-amber-600';
      default:
        return 'from-blue-600 to-blue-800';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${getContainerClasses()}`}>
      {/* Top Navbar */}
      <nav className={`${getNavbarClasses()} shadow-xl sticky top-0 z-40 h-16 flex items-center`}>
        <div className="px-6 flex items-center gap-3 h-full">
          <img src="/logo.png" alt="IT Budget Tracker" className="w-8 h-8" />
          <h1 className={`text-2xl font-bold bg-gradient-to-r ${getAccentClasses()} bg-clip-text text-transparent`}>
            IT Budget Tracker
          </h1>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} currentTheme={currentTheme} />

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto px-8 py-8 ${currentTheme === 'light-clean' ? 'text-slate-900' : 'text-white'}`}>
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
