import { useState } from 'react';
import { FaChartLine, FaDollarSign, FaCog, FaFolder } from 'react-icons/fa';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, page: 'dashboard' },
  { id: 'gacosts', label: 'G&A Costs', icon: FaDollarSign, page: 'gacosts' },
  { id: 'projects', label: 'Projects', icon: FaFolder, page: 'projects', disabled: true },
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
];

export default function Sidebar({ currentPage, onNavigate, currentTheme }) {
  const [expandedMenu, setExpandedMenu] = useState(null);
  const isAdminActive = currentPage?.startsWith('admin');

  const getSidebarClasses = () => {
    switch (currentTheme) {
      case 'dark-blue':
        return 'bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700';
      case 'dark-indigo':
        return 'bg-gradient-to-b from-indigo-900 to-indigo-800 border-r border-indigo-700';
      case 'dark-cyan':
        return 'bg-gradient-to-b from-slate-900 to-slate-800 border-r border-cyan-700';
      case 'dark-emerald':
        return 'bg-gradient-to-b from-slate-900 to-slate-800 border-r border-emerald-700';
      case 'light-clean':
        return 'bg-gradient-to-b from-slate-50 to-white border-r border-slate-200';
      case 'dark-amber':
        return 'bg-gradient-to-b from-slate-900 to-slate-800 border-r border-orange-700';
      default:
        return 'bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700';
    }
  };

  const getAccentClasses = () => {
    switch (currentTheme) {
      case 'dark-blue':
        return 'from-blue-600 to-blue-700';
      case 'dark-indigo':
        return 'from-indigo-600 to-indigo-700';
      case 'dark-cyan':
        return 'from-cyan-500 to-cyan-600';
      case 'dark-emerald':
        return 'from-emerald-600 to-emerald-700';
      case 'light-clean':
        return 'from-blue-600 to-blue-700';
      case 'dark-amber':
        return 'from-orange-500 to-amber-600';
      default:
        return 'from-blue-600 to-blue-700';
    }
  };

  const getHoverClasses = () => {
    switch (currentTheme) {
      case 'dark-blue':
        return 'hover:bg-slate-700/50';
      case 'dark-indigo':
        return 'hover:bg-indigo-700/50';
      case 'dark-cyan':
        return 'hover:bg-cyan-700/50';
      case 'dark-emerald':
        return 'hover:bg-emerald-700/50';
      case 'light-clean':
        return 'hover:bg-slate-100/50';
      case 'dark-amber':
        return 'hover:bg-orange-700/50';
      default:
        return 'hover:bg-slate-700/50';
    }
  };

  const getTextClasses = () => {
    return currentTheme === 'light-clean' ? 'text-slate-900 hover:text-slate-700' : 'text-slate-300 hover:text-white';
  };

  const getSubaccent = () => {
    switch (currentTheme) {
      case 'dark-blue':
        return 'bg-blue-600/40';
      case 'dark-indigo':
        return 'bg-indigo-600/40';
      case 'dark-cyan':
        return 'bg-cyan-600/40';
      case 'dark-emerald':
        return 'bg-emerald-600/40';
      case 'light-clean':
        return 'bg-blue-600/10';
      case 'dark-amber':
        return 'bg-orange-600/40';
      default:
        return 'bg-blue-600/40';
    }
  };

  return (
    <aside className={`w-64 h-screen overflow-y-auto sticky top-0 ${getSidebarClasses()}`}>
      {/* Menu Items */}
      <nav className="p-4 space-y-1">
        {MENU_ITEMS.map(item => {
          const Icon = item.icon;
          const isExpanded = expandedMenu === item.id || isAdminActive;
          const isActive = item.submenu ? isAdminActive : currentPage === item.page;

          const handleClick = () => {
            if (item.disabled) return;
            if (item.submenu) {
              setExpandedMenu(isExpanded ? null : item.id);
            } else {
              onNavigate(item.page);
            }
          };

          return (
            <div key={item.id}>
              {/* Main Menu Item */}
              <button
                onClick={handleClick}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${getAccentClasses()} text-white shadow-md`
                    : `${getTextClasses()} ${getHoverClasses()}`
                } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className="text-lg flex-shrink-0" />
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                {item.submenu && (
                  <span className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                )}
              </button>

              {/* Submenu Items */}
              {item.submenu && isExpanded && (
                <div className={`ml-4 mt-1 space-y-1 border-l pl-3 ${
                  currentTheme === 'light-clean' ? 'border-slate-300' :
                  currentTheme === 'dark-indigo' ? 'border-indigo-700' :
                  currentTheme === 'dark-cyan' ? 'border-cyan-700' :
                  currentTheme === 'dark-emerald' ? 'border-emerald-700' :
                  currentTheme === 'dark-amber' ? 'border-orange-700' : 'border-slate-700'
                }`}>
                  {item.submenu.map(subitem => (
                    <button
                      key={subitem.id}
                      onClick={() => onNavigate(subitem.page)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                        currentPage === subitem.page
                          ? `${getSubaccent()} text-white font-medium`
                          : currentTheme === 'light-clean' ? 'text-slate-600 hover:text-slate-700 hover:bg-slate-100/30' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
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
