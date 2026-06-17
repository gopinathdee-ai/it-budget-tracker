import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { THEMES } from '../../utils/themes';
import ManageGeneral from '../../components/Settings/ManageGeneral';
import ManageTheme from '../../components/Settings/ManageTheme';
import ManageCategory from '../../components/Settings/ManageCategory';
import ManageSubCategory from '../../components/Settings/ManageSubCategory';
import ManageCurrency from '../../components/Settings/ManageCurrency';
import ManageMajorMinor from '../../components/Settings/ManageMajorMinor';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'theme', label: 'Manage Theme' },
    { id: 'category', label: 'Manage Category' },
    { id: 'subcategory', label: 'Manage Sub Category' },
    { id: 'currency', label: 'Manage Currency' },
    { id: 'majorminor', label: 'Manage Major.Minor' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Configure application settings and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium transition-all border-b-2 ${
              activeTab === tab.id
                ? 'text-blue-400 border-blue-500'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'general' && <ManageGeneral />}
        {activeTab === 'theme' && <ManageTheme />}
        {activeTab === 'category' && <ManageCategory />}
        {activeTab === 'subcategory' && <ManageSubCategory />}
        {activeTab === 'currency' && <ManageCurrency />}
        {activeTab === 'majorminor' && <ManageMajorMinor />}
      </div>
    </div>
  );
}
