import { FaChartLine, FaDollarSign, FaCog, FaUsers, FaFileAlt, FaFolder } from 'react-icons/fa';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, page: 'dashboard' },
  { id: 'gacosts', label: 'G&A Costs', icon: FaDollarSign, page: 'gacosts' },
  {
    id: 'admin',
    label: 'Admin',
    icon: FaCog,
    submenu: [
      { id: 'admin-users', label: 'Users', page: 'admin-users' },
      { id: 'admin-settings', label: 'Settings', page: 'admin-settings' },
      { id: 'admin-audit', label: 'Audit Logs', page: 'admin-audit' },
    ],
  },
  { id: 'projects', label: 'Projects', icon: FaFolder, page: 'projects', disabled: true },
];

export default function Sidebar({ currentPage, onNavigate }) {
  const isAdminActive = currentPage?.startsWith('admin');

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-screen overflow-y-auto sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Navigation</h2>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-1">
        {MENU_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = item.submenu ? isAdminActive : currentPage === item.page;

          return (
            <div key={item.id}>
              {/* Main Menu Item */}
              <button
                onClick={() => !item.disabled && item.page && onNavigate(item.page)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className="text-lg flex-shrink-0" />
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                {item.submenu && (
                  <span className={`text-xs transition-transform ${isAdminActive ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                )}
              </button>

              {/* Submenu Items */}
              {item.submenu && isAdminActive && (
                <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3">
                  {item.submenu.map(subitem => (
                    <button
                      key={subitem.id}
                      onClick={() => onNavigate(subitem.page)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                        currentPage === subitem.page
                          ? 'bg-blue-600/40 text-white font-medium'
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                      }`}
                    >
                      {subitem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
