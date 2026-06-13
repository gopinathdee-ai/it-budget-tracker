import { useState, useEffect } from 'react';
import { FaFont, FaTimes } from 'react-icons/fa';

const FONTS = [
  { name: 'Roboto', fontFamily: 'Roboto, sans-serif', value: 'roboto' },
  { name: 'Inter', fontFamily: 'Inter, sans-serif', value: 'inter' },
  { name: 'Lato', fontFamily: 'Lato, sans-serif', value: 'lato' },
  { name: 'Segoe UI', fontFamily: 'Segoe UI, sans-serif', value: 'segoe' },
  { name: 'JetBrains Mono', fontFamily: 'JetBrains Mono, monospace', value: 'jetbrains' },
  { name: 'Caveat (Handwriting)', fontFamily: 'Caveat, cursive', value: 'caveat' }
];

export default function FontSelector() {
  const [showModal, setShowModal] = useState(false);
  const [selectedFont, setSelectedFont] = useState('inter');

  useEffect(() => {
    const saved = localStorage.getItem('selectedFont') || 'inter';
    setSelectedFont(saved);
    applyFont(saved);
  }, []);

  const applyFont = (fontValue) => {
    const font = FONTS.find(f => f.value === fontValue);
    if (font) {
      document.documentElement.style.fontFamily = font.fontFamily;
      localStorage.setItem('selectedFont', fontValue);
      setSelectedFont(fontValue);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        title="Change Font"
        className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
      >
        <FaFont size={18} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Choose Font</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-2">
              {FONTS.map(font => (
                <button
                  key={font.value}
                  onClick={() => {
                    applyFont(font.value);
                    setShowModal(false);
                  }}
                  style={{ fontFamily: font.fontFamily }}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedFont === font.value
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  <span className="text-sm">Sample text with {font.name}</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center">Your choice will be saved</p>
          </div>
        </div>
      )}
    </>
  );
}
